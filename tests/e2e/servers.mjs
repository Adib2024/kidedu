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

export function mockSupabase(port) {
  const DB = { users: new Map(), children: [], progress: new Map(), kv: new Map(), feedback: [] };
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
      if (!DB.children.some((c) => c.id === body.child_id && c.parent_id === uid)) return out(403, { message: "new row violates row-level security policy" });
      DB.progress.set(body.child_id + "|" + body.activity_id, { ...body, parent_id: uid });
      return out(201);
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
  srv.expireAll = () => TOK.clear();
  return new Promise((r) => srv.listen(port, "127.0.0.1", () => r(srv)));
}
