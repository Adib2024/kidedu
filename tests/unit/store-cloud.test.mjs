import { test } from "node:test";
import assert from "node:assert/strict";
import { installEnv } from "./_env.mjs";
installEnv();
globalThis.window.PPL_CONFIG = { SUPABASE_URL: "https://demo.supabase.co", SUPABASE_ANON_KEY: "anon" };

const calls = [];
let kvGetFails = true;
globalThis.fetch = async (url, init = {}) => {
  calls.push(`${init.method || "GET"} ${url}`);
  const json = (code, body) => ({ ok: code < 300, status: code, json: async () => body });
  if (url.includes("/auth/v1/token")) return json(200, { access_token: "t", refresh_token: "r", expires_in: 3600, user: { id: "u1", email: "a@b.my", user_metadata: { name: "A" } } });
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
