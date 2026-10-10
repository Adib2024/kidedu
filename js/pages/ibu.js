// Games untuk Ibu — self-reflection quizzes, mood log, journal, vision board, challenge, wellbeing check.
import { store } from "../store.js";
import { esc, toast, todayKey, prettyDate, uid, confetti, sfx, pick, shuffle, confirmBox, addDays, HARI_PENDEK } from "../util.js";

export const IBU = [
  { id: "emosi-ibu", title: "Emosi Ibu", emoji: "🌦️", color: "#fce7f3", desc: "Daftar perasaan harian & lihat corak emosi." },
  { id: "bahasa-cinta", title: "Bahasa Cinta Ibu", emoji: "💌", color: "#ffe4e6", desc: "Kuiz 15 soalan: apa bahasa kasih sayang anda?" },
  { id: "karakter-ibu", title: "Rahsia Karakter Ibu", emoji: "🔮", color: "#ede9fe", desc: "Ibu Matahari, Bulan, Bintang atau Pelangi?" },
  { id: "gaya-ibu", title: "Siapa Ibu Sebenarnya?", emoji: "🧕", color: "#e0f2fe", desc: "Kenali gaya keibubapaan anda." },
  { id: "impian-ibu", title: "Kehidupan Impian Ibu", emoji: "🏡", color: "#dcfce7", desc: "Bina vision board 6 aspek kehidupan." },
  { id: "luahan-ibu", title: "Luahan Ibu", emoji: "📝", color: "#fef3c7", desc: "Jurnal peribadi dengan soalan panduan." },
  { id: "glow-up", title: "Jom Glow Up Ibu", emoji: "💄", color: "#fae8ff", desc: "Cabaran penjagaan diri 30 hari." },
  { id: "ibu-okay", title: "Ibu Okay Ke?", emoji: "🌷", color: "#ecfccb", desc: "Semakan kesejahteraan 2 minggu lepas." },
];

const key = (id) => `ibu:${id}`;

export function ibuList(el) {
  el.innerHTML = `<div class="wrap page stack">
    <div class="pagehead"><a class="back" href="#/zon-ibu" aria-label="Kembali">←</a><h1>Games untuk Ibu</h1></div>
    <section class="banner" style="background:linear-gradient(180deg,#fff7ed,#fde68a)"><h1>Topik Ibu, Ini Games Untuk Ibu 💖</h1><span class="sub">Masa untuk diri sendiri</span></section>
    <div class="grid">${IBU.map((g, i) => `<a class="tile" href="#/ibu/${g.id}" style="--tile:${g.color}"><span class="em">${g.emoji}</span><span class="tt">${esc(g.title)}</span><span class="ds">Games ${i + 1} · ${esc(g.desc)}</span></a>`).join("")}</div>
    <p class="small muted center">🔒 Semua jawapan disimpan secara peribadi dalam akaun anda.</p>
  </div>`;
}

export function ibuView(el, { id }) {
  const g = IBU.find((x) => x.id === id);
  if (!g) { location.hash = "/ibu"; return; }
  const frame = (inner) => `<div class="wrap page stack" style="max-width:760px">
    <div class="pagehead"><a class="back" href="#/ibu" aria-label="Kembali">←</a><h1 style="font-size:1.35rem">${g.emoji} ${esc(g.title)}</h1></div>${inner}</div>`;
  const fn = { "emosi-ibu": emosi, "bahasa-cinta": () => personality(QUIZ_LOVE), "karakter-ibu": () => personality(QUIZ_CHAR), "gaya-ibu": () => personality(QUIZ_STYLE), "impian-ibu": impian, "luahan-ibu": luahan, "glow-up": glowup, "ibu-okay": okay }[id];
  return fn(el, g, frame);

  // personality quizzes share one engine
  function personality(Qz) {
    let i = 0;
    const scores = Object.fromEntries(Object.keys(Qz.types).map((k) => [k, 0]));
    const intro = async () => {
      const prev = await store.kv(key(g.id));
      el.innerHTML = frame(`<div class="card pad-lg center">
        <div style="font-size:3.5rem">${g.emoji}</div><p style="font-size:1.1rem">${Qz.intro}</p>
        <p class="muted small">${Qz.questions.length} soalan · ±${Math.ceil(Qz.questions.length / 4)} minit</p>
        <button class="btn big" data-start>Mula ✨</button>
        ${prev ? `<p style="margin-top:14px">Keputusan lepas (${esc(prev.date)}): <b>${Qz.types[prev.result].emoji} ${Qz.types[prev.result].name}</b> · <a href="#" data-prev>Lihat</a></p>` : ""}
      </div>`);
      el.querySelector("[data-start]").onclick = ask;
      el.querySelector("[data-prev]")?.addEventListener("click", (e) => { e.preventDefault(); result(prev.scores, false); });
    };
    const ask = () => {
      const q = Qz.questions[i];
      el.innerHTML = frame(`<div class="progress"><i style="width:${(i / Qz.questions.length) * 100}%"></i></div>
        <div class="card pad-lg"><p class="muted small">Soalan ${i + 1} / ${Qz.questions.length}</p><h2 style="font-size:1.3rem">${esc(q.q)}</h2>
        <div class="stack">${shuffle(q.opts.map((o, k) => [o, k])).map(([o, k]) => `<button class="opt" style="justify-content:flex-start;text-align:left;font-family:var(--font-body);font-size:1rem" data-k="${k}">${esc(o[0])}</button>`).join("")}</div></div>`);
      el.querySelectorAll("[data-k]").forEach((b) => (b.onclick = () => {
        scores[q.opts[+b.dataset.k][1]]++;
        sfx("pop");
        i++;
        if (i < Qz.questions.length) ask(); else result(scores, true);
      }));
    };
    const result = (sc, save) => {
      const total = Object.values(sc).reduce((a, b) => a + b, 0) || 1;
      const ranked = Object.entries(sc).sort((a, b) => b[1] - a[1]);
      const top = Qz.types[ranked[0][0]];
      if (save) { store.setKv(key(g.id), { date: todayKey(), result: ranked[0][0], scores: sc }, { immediate: true }); confetti(30, ["💖", "✨", "🌸"]); }
      el.innerHTML = frame(`<div class="card pad-lg">
        <div class="center"><div style="font-size:4rem">${top.emoji}</div><p class="muted">${esc(Qz.resultLabel)}</p><h2 style="color:var(--pink)">${esc(top.name)}</h2></div>
        <p>${esc(top.desc)}</p>
        <h3>💡 Tips untuk anda</h3><ul>${top.tips.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
        <h3>Pecahan keputusan</h3>
        ${ranked.map(([k, v]) => `<div style="margin-bottom:8px"><div class="row between small"><b>${Qz.types[k].emoji} ${esc(Qz.types[k].name)}</b><span>${Math.round((v / total) * 100)}%</span></div><div class="bar"><i style="width:${(v / total) * 100}%"></i></div></div>`).join("")}
        <div class="row" style="margin-top:14px"><button class="btn sun" data-again>🔁 Ulang kuiz</button><button class="btn ghost" onclick="window.print()">🖨️ Cetak</button><button class="btn ghost" data-share>📤 Kongsi</button></div>
      </div>`);
      el.querySelector("[data-again]").onclick = () => { i = 0; Object.keys(scores).forEach((k) => (scores[k] = 0)); ask(); };
      el.querySelector("[data-share]").onclick = async () => {
        const text = `${Qz.resultLabel} ${top.name} ${top.emoji} — cuba kuiz ini di Pelangi Pop Land!`;
        try { if (navigator.share) await navigator.share({ text }); else { await navigator.clipboard.writeText(text); toast("Disalin ke papan klip 📋"); } } catch {}
      };
    };
    intro();
  }
}

