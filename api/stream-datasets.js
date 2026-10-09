import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getFirestoreDb, getActiveProjectConfig } from "./firestoreClient.js";
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKUP_FILE = path.resolve(__dirname, "../data/secure/stream_datasets.json");

function ensureBackupDir() {
  const dir = path.dirname(BACKUP_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readLocalBackup() {
  try {
    ensureBackupDir();
    if (fs.existsSync(BACKUP_FILE)) {
      const raw = fs.readFileSync(BACKUP_FILE, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn("[StreamDatasets] Local backup read error:", err.message);
  }
  return [];
}

function writeLocalBackup(datasets) {
  try {
    ensureBackupDir();
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(datasets, null, 2), "utf8");
  } catch (err) {
    console.warn("[StreamDatasets] Local backup write error:", err.message);
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const method = req.method;
  const db = getFirestoreDb();

  try {
    const activeProj = getActiveProjectConfig();

    // -------------------------------------------------------------
    // GET: List all datasets or fetch single by ID
    // -------------------------------------------------------------
    if (method === "GET") {
      const { id } = req.query || {};

      if (id) {
        // Fetch single dataset
        let dataset = null;

        if (db) {
          try {
            const snap = await getDoc(doc(db, "streamDatasets", String(id)));
            if (snap.exists()) {
              dataset = snap.data();
            }
          } catch (dbErr) {
            console.info("[StreamDatasets] Note on single get:", dbErr.message);
          }
        }

        if (!dataset) {
          const localList = readLocalBackup();
          dataset = localList.find((d) => d.id === id) || null;
        }

        if (!dataset) {
          return res.status(404).json({ success: false, activeProject: activeProj.projectId, error: "Dataset not found" });
        }

        return res.status(200).json({ success: true, activeProject: activeProj.projectId, dataset });
      }

      // Fetch list of all datasets (summary view) strictly from active Firestore database
      let datasetsMap = new Map();
      let firestoreQuerySucceeded = false;

      // 1. Load live Firestore datasets from active project
      if (db) {
        try {
          const snap = await Promise.race([
            getDocs(collection(db, "streamDatasets")),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3500))
          ]);
          firestoreQuerySucceeded = true;
          snap.forEach((docSnap) => {
            const d = docSnap.data();
            const dId = d.id || docSnap.id;
            if (dId) {
              datasetsMap.set(dId, {
                id: dId,
                title: d.title || "Untitled Dataset",
                streamCount: d.streamCount || (d.streams ? d.streams.length : 0),
                propertiesCount: d.propertiesList ? d.propertiesList.length : 0,
                componentsCount: d.componentsList ? d.componentsList.length : 0,
                savedBy: d.savedBy || d.uploadedBy || "Engineer",
                createdAt: d.createdAt || d.updatedAt || Date.now(),
                updatedAt: d.updatedAt || d.createdAt || Date.now()
              });
            }
          });
        } catch (dbErr) {
          console.warn(`[StreamDatasets] Firestore query note for project ${activeProj.projectId}:`, dbErr.message);
        }
      }

      // 2. ONLY if Firestore query was NOT successful (offline/network failure), fall back to local backup
      if (!firestoreQuerySucceeded) {
        const localList = readLocalBackup();
        localList.forEach((d) => {
          if (d && d.id) {
            datasetsMap.set(d.id, {
              id: d.id,
              title: d.title || "Untitled Dataset",
              streamCount: d.streamCount || (d.streams ? d.streams.length : 0),
              propertiesCount: d.propertiesList ? d.propertiesList.length : 0,
              componentsCount: d.componentsList ? d.componentsList.length : 0,
              savedBy: d.savedBy || d.uploadedBy || "Engineer",
              createdAt: d.createdAt || Date.now(),
              updatedAt: d.updatedAt || d.createdAt || Date.now()
            });
          }
        });
      }

      let datasets = Array.from(datasetsMap.values());
      datasets.sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));

      return res.status(200).json({ success: true, activeProject: activeProj.projectId, datasets });
    }

    // -------------------------------------------------------------
    // POST: Save or Update a dataset
    // -------------------------------------------------------------
    if (method === "POST") {
      const { dataset, userEmail } = req.body || {};
      if (!dataset || !dataset.streams || !Array.isArray(dataset.streams) || dataset.streams.length === 0) {
        return res.status(400).json({ success: false, error: "Invalid dataset. At least 1 process stream is required." });
      }

      const id = dataset.id || `ds_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const now = Date.now();
      const record = {
        id,
        title: (dataset.title || "Refinery HMB Dataset").trim(),
        streamCount: dataset.streams.length,
        streams: dataset.streams,
        propertiesList: dataset.propertiesList || [],
        componentsList: dataset.componentsList || [],
        metadata: dataset.metadata || {},
        savedBy: (userEmail || "Engineer").trim(),
        createdAt: dataset.createdAt || now,
        updatedAt: now
      };

      // 1. Save in Firestore
      if (db) {
        try {
          await setDoc(doc(db, "streamDatasets", id), record);
          console.log(`[StreamDatasets] Successfully saved to Firestore document: /streamDatasets/${id}`);
        } catch (dbErr) {
          console.warn("[StreamDatasets] Firestore save warning:", dbErr.message);
        }
      }

      // 2. Always persist to secure local backup
      const localList = readLocalBackup();
      const existingIdx = localList.findIndex((d) => d.id === id);
      if (existingIdx >= 0) {
        localList[existingIdx] = record;
      } else {
        localList.unshift(record);
      }
      writeLocalBackup(localList);

      return res.status(200).json({
        success: true,
        id,
        title: record.title,
        message: "Dataset successfully saved in Firestore database!"
      });
    }

    // -------------------------------------------------------------
    // DELETE: Remove a saved dataset (Admin only)
    // -------------------------------------------------------------
    if (method === "DELETE") {
      const id = (req.query && req.query.id) || (req.body && req.body.id);
      if (!id) {
        return res.status(400).json({ success: false, error: "Missing dataset ID to delete" });
      }

      // Check caller admin authorization
      const callerEmail = (
        req.headers["x-user-email"] ||
        (req.query && req.query.callerEmail) ||
        (req.body && req.body.callerEmail) ||
        ""
      ).toLowerCase().trim();

      let isCallerAdmin = callerEmail === "avijitkayet97@gmail.com";

      if (!isCallerAdmin && callerEmail && db) {
        try {
          const docSnap = await getDoc(doc(db, "userRoles", callerEmail));
          if (docSnap.exists()) {
            const roleData = docSnap.data();
            if (roleData.role === "admin" || roleData.isSuperAdmin) {
              isCallerAdmin = true;
            }
          }
        } catch (e) {
          console.warn("[StreamDatasets] Role check warning:", e.message);
        }
      }

      if (!isCallerAdmin) {
        return res.status(403).json({
          success: false,
          error: "Permission Denied: Only administrators can delete saved datasets from Firestore."
        });
      }

      if (db) {
        try {
          await deleteDoc(doc(db, "streamDatasets", String(id)));
          console.log(`[StreamDatasets] Deleted from Firestore: /streamDatasets/${id}`);
        } catch (dbErr) {
          console.warn("[StreamDatasets] Firestore delete warning:", dbErr.message);
        }
      }

      // Delete from local backup
      const localList = readLocalBackup();
      const updated = localList.filter((d) => d.id !== id);
      writeLocalBackup(updated);

      return res.status(200).json({ success: true, message: "Dataset deleted successfully" });
    }

    return res.status(405).json({ success: false, error: "Method not allowed" });
  } catch (error) {
    console.error("[StreamDatasets API Error]:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      details: error.message
    });
  }
}
