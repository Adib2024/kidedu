// Sains Tahun 1–6 (topik selaras KSSR): hidupan, manusia, bahan, fizik, bumi & angkasa.
// Banks of facts turned into questions; emoji pictures keep it visual for younger pupils.
import { mcq, tf, input, order, match, blend, pick, sample, rnd } from "./qkit.js";

const pic = (e) => `<span class="qbig">${e}</span>`;
/** Multiple choice from [prompt, answer, distractors, emoji?] rows. */
const ask = (rows) => () => { const [p, a, ds, e] = pick(rows); return mcq(p, a, ds, e ? { visual: pic(e) } : {}); };
/** True/false from [statement, isTrue] rows. */
const tfq = (rows) => () => { const [s, ok] = pick(rows); return tf(s, ok); };
/** Sort items into groups: rows [emoji, name, group]; prompt(name) → question. */
const sortInto = (rows, prompt, groups) => () => { const [e, n, g] = pick(rows); return mcq(prompt(n), g, groups.filter((x) => x !== g), { visual: pic(e), n: groups.length }); };
/** Match pairs (distinct right-hand sides). */
const pairs = (rows, prompt, n = 4) => () => match(prompt, sample(rows.filter((x, i, a) => a.findIndex((y) => y[1] === x[1]) === i), n));

// ================================================================ TAHUN 1
const DERIA = [["mata", "melihat", "👁️"], ["telinga", "mendengar", "👂"], ["hidung", "menghidu", "👃"], ["lidah", "merasa", "👅"], ["kulit", "menyentuh", "✋"]];
const DERIA_OBJ = [["🌸", "bau bunga", "hidung"], ["🔔", "bunyi loceng", "telinga"], ["🍋", "rasa masam limau", "lidah"], ["🧊", "sejuknya ais", "kulit"], ["🌈", "warna pelangi", "mata"],
  ["🎵", "lagu di radio", "telinga"], ["🍬", "rasa manis gula-gula", "lidah"], ["🔥", "panasnya api", "kulit"], ["🍞", "bau roti bakar", "hidung"], ["⭐", "bintang di langit", "mata"], ["🐶", "salakan anjing", "telinga"], ["🧸", "lembutnya anak patung", "kulit"]];
const deria = blend(
  [3, () => { const [e, thing, organ] = pick(DERIA_OBJ); return mcq(`Deria apakah yang digunakan untuk mengesan <b>${thing}</b>?`, organ, DERIA.map((d) => d[0]), { visual: pic(e) }); }],
  [2, () => { const [o, f, e] = pick(DERIA); return mcq(`Kita menggunakan <b>${o}</b> untuk…`, f, DERIA.map((d) => d[1]), { visual: pic(e) }); }],
  [1, pairs(DERIA.map(([o, f]) => [o, f]), "Padankan organ deria dengan fungsinya.")],
  [1, tfq([["Kita mendengar dengan menggunakan hidung.", false], ["Lidah membantu kita merasa makanan.", true], ["Kita ada lima deria.", true], ["Kulit dapat merasa panas dan sejuk.", true], ["Mata digunakan untuk menghidu.", false]])],
);
const LITUP = [["🐱", "Kucing", "bulu"], ["🐔", "Ayam", "bulu pelepah"], ["🐟", "Ikan", "sisik"], ["🐢", "Kura-kura", "cangkerang keras"], ["🐍", "Ular", "sisik"], ["🐦", "Burung", "bulu pelepah"], ["🐸", "Katak", "kulit lembap"], ["🐑", "Biri-biri", "bulu"]];
const GERAK = [["🐦", "Burung", "terbang"], ["🐟", "Ikan", "berenang"], ["🐍", "Ular", "menjalar"], ["🐸", "Katak", "melompat"], ["🐎", "Kuda", "berlari"], ["🦘", "Kanggaru", "melompat"], ["🦋", "Rama-rama", "terbang"], ["🐬", "Ikan lumba-lumba", "berenang"]];
const haiwan1 = blend(
  [2, () => { const [e, n, c] = pick(LITUP); return mcq(`Badan ${n.toLowerCase()} dilitupi oleh…`, c, ["bulu", "bulu pelepah", "sisik", "cangkerang keras", "kulit lembap"], { visual: pic(e) }); }],
  [2, () => { const [e, n, g] = pick(GERAK); return mcq(`Bagaimanakah ${n.toLowerCase()} bergerak?`, g, ["terbang", "berenang", "menjalar", "melompat", "berlari"], { visual: pic(e) }); }],
  [1, pairs(GERAK.map(([e, n, g]) => [`${e} ${n}`, g]), "Padankan haiwan dengan cara ia bergerak.")],
  [1, tfq([["Ikan bernafas menggunakan insang.", true], ["Semua haiwan boleh terbang.", false], ["Kura-kura mempunyai cangkerang yang keras.", true], ["Ayam mempunyai empat kaki.", false]])],
);
const BHG = [["akar", "menyerap air dan garam mineral dari tanah"], ["batang", "menyokong tumbuhan supaya tegak"], ["daun", "membuat makanan untuk tumbuhan"], ["bunga", "membentuk buah"], ["buah", "melindungi biji"]];
const MAKAN_BHG = [["🥕", "Lobak merah", "akar"], ["🥬", "Bayam", "daun"], ["🎋", "Tebu", "batang"], ["🥦", "Brokoli", "bunga"], ["🍎", "Epal", "buah"], ["🌽", "Jagung", "biji"], ["🥜", "Kacang tanah", "biji"], ["🥒", "Timun", "buah"]];
const tumbuhan1 = blend(
  [2, () => { const [p, f] = pick(BHG); return mcq(`Bahagian tumbuhan yang berfungsi <b>${f}</b> ialah…`, p, BHG.map((x) => x[0])); }],
  [2, () => { const [e, n, p] = pick(MAKAN_BHG); return mcq(`Bahagian tumbuhan manakah yang kita makan pada <b>${n.toLowerCase()}</b>?`, p, ["akar", "batang", "daun", "bunga", "buah", "biji"], { visual: pic(e) }); }],
  [1, () => order("Susun bahagian pokok dari <b>bawah</b> ke <b>atas</b>.", ["akar", "batang", "daun"])],
  [1, pairs(BHG, "Padankan bahagian tumbuhan dengan fungsinya.", 3)],
);
const MAGNET = [["📎", "Klip kertas besi", "Ditarik"], ["🔩", "Skru besi", "Ditarik"], ["🔑", "Kunci besi", "Ditarik"], ["📌", "Paku tekan besi", "Ditarik"], ["✂️", "Bilah gunting besi", "Ditarik"],
  ["🧽", "Span", "Tidak ditarik"], ["🪵", "Kayu", "Tidak ditarik"], ["📄", "Kertas", "Tidak ditarik"], ["🥛", "Gelas kaca", "Tidak ditarik"], ["🎈", "Belon getah", "Tidak ditarik"], ["🧸", "Anak patung kain", "Tidak ditarik"], ["🥄", "Sudu plastik", "Tidak ditarik"]];
