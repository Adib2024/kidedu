import { store } from "../store.js";
import { esc, starsFor, confetti, sfx, toast } from "../util.js";
import { MAPS, mapById } from "../data/maps.js";
import { runQuiz, runHidden, hiddenStars, showResult } from "../engine.js";

export const mapAid = (mid, s) => `peta:${mid}:${s}`;
const unlocked = (m, k) => k === 0 || store.starsOf(mapAid(m.id, k - 1)) > 0;

export function mapsList(el) {
  el.innerHTML = `<div class="wrap page stack">
    <div class="pagehead"><a class="back" href="#/games" aria-label="Kembali">←</a><h1>Peta Kartun</h1></div>
    <section class="banner"><h1>Topik Cartoon Maps Games</h1><span class="sub">🗺️ ${MAPS.length} peta pengembaraan</span></section>
    <div class="grid lg">
      ${MAPS.map((m) => {
        const done = m.stations.filter((_s, k) => store.starsOf(mapAid(m.id, k)) > 0).length;
        const stars = m.stations.reduce((a, _s, k) => a + store.starsOf(mapAid(m.id, k)), 0);
        return `<a class="tile" href="#/peta/${m.id}" style="--tile:${m.color}">
          <span class="em">${m.emoji}</span><span class="tt">${esc(m.title)}</span><span class="ds">${esc(m.desc)}</span>
          <span class="stars">🚩 ${done}/${m.stations.length} · ⭐ ${stars}</span>${done === m.stations.length ? `<span class="badge">TAMAT</span>` : ""}</a>`;
      }).join("")}
    </div>
  </div>`;
}

/** Zig-zag station positions on a 400×600 canvas. */
function layout(n) {
  return Array.from({ length: n }, (_, k) => ({
    x: k % 2 === 0 ? 110 + (k % 4 === 0 ? 0 : 20) : 290 - (k % 4 === 1 ? 0 : 20),
    y: 70 + (k * 470) / Math.max(1, n - 1),
  }));
}
function roadPath(pts) {
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    const my = (a.y + b.y) / 2;
    d += ` C ${a.x} ${my}, ${b.x} ${my}, ${b.x} ${b.y}`;
  }
  return d;
}

