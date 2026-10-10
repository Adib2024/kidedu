// Question model + generators reused by Games Online and Peta Pengembaraan.
import { choices, nearNumbers, pick, rnd, sample, shuffle } from "../util.js";
import { FRUITS, COLORS, COLOR_OBJECTS, KATA, colorByMs } from "./lexicon.js";
import { emojiGroup, moneyHtml, rm, clockSvg, MONEY, sw, swatch } from "./visuals.js";

/**
 * Build a multiple-choice question.
 * correct/distractors are raw values; `label(v)` renders each option (HTML allowed).
 */
export function Q(prompt, visual, correct, distractors, o = {}) {
  const key = o.key || ((v) => String(v));
  return {
    prompt,
    visual: visual ?? "",
    vclass: o.vclass || "",
    say: o.say ?? prompt.replace(/<[^>]+>/g, ""),
    lang: o.lang || "ms",
    optCls: o.optCls || "",
    options: choices(correct, distractors, o.n || 4, key).map((v) => ({ value: key(v), label: o.label ? o.label(v) : String(v) })),
    answer: key(correct),
    explain: o.explain || "",
  };
}

/** Generate n unique questions from fn (dedupe by prompt+visual). */
export function make(n, fn) {
  const out = [];
  const seen = new Set();
  let guard = 0;
  while (out.length < n && guard++ < n * 30) {
    const q = fn(out.length);
    // same prompt is fine if the options differ (e.g. "which is biggest?")
    const k = q.prompt + "|" + q.visual + "|" + q.answer + "|" + q.options.map((o) => o.value).sort().join(",");
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(q);
  }
  return out;
}
/** Turn a fixed bank of [prompt, correct, [wrongs], visual?] into questions. */
export function fromBank(bank, n = 10, o = {}) {
  return sample(bank, Math.min(n, bank.length)).map(([p, c, w, v]) => Q(p, v || "", c, w, o));
}

// ---------------- maths ----------------
const EMO = ["🍎", "🍓", "🐤", "🍬", "⭐", "🎈", "🐟", "🌸", "🍩", "🐞", "🧁", "🚗"];

export const genTimes = (t) => () => {
  const m = rnd(1, 12);
  const tt = t || rnd(2, 12);
  const ans = tt * m;
  if (Math.random() < 0.25) {
    return Q(`${tt} × ? = ${ans}`, "", m, nearNumbers(m, 3, 3, 1), { vclass: "text", say: `${tt} darab berapa sama dengan ${ans}` });
  }
  return Q(`${tt} × ${m} = ?`, "", ans, [ans + tt, ans - tt, ans + 1, ans - 1, tt * (m + 2)].filter((x) => x > 0), { say: `${tt} darab ${m}` });
};
export const genDivide = () => {
  const t = rnd(2, 10), m = rnd(1, 10);
  return Q(`${t * m} ÷ ${t} = ?`, "", m, nearNumbers(m, 3, 3, 1), { say: `${t * m} bahagi ${t}` });
};

export function genAdd(max, visual = false) {
  return () => {
    const a = rnd(0, max - 1), b = rnd(1, max - a);
    const e = pick(EMO);
    const v = visual ? `${emojiGroup(e, a)} <b style="font-size:.6em">+</b> ${emojiGroup(e, b)}` : "";
    return Q(`${a} + ${b} = ?`, v, a + b, nearNumbers(a + b, 3, 3), { say: `${a} tambah ${b}` });
  };
}
export function genSub(max, visual = false) {
  return () => {
    const a = rnd(2, max), b = rnd(1, a);
    const e = pick(EMO);
    const v = visual ? `${emojiGroup(e, a)}<div style="font-size:.4em">ambil ${b}</div>` : "";
    return Q(`${a} − ${b} = ?`, v, a - b, nearNumbers(a - b, 3, 3), { say: `${a} tolak ${b}` });
  };
}
export const genMissing = (max) => () => {
  const a = rnd(1, max - 1), b = rnd(1, max - a);
  return Math.random() < 0.5
    ? Q(`${a} + ? = ${a + b}`, "", b, nearNumbers(b, 3, 3), { say: `${a} tambah berapa sama dengan ${a + b}` })
    : Q(`? − ${b} = ${a}`, "", a + b, nearNumbers(a + b, 3, 4), { say: `berapa tolak ${b} sama dengan ${a}` });
};
export const genMixed100 = () => {
  if (Math.random() < 0.5) {
    const a = rnd(10, 80), b = rnd(5, 99 - a);
    return Q(`${a} + ${b} = ?`, "", a + b, [a + b + 10, a + b - 10, a + b + 1, a + b - 1]);
  }
  const a = rnd(20, 99), b = rnd(5, a - 1);
  return Q(`${a} − ${b} = ?`, "", a - b, [a - b + 10, a - b - 10, a - b + 1, a - b - 1].filter((x) => x >= 0));
};

