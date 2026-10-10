// Games Online — each game has levels; each level generates 10 fresh questions.
import { pick, sample, shuffle } from "../util.js";
import { FRUITS, COLORS, ANIMALS, BODY, HOME, FOOD, ACTIONS, NUMBER_WORDS, OPPOSITES } from "./lexicon.js";
import { SHAPES, shapeSvg } from "./visuals.js";
import {
  Q, make, fromBank, TF, blend, oddOne, spread, NOT_ANIMAL, NOT_FOOD, genTimes, genDivide, genAdd, genSub, genMissing, genMixed100, genStory, genCount, genBiggest,
  genPattern, genBeforeAfter, genPlace, genFraction, genColorName, genColorFind, genColorObject, genColorMix, RAINBOW_BANK,
  genFruitName, genFruitPick,
} from "./questions.js";

const N = 10;
const lv = (name, gen) => ({ name, gen: () => make(N, gen) });
const bankLv = (name, bank, o) => ({ name, gen: () => fromBank(bank, N, o) });

// ---------- fruit facts ----------
const FRUIT_FACTS = [
  ["Buah yang digelar 'Raja Buah' di Malaysia?", "Durian", ["Epal", "Pisang", "Anggur"], "👑"],
  ["Buah mana ada banyak biji hitam & isi merah?", "Tembikai", ["Pisang", "Nanas", "Kelapa"], "🍉"],
  ["Buah mana ada air yang boleh diminum terus?", "Kelapa", ["Epal", "Strawberi", "Ceri"], "🥥"],
  ["Buah mana perlu dikupas kulit kuningnya?", "Pisang", ["Anggur", "Ceri", "Strawberi"], "🍌"],
  ["Buah mana ada 'mahkota' daun di atas?", "Nanas", ["Oren", "Epal", "Pear"], "🍍"],
  ["Buah mana bijinya di LUAR (pada kulit)?", "Strawberi", ["Mangga", "Tembikai", "Kiwi"], "🍓"],
  ["Buah mana rasanya sangat masam?", "Lemon", ["Pisang", "Tembikai", "Mangga"], "🍋"],
  ["Monyet sangat suka makan buah…", "Pisang", ["Lemon", "Kelapa", "Kiwi"], "🐒"],
  ["Buah mana tumbuh bertangkai-tangkai (bertandan) kecil?", "Anggur", ["Nanas", "Kelapa", "Tembikai"], "🍇"],
  ["Buah tempatan berkulit merah berbulu, isi putih?", "Rambutan", ["Epal", "Ceri", "Strawberi"], "🔴"],
  ["Makan buah setiap hari membuat badan…", "Sihat & kuat", ["Sakit", "Mengantuk", "Lemah"], "💪"],
  ["Buah mana kulitnya coklat berbulu & isinya hijau?", "Kiwi", ["Pear", "Mangga", "Oren"], "🥝"],
];
const fruitColor = blend(
  [7, () => { const f = pick(FRUITS); return Q(`Apakah warna buah ${f.ms}?`, f.e, f.warna, COLORS.map((c) => c.ms)); }],
  [3, () => { const f = pick(FRUITS), w = Math.random() < 0.5 ? f.warna : pick(COLORS).ms; return TF(`${f.ms} berwarna ${w}`, w === f.warna, f.e); }],
);
const fruitLetter = blend(
  [6, () => { const f = pick(FRUITS); return Q(`${f.ms} bermula dengan huruf…`, f.e, f.ms[0], "ABCDEGKMNOPST".split("")); }],
  [4, () => { const L = pick([...new Set(FRUITS.map((f) => f.ms[0]))]); const ok = FRUITS.filter((f) => f.ms[0] === L);
    return Q(`Buah mana bermula dengan huruf <b>${L}</b>?`, "", pick(ok).e, FRUITS.filter((f) => f.ms[0] !== L).map((f) => f.e), { optCls: "big-emoji", say: `Buah mana bermula dengan huruf ${L}?` }); }],
);
const fruitEn = blend(
  [6, () => { const f = pick(FRUITS); return Q(`Apa nama ${f.ms} dalam English?`, f.e, f.en, FRUITS.map((x) => x.en), { say: `Apa nama ${f.ms} dalam bahasa Inggeris?` }); }],
  [2, () => { const f = pick(FRUITS); return Q(`Find: <b>${f.en}</b>`, "", f.e, FRUITS.map((x) => x.e), { lang: "en", optCls: "big-emoji", say: `Find the ${f.en}` }); }],
  [2, () => { const f = pick(FRUITS), g = Math.random() < 0.5 ? f : pick(FRUITS); return TF(`This is a ${g.en.toLowerCase()}`, f === g, f.e, { lang: "en" }); }],
);

