import { test } from "node:test";
import assert from "node:assert/strict";
import { installEnv } from "./_env.mjs";
installEnv();
const { clipKey, normSay } = await import("../../js/voicekey.js");
const { collectTexts, charCount, SMALL_SET } = await import("../../scripts/tts-texts.mjs");
const { TIPS, tipBlocks } = await import("../../js/data/tips.js");

test("clip keys: stable, language-aware, ignore markup and spacing", () => {
  assert.match(clipKey("ms", "Hai"), /^[0-9a-f]{16}$/);
  assert.equal(clipKey("ms", "Satu  dua <b>tiga</b>"), clipKey("ms", "Satu dua tiga"));
  assert.notEqual(clipKey("ms", "cat"), clipKey("en", "cat"));
  assert.equal(clipKey(undefined, "x"), clipKey("ms", "x"));
  assert.equal(normSay("  a&nbsp;b \n\t c <i>d</i> "), "a b c d");
});

test("natural-voice script list: deterministic, covers stories/tips/listening words, stays inside the free quota", () => {
  const a = collectTexts(), b = collectTexts();
  assert.deepEqual(a.texts.map((t) => t.key), b.texts.map((t) => t.key), "same list every run (clips are reused)");
  const keys = new Set(a.texts.map((t) => t.key));
  for (const x of tipBlocks(TIPS[0])) assert.ok(keys.has(clipKey("ms", x)), `tip sentence: ${x}`);
  assert.ok(keys.has(clipKey("ms", "kucing")), "BM listening word");
  assert.ok(keys.has(clipKey("en", "elephant")), "English listening word");
  assert.ok(keys.has(clipKey("ms", "seratus empat puluh tujuh")), "number words");
  for (const t of a.texts) { assert.ok(!/[<>]/.test(t.text), `markup in "${t.text}"`); assert.ok(t.lang === "ms" || t.lang === "en"); }
  assert.ok(charCount(a.texts) < 400000, `characters ${charCount(a.texts)}`);
  assert.ok(a.skipped.every((s) => s.variants > SMALL_SET));
});
