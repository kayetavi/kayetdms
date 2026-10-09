// ================================================================
// API 571 DAMAGE MECHANISM SCREENING CALCULATOR & MATRIX UI ENGINE
// Fully Namespaced (a571_ / a571-) Frontend Presentation Layer
// Integrated with Backend Screening Matrix API (/api/damage-criteria)
// ================================================================

// Global presets & cloud units container synchronized with backend
if (typeof window !== "undefined") {
    window.a571_UNITS = window.a571_UNITS || [];
    window.a571_ALL_UNIT_STREAMS = window.a571_ALL_UNIT_STREAMS || [];
    window.a571_CURRENT_STREAMS = window.a571_CURRENT_STREAMS || [];
    window.a571_STREAM_PRESETS = window.a571_STREAM_PRESETS || {};
    window.a571_EROSION_TABLE = window.a571_EROSION_TABLE || {};
    window.a571_lastScreenedData = null;
    window.a571_lastScreenedResults = null;
}

/**
 * Robust helper to auto-detect Operating Case from stream records
 */
function a571_detectStreamCase(s) {
    if (!s) return "";
    if (s.caseName && String(s.caseName).trim()) {
        return String(s.caseName).trim();
    }
    const raw = `${s.streamNo || ''} ${s.name || ''} ${s.content || ''} ${s.description || ''}`;
    
    // Check bracket tags like [SOR], [EOR], [Case 1], [Case 2], [Run 1]
    const bracketMatch = raw.match(/\[\s*([^\]]+?)\s*\]/);
    if (bracketMatch && bracketMatch[1]) {
        const tag = bracketMatch[1].trim();
        if (/^(sor|eor|case\s*[-_]?\s*\d+|case\s*[-_]?\s*[a-z]|run\s*[-_]?\s*\d+|turndown|design|normal|guarantee)/i.test(tag)) {
            if (/^sor\b/i.test(tag)) return "SOR";
            if (/^eor\b/i.test(tag)) return "EOR";
            const cm = tag.match(/^case\s*[-_]?\s*(\d+|[a-z])/i);
            if (cm) return `Case ${cm[1].toUpperCase()}`;
            return tag;
        }
    }
    
    // Check parenthesis tags like (SOR), (EOR), (Case 1), (Case 2)
    const parenMatch = raw.match(/\(\s*([^\)]+?)\s*\)/);
    if (parenMatch && parenMatch[1]) {
        const tag = parenMatch[1].trim();
        if (/^(sor|eor|case\s*[-_]?\s*\d+|case\s*[-_]?\s*[a-z]|run\s*[-_]?\s*\d+|turndown|design|normal)/i.test(tag)) {
            if (/^sor\b/i.test(tag)) return "SOR";
            if (/^eor\b/i.test(tag)) return "EOR";
            const cm = tag.match(/^case\s*[-_]?\s*(\d+|[a-z])/i);
            if (cm) return `Case ${cm[1].toUpperCase()}`;
            return tag;
        }
    }

    if (/\b(sor|start\s*of\s*run)\b/i.test(raw)) return "SOR";
    if (/\b(eor|end\s*of\s*run)\b/i.test(raw)) return "EOR";
    const caseMatch = raw.match(/\bcase\s*[-_]?\s*(\d+|[a-z])\b/i);
    if (caseMatch) return `Case ${caseMatch[1].toUpperCase()}`;
    const runMatch = raw.match(/\brun\s*[-_]?\s*(\d+)\b/i);
    if (runMatch) return `Run ${runMatch[1]}`;
    if (/\bturndown\b/i.test(raw)) return "Turndown";
    if (/\bdesign\b/i.test(raw) && !/\bdesign\s*(press|temp)/i.test(raw)) return "Design";
    
    return "";
}

/**
 * Populate stream dropdown with option elements
 */
function a571_populateStreamSelectorOptions(streams, defaultSelectStreamId = "") {
    const streamSelector = document.getElementById("a571-streamPresetSelector");
    if (!streamSelector) return;

    if (!streams || streams.length === 0) {
        streamSelector.innerHTML = '<option value="">-- No streams found in selected Case --</option>';
        streamSelector.disabled = true;
        return;
    }

    const countLabel = streams.length === 1 ? "1 stream available" : `${streams.length} available`;
    streamSelector.innerHTML = `<option value="">-- Select Process Stream (${countLabel}) --</option>`;

    streams.forEach((s) => {
        const opt = document.createElement("option");
        opt.value = s.id || s.streamNo;
        const phaseHint = s.phase ? `${s.phase}, ` : "";
        const tempVal = s.temp !== undefined ? s.temp : (s.tempC !== undefined ? s.tempC : "");
        const tempHint = (tempVal !== null && tempVal !== "") ? `${tempVal}°C` : "";
        const flowHint = s.massFlow ? `, ${(s.massFlow / 1000).toFixed(1)} t/h` : "";
        const details = (phaseHint || tempHint || flowHint) ? ` (${phaseHint}${tempHint}${flowHint})` : "";
        const caseTag = s.detectedCase ? `[${s.detectedCase}] ` : "";
        opt.textContent = `${caseTag}${s.name || `Stream ${s.streamNo || s.id}`}${details}`;
        streamSelector.appendChild(opt);
    });

    if (defaultSelectStreamId && streams.some(s => (s.id === defaultSelectStreamId || s.streamNo === defaultSelectStreamId))) {
        streamSelector.value = defaultSelectStreamId;
    }

    streamSelector.disabled = false;
}

/**
 * Handle Case Selection Change: Filters streams for the active unit by Operating Case
 */
function a571_onCaseSelectionChange(caseVal) {
    const alertBox = document.getElementById("a571-autoloadAlert");
    if (alertBox) alertBox.style.display = "none";

    const allStreams = window.a571_ALL_UNIT_STREAMS || [];
    if (allStreams.length === 0) return;

    let filtered = allStreams;
    if (caseVal && caseVal !== "all") {
        filtered = allStreams.filter(s => String(s.detectedCase || "").toUpperCase() === String(caseVal).toUpperCase());
    }

    window.a571_CURRENT_STREAMS = filtered;
    a571_populateStreamSelectorOptions(filtered);
}

/**
 * Dynamically fetch available Units from Cloud / Database API
 */
async function a571_fetchUnits() {
    const unitSelector = document.getElementById("a571-unitSelector");
    const caseSelector = document.getElementById("a571-caseSelector");
    const caseWrap = document.getElementById("a571-caseWrap");
    const streamSelector = document.getElementById("a571-streamPresetSelector");
    if (!unitSelector) return;

    unitSelector.innerHTML = '<option value="">Loading Units...</option>';
    unitSelector.disabled = true;

    if (caseWrap) caseWrap.style.display = "none";
    if (caseSelector) {
        caseSelector.innerHTML = '<option value="all">-- All Cases --</option>';
    }

    if (streamSelector) {
        streamSelector.innerHTML = '<option value="">-- Select Process Stream --</option>';
        streamSelector.disabled = true;
    }

    try {
        const res = await fetch("/api/damage-criteria?action=units");
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        const data = await res.json();

        if (data.success && Array.isArray(data.units) && data.units.length > 0) {
            window.a571_UNITS = data.units;
            unitSelector.innerHTML = '<option value="">-- Select Unit --</option>';
            data.units.forEach((u) => {
                const opt = document.createElement("option");
                opt.value = u.id;
                const countBadge = u.streamCount !== undefined ? ` (${u.streamCount} streams)` : "";
                opt.textContent = `${u.name || u.id}${countBadge}`;
                unitSelector.appendChild(opt);
            });
        } else {
            unitSelector.innerHTML = '<option value="">-- No Units Found in Cloud --</option>';
        }
    } catch (err) {
        console.warn("[API 571] Failed to fetch units from cloud database:", err);
        unitSelector.innerHTML = '<option value="">⚠️ Error loading units (Click to retry)</option>';
        const alertBox = document.getElementById("a571-autoloadAlert");
        if (alertBox) {
            alertBox.style.display = "block";
            alertBox.innerHTML = `
                <div class="a571-alert-inner" style="background:#fee2e2; border-color:#fca5a5; color:#991b1b;">
                    <span class="a571-alert-icon" style="color:#dc2626;">⚠️</span>
                    <div>
                        <strong>Database Unavailable:</strong> Could not load Units from cloud. 
                        <button type="button" onclick="a571_fetchUnits()" style="margin-left:8px; padding:2px 8px; font-size:12px; font-weight:700; background:#dc2626; color:#fff; border:none; border-radius:4px; cursor:pointer;">Retry</button>
                    </div>
                </div>
            `;
        }
    } finally {
        unitSelector.disabled = false;
    }
}

