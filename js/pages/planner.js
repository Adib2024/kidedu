// Planner untuk Ibu & Anak — all data persisted per account via store.kv.
import { store } from "../store.js";
import { esc, toast, todayKey, prettyDate, addDays, uid, sfx, confetti, confirmBox, monthName, HARI_PENDEK, notFound } from "../util.js";

export const PLANNERS = [
  { id: "harian", title: "Planner Harian Mekar", emoji: "🌸", color: "#fce7f3", desc: "Keutamaan, jadual, tugasan & air." },
  { id: "tabiat", title: "Planner Diri Lebih Baik", emoji: "🍀", color: "#dcfce7", desc: "Penjejak tabiat bulanan." },
  { id: "rutin", title: "Rutin Ceria Anak", emoji: "🌞", color: "#fef3c7", desc: "Senarai rutin pagi & malam — dapat bintang!" },
  { id: "syukur", title: "Jurnal Syukur Aura", emoji: "🌼", color: "#fff7ed", desc: "3 perkara disyukuri setiap hari." },
  { id: "matlamat", title: "Planner Impian Ratu", emoji: "👑", color: "#fae8ff", desc: "Matlamat besar, langkah kecil." },
  { id: "tenang", title: "Planner Jiwa Tenang", emoji: "🕊️", color: "#e0f2fe", desc: "Mood, tidur & penjagaan diri bulanan." },
  { id: "jadual", title: "Jadual Dunia Dino", emoji: "🦕", color: "#d9f99d", desc: "Jadual mingguan anak — boleh cetak." },
  { id: "menu", title: "Planner Menu & Belanja", emoji: "🛒", color: "#ffe4e6", desc: "Menu mingguan + senarai beli-belah." },
];
const K = (s) => `planner:${s}`;

export function plannerList(el) {
  el.innerHTML = `<div class="wrap page stack">
    <div class="pagehead"><a class="back" href="#/zon-ibu" aria-label="Kembali">←</a><h1>Planner</h1></div>
    <section class="banner" style="background:linear-gradient(180deg,#fffbeb,#fde68a)"><h1>Topik Planner</h1><span class="sub">Untuk Ibu & Anak 💛</span></section>
    <div class="grid">${PLANNERS.map((p) => `<a class="tile" href="#/planner/${p.id}" style="--tile:${p.color}"><span class="em">${p.emoji}</span><span class="tt">${esc(p.title)}</span><span class="ds">${esc(p.desc)}</span></a>`).join("")}</div>
  </div>`;
}

export function plannerView(el, { id }, query) {
  const p = PLANNERS.find((x) => x.id === id);
  if (!p) return notFound(el, "#/planner");
  const frame = (inner, extra = "") => `<div class="wrap page stack" style="max-width:820px">
    <div class="pagehead"><a class="back" href="#/planner" aria-label="Kembali">←</a><h1 style="font-size:1.35rem">${p.emoji} ${esc(p.title)}</h1>${extra}</div>${inner}
    <div class="row no-print"><button class="btn sm ghost" data-print>🖨️ Cetak</button></div></div>`;
  return { harian, tabiat, rutin, syukur, matlamat, tenang, jadual, menu }[id](el, frame, query);
}

