import { test } from "node:test";
import assert from "node:assert/strict";
import { installEnv } from "./_env.mjs";
installEnv();
globalThis.window.PPL_CONFIG = { SUPABASE_URL: "https://demo.supabase.co", SUPABASE_ANON_KEY: "anon" };

const calls = [];
let kvGetFails = true;
let refreshMode = "ok"; // "ok" | "offline" | "revoked"
let tokenTtl = 3600;
globalThis.fetch = async (url, init = {}) => {
  calls.push(`${init.method || "GET"} ${url}`);
  const json = (code, body) => ({ ok: code < 300, status: code, json: async () => body });
  if (url.includes("grant_type=refresh_token") && refreshMode === "offline") throw new TypeError("Failed to fetch");
  if (url.includes("grant_type=refresh_token") && refreshMode === "revoked") return json(400, { error_description: "Invalid Refresh Token: Already Used" });
  if (url.includes("/auth/v1/token")) return json(200, { access_token: "t", refresh_token: "r", expires_in: tokenTtl, user: { id: "u1", email: "a@b.my", user_metadata: { name: "A" } } });
  if (url.includes("/rest/v1/children")) return json(200, []);
  if (url.includes("/rest/v1/progress")) return json(200, []);
  if (url.includes("/rest/v1/user_kv") && (init.method || "GET") === "GET") return kvGetFails ? json(500, { message: "boom" }) : json(200, [{ value: { saved: true } }]);
  if (url.includes("/rest/v1/user_kv")) return { ok: true, status: 201, json: async () => null };
  return json(404, {});
};
const { store } = await import("../../js/store.js");

test("cloud: if saved data cannot be loaded, it is never overwritten", async () => {
  assert.equal(store.mode, "cloud");
  await store.signIn({ email: "a@b.my", password: "x" });
  const v = await store.kv("planner:syukur", { fresh: true });
  assert.deepEqual(v, { fresh: true }, "UI gets the fallback");
  const before = calls.filter((c) => c.startsWith("POST") && c.includes("user_kv")).length;
  const ok = await store.setKv("planner:syukur", { fresh: true, edited: 1 }, { immediate: true });
  assert.equal(ok, false, "write refused");
  assert.equal(calls.filter((c) => c.startsWith("POST") && c.includes("user_kv")).length, before, "no POST sent");
  assert.ok(calls.filter((c) => c.startsWith("GET") && c.includes("user_kv")).length >= 2, "load was retried once");
});

test("cloud: once loading works again the key becomes writable", async () => {
  kvGetFails = false;
  assert.deepEqual(await store.kv("planner:tenang:2026-10", {}), { saved: true });
  assert.equal(await store.setKv("planner:tenang:2026-10", { saved: true, x: 1 }, { immediate: true }), true);
  assert.ok(calls.some((c) => c.startsWith("POST") && c.includes("user_kv?on_conflict=user_id,key")));
});

test("cloud: stay signed in — an expired token with no network keeps the session; a revoked refresh token ends it", async () => {
  globalThis.location.hash = "#/app";
  tokenTtl = -120; // the access token handed out is already expired: the next request must refresh
  await store.signIn({ email: "a@b.my", password: "x" });
  refreshMode = "offline";
  const before = calls.filter((c) => c.includes("grant_type=refresh_token")).length;
  await store.init();
  assert.ok(calls.filter((c) => c.includes("grant_type=refresh_token")).length > before, "a refresh was attempted");
  assert.ok(store.user, "still signed in while offline");
  assert.ok(localStorage.getItem("ppl_sb_session"), "session kept on the device");
  refreshMode = "revoked";
  await store.init();
  assert.equal(store.user, null, "a refused refresh token signs out");
  assert.equal(localStorage.getItem("ppl_sb_session"), null);
  tokenTtl = 3600; refreshMode = "ok";
});
