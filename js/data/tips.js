// Tips & Info — 12 short parenting lessons (read or listen via TTS).
// General guidance only, not medical advice; sources noted where a figure is quoted.
const S = (h, items, p) => ({ h, items, p });

export const TIPS = [
  {
    id: "masa-skrin", title: "Masa Skrin yang Sihat", emoji: "📱", color: "#e0f2fe",
    intro: "Skrin bukan musuh — yang penting berapa lama, apa kandungannya, dan sama ada anak menonton bersama orang dewasa.",
    sections: [
      S("Panduan umur (WHO, 2019)", ["Bawah 2 tahun: masa skrin tidak disyorkan, kecuali panggilan video dengan keluarga.", "2 hingga 4 tahun: tidak lebih 1 jam sehari — kurang lebih baik.", "5 tahun ke atas: tetapkan had yang konsisten dan utamakan tidur, gerak badan & masa keluarga."]),
      S("Jadikan masa skrin lebih bermakna", ["Pilih aplikasi yang interaktif dan sesuai umur, bukan video tanpa henti.", "Duduk bersama dan berbual: 'Kenapa jawapan itu betul?'", "Sambungkan dengan dunia sebenar: lepas main kuiz buah, cari buah yang sama di dapur."]),
      S("Peraturan rumah yang membantu", ["Tiada skrin semasa makan dan sejam sebelum tidur.", "Gunakan pemasa — anak lebih mudah berhenti bila 'jam yang beritahu'.", "Ibu bapa tunjuk contoh: letak telefon semasa bermain dengan anak."]),
    ],
    action: "Pilih satu waktu hari ini (contoh: waktu makan malam) dan jadikan ia 'zon tanpa skrin' untuk seluruh keluarga.",
  },
  {
    id: "membaca-bersama", title: "Membaca Bersama Anak", emoji: "📖", color: "#fef3c7",
    intro: "Membaca bersama 10–15 minit sehari membina kosa kata, tumpuan dan hubungan ibu-anak.",
    sections: [
      S("Teknik 'membaca dialog'", ["Tanya: 'Apa yang kamu nampak dalam gambar ini?'", "Kembangkan jawapan anak: 'Ya, kucing — kucing oren yang sedang tidur.'", "Ulang semula pada hari lain — kanak-kanak belajar melalui ulangan."]),
      S("Buat ia seronok", ["Guna suara berbeza untuk setiap watak.", "Biar anak pilih buku, walaupun buku yang sama setiap malam.", "Berhenti sebelum anak bosan — tamatkan dengan rasa ingin tahu."]),
      S("Bila anak mula membaca sendiri", ["Gilir-gilir membaca: anda satu muka, anak satu ayat.", "Tunjuk perkataan dengan jari semasa membaca.", "Puji usaha membunyikan perkataan, bukan hanya ketepatan."]),
    ],
    action: "Malam ini, baca satu buku cerita Playora bersama anak dan tanya tiga soalan tentang gambar.",
  },
  {
    id: "puji-usaha", title: "Puji Usaha, Bukan Bakat", emoji: "🌱", color: "#dcfce7",
    intro: "Cara kita memuji membentuk cara anak melihat cabaran. Pujian pada usaha membina daya tahan.",
    sections: [
      S("Bandingkan", ["Kurang membantu: 'Pandainya kamu!'", "Lebih membantu: 'Kamu cuba tiga kali sampai dapat — hebat usaha kamu!'", "Pujian khusus lebih bermakna daripada pujian umum."]),
      S("Bila anak gagal", ["Normalkan kesilapan: 'Otak kita membesar bila kita cuba benda susah.'", "Tambah perkataan 'belum': 'Kamu belum hafal sifir 7 — jom cuba lagi esok.'", "Kongsi kesilapan anda sendiri dan apa yang anda belajar."]),
      S("Bintang & pelekat dalam Playora", ["Gunakan bintang sebagai titik mula perbualan, bukan ukuran nilai diri anak.", "Raikan percubaan semula, bukan hanya tiga bintang."]),
    ],
    action: "Hari ini, gantikan sekurang-kurangnya tiga pujian 'pandai' dengan pujian tentang usaha atau strategi anak.",
  },
  {
    id: "rutin-tidur", title: "Rutin Tidur yang Tenang", emoji: "🌙", color: "#ede9fe",
    intro: "Tidur yang cukup membantu tumpuan, emosi dan pembelajaran anak keesokan harinya.",
    sections: [
      S("Berapa lama tidur diperlukan? (AASM)", ["3–5 tahun: 10 hingga 13 jam sehari, termasuk tidur siang.", "6–12 tahun: 9 hingga 12 jam sehari."]),
      S("Rutin 20–30 minit sebelum tidur", ["Mandi atau cuci muka, gosok gigi, pakai baju tidur.", "Baca buku atau berbual tentang perkara baik hari ini.", "Lampu malap dan suasana tenang — tiada skrin."]),
      S("Konsisten adalah kunci", ["Waktu tidur & bangun yang hampir sama setiap hari, termasuk hujung minggu.", "Guna carta rutin bergambar supaya anak tahu langkah seterusnya."]),
    ],
    action: "Gunakan 'Rutin Anak' dalam Planner Playora untuk menyusun rutin malam bersama anak.",
  },
  {
    id: "tantrum", title: "Menangani Tantrum dengan Tenang", emoji: "🌋", color: "#fee2e2",
    intro: "Tantrum adalah cara kanak-kanak meluahkan emosi besar yang belum mampu mereka kawal. Ia bukan tanda ibu bapa gagal.",
    sections: [
      S("Semasa tantrum", ["Pastikan anak selamat; jauhkan benda berbahaya.", "Kekal tenang dan dekat — suara perlahan, ayat pendek.", "Jangan berunding atau berleter ketika emosi sedang memuncak."]),
      S("Selepas anak tenang", ["Namakan perasaan: 'Tadi kamu marah sebab kena berhenti main.'", "Ajar cara lain: tarik nafas dalam, peluk bantal, minta tolong.", "Peluk dan sambung semula hubungan."]),
      S("Mencegah", ["Beri amaran awal sebelum peralihan: '5 minit lagi kita kemas.'", "Beri pilihan kecil: 'Baju biru atau merah?'", "Perhatikan pencetus biasa: lapar, penat, terlalu banyak rangsangan."]),
    ],
    action: "Kenal pasti satu pencetus tantrum anak minggu ini dan rancang satu langkah pencegahan.",
  },
  {
    id: "emosi-anak", title: "Bantu Anak Kenal Emosi", emoji: "💛", color: "#fef9c3",
    intro: "Anak yang boleh menamakan perasaan lebih mudah mengawalnya — 'namakan untuk menjinakkan'.",
    sections: [
      S("Bina kosa kata emosi", ["Gembira, sedih, marah, takut, kecewa, cemburu, bangga, malu.", "Tunjuk ekspresi muka dalam buku cerita: 'Bagaimana perasaan arnab ini?'"]),
      S("Terima semua perasaan, hadkan tingkah laku", ["'Boleh rasa marah. Tapi tidak boleh pukul.'", "Elak 'Jangan menangis' — cuba 'Ibu nampak kamu sedih. Ibu ada di sini.'"]),
      S("Aktiviti mudah", ["Termometer perasaan: tanya 'Marah kamu tahap 1 hingga 5?'", "Semakan perasaan waktu makan malam — setiap orang kongsi satu perasaan hari ini."]),
    ],
    action: "Malam ini, minta setiap ahli keluarga kongsi satu perasaan yang dialami hari ini dan sebabnya.",
  },
  {
    id: "main-bebas", title: "Kuasa Main Bebas", emoji: "🧸", color: "#fce7f3",
    intro: "Main bebas — tanpa skrin dan tanpa arahan — membina kreativiti, bahasa dan kemahiran menyelesaikan masalah.",
    sections: [
      S("Kenapa penting", ["Anak belajar membuat keputusan dan mencuba idea sendiri.", "Main pura-pura melatih bahasa dan empati.", "Bermain di luar menguatkan otot dan koordinasi."]),
      S("Bahan murah, nilai tinggi", ["Kotak kosong, kain, cawan plastik, bekas telur.", "Blok, plastisin, kapur, pasir dan air.", "Bahan semula jadi: daun, batu, ranting."]),
      S("Peranan ibu bapa", ["Sediakan masa dan ruang — tidak perlu sentiasa mengarah.", "Ikut cadangan anak: 'Kamu jadi doktor, ibu jadi pesakit?'", "Bosan itu tidak mengapa — bosan sering mencetuskan kreativiti."]),
    ],
    action: "Sediakan satu 'kotak main bebas' daripada barang terpakai di rumah dan biar anak mencipta sesuatu.",
  },
  {
    id: "matematik-harian", title: "Matematik dalam Kehidupan Harian", emoji: "🔢", color: "#dbeafe",
    intro: "Anak belajar nombor paling cepat apabila matematik muncul dalam aktiviti seharian.",
    sections: [
      S("Di dapur", ["Kira sudu tepung bersama.", "Bahagikan kuih sama rata: 'Empat kuih untuk dua orang, seorang dapat berapa?'", "Susun pinggan ikut saiz — kecil, sederhana, besar."]),
      S("Di kedai", ["Biar anak bayar dengan syiling dan kira baki.", "Bandingkan harga: 'Mana lebih murah?'", "Kira barang dalam troli."]),
      S("Dalam perjalanan", ["Cari nombor pada plat kereta.", "Kira kereta merah.", "Teka berapa minit lagi sampai."]),
    ],
    action: "Libatkan anak dalam satu aktiviti membeli-belah atau memasak minggu ini dan biar dia mengira sendiri.",
  },
  {
    id: "dwibahasa", title: "Membesarkan Anak Dwibahasa", emoji: "🗣️", color: "#ffedd5",
    intro: "Kanak-kanak mampu belajar dua bahasa serentak. Mencampur bahasa pada peringkat awal adalah perkara biasa.",
    sections: [
      S("Strategi yang berkesan", ["Satu orang, satu bahasa: contoh ibu berbahasa Melayu, ayah berbahasa Inggeris.", "Masa atau tempat khas: 'English time' semasa bermain petang.", "Banyakkan pendedahan bermakna — lagu, buku, perbualan — bukan hafalan sahaja."]),
      S("Perkara biasa yang tidak perlu dirisaukan", ["Anak mencampur dua bahasa dalam satu ayat.", "Satu bahasa lebih kuat buat seketika.", "Jika ada kebimbangan tentang perkembangan pertuturan, rujuk doktor atau ahli terapi pertuturan."]),
    ],
    action: "Pilih satu waktu harian (contoh: semasa mandi) untuk berbual dalam bahasa kedua anak selama 10 minit.",
  },
  {
    id: "makan-sihat", title: "Anak Memilih Makanan", emoji: "🥦", color: "#ecfccb",
    intro: "Memilih makanan adalah fasa biasa. Kesabaran dan pendedahan berulang lebih berkesan daripada paksaan.",
    sections: [
      S("Pendedahan berulang", ["Kanak-kanak mungkin perlu mencuba makanan baharu berkali-kali sebelum menerimanya.", "Hidangkan sedikit makanan baharu bersama makanan yang anak sudah suka.", "Tiada paksaan, tiada ganjaran pencuci mulut — biar anak memilih berapa banyak."]),
      S("Libatkan anak", ["Biar anak basuh sayur, kacau adunan atau susun pinggan.", "Main 'warna pelangi' — makan makanan pelbagai warna minggu ini.", "Makan bersama keluarga dan tunjuk contoh."]),
      S("Bila perlu dapatkan nasihat", ["Berat badan tidak naik, kerap tersedak, atau hanya makan sangat sedikit jenis makanan — rujuk doktor."]),
    ],
    action: "Pilih satu sayur baharu minggu ini dan hidangkan sedikit, tiga kali, tanpa paksaan.",
  },
  {
    id: "keselamatan-digital", title: "Keselamatan Digital Anak", emoji: "🛡️", color: "#e0e7ff",
    intro: "Anak kecil belum boleh menilai risiko dalam talian. Peranan kita ialah memasang pagar dan membina kepercayaan.",
    sections: [
      S("Tetapan asas", ["Gunakan kawalan ibu bapa pada telefon, tablet dan YouTube Kids.", "Matikan pembelian dalam aplikasi atau minta kata laluan.", "Letak peranti di ruang terbuka, bukan dalam bilik tidur."]),
      S("Ajar peraturan mudah", ["Jangan kongsi nama penuh, sekolah atau alamat.", "Jika nampak sesuatu yang menakutkan atau pelik, beritahu ibu atau ayah.", "Tidak semua orang dalam talian adalah kawan."]),
      S("Kekal berhubung", ["Tanya dengan minat: 'Main apa tadi? Tunjuk ibu.'", "Jangan menghukum bila anak bercerita — supaya mereka terus berkongsi."]),
    ],
    action: "Semak tetapan kawalan ibu bapa pada peranti anak hari ini dan matikan pembelian dalam aplikasi.",
  },
  {
    id: "rehat-ibu", title: "Ibu Juga Perlu Rehat", emoji: "🫖", color: "#fae8ff",
    intro: "Menjaga diri sendiri bukan mementingkan diri. Ibu yang cukup rehat lebih sabar dan lebih hadir untuk anak.",
    sections: [
      S("Langkah kecil setiap hari", ["10 minit tanpa gangguan: minum teh, baca, atau berjalan.", "Tidur awal sekurang-kurangnya dua malam seminggu.", "Kurangkan 'mesti sempurna' — rumah bersepah sedikit tidak mengapa."]),
      S("Minta & terima bantuan", ["Bahagikan tugasan dengan pasangan atau keluarga secara jelas.", "Kongsi giliran menjaga anak dengan rakan.", "Sertai komuniti ibu bapa untuk sokongan."]),
      S("Bila perlu bantuan profesional", ["Rasa sedih, cemas atau kosong hampir setiap hari selama dua minggu atau lebih.", "Talian HEAL 15555 (KKM) dan Talian Kasih 15999 sedia membantu. Jika dalam bahaya, hubungi 999."]),
    ],
    action: "Jadualkan 15 minit 'masa untuk diri sendiri' esok dan beritahu keluarga supaya tidak diganggu.",
  },
];

export const tipById = (id) => TIPS.find((t) => t.id === id);
