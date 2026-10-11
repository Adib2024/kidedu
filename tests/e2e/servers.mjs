// Static file server for the app + an in-memory mock of the Supabase Auth/PostgREST endpoints the app uses.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname, resolve, dirname } from "node:path";
import { randomUUID } from "node:crypto";

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), "../..");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml", ".png": "image/png" };

/** opts.config: override config.js; opts.stripCsp: drop the CSP meta (needed to reach a localhost mock API). */
export function staticServer(port, opts = {}) {
  const srv = createServer(async (req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p.endsWith("/")) p += "index.html";
    const file = resolve(join(ROOT, p));
    if (!file.startsWith(ROOT) || file.includes("/.git/")) { res.writeHead(403).end(); return; }
    try {
      if (p === "/config.js" && opts.config) { res.writeHead(200, { "Content-Type": "text/javascript" }).end(opts.config); return; }
      let body = await readFile(file);
      if (p === "/index.html" && opts.stripCsp) body = Buffer.from(String(body).replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/, ""));
      res.writeHead(200, { "Content-Type": TYPES[extname(file)] || "application/octet-stream", "Cache-Control": "no-store" }).end(body);
    } catch { res.writeHead(404).end("not found"); }
  });
  return new Promise((r) => srv.listen(port, "127.0.0.1", () => r(srv)));
}