// ---------- weather ----------
const WEATHER = [
  { e: "☀️", ms: "Cerah", bawa: "🕶️ Cermin mata hitam", pakai: "👕 Baju nipis & topi" },
  { e: "🌧️", ms: "Hujan", bawa: "☂️ Payung", pakai: "🧥 Baju hujan & but" },
  { e: "⛈️", ms: "Ribut Petir", bawa: "🏠 Duduk dalam rumah", pakai: "🏠 Kekal di dalam rumah" },
  { e: "☁️", ms: "Berawan", bawa: "🧢 Topi (mungkin hujan)", pakai: "👕 Baju biasa" },
  { e: "🌬️", ms: "Berangin", bawa: "🪁 Wau / layang-layang", pakai: "🧥 Jaket nipis" },
  { e: "❄️", ms: "Salji", bawa: "🧤 Sarung tangan", pakai: "🧣 Baju sejuk tebal & mafla" },
  { e: "🌈", ms: "Pelangi", bawa: "📷 Kamera untuk bergambar", pakai: "👕 Baju biasa" },
  { e: "🌫️", ms: "Berkabus", bawa: "🔦 Lampu suluh", pakai: "😷 Topeng muka (jika berjerebu)" },
];
const wName = blend(
  [7, () => { const w = pick(WEATHER); return Q("Cuaca apakah ini?", w.e, w.ms, WEATHER.map((x) => x.ms)); }],
  [3, () => { const w = pick(WEATHER), g = Math.random() < 0.5 ? w : pick(WEATHER); return TF(`Gambar ini cuaca ${g.ms}`, w === g, w.e); }],
);
const wBring = () => { const w = pick(WEATHER.slice(0, 6)); return Q(`Cuaca ${w.ms}. Apa yang sesuai?`, w.e, w.bawa, WEATHER.map((x) => x.bawa)); };
const wPick = () => { const w = pick(WEATHER); return Q(`Cari gambar cuaca <b>${w.ms}</b>!`, "", w.e, WEATHER.map((x) => x.e), { optCls: "big-emoji", say: `Cari cuaca ${w.ms}` }); };
const wWear = () => { const w = pick([WEATHER[0], WEATHER[1], WEATHER[5], WEATHER[4]]); return Q(`Cuaca ${w.ms}. Pakaian yang sesuai?`, w.e, w.pakai, WEATHER.map((x) => x.pakai)); };
const WEATHER_ACTIVITY = [
  ["Hari cerah & berangin. Aktiviti paling sesuai?", "Main layang-layang / wau", ["Tidur seharian", "Main salji", "Berteduh dari ribut"], "🌬️"],
  ["Hujan lebat di luar. Aktiviti sesuai?", "Baca buku di rumah", ["Berenang di sungai", "Main bola di padang", "Panjat pokok"], "🌧️"],
  ["Cuaca panas terik. Apa yang patut kita minum?", "Air kosong", ["Air bergas sahaja", "Tak perlu minum", "Kopi panas"], "☀️"],
  ["Ada salji di luar (di negara sejuk). Kita boleh…", "Bina orang salji", ["Berjemur di pantai", "Pakai selipar", "Main layang-layang"], "❄️"],
  ["Selepas hujan, matahari keluar. Apa mungkin kita nampak?", "Pelangi", ["Salji", "Bintang", "Bulan purnama"], "🌦️"],
  ["Cuaca berkabus tebal. Ayah memandu dengan…", "Lampu dipasang & perlahan", ["Laju", "Lampu ditutup", "Mata tertutup"], "🌫️"],
  ["Cuaca redup & nyaman. Sesuai untuk…", "Berkelah di taman", ["Duduk dalam peti sejuk", "Pakai baju sejuk tebal", "Main salji"], "⛅"],
  ["Musim tengkujuh, ombak besar. Kita patut…", "Jauhi pantai", ["Berenang di laut", "Naik bot kecil", "Main pasir di gigi air"], "🌊"],
  ["Hari panas, kita main di luar. Jangan lupa pakai…", "Topi", ["Sarung tangan tebal", "Mafla", "But salji"], "🧢"],
  ["Ribut petir sudah berhenti & langit cerah. Kita boleh…", "Keluar bermain semula", ["Terus duduk bawah meja", "Tutup lampu", "Menangis"], "🌤️"],
];
const WEATHER_FACTS = [
  ["Matahari terbit dari arah…", "Timur", ["Barat", "Utara", "Selatan"], "🌅"],
  ["Hujan datang daripada…", "Awan", ["Pokok", "Laut terus", "Bulan"], "☁️"],
  ["Malaysia ada musim…", "Panas & tengkujuh (hujan)", ["Salji", "Musim luruh", "Empat musim"], "🇲🇾"],
  ["Bunyi kuat semasa ribut dipanggil…", "Guruh", ["Pelangi", "Kabus", "Embun"], "⛈️"],
  ["Cahaya terang di langit semasa ribut dipanggil…", "Kilat", ["Bintang", "Pelangi", "Bulan"], "⚡"],
  ["Air yang beku menjadi…", "Ais", ["Wap", "Awan", "Pasir"], "🧊"],
  ["Titisan air pada daun waktu pagi dipanggil…", "Embun", ["Salji", "Kilat", "Ribut"], "🍃"],
  ["Alat untuk mengukur suhu ialah…", "Termometer", ["Pembaris", "Jam", "Kompas"], "🌡️"],
  ["Musim tengkujuh di pantai timur Malaysia biasanya pada bulan…", "November – Januari", ["Jun – Julai", "Mac – April", "Ogos"], "🌊"],
  ["Matahari terbenam di arah…", "Barat", ["Timur", "Atas", "Bawah"], "🌇"],
  ["Pelangi muncul bila cahaya matahari melalui…", "Titisan air hujan", ["Pasir", "Daun", "Batu"], "🌈"],
  ["Angin kuat berpusing dipanggil…", "Puting beliung", ["Embun", "Kabus", "Pelangi"], "🌪️"],
];
const WEATHER_SAFE = [
  ["Semasa ribut petir, kita patut…", "Masuk ke dalam rumah", ["Berteduh bawah pokok", "Main layang-layang", "Mandi di kolam"], "⛈️"],
  ["Kalau cuaca sangat panas, kita perlu…", "Minum banyak air", ["Tidak minum", "Lari di tengah panas", "Pakai baju tebal"], "🥵"],
  ["Semasa banjir, kita TIDAK boleh…", "Bermain dalam air banjir", ["Dengar nasihat ibu bapa", "Pergi ke tempat tinggi", "Bawa beg kecemasan"], "🌊"],
  ["Waktu jerebu, kita patut…", "Pakai topeng muka & kurang aktiviti luar", ["Bersukan di padang", "Buka semua tingkap", "Bakar sampah"], "🌫️"],
  ["Sebelum keluar waktu panas terik, pakai…", "Topi & pelindung matahari", ["Baju sejuk", "But hujan", "Sarung tangan tebal"], "☀️"],
  ["Jika terdengar guruh, kita patut…", "Jauhi tempat lapang & air", ["Panjat pokok", "Berenang", "Pegang tiang besi"], "⚡"],
  ["Bila hujan lebat, ayah memandu dengan…", "Perlahan & berhati-hati", ["Sangat laju", "Lampu tutup", "Tingkap terbuka"], "🚗"],
  ["Nombor kecemasan di Malaysia ialah…", "999", ["123", "555", "000"], "🚑"],
  ["Lepas main di luar waktu hujan, kita…", "Mandi & tukar baju kering", ["Tidur dengan baju basah", "Main lagi", "Tak buat apa-apa"], "🛁"],
  ["Barang penting dalam beg kecemasan banjir…", "Air, lampu suluh & ubat", ["Mainan sahaja", "Televisyen", "Bantal besar"], "🎒"],
];

