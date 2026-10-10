// Static "build" check for this no-bundler app. Fails (exit 1) on:
// syntax errors, unresolved relative imports, files missing from the service-worker
// shell or manifest, inline event handlers (break the CSP), leftover old branding,
// or anything that looks like a committed secret.
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname, resolve, relative } from "node:path";

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), "..");
const errors = [];
const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  if (["node_modules", ".git"].includes(f)) return [];
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const files = walk(ROOT);
const js = files.filter((f) => /\.(m?js)$/.test(f));

for (const f of js) {
  try { execFileSync(process.execPath, ["--check", f], { stdio: "pipe" }); }
  catch (e) { errors.push(`syntax: ${relative(ROOT, f)}\n${e.stderr}`); }
  const src = readFileSync(f, "utf8");
  for (const m of src.matchAll(/(?:import|export)[^"'`]*?from\s+["'](\.[^"']+)["']|import\(\s*["'](\.[^"']+)["']\s*\)/g)) {
    const spec = m[1] || m[2];
    if (!existsSync(resolve(dirname(f), spec.split("?")[0]))) errors.push(`import: ${relative(ROOT, f)} → ${spec} not found`);
  }
}
const app = js.filter((f) => f.includes(`${ROOT}/js/`));
for (const f of [...app, join(ROOT, "index.html")]) {
  const src = readFileSync(f, "utf8");
  if (/\son(click|load|error|change|input|submit)\s*=\s*["']/i.test(src)) errors.push(`inline handler (blocked by CSP): ${relative(ROOT, f)}`);
  if (/Pelangi Pop/.test(src)) errors.push(`old brand name in ${relative(ROOT, f)}`);
}
const sw = readFileSync(join(ROOT, "sw.js"), "utf8");
const shell = [...sw.matchAll(/"([^"]+\.(?:js|css|html|json|webmanifest|svg|png))"/g)].map((m) => m[1]);
for (const p of shell) if (!existsSync(join(ROOT, p))) errors.push(`sw.js shell file missing: ${p}`);
for (const f of app) {
  const rel = relative(ROOT, f);
  if (!shell.includes(rel)) errors.push(`sw.js shell does not list ${rel} (offline mode would break)`);
}
const manifest = JSON.parse(readFileSync(join(ROOT, "manifest.webmanifest"), "utf8"));
for (const i of manifest.icons) if (!existsSync(join(ROOT, i.src))) errors.push(`manifest icon missing: ${i.src}`);
const secretRx = /(service_role["']?\s*[:=]\s*["'][^"']{20,}|sk_live_[A-Za-z0-9]{16,}|sb_secret_[A-Za-z0-9_-]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY|eyJhbGciOi[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{40,})/;
for (const f of files.filter((f) => /\.(js|mjs|html|json|sql|md|webmanifest)$/.test(f) && f !== new URL(import.meta.url).pathname)) {
  if (secretRx.test(readFileSync(f, "utf8"))) errors.push(`possible secret committed in ${relative(ROOT, f)}`);
}
if (errors.length) { console.error("✖ check failed\n" + errors.map((e) => " - " + e).join("\n")); process.exit(1); }
console.log(`✔ check passed: ${js.length} JS files, ${shell.length} offline files, ${manifest.icons.length} icons`);
