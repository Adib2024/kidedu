// App shell: router, layout, auth pages, hub, children, rewards, report, settings.
import { store, STICKERS, STARS_PER_STICKER } from "./store.js";
import { $, esc, toast, stopSpeak, speak, confirmBox, modal, isSoundOn, setSound, todayKey, notFound, safeNext, confetti, sfx } from "./util.js";
import { autoSpeakOn, setAutoSpeak } from "./engine.js";
import { SECTIONS, sectionProgress, searchTopics } from "./sections.js";
import { levelInfo, levelTitle, dailyMissions, weeklyProgress, recommendations, weakSpots, familyOf, streak } from "./progression.js";
import { mascot } from "./mascot.js";
import { SLOTS, ITEMS, itemById, loadShop, balance, buyItem, toggleWear, applyOutfit, outfitLayers } from "./shop.js";
import { GAMES } from "./data/games.js";
import { MAPS } from "./data/maps.js";
import { BOOKS } from "./data/books.js";
import { landing } from "./pages/landing.js";
import { gamesList, gamePlay } from "./pages/games.js";
import { mapsList, mapView } from "./pages/maps.js";
import { booksList, bookRead } from "./pages/books.js";
import { worksheetList, worksheetView } from "./pages/worksheets.js";
import { penselList, penselView } from "./pages/pensel.js";
import { ibuList, ibuView } from "./pages/ibu.js";
import { plannerList, plannerView } from "./pages/planner.js";
import { tipsList, tipsView } from "./pages/tips.js";
import { privacyPage } from "./pages/privacy.js";
import { schoolHome, schoolChapter, schoolPlay, schoolReview, schoolDaily, schoolPrint, nextTopic, subjectProgress, chapterStars } from "./pages/school.js";
import { schoolReport, schoolReportHtml } from "./school/report.js";
import { loadReview } from "./school/review.js";
import { SUBJECTS, gradeOf, gradeLabel, parseActivity, subjectById, topicById, STAGES, REVIEW_ID, DAILY_FAMILY } from "./school/curriculum.js";
import { openFeedback, fabHtml, revealFab, feedbackAdminPage, feedbackBackend } from "./feedback.js";
import { makeChallenge, checkAnswer, gateEnabled, setGateEnabled, parentOk, markParent, closeGate, LOCK_AFTER, LOCK_MS } from "./gate.js";

const app = document.getElementById("app");
let cleanup = null;

// ---------------------------------------------------------------- routes
const routes = [
  ["/", landing, { shell: false }],
  ["/masuk", loginPage, { shell: false }],
  ["/daftar", signupPage, { shell: false }],
  ["/lupa", forgotPage, { shell: false }],
  ["/privasi", privacyPage, { shell: false }],
  ["/kata-laluan-baru", newPasswordPage, { shell: false, auth: true }],
  ["/app", hubPage, { auth: true, child: true, nav: "home" }],
  ["/anak", childrenPage, { auth: true, parent: true, nav: "home" }],
  ["/ganjaran", rewardsPage, { auth: true, child: true, nav: "rewards" }],
  ["/laporan", reportPage, { auth: true, parent: true, nav: "ibu" }],
  ["/tetapan", settingsPage, { auth: true, parent: true, nav: "ibu" }],
  ["/maklum-balas", feedbackAdminPage, { parent: true, nav: "ibu" }],
  ["/admin", adminPage, { auth: true, parent: true, nav: "ibu" }],
  ["/zon-ibu", momZonePage, { auth: true, parent: true, nav: "ibu" }],
  ["/sekolah", schoolHome, { auth: true, child: true, nav: "school" }],
  ["/sekolah/bab/:subject/:year/:topic", schoolChapter, { auth: true, child: true, nav: "school" }],
  ["/sekolah/main/:subject/:year/:topic/:stage", schoolPlay, { auth: true, child: true, nav: "school" }],
  ["/sekolah/ulang-kaji", schoolReview, { auth: true, child: true, nav: "school" }],
  ["/sekolah/harian", schoolDaily, { auth: true, child: true, nav: "school" }],
  ["/sekolah/cetak/:subject/:year/:topic", schoolPrint, { auth: true, child: true, nav: "school" }],
  ["/games", gamesList, { auth: true, child: true, nav: "games" }],
  ["/games/:id", gamePlay, { auth: true, child: true, nav: "games" }],
  ["/peta", mapsList, { auth: true, child: true, nav: "games" }],
  ["/peta/:id", mapView, { auth: true, child: true, nav: "games" }],
  ["/buku", booksList, { auth: true, child: true, nav: "games" }],
  ["/buku/:id", bookRead, { auth: true, child: true, nav: "games" }],
  ["/worksheet", worksheetList, { auth: true, nav: "home" }],
  ["/worksheet/:id", worksheetView, { auth: true, nav: "home" }],
  ["/pensel", penselList, { auth: true, child: true, nav: "home" }],
  ["/pensel/:id", penselView, { auth: true, child: true, nav: "home" }],
  ["/ibu", ibuList, { auth: true, parent: true, nav: "ibu" }],
  ["/ibu/:id", ibuView, { auth: true, parent: true, nav: "ibu" }],
  ["/planner", plannerList, { auth: true, parent: true, nav: "ibu" }],
  ["/planner/:id", plannerView, { auth: true, parent: true, nav: "ibu" }],
  ["/tips", tipsList, { auth: true, parent: true, nav: "ibu" }],
  ["/tips/:id", tipsView, { auth: true, parent: true, nav: "ibu" }],
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
  if (!route) {
    app.innerHTML = `<div id="bare"></div>`;
    notFound($("#bare"), store.user ? "#/app" : "#/", store.user ? "Ke laman app" : "Laman utama");
    app.insertAdjacentHTML("beforeend", fabHtml("low"));
    revealFab(app);
    document.title = "Halaman tidak dijumpai · Playora";
    return;
  }
  const m = path.match(route.re);
  const params = Object.fromEntries(route.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));

  if (route.meta.auth && !store.user) { go(`/masuk?next=${encodeURIComponent(path)}`); return; }
  if ((path === "/masuk" || path === "/daftar") && store.user) { go(safeNext(query.next)); return; }
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
  // parent areas: ask the adult question first (skipped before the first child exists — sign-up flow)
  if (route.meta.parent && store.user && store.children.length && gateEnabled()) {
    if (!parentOk()) { parentGate(mount); document.title = "Untuk ibu bapa · Playora"; return; }
    markParent(); // sliding window while the parent keeps using these pages
  }
  mount.innerHTML = `<div class="loading" role="status"><div class="spin"></div>Memuatkan…</div>`;
  try {
    await applyOutfit(store.user ? store.activeChild : null);
    cleanup = await route.fn(mount, params, query);
    const h1 = mount.querySelector("h1")?.textContent.trim();
    document.title = h1 ? `${h1} · Playora` : "Playora — Belajar Sambil Bermain";
  } catch (e) {
    console.error(e);
    mount.innerHTML = `<div class="wrap page"><div class="alert">Maaf, ada ralat: ${esc(e.message)}</div><p><a href="#/app">← Kembali ke laman utama</a></p></div>`;
  }
}