const dayNav = (date) => `<div class="pl-day no-print"><button class="btn sm ghost" data-d="-1" aria-label="Hari sebelum">⬅️</button><b>${esc(prettyDate(date))}</b><button class="btn sm ghost" data-d="1" aria-label="Hari selepas">➡️</button>${date !== todayKey() ? `<button class="btn sm sun" data-today>Hari ini</button>` : ""}</div><h3 class="print-only">${esc(prettyDate(date))}</h3>`;
function bindDayNav(el, get, set) {
  el.querySelectorAll("[data-d]").forEach((b) => (b.onclick = () => set(addDays(get(), +b.dataset.d))));
  el.querySelector("[data-today]")?.addEventListener("click", () => set(todayKey()));
}
/** Editable list helper: items [{id,text,done}] */
function listEditor(items, { placeholder = "Tambah…", checkable = true, onChange }) {
  const html = `<div class="stack" data-list>${items.map((it) => `<div class="list-item ${it.done ? "done" : ""}">
      ${checkable ? `<input type="checkbox" data-chk="${it.id}" ${it.done ? "checked" : ""} style="width:22px;height:22px;accent-color:var(--pink)">` : ""}
      <span class="grow" style="${it.done ? "text-decoration:line-through;color:var(--ink-2)" : ""}">${esc(it.text)}</span>
      <button class="x-btn no-print" data-rm="${it.id}" aria-label="Buang">✕</button></div>`).join("")}</div>
    <form class="row no-print" data-add style="margin-top:8px"><input class="input grow" placeholder="${esc(placeholder)}" maxlength="140" style="flex:1"><button class="btn sm" type="submit">+</button></form>`;
  const bind = (root) => {
    root.querySelectorAll("[data-chk]").forEach((c) => (c.onchange = () => { items.find((x) => x.id === c.dataset.chk).done = c.checked; if (c.checked) sfx("right"); onChange(); }));
    root.querySelectorAll("[data-rm]").forEach((b) => (b.onclick = () => { items.splice(items.findIndex((x) => x.id === b.dataset.rm), 1); onChange(); }));
    root.querySelector("[data-add]").onsubmit = (e) => {
      e.preventDefault();
      const inp = e.target.querySelector("input");
      if (!inp.value.trim()) return;
      items.push({ id: uid(), text: inp.value.trim(), done: false });
      onChange(true);
    };
  };
  return { html, bind };
}

// ---------------------------------------------------------------- 1. harian
async function harian(el, frame) {
  let date = todayKey();
  const draw = async () => {
    const k = K(`harian:${date}`);
    const d = await store.kv(k, { top: ["", "", ""], slots: {}, todos: [], water: 0, notes: "" });
    const save = () => store.setKv(k, d);
    const todo = listEditor(d.todos, { placeholder: "Tugasan baru…", onChange: (refocus) => { save(); draw().then(() => refocus && el.querySelector("[data-add] input")?.focus()); } });
    const hours = Array.from({ length: 17 }, (_, i) => i + 6);
    el.innerHTML = frame(`${dayNav(date)}
      <div class="grid two">
        <div class="card"><h3>⭐ 3 Keutamaan</h3>${d.top.map((t, i) => `<input class="input" data-top="${i}" value="${esc(t)}" placeholder="Keutamaan ${i + 1}" maxlength="100" style="margin-bottom:8px">`).join("")}</div>
        <div class="card"><h3>💧 Air (${d.water}/8)</h3><div class="water">${Array.from({ length: 8 }, (_, i) => `<button class="${i < d.water ? "on" : ""}" data-w="${i + 1}" aria-label="Gelas ${i + 1}">🥛</button>`).join("")}</div>
          <h3 style="margin-top:14px">📝 Nota</h3><textarea class="input" data-notes maxlength="2000">${esc(d.notes)}</textarea></div>
      </div>
      <div class="card"><h3>✅ Senarai Tugasan</h3>${todo.html}</div>
      <div class="card"><h3>🕐 Jadual Hari Ini</h3><div class="stack">${hours.map((h) => `<div class="row" style="flex-wrap:nowrap"><b style="width:60px;flex:none">${String(h).padStart(2, "0")}:00</b><input class="input" data-slot="${h}" value="${esc(d.slots[h] || "")}" maxlength="100" style="padding:8px 10px"></div>`).join("")}</div></div>`);
    bindDayNav(el, () => date, (v) => { date = v; draw(); });
    todo.bind(el);
    el.querySelectorAll("[data-top]").forEach((i) => (i.oninput = () => { d.top[+i.dataset.top] = i.value; save(); }));
    el.querySelectorAll("[data-slot]").forEach((i) => (i.oninput = () => { d.slots[i.dataset.slot] = i.value; save(); }));
    el.querySelector("[data-notes]").oninput = (e) => { d.notes = e.target.value; save(); };
    el.querySelectorAll("[data-w]").forEach((b) => (b.onclick = () => { const v = +b.dataset.w; d.water = d.water === v ? v - 1 : v; save(); if (d.water === 8) { sfx("win"); toast("Cukup 8 gelas! 💧"); } draw(); }));
  };
  draw();
}

