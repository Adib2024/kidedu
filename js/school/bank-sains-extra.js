// Sains — more questions per chapter (variety). Keyed by chapter id.
//   ask: [soalan, jawapan, [pilihan salah…], emoji?]   tf: [pernyataan, betul?]
// Distractors are clearly wrong on purpose: these are fact checks, not trick questions.
export const SAINS_EXTRA = {
  // ---------------------------------------------------------------- Tahun 1
  "kemahiran-sains": {
    ask: [
      ["Alat yang digunakan untuk melihat benda kecil dengan lebih jelas ialah…", "kanta pembesar", ["pembaris", "termometer", "jam randik"], "🔍"],
      ["Sebelum menyentuh bahan di makmal, kita perlu mendapatkan kebenaran daripada…", "guru", ["kawan", "adik", "pengawal"], "👩‍🏫"],
      ["Jika bahan kimia terkena mata, kita perlu segera…", "membasuh dengan air yang banyak dan memberitahu guru", ["menggosok mata", "menutup mata dan tidur", "meneruskan eksperimen"], "🚿"],
      ["Menyatakan apa yang diperhatikan secara lisan atau bertulis dipanggil…", "berkomunikasi", ["meramal", "mengukur", "mengelas"], "🗣️"],
      ["Membuat kesimpulan awal tentang sesuatu pemerhatian dipanggil…", "membuat inferens", ["mengukur", "mengelas", "memerhati"], "💭"],
      ["Kot makmal dipakai untuk…", "melindungi pakaian dan badan", ["kelihatan cantik", "memanaskan badan", "menyimpan alat"], "🥼"],
      ["Bekas kaca yang retak perlu…", "dilaporkan kepada guru", ["terus digunakan", "disorok", "dibuang ke sinki"], "🧪"],
    ],
    tf: [["Kita mesti membaca arahan sebelum memulakan eksperimen.", true], ["Kita boleh menghidu bahan kimia secara terus dari botol.", false],
      ["Rambut panjang perlu diikat semasa eksperimen dengan api.", true], ["Tumpahan air di lantai makmal boleh dibiarkan sahaja.", false], ["Kita perlu mencuci alatan selepas digunakan.", true]],
  },
  deria: {
    ask: [
      ["Kita dapat merasa kasar atau licin sesuatu permukaan dengan menggunakan…", "kulit", ["telinga", "hidung", "mata"], "🪵"],
      ["Deria yang membantu kita mengenal bau makanan yang basi ialah deria…", "bau", ["sentuh", "dengar", "lihat"], "👃"],
      ["Bahagian lidah membolehkan kita mengesan rasa manis, masin, masam dan…", "pahit", ["lembut", "bising", "terang"], "👅"],
      ["Untuk melindungi mata daripada cahaya matahari yang terik, kita memakai…", "cermin mata hitam", ["sarung tangan", "topi keledar", "kasut"], "🕶️"],
      ["Kita perlu membersihkan telinga dengan…", "berhati-hati menggunakan tuala atau kain lembut", ["pensel", "lidi tajam", "jari yang kotor"], "👂"],
      ["Orang yang tidak dapat melihat membaca menggunakan tulisan…", "Braille", ["Jawi", "Rumi", "Cina"], "⠃"],
      ["Bunyi yang terlalu kuat boleh merosakkan…", "telinga", ["lidah", "kuku", "rambut"], "📢"],
    ],
    tf: [["Kita menggunakan mata untuk melihat warna.", true], ["Hidung digunakan untuk merasa makanan.", false], ["Kulit dapat merasa sakit apabila tercucuk.", true],
      ["Kita boleh melihat terus ke arah matahari dengan selamat.", false], ["Lidah membantu kita merasa rasa masin garam.", true]],
  },
  "haiwan-1": {
    ask: [
      ["Haiwan yang mempunyai enam kaki dipanggil…", "serangga", ["burung", "ikan", "mamalia"], "🐜"],
      ["Bilangan kaki seekor labah-labah ialah…", "8", ["6", "4", "2"], "🕷️"],
      ["Bilangan kaki seekor ayam ialah…", "2", ["4", "6", "8"], "🐔"],
      ["Haiwan yang mempunyai sirip untuk berenang ialah…", "ikan", ["kucing", "ayam", "lembu"], "🐟"],
      ["Burung menggunakan ___ untuk terbang.", "sayap", ["sirip", "ekor sahaja", "paruh"], "🐦"],
      ["Haiwan yang mempunyai belalai ialah…", "gajah", ["zirafah", "harimau", "kuda"], "🐘"],
      ["Siput bergerak dengan cara…", "merayap", ["terbang", "melompat", "berlari"], "🐌"],
      ["Kelawar bergerak dengan cara…", "terbang", ["berenang", "menjalar", "melompat"], "🦇"],
    ],
    tf: [["Ikan bernafas menggunakan insang.", true], ["Ular mempunyai kaki.", false], ["Kucing mempunyai bulu.", true], ["Rama-rama mempunyai enam kaki.", true], ["Katak mempunyai sisik di seluruh badan.", false]],
  },
  "tumbuhan-1": {
    ask: [
      ["Bahagian tumbuhan yang biasanya berwarna hijau ialah…", "daun", ["akar", "buah", "biji"], "🍃"],
      ["Bahagian tumbuhan yang tumbuh di dalam tanah ialah…", "akar", ["daun", "bunga", "buah"], "🌱"],
      ["Biji benih memerlukan air untuk…", "bercambah", ["layu", "berbunga terus", "reput"], "🌱"],
      ["Pokok kelapa mempunyai batang yang…", "tinggi dan tidak bercabang", ["pendek dan menjalar", "lembut seperti rumput", "berduri tajam"], "🌴"],
      ["Tumbuhan yang batangnya menjalar di atas tanah ialah…", "pokok keledek", ["pokok kelapa", "pokok durian", "pokok mangga"], "🍠"],
      ["Bunga matahari mempunyai kelopak berwarna…", "kuning", ["biru", "hitam", "ungu"], "🌻"],
      ["Tumbuhan menghasilkan ___ untuk membiak.", "biji benih", ["batu", "daun kering sahaja", "tanah"], "🫘"],
    ],
    tf: [["Akar menyerap air dari tanah.", true], ["Daun membuat makanan untuk tumbuhan.", true], ["Semua tumbuhan mempunyai bunga berwarna merah.", false], ["Batang membawa air dari akar ke daun.", true], ["Buah tumbuh di dalam tanah pada semua tumbuhan.", false]],
  },
  magnet: {
    ask: [
      ["Kompas menggunakan magnet untuk menunjukkan arah…", "utara dan selatan", ["atas dan bawah", "kiri dan kanan", "depan dan belakang"], "🧭"],
      ["Magnet yang berbentuk seperti batang dipanggil magnet…", "bar", ["ladam", "cincin", "butang"], "🧲"],
      ["Magnet boleh digunakan untuk memisahkan paku besi daripada…", "pasir", ["skru besi", "klip kertas besi", "pin besi"], "🧲"],
      ["Pintu peti sejuk tertutup rapat kerana ada…", "magnet", ["gam", "air", "getah gelang"], "🧊"],
      ["Kekuatan magnet dapat diuji dengan mengira bilangan ___ yang dapat ditarik.", "klip kertas", ["pemadam", "kertas", "kayu"], "📎"],
      ["Jika magnet bar dipotong dua, setiap bahagian akan mempunyai…", "kutub utara dan kutub selatan", ["tiada kutub", "kutub utara sahaja", "kutub selatan sahaja"], "🧲"],
    ],
    tf: [["Kutub utara magnet menarik kutub selatan magnet lain.", true], ["Magnet menarik semua jenis logam termasuk aluminium.", false], ["Magnet boleh menarik objek besi di dalam air.", true], ["Kutub selatan menolak kutub selatan.", true], ["Magnet menarik kertas.", false]],
  },
  "apung-tenggelam": {
    ask: [
      ["Ais terapung di atas air kerana ais ___ daripada air.", "kurang tumpat", ["lebih berat", "lebih panas", "lebih keras"], "🧊"],
      ["Kapal besi boleh terapung kerana bentuknya…", "berongga dan lebar", ["kecil dan padat", "bulat dan pejal", "tajam di semua sisi"], "🚢"],
      ["Jaket keselamatan membantu kita…", "terapung di dalam air", ["tenggelam cepat", "berenang lebih laju di darat", "bernafas dalam air"], "🦺"],
      ["Plastisin berbentuk bola akan tenggelam, tetapi jika dibentuk seperti bot ia akan…", "terapung", ["meletup", "cair", "tenggelam lebih cepat"], "🛶"],
      ["Telur tenggelam dalam air biasa tetapi terapung dalam air yang dicampur banyak…", "garam", ["gula sedikit", "pasir", "minyak"], "🥚"],
    ],
    tf: [["Gabus terapung di atas air.", true], ["Batu terapung di atas air.", false], ["Botol kosong yang tertutup terapung.", true], ["Paku besi terapung di atas air.", false], ["Bentuk objek boleh mempengaruhi sama ada ia terapung atau tenggelam.", true]],
  },
  // ---------------------------------------------------------------- Tahun 2
  "benda-hidup": {
    ask: [
      ["Benda hidup memerlukan ___ untuk bernafas.", "udara", ["plastik", "batu", "pasir"], "💨"],
      ["Tumbuhan bergerak dengan cara…", "daun dan batang menghala ke arah cahaya", ["berlari", "terbang", "melompat"], "🌻"],
      ["Benda hidup akhirnya akan…", "mati", ["berkarat", "mencair", "pecah"]],
      ["Ayam membiak dengan cara…", "bertelur", ["beranak", "bertunas", "berspora"], "🐔"],
      ["Contoh benda bukan hidup ialah…", "meja", ["arnab", "pokok bunga", "ikan"], "🪑"],
      ["Bayi membesar menjadi…", "kanak-kanak", ["anak patung", "robot", "pokok"], "👶"],
      ["Benda hidup bertindak balas terhadap…", "rangsangan seperti cahaya dan sentuhan", ["warna pakaian", "nama", "harga"]],
    ],
    tf: [["Kucing memerlukan makanan untuk hidup.", true], ["Batu boleh membesar seperti tumbuhan.", false], ["Tumbuhan ialah benda hidup.", true], ["Kereta ialah benda hidup kerana ia bergerak.", false], ["Semua benda hidup memerlukan air.", true]],
  },
  gigi: {
    ask: [
      ["Ubat gigi yang mengandungi ___ membantu menguatkan gigi.", "fluorida", ["gula", "garam", "kopi"], "🪥"],
      ["Gigi yang paling belakang di dalam mulut ialah gigi…", "geraham", ["kacip", "taring", "susu"]],
      ["Lapisan paling keras yang melindungi gigi ialah…", "enamel", ["gusi", "lidah", "air liur"], "🦷"],
      ["Gigi berlubang disebabkan oleh…", "bakteria dan sisa makanan manis", ["minum air kosong", "makan sayur", "tidur awal"], "🍭"],
      ["Selepas makan makanan manis, kita patut…", "berkumur dan memberus gigi", ["terus tidur", "makan lagi gula-gula", "minum air bergas"], "🚰"],
      ["Gigi kekal mula tumbuh menggantikan gigi susu pada umur lebih kurang…", "6 tahun", ["1 tahun", "15 tahun", "20 tahun"], "🧒"],
    ],
    tf: [["Kita perlu menukar berus gigi setiap tiga atau empat bulan.", true], ["Gigi susu tidak perlu dijaga kerana akan tercabut.", false], ["Minum susu membantu gigi menjadi kuat.", true], ["Menggigit benda keras seperti pen baik untuk gigi.", false], ["Gigi taring terletak di sebelah gigi kacip.", true]],
  },
  pembiakan: {
    ask: [
      ["Anak katak yang hidup di dalam air dipanggil…", "berudu", ["ulat", "anak ikan", "pupa"], "🐸"],
      ["Peringkat kitar hidup rama-rama yang berada di dalam kepompong ialah…", "pupa", ["telur", "larva", "dewasa"], "🦋"],
      ["Nyamuk bertelur di…", "air bertakung", ["dalam tanah kering", "atas pokok kelapa", "dalam pasir pantai"], "🦟"],
      ["Penyu bertelur di…", "pantai berpasir", ["atas pokok", "dalam gua", "padang rumput"], "🐢"],
      ["Haiwan yang beranak menyusukan anaknya dengan…", "susu", ["madu", "air kelapa", "jus buah"], "🍼"],
      ["Anak kucing dipanggil…", "anak kucing", ["berudu", "ulat", "anak ayam"], "🐱"],
      ["Larva rama-rama juga dikenali sebagai…", "ulat beluncas", ["berudu", "kepompong", "jentik-jentik"], "🐛"],
    ],
    tf: [["Lembu membiak dengan cara beranak.", true], ["Ikan paus bertelur.", false], ["Kitar hidup nyamuk bermula dengan telur.", true], ["Berudu mempunyai ekor.", true], ["Rama-rama dewasa bertelur.", true], ["Kelawar membiak dengan bertelur.", false]],
  },
  "keperluan-tumbuhan": {
    ask: [
      ["Tumbuhan menyerap air melalui…", "akar", ["bunga", "buah", "daun kering"], "🌱"],
      ["Tumbuhan mengambil gas ___ dari udara untuk membuat makanan.", "karbon dioksida", ["oksigen sahaja", "asap", "helium"], "🍃"],
      ["Proses tumbuhan hijau membuat makanan dipanggil…", "fotosintesis", ["pernafasan", "pencernaan", "penyejatan"], "☀️"],
      ["Jika tumbuhan disiram terlalu banyak air, akarnya boleh…", "reput", ["menjadi besi", "berbunga", "terbang"], "💧"],
      ["Tumbuhan di dalam rumah sebaiknya diletakkan berhampiran…", "tingkap", ["peti sejuk", "almari gelap", "bawah katil"], "🪟"],
      ["Baja diberi kepada tumbuhan untuk membekalkan…", "nutrien", ["bunyi", "cahaya", "udara sejuk"], "🧴"],
    ],
    tf: [["Tumbuhan hijau membuat makanan sendiri.", true], ["Tumbuhan membebaskan oksigen ke udara.", true], ["Tumbuhan boleh hidup tanpa udara.", false], ["Cahaya matahari membantu daun kekal hijau.", true], ["Semua tumbuhan perlu disiram dengan air sabun.", false]],
  },
  "cahaya-bayang": {
    ask: [
      ["Bayang-bayang kita paling panjang pada waktu…", "pagi dan petang", ["tengah hari", "tengah malam", "waktu hujan"], "🌅"],
      ["Wayang kulit menggunakan konsep…", "bayang-bayang", ["bunyi", "magnet", "elektrik statik"], "🎭"],
      ["Objek yang membenarkan semua cahaya melaluinya dipanggil objek…", "lut sinar", ["legap", "lut cahaya", "gelap"], "🪟"],
      ["Bayang-bayang terbentuk di sebelah objek yang ___ sumber cahaya.", "bertentangan dengan", ["sama dengan", "di atas", "di dalam"], "🔦"],
      ["Kunang-kunang ialah haiwan yang…", "mengeluarkan cahaya sendiri", ["memantulkan cahaya bulan", "tidak bercahaya", "hidup di dalam air"], "✨"],
      ["Kaca kabur di bilik air membenarkan ___ cahaya melaluinya.", "sebahagian", ["semua", "tiada", "dua kali ganda"], "🚿"],
    ],
    tf: [["Bayang-bayang terbentuk apabila cahaya dihalang.", true], ["Bulan ialah sumber cahaya.", false], ["Lilin ialah sumber cahaya.", true], ["Saiz bayang-bayang boleh berubah.", true], ["Objek lut sinar membentuk bayang-bayang yang paling gelap.", false]],
  },
  "serap-air": {
    ask: [
      ["Bahan yang paling banyak menyerap air ialah…", "span", ["plastik", "kaca", "aluminium"], "🧽"],
      ["Payung dibuat daripada bahan yang…", "kalis air", ["menyerap air", "lut sinar", "mudah koyak"], "☂️"],
      ["Tuala mandi dibuat daripada kain kapas kerana kapas…", "menyerap air dengan baik", ["kalis air", "berkilat", "keras"], "🛁"],
      ["Bekas makanan plastik tidak bocor kerana plastik…", "kalis air", ["menyerap air", "lembut", "lut sinar"], "🥡"],
      ["Kertas tisu digunakan untuk mengelap tangan kerana ia…", "menyerap air", ["kalis air", "berat", "keras"], "🧻"],
    ],
    tf: [["Kain kapas menyerap air.", true], ["Gelas kaca menyerap air.", false], ["Beg plastik kalis air.", true], ["Span kering menjadi lebih berat selepas menyerap air.", true], ["Baju hujan dibuat daripada kertas.", false]],
  },
  // ---------------------------------------------------------------- Tahun 3
  rangka: {
    ask: [
      ["Tulang yang melindungi saraf tunjang ialah tulang…", "belakang", ["rusuk", "tengkorak", "jari"], "🦴"],
      ["Bilangan tulang rusuk manusia ialah ___ pasang.", "12", ["6", "20", "32"], "🫁"],
      ["Sendi pada lutut membolehkan kaki…", "dibengkokkan", ["berputar penuh", "memanjang", "mengecil"], "🦵"],
      ["Makanan yang kaya dengan kalsium untuk tulang yang kuat ialah…", "susu", ["gula-gula", "minuman bergas", "kerepek"], "🥛"],
      ["Haiwan yang mempunyai rangka luar (cangkerang keras) ialah…", "ketam", ["kucing", "ayam", "ikan"], "🦀"],
      ["Rangka manusia dewasa terdiri daripada lebih kurang…", "206 batang tulang", ["50 batang tulang", "1000 batang tulang", "12 batang tulang"], "💀"],
    ],
    tf: [["Tulang rusuk melindungi jantung dan peparu.", true], ["Tengkorak melindungi otak.", true], ["Cacing tanah mempunyai rangka tulang.", false], ["Bersenam membantu menguatkan tulang.", true], ["Tulang belakang terdiri daripada satu tulang panjang sahaja.", false]],
  },
  "kelas-makanan": {
    ask: [
      ["Kelas makanan yang paling banyak terdapat dalam nasi ialah…", "karbohidrat", ["protein", "lemak", "serat"], "🍚"],
      ["Kelas makanan yang terdapat dalam ikan dan telur ialah…", "protein", ["karbohidrat", "lemak", "serat"], "🥚"],
      ["Kekurangan vitamin C boleh menyebabkan penyakit…", "skurvi", ["batuk kering", "selesema burung", "cacar air"], "🍊"],
      ["Sayur-sayuran berdaun hijau kaya dengan…", "vitamin dan serat", ["lemak", "gula", "garam"], "🥬"],
      ["Minum air yang cukup membantu badan…", "mengawal suhu badan", ["menjadi gemuk", "berhenti membesar", "berasa mengantuk"], "💧"],
      ["Kelas makanan yang membantu mencegah sembelit ialah…", "serat", ["lemak", "protein", "gula"], "🌾"],
      ["Sarapan yang seimbang ialah…", "roti bijirin, telur dan buah", ["gula-gula sahaja", "minuman bergas dan kerepek", "air sahaja"], "🍳"],
    ],
    tf: [["Lemak memberi tenaga kepada badan.", true], ["Makan gula-gula setiap masa adalah amalan sihat.", false], ["Protein membantu badan membesar.", true], ["Buah-buahan kaya dengan vitamin.", true], ["Kita tidak perlu minum air jika tidak dahaga langsung sepanjang hari.", false]],
  },
  "makanan-haiwan": {
    ask: [
      ["Haiwan yang makan tumbuhan sahaja ialah…", "kambing", ["harimau", "helang", "buaya"], "🐐"],
      ["Haiwan yang makan daging sahaja ialah…", "harimau", ["arnab", "lembu", "zirafah"], "🐅"],
      ["Ayam makan bijirin dan cacing, jadi ayam ialah…", "omnivor", ["herbivor", "karnivor", "pengeluar"], "🐔"],
      ["Herbivor mempunyai gigi geraham yang leper untuk…", "mengisar tumbuhan", ["mengoyak daging", "memotong tulang", "menghisap darah"], "🐄"],
      ["Makanan utama panda ialah…", "buluh", ["ikan", "daging", "madu"], "🐼"],
      ["Makanan utama lebah ialah…", "nektar bunga", ["daging", "rumput kering", "ikan"], "🐝"],
    ],
    tf: [["Arnab ialah herbivor.", true], ["Singa ialah herbivor.", false], ["Beruang makan ikan dan buah, jadi beruang ialah omnivor.", true], ["Karnivor mempunyai gigi taring yang tajam.", true], ["Kambing makan daging.", false]],
  },
  "asid-alkali": {
    ask: [
      ["Kertas litmus biru bertukar menjadi merah dalam…", "cuka", ["air sabun", "air suling", "ubat gigi"], "🧪"],
      ["Kertas litmus merah bertukar menjadi biru dalam…", "air sabun", ["jus limau", "cuka", "air suling"], "🧪"],
      ["Contoh bahan neutral ialah…", "air suling", ["cuka", "air sabun", "jus limau"], "💧"],
      ["Rasa masam pada buah mangga muda disebabkan oleh…", "asid", ["alkali", "garam", "air"], "🥭"],
      ["Bahan alkali terasa ___ apabila disentuh.", "licin", ["kasar", "melekit", "panas"], "🧼"],
    ],
    tf: [["Jus limau bersifat asid.", true], ["Air sabun bersifat asid.", false], ["Air suling tidak mengubah warna kertas litmus.", true], ["Kita boleh merasa bahan kimia untuk mengenal pasti asid.", false], ["Ubat gigi bersifat alkali.", true]],
  },
  ukuran: {
    ask: [
      ["Unit yang sesuai untuk mengukur jarak antara dua bandar ialah…", "kilometer (km)", ["sentimeter (cm)", "gram (g)", "mililiter (ml)"], "🛣️"],
      ["1 meter bersamaan dengan…", "100 sentimeter", ["10 sentimeter", "1000 sentimeter", "60 sentimeter"], "📏"],
      ["1 kilogram bersamaan dengan…", "1000 gram", ["100 gram", "10 gram", "60 gram"], "⚖️"],
      ["1 liter bersamaan dengan…", "1000 mililiter", ["100 mililiter", "10 mililiter", "60 mililiter"], "🧃"],
      ["Untuk mendapat bacaan yang tepat, mata perlu berada ___ dengan skala.", "sama aras", ["lebih tinggi", "lebih rendah", "jauh"], "👁️"],
      ["Unit yang sesuai untuk mengukur jisim seekor semut ialah…", "miligram (mg)", ["kilogram (kg)", "tan", "liter (l)"], "🐜"],
    ],
    tf: [["Termometer digunakan untuk mengukur suhu.", true], ["Pembaris digunakan untuk mengukur jisim.", false], ["Jam randik digunakan untuk mengukur masa.", true], ["Silinder penyukat digunakan untuk mengukur isi padu cecair.", true], ["Unit suhu ialah kilogram.", false]],
  },
  tanah: {
    ask: [
      ["Tanah yang mengandungi banyak air dan udara sesuai untuk…", "pertumbuhan tumbuhan", ["membina kereta", "membuat kaca", "membuat besi"], "🌱"],
      ["Haiwan yang hidup di dalam tanah dan menggemburkannya ialah…", "cacing tanah", ["ikan", "burung", "kucing"], "🪱"],
      ["Tanah pasir terasa ___ apabila dipegang.", "kasar", ["licin dan melekit", "basah selalu", "panas"], "🏖️"],
      ["Tanah liat terasa ___ apabila basah.", "melekit", ["kasar", "kering", "berpasir"], "🧱"],
      ["Penanaman pokok di lereng bukit membantu mencegah…", "hakisan tanah", ["hujan", "angin", "matahari terbit"], "⛰️"],
    ],
    tf: [["Tanah mengandungi udara.", true], ["Tanah pasir menakung air paling lama.", false], ["Humus menyuburkan tanah.", true], ["Pembalakan haram boleh menyebabkan hakisan tanah.", true], ["Tanah tidak mengandungi sebarang air.", false]],
  },
  // ---------------------------------------------------------------- Tahun 4
  "nafas-kumuh": {
    ask: [
      ["Udara yang kita hembus mengandungi lebih banyak ___ berbanding udara yang kita sedut.", "karbon dioksida", ["oksigen", "nitrogen", "helium"], "💨"],
      ["Semasa kita menarik nafas, dada kita…", "naik dan mengembang", ["turun dan mengecut", "tidak bergerak", "berpusing"], "🫁"],
      ["Organ yang menapis darah untuk menghasilkan air kencing ialah…", "ginjal", ["jantung", "peparu", "perut"]],
      ["Asap rokok merosakkan…", "peparu", ["kuku", "rambut", "gigi susu sahaja"], "🚭"],
      ["Ikan bernafas menggunakan…", "insang", ["peparu", "kulit sahaja", "hidung"], "🐟"],
      ["Serangga bernafas melalui…", "spirakel", ["insang", "peparu", "mulut"], "🐞"],
      ["Bahan kumuh ialah bahan ___ yang perlu dikeluarkan dari badan.", "tidak berguna", ["paling berguna", "makanan", "vitamin"]],
    ],
    tf: [["Kita bernafas lebih cepat selepas berlari.", true], ["Peparu menyingkirkan karbon dioksida.", true], ["Kulit menyingkirkan peluh.", true], ["Merokok baik untuk peparu.", false], ["Katak dewasa bernafas melalui peparu dan kulit.", true]],
  },
  "lindung-haiwan": {
    ask: [
      ["Tenggiling melindungi dirinya dengan cara…", "menggulungkan badan", ["memancutkan dakwat", "terbang tinggi", "menukar warna"], "🦔"],
      ["Gajah melindungi anaknya dengan cara…", "hidup berkumpulan", ["bersembunyi di dalam cangkerang", "memancutkan dakwat", "menukar warna kulit"], "🐘"],
      ["Penguin mempunyai lapisan lemak tebal untuk melindungi diri daripada…", "cuaca sejuk", ["hujan panas", "bunyi bising", "cahaya bulan"], "🐧"],
      ["Unta boleh hidup di padang pasir kerana dapat menyimpan…", "lemak dalam bonggol", ["air dalam sayap", "batu dalam perut", "salji"], "🐫"],
      ["Rusa melindungi dirinya dengan…", "berlari dengan laju", ["menyengat", "memancutkan dakwat", "menggulung badan"], "🦌"],
      ["Belalang mempunyai warna hijau seperti daun untuk…", "menyamar daripada musuh", ["menarik perhatian musuh", "memanaskan badan", "terbang lebih laju"], "🦗"],
    ],
    tf: [["Sotong memancutkan dakwat untuk melarikan diri.", true], ["Kura-kura menyorok di dalam cangkerangnya apabila diancam.", true], ["Sesumpah menukar warna untuk menyamar.", true], ["Landak tidak mempunyai duri.", false], ["Semua haiwan melindungi diri dengan cara yang sama.", false]],
  },
  "tumbuhan-4": {
    ask: [
      ["Biji benih pokok angsana disebarkan oleh angin kerana bijinya…", "bersayap dan ringan", ["berat dan keras", "berduri", "berlendir"], "🍁"],
      ["Buah kelapa dapat terapung kerana mempunyai…", "sabut yang ringan", ["kulit besi", "biji yang banyak", "daging yang berat"], "🥥"],
      ["Burung membantu menyebarkan biji benih apabila…", "memakan buah dan membuang najis di tempat lain", ["membina sarang", "berkicau", "terbang ke laut"], "🐦"],
      ["Pokok bunga raya membiak melalui…", "keratan batang", ["spora", "berudu", "telur"], "🌺"],
      ["Paku pakis membiak melalui…", "spora", ["biji benih", "telur", "keratan akar sahaja"], "🌿"],
      ["Daun kaktus berbentuk duri untuk…", "mengurangkan kehilangan air", ["menarik lebah", "membuat bunyi", "menyerap cahaya bulan"], "🌵"],
    ],
    tf: [["Duri pada durian membantu melindunginya daripada haiwan.", true], ["Semua biji benih disebarkan oleh air.", false], ["Kacang bendi menyebarkan bijinya melalui letupan.", true], ["Biji kekabu disebarkan oleh angin.", true], ["Semalu menguncupkan daunnya apabila disentuh.", true]],
  },
  "sifat-bahan": {
    ask: [
      ["Bahan yang membenarkan arus elektrik mengalir dipanggil…", "konduktor elektrik", ["penebat elektrik", "bahan legap", "bahan kalis air"], "⚡"],
      ["Kayu ialah ___ haba yang baik.", "penebat", ["konduktor", "sumber", "pemantul"], "🪵"],
      ["Bahan yang boleh dilentur dan tidak mudah pecah ialah…", "getah", ["kaca", "seramik", "batu bata"], "🎈"],
      ["Bahan semula jadi yang diperoleh daripada pokok ialah…", "kayu", ["plastik", "kaca", "nilon"], "🌳"],
      ["Contoh bahan buatan manusia ialah…", "plastik", ["kayu", "batu", "kapas"], "🧴"],
      ["Logam akan ___ jika terdedah kepada air dan udara dalam masa yang lama.", "berkarat", ["bertunas", "membiak", "mencair"], "🔩"],
    ],
    tf: [["Kuprum ialah konduktor elektrik.", true], ["Plastik ialah konduktor elektrik yang baik.", false], ["Kaca ialah bahan lut sinar.", true], ["Besi boleh berkarat.", true], ["Getah ialah penebat elektrik.", true]],
  },
  "sistem-suria": {
    ask: [
      ["Pusat Sistem Suria ialah…", "Matahari", ["Bumi", "Bulan", "Marikh"], "☀️"],
      ["Planet yang paling kecil ialah…", "Utarid", ["Musytari", "Zuhal", "Neptun"], "🪐"],
      ["Planet yang mempunyai hidupan ialah…", "Bumi", ["Marikh", "Zuhrah", "Utarid"], "🌍"],
      ["Planet-planet beredar mengelilingi Matahari dalam laluan yang dipanggil…", "orbit", ["galaksi", "buruj", "komet"], "🔄"],
      ["Bintang yang paling hampir dengan Bumi ialah…", "Matahari", ["Bulan", "Marikh", "Bintang Kejora"], "⭐"],
      ["Planet yang kelihatan paling terang di langit dan dikenali sebagai Bintang Kejora ialah…", "Zuhrah", ["Neptun", "Uranus", "Zuhal"], "✨"],
    ],
    tf: [["Bumi ialah planet ketiga dari Matahari.", true], ["Bulan ialah sebuah planet.", false], ["Musytari ialah planet terbesar.", true], ["Matahari beredar mengelilingi Bumi.", false], ["Sistem Suria mempunyai lapan planet.", true]],
  },
  kestabilan: {
    ask: [
      ["Objek yang stabil ialah objek yang…", "tidak mudah tumbang", ["mudah jatuh", "selalu bergerak", "sangat ringan di bawah"], "🧱"],
      ["Untuk menjadikan rak buku lebih stabil, letakkan buku yang berat di bahagian…", "bawah", ["atas", "tepi atas", "luar rak"], "📚"],
      ["Kaki meja yang dibuka lebih luas menjadikan meja itu lebih…", "stabil", ["ringan", "lemah", "tinggi"], "🪑"],
      ["Struktur yang kuat dapat…", "menampung beban yang berat", ["mudah patah", "jatuh sendiri", "hanyut ditiup angin ringan"], "🏗️"],
      ["Bahan binaan yang menjadikan bangunan tinggi lebih kuat ialah…", "keluli dan konkrit", ["kertas", "kain", "plastisin"], "🏢"],
      ["Kerusi berkaki tiga lebih stabil berbanding kerusi berkaki…", "satu", ["empat", "lima", "enam"], "🪑"],
    ],
    tf: [["Tapak yang lebar menjadikan objek lebih stabil.", true], ["Objek yang tinggi dan sempit lebih stabil.", false], ["Bentuk segi tiga menjadikan struktur lebih kuat.", true], ["Meletakkan beban berat di atas menjadikan objek lebih stabil.", false], ["Kekuatan struktur bergantung pada bahan dan bentuknya.", true]],
  },
  // ---------------------------------------------------------------- Tahun 5
  "rantai-makanan": {
    ask: [
      ["Dalam rantai makanan, tumbuhan hijau dikenali sebagai…", "pengeluar", ["pengguna", "pemangsa", "pengurai"], "🌿"],
      ["Haiwan yang makan tumbuhan dalam rantai makanan dipanggil…", "pengguna primer", ["pengeluar", "pengurai", "pengguna tertier sahaja"], "🐛"],
      ["Kulat dan bakteria yang mereputkan benda mati dipanggil…", "pengurai", ["pengeluar", "pemangsa", "mangsa"], "🍄"],
      ["Anak panah dalam rantai makanan menunjukkan arah…", "aliran tenaga dari yang dimakan kepada yang memakan", ["haiwan berlari", "angin bertiup", "air mengalir"], "➡️"],
      ["Jika semua tumbuhan musnah, haiwan herbivor akan…", "kekurangan makanan", ["bertambah banyak", "menjadi karnivor", "tidak terjejas"], "🌾"],
    ],
    tf: [["Setiap rantai makanan bermula dengan pengeluar.", true], ["Harimau ialah pengeluar.", false], ["Satu haiwan boleh berada dalam lebih daripada satu rantai makanan.", true], ["Pengurai membantu memulangkan nutrien ke dalam tanah.", true], ["Siratan makanan terdiri daripada satu rantai makanan sahaja.", false]],
  },
  elektrik: {
    ask: [
      ["Simbol yang digunakan untuk mewakili komponen dalam lukisan litar dipanggil…", "simbol litar", ["peta minda", "graf", "jadual"], "✏️"],
      ["Alat yang menukar tenaga elektrik kepada tenaga cahaya ialah…", "mentol", ["kipas", "pembesar suara", "seterika"], "💡"],
      ["Alat yang menukar tenaga elektrik kepada tenaga bunyi ialah…", "loceng elektrik", ["mentol", "kipas", "periuk nasi"], "🔔"],
      ["Sumber tenaga elektrik yang boleh diperbaharui ialah…", "tenaga angin", ["arang batu", "petroleum", "gas asli"], "🌬️"],
      ["Alat yang menukar tenaga elektrik kepada tenaga haba ialah…", "seterika", ["lampu suluh", "radio", "kipas"], "🔥"],
      ["Untuk menjimatkan elektrik, kita patut…", "menutup suis apabila tidak digunakan", ["membuka semua lampu", "membiarkan TV hidup", "membuka peti sejuk lama"], "💡"],
    ],
    tf: [["Sel kering ialah sumber tenaga elektrik.", true], ["Kayu ialah konduktor elektrik.", false], ["Suis yang dibuka memutuskan litar.", true], ["Kita boleh bermain layang-layang berhampiran wayar elektrik.", false], ["Litar selari membolehkan mentol lain terus menyala jika satu rosak.", true]],
  },
  haba: {
    ask: [
      ["Air sejuk yang dibiarkan di dalam bilik akan ___ suhunya sehingga sama dengan suhu bilik.", "naik", ["turun", "kekal", "menjadi sifar"], "🥛"],
      ["Cecair dalam termometer ___ apabila suhu meningkat.", "naik", ["turun", "membeku", "hilang"], "🌡️"],
      ["Logam yang dipanaskan akan…", "mengembang", ["menguncup", "hilang", "menjadi kayu"], "🔩"],
      ["Botol kaca yang tertutup ketat dibuka dengan merendam penutup logamnya di dalam air panas kerana penutup itu akan…", "mengembang", ["menguncup", "berkarat", "cair"], "🫙"],
      ["Belon yang diletakkan di bawah matahari panas akan…", "mengembang", ["mengecil", "membeku", "tenggelam"], "🎈"],
      ["Suhu air yang sedang mendidih di aras laut ialah lebih kurang…", "100 °C", ["50 °C", "0 °C", "37 °C"], "♨️"],
    ],
    tf: [["Haba ialah satu bentuk tenaga.", true], ["Suhu diukur dalam unit kilogram.", false], ["Objek menjadi lebih sejuk apabila kehilangan haba.", true], ["Termometer klinik digunakan untuk mengukur suhu badan.", true], ["Ais menyerap haba ketika melebur.", true]],
  },
  "keadaan-jirim": {
    ask: [
      ["Contoh pepejal ialah…", "batu", ["air", "udara", "minyak"], "🪨"],
      ["Contoh cecair ialah…", "susu", ["kayu", "oksigen", "gula batu"], "🥛"],
      ["Contoh gas ialah…", "wap air", ["ais", "pasir", "besi"], "♨️"],
      ["Proses air bertukar menjadi wap pada sebarang suhu dipanggil…", "penyejatan", ["pembekuan", "kondensasi", "peleburan"], "💨"],
      ["Awan terbentuk apabila wap air di udara mengalami…", "kondensasi", ["peleburan", "pembekuan", "pemejalwapan"], "☁️"],
      ["Coklat cair apabila dipegang lama kerana proses…", "peleburan", ["pembekuan", "kondensasi", "penyejatan"], "🍫"],
    ],
    tf: [["Air boleh wujud dalam tiga keadaan.", true], ["Gas mempunyai bentuk yang tetap.", false], ["Pepejal mempunyai isi padu yang tetap.", true], ["Pembekuan ialah perubahan cecair kepada pepejal.", true], ["Penyejatan berlaku lebih cepat pada hari yang panas dan berangin.", true]],
  },
  "bumi-bulan": {
    ask: [
      ["Bumi berputar pada paksinya dari arah…", "barat ke timur", ["timur ke barat", "utara ke selatan", "selatan ke utara"], "🌍"],
      ["Bulan tidak mengeluarkan cahaya sendiri tetapi…", "memantulkan cahaya Matahari", ["menyerap cahaya Bumi", "menyala seperti lampu", "terbakar"], "🌕"],
      ["Permukaan Bulan dipenuhi dengan…", "kawah", ["lautan", "hutan", "sungai"], "🌑"],
      ["Fasa bulan yang kelihatan bulat penuh dipanggil…", "purnama", ["anak bulan", "sabit", "separa"], "🌕"],
      ["Angkasawan pertama yang menjejakkan kaki di Bulan ialah…", "Neil Armstrong", ["Datuk Dr. Sheikh Muszaphar", "Yuri Gagarin", "Isaac Newton"], "👨‍🚀"],
    ],
    tf: [["Kejadian siang dan malam berlaku kerana Bumi berputar pada paksinya.", true], ["Bulan beredar mengelilingi Matahari sahaja, bukan Bumi.", false], ["Bulan tidak mempunyai udara untuk bernafas.", true], ["Matahari terbit di sebelah barat.", false], ["Bentuk Bulan kelihatan berubah-ubah setiap malam.", true]],
  },
  cahaya: {
    ask: [
      ["Cermin di simpang jalan yang berbengkok membantu pemandu…", "melihat kenderaan di sebalik selekoh", ["memandu lebih laju", "menyalakan lampu", "mendengar hon"], "🚦"],
      ["Sudu yang berkilat dapat ___ cahaya.", "memantulkan", ["menyerap sepenuhnya", "menghasilkan", "memadamkan"], "🥄"],
      ["Kanta pembesar membantu kita melihat objek kecil kerana kanta itu…", "membiaskan cahaya", ["memantulkan bunyi", "menghasilkan cahaya", "menyerap haba"], "🔍"],
      ["Warna pelangi yang paling atas ialah…", "merah", ["ungu", "biru", "hijau"], "🌈"],
      ["Cahaya bergerak paling laju di dalam…", "vakum (ruang kosong)", ["air", "kaca", "minyak"], "✨"],
    ],
    tf: [["Cahaya dapat dipantulkan oleh cermin.", true], ["Cahaya bergerak dalam garis bengkok.", false], ["Pembiasan berlaku apabila cahaya melalui air.", true], ["Periskop menggunakan cermin.", true], ["Objek legap membenarkan cahaya melaluinya.", false]],
  },
  // ---------------------------------------------------------------- Tahun 6
  mikroorganisma: {
    ask: [
      ["Mikroorganisma yang digunakan untuk menghasilkan tapai ialah…", "yis", ["virus", "alga", "protozoa"], "🍚"],
      ["Penyakit kolera disebabkan oleh…", "bakteria", ["virus", "kulat", "alga"], "🦠"],
      ["Kurap ialah penyakit kulit yang disebabkan oleh…", "kulat", ["bakteria", "virus", "protozoa"], "🍄"],
      ["Mikroorganisma yang menjalankan fotosintesis ialah…", "alga", ["virus", "kulat", "yis"], "🌊"],
      ["Untuk mengelakkan penyebaran kuman semasa batuk, kita patut…", "menutup mulut dengan tisu atau siku", ["batuk ke arah kawan", "tidak mencuci tangan", "berkongsi cawan"], "🤧"],
      ["Makanan disimpan di dalam peti sejuk untuk…", "melambatkan pertumbuhan mikroorganisma", ["mempercepatkan pereputan", "menambah rasa manis", "menjadikannya panas"], "🧊"],
      ["Proses pembuatan kicap menggunakan…", "kulat", ["virus", "alga", "protozoa"], "🫙"],
    ],
    tf: [["Mikroorganisma boleh membiak dengan cepat.", true], ["Semua bakteria menyebabkan penyakit.", false], ["Vaksin membantu badan melawan penyakit.", true], ["Mikroorganisma membantu mereputkan daun yang mati.", true], ["Virus boleh hidup dan membiak tanpa sel hidup lain.", false]],
  },
  interaksi: {
    ask: [
      ["Hubungan antara lebah dengan bunga, di mana kedua-duanya mendapat faedah, dipanggil…", "mutualisme", ["persaingan", "parasitisme", "pemangsaan"], "🐝"],
      ["Kutu yang menghisap darah kucing ialah contoh…", "parasitisme", ["mutualisme", "komensalisme", "persaingan"], "🐈"],
      ["Burung yang membuat sarang di atas pokok tanpa merosakkan pokok ialah contoh…", "komensalisme", ["parasitisme", "persaingan", "pemangsaan"], "🪺"],
      ["Haiwan yang hidup berkumpulan seperti semut melakukan…", "interaksi secara bekerjasama", ["persaingan sahaja", "hibernasi", "migrasi ke Bulan"], "🐜"],
      ["Rumpai di sawah padi bersaing dengan pokok padi untuk mendapatkan…", "nutrien, air dan cahaya", ["bunyi", "angin sejuk", "tanah liat sahaja"], "🌾"],
    ],
    tf: [["Pemangsa memburu haiwan lain sebagai makanan.", true], ["Persaingan berlaku apabila sumber terhad.", true], ["Tumbuhan tidak pernah bersaing.", false], ["Lebah membantu pendebungaan bunga.", true], ["Parasit memberi manfaat kepada perumahnya.", false]],
  },
  daya: {
    ask: [
      ["Daya tolakan digunakan apabila kita…", "menolak troli", ["menarik laci", "mengangkat beg", "menarik tali"], "🛒"],
      ["Daya tarikan digunakan apabila kita…", "membuka laci", ["menolak pintu", "menendang bola", "menekan suis"], "🗄️"],
      ["Kesan daya apabila kita memijak tin kosong ialah…", "bentuk tin berubah", ["warna tin berubah", "tin menjadi berat", "tin menjadi panas"], "🥫"],
      ["Bebola galas (ball bearing) digunakan dalam roda untuk…", "mengurangkan geseran", ["menambah geseran", "menambah berat", "memanaskan roda"], "⚙️"],
      ["Unit bagi daya ialah…", "newton (N)", ["kilogram (kg)", "meter (m)", "saat (s)"], "💪"],
      ["Kasut sukan mempunyai tapak bergerigi untuk…", "menambah geseran supaya tidak tergelincir", ["mengurangkan geseran", "menjadikannya ringan", "menjadikannya berkilat"], "👟"],
    ],
    tf: [["Daya boleh mengubah arah gerakan bola.", true], ["Geseran sentiasa tidak berguna.", false], ["Permukaan kasar menghasilkan geseran yang lebih tinggi.", true], ["Graviti menyebabkan buah jatuh ke tanah.", true], ["Daya boleh dilihat dengan mata kasar.", false]],
  },
  "gerhana-buruj": {
    ask: [
      ["Semasa gerhana matahari penuh, langit pada waktu siang menjadi…", "gelap seketika", ["lebih terang", "berwarna hijau", "berkilat"], "🌑"],
      ["Gerhana matahari hanya berlaku semasa fasa…", "anak bulan", ["purnama", "separa", "hampir purnama"], "🌘"],
      ["Buruj Pari kelihatan seperti bentuk…", "salib atau layang-layang", ["ikan paus", "beruang", "gajah"], "✨"],
      ["Buruj Biduk kelihatan seperti bentuk…", "senduk atau gayung", ["bulatan penuh", "segi empat sama", "bintang tunggal"], "🥄"],
      ["Gerhana bulan berlaku pada waktu…", "malam", ["tengah hari", "pagi sahaja", "petang sahaja"], "🌕"],
    ],
    tf: [["Gerhana berlaku apabila Matahari, Bumi dan Bulan berada dalam satu garis lurus.", true], ["Gerhana bulan berlaku semasa anak bulan.", false], ["Buruj ialah kumpulan bintang yang membentuk corak.", true], ["Gerhana matahari selamat dilihat terus tanpa pelindung.", false], ["Nelayan dahulu menggunakan buruj untuk menentukan arah.", true]],
  },
  pemuliharaan: {
    ask: [
      ["Penggunaan semula botol plastik sebagai pasu bunga ialah contoh amalan…", "guna semula", ["pembakaran", "pembaziran", "pencemaran"], "🪴"],
      ["Membawa beg sendiri semasa membeli-belah membantu…", "mengurangkan penggunaan beg plastik", ["menambah sampah", "mencemarkan sungai", "membazir wang"], "🛍️"],
      ["Penebangan hutan secara berleluasa boleh menyebabkan…", "kepupusan haiwan dan tumbuhan", ["hutan bertambah", "udara lebih bersih", "haiwan bertambah"], "🪓"],
      ["Air sungai yang tercemar boleh menyebabkan…", "ikan mati", ["ikan bertambah", "air lebih bersih", "sungai lebih dalam"], "🐟"],
      ["Contoh sumber tenaga yang tidak mencemarkan udara ialah…", "tenaga suria", ["arang batu", "minyak diesel", "kayu api"], "☀️"],
      ["Kertas lama boleh dikitar semula untuk menghasilkan…", "kertas baharu", ["kaca", "besi", "plastik"], "📄"],
    ],
    tf: [["Menutup paip air ketika memberus gigi menjimatkan air.", true], ["Membuang sampah ke dalam longkang adalah betul.", false], ["Menanam pokok membantu mengurangkan pencemaran udara.", true], ["Kitar semula mengurangkan sampah di tapak pelupusan.", true], ["Membakar plastik secara terbuka tidak mencemarkan udara.", false]],
  },
};
