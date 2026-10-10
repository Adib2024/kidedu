// Minimal browser-like globals so the app's modules can run under `node --test`.
class MemoryStorage {
  constructor() { this.m = new Map(); this.quota = Infinity; }
  get length() { return this.m.size; }
  key(i) { return [...this.m.keys()][i] ?? null; }
  getItem(k) { return this.m.has(k) ? this.m.get(k) : null; }
  setItem(k, v) {
    v = String(v);
    const used = [...this.m].reduce((n, [kk, vv]) => n + (kk === k ? 0 : kk.length + vv.length), 0);
    if (used + k.length + v.length > this.quota) { const e = new Error("QuotaExceededError"); e.name = "QuotaExceededError"; throw e; }
    this.m.set(k, v);
  }
  removeItem(k) { this.m.delete(k); }
  clear() { this.m.clear(); }
}
export function installEnv() {
  const ls = new MemoryStorage();
  const ss = new MemoryStorage();
  globalThis.window = globalThis;
  globalThis.localStorage = ls;
  globalThis.sessionStorage = ss;
  // Object.keys(localStorage) is used by the app to enumerate keys
  globalThis.localStorage = new Proxy(ls, {
    ownKeys: (t) => [...t.m.keys()],
    getOwnPropertyDescriptor: (t, k) => (t.m.has(k) ? { enumerable: true, configurable: true, value: t.m.get(k) } : undefined),
    get: (t, k) => (typeof t[k] === "function" ? t[k].bind(t) : t[k]),
    set: (t, k, v) => { t[k] = v; return true; },
  });
  globalThis.location = { hash: "#/", pathname: "/", origin: "http://localhost" };
  return { ls };
}