// ---------- English ----------
const ODD = new Map([[ANIMALS, NOT_ANIMAL], [FOOD, NOT_FOOD]]);
const vocab = (list, q = "What is this?") => blend(
  [6, () => { const w = pick(list); return Q(q, w.e, w.en, list.map((x) => x.en), { lang: "en" }); }],
  [2, () => { const w = pick(list); const L = w.en[0].toUpperCase(); return Q(`<b>${w.en}</b> starts with the letter…`, w.e, L, "ABCDEFGHIKLMNOPRSTW".split(""), { lang: "en", say: `${w.en} starts with which letter?` }); }],
  [2, () => { const w = pick(list), g = Math.random() < 0.5 ? w : pick(list); return TF(`This picture shows "${g.en.toLowerCase()}"`, w === g, w.e, { lang: "en" }); }],
  ...(ODD.has(list) ? [[1, () => oddOne("Which one is <b>different</b>?", list.map((x) => x.e), ODD.get(list), { lang: "en", say: "Which one is different?" })]] : []),
);
const vocabPick = (list) => () => { const w = pick(list); return Q(`Find: <b>${w.en}</b>`, "", w.e, list.map((x) => x.e), { lang: "en", optCls: "big-emoji", say: `Find the ${w.en}` }); };
const mixVocab = (a, b) => () => (Math.random() < 0.5 ? a() : b());
const numberWord0 = () => { const n = Math.floor(Math.random() * 21); return Q(`How do you spell <b>${n}</b>?`, "", NUMBER_WORDS[n], NUMBER_WORDS, { lang: "en", say: `How do you spell ${n}?` }); };
const spelling0 = () => {
  const all = [...ANIMALS, ...FOOD, ...HOME].filter((w) => /^[A-Za-z]{3,7}$/.test(w.en));
  const w = pick(all);
  const i = Math.floor(Math.random() * w.en.length);
  const letter = w.en[i].toLowerCase();
  const shown = w.en.split("").map((c, j) => (j === i ? "_" : c)).join("");
  return Q(`Missing letter: <b>${shown}</b>`, w.e, letter, "abcdefghilmnoprstuw".split(""), { lang: "en", say: `Which letter is missing in ${w.en}?` });
};
const opposite0 = () => { const [a, b] = pick(OPPOSITES); const flip = Math.random() < 0.5; const [x, y] = flip ? [b, a] : [a, b]; return Q(`The opposite of <b>${x}</b> is…`, "↔️", y, OPPOSITES.flat(), { lang: "en", say: `What is the opposite of ${x}?` }); };

