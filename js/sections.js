// Section catalogue — drives the hub, landing page & report labels.
import { store } from "./store.js";
import { GAMES } from "./data/games.js";
import { MAPS } from "./data/maps.js";
import { BOOKS } from "./data/books.js";
import { TIPS } from "./data/tips.js";
import { WORKSHEETS } from "./pages/worksheets.js";
import { PENSEL } from "./pages/pensel.js";
import { IBU } from "./pages/ibu.js";
import { PLANNERS } from "./pages/planner.js";
import { SUBJECTS, YEARS, topics } from "./school/curriculum.js";

const SCHOOL_TOPICS = SUBJECTS.flatMap((s) => YEARS.flatMap((y) => topics(s.id, y).map((t) => ({ id: `bab/${s.id}/${y}/${t.id}`, title: `${t.title} (${s.short} T${y})`, emoji: t.emoji, color: s.color }))));

export const SECTIONS = [
  { key: "sekolah", zone: "anak", title: "Sekolah Tahun 1–6", emoji: "🎒", color: "#e0e7ff", href: "#/sekolah", list: SCHOOL_TOPICS, blurb: "Matematik, Bahasa Melayu, English & Sains ikut topik KSSR — latihan, soalan dengar, cabaran masa, lawan bos & ulang kaji pintar." },
  { key: "games", zone: "anak", title: "Games Online", emoji: "🎮", color: "#ddf3ff", href: "#/games", list: GAMES, blurb: "Kuiz tahap demi tahap: sifir, matematik, warna, buah, cuaca, English, simpulan bahasa & ingatan." },
  { key: "peta", zone: "anak", title: "Peta Kartun", emoji: "🗺️", color: "#fce7f3", href: "#/peta", list: MAPS, blurb: "Pengembaraan di peta — buka stesen satu demi satu: membaca, duit, warna, jam & objek tersembunyi." },
  { key: "buku", zone: "anak", title: "Buku Cerita", emoji: "📚", color: "#fef3c7", href: "#/buku", list: BOOKS, blurb: "Cerita asli BM dengan bacaan suara, sorotan perkataan & kuiz kefahaman." },
  { key: "pensel", zone: "anak", title: "Pensel Warna Digital", emoji: "🖍️", color: "#ede9fe", href: "#/pensel", list: PENSEL, blurb: "Surih nombor & huruf dengan semakan automatik, mewarna ikut nombor dan lukis bebas." },
  { key: "worksheet", zone: "anak", title: "Worksheet", emoji: "🖨️", color: "#dcfce7", href: "#/worksheet", list: WORKSHEETS, blurb: "Lembaran kerja A4 dijana tanpa had — cetak atau simpan PDF." },
  { key: "ibu", zone: "ibu", title: "Games untuk Ibu", emoji: "💖", color: "#ffe4e6", href: "#/ibu", list: IBU, blurb: "Kuiz personaliti, jurnal emosi, vision board & semakan kesejahteraan." },
  { key: "planner", zone: "ibu", title: "Planner", emoji: "📒", color: "#fff7ed", href: "#/planner", list: PLANNERS, blurb: "Planner harian, tabiat, rutin anak, syukur, matlamat, menu & belanja." },
  { key: "tips", zone: "ibu", title: "Tips & Info", emoji: "🎧", color: "#e0f2fe", href: "#/tips", list: TIPS, blurb: "12 tips keibubapaan bersuara: masa skrin, membaca, tidur, emosi, tantrum & banyak lagi." },
].map((s) => ({ ...s, count: s.list.length }));

export const TOTAL_TOPICS = SECTIONS.reduce((n, s) => n + s.count, 0);

/** Stars earned in a kid section (null for sections without stars). */
export function sectionProgress(s, childId) {
  if (!["sekolah", "games", "peta", "buku", "pensel"].includes(s.key)) return null;
  return Object.values(store.progress[childId] || {}).filter((r) => r.category === s.key).reduce((a, r) => a + r.stars, 0);
}

/** Search across every topic in every section (title, description, level names). */
export function searchTopics(q) {
  const norm = (t) => String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const words = norm(q).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const out = [];
  for (const s of SECTIONS) {
    for (const it of s.list) {
      const hay = norm([it.title, it.desc, s.title, ...(it.levels || []).map((l) => l.name), ...(it.stations || []).map((x) => x.name)].join(" "));
      if (words.every((w) => hay.includes(w))) out.push({ s, it, score: norm(it.title).includes(words[0]) ? 0 : 1 });
    }
  }
  return out.sort((a, b) => a.score - b.score);
}
