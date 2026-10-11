// Assemble the deployable static site in ./_site and write config.js from environment variables.
//   SUPABASE_URL=https://xxxx.supabase.co SUPABASE_PUBLISHABLE_KEY=sb_publishable_... node scripts/build-site.mjs
// Without them the site deploys in Demo mode. Refuses privileged keys (they would be public).
import { cpSync, mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { vendorFonts, useLocalFonts, addToShell } from "./fonts.mjs";

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), "..");
const OUT = join(ROOT, "_site");
const url = (process.env.SUPABASE_URL || "").trim();
const key = (process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || "").trim();

function assertPublicKey(k) {
  if (!k) return;
  if (/^sb_secret_/.test(k)) throw new Error("Refusing to publish a Supabase SECRET key. Use the publishable (sb_publishable_…) key.");
  if (/^eyJ/.test(k)) {
    const payload = JSON.parse(Buffer.from(k.split(".")[1], "base64url").toString());
    if (payload.role !== "anon") throw new Error(`Refusing to publish a JWT with role "${payload.role}". Use the anon/publishable key.`);
  }
}
if (url && !/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)) throw new Error("SUPABASE_URL must look like https://<ref>.supabase.co");
if (Boolean(url) !== Boolean(key)) throw new Error("Set both SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY, or neither (Demo mode).");
assertPublicKey(key);

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT);
for (const f of ["index.html", "manifest.webmanifest", "sw.js", ".nojekyll", "css", "js", "icons"]) {
  if (existsSync(join(ROOT, f))) cpSync(join(ROOT, f), join(OUT, f), { recursive: true });
}
writeFileSync(join(OUT, "config.js"), `// Generated at deploy time by scripts/build-site.mjs
window.PPL_CONFIG = ${JSON.stringify({ SUPABASE_URL: url, SUPABASE_ANON_KEY: key }, null, 2)};
`);
let html = readFileSync(join(ROOT, "index.html"), "utf8");
let fontNote = "Google Fonts";
if (process.env.SKIP_FONTS !== "1") {
  try {
    const files = await vendorFonts(OUT);
    html = useLocalFonts(html);
    writeFileSync(join(OUT, "sw.js"), addToShell(readFileSync(join(OUT, "sw.js"), "utf8"), ["css/fonts.css", ...files]));
    fontNote = `${files.length} self-hosted font files`;
  } catch (e) {
    rmSync(join(OUT, "fonts"), { recursive: true, force: true });
    rmSync(join(OUT, "css", "fonts.css"), { force: true });
    console.warn(`::warning::Fonts not self-hosted (${e.message}); falling back to Google Fonts.`);
  }
}
writeFileSync(join(OUT, "index.html"), html);
// SPA fallback: every route is a #hash, so 404.html only needs to bounce to the app.
writeFileSync(join(OUT, "404.html"), html);
console.log(`built _site (${url ? "Supabase: " + url : "Demo mode"}; ${fontNote})`);
