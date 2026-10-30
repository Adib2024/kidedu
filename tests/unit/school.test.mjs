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
  if (q.listen != null) {
    // listening: the spoken text must not be printed in the prompt, and a written fallback must exist
    assert.ok(typeof q.listen === "string" && q.listen.trim(), `${where}: empty listen`);
    assert.ok(!(" " + K.plain(q.prompt).toLowerCase().replace(/[^\p{L}\p{N} ]/gu, " ") + " ").includes(` ${q.listen.toLowerCase().replace(/[^\p{L}\p{N} ]/gu, " ")} `), `${where}: prompt gives away "${q.listen}"`);
    const w = K.silent(q);
    assert.ok(!("listen" in w) && w.prompt && !bad(w.prompt), `${where}: silent version`);
  }
  if (q.type === "fill") assert.match(q.prompt, /___/, `${where}: fill without blank`);
  if (q.steps != null) {
    assert.ok(Array.isArray(q.steps) && q.steps.length >= 2, `${where}: steps`);
    for (const st of q.steps) assert.ok(typeof st === "string" && st.trim() && !bad(st), `${where}: bad step "${st}"`);
  }
  if (q.work != null) assert.match(q.work, /^<table class="colwork"[^]*<\/table>$/, `${where}: work layout`);
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

test("curriculum: 4 subjects × 6 years, 6–9 topics each, unique ids", () => {
  for (const s of C.SUBJECTS) for (const y of C.YEARS) {
    const ts = C.topics(s.id, y);
    assert.ok(ts.length >= 6 && ts.length <= 9, `${s.id} T${y}: ${ts.length} topics`);
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
      const distinct = new Set(round.map((q) => K.plain(q.prompt) + (q.listen || "") + (q.visual || "").length + q.answer)).size;
      assert.ok(distinct >= 8, `${s.id}-t${y}:${t.id}: only ${distinct} distinct questions in a round`);
    }
  });
}

test("listening questions exist for BM, English and Maths and fall back to text", () => {
  const listening = (sid) => C.SUBJECTS.find((x) => x.id === sid) && C.YEARS.flatMap((y) => C.topics(sid, y)).filter((t) => Array.from({ length: 40 }, t.gen).some((q) => q.listen));
  for (const sid of ["bm", "en", "mat"]) assert.ok(listening(sid).length >= 2, `${sid}: listening topics`);
  const q = K.mcq("🎧 Dengar dan pilih.", "🐱", ["🐶", "🐟"], { listen: "kucing", alt: "Pilih gambar <b>kucing</b>." });
  assert.equal(K.silent(q).prompt, "Pilih gambar <b>kucing</b>.");
  assert.equal(K.silent(K.mcq("x", "1", ["2"])).prompt, "x");
});

test("reading passages are levelled: Year 2 texts are short, Year 6 texts longer", () => {
  const len = (sid, y, id) => { const t = C.topicById(sid, y, id); return Math.max(...Array.from({ length: 60 }, () => K.plain(t.gen().visual).split(" ").length)); };
  assert.ok(len("bm", 2, "baca-faham") <= 25 && len("en", 2, "read-short") <= 25);
  assert.ok(len("bm", 6, "pemahaman-4") > 40 && len("en", 6, "reading-4") > 40);
});

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
  assert.equal(rows.length, C.SUBJECTS.length * 6 + 2);
  assert.deepEqual(C.SUBJECTS.map((x) => x.id), ["mat", "bm", "en", "sai"]);
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

