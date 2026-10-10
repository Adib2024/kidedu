import { store } from "../store.js";
import { esc, canSpeak, pickVoice, stopSpeak, toast, sfx, notFound } from "../util.js";
import { TIPS, tipById } from "../data/tips.js";

const DONE = "tips:done";

export async function tipsList(el) {
  const done = await store.kv(DONE, []);
  el.innerHTML = `<div class="wrap page stack">
    <div class="pagehead"><a class="back" href="#/zon-ibu" aria-label="Kembali">←</a><h1>Tips & Info</h1></div>
    <section class="banner" style="background:linear-gradient(180deg,#fef3c7,#fdba74)"><h1>Topik Tips & Info</h1><span class="sub">🎧 ${TIPS.length} audio · usahawan digital & affiliate</span>
      <p class="small" style="margin-top:10px">Selesai: <b>${done.length}/${TIPS.length}</b></p></section>
    <div class="grid">${TIPS.map((t, i) => `<a class="tile" href="#/tips/${t.id}" style="--tile:${t.color}"><span class="small" style="font-weight:800;color:var(--pink)">AUDIO ${i + 1}</span><span class="em">${t.emoji}</span><span class="tt">${esc(t.title)}</span>${done.includes(t.id) ? `<span class="badge">✓</span>` : ""}</a>`).join("")}</div>
  </div>`;
}

export async function tipsView(el, { id }) {
  const t = tipById(id);
  if (!t) return notFound(el, "#/tips");
  const n = TIPS.indexOf(t);
  const done = await store.kv(DONE, []);

  // Build readable chunks (sentences) so long text plays reliably on all browsers.
  const blocks = [t.title + ".", t.intro];
  t.sections.forEach((s) => { blocks.push(s.h + "."); (s.items || []).forEach((x) => blocks.push(x)); if (s.p) blocks.push(s.p); });
  blocks.push("Tugasan hari ini. " + t.action);

  let idx = 0, playing = false, tok = 0, rate = Number(localStorage.getItem("ppl_rate") || 1);
  el.innerHTML = `<div class="wrap page article">
    <div class="pagehead"><a class="back" href="#/tips" aria-label="Kembali">←</a><h1 style="font-size:1.3rem">Audio ${n + 1}: ${esc(t.title)}</h1></div>
    ${canSpeak() ? `<div class="audio-bar no-print">
      <button class="btn sm" data-play>▶️ Main</button><button class="btn sm ghost" data-stop>⏹️</button>
      <label class="small" style="font-weight:800">Laju <select class="input" data-rate style="width:auto;padding:4px 8px">${[0.8, 1, 1.2, 1.5].map((r) => `<option value="${r}" ${r === rate ? "selected" : ""}>${r}×</option>`).join("")}</select></label>
      <div class="progress" style="min-width:120px"><i data-bar style="width:0%"></i></div>
      ${pickVoice("ms") ? "" : `<span class="small muted">(Suara BM tiada pada peranti ini — guna suara lalai)</span>`}
    </div>` : `<div class="alert info">Pelayar anda tidak menyokong audio. Sila baca teks di bawah.</div>`}
    <div class="card pad-lg">
      <div class="center" style="font-size:3.5rem">${t.emoji}</div>
      <p data-b="1" style="font-size:1.15rem;font-weight:700">${esc(t.intro)}</p>
      ${(() => { let k = 2; return t.sections.map((s) => { const hk = k++; const items = (s.items || []).map((x) => `<li data-b="${k++}">${esc(x)}</li>`).join(""); const p = s.p ? `<p data-b="${k++}" class="callout">${esc(s.p)}</p>` : ""; return `<h2 data-b="${hk}">${esc(s.h)}</h2>${items ? `<ul>${items}</ul>` : ""}${p}`; }).join(""); })()}
      <div class="callout" data-b="${blocks.length - 1}">✅ <b>Tugasan hari ini:</b> ${esc(t.action)}</div>
    </div>
    <div class="row" style="justify-content:space-between;margin-top:14px">
      ${n > 0 ? `<a class="btn sm ghost" href="#/tips/${TIPS[n - 1].id}">⬅️ Audio ${n}</a>` : "<span></span>"}
      <button class="btn ${done.includes(t.id) ? "ghost" : "lime"}" data-done>${done.includes(t.id) ? "✓ Selesai" : "Tandakan selesai"}</button>
      ${n < TIPS.length - 1 ? `<a class="btn sm ghost" href="#/tips/${TIPS[n + 1].id}">Audio ${n + 2} ➡️</a>` : "<span></span>"}
    </div>
  </div>`;

  const highlight = () => {
    el.querySelectorAll("[data-b]").forEach((b) => (b.style.background = +b.dataset.b === idx ? "var(--sun-2)" : ""));
    const bar = el.querySelector("[data-bar]");
    if (bar) bar.style.width = (idx / blocks.length) * 100 + "%";
    el.querySelector(`[data-b="${idx}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  const playFrom = () => {
    if (!playing) return;
    if (idx >= blocks.length) { playing = false; idx = 0; syncBtn(); highlight(); return; }
    highlight();
    const my = ++tok;
    const u = new SpeechSynthesisUtterance(blocks[idx]);
    const v = pickVoice("ms");
    if (v) u.voice = v;
    u.lang = v?.lang || "ms-MY";
    u.rate = rate;
    u.onend = () => { if (!playing || my !== tok) return; idx++; playFrom(); };
    u.onerror = (e) => { if (my !== tok || e.error === "interrupted" || e.error === "canceled") return; playing = false; syncBtn(); };
    window.speechSynthesis.speak(u);
  };
  const syncBtn = () => { const b = el.querySelector("[data-play]"); if (b) b.textContent = playing ? "⏸️ Jeda" : "▶️ Main"; };
  el.querySelector("[data-play]")?.addEventListener("click", () => {
    if (playing) { playing = false; window.speechSynthesis.cancel(); }
    else { playing = true; window.speechSynthesis.cancel(); playFrom(); }
    syncBtn();
  });
  el.querySelector("[data-stop]")?.addEventListener("click", () => { playing = false; idx = 0; window.speechSynthesis.cancel(); syncBtn(); highlight(); });
  el.querySelector("[data-rate]")?.addEventListener("change", (e) => { rate = Number(e.target.value); localStorage.setItem("ppl_rate", rate); if (playing) { window.speechSynthesis.cancel(); playFrom(); } });
  el.querySelector("[data-done]").onclick = () => {
    const i = done.indexOf(t.id);
    if (i >= 0) done.splice(i, 1); else { done.push(t.id); sfx("win"); toast("Tahniah! Satu lagi audio selesai 🎧"); }
    store.setKv(DONE, done, { immediate: true });
    tipsView(el, { id });
  };
  return () => { playing = false; stopSpeak(); };
}
