// Sekolah (Darjah 1–6): chapter path per year & subject, chapter page, play rounds (Latihan / Cabaran Masa /
// Lawan Bos), Ulang Kaji Pintar, Cabaran Harian and printable practice sheets.
import { store } from "../store.js";
import { esc, toast, notFound, todayKey, confetti, pick } from "../util.js";
import { showResult } from "../engine.js";
import { mascot } from "../mascot.js";
import {
  SUBJECTS, YEARS, STAGES, topics, topicById, subjectById, roundFor, activityId, familyId, REVIEW_ID, DAILY_FAMILY, timeLimit, gradeOf, gradeLabel,
} from "../school/curriculum.js";
import { playRound } from "../school/play.js";
import { loadReview, addMistakes, applyReview, dueItems, buildReviewRound } from "../school/review.js";
import { makeSet, plain, correctOf } from "../school/qkit.js";

// ------------------------------------------------------------ progress helpers
const stageStars = (s, y, t, st) => store.starsOf(activityId(s, y, t, st));
export const chapterStars = (s, y, t) => STAGES.reduce((n, st) => n + stageStars(s, y, t, st.id), 0);
const bossOpen = (s, y, t) => stageStars(s, y, t, "latihan") > 0 || stageStars(s, y, t, "masa") > 0;
export function subjectProgress(s, y) {
  const ts = topics(s, y);
  const stars = ts.reduce((n, t) => n + chapterStars(s, y, t.id), 0);
  return { stars, max: ts.length * 9, started: ts.filter((t) => chapterStars(s, y, t.id) > 0).length, total: ts.length, pct: Math.round((stars / Math.max(1, ts.length * 9)) * 100) };
}
export function nextTopic(s, y) {
  const ts = topics(s, y);
  return ts.find((t) => stageStars(s, y, t.id, "latihan") === 0) || ts.reduce((a, b) => (chapterStars(s, y, b.id) < chapterStars(s, y, a.id) ? b : a), ts[0]);
}
const chapterHref = (s, y, t) => `#/sekolah/bab/${s}/${y}/${t}`;
const homeHref = (s, y) => `#/sekolah?t=${y}&s=${s}`;
const yearOk = (y) => YEARS.includes(Number(y));
const ring = (pct, size = 64, stroke = 7, color = "var(--acc)") => {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return `<svg class="ring2" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="rgba(52,32,63,.1)" stroke-width="${stroke}"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct / 100)}" transform="rotate(-90 ${size / 2} ${size / 2})"/></svg>`;
};
const stars3 = (n) => `<span class="st3" aria-label="${n} bintang">${[1, 2, 3].map((k) => `<i class="${k <= n ? "on" : ""}">★</i>`).join("")}</span>`;

