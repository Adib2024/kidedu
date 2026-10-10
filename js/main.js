// App shell: router, layout, auth pages, hub, children, rewards, report, settings.
import { store, STICKERS, STARS_PER_STICKER } from "./store.js";
import { $, esc, toast, stopSpeak, confirmBox, isSoundOn, setSound, todayKey } from "./util.js";
import { autoSpeakOn, setAutoSpeak } from "./engine.js";
import { SECTIONS, sectionProgress } from "./sections.js";
import { landing } from "./pages/landing.js";
import { gamesList, gamePlay } from "./pages/games.js";
import { mapsList, mapView } from "./pages/maps.js";
import { booksList, bookRead } from "./pages/books.js";
import { worksheetList, worksheetView } from "./pages/worksheets.js";
import { penselList, penselView } from "./pages/pensel.js";
import { ibuList, ibuView } from "./pages/ibu.js";
import { plannerList, plannerView } from "./pages/planner.js";
import { tipsList, tipsView } from "./pages/tips.js";
import { openFeedback, fabHtml, revealFab, feedbackAdminPage, feedbackBackend } from "./feedback.js";

const app = document.getElementById("app");
let cleanup = null;

// ---------------------------------------------------------------- routes
const routes = [
  ["/", landing, { shell: false }],
  ["/masuk", loginPage, { shell: false }],
  ["/daftar", signupPage, { shell: false }],
  ["/lupa", forgotPage, { shell: false }],
  ["/kata-laluan-baru", newPasswordPage, { shell: false, auth: true }],
  ["/app", hubPage, { auth: true, child: true, nav: "home" }],
  ["/anak", childrenPage, { auth: true, nav: "home" }],
  ["/ganjaran", rewardsPage, { auth: true, child: true, nav: "rewards" }],
  ["/laporan", reportPage, { auth: true, nav: "ibu" }],
  ["/tetapan", settingsPage, { auth: true, nav: "ibu" }],
  ["/maklum-balas", feedbackAdminPage, { nav: "ibu" }],
  ["/zon-ibu", momZonePage, { auth: true, nav: "ibu" }],
  ["/games", gamesList, { auth: true, child: true, nav: "games" }],
  ["/games/:id", gamePlay, { auth: true, child: true, nav: "games" }],
  ["/peta", mapsList, { auth: true, child: true, nav: "games" }],
  ["/peta/:id", mapView, { auth: true, child: true, nav: "games" }],
  ["/buku", booksList, { auth: true, child: true, nav: "books" }],
  ["/buku/:id", bookRead, { auth: true, child: true, nav: "books" }],
  ["/worksheet", worksheetList, { auth: true, nav: "home" }],
  ["/worksheet/:id", worksheetView, { auth: true, nav: "home" }],
  ["/pensel", penselList, { auth: true, child: true, nav: "home" }],
  ["/pensel/:id", penselView, { auth: true, child: true, nav: "home" }],
  ["/ibu", ibuList, { auth: true, nav: "ibu" }],
  ["/ibu/:id", ibuView, { auth: true, nav: "ibu" }],
  ["/planner", plannerList, { auth: true, nav: "ibu" }],
  ["/planner/:id", plannerView, { auth: true, nav: "ibu" }],
  ["/tips", tipsList, { auth: true, nav: "ibu" }],
  ["/tips/:id", tipsView, { auth: true, nav: "ibu" }],
].map(([path, fn, meta]) => {
  const keys = [];
  const re = new RegExp("^" + path.replace(/:(\w+)/g, (_, k) => (keys.push(k), "([^/]+)")) + "/?$");
  return { re, keys, fn, meta };
});

export function go(hash) { location.hash = hash; }

function parse() {
  const raw = location.hash.slice(1) || "/";
  const [path, qs] = raw.split("?");
  return { path, query: Object.fromEntries(new URLSearchParams(qs || "")) };
}

