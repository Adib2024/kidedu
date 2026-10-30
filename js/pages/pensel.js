// Pensel Warna Digital — tracing with automatic checking, SVG colouring, free drawing & gallery.
import { store } from "../store.js";
import { esc, sfx, toast, confetti, download, uid, todayKey, pick, shuffle, sample, starStr, speak, notFound, confirmBox } from "../util.js";
import { PICTURES, pictureSvg } from "../data/pictures.js";
import { mascot } from "../mascot.js";
import { SHAPES, shapePath } from "../data/visuals.js";
import { ABC, KATA, COLORS } from "../data/lexicon.js";
import { showResult } from "../engine.js";

const DIGITS = "0123456789".split("");
const UPPER = ABC.map((a) => a[0]);
const LOWER = UPPER.map((c) => c.toLowerCase());
const WORDS = ["cat", "dog", "sun", "bus", "egg", "fish", "ball", "cake", "star", "moon", "bola", "buku", "ibu", "ayah", "susu", "roti", "kaki", "ikan"];
const COUNT_EMO = ["🍎", "⭐", "🐤", "🍓", "🎈", "🌸", "🐟", "🍩", "🐞", "🧁"];

export const PENSEL = [
  { id: "tulis-nombor", title: "Jom Menulis Nombor", emoji: "🔢", color: "#fef3c7", desc: "Surih nombor 0–9.", kind: "trace", items: DIGITS },
  { id: "tulis-huruf", title: "Jom Belajar Menulis Huruf", emoji: "🔠", color: "#dbeafe", desc: "Huruf besar & kecil A–Z.", kind: "trace", items: [...UPPER, ...LOWER] },
  { id: "lukis-cuaca", title: "Jom Melukis & Mewarna Cuaca", emoji: "🌦️", color: "#ede9fe", desc: "Lukis bebas dengan cop cuaca.", kind: "free" },
  { id: "kira-tulis", title: "Mengira, Menulis & Mewarna", emoji: "🧮", color: "#fee2e2", desc: "Kira objek, kemudian surih nombornya.", kind: "trace", items: DIGITS.slice(1).concat("10") },
  { id: "tracing-words", title: "Tracing the Words", emoji: "✍️", color: "#d1fae5", desc: "Surih perkataan pendek.", kind: "trace", items: WORDS },
  { id: "colour-object", title: "Colour the Object", emoji: "🧸", color: "#ffedd5", desc: "Warnakan gambar — bebas atau ikut nombor.", kind: "colour" },
  { id: "bentuk-warna", title: "Kenali Bentuk & Warnakan", emoji: "🔷", color: "#fef9c3", desc: "Ikut arahan warna mengikut bentuk.", kind: "shapes" },
  { id: "meet-letter", title: "Meet the Letter", emoji: "🅰️", color: "#fce7f3", desc: "Kenali huruf bersama gambar.", kind: "trace", items: UPPER },
];
const aid = (id, item) => `pensel:${id}:${item}`;

