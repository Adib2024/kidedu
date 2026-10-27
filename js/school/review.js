// Ulang Kaji Pintar — Leitner-style spaced repetition of questions a child got wrong.
// Stored per child in the key/value store (works in Demo and Supabase mode).
import { store } from "../store.js";
import { plain, correctOf } from "./qkit.js";
import { shuffle } from "../util.js";

const KEY = (childId) => `review:${childId}`;
const DAY = 86400e3;
/** Days until the next review after a correct answer in box n (box 5 → mastered, removed). */
export const BOX_DAYS = [0, 1, 3, 7, 14];
export const MAX_ITEMS = 80;

const idOf = (q) => {
  const s = plain(q.prompt) + "|" + correctOf(q) + "|" + (q.visual || "").length + (q.listen ? "|" + q.listen : "");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return "r" + (h >>> 0).toString(36);
};

export async function loadReview(childId) {
  const items = await store.kv(KEY(childId), []);
  return Array.isArray(items) ? items : [];
}
async function save(childId, items) {
  await store.setKv(KEY(childId), items.slice(-MAX_ITEMS), { immediate: true });
}

/** Add wrongly answered questions (box 1, due now). Already-known items drop back to box 1. */
export async function addMistakes(childId, questions, now = Date.now()) {
  if (!questions.length) return;
  const items = await loadReview(childId);
  for (const q of questions) {
    if (q.type === "match") continue; // pairs are re-practised in the chapter itself
    const id = idOf(q);
    const old = items.find((x) => x.id === id);
    const { topic, ...data } = q;
    if (old) Object.assign(old, { box: 1, due: now, misses: (old.misses || 1) + 1 });
    else items.push({ id, q: data, topic: topic || "", box: 1, due: now, misses: 1, added: now });
  }
  await save(childId, items);
}

export const dueItems = (items, now = Date.now()) => items.filter((x) => x.due <= now).sort((a, b) => a.due - b.due);

/** Pure Leitner step (exported for tests). */
export function stepItem(item, ok, now = Date.now()) {
  if (!ok) return { ...item, box: 1, due: now + DAY / 2, misses: (item.misses || 1) + 1 };
  const box = (item.box || 1) + 1;
  if (box > BOX_DAYS.length) return null; // mastered
  return { ...item, box, due: now + BOX_DAYS[box - 1] * DAY };
}

/** Apply the results of a review session: [{id, ok}]. Returns how many were mastered. */
export async function applyReview(childId, results, now = Date.now()) {
  let items = await loadReview(childId), mastered = 0;
  for (const { id, ok } of results) {
    const i = items.findIndex((x) => x.id === id);
    if (i < 0) continue;
    const next = stepItem(items[i], ok, now);
    if (next) items[i] = next; else { items.splice(i, 1); mastered++; }
  }
  await save(childId, items);
  return mastered;
}

/** Build a 10-question review round: due items first, topped up with other saved items, then with fresh questions. */
export function buildReviewRound(items, freshGen, n = 10, now = Date.now()) {
  const due = dueItems(items, now);
  const rest = shuffle(items.filter((x) => !due.includes(x)));
  const picked = [...due, ...rest].slice(0, n).map((x) => ({ ...x.q, reviewId: x.id, topic: x.topic }));
  while (picked.length < n && freshGen) picked.push(freshGen());
  return picked.slice(0, n);
}
