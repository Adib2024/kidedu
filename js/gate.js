// Parental gate: a question a young child can't answer, in front of the parent areas
// (Zon Ibu, report, settings, child profiles, planner…). Not a security boundary — the
// account password is — just a speed bump so children don't wander into adult pages.
const KEY = "ppl_parent_ok";
const OFF = "ppl_gate_off";
export const GATE_TTL = 10 * 60 * 1000; // stays open 10 min after the last parent page
export const LOCK_AFTER = 3;
export const LOCK_MS = 30 * 1000;

const ss = () => { try { return globalThis.sessionStorage; } catch { return null; } };
const ls = () => { try { return globalThis.localStorage; } catch { return null; } };

/** Two single-digit factors 6–9: product 36–81, beyond what a 3–7 year old can work out. */
export function makeChallenge(rand = Math.random) {
  const a = 6 + Math.floor(rand() * 4);
  const b = 6 + Math.floor(rand() * 4);
  return { a, b, answer: a * b };
}

export function checkAnswer(ch, input) {
  const n = String(input ?? "").trim();
  return /^\d{1,3}$/.test(n) && Number(n) === ch.answer;
}

export function gateEnabled() { return ls()?.getItem(OFF) !== "1"; }
export function setGateEnabled(on) { try { on ? ls().removeItem(OFF) : ls().setItem(OFF, "1"); } catch {} }

export function parentOk(now = Date.now()) {
  const t = Number(ss()?.getItem(KEY) || 0);
  return t > 0 && now - t < GATE_TTL;
}
/** Mark (or refresh) the parent session. */
export function markParent(now = Date.now()) { try { ss().setItem(KEY, String(now)); } catch {} }
export function closeGate() { try { ss().removeItem(KEY); } catch {} }
