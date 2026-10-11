// Reusable play engines: multiple-choice quiz, result screen, memory match, hidden objects.
import { esc, sfx, speak, stopSpeak, confetti, starsFor, shuffle, sample, pick, rnd } from "./util.js";
import { levelInfo, levelTitle } from "./progression.js";
import { mascot, moodForStars } from "./mascot.js";

function xpLine(gained, total) {
  const L = levelInfo(total || 0);
  const leveled = total != null && total - gained < L.start && L.level > 1;
  return `<div class="xp-line" role="status"><b>+${gained} XP</b> · Tahap ${L.level} ${esc(levelTitle(L.level))}
    <div class="progress" style="margin-top:6px"><i style="width:${L.pct}%"></i></div>
    ${leveled ? `<div class="alert ok" style="margin-top:8px">🆙 Naik ke Tahap ${L.level}!</div>` : ""}</div>`;
}

export const autoSpeakOn = () => localStorage.getItem("ppl_autospeak") !== "off";
export const setAutoSpeak = (on) => localStorage.setItem("ppl_autospeak", on ? "on" : "off");

const PRAISE = ["Hebat! 🎉", "Bagus! 🌟", "Pandai! 👏", "Betul! 🥳", "Syabas! 💖", "Terbaik! 🚀"];
const PRAISE_EN = ["Great job! 🎉", "Awesome! 🌟", "Well done! 👏", "Correct! 🥳", "Super! 🚀"];
const ENCOURAGE = ["Tak apa, cuba lagi! 💪", "Hampir betul! 🙂", "Jom belajar bersama! 📘"];

/**
 * Multiple-choice quiz.
 * opts: { questions, onDone(score,total) -> Promise<{stars,newSticker}>, onExit(), lang, resultActions(score,total,stars) }
 */
export function runQuiz(el, opts) {
  const qs = opts.questions;
  let i = 0, score = 0, locked = false;
  const answers = []; // {q, a, c} per question — lets the server recompute the score
  const t0 = Date.now();

  const render = () => {
    const q = qs[i];
    locked = false;
    el.innerHTML = `
      <div class="game-top">
        <button class="back" data-exit aria-label="Keluar">✖</button>
        <div class="progress" aria-label="Kemajuan"><i style="width:${(i / qs.length) * 100}%"></i></div>
        <span class="star-pill">${i + 1}/${qs.length}</span>
      </div>
      <div class="card qcard">
        <div class="qprompt" ${q.visual ? "" : 'style="font-size:clamp(1.6rem,7vw,2.6rem);margin:18px 0"'}>${q.prompt}</div>
        <button class="tool" data-say title="Dengar soalan" aria-label="Dengar soalan">🔊</button>
        ${q.visual ? `<div class="qvisual ${q.vclass}">${q.visual}</div>` : ""}
        <div class="options">${q.options.map((o, k) => `<button class="opt ${q.optCls}" data-k="${k}">${o.label}</button>`).join("")}</div>
        <div class="feedback" aria-live="assertive"></div>
      </div>`;
    el.querySelector("[data-exit]").onclick = () => { stopSpeak(); opts.onExit?.(); };
    const sayIt = () => speak(q.say, { lang: q.lang });
    el.querySelector("[data-say]").onclick = sayIt;
    if (autoSpeakOn()) setTimeout(() => { if (el.isConnected) sayIt(); }, 150);
    el.querySelectorAll(".opt").forEach((b) => (b.onclick = () => answer(+b.dataset.k)));
  };

  const answer = (k) => {
    if (locked) return;
    locked = true;
    const q = qs[i];
    const btns = [...el.querySelectorAll(".opt")];
    btns.forEach((b) => (b.disabled = true));
    const ok = q.options[k].value === q.answer;
    answers.push({ q: String(q.say || q.prompt).replace(/<[^>]+>/g, "").slice(0, 100), a: q.options[k].value, c: q.answer });
    const fb = el.querySelector(".feedback");
    if (ok) {
      score++;
      btns[k].classList.add("right");
      sfx("right");
      fb.innerHTML = `<span style="color:#3c6d0b">${pick(q.lang === "en" ? PRAISE_EN : PRAISE)}</span>`;
    } else {
      btns[k].classList.add("wrong");
      const ci = q.options.findIndex((o) => o.value === q.answer);
      btns[ci]?.classList.add("right");
      sfx("wrong");
      fb.innerHTML = `<span style="color:#b4235f">${pick(ENCOURAGE)}</span>${q.explain ? `<div class="small muted">${q.explain}</div>` : ""}`;
    }
    setTimeout(() => {
      if (!el.isConnected) return; // player left the game — stop here (no stray speech/saves)
      i++;
      if (i < qs.length) render();
      else finish();
    }, ok ? 900 : 1700);
  };

  const finish = async () => {
    stopSpeak();
    el.innerHTML = `<div class="card center">Menyimpan keputusan… ⏳</div>`;
    const res = (await opts.onDone?.(score, qs.length, answers, Date.now() - t0)) || {};
    const earned = opts.starsOf ? opts.starsOf(score, qs.length) : starsFor(score, qs.length);
    showResult(el, { score, total: qs.length, earned, newSticker: res.newSticker, saveFailed: res.saveFailed, xpGained: res.xpGained, totalXp: res.totalXp, actions: opts.resultActions?.(score, qs.length) || [] });
  };

  render();
}

