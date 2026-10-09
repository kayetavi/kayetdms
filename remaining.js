// ==========================================
// API 570 Corrosion & Remaining Life UI Module
// Frontend presentation and backend API bridge
// ==========================================

// ✅ Helper date formatter for UI display
function formatDate(date) {
  if (!date) return "";
  if (typeof date === "string" && /^\d{2}-\d{2}-\d{4}$/.test(date)) return date;
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

// ✅ Parse DD-MM-YYYY or Excel serial dates
function parseDDMMYYYY(value) {
  if (!value) return null;
  if (value instanceof Date && !isNaN(value.getTime())) return value;
  if (!isNaN(value) && value !== "") {
    return new Date((Number(value) - 25569) * 86400 * 1000 + (new Date().getTimezoneOffset() * 60000));
  }
  if (typeof value === "string") {
    value = value.trim().replace(/\./g, "-").replace(/\//g, "-");
    const match = value.match(/^(\d{1,2})-(\d{1,2})-(\d{2,4})$/);
    if (match) {
      const dd = parseInt(match[1], 10);
      const mm = parseInt(match[2], 10) - 1;
      const yyyy = match[3].length === 2 ? 2000 + parseInt(match[3], 10) : parseInt(match[3], 10);
      const parsed = new Date(yyyy, mm, dd);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

// ✅ Call Backend API for Single Corrosion Calculation
async function calculateRowAsync(row) {
  try {
    const response = await fetch("/api/remaining?action=calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ row })
    });
    if (!response.ok) throw new Error(`Server returned ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn("Backend calculation fallback:", err);
    return {
      error: "Backend calculation service unavailable. Please check inputs.",
      tagNumber: row.tagNumber || row.tagnumber || "-"
    };
  }
}

// Synchronous wrapper for legacy caller compatibility
function calculateRow(row) {
  const baseDate = parseDDMMYYYY(row.basedate || row.baseDate);
  const midDate = (row.middate || row.midDate) ? parseDDMMYYYY(row.middate || row.midDate) : null;
  const lastDate = parseDDMMYYYY(row.lastdate || row.lastDate);
  const baseThk = parseFloat(row.basethk != null ? row.basethk : row.baseThk);
  const midThk = parseFloat(row.midthk != null ? row.midthk : row.midThk);
  const lastThk = parseFloat(row.lastthk != null ? row.lastthk : row.lastThk);
  const tmin = parseFloat(row.tmin);
  const freq = parseInt(row.freq, 10) || 60;
  const tagNumber = row.tagnumber || row['tag number'] || row.tag || row.tagNumber || "-";

  if (
    isNaN(baseThk) || isNaN(lastThk) || isNaN(tmin) ||
    !baseDate || isNaN(baseDate.getTime()) ||
    !lastDate || isNaN(lastDate.getTime()) ||
    baseDate >= lastDate
  ) {
    return { error: "Invalid or missing base/last dates or thicknesses", tagNumber };
  }

  const ltcr = Math.max(0, (baseThk - lastThk) / ((lastDate - baseDate) / (1000 * 60 * 60 * 24 * 365.25)));
  let stcr = ltcr;
  if (midDate && !isNaN(midThk) && baseDate < midDate && midDate < lastDate) {
    stcr = Math.max(0, (midThk - lastThk) / ((lastDate - midDate) / (1000 * 60 * 60 * 24 * 365.25)));
  }

  const ccr = Math.max(ltcr, stcr);
  let remLifeYears = ccr > 0 ? (lastThk - tmin) / ccr : 999;
  if (remLifeYears < 0 || !isFinite(remLifeYears)) remLifeYears = 0;

  const projDate = new Date(lastDate);
  projDate.setDate(projDate.getDate() + Math.round(remLifeYears * 365.25));

  const factorDate = new Date(lastDate);
  factorDate.setDate(factorDate.getDate() + Math.round(remLifeYears * 0.5 * 365.25));

  const intervalDate = new Date(lastDate);
  intervalDate.setMonth(intervalDate.getMonth() + freq);

  let schedDate = intervalDate;
  if (projDate < schedDate) schedDate = projDate;
  if (factorDate < schedDate) schedDate = factorDate;

  const now = new Date();
  const yrsRem = Math.max(0, Math.floor(remLifeYears));
  const monthsRem = Math.max(0, Math.floor((remLifeYears - yrsRem) * 12));
  const daysRem = Math.max(0, Math.floor(((remLifeYears - yrsRem) * 12 - monthsRem) * 30.4));

  return {
    tagNumber,
    baseDate: formatDate(baseDate),
    midDate: midDate ? formatDate(midDate) : "-",
    lastDate: formatDate(lastDate),
    baseThk: baseThk.toFixed(2),
    midThk: !isNaN(midThk) ? midThk.toFixed(2) : "-",
    lastThk: lastThk.toFixed(2),
    tmin: tmin.toFixed(2),
    freq,
    controllingCorrosionRate: ccr.toFixed(4) + " mm/year",
    longTermCorrosionRate: ltcr.toFixed(4) + " mm/year",
    shortTermCorrosionRate: stcr.toFixed(4) + " mm/year",
    scheduledNextInspection: formatDate(schedDate),
    intervalNextInspection: formatDate(intervalDate),
    factorLifeDate: formatDate(factorDate),
    projectedTminDate: formatDate(projDate),
    estimatedLife: `${yrsRem} Years, ${monthsRem} Months, ${daysRem} Days`,
    factorLifeDuration: `${Math.floor(yrsRem * 0.5)} Years, ${Math.floor(monthsRem * 0.5)} Months, ${Math.floor(daysRem * 0.5)} Days`,
    trendData: [
      { date: formatDate(baseDate), thk: baseThk },
      ...(midDate && !isNaN(midThk) ? [{ date: formatDate(midDate), thk: midThk }] : []),
      { date: formatDate(lastDate), thk: lastThk }
    ]
  };
}

// ✅ Download Template fetched from Backend Configuration
async function downloadTemplate() {
  try {
    let templateData = null;
    try {
      const response = await fetch("/api/remaining?action=template");
      if (response.ok) {
        templateData = await response.json();
      }
    } catch (e) {
      console.warn("Could not fetch remote template config, using default schema:", e);
    }

    const headers = templateData?.template?.headers || [
      "Tag Number", "BaseDate", "BaseThk", "MidDate", "MidThk", "LastDate", "LastThk", "Tmin", "Freq"
    ];
    const blankRow = templateData?.template?.blankRow || ["", "", "", "", "", "", "", "", ""];
    const picklistData = templateData?.template?.picklist || [
      ["Column Name", "Tag Number", "BaseDate", "BaseThk", "MidDate", "MidThk", "LastDate", "LastThk", "Tmin", "Freq"],
      ["Description / Format / Example",
        "Unique equipment tag (e.g., E-101, P-201A)",
        "Inspection date (format: dd-mm-yyyy)",
        "Base measured thickness (mm) e.g., 6.5",
        "Mid inspection date (optional, dd-mm-yyyy)",
        "Mid thickness (optional, mm)",
        "Last inspection date (format: dd-mm-yyyy)",
        "Last measured thickness (mm) e.g., 6.0",
        "Minimum allowable thickness (mm) e.g., 3.8",
        "Inspection frequency in months (e.g., 24)"
      ]
    ];

    if (typeof XLSX === "undefined") {
      alert("Excel library is still loading. Please wait a moment.");
      return;
    }

    const wb = XLSX.utils.book_new();
    const wsMain = XLSX.utils.aoa_to_sheet([headers, blankRow]);
    const wsPicklist = XLSX.utils.aoa_to_sheet(picklistData);

    XLSX.utils.book_append_sheet(wb, wsMain, "Corrosion_Analysis_Details");
    XLSX.utils.book_append_sheet(wb, wsPicklist, "Picklist");
    XLSX.writeFile(wb, "corrosion_analysis_template.xlsx");
  } catch (err) {
    console.error("Error downloading template:", err);
    alert("Error downloading template: " + err.message);
  }
}

// ✅ SINGLE FORM CALCULATE HANDLER
async function calculate() {
  const row = {
    tagNumber: document.getElementById("tagNumber")?.value || "-",
    basedate: document.getElementById("baseDate")?.value,
    basethk: document.getElementById("baseThk")?.value,
    middate: document.getElementById("midDate")?.value,
    midthk: document.getElementById("midThk")?.value,
    lastdate: document.getElementById("lastDate")?.value,
    lastthk: document.getElementById("lastThk")?.value,
    tmin: document.getElementById("tmin")?.value,
    freq: document.getElementById("freq")?.value
  };

  let result = null;
  try {
    const res = await fetch("/api/remaining?action=calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ row })
    });
    if (res.ok) {
      result = await res.json();
    } else {
      const errData = await res.json().catch(() => ({}));
      result = { error: errData.error || `Server error (${res.status})` };
    }
  } catch (err) {
    result = { error: "Backend calculation service unavailable: " + err.message };
  }

  if (result.error) {
    if (typeof Swal !== "undefined") {
      Swal.fire({
        icon: "error",
        title: "Calculation Error",
        text: result.error,
        confirmButtonColor: "#d33"
      });
    } else {
      alert(result.error);
    }
    return;
  }

  // ✅ UI Output updates
  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerText = val != null ? val : "-";
  };

  setEl("ccr", result.controllingCorrosionRate);
  setEl("ltcr", result.longTermCorrosionRate);
  setEl("stcr", result.shortTermCorrosionRate);
  setEl("schedDate", result.scheduledNextInspection);
  setEl("intDate", result.intervalNextInspection);
  setEl("factorDate", `${result.factorLifeDuration} (${result.factorLifeDate})`);
  setEl("projDate", `${result.estimatedLife} (${result.projectedTminDate})`);
  setEl("tminVal", result.tmin);
  setEl("remLife", `${result.estimatedLife} (${result.projectedTminDate})`);

  if (result.trendData) {
    drawTrendChart(result.trendData);
  }
}

// ✅ TREND CHART
let trendChart;
let lastChartDataPoints = null;

function getChartColors() {
  const isDark = document.documentElement.classList.contains("dark-mode") || !document.documentElement.classList.contains("light-mode");
  return {
    text: isDark ? "#cbd5e1" : "#4b5563",
    grid: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)",
    border: isDark ? "#475569" : "#d1d5db"
  };
}

function drawTrendChart(dataPoints) {
  lastChartDataPoints = dataPoints;
  const canvas = document.getElementById("thicknessTrendChart");
  if (!canvas || typeof Chart === "undefined") return;
  const ctx = canvas.getContext("2d");
  if (trendChart) trendChart.destroy();

  const colors = getChartColors();

  trendChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: dataPoints.map(p => formatDate(p.date)),
      datasets: [{
        label: "Thickness (mm)",
        data: dataPoints.map(p => p.thk),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.15)",
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: "#3b82f6"
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: colors.text }
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          title: { display: true, text: 'Thickness (mm)', color: colors.text },
          ticks: { color: colors.text },
          grid: { color: colors.grid }
        },
        x: {
          title: { display: true, text: 'Date', color: colors.text },
          ticks: { color: colors.text },
          grid: { color: colors.grid }
        }
      }
    }
  });
}

window.updateChartTheme = function() {
  if (trendChart && lastChartDataPoints) {
    drawTrendChart(lastChartDataPoints);
  }
};
window.addEventListener("themechange", () => {
  if (window.updateChartTheme) window.updateChartTheme();
});

// ✅ Excel / CSV Bulk Parser with Backend Processing
async function parseCSV() {
  const fileInput = document.getElementById("bulkUpload");
  const file = fileInput?.files?.[0];
  if (!file) {
    alert("Please upload an Excel (.xlsx/.xls) or CSV file.");
    return;
  }

  const reader = new FileReader();

  if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
    reader.onload = async function (e) {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheet];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (jsonData.length === 0) {
          alert("Excel sheet is empty!");
          return;
        }

        const normalizedRows = jsonData.map(rowObj => {
          const normalized = {};
          Object.keys(rowObj).forEach(k => {
            const key = k.trim().toLowerCase().replace(/\s+/g, "");
            normalized[key] = rowObj[k];
          });

          ["basedate", "middate", "lastdate"].forEach(field => {
            if (normalized[field] != null && normalized[field] !== "") {
              let val = normalized[field];
              if (!isNaN(val) && val !== "") {
                const excelDate = new Date((Number(val) - 25569) * 86400 * 1000);
                normalized[field] = formatDate(excelDate);
                return;
              }
              if (val instanceof Date && !isNaN(val.getTime())) {
                normalized[field] = formatDate(val);
                return;
              }
              if (typeof val === "string") {
                val = val.trim().replace(/\./g, "-").replace(/\\/g, "/");
                const m = val.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})$/);
                if (m) {
                  const dd = parseInt(m[1], 10);
                  const mm = parseInt(m[2], 10);
                  const yyyy = m[3].length === 2 ? "20" + m[3] : m[3];
                  normalized[field] = `${String(dd).padStart(2, '0')}-${String(mm).padStart(2, '0')}-${yyyy}`;
                  return;
                }
              }
            }
          });

          return normalized;
        });

        // Send to Backend Bulk Calculator (Authoritative)
        let results = [];
        try {
          const resp = await fetch("/api/remaining", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "calculate-bulk", rows: normalizedRows })
          });
          if (resp.ok) {
            const data = await resp.json();
            results = data.results || [];
          } else {
            const errData = await resp.json().catch(() => ({}));
            alert("Backend Calculation Error: " + (errData.error || `Server status ${resp.status}`));
            return;
          }
        } catch (err) {
          alert("Backend calculation service unavailable: " + err.message);
          return;
        }

        showBulkResults(results);
      } catch (err) {
        alert("Error reading Excel file: " + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  } else {
    reader.onload = async function (e) {
      try {
        const csvText = e.target.result.trim();
        const lines = csvText.split("\n").filter(line => line.trim() !== "");
        if (lines.length < 2) {
          alert("CSV must have at least one data row.");
          return;
        }

        const delimiter = lines[0].includes(";") ? ";" : ",";
        const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase().replace(/\s+/g, ""));
        const rows = [];

        for (let i = 1; i < lines.length; i++) {
          const rowCells = lines[i].split(delimiter).map(c => c.trim());
          const rowObj = {};
          headers.forEach((header, idx) => (rowObj[header] = rowCells[idx]));
          rows.push(rowObj);
        }

        let results = [];
        try {
          const resp = await fetch("/api/remaining", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "calculate-bulk", rows })
          });
          if (resp.ok) {
            const data = await resp.json();
            results = data.results || [];
          } else {
            const errData = await resp.json().catch(() => ({}));
            alert("Backend Calculation Error: " + (errData.error || `Server status ${resp.status}`));
            return;
          }
        } catch (err) {
          alert("Backend calculation service unavailable: " + err.message);
          return;
        }

        showBulkResults(results);
      } catch (err) {
        alert("Error reading CSV file: " + err.message);
      }
    };
    reader.readAsText(file);
  }
}

// ✅ Close Modal
window.closeBulkModal = function() {
  const modal = document.getElementById("bulkPreviewModal");
  if (modal) modal.style.display = "none";
};

document.addEventListener("DOMContentLoaded", function() {
  const modal = document.getElementById("bulkPreviewModal");
  const closeBtn = document.getElementById("closeBulkBtn");
  if (closeBtn && modal) {
    closeBtn.addEventListener("click", () => { modal.style.display = "none"; });
  }
});

function exportBulkTableToExcel() {
  const table = document.getElementById("bulkPreviewTable");
  if (!table || typeof XLSX === "undefined") return;
  const wb = XLSX.utils.table_to_book(table, { sheet: "Preview" });
  XLSX.writeFile(wb, "Bulk_Corrosion_Analysis.xlsx");
}

function exportBulkTableToPDF() {
  if (!window.jspdf) {
    alert("PDF library is loading. Please try again.");
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("l", "mm", "a4");

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Bulk Corrosion Analysis Report", 14, 15);
  doc.setFontSize(10);
  doc.text("API 570 Inspection & Remaining Life Estimator", 14, 22);
  doc.text("Date: " + new Date().toLocaleDateString(), 14, 28);

  doc.autoTable({
    html: "#bulkPreviewTable",
    startY: 34,
    styles: {
      fontSize: 8,
      cellPadding: 2,
      halign: "center",
      valign: "middle"
    },
    headStyles: {
      fillColor: [0, 102, 204],
      textColor: 255
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250]
    }
  });

  doc.save("Bulk_Corrosion_Analysis_Report.pdf");
}

function toggleSettingsMenu(event) {
  if (event) event.stopPropagation();
  const menu = document.getElementById('settingsMenu');
  if (menu) menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
}

document.addEventListener('click', () => {
  const menu = document.getElementById('settingsMenu');
  if (menu) menu.style.display = 'none';
});

function closeSettingsMenu() {
  const menu = document.getElementById('settingsMenu');
  if (menu) menu.style.display = 'none';
}

// ✅ Save Analysis to Backend Storage & Cache
async function saveAnalysisToServer(singleData = null) {
  try {
    let newEntries = [];

    // Case 1: Manual Single Entry Save
    if (!singleData) {
      const baseDate = document.getElementById("baseDate")?.value?.trim();
      const lastDate = document.getElementById("lastDate")?.value?.trim();
      const baseThk = document.getElementById("baseThk")?.value?.trim();
      const lastThk = document.getElementById("lastThk")?.value?.trim();
      const tmin = document.getElementById("tmin")?.value?.trim();
      const tagNumber = document.getElementById("tagNumber")?.value?.trim() || "-";

      if (!baseDate || !lastDate || !baseThk || !lastThk || !tmin) {
        Swal.fire({
          icon: 'warning',
          title: '⚠️ Missing Required Fields',
          text: 'Missing required fields (Base Date, Last Date, Base/Last Thickness, Tmin). Save cancelled.',
          confirmButtonColor: '#d33'
        });
        return;
      }

      const analysisData = {
        tagNumber,
        ccr: document.getElementById("ccr")?.innerText || "-",
        ltcr: document.getElementById("ltcr")?.innerText || "-",
        stcr: document.getElementById("stcr")?.innerText || "-",
        tminVal: document.getElementById("tminVal")?.innerText || "-",
        remLife: document.getElementById("remLife")?.innerText || "-",
        schedDate: document.getElementById("schedDate")?.innerText || "-",
        projDate: document.getElementById("projDate")?.innerText || "-",
        savedAt: new Date().toLocaleString()
      };

      // Persist to Backend API
      await fetch("/api/remaining", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save", data: analysisData, overwrite: true })
      });

      // Update LocalStorage cache
      const existing = JSON.parse(localStorage.getItem("analyses") || "[]");
      if (tagNumber !== "-" && tagNumber !== "") {
        const idx = existing.findIndex(d => d.tagNumber?.toUpperCase() === tagNumber.toUpperCase());
        if (idx !== -1) {
          existing[idx] = analysisData;
        } else {
          existing.push(analysisData);
        }
      } else {
        existing.push(analysisData);
      }
      localStorage.setItem("analyses", JSON.stringify(existing));

      Swal.fire({
        icon: 'success',
        title: '✅ Save Successful',
        text: tagNumber === "-" ? "Analysis saved (no Tag Number)." : `Tag "${tagNumber}" saved to database successfully.`,
        timer: 2000,
        showConfirmButton: false,
        customClass: { popup: "small-swal-popup" }
      });
      return;
    }

    // Case 2: Bulk Upload Save
    else if (Array.isArray(singleData)) {
      newEntries = singleData
        .filter(r => !r.error && r.baseDate && r.lastDate && r.baseThk && r.lastThk && r.tmin)
        .map(r => ({
          tagNumber: r.tagNumber || "-",
          ccr: r.controllingCorrosionRate || "-",
          ltcr: r.longTermCorrosionRate || "-",
          stcr: r.shortTermCorrosionRate || "-",
          tminVal: r.tmin || "-",
          remLife: r.estimatedLife || "-",
          schedDate: r.scheduledNextInspection || "-",
          projDate: r.projectedTminDate || "-",
          savedAt: new Date().toLocaleString()
        }));

      if (newEntries.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: '⚠️ Nothing Saved',
          text: 'All bulk records invalid or missing required fields. Nothing saved.',
          confirmButtonColor: '#d33'
        });
        return;
      }

      // Persist to Backend API
      await fetch("/api/remaining", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save", data: newEntries, overwrite: true })
      });

      // Update LocalStorage cache
      const existing = JSON.parse(localStorage.getItem("analyses") || "[]");
      newEntries.forEach(entry => {
        const idx = existing.findIndex(e => e.tagNumber?.toUpperCase() === entry.tagNumber?.toUpperCase());
        if (idx !== -1) existing[idx] = entry;
        else existing.push(entry);
      });
      localStorage.setItem("analyses", JSON.stringify(existing));

      Swal.fire({
        icon: "success",
        title: "✅ Bulk Save Complete",
        text: `Saved ${newEntries.length} record(s) to secure backend database.`,
        timer: 2000,
        showConfirmButton: false,
        customClass: { popup: "small-swal-popup" }
      });
    }
  } catch (err) {
    console.error("Error saving analysis:", err);
    Swal.fire({
      icon: 'error',
      title: '❌ Save Failed',
      text: `Failed to save data: ${err.message}`,
      confirmButtonColor: '#d33'
    });
  }
}

// ✅ View Saved Analyses
async function viewSavedAnalyses() {
  const modal = document.getElementById("savedDataModal");
  const container = document.getElementById("savedDataTable");
  if (!modal || !container) return;

  let data = [];
  try {
    const res = await fetch("/api/remaining?action=get-analyses");
    if (res.ok) {
      data = await res.json();
    }
  } catch (e) {
    console.warn("Using localStorage cache for analyses:", e);
  }

  if (!data || data.length === 0) {
    data = JSON.parse(localStorage.getItem("analyses") || "[]");
  }

  if (!data || data.length === 0) {
    container.innerHTML = "<p style='text-align:center; color:#888; padding:20px;'>No saved analysis records found in database.</p>";
  } else {
    let tableHTML = `
      <table class="saved-data-table">
        <thead>
          <tr>
            <th>Tag</th>
            <th>CCR</th>
            <th>LTCR</th>
            <th>STCR</th>
            <th>Tmin</th>
            <th>Remaining Life</th>
            <th>Schedule Date</th>
            <th>Projected Date</th>
            <th>Saved At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>`;

    data.forEach((row, index) => {
      tableHTML += `
        <tr>
          <td>${row.tagNumber || "-"}</td>
          <td>${row.ccr || "-"}</td>
          <td>${row.ltcr || "-"}</td>
          <td>${row.stcr || "-"}</td>
          <td>${row.tminVal || row.tmin || "-"}</td>
          <td>${row.remLife || "-"}</td>
          <td>${row.schedDate || "-"}</td>
          <td>${row.projDate || "-"}</td>
          <td>${row.savedAt || "-"}</td>
          <td>
            <button class="saved-data-delete-btn" onclick="deleteAnalysis(${index})">Delete</button>
          </td>
        </tr>`;
    });

    tableHTML += "</tbody></table>";
    container.innerHTML = tableHTML;
  }

  modal.style.display = "flex";
}

function closeSavedDataModal() {
  const modal = document.getElementById("savedDataModal");
  if (modal) modal.style.display = "none";
}

async function deleteAnalysis(index) {
  if (confirm("Are you sure you want to delete this record?")) {
    try {
      await fetch("/api/remaining", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", index })
      });
    } catch (e) {
      console.warn("Backend delete sync:", e);
    }
    const data = JSON.parse(localStorage.getItem("analyses") || "[]");
    if (index >= 0 && index < data.length) {
      data.splice(index, 1);
      localStorage.setItem("analyses", JSON.stringify(data));
    }
    viewSavedAnalyses();
  }
}

async function clearAllAnalyses() {
  if (confirm("⚠️ This will delete ALL saved analyses from the database. Continue?")) {
    try {
      await fetch("/api/remaining", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear-all" })
      });
    } catch (e) {
      console.warn("Backend clear sync:", e);
    }
    localStorage.removeItem("analyses");
    viewSavedAnalyses();
  }
}

window.onclick = function (event) {
  const modal = document.getElementById("savedDataModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

function showBulkResults(results) {
  const uniqueMap = new Map();
  const duplicates = [];

  results.forEach(r => {
    const tag = (r.tagNumber || "").trim().toUpperCase();
    if (tag && tag !== "-" && uniqueMap.has(tag)) {
      duplicates.push(tag);
    } else if (tag && tag !== "-") {
      uniqueMap.set(tag, r);
    } else {
      uniqueMap.set(`ITEM_${Math.random()}`, r);
    }
  });

  const uniqueResults = Array.from(uniqueMap.values());

  if (duplicates.length > 0 && typeof Swal !== "undefined") {
    Swal.fire({
      icon: "warning",
      title: "⚠️ Duplicate Tag Numbers Found",
      text: `The following Tag Numbers were duplicated and consolidated:\n\n${[...new Set(duplicates)].join(", ")}`,
      confirmButtonColor: "#f39c12"
    });
  }

  const table = document.getElementById("bulkPreviewTable");
  if (!table) return;
  table.innerHTML = "";

  const resultsToShow = uniqueResults;
  const firstValid = resultsToShow.find(r => !r.error);

  if (!firstValid) {
    let headerRow = "<tr><th>Tag Number</th><th>Error Description</th></tr>";
    table.innerHTML = headerRow;

    resultsToShow.forEach(res => {
      let rowHtml = `<tr><td>${res.tagNumber || "-"}</td><td style="color:red;">${res.error}</td></tr>`;
      table.innerHTML += rowHtml;
    });

    const modal = document.getElementById("bulkPreviewModal");
    if (modal) modal.style.display = "block";
    return;
  }

  const fieldKeys = ["tagNumber", "baseDate", "baseThk", "midDate", "midThk", "lastDate", "lastThk", "tmin", "freq", "controllingCorrosionRate", "longTermCorrosionRate", "shortTermCorrosionRate", "scheduledNextInspection", "projectedTminDate", "estimatedLife"];
  let headerRow = "<tr>";
  fieldKeys.forEach(h => {
    const displayHeader = h.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    headerRow += `<th>${displayHeader}</th>`;
  });
  if (resultsToShow.some(r => r.error)) headerRow += `<th>Error</th>`;
  headerRow += "</tr>";
  table.innerHTML = headerRow;

  resultsToShow.forEach(res => {
    let rowHtml = "<tr>";
    fieldKeys.forEach(h => {
      rowHtml += `<td>${res[h] !== undefined ? res[h] : "-"}</td>`;
    });
    if (resultsToShow.some(r => r.error)) {
      rowHtml += `<td style="color:${res.error ? "red" : "inherit"};">${res.error || "-"}</td>`;
    }
    rowHtml += "</tr>";
    table.innerHTML += rowHtml;
  });

  const modal = document.getElementById("bulkPreviewModal");
  if (modal) modal.style.display = "block";

  // Auto-save unique valid results to backend database
  saveAnalysisToServer(resultsToShow);
}

// Export functions to window
window.formatDate = formatDate;
window.parseDDMMYYYY = parseDDMMYYYY;
window.calculateRow = calculateRow;
window.calculate = calculate;
window.downloadTemplate = downloadTemplate;
window.parseCSV = parseCSV;
window.saveAnalysisToServer = saveAnalysisToServer;
window.viewSavedAnalyses = viewSavedAnalyses;
window.closeSavedDataModal = closeSavedDataModal;
window.deleteAnalysis = deleteAnalysis;
window.clearAllAnalyses = clearAllAnalyses;
window.showBulkResults = showBulkResults;
window.exportBulkTableToExcel = exportBulkTableToExcel;
window.exportBulkTableToPDF = exportBulkTableToPDF;
window.toggleSettingsMenu = toggleSettingsMenu;
window.closeSettingsMenu = closeSettingsMenu;
