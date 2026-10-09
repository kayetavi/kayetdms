// ============================================================================
// PIPE DATA SCRIPT 883 (UI Client & Backend API Bridge)
// ASME B36.10M / ASME B36.19M Pipe Dimensional Data Interface
// Master dimensional datasets & geometric calculations
// ============================================================================

(function () {
  // Authoritative ASME B36.10M / B36.19M Master Dimensional Dataset
  const MASTER_PIPE_OD = {
    "1/8": 10.3, "0.125": 10.3,
    "1/4": 13.7, "0.25": 13.7,
    "3/8": 17.1, "0.375": 17.1,
    "1/2": 21.3, "0.5": 21.3,
    "3/4": 26.7, "0.75": 26.7,
    "1": 33.4, "1.0": 33.4,
    "1 1/4": 42.2, "1.25": 42.2,
    "1 1/2": 48.3, "1.5": 48.3,
    "2": 60.3, "2.0": 60.3,
    "2 1/2": 73.0, "2.5": 73.0,
    "3": 88.9, "3.0": 88.9,
    "3 1/2": 101.6, "3.5": 101.6,
    "4": 114.3, "4.0": 114.3,
    "5": 141.3, "5.0": 141.3,
    "6": 168.3, "6.0": 168.3,
    "8": 219.1, "8.0": 219.1,
    "10": 273.0, "10.0": 273.0,
    "12": 323.8, "12.0": 323.8,
    "14": 355.6, "14.0": 355.6,
    "16": 406.4, "16.0": 406.4,
    "18": 457.0, "18.0": 457.0,
    "20": 508.0, "20.0": 508.0,
    "22": 559.0, "22.0": 559.0,
    "24": 610.0, "24.0": 610.0,
    "26": 660.0, "26.0": 660.0,
    "28": 711.0, "28.0": 711.0,
    "30": 762.0, "30.0": 762.0,
    "32": 813.0, "32.0": 813.0,
    "34": 864.0, "34.0": 864.0,
    "36": 914.0, "36.0": 914.0,
    "40": 1016.0, "40.0": 1016.0,
    "42": 1067.0, "42.0": 1067.0,
    "48": 1219.0, "48.0": 1219.0
  };

  const MASTER_PIPE_DATA = {
    "1/8": { "SCH 10S": 1.24, "SCH 40": 1.73, "SCH STD": 1.73, "SCH 80": 2.41, "SCH XS": 2.41 },
    "1/4": { "SCH 10S": 1.65, "SCH 40": 2.24, "SCH STD": 2.24, "SCH 80": 3.02, "SCH XS": 3.02 },
    "3/8": { "SCH 10S": 1.65, "SCH 40": 2.31, "SCH STD": 2.31, "SCH 80": 3.20, "SCH XS": 3.20 },
    "1/2": { "SCH 5S": 1.65, "SCH 10S": 2.11, "SCH 40": 2.77, "SCH 40S": 2.77, "SCH STD": 2.77, "SCH 80": 3.73, "SCH 80S": 3.73, "SCH XS": 3.73, "SCH 160": 4.78, "SCH XXS": 7.47 },
    "3/4": { "SCH 5S": 1.65, "SCH 10S": 2.11, "SCH 40": 2.87, "SCH 40S": 2.87, "SCH STD": 2.87, "SCH 80": 3.91, "SCH 80S": 3.91, "SCH XS": 3.91, "SCH 160": 5.56, "SCH XXS": 7.82 },
    "1": { "SCH 5S": 1.65, "SCH 10S": 2.77, "SCH 40": 3.38, "SCH 40S": 3.38, "SCH STD": 3.38, "SCH 80": 4.55, "SCH 80S": 4.55, "SCH XS": 4.55, "SCH 160": 6.35, "SCH XXS": 9.09 },
    "1 1/4": { "SCH 5S": 1.65, "SCH 10S": 2.77, "SCH 40": 3.56, "SCH 40S": 3.56, "SCH STD": 3.56, "SCH 80": 4.85, "SCH 80S": 4.85, "SCH XS": 4.85, "SCH 160": 6.35, "SCH XXS": 9.70 },
    "1 1/2": { "SCH 5S": 1.65, "SCH 10S": 2.77, "SCH 40": 3.68, "SCH 40S": 3.68, "SCH STD": 3.68, "SCH 80": 5.08, "SCH 80S": 5.08, "SCH XS": 5.08, "SCH 160": 7.14, "SCH XXS": 10.15 },
    "2": { "SCH 5S": 1.65, "SCH 10S": 2.77, "SCH 40": 3.91, "SCH 40S": 3.91, "SCH STD": 3.91, "SCH 80": 5.54, "SCH 80S": 5.54, "SCH XS": 5.54, "SCH 160": 8.74, "SCH XXS": 11.07 },
    "2 1/2": { "SCH 5S": 2.11, "SCH 10S": 3.05, "SCH 40": 5.16, "SCH 40S": 5.16, "SCH STD": 5.16, "SCH 80": 7.01, "SCH 80S": 7.01, "SCH XS": 7.01, "SCH 160": 9.53, "SCH XXS": 14.02 },
    "3": { "SCH 5S": 2.11, "SCH 10S": 3.05, "SCH 40": 5.49, "SCH 40S": 5.49, "SCH STD": 5.49, "SCH 80": 7.62, "SCH 80S": 7.62, "SCH XS": 7.62, "SCH 160": 11.13, "SCH XXS": 15.24 },
    "3 1/2": { "SCH 5S": 2.11, "SCH 10S": 3.05, "SCH 40": 5.74, "SCH 40S": 5.74, "SCH STD": 5.74, "SCH 80": 8.08, "SCH 80S": 8.08, "SCH XS": 8.08 },
    "4": { "SCH 5S": 2.11, "SCH 10S": 3.05, "SCH 40": 6.02, "SCH 40S": 6.02, "SCH STD": 6.02, "SCH 80": 8.56, "SCH 80S": 8.56, "SCH XS": 8.56, "SCH 120": 11.13, "SCH 160": 13.49, "SCH XXS": 17.12 },
    "5": { "SCH 5S": 2.77, "SCH 10S": 3.40, "SCH 40": 6.55, "SCH 40S": 6.55, "SCH STD": 6.55, "SCH 80": 9.53, "SCH 80S": 9.53, "SCH XS": 9.53, "SCH 120": 12.70, "SCH 160": 15.88, "SCH XXS": 19.05 },
    "6": { "SCH 5S": 2.77, "SCH 10S": 3.40, "SCH 40": 7.11, "SCH 40S": 7.11, "SCH STD": 7.11, "SCH 80": 10.97, "SCH 80S": 10.97, "SCH XS": 10.97, "SCH 120": 14.27, "SCH 160": 18.26, "SCH XXS": 21.95 },
    "8": { "SCH 5S": 2.77, "SCH 10S": 3.76, "SCH 20": 6.35, "SCH 30": 7.04, "SCH 40": 8.18, "SCH 40S": 8.18, "SCH STD": 8.18, "SCH 60": 10.31, "SCH 80": 12.70, "SCH 80S": 12.70, "SCH XS": 12.70, "SCH 100": 15.09, "SCH 120": 18.26, "SCH 140": 20.62, "SCH 160": 23.01, "SCH XXS": 22.23 },
    "10": { "SCH 5S": 3.40, "SCH 10S": 4.19, "SCH 20": 6.35, "SCH 30": 7.80, "SCH 40": 9.27, "SCH 40S": 9.27, "SCH STD": 9.27, "SCH 60": 12.70, "SCH 80": 15.09, "SCH 80S": 15.09, "SCH XS": 12.70, "SCH 100": 18.26, "SCH 120": 21.44, "SCH 140": 25.40, "SCH 160": 28.58, "SCH XXS": 25.40 },
    "12": { "SCH 5S": 3.96, "SCH 10S": 4.57, "SCH 20": 6.35, "SCH 30": 8.38, "SCH STD": 9.53, "SCH 40": 10.31, "SCH 40S": 9.53, "SCH XS": 12.70, "SCH 60": 14.27, "SCH 80": 17.48, "SCH 80S": 12.70, "SCH 100": 21.44, "SCH 120": 25.40, "SCH 140": 28.58, "SCH 160": 33.32, "SCH XXS": 25.40 },
    "14": { "SCH 10S": 4.78, "SCH 10": 6.35, "SCH 20": 7.92, "SCH 30": 9.53, "SCH STD": 9.53, "SCH 40": 11.13, "SCH XS": 12.70, "SCH 60": 15.09, "SCH 80": 19.05, "SCH 100": 23.83, "SCH 120": 27.79, "SCH 140": 31.75, "SCH 160": 35.71 },
    "16": { "SCH 10S": 4.78, "SCH 10": 6.35, "SCH 20": 7.92, "SCH 30": 9.53, "SCH STD": 9.53, "SCH 40": 12.70, "SCH XS": 12.70, "SCH 60": 16.66, "SCH 80": 21.44, "SCH 100": 26.19, "SCH 120": 30.96, "SCH 140": 36.53, "SCH 160": 40.49 },
    "18": { "SCH 10S": 4.78, "SCH 10": 6.35, "SCH 20": 7.92, "SCH STD": 9.53, "SCH 30": 11.13, "SCH XS": 12.70, "SCH 40": 14.27, "SCH 60": 19.05, "SCH 80": 23.83, "SCH 100": 29.36, "SCH 120": 34.93, "SCH 140": 39.67, "SCH 160": 45.24 },
    "20": { "SCH 10S": 5.54, "SCH 10": 6.35, "SCH 20": 9.53, "SCH STD": 9.53, "SCH XS": 12.70, "SCH 30": 12.70, "SCH 40": 15.09, "SCH 60": 20.62, "SCH 80": 26.19, "SCH 100": 32.54, "SCH 120": 38.10, "SCH 140": 44.45, "SCH 160": 50.01 },
    "22": { "SCH 10S": 5.54, "SCH 10": 6.35, "SCH 20": 9.53, "SCH STD": 9.53, "SCH XS": 12.70, "SCH 30": 12.70, "SCH 40": 15.09, "SCH 60": 22.23, "SCH 80": 28.58, "SCH 100": 34.93, "SCH 120": 41.28, "SCH 140": 47.63, "SCH 160": 53.98 },
    "24": { "SCH 10S": 5.54, "SCH 10": 6.35, "SCH 20": 9.53, "SCH STD": 9.53, "SCH XS": 12.70, "SCH 30": 14.27, "SCH 40": 17.48, "SCH 60": 24.61, "SCH 80": 30.96, "SCH 100": 38.89, "SCH 120": 46.02, "SCH 140": 52.37, "SCH 160": 59.54 },
    "26": { "SCH 10": 7.92, "SCH STD": 9.53, "SCH XS": 12.70 },
    "28": { "SCH 10": 7.92, "SCH STD": 9.53, "SCH XS": 12.70, "SCH 20": 12.70, "SCH 30": 15.88 },
    "30": { "SCH 10": 7.92, "SCH STD": 9.53, "SCH XS": 12.70, "SCH 20": 12.70, "SCH 30": 15.88 },
    "32": { "SCH 10": 7.92, "SCH STD": 9.53, "SCH XS": 12.70, "SCH 20": 12.70, "SCH 30": 15.88, "SCH 40": 17.48 },
    "34": { "SCH 10": 7.92, "SCH STD": 9.53, "SCH XS": 12.70, "SCH 20": 12.70, "SCH 30": 15.88, "SCH 40": 17.48 },
    "36": { "SCH 10": 7.92, "SCH STD": 9.53, "SCH XS": 12.70, "SCH 20": 12.70, "SCH 30": 15.88, "SCH 40": 19.05 },
    "40": { "SCH 10": 9.53, "SCH STD": 9.53, "SCH XS": 12.70 },
    "42": { "SCH 10": 9.53, "SCH STD": 9.53, "SCH XS": 12.70 },
    "48": { "SCH 10": 9.53, "SCH STD": 9.53, "SCH XS": 12.70 }
  };

  // Add decimal aliases to MASTER_PIPE_DATA
  const DECIMAL_MAP = {
    "1/8": "0.125", "1/4": "0.25", "3/8": "0.375", "1/2": "0.5",
    "3/4": "0.75", "1": "1.0", "1 1/4": "1.25", "1 1/2": "1.5",
    "2": "2.0", "2 1/2": "2.5", "3": "3.0", "3 1/2": "3.5",
    "4": "4.0", "5": "5.0", "6": "6.0", "8": "8.0",
    "10": "10.0", "12": "12.0", "14": "14.0", "16": "16.0",
    "18": "18.0", "20": "20.0", "22": "22.0", "24": "24.0"
  };

  for (const [frac, dec] of Object.entries(DECIMAL_MAP)) {
    if (MASTER_PIPE_DATA[frac]) {
      MASTER_PIPE_DATA[dec] = MASTER_PIPE_DATA[frac];
      const clean = dec.replace(/\.0$/, "");
      if (clean && !MASTER_PIPE_DATA[clean]) {
        MASTER_PIPE_DATA[clean] = MASTER_PIPE_DATA[frac];
      }
    }
  }

  // Initialize global datasets immediately
  if (typeof window !== "undefined") {
    window.pipeOD883 = Object.assign(window.pipeOD883 || {}, MASTER_PIPE_OD);
    window.pipeDataMaster883 = Object.assign(window.pipeDataMaster883 || {}, MASTER_PIPE_DATA);
  }

  const STANDARD_NPS_LIST = [
    "1/8", "1/4", "3/8", "1/2", "3/4", "1", "1 1/4", "1 1/2",
    "2", "2 1/2", "3", "3 1/2", "4", "5", "6", "8",
    "10", "12", "14", "16", "18", "20", "22", "24",
    "26", "28", "30", "32", "34", "36", "40", "42", "48"
  ];

  /**
   * Fetch master pipe dimensions from backend API and merge
   */
  async function loadPipeDimensionsFromBackend() {
    try {
      const res = await fetch("/api/pipe-dimensions");
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      if (data.success) {
        if (data.pipeOD) {
          Object.assign(window.pipeOD883, data.pipeOD);
        }
        if (data.pipeDataMaster) {
          Object.assign(window.pipeDataMaster883, data.pipeDataMaster);
        }
        populateNPSDropdown();
      }
    } catch (err) {
      console.warn("Pipe dimensions backend fetch notice (using verified local master):", err);
    }
  }

  /**
   * Populate NPS dropdown from data
   */
  function populateNPSDropdown() {
    const selectNPS883 = document.getElementById("select_nps_883");
    if (!selectNPS883) return;

    const currentNps = selectNPS883.value;
    selectNPS883.innerHTML = `<option value="">-- Select NPS Size --</option>`;

    const odMap = window.pipeOD883 || MASTER_PIPE_OD;

    STANDARD_NPS_LIST.forEach(nps => {
      const od = odMap[nps] || MASTER_PIPE_OD[nps];
      const opt = document.createElement("option");
      opt.value = nps;
      opt.textContent = od
        ? `NPS ${nps}" (OD: ${od} mm / ${(od / 25.4).toFixed(3)}")`
        : `NPS ${nps}"`;
      if (nps === currentNps) opt.selected = true;
      selectNPS883.appendChild(opt);
    });

    // If nothing selected yet, default to standard NPS 2"
    if (!selectNPS883.value && STANDARD_NPS_LIST.includes("2")) {
      selectNPS883.value = "2";
      updateScheduleOptions("2");
    }
  }

  /**
   * Populate schedule dropdown based on chosen NPS
   */
  function updateScheduleOptions(nps) {
    const selectSCH883 = document.getElementById("select_sch_883");
    if (!selectSCH883) return;

    selectSCH883.innerHTML = `<option value="">-- Select Schedule (SCH) --</option>`;

    const master = window.pipeDataMaster883 || MASTER_PIPE_DATA;
    const schedules = master[nps] || master[DECIMAL_MAP[nps]] || {};
    const schKeys = Object.keys(schedules);

    if (schKeys.length === 0) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "-- No schedules defined for this size --";
      selectSCH883.appendChild(opt);
      renderPipeResults(null, null, null);
      return;
    }

    schKeys.forEach(sch => {
      const wt = schedules[sch];
      const opt = document.createElement("option");
      opt.value = sch;
      opt.textContent = wt
        ? `${sch} — (WT: ${wt} mm / ${(wt / 25.4).toFixed(3)}")`
        : sch;
      selectSCH883.appendChild(opt);
    });

    // Auto-select standard schedule (SCH 40 or SCH STD)
    if (schKeys.includes("SCH 40")) {
      selectSCH883.value = "SCH 40";
    } else if (schKeys.includes("SCH STD")) {
      selectSCH883.value = "SCH STD";
    } else if (schKeys.includes("SCH 40S")) {
      selectSCH883.value = "SCH 40S";
    } else if (schKeys.length > 0) {
      selectSCH883.value = schKeys[0];
    }

    calculateAndRender(nps, selectSCH883.value);
  }

  /**
   * Calculate and render dimensions
   */
  function calculateAndRender(nps, sch) {
    if (!nps || !sch) {
      renderPipeResults(null, null, null);
      return;
    }

    const master = window.pipeDataMaster883 || MASTER_PIPE_DATA;
    const odMap = window.pipeOD883 || MASTER_PIPE_OD;

    const schedules = master[nps] || master[DECIMAL_MAP[nps]] || {};
    const thickVal = schedules[sch];
    const odVal = odMap[nps] || odMap[DECIMAL_MAP[nps]];

    const thick = parseFloat(thickVal);
    const od = parseFloat(odVal);

    if (isNaN(thick) || isNaN(od) || thick <= 0 || od <= 0) {
      renderPipeResults(null, null, null);
      return;
    }

    const id = parseFloat((od - 2 * thick).toFixed(2));
    const circumference = parseFloat((Math.PI * od).toFixed(2));
    const unitWeightKg = parseFloat((0.0246615 * thick * (od - thick)).toFixed(2));
    const unitWeightLb = parseFloat((unitWeightKg * 0.6719689).toFixed(2));
    const flowAreaCm2 = parseFloat(((Math.PI / 4) * Math.pow(id / 10, 2)).toFixed(2));

    renderPipeResults({
      nps,
      sch,
      od,
      thick,
      id,
      circumference,
      unitWeightKg,
      unitWeightLb,
      flowAreaCm2
    });
  }

  /**
   * Render result cards into DOM
   */
  function renderPipeResults(calc) {
    const resultThickness = document.getElementById("result_thickness_883");
    const resultOD = document.getElementById("result_od_883");
    const resultCirc = document.getElementById("result_circumference_883");
    const resultID = document.getElementById("result_id_883");

    if (!calc) {
      if (resultThickness) resultThickness.innerHTML = `<span style="color: #cbd5e1; font-size: 16px; font-weight: normal;">Please select an NPS size and Schedule above.</span>`;
      if (resultOD) resultOD.innerHTML = "";
      if (resultCirc) resultCirc.innerHTML = "";
      if (resultID) resultID.innerHTML = "";
      return;
    }

    const thickIn = (calc.thick / 25.4).toFixed(3);
    const odIn = (calc.od / 25.4).toFixed(3);
    const idIn = (calc.id / 25.4).toFixed(3);
    const circIn = (calc.circumference / 25.4).toFixed(3);

    if (resultThickness) {
      resultThickness.innerHTML = `
        <div class="pipe-results-grid">
          <div class="pipe-result-card" style="border-left: 4px solid #38bdf8;">
            <span class="res-label">📏 Nominal Wall Thickness (t):</span>
            <span class="res-val">${calc.thick} mm <span style="font-size: 13px; color: #94a3b8; font-weight: 500;">(${thickIn}")</span></span>
          </div>
          <div class="pipe-result-card" style="border-left: 4px solid #60a5fa;">
            <span class="res-label">⭕ Outside Diameter (OD):</span>
            <span class="res-val">${calc.od} mm <span style="font-size: 13px; color: #94a3b8; font-weight: 500;">(${odIn}")</span></span>
          </div>
          <div class="pipe-result-card" style="border-left: 4px solid #34d399;">
            <span class="res-label">🔘 Inside Diameter (ID):</span>
            <span class="res-val" style="color: #34d399;">${calc.id} mm <span style="font-size: 13px; color: #94a3b8; font-weight: 500;">(${idIn}")</span></span>
          </div>
          <div class="pipe-result-card" style="border-left: 4px solid #a78bfa;">
            <span class="res-label">🔄 Outer Circumference:</span>
            <span class="res-val" style="color: #c084fc;">${calc.circumference} mm <span style="font-size: 13px; color: #94a3b8; font-weight: 500;">(${circIn}")</span></span>
          </div>
          <div class="pipe-result-card" style="border-left: 4px solid #fbbf24;">
            <span class="res-label">⚖️ Plain End Pipe Weight:</span>
            <span class="res-val" style="color: #fbbf24; font-size: 15px;">${calc.unitWeightKg} kg/m <span style="font-size: 12px; color: #94a3b8;">(${calc.unitWeightLb} lb/ft)</span></span>
          </div>
          <div class="pipe-result-card" style="border-left: 4px solid #38bdf8;">
            <span class="res-label">🌊 Internal Flow Area:</span>
            <span class="res-val" style="font-size: 15px;">${calc.flowAreaCm2} cm²</span>
          </div>
        </div>
      `;
    }

    if (resultOD) resultOD.innerHTML = "";
    if (resultCirc) resultCirc.innerHTML = "";
    if (resultID) resultID.innerHTML = "";
  }

  /**
   * Main initializer for Pipe Thickness Finder
   */
  function initPipeData883() {
    const selectNPS883 = document.getElementById("select_nps_883");
    const selectSCH883 = document.getElementById("select_sch_883");

    if (!selectNPS883 || !selectSCH883) return;

    if (!selectNPS883._bound) {
      selectNPS883._bound = true;
      selectNPS883.addEventListener("change", function () {
        updateScheduleOptions(this.value);
      });
    }

    if (!selectSCH883._bound) {
      selectSCH883._bound = true;
      selectSCH883.addEventListener("change", function () {
        calculateAndRender(selectNPS883.value, this.value);
      });
    }

    populateNPSDropdown();

    if (selectNPS883.value) {
      updateScheduleOptions(selectNPS883.value);
    }
  }

  // Load backend API asynchronously while keeping instant local datasets active
  loadPipeDimensionsFromBackend();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPipeData883);
  } else {
    initPipeData883();
  }

  // Auto-init on tab navigation or DOM mutation
  document.addEventListener("click", function (e) {
    if (e.target && e.target.closest && e.target.closest('[data-rbac-sub="pipeThickness"], [href*="pipeThickness"]')) {
      setTimeout(initPipeData883, 50);
    }
  });

  window.initPipeData883 = initPipeData883;
  window.loadPipeDimensionsFromBackend = loadPipeDimensionsFromBackend;
  window.populateNPSDropdown = populateNPSDropdown;
  window.updateScheduleOptions = updateScheduleOptions;
})();
