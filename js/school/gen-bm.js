// Bahasa Melayu Tahun 1–6 (topik selaras KSSR): tatabahasa, kosa kata, peribahasa & pemahaman.
import { mcq, tf, order, match, fill, blend, pick, sample, shuffle } from "./qkit.js";
import { SIMPULAN } from "../data/games.js";

// ---------------------------------------------------------------- banks
// [kata dasar, meN- form]
export const MEN = [
  ["baca", "membaca"], ["beli", "membeli"], ["buang", "membuang"], ["pukul", "memukul"], ["potong", "memotong"], ["pakai", "memakai"],
  ["tulis", "menulis"], ["tolong", "menolong"], ["tanam", "menanam"], ["tendang", "menendang"], ["dengar", "mendengar"], ["cuci", "mencuci"],
  ["jahit", "menjahit"], ["sapu", "menyapu"], ["siram", "menyiram"], ["kira", "mengira"], ["kayuh", "mengayuh"],
  ["ambil", "mengambil"], ["angkat", "mengangkat"], ["ikat", "mengikat"], ["ajar", "mengajar"], ["gosok", "menggosok"], ["gunting", "menggunting"],
  ["hantar", "menghantar"], ["lukis", "melukis"], ["lompat", "melompat"], ["masak", "memasak"], ["nyanyi", "menyanyi"], ["rasa", "merasa"],
  ["warna", "mewarna"], ["isi", "mengisi"], ["ukur", "mengukur"], ["jawab", "menjawab"], ["cari", "mencari"],
  ["pandu", "memandu"],
  ["kejar", "mengejar"],
  ["tonton", "menonton"],
  ["tangkap", "menangkap"],
  ["jual", "menjual"]];
const WRONG_MEN = (b) => uniqS([`me${b}`, `mem${b}`, `men${b}`, `meng${b}`, `meny${b.slice(1)}`, `mem${b.slice(1)}`, `men${b.slice(1)}`, `meng${b.slice(1)}`]);
function uniqS(a) { return [...new Set(a)]; }
// [kata dasar, ber- form]
export const BER = [["lari", "berlari"], ["main", "bermain"], ["jalan", "berjalan"], ["nyanyi", "bernyanyi"], ["renang", "berenang"], ["kerja", "bekerja"],
  ["ajar", "belajar"], ["cakap", "bercakap"], ["sukan", "bersukan"], ["basikal", "berbasikal"], ["kawan", "berkawan"], ["sembahyang", "bersembahyang"]];
// [noun, penjodoh, sentence]
export const PENJODOH = [
  ["kucing", "seekor", "Ada ___ kucing di bawah meja."], ["burung", "seekor", "___ burung hinggap di dahan."], ["ikan", "seekor", "Ayah memancing ___ ikan."],
  ["gajah", "seekor", "Kami melihat ___ gajah di zoo."], ["rama-rama", "seekor", "___ rama-rama terbang di taman."],
  ["kereta", "sebuah", "Pak Cik membeli ___ kereta baharu."], ["rumah", "sebuah", "Ada ___ rumah di atas bukit."], ["buku", "sebuah", "Siti membaca ___ buku cerita."],
  ["bas", "sebuah", "___ bas berhenti di hadapan sekolah."], ["kapal", "sebuah", "___ kapal berlabuh di pelabuhan."],
  ["pensel", "sebatang", "Adik meminjam ___ pensel."], ["pokok", "sebatang", "Ada ___ pokok mangga di halaman."], ["sungai", "sebatang", "___ sungai mengalir di kampung itu."], ["pen", "sebatang", "Cikgu memberi saya ___ pen."],
  ["kertas", "sehelai", "Ambil ___ kertas lukisan."], ["baju", "sehelai", "Ibu menjahit ___ baju."], ["daun", "sehelai", "___ daun gugur ke tanah."], ["tuala", "sehelai", "Bawa ___ tuala ke kolam."],
  ["bola", "sebiji", "Ali menendang ___ bola."], ["telur", "sebiji", "Ibu memecahkan ___ telur."], ["cawan", "sebiji", "Tolong ambilkan ___ cawan."], ["epal", "sebiji", "Saya makan ___ epal."],
  ["murid", "seorang", "Ada ___ murid baharu di kelas kami."], ["guru", "seorang", "___ guru masuk ke kelas."], ["doktor", "seorang", "Ayah berjumpa ___ doktor."],
  ["bunga", "sekuntum", "Siti memetik ___ bunga mawar."], ["surat", "sepucuk", "Saya menerima ___ surat daripada nenek."], ["payung", "sekaki", "Bawalah ___ payung kerana hari hujan."],
  ["tali", "seutas", "Abang memerlukan ___ tali."], ["jam tangan", "seutas", "Ayah menghadiahkan ___ jam tangan."], ["pisau", "sebilah", "Ibu memotong sayur dengan ___ pisau."],
  ["kasut", "sepasang", "Ibu membeli ___ kasut sekolah untuk saya."], ["beras", "sebutir", "Tiada ___ beras pun yang tumpah."],
];
const PENJODOH_ALL = ["seekor", "sebuah", "sebatang", "sehelai", "sebiji", "seorang", "sekuntum", "sepucuk", "sekaki", "seutas", "sebilah", "sepasang", "sebutir"];
// [word, opposite]
export const ANTONIM = [["besar", "kecil"], ["tinggi", "rendah"], ["panjang", "pendek"], ["rajin", "malas"], ["gembira", "sedih"], ["panas", "sejuk"],
  ["cepat", "lambat"], ["berat", "ringan"], ["bersih", "kotor"], ["terang", "gelap"], ["tua", "muda"], ["kaya", "miskin"], ["kuat", "lemah"],
  ["buka", "tutup"], ["masuk", "keluar"], ["naik", "turun"], ["pagi", "petang"], ["siang", "malam"], ["jauh", "dekat"], ["mahal", "murah"],
  ["menang", "kalah"], ["tebal", "nipis"], ["lebar", "sempit"], ["awal", "lewat"]];
// [word, synonym]
export const SINONIM = [["gembira", "riang"], ["cepat", "pantas"], ["rajin", "tekun"], ["bijak", "pandai"], ["takut", "gerun"], ["marah", "berang"],
  ["sunyi", "sepi"], ["indah", "cantik"], ["senyap", "diam"], ["kuat", "gagah"], ["mula", "awal"], ["besar", "agung"], ["sedih", "pilu"],
  ["lapar", "kebuluran"], ["hadiah", "anugerah"], ["sihat", "segar"], ["ajar", "didik"], ["kawan", "sahabat"]];
const KATA_TANYA = [["Siapa", "orang", "___ nama guru kelas kamu?"], ["Apa", "benda", "___ yang kamu makan pagi tadi?"], ["Bila", "masa", "___ kamu akan pergi ke Melaka?"],
  ["Di mana", "tempat", "___ kamu letakkan beg itu?"], ["Mengapa", "sebab", "___ kamu lewat ke sekolah?"], ["Bagaimana", "cara", "___ kamu pergi ke sekolah?"],
  ["Berapa", "bilangan", "___ orang adik-beradik kamu?"],
  ["Siapa", "orang", "___ yang menang pertandingan itu?"],
  ["Apa", "benda", "___ warna kegemaran kamu?"],
  ["Bila", "masa", "___ cuti sekolah bermula?"],
  ["Di mana", "tempat", "___ kamu tinggal?"],
  ["Mengapa", "sebab", "___ adik menangis?"],
  ["Bagaimana", "cara", "___ kamu membuat kek ini?"],
  ["Berapa", "bilangan", "___ harga sebiji tembikai?"],
  ["Siapa", "orang", "___ yang membersihkan kelas pagi tadi?"],
  ["Di mana", "tempat", "___ letaknya Menara Kuala Lumpur?"]];