// ---------------------------------------------------------------- shell
function shell(nav) {
  const c = store.activeChild;
  const stars = c ? store.totalStars(c.id) : 0;
  const items = [["home", "🏠", "Utama", "#/app"], ["games", "🎮", "Games", "#/games"], ["school", "🎒", "Sekolah", "#/sekolah"], ["rewards", "🏆", "Ganjaran", "#/ganjaran"], ["ibu", "👩", "Zon Ibu", "#/zon-ibu"]];
  const cur = (k) => (nav === k ? ` class="on" aria-current="page"` : "");
  return `
  <header class="topbar no-print">
    <div class="wrap">
      <a class="brand" href="#/app" aria-label="Playora — laman utama"><span class="logo">🐼</span><span class="txt">Playora</span></a>
      <nav class="topnav" aria-label="Navigasi utama">${items.map(([k, ic, label, href]) => `<a href="${href}"${cur(k)}>${ic} ${label}</a>`).join("")}</nav>
      <span class="spacer"></span>
      ${c ? `<a class="child-chip" href="#/anak" title="Tukar profil anak"><span class="av">${esc(c.avatar || "🧒")}</span><span class="nm">${esc(c.name)}</span><span class="star-pill">⭐ ${stars}</span></a>` : ""}
      <a class="icon-btn" href="#/tetapan" aria-label="Tetapan">⚙️</a>
    </div>
  </header>
  ${store.mode === "demo" && !demoNoteDismissed() ? `<div class="wrap no-print"><div class="demo-note" role="note"><span>🧪 <b>Mod Demo</b> — data disimpan dalam pelayar ini sahaja.</span><button data-demo-ok aria-label="Tutup nota Mod Demo">✕</button></div></div>` : ""}
  <main id="view"></main>
  <nav class="bottomnav no-print" aria-label="Navigasi utama">
    ${items.map(([k, ic, label, href]) => `<a href="${href}"${cur(k)}><span class="ic" aria-hidden="true">${ic}</span>${label}</a>`).join("")}
  </nav>`;
}
function demoNoteDismissed() {
  try { return !!(localStorage.getItem("ppl_demo_ok") || sessionStorage.getItem("ppl_demo_ok")); } catch { return false; }
}
function bindShell() {
  const b = $("[data-demo-ok]");
  if (b) b.onclick = () => { try { localStorage.setItem("ppl_demo_ok", "1"); } catch {} b.closest(".wrap").remove(); };
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
    <div class="center" style="margin:10px 0 16px"><div style="display:grid;place-items:center">${mascot("happy", 96, "bob")}</div>
      <div class="logo-type" style="font-size:2.4rem;margin:0"><span class="a">Play</span><span class="b">ora</span></div></div>
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
    go(safeNext(query.next));
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
      <p class="small muted center" style="margin:10px 0 0">Dengan mendaftar, anda bersetuju dengan <a href="#/privasi">Polisi Privasi</a> kami.</p>
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
  const momTile = (href, emoji, title, ds, color) => `<a class="tile row-tile" href="${href}" style="--tile:${color}"><span class="em">${emoji}</span><span><span class="tt" style="display:block">${title}</span><span class="ds">${ds}</span></span></a>`;
  el.innerHTML = `<div class="wrap page stack">
    <section class="hello">
      <a class="hello-av" href="#/anak" title="Tukar profil anak" aria-label="Tukar profil anak">${esc(c.avatar || "🐼")}</a>
      <div class="hello-main">
        <p class="hello-greet">${greet} 👋</p>
        <h1>Hai, ${esc(c.name)}!</h1>
        ${xpBar(store.xpOf(c.id))}
      </div>
      <div class="hello-stats">
        <a href="#/ganjaran" class="stat"><b>⭐ ${stars}</b><span>bintang</span></a>
        <a href="#/ganjaran" class="stat"><b>🎁 ${stick}<small>/${STICKERS.length}</small></b><span>pelekat</span></a>
        <span class="stat" data-streak hidden></span>
        <p class="small hello-next">Kumpul <b>${toNext}</b> ⭐ lagi untuk pelekat baru!</p>
      </div>
    </section>
    <div data-onb></div>
    ${schoolStrip(c)}
    <div class="search" role="search">
      <span class="ic" aria-hidden="true">🔍</span>
      <label for="topic-q" class="sr-only">Cari topik</label>
      <input id="topic-q" class="input" type="search" placeholder="Cari topik: sifir, warna, cerita…" autocomplete="off" maxlength="40">
      <button class="btn sm ghost clear" data-clear hidden aria-label="Kosongkan carian">✕</button>
    </div>
    <div data-results hidden></div>
    <div data-zones>
      <div class="section-h"><h2>🎈 Jom Main!</h2></div>
      <div class="grid kids">${kids.map(tile).join("")}</div>
    </div>
    <div class="grid two" data-learn>
      <div class="card"><h2>🎯 Misi Hari Ini</h2><div class="streak-week" data-week></div><div data-missions><div class="loading" style="padding:20px 0"><div class="spin"></div></div></div></div>
      <div class="card"><h2>✨ Cadangan untuk ${esc(c.name)}</h2><div data-recs><div class="loading" style="padding:20px 0"><div class="spin"></div></div></div></div>
    </div>
    <div data-zones>
      <div class="section-h"><h2>💖 Untuk Ibu & Bapa</h2><a href="#/zon-ibu">Semua →</a></div>
      <div class="grid two compact">
        ${mom.map((s) => momTile(s.href, s.emoji, s.title, `${s.count} topik`, s.color)).join("")}
        ${momTile("#/laporan", "📊", "Laporan Anak", "Lihat kemajuan", "#e8f7ff")}
      </div>
    </div>
  </div>`;
  bindTopicSearch(el);
  fillLearning(el, c);
}

