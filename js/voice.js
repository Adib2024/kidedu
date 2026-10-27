// Natural voice: pre-recorded neural TTS clips (audio/<key>.mp3, made by scripts/gen-audio.mjs).
// util.speak() asks playClip() first and falls back to the device's speech synthesis when a sentence
// has no clip (e.g. randomly generated sums) or the clip cannot play.
import { clipKey, normSay } from "./voicekey.js";

const BASE = "audio/";
let clips = null;        // Set of available keys (null until audio/index.json has loaded)
let loading = null;
let player = null;       // one shared <audio>: iOS only lets an element play after it was "unlocked" by a tap
let job = 0;             // increments on every play/stop so late fetches never start stale audio
const blobs = new Map(); // key → object URL (small LRU)

export function loadClips() {
  if (!loading) {
    loading = (typeof fetch === "function" ? fetch(BASE + "index.json", { cache: "no-cache" }) : Promise.reject())
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { clips = new Set(Array.isArray(j?.clips) ? j.clips : []); })
      .catch(() => { clips = new Set(); });
  }
  return loading;
}
export const hasClip = (lang, text) => Boolean(clips?.has(clipKey(lang, text)));
export const clipCount = () => clips?.size || 0;

function audio() {
  if (!player && typeof Audio !== "undefined") player = new Audio();
  return player;
}
// Unlock the shared element on the first tap (iOS Safari blocks programmatic play otherwise).
if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
  const unlock = () => {
    const a = audio();
    if (a && !a.src) {
      a.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
      a.play().then(() => a.pause()).catch(() => {});
    }
    window.removeEventListener("pointerdown", unlock, true);
    window.removeEventListener("keydown", unlock, true);
  };
  window.addEventListener("pointerdown", unlock, true);
  window.addEventListener("keydown", unlock, true);
}

async function urlFor(key) {
  if (blobs.has(key)) return blobs.get(key);
  const r = await fetch(`${BASE}${key}.mp3`); // whole file (no Range) so the service worker can keep it offline
  if (!r.ok) throw new Error("clip " + r.status);
  const url = URL.createObjectURL(await r.blob());
  blobs.set(key, url);
  if (blobs.size > 40) { const [k, u] = blobs.entries().next().value; URL.revokeObjectURL(u); blobs.delete(k); }
  return url;
}

/** Word start positions, for the approximate highlight in story mode. */
const wordStarts = (t) => { const out = []; const re = /\S+/g; let m; while ((m = re.exec(t))) out.push(m.index); return out; };

/**
 * Play the clip for (lang, text) if there is one. Returns false straight away when there is no clip,
 * so the caller can use speech synthesis instead. `fallback` runs if the clip fails to load or play.
 */
export function playClip(lang, text, { rate = 0.95, onend, onboundary, fallback } = {}) {
  const key = clipKey(lang, text);
  if (!clips?.has(key) || !audio()) return false;
  const my = ++job;
  const a = audio();
  const plain = normSay(text);
  const starts = onboundary ? wordStarts(plain) : [];
  let lastWord = -1;
  a.onended = a.ontimeupdate = a.onerror = null;
  urlFor(key).then((url) => {
    if (my !== job) return;
    a.src = url;
    a.playbackRate = Math.min(2, Math.max(0.5, rate / 0.95)); // clips are recorded at 0.95
    a.ontimeupdate = () => {
      if (!onboundary || !a.duration || my !== job) return;
      const at = (a.currentTime / a.duration) * plain.length;
      let w = 0;
      while (w + 1 < starts.length && starts[w + 1] <= at) w++;
      if (w !== lastWord) { lastWord = w; onboundary({ name: "word", charIndex: starts[w] }); }
    };
    a.onended = () => { if (my === job) onend?.(); };
    return a.play();
  }).catch(() => { if (my === job) fallback ? fallback() : onend?.(); });
  return true;
}

export function stopClip() {
  job++;
  if (player) { player.onended = player.ontimeupdate = null; try { player.pause(); } catch {} }
}