// [sentence with ___, answer, distractors]
const SENDI = [["Ali pergi ___ kedai.", "ke", ["di", "dari", "pada"]], ["Buku itu ada ___ atas meja.", "di", ["ke", "dari", "kepada"]], ["Ayah baru pulang ___ pejabat.", "dari", ["ke", "di", "daripada"]],
  ["Hadiah itu ___ ibu saya.", "daripada", ["dari", "di", "ke"]], ["Siti memberi bunga ___ guru.", "kepada", ["ke", "di", "pada"]], ["Kami bercuti ___ hari Sabtu.", "pada", ["di", "ke", "kepada"]],
  ["Adik lebih tinggi ___ kakak.", "daripada", ["dari", "kepada", "pada"]], ["Kek itu dibuat ___ tepung.", "daripada", ["dari", "di", "ke"]], ["Hadiah ini ___ kamu.", "untuk", ["di", "ke", "dari"]],
  ["Kami belajar ___ dalam kelas.", "di", ["ke", "dari", "kepada"]],
  ["Pak Cik Ahmad baru tiba ___ Kelantan.", "dari", ["daripada", "kepada", "pada"]],
  ["Surat itu dihantar ___ Encik Lim.", "kepada", ["ke", "di", "dari"]],
  ["Kakak lebih rajin ___ abang.", "daripada", ["dari", "kepada", "di"]],
  ["Baju itu diperbuat ___ kain sutera.", "daripada", ["dari", "di", "ke"]],
  ["Adik pergi ___ sekolah dengan menaiki bas.", "ke", ["di", "dari", "pada"]],
  ["Kami berkumpul ___ dewan sekolah.", "di", ["ke", "kepada", "dari"]],
  ["Mesyuarat itu diadakan ___ pukul tiga petang.", "pada", ["di", "ke", "kepada"]],
  ["Ali menerima hadiah ___ guru besar.", "daripada", ["dari", "kepada", "ke"]],
  ["Sumbangan ini ___ mangsa banjir.", "untuk", ["di", "dari", "ke"]]];
const HUBUNG = [["Saya suka membaca ___ melukis.", "dan", ["tetapi", "kerana", "atau"]], ["Ali rajin ___ adiknya malas.", "tetapi", ["dan", "kerana", "supaya"]],
  ["Dia tidak datang ___ demam.", "kerana", ["tetapi", "atau", "dan"]], ["Kamu mahu teh ___ kopi?", "atau", ["dan", "tetapi", "kerana"]],
  ["Ibu memasak ___ menyanyi.", "sambil", ["kerana", "atau", "tetapi"]], ["Belajarlah bersungguh-sungguh ___ lulus peperiksaan.", "supaya", ["tetapi", "atau", "sambil"]],
  ["Saya akan menelefon kamu ___ sampai di rumah.", "apabila", ["tetapi", "atau", "supaya"]], ["Cikgu berkata ___ esok cuti.", "bahawa", ["supaya", "atau", "sambil"]],
  ["Ayah membeli roti ___ susu.", "dan", ["tetapi", "kerana", "supaya"]], ["Hari hujan ___ kami tetap bermain.", "tetapi", ["dan", "kerana", "atau"]],
  ["Adik menangis ___ jatuh dari basikal.", "kerana", ["tetapi", "atau", "dan"]], ["Kamu mahu baju merah ___ biru?", "atau", ["dan", "kerana", "tetapi"]],
  ["Kakak membaca buku ___ adik melukis.", "dan", ["kerana", "atau", "supaya"]], ["Rumah itu kecil ___ bersih.", "tetapi", ["kerana", "atau", "supaya"]],
  ["Ali tidak ke sekolah ___ hujan lebat.", "kerana", ["dan", "atau", "tetapi"]], ["Mahu naik bas ___ teksi?", "atau", ["dan", "kerana", "tetapi"]],
  ["Saya mahu minum air ___ dahaga.", "kerana", ["tetapi", "atau", "supaya"]],
  ["Bawa payung ___ tidak basah.", "supaya", ["tetapi", "kerana", "atau"]],
  ["Kamu mahu pensel ___ pen?", "atau", ["kerana", "supaya", "tetapi"]],
  ["Ali pandai ___ tidak sombong.", "tetapi", ["kerana", "atau", "supaya"]],
  ["Datuk membaca akhbar ___ minum kopi.", "sambil", ["kerana", "atau", "supaya"]],
  ["Siti gembira ___ mendapat hadiah.", "kerana", ["tetapi", "atau", "supaya"]],
  ["Kami bermain bola ___ hari sudah petang.", "apabila", ["tetapi", "atau", "supaya"]],
  ["Cikgu memberitahu ___ lawatan itu dibatalkan.", "bahawa", ["supaya", "atau", "sambil"]]];
const HUBUNG_ASAS = HUBUNG.filter(([, a]) => ["dan", "tetapi", "kerana", "atau"].includes(a));
// [word, syllables]
const SUKU = [["buku", "bu-ku"], ["meja", "me-ja"], ["kereta", "ke-re-ta"], ["sekolah", "se-ko-lah"], ["bola", "bo-la"], ["rumah", "ru-mah"], ["pantai", "pan-tai"],
  ["pulau", "pu-lau"], ["kucing", "ku-cing"], ["bunga", "bu-nga"], ["payung", "pa-yung"], ["epal", "e-pal"], ["tingkap", "ting-kap"], ["gajah", "ga-jah"],
  ["matahari", "ma-ta-ha-ri"], ["perpustakaan", "per-pus-ta-ka-an"], ["kerusi", "ke-ru-si"], ["pisang", "pi-sang"]];
const EMOJI_WORD = [["🐱", "kucing"], ["🍌", "pisang"], ["🚗", "kereta"], ["🏠", "rumah"], ["📚", "buku"], ["⚽", "bola"], ["🌸", "bunga"], ["☂️", "payung"], ["🐘", "gajah"],
  ["🍎", "epal"], ["🐟", "ikan"], ["🌳", "pokok"], ["✏️", "pensel"], ["🪑", "kerusi"], ["🌙", "bulan"], ["☀️", "matahari"], ["🍉", "tembikai"], ["🐦", "burung"]];
const KHAS = [["kuala lumpur", "Kuala Lumpur"], ["sungai pahang", "Sungai Pahang"], ["gunung kinabalu", "Gunung Kinabalu"], ["hari isnin", "hari Isnin"], ["bulan mei", "bulan Mei"],
  ["pulau langkawi", "Pulau Langkawi"], ["cikgu aminah", "Cikgu Aminah"], ["negeri johor", "negeri Johor"]];
const EJAAN = [["sekolah", "sekola"], ["perpustakaan", "perpustakan"], ["kerusi", "kerosi"], ["jambatan", "jembatan"], ["nasihat", "nasehat"], ["telefon", "telepon"],
  ["televisyen", "televisen"], ["jadual", "jadwal"], ["doktor", "dokter"], ["kualiti", "kwaliti"], ["aktiviti", "aktivitas"], ["ubat", "obat"], ["fikir", "pikir"],
  ["Isnin", "Senin"], ["kompleks", "komplek"], ["risiko", "resiko"], ["teksi", "taksi"], ["kereta api", "keretapi"], ["sukan", "sokan"], ["musim", "musem"]];
