// Matematik Tahun 1–6 (topik selaras KSSR). Every generator returns one question (see qkit.js).
import { mcq, mcqNum, tf, input, order, match, fill, fmt, r2, blend, rnd, pick, shuffle, sample } from "./qkit.js";
import { clockSvg, moneyHtml, rm, SHAPES, shapeSvg } from "../data/visuals.js";

// ---------------------------------------------------------------- helpers
const UNIT = ["kosong", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "lapan", "sembilan"];
/** Malay number words up to 999 999 999 (e.g. 312 → "tiga ratus dua belas"). */
export function perkataan(n) {
  if (n < 10) return UNIT[n];
  if (n === 10) return "sepuluh";
  if (n === 11) return "sebelas";
  if (n < 20) return `${UNIT[n - 10]} belas`;
  if (n < 100) return `${UNIT[Math.floor(n / 10)]} puluh${n % 10 ? " " + UNIT[n % 10] : ""}`;
  const join = (head, rest) => (rest ? `${head} ${perkataan(rest)}` : head);
  if (n < 1000) { const h = Math.floor(n / 100); return join(h === 1 ? "seratus" : `${UNIT[h]} ratus`, n % 100); }
  if (n < 1e6) { const t = Math.floor(n / 1000); return join(t === 1 ? "seribu" : `${perkataan(t)} ribu`, n % 1000); }
  const j = Math.floor(n / 1e6);
  return join(j === 1 ? "sejuta" : `${perkataan(j)} juta`, n % 1e6);
}
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const frac = (a, b) => `<span class="frac"><sup>${a}</sup><sub>${b}</sub></span>`;
const fracTxt = (a, b) => `${a}/${b}`;
const simp = (a, b) => { const g = gcd(a, b); return [a / g, b / g]; };
const isPrime = (n) => { if (n < 2) return false; for (let k = 2; k * k <= n; k++) if (n % k === 0) return false; return true; };
const box = (t) => `<span class="qbox">${t}</span>`;
const big = (t) => `<span class="qbig">${t}</span>`;
const PEOPLE = ["Ali", "Siti", "Mei Ling", "Ravi", "Aina", "Hafiz", "Kavitha", "Daniel", "Nurul", "Ah Kow"];
const THINGS = [["guli", "biji"], ["pensel", "batang"], ["buku", "buah"], ["epal", "biji"], ["setem", "keping"], ["gula-gula", "biji"], ["belon", "biji"], ["kad", "keping"]];

/** Fraction bar: `n` of `d` parts shaded. */
export function fractionBar(n, d, color = "#ff8cc6") {
  const w = 240, h = 46, cw = w / d;
  return `<svg viewBox="0 0 ${w + 4} ${h + 4}" width="${w}" class="qsvg" role="img" aria-label="${n} daripada ${d} bahagian berlorek">${Array.from({ length: d }, (_, i) =>
    `<rect x="${2 + i * cw}" y="2" width="${cw}" height="${h}" fill="${i < n ? color : "#fff"}" stroke="#34203f" stroke-width="2.5"/>`).join("")}</svg>`;
}
/** Pie with `n` of `d` slices shaded. */
export function fractionPie(n, d, color = "#7ccf2e") {
  const R = 60, cx = 64, cy = 64;
  const pt = (k) => [cx + R * Math.cos((k / d) * 2 * Math.PI - Math.PI / 2), cy + R * Math.sin((k / d) * 2 * Math.PI - Math.PI / 2)];
  const slices = Array.from({ length: d }, (_, k) => {
    const [x1, y1] = pt(k), [x2, y2] = pt(k + 1);
    return `<path d="M${cx},${cy} L${x1.toFixed(2)},${y1.toFixed(2)} A${R},${R} 0 0 1 ${x2.toFixed(2)},${y2.toFixed(2)} Z" fill="${k < n ? color : "#fff"}" stroke="#34203f" stroke-width="2.5"/>`;
  }).join("");
  return `<svg viewBox="0 0 128 128" width="128" class="qsvg" role="img" aria-label="${n} daripada ${d} bahagian berlorek">${d === 1 ? `<circle cx="64" cy="64" r="60" fill="${n ? color : "#fff"}" stroke="#34203f" stroke-width="2.5"/>` : slices}</svg>`;
}
/** Number line from a to b (step), with an arrow on `mark`. */
export function numberLine(a, b, step, mark) {
  const W = 300, pad = 18, n = Math.round((b - a) / step);
  const x = (v) => pad + ((v - a) / (b - a)) * (W - 2 * pad);
  const ticks = Array.from({ length: n + 1 }, (_, i) => {
    const v = r2(a + i * step), X = x(v), label = i === 0 || i === n;
    return `<line x1="${X}" y1="34" x2="${X}" y2="${label ? 50 : 46}" stroke="#34203f" stroke-width="2"/>${label ? `<text x="${X}" y="68" text-anchor="middle" font-size="14" font-weight="700" fill="#34203f">${fmt(v)}</text>` : ""}`;
  }).join("");
  return `<svg viewBox="0 0 ${W} 74" width="${W}" class="qsvg" role="img" aria-label="Garis nombor"><line x1="${pad}" y1="40" x2="${W - pad}" y2="40" stroke="#34203f" stroke-width="3"/>${ticks}
    <path d="M${x(mark)} 30 l-7 -12 h14 z" fill="#d1137a"/></svg>`;
}
/** Rectangle with side labels (for perimeter/area). */
export function rectSvg(w, h, unit = "cm", fill = "#ddf3ff") {
  const s = 150 / Math.max(w, h), W = Math.max(40, w * s), H = Math.max(30, h * s);
  return `<svg viewBox="0 0 ${W + 80} ${H + 50}" width="${Math.min(260, W + 80)}" class="qsvg" role="img" aria-label="Segi empat ${w} ${unit} kali ${h} ${unit}">
    <rect x="40" y="10" width="${W}" height="${H}" fill="${fill}" stroke="#34203f" stroke-width="3"/>
    <text x="${40 + W / 2}" y="${H + 34}" text-anchor="middle" font-size="15" font-weight="700" fill="#34203f">${w} ${unit}</text>
    <text x="34" y="${10 + H / 2 + 5}" text-anchor="end" font-size="15" font-weight="700" fill="#34203f">${h} ${unit}</text></svg>`;
}
/** Simple bar chart. */
export function barChart(labels, values, unit = "") {
  const max = Math.max(...values), W = 300, H = 160, bw = 44, gap = (W - 30 - labels.length * bw) / (labels.length + 1);
  const colors = ["#ff8cc6", "#3db6ff", "#7ccf2e", "#ffb020", "#8b5cf6"];
  return `<svg viewBox="0 0 ${W} ${H + 40}" width="${W}" class="qsvg" role="img" aria-label="Carta palang">
    <line x1="28" y1="8" x2="28" y2="${H}" stroke="#34203f" stroke-width="2"/><line x1="28" y1="${H}" x2="${W}" y2="${H}" stroke="#34203f" stroke-width="2"/>
    ${labels.map((l, i) => { const bh = (values[i] / max) * (H - 24), X = 28 + gap + i * (bw + gap);
      return `<rect x="${X}" y="${H - bh}" width="${bw}" height="${bh}" rx="5" fill="${colors[i % 5]}"/><text x="${X + bw / 2}" y="${H - bh - 5}" text-anchor="middle" font-size="13" font-weight="800" fill="#34203f">${values[i]}${unit}</text><text x="${X + bw / 2}" y="${H + 18}" text-anchor="middle" font-size="12" font-weight="700" fill="#34203f">${l}</text>`; }).join("")}</svg>`;
}