export function mapView(el, { id }, query) {
  const m = mapById(id);
  if (!m) { location.hash = "/peta"; return; }
  const sIdx = query.s != null ? Number(query.s) : null;
  if (sIdx != null && m.stations[sIdx] && unlocked(m, sIdx)) return playStation(el, m, sIdx);

  const pts = layout(m.stations.length);
  const allDone = m.stations.every((_s, k) => store.starsOf(mapAid(m.id, k)) > 0);
  const next = m.stations.findIndex((_s, k) => store.starsOf(mapAid(m.id, k)) === 0);
  el.innerHTML = `<div class="wrap page stack" style="max-width:560px">
    <div class="pagehead"><a class="back" href="#/peta" aria-label="Kembali">←</a><h1 style="font-size:1.35rem">${m.emoji} ${esc(m.title)}</h1></div>
    <div class="map-wrap">
      <svg viewBox="0 0 400 600" role="img" aria-label="Peta ${esc(m.title)}">
        <defs><linearGradient id="mbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${m.bg[0]}"/><stop offset="1" stop-color="${m.bg[1]}"/></linearGradient></defs>
        <rect width="400" height="600" fill="url(#mbg)"/>
        ${m.decor.map(([e, x, y]) => `<text x="${x}" y="${y}" font-size="34" text-anchor="middle" opacity=".85">${e}</text>`).join("")}
        <path d="${roadPath(pts)}" fill="none" stroke="rgba(0,0,0,.12)" stroke-width="30" stroke-linecap="round" transform="translate(0,4)"/>
        <path d="${roadPath(pts)}" fill="none" stroke="${m.road}" stroke-width="26" stroke-linecap="round"/>
        <path d="${roadPath(pts)}" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="10 12" stroke-linecap="round" opacity=".9"/>
        ${pts.map((p, k) => {
          const st = m.stations[k];
          const ok = unlocked(m, k);
          const stars = store.starsOf(mapAid(m.id, k));
          const isNext = k === next;
          return `<g class="station ${ok ? "" : "locked"}" data-k="${k}" tabindex="0" role="button" aria-label="${esc(st.name)}">
            ${isNext ? `<circle class="pulse" cx="${p.x}" cy="${p.y}" r="38" fill="#fff" opacity=".6"/>` : ""}
            <circle class="ring" cx="${p.x}" cy="${p.y}" r="30" fill="${stars ? "#7ccf2e" : ok ? "#ff4fa3" : "#cbd5e1"}" stroke="#fff" stroke-width="5"/>
            <text x="${p.x}" y="${p.y + 10}" font-size="28" text-anchor="middle">${ok ? st.emoji : "🔒"}</text>
            <rect x="${p.x - 62}" y="${p.y + 34}" width="124" height="22" rx="11" fill="#fff" opacity=".92"/>
            <text x="${p.x}" y="${p.y + 50}" font-size="12.5" font-weight="700" text-anchor="middle" fill="#3b1d4a" font-family="Nunito, sans-serif">${esc(st.name.length > 20 ? st.name.slice(0, 19) + "…" : st.name)}</text>
            ${stars ? `<text x="${p.x}" y="${p.y - 36}" font-size="13" text-anchor="middle">${"⭐".repeat(stars)}</text>` : ""}
          </g>`;
        }).join("")}
        ${allDone ? `<text x="200" y="590" font-size="40" text-anchor="middle">🏆</text>` : ""}
      </svg>
    </div>
    ${allDone ? `<div class="alert ok center">🏆 Tahniah! Semua stesen telah ditamatkan. Main semula untuk kumpul ⭐⭐⭐!</div>` : `<p class="center muted small">Tekan stesen yang berkelip untuk mula. Selesaikan untuk membuka stesen seterusnya.</p>`}
  </div>`;
  el.querySelectorAll(".station").forEach((g) => {
    const open = () => {
      const k = +g.dataset.k;
      if (!unlocked(m, k)) { toast("🔒 Selesaikan stesen sebelumnya dahulu"); return; }
      sfx("pop");
      location.hash = `/peta/${m.id}?s=${k}`;
    };
    g.addEventListener("click", open);
    g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") open(); });
  });
}

function playStation(el, m, k) {
  const st = m.stations[k];
  const view = document.createElement("div");
  view.className = "wrap page";
  view.style.maxWidth = "720px";
  el.replaceChildren(view);
  view.innerHTML = `<h2 class="center" style="margin-bottom:10px">${st.emoji} ${esc(st.name)}</h2><div data-play></div>`;
  const play = view.querySelector("[data-play]");
  const back = () => (location.hash = `/peta/${m.id}`);
  const actions = (stars) => {
    const a = [{ label: "🔁 Main lagi", cls: "sun", onClick: () => playStation(el, m, k) }];
    if (m.stations[k + 1] && stars > 0) a.push({ label: "Stesen seterusnya ➡️", cls: "lime", onClick: () => (location.hash = `/peta/${m.id}?s=${k + 1}`) });
    a.push({ label: "🗺️ Ke peta", cls: "ghost", onClick: back });
    return a;
  };
  const finishedMap = () => m.stations.every((_s, j) => store.starsOf(mapAid(m.id, j)) > 0);
  if (st.type === "hidden") {
    runHidden(play, {
      scene: st.scene, count: 5, onExit: back,
      onDone: async (wrong, hints) => {
        const stars = hiddenStars(wrong, hints);
        const r = await store.record(mapAid(m.id, k), "peta", { stars, score: 5, total: 5 });
        showResult(view, { earned: stars, newSticker: r.newSticker, message: `Salah tekan: ${wrong} · Bantuan: ${hints}`, actions: actions(stars) });
        if (finishedMap()) setTimeout(() => confetti(60, ["🏆", "🎉", "⭐"]), 600);
      },
    });
    return;
  }
  runQuiz(play, {
    questions: st.gen(),
    onExit: back,
    onDone: async (score, total) => {
      const r = await store.record(mapAid(m.id, k), "peta", { stars: starsFor(score, total), score, total });
      if (finishedMap()) setTimeout(() => confetti(60, ["🏆", "🎉", "⭐"]), 600);
      return r;
    },
    resultActions: (score, total) => actions(starsFor(score, total)),
  });
}
