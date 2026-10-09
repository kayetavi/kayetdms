
// ⚙️ TOP-RIGHT SETTINGS MENU TOGGLE
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

// ✅ USERNAME & WELCOME
const rawUsername = localStorage.getItem("usernameUpper") || localStorage.getItem("loggedInUser") || localStorage.getItem("userEmail") || localStorage.getItem("currentUser") || "";
const username = rawUsername ? (rawUsername.includes("@") ? rawUsername.split("@")[0].toUpperCase() : rawUsername.toUpperCase()) : "";
const welcomeDiv = document.getElementById("welcome");
const scrollText = document.getElementById("scrollText");

if (username) {
  if (welcomeDiv) welcomeDiv.innerHTML = `Welcome <span class="username-style">${username}</span>`;
  if (scrollText) scrollText.innerText = `Welcome ${username} to API 571 Damage Mechanism Dashboard & Industrial Digital Tools`;
} else {
  if (scrollText) scrollText.innerText = `Welcome to API 571 Damage Mechanism Dashboard & Industrial Digital Tools`;
}

// 🚪 LOGOUT FUNCTION
function logout() {
  localStorage.removeItem("loggedInUser");
  localStorage.removeItem("cached_rbac_permissions");
  localStorage.removeItem("dashboard_recent_tabs_v1");

  if (window.recentTabsManager && typeof window.recentTabsManager.clearOnLogout === "function") {
    try {
      window.recentTabsManager.clearOnLogout();
    } catch (e) {}
  }

  if (typeof window.performLogout === "function") {
    window.performLogout();
  } else {
    window.location.href = "index.html";
  }
}

// 🌙 DARK MODE HANDLER
const root = document.documentElement;

function applyTheme(theme) {
  const isDark = theme === "dark";
  if (isDark) {
    root.classList.remove("light-mode");
    root.classList.add("dark-mode");
    if (document.body) {
      document.body.classList.remove("light-mode");
      document.body.classList.add("dark-mode");
    }
  } else {
    root.classList.remove("dark-mode");
    root.classList.add("light-mode");
    if (document.body) {
      document.body.classList.remove("dark-mode");
      document.body.classList.add("light-mode");
    }
  }
  const admBtn = document.getElementById("admThemeToggleBtn");
  if (admBtn) {
    admBtn.innerHTML = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
    admBtn.title = isDark ? "Switch Admin Panel & Dashboard to Light Mode" : "Switch Admin Panel & Dashboard to Dark Mode";
  }
}

let currentMode = localStorage.getItem("theme");
// ✅ Default light mode for first-time login
if (!currentMode) {
  localStorage.setItem("theme", "light");
  currentMode = "light";
}

applyTheme(currentMode);

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    applyTheme(localStorage.getItem("theme") || "light");
  });
} else {
  applyTheme(currentMode);
}

function toggleDarkMode() {
  const isCurrentlyLight = root.classList.contains("light-mode");
  const newTheme = isCurrentlyLight ? "dark" : "light";
  localStorage.setItem("theme", newTheme);
  applyTheme(newTheme);

  // Notify any active charts or widgets
  window.dispatchEvent(new CustomEvent("themechange", { detail: { theme: newTheme } }));
  if (typeof updateChartTheme === "function") {
    try {
      updateChartTheme(newTheme);
    } catch (e) {}
  }
}


// 📱 Mobile Navigation Drawer Controls
let _dashboardSidebarLock = false;
let _dashboardLastSidebarToggle = 0;

function getMainSidebar() {
  return document.getElementById("mainSidebar") || document.querySelector(".sidebar");
}

function openMobileSidebar(e) {
  if (e && typeof e.preventDefault === "function") e.preventDefault();
  if (e && typeof e.stopPropagation === "function") e.stopPropagation();
  _dashboardLastSidebarToggle = Date.now();
  const sidebar = getMainSidebar();
  const backdrop = document.getElementById("sidebarBackdrop");
  if (sidebar) {
    sidebar.classList.add("mobile-open");
    sidebar.style.setProperty("transform", "translate3d(0, 0, 0)", "important");
    sidebar.style.setProperty("-webkit-transform", "translate3d(0, 0, 0)", "important");
    sidebar.style.setProperty("visibility", "visible", "important");
    sidebar.style.setProperty("opacity", "1", "important");
    sidebar.style.setProperty("pointer-events", "auto", "important");
  }
  if (backdrop) {
    backdrop.classList.add("visible");
    backdrop.style.setProperty("display", "block", "important");
    backdrop.style.setProperty("opacity", "1", "important");
    backdrop.style.setProperty("pointer-events", "auto", "important");
  }
  document.body.classList.add("sidebar-open");
}

function closeMobileSidebar(e) {
  if (e && typeof e.preventDefault === "function") e.preventDefault();
  if (e && typeof e.stopPropagation === "function") e.stopPropagation();
  _dashboardLastSidebarToggle = Date.now();
  const sidebar = getMainSidebar();
  const backdrop = document.getElementById("sidebarBackdrop");
  if (sidebar) {
    sidebar.classList.remove("mobile-open");
    sidebar.style.removeProperty("transform");
    sidebar.style.removeProperty("-webkit-transform");
    sidebar.style.removeProperty("visibility");
    sidebar.style.removeProperty("opacity");
    sidebar.style.removeProperty("pointer-events");
  }
  if (backdrop) {
    backdrop.classList.remove("visible");
    backdrop.style.removeProperty("display");
    backdrop.style.setProperty("opacity", "0", "important");
    backdrop.style.setProperty("pointer-events", "none", "important");
  }
  document.body.classList.remove("sidebar-open");
}

function toggleMobileSidebar(e) {
  if (e && typeof e.preventDefault === "function") e.preventDefault();
  if (e && typeof e.stopPropagation === "function") e.stopPropagation();
  const now = Date.now();
  if (now - _dashboardLastSidebarToggle < 300 || _dashboardSidebarLock) {
    return;
  }
  _dashboardLastSidebarToggle = now;
  _dashboardSidebarLock = true;
  setTimeout(() => { _dashboardSidebarLock = false; }, 320);

  const sidebar = getMainSidebar();
  if (!sidebar) return;
  if (sidebar.classList.contains("mobile-open")) {
    closeMobileSidebar();
  } else {
    openMobileSidebar();
  }
}

window.toggleMobileSidebar = toggleMobileSidebar;
window.openMobileSidebar = openMobileSidebar;
window.closeMobileSidebar = closeMobileSidebar;

