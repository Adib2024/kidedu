import { test } from "node:test";
import assert from "node:assert/strict";
import { installEnv } from "./_env.mjs";
installEnv();
const { SECTIONS, TOTAL_TOPICS, searchTopics } = await import("../../js/sections.js");

test("catalogue has 70 topics with unique ids per section", () => {
  assert.equal(TOTAL_TOPICS, 70);
  for (const s of SECTIONS) {
    const ids = s.list.map((x) => x.id);
    assert.equal(new Set(ids).size, ids.length, `duplicate id in ${s.key}`);
    for (const it of s.list) assert.ok(it.title && it.emoji, `${s.key}/${it.id} missing title/emoji`);
  }
});
test("search finds topics by title, level name and section", () => {
  assert.ok(searchTopics("sifir").some((r) => r.it.id === "bijak-sifir"));
  assert.ok(searchTopics("Sifir 7").some((r) => r.it.id === "bijak-sifir"));
  assert.ok(searchTopics("planner menu").some((r) => r.it.id === "menu"));
  assert.ok(searchTopics("BUAH").length >= 1);
  assert.deepEqual(searchTopics("   "), []);
  assert.deepEqual(searchTopics("zzzz-tiada"), []);
});
