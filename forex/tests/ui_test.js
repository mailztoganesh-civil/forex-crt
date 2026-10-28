/* Chart UI regression test (Playwright + Chromium): entry / exit marking on the exact candles, Fit Setup, zoom / pan / price
 * scale, toolbar, crosshair, marker card, layers, phone layout, CRT tab, and "navigation never changes results".
 * Android: Chromium with the Pixel 7 and Galaxy S8 device profiles (touch, Android UA, DPR); multi-touch is sent through the
 * DevTools protocol. Desktop: 1280x900 with a mouse. This is an emulator, not a physical phone.
 * Data: forex/tests/ui_fixture.json (node forex/tests/make_ui_fixture.js) - synthetic symbols whose ICT results come from the
 * real engine on hand-worked cases (TPEND pending, TFILL/TLATE filled, TTGT target, TSTOP/TSTOP1 stop, TMISS missed, TINV
 * invalidated, TEXP expired) plus two real pairs.
 * Run: node forex/tests/ui_test.js   (needs: npm i playwright && npx playwright install chromium) */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium, devices } = require("playwright");
const ROOT = process.env.UI_ROOT ? path.resolve(process.env.UI_ROOT) : path.join(__dirname, ".."), FIX = path.join(__dirname, "ui_fixture.json");   // UI_ROOT: test another copy of forex/ (e.g. the deployed commit)
const fixture = JSON.parse(fs.readFileSync(FIX, "utf8"));
const R = []; const check = (name, ok, info) => R.push({ name, ok: !!ok, info });

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p.endsWith("/")) p += "index.html";
  const f = p === "/data/crt.json" ? FIX : path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  const ct = { ".html": "text/html", ".js": "application/javascript", ".json": "application/json", ".png": "image/png" }[path.extname(f)] || "application/octet-stream";
  res.writeHead(200, { "Content-Type": ct, "Cache-Control": "no-store" }); fs.createReadStream(f).pipe(res);
});

const pairOf = sym => fixture.pairs.find(p => p.sym === sym);
const rowOf = sym => pairOf(sym).sweeps["4H"][0];
const state = (p, sel) => p.evaluate(sel => { const s = Nav.get(document.querySelector(sel)); if (!s || !s.k) return null;
  return { a: s.a, b: s.b, n: s.n, auto: s.auto, yLo: s.yLo, yHi: s.yHi, sel: s.sel, step: s.k.step, hi: s.k.hi, lo: s.k.lo, plotW: s.k.plotW, padT: s.k.padT, plotH: s.k.plotH,
    off: s.k.off, setup: s.setup, hits: s.k.hits.map(h => ({ x: h.x, y: h.y, ...h.data })) }; }, sel);
const Xof = (st, i) => 6 + (i - st.a + 0.5) * st.step, Yof = (st, v) => st.padT + (st.hi - v) / (st.hi - st.lo) * st.plotH;
async function touch(cdp, from, to, steps = 8) {
  const tp = pts => pts.map(([x, y], i) => ({ x, y, id: i, radiusX: 4, radiusY: 4, force: 1 }));
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: tp(from) });
  for (let k = 1; k <= steps; k++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: tp(from.map(([x, y], i) => [x + (to[i][0] - x) * k / steps, y + (to[i][1] - y) * k / steps])) });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}
const tap = (cdp, x, y) => touch(cdp, [[x, y]], [[x, y]], 1);
async function openSetup(p, sym) {
  await p.evaluate(() => { document.querySelector('#swTf button[data-tf="4H"]').click(); document.querySelector("#swClose").click(); });
  for (const chip of ["active", "finished"]) {
    await p.evaluate(c => document.querySelector(`#swChips button[data-st="${c}"]`).click(), chip); await p.waitForTimeout(80);
    const ok = await p.evaluate(sym => { const r = document.querySelector(`tr[data-sw^="${sym}|4H|"]`); if (r) r.click(); return !!r; }, sym);
    if (ok) { await p.waitForTimeout(200); return true; }
  }
  return false;
}
const tables = p => p.evaluate(() => [...document.querySelectorAll("#swBull tr, #swBear tr, #list .row")].map(r => r.innerText).join("\n"));

