// Kedai Pipi: children spend earned stars on looks for Pipi Panda (cosmetic only — nothing to buy with money).
// Stored per child in the key/value store: { owned: [id], wear: { slot: id }, spent: n }.
// Stickers and badges keep counting all stars ever earned; only the spendable balance goes down.
import { store } from "./store.js";
import { setOutfit } from "./mascot.js";

const K = "#2d2238";
export const SLOTS = [
  { id: "kepala", title: "Kepala", emoji: "🎩" },
  { id: "mata", title: "Mata", emoji: "👓" },
  { id: "leher", title: "Leher", emoji: "🧣" },
  { id: "latar", title: "Latar", emoji: "🖼️" },
];
// svg is drawn in the mascot's 120×120 space; latar is drawn behind Pipi, everything else in front
export const ITEMS = [
  { id: "reben", slot: "kepala", name: "Reben Merah Jambu", price: 5, svg: `<g transform="translate(90 18) rotate(20)"><path d="M0 0l-13-9v18zM0 0l13-9v18z" fill="#ff4f9a" stroke="${K}" stroke-width="2" stroke-linejoin="round"/><circle r="4.5" fill="#ff86bd" stroke="${K}" stroke-width="2"/></g>` },
  { id: "topi", slot: "kepala", name: "Topi Biru", price: 10, svg: `<path d="M33 35q27-34 54 0z" fill="#3b82f6" stroke="${K}" stroke-width="2.5" stroke-linejoin="round"/><path d="M82 33q17-1 24 6h-22z" fill="#1d4ed8" stroke="${K}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="60" cy="16" r="3" fill="#1d4ed8"/>` },
  { id: "topi-parti", slot: "kepala", name: "Topi Parti", price: 15, svg: `<path d="M45 32L60 2l15 30z" fill="#8b5cf6" stroke="${K}" stroke-width="2.5" stroke-linejoin="round"/><path d="M50 23h20M55 13h10" stroke="#ffd23f" stroke-width="3.5" stroke-linecap="round"/><circle cx="60" cy="3" r="4.5" fill="#ffd23f" stroke="${K}" stroke-width="2"/>` },
  { id: "fon-kepala", slot: "kepala", name: "Fon Kepala", price: 20, svg: `<path d="M17 64q0-54 43-54t43 54" fill="none" stroke="${K}" stroke-width="5" stroke-linecap="round"/><rect x="9" y="54" width="15" height="25" rx="7" fill="#f97316" stroke="${K}" stroke-width="2.5"/><rect x="96" y="54" width="15" height="25" rx="7" fill="#f97316" stroke="${K}" stroke-width="2.5"/>` },
  { id: "mahkota", slot: "kepala", name: "Mahkota Raja", price: 40, svg: `<path d="M37 31l4-21 10 12 9-17 9 17 10-12 4 21z" fill="#ffd23f" stroke="#b07a00" stroke-width="2.5" stroke-linejoin="round"/><circle cx="60" cy="24" r="3.4" fill="#ff4f6d"/><circle cx="46" cy="26" r="2.4" fill="#38bdf8"/><circle cx="74" cy="26" r="2.4" fill="#38bdf8"/>` },
  { id: "cermin-mata", slot: "mata", name: "Cermin Mata Bulat", price: 8, svg: `<g fill="rgba(255,255,255,.18)" stroke="${K}" stroke-width="3"><circle cx="42" cy="60" r="13"/><circle cx="78" cy="60" r="13"/></g><path d="M55 58q5-4 10 0M29 57l-11-4M91 57l11-4" fill="none" stroke="${K}" stroke-width="3" stroke-linecap="round"/>` },
  { id: "cermin-gelap", slot: "mata", name: "Cermin Mata Hitam", price: 15, svg: `<path d="M27 52h29q0 17-14.5 17T27 52zM64 52h29q0 17-14.5 17T64 52z" fill="#1f1530" stroke="${K}" stroke-width="2.5" stroke-linejoin="round"/><path d="M56 55h8M27 53l-9-3M93 53l9-3" stroke="${K}" stroke-width="3" stroke-linecap="round"/><path d="M33 57h9M70 57h9" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".55"/>` },
  { id: "tali-kupu", slot: "leher", name: "Tali Leher Kupu-kupu", price: 8, svg: `<path d="M60 106l-15-9v18zM60 106l15-9v18z" fill="#0ea5e9" stroke="${K}" stroke-width="2.2" stroke-linejoin="round"/><circle cx="60" cy="106" r="4.5" fill="#38bdf8" stroke="${K}" stroke-width="2"/>` },
  { id: "selendang", slot: "leher", name: "Selendang Merah", price: 12, svg: `<path d="M25 94q35 22 70 0l3 10q-38 22-76 0z" fill="#ef4444" stroke="${K}" stroke-width="2.5" stroke-linejoin="round"/><path d="M76 104l7 14 9-4-6-14z" fill="#dc2626" stroke="${K}" stroke-width="2.5" stroke-linejoin="round"/>` },
  { id: "pingat", slot: "leher", name: "Pingat Emas", price: 30, svg: `<path d="M48 92l12 14 12-14" fill="none" stroke="#2563eb" stroke-width="5" stroke-linejoin="round"/><circle cx="60" cy="109" r="8" fill="#ffd23f" stroke="#b07a00" stroke-width="2.5"/><path d="M60 104l1.6 3.4 3.6.4-2.7 2.4.8 3.6-3.3-1.9-3.3 1.9.8-3.6-2.7-2.4 3.6-.4z" fill="#fff6c2"/>` },
  { id: "latar-langit", slot: "latar", name: "Langit Biru", price: 6, svg: `<circle cx="60" cy="62" r="58" fill="#cfeaff"/><ellipse cx="24" cy="24" rx="12" ry="6" fill="#fff"/><ellipse cx="100" cy="98" rx="11" ry="5" fill="#fff"/>` },
  { id: "latar-hutan", slot: "latar", name: "Hutan Buluh", price: 10, svg: `<circle cx="60" cy="62" r="58" fill="#c9f0a8"/><path d="M12 112V20M108 112V22" stroke="#5fae3a" stroke-width="6" stroke-linecap="round"/><path d="M12 50l12-8M108 70l-12-8M12 84l11-6" stroke="#5fae3a" stroke-width="3" stroke-linecap="round"/>` },
  { id: "latar-pelangi", slot: "latar", name: "Pelangi", price: 18, svg: `<circle cx="60" cy="62" r="58" fill="#fff4fb"/><g fill="none" stroke-width="6"><path d="M6 96a54 54 0 0 1 108 0" stroke="#ff6b6b"/><path d="M13 96a47 47 0 0 1 94 0" stroke="#ffd23f"/><path d="M20 96a40 40 0 0 1 80 0" stroke="#7ccf2e"/><path d="M27 96a33 33 0 0 1 66 0" stroke="#4fa8ff"/></g>` },
  { id: "latar-angkasa", slot: "latar", name: "Angkasa Lepas", price: 25, svg: `<circle cx="60" cy="62" r="58" fill="#2b2255"/><g fill="#fff"><circle cx="18" cy="40" r="1.8"/><circle cx="104" cy="30" r="2.2"/><circle cx="96" cy="100" r="1.6"/><circle cx="26" cy="96" r="2"/><circle cx="60" cy="10" r="1.4"/></g><circle cx="102" cy="58" r="7" fill="#f59e0b"/><ellipse cx="102" cy="58" rx="12" ry="3" fill="none" stroke="#fcd34d" stroke-width="1.6"/>` },
];
export const itemById = (id) => ITEMS.find((x) => x.id === id) || null;

