import { validateSession, updateHeartbeat, deleteSession } from "./sessionStore.js";

export default async function handler(req, res) {
  // Allow GET or POST
  const method = req.method;
  const payload = method === "GET" ? req.query : req.body || {};
  const action = (payload.action || "validate").toLowerCase();
  const sessionId = payload.sessionId || "";
  const uid = payload.uid || "";
  const email = payload.email || "";

  if (action === "validate" || action === "check") {
    if (!sessionId && !uid && !email) {
      return res.status(400).json({ valid: false, error: "Missing session identifiers." });
    }
    const result = await validateSession(sessionId, uid, email);
    return res.status(200).json(result);
  }

  if (action === "heartbeat") {
    const result = await updateHeartbeat(sessionId, uid);
    return res.status(200).json(result);
  }

  if (action === "logout") {
    const result = await deleteSession(sessionId, uid);
    return res.status(200).json(result);
  }

  return res.status(400).json({ error: `Unknown action: ${action}` });
}
