import fs from "fs";
import path from "path";
import { getFirestoreDb } from "./firestoreClient.js";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

const DATA_PATH = path.join(process.cwd(), "data", "secure", "damage_criteria_presets.json");
const STREAM_DATASETS_PATH = path.join(process.cwd(), "data", "secure", "stream_datasets.json");

function loadPresets() {
  try {
    if (fs.existsSync(DATA_PATH)) {
      return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
    }
  } catch (err) {
    console.error("Error reading damage criteria presets:", err);
  }
  return { erosionTable: {}, streamPresets: {} };
}

function loadLocalStreamDatasets() {
  try {
    if (fs.existsSync(STREAM_DATASETS_PATH)) {
      return JSON.parse(fs.readFileSync(STREAM_DATASETS_PATH, "utf8"));
    }
  } catch (err) {
    console.error("Error reading stream datasets:", err);
  }
  return [];
}

// Built-in Industrial Unit Specifications & Stream Fallbacks
const DEFAULT_PLANT_UNITS = [
  {
    id: "RPTU",
    name: "RPTU - Residue Petrochemical Thermal Unit",
    description: "Thermal cracking & hydroprocessing complex with high-temperature sulfidation, H2/H2S and NH4HS risks."
  },
  {
    id: "WHFU",
    name: "WHFU - Waste Heat & Fractionation Unit",
    description: "Waste heat recovery, steam generation loops, and sour fractionation systems."
  }
];

