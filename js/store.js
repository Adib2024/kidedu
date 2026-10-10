// Data & auth layer.
// Two interchangeable backends behind one API:
//   - "cloud": Supabase (Auth REST + PostgREST) — used when config.js has URL + key
//   - "demo":  localStorage — works offline with no setup (data stays in this browser)

import { uid } from "./util.js";

const CFG = window.PPL_CONFIG || {};
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
  if (window.crypto?.subtle) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  // Fallback for insecure contexts (file://): FNV-1a — demo mode only.
  let h = 0x811c9dc5;
  for (const c of text) { h ^= c.charCodeAt(0); h = Math.imul(h, 0x01000193); }
  return "fnv" + (h >>> 0).toString(16);
}

const ls = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { console.warn("storage full", e); } },
  del(k) { localStorage.removeItem(k); },
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
    const u = { id: uid(), name: name.trim(), email, pw: await sha256(email + ":" + password), created: Date.now() };
    users[email] = u;
    ls.set("ppl_users", users);
    ls.set("ppl_session", { userId: u.id });
    return { user: { id: u.id, email, name: u.name } };
  },
  async signIn({ email, password }) {
    email = email.trim().toLowerCase();
    const users = ls.get("ppl_users", {});
    const u = users[email];
    if (!u || u.pw !== (await sha256(email + ":" + password))) throw new Error(ERR_MS["Invalid login credentials"]);
    ls.set("ppl_session", { userId: u.id });
    return { id: u.id, email, name: u.name };
  },
  async signOut() { ls.del("ppl_session"); },
  async resetPassword() { throw new Error("Mod Demo: tetapan semula kata laluan tidak tersedia. Daftar akaun baru atau sambungkan Supabase."); },
  _db(userId) { return ls.get("ppl_data_" + userId, { children: [], progress: {}, kv: {} }); },
  _save(userId, db) { ls.set("ppl_data_" + userId, db); },
  async loadAll(userId) {
    const db = this._db(userId);
    return { children: db.children, progress: db.progress };
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
    this._save(userId, db);
  },
  async saveProgress(userId, row) {
    const db = this._db(userId);
    (db.progress[row.child_id] ||= {})[row.activity_id] = row;
    this._save(userId, db);
  },
  async kvGet(userId, key) { return this._db(userId).kv[key]; },
  async kvSet(userId, key, value) {
    const db = this._db(userId);
    if (value === undefined) delete db.kv[key]; else db.kv[key] = value;
    this._save(userId, db);
  },
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
    if (!r.ok) throw new Error(msErr(j.msg || j.error_description || j.message || j.error));
    return j;
  },
  async _refresh() {
    if (!this._s?.refresh_token) return false;
    try {
      this._store(await this._auth("token?grant_type=refresh_token", { refresh_token: this._s.refresh_token }));
      return true;
    } catch { this._store(null); return false; }
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
      throw new Error(j.message || `Ralat pelayan (${r.status})`);
    }
    return r.status === 204 ? null : r.json().catch(() => null);
  },
  _user(u) { return u ? { id: u.id, email: u.email, name: u.user_metadata?.name || u.email.split("@")[0] } : null; },
  async session() {
    if (!this._s) return null;
    if (!(await this._token())) return null;
    return this._user(this._s.user);
  },
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
    const [children, rows] = await Promise.all([
      this._rest("children?select=*&order=created_at.asc"),
      this._rest("progress?select=*"),
    ]);
    const progress = {};
    for (const r of rows || []) (progress[r.child_id] ||= {})[r.activity_id] = r;
    return { children: children || [], progress };
  },
  async addChild(_u, child) {
    const [c] = await this._rest("children", { method: "POST", body: child, prefer: "return=representation" });
    return c;
  },
  async updateChild(_u, id, patch) {
    const [c] = await this._rest(`children?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", body: patch, prefer: "return=representation" });
    return c;
  },
  async removeChild(_u, id) {
    await this._rest(`children?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
  },
  async saveProgress(_u, row) {
    const { child_id, activity_id, category, stars, best_score, total, plays, updated_at } = row;
    await this._rest("progress?on_conflict=child_id,activity_id", {
      method: "POST",
      body: { child_id, activity_id, category, stars, best_score, total, plays, updated_at },
      prefer: "resolution=merge-duplicates,return=minimal",
    });
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

// =====================================================================
// Public store (with in-memory cache + listeners)
// =====================================================================
const be = CLOUD ? cloud : demo;
const listeners = new Set();
const kvCache = new Map();
const kvTimers = new Map();
const kvPending = new Map();

export const STICKERS = ["🐼", "🦄", "🍭", "🌈", "🚀", "🦋", "🐳", "🍩", "🎈", "🦊", "🐢", "🍓", "🌻", "🐝", "🦁", "🍦", "🐙", "🎠", "🧁", "🐬", "🌟", "🦖", "🍉", "🐧", "🎨", "🏰", "🐨", "🍒", "🪐", "👑"];
export const STARS_PER_STICKER = 6;

export const store = {
  mode: CLOUD ? "cloud" : "demo",
  user: null,
  children: [],
  progress: {},
  ready: false,

  on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  emit() { listeners.forEach((fn) => fn()); },

  async init() {
    try {
      if (CLOUD) {
        const type = await cloud.consumeRedirect().catch(() => null);
        if (type) history.replaceState(null, "", location.pathname + (type === "recovery" ? "#/kata-laluan-baru" : "#/app"));
      }
      this.user = await be.session();
      if (this.user) await this.load();
    } catch (e) {
      console.warn("init failed", e);
      this.user = null;
    }
    this.ready = true;
  },
  async load() {
    const { children, progress } = await be.loadAll(this.user.id);
    this.children = children;
    this.progress = progress;
    kvCache.clear();
  },
  async signUp(data) {
    const r = await be.signUp(data);
    if (r.user) { this.user = r.user; await this.load(); this.emit(); }
    return r;
  },
  async signIn(data) {
    this.user = await be.signIn(data);
    await this.load();
    this.emit();
    return this.user;
  },
  async signOut() {
    await be.signOut();
    this.user = null;
    this.children = [];
    this.progress = {};
    kvCache.clear();
    this.emit();
  },
  resetPassword: (email) => be.resetPassword(email),
  updatePassword: (pw) => (CLOUD ? cloud.updatePassword(pw) : Promise.reject(new Error("Tidak tersedia dalam Mod Demo"))),

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
  /** Record a finished activity. Keeps best stars/score. Returns info for celebration UI. */
  async record(activityId, category, { stars, score = 0, total = 0 }) {
    const child = this.activeChild;
    if (!child) return { stars, improved: false, newSticker: null };
    const before = this.stickerCount(child.id);
    const prev = this.prog(activityId, child.id);
    const row = {
      child_id: child.id,
      activity_id: activityId,
      category,
      stars: Math.max(prev?.stars || 0, stars),
      best_score: Math.max(prev?.best_score || 0, score),
      total: total || prev?.total || 0,
      plays: (prev?.plays || 0) + 1,
      updated_at: new Date().toISOString(),
    };
    (this.progress[child.id] ||= {})[activityId] = row;
    const after = this.stickerCount(child.id);
    this.emit();
    try { await be.saveProgress(this.user.id, row); } catch (e) { console.warn(e); toastLater("Gagal simpan ke awan — akan cuba lagi bila disimpan semula."); }
    return { stars: row.stars, improved: stars > (prev?.stars || 0), newSticker: after > before ? STICKERS[after - 1] : null };
  },

  // ----- key/value (planner, journals, drawings, mom games) -----
  async kv(key, fallback) {
    if (kvCache.has(key)) return kvCache.get(key) ?? fallback;
    let v;
    try { v = await be.kvGet(this.user.id, key); } catch (e) { console.warn(e); }
    kvCache.set(key, v);
    return v ?? fallback;
  },
  /** Saves (debounced for cloud) — cache updates immediately. */
  setKv(key, value, { immediate = false } = {}) {
    kvCache.set(key, value);
    clearTimeout(kvTimers.get(key));
    const run = () => be.kvSet(this.user.id, key, value).catch((e) => { console.warn(e); toastLater("Gagal menyimpan. Semak sambungan internet."); });
    if (immediate || !CLOUD) { kvPending.delete(key); return run(); }
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
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flushKv(); });
window.addEventListener("pagehide", flushKv);
