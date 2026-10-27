// Data & auth layer.
// Two interchangeable backends behind one API:
//   - "cloud": Supabase (Auth REST + PostgREST) — used when config.js has URL + key
//   - "demo":  localStorage — works offline with no setup (data stays in this browser)

import { uid } from "./util.js";
import { starsFor, xpFor, mytDay } from "./progression.js";

const CFG = globalThis.window?.PPL_CONFIG || {};
const CLOUD = Boolean(CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY);

const ERR_MS = {
  "Invalid login credentials": "Emel atau kata laluan salah.",
  "User already registered": "Emel ini sudah didaftarkan. Sila log masuk.",
  "Email not confirmed": "Emel belum disahkan. Sila semak peti masuk anda.",
  "Password should be at least 6 characters": "Kata laluan mesti sekurang-kurangnya 6 aksara.",
};
const msErr = (m) => {
  for (const [k, v] of Object.entries(ERR_MS)) if (m?.includes(k)) return v;
  return m || "Ralat tidak dijangka. Cuba lagi.";
};

async function sha256(text) {
  if (globalThis.crypto?.subtle) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  // Fallback for insecure contexts (file://): FNV-1a — demo mode only.
  let h = 0x811c9dc5;
  for (const c of text) { h ^= c.charCodeAt(0); h = Math.imul(h, 0x01000193); }
  return "fnv" + (h >>> 0).toString(16);
}

export class StorageFullError extends Error {
  constructor() { super("Storan peranti penuh. Padam beberapa lukisan di Galeri atau kosongkan ruang pelayar, kemudian cuba lagi."); this.code = "storage_full"; }
}
/** Salted PBKDF2 (demo accounts live on this device only, but don't keep weak hashes). */
async function pbkdf2(password, saltHex) {
  if (!globalThis.crypto?.subtle) return null;
  const salt = new Uint8Array(saltHex.match(/../g).map((h) => parseInt(h, 16)));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 150000, hash: "SHA-256" }, key, 256);
  return [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
const randomHex = (n = 16) => [...crypto.getRandomValues(new Uint8Array(n))].map((b) => b.toString(16).padStart(2, "0")).join("");
async function hashPassword(email, password) {
  const salt = globalThis.crypto?.getRandomValues ? randomHex() : null;
  const h = salt ? await pbkdf2(password, salt) : null;
  return h ? { pw2: h, salt } : { pw: await sha256(email + ":" + password) };
}
async function checkPassword(u, email, password) {
  if (u.pw2) return (await pbkdf2(password, u.salt)) === u.pw2;
  return u.pw === (await sha256(email + ":" + password)); // legacy v1.0 accounts
}

const ls = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  /** Throws StorageFullError instead of silently dropping the write. */
  set(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); }
    catch (e) { console.warn("storage write failed", e); throw new StorageFullError(); }
  },
  del(k) { try { localStorage.removeItem(k); } catch {} },
};

