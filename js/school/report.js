// Laporan Sekolah for parents: progress per subject and chapter, accuracy, study time this week, weak
// chapters with next steps, and the Ulang Kaji Pintar queue. Pure data (schoolReport) + HTML (schoolReportHtml).
import { esc } from "../util.js";
import { SUBJECTS, YEARS, STAGES, topics, activityId, parseActivity, gradeOf, gradeLabel } from "./curriculum.js";

const DAY = 864e5;

/**
 * child, starsOf(activityId) → best stars, attempts (newest first), reviewItems from Ulang Kaji Pintar.
 * Returns null when the child has no school year and no school attempts yet.
 */
export function schoolReport({ child, starsOf, attempts = [], reviewItems = [], now = Date.now() }) {
  const grade = gradeOf(child);
  const sek = attempts.filter((a) => a.category === "sekolah");
  const played = new Set(sek.map((a) => parseActivity(a.activity_id)?.year).filter(Boolean));
  const years = YEARS.filter((y) => y === grade || played.has(y));
  if (!years.length) return null;

  // accuracy per chapter (topic family) from the answer logs
  const acc = new Map();
  for (const a of sek) {
    const p = parseActivity(a.activity_id);
    if (!p || !Array.isArray(a.answers)) continue;
    const key = `${p.subject}/${p.year}/${p.topic}`;
    const e = acc.get(key) || { answered: 0, correct: 0, recentAnswered: 0, recentCorrect: 0, last: 0 };
    const t = new Date(a.created_at).getTime();
    for (const q of a.answers) {
      e.answered++; if (q.a === q.c) e.correct++;
      if (now - t <= 14 * DAY) { e.recentAnswered++; if (q.a === q.c) e.recentCorrect++; }
    }
    e.last = Math.max(e.last, t);
    acc.set(key, e);
  }

  const perYear = years.map((y) => ({
    year: y,
    subjects: SUBJECTS.map((s) => {
      const ts = topics(s.id, y).map((t) => {
        const st = Object.fromEntries(STAGES.map((g) => [g.id, starsOf(activityId(s.id, y, t.id, g.id)) || 0]));
        const stars = STAGES.reduce((n, g) => n + st[g.id], 0);
        const a = acc.get(`${s.id}/${y}/${t.id}`);
        return { id: t.id, title: t.title, emoji: t.emoji, stars, stages: st, answered: a?.answered || 0, correct: a?.correct || 0 };
      });
      const stars = ts.reduce((n, t) => n + t.stars, 0), max = ts.length * 9;
      const rec = ts.reduce((o, t) => { const a = acc.get(`${s.id}/${y}/${t.id}`); if (a) { o.answered += a.recentAnswered; o.correct += a.recentCorrect; } return o; }, { answered: 0, correct: 0 });
      return { id: s.id, title: s.title, emoji: s.emoji, accent: s.accent, color: s.color, stars, max, pct: Math.round((stars / max) * 100),
        started: ts.filter((t) => t.stars > 0).length, total: ts.length, mastered: ts.filter((t) => t.stars >= 9).length, topics: ts,
        accuracy: rec.answered ? Math.round((rec.correct / rec.answered) * 100) : null };
    }),
  }));

  // chapters that need help: recent answers mostly wrong (≥ 5 answers, < 60 % correct)
  const weak = [];
  for (const [key, e] of acc) {
    if (now - e.last > 30 * DAY || e.answered < 5) continue;
    const pct = Math.round((e.correct / e.answered) * 100);
    if (pct >= 60) continue;
    const [s, y, t] = key.split("/");
    const topic = topics(s, Number(y)).find((x) => x.id === t);
    if (!topic) continue;
    const subj = SUBJECTS.find((x) => x.id === s);
    weak.push({ subject: subj.title, subjectId: s, emoji: topic.emoji, year: Number(y), topic: t, title: topic.title, pct,
      href: `#/sekolah/bab/${s}/${y}/${t}`, print: `#/sekolah/cetak/${s}/${y}/${t}` });
  }
  weak.sort((a, b) => a.pct - b.pct);

  const week = sek.filter((a) => now - new Date(a.created_at).getTime() <= 7 * DAY);
  const minutes = Math.round(week.reduce((n, a) => n + (Number(a.duration_ms) > 0 ? Math.min(Number(a.duration_ms), 30 * 60e3) : 0), 0) / 60e3);
  const days = new Set(week.map((a) => new Date(a.created_at).toDateString())).size;
  let answered = 0, correct = 0;
  for (const e of acc.values()) { answered += e.recentAnswered; correct += e.recentCorrect; }

  return {
    grade, gradeLabel: gradeLabel(grade), years: perYear, weak: weak.slice(0, 5),
    week: { rounds: week.length, minutes, days },
    accuracy: answered ? Math.round((correct / answered) * 100) : null,
    review: { total: reviewItems.length, due: reviewItems.filter((x) => x.due <= now).length },
  };
}

