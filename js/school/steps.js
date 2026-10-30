// "Langkah demi langkah" for Matematik: worked solutions shown when a child answers wrongly (Latihan)
// and in the review list. Each builder returns { steps: [plain text…], work?: trusted HTML } so a
// question can spread it into its options: input(…, { ...addSteps(a, b) }).
// `work` is a column layout built only from numbers here — never user text.
import { fmt, r2 } from "./qkit.js";

const PLACE = ["sa", "puluh", "ratus", "ribu", "puluh ribu", "ratus ribu", "juta"];
const DEC = ["persepuluh", "perseratus", "perseribu"];
/** Name of the column `i` places left of the last digit, for numbers written with `dp` decimals. */
const place = (i, dp = 0) => (i < dp ? DEC[dp - 1 - i] : PLACE[i - dp]);
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const digits = (n, dp) => (dp ? Math.round(n * 10 ** dp) : n);
const show = (n, dp) => (dp ? Number(n).toFixed(dp) : fmt(n));

/**
 * Column grid: `marks` (small numbers above, by column from the right), the rows, the operator on the
 * last row, a line and the result. Numbers with decimals keep their points lined up.
 */
function grid(rows, op, result, marks = [], dp = 0) {
  const txt = [...rows, result].map((n) => (dp ? Number(n).toFixed(dp) : String(n)));
  const W = Math.max(...txt.map((s) => s.length)) + 1;
  const cells = (s, lead = "") => {
    const t = s.padStart(W, " ").split("");
    if (lead) t[0] = lead;
    return t.map((c) => `<td${c === "." ? ' class="cw-pt"' : ""}>${c.trim()}</td>`).join("");
  };
  // marks are indexed by digit column; skip the decimal point when placing them
  const markRow = [];
  for (let j = 0, i = 0; j < W; j++) {
    const ch = txt[0].padStart(W, " ")[W - 1 - j];
    if (dp && ch === ".") { markRow.unshift("<td></td>"); continue; }
    markRow.unshift(`<td>${marks[i] ?? ""}</td>`);
    i++;
  }
  const body = txt.slice(0, -1).map((s, k) => `<tr>${cells(s, k === rows.length - 1 ? op : "")}</tr>`).join("");
  return `<table class="colwork" role="img" aria-label="Kiraan bentuk lazim">${marks.some(Boolean) ? `<tr class="cw-m">${markRow.join("")}</tr>` : ""}${body}<tr class="cw-r">${cells(txt[txt.length - 1])}</tr></table>`;
}

/** Column addition with carrying. */
export function addSteps(a, b, dp = 0) {
  const A = String(digits(a, dp)), B = String(digits(b, dp)), L = Math.max(A.length, B.length);
  const steps = [], marks = [];
  if (dp) steps.push(`Susun supaya titik perpuluhan sebaris: ${show(a, dp)} dan ${show(b, dp)}.`);
  let carry = 0;
  for (let i = 0; i < L; i++) {
    const x = Number(A[A.length - 1 - i] || 0), y = Number(B[B.length - 1 - i] || 0), s = x + y + carry;
    const last = i === L - 1;
    steps.push(`${cap(place(i, dp))}: ${x} + ${y}${carry ? " + 1 (bawa)" : ""} = ${s}${s >= 10 && !last ? ` → tulis ${s % 10}, bawa 1 ke ${place(i + 1, dp)}` : ""}.`);
    carry = s >= 10 ? 1 : 0;
    if (carry && !last) marks[i + 1] = "1";
  }
  const sum = r2(a + b);
  steps.push(`Jawapan: ${show(sum, dp)}`);
  return { steps, work: grid([a, b], "+", sum, marks, dp) };
}

/** Column subtraction with borrowing (also across zeros). */
export function subSteps(a, b, dp = 0) {
  const A = String(digits(a, dp)).split("").reverse().map(Number), B = String(digits(b, dp)).split("").reverse().map(Number);
  const steps = [], marks = [];
  if (dp) steps.push(`Susun supaya titik perpuluhan sebaris: ${show(a, dp)} dan ${show(b, dp)}.`);
  for (let i = 0; i < A.length; i++) {
    const y = B[i] || 0;
    if (i >= B.length) { // nothing left to take away: bring the digit down (but not a leading zero)
      if (A[i] || i < A.length - 1) steps.push(`${cap(place(i, dp))}: turunkan ${A[i]}.`);
      continue;
    }
    if (A[i] < y) {
      let j = i + 1;
      while (A[j] === 0) j++;
      A[j]--; marks[j] = String(A[j]);
      for (let k = j - 1; k > i; k--) { A[k] = 9; marks[k] = "9"; }
      A[i] += 10; marks[i] = String(A[i]);
      const from = j > i + 1 ? `pinjam dari ${place(j, dp)} (tempat 0 di antaranya jadi 9)` : `pinjam 1 ${place(i + 1, dp)}`;
      steps.push(`${cap(place(i, dp))}: ${A[i] - 10} tak cukup untuk tolak ${y} → ${from}: ${A[i]} − ${y} = ${A[i] - y}.`);
    } else steps.push(`${cap(place(i, dp))}: ${A[i]} − ${y} = ${A[i] - y}.`);
  }
  const diff = r2(a - b);
  steps.push(`Jawapan: ${show(diff, dp)}`);
  return { steps, work: grid([a, b], "−", diff, marks.map((m) => (m == null ? "" : m)), dp) };
}