// ---------------------------------------------------------------- reusable topic pieces
const placeName = ["sa", "puluh", "ratus", "ribu", "puluh ribu", "ratus ribu", "juta"];
function placeValue(max, places) {
  return () => {
    let n = rnd(Math.max(10, Math.floor(max / 10)), max - 1);
    const s = String(n);
    const pos = rnd(0, Math.min(places, s.length) - 1); // index from the right
    const digit = Number(s[s.length - 1 - pos]);
    if (digit === 0) n += 10 ** pos;
    const ss = String(n), d = Number(ss[ss.length - 1 - pos]);
    return pick([
      () => mcq(`Apakah nilai digit ${d} pada tempat <b>${placeName[pos]}</b> dalam nombor ${fmt(n)}?`, fmt(d * 10 ** pos), [d, d * 10, d * 100, d * 1000, d * 10000].map(fmt), { explain: `${d} di tempat ${placeName[pos]} bernilai ${fmt(d * 10 ** pos)}.` }),
      () => mcq(`Dalam nombor ${fmt(n)}, digit ${d} berada di tempat…`, placeName[pos], placeName.slice(0, Math.max(3, places)), { explain: `Kira dari kanan: sa, puluh, ratus, ribu…` }),
    ])();
  };
}
function compareNums(max) {
  return blend(
    [2, () => { const ns = sample(Array.from({ length: 40 }, () => rnd(1, max)), 4); const b = Math.max(...ns); return mcq("Nombor manakah yang <b>paling besar</b>?", fmt(b), ns.map(fmt)); }],
    [2, () => { const ns = [...new Set(Array.from({ length: 6 }, () => rnd(1, max)))].slice(0, 4); return order("Susun dari <b>terkecil</b> hingga <b>terbesar</b>.", [...ns].sort((a, b) => a - b).map(fmt), { joiner: " | " }); }],
    [1, () => { const a = rnd(1, max), b = rnd(1, max); const s = a > b ? ">" : a < b ? "<" : "="; return mcq(`Pilih simbol yang betul: ${fmt(a)} ☐ ${fmt(b)}`, s, [">", "<", "="], { n: 3 }); }],
  );
}
function beforeAfter(max) {
  return () => {
    const n = rnd(2, max - 2), k = pick([1, 1, 10, 100].filter((x) => x * 10 <= max));
    return pick([
      () => input(`Nombor <b>${k === 1 ? "selepas" : `${k} lebih daripada`}</b> ${fmt(n)} ialah…`, n + k),
      () => input(`Nombor <b>${k === 1 ? "sebelum" : `${k} kurang daripada`}</b> ${fmt(n)} ialah…`, n - k),
    ])();
  };
}
function numberWords(max) {
  return () => {
    const n = rnd(11, max);
    return pick([
      () => mcq(`Tulis dalam angka: <b>${perkataan(n)}</b>`, fmt(n), [n + 10, n - 1, n + 100, Number(String(n).split("").reverse().join("")), n + 1].filter((x) => x > 0 && x !== n).map(fmt)),
      () => mcq(`Bagaimanakah ${fmt(n)} ditulis dalam perkataan?`, perkataan(n), [n + 1, n + 10, n > 100 ? n - 100 : n + 20].map(perkataan)),
    ])();
  };
}
/** 🎧 hear a number in words, pick the numeral (written form where audio is unavailable). */
const listenNum = (max) => () => {
  const n = rnd(max > 100 ? 100 : 11, max);
  const near = [n + 1, n - 1, n + 10, n - 10, Number(String(n).split("").reverse().join(""))].filter((x) => x > 0 && x !== n && x <= max * 1.1);
  return mcq("🎧 Dengar dan pilih nombor yang betul.", fmt(n), near.map(fmt), { listen: perkataan(n), alt: `Pilih nombor bagi <b>${perkataan(n)}</b>.` });
};
function addSub(max, { sub = true, add = true, story = true } = {}) {
  const gens = [];
  if (add) gens.push([2, () => { const a = rnd(Math.floor(max / 20), Math.floor(max / 2)), b = rnd(Math.floor(max / 30) + 1, max - a); return input(`${fmt(a)} + ${fmt(b)} = ?`, a + b, { explain: `Tambah sa dengan sa, puluh dengan puluh…` }); }]);
  if (sub) gens.push([2, () => { const a = rnd(Math.floor(max / 4), max), b = rnd(1, a - 1); return input(`${fmt(a)} − ${fmt(b)} = ?`, a - b, { explain: `Jika tidak cukup, pinjam dari tempat di sebelah kiri.` }); }]);
  if (add) gens.push([1, () => { const a = rnd(1, Math.floor(max / 2)), c = rnd(a + 1, max); return input(`${fmt(a)} + ☐ = ${fmt(c)}`, c - a, { explain: `☐ = ${fmt(c)} − ${fmt(a)}` }); }]);
  if (story && add) gens.push([1, () => { const p = pick(PEOPLE), [t, u] = pick(THINGS), a = rnd(2, Math.floor(max / 2)), b = rnd(2, Math.floor(max / 2)); return mcqNum(`${p} ada ${fmt(a)} ${u} ${t}. Ibu beri ${fmt(b)} ${u} lagi. Berapakah jumlah ${t} ${p} sekarang?`, a + b, { traps: [Math.abs(a - b)] }); }]);
  if (story && sub) gens.push([1, () => { const p = pick(PEOPLE), [t, u] = pick(THINGS), a = rnd(10, max), b = rnd(1, a - 1); return mcqNum(`${p} ada ${fmt(a)} ${u} ${t}. Dia memberi ${fmt(b)} ${u} kepada kawan. Berapakah baki ${t}?`, a - b, { traps: [a + b] }); }]);
  if (add && sub) gens.push([1, () => { const a = rnd(1, max / 2 | 0), b = rnd(1, max / 2 | 0), right = a + b; const shown = pick([right, right + pick([1, -1, 10])]); return tf(`${fmt(a)} + ${fmt(b)} = ${fmt(shown)}`, shown === right); }]);
  return blend(...gens);
}
function times(tables, { story = true, missing = true } = {}) {
  return blend(
    [3, () => { const t = pick(tables), k = rnd(1, 10); return input(`${t} × ${k} = ?`, t * k, { explain: `Sifir ${t}: ${t} × ${k} = ${t * k}` }); }],
    [missing ? 1 : 0, () => { const t = pick(tables), k = rnd(2, 10); return input(`${t} × ☐ = ${t * k}`, k); }],
    [1, () => { const t = pick(tables), k = rnd(2, 6); return mcq(`${Array(k).fill(t).join(" + ")} sama dengan…`, `${k} × ${t}`, [`${t} × ${t}`, `${k} + ${t}`, `${k + 1} × ${t}`, `${k} × ${t + 1}`]); }],
    [story ? 1 : 0, () => { const t = pick(tables), k = rnd(2, 9), [th, u] = pick(THINGS); return mcqNum(`Ada ${k} kotak. Setiap kotak berisi ${t} ${u} ${th}. Berapakah jumlah ${th}?`, t * k, { traps: [t + k] }); }],
    [1, () => { const t = pick(tables); const pairs = sample([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 4).map((k) => [`${t} × ${k}`, String(t * k)]); return match("Padankan soalan dengan jawapannya.", pairs); }],
  );
}
function divide(tables, { remainder = false } = {}) {
  return blend(
    [3, () => { const t = pick(tables), k = rnd(1, 10); return input(`${t * k} ÷ ${t} = ?`, k, { explain: `Kerana ${t} × ${k} = ${t * k}` }); }],
    [1, () => { const t = pick(tables), k = rnd(2, 9), [th, u] = pick(THINGS); return mcqNum(`${t * k} ${u} ${th} dikongsi sama rata oleh ${t} orang murid. Setiap murid mendapat berapa ${u}?`, k, { traps: [t * k - t] }); }],
    [remainder ? 2 : 0, () => { const t = pick(tables), k = rnd(2, 9), r = rnd(1, t - 1), n = t * k + r; return mcq(`${n} ÷ ${t} = ?`, `${k} baki ${r}`, [`${k} baki ${r + 1 < t ? r + 1 : r - 1}`, `${k + 1} baki ${r}`, `${k - 1} baki ${r}`, `${k}`]); }],
  );
}
function money(maxSen, { change = true } = {}) {
  const coins = [5, 10, 20, 50], notes = [100, 500, 1000, 2000, 5000, 10000].filter((v) => v <= maxSen);
  return blend(
    [2, () => { const vals = [...sample(notes, rnd(1, Math.min(2, notes.length))), ...sample(coins, rnd(1, 3))].sort((a, b) => b - a); const tot = vals.reduce((s, v) => s + v, 0); return mcq("Berapakah jumlah wang ini?", rm(tot), [tot + 10, tot - 5, tot + 100, tot + 50].filter((x) => x > 0).map(rm), { visual: moneyHtml(vals) }); }],
    [change ? 2 : 0, () => { const price = rnd(2, Math.floor(maxSen / 10 / 5)) * 5 + (maxSen > 1000 ? rnd(1, 9) * 100 : 0); const pay = notes.find((v) => v > price) || price + 100; return mcq(`Harga sebuah buku ialah ${rm(price)}. Ali membayar ${rm(pay)}. Berapakah baki wangnya?`, rm(pay - price), [pay - price + 10, pay - price - 10, pay + price, pay - price + 100].filter((x) => x > 0).map(rm)); }],
    [1, () => { const a = rnd(1, 9) * 100 + pick([0, 50, 20]), b = rnd(1, 9) * 100 + pick([0, 50, 30]); return mcq(`${rm(a)} + ${rm(b)} = ?`, rm(a + b), [a + b + 10, a + b - 50, a + b + 100].map(rm)); }],
    [1, () => { const ringgit = rnd(1, 9), sen = pick([10, 20, 50, 5]); return mcq(`RM${ringgit} dan ${sen} sen ditulis sebagai…`, rm(ringgit * 100 + sen), [`RM${ringgit}.0${sen % 10 === 0 ? sen / 10 : sen}`, `RM${ringgit + sen}`, `RM${sen}.${ringgit}0`].filter((x) => x !== rm(ringgit * 100 + sen))); }],
  );
}
function clock(hard) {
  const read = (h, m) => (m === 0 ? `${h}:00` : `${h}:${String(m).padStart(2, "0")}`);
  return blend(
    [3, () => { const h = rnd(1, 12), m = hard ? rnd(0, 11) * 5 : pick([0, 30]); return mcq("Pukul berapakah jam ini?", read(h, m), [read(h % 12 + 1, m), read(h, (m + 30) % 60), read((h + 10) % 12 + 1, m), read(m / 5 || 12, h * 5 % 60)].filter((x) => x !== read(h, m)), { visual: clockSvg(h, m) }); }],
    [1, () => mcq("1 jam = ? minit", "60", ["100", "30", "24", "12"])],
    [1, () => mcq("1 hari = ? jam", "24", ["12", "60", "7", "30"])],
    [hard ? 1 : 0, () => { const h = rnd(1, 3), m = pick([15, 30, 45]); return input(`${h} jam ${m} minit = ? minit`, h * 60 + m, { explain: `${h} × 60 + ${m}` }); }],
  );
}
const HARI = ["Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu", "Ahad"];
const BULAN = ["Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September", "Oktober", "November", "Disember"];
const calendar = blend(
  [2, () => { const i = rnd(0, 6); return mcq(`Hari selepas <b>${HARI[i]}</b> ialah…`, HARI[(i + 1) % 7], HARI); }],
  [2, () => { const i = rnd(0, 11); return mcq(`Bulan sebelum <b>${BULAN[i]}</b> ialah…`, BULAN[(i + 11) % 12], BULAN); }],
  [1, () => { const i = rnd(0, 4); return order("Susun hari mengikut urutan.", HARI.slice(i, i + 3)); }],
  [1, () => mcq("1 minggu ada berapa hari?", "7", ["5", "10", "12", "30"])],
  [1, () => mcq("1 tahun ada berapa bulan?", "12", ["10", "7", "24", "52"])],
);
const SOLID = [["Bola", "⚽", "Sfera"], ["Dadu", "🎲", "Kubus"], ["Kotak hadiah", "🎁", "Kuboid"], ["Tin minuman", "🥫", "Silinder"], ["Kon aiskrim", "🍦", "Kon"], ["Bola keranjang", "🏀", "Sfera"], ["Tembikai", "🍉", "Sfera"]];
const shapes = blend(
  [2, () => { const s = pick(SHAPES.slice(0, 6)); return mcq("Apakah nama bentuk ini?", s.ms, SHAPES.map((x) => x.ms), { visual: shapeSvg(s.id) }); }],
  [2, () => { const [obj, e, sh] = pick(SOLID); return mcq(`${obj} ${e} berbentuk…`, sh, ["Sfera", "Kubus", "Kuboid", "Silinder", "Kon", "Piramid"]); }],
  [1, () => { const s = pick(SHAPES.filter((x) => x.sides >= 3 && x.sides <= 6)); return input(`Berapakah bilangan sisi bagi ${s.ms.toLowerCase()}?`, s.sides, { visual: shapeSvg(s.id) }); }],
  [1, () => match("Padankan objek dengan bentuknya.", sample(SOLID.filter((x, i, a) => a.findIndex((y) => y[2] === x[2]) === i), 4).map(([o, e, s]) => [`${e} ${o}`, s]))],
);
const measure = blend(
  [2, () => { const pairs = [["Pensel", "Pembaris"], ["Semut", "Kucing"], ["Kereta", "Basikal"], ["Pokok", "Bunga"]], [a, b] = pick(pairs); const longer = ["Pembaris", "Kucing", "Kereta", "Pokok"].includes(b) ? b : a; return mcq(`Manakah yang lebih <b>panjang/besar</b>: ${a} atau ${b}?`, longer, [a, b], { n: 2 }); }],
  [2, () => { const items = [["Gajah", "🐘"], ["Kucing", "🐱"], ["Tikus", "🐭"]]; return order("Susun dari <b>paling ringan</b> hingga <b>paling berat</b>.", ["🐭 Tikus", "🐱 Kucing", "🐘 Gajah"]); }],
  [1, () => mcq("Unit yang sesuai untuk mengukur panjang meja ialah…", "sentimeter (cm)", ["kilogram (kg)", "liter (l)", "jam"])],
  [1, () => mcq("Unit yang sesuai untuk menyukat air dalam botol ialah…", "liter (l)", ["meter (m)", "kilogram (kg)", "sentimeter (cm)"])],
  [1, () => mcq("Unit yang sesuai untuk menimbang beras ialah…", "kilogram (kg)", ["liter (l)", "meter (m)", "minit"])],
);
function convert(level) {
  const C = [["m", "cm", 100], ["km", "m", 1000], ["kg", "g", 1000], ["l", "ml", 1000], ["jam", "minit", 60], ["minit", "saat", 60]];
  return blend(
    [3, () => { const [big_, small, f] = pick(C); const n = level > 1 ? r2(rnd(1, 9) + pick([0, 0.5, 0.25])) : rnd(1, 9); const v = r2(n * f); return Number.isInteger(v) ? input(`${fmt(n)} ${big_} = ? ${small}`, v, { explain: `1 ${big_} = ${f} ${small}` }) : input(`${n} ${big_} = ? ${small}`, Math.round(v)); }],
    [level > 1 ? 2 : 0, () => { const [big_, small, f] = pick(C.slice(0, 4)); const v = rnd(1, 9) * f + rnd(1, 9) * (f / 10); return input(`${fmt(v)} ${small} = ? ${big_}`, r2(v / f), { decimal: true, explain: `Bahagi dengan ${f}.` }); }],
    [1, () => { const [big_, small, f] = pick(C); return mcq(`1 ${big_} = ? ${small}`, String(f), ["10", "100", "1000", "60", "24"]); }],
  );
}
function fractions(level) {
  const ds = level === 1 ? [2, 3, 4] : level === 2 ? [2, 3, 4, 5, 6, 8] : [2, 3, 4, 5, 6, 8, 10, 12];
  const gens = [
    [3, () => { const d = pick(ds), n = rnd(1, d - 1); const v = pick([fractionBar, fractionPie])(n, d); return mcq("Pecahan manakah yang menunjukkan bahagian berlorek?", fracTxt(n, d), [fracTxt(d - n, d), fracTxt(n, d + 1), fracTxt(n + 1, d), fracTxt(d, n)].filter((x) => x !== fracTxt(n, d)), { visual: v }); }],
    [1, () => { const d = pick(ds); return mcq(`${fracTxt(1, d)} dibaca sebagai…`, `satu per${perkataan(d)}`, [`satu per${perkataan(d + 1)}`, `${perkataan(d)} persatu`, `satu ${perkataan(d)}`]); }],
  ];
  if (level >= 2) gens.push(
    [2, () => { const [a, b] = pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5]]), k = rnd(2, 4); return mcq(`Pecahan manakah yang <b>setara</b> dengan ${fracTxt(a, b)}?`, fracTxt(a * k, b * k), [fracTxt(a + k, b + k), fracTxt(a * k, b), fracTxt(a, b * k), fracTxt(a * k + 1, b * k)]); }],
    [2, () => { const d = pick([4, 5, 6, 8, 10]), a = rnd(1, d - 2), b = rnd(1, d - 1 - a); const [p, q] = simp(a + b, d); return mcq(`${fracTxt(a, d)} + ${fracTxt(b, d)} = ? (bentuk termudah)`, fracTxt(p, q), [fracTxt(a + b, d + d), fracTxt(a + b + 1, d), fracTxt(a * b, d)].filter((x) => x !== fracTxt(p, q)).concat(p !== a + b ? [fracTxt(a + b, d)] : [])); }],
    [1, () => { const d = pick([2, 4, 8]), [a, b] = [rnd(1, d - 1), rnd(1, d - 1)]; if (a === b) return tf(`${fracTxt(a, d)} sama dengan ${fracTxt(b, d)}`, true); return mcq(`Manakah lebih besar: ${fracTxt(a, d)} atau ${fracTxt(b, d)}?`, fracTxt(Math.max(a, b), d), [fracTxt(a, d), fracTxt(b, d)], { n: 2 }); }],
  );
  if (level >= 3) gens.push(
    [2, () => { const d = pick([3, 4, 5, 6]), w = rnd(1, 4), n = rnd(1, d - 1); return mcq(`Tukarkan ${fracTxt(w * d + n, d)} kepada nombor bercampur.`, `${w} ${fracTxt(n, d)}`, [`${w + 1} ${fracTxt(n, d)}`, `${w} ${fracTxt(d - n, d)}`, `${n} ${fracTxt(w, d)}`]); }],
    [2, () => { const [a, b] = pick([[1, 2], [1, 4], [3, 4], [1, 3], [2, 3], [1, 5], [3, 5]]), m = b * rnd(2, 6); return input(`${fracTxt(a, b)} daripada ${m} = ?`, (a * m) / b, { explain: `${m} ÷ ${b} × ${a}` }); }],
  );
  return blend(...gens);
}
function decimals(level) {
  const gens = [
    [2, () => { const n = rnd(1, 9); return mcq(`${fracTxt(n, 10)} dalam perpuluhan ialah…`, `0.${n}`, [`0.0${n}`, `${n}.0`, `0.${n}0${n}`, `1.${n}`]); }],
    [2, () => { const a = r2(rnd(10, 99) / 10), b = r2(rnd(10, 99) / 10); return input(`${a} + ${b} = ?`, r2(a + b), { decimal: true }); }],
    [1, () => { const ns = sample(Array.from({ length: 30 }, (_, i) => r2((i + 1) / 10 + rnd(0, 3))), 4); return mcq("Nombor perpuluhan manakah yang paling besar?", String(Math.max(...ns)), ns.map(String)); }],
  ];
  if (level >= 2) gens.push(
    [2, () => { const a = r2(rnd(100, 999) / 100), b = r2(rnd(10, a * 100 - 1) / 100); return input(`${a} − ${b} = ?`, r2(a - b), { decimal: true }); }],
    [1, () => { const n = rnd(1, 99); return mcq(`${fracTxt(n, 100)} dalam perpuluhan ialah…`, String(r2(n / 100)), [String(r2(n / 10)), String(n), `0.${n}0`.replace(/^0\.(\d)0$/, "0.$10")].filter((x) => x !== String(r2(n / 100)))); }],
  );
  if (level >= 3) gens.push(
    [2, () => { const a = r2(rnd(11, 99) / 10), k = pick([10, 100, 1000]); return pick([() => input(`${a} × ${k} = ?`, r2(a * k), { explain: `Gerakkan titik perpuluhan ${String(k).length - 1} tempat ke kanan.` }), () => input(`${a} ÷ ${k} = ?`, r2(a / k, 5), { decimal: true, explain: `Gerakkan titik perpuluhan ${String(k).length - 1} tempat ke kiri.` })])(); }],
    [1, () => { const a = r2(rnd(11, 99) / 10), k = rnd(2, 9); return input(`${a} × ${k} = ?`, r2(a * k), { decimal: true }); }],
  );
  return blend(...gens);
}
function percent(level) {
  const gens = [
    [2, () => { const [p, f] = pick([[50, "1/2"], [25, "1/4"], [75, "3/4"], [10, "1/10"], [20, "1/5"], [100, "1"]]); return mcq(`${p}% sama dengan pecahan…`, f, ["1/2", "1/4", "3/4", "1/10", "1/5", "1/3", "2/3"]); }],
    [2, () => { const n = rnd(1, 99); return mcq(`${fracTxt(n, 100)} = ?%`, `${n}%`, [`${n * 10}%`, `${100 - n}%`, `${n / 10}%`]); }],
  ];
  if (level >= 2) gens.push(
    [3, () => { const p = pick([10, 20, 25, 50, 75, 5, 15, 30]), base = pick([20, 40, 60, 80, 100, 120, 200, 400]); const v = (p * base) / 100; if (!Number.isInteger(v)) return input(`50% daripada ${base} = ?`, base / 2); return input(`${p}% daripada ${base} = ?`, v, { explain: `${p}/100 × ${base}` }); }],
    [1, () => { const a = rnd(1, 19), b = 20; return mcqNum(`${a} daripada ${b} murid suka membaca. Berapa peratus murid suka membaca?`, a * 5, { show: (x) => `${x}%`, traps: [a, b - a] }); }],
  );
  if (level >= 3) gens.push(
    [2, () => { const harga = pick([40, 60, 80, 120, 150, 200]), p = pick([10, 20, 25, 50]); return mcq(`Harga asal kasut RM${harga}. Diskaun ${p}%. Berapakah harga selepas diskaun?`, `RM${harga - (harga * p) / 100}`, [`RM${(harga * p) / 100}`, `RM${harga - p}`, `RM${harga + (harga * p) / 100}`]); }],
  );
  return blend(...gens);
}

