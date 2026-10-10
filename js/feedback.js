// Borang maklum balas penguji (pilot).
// Backends, in order:
//   1. claude.ai Artifact `db` capability — each tester writes feedback/<their id>,
//      only the owner can read everyone's (rules declared at publish).
//   2. Supabase table `feedback` (insert-only) when config.js points to Supabase.
//   3. Neither → the feedback button stays hidden.
import { store } from "./store.js";
import { esc, toast, sfx, confetti, uid } from "./util.js";

let backendP = null;
export function feedbackBackend() {
  backendP ||= (async () => {
    if (window.claude?.use) {
      try {
        const [db, user] = await Promise.all([window.claude.use("db"), window.claude.use("user")]);
        const id = user ? await user.id() : null;
        if (db && id) return { kind: "claude", db, user, id };
      } catch { /* fall through */ }
    }
    if (store.mode === "cloud") return { kind: "supabase" };
    return null;
  })();
  return backendP;
}

export const CATS = ["🎮 Games", "🗺️ Peta", "📚 Buku", "🖍️ Pensel", "🖨️ Worksheet", "💖 Games Ibu", "📒 Planner", "🎧 Tips", "🔐 Akaun/Login", "📱 Paparan", "🐞 Pepijat"];
const FACES = [["😞", "Teruk"], ["🙁", "Kurang"], ["😐", "Okay"], ["🙂", "Bagus"], ["😍", "Suka sangat!"]];

function device() {
  const ua = navigator.userAgent;
  const os = /iPhone|iPad/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Windows/.test(ua) ? "Windows" : /Mac/.test(ua) ? "Mac" : /Linux/.test(ua) ? "Linux" : "Lain";
  const br = /Edg\//.test(ua) ? "Edge" : /SamsungBrowser/.test(ua) ? "Samsung" : /CriOS|Chrome/.test(ua) ? "Chrome" : /Firefox|FxiOS/.test(ua) ? "Firefox" : /Safari/.test(ua) ? "Safari" : "Lain";
  return `${os} · ${br} · ${window.innerWidth}px`;
}

async function submit(entry) {
  const be = await feedbackBackend();
  if (!be) throw new Error("Maklum balas tidak tersedia di sini.");
  if (be.kind === "claude") {
    const ref = be.db.doc(`feedback/${be.id}`);
    const snap = await ref.get();
    const entries = snap.exists ? [...(snap.data().entries || [])] : [];
    entries.push(entry);
    await ref.set({ entries: entries.slice(-200), updatedAt: entry.at });
    return;
  }
  await store.submitFeedback(entry);
}

