import { test } from "node:test";
import assert from "node:assert/strict";
import { installEnv } from "./_env.mjs";
installEnv();
const C = await import("../../js/school/curriculum.js");
const K = await import("../../js/school/qkit.js");
const { perkataan } = await import("../../js/school/gen-math.js");

const TYPES = new Set(["mcq", "tf", "input", "order", "match", "fill"]);
const bad = (s) => /undefined|NaN|\[object|null\b/.test(String(s));
const N = Number(process.env.SCHOOL_N || 300);

function check(q, where) {
  assert.ok(TYPES.has(q.type), `${where}: type ${q.type}`);
  assert.ok(typeof q.answer === "string" && q.answer.length, `${where}: empty answer`);
  for (const f of ["prompt", "answer", "explain"]) assert.ok(!bad(q[f] ?? ""), `${where}: ${f} = ${q[f]}`);
  if (["mcq", "fill", "tf"].includes(q.type)) {
    assert.ok(q.choices.length >= 2, `${where}: ${q.choices.length} choices for "${K.plain(q.prompt)}"`);
    assert.equal(new Set(q.choices).size, q.choices.length, `${where}: duplicate choices ${q.choices}`);
    assert.equal(q.choices.filter((c) => c === q.answer).length, 1, `${where}: answer "${q.answer}" not in ${q.choices}`);
    for (const c of q.choices) assert.ok(!bad(c) && String(c).trim(), `${where}: bad choice "${c}"`);
  }
  if (q.type === "fill") assert.match(q.prompt, /___/, `${where}: fill without blank`);
  if (q.type === "input") {
    assert.ok(Number.isFinite(Number(q.answer)), `${where}: input answer ${q.answer}`);
    assert.equal(K.norm(q, q.answer), K.correctOf(q));
    // arithmetic prompts are checked for real
    const m = /^([\d .]+) ([+−×÷]) ([\d .]+) = \?$/.exec(K.plain(q.prompt));
    if (m) {
      const a = Number(m[1].replace(/ /g, "")), b = Number(m[3].replace(/ /g, ""));
      const v = { "+": a + b, "−": a - b, "×": a * b, "÷": a / b }[m[2]];
      assert.equal(Number(q.answer), K.r2(v, 5), `${where}: ${K.plain(q.prompt)} → ${q.answer}`);
    }
  }
  if (q.type === "order") {
    assert.ok(q.tiles.length >= 2, `${where}: order needs ≥2 tiles`);
    assert.deepEqual([...q.tiles].sort(), [...q.parts].sort(), `${where}: tiles ≠ parts`);
    assert.equal(q.parts.join(q.joiner), q.answer, `${where}: parts ≠ answer`);
  }
  if (q.type === "match") {
    assert.ok(q.pairs.length >= 3, `${where}: match needs ≥3 pairs`);
    assert.equal(new Set(q.pairs.map((p) => p[0])).size, q.pairs.length, `${where}: duplicate left ${q.pairs}`);
    assert.equal(new Set(q.pairs.map((p) => p[1])).size, q.pairs.length, `${where}: duplicate right ${q.pairs}`);
  }
}

test("curriculum: 3 subjects × 6 years, 7–8 topics each, unique ids", () => {
  for (const s of C.SUBJECTS) for (const y of C.YEARS) {
    const ts = C.topics(s.id, y);
    assert.ok(ts.length >= 7 && ts.length <= 8, `${s.id} T${y}: ${ts.length} topics`);
    assert.equal(new Set(ts.map((t) => t.id)).size, ts.length, `${s.id} T${y}: duplicate topic ids`);
    for (const t of ts) assert.match(t.id, /^[a-z0-9-]+$/);
  }
});

for (const s of C.SUBJECTS) {
  test(`${s.title}: every topic produces valid questions (${N} each)`, () => {
    for (const y of C.YEARS) for (const t of C.topics(s.id, y)) {
      for (let i = 0; i < N; i++) check(t.gen(), `${s.id}-t${y}:${t.id}`);
      const round = C.roundFor(t);
      assert.equal(round.length, 10);
      const distinct = new Set(round.map((q) => K.plain(q.prompt) + (q.visual || "").length + q.answer)).size;
      assert.ok(distinct >= 8, `${s.id}-t${y}:${t.id}: only ${distinct} distinct questions in a round`);
    }
  });
}

test("answers: normalisation used for scoring", () => {
  const q = K.input("1 + 1 = ?", 2);
  assert.ok(K.isCorrect(q, "2") && K.isCorrect(q, " 2 ") && K.isCorrect(q, "2.0"));
  assert.ok(!K.isCorrect(q, "3") && !K.isCorrect(q, ""));
  const d = K.input("0.1 + 0.2 = ?", 0.3);
  assert.ok(K.isCorrect(d, "0.3") && K.isCorrect(d, "0,3"));
  const o = K.order("Susun", ["Saya", "suka", "buku"]);
  assert.ok(K.isCorrect(o, "Saya suka buku") && !K.isCorrect(o, "suka Saya buku"));
});

test("Malay number words", () => {
  const cases = { 0: "kosong", 10: "sepuluh", 11: "sebelas", 15: "lima belas", 20: "dua puluh", 21: "dua puluh satu", 100: "seratus", 101: "seratus satu", 312: "tiga ratus dua belas",
    1000: "seribu", 1999: "seribu sembilan ratus sembilan puluh sembilan", 23045: "dua puluh tiga ribu empat puluh lima", 100000: "seratus ribu", 1000000: "sejuta" };
  for (const [n, w] of Object.entries(cases)) assert.equal(perkataan(Number(n)), w);
});

test("catalogue ids satisfy the server's rules", () => {
  const rows = C.catalogRows();
  assert.equal(rows.length, 3 * 6 + 2);
  for (const r of rows) {
    assert.match(r.id, /^[a-z]+(:[a-z0-9-]+)?$/, r.id);
    assert.ok(r.id.length <= 80);
    for (const it of r.items || []) {
      assert.match(it, /^[a-z0-9-]+$/);
      assert.ok(`${r.id}:${it}`.length <= 120);
      const p = C.parseActivity(`${r.id}:${it}`);
      assert.ok(p && `${C.familyId(p.subject, p.year)}` === r.id, `${r.id}:${it}`);
    }
    if (r.items) assert.equal(new Set(r.items).size, r.items.length);
  }
  assert.equal(C.activityId("mat", 3, "pecahan-setara", "bos"), "sek:mat-t3:pecahan-setara-bos");
  assert.equal(C.parseActivity("game:bijak-sifir:1"), null);
});

test("grade from age / profile", () => {
  assert.equal(C.gradeFromAge(5), 0);
  assert.equal(C.gradeFromAge(7), 1);
  assert.equal(C.gradeFromAge(12), 6);
  assert.equal(C.gradeFromAge(14), 6);
  assert.equal(C.gradeOf({ age: 9 }), 3);
  assert.equal(C.gradeOf({ age: 9, grade: 2 }), 2);
  assert.equal(C.gradeOf({ age: 9, grade: 0 }), 0);
});