// ---------------------------------------------------------------- year-specific topics
const opsCombined = (level) => blend(
  [3, () => { const a = rnd(2, 20), b = rnd(2, 9), c = rnd(2, 9); return pick([() => input(`${a} + ${b} × ${c} = ?`, a + b * c, { explain: `Darab dahulu: ${b} × ${c} = ${b * c}` }), () => input(`${a * c} ÷ ${c} + ${b} = ?`, a + b, { explain: `Bahagi dahulu.` })])(); }],
  [level >= 2 ? 2 : 0, () => { const a = rnd(2, 9), b = rnd(2, 9), c = rnd(2, 9); return input(`(${a} + ${b}) × ${c} = ?`, (a + b) * c, { explain: `Selesaikan dalam kurungan dahulu.` }); }],
  [1, () => { const a = rnd(100, 999), b = rnd(10, 99), c = rnd(1, b); return input(`${fmt(a)} + ${b} − ${c} = ?`, a + b - c); }],
  [1, () => { const a = rnd(2, 9), b = rnd(2, 9), c = rnd(2, 20); return mcq(`Apakah langkah pertama untuk ${c} + ${a} × ${b}?`, `${a} × ${b}`, [`${c} + ${a}`, `${b} + ${c}`, `${c} × ${b}`]); }],
);
const bigMulDiv = (level) => blend(
  [2, () => { const a = rnd(level > 1 ? 100 : 10, 999), b = rnd(2, level > 1 ? 99 : 9); return input(`${fmt(a)} × ${b} = ?`, a * b); }],
  [2, () => { const b = rnd(2, level > 1 ? 25 : 9), q = rnd(10, 999); return input(`${fmt(b * q)} ÷ ${b} = ?`, q); }],
  [1, () => { const q = rnd(12, 60), k = rnd(3, 12); return mcqNum(`Sebuah sekolah ada ${k} kelas. Setiap kelas ada ${q} murid. Berapakah jumlah murid?`, k * q, { traps: [k + q] }); }],
);
const primes = blend(
  [3, () => { const ns = sample(Array.from({ length: 40 }, (_, i) => i + 2), 8); const p = ns.find(isPrime) || 13; const others = ns.filter((x) => !isPrime(x)); return mcq("Nombor manakah ialah <b>nombor perdana</b>?", String(p), others.map(String)); }],
  [1, () => { const n = pick([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 9, 15, 21, 27, 1, 25]); return tf(`${n} ialah nombor perdana.`, isPrime(n), { explain: isPrime(n) ? `${n} hanya boleh dibahagi dengan 1 dan dirinya sendiri.` : `${n} ada faktor lain selain 1 dan dirinya.` }); }],
  [1, () => { const n = pick([12, 18, 20, 24, 30, 36]); const f = sample([...Array(n).keys()].slice(2).filter((k) => n % k === 0), 1)[0]; return mcq(`Manakah <b>faktor</b> bagi ${n}?`, String(f), [5, 7, 11, 13, 9, 8].filter((k) => n % k !== 0).map(String)); }],
  [1, () => { const k = rnd(3, 9), m = rnd(2, 9); return mcq(`Manakah <b>gandaan</b> ${k}?`, String(k * m), [k * m + 1, k * m - 1, k + m, k * m + 2].map(String)); }],
);
const rounding = (max) => () => {
  const to = pick([10, 100, 1000].filter((t) => t * 10 <= max)), n = rnd(to, max - 1);
  const r = Math.round(n / to) * to;
  return mcq(`Bundarkan ${fmt(n)} kepada <b>${perkataan(to).replace("se", "")}</b> yang terdekat.`.replace("<b>puluh</b>", "<b>puluh</b>"), fmt(r), [r + to, r - to, Math.floor(n / to) * to === r ? Math.ceil(n / to) * to : Math.floor(n / to) * to, n].filter((x) => x > 0 && x !== r).map(fmt), { explain: `Lihat digit di sebelah kanan: 5 ke atas, bundarkan ke atas.` });
};
const perimeterArea = (level) => blend(
  [2, () => { const w = rnd(3, 15), h = rnd(2, 12); return input("Berapakah <b>perimeter</b> segi empat tepat ini? (cm)", 2 * (w + h), { visual: rectSvg(w, h), explain: `${w} + ${h} + ${w} + ${h}` }); }],
  [2, () => { const w = rnd(3, 15), h = rnd(2, 12); return input("Berapakah <b>luas</b> segi empat tepat ini? (cm²)", w * h, { visual: rectSvg(w, h, "cm", "#ecfbd6"), explain: `Luas = panjang × lebar = ${w} × ${h}` }); }],
  [level >= 2 ? 2 : 0, () => { const b = rnd(2, 12) * 2, h = rnd(3, 12); return input(`Tapak segi tiga ${b} cm, tinggi ${h} cm. Berapakah luasnya? (cm²)`, (b * h) / 2, { explain: `½ × tapak × tinggi` }); }],
  [level >= 2 ? 2 : 0, () => { const a = rnd(2, 10), b = rnd(2, 8), c = rnd(2, 6); return input(`Isi padu kuboid ${a} cm × ${b} cm × ${c} cm = ? cm³`, a * b * c, { explain: `panjang × lebar × tinggi` }); }],
  [1, () => { const s = rnd(2, 12); return input(`Segi empat sama bersisi ${s} cm. Berapakah perimeternya? (cm)`, 4 * s); }],
);
const average = (level) => blend(
  [3, () => { const k = rnd(3, 5), avg = rnd(5, 60), ns = Array.from({ length: k - 1 }, () => rnd(1, avg * 2 - 1)); const last = avg * k - ns.reduce((s, x) => s + x, 0); if (last <= 0) return input(`Purata bagi 4, 6 dan 8 = ?`, 6); const all = shuffle([...ns, last]); return input(`Purata bagi ${all.join(", ")} = ?`, avg, { explain: `Jumlah ÷ bilangan = ${avg * k} ÷ ${k}` }); }],
  [level >= 2 ? 2 : 0, () => { const ns = Array.from({ length: 5 }, () => rnd(1, 20)); const s = [...ns].sort((a, b) => a - b); return pick([() => input(`Median bagi ${ns.join(", ")} = ?`, s[2], { explain: `Susun dahulu: ${s.join(", ")}` }), () => input(`Julat bagi ${ns.join(", ")} = ?`, s[4] - s[0], { explain: `Terbesar − terkecil` })])(); }],
  [level >= 2 ? 1 : 0, () => { const m = rnd(1, 9), ns = shuffle([m, m, m, rnd(10, 15), rnd(16, 20), rnd(21, 25)]); return input(`Mod bagi ${ns.join(", ")} = ?`, m, { explain: `Nilai yang paling kerap muncul.` }); }],
  [1, () => { const labels = sample(["Isn", "Sel", "Rab", "Kha", "Jum"], 4), vals = labels.map(() => rnd(2, 12)); const i = vals.indexOf(Math.max(...vals)); if (vals.filter((v) => v === vals[i]).length > 1) vals[i]++; return mcq("Carta menunjukkan bilangan buku dibaca. Hari manakah paling banyak?", labels[vals.indexOf(Math.max(...vals))], labels, { visual: barChart(labels, vals) }); }],
);
const ratio = blend(
  [2, () => { const g = rnd(2, 6), a = rnd(1, 5), b = rnd(1, 5); if (gcd(a, b) !== 1) return mcq("Nisbah 4 : 6 dalam bentuk termudah ialah…", "2 : 3", ["4 : 6", "1 : 2", "3 : 2"]); return mcq(`Nisbah ${a * g} : ${b * g} dalam bentuk termudah ialah…`, `${a} : ${b}`, [`${b} : ${a}`, `${a * g} : ${b}`, `${a + 1} : ${b}`]); }],
  [2, () => { const a = rnd(1, 4), b = rnd(1, 4), k = rnd(2, 8), tot = (a + b) * k; return input(`${tot} biji guli dikongsi oleh Ali dan Abu dalam nisbah ${a} : ${b}. Berapa biji guli Ali?`, a * k, { explain: `${tot} ÷ ${a + b} × ${a}` }); }],
);
const coordinates = () => {
  const x = rnd(1, 5), y = rnd(1, 5);
  const g = Array.from({ length: 6 }, (_, i) => `<line x1="${20 + i * 30}" y1="10" x2="${20 + i * 30}" y2="160" stroke="#cfd6e0"/><line x1="20" y1="${160 - i * 30}" x2="170" y2="${160 - i * 30}" stroke="#cfd6e0"/><text x="${20 + i * 30}" y="176" font-size="12" text-anchor="middle">${i}</text><text x="8" y="${164 - i * 30}" font-size="12">${i}</text>`).join("");
  const svg = `<svg viewBox="0 0 180 182" width="200" class="qsvg" role="img" aria-label="Satah Cartes">${g}<circle cx="${20 + x * 30}" cy="${160 - y * 30}" r="8" fill="#d1137a"/><text x="${28 + x * 30}" y="${152 - y * 30}" font-weight="800" font-size="14">P</text></svg>`;
  return mcq("Apakah koordinat titik P?", `(${x}, ${y})`, [`(${y}, ${x})`, `(${x + 1}, ${y})`, `(${x}, ${y + 1})`, `(${x - 1}, ${y - 1})`].filter((s) => s !== `(${x}, ${y})`), { visual: svg, explain: "Baca paksi-x dahulu, kemudian paksi-y." });
};
const interest = blend(
  [2, () => { const kos = rnd(10, 60), untung = rnd(2, 20); return pick([() => mcq(`Kos sebiji bola RM${kos}. Dijual RM${kos + untung}. Berapakah untungnya?`, `RM${untung}`, [`RM${kos + untung}`, `RM${kos}`, `RM${untung + 2}`]), () => mcq(`Kos sebuah beg RM${kos + untung}. Dijual RM${kos}. Untung atau rugi berapa?`, `Rugi RM${untung}`, [`Untung RM${untung}`, `Rugi RM${kos}`, `Untung RM${kos}`])])(); }],
  [2, () => { const P = pick([100, 200, 500, 1000]), r = pick([2, 3, 4, 5]), t = rnd(1, 3); return input(`Simpanan RM${P}, kadar faedah mudah ${r}% setahun. Berapakah faedah selepas ${t} tahun? (RM)`, (P * r * t) / 100, { explain: `Faedah = ${P} × ${r}/100 × ${t}` }); }],
  [1, () => { const harga = pick([50, 80, 100, 200]), p = pick([10, 20, 25]); return input(`Harga asal RM${harga}. Diskaun ${p}%. Berapakah nilai diskaun? (RM)`, (harga * p) / 100); }],
);
const time24 = blend(
  [2, () => { const h = rnd(1, 11), m = pick([0, 15, 30, 45]); const pm = Math.random() < 0.5; const hh = pm ? h + 12 : h; return mcq(`${h}:${String(m).padStart(2, "0")} ${pm ? (h >= 7 ? "malam" : "petang") : "pagi"} dalam sistem 24 jam ialah…`, `${String(hh).padStart(2, "0")}${String(m).padStart(2, "0")}`, [`${String(pm ? h : h + 12).padStart(2, "0")}${String(m).padStart(2, "0")}`, `${String(hh).padStart(2, "0")}${String((m + 15) % 60).padStart(2, "0")}`, `${h}${String(m).padStart(2, "0")}0`]); }],
  [2, () => { const s = rnd(7, 14), d = rnd(1, 5), m = pick([0, 15, 30]); return mcq(`Bas bertolak pukul ${s}:00 dan tiba ${d} jam ${m} minit kemudian. Pukul berapakah bas tiba?`, `${s + d}:${String(m).padStart(2, "0")}`, [`${s + d + 1}:${String(m).padStart(2, "0")}`, `${s + d}:${String((m + 30) % 60).padStart(2, "0")}`, `${s + m}:${String(d).padStart(2, "0")}`]); }],
  [1, () => { const a = rnd(1, 3), b = rnd(10, 50); return input(`${a} jam ${b} minit + 1 jam 20 minit = ? minit`, (a + 1) * 60 + b + 20); }],
);