const GANDA_BERENTAK = [["sayur", "sayur-mayur"], ["lauk", "lauk-pauk"], ["kuih", "kuih-muih"], ["kayu", "kayu-kayan"], ["gunung", "gunung-ganang"], ["saudara", "saudara-mara"],
  ["bukit", "bukit-bukau"], ["batu", "batu-batan"], ["ramah", "ramah-tamah"], ["cerai", "cerai-berai"],
  ["semak", "semak-samun"],
  ["kacau", "kacau-bilau"],
  ["anak", "anak-pinak"],
  ["hiruk", "hiruk-pikuk"],
  ["sunyi", "sunyi-sepi"]];
const MAJMUK = [["kapal", "terbang"], ["jalan", "raya"], ["kereta", "api"], ["bilik", "darjah"], ["guru", "besar"], ["air", "terjun"], ["alat", "tulis"], ["meja", "tulis"], ["rumah", "sakit"], ["balai", "raya"]];
const PERIBAHASA = [
  ["Bagai aur dengan tebing", "Hidup saling tolong-menolong"],
  ["Seperti katak di bawah tempurung", "Pengetahuan yang sempit"],
  ["Bagai kacang lupakan kulit", "Lupa asal usul setelah berjaya"],
  ["Sediakan payung sebelum hujan", "Bersedia sebelum berlaku sesuatu"],
  ["Bersatu teguh, bercerai roboh", "Perpaduan membawa kekuatan"],
  ["Melentur buluh biarlah dari rebungnya", "Mendidik anak sejak kecil"],
  ["Air dicincang tidak akan putus", "Pergaduhan adik-beradik akan berbaik semula"],
  ["Sikit-sikit, lama-lama jadi bukit", "Berjimat sedikit demi sedikit akhirnya banyak"],
  ["Berat sama dipikul, ringan sama dijinjing", "Bekerjasama dalam susah dan senang"],
  ["Di mana bumi dipijak, di situ langit dijunjung", "Menghormati adat tempat kita tinggal"],
  ["Bagai menatang minyak yang penuh", "Menjaga sesuatu dengan sangat teliti"],
  ["Ke mana tumpahnya kuah kalau tidak ke nasi", "Perangai anak mengikut ibu bapa"],
  ["Hendak seribu daya, tak hendak seribu dalih", "Jika mahu, pasti ada caranya"],
  ["Malu bertanya sesat jalan", "Bertanyalah jika tidak tahu"],
];
// Susun ayat: [subjek, kata kerja, objek, keterangan]
const AYAT = [["Ali", "membaca", "buku", "di perpustakaan"], ["Ibu", "memasak", "nasi", "di dapur"], ["Adik", "menendang", "bola", "di padang"],
  ["Siti", "menyiram", "pokok bunga", "setiap pagi"], ["Kami", "membeli", "roti", "di kedai"], ["Ayah", "mencuci", "kereta", "pada hari Sabtu"],
  ["Mereka", "menulis", "karangan", "di dalam kelas"], ["Cikgu", "mengajar", "matematik", "dengan sabar"], ["Abang", "mengayuh", "basikal", "ke sekolah"],
  ["Kakak", "menjahit", "baju", "untuk adik"], ["Datuk", "menanam", "pokok pisang", "di kebun"], ["Murid-murid", "menyapu", "sampah", "di halaman sekolah"],
  ["Nenek", "menjahit", "langsir", "di ruang tamu"],
  ["Pak Mat", "memandu", "lori", "ke pasar"],
  ["Kucing", "mengejar", "tikus", "di dapur"],
  ["Puan Lim", "membaca", "akhbar", "pada waktu pagi"],
  ["Kami", "menonton", "wayang", "di pawagam"],
  ["Atuk", "menangkap", "ikan", "di sungai"],
  ["Murid itu", "melukis", "gambar", "di dalam kelas"],
  ["Mak Cik", "menjual", "kuih", "di gerai"]];
const PEMERI = [["Ini ___ adik saya.", "ialah", ["adalah", "dengan", "pada"]], ["Rumah itu ___ besar.", "adalah", ["ialah", "dengan", "pada"]], ["Kuala Lumpur ___ ibu negara Malaysia.", "ialah", ["adalah", "pada", "dengan"]],
  ["Hasil kerjanya ___ cantik.", "adalah", ["ialah", "kepada", "di"]], ["Encik Lim ___ guru besar sekolah kami.", "ialah", ["adalah", "pada", "dengan"]], ["Pertandingan itu ___ untuk murid Tahun 6.", "adalah", ["ialah", "dengan", "kepada"]],
  ["Gunung Kinabalu ___ gunung tertinggi di Malaysia.", "ialah", ["adalah", "dengan", "pada"]], ["Buku itu ___ milik saya.", "adalah", ["ialah", "kepada", "dengan"]],
  ["Durian ___ raja buah-buahan.", "ialah", ["adalah", "pada", "dengan"]], ["Keputusan peperiksaannya ___ sangat baik.", "adalah", ["ialah", "dengan", "kepada"]],
  ["Ahmad ___ ketua kelas kami.", "ialah", ["adalah", "kepada", "pada"]], ["Hadiah itu ___ daripada ibu.", "adalah", ["ialah", "dengan", "pada"]],
  ["Kucing ___ haiwan peliharaan saya.", "ialah", ["adalah", "pada", "dengan"]],
  ["Kelas kami ___ bersih dan ceria.", "adalah", ["ialah", "kepada", "dengan"]],
  ["Encik Rahman ___ seorang petani.", "ialah", ["adalah", "dengan", "pada"]],
  ["Lukisan itu ___ untuk pertandingan.", "adalah", ["ialah", "pada", "kepada"]],
  ["Bahasa Melayu ___ bahasa kebangsaan Malaysia.", "ialah", ["adalah", "dengan", "pada"]],
  ["Cuaca hari ini ___ panas.", "adalah", ["ialah", "dengan", "kepada"]]];
const PERBANDINGAN = [["Gajah ___ besar daripada kucing.", "lebih", ["paling", "ter", "sangat"]], ["Gunung Kinabalu ialah gunung yang ___ tinggi di Malaysia.", "paling", ["lebih", "kurang", "sama"]],
  ["Ali sama ___ dengan Abu.", "tinggi", ["setinggi", "tertinggi", "lebih tinggi"]], ["Siti murid yang ___ di dalam kelas.", "terpandai", ["lebih pandai", "pandai sekali dengan", "sepandai"]],
  ["Kereta itu ___ laju daripada basikal.", "lebih", ["paling", "ter", "se"]],
  ["Sungai Rajang ialah sungai yang ___ panjang di Malaysia.", "paling", ["lebih", "kurang", "se"]], ["Buku ini ___ tebal daripada buku itu.", "lebih", ["paling", "ter", "amat"]],
  ["Adik ___ tinggi dengan kakak.", "sama", ["lebih", "paling", "ter"]], ["Kucing itu ___ comel daripada kucing saya.", "lebih", ["paling", "ter", "se"]],
  ["Rumahnya ___ besar di kampung itu.", "paling", ["lebih", "kurang", "se"]],
  ["Ali berlari ___ daripada Abu.", "lebih laju", ["paling laju", "terlaju", "selaju"]], ["Hari ini ___ panas daripada semalam.", "lebih", ["paling", "ter", "se"]],
  ["Pensel itu ___ panjang dengan pembaris kecil.", "sama", ["lebih", "paling", "ter"]],
  ["Pensel saya ___ panjang daripada pensel kamu.", "lebih", ["paling", "ter", "se"]],
  ["Gunung itu ___ tinggi di negeri ini.", "paling", ["lebih", "kurang", "se"]],
  ["Rumah Ali sama ___ dengan rumah Abu.", "besar", ["sebesar", "terbesar", "lebih besar"]],
  ["Harimau ___ laju daripada kura-kura.", "lebih", ["paling", "ter", "se"]],
  ["Durian ialah buah yang ___ mahal di gerai itu.", "paling", ["lebih", "kurang", "se"]],
  ["Adik ___ rendah daripada abang.", "lebih", ["paling", "ter", "se"]]];

