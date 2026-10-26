// Database tests: apply every migration to a throwaway PostgreSQL and check RLS + record_attempt rules
// with real allowed AND denied operations.
// Uses $PGTEST_URL if set (e.g. CI service container), otherwise starts a temporary local server.
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync, chmodSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import assert from "node:assert/strict";

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), "../..");
const asPg = process.getuid?.() === 0 ? ["runuser", "-u", "postgres", "--"] : [];
const run = (cmd, args, opts = {}) => execFileSync(asPg.length ? asPg[0] : cmd, asPg.length ? [...asPg.slice(1), cmd, ...args] : args, { encoding: "utf8", stdio: "pipe", ...opts });
// Newest PostgreSQL installed under /usr/lib/postgresql (any version), else whatever is on $PATH.
const bin = (n) => {
  const base = "/usr/lib/postgresql";
  const versions = existsSync(base) ? readdirSync(base).filter((v) => /^\d+$/.test(v)).sort((a, b) => b - a) : [];
  for (const v of versions) { const p = `${base}/${v}/bin/${n}`; if (existsSync(p)) return p; }
  return n;
};

let url = process.env.PGTEST_URL, dir;
if (!url) {
  dir = mkdtempSync(join(tmpdir(), "playora-pg-"));
  chmodSync(dir, 0o777);
  const port = 55000 + Math.floor(Math.random() * 1000);
  run(bin("initdb"), ["-D", join(dir, "data"), "-U", "postgres", "--auth=trust", "-E", "UTF8"]);
  run(bin("pg_ctl"), ["-D", join(dir, "data"), "-o", `-p ${port} -k ${dir} -c listen_addresses=''`, "-l", join(dir, "log"), "-w", "start"]);
  url = `postgresql://postgres@/postgres?host=${dir}&port=${port}`;
}
const psql = (sql, { as } = {}) => {
  const pre = as === undefined ? "" : as === null ? "set role anon;\n" : `set role authenticated; set request.jwt.claim.sub = '${as}';\n`;
  const r = spawnSync(asPg.length ? asPg[0] : "psql", [...(asPg.length ? [...asPg.slice(1), "psql"] : []), url, "-v", "ON_ERROR_STOP=1", "-qAt", "-c", pre + sql], { encoding: "utf8" });
  if (r.status !== 0) { const e = new Error(r.stderr.trim()); e.sqlError = true; throw e; }
  return r.stdout.trim().split("\n").filter(Boolean).at(-1) ?? "";
};
const denied = (sql, as, rx = /permission denied|violates row-level security|not_found|child_not_found|42501/) => {
  try { psql(sql, { as }); } catch (e) { assert.match(e.message, rx); return e.message; }
  throw new Error("expected DENIED but succeeded: " + sql);
};
const fails = (sql, as, rx) => denied(sql, as, rx);

const results = [];
const t = (name, fn) => { try { fn(); results.push([true, name]); } catch (e) { results.push([false, name, e.message.split("\n")[0]]); } };