// ---------------------------------------------------------------- list + gallery
export async function penselList(el) {
  const c = store.activeChild;
  el.innerHTML = `<div class="wrap page stack">
    <section class="banner"><span class="deco" style="left:12px;top:10px">✏️</span><span class="deco" style="right:12px;top:10px">🖍️</span>
      <h1>Topik Pensel Warna Digital</h1><span class="sub">🖌️ Surih, warna & lukis terus di skrin</span></section>
    <div class="grid">
      ${PENSEL.filter((p) => store.isPublished(`pensel:${p.id}`)).map((p) => {
        const done = p.items ? p.items.filter((it) => store.starsOf(aid(p.id, it)) > 0).length : null;
        return `<a class="tile" href="#/pensel/${p.id}" style="--tile:${p.color}"><span class="em">${p.emoji}</span><span class="tt">${esc(p.title)}</span><span class="ds">${esc(p.desc)}</span>${done != null ? `<span class="stars">✅ ${done}/${p.items.length}</span>` : ""}</a>`;
      }).join("")}
    </div>
    <div class="card"><h2>🖼️ Galeri ${esc(c.name)}</h2><div data-gal><p class="muted">Memuatkan…</p></div></div>
  </div>`;
  renderGallery(el.querySelector("[data-gal]"));
}
const galKey = () => `gallery:${store.activeChild.id}`;
async function renderGallery(box) {
  const items = await store.kv(galKey(), []);
  if (!items.length) { box.innerHTML = `<p class="muted">Belum ada lukisan. Simpan lukisan anda untuk dipaparkan di sini! 🎨</p>`; return; }
  box.innerHTML = `<div class="gallery">${items.map((g) => `<figure><img src="${g.src}" alt="${esc(g.title)}"><figcaption>${esc(g.title)}<br>${esc(g.date)}</figcaption><button class="del" data-del="${g.id}" aria-label="Padam">✕</button></figure>`).join("")}</div>`;
  box.querySelectorAll("[data-del]").forEach((b) => (b.onclick = async () => {
    if (!(await confirmBox("Padam lukisan ini dari galeri?", "Padam"))) return;
    const list = (await store.kv(galKey(), [])).filter((g) => g.id !== b.dataset.del);
    store.setKv(galKey(), list, { immediate: true });
    renderGallery(box);
  }));
  box.querySelectorAll("img").forEach((img) => (img.onclick = () => download(`lukisan-${Date.now()}.jpg`, img.src)));
}
async function saveToGallery(canvas, title) {
  const W = 480, H = Math.round((canvas.height / canvas.width) * W);
  const t = document.createElement("canvas");
  t.width = W; t.height = H;
  const x = t.getContext("2d");
  x.fillStyle = "#fff"; x.fillRect(0, 0, W, H);
  x.drawImage(canvas, 0, 0, W, H);
  const src = t.toDataURL("image/jpeg", 0.72);
  const list = await store.kv(galKey(), []);
  list.unshift({ id: uid(), src, title, date: todayKey() });
  const ok = await store.setKv(galKey(), list.slice(0, 24), { immediate: true });
  if (ok) toast("Disimpan ke galeri 🖼️");
  return ok;
}

// ---------------------------------------------------------------- router
export function penselView(el, { id }, query) {
  const p = PENSEL.find((x) => x.id === id);
  if (!p || !store.isPublished(`pensel:${p.id}`)) return notFound(el, "#/pensel");
  if (p.kind === "trace") return traceActivity(el, p, query);
  if (p.kind === "free") return freeDraw(el, p);
  if (p.kind === "colour") return colourActivity(el, p, query);
  if (p.kind === "shapes") return shapeActivity(el, p);
}