/**
 * Handle Unit Selection Change: Auto-detects Operating Cases for this Unit, loads dependent Streams & Clears Stale Data
 */
async function a571_onUnitSelectionChange(unitId) {
    const streamSelector = document.getElementById("a571-streamPresetSelector");
    const caseSelector = document.getElementById("a571-caseSelector");
    const caseWrap = document.getElementById("a571-caseWrap");
    const alertBox = document.getElementById("a571-autoloadAlert");

    // 1. Prevent stale data: Clear previous form inputs and results immediately
    a571_clearFormInputsOnly();
    if (alertBox) alertBox.style.display = "none";

    if (!streamSelector) return;

    if (!unitId) {
        streamSelector.innerHTML = '<option value="">-- Select Process Stream --</option>';
        streamSelector.disabled = true;
        if (caseWrap) caseWrap.style.display = "none";
        if (caseSelector) {
            caseSelector.innerHTML = '<option value="all">-- All Cases --</option>';
        }
        window.a571_ALL_UNIT_STREAMS = [];
        window.a571_CURRENT_STREAMS = [];
        return;
    }

    // 2. Set UI loading state for Streams
    streamSelector.innerHTML = '<option value="">Loading Streams...</option>';
    streamSelector.disabled = true;
    if (caseWrap) caseWrap.style.display = "none";

    try {
        const res = await fetch(`/api/damage-criteria?action=streams&unit=${encodeURIComponent(unitId)}`);
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        const data = await res.json();

        if (data.success && Array.isArray(data.streams) && data.streams.length > 0) {
            // Tag each stream with detected case
            data.streams.forEach(s => {
                s.detectedCase = a571_detectStreamCase(s);
            });

            window.a571_ALL_UNIT_STREAMS = data.streams;
            window.a571_CURRENT_STREAMS = data.streams;

            // Auto-detect distinct Operating Cases (e.g. SOR, EOR, Case 1, Case 2)
            const caseCounts = new Map();
            data.streams.forEach(s => {
                const c = (s.detectedCase || "").trim();
                if (c) {
                    caseCounts.set(c, (caseCounts.get(c) || 0) + 1);
                }
            });

            const distinctCases = Array.from(caseCounts.keys());

            // If unit has multiple operating cases, show and populate Case Dropdown
            if (distinctCases.length >= 2) {
                if (caseSelector && caseWrap) {
                    caseWrap.style.display = "block";
                    caseSelector.innerHTML = "";

                    // All Cases option
                    const allOpt = document.createElement("option");
                    allOpt.value = "all";
                    allOpt.textContent = `🌐 All Cases (${data.streams.length} Streams)`;
                    caseSelector.appendChild(allOpt);

                    // Individual Cases
                    distinctCases.forEach(cName => {
                        const cnt = caseCounts.get(cName);
                        let icon = '⚡';
                        const upper = cName.toUpperCase();
                        if (upper.includes('SOR') || upper.includes('START')) icon = '🟢';
                        else if (upper.includes('EOR') || upper.includes('END')) icon = '🔴';
                        else if (upper.includes('CASE 1') || upper.includes('RUN 1')) icon = '🔷';
                        else if (upper.includes('CASE 2') || upper.includes('RUN 2')) icon = '🔶';
                        else if (upper.includes('CASE 3') || upper.includes('RUN 3')) icon = '🟣';
                        else if (upper.includes('TURNDOWN')) icon = '📉';
                        else if (upper.includes('DESIGN')) icon = '📐';

                        const opt = document.createElement("option");
                        opt.value = cName;
                        opt.textContent = `${icon} ${cName} (${cnt} stream${cnt > 1 ? 's' : ''})`;
                        caseSelector.appendChild(opt);
                    });

                    caseSelector.value = "all";
                    caseSelector.disabled = false;
                }
            } else {
                // Single operating state or no case variation
                if (caseWrap) caseWrap.style.display = "none";
                if (caseSelector) {
                    caseSelector.innerHTML = '<option value="all">-- All Cases --</option>';
                }
            }

            // Populate stream selector with all streams (or filtered if a case was previously active)
            a571_populateStreamSelectorOptions(data.streams);
        } else {
            window.a571_ALL_UNIT_STREAMS = [];
            window.a571_CURRENT_STREAMS = [];
            if (caseWrap) caseWrap.style.display = "none";
            streamSelector.innerHTML = `<option value="">-- No process streams found for Unit ${a571_escapeHTML(unitId)} --</option>`;
            streamSelector.disabled = false;
        }
    } catch (err) {
        console.warn(`[API 571] Failed to fetch streams for unit ${unitId}:`, err);
        streamSelector.innerHTML = '<option value="">⚠️ Failed to load streams (Click to retry)</option>';
        streamSelector.disabled = false;
        if (caseWrap) caseWrap.style.display = "none";
        if (alertBox) {
            alertBox.style.display = "block";
            alertBox.innerHTML = `
                <div class="a571-alert-inner" style="background:#fee2e2; border-color:#fca5a5; color:#991b1b;">
                    <span class="a571-alert-icon" style="color:#dc2626;">⚠️</span>
                    <div>
                        <strong>Stream Load Error:</strong> Failed to fetch process streams for unit <em>${a571_escapeHTML(unitId)}</em>. 
                        <button type="button" onclick="a571_onUnitSelectionChange('${a571_escapeHTML(unitId)}')" style="margin-left:8px; padding:2px 8px; font-size:12px; font-weight:700; background:#dc2626; color:#fff; border:none; border-radius:4px; cursor:pointer;">Retry</button>
                    </div>
                </div>
            `;
        }
    }
}

/**
 * Handle Stream selection change
 */
function a571_onPresetSelectionChange(streamId) {
    // If user changes stream dropdown, clear previously displayed alert until loaded
    const alertBox = document.getElementById("a571-autoloadAlert");
    if (alertBox && !streamId) alertBox.style.display = "none";
}

/**
 * Fetch Stream Presets and Erosion Reference tables from Backend
 */
async function a571_loadPresetsFromBackend() {
    try {
        const res = await fetch("/api/damage-criteria?action=presets");
        if (res.ok) {
            const data = await res.json();
            if (data.presets) {
                Object.assign(window.a571_STREAM_PRESETS, data.presets);
            }
            if (data.erosionTable) {
                Object.assign(window.a571_EROSION_TABLE, data.erosionTable);
            }
        }
    } catch (err) {
        console.warn("Backend presets fetch notice:", err);
    }
}

// Start loading backend units and presets
a571_loadPresetsFromBackend();