// ---------------------------------------------------------------- 2. tabiat
async function tabiat(el, frame) {
  const now = new Date();
  let y = now.getFullYear(), m = now.getMonth();
  const draw = async () => {
    const ym = `${y}-${String(m + 1).padStart(2, "0")}`;
    const habits = await store.kv(K("tabiat:senarai"), ["Minum 8 gelas air", "Senaman 15 minit", "Baca buku", "Tidur awal"]);
    const marks = await store.kv(K(`tabiat:${ym}`), {});
    // v1.0 keyed marks by list position, so deleting a habit shifted ticks onto the next one.
    // Marks are now keyed by habit name; migrate old numeric keys once.
    for (const k of Object.keys(marks)) {
      if (/^\d+$/.test(k) && habits[+k] && !marks[habits[+k]]) { marks[habits[+k]] = marks[k]; delete marks[k]; }
    }
    const days = new Date(y, m + 1, 0).getDate();
    const isToday = (d) => y === now.getFullYear() && m === now.getMonth() && d === now.getDate();
    el.innerHTML = frame(`
      <div class="pl-day no-print"><button class="btn sm ghost" data-m="-1">⬅️</button><b>${monthName(m)} ${y}</b><button class="btn sm ghost" data-m="1">➡️</button></div>
      <h3 class="print-only">${monthName(m)} ${y}</h3>
      <div class="card table-scroll"><table class="habit-table">
        <thead><tr><th></th>${Array.from({ length: days }, (_, d) => `<th style="${isToday(d + 1) ? "color:var(--pink-dk)" : ""}">${d + 1}</th>`).join("")}<th>%</th></tr></thead>
        <tbody>${habits.map((h, hi) => {
          const n = Object.values(marks[h] || {}).filter(Boolean).length;
          return `<tr><td class="nm">${esc(h)}</td>${Array.from({ length: days }, (_, d) => `<td><button class="${marks[h]?.[d + 1] ? "on" : ""}" data-h="${hi}" data-day="${d + 1}" aria-pressed="${!!marks[h]?.[d + 1]}" aria-label="${esc(h)} hari ${d + 1}">${marks[h]?.[d + 1] ? "✓" : ""}</button></td>`).join("")}<td><b>${Math.round((n / days) * 100)}</b></td></tr>`;
        }).join("")}</tbody></table></div>
      <div class="card no-print"><h3>Urus tabiat</h3>
        <div class="stack">${habits.map((h, i) => `<div class="list-item"><span class="grow">${esc(h)}</span><button class="x-btn" data-rm="${i}" aria-label="Buang">✕</button></div>`).join("")}</div>
        <form class="row" data-add style="margin-top:8px"><input class="input" style="flex:1" maxlength="60" placeholder="Tabiat baru…" aria-label="Tabiat baru"><button class="btn sm">+</button></form></div>`);
    el.querySelectorAll("[data-m]").forEach((b) => (b.onclick = () => { m += +b.dataset.m; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } draw(); }));
    el.querySelectorAll("[data-h]").forEach((b) => (b.onclick = () => {
      const hi = habits[+b.dataset.h], d = b.dataset.day;
      (marks[hi] ||= {})[d] = !marks[hi][d];
      b.setAttribute("aria-pressed", marks[hi][d]);
      store.setKv(K(`tabiat:${ym}`), marks);
      b.classList.toggle("on"); b.textContent = marks[hi][d] ? "✓" : "";
      if (marks[hi][d]) sfx("pop");
    }));
    el.querySelectorAll("[data-rm]").forEach((b) => (b.onclick = async () => {
      if (!(await confirmBox(`Buang tabiat "${habits[+b.dataset.rm]}"?`, "Buang"))) return;
      habits.splice(+b.dataset.rm, 1);
      store.setKv(K("tabiat:senarai"), habits, { immediate: true });
      draw();
    }));
    el.querySelector("[data-add]").onsubmit = (e) => {
      e.preventDefault();
      const v = e.target.querySelector("input").value.trim();
      if (!v) return;
      if (habits.some((h) => h.toLowerCase() === v.toLowerCase())) { toast("Tabiat itu sudah ada dalam senarai"); return; }
      habits.push(v);
      store.setKv(K("tabiat:senarai"), habits, { immediate: true });
      draw();
    };
  };
  draw();
}