// Pemahaman: [petikan, [[soalan, jawapan, [salah…]] …]]
// [tahap, petikan, soalan] — 0: Tahun 1–2 (sangat pendek), 1: Tahun 3, 2: Tahun 4–5, 3: Tahun 5–6
const PETIKAN = [
  [0, "Abang Amir suka berbasikal. Basikalnya berwarna biru. Setiap petang, dia berbasikal di taman bersama kawan-kawannya.",
    [["Apakah hobi Abang Amir?", "berbasikal", ["berenang", "melukis", "memasak"]], ["Apakah warna basikalnya?", "biru", ["merah", "hijau", "hitam"]], ["Bilakah dia berbasikal?", "setiap petang", ["setiap pagi", "malam", "hari Isnin sahaja"]]]],
  [0, "Puan Salmah menanam pokok bunga di halaman rumah. Dia menyiram pokok itu setiap pagi. Bunga itu berwarna merah dan wangi.",
    [["Di manakah Puan Salmah menanam pokok bunga?", "di halaman rumah", ["di sekolah", "di pasar", "di dalam kelas"]], ["Bilakah dia menyiram pokok itu?", "setiap pagi", ["setiap malam", "seminggu sekali", "tengah hari"]], ["Apakah warna bunga itu?", "merah", ["kuning", "putih", "ungu"]]]],
  [0, "Hari ini Lina menyambut hari jadinya yang ketujuh. Ibu membuat kek coklat. Kawan-kawan Lina datang dan menyanyikan lagu.",
    [["Berapakah umur Lina sekarang?", "tujuh tahun", ["enam tahun", "lapan tahun", "lima tahun"]], ["Siapakah yang membuat kek?", "ibu", ["ayah", "Lina", "nenek"]], ["Apakah jenis kek itu?", "kek coklat", ["kek pisang", "kek keju", "kek buah"]]]],
  [0, "Ini Adam. Adam ada seekor kucing. Nama kucing itu Comel. Comel suka makan ikan.",
    [["Siapakah tuan kucing itu?", "Adam", ["Comel", "Ali", "Siti"]], ["Apakah nama kucing itu?", "Comel", ["Adam", "Tompok", "Manja"]], ["Apakah makanan kegemaran Comel?", "ikan", ["nasi", "susu", "roti"]]]],
  [0, "Hari ini hari Ahad. Mira pergi ke taman bersama ibu. Mira bermain buaian. Ibu membeli aiskrim.",
    [["Hari ini hari apa?", "hari Ahad", ["hari Isnin", "hari Sabtu", "hari Jumaat"]], ["Mira pergi ke taman bersama siapa?", "ibu", ["ayah", "kakak", "nenek"]], ["Apakah yang dibeli oleh ibu?", "aiskrim", ["bunga", "buaian", "buku"]]]],
  [0, "Pak Ali seorang nelayan. Dia menangkap ikan di laut. Dia pergi ke laut dengan bot. Ikan itu dijual di pasar.",
    [["Apakah pekerjaan Pak Ali?", "nelayan", ["petani", "guru", "polis"]], ["Pak Ali pergi ke laut dengan…", "bot", ["kereta", "basikal", "bas"]], ["Di manakah ikan itu dijual?", "di pasar", ["di sekolah", "di laut", "di rumah"]]]],
  [0, "Kelas Satu Bestari ada dua puluh orang murid. Guru kelas mereka ialah Cikgu Rosnah. Kelas itu bersih dan ceria.",
    [["Berapakah bilangan murid Kelas Satu Bestari?", "dua puluh", ["sepuluh", "tiga puluh", "lima belas"]], ["Siapakah guru kelas mereka?", "Cikgu Rosnah", ["Cikgu Ali", "Cikgu Lim", "Puan Mira"]], ["Bagaimanakah keadaan kelas itu?", "bersih dan ceria", ["kotor", "gelap", "bising"]]]],
  [1, "Pada hari Sabtu, Aina dan keluarganya pergi ke Pantai Cenang di Langkawi. Mereka bertolak awal pagi dengan feri. Aina membina istana pasir bersama adiknya, Danial. Petang itu, mereka menikmati air kelapa muda sambil melihat matahari terbenam.",
    [["Ke manakah Aina dan keluarganya pergi?", "Pantai Cenang", ["Pulau Pinang", "Melaka", "Pantai Batu Feringghi"]], ["Mereka ke Langkawi dengan menaiki…", "feri", ["kapal terbang", "bas", "kereta api"]], ["Siapakah adik Aina?", "Danial", ["Ali", "Siti", "Hafiz"]], ["Apakah yang mereka minum pada waktu petang?", "air kelapa muda", ["air tebu", "teh tarik", "susu"]]]],
  [1, "Encik Rahman ialah seorang petani. Setiap pagi, dia menyiram sayur-sayuran di kebunnya. Dia menanam kangkung, bayam dan cili. Hasil tanamannya dijual di pasar tani pada hari Rabu. Encik Rahman sangat rajin dan sabar.",
    [["Apakah pekerjaan Encik Rahman?", "petani", ["nelayan", "guru", "doktor"]], ["Bilakah Encik Rahman menjual hasil tanamannya?", "hari Rabu", ["hari Sabtu", "setiap pagi", "hari Ahad"]], ["Manakah BUKAN tanaman Encik Rahman?", "jagung", ["kangkung", "bayam", "cili"]], ["Sifat Encik Rahman ialah…", "rajin dan sabar", ["malas dan lambat", "garang", "pemarah"]]]],
  [2, "Hari Sukan Sekolah Kebangsaan Taman Ilmu diadakan pada bulan Mac. Rumah Merah menjadi johan keseluruhan. Mei Ling memenangi acara lari 100 meter. Semua murid bersorak dengan gembira apabila Guru Besar menyampaikan piala.",
    [["Bilakah Hari Sukan diadakan?", "bulan Mac", ["bulan Mei", "bulan Jun", "hari Isnin"]], ["Rumah sukan manakah yang menjadi johan?", "Rumah Merah", ["Rumah Biru", "Rumah Hijau", "Rumah Kuning"]], ["Mei Ling menang acara…", "lari 100 meter", ["lompat jauh", "lontar peluru", "lari berganti-ganti"]], ["Siapakah yang menyampaikan piala?", "Guru Besar", ["Mei Ling", "pengawas", "ibu bapa"]]]],
  [2, "Ravi suka membaca. Setiap waktu rehat, dia pergi ke perpustakaan sekolah. Dia gemar membaca buku tentang angkasa lepas. Ravi bercita-cita untuk menjadi angkasawan seperti Datuk Dr. Sheikh Muszaphar Shukor.",
    [["Apakah hobi Ravi?", "membaca", ["melukis", "berenang", "bermain bola"]], ["Bilakah Ravi pergi ke perpustakaan?", "waktu rehat", ["selepas sekolah", "hujung minggu", "waktu pagi"]], ["Apakah cita-cita Ravi?", "angkasawan", ["doktor", "guru", "juruterbang"]], ["Ravi gemar membaca buku tentang…", "angkasa lepas", ["haiwan", "sejarah", "masakan"]]]],
  [1, "Setiap petang, Hafiz membantu ayahnya di kedai runcit. Dia menyusun tin susu dan botol kicap di atas rak. Hafiz juga belajar mengira wang baki pelanggan. Ayah berasa bangga kerana Hafiz rajin dan jujur.",
    [["Di manakah Hafiz membantu ayahnya?", "di kedai runcit", ["di kebun", "di pasar malam", "di sekolah"]], ["Apakah yang disusun oleh Hafiz?", "tin susu dan botol kicap", ["buku dan pensel", "baju dan seluar", "sayur dan buah"]], ["Hafiz belajar mengira…", "wang baki pelanggan", ["bilangan rak", "harga kereta", "bilangan murid"]], ["Mengapakah ayah berasa bangga?", "Hafiz rajin dan jujur", ["Hafiz pandai menyanyi", "kedai itu besar", "Hafiz suka bermain"]]]],
  [2, "Banjir melanda Kampung Sri Jaya selepas hujan lebat selama tiga hari. Penduduk dipindahkan ke dewan sekolah yang dijadikan pusat pemindahan sementara. Sukarelawan menghantar makanan, selimut dan pakaian. Selepas air surut, penduduk bergotong-royong membersihkan rumah mereka.",
    [["Apakah punca banjir itu?", "hujan lebat selama tiga hari", ["sungai tersumbat sehari", "angin kencang", "air laut pasang"]], ["Ke manakah penduduk dipindahkan?", "dewan sekolah", ["masjid", "balai polis", "hospital"]], ["Apakah yang dihantar oleh sukarelawan?", "makanan, selimut dan pakaian", ["buku dan alat tulis", "kereta dan bot", "wang sahaja"]], ["Apakah yang dilakukan selepas air surut?", "bergotong-royong membersihkan rumah", ["berpindah ke bandar", "bercuti", "membina jambatan"]]]],
  [3, "Penyu belimbing ialah penyu terbesar di dunia. Dahulu, ribuan penyu belimbing mendarat di Rantau Abang, Terengganu untuk bertelur. Kini, penyu itu jarang dilihat kerana telurnya diambil, pantai tercemar dan banyak penyu tersangkut pada pukat. Kita perlu menjaga pantai dan tidak membeli telur penyu supaya spesies ini tidak pupus.",
    [["Di manakah penyu belimbing dahulu mendarat untuk bertelur?", "Rantau Abang, Terengganu", ["Pulau Pinang", "Kota Kinabalu", "Port Dickson"]], ["Antara berikut, yang manakah BUKAN punca penyu jarang dilihat?", "pantai terlalu panjang", ["telurnya diambil", "pantai tercemar", "tersangkut pada pukat"]], ["Maksud perkataan 'pupus' ialah…", "hilang terus dari dunia", ["bertambah banyak", "berpindah tempat", "menjadi besar"]], ["Apakah yang boleh kita lakukan?", "tidak membeli telur penyu", ["menangkap penyu", "membuang sampah di pantai", "memasang lebih banyak pukat"]]]],
  [3, "Tunku Abdul Rahman Putra Al-Haj dikenali sebagai Bapa Kemerdekaan. Beliau mengetuai rombongan ke London untuk berunding tentang kemerdekaan Tanah Melayu. Pada 31 Ogos 1957, beliau melaungkan perkataan 'Merdeka' sebanyak tujuh kali di Stadium Merdeka. Beliau juga Perdana Menteri Malaysia yang pertama.",
    [["Tunku Abdul Rahman dikenali sebagai…", "Bapa Kemerdekaan", ["Bapa Pembangunan", "Bapa Pemodenan", "Bapa Perpaduan"]], ["Ke manakah rombongan itu pergi untuk berunding?", "London", ["Paris", "Tokyo", "Singapura"]], ["Berapa kalikah perkataan 'Merdeka' dilaungkan?", "tujuh", ["tiga", "lima", "sepuluh"]], ["Di manakah peristiwa itu berlaku?", "Stadium Merdeka", ["Dataran Merdeka", "Stadium Bukit Jalil", "Parlimen"]]]],
];

