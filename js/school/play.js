// Interactive round player for Sekolah: all question types, three modes, animations and an answer log
// the server can re-score. Modes: "latihan" (learn, hints, explanations), "masa" (shared countdown),
// "bos" (3 lives, boss HP drops with every correct answer).
import { esc, sfx, speak, stopSpeak, shuffle, pick, canSpeak } from "../util.js";
import { mascot } from "../mascot.js";
import { autoSpeakOn } from "../engine.js";
import { norm, correctOf, isCorrect, plain, silent, difficulty } from "./qkit.js";

const PRAISE = { ms: ["Hebat!", "Betul!", "Bagus!", "Pandai!", "Syabas!", "Terbaik!"], en: ["Great!", "Correct!", "Well done!", "Super!", "Awesome!"] };
const OOPS = { ms: ["Hampir!", "Tak apa!", "Cuba lagi nanti!"], en: ["Almost!", "Nice try!", "Keep going!"] };
const HINTS_PER_ROUND = 2;

/** Worked solution ("Langkah demi langkah") of a question, or "" — used after a wrong answer and in review lists. */
export function stepsHtml(q, open = false) {
  if (!q.steps?.length) return "";
  return `<details class="q2-steps"${open ? " open" : ""}><summary>🪜 Langkah demi langkah</summary>${q.work || ""}<ol>${q.steps.map((t) => `<li>${esc(t)}</li>`).join("")}</ol></details>`;
}

export const LEVELS = [["🌱", "Mudah"], ["🌿", "Sederhana"], ["🌳", "Mencabar"]];
/**
 * Adaptive difficulty for Latihan: the pool is split into three bands by difficulty(); every next question
 * comes from the child's current band — two right in a row moves up, a wrong answer moves down.
 */