/** Multiplication: column with carrying for a 1-digit multiplier, split into tens and ones for 2 digits. */
export function mulSteps(a, b) {
  if (b >= 10) {
    const t = Math.floor(b / 10) * 10, o = b % 10;
    return { steps: [
      `Pecahkan ${b} kepada ${t} + ${o}.`,
      `${fmt(a)} × ${t} = ${fmt(a * t)}`,
      ...(o ? [`${fmt(a)} × ${o} = ${fmt(a * o)}`, `Tambah: ${fmt(a * t)} + ${fmt(a * o)} = ${fmt(a * b)}`] : []),
      `Jawapan: ${fmt(a * b)}`,
    ] };
  }
  const A = String(a), steps = [], marks = [];
  let carry = 0;
  for (let i = 0; i < A.length; i++) {
    const x = Number(A[A.length - 1 - i]), p = x * b + carry, last = i === A.length - 1;
    steps.push(`${cap(place(i))}: ${x} × ${b}${carry ? ` + ${carry} (bawa)` : ""} = ${p}${p >= 10 && !last ? ` → tulis ${p % 10}, bawa ${Math.floor(p / 10)}` : ""}.`);
    carry = Math.floor(p / 10);
    if (carry && !last) marks[i + 1] = String(carry);
  }
  steps.push(`Jawapan: ${fmt(a * b)}`);
  return { steps, work: grid([a, b], "×", a * b, marks) };
}

/** Long division, digit by digit ("bahagi, darab, tolak, turunkan"). */
export function divSteps(n, d) {
  const N = String(n), steps = [];
  let cur = 0, q = "", started = false;
  for (let i = 0; i < N.length; i++) {
    cur = cur * 10 + Number(N[i]);
    if (!started && cur < d && i < N.length - 1) continue;
    started = true;
    const k = Math.floor(cur / d), r = cur - k * d;
    steps.push(`${cur} ÷ ${d} = ${k}${r ? ` baki ${r}` : ""}${k ? ` (${d} × ${k} = ${d * k})` : ""}${i < N.length - 1 ? ` → turunkan ${N[i + 1]}` : ""}.`);
    q += k; cur = r;
  }
  const quo = Math.floor(n / d), rem = n % d;
  steps.push(`Jawapan: ${fmt(quo)}${rem ? ` baki ${rem}` : ""}`);
  steps.push(`Semak: ${d} × ${fmt(quo)}${rem ? ` + ${rem}` : ""} = ${fmt(n)} ✔`);
  return { steps };
}

/** Times table by skip counting (small numbers). */
export function timesSteps(t, k) {
  const seq = Array.from({ length: k }, (_, i) => t * (i + 1));
  return { steps: [`${t} × ${k} bermaksud ${k} kumpulan ${t}.`, `Kira langkah ${t}: ${seq.join(", ")}.`, `Jawapan: ${t * k}`] };
}

/** Division with remainder for small numbers. */
export function remainderSteps(n, t) {
  const k = Math.floor(n / t), r = n % t;
  return { steps: [
    `Cari sifir ${t} yang paling hampir dengan ${n} tetapi tidak melebihinya: ${t} × ${k} = ${t * k}.`,
    `Baki: ${n} − ${t * k} = ${r}.`,
    `Jawapan: ${k} baki ${r}`,
  ] };
}

/** Average: total, count, divide. */
export function averageSteps(ns) {
  const s = ns.reduce((x, y) => x + y, 0);
  return { steps: [`Jumlahkan semua: ${ns.join(" + ")} = ${s}.`, `Ada ${ns.length} nombor.`, `Purata = ${s} ÷ ${ns.length} = ${r2(s / ns.length)}`] };
}

/** p% of base. */
export function percentSteps(p, base) {
  const one = r2(base / 100);
  return { steps: [`${p}% bermaksud ${p} daripada setiap 100.`, `1% daripada ${base} = ${base} ÷ 100 = ${one}.`, `${p}% = ${one} × ${p} = ${r2(one * p)}`] };
}

/** Steps written out by hand (for word problems and one-off topics). */
export const say = (...lines) => ({ steps: lines.filter(Boolean) });