// ======================================================= personality data
const QUIZ_LOVE = {
  intro: "Setiap orang merasai kasih sayang dengan cara berbeza. Pilih pernyataan yang PALING menggembirakan anda dalam setiap pasangan.",
  resultLabel: "Bahasa cinta utama anda:",
  types: {
    kata: { name: "Kata-kata Penghargaan", emoji: "💬", desc: "Anda paling rasa disayangi apabila mendengar pujian, ucapan terima kasih dan kata-kata semangat. Ayat \"Terima kasih, sayang\" boleh mengubah hari anda.", tips: ["Beritahu suami/keluarga dengan lembut bahawa ucapan penghargaan sangat bermakna untuk anda.", "Simpan mesej-mesej manis dalam satu folder 'Hari Bahagia' untuk dibaca semula.", "Amalkan memuji diri sendiri setiap malam: 3 perkara yang anda lakukan dengan baik."] },
    masa: { name: "Masa Berkualiti", emoji: "⏳", desc: "Perhatian penuh tanpa gangguan ialah hadiah terbesar untuk anda — berbual, makan bersama atau berjalan petang tanpa telefon.", tips: ["Jadualkan 'masa berdua' 15 minit sehari tanpa telefon.", "Cadangkan aktiviti keluarga mingguan yang mudah — piknik di taman pun cukup.", "Berikan juga masa berkualiti kepada diri sendiri: secawan teh dalam suasana tenang."] },
    hadiah: { name: "Hadiah & Tanda Ingatan", emoji: "🎁", desc: "Bukan soal harga — anda menghargai tanda bahawa seseorang mengingati anda, walaupun sekuntum bunga atau coklat kecil.", tips: ["Kongsi 'senarai suka' kecil (kuih kegemaran, bunga) dengan keluarga.", "Hadiahkan diri anda sesuatu yang kecil selepas mencapai matlamat.", "Simpan kad atau lukisan anak dalam kotak kenangan."] },
    bantuan: { name: "Bantuan & Khidmat", emoji: "🤝", desc: "Apabila orang lain meringankan beban anda — membasuh pinggan, menjaga anak sebentar — anda benar-benar rasa disayangi.", tips: ["Nyatakan dengan jelas bantuan spesifik yang anda perlukan — keluarga bukan pembaca minda.", "Bahagikan tugasan rumah dengan carta mingguan.", "Terima bantuan tanpa rasa bersalah — itu juga tanda kasih sayang."] },
    sentuhan: { name: "Sentuhan & Pelukan", emoji: "🤗", desc: "Pelukan, pegangan tangan dan usapan di bahu memberi rasa selamat dan dekat kepada anda.", tips: ["Mulakan dan akhiri hari dengan pelukan keluarga.", "Pelukan 20 saat membantu menenangkan tekanan.", "Ajar anak-anak 'pelukan beruang' sebagai ritual harian."] },
  },
  questions: [
    ["Suami berkata 'Saya bangga dengan awak'", "kata", "Suami ajak keluar minum berdua", "masa"],
    ["Anak beri lukisan sebagai hadiah", "hadiah", "Anak tolong kemas mainan tanpa disuruh", "bantuan"],
    ["Dapat pelukan lama selepas hari yang penat", "sentuhan", "Dengar ucapan 'terima kasih masak sedap'", "kata"],
    ["Keluarga luangkan petang tanpa telefon bersama", "masa", "Dapat sekuntum bunga tanpa sebab", "hadiah"],
    ["Seseorang basuh pinggan untuk anda", "bantuan", "Seseorang pegang tangan anda semasa berjalan", "sentuhan"],
    ["Mesej 'Awak ibu terbaik' di telefon", "kata", "Suami tolong jaga anak supaya anda boleh rehat", "bantuan"],
    ["Hadiah kecil sempena hari jadi yang diingati", "hadiah", "Bual panjang dari hati ke hati", "masa"],
    ["Diusap bahu ketika sedang stres", "sentuhan", "Dibelikan makanan kegemaran", "hadiah"],
    ["Dipuji di hadapan keluarga", "kata", "Dipeluk erat oleh anak", "sentuhan"],
    ["Pergi bercuti bersama keluarga", "masa", "Kereta dicucikan untuk anda", "bantuan"],
    ["Menerima kad ucapan bertulis tangan", "hadiah", "Didengar tanpa diganggu ketika bercerita", "masa"],
    ["Tugasan rumah dibuat bersama-sama", "bantuan", "Mendengar 'Saya sayang awak'", "kata"],
    ["Duduk rapat sambil menonton TV", "sentuhan", "Makan malam bersama tanpa gajet", "masa"],
    ["Dikejutkan dengan hadiah kecil", "hadiah", "Dipuji atas usaha anda", "kata"],
    ["Seseorang uruskan urusan yang anda risaukan", "bantuan", "Dipeluk sebelum tidur", "sentuhan"],
  ].map(([a, ta, b, tb]) => ({ q: "Yang mana lebih menggembirakan anda?", opts: [[a, ta], [b, tb]] })),
};

