import { lookupOfficialFormula, parseOfficialLookupInput } from "../server/officialCosmetics.mjs";

const cache = new Map();
let inFlight = 0;

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ status: "method_not_allowed" }); }
  if (!req.headers["content-type"]?.startsWith("application/json") || Number(req.headers["content-length"]) > 2048) return res.status(400).json({ status: "invalid" });
  if (req.headers.origin) {
    try { if (new URL(req.headers.origin).host !== req.headers.host) throw new Error(); }
    catch { return res.status(403).json({ status: "not_allowed" }); }
  }
  let input;
  try { input = typeof req.body === "string" ? JSON.parse(req.body) : req.body; }
  catch { return res.status(400).json({ status: "invalid" }); }
  const query = parseOfficialLookupInput(input);
  if (!query) return res.status(200).json({ status: "unconfirmed" });
  const key = JSON.stringify([query.brand, query.key, query.amount, query.category, query.sourceUrl]);
  const current = cache.get(key);
  if (current && current.until > Date.now()) return send(res, await current.result, query.name);
  if (inFlight >= 5) return res.status(429).json({ status: "busy" });
  inFlight++;
  if (cache.size >= 180) cache.delete(cache.keys().next().value);
  const entry = { until: Date.now() + 15 * 60_000, result: lookupOfficialFormula(query) };
  cache.set(key, entry);
  try {
    const evidence = await entry.result;
    entry.until = Date.now() + (evidence ? 6 * 60 * 60_000 : 15 * 60_000);
    return send(res, evidence, query.name);
  } finally { inFlight--; }
}

function send(res, evidence, name) {
  return res.status(200).json(evidence ? { status: "confirmed", evidence: { ...evidence, name } } : { status: "unconfirmed" });
}
