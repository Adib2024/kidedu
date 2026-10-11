import { test } from "node:test";
import assert from "node:assert/strict";
import { installEnv } from "./_env.mjs";
installEnv();
const G = await import("../../js/gate.js");

test("challenge: factors 6–9, product needs real multiplication", () => {
  for (const r of [0, 0.249, 0.5, 0.999]) {
    const c = G.makeChallenge(() => r);
    assert.ok(c.a >= 6 && c.a <= 9 && c.b >= 6 && c.b <= 9);
    assert.equal(c.answer, c.a * c.b);
    assert.ok(c.answer >= 36);
  }
});

test("answers: only the exact number passes", () => {
  const c = { a: 7, b: 8, answer: 56 };
  assert.equal(G.checkAnswer(c, "56"), true);
  assert.equal(G.checkAnswer(c, " 56 "), true);
  for (const bad of ["", "5", "57", "56.0", "5 6", "fifty-six", null, "0056"]) assert.equal(G.checkAnswer(c, bad), false, String(bad));
});

test("parent session: opens, slides, expires, closes", () => {
  const t = 1_000_000;
  assert.equal(G.parentOk(t), false);
  G.markParent(t);
  assert.equal(G.parentOk(t + G.GATE_TTL - 1), true);
  assert.equal(G.parentOk(t + G.GATE_TTL), false);
  G.markParent(t + G.GATE_TTL - 1); // refreshed by visiting a parent page
  assert.equal(G.parentOk(t + G.GATE_TTL + 1000), true);
  G.closeGate();
  assert.equal(G.parentOk(t), false);
});

test("gate can be switched off and on (stored per device)", () => {
  assert.equal(G.gateEnabled(), true);
  G.setGateEnabled(false);
  assert.equal(G.gateEnabled(), false);
  G.setGateEnabled(true);
  assert.equal(G.gateEnabled(), true);
});