window.goHome = function() {
  document.body.classList.remove("admin-mode-active", "non-admin-tool-mode", "tool-direct-view");
  document.body.classList.remove("adm-windowed-mode");
  const adminTab = document.getElementById("adminPanelTab");
  if (adminTab) adminTab.style.display = "none";

  if (typeof hideAllMainPanels === "function") hideAllMainPanels();

  if (typeof showWelcomePanel === "function") {
    showWelcomePanel();
  } else {
    const welcome = document.getElementById("welcomePanel");
    if (welcome) {
      welcome.classList.remove("is-hidden");
      welcome.style.removeProperty("display");
      welcome.style.display = "flex";
    }
  }

  document.querySelectorAll("#categoryList a").forEach(a => a.classList.remove("active-link"));
  if (window.recentTabsManager) {
    window.recentTabsManager.currentActiveTabId = null;
    window.recentTabsManager.render();
  }
  if (window.RBAC && typeof window.RBAC.applySidebarVisibility === "function") {
    window.RBAC.applySidebarVisibility();
  }
  if (typeof window.closeMobileSidebar === "function") {
    window.closeMobileSidebar();
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
};

function setupMobileSidebarEventListeners() {
  const toggleBtn = document.getElementById("mobileMenuToggleBtn");
  const headerToggleBtn = document.getElementById("headerHamburgerBtn");
  const fabBtn = document.getElementById("mobileFeaturesFab");
  const closeBtn = document.getElementById("closeSidebarBtn");
  const backdrop = document.getElementById("sidebarBackdrop");

  if (toggleBtn) {
    toggleBtn.onclick = (e) => toggleMobileSidebar(e);
  }
  if (headerToggleBtn) {
    headerToggleBtn.onclick = (e) => toggleMobileSidebar(e);
  }
  if (fabBtn) {
    fabBtn.onclick = (e) => toggleMobileSidebar(e);
  }
  if (closeBtn) {
    closeBtn.onclick = (e) => closeMobileSidebar(e);
  }
  if (backdrop) {
    backdrop.onclick = (e) => closeMobileSidebar(e);
  }

  // Auto-collapse sidebar ONLY when an actual executable CHILD tab is clicked
  const sidebar = document.getElementById("mainSidebar") || document.querySelector(".sidebar");
  if (sidebar) {
    sidebar.addEventListener("click", (e) => {
      // 1. If click originates on search box, filter buttons, or parent category/subcategory toggles, NEVER close sidebar!
      if (
        e.target.closest("#searchBox") ||
        e.target.closest(".category-inline-filter") ||
        e.target.closest(".category-filter-icon") ||
        e.target.closest(".category") ||
        e.target.closest(".subcategory") ||
        e.target.closest(".tool-arrow") ||
        e.target.closest(".sidebar-header") ||
        e.target.closest("[onclick*='toggleToolSubGroup']") ||
        e.target.closest("[onclick*='toggleCategory']")
      ) {
        return;
      }

      // 2. Look for child tab link (<a> tag)
      const targetLink = e.target.closest("a");
      if (targetLink) {
        // Double check it's not a category toggle itself
        if (targetLink.classList.contains("category") || targetLink.classList.contains("subcategory")) {
          return;
        }

        // Child tab is executing! Allow the tab's click handler/action to execute first, then collapse sidebar
        setTimeout(() => {
          if (typeof window.closeMobileSidebar === "function") {
            window.closeMobileSidebar();
          }
        }, 80);
      }
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupMobileSidebarEventListeners);
} else {
  setupMobileSidebarEventListeners();
}

// 📦 ELEMENTS
const categoryList = document.getElementById("categoryList");
const mechanismDetailsContainer = document.getElementById("mechanismDetailsContainer");
const selectedTitle = document.getElementById("selectedMechanismTitle");
const searchBox = document.getElementById("searchBox");

window.clearAllBlinkIntervals = function() {
  if (typeof window.clearMainBlinkIntervals === "function") window.clearMainBlinkIntervals();
  if (typeof window.clearCduvduBlinkIntervals === "function") window.clearCduvduBlinkIntervals();
  if (typeof window.clearMspBlinkIntervals === "function") window.clearMspBlinkIntervals();
  if (typeof window.clearH2uBlinkIntervals === "function") window.clearH2uBlinkIntervals();
};

// 🔒 Hide all main panels
function hideAllMainPanels() {
  window.hideAllMainPanels = hideAllMainPanels;
  document.body.classList.remove("admin-mode-active");
  document.body.classList.remove("adm-windowed-mode");
  document.querySelectorAll(".tab-content").forEach(t => t.style.display = "none");
  mechanismDetailsContainer.innerHTML = "";
  mechanismDetailsContainer.style.display = "none";
  selectedTitle.style.display = "none";

  // ⚡ CPU Optimization: Pause canvas simulation loops when navigating away
  if (window.InjectionMixingViz && typeof window.InjectionMixingViz.pause === "function") {
    window.InjectionMixingViz.pause();
  }
  if (window.PeriodicTable && typeof window.PeriodicTable.pauseBohrAnimation === "function") {
    window.PeriodicTable.pauseBohrAnimation();
  }

  // Clear any active SVG blinking intervals
  if (typeof window.clearAllBlinkIntervals === "function") {
    window.clearAllBlinkIntervals();
  }
}
// 🧼 HIDE WELCOME PANEL
function hideWelcomePanel() {
  const panel = document.getElementById("welcomePanel");
  if (panel) {
    panel.classList.add("is-hidden");
    panel.style.removeProperty("display");
    panel.style.setProperty("display", "none", "important");
    if (panel.classList.contains("is-fullscreen")) {
      panel.classList.remove("is-fullscreen");
      document.body.style.overflow = "";
      const expandIcon = panel.querySelector(".fs-icon-expand");
      const compressIcon = panel.querySelector(".fs-icon-compress");
      const btnText = panel.querySelector(".fs-btn-text");
      if (expandIcon) expandIcon.style.display = "inline-block";
      if (compressIcon) compressIcon.style.display = "none";
      if (btnText) btnText.textContent = "Full Screen";
    }
  }
}
window.hideWelcomePanel = hideWelcomePanel;

// 🌟 SHOW WELCOME PANEL
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

// ⛶ Toggle Welcome Panel Fullscreen
function toggleWelcomeFullscreen() {
  const panel = document.getElementById("welcomePanel");
  if (!panel) return;
  const isFs = panel.classList.toggle("is-fullscreen");
  const expandIcon = panel.querySelector(".fs-icon-expand");
  const compressIcon = panel.querySelector(".fs-icon-compress");
  const btnText = panel.querySelector(".fs-btn-text");

  if (isFs) {
    if (expandIcon) expandIcon.style.display = "none";
    if (compressIcon) compressIcon.style.display = "inline-block";
    if (btnText) btnText.textContent = "Exit Full Screen";
    document.body.style.overflow = "hidden";
  } else {
    if (expandIcon) expandIcon.style.display = "inline-block";
    if (compressIcon) compressIcon.style.display = "none";
    if (btnText) btnText.textContent = "Full Screen";
    document.body.style.overflow = "";
  }
}
window.toggleWelcomeFullscreen = toggleWelcomeFullscreen;

// Escape key listener to exit fullscreen
document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") {
    const panel = document.getElementById("welcomePanel");
    if (panel && panel.classList.contains("is-fullscreen")) {
      toggleWelcomeFullscreen();
    }
  }
});

// 🧭 Asset Integrity Tools Dashboard Interactions
function openDamageExplorerCard() {
  if (window.RBAC && !window.RBAC.isSuperAdmin && window.RBAC.role !== "admin" && !window.RBAC.hasModuleAccess("damageExplorer")) {
    if (typeof Swal !== "undefined") {
      Swal.fire({
        icon: "warning",
        title: "Access Restricted",
        text: "You do not have permission to access API 571 Damage Mechanisms. Please contact your administrator.",
        confirmButtonColor: "#2563eb"
      });
    } else {
      alert("Access Restricted: You do not have permission to access API 571 Damage Mechanisms.");
    }
    return;
  }
  if (typeof openMobileSidebar === "function") {
    openMobileSidebar();
  } else if (typeof window.openMobileSidebar === "function") {
    window.openMobileSidebar();
  }
  const catList = document.getElementById("categoryList");
  if (catList) {
    const firstCat = catList.querySelector(".category");
    if (firstCat) firstCat.click();
  }
}
window.openDamageExplorerCard = openDamageExplorerCard;

function updateDashboardCardCounts() {
  const cards = document.querySelectorAll("#dashCardsGrid .dash-card");
  let totalAllowed = 0;
  cards.forEach(card => {
    const isRbacHidden = card.getAttribute("data-rbac-hidden") === "true";
    if (!isRbacHidden) totalAllowed++;
  });
  const countBadge = document.getElementById("dashCardsTotalCount");
  if (countBadge) countBadge.textContent = totalAllowed;

  const emptyState = document.getElementById("dashCardsEmptyState");
  if (emptyState) {
    emptyState.style.display = totalAllowed === 0 ? "block" : "none";
  }
}
window.updateDashboardCardCounts = updateDashboardCardCounts;

function filterDashboardCards(query) {
  const q = String(query || "").toLowerCase().trim();
  const clearBtn = document.getElementById("dashSearchClearBtn");
  if (clearBtn) clearBtn.style.display = q ? "block" : "none";

  const cards = document.querySelectorAll("#dashCardsGrid .dash-card");
  let matchCount = 0;
  cards.forEach(card => {
    // If hidden by RBAC or not in sidebar, NEVER show!
    if (card.getAttribute("data-rbac-hidden") === "true") {
      card.style.setProperty("display", "none", "important");
      return;
    }
    const text = (card.textContent || "").toLowerCase();
    const matches = !q || text.includes(q);
    card.style.display = matches ? "flex" : "none";
    if (matches) matchCount++;
  });
}
window.filterDashboardCards = filterDashboardCards;

function clearDashboardSearch() {
  const input = document.getElementById("dashCardSearchInput");
  if (input) {
    input.value = "";
    filterDashboardCards("");
    input.focus();
  }
}
window.clearDashboardSearch = clearDashboardSearch;

function filterDashboardCategory(cat, btn) {
  document.querySelectorAll(".dash-cat-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");

  const cards = document.querySelectorAll("#dashCardsGrid .dash-card");
  cards.forEach(card => {
    // If hidden by RBAC or not in sidebar, NEVER show!
    if (card.getAttribute("data-rbac-hidden") === "true") {
      card.style.setProperty("display", "none", "important");
      return;
    }
    if (cat === "all") {
      card.style.display = "flex";
    } else {
      const cardCat = card.getAttribute("data-category");
      card.style.display = (cardCat === cat) ? "flex" : "none";
    }
  });

  const searchInput = document.getElementById("dashCardSearchInput");
  if (searchInput && searchInput.value) {
    filterDashboardCards(searchInput.value);
  }
}
window.filterDashboardCategory = filterDashboardCategory;

// ✅ Highlight only selected link
function setActiveLink(link) {
  document.querySelectorAll("#categoryList a").forEach(a => a.classList.remove("active-link"));
  if (link) link.classList.add("active-link");
}



function toPlainText(html) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html || "";
  return (tmp.textContent || tmp.innerText || "").toLowerCase();
}