const magnet = blend(
  [3, sortInto(MAGNET, (n) => `Adakah <b>${n.toLowerCase()}</b> ditarik oleh magnet?`, ["Ditarik", "Tidak ditarik"])],
  [2, ask([["Dua kutub magnet yang <b>sama</b> akan…", "menolak", ["menarik", "melekat", "tidak berubah"]], ["Dua kutub magnet yang <b>berlainan</b> akan…", "menarik", ["menolak", "berpusing", "pecah"]],
    ["Magnet berbentuk huruf U dipanggil magnet…", "ladam", ["bar", "cincin", "butang"], "🧲"], ["Magnet menarik objek yang diperbuat daripada…", "besi", ["kayu", "plastik", "kertas"]],
    ["Kutub magnet ialah kutub utara dan kutub…", "selatan", ["timur", "barat", "tengah"]], ["Bahagian magnet yang paling kuat tarikannya ialah…", "kutub", ["tengah", "tepi", "permukaan"]]])],
  [1, tfq([["Magnet boleh menarik paku besi.", true], ["Magnet boleh menarik pemadam getah.", false], ["Magnet dapat menarik objek besi melalui kertas nipis.", true]])],
);
const APUNG = [["🪵", "Kayu", "Terapung"], ["🍂", "Daun kering", "Terapung"], ["🏐", "Bola plastik", "Terapung"], ["🦆", "Itik getah mainan", "Terapung"], ["🧴", "Botol plastik kosong", "Terapung"], ["🍾", "Gabus botol", "Terapung"],
  ["🪨", "Batu", "Tenggelam"], ["🔩", "Skru besi", "Tenggelam"], ["🪙", "Duit syiling", "Tenggelam"], ["🔑", "Kunci", "Tenggelam"], ["🥄", "Sudu besi", "Tenggelam"], ["🔵", "Guli kaca", "Tenggelam"]];
const bahan1 = blend(
  [3, sortInto(APUNG, (n) => `Apakah yang berlaku kepada <b>${n.toLowerCase()}</b> apabila dimasukkan ke dalam air?`, ["Terapung", "Tenggelam"])],
  [1, ask([["Pelampung keselamatan dibuat daripada bahan yang…", "terapung", ["tenggelam", "berat", "menyerap air"], "🛟"], ["Bot boleh terapung kerana bentuknya yang…", "lebar dan berongga", ["kecil dan padat", "tajam", "bulat dan berat"], "⛵"]])],
  [1, tfq([["Batu akan tenggelam di dalam air.", true], ["Kayu akan tenggelam di dalam air.", false], ["Daun kering terapung di atas air.", true]])],
);
const BILIK = [["Kita boleh makan dan minum di dalam bilik sains.", false], ["Kita perlu mendengar arahan guru sebelum menjalankan eksperimen.", true], ["Kita boleh berlari di dalam bilik sains.", false],
  ["Basuh tangan selepas menjalankan eksperimen.", true], ["Laporkan kepada guru jika ada alat yang pecah.", true], ["Kita boleh merasa bahan kimia untuk mengenalinya.", false],
  ["Simpan semula alatan di tempat asalnya.", true], ["Kita boleh bermain dengan api di dalam bilik sains.", false], ["Pakai kasut semasa berada di dalam bilik sains.", true], ["Bahan sisa dibuang ke dalam sinki sesuka hati.", false]];
const KEMAHIRAN = [["Menggunakan deria untuk mengumpul maklumat tentang sesuatu objek dipanggil…", "memerhati", ["mengelas", "mengukur", "meramal"], "🔍"],
  ["Mengumpulkan objek mengikut ciri yang sama dipanggil…", "mengelas", ["memerhati", "berkomunikasi", "meramal"], "🗂️"], ["Membuat jangkaan tentang sesuatu yang akan berlaku dipanggil…", "meramal", ["mengukur", "mengelas", "memerhati"], "🔮"],
  ["Menggunakan pembaris untuk mengetahui panjang meja dipanggil…", "mengukur", ["meramal", "mengelas", "memerhati"], "📏"]];
const keselamatan = blend([3, tfq(BILIK)], [2, ask(KEMAHIRAN)]);

// ================================================================ TAHUN 2
const GIGI = [["Gigi yang digunakan untuk <b>memotong</b> makanan ialah gigi…", "kacip", ["taring", "geraham", "susu"]], ["Gigi yang digunakan untuk <b>mengoyak</b> makanan ialah gigi…", "taring", ["kacip", "geraham", "bongsu"]],
  ["Gigi yang digunakan untuk <b>mengunyah</b> makanan ialah gigi…", "geraham", ["kacip", "taring", "hadapan"]], ["Kanak-kanak mempunyai berapa batang gigi susu?", "20", ["32", "10", "28"]],
  ["Orang dewasa mempunyai berapa batang gigi kekal?", "32", ["20", "24", "40"]], ["Kita patut menggosok gigi sekurang-kurangnya…", "dua kali sehari", ["sekali seminggu", "sekali sebulan", "bila gigi sakit sahaja"], "🪥"],
  ["Makanan yang boleh merosakkan gigi ialah…", "gula-gula", ["sayur", "susu", "air kosong"], "🍬"], ["Kita perlu berjumpa doktor gigi sekurang-kurangnya…", "enam bulan sekali", ["sepuluh tahun sekali", "apabila gigi tercabut", "setiap hari"], "🦷"]];
const gigi = blend([3, ask(GIGI)], [1, tfq([["Gigi susu akan diganti dengan gigi kekal.", true], ["Kita tidak perlu menggosok gigi sebelum tidur.", false], ["Benang gigi membantu membersihkan celah gigi.", true]])]);
const BIAK = [["🐔", "Ayam", "Bertelur"], ["🐢", "Penyu", "Bertelur"], ["🐸", "Katak", "Bertelur"], ["🐊", "Buaya", "Bertelur"], ["🦆", "Itik", "Bertelur"], ["🐠", "Ikan emas", "Bertelur"],
  ["🐱", "Kucing", "Beranak"], ["🐄", "Lembu", "Beranak"], ["🐘", "Gajah", "Beranak"], ["🐋", "Ikan paus", "Beranak"], ["🦇", "Kelawar", "Beranak"], ["🐰", "Arnab", "Beranak"], ["🐐", "Kambing", "Beranak"]];
const pembiakan = blend(
  [3, sortInto(BIAK, (n) => `Bagaimanakah <b>${n.toLowerCase()}</b> membiak?`, ["Bertelur", "Beranak"])],
  [1, () => order("Susun kitar hidup katak.", ["telur", "berudu", "katak muda", "katak dewasa"])],
  [1, () => order("Susun kitar hidup rama-rama.", ["telur", "larva (ulat)", "pupa", "rama-rama"])],
);
const PERLU = [["Tumbuhan memerlukan air, udara dan cahaya matahari untuk hidup.", true], ["Tumbuhan boleh hidup dengan baik di dalam almari gelap.", false], ["Daun tumbuhan akan menjadi kuning jika tidak mendapat cahaya.", true],
  ["Tumbuhan tidak memerlukan air.", false], ["Pokok yang tidak disiram akan layu.", true], ["Tumbuhan tumbuh ke arah cahaya.", true]];
const keperluanTumbuhan = blend([2, tfq(PERLU)], [2, ask([["Apakah yang berlaku kepada pokok yang tidak disiram selama seminggu?", "layu", ["berbunga", "membesar", "berbuah"], "🥀"],
  ["Tumbuhan memerlukan ___ untuk membuat makanan.", "cahaya matahari", ["kegelapan", "garam", "gula"], "☀️"], ["Bahagian tumbuhan yang menyerap air ialah…", "akar", ["daun", "bunga", "buah"], "🌱"],
  ["Anak benih yang diletakkan di dalam kotak gelap akan tumbuh…", "pucat dan lemah", ["hijau dan sihat", "berbuah", "lebih cepat berbunga"], "📦"]])]);