// Rich Process Stream Catalog mapped by Unit
const UNIT_STREAMS_CATALOG = {
  RPTU: [
    {
      id: "RPTU-PL-01",
      streamNo: "101",
      name: "RPTU-PL-01 - Atmospheric Residue Charge to Surge Drum",
      phase: "Liquid",
      temp: 340,
      pressure: 25.0,
      h2: 0,
      h2s: 850,
      nh3: 0,
      h2o: 0,
      co2: 0,
      massFlow: 249999,
      density: 1012,
      pipeDiameter: 400,
      carbonSteel: "Y",
      crContent: 0,
      stress: "Y",
      hardness: "N",
      oxygen: "N",
      amineFlow: 0,
      amineType: "None",
      amineService: "Lean",
      hsas: 0,
      ph: 0,
      turbulence: "N",
      solids: "N",
      insulated: "Y",
      cuiMaterial: "CS",
      nh3Significant: "N",
      otherContamSignificant: "N",
      deltaT: 0,
      eroMaterial: "Carbon steel",
      description: "Heavy atmospheric tower bottoms / vacuum residue feed operating at 340°C. Classical McConomy high-temperature sulfidation."
    },
    {
      id: "RPTU-PL-02",
      streamNo: "102",
      name: "RPTU-PL-02 - Heavy Slurry Recycle to Slurry Reactor",
      phase: "Liquid",
      temp: 380,
      pressure: 30.0,
      h2: 0,
      h2s: 1400,
      nh3: 0,
      h2o: 0,
      co2: 0,
      massFlow: 85000,
      density: 1025,
      pipeDiameter: 250,
      carbonSteel: "Y",
      crContent: 5.0,
      stress: "Y",
      hardness: "N",
      oxygen: "N",
      amineFlow: 0,
      amineType: "None",
      amineService: "Lean",
      hsas: 0,
      ph: 0,
      turbulence: "Y",
      solids: "Y",
      insulated: "Y",
      cuiMaterial: "CS",
      nh3Significant: "N",
      otherContamSignificant: "N",
      deltaT: 0,
      eroMaterial: "Carbon steel",
      description: "Recycle slurry stream with active catalyst fines and high sulfur content. Sulfidation and erosion-corrosion susceptibility."
    },
    {
      id: "RPTU-PL-03",
      streamNo: "172A",
      name: "RPTU-PL-03 - Reactor Effluent Before Wash Water (Stream 172A)",
      phase: "Mixed",
      temp: 395,
      pressure: 165.0,
      h2: 14451,
      h2s: 14241,
      nh3: 918,
      h2o: 65,
      co2: 0,
      massFlow: 81732,
      density: 742,
      pipeDiameter: 300,
      carbonSteel: "Y",
      crContent: 1.25,
      stress: "Y",
      hardness: "N",
      oxygen: "N",
      amineFlow: 0,
      amineType: "None",
      amineService: "Lean",
      hsas: 0,
      ph: 0,
      turbulence: "Y",
      solids: "N",
      insulated: "Y",
      cuiMaterial: "CS",
      nh3Significant: "Y",
      otherContamSignificant: "N",
      deltaT: 0,
      eroMaterial: "Carbon steel",
      description: "Hydrotreater high-pressure, high-temperature effluent prior to wash water injection. Extreme sulfidation & H2/H2S threat."
    },
    {
      id: "RPTU-PL-04",
      streamNo: "172B",
      name: "RPTU-PL-04 - Wash Water Injection Stream (Stream 172B)",
      phase: "Liquid",
      temp: 38,
      pressure: 175.0,
      h2: 0,
      h2s: 0,
      nh3: 0,
      h2o: 24700,
      co2: 0,
      massFlow: 24700,
      density: 998,
      pipeDiameter: 100,
      carbonSteel: "Y",
      crContent: 0,
      stress: "Y",
      hardness: "N",
      oxygen: "Y",
      amineFlow: 0,
      amineType: "None",
      amineService: "Lean",
      hsas: 0,
      ph: 7.2,
      turbulence: "Y",
      solids: "N",
      insulated: "N",
      cuiMaterial: "CS",
      nh3Significant: "N",
      otherContamSignificant: "N",
      deltaT: 75,
      eroMaterial: "Carbon steel",
      description: "Demineralized wash water injection for salt sublimation mitigation and NH4HS dissolution. Dissolved oxygen risk."
    },
    {
      id: "RPTU-PL-05",
      streamNo: "173",
      name: "RPTU-PL-05 - Reactor Effluent After Wash Water Injection (Stream 173)",
      phase: "Mixed",
      temp: 115,
      pressure: 160.0,
      h2: 14451,
      h2s: 14241,
      nh3: 918,
      h2o: 24765,
      co2: 0,
      massFlow: 106432,
      density: 810,
      pipeDiameter: 350,
      carbonSteel: "Y",
      crContent: 1.25,
      stress: "Y",
      hardness: "N",
      oxygen: "N",
      amineFlow: 0,
      amineType: "None",
      amineService: "Lean",
      hsas: 0,
      ph: 8.4,
      turbulence: "Y",
      solids: "N",
      insulated: "Y",
      cuiMaterial: "CS",
      nh3Significant: "Y",
      otherContamSignificant: "N",
      deltaT: 0,
      eroMaterial: "Carbon steel",
      description: "Two-phase effluent downstream of wash water injection with hydrated NH4HS salts (>5 wt%). Severe alkaline sour water & velocity shear risk."
    },
    {
      id: "RPTU-PL-06",
      streamNo: "174",
      name: "RPTU-PL-06 - Cold High-Pressure Separator Gas (Stream 174)",
      phase: "Vapor",
      temp: 45,
      pressure: 155.0,
      h2: 14200,
      h2s: 12800,
      nh3: 50,
      h2o: 20,
      co2: 15,
      massFlow: 52100,
      density: 28.5,
      pipeDiameter: 250,
      carbonSteel: "Y",
      crContent: 0,
      stress: "Y",
      hardness: "Y",
      oxygen: "N",
      amineFlow: 0,
      amineType: "None",
      amineService: "Lean",
      hsas: 0,
      ph: 0,
      turbulence: "N",
      solids: "N",
      insulated: "N",
      cuiMaterial: "CS",
      nh3Significant: "N",
      otherContamSignificant: "N",
      deltaT: 0,
      eroMaterial: "Carbon steel",
      description: "Cold high-pressure separator sour off-gas. Severe Wet H2S Sulfide Stress Cracking (SSC) & SOHIC threat on non-PWHT/hard welds."
    },
    {
      id: "RPTU-PL-07",
      streamNo: "107",
      name: "RPTU-PL-07 - Amine Absorber Lean Feed Header",
      phase: "Liquid",
      temp: 45,
      pressure: 80.0,
      h2: 0,
      h2s: 0,
      nh3: 0,
      h2o: 35000,
      co2: 0,
      massFlow: 45000,
      density: 1020,
      pipeDiameter: 200,
      carbonSteel: "Y",
      crContent: 0,
      stress: "Y",
      hardness: "N",
      oxygen: "N",
      amineFlow: 10000,
      amineType: "MDEA",
      amineService: "Lean",
      hsas: 0.8,
      ph: 10.5,
      turbulence: "N",
      solids: "N",
      insulated: "N",
      cuiMaterial: "CS",
      nh3Significant: "N",
      otherContamSignificant: "N",
      deltaT: 0,
      eroMaterial: "Carbon steel",
      description: "Lean MDEA solution header returning from Amine Regenerator. Amine SCC & localized erosion monitoring."
    },
    {
      id: "RPTU-PL-08",
      streamNo: "108",
      name: "RPTU-PL-08 - Rich Amine Flash Column Overhead",
      phase: "Vapor",
      temp: 112,
      pressure: 2.5,
      h2: 50,
      h2s: 4800,
      nh3: 15,
      h2o: 2200,
      co2: 1200,
      massFlow: 8265,
      density: 3.2,
      pipeDiameter: 300,
      carbonSteel: "Y",
      crContent: 0,
      stress: "Y",
      hardness: "Y",
      oxygen: "N",
      amineFlow: 200,
      amineType: "MDEA",
      amineService: "Rich",
      hsas: 3.2,
      ph: 5.5,
      turbulence: "Y",
      solids: "N",
      insulated: "Y",
      cuiMaterial: "CS",
      nh3Significant: "N",
      otherContamSignificant: "N",
      deltaT: 0,
      eroMaterial: "Carbon steel",
      description: "Hot rich amine flashing acid gases (H2S + CO2) under low pressure. Severe Wet H2S cracking & acid gas erosion."
    }
  ],
  WHFU: [
    {
      id: "WHFU-PL-01",
      streamNo: "201",
      name: "WHFU-PL-01 - Waste Heat Boiler Feed Water Loop",
      phase: "Liquid",
      temp: 145,
      pressure: 45.0,
      h2: 0,
      h2s: 0,
      nh3: 0,
      h2o: 65000,
      co2: 0,
      massFlow: 65000,
      density: 920,
      pipeDiameter: 200,
      carbonSteel: "Y",
      crContent: 0,
      stress: "Y",
      hardness: "N",
      oxygen: "N",
      amineFlow: 0,
      amineType: "None",
      amineService: "Lean",
      hsas: 0,
      ph: 9.2,
      turbulence: "Y",
      solids: "N",
      insulated: "Y",
      cuiMaterial: "CS",
      nh3Significant: "N",
      otherContamSignificant: "N",
      deltaT: 0,
      eroMaterial: "Carbon steel",
      description: "Deaerated boiler feedwater entering waste heat steam generation coil. Flow-Accelerated Corrosion (FAC) monitoring."
    },
    {
      id: "WHFU-PL-02",
      streamNo: "202",
      name: "WHFU-PL-02 - Flue Gas Convection Section Cooler",
      phase: "Vapor",
      temp: 290,
      pressure: 1.2,
      h2: 0,
      h2s: 15,
      nh3: 0,
      h2o: 4500,
      co2: 12500,
      massFlow: 85000,
      density: 0.85,
      pipeDiameter: 750,
      carbonSteel: "Y",
      crContent: 0,
      stress: "Y",
      hardness: "N",
      oxygen: "Y",
      amineFlow: 0,
      amineType: "None",
      amineService: "Lean",
      hsas: 0,
      ph: 0,
      turbulence: "N",
      solids: "N",
      insulated: "Y",
      cuiMaterial: "CS",
      nh3Significant: "N",
      otherContamSignificant: "N",
      deltaT: 0,
      eroMaterial: "Carbon steel",
      description: "Flue gas economizer tubes. Low-temperature acid dewpoint and oxygen corrosion during operational swings."
    },
    {
      id: "WHFU-PL-03",
      streamNo: "203",
      name: "WHFU-PL-03 - Fractionator Feed Preheated Hydrocarbon",
      phase: "Mixed",
      temp: 260,
      pressure: 12.0,
      h2: 0,
      h2s: 650,
      nh3: 40,
      h2o: 120,
      co2: 0,
      massFlow: 140000,
      density: 830,
      pipeDiameter: 350,
      carbonSteel: "Y",
      crContent: 1.25,
      stress: "Y",
      hardness: "N",
      oxygen: "N",
      amineFlow: 0,
      amineType: "None",
      amineService: "Lean",
      hsas: 0,
      ph: 0,
      turbulence: "N",
      solids: "N",
      insulated: "Y",
      cuiMaterial: "CS",
      nh3Significant: "N",
      otherContamSignificant: "N",
      deltaT: 0,
      eroMaterial: "Carbon steel",
      description: "Preheated light/middle hydrocarbon feed into main fractionation column. Moderated sulfidation risk."
    },
    {
      id: "WHFU-PL-04",
      streamNo: "204",
      name: "WHFU-PL-04 - Fractionator Overhead Vapor & Acid Condensate",
      phase: "Mixed",
      temp: 110,
      pressure: 3.5,
      h2: 0,
      h2s: 1800,
      nh3: 150,
      h2o: 5400,
      co2: 45,
      massFlow: 42000,
      density: 650,
      pipeDiameter: 300,
      carbonSteel: "Y",
      crContent: 0,
      stress: "Y",
      hardness: "Y",
      oxygen: "N",
      amineFlow: 0,
      amineType: "None",
      amineService: "Lean",
      hsas: 0,
      ph: 4.8,
      turbulence: "Y",
      solids: "N",
      insulated: "Y",
      cuiMaterial: "CS",
      nh3Significant: "Y",
      otherContamSignificant: "N",
      deltaT: 0,
      eroMaterial: "Carbon steel",
      description: "Fractionator overhead condensing vapor. Acidic sour water, ammonium chloride deposition, and wet H2S cracking."
    }
  ],
  CDU: [
    {
      id: "CDU-PL-01",
      streamNo: "301",
      name: "CDU-PL-01 - Desalted Crude Preheat Train to Furnace",
      phase: "Liquid",
      temp: 275,
      pressure: 28.0,
      h2: 0,
      h2s: 320,
      nh3: 0,
      h2o: 100,
      co2: 0,
      massFlow: 420000,
      density: 815,
      pipeDiameter: 450,
      carbonSteel: "Y",
      crContent: 0,
      stress: "Y",
      hardness: "N",
      oxygen: "N",
      amineFlow: 0,
      amineType: "None",
      amineService: "Lean",
      hsas: 0,
      ph: 0,
      turbulence: "N",
      solids: "N",
      insulated: "Y",
      cuiMaterial: "CS",
      nh3Significant: "N",
      otherContamSignificant: "N",
      deltaT: 0,
      eroMaterial: "Carbon steel",
      description: "Crude distillation preheat train prior to atmospheric charge furnace. Sulfidation and naphthenic acid corrosion."
    },
    {
      id: "CDU-PL-02",
      streamNo: "302",
      name: "CDU-PL-02 - Atmospheric Tower Overhead Vapor",
      phase: "Vapor",
      temp: 105,
      pressure: 2.2,
      h2: 0,
      h2s: 650,
      nh3: 85,
      h2o: 3800,
      co2: 120,
      massFlow: 55000,
      density: 4.5,
      pipeDiameter: 500,
      carbonSteel: "Y",
      crContent: 0,
      stress: "Y",
      hardness: "Y",
      oxygen: "N",
      amineFlow: 0,
      amineType: "None",
      amineService: "Lean",
      hsas: 0,
      ph: 3.8,
      turbulence: "Y",
      solids: "N",
      insulated: "Y",
      cuiMaterial: "CS",
      nh3Significant: "N",
      otherContamSignificant: "N",
      deltaT: 0,
      eroMaterial: "Carbon steel",
      description: "Atmospheric tower overhead line. Aqueous HCl acid condensation and ammonium chloride salt sublimation."
    },
    {
      id: "CDU-PL-03",
      streamNo: "303",
      name: "CDU-PL-03 - Atmospheric Residue (Bottoms) to VDU Charge",
      phase: "Liquid",
      temp: 345,
      pressure: 6.5,
      h2: 0,
      h2s: 920,
      nh3: 0,
      h2o: 0,
      co2: 0,
      massFlow: 210000,
      density: 980,
      pipeDiameter: 350,
      carbonSteel: "Y",
      crContent: 0,
      stress: "Y",
      hardness: "N",
      oxygen: "N",
      amineFlow: 0,
      amineType: "None",
      amineService: "Lean",
      hsas: 0,
      ph: 0,
      turbulence: "N",
      solids: "N",
      insulated: "Y",
      cuiMaterial: "CS",
      nh3Significant: "N",
      otherContamSignificant: "N",
      deltaT: 0,
      eroMaterial: "Carbon steel",
      description: "High-temperature atmospheric tower bottoms. High-temperature sulfidation and CUI under lagging."
    }
  ],
  VDU: [
    {
      id: "VDU-PL-01",
      streamNo: "401",
      name: "VDU-PL-01 - Vacuum Furnace Transfer Line to Flash Zone",
      phase: "Mixed",
      temp: 410,
      pressure: 0.15,
      h2: 0,
      h2s: 1850,
      nh3: 0,
      h2o: 2500,
      co2: 0,
      massFlow: 185000,
      density: 45.0,
      pipeDiameter: 800,
      carbonSteel: "Y",
      crContent: 9.0,
      stress: "Y",
      hardness: "N",
      oxygen: "N",
      amineFlow: 0,
      amineType: "None",
      amineService: "Lean",
      hsas: 0,
      ph: 0,
      turbulence: "Y",
      solids: "N",
      insulated: "Y",
      cuiMaterial: "CS",
      nh3Significant: "N",
      otherContamSignificant: "N",
      deltaT: 0,
      eroMaterial: "Carbon steel",
      description: "Severe high-temperature transfer line operating under deep vacuum. High-temp sulfidation & acoustic vibration."
    },
    {
      id: "VDU-PL-02",
      streamNo: "402",
      name: "VDU-PL-02 - Heavy Vacuum Gas Oil (HVGO) Draw",
      phase: "Liquid",
      temp: 320,
      pressure: 4.5,
      h2: 0,
      h2s: 450,
      nh3: 0,
      h2o: 0,
      co2: 0,
      massFlow: 95000,
      density: 915,
      pipeDiameter: 250,
      carbonSteel: "Y",
      crContent: 1.25,
      stress: "Y",
      hardness: "N",
      oxygen: "N",
      amineFlow: 0,
      amineType: "None",
      amineService: "Lean",
      hsas: 0,
      ph: 0,
      turbulence: "N",
      solids: "N",
      insulated: "Y",
      cuiMaterial: "CS",
      nh3Significant: "N",
      otherContamSignificant: "N",
      deltaT: 0,
      eroMaterial: "Carbon steel",
      description: "HVGO side draw sending feed to hydrocracker/FCC. High temperature sulfidation threat."
    }
  ],
  H2U: [
    {
      id: "H2U-PL-01",
      streamNo: "501",
      name: "H2U-PL-01 - Reformer Syngas Effluent to High Temp Shift",
      phase: "Vapor",
      temp: 345,
      pressure: 26.0,
      h2: 12500,
      h2s: 0,
      nh3: 0,
      h2o: 8500,
      co2: 6500,
      massFlow: 45000,
      density: 3.8,
      pipeDiameter: 350,
      carbonSteel: "Y",
      crContent: 2.25,
      stress: "Y",
      hardness: "N",
      oxygen: "N",
      amineFlow: 0,
      amineType: "None",
      amineService: "Lean",
      hsas: 0,
      ph: 0,
      turbulence: "N",
      solids: "N",
      insulated: "Y",
      cuiMaterial: "CS",
      nh3Significant: "N",
      otherContamSignificant: "N",
      deltaT: 0,
      eroMaterial: "Carbon steel",
      description: "High hydrogen partial pressure syngas at 345°C. API 941 High Temperature Hydrogen Attack (HTHA) Nelson Curve limits."
    }
  ],
  MSP: [
    {
      id: "MSP-PL-01",
      streamNo: "601",
      name: "MSP-PL-01 - HDT Reactor Feed Mixed with Treat Gas",
      phase: "Mixed",
      temp: 310,
      pressure: 85.0,
      h2: 9500,
      h2s: 2100,
      nh3: 0,
      h2o: 0,
      co2: 0,
      massFlow: 165000,
      density: 780,
      pipeDiameter: 300,
      carbonSteel: "Y",
      crContent: 2.25,
      stress: "Y",
      hardness: "N",
      oxygen: "N",
      amineFlow: 0,
      amineType: "None",
      amineService: "Lean",
      hsas: 0,
      ph: 0,
      turbulence: "N",
      solids: "N",
      insulated: "Y",
      cuiMaterial: "CS",
      nh3Significant: "N",
      otherContamSignificant: "N",
      deltaT: 0,
      eroMaterial: "Carbon steel",
      description: "Middle distillate feed blended with recycle hydrogen gas. High temperature H2S/H2 corrosion."
    }
  ]
};

