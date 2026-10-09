// api/llm.js
export const config = { runtime: "edge" }; // or nodejs if you prefer

export default async function handler(req, res) {
  if (req.method !== "POST") {
    if (res?.status) return res.status(405).json({ error: "Only POST allowed" });
    return new Response(JSON.stringify({ error: "Only POST allowed" }), { status: 405, headers:{ "Content-Type":"application/json" }});
  }

  try {
    const body = req.body || (typeof req.json === "function" ? await req.json() : {});
    const { prompt, model = "mistralai/Mistral-7B-Instruct-v0.1" } = body;
    if (!prompt) {
      if (res?.status) return res.status(400).json({ error: "Missing prompt" });
      return new Response(JSON.stringify({ error: "Missing prompt" }), { status: 400, headers:{ "Content-Type":"application/json" }});
    }

    const HF_TOKEN = process.env.HF_TOKEN || process.env.HF_API_KEY || process.env.HUGGINGFACE_TOKEN;
    if (!HF_TOKEN) {
      const msg = "HF token not configured on server (env var missing)";
      if (res?.status) return res.status(500).json({ error: msg });
      return new Response(JSON.stringify({ error: msg }), { status: 500, headers:{ "Content-Type":"application/json" }});
    }

    const hfUrl = `https://api-inference.huggingface.co/models/${model}`;

    const r = await fetch(hfUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 256 } })
    });

    const text = await r.text(); // read raw text first

    // If response is JSON parseable, parse it; otherwise include raw text in error
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      // not JSON — return helpful debug info
      const errObj = {
        error: "Upstream returned non-JSON response",
        status: r.status,
        statusText: r.statusText,
        bodyPreview: text.slice(0, 2000)
      };
      if (res?.status) return res.status(502).json(errObj);
      return new Response(JSON.stringify(errObj), { status: 502, headers: { "Content-Type": "application/json" }});
    }

    if (!r.ok) {
      const errObj = { error: "Upstream error", status: r.status, body: parsed };
      if (res?.status) return res.status(502).json(errObj);
      return new Response(JSON.stringify(errObj), { status: 502, headers: { "Content-Type": "application/json" }});
    }

    // try common shapes
    let output = "";
    if (Array.isArray(parsed) && parsed[0]?.generated_text) output = parsed[0].generated_text;
    else if (parsed?.generated_text) output = parsed.generated_text;
    else if (parsed?.[0]) output = JSON.stringify(parsed[0]);
    else output = JSON.stringify(parsed);

    if (res?.status) return res.status(200).json({ text: output });
    return new Response(JSON.stringify({ text: output }), { status: 200, headers: { "Content-Type": "application/json" }});
  } catch (err) {
    if (res?.status) return res.status(500).json({ error: String(err) });
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" }});
  }
}