/** Quick "continue" row for school-age children (Tahun 1–6). */
function schoolStrip(c) {
  const g = gradeOf(c);
  if (!g) return `<a class="school-strip mini" href="#/sekolah"><span class="ss-e">🎒</span><span><b>Sekolah Tahun 1–6</b><small>Matematik, BM, English & Sains ikut topik KSSR</small></span><span aria-hidden="true">→</span></a>`;
  return `<section class="school-strip" aria-label="Sekolah ${gradeLabel(g)}">
    <a class="ss-head" href="#/sekolah?t=${g}"><span class="ss-e">🎒</span><span><b>Sekolah · ${gradeLabel(g)}</b><small>Teruskan pembelajaran hari ini</small></span><span class="ss-all">Semua →</span></a>
    <div class="ss-subjects">${SUBJECTS.map((s, i) => { const t = nextTopic(s.id, g), p = subjectProgress(s.id, g); return `<a class="ss-sub" style="--tc:${s.color};--ta:${s.accent};--i:${i}" href="#/sekolah/bab/${s.id}/${g}/${t.id}">
      <span class="ss-top"><span>${s.emoji} ${esc(s.short)}</span><b>${p.pct}%</b></span>
      <span class="ss-t">${t.emoji} ${esc(t.title)}</span>
      <span class="ss-bar"><i style="width:${p.pct}%"></i></span>
      <span class="ss-go">${chapterStars(s.id, g, t.id) ? "Teruskan" : "Mula"} ▶</span></a>`; }).join("")}</div>
  </section>`;
}

function xpBar(xp) {
  const L = levelInfo(xp);
  return `<div class="xp-bar" title="${xp} XP">
    <div class="row between small" style="font-weight:800"><span>🏅 Tahap ${L.level} · ${esc(levelTitle(L.level))}</span><span>${xp} / ${L.next} XP</span></div>
    <div class="progress"><i style="width:${L.pct}%"></i></div></div>`;
}
const CATALOG = { games: GAMES, maps: MAPS, books: BOOKS };
/** School hooks for recommendations(): label weak topics and suggest the next chapter per subject. */
function schoolCatalog(c) {
  const g = gradeOf(c);
  return {
    lookup(fam) {
      const p = parseActivity(`${fam}-latihan`);
      const t = p && topicById(p.subject, p.year, p.topic);
      return t ? { emoji: t.emoji, title: `${subjectById(p.subject).short} T${p.year}: ${t.title}`, href: `#/sekolah/bab/${p.subject}/${p.year}/${t.id}` } : null;
    },
    upNext: g ? SUBJECTS.map((s) => { const t = nextTopic(s.id, g); return { emoji: t.emoji, title: `${s.short}: ${t.title}`, href: `#/sekolah/bab/${s.id}/${g}/${t.id}`, reason: chapterStars(s.id, g, t.id) ? "Teruskan bab ini" : `Bab seterusnya untuk ${gradeLabel(g)}` }; }) : [],
  };
}
async function fillLearning(el, c) {
  const mBox = el.querySelector("[data-missions]");
  const rBox = el.querySelector("[data-recs]");
  let attempts = [];
  try { attempts = await store.attempts(c.id); }
  catch (e) {
    console.warn(e);
    mBox.innerHTML = rBox.innerHTML = `<p class="small muted">Tidak dapat memuatkan aktiviti terkini. Semak sambungan internet.</p>`;
    return;
  }
  if (!mBox.isConnected) return;
  const st = streak(attempts);
  const sBox = el.querySelector("[data-streak]");
  sBox.hidden = false;
  sBox.title = `Rekod terbaik: ${st.best} hari`;
  sBox.innerHTML = `<b>🔥 ${st.current}</b><span>hari berturut</span>`;
  el.querySelector("[data-week]").innerHTML = `<div class="streak-days">${st.week.map((d) => `<span class="${d.active ? "on" : ""}${d.today ? " today" : ""}" title="${d.day}"><i aria-hidden="true">${d.active ? "🔥" : ""}</i>${d.label}</span>`).join("")}</div>
    <p class="small muted">${st.playedToday ? `Hebat! Rekod terbaik: ${st.best} hari.` : st.current ? `Main hari ini untuk teruskan ${st.current} hari berturut! 🔥` : "Main satu aktiviti hari ini untuk mula rekod 🔥"}</p>`;
  const ms = dailyMissions(attempts);
  const allDone = ms.every((m) => m.complete);
  mBox.innerHTML = `<div class="stack">${ms.map((m) => `<div class="mission ${m.complete ? "done" : ""}"><span class="e" aria-hidden="true">${m.complete ? "✅" : m.emoji}</span><span class="grow">${esc(m.text)}</span><b>${m.done}/${m.need}</b></div>`).join("")}</div>
    <p class="small muted" style="margin:10px 0 0">${allDone ? "Hebat! Semua misi hari ini selesai 🎉" : "Misi baharu setiap hari — tiada denda jika terlepas."}</p>`;
  const recs = recommendations({ child: c, progress: store.progress[c.id] || {}, attempts, catalog: { ...CATALOG, school: schoolCatalog(c) }, isPublished: (f) => store.isPublished(f) });
  if (!attempts.length && !onboardingSeen(c.id)) onboarding(el.querySelector("[data-onb]"), c, recs);
  rBox.innerHTML = recs.length
    ? `<div class="stack">${recs.map((r) => `<a class="rec" href="${r.href}"><span class="e" aria-hidden="true">${r.emoji}</span><span class="grow"><b>${esc(r.title)}</b><span class="small muted" style="display:block">${esc(r.reason)}</span></span><span aria-hidden="true">➡️</span></a>`).join("")}</div>`
    : `<p class="muted">Teruskan bermain — cadangan akan muncul berdasarkan aktiviti ${esc(c.name)}.</p>`;
}

