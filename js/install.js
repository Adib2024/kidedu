// "Pasang Playora": add the PWA to the home screen. Chrome/Edge/Android hand us a prompt event; iPhone/iPad
// (Safari) need the Share → "Add to Home Screen" steps instead.
import { modal } from "./util.js";

let deferred = null;
const listeners = new Set();
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e; listeners.forEach((fn) => fn()); });
  window.addEventListener("appinstalled", () => { deferred = null; listeners.forEach((fn) => fn()); });
}

export const isInstalled = () =>
  typeof window !== "undefined" && (window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true);
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

/** "prompt" (one-tap install), "ios" (show steps), "manual" (browser menu), or "installed". */
export function installMode() {
  if (isInstalled()) return "installed";
  if (deferred) return "prompt";
  return isIOS() ? "ios" : "manual";
}
export const onInstallChange = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

export async function installApp() {
  let mode = installMode();
  if (mode === "prompt") {
    const e = deferred;
    try {
      await e.prompt();
      deferred = null;
      const r = await e.userChoice.catch(() => null);
      listeners.forEach((fn) => fn());
      return r?.outcome === "accepted";
    } catch { mode = "manual"; } // the browser refused the prompt: show the steps instead
  }
  const steps = mode === "ios"
    ? `<ol class="install-steps"><li>Tekan butang <b>Kongsi</b> <span aria-hidden="true">⬆️</span> di bawah skrin Safari</li><li>Pilih <b>Tambah ke Skrin Utama</b> <span aria-hidden="true">➕</span></li><li>Tekan <b>Tambah</b> — ikon 🐼 Playora akan muncul</li></ol>`
    : `<ol class="install-steps"><li>Buka menu pelayar <b>⋮</b> (atas kanan)</li><li>Pilih <b>Pasang aplikasi</b> atau <b>Tambah ke skrin Utama</b></li><li>Ikon 🐼 Playora akan muncul di skrin utama</li></ol>`;
  modal(`<h2 style="margin-top:0">📲 Pasang Playora</h2><p>Buka Playora terus dari skrin utama seperti app biasa — tanpa perlu taip alamat.</p>${steps}
    <div class="row" style="justify-content:flex-end"><button class="btn sm" data-close>Faham</button></div>`,
  { onMount: (box, close) => { box.querySelector("[data-close]").onclick = close; } });
  return false;
}

/** A small card with the right button for this device (empty when already installed). */
export function installCard() {
  if (installMode() === "installed") return "";
  return `<div class="install-card" data-install-card><span class="ic" aria-hidden="true">📲</span><span class="grow"><b>Pasang Playora</b><small>Ikon di skrin utama — buka terus seperti app.</small></span><button class="btn sm" data-install>Pasang</button></div>`;
}
export function bindInstall(el) {
  el.querySelectorAll("[data-install]").forEach((b) => (b.onclick = async () => {
    if (await installApp()) el.querySelector("[data-install-card]")?.remove();
  }));
}