(async () => {
  await new Promise(r => server.listen(0, r));
  const BASE = `http://127.0.0.1:${server.address().port}/`;
  const b = await chromium.launch();
  // ===================== Android (Pixel 7) =====================
  const ctx = await b.newContext({ ...devices["Pixel 7"] });
  const p = await ctx.newPage(); const errs = []; p.on("pageerror", e => errs.push(e.message));
  await p.addInitScript(() => { try { localStorage.clear(); localStorage.setItem("fx-live", "false"); localStorage.setItem("fx-tab", '"sweep"'); localStorage.setItem("sw-f", JSON.stringify({ sweep: 0, disp: 0, swing: 0, grade: "C" })); } catch (e) {} });
  await p.goto(BASE); await p.waitForTimeout(1500);
  const cdp = await ctx.newCDPSession(p);
  const before = {}; for (const c of ["active", "finished"]) { await p.evaluate(c => document.querySelector(`#swChips button[data-st="${c}"]`).click(), c); await p.waitForTimeout(80); before[c] = await tables(p); }

  // ---------- entry / exit marking on the exact candles ----------
  for (const sym of ["TPEND", "TFILL", "TLATE", "TTGT", "TSTOP", "TSTOP1", "TMISS", "TINV", "TEXP"]) {
    const s = rowOf(sym), pr = pairOf(sym), m15 = pr.ltf["15m"], c4 = pr.tf["4H"].candles, o = s.order;
    if (!(await openSetup(p, sym))) { check(`${sym}: setup opens`, false); continue; }
    const st = await state(p, "#swCv2"), strip = await p.$eval("#swTrade", e => e.innerText);
    if (process.env.UI_SHOTS) { await p.$eval("#swSheet .panel", e => e.scrollTop = 0); await p.screenshot({ path: path.join(process.env.UI_SHOTS, sym + ".png") }); }
    const hits = st.hits.filter(h => h.kind === "order"), at = w => hits.filter(h => h.what === w);
    const iAct = m15.findIndex(c => c[0] >= o.activeT);
    // pending entry: drawn from the activation candle, never from the FVG / OB formation candle
    const act = at("activate")[0], never = o.state === "CANCELLED" && s.tExit && s.tExit < o.activeT;
    if (never) check(`${sym}: cancelled before activation → no pending line / activation mark`, !act && !/^active /m.test(strip) && /would have been active/.test(strip), { act, strip });
    else check(`${sym}: pending-entry line starts at the activation candle (not the zone candle)`, act && Math.abs(act.x - (Xof(st, iAct) - st.step / 2)) < 0.6 && act.t === o.activeT
      && (s.zone.t >= o.activeT || Math.abs(act.x - (Xof(st, m15.findIndex(c => c[0] === s.zone.t)) - st.step / 2)) > 1), { act, iAct, zoneT: s.zone.t, activeT: o.activeT });
    if (s.tFill) {
      const f = at("fill"), iF = m15.findIndex(c => c[0] === s.tFill);
      check(`${sym}: one BUY/SELL fill arrow, on the fill candle`, f.length === 1 && Math.abs(f[0].x - Xof(st, iF)) < 0.6 && f[0].t === s.tFill, { f, iF });
      check(`${sym}: fill not before activation, CHoCH or sweep-candle close`, s.tFill >= o.activeT && s.tFill > s.choch.t && s.tFill >= s.sweep.t + 14400);
      check(`${sym}: strip says FILLED with fill time and price`, /FILLED/.test(strip) && strip.includes(s.fillPx.toFixed(2)), strip);
    } else {
      check(`${sym}: no fill arrow (anticipated entry is not a trade)`, at("fill").length === 0, hits);
      check(`${sym}: strip does not say FILLED`, !/FILLED/.test(strip), strip);
    }
    if (s.tExit && s.exitPx != null) {
      const e = at("exit")[0], iE = m15.findIndex(c => c[0] === s.tExit);
      check(`${sym}: ${s.status === "STOPPED" ? "stop" : "target"} exit on the exit candle at the exit price`, e && Math.abs(e.x - Xof(st, iE)) < 0.6 && Math.abs(e.y - Yof(st, s.exitPx)) < 0.6, { e, iE });
      if (s.exitNote) check(`${sym}: same-candle ambiguity disclosed`, strip.includes(s.exitNote) && /\*/.test(strip), strip);
    }
    if (o.state === "CANCELLED") {
      const k0 = c4.findIndex(c => c[0] === s.sweep.t), tEnd = s.tExit || (m15.find(c => c[0] >= c4[k0 + 7][0]) || [])[0];
      const cc = at("cancel")[0], iE = m15.findIndex(c => c[0] === tEnd);
      check(`${sym}: ${s.status.toLowerCase()} marked on the cancelling candle with time`, cc && cc.t === tEnd && Math.abs(cc.x - Xof(st, iE)) < 0.6 && new RegExp(s.status, "i").test(strip) && /never filled/.test(strip), { cc, tEnd, strip });
    }
    // Fit Setup = starting view: covers the whole 4H sweep candle on 15m and the exit / last candle
    const iSw = m15.findIndex(c => c[0] >= s.sweep.t), iEnd = s.tExit ? m15.findIndex(c => c[0] === s.tExit) : o.state === "CANCELLED" ? m15.findIndex(c => c[0] === ((s.tExit) || at("cancel")[0]?.t)) : m15.length - 1;
    check(`${sym}: starting view frames sweep candle → ${s.tExit || o.state === "CANCELLED" ? "exit" : "now"}`, st.a <= iSw && st.b >= iEnd + 1 && st.auto, { a: st.a, b: st.b, iSw, iEnd });
    // tap the fill (or activation) marker -> compact card with the trade details
    await (await p.$("#swCv2")).scrollIntoViewIfNeeded(); await p.waitForTimeout(100);
    const mk = at("fill")[0] || act || at("cancel")[0]; const bb = await (await p.$("#swCv2")).boundingBox();
    await p.waitForTimeout(350); await tap(cdp, bb.x + mk.x, bb.y + mk.y); await p.waitForTimeout(200);
    const card = await p.evaluate(() => { const x = document.querySelector("#swCv2").parentNode.querySelector(".mpop"); return x && !x.hidden ? x.innerText : ""; });
    check(`${sym}: tapping the entry marker opens the trade card`, /Order active from/.test(card) && /Stop loss/.test(card) && /Fill/.test(card) && /R:R/.test(card) && (s.tFill ? card.includes(s.fillPx.toFixed(2)) : /not filled|never filled/.test(card)), card.slice(0, 200));
    await p.evaluate(() => { const x = document.querySelector(".mpop .x"); if (x) x.click(); });
  }
  // TLATE: the touch before activation (15m candle at t4 + 6*900) is not the fill
  { const s = rowOf("TLATE"), touchT = s.sweep.t + 6 * 900; check("TLATE: early touch before activation is not marked as the fill", s.tFill > touchT && s.tFill >= s.order.activeT, { tFill: s.tFill, touchT }); }

  // ---------- Fit Setup keeps the entry candles readable (far target off scale, tag pinned) ----------
  await openSetup(p, "TFILL");
  { const s = rowOf("TFILL"), st = await state(p, "#swCv2");
    check("Fit Setup: distant target left off scale instead of squashing the entry candles", st.off.includes(s.sweep.target) && st.lo > s.sweep.target, { off: st.off, lo: st.lo, tp: s.sweep.target }); }

  // ---------- zoom / pan / price scale / toolbar on the 15m chart (TFILL) ----------
  const cv = await p.$("#swCv2"); await cv.scrollIntoViewIfNeeded(); await p.waitForTimeout(150);
  let bb = await cv.boundingBox(); const s0 = await state(p, "#swCv2"), cx = bb.x + bb.width * .45, cy = bb.y + bb.height * .5;
  const top0 = await p.$eval("#swSheet .panel", e => e.scrollTop);
  await touch(cdp, [[cx - 25, cy], [cx + 25, cy]], [[cx - 100, cy], [cx + 100, cy]]); await p.waitForTimeout(150);
  const s1 = await state(p, "#swCv2"); check("pinch out zooms in", s1.b - s1.a < (s0.b - s0.a) * .6, [s0.b - s0.a, s1.b - s1.a]);
  await touch(cdp, [[cx - 100, cy], [cx + 100, cy]], [[cx - 35, cy], [cx + 35, cy]]); await p.waitForTimeout(150);
  const s2 = await state(p, "#swCv2"); check("pinch in zooms out", s2.b - s2.a > (s1.b - s1.a) * 1.5);
  await touch(cdp, [[bb.x + 250, cy]], [[bb.x + 60, cy + 30]]); await p.waitForTimeout(150);
  const s3 = await state(p, "#swCv2"); check("one-finger drag pans (same zoom)", Math.abs(s3.a - s2.a) > 2 && Math.abs((s3.b - s3.a) - (s2.b - s2.a)) < 1e-6, [s2.a, s3.a]);
  check("page did not scroll during chart gestures", (await p.$eval("#swSheet .panel", e => e.scrollTop)) === top0);
  await touch(cdp, [[bb.x + bb.width - 25, cy]], [[bb.x + bb.width - 25, cy + 70]]); await p.waitForTimeout(150);
  const s4 = await state(p, "#swCv2"); check("price-axis drag zooms price (manual scale)", !s4.auto && s4.yHi - s4.yLo > (s3.hi - s3.lo) * 1.4);
  await touch(cdp, [[cx, cy]], [[cx, cy - 50]]); await p.waitForTimeout(150);
  const s5 = await state(p, "#swCv2"); check("vertical pan with manual price scale", s5.yHi !== s4.yHi);
  const btn = async a => { await p.evaluate(a => document.querySelector("#swCv2").previousElementSibling.querySelector(`[data-a="${a}"]`).click(), a); await p.waitForTimeout(120); return state(p, "#swCv2"); };
  let s = await btn("auto"); check("Auto restores auto-scale", s.auto);
  s = await btn("setup"); check("◎ Setup returns to the setup frame", Math.abs(s.a - s0.a) < 1e-6 && Math.abs(s.b - s0.b) < 1e-6 && s.auto, [s.a, s0.a, s.b, s0.b]);
  const w0 = s.b - s.a; s = await btn("in"); check("+ zooms in", s.b - s.a < w0 * .8); const w1 = s.b - s.a; s = await btn("out"); check("− zooms out", s.b - s.a > w1 * 1.2);
  s = await btn("latest"); check("⇥ latest candle at the right edge", s.b >= s.n && s.b <= s.n + 4);
  s = await btn("fit"); check("Fit = price range of the visible candles", !s.auto && s.yHi > s.yLo);
  s = await btn("reset"); check("Reset = setup frame, auto-scale", Math.abs(s.a - s0.a) < 1e-6 && s.auto);
  await cv.scrollIntoViewIfNeeded(); bb = await cv.boundingBox(); await p.waitForTimeout(350);
  { // a point on the plot at least 30 px from every marker (a tap on a marker opens the trade card instead)
    const st_ = await state(p, "#swCv2"); let pt = null;
    for (let i = Math.max(0, Math.ceil(st_.a)); i <= Math.min(st_.n - 1, Math.floor(st_.b) - 1) && !pt; i++) for (let fy = .3; fy < .9 && !pt; fy += .1) {
      const x = Xof(st_, i), y = bb.height * fy; if (x > 10 && x < st_.plotW - 10 && st_.hits.every(h => Math.hypot(h.x - x, h.y - y) > 30)) pt = [x, y]; }
    const under = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e && (e.id || e.className); }, [bb.x + pt[0], bb.y + pt[1]]);
    if (process.env.UI_DEBUG) console.log("tap point", pt, "element under it:", under, "hits", st_.hits.length);
    await tap(cdp, bb.x + pt[0], bb.y + pt[1]); await p.waitForTimeout(350); }
  s = await state(p, "#swCv2"); check("tap a candle → crosshair / OHLC selection", s.sel && Number.isInteger(s.sel.i));
  await btn("in"); await tap(cdp, bb.x + 80, bb.y + 90); await p.waitForTimeout(100); await tap(cdp, bb.x + 80, bb.y + 90); await p.waitForTimeout(200);
  s = await state(p, "#swCv2"); check("double-tap resets to the setup frame", Math.abs(s.a - s0.a) < 1e-6);
  // layers
  for (const [ly, what] of [["orders", "order"], ["sweep", null], ["choch", null], ["fvg", null], ["hist", null], ["crt", null], ["ob", null]]) {
    await p.evaluate(ly => document.querySelector(`#swLayers [data-ly="${ly}"]`).click(), ly); await p.waitForTimeout(80);
    const on = await p.evaluate(ly => document.querySelector(`#swLayers [data-ly="${ly}"]`).classList.contains("on"), ly), def = ly !== "crt";   // CRT levels start off
    if (what) { s = await state(p, "#swCv2"); check(`layer ${ly} off removes its marks`, !on && !s.hits.some(h => h.kind === what)); }
    await p.evaluate(ly => document.querySelector(`#swLayers [data-ly="${ly}"]`).click(), ly); await p.waitForTimeout(80);
    const on2 = await p.evaluate(ly => document.querySelector(`#swLayers [data-ly="${ly}"]`).classList.contains("on"), ly);
    check(`layer ${ly} toggles and toggles back`, on === !def && on2 === def, { on, on2 });
  }
  // higher-timeframe chart: pinch + fill marker on the candle that contains the fill
  { const c1 = await p.$("#swCv1"); await c1.scrollIntoViewIfNeeded(); const b1 = await c1.boundingBox(), h0 = await state(p, "#swCv1"), s_ = rowOf("TFILL");
    const c4 = pairOf("TFILL").tf["4H"].candles; let iC = -1; c4.forEach((c, i) => { if (c[0] <= s_.tFill) iC = i; });
    const f = h0.hits.find(h => h.what === "fill"); check("4H chart: fill marker on the 4H candle containing the fill", f && Math.abs(f.x - Xof(h0, iC)) < 0.6, { f, iC });
    await touch(cdp, [[b1.x + 140, b1.y + 150], [b1.x + 190, b1.y + 150]], [[b1.x + 60, b1.y + 150], [b1.x + 270, b1.y + 150]]); await p.waitForTimeout(150);
    const h1 = await state(p, "#swCv1"); check("4H chart pinch zoom", h1.b - h1.a < (h0.b - h0.a) * .7); }
  // sticky header keeps symbol / status visible after scrolling the sheet
  await p.$eval("#swSheet .panel", e => e.scrollTop = e.scrollHeight); await p.waitForTimeout(150);
  { const hd = await p.$eval("#swSheet .hd", e => e.getBoundingClientRect().top), pt = await p.$eval("#swSheet .panel", e => e.getBoundingClientRect().top);
    check("sticky header: symbol, direction, status stay visible", Math.abs(hd - pt) < 20 && await p.$eval("#swTrade", e => e.offsetParent !== null), { hd, pt }); }
  // stacked charts on a phone
  { const r1 = await p.$eval("#swCv1", e => e.getBoundingClientRect().toJSON()), r2 = await p.$eval("#swCv2", e => e.getBoundingClientRect().toJSON());
    check("phone: 4H and 15m charts stacked vertically", r2.top >= r1.bottom - 1, { r1: r1.bottom, r2: r2.top }); }
  check("phone: no horizontal page overflow", await p.evaluate(() => document.scrollingElement.scrollWidth <= innerWidth + 1));
  await p.evaluate(() => document.querySelector("#swClose").click());
  const after = {}; for (const c of ["active", "finished"]) { await p.evaluate(c => document.querySelector(`#swChips button[data-st="${c}"]`).click(), c); await p.waitForTimeout(80); after[c] = await tables(p); }
  check("screener results identical before / after all chart navigation", JSON.stringify(before) === JSON.stringify(after) && before.finished.length > 0);
  // CRT tab still works, with navigation
  await p.evaluate(() => document.querySelector('#appTab button[data-tab="crt"]').click()); await p.waitForTimeout(300);
  await p.evaluate(() => { const r = document.querySelector('[data-sym="EURUSD"]'); if (r) r.click(); }); await p.waitForTimeout(300);
  const crtOpen = await p.$eval("#sheet", e => !e.hidden); check("CRT tab: detail sheet opens", crtOpen);
  if (crtOpen) { const c = await p.$("#cv"); await c.scrollIntoViewIfNeeded(); const bc = await c.boundingBox(), k0 = await state(p, "#cv");
    await touch(cdp, [[bc.x + 130, bc.y + 160], [bc.x + 180, bc.y + 160]], [[bc.x + 50, bc.y + 160], [bc.x + 260, bc.y + 160]]); await p.waitForTimeout(150);
    const k1 = await state(p, "#cv"); check("CRT chart pinch zoom", k1.b - k1.a < (k0.b - k0.a) * .7);
    await p.evaluate(() => document.querySelector("#cv").previousElementSibling.querySelector('[data-a="setup"]').click()); await p.waitForTimeout(120);
    const k2 = await state(p, "#cv"); check("CRT chart ◎ Setup frames C1 .. latest", k2.a <= k2.setup.i0 && k2.b >= k2.setup.i1 + 1); }
  check("Android: no page errors", errs.length === 0, errs.slice(0, 3));
  await ctx.close();

  // ===================== narrow Android (Galaxy S8, 360 px) =====================
  { const c2 = await b.newContext({ ...devices["Galaxy S8"] }); const q = await c2.newPage(); const e2 = []; q.on("pageerror", e => e2.push(e.message));
    await q.addInitScript(() => { try { localStorage.clear(); localStorage.setItem("fx-live", "false"); localStorage.setItem("fx-tab", '"sweep"'); } catch (e) {} });
    await q.goto(BASE); await q.waitForTimeout(1200); await openSetup(q, "TSTOP");
    const tb = await q.$eval("#swCv2", e => { const r = e.previousElementSibling.getBoundingClientRect(); return { w: r.width, sw: e.previousElementSibling.scrollWidth }; });
    check("360 px: no horizontal page overflow with a setup open", await q.evaluate(() => document.scrollingElement.scrollWidth <= innerWidth + 1));
    check("360 px: chart toolbar fits (or scrolls inside itself)", tb.w <= 360, tb);
    check("360 px: no page errors", e2.length === 0, e2.slice(0, 3)); await c2.close(); }

  // ===================== desktop (mouse) =====================
  { const c3 = await b.newContext({ viewport: { width: 1280, height: 900 } }); const q = await c3.newPage(); const e3 = []; q.on("pageerror", e => e3.push(e.message));
    await q.addInitScript(() => { try { localStorage.clear(); localStorage.setItem("fx-live", "false"); localStorage.setItem("fx-tab", '"sweep"'); } catch (e) {} });
    await q.goto(BASE); await q.waitForTimeout(1200); await openSetup(q, "TTGT");
    const c = await q.$("#swCv2"), bd = await c.boundingBox(), d0 = await state(q, "#swCv2");
    await q.mouse.move(bd.x + bd.width / 2, bd.y + bd.height / 2); await q.mouse.wheel(0, -400); await q.waitForTimeout(150);
    const d1 = await state(q, "#swCv2"); check("desktop: wheel zoom", d1.b - d1.a < (d0.b - d0.a) * .8);
    await q.mouse.move(bd.x + 100, bd.y + 120); await q.mouse.down(); await q.mouse.move(bd.x + 260, bd.y + 120, { steps: 5 }); await q.mouse.up(); await q.waitForTimeout(150);
    const d2 = await state(q, "#swCv2"); check("desktop: mouse drag pans", d2.a < d1.a - 1);
    await q.mouse.move(bd.x + bd.width * .4, bd.y + 100); await q.waitForTimeout(150);
    check("desktop: hover crosshair", await q.evaluate(() => !!Nav.get(document.querySelector("#swCv2")).hover));
    const r1 = await q.$eval("#swCv1", e => e.getBoundingClientRect().toJSON()), r2 = await q.$eval("#swCv2", e => e.getBoundingClientRect().toJSON());
    check("desktop: two charts side by side", Math.abs(r1.top - r2.top) < 2 && r2.left > r1.right - 1);
    check("desktop: no page errors", e3.length === 0, e3.slice(0, 3)); await c3.close(); }

  await b.close(); server.close();
  const fail = R.filter(r => !r.ok);
  for (const r of R) console.log((r.ok ? "PASS " : "FAIL ") + r.name + (r.ok ? "" : "  " + JSON.stringify(r.info)));
  console.log(`UI: ${R.length - fail.length} passed, ${fail.length} failed`);
  process.exit(fail.length ? 1 : 0);
})().catch(e => { console.error(e); server.close(); process.exit(1); });
