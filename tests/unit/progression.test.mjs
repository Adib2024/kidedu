import { test } from "node:test";
import assert from "node:assert/strict";
import { installEnv } from "./_env.mjs";
installEnv();
const P = await import("../../js/progression.js");
const { GAMES } = await import("../../js/data/games.js");
const { MAPS } = await import("../../js/data/maps.js");
const { BOOKS } = await import("../../js/data/books.js");
const catalog = { games: GAMES, maps: MAPS, books: BOOKS };

test("XP rules match the server: participation + only NEW stars", () => {
  assert.equal(P.xpFor(0, 3, 0), 5 + 30);
  assert.equal(P.xpFor(3, 3, 0), 5, "replaying a 3-star level gives participation XP only");
  assert.equal(P.xpFor(1, 2, 0), 5 + 10);
  assert.equal(P.xpFor(2, 0, 0), 5, "a worse result never removes XP");
  assert.equal(P.xpFor(0, 3, 30), 30, "no participation XP after 30 attempts in a day");
});

test("stars thresholds (same as SQL stars_for)", () => {
  assert.deepEqual([10, 9, 8, 7, 6, 5, 4, 0].map((s) => P.starsFor(s, 10)), [3, 3, 2, 2, 1, 1, 0, 0]);
  assert.equal(P.starsFor(0, 0), 0);
});

test("levels: 0/100/300/600 XP boundaries", () => {
  assert.equal(P.levelInfo(0).level, 1);
  assert.equal(P.levelInfo(99).level, 1);
  assert.equal(P.levelInfo(100).level, 2);
  assert.equal(P.levelInfo(299).level, 2);
  assert.equal(P.levelInfo(300).level, 3);
  assert.equal(P.levelInfo(600).level, 4);
  assert.equal(P.levelInfo(150).pct, 25);
  assert.ok(P.levelTitle(99));
});

test("Malaysia-time day & week boundaries", () => {
  // 2026-10-11 23:30 MYT == 15:30 UTC (still Sunday); 16:30 UTC == Monday 00:30 MYT
  assert.equal(P.mytDay("2026-10-11T15:30:00Z"), "2026-10-11");
  assert.equal(P.mytDay("2026-10-11T16:30:00Z"), "2026-10-12");
  assert.equal(P.mytWeekStart(new Date("2026-10-11T15:30:00Z")), "2026-10-05");
  assert.equal(P.mytWeekStart(new Date("2026-10-11T16:30:00Z")), "2026-10-12");
});

test("daily missions count only today's attempts", () => {
  const now = new Date("2026-10-10T06:00:00Z");
  const at = (h, category) => ({ category, created_at: new Date(now.getTime() + h * 3600e3).toISOString() });
  const ms = P.dailyMissions([at(-1, "games"), at(-2, "peta"), at(-30, "buku"), at(-1, "pensel")], now);
  assert.deepEqual(ms.map((m) => [m.id, m.done, m.complete]), [["main", 2, true], ["baca", 0, false], ["lukis", 1, true]]);
});

test("weekly goal progress", () => {
  const now = new Date("2026-10-10T06:00:00Z"); // Saturday
  const a = (iso) => ({ created_at: iso });
  const w = P.weeklyProgress([a("2026-10-05T01:00:00Z"), a("2026-10-09T01:00:00Z"), a("2026-10-03T01:00:00Z")], 2, now);
  assert.deepEqual([w.count, w.reached, w.pct], [2, true, 100]);
});

test("weak spots need enough evidence and a real error rate", () => {
  const now = new Date();
  const mk = (right, n = 10) => ({ activity_id: "game:bijak-sifir:2", created_at: now.toISOString(), answers: Array.from({ length: n }, (_, i) => ({ q: "3 × " + i, a: i < right ? "x" : "y", c: "x" })) });
  assert.equal(P.weakSpots([mk(9)]).length, 0, "10% wrong is not a weak spot");
  const w = P.weakSpots([mk(4)]);
  assert.equal(w[0].family, "game:bijak-sifir");
  assert.equal(w[0].wrong, 6);
  assert.equal(P.weakSpots([mk(0, 3)]).length, 0, "too few answers to judge");
  assert.equal(P.familyOf("rutin:2026-10-10:pagi"), "rutin");
});

test("recommendations are explainable and based on data", () => {
  const fresh = P.recommendations({ child: { age: 4 }, progress: {}, attempts: [], catalog });
  assert.ok(fresh.length > 0 && fresh.every((r) => r.reason && r.href.startsWith("#/")));
  assert.ok(fresh.some((r) => /umur 4/.test(r.reason)));
  const progress = { "game:bijak-sifir:0": { stars: 3, category: "games" }, "game:hero-warna:1": { stars: 1, category: "games" } };
  const recs = P.recommendations({ child: { age: 7 }, progress, attempts: [], catalog, max: 10 });
  assert.ok(recs.some((r) => r.href === "#/games/bijak-sifir?lv=1" && /Sifir 2/.test(r.reason)), "next level");
  assert.ok(recs.some((r) => r.href === "#/games/hero-warna?lv=1" && /1\/3/.test(r.reason)), "retry low score");
  const hidden = P.recommendations({ child: { age: 7 }, progress, attempts: [], catalog, isPublished: (f) => f !== "game:bijak-sifir", max: 10 });
  assert.ok(!hidden.some((r) => r.href.includes("bijak-sifir")), "unpublished activities are never suggested");
});