const QUIZ_CHAR = {
  intro: "Setiap ibu ada sinar tersendiri. Jawab dengan jujur — tiada jawapan betul atau salah!",
  resultLabel: "Anda ialah:",
  types: {
    matahari: { name: "Ibu Matahari", emoji: "☀️", desc: "Ceria, bertenaga dan menghidupkan suasana. Rumah anda penuh gelak ketawa dan anak-anak suka keceriaan anda.", tips: ["Jaga tenaga anda — matahari pun perlu terbenam untuk berehat.", "Salurkan keceriaan dalam aktiviti kreatif bersama anak.", "Belajar berkata 'tidak' supaya anda tidak terlalu penat."] },
    bulan: { name: "Ibu Bulan", emoji: "🌙", desc: "Tenang, penyabar dan pendengar yang baik. Anda menjadi tempat anak-anak mengadu dan berasa selamat.", tips: ["Luahkan juga perasaan anda — jangan simpan seorang diri.", "Gunakan kekuatan mendengar untuk sesi 'cerita sebelum tidur'.", "Luangkan masa sunyi untuk mengecas semula tenaga."] },
    bintang: { name: "Ibu Bintang", emoji: "⭐", desc: "Perancang yang tersusun dan berwawasan. Anda memastikan jadual, makanan dan pelajaran anak berjalan lancar.", tips: ["Beri ruang untuk spontan — tidak semua perlu sempurna.", "Libatkan anak dalam merancang supaya mereka belajar berdikari.", "Raikan kemajuan kecil, bukan hanya hasil akhir."] },
    pelangi: { name: "Ibu Pelangi", emoji: "🌈", desc: "Kreatif, penuh idea dan suka mencuba perkara baru. Anda mengubah perkara biasa menjadi pengembaraan.", tips: ["Catat idea dalam buku supaya tidak hilang.", "Pilih satu projek pada satu masa untuk elak terbeban.", "Kongsi bakat anda — mungkin boleh jadi sumber pendapatan!"] },
  },
  questions: [
    { q: "Hujung minggu ideal anda ialah…", opts: [["Piknik meriah bersama ramai orang", "matahari"], ["Rehat di rumah dengan buku & teh", "bulan"], ["Siapkan semua urusan yang tertangguh", "bintang"], ["Cuba resipi atau kraf baru", "pelangi"]] },
    { q: "Bila anak menangis, anda biasanya…", opts: [["Buat lawak supaya dia ketawa", "matahari"], ["Peluk dan dengar dengan tenang", "bulan"], ["Cari punca & selesaikan", "bintang"], ["Alih perhatian dengan permainan kreatif", "pelangi"]] },
    { q: "Telefon anda penuh dengan…", opts: [["Gambar & video keluarga ceria", "matahari"], ["Nota renungan & ayat motivasi", "bulan"], ["Senarai tugasan & kalendar", "bintang"], ["Idea DIY & inspirasi", "pelangi"]] },
    { q: "Kawan-kawan selalu cari anda untuk…", opts: [["Hiburkan hati", "matahari"], ["Mendengar masalah", "bulan"], ["Nasihat praktikal", "bintang"], ["Idea luar biasa", "pelangi"]] },
    { q: "Warna kegemaran anda lebih kepada…", opts: [["Kuning / oren", "matahari"], ["Biru / ungu lembut", "bulan"], ["Hitam / putih / neutral", "bintang"], ["Semua warna!", "pelangi"]] },
    { q: "Bila ada masalah besar, anda…", opts: [["Kekal positif dan cari sisi baik", "matahari"], ["Bertenang dan berdoa dahulu", "bulan"], ["Buat pelan langkah demi langkah", "bintang"], ["Fikir cara berbeza yang orang tak terfikir", "pelangi"]] },
    { q: "Rumah anda paling dikenali dengan…", opts: [["Suasana riuh & meriah", "matahari"], ["Suasana tenang & selesa", "bulan"], ["Kemas & tersusun", "bintang"], ["Hiasan unik & warna-warni", "pelangi"]] },
    { q: "Sifat yang anak warisi daripada anda…", opts: [["Peramah", "matahari"], ["Penyayang", "bulan"], ["Berdisiplin", "bintang"], ["Kreatif", "pelangi"]] },
    { q: "Hadiah impian anda…", opts: [["Percutian bersama kawan-kawan", "matahari"], ["Sehari spa yang tenang", "bulan"], ["Planner & alat organisasi cantik", "bintang"], ["Kelas seni / masakan", "pelangi"]] },
    { q: "Di majlis keluarga, anda…", opts: [["Penghidup suasana", "matahari"], ["Berbual mesra di satu sudut", "bulan"], ["Penyelaras makanan & susunan", "bintang"], ["Pereka hiasan & aktiviti", "pelangi"]] },
    { q: "Moto hidup anda…", opts: [["Senyum selalu!", "matahari"], ["Sabar itu indah", "bulan"], ["Rancang, buat, capai", "bintang"], ["Hidup ini kanvas", "pelangi"]] },
    { q: "Cara anda melepaskan stres…", opts: [["Berbual & ketawa dengan kawan", "matahari"], ["Tidur, solat atau bermeditasi", "bulan"], ["Mengemas rumah", "bintang"], ["Melukis, menjahit atau memasak", "pelangi"]] },
  ],
};

