// Peta Kartun — adventure maps. Each station is a mini challenge; stations unlock in order.
import { make, fromBank, Q, genWordPic, genPicWord, genSyllable, genFirstSyl, genMissingSyl, SENTENCE_BANK,
  genMoneyCount, genChange, genAfford, genColorName, genColorFind, genColorObject, genColorMix, RAINBOW_BANK,
  genCount, genAdd, genSub, genStory, genPattern, genTimes, genClock, genCalendar } from "./questions.js";
import { MONEY, moneyHtml } from "./visuals.js";
import { pick, sample } from "../util.js";

const N = 8;
const quiz = (gen) => ({ type: "quiz", gen: () => make(N, gen) });
const mix = (...gens) => () => pick(gens)();
const bank = (b) => ({ type: "quiz", gen: () => fromBank(b, N) });

const genBiggestMoney = () => {
  const items = sample(MONEY, 4);
  const best = items.reduce((a, b) => (b.v > a.v ? b : a));
  return Q("Duit mana nilainya PALING BESAR?", "", best.v, items.filter((x) => x !== best).map((x) => x.v), { label: (v) => moneyHtml([v]) });
};

export const SCENES = {
  candy: { bg: "linear-gradient(#ffe0f0,#fff3c4)", pool: ["🍬", "🍭", "🍫", "🍩", "🍪", "🧁", "🍰", "🎂", "🍮", "🍯", "🍡", "🥧", "🍦", "🍨", "🧃", "🎈", "🎀", "⭐"], targets: ["🍭", "🍩", "🧁", "🍪", "🎂", "🍦", "🍫", "🍡", "🎀", "🍯"], decor: [["☁️", 5, 5, 4], ["☁️", 70, 8, 5]] },
  forest: { bg: "linear-gradient(#d9f99d,#86efac)", pool: ["🌳", "🌲", "🍄", "🌷", "🌼", "🍓", "🐞", "🐌", "🦋", "🐿️", "🦔", "🍂", "🌿", "🪵", "🐝", "🐛", "🦉", "🐸"], targets: ["🍄", "🐞", "🦋", "🐿️", "🦔", "🦉", "🐸", "🐌", "🍓", "🐛"], decor: [["🌳", 2, 60, 5], ["🌲", 80, 55, 5]] },
  ice: { bg: "linear-gradient(#e0f2fe,#ffffff)", pool: ["❄️", "⛄", "🐧", "🐻‍❄️", "🧊", "🏔️", "🧣", "🧤", "🎿", "🛷", "🦭", "🐋", "🌨️", "☃️", "🧥", "🥶"], targets: ["⛄", "🐧", "🐻‍❄️", "🧤", "🎿", "🛷", "🦭", "🧣", "🐋", "🧥"], decor: [["🏔️", 60, 50, 6]] },
  sea: { bg: "linear-gradient(#bae6fd,#0ea5e9)", pool: ["🐟", "🐠", "🐡", "🦀", "🐙", "🦑", "🐚", "🪸", "🐬", "🐳", "🦈", "🐢", "🦞", "🪼", "🌊", "🫧"], targets: ["🐙", "🦀", "🐢", "🦈", "🐚", "🐡", "🦞", "🪼", "🐬", "🦑"], decor: [["🫧", 10, 10, 3], ["🫧", 80, 30, 3]] },
  space: { bg: "linear-gradient(#1e1b4b,#6d28d9)", pool: ["⭐", "🌟", "✨", "🌙", "🪐", "☄️", "🚀", "🛸", "👽", "🌍", "🛰️", "🌑", "💫", "🔭", "👩‍🚀", "🌞"], targets: ["🚀", "🛸", "👽", "🪐", "🛰️", "🔭", "👩‍🚀", "☄️", "🌍", "🌙"] },
  farm: { bg: "linear-gradient(#fef9c3,#bbf7d0)", pool: ["🐄", "🐖", "🐑", "🐓", "🐤", "🦆", "🐴", "🐐", "🌾", "🌽", "🥕", "🚜", "🏡", "🪣", "🥚", "🌻"], targets: ["🐖", "🐑", "🐤", "🦆", "🐐", "🚜", "🥕", "🌽", "🥚", "🪣"] },
};
const hidden = (scene) => ({ type: "hidden", scene });