// =================================================================
// INITIALIZATION & EVENT LISTENERS
// =================================================================
function a571_init() {
    const filterForm = document.getElementById("a571-filterForm");
    if (!filterForm || filterForm._bound) return;
    filterForm._bound = true;

    // Dynamically fetch Units from cloud database on load
    a571_fetchUnits();

    // Auto-sync NH3 Significant dropdown when NH3 input changes
    const nh3Input = document.getElementById("a571-nh3");
    const nh3SigSelect = document.getElementById("a571-nh3Significant");
    if (nh3Input && nh3SigSelect) {
        nh3Input.addEventListener("input", function() {
            const val = parseFloat(nh3Input.value || 0);
            nh3SigSelect.value = val > 0 ? "Y" : "N";
        });
    }

    // Auto-sync Nelson Curve Metallurgy when carbonSteel, stress, or crContent changes
    const csSelect = document.getElementById("a571-carbonSteel");
    const stressSelect = document.getElementById("a571-stress");
    const crInput = document.getElementById("a571-crContent");
    const nelsonSelect = document.getElementById("a571-nelsonMaterial");

    let nelsonMaterialUserModified = false;
    window.a571_nelsonMaterialUserModified = false;

    if (nelsonSelect) {
        nelsonSelect.addEventListener("change", function() {
            nelsonMaterialUserModified = true;
            window.a571_nelsonMaterialUserModified = true;
        });
    }

    function syncNelsonMetallurgy() {
        if (!nelsonSelect) return;
        // Manual override protection: do not overwrite user's deliberate metallurgy selection
        if (nelsonMaterialUserModified || window.a571_nelsonMaterialUserModified) return;

        const cs = csSelect ? csSelect.value : "Y";
        const stress = stressSelect ? stressSelect.value : "Y";
        const cr = crInput ? parseFloat(crInput.value || 0) : 0;

        if (cs === "Y" && stress === "Y") nelsonSelect.value = "CS_NON_PWHT";
        else if (cs === "Y" && stress === "N") nelsonSelect.value = "CS_PWHT";
        else if (cr >= 2.0) nelsonSelect.value = "225CR_1MO";
        else if (cr >= 1.0) nelsonSelect.value = "125CR_05MO";
    }

    if (csSelect) csSelect.addEventListener("change", syncNelsonMetallurgy);
    if (stressSelect) stressSelect.addEventListener("change", syncNelsonMetallurgy);
    if (crInput) crInput.addEventListener("input", syncNelsonMetallurgy);

    // FORM SUBMIT HANDLER
    filterForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        // Read Form Input Data
        const data = {
            stream: a571_getValue("a571-streamName") || "Unnamed Stream",
            phase: a571_normalizeText(a571_getValue("a571-phase")),
            temp: a571_numberValue("a571-temperature"),
            pressure: a571_numberValue("a571-pressure") || 10,
            h2: a571_numberValue("a571-h2"),
            h2MolFrac: a571_numberValue("a571-h2MolFrac"),
            h2s: a571_numberValue("a571-h2s"),
            nh3: a571_numberValue("a571-nh3"),
            nh3Significant: a571_normalizeYesNo(a571_getValue("a571-nh3Significant")),
            otherContamSignificant: a571_normalizeYesNo(a571_getValue("a571-otherContamSignificant")),
            h2o: a571_numberValue("a571-h2o"),
            co2: a571_numberValue("a571-co2"),
            carbonSteel: a571_normalizeYesNo(a571_getValue("a571-carbonSteel")),
            cr: a571_numberValue("a571-crContent"),
            stress: a571_normalizeYesNo(a571_getValue("a571-stress")),
            nelsonMaterial: a571_getValue("a571-nelsonMaterial") || "CS_NON_PWHT",
            hardness: a571_normalizeYesNo(a571_getValue("a571-hardness")),
            oxygen: a571_normalizeYesNo(a571_getValue("a571-oxygen")),
            amineFlow: a571_numberValue("a571-amineFlow"),
            amineType: a571_getValue("a571-amineType"),
            amineService: a571_normalizeText(a571_getValue("a571-amineService")),
            hsas: a571_numberValue("a571-hsas"),
            ph: a571_numberValue("a571-ph"),
            velocityFlow: a571_numberValue("a571-velocityFlow"),
            velocityDensity: a571_numberValue("a571-velocityDensity"),
            pipeDiameter: a571_numberValue("a571-pipeDiameter"),
            manualVelocity: a571_numberValue("a571-velocity"),
            turbulence: a571_normalizeYesNo(a571_getValue("a571-turbulence")),
            solids: a571_normalizeYesNo(a571_getValue("a571-solids")),
            insulated: a571_normalizeYesNo(a571_getValue("a571-insulated")),
            cuiMaterial: a571_normalizeText(a571_getValue("a571-cuiMaterial")),
            eroMaterial: a571_getValue("a571-eroMaterial"),
            deltaT: a571_numberValue("a571-deltaT"),
            thermalLocation: a571_getValue("a571-thermalLocation") || "MIX_POINT"
        };

        // Show loading state if needed
        const resultContainer = document.getElementById("a571-result");
        if (resultContainer) {
            resultContainer.style.display = "block";
            resultContainer.innerHTML = `
                <div style="text-align: center; padding: 30px; color: #64748b;">
                    <div style="font-size: 24px; margin-bottom: 8px;">⚙️</div>
                    <div style="font-weight: 600;">Evaluating API 571 Damage Screening Matrix against Backend Engine...</div>
                </div>
            `;
        }

        try {
            // Call Backend Screening Engine API
            const res = await fetch("/api/damage-criteria", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data })
            });

            if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
            const evaluation = await res.json();

            if (evaluation.success) {
                // Display Calculated Hydraulic & Chemical Parameters
                a571_displayCalculatedParameters(evaluation.calculatedParameters);

                // Display Full Screening Matrix & Audit Table
                a571_displayResults(evaluation.stream, evaluation.results, evaluation.input, evaluation.kpis);
            } else {
                throw new Error(evaluation.error || "Evaluation failed");
            }
        } catch (err) {
            console.error("Screening calculation error:", err);
            if (resultContainer) {
                resultContainer.innerHTML = `
                    <div class="calc-card" style="border-left: 4px solid #ef4444; margin-top: 14px;">
                        <h4 style="color: #dc2626; margin: 0 0 6px 0;">Screening Engine Error</h4>
                        <p style="margin: 0; color: #64748b;">Failed to evaluate stream against backend: ${a571_escapeHTML(err.message)}</p>
                    </div>
                `;
            }
        }
    });
}
window.a571_init = a571_init;

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", a571_init);
} else {
    a571_init();
}

// =================================================================
// STREAM PRESET & AUTO-LOAD LOGIC
// =================================================================

async function a571_loadSelectedStream() {
    const unitSelector = document.getElementById("a571-unitSelector");
    const streamSelector = document.getElementById("a571-streamPresetSelector");
    const alertBox = document.getElementById("a571-autoloadAlert");
    const loadBtn = document.getElementById("a571-btnLoadStream");

    const unitId = unitSelector ? unitSelector.value.trim() : "";
    const streamId = streamSelector ? streamSelector.value.trim() : "";

    if (!unitId) {
        if (alertBox) {
            alertBox.style.display = "block";
            alertBox.innerHTML = `
                <div class="a571-alert-inner" style="background:#fef3c7; border-color:#fde68a; color:#92400e;">
                    <span class="a571-alert-icon" style="color:#d97706;">⚠️</span>
                    <div><strong>Selection Required:</strong> Please select a <strong>Unit</strong> first.</div>
                </div>
            `;
        }
        if (unitSelector) unitSelector.focus();
        return;
    }

    if (!streamId) {
        if (alertBox) {
            alertBox.style.display = "block";
            alertBox.innerHTML = `
                <div class="a571-alert-inner" style="background:#fef3c7; border-color:#fde68a; color:#92400e;">
                    <span class="a571-alert-icon" style="color:#d97706;">⚠️</span>
                    <div><strong>Selection Required:</strong> Please select a <strong>Process Stream</strong> to load.</div>
                </div>
            `;
        }
        if (streamSelector) streamSelector.focus();
        return;
    }

    // Set UI loading state
    const originalBtnText = loadBtn ? loadBtn.innerHTML : "📥 Load";
    if (loadBtn) {
        loadBtn.innerHTML = "⏳ Loading Stream Data...";
        loadBtn.disabled = true;
    }

    if (alertBox) {
        alertBox.style.display = "block";
        alertBox.innerHTML = `
            <div class="a571-alert-inner" style="background:#eff6ff; border-color:#bfdbfe; color:#1e40af;">
                <span class="a571-alert-icon" style="color:#2563eb;">⏳</span>
                <div><strong>Fetching:</strong> Loading stream data from cloud database...</div>
            </div>
        `;
    }

    try {
        let streamData = null;

        // 1. Fetch from cloud database API
        const res = await fetch(`/api/damage-criteria?action=stream_data&unit=${encodeURIComponent(unitId)}&streamId=${encodeURIComponent(streamId)}`);
        if (res.ok) {
            const json = await res.json();
            if (json.success && json.stream) {
                streamData = json.stream;
            }
        }

        // 2. Fallback to cached window streams
        if (!streamData && window.a571_CURRENT_STREAMS && Array.isArray(window.a571_CURRENT_STREAMS)) {
            streamData = window.a571_CURRENT_STREAMS.find(s => s.id === streamId || s.streamNo === streamId);
        }

        if (!streamData && window.a571_STREAM_PRESETS && window.a571_STREAM_PRESETS[streamId]) {
            streamData = window.a571_STREAM_PRESETS[streamId];
        }

        if (!streamData) {
            throw new Error(`Process Stream '${streamId}' could not be resolved from cloud data.`);
        }

        await a571_applyStreamDataToForm(streamData, unitId);
    } catch (err) {
        console.error("[API 571] Stream load error:", err);
        if (alertBox) {
            alertBox.style.display = "block";
            alertBox.innerHTML = `
                <div class="a571-alert-inner" style="background:#fee2e2; border-color:#fca5a5; color:#991b1b;">
                    <span class="a571-alert-icon" style="color:#dc2626;">❌</span>
                    <div><strong>Error Loading Stream:</strong> ${a571_escapeHTML(err.message)}</div>
                </div>
            `;
        }
    } finally {
        if (loadBtn) {
            loadBtn.innerHTML = originalBtnText;
            loadBtn.disabled = false;
        }
    }
}

