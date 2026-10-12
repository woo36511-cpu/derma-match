const fs = require("node:fs");
const dotenv = require("dotenv");
const mode = process.argv[2] === "development" ? "development" : "production";
const values = { ...process.env };
for (const file of [`.env.${mode}.local`, ".env.local", `.env.${mode}`, ".env"]) {
  if (!fs.existsSync(file)) continue;
  for (const [key, value] of Object.entries(dotenv.parse(fs.readFileSync(file)))) {
    if (values[key] === undefined) values[key] = value;
  }
}
const url = (values.REACT_APP_SUPABASE_URL || "").trim();
const key = (values.REACT_APP_SUPABASE_PUBLISHABLE_KEY || "").trim();
if (url || key) {
  let validUrl = false;
  try {
    const parsed = new URL(url);
    validUrl = parsed.protocol === "https:" && !parsed.username && !parsed.password && parsed.pathname === "/";
  } catch { /* Report variable names without exposing values. */ }
  if (!validUrl || !key.startsWith("sb_publishable_")) {
    console.error("Cloud config invalid: set REACT_APP_SUPABASE_URL and a public sb_publishable_ key. Secret/service-role keys are forbidden in the browser build.");
    process.exit(1);
  }
}