// ---------------------------------------------------------------- generators
const kataNamaPic = () => { const [e, w] = pick(EMOJI_WORD);
  if (Math.random() < 0.4) return mcq(`Pilih gambar <b>${w}</b>.`, e, EMOJI_WORD.map((x) => x[0])); // perkataan → gambar
  return mcq("Apakah nama gambar ini?", w, EMOJI_WORD.map((x) => x[1]), { visual: `<span class="qbig">${e}</span>`, say: "Apakah nama gambar ini?" }); };
const sukuKata = blend(
  [2, () => { const [w, s] = pick(SUKU); return mcq(`Berapakah suku kata dalam perkataan <b>${w}</b>?`, String(s.split("-").length), ["1", "2", "3", "4", "5"], { explain: `${w} → ${s}` }); }],
  [2, () => { const [w, s] = pick(SUKU); return order(`Susun suku kata untuk membina perkataan <b>${w}</b>.`, s.split("-"), { joiner: "" }); }],
  [1, () => { const [w, s] = pick(SUKU); const wrong = s.split("-"); return mcq(`Cara yang betul untuk membahagikan suku kata <b>${w}</b> ialah…`, s, [wrong.join("").replace(/(.)(.)/, "$1-$2"), w.slice(0, 3) + "-" + w.slice(3), w.slice(0, 1) + "-" + w.slice(1)].filter((x) => x !== s)); }],
);
const hurufBesar = blend(
  [2, () => { const [low, up] = pick(KHAS); return mcq(`Pilih ejaan yang betul.`, up, [low, up.toUpperCase(), low.replace(/^./, (c) => c.toUpperCase())].filter((x) => x !== up)); }],
  [1, () => { const [, up] = pick(KHAS.filter(([, u]) => /^[A-Z]/.test(u))); return tf(`"${up}" ialah kata nama khas.`, true, { explain: "Kata nama khas ialah nama tempat, orang, hari atau bulan yang khusus — dimulakan dengan huruf besar." }); }],
  [1, () => { const w = pick(["kucing", "meja", "sekolah", "sungai", "kereta"]); return tf(`"${w}" ialah kata nama khas.`, false, { explain: `"${w}" ialah kata nama am.` }); }],
);
const penjodoh = (all = false) => blend(
  [3, () => { const pool = all ? PENJODOH : PENJODOH.filter(([, p]) => ["seekor", "sebuah", "sebiji", "seorang", "sebatang", "sehelai"].includes(p)); const [, p, sen] = pick(pool); const first = sen.startsWith("___"); return fill(sen, first ? cap(p) : p, first ? PENJODOH_ALL.map(cap) : PENJODOH_ALL); }],
  [1, () => { const set = sample(PENJODOH.filter((x, i, a) => a.findIndex((y) => y[1] === x[1]) === i), 4); return match("Padankan penjodoh bilangan dengan kata nama.", set.map(([n, p]) => [p, n])); }],
);
const imbuhanMen = blend(
  [3, () => { const [b, f] = pick(MEN); return mcq(`Kata dasar <b>${b}</b> + awalan <b>meN-</b> menjadi…`, f, WRONG_MEN(b), { explain: imbuhanRule(b) }); }],
  [2, () => { const [b, f] = pick(MEN); return fill(`Setiap hari, Ali ___ di dalam kelas.`.replace("Ali ___ di dalam kelas", `Ali ___ ${objFor(b)}`), f, [b, `di${b}`, `ber${b}`]); }],
);
function objFor(b) { return { baca: "buku cerita", beli: "roti", buang: "sampah", pukul: "gendang", potong: "kek", pakai: "kasut", tulis: "surat", tolong: "ibu", tanam: "pokok", tendang: "bola", dengar: "radio", cuci: "pinggan", jahit: "baju", sapu: "lantai", siram: "pokok", kira: "duit", kayuh: "basikal", ambil: "buku", angkat: "kotak", ikat: "tali kasut", ajar: "adik membaca", gosok: "gigi", gunting: "kertas", hantar: "surat", lukis: "gambar", lompat: "tali", masak: "nasi", nyanyi: "lagu", rasa: "kuih", warna: "gambar", isi: "botol air", ukur: "meja", jawab: "soalan", cari: "kunci" }[b] || "kerja rumah"; }
function imbuhanRule(b) {
  const c = b[0];
  if ("bpf".includes(c)) return `Kata bermula dengan ${c} → mem-${c === "p" ? " (huruf p digugurkan)" : ""}.`;
  if ("tdcjz".includes(c)) return `Kata bermula dengan ${c} → men-${c === "t" ? " (huruf t digugurkan)" : ""}.`;
  if (c === "s") return "Kata bermula dengan s → meny- (huruf s digugurkan).";
  if (c === "k") return "Kata bermula dengan k → meng- (huruf k digugurkan).";
  if ("gh".includes(c) || "aeiou".includes(c)) return `Kata bermula dengan ${c} → meng-.`;
  return `Kata bermula dengan ${c} → me-.`;
}
const imbuhanLain = blend(
  [2, () => { const [b, f] = pick(BER); return mcq(`Kata dasar <b>${b}</b> + awalan <b>ber-</b> menjadi…`, f, [`ber${b}`, `be${b}`, `bel${b}`, `mem${b}`].filter((x) => x !== f)); }],
  [2, () => { const b = pick(PASIF_OK); return fill(`${cap(objFor(b).split(" ")[0])} itu ___ oleh Ali.`, `di${b}`, [MEN.find((x) => x[0] === b)[1], `ber${b}`, `ter${b}`]); }],
  [1, () => { const [b, f] = pick([["jatuh", "terjatuh"], ["tidur", "tertidur"], ["buka", "terbuka"], ["tutup", "tertutup"], ["lupa", "terlupa"]]); return fill(`Pintu itu ___ kerana angin kencang.`.replace("Pintu itu", { jatuh: "Adik", tidur: "Ayah", buka: "Tingkap itu", tutup: "Pintu itu", lupa: "Saya" }[b]).replace("kerana angin kencang", { jatuh: "dari basikal", tidur: "di sofa", buka: "dengan sendiri", tutup: "kerana angin kencang", lupa: "membawa buku" }[b]), f, [`me${b}`, `di${b}`, `ber${b}`]); }],
  [1, () => { const [b, f] = pick([["main", "pemain"], ["tulis", "penulis"], ["lari", "pelari"], ["ajar", "pengajar"], ["baca", "pembaca"], ["sapu", "penyapu"]]); return mcq(`Awalan peN- + <b>${b}</b> menjadi…`, f, [`pe${b}`, `pem${b}`, `pen${b}`, `peng${b}`].filter((x) => x !== f)); }],
);
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const PASIF_OK = ["baca", "tulis", "beli", "potong", "siram", "tendang", "cuci", "jahit", "sapu", "ambil", "angkat", "hantar", "jawab", "cari", "masak", "lukis", "kira", "gunting", "isi", "pukul", "kayuh", "pakai", "tanam", "buang", "ukur"];
const apitan = blend(
  [2, () => { const [b, f] = pick([["baik", "kebaikan"], ["sihat", "kesihatan"], ["bersih", "kebersihan"], ["cantik", "kecantikan"], ["selamat", "keselamatan"], ["gembira", "kegembiraan"], ["sedih", "kesedihan"], ["indah", "keindahan"], ["sejuk", "kesejukan"], ["sakit", "kesakitan"]]); return mcq(`Apitan <b>ke-…-an</b> + ${b} menjadi…`, f, [`ke${b}`, `${b}an`, `pe${b}an`, `per${b}an`].filter((x) => x !== f)); }],
  [2, () => { const [b, f] = pick([["ajar", "pengajaran"], ["didik", "pendidikan"], ["tulis", "penulisan"], ["baca", "pembacaan"], ["jual", "penjualan"], ["kira", "pengiraan"], ["pandu", "pemanduan"], ["lukis", "pelukisan"], ["dengar", "pendengaran"], ["tanam", "penanaman"]]); return mcq(`Apitan <b>peN-…-an</b> + ${b} menjadi…`, f, [`pe${b}an`, `per${b}an`, `ke${b}an`, `${b}an`].filter((x) => x !== f)); }],
  [1, () => { const [b, f, s] = pick([["besar", "membesarkan", "Ibu ___ anak-anaknya dengan penuh kasih sayang."], ["hantar", "menghantarkan", "Ayah ___ adik ke sekolah."], ["bersih", "membersihkan", "Kami ___ kelas setiap petang."], ["naik", "menaikkan", "Pengawas ___ bendera pada pagi Isnin."]]); return fill(s, f, [`mem${b}`.replace("memb", "memb"), `di${b}kan`, `${b}kan`].filter((x) => x !== f)); }],
);
const antonim = blend(
  [3, () => { const [a, b] = pick(ANTONIM); return mcq(`Antonim (lawan kata) bagi <b>${a}</b> ialah…`, b, ANTONIM.map((x) => x[1]).concat(ANTONIM.map((x) => x[0])).filter((x) => x !== a)); }],
  [1, () => match("Padankan perkataan dengan antonimnya.", sample(ANTONIM, 4))],
);
const sinonim = blend(
  [3, () => { const [a, b] = pick(SINONIM); return mcq(`Sinonim (seerti) bagi <b>${a}</b> ialah…`, b, SINONIM.map((x) => x[1]).filter((x) => x !== b).concat(ANTONIM.filter((x) => x[0] === a).map((x) => x[1]))); }],
  [1, () => match("Padankan perkataan dengan sinonimnya.", sample(SINONIM, 4))],
);
const kataTanya = blend(
  [3, () => { const [w, , s] = pick(KATA_TANYA); return fill(s, w, KATA_TANYA.map((x) => x[0])); }],
  [1, () => match("Padankan kata tanya dengan kegunaannya.", sample(KATA_TANYA.filter((x, i, a) => a.findIndex((y) => y[0] === x[0]) === i), 4).map(([w, use]) => [w, use]))],
);
const kataSendi = () => { const [s, a, ds] = pick(SENDI); return fill(s, a, ds, { explain: { di: "di — tempat", ke: "ke — arah tempat", dari: "dari — tempat / masa asal", daripada: "daripada — orang, punca bahan atau perbandingan", kepada: "kepada — orang / pihak yang menerima", pada: "pada — masa atau orang", untuk: "untuk — tujuan / bahagian" }[a] }); };
const kataHubung = (adv) => () => { const pool = adv ? HUBUNG : HUBUNG_ASAS; const [s, a, ds] = pick(pool); return fill(s, a, ds); };
const susunAyat = (long) => () => {
  const [s, v, o, k] = pick(AYAT);
  const words = long ? [s, v, ...o.split(" "), ...k.split(" ")] : [s, v, ...o.split(" ")];
  return order("Susun perkataan menjadi ayat yang betul.", words.map((w, i) => (i === 0 ? w : w)), { joiner: " " });
};
const tandaBaca = blend(
  [2, () => { const [s, t] = pick([["Siapakah nama kamu", "?"], ["Saya suka makan nasi lemak", "."], ["Wah, cantiknya bunga itu", "!"], ["Di manakah rumah kamu", "?"], ["Adik sedang tidur", "."], ["Aduh, sakitnya", "!"],
    ["Bilakah kamu pulang", "?"], ["Ibu memasak di dapur", "."], ["Syabas, kamu menang", "!"], ["Berapakah harga buku ini", "?"], ["Kami pergi ke taman", "."], ["Hore, esok cuti", "!"],
    ["Mengapakah kamu ketawa", "?"], ["Ayah membaca surat khabar", "."], ["Tolong, ada api", "!"], ["Bagaimanakah cara membuat wau", "?"], ["Kucing itu tidur di atas sofa", "."], ["Wah, besarnya rumah itu", "!"],
    ["Siapakah guru kelas kamu", "?"], ["Hari ini hari Isnin", "."]]); return mcq(`Tanda baca yang sesuai: "${s}☐"`, t, [".", "?", "!", ","], { n: 4 }); }],
  [1, () => tf(`"saya pergi ke sekolah." — ayat ini betul.`, false, { explain: "Ayat mesti bermula dengan huruf besar: Saya pergi ke sekolah." })],
);
const ejaan = () => { const [r, w] = pick(EJAAN); return mcq("Pilih ejaan yang <b>betul</b>.", r, [w, r.replace(/a/, "e"), r + "h"].filter((x) => x !== r)); };
const kataGanda = blend(
  [2, () => { const [b, g] = pick(GANDA_BERENTAK); return mcq(`Kata ganda berentak bagi <b>${b}</b> ialah…`, g, [`${b}-${b}`, `${b}-${b.slice(0, -1)}an`, `${b}-berai`].filter((x) => x !== g).concat(GANDA_BERENTAK.map((x) => x[1]))); }],
  [1, () => match("Padankan kata dasar dengan kata ganda berentak.", sample(GANDA_BERENTAK, 4))],
  [1, () => { const w = pick(["rumah", "buku", "pokok", "kereta", "murid"]); return mcq(`Kata ganda penuh bagi <b>${w}</b> ialah…`, `${w}-${w}`, [`${w}${w}`, `${w}-${w.slice(0, 2)}`, `ber${w}`]); }],
);
const kataMajmuk = blend(
  [2, () => { const [a, b] = pick(MAJMUK); return mcq(`Kata majmuk: <b>${a} ___</b>`, b, MAJMUK.map((x) => x[1])); }],
  [1, () => { const [a, b] = pick(MAJMUK); return mcq("Pilih ejaan kata majmuk yang betul.", `${a} ${b}`, [`${a}${b}`, `${a}-${b}`]); }],
);
const simpulan = blend(
  [3, () => { const [s, m] = pick(SIMPULAN); return mcq(`Apakah maksud simpulan bahasa <b>"${s}"</b>?`, m, SIMPULAN.map((x) => x[1])); }],
  [1, () => match("Padankan simpulan bahasa dengan maksudnya.", sample(SIMPULAN, 3))],
);
const peribahasa = blend(
  [3, () => { const [p, m] = pick(PERIBAHASA); return mcq(`Apakah maksud peribahasa <b>"${p}"</b>?`, m, PERIBAHASA.map((x) => x[1])); }],
  [2, () => { const [p, m] = pick(PERIBAHASA); return mcq(`Peribahasa yang bermaksud <b>"${m}"</b> ialah…`, p, PERIBAHASA.map((x) => x[0])); }],
  [1, () => { const [p] = pick(PERIBAHASA.filter(([x]) => x.split(" ").length <= 6)); return order("Susun semula peribahasa ini.", p.replace(/,/g, "").split(" ")); }],
);
const pemahaman = (...levels) => () => {
  const [, text, qs] = pick(PETIKAN.filter((p) => levels.includes(p[0])));
  const [q, a, ds] = pick(qs);
  return mcq(q, a, ds, { visual: `<div class="passage">${text}</div>` });
};
// ---------------------------------------------------------------- mendengar (dibacakan oleh peranti)
const dengarPilih = () => { const [e, w] = pick(EMOJI_WORD); return mcq("🎧 Dengar dan pilih gambar yang betul.", e, EMOJI_WORD.map((x) => x[0]), { listen: w, alt: `Pilih gambar <b>${w}</b>.` }); };
const EJA_MUDAH = [["kucing", ["kuching", "kucin"]], ["bunga", ["bungga", "buga"]], ["meja", ["mejah", "meije"]], ["rumah", ["ruma", "rumh"]], ["sayur", ["sayor", "saiur"]], ["kereta", ["kreta", "keretah"]],
  ["pokok", ["poko", "pokuk"]], ["burung", ["burong", "buruung"]], ["ayam", ["aiam", "ayem"]], ["sekolah", ["sekola", "sekulah"]], ["guru", ["gurru", "goru"]], ["pensel", ["pinsel", "pensal"]],
  ["telinga", ["telingga", "talinga"]], ["tingkap", ["tinkap", "tingkab"]], ["jalan", ["jalen", "jallan"]], ["hujan", ["hujen", "ujan"]]];
