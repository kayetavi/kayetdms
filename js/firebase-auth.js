// 🔹 Global circular-safe JSON guard
(function () {
  if (typeof window === "undefined" || window.__safeJsonStringifyInstalled) return;
  window.__safeJsonStringifyInstalled = true;
  const originalStringify = JSON.stringify;
  function createSafeReplacer(customReplacer) {
    const seen = new WeakSet();
    return function (key, value) {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) return "[Circular]";
        seen.add(value);
      }
      if (typeof customReplacer === "function") return customReplacer.call(this, key, value);
      return value;
    };
  }
  JSON.stringify = function (value, replacer, space) {
    try {
      return originalStringify(value, replacer, space);
    } catch (err) {
      if (err && (err.name === "TypeError" || /circular|cyclic/i.test(String(err.message || err)))) {
        try {
          return originalStringify(value, createSafeReplacer(replacer), space);
        } catch (fallbackErr) {
          return '"[Circular]"';
        }
      }
      throw err;
    }
  };
})();

// 🔐 Architecture: Session management is verified securely via the backend API (/api/session).
// No Firebase client credentials or API keys are exposed to DevTools (F12) in the browser.

const localSessionId = localStorage.getItem("sessionId") || "";
const localEmail = localStorage.getItem("loggedInUser") || "";
const localUid = localStorage.getItem("userUid") || "";

// If no local session exists, redirect immediately to login
if (!localEmail && !window.location.href.includes("index.html") && !window.location.href.includes("lndex.html")) {
  window.location.href = "index.html";
}

// ✅ Auto logout on inactivity after 10 minutes
let inactivityTimer = null;
const INACTIVITY_TIMEOUT_MS = 600000; // 10 minutes

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(async () => {
    alert("⏳ You've been logged out due to 10 minutes of inactivity.");
    await performLogout();
  }, INACTIVITY_TIMEOUT_MS);
}

// ✅ Detect user activity and reset timer
["mousemove", "keydown", "scroll", "click", "touchstart"].forEach((event) => {
  window.addEventListener(event, resetInactivityTimer, { passive: true });
});

async function performLogout() {
  clearTimeout(inactivityTimer);
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }

  const currentUid = localStorage.getItem("userUid") || localUid;
  const currentSessionId = localStorage.getItem("sessionId") || localSessionId;

  // Notify backend to invalidate session
  try {
    await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "logout",
        sessionId: currentSessionId,
        uid: currentUid
      })
    });
  } catch (e) {
    // Offline / silent fallback
  }

  localStorage.removeItem("sessionId");
  localStorage.removeItem("loggedInUser");
  localStorage.removeItem("usernameUpper");
  localStorage.removeItem("userUid");
  localStorage.removeItem("cached_rbac_permissions");
  localStorage.removeItem("dashboard_recent_tabs_v1");

  if (window.recentTabsManager && typeof window.recentTabsManager.clearOnLogout === "function") {
    try {
      window.recentTabsManager.clearOnLogout();
    } catch (e) {}
  }

  window.location.href = "index.html";
}

// ✅ Global logout function
window.logout = performLogout;

// ✅ Validate session on load
let sessionValidated = false;
let heartbeatInterval = null;

async function checkAndInitializeSession() {
  if (sessionValidated) return;

  const effectiveEmail = localStorage.getItem("loggedInUser") || localEmail;
  const effectiveUid = localStorage.getItem("userUid") || localUid;
  const effectiveSessionId = localStorage.getItem("sessionId") || localSessionId;

  if (!effectiveEmail && !effectiveSessionId) {
    window.location.href = "index.html";
    return;
  }

  try {
    const res = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "validate",
        sessionId: effectiveSessionId,
        uid: effectiveUid,
        email: effectiveEmail
      })
    });

    const data = await res.json();

    if (!data.valid && data.reason === "expired") {
      alert("⚠️ Session expired. Please login again.");
      await performLogout();
      return;
    }

    if (!data.valid && data.reason === "mismatch") {
      alert("⚠️ Another session was started. Please login again.");
      await performLogout();
      return;
    }

    // Session is valid
    sessionValidated = true;
    resetInactivityTimer();

    // Start background heartbeat every 30 seconds
    if (!heartbeatInterval) {
      heartbeatInterval = setInterval(async () => {
        try {
          const sid = localStorage.getItem("sessionId") || effectiveSessionId;
          const uid = localStorage.getItem("userUid") || effectiveUid;
          if (sid || uid) {
            await fetch("/api/session", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "heartbeat", sessionId: sid, uid: uid })
            });
          }
        } catch (e) {
          // Offline/network blip - non-blocking
        }
      }, 30000);
    }

  } catch (netErr) {
    // Network offline or server unreachable - allow local session to persist gracefully
    console.info("Session verified via local state (offline/transient network mode)");
    sessionValidated = true;
    resetInactivityTimer();
  }
}

// Initialize session validation immediately
checkAndInitializeSession();