// ---------------------------------------------------------------- 3. rutin anak (awards stars)
const DEFAULT_RUTIN = {
  pagi: ["🛏️ Kemas katil", "🪥 Gosok gigi", "🚿 Mandi", "👕 Pakai baju sendiri", "🍳 Sarapan", "🎒 Sediakan beg"],
  malam: ["🧸 Simpan mainan", "🛁 Mandi / cuci kaki", "🪥 Gosok gigi", "📖 Baca buku", "🤲 Doa sebelum tidur"],
};
async function rutin(el, frame) {
  const child = store.activeChild;
  if (!child) { el.innerHTML = frame(`<div class="alert info">Tambah profil anak dahulu. <a href="#/anak?baru=1">Tambah</a></div>`); return; }
  let date = todayKey();
  const draw = async () => {
    const cfg = await store.kv(K(`rutin:cfg:${child.id}`), structuredClone(DEFAULT_RUTIN));
    const k = K(`rutin:${child.id}:${date}`);
    const d = await store.kv(k, { pagi: {}, malam: {} });
    // v1.0 stored ticks as arrays by position; convert to {taskText: true}
    for (const part of ["pagi", "malam"]) {
      if (Array.isArray(d[part])) d[part] = Object.fromEntries(d[part].map((v, i) => [cfg[part][i], v]).filter(([t, v]) => t && v));
      d[part] ||= {};
    }
    const streak = await calcStreak();
    el.innerHTML = frame(`${dayNav(date)}
      <div class="mascot-say"><div class="m">${esc(child.avatar || "🐼")}</div><div class="bubble">Siapkan rutin, ${esc(child.name)}! Lengkapkan semua untuk dapat ⭐. 🔥 Berturut-turut: <b>${streak} hari</b></div></div>
      ${["pagi", "malam"].map((part) => {
        const all = cfg[part].length && cfg[part].every((t) => d[part][t]);
        return `<div class="card"><h3>${part === "pagi" ? "🌞 Rutin Pagi" : "🌙 Rutin Malam"} ${all ? "⭐" : ""}</h3>
          <div class="stack">${cfg[part].map((t, i) => `<label class="check ${d[part][t] ? "done" : ""}" style="font-size:1.15rem"><input type="checkbox" data-p="${part}" data-i="${i}" ${d[part][t] ? "checked" : ""}><span>${esc(t)}</span></label>`).join("")}</div></div>`;
      }).join("")}
      <details class="card no-print"><summary style="font-weight:800;cursor:pointer">⚙️ Ubah senarai rutin</summary>
        ${["pagi", "malam"].map((part) => `<h4 style="margin-top:10px">${part === "pagi" ? "Pagi" : "Malam"}</h4>
          <div class="stack">${cfg[part].map((t, i) => `<div class="list-item"><span class="grow">${esc(t)}</span><button class="x-btn" data-rm="${part}:${i}">✕</button></div>`).join("")}</div>
          <form class="row" data-add="${part}" style="margin-top:6px"><input class="input" style="flex:1" maxlength="50" placeholder="cth: 🥛 Minum susu"><button class="btn sm">+</button></form>`).join("")}
      </details>`);
    bindDayNav(el, () => date, (v) => { date = v; draw(); });
    el.querySelectorAll("[data-p]").forEach((c) => (c.onchange = async () => {
      const part = c.dataset.p;
      const task = cfg[part][+c.dataset.i];
      if (c.checked) d[part][task] = true; else delete d[part][task];
      store.setKv(k, d, { immediate: true });
      if (c.checked) sfx("right");
      const all = cfg[part].every((t) => d[part][t]);
      if (all && c.checked) {
        const r = await store.record(`rutin:${date}:${part}`, "rutin", { stars: 1, score: 1, total: 1 });
        confetti(40); toast(`Rutin ${part} lengkap! +⭐${r.newSticker ? " · Pelekat baru " + r.newSticker : ""}`);
      }
      draw();
    }));
    el.querySelectorAll("[data-rm]").forEach((b) => (b.onclick = () => { const [part, i] = b.dataset.rm.split(":"); cfg[part].splice(+i, 1); store.setKv(K(`rutin:cfg:${child.id}`), cfg, { immediate: true }); draw(); }));
    el.querySelectorAll("[data-add]").forEach((f) => (f.onsubmit = (e) => { e.preventDefault(); const v = f.querySelector("input").value.trim(); if (!v) return; if (cfg[f.dataset.add].includes(v)) { toast("Rutin itu sudah ada"); return; } cfg[f.dataset.add].push(v); store.setKv(K(`rutin:cfg:${child.id}`), cfg, { immediate: true }); draw(); }));
  };
  async function calcStreak() {
    let n = 0, day = todayKey();
    for (let i = 0; i < 60; i++) {
      const has = store.prog(`rutin:${day}:pagi`, child.id) || store.prog(`rutin:${day}:malam`, child.id);
      if (has) n++; else if (i > 0) break;
      day = addDays(day, -1);
    }
    return n;
  }
  draw();
}