const dengarEja = () => { const [w, bad] = pick(EJA_MUDAH); return mcq("🎧 Dengar dan pilih ejaan yang betul.", w, bad, { listen: w, alt: "Pilih ejaan yang <b>betul</b>.", n: 3 }); };
const DENGAR_AYAT = [["Adik tidur di atas katil.", ["Adik duduk di atas katil.", "Adik tidur di bawah katil.", "Kakak tidur di atas katil."]],
  ["Ayah membaca surat khabar.", ["Ayah membeli surat khabar.", "Ibu membaca surat khabar.", "Ayah membaca buku cerita."]],
  ["Kucing itu berwarna hitam.", ["Kucing itu berwarna putih.", "Kambing itu berwarna hitam.", "Kucing ini berwarna hitam."]],
  ["Kami bermain bola di padang.", ["Kami bermain bola di taman.", "Kami menendang bola di padang.", "Mereka bermain bola di padang."]],
  ["Ibu memasak nasi goreng.", ["Ibu memasak mi goreng.", "Ibu membeli nasi goreng.", "Nenek memasak nasi goreng."]],
  ["Ada tiga ekor burung di dahan.", ["Ada dua ekor burung di dahan.", "Ada tiga ekor burung di bumbung.", "Ada tiga ekor kumbang di dahan."]],
  ["Siti memakai baju merah.", ["Siti memakai baju biru.", "Siti membasuh baju merah.", "Siti memakai kasut merah."]],
  ["Bas sekolah tiba pukul tujuh.", ["Bas sekolah tiba pukul lapan.", "Bas sekolah bertolak pukul tujuh.", "Van sekolah tiba pukul tujuh."]],
  ["Tolong tutup pintu itu.", ["Tolong buka pintu itu.", "Tolong tutup tingkap itu.", "Tolong cat pintu itu."]],
  ["Datuk menanam pokok rambutan.", ["Datuk menanam pokok durian.", "Datuk memetik buah rambutan.", "Nenek menanam pokok rambutan."]],
  ["Kami ke perpustakaan pada hari Rabu.", ["Kami ke perpustakaan pada hari Selasa.", "Kami ke kantin pada hari Rabu.", "Mereka ke perpustakaan pada hari Rabu."]],
  ["Abang mencuci kereta ayah.", ["Abang memandu kereta ayah.", "Abang mencuci kereta ibu.", "Adik mencuci kereta ayah."]]];