try {
  // ---------------------------------------------------------------- apply migrations
  psql(readFileSync(join(ROOT, "tests/db/supabase-stub.sql"), "utf8"));
  const migs = readdirSync(join(ROOT, "supabase/migrations")).filter((f) => f.endsWith(".sql")).sort();
  for (const m of migs) psql(readFileSync(join(ROOT, "supabase/migrations", m), "utf8"));
  // migrations must be re-runnable (idempotent) — apply them all a second time
  for (const m of migs) psql(readFileSync(join(ROOT, "supabase/migrations", m), "utf8"));
  results.push([true, `applied ${migs.length} migrations twice (idempotent)`]);

  const A = psql(`insert into auth.users (email, raw_user_meta_data) values ('a@t.my', '{"name":"Ibu A"}') returning id`);
  const B = psql(`insert into auth.users (email) values ('b@t.my') returning id`);
  const ADM = psql(`insert into auth.users (email) values ('admin@t.my') returning id`);
  psql(`insert into public.admins (user_id) values ('${ADM}')`); // only possible as DB owner (dashboard)
  const childA = psql(`insert into public.children (name, age) values ('Adik A', 5) returning id`, { as: A });
  const childB = psql(`insert into public.children (name) values ('Adik B') returning id`, { as: B });
  const quiz = (n, right = n, total = 10) => `'${JSON.stringify(Array.from({ length: total }, (_, i) => ({ q: "q" + i, a: i < right ? "x" : "y", c: "x" })))}'::jsonb`;

  // ---------------------------------------------------------------- profiles & roles
  t("signup trigger creates a profile with the sign-up name", () => assert.equal(psql(`select display_name from public.profiles where id = '${A}'`, { as: A }), "Ibu A"));
  t("user can rename own profile", () => psql(`update public.profiles set display_name = 'Ibu Aisyah' where id = '${A}'`, { as: A }));
  t("user cannot read another user's profile", () => assert.equal(psql(`select count(*) from public.profiles where id = '${B}'`, { as: A }), "0"));
  t("user cannot make themselves admin (insert into admins)", () => denied(`insert into public.admins (user_id) values ('${A}')`, A));
  t("user cannot see the admins table", () => denied(`select * from public.admins`, A));
  t("is_admin() is false for parents, true for admins", () => {
    assert.equal(psql(`select public.is_admin()`, { as: A }), "f");
    assert.equal(psql(`select public.is_admin()`, { as: ADM }), "t");
  });

  // ---------------------------------------------------------------- children
  t("parent sees only own children", () => assert.equal(psql(`select count(*) from public.children`, { as: A }), "1"));
  t("parent cannot read/update/delete another family's child", () => {
    assert.equal(psql(`select count(*) from public.children where id = '${childB}'`, { as: A }), "0");
    assert.equal(psql(`with u as (update public.children set name = 'x' where id = '${childB}' returning 1) select count(*) from u`, { as: A }), "0");
    assert.equal(psql(`with d as (delete from public.children where id = '${childB}' returning 1) select count(*) from d`, { as: A }), "0");
  });
  t("parent cannot create a child for someone else", () => denied(`insert into public.children (name, parent_id) values ('x', '${B}')`, A));
  t("anonymous visitors cannot read children", () => assert.equal(psql(`select count(*) from public.children`, { as: null }), "0"));
  t("weekly goal is validated (1–50)", () => fails(`update public.children set weekly_goal = 99 where id = '${childA}'`, A, /check constraint|weekly_goal/));
  t("at most 10 children per account", () => {
    for (let i = 0; i < 9; i++) psql(`insert into public.children (name) values ('k${i}')`, { as: A });
    fails(`insert into public.children (name) values ('k10')`, A, /maksimum 10/);
    psql(`delete from public.children where name like 'k%'`, { as: A });
  });

  // ---------------------------------------------------------------- learning attempts & progress
  t("valid quiz attempt is recorded with server-computed stars and XP", () => {
    const r = JSON.parse(psql(`select public.record_attempt('${childA}', 'game:bijak-sifir:0', 9, 10, ${quiz(9)}, 30000)`, { as: A }));
    assert.equal(r.stars, 3);
    assert.equal(r.xp, 5 + 30);
    assert.equal(r.progress.stars, 3);
  });
  t("score is recomputed from the answer log (inflated score rejected)", () => fails(`select public.record_attempt('${childA}', 'game:bijak-sifir:1', 10, 10, ${quiz(4)})`, A, /score_mismatch/));
  t("quiz without answer log rejected", () => fails(`select public.record_attempt('${childA}', 'game:bijak-sifir:1', 5, 10)`, A, /answers_required/));
  t("wrong question count rejected", () => fails(`select public.record_attempt('${childA}', 'game:bijak-sifir:1', 50, 50, ${quiz(50, 50, 50)})`, A, /invalid_total/));
  t("unknown activity / invalid level rejected", () => {
    fails(`select public.record_attempt('${childA}', 'game:tiada:0', 1, 10, ${quiz(1)})`, A, /unknown_activity/);
    fails(`select public.record_attempt('${childA}', 'game:bijak-sifir:99', 1, 10, ${quiz(1)})`, A, /invalid_item/);
  });
  t("stars-type activity accepts 0–3 only", () => {
    psql(`select public.record_attempt('${childA}', 'pensel:tulis-huruf:A', 2, 3)`, { as: A });
    fails(`select public.record_attempt('${childA}', 'pensel:tulis-huruf:B', 9, 3)`, A, /invalid_score/);
  });
  t("cannot record for another family's child", () => denied(`select public.record_attempt('${childB}', 'game:bijak-sifir:0', 9, 10, ${quiz(9)})`, A, /child_not_found/));
  t("anonymous cannot record attempts", () => denied(`select public.record_attempt('${childA}', 'game:bijak-sifir:2', 9, 10, ${quiz(9)})`, null, /permission denied|not_authenticated/));
  t("same activity twice within 5 s is rejected (anti-spam)", () => fails(`select public.record_attempt('${childA}', 'game:bijak-sifir:0', 9, 10, ${quiz(9)})`, A, /too_fast/));
  t("replaying never re-awards star XP; best stars kept", () => {
    psql(`update public.learning_attempts set created_at = created_at - interval '1 minute'`); // let the 5 s window pass
    const r = JSON.parse(psql(`select public.record_attempt('${childA}', 'game:bijak-sifir:0', 6, 10, ${quiz(6)})`, { as: A }));
    assert.equal(r.xp, 5);
    assert.equal(r.progress.stars, 3);
    assert.equal(r.progress.plays, 2);
  });
  t("clients cannot write progress or attempts directly", () => {
    denied(`insert into public.progress (child_id, activity_id, parent_id, category, stars) values ('${childA}', 'game:x:0', '${A}', 'games', 3)`, A);
    denied(`update public.progress set stars = 3`, A);
    denied(`insert into public.learning_attempts (child_id, parent_id, activity_id, family_id, category, score, total, stars, xp) values ('${childA}', '${A}', 'game:bijak-sifir:5', 'game:bijak-sifir', 'games', 10, 10, 3, 999)`, A);
  });
  t("parents read only their own attempts, progress and stats", () => {
    assert.ok(Number(psql(`select count(*) from public.learning_attempts`, { as: A })) >= 3);
    assert.equal(psql(`select count(*) from public.learning_attempts`, { as: B }), "0");
    assert.equal(psql(`select count(*) from public.progress`, { as: B }), "0");
    assert.equal(psql(`select count(*) from public.child_stats`, { as: B }), "0");
    assert.equal(psql(`select xp from public.child_stats where child_id = '${childA}'`, { as: A }), String(35 + 5 + 5 + 20));
  });

  // ---------------------------------------------------------------- catalogue & admin
  t("catalogue is readable by anonymous visitors", () => assert.ok(Number(psql(`select count(*) from public.activities`, { as: null })) >= 30));
  t("parents cannot publish/unpublish activities", () => assert.equal(psql(`with u as (update public.activities set published = false where id = 'game:bijak-sifir' returning 1) select count(*) from u`, { as: A }), "0"));
  t("parents cannot add activities", () => denied(`insert into public.activities (id, category, title, kind) values ('game:hack', 'games', 'x', 'stars')`, A));
  t("admin can unpublish; change is audited; hidden from others; recording blocked", () => {
    assert.equal(psql(`with u as (update public.activities set published = false where id = 'game:simpulan-bahasa' returning 1) select count(*) from u`, { as: ADM }), "1");
    assert.equal(psql(`select count(*) from public.activities where id = 'game:simpulan-bahasa'`, { as: A }), "0");
    assert.equal(psql(`select count(*) from public.activities where id = 'game:simpulan-bahasa'`, { as: ADM }), "1");
    assert.equal(psql(`select actor from public.admin_audit where row_id = 'game:simpulan-bahasa' order by id desc limit 1`, { as: ADM }), ADM);
    assert.equal(psql(`select count(*) from public.admin_audit`, { as: A }), "0");
    fails(`select public.record_attempt('${childA}', 'game:simpulan-bahasa:0', 9, 10, ${quiz(9)})`, A, /unknown_activity/);
  });
  t("admin cannot edit structural columns (kind/question_count) via API", () => denied(`update public.activities set question_count = 1 where id = 'game:bijak-sifir'`, ADM));

  // ---------------------------------------------------------------- key/value, favourites, feedback
  t("key/value data is private per user", () => {
    psql(`insert into public.user_kv (key, value) values ('ibu:luahan-ibu', '[{"t":"rahsia"}]')`, { as: A });
    assert.equal(psql(`select count(*) from public.user_kv`, { as: B }), "0");
    denied(`insert into public.user_kv (user_id, key, value) values ('${A}', 'x', '{}')`, B);
  });
  t("favourites: own rows only, validated ids", () => {
    psql(`insert into public.favorites (item_type, item_id) values ('worksheet', 'meet-letter')`, { as: A });
    assert.equal(psql(`select count(*) from public.favorites`, { as: B }), "0");
    fails(`insert into public.favorites (item_type, item_id) values ('worksheet', '../../etc')`, A, /check constraint/);
    denied(`insert into public.favorites (user_id, item_type, item_id) values ('${A}', 'game', 'x')`, B);
  });
  t("feedback: anyone may send, nobody can read through the API, no impersonation", () => {
    psql(`insert into public.feedback (payload) values ('{"rating":5}')`, { as: null });
    denied(`select * from public.feedback`, null);
    denied(`select count(*) from public.feedback`, A);
    denied(`delete from public.feedback`, A);
    denied(`insert into public.feedback (user_id, payload) values ('${B}', '{}')`, A);
  });
  t("trigger functions cannot be called directly via RPC", () => {
    denied(`select public.handle_new_user()`, A, /permission denied|trigger functions can only be called as triggers/);
    denied(`select public.limit_children()`, A, /permission denied|trigger functions can only be called as triggers/);
    denied(`select public.is_admin()`, null, /permission denied/);
  });
  t("triggers still work after revoking EXECUTE (signup profile, audit, child limit)", () => {
    const C = psql(`insert into auth.users (email, raw_user_meta_data) values ('c@t.my', '{"name":"Ibu C"}') returning id`);
    assert.equal(psql(`select display_name from public.profiles where id = '${C}'`, { as: C }), "Ibu C");
    psql(`insert into public.children (name) values ('Adik C')`, { as: C });
    assert.equal(psql(`with u as (update public.activities set published = true where id = 'game:simpulan-bahasa' returning 1) select count(*) from u`, { as: ADM }), "1");
    assert.ok(Number(psql(`select count(*) from public.admin_audit`, { as: ADM })) >= 2);
  });
  t("deleting a child removes its attempts and progress (cascade)", () => {
    psql(`delete from public.children where id = '${childA}'`, { as: A });
    assert.equal(psql(`select count(*) from public.learning_attempts where child_id = '${childA}'`), "0");
    assert.equal(psql(`select count(*) from public.progress where child_id = '${childA}'`), "0");
  });
  t("delete_my_account: anon refused; deletes only the caller and cascades their family data", () => {
    denied(`select public.delete_my_account()`, null, /permission denied/);
    const D = psql(`insert into auth.users (email, raw_user_meta_data) values ('d@t.my', '{"name":"Ibu D"}') returning id`);
    const kidD = psql(`insert into public.children (name, age) values ('Adik D', 6) returning id`, { as: D });
    psql(`insert into public.user_kv (key, value) values ('planner:x', '{"a":1}')`, { as: D });
    psql(`insert into public.feedback (payload) values ('{"rating":4,"t":"del-test"}')`, { as: D });
    psql(`select public.record_attempt('${kidD}', 'game:bijak-sifir:0', 10, 10, ${quiz(10)}, 30000)`, { as: D });
    const others = psql(`select count(*) from public.children where parent_id <> '${D}'`);
    psql(`select public.delete_my_account()`, { as: D });
    assert.equal(psql(`select count(*) from auth.users where id = '${D}'`), "0");
    for (const tbl of ["children", "progress", "learning_attempts"]) assert.equal(psql(`select count(*) from public.${tbl} where parent_id = '${D}'`), "0", tbl);
    assert.equal(psql(`select count(*) from public.user_kv where user_id = '${D}'`), "0");
    assert.equal(psql(`select count(*) from public.profiles where id = '${D}'`), "0");
    assert.equal(psql(`select count(*) from public.feedback where payload->>'t' = 'del-test' and user_id is null`), "1", "feedback kept, anonymised");
    assert.equal(psql(`select count(*) from public.children where parent_id <> '${D}'`), others, "other families untouched");
    assert.equal(psql(`select count(*) from auth.users where id in ('${A}', '${B}')`), "2");
  });
} catch (e) {
  results.push([false, "setup", e.message.split("\n").slice(0, 4).join(" | ")]);
} finally {
  if (dir) { try { run(bin("pg_ctl"), ["-D", join(dir, "data"), "-m", "fast", "stop"]); } catch {} rmSync(dir, { recursive: true, force: true }); }
}
for (const [ok, name, err] of results) console.log(`${ok ? "PASS" : "FAIL"}  ${name}${err ? "\n      " + err : ""}`);
const failed = results.filter((r) => !r[0]).length;
console.log(`\n${results.length - failed}/${results.length} database checks passed`);
process.exit(failed ? 1 : 0);