const NAMES = ["Ali", "Aina", "Danish", "Mei Ling", "Ravi", "Sofea", "Haziq", "Nurul", "Adam", "Hana"];
const THINGS = [["epal", "🍎"], ["guli", "🔵"], ["gula-gula", "🍬"], ["belon", "🎈"], ["buku", "📘"], ["pensel", "✏️"], ["kek cawan", "🧁"], ["bunga", "🌸"]];
export const genStory = (max = 20) => () => {
  const n = pick(NAMES), [t, e] = pick(THINGS);
  const kind = rnd(0, 3);
  if (kind === 0) {
    const a = rnd(1, max / 2), b = rnd(1, max / 2);
    return Q(`${n} ada ${a} biji ${t}. Ibu beri ${b} lagi. Berapa semuanya?`, e, a + b, nearNumbers(a + b, 3, 3));
  }
  if (kind === 1) {
    const a = rnd(3, max), b = rnd(1, a - 1);
    return Q(`${n} ada ${a} ${t}. ${b} diberi kepada kawan. Tinggal berapa?`, e, a - b, nearNumbers(a - b, 3, 3));
  }
  if (kind === 2) {
    const g = rnd(2, 5), each = rnd(2, 5);
    return Q(`Ada ${g} kotak. Setiap kotak ada ${each} ${t}. Berapa semuanya?`, `${e}`.repeat(Math.min(g, 5)), g * each, nearNumbers(g * each, 3, 4, 1));
  }
  const p = rnd(2, 4), each = rnd(2, 5);
  return Q(`${p * each} ${t} dibahagi sama rata kepada ${p} orang. Seorang dapat berapa?`, e, each, nearNumbers(each, 3, 2, 1));
};

export const genCount = (max = 10) => () => {
  const n = rnd(1, max), e = pick(EMO);
  return Q("Berapa banyak semuanya?", emojiGroup(e, n), n, nearNumbers(n, 3, 2, 1), { say: "Kira. Berapa banyak semuanya?" });
};
export const genBiggest = () => {
  const nums = sample(Array.from({ length: 99 }, (_, i) => i + 1), 4);
  const big = Math.random() < 0.5;
  const ans = big ? Math.max(...nums) : Math.min(...nums);
  return Q(big ? "Nombor mana paling BESAR?" : "Nombor mana paling KECIL?", "", ans, nums.filter((x) => x !== ans));
};
export const genPattern = () => {
  const step = pick([1, 2, 3, 5, 10]), start = rnd(0, 20), len = 4;
  const seq = Array.from({ length: len }, (_, i) => start + i * step);
  const ans = start + len * step;
  return Q("Apakah nombor seterusnya?", `<span style="font-size:.6em">${seq.join(", ")}, ?</span>`, ans, nearNumbers(ans, 3, step + 1));
};
export const genBeforeAfter = () => {
  const n = rnd(1, 99), after = Math.random() < 0.5;
  return Q(after ? `Nombor selepas ${n} ialah?` : `Nombor sebelum ${n} ialah?`, "", after ? n + 1 : n - 1, [n, after ? n - 1 : n + 1, n + 2, n - 2].filter((x) => x >= 0));
};
export const genPlace = () => {
  const n = rnd(11, 99), tens = Math.random() < 0.5;
  return Q(tens ? `Berapa PULUH dalam ${n}?` : `Berapa SA dalam ${n}?`, `<span class="qvisual text">${n}</span>`, tens ? Math.floor(n / 10) : n % 10, [Math.floor(n / 10), n % 10, (n % 10) + 1, Math.floor(n / 10) + 1, n].filter((x) => x !== (tens ? Math.floor(n / 10) : n % 10)));
};
export const genFraction = () => {
  const half = Math.random() < 0.5;
  const base = half ? rnd(1, 10) * 2 : rnd(1, 6) * 4;
  const ans = half ? base / 2 : base / 4;
  return Q(half ? `Separuh daripada ${base} = ?` : `Suku daripada ${base} = ?`, emojiGroup(pick(EMO), Math.min(base, 20)), ans, nearNumbers(ans, 3, 3, 1));
};