/**
 * Chromium Classification Helper
 */
function crClassification(cr, ninePctNote) {
  if (cr <= 0) return "Cr% not entered — enter alloy Cr% to assess scale resistance.";
  if (ninePctNote) {
    if (cr >= 9) return `Cr=${cr}% — substantial resistance expected (≥9Cr-1Mo level).`;
    if (cr >= 7) return `Cr=${cr}% — moderate resistance improvement (7–9% range).`;
    return `Cr=${cr}% — minimal benefit below ~7%; rate resembles carbon steel.`;
  } else {
    return `Cr=${cr}% entered — resistance increases with Cr content per §3.61.3b; 300 SS is highly resistant.`;
  }
}

/**
 * NH4HS Step-by-Step Justification Builder
 */
function buildNH4HSJustification(data, nh4hsKgHr, nh4hsWt, velocityMS, velocityFPS) {
  if (!(data.h2s > 0 && data.nh3 > 0)) {
    return `Not applicable: H₂S = ${data.h2s} kg/h, NH₃ = ${data.nh3} kg/h. NH4HS forms only when both H₂S and NH₃ are present (§3.5.3c).`;
  }
  if (data.h2o <= 0) {
    return `Not applicable: H₂S (${data.h2s} kg/h) and NH₃ (${data.nh3} kg/h) react to form ≈${nh4hsKgHr.toFixed(1)} kg/h NH4HS, but no water was entered. Per §3.5.3d, NH4HS salts are non-corrosive unless hydrated.`;
  }

  const lines = [];
  lines.push(`APPLICABLE: H₂S (${data.h2s} kg/h) and NH₃ (${data.nh3} kg/h) form ${nh4hsKgHr.toFixed(1)} kg/h NH4HS, hydrated by ${data.h2o} kg/h water to yield ${nh4hsWt.toFixed(2)} wt% aqueous concentration (§3.5.3).`);
  if (nh4hsWt > 2) {
    lines.push(`Concentration (${nh4hsWt.toFixed(2)} wt%) exceeds the 2 wt% severe threshold; accelerated wall thinning expected.`);
  } else {
    lines.push(`Concentration is below 2 wt% baseline threshold; monitoring required at high turbulence locations.`);
  }

  if (data.temp >= 50 && data.temp <= 65) {
    lines.push(`Operating at ${data.temp}°C within the 50–65°C precipitation band; localized solid salt deposition threat.`);
  } else if (data.temp > 65) {
    lines.push(`Operating at ${data.temp}°C (above 65°C); salts remain dissolved here, shifting fouling/corrosion risk downstream.`);
  }

  if (velocityMS > 0) {
    lines.push(`Flow velocity is ${velocityMS.toFixed(2)} m/s (${velocityFPS.toFixed(1)} fps) — wall shear stress accelerates mass transfer.`);
  }
  return lines.join(" ");
}

/**
 * Automatic Flow Velocity Calculator
 */
function calculateVelocity(options) {
  const flowKgHr = Number.isFinite(options.flowKgHr) ? options.flowKgHr : 0;
  const densityKgM3 = Number.isFinite(options.densityKgM3) ? options.densityKgM3 : 0;
  const pipeDiameterMm = Number.isFinite(options.pipeDiameterMm) ? options.pipeDiameterMm : 0;
  const manualVelocityMS = Number.isFinite(options.manualVelocityMS) ? options.manualVelocityMS : 0;

  if (flowKgHr > 0 && densityKgM3 > 0 && pipeDiameterMm > 0) {
    const massFlowKgSec = flowKgHr / 3600;
    const volumetricFlowM3Sec = massFlowKgSec / densityKgM3;
    const diameterM = pipeDiameterMm / 1000;
    const areaM2 = Math.PI * Math.pow(diameterM, 2) / 4;
    const velocityMS = volumetricFlowM3Sec / areaM2;
    const velocityFPS = velocityMS * 3.28084;
    return { velocityMS, velocityFPS, source: "AUTOMATIC — Flow + Density + Pipe ID", calculated: true };
  }

  if (manualVelocityMS > 0) {
    return {
      velocityMS: manualVelocityMS,
      velocityFPS: manualVelocityMS * 3.28084,
      source: "MANUAL — manual input override",
      calculated: false
    };
  }

  return { velocityMS: 0, velocityFPS: 0, source: "NOT AVAILABLE", calculated: false };
}

/**
 * Standalone Nelson Curve Boundary Mathematical Engine per API RP 941 (Figure 3-36-1)
 * @param {string} material - Nelson Curve Metallurgy enum
 * @param {number} ppH2 - Hydrogen partial pressure in psia
 * @returns {number} Limit temperature in °F
 */
function getNelsonCurveLimitTempF(material, ppH2) {
  if (material === "AUSTENITIC_SS" || ppH2 < 50) return 9999;

  switch (material) {
    case "CS_NON_PWHT":
      if (ppH2 <= 250) {
        return 500 - ((ppH2 - 50) / (250 - 50)) * (500 - 450);
      } else if (ppH2 <= 1000) {
        return 450 - ((ppH2 - 250) / (1000 - 250)) * (450 - 400);
      }
      return 400;

    case "CS_PWHT":
      if (ppH2 <= 220) return 590;
      if (ppH2 < 1500) return 590 - 108 * Math.log10(ppH2 / 220);
      return 500;

    case "C_05MO":
      return 500; // Conservative baseline per Annex A

    case "125CR_05MO":
      if (ppH2 <= 1750) return Math.max(550, 1050 - 325 * Math.log10(ppH2 / 50));
      return 550;

    case "225CR_1MO":
      if (ppH2 <= 2000) return Math.max(800, 1150 - 218 * Math.log10(ppH2 / 50));
      return 800;

    case "225CR_1MO_V":
      return 825;

    case "6CR_05MO":
      return 1100;

    default:
      return 400;
  }
}

/**
 * Full API 571 Damage Mechanism Screening Evaluation Engine
 */