// ---------------------------------------------------------------- curriculum
// [id, title, emoji, generator]
export const MATH = {
  1: [
    ["nombor-100", "Nombor hingga 100", "🔢", blend([1, compareNums(100)], [1, beforeAfter(100)], [1, placeValue(100, 2)], [1, listenNum(100)], [1, () => { const n = rnd(11, 99); return mcq(`${n} = ? puluh ${n % 10} sa`, String(Math.floor(n / 10)), ["1", "2", "3", "5", "7", "9", String(n % 10)]); }])],
    ["tambah-100", "Tambah hingga 100", "➕", addSub(100, { sub: false })],
    ["tolak-100", "Tolak hingga 100", "➖", addSub(100, { add: false })],
    ["wang-rm10", "Wang hingga RM10", "💰", money(1000, { change: false })],
    ["masa-hari", "Masa & Waktu", "🕒", blend([1, calendar], [1, clock(false)])],
    ["ukuran", "Ukuran & Sukatan", "📏", measure],
    ["bentuk", "Bentuk 2D & 3D", "🔷", shapes],
  ],
  2: [
    ["nombor-1000", "Nombor hingga 1000", "🔢", blend([1, compareNums(1000)], [1, placeValue(1000, 3)], [1, numberWords(999)], [1, beforeAfter(1000)], [1, listenNum(999)])],
    ["tambah-tolak-1000", "Tambah & Tolak hingga 1000", "🧮", addSub(1000)],
    ["darab-asas", "Darab (Sifir 2, 3, 4, 5, 10)", "✖️", times([2, 3, 4, 5, 10])],
    ["bahagi-asas", "Bahagi dalam Sifir", "➗", divide([2, 3, 4, 5, 10])],
    ["pecahan-asas", "Pecahan Mudah", "🍕", fractions(1)],
    ["wang-rm100", "Wang hingga RM100", "💵", money(10000)],
    ["masa-jam", "Masa: Jam & Minit", "⏰", clock(true)],
  ],
  3: [
    ["nombor-10000", "Nombor hingga 10 000", "🔢", blend([1, placeValue(10000, 4)], [1, numberWords(9999)], [1, rounding(10000)], [1, compareNums(10000)])],
    ["operasi-10000", "Tambah & Tolak hingga 10 000", "🧮", addSub(10000)],
    ["sifir-6-9", "Sifir 6, 7, 8 & 9", "✖️", times([6, 7, 8, 9])],
    ["bahagi-baki", "Bahagi dengan Baki", "➗", divide([3, 4, 5, 6, 7, 8, 9], { remainder: true })],
    ["pecahan-setara", "Pecahan Setara", "🍰", fractions(2)],
    ["perpuluhan-asas", "Perpuluhan", "🔟", decimals(1)],
    ["peratus-asas", "Peratus", "💯", percent(1)],
    ["masa-ukuran", "Masa & Ukuran", "⏱️", blend([1, clock(true)], [1, convert(1)])],
  ],
  4: [
    ["nombor-100000", "Nombor hingga 100 000", "🔢", blend([1, placeValue(100000, 5)], [1, numberWords(99999)], [1, rounding(100000)])],
    ["operasi-bergabung", "Operasi Bergabung", "🧩", opsCombined(1)],
    ["darab-bahagi", "Darab & Bahagi", "✖️", bigMulDiv(1)],
    ["pecahan-campur", "Pecahan & Nombor Bercampur", "🥧", fractions(3)],
    ["perpuluhan", "Perpuluhan", "🔟", decimals(2)],
    ["peratus", "Peratus", "💯", percent(2)],
    ["penukaran-unit", "Penukaran Unit", "⚖️", convert(2)],
    ["koordinat", "Koordinat", "📍", coordinates],
  ],
  5: [
    ["nombor-juta", "Nombor hingga 1 Juta & Perdana", "🔢", blend([2, placeValue(1000000, 6)], [1, numberWords(999999)], [2, primes])],
    ["darab-bahagi-besar", "Darab & Bahagi Nombor Besar", "✖️", bigMulDiv(2)],
    ["pecahan-darab", "Pecahan daripada Kuantiti", "🥧", fractions(3)],
    ["perpuluhan-operasi", "Operasi Perpuluhan", "🔟", decimals(3)],
    ["peratus-kuantiti", "Peratus & Diskaun", "🏷️", percent(3)],
    ["perimeter-luas", "Perimeter & Luas", "📐", perimeterArea(1)],
    ["purata", "Purata & Data", "📊", average(1)],
  ],
  6: [
    ["nombor-perdana", "Nombor Perdana, Faktor & Gandaan", "🔢", primes],
    ["operasi-kurungan", "Operasi Bergabung dengan Kurungan", "🧩", opsCombined(2)],
    ["wang-kewangan", "Wang: Untung, Rugi & Faedah", "🏦", interest],
    ["masa-24jam", "Masa 24 Jam & Tempoh", "🕰️", time24],
    ["luas-isipadu", "Luas & Isi Padu", "📦", perimeterArea(2)],
    ["statistik", "Purata, Median, Mod & Julat", "📊", average(2)],
    ["nisbah", "Nisbah & Kadaran", "⚖️", ratio],
    ["koordinat", "Koordinat", "📍", coordinates],
  ],
};
