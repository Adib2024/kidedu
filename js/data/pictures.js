// Line-art pictures made of fillable regions (for colour-by-number & digital colouring).
// Region: [tag, attrs, colourNumber, labelX, labelY]

const PAL = {
  langit: ["#93c5fd", "Biru Muda"], rumput: ["#4ade80", "Hijau"], kuning: ["#facc15", "Kuning"], merah: ["#ef4444", "Merah"],
  coklat: ["#a16207", "Coklat"], oren: ["#fb923c", "Oren"], biru: ["#2563eb", "Biru"], jambu: ["#f472b6", "Merah Jambu"],
  ungu: ["#a855f7", "Ungu"], hitam: ["#1f2937", "Hitam"], kelabu: ["#9ca3af", "Kelabu"], putih: ["#ffffff", "Putih"], gelap: ["#1e3a8a", "Biru Gelap"],
};

const pic = (id, name, emoji, colors, regions, extra = "") => ({
  id, name, emoji,
  palette: colors.map((k) => ({ hex: PAL[k][0], name: PAL[k][1] })),
  regions, extra,
});

const star = (cx, cy, r) => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const rr = i % 2 ? r * 0.45 : r;
    const a = (36 * i - 90) * (Math.PI / 180);
    return `${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`;
  }).join(" ");
  return ["polygon", { points: pts }];
};