async function render() {
  stopSpeak();
  if (typeof cleanup === "function") { try { cleanup(); } catch {} }
  cleanup = null;
  const { path, query } = parse();
  let route = routes.find((r) => r.re.test(path));
  if (!route) { go("/"); return; }
  const m = path.match(route.re);
  const params = Object.fromEntries(route.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));

  if (route.meta.auth && !store.user) { go(`/masuk?next=${encodeURIComponent(path)}`); return; }
  if ((path === "/masuk" || path === "/daftar") && store.user) { go(query.next || "/app"); return; }
  if (route.meta.child && store.user && !store.children.length) { go("/anak?baru=1"); return; }

  let mount = app;
  if (route.meta.shell === false) {
    app.innerHTML = `<div id="bare"></div>`;
    mount = $("#bare");
  } else {
    app.innerHTML = shell(route.meta.nav);
    mount = $("#view");
    bindShell();
  }
  window.scrollTo(0, 0);
  if (!app.querySelector("[data-fb]")) app.insertAdjacentHTML("beforeend", fabHtml(route.meta.shell === false ? "low" : ""));
  revealFab(app);
  try {
    cleanup = await route.fn(mount, params, query);
  } catch (e) {
    console.error(e);
    mount.innerHTML = `<div class="wrap page"><div class="alert">Maaf, ada ralat: ${esc(e.message)}</div><p><a href="#/app">← Kembali ke laman utama</a></p></div>`;
  }
}

// ---------------------------------------------------------------- shell
function shell(nav) {
  const c = store.activeChild;
  const stars = c ? store.totalStars(c.id) : 0;
  const n = (k, ic, label, href) => `<a href="${href}" class="${nav === k ? "on" : ""}"><span class="ic">${ic}</span>${label}</a>`;
  return `
  <header class="topbar no-print">
    <div class="wrap">
      <a class="brand" href="#/app"><span class="logo">🐼</span><span class="txt">Pelangi Pop</span></a>
      <span class="spacer"></span>
      ${c ? `<a class="child-chip" href="#/anak" title="Tukar profil anak"><span class="av">${esc(c.avatar || "🧒")}</span><span class="nm">${esc(c.name)}</span><span class="star-pill">⭐ ${stars}</span></a>` : ""}
      <a class="icon-btn" href="#/tetapan" aria-label="Tetapan">⚙️</a>
    </div>
  </header>
  ${store.mode === "demo" && !sessionStorage.getItem("ppl_demo_ok") ? `<div class="wrap no-print"><div class="alert info small" style="margin-top:10px">🧪 <b>Mod Demo</b>: data disimpan dalam pelayar ini sahaja. <button class="btn sm ghost" data-demo-ok style="margin-left:6px">Faham</button></div></div>` : ""}
  <main id="view"></main>
  <nav class="bottomnav no-print" aria-label="Navigasi utama">
    ${n("home", "🏠", "Utama", "#/app")}
    ${n("games", "🎮", "Games", "#/games")}
    ${n("books", "📚", "Buku", "#/buku")}
    ${n("rewards", "🏆", "Ganjaran", "#/ganjaran")}
    ${n("ibu", "👩", "Zon Ibu", "#/zon-ibu")}
  </nav>`;
}
function bindShell() {
  const b = $("[data-demo-ok]");
  if (b) b.onclick = () => { sessionStorage.setItem("ppl_demo_ok", "1"); b.closest(".wrap").remove(); };
}
// keep the star counter in the top bar fresh
store.on(() => {
  const pill = $(".child-chip .star-pill");
  if (pill && store.activeChild) pill.textContent = `⭐ ${store.totalStars()}`;
});

