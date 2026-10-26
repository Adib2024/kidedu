// Gamification & learning insights — pure functions over real progress/attempt records.
// The same reward rules run on the server (public.record_attempt); here they power Demo mode
// and the dashboards. Nothing here invents data: every number comes from stored attempts.

export const XP_PER_PARTICIPATION = 5;   // first 30 attempts per child per day
export const XP_PER_NEW_STAR = 10;       // only for stars above the previous best (no farming)
export const DAILY_PARTICIPATION_CAP = 30;

export function starsFor(score, total) {
  if (!total) return 0;
  const r = score / total;
  return r >= 0.9 ? 3 : r >= 0.7 ? 2 : r >= 0.5 ? 1 : 0;
}

/** XP for one attempt (mirrors the SQL function). */
export function xpFor(prevBestStars, stars, attemptsToday) {
  return (attemptsToday < DAILY_PARTICIPATION_CAP ? XP_PER_PARTICIPATION : 0) + XP_PER_NEW_STAR * Math.max(0, stars - (prevBestStars || 0));
}

/** Level n starts at 50·n·(n−1) XP: 0, 100, 300, 600, 1000, … */
export function levelInfo(xp = 0) {
  let level = 1;
  while (50 * (level + 1) * level <= xp) level++;
  const start = 50 * level * (level - 1);
  const next = 50 * (level + 1) * level;
  return { level, xp, start, next, pct: Math.round(((xp - start) / (next - start)) * 100) };
}

export const LEVEL_TITLES = ["Tunas Ceria", "Penjelajah Kecil", "Bintang Kelas", "Hero Ilmu", "Juara Bijak", "Pakar Playora"];
export const levelTitle = (level) => LEVEL_TITLES[Math.min(LEVEL_TITLES.length - 1, level - 1)];

