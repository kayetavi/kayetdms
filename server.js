import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Automatically load local .env variables into process.env if present
try {
  const envPath = path.resolve(__dirname, ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const k = trimmed.slice(0, eqIdx).trim();
        const v = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
        if (k && !process.env[k]) {
          process.env[k] = v;
        }
      }
    }
  }
} catch (e) {
  console.warn("Could not load .env file:", e.message);
}
import calculateInventoryHandler from "./api/calculateInventory.js";
import chatbotHandler from "./api/chatbot.js";
import formulasHandler from "./api/formulas.js";
import geminiHandler from "./api/gemini.js";
import geminiStreamHandler from "./api/gemini-stream.js";
import getAnalysesHandler from "./api/get-analyses.js";
import loginHandler from "./api/login.js";
import sessionHandler from "./api/session.js";
import rbacHandler from "./api/rbac.js";
import adminHandler from "./api/admin.js";
import sendEmailHandler from "./api/send-email.js";
import viiidivHandler from "./api/viiidiv.js";
import b313Handler from "./api/b313.js";
import simpleHandler from "./api/simple.js";
import toxicHandler from "./api/toxic.js";
import representativeFluidsHandler from "./api/representative-fluids.js";
import corrosionRateHandler from "./api/corrosion-rate.js";
import llmHandler from "./api/llm.js";
import databaseHandler from "./api/database.js";
import damageMechanismsHandler from "./api/damage-mechanisms.js";
import remainingHandler from "./api/remaining.js";
import pipeDimensionsHandler from "./api/pipe-dimensions.js";
import damageCriteriaHandler from "./api/damage-criteria.js";
import forgotPasswordHandler from "./api/forgot-password.js";
import parseStreamDocumentHandler from "./api/parse-stream-document.js";
import streamDatasetsHandler from "./api/stream-datasets.js";
import documentsHandler from "./api/documents.js";
import structuralThicknessHandler from "./api/structural-thickness.js";
import riskCalculatorHandler from "./api/risk-calculator.js";
import { validateApiRequest, rateLimiter } from "./api/utils/validation.js";

const app = express();
const PORT = 3000;

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "0");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Content-Security-Policy", "default-src 'self' https: data: blob: 'unsafe-inline' 'unsafe-eval'");
  next();
});

// Rate limiters for sensitive endpoints
const authRateLimiter = rateLimiter({ windowMs: 60000, max: 20 });
const sessionRateLimiter = rateLimiter({ windowMs: 60000, max: 60 });

// Enable CORS for all incoming requests (crucial for iframe preview, cross-origin, and fetch clients)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Range");
  res.header("Access-Control-Expose-Headers", "Content-Length, Content-Range");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "KayetDMS" });
});

// Safe async route wrapper to prevent uncaught promise drops and socket resets
const safeAsync = (fn) => (req, res, next) => {
  if (!validateApiRequest(req)) {
    return res.status(400).json({
      success: false,
      error: "Bad Request: Invalid or malformed request payload/parameters."
    });
  }
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.error(`[API Guard] Error handling ${req.method} ${req.path}:`, err?.message || err);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: "Internal Server Error",
        message: err?.message || String(err)
      });
    }
  });
};