// ------------------------------------------------------------ home: year chips, subject tabs, chapter path
export async function schoolHome(el, _p, query) {
  const c = store.activeChild;
  const grade = gradeOf(c);
  const y = yearOk(query.t) ? Number(query.t) : grade || 1;
  const s = subjectById(query.s) ? query.s : "mat";
  const subj = subjectById(s);
  const ts = topics(s, y);
  const nxt = nextTopic(s, y);
  const today = todayKey();
  const dailyDone = store.starsOf(`${DAILY_FAMILY}:${today}`) > 0 || !!store.prog(`${DAILY_FAMILY}:${today}`);
  const offs = [0, 1, 0, -1];
  el.innerHTML = `<div class="wrap page school" style="--acc:${subj.accent};--sc:${subj.color}">
    <section class="school-hero">
      <div class="sh-art">${mascot("cheer", 92, "bob")}</div>
      <div class="sh-main">
        <p class="eyebrow">🎒 Sekolah Pipi · ${esc(c.name)}${grade ? ` · ${gradeLabel(grade)}` : ""}</p>
        <h1>${esc(subj.title)} <span class="muted">Tahun ${y}</span></h1>
        <p class="sh-sub">${ts.length} bab · ⭐ ${subjectProgress(s, y).stars}/${ts.length * 9}</p>
        ${nxt ? `<a class="btn big sh-go" href="${chapterHref(s, y, nxt.id)}">▶ ${chapterStars(s, y, nxt.id) ? "Teruskan" : "Mula"}: ${esc(nxt.title)}</a>` : ""}
      </div>
    </section>
    ${grade === 0 && !query.t ? `<div class="alert info small">👶 ${esc(c.name)} dalam Prasekolah — cuba <a href="#/games">Games</a> & <a href="#/buku">Buku Cerita</a>, atau terokai Tahun 1 di bawah. Ibu bapa boleh tetapkan Darjah dalam Profil Anak.</div>` : ""}
    <div class="sch-grid">
      <div class="sch-main">
        <div class="year-chips" role="tablist" aria-label="Tahun">${YEARS.map((n) => `<a role="tab" aria-selected="${n === y}" class="ychip ${n === y ? "on" : ""}" href="${homeHref(s, n)}" aria-label="Tahun ${n}">${n === grade ? "⭐" : ""}<span class="yl">Tahun </span>${n === grade ? "" : ""}${n}</a>`).join("")}</div>
        <div class="subj-tabs" role="tablist" aria-label="Subjek">${SUBJECTS.map((x) => { const p = subjectProgress(x.id, y); return `<a role="tab" aria-selected="${x.id === s}" class="stab ${x.id === s ? "on" : ""}" href="${homeHref(x.id, y)}" style="--tc:${x.color};--ta:${x.accent}">
          <span class="stab-e">${x.emoji}</span><span class="stab-t"><b>${esc(x.title)}</b><small>${p.started}/${p.total} bab · ${p.pct}%</small></span><span class="stab-bar"><i style="width:${p.pct}%"></i></span></a>`; }).join("")}</div>
        <ol class="path" aria-label="Bab ${esc(subj.title)} Tahun ${y}">
          ${ts.map((t, k) => {
            const st = chapterStars(s, y, t.id), lat = stageStars(s, y, t.id, "latihan");
            const state = lat > 0 ? "done" : t.id === nxt?.id ? "next" : "todo";
            return `<li class="node ${state}" style="--i:${k};--off:${offs[k % 4]}">
              <a class="node-btn" href="${chapterHref(s, y, t.id)}" aria-label="Bab ${k + 1}: ${esc(t.title)}, ${st} daripada 9 bintang">
                ${ring((st / 9) * 100, 86, 8)}<span class="node-e">${t.emoji}</span>${state === "next" ? `<span class="node-go">MULA</span>` : ""}${st >= 9 ? `<span class="node-crown">👑</span>` : ""}
              </a>
              <div class="node-label"><small>Bab ${k + 1}</small><b>${esc(t.title)}</b>${stars3(Math.min(3, Math.ceil(st / 3)))}</div>
            </li>`;
          }).join("")}
          <li class="node trophy" style="--i:${ts.length};--off:0"><div class="node-btn">${subjectProgress(s, y).pct === 100 ? "🏆" : "🎁"}</div><div class="node-label"><b>${subjectProgress(s, y).pct === 100 ? "Tamat! Hebat!" : "Kumpul semua 👑"}</b></div></li>
        </ol>
      </div>
      <aside class="sch-side">
        <a class="side-card review" href="#/sekolah/ulang-kaji"><span class="sc-e">🔁</span><span><b>Ulang Kaji Pintar</b><small data-due>Memuatkan…</small></span></a>
        <a class="side-card daily ${dailyDone ? "done" : ""}" href="#/sekolah/harian"><span class="sc-e">${dailyDone ? "✅" : "🌟"}</span><span><b>Cabaran Harian</b><small>${dailyDone ? "Selesai hari ini — main lagi untuk skor lebih tinggi" : "10 soalan campuran · baharu hari ini!"}</small></span></a>
        <div class="side-card prog"><b>Kemajuan Tahun ${y}</b>${SUBJECTS.map((x) => { const p = subjectProgress(x.id, y); return `<div class="sp-row"><span>${x.emoji} ${esc(x.short)}</span><span class="bar"><i style="width:${p.pct}%;background:${x.accent}"></i></span><b>${p.pct}%</b></div>`; }).join("")}</div>
        <a class="side-card print" href="#/sekolah/cetak/${s}/${y}/${nxt?.id || ts[0].id}"><span class="sc-e">🖨️</span><span><b>Lembaran Latihan</b><small>Cetak soalan + skema jawapan</small></span></a>
      </aside>
    </div>
  </div>`;
  const items = await loadReview(c.id).catch(() => []);
  const due = dueItems(items).length;
  const dueEl = el.querySelector("[data-due]");
  if (dueEl) dueEl.textContent = due ? `${due} soalan perlu diulang` : items.length ? `${items.length} soalan disimpan · tiada yang perlu hari ini` : "Soalan yang salah akan disimpan di sini";
  if (due) el.querySelector(".side-card.review").classList.add("hot");
}

