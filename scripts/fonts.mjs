// Self-host the web fonts at deploy time: no request to Google from the children's browser,
// and fonts work offline from the very first visit. Pure helpers are unit-tested; vendorFonts()
// does the network part and is used by build-site.mjs (falls back to Google Fonts on any error).
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const GOOGLE_CSS = "https://fonts.googleapis.com/css2?family=Andika:wght@400;700&family=Baloo+2:wght@500;600;700;800&family=Chewy&display=swap";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

/** Rewrite Google's @font-face CSS to local URLs. Returns the new CSS and the files to download. */
export function localizeFontCss(css, dir = "../fonts/") {
  const files = [];
  const out = css.replace(/url\((https:\/\/fonts\.gstatic\.com\/[^)\s]+\.woff2)\)/g, (_m, url) => {
    let f = files.find((x) => x.url === url);
    if (!f) {
      const base = url.split("/").slice(-3).join("-").replace(/[^A-Za-z0-9._-]/g, "");
      f = { url, name: base };
      files.push(f);
    }
    return `url(${dir}${f.name})`;
  });
  if (!files.length) throw new Error("no woff2 fonts found in the stylesheet");
  return { css: out, files };
}

/** Point index.html at the local stylesheet and drop Google from the CSP. */
export function useLocalFonts(html) {
  const out = html
    .replace(/\s*<link rel="preconnect" href="https:\/\/fonts\.(googleapis|gstatic)\.com"[^>]*>/g, "")
    .replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2[^"]*" rel="stylesheet" \/>/, `<link rel="stylesheet" href="css/fonts.css" />`)
    .replace(" https://fonts.googleapis.com", "")
    .replace("font-src 'self' https://fonts.gstatic.com", "font-src 'self'");
  if (/fonts\.(googleapis|gstatic)\.com/.test(out)) throw new Error("index.html still references Google Fonts");
  return out;
}

/** Add the font files to the service worker's offline shell. */
export function addToShell(sw, paths) {
  if (!sw.includes("const SHELL = [")) throw new Error("SHELL list not found in sw.js");
  return sw.replace("const SHELL = [", `const SHELL = [\n  ${paths.map((p) => JSON.stringify(p)).join(", ")},`);
}

export async function vendorFonts(outDir) {
  const res = await fetch(GOOGLE_CSS, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`fonts css HTTP ${res.status}`);
  const { css, files } = localizeFontCss(await res.text());
  mkdirSync(join(outDir, "fonts"), { recursive: true });
  for (const f of files) {
    const r = await fetch(f.url);
    if (!r.ok) throw new Error(`font HTTP ${r.status}: ${f.url}`);
    writeFileSync(join(outDir, "fonts", f.name), Buffer.from(await r.arrayBuffer()));
  }
  writeFileSync(join(outDir, "css", "fonts.css"), `/* Self-hosted at deploy time from Google Fonts (SIL Open Font License). */\n${css}`);
  return files.map((f) => `fonts/${f.name}`);
}
