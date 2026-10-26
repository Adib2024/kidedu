// Question kit for Sekolah (Darjah 1–6). A question is plain data so it can be rendered, printed,
// stored for spaced repetition and logged for server-side scoring.
//
// { type: "mcq"|"tf"|"input"|"order"|"match"|"fill",
//   prompt, visual?, choices?, answer, tiles?, joiner?, pairs?, unit?, decimal?, explain?, say?, lang }
// `visual` is trusted HTML/SVG produced by our own builders — never user text.
import { shuffle, rnd, pick, sample } from "../util.js";

export const fmt = (n) => {
  const [i, d] = String(n).split(".");
  const s = i.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return d ? `${s}.${d}` : s;
};
/** Round to avoid float noise (0.1 + 0.2). */
export const r2 = (x, dp = 3) => Number(Math.round(Number(x + "e" + dp)) + "e-" + dp);

export function uniq(list, key = (x) => String(x)) {
  const seen = new Set();
  return list.filter((x) => (seen.has(key(x)) ? false : (seen.add(key(x)), true)));
}

/** Multiple choice: the answer plus up to n-1 distinct distractors, shuffled. */
export function mcq(prompt, answer, distractors, o = {}) {
  const a = String(answer);
  const ds = uniq(distractors.map(String)).filter((d) => d !== a);
  const n = o.n ?? 4;
  return { type: "mcq", prompt, answer: a, choices: shuffle([a, ...sample(ds, n - 1)]), lang: o.lang || "ms", ...pickO(o) };
}
/** Numeric multiple choice with near-miss distractors. */
export function mcqNum(prompt, answer, o = {}) {
  const spread = o.spread ?? Math.max(3, Math.round(Math.abs(answer) * 0.15));
  const ds = new Set();
  const step = o.step ?? 1;
  let guard = 0;
  while (ds.size < 6 && guard++ < 200) {
    const d = r2(answer + rnd(-spread, spread) * step);
    if (d !== answer && d >= (o.min ?? 0)) ds.add(d);
  }
  for (const extra of o.traps || []) if (extra !== answer && extra >= (o.min ?? 0)) ds.add(r2(extra));
  const show = o.show || ((x) => fmt(x));
  const traps = (o.traps || []).filter((t) => t !== answer).map(show);
  const rest = shuffle([...ds].map(show)).filter((x) => !traps.includes(x));
  const q = mcq(prompt, show(answer), [...traps.slice(0, 2), ...rest], o);
  return q;
}
export const tf = (statement, isTrue, o = {}) =>
  ({ type: "tf", prompt: statement, answer: isTrue ? "Betul" : "Salah", choices: ["Betul", "Salah"], lang: o.lang || "ms", ...pickO(o) });
export const tfEn = (statement, isTrue, o = {}) =>
  ({ type: "tf", prompt: statement, answer: isTrue ? "True" : "False", choices: ["True", "False"], lang: "en", ...pickO(o) });
/** Typed numeric answer on the on-screen keypad. */
export const input = (prompt, answer, o = {}) =>
  ({ type: "input", prompt, answer: String(answer), decimal: !Number.isInteger(Number(answer)) || !!o.decimal, unit: o.unit || "", lang: o.lang || "ms", ...pickO(o) });
/** Put tiles in order; answer is the tiles joined. */
export function order(prompt, items, o = {}) {
  const joiner = o.joiner ?? " ";
  let tiles = shuffle(items);
  for (let k = 0; k < 6 && tiles.join(joiner) === items.join(joiner); k++) tiles = shuffle(items);
  return { type: "order", prompt, tiles, parts: [...items], answer: items.join(joiner), joiner, lang: o.lang || "ms", ...pickO(o) };
}
/** Match pairs (left → right). Correct when every pair is matched with at most one slip. */
export const match = (prompt, pairs, o = {}) =>
  ({ type: "match", prompt, pairs, answer: "ok", lang: o.lang || "ms", ...pickO(o) });
/** Sentence with a blank "___" and word choices. */
export function fill(sentence, answer, distractors, o = {}) {
  const q = mcq(sentence, answer, distractors, o);
  return { ...q, type: "fill" };
}

function pickO(o) {
  const out = {};
  for (const k of ["visual", "explain", "say", "unit"]) if (o[k] != null) out[k] = o[k];
  return out;
}

/** Normalise an answer for comparison and for the answer log (server compares a === c). */
export function norm(q, given) {
  const s = String(given ?? "").trim();
  if (q.type === "input") {
    const n = Number(s.replace(/\s+/g, "").replace(",", "."));
    return Number.isFinite(n) && s !== "" ? String(r2(n)) : s;
  }
  if (q.type === "order") return s.replace(/\s+/g, " ");
  return s;
}
export const correctOf = (q) => norm(q, q.answer);
export const isCorrect = (q, given) => norm(q, given) === correctOf(q);

/** Plain-text label of a question (for logs, review lists and TTS). */
export const plain = (html) => String(html ?? "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

/** n distinct questions from a generator (distinct by prompt + answer). */
export function makeSet(gen, n = 10, tries = 60) {
  const out = [], seen = new Set();
  for (let k = 0; out.length < n && k < n * tries; k++) {
    const q = gen();
    const key = plain(q.prompt) + "|" + (q.visual || "").length + "|" + q.answer;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(q);
  }
  while (out.length < n) out.push(gen()); // tiny topics: allow repeats rather than fail
  // avoid the same type three times in a row where possible
  for (let i = 2; i < out.length; i++) {
    if (out[i].type === out[i - 1].type && out[i].type === out[i - 2].type) {
      const j = out.findIndex((x, k) => k > i && x.type !== out[i].type);
      if (j > 0) [out[i], out[j]] = [out[j], out[i]];
    }
  }
  return out;
}

/** Weighted choice between generator functions: pick from [[weight, fn], …]. */
export function blend(...pairs) {
  const total = pairs.reduce((s, [w]) => s + w, 0);
  return () => {
    let r = Math.random() * total;
    for (const [w, fn] of pairs) { if ((r -= w) < 0) return fn(); }
    return pairs[pairs.length - 1][1]();
  };
}
export { rnd, pick, shuffle, sample };