export const MAPS = [
  {
    id: "bandar-membaca", title: "Jom Membaca di Bandar Ceria", emoji: "🏙️", color: "#e0f2fe", desc: "Baca perkataan, suku kata & ayat di sekitar bandar.",
    bg: ["#bbf7d0", "#86efac"], road: "#94a3b8", decor: [["🌳", 30, 120], ["🌳", 350, 260], ["🚗", 200, 330], ["🌳", 60, 470], ["🏢", 340, 520], ["🚌", 120, 220]],
    stations: [
      { name: "Sekolah", emoji: "🏫", ...quiz(genWordPic) },
      { name: "Kedai Buku", emoji: "📚", ...quiz(genPicWord) },
      { name: "Taman", emoji: "🎠", ...quiz(genSyllable) },
      { name: "Klinik", emoji: "🏥", ...quiz(genFirstSyl) },
      { name: "Pasar Raya", emoji: "🛒", ...quiz(genMissingSyl) },
      { name: "Perpustakaan", emoji: "🏛️", ...bank(SENTENCE_BANK) },
      { name: "Stesen Bas", emoji: "🚏", ...quiz(mix(genWordPic, genSyllable, genMissingSyl, genFirstSyl)) },
    ],
  },
  {
    id: "awan-imaginasi", title: "Cari Objek di Awan Imaginasi", emoji: "☁️", color: "#fce7f3", desc: "Teliti gambar & cari objek tersembunyi!",
    bg: ["#fbcfe8", "#ddd6fe"], road: "#ffffff", decor: [["☁️", 60, 90], ["☁️", 330, 200], ["🌈", 200, 300], ["☁️", 80, 420], ["⭐", 340, 470]],
    stations: [
      { name: "Awan Gula-gula", emoji: "🍭", ...hidden(SCENES.candy) },
      { name: "Hutan Strawberi", emoji: "🍓", ...hidden(SCENES.forest) },
      { name: "Ladang Ceria", emoji: "🚜", ...hidden(SCENES.farm) },
      { name: "Gunung Ais", emoji: "🏔️", ...hidden(SCENES.ice) },
      { name: "Dasar Laut", emoji: "🐠", ...hidden(SCENES.sea) },
      { name: "Angkasa Lepas", emoji: "🚀", ...hidden(SCENES.space) },
    ],
  },
  {
    id: "pekan-duit", title: "Belajar Mengira Duit di Pekan Pasar", emoji: "🪙", color: "#fef3c7", desc: "Kenali syiling & wang kertas Malaysia, kira baki.",
    bg: ["#fde68a", "#fcd34d"], road: "#fff7ed", decor: [["🏪", 330, 110], ["🌴", 40, 250], ["🛺", 330, 330], ["🌴", 360, 470], ["🧺", 50, 520]],
    stations: [
      { name: "Kenal Nilai Duit", emoji: "🔍", ...quiz(genBiggestMoney) },
      { name: "Kira Syiling", emoji: "🪙", ...quiz(genMoneyCount(false)) },
      { name: "Kira Wang Kertas", emoji: "💵", ...quiz(genMoneyCount(true)) },
      { name: "Kedai Runcit", emoji: "🧾", ...quiz(genChange) },
      { name: "Cukup Ke Duit?", emoji: "🛍️", ...quiz(genAfford) },
      { name: "Bank Pekan", emoji: "🏦", ...quiz(mix(genMoneyCount(false), genMoneyCount(true), genChange, genAfford)) },
    ],
  },
  {
    id: "taman-tema-warna", title: "Mengenal Warna di Taman Tema", emoji: "🎡", color: "#ede9fe", desc: "Naik permainan sambil belajar warna.",
    bg: ["#c4b5fd", "#f0abfc"], road: "#fef3c7", decor: [["🎈", 40, 80], ["🎆", 340, 160], ["🍿", 50, 300], ["🎈", 350, 420], ["✨", 200, 520]],
    stations: [
      { name: "Roda Ferris", emoji: "🎡", ...quiz(genColorName("ms")) },
      { name: "Kuda Pusing", emoji: "🎠", ...quiz(genColorFind) },
      { name: "Roller Coaster", emoji: "🎢", ...quiz(genColorObject) },
      { name: "Kedai Gula", emoji: "🍭", ...quiz(genColorMix) },
      { name: "Khemah Sarkas", emoji: "🎪", ...bank(RAINBOW_BANK) },
      { name: "Istana Ajaib", emoji: "🏰", ...quiz(genColorName("en")) },
      { name: "Bunga Api", emoji: "🎆", ...quiz(mix(genColorName("ms"), genColorObject, genColorMix, genColorFind)) },
    ],
  },
  {
    id: "rumah-pokok", title: "Matematik di Rumah Pokok", emoji: "🌳", color: "#dcfce7", desc: "Panjat setiap tingkat dengan menyelesaikan soalan.",
    bg: ["#a7f3d0", "#fde68a"], road: "#a16207", decor: [["🍃", 40, 100], ["🐿️", 340, 200], ["🍎", 60, 330], ["🦉", 340, 430], ["🍃", 200, 530]],
    stations: [
      { name: "Tingkat 1: Kira", emoji: "1️⃣", ...quiz(genCount(10)) },
      { name: "Tingkat 2: Tambah", emoji: "2️⃣", ...quiz(genAdd(10, true)) },
      { name: "Tingkat 3: Tolak", emoji: "3️⃣", ...quiz(genSub(10, true)) },
      { name: "Tingkat 4: Pola", emoji: "4️⃣", ...quiz(genPattern) },
      { name: "Tingkat 5: Cerita", emoji: "5️⃣", ...quiz(genStory(20)) },
      { name: "Tingkat 6: Darab", emoji: "6️⃣", ...quiz(mix(genTimes(2), genTimes(5), genTimes(10))) },
    ],
  },
  {
    id: "pulau-masa", title: "Pulau Masa & Kalendar", emoji: "⏰", color: "#ffedd5", desc: "Belajar membaca jam, hari & bulan.",
    bg: ["#7dd3fc", "#fde68a"], road: "#fef3c7", decor: [["🌴", 40, 90], ["⛵", 340, 150], ["🐚", 60, 330], ["🌴", 350, 400], ["🦀", 200, 530]],
    stations: [
      { name: "Jam Tepat", emoji: "🕐", ...quiz(genClock(false)) },
      { name: "Jam Lagi!", emoji: "🕒", ...quiz(genClock(false)) },
      { name: "Hari & Bulan", emoji: "📅", ...quiz(genCalendar) },
      { name: "Jam Pakar", emoji: "⏱️", ...quiz(genClock(true)) },
      { name: "Menara Masa", emoji: "🗼", ...quiz(mix(genClock(true), genCalendar)) },
    ],
  },
  {
    id: "lembah-sifir", title: "Lembah Anak Bijak Sifir", emoji: "✖️", color: "#e0e7ff", desc: "Jelajah lembah dengan menghafal sifir 2–9.",
    bg: ["#bef264", "#fef08a"], road: "#fde68a", decor: [["🍄", 40, 100], ["🐇", 340, 190], ["🌷", 50, 320], ["🏡", 340, 430], ["🥕", 200, 530]],
    stations: [2, 3, 4, 5, 6, 7, 8, 9].map((t, i) => ({ name: `Sifir ${t}`, emoji: ["🍓", "🍇", "🥕", "🌽", "🍄", "🌻", "🍒", "👑"][i], ...quiz(genTimes(t)) })),
  },
];
export const mapById = (id) => MAPS.find((m) => m.id === id);
