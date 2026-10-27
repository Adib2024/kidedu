import { store } from "../store.js";
import { esc, uid, toast } from "../util.js";
import { SECTIONS, TOTAL_TOPICS } from "../sections.js";
import { mascot } from "../mascot.js";
import { installCard, bindInstall } from "../install.js";

export function landing(el) {
  const logged = !!store.user;
  const cta = logged
    ? `<a class="btn big" href="#/app">Masuk ke App 🎈</a>`
    : `<a class="btn big" href="#/daftar">Daftar Percuma 🎉</a><button class="btn big sun" data-guest>Cuba Terus ▶️</button>${store.mode === "cloud" ? `<a class="btn big ghost" href="#/masuk">Log Masuk</a>` : ""}`;

  const kidsCount = SECTIONS.filter((x) => x.zone === "anak").reduce((n, x) => n + x.count, 0);
  el.innerHTML = `
  <header class="topbar"><div class="wrap">
    <a class="brand" href="#/" aria-label="Playora"><span class="logo">🐼</span><span class="txt">Playora</span></a><span class="spacer"></span>
    ${logged ? `<a class="btn sm" href="#/app">Buka App</a>` : `<a class="btn sm ghost" href="#/masuk">Log Masuk</a>`}
  </div></header>
  <main>
    <section class="lp-hero"><div class="wrap lp-hero-in">
      <div class="lp-copy">
        <span class="lp-eyebrow">✨ Akses Beta · Percuma</span>
        <h1 class="lp-title">Belajar sambil bermain bersama <span class="logo-type"><span class="a">Play</span><span class="b">ora</span></span></h1>
        <p class="lp-lead">${TOTAL_TOPICS} topik dalam Bahasa Melayu & English — games, buku cerita bersuara, pensel warna digital & worksheet. Plus <b>Zon Ibu</b> untuk anda.</p>
        <div class="lp-cta">${cta}</div>
        <ul class="lp-trust" aria-label="Ciri utama">
          <li>👶 Umur 3–9 tahun</li><li>🔊 Bacaan suara</li><li>🚫 Tiada iklan</li><li>📱 Telefon, tablet & PC</li>
        </ul>
      </div>
      <div class="lp-art" aria-hidden="true">
        <div class="lp-phone">
          <div class="lp-phone-top">${mascot("cheer", 40, "", { outfit: null })}<b>Hai, Adik!</b><span class="star-pill">⭐ 12</span></div>
          <div class="lp-phone-grid">
            ${SECTIONS.filter((x) => x.zone === "anak").slice(0, 4).map((x) => `<div style="background:${x.color}"><span>${x.emoji}</span><b>${esc(x.title)}</b></div>`).join("")}
          </div>
          <div class="lp-phone-q"><b>3 × 4 = ?</b><div><span>7</span><span class="ok">12</span><span>14</span></div></div>
        </div>
        <span class="lp-float f1">🐰</span><span class="lp-float f2">⭐</span><span class="lp-float f3">🍭</span>
      </div>
    </div></section>

    <div class="wrap">
      <section class="lp-stats" aria-label="Kandungan">
        <div><b>${TOTAL_TOPICS}</b><span>topik</span></div>
        <div><b>${kidsCount}</b><span>aktiviti anak</span></div>
        <div><b>30</b><span>pelekat ganjaran</span></div>
        <div><b>∞</b><span>soalan rawak</span></div>
      </section>

      <div class="lp-head"><h2>Apa ada dalam Playora?</h2><p>Setiap seksyen direka untuk belajar tahap demi tahap — anak kumpul bintang, ibu nampak kemajuan.</p></div>
      <div class="lp-sections">
        ${SECTIONS.map((s) => `
          <article class="lp-sec" style="--sec:${s.color}">
            <div class="lp-sec-h"><span class="em">${s.emoji}</span><div><h3>${esc(s.title)}</h3><span class="small muted">${s.count} topik · ${s.zone === "anak" ? "untuk anak" : "untuk ibu"}</span></div></div>
            <p>${esc(s.blurb)}</p>
            <div class="lp-chips">${s.list.slice(0, 4).map((it) => `<a href="${logged ? s.href + "/" + it.id : "#/daftar"}">${it.emoji} ${esc(it.title)}</a>`).join("")}${s.count > 4 ? `<span>+${s.count - 4} lagi</span>` : ""}</div>
          </article>`).join("")}
      </div>

      <div class="lp-head"><h2>Kenapa ibu bapa suka?</h2></div>
      <div class="lp-why">
        ${[
          ["⭐", "Bintang & pelekat", "Setiap aktiviti beri bintang. Kumpul untuk buka pelekat & lencana — anak bermotivasi untuk terus belajar."],
          ["🔊", "Bacaan suara", "Soalan & buku cerita boleh dibacakan — sesuai untuk anak yang belum lancar membaca."],
          ["👨‍👩‍👧", "Ramai anak, satu akaun", "Profil berasingan untuk setiap anak, dengan laporan kemajuan untuk ibu bapa."],
          ["♾️", "Soalan tidak berulang", "Soalan dijana rawak setiap kali bermain — latihan tanpa had."],
          ["📱", "Pasang seperti app", "Tambah ke skrin utama. Berfungsi pada telefon, tablet & komputer."],
          ["💖", "Ibu pun dijaga", "Planner, jurnal emosi & semakan kesejahteraan khas untuk ibu."],
        ].map(([e, t, d]) => `<div class="lp-why-i"><span class="em">${e}</span><div><h3>${t}</h3><p>${d}</p></div></div>`).join("")}
      </div>

      <div class="lp-head"><h2>Mula dalam 3 langkah</h2></div>
      <ol class="lp-steps">
        ${[["📝", "Daftar akaun ibu/bapa", "Percuma, ambil masa seminit."], ["🧒", "Tambah profil anak", "Nama panggilan & umur sahaja."], ["🏆", "Main & kumpul bintang!", "Ikut misi harian & cadangan."]].map(([e, t, d], i) => `<li><span class="n">${i + 1}</span><span class="em">${e}</span><h3>${t}</h3><p>${d}</p></li>`).join("")}
      </ol>

      <div class="lp-head"><h2>Soalan lazim</h2></div>
      <div class="faq">
        ${[
          ["Untuk umur berapa?", "Sesuai untuk kanak-kanak 3–9 tahun. Tahap bermula mudah dan meningkat secara beransur-ansur."],
          ["Perlu internet?", "Selepas dibuka sekali, kebanyakan aktiviti boleh digunakan walaupun sambungan lemah. Untuk menyegerakkan data akaun, internet diperlukan."],
          ["Boleh guna untuk lebih seorang anak?", "Boleh! Tambah profil untuk setiap anak dalam satu akaun ibu/bapa."],
          ["Bagaimana cetak worksheet?", "Buka Worksheet, pilih jenis, tekan 'Cetak / PDF'. Pilih 'Save as PDF' jika mahu simpan."],
          ["Adakah data anak selamat?", "Kami hanya menyimpan nama panggilan, umur (pilihan), avatar & kemajuan. Tiada iklan dan tiada perkongsian data. Baca <a href='#/privasi'>Polisi Privasi</a>."],
        ].map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("")}
      </div>

      <section class="lp-final">
        <div style="display:grid;place-items:center">${mascot("cheer", 110, "bob", { outfit: null })}</div>
        <h2>Jom mula hari ini!</h2>
        <p>Percuma semasa beta. Tiada kad kredit diperlukan.</p>
        <div class="lp-cta center-x">${cta}</div>
        <div class="lp-install">${installCard()}</div>
      </section>
    </div>
  </main>
  <footer class="footer">🐼 <b>Playora</b> · Belajar sambil bermain · <a href="#/privasi">Polisi Privasi</a><br>© ${new Date().getFullYear()} · Dibina dengan 💖 untuk anak-anak Malaysia</footer>`;

  bindInstall(el);
  el.querySelectorAll("[data-guest]").forEach((b) => (b.onclick = async () => {
    b.disabled = true;
    try {
      if (store.mode === "cloud") {
        await store.startTrial({ name: "Adik", age: 7 }); // device-only until they sign up (Simpan ke akaun)
        toast("Selamat mencuba! 🎉 Tiada pendaftaran diperlukan.");
      } else {
        await store.signUp({ name: "Tetamu", email: `tetamu-${uid()}@demo.local`, password: uid() + uid() });
        await store.addChild({ name: "Adik", age: 5, avatar: "🐼" });
        toast("Selamat datang! 🎉 (akaun tetamu)");
      }
      location.hash = "/app";
    } catch (e) { toast(e.message); b.disabled = false; }
  }));
}
