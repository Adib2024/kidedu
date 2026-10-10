// Printable worksheets (A4). Each worksheet is generated fresh — "Jana Baru" gives a new variation.
import { esc, pick, rnd, sample, shuffle } from "../util.js";
import { PICTURES, pictureSvg, OBJECTS, objectSvg, COLOUR_HEX } from "../data/pictures.js";
import { SHAPES, shapePath } from "../data/visuals.js";
import { ABC, KATA, ANIMALS, FRUITS } from "../data/lexicon.js";

export const WORKSHEETS = [
  { id: "mewarna-nombor", title: "Jom Mewarna Ikut Nombor", emoji: "🖍️", color: "#fef3c7", desc: "Warnakan gambar mengikut kod nombor." },
  { id: "kira-lukis", title: "Melukis, Mengira & Mewarna", emoji: "🔢", color: "#fce7f3", desc: "Kira objek, tulis nombor & lukis." },
  { id: "bentuk", title: "Mengenali Bentuk & Warnakan", emoji: "🔺", color: "#ffedd5", desc: "Kenal pasti bentuk dan ikut arahan warna." },
  { id: "tracing-words", title: "Tracing the Words", emoji: "✏️", color: "#dbeafe", desc: "Surih perkataan BM / English / sendiri." },
  { id: "colour-objects", title: "Colour the Objects", emoji: "🎨", color: "#ede9fe", desc: "Read and colour — English worksheet." },
  { id: "meet-letter", title: "Meet the Letter", emoji: "🔤", color: "#d1fae5", desc: "Kenali huruf A–Z: surih, bulatkan & sebut." },
  { id: "latihan-matematik", title: "Latihan Matematik Pantas", emoji: "➗", color: "#e0f2fe", desc: "20 soalan tambah/tolak/darab — dengan skema jawapan." },
];

const head = (title, instr) => `
  <h2>${esc(title)}</h2>
  <div class="meta"><span>Nama:</span><span style="max-width:160px">Tarikh:</span></div>
  ${instr ? `<div class="instr">${instr}</div>` : ""}`;
const foot = `<div class="foot">Pelangi Pop Land · Lembaran kerja percuma untuk kegunaan peribadi</div>`;

/** Dashed tracing text (SVG). */
function traceText(text, { size = 70, width = 700, height = 100, x = 10 } = {}) {
  return `<svg viewBox="0 0 ${width} ${height}" width="100%" style="display:block">
    <line x1="0" y1="${height * 0.2}" x2="${width}" y2="${height * 0.2}" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="6 6"/>
    <line x1="0" y1="${height * 0.5}" x2="${width}" y2="${height * 0.5}" stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="4 6"/>
    <line x1="0" y1="${height * 0.8}" x2="${width}" y2="${height * 0.8}" stroke="#94a3b8" stroke-width="2"/>
    <text x="${x}" y="${height * 0.8}" font-size="${size}" font-family="Fredoka, 'Comic Sans MS', sans-serif" font-weight="500"
      fill="none" stroke="#9ca3af" stroke-width="2" stroke-dasharray="3 4" letter-spacing="6">${esc(text)}</text>
  </svg>`;
}