function evaluateScreeningMatrix(input, dataset) {
  const normY = (v) => {
    const s = String(v || "").trim().toUpperCase();
    return s === "Y" || s === "YES" || s === "TRUE" || s === "1" ? "Y" : "N";
  };
  const num = (v) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  };

  const data = {
    stream: String(input.stream || input.streamName || "Unnamed Stream").trim(),
    phase: String(input.phase || "Mixed").trim().toUpperCase(),
    temp: num(input.temp || input.temperature),
    pressure: num(input.pressure) || 10,
    h2: num(input.h2),
    h2MolFrac: num(input.h2MolFrac),
    h2s: num(input.h2s),
    nh3: num(input.nh3),
    nh3Significant: normY(input.nh3Significant),
    otherContamSignificant: normY(input.otherContamSignificant),
    h2o: num(input.h2o),
    co2: num(input.co2),
    carbonSteel: normY(input.carbonSteel != null ? input.carbonSteel : "Y"),
    cr: num(input.cr || input.crContent),
    crContent: num(input.crContent || input.cr),
    stress: normY(input.stress != null ? input.stress : "Y"),
    nelsonMaterial: String(input.nelsonMaterial || (normY(input.carbonSteel != null ? input.carbonSteel : "Y") === "Y" ? (normY(input.stress != null ? input.stress : "Y") === "Y" ? "CS_NON_PWHT" : "CS_PWHT") : (num(input.cr || input.crContent) >= 2.0 ? "225CR_1MO" : (num(input.cr || input.crContent) >= 1.0 ? "125CR_05MO" : "CS_NON_PWHT")))),
    hardness: normY(input.hardness),
    oxygen: normY(input.oxygen),
    amineFlow: num(input.amineFlow),
    amineType: String(input.amineType || "None"),
    amineService: String(input.amineService || "Lean").trim().toUpperCase(),
    hsas: num(input.hsas),
    ph: num(input.ph),
    velocityFlow: num(input.velocityFlow || input.massFlow),
    velocityDensity: num(input.velocityDensity || input.density) || 850,
    pipeDiameter: num(input.pipeDiameter) || 250,
    manualVelocity: num(input.velocity || input.manualVelocity),
    turbulence: normY(input.turbulence),
    solids: normY(input.solids),
    insulated: normY(input.insulated != null ? input.insulated : "Y"),
    cuiMaterial: String(input.cuiMaterial || "CS").trim().toUpperCase(),
    eroMaterial: String(input.eroMaterial || "Carbon steel"),
    deltaT: num(input.deltaT),
    thermalLocation: String(input.thermalLocation || "MIX_POINT").trim().toUpperCase()
  };

  const liquidWater = data.phase === "LIQUID" || data.phase === "MIXED" || data.h2o > 0;

  // H2S ppmw in aqueous phase
  let h2sPPMW = 0;
  if (liquidWater && data.h2o > 0 && data.h2s > 0) {
    h2sPPMW = (data.h2s / (data.h2o + data.h2s)) * 1000000;
  }

  // NH4HS Stoichiometry
  const h2sMoles = data.h2s > 0 ? data.h2s / 34.08 : 0;
  const nh3Moles = data.nh3 > 0 ? data.nh3 / 17.03 : 0;
  const limitingMoles = (h2sMoles > 0 && nh3Moles > 0) ? Math.min(h2sMoles, nh3Moles) : 0;
  const nh4hsKgHr = limitingMoles * 51.11;
  const nh4hsWt = (data.h2o > 0 && nh4hsKgHr > 0) ? (nh4hsKgHr / (data.h2o + nh4hsKgHr)) * 100 : 0;

  let nh4hsTemperatureStatus = "";
  if (data.temp >= 50 && data.temp <= 65) {
    nh4hsTemperatureStatus = "Within the critical 50–65°C precipitation/deposition focus range.";
  } else if (data.temp > 65) {
    nh4hsTemperatureStatus = "Above 65°C; salts remain in solution, deposition risk shifts to downstream air coolers/cooling trains.";
  } else {
    nh4hsTemperatureStatus = "Below 50°C; check for deposition that may have occurred during upstream cooling.";
  }

  // Velocity calculation
  const velocityResult = calculateVelocity({
    flowKgHr: data.velocityFlow,
    densityKgM3: data.velocityDensity,
    pipeDiameterMm: data.pipeDiameter,
    manualVelocityMS: data.manualVelocity
  });
  const velocityMS = velocityResult.velocityMS;
  const velocityFPS = velocityResult.velocityFPS;

  // HTHA Thermodynamic Parameters (API RP 941)
  const pAbsKgCm2 = Number(data.pressure || 0) + 1.0332;
  let h2MolFrac = Number(data.h2MolFrac || 0);
  if (h2MolFrac <= 0 && data.h2 > 0) {
    const totalFlow = Number(data.velocityFlow || 0);
    const h2Flow = Number(data.h2 || 0);
    
    if (totalFlow > 0 && totalFlow > h2Flow) {
      const nH2 = h2Flow / 2.016;
      const nOther = (totalFlow - h2Flow) / 50.0;
      const totalMoles = nH2 + nOther;
      h2MolFrac = totalMoles > 0 ? Math.min(100, (nH2 / totalMoles) * 100) : 100.0;
    } else {
      // Pure hydrogen stream fallback (e.g. Treat gas recycle or total flow not populated)
      h2MolFrac = 100.0;
    }
  }
  const ppH2KgCm2a = pAbsKgCm2 * (h2MolFrac / 100.0);
  const ppH2Psia = ppH2KgCm2a * 14.2233;
  const tempF = (Number(data.temp || 0) * 1.8) + 32;

  let hthaTLimitF = null;
  let hthaMarginF = null;

  // CUI Range Check
  let cuiLower = -12;
  if (data.cuiMaterial === "300SS") cuiLower = 60;
  else if (data.cuiMaterial === "DUPLEX") cuiLower = 140;
  const cuiUpper = 175;
  const cuiTempWithinRange = data.temp >= cuiLower && data.temp <= cuiUpper;

  const results = [];
  function addResult(mechanism, applicable, status, basis, justification, inspection = "", category = "General", corrosionTabKey = null, severity = "HIGH") {
    results.push({
      mechanism,
      applicable: Boolean(applicable),
      status,
      basis,
      justification,
      inspection,
      category,
      corrosionTabKey,
      severity
    });
  }

  // 1. SULFIDATION — API 571 §3.61
  const sulfidation = data.h2 <= 0 && data.temp > 230 && data.h2s > 0;
  let sulfidationBasis = "";
  if (data.h2 > 0) sulfidationBasis = "H₂ present — evaluate high-temp H₂/H₂S (§3.35) separately.";
  else if (data.temp <= 230) sulfidationBasis = "Temperature is at or below the 230°C (450°F) onset threshold.";
  else if (data.h2s <= 0) sulfidationBasis = "No H₂S or reactive sulfur species entered.";
  else sulfidationBasis = "H₂-free sulfur-bearing hydrocarbon service above 230°C.";

  addResult(
    "Sulfidation (3.61)",
    sulfidation,
    sulfidation ? "APPLICABLE - ACTIVE THREAT" : "Not applicable",
    sulfidationBasis,
    `Temperature = ${data.temp}°C; H₂ = ${data.h2} kg/h; H₂S = ${data.h2s} kg/h. ` +
    (sulfidation ? `H₂-free sulfidic environment verified (§3.61.1) exceeding 230°C onset. ${crClassification(data.cr, false)}` : "High-temperature sulfur conditions not satisfied."),
    sulfidation ? "UT Thickness / Profile RT; Internal VT; High-temperature smart pigging; Low-Si CS thickness survey & API 578 PMI." : "",
    "High Temperature Degradation",
    "sulfidation",
    "HIGH"
  );

  // 2. H2/H2S CORROSION — API 571 §3.35
  const h2h2s = data.h2 > 0 && data.h2s > 0 && data.temp > 230;
  let h2h2sBasis = "";
  if (data.h2 <= 0) h2h2sBasis = "No H₂ present — evaluate 3.61 Sulfidation instead.";
  else if (data.h2s <= 0) h2h2sBasis = "No H₂S present.";
  else if (data.temp <= 230) h2h2sBasis = "Temperature is at or below the 230°C (450°F) Couper-Gorman onset.";
  else h2h2sBasis = "Simultaneous H₂ + H₂S present in hot process stream exceeding 230°C.";

  addResult(
    "H₂/H₂S Corrosion (3.35)",
    h2h2s,
    h2h2s ? "APPLICABLE - ACTIVE THREAT" : "Not applicable",
    h2h2sBasis,
    `Temperature = ${data.temp}°C; H₂ = ${data.h2} kg/h; H₂S = ${data.h2s} kg/h. ` +
    (h2h2s ? `Couper-Gorman curves applicable. ${crClassification(data.cr, true)}` : "Operating conditions below onset envelope."),
    h2h2s ? "Automated UT Scanning / Profile RT; Internal VT; Tube-Skin Thermocouples / IR thermography." : "",
    "High Temperature Degradation",
    null,
    "HIGH"
  );

  // 3. HTHA — API 571 §3.36 / API RP 941 Nelson Curves
  const hasH2 = (data.h2MolFrac > 0 || data.h2 > 0);
  const hthaActiveEnvelope = hasH2 && ppH2Psia >= 50 && data.temp >= 204 && data.nelsonMaterial !== "AUSTENITIC_SS";

  let hthaApplicable = false;
  let hthaSeverity = "LOW";
  let hthaStatus = "NOT APPLICABLE";
  let hthaBasis = "Operating envelope is safely below HTHA thresholds (ppH2 < 50 psia, Temp < 204°C, or immune metallurgy).";

  if (hthaActiveEnvelope) {
    const tLimitF = getNelsonCurveLimitTempF(data.nelsonMaterial, ppH2Psia);
    const marginF = tLimitF - tempF;
    hthaTLimitF = Number(tLimitF.toFixed(1));
    hthaMarginF = Number(marginF.toFixed(1));

    if (tempF >= tLimitF) {
      hthaApplicable = true;
      hthaSeverity = "CRITICAL";
      hthaStatus = "APPLICABLE - ACTIVE THREAT";
      hthaBasis = `Operating temperature (${data.temp}°C / ${tempF.toFixed(1)}°F) and ppH2 (${ppH2Psia.toFixed(1)} psia) EXCEED the API RP 941 limit (${tLimitF.toFixed(1)}°F) for ${data.nelsonMaterial}.`;
    } else if (tempF >= (tLimitF - 50)) {
      hthaApplicable = true;
      hthaSeverity = "MEDIUM";
      hthaStatus = "CONDITIONAL - 50°F SAFETY BUFFER ALERT";
      hthaBasis = `Operating within 50°F (28°C) buffer zone below the Nelson curve. Historical temperature excursions can cause incubation damage.`;
    } else {
      hthaApplicable = false;
      hthaSeverity = "LOW";
      hthaStatus = "NOT APPLICABLE (SAFE OPERATING REGIME)";
      hthaBasis = `Operating safely below API RP 941 curve limit by ${marginF.toFixed(1)}°F.`;
    }
  }

  addResult(
    "High-Temperature Hydrogen Attack - HTHA (3.36)",
    hthaApplicable,
    hthaStatus,
    hthaBasis,
    "Evaluated against exact API RP 941 8th/9th edition Nelson Curve limit equations.",
    hthaApplicable ? "Advanced Ultrasonic Backscatter Technique (AUBT); TOFD; Phased Array UT (PAUT); In-situ Field Metallographic Replication (FMR)." : "",
    "High Temperature Degradation",
    null,
    hthaSeverity
  );

  // 4. High-Temperature Oxidation (§3.48)
  {
    const tempC = Number(data.temp || 0);
    const tempF = (tempC * 1.8) + 32;
    const oxygenPresent = (data.oxygen === "Y" || data.phase === "VAPOR");
    const hasWaterVapor = (Number(data.h2o || 0) > 0 && (data.phase === "VAPOR" || data.phase === "MIXED"));
    const cr = Number(data.crContent ?? data.cr ?? 0);

    // Metallurgy Classification
    const mat = data.eroMaterial || "";
    const isStainless = (mat === "316 SS" || data.cuiMaterial === "300SS" || (data.carbonSteel === "N" && cr >= 16));
    const isNickelAlloy = (mat === "Alloy C-276" || mat === "Alloy 400");
    const isCarbonSteel = (data.carbonSteel === "Y" && cr < 1.0);

    // Temperature Thresholds for Oxidation Scaling per API 571 Table 3-48-1a/b
    let tThresholdC = 538; // Default CS: 1000°F (538°C)
    let alloyLabel = "Carbon Steel";

    if (isStainless || isNickelAlloy) {
      tThresholdC = 815; // 300 SS: 1500°F (815°C)
      alloyLabel = isStainless ? "Austenitic Stainless Steel (300 SS)" : "Nickel-based Alloy";
    } else if (cr >= 9.0) {
      tThresholdC = 650; // 9Cr-1Mo: ~1200°F (650°C)
      alloyLabel = "9Cr-1Mo Steel";
    } else if (cr >= 5.0) {
      tThresholdC = 620; // 5Cr-0.5Mo: ~1150°F (620°C)
      alloyLabel = "5Cr-0.5Mo Steel";
    } else if (cr >= 2.0) {
      tThresholdC = 590; // 2.25Cr-1Mo: ~1100°F (590°C)
      alloyLabel = "2.25Cr-1Mo Steel";
    } else if (cr >= 1.0) {
      tThresholdC = 565; // 1.25Cr-0.5Mo: ~1050°F (565°C)
      alloyLabel = "1.25Cr-0.5Mo Steel";
    }

    let oxApplicable = false;
    let oxStatus = "NOT APPLICABLE";
    let oxSeverity = "LOW";
    let oxBasis = `Operating temperature (${tempC}°C) is below scaling threshold (${tThresholdC}°C) for ${alloyLabel}.`;
    let oxInspection = "";

    if (oxygenPresent && tempC >= tThresholdC) {
      oxApplicable = true;
      const overtemp = tempC - tThresholdC;
      oxSeverity = (overtemp >= 50) ? "CRITICAL" : "HIGH";
      oxStatus = "APPLICABLE - ACTIVE THREAT";
      
      let moistureAlert = hasWaterVapor ? " Presence of water vapor significantly accelerates scaling and metal loss rates (§3.48.3d)." : "";
      oxBasis = `Operating temperature (${tempC}°C / ${tempF.toFixed(0)}°F) exceeds scaling temperature threshold (${tThresholdC}°C) for ${alloyLabel} in oxygen-containing vapor.${moistureAlert}`;
      oxInspection = "Visual Inspection (VT) for external scaling/blistering, Profile Radiography (PRT), High-temperature Ultrasonic Thickness (UT) gauging on heater/boiler tubes, Laser profilometry for tube bulging/sagging.";
    } else if (oxygenPresent && tempC >= (tThresholdC - 30)) {
      oxApplicable = true;
      oxStatus = "CONDITIONAL - NEAR SCALING THRESHOLD";
      oxSeverity = "MEDIUM";
      oxBasis = `Operating within 30°C of the oxidation scaling limit (${tThresholdC}°C) for ${alloyLabel}. Temperature excursions or localized hot spots can trigger rapid scale formation.`;
      oxInspection = "Infrared (IR) Thermography tube skin temperature scanning to detect burner impingement/hot spots.";
    }

    addResult(
      "High-Temperature Oxidation (3.48)",
      oxApplicable,
      oxStatus,
      oxBasis,
      "Evaluated per API 571 Section 3.48 (Cr content protective scaling boundaries, metal skin temperature, and water vapor acceleration).",
      oxInspection,
      "High Temperature Degradation",
      null,
      oxSeverity
    );
  }

  // 5. SOUR WATER CORROSION — ACIDIC — API 571 §3.58
  const sourWaterPhaseGate = liquidWater;
  const sourWaterH2SGate = data.h2s > 0;
  const sourWaterMaterialGate = data.carbonSteel === "Y";
  const significantNH3 = data.nh3Significant === "Y";
  const significantOtherContam = data.otherContamSignificant === "Y";
  const sourWaterOutOfScope = significantNH3 || significantOtherContam;
  const sourWater = sourWaterPhaseGate && sourWaterH2SGate && sourWaterMaterialGate && !sourWaterOutOfScope;
  let sourWaterBasis = "";
  if (!sourWaterPhaseGate) sourWaterBasis = "No liquid water phase confirmed. Check downstream condensation.";
  else if (!sourWaterH2SGate) sourWaterBasis = "No H₂S present.";
  else if (!sourWaterMaterialGate) sourWaterBasis = "Carbon-steel construction gate not met.";
  else if (significantNH3) sourWaterBasis = "Significant NH₃ present (§3.58.1b scope exclusion); evaluate §3.5 NH4HS instead.";
  else if (significantOtherContam) sourWaterBasis = "Significant chlorides/cyanides present (§3.58.1b exclusion); evaluate HCl / cyanide mechanisms.";
  else sourWaterBasis = `Acidic sour water environment on carbon steel (pH ${data.ph > 0 ? data.ph : "unbuffered"}).`;

  addResult(
    "Sour Water Corrosion — Acidic (3.58)",
    sourWater,
    sourWater ? "APPLICABLE - ACTIVE THREAT" : "Not applicable",
    sourWaterBasis,
    `Phase = ${data.phase}; H₂S = ${data.h2s} kg/h; NH₃ = ${data.nh3} kg/h; pH = ${data.ph || "unmeasured"}. ` +
    (sourWater ? "Forms thin semi-protective FeS scale; breakdown leads to uniform and localized attack." : "Acidic sour water criteria not satisfied."),
    sourWater ? "UT Thickness Grids / Profile RT; Permanently mounted ultrasonic sensors; Corrosion coupons / ER probes." : "",
    "Aqueous & Acid Thinning",
    "Acid Sour Water Corrosion",
    "HIGH"
  );

  // 6. NH4HS CORROSION — API 571 §3.5
  const nh4hsFormation = data.h2s > 0 && data.nh3 > 0;
  const nh4hs = nh4hsFormation && data.h2o > 0;
  let nh4hsBasis = "";
  if (!nh4hsFormation) nh4hsBasis = "Requires both H₂S and NH₃ to synthesize NH4HS salts.";
  else if (data.h2o <= 0) nh4hsBasis = "Dry salts are non-corrosive (§3.5.3d); enter water to evaluate hydrated corrosion.";
  else nh4hsBasis = `Hydrated NH4HS solution confirmed (${nh4hsWt.toFixed(2)} wt%). ${nh4hsTemperatureStatus}`;

  addResult(
    "NH4HS Alkaline Sour Water Corrosion (3.5)",
    nh4hs,
    nh4hs ? "APPLICABLE - ACTIVE THREAT" : "Not applicable",
    nh4hsBasis,
    buildNH4HSJustification(data, nh4hsKgHr, nh4hsWt, velocityMS, velocityFPS),
    nh4hs ? "UT Scanning & Profile RT at high-shear points, downstream elbows, wash water tees; GWT screening; IRIS tube inspection." : "",
    "Aqueous & Acid Thinning",
    "Alkaline Sour Water Corrosion",
    nh4hsWt > 2 || velocityMS > 6 ? "CRITICAL" : "MODERATE"
  );

  // 7. NH4Cl CORROSION — API 571 §3.4
  const nh4cl = data.nh3 > 0 && (data.otherContamSignificant === "Y" || (data.temp >= 110 && data.temp <= 185));
  addResult(
    "Ammonium Chloride (NH4Cl) Salt Corrosion (3.4)",
    nh4cl,
    nh4cl ? "APPLICABLE - ACTIVE THREAT" : "Not applicable",
    nh4cl ? "NH₃ and chloride species present within 110–185°C salt sublimation window." : "Conditions outside NH4Cl deposition band.",
    nh4cl ? `Temperature = ${data.temp}°C; NH₃ = ${data.nh3} kg/h. Hygroscopic NH4Cl salts deposit directly from vapor phase, absorbing trace water to create highly corrosive acidic salt cakes.` : "Salt sublimation conditions not met.",
    nh4cl ? "Profile RT to identify salt cake deposition in dead-legs & exchanger inlets; High-resolution UT under deposits." : "",
    "Aqueous & Acid Thinning",
    null,
    "HIGH"
  );

  // 8. Hydrochloric Acid (HCl) Corrosion (§3.37)
  {
    const liquidWater = (data.phase === "LIQUID" || data.phase === "MIXED" || Number(data.h2o || 0) > 0);
    const dewPointRegime = (Number(data.temp || 0) <= 135 && liquidWater); // Overhead condensation envelope
    const chloridesPresent = (data.otherContamSignificant === "Y");
    const measuredPh = Number(data.ph || 0);
    const isAcidic = (measuredPh > 0 && measuredPh < 4.5);
    const unmeasuredAcidRisk = (measuredPh === 0 && (chloridesPresent || data.nh3 > 0)); // salt hydrolysis risk

    // Metallurgy classification based on existing selections
    const mat = data.eroMaterial || "";
    const isTitanium = (mat === "Titanium");
    const isAlloy400 = (mat === "Alloy 400");
    const isStainless = (mat === "316 SS" || data.cuiMaterial === "300SS" || (data.carbonSteel === "N" && !isTitanium && !isAlloy400));
    const isCarbonSteel = (data.carbonSteel === "Y");

    let hclApplicable = false;
    let hclStatus = "NOT APPLICABLE";
    let hclSeverity = "LOW";
    let hclBasis = "Chlorides absent or operating above aqueous condensation regime.";
    let hclInspection = "";

    if (chloridesPresent && (liquidWater || dewPointRegime || (isTitanium && data.phase === "VAPOR"))) {
      if (isCarbonSteel) {
        if (isAcidic || dewPointRegime) {
          hclApplicable = true;
          hclSeverity = isAcidic ? "CRITICAL" : "HIGH";
          hclStatus = "APPLICABLE - ACTIVE THREAT";
          hclBasis = `Carbon steel exposed to condensing aqueous HCl (pH: ${measuredPh > 0 ? measuredPh : 'Unbuffered / Low'}, Temp: ${data.temp}°C). Rapid general and localized pitting attack.`;
          hclInspection = "Profile Radiography (PRT), Ultrasonic Thickness Scanning (AUT/UT grid) at water wash injection points, overhead piping elbows, and accumulator boots.";
        }
      } else if (isStainless) {
        // 300/400 SS are NOT usefully resistant to HCl at any concentration/temp (§3.37.3e)
        hclApplicable = true;
        hclSeverity = "CRITICAL";
        hclStatus = "APPLICABLE - HIGH ALLOY VULNERABILITY";
        hclBasis = "Stainless steel is NOT resistant to aqueous HCl at any concentration/temperature; susceptible to rapid pitting and Cl-SCC.";
        hclInspection = "Eddy Current Testing (ECT), Internal Borescope, Dye Penetrant (PT), High-frequency UT.";
      } else if (isAlloy400) {
        // Resistant to dilute HCl, but sensitive to oxidizing species (§3.37.3g)
        if (data.oxygen === "Y") {
          hclApplicable = true;
          hclSeverity = "HIGH";
          hclStatus = "CONDITIONAL - OXIDIZING SPECIES ALERT";
          hclBasis = "Alloy 400 is resistant to dilute HCl, but corrosion rates accelerate drastically in the presence of oxygen/oxidizing agents (§3.37.3g).";
          hclInspection = "UT thickness gauging, corrosion probes, monitoring of dissolved O2 ingress.";
        } else {
          hclApplicable = false;
          hclStatus = "NOT APPLICABLE (ALLOY 400 RESISTANT)";
          hclSeverity = "LOW";
          hclBasis = "Alloy 400 provides excellent resistance to non-oxidizing dilute hydrochloric acid.";
        }
      } else if (isTitanium) {
        // Titanium excels in aqueous/oxidizing HCl but fails if dry (§3.37.3g)
        if (!liquidWater && data.phase === "VAPOR") {
          hclApplicable = true;
          hclSeverity = "CRITICAL";
          hclStatus = "APPLICABLE - DRY HCL IGNITION/ATTACK";
          hclBasis = "Titanium fails rapidly and can ignite/corrode catastrophically in dry HCl vapor service without sufficient moisture (§3.37.3g).";
          hclInspection = "Moisture analyzers, internal VT, specialized acoustic emission.";
        } else {
          hclApplicable = false;
          hclStatus = "NOT APPLICABLE (TITANIUM RESISTANT)";
          hclSeverity = "LOW";
          hclBasis = "Titanium possesses superior passivity in wet/condensing aqueous hydrochloric acid.";
        }
      }
    }

    addResult(
      "Hydrochloric Acid (HCl) Corrosion (3.37)",
      hclApplicable,
      hclStatus,
      hclBasis,
      "Evaluated per API 571 Section 3.37 (Dew point condensation, pH < 4.5 threshold, and alloy-specific resistance boundaries).",
      hclInspection,
      "Aqueous & Acid Thinning",
      null,
      hclSeverity
    );
  }

  // 9. CO2 CORROSION — API 571 §3.18
  const co2Corrosion = data.co2 > 0 && liquidWater && data.carbonSteel === "Y";
  addResult(
    "Carbon Dioxide (CO₂) Sweet Corrosion (3.18)",
    co2Corrosion,
    co2Corrosion ? "APPLICABLE - ACTIVE THREAT" : "Not applicable",
    co2Corrosion ? "Dissolved CO₂ in aqueous condensate forming carbonic acid (H₂CO₃) on carbon steel." : "No CO₂ / liquid water contact on carbon steel.",
    co2Corrosion ? `CO₂ = ${data.co2} kg/h. Carbonic acid promotes mesa-type localized pitting and uniform thinning.` : "Sweet corrosion criteria not satisfied.",
    co2Corrosion ? "Automated UT grid scans; High-resolution profile radiography; Flush-mounted ER probes." : "",
    "Aqueous & Acid Thinning",
    "co2",
    "MODERATE"
  );

  // 10. WET H2S — BLISTERING & HIC — API 571 §3.67
  const wetH2SGate = data.carbonSteel === "Y" && liquidWater && data.h2s > 0 && h2sPPMW >= 1;
  addResult(
    "Wet H₂S — Hydrogen Blistering & HIC (3.67)",
    wetH2SGate,
    wetH2SGate ? "APPLICABLE - ACTIVE THREAT" : "Not applicable",
    wetH2SGate ? "Aqueous H₂S ≥ 1 ppmw on carbon steel creates atomic hydrogen charging." : "Hydrogen charging threshold (≥1 ppmw H₂S in water) not satisfied.",
    `H₂S in water ≈ ${h2sPPMW.toFixed(1)} ppmw; Phase = ${data.phase}. ` + (wetH2SGate ? "Atomic hydrogen diffuses to internal inclusions, recombining into molecular H₂ gas causing lamina blistering/HIC (does not require tensile stress)." : "Wet H₂S criteria not met."),
    wetH2SGate ? "Internal VT for blistering; WFMT / ECT / ACFM (PT unreliable); Angle-beam UT (SWUT / PAUT) for planar sizing." : "",
    "Environmental Cracking",
    null,
    "HIGH"
  );

  // 11. WET H2S — SOHIC — API 571 §3.67
  const sohic = wetH2SGate && data.stress === "Y" && data.hardness !== "Y";
  addResult(
    "Wet H₂S — SOHIC (3.67)",
    sohic,
    sohic ? "APPLICABLE - ACTIVE THREAT" : (wetH2SGate ? "SCREEN FURTHER - VERIFY STRESS" : "Not applicable"),
    sohic ? "Wet H₂S charging + residual/applied tensile stress on normal hardness steel." : "Requires wet H₂S conditions and un-relieved tensile stresses.",
    `Wet H₂S gate = ${wetH2SGate ? "MET" : "NOT MET"}; Residual/Tensile Stress = ${data.stress}. ` + (sohic ? "Hydrogen cracks stack in through-thickness orientation perpendicular to tensile stress field." : "SOHIC criteria not complete."),
    sohic ? "WFMT / ACFM at weld seams & nozzle knuckles; Angle-beam PAUT for through-thickness crack sizing." : "",
    "Environmental Cracking",
    null,
    "HIGH"
  );

  // 12. WET H2S — SSC — API 571 §3.67
  const ssc = wetH2SGate && data.stress === "Y" && data.hardness === "Y";
  addResult(
    "Wet H₂S — Sulfide Stress Cracking - SSC (3.67)",
    ssc,
    ssc ? "APPLICABLE - CRITICAL RISK" : (wetH2SGate ? "SCREEN FURTHER - VERIFY HARDNESS" : "Not applicable"),
    ssc ? "Wet H₂S + tensile stress + high weld/base metal hardness (>237 HB / NACE MR0175)." : "SSC requires high hardness (>237 HB) and tensile stress in sour water.",
    `Hardness > 237 HB = ${data.hardness}; Stress = ${data.stress}; Temp = ${data.temp}°C. ` + (ssc ? "Brittle catastrophic cracking can propagate within hours/days of sour water contact." : "Hardness criteria not confirmed."),
    ssc ? "Wet Fluorescent MT (WFMT) on ID surfaces; Field Hardness Testing (HT); Angle-Beam PAUT." : "",
    "Environmental Cracking",
    null,
    "CRITICAL"
  );

  // 13. AMINE CORROSION — API 571 §3.2
  const aminePresent = data.amineFlow > 0;
  const amineCorrosion = aminePresent && data.carbonSteel === "Y";
  addResult(
    "Amine Corrosion (3.2)",
    amineCorrosion,
    amineCorrosion ? "APPLICABLE - ACTIVE THREAT" : "Not applicable",
    amineCorrosion ? `Carbon steel in ${data.amineType || "amine"} ${data.amineService ? data.amineService.toLowerCase() : ""} service.` : "No amine service indicated on carbon steel.",
    `Amine Flow = ${data.amineFlow} kg/h; Service = ${data.amineService}; HSAS = ${data.hsas}%. ` + (amineCorrosion ? "Corrosion arises from dissolved acid gases (CO₂/H₂S), HSAS (>2%), and degradation products." : "Amine conditions not met."),
    amineCorrosion ? "Visual Inspection with Pit Gauge; Automated UT scanning at impingement zones; Rich-amine flow velocity surveys." : "",
    "Aqueous & Acid Thinning",
    null,
    "MODERATE"
  );

  // 14. AMINE SCC — API 571 §3.3
  const amineSCC = aminePresent && data.carbonSteel === "Y" && data.stress === "Y";
  addResult(
    "Amine Stress Corrosion Cracking (3.3)",
    amineSCC,
    amineSCC ? "APPLICABLE - ACTIVE THREAT" : "Not applicable",
    amineSCC ? `Alkanolamine solution on non-PWHT carbon steel with residual tensile stress (§3.3.1).` : "Requires amine, carbon steel, and residual tensile stresses.",
    `Amine Service = ${data.amineService}; Amine Type = ${data.amineType || "DEA/MDEA"}; Stress = ${data.stress}. ` + (amineSCC ? "Lean amine systems lack protective sulfide scale and are most prone to cracking even at ambient temperature." : "Amine SCC criteria not complete."),
    amineSCC ? "WFMT / ACFM on un-PWHT weld seams, heat-affected zones, and cold-worked elbows; PAUT." : "",
    "Environmental Cracking",
    null,
    "HIGH"
  );

  // 15. CUI — API 571 §3.22
  const cui = data.insulated === "Y" && cuiTempWithinRange;
  addResult(
    "Corrosion Under Insulation - CUI (3.22)",
    cui,
    cui ? "APPLICABLE - ACTIVE THREAT" : (data.insulated === "Y" ? "LOW PRIORITY - OUTSIDE PEAK BAND" : "Not applicable"),
    cui ? `Insulated equipment operating within ${cuiLower}–${cuiUpper}°C moisture retention window (§3.22.3a).` : (data.insulated === "Y" ? `Insulated, but operating temperature (${data.temp}°C) is outside peak CUI range.` : "Equipment is un-insulated."),
    `Insulated = ${data.insulated}; Temp = ${data.temp}°C; Material = ${data.cuiMaterial}. ` + (cui ? "Water ingress into lagging creates prolonged surface wetting and rapid external thinning / pitting." : "CUI criteria not active."),
    cui ? "External Visual Inspection (VT) of weatherproofing; Insulation stripping + UT/Pit gauge; Pulsed Eddy Current (PEC) & Profile RT." : "",
    "External & CUI",
    "cui",
    "HIGH"
  );

  // 16. EROSION / EROSION-CORROSION — API 571 §3.27
  const erosion = data.turbulence === "Y" || data.solids === "Y" || velocityMS > 5.0;
  let eroRateText = "";
  const eroRow = dataset.erosionTable?.[data.eroMaterial];
  if (eroRow) {
    const bucket = velocityFPS <= 2.5 ? "fps1" : (velocityFPS <= 15 ? "fps4" : "fps27");
    const rate = eroRow[bucket];
    if (rate !== null && rate !== undefined) {
      eroRateText = ` Table 3-27-1 benchmark rate for ${data.eroMaterial} = ${rate} mpy.`;
    }
  }

  addResult(
    "Erosion / Erosion-Corrosion (3.27)",
    erosion,
    erosion ? "APPLICABLE - SCREEN FURTHER" : "Low priority",
    erosion ? "High velocity, flow turbulence, or entrained particulates/catalyst fines flagged." : "No severe velocity or particulate turbulence entered.",
    `Calculated Velocity = ${velocityMS.toFixed(2)} m/s (${velocityFPS.toFixed(1)} fps); Turbulence = ${data.turbulence}; Solids = ${data.solids}.${eroRateText}`,
    erosion ? "High-density UT grids and profile radiography at elbows, reducers, tees, and control valve discharge nozzles; GWT screening." : "",
    "Flow, Velocity & Erosion",
    null,
    "HIGH"
  );

  // 17. Thermal Fatigue (§3.64)
  const deltaT = Number(data.deltaT || 0);
  const serviceType = data.thermalLocation || "MIX_POINT";
  const isTurbulent = data.turbulence === "Y";

  let tfApplicable = false;
  let tfStatus = "NOT APPLICABLE";
  let tfSeverity = "LOW";
  let tfBasis = "Thermal cycling magnitude |ΔT| is below initiation threshold.";
  let tfInspection = "";

  if (serviceType === "MIX_POINT") {
    if (deltaT >= 110) {
      tfApplicable = true;
      tfStatus = "APPLICABLE - ACTIVE THREAT";
      tfSeverity = "CRITICAL";
      tfBasis = `Severe mix point temperature difference (|ΔT| = ${deltaT}°C ≥ 110°C / 200°F). High risk of rapid thermal fatigue cracking.`;
      tfInspection = "Angle-beam UT (shear wave), Phased Array UT (PAUT), PT on ID surface, profile RT for internal thermal sleeve integrity.";
    } else if (deltaT >= 28 || (deltaT > 15 && isTurbulent)) {
      tfApplicable = true;
      tfStatus = "CONDITIONAL - THERMAL STRIPING ALERT";
      tfSeverity = "MEDIUM";
      tfBasis = `Mixing point |ΔT| = ${deltaT}°C exceeds 28°C (50°F) threshold. Susceptible to turbulent thermal striping at mixing zone.`;
      tfInspection = "Surface PT/MT at weld toes, external shear wave UT screening downstream of mixing tee (up to 5-10D).";
    }
  } else if (serviceType === "COKE_DRUM") {
    if (deltaT >= 110) {
      tfApplicable = true;
      tfStatus = "APPLICABLE - ACTIVE THREAT";
      tfSeverity = "CRITICAL";
      tfBasis = `Coke drum quenching cycle (|ΔT| = ${deltaT}°C ≥ 110°C). Severe cyclic stresses at skirt-to-shell attachment weld and shell bulging zones.`;
      tfInspection = "Angle-beam UT, TOFD, Wet Fluorescent MT (WFMT) on skirt attachment weld, laser profilometry for bulging.";
    }
  } else {
    // TUBE_ATTACHMENT / GENERAL_CYCLIC
    if (deltaT >= 110) {
      tfApplicable = true;
      tfStatus = "APPLICABLE - ACTIVE THREAT";
      tfSeverity = "HIGH";
      tfBasis = `Thermal swing |ΔT| = ${deltaT}°C exceeds rule-of-thumb limit (110°C to 165°C / 200°F to 300°F) with constrained expansion.`;
      tfInspection = "Visual inspection for weld toe cracking, PT/WFMT, High-temperature thickness & strain monitoring.";
    }
  }

  addResult(
    "Thermal Fatigue (3.64)",
    tfApplicable,
    tfStatus,
    tfBasis,
    "Evaluated per API 571 Section 3.64 (Magnitude of temperature swing, mixing geometry, and cyclic differential expansion constraints).",
    tfInspection,
    "High Temperature Degradation / Cracking",
    null,
    tfSeverity
  );

  // Summary Metrics
  const applicableList = results.filter(r => r.applicable);
  const applicableCount = applicableList.length;
  const conditionalCount = results.filter(r => !r.applicable && r.status.includes("SCREEN FURTHER")).length;
  const notApplicableCount = results.length - applicableCount - conditionalCount;
  let dominantThreat = "None Flagged";
  if (applicableList.length > 0) {
    dominantThreat = applicableList.find(r => r.severity === "CRITICAL")?.mechanism || applicableList[0].mechanism;
  }

  return {
    success: true,
    stream: data.stream,
    input: data,
    calculatedParameters: {
      h2sPPMW,
      nh4hsKgHr,
      nh4hsWt,
      velocityMS,
      velocityFPS,
      velocitySource: velocityResult.source,
      velocityFlow: data.velocityFlow,
      velocityDensity: data.velocityDensity,
      pipeDiameter: data.pipeDiameter,
      cuiLower,
      cuiUpper,
      nh4hsTemperatureStatus,
      nh3: data.nh3,
      nh3Significant: data.nh3Significant,
      otherContamSignificant: data.otherContamSignificant,
      ph: data.ph,
      pressure: data.pressure,
      deltaT: data.deltaT,
      co2: data.co2,
      ppH2Psia: Number(ppH2Psia.toFixed(2)),
      ppH2KgCm2a: Number(ppH2KgCm2a.toFixed(2)),
      tempF: Number(tempF.toFixed(1)),
      hthaTLimitF,
      hthaMarginF,
      nelsonMaterial: data.nelsonMaterial,
      h2MolFrac: Number(h2MolFrac.toFixed(2))
    },
    kpis: {
      total: results.length,
      applicable: applicableCount,
      conditional: conditionalCount,
      notApplicable: notApplicableCount,
      dominantThreat
    },
    results
  };
}