// ---------------------------------------------------------------- time helpers (Malaysia time)
const MYT_OFFSET = 8 * 3600e3;
export const mytDay = (d) => new Date(new Date(d).getTime() + MYT_OFFSET).toISOString().slice(0, 10);
/** Monday (YYYY-MM-DD, Malaysia time) of the week containing `d`. */
export function mytWeekStart(d = new Date()) {
  const local = new Date(new Date(d).getTime() + MYT_OFFSET);
  const dow = (local.getUTCDay() + 6) % 7; // Mon=0
  local.setUTCDate(local.getUTCDate() - dow);
  return local.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------- daily missions
export const MISSIONS = [
  { id: "main", emoji: "🎮", text: "Main 2 aktiviti: Sekolah, games atau peta", need: 2, test: (a) => a.category === "games" || a.category === "peta" || a.category === "sekolah" },
  { id: "baca", emoji: "📚", text: "Baca 1 buku cerita & jawab kuiz", need: 1, test: (a) => a.category === "buku" },
  { id: "lukis", emoji: "🖍️", text: "Surih atau warnakan 1 aktiviti", need: 1, test: (a) => a.category === "pensel" },
];
/** Missions for today from today's attempts. Missing a day costs nothing. */
export function dailyMissions(attempts, now = new Date()) {
  const today = mytDay(now);
  const todays = attempts.filter((a) => mytDay(a.created_at) === today);
  return MISSIONS.map((m) => {
    const done = Math.min(m.need, todays.filter(m.test).length);
    return { ...m, done, complete: done >= m.need };
  });
}

/** Activities completed this week (Mon–Sun, Malaysia time) against the parent's goal. */
export function weeklyProgress(attempts, goal = 5, now = new Date()) {
  const start = mytWeekStart(now);
  const count = attempts.filter((a) => mytDay(a.created_at) >= start).length;
  return { count, goal, pct: Math.min(100, Math.round((count / Math.max(1, goal)) * 100)), reached: count >= goal };
}

// ---------------------------------------------------------------- streak
const shiftDay = (day, n) => new Date(Date.parse(day + "T00:00:00Z") + n * 86400e3).toISOString().slice(0, 10);
const HARI_STREAK = ["Ahd", "Isn", "Sel", "Rab", "Kha", "Jum", "Sab"];
/**
 * Consecutive days (Malaysia time) with at least one activity. A streak stays alive until the end
 * of today, so "yesterday + not yet today" still counts. Returns the last 7 days for a mini calendar.
 */
export function streak(attempts, now = new Date()) {
  const days = new Set(attempts.map((a) => mytDay(a.created_at)));
  const today = mytDay(now);
  let d = days.has(today) ? today : shiftDay(today, -1);
  let current = 0;
  while (days.has(d)) { current++; d = shiftDay(d, -1); }
  let best = 0;
  for (const day of days) {
    if (days.has(shiftDay(day, -1))) continue; // count only from the start of each run
    let n = 0, x = day;
    while (days.has(x)) { n++; x = shiftDay(x, 1); }
    best = Math.max(best, n);
  }
  const week = Array.from({ length: 7 }, (_, i) => {
    const day = shiftDay(today, i - 6);
    return { day, label: HARI_STREAK[new Date(day + "T00:00:00Z").getUTCDay()], active: days.has(day), today: day === today };
  });
  return { current, best, playedToday: days.has(today), week };
}

// ---------------------------------------------------------------- insights for parents
/** Questions answered wrongly, grouped by activity family (needs answer logs). */
export function weakSpots(attempts, { days = 14, now = new Date() } = {}) {
  const since = now.getTime() - days * 864e5;
  const by = new Map();
  for (const a of attempts) {
    if (!Array.isArray(a.answers) || new Date(a.created_at).getTime() < since) continue;
    const fam = familyOf(a.activity_id);
    const e = by.get(fam) || { family: fam, wrong: 0, answered: 0, examples: [] };
    for (const q of a.answers) {
      e.answered++;
      if (q.a !== q.c) {
        e.wrong++;
        if (e.examples.length < 3 && q.q && !e.examples.includes(q.q)) e.examples.push(q.q);
      }
    }
    by.set(fam, e);
  }
  return [...by.values()].filter((e) => e.answered >= 5 && e.wrong / e.answered >= 0.3).sort((x, y) => y.wrong / y.answered - x.wrong / x.answered);
}

/** "game:bijak-sifir:3" → "game:bijak-sifir"; "rutin:2026-10-10:pagi" → "rutin". */
export function familyOf(activityId) {
  const p = String(activityId).split(":");
  if (p[0] === "rutin") return "rutin";
  // school chapters are grouped per topic (all three stages): sek:mat-t3:pecahan-setara
  if (p[0] === "sek" && p.length >= 3 && /-(latihan|masa|bos)$/.test(p[2])) return `sek:${p[1]}:${p[2].replace(/-(latihan|masa|bos)$/, "")}`;
  return p.slice(0, 2).join(":");
}

/**
 * Rule-based next-step suggestions. Each has a human-readable reason built from real data.
 * catalog: { games: [{id,title,emoji,levels}], maps: [...], books: [...] }, isPublished(familyId)
 */
export function recommendations({ child, progress = {}, attempts = [], catalog, isPublished = () => true, max = 4 }) {
  const out = [];
  const seen = new Set();
  const push = (r) => { if (!seen.has(r.href) && out.length < max) { seen.add(r.href); out.push(r); } };
  const stars = (id) => progress[id]?.stars || 0;

  // 0. School chapters (Tahun 1–6): weak topics first, then the next chapter in each subject
  if (catalog.school) {
    for (const w of weakSpots(attempts).filter((x) => x.family.startsWith("sek:")).slice(0, 2)) {
      const t = catalog.school.lookup(w.family);
      if (t) push({ ...t, title: `Ulang kaji: ${t.title}`, reason: `${w.wrong} daripada ${w.answered} jawapan salah dalam 14 hari lepas` });
    }
    for (const r of catalog.school.upNext || []) push(r);
  }
  // 1. Practise where the child is struggling (from answer logs)
  for (const w of weakSpots(attempts).slice(0, 2)) {
    const [kind, id] = w.family.split(":");
    const g = kind === "game" && catalog.games.find((x) => x.id === id);
    if (g && isPublished(w.family)) {
      push({ emoji: g.emoji, title: `Ulang kaji: ${g.title}`, href: `#/games/${id}`, reason: `${w.wrong} daripada ${w.answered} jawapan salah dalam 14 hari lepas` });
    }
  }
  // 2. Continue the next unlocked level of a game already started
  for (const g of catalog.games) {
    if (!isPublished(`game:${g.id}`)) continue;
    const best = g.levels.map((_, k) => stars(`game:${g.id}:${k}`));
    const lastDone = best.reduce((m, s, k) => (s > 0 ? k : m), -1);
    if (lastDone >= 0 && lastDone < g.levels.length - 1) {
      push({ emoji: g.emoji, title: `${g.title}: ${g.levels[lastDone + 1].name}`, href: `#/games/${g.id}?lv=${lastDone + 1}`, reason: `Tahap seterusnya — "${g.levels[lastDone].name}" sudah lulus` });
    }
  }
  // 3. Retry low scores
  for (const [id, row] of Object.entries(progress)) {
    if (row.stars <= 1 && row.category === "games") {
      const [, gid, lv] = id.split(":");
      const g = catalog.games.find((x) => x.id === gid);
      if (g && g.levels[lv] && isPublished(`game:${gid}`)) push({ emoji: g.emoji, title: `Cuba lagi: ${g.title} — ${g.levels[lv].name}`, href: `#/games/${gid}?lv=${lv}`, reason: `Bintang terbaik setakat ini: ${row.stars}/3` });
    }
  }
  // 4. Something new: an unread book, an untouched map
  const book = catalog.books.find((b) => isPublished(`buku:${b.id}`) && !progress[`buku:${b.id}`]);
  if (book) push({ emoji: "📚", title: book.title, href: `#/buku/${book.id}`, reason: "Buku yang belum dibaca" });
  const map = catalog.maps.find((m) => isPublished(`peta:${m.id}`) && !Object.keys(progress).some((k) => k.startsWith(`peta:${m.id}:`)));
  if (map) push({ emoji: map.emoji, title: map.title, href: `#/peta/${map.id}`, reason: "Peta yang belum diterokai" });
  // 5. Age-appropriate starters for brand-new players
  if (!attempts.length && !Object.keys(progress).length) {
    const starters = (child?.age || 6) <= 4 ? ["kenali-buah", "hero-warna", "ingat-padan"] : (child?.age || 6) >= 7 ? ["bijak-sifir", "matematik-1", "simpulan-bahasa"] : ["matematik-1", "kenali-buah", "learn-english"];
    for (const id of starters) {
      const g = catalog.games.find((x) => x.id === id);
      if (g && isPublished(`game:${id}`)) push({ emoji: g.emoji, title: g.title, href: `#/games/${id}`, reason: child?.age ? `Sesuai untuk umur ${child.age} tahun` : "Permulaan yang baik" });
    }
  }
  return out;
}
