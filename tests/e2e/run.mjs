// End-to-end tests in headless Chromium. Run: node tests/e2e/run.mjs   (CHROME_PATH=... to override)
import assert from "node:assert/strict";
import { launch, chromePath } from "./cdp.mjs";
import { staticServer, mockSupabase } from "./servers.mjs";
import { buildCatalog, buildSchoolCatalog } from "../../scripts/activity-catalog.mjs";

if (!chromePath()) { console.log("SKIP: no Chromium found (set CHROME_PATH)"); process.exit(0); }

const APP = 4310, CLOUD_APP = 4311, SB = 4312;
const servers = [
  await staticServer(APP),
  await staticServer(CLOUD_APP, { stripCsp: true, config: `window.PPL_CONFIG = { SUPABASE_URL: "http://127.0.0.1:${SB}", SUPABASE_ANON_KEY: "anon-test" };` }),
];
const sb = await mockSupabase(SB, { catalog: [...(await buildCatalog()), ...(await buildSchoolCatalog())] });
servers.push(sb);
const URL_ = `http://127.0.0.1:${APP}/`;
const CLOUD = `http://127.0.0.1:${CLOUD_APP}/`;

const results = [];
const only = process.argv[2];
async function scenario(name, fn, { width = 412, allow = null, gate = false } = {}) {
  if (only && !name.includes(only)) return;
  const b = await launch({ width });
  // the parental gate has its own scenario; elsewhere it would only add a step to every parent page
  if (!gate) await b.addInitScript("try { localStorage.setItem('ppl_gate_off', '1') } catch {}");
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
  assert.equal(await b.eval("document.querySelectorAll('.lp-sec').length"), 9);
  const total = await b.eval("import('/js/sections.js').then(m => m.TOTAL_TOPICS)");
  assert.ok(total > 190, `total topics ${total}`);
  assert.equal(await b.eval("[...document.querySelectorAll('.lp-sec-h .small')].reduce((n, e) => n + parseInt(e.textContent), 0)"), total);
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

await scenario("privacy policy is public and linked from landing & sign-up", async (b) => {
  await b.goto(URL_);
  await b.waitFor("footer a[href='#/privasi']");
  await b.click("footer a[href='#/privasi']");
  await b.waitFor(".privacy h1");
  assert.match(await b.text(".privacy"), /Data yang kami simpan[\s\S]*PDPA/);
  await b.hash("#/daftar");
  assert.ok(await b.exists("form a[href='#/privasi']"));
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
await scenario("parental gate guards parent areas: wrong answer refused, right answer opens, lock closes", async (b) => {
  await guest(b);
  await b.hash("#/zon-ibu");
  await b.waitFor("[data-gate]");
  assert.match(await b.text("#view"), /Untuk ibu bapa sahaja/);
  assert.equal(await b.exists(".tile"), false, "parent tiles must not render behind the gate");
  const q1 = await b.text("[data-q]");
  await b.eval(`(()=>{const f=document.querySelector('[data-gate]'); f.a.value='1'; f.requestSubmit()})()`);
  await b.wait(200);
  assert.match(await b.text("[data-err]"), /kurang tepat/);
  assert.equal(await b.exists("[data-gate]"), true);
  // answer the (new) question correctly
  await b.eval(`(()=>{const f=document.querySelector('[data-gate]'); const [a,c]=document.querySelector('[data-q]').textContent.match(/\\d+/g).map(Number); f.a.value=String(a*c); f.requestSubmit()})()`);
  await b.waitFor(".tile");
  assert.match(await b.text("#view"), /Zon Ibu/);
  assert.ok(q1.length > 5);
  // other parent pages stay open within the window; kid pages never ask
  await b.hash("#/tetapan");
  await b.waitFor("[data-lock]");
  await b.hash("#/games");
  assert.equal(await b.exists("[data-gate]"), false);
  // lock again from settings
  await b.hash("#/tetapan");
  await b.click("[data-lock]");
  await b.hash("#/laporan");
  await b.waitFor("[data-gate]");
}, { gate: true });

await scenario("habit tracker: deleting a habit does not move ticks to another habit", async (b) => {
  await guest(b);
  await b.hash("/planner/tabiat");
  await b.waitFor('[data-h="1"][data-day="1"]');
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
  await b.waitFor('[data-h="0"][data-day="1"]');
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
await scenario("Cuba Terus (cloud build): play without an account, then Simpan ke akaun moves progress, Kedai & review to the server", async (b) => {
  await b.goto(CLOUD + "#/");
  await b.eval("localStorage.setItem('ppl_autospeak','off'); localStorage.setItem('ppl_gate_off','1')");
  await b.waitFor("[data-guest]");
  const usersBefore = sb.db.users.size;
  await b.click("[data-guest]");
  await b.waitFor(".trial-note");
  assert.equal(sb.db.users.size, usersBefore, "no server account for a trial");
  assert.equal(await b.eval("import('/js/store.js').then(m => m.store.trial)"), true);
  await b.hash("/games/bijak-sifir?lv=0");
  await playQuiz(b);
  await b.eval("import('/js/store.js').then(async (m) => { for (const i of [1, 2]) await m.store.record('game:bijak-sifir:' + i, 'games', { stars: 3, score: 10, total: 10, answers: Array.from({ length: 10 }, (_, k) => ({ q: 'q' + k, a: '1', c: '1' })) }); })");
  await b.hash("#/ganjaran");
  await b.waitFor("[data-buy=reben]:not([disabled])");
  await b.click("[data-buy=reben]");
  await b.waitFor("[data-puton=reben]");
  const trialStars = await b.eval("import('/js/store.js').then(m => m.store.totalStars())");
  assert.ok(trialStars >= 6, `trial stars ${trialStars}`); // 6 recorded + whatever the random quiz earned
  // refresh: still in the trial
  await b.reload();
  await b.waitFor(".trial-note");
  await b.click(".trial-note a[href='#/daftar']");
  await b.waitFor("[data-f] [name=email]");
  assert.match(await b.text("#bare, #view, body"), /dipindahkan ke akaun anda/);
  await b.eval(`(()=>{const f=document.querySelector('[data-f]'); f.name.value='Ibu Cuba'; f.email.value='cuba@e2e.my'; f.password.value='rahsia123'; f.requestSubmit();})()`);
  for (let t = 0; t < 60 && !(await b.eval("location.hash === '#/app' && !!document.querySelector('.hello')")); t++) await b.wait(100);
  assert.equal(await b.exists(".trial-note"), false, "trial banner gone");
  assert.equal(await b.exists("[data-trial-move]"), false, "nothing left to move");
  const owner = [...sb.db.users.values()].find((e) => e.user.email === "cuba@e2e.my").user.id;
  const kid = sb.db.children.find((c) => c.parent_id === owner);
  assert.equal(kid.name, "Adik");
  const serverStars = [...sb.db.progress.values()].filter((r) => r.child_id === kid.id).reduce((n, r) => n + r.stars, 0);
  assert.equal(serverStars, trialStars, "stars re-scored by the server");
  assert.ok(sb.db.kv.has(`${owner}|shop:${kid.id}`), "Kedai Pipi moved with the new child id");
  assert.equal(await b.eval("import('/js/store.js').then(m => [m.store.trial, m.store.trialOnDevice()])").then(JSON.stringify), "[false,null]");
  await b.hash("#/sekolah");
  await b.waitFor(".sh-art svg");
  assert.equal(await b.eval("document.querySelector('.sh-art svg').dataset.wear"), "reben", "Pipi kept the accessory");
});

await scenario("Cuba Terus then log in to an existing account: the hub offers to move or discard the trial", async (b) => {
  await b.goto(CLOUD + "#/daftar");
  await b.eval("localStorage.setItem('ppl_autospeak','off'); localStorage.setItem('ppl_gate_off','1')");
  await b.waitFor("[data-f] [name=email]");
  await b.eval(`(()=>{const f=document.querySelector('[data-f]'); f.name.value='Lama'; f.email.value='lama@e2e.my'; f.password.value='rahsia123'; f.requestSubmit();})()`);
  await b.wait(1200);
  await b.eval(`(()=>{const f=document.querySelector('[data-f]'); f.name.value='Sara'; f.requestSubmit();})()`);
  await b.wait(900);
  await b.eval("import('/js/store.js').then(m => m.store.signOut())");
  await b.goto(CLOUD + "#/");
  await b.waitFor("[data-guest]");
  await b.click("[data-guest]");
  await b.waitFor(".trial-note");
  await b.eval("import('/js/store.js').then(m => m.store.record('game:bijak-sifir:0', 'games', { stars: 3, score: 10, total: 10, answers: Array.from({ length: 10 }, (_, k) => ({ q: 'q' + k, a: '1', c: '1' })) }))");
  await b.hash("/masuk");
  await b.waitFor("[data-f] [name=email]");
  await b.eval(`(()=>{const f=document.querySelector('[data-f]'); f.email.value='lama@e2e.my'; f.password.value='rahsia123'; f.requestSubmit();})()`);
  await b.waitFor("[data-trial-move]", 8000);
  assert.match(await b.text("[data-trial-move]"), /Adik · ⭐ 3/);
  await b.click("[data-trial-go]");
  for (let t = 0; t < 60 && (await b.exists("[data-trial-move]")); t++) await b.wait(100);
  const owner = [...sb.db.users.values()].find((e) => e.user.email === "lama@e2e.my").user.id;
  assert.deepEqual(sb.db.children.filter((c) => c.parent_id === owner).map((c) => c.name).sort(), ["Adik", "Sara"]);
  assert.equal(await b.eval("import('/js/store.js').then(m => m.store.activeChild.name)"), "Adik");
});

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

const deleteViaSettings = async (b) => {
  await b.hash("#/tetapan");
  await b.click("[data-delacct]");
  await b.waitFor("[data-delf]");
  assert.equal(await b.eval("document.querySelector('[data-yes]').disabled"), true, "needs the typed confirmation");
  await b.eval(`(()=>{const i=document.querySelector('[data-delf] input'); i.value='padam'; i.dispatchEvent(new Event('input'))})()`);
  assert.equal(await b.eval("document.querySelector('[data-yes]').disabled"), false);
  await b.click("[data-yes]");
  await b.wait(1200);
  assert.equal(await b.eval("location.hash"), "#/");
};
await scenario("delete account (demo): typed confirmation, all local data for the account removed", async (b) => {
  await guest(b);
  const id = await b.eval("import('/js/store.js').then(m => m.store.user.id)");
  await b.hash("/planner/syukur");
  await b.eval(`(()=>{const i=document.querySelector('[data-g="0"]'); i.value='Terima kasih'; i.dispatchEvent(new Event('input'))})()`);
  await b.wait(900);
  assert.ok(await b.eval(`Object.keys(localStorage).some(k => k.includes(${JSON.stringify(id)}))`));
  await deleteViaSettings(b);
  assert.equal(await b.eval(`Object.keys(localStorage).filter(k => k.includes(${JSON.stringify(id)})).length`), 0);
  assert.equal(await b.eval(`Object.values(JSON.parse(localStorage.getItem('ppl_users') || '{}')).some(u => u.id === ${JSON.stringify(id)})`), false);
  assert.equal(await b.eval("localStorage.getItem('ppl_session')"), null);
});

await scenario("delete account (cloud): server deletes the user; old password no longer works", async (b) => {
  await b.goto(CLOUD + "#/daftar");
  await b.eval("localStorage.setItem('ppl_autospeak','off')");
  await b.eval(`(()=>{const f=document.querySelector('[data-f]'); f.name.value='Padam'; f.email.value='padam@e2e.my'; f.password.value='rahsia123'; f.requestSubmit();})()`);
  await b.wait(1200);
  await b.eval(`(()=>{const f=document.querySelector('[data-f]'); f.name.value='Adik'; f.requestSubmit();})()`);
  await b.wait(900);
  await deleteViaSettings(b);
  await b.goto(CLOUD + "#/masuk");
  await b.eval(`(()=>{const f=document.querySelector('[data-f]'); f.email.value='padam@e2e.my'; f.password.value='rahsia123'; f.requestSubmit();})()`);
  await b.wait(1000);
  assert.match(await b.text("[data-err]"), /\S/);
  assert.match(await b.eval("location.hash"), /#\/masuk/);
}, { allow: /status of 400 .*auth\/v1\/token/ });

// ------------------------------------------------------------------ Sekolah (Tahun 1–6)
/** Answer the current Sekolah question (correctly, or wrongly when `wrong`) through the real UI. */
const ANSWER = (wrong = false) => `(() => {
  const card = document.querySelector(".qcard2"); if (!card || !card.__q) return "none";
  const q = card.__q, wrong = ${wrong};
  if (["mcq", "fill", "tf"].includes(q.type)) {
    const opts = [...card.querySelectorAll(".opt2:not(:disabled)")];
    (wrong ? opts.find((o) => o.dataset.v !== q.answer) : opts.find((o) => o.dataset.v === q.answer)).click(); return q.type;
  }
  if (q.type === "input") {
    const v = wrong ? String(Number(q.answer) + 1) : String(q.answer);
    for (const ch of v) card.querySelector('[data-k="' + ch + '"]').click();
    card.querySelector("[data-ok]").click(); return "input";
  }
  if (q.type === "order") {
    const used = new Set(), tiles = [...card.querySelectorAll(".order-bank .tile2")];
    for (const p of (wrong ? [...q.parts].reverse() : q.parts)) { const t = tiles.find((x, i) => !used.has(i) && x.textContent === p); used.add(tiles.indexOf(t)); t.click(); }
    card.querySelector("[data-check]").click(); return "order";
  }
  if (q.type === "match") {
    if (wrong) { const ls = card.querySelectorAll("[data-l]"), rs = card.querySelectorAll("[data-r]"); for (let k = 0; k < 3; k++) { ls[0].click(); [...rs].find((x) => x.dataset.r !== "0").click(); } }
    q.pairs.forEach(([, r], k) => { card.querySelector('[data-l="' + k + '"]').click(); [...card.querySelectorAll("[data-r]")].find((x) => x.textContent === r).click(); });
    return "match";
  }
})()`;
/** Play a whole round; `wrongAt` lists question indexes to answer wrongly. Returns the question types seen. */
const playSchool = async (b, { wrongAt = [], max = 10 } = {}) => {
  const types = [];
  for (let i = 0; i < max; i++) {
    if (await b.exists(".result")) break;
    await b.waitFor(".qcard2");
    types.push(await b.eval(ANSWER(wrongAt.includes(i))));
    await b.wait(350);
    if (await b.exists(".q2-next")) await b.click(".q2-next");
    else await b.wait(wrongAt.includes(i) ? 2000 : 950);
  }
  await b.waitFor(".result", 8000);
  return types;
};
const schoolKid = async (b, grade = 2) => {
  await guest(b);
  await b.eval(`import('/js/store.js').then(m => m.store.updateChild(m.store.activeChild.id, { age: ${grade + 6}, grade: ${grade} }))`);
};

await scenario("sekolah: home shows the child's year, subjects and chapter path; topic search links to chapters", async (b) => {
  await schoolKid(b, 3);
  await b.hash("#/games");
  await b.hash("#/app");
  await b.waitFor(".school-strip .ss-sub");
  assert.equal(await b.eval("document.querySelectorAll('.school-strip .ss-sub').length"), 4);
  assert.match(await b.text(".school-strip"), /Tahun 3/);
  await b.click(".bottomnav a[href='#/sekolah']");
  await b.waitFor(".path .node");
  assert.match(await b.text(".school-hero"), /Matematik\s+Tahun 3/);
  assert.equal(await b.eval("document.querySelector('.ychip.on').textContent.replace(/\\D/g,'')"), "3");
  assert.equal(await b.eval("document.querySelectorAll('.path .node:not(.trophy)').length"), 8);
  assert.ok(await b.exists(".node.next"));
  await b.hash("#/sekolah?t=5&s=en");
  await b.waitFor(".path .node");
  assert.match(await b.text(".school-hero"), /English\s+Tahun 5/);
  await b.hash("#/app");
  await b.eval(`(()=>{const i=document.querySelector('#topic-q'); i.value='pecahan setara'; i.dispatchEvent(new Event('input'))})()`);
  assert.ok(await b.exists("[data-results] a[href='#/sekolah/bab/mat/3/pecahan-setara']"));
});

await scenario("sekolah: practice round with every question type → stars saved, mistakes filed for review, boss unlocked", async (b) => {
  await schoolKid(b, 2);
  await b.hash("#/sekolah/bab/mat/2/darab-asas");
  await b.waitFor(".stage-card");
  assert.ok(await b.exists(".st-bos .btn[disabled]"), "boss locked before practice");
  await b.click(".st-latihan a.btn");
  const types = await playSchool(b, { wrongAt: [2, 6] });
  assert.ok(types.includes("input"), `types ${types}`);
  assert.match(await b.text(".result"), /Markah: 8 \/ 10/);
  assert.match(await b.text(".result"), /Semak 2 soalan yang salah/);
  assert.equal(await b.eval("import('/js/store.js').then(m => m.store.starsOf('sek:mat-t2:darab-asas-latihan'))"), 2);
  await b.hash("#/sekolah/bab/mat/2/darab-asas");
  await b.waitFor(".st-bos a.btn");
  assert.match(await b.text(".chap-hero"), /2\/9/);
  // the two mistakes wait in Ulang Kaji Pintar
  await b.hash("#/sekolah/ulang-kaji");
  await b.waitFor("[data-start]");
  const filed = await b.eval("import('/js/store.js').then(async m => (await m.store.kv('review:' + m.store.activeChild.id, [])).length)");
  assert.ok(filed >= 1 && filed <= 2, `filed ${filed}`); // a wrong "match" question is re-practised in the chapter, not filed
  assert.match(await b.text("#view"), new RegExp(`${filed} soalan perlu diulang`));
  await b.click("[data-start]");
  await playSchool(b);
  await b.wait(600);
  const boxes = await b.eval("import('/js/store.js').then(async m => (await m.store.kv('review:' + m.store.activeChild.id, [])).map(x => x.box))");
  assert.deepEqual(boxes, Array(filed).fill(2), "reviewed items move up a box");
  assert.equal(await b.eval("import('/js/store.js').then(m => m.store.starsOf('sek:ulang-kaji'))"), 3);
});

await scenario("sekolah: other types (order words, match pairs) and the boss battle ends after 3 lost lives", async (b) => {
  await schoolKid(b, 1);
  await b.hash("#/sekolah/main/bm/1/susun-ayat/latihan");
  const t1 = await playSchool(b);
  assert.ok(t1.includes("order"), `types ${t1}`);
  assert.match(await b.text(".result"), /Markah: 10 \/ 10/);
  await b.hash("#/sekolah/main/en/1/colours/latihan");
  await playSchool(b);
  await b.hash("#/sekolah/main/bm/1/susun-ayat/bos");
  await b.waitFor(".boss-zone");
  await playSchool(b, { wrongAt: [0, 1, 2] });
  assert.match(await b.text(".result"), /Nyawa habis/);
  assert.match(await b.text(".result"), /Markah: 0 \/ 10/);
  const last = await b.eval("import('/js/store.js').then(async m => (await m.store.attempts())[0])");
  assert.equal(last.activity_id, "sek:bm-t1:susun-ayat-bos");
  assert.equal(last.answers.length, 10, "unanswered questions are logged as wrong");
});

await scenario("sekolah: time challenge — when time runs out the round ends and remaining questions count as wrong", async (b) => {
  await b.addInitScript("window.__playoraTimeScale = 0.02");
  await schoolKid(b, 4);
  await b.hash("#/sekolah/main/mat/4/koordinat/masa");
  await b.waitFor(".timer");
  await b.eval(ANSWER());
  await b.waitFor(".result", 10000);
  assert.match(await b.text(".result"), /Masa tamat/);
  const last = await b.eval("import('/js/store.js').then(async m => (await m.store.attempts())[0])");
  assert.equal(last.answers.length, 10);
  assert.ok(last.answers.filter((a) => a.a === "").length >= 8);
});

await scenario("sekolah: daily challenge, printable sheet, Darjah in child profile", async (b) => {
  await schoolKid(b, 5);
  await b.hash("#/sekolah/harian");
  await b.click("[data-start]");
  await playSchool(b);
  const today = await b.eval("import('/js/util.js').then(m => m.todayKey())");
  assert.ok((await b.eval(`import('/js/store.js').then(m => m.store.starsOf('sek:harian:${today}'))`)) >= 1);
  await b.hash("#/sekolah/cetak/mat/5/purata");
  await b.waitFor(".school-sheet .p-q");
  assert.equal(await b.eval("document.querySelectorAll('.school-sheet .p-q').length"), 12);
  assert.match(await b.text(".school-sheet"), /skema jawapan/i);
  await b.hash("#/anak");
  await b.click("[data-edit]");
  await b.eval(`(()=>{const f=document.querySelector('[data-f]'); f.grade.value='6'; f.requestSubmit();})()`);
  await b.wait(600);
  assert.equal(await b.eval("import('/js/store.js').then(m => m.store.activeChild.grade)"), 6);
  await b.hash("#/sekolah");
  await b.waitFor(".school-hero");
  assert.match(await b.text(".school-hero"), /Tahun 6/);
});

await scenario("sekolah: Sains chapter plays and saves; listening questions show a 🎧 button and picture answers; print uses the written form", async (b) => {
  await schoolKid(b, 4);
  await b.hash("#/sekolah?t=4&s=sai");
  await b.waitFor(".path .node");
  assert.match(await b.text(".school-hero"), /Sains\s+Tahun 4/);
  assert.equal(await b.eval("document.querySelectorAll('.subj-tabs .stab').length"), 4);
  await b.hash("#/sekolah/main/sai/4/sistem-suria/latihan");
  await playSchool(b);
  assert.match(await b.text(".result"), /Markah: 10 \/ 10/);
  assert.equal(await b.eval("import('/js/store.js').then(m => m.store.starsOf('sek:sai-t4:sistem-suria-latihan'))"), 3);
  // listening round (English Year 1): every question is spoken, picture choices are big emoji buttons
  await b.hash("#/sekolah/main/en/1/listen-1/latihan");
  await b.waitFor(".qcard2");
  assert.ok(await b.exists(".qcard2 [data-listen]"), "listen button");
  assert.equal(await b.eval("document.querySelector('.qcard2').__q.listen.length > 0"), true);
  // whole-word check ("ten" may be spoken while the prompt says "Listen")
  assert.equal(await b.eval(`(() => { const words = (t) => " " + t.toLowerCase().replace(/[^\\p{L}\\p{N}]+/gu, " ") + " ";
    return words(document.querySelector('.q2-prompt').innerText).includes(words(document.querySelector('.qcard2').__q.listen)); })()`), false, "spoken word not printed");
  await playSchool(b);
  assert.match(await b.text(".result"), /Markah: 10 \/ 10/);
  // printed sheet: no audio, so listening questions use their written alternative
  await b.hash("#/sekolah/cetak/bm/1/dengar-pilih");
  await b.waitFor(".school-sheet .p-q");
  assert.match(await b.text(".school-sheet"), /Pilih gambar/);
  assert.ok(!/Dengar dan pilih/.test(await b.text(".school-sheet")));
  // the parent report shows the chapter grid, accuracy and study time
  await b.hash("/laporan");
  await b.waitFor(".sr .sr-topics");
  assert.match(await b.text(".sr"), /Sekolah · Tahun 4/);
  assert.match(await b.text(".sr"), /Sains[\s\S]*1\/6 bab · ⭐ 3\/54 · 100% betul/);
  assert.ok(await b.eval("[...document.querySelectorAll('.sr-topics li.s2')].some((li) => li.title.startsWith('Sistem Suria: 3/9'))"));
  assert.match(await b.text(".sr-kpis"), /2\s*Pusingan dimainkan/);
});

await scenario("Kedai Pipi: spend stars on an accessory, Pipi wears it across the app, can take it off", async (b) => {
  await schoolKid(b, 2);
  await b.hash("#/ganjaran");
  await b.waitFor("[data-shop] [data-buy]");
  assert.match(await b.text("[data-coins]"), /⭐\s*0\s*boleh dibelanjakan/);
  assert.equal(await b.eval("document.querySelector('[data-buy=reben]').disabled"), true, "cannot afford yet");
  await b.eval("import('/js/store.js').then(async (m) => { for (const i of [0, 1, 2]) await m.store.record('game:bijak-sifir:' + i, 'games', { stars: 3, score: 10, total: 10 }); })");
  await b.hash("#/games"); await b.hash("#/ganjaran");
  await b.waitFor("[data-buy=reben]:not([disabled])");
  await b.click("[data-try=topi]");
  assert.match(await b.eval("document.querySelector('.shop-stage svg').dataset.wear"), /topi/, "try on before buying");
  await b.click("[data-buy=reben]");
  await b.waitFor("[data-puton=reben]");
  assert.match(await b.text("[data-coins]"), /⭐\s*4\s*boleh dibelanjakan/);
  assert.match(await b.text(".banner"), /⭐ 9 bintang/, "stars earned are unchanged");
  await b.hash("#/sekolah/main/mat/2/darab-asas/latihan");
  await b.waitFor(".play-buddy svg");
  assert.equal(await b.eval("document.querySelector('.play-buddy svg').dataset.wear"), "reben", "Pipi wears it in Sekolah");
  await b.hash("#/ganjaran");
  await b.click("[data-puton=reben]");
  await b.hash("#/sekolah");
  await b.waitFor(".sh-art svg");
  assert.equal(await b.eval("document.querySelector('.sh-art svg').dataset.wear"), undefined, "taken off");
});

await scenario("Pasang Playora: install card on landing, hub & settings; steps shown when the browser has no prompt; hub card can be dismissed", async (b) => {
  await b.goto(URL_);
  await b.waitFor(".lp-install [data-install]");
  await b.click(".lp-install [data-install]");
  await b.waitFor(".modal .install-steps");
  assert.match(await b.text(".modal"), /Pasang Playora[\s\S]*skrin utama/i);
  await b.click(".modal [data-close]");
  assert.equal(await b.exists(".modal"), false);
  await guest(b);
  await b.waitFor(".hello");
  assert.ok(await b.exists("#view [data-install-card]"));
  await b.click("[data-install-x]");
  await b.hash("#/games"); await b.hash("#/app");
  await b.waitFor(".hello");
  assert.equal(await b.exists("#view [data-install-card]"), false, "dismissed on the hub");
  await b.hash("#/tetapan");
  await b.waitFor("[data-install]");
});

await scenario("level-up celebration shows the new level and closes with Esc", async (b) => {
  await schoolKid(b, 2);
  await b.eval("import('/js/engine.js').then(m => m.levelUpCelebrate(3))");
  await b.waitFor(".lvlup [data-lvl-ok]");
  assert.match(await b.text(".lvlup"), /NAIK TAHAP![\s\S]*3/);
  await b.eval("document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))");
  await b.wait(500);
  assert.equal(await b.exists(".lvlup"), false);
});

await scenario("sekolah (cloud): chapter scored by the server, grade saved", async (b) => {
  await b.goto(CLOUD + "#/daftar");
  await b.eval("localStorage.setItem('ppl_autospeak','off'); localStorage.setItem('ppl_sound','off')");
  await b.eval(`(()=>{const f=document.querySelector('[data-f]'); f.name.value='Murid'; f.email.value='murid@e2e.my'; f.password.value='rahsia123'; f.requestSubmit();})()`);
  await b.wait(1200);
  await b.eval(`(()=>{const f=document.querySelector('[data-f]'); f.name.value='Hana'; f.age.value='9'; f.grade.value='3'; f.requestSubmit();})()`);
  await b.wait(1000);
  assert.equal(await b.eval("import('/js/store.js').then(m => m.store.activeChild.grade)"), 3);
  await b.hash("#/sekolah/main/en/3/opposites/latihan");
  await playSchool(b, { wrongAt: [4] });
  assert.match(await b.text(".result"), /Markah: 9 \/ 10/);
  assert.equal(await b.eval("import('/js/store.js').then(m => m.store.starsOf('sek:en-t3:opposites-latihan'))"), 3);
});

// ------------------------------------------------------------------ learning dashboard, worksheets, admin
await scenario("first-run welcome: age question, first activity, skip remembered; streak calendar", async (b) => {
  await guest(b);
  await b.waitFor(".onb");
  assert.match(await b.text(".onb"), /Pipi Panda/);
  assert.ok(await b.exists(".onb svg.mascot"));
  assert.ok(await b.exists("[data-onb-go]"), "guest child has an age, so a first activity is offered");
  // a child without an age gets asked first
  await b.eval("import('/js/store.js').then(async m => { const c = await m.store.addChild({ name: 'Bongsu', age: null, avatar: '🐰' }); m.store.setActiveChild(c.id); })");
  await b.hash("#/games"); await b.hash("#/app");
  await b.waitFor("[data-age]");
  await b.click("[data-age='7']");
  await b.waitFor("[data-onb-go]");
  assert.equal(await b.eval("import('/js/store.js').then(m => m.store.activeChild.age)"), 7);
  await b.click("[data-onb-skip]");
  assert.equal(await b.exists(".onb"), false);
  await b.reload();
  await b.waitFor("[data-week] .streak-days");
  assert.equal(await b.exists(".onb"), false, "skip is remembered");
  assert.equal(await b.eval("document.querySelectorAll('.streak-days span').length"), 7);
  assert.match(await b.text("[data-streak]"), /0\s*hari berturut/);
});

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
  await b.waitFor("[data-f] [name=email]");
  await b.eval("localStorage.setItem('ppl_autospeak','off')");
  await b.eval(`(()=>{const f=document.querySelector('[data-f]'); f.name.value='Admin'; f.email.value='admin@e2e.my'; f.password.value='rahsia123'; f.requestSubmit();})()`);
  await b.wait(1200);
  for (let t = 0; t < 50 && !(await b.eval("location.hash.startsWith('#/anak') && !!document.querySelector('[data-f]')")); t++) await b.wait(100);
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
const ROUTES = ["/sekolah", "/sekolah?t=6&s=bm", "/sekolah/bab/mat/4/koordinat", "/sekolah/main/en/1/sentences-1/latihan", "/sekolah/main/mat/2/darab-asas/masa", "/sekolah/ulang-kaji", "/sekolah/harian", "/sekolah/cetak/mat/5/purata", "/sekolah?t=5&s=sai", "/sekolah/main/en/3/listen-3/latihan", "/sekolah/main/sai/6/kelajuan/latihan", "/privasi", "/admin", "/app", "/games", "/games/bijak-sifir", "/peta", "/peta/rumah-pokok", "/buku", "/buku/oyen-berkongsi", "/worksheet", "/worksheet/meet-letter", "/pensel", "/pensel/colour-object", "/pensel/bentuk-warna", "/zon-ibu", "/ibu", "/ibu/emosi-ibu", "/ibu/ibu-okay", "/ibu/impian-ibu", "/planner", "/planner/tabiat", "/planner/jadual", "/planner/menu", "/planner/tenang", "/tips", "/tips/masa-skrin", "/ganjaran", "/laporan", "/tetapan", "/anak", "/tiada"];
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