// ---------------------------------------------------------------- 4. syukur
async function syukur(el, frame) {
  let date = todayKey();
  const draw = async () => {
    const all = await store.kv(K("syukur"), {});
    const d = all[date] || ["", "", ""];
    let streak = 0, day = todayKey();
    while (all[day]?.some((x) => x.trim())) { streak++; day = addDays(day, -1); }
    const recent = Object.entries(all).filter(([, v]) => v.some((x) => x.trim())).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 10);
    el.innerHTML = frame(`${dayNav(date)}
      <div class="card"><h3>🌼 Hari ini saya bersyukur kerana…</h3>
        ${d.map((t, i) => `<input class="input" data-g="${i}" value="${esc(t)}" maxlength="160" placeholder="${["Seseorang yang saya sayang…", "Perkara kecil yang menggembirakan…", "Sesuatu tentang diri saya…"][i]}" style="margin-bottom:8px">`).join("")}
        <p class="small muted">🔥 Rekod berturut-turut: <b>${streak} hari</b></p></div>
      <div class="card"><h3>Kenangan syukur</h3><div class="stack">${recent.map(([dt, v]) => `<div class="list-item"><div class="grow"><b class="small">${esc(prettyDate(dt))}</b>${v.filter((x) => x.trim()).map((x) => `<div>🌼 ${esc(x)}</div>`).join("")}</div></div>`).join("") || `<p class="muted">Mula menulis hari ini!</p>`}</div></div>`);
    bindDayNav(el, () => date, (v) => { date = v; draw(); });
    el.querySelectorAll("[data-g]").forEach((i) => (i.oninput = () => { d[+i.dataset.g] = i.value; all[date] = d; store.setKv(K("syukur"), all); }));
  };
  draw();
}

