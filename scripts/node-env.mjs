// Just enough of a browser for the app's data modules to load under Node (scripts only).
export function installNodeEnv() {
  if (!globalThis.localStorage) {
    const m = new Map();
    globalThis.localStorage = { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), clear: () => m.clear(), key: (i) => [...m.keys()][i] ?? null, get length() { return m.size; } };
  }
  globalThis.sessionStorage ||= globalThis.localStorage;
  globalThis.location ||= { hash: "#/", pathname: "/", origin: "http://localhost" };
}