// ---------------------------------------------------------------- auth pages
function authFrame(inner) {
  return `<div class="wrap page" style="max-width:480px">
    <p style="margin-top:8px"><a href="#/" style="text-decoration:none;font-weight:800">← Laman utama</a></p>
    <div class="center" style="margin:10px 0 16px"><div style="font-size:4rem" class="boot-logo">🐼</div>
      <div class="logo-type" style="font-size:2.4rem;margin:0"><span class="b">Pelangi Pop</span><span class="a">Land</span></div></div>
    <div class="card pad-lg">${inner}</div>
    ${store.mode === "demo" ? `<p class="small muted center" style="margin-top:12px">🧪 Mod Demo — akaun disimpan dalam pelayar ini sahaja.</p>` : ""}
  </div>`;
}
function loginPage(el, _p, query) {
  el.innerHTML = authFrame(`
    <h2>Log Masuk</h2>
    <form data-f novalidate>
      <label class="f"><span>Emel</span><input class="input" type="email" name="email" autocomplete="email" required></label>
      <label class="f"><span>Kata laluan</span><input class="input" type="password" name="password" autocomplete="current-password" required></label>
      <div class="alert" data-err hidden></div>
      <button class="btn block big" type="submit">Masuk 🚀</button>
    </form>
    <p class="center" style="margin-top:14px">Belum ada akaun? <a href="#/daftar${query.next ? "?next=" + encodeURIComponent(query.next) : ""}">Daftar percuma</a><br><a href="#/lupa" class="small">Lupa kata laluan?</a></p>`);
  formHandler(el, async (d) => {
    await store.signIn(d);
    go(query.next || "/app");
  });
}
function signupPage(el, _p, query) {
  el.innerHTML = authFrame(`
    <h2>Daftar Akaun Ibu/Bapa</h2>
    <form data-f novalidate>
      <label class="f"><span>Nama anda</span><input class="input" name="name" autocomplete="name" required maxlength="60"></label>
      <label class="f"><span>Emel</span><input class="input" type="email" name="email" autocomplete="email" required></label>
      <label class="f"><span>Kata laluan (min 6 aksara)</span><input class="input" type="password" name="password" autocomplete="new-password" minlength="6" required></label>
      <div class="alert" data-err hidden></div>
      <button class="btn block big lime" type="submit">Daftar & Mula 🎉</button>
    </form>
    <p class="center" style="margin-top:14px">Sudah ada akaun? <a href="#/masuk">Log masuk</a></p>`);
  formHandler(el, async (d) => {
    if (!d.name.trim()) throw new Error("Sila isi nama anda.");
    if (!/^\S+@\S+\.\S+$/.test(d.email)) throw new Error("Format emel tidak sah.");
    if (d.password.length < 6) throw new Error("Kata laluan mesti sekurang-kurangnya 6 aksara.");
    const r = await store.signUp(d);
    if (r.needsConfirm) {
      el.querySelector(".card").innerHTML = `<h2>Semak emel anda 📧</h2><p>Kami telah menghantar pautan pengesahan ke <b>${esc(d.email)}</b>. Klik pautan itu, kemudian log masuk.</p><a class="btn block" href="#/masuk">Ke Log Masuk</a>`;
      return;
    }
    toast("Akaun berjaya dicipta! 🎉");
    go("/anak?baru=1");
  });
}
function forgotPage(el) {
  el.innerHTML = authFrame(`
    <h2>Lupa Kata Laluan</h2>
    <form data-f novalidate>
      <label class="f"><span>Emel akaun</span><input class="input" type="email" name="email" required></label>
      <div class="alert" data-err hidden></div>
      <button class="btn block" type="submit">Hantar pautan reset</button>
    </form>
    <p class="center" style="margin-top:14px"><a href="#/masuk">← Log masuk</a></p>`);
  formHandler(el, async (d) => {
    await store.resetPassword(d.email);
    el.querySelector(".card").innerHTML = `<h2>Emel dihantar 📧</h2><p>Jika akaun wujud, pautan reset kata laluan telah dihantar ke ${esc(d.email)}.</p><a class="btn block" href="#/masuk">Ke Log Masuk</a>`;
  });
}
function newPasswordPage(el) {
  el.innerHTML = authFrame(`
    <h2>Kata Laluan Baru</h2>
    <form data-f novalidate>
      <label class="f"><span>Kata laluan baru (min 6 aksara)</span><input class="input" type="password" name="password" autocomplete="new-password" minlength="6" required></label>
      <div class="alert" data-err hidden></div>
      <button class="btn block" type="submit">Simpan</button>
    </form>`);
  formHandler(el, async (d) => {
    if (d.password.length < 6) throw new Error("Kata laluan mesti sekurang-kurangnya 6 aksara.");
    await store.updatePassword(d.password);
    toast("Kata laluan dikemas kini ✅");
    go("/app");
  });
}
function formHandler(el, fn) {
  const f = el.querySelector("[data-f]");
  const err = el.querySelector("[data-err]");
  f.onsubmit = async (e) => {
    e.preventDefault();
    err.hidden = true;
    const btn = f.querySelector("[type=submit]");
    btn.disabled = true;
    try { await fn(Object.fromEntries(new FormData(f))); }
    catch (ex) { err.textContent = ex.message; err.hidden = false; }
    finally { btn.disabled = false; }
  };
}

