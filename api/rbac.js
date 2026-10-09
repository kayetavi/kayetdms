import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getAdminApp, verifyServerIdentity } from "./sessionStore.js";
import { getFirestoreDb } from "./firestoreClient.js";
import { doc, getDoc } from "firebase/firestore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const USERS_FILE = path.resolve(__dirname, "../data/secure/users.json");
export const ROLE_MATRIX_FILE = path.resolve(__dirname, "../data/secure/role_matrix.json");

export const DEFAULT_ROLE_MATRIX = {
  admin: {
    damageExplorer: true,
    api581: true,
    api570: true,
    thicknessCalc: true,
    processFlow: true,
    crackingMechanism: true,
    bkStress: true,
    rptu: true,
    ccdAI: true,
    chemicalSuite: true,
    streamComparator: true,
    unitConverter: true,
    adminControlCenter: true
  },
  lead_engineer: {
    damageExplorer: true,
    api581: true,
    api570: true,
    thicknessCalc: true,
    processFlow: true,
    crackingMechanism: true,
    bkStress: true,
    rptu: true,
    ccdAI: true,
    chemicalSuite: true,
    streamComparator: true,
    unitConverter: true,
    adminControlCenter: false
  },
  inspector: {
    damageExplorer: true,
    api581: true,
    api570: true,
    thicknessCalc: true,
    processFlow: true,
    crackingMechanism: true,
    bkStress: true,
    rptu: false,
    ccdAI: false,
    chemicalSuite: true,
    streamComparator: false,
    unitConverter: true,
    adminControlCenter: false
  },
  viewer: {
    damageExplorer: true,
    api581: true,
    api570: true,
    thicknessCalc: false,
    processFlow: true,
    crackingMechanism: false,
    bkStress: false,
    rptu: false,
    ccdAI: false,
    chemicalSuite: false,
    streamComparator: false,
    unitConverter: true,
    adminControlCenter: false
  }
};

export function getRoleMatrix() {
  try {
    if (fs.existsSync(ROLE_MATRIX_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(ROLE_MATRIX_FILE, "utf8"));
      if (parsed && typeof parsed === "object") {
        return {
          admin: { ...DEFAULT_ROLE_MATRIX.admin },
          lead_engineer: { ...DEFAULT_ROLE_MATRIX.lead_engineer, ...(parsed.lead_engineer || parsed.engineer || {}) },
          inspector: { ...DEFAULT_ROLE_MATRIX.inspector, ...(parsed.inspector || {}) },
          viewer: { ...DEFAULT_ROLE_MATRIX.viewer, ...(parsed.viewer || {}) }
        };
      }
    }
  } catch (err) {
    console.warn("Failed to read role_matrix.json:", err.message);
  }
  return JSON.parse(JSON.stringify(DEFAULT_ROLE_MATRIX));
}

export function saveRoleMatrixFile(matrix) {
  ensureDirExists(ROLE_MATRIX_FILE);
  fs.writeFileSync(ROLE_MATRIX_FILE, JSON.stringify(matrix, null, 2), "utf8");
}

