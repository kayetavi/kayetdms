import fs from "fs";
import path from "path";

const CONFIG_PATH = path.join(process.cwd(), "data", "secure", "remaining_life_config.json");
const ANALYSES_PATH = path.join(process.cwd(), "data", "analyses.json");

/**
 * Format Date as dd-mm-yyyy
 */
function formatDate(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) return "";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

/**
 * Parse dd-mm-yyyy, dd/mm/yyyy, ISO, or Excel serial numbers
 */
function parseDDMMYYYY(value) {
  if (!value) return null;
  if (value instanceof Date && !isNaN(value.getTime())) return value;

  // Numeric Excel serial number
  if (!isNaN(value) && value !== "") {
    const parsed = new Date((Number(value) - 25569) * 86400 * 1000 + (new Date().getTimezoneOffset() * 60000));
    return isNaN(parsed.getTime()) ? null : parsed;
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

/**
 * Calculate precise difference in years, months, days
 */
function dateDiff(startDate, endDate) {
  const start = parseDDMMYYYY(startDate);
  const end = parseDDMMYYYY(endDate);

  if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { years: 0, months: 0, days: 0 };
  }

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months--;
    const lastMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += lastMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days };
}

/**
 * Core API 570 Corrosion & Remaining Life Calculation Engine
 */
function calculateCorrosionRow(row) {
  const tagNumber = row.tagnumber || row["tag number"] || row.tag || row.tagNumber || "-";

  const baseDate = parseDDMMYYYY(row.basedate || row.baseDate);
  const midDate = (row.middate || row.midDate) ? parseDDMMYYYY(row.middate || row.midDate) : null;
  const lastDate = parseDDMMYYYY(row.lastdate || row.lastDate);

  const baseThk = parseFloat(row.basethk != null ? row.basethk : row.baseThk);
  const midThk = parseFloat(row.midthk != null ? row.midthk : row.midThk);
  const lastThk = parseFloat(row.lastthk != null ? row.lastthk : row.lastThk);
  const tmin = parseFloat(row.tmin);
  const freq = parseInt(row.freq, 10) || 60;

  if (
    isNaN(baseThk) || isNaN(lastThk) || isNaN(tmin) ||
    !baseDate || isNaN(baseDate.getTime()) ||
    !lastDate || isNaN(lastDate.getTime()) ||
    baseDate >= lastDate
  ) {
    return {
      error: "Invalid or missing base/last dates or thicknesses",
      tagNumber
    };
  }

  // Corrosion Rate Calculations
  const daysInYear = 365.25;
  const msInYear = 1000 * 60 * 60 * 24 * daysInYear;

  let ltcr = (baseThk - lastThk) / ((lastDate - baseDate) / msInYear);
  ltcr = ltcr < 0 ? 0 : ltcr;

  let stcr = ltcr;
  if (midDate && !isNaN(midThk) && baseDate < midDate && midDate < lastDate) {
    stcr = (midThk - lastThk) / ((lastDate - midDate) / msInYear);
    stcr = stcr < 0 ? 0 : stcr;
  }

  const ccr = Math.max(ltcr, stcr);
  let remLifeYears = ccr > 0 ? (lastThk - tmin) / ccr : 999;
  if (remLifeYears < 0 || !isFinite(remLifeYears)) remLifeYears = 0;

  const projDate = new Date(lastDate);
  const projDaysToAdd = Math.round(remLifeYears * daysInYear);
  projDate.setDate(projDate.getDate() + projDaysToAdd);

  const factorDate = new Date(lastDate);
  const factorDaysToAdd = Math.round(remLifeYears * 0.5 * daysInYear);
  factorDate.setDate(factorDate.getDate() + factorDaysToAdd);

  const intervalDate = new Date(lastDate);
  intervalDate.setMonth(intervalDate.getMonth() + freq);

  let schedDate = intervalDate;
  if (projDate < schedDate) schedDate = projDate;
  if (factorDate < schedDate) schedDate = factorDate;

  const today = new Date();
  const estDiff = dateDiff(today, projDate);
  const factorDiff = dateDiff(today, factorDate);

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
    estimatedLife: `${estDiff.years} Years, ${estDiff.months} Months, ${estDiff.days} Days`,
    factorLifeDuration: `${factorDiff.years} Years, ${factorDiff.months} Months, ${factorDiff.days} Days`,
    rawCalculations: {
      ltcr,
      stcr,
      ccr,
      remLifeYears,
      schedDateISO: schedDate.toISOString(),
      projDateISO: projDate.toISOString(),
      factorDateISO: factorDate.toISOString(),
      intervalDateISO: intervalDate.toISOString()
    },
    trendData: [
      { date: formatDate(baseDate), thk: baseThk },
      ...(midDate && !isNaN(midThk) ? [{ date: formatDate(midDate), thk: midThk }] : []),
      { date: formatDate(lastDate), thk: lastThk }
    ]
  };
}

/**
 * Load / Save helper for Analyses Database
 */
function getSavedAnalyses() {
  try {
    if (!fs.existsSync(ANALYSES_PATH)) {
      return [];
    }
    return JSON.parse(fs.readFileSync(ANALYSES_PATH, "utf8") || "[]");
  } catch {
    return [];
  }
}

