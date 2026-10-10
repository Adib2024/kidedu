// Small visual builders (HTML/SVG strings) shared by question generators.

/** n copies of an emoji, broken into rows of 5 for easy counting. */
export function emojiGroup(e, n, perRow = 5) {
  const rows = [];
  for (let i = 0; i < n; i += perRow) rows.push(e.repeat(Math.min(perRow, n - i)));
  return `<span style="display:inline-block;line-height:1.15;font-size:.8em">${rows.join("<br>")}</span>`;
}

// ---------- Malaysian money ----------
export const MONEY = [
  { v: 5, label: "5 sen", kind: "coin", silver: true },
  { v: 10, label: "10 sen", kind: "coin", silver: true },
  { v: 20, label: "20 sen", kind: "coin", silver: true },
  { v: 50, label: "50 sen", kind: "coin" },
  { v: 100, label: "RM1", kind: "note", color: "#2563eb" },
  { v: 500, label: "RM5", kind: "note", color: "#16a34a" },
  { v: 1000, label: "RM10", kind: "note", color: "#dc2626" },
  { v: 2000, label: "RM20", kind: "note", color: "#ea580c" },
  { v: 5000, label: "RM50", kind: "note", color: "#0d9488" },
  { v: 10000, label: "RM100", kind: "note", color: "#7c3aed" },
];
export const moneyItem = (v) => MONEY.find((m) => m.v === v);
export function moneyHtml(values) {
  return `<div class="money">${values.map((v) => {
    const m = moneyItem(v);
    if (m.kind === "coin") return `<span class="coin ${m.silver ? "silver" : ""}">${m.v}s</span>`;
    return `<span class="note" style="background:${m.color}">${m.label}</span>`;
  }).join("")}</div>`;
}
/** Format sen → "RM1.50" / "50 sen". */
export function rm(sen) {
  if (sen < 100) return `${sen} sen`;
  return `RM${(sen / 100).toFixed(sen % 100 ? 2 : 0)}`;
}

// ---------- analog clock ----------
export function clockSvg(h, m) {
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = ((i + 1) * 30 - 90) * (Math.PI / 180);
    return `<text x="${100 + Math.cos(a) * 72}" y="${100 + Math.sin(a) * 72 + 7}" text-anchor="middle" font-size="20" font-family="Baloo 2, sans-serif" font-weight="700" fill="#3b1d4a">${i + 1}</text>`;
  }).join("");
  const ma = (m * 6 - 90) * (Math.PI / 180);
  const ha = (((h % 12) + m / 60) * 30 - 90) * (Math.PI / 180);
  return `<svg class="clock-svg" viewBox="0 0 200 200" role="img" aria-label="Jam">
    <circle cx="100" cy="100" r="95" fill="#fff" stroke="#ff4fa3" stroke-width="8"/>
    ${ticks}
    <line x1="100" y1="100" x2="${100 + Math.cos(ha) * 45}" y2="${100 + Math.sin(ha) * 45}" stroke="#3b1d4a" stroke-width="8" stroke-linecap="round"/>
    <line x1="100" y1="100" x2="${100 + Math.cos(ma) * 66}" y2="${100 + Math.sin(ma) * 66}" stroke="#3db6ff" stroke-width="5" stroke-linecap="round"/>
    <circle cx="100" cy="100" r="7" fill="#ff4fa3"/>
  </svg>`;
}

// ---------- shapes ----------
export const SHAPES = [
  { id: "bulatan", ms: "Bulatan", en: "Circle", sides: 0 },
  { id: "segitiga", ms: "Segi Tiga", en: "Triangle", sides: 3 },
  { id: "segiempatsama", ms: "Segi Empat Sama", en: "Square", sides: 4 },
  { id: "segiempattepat", ms: "Segi Empat Tepat", en: "Rectangle", sides: 4 },
  { id: "pentagon", ms: "Pentagon", en: "Pentagon", sides: 5 },
  { id: "heksagon", ms: "Heksagon", en: "Hexagon", sides: 6 },
  { id: "bintang", ms: "Bintang", en: "Star", sides: 10 },
  { id: "hati", ms: "Hati", en: "Heart", sides: 0 },
  { id: "bujur", ms: "Bujur", en: "Oval", sides: 0 },
  { id: "rombus", ms: "Rombus", en: "Diamond", sides: 4 },
];
function poly(n, r, cx, cy, rot = -90) {
  return Array.from({ length: n }, (_, i) => {
    const a = ((360 / n) * i + rot) * (Math.PI / 180);
    return `${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`;
  }).join(" ");
}
export function shapePath(id, cx = 50, cy = 50, s = 40, attrs = "") {
  switch (id) {
    case "bulatan": return `<circle cx="${cx}" cy="${cy}" r="${s}" ${attrs}/>`;
    case "bujur": return `<ellipse cx="${cx}" cy="${cy}" rx="${s}" ry="${s * 0.65}" ${attrs}/>`;
    case "segitiga": return `<polygon points="${poly(3, s * 1.1, cx, cy + s * 0.15)}" ${attrs}/>`;
    case "segiempatsama": return `<rect x="${cx - s * 0.8}" y="${cy - s * 0.8}" width="${s * 1.6}" height="${s * 1.6}" rx="3" ${attrs}/>`;
    case "segiempattepat": return `<rect x="${cx - s}" y="${cy - s * 0.55}" width="${s * 2}" height="${s * 1.1}" rx="3" ${attrs}/>`;
    case "pentagon": return `<polygon points="${poly(5, s, cx, cy)}" ${attrs}/>`;
    case "heksagon": return `<polygon points="${poly(6, s, cx, cy, 0)}" ${attrs}/>`;
    case "rombus": return `<polygon points="${cx},${cy - s} ${cx + s * 0.7},${cy} ${cx},${cy + s} ${cx - s * 0.7},${cy}" ${attrs}/>`;
    case "bintang": {
      const pts = Array.from({ length: 10 }, (_, i) => {
        const r = i % 2 ? s * 0.45 : s;
        const a = (36 * i - 90) * (Math.PI / 180);
        return `${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`;
      }).join(" ");
      return `<polygon points="${pts}" ${attrs}/>`;
    }
    case "hati": {
      const k = s / 40;
      return `<path d="M${cx} ${cy + 30 * k} C ${cx - 50 * k} ${cy - 5 * k}, ${cx - 30 * k} ${cy - 45 * k}, ${cx} ${cy - 20 * k} C ${cx + 30 * k} ${cy - 45 * k}, ${cx + 50 * k} ${cy - 5 * k}, ${cx} ${cy + 30 * k} Z" ${attrs}/>`;
    }
  }
  return "";
}
export function shapeSvg(id, fill = "#ff8cc6", size = 110) {
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}">${shapePath(id, 50, 50, 40, `fill="${fill}" stroke="#3b1d4a" stroke-width="3"`)}</svg>`;
}

export const swatch = (hex) => `<span class="swatch" style="background:${hex}"></span>`;
export const sw = (hex) => `<span class="sw" style="background:${hex}"></span>`;