// ---------------------------------------------------------------- hub
function hubPage(el) {
  const c = store.activeChild;
  const stars = store.totalStars(c.id);
  const stick = store.stickerCount(c.id);
  const toNext = STARS_PER_STICKER - (stars % STARS_PER_STICKER);
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Selamat pagi" : hour < 15 ? "Selamat tengah hari" : hour < 19 ? "Selamat petang" : "Selamat malam";
  const kids = SECTIONS.filter((s) => s.zone === "anak");
  const mom = SECTIONS.filter((s) => s.zone === "ibu");
  const tile = (s) => {
    const p = sectionProgress(s, c.id);
    return `<a class="tile" href="${s.href}" style="--tile:${s.color}">
      <span class="em">${s.emoji}</span><span class="tt">${s.title}</span><span class="ds">${s.count} topik</span>
      ${p != null ? `<span class="stars">⭐ ${p}</span>` : ""}</a>`;
  };
  el.innerHTML = `<div class="wrap page stack">
    <section class="banner">
      <span class="deco" style="left:10px;top:8px">🍭</span><span class="deco" style="right:12px;top:10px">🌈</span>
      <div class="mascot-say"><div class="m">${esc(c.avatar || "🐼")}</div><div class="bubble">${greet}, ${esc(c.name)}! Jom belajar sambil bermain hari ini 🎈</div></div>
      <div class="row" style="justify-content:center;margin-top:12px">
        <span class="star-pill" style="font-size:1.1rem">⭐ ${stars} bintang</span>
        <a class="star-pill" style="font-size:1.1rem;background:#fff;text-decoration:none" href="#/ganjaran">🎁 ${stick}/${STICKERS.length} pelekat</a>
      </div>
      <p class="small" style="margin:8px 0 0">Kumpul <b>${toNext}</b> ⭐ lagi untuk pelekat seterusnya!</p>
    </section>
    <h2 style="margin-top:22px">🧒 Zon Anak</h2>
    <div class="grid">${kids.map(tile).join("")}</div>
    <h2 style="margin-top:22px">👩 Zon Ibu</h2>
    <div class="grid">${mom.map(tile).join("")}
      <a class="tile" href="#/laporan" style="--tile:#e8f7ff"><span class="em">📊</span><span class="tt">Laporan Anak</span><span class="ds">Lihat kemajuan</span></a>
    </div>
  </div>`;
}

function momZonePage(el) {
  const mom = SECTIONS.filter((s) => s.zone === "ibu");
  el.innerHTML = `<div class="wrap page stack">
    <section class="banner" style="background:linear-gradient(180deg,#ffe0f0,#ffc4e1)">
      <h1>Zon Ibu 💖</h1><span class="sub">Rehat, rancang & berkembang</span>
    </section>
    <div class="grid">
      ${mom.map((s) => `<a class="tile" href="${s.href}" style="--tile:${s.color}"><span class="em">${s.emoji}</span><span class="tt">${s.title}</span><span class="ds">${s.count} topik</span></a>`).join("")}
      <a class="tile" href="#/laporan" style="--tile:#e8f7ff"><span class="em">📊</span><span class="tt">Laporan Anak</span><span class="ds">Kemajuan pembelajaran</span></a>
      <a class="tile" href="#/anak" style="--tile:#fff3c4"><span class="em">👨‍👩‍👧</span><span class="tt">Profil Anak</span><span class="ds">Tambah / urus</span></a>
      <a class="tile" href="#/tetapan" style="--tile:#f1f1f1"><span class="em">⚙️</span><span class="tt">Tetapan</span><span class="ds">Bunyi, akaun</span></a>
    </div>
  </div>`;
}