// ---------------- money (sen) ----------------
export const genMoneyCount = (big = false) => () => {
  const pool = big ? MONEY.filter((m) => m.v >= 100 && m.v <= 2000) : MONEY.filter((m) => m.v <= 100);
  const items = Array.from({ length: rnd(2, 4) }, () => pick(pool).v).sort((a, b) => b - a);
  const total = items.reduce((a, b) => a + b, 0);
  const step = big ? 100 : 10;
  const wrong = [total + step, total - step, total + 2 * step, total + 5 * step].filter((x) => x > 0);
  return Q("Berapakah jumlah duit ini?", moneyHtml(items), total, wrong, { label: rm, key: String });
};
const SHOP = [["🍦", "aiskrim"], ["🍞", "roti"], ["🧃", "jus"], ["🍭", "lolipop"], ["🎈", "belon"], ["🥤", "air"], ["🍪", "biskut"], ["✏️", "pensel"], ["📒", "buku nota"], ["🧸", "anak patung"]];
export const genChange = () => {
  const [e, t] = pick(SHOP);
  const price = pick([50, 80, 120, 150, 200, 250, 300, 350, 450]);
  const pay = price <= 100 ? pick([100, 200]) : pick([500, 1000]);
  const ans = pay - price;
  return Q(`Harga ${t} ${rm(price)}. Kamu bayar ${rm(pay)}. Berapa baki?`, `${e}`, ans, [ans + 50, ans - 50, ans + 100, ans + 10].filter((x) => x > 0), { label: rm });
};
export const genAfford = () => {
  const [e, t] = pick(SHOP);
  const price = pick([150, 250, 350, 600, 800]);
  const sets = [];
  const ok = [];
  // build a correct set >= price and 3 sets < price
  const pool = [50, 100, 500, 20, 10];
  let s = 0; while (s < price) { const v = pick(pool.filter((x) => x <= 500)); ok.push(v); s += v; }
  sets.push(ok);
  let tries = 0;
  while (sets.length < 4 && tries++ < 100) {
    const n = rnd(1, 3), w = Array.from({ length: n }, () => pick([10, 20, 50, 100]));
    if (w.reduce((a, b) => a + b, 0) < price) sets.push(w);
  }
  const key = (v) => v.join("-");
  return Q(`${e} ${t} berharga ${rm(price)}. Duit mana CUKUP untuk beli?`, "", ok, sets.slice(1), { key, label: (v) => moneyHtml([...v].sort((a, b) => b - a)) });
};

