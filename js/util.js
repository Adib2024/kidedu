// Shared helpers: escaping, randomness, sound, speech, confetti, toast, modal.

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ESC[c]);

// ---------- randomness ----------
export const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export const sample = (arr, n) => shuffle(arr).slice(0, n);
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

/** Build a multiple choice option list from a correct value and distractors (deduped). */
export function choices(correct, distractors, n = 4, key = (x) => String(x)) {
  const seen = new Set([key(correct)]);
  const out = [correct];
  for (const d of shuffle(distractors)) {
    if (out.length >= n) break;
    if (!seen.has(key(d))) { seen.add(key(d)); out.push(d); }
  }
  return shuffle(out);
}

/** Numeric distractors near a value. */
export function nearNumbers(value, n = 3, spread = 5, min = 0) {
  const set = new Set();
  let guard = 0;
  while (set.size < n && guard++ < 200) {
    const d = value + rnd(-spread, spread);
    if (d !== value && d >= min) set.add(d);
  }
  let k = 1;
  while (set.size < n) { if (value + k !== value) set.add(value + k); k++; }
  return [...set];
}

// ---------- dates ----------
export const todayKey = (d = new Date()) => {
  const z = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
};
export const addDays = (key, n) => {
  const [y, m, d] = key.split("-").map(Number);
  return todayKey(new Date(y, m - 1, d + n));
};
const HARI = ["Ahad", "Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu"];
const BULAN = ["Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September", "Oktober", "November", "Disember"];
export const HARI_PENDEK = ["Ahd", "Isn", "Sel", "Rab", "Kha", "Jum", "Sab"];
export function prettyDate(key) {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return `${HARI[dt.getDay()]}, ${d} ${BULAN[m - 1]} ${y}`;
}
export const monthName = (m) => BULAN[m];
export const dayName = (i) => HARI[i];

// ---------- stars ----------
export function starsFor(score, total) {
  const r = total ? score / total : 0;
  if (r >= 0.9) return 3;
  if (r >= 0.7) return 2;
  if (r >= 0.5) return 1;
  return 0;
}
export const starStr = (n, max = 3) => "⭐".repeat(n) + "☆".repeat(Math.max(0, max - n));

// ---------- toast ----------
let toastTimer;
export function toast(msg, ms = 2200) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), ms);
}

// ---------- modal ----------
export function modal(html, { onMount, dismissable = true } = {}) {
  const bg = document.createElement("div");
  bg.className = "modal-bg";
  bg.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
  const close = () => bg.remove();
  if (dismissable) bg.addEventListener("click", (e) => { if (e.target === bg) close(); });
  document.body.appendChild(bg);
  onMount?.(bg.firstElementChild, close);
  return close;
}
export function confirmBox(msg, okLabel = "Ya") {
  return new Promise((resolve) => {
    modal(`<p style="font-weight:800;font-size:1.1rem">${esc(msg)}</p>
      <div class="row" style="justify-content:flex-end"><button class="btn ghost sm" data-no>Batal</button><button class="btn sm" data-yes>${esc(okLabel)}</button></div>`,
    { onMount: (m, close) => {
      m.querySelector("[data-no]").onclick = () => { close(); resolve(false); };
      m.querySelector("[data-yes]").onclick = () => { close(); resolve(true); };
    } });
  });
}

// ---------- sound (WebAudio synth, no files) ----------
let ctx;
const soundOn = () => localStorage.getItem("ppl_sound") !== "off";
export const setSound = (on) => localStorage.setItem("ppl_sound", on ? "on" : "off");
export const isSoundOn = soundOn;
function tone(freq, start, dur, type = "sine", vol = 0.18) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, ctx.currentTime + start);
  g.gain.linearRampToValueAtTime(vol, ctx.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
  o.connect(g).connect(ctx.destination);
  o.start(ctx.currentTime + start);
  o.stop(ctx.currentTime + start + dur + 0.05);
}
export function sfx(kind) {
  if (!soundOn()) return;
  try {
    ctx ||= new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    if (kind === "right") { tone(660, 0, 0.12, "triangle"); tone(990, 0.1, 0.22, "triangle"); }
    else if (kind === "wrong") { tone(220, 0, 0.18, "square", 0.08); tone(180, 0.15, 0.25, "square", 0.08); }
    else if (kind === "win") { [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.12, 0.3, "triangle")); }
    else if (kind === "pop") { tone(880, 0, 0.08, "sine", 0.12); }
    else if (kind === "flip") { tone(500, 0, 0.06, "sine", 0.08); }
  } catch { /* audio unavailable */ }
}

// ---------- speech (Web Speech API) ----------
let voices = [];
function loadVoices() { voices = window.speechSynthesis?.getVoices?.() || []; }
if ("speechSynthesis" in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}
export const canSpeak = () => "speechSynthesis" in window;
export function pickVoice(lang = "ms") {
  if (!voices.length) loadVoices();
  const prefs = lang === "en" ? ["en-GB", "en-US", "en"] : ["ms-MY", "ms", "id-ID", "id"];
  for (const p of prefs) {
    const v = voices.find((v) => v.lang?.toLowerCase().startsWith(p.toLowerCase()));
    if (v) return v;
  }
  return null;
}
export function speak(text, { lang = "ms", rate = 0.95, onend, onboundary } = {}) {
  if (!canSpeak() || !text) { onend?.(); return null; }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const v = pickVoice(lang);
  if (v) u.voice = v;
  u.lang = v?.lang || (lang === "en" ? "en-US" : "ms-MY");
  u.rate = rate;
  u.pitch = 1.05;
  if (onend) u.onend = onend;
  if (onboundary) u.onboundary = onboundary;
  window.speechSynthesis.speak(u);
  return u;
}
export const stopSpeak = () => canSpeak() && window.speechSynthesis.cancel();

// ---------- confetti ----------
export function confetti(n = 40, set = ["🎉", "⭐", "🍬", "🎈", "🌈", "💖", "🍭"]) {
  const box = document.createElement("div");
  box.className = "confetti";
  for (let i = 0; i < n; i++) {
    const s = document.createElement("i");
    s.textContent = pick(set);
    s.style.left = Math.random() * 100 + "vw";
    s.style.animationDuration = 1.8 + Math.random() * 1.8 + "s";
    s.style.animationDelay = Math.random() * 0.6 + "s";
    s.style.fontSize = 18 + Math.random() * 20 + "px";
    box.appendChild(s);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 4200);
}

export function download(filename, dataUrl) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