async function a571_applyStreamDataToForm(p, unitId) {
    if (!p) return;
    window.a571_nelsonMaterialUserModified = false;

    // Set Form Fields
    a571_setInputValue("a571-streamName", p.name || p.streamName || `Stream ${p.streamNo || p.id}`);
    a571_setSelectValue("a571-phase", p.phase || "Mixed");
    a571_setInputValue("a571-temperature", p.temp !== undefined ? p.temp : (p.tempC || 40));
    a571_setInputValue("a571-pressure", p.pressure !== undefined ? p.pressure : (p.pressKgCm2 || 10));
    a571_setInputValue("a571-h2", p.h2 !== undefined ? p.h2 : 0);
    const h2MolVal = p.h2MolFrac !== undefined ? p.h2MolFrac : (p.h2_mol !== undefined ? p.h2_mol : (p.h2Mol !== undefined ? p.h2Mol : 0));
    a571_setInputValue("a571-h2MolFrac", h2MolVal);
    a571_setInputValue("a571-h2s", p.h2s !== undefined ? p.h2s : 0);
    const nh3Val = p.nh3 !== undefined ? Number(p.nh3) : 0;
    a571_setInputValue("a571-nh3", nh3Val);
    const nh3SigVal = (p.nh3Significant === "Y" || p.nh3Significant === "Yes" || p.nh3Significant === true) ? "Y" : ((p.nh3Significant === "N" || p.nh3Significant === "No" || p.nh3Significant === false) ? "N" : (nh3Val > 0 ? "Y" : "N"));
    a571_setSelectValue("a571-nh3Significant", nh3SigVal);
    a571_setSelectValue("a571-otherContamSignificant", p.otherContamSignificant || "N");
    a571_setInputValue("a571-h2o", p.h2o !== undefined ? p.h2o : 0);
    a571_setInputValue("a571-co2", p.co2 !== undefined ? p.co2 : 0);
    a571_setSelectValue("a571-carbonSteel", p.carbonSteel || "Y");
    a571_setInputValue("a571-crContent", p.crContent !== undefined ? p.crContent : 0);
    a571_setSelectValue("a571-stress", p.stress || "Y");

    // Nelson Curve Metallurgy auto-sync
    let nelsonMat = p.nelsonMaterial;
    if (!nelsonMat) {
        const cs = p.carbonSteel !== undefined ? p.carbonSteel : "Y";
        const stress = p.stress !== undefined ? p.stress : "Y";
        const cr = p.crContent !== undefined ? Number(p.crContent) : 0;
        if (cs === "Y" && stress === "Y") nelsonMat = "CS_NON_PWHT";
        else if (cs === "Y" && stress === "N") nelsonMat = "CS_PWHT";
        else if (cr >= 2.0) nelsonMat = "225CR_1MO";
        else if (cr >= 1.0) nelsonMat = "125CR_05MO";
        else nelsonMat = "CS_NON_PWHT";
    }
    a571_setSelectValue("a571-nelsonMaterial", nelsonMat);

    a571_setSelectValue("a571-hardness", p.hardness || "N");
    a571_setSelectValue("a571-oxygen", p.oxygen || "N");
    a571_setInputValue("a571-amineFlow", p.amineFlow !== undefined ? p.amineFlow : 0);
    a571_setSelectValue("a571-amineType", p.amineType || "None");
    a571_setSelectValue("a571-amineService", p.amineService || "Lean");
    a571_setInputValue("a571-hsas", p.hsas !== undefined ? p.hsas : 0);
    a571_setInputValue("a571-ph", p.ph !== undefined ? p.ph : 0);
    a571_setInputValue("a571-velocityFlow", p.massFlow || p.velocityFlow || 0);
    a571_setInputValue("a571-velocityDensity", p.density || p.velocityDensity || 850);
    a571_setInputValue("a571-pipeDiameter", p.pipeDiameter || 250);
    a571_setInputValue("a571-velocity", p.manualVelocity || 0);
    a571_setSelectValue("a571-turbulence", p.turbulence || "N");
    a571_setSelectValue("a571-solids", p.solids || "N");
    a571_setSelectValue("a571-eroMaterial", p.eroMaterial || "Carbon steel");
    a571_setSelectValue("a571-insulated", p.insulated || "Y");
    a571_setSelectValue("a571-cuiMaterial", p.cuiMaterial || "CS");
    a571_setInputValue("a571-deltaT", p.deltaT !== undefined ? p.deltaT : 0);
    a571_setSelectValue("a571-thermalLocation", p.thermalLocation || "MIX_POINT");

    // Identify automated fields from stream data
    const autoFilledIds = [
        "a571-streamName",
        "a571-phase",
        "a571-temperature",
        "a571-pressure",
        "a571-velocityFlow",
        "a571-velocityDensity",
        "a571-h2",
        "a571-h2MolFrac",
        "a571-h2s",
        "a571-nh3",
        "a571-nh3Significant",
        "a571-h2o",
        "a571-co2"
    ];
    if (p.amineFlow && Number(p.amineFlow) > 0) {
        autoFilledIds.push("a571-amineFlow", "a571-amineType", "a571-amineService");
    }

    // Apply Red boundaries to non-automated fields & Green boundaries to stream synced fields
    a571_markAutomationCards(autoFilledIds);

    // Display Alert Banner
    const alertBox = document.getElementById("a571-autoloadAlert");
    if (alertBox) {
        alertBox.style.display = "block";
        const unitBadge = unitId ? ` [${a571_escapeHTML(unitId)}]` : "";
        alertBox.innerHTML = `
            <div class="a571-alert-inner">
                <span class="a571-alert-icon">✓</span>
                <div>
                    <strong>Stream Loaded${unitBadge}:</strong> <em>${a571_escapeHTML(p.name || p.streamName || p.streamNo || p.id)}</em> 
                    <span style="opacity: 0.85;">(${Number(p.massFlow || p.velocityFlow || 0).toLocaleString()} kg/h | ${p.temp || p.tempC || 0}°C | Phase: ${p.phase || 'Mixed'} | H₂S: ${Number(p.h2s || 0).toLocaleString()} kg/h | H₂: ${Number(p.h2 || 0).toLocaleString()} kg/h)</span>
                    <div style="font-size:11.5px; margin-top:4px; opacity:0.95;">
                        <span style="color:#10b981; font-weight:700;">🟢 Green Cards:</span> Auto-populated from stream sheet &bull; 
                        <span style="color:#ef4444; font-weight:700;">🔴 Red Border Cards:</span> Default / Non-stream inputs (e.g. Metallurgy, Insulation, Pipe ID) — verify or update as needed.
                    </div>
                </div>
                <button type="button" onclick="this.parentElement.parentElement.style.display='none'" style="margin-left:auto; background:none; border:none; color:inherit; cursor:pointer; font-size:16px;">&times;</button>
            </div>
        `;
    }

    // Trigger auto screening evaluation
    const filterForm = document.getElementById("a571-filterForm");
    if (filterForm) {
        filterForm.dispatchEvent(new Event("submit"));
    }
}

function a571_markAutomationCards(autoFilledIds = []) {
    const form = document.getElementById("a571-filterForm");
    if (!form) return;

    const autoSet = new Set(autoFilledIds);
    const inputs = form.querySelectorAll("input, select");

    inputs.forEach(input => {
        const id = input.id;
        if (!id || input.type === "submit" || input.type === "button") return;

        const label = input.closest("label");
        if (!label) return;

        const oldPill = label.querySelector(".a571-status-pill");
        if (oldPill) oldPill.remove();

        const isAuto = autoSet.has(id);
        const pill = document.createElement("span");
        pill.className = "a571-status-pill";

        if (isAuto) {
            label.classList.remove("a571-manual-review-field", "a571-user-edited-field");
            label.classList.add("a571-auto-filled-field");
            pill.classList.add("pill-auto");
            pill.innerHTML = `⚡ Stream Synced`;
        } else {
            label.classList.remove("a571-auto-filled-field", "a571-user-edited-field");
            label.classList.add("a571-manual-review-field");
            pill.classList.add("pill-manual");
            pill.innerHTML = `⚠️ Default / Review`;
        }

        label.insertBefore(pill, label.firstChild);

        if (!input._a571Bound) {
            input._a571Bound = true;
            const onUserChange = () => {
                label.classList.remove("a571-manual-review-field", "a571-auto-filled-field");
                label.classList.add("a571-user-edited-field");
                const currentPill = label.querySelector(".a571-status-pill");
                if (currentPill) {
                    currentPill.className = "a571-status-pill pill-edited";
                    currentPill.innerHTML = `✏️ User Modified`;
                }
            };
            input.addEventListener("input", onUserChange);
            input.addEventListener("change", onUserChange);
        }
    });
}