// ---------------------------------------------------------------- children
const AVATARS = ["🐼", "🐰", "🦄", "🐯", "🦊", "🐻", "🐱", "🐶", "🐸", "🐵", "🦁", "🐨", "👧", "👦", "🧕", "👸", "🤴", "🦸"];
function childrenPage(el, _p, query) {
  const draw = () => {
    const active = store.activeChild;
    el.innerHTML = `<div class="wrap page stack" style="max-width:720px">
      <div class="pagehead">${store.children.length ? `<a class="back" href="#/app" aria-label="Kembali">←</a>` : ""}<h1>Profil Anak</h1></div>
      ${query.baru && !store.children.length ? `<div class="alert info">👋 Selamat datang! Tambah profil anak dahulu supaya bintang & kemajuan dapat disimpan.</div>` : ""}
      <div class="stack">
        ${store.children.map((c) => `
          <div class="card soft row">
            <span style="font-size:2.6rem">${esc(c.avatar || "🧒")}</span>
            <div class="grow"><b style="font-size:1.15rem">${esc(c.name)}</b><div class="small muted">${c.age ? `${esc(c.age)} tahun · ` : ""}⭐ ${store.totalStars(c.id)}</div></div>
            ${active?.id === c.id ? `<span class="star-pill">Aktif</span>` : `<button class="btn sm" data-use="${c.id}">Guna</button>`}
            <button class="btn sm ghost" data-edit="${c.id}" aria-label="Ubah">✏️</button>
          </div>`).join("")}
      </div>
      <div class="card">
        <h3 data-ftitle>Tambah anak</h3>
        <form data-f>
          <input type="hidden" name="id">
          <label class="f"><span>Nama panggilan</span><input class="input" name="name" required maxlength="30"></label>
          <label class="f"><span>Umur</span><select class="input" name="age">${["", 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((a) => `<option value="${a}">${a ? a + " tahun" : "— pilih —"}</option>`).join("")}</select></label>
          <span style="font-weight:800;font-size:.92rem">Pilih avatar</span>
          <div class="chips" style="margin:6px 0 14px">${AVATARS.map((a, i) => `<label class="chip" style="font-size:1.5rem;padding:4px 8px"><input type="radio" name="avatar" value="${a}" ${i === 0 ? "checked" : ""} style="display:none">${a}</label>`).join("")}</div>
          <div class="row"><button class="btn lime grow" type="submit">Simpan</button><button class="btn ghost" type="button" data-cancel hidden>Batal</button><button class="btn ghost" type="button" data-del hidden style="--fg:#b4235f">Padam</button></div>
        </form>
      </div>
      ${store.children.length ? `<a class="btn block big" href="#/app">Mula Bermain 🎈</a>` : ""}
    </div>`;
    const f = el.querySelector("[data-f]");
    const syncChips = () => f.querySelectorAll(".chip").forEach((ch) => ch.classList.toggle("on", ch.querySelector("input").checked));
    f.querySelectorAll(".chip input").forEach((r) => (r.onchange = syncChips));
    syncChips();
    el.querySelectorAll("[data-use]").forEach((b) => (b.onclick = () => { store.setActiveChild(b.dataset.use); toast("Profil ditukar"); go("/app"); }));
    el.querySelectorAll("[data-edit]").forEach((b) => (b.onclick = () => {
      const c = store.children.find((x) => x.id === b.dataset.edit);
      f.id.value = c.id; f.name.value = c.name; f.age.value = c.age || "";
      f.querySelectorAll("[name=avatar]").forEach((r) => (r.checked = r.value === c.avatar));
      syncChips();
      el.querySelector("[data-ftitle]").textContent = `Ubah ${c.name}`;
      f.querySelector("[data-cancel]").hidden = false;
      f.querySelector("[data-del]").hidden = false;
      f.scrollIntoView({ behavior: "smooth" });
    }));
    f.querySelector("[data-cancel]").onclick = draw;
    f.querySelector("[data-del]").onclick = async () => {
      const c = store.children.find((x) => x.id === f.id.value);
      if (!(await confirmBox(`Padam profil ${c.name}? Semua bintang & kemajuan akan hilang.`, "Padam"))) return;
      await store.removeChild(c.id);
      toast("Profil dipadam");
      draw();
    };
    f.onsubmit = async (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(f));
      const data = { name: d.name.trim(), age: d.age ? Number(d.age) : null, avatar: d.avatar || "🐼" };
      if (!data.name) return toast("Sila isi nama");
      try {
        if (d.id) await store.updateChild(d.id, data);
        else await store.addChild(data);
        toast("Disimpan ✅");
        if (!d.id && query.baru) return go("/app");
        draw();
      } catch (ex) { toast(ex.message); }
    };
  };
  draw();
}

