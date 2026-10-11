// End-to-end tests in headless Chromium. Run: node tests/e2e/run.mjs   (CHROME_PATH=... to override)
import assert from "node:assert/strict";
import { launch, chromePath } from "./cdp.mjs";
import { staticServer, mockSupabase } from "./servers.mjs";
import { buildCatalog } from "../../scripts/activity-catalog.mjs";

if (!chromePath()) { console.log("SKIP: no Chromium found (set CHROME_PATH)"); process.exit(0); }

const APP = 4310, CLOUD_APP = 4311, SB = 4312;
const servers = [
  await staticServer(APP),
  await staticServer(CLOUD_APP, { stripCsp: true, config: `window.PPL_CONFIG = { SUPABASE_URL: "http://127.0.0.1:${SB}", SUPABASE_ANON_KEY: "anon-test" };` }),
];
const sb = await mockSupabase(SB, { catalog: await buildCatalog() });
servers.push(sb);
const URL_ = `http://127.0.0.1:${APP}/`;
const CLOUD = `http://127.0.0.1:${CLOUD_APP}/`;

const results = [];
const only = process.argv[2];
async function scenario(name, fn, { width = 412, allow = null } = {}) {
  if (only && !name.includes(only)) return;
  const b = await launch({ width });
  const t0 = Date.now();
  try {
    await fn(b);
    const errs = b.errors.filter((e) => !/fonts\.(googleapis|gstatic)|ERR_TUNNEL|ERR_NAME|net::ERR_FAILED.*fonts/.test(e) && !(allow && allow.test(e)));
    assert.deepEqual(errs, [], "console errors");
    results.push({ name, ok: true, ms: Date.now() - t0 });
  } catch (e) {
    results.push({ name, ok: false, ms: Date.now() - t0, err: e.message.split("\n").slice(0, 6).join("\n") });
  } finally { b.close(); }
}
const guest = async (b, base = URL_) => {
  await b.goto(base + "#/");
  await b.eval("localStorage.setItem('ppl_autospeak','off'); localStorage.setItem('ppl_sound','off')");
  await b.click("[data-guest]");
  await b.wait(900);
  assert.equal(await b.eval("location.hash"), "#/app");
};
/** Answer the current quiz until the result card shows (always clicks the first option). */
const playQuiz = async (b, max = 25) => {
  for (let i = 0; i < max; i++) {
    if (await b.exists(".result")) return;
    const clicked = await b.eval(`(()=>{const o=document.querySelector('.opt:not([disabled])'); if(!o) return false; o.click(); return true})()`);
    await b.wait(clicked ? 1850 : 300);
  }
  throw new Error("quiz did not finish");
};

// ------------------------------------------------------------------ navigation & shell
await scenario("landing renders with Playora branding, no CSP violations", async (b) => {
  await b.goto(URL_);
  await b.waitFor(".logo-type");
  assert.match(await b.eval("document.title"), /Playora/);
  assert.match(await b.text(".logo-type"), /Play\s*ora/);
  assert.equal(await b.eval("document.querySelectorAll('.lp-sec').length"), 8);
  assert.equal(await b.eval("[...document.querySelectorAll('.lp-sec-h .small')].reduce((n, e) => n + parseInt(e.textContent), 0)"), 70);
});

await scenario("protected route redirects to login and returns after sign-in", async (b) => {
  await b.goto(URL_ + "#/");
  await b.eval("localStorage.setItem('ppl_autospeak','off')");
  await b.hash("/games/bijak-sifir");
  assert.equal(await b.eval("location.hash"), "#/masuk?next=%2Fgames%2Fbijak-sifir");
  await b.click("a[href^='#/daftar']");
  await b.eval(`(()=>{const f=document.querySelector('[data-f]'); f.name.value='Ibu'; f.email.value='ibu@e2e.my'; f.password.value='rahsia123'; f.requestSubmit();})()`);
  await b.wait(1500);
  assert.equal(await b.eval("location.hash"), "#/anak?baru=1");
  await b.eval(`(()=>{const f=document.querySelector('[data-f]'); f.name.value='Aisyah'; f.requestSubmit();})()`);
  await b.wait(900);
  assert.equal(await b.eval("location.hash"), "#/app");
  await b.hash("/tetapan");
  await b.click("[data-out]");
  await b.wait(500);
  await b.hash("/masuk?next=/buku");
  await b.eval(`(()=>{const f=document.querySelector('[data-f]'); f.email.value='ibu@e2e.my'; f.password.value='salah'; f.requestSubmit();})()`);
  await b.wait(1200);
  assert.match(await b.text("[data-err]"), /salah/);
  await b.eval(`(()=>{const f=document.querySelector('[data-f]'); f.password.value='rahsia123'; f.requestSubmit();})()`);
  await b.wait(1500);
  assert.equal(await b.eval("location.hash"), "#/buku");
});