// ---------------- clock ----------------
const JAM_BM = (h, m) => (m === 0 ? `${h}:00` : `${h}:${String(m).padStart(2, "0")}`);
export const genClock = (hard = false) => () => {
  const h = rnd(1, 12), m = hard ? pick([0, 15, 30, 45, 5, 10, 20, 40, 50]) : pick([0, 30]);
  const wrong = [JAM_BM(h, (m + 30) % 60), JAM_BM((h % 12) + 1, m), JAM_BM(h === 1 ? 12 : h - 1, m), JAM_BM(m / 5 || 12, h * 5 % 60)];
  return Q("Pukul berapa sekarang?", clockSvg(h, m), JAM_BM(h, m), wrong, { say: "Pukul berapa sekarang?" });
};
const HARI = ["Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu", "Ahad"];
const BULAN = ["Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September", "Oktober", "November", "Disember"];
export const genCalendar = () => {
  const k = rnd(0, 3);
  if (k === 0) { const i = rnd(0, 6); return Q(`Hari selepas ${HARI[i]} ialah?`, "📅", HARI[(i + 1) % 7], HARI.filter((_, j) => j !== (i + 1) % 7)); }
  if (k === 1) { const i = rnd(0, 6); return Q(`Hari sebelum ${HARI[i]} ialah?`, "📅", HARI[(i + 6) % 7], HARI.filter((_, j) => j !== (i + 6) % 7)); }
  if (k === 2) { const i = rnd(0, 11); return Q(`Bulan selepas ${BULAN[i]} ialah?`, "🗓️", BULAN[(i + 1) % 12], BULAN.filter((_, j) => j !== (i + 1) % 12)); }
  return pick([
    Q("Berapa hari dalam seminggu?", "📅", 7, [5, 6, 10]),
    Q("Berapa bulan dalam setahun?", "🗓️", 12, [10, 7, 24]),
    Q("Berapa minit dalam sejam?", "⏰", 60, [30, 100, 24]),
    Q("Berapa jam dalam sehari?", "🌞🌙", 24, [12, 60, 7]),
  ]);
};

// ---------------- colours ----------------
const SOLID = COLORS.filter((c) => c.ms !== "Putih");
export const genColorName = (lang = "ms") => () => {
  const c = pick(SOLID);
  const L = (x) => (lang === "en" ? x.en : x.ms);
  return Q(lang === "en" ? "What colour is this?" : "Apakah warna ini?", swatch(c.hex), L(c), SOLID.map(L), { lang, say: lang === "en" ? "What colour is this?" : "Apakah warna ini?" });
};
export const genColorFind = () => {
  const c = pick(SOLID);
  return Q(`Cari warna <b>${c.ms}</b>!`, "", c.hex, SOLID.map((x) => x.hex), { label: (h) => `<span class="sw" style="width:56px;height:56px;background:${h}"></span>`, say: `Cari warna ${c.ms}` });
};
export const genColorObject = () => {
  const [e, ms] = pick(COLOR_OBJECTS);
  return Q("Apakah warna objek ini?", e, ms, SOLID.map((c) => c.ms), { label: (m) => `${sw(colorByMs(m).hex)} ${m}` });
};
const MIX = [["Merah", "Kuning", "Oren"], ["Biru", "Kuning", "Hijau"], ["Merah", "Biru", "Ungu"], ["Merah", "Putih", "Merah Jambu"], ["Hitam", "Putih", "Kelabu"]];
export const genColorMix = () => {
  const [a, b, r] = pick(MIX);
  const [x, y] = Math.random() < 0.5 ? [a, b] : [b, a];
  const v = `${swatch(colorByMs(x).hex)} <b>+</b> ${swatch(colorByMs(y).hex)}`;
  return Q(`${x} + ${y} = ?`, `<span style="font-size:.5em">${v}</span>`, r, SOLID.map((c) => c.ms), { label: (m) => `${sw(colorByMs(m).hex)} ${m}`, say: `${x} campur ${y} jadi warna apa?` });
};
const RAINBOW = ["Merah", "Oren", "Kuning", "Hijau", "Biru", "Indigo", "Ungu"];
export const RAINBOW_BANK = [
  ["Berapa warna dalam pelangi?", 7, [5, 6, 8], "🌈"],
  ["Warna PERTAMA pelangi (paling atas) ialah?", "Merah", ["Biru", "Ungu", "Hijau"], "🌈"],
  ["Warna TERAKHIR pelangi ialah?", "Ungu", ["Merah", "Kuning", "Oren"], "🌈"],
  ["Warna selepas Kuning dalam pelangi?", "Hijau", ["Merah", "Oren", "Ungu"], "🌈"],
  ["Warna mana TIADA dalam pelangi?", "Coklat", ["Merah", "Hijau", "Biru"], "🌈"],
  ["Warna sebelum Hijau dalam pelangi?", "Kuning", ["Biru", "Merah", "Ungu"], "🌈"],
  ["Bila pelangi selalu muncul?", "Lepas hujan, bila matahari keluar", ["Waktu malam", "Bila salji turun", "Dalam gua"], "🌦️"],
  ["Warna antara Merah dan Kuning dalam pelangi?", "Oren", ["Hijau", "Biru", "Ungu"], "🌈"],
  ["Warna langit pada siang yang cerah?", "Biru", ["Hijau", "Merah", "Hitam"], "☀️"],
  ["Warna daun yang segar?", "Hijau", ["Ungu", "Biru", "Merah Jambu"], "🍃"],
];
export { RAINBOW };

