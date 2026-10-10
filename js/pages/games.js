import { store } from "../store.js";
import { esc, starStr, starsFor } from "../util.js";
import { GAMES, gameById, MEMORY_SETS } from "../data/games.js";
import { runQuiz, runMemory, memoryStars, showResult } from "../engine.js";
import { pick } from "../util.js";

export const gameAid = (gid, lv) => `game:${gid}:${lv}`;
const unlocked = (g, k) => k === 0 || store.starsOf(gameAid(g.id, k - 1)) > 0;

export function gamesList(el) {
  el.innerHTML = `<div class="wrap page stack">
    <section class="banner">
      <span class="deco" style="left:12px;top:10px">🍭</span><span class="deco" style="right:12px;top:12px">🍬</span>
      <h1>Topik Games Online</h1><span class="sub">🎮 ${GAMES.length} games · tahap demi tahap</span>
    </section>
    <div class="grid">
      ${GAMES.map((g) => {
        const got = g.levels.reduce((s, _l, k) => s + store.starsOf(gameAid(g.id, k)), 0);
        const done = g.levels.filter((_l, k) => store.starsOf(gameAid(g.id, k)) > 0).length;
        return `<a class="tile" href="#/games/${g.id}" style="--tile:${g.color}">
          <span class="em">${g.emoji}</span><span class="tt">${esc(g.title)}</span>
          <span class="ds">${done}/${g.levels.length} tahap</span><span class="stars">⭐ ${got}/${g.levels.length * 3}</span></a>`;
      }).join("")}
    </div>
    <a class="tile" href="#/peta" style="--tile:#fce7f3;min-height:90px;flex-direction:row;gap:14px"><span class="em">🗺️</span><span class="tt">Peta Kartun Pengembaraan →</span></a>
  </div>`;
}

export function gamePlay(el, { id }, query) {
  const g = gameById(id);
  if (!g) { location.hash = "/games"; return; }
  const lvIdx = query.lv != null ? Number(query.lv) : null;
  if (lvIdx == null || !g.levels[lvIdx] || !unlocked(g, lvIdx)) return levelSelect(el, g);
  const view = document.createElement("div");
  view.className = "wrap page";
  view.style.maxWidth = "720px";
  el.replaceChildren(view);
  const lvl = g.levels[lvIdx];
  const actions = (stars) => {
    const a = [{ label: "🔁 Main lagi", cls: "sun", onClick: () => gamePlay(el, { id }, { lv: lvIdx }) }];
    if (g.levels[lvIdx + 1] && (stars > 0 || unlocked(g, lvIdx + 1))) a.push({ label: "Tahap seterusnya ➡️", cls: "lime", onClick: () => (location.hash = `/games/${id}?lv=${lvIdx + 1}`) });
    a.push({ label: "📋 Pilih tahap", cls: "ghost", onClick: () => (location.hash = `/games/${id}`) });
    return a;
  };
  const exit = () => (location.hash = `/games/${id}`);

  if (g.type === "memory") {
    view.innerHTML = `<h2 class="center">${g.emoji} ${esc(lvl.name)}</h2><div data-play></div>`;
    runMemory(view.querySelector("[data-play]"), {
      pairs: lvl.pairs, cols: lvl.cols, set: pick(MEMORY_SETS),
      onExit: exit,
      onDone: async (moves, pairs, secs) => {
        const stars = memoryStars(moves, pairs);
        const r = await store.record(gameAid(id, lvIdx), "games", { stars, score: pairs, total: pairs });
        showResult(view, { earned: stars, newSticker: r.newSticker, message: `Siap dalam <b>${moves}</b> langkah (${secs} saat).`, actions: actions(stars) });
      },
    });
    return;
  }
  view.innerHTML = `<h2 class="center" style="margin-bottom:10px">${g.emoji} ${esc(g.title)} · <span style="color:var(--pink)">${esc(lvl.name)}</span></h2><div data-play></div>`;
  const play = view.querySelector("[data-play]");
  runQuiz(play, {
    questions: lvl.gen(),
    onExit: exit,
    onDone: (score, total) => store.record(gameAid(id, lvIdx), "games", { stars: starsFor(score, total), score, total }),
    resultActions: (score, total) => actions(starsFor(score, total)),
  });
}

function levelSelect(el, g) {
  el.innerHTML = `<div class="wrap page stack" style="max-width:820px">
    <div class="pagehead"><a class="back" href="#/games" aria-label="Kembali">←</a><h1>${g.emoji} ${esc(g.title)}</h1></div>
    <p class="muted">${esc(g.desc)} Dapatkan sekurang-kurangnya ⭐ untuk membuka tahap seterusnya.</p>
    <div class="levels">
      ${g.levels.map((l, k) => {
        const ok = unlocked(g, k);
        const s = store.starsOf(gameAid(g.id, k));
        return `<button class="level ${ok ? "" : "locked"}" data-k="${k}" ${ok ? "" : 'aria-disabled="true"'}>
          <div class="n">${ok ? k + 1 : "🔒"}</div><div class="nm">${esc(l.name)}</div><div class="st">${starStr(s)}</div></button>`;
      }).join("")}
    </div>
  </div>`;
  el.querySelectorAll(".level").forEach((b) => (b.onclick = () => {
    if (b.classList.contains("locked")) return;
    location.hash = `/games/${g.id}?lv=${b.dataset.k}`;
  }));
}
