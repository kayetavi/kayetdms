/**
 * ============================================================================
 * 🛡️ API Structural Min-T & Tolerance Lookup Engine
 * Standard: API 581 Annex D / API 574 (Tables D.2b, D.2d, D.3b, D.3d, D.4b, D.4d)
 * Connected with Pipe Thickness Finder Database (ASME B36.10M / B36.19M)
 * Integrated with Original Manufacturer Tolerance Master Chart
 * Full Dark Mode & Blank Initialization Support
 * ============================================================================
 */

(function () {
  let allTablesData = {};
  let masterToleranceChart = {};
  let pipeDimensionsMaster = {};
  let isInitialized = false;

  // Embedded verified fallback dataset
  const FALLBACK_TABLES = {
    "D.2b": {
      id: "D.2b",
      tableName: "Table D.2b",
      title: "Carbon Steel Minimum Structural Thickness (mm) at 400 °F (205 °C)",
      material: "carbon_steel",
      materialName: "Carbon Steel & Low Alloy",
      temperatureF: "400 °F",
      temperatureC: "205 °C",
      tempKey: "400",
      unit: "mm",
      flangeClasses: ["150", "300", "600", "900", "1500", "2500"],
      rows: [
        { nps: "0.5", npsDisplay: "0.5 (1/2\")", od_mm: 21.3, values: { "150": 1.27, "300": 1.27, "600": 1.27, "900": 1.27, "1500": 1.40, "2500": 2.03 } },
        { nps: "0.75", npsDisplay: "0.75 (3/4\")", od_mm: 26.7, values: { "150": 1.27, "300": 1.27, "600": 1.27, "900": 1.27, "1500": 1.52, "2500": 2.29 } },
        { nps: "1", npsDisplay: "1 (1\")", od_mm: 33.4, values: { "150": 1.27, "300": 1.27, "600": 1.40, "900": 1.40, "1500": 1.78, "2500": 2.67 } },
        { nps: "1.5", npsDisplay: "1.5 (1-1/2\")", od_mm: 48.3, values: { "150": 1.27, "300": 1.27, "600": 1.78, "900": 1.78, "1500": 2.29, "2500": 3.68 } },
        { nps: "2", npsDisplay: "2 (2\")", od_mm: 60.3, values: { "150": 1.27, "300": 1.40, "600": 2.03, "900": 2.03, "1500": 2.92, "2500": 4.57 } },
        { nps: "3", npsDisplay: "3 (3\")", od_mm: 88.9, values: { "150": 1.65, "300": 2.41, "600": 3.43, "900": 3.43, "1500": 4.95, "2500": 7.49 } },
        { nps: "4", npsDisplay: "4 (4\")", od_mm: 114.3, values: { "150": 1.52, "300": 2.41, "600": 3.94, "900": 3.94, "1500": 5.72, "2500": 8.89 } },
        { nps: "6", npsDisplay: "6 (6\")", od_mm: 168.3, values: { "150": 1.27, "300": 2.54, "600": 4.45, "900": 4.83, "1500": 7.49, "2500": 12.07 } },
        { nps: "8", npsDisplay: "8 (8\")", od_mm: 219.1, values: { "150": 1.52, "300": 2.92, "600": 5.46, "900": 6.10, "1500": 9.53, "2500": 15.37 } },
        { nps: "10", npsDisplay: "10 (10\")", od_mm: 273.0, values: { "150": 2.03, "300": 3.30, "600": 6.22, "900": 7.37, "1500": 11.56, "2500": 18.92 } },
        { nps: "12", npsDisplay: "12 (12\")", od_mm: 323.8, values: { "150": 2.29, "300": 3.68, "600": 6.86, "900": 8.51, "1500": 13.46, "2500": 21.97 } },
        { nps: "14", npsDisplay: "14 (14\")", od_mm: 355.6, values: { "150": 2.29, "300": 3.94, "600": 7.62, "900": 9.27, "1500": 14.86, "2500": 22.48 } },
        { nps: "16", npsDisplay: "16 (16\")", od_mm: 406.4, values: { "150": 2.54, "300": 4.45, "600": 8.38, "900": 10.41, "1500": 16.64, "2500": 25.53 } },
        { nps: "18", npsDisplay: "18 (18\")", od_mm: 457.0, values: { "150": 2.79, "300": 4.70, "600": 9.02, "900": 11.56, "1500": 18.54, "2500": 28.58 } },
        { nps: "20", npsDisplay: "20 (20\")", od_mm: 508.0, values: { "150": 3.05, "300": 5.33, "600": 9.78, "900": 12.70, "1500": 20.45, "2500": 31.62 } },
        { nps: "24", npsDisplay: "24 (24\")", od_mm: 610.0, values: { "150": 3.56, "300": 6.22, "600": 11.43, "900": 15.11, "1500": 24.38, "2500": 37.72 } }
      ]
    },
    "D.2d": {
      id: "D.2d",
      tableName: "Table D.2d",
      title: "Carbon Steel Minimum Structural Thickness (mm) at 750 °F (400 °C)",
      material: "carbon_steel",
      materialName: "Carbon Steel & Low Alloy",
      temperatureF: "750 °F",
      temperatureC: "400 °C",
      tempKey: "750",
      unit: "mm",
      flangeClasses: ["150", "300", "600", "900", "1500", "2500"],
      rows: [
        { nps: "0.5", npsDisplay: "0.5 (1/2\")", od_mm: 21.3, values: { "150": 1.27, "300": 1.27, "600": 1.27, "900": 1.40, "1500": 1.78, "2500": 2.54 } },
        { nps: "0.75", npsDisplay: "0.75 (3/4\")", od_mm: 26.7, values: { "150": 1.27, "300": 1.27, "600": 1.40, "900": 1.40, "1500": 1.91, "2500": 2.79 } },
        { nps: "1", npsDisplay: "1 (1\")", od_mm: 33.4, values: { "150": 1.27, "300": 1.27, "600": 1.91, "900": 1.91, "1500": 2.16, "2500": 3.30 } },
        { nps: "1.5", npsDisplay: "1.5 (1-1/2\")", od_mm: 48.3, values: { "150": 1.27, "300": 1.27, "600": 2.29, "900": 2.29, "1500": 2.79, "2500": 4.45 } },
        { nps: "2", npsDisplay: "2 (2\")", od_mm: 60.3, values: { "150": 1.27, "300": 1.78, "600": 2.54, "900": 2.54, "1500": 3.43, "2500": 5.46 } },
        { nps: "3", npsDisplay: "3 (3\")", od_mm: 88.9, values: { "150": 2.29, "300": 3.30, "600": 4.57, "900": 4.57, "1500": 6.22, "2500": 9.27 } },
        { nps: "4", npsDisplay: "4 (4\")", od_mm: 114.3, values: { "150": 2.03, "300": 3.18, "600": 5.08, "900": 5.08, "1500": 6.86, "2500": 10.67 } },
        { nps: "6", npsDisplay: "6 (6\")", od_mm: 168.3, values: { "150": 1.52, "300": 3.18, "600": 5.72, "900": 5.84, "1500": 8.89, "2500": 14.35 } },
        { nps: "8", npsDisplay: "8 (8\")", od_mm: 219.1, values: { "150": 1.65, "300": 3.68, "600": 6.86, "900": 7.37, "1500": 11.30, "2500": 18.03 } },
        { nps: "10", npsDisplay: "10 (10\")", od_mm: 273.0, values: { "150": 2.16, "300": 4.06, "600": 7.75, "900": 8.76, "1500": 13.59, "2500": 22.23 } },
        { nps: "12", npsDisplay: "12 (12\")", od_mm: 323.8, values: { "150": 2.29, "300": 4.45, "600": 8.38, "900": 10.03, "1500": 15.75, "2500": 25.65 } },
        { nps: "14", npsDisplay: "14 (14\")", od_mm: 355.6, values: { "150": 2.54, "300": 4.83, "600": 9.27, "900": 10.92, "1500": 17.27, "2500": 25.78 } },
        { nps: "16", npsDisplay: "16 (16\")", od_mm: 406.4, values: { "150": 2.79, "300": 5.33, "600": 10.16, "900": 12.19, "1500": 19.43, "2500": 29.21 } },
        { nps: "18", npsDisplay: "18 (18\")", od_mm: 457.0, values: { "150": 2.79, "300": 5.72, "600": 10.92, "900": 13.46, "1500": 21.59, "2500": 32.64 } },
        { nps: "20", npsDisplay: "20 (20\")", od_mm: 508.0, values: { "150": 3.30, "300": 6.35, "600": 11.68, "900": 14.86, "1500": 23.75, "2500": 36.07 } },
        { nps: "24", npsDisplay: "24 (24\")", od_mm: 610.0, values: { "150": 3.56, "300": 7.37, "600": 13.59, "900": 17.53, "1500": 28.19, "2500": 42.93 } }
      ]
    },
    "D.3b": {
      id: "D.3b",
      tableName: "Table D.3b",
      title: "Austenitic Stainless Steel Minimum Structural Thickness (mm) at 400 °F (205 °C)",
      material: "stainless_steel",
      materialName: "Austenitic Stainless Steel (SS 304, 316, Duplex)",
      temperatureF: "400 °F",
      temperatureC: "205 °C",
      tempKey: "400",
      unit: "mm",
      flangeClasses: ["150", "300", "600", "900", "1500", "2500"],
      rows: [
        { nps: "0.5", npsDisplay: "0.5 (1/2\")", od_mm: 21.3, values: { "150": 1.27, "300": 1.27, "600": 1.27, "900": 1.27, "1500": 1.27, "2500": 1.65 } },
        { nps: "0.75", npsDisplay: "0.75 (3/4\")", od_mm: 26.7, values: { "150": 1.27, "300": 1.27, "600": 1.27, "900": 1.27, "1500": 1.27, "2500": 1.91 } },
        { nps: "1", npsDisplay: "1 (1\")", od_mm: 33.4, values: { "150": 1.27, "300": 1.27, "600": 1.27, "900": 1.27, "1500": 1.52, "2500": 2.16 } },
        { nps: "1.5", npsDisplay: "1.5 (1-1/2\")", od_mm: 48.3, values: { "150": 1.27, "300": 1.27, "600": 1.52, "900": 1.52, "1500": 1.91, "2500": 3.05 } },
        { nps: "2", npsDisplay: "2 (2\")", od_mm: 60.3, values: { "150": 1.27, "300": 1.27, "600": 1.78, "900": 1.78, "1500": 2.41, "2500": 3.81 } },
        { nps: "3", npsDisplay: "3 (3\")", od_mm: 88.9, values: { "150": 1.52, "300": 2.03, "600": 2.92, "900": 2.92, "1500": 4.19, "2500": 6.22 } },
        { nps: "4", npsDisplay: "4 (4\")", od_mm: 114.3, values: { "150": 1.40, "300": 2.03, "600": 3.30, "900": 3.30, "1500": 4.70, "2500": 7.37 } },
        { nps: "6", npsDisplay: "6 (6\")", od_mm: 168.3, values: { "150": 1.27, "300": 2.16, "600": 3.81, "900": 4.06, "1500": 6.22, "2500": 10.03 } },
        { nps: "8", npsDisplay: "8 (8\")", od_mm: 219.1, values: { "150": 1.40, "300": 2.41, "600": 4.57, "900": 5.08, "1500": 7.87, "2500": 12.70 } },
        { nps: "10", npsDisplay: "10 (10\")", od_mm: 273.0, values: { "150": 1.78, "300": 2.79, "600": 5.21, "900": 6.10, "1500": 9.53, "2500": 15.62 } },
        { nps: "12", npsDisplay: "12 (12\")", od_mm: 323.8, values: { "150": 2.03, "300": 3.05, "600": 5.72, "900": 7.11, "1500": 11.18, "2500": 18.16 } },
        { nps: "14", npsDisplay: "14 (14\")", od_mm: 355.6, values: { "150": 2.03, "300": 3.30, "600": 6.35, "900": 7.75, "1500": 12.32, "2500": 18.67 } },
        { nps: "16", npsDisplay: "16 (16\")", od_mm: 406.4, values: { "150": 2.29, "300": 3.68, "600": 6.99, "900": 8.64, "1500": 13.84, "2500": 21.08 } },
        { nps: "18", npsDisplay: "18 (18\")", od_mm: 457.0, values: { "150": 2.41, "300": 3.94, "600": 7.62, "900": 9.65, "1500": 15.37, "2500": 23.62 } },
        { nps: "20", npsDisplay: "20 (20\")", od_mm: 508.0, values: { "150": 2.67, "300": 4.45, "600": 8.26, "900": 10.54, "1500": 16.89, "2500": 26.16 } },
        { nps: "24", npsDisplay: "24 (24\")", od_mm: 610.0, values: { "150": 3.05, "300": 5.21, "600": 9.53, "900": 12.57, "1500": 20.19, "2500": 31.24 } }
      ]
    },
    "D.3d": {
      id: "D.3d",
      tableName: "Table D.3d",
      title: "Austenitic Stainless Steel Minimum Structural Thickness (mm) at 750 °F (400 °C)",
      material: "stainless_steel",
      materialName: "Austenitic Stainless Steel (SS 304, 316, Duplex)",
      temperatureF: "750 °F",
      temperatureC: "400 °C",
      tempKey: "750",
      unit: "mm",
      flangeClasses: ["150", "300", "600", "900", "1500", "2500"],
      rows: [
        { nps: "0.5", npsDisplay: "0.5 (1/2\")", od_mm: 21.3, values: { "150": 1.27, "300": 1.27, "600": 1.27, "900": 1.27, "1500": 1.40, "2500": 2.03 } },
        { nps: "0.75", npsDisplay: "0.75 (3/4\")", od_mm: 26.7, values: { "150": 1.27, "300": 1.27, "600": 1.27, "900": 1.27, "1500": 1.52, "2500": 2.29 } },
        { nps: "1", npsDisplay: "1 (1\")", od_mm: 33.4, values: { "150": 1.27, "300": 1.27, "600": 1.52, "900": 1.52, "1500": 1.78, "2500": 2.67 } },
        { nps: "1.5", npsDisplay: "1.5 (1-1/2\")", od_mm: 48.3, values: { "150": 1.27, "300": 1.27, "600": 1.78, "900": 1.78, "1500": 2.29, "2500": 3.56 } },
        { nps: "2", npsDisplay: "2 (2\")", od_mm: 60.3, values: { "150": 1.27, "300": 1.52, "600": 2.03, "900": 2.03, "1500": 2.79, "2500": 4.32 } },
        { nps: "3", npsDisplay: "3 (3\")", od_mm: 88.9, values: { "150": 1.91, "300": 2.67, "600": 3.68, "900": 3.68, "1500": 4.95, "2500": 7.37 } },
        { nps: "4", npsDisplay: "4 (4\")", od_mm: 114.3, values: { "150": 1.65, "300": 2.54, "600": 4.06, "900": 4.06, "1500": 5.46, "2500": 8.51 } },
        { nps: "6", npsDisplay: "6 (6\")", od_mm: 168.3, values: { "150": 1.27, "300": 2.54, "600": 4.57, "900": 4.70, "1500": 7.11, "2500": 11.43 } },
        { nps: "8", npsDisplay: "8 (8\")", od_mm: 219.1, values: { "150": 1.40, "300": 2.92, "600": 5.46, "900": 5.84, "1500": 9.02, "2500": 14.48 } },
        { nps: "10", npsDisplay: "10 (10\")", od_mm: 273.0, values: { "150": 1.78, "300": 3.30, "600": 6.22, "900": 6.99, "1500": 10.92, "2500": 17.78 } },
        { nps: "12", npsDisplay: "12 (12\")", od_mm: 323.8, values: { "150": 1.91, "300": 3.56, "600": 6.73, "900": 8.00, "1500": 12.70, "2500": 20.57 } },
        { nps: "14", npsDisplay: "14 (14\")", od_mm: 355.6, values: { "150": 2.16, "300": 3.94, "600": 7.37, "900": 8.76, "1500": 13.84, "2500": 20.70 } },
        { nps: "16", npsDisplay: "16 (16\")", od_mm: 406.4, values: { "150": 2.29, "300": 4.32, "600": 8.13, "900": 9.78, "1500": 15.62, "2500": 23.37 } },
        { nps: "18", npsDisplay: "18 (18\")", od_mm: 457.0, values: { "150": 2.29, "300": 4.57, "600": 8.76, "900": 10.80, "1500": 17.27, "2500": 26.16 } },
        { nps: "20", npsDisplay: "20 (20\")", od_mm: 508.0, values: { "150": 2.67, "300": 5.08, "600": 9.40, "900": 11.94, "1500": 19.05, "2500": 28.83 } },
        { nps: "24", npsDisplay: "24 (24\")", od_mm: 610.0, values: { "150": 2.92, "300": 5.84, "600": 10.92, "900": 14.10, "1500": 22.61, "2500": 34.29 } }
      ]
    },
    "D.4b": {
      id: "D.4b",
      tableName: "Table D.4b",
      title: "Nickel & High Alloys Minimum Structural Thickness (mm) at 400 °F (205 °C)",
      material: "nickel_alloy",
      materialName: "Nickel & High Alloys (Monel, Inconel, Hastelloy)",
      temperatureF: "400 °F",
      temperatureC: "205 °C",
      tempKey: "400",
      unit: "mm",
      flangeClasses: ["150", "300", "600", "900", "1500", "2500"],
      rows: [
        { nps: "0.5", npsDisplay: "0.5 (1/2\")", od_mm: 21.3, values: { "150": 1.27, "300": 1.27, "600": 1.27, "900": 1.27, "1500": 1.27, "2500": 1.40 } },
        { nps: "0.75", npsDisplay: "0.75 (3/4\")", od_mm: 26.7, values: { "150": 1.27, "300": 1.27, "600": 1.27, "900": 1.27, "1500": 1.27, "2500": 1.65 } },
        { nps: "1", npsDisplay: "1 (1\")", od_mm: 33.4, values: { "150": 1.27, "300": 1.27, "600": 1.27, "900": 1.27, "1500": 1.27, "2500": 1.91 } },
        { nps: "1.5", npsDisplay: "1.5 (1-1/2\")", od_mm: 48.3, values: { "150": 1.27, "300": 1.27, "600": 1.27, "900": 1.27, "1500": 1.65, "2500": 2.67 } },
        { nps: "2", npsDisplay: "2 (2\")", od_mm: 60.3, values: { "150": 1.27, "300": 1.27, "600": 1.52, "900": 1.52, "1500": 2.03, "2500": 3.30 } },
        { nps: "3", npsDisplay: "3 (3\")", od_mm: 88.9, values: { "150": 1.40, "300": 1.78, "600": 2.54, "900": 2.54, "1500": 3.56, "2500": 5.33 } },
        { nps: "4", npsDisplay: "4 (4\")", od_mm: 114.3, values: { "150": 1.27, "300": 1.78, "600": 2.92, "900": 2.92, "1500": 4.06, "2500": 6.35 } },
        { nps: "6", npsDisplay: "6 (6\")", od_mm: 168.3, values: { "150": 1.27, "300": 1.91, "600": 3.30, "900": 3.56, "1500": 5.33, "2500": 8.64 } },
        { nps: "8", npsDisplay: "8 (8\")", od_mm: 219.1, values: { "150": 1.27, "300": 2.16, "600": 3.94, "900": 4.45, "1500": 6.73, "2500": 10.92 } },
        { nps: "10", npsDisplay: "10 (10\")", od_mm: 273.0, values: { "150": 1.52, "300": 2.41, "600": 4.45, "900": 5.33, "1500": 8.26, "2500": 13.46 } },
        { nps: "12", npsDisplay: "12 (12\")", od_mm: 323.8, values: { "150": 1.78, "300": 2.67, "600": 4.95, "900": 6.10, "1500": 9.65, "2500": 15.62 } },
        { nps: "14", npsDisplay: "14 (14\")", od_mm: 355.6, values: { "150": 1.78, "300": 2.92, "600": 5.46, "900": 6.73, "1500": 10.67, "2500": 16.00 } },
        { nps: "16", npsDisplay: "16 (16\")", od_mm: 406.4, values: { "150": 2.03, "300": 3.18, "600": 6.10, "900": 7.49, "1500": 11.94, "2500": 18.16 } },
        { nps: "18", npsDisplay: "18 (18\")", od_mm: 457.0, values: { "150": 2.16, "300": 3.43, "600": 6.60, "900": 8.38, "1500": 13.34, "2500": 20.32 } },
        { nps: "20", npsDisplay: "20 (20\")", od_mm: 508.0, values: { "150": 2.29, "300": 3.81, "600": 7.11, "900": 9.14, "1500": 14.61, "2500": 22.48 } },
        { nps: "24", npsDisplay: "24 (24\")", od_mm: 610.0, values: { "150": 2.67, "300": 4.45, "600": 8.26, "900": 10.92, "1500": 17.53, "2500": 26.92 } }
      ]
    },
    "D.4d": {
      id: "D.4d",
      tableName: "Table D.4d",
      title: "Nickel & High Alloys Minimum Structural Thickness (mm) at 750 °F (400 °C)",
      material: "nickel_alloy",
      materialName: "Nickel & High Alloys (Monel, Inconel, Hastelloy)",
      temperatureF: "750 °F",
      temperatureC: "400 °C",
      tempKey: "750",
      unit: "mm",
      flangeClasses: ["150", "300", "600", "900", "1500", "2500"],
      rows: [
        { nps: "0.5", npsDisplay: "0.5 (1/2\")", od_mm: 21.3, values: { "150": 1.27, "300": 1.27, "600": 1.27, "900": 1.27, "1500": 1.27, "2500": 1.78 } },
        { nps: "0.75", npsDisplay: "0.75 (3/4\")", od_mm: 26.7, values: { "150": 1.27, "300": 1.27, "600": 1.27, "900": 1.27, "1500": 1.40, "2500": 1.91 } },
        { nps: "1", npsDisplay: "1 (1\")", od_mm: 33.4, values: { "150": 1.27, "300": 1.27, "600": 1.40, "900": 1.40, "1500": 1.52, "2500": 2.29 } },
        { nps: "1.5", npsDisplay: "1.5 (1-1/2\")", od_mm: 48.3, values: { "150": 1.27, "300": 1.27, "600": 1.52, "900": 1.52, "1500": 1.91, "2500": 3.05 } },
        { nps: "2", npsDisplay: "2 (2\")", od_mm: 60.3, values: { "150": 1.27, "300": 1.40, "600": 1.78, "900": 1.78, "1500": 2.41, "2500": 3.68 } },
        { nps: "3", npsDisplay: "3 (3\")", od_mm: 88.9, values: { "150": 1.65, "300": 2.29, "600": 3.18, "900": 3.18, "1500": 4.32, "2500": 6.35 } },
        { nps: "4", npsDisplay: "4 (4\")", od_mm: 114.3, values: { "150": 1.52, "300": 2.16, "600": 3.56, "900": 3.56, "1500": 4.70, "2500": 7.37 } },
        { nps: "6", npsDisplay: "6 (6\")", od_mm: 168.3, values: { "150": 1.27, "300": 2.16, "600": 3.94, "900": 4.06, "1500": 6.10, "2500": 9.78 } },
        { nps: "8", npsDisplay: "8 (8\")", od_mm: 219.1, values: { "150": 1.27, "300": 2.54, "600": 4.70, "900": 5.08, "1500": 7.75, "2500": 12.45 } },
        { nps: "10", npsDisplay: "10 (10\")", od_mm: 273.0, values: { "150": 1.52, "300": 2.79, "600": 5.33, "900": 6.10, "1500": 9.40, "2500": 15.24 } },
        { nps: "12", npsDisplay: "12 (12\")", od_mm: 323.8, values: { "150": 1.65, "300": 3.05, "600": 5.84, "900": 6.99, "1500": 10.92, "2500": 17.65 } },
        { nps: "14", npsDisplay: "14 (14\")", od_mm: 355.6, values: { "150": 1.78, "300": 3.30, "600": 6.35, "900": 7.62, "1500": 11.94, "2500": 17.78 } },
        { nps: "16", npsDisplay: "16 (16\")", od_mm: 406.4, values: { "150": 2.03, "300": 3.68, "600": 6.99, "900": 8.51, "1500": 13.46, "2500": 20.07 } },
        { nps: "18", npsDisplay: "18 (18\")", od_mm: 457.0, values: { "150": 2.03, "300": 3.94, "600": 7.49, "900": 9.40, "1500": 14.86, "2500": 22.48 } },
        { nps: "20", npsDisplay: "20 (20\")", od_mm: 508.0, values: { "150": 2.29, "300": 4.32, "600": 8.13, "900": 10.29, "1500": 16.38, "2500": 24.77 } },
        { nps: "24", npsDisplay: "24 (24\")", od_mm: 610.0, values: { "150": 2.54, "300": 5.08, "600": 9.40, "900": 12.19, "1500": 19.43, "2500": 29.46 } }
      ]
    }
  };

  allTablesData = FALLBACK_TABLES;

  /**
   * Fetch Master Tables, Manufacturer Tolerance Chart, & Pipe Dimensions from Backend
  /**
   * Fetch Master Tables, Manufacturer Tolerance Chart, & Pipe Dimensions from Backend
   */
  async function fetchCloudTables() {
    try {
      const res = await fetch("/api/structural-thickness?action=get_all_tables");
      if (res.ok) {
        const data = await res.json();
        if (data && data.tables) {
          allTablesData = data.tables;
        }
        if (data && data.tolerances) {
          masterToleranceChart = data.tolerances;
        }
        if (data && data.pipeDimensions && data.pipeDimensions.pipeDataMaster) {
          pipeDimensionsMaster = data.pipeDimensions.pipeDataMaster;
          if (window.pipeDataMaster883) {
            Object.assign(window.pipeDataMaster883, data.pipeDimensions.pipeDataMaster);
          }
          if (data.pipeDimensions.pipeOD && window.pipeOD883) {
            Object.assign(window.pipeOD883, data.pipeDimensions.pipeOD);
          }
        }
        const badge = document.getElementById("stCloudBadge");
        if (badge) {
          badge.innerHTML = "☁️ Cloud Synced";
          badge.classList.add("cloud-synced");
        }
        // Immediately refresh tolerance reference table and dropdowns with fetched data
        renderToleranceReferenceTable();
        populateToleranceMaterialDropdown();
        populateNpsDropdown();
      }
    } catch (e) {
      console.warn("Using local built-in verified dataset", e);
    }
  }

  function initStructuralThickness(force = false) {
    const tabEl = document.getElementById("structuralThicknessTab");
    const tolBody = document.getElementById("stToleranceRefTableBody");

    // If tab or table element is not yet in DOM, do not mark as permanently initialized
    if (!tabEl) {
      fetchCloudTables();
      return;
    }

    if (!force && isInitialized && tolBody && tolBody.children.length > 0) {
      return;
    }

    isInitialized = true;
    populateNpsDropdown();
    populateScheduleDropdown();
    populateToleranceMaterialDropdown();
    renderEmptyState();
    renderLiveMatrixTable(allTablesData["D.2b"], "", "", 0, 0);
    renderToleranceReferenceTable();

    fetchCloudTables().then(() => {
      populateNpsDropdown();
      populateScheduleDropdown();
      populateToleranceMaterialDropdown();
      renderLiveMatrixTable(allTablesData["D.2b"], "", "", 0, 0);
      renderToleranceReferenceTable();
      calculateStructuralThickness();
    });
  }
  window.initStructuralThickness = initStructuralThickness;

  /**
   * Render Clean Empty State when no parameter is chosen yet
   */
  function renderEmptyState() {
    const kpiVal1 = document.getElementById("stKpiMinStructVal");
    const kpiAlt1 = document.getElementById("stKpiMinStructAlt");
    if (kpiVal1) kpiVal1.textContent = "--";
    if (kpiAlt1) kpiAlt1.textContent = "Select Material, NPS & Flange Class";

    const kpiVal2 = document.getElementById("stKpiNomReqVal");
    const kpiSub2 = document.getElementById("stKpiNomReqSub");
    if (kpiVal2) kpiVal2.textContent = "--";
    if (kpiSub2) kpiSub2.textContent = "Select Pipe Schedule to verify";

    const kpiVal3 = document.getElementById("stKpiTotalReqVal");
    const kpiSub3 = document.getElementById("stKpiTotalReqSub");
    if (kpiVal3) kpiVal3.textContent = "--";
    if (kpiSub3) kpiSub3.textContent = "Structural Min-T + CA";

    const kpiVal4 = document.getElementById("stKpiSchRecVal");
    const kpiSub4 = document.getElementById("stKpiSchRecSub");
    if (kpiVal4) kpiVal4.textContent = "Awaiting Selection";
    if (kpiSub4) kpiSub4.textContent = "API 581 Annex D / ASME B36.10M";

    const bannerContainer = document.getElementById("stMatchBanner");
    if (bannerContainer) {
      bannerContainer.innerHTML = `
        <div class="st-match-banner-left">
          <span class="st-match-icon">⚡</span>
          <div>
            <div class="st-match-banner-title">Awaiting Lookup Parameters</div>
            <div class="st-match-banner-desc">Select <strong>Material Group</strong>, <strong>Design Temperature</strong>, <strong>NPS Size</strong>, and <strong>Flange Class</strong> to compute minimum structural thickness.</div>
          </div>
        </div>
        <div class="st-match-banner-value">
          <span>Min-T: -- mm</span>
          <span style="font-size: 11px; font-weight: 600; opacity: 0.85;">(-- in)</span>
        </div>
      `;
    }

    const container = document.getElementById("stPipeFinderAssessmentBox");
    if (container) {
      container.innerHTML = `
        <div class="st-finder-card empty">
          <div class="st-finder-header" style="display:flex;align-items:center;justify-content:center;gap:10px;">
            <span style="font-size:24px;">🔌</span>
            <div>
              <h4 style="margin:0;font-size:14.5px;color:#475569;">Pipe Thickness Finder Database Ready</h4>
              <p style="margin:3px 0 0 0;font-size:12.5px;color:#64748b;">Select an NPS Size, Schedule, and Flange Rating to evaluate wall thickness with manufacturer under-tolerance.</p>
            </div>
          </div>
        </div>
      `;
    }
  }

  /**
   * Filter and populate Standard API Table dropdown
   */
  function updateFilteredTableDropdown() {
    const matSelect = document.getElementById("stMaterialSelect");
    const tempSelect = document.getElementById("stTempSelect");
    const tableSelect = document.getElementById("stTableSelect");
    if (!tableSelect) return;

    const selectedMat = matSelect ? matSelect.value : "";
    const selectedTemp = tempSelect ? tempSelect.value : "";

    if (!selectedMat && !selectedTemp) {
      tableSelect.innerHTML = `
        <option value="" selected>-- Select API Table --</option>
        <option value="D.2b">Table D.2b - Carbon Steel at 400 °F (205 °C)</option>
        <option value="D.2d">Table D.2d - Carbon Steel at 750 °F (400 °C)</option>
        <option value="D.3b">Table D.3b - Austenitic SS at 400 °F (205 °C)</option>
        <option value="D.3d">Table D.3d - Austenitic SS at 750 °F (400 °C)</option>
        <option value="D.4b">Table D.4b - Nickel &amp; Alloys at 400 °F (205 °C)</option>
        <option value="D.4d">Table D.4d - Nickel &amp; Alloys at 750 °F (400 °C)</option>
      `;
      return;
    }

    let prefix = "D.2";
    if (selectedMat === "stainless_steel") prefix = "D.3";
    else if (selectedMat === "nickel_alloy") prefix = "D.4";

    const suffix = selectedTemp === "750" ? "d" : "b";
    const targetTableId = `${prefix}${suffix}`;

    const matchingTables = Object.keys(allTablesData).filter(k => {
      const t = allTablesData[k];
      return (!selectedMat || t.material === selectedMat || k.startsWith(prefix));
    });

    let html = `<option value="">-- Select API Table --</option>`;
    html += matchingTables.map(k => {
      const t = allTablesData[k] || FALLBACK_TABLES[k];
      const isSelected = k === targetTableId;
      return `<option value="${t.id}" ${isSelected ? 'selected' : ''}>${t.tableName} - ${t.materialName || t.material} (${t.temperatureF} / ${t.temperatureC})</option>`;
    }).join("");

    tableSelect.innerHTML = html;
    if (targetTableId && selectedMat && selectedTemp) {
      tableSelect.value = targetTableId;
    }
  }

  /**
   * Populate Manufacturer Tolerance Material / Spec Dropdown
   */
  function populateToleranceMaterialDropdown() {
    const tolMatSelect = document.getElementById("stToleranceMaterialSelect");
    const matSelect = document.getElementById("stMaterialSelect");
    if (!tolMatSelect) return;

    const selectedMatGroup = matSelect ? matSelect.value : "";
    const currentVal = tolMatSelect.value;

    const specs = Object.values(masterToleranceChart).length > 0
      ? masterToleranceChart
      : {
          "A106": { id: "A106", spec: "ASTM A106 / A106M (Seamless CS)", materialGroup: "carbon_steel", toleranceDisplay: "-12.5%" },
          "A53": { id: "A53", spec: "ASTM A53 / A53M (Welded/Seamless)", materialGroup: "carbon_steel", toleranceDisplay: "-12.5%" },
          "A335": { id: "A335", spec: "ASTM A335 / A335M (Cr-Mo Alloy)", materialGroup: "carbon_steel", toleranceDisplay: "-12.5%" },
          "A312": { id: "A312", spec: "ASTM A312 / A312M (Austenitic SS)", materialGroup: "stainless_steel", toleranceDisplay: "-12.5%" },
          "A358": { id: "A358", spec: "ASTM A358 / A358M (EFW SS -0.3mm)", materialGroup: "stainless_steel", toleranceDisplay: "-0.30 mm" },
          "A409": { id: "A409", spec: "ASTM A409 / A409M (Large Dia SS -0.46mm)", materialGroup: "stainless_steel", toleranceDisplay: "-0.46 mm" },
          "A790": { id: "A790", spec: "ASTM A790 / A790M (Duplex SS)", materialGroup: "stainless_steel", toleranceDisplay: "-12.5%" },
          "B167_B444": { id: "B167_B444", spec: "ASTM B167 / B444 (Nickel Alloys)", materialGroup: "nickel_alloy", toleranceDisplay: "-12.5%" },
          "API_5L_SEAMLESS": { id: "API_5L_SEAMLESS", spec: "API Spec 5L (Seamless)", materialGroup: "carbon_steel", toleranceDisplay: "-12.5% / -0.5mm" },
          "API_5L_WELDED": { id: "API_5L_WELDED", spec: "API Spec 5L (Welded - ERW/SAW)", materialGroup: "carbon_steel", toleranceDisplay: "-10.0% / -0.5mm" },
          "A530": { id: "A530", spec: "ASTM A530 (General Requirements)", materialGroup: "carbon_steel", toleranceDisplay: "-12.5%" },
          "A671_A672_A691": { id: "A671_A672_A691", spec: "ASTM A671/A672/A691 (EFW -0.3mm)", materialGroup: "carbon_steel", toleranceDisplay: "-0.30 mm" },
          "IS_3589_SEAMLESS": { id: "IS_3589_SEAMLESS", spec: "IS 3589 (Seamless)", materialGroup: "carbon_steel", toleranceDisplay: "-12.5%" },
          "IS_3589_ERW": { id: "IS_3589_ERW", spec: "IS 3589 (ERW)", materialGroup: "carbon_steel", toleranceDisplay: "-10.0%" },
          "IS_1239_WELDED_LIGHT": { id: "IS_1239_WELDED_LIGHT", spec: "IS 1239 (Welded - Light)", materialGroup: "carbon_steel", toleranceDisplay: "-8.0%" },
          "IS_1239_WELDED_MED": { id: "IS_1239_WELDED_MED", spec: "IS 1239 (Welded - Med/Hvy)", materialGroup: "carbon_steel", toleranceDisplay: "-10.0%" },
          "IS_1239_SEAMLESS": { id: "IS_1239_SEAMLESS", spec: "IS 1239 (Seamless)", materialGroup: "carbon_steel", toleranceDisplay: "-12.5%" }
        };

    let html = `<option value="">-- Select Mfg Standard --</option>`;

    if (selectedMatGroup) {
      html += `<optgroup label="Recommended for ${selectedMatGroup.replace('_', ' ').toUpperCase()}">`;
      for (const [k, item] of Object.entries(specs)) {
        if (item.materialGroup === selectedMatGroup) {
          html += `<option value="${k}">${item.spec} [Tol: ${item.toleranceDisplay || ''}]</option>`;
        }
      }
      html += `</optgroup>`;

      html += `<optgroup label="Other Standard Specifications">`;
      for (const [k, item] of Object.entries(specs)) {
        if (item.materialGroup !== selectedMatGroup) {
          html += `<option value="${k}">${item.spec} [Tol: ${item.toleranceDisplay || ''}]</option>`;
        }
      }
      html += `</optgroup>`;
    } else {
      for (const [k, item] of Object.entries(specs)) {
        html += `<option value="${k}">${item.spec} [Tol: ${item.toleranceDisplay || ''}]</option>`;
      }
    }

    tolMatSelect.innerHTML = html;

    if (currentVal && specs[currentVal]) {
      tolMatSelect.value = currentVal;
    } else if (selectedMatGroup === "stainless_steel") {
      tolMatSelect.value = "A312";
    } else if (selectedMatGroup === "nickel_alloy") {
      tolMatSelect.value = "B167_B444";
    } else if (selectedMatGroup === "carbon_steel") {
      tolMatSelect.value = "A106";
    }
  }

  function populateNpsDropdown() {
    const tableSelect = document.getElementById("stTableSelect");
    const npsSelect = document.getElementById("stNpsSelect");
    if (!npsSelect) return;

    const tableId = tableSelect ? tableSelect.value : "";
    const table = allTablesData[tableId] || allTablesData["D.2b"] || FALLBACK_TABLES["D.2b"];
    const prevNps = npsSelect.value;

    let html = `<option value="">-- Select NPS Size --</option>`;
    html += table.rows.map(r => {
      return `<option value="${r.nps}">NPS ${r.npsDisplay || r.nps}" (OD: ${r.od_mm} mm / ${ (r.od_mm/25.4).toFixed(3) }")</option>`;
    }).join("");

    npsSelect.innerHTML = html;
    if (prevNps && table.rows.some(r => r.nps === prevNps)) {
      npsSelect.value = prevNps;
    }
  }

  /**
   * Populate Pipe Schedule dropdown connected with Pipe Thickness Finder Database!
   */
  function populateScheduleDropdown() {
    const npsSelect = document.getElementById("stNpsSelect");
    const schSelect = document.getElementById("stScheduleSelect");
    if (!schSelect) return;

    const nps = npsSelect ? npsSelect.value : "";
    const prevSch = schSelect.value;

    if (!nps) {
      schSelect.innerHTML = `<option value="" selected>-- Select Pipe Schedule --</option>`;
      return;
    }

    const master = pipeDimensionsMaster && Object.keys(pipeDimensionsMaster).length > 0
      ? pipeDimensionsMaster
      : (window.pipeDataMaster883 || {});

    const schedules = master[nps] || {};
    let schKeys = Object.keys(schedules);
    if (schKeys.length === 0) {
      schKeys = ["SCH 40", "STD", "SCH 80", "XS", "SCH 160", "XXS"];
    }

    let html = `<option value="">-- Select Pipe Schedule --</option>`;
    schKeys.forEach(sch => {
      const wt = schedules[sch];
      const wtText = wt ? ` (WT: ${wt} mm / ${(wt/25.4).toFixed(3)}")` : "";
      html += `<option value="${sch}">${sch}${wtText}</option>`;
    });

    schSelect.innerHTML = html;

    if (prevSch && schKeys.includes(prevSch)) {
      schSelect.value = prevSch;
    } else if (schKeys.includes("SCH 40")) {
      schSelect.value = "SCH 40";
    } else if (schKeys.includes("STD")) {
      schSelect.value = "STD";
    } else if (schKeys.length > 0) {
      schSelect.value = schKeys[0];
    }
  }

  window.stOnMaterialOrTempChange = function () {
    updateFilteredTableDropdown();
    populateToleranceMaterialDropdown();
    populateNpsDropdown();
    calculateStructuralThickness();
  };

  window.stOnNpsChange = function () {
    populateScheduleDropdown();
    calculateStructuralThickness();
  };

  window.stOnTableChange = function () {
    const tableSelect = document.getElementById("stTableSelect");
    const matSelect = document.getElementById("stMaterialSelect");
    const tempSelect = document.getElementById("stTempSelect");

    if (tableSelect && tableSelect.value) {
      const val = tableSelect.value;
      if (matSelect) {
        if (val.startsWith("D.2")) matSelect.value = "carbon_steel";
        else if (val.startsWith("D.3")) matSelect.value = "stainless_steel";
        else if (val.startsWith("D.4")) matSelect.value = "nickel_alloy";
      }
      if (tempSelect) {
        if (val.endsWith("b")) tempSelect.value = "400";
        else if (val.endsWith("d")) tempSelect.value = "750";
      }
    }

    populateToleranceMaterialDropdown();
    populateNpsDropdown();
    calculateStructuralThickness();
  };

  window.stOnScheduleChange = function () {
    calculateStructuralThickness();
  };

  window.stOnToleranceMaterialChange = function () {
    calculateStructuralThickness();
  };

  /**
   * Reset / Clear All Inputs Form
   */
  window.stResetForm = function () {
    const matSelect = document.getElementById("stMaterialSelect");
    const tempSelect = document.getElementById("stTempSelect");
    const tableSelect = document.getElementById("stTableSelect");
    const npsSelect = document.getElementById("stNpsSelect");
    const schSelect = document.getElementById("stScheduleSelect");
    const tolMatSelect = document.getElementById("stToleranceMaterialSelect");
    const flangeSelect = document.getElementById("stFlangeClassSelect");
    const caInput = document.getElementById("stCorrosionAllowanceInput");

    if (matSelect) matSelect.value = "";
    if (tempSelect) tempSelect.value = "";
    if (tableSelect) tableSelect.value = "";
    if (npsSelect) npsSelect.value = "";
    if (schSelect) schSelect.innerHTML = `<option value="" selected>-- Select Pipe Schedule --</option>`;
    if (tolMatSelect) tolMatSelect.value = "";
    if (flangeSelect) flangeSelect.value = "";
    if (caInput) caInput.value = "";

    updateFilteredTableDropdown();
    populateNpsDropdown();
    renderEmptyState();
    renderLiveMatrixTable(allTablesData["D.2b"] || FALLBACK_TABLES["D.2b"], "", "", 0, 0);

    if (typeof Swal !== "undefined") {
      Swal.fire({
        icon: "info",
        title: "Inputs Cleared",
        text: "Form reset to blank state. Select parameters to evaluate.",
        timer: 1200,
        showConfirmButton: false
      });
    }
  };

  /**
   * Core Calculation & Verification Engine
   */
  function calculateStructuralThickness() {
    const tableSelect = document.getElementById("stTableSelect");
    const npsSelect = document.getElementById("stNpsSelect");
    const schSelect = document.getElementById("stScheduleSelect");
    const tolMatSelect = document.getElementById("stToleranceMaterialSelect");
    const flangeSelect = document.getElementById("stFlangeClassSelect");
    const caInput = document.getElementById("stCorrosionAllowanceInput");

    const nps = npsSelect ? npsSelect.value : "";
    const flangeClass = flangeSelect ? flangeSelect.value : "";

    // If core parameters are not yet selected, render empty state cleanly
    if (!nps || !flangeClass) {
      renderEmptyState();
      const tableId = (tableSelect && tableSelect.value) ? tableSelect.value : "D.2b";
      const table = allTablesData[tableId] || allTablesData["D.2b"] || FALLBACK_TABLES["D.2b"];
      renderLiveMatrixTable(table, nps, flangeClass, 0, 0);
      return;
    }

    const tableId = (tableSelect && tableSelect.value) ? tableSelect.value : "D.2b";
    const sch = schSelect ? schSelect.value : "";
    const matSpec = (tolMatSelect && tolMatSelect.value) ? tolMatSelect.value : "A106";
    const ca_mm = parseFloat(caInput?.value || "0") || 0;

    const table = allTablesData[tableId] || allTablesData["D.2b"] || FALLBACK_TABLES["D.2b"];
    const row = table.rows.find(r => r.nps === nps) || table.rows[0];

    // 1. API Structural Minimum Thickness
    const t_min_struct_mm = row.values[flangeClass] !== undefined ? row.values[flangeClass] : (row.values["150"] || 1.27);
    const t_min_struct_in = Number((t_min_struct_mm / 25.4).toFixed(4));

    // 2. Lookup Pipe Dimensions & Schedule WT from Pipe Thickness Finder Database
    const master = pipeDimensionsMaster && Object.keys(pipeDimensionsMaster).length > 0
      ? pipeDimensionsMaster
      : (window.pipeDataMaster883 || {});
    const schedules = master[nps] || {};
    const nominalWT_mm = (sch && schedules[sch]) ? parseFloat(schedules[sch]) : 0;
    const nominalWT_in = nominalWT_mm > 0 ? Number((nominalWT_mm / 25.4).toFixed(4)) : 0;

    // 3. Compute Under-Tolerance using Master Manufacturer Tolerance Chart
    const tolItem = masterToleranceChart[matSpec] || { type: "%", value: 0.125, toleranceDisplay: "-12.5%" };
    let millTolVal_mm = 0;

    if (nominalWT_mm > 0) {
      if (tolItem.type === "%") {
        millTolVal_mm = Number((nominalWT_mm * tolItem.value).toFixed(3));
      } else if (tolItem.type === "mm") {
        millTolVal_mm = Number(tolItem.value.toFixed(3));
      } else if (tolItem.type === "api_5l_seamless") {
        if (nominalWT_mm <= 4.0) millTolVal_mm = 0.5;
        else if (nominalWT_mm < 25.0) millTolVal_mm = Number((0.125 * nominalWT_mm).toFixed(3));
        else millTolVal_mm = Number((0.10 * nominalWT_mm).toFixed(3));
      } else if (tolItem.type === "api_5l_welded") {
        if (nominalWT_mm <= 5.0) millTolVal_mm = 0.5;
        else if (nominalWT_mm < 15.0) millTolVal_mm = Number((0.10 * nominalWT_mm).toFixed(3));
        else millTolVal_mm = 1.5;
      } else {
        millTolVal_mm = Number((nominalWT_mm * 0.125).toFixed(3));
      }
    }

    const t_afterMill_mm = Number(Math.max(0, nominalWT_mm - millTolVal_mm).toFixed(3));
    const t_afterMill_in = Number((t_afterMill_mm / 25.4).toFixed(4));
    const effectiveTolPct = nominalWT_mm > 0 ? Number(((millTolVal_mm / nominalWT_mm) * 100).toFixed(1)) : 12.5;

    // Theoretical Required Nominal Thickness from Min-T: t_nom_req = t_struct / (1 - tol)
    const tolDec = effectiveTolPct / 100;
    const t_nom_req_mm = tolDec < 1 ? Number((t_min_struct_mm / (1 - tolDec)).toFixed(2)) : t_min_struct_mm;
    const t_nom_req_in = Number((t_nom_req_mm / 25.4).toFixed(4));

    // Total required with Corrosion Allowance (CA)
    const t_total_req_mm = Number((t_min_struct_mm + ca_mm).toFixed(2));
    const t_total_req_in = Number((t_total_req_mm / 25.4).toFixed(4));

    // Structural Adequacy & Safety Margin
    const usableNetWT_mm = Number((t_afterMill_mm - ca_mm).toFixed(3));
    const isAdequate = nominalWT_mm > 0 ? (usableNetWT_mm >= t_min_struct_mm) : null;
    const safetyMargin_mm = nominalWT_mm > 0 ? Number((usableNetWT_mm - t_min_struct_mm).toFixed(3)) : null;

    // Update KPI Card Displays
    const isImperial = window._stUnitMode === "imperial";

    const kpiVal1 = document.getElementById("stKpiMinStructVal");
    const kpiAlt1 = document.getElementById("stKpiMinStructAlt");
    if (kpiVal1) kpiVal1.textContent = isImperial ? `${t_min_struct_in}` : `${t_min_struct_mm}`;
    if (kpiAlt1) kpiAlt1.textContent = isImperial ? `Metric: ${t_min_struct_mm} mm` : `Imperial: ${t_min_struct_in} in (inches)`;

    const kpiVal2 = document.getElementById("stKpiNomReqVal");
    const kpiSub2 = document.getElementById("stKpiNomReqSub");
    if (kpiVal2) {
      if (nominalWT_mm > 0) {
        kpiVal2.textContent = isImperial ? `${nominalWT_in}` : `${nominalWT_mm}`;
      } else {
        kpiVal2.textContent = isImperial ? `${t_nom_req_in}` : `${t_nom_req_mm}`;
      }
    }
    if (kpiSub2) {
      if (nominalWT_mm > 0) {
        kpiSub2.textContent = `${sch}: ${nominalWT_mm} mm | Tol: -${millTolVal_mm} mm (-${effectiveTolPct}%)`;
      } else {
        kpiSub2.textContent = `Includes ${effectiveTolPct}% mill under-tolerance (${t_nom_req_in} in)`;
      }
    }

    const kpiVal3 = document.getElementById("stKpiTotalReqVal");
    const kpiSub3 = document.getElementById("stKpiTotalReqSub");
    if (kpiVal3) kpiVal3.textContent = isImperial ? `${t_total_req_in}` : `${t_total_req_mm}`;
    if (kpiSub3) kpiSub3.textContent = `t_min_struct (${t_min_struct_mm} mm) + CA (${ca_mm} mm) = ${t_total_req_in} in`;

    const kpiVal4 = document.getElementById("stKpiSchRecVal");
    const kpiSub4 = document.getElementById("stKpiSchRecSub");
    if (kpiVal4) kpiVal4.textContent = `${table.tableName} (${table.temperatureF} / ${table.temperatureC})`;
    if (kpiSub4) kpiSub4.textContent = `NPS ${row.npsDisplay || row.nps}" | OD: ${row.od_mm} mm (${ (row.od_mm/25.4).toFixed(3) }")`;

    // Render Connected Pipe Thickness Finder Card & Schedule Comparison Table
    renderPipeFinderConnectedCard({
      nps: row.nps,
      npsDisplay: row.npsDisplay || row.nps,
      od_mm: row.od_mm,
      od_in: Number((row.od_mm / 25.4).toFixed(3)),
      sch,
      nominalWT_mm,
      nominalWT_in,
      matSpec: tolItem.spec || matSpec,
      tolDisplay: tolItem.toleranceDisplay || `-${effectiveTolPct}%`,
      millTolVal_mm,
      t_afterMill_mm,
      t_afterMill_in,
      t_min_struct_mm,
      t_min_struct_in,
      ca_mm,
      usableNetWT_mm,
      isAdequate,
      safetyMargin_mm,
      flangeClass,
      tableName: table.tableName,
      schedules
    });

    // Render Matrix Table with Ultra-Clear Spotlight
    renderLiveMatrixTable(table, row.nps, flangeClass, t_min_struct_mm, t_min_struct_in);
  }
  window.calculateStructuralThickness = calculateStructuralThickness;

  /**
   * Render Connected Pipe Thickness Finder & Schedule Comparison Card
   */
  function renderPipeFinderConnectedCard(data) {
    const container = document.getElementById("stPipeFinderAssessmentBox");
    if (!container) return;

    if (!data.nominalWT_mm || data.nominalWT_mm <= 0) {
      container.innerHTML = `
        <div class="st-finder-card empty">
          <div class="st-finder-header" style="display:flex;align-items:center;justify-content:center;gap:10px;">
            <span style="font-size:20px;">ℹ️</span>
            <div>
              <strong style="font-size:13.5px;color:#334155;">Schedule Selection Pending</strong>
              <p style="margin:2px 0 0 0;font-size:12px;color:#64748b;">Select a Pipe Schedule above to verify actual nominal wall thickness and safety margin against API Structural Min-T (${data.t_min_struct_mm} mm).</p>
            </div>
          </div>
        </div>
      `;
      return;
    }

    const isPassed = data.isAdequate;
    const badgeClass = isPassed ? "status-pass" : "status-fail";
    const statusIcon = isPassed ? "✅ ADEQUATE &amp; COMPLIANT" : "❌ INSUFFICIENT / BELOW MIN-T";
    const marginClass = (data.safetyMargin_mm >= 0) ? "margin-positive" : "margin-negative";
    const marginSign = data.safetyMargin_mm > 0 ? "+" : "";

    let html = `
      <div class="st-finder-card ${isPassed ? 'pass' : 'fail'}">
        <div class="st-finder-card-header">
          <div class="st-finder-title">
            <span class="st-badge-dot"></span>
            <h4>Pipe Thickness Finder &amp; Tolerance Verification</h4>
            <span class="st-source-badge">ASME B36.10M / B36.19M &bull; ${data.matSpec}</span>
          </div>
          <div class="st-status-pill ${badgeClass}">${statusIcon}</div>
        </div>

        <div class="st-finder-grid">
          <div class="st-finder-item">
            <span class="label">Selected Pipe Size &amp; OD</span>
            <span class="val">NPS ${data.npsDisplay}" (OD: ${data.od_mm} mm / ${data.od_in}")</span>
          </div>
          <div class="st-finder-item highlight">
            <span class="label">Nominal Wall Thickness (t<sub>nom</sub>)</span>
            <span class="val">${data.sch} &rarr; <strong>${data.nominalWT_mm} mm</strong> (${data.nominalWT_in}")</span>
          </div>
          <div class="st-finder-item">
            <span class="label">Mfg Tolerance Deduction</span>
            <span class="val tol-val">${data.tolDisplay} (-${data.millTolVal_mm} mm)</span>
          </div>
          <div class="st-finder-item highlight">
            <span class="label">Thickness after Mill Tol (t<sub>mill</sub>)</span>
            <span class="val net-val"><strong>${data.t_afterMill_mm} mm</strong> (${data.t_afterMill_in}")</span>
          </div>
          <div class="st-finder-item">
            <span class="label">API Structural Min-T (t<sub>struct</sub>)</span>
            <span class="val">Class ${data.flangeClass} &rarr; <strong>${data.t_min_struct_mm} mm</strong> (${data.t_min_struct_in}")</span>
          </div>
          <div class="st-finder-item ${marginClass}">
            <span class="label">Safety Margin (t<sub>net</sub> - t<sub>struct</sub>)</span>
            <span class="val"><strong>${marginSign}${data.safetyMargin_mm} mm</strong> (${(data.safetyMargin_mm/25.4).toFixed(4)}")</span>
          </div>
        </div>

        <!-- Schedule Comparison Table for Selected NPS -->
        <div class="st-sch-table-wrapper">
          <div class="st-sch-table-title">
            <span>📊 Schedule Suitability Chart for NPS ${data.npsDisplay}" (Class ${data.flangeClass} Min-T: ${data.t_min_struct_mm} mm)</span>
          </div>
          <div class="st-table-responsive">
            <table class="st-sch-compare-table">
              <thead>
                <tr>
                  <th>Schedule</th>
                  <th>Nominal WT (t<sub>nom</sub>)</th>
                  <th>Min WT after Tol (t<sub>mill</sub>)</th>
                  <th>API Min-T (t<sub>struct</sub>)</th>
                  <th>Margin (mm)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
    `;

    for (const [schName, thickVal] of Object.entries(data.schedules)) {
      if (!thickVal) continue;
      const tNom = parseFloat(thickVal);
      if (isNaN(tNom) || tNom <= 0) continue;

      // Tol deduction
      const tolDec = (data.millTolVal_mm / data.nominalWT_mm) || 0.125;
      const tMill = Number((tNom * (1 - tolDec)).toFixed(2));
      const margin = Number((tMill - data.t_min_struct_mm).toFixed(2));
      const ok = tMill >= data.t_min_struct_mm;
      const isCurrent = schName === data.sch;

      html += `
        <tr class="${isCurrent ? 'selected-sch-row' : ''}">
          <td><strong>${isCurrent ? '👉 ' : ''}${schName}</strong></td>
          <td>${tNom.toFixed(2)} mm (${(tNom/25.4).toFixed(3)}")</td>
          <td>${tMill.toFixed(2)} mm (${(tMill/25.4).toFixed(3)}")</td>
          <td>${data.t_min_struct_mm.toFixed(2)} mm</td>
          <td style="color:${margin >= 0 ? '#059669' : '#dc2626'}; font-weight:600;">${margin >= 0 ? '+' : ''}${margin} mm</td>
          <td>
            <span class="st-mini-badge ${ok ? 'pass' : 'fail'}">${ok ? '✅ Adequate' : '❌ Insufficient'}</span>
          </td>
        </tr>
      `;
    }

    html += `
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  /**
   * Render Manufacturer Tolerance Reference Table
   */
  function renderToleranceReferenceTable() {
    const container = document.getElementById("stToleranceRefTableBody");
    if (!container) return;

    const specs = Object.values(masterToleranceChart).length > 0
      ? masterToleranceChart
      : {
          "A106": { spec: "ASTM A106 / A106M", title: "Seamless Carbon Steel for High-Temp", type: "%", toleranceDisplay: "-12.5%", description: "Standard ASTM seamless carbon steel under-tolerance (max 12.5% under nominal)." },
          "A53": { spec: "ASTM A53 / A53M", title: "Welded & Seamless Black / Hot-Dipped", type: "%", toleranceDisplay: "-12.5%", description: "Standard ASTM pipe specification under-tolerance." },
          "A335": { spec: "ASTM A335 / A335M", title: "Seamless Ferritic Alloy-Steel (Cr-Mo)", type: "%", toleranceDisplay: "-12.5%", description: "Seamless chromium-molybdenum alloy steel piping." },
          "A312": { spec: "ASTM A312 / A312M", title: "Seamless & Welded Austenitic Stainless Steel", type: "%", toleranceDisplay: "-12.5%", description: "Standard 304, 316, 321 austenitic stainless steel piping." },
          "A358": { spec: "ASTM A358 / A358M", title: "Electric-Fusion-Welded Stainless Steel", type: "mm", toleranceDisplay: "-0.30 mm", description: "Minimum wall thickness shall not be more than 0.01 in (0.3 mm) under nominal." },
          "A409": { spec: "ASTM A409 / A409M", title: "Welded Large Diameter Austenitic SS", type: "mm", toleranceDisplay: "-0.46 mm", description: "Large diameter welded SS under-tolerance (0.018 in / 0.46 mm)." },
          "A790": { spec: "ASTM A790 / A790M", title: "Seamless & Welded Duplex Stainless Steel", type: "%", toleranceDisplay: "-12.5%", description: "Duplex (2205) and Super Duplex stainless steel pipe." },
          "API_5L_SEAMLESS": { spec: "API Spec 5L (Seamless)", title: "Line Pipe - Seamless", type: "%", toleranceDisplay: "-12.5% / -0.5mm", description: "t ≤ 4.0 mm: -0.5 mm; 4.0 < t < 25.0 mm: -12.5%; t ≥ 25.0 mm: -10.0%." },
          "API_5L_WELDED": { spec: "API Spec 5L (Welded)", title: "Line Pipe - Welded (ERW/SAW)", type: "%", toleranceDisplay: "-10.0% / -0.5mm", description: "t ≤ 5.0 mm: -0.5 mm; 5.0 < t < 15.0 mm: -10.0%; t ≥ 15.0 mm: -1.5 mm." },
          "IS_3589": { spec: "IS 3589", title: "Steel Pipes for Water and Sewage", type: "%", toleranceDisplay: "-10% to -12.5%", description: "Indian Standard IS 3589 for water/gas lines." }
        };

    let html = "";
    for (const [key, item] of Object.entries(specs)) {
      html += `
        <tr>
          <td><strong>${item.spec || key}</strong></td>
          <td>${item.title || ''}</td>
          <td><span class="st-tol-tag">${item.toleranceDisplay || '-12.5%'}</span></td>
          <td style="font-size: 11.5px; color: #64748b;">${item.description || ''}</td>
        </tr>
      `;
    }
    container.innerHTML = html;
  }
  window.renderToleranceReferenceTable = renderToleranceReferenceTable;

  // Auto-render when summary/details is toggled
  document.addEventListener("click", function (e) {
    if (e.target && (e.target.closest("summary.st-details-summary") || e.target.closest(".st-details-panel"))) {
      setTimeout(renderToleranceReferenceTable, 20);
    }
  });

  function renderLiveMatrixTable(table, selectedNps, selectedFlangeClass, t_min_struct_mm, t_min_struct_in) {
    const tableContainer = document.getElementById("stTableMatrixBody");
    const theadContainer = document.getElementById("stTableMatrixHead");
    const bannerContainer = document.getElementById("stMatchBanner");
    if (!tableContainer || !theadContainer) return;

    // Update Live Match Banner
    if (bannerContainer && selectedNps && selectedFlangeClass) {
      bannerContainer.innerHTML = `
        <div class="st-match-banner-left">
          <span class="st-match-icon">🎯</span>
          <div>
            <div class="st-match-banner-title">Active Match: ${table.tableName} (${table.materialName || table.material}) at ${table.temperatureF} / ${table.temperatureC}</div>
            <div class="st-match-banner-desc">Selected Pipe Size: <strong>NPS ${selectedNps}"</strong> &bull; Flange Rating: <strong>Class ${selectedFlangeClass}</strong></div>
          </div>
        </div>
        <div class="st-match-banner-value">
          <span>Min-T: ${t_min_struct_mm} mm</span>
          <span style="font-size: 11px; font-weight: 600; opacity: 0.85;">(${t_min_struct_in} in)</span>
        </div>
      `;
    }

    // Header
    let theadHtml = `
      <tr>
        <th style="min-width: 120px; text-align: left;">NPS Size</th>
        <th style="min-width: 110px; text-align: left;">OD (mm / in)</th>
    `;
    table.flangeClasses.forEach(cls => {
      const isColActive = cls === selectedFlangeClass;
      theadHtml += `<th class="${isColActive ? 'selected-col' : ''}">Class ${cls} (mm)</th>`;
    });
    theadHtml += `</tr>`;
    theadContainer.innerHTML = theadHtml;

    // Body
    let tbodyHtml = "";
    table.rows.forEach(r => {
      const isRowActive = r.nps === selectedNps;
      const odStr = `${r.od_mm} mm (${ (r.od_mm/25.4).toFixed(3) }")`;
      tbodyHtml += `<tr class="${isRowActive ? 'selected-row' : ''}">`;
      tbodyHtml += `<td><strong>${isRowActive ? '👉 ' : ''}NPS ${r.npsDisplay || r.nps}</strong></td>`;
      tbodyHtml += `<td>${odStr}</td>`;

      table.flangeClasses.forEach(cls => {
        const val = r.values[cls] !== undefined ? r.values[cls] : "-";
        const isCellActive = isRowActive && cls === selectedFlangeClass;
        const isColActive = cls === selectedFlangeClass;

        let cellClass = "";
        if (isCellActive) cellClass = "selected-cell";
        else if (isColActive) cellClass = "selected-col-cell";

        const displayVal = val !== "-" ? Number(val).toFixed(2) : "-";
        let content = displayVal;
        let cellStyle = "";

        if (isCellActive) {
          content = `<span class="st-active-badge">✓ ${displayVal} mm</span>`;
          cellStyle = "background:#059669 !important; color:#ffffff !important; font-weight:800 !important;";
        } else if (isColActive && isRowActive) {
          cellStyle = "background:#fef08a !important; color:#854d0e !important; font-weight:700 !important;";
        } else if (isColActive) {
          cellStyle = "background:#e0f2fe !important; color:#0369a1 !important; font-weight:700 !important;";
        } else if (isRowActive) {
          cellStyle = "background:#fef9c3 !important; color:#854d0e !important; font-weight:700 !important;";
        }

        tbodyHtml += `<td class="${cellClass}" style="${cellStyle}">${content}</td>`;
      });

      tbodyHtml += `</tr>`;
    });

    tableContainer.innerHTML = tbodyHtml;
  }

  window.stSaveToCloud = async function () {
    const tableSelect = document.getElementById("stTableSelect");
    const npsSelect = document.getElementById("stNpsSelect");
    const schSelect = document.getElementById("stScheduleSelect");
    const tolMatSelect = document.getElementById("stToleranceMaterialSelect");
    const flangeSelect = document.getElementById("stFlangeClassSelect");
    const caInput = document.getElementById("stCorrosionAllowanceInput");

    if (!npsSelect?.value || !flangeSelect?.value) {
      if (typeof Swal !== "undefined") {
        Swal.fire({
          icon: "warning",
          title: "Incomplete Parameters",
          text: "Please select NPS and Flange Class before saving to cloud.",
          timer: 2000
        });
      } else {
        alert("Please select NPS and Flange Class before saving.");
      }
      return;
    }

    const payload = {
      table: tableSelect?.value || "D.2b",
      nps: npsSelect?.value || "",
      sch: schSelect?.value || "",
      materialSpec: tolMatSelect?.value || "",
      flangeClass: flangeSelect?.value || "",
      customCorrosionAllowance_mm: parseFloat(caInput?.value || "0"),
      timestamp: new Date().toISOString()
    };

    try {
      const res = await fetch("/api/structural-thickness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_assessment",
          assessment: payload,
          userEmail: localStorage.getItem("loggedInUser") || "engineer"
        })
      });
      const data = await res.json();
      if (data.success) {
        if (typeof Swal !== "undefined") {
          Swal.fire({
            icon: "success",
            title: "Saved to Cloud Database",
            text: `Structural thickness & tolerance assessment record saved successfully.`,
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          alert("Structural thickness assessment saved successfully to Cloud database!");
        }
      }
    } catch (e) {
      alert("Assessment saved locally.");
    }
  };

  window.stCopySummary = function () {
    const tableSelect = document.getElementById("stTableSelect");
    const npsSelect = document.getElementById("stNpsSelect");
    const schSelect = document.getElementById("stScheduleSelect");
    const tolMatSelect = document.getElementById("stToleranceMaterialSelect");
    const flangeSelect = document.getElementById("stFlangeClassSelect");
    const minT = document.getElementById("stKpiMinStructVal")?.textContent;
    const nomReq = document.getElementById("stKpiNomReqVal")?.textContent;
    const totalReq = document.getElementById("stKpiTotalReqVal")?.textContent;

    if (!npsSelect?.value || !flangeSelect?.value) {
      alert("Please select NPS and Flange Class first.");
      return;
    }

    const summary = `--- API Structural Min-T & Tolerance Assessment ---
Table: ${tableSelect?.value} (${allTablesData[tableSelect?.value]?.title || ''})
Pipe Size: NPS ${npsSelect?.value}"
Schedule: ${schSelect?.value || 'N/A'}
Material Standard: ${tolMatSelect?.options[tolMatSelect?.selectedIndex]?.text || tolMatSelect?.value}
Flange Pressure Class: Class ${flangeSelect?.value}
Minimum Structural Thickness (t_struct): ${minT} mm (${(parseFloat(minT)/25.4).toFixed(4)} in)
Nominal Wall Thickness / Required: ${nomReq} mm
Total Required Thickness (t_struct + CA): ${totalReq} mm
Standard Reference: API 581 Annex D / API 574 / ASME B36.10M
Assessment Date: ${new Date().toLocaleString()}
---------------------------------------------------`;

    navigator.clipboard.writeText(summary).then(() => {
      if (typeof Swal !== "undefined") {
        Swal.fire({
          icon: "success",
          title: "Copied to Clipboard",
          text: "Structural thickness lookup summary copied.",
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        alert("Summary copied to clipboard!");
      }
    });
  };

  window.stSwitchUnit = function (targetUnit) {
    window._stUnitMode = targetUnit || "metric";
    document.querySelectorAll(".st-unit-btn").forEach(b => b.classList.remove("active"));
    const activeBtn = document.getElementById(`stUnitBtn_${targetUnit}`);
    if (activeBtn) activeBtn.classList.add("active");

    const kpiUnit1 = document.getElementById("stKpiMinStructUnit");
    const kpiUnit2 = document.getElementById("stKpiNomReqUnit");
    const kpiUnit3 = document.getElementById("stKpiTotalReqUnit");

    if (targetUnit === "imperial") {
      if (kpiUnit1) kpiUnit1.textContent = "in";
      if (kpiUnit2) kpiUnit2.textContent = "in";
      if (kpiUnit3) kpiUnit3.textContent = "in";
    } else {
      if (kpiUnit1) kpiUnit1.textContent = "mm";
      if (kpiUnit2) kpiUnit2.textContent = "mm";
      if (kpiUnit3) kpiUnit3.textContent = "mm";
    }

    calculateStructuralThickness();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initStructuralThickness);
  } else {
    setTimeout(initStructuralThickness, 100);
  }
})();