// ---------------------------------------------------------------- rewards
const BADGES = [
  { id: "first", e: "🥇", name: "Langkah Pertama", desc: "Selesaikan 1 aktiviti", test: (r) => r.length >= 1 },
  { id: "s10", e: "🌟", name: "10 Bintang", desc: "Kumpul 10 bintang", test: (_r, s) => s >= 10 },
  { id: "s50", e: "💫", name: "50 Bintang", desc: "Kumpul 50 bintang", test: (_r, s) => s >= 50 },
  { id: "s100", e: "🏆", name: "Juara 100", desc: "Kumpul 100 bintang", test: (_r, s) => s >= 100 },
  { id: "math", e: "🧮", name: "Pakar Sifir", desc: "3 bintang dalam 5 tahap Bijak Sifir", test: (r) => r.filter((x) => x.activity_id.startsWith("game:bijak-sifir") && x.stars === 3).length >= 5 },
  { id: "reader", e: "📚", name: "Ulat Buku", desc: "Baca & jawab 5 buku cerita", test: (r) => r.filter((x) => x.category === "buku").length >= 5 },
  { id: "explorer", e: "🗺️", name: "Pengembara", desc: "Selesaikan 10 stesen peta", test: (r) => r.filter((x) => x.category === "peta" && x.stars > 0).length >= 10 },
  { id: "artist", e: "🎨", name: "Pelukis Cilik", desc: "Selesaikan 5 aktiviti pensel warna", test: (r) => r.filter((x) => x.category === "pensel").length >= 5 },
  { id: "perfect", e: "💯", name: "Sempurna", desc: "Dapat markah penuh 10/10", test: (r) => r.some((x) => x.total >= 10 && x.best_score === x.total) },
  { id: "allgames", e: "🎮", name: "Pemain Serba Boleh", desc: "Main semua 9 games online", test: (r) => new Set(r.filter((x) => x.category === "games").map((x) => x.activity_id.split(":")[1])).size >= 9 },
];
function rewardsPage(el) {
  const c = store.activeChild;
  const rows = Object.values(store.progress[c.id] || {});
  const stars = store.totalStars(c.id);
  const have = store.stickerCount(c.id);
  el.innerHTML = `<div class="wrap page stack">
    <section class="banner"><h1>Buku Ganjaran ${esc(c.avatar || "")}</h1><span class="sub">⭐ ${stars} bintang · 🎁 ${have} pelekat</span>
      <p class="small" style="margin-top:10px">Setiap <b>${STARS_PER_STICKER} bintang</b> membuka 1 pelekat baru!</p>
      <div class="progress" style="max-width:360px;margin:0 auto"><i style="width:${((stars % STARS_PER_STICKER) / STARS_PER_STICKER) * 100}%"></i></div>
    </section>
    <div class="card"><h2>🎁 Koleksi Pelekat</h2>
      <div class="stickers">${STICKERS.map((s, i) => `<div class="sticker ${i < have ? "on" : "off"}" title="${i < have ? "Dibuka" : `Perlu ${(i + 1) * STARS_PER_STICKER} bintang`}">${s}</div>`).join("")}</div>
    </div>
    <div class="card"><h2>🏅 Lencana</h2>
      <div class="grid">${BADGES.map((b) => { const ok = b.test(rows, stars); return `<div class="tile ${ok ? "" : "locked"}" style="cursor:default;min-height:130px"><span class="em">${b.e}</span><span class="tt">${b.name}</span><span class="ds">${b.desc}</span>${ok ? `<span class="badge">✓</span>` : ""}</div>`; }).join("")}</div>
    </div>
  </div>`;
}

