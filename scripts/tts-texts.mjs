// Every sentence Playora can speak that is worth pre-recording with a natural voice.
// Fixed text (stories, tips, word & sentence banks) is listed in full. Question generators are sampled:
// a generator whose spoken prompts stay within a small set (word banks) is recorded; one that makes
// endless variations (random sums) is left to the device voice.
import { installNodeEnv } from "./node-env.mjs";
installNodeEnv();

const { normSay, clipKey, sayLang } = await import("../js/voicekey.js");
const { BOOKS } = await import("../js/data/books.js");
const { TIPS, tipBlocks } = await import("../js/data/tips.js");
const { GAMES } = await import("../js/data/games.js");
const { MAPS } = await import("../js/data/maps.js");
const C = await import("../js/school/curriculum.js");
const { perkataan } = await import("../js/school/gen-math.js");
const { plain } = await import("../js/school/qkit.js");

export const SMALL_SET = 160;     // ≤ this many different spoken prompts in the sample → record them
const SAMPLE = 600;               // questions sampled per generator

export function collectTexts({ sample = SAMPLE, seed = 20261027 } = {}) {
  // deterministic sampling: the same app always yields the same list (so clips are reused, not re-made)
  const realRandom = Math.random;
  let st = seed >>> 0;
  Math.random = () => { st = (st + 0x6d2b79f5) >>> 0; let t = st; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  try { return collect(sample); } finally { Math.random = realRandom; }
}
function collect(sample) {
  const out = new Map(); // key → { lang, text, source }
  const skipped = [];
  const add = (lang, text, source) => {
    const t = normSay(text);
    if (!t || t.length > 900) return;
    const key = clipKey(lang, t);
    if (!out.has(key)) out.set(key, { key, lang: sayLang(lang), text: t, source });
  };
  const addSampled = (source, gen) => {
    const prompts = new Map(), listens = new Map();
    for (let i = 0; i < sample; i++) {
      for (const q of [].concat(gen())) {
        if (!q) continue;
        const lang = sayLang(q.lang);
        if (q.listen) listens.set(clipKey(lang, q.listen), [lang, q.listen]);
        const say = normSay(q.say ?? plain(q.prompt));
        if (say) prompts.set(clipKey(lang, say), [lang, say]);
      }
    }
    for (const [lang, t] of listens.values()) add(lang, t, source + " (dengar)"); // listening words are always recorded
    if (prompts.size <= SMALL_SET) for (const [lang, t] of prompts.values()) add(lang, t, source);
    else skipped.push({ source, variants: prompts.size });
  };

  // stories: every page, the lesson, the quiz
  for (const b of BOOKS) {
    for (const p of b.pages) add("ms", p.text, `Buku: ${b.title}`);
    add("ms", `Pengajaran: ${b.moral}`, `Buku: ${b.title}`);
    for (const [q] of b.quiz || []) add("ms", q, `Buku: ${b.title} (kuiz)`);
  }
  // parenting tips (Zon Ibu audio)
  for (const t of TIPS) for (const x of tipBlocks(t)) add("ms", x, `Tips: ${t.title}`);
  // games & map stations
  for (const g of GAMES) for (const [i, l] of (g.levels || []).entries()) if (l.gen) addSampled(`Games: ${g.title} ${i + 1}`, l.gen);
  for (const m of MAPS) for (const s of m.stations || []) if (s.type === "quiz" && s.gen) addSampled(`Peta: ${m.title} — ${s.name}`, s.gen);
  // Sekolah: every chapter
  for (const s of C.SUBJECTS) for (const y of C.YEARS) for (const t of C.topics(s.id, y)) addSampled(`Sekolah: ${s.short} T${y} ${t.title}`, () => { const q = t.gen(); return { ...q, lang: q.lang || t.lang }; });
  // numbers heard in "Dengar nombor" (Tahun 1–2) and spoken digits
  for (let n = 0; n <= 999; n++) add("ms", perkataan(n), "Nombor (perkataan)");
  for (let n = 0; n <= 100; n++) add("ms", String(n), "Nombor (digit)");
  // fixed phrases
  for (const t of ["Cemerlang!", "Bagus sekali!", "Syabas, teruskan!", "Cuba lagi ya!"]) add("ms", t, "Keputusan");
  for (let n = 2; n <= 40; n++) add("ms", `Tahniah! Naik ke tahap ${n}`, "Naik tahap");
  return { texts: [...out.values()], skipped };
}

export const charCount = (texts) => texts.reduce((n, t) => n + t.text.length, 0);