const dengarAyat = () => { const [a, ds] = pick(DENGAR_AYAT); return mcq("🎧 Dengar. Ayat manakah yang kamu dengar?", a, ds, { listen: a, alt: `Cari ayat yang sama: <b>${a}</b>` }); };

const ayatPasif = blend(
  [2, () => { const [s, v, o] = pick(AYAT.filter(([, v]) => MEN.some((x) => x[1] === v))); const b = MEN.find((x) => x[1] === v)?.[0]; if (!b) return mcq("Ayat pasif bagi 'Ali membaca buku' ialah…", "Buku dibaca oleh Ali.", ["Buku membaca Ali.", "Ali dibaca buku.", "Buku baca oleh Ali."]); if (s === "Kami") return mcq(`Tukarkan kepada ayat pasif: "${s} ${v} ${o}."`, `${cap(o)} kami ${b}.`, [`${cap(o)} di${b} oleh kami.`, `${cap(o)} ${v} oleh kami.`, `Kami di${b} ${o}.`], { explain: "Kata ganti nama diri pertama (saya, kami, kita): objek + kata ganti + kata kerja tanpa imbuhan." });
    const by = s === "Mereka" ? "mereka" : /^(Kucing|Murid)/.test(s) ? s.toLowerCase() : s; // "oleh kucing", but "oleh Ibu"
    return mcq(`Tukarkan kepada ayat pasif: "${s} ${v} ${o}."`, `${cap(o)} di${b} oleh ${by}.`, [`${cap(o)} ${v} oleh ${by}.`, `${s} di${b} ${o}.`, `${cap(o)} di${b} ${by}`]); }],
  [1, () => fill("Kerja rumah itu sudah ___ siapkan.", "saya", ["disaya", "menyaya", "oleh saya"], { explain: "Ayat pasif dengan kata ganti nama diri pertama: kata ganti + kata kerja tanpa imbuhan." })],
);
const pemeri = () => { const [s, a, ds] = pick(PEMERI); return fill(s, a, ds, { explain: "ialah — di hadapan frasa nama; adalah — di hadapan frasa adjektif atau frasa sendi nama." }); };
const perbandingan = () => { const [s, a, ds] = pick(PERBANDINGAN); return fill(s, a, ds); };