// ------------------------------------------------------------ chapter page
export function schoolChapter(el, { subject, year, topic }) {
  const subj = subjectById(subject), y = Number(year), t = subj && yearOk(y) ? topicById(subject, y, topic) : null;
  if (!t || !store.isPublished(familyId(subject, y))) return notFound(el, "#/sekolah");
  const ts = topics(subject, y), k = t.index;
  const prev = ts[k - 1], next = ts[k + 1];
  const st = chapterStars(subject, y, t.id);
  el.innerHTML = `<div class="wrap page school" style="--acc:${subj.accent};--sc:${subj.color};max-width:860px">
    <div class="pagehead"><a class="back" href="${homeHref(subject, y)}" aria-label="Kembali">←</a><h1 style="font-size:1.15rem" class="muted">${esc(subj.title)} · Tahun ${y} · Bab ${k + 1}</h1></div>
    <section class="chap-hero">
      <div class="chap-e">${t.emoji}</div>
      <div><h2>${esc(t.title)}</h2>
        <p class="muted" style="margin:0">⭐ ${st}/9 bintang ${st >= 9 ? "· 👑 Bab dikuasai!" : ""}</p></div>
      <div class="chap-ring">${ring((st / 9) * 100, 72, 8)}<b>${Math.round((st / 9) * 100)}%</b></div>
    </section>
    <div class="stages">
      ${STAGES.map((g, i) => {
        const s = stageStars(subject, y, t.id, g.id), locked = g.id === "bos" && !bossOpen(subject, y, t.id);
        return `<article class="stage-card ${locked ? "locked" : ""} st-${g.id}" style="--i:${i}">
          <div class="stage-e">${g.id === "bos" ? subj.boss : g.emoji}</div>
          <h3>${g.title}${g.id === "bos" ? `: ${esc(subj.bossName)}` : ""}</h3>
          <p class="small muted">${g.id === "masa" ? `${g.desc} (${timeLimit(y)} saat)` : g.desc}</p>
          ${stars3(s)}
          ${locked ? `<button class="btn ghost block" disabled>🔒 Dapatkan 1⭐ dalam Latihan dahulu</button>` : `<a class="btn block ${g.id === "bos" ? "grape" : g.id === "masa" ? "sun" : ""}" href="#/sekolah/main/${subject}/${y}/${t.id}/${g.id}">${s ? "Main lagi" : "Mula"} ${g.id === "bos" ? "⚔️" : "▶"}</a>`}
        </article>`;
      }).join("")}
    </div>
    <div class="chap-more">
      <a class="btn ghost" href="#/sekolah/cetak/${subject}/${y}/${t.id}">🖨️ Cetak lembaran latihan</a>
      <div class="row">${prev ? `<a class="btn sm ghost" href="${chapterHref(subject, y, prev.id)}">← ${esc(prev.title)}</a>` : ""}${next ? `<a class="btn sm ghost" href="${chapterHref(subject, y, next.id)}">${esc(next.title)} →</a>` : ""}</div>
    </div>
  </div>`;
}

// ------------------------------------------------------------ play a chapter stage
export function schoolPlay(el, { subject, year, topic, stage }) {
  const subj = subjectById(subject), y = Number(year), t = subj && yearOk(y) ? topicById(subject, y, topic) : null;
  const st = STAGES.find((x) => x.id === stage);
  if (!t || !st || !store.isPublished(familyId(subject, y))) return notFound(el, "#/sekolah");
  if (stage === "bos" && !bossOpen(subject, y, t.id)) { location.hash = chapterHref(subject, y, t.id).slice(1); return; }
  const view = document.createElement("div");
  view.className = "wrap page";
  view.style.maxWidth = "760px";
  el.replaceChildren(view);
  const id = activityId(subject, y, t.id, stage);
  let ctl = null;
  const start = () => {
    ctl?.stop?.();
    view.innerHTML = `<div data-play></div>`;
    ctl = playRound(view.querySelector("[data-play]"), {
      questions: roundFor(t), mode: stage, subject: subj, timeSec: timeLimit(y),
      onExit: () => (location.hash = chapterHref(subject, y, t.id).slice(1)),
      onFinish: (r) => finishRound(view, r, {
        id, subj, title: `${t.title} · ${st.title}`, mode: stage,
        actions: (stars) => [
          { label: "🔁 Main lagi", cls: "sun", onClick: start },
          ...(stage === "latihan" && stars > 0 ? [{ label: `${subj.boss} Lawan Bos`, cls: "grape", onClick: () => (location.hash = `/sekolah/main/${subject}/${y}/${t.id}/bos`) }] : []),
          { label: "📋 Bab", cls: "ghost", onClick: () => (location.hash = chapterHref(subject, y, t.id).slice(1)) },
        ],
      }),
    });
  };
  start();
  return () => ctl?.stop?.();
}

