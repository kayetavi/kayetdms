
  // ⚙️ Top-Right Settings Menu Toggle Handler (Global & Resilient)
  function toggleSettingsMenu(e) {
    if (e) {
      if (typeof e.stopPropagation === "function") e.stopPropagation();
      if (typeof e.preventDefault === "function") e.preventDefault();
    }
    const dropdown = document.getElementById("dropdownContent");
    if (!dropdown) return;
    dropdown.classList.toggle("show");
  }
  window.toggleSettingsMenu = toggleSettingsMenu;

  function initSettingsBtn() {
    const settingsBtn = document.getElementById("settingsBtn");
    const dropdown = document.getElementById("dropdownContent");
    if (settingsBtn && dropdown) {
      settingsBtn.onclick = function(e) {
        toggleSettingsMenu(e);
      };
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSettingsBtn);
  } else {
    initSettingsBtn();
  }

  // Close dropdown on outside click or Escape key
  window.addEventListener("click", (e) => {
    const dropdown = document.getElementById("dropdownContent");
    const btn = document.getElementById("settingsBtn");
    if (!dropdown || !dropdown.classList.contains("show")) return;
    if (e.target && !dropdown.contains(e.target) && (!btn || !btn.contains(e.target))) {
      dropdown.classList.remove("show");
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e && e.key === "Escape") {
      const dropdown = document.getElementById("dropdownContent");
      if (dropdown) dropdown.classList.remove("show");
    }
  });  
  
  // ✅ Hide welcome panel  
  function hideWelcomePanel() {  
    const panel = document.getElementById("welcomePanel");  
    if (panel) {  
      panel.classList.add("is-hidden");
      panel.style.removeProperty("display");
      panel.style.setProperty("display", "none", "important");  
      if (panel.classList.contains("is-fullscreen")) {
        panel.classList.remove("is-fullscreen");
        document.body.style.overflow = "";
      }
    }  
  }  
  window.hideWelcomePanel = hideWelcomePanel;

  function showWelcomePanel() {
    const panel = document.getElementById("welcomePanel");
    if (panel) {
      panel.classList.remove("is-hidden");
      panel.style.removeProperty("display");
      panel.style.setProperty("display", "flex", "important");
    }
    const title = document.getElementById("selectedMechanismTitle");
    if (title) title.style.display = "none";
    const mechDetails = document.getElementById("mechanismDetailsContainer");
    if (mechDetails) {
      mechDetails.innerHTML = "";
      mechDetails.style.display = "none";
    }
  }
  window.showWelcomePanel = showWelcomePanel;  


function openHelp() {
  window.open("help.html", "_blank"); // ye help.html nayi tab me kholega
}
    
    
  function toggleCategory(element) {  
    if (!element) return;
    let ul = element.nextElementSibling;  
    while (ul && ul.tagName !== "UL") {
      ul = ul.nextElementSibling;
    }
    if (!ul) {
      const parentLi = element.closest("li");
      if (parentLi) ul = parentLi.querySelector("ul.mechanisms, ul");
    }
    if (!ul) return;

    const isExpanded = (ul.style.display === "block");  
    ul.style.display = isExpanded ? "none" : "block";  
    
    // Toggle arrow indicator if present inside category element
    const arrow = element.querySelector(".arrow, .tool-arrow");
    if (arrow) {
      arrow.textContent = isExpanded ? "▸" : "▾";
    }
    // Collapsing or expanding category in sidebar MUST NEVER close the sidebar drawer
    // or reset the main panel view!
  }  
  window.toggleCategory = toggleCategory;
  
// 🧼 Central helper to hide damage mechanism container when navigating to any module
function hideMechanismDetails() {
  const m = document.getElementById("mechanismDetailsContainer");
  if (m) {
    m.innerHTML = "";
    m.style.setProperty("display", "none", "important");
  }
  const st = document.getElementById("selectedMechanismTitle");
  if (st) {
    st.style.setProperty("display", "none", "important");
  }
}
window.hideMechanismDetails = hideMechanismDetails;

function showCriteriaTab() {  
  hideMechanismDetails();
  document.querySelectorAll(".tab-content").forEach(t => t.style.display = "none");  
  const el = document.getElementById("a571-criteriaTab");
  if (el) el.style.display = "block";  
  hideWelcomePanel();  
  if (typeof window.a571_init === "function") window.a571_init();
}  

function showCorrosionTab() {  
  hideMechanismDetails();
  document.querySelectorAll(".tab-content").forEach(t => t.style.display = "none");  
  const el = document.getElementById("corrosionRateTab");
  if (el) el.style.display = "block";  
  hideWelcomePanel();  
}  

function showCorrosionFullTab() {  
  hideMechanismDetails();
  document.querySelectorAll(".tab-content").forEach(t => t.style.display = "none");  
  const el = document.getElementById("corrosionFullTab");
  if (el) el.style.display = "block";  
  hideWelcomePanel();  

  if (typeof window.initCorrosionFullTab === "function") {
    window.initCorrosionFullTab();
  }

  if (typeof corrosionChart !== "undefined" && corrosionChart.data) {  
    corrosionChart.update();  
  }  
}  

// ✅ NEW FUNCTION: Show Representative Fluid Tab  
function showFluidSelectorTab() {  
  hideMechanismDetails();
  document.querySelectorAll(".tab-content").forEach(t => t.style.display = "none");  
  const el = document.getElementById("fluidSelectorTab");
  if (el) el.style.display = "block";  
  hideWelcomePanel();  
  if (typeof window.initFluidSelector === "function") window.initFluidSelector();
}  

function showInventoryTab() {  
  hideMechanismDetails();
  document.querySelectorAll(".tab-content").forEach(t => t.style.display = "none");  
  const el = document.getElementById("inventoryTab");
  if (el) el.style.display = "block";  
  hideWelcomePanel();  
  if (typeof window.initInventory === "function") window.initInventory();
  if (typeof window.initBulkUpload === "function") window.initBulkUpload();
}  

function showRemainingLifeTab() {  
  hideMechanismDetails();
  document.querySelectorAll(".tab-content").forEach(t => t.style.display = "none");  
  const el = document.getElementById("remainingLifeTab");
  if (el) el.style.display = "block";  
  hideWelcomePanel();  
}  
function showINSPECTIONCONFIDENCETab() {  
  hideMechanismDetails();
  document.querySelectorAll(".tab-content").forEach(t => t.style.display = "none");  
  document.getElementById("inspectionconfidenceTab").style.display = "block";  
  hideWelcomePanel();  
}  
function showASMEB31_3Tab() {  
  hideMechanismDetails();
  document.querySelectorAll(".tab-content").forEach(t => t.style.display = "none");  
  const tab = document.getElementById("ASMEB31_3Tab");
  if (tab) tab.style.display = "block";  
  hideWelcomePanel();  
  if (typeof window.initB313 === "function") {
    window.initB313();
  }
  if (typeof window.initB313AutoStressFields === "function") {
    window.initB313AutoStressFields(false);
  }
}  
window.showASMEB31_3Tab = showASMEB31_3Tab;  