// ---------------------------------------------------------------- 5. matlamat
async function matlamat(el, frame) {
  const goals = await store.kv(K("matlamat"), []);
  const save = () => store.setKv(K("matlamat"), goals, { immediate: true });
  const draw = () => {
    el.innerHTML = frame(`
      <form class="card no-print" data-new><h3>➕ Matlamat baru</h3>
        <label class="f"><span>Matlamat</span><input class="input" name="title" maxlength="100" required placeholder="cth: Simpan RM1,000 untuk dana kecemasan"></label>
        <div class="row"><label class="f grow"><span>Tarikh sasaran</span><input class="input" type="date" name="due"></label>
        <label class="f grow"><span>Kategori</span><select class="input" name="cat"><option>💰 Kewangan</option><option>💪 Kesihatan</option><option>📚 Ilmu</option><option>👨‍👩‍👧 Keluarga</option><option>💼 Kerjaya</option><option>🌱 Diri</option></select></label></div>
        <button class="btn lime">Tambah</button></form>
      ${goals.map((g) => {
        const done = g.steps.filter((s) => s.done).length;
        const pct = g.steps.length ? Math.round((done / g.steps.length) * 100) : 0;
        return `<div class="card" data-g="${g.id}">
          <div class="row between"><h3 style="margin:0">${esc(g.cat)} ${esc(g.title)}</h3><button class="x-btn no-print" data-del="${g.id}">✕</button></div>
          ${g.due ? `<p class="small muted">🎯 Sasaran: ${esc(prettyDate(g.due))}</p>` : ""}
          <div class="row"><div class="bar grow"><i style="width:${pct}%;background:var(--grape)"></i></div><b>${pct}%</b></div>
          <div data-steps style="margin-top:10px"></div></div>`;
      }).join("") || `<p class="muted center">Belum ada matlamat. Mulakan dengan satu! 👑</p>`}`);
    el.querySelector("[data-new]").onsubmit = (e) => {
      e.preventDefault();
      const f = Object.fromEntries(new FormData(e.target));
      goals.unshift({ id: uid(), title: f.title.trim(), due: f.due, cat: f.cat, steps: [] });
      save(); draw();
    };
    goals.forEach((g) => {
      const box = el.querySelector(`[data-g="${g.id}"] [data-steps]`);
      const ed = listEditor(g.steps, { placeholder: "Langkah kecil…", onChange: () => { save(); if (g.steps.length && g.steps.every((s) => s.done)) confetti(50, ["👑", "✨", "🎉"]); draw(); } });
      box.innerHTML = ed.html;
      ed.bind(box);
    });
    el.querySelectorAll("[data-del]").forEach((b) => (b.onclick = async () => {
      if (!(await confirmBox("Padam matlamat ini?", "Padam"))) return;
      goals.splice(goals.findIndex((g) => g.id === b.dataset.del), 1);
      save(); draw();
    }));
  };
  draw();
}