async function a571_loadStreamData(streamObjOrKey) {
    if (!streamObjOrKey) return;
    if (typeof streamObjOrKey === "object") {
        const converted = a571_convertStreamToPreset(streamObjOrKey);
        return a571_applyStreamDataToForm(converted, "");
    }
    if (typeof streamObjOrKey === "string") {
        const unitSelector = document.getElementById("a571-unitSelector");
        const unitId = unitSelector ? unitSelector.value.trim() : "";

        // 1. Check in currently loaded unit streams
        let s = window.a571_CURRENT_STREAMS?.find(x => x.id === streamObjOrKey || x.streamNo === streamObjOrKey);

        // 2. Check in global presets
        if (!s && window.a571_STREAM_PRESETS?.[streamObjOrKey]) {
            s = window.a571_STREAM_PRESETS[streamObjOrKey];
        }

        // 3. Fetch from backend if not in cache
        if (!s) {
            try {
                const res = await fetch(`/api/damage-criteria?action=stream_data&unit=${encodeURIComponent(unitId)}&streamId=${encodeURIComponent(streamObjOrKey)}`);
                if (res.ok) {
                    const json = await res.json();
                    if (json.success && json.stream) s = json.stream;
                }
            } catch (e) {
                console.warn("[API 571] a571_loadStreamData fetch warning:", e);
            }
        }

        if (s) {
            return a571_applyStreamDataToForm(s, unitId);
        }
    }
}

function a571_populateAvailableStreams() {
    if (typeof a571_fetchUnits === "function") {
        a571_fetchUnits();
    }
}

function a571_syncFromComparator() {
    let target = null;
    if (window.StreamComparator && typeof window.StreamComparator.getActiveStreams === "function") {
        const active = window.StreamComparator.getActiveStreams();
        target = active.streamA || active.streamB;
    }

    if (!target && window.StreamComparator && typeof window.StreamComparator.getAvailableStreams === "function") {
        const all = window.StreamComparator.getAvailableStreams();
        if (all && all.length > 0) target = all[0];
    }

    if (!target) {
        target = "STREAM_172A";
    }

    a571_loadStreamData(target);
}

function a571_convertStreamToPreset(st) {
    const p = st.properties || {};
    const c = st.components || {};

    const temp = st.temp !== undefined ? st.temp : (st.tempC || p["Temperature (°C)"] || 40);
    const press = st.pressure !== undefined ? st.pressure : (st.pressKgCm2 || p["Pressure (kg/cm2 (g))"] || 10);
    const flow = st.massFlow !== undefined ? st.massFlow : (p["Flow Mass (kg/hr)"] || 0);
    const dens = st.density !== undefined ? st.density : (st.liquidDensity || p["Liquid Density (kg/m3)"] || p["Vapor Density (kg/m3)"] || 850);

    let phase = st.phase || "Mixed";
    const content = String(st.content || p["Content / Phase"] || "").toUpperCase();
    const wtVap = p["Wt% Vaporized (%)"];
    if (wtVap !== undefined) {
        if (wtVap >= 99) phase = "Vapor";
        else if (wtVap <= 1) phase = "Liquid";
        else phase = "Mixed";
    } else if (content.includes("VAPOR") || content.includes("GAS")) {
        phase = content.includes("LIQ") ? "Mixed" : "Vapor";
    } else if (content.includes("LIQUID") || content.includes("AQUEOUS")) {
        phase = "Liquid";
    }

    const h2 = st.h2 !== undefined ? st.h2 : (c["H2"] || 0);
    const h2MolFrac = st.h2MolFrac !== undefined ? st.h2MolFrac : (c["H2_MOL"] || c["H2_VOL"] || c["H2 (mol%)"] || c["H2 (vol%)"] || 0);
    const h2s = st.h2s !== undefined ? st.h2s : (c["H2S"] || 0);
    const nh3 = st.nh3 !== undefined ? st.nh3 : (c["NH3"] || 0);
    const h2o = st.h2o !== undefined ? st.h2o : (c["H2O"] || 0);
    const co2 = st.co2 !== undefined ? st.co2 : (c["CO2"] || 0);
    const mdea = st.amineFlow !== undefined ? st.amineFlow : (c["MDEA"] || 0);

    let pipeD = st.pipeDiameter || 250;
    if (flow > 0 && dens > 0 && !st.pipeDiameter) {
        const targetV = phase === "Vapor" ? 18.0 : (phase === "Liquid" ? 1.8 : 8.0);
        const qM3s = (flow / 3600) / dens;
        const dM = Math.sqrt((4 * qM3s) / (Math.PI * targetV));
        pipeD = Math.max(50, Math.min(800, Math.round((dM * 1000) / 25) * 25));
    }

    const csVal = st.carbonSteel || "Y";
    const crVal = st.crContent !== undefined ? st.crContent : (temp > 260 ? 1.25 : 0);
    const stressVal = st.stress || "Y";

    let nelsonMat = st.nelsonMaterial;
    if (!nelsonMat) {
        if (csVal === "Y" && stressVal === "Y") nelsonMat = "CS_NON_PWHT";
        else if (csVal === "Y" && stressVal === "N") nelsonMat = "CS_PWHT";
        else if (crVal >= 2.0) nelsonMat = "225CR_1MO";
        else if (crVal >= 1.0) nelsonMat = "125CR_05MO";
        else nelsonMat = "CS_NON_PWHT";
    }

    return {
        id: st.id,
        streamNo: st.streamNo || "Custom",
        name: st.name || (st.streamName ? `Stream ${st.streamNo} - ${st.streamName}` : `Stream ${st.streamNo || st.id}`),
        streamName: st.name || (st.streamName ? `Stream ${st.streamNo} - ${st.streamName}` : `Stream ${st.streamNo || st.id}`),
        phase,
        temp,
        pressure: press,
        h2,
        h2MolFrac,
        h2s,
        nh3,
        h2o,
        co2,
        massFlow: flow,
        density: dens,
        pipeDiameter: pipeD,
        carbonSteel: csVal,
        crContent: crVal,
        stress: stressVal,
        nelsonMaterial: nelsonMat,
        hardness: st.hardness || ((phase === "Vapor" && h2s > 1000) ? "Y" : "N"),
        oxygen: st.oxygen || ((content.includes("WASH WATER") || content.includes("WATER")) ? "Y" : "N"),
        amineFlow: st.amineFlow !== undefined ? st.amineFlow : (mdea > 0 ? mdea : 0),
        amineType: st.amineType || (mdea > 0 ? "MDEA" : "None"),
        amineService: st.amineService || (h2s > 10 ? "Rich" : "Lean"),
        hsas: st.hsas !== undefined ? st.hsas : 0,
        ph: st.ph !== undefined ? st.ph : 0,
        turbulence: st.turbulence || ((content.includes("SLURRY") || content.includes("WASH WATER")) ? "Y" : "N"),
        solids: st.solids || (content.includes("SLURRY") ? "Y" : "N"),
        insulated: st.insulated || "Y",
        cuiMaterial: st.cuiMaterial || "CS",
        nh3Significant: (st.nh3Significant === "Y" || st.nh3Significant === "Yes" || st.nh3Significant === true) ? "Y" : ((st.nh3Significant === "N" || st.nh3Significant === "No" || st.nh3Significant === false) ? "N" : (nh3 > 0 ? "Y" : "N")),
        otherContamSignificant: st.otherContamSignificant || "N",
        deltaT: st.deltaT !== undefined ? st.deltaT : 0,
        thermalLocation: st.thermalLocation || "MIX_POINT",
        eroMaterial: st.eroMaterial || "Carbon steel",
        description: st.description || st.content || "Custom Process Stream"
    };
}

function a571_clearAutomationCards() {
    const form = document.getElementById("a571-filterForm");
    if (!form) return;

    // Remove all status pills
    form.querySelectorAll(".a571-status-pill").forEach(pill => pill.remove());

    // Remove all boundary highlight classes
    form.querySelectorAll("label").forEach(label => {
        label.classList.remove("a571-manual-review-field", "a571-auto-filled-field", "a571-user-edited-field");
    });
}