// ---------------------------------------------------------------- curriculum
export const BM = {
  1: [
    ["kata-nama", "Kenal Kata Nama", "🖼️", kataNamaPic],
    ["suku-kata", "Suku Kata", "🧩", sukuKata],
    ["huruf-besar", "Huruf Besar & Kata Nama Khas", "🔠", hurufBesar],
    ["penjodoh-asas", "Penjodoh Bilangan", "🔢", penjodoh(false)],
    ["kata-tanya-asas", "Kata Tanya", "❓", kataTanya],
    ["susun-ayat", "Susun Ayat Mudah", "🧱", susunAyat(false)],
    ["tanda-baca", "Tanda Baca", "✏️", tandaBaca],
    ["dengar-pilih", "Dengar & Pilih", "🎧", dengarPilih],
  ],
  2: [
    ["kata-kerja", "Kata Kerja & Imbuhan meN-", "🏃", imbuhanMen],
    ["antonim", "Antonim (Lawan Kata)", "↔️", antonim],
    ["penjodoh", "Penjodoh Bilangan", "🔢", penjodoh(true)],
    ["kata-sendi", "Kata Sendi Nama", "📍", kataSendi],
    ["kata-hubung", "Kata Hubung", "🔗", kataHubung(false)],
    ["ayat-tunggal", "Susun Ayat Tunggal", "🧱", susunAyat(true)],
    ["ejaan", "Ejaan", "🔤", ejaan],
    ["dengar-eja", "Dengar & Eja", "🎧", blend([2, dengarEja], [1, dengarPilih])],
    ["baca-faham", "Baca & Faham", "📗", pemahaman(0)],
  ],
  3: [
    ["imbuhan-awalan", "Imbuhan Awalan (meN-, ber-, di-, ter-, peN-)", "🧩", blend([1, imbuhanMen], [2, imbuhanLain])],
    ["sinonim", "Sinonim (Seerti)", "🟰", sinonim],
    ["kata-ganda", "Kata Ganda", "👯", kataGanda],
    ["kata-tanya", "Kata Tanya", "❓", kataTanya],
    ["kata-hubung-2", "Kata Hubung", "🔗", kataHubung(true)],
    ["simpulan-1", "Simpulan Bahasa", "📜", simpulan],
    ["pemahaman-1", "Pemahaman", "📖", pemahaman(0, 1)],
    ["dengar-ayat", "Dengar Ayat", "🎧", blend([2, dengarAyat], [1, dengarEja])],
  ],
  4: [
    ["imbuhan-lanjut", "Imbuhan Lanjutan", "🧩", blend([1, imbuhanMen], [1, imbuhanLain])],
    ["kata-majmuk", "Kata Majmuk", "🔗", kataMajmuk],
    ["kata-sendi-2", "Kata Sendi Nama", "📍", kataSendi],
    ["simpulan-2", "Simpulan Bahasa", "📜", simpulan],
    ["peribahasa-1", "Peribahasa", "🦉", peribahasa],
    ["ejaan-2", "Ejaan", "🔤", ejaan],
    ["pemahaman-2", "Pemahaman", "📖", pemahaman(1, 2)],
  ],
  5: [
    ["apitan", "Imbuhan Apitan", "🧩", apitan],
    ["ganda-berentak", "Kata Ganda Berentak", "👯", kataGanda],
    ["perbandingan", "Kata Adjektif Perbandingan", "📏", perbandingan],
    ["peribahasa-2", "Peribahasa", "🦉", peribahasa],
    ["sinonim-antonim", "Sinonim & Antonim", "↔️", blend([1, sinonim], [1, antonim])],
    ["kata-hubung-3", "Kata Hubung", "🔗", kataHubung(true)],
    ["pemahaman-3", "Pemahaman", "📖", pemahaman(2, 3)],
  ],
  6: [
    ["ayat-pasif", "Ayat Aktif & Pasif", "🔄", ayatPasif],
    ["kata-pemeri", "Kata Pemeri (ialah, adalah)", "🟰", pemeri],
    ["apitan-2", "Imbuhan Apitan", "🧩", apitan],
    ["peribahasa-3", "Peribahasa", "🦉", peribahasa],
    ["simpulan-3", "Simpulan Bahasa", "📜", simpulan],
    ["ejaan-3", "Ejaan & Kata Majmuk", "🔤", blend([1, ejaan], [1, kataMajmuk])],
    ["pemahaman-4", "Pemahaman", "📖", pemahaman(3, 2)],
  ],
};