// ---------------------------------------------------------------- 6. tenang
const MOODS = [["😄", "#4ade80", "Sangat baik"], ["🙂", "#a3e635", "Baik"], ["😐", "#facc15", "Biasa"], ["😔", "#fb923c", "Kurang baik"], ["😢", "#f87171", "Teruk"]];
const CARE = ["🛁 Mandi santai", "🚶‍♀️ Berjalan", "📖 Membaca", "🤲 Ibadah/meditasi", "☕ Rehat tenang", "🎵 Muzik", "📵 Detoks gajet", "😴 Tidur cukup"];
async function tenang(el, frame) {
  const now = new Date();
  let y = now.getFullYear(), m = now.getMonth();
  let sel = todayKey();
  const draw = async () => {
    const ym = `${y}-${String(m + 1).padStart(2, "0")}`;
    const data = await store.kv(K(`tenang:${ym}`), {});
    const days = new Date(y, m + 1, 0).getDate();
    const first = new Date(y, m, 1).getDay();
    if (!sel.startsWith(ym)) sel = `${ym}-01`;
    const d = data[sel] || { mood: null, sleep: "", care: [] };
    const moodCount = MOODS.map((_, i) => Object.values(data).filter((x) => x.mood === i).length);
    el.innerHTML = frame(`
      <div class="pl-day no-print"><button class="btn sm ghost" data-m="-1">⬅️</button><b>${monthName(m)} ${y}</b><button class="btn sm ghost" data-m="1">➡️</button></div>
      <div class="card">
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;text-align:center">
          ${HARI_PENDEK.map((h) => `<b class="small muted">${h}</b>`).join("")}
          ${Array(first).fill("<span></span>").join("")}
          ${Array.from({ length: days }, (_, i) => { const dk = `${ym}-${String(i + 1).padStart(2, "0")}`; const mo = data[dk]?.mood; return `<button data-day="${dk}" style="aspect-ratio:1;border-radius:12px;border:${dk === sel ? "3px solid var(--ink)" : "2px solid var(--line)"};background:${mo != null ? MOODS[mo][1] : "#fff"};cursor:pointer;font-weight:800">${i + 1}</button>`; }).join("")}
        </div>
        <div class="row small" style="margin-top:10px;justify-content:center">${MOODS.map(([e, c, n], i) => `<span>${e} ${moodCount[i]}</span>`).join(" · ")}</div>
      </div>
      <div class="card"><h3>${esc(prettyDate(sel))}</h3>
        <div class="chips">${MOODS.map(([e, c, n], i) => `<button class="chip ${d.mood === i ? "on" : ""}" data-mood="${i}">${e} ${n}</button>`).join("")}</div>
        <label class="f" style="margin-top:12px"><span>😴 Jam tidur</span><input class="input" type="number" min="0" max="16" step="0.5" data-sleep value="${esc(d.sleep)}" style="max-width:140px"></label>
        <span style="font-weight:800;font-size:.92rem">Penjagaan diri hari ini</span>
        <div class="chips" style="margin-top:6px">${CARE.map((c) => `<button class="chip ${d.care.includes(c) ? "on" : ""}" data-care="${esc(c)}">${c}</button>`).join("")}</div>
      </div>`);
    const save = () => { data[sel] = d; store.setKv(K(`tenang:${ym}`), data); };
    el.querySelectorAll("[data-m]").forEach((b) => (b.onclick = () => { m += +b.dataset.m; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } draw(); }));
    el.querySelectorAll("[data-day]").forEach((b) => (b.onclick = () => { sel = b.dataset.day; draw(); }));
    el.querySelectorAll("[data-mood]").forEach((b) => (b.onclick = () => { d.mood = +b.dataset.mood; save(); draw(); }));
    el.querySelector("[data-sleep]").oninput = (e) => { d.sleep = e.target.value; save(); };
    el.querySelectorAll("[data-care]").forEach((b) => (b.onclick = () => { const c = b.dataset.care; d.care = d.care.includes(c) ? d.care.filter((x) => x !== c) : [...d.care, c]; save(); b.classList.toggle("on"); }));
  };
  draw();
}

// ---------------------------------------------------------------- 7. jadual dino
const DAYS = ["Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu", "Ahad"];
async function jadual(el, frame) {
  const child = store.activeChild;
  const k = K(`jadual:${child?.id || "umum"}`);
  const d = await store.kv(k, { slots: ["Pagi", "Tengah hari", "Petang", "Malam"], cells: {} });
  const draw = () => {
    el.innerHTML = frame(`
      <div class="card" style="background:linear-gradient(135deg,#ecfccb,#fef9c3)">
        <h2 class="center">🦕 Jadual Mingguan ${child ? esc(child.name) : ""} 🦖</h2>
        <div class="table-scroll"><table style="width:100%;border-collapse:separate;border-spacing:4px;min-width:640px">
          <thead><tr><th></th>${DAYS.map((x) => `<th style="background:#84cc16;color:#1a2e05;border-radius:10px;padding:6px">${x}</th>`).join("")}</tr></thead>
          <tbody>${d.slots.map((s, si) => `<tr><th style="background:#fde68a;border-radius:10px;padding:6px;font-size:.85rem">${esc(s)}</th>${DAYS.map((_, di) => `<td><textarea class="input" data-c="${si}-${di}" aria-label="${esc(s)}, ${DAYS[di]}" style="min-height:64px;padding:6px;font-size:.85rem;resize:none" maxlength="60">${esc(d.cells[`${si}-${di}`] || "")}</textarea></td>`).join("")}</tr>`).join("")}</tbody>
        </table></div>
      </div>
      <p class="small muted no-print">💡 Idea: 📚 Mengaji, ⚽ Bola, 🎨 Seni, 🏊 Renang, 📝 Kerja sekolah, 🧩 Puzzle, 🛝 Taman</p>`);
    el.querySelectorAll("[data-c]").forEach((t) => (t.oninput = () => { d.cells[t.dataset.c] = t.value; store.setKv(k, d); }));
  };
  draw();
}

// ---------------------------------------------------------------- 8. menu & belanja
const MEALS = ["Sarapan", "Tengah hari", "Malam"];
async function menu(el, frame) {
  const d = await store.kv(K("menu"), { plan: {}, shop: [] });
  const save = () => store.setKv(K("menu"), d);
  const draw = () => {
    const total = d.shop.reduce((s, it) => s + (Number(it.price) || 0), 0);
    const left = d.shop.filter((it) => !it.done).reduce((s, it) => s + (Number(it.price) || 0), 0);
    el.innerHTML = frame(`
      <div class="card"><h3>🍽️ Menu Minggu Ini</h3>
        <div class="table-scroll"><table style="width:100%;border-collapse:separate;border-spacing:4px;min-width:560px">
          <thead><tr><th></th>${MEALS.map((x) => `<th style="background:var(--pink-2);color:#3b0a24;border-radius:10px;padding:6px">${x}</th>`).join("")}</tr></thead>
          <tbody>${DAYS.map((day, di) => `<tr><th style="background:var(--pink-3);border-radius:10px;padding:6px;font-size:.85rem">${day}</th>${MEALS.map((_, mi) => `<td><input class="input" data-plan="${di}-${mi}" aria-label="${MEALS[mi]}, ${day}" value="${esc(d.plan[`${di}-${mi}`] || "")}" maxlength="60" style="padding:6px 8px;font-size:.9rem"></td>`).join("")}</tr>`).join("")}</tbody>
        </table></div></div>
      <div class="card"><h3>🛒 Senarai Beli-belah</h3>
        <div class="stack">${d.shop.map((it) => `<div class="list-item ${it.done ? "done" : ""}"><input type="checkbox" data-chk="${it.id}" ${it.done ? "checked" : ""} style="width:22px;height:22px;accent-color:var(--pink)">
          <span class="grow" style="${it.done ? "text-decoration:line-through;color:var(--ink-2)" : ""}">${esc(it.text)}</span><span class="small">${it.price ? "RM" + Number(it.price).toFixed(2) : ""}</span><button class="x-btn no-print" data-rm="${it.id}">✕</button></div>`).join("") || `<p class="muted">Senarai kosong.</p>`}</div>
        <form class="row no-print" data-add style="margin-top:8px"><input class="input" name="text" style="flex:2;min-width:140px" maxlength="60" placeholder="Barang (cth: Telur 30 biji)" aria-label="Barang" required><input class="input" name="price" type="number" min="0" step="0.01" style="flex:1;min-width:90px" placeholder="RM" aria-label="Harga (RM)"><button class="btn sm">+</button></form>
        <p style="margin-top:10px"><b>Jumlah anggaran: RM${total.toFixed(2)}</b> · Belum dibeli: RM${left.toFixed(2)}</p>
        <button class="btn sm ghost no-print" data-clear>🧹 Buang barang yang sudah dibeli</button></div>`);
    el.querySelectorAll("[data-plan]").forEach((i) => (i.oninput = () => { d.plan[i.dataset.plan] = i.value; save(); }));
    el.querySelectorAll("[data-chk]").forEach((c) => (c.onchange = () => { d.shop.find((x) => x.id === c.dataset.chk).done = c.checked; save(); draw(); }));
    el.querySelectorAll("[data-rm]").forEach((b) => (b.onclick = () => { d.shop = d.shop.filter((x) => x.id !== b.dataset.rm); save(); draw(); }));
    el.querySelector("[data-add]").onsubmit = (e) => {
      e.preventDefault();
      const f = Object.fromEntries(new FormData(e.target));
      d.shop.push({ id: uid(), text: f.text.trim(), price: f.price, done: false });
      save(); draw();
      el.querySelector("[data-add] input").focus();
    };
    el.querySelector("[data-clear]").onclick = () => { d.shop = d.shop.filter((x) => !x.done); save(); draw(); };
  };
  draw();
}
