// Natural voice for Playora: synthesise every sentence from scripts/tts-texts.mjs with Google Cloud
// Text-to-Speech and write audio/<key>.mp3 + audio/index.json (the list the app checks before speaking).
//
//   node scripts/gen-audio.mjs --dry-run            # what would be made, how many characters (no key needed)
//   GOOGLE_TTS_API_KEY=… node scripts/gen-audio.mjs  # make the missing clips (existing ones are kept)
//   node scripts/gen-audio.mjs --dry-run --csv skrip-audio.csv   # the narration script as a spreadsheet
//
// Options (env): TTS_VOICE_MS (default ms-MY-Wavenet-A, female), TTS_VOICE_EN (default en-US-Neural2-F,
// female), TTS_RATE (0.95), TTS_MAX_CHARS (300000 per run — protects the free monthly quota),
// TTS_CONCURRENCY (4). --prune deletes clips that the app no longer uses.
// The API key is only ever read here (build machine / GitHub Actions secret) — never shipped to browsers.
import { mkdirSync, existsSync, writeFileSync, readdirSync, unlinkSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { collectTexts, charCount } from "./tts-texts.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = process.env.TTS_OUT || join(ROOT, "audio");
const args = new Set(process.argv.slice(2));
const DRY = args.has("--dry-run");
const KEY = process.env.GOOGLE_TTS_API_KEY || "";
const VOICES = {
  ms: { languageCode: "ms-MY", name: process.env.TTS_VOICE_MS || "ms-MY-Wavenet-A" },
  en: { languageCode: "en-US", name: process.env.TTS_VOICE_EN || "en-US-Neural2-F" },
};
const RATE = Number(process.env.TTS_RATE || 0.95); // js/voice.js assumes 0.95 when matching playback speed
const MAX_CHARS = Number(process.env.TTS_MAX_CHARS || 300000);
const CONCURRENCY = Number(process.env.TTS_CONCURRENCY || 4);
const ENDPOINT = process.env.TTS_ENDPOINT || "https://texttospeech.googleapis.com/v1/text:synthesize";

const file = (key) => join(OUT, `${key}.mp3`);
const { texts, skipped } = collectTexts();
mkdirSync(OUT, { recursive: true });
const todo = texts.filter((t) => !existsSync(file(t.key)));

const bySource = {};
for (const t of todo) { const k = t.source.split(":")[0]; bySource[k] = (bySource[k] || 0) + t.text.length; }
console.log(`clips: ${texts.length} needed · ${texts.length - todo.length} already made · ${todo.length} to make (${charCount(todo)} characters)`);
console.log("characters to make by section:", bySource);
if (skipped.length) console.log(`left to the device voice (too many variations): ${skipped.length} generators, e.g. ${skipped.slice(0, 3).map((s) => s.source).join("; ")}`);

function writeIndex() {
  const have = new Set(readdirSync(OUT).filter((f) => /^[0-9a-f]{16}\.mp3$/.test(f) && statSync(join(OUT, f)).size > 0).map((f) => f.slice(0, 16)));
  const clips = texts.map((t) => t.key).filter((k) => have.has(k)).sort();
  writeFileSync(join(OUT, "index.json"), JSON.stringify({ version: 1, voices: VOICES, rate: RATE, clips }));
  return clips.length;
}

if (args.has("--prune")) {
  const keep = new Set(texts.map((t) => t.key));
  let n = 0;
  for (const f of readdirSync(OUT)) if (/^[0-9a-f]{16}\.mp3$/.test(f) && !keep.has(f.slice(0, 16))) { unlinkSync(join(OUT, f)); n++; }
  console.log(`pruned ${n} unused clips`);
}

// --csv <file>: the full narration script (for review, or to record a human voice with the same file names)
const csvAt = process.argv.indexOf("--csv");
if (csvAt > 0) {
  const path = process.argv[csvAt + 1];
  const cell = (v) => `"${String(v).replace(/"/g, '""')}"`;
  writeFileSync(path, "\ufeff" + ["fail,bahasa,bahagian,teks", ...texts.map((t) => [`${t.key}.mp3`, t.lang, t.source, t.text].map(cell).join(","))].join("\n"));
  console.log(`wrote ${texts.length} lines to ${path}`);
}

if (DRY) { console.log(`dry run — index lists ${writeIndex()} clips that exist`); process.exit(0); }
if (!KEY) {
  console.log("GOOGLE_TTS_API_KEY not set — no clips made; the app keeps using the device voice for missing sentences.");
  console.log(`index lists ${writeIndex()} clips`);
  process.exit(0);
}

async function synth(t, attempt = 0) {
  const r = await fetch(`${ENDPOINT}?key=${encodeURIComponent(KEY)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input: { text: t.text }, voice: VOICES[t.lang], audioConfig: { audioEncoding: "MP3", speakingRate: RATE, sampleRateHertz: 24000 } }),
  });
  if (r.status === 429 || r.status >= 500) {
    if (attempt >= 5) throw new Error(`HTTP ${r.status} after retries`);
    await new Promise((res) => setTimeout(res, 1000 * 2 ** attempt));
    return synth(t, attempt + 1);
  }
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${j.error?.message || "error"}`);
  if (!j.audioContent) throw new Error("no audio in reply");
  writeFileSync(file(t.key), Buffer.from(j.audioContent, "base64"));
}

let budget = MAX_CHARS, made = 0, failed = 0, fatal = null;
const queue = todo.filter((t) => { if (t.text.length > budget) return false; budget -= t.text.length; return true; });
if (queue.length < todo.length) console.log(`TTS_MAX_CHARS=${MAX_CHARS}: making ${queue.length} now, the rest on the next run`);
async function worker() {
  while (queue.length && !fatal) {
    const t = queue.shift();
    try { await synth(t); made++; if (made % 200 === 0) console.log(`… ${made} made`); }
    catch (e) {
      failed++;
      // a wrong key / disabled API fails every request: stop instead of burning through the list
      if (/HTTP (400|401|403)/.test(e.message) && made === 0) fatal = e;
      else console.warn(`skip "${t.text.slice(0, 50)}": ${e.message}`);
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
const listed = writeIndex();
if (fatal) { console.error(`Google TTS refused the request: ${fatal.message}`); console.error("Check that the key is valid and the Cloud Text-to-Speech API is enabled for its project."); process.exit(1); }
console.log(`made ${made} clips, ${failed} failed · index lists ${listed} of ${texts.length}`);
