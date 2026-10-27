// Sekolah (Darjah 1–6): subjects × years × topics, and the ids used for progress + server scoring.
// Activity id: sek:<subject>-t<year>:<topic>-<stage>  (family "sek:<subject>-t<year>", item "<topic>-<stage>")
import { MATH } from "./gen-math.js";
import { BM } from "./gen-bm.js";
import { EN } from "./gen-en.js";
import { SAINS } from "./gen-sains.js";
import { makeSet } from "./qkit.js";

export const SUBJECTS = [
  { id: "mat", title: "Matematik", short: "Mat", emoji: "🧮", color: "#ddf3ff", accent: "#0b78c2", boss: "🐉", bossName: "Naga Nombor", lang: "ms", data: MATH },
  { id: "bm", title: "Bahasa Melayu", short: "BM", emoji: "📝", color: "#ffe0f0", accent: "#d1137a", boss: "👹", bossName: "Gergasi Kata", lang: "ms", data: BM },
  { id: "en", title: "English", short: "English", emoji: "🔤", color: "#ecfbd6", accent: "#3b7f0c", boss: "🦖", bossName: "Word Rex", lang: "en", data: EN },
  { id: "sai", title: "Sains", short: "Sains", emoji: "🔬", color: "#fff1d9", accent: "#c25a00", boss: "🦠", bossName: "Kuman Gergasi", lang: "ms", data: SAINS },
];
export const YEARS = [1, 2, 3, 4, 5, 6];
export const STAGES = [
  { id: "latihan", title: "Latihan", en: "Practice", emoji: "🎯", desc: "Belajar tanpa tekanan — ada penerangan bila salah." },
  { id: "masa", title: "Cabaran Masa", en: "Time Challenge", emoji: "⏱️", desc: "Jawab 10 soalan sebelum masa tamat. Combo untuk bonus!" },
  { id: "bos", title: "Lawan Bos", en: "Boss Battle", emoji: "⚔️", desc: "3 nyawa ❤️. Kalahkan bos dengan jawapan betul!" },
];
export const QUESTIONS_PER_ROUND = 10;
/** Seconds for a time challenge by year (younger pupils read more slowly). */
export const timeLimit = (year) => (year <= 2 ? 150 : year <= 4 ? 120 : 100);

export const subjectById = (id) => SUBJECTS.find((s) => s.id === id);
export const familyId = (subject, year) => `sek:${subject}-t${year}`;
export const activityId = (subject, year, topic, stage) => `${familyId(subject, year)}:${topic}-${stage}`;
export const REVIEW_ID = "sek:ulang-kaji";
export const DAILY_FAMILY = "sek:harian";

/** Topics for a subject/year as objects. */
export function topics(subject, year) {
  const s = subjectById(subject);
  return (s?.data[year] || []).map(([id, title, emoji, gen], i) => ({ id, title, emoji, gen, index: i, subject, year, lang: s.lang }));
}
export const topicById = (subject, year, id) => topics(subject, year).find((t) => t.id === id) || null;
/** A round of questions for a topic (always QUESTIONS_PER_ROUND, distinct where possible). */
export const roundFor = (t, n = QUESTIONS_PER_ROUND) => makeSet(t.gen, n).map((q) => ({ ...q, lang: q.lang || t.lang, topic: `${t.subject}-t${t.year}:${t.id}` }));

/** Parse "sek:mat-t3:pecahan-setara-bos" → parts (null if not a chapter attempt). */
export function parseActivity(id) {
  const m = /^sek:(mat|bm|en|sai)-t([1-6]):(.+)-(latihan|masa|bos)$/.exec(id || "");
  return m ? { subject: m[1], year: Number(m[2]), topic: m[3], stage: m[4] } : null;
}
/** Every family and its allowed items — used to generate the server catalogue. */
export function catalogRows() {
  const rows = [];
  for (const s of SUBJECTS) for (const y of YEARS) {
    rows.push({ id: familyId(s.id, y), category: "sekolah", title: `${s.title} Tahun ${y}`, kind: "quiz", qc: QUESTIONS_PER_ROUND,
      items: topics(s.id, y).flatMap((t) => STAGES.map((st) => `${t.id}-${st.id}`)) });
  }
  rows.push({ id: REVIEW_ID, category: "sekolah", title: "Ulang Kaji Pintar", kind: "quiz", qc: QUESTIONS_PER_ROUND, items: null });
  rows.push({ id: DAILY_FAMILY, category: "sekolah", title: "Cabaran Harian", kind: "quiz", qc: QUESTIONS_PER_ROUND, items: null, pattern: "^[0-9]{4}-[0-9]{2}-[0-9]{2}$" });
  return rows;
}
/** Default school year from age (7 → Tahun 1 … 12 → Tahun 6; younger → 0 = Prasekolah). */
export const gradeFromAge = (age) => (!age ? 0 : Math.max(0, Math.min(6, Number(age) - 6)));
export const gradeOf = (child) => (child?.grade != null && child.grade !== "" ? Number(child.grade) : gradeFromAge(child?.age));
export const gradeLabel = (g) => (g ? `Tahun ${g}` : "Prasekolah");