/** Save a finished round, file mistakes for review, show the result screen. */
async function finishRound(view, r, { id, subj, title, mode, actions, onSaved }) {
  view.innerHTML = `<div class="card center loading-card">${mascot("think", 80, "bob")}<p>Menyimpan keputusan…</p></div>`;
  const child = store.activeChild;
  const res = await store.record(id, "sekolah", { score: r.score, total: r.total, answers: r.answers, durationMs: r.durationMs });
  try { await addMistakes(child.id, r.wrong); } catch (e) { console.warn(e); }
  await onSaved?.(r, res);
  if (!view.isConnected) return;
  const earned = res.saveFailed ? null : res.stars;
  const shownStars = earned ?? (r.score / r.total >= 0.9 ? 3 : r.score / r.total >= 0.7 ? 2 : r.score / r.total >= 0.5 ? 1 : 0);
  const extra = [];
  if (mode === "bos") extra.push(r.bossDefeated ? `<div class="res-banner win">🏆 Kamu kalahkan ${esc(subj.bossName)}! ${subj.boss}💥</div>` : r.lostAllLives ? `<div class="res-banner lose">💔 Nyawa habis — ${esc(subj.bossName)} masih kuat. Cuba lagi!</div>` : `<div class="res-banner">${subj.boss} ${esc(subj.bossName)} terselamat… jawab 7 betul untuk menang!</div>`);
  if (mode === "masa") extra.push(r.timedOut ? `<div class="res-banner lose">⏰ Masa tamat!</div>` : `<div class="res-banner win">⚡ Siap dengan baki ${r.timeLeft} saat!</div>`);
  if (r.maxCombo >= 3) extra.push(`<p class="res-combo">🔥 Combo terbaik: <b>${r.maxCombo}</b></p>`);
  if (r.wrong.length) {
    extra.push(`<details class="res-review" ${r.wrong.length <= 3 ? "open" : ""}><summary>Semak ${r.wrong.length} soalan yang salah</summary><ul>${r.wrong.slice(0, 8).map((q) =>
      `<li><span>${esc(plain(q.prompt).slice(0, 90))}</span><b>✔ ${esc(q.type === "match" ? "padankan semua pasangan" : q.answer)}</b></li>`).join("")}</ul>
      <p class="small muted">🔁 Soalan ini disimpan dalam <a href="#/sekolah/ulang-kaji">Ulang Kaji Pintar</a>.</p></details>`);
  }
  showResult(view, { score: r.score, total: r.total, earned: shownStars, newSticker: res.newSticker, saveFailed: res.saveFailed, xpGained: res.xpGained, totalXp: res.totalXp,
    message: `<p class="res-title">${esc(title)}</p>${extra.join("")}`, actions: actions(shownStars) });
  if (r.bossDefeated) confetti(70, [subj.boss, "💥", "⭐", "🏆", "✨"]);
}