test("parent school report: progress, accuracy, weekly time, weak chapters, review queue", async () => {
  const { schoolReport, schoolReportHtml } = await import("../../js/school/report.js");
  const now = Date.parse("2026-10-27T10:00:00Z");
  const ago = (d) => new Date(now - d * 864e5).toISOString();
  const log = (right, n = 10) => Array.from({ length: n }, (_, i) => ({ q: "q" + i, a: i < right ? "1" : "x", c: "1" }));
  const attempts = [
    { category: "sekolah", activity_id: "sek:mat-t3:pecahan-setara-latihan", answers: log(3), duration_ms: 240000, created_at: ago(1) },
    { category: "sekolah", activity_id: "sek:mat-t3:pecahan-setara-masa", answers: log(4), duration_ms: 120000, created_at: ago(2) },
    { category: "sekolah", activity_id: "sek:sai-t3:rangka-latihan", answers: log(10), duration_ms: 3 * 3600e3, created_at: ago(3) },
    { category: "sekolah", activity_id: "sek:bm-t2:ejaan-latihan", answers: log(9), duration_ms: 60000, created_at: ago(20) },
    { category: "games", activity_id: "game:bijak-sifir:0", answers: log(1), duration_ms: 60000, created_at: ago(1) },
  ];
  const stars = { "sek:mat-t3:pecahan-setara-latihan": 1, "sek:sai-t3:rangka-latihan": 3, "sek:sai-t3:rangka-masa": 3, "sek:sai-t3:rangka-bos": 3, "sek:bm-t2:ejaan-latihan": 3 };
  const r = schoolReport({ child: { name: "Ali", age: 9, grade: 3 }, starsOf: (id) => stars[id] || 0, attempts, reviewItems: [{ due: now - 1 }, { due: now + 864e5 }], now });
  assert.deepEqual(r.years.map((y) => y.year), [2, 3], "own year + years with attempts");
  const mat = r.years[1].subjects.find((s) => s.id === "mat"), sai = r.years[1].subjects.find((s) => s.id === "sai");
  assert.equal(mat.started, 1); assert.equal(mat.accuracy, 35);
  assert.equal(sai.mastered, 1); assert.equal(sai.stars, 9);
  assert.deepEqual(r.week, { rounds: 3, minutes: 6 + 30, days: 3 }, "one round capped at 30 min; games and old rounds excluded");
  assert.equal(r.weak.length, 1); assert.equal(r.weak[0].topic, "pecahan-setara"); assert.equal(r.weak[0].pct, 35);
  assert.equal(r.weak[0].print, "#/sekolah/cetak/mat/3/pecahan-setara");
  assert.deepEqual(r.review, { total: 2, due: 1 });
  assert.equal(r.accuracy, Math.round((3 + 4 + 10) / 30 * 100));
  const html = schoolReportHtml(r, "Ali");
  assert.match(html, /Pecahan Setara/); assert.match(html, /Fokus minggu ini/); assert.ok(!/undefined|NaN/.test(html));
  assert.equal(schoolReport({ child: { name: "Bayi", age: 5 }, starsOf: () => 0, attempts: [], now }), null);
  assert.match(schoolReportHtml(null, "Bayi"), /Darjah/);
});

test("rotation: a round avoids recently seen questions while the topic still has new ones", () => {
  const bank = Array.from({ length: 25 }, (_, i) => K.mcq(`Soalan ${i}?`, "a", ["b", "c"]));
  const gen = () => bank[Math.floor(Math.random() * bank.length)];
  const r1 = K.makeSet(gen, 10);
  const seen = new Set(r1.map(K.qKey));
  const r2 = K.makeSet(gen, 10, 60, { avoid: seen });
  assert.equal(r2.filter((q) => seen.has(K.qKey(q))).length, 0, "no repeats while unseen ones remain");
  const seen2 = new Set([...seen, ...r2.map(K.qKey)]);
  const r3 = K.makeSet(gen, 10, 60, { avoid: seen2 });
  assert.equal(r3.length, 10);
  assert.equal(new Set(r3.map(K.qKey)).size, 10, "still distinct inside the round");
  assert.equal(r3.filter((q) => !seen2.has(K.qKey(q))).length, 5, "the last 5 unseen come first, then the oldest repeats");
});

test("explanations: (almost) every wrong answer gets a reason, Maths often a worked solution", () => {
  for (const [subj, min] of [["bm", 0.97], ["en", 0.97], ["sai", 0.95], ["mat", 0.8]]) {
    let n = 0, ok = 0, steps = 0;
    for (const y of C.YEARS) for (const t of C.topics(subj, y)) for (let i = 0; i < 60; i++) {
      const q = t.gen();
      if (q.type === "match") continue;
      n++; if (q.explain || q.steps) ok++; if (q.steps) steps++;
    }
    assert.ok(ok / n >= min, `${subj}: ${Math.round((100 * ok) / n)}% explained`);
    if (subj === "mat") assert.ok(steps / n >= 0.35, `mat: ${Math.round((100 * steps) / n)}% with steps`);
  }
});