function ensureDirExists(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export const AVAILABLE_MODULES = [
  {
    id: "damageExplorer",
    name: "API 571 Damage Mechanism Catalog",
    category: "Damage Mechanism",
    icon: "🔬",
    subsections: [
      { id: "damageCatalog", name: "Damage Mechanism Catalog & Explorer" }
    ]
  },
  {
    id: "api581",
    name: "Risk-Based Inspection Methodology",
    category: "Risk-Based Inspection Methodology",
    icon: "🛡️",
    subsections: [
      { id: "api571Criteria", name: "Criteria of Finding Damage Mechanism" },
      { id: "corrosionRate", name: "Damage Mechanism – Corrosion Rate Estimator" },
      { id: "fluidSelector", name: "Representative Fluid" },
      { id: "inventoryCalc", name: "Inventory Calculator" },
      { id: "inspectionConfidence", name: "Inspection Confidence" },
      { id: "toxicCalc", name: "Toxic % Calculation" },
      { id: "cofCalculator", name: "Quantitative: Risk Calculator_COF" },
      { id: "qpofCalculator", name: "Quantitative: Risk Calculator_POF" },
      { id: "corrosionCalc", name: "Semi Quantitative: Risk Calculator" }
    ]
  },
  {
    id: "api570",
    name: "Thickness Data Evaluation & Analysis",
    category: "Thickness Data Evaluation & Analysis",
    icon: "📈",
    subsections: [
      { id: "statisticalAnalysis", name: "Statistical Analysis" }
    ]
  },
  {
    id: "thicknessCalc",
    name: "Design Thickness Calculator",
    category: "Design Thickness Calculator",
    icon: "📐",
    subsections: [
      { id: "asmeB31_3", name: "Process Piping: ASME B31.3 (Advanced)" },
      { id: "simplePiping", name: "Process Piping: Simple Formula (PD / 2SE)" },
      { id: "asmeSectionVIII", name: "Pressure Vessel" },
      { id: "pipeThickness", name: "Piping Thickness Chart" },
      { id: "structuralThickness", name: "Structural Thickness Lookup (API 574 / 581)" }
    ]
  },
  {
    id: "processFlow",
    name: "Corrosion Diagrams",
    category: "Corrosion Diagrams",
    icon: "📊",
    subsections: [
      { id: "atmospheric", name: "HYDROPROCESSING" },
      { id: "cduVdu", name: "CDU / VDU" },
      { id: "msp", name: "MSP" },
      { id: "h2u", name: "H2U" }
    ]
  },
  {
    id: "crackingMechanism",
    name: "Cracking Mechanism Finder",
    category: "Cracking Mechanism Finder",
    icon: "🔍",
    subsections: [
      { id: "crackingFinder", name: "Open Finder" }
    ]
  },
  {
    id: "bkStress",
    name: "Allowable Stress Lookup",
    category: "Allowable Stress Lookup",
    icon: "🧮",
    subsections: [
      { id: "stressLookup", name: "Allowable Stress & Material Data" }
    ]
  },
  {
    id: "rptu",
    name: "RPTU Dashboard",
    category: "RPTU Dashboard",
    icon: "📱",
    subsections: [
      { id: "rptuDashboard", name: "Open Dashboard" }
    ]
  },
  {
    id: "ccdAI",
    name: "CCD AI Platform",
    category: "CCD AI Platform",
    icon: "🤖",
    subsections: [
      { id: "ccdAiPlatform", name: "Open CCD AI Platform" }
    ]
  },
  {
    id: "chemicalSuite",
    name: "Chemistry & Chemical Suite",
    category: "Chemistry & Chemical Suite",
    icon: "⚗️",
    subsections: [
      { id: "chemicalSafetySuite", name: "Chemical & HAZMAT Safety Suite" }
    ]
  },
  {
    id: "streamComparator",
    name: "Stream Comparator (HMB)",
    category: "Stream Comparator (HMB)",
    icon: "🔄",
    subsections: [
      { id: "streamComparatorMain", name: "Process Stream & Material Balance Comparator" }
    ]
  },
  {
    id: "unitConverter",
    name: "Unit Converters",
    category: "Unit Converters",
    icon: "📐",
    subsections: [
      { id: "unitConverterMain", name: "Plant & Integrity Units" }
    ]
  },
  {
    id: "adminControlCenter",
    name: "Tools",
    category: "Tools",
    icon: "🛠️",
    subsections: [
      { id: "userManagement", name: "User Management", group: "USERS & PERMISSIONS" },
      { id: "rbacPermissions", name: "Roles & Permissions", group: "USERS & PERMISSIONS" },
      { id: "accessControl", name: "Access Control", group: "USERS & PERMISSIONS" },

      { id: "appOverview", name: "Applications Overview", group: "APPLICATION MANAGER" },
      { id: "appDamage", name: "API 571 Damage Mechanism", group: "APPLICATION MANAGER" },
      { id: "appStream", name: "Stream Data Manager", group: "APPLICATION MANAGER" },
      { id: "appStress", name: "Allowable Stress Manager", group: "APPLICATION MANAGER" },

      { id: "firestoreExplorer", name: "Firestore Collections Explorer", group: "SYSTEMS" },
      { id: "sysDiagnostics", name: "Backup & Cloud Diagnostics", group: "SYSTEMS" },
      { id: "projectSwitcher", name: "Project Switcher", group: "SYSTEMS" },
      { id: "activeSessions", name: "Active Sessions", group: "SYSTEMS" },
      { id: "systemLogs", name: "System Logs", group: "SYSTEMS" },

      { id: "layoutBuilder", name: "Sidebar Configuration", group: "LAYOUT & NAVIGATION BUILDER" },
      { id: "sidebarOrder", name: "Sidebar Order", group: "LAYOUT & NAVIGATION BUILDER" },
      { id: "tickerText", name: "Ticker Text", group: "LAYOUT & NAVIGATION BUILDER" },
      { id: "welcomeCards", name: "Welcome Cards", group: "LAYOUT & NAVIGATION BUILDER" },
      { id: "navVisibility", name: "Navigation Visibility", group: "LAYOUT & NAVIGATION BUILDER" },

      { id: "masterData", name: "Master Data Management", group: "MASTER DATA, BACKUP & LOGS" },
      { id: "jsonBackup", name: "1-Click JSON Backup", group: "MASTER DATA, BACKUP & LOGS" },
      { id: "jsonRestore", name: "JSON Restore", group: "MASTER DATA, BACKUP & LOGS" },
      { id: "backupHistory", name: "Backup History", group: "MASTER DATA, BACKUP & LOGS" },
      { id: "auditTrail", name: "Audit Trail", group: "MASTER DATA, BACKUP & LOGS" }
    ]
  }
];

export function buildRolePermissions(role, customModules = {}, customSubsections = {}) {
  const allModulesTrue = {};
  const allSubsectionsTrue = {};

  AVAILABLE_MODULES.forEach((mod) => {
    allModulesTrue[mod.id] = true;
    if (mod.subsections) {
      allSubsectionsTrue[mod.id] = {};
      mod.subsections.forEach((sub) => {
        allSubsectionsTrue[mod.id][sub.id] = true;
      });
    }
  });

  if (role === "admin") {
    return {
      modules: allModulesTrue,
      subsections: allSubsectionsTrue
    };
  }

  // Normalize customModules aliases (e.g. damageMechanisms, api571 -> damageExplorer)
  const normCustomModules = {};
  if (customModules && typeof customModules === "object") {
    Object.keys(customModules).forEach(k => {
      let normKey = k;
      if (k === "damage" || k === "damageMechanisms" || k === "damageMechanism" || k === "api571" || k === "damageCatalog" || k === "card_damageExplorer" || k === "card_dmg") normKey = "damageExplorer";
      if (k === "cracking") normKey = "crackingMechanism";
      if (k === "b313" || k === "designThickness") normKey = "thicknessCalc";
      if (k === "tools") normKey = "adminControlCenter";
      if (k === "remainingLife") normKey = "api570";
      if (k === "stream" || k === "streams" || k === "streamData" || k === "streamBalance") normKey = "streamComparator";
      normCustomModules[normKey] = customModules[k];
    });
  }

  const normCustomSubsections = {};
  if (customSubsections && typeof customSubsections === "object") {
    Object.keys(customSubsections).forEach(k => {
      let normKey = k;
      if (k === "damage" || k === "damageMechanisms" || k === "damageMechanism" || k === "api571" || k === "damageCatalog") normKey = "damageExplorer";
      if (k === "cracking") normKey = "crackingMechanism";
      if (k === "b313" || k === "designThickness") normKey = "thicknessCalc";
      if (k === "tools") normKey = "adminControlCenter";
      if (k === "remainingLife") normKey = "api570";
      if (k === "stream" || k === "streams" || k === "streamData" || k === "streamBalance") normKey = "streamComparator";

      normCustomSubsections[normKey] = {};
      const subObj = customSubsections[k];
      if (subObj && typeof subObj === "object") {
        Object.keys(subObj).forEach(sk => {
          let normSubKey = sk;
          if (normKey === "adminControlCenter" && (sk === "app-stream" || sk === "streamData")) normSubKey = "appStream";
          if (normKey === "streamComparator" && (sk === "stream")) normSubKey = "streamComparatorMain";
          normCustomSubsections[normKey][normSubKey] = subObj[sk];
        });
      }
    });
  }

  // Base preset modules
  let baseModules = {};
  let baseSubsections = {};

  const matrix = getRoleMatrix();
  const matrixRole = matrix[role] || (role === "engineer" ? matrix.lead_engineer : null);

  if (matrixRole) {
    baseModules = {};
    AVAILABLE_MODULES.forEach(mod => {
      baseModules[mod.id] = matrixRole[mod.id] === true;
    });
    baseSubsections = JSON.parse(JSON.stringify(allSubsectionsTrue));
    Object.keys(baseSubsections).forEach(m => {
      if (!baseModules[m]) {
        Object.keys(baseSubsections[m]).forEach(k => baseSubsections[m][k] = false);
      }
    });
    if (role === "viewer" && baseSubsections.api581) {
      baseSubsections.api581.corrosionRate = false;
      baseSubsections.api581.inventoryCalc = false;
      baseSubsections.api581.toxicCalc = false;
      baseSubsections.api581.cofCalculator = false;
      baseSubsections.api581.qpofCalculator = false;
      baseSubsections.api581.corrosionCalc = false;
    }
  } else if (role === "lead_engineer" || role === "engineer") {
    baseModules = { ...allModulesTrue };
    baseSubsections = JSON.parse(JSON.stringify(allSubsectionsTrue));
    baseModules.adminControlCenter = false;
    if (baseSubsections.adminControlCenter) {
      Object.keys(baseSubsections.adminControlCenter).forEach(k => baseSubsections.adminControlCenter[k] = false);
    }
  } else if (role === "inspector") {
    baseModules = {
      api570: true,
      damageExplorer: true,
      api581: true,
      thicknessCalc: true,
      crackingMechanism: true,
      bkStress: true,
      streamComparator: false,
      chemicalSuite: true,
      unitConverter: true,
      processFlow: true,
      rptu: false,
      ccdAI: false,
      adminControlCenter: false
    };
    baseSubsections = JSON.parse(JSON.stringify(allSubsectionsTrue));
    if (baseSubsections.adminControlCenter) {
      Object.keys(baseSubsections.adminControlCenter).forEach(k => baseSubsections.adminControlCenter[k] = false);
    }
    if (baseSubsections.streamComparator) {
      Object.keys(baseSubsections.streamComparator).forEach(k => baseSubsections.streamComparator[k] = false);
    }
    if (baseSubsections.rptu) {
      Object.keys(baseSubsections.rptu).forEach(k => baseSubsections.rptu[k] = false);
    }
    if (baseSubsections.ccdAI) {
      Object.keys(baseSubsections.ccdAI).forEach(k => baseSubsections.ccdAI[k] = false);
    }
  } else if (role === "viewer") {
    baseModules = {
      api570: true,
      damageExplorer: true,
      api581: true,
      thicknessCalc: false,
      crackingMechanism: false,
      bkStress: false,
      streamComparator: false,
      chemicalSuite: false,
      unitConverter: true,
      processFlow: true,
      rptu: false,
      ccdAI: false,
      adminControlCenter: false
    };
    baseSubsections = JSON.parse(JSON.stringify(allSubsectionsTrue));
    Object.keys(baseSubsections).forEach(m => {
      if (!baseModules[m]) {
        Object.keys(baseSubsections[m]).forEach(k => baseSubsections[m][k] = false);
      }
    });
    if (baseSubsections.api581) {
      baseSubsections.api581.corrosionRate = false;
      baseSubsections.api581.inventoryCalc = false;
      baseSubsections.api581.toxicCalc = false;
      baseSubsections.api581.cofCalculator = false;
      baseSubsections.api581.qpofCalculator = false;
      baseSubsections.api581.corrosionCalc = false;
    }
  } else {
    // Custom role: starts with empty/false defaults
    AVAILABLE_MODULES.forEach((mod) => {
      baseModules[mod.id] = false;
      if (mod.subsections) {
        baseSubsections[mod.id] = {};
        mod.subsections.forEach((sub) => {
          baseSubsections[mod.id][sub.id] = false;
        });
      }
    });
  }

  // Ensure every available module exists in baseModules
  AVAILABLE_MODULES.forEach((mod) => {
    if (baseModules[mod.id] === undefined) {
      baseModules[mod.id] = false;
    }
    if (mod.subsections) {
      if (!baseSubsections[mod.id]) baseSubsections[mod.id] = {};
      mod.subsections.forEach((sub) => {
        if (baseSubsections[mod.id][sub.id] === undefined) {
          baseSubsections[mod.id][sub.id] = false;
        }
      });
    }
  });

  // Apply custom module overrides whenever provided
  if (normCustomModules && typeof normCustomModules === "object" && Object.keys(normCustomModules).length > 0) {
    AVAILABLE_MODULES.forEach((mod) => {
      if (typeof normCustomModules[mod.id] === "boolean") {
        baseModules[mod.id] = normCustomModules[mod.id];
        // If module was explicitly set to false, all its subsections must also be false
        if (normCustomModules[mod.id] === false && baseSubsections[mod.id]) {
          Object.keys(baseSubsections[mod.id]).forEach(k => {
            baseSubsections[mod.id][k] = false;
          });
        }
      }
      if (mod.subsections && normCustomModules[mod.id] !== false) {
        mod.subsections.forEach((sub) => {
          if (
            normCustomSubsections &&
            normCustomSubsections[mod.id] &&
            typeof normCustomSubsections[mod.id][sub.id] === "boolean"
          ) {
            baseSubsections[mod.id][sub.id] = normCustomSubsections[mod.id][sub.id];
          }
        });
      }
    });
  }

  // Apply custom subsection overrides for any subsection keys (including granular action/tab permissions)
  if (normCustomSubsections && typeof normCustomSubsections === "object") {
    Object.keys(normCustomSubsections).forEach(modId => {
      if (!baseSubsections[modId]) baseSubsections[modId] = {};
      const subObj = normCustomSubsections[modId];
      if (subObj && typeof subObj === "object") {
        Object.keys(subObj).forEach(subId => {
          if (typeof subObj[subId] === "boolean") {
            baseSubsections[modId][subId] = subObj[subId];
          }
        });
      }
    });
  }
  AVAILABLE_MODULES.forEach((mod) => {
    if (normCustomModules && normCustomModules[mod.id] === false) {
      baseModules[mod.id] = false;
      if (baseSubsections[mod.id]) {
        Object.keys(baseSubsections[mod.id]).forEach(k => {
          baseSubsections[mod.id][k] = false;
        });
      }
    } else if (mod.subsections && baseSubsections[mod.id]) {
      const hasAnySubTrue = Object.values(baseSubsections[mod.id]).some(Boolean);
      if (hasAnySubTrue) {
        baseModules[mod.id] = true;
      }
    }
  });

  return { modules: baseModules, subsections: baseSubsections };
}

// In-memory cache for fast fallback
export const userRolesCache = new Map();

// Default Super Admin email
export const SUPER_ADMIN_EMAIL = "avijitkayet97@gmail.com";

export function isSuperAdminEmail(email) {
  if (!email) return false;
  return String(email).toLowerCase().trim() === "avijitkayet97@gmail.com";
}

export const DELETED_USERS_FILE = path.resolve(__dirname, "../data/secure/deleted_users.json");
export const deletedUsersCache = new Set();

export function loadDeletedUsersFromFile() {
  try {
    ensureDirExists(DELETED_USERS_FILE);
    if (fs.existsSync(DELETED_USERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(DELETED_USERS_FILE, "utf8"));
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.warn("Failed to read deleted users file:", err.message);
  }
  return [];
}

export function saveDeletedUsersToFile(deletedList) {
  try {
    ensureDirExists(DELETED_USERS_FILE);
    fs.writeFileSync(DELETED_USERS_FILE, JSON.stringify(deletedList, null, 2), "utf8");
  } catch (err) {
    console.warn("Failed to write deleted users file:", err.message);
  }
}

function initBootstrapDeletedUsers() {
  const list = loadDeletedUsersFromFile();
  list.forEach(item => {
    const email = typeof item === "string" ? item : item?.email;
    if (email) deletedUsersCache.add(email.toLowerCase().trim());
  });
}
initBootstrapDeletedUsers();

export async function isUserDeleted(email) {
  const target = (email || "").toLowerCase().trim();
  if (!target) return false;
  if (isSuperAdminEmail(target)) return false;
  if (deletedUsersCache.has(target)) return true;

  const adminApp = getAdminApp();
  const db = adminApp ? adminApp.firestore() : null;
  if (db) {
    try {
      const snap = await db.collection("deletedUsers").doc(target).get();
      if (snap && snap.exists) {
        deletedUsersCache.add(target);
        return true;
      }
    } catch (e) {}
  }
  return false;
}

export async function markUserDeleted(email, deletedBy = "") {
  const target = (email || "").toLowerCase().trim();
  if (!target || isSuperAdminEmail(target)) return;

  deletedUsersCache.add(target);

  const fileList = loadDeletedUsersFromFile();
  const idx = fileList.findIndex(item => (typeof item === "string" ? item : item?.email).toLowerCase().trim() === target);
  const record = { email: target, deletedAt: Date.now(), deletedBy };
  if (idx >= 0) {
    fileList[idx] = record;
  } else {
    fileList.push(record);
  }
  saveDeletedUsersToFile(fileList);

  const adminApp = getAdminApp();
  const db = adminApp ? adminApp.firestore() : null;
  if (db) {
    try {
      await db.collection("deletedUsers").doc(target).set(record, { merge: true });
    } catch (e) {}
  }
}

export async function markUserRestored(email) {
  const target = (email || "").toLowerCase().trim();
  if (!target) return;

  deletedUsersCache.delete(target);

  const fileList = loadDeletedUsersFromFile();
  const filtered = fileList.filter(item => (typeof item === "string" ? item : item?.email).toLowerCase().trim() !== target);
  saveDeletedUsersToFile(filtered);

  const adminApp = getAdminApp();
  const db = adminApp ? adminApp.firestore() : null;
  if (db) {
    try {
      await db.collection("deletedUsers").doc(target).delete();
    } catch (e) {}
  }
}

export function loadUsersFromFile() {
  try {
    ensureDirExists(USERS_FILE);
    if (fs.existsSync(USERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.warn("Failed to read users file:", err.message);
  }
  return [];
}

export function saveUsersToFile(users) {
  try {
    ensureDirExists(USERS_FILE);
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
  } catch (err) {
    console.warn("Failed to write users file:", err.message);
  }
}

// Initial bootstrap of userRolesCache from file or seeds
function initBootstrapUsers() {
  let fileUsers = loadUsersFromFile();
  if (!fileUsers || fileUsers.length === 0) {
    const adminPerms = buildRolePermissions("admin");

    fileUsers = [
      {
        id: SUPER_ADMIN_EMAIL,
        email: SUPER_ADMIN_EMAIL,
        role: "admin",
        allowedModules: adminPerms.modules,
        subsections: adminPerms.subsections,
        isSuperAdmin: true,
        hasAuthAccount: true,
        updatedAt: Date.now()
      }
    ];
    saveUsersToFile(fileUsers);
  }

  fileUsers.forEach((u) => {
    if (u && u.email) {
      userRolesCache.set(u.email.toLowerCase().trim(), u);
    }
  });
}

initBootstrapUsers();

export async function getUserRbacData(email) {
  const targetEmail = (email || SUPER_ADMIN_EMAIL).toLowerCase().trim();
  const isSuperAdmin = isSuperAdminEmail(targetEmail);

  // 0. If user is deleted/blacklisted and not super admin, return null
  if (!isSuperAdmin && (await isUserDeleted(targetEmail))) {
    return null;
  }

  let roleData = null;

  // 1. Try reading from Firestore via unified modular client
  try {
    const firestore = getFirestoreDb();
    if (firestore) {
      const snap = await Promise.race([
        getDoc(doc(firestore, "userRoles", targetEmail)),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2500))
      ]);
      if (snap && snap.exists()) {
        roleData = snap.data();
      }
    }
  } catch (err) {
    console.warn("Firestore userRoles fetch note:", err?.message || String(err));
  }

  // Fallback: Admin SDK Firestore
  if (!roleData) {
    const adminApp = getAdminApp();
    const db = adminApp ? adminApp.firestore() : null;
    if (db) {
      try {
        const snap = await db.collection("userRoles").doc(targetEmail).get();
        if (snap && snap.exists) {
          roleData = snap.data();
        }
      } catch (e) {}
    }
  }

  // 2. Try memory cache
  if (!roleData && userRolesCache.has(targetEmail)) {
    roleData = userRolesCache.get(targetEmail);
  }

  // 3. Try reading from local file
  if (!roleData) {
    const fileUsers = loadUsersFromFile();
    const match = fileUsers.find((u) => u.email && u.email.toLowerCase().trim() === targetEmail);
    if (match) {
      roleData = match;
      userRolesCache.set(targetEmail, roleData);
    }
  }

  // If super admin (avijitkayet97@gmail.com), guarantee 100% full permissions across all modules & subsections
  if (isSuperAdmin) {
    const adminPerms = buildRolePermissions("admin");
    return {
      email: targetEmail,
      role: "admin",
      isSuperAdmin: true,
      allowedModules: adminPerms.modules,
      subsections: adminPerms.subsections,
      availableModules: AVAILABLE_MODULES
    };
  }

  // 4. For standard users: If not found in userRoles, do NOT auto-create! Return null.
  if (!roleData) {
    return null;
  }

  const resolvedPassword = roleData.password || roleData.assignedPassword || roleData.temporaryPassword || "";

  return {
    email: targetEmail,
    role: roleData.role || "viewer",
    isSuperAdmin: false,
    allowedModules: roleData.allowedModules || {},
    subsections: roleData.subsections || {},
    availableModules: AVAILABLE_MODULES,
    authUid: roleData.authUid || "",
    password: resolvedPassword
  };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const method = req.method;
  const payload = method === "GET" ? req.query : req.body || {};
  const action = (payload.action || "get_my_permissions").toLowerCase();
  const identity = await verifyServerIdentity(req);
  const verifiedEmail = identity.verified ? identity.email : "";

  const callerEmail = verifiedEmail || (payload.callerEmail || payload.email || "").toLowerCase().trim();
  let targetEmail = (payload.targetEmail || payload.email || callerEmail || "").toLowerCase().trim();

  const adminApp = getAdminApp();
  const db = adminApp ? adminApp.firestore() : null;

  // Server-side identity & authority verification
  const callerRecord = callerEmail ? await getUserRbacData(callerEmail) : null;
  const isCallerAdmin = callerEmail === SUPER_ADMIN_EMAIL || (callerRecord && (callerRecord.role === "admin" || callerRecord.isSuperAdmin));

  // Enforce server-side RBAC for administrative operations
  if (action === "list_users" || action === "update_user_role" || action === "save_permissions" || action === "delete_user_role") {
    if (!isCallerAdmin) {
      return res.status(403).json({ error: "Access Denied. Administrator privileges required." });
    }
  }

  // Prevent non-admins from querying other users' permissions
  if ((action === "get_my_permissions" || action === "get_permissions") && !isCallerAdmin) {
    targetEmail = callerEmail;
  }

  // 0. Get available modules & role templates catalog
  if (action === "get_modules" || action === "get_available_modules" || action === "get_role_templates") {
    return res.status(200).json({
      success: true,
      availableModules: AVAILABLE_MODULES,
      roles: ["admin", "manager", "lead_engineer", "engineer", "inspector", "viewer"],
      roleTemplates: {
        admin: buildRolePermissions("admin"),
        manager: buildRolePermissions("manager"),
        lead_engineer: buildRolePermissions("lead_engineer"),
        engineer: buildRolePermissions("engineer"),
        inspector: buildRolePermissions("inspector"),
        viewer: buildRolePermissions("viewer")
      }
    });
  }

  // 1. Get current user's permissions
  if (action === "get_my_permissions" || action === "get_permissions") {
    if (!targetEmail) {
      return res.status(400).json({ error: "Target email required" });
    }

    const rbacData = await getUserRbacData(targetEmail);
    return res.status(200).json({
      success: true,
      ...rbacData
    });
  }

  // 2. List all users and their roles (Admin only)
  if (action === "list_users") {
    let usersList = [];

    // Read from Firestore if available
    if (db) {
      try {
        const snap = await Promise.race([
          db.collection("userRoles").get(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2000))
        ]);
        if (snap) {
          snap.forEach((doc) => {
            usersList.push(doc.data());
          });
        }
      } catch (err) {
        console.warn("Firestore list_users warning:", err?.message || String(err));
      }
    }

    // Merge with local persistent file
    const fileUsers = loadUsersFromFile();
    fileUsers.forEach((fu) => {
      const idx = usersList.findIndex((u) => u.email && u.email.toLowerCase().trim() === fu.email.toLowerCase().trim());
      if (idx >= 0) {
        usersList[idx] = { ...fu, ...usersList[idx] };
      } else {
        usersList.push(fu);
      }
    });

    // Merge with memory cache
    userRolesCache.forEach((val, key) => {
      if (!usersList.some((u) => u.email && u.email.toLowerCase().trim() === key)) {
        usersList.push(val);
      }
    });

    // Ensure super admin is in the list
    if (!usersList.some((u) => u.email === SUPER_ADMIN_EMAIL)) {
      const superAdminPerms = buildRolePermissions("admin");
      usersList.unshift({
        id: SUPER_ADMIN_EMAIL,
        email: SUPER_ADMIN_EMAIL,
        role: "admin",
        allowedModules: superAdminPerms.modules,
        subsections: superAdminPerms.subsections,
        isSuperAdmin: true,
        updatedAt: Date.now()
      });
    }

    // Update file & cache
    saveUsersToFile(usersList);
    usersList.forEach((u) => {
      if (u.email) userRolesCache.set(u.email.toLowerCase().trim(), u);
    });

    return res.status(200).json({
      success: true,
      users: usersList,
      availableModules: AVAILABLE_MODULES
    });
  }

  // 3. Save or update user role & permissions (Admin only)
  if (action === "update_user_role" || action === "save_permissions") {
    if (!targetEmail) {
      return res.status(400).json({ error: "Target email is required" });
    }

    const newRole = payload.role || "engineer";
    const customModules = payload.allowedModules || {};
    const customSubsections = payload.subsections || {};

    const finalPerms = buildRolePermissions(newRole, customModules, customSubsections);

    const record = {
      id: targetEmail,
      email: targetEmail,
      role: newRole,
      allowedModules: finalPerms.modules,
      subsections: finalPerms.subsections,
      isSuperAdmin: targetEmail === SUPER_ADMIN_EMAIL,
      updatedBy: callerEmail || "system",
      updatedAt: Date.now()
    };

    userRolesCache.set(targetEmail, record);

    // Save to file
    const fileUsers = loadUsersFromFile();
    const existingIdx = fileUsers.findIndex((u) => u.email && u.email.toLowerCase().trim() === targetEmail);
    if (existingIdx >= 0) {
      fileUsers[existingIdx] = { ...fileUsers[existingIdx], ...record };
    } else {
      fileUsers.push(record);
    }
    saveUsersToFile(fileUsers);

    // Save to Firestore
    if (db) {
      try {
        await db.collection("userRoles").doc(targetEmail).set(record, { merge: true });
      } catch (err) {
        console.error("Firestore userRoles update error:", err?.message || String(err));
      }
    }

    return res.status(200).json({
      success: true,
      message: `Permissions updated successfully for ${targetEmail}`,
      user: record
    });
  }

  // 4. Delete a user role record (Reverts to standard default)
  if (action === "delete_user_role") {
    if (!targetEmail || targetEmail === SUPER_ADMIN_EMAIL) {
      return res.status(400).json({ error: "Cannot delete super admin or missing email" });
    }

    userRolesCache.delete(targetEmail);

    const fileUsers = loadUsersFromFile();
    const filtered = fileUsers.filter((u) => u.email && u.email.toLowerCase().trim() !== targetEmail);
    saveUsersToFile(filtered);

    if (db) {
      try {
        await db.collection("userRoles").doc(targetEmail).delete();
      } catch (err) {}
    }

    return res.status(200).json({
      success: true,
      message: `Role removed for ${targetEmail}`
    });
  }

  return res.status(400).json({ error: `Unknown action: ${action}` });
}