function showSimplePipingTab() {  
  hideMechanismDetails();
  document.querySelectorAll(".tab-content").forEach(t => t.style.display = "none");  
  document.getElementById("simplePipingTab").style.display = "block";  
  hideWelcomePanel();  
  if (typeof window.initSimplePiping === "function") {
    window.initSimplePiping();
  }
  if (typeof window.initSimpleAutoStressFields === "function") {
    window.initSimpleAutoStressFields(false);
  }
}
window.showSimplePipingTab = showSimplePipingTab;

function showASMESECTIONVIIIDIV1Tab() {  
  hideMechanismDetails();
  document.querySelectorAll(".tab-content").forEach(t => t.style.display = "none");  
  document.getElementById("ASMESECTIONVIIIDIV1Tab").style.display = "block";  
  hideWelcomePanel();  
}
function showpipeThicknessTab() {  
  hideMechanismDetails();
  document.querySelectorAll(".tab-content").forEach(t => t.style.display = "none");  
  const tab = document.getElementById("pipeThicknessTab");
  if (tab) {
    tab.style.display = "block";
    if (typeof window.initPipeData883 === "function") {
      window.initPipeData883();
    }
  } else if (typeof window.TemplateManager !== "undefined" && typeof window.TemplateManager.load === "function") {
    window.TemplateManager.load("1043", function () {
      const loadedTab = document.getElementById("pipeThicknessTab");
      if (loadedTab) loadedTab.style.display = "block";
      if (typeof window.initPipeData883 === "function") {
        window.initPipeData883();
      }
    });
  }
  hideWelcomePanel();  
}
window.showpipeThicknessTab = showpipeThicknessTab;

function showStructuralThicknessTab() {
  hideMechanismDetails();
  document.querySelectorAll(".tab-content").forEach(t => t.style.display = "none");
  const tab = document.getElementById("structuralThicknessTab");
  if (tab) {
    tab.style.display = "block";
    hideWelcomePanel();
    if (typeof window.initStructuralThickness === "function") {
      window.initStructuralThickness(true);
    }
  } else if (typeof window.TemplateManager !== "undefined" && typeof window.TemplateManager.load === "function") {
    window.TemplateManager.load("1044", function () {
      const loadedTab = document.getElementById("structuralThicknessTab");
      if (loadedTab) loadedTab.style.display = "block";
      hideWelcomePanel();
      if (typeof window.initStructuralThickness === "function") {
        window.initStructuralThickness(true);
      }
    });
  } else {
    hideWelcomePanel();
  }
}
window.showStructuralThicknessTab = showStructuralThicknessTab;

function showTOXIC_CALCULATIONTab() {  
  hideMechanismDetails();
  document.querySelectorAll(".tab-content").forEach(t => t.style.display = "none");  
  document.getElementById("TOXIC_CALCULATIONTab").style.display = "block";  
  hideWelcomePanel();  
}  

function showCORROSION_CALCULATIONTab() {  
  hideMechanismDetails();
  document.querySelectorAll(".tab-content").forEach(t => t.style.display = "none");  
  document.getElementById("CORROSION_CALCULATIONTab").style.display = "block";  
  hideWelcomePanel();  
  if (window.RBIApp && typeof window.RBIApp.render === "function") {
    window.RBIApp.render();
  }
} 
function showcof_calculatorTab() {  
  hideMechanismDetails();
  document.querySelectorAll(".tab-content").forEach(t => t.style.display = "none");  
  document.getElementById("cof_calculatorTab").style.display = "block";  
  hideWelcomePanel();  
}  
function showQPOF_calculatorTab() {  
  hideMechanismDetails();
  document.querySelectorAll(".tab-content").forEach(t => t.style.display = "none");  
  document.getElementById("QPOF_calculatorTab").style.display = "block";  
  hideWelcomePanel();  
}  

function showCrackingMechanismTab() {
  hideMechanismDetails();
  document.querySelectorAll(".tab-content").forEach(t => t.style.display = "none");
  document.getElementById("crackingMechanismTab").style.display = "block";
  hideWelcomePanel();
}

function showbkStressTab() {
  hideMechanismDetails();
  document.querySelectorAll(".tab-content").forEach(t => t.style.display = "none");
  document.getElementById("bkStressTab").style.display = "block";
  hideWelcomePanel();

  // Ensure dropdowns, listeners, and views are populated with latest database
  if (typeof window.initBkStressStandaloneUI === "function") {
    window.initBkStressStandaloneUI();
  } else {
    if (typeof window.bkPopulateYears === "function") {
      window.bkPopulateYears();
    }
    if (typeof window.renderYearManagerList === "function") {
      window.renderYearManagerList();
    }
    if (typeof window.updateActiveDatabaseSummaryBadge === "function") {
      window.updateActiveDatabaseSummaryBadge();
    }
  }
  if (typeof window.renderTemperaturePointsTable === "function") {
    window.renderTemperaturePointsTable();
  }
}

function showRPTUDashboard() {
  window.open("RPTU_Dashboard.html", "_blank");
}