await scenario("login 'next' cannot redirect outside the app", async (b) => {
  await guest(b);
  await b.hash("/masuk?next=//evil.example");
  assert.equal(await b.eval("location.hash"), "#/app");
});

await scenario("unknown routes and ids show a 404 page", async (b) => {
  await guest(b);
  for (const h of ["/tiada-halaman", "/games/tiada", "/buku/tiada", "/peta/tiada", "/planner/tiada", "/ibu/tiada", "/tips/tiada", "/worksheet/tiada", "/pensel/tiada"]) {
    await b.hash(h);
    assert.match(await b.text(), /Halaman tidak dijumpai/i, h);
  }
});

await scenario("page refresh keeps route and session", async (b) => {
  await guest(b);
  await b.hash("/games/bijak-sifir");
  await b.reload();
  assert.equal(await b.eval("location.hash"), "#/games/bijak-sifir");
  assert.ok(await b.exists(".level"));
});

await scenario("topic search: results, zero-result state, clear", async (b) => {
  await guest(b);
  await b.eval(`(()=>{const i=document.querySelector('#topic-q'); i.value='sifir'; i.dispatchEvent(new Event('input'))})()`);
  assert.match(await b.text("[data-results]"), /Bijak Sifir/);
  await b.eval(`(()=>{const i=document.querySelector('#topic-q'); i.value='qwertyzz'; i.dispatchEvent(new Event('input'))})()`);
  assert.match(await b.text("[data-results]"), /Tiada topik/);
  await b.click("[data-clear]");
  assert.equal(await b.eval("document.querySelector('[data-results]').hidden"), true);
  assert.equal(await b.eval("document.querySelector('[data-zones]').hidden"), false);
});

// ------------------------------------------------------------------ games
await scenario("quiz: play to the end, result, progress saved, replay", async (b) => {
  await guest(b);
  await b.hash("/games/bijak-sifir?lv=0");
  await playQuiz(b);
  assert.match(await b.text(".result"), /Markah: \d+ \/ 10/);
  const saved = await b.eval(`(()=>{const k=Object.keys(localStorage).find(k=>k.startsWith('ppl_data_')); return JSON.parse(localStorage.getItem(k)).progress})()`);
  const row = Object.values(saved)[0]["game:bijak-sifir:0"];
  assert.equal(row.plays, 1);
  await b.eval(`[...document.querySelectorAll('.result button')].find(x=>/Main lagi/.test(x.textContent)).click()`);
  await b.wait(500);
  assert.ok(await b.exists(".opt"), "replay starts a new round");
});

await scenario("levels unlock only after earning a star", async (b) => {
  await guest(b);
  await b.hash("/games/hero-warna");
  assert.equal(await b.eval("document.querySelectorAll('.level.locked').length"), 5);
  await b.hash("/games/hero-warna?lv=3");
  assert.ok(await b.exists(".levels"), "locked level URL shows level list");
  await b.eval(`import('/js/store.js').then(m=>m.store.record('game:hero-warna:0','games',{stars:2,score:8,total:10}))`);
  await b.hash("/games");
  await b.hash("/games/hero-warna");
  assert.equal(await b.eval("document.querySelectorAll('.level.locked').length"), 4);
});

await scenario("leaving a quiz mid-answer stops it (no stray speech)", async (b) => {
  await guest(b);
  await b.eval("localStorage.setItem('ppl_autospeak','on'); window.__spoken=[]; const o=speechSynthesis.speak.bind(speechSynthesis); speechSynthesis.speak=(u)=>{window.__spoken.push(location.hash); o(u);}");
  await b.hash("/games/bijak-sifir?lv=0");
  await b.eval("document.querySelector('.opt').click(); location.hash='/buku'");
  await b.wait(2500);
  assert.deepEqual(await b.eval("window.__spoken.filter(h=>h==='#/buku')"), []);
});