const SUMBER = [["☀️", "Matahari", "Ya"], ["💡", "Lampu", "Ya"], ["🕯️", "Lilin", "Ya"], ["🔥", "Api", "Ya"], ["🔦", "Lampu suluh", "Ya"], ["🌙", "Bulan", "Tidak"], ["🪞", "Cermin", "Tidak"], ["🪨", "Batu", "Tidak"], ["📖", "Buku", "Tidak"]];
const LUT = [["🪟", "Kaca jernih", "lut sinar"], ["🧊", "Ketulan ais jernih", "lut sinar"], ["🪵", "Kayu", "legap"], ["📚", "Buku", "legap"], ["🧱", "Batu bata", "legap"], ["🧻", "Kertas tisu", "lut cahaya"], ["🌫️", "Kaca kabur", "lut cahaya"]];
const cahaya1 = blend(
  [2, sortInto(SUMBER, (n) => `Adakah <b>${n.toLowerCase()}</b> satu sumber cahaya?`, ["Ya", "Tidak"])],
  [2, () => { const [e, n, t] = pick(LUT); return mcq(`${n} ialah objek…`, t, ["lut sinar", "lut cahaya", "legap"], { visual: pic(e), n: 3 }); }],
  [2, ask([["Bayang-bayang terbentuk apabila cahaya dihalang oleh objek…", "legap", ["lut sinar", "berkilat", "berwarna"], "👤"], ["Bayang-bayang menjadi lebih besar apabila objek digerakkan…", "lebih dekat dengan sumber cahaya", ["lebih jauh dari sumber cahaya", "ke dalam air", "ke dalam gelap"], "🔦"],
    ["Bulan kelihatan bercahaya kerana ia…", "memantulkan cahaya Matahari", ["mengeluarkan cahayanya sendiri", "terbakar", "dekat dengan Bumi"], "🌕"]])],
);
const SERAP = [["🧽", "Span", "Menyerap"], ["☁️", "Kapas", "Menyerap"], ["🧻", "Kertas tisu", "Menyerap"], ["🧣", "Kain tuala", "Menyerap"], ["📰", "Surat khabar", "Menyerap"],
  ["🛍️", "Beg plastik", "Tidak menyerap"], ["🥛", "Gelas kaca", "Tidak menyerap"], ["🎈", "Belon getah", "Tidak menyerap"], ["🥫", "Tin aluminium", "Tidak menyerap"], ["☂️", "Kain payung", "Tidak menyerap"]];
const serapAir = blend(
  [3, sortInto(SERAP, (n) => `Adakah <b>${n.toLowerCase()}</b> menyerap air?`, ["Menyerap", "Tidak menyerap"])],
  [1, ask([["Baju hujan dibuat daripada bahan yang…", "kalis air", ["menyerap air", "mudah koyak", "lut sinar"], "🧥"], ["Lampin bayi dibuat daripada bahan yang…", "menyerap air", ["kalis air", "keras", "berkilat"], "👶"],
    ["Bahan yang paling sesuai untuk mengelap air yang tumpah ialah…", "span", ["plastik", "kaca", "kertas aluminium"], "💧"]])],
);
const HIDUP = [["🐱", "Kucing", "Benda hidup"], ["🌳", "Pokok", "Benda hidup"], ["🐟", "Ikan", "Benda hidup"], ["🍄", "Cendawan", "Benda hidup"], ["🐜", "Semut", "Benda hidup"], ["👧", "Manusia", "Benda hidup"],
  ["🪨", "Batu", "Benda bukan hidup"], ["🪑", "Kerusi", "Benda bukan hidup"], ["🚗", "Kereta", "Benda bukan hidup"], ["⚽", "Bola", "Benda bukan hidup"], ["🤖", "Robot mainan", "Benda bukan hidup"], ["☁️", "Awan", "Benda bukan hidup"]];
const pengelasan = blend(
  [3, sortInto(HIDUP, (n) => `${n} ialah…`, ["Benda hidup", "Benda bukan hidup"])],
  [2, ask([["Antara berikut, yang manakah ciri benda hidup?", "membesar", ["berkilat", "berwarna", "keras"]], ["Benda hidup memerlukan ___ untuk terus hidup.", "makanan dan air", ["bateri", "elektrik", "minyak petrol"]],
    ["Antara berikut, yang manakah BUKAN ciri benda hidup?", "dibuat oleh manusia", ["bernafas", "membiak", "bergerak"]], ["Anak kucing akan ___ menjadi kucing dewasa.", "membesar", ["berkarat", "mencair", "pecah"], "🐈"]])],
);

// ================================================================ TAHUN 3
const RANGKA = [["Tengkorak melindungi…", "otak", ["jantung", "perut", "kaki"], "💀"], ["Tulang rusuk melindungi jantung dan…", "peparu", ["otak", "mata", "tangan"], "🫁"],
  ["Tulang yang menyokong badan supaya dapat berdiri tegak ialah tulang…", "belakang", ["jari", "telinga", "hidung"]], ["Tulang yang paling panjang dalam badan manusia ialah tulang…", "paha", ["jari", "rusuk", "lengan"], "🦵"],
  ["Orang dewasa mempunyai lebih kurang ___ batang tulang.", "206", ["100", "32", "500"]], ["Tempat dua tulang bertemu dipanggil…", "sendi", ["otot", "kulit", "urat"]],
  ["Rangka membolehkan kita…", "bergerak", ["melihat", "bernafas", "berfikir"], "🏃"], ["Haiwan yang TIDAK mempunyai rangka dalam ialah…", "cacing tanah", ["kucing", "ikan", "ayam"], "🪱"]];
const rangka = blend([3, ask(RANGKA)], [1, tfq([["Rangka memberi bentuk kepada badan kita.", true], ["Tengkorak melindungi jantung.", false], ["Bayi tidak mempunyai tulang.", false], ["Kalsium daripada susu membantu menguatkan tulang.", true]])]);
const MAKANAN = [["🍚", "Nasi", "karbohidrat"], ["🍞", "Roti", "karbohidrat"], ["🍜", "Mi", "karbohidrat"], ["🍠", "Ubi keledek", "karbohidrat"], ["🐟", "Ikan", "protein"], ["🥚", "Telur", "protein"], ["🍗", "Ayam", "protein"],
  ["🫘", "Kacang", "protein"], ["🧈", "Mentega", "lemak"], ["🫒", "Minyak masak", "lemak"], ["🍊", "Oren", "vitamin"], ["🥦", "Brokoli", "vitamin"], ["🥕", "Lobak merah", "vitamin"]];