const QUIZ_STYLE = {
  intro: "Setiap ibu mendidik dengan cara tersendiri. Kenali gaya anda dan ketahui kekuatan serta ruang untuk berkembang.",
  resultLabel: "Gaya keibubapaan utama anda:",
  types: {
    pembimbing: { name: "Ibu Pembimbing", emoji: "🧭", desc: "Anda menetapkan peraturan yang jelas tetapi menerangkan sebabnya, mendengar pandangan anak dan memberi kasih sayang. Gaya ini sering dikaitkan dengan anak yang yakin diri dan bertanggungjawab.", tips: ["Teruskan memberi pilihan terhad kepada anak ('Baju merah atau biru?').", "Puji usaha, bukan sahaja keputusan.", "Jaga diri anda — gaya ini memerlukan kesabaran tinggi."] },
    pelindung: { name: "Ibu Pelindung", emoji: "🛡️", desc: "Keselamatan dan kesejahteraan anak sentiasa nombor satu. Anda sangat prihatin dan sentiasa bersedia.", tips: ["Beri ruang anak mencuba dan gagal dalam situasi selamat — itu cara mereka belajar.", "Ajar kemahiran berdikari mengikut umur (pakai kasut sendiri, kemas beg).", "Kurangkan kerisauan dengan rutin yang jelas."] },
    sahabat: { name: "Ibu Sahabat", emoji: "🤝", desc: "Anda mesra, santai dan anak-anak selesa bercerita apa sahaja. Hubungan anda sangat rapat.", tips: ["Tambah sedikit struktur — rutin tidur & skrin yang konsisten.", "Anak masih perlukan sempadan; 'tidak' yang lembut juga tanda sayang.", "Kekalkan keterbukaan anda — itu kekuatan besar!"] },
    komander: { name: "Ibu Komander", emoji: "📋", desc: "Anda tegas, berdisiplin dan menjangkakan anak mengikut arahan. Rumah anda teratur dan anak tahu peraturan.", tips: ["Terangkan 'kenapa' di sebalik peraturan supaya anak faham.", "Selitkan masa bermain bebas dan pelukan setiap hari.", "Dengar pendapat anak — mereka akan lebih bekerjasama."] },
  },
  questions: [
    { q: "Anak enggan tidur pada waktunya. Anda…", opts: [["Terangkan kepentingan tidur & buat rutin bersama", "pembimbing"], ["Risau dia penat esok, temankan sampai tidur", "pelindung"], ["Tak apa, sekali-sekala boleh berjaga", "sahabat"], ["Tegaskan: tidur sekarang, tiada bantahan", "komander"]] },
    { q: "Anak mahu panjat pokok di taman…", opts: [["Benarkan sambil ajar cara selamat", "pembimbing"], ["Larang — bahaya!", "pelindung"], ["Jom panjat sama-sama!", "sahabat"], ["Hanya jika ikut peraturan ketat", "komander"]] },
    { q: "Anak dapat markah rendah…", opts: [["Bincang punca & rancang belajar bersama", "pembimbing"], ["Pujuk dan pastikan dia tak sedih", "pelindung"], ["Tak apa, markah bukan segalanya", "sahabat"], ["Tambah jadual belajar wajib", "komander"]] },
    { q: "Tentang masa skrin…", opts: [["Ada had, dibincang bersama anak", "pembimbing"], ["Saya pantau semua kandungan", "pelindung"], ["Agak fleksibel", "sahabat"], ["Had tetap & tegas", "komander"]] },
    { q: "Anak bergaduh dengan adik-beradik…", opts: [["Bantu mereka berbincang & berdamai", "pembimbing"], ["Pisahkan cepat supaya tiada yang cedera", "pelindung"], ["Biar mereka selesaikan sendiri", "sahabat"], ["Kedua-dua didenda", "komander"]] },
    { q: "Anak mahu cuba aktiviti baru (cth: berenang)…", opts: [["Sokong & cari kelas sesuai", "pembimbing"], ["Pastikan jurulatih & tempat sangat selamat", "pelindung"], ["Bagus! Cuba apa sahaja", "sahabat"], ["Boleh, tapi mesti komited sampai habis", "komander"]] },
    { q: "Bila anak melanggar peraturan…", opts: [["Akibat yang munasabah + penerangan", "pembimbing"], ["Fikir dulu: mungkin dia ada sebab", "pelindung"], ["Tegur ringan sahaja", "sahabat"], ["Hukuman konsisten setiap kali", "komander"]] },
    { q: "Hubungan anda dengan anak paling seperti…", opts: [["Jurulatih & pemain", "pembimbing"], ["Pengawal & permata", "pelindung"], ["Kawan baik", "sahabat"], ["Ketua & ahli pasukan", "komander"]] },
    { q: "Anak minta mainan di kedai…", opts: [["Bincang bajet & tetapkan masa yang sesuai", "pembimbing"], ["Pastikan mainan itu selamat dulu", "pelindung"], ["Selalunya saya belikan", "sahabat"], ["Tidak — kecuali hari istimewa", "komander"]] },
    { q: "Matlamat utama anda sebagai ibu…", opts: [["Anak berdikari & bertanggungjawab", "pembimbing"], ["Anak selamat & sihat", "pelindung"], ["Anak gembira & rapat dengan saya", "sahabat"], ["Anak berdisiplin & berjaya", "komander"]] },
  ],
};