// Helper to parse Firestore cloud datasets into normalized Unit & Stream records
function parseCloudDataset(docData, docId) {
  const title = (docData.title || "").trim();
  const rawUnit = (docData.unit && docData.unit !== "kg/hr" ? docData.unit : "").trim();
  
  // Extract primary unit symbol (e.g. "RPTU" from "RPTU Stream & Component Data", "WHFU" from "WHFU")
  let unitId = rawUnit;
  if (!unitId) {
    if (title.toUpperCase().includes("RPTU")) unitId = "RPTU";
    else if (title.toUpperCase().includes("WHFU")) unitId = "WHFU";
    else if (title.toUpperCase().includes("CDU")) unitId = "CDU";
    else if (title.toUpperCase().includes("VDU")) unitId = "VDU";
    else if (title.toUpperCase().includes("H2U")) unitId = "H2U";
    else if (title.toUpperCase().includes("MSP")) unitId = "MSP";
    else {
      // Use first word or docId
      unitId = title.split(" ")[0] || docId;
    }
  }
  unitId = unitId.toUpperCase();

  const streams = Array.isArray(docData.streams) ? docData.streams : [];
  let unitName = title || unitId;
  if (unitId === "RPTU") {
    unitName = "RPTU - Residue Petrochemical Thermal Unit";
  } else if (unitId === "WHFU") {
    unitName = "WHFU - Waste Heat & Fractionation Unit";
  }

  return {
    docId,
    unitId,
    unitName,
    title: title || unitName,
    streamCount: streams.length,
    streams,
    source: "cloud_firestore"
  };
}