export const PICTURES = [
  pic("rumah", "Rumah Ceria", "🏠", ["langit", "rumput", "kuning", "merah", "coklat"], [
    ["rect", { x: 0, y: 0, width: 300, height: 230 }, 1, 30, 30],
    ["rect", { x: 0, y: 230, width: 300, height: 70 }, 2, 30, 270],
    ["circle", { cx: 255, cy: 45, r: 25 }, 3, 255, 50],
    ["rect", { x: 70, y: 130, width: 160, height: 110 }, 3, 220, 225],
    ["polygon", { points: "55,135 150,60 245,135" }, 4, 150, 115],
    ["rect", { x: 132, y: 180, width: 36, height: 60 }, 5, 150, 215],
    ["rect", { x: 85, y: 150, width: 35, height: 30 }, 1, 102, 170],
    ["rect", { x: 180, y: 150, width: 35, height: 30 }, 1, 197, 170],
  ]),
  pic("ikan", "Ikan Comel", "🐟", ["biru", "oren", "kuning", "rumput", "putih"], [
    ["rect", { x: 0, y: 0, width: 300, height: 300 }, 1, 25, 30],
    ["path", { d: "M0 300 Q30 240 20 200 Q40 240 50 300 Z" }, 4, 30, 280],
    ["path", { d: "M250 300 Q280 230 265 190 Q295 230 290 300 Z" }, 4, 275, 280],
    ["polygon", { points: "215,150 280,95 280,205" }, 3, 255, 155],
    ["polygon", { points: "110,103 150,55 175,105" }, 3, 147, 92],
    ["ellipse", { cx: 140, cy: 150, rx: 85, ry: 55 }, 2, 150, 175],
    ["circle", { cx: 95, cy: 138, r: 12 }, 5, 95, 143],
    ["circle", { cx: 60, cy: 60, r: 14 }, 5, 60, 65],
    ["circle", { cx: 40, cy: 100, r: 9 }, 5, 40, 104],
  ]),
  pic("roket", "Roket Angkasa", "🚀", ["gelap", "putih", "merah", "biru", "kuning", "oren"], [
    ["rect", { x: 0, y: 0, width: 300, height: 300 }, 1, 25, 280],
    star(50, 60, 18), star(250, 90, 14), star(240, 240, 18), star(60, 200, 12),
    ["polygon", { points: "130,215 150,285 170,215" }, 6, 150, 245],
    ["polygon", { points: "120,170 85,235 120,215" }, 3, 107, 210],
    ["polygon", { points: "180,170 215,235 180,215" }, 3, 193, 210],
    ["rect", { x: 120, y: 80, width: 60, height: 140, rx: 10 }, 2, 150, 195],
    ["polygon", { points: "120,82 150,20 180,82" }, 3, 150, 65],
    ["circle", { cx: 150, cy: 125, r: 18 }, 4, 150, 130],
  ].map((r, i) => (i >= 1 && i <= 4 ? [...r, 5, ...[[50, 64], [250, 94], [240, 244], [60, 205]][i - 1]] : r))),
  pic("bunga", "Bunga Mekar", "🌸", ["langit", "jambu", "kuning", "rumput", "coklat"], [
    ["rect", { x: 0, y: 0, width: 300, height: 300 }, 1, 25, 30],
    ["rect", { x: 144, y: 140, width: 12, height: 110 }, 4, 150, 200],
    ["ellipse", { cx: 120, cy: 200, rx: 25, ry: 12, transform: "rotate(-30 120 200)" }, 4, 120, 204],
    ["ellipse", { cx: 180, cy: 185, rx: 25, ry: 12, transform: "rotate(30 180 185)" }, 4, 180, 189],
    ["polygon", { points: "100,240 200,240 185,295 115,295" }, 5, 150, 272],
    ...[0, 72, 144, 216, 288].map((deg) => {
      const a = (deg - 90) * (Math.PI / 180);
      const cx = 150 + Math.cos(a) * 42, cy = 100 + Math.sin(a) * 42;
      return ["circle", { cx: cx.toFixed(1), cy: cy.toFixed(1), r: 30 }, 2, cx + Math.cos(a) * 10, cy + Math.sin(a) * 10 + 5];
    }),
    ["circle", { cx: 150, cy: 100, r: 24 }, 3, 150, 105],
  ]),
  pic("aiskrim", "Aiskrim Sedap", "🍦", ["jambu", "oren", "coklat", "merah", "putih"], [
    ["rect", { x: 0, y: 0, width: 300, height: 300 }, 5, 25, 30],
    ["polygon", { points: "105,150 195,150 150,285" }, 2, 150, 200],
    ["circle", { cx: 150, cy: 132, r: 48 }, 1, 120, 150],
    ["circle", { cx: 150, cy: 78, r: 40 }, 3, 150, 80],
    ["circle", { cx: 150, cy: 34, r: 13 }, 4, 150, 39],
  ]),
  pic("kereta", "Kereta Laju", "🚗", ["langit", "merah", "biru", "hitam", "kelabu", "kuning"], [
    ["rect", { x: 0, y: 0, width: 300, height: 220 }, 1, 25, 30],
    ["rect", { x: 0, y: 220, width: 300, height: 80 }, 5, 30, 280],
    ["circle", { cx: 250, cy: 50, r: 25 }, 6, 250, 55],
    ["polygon", { points: "90,150 120,100 200,100 235,150" }, 2, 215, 140],
    ["rect", { x: 40, y: 148, width: 220, height: 60, rx: 14 }, 2, 150, 185],
    ["polygon", { points: "105,148 127,112 155,112 155,148" }, 3, 135, 136],
    ["polygon", { points: "165,148 165,112 195,112 220,148" }, 3, 185, 136],
    ["circle", { cx: 90, cy: 212, r: 24 }, 4, 90, 217],
    ["circle", { cx: 210, cy: 212, r: 24 }, 4, 210, 217],
  ]),
  pic("rama-rama", "Rama-rama Cantik", "🦋", ["langit", "ungu", "jambu", "hitam", "kuning"], [
    ["rect", { x: 0, y: 0, width: 300, height: 300 }, 1, 25, 30],
    ["ellipse", { cx: 95, cy: 105, rx: 55, ry: 45, transform: "rotate(-20 95 105)" }, 2, 95, 110],
    ["ellipse", { cx: 205, cy: 105, rx: 55, ry: 45, transform: "rotate(20 205 105)" }, 2, 205, 110],
    ["ellipse", { cx: 105, cy: 190, rx: 40, ry: 35, transform: "rotate(20 105 190)" }, 3, 105, 195],
    ["ellipse", { cx: 195, cy: 190, rx: 40, ry: 35, transform: "rotate(-20 195 190)" }, 3, 195, 195],
    ["circle", { cx: 90, cy: 100, r: 14 }, 5, 90, 105],
    ["circle", { cx: 210, cy: 100, r: 14 }, 5, 210, 105],
    ["ellipse", { cx: 150, cy: 150, rx: 12, ry: 75 }, 4, 150, 155],
  ], `<path d="M146 80 Q130 40 115 35 M154 80 Q170 40 185 35" fill="none" stroke="#222" stroke-width="4" stroke-linecap="round"/>`),
  pic("pokok", "Pokok Buah", "🌳", ["langit", "rumput", "coklat", "merah", "kuning"], [
    ["rect", { x: 0, y: 0, width: 300, height: 240 }, 1, 25, 30],
    ["rect", { x: 0, y: 240, width: 300, height: 60 }, 2, 30, 275],
    ["circle", { cx: 260, cy: 40, r: 22 }, 5, 260, 45],
    ["rect", { x: 130, y: 160, width: 40, height: 95 }, 3, 150, 215],
    ["circle", { cx: 150, cy: 110, r: 75 }, 2, 120, 90],
    ["circle", { cx: 120, cy: 120, r: 12 }, 4, 120, 125],
    ["circle", { cx: 180, cy: 95, r: 12 }, 4, 180, 100],
    ["circle", { cx: 165, cy: 145, r: 12 }, 4, 165, 150],
    ["circle", { cx: 130, cy: 70, r: 12 }, 4, 130, 75],
  ]),
];