export function mockSupabase(port, { catalog = [] } = {}) {
  const DB = { users: new Map(), children: [], progress: new Map(), kv: new Map(), feedback: [], attempts: [], favorites: [], admins: new Set(), audit: [],
    activities: new Map(catalog.map((a) => [a.id, { ...a, published: true }])) };
  const TOK = new Map();
  const srv = createServer(async (req, res) => {
    const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "*" };
    const out = (code, obj) => { res.writeHead(code, { ...cors, "Content-Type": "application/json" }); res.end(obj === undefined ? "" : JSON.stringify(obj)); };
    if (req.method === "OPTIONS") return out(204);
    const u = new URL(req.url, "http://x");
    const body = await new Promise((r) => { let d = ""; req.on("data", (c) => (d += c)); req.on("end", () => r(d ? JSON.parse(d) : null)); });
    if (req.headers.apikey !== "anon-test") return out(401, { message: "bad apikey" });
    const issue = (user) => { const t = randomUUID(); TOK.set(t, user.id); return { access_token: t, refresh_token: "r-" + t, expires_in: 3600, user }; };
    if (u.pathname === "/auth/v1/signup") {
      if (DB.users.has(body.email)) return out(422, { msg: "User already registered" });
      const user = { id: randomUUID(), email: body.email, user_metadata: body.data || {} };
      DB.users.set(body.email, { pw: body.password, user });
      return out(200, issue(user));
    }
    if (u.pathname === "/auth/v1/token") {
      if (u.searchParams.get("grant_type") === "refresh_token") return out(400, { error_description: "Invalid Refresh Token" });
      const e = DB.users.get(body.email);
      if (!e || e.pw !== body.password) return out(400, { error_description: "Invalid login credentials" });
      return out(200, issue(e.user));
    }
    if (u.pathname === "/auth/v1/logout") return out(204);
    if (u.pathname === "/rest/v1/feedback" && req.method === "POST") { DB.feedback.push(body); return out(201); }
    const uidMaybe = TOK.get((req.headers.authorization || "").replace("Bearer ", ""));
    if (u.pathname === "/rest/v1/activities" && req.method === "GET") {
      const admin = uidMaybe && DB.admins.has(uidMaybe);
      return out(200, [...DB.activities.values()].filter((a) => a.published || admin).map(({ id, category, title, published, sort_order }) => ({ id, category, title, published, sort_order })));
    }
    const uid = TOK.get((req.headers.authorization || "").replace("Bearer ", ""));
    if (!uid) return out(401, { message: "JWT expired" });
    const eq = (k) => u.searchParams.get(k)?.replace(/^eq\./, "");
    if (u.pathname === "/rest/v1/children") {
      if (req.method === "GET") return out(200, DB.children.filter((c) => c.parent_id === uid));
      if (req.method === "POST") { const c = { ...body, id: randomUUID(), parent_id: uid, created_at: new Date().toISOString() }; DB.children.push(c); return out(201, [c]); }
      const c = DB.children.find((x) => x.id === eq("id") && x.parent_id === uid); // RLS: own rows only
      if (req.method === "PATCH") { if (!c) return out(200, []); Object.assign(c, body); return out(200, [c]); }
      if (req.method === "DELETE") { DB.children = DB.children.filter((x) => !(x.id === eq("id") && x.parent_id === uid)); return out(204); }
    }
    if (u.pathname === "/rest/v1/progress") {
      if (req.method === "GET") return out(200, [...DB.progress.values()].filter((r) => r.parent_id === uid));
      return out(403, { message: "permission denied for table progress" }); // writes only via record_attempt
    }
    if (u.pathname === "/rest/v1/rpc/record_attempt") {
      // mirrors the validation of public.record_attempt()
      const { p_child, p_activity, p_score, p_total, p_answers } = body;
      if (!DB.children.some((c) => c.id === p_child && c.parent_id === uid)) return out(403, { message: "child_not_found" });
      const fam = [...DB.activities.values()].filter((a) => a.published && (p_activity === a.id || p_activity.startsWith(a.id + ":"))).sort((a, b) => b.id.length - a.id.length)[0];
      if (!fam) return out(400, { message: "unknown_activity" });
      let stars;
      if (fam.kind === "quiz") {
        if (p_total !== fam.question_count) return out(400, { message: "invalid_total" });
        if (!Array.isArray(p_answers) || p_answers.length !== p_total) return out(400, { message: "answers_required" });
        if (p_answers.filter((a) => a.a === a.c).length !== p_score) return out(400, { message: "score_mismatch" });
        const r = p_score / p_total;
        stars = fam.category === "buku" ? Math.min(3, p_score) : r >= 0.9 ? 3 : r >= 0.7 ? 2 : r >= 0.5 ? 1 : 0;
      } else if (fam.kind === "stars") {
        if (p_total !== 3 || p_score < 0 || p_score > 3) return out(400, { message: "invalid_score" });
        stars = p_score;
      } else stars = 1;
      if (DB.attempts.some((a) => a.child_id === p_child && a.activity_id === p_activity && Date.now() - a.t < 5000)) return out(400, { message: "too_fast" });
      const key = p_child + "|" + p_activity;
      const prev = DB.progress.get(key);
      const xp = 5 + 10 * Math.max(0, stars - (prev?.stars || 0));
      DB.attempts.push({ child_id: p_child, parent_id: uid, activity_id: p_activity, category: fam.category, score: p_score, total: p_total, stars, xp, answers: p_answers, created_at: new Date().toISOString(), t: Date.now() });
      const row = { child_id: p_child, activity_id: p_activity, parent_id: uid, category: fam.category, stars: Math.max(prev?.stars || 0, stars), best_score: Math.max(prev?.best_score || 0, p_score), total: p_total, plays: (prev?.plays || 0) + 1, updated_at: new Date().toISOString() };
      DB.progress.set(key, row);
      const total_xp = DB.attempts.filter((a) => a.child_id === p_child).reduce((s, a) => s + a.xp, 0);
      return out(200, { stars, xp, progress: row, total_xp });
    }
    if (u.pathname === "/rest/v1/child_stats") {
      const by = {};
      for (const a of DB.attempts.filter((a) => a.parent_id === uid)) by[a.child_id] = (by[a.child_id] || 0) + a.xp;
      return out(200, Object.entries(by).map(([child_id, xp]) => ({ child_id, xp })));
    }
    if (u.pathname === "/rest/v1/learning_attempts") {
      const child = eq("child_id");
      return out(200, DB.attempts.filter((a) => a.parent_id === uid && (!child || a.child_id === child)).slice().reverse().slice(0, Number(u.searchParams.get("limit") || 200)).map(({ t, parent_id, ...a }) => a));
    }
    if (u.pathname === "/rest/v1/rpc/delete_my_account") { // mirrors migration 0006: cascade everything the user owns
      for (const [email, e] of DB.users) if (e.user.id === uid) DB.users.delete(email);
      const kids = new Set(DB.children.filter((c) => c.parent_id === uid).map((c) => c.id));
      DB.children = DB.children.filter((c) => c.parent_id !== uid);
      for (const [k, r] of DB.progress) if (r.parent_id === uid || kids.has(r.child_id)) DB.progress.delete(k);
      DB.attempts = DB.attempts.filter((a) => a.parent_id !== uid);
      DB.favorites = DB.favorites.filter((f) => f.user_id !== uid);
      for (const k of [...DB.kv.keys()]) if (k.startsWith(uid + "|")) DB.kv.delete(k);
      DB.admins.delete(uid);
      for (const [t, id] of TOK) if (id === uid) TOK.delete(t);
      return out(204);
    }
    if (u.pathname === "/rest/v1/rpc/is_admin") return out(200, DB.admins.has(uid));
    if (u.pathname === "/rest/v1/activities" && req.method === "PATCH") {
      const a = DB.activities.get(eq("id"));
      if (!a || !DB.admins.has(uid)) return out(200, []); // RLS: no rows for non-admins
      DB.audit.unshift({ actor: uid, row_id: a.id, action: "UPDATE", old_value: { published: a.published }, new_value: { published: body.published }, created_at: new Date().toISOString() });
      Object.assign(a, body);
      return out(200, [a]);
    }
    if (u.pathname === "/rest/v1/admin_audit") return out(200, DB.admins.has(uid) ? DB.audit : []);
    if (u.pathname === "/rest/v1/favorites") {
      if (req.method === "GET") return out(200, DB.favorites.filter((f) => f.user_id === uid));
      if (req.method === "POST") { if (!DB.favorites.some((f) => f.user_id === uid && f.item_type === body.item_type && f.item_id === body.item_id)) DB.favorites.push({ ...body, user_id: uid }); return out(201); }
      if (req.method === "DELETE") { DB.favorites = DB.favorites.filter((f) => !(f.user_id === uid && f.item_type === eq("item_type") && f.item_id === eq("item_id"))); return out(204); }
    }
    if (u.pathname === "/rest/v1/user_kv") {
      if (req.method === "GET") { const v = DB.kv.get(uid + "|" + eq("key")); return out(200, v === undefined ? [] : [{ value: v }]); }
      if (req.method === "POST") { DB.kv.set(uid + "|" + body.key, body.value); return out(201); }
      if (req.method === "DELETE") {
        const like = u.searchParams.get("key")?.replace(/^like\./, "");
        for (const k of [...DB.kv.keys()]) {
          const key = k.slice(uid.length + 1);
          if (k.startsWith(uid + "|") && (like ? key.startsWith(like.replace(/\*$/, "")) : key === eq("key"))) DB.kv.delete(k);
        }
        return out(204);
      }
    }
    return out(404, { message: "not found " + u.pathname });
  });
  srv.db = DB;
  srv.makeAdmin = (email) => DB.admins.add(DB.users.get(email).user.id);
  srv.expireAll = () => TOK.clear();
  return new Promise((r) => srv.listen(port, "127.0.0.1", () => r(srv)));
}