// ---------------------------------------------------------------- report
function reportPage(el) {
  if (!store.children.length) { el.innerHTML = `<div class="wrap page"><div class="alert info">Tiada profil anak lagi. <a href="#/anak?baru=1">Tambah sekarang</a></div></div>`; return; }
  const cats = { games: "🎮 Games Online", peta: "🗺️ Peta Kartun", buku: "📚 Buku Cerita", pensel: "🖍️ Pensel Warna" };
  el.innerHTML = `<div class="wrap page stack">
    <div class="pagehead"><a class="back" href="#/zon-ibu" aria-label="Kembali">←</a><h1>Laporan Kemajuan</h1></div>
    ${store.children.map((c) => {
      const rows = Object.values(store.progress[c.id] || {}).sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""));
      const total = rows.reduce((s, r) => s + r.stars, 0);
      const plays = rows.reduce((s, r) => s + (r.plays || 0), 0);
      const week = rows.filter((r) => r.updated_at && Date.now() - new Date(r.updated_at) < 7 * 864e5).length;
      const by = Object.keys(cats).map((k) => { const rr = rows.filter((r) => r.category === k); return { k, n: rr.length, s: rr.reduce((a, r) => a + r.stars, 0), max: rr.length * 3 }; });
      const weak = rows.filter((r) => r.stars <= 1 && r.total).slice(0, 5);
      return `<div class="card stack">
        <div class="row"><span style="font-size:2.4rem">${esc(c.avatar || "🧒")}</span><div class="grow"><h2 style="margin:0">${esc(c.name)}</h2><span class="muted small">${c.age ? esc(c.age) + " tahun" : ""}</span></div></div>
        <div class="grid">
          <div class="panel center"><div style="font-size:1.8rem;font-weight:800">⭐ ${total}</div><div class="small muted">Jumlah bintang</div></div>
          <div class="panel center"><div style="font-size:1.8rem;font-weight:800">${rows.length}</div><div class="small muted">Aktiviti dicuba</div></div>
          <div class="panel center"><div style="font-size:1.8rem;font-weight:800">${plays}</div><div class="small muted">Kali bermain</div></div>
          <div class="panel center"><div style="font-size:1.8rem;font-weight:800">${week}</div><div class="small muted">Aktif 7 hari lepas</div></div>
        </div>
        <div>${by.map((b) => `<div style="margin-bottom:10px"><div class="row between small"><b>${cats[b.k]}</b><span>${b.n} aktiviti · ⭐ ${b.s}</span></div><div class="bar"><i style="width:${b.max ? (b.s / b.max) * 100 : 0}%"></i></div></div>`).join("")}</div>
        ${weak.length ? `<div class="alert info small"><b>Perlu latihan lagi:</b> ${weak.map((w) => esc(activityLabel(w.activity_id))).join(", ")}</div>` : ""}
        <details><summary style="font-weight:800;cursor:pointer">Aktiviti terkini</summary>
          <div class="stack" style="margin-top:8px">${rows.slice(0, 15).map((r) => `<div class="list-item small"><span class="grow">${esc(activityLabel(r.activity_id))}</span><span>${"⭐".repeat(r.stars) || "—"}</span><span class="muted">${r.updated_at ? new Date(r.updated_at).toLocaleDateString("ms-MY") : ""}</span></div>`).join("") || `<p class="muted">Belum ada aktiviti.</p>`}</div>
        </details>
      </div>`;
    }).join("")}
    <button class="btn ghost no-print" onclick="window.print()">🖨️ Cetak laporan</button>
  </div>`;
}
function activityLabel(id) {
  const [cat, a, b] = id.split(":");
  const sec = SECTIONS.find((s) => s.key === cat);
  const item = sec?.list.find((x) => x.id === a);
  if (!item) return id;
  if (cat === "games" && item.levels?.[b]) return `${item.title} — ${item.levels[b].name}`;
  if (cat === "peta" && item.stations?.[b]) return `${item.title} — ${item.stations[b].name}`;
  if (cat === "pensel" && b != null) return `${item.title} — ${b}`;
  return item.title;
}

