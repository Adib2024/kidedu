// Pipi Panda — Playora's mascot as inline SVG, so it looks the same on every device
// (emoji differ between Android, iOS and Windows). Moods: happy, cheer, think, oops.
const INK = "#2d2238";
const EYES = {
  happy: `<path d="M37 61q5-6 10 0M73 61q5-6 10 0" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round"/>`,
  cheer: `<circle cx="42" cy="59" r="5.5" fill="#fff"/><circle cx="78" cy="59" r="5.5" fill="#fff"/><circle cx="43" cy="60" r="2.8" fill="${INK}"/><circle cx="79" cy="60" r="2.8" fill="${INK}"/><circle cx="44.2" cy="57.8" r="1.2" fill="#fff"/><circle cx="80.2" cy="57.8" r="1.2" fill="#fff"/>`,
  think: `<circle cx="42" cy="59" r="5" fill="#fff"/><circle cx="78" cy="59" r="5" fill="#fff"/><circle cx="40.5" cy="56.8" r="2.6" fill="${INK}"/><circle cx="76.5" cy="56.8" r="2.6" fill="${INK}"/>`,
  oops: `<circle cx="42" cy="60" r="5" fill="#fff"/><circle cx="78" cy="60" r="5" fill="#fff"/><circle cx="42" cy="62" r="2.6" fill="${INK}"/><circle cx="78" cy="62" r="2.6" fill="${INK}"/>`,
};
const MOUTH = {
  happy: `<path d="M52 80q8 8 16 0" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
  cheer: `<path d="M50 79q10 15 20 0z" fill="#ff7aa8" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>`,
  think: `<path d="M55 83h10" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
  oops: `<path d="M51 84q4.5-4 9 0t9 0" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
};
const EXTRA = {
  cheer: `<path d="M104 18l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#ffd23f" stroke="#e0a800" stroke-width="1.5"/>`,
  think: `<circle cx="104" cy="22" r="4" fill="#cfe9ff"/><circle cx="111" cy="12" r="6" fill="#cfe9ff"/>`,
  oops: `<path d="M98 40q4-9 7 0a3.6 3.6 0 1 1-7 0z" fill="#8fd3ff"/>`,
  happy: "",
};
const LABEL = { happy: "Pipi Panda tersenyum", cheer: "Pipi Panda bersorak", think: "Pipi Panda sedang berfikir", oops: "Pipi Panda memberi semangat" };

// Items the active child bought in Kedai Pipi ({ back, front, ids } of trusted SVG from shop.js)
let OUTFIT = null;
export const setOutfit = (o) => { OUTFIT = o && o.ids?.length ? o : null; };

/** opts.outfit: draw this outfit instead of the active child's (shop previews); null = plain Pipi. */
export function mascot(mood = "happy", size = 96, cls = "", opts = {}) {
  const m = EYES[mood] ? mood : "happy";
  const o = "outfit" in opts ? opts.outfit : OUTFIT;
  return `<svg class="mascot ${cls}" width="${size}" height="${size}" viewBox="0 0 120 120" role="img" aria-label="${LABEL[m]}"${o ? ` data-wear="${o.ids.join(" ")}"` : ""}>
    ${o?.back || ""}
    <circle cx="30" cy="32" r="16" fill="${INK}"/><circle cx="90" cy="32" r="16" fill="${INK}"/>
    <circle cx="30" cy="32" r="7" fill="#ff9cc2" opacity=".55"/><circle cx="90" cy="32" r="7" fill="#ff9cc2" opacity=".55"/>
    <ellipse cx="60" cy="66" rx="44" ry="40" fill="#fff" stroke="${INK}" stroke-width="3.5"/>
    <ellipse cx="42" cy="60" rx="11.5" ry="14" transform="rotate(-22 42 60)" fill="${INK}"/>
    <ellipse cx="78" cy="60" rx="11.5" ry="14" transform="rotate(22 78 60)" fill="${INK}"/>
    ${EYES[m]}
    <ellipse cx="60" cy="72" rx="6.5" ry="4.5" fill="${INK}"/>
    <circle cx="31" cy="77" r="6.5" fill="#ff9cc2" opacity=".7"/><circle cx="89" cy="77" r="6.5" fill="#ff9cc2" opacity=".7"/>
    ${MOUTH[m]}${o?.front || ""}${o?.front && m === "cheer" ? "" : EXTRA[m]}
  </svg>`;
}

/** Result-screen mood from stars earned. */
export const moodForStars = (s) => (s >= 3 ? "cheer" : s >= 1 ? "happy" : "oops");