test("worked solutions: column addition, subtraction with borrowing, multiplication and long division", async () => {
  const S = await import("../../js/school/steps.js");
  const add = S.addSteps(478, 356);
  assert.equal(add.steps.at(-1), "Jawapan: 834");
  assert.match(add.steps[0], /8 \+ 6 = 14 → tulis 4, bawa 1/);
  assert.match(add.work, /colwork/);
  const sub = S.subSteps(1003, 7);
  assert.equal(sub.steps.at(-1), "Jawapan: 996");
  assert.match(sub.steps[0], /pinjam dari ribu/);
  assert.equal(S.subSteps(5.2, 1.75, 2).steps.at(-1), "Jawapan: 3.45");
  assert.equal(S.addSteps(3.4, 5.67, 2).steps.at(-1), "Jawapan: 9.07");
  assert.equal(S.mulSteps(347, 6).steps.at(-1), "Jawapan: 2 082");
  assert.equal(S.mulSteps(123, 24).steps.at(-1), "Jawapan: 2 952");
  const div = S.divSteps(1734, 6);
  assert.ok(div.steps.includes("Jawapan: 289") && div.steps.some((x) => /^Semak: 6 × 289 = 1 734/.test(x)));
  assert.equal(S.remainderSteps(38, 7).steps.at(-1), "Jawapan: 5 baki 3");
  // every generated arithmetic question's last step agrees with its answer
  for (const [subj, y, id] of [["mat", 2, "tambah-tolak-1000"], ["mat", 3, "operasi-10000"], ["mat", 4, "darab-bahagi"], ["mat", 5, "darab-bahagi-besar"]]) {
    const t = C.topicById(subj, y, id);
    for (let i = 0; i < 200; i++) {
      const q = t.gen();
      const last = q.steps?.findLast((x) => x.startsWith("Jawapan: "));
      if (q.type === "input" && last) assert.equal(last.slice(9).replace(/ /g, ""), q.answer, `${id}: ${K.plain(q.prompt)}`);
    }
  }
});

test("reading explanations quote the sentence that holds the answer", () => {
  const text = "Ravi suka membaca. Setiap waktu rehat, dia pergi ke perpustakaan. Dia ingin menjadi angkasawan seperti Datuk Dr. Sheikh Muszaphar.";
  assert.equal(K.evidence(text, "Bilakah Ravi pergi ke perpustakaan?", "waktu rehat"), "Setiap waktu rehat, dia pergi ke perpustakaan.");
  assert.equal(K.evidence(text, "Siapakah idola Ravi?", "Sheikh Muszaphar"), "Dia ingin menjadi angkasawan seperti Datuk Dr. Sheikh Muszaphar.");
  assert.equal(K.evidence("The cat sleeps. Pollution is harmful to fish.", "The word 'harmful' means…", "causing damage"), "Pollution is harmful to fish.");
});

test("adaptive Latihan: harder after two right answers, easier after a wrong one", async () => {
  const { makeLadder } = await import("../../js/school/play.js");
  const easy = { type: "tf", prompt: "1 + 1 = 2", answer: "Betul" }, hard = { type: "input", prompt: "4 567.25 × 38 = ?", answer: "1", decimal: true };
  assert.ok(K.difficulty(hard) > K.difficulty(easy) + 2);
  const pool = [...Array(10)].map((_, i) => ({ ...easy, prompt: `${i} + 1 = ?` })).concat([...Array(10)].map((_, i) => ({ type: "mcq", prompt: `${300 + i} + 45 = ?`, answer: "x" })),
    [...Array(10)].map((_, i) => ({ ...hard, prompt: `${4567 + i}.25 × 38 = ?` })));
  const L = makeLadder(pool);
  assert.equal(L.level, 1);
  assert.equal(L.take().type, "mcq");
  assert.equal(L.result(true), 0);
  assert.equal(L.result(true), 1);
  assert.equal(L.level, 2);
  assert.equal(L.take().type, "input");
  assert.equal(L.result(false), -1);
  assert.equal(L.result(false), -1);
  assert.equal(L.level, 0);
  assert.equal(L.take().type, "tf");
  assert.equal(L.result(false), 0, "cannot go below the easiest level");
  // the pool runs dry gracefully: nearest band is used, then null
  let n = 3; while (L.take()) n++;
  assert.equal(n, 30);
});