// 🌐 Explicitly expose all tab navigation functions globally on window
window.showCriteriaTab = showCriteriaTab;
window.showCorrosionTab = showCorrosionTab;
window.showCorrosionFullTab = showCorrosionFullTab;
window.showFluidSelectorTab = showFluidSelectorTab;
window.showInventoryTab = showInventoryTab;
window.showRemainingLifeTab = showRemainingLifeTab;
window.showINSPECTIONCONFIDENCETab = showINSPECTIONCONFIDENCETab;
window.showASMEB31_3Tab = showASMEB31_3Tab;
window.showSimplePipingTab = showSimplePipingTab;
window.showASMESECTIONVIIIDIV1Tab = showASMESECTIONVIIIDIV1Tab;
window.showpipeThicknessTab = showpipeThicknessTab;
window.showTOXIC_CALCULATIONTab = showTOXIC_CALCULATIONTab;
window.showCORROSION_CALCULATIONTab = showCORROSION_CALCULATIONTab;
window.showcof_calculatorTab = showcof_calculatorTab;
window.showQPOF_calculatorTab = showQPOF_calculatorTab;
window.showCrackingMechanismTab = showCrackingMechanismTab;
window.showbkStressTab = showbkStressTab;
window.showRPTUDashboard = showRPTUDashboard;
  
  function clearMechanismDetails() {  
    document.getElementById("mechanismDetailsContainer").innerHTML = "";  
    document.getElementById("selectedMechanismTitle").textContent = "Select a Damage Mechanism";  
    document.getElementById("selectedMechanismTitle").style.display = "block";  
  }  
  
    
  
  function injectAPI581Category() {  
  const categoryList = document.getElementById("categoryList");  
  if (!categoryList || document.getElementById("rbac_cat_api581")) return;
  const api581 = document.createElement("li");  
  api581.id = "rbac_cat_api581";
  api581.setAttribute("data-rbac-module", "api581");

  api581.innerHTML = `  
    <span class="category" onclick="toggleCategory(this)">Risk-Based Inspection Methodology</span>  
    <ul class="mechanisms" style="display:none;">  
      <li data-rbac-module="api581" data-rbac-sub="api571Criteria"><a href="#" onclick="hideAllMainPanels(); showCriteriaTab(); hideWelcomePanel()">Criteria of Finding Damage Mechanism</a></li>  
      <li data-rbac-module="api581" data-rbac-sub="corrosionRate"><a href="#" onclick="hideAllMainPanels(); showCorrosionFullTab(); hideWelcomePanel()">Damage Mechanism – Corrosion Rate Estimator</a></li>  
      <li data-rbac-module="api581" data-rbac-sub="fluidSelector"><a href="#" onclick="hideAllMainPanels(); showFluidSelectorTab(); hideWelcomePanel()">Representative Fluid</a></li>  
      <li data-rbac-module="api581" data-rbac-sub="inventoryCalc"><a href="#" onclick="hideAllMainPanels(); showInventoryTab(); hideWelcomePanel()">Inventory Calculator</a></li>  
      <li data-rbac-module="api581" data-rbac-sub="inspectionConfidence"><a href="#" onclick="hideAllMainPanels(); showINSPECTIONCONFIDENCETab(); hideWelcomePanel()">Inspection Confidence</a></li>  
      <li data-rbac-module="api581" data-rbac-sub="toxicCalc"><a href="#" onclick="hideAllMainPanels(); showTOXIC_CALCULATIONTab(); hideWelcomePanel()">Toxic % Calculation</a></li> 

      <!-- New Quantitative Subcategory -->
      <li data-rbac-subcategory="quantitative" class="subcategory-item" style="list-style: none;">
        <span class="subcategory" onclick="toggleCategory(this)">Quantitative</span>
        <ul class="mechanisms" style="display:none;">
          <li data-rbac-module="api581" data-rbac-sub="cofCalculator"><a href="#" onclick="hideAllMainPanels(); showcof_calculatorTab(); hideWelcomePanel()">Risk Calculator_COF</a></li>
          <li data-rbac-module="api581" data-rbac-sub="qpofCalculator"><a href="#" onclick="hideAllMainPanels(); showQPOF_calculatorTab(); hideWelcomePanel()">Risk Calculator_POF</a></li>
        </ul>
      </li>

      <!-- New Semi Quantitative Subcategory -->
      <li data-rbac-subcategory="semiQuantitative" class="subcategory-item" style="list-style: none;">
        <span class="subcategory" onclick="toggleCategory(this)">Semi Quantitative</span>
        <ul class="mechanisms" style="display:none;">
          <li data-rbac-module="api581" data-rbac-sub="corrosionCalc"><a href="#" onclick="hideAllMainPanels(); showCORROSION_CALCULATIONTab(); hideWelcomePanel()">Risk Calculator</a></li>
        </ul>
      </li>

    </ul>  
  `;  

  categoryList.appendChild(api581);  
}
  
function injectAPI570Category() {  
  const categoryList = document.getElementById("categoryList");  
  if (!categoryList || document.getElementById("rbac_cat_api570")) return;
  const api570 = document.createElement("li");  
  api570.id = "rbac_cat_api570";
  api570.setAttribute("data-rbac-module", "api570");
  
  api570.innerHTML = `  
    <span class="category" onclick="toggleCategory(this)">Thickness Data Evaluation & Analysis</span>  
    <ul class="mechanisms" style="display:none;">  
      <li data-rbac-module="api570" data-rbac-sub="statisticalAnalysis"><a href="#" onclick="hideAllMainPanels(); showRemainingLifeTab(); hideWelcomePanel()">Statistical Analysis</a></li>  
    </ul>  
  `;  
  
  categoryList.appendChild(api570);  
}  
  
function injectDesignThicknessCalculatorCategory() {  
  const categoryList = document.getElementById("categoryList");  
  if (!categoryList || document.getElementById("rbac_cat_thicknessCalc") || document.getElementById("rbac_cat_designThickness")) return;
  const designThicknessCalculator = document.createElement("li");  
  designThicknessCalculator.id = "rbac_cat_thicknessCalc";
  designThicknessCalculator.setAttribute("data-rbac-module", "thicknessCalc");
  
  designThicknessCalculator.innerHTML = `  
  <span class="category" onclick="toggleCategory(this)">Design Thickness Calculator</span>  
  <ul class="mechanisms" style="display:none;">  

    <!-- ✅ Process Piping with Submenu -->
    <li data-rbac-subcategory="processPiping" class="subcategory-item" style="list-style: none;">
      <span class="subcategory" onclick="toggleCategory(this)">Process Piping</span>
      <ul class="mechanisms" style="display:none;">
        <li data-rbac-module="thicknessCalc" data-rbac-sub="asmeB31_3">
          <a href="#" onclick="event.preventDefault(); hideAllMainPanels(); showASMEB31_3Tab(); hideWelcomePanel();">
            ASME B31.3 (Advanced)
          </a>
        </li>
        <li data-rbac-module="thicknessCalc" data-rbac-sub="simplePiping">
          <a href="#" onclick="event.preventDefault(); hideAllMainPanels(); showSimplePipingTab(); hideWelcomePanel();">
            Simple Formula (PD / 2SE)
          </a>
        </li>
      </ul>
    </li>

    <!-- ✅ Other options same -->
    <li data-rbac-module="thicknessCalc" data-rbac-sub="asmeSectionVIII">
      <a href="#" onclick="event.preventDefault(); hideAllMainPanels(); showASMESECTIONVIIIDIV1Tab(); hideWelcomePanel();">
        Pressure Vessel
      </a>
    </li>

    <li data-rbac-module="thicknessCalc" data-rbac-sub="pipeThickness">
      <a href="#" onclick="event.preventDefault(); hideAllMainPanels(); showpipeThicknessTab(); hideWelcomePanel();">
        Piping Thickness Chart
      </a>
    </li>

    <li data-rbac-module="thicknessCalc" data-rbac-sub="structuralThickness">
      <a href="#" onclick="event.preventDefault(); hideAllMainPanels(); showStructuralThicknessTab(); hideWelcomePanel();">
        Structural Thickness Lookup
      </a>
    </li>

  </ul>  
`;  
      
  categoryList.appendChild(designThicknessCalculator);  
}
  