const GEN = {
  "mewarna-nombor": (opt) => {
    const p = PICTURES.find((x) => x.id === opt.pic) || pick(PICTURES);
    opt.pic = p.id;
    return `${head(`Jom Mewarna: ${p.name}`, "Warnakan setiap bahagian mengikut nombor & warna di bawah.")}
      <div style="max-width:520px;margin:0 auto">${pictureSvg(p, { mode: "number" })}</div>
      <div class="row" style="justify-content:center;gap:16px;margin-top:12px">
        ${p.palette.map((c, i) => `<span style="display:inline-flex;align-items:center;gap:6px;font-weight:800"><b style="font-size:1.3rem">${i + 1}</b> = <span style="display:inline-block;width:26px;height:26px;border-radius:6px;border:2px solid #222;background:${c.hex}"></span> ${c.name}</span>`).join("")}
      </div>`;
  },
  "kira-lukis": () => {
    const items = sample([...FRUITS, ...ANIMALS], 6).map((x) => ({ e: x.e, n: rnd(1, 9) }));
    return `${head("Melukis, Mengira & Mewarna", "Kira gambar dan tulis nombornya dalam kotak. Kemudian lukis bulatan sebanyak nombor itu & warnakan!")}
      <div class="ws-grid" style="grid-template-columns:1fr 1fr">
        ${items.map((it) => `<div class="ws-box">
          <div style="font-size:28px;line-height:1.25;min-height:76px">${it.e.repeat(it.n)}</div>
          <div class="row" style="margin-top:8px"><b>Jumlah:</b> <span class="write-box"></span></div>
          <div style="border-top:2px dotted #bbb;margin-top:10px;padding-top:6px;min-height:60px" class="small"><b>Lukis ${it.n === 0 ? "" : "bulatan"}:</b></div>
        </div>`).join("")}
      </div>
      <div class="print-only" style="page-break-before:always"><h3>Skema jawapan</h3><p>${items.map((it, i) => `${i + 1}) ${it.n}`).join(" &nbsp; ")}</p></div>`;
  },
  bentuk: () => {
    const kinds = sample(SHAPES.filter((s) => !["bujur", "rombus"].includes(s.id)), 4);
    const colours = ["merah", "biru", "kuning", "hijau"];
    const cells = shuffle(Array.from({ length: 16 }, (_, i) => kinds[i % 4]));
    return `${head("Mengenali Bentuk & Warnakan", kinds.map((k, i) => `Warnakan <u>${k.ms}</u> dengan warna <b>${colours[i]}</b>.`).join("<br>"))}
      <svg viewBox="0 0 400 400" width="100%" style="max-width:520px;display:block;margin:0 auto">
        ${cells.map((s, i) => shapePath(s.id, 50 + (i % 4) * 100, 50 + Math.floor(i / 4) * 100, 34, 'fill="#fff" stroke="#222" stroke-width="3"')).join("")}
      </svg>
      <div class="ws-grid" style="grid-template-columns:1fr 1fr;margin-top:14px">
        ${kinds.map((k) => `<div class="row"><b>Berapa ${k.ms}?</b> <span class="write-box" style="width:56px;height:46px"></span></div>`).join("")}
      </div>
      <div class="print-only" style="page-break-before:always"><h3>Skema jawapan</h3><p>${kinds.map((k) => `${k.ms}: 4`).join(" · ")}</p></div>`;
  },
  "tracing-words": (opt) => {
    const sets = {
      bm: () => sample(KATA.filter((k) => k.w.length <= 7), 6).map((k) => [k.w, k.e]),
      en: () => sample(ANIMALS.filter((a) => a.en.length <= 7), 6).map((a) => [a.en.toLowerCase(), a.e]),
      sendiri: () => (opt.custom || "Ali, Aina, ibu, ayah").split(",").map((w) => w.trim()).filter(Boolean).slice(0, 8).map((w) => [w, "✏️"]),
    };
    const words = (sets[opt.set] || sets.bm)();
    return `${head("Tracing the Words / Surih Perkataan", "Surih huruf putus-putus dengan pensel. Kemudian tulis sendiri di baris kosong.")}
      ${words.map(([w, e]) => `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <span style="font-size:34px;width:46px;text-align:center">${e}</span>
        <div style="flex:1">${traceText(`${w}  ${w}`, { size: 60, height: 86 })}</div></div>`).join("")}`;
  },
  "colour-objects": () => {
    const objs = sample(OBJECTS, 6);
    return `${head("Colour the Objects", "Read the sentence and colour the picture. <i>Baca ayat dan warnakan gambar.</i>")}
      <div class="ws-grid" style="grid-template-columns:1fr 1fr">
        ${objs.map((o) => `<div class="ws-box center">${objectSvg(o, 120)}<div style="font-weight:800;font-size:1.05rem">Colour the ${o.en} <span style="color:${COLOUR_HEX[o.colour]}">${o.colour}</span>.</div><div class="small" style="color:#777">Warnakan ${o.ms} ${o.warna}.</div></div>`).join("")}
      </div>`;
  },
  "meet-letter": (opt) => {
    const L = ABC.find((a) => a[0] === opt.letter) || pick(ABC);
    opt.letter = L[0];
    const grid = shuffle([...Array(8).fill(L[0]), ...Array(4).fill(L[0].toLowerCase()), ...sample("ABCDEFGHIJKLMNOPRSTUWYZ".replace(L[0], "").split(""), 12)]);
    return `${head(`Meet the Letter ${L[0]} ${L[0].toLowerCase()}`, "1) Surih huruf. 2) Bulatkan semua huruf " + L[0] + " dan " + L[0].toLowerCase() + ". 3) Warnakan gambar.")}
      <div class="row" style="align-items:flex-start;gap:14px">
        <div style="flex:1;min-width:200px">${traceText(L[0] + L[0].toLowerCase(), { size: 170, width: 320, height: 200 })}</div>
        <div style="flex:1;min-width:200px" class="center"><div style="font-size:64px">${L[2]}</div><b style="font-size:1.4rem">${L[0]} is for ${esc(L[1])}</b><div style="font-size:48px;margin-top:6px">${L[4]}</div><b>${L[0]} untuk ${esc(L[3])}</b></div>
      </div>
      ${traceText(`${L[0]} ${L[0]} ${L[0]} ${L[0].toLowerCase()} ${L[0].toLowerCase()} ${L[0].toLowerCase()}`, { size: 64, height: 90 })}
      <div style="display:grid;grid-template-columns:repeat(8,1fr);gap:8px;margin-top:10px;font-family:Fredoka,sans-serif;font-size:30px;text-align:center">
        ${grid.map((c) => `<div style="border:2px solid #ddd;border-radius:10px;padding:4px">${c}</div>`).join("")}
      </div>`;
  },
  "latihan-matematik": (opt) => {
    const ops = { tambah: "+", tolak: "−", darab: "×" };
    const op = opt.op || "tambah";
    const qs = Array.from({ length: 20 }, () => {
      if (op === "tambah") { const a = rnd(1, 50), b = rnd(1, 49); return [`${a} + ${b}`, a + b]; }
      if (op === "tolak") { const a = rnd(10, 99), b = rnd(1, a); return [`${a} − ${b}`, a - b]; }
      const a = rnd(2, 12), b = rnd(1, 12); return [`${a} × ${b}`, a * b];
    });
    opt.op = op;
    return `${head(`Latihan Matematik: ${op[0].toUpperCase() + op.slice(1)} (${ops[op]})`, "Jawab semua soalan. Masa sasaran: 10 minit ⏱️")}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px 30px;font-size:1.3rem;font-weight:700;font-family:Fredoka,sans-serif">
        ${qs.map(([q], i) => `<div>${i + 1}) ${q} = <span style="display:inline-block;width:80px;border-bottom:2px solid #333"></span></div>`).join("")}
      </div>
      <div class="print-only" style="page-break-before:always"><h3>Skema jawapan</h3><p>${qs.map(([q, a], i) => `${i + 1}) ${a}`).join(" &nbsp; ")}</p></div>
      <details class="no-print" style="margin-top:14px"><summary><b>Lihat skema jawapan</b></summary><p>${qs.map(([, a], i) => `${i + 1}) ${a}`).join(" &nbsp; ")}</p></details>`;
  },
};

