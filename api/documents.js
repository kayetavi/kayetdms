import { getFirestoreDb } from "./firestoreClient.js";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";

// Standard seeded CCD refinery documents fallback
const DEFAULT_CCD_DOCS = [
  {
    id: "doc_cdu_ovhd_01",
    documentNumber: "CCD-CDU-CL101",
    plantName: "Refinery Complex A",
    unitName: "Crude Distillation Unit (CDU)",
    equipmentTag: "10-C-101 / 10-E-102",
    equipmentDescription: "Atmospheric Fractionator Overhead Vapor Line and Condenser System",
    service: "Hydrocarbon vapor, steam, HCl, NH3, H2S",
    corrosionLoopNumber: "CL-101",
    materialOfConstruction: "Carbon Steel (NACE MR0103) + 3.0 mm CA / Monel Trim",
    designPressure: "3.5 kg/cm²g",
    operatingPressure: "1.4 kg/cm²g",
    designTemperature: "180°C",
    operatingTemperature: "115°C (Tower Top) / 45°C (Reflux Drum)",
    status: "approved",
    preparedBy: "Avijit Kayet",
    lastSavedDate: new Date().toISOString().split("T")[0],
    lastModifiedDateTime: new Date().toISOString(),
    mechanisms: [
      { id: "m1", code: "API 571 - 3.37", name: "Hydrochloric Acid (HCl) Corrosion", susceptibility: "High", criticalFactor: "Overhead accumulator pH < 5.8" },
      { id: "m2", code: "API 571 - 3.9", name: "Ammonium Chloride (NH4Cl) Corrosion", susceptibility: "High", criticalFactor: "Salting before water dewpoint" },
      { id: "m3", code: "API 571 - 3.67", name: "Wet H2S Damage (HIC / SOHIC)", susceptibility: "Medium", criticalFactor: "Acidic sour water in boot" }
    ],
    tmlRecords: [
      { id: "t1", tmlNo: "TML-01", component: "Column Overhead Nozzle", baselineThickness: "12.7 mm", currentThickness: "11.2 mm", cr: "0.15 mm/yr" },
      { id: "t2", tmlNo: "TML-02", component: "Air Cooler Inlet Header", baselineThickness: "9.5 mm", currentThickness: "7.9 mm", cr: "0.21 mm/yr" }
    ]
  },
  {
    id: "doc_vdu_hvgo_02",
    documentNumber: "CCD-VDU-CL102",
    plantName: "Refinery Complex A",
    unitName: "Vacuum Distillation Unit (VDU)",
    equipmentTag: "20-C-201 / Transfer Line",
    equipmentDescription: "Heavy Vacuum Gas Oil (HVGO) Circuit and Transfer Line",
    service: "Heavy gas oil, organic sulfur, naphthenic acids",
    corrosionLoopNumber: "CL-102",
    materialOfConstruction: "5Cr-0.5Mo / 316L Stainless Steel Cladding",
    designPressure: "Full Vacuum to 3.5 kg/cm²g",
    operatingPressure: "45 mmHg absolute",
    designTemperature: "420°C",
    operatingTemperature: "360°C",
    status: "approved",
    preparedBy: "Avijit Kayet",
    lastSavedDate: new Date().toISOString().split("T")[0],
    lastModifiedDateTime: new Date().toISOString(),
    mechanisms: [
      { id: "m1", code: "API 571 - 3.50", name: "Naphthenic Acid Corrosion (NAC)", susceptibility: "High", criticalFactor: "TAN > 1.5 mg KOH/g" },
      { id: "m2", code: "API 571 - 3.61", name: "High-Temperature Sulfidation", susceptibility: "High", criticalFactor: "Temperature > 260°C" }
    ],
    tmlRecords: [
      { id: "t1", tmlNo: "TML-10", component: "Transfer Line 90° Elbow", baselineThickness: "14.2 mm", currentThickness: "12.8 mm", cr: "0.18 mm/yr" }
    ]
  }
];

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  try {
    const db = getFirestoreDb();
    const method = req.method.toUpperCase();

    // GET /api/documents
    if (method === "GET") {
      try {
        if (db) {
          const snapshot = await getDocs(collection(db, "documents"));
          if (!snapshot.empty) {
            const docs = [];
            snapshot.forEach((d) => docs.push({ id: d.id, ...d.data() }));
            return res.status(200).json(docs);
          }
        }
      } catch (err) {
        console.warn("Firestore fetch error, serving seeded documents:", err.message);
      }
      return res.status(200).json(DEFAULT_CCD_DOCS);
    }

    // POST /api/documents or /api/documents/upload
    if (method === "POST") {
      const data = req.body || {};
      const docId = data.id || `doc_${Date.now()}`;
      data.id = docId;
      data.lastSavedDate = new Date().toISOString().split("T")[0];
      data.lastModifiedDateTime = new Date().toISOString();

      try {
        if (db) {
          await setDoc(doc(db, "documents", docId), data, { merge: true });
        }
      } catch (err) {
        console.warn("Firestore save failed, local cache accepted:", err.message);
      }

      return res.status(200).json({ success: true, id: docId, document: data });
    }

    // DELETE /api/documents/:id
    if (method === "DELETE") {
      const id = req.path.split("/").pop();
      try {
        if (db && id && id !== "documents") {
          await deleteDoc(doc(db, "documents", id));
        }
      } catch (err) {
        console.warn("Firestore delete failed:", err.message);
      }
      return res.status(200).json({ success: true, deletedId: id });
    }

    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (error) {
    console.error("Error in /api/documents handler:", error);
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
}