// 🔄 Load API 571 Categories from data.js
function loadCategories(data) {
  const categoryList = document.getElementById("categoryList");
  if (!categoryList) return;

  // Remove only existing API 571 mechanism categories, preserving other injected module tabs
  const oldDamageCats = categoryList.querySelectorAll("li.category-toggle:not([id^='rbac_cat_'])");
  oldDamageCats.forEach(el => el.remove());

  const firstInjectedCat = categoryList.querySelector("li[id^='rbac_cat_']");

  Object.entries(data).forEach(([category, mechanisms]) => {
    const categoryItem = document.createElement("li");
    categoryItem.classList.add("category-toggle");
    categoryItem.setAttribute("data-rbac-module", "damageExplorer");

    const layoutCfg = window.layoutConfig || (window.adminPanel && window.adminPanel.layoutConfig);
    const isHidden = layoutCfg && typeof window.isModuleLayoutVisible === "function" && !window.isModuleLayoutVisible("damageExplorer", layoutCfg);
    const hasRbac = !window.RBAC || typeof window.RBAC.hasModuleAccess !== "function" || window.RBAC.isSuperAdmin || window.RBAC.role === "admin" || window.RBAC.hasModuleAccess("damageExplorer");
    if (isHidden || !hasRbac) {
      categoryItem.style.setProperty("display", "none", "important");
      categoryItem.setAttribute("data-rbac-hidden", "true");
    }

    const span = document.createElement("span");
    span.classList.add("category");
    span.innerHTML = `<span class="arrow" style="margin-right: 6px; font-size: 11px; display: inline-block;">▸</span><span class="category-title">${category}</span>`;
    categoryItem.appendChild(span);

    const mechList = document.createElement("ul");
    mechList.classList.add("mechanisms");
    mechList.style.display = "none"; // collapsed by default

    // If this is the specific category, inject a filter ICON that toggles the INPUT
    if (category === "Damage Mechanism") {
      // create the input (hidden by default)
      const inlineInput = document.createElement("input");
      inlineInput.type = "text";
      inlineInput.placeholder = "Filter";
      inlineInput.className = "category-inline-filter";
      inlineInput.style.cssText = [
        "margin-left:8px",
        "padding:4px 6px",
        "font-size:12px",
        "width:160px",
        "border-radius:4px",
        "border:1px solid #ccc",
        "vertical-align:middle",
        "box-sizing:border-box",
        "display:none" // start hidden
      ].join(";");

      // create a clickable icon (magnifier)
      const iconBtn = document.createElement("span");
      iconBtn.className = "category-filter-icon";
      iconBtn.setAttribute("role", "button");
      iconBtn.setAttribute("tabindex", "0");
      iconBtn.setAttribute("aria-label", "Toggle filter");
      iconBtn.setAttribute("aria-expanded", "false");
      iconBtn.style.cssText = [
        "margin-left:8px",
        "vertical-align:middle",
        "cursor:pointer",
        "display:inline-flex",
        "align-items:center",
        "justify-content:center",
        "width:20px",
        "height:20px",
        "box-sizing:content-box"
      ].join(";");

     iconBtn.innerHTML = `
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
    <path d="M3 5h18l-7 8v6l-4-2v-4L3 5z" fill="currentColor"/>
  </svg>`;


      // append icon and input to span so they appear inline after the title
      span.appendChild(iconBtn);
      span.appendChild(inlineInput);

      // smart aliases for common corrosion keywords
      const regexMap = {
        pitting: /\bpit(?:s|ting)?\b/i,
        "erosion-corrosion": /\berosion[-\s]?corrosion\b/i,
        localized: /\blocali[sz]ed\b/i,
        thinning: /\bthinn?ing\b/i
      };

      // input handler: filter only mechList items (case-insensitive)
      inlineInput.addEventListener("input", function () {
        const q = String(this.value || "").trim().toLowerCase();
        const items = Array.from(mechList.querySelectorAll("li"));

        const isSpecial = Object.keys(regexMap).some(k => q === k);
        const re = isSpecial ? regexMap[q] : null;

        let anyVisible = false;
        items.forEach(li => {
          const hay = (li.dataset.search || li.textContent).toLowerCase();
          const match = q === "" ? true : (isSpecial ? re.test(hay) : hay.includes(q));
          li.style.display = match ? "list-item" : "none";
          if (match) anyVisible = true;
        });

        // Expand category if user typed and there are matches; collapse if empty
        mechList.style.display = q === "" ? "none" : (anyVisible ? "block" : "none");
      });

      // prevent toggle when clicking in the input
      inlineInput.addEventListener("click", function (e) {
        e.stopPropagation();
      });

      // icon toggle behavior
      const toggleInput = (open) => {
        const willOpen = typeof open === "boolean" ? open : (inlineInput.style.display === "none");
        if (willOpen) {
          inlineInput.style.display = "inline-block";
          iconBtn.setAttribute("aria-expanded", "true");
          mechList.style.display = "block"; // ensure list visible for results
          setTimeout(() => inlineInput.focus(), 0);
        } else {
          inlineInput.value = "";
          inlineInput.dispatchEvent(new Event('input', { bubbles: true }));
          inlineInput.style.display = "none";
          iconBtn.setAttribute("aria-expanded", "false");
          mechList.style.display = "none";
        }
      };

      iconBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        toggleInput();
      });

      iconBtn.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          toggleInput();
        }
      });

      // optional: close filter when clicking outside (uncomment if you want this behavior)
      // document.addEventListener('click', (ev) => {
      //   if (inlineInput.style.display !== 'none' && !span.contains(ev.target)) toggleInput(false);
      // });
    }

    // build mechanism list (now with searchable dataset from ALL fields)
    Object.entries(mechanisms).forEach(([mech, info]) => {
      const mechItem = document.createElement("li");
      const link = document.createElement("a");
      link.href = "#";
      link.textContent = mech;

      // Build searchable blob from ALL fields (name + details)
      const searchableBlob = [
        mech,
        toPlainText(info.description),
        toPlainText(info.affectedMaterials),
        toPlainText(info.criticalFactors),
        toPlainText(info.affectedUnits),
        toPlainText(info.appearance),
        toPlainText(info.mitigation),
        toPlainText(info.inspection),
        toPlainText(info.temperatureComparison)
      ].join(" ");
      mechItem.dataset.search = searchableBlob;

// 📝 Rich Format Helper for Damage Mechanism Content (Bullet points, Numbers & Paragraphs)
function formatMechanismContent(content) {
  if (!content) return "";
  if (typeof content !== "string") return String(content);

  // If already contains rich HTML block elements, return as is
  if (/<(ul|ol|li|p|div|table|h[1-6]|blockquote)/i.test(content)) {
    return content;
  }

  const rawLines = content.split(/\r?\n/);
  let html = "";
  let inUl = false;
  let inOl = false;

  for (let i = 0; i < rawLines.length; i++) {
    let line = rawLines[i].trim();
    if (!line) {
      if (inUl) { html += "</ul>"; inUl = false; }
      if (inOl) { html += "</ol>"; inOl = false; }
      continue;
    }

    // Bold text support: **text** -> <strong>text</strong>
    line = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Bullet points: • or - or * or +
    const bulletMatch = line.match(/^([•\-\*\+])\s+(.+)$/);
    // Numbered list: 1. or 1) or 1 -
    const numberMatch = line.match(/^(\d+)[\.\)\-]\s+(.+)$/);

    if (bulletMatch) {
      if (inOl) { html += "</ol>"; inOl = false; }
      if (!inUl) { html += '<ul class="mechanism-list adm-bullet-list">'; inUl = true; }
      html += `<li>${bulletMatch[2]}</li>`;
    } else if (numberMatch) {
      if (inUl) { html += "</ul>"; inUl = false; }
      if (!inOl) { html += '<ol class="mechanism-list adm-numbered-list">'; inOl = true; }
      html += `<li>${numberMatch[2]}</li>`;
    } else {
      if (inUl) { html += "</ul>"; inUl = false; }
      if (inOl) { html += "</ol>"; inOl = false; }
      html += `<p class="adm-formatted-p">${line}</p>`;
    }
  }

  if (inUl) html += "</ul>";
  if (inOl) html += "</ol>";

  return html || content;
}
window.formatMechanismContent = formatMechanismContent;

      link.onclick = (e) => {
        e.preventDefault();
        hideAllMainPanels();
        hideWelcomePanel();
        mechanismDetailsContainer.style.display = "block";
        selectedTitle.textContent = mech;
        selectedTitle.style.display = "block";
        setActiveLink(link);

        // Fallback resolve if info is incomplete
        let dataObj = info;
        if (!dataObj || !dataObj.description) {
          if (window.damageMechanisms && window.damageMechanisms[mech]) {
            dataObj = window.damageMechanisms[mech];
          } else if (typeof window.getDamageMechanismByName === "function") {
            dataObj = window.getDamageMechanismByName(mech) || info;
          }
        }

        const fmt = window.formatMechanismContent || formatMechanismContent;

        const desc = fmt(dataObj.description || "No description provided for this damage mechanism.");
        const mats = fmt(dataObj.affectedMaterials || "No materials specified.");
        const factors = fmt(dataObj.criticalFactors || "No critical factors specified.");
        const units = fmt(dataObj.affectedUnits || "No affected units specified.");
        const app = fmt(dataObj.appearance || "No appearance information specified.");
        const mit = fmt(dataObj.mitigation || "No prevention/mitigation information specified.");
        const insp = fmt(dataObj.inspection || "No inspection guidelines specified.");
        const temp = fmt(dataObj.temperatureComparison || "No temperature comparison specified.");
        const img = dataObj.imagePath || "";

        mechanismDetailsContainer.innerHTML = `
    <div class="tabs">
      <button class="tab-button active" onclick="showTab('description')">Description</button>
      <button class="tab-button" onclick="showTab('materials')">Affected Materials</button>
      <button class="tab-button" onclick="showTab('factors')">Critical Factors</button>
      <button class="tab-button" onclick="showTab('units')">Affected Units</button>
      <button class="tab-button" onclick="showTab('appearance')">Morphology</button>
      <button class="tab-button" onclick="showTab('mitigation')">Prevention</button>
      <button class="tab-button" onclick="showTab('inspection')">Inspection</button>
      <button class="tab-button" onclick="showTab('temperature')">Temperature Comparison</button>
      <button class="tab-button" onclick="showTab('image')">Image</button>
    </div>

    <div id="description" class="tab-content visible mechanism-info" style="display: block !important;"><strong>Description:</strong><div class="mech-info-body">${desc}</div></div>
    <div id="materials" class="tab-content mechanism-info" style="display: none;"><strong>Materials:</strong><div class="mech-info-body">${mats}</div></div>
    <div id="factors" class="tab-content mechanism-info" style="display: none;"><strong>Factors:</strong><div class="mech-info-body">${factors}</div></div>
    <div id="units" class="tab-content mechanism-info" style="display: none;"><strong>Units:</strong><div class="mech-info-body">${units}</div></div>
    <div id="appearance" class="tab-content mechanism-info" style="display: none;"><strong>Morphology:</strong><div class="mech-info-body">${app}</div></div>
    <div id="mitigation" class="tab-content mechanism-info" style="display: none;"><strong>Mitigation:</strong><div class="mech-info-body">${mit}</div></div>
    <div id="inspection" class="tab-content mechanism-info" style="display: none;"><strong>Inspection:</strong><div class="mech-info-body">${insp}</div></div>
    <div id="temperature" class="tab-content mechanism-info" style="display: none;"><strong>Temperature:</strong><div class="mech-info-body">${temp}</div></div>
    <div id="image" class="tab-content mechanism-info" style="display: none;">
      <strong>Damage Mechanism Reference Image:</strong><br>
      ${ img ? `<img src="${img}" alt="Mechanism Image" style="max-width: 100%; height: auto; border: 1px solid #ccc; border-radius: 6px; margin-top: 8px;">` : "<p style='color: #888; font-style: italic; margin-top: 8px;'>No reference image available for this damage mechanism.</p>" }
    </div>
  `;
        if (typeof showTab === "function") showTab('description');
      };

      mechItem.appendChild(link);
      mechList.appendChild(mechItem);
    });

    // clicking the category toggles the mechList (icon/input stopPropagation prevents accidental toggles)
    span.addEventListener("click", function () {
      const isBlock = (mechList.style.display === "block");
      mechList.style.display = isBlock ? "none" : "block";
      const arrow = span.querySelector(".arrow");
      if (arrow) {
        arrow.textContent = isBlock ? "▸" : "▾";
      }
    });

    // append mechList inside categoryItem and then add to categoryList
    categoryItem.appendChild(mechList);
    if (firstInjectedCat) {
      categoryList.insertBefore(categoryItem, firstInjectedCat);
    } else {
      categoryList.appendChild(categoryItem);
    }
  });

  // Ensure all other module categories are injected
  if (typeof window.injectAllCategories === "function") {
    window.injectAllCategories();
  } else {
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

  // ✅ Apply layout configuration & RBAC sidebar visibility immediately
  if (window.RBAC && typeof window.RBAC.applySidebarVisibility === "function") {
    window.RBAC.applySidebarVisibility();
  }
  if (!window.layoutConfig) {
    try {
      const cachedLayout = localStorage.getItem("cached_layout_config");
      if (cachedLayout) window.layoutConfig = JSON.parse(cachedLayout);
    } catch (e) {}
  }
  const layoutCfgFinal = window.layoutConfig || (window.adminPanel && window.adminPanel.layoutConfig);
  if (layoutCfgFinal && window.adminPanel && typeof window.adminPanel.applyLayoutConfigToDashboard === "function") {
    window.adminPanel.applyLayoutConfigToDashboard(layoutCfgFinal);
  }

  // Ensure Tools Category Tab in Sidebar with granular RBAC permissions
  if (typeof window.injectToolsCategory === "function") {
    window.injectToolsCategory();
  }

  // Re-apply RBAC module visibility immediately after categories are built
  if (window.RBAC && typeof window.RBAC.applySidebarVisibility === "function") {
    window.RBAC.applySidebarVisibility();
  }
}
window.loadCategories = loadCategories;