export function worksheetList(el) {
  el.innerHTML = `<div class="wrap page stack">
    <section class="banner"><h1>Worksheet for Kids</h1><span class="sub">🖨️ ${WORKSHEETS.length} jenis · jana tanpa had · cetak A4</span></section>
    <div class="grid lg">
      ${WORKSHEETS.map((w) => `<a class="tile" href="#/worksheet/${w.id}" style="--tile:${w.color}"><span class="em">${w.emoji}</span><span class="tt">${esc(w.title)}</span><span class="ds">${esc(w.desc)}</span></a>`).join("")}
    </div>
    <p class="small muted center">💡 Tip: dalam tetingkap cetak, pilih "Save as PDF" untuk simpan sebagai PDF.</p>
  </div>`;
}

export function worksheetView(el, { id }) {
  const w = WORKSHEETS.find((x) => x.id === id);
  if (!w) { location.hash = "/worksheet"; return; }
  const opt = {};
  const controls = {
    "mewarna-nombor": () => `<select class="input" data-o="pic" style="width:auto">${PICTURES.map((p) => `<option value="${p.id}">${p.emoji} ${p.name}</option>`).join("")}</select>`,
    "tracing-words": () => `<select class="input" data-o="set" style="width:auto"><option value="bm">Perkataan BM</option><option value="en">English words</option><option value="sendiri">Perkataan sendiri</option></select>
      <input class="input" data-o="custom" placeholder="cth: Aisyah, ibu, ayah" style="width:auto;flex:1;min-width:180px" maxlength="80">`,
    "meet-letter": () => `<select class="input" data-o="letter" style="width:auto">${ABC.map((a) => `<option>${a[0]}</option>`).join("")}</select>`,
    "latihan-matematik": () => `<select class="input" data-o="op" style="width:auto"><option value="tambah">Tambah</option><option value="tolak">Tolak</option><option value="darab">Darab</option></select>`,
  };
  el.innerHTML = `<div class="wrap page">
    <div class="pagehead"><a class="back" href="#/worksheet" aria-label="Kembali">←</a><h1 style="font-size:1.3rem">${w.emoji} ${esc(w.title)}</h1></div>
    <div class="ws-tools no-print">
      ${controls[id]?.() || ""}
      <button class="btn sm sun" data-new>🔄 Jana Baru</button>
      <button class="btn sm" data-print>🖨️ Cetak / PDF</button>
      ${id === "mewarna-nombor" ? `<a class="btn sm grape" href="#/pensel/colour-object">🖌️ Warna secara digital</a>` : ""}
    </div>
    <div class="sheet" data-sheet></div>
  </div>`;
  const sheet = el.querySelector("[data-sheet]");
  const draw = () => {
    el.querySelectorAll("[data-o]").forEach((i) => { if (i.value) opt[i.dataset.o] = i.value; });
    sheet.innerHTML = GEN[id](opt) + foot;
    el.querySelectorAll("select[data-o]").forEach((i) => { if (opt[i.dataset.o]) i.value = opt[i.dataset.o]; });
  };
  el.querySelectorAll("[data-o]").forEach((i) => i.addEventListener(i.tagName === "SELECT" ? "change" : "input", draw));
  el.querySelector("[data-new]").onclick = () => {
    if (id === "mewarna-nombor") { const s = el.querySelector("[data-o=pic]"); s.value = pick(PICTURES.filter((p) => p.id !== s.value)).id; }
    if (id === "meet-letter") { el.querySelector("[data-o=letter]").value = pick(ABC)[0]; }
    draw();
  };
  el.querySelector("[data-print]").onclick = () => window.print();
  draw();
}