// ------------------------------------------------------------ Ulang Kaji Pintar
export async function schoolReview(el) {
  const c = store.activeChild;
  const items = await loadReview(c.id);
  const due = dueItems(items);
  const grade = gradeOf(c) || 1;
  if (!items.length) {
    el.innerHTML = `<div class="wrap page" style="max-width:640px"><div class="pagehead"><a class="back" href="#/sekolah" aria-label="Kembali">←</a><h1>Ulang Kaji Pintar</h1></div>
      <div class="card pad-lg center">${mascot("happy", 110, "bob")}<h2>Tiada soalan untuk diulang 🎉</h2><p class="muted">Bila ${esc(c.name)} tersalah jawab dalam Sekolah, soalan itu disimpan di sini dan diulang pada hari 1, 3, 7 dan 14 — sehingga betul-betul ingat.</p><a class="btn" href="#/sekolah">Ke Sekolah 🎒</a></div></div>`;
    return;
  }
  const view = document.createElement("div");
  view.className = "wrap page";
  view.style.maxWidth = "760px";
  el.replaceChildren(view);
  let ctl = null;
  view.innerHTML = `<div class="pagehead"><a class="back" href="#/sekolah" aria-label="Kembali">←</a><h1>Ulang Kaji Pintar</h1></div>
    <div class="card pad-lg center">${mascot("think", 100, "bob")}
      <h2>${due.length ? `${due.length} soalan perlu diulang hari ini` : "Semua soalan sudah diulang hari ini 👍"}</h2>
      <p class="muted">${items.length} soalan dalam kotak ulang kaji. Jawab betul untuk naik kotak 📦1 → 📦5 dan kuasai soalan itu!</p>
      <div class="leitner">${[1, 2, 3, 4, 5].map((b) => `<div><b>${items.filter((x) => (x.box || 1) === b).length}</b><small>📦${b}</small></div>`).join("")}</div>
      <button class="btn big" data-start>Mula Ulang Kaji ▶</button></div>`;
  view.querySelector("[data-start]").onclick = () => {
    const fresh = () => { const s = pick(SUBJECTS); return roundFor(pick(topics(s.id, grade)), 1)[0]; };
    const qs = buildReviewRound(items, fresh);
    view.innerHTML = `<div data-play></div>`;
    ctl = playRound(view.querySelector("[data-play]"), {
      questions: qs, mode: "latihan", subject: { accent: "#6d3fd9", lang: "ms" },
      onExit: () => (location.hash = "/sekolah"),
      onFinish: (r) => finishRound(view, r, {
        id: REVIEW_ID, subj: { boss: "🔁", bossName: "" }, title: "Ulang Kaji Pintar", mode: "latihan",
        onSaved: async () => {
          const results = qs.map((q, k) => ({ id: q.reviewId, ok: r.answers[k] && r.answers[k].a === r.answers[k].c })).filter((x) => x.id);
          const mastered = await applyReview(c.id, results).catch(() => 0);
          if (mastered) toast(`👑 ${mastered} soalan dikuasai & dikeluarkan dari kotak!`, 3200);
        },
        actions: () => [{ label: "🎒 Ke Sekolah", cls: "", onClick: () => (location.hash = "/sekolah") }, { label: "🔁 Ulang lagi", cls: "ghost", onClick: () => schoolReview(el) }],
      }),
    });
  };
  return () => ctl?.stop?.();
}

// ------------------------------------------------------------ Cabaran Harian
export function schoolDaily(el) {
  const c = store.activeChild, grade = gradeOf(c) || 1, today = todayKey();
  const view = document.createElement("div");
  view.className = "wrap page";
  view.style.maxWidth = "760px";
  el.replaceChildren(view);
  const best = store.starsOf(`${DAILY_FAMILY}:${today}`);
  let ctl = null;
  view.innerHTML = `<div class="pagehead"><a class="back" href="#/sekolah" aria-label="Kembali">←</a><h1>Cabaran Harian</h1></div>
    <div class="card pad-lg center daily-intro">${mascot("cheer", 110, "bob")}
      <h2>🌟 ${new Date().toLocaleDateString("ms-MY", { weekday: "long", day: "numeric", month: "long" })}</h2>
      <p class="muted">10 soalan campuran Matematik, Bahasa Melayu & English untuk ${gradeLabel(grade)}. Cabaran baharu setiap hari!</p>
      ${best ? `<p>Skor terbaik hari ini: ${stars3(best)}</p>` : ""}
      <button class="btn big sun" data-start>${best ? "Cuba lagi" : "Terima Cabaran"} ⚡</button></div>`;
  view.querySelector("[data-start]").onclick = () => {
    const pool = SUBJECTS.flatMap((s) => topics(s.id, grade));
    const qs = makeSet(() => { const t = pick(pool); return { ...t.gen(), lang: t.lang, topic: `${t.subject}-t${t.year}:${t.id}` }; }, 10);
    view.innerHTML = `<div data-play></div>`;
    ctl = playRound(view.querySelector("[data-play]"), {
      questions: qs, mode: "masa", timeSec: timeLimit(grade) + 30, subject: { accent: "#b85600", lang: "ms" },
      onExit: () => (location.hash = "/sekolah"),
      onFinish: (r) => finishRound(view, r, { id: `${DAILY_FAMILY}:${today}`, subj: { boss: "🌟", bossName: "" }, title: "Cabaran Harian", mode: "masa",
        actions: () => [{ label: "🎒 Ke Sekolah", cls: "", onClick: () => (location.hash = "/sekolah") }, { label: "🔁 Cuba lagi", cls: "ghost", onClick: () => schoolDaily(el) }] }),
    });
  };
  return () => ctl?.stop?.();
}