/** Celebration / result card. actions: [{label, cls, onClick}] */
export function showResult(el, { score, total, earned, newSticker, actions = [], message, saveFailed, xpGained, totalXp }) {
  const s = earned ?? 0;
  if (s >= 1) { sfx("win"); confetti(s * 18); }
  const title = s === 3 ? "Cemerlang!" : s === 2 ? "Bagus sekali!" : s === 1 ? "Syabas, teruskan!" : "Cuba lagi ya!";
  el.innerHTML = `
    <div class="card pad-lg result">
      <div class="mascot-say">${mascot(moodForStars(s), 112, "pop")}<div class="bubble">${title}</div></div>
      <div class="bigstars">${[1, 2, 3].map((n) => `<span class="${n <= s ? "" : "off"}">⭐</span>`).join("")}</div>
      ${total ? `<p style="font-size:1.3rem;font-weight:800">Markah: ${score} / ${total}</p>` : ""}
      ${message ? `<p>${message}</p>` : ""}
      ${s === 0 ? `<p class="muted">Dapatkan sekurang-kurangnya separuh betul untuk 1 bintang & buka tahap seterusnya.</p>` : ""}
      ${xpGained != null && !saveFailed ? xpLine(xpGained, totalXp) : ""}
      ${saveFailed ? `<div class="alert" style="margin:12px 0">⚠️ Keputusan ini belum disimpan. Semak sambungan internet, kemudian main semula untuk menyimpan bintang.</div>` : ""}
      ${newSticker ? `<div class="alert ok" style="margin:12px 0">🎁 Pelekat baru dibuka: <span style="font-size:2rem;vertical-align:middle">${newSticker}</span></div>` : ""}
      <div class="row" style="justify-content:center;margin-top:10px">
        ${actions.map((a, k) => `<button class="btn ${a.cls || ""}" data-a="${k}">${a.label}</button>`).join("")}
      </div>
    </div>`;
  el.querySelectorAll("[data-a]").forEach((b) => (b.onclick = () => actions[+b.dataset.a].onClick()));
  if (s >= 1) speak(title);
}

// ---------------- Memory match ----------------
export function runMemory(el, { pairs, cols, set, onDone, onExit }) {
  const faces = shuffle([...sample(set, pairs), ...[]]);
  const deck = shuffle([...faces, ...faces]).map((f, i) => ({ f, i, done: false }));
  let open = [], moves = 0, matched = 0, busy = false;
  const t0 = Date.now();
  el.innerHTML = `
    <div class="game-top">
      <button class="back" data-exit aria-label="Keluar">✖</button>
      <div class="progress"><i style="width:0%"></i></div>
      <span class="star-pill" data-moves>Langkah: 0</span>
    </div>
    <div class="mem-grid" style="--cols:${cols}">
      ${deck.map((c) => `<button class="mem-card" data-i="${c.i}" aria-label="Kad"><div class="in"><div class="face back-f">🐼</div><div class="face front-f">${c.f}</div></div></button>`).join("")}
    </div>`;
  el.querySelector("[data-exit]").onclick = () => onExit?.();
  const bar = el.querySelector(".progress i");
  const mv = el.querySelector("[data-moves]");
  el.querySelectorAll(".mem-card").forEach((b) => (b.onclick = () => {
    const c = deck[+b.dataset.i];
    if (busy || c.done || open.includes(c)) return;
    sfx("flip");
    b.classList.add("flip");
    open.push(c);
    if (open.length < 2) return;
    moves++;
    mv.textContent = `Langkah: ${moves}`;
    const [a, d] = open;
    if (a.f === d.f) {
      a.done = d.done = true;
      matched++;
      sfx("right");
      open.forEach((x) => el.querySelector(`[data-i="${x.i}"]`).classList.add("done"));
      open = [];
      bar.style.width = (matched / pairs) * 100 + "%";
      if (matched === pairs) setTimeout(() => { if (el.isConnected) onDone(moves, pairs, Math.round((Date.now() - t0) / 1000)); }, 600);
    } else {
      busy = true;
      setTimeout(() => {
        open.forEach((x) => el.querySelector(`[data-i="${x.i}"]`).classList.remove("flip"));
        open = [];
        busy = false;
      }, 850);
    }
  }));
}
export const memoryStars = (moves, pairs) => (moves <= pairs * 1.6 ? 3 : moves <= pairs * 2.3 ? 2 : 1);