// 🔍 SEARCH - FIXED CATEGORY DISPLAY
function handleDashboardSearch(queryVal) {
  const query = (queryVal || "").toLowerCase().trim();
  const categories = document.querySelectorAll("#categoryList .category-toggle");

  categories.forEach((cat) => {
    // If hidden by RBAC or no access to damageExplorer, never show
    if (cat.getAttribute("data-rbac-hidden") === "true" || (window.RBAC && !window.RBAC.isSuperAdmin && window.RBAC.role !== "admin" && !window.RBAC.hasModuleAccess("damageExplorer"))) {
      cat.style.display = "none";
      return;
    }

    const nextUL = cat.nextElementSibling || cat.querySelector("ul.mechanisms");
    if (!nextUL) return;
    const items = Array.from(nextUL.querySelectorAll("li"));
    let hasMatch = false;

    items.forEach(li => {
      const match = li.textContent.toLowerCase().includes(query);
      li.style.display = match ? "list-item" : "none";
      if (match) hasMatch = true;
    });

    if (query === "") {
      // Reset view
      cat.style.display = "";
      nextUL.style.display = "none";
      items.forEach(li => li.style.display = "");
    } else if (hasMatch) {
      // Show category only if it has visible matching children
      cat.style.display = "";
      nextUL.style.display = "block";
    } else {
      cat.style.display = "none";
      nextUL.style.display = "none";
    }
  });
}
window.handleDashboardSearch = handleDashboardSearch;

if (searchBox) {
  searchBox.addEventListener("input", function () {
    handleDashboardSearch(this.value);
  });
}

// Global input delegation fallback
document.addEventListener("input", function (e) {
  if (e.target && e.target.id === "searchBox") {
    handleDashboardSearch(e.target.value);
  }
});

// 📄 Export to PDF
function exportToPDF() {
  let element;
  let filename = "export.pdf"; // default name

  if (document.getElementById("mechanismDetailsContainer").style.display !== "none") {
    element = document.getElementById("mechanismDetailsContainer");
    filename = "damage-mechanism.pdf";
  } else if (document.getElementById("inspectionconfidenceTab").style.display !== "none") {
    element = document.getElementById("inspectionconfidenceTab");
    filename = "inspection-confidence.pdf";
  } else if (document.getElementById("crackingMechanismTab").style.display !== "none") {
    element = document.getElementById("crackingMechanismTab");
    filename = "cracking-mechanism.pdf";
  } else if (document.getElementById("bkStressTab").style.display !== "none") {
    element = document.getElementById("bkStressTab");
    filename = "bk-stress.pdf";
  } else if (document.getElementById("inventoryTab").style.display !== "none") {
    element = document.getElementById("inventoryTab");
    filename = "inventory.pdf";
  } else if (document.getElementById("ASMESECTIONVIIIDIV1Tab").style.display !== "none") {
    element = document.getElementById("ASMESECTIONVIIIDIV1Tab");
    filename = "ASME-VIII-DIV1.pdf";
  } else if (document.getElementById("TOXIC_CALCULATIONTab").style.display !== "none") {
    element = document.getElementById("TOXIC_CALCULATIONTab");
    filename = "toxic-calculation.pdf";
  } else if (document.getElementById("ASMEB31_3Tab").style.display !== "none") {
    element = document.getElementById("ASMEB31_3Tab");
    filename = "ASME-B31.3.pdf";
  } else {
    alert("No active tab to export!");
    return;
  }

  // Create wrapper with double border styling
  const wrapper = document.createElement("div");
  wrapper.style.padding = "20px";
  wrapper.style.border = "4px double #000";
  wrapper.style.borderRadius = "10px";
  wrapper.style.boxShadow = "0 0 10px rgba(0,0,0,0.2)";
  wrapper.style.backgroundColor = "#fff";
  wrapper.style.width = "100%";
  wrapper.style.boxSizing = "border-box";

  // Create header with logo on left and company name on right
  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.alignItems = "center";
  header.style.justifyContent = "space-between";
  header.style.marginBottom = "20px";

  const logo = document.createElement("img");
  logo.src = "image/pdflogo.png"; // <-- Replace with your logo path
  logo.style.height = "65px"; // adjust height
  logo.style.objectFit = "contain";

  const companyName = document.createElement("h2");
  companyName.textContent = "Damage Mechanism & Digital Tools"; // <-- Replace with your company name
  companyName.style.fontFamily = "Arial, sans-serif";
  companyName.style.fontSize = "24px";
  companyName.style.margin = "0";

  header.appendChild(logo);
  header.appendChild(companyName);

  wrapper.appendChild(header);

  // Add the content
  wrapper.appendChild(element.cloneNode(true));

  html2pdf().from(wrapper).set({
    margin: [10, 10, 10, 10],
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, scrollY: 0 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', putOnlyUsedFonts: true }
  }).save();
}