export function makeLadder(pool, level = 1) {
  const sorted = pool.map((q) => [difficulty(q), q]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
  const third = Math.ceil(sorted.length / 3);
  const bands = [sorted.slice(0, third), sorted.slice(third, 2 * third), sorted.slice(2 * third)].map((b) => shuffle(b));
  let streak = 0, last = null;
  return {
    get level() { return level; },
    /** Next question from the current band (or the nearest band that still has one), avoiding a third same type in a row. */
    take() {
      for (const d of [0, -1, 1, -2, 2]) {
        const b = bands[level + d];
        if (!b?.length) continue;
        const k = b.findIndex((q) => q.type !== last);
        const q = b.splice(k >= 0 ? k : b.length - 1, 1)[0];
        last = q.type;
        return q;
      }
      return null;
    },
    /** Record an answer; returns +1 / −1 when the level changes, else 0. */
    result(ok) {
      if (ok) { if (++streak >= 2 && level < 2) { level++; streak = 0; return 1; } return 0; }
      streak = 0;
      if (level > 0) { level--; return -1; }
      return 0;
    },
  };
}

/**
 * opts: { questions, pool?, count?, mode, subject:{boss,bossName,accent,lang}, timeSec, onFinish(result), onExit() }
 * result: { score, total, answers:[{q,a,c}], durationMs, wrong:[question], asked:[question], level?, maxCombo, lives, timedOut, bossDefeated }
 * `pool` (Latihan only): more questions than needed — `count` of them are chosen as the child plays (see makeLadder).
 */
export function playRound(el, opts) {
  // listening questions need speech synthesis; without it they are asked in written form
  const mode = opts.mode || "latihan", subj = opts.subject || {};
  const prep = (q) => (canSpeak() ? q : silent(q));
  const count = opts.count || opts.questions?.length || 10;
  const ladder = mode === "latihan" && opts.pool?.length > count ? makeLadder(opts.pool.map(prep)) : null;
  const qs = ladder ? Array.from({ length: count }, (_, i) => (i === 0 ? ladder.take() : null)) : opts.questions.map(prep);
  const lang = subj.lang || "ms";
  // __playoraTimeScale: lets automated tests shorten the time challenge; never set by the app itself
  const scale = Number(globalThis.__playoraTimeScale) || 1;
  const state = { i: 0, score: 0, combo: 0, maxCombo: 0, lives: 3, hints: HINTS_PER_ROUND, done: false, timeLeft: Math.max(3, Math.round((opts.timeSec || 120) * scale)), results: [] };
  const answers = [], wrong = [];
  const t0 = Date.now();
  let timer = null, keyHandler = null, advanceT = null;
  /** Keyboard shortcuts for the current question; detaches itself if the page was left. */
  const onKey = (fn) => {
    keyHandler = (e) => { if (!el.isConnected) { stop(); return; } if (e.target?.matches?.("input, textarea, select")) return; fn(e); };
    document.addEventListener("keydown", keyHandler);
  };

  el.innerHTML = `
    <div class="play play-${mode}" style="--acc:${subj.accent || "#d1137a"}">
      <div class="play-top">
        <button class="back" data-exit aria-label="Keluar">✖</button>
        <div class="play-dots" aria-hidden="true">${qs.map(() => `<i></i>`).join("")}</div>
        <span class="star-pill" data-count>1/${qs.length}</span>
      </div>
      ${mode === "masa" ? `<div class="timer" role="timer" aria-live="off"><div class="timer-bar"><i></i></div><b data-time>${state.timeLeft}s</b></div>` : ""}
      ${mode === "bos" ? `<div class="boss-zone">
          <div class="boss" aria-hidden="true"><span class="boss-e">${subj.boss || "🐉"}</span></div>
          <div class="boss-info"><b>${esc(subj.bossName || "Bos")}</b><div class="hp" aria-label="Nyawa bos"><i style="width:100%"></i></div></div>
          <div class="hearts" aria-label="Nyawa kamu: 3">${"<span>❤️</span>".repeat(3)}</div>
        </div>` : ""}
      ${ladder ? `<div class="lvl" data-level aria-live="polite"></div>` : ""}
      <div class="combo" data-combo hidden></div>
      <div class="qstage" data-stage></div>
      <div class="play-buddy" aria-hidden="true">${mascot("happy", 64)}</div>
    </div>`;
  const root = el.querySelector(".play");
  const stage = el.querySelector("[data-stage]");
  const dots = [...el.querySelectorAll(".play-dots i")];
  el.querySelector("[data-exit]").onclick = () => { stop(); stopSpeak(); opts.onExit?.(); };

  const buddy = (mood) => {
    const b = el.querySelector(".play-buddy");
    if (!b) return;
    b.innerHTML = mascot(mood, 64);
    b.classList.remove("hop"); void b.offsetWidth; b.classList.add("hop");
  };
  const stop = () => {
    state.done = true;
    clearInterval(timer); clearTimeout(advanceT);
    if (keyHandler) document.removeEventListener("keydown", keyHandler);
    keyHandler = null;
  };

  // ------------------------------------------------------------ timer (masa)
  if (mode === "masa") {
    const total = state.timeLeft;
    const bar = el.querySelector(".timer-bar i"), lbl = el.querySelector("[data-time]");
    timer = setInterval(() => {
      if (!el.isConnected) return stop();
      state.timeLeft--;
      bar.style.width = `${(state.timeLeft / total) * 100}%`;
      lbl.textContent = `${state.timeLeft}s`;
      root.classList.toggle("hurry", state.timeLeft <= 10);
      if (state.timeLeft === 10) sfx("flip");
      if (state.timeLeft <= 0) { timeUp(); }
    }, 1000);
  }

  // ------------------------------------------------------------ render one question
  function show() {
    if (state.done) return;
    const q = qs[state.i];
    dots.forEach((d, k) => d.classList.toggle("now", k === state.i));
    el.querySelector("[data-count]").textContent = `${state.i + 1}/${qs.length}`;
    const say = q.listen || plain(q.say || q.prompt);
    const promptHtml = q.type === "fill" ? q.prompt.replace("___", `<span class="blank" data-blank>?</span>`) : q.prompt;
    stage.innerHTML = `<article class="qcard2 enter" data-type="${q.type}">
        <div class="q2-head">
          <div class="q2-prompt" ${q.lang === "en" ? 'lang="en"' : ""}>${promptHtml}</div>
          <button class="tool q2-say" data-say aria-label="Dengar soalan">🔊</button>
        </div>
        ${q.listen ? `<div class="q2-visual"><button class="listen-btn" data-listen aria-label="${q.lang === "en" ? "Listen" : "Dengar"}"><span class="lb-e">🎧</span><span>${q.lang === "en" ? "Listen" : "Dengar"}</span></button></div>` : ""}
        ${q.visual ? `<div class="q2-visual">${q.visual}</div>` : ""}
        <div class="q2-body" data-body></div>
        <div class="q2-foot">
          ${mode === "latihan" ? `<button class="chip q2-hint" data-hint ${state.hints ? "" : "disabled"}>💡 Bantuan (${state.hints})</button>` : "<span></span>"}
          <div class="q2-fb" data-qfb aria-live="assertive"></div>
        </div>
      </article>`;
    stage.querySelector("[data-say]").onclick = () => speak(say, { lang: q.lang || lang });
    const lb = stage.querySelector("[data-listen]");
    if (lb) lb.onclick = () => { lb.classList.remove("playing"); void lb.offsetWidth; lb.classList.add("playing"); speak(q.listen, { lang: q.lang || lang, rate: 0.8, onend: () => lb.classList.remove("playing") }); };
    if (autoSpeakOn() || q.listen) setTimeout(() => { if (el.isConnected && !state.done && qs[state.i] === q) (lb ? lb.click() : speak(say, { lang: q.lang || lang })); }, 250);
    const body = stage.querySelector("[data-body]");
    stage.querySelector(".qcard2").__q = q; // read by automated tests (not rendered)
    (RENDER[q.type] || RENDER.mcq)(body, q, (given, meta) => answer(q, given, meta));
    stage.querySelector("[data-hint]")?.addEventListener("click", (e) => useHint(q, body, e.currentTarget));
  }

  function useHint(q, body, btn) {
    if (!state.hints) return;
    const did = HINT[q.type]?.(body, q);
    if (!did) return;
    state.hints--;
    btn.textContent = `💡 Bantuan (${state.hints})`;
    btn.disabled = !state.hints;
    sfx("pop");
  }

  // ------------------------------------------------------------ answer handling
  function answer(q, given, meta = {}) {
    if (state.done || q !== qs[state.i]) return;
    const ok = q.type === "match" ? given === "ok" : isCorrect(q, given);
    answers.push({ q: plain(q.say || q.prompt).slice(0, 100), a: q.type === "match" ? given : norm(q, given), c: correctOf(q) });
    const card = stage.querySelector(".qcard2");
    const fb = stage.querySelector("[data-qfb]");
    stage.querySelectorAll("button, input").forEach((b) => { if (!b.matches("[data-say]")) b.disabled = true; });
    if (keyHandler) { document.removeEventListener("keydown", keyHandler); keyHandler = null; }
    dots[state.i].classList.add(ok ? "ok" : "no");
    if (ok) {
      state.score++; state.combo++; state.maxCombo = Math.max(state.maxCombo, state.combo);
      card.classList.add("good");
      fb.innerHTML = `<span class="fb-ok">✔ ${esc(pick(PRAISE[q.lang === "en" ? "en" : "ms"]))}</span>`;
      sfx("right");
      burst(meta.from || card, state.combo >= 3 ? ["⭐", "✨", "🔥"] : ["⭐", "✨"]);
      floatText(meta.from || card, "+1");
      showCombo();
      buddy(state.combo >= 3 ? "cheer" : "happy");
      if (mode === "bos") hitBoss();
    } else {
      state.combo = 0; showCombo();
      card.classList.add("bad");
      fb.innerHTML = `<span class="fb-no">✘ ${esc(pick(OOPS[q.lang === "en" ? "en" : "ms"]))}</span>
        <div class="q2-correct">Jawapan: <b>${esc(q.type === "match" ? "padankan semua pasangan" : q.answer)}</b></div>
        ${q.explain ? `<div class="q2-explain">💡 ${esc(q.explain)}</div>` : ""}
        ${mode === "latihan" ? stepsHtml(q, true) : ""}`;
      sfx("wrong");
      buddy("oops");
      wrong.push(q);
      if (mode === "bos") loseLife();
    }
    if (state.done) return; // a lost last life ends the round inside loseLife()
    const last = state.i >= qs.length - 1;
    if (ladder) {
      const move = ladder.result(ok);
      if (!last) qs[state.i + 1] = ladder.take() || qs[state.i];
      showLevel(move);
    }
    if (mode === "latihan" && !ok) {
      const go = document.createElement("button");
      go.className = "btn q2-next"; go.textContent = last ? "Lihat keputusan ➜" : "Teruskan ➜";
      go.onclick = next;
      fb.appendChild(go);
      go.focus();
    } else {
      advanceT = setTimeout(next, ok ? (mode === "masa" ? 550 : 850) : mode === "masa" ? 1300 : 1900);
    }
  }
  function next() {
    clearTimeout(advanceT);
    if (state.done || !el.isConnected) return;
    state.i++;
    if (state.i >= qs.length) finish();
    else show();
  }
  function showLevel(move = 0) {
    const box = el.querySelector("[data-level]");
    if (!box) return;
    const [e, name] = LEVELS[ladder.level];
    box.innerHTML = `<span class="lvl-dots" aria-hidden="true">${LEVELS.map((_, k) => `<i class="${k <= ladder.level ? "on" : ""}"></i>`).join("")}</span>${e} Tahap: <b>${name}</b>${move > 0 ? ` <span class="lvl-move up">⬆ Lebih mencabar!</span>` : move < 0 ? ` <span class="lvl-move down">Kita cuba yang lebih mudah</span>` : ""}`;
    box.dataset.lv = String(ladder.level);
  }
  if (ladder) showLevel();
  function showCombo() {
    const c = el.querySelector("[data-combo]");
    if (state.combo >= 3) {
      c.hidden = false;
      c.innerHTML = `🔥 Combo ×${state.combo}`;
      c.classList.remove("pop"); void c.offsetWidth; c.classList.add("pop");
    } else c.hidden = true;
  }
  function hitBoss() {
    const hp = Math.max(0, 100 - state.score * 10);
    el.querySelector(".hp i").style.width = `${hp}%`;
    const b = el.querySelector(".boss");
    b.classList.remove("hit"); void b.offsetWidth; b.classList.add("hit");
    floatText(b, "−10", "dmg");
  }
  function loseLife() {
    state.lives--;
    const hearts = [...el.querySelectorAll(".hearts span")];
    const h = hearts[state.lives];
    if (h) { h.classList.add("lost"); }
    el.querySelector(".hearts").setAttribute("aria-label", `Nyawa kamu: ${state.lives}`);
    const b = el.querySelector(".boss");
    b.classList.remove("attack"); void b.offsetWidth; b.classList.add("attack");
    root.classList.remove("ouch"); void root.offsetWidth; root.classList.add("ouch");
    if (state.lives <= 0) {
      fillRemaining();
      advanceT = setTimeout(() => { stop(); finish(true); }, 1500);
      state.done = true;
    }
  }
  /** Unanswered questions count as wrong (timer ran out / no lives left) so the log always has `total` rows. */
  function fillRemaining() {
    for (let k = answers.length; k < qs.length; k++) {
      const q = qs[k];
      answers.push({ q: plain(q.say || q.prompt).slice(0, 100), a: "", c: correctOf(q) });
      dots[k]?.classList.add("no");
      if (!wrong.includes(q)) wrong.push(q);
    }
  }
  function timeUp() {
    if (state.done) return;
    clearInterval(timer);
    fillRemaining();
    state.done = true;
    stage.insertAdjacentHTML("afterbegin", `<div class="timeup">⏰ Masa tamat!</div>`);
    stage.querySelectorAll("button").forEach((b) => (b.disabled = true));
    sfx("wrong");
    advanceT = setTimeout(() => { stop(); finish(false, true); }, 1300);
  }
  function finish(lostAllLives = false, timedOut = false) {
    stop();
    stopSpeak();
    opts.onFinish?.({
      score: state.score, total: qs.length, answers: answers.slice(0, qs.length), durationMs: Date.now() - t0, wrong, maxCombo: state.maxCombo,
      asked: qs.filter(Boolean), level: ladder ? ladder.level : undefined,
      lives: state.lives, timedOut, lostAllLives, bossDefeated: mode === "bos" && !lostAllLives && state.score >= 7, timeLeft: state.timeLeft,
    });
  }

  // ------------------------------------------------------------ renderers per type
  const RENDER = {
    mcq(body, q, done) {
      const long = q.choices.some((c) => String(c).length > 18);
      const pics = q.choices.every((c) => /^\p{Extended_Pictographic}[\u{FE0F}\u{200D}\p{Extended_Pictographic}]*$/u.test(c)); // picture answers
      body.innerHTML = `<div class="opts2 ${long ? "long" : ""} ${pics ? "pics" : ""} n${q.choices.length}">${q.choices.map((c, k) =>
        `<button class="opt2" data-v="${esc(c)}" style="--i:${k}"><kbd>${k + 1}</kbd><span>${esc(c)}</span></button>`).join("")}</div>`;
      const pickIt = (b) => {
        const ok = isCorrect(q, b.dataset.v);
        b.classList.add(ok ? "right" : "wrong");
        if (!ok) body.querySelector(`.opt2[data-v="${CSS.escape(q.answer)}"]`)?.classList.add("right");
        const blank = stage.querySelector("[data-blank]");
        if (blank) { blank.textContent = b.dataset.v; blank.classList.add(ok ? "filled-ok" : "filled-no"); }
        done(b.dataset.v, { from: b });
      };
      body.querySelectorAll(".opt2").forEach((b) => (b.onclick = () => pickIt(b)));
      onKey((e) => { const n = Number(e.key); const b = body.querySelectorAll(".opt2")[n - 1]; if (b && !b.disabled) { e.preventDefault(); pickIt(b); } });
    },
    tf(body, q, done) { RENDER.mcq(body, { ...q, choices: q.choices }, done); body.querySelector(".opts2").classList.add("tf"); },
    fill(body, q, done) { RENDER.mcq(body, q, done); body.querySelector(".opts2").classList.add("chips2"); },
    input(body, q, done) {
      let v = "";
      body.innerHTML = `<div class="ans-display" aria-live="polite"><span data-v>&nbsp;</span>${q.unit ? `<small>${esc(q.unit)}</small>` : ""}</div>
        <div class="keypad">${["1", "2", "3", "4", "5", "6", "7", "8", "9", q.decimal ? "." : "−", "0", "⌫"].map((k) => `<button class="key" data-k="${k}" ${k === "−" ? 'aria-label="tolak" disabled style="visibility:hidden"' : ""}>${k}</button>`).join("")}
        <button class="key ok" data-ok disabled>Semak ✓</button></div>`;
      const disp = body.querySelector("[data-v]"), okBtn = body.querySelector("[data-ok]");
      const upd = () => { disp.textContent = v || " "; okBtn.disabled = !v || v === "."; disp.parentElement.classList.remove("bump"); void disp.offsetWidth; disp.parentElement.classList.add("bump"); };
      const press = (k) => {
        if (k === "⌫") v = v.slice(0, -1);
        else if (k === ".") { if (!v.includes(".")) v = (v || "0") + "."; }
        else if (v.replace(".", "").length < 9) v = v === "0" ? k : v + k;
        sfx("flip"); upd();
      };
      const submit = () => {
        if (okBtn.disabled) return;
        const ok = isCorrect(q, v);
        disp.parentElement.classList.add(ok ? "right" : "wrong");
        done(v, { from: disp.parentElement });
      };
      body.querySelectorAll("[data-k]").forEach((b) => (b.onclick = () => press(b.dataset.k)));
      okBtn.onclick = submit;
      onKey((e) => {
        if (/^[0-9]$/.test(e.key)) { press(e.key); e.preventDefault(); }
        else if ((e.key === "." || e.key === ",") && q.decimal) { press("."); e.preventDefault(); }
        else if (e.key === "Backspace") { press("⌫"); e.preventDefault(); }
        else if (e.key === "Enter") { submit(); e.preventDefault(); }
      });
    },
    order(body, q, done) {
      const placed = [];
      const tiles = q.tiles.map((t, k) => ({ t, k }));
      body.innerHTML = `<div class="order-line" data-line aria-label="Jawapan anda"><span class="order-ph">Tekan perkataan di bawah mengikut urutan</span></div>
        <div class="order-bank" data-bank>${tiles.map(({ t, k }) => `<button class="tile2" data-k="${k}" style="--i:${k}">${esc(t)}</button>`).join("")}</div>
        <div class="order-actions"><button class="chip" data-clear>↺ Mula semula</button><button class="btn" data-check disabled>Semak ✓</button></div>`;
      const line = body.querySelector("[data-line]"), bank = body.querySelector("[data-bank]"), check = body.querySelector("[data-check]");
      const draw = () => {
        line.innerHTML = placed.length ? placed.map((k) => `<button class="tile2 placed" data-p="${k}">${esc(q.tiles[k])}</button>`).join(q.joiner === "" ? "" : `<span class="j">${esc(q.joiner.trim())}</span>`) : `<span class="order-ph">Tekan perkataan di bawah mengikut urutan</span>`;
        bank.querySelectorAll(".tile2").forEach((b) => b.classList.toggle("used", placed.includes(+b.dataset.k)));
        check.disabled = placed.length !== q.tiles.length;
        line.querySelectorAll("[data-p]").forEach((b) => (b.onclick = () => { placed.splice(placed.indexOf(+b.dataset.p), 1); sfx("flip"); draw(); }));
      };
      bank.querySelectorAll(".tile2").forEach((b) => (b.onclick = () => { const k = +b.dataset.k; if (placed.includes(k)) return; placed.push(k); sfx("pop"); draw(); }));
      body.querySelector("[data-clear]").onclick = () => { placed.length = 0; draw(); };
      check.onclick = () => {
        const given = placed.map((k) => q.tiles[k]).join(q.joiner);
        const ok = isCorrect(q, given);
        line.classList.add(ok ? "right" : "wrong");
        done(given, { from: line });
      };
      body._place = (k) => { if (!placed.includes(k)) { placed.push(k); draw(); } };
      body._placed = placed;
    },
    match(body, q, done) {
      const left = q.pairs.map(([l], k) => ({ l, k })), right = shuffle(q.pairs.map(([, r], k) => ({ r, k })));
      let sel = null, matched = 0, mistakes = 0;
      const colors = ["#ffd23f", "#8fd3ff", "#b5ea6a", "#ff8cc6", "#c4b5fd", "#fdba74"];
      body.innerHTML = `<div class="match2"><div class="mcol">${left.map(({ l, k }) => `<button class="mitem" data-l="${k}">${esc(l)}</button>`).join("")}</div>
        <div class="mcol">${right.map(({ r, k }) => `<button class="mitem" data-r="${k}">${esc(r)}</button>`).join("")}</div></div>
        <p class="small muted center" style="margin:8px 0 0">Tekan satu di kiri, kemudian pasangannya di kanan.</p>`;
      body.querySelectorAll("[data-l]").forEach((b) => (b.onclick = () => { body.querySelectorAll("[data-l]").forEach((x) => x.classList.remove("sel")); sel = +b.dataset.l; b.classList.add("sel"); sfx("pop"); }));
      body.querySelectorAll("[data-r]").forEach((b) => (b.onclick = () => {
        if (sel == null) { b.classList.remove("nudge"); void b.offsetWidth; b.classList.add("nudge"); return; }
        const L = body.querySelector(`[data-l="${sel}"]`);
        if (+b.dataset.r === sel) {
          const c = colors[matched % colors.length];
          for (const x of [L, b]) { x.classList.remove("sel"); x.classList.add("done"); x.style.setProperty("--mc", c); x.disabled = true; }
          matched++; sfx("right"); burst(b, ["✨"], 6);
          sel = null;
          if (matched === q.pairs.length) done(mistakes <= 1 ? "ok" : "x", { from: b });
        } else {
          mistakes++; sfx("wrong");
          for (const x of [L, b]) { x.classList.remove("shake"); void x.offsetWidth; x.classList.add("shake"); }
        }
      }));
      body._reveal = () => { const k = left.find(({ k }) => !body.querySelector(`[data-l="${k}"]`).disabled)?.k; if (k == null) return false; body.querySelector(`[data-l="${k}"]`).click(); body.querySelector(`[data-r="${k}"]`).click(); return true; };
    },
  };
  const HINT = {
    mcq(body, q) { const wrongs = [...body.querySelectorAll(".opt2")].filter((b) => !isCorrect(q, b.dataset.v) && !b.classList.contains("gone")); const n = Math.max(1, Math.floor(wrongs.length / 2)); shuffle(wrongs).slice(0, n).forEach((b) => { b.classList.add("gone"); b.disabled = true; }); return wrongs.length > 0; },
    tf: () => false,
    fill(body, q) { return HINT.mcq(body, q); },
    input(body, q) { const fb = stage.querySelector("[data-qfb]"); if (fb.querySelector(".q2-explain")) return false; const a = String(q.answer); fb.innerHTML = `<div class="q2-explain">💡 ${esc(q.explain || `Jawapan bermula dengan ${a[0]}${a.length > 1 ? " dan ada " + a.replace(".", "").length + " digit" : ""}.`)}</div>`; return true; },
    order(body, q) { const firstWrong = q.parts.findIndex((p, k) => q.tiles[body._placed[k]] !== p); if (firstWrong < 0) return false; body._placed.length = firstWrong; const k = q.tiles.findIndex((t, idx) => t === q.parts[firstWrong] && !body._placed.includes(idx)); body._place(k); return true; },
    match(body) { return body._reveal(); },
  };

  show();
  return { stop };
}

// ------------------------------------------------------------ particles
export function burst(fromEl, chars = ["⭐", "✨"], n = 10) {
  if (!fromEl?.getBoundingClientRect || matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  const r = fromEl.getBoundingClientRect();
  const box = document.createElement("div");
  box.className = "burst";
  box.style.left = r.left + r.width / 2 + "px";
  box.style.top = r.top + r.height / 2 + "px";
  for (let k = 0; k < n; k++) {
    const s = document.createElement("i");
    const a = (Math.PI * 2 * k) / n + Math.random() * 0.5, d = 50 + Math.random() * 60;
    s.textContent = chars[k % chars.length];
    s.style.setProperty("--dx", `${Math.cos(a) * d}px`);
    s.style.setProperty("--dy", `${Math.sin(a) * d - 20}px`);
    s.style.animationDelay = `${Math.random() * 60}ms`;
    box.appendChild(s);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 900);
}
function floatText(fromEl, text, cls = "") {
  if (!fromEl?.getBoundingClientRect) return;
  const r = fromEl.getBoundingClientRect();
  const s = document.createElement("div");
  s.className = `float-txt ${cls}`;
  s.textContent = text;
  s.style.left = r.left + r.width / 2 + "px";
  s.style.top = r.top + "px";
  document.body.appendChild(s);
  setTimeout(() => s.remove(), 1000);
}
