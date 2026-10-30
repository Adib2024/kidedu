// Service worker: network-first for this app's own files (fresh after every deploy),
// falling back to the cached copy when offline. API calls (Supabase) are never cached.
const VERSION = "playora-v13";
const SHELL = [
  "./", "index.html", "config.js", "css/style.css", "manifest.webmanifest", "icons/icon.svg", "icons/icon-192.png",
  "js/main.js", "js/feedback.js", "js/gate.js", "js/mascot.js",
  "js/school/qkit.js", "js/school/gen-math.js", "js/school/gen-bm.js", "js/school/gen-en.js", "js/school/gen-sains.js", "js/school/bank-sains-extra.js", "js/school/report.js", "js/shop.js", "js/install.js", "js/voice.js", "js/voicekey.js", "js/school/curriculum.js", "js/school/play.js", "js/school/review.js", "js/pages/school.js", "js/progression.js", "js/util.js", "js/store.js", "js/engine.js", "js/sections.js",
  "js/data/lexicon.js", "js/data/visuals.js", "js/data/questions.js", "js/data/games.js", "js/data/maps.js",
  "js/data/books.js", "js/data/pictures.js", "js/data/tips.js",
  "js/pages/landing.js", "js/pages/games.js", "js/pages/maps.js", "js/pages/books.js", "js/pages/worksheets.js",
  "js/pages/pensel.js", "js/pages/ibu.js", "js/pages/planner.js", "js/pages/tips.js", "js/pages/privacy.js",
];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  const sameOrigin = url.origin === location.origin;
  const isFont = url.host === "fonts.googleapis.com" || url.host === "fonts.gstatic.com";
  if (!sameOrigin && !isFont) return; // never cache API (Supabase) calls
  // natural-voice clips are named by a hash of their text: they never change, so cache-first
  if (sameOrigin && /\/audio\/[0-9a-f]{16}\.mp3$/.test(url.pathname)) {
    e.respondWith(caches.open(VERSION).then(async (c) => (await c.match(e.request)) || fetch(e.request).then((r) => { if (r.status === 200) c.put(e.request, r.clone()); return r; })));
    return;
  }
  if (isFont) {
    // fonts never change for a given URL: cache-first
    e.respondWith(caches.open(VERSION).then(async (c) => (await c.match(e.request)) || fetch(e.request).then((r) => { if (r.ok) c.put(e.request, r.clone()); return r; })));
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); }
        return res;
      })
      .catch(async () => (await caches.match(e.request, { ignoreSearch: true })) || (e.request.mode === "navigate" ? caches.match("index.html") : Response.error()))
  );
});
