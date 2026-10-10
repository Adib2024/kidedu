import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { installEnv } from "./_env.mjs";
const { ls } = installEnv();
const { store } = await import("../../js/store.js");

beforeEach(async () => {
  ls.quota = Infinity;
  if (store.user) await store.signOut();
  localStorage.clear();
});

test("demo mode: sign up, sign out, sign in, wrong password", async () => {
  assert.equal(store.mode, "demo");
  await store.signUp({ name: "Ibu", email: "Ibu@Test.my", password: "rahsia123" });
  assert.equal(store.user.email, "ibu@test.my");
  const users = JSON.parse(localStorage.getItem("ppl_users"));
  assert.ok(users["ibu@test.my"].pw2 && users["ibu@test.my"].salt && !users["ibu@test.my"].pw, "salted PBKDF2 hash stored");
  await store.signOut();
  await assert.rejects(store.signIn({ email: "ibu@test.my", password: "salah" }), /salah/);
  await store.signIn({ email: "ibu@test.my", password: "rahsia123" });
  assert.equal(store.user.name, "Ibu");
});

test("duplicate e-mail and short password are rejected", async () => {
  await store.signUp({ name: "A", email: "a@b.my", password: "123456" });
  await store.signOut();
  await assert.rejects(store.signUp({ name: "B", email: "a@b.my", password: "123456" }), /sudah didaftarkan/);
  await assert.rejects(store.signUp({ name: "C", email: "c@b.my", password: "123" }), /6 aksara/);
});

test("progress keeps the best result and counts plays", async () => {
  await store.signUp({ name: "P", email: "p@t.my", password: "123456" });
  await store.addChild({ name: "Adik", age: 5, avatar: "🐼" });
  await store.record("game:x:0", "games", { stars: 2, score: 7, total: 10 });
  await store.record("game:x:0", "games", { stars: 1, score: 5, total: 10 });
  const r = store.prog("game:x:0");
  assert.equal(r.stars, 2);
  assert.equal(r.best_score, 7);
  assert.equal(r.plays, 2);
  // survives a reload (re-read from storage)
  await store.init();
  assert.equal(store.prog("game:x:0").stars, 2);
});

test("storage full: progress is NOT shown as saved and the caller is told", async () => {
  await store.signUp({ name: "Q", email: "q@t.my", password: "123456" });
  await store.addChild({ name: "Adik", age: 5, avatar: "🐼" });
  const used = [...localStorage.m].reduce((n, [k, v]) => n + k.length + v.length, 0);
  ls.quota = used + 10; // no room for the next write
  const res = await store.record("game:y:0", "games", { stars: 3, score: 10, total: 10 });
  assert.equal(res.saveFailed, true);
  assert.equal(store.prog("game:y:0"), null, "memory reverted to stored state");
  assert.equal(store.totalStars(), 0);
});

test("key/value data is stored separately and removed with the child", async () => {
  await store.signUp({ name: "K", email: "k@t.my", password: "123456" });
  const c = await store.addChild({ name: "Adik", age: 5, avatar: "🐼" });
  await store.setKv(`gallery:${c.id}`, [{ id: "1", src: "data:x" }], { immediate: true });
  await store.setKv(`planner:rutin:${c.id}:2026-10-10`, { pagi: { a: true } }, { immediate: true });
  await store.setKv("planner:syukur", { "2026-10-10": ["a"] }, { immediate: true });
  assert.ok(Object.keys(localStorage).some((k) => k.endsWith(`gallery:${c.id}`)));
  await store.removeChild(c.id);
  assert.ok(!Object.keys(localStorage).some((k) => k.includes(c.id)), "child data removed");
  assert.deepEqual(await store.kv("planner:syukur", {}), { "2026-10-10": ["a"] }, "shared parent data kept");
});

test("users cannot read each other's data in demo mode", async () => {
  await store.signUp({ name: "A", email: "a1@t.my", password: "123456" });
  await store.addChild({ name: "AnakA" });
  await store.setKv("ibu:luahan-ibu", [{ text: "rahsia A" }], { immediate: true });
  await store.signOut();
  await store.signUp({ name: "B", email: "b1@t.my", password: "123456" });
  assert.equal(store.children.length, 0);
  assert.deepEqual(await store.kv("ibu:luahan-ibu", []), []);
});