const FUNGSI = [["karbohidrat", "memberi tenaga"], ["protein", "membantu pertumbuhan dan membaiki sel"], ["lemak", "menyimpan tenaga dan memanaskan badan"], ["vitamin", "menjaga kesihatan dan mencegah penyakit"], ["serat", "mencegah sembelit"]];
const kelasMakanan = blend(
  [3, () => { const [e, n, k] = pick(MAKANAN); return mcq(`${n} kaya dengan kelas makanan…`, k, ["karbohidrat", "protein", "lemak", "vitamin"], { visual: pic(e) }); }],
  [2, () => { const [k, f] = pick(FUNGSI); return mcq(`Kelas makanan yang berfungsi <b>${f}</b> ialah…`, k, FUNGSI.map((x) => x[0])); }],
  [1, ask([["Dalam piramid makanan, makanan yang perlu dimakan <b>paling banyak</b> ialah…", "karbohidrat", ["lemak", "gula", "garam"], "🔺"], ["Gula, garam dan lemak perlu dimakan…", "sedikit sahaja", ["paling banyak", "setiap jam", "tanpa had"], "🔺"],
    ["Gizi seimbang bermaksud makanan yang mengandungi…", "semua kelas makanan dalam kadar yang betul", ["karbohidrat sahaja", "makanan manis sahaja", "daging sahaja"], "🍱"]])],
);
const DIET = [["🐄", "Lembu", "herbivor"], ["🐐", "Kambing", "herbivor"], ["🐰", "Arnab", "herbivor"], ["🦒", "Zirafah", "herbivor"], ["🐘", "Gajah", "herbivor"], ["🐅", "Harimau", "karnivor"], ["🦁", "Singa", "karnivor"],
  ["🦅", "Helang", "karnivor"], ["🐊", "Buaya", "karnivor"], ["🐍", "Ular", "karnivor"], ["🐔", "Ayam", "omnivor"], ["🐻", "Beruang", "omnivor"], ["🐀", "Tikus", "omnivor"], ["🐒", "Monyet", "omnivor"]];
const makananHaiwan = blend(
  [3, sortInto(DIET, (n) => `${n} ialah haiwan…`, ["herbivor", "karnivor", "omnivor"])],
  [1, ask([["Haiwan yang makan <b>tumbuhan sahaja</b> dipanggil…", "herbivor", ["karnivor", "omnivor", "pemangsa"]], ["Haiwan yang makan <b>daging sahaja</b> dipanggil…", "karnivor", ["herbivor", "omnivor", "pengeluar"]],
    ["Haiwan yang makan <b>tumbuhan dan daging</b> dipanggil…", "omnivor", ["herbivor", "karnivor", "pengeluar"]], ["Karnivor mempunyai gigi taring yang…", "tajam untuk mengoyak daging", ["leper untuk mengisar rumput", "tumpul", "lembut"], "🦷"]])],
);
const ASID = [["🍋", "Jus limau", "asid"], ["🍶", "Cuka", "asid"], ["🍊", "Jus oren", "asid"], ["🧼", "Air sabun", "alkali"], ["🪥", "Ubat gigi", "alkali"], ["🧺", "Larutan serbuk pencuci", "alkali"],
  ["💧", "Air suling", "neutral"], ["🧂", "Larutan garam", "neutral"], ["🍬", "Larutan gula", "neutral"]];
const asidAlkali = blend(
  [3, sortInto(ASID, (n) => `${n} bersifat…`, ["asid", "alkali", "neutral"])],
  [2, ask([["Bahan <b>asid</b> menukarkan kertas litmus biru kepada…", "merah", ["biru", "hijau", "kuning"], "🧪"], ["Bahan <b>alkali</b> menukarkan kertas litmus merah kepada…", "biru", ["merah", "ungu", "hitam"], "🧪"],
    ["Bahan neutral ___ warna kertas litmus.", "tidak mengubah", ["mengubah", "membakar", "memadam"], "🧪"], ["Bahan asid biasanya berasa…", "masam", ["manis", "pahit", "masin"], "🍋"],
    ["Bahan alkali biasanya berasa pahit dan terasa…", "licin", ["kasar", "panas", "melekit"], "🧼"]])],
);
const ALAT = [["📏", "Pembaris", "panjang"], ["⚖️", "Penimbang", "jisim"], ["🌡️", "Termometer", "suhu"], ["⏱️", "Jam randik", "masa"], ["🧪", "Silinder penyukat", "isi padu cecair"], ["🎗️", "Pita pengukur", "ukur lilit"]];
const UNIT = [["panjang", "sentimeter (cm)"], ["jisim", "kilogram (kg)"], ["suhu", "darjah Celsius (°C)"], ["masa", "saat (s)"], ["isi padu cecair", "mililiter (ml)"]];
const ukuran = blend(
  [3, () => { const [e, a, q] = pick(ALAT); return mcq(`Alat yang sesuai untuk mengukur <b>${q}</b> ialah…`, a, ALAT.map((x) => x[1]), { visual: pic(e) }); }],
  [2, () => { const [q, u] = pick(UNIT); return mcq(`Unit yang sesuai bagi <b>${q}</b> ialah…`, u, UNIT.map((x) => x[1])); }],
  [1, pairs(ALAT.map(([e, a, q]) => [`${e} ${a}`, q]), "Padankan alat dengan kuantiti yang diukur.")],
);
const TANAH = [["Tanah yang paling cepat mengalirkan air ialah tanah…", "pasir", ["liat", "kebun", "gambut"], "🏖️"], ["Tanah yang paling perlahan mengalirkan air ialah tanah…", "liat", ["pasir", "kebun", "berbatu"], "🧱"],
  ["Tanah yang mengandungi paling banyak humus ialah tanah…", "kebun", ["pasir", "liat", "berbatu"], "🌱"], ["Humus terhasil daripada…", "daun dan haiwan yang reput", ["batu yang pecah", "air hujan", "plastik"], "🍂"],
  ["Tanah yang paling sesuai untuk bercucuk tanam ialah tanah…", "kebun", ["pasir", "liat", "berbatu"], "🥬"], ["Gelembung udara keluar apabila tanah dimasukkan ke dalam air. Ini menunjukkan tanah mengandungi…", "udara", ["gula", "minyak", "garam"], "🫧"],
  ["Tanah liat sesuai untuk membuat…", "tembikar", ["kaca", "kertas", "kain"], "🏺"], ["Komponen tanah ialah air, udara, humus dan…", "zarah tanah seperti pasir dan kelodak", ["plastik", "gula", "kaca"]]];
const tanah = blend([3, ask(TANAH)], [1, tfq([["Cacing tanah membantu menggemburkan tanah.", true], ["Tanah pasir menakung air paling lama.", false], ["Tanah mengandungi air dan udara.", true]])]);

// ================================================================ TAHUN 4
const NAFAS = [["Organ utama pernafasan manusia ialah…", "peparu", ["jantung", "ginjal", "perut"], "🫁"], ["Semasa menarik nafas, kita menyedut gas…", "oksigen", ["karbon dioksida", "nitrogen sahaja", "wap air"]],
  ["Semasa menghembus nafas, kita mengeluarkan gas…", "karbon dioksida", ["oksigen", "hidrogen", "helium"]], ["Udara masuk ke dalam badan melalui…", "hidung", ["telinga", "mata", "kulit"], "👃"],
  ["Kadar pernafasan kita ___ selepas bersenam.", "bertambah", ["berkurang", "berhenti", "tidak berubah"], "🏃"], ["Kulit menyingkirkan bahan kumuh dalam bentuk…", "peluh", ["air kencing", "karbon dioksida", "air liur"], "💦"],
  ["Ginjal menyingkirkan bahan kumuh dalam bentuk…", "air kencing", ["peluh", "air mata", "karbon dioksida"]], ["Peparu menyingkirkan karbon dioksida dan…", "wap air", ["peluh", "air kencing", "darah"]]];
