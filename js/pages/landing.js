import { store } from "../store.js";
import { esc, uid, toast } from "../util.js";
import { SECTIONS, TOTAL_TOPICS } from "../sections.js";

export function landing(el) {
  const logged = !!store.user;
  const cta = logged
    ? `<a class="btn big" href="#/app">Masuk ke App 🎈</a>`
    : `<a class="btn big" href="#/daftar">Daftar Percuma 🎉</a>${store.mode === "demo" ? `<button class="btn big sun" data-guest>Cuba Terus ▶️</button>` : `<a class="btn big ghost" href="#/masuk">Log Masuk</a>`}`;

  el.innerHTML = `
  <header class="topbar"><div class="wrap">
    <a class="brand" href="#/"><span class="logo">🐼</span><span>Cilikopia</span></a><span class="spacer"></span>
    ${logged ? `<a class="btn sm sun" href="#/app">Buka App</a>` : `<a class="btn sm sun" href="#/masuk">Log Masuk</a>`}
  </div></header>
  <main class="wrap">
    <section class="hero">
      <div class="hero-card">
        <span class="float" style="left:4%;top:6%">🐰</span><span class="float" style="right:5%;top:8%;animation-delay:-1s">🍭</span>
        <span class="float" style="left:6%;bottom:30%;animation-delay:-2s">🧒</span><span class="float" style="right:6%;bottom:32%;animation-delay:-3s">👧</span>
        <div style="font-size:4rem" class="boot-logo">🐼</div>
        <div class="logo-type"><span class="a">Cilik</span><span class="b">opia</span></div>
        <div class="tag">Belajar melalui <b>Games Online</b>, <b>Worksheet</b>, <b>Buku Cerita</b>, <b>Planner</b> & <b>Zon Ibu</b></div>
        <div class="feature-row">
          <div class="feature"><div class="ic" style="background:var(--pink-3)">📖</div><b>${TOTAL_TOPICS} Topik Premium</b></div>
          <div class="feature"><div class="ic" style="background:var(--lime-3)">🎮</div><b>Main Games Online</b></div>
          <div class="feature"><div class="ic" style="background:var(--sky-3)">📝</div><b>Cetak Worksheet</b></div>
          <div class="feature"><div class="ic" style="background:var(--orange-3)">🎧</div><b>Audio & Bacaan Suara</b></div>
        </div>
        <div class="price-tag"><small>Akses Beta</small><strong>PERCUMA</strong></div>
        <div class="row" style="justify-content:center;margin-top:18px">${cta}</div>
        <p class="small" style="margin-top:12px">💖 Satu platform lengkap untuk belajar sambil bermain & membantu perkembangan anak.</p>
      </div>
    </section>

    <div class="section-title"><h2>Terokai Dunia dengan Amazing Games & Worksheet!</h2>
      <p>Bina kreativiti anak-anak dengan permainan tahap demi tahap & permainan menguji minda</p></div>

    ${SECTIONS.map((s) => `
      <section class="banner" style="margin-bottom:20px;text-align:center">
        <span class="deco" style="left:10px;top:10px">${s.emoji}</span><span class="deco" style="right:10px;top:10px">🍬</span>
        <h2>${esc(s.title)}</h2><span class="sub">${s.count} topik</span>
        <p style="margin:12px auto 14px;max-width:560px;font-weight:700">${esc(s.blurb)}</p>
        <div class="grid" style="text-align:center">
          ${s.list.map((it) => `<a class="tile" href="${logged ? s.href + "/" + it.id : "#/daftar"}" style="--tile:${it.color || "#fff"};min-height:120px"><span class="em" style="font-size:2.2rem">${it.emoji}</span><span class="tt" style="font-size:.92rem">${esc(it.title)}</span></a>`).join("")}
        </div>
      </section>`).join("")}

    <div class="section-title"><h2>Kenapa Ibu Bapa Suka?</h2></div>
    <div class="grid two">
      ${[
        ["⭐", "Sistem bintang & pelekat", "Anak kumpul bintang setiap aktiviti, buka pelekat & lencana — motivasi untuk terus belajar."],
        ["🔊", "Bacaan suara automatik", "Soalan & buku cerita boleh dibacakan — sesuai untuk anak yang belum lancar membaca."],
        ["👨‍👩‍👧", "Ramai anak, satu akaun", "Cipta profil setiap anak. Kemajuan dijejak berasingan dengan laporan untuk ibu bapa."],
        ["📱", "Pasang seperti app", "Tambah ke skrin utama telefon. Berfungsi pada telefon, tablet & komputer."],
        ["♾️", "Soalan tidak berulang", "Soalan dijana secara rawak setiap kali bermain — latihan tanpa had."],
        ["💖", "Ibu pun dijaga", "Planner, jurnal emosi & semakan kesejahteraan khas untuk ibu."],
      ].map(([e, t, d]) => `<div class="card soft row" style="align-items:flex-start;flex-wrap:nowrap"><span style="font-size:2.2rem">${e}</span><div><h3 style="margin:0 0 4px">${t}</h3><p class="small" style="margin:0">${d}</p></div></div>`).join("")}
    </div>

    <div class="section-title"><h2>Cara Mula</h2></div>
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">
      ${[["1", "Daftar akaun ibu/bapa", "📝"], ["2", "Tambah profil anak", "🧒"], ["3", "Main, belajar & kumpul bintang!", "🏆"]].map(([n, t, e]) => `<div class="card center"><div style="font-size:2.6rem">${e}</div><div class="star-pill">Langkah ${n}</div><h3 style="margin-top:8px">${t}</h3></div>`).join("")}
    </div>

    <div class="section-title"><h2>Soalan Lazim</h2></div>
    <div class="faq" style="max-width:760px;margin:0 auto">
      ${[
        ["Untuk umur berapa?", "Sesuai untuk kanak-kanak 3–9 tahun. Tahap bermula mudah dan meningkat secara beransur-ansur."],
        ["Perlu internet?", "Selepas dibuka sekali, kebanyakan aktiviti boleh digunakan walaupun sambungan lemah. Untuk menyegerakkan data akaun, internet diperlukan."],
        ["Boleh guna untuk lebih seorang anak?", "Boleh! Tambah seberapa banyak profil anak dalam satu akaun ibu/bapa."],
        ["Bagaimana cetak worksheet?", "Buka Worksheet, pilih jenis, tekan 'Cetak / PDF'. Pilih 'Save as PDF' jika mahu simpan."],
        ["Adakah data anak selamat?", "Kami hanya menyimpan nama panggilan, umur & kemajuan. Tiada iklan dan tiada perkongsian data."],
      ].map(([q, a]) => `<details><summary>${q}</summary><p style="margin:8px 0 0">${a}</p></details>`).join("")}
    </div>

    <div class="hero-card" style="margin:34px 0 0">
      <h2 style="color:var(--pink);font-size:2rem">Jom mula hari ini! 🎈</h2>
      <div class="row" style="justify-content:center">${cta}</div>
    </div>
  </main>
  <footer class="footer">🐼 Cilikopia · Belajar sambil bermain<br>© ${new Date().getFullYear()} · Dibina dengan 💖 untuk anak-anak Malaysia</footer>`;

  el.querySelectorAll("[data-guest]").forEach((b) => (b.onclick = async () => {
    b.disabled = true;
    try {
      await store.signUp({ name: "Tetamu", email: `tetamu-${uid()}@demo.local`, password: uid() + uid() });
      await store.addChild({ name: "Adik", age: 5, avatar: "🐼" });
      toast("Selamat datang! 🎉 (akaun tetamu)");
      location.hash = "/app";
    } catch (e) { toast(e.message); b.disabled = false; }
  }));
}
