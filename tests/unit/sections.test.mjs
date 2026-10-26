import { test } from "node:test";
import assert from "node:assert/strict";
import { installEnv } from "./_env.mjs";
installEnv();
const { SECTIONS, TOTAL_TOPICS, searchTopics } = await import("../../js/sections.js");

test("catalogue: 70 activity topics + every Sekolah chapter, unique ids per section", async () => {
  const C = await import("../../js/school/curriculum.js");
  const school = C.SUBJECTS.reduce((n, s) => n + C.YEARS.reduce((m, y) => m + C.topics(s.id, y).length, 0), 0);
  assert.ok(school >= 120, `school topics: ${school}`);
  assert.equal(TOTAL_TOPICS, 70 + school);
  for (const s of SECTIONS) {
    const ids = s.list.map((x) => x.id);
    assert.equal(new Set(ids).size, ids.length, `duplicate id in ${s.key}`);
    for (const it of s.list) assert.ok(it.title && it.emoji, `${s.key}/${it.id} missing title/emoji`);
  }
});
test("search finds Sekolah chapters and links to the chapter page", () => {
  const r = searchTopics("pecahan setara");
  assert.ok(r.some((x) => x.s.key === "sekolah" && `${x.s.href}/${x.it.id}` === "#/sekolah/bab/mat/3/pecahan-setara"));
});
test("search finds topics by title, level name and section", () => {
  assert.ok(searchTopics("sifir").some((r) => r.it.id === "bijak-sifir"));
  assert.ok(searchTopics("Sifir 7").some((r) => r.it.id === "bijak-sifir"));
  assert.ok(searchTopics("planner menu").some((r) => r.it.id === "menu"));
  assert.ok(searchTopics("BUAH").length >= 1);
  assert.deepEqual(searchTopics("   "), []);
  assert.deepEqual(searchTopics("zzzz-tiada"), []);
});