const nafas = blend([3, ask(NAFAS)], [1, () => order("Susun laluan udara semasa menarik nafas.", ["hidung", "trakea", "peparu"])], [1, pairs([["kulit", "peluh"], ["ginjal", "air kencing"], ["peparu", "karbon dioksida"]], "Padankan organ perkumuhan dengan bahan kumuhnya.", 3)]);
const LINDUNG_H = [["🐢", "Kura-kura", "menyorok di dalam cangkerang keras"], ["🦔", "Landak", "menegakkan duri yang tajam"], ["🦑", "Sotong", "memancutkan dakwat hitam"], ["🦎", "Sesumpah", "menukar warna kulit"],
  ["🐡", "Ikan buntal", "mengembungkan badan"], ["🐛", "Ulat bulu", "mempunyai bulu yang menyebabkan gatal"], ["🐝", "Lebah", "menyengat"], ["🐻", "Beruang kutub", "mempunyai bulu tebal untuk cuaca sejuk"]];
const perlindunganHaiwan = blend(
  [3, () => { const [e, n, c] = pick(LINDUNG_H); return mcq(`Bagaimanakah <b>${n.toLowerCase()}</b> melindungi dirinya?`, c, LINDUNG_H.map((x) => x[2]), { visual: pic(e) }); }],
  [1, pairs(LINDUNG_H.map(([e, n, c]) => [`${e} ${n}`, c]), "Padankan haiwan dengan cara ia melindungi diri.", 3)],
  [1, ask([["Mengapakah haiwan perlu melindungi diri?", "untuk mengelakkan diri daripada musuh", ["untuk mencari pasangan sahaja", "untuk tidur", "untuk bermain"]], ["Burung berhijrah ke tempat lain semasa musim…", "sejuk", ["panas", "buah", "hujan rintik"], "🕊️"]])],
);
const LINDUNG_T = [["🌵", "Kaktus", "daun berbentuk duri"], ["🌹", "Pokok mawar", "batang berduri"], ["🍈", "Durian", "kulit buah berduri tajam"], ["🌿", "Semalu", "daun menguncup apabila disentuh"], ["🍃", "Keladi", "menyebabkan kegatalan"], ["🌳", "Pokok getah", "mengeluarkan susu getah"]];
const SEBAR = [["🌾", "Lalang", "angin"], ["☁️", "Kekabu", "angin"], ["🍁", "Angsana", "angin"], ["🥥", "Kelapa", "air"], ["🌴", "Nipah", "air"], ["🔴", "Rambutan", "haiwan"], ["🍈", "Jambu batu", "haiwan"], ["🫛", "Kacang bendi", "letupan"], ["🌳", "Getah", "letupan"]];
const tumbuhan4 = blend(
  [2, () => { const [e, n, c] = pick(LINDUNG_T); return mcq(`Bagaimanakah <b>${n.toLowerCase()}</b> melindungi dirinya?`, c, LINDUNG_T.map((x) => x[2]), { visual: pic(e) }); }],
  [3, () => { const [e, n, c] = pick(SEBAR); return mcq(`Biji benih <b>${n.toLowerCase()}</b> disebarkan oleh…`, c, ["angin", "air", "haiwan", "letupan"], { visual: pic(e) }); }],
  [1, ask([["Mengapakah biji benih perlu disebarkan?", "supaya anak pokok tidak bersaing untuk mendapatkan keperluan", ["supaya pokok cepat mati", "supaya buah manis", "supaya daun gugur"]], ["Biji benih yang disebarkan oleh angin biasanya…", "ringan dan bersayap", ["berat dan keras", "berduri", "berisi air"]]])],
);
const BAHAN4 = [["🔩", "Paku besi", "konduktor elektrik"], ["🪙", "Duit syiling", "konduktor elektrik"], ["🥄", "Sudu keluli", "konduktor elektrik"], ["🔌", "Wayar kuprum", "konduktor elektrik"],
  ["🪵", "Pembaris kayu", "penebat elektrik"], ["🧤", "Sarung tangan getah", "penebat elektrik"], ["🥤", "Straw plastik", "penebat elektrik"], ["🥛", "Gelas kaca", "penebat elektrik"]];
const sifatBahan = blend(
  [3, sortInto(BAHAN4, (n) => `${n} ialah…`, ["konduktor elektrik", "penebat elektrik"])],
  [2, ask([["Pemegang periuk dibuat daripada kayu atau plastik kerana bahan itu…", "penebat haba", ["konduktor haba", "lut sinar", "kalis air"], "🍳"], ["Periuk dibuat daripada logam kerana logam ialah…", "konduktor haba yang baik", ["penebat haba", "bahan lut sinar", "bahan menyerap air"], "🍲"],
    ["Tingkap dibuat daripada kaca kerana kaca…", "lut sinar", ["legap", "menyerap air", "lembut"], "🪟"], ["Kasut but hujan dibuat daripada getah kerana getah…", "kalis air", ["menyerap air", "lut sinar", "keras"], "🥾"],
    ["Wayar elektrik dibalut dengan plastik untuk…", "mengelakkan kejutan elektrik", ["menjadikannya cantik", "menambah berat", "menyerap air"], "🔌"]])],
);
const PLANET = ["Utarid", "Zuhrah", "Bumi", "Marikh", "Musytari", "Zuhal", "Uranus", "Neptun"];
const SURIA = [["Planet yang paling hampir dengan Matahari ialah…", "Utarid", PLANET], ["Planet yang paling besar ialah…", "Musytari", PLANET], ["Planet yang paling panas ialah…", "Zuhrah", PLANET],
  ["Planet yang paling jauh dari Matahari ialah…", "Neptun", PLANET], ["Planet yang dikenali sebagai planet merah ialah…", "Marikh", PLANET], ["Planet yang terkenal dengan gelangnya yang cantik ialah…", "Zuhal", PLANET],
  ["Bumi ialah planet yang ke-___ dari Matahari.", "3", ["1", "2", "4"]], ["Bilangan planet dalam Sistem Suria ialah…", "8", ["7", "9", "10"]], ["Matahari ialah sebuah…", "bintang", ["planet", "bulan", "komet"], "☀️"],
  ["Satelit semula jadi Bumi ialah…", "Bulan", ["Matahari", "Marikh", "Zuhal"], "🌕"]];
const sistemSuria = blend([4, ask(SURIA)], [1, () => { const i = rnd(0, 4); return order("Susun planet mengikut kedudukan dari Matahari.", PLANET.slice(i, i + 4)); }]);
const KUKUH = [["Objek lebih stabil jika tapaknya…", "lebar", ["sempit", "tinggi", "bulat"]], ["Objek lebih stabil jika ketinggiannya…", "rendah", ["tinggi", "senget", "berat di atas"]],
  ["Bentuk yang menjadikan struktur jambatan lebih kuat ialah…", "segi tiga", ["bulatan", "segi empat tepat", "bintang"], "🌉"], ["Lampu meja mempunyai tapak yang berat supaya…", "lebih stabil", ["lebih cantik", "mudah jatuh", "lebih terang"], "💡"],
  ["Kerusi yang mempunyai kaki yang lebih banyak adalah lebih…", "stabil", ["ringan", "lemah", "tinggi"], "🪑"], ["Bas dua tingkat membawa penumpang yang lebih ramai di tingkat bawah supaya…", "lebih stabil", ["lebih laju", "lebih senyap", "lebih ringan"], "🚌"]];
const kekuatan = blend([3, ask(KUKUH)], [1, tfq([["Menara yang tinggi dengan tapak yang sempit mudah tumbang.", true], ["Struktur segi tiga lebih lemah daripada segi empat.", false], ["Kon yang diletakkan dengan tapak di bawah lebih stabil.", true]])]);

