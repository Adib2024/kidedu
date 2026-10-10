// Service worker: offline app shell + stale-while-revalidate for same-origin assets.
const VERSION = "ppl-v2";
const SHELL = [
  "./", "index.html", "config.js", "css/style.css", "manifest.webmanifest", "icons/icon.svg", "icons/icon-192.png",
  "js/main.js", "js/util.js", "js/store.js", "js/engine.js", "js/sections.js",
  "js/data/lexicon.js", "js/data/visuals.js", "js/data/questions.js", "js/data/games.js", "js/data/maps.js",
  "js/data/books.js", "js/data/pictures.js", "js/data/tips.js",
  "js/pages/landing.js", "js/pages/games.js", "js/pages/maps.js", "js/pages/books.js", "js/pages/worksheets.js",
  "js/pages/pensel.js", "js/pages/ibu.js", "js/pages/planner.js", "js/pages/tips.js",
];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  const sameOrigin = url.origin === location.origin;
  const isFont = url.host.includes("fonts.googleapis.com") || url.host.includes("fonts.gstatic.com");
  if (!sameOrigin && !isFont) return; // never cache API (Supabase) calls
  e.respondWith(
    caches.open(VERSION).then(async (cache) => {
      const hit = await cache.match(e.request, { ignoreSearch: sameOrigin });
      const net = fetch(e.request).then((res) => { if (res.ok) cache.put(e.request, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    })
  );
});