await scenario("memory game completes and records stars", async (b) => {
  await guest(b);
  await b.hash("/games/ingat-padan?lv=0");
  await b.eval(`(async()=>{const by={}; document.querySelectorAll('.mem-card').forEach(c=>(by[c.querySelector('.front-f').textContent] ||= []).push(c));
    for (const [a,c] of Object.values(by)) { a.click(); await new Promise(r=>setTimeout(r,120)); c.click(); await new Promise(r=>setTimeout(r,250)); }})()`);
  await b.wait(1300);
  assert.match(await b.text(".result"), /Cemerlang/);
});

await scenario("map: locked station refused, station quiz + hidden objects work", async (b) => {
  await guest(b);
  await b.hash("/peta/pekan-duit?s=3");
  assert.ok(await b.exists(".map-wrap"), "locked station URL shows the map");
  await b.eval(`document.querySelector('.station[data-k="0"]').dispatchEvent(new MouseEvent('click',{bubbles:true}))`);
  await b.wait(600);
  assert.equal(await b.eval("location.hash"), "#/peta/pekan-duit?s=0");
  await playQuiz(b);
  await b.hash("/peta/awan-imaginasi?s=0");
  await b.eval(`(async()=>{ for (const e of [...document.querySelectorAll('.target')].map(x=>x.dataset.t)) { [...document.querySelectorAll('.scene .it')].find(x=>x.textContent===e).click(); await new Promise(r=>setTimeout(r,120)); } })()`);
  await b.wait(1300);
  assert.match(await b.text(".result"), /Cemerlang/);
});

await scenario("storage full: player is warned the result was not saved", async (b) => {
  await guest(b);
  await b.eval(`(()=>{ for (const size of [1<<20,1<<16,1<<12,1<<8,16]) { const s='x'.repeat(size); for(let i=0;i<5000;i++){ try{localStorage.setItem('fill'+size+'_'+i,s)}catch{break} } } })()`);
  await b.hash("/games/bijak-sifir?lv=0");
  await playQuiz(b);
  assert.match(await b.text(".result"), /belum disimpan/);
  await b.eval("Object.keys(localStorage).filter(k=>k.startsWith('fill')).forEach(k=>localStorage.removeItem(k))");
});

// ------------------------------------------------------------------ books, pensel, worksheets
await scenario("storybook: page through, quiz, stars", async (b) => {
  await guest(b);
  await b.hash("/buku/payung-pelangi");
  for (let i = 0; i < 7; i++) await b.click("[data-next]");
  await b.click("[data-quiz]");
  await playQuiz(b);
  assert.match(await b.text(".result"), /Markah: \d \/ 3/);
});

await scenario("tracing is scored (traced → stars, empty → rejected)", async (b) => {
  await guest(b);
  await b.hash("/pensel/tulis-nombor");
  await b.wait(600);
  await b.click("[data-check]");
  assert.match(await b.text("[data-res]"), /Surih lebih banyak/);
  await b.eval(`(()=>{const cv=document.querySelector('[data-draw]'); const r=cv.getBoundingClientRect(); const W=cv.width,H=cv.height;
    const t=document.createElement('canvas'); t.width=W; t.height=H; const x=t.getContext('2d'); const bg=document.querySelector('[data-bg]').getContext('2d');
    x.font=bg.font; x.textAlign='center'; x.textBaseline='middle'; x.fillText('0',W/2,H/2+10); const d=x.getImageData(0,0,W,H).data;
    for(let yy=0;yy<H;yy+=14) for(let xx=0;xx<W;xx+=14) if(d[(yy*W+xx)*4+3]>100){ const ev=(ty)=>cv.dispatchEvent(new PointerEvent(ty,{bubbles:true,pointerId:1,clientX:r.left+xx/W*r.width,clientY:r.top+yy/H*r.height})); ev('pointerdown'); ev('pointerup'); } })()`);
  await b.click("[data-check]");
  await b.wait(400);
  assert.match(await b.text("[data-res]"), /⭐/);
});