const key = (childId) => `shop:${childId}`;
const blank = () => ({ owned: [], wear: {}, spent: 0 });

function clean(raw) {
  const s = { ...blank(), ...(raw && typeof raw === "object" ? raw : {}) };
  s.owned = Array.isArray(s.owned) ? s.owned.filter((id) => itemById(id)) : [];
  s.wear = Object.fromEntries(Object.entries(s.wear || {}).filter(([slot, id]) => itemById(id)?.slot === slot && s.owned.includes(id)));
  s.spent = Math.max(0, Number(s.spent) || 0);
  return s;
}

export async function loadShop(childId) {
  return childId ? clean(await store.kv(key(childId), null)) : blank(); // store.kv caches per session
}
/** Stars the child can still spend. */
export const balance = (childId, shop) => Math.max(0, store.totalStars(childId) - (shop?.spent || 0));

/** Pure: front/back SVG layers for a "wear" map (exported for tests). */
export function outfitLayers(wear = {}) {
  const items = SLOTS.map((s) => itemById(wear[s.id])).filter(Boolean);
  return { back: items.filter((i) => i.slot === "latar").map((i) => i.svg).join(""), front: items.filter((i) => i.slot !== "latar").map((i) => i.svg).join(""), ids: items.map((i) => i.id) };
}

/** Dress Pipi for the active child (called before each page renders). */
export async function applyOutfit(child = store.activeChild) {
  if (!child) { setOutfit(null); return; }
  try { setOutfit(outfitLayers((await loadShop(child.id)).wear)); } catch { setOutfit(null); }
}

async function save(childId, shop) {
  if ((await store.setKv(key(childId), shop, { immediate: true })) === false) throw new Error("Tidak dapat disimpan. Cuba lagi.");
}

export async function buyItem(childId, id) {
  const item = itemById(id);
  const shop = await loadShop(childId);
  if (!item) throw new Error("Barang tidak dijumpai.");
  if (shop.owned.includes(id)) return shop;
  if (balance(childId, shop) < item.price) throw new Error(`Perlu ${item.price - balance(childId, shop)} ⭐ lagi.`);
  const next = { ...shop, owned: [...shop.owned, id], spent: shop.spent + item.price, wear: { ...shop.wear, [item.slot]: id } };
  await save(childId, next);
  return next;
}

/** Wear an owned item, or take it off when it is already worn. */
export async function toggleWear(childId, id) {
  const item = itemById(id);
  const shop = await loadShop(childId);
  if (!item || !shop.owned.includes(id)) return shop;
  const wear = { ...shop.wear };
  if (wear[item.slot] === id) delete wear[item.slot]; else wear[item.slot] = id;
  const next = { ...shop, wear };
  await save(childId, next);
  return next;
}