// ---------------------------------------------------------------- first-run welcome (per child, until first activity)
const onbKey = (id) => `ppl_onb_${id}`;
function onboardingSeen(id) { try { return localStorage.getItem(onbKey(id)) === "1"; } catch { return false; } }
function markOnboarded(id) { try { localStorage.setItem(onbKey(id), "1"); } catch {} }
function onboarding(box, c, recs) {
  const first = recs[0];
  const needAge = !c.age;
  box.innerHTML = `<section class="onb" aria-label="Selamat datang">
    <div class="onb-art">${mascot(needAge ? "think" : "cheer", 104)}</div>
    <div class="onb-body">
      <h2>Hai ${esc(c.name)}! Saya Pipi Panda 👋</h2>
      ${needAge ? `<p>Berapa umur ${esc(c.name)}? Pipi akan pilih aktiviti yang sesuai.</p>
        <div class="chips" role="group" aria-label="Umur">${[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((a) => `<button class="chip" data-age="${a}">${a} tahun</button>`).join("")}</div>`
      : `<ol class="onb-steps"><li><span aria-hidden="true">🎮</span>Main aktiviti</li><li><span aria-hidden="true">⭐</span>Dapat bintang</li><li><span aria-hidden="true">🎁</span>Buka pelekat</li></ol>
        ${first ? `<p class="small muted" style="margin:0 0 8px">Jom mula dengan:</p><a class="btn big block" href="${first.href}" data-onb-go>${first.emoji} ${esc(first.title)}</a>` : ""}`}
      <button class="onb-skip" data-onb-skip>Nanti</button>
    </div></section>`;
  box.querySelectorAll("[data-age]").forEach((b) => (b.onclick = async () => {
    box.querySelectorAll("[data-age]").forEach((x) => (x.disabled = true));
    try { await store.updateChild(c.id, { age: Number(b.dataset.age) }); render(); } // re-render: recommendations use the age
    catch (e) { toast(e.message); box.querySelectorAll("[data-age]").forEach((x) => (x.disabled = false)); }
  }));
  box.querySelector("[data-onb-go]")?.addEventListener("click", () => markOnboarded(c.id));
  box.querySelector("[data-onb-skip]").onclick = () => { markOnboarded(c.id); box.innerHTML = ""; };
  if (autoSpeakOn()) speak(`Hai ${c.name}! Saya Pipi Panda. Jom belajar sambil bermain!`);
}

function bindTopicSearch(el) {
  const input = el.querySelector("#topic-q");
  const box = el.querySelector("[data-results]");
  const zones = el.querySelectorAll("[data-zones], [data-learn]");
  const clear = el.querySelector("[data-clear]");
  const run = () => {
    const q = input.value.trim();
    clear.hidden = !q;
    if (!q) { box.hidden = true; zones.forEach((z) => (z.hidden = false)); return; }
    const res = searchTopics(q);
    zones.forEach((z) => (z.hidden = true));
    box.hidden = false;
    box.innerHTML = res.length
      ? `<p class="small muted" style="margin:12px 0 8px">${res.length} topik dijumpai</p><div class="grid">${res.map(({ s, it }) => `<a class="tile" href="${s.href}/${it.id}" style="--tile:${it.color || s.color}"><span class="em">${it.emoji}</span><span class="tt">${esc(it.title)}</span><span class="ds">${esc(s.title)}</span></a>`).join("")}</div>`
      : `<div class="card center" style="margin-top:12px"><div style="font-size:2.6rem">🔎</div><p><b>Tiada topik untuk "<span data-q></span>"</b><br><span class="small muted">Cuba perkataan lain, cth: sifir, buah, warna, cerita, cuaca.</span></p></div>`;
    const qs = box.querySelector("[data-q]");
    if (qs) qs.textContent = q;
  };
  input.addEventListener("input", run);
  clear.onclick = () => { input.value = ""; run(); input.focus(); };
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
            <div class="grow"><b style="font-size:1.15rem">${esc(c.name)}</b><div class="small muted">${c.age ? `${esc(c.age)} tahun · ` : ""}${gradeLabel(gradeOf(c))} · ⭐ ${store.totalStars(c.id)}</div></div>
            ${active?.id === c.id ? `<span class="star-pill">Aktif</span>` : `<button class="btn sm" data-use="${c.id}">Guna</button>`}
            <button class="btn sm ghost" data-edit="${c.id}" aria-label="Ubah">✏️</button>
          </div>`).join("")}
      </div>
      <div class="card">
        <h3 data-ftitle>Tambah anak</h3>
        <form data-f>
          <input type="hidden" name="id">
          <label class="f"><span>Nama panggilan</span><input class="input" name="name" required maxlength="30"></label>
          <div class="filters">
            <label class="f"><span>Umur</span><select class="input" name="age">${["", 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((a) => `<option value="${a}">${a ? a + " tahun" : "— pilih —"}</option>`).join("")}</select></label>
            <label class="f"><span>Darjah</span><select class="input" name="grade"><option value="">Ikut umur</option>${[0, 1, 2, 3, 4, 5, 6].map((g) => `<option value="${g}">${gradeLabel(g)}</option>`).join("")}</select></label>
          </div>
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
      f.id.value = c.id; f.name.value = c.name; f.age.value = c.age || ""; f.grade.value = c.grade ?? "";
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
      const data = { name: d.name.trim(), age: d.age ? Number(d.age) : null, grade: d.grade === "" ? null : Number(d.grade), avatar: d.avatar || "🐼" };
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
  { id: "rajin", e: "🎒", name: "Murid Rajin", desc: "Dapatkan bintang dalam 10 bab Sekolah", test: (r) => new Set(r.filter((x) => x.category === "sekolah" && x.stars > 0 && /-(latihan|masa|bos)$/.test(x.activity_id)).map((x) => x.activity_id.replace(/-(latihan|masa|bos)$/, ""))).size >= 10 },
  { id: "bos", e: "⚔️", name: "Pemburu Bos", desc: "Kalahkan 3 bos dengan 2⭐ atau lebih", test: (r) => r.filter((x) => x.activity_id.endsWith("-bos") && x.stars >= 2).length >= 3 },
  { id: "raja", e: "👑", name: "Raja Bab", desc: "Kuasai satu bab Sekolah (9⭐)", test: (r) => { const by = {}; for (const x of r) if (x.category === "sekolah" && /-(latihan|masa|bos)$/.test(x.activity_id)) { const k = x.activity_id.replace(/-(latihan|masa|bos)$/, ""); by[k] = (by[k] || 0) + x.stars; } return Object.values(by).some((v) => v >= 9); } },
  { id: "allgames", e: "🎮", name: "Pemain Serba Boleh", desc: "Main semua 9 games online", test: (r) => new Set(r.filter((x) => x.category === "games").map((x) => x.activity_id.split(":")[1])).size >= 9 },
];
async function rewardsPage(el) {
  const c = store.activeChild;
  const rows = Object.values(store.progress[c.id] || {});
  const stars = store.totalStars(c.id);
  const have = store.stickerCount(c.id);
  el.innerHTML = `<div class="wrap page stack">
    <section class="banner"><h1>Buku Ganjaran ${esc(c.avatar || "")}</h1><span class="sub">⭐ ${stars} bintang · 🎁 ${have} pelekat</span>
      <p class="small" style="margin-top:10px">Setiap <b>${STARS_PER_STICKER} bintang</b> membuka 1 pelekat baru!</p>
      <div class="progress" style="max-width:360px;margin:0 auto"><i style="width:${((stars % STARS_PER_STICKER) / STARS_PER_STICKER) * 100}%"></i></div>
    </section>
    <section class="card shop" data-shop aria-label="Kedai Pipi"></section>
    <div class="card"><h2>🎁 Koleksi Pelekat</h2>
      <div class="stickers">${STICKERS.map((s, i) => `<div class="sticker ${i < have ? "on" : "off"}" title="${i < have ? "Dibuka" : `Perlu ${(i + 1) * STARS_PER_STICKER} bintang`}">${s}</div>`).join("")}</div>
    </div>
    <div class="card"><h2>🏅 Lencana</h2>
      <div class="grid">${BADGES.map((b) => { const ok = b.test(rows, stars); return `<div class="tile ${ok ? "" : "locked"}" style="cursor:default;min-height:130px"><span class="em">${b.e}</span><span class="tt">${b.name}</span><span class="ds">${b.desc}</span>${ok ? `<span class="badge">✓</span>` : ""}</div>`; }).join("")}</div>
    </div>
  </div>`;
  const box = el.querySelector("[data-shop]");
  let shop = await loadShop(c.id), tab = SLOTS[0].id, preview = null;
  const draw = () => {
    if (!box.isConnected) return;
    const coins = balance(c.id, shop);
    const look = outfitLayers(preview ? { ...shop.wear, [itemById(preview).slot]: preview } : shop.wear);
    box.innerHTML = `
      <div class="shop-head">
        <div class="shop-stage">${mascot(preview ? "cheer" : "happy", 150, "bob", { outfit: look.ids.length ? look : null })}</div>
        <div class="shop-info"><h2>🛍️ Kedai Pipi</h2>
          <p class="small muted" style="margin:0 0 8px">Tukar bintang dengan aksesori untuk Pipi. Pelekat & lencana tidak hilang.</p>
          <div class="shop-coin" data-coins>⭐ <b>${coins}</b> boleh dibelanjakan</div>
          ${preview ? `<p class="small" style="margin:8px 0 0">👀 Mencuba: <b>${esc(itemById(preview).name)}</b></p>` : ""}</div>
      </div>
      <div class="shop-tabs" role="tablist">${SLOTS.map((t) => `<button role="tab" class="chip ${t.id === tab ? "on" : ""}" aria-selected="${t.id === tab}" data-tab="${t.id}">${t.emoji} ${t.title}</button>`).join("")}</div>
      <div class="shop-grid">${ITEMS.filter((i) => i.slot === tab).map((i) => {
        const own = shop.owned.includes(i.id), on = shop.wear[i.slot] === i.id, can = coins >= i.price;
        return `<div class="shop-item ${on ? "on" : ""} ${own ? "own" : ""}" data-item="${i.id}">
          <button class="shop-pic" data-try="${i.id}" aria-label="Cuba ${esc(i.name)}">${mascot("happy", 76, "", { outfit: outfitLayers({ [i.slot]: i.id }) })}</button>
          <b>${esc(i.name)}</b>
          ${own ? `<button class="btn sm ${on ? "ghost" : ""}" data-puton="${i.id}">${on ? "Tanggalkan" : "Pakai"}</button>`
            : `<button class="btn sm" data-buy="${i.id}" ${can ? "" : "disabled"}>⭐ ${i.price}${can ? " Beli" : ""}</button>`}
        </div>`; }).join("")}</div>
      ${coins < Math.min(...ITEMS.filter((i) => !shop.owned.includes(i.id)).map((i) => i.price), Infinity) ? `<p class="small muted center" style="margin:6px 0 0">Main di Sekolah & Games untuk kumpul lebih banyak ⭐!</p>` : ""}`;
    box.querySelectorAll("[data-tab]").forEach((b) => (b.onclick = () => { tab = b.dataset.tab; preview = null; draw(); }));
    box.querySelectorAll("[data-try]").forEach((b) => (b.onclick = () => { preview = preview === b.dataset.try ? null : b.dataset.try; draw(); }));
    box.querySelectorAll("[data-buy]").forEach((b) => (b.onclick = async () => {
      b.disabled = true;
      try { shop = await buyItem(c.id, b.dataset.buy); preview = null; await applyOutfit(c); confetti(40); sfx("win"); toast(`🎉 ${itemById(b.dataset.buy).name} untuk Pipi!`); }
      catch (e) { toast(e.message); }
      draw();
    }));
    box.querySelectorAll("[data-puton]").forEach((b) => (b.onclick = async () => {
      try { shop = await toggleWear(c.id, b.dataset.puton); preview = null; await applyOutfit(c); sfx("pop"); } catch (e) { toast(e.message); }
      draw();
    }));
  };
  draw();
}

// ---------------------------------------------------------------- report
async function reportPage(el) {
  if (!store.children.length) { el.innerHTML = `<div class="wrap page"><div class="alert info">Tiada profil anak lagi. <a href="#/anak?baru=1">Tambah sekarang</a></div></div>`; return; }
  const cats = { sekolah: "🎒 Sekolah (Tahun 1–6)", games: "🎮 Games Online", peta: "🗺️ Peta Kartun", buku: "📚 Buku Cerita", pensel: "🖍️ Pensel Warna", rutin: "🌞 Rutin" };
  el.innerHTML = `<div class="wrap page stack">
    <div class="pagehead"><a class="back" href="#/zon-ibu" aria-label="Kembali">←</a><h1>Laporan Kemajuan</h1></div>
    <p class="small muted">Semua angka dikira daripada aktiviti yang benar-benar direkodkan. Laporan ini menunjukkan latihan, bukan penilaian rasmi penguasaan.</p>
    <div data-kids class="stack"></div>
    <button class="btn ghost no-print" data-print>🖨️ Cetak laporan</button>
  </div>`;
  const box = el.querySelector("[data-kids]");
  for (const c of store.children) {
    const card = document.createElement("div");
    card.className = "card stack";
    card.innerHTML = `<div class="loading" style="padding:20px 0"><div class="spin"></div>Memuatkan ${esc(c.name)}…</div>`;
    box.appendChild(card);
    let attempts = [];
    let failed = false;
    let reviewItems = [];
    try { [attempts, reviewItems] = await Promise.all([store.attempts(c.id), loadReview(c.id).catch(() => [])]); } catch (e) { console.warn(e); failed = true; }
    if (!card.isConnected) return;
    const rows = Object.values(store.progress[c.id] || {}).sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""));
    const total = rows.reduce((s, r) => s + r.stars, 0);
    const L = levelInfo(store.xpOf(c.id));
    const wk = weeklyProgress(attempts, c.weekly_goal || 5);
    const by = Object.keys(cats).map((k) => { const rr = rows.filter((r) => r.category === k); return { k, n: rr.length, s: rr.reduce((a, r) => a + r.stars, 0), max: rr.length * 3 }; }).filter((b) => b.n);
    const weak = weakSpots(attempts);
    const lowStars = rows.filter((r) => r.stars <= 1 && r.category !== "rutin").slice(0, 5);
    const recs = recommendations({ child: c, progress: store.progress[c.id] || {}, attempts, catalog: { ...CATALOG, school: schoolCatalog(c) }, isPublished: (f) => store.isPublished(f) });
    card.innerHTML = `
      <div class="row"><span style="font-size:2.4rem">${esc(c.avatar || "🧒")}</span><div class="grow"><h2 style="margin:0">${esc(c.name)}</h2><span class="muted small">${c.age ? esc(c.age) + " tahun · " : ""}Tahap ${L.level} ${esc(levelTitle(L.level))}</span></div></div>
      ${failed ? `<div class="alert">Sejarah aktiviti tidak dapat dimuat. Angka di bawah mungkin tidak lengkap.</div>` : ""}
      <div class="grid">
        <div class="panel center"><div class="kpi">⭐ ${total}</div><div class="small muted">Jumlah bintang</div></div>
        <div class="panel center"><div class="kpi">${store.xpOf(c.id)}</div><div class="small muted">XP</div></div>
        <div class="panel center"><div class="kpi">${rows.length}</div><div class="small muted">Aktiviti dicuba</div></div>
        <div class="panel center"><div class="kpi">${attempts.length}${attempts.length >= 200 ? "+" : ""}</div><div class="small muted">Percubaan direkod</div></div>
      </div>
      <div>
        <div class="row between"><b>🎯 Matlamat minggu ini</b>
          <label class="small no-print">Sasaran <select class="input" data-goal style="width:auto;padding:4px 8px;display:inline-block" aria-label="Sasaran aktiviti seminggu">${[3, 5, 7, 10, 14, 20, 30].map((g) => `<option ${g === (c.weekly_goal || 5) ? "selected" : ""}>${g}</option>`).join("")}</select> aktiviti</label></div>
        <div class="progress" style="margin-top:6px"><i style="width:${wk.pct}%"></i></div>
        <p class="small muted" style="margin:4px 0 0">${wk.count} / ${wk.goal} aktiviti sejak Isnin${wk.reached ? " — sasaran tercapai 🎉" : ""}</p>
      </div>
      ${schoolReportHtml(schoolReport({ child: c, starsOf: (id) => store.starsOf(id, c.id), attempts, reviewItems }), c.name)}
      ${by.length ? `<div>${by.map((b) => `<div style="margin-bottom:10px"><div class="row between small"><b>${cats[b.k]}</b><span>${b.n} aktiviti · ⭐ ${b.s}${b.k === "rutin" ? "" : "/" + b.max}</span></div><div class="bar"><i style="width:${b.max ? (b.s / b.max) * 100 : 0}%"></i></div></div>`).join("")}</div>` : `<p class="muted">Belum ada aktiviti. Jom mula dengan cadangan di bawah!</p>`}
      ${weak.length || lowStars.length ? `<div class="alert info small"><b>Perlu lebih latihan</b>
        <ul style="margin:6px 0 0;padding-left:18px">${weak.map((w) => `<li>${esc(familyLabel(w.family))}: ${w.wrong}/${w.answered} jawapan salah (14 hari)${w.examples.length ? ` — cth: <i>${w.examples.map(esc).join("; ")}</i>` : ""}</li>`).join("")}
        ${lowStars.map((r) => `<li>${esc(activityLabel(r.activity_id))}: bintang terbaik ${r.stars}/3</li>`).join("")}</ul></div>` : ""}
      ${recs.length ? `<div><b>✨ Cadangan seterusnya</b><div class="stack" style="margin-top:6px">${recs.map((r) => `<a class="rec" href="${r.href}"><span class="e">${r.emoji}</span><span class="grow"><b>${esc(r.title)}</b><span class="small muted" style="display:block">${esc(r.reason)}</span></span></a>`).join("")}</div></div>` : ""}
      <details><summary style="font-weight:800;cursor:pointer">Percubaan terkini</summary>
        <div class="table-scroll" style="margin-top:8px"><table class="report-table"><thead><tr><th>Tarikh</th><th>Aktiviti</th><th>Markah</th><th>Bintang</th><th>XP</th></tr></thead>
        <tbody>${attempts.slice(0, 25).map((a) => `<tr><td>${new Date(a.created_at).toLocaleDateString("ms-MY")}</td><td>${esc(activityLabel(a.activity_id))}</td><td>${a.answers ? `${a.score}/${a.total}` : "—"}</td><td>${"⭐".repeat(a.stars) || "—"}</td><td>+${a.xp}</td></tr>`).join("") || `<tr><td colspan="5" class="muted">Belum ada percubaan.</td></tr>`}</tbody></table></div>
      </details>`;
    card.querySelector("[data-goal]").onchange = async (e) => {
      const goal = Number(e.target.value);
      e.target.disabled = true;
      try { await store.updateChild(c.id, { weekly_goal: goal }); toast("Sasaran mingguan dikemas kini"); reportPage(el); }
      catch (ex) { toast(ex.message); e.target.disabled = false; }
    };
  }
}
function schoolLabel(id) {
  if (id === REVIEW_ID) return "Ulang Kaji Pintar";
  if (id.startsWith(DAILY_FAMILY + ":")) return `Cabaran Harian (${id.split(":")[2]})`;
  const p = parseActivity(id) || parseActivity(`${id}-latihan`);
  if (!p) return null;
  const s = subjectById(p.subject), t = topicById(p.subject, p.year, p.topic);
  if (!t) return null;
  const stage = parseActivity(id) ? ` — ${STAGES.find((x) => x.id === p.stage).title}` : "";
  return `${s.short} T${p.year}: ${t.title}${stage}`;
}
function familyLabel(fam) {
  if (fam.startsWith("sek:")) return schoolLabel(fam) || fam;
  const [cat, id] = fam.split(":");
  const sec = SECTIONS.find((s) => s.key === (cat === "game" ? "games" : cat));
  return sec?.list.find((x) => x.id === id)?.title || fam;
}
function activityLabel(id) {
  if (id.startsWith("sek:")) return schoolLabel(id) || id;
  const [cat0, a, b] = id.split(":");
  if (cat0 === "rutin") return `Rutin ${b === "pagi" ? "pagi" : "malam"} (${a})`;
  const cat = cat0 === "game" ? "games" : cat0;
  const sec = SECTIONS.find((s) => s.key === cat);
  const item = sec?.list.find((x) => x.id === a);
  if (!item) return id;
  if (cat === "games" && item.levels?.[b]) return `${item.title} — ${item.levels[b].name}`;
  if (cat === "peta" && item.stations?.[b]) return `${item.title} — ${item.stations[b].name}`;
  if (cat === "pensel" && b != null) return `${item.title} — ${b}`;
  return item.title;
}

// ---------------------------------------------------------------- settings
// ---------------------------------------------------------------- parental gate
let gateFails = 0, gateLockedUntil = 0;
function parentGate(el) {
  let ch = makeChallenge();
  el.innerHTML = `<div class="wrap page" style="max-width:520px">
    <div class="card pad-lg center gate">
      <div class="gate-ic" aria-hidden="true">🔒</div>
      <h1>Untuk ibu bapa sahaja</h1>
      <p class="muted">Bahagian ini untuk orang dewasa. Jawab soalan di bawah untuk teruskan.</p>
      <form data-gate novalidate>
        <label for="gate-a" class="gate-q" data-q></label>
        <input id="gate-a" class="input gate-in" name="a" inputmode="numeric" pattern="[0-9]*" autocomplete="off" maxlength="3" required>
        <div class="alert" data-err hidden></div>
        <button class="btn block" type="submit">Teruskan</button>
      </form>
      <a class="btn ghost block" href="#/app" style="margin-top:10px">← Kembali bermain</a>
    </div></div>`;
  const f = el.querySelector("[data-gate]");
  const err = el.querySelector("[data-err]");
  const ask = () => { el.querySelector("[data-q]").textContent = `Berapakah ${ch.a} × ${ch.b}?`; f.a.value = ""; };
  ask();
  f.onsubmit = (e) => {
    e.preventDefault();
    const wait = Math.ceil((gateLockedUntil - Date.now()) / 1000);
    if (wait > 0) { err.textContent = `Terlalu banyak cubaan. Cuba lagi dalam ${wait} saat.`; err.hidden = false; return; }
    if (checkAnswer(ch, f.a.value)) { gateFails = 0; markParent(); render(); return; }
    gateFails++;
    if (gateFails >= LOCK_AFTER) { gateFails = 0; gateLockedUntil = Date.now() + LOCK_MS; }
    err.textContent = "Jawapan kurang tepat. Cuba soalan baharu ini.";
    err.hidden = false;
    ch = makeChallenge();
    ask();
    f.a.focus();
  };
  f.a.focus();
}

function deleteAccountDialog() {
  modal(`<h2 style="font-size:1.3rem">Padam akaun selama-lamanya?</h2>
    <p>Semua profil anak (${store.children.length}), bintang, kemajuan, planner & jurnal untuk <b>${esc(store.user.email)}</b> akan dipadam. Ia tidak boleh dipulihkan.</p>
    <form data-delf novalidate>
      <label class="f"><span>Taip <b>PADAM</b> untuk mengesahkan</span><input class="input" name="c" autocomplete="off" autocapitalize="characters" spellcheck="false"></label>
      <div class="alert" data-err hidden></div>
      <div class="row" style="justify-content:flex-end"><button class="btn ghost sm" type="button" data-no>Batal</button><button class="btn sm danger-solid" type="submit" disabled data-yes>Padam akaun</button></div>
    </form>`, { onMount: (m, close) => {
    const f = m.querySelector("[data-delf]");
    const yes = m.querySelector("[data-yes]");
    const err = m.querySelector("[data-err]");
    f.c.oninput = () => (yes.disabled = f.c.value.trim().toUpperCase() !== "PADAM");
    m.querySelector("[data-no]").onclick = close;
    f.onsubmit = async (e) => {
      e.preventDefault();
      if (yes.disabled) return;
      yes.disabled = true;
      err.hidden = true;
      try {
        closeGate();
        await store.deleteAccount();
        close();
        toast("Akaun dan semua data telah dipadam. Terima kasih kerana mencuba Playora 💛", 3500);
        go("/");
      } catch (ex) { err.textContent = `Tidak dapat memadam akaun: ${ex.message}`; err.hidden = false; yes.disabled = false; }
    };
  } });
}

function settingsPage(el) {
  el.innerHTML = `<div class="wrap page stack" style="max-width:640px">
    <div class="pagehead"><a class="back" href="#/zon-ibu" aria-label="Kembali">←</a><h1>Tetapan</h1></div>
    <div class="card stack">
      <label class="check"><input type="checkbox" data-sound ${isSoundOn() ? "checked" : ""}><span>🔔 Kesan bunyi</span></label>
      <label class="check"><input type="checkbox" data-speak ${autoSpeakOn() ? "checked" : ""}><span>🗣️ Baca soalan secara automatik</span></label>
      <label class="check"><input type="checkbox" data-gate-on ${gateEnabled() ? "checked" : ""}><span>🔒 Pintu ibu bapa <span class="small muted" style="display:block">Soalan dewasa sebelum Zon Ibu, laporan, tetapan & profil anak</span></span></label>
      <button class="btn sm ghost" data-lock>🔐 Kunci zon ibu bapa sekarang</button>
    </div>
    <div class="card">
      <h3>Akaun</h3>
      <p><b>${esc(store.user.name)}</b><br><span class="muted">${esc(store.user.email)}</span></p>
      <p class="small muted">Mod: ${store.mode === "cloud" ? "☁️ Awan (Supabase) — data disegerakkan" : "🧪 Demo — data dalam pelayar ini sahaja"}</p>
      <div class="row"><a class="btn sm ghost" href="#/anak">👨‍👩‍👧 Urus profil anak</a><a class="btn sm grape" href="#/admin" data-admin hidden>🛠️ Pentadbiran kandungan</a><button class="btn sm" data-out>Log keluar</button></div>
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
    <div class="card danger">
      <h3>🗑️ Padam akaun</h3>
      <p class="small">Padam akaun ini bersama <b>semua</b> data: profil anak, bintang, kemajuan, planner & jurnal. Tindakan ini <b>tidak boleh dibatalkan</b>.</p>
      <button class="btn sm ghost danger-btn" data-delacct>Padam akaun saya…</button>
    </div>
    <p class="small muted center"><a href="#/privasi">Polisi Privasi</a> · Playora · v2.1 · ${todayKey()}</p>
  </div>`;
  el.querySelector("[data-sound]").onchange = (e) => setSound(e.target.checked);
  el.querySelector("[data-speak]").onchange = (e) => setAutoSpeak(e.target.checked);
  el.querySelector("[data-gate-on]").onchange = (e) => { setGateEnabled(e.target.checked); toast(e.target.checked ? "Pintu ibu bapa dihidupkan 🔒" : "Pintu ibu bapa dimatikan"); };
  el.querySelector("[data-lock]").onclick = () => { closeGate(); toast("Zon ibu bapa dikunci 🔐"); go("/app"); };
  el.querySelector("[data-delacct]").onclick = () => deleteAccountDialog();
  el.querySelector("[data-out]").onclick = async () => { closeGate(); await store.signOut(); toast("Anda telah log keluar"); go("/"); };
  store.isAdmin().then((yes) => { const a = el.querySelector("[data-admin]"); if (yes && a) a.hidden = false; });
  feedbackBackend().then(async (be) => {
    if (!be) return;
    el.querySelector("[data-fbcard]").hidden = false;
    if (be.kind === "claude" && (await be.user.isOwner())) el.querySelector("[data-fbadmin]").hidden = false;
  });
  const ib = el.querySelector("[data-install]");
  if (deferredInstall) { ib.hidden = false; ib.onclick = () => { deferredInstall.prompt(); deferredInstall = null; ib.hidden = true; }; }
}

// ---------------------------------------------------------------- admin (content publishing)
async function adminPage(el) {
  if (!(await store.isAdmin())) {
    el.innerHTML = `<div class="wrap page"><div class="card pad-lg center"><div style="font-size:3rem">🔒</div><h1>Akses ditolak</h1><p>Halaman ini hanya untuk pentadbir kandungan.${store.mode === "demo" ? " (Tidak tersedia dalam Mod Demo.)" : ""}</p><a class="btn" href="#/app">Kembali</a></div></div>`;
    return;
  }
  await store.loadCatalog();
  const rows = [...(store.catalog?.values() || [])];
  const groups = { games: "🎮 Games", peta: "🗺️ Peta", buku: "📚 Buku", pensel: "🖍️ Pensel", rutin: "🌞 Rutin" };
  el.innerHTML = `<div class="wrap page stack">
    <div class="pagehead"><a class="back" href="#/tetapan" aria-label="Kembali">←</a><h1>Pentadbiran Kandungan</h1></div>
    <div class="alert info small">Aktiviti yang dinyahterbit disembunyikan daripada semua pengguna dan tidak boleh direkod (dikuatkuasa oleh pangkalan data). Setiap perubahan direkod dalam log audit.</div>
    ${Object.entries(groups).map(([k, label]) => `<div class="card"><h2 style="font-size:1.15rem">${label}</h2><div class="stack">${rows.filter((r) => r.category === k).map((r) => `
      <label class="check"><input type="checkbox" data-pub="${esc(r.id)}" ${r.published ? "checked" : ""}><span class="grow">${esc(r.title)} <span class="small muted">${esc(r.id)}</span></span><span class="small" data-state="${esc(r.id)}">${r.published ? "Diterbitkan" : "Tersembunyi"}</span></label>`).join("")}</div></div>`).join("")}
    <div class="card"><h2 style="font-size:1.15rem">🧾 Log audit terkini</h2><div data-audit class="small muted">Memuatkan…</div></div>
  </div>`;
  const loadAudit = async () => {
    const box = el.querySelector("[data-audit]");
    try {
      const a = await store.adminAudit();
      box.innerHTML = a.length ? `<div class="table-scroll"><table class="report-table"><thead><tr><th>Masa</th><th>Aktiviti</th><th>Perubahan</th></tr></thead><tbody>${a.map((x) => `<tr><td>${new Date(x.created_at).toLocaleString("ms-MY")}</td><td>${esc(x.row_id)}</td><td>${x.old_value?.published !== x.new_value?.published ? (x.new_value?.published ? "Diterbitkan" : "Disembunyikan") : "Dikemas kini"}</td></tr>`).join("")}</tbody></table></div>` : "Tiada perubahan lagi.";
    } catch (e) { box.textContent = "Log audit tidak dapat dimuat: " + e.message; }
  };
  el.querySelectorAll("[data-pub]").forEach((cb) => (cb.onchange = async () => {
    const id = cb.dataset.pub, want = cb.checked;
    cb.disabled = true;
    try {
      await store.setPublished(id, want);
      el.querySelector(`[data-state="${CSS.escape(id)}"]`).textContent = want ? "Diterbitkan" : "Tersembunyi";
      toast(want ? "Aktiviti diterbitkan" : "Aktiviti disembunyikan");
      loadAudit();
    } catch (e) { cb.checked = !want; toast(e.message); }
    finally { cb.disabled = false; }
  }));
  loadAudit();
}

// ---------------------------------------------------------------- boot
let deferredInstall = null;
window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferredInstall = e; });
window.addEventListener("hashchange", render);
document.addEventListener("click", (e) => {
  if (e.target.closest("[data-fb]")) { e.preventDefault(); openFeedback(); }
  else if (e.target.closest("[data-print]")) { e.preventDefault(); window.print(); }
});
store.init().then(render);
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
