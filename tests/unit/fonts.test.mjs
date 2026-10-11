import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { localizeFontCss, useLocalFonts, addToShell, familiesIn } from "../../scripts/fonts.mjs";

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
  assert.throws(() => localizeFontCss("body{}"), /no fonts/);
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

test("extension-less and quoted Google URLs are localised too (Baloo 2 regression)", () => {
  const css = `@font-face { font-family: 'Baloo 2'; font-weight: 700; src: url(https://fonts.gstatic.com/l/font?kit=wXKrE3kTposypRyd51ncAN&skey=b0ad&v=v21) format('woff2'); }
@font-face { font-family: 'Baloo 2'; font-weight: 800; src: url("https://fonts.gstatic.com/s/baloo2/v21/wXK0E3kTposypRydzVT08TS3JnAmtdgozapv9Fat7WcN.woff2") format("woff2"); }
@font-face { font-family: 'Chewy'; src: url(https://fonts.gstatic.com/s/chewy/v18/uK_94ruUb-k-wn52KjI.woff2) format('woff2'); }`;
  const { css: out, files } = localizeFontCss(css);
  assert.equal(files.length, 3);
  assert.doesNotMatch(out, /gstatic/);
  assert.match(files[0].name, /^f-[0-9a-f]{16}\.woff2$/);
  assert.match(out, /format\('woff2'\)/);
  assert.deepEqual(familiesIn(out), ["Baloo 2", "Chewy"]);
  // a URL form we cannot rewrite must stop the build from switching off Google
  assert.throws(() => localizeFontCss(`@font-face{src:url(https://fonts.gstatic.com/a.woff2)}@import url(https://fonts.googleapis.com/x);`), /not localised/);
});
