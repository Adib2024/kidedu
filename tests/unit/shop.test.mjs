import { test } from "node:test";
import assert from "node:assert/strict";
import { installEnv } from "./_env.mjs";
installEnv();
const { store } = await import("../../js/store.js");
const shop = await import("../../js/shop.js");
const { mascot } = await import("../../js/mascot.js");

test("Kedai Pipi: items are valid and every slot is stocked", () => {
  assert.equal(new Set(shop.ITEMS.map((i) => i.id)).size, shop.ITEMS.length);
  for (const s of shop.SLOTS) assert.ok(shop.ITEMS.some((i) => i.slot === s.id), s.id);
  for (const i of shop.ITEMS) {
    assert.ok(i.price > 0 && Number.isInteger(i.price), i.id);
    assert.ok(i.svg.startsWith("<") && !/<script|on\w+=|href/i.test(i.svg), `${i.id}: plain SVG only`);
  }
});

test("Kedai Pipi: buy with stars, wear one item per slot, balance and stickers", async () => {
  await store.signUp({ name: "Ibu", email: "kedai@t.my", password: "123456" });
  const c = await store.addChild({ name: "Adik", age: 8, avatar: "🐼" });
  await assert.rejects(shop.buyItem(c.id, "reben"), /Perlu 5 ⭐ lagi/);
  for (let i = 0; i < 6; i++) await store.record(`game:x:${i}`, "games", { stars: 3, score: 10, total: 10 }); // 18 ⭐
  const stickers = store.stickerCount(c.id);
  let s = await shop.buyItem(c.id, "topi"); // 10
  assert.equal(shop.balance(c.id, s), 8);
  assert.deepEqual(s.wear, { kepala: "topi" }, "worn straight away");
  s = await shop.buyItem(c.id, "reben"); // 5 → same slot replaces the cap
  assert.deepEqual(s.wear, { kepala: "reben" });
  assert.equal(shop.balance(c.id, s), 3);
  await assert.rejects(shop.buyItem(c.id, "mahkota"), /Perlu 37 ⭐ lagi/);
  s = await shop.buyItem(c.id, "reben"); // owned: no double charge
  assert.equal(shop.balance(c.id, s), 3);
  s = await shop.toggleWear(c.id, "topi");
  assert.deepEqual(s.wear, { kepala: "topi" });
  s = await shop.toggleWear(c.id, "topi");
  assert.deepEqual(s.wear, {}, "tap again to take it off");
  s = await shop.toggleWear(c.id, "mahkota"); // not owned → ignored
  assert.deepEqual(s.wear, {});
  assert.equal(store.stickerCount(c.id), stickers, "spending does not remove stickers");
  assert.equal(store.totalStars(c.id), 18);
  // saved per child
  const again = await shop.loadShop(c.id);
  assert.deepEqual(again.owned.sort(), ["reben", "topi"]);
});

test("Kedai Pipi: outfit layers dress the mascot; tampered data is ignored", async () => {
  const look = shop.outfitLayers({ kepala: "mahkota", latar: "latar-langit", mata: "nope" });
  assert.deepEqual(look.ids, ["mahkota", "latar-langit"]);
  const svg = mascot("happy", 96, "", { outfit: look });
  assert.match(svg, /data-wear="mahkota latar-langit"/);
  assert.ok(svg.indexOf("#cfeaff") < svg.indexOf("ellipse"), "background drawn behind Pipi");
  assert.ok(!/data-wear/.test(mascot("happy", 96, "", { outfit: null })));
  await store.setKv("shop:tamper", { owned: ["mahkota", "x"], wear: { kepala: "mahkota", mata: "mahkota" }, spent: -50 });
  const s = await shop.loadShop("tamper");
  assert.deepEqual(s, { owned: ["mahkota"], wear: { kepala: "mahkota" }, spent: 0 });
});
