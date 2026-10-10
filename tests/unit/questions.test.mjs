import { test } from "node:test";
import assert from "node:assert/strict";
import { installEnv } from "./_env.mjs";
installEnv();
const { GAMES } = await import("../../js/data/games.js");
const { MAPS } = await import("../../js/data/maps.js");
const { make, spread, Q, TF } = await import("../../js/data/questions.js");

function checkRound(where, qs, expectLen) {
  if (expectLen) assert.equal(qs.length, expectLen, `${where}: question count`);
  for (const q of qs) {
    const vals = q.options.map((o) => o.value);
    assert.ok(vals.includes(q.answer), `${where}: answer missing for "${q.prompt}"`);
    assert.equal(new Set(vals).size, vals.length, `${where}: duplicate options for "${q.prompt}"`);
    assert.ok(vals.length >= 2, `${where}: too few options`);
    assert.ok(!/undefined|NaN/.test(JSON.stringify(q)), `${where}: undefined/NaN in ${q.prompt}`);
  }
}

test("every game level generates 10 valid questions (20 rounds each)", () => {
  for (const g of GAMES) {
    if (g.type === "memory") continue;
    g.levels.forEach((l) => { for (let r = 0; r < 20; r++) checkRound(`${g.id}/${l.name}`, l.gen(), 10); });
  }
});

test("every quiz map station generates valid questions", () => {
  for (const m of MAPS) m.stations.forEach((s) => { if (s.type === "quiz") for (let r = 0; r < 20; r++) checkRound(`${m.id}/${s.name}`, s.gen(), 8); });
});

test("a correct answer appears at most twice per round when the pool allows", () => {
  let i = 0;
  const qs = make(10, () => Q(`q${i++}`, "", i % 7, [100, 101, 102]));
  const counts = {};
  qs.forEach((q) => (counts[q.answer] = (counts[q.answer] || 0) + 1));
  assert.ok(Math.max(...Object.values(counts)) <= 2);
});

test("spread() avoids the same answer twice in a row when possible", () => {
  const items = ["a", "a", "b", "b", "c", "c", "d", "d"].map((a, i) => ({ answer: a, i }));
  for (let r = 0; r < 200; r++) {
    const out = spread(items);
    assert.equal(out.length, items.length);
    for (let k = 1; k < out.length; k++) assert.notEqual(out[k].answer, out[k - 1].answer);
  }
});

test("true/false questions have exactly two options and the right answer", () => {
  const t = TF("1 + 1 = 2", true);
  assert.equal(t.options.length, 2);
  assert.equal(t.answer, "Betul ✅");
  assert.equal(TF("x", false, "", { lang: "en" }).answer, "False ❌");
});

test("memory levels have enough faces in every set", async () => {
  const { MEMORY_SETS } = await import("../../js/data/games.js");
  const max = Math.max(...GAMES.find((g) => g.id === "ingat-padan").levels.map((l) => l.pairs));
  for (const set of MEMORY_SETS) assert.ok(new Set(set).size >= max);
});