function a571_clearFormInputsOnly() {
    window.a571_nelsonMaterialUserModified = false;
    const form = document.getElementById("a571-filterForm");
    if (form) {
        form.reset();
    }

    // Reset explicit fields
    a571_setInputValue("a571-streamName", "");
    a571_setSelectValue("a571-phase", "Vapor");
    a571_setInputValue("a571-temperature", 40);
    a571_setInputValue("a571-pressure", 10);
    a571_setInputValue("a571-h2", 0);
    a571_setInputValue("a571-h2MolFrac", 0);
    a571_setInputValue("a571-h2s", 0);
    a571_setInputValue("a571-nh3", 0);
    a571_setSelectValue("a571-nh3Significant", "N");
    a571_setSelectValue("a571-otherContamSignificant", "N");
    a571_setInputValue("a571-h2o", 0);
    a571_setInputValue("a571-co2", 0);

    a571_setSelectValue("a571-carbonSteel", "Y");
    a571_setInputValue("a571-crContent", 0);
    a571_setSelectValue("a571-stress", "N");
    a571_setSelectValue("a571-nelsonMaterial", "CS_NON_PWHT");
    a571_setSelectValue("a571-hardness", "N");
    a571_setSelectValue("a571-oxygen", "N");

    a571_setInputValue("a571-amineFlow", 0);
    a571_setSelectValue("a571-amineType", "None");
    a571_setSelectValue("a571-amineService", "Lean");
    a571_setInputValue("a571-hsas", 0);
    a571_setInputValue("a571-ph", 0);

    a571_setInputValue("a571-velocityFlow", "");
    a571_setInputValue("a571-velocityDensity", "");
    a571_setInputValue("a571-pipeDiameter", "");
    a571_setSelectValue("a571-turbulence", "N");
    a571_setSelectValue("a571-solids", "N");
    a571_setSelectValue("a571-eroMaterial", "Carbon steel");

    a571_setSelectValue("a571-insulated", "Y");
    a571_setSelectValue("a571-cuiMaterial", "CS");
    a571_setInputValue("a571-deltaT", 0);

    // Clear all automation boundaries and status pills
    a571_clearAutomationCards();

    // Clear results and calculated parameters
    const resultsArea = document.getElementById("a571-resultsArea");
    if (resultsArea) resultsArea.style.display = "none";
    const calc = document.getElementById("a571-calculatedParameters");
    if (calc) { calc.innerHTML = ""; calc.style.display = "none"; }
    const insp = document.getElementById("a571-inspectionSummary");
    if (insp) { insp.innerHTML = ""; insp.style.display = "none"; }
    const alertBox = document.getElementById("a571-autoloadAlert");
    if (alertBox) alertBox.style.display = "none";
}

function a571_resetForm(clearDropdowns) {
    a571_clearFormInputsOnly();

    if (clearDropdowns) {
        const unitSelector = document.getElementById("a571-unitSelector");
        if (unitSelector) unitSelector.value = "";

        const caseWrap = document.getElementById("a571-caseWrap");
        if (caseWrap) caseWrap.style.display = "none";

        const caseSelector = document.getElementById("a571-caseSelector");
        if (caseSelector) {
            caseSelector.innerHTML = '<option value="all">-- All Cases --</option>';
        }

        const streamSelector = document.getElementById("a571-streamPresetSelector");
        if (streamSelector) {
            streamSelector.innerHTML = '<option value="">-- Select Process Stream --</option>';
            streamSelector.disabled = true;
        }

        window.a571_ALL_UNIT_STREAMS = [];
        window.a571_CURRENT_STREAMS = [];
    }

    const alertBox = document.getElementById("a571-autoloadAlert");
    if (alertBox) alertBox.style.display = "none";
}

function a571_setInputValue(id, val) {
    const el = document.getElementById(id);
    if (el) {
        el.value = val;
        el.classList.add("a571-highlight-pulse");
        setTimeout(() => el.classList.remove("a571-highlight-pulse"), 800);
    }
}

function a571_setSelectValue(id, val) {
    const el = document.getElementById(id);
    if (el) {
        el.value = val;
        el.classList.add("a571-highlight-pulse");
        setTimeout(() => el.classList.remove("a571-highlight-pulse"), 800);
    }
}

// =================================================================
// 1-CLICK BRIDGE TO API 581 CORROSION RATE TAB
// =================================================================
function a571_bridgeToCorrosionTab(corrosionTabKey, streamData) {
    if (!corrosionTabKey) return;

    if (typeof window.showCorrosionFullTab === "function") {
        window.showCorrosionFullTab();
    } else {
        document.querySelectorAll(".tab-content").forEach(t => t.style.display = "none");
        const cTab = document.getElementById("corrosionFullTab");
        if (cTab) cTab.style.display = "block";
    }

    setTimeout(() => {
        const dmSelect = document.getElementById("dmSelectFull");
        if (dmSelect) {
            dmSelect.value = corrosionTabKey;
            dmSelect.dispatchEvent(new Event("change"));

            setTimeout(() => {
                const tempEl = document.querySelector("#formContainerFull input[type='number'], #formContainerFull select[id^='temp']");
                if (tempEl && streamData && streamData.temp) {
                    tempEl.value = Math.round(streamData.temp);
                    tempEl.dispatchEvent(new Event("input"));
                    tempEl.dispatchEvent(new Event("change"));
                }

                const calcBtn = document.getElementById("calculateBtnFull");
                if (calcBtn) {
                    calcBtn.click();
                }
            }, 150);
        }
    }, 150);
}

// =================================================================
// DISPLAY CALCULATED PARAMETERS
// =================================================================
function a571_displayCalculatedParameters(values) {
    const calc = document.getElementById("a571-calculatedParameters");
    if (!calc || !values) return;

    calc.style.display = "block";
    calc.innerHTML = `
        <div class="calc-card">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                <h4 style="margin: 0; font-size: 15px; font-weight: 700; color: var(--accent, #3b82f6);">
                    ⚙️ Calculated Hydraulic & Chemical Screening Parameters
                </h4>
                <span class="a571-status-pill">${a571_escapeHTML(values.velocitySource || "CALCULATED")}</span>
            </div>

            <div class="calc-grid">
                <div><strong>H₂S in Water (ppmw)</strong><span>${Number(values.h2sPPMW || 0).toFixed(1)} ppmw</span></div>
                <div><strong>H₂ Charging Screening</strong><span>${values.h2sPPMW >= 1 ? "✓ ACTIVE (≥1 ppmw)" : "✕ INACTIVE (<1 ppmw)"}</span></div>
                <div><strong>NH4HS Synthesized</strong><span>${Number(values.nh4hsKgHr || 0).toFixed(1)} kg/h</span></div>
                <div><strong>NH4HS Aqueous Wt%</strong><span>${Number(values.nh4hsWt || 0).toFixed(2)} wt% ${values.nh4hsWt > 2 ? "(>2% Critical)" : ""}</span></div>
                <div><strong>NH4HS Temperature Status</strong><span>${a571_escapeHTML(values.nh4hsTemperatureStatus || "-")}</span></div>
                <div><strong>Operating Pressure</strong><span>${values.pressure || 10} kg/cm² g</span></div>
                <div><strong>Sour Water pH</strong><span>${values.ph > 0 ? Number(values.ph).toFixed(2) : "Unmeasured / Neutral default"}</span></div>
                <div><strong>Calculated Velocity</strong><span>${Number(values.velocityMS || 0).toFixed(2)} m/s (${Number(values.velocityFPS || 0).toFixed(1)} fps)</span></div>
                <div><strong>Mass Flow & Density</strong><span>${Number(values.velocityFlow || 0).toLocaleString()} kg/h @ ${values.velocityDensity || 850} kg/m³</span></div>
                <div><strong>Pipe Inside Diameter</strong><span>${values.pipeDiameter || 250} mm</span></div>
                <div><strong>CUI Temperature Window</strong><span>${values.cuiLower} to ${values.cuiUpper}°C</span></div>
                <div><strong>Thermal Gradient (|ΔT|)</strong><span>${values.deltaT || 0}°C ${values.deltaT >= 28 ? "(≥28°C Fatigue Risk)" : ""}</span></div>
                <div><strong>H₂ Partial Pressure (ppH₂)</strong><span>${values.ppH2Psia != null ? `${values.ppH2Psia} psia (${values.ppH2KgCm2a} kg/cm²a)` : "0 psia"}</span></div>
                <div><strong>API 941 Nelson Limit Temp</strong><span>${values.hthaTLimitF != null && values.hthaTLimitF < 9000 ? `${values.hthaTLimitF}°F (Margin: ${values.hthaMarginF}°F)` : (values.hthaTLimitF >= 9000 ? "Immune (Austenitic SS / Low ppH₂)" : "-")}</span></div>
            </div>
        </div>
    `;
}