// 📅 Export Excel — automatically detects active tab------------------
function exportToExcel() {
  let element;

  if (document.getElementById("mechanismDetailsContainer").style.display !== "none") {
    element = document.getElementById("mechanismDetailsContainer");
  } else if (document.getElementById("ASMEB31_3Tab").style.display !== "none") {
    element = document.getElementById("ASMEB31_3Tab");
  } else {
    alert("No active tab to export!");
    return;
  }

  const data = element.innerText;
  const blob = new Blob([data], { type: "application/vnd.ms-excel" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = element.id === "mechanismDetailsContainer" ? "damage-mechanism.xls" : "ASME-B31.3.xls";
  link.click();
}








// 🧽 Tab Switching
function showTab(id) {
  document.querySelectorAll(".mechanism-info").forEach(div => {
    div.classList.remove("visible");
    div.style.setProperty("display", "none", "important");
  });
  const target = document.getElementById(id);
  if (target) {
    target.classList.add("visible");
    target.style.setProperty("display", "block", "important");
  }

  document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
  const activeBtn = document.querySelector(`.tab-button[onclick="showTab('${id}')"]`);
  if (activeBtn) activeBtn.classList.add("active");
}
window.showTab = showTab;



// ✅ CRITERIA FILTER — DAMAGE MECHANISM SUGGESTION
// ================================================================
// API 571 DAMAGE MECHANISM SCREENING CALCULATOR
// ================================================================


                


        

        
//===============================================================
//Corrosion Rate logic
//==============================================================

// Full Corrosion Tab Logic (Final + Fixed)
let dmSelectFull = document.getElementById("dmSelectFull");
let formContainerFull = document.getElementById("formContainerFull");
let calculateBtnFull = document.getElementById("calculateBtnFull");
let corrosionResultFull = document.getElementById("corrosionResultFull");

function syncCorrosionElements() {
  dmSelectFull = document.getElementById("dmSelectFull");
  formContainerFull = document.getElementById("formContainerFull");
  calculateBtnFull = document.getElementById("calculateBtnFull");
  corrosionResultFull = document.getElementById("corrosionResultFull");
}

let currentDM = "";

// 🔧 NEW FUNCTION: Auto re-calculate
function triggerAutoCalc() {
  syncCorrosionElements();
  if (calculateBtnFull) {
    calculateBtnFull.click();
  } else if (typeof handleCorrosionCalculate === "function") {
    handleCorrosionCalculate();
  }
}

// Global handler for CUI form limits
function updateCUIFormLimits() {
  triggerAutoCalc();
}
window.updateCUIFormLimits = updateCUIFormLimits;

// Handlers for criteria / corrosion tab compatibility
function loadCriteria() {
  syncCorrosionElements();
  const dmSelector = document.getElementById("dmSelector");
  if (!dmSelector) return;
  const val = dmSelector.value;
  if (dmSelectFull && val) {
    dmSelectFull.value = val;
    dmSelectFull.dispatchEvent(new Event("change"));
  }
}
window.loadCriteria = loadCriteria;

function calculateCorrosion() {
  syncCorrosionElements();
  if (calculateBtnFull) {
    calculateBtnFull.click();
  } else if (typeof handleCorrosionCalculate === "function") {
    handleCorrosionCalculate();
  }
}
window.calculateCorrosion = calculateCorrosion;

function syncDMSelector() {
  syncCorrosionElements();
  const dmSelector = document.getElementById("dmSelector");
  if (dmSelector && dmSelectFull && dmSelector.options && dmSelector.options.length <= 1) {
    dmSelector.innerHTML = dmSelectFull.innerHTML;
  }
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", syncDMSelector);
} else {
  syncDMSelector();
}

// Utility function to find closest value
function findClosestValue(dataArray, temp) {
  return dataArray.reduce((prev, curr) =>
    Math.abs(curr.temp - temp) < Math.abs(prev.temp - temp) ? curr : prev
  );
}

// Handle damage mechanism selection
function handleDMSelectChange() {
  syncCorrosionElements();
  if (!dmSelectFull || !formContainerFull) return;
  if (corrosionResultFull) corrosionResultFull.textContent = ""; // ✅ clear old result
  formContainerFull.innerHTML = ""; // Clear previous input
  currentDM = dmSelectFull.value;
  if (calculateBtnFull) calculateBtnFull.style.display = currentDM ? "inline-block" : "none";

    // ✅ CUI Mechanism Form
    if (currentDM === "cui") {
    formContainerFull.innerHTML = `
      <label>Material: 
        <select id="materialCUI" onchange="updateCUIFormLimits()">
        <option value="">-- Select Material --</option>
        <option value="cs">Carbon Steel / LAS / LTCS / SS 400 Series</option>
        <option value="ss300">SS 300 Series</option>
        <option value="duplex">Duplex</option>
      </select>
    </label>
    <label>Temperature (°C): <input type="number" id="tempCUI" /></label>
    <label>Is Insulated? 
      <select id="insulatedCUI"><option>Yes</option><option>No</option></select>
    </label>
    <label>Is Exposed to Moisture? 
      <select id="exposedCUI"><option>Yes</option><option>No</option></select>
    </label>
    <label>Severity: 
      <select id="severityCUI">
        <option>Severe</option>
        <option>Moderate</option>
        <option>Mild</option>
        <option>Dry</option>
      </select>
    </label>
  `;

  // Auto-trigger calculation when any input changes
  setTimeout(() => {
    document.getElementById("materialCUI")?.addEventListener("change", triggerAutoCalc);
    document.getElementById("tempCUI")?.addEventListener("input", triggerAutoCalc);
    document.getElementById("insulatedCUI")?.addEventListener("change", triggerAutoCalc);
    document.getElementById("exposedCUI")?.addEventListener("change", triggerAutoCalc);
    document.getElementById("severityCUI")?.addEventListener("change", triggerAutoCalc);
  }, 100);
}

    else if (currentDM === "co2") {
  formContainerFull.innerHTML = `
    <label>Material:
      <select id="materialCO2">
        <option value="">-- Select --</option>
        <option value="Carbon Steel"><13% Cr / Carbon Steel</option>
        <option value="Other">Other</option>
      </select>
    </label>
    <div id="step1CO2"></div>
  `;

  document.getElementById("materialCO2")?.addEventListener("change", (e) => {
    const val = e.target.value;
    const step1 = document.getElementById("step1CO2");
    step1.innerHTML = "";

    if (val === "Other") {
      step1.innerHTML = `<p>❌ No CO₂ corrosion for selected material.</p>`;
      return;
    }

    step1.innerHTML = `
      <label>Are liquid hydrocarbons present?
        <select id="liquidHC">
          <option value="">-- Select --</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </label>
      <div id="step2CO2"></div>
    `;

    document.getElementById("liquidHC")?.addEventListener("change", (e2) => {
      const val2 = e2.target.value;
      const step2 = document.getElementById("step2CO2");
      step2.innerHTML = "";

      if (val2 === "Yes") {
        step2.innerHTML = `
          <label>Water Content < 20%?
            <select id="waterContent">
              <option value="">-- Select --</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </label>
          <div id="step3CO2"></div>
        `;

        document.getElementById("waterContent")?.addEventListener("change", (e3) => {
          const val3 = e3.target.value;
          const step3 = document.getElementById("step3CO2");
          step3.innerHTML = "";

          if (val3 === "Yes") {
            step3.innerHTML = `
              <label>Fluid velocity > 1 m/s?
                <select id="velocityHigh">
                  <option value="">-- Select --</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </label>
              <div id="step4CO2"></div>
            `;

            document.getElementById("velocityHigh")?.addEventListener("change", (e4) => {
              const val4 = e4.target.value;
              const step4 = document.getElementById("step4CO2");
              step4.innerHTML = "";

              if (val4 === "Yes") {
                step4.innerHTML = `<p>✅ No CO₂ corrosion expected due to high velocity and low water.</p>`;
              } else {
                showDewPointStep(step4); // ✅ call external function
              }
            });
          } else {
            showDewPointStep(step3);
          }
        });
      } else {
        step2.innerHTML = `<p>⚠️ No hydrocarbons present — proceeding with dew point calculation.</p>`;
        showDewPointStep(step2);
      }
    });
  });
    }
   else if (currentDM === "sulfidation") {
  formContainerFull.innerHTML = `
    <label>Material:
      <select id="materialSulf" onchange="updateSulfidationDropdowns()">
        <option value="">-- Choose --</option>
        <option value="CS">Carbon Steel</option>
        <option value="SS">Austenitic SS without Mo</option>
      </select>
    </label>

    <label>Temperature (°C): <input type="number" id="tempSulf" /></label>

    <label>Sulfur Content (%):
      <select id="sulfurSulf"></select>
    </label>

    <label>TAN:
      <select id="tanSulf"></select>
    </label>

    <label>Velocity (m/s): <input type="number" id="velocitySulf" /></label>

    <button onclick="calculateSulfidation()">Calculate</button>
    <div id="corrosionResultFull"></div>
  `;

  updateSulfidationDropdowns(); // ✅ Call this AFTER HTML is loaded
}
   else if (currentDM === "Alkaline Sour Water Corrosion") {
    formContainerFull.innerHTML = `
      <label>NH₄HS Concentration (wt%):
        <select id="nh4hs">
          <option value="">-- Choose --</option>
          <option value="2">2</option>
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="15">15</option>
        </select>
      </label>
      <label>Velocity (m/s):
        <select id="velocity">
          <option value="">-- Choose --</option>
          <option value="3.05">3.05</option>
          <option value="4.57">4.57</option>
          <option value="6.10">6.10</option>
          <option value="7.62">7.62</option>
          <option value="9.14">9.14</option>
        </select>
      </label>
      <label>Is H₂S Partial Pressure Known? 
        <select id="pressureKnown">
          <option value="No">No</option>
          <option value="Yes">Yes</option>
        </select>
      </label>
      <div id="pressureInputContainer"></div>
    `;

    document.getElementById("pressureKnown")?.addEventListener("change", (e) => {
      const container = document.getElementById("pressureInputContainer");
      container.innerHTML = e.target.value === "Yes"
        ? `<label>H₂S Partial Pressure (kg/cm²): <input type="number" id="h2sPressure" /></label>`
        : "";
    });
  }
else if (currentDM === "Acid Sour Water Corrosion") {
  formContainerFull.innerHTML = `
    <label>Is H₂O Present?
      <select id="h2oPresentASW">
        <option value="">-- Select --</option>
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </select>
    </label>
    <div id="acidSourSteps"></div>
  `;

  document.getElementById("h2oPresentASW")?.addEventListener("change", () => {
    const h2o = document.getElementById("h2oPresentASW").value;
    const acidSourSteps = document.getElementById("acidSourSteps");
    acidSourSteps.innerHTML = "";

    if (h2o === "no") {
      acidSourSteps.innerHTML = `<p>✅ Estimated Corrosion Rate: 0 mm/y (No H₂O Present)</p>`;
      return;
    }

    acidSourSteps.innerHTML = `
      <label>pH (for routing decision):
        <select id="phStep">
          <option value="">-- Select --</option>
          <option value="4.75">4.75</option>
          <option value="5.25">5.25</option>
          <option value="5.75">5.75</option>
          <option value="6.25">6.25</option>
          <option value="6.75">6.75</option>
          <option value="7.25">> 7</option>
          <option value="4.25">< 4.5</option>
        </select>
      </label>
      <div id="acidSourRouting"></div>
    `;

    document.getElementById("phStep")?.addEventListener("change", () => {
      const ph = parseFloat(document.getElementById("phStep").value);
      const acidSourRouting = document.getElementById("acidSourRouting");
      acidSourRouting.innerHTML = "";

      if (ph > 7) {
        acidSourRouting.innerHTML = `<p>📌 Routing: Proceed to Section 2.B.8.7</p>`;
        return;
      }
      if (ph < 4.5) {
        acidSourRouting.innerHTML = `<p>📌 Routing: pH too low for this method.</p>`;
        return;
      }

      acidSourRouting.innerHTML = `
        <label>Are Chlorides Present?
          <select id="chloridesPresentASW">
            <option value="">-- Select --</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>
        <div id="acidSourNextStep"></div>
      `;

      document.getElementById("chloridesPresentASW")?.addEventListener("change", () => {
        const chlorides = document.getElementById("chloridesPresentASW").value;
        const nextStep = document.getElementById("acidSourNextStep");
        nextStep.innerHTML = "";

        if (chlorides === "yes") {
          nextStep.innerHTML = `<p>📌 Routing: Proceed to Section 2.B.2.1</p>`;
          return;
        }

        nextStep.innerHTML = `
          <label>Material of Construction:
            <select id="materialASW">
              <option value="">-- Select --</option>
              <option value="carbon">Carbon Steel</option>
              <option value="lowalloy">Low Alloy</option>
              <option value="other">Other</option>
            </select>
          </label>
          <div id="baseRateSectionASW"></div>
        `;

        document.getElementById("materialASW")?.addEventListener("change", () => {
          const mat = document.getElementById("materialASW").value;
          const baseSection = document.getElementById("baseRateSectionASW");
          baseSection.innerHTML = "";

          if (mat === "other") {
            baseSection.innerHTML = `<p>✅ Estimated Corrosion Rate: 0.05 mm/y (Default)</p>`;
            return;
          }

          if (mat === "carbon" || mat === "lowalloy") {
            baseSection.innerHTML = `
              <label>Temperature (°C):
                <select id="tempASW">
                  <option value="">-- Select --</option>
                  <option value="38">38</option>
                  <option value="52">52</option>
                  <option value="79">79</option>
                  <option value="93">93</option>
                </select>
              </label>
              <label>pH (from Table 2.B.10.2M):
                <select id="phFinalASW"><option value="">-- Select Temperature First --</option></select>
              </label>
              <label>Oxygen (ppb): <input type="number" id="oxygenASW" /></label>
              <label>Velocity (m/s): <input type="number" id="velocityASW" step="0.1" /></label>
              <div id="acidSourWaterOutput"></div>
            `;

            const phDropdown = document.getElementById("phFinalASW");
            const tempDropdown = document.getElementById("tempASW");

            tempDropdown?.addEventListener("change", () => {
              const temp = tempDropdown.value;
              if (phDropdown) {
                phDropdown.innerHTML = `<option value="">-- Select --</option>`;
                if (temp) {
                  ["4.75", "5.25", "5.75", "6.25", "6.75"].forEach(ph => {
                    phDropdown.innerHTML += `<option value="${ph}">${ph}</option>`;
                  });
                }
              }
            });
          }
        });
      });
    });
  });
}
    
  else if (currentDM === "oxidation") {
  formContainerFull.innerHTML = `
    <label>Material:
      <select id="materialOxidation">
        <option value="">-- Choose --</option>
        <option value="CS">CS</option>
        <option value="1.25Cr">1¼Cr</option>
        <option value="2.25Cr">2¼Cr</option>
        <option value="5Cr">5Cr</option>
        <option value="7Cr">7Cr</option>
        <option value="9Cr">9Cr</option>
        <option value="12Cr">12Cr</option>
        <option value="304 SS">304 SS</option>
        <option value="309 SS">309 SS</option>
        <option value="310 SS/HK">310 SS/HK</option>
        <option value="800 H/HP">800 H/HP</option>
      </select>
    </label>
    <label>Maximum Metal Temperature (°C): 
      <input type="number" id="tempOxidation" />
    </label>
  `;
  }
    // === HCl Corrosion Dynamic Form (as per flowchart) ===
else if (currentDM === "HCl Corrosion") {
  formContainerFull.innerHTML = `
    <label>Material:
      <select id="materialHCl">
        <option disabled selected>-- Select --</option>
        <option value="Carbon Steel">Carbon Steel</option>
        <option value="300 Series SS">300 Series SS</option>
        <option value="Alloy 20">Alloy 20</option>
        <option value="Alloy 825">Alloy 825</option>
        <option value="Alloy 625">Alloy 625</option>
        <option value="Alloy C-276">Alloy C-276</option>
        <option value="Alloy B-2">Alloy B-2</option>
        <option value="Alloy 400">Alloy 400</option>
      </select>
    </label>
    <div id="hclDynamicFields"></div>
  `;

  document.getElementById("materialHCl")?.addEventListener("change", (e) => {
    const selected = e.target.value;
    const dynamic = document.getElementById("hclDynamicFields");
    dynamic.innerHTML = "";

    if (selected === "Carbon Steel" || selected === "300 Series SS") {
      dynamic.innerHTML += `
        <label>Do you know the pH?
          <select id="knowPhHCl">
            <option disabled selected>-- Select --</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>
        <div id="phOrClField"></div>
        <div id="tempFieldHCl"></div>
      `;

      document.getElementById("knowPhHCl")?.addEventListener("change", (e2) => {
        const choice = e2.target.value;
        const container = document.getElementById("phOrClField");
        const tempField = document.getElementById("tempFieldHCl");
        container.innerHTML = "";
        tempField.innerHTML = "";

        if (choice === "yes") {
          container.innerHTML = `<label>pH: <input type="number" step="0.1" id="phHCl" /></label>`;
        } else {
          container.innerHTML = `<label>Cl⁻ Concentration (wppm): <input type="number" id="clwppmHCl" /></label>`;
        }
        tempField.innerHTML = `<label>Temperature (°C): <input type="number" id="tempHCl" /></label>`;
      });
    } else {
      // Common for all Alloys (Alloy 20, 825, 625, C-276, B-2, 400)
      dynamic.innerHTML += `
        <label>Cl⁻ Concentration (wt%): <select id="clHCl">
          <option value="0.5">0.50</option>
          <option value="0.75">0.75</option>
          <option value="1.0">1.00</option>
        </select></label>
        <label>Temperature (°C): <input type="number" id="tempHCl" /></label>
      `;

      if (["Alloy B-2", "Alloy 400"].includes(selected)) {
        dynamic.innerHTML += `
          <label>Oxidizing Conditions:
            <select id="oxidHCl">
              <option value="">-- Select --</option>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </label>
        `;
      }
    }
  });
}

  else if (currentDM === "H2SO4 Corrosion") {
    formContainerFull.innerHTML = `
      <label>Material:
        <select id="materialH2SO4">
          <option value="304 SS">304 SS</option>
        </select>
      </label>
      <label>Temperature (°C):
        <select id="tempH2SO4"></select>
      </label>
      <label>Acid Concentration (wt%):
        <select id="concH2SO4"></select>
      </label>
      <label>Velocity (m/s):
        <select id="velH2SO4"></select>
      </label>
    `;

    setupH2SO4Dropdowns("304 SS");

    document.getElementById("materialH2SO4")?.addEventListener("change", (e) => {
      setupH2SO4Dropdowns(e.target.value);
    });
  }
}
window.handleDMSelectChange = handleDMSelectChange;

if (dmSelectFull) {
  dmSelectFull.addEventListener("change", handleDMSelectChange);
}

// Setup dropdowns for H2SO4 corrosion (304 SS only for now)
function setupH2SO4Dropdowns(material = "304 SS") {
  const tempSelect = document.getElementById("tempH2SO4");
  const concSelect = document.getElementById("concH2SO4");
  const velSelect = document.getElementById("velH2SO4");

  tempSelect.innerHTML = "";
  concSelect.innerHTML = "";
  velSelect.innerHTML = "";

  if (material === "304 SS") {
    const temperatures = [30, 40, 60];
    const concentrations = [2, 3.5, 8, 15, 30, 50, 65, 75, 82, 87, 92.5, 98];
    const velocities = ["0.61", "1.83", "2.13"];

    temperatures.forEach(t => {
      tempSelect.innerHTML += `<option value="${t}">${t} °C</option>`;
    });
    concentrations.forEach(c => {
      concSelect.innerHTML += `<option value="${c}">${c} wt%</option>`;
    });
    velocities.forEach(v => {
      velSelect.innerHTML += `<option value="${v}">${v} m/s</option>`;
    });
  }
}

// ✅ Place this function OUTSIDE of any if/else blocks
function updateSulfidationDropdowns() {
  const matEl = document.getElementById("materialSulf");
  const sulfurSelect = document.getElementById("sulfurSulf");
  const tanSelect = document.getElementById("tanSulf");

  if (!sulfurSelect || !tanSelect) return;

  const material = matEl ? matEl.value : "";
  sulfurSelect.innerHTML = "";
  tanSelect.innerHTML = "";

  if (!material) {
    sulfurSelect.innerHTML = "<option value=''>-- Select Material First --</option>";
    tanSelect.innerHTML = "<option value=''>-- Select Material First --</option>";
    return;
  }

  const csSulfurOptions = [0.2, 0.4, 0.6, 1.5, 2.5, 3.0];
  const csTanOptions = [0.3, 0.65, 1.5, 3.0, 4.0];

  const ssSulfurOptions = [0.2, 0.4, 0.8];
  const ssTanOptions = [1.0, 1.5, 3.0, 4.0];

  let sulfurOptions = [];
  let tanOptions = [];

  if (material === "CS") {
    sulfurOptions = csSulfurOptions;
    tanOptions = csTanOptions;
  } else if (material === "SS") {
    sulfurOptions = ssSulfurOptions;
    tanOptions = ssTanOptions;
  }

  sulfurSelect.innerHTML = "<option value=''>-- Select Sulfur % --</option>";
  tanSelect.innerHTML = "<option value=''>-- Select TAN --</option>";

  sulfurOptions.forEach(value => {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = value;
    sulfurSelect.appendChild(opt);
  });

  tanOptions.forEach(value => {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = value;
    tanSelect.appendChild(opt);
  });
}
window.updateSulfidationDropdowns = updateSulfidationDropdowns;

function calculateSulfidation() {
  syncCorrosionElements();
  if (calculateBtnFull) {
    calculateBtnFull.click();
  } else if (typeof handleCorrosionCalculate === "function") {
    handleCorrosionCalculate();
  }
}
window.calculateSulfidation = calculateSulfidation;


// 📌 Backend-driven Calculate Button Logic
async function handleCorrosionCalculate() {
  syncCorrosionElements();
  if (!corrosionResultFull) return;
  corrosionResultFull.innerHTML = `<span style="color:#64748b;">⏳ Computing corrosion rate on server...</span>`;

  try {
    let payload = { mechanism: currentDM };

    if (currentDM === "cui") {
      const material = document.getElementById("materialCUI")?.value;
      const temp = parseFloat(document.getElementById("tempCUI")?.value);
      const insulated = document.getElementById("insulatedCUI")?.value;
      const exposed = document.getElementById("exposedCUI")?.value;
      const severity = document.getElementById("severityCUI")?.value;

      if (!material || isNaN(temp) || !insulated || !exposed || !severity) {
        corrosionResultFull.textContent = "❌ Please fill all fields correctly.";
        return;
      }
      payload = { mechanism: "cui", material, temp, insulated, exposed, severity };
    }
    else if (currentDM === "Acid Sour Water Corrosion") {
      const temp = document.getElementById("tempASW")?.value;
      const ph = document.getElementById("phFinalASW")?.value;
      const oxygen = parseFloat(document.getElementById("oxygenASW")?.value);
      const velocity = parseFloat(document.getElementById("velocityASW")?.value);

      if (!temp || !ph || isNaN(oxygen) || isNaN(velocity)) {
        corrosionResultFull.innerHTML = "❌ Please fill all required fields correctly for Acid Sour Water.";
        return;
      }
      payload = { mechanism: "Acid Sour Water Corrosion", tempASW: temp, phFinalASW: ph, oxygenASW: oxygen, velocityASW: velocity };
    }
    else if (currentDM === "sulfidation") {
      const temp = parseFloat(document.getElementById("tempSulf")?.value);
      const sulfur = parseFloat(document.getElementById("sulfurSulf")?.value);
      const tan = parseFloat(document.getElementById("tanSulf")?.value);
      const material = document.getElementById("materialSulf")?.value || "CS";

      if (isNaN(temp) || isNaN(sulfur) || isNaN(tan)) {
        corrosionResultFull.textContent = "❌ Please fill all fields correctly.";
        return;
      }
      payload = { mechanism: "sulfidation", tempSulf: temp, sulfurSulf: sulfur, tanSulf: tan, materialSulf: material };
    }
    else if (currentDM === "oxidation") {
      const material = document.getElementById("materialOxidation")?.value;
      const temp = parseFloat(document.getElementById("tempOxidation")?.value);

      if (!material || isNaN(temp)) {
        corrosionResultFull.textContent = "❌ Please select material and enter valid temperature.";
        return;
      }
      payload = { mechanism: "oxidation", materialOxidation: material, tempOxidation: temp };
    }
    else if (currentDM === "HCl Corrosion") {
      const material = document.getElementById("materialHCl")?.value;
      const temp = parseFloat(document.getElementById("tempHCl")?.value);

      if (!material || isNaN(temp)) {
        corrosionResultFull.textContent = "❌ Please enter material and temperature.";
        return;
      }

      payload = { mechanism: "HCl Corrosion", materialHCl: material, tempHCl: temp };

      if (["Carbon Steel", "300 Series SS"].includes(material)) {
        const knowsPh = document.getElementById("knowPhHCl")?.value;
        if (!knowsPh) {
          corrosionResultFull.textContent = "❌ Please select whether you know the pH.";
          return;
        }
        if (knowsPh === "yes") {
          const ph = parseFloat(document.getElementById("phHCl")?.value);
          if (isNaN(ph)) {
            corrosionResultFull.textContent = "❌ Please enter valid pH value.";
            return;
          }
          payload.phHCl = ph;
        } else {
          const clppm = parseFloat(document.getElementById("clwppmHCl")?.value);
          if (isNaN(clppm)) {
            corrosionResultFull.textContent = "❌ Please enter valid Cl⁻ concentration in ppm.";
            return;
          }
          payload.clwppmHCl = clppm;
        }
      } else {
        const cl = parseFloat(document.getElementById("clHCl")?.value);
        if (isNaN(cl)) {
          corrosionResultFull.textContent = "❌ Please enter valid Cl⁻ concentration.";
          return;
        }
        payload.clHCl = cl;

        if (["Alloy B-2", "Alloy 400"].includes(material)) {
          const oxid = document.getElementById("oxidHCl")?.value;
          if (!oxid) {
            corrosionResultFull.textContent = "❌ Please select oxidizing condition.";
            return;
          }
          payload.oxidHCl = oxid;
        }
      }
    }
    else if (currentDM === "H2SO4 Corrosion") {
      const material = document.getElementById("materialH2SO4")?.value;
      const temp = parseInt(document.getElementById("tempH2SO4")?.value, 10);
      const conc = parseFloat(document.getElementById("concH2SO4")?.value);
      const velocityRange = document.getElementById("velH2SO4")?.value;

      if (!material || isNaN(temp) || isNaN(conc) || !velocityRange) {
        corrosionResultFull.textContent = "❌ Please fill all H₂SO₄ corrosion fields.";
        return;
      }
      payload = { mechanism: "H2SO4 Corrosion", materialH2SO4: material, tempH2SO4: temp, concH2SO4: conc, velH2SO4: velocityRange };
    }
    else if (currentDM === "Alkaline Sour Water Corrosion") {
      const nh4hs = parseFloat(document.getElementById("nh4hs")?.value);
      const velocity = parseFloat(document.getElementById("velocity")?.value);
      const pressureKnown = document.getElementById("pressureKnown")?.value;
      const h2sPressureInput = document.getElementById("h2sPressure");

      if (isNaN(nh4hs) || isNaN(velocity)) {
        corrosionResultFull.textContent = "❌ Please fill NH₄HS and Velocity correctly.";
        return;
      }

      payload = { mechanism: "Alkaline Sour Water Corrosion", nh4hs, velocity, pressureKnown };

      if (pressureKnown === "Yes") {
        const h2sPressure = parseFloat(h2sPressureInput?.value);
        if (isNaN(h2sPressure)) {
          corrosionResultFull.textContent = "❌ Please enter valid H₂S pressure.";
          return;
        }
        payload.h2sPressure = h2sPressure;
      }
    } else {
      corrosionResultFull.textContent = "❌ Please select a valid damage mechanism.";
      return;
    }

    const response = await fetch("/api/corrosion-rate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      corrosionResultFull.innerHTML = `❌ ${data.message || "Calculation failed."}`;
      return;
    }

    if (data.rate !== null && data.rate !== undefined) {
      corrosionResultFull.innerHTML = `✅ ${data.message}`;
      if (data.chartData && typeof drawChart === "function") {
        drawChart(data.chartData.rates, data.chartData.labels);
      }
    } else {
      corrosionResultFull.innerHTML = `⚠️ ${data.message}`;
    }
  } catch (err) {
    console.error("Corrosion calculation error:", err);
    if (corrosionResultFull) {
      corrosionResultFull.textContent = "⚠️ Error: " + (err.message || String(err));
    }
  }
}
window.handleCorrosionCalculate = handleCorrosionCalculate;

function initCorrosionFullTab() {
  syncCorrosionElements();
  if (dmSelectFull && !dmSelectFull._bound) {
    dmSelectFull._bound = true;
    dmSelectFull.addEventListener("change", handleDMSelectChange);
  }
  if (calculateBtnFull && !calculateBtnFull._bound) {
    calculateBtnFull._bound = true;
    calculateBtnFull.addEventListener("click", handleCorrosionCalculate);
  }
  syncDMSelector();
}
window.initCorrosionFullTab = initCorrosionFullTab;

if (calculateBtnFull) {
  calculateBtnFull.addEventListener("click", handleCorrosionCalculate);
}

// Global click delegation fallback for calculateBtnFull
document.addEventListener("click", (e) => {
  if (e.target && (e.target.id === "calculateBtnFull" || e.target.closest("#calculateBtnFull"))) {
    handleCorrosionCalculate();
  }
});

// ✅ CO₂ Helper Functions (Backend-Driven)
function showDewPointStep(container) {
  container.innerHTML = `
    <div class="section">
      <label>Total Pressure (bar): <input type="number" id="totalPressure" /></label>
      <button onclick="calculateDewPointCO2()">Calculate Dew Point (Eq 2.B.25)</button>
      <div id="dewPointResultCO2"></div>
      <div id="tempCheckCO2"></div>
    </div>
  `;
}

async function calculateDewPointCO2() {
  const P = parseFloat(document.getElementById("totalPressure")?.value);
  if (isNaN(P)) {
    alert("Please enter a valid total pressure.");
    return;
  }
  try {
    const res = await fetch("/api/corrosion-rate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mechanism: "co2", action: "dew_point", totalPressure: P })
    });
    const data = await res.json();
    if (data.success) {
      const dew = data.dewPoint;
      document.getElementById("dewPointResultCO2").innerHTML = `<p>Dew Point Temp = <b>${dew.toFixed(2)} °C</b></p>`;
      document.getElementById("tempCheckCO2").innerHTML = `
        <label>Current Temperature (°C): <input type="number" id="tempCO2" /></label>
        <button onclick="checkTempAgainstDew(${dew.toFixed(4)})">Proceed</button>
        <div id="corrosionRateCO2"></div>
      `;
    } else {
      alert(data.message || "Failed to calculate dew point");
    }
  } catch (e) {
    alert("Error calculating dew point: " + e.message);
  }
}

function checkTempAgainstDew(dew) {
  const temp = parseFloat(document.getElementById("tempCO2")?.value);
  const container = document.getElementById("corrosionRateCO2");
  container.innerHTML = "";
  if (isNaN(temp)) {
    alert("Please enter current temperature.");
    return;
  }

  if (temp > dew) {
    container.innerHTML = `<p>⚠️ No CO₂ corrosion — Temp (${temp}°C) > Dew Point (${dew.toFixed(2)}°C).</p>`;
    return;
  }

  container.innerHTML = `
    <label>Temperature (°C): <input type="number" id="tempCO2" /></label>
    <label>pH: <input type="number" step="0.1" id="phCO2" /></label>
    <label>CO₂ Partial Pressure (bar): <input type="number" step="0.01" id="pco2CO2" /></label>
    <label>Shear Stress (Pa): <input type="number" id="shearCO2" /></label>
    <button onclick="calculateBaseCO2Rate(${dew.toFixed(4)})">Calculate Base Corrosion Rate (Eq 2.B.26)</button>
    <div id="baseCO2Result"></div>
  `;
}

async function calculateBaseCO2Rate(dew) {
  const temp = parseFloat(document.getElementById("tempCO2")?.value);
  const ph = parseFloat(document.getElementById("phCO2")?.value);
  const pco2 = parseFloat(document.getElementById("pco2CO2")?.value);
  const shear = parseFloat(document.getElementById("shearCO2")?.value);

  const container = document.getElementById("baseCO2Result");

  if ([temp, ph, pco2, shear].some(v => isNaN(v))) {
    container.innerHTML = "❌ Please fill all required fields.";
    return;
  }

  try {
    const res = await fetch("/api/corrosion-rate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mechanism: "co2", tempCO2: temp, phCO2: ph, pco2CO2: pco2, shearCO2: shear, dewPoint: dew })
    });
    const data = await res.json();

    if (!data.success) {
      container.innerHTML = `❌ ${data.message}`;
      return;
    }

    if (data.applicable === false) {
      container.innerHTML = `<p>⚠️ ${data.message}</p>`;
      return;
    }

    const baseRate = data.baseRate;
    container.innerHTML = `
      <p>Base Corrosion Rate = <b>${baseRate.toFixed(3)} mm/year</b></p>
      <label>Is there glycol or inhibitor?
        <select id="hasGlycolOrInhibitor">
          <option value="">-- Select --</option>
          <option value="No">No</option>
          <option value="Yes">Yes</option>
        </select>
      </label>
      <div id="adjustmentCO2Area"></div>
    `;

    document.getElementById("hasGlycolOrInhibitor")?.addEventListener("change", (e) => {
      const value = e.target.value;
      const adjustDiv = document.getElementById("adjustmentCO2Area");
      adjustDiv.innerHTML = "";

      if (value === "No") {
        adjustDiv.innerHTML = `<p>✅ Final Corrosion Rate = <b>${baseRate.toFixed(3)} mm/year</b> (No mitigation applied)</p>`;
        if (typeof drawChart === "function") {
          drawChart([baseRate.toFixed(3)], ["Base Rate"]);
        }
      } else if (value === "Yes") {
        adjustDiv.innerHTML = `
          <label>% Glycol: <input type="number" id="glycolCO2" value="0" /></label>
          <label>Inhibitor Factor (0–1): <input type="number" step="0.01" id="inhibitorCO2" value="1" /></label>
          <button onclick="calculateFinalCO2RateFromMitigation(${baseRate.toFixed(5)}, ${dew.toFixed(5)})">Calculate Final Corrosion Rate</button>
          <div id="corrosionResultFull"></div>
        `;
      }
    });
  } catch (err) {
    container.innerHTML = `⚠️ Error: ${err.message}`;
  }
}