// =====================================================================
// Demo backend (localStorage)
// =====================================================================
const demo = {
  async session() {
    const s = ls.get("ppl_session");
    if (!s) return null;
    const users = ls.get("ppl_users", {});
    const u = Object.values(users).find((x) => x.id === s.userId);
    return u ? { id: u.id, email: u.email, name: u.name } : null;
  },
  async signUp({ name, email, password }) {
    email = email.trim().toLowerCase();
    if (password.length < 6) throw new Error(ERR_MS["Password should be at least 6 characters"]);
    const users = ls.get("ppl_users", {});
    if (users[email]) throw new Error(ERR_MS["User already registered"]);
    const u = { id: uid(), name: name.trim(), email, ...(await hashPassword(email, password)), created: Date.now() };
    users[email] = u;
    ls.set("ppl_users", users);
    ls.set("ppl_session", { userId: u.id });
    return { user: { id: u.id, email, name: u.name } };
  },
  async signIn({ email, password }) {
    email = email.trim().toLowerCase();
    const users = ls.get("ppl_users", {});
    const u = users[email];
    if (!u || !(await checkPassword(u, email, password))) throw new Error(ERR_MS["Invalid login credentials"]);
    if (!u.pw2) { // upgrade legacy hash on successful login
      const up = await hashPassword(email, password);
      if (up.pw2) { delete u.pw; Object.assign(u, up); users[email] = u; ls.set("ppl_users", users); }
    }
    ls.set("ppl_session", { userId: u.id });
    return { id: u.id, email, name: u.name };
  },
  async signOut() { ls.del("ppl_session"); },
  /** Remove the account and every key it owns on this device. */
  async deleteAccount(userId) {
    const users = ls.get("ppl_users", {});
    for (const [email, u] of Object.entries(users)) if (u.id === userId) delete users[email];
    ls.set("ppl_users", users);
    ls.del("ppl_data_" + userId);
    Object.keys(localStorage).filter((k) => k.startsWith(`ppl_kv_${userId}_`)).forEach((k) => ls.del(k));
    ls.del("ppl_session");
  },
  async resetPassword() { throw new Error("Mod Demo: tetapan semula kata laluan tidak tersedia. Daftar akaun baru atau sambungkan Supabase."); },
  _db(userId) { return ls.get("ppl_data_" + userId, { children: [], progress: {}, kv: {}, attempts: [] }); },
  _save(userId, db) { ls.set("ppl_data_" + userId, db); },
  async loadAll(userId) {
    const db = this._db(userId);
    const xp = {};
    for (const a of db.attempts || []) xp[a.child_id] = (xp[a.child_id] || 0) + a.xp;
    return { children: db.children, progress: db.progress, xp };
  },
  /** Same rules as public.record_attempt() on the server. */
  async recordAttempt(userId, p) {
    const db = this._db(userId);
    const prev = db.progress[p.childId]?.[p.activityId];
    const stars = p.answers ? (p.category === "buku" ? Math.min(3, p.score) : starsFor(p.score, p.total)) : p.category === "rutin" ? 1 : p.stars;
    const now = new Date().toISOString();
    const today = mytDay(now);
    const todayCount = (db.attempts || []).filter((a) => a.child_id === p.childId && mytDay(a.created_at) === today).length;
    const xp = xpFor(prev?.stars, stars, todayCount);
    const attempt = { id: uid(), child_id: p.childId, activity_id: p.activityId, category: p.category, score: p.score, total: p.total, stars, xp, answers: p.answers || null, duration_ms: p.durationMs ?? null, created_at: now };
    db.attempts = [...(db.attempts || []), attempt].slice(-400); // keep the latest 400 per account on this device
    const row = {
      child_id: p.childId, activity_id: p.activityId, category: p.category,
      stars: Math.max(prev?.stars || 0, stars), best_score: Math.max(prev?.best_score || 0, p.score),
      total: p.total, plays: (prev?.plays || 0) + 1, updated_at: now,
    };
    (db.progress[p.childId] ||= {})[p.activityId] = row;
    this._save(userId, db);
    return { progress: row, attempt, xp, stars };
  },
  async attempts(userId, childId, limit = 200) {
    return (this._db(userId).attempts || []).filter((a) => a.child_id === childId).reverse().slice(0, limit);
  },
  async addChild(userId, child) {
    const db = this._db(userId);
    const c = { id: uid(), created_at: new Date().toISOString(), ...child };
    db.children.push(c);
    this._save(userId, db);
    return c;
  },
  async updateChild(userId, id, patch) {
    const db = this._db(userId);
    const c = db.children.find((x) => x.id === id);
    Object.assign(c, patch);
    this._save(userId, db);
    return c;
  },
  async removeChild(userId, id) {
    const db = this._db(userId);
    db.children = db.children.filter((x) => x.id !== id);
    delete db.progress[id];
    db.attempts = (db.attempts || []).filter((a) => a.child_id !== id);
    this._save(userId, db);
  },
  _kvKey: (userId, key) => `ppl_kv_${userId}_${key}`,
  async kvGet(userId, key) {
    const v = ls.get(this._kvKey(userId, key));
    if (v !== undefined) return v;
    return this._db(userId).kv?.[key]; // legacy location (v1.0)
  },
  async kvSet(userId, key, value) {
    if (value === undefined) ls.del(this._kvKey(userId, key));
    else ls.set(this._kvKey(userId, key), value);
    const db = this._db(userId);
    if (db.kv && key in db.kv) { delete db.kv[key]; this._save(userId, db); }
  },
  async kvDeletePrefix(userId, prefix) {
    const p = this._kvKey(userId, prefix);
    Object.keys(localStorage).filter((k) => k.startsWith(p)).forEach((k) => ls.del(k));
  },
};

// Error codes raised by our SQL functions → friendly Malay messages
const SERVER_ERR = {
  too_fast: "Perlahan sikit! Keputusan yang sama baru sahaja disimpan.",
  rate_limited: "Banyak sangat percubaan dalam masa singkat. Rehat sekejap, kemudian cuba lagi.",
  unknown_activity: "Aktiviti ini tidak tersedia buat masa ini.",
  invalid_item: "Tahap ini tidak tersedia.",
  child_not_found: "Profil anak tidak dijumpai. Muat semula halaman.",
  score_mismatch: "Keputusan tidak sah dan tidak disimpan.",
  answers_required: "Keputusan tidak lengkap dan tidak disimpan.",
};

