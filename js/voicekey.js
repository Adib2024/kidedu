// Shared by the app (js/voice.js) and the generator (scripts/gen-audio.mjs): which pre-recorded clip
// belongs to a spoken sentence. The key only depends on the language and the normalised text.
export const normSay = (t) => String(t ?? "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
export const sayLang = (lang) => (lang === "en" ? "en" : "ms");

export function clipKey(lang, text) {
  const s = `${sayLang(lang)}|${normSay(text)}`;
  let a = 0x811c9dc5, b = 5381;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    a = Math.imul(a ^ c, 0x01000193);
    b = (Math.imul(b, 33) + c) | 0;
  }
  return (a >>> 0).toString(16).padStart(8, "0") + (b >>> 0).toString(16).padStart(8, "0");
}