const numberWord = blend(
  [6, numberWord0],
  [4, () => { const n = Math.floor(Math.random() * 21); return Q(`<b>${NUMBER_WORDS[n]}</b> = ?`, "", n, [n + 1, n - 1, n + 2, n + 10].filter((x) => x >= 0 && x <= 30), { lang: "en", say: `Which number is ${NUMBER_WORDS[n]}?` }); }],
);
const misspell = (w) => {
  const i = Math.floor(Math.random() * (w.length - 1)) + 1;
  const k = Math.random();
  if (k < 0.33) return w.slice(0, i) + w[i] + w.slice(i); // double a letter
  if (k < 0.66) return w.slice(0, i) + w.slice(i + 1); // drop a letter
  return w.slice(0, i - 1) + w[i] + w[i - 1] + w.slice(i + 1); // swap two letters
};
const spelling = blend(
  [6, spelling0],
  [4, () => {
    const all = [...ANIMALS, ...FOOD, ...HOME].filter((w) => /^[A-Za-z]{4,8}$/.test(w.en));
    const w = pick(all), right = w.en.toLowerCase();
    const wrongs = [...new Set(Array.from({ length: 6 }, () => misspell(right)))].filter((x) => x !== right);
    return Q("Which spelling is <b>correct</b>?", w.e, right, wrongs, { lang: "en", say: "Which spelling is correct?" });
  }],
);
const opposite = blend(
  [7, opposite0],
  [3, () => { const [a, b] = pick(OPPOSITES), g = Math.random() < 0.5 ? b : pick(OPPOSITES.flat().filter((x) => x !== a)); return TF(`The opposite of "${a}" is "${g}"`, g === b, "↔️", { lang: "en" }); }],
);

