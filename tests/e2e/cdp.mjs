// Minimal Chrome DevTools Protocol driver (no npm dependencies).
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CANDIDATES = [process.env.CHROME_PATH, "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", "/opt/pw-browsers/chromium", "/usr/bin/chromium",
  "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/opt/google/chrome/chrome", "/usr/bin/chromium-browser"].filter(Boolean);
export const chromePath = () => CANDIDATES.find((p) => existsSync(p));

export async function launch({ width = 412, height = 900, port = 9400 + Math.floor(Math.random() * 500), mobile = width < 600 } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "playora-e2e-"));
  if (!chromePath()) throw new Error("Chrome/Chromium not found — set CHROME_PATH");
  // cold starts on shared CI runners can take well over 10 s: wait up to ~30 s, then retry once on a fresh port
  let proc, targets = [];
  for (let attempt = 0; attempt < 2 && !targets.length; attempt++) {
    if (attempt) { proc.kill("SIGKILL"); port += 1; }
    proc = spawn(chromePath(), ["--headless=new", "--no-sandbox", "--disable-gpu", "--no-first-run", `--remote-debugging-port=${port}`, `--user-data-dir=${dir}`, "about:blank"], { stdio: "ignore" });
    for (let i = 0; i < 200 && !targets.length; i++) {
      try { targets = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).filter((t) => t.type === "page"); } catch {}
      if (!targets.length) await new Promise((r) => setTimeout(r, 150));
    }
  }
  if (!targets.length) { proc.kill("SIGKILL"); throw new Error("Chromium did not start"); }
  const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0;
  const pending = new Map();
  const errors = [];
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); }
    if (d.method === "Runtime.exceptionThrown") errors.push("exception: " + (d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text));
    if (d.method === "Runtime.consoleAPICalled" && d.params.type === "error") errors.push("console.error: " + d.params.args.map((a) => a.value ?? a.description).join(" "));
    if (d.method === "Log.entryAdded" && ["error"].includes(d.params.entry.level)) errors.push("log: " + d.params.entry.text + " " + (d.params.entry.url || ""));
  };
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  await send("Runtime.enable"); await send("Log.enable"); await send("Page.enable");
  const api = {
    errors, send,
    async viewport(w, h, mob = w < 600) { await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: mob }); },
    async eval(expr) {
      const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
      if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text);
      return r.result?.result?.value;
    },
    async goto(url) { await send("Page.navigate", { url }); await api.wait(900); },
    async hash(h) { await api.eval(`location.hash = ${JSON.stringify(h)}`); await api.wait(500); },
    async reload() { await send("Page.reload", { ignoreCache: true }); await api.wait(1200); },
    wait: (ms) => new Promise((r) => setTimeout(r, ms)),
    /** Wait (up to `ms`) for a selector to exist — pages render asynchronously. */
    async waitFor(sel, ms = 5000) {
      const t0 = Date.now();
      while (Date.now() - t0 < ms) {
        if (await api.eval(`!!document.querySelector(${JSON.stringify(sel)})`)) return true;
        await api.wait(100);
      }
      throw new Error("element not found: " + sel);
    },
    async click(sel) {
      await api.waitFor(sel);
      await api.eval(`document.querySelector(${JSON.stringify(sel)}).click()`);
      await api.wait(250);
    },
    /** innerText of a selector; waits (≤5 s) for the element so slow CI runners don't read an empty page. */
    async text(sel = "body") {
      if (sel !== "body") await api.waitFor(sel).catch(() => {});
      return api.eval(`(document.querySelector(${JSON.stringify(sel)})?.innerText || "")`);
    },
    exists: (sel) => api.eval(`!!document.querySelector(${JSON.stringify(sel)})`),
    async shot(path) { const r = await send("Page.captureScreenshot", { format: "png" }); writeFileSync(path, Buffer.from(r.result.data, "base64")); },
    addInitScript: (source) => send("Page.addScriptToEvaluateOnNewDocument", { source }),
    close() { try { ws.close(); } catch {} proc.kill(); setTimeout(() => rmSync(dir, { recursive: true, force: true }), 500); },
  };
  await api.viewport(width, height, mobile);
  return api;
}