// ======================================================= 1. Emosi Ibu
const EMOS = [
  ["gembira", "😊", "Gembira", "Kongsi kegembiraan ini — tulis satu perkara baik hari ini untuk diingati."],
  ["tenang", "😌", "Tenang", "Bagus! Kenal pasti apa yang membuatkan anda tenang dan jadikan rutin."],
  ["syukur", "🥰", "Bersyukur", "Rasa syukur menguatkan hati. Ucapkan terima kasih kepada seseorang hari ini."],
  ["penat", "😩", "Penat", "Rehat bukan kemalasan. Cuba tidur awal 30 minit atau minta bantuan untuk satu tugasan."],
  ["sedih", "😢", "Sedih", "Tak apa untuk rasa sedih. Luahkan kepada orang dipercayai atau tulis dalam jurnal Luahan Ibu."],
  ["marah", "😠", "Marah", "Tarik nafas 4 saat, tahan 4, hembus 6. Jauhkan diri sebentar sebelum bertindak."],
  ["risau", "😟", "Risau", "Tulis apa yang dirisaukan, kemudian bahagikan: yang boleh dikawal & yang tidak."],
  ["tertekan", "😣", "Tertekan", "Anda tidak keseorangan. Jika berterusan, cuba semakan 'Ibu Okay Ke?' dan berbual dengan profesional."],
];
const CAUSES = ["Anak", "Pasangan", "Kerja", "Rumah tangga", "Kewangan", "Kesihatan", "Diri sendiri", "Keluarga besar"];
async function emosi(el, g, frame) {
  const log = await store.kv(key(g.id), []);
  let sel = null, level = 3, causes = new Set();
  const draw = () => {
    const today = todayKey();
    const week = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
    el.innerHTML = frame(`
      <div class="card"><h2>Bagaimana perasaan anda sekarang?</h2>
        <div class="emo-grid">${EMOS.map(([k, e, n]) => `<button class="emo ${sel === k ? "on" : ""}" data-e="${k}"><span class="e">${e}</span>${n}</button>`).join("")}</div>
        <label class="f" style="margin-top:14px"><span>Sejauh mana? <b data-lvl>${level}</b>/5</span><input type="range" min="1" max="5" value="${level}" data-range style="width:100%;accent-color:var(--pink)"></label>
        <span style="font-weight:800;font-size:.92rem">Puncanya (pilih jika ada)</span>
        <div class="chips" style="margin:6px 0 12px">${CAUSES.map((c) => `<button class="chip ${causes.has(c) ? "on" : ""}" data-cause="${c}">${c}</button>`).join("")}</div>
        <label class="f"><span>Catatan ringkas (pilihan)</span><textarea class="input" data-note maxlength="500" placeholder="Apa yang berlaku hari ini?"></textarea></label>
        <button class="btn block" data-save ${sel ? "" : "disabled"}>💾 Simpan perasaan</button>
        <div data-tip></div>
      </div>
      <div class="card"><h2>7 hari lepas</h2>
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;text-align:center">${week.map((d) => {
          const e = log.filter((x) => x.date === d).at(-1);
          const [y, m, dd] = d.split("-").map(Number);
          return `<div class="panel" style="padding:6px"><div class="small muted">${HARI_PENDEK[new Date(y, m - 1, dd).getDay()]}</div><div style="font-size:1.8rem">${e ? EMOS.find((x) => x[0] === e.emo)[1] : "·"}</div></div>`;
        }).join("")}</div>
        ${log.length ? `<h3 style="margin-top:14px">Ringkasan</h3>${summary(log)}` : ""}
      </div>
      <div class="card"><h2>Catatan terkini</h2>
        <div class="stack">${log.slice().reverse().slice(0, 20).map((x) => `<div class="list-item"><span style="font-size:1.6rem">${EMOS.find((e) => e[0] === x.emo)[1]}</span><div class="grow"><b>${EMOS.find((e) => e[0] === x.emo)[2]} (${x.level}/5)</b> <span class="small muted">${esc(prettyDate(x.date))}</span>${x.causes?.length ? `<div class="small">🏷️ ${x.causes.map(esc).join(", ")}</div>` : ""}${x.note ? `<div class="small">${esc(x.note)}</div>` : ""}</div><button class="x-btn" data-del="${x.id}" aria-label="Padam">✕</button></div>`).join("") || `<p class="muted">Belum ada catatan.</p>`}</div>
      </div>`);
    el.querySelectorAll("[data-e]").forEach((b) => (b.onclick = () => { sel = b.dataset.e; draw(); }));
    el.querySelector("[data-range]").oninput = (e) => { level = +e.target.value; el.querySelector("[data-lvl]").textContent = level; };
    el.querySelectorAll("[data-cause]").forEach((b) => (b.onclick = () => { causes.has(b.dataset.cause) ? causes.delete(b.dataset.cause) : causes.add(b.dataset.cause); b.classList.toggle("on"); }));
    el.querySelector("[data-save]").onclick = () => {
      const note = el.querySelector("[data-note]").value.trim();
      log.push({ id: uid(), date: today, emo: sel, level, causes: [...causes], note, ts: Date.now() });
      store.setKv(key(g.id), log.slice(-365), { immediate: true });
      const tip = EMOS.find((e) => e[0] === sel)[3];
      sel = null; level = 3; causes = new Set();
      draw();
      el.querySelector("[data-tip]").innerHTML = `<div class="alert ok" style="margin-top:12px">✅ Disimpan. ${esc(tip)}</div>`;
      toast("Perasaan disimpan 💖");
    };
    el.querySelectorAll("[data-del]").forEach((b) => (b.onclick = async () => {
      if (!(await confirmBox("Padam catatan ini?", "Padam"))) return;
      const i = log.findIndex((x) => x.id === b.dataset.del);
      log.splice(i, 1);
      store.setKv(key(g.id), log, { immediate: true });
      draw();
    }));
  };
  draw();
}
function summary(log) {
  const last30 = log.filter((x) => Date.now() - x.ts < 30 * 864e5);
  const count = {};
  last30.forEach((x) => (count[x.emo] = (count[x.emo] || 0) + 1));
  const cause = {};
  last30.forEach((x) => (x.causes || []).forEach((c) => (cause[c] = (cause[c] || 0) + 1)));
  const top = Object.entries(count).sort((a, b) => b[1] - a[1]);
  const tc = Object.entries(cause).sort((a, b) => b[1] - a[1])[0];
  const max = top[0]?.[1] || 1;
  return `${top.map(([k, v]) => { const e = EMOS.find((x) => x[0] === k); return `<div class="row small" style="margin-bottom:6px"><span style="width:110px">${e[1]} ${e[2]}</span><div class="bar grow"><i style="width:${(v / max) * 100}%"></i></div><b>${v}</b></div>`; }).join("")}
    ${tc ? `<p class="small muted">Punca paling kerap (30 hari): <b>${esc(tc[0])}</b></p>` : ""}`;
}