function writeSavedAnalyses(data) {
  const dir = path.dirname(ANALYSES_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(ANALYSES_PATH, JSON.stringify(data, null, 2), "utf8");
}

/**
 * Primary Backend API Handler for Remaining Life & Corrosion Estimator
 */
export default async function handler(req, res) {
  const method = req.method;
  const action = req.query.action || req.body?.action || "calculate";

  try {
    // 1. Fetch Template & Schema Config
    if (action === "template" || action === "config") {
      if (fs.existsSync(CONFIG_PATH)) {
        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
        return res.status(200).json(config);
      }
      return res.status(200).json({
        template: {
          headers: ["Tag Number", "BaseDate", "BaseThk", "MidDate", "MidThk", "LastDate", "LastThk", "Tmin", "Freq"],
          picklist: [
            ["Column Name", "Tag Number", "BaseDate", "BaseThk", "MidDate", "MidThk", "LastDate", "LastThk", "Tmin", "Freq"],
            ["Description / Format / Example", "Unique equipment tag (e.g., E-101, P-201A)", "Inspection date (format: dd-mm-yyyy)", "Base measured thickness (mm) e.g., 6.5", "Mid inspection date (optional, dd-mm-yyyy)", "Mid thickness (optional, mm)", "Last inspection date (format: dd-mm-yyyy)", "Last measured thickness (mm) e.g., 6.0", "Minimum allowable thickness (mm) e.g., 3.8", "Inspection frequency in months (e.g., 24)"]
          ]
        }
      });
    }

    // 2. Single Form Calculation
    if (action === "calculate" && (method === "POST" || method === "GET")) {
      const payload = method === "POST" ? (req.body?.row || req.body) : req.query;
      const result = calculateCorrosionRow(payload);
      return res.status(200).json(result);
    }

    // 3. Bulk Batch Calculation
    if (action === "calculate-bulk" && method === "POST") {
      const rows = req.body?.rows || [];
      if (!Array.isArray(rows) || rows.length === 0) {
        return res.status(400).json({ error: "No rows provided for bulk calculation" });
      }

      const results = rows.map(r => calculateCorrosionRow(r));
      return res.status(200).json({ success: true, count: results.length, results });
    }

    // 4. Get Saved Analyses from Backend Storage
    if (action === "get-analyses" || (action === "saved" && method === "GET")) {
      const data = getSavedAnalyses();
      return res.status(200).json(data);
    }

    // 5. Save Analysis Records (Single or Bulk)
    if (action === "save" && method === "POST") {
      const entriesToSave = Array.isArray(req.body?.data) ? req.body.data : [req.body?.data || req.body];
      const overwrite = req.body?.overwrite === true;
      const existing = getSavedAnalyses();

      const sanitized = entriesToSave.filter(Boolean).map(e => ({
        tagNumber: e.tagNumber || "-",
        ccr: e.ccr || e.controllingCorrosionRate || "-",
        ltcr: e.ltcr || e.longTermCorrosionRate || "-",
        stcr: e.stcr || e.shortTermCorrosionRate || "-",
        tminVal: e.tminVal || e.tmin || "-",
        remLife: e.remLife || e.estimatedLife || "-",
        schedDate: e.schedDate || e.scheduledNextInspection || "-",
        projDate: e.projDate || e.projectedTminDate || "-",
        savedAt: e.savedAt || new Date().toLocaleString()
      }));

      let added = 0;
      let updated = 0;

      sanitized.forEach(item => {
        if (item.tagNumber && item.tagNumber !== "-") {
          const idx = existing.findIndex(ex => ex.tagNumber?.toUpperCase() === item.tagNumber.toUpperCase());
          if (idx !== -1) {
            if (overwrite) {
              existing[idx] = item;
              updated++;
            }
          } else {
            existing.push(item);
            added++;
          }
        } else {
          existing.push(item);
          added++;
        }
      });

      writeSavedAnalyses(existing);
      return res.status(200).json({
        success: true,
        message: "Analyses saved successfully",
        total: existing.length,
        added,
        updated
      });
    }

    // 6. Delete Analysis Record
    if (action === "delete" && (method === "DELETE" || method === "POST")) {
      const index = parseInt(req.body?.index ?? req.query.index, 10);
      const tag = req.body?.tag || req.query.tag;
      let existing = getSavedAnalyses();

      if (!isNaN(index) && index >= 0 && index < existing.length) {
        existing.splice(index, 1);
        writeSavedAnalyses(existing);
        return res.status(200).json({ success: true, message: `Record at index ${index} deleted`, total: existing.length });
      } else if (tag) {
        const initialLen = existing.length;
        existing = existing.filter(e => e.tagNumber?.toUpperCase() !== tag.toUpperCase());
        writeSavedAnalyses(existing);
        return res.status(200).json({ success: true, message: `Record with tag ${tag} deleted`, deleted: initialLen - existing.length });
      }

      return res.status(400).json({ error: "Invalid index or tag provided for deletion" });
    }

    // 7. Clear All Analyses
    if (action === "clear-all" && (method === "DELETE" || method === "POST")) {
      writeSavedAnalyses([]);
      return res.status(200).json({ success: true, message: "All analyses cleared", total: 0 });
    }

    return res.status(400).json({ error: "Unsupported action or method" });
  } catch (err) {
    console.error("API /api/remaining error:", err);
    return res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
}