function injectCrackingMechanismCategory() {
  const categoryList = document.getElementById("categoryList");
  if (!categoryList || document.getElementById("rbac_cat_cracking")) return;
  const crackingCategory = document.createElement("li");
  crackingCategory.id = "rbac_cat_cracking";
  crackingCategory.setAttribute("data-rbac-module", "crackingMechanism");

  crackingCategory.innerHTML = `
    <span class="category" onclick="toggleCategory(this)">Cracking Mechanism Finder</span>
    <ul class="mechanisms" style="display:none;">
      <li data-rbac-module="crackingMechanism" data-rbac-sub="crackingFinder"><a href="#" onclick="event.preventDefault(); hideAllMainPanels(); showCrackingMechanismTab(); hideWelcomePanel();">Open Finder</a></li>
    </ul>
  `;

  categoryList.appendChild(crackingCategory);
}

function injectStressMaterialDataCategory() {
  const categoryList = document.getElementById("categoryList");
  if (!categoryList || document.getElementById("rbac_cat_bkStress")) return;
  const stressMaterialCategory = document.createElement("li");
  stressMaterialCategory.id = "rbac_cat_bkStress";
  stressMaterialCategory.setAttribute("data-rbac-module", "bkStress");

  stressMaterialCategory.innerHTML = `
    <span class="category" onclick="toggleCategory(this)">🧮 Allowable Stress Lookup</span>
    <ul class="mechanisms" style="display:none;">
      <li data-rbac-module="bkStress" data-rbac-sub="stressLookup"><a href="#" onclick="event.preventDefault(); hideAllMainPanels(); showbkStressTab(); hideWelcomePanel();">🔍 Allowable Stress & Material Data</a></li>
    </ul>
  `;

  categoryList.appendChild(stressMaterialCategory);
}

function injectRPTUDashboardCategory() {
  const categoryList = document.getElementById("categoryList");
  if (!categoryList || document.getElementById("rbac_cat_rptu")) return;
  const rptuCategory = document.createElement("li");
  rptuCategory.id = "rbac_cat_rptu";
  rptuCategory.setAttribute("data-rbac-module", "rptu");

  rptuCategory.innerHTML = `
    <span class="category" onclick="toggleCategory(this)">
      RPTU Dashboard
    </span>
    <ul class="mechanisms" style="display:none;">
      <li data-rbac-module="rptu" data-rbac-sub="rptuDashboard">
        <a href="#" onclick="event.preventDefault(); showRPTUDashboard();">
          Open Dashboard
        </a>
      </li>
    </ul>
  `;

  categoryList.appendChild(rptuCategory);
}