// ======================================================= 5. Kehidupan Impian
const AREAS = [
  ["keluarga", "👨‍👩‍👧", "Keluarga", "#fce7f3"], ["kesihatan", "🥗", "Kesihatan", "#dcfce7"], ["kewangan", "💰", "Kewangan", "#fef3c7"],
  ["kerjaya", "💼", "Kerjaya / Bisnes", "#dbeafe"], ["rohani", "🤲", "Rohani & Diri", "#ede9fe"], ["impian", "✈️", "Impian & Hobi", "#ffedd5"],
];
async function impian(el, g, frame) {
  const data = await store.kv(key(g.id), {});
  let editing = null;
  const draw = () => {
    el.innerHTML = frame(`
      <p class="muted">Tulis impian anda untuk setiap aspek kehidupan. Tekan kad untuk mengisi. Vision board ini boleh dicetak & ditampal!</p>
      <div class="vision">${AREAS.map(([k, e, n, c]) => { const d = data[k] || {}; return `
        <button class="v" data-k="${k}" style="background:${c};border:0;text-align:left;cursor:pointer">
          <div class="e">${d.emoji || e}</div><b>${n}</b>
          <div style="font-weight:700;margin-top:4px">${d.goal ? esc(d.goal) : '<span class="muted">+ Tambah impian</span>'}</div>
          ${d.step ? `<div class="small">👣 ${esc(d.step)}</div>` : ""}
          ${d.year ? `<div class="small muted">🎯 ${esc(d.year)}</div>` : ""}
        </button>`; }).join("")}</div>
      <div class="row no-print"><button class="btn ghost" onclick="window.print()">🖨️ Cetak vision board</button></div>
      <div data-edit></div>`);
    el.querySelectorAll("[data-k]").forEach((b) => (b.onclick = () => { editing = b.dataset.k; form(); }));
  };
  const form = () => {
    const [k, e, n] = AREAS.find((a) => a[0] === editing);
    const d = data[k] || {};
    const box = el.querySelector("[data-edit]");
    box.innerHTML = `<div class="card no-print"><h3>${e} ${n}</h3>
      <label class="f"><span>Impian saya</span><input class="input" data-f="goal" maxlength="120" value="${esc(d.goal || "")}" placeholder="cth: Keluarga sihat & bahagia"></label>
      <label class="f"><span>Kenapa ia penting?</span><input class="input" data-f="why" maxlength="160" value="${esc(d.why || "")}"></label>
      <label class="f"><span>Langkah pertama minggu ini</span><input class="input" data-f="step" maxlength="120" value="${esc(d.step || "")}"></label>
      <label class="f"><span>Sasaran masa</span><input class="input" data-f="year" maxlength="40" value="${esc(d.year || "")}" placeholder="cth: Disember ${new Date().getFullYear()}"></label>
      <label class="f"><span>Emoji</span><input class="input" data-f="emoji" maxlength="4" value="${esc(d.emoji || "")}" placeholder="${e}"></label>
      <div class="row"><button class="btn lime" data-save>Simpan</button><button class="btn ghost" data-cancel>Batal</button></div></div>`;
    box.scrollIntoView({ behavior: "smooth" });
    box.querySelector("[data-cancel]").onclick = draw;
    box.querySelector("[data-save]").onclick = () => {
      const o = {};
      box.querySelectorAll("[data-f]").forEach((i) => (o[i.dataset.f] = i.value.trim()));
      data[k] = o;
      store.setKv(key(g.id), data, { immediate: true });
      toast("Impian disimpan ✨");
      draw();
    };
  };
  draw();
}