// API Routes
app.all(["/api/documents", "/api/documents/:id"], safeAsync((req, res) => documentsHandler(req, res)));
app.all("/api/stream-datasets", safeAsync((req, res) => streamDatasetsHandler(req, res)));
app.all("/api/parse-stream-document", safeAsync((req, res) => parseStreamDocumentHandler(req, res)));
app.all("/api/calculateInventory", safeAsync((req, res) => calculateInventoryHandler(req, res)));
app.all("/api/chatbot", safeAsync((req, res) => chatbotHandler(req, res)));
app.all("/api/formulas", safeAsync((req, res) => formulasHandler(req, res)));
app.all("/api/gemini", safeAsync((req, res) => geminiHandler(req, res)));
app.all("/api/gemini-stream", safeAsync((req, res) => geminiStreamHandler(req, res)));
app.all("/api/get-analyses", safeAsync((req, res) => getAnalysesHandler(req, res)));
app.all("/api/login", authRateLimiter, safeAsync((req, res) => loginHandler(req, res)));
app.all("/api/forgot-password", authRateLimiter, safeAsync((req, res) => forgotPasswordHandler(req, res)));
app.all("/api/session", sessionRateLimiter, safeAsync((req, res) => sessionHandler(req, res)));
app.all("/api/rbac", safeAsync((req, res) => rbacHandler(req, res)));
app.all("/api/admin", safeAsync((req, res) => adminHandler(req, res)));
app.all("/api/send-email", safeAsync((req, res) => sendEmailHandler(req, res)));
app.all("/api/viiidiv", safeAsync((req, res) => viiidivHandler(req, res)));
app.all("/api/b313", safeAsync((req, res) => b313Handler(req, res)));
app.all("/api/simple", safeAsync((req, res) => simpleHandler(req, res)));
app.all("/api/toxic", safeAsync((req, res) => toxicHandler(req, res)));
app.all("/api/representative-fluids", safeAsync((req, res) => representativeFluidsHandler(req, res)));
app.all("/api/corrosion-rate", safeAsync((req, res) => corrosionRateHandler(req, res)));
app.all("/api/llm", safeAsync((req, res) => llmHandler(req, res)));
app.all("/api/database", safeAsync((req, res) => databaseHandler(req, res)));
app.all("/api/damage-mechanisms", safeAsync((req, res) => damageMechanismsHandler(req, res)));
app.all("/api/remaining", safeAsync((req, res) => remainingHandler(req, res)));
app.all("/api/pipe-dimensions", safeAsync((req, res) => pipeDimensionsHandler(req, res)));
app.all("/api/damage-criteria", safeAsync((req, res) => damageCriteriaHandler(req, res)));
app.all("/api/structural-thickness", safeAsync((req, res) => structuralThicknessHandler(req, res)));
app.all("/api/risk-calculator", safeAsync((req, res) => riskCalculatorHandler(req, res)));
app.all("/api/stress-data", safeAsync((req, res) => databaseHandler(req, res)));

// Signup endpoint (referenced by signup.html)
const users = new Map();
app.post("/signup", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }
  users.set(username, { username, password });
  return res.status(200).json({ message: "Account created successfully!" });
});

// 🛡️ Security Guard: Block direct browser/F12 inspection and download of raw database, secret files, and unbundled calculation files
const blockedFiles = [
  "/data.js",
  "/bk_stressData.js",
  "/firebase/firebaseConfig.js",
  "/analyses.json",
  "/firebase-blueprint.json",
  "/Damage_mechanisms_criteria.js",
  "/Damagemechanism.js",
  "/Toxic.js",
  "/api581.js",
  "/b313.js",
  "/bk_stressscript.js",
  "/bk_stress_dataloader.js",
  "/bulkupload.js",
  "/categoryLoader.js",
  "/chart.js",
  "/chatbot.js",
  "/cylinderviz.js",
  "/dashboard.js",
  "/fluid-selector.js",
  "/global-script.js",
  "/h2u.js",
  "/inspectioncofidence.js",
  "/inventory.js",
  "/inventoryChart.js",
  "/main-cduvdu.js",
  "/main.js",
  "/mechanism.js",
  "/msp.js",
  "/pipeDataScript_883.js",
  "/probability.js",
  "/remaining.js",
  "/savedata.js",
  "/search.js",
  "/simple.js",
  "/viiidiv1.js"
];

app.use((req, res, next) => {
  const reqPath = req.path || "";
  if (
    blockedFiles.includes(reqPath) ||
    reqPath.startsWith("/secrets/") ||
    reqPath.startsWith("/data/secure/") ||
    reqPath.startsWith("/.git")
  ) {
    return res.status(403).json({
      error: "Access Denied: Protected Resource. All proprietary calculation modules are securely bundled."
    });
  }
  next();
});

// Serve static files from project root
app.use(express.static(__dirname));

// Fallback to index.html for root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`KayetDMS server running at http://0.0.0.0:${PORT}`);
});