await scenario("worksheets render for every type and regenerate", async (b) => {
  await guest(b);
  for (const id of ["mewarna-nombor", "kira-lukis", "bentuk", "tracing-words", "colour-objects", "meet-letter", "latihan-matematik"]) {
    await b.hash("/worksheet/" + id);
    assert.ok((await b.text(".sheet")).length > 40, id);
    const before = await b.eval("document.querySelector('.sheet').innerHTML");
    await b.click("[data-new]");
    assert.ok(await b.exists(".sheet h2"), id + " after regenerate");
    void before;
  }
  await b.hash("/worksheet/tracing-words");
  await b.eval(`(()=>{const s=document.querySelector('[data-o=set]'); s.value='sendiri'; s.dispatchEvent(new Event('change')); const i=document.querySelector('[data-o=custom]'); i.value='<b>Aisyah</b>'; i.dispatchEvent(new Event('input'))})()`);
  assert.ok(!(await b.eval("document.querySelector('.sheet').innerHTML.includes('<b>Aisyah</b>')")), "custom text escaped");
});

// ------------------------------------------------------------------ planner & parent tools
await scenario("habit tracker: deleting a habit does not move ticks to another habit", async (b) => {
  await guest(b);
  await b.hash("/planner/tabiat");
  // tick day 1 of the 2nd habit ("Senaman 15 minit")
  await b.click('[data-h="1"][data-day="1"]');
  await b.eval("window.__confirm = 1");
  await b.click('[data-rm="0"]');
  await b.click("[data-yes]");
  await b.wait(500);
  assert.equal(await b.eval(`document.querySelector('tbody tr td.nm').textContent`), "Senaman 15 minit");
  assert.equal(await b.eval(`document.querySelector('[data-h="0"][data-day="1"]').classList.contains('on')`), true);
  assert.equal(await b.eval(`document.querySelector('[data-h="1"][data-day="1"]').classList.contains('on')`), false);
  await b.reload();
  assert.equal(await b.eval(`document.querySelector('[data-h="0"][data-day="1"]').classList.contains('on')`), true, "persists after refresh");
});

await scenario("child routine: completing all morning tasks gives a star; persists", async (b) => {
  await guest(b);
  await b.hash("/planner/rutin");
  const n = await b.eval("document.querySelectorAll('[data-p=pagi]').length");
  for (let i = 0; i < n; i++) {
    await b.eval(`(()=>{const c=document.querySelector('[data-p="pagi"][data-i="${i}"]'); c.checked=true; c.dispatchEvent(new Event('change'));})()`);
    await b.wait(300);
  }
  assert.match(await b.text(".child-chip"), /⭐ 1/);
  await b.reload();
  assert.equal(await b.eval("[...document.querySelectorAll('[data-p=pagi]')].every(c=>c.checked)"), true);
});

await scenario("planner CRUD: daily todos and shopping list persist", async (b) => {
  await guest(b);
  await b.hash("/planner/harian");
  await b.eval(`(()=>{const f=document.querySelector('[data-add]'); f.querySelector('input').value='Beli susu'; f.requestSubmit();})()`);
  await b.wait(300);
  await b.click("[data-chk]");
  await b.hash("/planner/menu");
  await b.eval(`(()=>{const f=document.querySelector('[data-add]'); f.text.value='Telur'; f.price.value='12.50'; f.requestSubmit();})()`);
  await b.wait(300);
  assert.match(await b.text(), /RM12\.50/);
  await b.reload();
  assert.match(await b.text(), /Telur/);
  await b.hash("/planner/harian");
  assert.equal(await b.eval("document.querySelector('[data-chk]').checked"), true);
  await b.click("[data-rm]");
  assert.equal(await b.exists("[data-chk]"), false, "todo deleted");
});

await scenario("journal: save, persists, delete needs confirmation", async (b) => {
  await guest(b);
  await b.hash("/ibu/luahan-ibu");
  await b.eval(`document.querySelector('[data-t]').value='Hari ini <script>x</script> penat'; document.querySelector('[data-save]').click()`);
  await b.wait(400);
  await b.reload();
  assert.match(await b.text(), /penat/);
  assert.equal(await b.eval("document.querySelectorAll('script:not([src])').length"), 0, "no injected script");
  await b.eval("document.querySelector('details').open=true");
  await b.click("[data-del]");
  assert.ok(await b.exists(".modal [data-yes]"), "confirmation shown");
  await b.eval("document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}))");
  assert.equal(await b.exists(".modal"), false, "Escape closes dialog");
  assert.match(await b.text(), /penat/, "not deleted on cancel");
});

await scenario("mom quiz completes and saves result", async (b) => {
  await guest(b);
  await b.hash("/ibu/bahasa-cinta");
  await b.click("[data-start]");
  for (let i = 0; i < 15; i++) await b.click("[data-k]");
  assert.match(await b.text(), /Bahasa cinta utama anda/);
  await b.reload();
  assert.match(await b.text(), /Keputusan lepas/);
});