// ================================================================ TAHUN 5
const RANTAI = [["padi", "tikus", "ular", "helang"], ["rumput", "belalang", "katak", "ular"], ["daun", "ulat", "burung", "kucing"], ["rumput", "rusa", "harimau"], ["alga", "ikan kecil", "ikan besar", "manusia"], ["rumput", "kambing", "harimau"]];
const rantaiMakanan = blend(
  [2, () => order("Susun rantai makanan ini dengan betul.", pick(RANTAI))],
  [2, () => { const r = pick(RANTAI); return mcq(`Dalam rantai makanan: ${r.join(" → ")}, siapakah <b>pengeluar</b>?`, r[0], r.slice(1)); }],
  [1, () => { const r = pick(RANTAI.filter((x) => x.length >= 4)); return mcq(`Dalam rantai makanan: ${r.join(" → ")}, apakah yang berlaku kepada bilangan <b>${r[1]}</b> jika semua <b>${r[2]}</b> mati?`, "bertambah", ["berkurang", "tidak berubah", "semuanya mati"]); }],
  [1, ask([["Tumbuhan hijau dikenali sebagai pengeluar kerana…", "boleh membuat makanan sendiri", ["boleh bergerak", "makan haiwan", "hidup di dalam air"], "🌿"], ["Beberapa rantai makanan yang berhubung membentuk…", "siratan makanan", ["rantai panjang", "kitar air", "piramid nombor"], "🕸️"]])],
);
const ELEK = [["Sumber tenaga elektrik bagi lampu suluh ialah…", "sel kering", ["suis", "mentol", "wayar"], "🔦"], ["Komponen yang digunakan untuk menghidupkan dan mematikan litar ialah…", "suis", ["mentol", "sel kering", "wayar"]],
  ["Mentol akan menyala apabila litar…", "lengkap", ["terputus", "terbuka", "tiada sel kering"], "💡"], ["Dalam litar <b>bersiri</b>, jika satu mentol rosak, mentol lain akan…", "padam", ["menyala lebih terang", "tidak terjejas", "berkelip"]],
  ["Dalam litar <b>selari</b>, jika satu mentol rosak, mentol lain akan…", "terus menyala", ["padam", "meletup", "malap"]], ["Menambah bilangan sel kering dalam litar bersiri menjadikan mentol…", "lebih terang", ["lebih malap", "padam", "tidak berubah"]],
  ["Tenaga elektrik boleh dijana daripada…", "tenaga suria", ["batu", "kayu kering", "pasir"], "☀️"], ["Mengapakah kita tidak boleh menyentuh suis dengan tangan basah?", "boleh menyebabkan kejutan elektrik", ["suis akan berkarat", "lampu akan malap", "suis menjadi kotor"], "⚠️"]];
const elektrik = blend([4, ask(ELEK)], [1, tfq([["Air ialah penebat elektrik yang baik.", false], ["Jangan memasukkan terlalu banyak plag ke dalam satu soket.", true], ["Litar yang terputus tidak dapat mengalirkan arus elektrik.", true]])]);
const HABA = [["Alat untuk mengukur suhu ialah…", "termometer", ["pembaris", "penimbang", "jam randik"], "🌡️"], ["Unit suhu ialah…", "darjah Celsius (°C)", ["kilogram (kg)", "meter (m)", "liter (l)"]],
  ["Air tulen mendidih pada suhu…", "100 °C", ["0 °C", "50 °C", "37 °C"], "♨️"], ["Ais tulen melebur pada suhu…", "0 °C", ["100 °C", "10 °C", "-50 °C"], "🧊"],
  ["Apabila objek menerima haba, suhunya…", "meningkat", ["menurun", "tidak berubah", "menjadi sifar"]], ["Apabila dipanaskan, kebanyakan bahan akan…", "mengembang", ["menguncup", "hilang", "menjadi berat"]],
  ["Rel kereta api mempunyai ruang kecil di sambungannya kerana besi akan ___ pada hari panas.", "mengembang", ["menguncup", "berkarat", "melebur"], "🛤️"], ["Suhu badan manusia yang normal ialah lebih kurang…", "37 °C", ["100 °C", "20 °C", "0 °C"], "🤒"]];
const haba = blend([4, ask(HABA)], [1, tfq([["Haba mengalir dari objek panas ke objek sejuk.", true], ["Air panas menjadi lebih panas jika dibiarkan di atas meja.", false]])]);
const JIRIM = [["🧊", "Ais melebur menjadi air", "peleburan"], ["❄️", "Air menjadi ais di dalam peti sejuk beku", "pembekuan"], ["👕", "Pakaian basah menjadi kering di bawah matahari", "penyejatan"],
  ["🥛", "Titisan air terbentuk di luar gelas berisi air sejuk", "kondensasi"], ["⚪", "Ubat gegat mengecil di dalam almari", "pemejalwapan"], ["🍲", "Air di dalam periuk mendidih", "pendidihan"],
  ["🕯️", "Lilin cair apabila dinyalakan", "peleburan"], ["🪞", "Cermin bilik air berkabus selepas mandi air panas", "kondensasi"], ["🫧", "Lopak air hilang selepas hari panas", "penyejatan"]];
const keadaanJirim = blend(
  [3, () => { const [e, s, p] = pick(JIRIM); return mcq(`<b>${s}</b>. Proses ini dipanggil…`, p, ["peleburan", "pembekuan", "penyejatan", "kondensasi", "pemejalwapan", "pendidihan"], { visual: pic(e) }); }],
  [2, ask([["Jirim yang mempunyai bentuk dan isi padu yang tetap ialah…", "pepejal", ["cecair", "gas", "wap"], "🧱"], ["Jirim yang mengikut bentuk bekasnya tetapi isi padunya tetap ialah…", "cecair", ["pepejal", "gas", "batu"], "💧"],
    ["Jirim yang memenuhi seluruh ruang bekasnya ialah…", "gas", ["pepejal", "cecair", "ais"], "🎈"], ["Semua jirim mempunyai jisim dan…", "memenuhi ruang", ["berwarna", "berbau", "bergerak"]]])],
);
const BULAN = [["Bumi berputar pada paksinya dan menyebabkan berlakunya…", "siang dan malam", ["empat musim", "gerhana", "pasang surut sahaja"], "🌍"], ["Bumi mengambil masa ___ untuk berputar sekali pada paksinya.", "24 jam", ["365 hari", "30 hari", "12 jam"]],
  ["Bumi mengambil masa lebih kurang ___ untuk beredar mengelilingi Matahari.", "365¼ hari", ["24 jam", "29½ hari", "7 hari"], "☀️"], ["Matahari terbit di sebelah…", "timur", ["barat", "utara", "selatan"], "🌅"],
  ["Matahari terbenam di sebelah…", "barat", ["timur", "utara", "selatan"], "🌇"], ["Bayang-bayang kita paling pendek pada waktu…", "tengah hari", ["pagi", "petang", "malam"], "👤"],
  ["Fasa bulan berlaku kerana…", "Bulan beredar mengelilingi Bumi", ["Bulan berubah saiz", "awan menutup Bulan", "Matahari berputar"], "🌓"], ["Bulan mengambil masa lebih kurang ___ untuk melengkapkan satu kitaran fasa.", "29½ hari", ["7 hari", "365 hari", "24 jam"], "🌕"]];