// ---------------------------------------------------------------- settings
function settingsPage(el) {
  el.innerHTML = `<div class="wrap page stack" style="max-width:640px">
    <div class="pagehead"><a class="back" href="#/zon-ibu" aria-label="Kembali">←</a><h1>Tetapan</h1></div>
    <div class="card stack">
      <label class="check"><input type="checkbox" data-sound ${isSoundOn() ? "checked" : ""}><span>🔔 Kesan bunyi</span></label>
      <label class="check"><input type="checkbox" data-speak ${autoSpeakOn() ? "checked" : ""}><span>🗣️ Baca soalan secara automatik</span></label>
    </div>
    <div class="card">
      <h3>Akaun</h3>
      <p><b>${esc(store.user.name)}</b><br><span class="muted">${esc(store.user.email)}</span></p>
      <p class="small muted">Mod: ${store.mode === "cloud" ? "☁️ Awan (Supabase) — data disegerakkan" : "🧪 Demo — data dalam pelayar ini sahaja"}</p>
      <div class="row"><a class="btn sm ghost" href="#/anak">👨‍👩‍👧 Urus profil anak</a><button class="btn sm" data-out>Log keluar</button></div>
    </div>
    <div class="card">
      <h3>Pasang sebagai App 📱</h3>
      <p class="small">Android/Chrome: tekan menu ⋮ → <b>Tambah ke skrin utama</b>. iPhone/Safari: butang Kongsi → <b>Add to Home Screen</b>.</p>
      <button class="btn sm sky" data-install hidden>Pasang sekarang</button>
    </div>
    <div class="card" data-fbcard hidden>
      <h3>💬 Maklum balas pilot</h3>
      <div class="row"><button class="btn sm lime" data-fb>Hantar maklum balas</button><a class="btn sm ghost" href="#/maklum-balas" data-fbadmin hidden>📋 Lihat semua maklum balas</a></div>
    </div>
    <p class="small muted center">Pelangi Pop Land · v1.1 · ${todayKey()}</p>
  </div>`;
  el.querySelector("[data-sound]").onchange = (e) => setSound(e.target.checked);
  el.querySelector("[data-speak]").onchange = (e) => setAutoSpeak(e.target.checked);
  el.querySelector("[data-out]").onclick = async () => { await store.signOut(); toast("Anda telah log keluar"); go("/"); };
  feedbackBackend().then(async (be) => {
    if (!be) return;
    el.querySelector("[data-fbcard]").hidden = false;
    if (be.kind === "claude" && (await be.user.isOwner())) el.querySelector("[data-fbadmin]").hidden = false;
  });
  const ib = el.querySelector("[data-install]");
  if (deferredInstall) { ib.hidden = false; ib.onclick = () => { deferredInstall.prompt(); deferredInstall = null; ib.hidden = true; }; }
}

// ---------------------------------------------------------------- boot
let deferredInstall = null;
window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferredInstall = e; });
window.addEventListener("hashchange", render);
document.addEventListener("click", (e) => { if (e.target.closest("[data-fb]")) { e.preventDefault(); openFeedback(); } });
store.init().then(render);
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
