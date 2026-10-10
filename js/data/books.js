// Buku Cerita — original short stories in Bahasa Melayu.
// Each page: [art (emoji scene), background, text]. Ends with a moral + 3 comprehension questions.

const P = (art, bg, text) => ({ art, bg, text });

export const BOOKS = [
  {
    id: "payung-pelangi", title: "Pipi Panda dan Payung Pelangi", emoji: "🐼☂️", color: "#ddd6fe",
    pages: [
      P("🐼🌧️", "#e0e7ff", "Di sebuah hutan buluh, tinggal seekor panda kecil bernama Pipi. Pipi sangat suka bermain di luar."),
      P("☂️🌈", "#fce7f3", "Suatu hari, nenek menghadiahkan Pipi sebuah payung berwarna pelangi. \"Jaga baik-baik ya, Pipi,\" pesan nenek."),
      P("🌧️🐰💧", "#dbeafe", "Petang itu hujan turun dengan lebat. Pipi ternampak Arnab Kecil menggigil kesejukan di bawah sehelai daun."),
      P("🐼☂️🐰", "#ede9fe", "\"Mari berteduh bersama saya!\" ajak Pipi. Arnab Kecil tersenyum lalu berjalan rapat di bawah payung pelangi."),
      P("🐢🐼🐰☂️", "#e0f2fe", "Tidak lama kemudian, mereka berjumpa Kura-kura. Pipi mengangkat payungnya tinggi-tinggi supaya Kura-kura juga boleh berteduh."),
      P("🌈☀️🐼🐰🐢", "#fef9c3", "Apabila hujan berhenti, sebuah pelangi besar muncul di langit. \"Cantiknya! Sama macam payung Pipi!\" jerit Arnab Kecil."),
      P("👵🐼💖", "#ffe4e6", "Pipi pulang dan bercerita kepada nenek. Nenek memeluk Pipi. \"Payung itu lebih cantik apabila dikongsi,\" kata nenek."),
    ],
    moral: "Berkongsi dan menolong kawan membuatkan hati semua orang gembira.",
    quiz: [
      ["Siapakah yang memberi payung kepada Pipi?", "Nenek", ["Arnab", "Kura-kura", "Cikgu"]],
      ["Apakah warna payung Pipi?", "Pelangi", ["Hitam", "Merah sahaja", "Putih"]],
      ["Apa yang Pipi lakukan apabila nampak Arnab kesejukan?", "Ajak berteduh bersama", ["Lari pulang", "Ketawa", "Tidur"]],
    ],
  },
  {
    id: "roti-takut-gelap", title: "Roti Kecil yang Takut Gelap", emoji: "🍞🌙", color: "#fde68a",
    pages: [
      P("🍞🏪", "#fef3c7", "Di sebuah kedai roti, ada seketul roti kecil bernama Roti Bulat. Dia suka melihat lampu kedai yang terang."),
      P("🌙🏪🌑", "#1e293b", "Apabila kedai ditutup pada waktu malam, semua lampu dipadam. \"Saya takut gelap!\" bisik Roti Bulat."),
      P("🥐😊", "#fde68a", "Croissant di sebelahnya berkata, \"Jangan takut. Dalam gelap pun, kita masih bersama-sama.\""),
      P("🌙✨🪟", "#312e81", "Croissant menunjukkan tingkap. Di luar, bulan dan bintang bersinar lembut. \"Tengok, malam pun ada cahaya!\""),
      P("🍞🥐🥯🧁", "#c7d2fe", "Roti-roti lain pun mula bercerita dan menyanyi perlahan. Roti Bulat tidak berasa sunyi lagi."),
      P("😴🍞💤", "#a5b4fc", "Sambil mengira bintang, Roti Bulat pun tertidur dengan tenang."),
      P("☀️🍞😄", "#fef9c3", "Pagi esoknya, Roti Bulat bangun dengan gembira. \"Malam tadi tidak menakutkan pun!\" katanya sambil tersenyum."),
    ],
    moral: "Kita boleh menjadi berani apabila bercerita tentang perasaan kita dengan kawan dan keluarga.",
    quiz: [
      ["Roti Bulat takut akan apa?", "Gelap", ["Air", "Kucing", "Hujan"]],
      ["Siapa yang menenangkan Roti Bulat?", "Croissant", ["Pembuat roti", "Tikus", "Bulan"]],
      ["Apa yang bersinar di luar tingkap?", "Bulan dan bintang", ["Matahari", "Lampu kereta", "Pelangi"]],
    ],
  },
  {
    id: "kereta-api-bulan", title: "Kereta Api Gula-gula ke Bulan", emoji: "🚂🌙", color: "#fbcfe8",
    pages: [
      P("🛏️👧🌙", "#312e81", "Sebelum tidur, Sara memandang bulan dari tingkap. \"Alangkah seronok jika dapat ke sana,\" katanya."),
      P("🚂🍬✨", "#f9a8d4", "Tiba-tiba, sebuah kereta api diperbuat daripada gula-gula berhenti di luar tingkap! \"Tut tut! Naiklah!\""),
      P("🚂☁️☁️", "#bfdbfe", "Kereta api itu meluncur di atas awan. Setiap gerabak berwarna-warni seperti lolipop."),
      P("⭐🚂⭐", "#1e1b4b", "Mereka melalui Stesen Bintang. Bintang-bintang kecil melambai dan berkata, \"Jangan lupa gosok gigi!\""),
      P("🌙🐇🍰", "#e9d5ff", "Di Bulan, Sara berjumpa Arnab Bulan yang sedang membuat kek. \"Mari bantu saya,\" kata arnab itu."),
      P("👧🐇🎂", "#fce7f3", "Sara menolong menghias kek dengan taburan bintang. Mereka ketawa bersama-sama."),
      P("🛏️😴🌙", "#4c1d95", "\"Sudah tiba masa pulang,\" kata Konduktor. Sara kembali ke katil dan tidur dengan senyuman. Mimpi yang indah!"),
    ],
    moral: "Imaginasi membawa kita ke tempat yang menakjubkan — dan tidur yang cukup itu penting!",
    quiz: [
      ["Kereta api itu diperbuat daripada apa?", "Gula-gula", ["Kayu", "Batu", "Kertas"]],
      ["Siapa yang Sara jumpa di Bulan?", "Arnab Bulan", ["Kucing", "Gajah", "Ikan"]],
      ["Apa pesanan bintang-bintang?", "Jangan lupa gosok gigi", ["Jangan tidur", "Makan gula-gula", "Main sampai lewat"]],
    ],
  },
  {
    id: "siput-laju", title: "Siput dalam Pertandingan Lari", emoji: "🐌🏁", color: "#bbf7d0",
    pages: [
      P("🐌🌿", "#dcfce7", "Sami si Siput tinggal di sebuah taman. Dia bergerak sangat perlahan, tetapi dia tidak pernah berputus asa."),
      P("📢🏁🐇🐿️", "#fef9c3", "Satu hari, ada pengumuman: \"Pertandingan lari di taman esok!\" Semua haiwan teruja."),
      P("🐇😆🐌", "#fee2e2", "\"Siput mahu masuk? Pasti kalah!\" ejek Arnab. Sami cuma tersenyum. \"Saya mahu cuba yang terbaik.\""),
      P("🏁🐇💨🐿️💨🐌", "#e0f2fe", "Perlumbaan bermula! Arnab dan Tupai berlari laju. Sami bergerak perlahan-lahan, setapak demi setapak."),
      P("🐇🍓😋", "#fce7f3", "Di tengah jalan, Arnab berhenti makan strawberi. Tupai pula sibuk mengumpul kacang."),
      P("🐌🏁", "#fef3c7", "Sami terus bergerak tanpa berhenti. Semua haiwan bersorak, \"Sami! Sami! Sami!\""),
      P("🐌🏅🎉", "#dcfce7", "Akhirnya Sami melintasi garisan penamat! Arnab berasa malu dan meminta maaf. Mereka menjadi kawan baik."),
    ],
    moral: "Jangan mengejek orang lain. Usaha yang berterusan membawa kejayaan.",
    quiz: [
      ["Siapakah watak utama cerita ini?", "Sami si Siput", ["Arnab", "Tupai", "Kura-kura"]],
      ["Mengapa Arnab berhenti?", "Makan strawberi", ["Tidur", "Sakit kaki", "Hujan"]],
      ["Apa yang Arnab lakukan pada akhir cerita?", "Meminta maaf", ["Marah", "Lari pulang", "Menangis"]],
    ],
  },
  {
    id: "aina-kuih-raya", title: "Aina dan Kuih Bahulu Nenek", emoji: "🧕🍪", color: "#fed7aa",
    pages: [
      P("🏡🌴🌙", "#fef3c7", "Hari Raya hampir tiba. Aina pulang ke kampung untuk berjumpa Nenek."),
      P("👵🥚🍯", "#ffedd5", "\"Jom kita buat kuih bahulu,\" ajak Nenek. Aina sangat teruja kerana itu kuih kegemarannya."),
      P("🥣🥚🧈", "#fde68a", "Aina memecahkan telur dan Nenek memukul adunan. \"Sabar ya, adunan mesti kembang dulu,\" kata Nenek."),
      P("🔥⏳👧", "#fed7aa", "Aina tidak sabar. Dia mahu cepat-cepat makan! Tetapi Nenek mengajarnya menunggu dengan tenang."),
      P("🍪✨😋", "#fef3c7", "Akhirnya kuih bahulu siap — gebu, wangi dan keemasan. \"Wah, sedapnya!\" kata Aina."),
      P("🍪🏠👨‍👩‍👧", "#ffe4e6", "Aina membawa sepiring kuih kepada jiran-jiran. Mereka berterima kasih dan tersenyum gembira."),
      P("🌙🕌🤲", "#e0e7ff", "Pada pagi raya, Aina memohon maaf kepada Nenek. \"Terima kasih ajar Aina erti sabar dan berkongsi.\""),
    ],
    moral: "Kesabaran menghasilkan sesuatu yang manis, dan berkongsi mengeratkan silaturahim.",
    quiz: [
      ["Kuih apa yang dibuat oleh Aina dan Nenek?", "Kuih bahulu", ["Kek coklat", "Biskut", "Roti"]],
      ["Apa yang Nenek ajar kepada Aina?", "Sabar", ["Cepat-cepat", "Marah", "Tidur"]],
      ["Kepada siapa Aina berikan kuih?", "Jiran-jiran", ["Kucing", "Cikgu", "Tiada sesiapa"]],
    ],
  },
  {
    id: "pokok-rambutan", title: "Pokok Rambutan yang Pemurah", emoji: "🌳🔴", color: "#fecaca",
    pages: [
      P("🌳🔴🔴", "#dcfce7", "Di tepi sekolah, ada sebatang pokok rambutan yang tinggi. Buahnya merah dan manis."),
      P("🧒👧🌳", "#fef9c3", "Setiap hari, murid-murid berteduh di bawah pokok itu. Pokok rambutan berasa sangat gembira."),
      P("🐦🌳🪺", "#e0f2fe", "Burung-burung membina sarang di dahannya. Tupai pula bermain di batangnya."),
      P("🗑️😟🌳", "#f1f5f9", "Satu hari, ada orang membuang sampah di bawah pokok itu. Pokok rambutan berasa sedih."),
      P("🧒🧤🗑️", "#dcfce7", "Danish dan kawan-kawan ternampak sampah itu. \"Jom kita bersihkan!\" kata Danish."),
      P("🌳💧🧒👧", "#bbf7d0", "Mereka mengutip sampah dan menyiram pokok. Mereka juga membuat papan tanda: \"Sayangi Pokok Kita\"."),
      P("🌳🔴🎉", "#fee2e2", "Musim buah tiba. Pokok rambutan berbuah lebat sekali! Semua orang dapat merasa rambutan yang manis."),
    ],
    moral: "Jagalah alam sekitar kerana alam juga menjaga kita.",
    quiz: [
      ["Di manakah pokok rambutan itu?", "Tepi sekolah", ["Dalam rumah", "Di laut", "Di bulan"]],
      ["Mengapa pokok rambutan sedih?", "Ada orang buang sampah", ["Hujan", "Tiada burung", "Daun gugur"]],
      ["Siapa yang membersihkan sampah?", "Danish dan kawan-kawan", ["Burung", "Tupai", "Tiada sesiapa"]],
    ],
  },
  {
    id: "bintang-jatuh", title: "Bintang Kecil yang Jatuh ke Kampung", emoji: "⭐🏡", color: "#c7d2fe",
    pages: [
      P("🌌⭐", "#1e1b4b", "Di langit malam, ada sebutir bintang kecil bernama Kilau. Dia suka mengintai kampung di bawah."),
      P("💫⬇️🌾", "#312e81", "Suatu malam, Kilau terlalu teruja dan... wusss! Dia tergelincir lalu jatuh ke sawah padi."),
      P("⭐😢🐸", "#14532d", "\"Bagaimana saya mahu pulang?\" tangis Kilau. Seekor katak terdengar tangisannya."),
      P("🐸🦉🐛", "#166534", "Katak memanggil Burung Hantu dan Kunang-kunang. \"Kita mesti tolong Kilau!\""),
      P("✨✨✨⭐", "#052e16", "Kunang-kunang menyalakan cahaya mereka, membuat satu laluan bercahaya ke puncak bukit."),
      P("🦉⭐⬆️🌌", "#1e3a8a", "Dari puncak bukit, Burung Hantu terbang tinggi membawa Kilau kembali ke langit."),
      P("⭐💖🏡", "#312e81", "Sejak itu, setiap malam Kilau bersinar paling terang di atas kampung — sebagai tanda terima kasih."),
    ],
    moral: "Apabila kita bekerjasama, masalah yang besar menjadi kecil.",
    quiz: [
      ["Apakah nama bintang kecil itu?", "Kilau", ["Sinar", "Cahaya", "Bulan"]],
      ["Di manakah Kilau jatuh?", "Sawah padi", ["Laut", "Sekolah", "Pasar"]],
      ["Siapa yang membawa Kilau kembali ke langit?", "Burung Hantu", ["Katak", "Kucing", "Ayam"]],
    ],
  },
  {
    id: "oyen-berkongsi", title: "Oyen Belajar Berkongsi", emoji: "🐱🧶", color: "#fdba74",
    pages: [
      P("🐱🧶", "#ffedd5", "Oyen ialah kucing oren yang comel. Dia mempunyai bola benang merah kegemarannya."),
      P("🐱😾🧶🐈‍⬛", "#fee2e2", "Apabila Si Hitam mahu bermain bersama, Oyen memeluk bola benangnya. \"Ini saya punya!\""),
      P("🐈‍⬛😿", "#e5e7eb", "Si Hitam pergi dengan sedih. Oyen bermain seorang diri, tetapi dia rasa bosan."),
      P("🐱🤔", "#fef3c7", "\"Kenapa main seorang tak seronok?\" fikir Oyen. Dia teringat wajah sedih Si Hitam."),
      P("🐱🧶➡️🐈‍⬛", "#dcfce7", "Oyen mencari Si Hitam. \"Maaf ya. Mari kita main bersama-sama!\""),
      P("🐱🐈‍⬛🧶😸", "#fef9c3", "Mereka bergilir-gilir menolak bola benang. Mereka berlari, melompat dan ketawa."),
      P("🐱💤🐈‍⬛", "#ede9fe", "Petang itu, mereka tidur bersebelahan. Oyen sedar, bermain bersama kawan lebih seronok!"),
    ],
    moral: "Berkongsi menjadikan permainan lebih seronok dan kita mendapat kawan.",
    quiz: [
      ["Apakah mainan kegemaran Oyen?", "Bola benang", ["Kereta", "Anak patung", "Bola sepak"]],
      ["Bagaimana perasaan Oyen bermain seorang diri?", "Bosan", ["Sangat gembira", "Lapar", "Mengantuk"]],
      ["Apa yang Oyen katakan kepada Si Hitam?", "Maaf, mari main bersama", ["Pergi jauh", "Ini saya punya", "Selamat tinggal"]],
    ],
  },
  {
    id: "awan-kecil", title: "Si Awan Kecil Mencari Kawan", emoji: "☁️🤝", color: "#bae6fd",
    pages: [
      P("☁️", "#e0f2fe", "Di langit biru, ada sekepul awan kecil bernama Gebu. Gebu berasa sunyi kerana tiada kawan."),
      P("☁️➡️☀️", "#fef9c3", "Gebu terbang menemui Matahari. \"Boleh kita berkawan?\" Matahari tersenyum, \"Tentu! Tetapi saya sibuk menerangi dunia.\""),
      P("☁️➡️🌬️", "#f1f5f9", "Kemudian Gebu berjumpa Angin. Angin meniupnya ke sana sini. \"Jom main kejar-kejar!\""),
      P("☁️☁️☁️", "#dbeafe", "Angin membawa Gebu bertemu awan-awan lain. \"Hai! Sertailah kami,\" kata mereka."),
      P("🌧️🌱", "#bfdbfe", "Bersama-sama, mereka menurunkan hujan untuk tanaman di bawah. Pokok-pokok bersorak gembira."),
      P("🌈☁️😊", "#fce7f3", "Selepas hujan, Matahari muncul semula dan terciptalah pelangi. Gebu ketawa riang."),
      P("☁️💖☁️", "#e0f2fe", "Gebu tidak sunyi lagi. Dia belajar bahawa kawan boleh ditemui jika kita berani menegur."),
    ],
    moral: "Beranilah menegur dan berkawan — semua orang perlukan kawan.",
    quiz: [
      ["Apakah nama awan kecil itu?", "Gebu", ["Putih", "Kapas", "Comel"]],
      ["Siapa yang membawa Gebu bertemu awan lain?", "Angin", ["Bulan", "Burung", "Kapal terbang"]],
      ["Apa yang muncul selepas hujan?", "Pelangi", ["Salji", "Bintang", "Ribut"]],
    ],
  },
  {
    id: "rama-rama-biru", title: "Hani dan Rama-rama Biru", emoji: "👧🦋", color: "#a5f3fc",
    pages: [
      P("👧🌸🏡", "#fce7f3", "Hani suka bermain di taman bunga nenek. Suatu pagi, dia ternampak seekor rama-rama biru yang cantik."),
      P("🦋💙", "#dbeafe", "\"Saya mahu tangkap rama-rama itu dan simpan dalam balang!\" fikir Hani."),
      P("👧🫙🦋", "#e0f2fe", "Hani berjaya menangkapnya. Tetapi rama-rama itu tidak lagi terbang dengan riang. Sayapnya terkulai."),
      P("👵🦋", "#fef3c7", "Nenek berkata lembut, \"Rama-rama perlukan bunga dan langit untuk hidup, sayang.\""),
      P("👧🫙➡️🌸", "#dcfce7", "Hani berfikir sejenak, lalu membuka penutup balang itu perlahan-lahan."),
      P("🦋🌸🌼🌺", "#fae8ff", "Rama-rama biru terbang tinggi, menari di antara bunga. Hani berasa gembira melihatnya bebas."),
      P("🦋🦋🦋👧", "#cffafe", "Keesokan harinya, rama-rama biru datang semula bersama kawan-kawannya. Seolah-olah berkata, \"Terima kasih, Hani!\""),
    ],
    moral: "Sayangi haiwan dan biarkan mereka hidup bebas di alam semula jadi.",
    quiz: [
      ["Apakah warna rama-rama itu?", "Biru", ["Merah", "Kuning", "Hitam"]],
      ["Di mana Hani menyimpan rama-rama itu?", "Dalam balang", ["Dalam kasut", "Dalam beg", "Dalam kotak pensel"]],
      ["Apa yang Hani lakukan akhirnya?", "Melepaskan rama-rama", ["Menyimpan selamanya", "Memberi kepada kawan", "Menangis"]],
    ],
  },
  {
    id: "robot-lupa-senyum", title: "Robot Comel yang Lupa Senyum", emoji: "🤖😊", color: "#d9f99d",
    pages: [
      P("🤖🔧", "#e5e7eb", "Bip-Bop ialah robot kecil yang pandai mengemas, memasak dan menyusun buku. Tetapi dia tidak pernah tersenyum."),
      P("🤖❓😐", "#f1f5f9", "\"Apakah itu senyum?\" tanya Bip-Bop kepada Adam. Adam tertawa. \"Senyum ialah tanda kita gembira!\""),
      P("🤖📋", "#dbeafe", "Bip-Bop membuat senarai: 'Cari kegembiraan.' Dia mula mencuba pelbagai perkara."),
      P("🤖🌻", "#fef9c3", "Dia menyiram bunga. Bunga mekar dengan cantik. Hmm... ada sesuatu yang hangat dalam dadanya."),
      P("🤖👵🛍️", "#ffedd5", "Dia membantu Mak Cik membawa barang. \"Terima kasih, Bip-Bop!\" Rasa hangat itu bertambah."),
      P("🤖🧒🎈", "#fce7f3", "Dia membaiki belon adik yang terlepas. Adik ketawa riang. Tiba-tiba... skrin muka Bip-Bop menunjukkan 😊!"),
      P("🤖😊💖", "#d9f99d", "\"Saya sudah faham!\" kata Bip-Bop. \"Senyum datang apabila kita membuat orang lain gembira!\""),
    ],
    moral: "Kebaikan kecil boleh membawa senyuman — kepada orang lain dan diri kita sendiri.",
    quiz: [
      ["Apakah nama robot itu?", "Bip-Bop", ["Robo", "Tik-Tok", "Bot"]],
      ["Menurut Adam, senyum ialah tanda…", "Kita gembira", ["Kita marah", "Kita lapar", "Kita penat"]],
      ["Bilakah Bip-Bop mula tersenyum?", "Selepas membantu orang lain", ["Selepas tidur", "Selepas makan", "Tidak pernah"]],
    ],
  },
];
export const bookById = (id) => BOOKS.find((b) => b.id === id);
