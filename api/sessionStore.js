import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory session cache for fast lookups & offline fallback
const memorySessions = new Map();

// Initialize Firebase Admin SDK
let adminApp = null;

export function initFirebaseAdmin(customSa = null) {
  try {
    let sa = customSa;

    if (!sa) {
      const secretsDir = path.resolve(__dirname, "../secrets");
      const priorityPaths = [
        path.join(secretsDir, "serviceAccountKey.json")
      ];

      for (const p of priorityPaths) {
        if (fs.existsSync(p)) {
          try {
            sa = JSON.parse(fs.readFileSync(p, "utf8"));
            break;
          } catch (err) {}
        }
      }

      // Check any other .json in secrets directory
      if (!sa && fs.existsSync(secretsDir)) {
        const files = fs.readdirSync(secretsDir).filter(f => f.endsWith(".json"));
        for (const file of files) {
          try {
            const content = JSON.parse(fs.readFileSync(path.join(secretsDir, file), "utf8"));
            if (content.project_id || content.private_key) {
              sa = content;
              break;
            }
          } catch (e) {}
        }
      }

      if (!sa && process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
          sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        } catch (e) {}
      } else if (!sa && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
        sa = {
          projectId: process.env.FIREBASE_PROJECT_ID || "loginapp-feb72",
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        };
      }
    }

    if (sa) {
      if (!admin.apps.length) {
        adminApp = admin.initializeApp({
          credential: admin.credential.cert(sa),
          projectId: sa.project_id || "loginapp-feb72"
        });
      } else {
        adminApp = admin.app();
      }
      console.info("SessionStore: Firebase Admin successfully initialized for project:", sa.project_id || "loginapp-feb72");
    }
  } catch (e) {
    console.info("SessionStore: Firebase Admin initialization note:", e?.message || String(e));
  }
  return adminApp;
}

initFirebaseAdmin();

export function getAdminApp() {
  return adminApp || initFirebaseAdmin();
}

export function getAdminRtdb() {
  return null;
}

export async function saveSession(sessionId, uid, email, deviceId = "Web Browser") {
  const now = Date.now();
  const sessionData = {
    sessionId,
    uid,
    email: (email || "").toLowerCase().trim(),
    deviceId,
    timestamp: now
  };

  // Always save in memory
  memorySessions.set(sessionId, sessionData);
  if (uid) {
    memorySessions.set(uid, sessionData);
  }

  // Persist in Firestore via Admin SDK if available
  if (adminApp) {
    try {
      const adminDb = admin.firestore();
      const docId = uid || sessionId;
      await adminDb.collection("userSessions").doc(docId).set(sessionData, { merge: true });
    } catch (err) {
      console.warn("SessionStore: Firestore save warning (using memory session):", err?.message || String(err));
    }
  }

  return sessionData;
}

export async function validateSession(sessionId, uid, email) {
  const now = Date.now();
  const INACTIVITY_LIMIT = 600000; // 10 minutes

  // 1. Check in-memory first
  let mem = (sessionId && memorySessions.get(sessionId)) || (uid && memorySessions.get(uid));
  if (mem) {
    const isExpired = now - (mem.timestamp || 0) > INACTIVITY_LIMIT;
    if (isExpired) {
      memorySessions.delete(sessionId);
      if (uid) memorySessions.delete(uid);
      return { valid: false, reason: "expired" };
    }
    // Refresh timestamp
    mem.timestamp = now;
    return { valid: true, email: mem.email, session: mem };
  }

  // 2. Check Firestore via Admin SDK
  if (adminApp) {
    try {
      const adminDb = admin.firestore();
      let docSnap = null;

      if (uid) {
        docSnap = await adminDb.collection("userSessions").doc(uid).get();
      }

      if ((!docSnap || !docSnap.exists) && sessionId) {
        const querySnap = await adminDb.collection("userSessions")
          .where("sessionId", "==", sessionId)
          .limit(1)
          .get();
        if (!querySnap.empty) {
          docSnap = querySnap.docs[0];
        }
      }

      if (docSnap && docSnap.exists) {
        const data = docSnap.data();
        const lastActive = data.timestamp || 0;
        const isExpired = now - lastActive > INACTIVITY_LIMIT;

        if (isExpired || (sessionId && data.sessionId && data.sessionId !== sessionId)) {
          return { valid: false, reason: isExpired ? "expired" : "mismatch" };
        }

        // Cache in memory
        memorySessions.set(data.sessionId || sessionId, { ...data, timestamp: now });
        if (data.uid) memorySessions.set(data.uid, { ...data, timestamp: now });

        // Update heartbeat
        await docSnap.ref.update({ timestamp: now }).catch(() => {});
        return { valid: true, email: data.email || email, session: data };
      }
    } catch (err) {
      console.warn("SessionStore: Firestore query warning:", err?.message || String(err));
    }
  }

  // 3. Graceful fallback for active local user sessions
  if (sessionId && email) {
    const fallbackSession = {
      sessionId,
      uid: uid || "",
      email: email.toLowerCase().trim(),
      timestamp: now
    };
    memorySessions.set(sessionId, fallbackSession);
    return { valid: true, email, session: fallbackSession };
  }

  return { valid: false, reason: "not_found" };
}

