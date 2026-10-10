import { store } from "../store.js";
import { esc, speak, stopSpeak, canSpeak, starStr, sfx, notFound } from "../util.js";
import { BOOKS, bookById } from "../data/books.js";
import { runQuiz } from "../engine.js";
import { Q } from "../data/questions.js";

const aid = (id) => `buku:${id}`;

export function booksList(el) {
  el.innerHTML = `<div class="wrap page stack">
    <section class="banner"><span class="deco" style="left:12px;top:8px">📚</span><span class="deco" style="right:12px;top:10px">🐰</span>
      <h1>Koleksi Buku Cerita</h1><span class="sub">📖 ${BOOKS.length} cerita · boleh dengar audio</span></section>
    <div class="grid">
      ${BOOKS.filter((b) => store.isPublished(`buku:${b.id}`)).map((b) => {
        const s = store.starsOf(aid(b.id));
        return `<a class="book-cover" href="#/buku/${b.id}" style="background:linear-gradient(160deg,#fff,${b.color})">
          <span class="em">${b.emoji}</span><span class="tt">${esc(b.title)}</span>
          <span class="small muted" style="margin-top:6px">${s ? starStr(s) : `${b.pages.length} halaman`}</span>
          ${s ? `<span class="badge">DIBACA</span>` : ""}</a>`;
      }).join("")}
    </div>
  </div>`;
}

export function bookRead(el, { id }) {
  const b = bookById(id);
  if (!b || !store.isPublished(`buku:${b.id}`)) return notFound(el, "#/buku");
  let i = 0;
  let auto = false;
  const pages = [...b.pages, { art: "🌟📖🌟", bg: "#fef9c3", text: `<b>Pengajaran:</b> ${b.moral}`, end: true }];

  const view = document.createElement("div");
  view.className = "wrap page book";
  el.replaceChildren(view);

  const read = () => {
    const p = pages[i];
    const plain = p.text.replace(/<[^>]+>/g, "");
    const textEl = view.querySelector(".book-text");
    const words = textEl.textContent;
    speak(plain, {
      rate: 0.9,
      onboundary: (e) => {
        if (e.name && e.name !== "word") return;
        const start = e.charIndex;
        let end = words.indexOf(" ", start);
        if (end < 0) end = words.length;
        if (p.end) return;
        textEl.innerHTML = `${esc(words.slice(0, start))}<span class="hl">${esc(words.slice(start, end))}</span>${esc(words.slice(end))}`;
      },
      onend: () => {
        if (!p.end) textEl.textContent = words;
        if (auto && i < pages.length - 1) setTimeout(() => { i++; draw(true); }, 700);
        else if (auto) { auto = false; syncAuto(); }
      },
    });
  };
  const syncAuto = () => {
    const btn = view.querySelector("[data-auto]");
    if (btn) btn.textContent = auto ? "⏸️ Henti" : "▶️ Baca Automatik";
  };

  const draw = (speakNow = false) => {
    const p = pages[i];
    view.innerHTML = `
      <div class="pagehead"><a class="back" href="#/buku" aria-label="Kembali">←</a><h1 style="font-size:1.3rem">${esc(b.title)}</h1></div>
      <div class="book-page" data-swipe>
        <div class="book-art" style="background:${p.bg}">${p.art}</div>
        <div class="book-text">${p.end ? p.text : esc(p.text)}</div>
      </div>
      <div class="book-nav">
        <button class="btn ghost" data-prev ${i === 0 ? "disabled" : ""} aria-label="Halaman sebelum">⬅️</button>
        <span style="font-weight:800">${i + 1} / ${pages.length}</span>
        ${p.end ? `<button class="btn lime" data-quiz>📝 Jawab Kuiz</button>` : `<button class="btn" data-next aria-label="Halaman seterusnya">➡️</button>`}
      </div>
      ${canSpeak() ? `<div class="row" style="justify-content:center;margin-top:12px">
        <button class="btn sm sky" data-read>🔊 Dengar halaman ini</button>
        <button class="btn sm grape" data-auto>${auto ? "⏸️ Henti" : "▶️ Baca Automatik"}</button></div>` : ""}`;
    view.querySelector("[data-prev]").onclick = () => { stopSpeak(); auto = false; if (i > 0) { i--; sfx("flip"); draw(); } };
    view.querySelector("[data-next]")?.addEventListener("click", () => { stopSpeak(); auto = false; i++; sfx("flip"); draw(); });
    view.querySelector("[data-quiz]")?.addEventListener("click", quiz);
    view.querySelector("[data-read]")?.addEventListener("click", () => { auto = false; syncAuto(); read(); });
    view.querySelector("[data-auto]")?.addEventListener("click", () => {
      auto = !auto;
      syncAuto();
      if (auto) read(); else stopSpeak();
    });
    // swipe
    const sw = view.querySelector("[data-swipe]");
    let x0 = null;
    sw.addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
    sw.addEventListener("touchend", (e) => {
      if (x0 == null) return;
      const dx = e.changedTouches[0].clientX - x0;
      x0 = null;
      if (dx < -50 && i < pages.length - 1) { stopSpeak(); auto = false; i++; draw(); }
      else if (dx > 50 && i > 0) { stopSpeak(); auto = false; i--; draw(); }
    });
    if (speakNow) read();
  };

  const quiz = () => {
    stopSpeak();
    const qs = b.quiz.map(([q, c, w]) => Q(q, b.emoji, c, w));
    view.innerHTML = `<h2 class="center">📝 Kuiz: ${esc(b.title)}</h2><div data-play></div>`;
    runQuiz(view.querySelector("[data-play]"), {
      questions: qs,
      starsOf: (score) => score,
      onExit: () => draw(),
      onDone: (score, total, answers, durationMs) => store.record(aid(b.id), "buku", { score, total, answers, durationMs }),
      resultActions: () => [
        { label: "📖 Baca semula", cls: "sun", onClick: () => { i = 0; draw(); } },
        { label: "📚 Buku lain", cls: "ghost", onClick: () => (location.hash = "/buku") },
      ],
    });
  };

  draw();
  return () => stopSpeak();
}