// ------------------------------------------------------------ printable practice sheet
export function schoolPrint(el, { subject, year, topic }) {
  const subj = subjectById(subject), y = Number(year), t = subj && yearOk(y) ? topicById(subject, y, topic) : null;
  if (!t) return notFound(el, "#/sekolah");
  const L = "ABCD";
  const draw = () => {
    const qs = makeSet(t.gen, 12);
    const body = qs.map((q, i) => {
      let a = "";
      if (["mcq", "fill", "tf"].includes(q.type)) a = `<div class="p-opts">${q.choices.map((c, k) => `<span>${L[k]}. ${esc(c)}</span>`).join("")}</div>`;
      else if (q.type === "input") a = `<div class="p-line">Jawapan: ________________ ${esc(q.unit || "")}</div>`;
      else if (q.type === "order") a = `<div class="p-tiles">${q.tiles.map((x) => `<span>${esc(x)}</span>`).join("")}</div><div class="p-line">________________________________________</div>`;
      else if (q.type === "match") { const right = [...q.pairs.map((p) => p[1])].sort(); a = `<div class="p-match"><div>${q.pairs.map((p, k) => `<span>${k + 1}. ${esc(p[0])} •</span>`).join("")}</div><div>${right.map((r, k) => `<span>• ${L[k] || k + 1}. ${esc(r)}</span>`).join("")}</div></div>`; }
      return `<li class="p-q"><div class="p-prompt">${q.type === "fill" ? q.prompt.replace("___", "________") : q.prompt}</div>${q.visual ? `<div class="p-vis">${q.visual}</div>` : ""}${a}</li>`;
    }).join("");
    const key = qs.map((q, i) => {
      if (["mcq", "fill", "tf"].includes(q.type)) return `${i + 1}) ${L[q.choices.indexOf(q.answer)]} (${esc(q.answer)})`;
      if (q.type === "match") { const right = [...q.pairs.map((p) => p[1])].sort(); return `${i + 1}) ${q.pairs.map((p, k) => `${k + 1}-${L[right.indexOf(p[1])] || ""}`).join(", ")}`; }
      return `${i + 1}) ${esc(correctOf(q))}`;
    }).join(" &nbsp;·&nbsp; ");
    el.querySelector("[data-sheet]").innerHTML = `<h2>${esc(t.title)}</h2>
      <div class="meta"><span>Nama:</span><span style="max-width:170px">Tarikh:</span><span style="max-width:140px">Markah:&nbsp; &nbsp; /${qs.length}</span></div>
      <div class="instr">${esc(subj.title)} · Tahun ${y} — Jawab semua soalan.</div>
      <ol class="p-list">${body}</ol>
      <div class="foot">Playora · Lembaran latihan percuma untuk kegunaan peribadi</div>
      <div class="print-only" style="page-break-before:always"><h3>Skema jawapan — ${esc(t.title)}</h3><p>${key}</p></div>
      <details class="no-print" style="margin-top:14px"><summary><b>Lihat skema jawapan</b></summary><p>${key}</p></details>`;
  };
  el.innerHTML = `<div class="wrap page">
    <div class="pagehead"><a class="back" href="${chapterHref(subject, y, t.id)}" aria-label="Kembali">←</a><h1 style="font-size:1.25rem">${t.emoji} Lembaran: ${esc(t.title)}</h1></div>
    <div class="ws-tools no-print"><button class="btn sm sun" data-new>🔄 Jana Baru</button><button class="btn sm" data-print>🖨️ Cetak / PDF</button></div>
    <div class="sheet school-sheet" data-sheet></div></div>`;
  el.querySelector("[data-new]").onclick = draw;
  draw();
}