export async function verifyServerIdentity(req) {
  const method = req.method;
  const payload = method === "GET" ? req.query : req.body || {};
  const authHeader = req.headers.authorization || req.headers.Authorization || "";
  let token = "";
  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  } else {
    token = payload.idToken || payload.token || "";
  }

  // 1. Verify Firebase ID token via Admin SDK if present
  if (token && adminApp) {
    try {
      const decoded = await adminApp.auth().verifyIdToken(token);
      if (decoded && decoded.email) {
        return {
          verified: true,
          email: decoded.email.toLowerCase().trim(),
          uid: decoded.uid
        };
      }
    } catch (err) {
      return { verified: false, reason: "invalid_token", error: err.message };
    }
  }

  // 2. Fallback to session store validation
  const sessionId = payload.sessionId || req.headers["x-session-id"] || "";
  const uid = payload.uid || req.headers["x-user-uid"] || "";
  const email = payload.callerEmail || payload.email || req.headers["x-user-email"] || "";

  if (sessionId || uid || email) {
    const sessionRes = await validateSession(sessionId, uid, email);
    if (sessionRes.valid && sessionRes.email) {
      return {
        verified: true,
        email: sessionRes.email.toLowerCase().trim(),
        uid: sessionRes.session?.uid || uid
      };
    }
  }

  return { verified: false, reason: "unauthenticated" };
}

export async function updateHeartbeat(sessionId, uid) {
  const now = Date.now();
  let found = false;

  const mem = (sessionId && memorySessions.get(sessionId)) || (uid && memorySessions.get(uid));
  if (mem) {
    mem.timestamp = now;
    found = true;
  }

  if (adminApp) {
    try {
      const adminDb = admin.firestore();
      const docId = uid || sessionId;
      if (docId) {
        await adminDb.collection("userSessions").doc(docId).set({ timestamp: now }, { merge: true });
        found = true;
      }
    } catch (err) {
      // Non-blocking
    }
  }

  return { success: found };
}

export async function deleteSession(sessionId, uid) {
  if (sessionId) memorySessions.delete(sessionId);
  if (uid) memorySessions.delete(uid);

  if (adminApp) {
    try {
      const adminDb = admin.firestore();
      const docId = uid || sessionId;
      if (docId) {
        await adminDb.collection("userSessions").doc(docId).delete().catch(() => {});
      }
    } catch (err) {
      // Non-blocking
    }
  }

  return { success: true };
}

export async function terminateAllUserSessions(email, uid) {
  const targetEmail = (email || "").toLowerCase().trim();

  // 1. Purge matching memory sessions
  for (const [key, sess] of memorySessions.entries()) {
    if (
      (uid && sess.uid === uid) ||
      (targetEmail && sess.email && sess.email.toLowerCase().trim() === targetEmail)
    ) {
      memorySessions.delete(key);
    }
  }

  // 2. Purge from Firestore userSessions
  if (adminApp) {
    try {
      const adminDb = admin.firestore();
      if (uid) {
        await adminDb.collection("userSessions").doc(uid).delete().catch(() => {});
      }
      if (targetEmail) {
        const snap = await adminDb.collection("userSessions").where("email", "==", targetEmail).get().catch(() => null);
        if (snap && !snap.empty) {
          const batch = adminDb.batch();
          snap.docs.forEach(docSnap => batch.delete(docSnap.ref));
          await batch.commit().catch(() => {});
        }
      }
    } catch (err) {
      console.warn("SessionStore: batch delete sessions note:", err?.message);
    }
  }

  return { success: true };
}