// ---------- shapes ----------
const shapeName0 = () => { const s = pick(SHAPES); return Q("Apakah nama bentuk ini?", shapeSvg(s.id, pick(["#ff8cc6", "#7ccf2e", "#3db6ff", "#ffd23f", "#a78bfa"])), s.ms, SHAPES.map((x) => x.ms)); };
const shapeName = blend(
  [7, shapeName0],
  [3, () => { const sh = pick(SHAPES), g = Math.random() < 0.5 ? sh : pick(SHAPES); return TF(`Ini bentuk ${g.ms}`, sh === g, shapeSvg(sh.id, pick(["#ff8cc6", "#7ccf2e", "#3db6ff", "#ffd23f"]))); }],
);
const shapeSides = () => { const s = pick(SHAPES.filter((x) => [3, 4, 5, 6].includes(x.sides))); return Q("Berapa sisi bentuk ini?", shapeSvg(s.id), s.sides, [3, 4, 5, 6, 8].filter((x) => x !== s.sides)); };

// ---------- Simpulan Bahasa ----------
export const SIMPULAN = [
  ["ringan tulang", "rajin bekerja", "Aminah sangat ___ membantu ibunya di dapur."],
  ["berat tulang", "malas bekerja", "Jangan jadi ___, nanti kerja tak siap."],
  ["buah hati", "orang yang sangat disayangi", "Adik kecil itu ialah ___ keluarga kami."],
  ["anak emas", "anak/orang yang paling disayangi", "Dia menjadi ___ cikgu kerana sangat rajin."],
  ["besar kepala", "degil, tidak mahu mendengar nasihat", "Budak yang ___ selalu dimarahi."],
  ["kaki bangku", "tidak pandai bermain bola", "Walaupun ___, Ali tetap seronok bermain."],
  ["tangan terbuka", "suka menolong / bersedia menerima", "Penduduk kampung menyambut tetamu dengan ___."],
  ["mulut murai", "suka bercakap banyak", "Si ___ itu tidak berhenti bercerita."],
  ["otak udang", "bodoh / lambat berfikir", "Jangan panggil kawan ___, itu tidak sopan."],
  ["panjang tangan", "suka mencuri", "Orang yang ___ akan ditangkap polis."],
  ["tebal muka", "tidak tahu malu", "Dia ___ meminta makanan orang lain."],
  ["tin kosong", "orang yang cakap besar tetapi tiada ilmu", "Jangan jadi ___, belajarlah bersungguh-sungguh."],
  ["kaki ayam", "tidak memakai kasut", "Adik berlari ___ di atas rumput."],
  ["makan angin", "bersiar-siar / bercuti", "Keluarga kami pergi ___ ke Langkawi."],
  ["cahaya mata", "anak", "Puan Siti baru mendapat ___ yang comel."],
  ["darah daging", "anak sendiri / keluarga sendiri", "Walau apa pun, dia tetap ___ kita."],
  ["bulan madu", "percutian selepas berkahwin", "Pengantin baru itu pergi ___ ke Sabah."],
  ["buta huruf", "tidak tahu membaca", "Datuk mengajar orang ___ membaca."],
  ["cakar ayam", "tulisan yang tidak kemas", "Tulisan ___ susah dibaca cikgu."],
  ["harga mati", "harga yang tidak boleh dikurangkan lagi", "Kata peniaga itu, RM10 ialah ___."],
  ["hidung tinggi", "sombong", "Orang yang ___ tidak disukai kawan."],
  ["ikat perut", "berjimat makan", "Kami terpaksa ___ hingga hujung bulan."],
  ["jalan buntu", "tiada penyelesaian", "Perbincangan itu menemui ___."],
  ["kepala angin", "perangai tidak menentu", "Dia ___, sekejap gembira sekejap marah."],
  ["kera sumbang", "orang yang suka menyendiri", "Jangan jadi ___, mari bermain bersama."],
  ["lidah bercabang", "bercakap tidak jujur / berdolak-dalik", "Orang yang ___ susah dipercayai."],
  ["mata duitan", "terlalu mementingkan wang", "Peniaga ___ menaikkan harga sesuka hati."],
  ["naik darah", "marah", "Ayah ___ apabila kami bergaduh."],
  ["pilih kasih", "tidak adil, melebihkan seseorang", "Guru yang baik tidak ___."],
  ["rabun ayam", "kurang nampak pada waktu senja", "Nenek ___, jadi dia jarang keluar malam."],
  ["sakit hati", "berasa marah / kecewa", "Saya ___ apabila mainan saya dirosakkan."],
  ["ajak-ajak ayam", "mengajak tetapi tidak bersungguh-sungguh", "Dia hanya ___ sahaja untuk datang ke rumah."],
  ["ambil hati", "memujuk / menyenangkan hati orang", "Adik membuat kad untuk ___ ibu."],
  ["bahu-membahu", "bekerjasama", "Penduduk kampung ___ membersihkan surau."],
  ["banyak mulut", "suka bercakap / membantah", "Jangan ___ ketika cikgu mengajar."],
  ["duit kopi", "rasuah kecil", "Menerima ___ adalah salah di sisi undang-undang."],
  ["gaji buta", "dibayar tanpa bekerja", "Pekerja yang malas makan ___."],
  ["lepas tangan", "tidak mahu bertanggungjawab", "Jangan ___ apabila kerja kumpulan belum siap."],
  ["air muka", "wajah / maruah", "Jaga ___ keluarga dengan berkelakuan baik."],
  ["berat mulut", "pendiam", "Kakak ___ apabila berjumpa orang baru."],
];
const simpBank = (from, to) => SIMPULAN.slice(from, to);
const simpMeaning = (from, to) => () => {
  const pool = simpBank(from, to);
  return spread(sample(pool, N).map(([s, m], i) => {
    if (i % 4 === 3) {
      const truth = Math.random() < 0.5;
      const shown = truth ? m : pick(SIMPULAN.filter((x) => x[1] !== m))[1];
      return TF(`"${s}" bermaksud ${shown}`, truth, "📜");
    }
    return Q(`Apakah maksud <b>"${s}"</b>?`, "📜", m, SIMPULAN.map((x) => x[1]), { say: `Apakah maksud ${s}?` });
  }));
};
const simpReverse = () => sample(SIMPULAN, N).map(([s, m]) => Q(`Simpulan bahasa yang bermaksud <b>"${m}"</b>?`, "🔎", s, SIMPULAN.map((x) => x[0])));
const simpSentence = () => sample(SIMPULAN, N).map(([s, , ayat]) => Q(`Lengkapkan ayat:<br><span style="font-weight:500">${ayat}</span>`, "✍️", s, SIMPULAN.map((x) => x[0])));