async function calculateFinalCO2RateFromMitigation(baseRate, dew) {
  const glycol = parseFloat(document.getElementById("glycolCO2")?.value);
  const inhibitor = parseFloat(document.getElementById("inhibitorCO2")?.value);
  const temp = parseFloat(document.getElementById("tempCO2")?.value);
  const ph = parseFloat(document.getElementById("phCO2")?.value);
  const pco2 = parseFloat(document.getElementById("pco2CO2")?.value);
  const shear = parseFloat(document.getElementById("shearCO2")?.value);
  const corrosionResult = document.getElementById("corrosionResultFull");

  if ([glycol, inhibitor].some(v => isNaN(v))) {
    corrosionResult.innerHTML = "❌ Fill all mitigation values.";
    return;
  }

  try {
    const res = await fetch("/api/corrosion-rate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mechanism: "co2",
        tempCO2: temp,
        phCO2: ph,
        pco2CO2: pco2,
        shearCO2: shear,
        dewPoint: dew,
        hasGlycolOrInhibitor: "Yes",
        glycol,
        inhibitor
      })
    });
    const data = await res.json();
    if (data.success) {
      corrosionResult.innerHTML = `
        <p>Dew Point Temp = <b>${dew.toFixed(2)} °C</b></p>
        <p>Base Corrosion Rate = <b>${data.baseRate.toFixed(3)} mm/year</b></p>
        <p>Final Adjusted Rate (Eq 2.B.23) = <b>${data.finalRate.toFixed(3)} mm/year</b></p>
      `;
      if (data.chartData && typeof drawChart === "function") {
        drawChart(data.chartData.rates, data.chartData.labels);
      }
    } else {
      corrosionResult.innerHTML = `❌ ${data.message}`;
    }
  } catch (err) {
    corrosionResult.innerHTML = `⚠️ Error: ${err.message}`;
  }
}