const tone = (stars) => (stars >= 9 ? "s4" : stars >= 6 ? "s3" : stars >= 3 ? "s2" : stars > 0 ? "s1" : "s0");

export function schoolReportHtml(r, childName) {
  if (!r) return `<div class="sr-empty small muted">🎒 Sekolah: tetapkan Darjah anak dalam <a href="#/anak">Profil Anak</a> untuk melihat laporan ikut topik KSSR.</div>`;
  const kpi = (v, l) => `<div class="panel center"><div class="kpi">${v}</div><div class="small muted">${l}</div></div>`;
  const advice = r.weak.length
    ? `Fokus minggu ini: <b>${esc(r.weak[0].subject)} — ${esc(r.weak[0].title)}</b> (${r.weak[0].pct}% betul). Cuba bab Latihan bersama-sama, atau cetak lembaran untuk latihan di atas kertas.`
    : r.week.rounds ? `${esc(childName)} sedang maju dengan baik. Galakkan mencuba <b>Lawan Bos</b> untuk bab yang sudah 2–3⭐.` : `Belum ada latihan Sekolah minggu ini. 10 minit sehari sudah memadai — mulakan dengan bab pertama ${esc(r.gradeLabel)}.`;
  return `<section class="sr" aria-label="Laporan Sekolah">
    <div class="row between"><h3 style="margin:0">🎒 Sekolah · ${esc(r.gradeLabel)}</h3><a class="small no-print" href="#/sekolah">Buka Sekolah →</a></div>
    <div class="grid sr-kpis">
      ${kpi(`${r.week.minutes}<small> min</small>`, `Masa belajar (7 hari) · ${r.week.days} hari aktif`)}
      ${kpi(r.week.rounds, "Pusingan dimainkan (7 hari)")}
      ${kpi(r.accuracy == null ? "—" : `${r.accuracy}%`, "Jawapan betul (14 hari)")}
      ${kpi(r.review.due, `Soalan perlu diulang${r.review.total ? ` · ${r.review.total} disimpan` : ""}`)}
    </div>
    <p class="sr-advice">💡 ${advice}</p>
    ${r.years.map((y) => `<div class="sr-year">
      ${r.years.length > 1 ? `<h4>Tahun ${y.year}</h4>` : ""}
      ${y.subjects.map((s) => `<div class="sr-subj" style="--ta:${s.accent};--tc:${s.color}">
        <div class="row between small"><b>${s.emoji} ${esc(s.title)}</b><span>${s.started}/${s.total} bab · ⭐ ${s.stars}/${s.max}${s.mastered ? ` · 👑 ${s.mastered}` : ""}${s.accuracy != null ? ` · ${s.accuracy}% betul` : ""}</span></div>
        <div class="bar"><i style="width:${s.pct}%"></i></div>
        <ul class="sr-topics" aria-label="Bab ${esc(s.title)}">${s.topics.map((t) => `<li class="${tone(t.stars)}" title="${esc(t.title)}: ${t.stars}/9 ⭐${t.answered ? ` · ${Math.round((t.correct / t.answered) * 100)}% betul` : ""}"><span aria-hidden="true">${t.emoji}</span><span class="sr-tt">${esc(t.title)}</span><b>${t.stars >= 9 ? "👑" : `${t.stars}/9`}</b></li>`).join("")}</ul>
      </div>`).join("")}
    </div>`).join("")}
    <div class="sr-legend small muted" aria-hidden="true"><span class="s0">belum</span><span class="s1">1–2⭐</span><span class="s2">3–5⭐</span><span class="s3">6–8⭐</span><span class="s4">👑 dikuasai</span></div>
    ${r.weak.length ? `<div class="alert info small"><b>Bab yang perlu bantuan</b>
      <ul class="sr-weak">${r.weak.map((w) => `<li><span>${w.emoji} ${esc(w.subject)} T${w.year}: <b>${esc(w.title)}</b> — ${w.pct}% betul</span>
        <span class="no-print"><a href="${w.href}">Main bab</a> · <a href="${w.print}">Cetak lembaran</a></span></li>`).join("")}</ul></div>` : ""}
  </section>`;
}