/** Open the feedback form as a modal. */
export async function openFeedback() {
  const draftKey = "ppl_fb_draft";
  let draft = {};
  try { draft = JSON.parse(sessionStorage.getItem(draftKey) || "{}"); } catch {}
  const st = { rating: draft.rating || 0, cats: new Set(draft.cats || []) };
  const bg = document.createElement("div");
  bg.className = "modal-bg";
  bg.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="fb-title" style="max-width:520px">
    <div class="row between" style="flex-wrap:nowrap"><h2 id="fb-title" style="margin:0;font-size:1.35rem">💬 Maklum Balas Penguji</h2><button class="x-btn" data-close aria-label="Tutup">✕</button></div>
    <p class="small muted" style="margin:6px 0 12px">Terima kasih kerana menguji! Jawapan anda membantu kami menambah baik app ini.</p>
    <form data-f novalidate class="stack">
      <div><b>Secara keseluruhan, anda rasa…</b>
        <div class="fb-faces" role="radiogroup" aria-label="Penilaian">${FACES.map(([e, t], i) => `<button type="button" class="fb-face ${st.rating === i + 1 ? "on" : ""}" data-r="${i + 1}" role="radio" aria-checked="${st.rating === i + 1}" aria-label="${t}"><span>${e}</span><small>${t}</small></button>`).join("")}</div></div>
      <div><b>Bahagian yang dicuba</b> <span class="small muted">(pilih semua yang berkaitan)</span>
        <div class="chips" style="margin-top:6px">${CATS.map((c) => `<button type="button" class="chip ${st.cats.has(c) ? "on" : ""}" data-c="${esc(c)}">${c}</button>`).join("")}</div></div>
      <label class="f" for="fb-suka"><span>👍 Apa yang anda / anak suka?</span><textarea class="input" id="fb-suka" name="suka" maxlength="1500" style="min-height:80px">${esc(draft.suka || "")}</textarea></label>
      <label class="f" for="fb-baiki"><span>🛠️ Apa yang perlu diperbaiki? Ada masalah / pepijat?</span><textarea class="input" id="fb-baiki" name="baiki" maxlength="1500" style="min-height:80px" placeholder="cth: Soalan sifir terlalu susah untuk umur 5 tahun; butang tak boleh ditekan di halaman…">${esc(draft.baiki || "")}</textarea></label>
      <div class="row" style="align-items:flex-start">
        <label class="f grow" for="fb-umur" style="min-width:140px"><span>Umur anak</span><select class="input" id="fb-umur" name="umur">${["", "Bawah 3", "3", "4", "5", "6", "7", "8", "9", "10+", "Tiada anak menguji"].map((a) => `<option ${draft.umur === a ? "selected" : ""}>${a}</option>`).join("")}</select></label>
        <label class="f grow" for="fb-cadang" style="min-width:140px"><span>Cadang kepada kawan?</span><select class="input" id="fb-cadang" name="cadang">${["", "Ya, pasti", "Mungkin", "Tidak"].map((a) => `<option ${draft.cadang === a ? "selected" : ""}>${a}</option>`).join("")}</select></label>
      </div>
      <label class="f" for="fb-nama"><span>Nama (pilihan)</span><input class="input" id="fb-nama" name="nama" maxlength="60" value="${esc(draft.nama || "")}" autocomplete="name"></label>
      <p class="small muted" style="margin:0">Kami juga merekod halaman semasa (${esc(location.hash || "#/")}) dan jenis peranti (${esc(device())}) untuk membantu mencari masalah.</p>
      <div class="alert" data-err hidden></div>
      <button class="btn block big lime" type="submit">Hantar 🚀</button>
    </form></div>`;
  document.body.appendChild(bg);
  const m = bg.firstElementChild;
  const f = m.querySelector("[data-f]");
  const saveDraft = () => {
    const d = Object.fromEntries(new FormData(f));
    try { sessionStorage.setItem(draftKey, JSON.stringify({ ...d, rating: st.rating, cats: [...st.cats] })); } catch {}
  };
  const close = () => { saveDraft(); bg.remove(); document.removeEventListener("keydown", onKey); };
  const onKey = (e) => { if (e.key === "Escape") close(); };
  document.addEventListener("keydown", onKey);
  bg.addEventListener("click", (e) => { if (e.target === bg) close(); });
  m.querySelector("[data-close]").onclick = close;
  f.addEventListener("input", saveDraft);
  m.querySelectorAll("[data-r]").forEach((b) => (b.onclick = () => {
    st.rating = +b.dataset.r;
    m.querySelectorAll("[data-r]").forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-checked", x === b); });
    sfx("pop"); saveDraft();
  }));
  m.querySelectorAll("[data-c]").forEach((b) => (b.onclick = () => {
    const c = b.dataset.c;
    st.cats.has(c) ? st.cats.delete(c) : st.cats.add(c);
    b.classList.toggle("on"); saveDraft();
  }));
  f.querySelector("#fb-suka").focus();
  f.onsubmit = async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f));
    const err = m.querySelector("[data-err]");
    err.hidden = true;
    if (!st.rating) { err.textContent = "Sila pilih satu wajah untuk penilaian keseluruhan."; err.hidden = false; return; }
    if (!d.suka.trim() && !d.baiki.trim()) { err.textContent = "Tulis sekurang-kurangnya satu komen (apa yang disukai atau perlu diperbaiki)."; err.hidden = false; return; }
    const btn = f.querySelector("[type=submit]");
    btn.disabled = true; btn.textContent = "Menghantar…";
    const entry = {
      id: uid(), at: new Date().toISOString(), rating: st.rating, cats: [...st.cats],
      suka: d.suka.trim(), baiki: d.baiki.trim(), umur: d.umur, cadang: d.cadang, nama: d.nama.trim(),
      halaman: location.hash || "#/", peranti: device(),
    };
    try {
      await submit(entry);
      try { sessionStorage.removeItem(draftKey); } catch {}
      m.innerHTML = `<div class="center stack"><div style="font-size:4rem">🎉</div><h2>Terima kasih!</h2><p>Maklum balas anda telah dihantar. Anda boleh hantar lagi bila-bila masa.</p><button class="btn" data-ok>Kembali ke app</button></div>`;
      m.querySelector("[data-ok]").onclick = () => { bg.remove(); document.removeEventListener("keydown", onKey); };
      sfx("win"); confetti(30, ["💬", "⭐", "💖"]);
    } catch (ex) {
      err.textContent = ex?.code === "invalid_argument"
        ? "Akaun anda tidak dibenarkan menghantar maklum balas pada pautan ini. Minta pemilik memberi akses 'Contributor'."
        : `Gagal menghantar: ${ex?.message || ex}. Cuba lagi.`;
      err.hidden = false;
      btn.disabled = false; btn.textContent = "Hantar 🚀";
    }
  };
}

/** Floating button markup (hidden until a backend is confirmed). */
export const fabHtml = (cls = "") => `<button class="fb-fab no-print ${cls}" data-fb hidden aria-label="Beri maklum balas">💬 <span>Maklum balas</span></button>`;
export async function revealFab(root = document) {
  const be = await feedbackBackend();
  if (be) root.querySelectorAll("[data-fb]").forEach((b) => (b.hidden = false));
}

// ---------------------------------------------------------------- owner summary page
export async function feedbackAdminPage(el) {
  el.innerHTML = `<div class="wrap page stack"><div class="pagehead"><a class="back" href="#/app" aria-label="Kembali">←</a><h1>Maklum Balas Penguji</h1></div><div data-body><div class="card center">Memuatkan… ⏳</div></div></div>`;
  const body = el.querySelector("[data-body]");
  const be = await feedbackBackend();
  if (!be || be.kind !== "claude") { body.innerHTML = `<div class="alert info">Ringkasan ini hanya tersedia apabila app dibuka melalui pautan pilot claude.ai.${store.mode === "cloud" ? " Untuk Supabase, lihat jadual <b>feedback</b> dalam Dashboard → Table Editor." : ""}</div>`; return; }
  if (!(await be.user.isOwner())) { body.innerHTML = `<div class="alert info">Hanya pemilik pautan pilot boleh melihat semua maklum balas. Anda masih boleh menghantar maklum balas melalui butang 💬.</div>`; return; }

  let unsub = null;
  const render = async (snap) => {
    const rows = [];
    snap.docs.forEach((d) => (d.data()?.entries || []).forEach((e) => rows.push({ ...e, tester: d.id })));
    rows.sort((a, b) => (b.at || "").localeCompare(a.at || ""));
    if (!rows.length) { body.innerHTML = `<div class="card center"><div style="font-size:3rem">📭</div><p><b>Belum ada maklum balas.</b><br>Kongsi pautan pilot (beri akses <i>Contributor</i>) dan minta penguji tekan butang 💬 Maklum balas di penjuru bawah.</p></div>`; return; }
    const ps = await be.user.profiles([...new Set(rows.map((r) => r.tester))]);
    const avg = rows.reduce((s, r) => s + r.rating, 0) / rows.length;
    const testers = new Set(rows.map((r) => r.tester)).size;
    const byCat = {};
    rows.forEach((r) => r.cats.forEach((c) => (byCat[c] = (byCat[c] || 0) + 1)));
    const dist = [1, 2, 3, 4, 5].map((n) => rows.filter((r) => r.rating === n).length);
    const maxD = Math.max(...dist, 1);
    const recommend = rows.filter((r) => r.cadang === "Ya, pasti").length;
    body.innerHTML = `
      <div class="grid">
        <div class="panel center"><div style="font-size:1.8rem;font-weight:800">${rows.length}</div><div class="small muted">Maklum balas</div></div>
        <div class="panel center"><div style="font-size:1.8rem;font-weight:800">${testers}</div><div class="small muted">Penguji</div></div>
        <div class="panel center"><div style="font-size:1.8rem;font-weight:800">${FACES[Math.round(avg) - 1][0]} ${avg.toFixed(1)}</div><div class="small muted">Purata / 5</div></div>
        <div class="panel center"><div style="font-size:1.8rem;font-weight:800">${recommend}</div><div class="small muted">Pasti cadangkan</div></div>
      </div>
      <div class="grid two">
        <div class="card"><h3>Taburan penilaian</h3>${dist.map((n, i) => `<div class="row small" style="margin-bottom:6px;flex-wrap:nowrap"><span style="width:28px">${FACES[i][0]}</span><div class="bar grow"><i style="width:${(n / maxD) * 100}%"></i></div><b style="width:24px;text-align:right">${n}</b></div>`).join("")}</div>
        <div class="card"><h3>Bahagian disebut</h3>${Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([c, n]) => `<div class="row between small" style="margin-bottom:4px"><span>${esc(c)}</span><b>${n}</b></div>`).join("") || `<p class="muted small">Tiada.</p>`}</div>
      </div>
      <h2>Semua maklum balas</h2>
      <div class="stack" data-list></div>`;
    const list = body.querySelector("[data-list]");
    rows.forEach((r) => {
      const card = document.createElement("div");
      card.className = "card soft";
      card.innerHTML = `<div class="row between"><b data-who></b><span class="small muted">${new Date(r.at).toLocaleString("ms-MY")}</span></div>
        <div class="row small" style="margin:4px 0 8px"><span style="font-size:1.4rem">${FACES[r.rating - 1][0]}</span><span>${FACES[r.rating - 1][1]}</span>${r.umur ? `<span class="star-pill">Anak: ${esc(r.umur)}</span>` : ""}${r.cadang ? `<span class="star-pill" style="background:var(--lime-3)">Cadang: ${esc(r.cadang)}</span>` : ""}</div>
        ${r.cats.length ? `<div class="chips" style="margin-bottom:8px">${r.cats.map((c) => `<span class="chip" style="cursor:default">${esc(c)}</span>`).join("")}</div>` : ""}
        ${r.suka ? `<p style="margin:0 0 6px"><b>👍 Suka:</b> <span data-t="suka"></span></p>` : ""}
        ${r.baiki ? `<p style="margin:0 0 6px"><b>🛠️ Perbaiki:</b> <span data-t="baiki"></span></p>` : ""}
        <p class="small muted" style="margin:0">📍 ${esc(r.halaman)} · 📱 ${esc(r.peranti)}</p>`;
      card.querySelector("[data-who]").textContent = r.nama || ps[r.tester]?.name || "Penguji";
      card.querySelectorAll("[data-t]").forEach((s) => (s.textContent = r[s.dataset.t]));
      list.appendChild(card);
    });
  };
  unsub = be.db.collection("feedback").onSnapshot((snap) => render(snap).catch(console.warn), (e) => {
    body.innerHTML = `<div class="alert">Tidak dapat memuatkan maklum balas (${esc(e.code)}).</div>`;
  });
  return () => unsub?.();
}