await scenario("deleting a child removes its gallery data after confirmation", async (b) => {
  await guest(b);
  const id = await b.eval("import('/js/store.js').then(async m=>{ await m.store.setKv('gallery:'+m.store.activeChild.id,[{id:'1',src:'data:,',title:'t',date:'x'}],{immediate:true}); return m.store.activeChild.id })");
  await b.hash("/anak");
  await b.click("[data-edit]");
  await b.click("[data-del]");
  await b.click("[data-yes]");
  await b.wait(500);
  assert.equal(await b.eval(`Object.keys(localStorage).some(k=>k.includes(${JSON.stringify(id)}))`), false);
});

// ------------------------------------------------------------------ feedback
await scenario("feedback button hidden when no backend (demo, outside claude.ai)", async (b) => {
  await guest(b);
  await b.wait(500);
  assert.equal(await b.eval("document.querySelector('[data-fb]').hidden"), true);
});

await scenario("feedback with artifact db: validation, submit, owner summary", async (b) => {
  await b.addInitScript(`(() => {
    const store = {}; const subs = [];
    const snap = (id, v) => ({ id, exists: !!v, data: () => v, metadata: {} });
    const fire = () => subs.forEach(fn => fn({ docs: Object.entries(store).map(([p, v]) => snap(p.split('/')[1], v)) }));
    const db = Object.freeze({ doc: (p) => ({ get: async () => snap(p.split('/')[1], store[p]), set: async (v) => { store[p] = v; fire(); } }),
      collection: () => ({ onSnapshot: (fn) => { subs.push(fn); setTimeout(fire, 30); return () => {}; } }) });
    const user = Object.freeze({ id: async () => 'u_test', isOwner: async () => true, profiles: async (ids) => Object.fromEntries([].concat(ids).map(i => [i, { id: i, name: 'Penguji' }])) });
    window.claude = { use: async (n) => (n === 'db' ? db : n === 'user' ? user : null) };
  })()`);
  await guest(b);
  await b.wait(400);
  assert.equal(await b.eval("document.querySelector('[data-fb]').hidden"), false);
  await b.click("[data-fb]");
  await b.eval("document.querySelector('.modal [data-f]').requestSubmit()");
  assert.match(await b.text(".modal [data-err]"), /wajah/);
  await b.eval(`(()=>{const m=document.querySelector('.modal'); m.querySelector('[data-r="4"]').click(); m.querySelector('#fb-baiki').value='<img src=x onerror=alert(1)>'; m.querySelector('[data-f]').requestSubmit();})()`);
  await b.wait(500);
  assert.match(await b.text(".modal"), /Terima kasih/);
  await b.click("[data-ok]");
  await b.click("[data-fb]");
  await b.eval(`(()=>{const m=document.querySelector('.modal'); m.querySelector('[data-r="2"]').click(); m.querySelector('#fb-suka').value='lagi'; m.querySelector('[data-f]').requestSubmit();})()`);
  await b.wait(300);
  assert.match(await b.text(".modal [data-err]"), /Tunggu sebentar/, "cooldown prevents duplicate spam");
  await b.eval("document.querySelector('.modal [data-close]').click()");
  await b.hash("/maklum-balas");
  await b.wait(500);
  assert.match(await b.text("#view"), /1\s*Maklum balas/);
  assert.equal(await b.eval("!!document.querySelector('#view img[src=x]')"), false, "feedback text is not rendered as HTML");
});