// =================================================================
// COMBINED INSPECTION TECHNIQUES WORKPACK
// =================================================================
function a571_buildInspectionSummaryHTML(results) {
    const applicable = (results || []).filter(r => r.applicable && r.inspection);
    if (applicable.length === 0) {
        return `
            <div class="calc-card" style="margin-top: 14px;">
                <h4>Combined Inspection Techniques (API 570 / 581 Workpack)</h4>
                <p>No active damage mechanisms flagged for this operating stream — standard baseline inspection applies.</p>
            </div>
        `;
    }

    const groups = {};
    const order = [];

    applicable.forEach(function (r) {
        const codeMatch = r.mechanism.match(/\(([\d.]+)\)\s*$/);
        const code = codeMatch ? codeMatch[1] : r.mechanism;

        if (!groups[code]) {
            groups[code] = { code, mechanism: r.mechanism, entries: [] };
            order.push(code);
        }
        groups[code].entries.push(r);
    });

    let rowsHTML = "";
    order.forEach(function (code) {
        const group = groups[code];
        const seen = new Set();
        const techList = [];

        group.entries.forEach(e => {
            e.inspection.split(";").map(s => s.trim()).filter(Boolean).forEach(t => {
                if (!seen.has(t)) {
                    seen.add(t);
                    techList.push(t);
                }
            });
        });

        rowsHTML += `
            <tr>
                <td style="font-weight: 700;">${a571_escapeHTML(group.mechanism)}</td>
                <td><span class="a571-category-tag">${a571_escapeHTML(group.entries[0].category || "Integrity")}</span></td>
                <td>${a571_escapeHTML(techList.join("; "))}</td>
            </tr>
        `;
    });

    return `
        <div class="calc-card" style="margin-top: 14px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                <h4 style="margin: 0; font-size: 15px; font-weight: 700; color: #1e293b;">
                    📋 API 570 / API 581 Inspection Circuit Workpack Recommendations
                </h4>
                <span style="font-size: 12px; color: #64748b;">${applicable.length} Applicable Mechanism Inspections</span>
            </div>
            <div class="result-table-wrapper">
                <table class="damage-table">
                    <thead>
                        <tr>
                            <th style="width: 28%;">Damage Mechanism (API 571)</th>
                            <th style="width: 20%;">Integrity Family</th>
                            <th style="width: 52%;">Mandatory & Recommended NDT Inspection Techniques</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHTML}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function a571_toggleInspectionSummary() {
    const panel = document.getElementById("a571-inspectionSummaryPanel");
    if (!panel) return;
    panel.style.display = (panel.style.display === "none" || panel.style.display === "") ? "block" : "none";
}

// =================================================================
// MATRIX CATEGORY FILTERING
// =================================================================
function a571_filterMatrixCategory(category) {
    document.querySelectorAll(".a571-filter-chip").forEach(c => c.classList.remove("active"));
    const activeChip = document.getElementById(`a571-chip-${category}`);
    if (activeChip) activeChip.classList.add("active");

    const cards = document.querySelectorAll(".a571-matrix-card");
    cards.forEach(card => {
        const cardCat = card.getAttribute("data-cat");
        const isApp = card.getAttribute("data-applicable") === "true";

        if (category === "all") {
            card.style.display = "flex";
        } else if (category === "applicable") {
            card.style.display = isApp ? "flex" : "none";
        } else if (cardCat === category) {
            card.style.display = "flex";
        } else {
            card.style.display = "none";
        }
    });
}

// =================================================================
// DISPLAY SCREENING MATRIX RESULTS
// =================================================================
function a571_displayResults(stream, results, rawData, kpis) {
    const output = document.getElementById("a571-result");
    if (!output || !results) return;

    output.style.display = "block";
    output.scrollIntoView({ behavior: "smooth", block: "nearest" });

    const applicableList = results.filter(r => r.applicable);
    const applicableCount = kpis ? kpis.applicable : applicableList.length;
    const conditionalCount = kpis ? kpis.conditional : results.filter(r => !r.applicable && r.status.includes("SCREEN FURTHER")).length;
    const notApplicableCount = kpis ? kpis.notApplicable : (results.length - applicableCount - conditionalCount);
    const dominantThreat = kpis ? kpis.dominantThreat : (applicableList[0]?.mechanism || "None Flagged");

    // Build Matrix Cards HTML
    let matrixCardsHTML = "";
    results.forEach((r) => {
        const cardCat = (r.category || "").toLowerCase().replace(/[^a-z0-9]/g, "-");
        const statusBadgeClass = r.applicable ? "a571-badge-danger" : (r.status.includes("SCREEN FURTHER") ? "a571-badge-warning" : "a571-badge-neutral");
        const statusIcon = r.applicable ? "🔴" : (r.status.includes("SCREEN FURTHER") ? "🟡" : "🟢");

        let bridgeBtnHTML = "";
        if (r.applicable && r.corrosionTabKey) {
            bridgeBtnHTML = `
                <button type="button" class="a571-bridge-btn" onclick="a571_bridgeToCorrosionTab('${r.corrosionTabKey}', window.a571_lastScreenedData)" title="Directly compute corrosion rate in API 581 tab">
                    ⚡ Compute Corrosion Rate (API 581) &rarr;
                </button>
            `;
        }

        matrixCardsHTML += `
            <div class="a571-matrix-card ${r.applicable ? 'applicable-border' : ''}" data-cat="${cardCat}" data-applicable="${r.applicable}">
                <div class="a571-card-top">
                    <span class="a571-card-cat">${a571_escapeHTML(r.category || "Integrity")}</span>
                    <span class="a571-card-badge ${statusBadgeClass}">${statusIcon} ${r.applicable ? 'APPLICABLE' : a571_escapeHTML(r.status)}</span>
                </div>
                <div class="a571-card-title">${a571_escapeHTML(r.mechanism)}</div>
                <div class="a571-card-basis">
                    <strong>Process Trigger:</strong> ${a571_escapeHTML(r.basis)}
                </div>
                ${r.applicable && r.inspection ? `
                <div class="a571-card-inspection">
                    <strong>NDT Inspection:</strong> ${a571_escapeHTML(r.inspection)}
                </div>
                ` : ''}
                ${bridgeBtnHTML}
            </div>
        `;
    });

    // Build Audit Table HTML
    let tableRowsHTML = "";
    results.forEach(result => {
        tableRowsHTML += `
            <tr class="${result.applicable ? "applicable-row" : "not-applicable-row"}">
                <td><strong>${a571_escapeHTML(result.mechanism)}</strong></td>
                <td><span class="a571-category-tag">${a571_escapeHTML(result.category || "General")}</span></td>
                <td>
                    <span class="status-badge ${result.applicable ? "status-applicable" : "status-not"}">
                        ${result.applicable ? "✓ APPLICABLE" : "✕ " + a571_escapeHTML(result.status)}
                    </span>
                </td>
                <td>${a571_escapeHTML(result.basis)}</td>
                <td>${a571_escapeHTML(result.justification)}</td>
                <td>
                    ${result.applicable ? `<div class="inspection-box"><strong>Inspection:</strong><br>${a571_escapeHTML(result.inspection)}</div>` : `<span class="inspection-empty">—</span>`}
                </td>
            </tr>
        `;
    });

    const inspectionSummaryHTML = a571_buildInspectionSummaryHTML(results);

    // Cache globally for bridge operations and export
    window.a571_lastScreenedData = rawData;
    window.a571_lastScreenedResults = results;

    let fullHTML = `
        <div class="a571-result-container">
            <!-- Header Bar -->
            <div class="a571-matrix-header">
                <div>
                    <h3 style="margin: 0; font-size: 20px; font-weight: 700; color: var(--text, #1e293b);">
                        🛡️ API 571 Damage Mechanism Screening Matrix
                    </h3>
                    <p style="margin: 4px 0 0 0; font-size: 13.5px; color: var(--text-light, #64748b);">
                        Active Stream: <strong>${a571_escapeHTML(stream)}</strong> (Screened against 17 API 571 Mechanisms)
                    </p>
                </div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button type="button" class="a571-export-btn" onclick="a571_exportMatrixPDF()" title="Export PDF Screening Report">
                        📄 Export PDF Report
                    </button>
                    <button type="button" class="a571-export-btn" onclick="a571_exportMatrixExcel()" title="Export Excel / CSV Matrix">
                        📊 Export Excel Matrix
                    </button>
                </div>
            </div>

            <!-- KPI Summary Cards -->
            <div class="a571-kpi-row">
                <div class="a571-kpi-box">
                    <span class="a571-kpi-title">TOTAL MECHANISMS</span>
                    <span class="a571-kpi-val" style="color: #2563eb;">${results.length}</span>
                    <span class="a571-kpi-sub">API 571 Standard Rules</span>
                </div>
                <div class="a571-kpi-box" style="cursor: pointer;" onclick="a571_filterMatrixCategory('applicable')" title="Filter to show applicable only">
                    <span class="a571-kpi-title">ACTIVE / APPLICABLE</span>
                    <span class="a571-kpi-val" style="color: #dc2626;">${applicableCount}</span>
                    <span class="a571-kpi-sub">Immediate Inspection Threats</span>
                </div>
                <div class="a571-kpi-box">
                    <span class="a571-kpi-title">CONDITIONAL / CHECK</span>
                    <span class="a571-kpi-val" style="color: #d97706;">${conditionalCount}</span>
                    <span class="a571-kpi-sub">Secondary Verification</span>
                </div>
                <div class="a571-kpi-box">
                    <span class="a571-kpi-title">SAFE / NOT APPLICABLE</span>
                    <span class="a571-kpi-val" style="color: #16a34a;">${notApplicableCount}</span>
                    <span class="a571-kpi-sub">Outside Damage Boundaries</span>
                </div>
                <div class="a571-kpi-box" style="flex: 1.3;">
                    <span class="a571-kpi-title">PRIMARY ACTIVE THREAT</span>
                    <span class="a571-kpi-val" style="font-size: 15px; color: #4f46e5; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">
                        ${a571_escapeHTML(dominantThreat)}
                    </span>
                    <span class="a571-kpi-sub">Governing Mechanism for Inspection Circuit</span>
                </div>
            </div>

            <!-- Matrix Category Filter Pills -->
            <div class="a571-filter-bar">
                <span style="font-size: 12.5px; font-weight: 700; color: var(--text, #334155); margin-right: 4px;">Filter Matrix:</span>
                <button type="button" class="a571-filter-chip active" id="a571-chip-all" onclick="a571_filterMatrixCategory('all')">
                    All Mechanisms (${results.length})
                </button>
                <button type="button" class="a571-filter-chip" id="a571-chip-applicable" onclick="a571_filterMatrixCategory('applicable')">
                    🔴 Applicable Only (${applicableCount})
                </button>
                <button type="button" class="a571-filter-chip" id="a571-chip-high-temperature-degradation" onclick="a571_filterMatrixCategory('high-temperature-degradation')">
                    🔥 High Temp & Nelson (4)
                </button>
                <button type="button" class="a571-filter-chip" id="a571-chip-environmental-cracking" onclick="a571_filterMatrixCategory('environmental-cracking')">
                    💥 Environmental Cracking (4)
                </button>
                <button type="button" class="a571-filter-chip" id="a571-chip-aqueous---acid-thinning" onclick="a571_filterMatrixCategory('aqueous---acid-thinning')">
                    🧪 Acid & Sour Thinning (5)
                </button>
                <button type="button" class="a571-filter-chip" id="a571-chip-flow--velocity---erosion" onclick="a571_filterMatrixCategory('flow--velocity---erosion')">
                    🌪️ Flow & Velocity (2)
                </button>
                <button type="button" class="a571-filter-chip" id="a571-chip-external---cui" onclick="a571_filterMatrixCategory('external---cui')">
                    🌧️ External & CUI (1)
                </button>
            </div>

            <!-- Visual Matrix Cards Grid -->
            <div class="a571-matrix-grid" id="a571MatrixGrid">
                ${matrixCardsHTML}
            </div>

            <!-- Combined Inspection Summary Panel -->
            <div id="a571-inspectionSummaryPanel">
                ${inspectionSummaryHTML}
            </div>

            <!-- Detailed Engineering Audit Table -->
            <div class="calc-card" style="margin-top: 18px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                    <h4 style="margin: 0; font-size: 15px; font-weight: 700; color: #1e293b;">
                        📑 Full Damage Mechanism Engineering Audit & Screening Justifications
                    </h4>
                </div>
                <div class="result-table-wrapper">
                    <table class="damage-table">
                        <thead>
                            <tr>
                                <th style="width: 18%;">Damage Mechanism</th>
                                <th style="width: 13%;">Integrity Family</th>
                                <th style="width: 12%;">Status</th>
                                <th style="width: 20%;">Process Basis / Next Check</th>
                                <th style="width: 20%;">Detailed Justification</th>
                                <th style="width: 17%;">Inspection Techniques</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRowsHTML}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    output.innerHTML = fullHTML;
}