// =====================================================================
// Cloud backend (Supabase REST — no SDK needed)
// =====================================================================
const SB = (CFG.SUPABASE_URL || "").replace(/\/$/, "");
const cloud = {
  _s: ls.get("ppl_sb_session"),
  _store(s) {
    if (s) {
      s.expires_at ||= Math.floor(Date.now() / 1000) + (s.expires_in || 3600);
      this._s = s;
      ls.set("ppl_sb_session", s);
    } else { this._s = null; ls.del("ppl_sb_session"); }
  },
  async _auth(path, body) {
    const r = await fetch(`${SB}/auth/v1/${path}`, {
      method: "POST",
      headers: { apikey: CFG.SUPABASE_ANON_KEY, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { const e = new Error(msErr(j.msg || j.error_description || j.message || j.error)); e.status = r.status; throw e; }
    return j;
  },
  async _refresh() {
    if (!this._s?.refresh_token) return false;
    try {
      this._store(await this._auth("token?grant_type=refresh_token", { refresh_token: this._s.refresh_token }));
      return true;
    } catch (e) {
      // Only a refused refresh token ends the session. Offline / server hiccups keep the family signed in
      // (stay logged in on this device); the next request simply tries again.
      if (e?.status >= 400 && e.status < 500) { this._store(null); onSessionExpired(); }
      return false;
    }
  },
  async _token() {
    if (!this._s) return null;
    if (this._s.expires_at - 60 < Date.now() / 1000) await this._refresh();
    return this._s?.access_token;
  },
  async _rest(path, { method = "GET", body, prefer } = {}, retry = true) {
    const token = await this._token();
    const headers = { apikey: CFG.SUPABASE_ANON_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
    if (prefer) headers.Prefer = prefer;
    const r = await fetch(`${SB}/rest/v1/${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
    if (r.status === 401 && retry && (await this._refresh())) return this._rest(path, { method, body, prefer }, false);
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      const e = new Error(SERVER_ERR[j.message] || j.message || `Ralat pelayan (${r.status})`);
      e.code = j.message;
      throw e;
    }
    return r.status === 204 ? null : r.json().catch(() => null);
  },
  _user(u) { return u ? { id: u.id, email: u.email, name: u.user_metadata?.name || u.email.split("@")[0] } : null; },
  async session() {
    if (!this._s) return null;
    if (!(await this._token())) return null;
    return this._user(this._s.user);
  },
  /** One-time move of a trial's attempts into a new child (migration 0009; re-scored on the server). */
  importTrial(childId, attempts) { return this._rest("rpc/import_trial_attempts", { method: "POST", body: { p_child: childId, p_attempts: attempts } }); },
  async signUp({ name, email, password }) {
    const j = await this._auth("signup", { email: email.trim(), password, data: { name: name.trim() } });
    if (j.access_token) { this._store(j); return { user: this._user(j.user) }; }
    return { user: null, needsConfirm: true };
  },
  async signIn({ email, password }) {
    const j = await this._auth("token?grant_type=password", { email: email.trim(), password });
    this._store(j);
    return this._user(j.user);
  },
  async signOut() {
    try {
      const t = await this._token();
      if (t) await fetch(`${SB}/auth/v1/logout`, { method: "POST", headers: { apikey: CFG.SUPABASE_ANON_KEY, Authorization: `Bearer ${t}` } });
    } finally { this._store(null); }
  },
  /** Server deletes the auth user; every family table cascades (migration 0006). */
  async deleteAccount() {
    await this._rest("rpc/delete_my_account", { method: "POST", body: {} });
    this._store(null);
  },
  async resetPassword(email) {
    const r = await fetch(`${SB}/auth/v1/recover?redirect_to=${encodeURIComponent(location.origin + location.pathname)}`, {
      method: "POST",
      headers: { apikey: CFG.SUPABASE_ANON_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });
    if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(msErr(j.msg || j.message)); }
  },
  /** Email links (confirm signup / recovery) land with tokens in the URL hash. */
  async consumeRedirect() {
    const h = location.hash.slice(1);
    if (!h.includes("access_token=")) return null;
    const p = new URLSearchParams(h);
    const s = { access_token: p.get("access_token"), refresh_token: p.get("refresh_token"), expires_in: Number(p.get("expires_in") || 3600) };
    const r = await fetch(`${SB}/auth/v1/user`, { headers: { apikey: CFG.SUPABASE_ANON_KEY, Authorization: `Bearer ${s.access_token}` } });
    if (!r.ok) return null;
    s.user = await r.json();
    this._store(s);
    return p.get("type");
  },
  async updatePassword(password) {
    const t = await this._token();
    const r = await fetch(`${SB}/auth/v1/user`, { method: "PUT", headers: { apikey: CFG.SUPABASE_ANON_KEY, Authorization: `Bearer ${t}`, "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(msErr(j.msg || j.message)); }
  },
  async loadAll() {
    const [children, rows, stats] = await Promise.all([
      this._rest("children?select=*&order=created_at.asc"),
      this._rest("progress?select=*"),
      this._rest("child_stats?select=child_id,xp").catch(() => []),
    ]);
    const progress = {};
    for (const r of rows || []) (progress[r.child_id] ||= {})[r.activity_id] = r;
    const xp = Object.fromEntries((stats || []).map((r) => [r.child_id, r.xp]));
    return { children: children || [], progress, xp };
  },
  /** Scores are validated & stars/XP computed by the database (public.record_attempt). */
  async recordAttempt(_u, p) {
    const quiz = Array.isArray(p.answers);
    const body = {
      p_child: p.childId, p_activity: p.activityId,
      p_score: quiz ? p.score : p.category === "rutin" ? 1 : p.stars,
      p_total: quiz ? p.total : p.category === "rutin" ? 1 : 3,
      p_answers: quiz ? p.answers : null,
      p_duration_ms: p.durationMs ?? null,
    };
    const r = await this._rest("rpc/record_attempt", { method: "POST", body });
    return { progress: r.progress, xp: r.xp, stars: r.stars, totalXp: r.total_xp, attempt: { ...r.progress, stars: r.stars, xp: r.xp, answers: body.p_answers, score: body.p_score, total: body.p_total, created_at: new Date().toISOString() } };
  },
  async attempts(_u, childId, limit = 200) {
    return this._rest(`learning_attempts?select=activity_id,category,score,total,stars,xp,answers,created_at&child_id=eq.${encodeURIComponent(childId)}&order=created_at.desc&limit=${limit}`);
  },
  async catalog() {
    const token = this._s && (await this._token());
    const headers = { apikey: CFG.SUPABASE_ANON_KEY, ...(token ? { Authorization: `Bearer ${token}` } : {}) };
    const r = await fetch(`${SB}/rest/v1/activities?select=id,category,title,published,sort_order&order=sort_order.asc`, { headers });
    if (!r.ok) throw new Error(`Katalog tidak dapat dimuat (${r.status})`);
    return r.json();
  },
  async isAdmin() { return (await this._rest("rpc/is_admin", { method: "POST", body: {} })) === true; },
  async setPublished(id, published) {
    const rows = await this._rest(`activities?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", body: { published }, prefer: "return=representation" });
    if (!rows?.length) throw new Error("Tiada kebenaran untuk mengubah aktiviti ini.");
    return rows[0];
  },
  async audit() { return this._rest("admin_audit?select=actor,row_id,action,old_value,new_value,created_at&order=id.desc&limit=30"); },
  async favorites() { return (await this._rest("favorites?select=item_type,item_id")).map((f) => `${f.item_type}:${f.item_id}`); },
  async setFavorite(_u, type, id, on) {
    if (on) await this._rest("favorites", { method: "POST", body: { item_type: type, item_id: id }, prefer: "resolution=ignore-duplicates,return=minimal" });
    else await this._rest(`favorites?item_type=eq.${encodeURIComponent(type)}&item_id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
  },
  async addChild(_u, child) {
    const [c] = await this._withoutMissingGrade(child, (body) => this._rest("children", { method: "POST", body, prefer: "return=representation" }));
    return c;
  },
  async updateChild(_u, id, patch) {
    const [c] = await this._withoutMissingGrade(patch, (body) => this._rest(`children?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", body, prefer: "return=representation" }));
    return c;
  },
  /** Databases without migration 0007 have no children.grade column: save the rest instead of failing. */
  async _withoutMissingGrade(body, send) {
    try { return await send(body); }
    catch (e) {
      if (!("grade" in body) || !/'grade' column/.test(e.message || "")) throw e;
      const { grade, ...rest } = body;
      return send(rest);
    }
  },
  async removeChild(_u, id) {
    await this._rest(`children?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
  },
  async submitFeedback(entry) {
    const token = this._s ? await this._token() : null;
    const r = await fetch(`${SB}/rest/v1/feedback`, {
      method: "POST",
      // publishable keys go in `apikey` only; Authorization carries a user JWT when signed in
      headers: { apikey: CFG.SUPABASE_ANON_KEY, ...(token ? { Authorization: `Bearer ${token}` } : {}), "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ payload: entry }),
    });
    if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j.message || `Ralat pelayan (${r.status})`); }
  },
  async kvDeletePrefix(_u, prefix) {
    // PostgREST: `*` is the LIKE wildcard in URLs; our keys never contain % or _ wildcards of their own
    await this._rest(`user_kv?key=like.${encodeURIComponent(prefix)}*`, { method: "DELETE" });
  },
  async kvGet(_u, key) {
    const rows = await this._rest(`user_kv?select=value&key=eq.${encodeURIComponent(key)}`);
    return rows?.[0]?.value;
  },
  async kvSet(_u, key, value) {
    if (value === undefined) {
      await this._rest(`user_kv?key=eq.${encodeURIComponent(key)}`, { method: "DELETE" });
      return;
    }
    await this._rest("user_kv?on_conflict=user_id,key", {
      method: "POST",
      body: { key, value, updated_at: new Date().toISOString() },
      prefer: "resolution=merge-duplicates,return=minimal",
    });
  },
};

let sessionExpiredHandled = false;
function onSessionExpired() {
  if (sessionExpiredHandled || !store.user) return;
  sessionExpiredHandled = true;
  store.user = null;
  store.children = [];
  store.progress = {};
  kvCache.clear();
  toastLater("Sesi anda telah tamat. Sila log masuk semula.");
  const here = location.hash.slice(1) || "/app";
  location.hash = `/masuk?next=${encodeURIComponent(here)}`;
  store.emit();
}

// =====================================================================
// Public store (with in-memory cache + listeners)
// =====================================================================
// "Cuba Terus": in a Supabase build, a family can try Playora without signing up. The trial lives on this
// device only (demo backend) until they create an account and move it across (store.importTrial).
const TRIAL = "ppl_trial";
let be = CLOUD && ls.get(TRIAL) ? demo : CLOUD ? cloud : demo;
const listeners = new Set();
const kvCache = new Map();
const kvTimers = new Map();
const kvPending = new Map();
// Keys whose server value could not be loaded: writing them would overwrite real data.
const kvUnsafe = new Set();

export const STICKERS = ["🐼", "🦄", "🍭", "🌈", "🚀", "🦋", "🐳", "🍩", "🎈", "🦊", "🐢", "🍓", "🌻", "🐝", "🦁", "🍦", "🐙", "🎠", "🧁", "🐬", "🌟", "🦖", "🍉", "🐧", "🎨", "🏰", "🐨", "🍒", "🪐", "👑"];
export const STARS_PER_STICKER = 6;

export const store = {
  mode: CLOUD ? "cloud" : "demo",
  /** True while a Supabase build is running a device-only trial (Cuba Terus). */
  get trial() { return CLOUD && be === demo; },
  user: null,
  children: [],
  progress: {},
  xp: {},
  ready: false,
  catalog: null,      // Map familyId → {published,title,...} (Supabase mode)
  _attempts: {},      // childId → recent attempts (newest first)
  _favs: null,

  on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  emit() { listeners.forEach((fn) => fn()); },

  async init() {
    try {
      if (CLOUD) {
        const type = await cloud.consumeRedirect().catch(() => null);
        if (type) this._leaveTrial(); // e-mail link confirmed an account: the trial (if any) waits to be imported
        if (type) history.replaceState(null, "", location.pathname + (type === "recovery" ? "#/kata-laluan-baru" : "#/app"));
      }
      if (CLOUD) await this.loadCatalog();
      this.user = await be.session();
      if (this.user) await this.load();
    } catch (e) {
      console.warn("init failed", e);
      this.user = null;
    }
    this.ready = true;
  },
  async load() {
    const { children, progress, xp } = await be.loadAll(this.user.id);
    this.children = children;
    this.progress = progress;
    this.xp = xp || {};
    this._attempts = {};
    this._favs = null;
    this._admin = undefined;
    kvCache.clear();
  },
  async loadCatalog() {
    try {
      const rows = await cloud.catalog();
      this.catalog = new Map(rows.map((r) => [r.id, r]));
    } catch (e) { console.warn(e); this.catalog = null; }
  },
  /** Admins can unpublish an activity family; hidden families are not shown or playable. */
  isPublished(familyId) {
    const r = this.catalog?.get(familyId);
    return !r || r.published !== false;
  },
  async signUp(data) {
    const target = this.trial ? cloud : be;
    const r = await target.signUp(data);
    if (r.user) { this._leaveTrial(); this.user = r.user; await this.load(); this.emit(); }
    return r;
  },
  async signIn(data) {
    const target = this.trial ? cloud : be;
    const u = await target.signIn(data);
    this._leaveTrial();
    this.user = u;
    sessionExpiredHandled = false;
    await this.load();
    this.emit();
    return this.user;
  },
  async signOut() {
    await be.signOut();
    this._leaveTrial();
    this._resetLocal();
  },

  // ----- Cuba Terus (trial without an account; Supabase builds) -----
  /** Start a device-only trial with one child profile. */
  async startTrial({ name = "Adik", age = 7 } = {}) {
    if (!CLOUD) throw new Error("Cuba Terus hanya untuk versi awan.");
    ls.set(TRIAL, true);
    be = demo;
    const prev = this.trialOnDevice();
    if (prev) { // come back to the same trial instead of leaving the old one behind
      ls.set("ppl_session", { userId: prev.owner });
      this.user = await demo.session();
      if (this.user) { await this.load(); this.emit(); return; }
    }
    const r = await demo.signUp({ name: "Tetamu", email: `cuba-${uid()}@cuba.local`, password: uid() + uid() });
    ls.set("ppl_trial_owner", r.user.id);
    this.user = r.user;
    await this.load();
    await this.addChild({ name, age, avatar: "🐼" });
    this.emit();
  },
  _leaveTrial() {
    if (!CLOUD) return;
    ls.del(TRIAL);
    be = cloud;
  },
  /** Trial data still on this device (to offer moving it into the signed-in account), or null. */
  trialOnDevice() {
    if (!CLOUD) return null;
    const owner = ls.get("ppl_trial_owner");
    if (!owner) return null;
    const db = demo._db(owner);
    if (!db.children?.length) return null;
    const stars = Object.values(db.progress || {}).reduce((n, byAct) => n + Object.values(byAct).reduce((m, r) => m + (r.stars || 0), 0), 0);
    return { owner, children: db.children, stars, attempts: (db.attempts || []).length };
  },
  /** Throw away the trial on this device. */
  async discardTrial() {
    const t = this.trialOnDevice();
    if (t) await demo.deleteAccount(t.owner);
    ls.del("ppl_trial_owner");
    ls.del(TRIAL);
    this.emit();
  },
  /**
   * Move the trial into the signed-in Supabase account: each child becomes a new profile, attempts are
   * re-scored by the server (import_trial_attempts), saved data (Kedai, Ulang Kaji, planner…) is copied
   * without overwriting anything already in the account. Returns { children, imported, skipped }.
   */
  async importTrial(onStep = () => {}) {
    const t = this.trialOnDevice();
    if (!t || be !== cloud || !this.user) throw new Error("Tiada data percubaan untuk dipindahkan.");
    const db = demo._db(t.owner);
    const idMap = new Map();
    let imported = 0, skipped = 0;
    for (const c of t.children) {
      onStep(`Profil ${c.name}…`);
      const { id, created_at, parent_id, ...fields } = c;
      const nc = await cloud.addChild(null, { name: fields.name, age: fields.age ?? null, avatar: fields.avatar ?? null, ...(fields.grade != null ? { grade: fields.grade } : {}), ...(fields.weekly_goal ? { weekly_goal: fields.weekly_goal } : {}) });
      idMap.set(id, nc.id);
      const rows = (db.attempts || []).filter((a) => a.child_id === id).sort((a, b) => a.created_at.localeCompare(b.created_at))
        .map((a) => {
          const quiz = Array.isArray(a.answers);
          return { activity: a.activity_id, score: quiz ? a.score : a.category === "rutin" ? 1 : a.stars, total: quiz ? a.total : a.category === "rutin" ? 1 : 3, answers: quiz ? a.answers : null, duration_ms: a.duration_ms ?? null };
        }).slice(-400);
      if (rows.length) {
        onStep(`Kemajuan ${c.name} (${rows.length})…`);
        const r = await cloud.importTrial(nc.id, rows);
        imported += r.imported; skipped += r.skipped;
      }
      const onb = localStorage.getItem(`ppl_onb_${id}`);
      if (onb != null) localStorage.setItem(`ppl_onb_${nc.id}`, onb);
    }
    onStep("Data simpanan…");
    const prefix = demo._kvKey(t.owner, "");
    for (const k of Object.keys(localStorage).filter((x) => x.startsWith(prefix))) {
      let key = k.slice(prefix.length);
      for (const [o, n] of idMap) key = key.split(o).join(n);
      if ((await cloud.kvGet(null, key)) !== undefined) continue; // never overwrite account data
      await cloud.kvSet(null, key, ls.get(k));
    }
    await demo.deleteAccount(t.owner);
    ls.del("ppl_trial_owner");
    const first = idMap.values().next().value;
    await this.load();
    if (first) this.setActiveChild(first);
    this.emit();
    return { children: idMap.size, imported, skipped };
  },
  /** Permanently delete the parent account and all family data (children, progress, planner…). */
  async deleteAccount() {
    const kids = this.children.map((c) => c.id);
    const wasTrial = this.trial;
    await be.deleteAccount(this.user.id);
    for (const id of kids) ls.del(`ppl_onb_${id}`);
    ls.del("ppl_child");
    if (wasTrial) { ls.del("ppl_trial_owner"); this._leaveTrial(); }
    this._resetLocal();
  },
  _resetLocal() {
    this.user = null;
    this.children = [];
    this.progress = {};
    this.xp = {};
    this._attempts = {};
    this._favs = null;
    this._admin = undefined;
    kvCache.clear();
    kvUnsafe.clear();
    this.emit();
  },
  resetPassword: (email) => be.resetPassword(email),
  submitFeedback: (entry) => (CLOUD ? cloud.submitFeedback(entry) : Promise.reject(new Error("Tidak tersedia dalam Mod Demo"))),
  updatePassword: (pw) => (be === cloud ? cloud.updatePassword(pw) : Promise.reject(new Error("Tidak tersedia dalam Mod Demo"))),

  // ----- children -----
  get activeChild() {
    const id = localStorage.getItem("ppl_child");
    return this.children.find((c) => c.id === id) || this.children[0] || null;
  },
  setActiveChild(id) { localStorage.setItem("ppl_child", id); this.emit(); },
  async addChild(child) {
    const c = await be.addChild(this.user.id, child);
    this.children.push(c);
    this.setActiveChild(c.id);
    return c;
  },
  async updateChild(id, patch) {
    const c = await be.updateChild(this.user.id, id, patch);
    const i = this.children.findIndex((x) => x.id === id);
    if (i >= 0) this.children[i] = { ...this.children[i], ...c, ...patch };
    this.emit();
  },
  async removeChild(id) {
    await be.removeChild(this.user.id, id);
    // per-child private data (gallery, routines, timetable) goes with the profile
    for (const prefix of [`gallery:${id}`, `planner:rutin:${id}:`, `planner:rutin:cfg:${id}`, `planner:jadual:${id}`]) {
      try { await be.kvDeletePrefix(this.user.id, prefix); } catch (e) { console.warn(e); }
      [...kvCache.keys()].filter((k) => k.startsWith(prefix)).forEach((k) => kvCache.delete(k));
    }
    this.children = this.children.filter((c) => c.id !== id);
    delete this.progress[id];
    this.emit();
  },

  // ----- progress -----
  prog(activityId, childId = this.activeChild?.id) {
    return this.progress[childId]?.[activityId] || null;
  },
  starsOf(activityId, childId) { return this.prog(activityId, childId)?.stars || 0; },
  totalStars(childId = this.activeChild?.id) {
    return Object.values(this.progress[childId] || {}).reduce((s, r) => s + (r.stars || 0), 0);
  },
  stickerCount(childId) { return Math.min(STICKERS.length, Math.floor(this.totalStars(childId) / STARS_PER_STICKER)); },
  xpOf(childId = this.activeChild?.id) { return this.xp[childId] || 0; },
  /**
   * Record a finished activity.
   *   quiz:  { score, total, answers: [{q, a, c}] }  → stars computed from the answers
   *   other: { stars }                              → 0–3 (tracing, colouring, memory, hidden objects)
   * In Supabase mode the database validates & scores it; memory is only updated from the server's reply.
   */
  async record(activityId, category, { stars = 0, score = 0, total = 0, answers = null, durationMs = null } = {}) {
    const child = this.activeChild;
    if (!child) return { stars, improved: false, newSticker: null };
    const before = this.stickerCount(child.id);
    const prev = this.prog(activityId, child.id);
    let res;
    try {
      res = await be.recordAttempt(this.user.id, { childId: child.id, activityId, category, stars, score, total, answers, durationMs });
    } catch (e) {
      console.warn(e);
      toastLater(e?.code === "storage_full" || SERVER_ERR[e?.code] ? e.message : "Kemajuan tidak dapat disimpan. Semak sambungan internet dan cuba lagi.");
      return { stars: prev?.stars || 0, improved: false, newSticker: null, saveFailed: true };
    }
    (this.progress[child.id] ||= {})[activityId] = res.progress;
    const levelBefore = this.xpOf(child.id);
    this.xp[child.id] = res.totalXp ?? levelBefore + res.xp;
    (this._attempts[child.id] ||= null)?.unshift(res.attempt);
    const after = this.stickerCount(child.id);
    this.emit();
    return {
      stars: res.stars, best: res.progress.stars, improved: res.stars > (prev?.stars || 0), xpGained: res.xp, totalXp: this.xp[child.id],
      newSticker: after > before ? STICKERS[after - 1] : null,
    };
  },
  /** Recent attempts for a child (newest first), cached per session. */
  async attempts(childId = this.activeChild?.id, { refresh = false } = {}) {
    if (!childId) return [];
    if (!refresh && this._attempts[childId]) return this._attempts[childId];
    const list = (await be.attempts(this.user.id, childId, 200)) || [];
    this._attempts[childId] = list;
    return list;
  },

  // ----- favourites -----
  async favorites() {
    if (this._favs) return this._favs;
    this._favs = new Set(be === cloud ? await cloud.favorites() : await this.kv("favorites", []));
    return this._favs;
  },
  async toggleFavorite(type, id) {
    const favs = await this.favorites();
    const key = `${type}:${id}`;
    const on = !favs.has(key);
    if (be === cloud) await cloud.setFavorite(null, type, id, on);
    if (on) favs.add(key); else favs.delete(key);
    if (be !== cloud) await this.setKv("favorites", [...favs], { immediate: true });
    return on;
  },

  // ----- administration (Supabase mode only; enforced by RLS on the server) -----
  async isAdmin() {
    if (be !== cloud || !this.user) return false;
    if (this._admin === undefined) { try { this._admin = await cloud.isAdmin(); } catch { this._admin = false; } }
    return this._admin;
  },
  async setPublished(id, published) {
    const row = await cloud.setPublished(id, published);
    this.catalog?.set(id, { ...(this.catalog.get(id) || {}), ...row });
    return row;
  },
  adminAudit: () => cloud.audit(),

  // ----- key/value (planner, journals, drawings, mom games) -----
  async kv(key, fallback) {
    if (kvCache.has(key)) return kvCache.get(key) ?? fallback;
    let v;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        v = await be.kvGet(this.user.id, key);
        kvCache.set(key, v);
        kvUnsafe.delete(key);
        return v ?? fallback;
      } catch (e) {
        console.warn(e);
        if (attempt === 0) await new Promise((r) => setTimeout(r, 400 + Math.random() * 400));
      }
    }
    // Could not load: show the fallback but refuse to save over the unknown server value.
    kvUnsafe.add(key);
    if (!this.user) return fallback; // session expired: the login prompt already explains what happened
    toastLater("Gagal memuatkan data. Semak internet & muat semula halaman — perubahan tidak akan disimpan buat masa ini.");
    return fallback;
  },
  /** Saves (debounced for cloud) — cache updates immediately. */
  setKv(key, value, { immediate = false } = {}) {
    if (kvUnsafe.has(key)) {
      toastLater("Tidak disimpan: data asal belum dimuatkan. Muat semula halaman dan cuba lagi.");
      return Promise.resolve(false);
    }
    kvCache.set(key, value);
    clearTimeout(kvTimers.get(key));
    const run = () => be.kvSet(this.user.id, key, value).then(() => true).catch((e) => {
      console.warn(e);
      toastLater(e?.code === "storage_full" ? e.message : "Gagal menyimpan. Semak sambungan internet.");
      return false;
    });
    if (immediate || be !== cloud) { kvPending.delete(key); return run(); }
    kvPending.set(key, run);
    kvTimers.set(key, setTimeout(() => { kvPending.delete(key); run(); }, 600));
    return Promise.resolve();
  },
};

function toastLater(msg) {
  import("./util.js").then(({ toast }) => toast(msg));
}

// Flush debounced cloud writes when the tab is hidden/closed.
function flushKv() {
  kvTimers.forEach((t) => clearTimeout(t));
  kvTimers.clear();
  kvPending.forEach((run) => run());
  kvPending.clear();
}
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flushKv(); });
  window.addEventListener("pagehide", flushKv);
}
