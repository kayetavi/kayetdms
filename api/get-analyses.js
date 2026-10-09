// api/get-analyses.js
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const filePath = path.join(process.cwd(), "data", "analyses.json");

    if (!fs.existsSync(filePath)) {
      return res.status(200).json([]);
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf-8") || "[]");
    res.status(200).json(data);
  } catch (error) {
    console.error("Error reading data:", error);
    res.status(500).json({ error: "Failed to load data" });
  }
}