// ---------------- Hidden objects ----------------
/**
 * scene: { bg (css background), pool: [emoji...] (distractors), targets: [emoji...] candidate targets }
 */
export function runHidden(el, { scene, count = 5, onDone, onExit, title = "Cari objek tersembunyi!" }) {
  const targets = sample(scene.targets, count);
  const distract = scene.pool.filter((e) => !targets.includes(e));
  const cols = 8, rows = 6;
  const cells = shuffle(Array.from({ length: cols * rows }, (_, i) => i)).slice(0, 34);
  const items = cells.map((c, k) => {
    const e = k < targets.length ? targets[k] : pick(distract);
    return {
      e, target: k < targets.length,
      x: ((c % cols) + 0.5 + (Math.random() - 0.5) * 0.5) * (100 / cols),
      y: (Math.floor(c / cols) + 0.5 + (Math.random() - 0.5) * 0.5) * (100 / rows),
      s: 1.3 + Math.random() * 1.1,
      r: rnd(-30, 30),
    };
  });
  let found = new Set(), wrong = 0, hints = 0;
  el.innerHTML = `
    <div class="game-top">
      <button class="back" data-exit aria-label="Keluar">✖</button>
      <div class="progress"><i style="width:0%"></i></div>
      <button class="btn sm sun" data-hint>💡 Bantuan</button>
    </div>
    <p class="center" style="font-weight:800;margin:0 0 6px">${esc(title)}</p>
    <div class="targets">${targets.map((t) => `<span class="target" data-t="${t}">${t}</span>`).join("")}</div>
    <div class="scene" style="background:${scene.bg}">
      ${(scene.decor || []).map((d) => `<span style="position:absolute;left:${d[1]}%;top:${d[2]}%;font-size:${d[3] || 3}rem;opacity:.35;pointer-events:none">${d[0]}</span>`).join("")}
      ${items.map((it, k) => `<button class="it" data-k="${k}" style="left:${it.x}%;top:${it.y}%;font-size:${it.s}rem;transform:translate(-50%,-50%) rotate(${it.r}deg)">${it.e}</button>`).join("")}
    </div>
    <p class="center small muted" data-stat>Salah tekan: 0</p>`;
  el.querySelector("[data-exit]").onclick = () => onExit?.();
  const bar = el.querySelector(".progress i");
  el.querySelector("[data-hint]").onclick = () => {
    const left = items.findIndex((it) => it.target && !found.has(it.e));
    if (left < 0) return;
    hints++;
    const b = el.querySelector(`[data-k="${left}"]`);
    b.animate([{ transform: b.style.transform + " scale(1)" }, { transform: b.style.transform + " scale(2.2)" }, { transform: b.style.transform + " scale(1)" }], { duration: 900, iterations: 2 });
  };
  el.querySelectorAll(".it").forEach((b) => (b.onclick = () => {
    const it = items[+b.dataset.k];
    if (it.target && !found.has(it.e)) {
      found.add(it.e);
      sfx("right");
      b.classList.add("found");
      el.querySelector(`[data-t="${it.e}"]`).classList.add("ok");
      bar.style.width = (found.size / targets.length) * 100 + "%";
      if (found.size === targets.length) setTimeout(() => { if (el.isConnected) onDone(wrong, hints); }, 700);
    } else if (!it.target) {
      wrong++;
      sfx("wrong");
      b.animate([{ opacity: 1 }, { opacity: 0.3 }, { opacity: 1 }], { duration: 400 });
      el.querySelector("[data-stat]").textContent = `Salah tekan: ${wrong}`;
    }
  }));
}
export const hiddenStars = (wrong, hints) => {
  const p = wrong + hints * 2;
  return p <= 2 ? 3 : p <= 6 ? 2 : 1;
};