/** Render a picture as SVG markup. mode: "number" (white + numbers), "color" (filled with fills[]), "answer" (correct colours) */
export function pictureSvg(p, { mode = "number", fills = [], strokeW = 3, cls = "" } = {}) {
  const attrs = (o) => Object.entries(o).map(([k, v]) => `${k}="${v}"`).join(" ");
  const body = p.regions.map(([tag, a, n, lx, ly], i) => {
    const fill = mode === "answer" ? p.palette[n - 1].hex : mode === "color" ? fills[i] || "#ffffff" : "#ffffff";
    return `<${tag} ${attrs(a)} data-r="${i}" fill="${fill}" stroke="#222" stroke-width="${strokeW}" stroke-linejoin="round"/>`;
  }).join("");
  const labels = mode === "number"
    ? p.regions.map(([, , n, lx, ly]) => `<text x="${lx}" y="${ly}" font-size="16" font-weight="800" text-anchor="middle" font-family="Nunito, sans-serif" fill="#333" pointer-events="none">${n}</text>`).join("")
    : "";
  return `<svg class="${cls}" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">${body}${p.extra}${labels}</svg>`;
}

// Simple outline objects for "Colour the Objects" (100×100 viewBox)
export const OBJECTS = [
  { en: "apple", ms: "epal", colour: "red", warna: "merah", svg: `<circle cx="50" cy="58" r="32"/><path d="M50 26 Q52 14 58 8" fill="none"/><ellipse cx="64" cy="18" rx="10" ry="5" transform="rotate(-25 64 18)"/>` },
  { en: "sun", ms: "matahari", colour: "yellow", warna: "kuning", svg: `<circle cx="50" cy="50" r="22"/>${Array.from({ length: 8 }, (_, i) => { const a = (i * 45 * Math.PI) / 180; return `<line x1="${50 + Math.cos(a) * 30}" y1="${50 + Math.sin(a) * 30}" x2="${50 + Math.cos(a) * 44}" y2="${50 + Math.sin(a) * 44}"/>`; }).join("")}` },
  { en: "leaf", ms: "daun", colour: "green", warna: "hijau", svg: `<path d="M20 80 Q20 25 80 20 Q80 75 20 80 Z"/><path d="M20 80 L70 30" fill="none"/>` },
  { en: "balloon", ms: "belon", colour: "blue", warna: "biru", svg: `<ellipse cx="50" cy="40" rx="26" ry="32"/><path d="M50 72 Q44 82 52 90 Q58 96 50 100" fill="none"/>` },
  { en: "heart", ms: "hati", colour: "pink", warna: "merah jambu", svg: `<path d="M50 82 C 0 50, 20 8, 50 32 C 80 8, 100 50, 50 82 Z"/>` },
  { en: "star", ms: "bintang", colour: "yellow", warna: "kuning", svg: `<polygon points="${Array.from({ length: 10 }, (_, i) => { const r = i % 2 ? 18 : 40; const a = ((36 * i - 90) * Math.PI) / 180; return `${(50 + Math.cos(a) * r).toFixed(1)},${(52 + Math.sin(a) * r).toFixed(1)}`; }).join(" ")}"/>` },
  { en: "grapes", ms: "anggur", colour: "purple", warna: "ungu", svg: [[40, 35], [60, 35], [30, 52], [50, 52], [70, 52], [40, 69], [60, 69], [50, 86]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="11"/>`).join("") + `<path d="M50 24 L52 10" fill="none"/>` },
  { en: "orange", ms: "oren", colour: "orange", warna: "oren", svg: `<circle cx="50" cy="55" r="32"/><ellipse cx="56" cy="20" rx="9" ry="5"/>` },
  { en: "tree", ms: "pokok", colour: "green", warna: "hijau", svg: `<rect x="42" y="60" width="16" height="32"/><circle cx="50" cy="40" r="30"/>` },
  { en: "fish", ms: "ikan", colour: "orange", warna: "oren", svg: `<polygon points="70,50 92,32 92,68"/><ellipse cx="45" cy="50" rx="30" ry="20"/><circle cx="30" cy="45" r="3"/>` },
  { en: "cloud", ms: "awan", colour: "blue", warna: "biru", svg: `<path d="M25 70 Q8 70 12 55 Q14 42 30 44 Q34 26 52 30 Q66 20 76 36 Q94 38 90 56 Q90 70 75 70 Z"/>` },
  { en: "umbrella", ms: "payung", colour: "red", warna: "merah", svg: `<path d="M10 50 Q50 0 90 50 Z"/><path d="M50 50 L50 85 Q50 94 41 92" fill="none"/>` },
  { en: "ball", ms: "bola", colour: "purple", warna: "ungu", svg: `<circle cx="50" cy="50" r="36"/><path d="M14 50 Q50 30 86 50 M50 14 Q32 50 50 86" fill="none"/>` },
  { en: "car", ms: "kereta", colour: "red", warna: "merah", svg: `<rect x="10" y="45" width="80" height="25" rx="6"/><path d="M28 45 L38 28 L64 28 L76 45 Z"/><circle cx="30" cy="72" r="9"/><circle cx="72" cy="72" r="9"/>` },
];
export const COLOUR_HEX = { red: "#ef4444", yellow: "#facc15", green: "#22c55e", blue: "#3b82f6", pink: "#f472b6", purple: "#a855f7", orange: "#fb923c", brown: "#92400e" };
export const objectSvg = (o, size = 110, fill = "#fff") => `<svg viewBox="0 0 100 100" width="${size}" height="${size}" fill="${fill}" stroke="#222" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">${o.svg}</svg>`;
