// Privacy notice — written to match what the code actually stores (see README "Keselamatan & privasi").
import { store } from "../store.js";

const UPDATED = "11 Oktober 2026";

export function privacyPage(el) {
  const back = store.user ? "#/tetapan" : "#/";
  el.innerHTML = `
  <header class="topbar"><div class="wrap">
    <a class="brand" href="#/" aria-label="Playora"><span class="logo">🐼</span><span class="txt">Playora</span></a><span class="spacer"></span>
    <a class="btn sm ghost" href="${back}">← Kembali</a>
  </div></header>
  <main class="wrap page article privacy">
    <h1>Polisi Privasi</h1>
    <p class="muted small">Dikemas kini: ${UPDATED}</p>
    <div class="callout">Ringkasnya: kami simpan data yang <b>perlu</b> untuk app berfungsi sahaja. <b>Tiada iklan, tiada penjejak pihak ketiga, dan data tidak dijual atau dikongsi.</b></div>

    <h2>1. Data yang kami simpan</h2>
    <ul>
      <li><b>Akaun ibu/bapa:</b> nama, emel dan kata laluan. Kata laluan diurus oleh sistem pengesahan (Supabase Auth) dan tidak boleh dibaca oleh sesiapa.</li>
      <li><b>Profil anak:</b> nama panggilan, umur (pilihan) dan avatar. Kami <b>tidak</b> meminta nama penuh, tarikh lahir, sekolah, gambar atau lokasi anak.</li>
      <li><b>Kemajuan pembelajaran:</b> aktiviti yang dicuba, markah, bintang, XP, masa diambil dan jawapan kuiz (untuk mengira markah dengan adil & menunjukkan titik lemah dalam laporan).</li>
      <li><b>Data Zon Ibu & Planner:</b> apa yang anda tulis dalam jurnal, planner, matlamat dan semakan kesejahteraan. Ini mungkin peribadi — ia hanya boleh dibaca oleh akaun anda.</li>
      <li><b>Maklum balas (jika anda hantar):</b> penilaian, komen, jenis peranti & pelayar (cth. "Android · Chrome") dan akaun yang menghantar.</li>
    </ul>

    <h2>2. Untuk apa data digunakan</h2>
    <ul>
      <li>Menyimpan kemajuan anak dan menyegerakkannya antara peranti.</li>
      <li>Menunjukkan laporan, misi harian dan cadangan aktiviti yang sesuai.</li>
      <li>Memperbaiki app berdasarkan maklum balas.</li>
    </ul>
    <p>Kami <b>tidak</b> menggunakan data untuk iklan, profil pemasaran atau membuat keputusan automatik tentang anak anda. Laporan dalam app menunjukkan latihan, bukan penilaian rasmi.</p>

    <h2>3. Siapa boleh melihat data</h2>
    <ul>
      <li>Hanya akaun ibu/bapa yang mencipta data. Ini dikuatkuasakan oleh pangkalan data (Row Level Security), bukan hanya oleh app.</li>
      <li>Pentadbir kandungan Playora hanya boleh mengurus senarai aktiviti — mereka tidak mempunyai akses melalui app kepada data keluarga.</li>
      <li>Pengendali teknikal pangkalan data boleh mengakses pelayan untuk penyelenggaraan & keselamatan sahaja.</li>
    </ul>

    <h2>4. Di mana data disimpan</h2>
    <ul>
      <li><b>Mod Awan:</b> pangkalan data Supabase di rantau Singapura, disulitkan semasa penghantaran (HTTPS).</li>
      <li><b>Mod Demo / pilot:</b> dalam pelayar peranti anda sahaja (localStorage). Memadam data pelayar akan memadam data ini.</li>
      <li>Tiada skrip analitik atau iklan pihak ketiga dimuatkan. Pada laman rasmi, fon turut dihoskan bersama app (versi pilot memuatkan fon daripada Google Fonts).</li>
    </ul>

    <h2>5. Berapa lama disimpan & cara memadam</h2>
    <ul>
      <li>Data disimpan selagi akaun aktif.</li>
      <li><b>Padam profil anak:</b> Zon Ibu → Profil Anak → Ubah → Padam. Semua bintang, kemajuan dan rekod aktiviti anak itu dipadam serta-merta.</li>
      <li><b>Padam keseluruhan akaun:</b> Zon Ibu → Tetapan → <b>Padam akaun</b>. Akaun, semua profil anak, kemajuan, planner dan jurnal dipadam serta-merta dan tidak boleh dipulihkan. Maklum balas yang pernah dihantar dikekalkan tanpa dikaitkan dengan anda.</li>
    </ul>

    <h2>6. Hak anda</h2>
    <p>Selaras dengan Akta Perlindungan Data Peribadi 2010 (PDPA), anda boleh meminta salinan data anda, membetulkannya, atau memintanya dipadam. Ibu bapa/penjaga bertanggungjawab ke atas akaun dan profil anak di bawah jagaan mereka.</p>

    <h2>7. Keselamatan kanak-kanak</h2>
    <ul>
      <li>Tiada sembang, mesej atau perkongsian antara pengguna.</li>
      <li>Tiada pautan keluar atau pembelian dalam bahagian anak.</li>
      <li>"Pintu ibu bapa" (soalan dewasa) melindungi Zon Ibu, laporan, tetapan dan profil anak.</li>
    </ul>

    <h2>8. Perubahan polisi</h2>
    <p>Jika polisi ini berubah, tarikh di atas akan dikemas kini dan perubahan penting akan dimaklumkan dalam app.</p>
    <p style="margin-top:24px"><a class="btn ghost" href="${back}">← Kembali</a></p>
  </main>`;
}