// ------------------------------------------------------------------ cloud (Supabase REST) mode
await scenario("cloud mode: signup, child, progress & data sync, re-login on clean device", async (b) => {
  await b.goto(CLOUD + "#/daftar");
  await b.eval("localStorage.setItem('ppl_autospeak','off')");
  await b.eval(`(()=>{const f=document.querySelector('[data-f]'); f.name.value='Awan'; f.email.value='awan@e2e.my'; f.password.value='rahsia123'; f.requestSubmit();})()`);
  await b.wait(1200);
  await b.eval(`(()=>{const f=document.querySelector('[data-f]'); f.name.value='Danish'; f.requestSubmit();})()`);
  await b.wait(1000);
  await b.hash("/peta/awan-imaginasi?s=0");
  await b.eval(`(async()=>{ for (const e of [...document.querySelectorAll('.target')].map(x=>x.dataset.t)) { [...document.querySelectorAll('.scene .it')].find(x=>x.textContent===e).click(); await new Promise(r=>setTimeout(r,120)); } })()`);
  await b.wait(1500);
  await b.hash("/planner/syukur");
  await b.eval(`(()=>{const i=document.querySelector('[data-g="0"]'); i.value='Keluarga sihat'; i.dispatchEvent(new Event('input'))})()`);
  await b.wait(1200); // debounced cloud save
  await b.eval("localStorage.clear()");
  await b.goto("about:blank");
  await b.goto(CLOUD + "#/masuk");
  await b.eval(`(()=>{const f=document.querySelector('[data-f]'); f.email.value='awan@e2e.my'; f.password.value='rahsia123'; f.requestSubmit();})()`);
  await b.wait(1500);
  assert.match(await b.text(".child-chip"), /Danish/);
  assert.match(await b.text(".child-chip"), /⭐ 3/);
  await b.hash("/planner/syukur");
  assert.equal(await b.eval("document.querySelector('[data-g=\"0\"]').value"), "Keluarga sihat");
});