// ---------------------------------------------------------------- drawing surface
const PALETTE = ["#ef4444", "#fb923c", "#facc15", "#22c55e", "#3b82f6", "#a855f7", "#f472b6", "#92400e", "#1f2937", "#9ca3af"];
function drawingBoard(host, { W = 800, H = 500, background, toolbarExtra = "", stamps = null, brush = 18 } = {}) {
  host.innerHTML = `
    <div class="toolbar no-print" data-tb>
      ${PALETTE.map((c, i) => `<button class="color-dot ${i === 4 ? "on" : ""}" data-c="${c}" style="background:${c}" aria-label="Warna"></button>`).join("")}
      <input type="color" value="#3b82f6" data-custom aria-label="Warna sendiri" style="width:40px;height:40px;border:0;background:none;padding:0">
      <span style="width:8px"></span>
      <button class="tool" data-size="8" title="Halus">•</button><button class="tool on" data-size="${brush}" title="Sederhana">●</button><button class="tool" data-size="34" title="Tebal">⬤</button>
      <button class="tool" data-eraser title="Pemadam">🧽</button>
      ${stamps ? stamps.map((s) => `<button class="tool" data-stamp="${s}">${s}</button>`).join("") : ""}
      <button class="tool" data-undo title="Buat asal">↩️</button>
      <button class="tool" data-clear title="Kosongkan">🗑️</button>
      ${toolbarExtra}
    </div>
    <div class="canvas-box"><canvas data-bg width="${W}" height="${H}"></canvas><canvas class="top" data-draw width="${W}" height="${H}"></canvas></div>`;
  const bg = host.querySelector("[data-bg]");
  const cv = host.querySelector("[data-draw]");
  const ctx = cv.getContext("2d");
  let color = "#3b82f6", size = brush, eraser = false, stamp = null, drawing = false, last = null;
  const history = [];
  const snap = () => { history.push(ctx.getImageData(0, 0, W, H)); if (history.length > 20) history.shift(); };
  const pos = (e) => {
    const r = cv.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };
  const setTool = (btn) => { host.querySelectorAll("[data-stamp],[data-eraser]").forEach((b) => b.classList.remove("on")); btn?.classList.add("on"); };
  host.querySelectorAll("[data-c]").forEach((b) => (b.onclick = () => {
    host.querySelectorAll("[data-c]").forEach((x) => x.classList.remove("on"));
    b.classList.add("on"); color = b.dataset.c; eraser = false; stamp = null; setTool(null);
  }));
  host.querySelector("[data-custom]").oninput = (e) => { color = e.target.value; eraser = false; stamp = null; setTool(null); };
  host.querySelectorAll("[data-size]").forEach((b) => (b.onclick = () => { host.querySelectorAll("[data-size]").forEach((x) => x.classList.remove("on")); b.classList.add("on"); size = +b.dataset.size; }));
  host.querySelector("[data-eraser]").onclick = (e) => { eraser = !eraser; stamp = null; setTool(eraser ? e.currentTarget : null); };
  host.querySelectorAll("[data-stamp]").forEach((b) => (b.onclick = () => { stamp = stamp === b.dataset.stamp ? null : b.dataset.stamp; eraser = false; setTool(stamp ? b : null); }));
  host.querySelector("[data-undo]").onclick = () => { const h = history.pop(); if (h) ctx.putImageData(h, 0, 0); };
  host.querySelector("[data-clear]").onclick = () => { snap(); ctx.clearRect(0, 0, W, H); };

  cv.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    cv.setPointerCapture(e.pointerId);
    snap();
    const p = pos(e);
    if (stamp) {
      ctx.globalCompositeOperation = "source-over";
      ctx.font = `${size * 3}px serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(stamp, p.x, p.y);
      sfx("pop");
      return;
    }
    drawing = true; last = p;
    ctx.globalCompositeOperation = eraser ? "destination-out" : "source-over";
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(p.x, p.y, size / 2, 0, Math.PI * 2); ctx.fill();
  });
  cv.addEventListener("pointermove", (e) => {
    if (!drawing) return;
    const p = pos(e);
    ctx.strokeStyle = color; ctx.lineWidth = size; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    last = p;
  });
  const end = () => { drawing = false; ctx.globalCompositeOperation = "source-over"; };
  cv.addEventListener("pointerup", end);
  cv.addEventListener("pointercancel", end);
  if (background) background(bg.getContext("2d"), W, H);
  return {
    bg, cv, ctx, W, H,
    clear: () => { history.length = 0; ctx.clearRect(0, 0, W, H); },
    /** merged image (background + drawing) */
    merged() {
      const m = document.createElement("canvas");
      m.width = W; m.height = H;
      const x = m.getContext("2d");
      x.fillStyle = "#fff"; x.fillRect(0, 0, W, H);
      x.drawImage(bg, 0, 0); x.drawImage(cv, 0, 0);
      return m;
    },
  };
}

// ---------------------------------------------------------------- tracing
const FONT = "Andika, 'Comic Sans MS', 'Trebuchet MS', sans-serif";
function fitFont(ctx, text, W, H) {
  let size = text.length <= 1 ? 360 : text.length === 2 ? 300 : Math.min(260, (W * 1.5) / text.length);
  ctx.font = `700 ${size}px ${FONT}`;
  while (ctx.measureText(text).width > W * 0.86 && size > 40) { size -= 10; ctx.font = `700 ${size}px ${FONT}`; }
  return size;
}
function templateMask(text, W, H, widen) {
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const x = c.getContext("2d");
  fitFont(x, text, W, H);
  x.textAlign = "center"; x.textBaseline = "middle";
  x.fillStyle = "#000"; x.strokeStyle = "#000"; x.lineJoin = "round";
  x.fillText(text, W / 2, H / 2 + 10);
  if (widen) { x.lineWidth = widen; x.strokeText(text, W / 2, H / 2 + 10); }
  return x.getImageData(0, 0, W, H).data;
}
function scoreTrace(drawCtx, text, W, H) {
  const core = templateMask(text, W, H, 0);
  const wide = templateMask(text, W, H, 46);
  const user = drawCtx.getImageData(0, 0, W, H).data;
  let coreN = 0, covered = 0, userN = 0, outside = 0;
  for (let y = 0; y < H; y += 3) {
    for (let x = 0; x < W; x += 3) {
      const i = (y * W + x) * 4 + 3;
      const u = user[i] > 20;
      if (core[i] > 100) { coreN++; if (u) covered++; }
      if (u) { userN++; if (wide[i] < 20) outside++; }
    }
  }
  const coverage = coreN ? covered / coreN : 0;
  const spill = userN ? outside / userN : 1;
  let stars = 0;
  if (coverage >= 0.7 && spill < 0.3) stars = 3;
  else if (coverage >= 0.5 && spill < 0.45) stars = 2;
  else if (coverage >= 0.3 && spill < 0.6) stars = 1;
  return { coverage, spill, stars };
}

async function traceActivity(el, p, query) {
  let idx = Math.max(0, p.items.indexOf(query.item));
  if (idx < 0) idx = 0;
  try { await document.fonts?.load?.(`700 100px Andika`); } catch {}
  const draw = () => {
    const item = p.items[idx];
    const letter = p.id === "meet-letter" ? ABC.find((a) => a[0] === item) : null;
    const countN = p.id === "kira-tulis" ? Number(item) : 0;
    const text = letter ? item + item.toLowerCase() : item;
    const emo = pick(COUNT_EMO);
    const wordInfo = p.id === "tracing-words" ? KATA.find((k) => k.w === item) : null;
    el.innerHTML = `<div class="wrap page" style="max-width:860px">
      <div class="pagehead"><a class="back" href="#/pensel" aria-label="Kembali">←</a><h1 style="font-size:1.3rem">${p.emoji} ${esc(p.title)}</h1></div>
      <div class="row between" style="margin-bottom:10px">
        <button class="btn sm ghost" data-prev ${idx === 0 ? "disabled" : ""}>⬅️</button>
        <select class="input" data-jump style="width:auto;flex:1;max-width:240px">${p.items.map((it, k) => `<option value="${k}" ${k === idx ? "selected" : ""}>${esc(it)} ${starStr(store.starsOf(aid(p.id, it)))}</option>`).join("")}</select>
        <button class="btn sm ghost" data-next ${idx === p.items.length - 1 ? "disabled" : ""}>➡️</button>
      </div>
      ${letter ? `<div class="card soft center" style="margin-bottom:10px"><span style="font-size:2.4rem">${letter[2]} ${letter[4]}</span><div><b>${letter[0]}</b> is for <b>${esc(letter[1])}</b> · <b>${letter[0]}</b> untuk <b>${esc(letter[3])}</b></div></div>` : ""}
      ${countN ? `<div class="card soft center" style="margin-bottom:10px"><div style="font-size:2rem;line-height:1.2">${emo.repeat(countN)}</div><b>Kira gambar di atas, kemudian surih nombornya!</b></div>` : ""}
      ${wordInfo ? `<div class="center" style="font-size:2.4rem">${wordInfo.e}</div>` : ""}
      <div data-board></div>
      <div class="row" style="justify-content:center;margin-top:12px">
        <button class="btn sky" data-say>🔊 Sebut</button>
        <button class="btn lime big" data-check>✅ Semak</button>
      </div>
      <div data-res></div>
    </div>`;
    const board = drawingBoard(el.querySelector("[data-board]"), {
      background: (ctx, W, H) => {
        ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 2; ctx.setLineDash([10, 10]);
        [0.2, 0.5, 0.8].forEach((r) => { ctx.beginPath(); ctx.moveTo(0, H * r + 10); ctx.lineTo(W, H * r + 10); ctx.stroke(); });
        fitFont(ctx, text, W, H);
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillStyle = "rgba(255,79,163,.10)";
        ctx.fillText(text, W / 2, H / 2 + 10);
        ctx.setLineDash([8, 10]); ctx.lineWidth = 4; ctx.strokeStyle = "#f472b6";
        ctx.strokeText(text, W / 2, H / 2 + 10);
        ctx.setLineDash([]);
      },
    });
    el.querySelector("[data-prev]").onclick = () => { idx--; draw(); };
    el.querySelector("[data-next]").onclick = () => { idx++; draw(); };
    el.querySelector("[data-jump]").onchange = (e) => { idx = +e.target.value; draw(); };
    el.querySelector("[data-say]").onclick = () => {
      if (letter) speak(`${letter[0]}. ${letter[0]} is for ${letter[1]}`, { lang: "en" });
      else if (countN) speak(`${countN}`);
      else speak(item, { lang: /^[a-z]+$/.test(item) && !KATA.some((k) => k.w === item) ? "en" : "ms" });
    };
    el.querySelector("[data-check]").onclick = async () => {
      const r = scoreTrace(board.ctx, text, board.W, board.H);
      const res = el.querySelector("[data-res]");
      if (r.stars === 0) {
        sfx("wrong");
        res.innerHTML = `<div class="alert" style="margin-top:12px">${r.coverage < 0.3 ? "Surih lebih banyak garisan ya! ✏️" : "Cuba ikut garisan putus-putus dengan lebih teliti 🙂"} (liputan ${Math.round(r.coverage * 100)}%)</div>`;
        return;
      }
      const rec = await store.record(aid(p.id, item), "pensel", { stars: r.stars });
      sfx("win"); confetti(r.stars * 12);
      res.innerHTML = `<div class="card center" style="margin-top:12px"><div class="bigstars" style="font-size:2.4rem">${starStr(r.stars)}</div>
        <p><b>${r.stars === 3 ? "Cantiknya tulisan!" : r.stars === 2 ? "Bagus! Hampir sempurna." : "Syabas! Cuba lagi untuk lebih bintang."}</b> Liputan ${Math.round(r.coverage * 100)}%</p>
        ${rec.saveFailed ? `<div class="alert">⚠️ Bintang belum disimpan. Semak sambungan & cuba lagi.</div>` : ""}
        ${rec.newSticker ? `<div class="alert ok">🎁 Pelekat baru: ${rec.newSticker}</div>` : ""}
        <div class="row" style="justify-content:center"><button class="btn sm sun" data-again>🔁 Cuba lagi</button>
        ${idx < p.items.length - 1 ? `<button class="btn sm lime" data-go>Seterusnya ➡️</button>` : ""}
        <button class="btn sm grape" data-save>🖼️ Simpan</button></div></div>`;
      res.querySelector("[data-again]").onclick = () => { board.clear(); res.innerHTML = ""; };
      res.querySelector("[data-go]")?.addEventListener("click", () => { idx++; draw(); });
      res.querySelector("[data-save]").onclick = () => saveToGallery(board.merged(), `${p.title}: ${text}`);
      res.scrollIntoView({ behavior: "smooth", block: "nearest" });
    };
  };
  draw();
}

// ---------------------------------------------------------------- free draw
function freeDraw(el, p) {
  const prompts = ["Lukis cuaca hari ini!", "Lukis hari yang hujan & pelangi 🌈", "Lukis langit malam berbintang ✨", "Lukis hari panas di pantai ☀️", "Lukis ribut petir ⛈️ (dari dalam rumah!)"];
  let prompt = pick(prompts);
  let scene = "langit";
  const scenes = {
    langit: (ctx, W, H) => { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#bfdbfe"); g.addColorStop(0.75, "#e0f2fe"); g.addColorStop(0.75, "#86efac"); g.addColorStop(1, "#4ade80"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); },
    malam: (ctx, W, H) => { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#1e1b4b"); g.addColorStop(1, "#4c1d95"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); },
    pantai: (ctx, W, H) => { ctx.fillStyle = "#bae6fd"; ctx.fillRect(0, 0, W, H * 0.5); ctx.fillStyle = "#38bdf8"; ctx.fillRect(0, H * 0.5, W, H * 0.2); ctx.fillStyle = "#fde68a"; ctx.fillRect(0, H * 0.7, W, H * 0.3); },
    kosong: (ctx, W, H) => { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H); },
  };
  const render = () => {
    el.innerHTML = `<div class="wrap page" style="max-width:900px">
      <div class="pagehead"><a class="back" href="#/pensel" aria-label="Kembali">←</a><h1 style="font-size:1.3rem">${p.emoji} ${esc(p.title)}</h1></div>
      <div class="mascot-say" style="margin-bottom:10px">${mascot("think", 64)}<div class="bubble">${esc(prompt)} <button class="btn sm ghost" data-idea>💡 Idea lain</button></div></div>
      <div class="chips" style="margin-bottom:10px">${Object.keys(scenes).map((s) => `<button class="chip ${s === scene ? "on" : ""}" data-scene="${s}">${{ langit: "🌤️ Langit", malam: "🌙 Malam", pantai: "🏖️ Pantai", kosong: "⬜ Kosong" }[s]}</button>`).join("")}</div>
      <div data-board></div>
      <div class="row" style="justify-content:center;margin-top:12px">
        <button class="btn grape" data-save>🖼️ Simpan ke Galeri</button>
        <button class="btn ghost" data-dl>⬇️ Muat turun</button>
      </div>
    </div>`;
    const board = drawingBoard(el.querySelector("[data-board]"), { background: scenes[scene], stamps: ["☀️", "☁️", "🌧️", "⛈️", "🌈", "❄️", "🌙", "⭐", "🌬️", "🌳", "🏠", "🦋"] });
    el.querySelector("[data-idea]").onclick = () => { prompt = pick(prompts.filter((x) => x !== prompt)); el.querySelector(".bubble").firstChild.textContent = prompt + " "; };
    el.querySelectorAll("[data-scene]").forEach((b) => (b.onclick = () => { scene = b.dataset.scene; render(); }));
    el.querySelector("[data-save]").onclick = async () => {
      await saveToGallery(board.merged(), prompt);
      const r = await store.record(aid(p.id, todayKey()), "pensel", { stars: 3 });
      sfx("win"); confetti(30);
      if (r.newSticker) toast(`🎁 Pelekat baru: ${r.newSticker}`);
    };
    el.querySelector("[data-dl]").onclick = () => download(`lukisan-${todayKey()}.png`, board.merged().toDataURL("image/png"));
  };
  render();
}

// ---------------------------------------------------------------- SVG colouring
function svgToCanvas(svgEl, W = 600, H = 600) {
  return new Promise((resolve) => {
    const xml = new XMLSerializer().serializeToString(svgEl);
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = W; c.height = H;
      const x = c.getContext("2d");
      x.fillStyle = "#fff"; x.fillRect(0, 0, W, H);
      x.drawImage(img, 0, 0, W, H);
      resolve(c);
    };
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);
  });
}

function colourActivity(el, p, query) {
  let pic = PICTURES.find((x) => x.id === query.pic) || PICTURES[0];
  let mode = query.mode === "bebas" ? "bebas" : "nombor";
  let fills = [];
  let color = null;
  const hist = [];
  const render = () => {
    fills = pic.regions.map(() => "#ffffff");
    hist.length = 0;
    const pal = mode === "nombor" ? pic.palette.map((c, i) => ({ ...c, n: i + 1 })) : [...COLORS.map((c) => ({ hex: c.hex, name: c.ms })), ...pic.palette.filter((c) => !COLORS.some((k) => k.hex === c.hex))];
    color = pal[0].hex;
    el.innerHTML = `<div class="wrap page" style="max-width:760px">
      <div class="pagehead"><a class="back" href="#/pensel" aria-label="Kembali">←</a><h1 style="font-size:1.3rem">${p.emoji} ${esc(p.title)}</h1></div>
      <div class="row" style="margin-bottom:10px">
        <select class="input" data-pic style="width:auto;flex:1" aria-label="Pilih gambar">${PICTURES.map((x) => `<option value="${x.id}" ${x.id === pic.id ? "selected" : ""}>${x.emoji} ${x.name} ${starStr(store.starsOf(aid(p.id, x.id)))}</option>`).join("")}</select>
        <div class="chips"><button class="chip ${mode === "nombor" ? "on" : ""}" data-mode="nombor">🔢 Ikut nombor</button><button class="chip ${mode === "bebas" ? "on" : ""}" data-mode="bebas">🎨 Bebas</button></div>
      </div>
      <div class="toolbar">
        ${pal.map((c, i) => `<button class="color-dot ${i === 0 ? "on" : ""}" data-c="${c.hex}" style="background:${c.hex};${c.n ? "display:grid;place-items:center;font-weight:900;color:" + inkOn(c.hex) : ""}" title="${esc(c.name)}" aria-label="${esc(c.name)}">${c.n || ""}</button>`).join("")}
        <button class="tool" data-undo title="Buat asal">↩️</button><button class="tool" data-reset title="Mula semula">🗑️</button>
      </div>
      <p class="small muted center" style="margin:6px 0">${mode === "nombor" ? "Pilih warna bernombor, kemudian tekan bahagian gambar yang mempunyai nombor sama." : "Pilih warna dan tekan mana-mana bahagian gambar untuk mewarna."}</p>
      <div class="canvas-box svg-color" data-svg style="max-width:560px;margin:0 auto">${pictureSvg(pic, { mode: mode === "nombor" ? "number" : "color", fills })}</div>
      <div class="row" style="justify-content:center;margin-top:12px">
        ${mode === "nombor" ? `<button class="btn lime" data-check>✅ Semak</button>` : ""}
        <button class="btn grape" data-save>🖼️ Simpan</button>
        <button class="btn ghost" data-dl>⬇️ PNG</button>
      </div>
      <div data-res></div>
    </div>`;
    const box = el.querySelector("[data-svg]");
    const svg = box.querySelector("svg");
    el.querySelector("[data-pic]").onchange = (e) => { pic = PICTURES.find((x) => x.id === e.target.value); render(); };
    el.querySelectorAll("[data-mode]").forEach((b) => (b.onclick = () => { mode = b.dataset.mode; render(); }));
    el.querySelectorAll("[data-c]").forEach((b) => (b.onclick = () => { el.querySelectorAll("[data-c]").forEach((x) => x.classList.remove("on")); b.classList.add("on"); color = b.dataset.c; }));
    svg.addEventListener("click", (e) => {
      const r = e.target.closest("[data-r]");
      if (!r) return;
      const i = +r.dataset.r;
      hist.push([i, fills[i]]);
      fills[i] = color;
      r.setAttribute("fill", color);
      sfx("pop");
    });
    el.querySelector("[data-undo]").onclick = () => { const h = hist.pop(); if (!h) return; fills[h[0]] = h[1]; svg.querySelector(`[data-r="${h[0]}"]`).setAttribute("fill", h[1]); };
    el.querySelector("[data-reset]").onclick = render;
    const exportCanvas = async () => {
      const clone = svg.cloneNode(true);
      clone.querySelectorAll("text").forEach((t) => t.remove());
      clone.setAttribute("width", 600); clone.setAttribute("height", 600);
      return svgToCanvas(clone);
    };
    el.querySelector("[data-save]").onclick = async () => saveToGallery(await exportCanvas(), pic.name);
    el.querySelector("[data-dl]").onclick = async () => download(`${pic.id}.png`, (await exportCanvas()).toDataURL("image/png"));
    el.querySelector("[data-check]")?.addEventListener("click", async () => {
      const total = pic.regions.length;
      const right = pic.regions.filter(([, , n], i) => fills[i].toLowerCase() === pic.palette[n - 1].hex.toLowerCase()).length;
      const res = el.querySelector("[data-res]");
      const empty = fills.filter((f, i) => f === "#ffffff" && pic.palette[pic.regions[i][2] - 1].hex !== "#ffffff").length;
      if (empty > total / 2) { res.innerHTML = `<div class="alert" style="margin-top:12px">Warnakan lebih banyak bahagian dulu ya! 🖍️</div>`; return; }
      const stars = right === total ? 3 : right / total >= 0.8 ? 2 : right / total >= 0.5 ? 1 : 0;
      const wrongIdx = fills.map((f, i) => (f.toLowerCase() !== pic.palette[pic.regions[i][2] - 1].hex.toLowerCase() ? i : -1)).filter((i) => i >= 0);
      wrongIdx.forEach((i) => svg.querySelector(`[data-r="${i}"]`).animate([{ opacity: 1 }, { opacity: 0.2 }, { opacity: 1 }], { duration: 500, iterations: 3 }));
      if (!stars) { sfx("wrong"); res.innerHTML = `<div class="alert" style="margin-top:12px">${right}/${total} betul. Bahagian yang berkelip perlu diwarna semula 🙂</div>`; return; }
      const rec = await store.record(aid(p.id, pic.id), "pensel", { stars });
      showResult(res, { score: right, total, earned: stars, newSticker: rec.newSticker, saveFailed: rec.saveFailed, actions: [{ label: "Gambar lain ➡️", cls: "lime", onClick: () => { pic = PICTURES[(PICTURES.indexOf(pic) + 1) % PICTURES.length]; render(); } }] });
    });
  };
  render();
}

// ---------------------------------------------------------------- shapes task
/** Readable number colour on a paint swatch (dark on light colours, white on dark ones). */
const inkOn = (hex) => { const n = parseInt(hex.slice(1), 16), f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; const L = 0.2126 * f(n >> 16) + 0.7152 * f((n >> 8) & 255) + 0.0722 * f(n & 255); return L > 0.18 ? "#1f1530" : "#fff"; };
const COLOR_TASK = [["Merah", "#ef4444"], ["Biru", "#3b82f6"], ["Kuning", "#facc15"], ["Hijau", "#22c55e"]];
function shapeActivity(el, p) {
  const render = () => {
    const kinds = sample(SHAPES.filter((s) => s.id !== "bujur"), 4);
    const targets = kinds.slice(0, 2).map((k, i) => ({ shape: k, col: COLOR_TASK[i] }));
    const cells = shuffle(Array.from({ length: 12 }, (_, i) => kinds[i % 4]));
    const fills = cells.map(() => "#ffffff");
    let color = COLOR_TASK[0][1];
    el.innerHTML = `<div class="wrap page" style="max-width:720px">
      <div class="pagehead"><a class="back" href="#/pensel" aria-label="Kembali">←</a><h1 style="font-size:1.3rem">${p.emoji} ${esc(p.title)}</h1></div>
      <div class="card soft" style="margin-bottom:10px">
        ${targets.map((t) => `<div style="font-weight:800;font-size:1.1rem">🎯 Warnakan semua <u>${t.shape.ms}</u> dengan warna <span class="color-word"><i style="background:${t.col[1]}"></i>${t.col[0]}</span></div>`).join("")}
        <div class="small muted">Bentuk lain biarkan putih.</div>
      </div>
      <div class="toolbar">${COLOR_TASK.map((c, i) => `<button class="color-dot ${i === 0 ? "on" : ""}" data-c="${c[1]}" style="background:${c[1]}" aria-label="${c[0]}"></button>`).join("")}<button class="color-dot" data-c="#ffffff" style="background:#fff" aria-label="Pemadam (putih)"></button><span class="small muted">⬜ = padam</span></div>
      <div class="canvas-box svg-color" style="margin-top:10px"><svg viewBox="0 0 400 300" width="100%">
        ${cells.map((s, i) => shapePath(s.id, 50 + (i % 4) * 100, 50 + Math.floor(i / 4) * 100, 34, `data-r="${i}" fill="#fff" stroke="#222" stroke-width="3"`)).join("")}
      </svg></div>
      <div class="row" style="justify-content:center;margin-top:12px"><button class="btn lime big" data-check>✅ Semak</button><button class="btn ghost" data-new>🔄 Baru</button></div>
      <div data-res></div>
    </div>`;
    el.querySelectorAll("[data-c]").forEach((b) => (b.onclick = () => { el.querySelectorAll("[data-c]").forEach((x) => x.classList.remove("on")); b.classList.add("on"); color = b.dataset.c; }));
    el.querySelector("svg").addEventListener("click", (e) => {
      const r = e.target.closest("[data-r]");
      if (!r) return;
      fills[+r.dataset.r] = color;
      r.setAttribute("fill", color);
      sfx("pop");
    });
    el.querySelector("[data-new]").onclick = render;
    el.querySelector("[data-check]").onclick = async () => {
      let right = 0;
      const total = cells.length;
      cells.forEach((s, i) => {
        const t = targets.find((x) => x.shape.id === s.id);
        const want = t ? t.col[1] : "#ffffff";
        if (fills[i] === want) right++;
        else el.querySelector(`[data-r="${i}"]`).animate([{ opacity: 1 }, { opacity: 0.2 }, { opacity: 1 }], { duration: 500, iterations: 3 });
      });
      const stars = right === total ? 3 : right >= total - 2 ? 2 : right >= total / 2 ? 1 : 0;
      const res = el.querySelector("[data-res]");
      if (!stars) { sfx("wrong"); res.innerHTML = `<div class="alert" style="margin-top:12px">${right}/${total} betul. Semak bentuk yang berkelip! 🔍</div>`; return; }
      const rec = await store.record(aid(p.id, "latihan"), "pensel", { stars });
      showResult(res, { score: right, total, earned: stars, newSticker: rec.newSticker, saveFailed: rec.saveFailed, actions: [{ label: "🔄 Cabaran baru", cls: "lime", onClick: render }] });
    };
  };
  render();
}