// Convert a single raw stream from Firestore dataset to a clean format
function normalizeStreamRecord(st, index) {
  const p = st.properties || {};
  const c = st.components || {};

  const streamNo = String(st.streamNo || st.id || index + 1).trim();
  const content = String(st.content || st.streamName || `Process Stream ${streamNo}`).trim();
  const name = `Stream ${streamNo} - ${content}`;

  let temp = st.tempC;
  if (temp === undefined || temp === null || temp === "") {
    temp = p["Temperature (°C)"] || p["Temperature"] || st.temp || 40;
  }
  temp = parseFloat(temp);
  if (!Number.isFinite(temp)) temp = 40;

  let pressure = st.pressKgCm2;
  if (pressure === undefined || pressure === null || pressure === "") {
    pressure = p["Pressure (kg/cm²g)"] || p["Pressure (kg/cm2 (g))"] || p["Pressure (barg)"] || p["Pressure"] || st.pressure || 10;
  }
  pressure = parseFloat(pressure);
  if (!Number.isFinite(pressure)) pressure = 10;

  let massFlow = st.massFlow;
  if (massFlow === undefined || massFlow === null || massFlow === "") {
    massFlow = p["Flow Mass (kg/hr)"] || p["Mass Flow (kg/hr)"] || 0;
  }
  massFlow = parseFloat(massFlow);
  if (!Number.isFinite(massFlow)) massFlow = 0;

  let density = st.liquidDensity || st.vaporDensity || st.density;
  if (density === undefined || density === null || density === "") {
    density = p["Liquid Density (kg/m3)"] || p["Vapor Density (kg/m3)"] || 850;
  }
  density = parseFloat(density);
  if (!Number.isFinite(density) || density <= 0) density = 850;

  let phase = p["Phase"] || st.phase;
  if (!phase) {
    const up = content.toUpperCase();
    const wtVap = parseFloat(p["Wt% Vaporized (%)"]);
    if (Number.isFinite(wtVap)) {
      phase = wtVap >= 99 ? "Vapor" : (wtVap <= 1 ? "Liquid" : "Mixed");
    } else if (up.includes("VAP") || up.includes("GAS") || up.includes("OVERHEAD")) {
      phase = "Vapor";
    } else if (up.includes("LIQ") || up.includes("FEED") || up.includes("OIL") || up.includes("WATER") || up.includes("BOTTOM")) {
      phase = "Liquid";
    } else {
      phase = "Mixed";
    }
  }

  // Extract component fractions (kg/hr)
  const h2 = parseFloat(c["H2"] || c["Hydrogen"] || 0) || 0;
  const h2s = parseFloat(c["H2S"] || c["Hydrogen Sulfide"] || 0) || 0;
  const nh3 = parseFloat(c["NH3"] || c["Ammonia"] || 0) || 0;
  const h2o = parseFloat(c["H2O"] || c["Water"] || c["Steam"] || 0) || 0;
  const co2 = parseFloat(c["CO2"] || c["Carbon Dioxide"] || 0) || 0;
  const amine = parseFloat(c["MDEA"] || c["DEA"] || c["MEA"] || c["Amine"] || 0) || 0;

  // Calculate pipe internal diameter from flow velocity
  let pipeDiameter = 250;
  if (massFlow > 0 && density > 0) {
    const targetV = phase === "Vapor" ? 18.0 : (phase === "Liquid" ? 1.8 : 8.0);
    const qM3s = (massFlow / 3600) / density;
    const dM = Math.sqrt((4 * qM3s) / (Math.PI * targetV));
    pipeDiameter = Math.max(50, Math.min(1000, Math.round((dM * 1000) / 25) * 25));
  }

  return {
    id: streamNo,
    streamNo,
    name,
    streamName: name,
    content,
    phase,
    temp,
    pressure,
    massFlow,
    density,
    pipeDiameter,
    h2,
    h2s,
    nh3,
    h2o,
    co2,
    amineFlow: amine,
    amineType: amine > 0 ? "MDEA" : "None",
    amineService: h2s > 10 ? "Rich" : "Lean",
    carbonSteel: "Y",
    crContent: temp > 260 ? 1.25 : 0,
    stress: "Y",
    hardness: (phase === "Vapor" && h2s > 1000) ? "Y" : "N",
    oxygen: (content.toUpperCase().includes("WASH WATER") || content.toUpperCase().includes("WATER")) ? "Y" : "N",
    hsas: 0,
    ph: (content.toUpperCase().includes("WATER") || content.toUpperCase().includes("AQUEOUS")) ? (h2s > 100 ? 5.2 : 7.5) : 0,
    turbulence: (content.toUpperCase().includes("SLURRY") || content.toUpperCase().includes("WASH WATER") || content.toUpperCase().includes("EFFLUENT")) ? "Y" : "N",
    solids: content.toUpperCase().includes("SLURRY") ? "Y" : "N",
    insulated: "Y",
    cuiMaterial: "CS",
    nh3Significant: (st.nh3Significant === "Y" || st.nh3Significant === "Yes") ? "Y" : ((st.nh3Significant === "N" || st.nh3Significant === "No") ? "N" : (nh3 > 0 ? "Y" : "N")),
    otherContamSignificant: "N",
    deltaT: 0,
    eroMaterial: "Carbon steel",
    description: content
  };
}