await scenario("cloud mode: expired session sends the user to login (no silent failures)", async (b) => {
  await b.goto(CLOUD + "#/daftar");
  await b.eval(`(()=>{const f=document.querySelector('[data-f]'); f.name.value='Sesi'; f.email.value='sesi@e2e.my'; f.password.value='rahsia123'; f.requestSubmit();})()`);
  await b.wait(1200);
  await b.eval(`(()=>{const f=document.querySelector('[data-f]'); f.name.value='Adik'; f.requestSubmit();})()`);
  await b.wait(900);
  sb.expireAll(); // server forgets every token; refresh is refused
  await b.hash("/planner/syukur");
  await b.wait(1500);
  assert.match(await b.eval("location.hash"), /^#\/masuk\?next=/);
  assert.match(await b.text("#toast"), /Sesi anda telah tamat/);
}, { allow: /status of (401|400) .*\/(rest\/v1\/user_kv|auth\/v1\/token)/ });

// ------------------------------------------------------------------ learning dashboard, worksheets, admin
await scenario("hub: daily missions, XP and data-based recommendations update after playing", async (b) => {
  await guest(b);
  await b.waitFor(".mission");
  assert.match(await b.text("[data-missions]"), /0\/2/);
  assert.match(await b.text("[data-recs]"), /Sesuai untuk umur 5/);
  await b.hash("/games/ingat-padan?lv=0");
  await b.eval(`(async()=>{const by={}; document.querySelectorAll('.mem-card').forEach(c=>(by[c.querySelector('.front-f').textContent] ||= []).push(c));
    for (const [a,c] of Object.values(by)) { a.click(); await new Promise(r=>setTimeout(r,120)); c.click(); await new Promise(r=>setTimeout(r,250)); }})()`);
  await b.waitFor(".result");
  assert.match(await b.text(".result"), /\+35 XP/);
  await b.hash("/app");
  await b.waitFor(".mission");
  assert.match(await b.text("[data-missions]"), /1\/2/);
  assert.match(await b.text(".xp-bar"), /35 \/ 100 XP/);
  assert.match(await b.text("[data-recs]"), /Ingat & Padan: 6 Pasang/);
});

await scenario("parent report: real attempts, weekly goal saved", async (b) => {
  await guest(b);
  await b.hash("/games/bijak-sifir?lv=0");
  await playQuiz(b);
  await b.hash("/laporan");
  await b.waitFor("[data-goal]");
  assert.match(await b.text("#view"), /Bijak Sifir — Sifir 2/);
  assert.match(await b.text("#view"), /1 \/ 5 aktiviti sejak Isnin/);
  await b.eval(`(()=>{const s=document.querySelector('[data-goal]'); s.value='3'; s.dispatchEvent(new Event('change'))})()`);
  await b.wait(600);
  await b.reload();
  await b.waitFor("[data-goal]");
  assert.equal(await b.eval("document.querySelector('[data-goal]').value"), "3");
});

await scenario("worksheet library: search, combined filters, favourites, empty state, reset", async (b) => {
  await guest(b);
  await b.hash("/worksheet");
  await b.waitFor("[data-fav]");
  await b.eval(`(()=>{const i=document.querySelector('#ws-q'); i.value='huruf'; i.dispatchEvent(new Event('input'))})()`);
  assert.match(await b.text("[data-count]"), /^1 daripada 7/);
  await b.eval(`(()=>{const i=document.querySelector('#ws-q'); i.value=''; i.dispatchEvent(new Event('input'))})()`);
  await b.click('[data-subj="matematik"]');
  await b.eval(`(()=>{const s=document.querySelector('#ws-age'); s.value='9'; s.dispatchEvent(new Event('change'))})()`);
  assert.match(await b.text("[data-count]"), /^1 daripada 7/, "matematik + umur 9");
  await b.click('[data-fav="latihan-matematik"]');
  await b.wait(300);
  await b.click("[data-reset]");
  await b.waitFor("[data-favonly]");
  await b.click("[data-favonly]");
  assert.match(await b.text("[data-count]"), /^1 daripada 7/, "favourite persisted");
  await b.eval(`(()=>{const i=document.querySelector('#ws-q'); i.value='zzz'; i.dispatchEvent(new Event('input'))})()`);
  assert.match(await b.text("[data-list]"), /Tiada worksheet sepadan/);
});

await scenario("admin page is refused for parents (demo and cloud)", async (b) => {
  await guest(b);
  await b.hash("/admin");
  await b.waitFor("h1");
  assert.match(await b.text("#view"), /Akses ditolak/);
});

await scenario("cloud: quiz is scored by the server; admin can hide an activity for everyone", async (b) => {
  await b.goto(CLOUD + "#/daftar");
  await b.eval("localStorage.setItem('ppl_autospeak','off')");
  await b.eval(`(()=>{const f=document.querySelector('[data-f]'); f.name.value='Admin'; f.email.value='admin@e2e.my'; f.password.value='rahsia123'; f.requestSubmit();})()`);
  await b.wait(1200);
  await b.eval(`(()=>{const f=document.querySelector('[data-f]'); f.name.value='Adik'; f.requestSubmit();})()`);
  await b.wait(900);
  await b.hash("/games/bijak-sifir?lv=0");
  await playQuiz(b);
  assert.match(await b.text(".result"), /XP/, "server accepted the answer log");
  assert.equal(sb.db.attempts.at(-1).answers.length, 10);
  await b.hash("/admin");
  assert.match(await b.text("#view"), /Akses ditolak/, "not admin yet");
  sb.makeAdmin("admin@e2e.my");
  await b.reload();
  await b.hash("/admin");
  await b.waitFor('[data-pub="game:simpulan-bahasa"]');
  await b.click('[data-pub="game:simpulan-bahasa"]');
  await b.wait(500);
  assert.equal(sb.db.activities.get("game:simpulan-bahasa").published, false);
  assert.match(await b.text("[data-audit]"), /game:simpulan-bahasa/);
  await b.hash("/games");
  assert.doesNotMatch(await b.text("#view"), /Simpulan Bahasa/);
  await b.hash("/games/simpulan-bahasa");
  assert.match(await b.text(), /Halaman tidak dijumpai/);
});

// ------------------------------------------------------------------ layout
const ROUTES = ["/admin", "/app", "/games", "/games/bijak-sifir", "/peta", "/peta/rumah-pokok", "/buku", "/buku/oyen-berkongsi", "/worksheet", "/worksheet/meet-letter", "/pensel", "/pensel/colour-object", "/pensel/bentuk-warna", "/zon-ibu", "/ibu", "/ibu/emosi-ibu", "/ibu/ibu-okay", "/ibu/impian-ibu", "/planner", "/planner/tabiat", "/planner/jadual", "/planner/menu", "/planner/tenang", "/tips", "/tips/hook", "/ganjaran", "/laporan", "/tetapan", "/anak", "/tiada"];
for (const width of [360, 1280]) {
  await scenario(`no horizontal overflow on ${ROUTES.length} routes at ${width}px`, async (b) => {
    await guest(b);
    const bad = [];
    for (const r of ROUTES) {
      await b.hash(r);
      const w = await b.eval("document.documentElement.scrollWidth - window.innerWidth");
      if (w > 1) bad.push(`${r} (+${w}px)`);
    }
    assert.deepEqual(bad, []);
  }, { width });
}

// ------------------------------------------------------------------ report
for (const s of servers) s.close();
const pad = Math.max(...results.map((r) => r.name.length));
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name.padEnd(pad)}  ${(r.ms / 1000).toFixed(1)}s${r.ok ? "" : "\n      " + r.err.replace(/\n/g, "\n      ")}`);
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} scenarios passed`);
process.exit(failed ? 1 : 0);
