/**
 * API 571 Damage Mechanism Backend Engine & Data Service
 * Serves comprehensive API 571 3rd Edition catalog, custom mechanisms, search, and resolver logic.
 * Dynamically binds to active Firebase Project.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getFirestoreDb, getActiveProjectConfig } from "./firestoreClient.js";
import { collection, getDocs } from "firebase/firestore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory cache with project tracking
let cachedMechanisms = null;
let cachedMechanismsProjectId = null;

export function invalidateDamageMechanismsCache() {
  cachedMechanisms = null;
  cachedMechanismsProjectId = null;
}

const DEFAULT_DAMAGE_MECHANISMS = {
  "Corrosion Under Insulation (CUI)": {
    code: "CUI",
    category: "Atmospheric & Insulation Corrosion",
    description: "Corrosion of carbon and low alloy steels resulting from water trapped under insulation or fireproofing.",
    affectedMaterials: "Carbon steels, low alloy steels, 300 series SS, and duplex stainless steels.",
    criticalFactors: "Operating temperature (-12°C to 175°C), damage to insulation/weather barrier, design/maintenance.",
    affectedUnits: "Piping and equipment operating intermittently or continuously between -12°C and 175°C.",
    appearance: "Generalized or localized pitting and wall loss beneath insulation.",
    mitigation: "High-quality protective coating systems, visual inspection, non-destructive testing (NDT).",
    inspection: "Visual inspection after stripping insulation, pulsed eddy current (PEC), radiographic testing (RT).",
    temperatureComparison: "Peak rates between 100°C and 120°C."
  },
  "Atmospheric Corrosion": {
    code: "ATM",
    category: "Atmospheric & Insulation Corrosion",
    description: "A form of corrosion that occurs from moisture associated with atmospheric conditions on exposed surfaces.",
    affectedMaterials: "Carbon steel, low alloy steels, and copper alloyed steels.",
    criticalFactors: "Moisture, air pollutants (sulfur compounds, chlorides), temperature, marine environments.",
    affectedUnits: "All uninsulated exterior equipment, structural steel, tank roofs, and piping.",
    appearance: "General uniform wall thinning with loose rust/scale accumulation.",
    mitigation: "Surface preparation and application of industrial protective coating systems.",
    inspection: "Visual inspection (VT) and ultrasonic thickness gauging (UT)."
  }
};

function getLocalDamageMechanisms() {
  const securePath = path.resolve(__dirname, "../data/secure/damage_mechanisms.json");
  const fallbackPath = path.resolve(__dirname, "../data/damage_mechanisms.json");

  try {
    if (fs.existsSync(securePath)) {
      const data = JSON.parse(fs.readFileSync(securePath, "utf8"));
      return data["Damage Mechanism"] ? data["Damage Mechanism"] : data;
    }
    if (fs.existsSync(fallbackPath)) {
      const data = JSON.parse(fs.readFileSync(fallbackPath, "utf8"));
      return data["Damage Mechanism"] ? data["Damage Mechanism"] : data;
    }
  } catch (err) {
    console.warn("Failed to load local damage mechanisms file:", err.message);
  }
  return DEFAULT_DAMAGE_MECHANISMS;
}

function getLocalCustomDamageMechanisms() {
  const customPath = path.resolve(__dirname, "../data/secure/custom_damage_mechanisms.json");
  try {
    if (fs.existsSync(customPath)) {
      return JSON.parse(fs.readFileSync(customPath, "utf8")) || {};
    }
  } catch (err) {
    console.warn("Failed to load custom damage mechanisms:", err.message);
  }
  return {};
}

// Map common aliases to canonical names
const ALIAS_MAP = {
  "cui": "Corrosion Under Insulation (CUI)",
  "hic": "Hydrogen-Induced Cracking (HIC/SOHIC)",
  "sohic": "Hydrogen-Induced Cracking (HIC/SOHIC)",
  "ssc": "Sulfide Stress Corrosion Cracking (SSC)",
  "scc": "Chloride Stress Corrosion Cracking (Cl-SCC)",
  "clscc": "Chloride Stress Corrosion Cracking (Cl-SCC)",
  "pascc": "Polythionic Acid Stress Corrosion Cracking (PASCC)",
  "hta": "High-Temperature Hydrogen Attack (HTHA)",
  "htha": "High-Temperature Hydrogen Attack (HTHA)",
  "mic": "Microbiologically Influenced Corrosion (MIC)",
  "co2": "CO2 Corrosion (Sweet Corrosion)",
  "h2s": "Sour Water Corrosion (Acidic/Alkaline)",
  "amine": "Amine Stress Corrosion Cracking",
  "caustic": "Caustic Stress Corrosion Cracking (Caustic Embrittlement)",
  "sulfidation": "Sulfidation",
  "oxidation": "Oxidation",
  "naphthenic": "Naphthenic Acid Corrosion (NAC)",
  "nac": "Naphthenic Acid Corrosion (NAC)",
  "fuel ash": "Fuel Ash Corrosion",
  "flue gas": "Flue Gas Dew Point Corrosion",
  "ammonium chloride": "Ammonium Chloride Corrosion",
  "ammonium bisulfide": "Ammonium Bisulfide Corrosion",
  "polythionic": "Polythionic Acid Stress Corrosion Cracking (PASCC)",
  "chloride cracking": "Chloride Stress Corrosion Cracking (Cl-SCC)",
  "caustic cracking": "Caustic Stress Corrosion Cracking (Caustic Embrittlement)",
  "amine cracking": "Amine Stress Corrosion Cracking"
};

function normalizeStr(str) {
  return String(str || "").toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

// Fetch all damage mechanisms dynamically based on active Firebase Project
export async function getAllDamageMechanisms() {
  const activeProj = getActiveProjectConfig();
  if (cachedMechanisms && cachedMechanismsProjectId === activeProj.projectId) {
    return cachedMechanisms;
  }

  let mechs = {};
  let firestoreLoaded = false;

  // 1. Fetch live from Active Project's Firestore
  try {
    const db = getFirestoreDb();
    const snap = await getDocs(collection(db, "damageMechanisms"));
    if (!snap.empty) {
      firestoreLoaded = true;
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        let name = d.name;
        if (!name || name === "undefined") {
          try {
            name = decodeURIComponent(docSnap.id);
          } catch (e) {
            name = docSnap.id;
          }
        }
        mechs[name] = {
          id: docSnap.id,
          code: d.code || docSnap.id,
          name: name,
          category: d.category || "API 571 Damage Mechanism",
          description: d.description || "",
          affectedMaterials: d.affectedMaterials || d.materials || "",
          criticalFactors: d.criticalFactors || "",
          affectedUnits: d.affectedUnits || "",
          appearance: d.appearance || "",
          mitigation: d.mitigation || "",
          inspection: d.inspection || "",
          temperatureComparison: d.temperatureComparison || "",
          imagePath: d.imagePath || "",
          isCustom: d.isCustom !== undefined ? d.isCustom : false,
          projectId: activeProj.projectId,
          updatedAt: d.updatedAt ? (d.updatedAt.toMillis ? d.updatedAt.toMillis() : d.updatedAt) : Date.now()
        };
      });
    }
  } catch (err) {
    console.warn(`Firestore read for ${activeProj.projectId}:`, err.message);
  }

  // 2. If primary production project (loginapp-feb72), fallback to comprehensive local dataset if Firestore is warming up
  if (!firestoreLoaded && (activeProj.projectId === "loginapp-feb72" || activeProj.isDefault)) {
    mechs = { ...getLocalDamageMechanisms() };
    const customLocal = getLocalCustomDamageMechanisms();
    if (customLocal && typeof customLocal === "object") {
      Object.assign(mechs, customLocal);
    }
  }

  cachedMechanisms = mechs;
  cachedMechanismsProjectId = activeProj.projectId;
  return mechs;
}

// Resolve single mechanism by name, code, or alias
export async function resolveDamageMechanism(query) {
  if (!query) return null;
  const mechs = await getAllDamageMechanisms();
  const qStr = String(query).trim();
  const qNorm = normalizeStr(qStr);

  // 1. Exact match
  if (mechs[qStr]) {
    return { name: qStr, ...mechs[qStr] };
  }

  // 2. Exact code match
  for (const [name, val] of Object.entries(mechs)) {
    if (val.code && String(val.code).trim().toLowerCase() === qStr.toLowerCase()) {
      return { name, ...val };
    }
  }

  // 3. Alias dictionary match
  const matchedName = ALIAS_MAP[qNorm] || ALIAS_MAP[qStr.toLowerCase()];
  if (matchedName && mechs[matchedName]) {
    return { name: matchedName, ...mechs[matchedName] };
  }

  // 4. Normalized key match
  for (const [name, val] of Object.entries(mechs)) {
    if (normalizeStr(name) === qNorm) {
      return { name, ...val };
    }
  }

  // 5. Substring inclusion
  for (const [name, val] of Object.entries(mechs)) {
    const nNorm = normalizeStr(name);
    if (nNorm.includes(qNorm) || qNorm.includes(nNorm)) {
      return { name, ...val };
    }
  }

  return null;
}

// Handler
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const activeProj = getActiveProjectConfig();
    const name = req.query.name || req.body?.name;
    const code = req.query.code || req.body?.code;
    const search = req.query.q || req.query.search || req.body?.q;

    // Search / Single Resolve
    if (name || code) {
      const match = await resolveDamageMechanism(name || code);
      if (match) {
        return res.status(200).json({ success: true, activeProject: activeProj.projectId, mechanism: match });
      }
      return res.status(404).json({ success: false, activeProject: activeProj.projectId, error: `Damage mechanism '${name || code}' not found` });
    }

    const allMechs = await getAllDamageMechanisms();

    // Query search / Filter
    if (search) {
      const sNorm = normalizeStr(search);
      const filtered = {};
      for (const [mName, mVal] of Object.entries(allMechs)) {
        const hay = [
          mName,
          mVal.code || "",
          mVal.category || "",
          mVal.description || "",
          mVal.affectedMaterials || "",
          mVal.affectedUnits || ""
        ].join(" ").toLowerCase();
        if (hay.includes(search.toLowerCase()) || normalizeStr(mName).includes(sNorm)) {
          filtered[mName] = mVal;
        }
      }
      return res.status(200).json({
        success: true,
        activeProject: activeProj.projectId,
        count: Object.keys(filtered).length,
        mechanisms: filtered
      });
    }

    // Default: return full structure { "Damage Mechanism": mechs } and array for convenience
    return res.status(200).json({
      success: true,
      activeProject: activeProj.projectId,
      activeProjectName: activeProj.name,
      count: Object.keys(allMechs).length,
      "Damage Mechanism": allMechs,
      mechanisms: allMechs
    });
  } catch (error) {
    console.error("Damage Mechanisms API Error:", error);
    return res.status(500).json({ success: false, error: error.message || "Internal server error" });
  }
}
