import { test } from "node:test";
import assert from "node:assert/strict";
import { installEnv } from "./_env.mjs";
installEnv();
const u = await import("../../js/util.js");

test("esc() neutralises HTML", () => {
  assert.equal(u.esc(`<img src=x onerror="a">&'`), "&lt;img src=x onerror=&quot;a&quot;&gt;&amp;&#39;");
  assert.equal(u.esc(null), "");
});
test("starsFor thresholds", () => {
  assert.equal(u.starsFor(10, 10), 3);
  assert.equal(u.starsFor(9, 10), 3);
  assert.equal(u.starsFor(7, 10), 2);
  assert.equal(u.starsFor(5, 10), 1);
  assert.equal(u.starsFor(4, 10), 0);
  assert.equal(u.starsFor(0, 0), 0);
});
test("safeNext only allows in-app paths", () => {
  assert.equal(u.safeNext("/games/bijak-sifir?lv=2"), "/games/bijak-sifir?lv=2");
  assert.equal(u.safeNext("//evil.com"), "/app");
  assert.equal(u.safeNext("https://evil.com"), "/app");
  assert.equal(u.safeNext("javascript:alert(1)"), "/app");
  assert.equal(u.safeNext(undefined), "/app");
});
test("date helpers cross month/year boundaries", () => {
  assert.equal(u.addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(u.addDays("2026-03-01", -1), "2026-02-28");
  assert.match(u.prettyDate("2026-10-10"), /Sabtu, 10 Oktober 2026/);
});
test("nearNumbers never returns the value or negatives", () => {
  for (let i = 0; i < 200; i++) {
    const v = Math.floor(Math.random() * 5);
    const ns = u.nearNumbers(v, 3, 3);
    assert.equal(ns.length, 3);
    assert.ok(!ns.includes(v) && ns.every((n) => n >= 0));
  }
});