// =================================================================
// EXPORT HANDLERS (PDF & EXCEL)
// =================================================================
function a571_exportMatrixPDF() {
    const el = document.getElementById("a571-result");
    if (!el || el.style.display === "none") {
        alert("Please run screening first before exporting.");
        return;
    }

    if (typeof html2pdf !== "undefined") {
        const streamName = a571_getValue("a571-streamName") || "Stream";
        const opt = {
            margin: [8, 8, 8, 8],
            filename: `API-571-Damage-Screening-${streamName.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 1.8, scrollY: 0 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };
        html2pdf().from(el).set(opt).save();
    } else {
        window.print();
    }
}

function a571_exportMatrixExcel() {
    if (!window.a571_lastScreenedResults) {
        alert("Please run screening first before exporting.");
        return;
    }

    const results = window.a571_lastScreenedResults;
    const streamName = a571_getValue("a571-streamName") || "Stream";

    let csv = "Damage Mechanism,Family,Applicable,Status,Process Basis,Justification,Inspection Techniques\n";
    results.forEach(r => {
        const row = [
            `"${(r.mechanism || '').replace(/"/g, '""')}"`,
            `"${(r.category || '').replace(/"/g, '""')}"`,
            `"${r.applicable ? 'YES' : 'NO'}"`,
            `"${(r.status || '').replace(/"/g, '""')}"`,
            `"${(r.basis || '').replace(/"/g, '""')}"`,
            `"${(r.justification || '').replace(/"/g, '""')}"`,
            `"${(r.inspection || '').replace(/"/g, '""')}"`
        ];
        csv += row.join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `API-571-Screening-${streamName.replace(/[^a-zA-Z0-9_-]/g, "_")}.csv`;
    link.click();
}

// =================================================================
// HELPERS
// =================================================================
function a571_getValue(id) {
    const el = document.getElementById(id);
    return el ? String(el.value || "").trim() : "";
}

function a571_numberValue(id) {
    const el = document.getElementById(id);
    if (!el) return 0;
    const v = parseFloat(el.value);
    return Number.isFinite(v) ? v : 0;
}

function a571_normalizeText(val) {
    return String(val || "").trim().toUpperCase();
}

function a571_normalizeYesNo(val) {
    const n = String(val || "").trim().toUpperCase();
    return (n === "Y" || n === "YES" || n === "TRUE" || n === "1") ? "Y" : "N";
}

function a571_escapeHTML(val) {
    return String(val || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Global Exports
window.a571_fetchUnits = a571_fetchUnits;
window.a571_onUnitSelectionChange = a571_onUnitSelectionChange;
window.a571_onCaseSelectionChange = a571_onCaseSelectionChange;
window.a571_loadStreamData = a571_loadStreamData;
window.a571_loadSelectedStream = a571_loadSelectedStream;
window.a571_syncFromComparator = a571_syncFromComparator;
window.a571_onPresetSelectionChange = a571_onPresetSelectionChange;
window.a571_resetForm = a571_resetForm;
window.a571_filterMatrixCategory = a571_filterMatrixCategory;
window.a571_bridgeToCorrosionTab = a571_bridgeToCorrosionTab;
window.a571_toggleInspectionSummary = a571_toggleInspectionSummary;
window.a571_exportMatrixPDF = a571_exportMatrixPDF;
window.a571_exportMatrixExcel = a571_exportMatrixExcel;
window.a571_populateAvailableStreams = a571_populateAvailableStreams;
window.a571_displayCalculatedParameters = a571_displayCalculatedParameters;
window.a571_displayResults = a571_displayResults;