// ---------- memory match themes ----------
export const MEMORY_SETS = [
  ["🍎", "🍌", "🍇", "🍉", "🍓", "🍍", "🥝", "🍒", "🍊", "🥥", "🍐", "🍋"],
  ["🐱", "🐶", "🐰", "🐼", "🦊", "🐸", "🐵", "🐯", "🦁", "🐮", "🐷", "🐨"],
  ["🚗", "🚌", "🚀", "🚲", "🚁", "⛵", "🚂", "✈️", "🚒", "🚜", "🛵", "🚑"],
  ["⭐", "🌙", "☀️", "🌈", "☁️", "⚡", "❄️", "🔥", "💧", "🌸", "🍀", "🌻"],
];

// =====================================================================
export const GAMES = [
  {
    id: "bijak-sifir", title: "Bijak Sifir", emoji: "✖️", color: "#ddf3ff", desc: "Hafal sifir 2 hingga 12 tahap demi tahap.",
    levels: [
      ...Array.from({ length: 11 }, (_, i) => lv(`Sifir ${i + 2}`, genTimes(i + 2))),
      lv("Sifir Campur", genTimes(0)),
      lv("Sifir Bahagi", genDivide),
    ],
  },
  {
    id: "matematik-1", title: "Matematik Kertas 1", emoji: "➕", color: "#ffecd9", desc: "Tambah, tolak & soalan cerita.",
    levels: [
      lv("Kira & Tambah (≤5)", genAdd(5, true)),
      lv("Tambah (≤10)", genAdd(10)),
      lv("Tolak (≤10)", genSub(10, true)),
      lv("Tambah (≤20)", genAdd(20)),
      lv("Tolak (≤20)", genSub(20)),
      lv("Nombor Hilang", genMissing(20)),
      lv("Tambah & Tolak (≤100)", genMixed100),
      lv("Soalan Cerita", genStory(20)),
    ],
  },
  {
    id: "matematik-2", title: "Matematik Kertas 2", emoji: "🔢", color: "#fff3c4", desc: "Kira objek, pola nombor, nilai tempat, bentuk & pecahan.",
    levels: [
      lv("Kira Objek", genCount(10)),
      lv("Besar & Kecil", genBiggest),
      lv("Sebelum & Selepas", genBeforeAfter),
      lv("Pola Nombor", genPattern),
      lv("Nilai Tempat", genPlace),
      lv("Nama Bentuk", shapeName),
      lv("Bentuk & Sisi", () => (Math.random() < 0.5 ? shapeSides() : shapeName())),
      lv("Separuh & Suku", genFraction),
    ],
  },
  {
    id: "kenali-buah", title: "Kenali Buah-buahan", emoji: "🍉", color: "#ffe0e0", desc: "Nama, warna, huruf & fakta buah.",
    levels: [
      lv("Teka Nama Buah", genFruitName),
      lv("Cari Gambar Buah", genFruitPick),
      lv("Warna Buah", fruitColor),
      lv("Huruf Pertama", fruitLetter),
      lv("Buah dalam English", fruitEn),
      bankLv("Fakta Buah", FRUIT_FACTS),
    ],
  },
  {
    id: "hero-warna", title: "Hero & Heroin Warna", emoji: "🦸", color: "#ffe0f0", desc: "Kenali warna, campur warna & pelangi.",
    levels: [
      lv("Apa Warna Ini?", genColorName("ms")),
      lv("Cari Warna", genColorFind),
      lv("Warna Objek", genColorObject),
      lv("Campur Warna", genColorMix),
      lv("Colours in English", genColorName("en")),
      bankLv("Misi Pelangi", RAINBOW_BANK),
    ],
  },
  {
    id: "dunia-cuaca", title: "Misi Dunia Cuaca", emoji: "🌦️", color: "#e3f6ff", desc: "Kenali cuaca, persediaan & keselamatan.",
    levels: [
      lv("Kenali Cuaca", () => (Math.random() < 0.5 ? wName() : wPick())),
      lv("Persediaan Cuaca", () => (Math.random() < 0.6 ? wBring() : wWear())),
      bankLv("Aktiviti Ikut Cuaca", WEATHER_ACTIVITY),
      bankLv("Fakta Cuaca", WEATHER_FACTS),
      bankLv("Selamat Bila Cuaca Buruk", WEATHER_SAFE),
    ],
  },
  {
    id: "learn-english", title: "Learn English", emoji: "🔤", color: "#efe7ff", desc: "Vocabulary, spelling & opposites.",
    lang: "en",
    levels: [
      lv("Animals", mixVocab(vocab(ANIMALS), vocabPick(ANIMALS))),
      lv("Food", mixVocab(vocab(FOOD), vocabPick(FOOD))),
      lv("Body Parts", vocab(BODY)),
      lv("Things at Home", mixVocab(vocab(HOME), vocabPick(HOME))),
      lv("Actions", vocab(ACTIONS, "What is he/she doing?")),
      lv("Number Words", numberWord),
      lv("Spelling", spelling),
      lv("Opposites", opposite),
    ],
  },
  {
    id: "simpulan-bahasa", title: "Simpulan Bahasa", emoji: "📜", color: "#f3e8ff", desc: "Fahami 40 simpulan bahasa Melayu.",
    levels: [
      { name: "Maksud 1–14", gen: simpMeaning(0, 14) },
      { name: "Maksud 15–28", gen: simpMeaning(14, 28) },
      { name: "Maksud 29–40", gen: simpMeaning(28, 40) },
      { name: "Teka Simpulan", gen: simpReverse },
      { name: "Lengkapkan Ayat", gen: simpSentence },
    ],
  },
  {
    id: "ingat-padan", title: "Ingat & Padan", emoji: "🧠", color: "#ecfbd6", desc: "Latih daya ingatan — padankan kad yang sama!",
    type: "memory",
    levels: [
      { name: "4 Pasang", pairs: 4, cols: 4 },
      { name: "6 Pasang", pairs: 6, cols: 4 },
      { name: "8 Pasang", pairs: 8, cols: 4 },
      { name: "10 Pasang", pairs: 10, cols: 5 },
      { name: "12 Pasang", pairs: 12, cols: 6 },
    ],
  },
];
export const gameById = (id) => GAMES.find((g) => g.id === id);
export { shuffle };