const bumiBulan = blend([4, ask(BULAN)], [1, () => order("Susun fasa bulan bermula dengan anak bulan.", ["anak bulan", "sabit", "separa", "purnama"])]);
const CAHAYA5 = [["Cahaya bergerak dalam garis…", "lurus", ["bengkok", "bulat", "zig-zag"], "🔦"], ["Kita dapat melihat imej di dalam cermin kerana cahaya…", "dipantulkan", ["diserap", "dibiaskan sahaja", "dihentikan"], "🪞"],
  ["Straw kelihatan bengkok di dalam gelas berisi air kerana cahaya…", "dibiaskan", ["dipantulkan", "diserap", "bergerak lurus"], "🥤"], ["Alat yang menggunakan dua cermin untuk melihat dari atas halangan ialah…", "periskop", ["teleskop", "mikroskop", "kanta pembesar"], "🔭"],
  ["Pelangi terbentuk apabila cahaya matahari melalui…", "titisan air", ["awan gelap", "pokok", "batu"], "🌈"], ["Cermin pandang belakang kereta menggunakan konsep…", "pantulan cahaya", ["pembiasan cahaya", "penyerapan cahaya", "penyejatan"], "🚗"],
  ["Objek di dalam kolam kelihatan lebih ___ daripada kedudukan sebenar.", "cetek", ["dalam", "besar", "gelap"], "🏊"], ["Warna-warna pelangi ada sebanyak…", "7", ["3", "5", "10"], "🌈"]];
const cahaya5 = blend([4, ask(CAHAYA5)], [1, tfq([["Cahaya boleh menembusi objek legap.", false], ["Permukaan yang licin dan berkilat memantulkan cahaya dengan baik.", true]])]);

// ================================================================ TAHUN 6
const MIKRO = [["Mikroorganisma ialah hidupan yang sangat kecil dan hanya boleh dilihat dengan…", "mikroskop", ["mata kasar", "teleskop", "cermin"], "🔬"], ["Yis digunakan untuk membuat…", "roti", ["garam", "gula", "kicap sahaja"], "🍞"],
  ["Bakteria digunakan untuk membuat…", "yogurt", ["air suling", "minyak masak", "garam"], "🥛"], ["Penisilin ialah antibiotik yang dihasilkan daripada…", "kulat", ["virus", "batu", "garam"], "💊"],
  ["Penyakit selesema disebabkan oleh…", "virus", ["kulat", "alga", "yis"], "🤧"], ["Penyakit malaria disebarkan oleh…", "nyamuk", ["lalat rumah", "kucing", "burung"], "🦟"],
  ["Roti yang dibiarkan lama akan berkulat kerana tindakan…", "mikroorganisma", ["cahaya", "garam", "gula"], "🍞"], ["Cara pengawetan susu dengan memanaskannya kemudian menyejukkannya dengan cepat dipanggil…", "pempasteuran", ["pengasinan", "pengeringan", "penjerukan"], "🥛"],
  ["Ikan masin diawet dengan cara…", "pengasinan", ["pengetinan", "pempasteuran", "penyejukbekuan"], "🐟"], ["Mikroorganisma memerlukan air, udara dan ___ untuk hidup.", "makanan", ["plastik", "besi", "kaca"]]];
const mikroorganisma = blend([4, ask(MIKRO)], [1, tfq([["Semua mikroorganisma berbahaya.", false], ["Mencuci tangan dengan sabun membantu mencegah jangkitan kuman.", true], ["Virus boleh dilihat dengan mata kasar.", false]])]);
const INTERAKSI = [["Anak pokok yang ditanam terlalu rapat akan bersaing untuk mendapatkan…", "cahaya, air dan nutrien", ["batu", "plastik", "bunyi"], "🌱"], ["Ayam-ayam berebut jagung yang ditabur. Ini ialah contoh…", "persaingan", ["perlindungan", "pembiakan", "penyebaran"], "🐔"],
  ["Haiwan bersaing untuk mendapatkan makanan, air, ruang dan…", "pasangan", ["cahaya bulan", "batu", "bunyi"]], ["Haiwan yang memburu haiwan lain untuk makanan dipanggil…", "pemangsa", ["mangsa", "pengeluar", "pengurai"], "🐅"],
  ["Rusa yang diburu oleh harimau dipanggil…", "mangsa", ["pemangsa", "pengeluar", "parasit"], "🦌"], ["Hidupan yang paling kuat bersaing biasanya akan…", "terus hidup dan membiak", ["mati dahulu", "berpindah ke laut", "tidak membesar"]],
  ["Jika pemangsa diburu sehingga pupus, bilangan mangsa akan…", "bertambah", ["berkurang", "tidak berubah", "terus pupus"]], ["Pokok tinggi di hutan hujan mempunyai batang yang tinggi untuk bersaing mendapatkan…", "cahaya matahari", ["air hujan sahaja", "angin", "bunyi"], "🌳"]];
const interaksi = blend([4, ask(INTERAKSI)], [1, tfq([["Persaingan berlaku apabila keperluan hidupan terhad.", true], ["Tumbuhan tidak bersaing antara satu sama lain.", false]])]);
const DAYA = [["Daya ialah tolakan atau…", "tarikan", ["putaran", "cahaya", "haba"], "💪"], ["Menendang bola yang pegun menyebabkan bola itu…", "bergerak", ["mencair", "berhenti", "menjadi berat"], "⚽"],
  ["Memicit plastisin menyebabkan ___ plastisin berubah.", "bentuk", ["warna", "jisim", "bau"], "🫳"], ["Daya yang menarik objek ke arah Bumi dipanggil…", "graviti", ["geseran", "magnet", "elektrik"], "🍎"],
  ["Daya yang menentang gerakan antara dua permukaan dipanggil…", "geseran", ["graviti", "tolakan", "tarikan"]], ["Tayar kereta mempunyai bunga untuk ___ geseran.", "menambah", ["mengurangkan", "menghapuskan", "memanaskan"], "🛞"],
  ["Minyak pelincir digunakan pada rantai basikal untuk ___ geseran.", "mengurangkan", ["menambah", "menukar", "memanjangkan"], "🚲"], ["Menangkap bola yang sedang bergerak menunjukkan daya boleh…", "menghentikan objek", ["menambah jisim", "menukar warna", "mencairkan objek"], "🧤"]];