// ======================================================= 6. Luahan Ibu
const PROMPTS = [
  "Apa yang paling memenatkan minggu ini, dan apa yang boleh saya lepaskan?",
  "Tiga perkara kecil yang membuatkan saya tersenyum hari ini…",
  "Jika saya boleh beritahu diri saya 5 tahun lalu satu perkara, ia ialah…",
  "Saat paling membanggakan sebagai ibu bulan ini…",
  "Apa yang saya perlukan sekarang tetapi segan untuk minta?",
  "Surat untuk anak saya apabila dia dewasa…",
  "Perkara yang saya rindu tentang diri saya sebelum jadi ibu…",
  "Saya maafkan diri saya kerana…",
  "Kalau ada satu hari bebas tanpa tanggungjawab, saya akan…",
  "Siapa yang paling banyak membantu saya, dan bagaimana saya boleh berterima kasih?",
];
async function luahan(el, g, frame) {
  const list = await store.kv(key(g.id), []);
  let prompt = pick(PROMPTS);
  const draw = () => {
    el.innerHTML = frame(`
      <div class="card">
        <div class="alert info small">🔒 Jurnal ini peribadi — hanya anda yang boleh membacanya.</div>
        <p style="font-weight:800;margin-top:12px">💭 ${esc(prompt)} <button class="btn sm ghost" data-p>🔄</button></p>
        <textarea class="input" data-t maxlength="5000" style="min-height:180px" placeholder="Tulis apa sahaja yang terbuku di hati…"></textarea>
        <div class="row" style="margin-top:10px"><button class="btn" data-save>💾 Simpan</button><span class="small muted" data-cnt>0 aksara</span></div>
      </div>
      <h2>📚 Catatan lepas (${list.length})</h2>
      <div class="stack">${list.slice().reverse().map((x) => `<details class="card soft"><summary style="cursor:pointer;font-weight:800">${esc(prettyDate(x.date))} — ${esc(x.text.slice(0, 50))}${x.text.length > 50 ? "…" : ""}</summary>
        ${x.prompt ? `<p class="small muted" style="margin-top:8px">💭 ${esc(x.prompt)}</p>` : ""}<p style="white-space:pre-wrap">${esc(x.text)}</p>
        <button class="btn sm ghost" data-del="${x.id}">🗑️ Padam</button></details>`).join("") || `<p class="muted">Belum ada catatan.</p>`}</div>`);
    const t = el.querySelector("[data-t]");
    const draftKey = "ppl_luahan_draft";
    t.value = sessionStorage.getItem(draftKey) || "";
    t.oninput = () => { sessionStorage.setItem(draftKey, t.value); el.querySelector("[data-cnt]").textContent = `${t.value.length} aksara`; };
    el.querySelector("[data-p]").onclick = () => { prompt = pick(PROMPTS.filter((p) => p !== prompt)); draw(); };
    el.querySelector("[data-save]").onclick = () => {
      if (!t.value.trim()) return toast("Tulis sesuatu dahulu ✍️");
      list.push({ id: uid(), date: todayKey(), prompt, text: t.value.trim() });
      store.setKv(key(g.id), list, { immediate: true });
      sessionStorage.removeItem(draftKey);
      toast("Luahan disimpan 💖");
      prompt = pick(PROMPTS);
      draw();
    };
    el.querySelectorAll("[data-del]").forEach((b) => (b.onclick = async () => {
      if (!(await confirmBox("Padam catatan ini secara kekal?", "Padam"))) return;
      list.splice(list.findIndex((x) => x.id === b.dataset.del), 1);
      store.setKv(key(g.id), list, { immediate: true });
      draw();
    }));
  };
  draw();
}

// ======================================================= 7. Glow Up 30 hari
const GLOW = [
  "Minum 8 gelas air", "Tidur sebelum 11 malam", "Jalan kaki 15 minit", "Maskara muka / rawatan kulit", "Baca 10 halaman buku",
  "Tulis 3 perkara disyukuri", "Makan sayur dalam setiap hidangan", "Regangan badan 10 minit", "Telefon kawan lama", "Hari tanpa media sosial (2 jam)",
  "Kemas satu laci / sudut rumah", "Pakai baju yang buat anda rasa cantik", "Minum teh dengan tenang tanpa gangguan", "Belajar resipi sihat baru", "Senaman 20 minit",
  "Rapikan kuku / rambut", "Dengar podcast / kuliah inspirasi", "Elak minuman manis sehari", "Tulis matlamat bulan ini", "Hadiahkan diri sesuatu yang kecil",
  "Tidur 20 minit di tengah hari", "Puji diri di depan cermin", "Belanja bijak — rekod perbelanjaan", "Bersiar-siar dengan keluarga", "Cuba hobi baru",
  "Detoks gajet sebelum tidur", "Sarapan sihat", "Ucap terima kasih kepada pasangan", "Masa sunyi / zikir / meditasi 10 minit", "Raikan diri — anda berjaya! 🎉",
];
async function glowup(el, g, frame) {
  const d = await store.kv(key(g.id), { start: todayKey(), done: [] });
  const draw = () => {
    const n = d.done.filter(Boolean).length;
    el.innerHTML = frame(`
      <div class="card center"><div class="ring" style="--p:${(n / 30) * 100}"><div>${n}/30</div></div>
        <p style="margin-top:10px"><b>${n === 30 ? "Tahniah! Anda telah glow up! ✨" : "Satu langkah kecil setiap hari."}</b><br><span class="small muted">Mula: ${esc(prettyDate(d.start))}</span></p>
        <button class="btn sm ghost" data-reset>🔄 Mula semula</button></div>
      <div class="stack">${GLOW.map((t, i) => `<label class="check ${d.done[i] ? "done" : ""}"><input type="checkbox" data-i="${i}" ${d.done[i] ? "checked" : ""}><b style="min-width:58px">Hari ${i + 1}</b><span>${esc(t)}</span></label>`).join("")}</div>`);
    el.querySelectorAll("[data-i]").forEach((c) => (c.onchange = () => {
      d.done[+c.dataset.i] = c.checked;
      store.setKv(key(g.id), d);
      if (c.checked) { sfx("right"); if (d.done.filter(Boolean).length === 30) confetti(80, ["✨", "💄", "💖", "🌸"]); }
      draw();
    }));
    el.querySelector("[data-reset]").onclick = async () => {
      if (!(await confirmBox("Mula semula cabaran 30 hari?", "Mula semula"))) return;
      d.start = todayKey(); d.done = [];
      store.setKv(key(g.id), d, { immediate: true });
      draw();
    };
  };
  draw();
}