/**
 * Backend Route Handler for /api/damage-criteria
 */
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const dataset = loadPresets();
  const method = req.method;
  const action = req.query.action || req.body?.action || (method === "POST" ? "screen" : "catalog");

  const db = getFirestoreDb();

  try {
    // -------------------------------------------------------------
    // ACTION: "units" - Retrieve live plant units from Cloud Firestore streamDatasets
    // -------------------------------------------------------------
    if (action === "units") {
      const unitsMap = new Map();

      if (db) {
        try {
          const snap = await Promise.race([
            getDocs(collection(db, "streamDatasets")),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 4000))
          ]);
          snap.forEach((docSnap) => {
            const data = docSnap.data() || {};
            const docId = docSnap.id;
            const parsed = parseCloudDataset(data, docId);
            if (parsed.unitId || parsed.docId) {
              const uKey = parsed.unitId || parsed.docId;
              unitsMap.set(uKey, {
                id: parsed.docId,
                unitId: parsed.unitId,
                name: parsed.unitName,
                title: parsed.title,
                docId: parsed.docId,
                streamCount: parsed.streamCount,
                source: "cloud_firestore"
              });
            }
          });
        } catch (dbErr) {
          console.warn("[API DamageCriteria] Firestore units query error:", dbErr.message);
        }
      }

      const unitsList = Array.from(unitsMap.values());
      unitsList.sort((a, b) => (b.streamCount || 0) - (a.streamCount || 0));

      return res.status(200).json({
        success: true,
        count: unitsList.length,
        units: unitsList
      });
    }

    // -------------------------------------------------------------
    // ACTION: "streams" - Retrieve live streams from Cloud Firestore for a selected Unit
    // -------------------------------------------------------------
    if (action === "streams") {
      const unitKey = String(req.query.unit || req.body?.unit || "").trim();
      if (!unitKey) {
        return res.status(400).json({
          success: false,
          error: "Missing required 'unit' parameter"
        });
      }

      let matchedStreams = [];
      let unitTitle = unitKey;

      if (db) {
        try {
          // 1. Try direct doc lookup by docId first
          try {
            const singleDoc = await getDoc(doc(db, "streamDatasets", unitKey));
            if (singleDoc.exists()) {
              const d = singleDoc.data() || {};
              const parsed = parseCloudDataset(d, singleDoc.id);
              if (parsed.streams && parsed.streams.length > 0) {
                matchedStreams = parsed.streams;
                unitTitle = parsed.title;
              }
            }
          } catch (e) {}

          // 2. Search all documents if not matched by docId
          if (matchedStreams.length === 0) {
            const snap = await Promise.race([
              getDocs(collection(db, "streamDatasets")),
              new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 4000))
            ]);
            snap.forEach((docSnap) => {
              const d = docSnap.data() || {};
              const parsed = parseCloudDataset(d, docSnap.id);
              const uUpper = unitKey.toUpperCase();
              if (
                parsed.unitId === uUpper ||
                parsed.docId === unitKey ||
                docSnap.id === unitKey ||
                parsed.title.toUpperCase().includes(uUpper) ||
                uUpper.includes(parsed.unitId)
              ) {
                if (parsed.streams.length > matchedStreams.length) {
                  matchedStreams = parsed.streams;
                  unitTitle = parsed.title;
                }
              }
            });
          }
        } catch (dbErr) {
          console.warn("[API DamageCriteria] Firestore streams query error:", dbErr.message);
        }
      }

      const formattedStreams = matchedStreams.map((st, idx) => {
        const norm = normalizeStreamRecord(st, idx);
        const rawCase = st.caseName || st.case || norm.caseName || (st.streamNo && st.streamNo.includes("[") ? (st.streamNo.match(/\[(.*?)\]/)?.[1] || "") : "");
        return {
          id: norm.streamNo,
          streamNo: norm.streamNo,
          baseStreamNo: st.baseStreamNo || norm.streamNo,
          caseName: rawCase || "",
          name: norm.name,
          content: norm.content,
          phase: norm.phase,
          temp: norm.temp,
          pressure: norm.pressure,
          massFlow: norm.massFlow,
          description: norm.content
        };
      });

      return res.status(200).json({
        success: true,
        unit: unitKey,
        unitTitle,
        count: formattedStreams.length,
        streams: formattedStreams
      });
    }

    // -------------------------------------------------------------
    // ACTION: "stream_data" - Fetch full parameters of a specific stream from Firestore
    // -------------------------------------------------------------
    if (action === "stream_data") {
      const streamId = String(req.query.streamId || req.query.id || req.body?.streamId || req.body?.id || "").trim();
      const unitKey = String(req.query.unit || req.body?.unit || "").trim();

      if (!streamId) {
        return res.status(400).json({ success: false, error: "Missing required 'streamId' parameter" });
      }

      let rawStream = null;

      if (db) {
        try {
          // 1. Try direct doc lookup
          if (unitKey) {
            try {
              const singleDoc = await getDoc(doc(db, "streamDatasets", unitKey));
              if (singleDoc.exists()) {
                const parsed = parseCloudDataset(singleDoc.data() || {}, singleDoc.id);
                const found = parsed.streams.find((s) => String(s.streamNo).trim() === streamId || String(s.id).trim() === streamId);
                if (found) rawStream = found;
              }
            } catch (e) {}
          }

          // 2. Search collection
          if (!rawStream) {
            const snap = await Promise.race([
              getDocs(collection(db, "streamDatasets")),
              new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 4000))
            ]);
            snap.forEach((docSnap) => {
              const parsed = parseCloudDataset(docSnap.data() || {}, docSnap.id);
              const uUpper = unitKey ? unitKey.toUpperCase() : "";
              if (!unitKey || parsed.unitId === uUpper || parsed.docId === unitKey || docSnap.id === unitKey || parsed.title.toUpperCase().includes(uUpper)) {
                const found = parsed.streams.find((s) => String(s.streamNo).trim() === streamId || String(s.id).trim() === streamId);
                if (found) rawStream = found;
              }
            });
          }
        } catch (dbErr) {
          console.warn("[API DamageCriteria] Firestore stream_data lookup error:", dbErr.message);
        }
      }

      if (!rawStream) {
        return res.status(404).json({
          success: false,
          error: `Stream '${streamId}' not found for unit '${unitKey || "All"}'`
        });
      }

      const normalized = normalizeStreamRecord(rawStream, 0);

      return res.status(200).json({
        success: true,
        stream: normalized
      });
    }

    // -------------------------------------------------------------
    // ACTION: "presets" / "catalog" - Backward compatibility
    // -------------------------------------------------------------
    if (action === "presets" || action === "catalog") {
      const presetKey = req.query.key || req.query.preset;
      if (presetKey && dataset.streamPresets?.[presetKey]) {
        return res.status(200).json({ success: true, preset: dataset.streamPresets[presetKey] });
      }

      return res.status(200).json({
        success: true,
        presets: dataset.streamPresets,
        erosionTable: dataset.erosionTable
      });
    }

    // -------------------------------------------------------------
    // ACTION: "screen" - Post matrix evaluation
    // -------------------------------------------------------------
    if (method === "POST" || action === "screen") {
      const payload = req.body?.data || req.body || {};
      const evaluation = evaluateScreeningMatrix(payload, dataset);
      return res.status(200).json(evaluation);
    }

    return res.status(405).json({ success: false, error: "Method not allowed" });
  } catch (err) {
    console.error("API /api/damage-criteria error:", err);
    return res.status(500).json({ success: false, error: "Internal Server Error", message: err.message });
  }
}