const daya = blend([4, ask(DAYA)], [1, tfq([["Daya tidak boleh dilihat tetapi kesannya boleh dilihat.", true], ["Geseran menghasilkan haba.", true], ["Lantai yang licin mempunyai geseran yang tinggi.", false]])]);
const kelajuan = blend(
  [3, () => { const t = pick([2, 4, 5, 10, 20]), v = pick([2, 3, 4, 5, 6, 8, 10]); return input(`Seekor kucing berlari sejauh <b>${v * t} m</b> dalam masa <b>${t} saat</b>. Berapakah kelajuannya?`, v, { unit: "m/s", explain: `Laju = jarak ÷ masa = ${v * t} ÷ ${t} = ${v} m/s` }); }],
  [2, () => { const t = pick([2, 3, 4]), v = pick([40, 50, 60, 70, 80, 90]); return input(`Sebuah bas bergerak sejauh <b>${v * t} km</b> dalam masa <b>${t} jam</b>. Berapakah kelajuan bas itu?`, v, { unit: "km/j", explain: `Laju = jarak ÷ masa = ${v * t} ÷ ${t} = ${v} km/j` }); }],
  [2, () => { const v = pick([3, 4, 5, 6]), t = pick([10, 20, 30]); return input(`Ali berbasikal dengan kelajuan <b>${v} m/s</b> selama <b>${t} saat</b>. Berapakah jarak yang dilaluinya?`, v * t, { unit: "m", explain: `Jarak = laju × masa = ${v} × ${t}` }); }],
  [1, ask([["Kelajuan ialah ___ yang dilalui dalam satu unit masa.", "jarak", ["jisim", "suhu", "isi padu"]], ["Rumus kelajuan ialah…", "jarak ÷ masa", ["masa ÷ jarak", "jarak × masa", "jarak + masa"]],
    ["Objek yang melalui jarak yang sama dalam masa yang <b>lebih singkat</b> bergerak lebih…", "laju", ["perlahan", "berat", "ringan"], "🏎️"]])],
);
const GERHANA = [["Gerhana bulan berlaku apabila ___ berada di antara Matahari dan Bulan.", "Bumi", ["Bulan", "Marikh", "awan"], "🌑"], ["Gerhana matahari berlaku apabila ___ berada di antara Matahari dan Bumi.", "Bulan", ["Bumi", "Zuhrah", "awan"], "🌘"],
  ["Mengapakah kita tidak boleh melihat gerhana matahari dengan mata kasar?", "boleh merosakkan mata", ["akan menyebabkan hujan", "Matahari akan hilang", "tidak kelihatan langsung"], "🕶️"], ["Sekumpulan bintang yang membentuk corak tertentu dipanggil…", "buruj", ["planet", "galaksi kecil", "komet"], "✨"],
  ["Buruj Biduk digunakan untuk menunjukkan arah…", "utara", ["selatan", "timur", "barat"], "🧭"], ["Buruj Pari digunakan untuk menunjukkan arah…", "selatan", ["utara", "timur", "barat"], "🧭"],
  ["Petani dahulu menggunakan kemunculan buruj Belantik sebagai petanda musim…", "menanam padi", ["hujan salji", "menuai durian", "kemarau panjang"], "🌾"], ["Gerhana bulan penuh hanya boleh berlaku semasa bulan…", "purnama", ["sabit", "anak bulan", "separa"], "🌕"]];
const gerhana = blend([4, ask(GERHANA)], [1, tfq([["Semasa gerhana bulan, bayang-bayang Bumi jatuh pada Bulan.", true], ["Buruj ialah sebuah planet.", false]])]);
const TONG = [["📰", "Surat khabar lama", "biru"], ["📦", "Kotak kertas", "biru"], ["🍾", "Botol kaca", "coklat"], ["🫙", "Balang kaca", "coklat"], ["🧴", "Botol plastik", "oren"], ["🥫", "Tin aluminium", "oren"]];
const PULIHARA = [["Amalan 3R ialah kurangkan, guna semula dan…", "kitar semula", ["buang", "bakar", "simpan"], "♻️"], ["Pembalakan haram boleh menyebabkan…", "hakisan tanah dan banjir kilat", ["udara lebih bersih", "hujan berhenti", "hutan bertambah"], "🪓"],
  ["Asap kilang dan kenderaan menyebabkan pencemaran…", "udara", ["bunyi", "tanah", "cahaya"], "🏭"], ["Membuang sampah ke dalam sungai menyebabkan pencemaran…", "air", ["udara", "bunyi", "cahaya"], "🏞️"],
  ["Contoh amalan menjimatkan tenaga elektrik ialah…", "menutup lampu apabila tidak digunakan", ["membuka peti sejuk lama-lama", "membiarkan kipas berpusing", "mengecas telefon sepanjang hari"], "💡"], ["Kawasan yang melindungi haiwan dan tumbuhan liar dipanggil…", "taman negara", ["kawasan perindustrian", "pusat bandar", "tapak pelupusan"], "🏞️"]];
const pemuliharaan = blend(
  [2, () => { const [e, n, t] = pick(TONG); return mcq(`${n} perlu dimasukkan ke dalam tong kitar semula berwarna…`, t, ["biru", "coklat", "oren"], { visual: pic(e), n: 3 }); }],
  [3, ask(PULIHARA)],
  [1, tfq([["Kita boleh menggunakan semula botol kaca sebagai pasu bunga.", true], ["Membakar sampah secara terbuka baik untuk alam sekitar.", false], ["Beg plastik mengambil masa yang sangat lama untuk terurai.", true]])],
);

// ---------------------------------------------------------------- curriculum
// [id, title, emoji, generator]
export const SAINS = {
  1: [
    ["kemahiran-sains", "Kemahiran & Bilik Sains", "🔬", keselamatan],
    ["deria", "Pancaindera", "👀", deria],
    ["haiwan-1", "Haiwan & Cirinya", "🐾", haiwan1],
    ["tumbuhan-1", "Bahagian Tumbuhan", "🌱", tumbuhan1],
    ["magnet", "Magnet", "🧲", magnet],
    ["apung-tenggelam", "Terapung & Tenggelam", "🛟", bahan1],
  ],
  2: [
    ["benda-hidup", "Benda Hidup & Bukan Hidup", "🌳", pengelasan],
    ["gigi", "Gigi & Kebersihan", "🦷", gigi],
    ["pembiakan", "Pembiakan & Kitar Hidup Haiwan", "🐣", pembiakan],
    ["keperluan-tumbuhan", "Keperluan Tumbuhan", "🪴", keperluanTumbuhan],
    ["cahaya-bayang", "Cahaya & Bayang-bayang", "🔦", cahaya1],
    ["serap-air", "Bahan Menyerap Air", "🧽", serapAir],
  ],
  3: [
    ["rangka", "Sistem Rangka", "🦴", rangka],
    ["kelas-makanan", "Kelas Makanan & Gizi", "🍱", kelasMakanan],
    ["makanan-haiwan", "Herbivor, Karnivor & Omnivor", "🦁", makananHaiwan],
    ["asid-alkali", "Asid & Alkali", "🧪", asidAlkali],
    ["ukuran", "Pengukuran", "📏", ukuran],
    ["tanah", "Tanah", "🪨", tanah],
  ],
  4: [
    ["nafas-kumuh", "Pernafasan & Perkumuhan", "🫁", nafas],
    ["lindung-haiwan", "Haiwan Melindungi Diri", "🦔", perlindunganHaiwan],
    ["tumbuhan-4", "Perlindungan & Penyebaran Biji", "🌵", tumbuhan4],
    ["sifat-bahan", "Sifat Bahan", "🔌", sifatBahan],
    ["sistem-suria", "Sistem Suria", "🪐", sistemSuria],
    ["kestabilan", "Kekuatan & Kestabilan", "🌉", kekuatan],
  ],
  5: [
    ["rantai-makanan", "Rantai & Siratan Makanan", "🕸️", rantaiMakanan],
    ["elektrik", "Litar Elektrik", "💡", elektrik],
    ["haba", "Haba & Suhu", "🌡️", haba],
    ["keadaan-jirim", "Keadaan Jirim", "🧊", keadaanJirim],
    ["bumi-bulan", "Bumi, Bulan & Matahari", "🌓", bumiBulan],
    ["cahaya", "Pantulan & Pembiasan Cahaya", "🌈", cahaya5],
  ],
  6: [
    ["mikroorganisma", "Mikroorganisma", "🦠", mikroorganisma],
    ["interaksi", "Interaksi Hidupan", "🐅", interaksi],
    ["daya", "Daya & Geseran", "💪", daya],
    ["kelajuan", "Kelajuan", "🏎️", kelajuan],
    ["gerhana-buruj", "Gerhana & Buruj", "🌘", gerhana],
    ["pemuliharaan", "Pemuliharaan Alam Sekitar", "♻️", pemuliharaan],
  ],
};
