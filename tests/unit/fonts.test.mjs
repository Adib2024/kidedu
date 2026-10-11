import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { localizeFontCss, useLocalFonts, addToShell } from "../../scripts/fonts.mjs";

const ROOT = new URL("../../", import.meta.url);
const SAMPLE = `/* latin */
@font-face { font-family: 'Chewy'; src: url(https://fonts.gstatic.com/s/chewy/v18/uK_94ruUb-k-wn52KjI.woff2) format('woff2'); unicode-range: U+0000-00FF; }
/* latin */
@font-face { font-family: 'Andika'; font-weight: 400; src: url(https://fonts.gstatic.com/s/andika/v25/mem_Ya6iyW-Lwqg40ZM1UpcaXcl0Aw.woff2) format('woff2'); }
@font-face { font-family: 'Andika'; font-weight: 400; src: url(https://fonts.gstatic.com/s/andika/v25/mem_Ya6iyW-Lwqg40ZM1UpcaXcl0Aw.woff2) format('woff2'); }`;

test("font CSS is rewritten to local files, duplicates downloaded once", () => {
  const { css, files } = localizeFontCss(SAMPLE);
  assert.equal(files.length, 2);
  assert.doesNotMatch(css, /gstatic/);
  assert.match(css, /url\(\.\.\/fonts\/chewy-v18-uK_94ruUb-k-wn52KjI\.woff2\)/);
  for (const f of files) assert.match(f.name, /^[A-Za-z0-9._-]+\.woff2$/);
  assert.throws(() => localizeFontCss("body{}"), /no woff2/);
});

test("index.html: Google removed from links and CSP", () => {
  const html = useLocalFonts(readFileSync(new URL("index.html", ROOT), "utf8"));
  assert.match(html, /<link rel="stylesheet" href="css\/fonts.css" \/>/);
  assert.doesNotMatch(html, /fonts\.(googleapis|gstatic)\.com/);
  assert.match(html, /style-src 'self' 'unsafe-inline';/);
  assert.match(html, /font-src 'self';/);
});

test("service worker shell gains the font files", () => {
  const sw = addToShell(readFileSync(new URL("sw.js", ROOT), "utf8"), ["css/fonts.css", "fonts/a.woff2"]);
  assert.match(sw, /const SHELL = \[\n {2}"css\/fonts.css", "fonts\/a.woff2",/);
  new Function(sw.replace(/self\.addEventListener[\s\S]*/, "")); // still valid JS
});