function showCCDAITab() {
  document.querySelectorAll(".tab-content").forEach(t => t.style.display = "none");
  const mechTitle = document.getElementById("selectedMechanismTitle");
  if (mechTitle) mechTitle.style.display = "none";
  hideWelcomePanel();
  hideAllMainPanels();

  // Ensure fullscreen admin console mode is deactivated so tool renders in main dashboard
  document.body.classList.remove("admin-mode-active", "non-admin-tool-mode", "tool-direct-view");

  const tab = document.getElementById("ccdAiTab");
  if (tab) {
    tab.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Highlight CCD AI Platform in main sidebar
  document.querySelectorAll("#categoryList a").forEach(a => a.classList.remove("active-link"));
  const link = document.querySelector('#rbac_cat_ccdAI li[data-rbac-sub="ccdAiPlatform"] a');
  if (link) link.classList.add("active-link");

  if (window.recentTabs && typeof window.recentTabs.addTab === "function") {
    window.recentTabs.addTab("ccdAiTab");
  }
}
window.showCCDAITab = showCCDAITab;

function openCCDAIPlatform() {
  showCCDAITab();
}
window.openCCDAIPlatform = openCCDAIPlatform;



function showStreamComparatorTab() {
  document.querySelectorAll(".tab-content").forEach(t => t.style.display = "none");
  const mechTitle = document.getElementById("selectedMechanismTitle");
  if (mechTitle) mechTitle.style.display = "none";
  hideWelcomePanel();
  hideAllMainPanels();

  // Ensure fullscreen admin console mode is deactivated so tool renders in main dashboard
  document.body.classList.remove("admin-mode-active", "non-admin-tool-mode", "tool-direct-view");

  const tab = document.getElementById("streamComparatorTab");
  if (tab) {
    tab.style.display = "block";
    tab.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Highlight standalone Stream Comparator in main sidebar
  document.querySelectorAll("#categoryList a").forEach(a => a.classList.remove("active-link"));
  const link = document.querySelector('#rbac_cat_streamComparator li[data-rbac-sub="streamComparatorMain"] a');
  if (link) link.classList.add("active-link");
}
window.showStreamComparatorTab = showStreamComparatorTab;

function showUnitConverterTab() {
  document.querySelectorAll(".tab-content").forEach(t => t.style.display = "none");
  const mechTitle = document.getElementById("selectedMechanismTitle");
  if (mechTitle) mechTitle.style.display = "none";
  hideWelcomePanel();
  hideAllMainPanels();

  const tab = document.getElementById("unitConverterTab");
  if (tab) {
    tab.style.display = "block";
    tab.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
window.showUnitConverterTab = showUnitConverterTab;

function injectUnitConverterCategory() {
  const categoryList = document.getElementById("categoryList");
  if (!categoryList) return;
  if (document.getElementById("rbac_cat_unitConverter")) return;
  const unitLi = document.createElement("li");
  unitLi.id = "rbac_cat_unitConverter";
  unitLi.setAttribute("data-rbac-module", "unitConverter");

  unitLi.innerHTML = `
    <span class="category" onclick="toggleCategory(this)">
      📐 Unit Converters
    </span>
    <ul class="mechanisms" style="display:none;">
      <li data-rbac-module="unitConverter" data-rbac-sub="unitConverterMain">
        <a href="#" onclick="event.preventDefault(); document.querySelectorAll('#categoryList a').forEach(a => a.classList.remove('active-link')); this.classList.add('active-link'); hideAllMainPanels(); if (typeof showUnitConverterTab === 'function') showUnitConverterTab(); hideWelcomePanel();">
          ⚡ Plant & Integrity Units
        </a>
      </li>
    </ul>
  `;

  categoryList.appendChild(unitLi);
}
window.injectUnitConverterCategory = injectUnitConverterCategory;

function injectStreamComparatorCategory() {
  const categoryList = document.getElementById("categoryList");
  if (!categoryList) return;
  if (document.getElementById("rbac_cat_streamComparator")) return;
  const streamLi = document.createElement("li");
  streamLi.id = "rbac_cat_streamComparator";
  streamLi.setAttribute("data-rbac-module", "streamComparator");

  streamLi.innerHTML = `
    <span class="category" onclick="toggleCategory(this)">
      🔄 Stream Comparator (HMB)
    </span>
    <ul class="mechanisms" style="display:none;">
      <li data-rbac-module="streamComparator" data-rbac-sub="streamComparatorMain">
        <a href="#" onclick="event.preventDefault(); document.querySelectorAll('#categoryList a').forEach(a => a.classList.remove('active-link')); this.classList.add('active-link'); hideAllMainPanels(); if (typeof showStreamComparatorTab === 'function') showStreamComparatorTab(); hideWelcomePanel();">
          📊 Process Stream & Material Balance Comparator
        </a>
      </li>
    </ul>
  `;

  categoryList.appendChild(streamLi);
}

function injectChemicalSuiteCategory() {
  const categoryList = document.getElementById("categoryList");
  if (!categoryList) return;
  if (document.getElementById("rbac_cat_chemicalSuite")) return;
  const chemSuiteLi = document.createElement("li");
  chemSuiteLi.id = "rbac_cat_chemicalSuite";
  chemSuiteLi.setAttribute("data-rbac-module", "chemicalSuite");

  chemSuiteLi.innerHTML = `
    <span class="category" onclick="toggleCategory(this)">
      ⚗️ Chemistry & Chemical Suite
    </span>
    <ul class="mechanisms" style="display:none;">
      <li data-rbac-module="chemicalSuite" data-rbac-sub="chemicalSafetySuite">
        <a href="#" onclick="event.preventDefault(); document.querySelectorAll('#categoryList a').forEach(a => a.classList.remove('active-link')); this.classList.add('active-link'); hideAllMainPanels(); if (typeof showChemicalSuiteTab === 'function') showChemicalSuiteTab('suit'); hideWelcomePanel();">
          🦺 Chemical & HAZMAT Safety Suite
        </a>
      </li>
    </ul>
  `;

  categoryList.appendChild(chemSuiteLi);
}
window.injectChemicalSuiteCategory = injectChemicalSuiteCategory;

function injectCCDAIPlatformCategory() {
  const categoryList = document.getElementById("categoryList");
  if (!categoryList || document.getElementById("rbac_cat_ccdAI")) return;
  const ccdAI = document.createElement("li");
  ccdAI.id = "rbac_cat_ccdAI";
  ccdAI.setAttribute("data-rbac-module", "ccdAI");

  ccdAI.innerHTML = `
    <span class="category" onclick="toggleCategory(this)">
      🤖 CCD AI Platform
    </span>
    <ul class="mechanisms" style="display:none;">
      <li data-rbac-module="ccdAI" data-rbac-sub="ccdAiPlatform">
        <a href="#" onclick="event.preventDefault(); document.querySelectorAll('#categoryList a').forEach(a => a.classList.remove('active-link')); this.classList.add('active-link'); hideAllMainPanels(); if (typeof showCCDAITab === 'function') showCCDAITab(); hideWelcomePanel();">
          Corrosion Control Document Management
        </a>
      </li>
    </ul>
  `;

  categoryList.appendChild(ccdAI);
}

function injectToolsCategory() {
  const categoryList = document.getElementById("categoryList");
  if (!categoryList) return;

  let toolsCategory = document.getElementById("rbac_cat_tools");
  if (!toolsCategory) {
    toolsCategory = document.createElement("li");
    toolsCategory.id = "rbac_cat_tools";
    toolsCategory.setAttribute("data-rbac-module", "adminControlCenter");
    categoryList.appendChild(toolsCategory);
  }

  const hasSub = (subId) => (window.RBAC && typeof window.RBAC.hasSectionAccess === "function" ? window.RBAC.hasSectionAccess("adminControlCenter", subId) : true);
  const isAdminOrSuper = (window.RBAC && (window.RBAC.isSuperAdmin || window.RBAC.role === "admin")) || (window.adminPanel && typeof window.adminPanel.isAdmin === "function" && window.adminPanel.isAdmin());

  if (typeof window.toggleToolSubGroup !== "function") {
    window.toggleToolSubGroup = function (el) {
      const list = el.nextElementSibling;
      const arrow = el.querySelector(".tool-arrow");
      if (list) {
        if (list.style.display === "none" || !list.style.display) {
          list.style.display = "block";
          if (arrow) arrow.textContent = "▾";
        } else {
          list.style.display = "none";
          if (arrow) arrow.textContent = "▸";
        }
      }
    };
  }

  const groupsConfig = [
    {
      title: "👥 USERS & PERMISSIONS",
      subs: [
        { id: "userManagement", label: "User Management", tool: "users-list" },
        { id: "rbacPermissions", label: "Roles & Permissions", tool: "roles-config" },
        { id: "accessControl", label: "Access Control", tool: "access-control" }
      ]
    },
    {
      title: "⚙️ APPLICATION MANAGER",
      subs: [
        { id: "appOverview", label: "Applications Overview", tool: "app-hub" },
        { id: "appDamage", label: "API 571 Damage Mechanism", tool: "app-damage" },
        { id: "appStream", label: "Stream Data Manager", tool: "app-stream" },
        { id: "appStress", label: "Allowable Stress Manager", tool: "app-stress" }
      ]
    },
    {
      title: "💻 SYSTEMS & DIAGNOSTICS",
      subs: [
        { id: "firestoreExplorer", label: "Firestore Collections Explorer", tool: "sys-firestore" },
        { id: "sysDiagnostics", label: "Backup & Cloud Diagnostics", tool: "sys-diagnostics" },
        { id: "projectSwitcher", label: "Project Switcher", tool: "sys-projects" },
        { id: "activeSessions", label: "Active Sessions", tool: "sys-sessions" },
        { id: "systemLogs", label: "System Logs", tool: "sys-logs" }
      ]
    },
    {
      title: "📐 LAYOUT BUILDER",
      subs: [
        { id: "layoutBuilder", label: "Sidebar Configuration", tool: "layout-sidebar" },
        { id: "sidebarOrder", label: "Sidebar Order", tool: "layout-order" },
        { id: "tickerText", label: "Ticker Text", tool: "layout-ticker" },
        { id: "welcomeCards", label: "Welcome Cards", tool: "layout-welcome" },
        { id: "navVisibility", label: "Navigation Visibility", tool: "layout-visibility" }
      ]
    },
    {
      title: "💾 MASTER DATA & BACKUP",
      subs: [
        { id: "masterData", label: "Master Data Management", tool: "master-overview" },
        { id: "jsonBackup", label: "1-Click JSON Backup", tool: "master-backup" },
        { id: "jsonRestore", label: "JSON Restore", tool: "master-restore" },
        { id: "backupHistory", label: "Backup History", tool: "master-history" },
        { id: "auditTrail", label: "Audit Trail", tool: "master-audit" }
      ]
    }
  ];

  let totalVisibleTools = 0;
  let groupsHtml = "";

  groupsConfig.forEach(grp => {
    let visibleSubsCount = 0;
    let subsHtml = "";
    grp.subs.forEach(sub => {
      const allowed = isAdminOrSuper || hasSub(sub.id);
      if (allowed) {
        visibleSubsCount++;
        totalVisibleTools++;
        subsHtml += `
          <li data-rbac-module="adminControlCenter" data-rbac-sub="${sub.id}" style="margin: 1px 0; padding: 0; list-style: none !important;">
            <a href="#" onclick="event.preventDefault(); window.openTool('${sub.tool}');" style="display: block; padding: 3px 6px; border-radius: 4px; font-size: 12px; line-height: 1.3; color: #334155; text-decoration: none;">${sub.label}</a>
          </li>
        `;
      }
    });

    if (visibleSubsCount > 0) {
      groupsHtml += `
        <div onclick="window.toggleToolSubGroup(this)" style="font-size: 10.5px; font-weight: 700; color: #475569; padding: 4px 6px; letter-spacing: 0.5px; text-transform: uppercase; cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border-radius: 4px; margin-top: 3px; margin-bottom: 1px;">
          <span>${grp.title}</span><span class="tool-arrow" style="font-size: 12px; color: #94a3b8;">▸</span>
        </div>
        <ul style="display: none; list-style: none !important; padding-left: 8px; margin: 1px 0 3px 0;">
          ${subsHtml}
        </ul>
      `;
    }
  });

  if (totalVisibleTools === 0) {
    toolsCategory.style.setProperty("display", "none", "important");
  } else {
    toolsCategory.style.removeProperty("display");
    toolsCategory.innerHTML = `
      <span class="category" onclick="toggleCategory(this)">
        <span class="arrow"></span><span class="category-title">🛠️ Tools</span>
      </span>
      <ul style="display:none; padding-left: 0; list-style: none !important; list-style-type: none !important; margin: 0;">
        ${groupsHtml}
      </ul>
    `;
  }
}
window.injectToolsCategory = injectToolsCategory;

window.openTool = function (viewId) {
  const isAdm = (window.adminPanel && typeof window.adminPanel.isAdmin === "function")
    ? window.adminPanel.isAdmin()
    : (window.RBAC && (window.RBAC.role === "admin" || window.RBAC.isSuperAdmin));

  if (isAdm) {
    // Admin routing: keep existing admin behavior unchanged
    if (typeof hideAllMainPanels === "function") hideAllMainPanels();
    if (typeof hideWelcomePanel === "function") hideWelcomePanel();
    if (typeof window.showAdminPanelTab === "function") {
      window.showAdminPanelTab(viewId);
    } else if (window.adminPanel && typeof window.adminPanel.navigateTo === "function") {
      window.adminPanel.navigateTo(viewId);
    }
    if (typeof window.closeMobileSidebar === "function") {
      window.closeMobileSidebar();
    }
    return;
  }

  // Non-Admin routing: check access & directly open assigned tool dashboard
  const subMap = {
    "users-list": "userManagement",
    "roles-config": "rbacPermissions",
    "access-control": "accessControl",
    "app-hub": "appOverview",
    "app-damage": "appDamage",
    "app-stream": "appStream",
    "app-stress": "appStress",
    "sys-firestore": "firestoreExplorer",
    "sys-diagnostics": "sysDiagnostics",
    "sys-projects": "projectSwitcher",
    "sys-sessions": "activeSessions",
    "sys-logs": "systemLogs",
    "layout-sidebar": "layoutBuilder",
    "layout-order": "sidebarOrder",
    "layout-ticker": "tickerText",
    "layout-welcome": "welcomeCards",
    "layout-visibility": "navVisibility",
    "master-overview": "masterData",
    "master-backup": "jsonBackup",
    "master-restore": "jsonRestore",
    "master-history": "backupHistory",
    "master-audit": "auditTrail"
  };
  const subKey = subMap[viewId] || viewId;
  const hasAccess = window.RBAC && typeof window.RBAC.hasSectionAccess === "function"
    ? (
        window.RBAC.hasSectionAccess("adminControlCenter", subKey) ||
        window.RBAC.hasSectionAccess("adminControlCenter", viewId) ||
        (subKey === "appStream" && (
          window.RBAC.hasSectionAccess("adminControlCenter", "appStream") ||
          window.RBAC.hasSectionAccess("adminControlCenter", "app-stream") ||
          (window.RBAC.subsections?.adminControlCenter?.appStream === true)
        ))
      )
    : (window.RBAC && typeof window.RBAC.hasModuleAccess === "function" && window.RBAC.hasModuleAccess("adminControlCenter"));

  if (!hasAccess) {
    if (window.RBAC && typeof window.RBAC.showAccessDenied === "function") {
      window.RBAC.showAccessDenied(viewId);
    } else if (typeof Swal !== "undefined") {
      Swal.fire({
        icon: "warning",
        title: "Access Restricted",
        text: "You do not have permission to access this tool.",
        confirmButtonColor: "#2563eb"
      });
    } else {
      alert("Access Restricted: You do not have permission to access this tool.");
    }
    return;
  }

  // Clear other active sidebar links and highlight clicked tool sub-tab under Tools
  document.querySelectorAll("#categoryList a").forEach(a => a.classList.remove("active-link"));
  const toolLink = document.querySelector(`#rbac_cat_tools li[data-rbac-sub="${subKey}"] a`);
  if (toolLink) toolLink.classList.add("active-link");

  // Directly open assigned tool dashboard
  if (typeof window.showAdminPanelTab === "function") {
    window.showAdminPanelTab(viewId);
  } else if (window.adminPanel && typeof window.adminPanel.navigateTo === "function") {
    window.adminPanel.navigateTo(viewId);
  }

  if (typeof window.closeMobileSidebar === "function") {
    window.closeMobileSidebar();
  }
};

  
    
function showCDUVDUTab() {  
  // Hide all other tabs  
  document.querySelectorAll(".tab-content").forEach(t => t.style.display = "none");  
  const smt = document.getElementById("selectedMechanismTitle");
  if (smt) smt.style.display = "none";  
  hideWelcomePanel();  
  hideAllMainPanels(); // ✅ Also hide API 571 panels  
  
  function doOpen() {
    // ✅ Close other modals if open  
    const pfm = document.getElementById("processFlowModal");
    if (pfm) pfm.style.display = "none";
    const mm = document.getElementById("mspModal");
    if (mm) mm.style.display = "none";
    const hm = document.getElementById("h2uModal");
    if (hm) hm.style.display = "none";
    
    // ✅ Show CDU/VDU modal  
    const modal = document.getElementById("cduVduModal");
    if (modal) {
      modal.classList.remove("sidebar-collapsed");
      modal.style.display = "block";
      const toggleBtn = modal.querySelector(".diagram-sidebar-toggle-btn");
      if (toggleBtn) toggleBtn.textContent = "↔ Hide Sidebar";
    }
    if (typeof initCDUVDU === "function") initCDUVDU(); // ✅ Ensure SVG and logic are loaded  
  }

  if (!document.getElementById("cduVduModal") && window.TemplateManager && typeof window.TemplateManager.loadPfdModals === "function") {
    window.TemplateManager.loadPfdModals(doOpen);
  } else {
    doOpen();
  }
}  
  
function closeCDUVDUModal() {  
  const m = document.getElementById("cduVduModal");
  if (m) m.style.display = "none";  
  if (typeof window.clearCduvduBlinkIntervals === "function") window.clearCduvduBlinkIntervals();
  hideAllMainPanels(); // ✅ Ensure Damage Mechanism panels are hidden after close  
}  
  
function showPROCESSFLOWDIAGRAMSTab() {  
  // Hide all other tabs  
  document.querySelectorAll(".tab-content").forEach(t => t.style.display = "none");  
  const smt = document.getElementById("selectedMechanismTitle");
  if (smt) smt.style.display = "none";  
  hideWelcomePanel();  
  hideAllMainPanels(); // ✅ Hide DM panels to prevent residual view  
  
  function doOpen() {
    // ✅ Close other modals if open  
    const cvm = document.getElementById("cduVduModal");
    if (cvm) cvm.style.display = "none";
    const mm = document.getElementById("mspModal");
    if (mm) mm.style.display = "none";
    const hm = document.getElementById("h2uModal");
    if (hm) hm.style.display = "none";
    
    // ✅ Show Process Flow modal  
    const modal = document.getElementById("processFlowModal");
    if (modal) {
      modal.classList.remove("sidebar-collapsed");
      modal.style.display = "block";
      const toggleBtn = modal.querySelector(".diagram-sidebar-toggle-btn");
      if (toggleBtn) toggleBtn.textContent = "↔ Hide Sidebar";
    }
    if (typeof initProcessFlow === "function") initProcessFlow();
  }

  if (!document.getElementById("processFlowModal") && window.TemplateManager && typeof window.TemplateManager.loadPfdModals === "function") {
    window.TemplateManager.loadPfdModals(doOpen);
  } else {
    doOpen();
  }
}  
  
function closeProcessFlowModal() {  
  const m = document.getElementById("processFlowModal");
  if (m) m.style.display = "none";  
  if (typeof window.clearMainBlinkIntervals === "function") window.clearMainBlinkIntervals();
  hideAllMainPanels(); // ✅ Clean up API 571 panels  
}  
  
function showMSPTab() {  
  // Hide all other tabs  
  document.querySelectorAll(".tab-content").forEach(t => t.style.display = "none");  
  const smt = document.getElementById("selectedMechanismTitle");
  if (smt) smt.style.display = "none";  
  hideWelcomePanel();  
  hideAllMainPanels(); // ✅ Hide DM panels  
  
  function doOpen() {
    // ✅ Close other modals if open  
    const cvm = document.getElementById("cduVduModal");
    if (cvm) cvm.style.display = "none";
    const pfm = document.getElementById("processFlowModal");
    if (pfm) pfm.style.display = "none";
    const hm = document.getElementById("h2uModal");
    if (hm) hm.style.display = "none";
    
    // ✅ Show MSP modal  
    const modal = document.getElementById("mspModal");
    if (modal) {
      modal.classList.remove("sidebar-collapsed");
      modal.style.display = "block";
      const toggleBtn = modal.querySelector(".diagram-sidebar-toggle-btn");
      if (toggleBtn) toggleBtn.textContent = "↔ Hide Sidebar";
    }
    if (typeof initMSP === "function") initMSP(); // ✅ Ensure SVG and logic are loaded  
  }

  if (!document.getElementById("mspModal") && window.TemplateManager && typeof window.TemplateManager.loadPfdModals === "function") {
    window.TemplateManager.loadPfdModals(doOpen);
  } else {
    doOpen();
  }
}  
  
function closeMSPModal() {  
  const m = document.getElementById("mspModal");
  if (m) m.style.display = "none";  
  if (typeof window.clearMspBlinkIntervals === "function") window.clearMspBlinkIntervals();
  hideAllMainPanels(); // ✅ Ensure Damage Mechanism panels are hidden after close  
}  
  
function showH2UTab() {  
  // Hide all other tabs  
  document.querySelectorAll(".tab-content").forEach(t => t.style.display = "none");  
  const smt = document.getElementById("selectedMechanismTitle");
  if (smt) smt.style.display = "none";  
  hideWelcomePanel();  
  hideAllMainPanels();  
  
  function doOpen() {
    // ✅ Close other modals if open  
    const cvm = document.getElementById("cduVduModal");
    if (cvm) cvm.style.display = "none";
    const pfm = document.getElementById("processFlowModal");
    if (pfm) pfm.style.display = "none";
    const mm = document.getElementById("mspModal");
    if (mm) mm.style.display = "none";
    
    // ✅ Show H2U modal  
    const modal = document.getElementById("h2uModal");
    if (modal) {
      modal.classList.remove("sidebar-collapsed");
      modal.style.display = "block";
      const toggleBtn = modal.querySelector(".diagram-sidebar-toggle-btn");
      if (toggleBtn) toggleBtn.textContent = "↔ Hide Sidebar";
    }
    if (typeof initH2U === "function") initH2U();   
  }

  if (!document.getElementById("h2uModal") && window.TemplateManager && typeof window.TemplateManager.loadPfdModals === "function") {
    window.TemplateManager.loadPfdModals(doOpen);
  } else {
    doOpen();
  }
}  
  
function closeH2UModal() {  
  const m = document.getElementById("h2uModal");
  if (m) m.style.display = "none";  
  if (typeof window.clearH2uBlinkIntervals === "function") window.clearH2uBlinkIntervals();
  hideAllMainPanels();   
}  
  
// ✅ Inject Process Flow Diagrams with all tabs  
function injectProcessFlowDiagramsCategory() {  
  const categoryList = document.getElementById("categoryList");  
  if (!categoryList || document.getElementById("rbac_cat_processFlow")) return;
  const processFlowDiagrams = document.createElement("li");  
  processFlowDiagrams.id = "rbac_cat_processFlow";
  processFlowDiagrams.setAttribute("data-rbac-module", "processFlow");
  
  processFlowDiagrams.innerHTML = `  
    <span class="category" onclick="toggleCategory(this)"> Corrosion Diagrams</span>  
    <ul class="mechanisms" style="display:none;">  
      <li data-rbac-module="processFlow" data-rbac-sub="atmospheric"><a href="#" onclick="event.preventDefault(); showPROCESSFLOWDIAGRAMSTab();">HYDROPROCESSING</a></li>  
      <li data-rbac-module="processFlow" data-rbac-sub="cduVdu"><a href="#" onclick="event.preventDefault(); showCDUVDUTab();">CDU / VDU</a></li>  
      <li data-rbac-module="processFlow" data-rbac-sub="msp"><a href="#" onclick="event.preventDefault(); showMSPTab();">MSP</a></li>  
      <li data-rbac-module="processFlow" data-rbac-sub="h2u"><a href="#" onclick="event.preventDefault(); showH2UTab();">H2U</a></li>  
    </ul>  
  `;  
  
  categoryList.appendChild(processFlowDiagrams);  
}  
window.injectProcessFlowDiagramsCategory = injectProcessFlowDiagramsCategory;
window.injectAPI581Category = injectAPI581Category;
window.injectAPI570Category = injectAPI570Category;
window.injectDesignThicknessCalculatorCategory = injectDesignThicknessCalculatorCategory;
window.injectCrackingMechanismCategory = injectCrackingMechanismCategory;
window.injectStressMaterialDataCategory = injectStressMaterialDataCategory;
window.injectRPTUDashboardCategory = injectRPTUDashboardCategory;
window.injectCCDAIPlatformCategory = injectCCDAIPlatformCategory;
window.injectChemicalSuiteCategory = injectChemicalSuiteCategory;
window.injectStreamComparatorCategory = injectStreamComparatorCategory;
window.injectUnitConverterCategory = injectUnitConverterCategory;
window.injectToolsCategory = injectToolsCategory;

function injectAllCategories() {
  const categoryList = document.getElementById("categoryList");
  if (!categoryList) return;
  if (typeof window.injectAPI581Category === "function") window.injectAPI581Category();
  if (typeof window.injectAPI570Category === "function") window.injectAPI570Category();
  if (typeof window.injectDesignThicknessCalculatorCategory === "function") window.injectDesignThicknessCalculatorCategory();
  if (typeof window.injectProcessFlowDiagramsCategory === "function") window.injectProcessFlowDiagramsCategory();
  if (typeof window.injectCrackingMechanismCategory === "function") window.injectCrackingMechanismCategory();
  if (typeof window.injectStressMaterialDataCategory === "function") window.injectStressMaterialDataCategory();
  if (typeof window.injectRPTUDashboardCategory === "function") window.injectRPTUDashboardCategory();
  if (typeof window.injectCCDAIPlatformCategory === "function") window.injectCCDAIPlatformCategory();
  if (typeof window.injectChemicalSuiteCategory === "function") window.injectChemicalSuiteCategory();
  if (typeof window.injectStreamComparatorCategory === "function") window.injectStreamComparatorCategory();
  if (typeof window.injectUnitConverterCategory === "function") window.injectUnitConverterCategory();
  if (typeof window.injectToolsCategory === "function") window.injectToolsCategory();
}
window.injectAllCategories = injectAllCategories;

  // Pre-fetch damage mechanisms from secure backend API (idempotent / window scoped)
  window._damageMechanismsPromise = window._damageMechanismsPromise || (async () => {
    if (typeof window !== "undefined" && window.data && window.data["Damage Mechanism"] && Object.keys(window.data["Damage Mechanism"]).length > 0) {
      return window.data;
    }
    try {
      const res = await fetch("/api/damage-mechanisms");
      if (res.ok) {
        const json = await res.json();
        const mechs = json["Damage Mechanism"] || json.mechanisms || json;
        if (typeof window !== "undefined") {
          window.data = window.data || {};
          window.data["Damage Mechanism"] = mechs;
          window.damageMechanisms = Object.assign(window.damageMechanisms || {}, mechs);
          for (const [k, v] of Object.entries(mechs)) {
            if (v && v.code) window.damageMechanisms[String(v.code)] = v;
          }
        }
        return { "Damage Mechanism": mechs };
      }
    } catch (err) {
      console.warn("Could not load damage mechanisms from secure backend API:", err);
    }
    return window.data || { "Damage Mechanism": {} };
  })();

  window.addEventListener("DOMContentLoaded", async () => {  
    let mechData = (typeof window.data !== "undefined" && window.data && window.data["Damage Mechanism"] && Object.keys(window.data["Damage Mechanism"]).length > 0)
      ? window.data
      : await window._damageMechanismsPromise;
    if (mechData && typeof loadCategories === "function") {
      loadCategories(mechData);  
    }
    injectAllCategories();

    // Apply RBAC sidebar filtering immediately after category injection
    if (window.RBAC && typeof window.RBAC.applySidebarVisibility === "function") {
      window.RBAC.applySidebarVisibility();
    }

    // Apply custom Layout & Navigation Builder ordering & visibility
    if (window.adminPanel && typeof window.adminPanel.loadAndApplyPublishedLayoutConfig === "function") {
      window.adminPanel.loadAndApplyPublishedLayoutConfig();
    }
  });


// ✅ NEW FUNCTION (IMPORTANT)
function openB313FromSimple() {
  // Hide all tabs
  document.querySelectorAll(".tab-content").forEach(t => t.style.display = "none");

  // Show B31.3 tab
  const b313Tab = document.getElementById("ASMEB31_3Tab");
  if (b313Tab) b313Tab.style.display = "block";

  // Hide welcome panel & mechanism title
  const welcome = document.getElementById("welcomePanel");
  if (welcome) welcome.style.display = "none";
  const title = document.getElementById("selectedMechanismTitle");
  if (title) title.style.display = "none";

  // Transfer inputs from Simple Calculator if available
  const sP = document.getElementById("simple_pressure");
  const sPUnit = document.getElementById("simple_pressureUnit");
  const sS = document.getElementById("simple_stress");
  const sSUnit = document.getElementById("simple_stressUnit");
  const sD = document.getElementById("simple_diameter");
  const sE = document.getElementById("simple_efficiency");
  const sCA = document.getElementById("simple_corrosion");

  if (sP && sP.value && document.getElementById("b313_pressure")) {
    document.getElementById("b313_pressure").value = sP.value;
  }
  if (sPUnit && sPUnit.value && document.getElementById("b313_pressureUnit")) {
    document.getElementById("b313_pressureUnit").value = sPUnit.value;
  }
  if (sS && sS.value && document.getElementById("b313_stress")) {
    document.getElementById("b313_stress").value = sS.value;
  }
  if (sSUnit && sSUnit.value && document.getElementById("b313_stressUnit")) {
    document.getElementById("b313_stressUnit").value = sSUnit.value;
  }
  if (sD && sD.value && document.getElementById("b313_diameter")) {
    document.getElementById("b313_diameter").value = sD.value;
  }
  if (sE && sE.value && document.getElementById("b313_efficiency")) {
    document.getElementById("b313_efficiency").value = sE.value;
  }
  if (sCA && sCA.value && document.getElementById("b313_corrosion")) {
    document.getElementById("b313_corrosion").value = sCA.value;
  }

  if (typeof window.initB313 === "function") {
    window.initB313();
  }
}
window.openB313FromSimple = openB313FromSimple;
  