// ======================================================= 8. Ibu Okay Ke?
const OKQ = [
  "Saya rasa penat yang tidak hilang walaupun selepas berehat.",
  "Saya rasa sedih, kosong atau mudah menangis.",
  "Saya hilang minat pada perkara yang dulu saya suka.",
  "Saya mudah marah atau hilang sabar dengan anak/pasangan.",
  "Saya susah tidur atau tidur terlalu banyak.",
  "Saya rasa risau atau cemas berlebihan.",
  "Saya rasa tidak cukup baik sebagai ibu.",
  "Saya rasa keseorangan dan tiada tempat bergantung.",
  "Saya sukar memberi tumpuan atau membuat keputusan.",
  "Selera makan saya berubah dengan ketara.",
];
const SCALE = ["Tidak pernah", "Kadang-kadang", "Kerap", "Hampir setiap hari"];
async function okay(el, g, frame) {
  const hist = await store.kv(key(g.id), []);
  const ans = Array(OKQ.length).fill(null);
  const draw = () => {
    el.innerHTML = frame(`
      <div class="alert info small">Semakan ringkas ini <b>bukan diagnosis perubatan</b>. Ia membantu anda memahami keadaan diri. Jika anda rasa tidak selamat, hubungi 999 atau talian bantuan di bawah dengan segera.</div>
      <div class="card"><p><b>Dalam 2 minggu lepas, berapa kerap anda mengalami perkara berikut?</b></p>
        <div class="stack">${OKQ.map((q, i) => `<div><p style="font-weight:700;margin-bottom:6px">${i + 1}. ${esc(q)}</p>
          <div class="chips">${SCALE.map((s, v) => `<button class="chip ${ans[i] === v ? "on" : ""}" data-q="${i}" data-v="${v}">${s}</button>`).join("")}</div></div>`).join("")}</div>
        <button class="btn block big" style="margin-top:16px" data-done ${ans.includes(null) ? "disabled" : ""}>Lihat keputusan 🌷</button>
      </div>
      ${hist.length ? `<div class="card"><h3>Sejarah semakan</h3>${hist.slice(-8).reverse().map((h) => `<div class="list-item small" style="margin-bottom:6px"><span class="grow">${esc(prettyDate(h.date))}</span><b>${h.score}/30</b><span>${band(h.score).emoji}</span></div>`).join("")}</div>` : ""}`);
    el.querySelectorAll("[data-q]").forEach((b) => (b.onclick = () => { ans[+b.dataset.q] = +b.dataset.v; draw(); }));
    el.querySelector("[data-done]").onclick = () => {
      const score = ans.reduce((a, b) => a + b, 0);
      hist.push({ date: todayKey(), score });
      store.setKv(key(g.id), hist.slice(-50), { immediate: true });
      const b = band(score);
      el.innerHTML = frame(`<div class="card pad-lg">
        <div class="center"><div style="font-size:4rem">${b.emoji}</div><h2>${b.title}</h2><p class="muted">Skor: ${score} / 30</p></div>
        <p>${b.text}</p>
        <h3>Langkah yang boleh diambil</h3><ul>${b.steps.map((s) => `<li>${s}</li>`).join("")}</ul>
        <div class="card soft" style="background:var(--sky-3)"><h3>📞 Talian bantuan (Malaysia)</h3>
          <ul style="margin:0"><li><b>Talian HEAL 15555</b> — sokongan kesihatan mental (KKM)</li><li><b>Talian Kasih 15999</b> / WhatsApp 019-2615999 — 24 jam</li><li><b>Befrienders KL</b> — 03-7627 2929 (24 jam)</li><li><b>Kecemasan: 999</b></li></ul>
          <p class="small muted" style="margin:8px 0 0">Sila sahkan nombor terkini di laman rasmi organisasi berkenaan.</p></div>
        <div class="row" style="margin-top:14px"><button class="btn sun" data-again>🔁 Semak semula</button><a class="btn ghost" href="#/ibu/luahan-ibu">📝 Tulis luahan</a></div>
      </div>`);
      el.querySelector("[data-again]").onclick = () => { ans.fill(null); draw(); };
    };
  };
  draw();
}
function band(s) {
  if (s <= 7) return { emoji: "🌻", title: "Anda nampaknya okay!", text: "Tahniah kerana menjaga diri. Teruskan rutin sihat dan semak semula sebulan sekali.", steps: ["Kekalkan masa rehat & tidur yang cukup.", "Teruskan aktiviti yang menggembirakan anda.", "Sokong ibu lain di sekeliling anda 💛"] };
  if (s <= 15) return { emoji: "🌤️", title: "Ada sedikit beban", text: "Anda mungkin sedang melalui tempoh yang memenatkan. Itu normal — tetapi jangan abaikan diri.", steps: ["Minta bantuan spesifik daripada pasangan/keluarga untuk 1–2 tugasan.", "Cuba Cabaran Glow Up untuk rutin penjagaan diri kecil.", "Tulis perasaan dalam Luahan Ibu.", "Kurangkan komitmen yang tidak penting minggu ini."] };
  if (s <= 22) return { emoji: "🌧️", title: "Anda perlukan sokongan", text: "Skor anda menunjukkan tekanan yang agak tinggi. Anda tidak keseorangan, dan meminta bantuan adalah tanda kekuatan.", steps: ["Berbual dengan seseorang yang anda percayai minggu ini.", "Pertimbangkan berjumpa doktor di klinik kesihatan berdekatan.", "Hubungi Talian HEAL 15555 untuk sokongan percuma.", "Rehat — urusan rumah boleh ditangguh."] };
  return { emoji: "🫂", title: "Sila dapatkan bantuan segera", text: "Anda sedang menanggung banyak. Sila hubungi profesional kesihatan atau talian bantuan secepat mungkin. Jika anda terfikir untuk mencederakan diri, hubungi 999 atau pergi ke unit kecemasan hospital terdekat sekarang.", steps: ["Hubungi Befrienders (03-7627 2929) atau Talian HEAL 15555 hari ini.", "Beritahu seseorang yang rapat tentang perasaan anda.", "Buat temujanji dengan doktor / kaunselor.", "Jangan bersendirian — anda berharga 💖"] };
}
