// Activity families derived from the app's own catalogue (used by the SQL seed generator and the E2E mock).
export async function buildCatalog() {
  globalThis.window ||= globalThis;
  globalThis.localStorage ||= { getItem: () => null, setItem() {}, removeItem() {} };
  const { GAMES } = await import("../js/data/games.js");
  const { MAPS } = await import("../js/data/maps.js");
  const { BOOKS } = await import("../js/data/books.js");
  const { PENSEL } = await import("../js/pages/pensel.js");
  const { PICTURES } = await import("../js/data/pictures.js");

  const rows = [];
  for (const g of GAMES) {
    rows.push({ id: `game:${g.id}`, category: "games", title: g.title, kind: g.type === "memory" ? "stars" : "quiz", qc: g.type === "memory" ? null : 10, items: g.levels.map((_, i) => String(i)) });
  }
  for (const m of MAPS) {
    const kinds = new Set(m.stations.map((s) => s.type));
    if (kinds.size !== 1) throw new Error(`map ${m.id} mixes station types; split it into separate families`);
    const hidden = kinds.has("hidden");
    rows.push({ id: `peta:${m.id}`, category: "peta", title: m.title, kind: hidden ? "stars" : "quiz", qc: hidden ? null : 8, items: m.stations.map((_, i) => String(i)) });
  }
  for (const b of BOOKS) rows.push({ id: `buku:${b.id}`, category: "buku", title: b.title, kind: "quiz", qc: b.quiz.length, items: null });
  for (const p of PENSEL) {
    let items = p.items || null, pattern = null;
    if (p.id === "lukis-cuaca") pattern = "^[0-9]{4}-[0-9]{2}-[0-9]{2}$";
    if (p.id === "colour-object") items = PICTURES.map((x) => x.id);
    if (p.id === "bentuk-warna") items = ["latihan"];
    rows.push({ id: `pensel:${p.id}`, category: "pensel", title: p.title, kind: "stars", qc: null, items, pattern });
  }
  rows.push({ id: "rutin", category: "rutin", title: "Rutin Ceria Anak", kind: "once", qc: null, items: null, pattern: "^[0-9]{4}-[0-9]{2}-[0-9]{2}:(pagi|malam)$" });

  return rows.map((r, i) => ({ id: r.id, category: r.category, title: r.title, kind: r.kind, question_count: r.qc ?? null, items: r.items ?? null, item_pattern: r.pattern ?? null, sort_order: i }));
}

/** Sekolah (Darjah 1–6) families — generated into migration 0007 and added to the E2E mock catalogue. */
export async function buildSchoolCatalog(start = 1000) {
  globalThis.window ||= globalThis;
  globalThis.localStorage ||= { getItem: () => null, setItem() {}, removeItem() {} };
  const { catalogRows } = await import("../js/school/curriculum.js");
  return catalogRows().map((r, i) => ({ id: r.id, category: r.category, title: r.title, kind: r.kind, question_count: r.qc, items: r.items ?? null, item_pattern: r.pattern ?? null, sort_order: start + i }));
}