// ---------------- fruits ----------------
export const genFruitName = () => { const f = pick(FRUITS); return Q("Apakah nama buah ini?", f.e, f.ms, FRUITS.map((x) => x.ms)); };
export const genFruitPick = () => { const f = pick(FRUITS); return Q(`Cari buah <b>${f.ms}</b>!`, "", f.e, FRUITS.map((x) => x.e), { optCls: "big-emoji", say: `Cari buah ${f.ms}` }); };

// ---------------- reading (BM) ----------------
export const genWordPic = () => { const k = pick(KATA); return Q("Gambar ini ialah…", k.e, k.w, KATA.map((x) => x.w)); };
export const genPicWord = () => { const k = pick(KATA); return Q(`Baca: <b>${k.w}</b>. Pilih gambar yang betul.`, "", k.e, KATA.map((x) => x.e), { optCls: "big-emoji", say: `Pilih gambar ${k.w}` }); };
export const genSyllable = () => {
  const k = pick(KATA.filter((x) => x.s.length >= 2));
  return Q(`${k.s.join(" + ")} = ?`, k.e, k.w, KATA.map((x) => x.w), { say: `${k.s.join(", ")}. Jadi perkataan apa?` });
};
export const genFirstSyl = () => {
  const k = pick(KATA.filter((x) => x.s.length >= 2));
  return Q(`Perkataan "${k.w}" bermula dengan suku kata…`, k.e, k.s[0], KATA.map((x) => x.s[0]));
};
export const genMissingSyl = () => {
  const k = pick(KATA.filter((x) => x.s.length >= 2));
  const i = rnd(0, k.s.length - 1);
  const shown = k.s.map((s, j) => (j === i ? "__" : s)).join("");
  return Q(`Lengkapkan: <b>${shown}</b>`, k.e, k.s[i], [...new Set(KATA.flatMap((x) => x.s))]);
};
export const SENTENCE_BANK = [
  ["Ali makan ___ di kantin.", "roti", ["kasut", "bulan", "kereta"], "🍞"],
  ["Adik minum ___ setiap pagi.", "susu", ["batu", "topi", "kunci"], "🥛"],
  ["Kucing itu suka makan ___.", "ikan", ["buku", "bola", "payung"], "🐱"],
  ["Ibu memakai ___ kerana hujan.", "payung", ["roti", "gigi", "bola"], "☂️"],
  ["Pada waktu malam, ___ bersinar di langit.", "bulan", ["kasut", "pisang", "rumah"], "🌙"],
  ["Abang menendang ___ di padang.", "bola", ["madu", "susu", "pensel"], "⚽"],
  ["Saya menulis dengan ___.", "pensel", ["epal", "kuda", "bunga"], "✏️"],
  ["Lebah menghasilkan ___.", "madu", ["susu", "batu", "baju"], "🐝"],
  ["Ayah memandu ___ ke pejabat.", "kereta", ["kapal", "kucing", "buku"], "🚗"],
  ["Monyet suka makan ___.", "pisang", ["kasut", "kunci", "jam"], "🐒"],
  ["Kakak menyiram ___ di taman.", "bunga", ["roti", "kereta", "bola"], "🌸"],
  ["Kita gosok ___ sebelum tidur.", "gigi", ["kaki", "topi", "baju"], "🪥"],
  ["Adik memakai ___ ke sekolah.", "kasut", ["madu", "padi", "ikan"], "👟"],
  ["Pak tani menanam ___ di sawah.", "padi", ["bola", "kunci", "jam"], "🌾"],
];
