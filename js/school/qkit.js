// Question kit for Sekolah (Darjah 1–6). A question is plain data so it can be rendered, printed,
// stored for spaced repetition and logged for server-side scoring.
//
// { type: "mcq"|"tf"|"input"|"order"|"match"|"fill",
//   prompt, visual?, choices?, answer, tiles?, joiner?, pairs?, unit?, decimal?, explain?, say?, lang,
//   listen?, alt?, steps?, work? }
// `steps` is a worked solution (plain text lines) and `work` its column layout (trusted HTML from steps.js),
// shown after a wrong answer in Latihan and in the review list.
// `listen` is text the device reads aloud (the child answers from hearing it); `alt` is the prompt used
// where audio is unavailable (printed sheets, devices without speech synthesis).
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
  for (const k of ["visual", "explain", "steps", "work", "say", "unit", "listen", "alt"]) if (o[k] != null) out[k] = o[k];
  return out;
}

/** The same question without audio: uses `alt` (or shows the spoken text) — for print and no-speech devices. */
export function silent(q) {
  if (!q.listen) return q;
  const { listen, alt, ...rest } = q;
  return { ...rest, prompt: alt || `${q.prompt} <b>${listen}</b>` };
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
export const plain = (html) => String(html ?? "")
  .replace(/<sup>(.*?)<\/sup>\s*<sub>(.*?)<\/sub>/g, " $1/$2 ")         // fraction markup → 1/2
  .replace(/<br\s*\/?>|<\/?(div|p|li|ul|ol|h\d)\b[^>]*>/gi, " ")     // block breaks → space
  .replace(/<[^>]+>/g, "")                                              // inline tags (b, i, span) vanish
  .replace(/&nbsp;/g, " ").replace(/\s+/g, " ").replace(/\s+([.,!;:])(?=\s|$)/g, "$1").replace(/(\p{L})\s+\?(?=\s|$)/gu, "$1?").trim();

/** Identity of a question (same prompt, audio, picture and answer = same question). */
export const qKey = (q) => plain(q.prompt) + "|" + (q.listen || "") + "|" + (q.visual || "").length + "|" + q.answer;

/**
 * n distinct questions from a generator. `avoid` (keys of recently seen questions) is honoured as far as
 * the topic allows, so small banks rotate through everything before repeating.
 */
export function makeSet(gen, n = 10, tries = 60, { avoid } = {}) {
  const out = [], seen = new Set(), spare = [];
  for (let k = 0; out.length < n && k < n * tries; k++) {
    const q = gen();
    const key = qKey(q);
    if (seen.has(key)) continue;
    seen.add(key);
    if (avoid?.has(key)) { spare.push(q); continue; }
    out.push(q);
  }
  while (out.length < n && spare.length) out.push(spare.shift()); // the topic has run out of new questions
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

const STOP = new Set(["the", "and", "was", "were", "are", "his", "her", "she", "they", "what", "who", "how", "did", "does", "yang", "dan", "itu", "ini", "apakah", "siapakah", "dengan", "untuk", "dia", "mereka", "kepada", "pada"]);
/**
 * The sentence of a reading passage that answers a question (for "where to find it" explanations):
 * the one containing the answer, else the one sharing most words with the question and answer.
 */
export function evidence(text, question, answer) {
  const t = String(text).replace(/<[^>]+>/g, " ").replace(/\b(Dr|Mr|Mrs|Ms|St|En|Pn)\./g, "$1\u2024"); // titles are not sentence ends
  const sents = (t.match(/[^.!?]+[.!?]+["']?/g) || [t]).map((x) => x.trim().replace(/\u2024/g, "."));
  const low = (x) => String(x).toLowerCase();
  const hit = sents.find((x) => low(x).includes(low(answer)));
  if (hit) return hit;
  const quoted = /['"‘“](\p{L}+)['"’”]/u.exec(question)?.[1]; // "The word 'pupus' means…"
  const inText = quoted && sents.find((x) => low(x).includes(low(quoted)));
  if (inText) return inText;
  // otherwise the sentence sharing most words with the answer (counted triple), then with the question
  const words = (x) => (low(x).match(/\p{L}{3,}/gu) || []).filter((w) => !STOP.has(w));
  const aw = new Set(words(answer)), qw = new Set(words(question));
  let best = null, score = 0;
  for (const x of sents) {
    const ws = words(x), n = ws.filter((w) => aw.has(w) || aw.has(w.replace(/s$/, ""))).length * 3 + ws.filter((w) => qw.has(w)).length;
    if (n > score) { best = x; score = n; }
  }
  return best;
}

/**
 * Rough difficulty score of a question (higher = harder), used by Latihan to adapt to the child:
 * answer format, size of the numbers, decimals/fractions, length of reading, audio and worked steps.
 */
export function difficulty(q) {
  const TYPE = { tf: 1, mcq: 2, fill: 2, order: 3, match: 3, input: 4 };
  const text = plain(q.prompt);
  const nums = (text.replace(/(\d) (?=\d{3}\b)/g, "$1").match(/\d+(?:\.\d+)?/g) || []).map(Number);
  const big = nums.length ? Math.max(...nums) : 0;
  let d = TYPE[q.type] ?? 2;
  if (big > 0) d += Math.log10(big + 1) * 0.8;
  if (/\d\.\d/.test(text) || q.decimal) d += 1;
  if (/\d\/\d|<sup>/.test(q.prompt) || /\d\/\d/.test(q.answer)) d += 0.7;
  if (/class="passage"/.test(q.visual || "")) d += 1 + plain(q.visual).length / 300;
  if (q.listen) d += 0.4;
  if (q.steps) d += Math.min(1.5, q.steps.length / 3);
  return d + Math.min(1.5, text.length / 90);
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
