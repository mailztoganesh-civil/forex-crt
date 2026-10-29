/* Silver Bullet tab UI test (Playwright + Chromium, Pixel 7 emulation): real New York days from sb_fixture.json shown as
 * symbols, cut off at different times of the day (before the window, waiting, raid, pending order, finished). Checks the
 * screener status against the Python backtest's outcome, the chart marks on the exact candles, the detail sheet, the other
 * tabs, phone layout and page errors.  Run: node forex/tests/sb_ui_test.js */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium, devices } = require("playwright");
const ROOT = process.env.UI_ROOT ? path.resolve(process.env.UI_ROOT) : path.join(__dirname, "..");
const X = JSON.parse(fs.readFileSync(path.join(__dirname, "sb_fixture.json"), "utf8"));
const base = JSON.parse(fs.readFileSync(path.join(__dirname, "ui_fixture.json"), "utf8"));
global.window = {}; eval(fs.readFileSync(path.join(__dirname, "..", "sb.js"), "utf8")); const SB = window.FXSilverBullet;
const R = []; const check = (n, ok, info) => R.push({ n, ok: !!ok, info });
const HOW = { stop: "STOPPED", target: "TARGET", time: "TIME_EXIT" }, WHY = { "DOL < 1R": "NO_TRADE", "expired 11:00": "EXPIRED", "missed": "MISSED", "fill+target one bar": "NO_TRADE" };

// symbols: full days (each Python outcome) + one day cut at several times
const pairs = [], expect = {};
const full = X.days.filter(d => d.expect.setup && d.expect.setup !== "both");
const byOutcome = {};
for (const d of full) { const r = d.expect.trades["breaker|dol"]; const k = r === null ? "NO_TRADE" : r.filled ? HOW[r.how] : WHY[r.why]; (byOutcome[k] = byOutcome[k] || []).push(d); }
for (const [k, ds] of Object.entries(byOutcome)) { const d = ds[0], sym = "F_" + k; pairs.push({ sym, pip: d.sym === "EURUSD" ? 1e-4 : 0.01, src: "test", price: d.c[d.c.length - 1][4], tf: {}, ltf: { "5m": d.c } }); expect[sym] = { status: k, day: d }; }
const cutDay = full.find(d => { const r = d.expect.trades["breaker|dol"]; return r && r.filled; });
const M = cutDay.c.map(c => SB.ny(c[0]).min), mss = cutDay.expect.setup.mss;
const cut = (sym, k) => { const c = cutDay.c.slice(0, k); pairs.push({ sym, pip: 0.01, src: "test", price: c[c.length - 1][4], tf: {}, ltf: { "5m": c } }); expect[sym] = { status: SB.session(c, 2e9, "breaker", "dol").status, cut: k }; };
cut("C_PRE", M.findIndex(m => m >= 540));                 // 09:00
cut("C_MSS", mss + 1);                                     // the MSS candle just closed -> order pending
const raidK = cutDay.c.findIndex((c, i) => M[i] >= 600 && (cutDay.expect.setup.d === 1 ? c[3] < Math.min(...cutDay.c.filter((_, j) => M[j] < 600).map(x => x[3])) : c[2] > Math.max(...cutDay.c.filter((_, j) => M[j] < 600).map(x => x[2]))));
if (raidK > 0 && raidK < mss) cut("C_RAID", raidK + 1);
const fixture = Object.assign({}, base, { pairs: base.pairs.filter(p => ["EURUSD", "XAUUSD"].includes(p.sym)).concat(pairs) });

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p.endsWith("/")) p += "index.html";
  if (p === "/data/crt.json") { res.writeHead(200, { "Content-Type": "application/json" }); return res.end(JSON.stringify(fixture)); }
  const f = path.join(ROOT, p); if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": { ".html": "text/html", ".js": "application/javascript", ".json": "application/json", ".png": "image/png" }[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
});

(async () => {
  await new Promise(r => server.listen(0, r));
  const b = await chromium.launch(), ctx = await b.newContext({ ...devices["Pixel 7"] }), p = await ctx.newPage(), errs = [];
  p.on("pageerror", e => errs.push(e.message));
  await p.addInitScript(() => { try { localStorage.clear(); localStorage.setItem("fx-live", "false"); localStorage.setItem("fx-tab", '"sb"'); } catch (e) {} });
  await p.goto(`http://127.0.0.1:${server.address().port}/`); await p.waitForTimeout(1500);
  check("Silver Bullet tab opens with the backtest warning", await p.$eval("#sbView", e => !e.hidden) && /no edge found/i.test(await p.$eval(".sbwarn", e => e.innerText)));
  const table = await p.$$eval("#sbTable tr[data-sb]", rs => rs.map(r => [r.dataset.sb, r.querySelector(".sbst").textContent, r.innerText]));
  const label = { PRE: "Before window", RAID: "Liquidity raided", ORDER: "Order pending", TARGET: "Target hit", STOPPED: "Stopped", TIME_EXIT: "Closed 15:55", EXPIRED: "Expired 11:00", MISSED: "Missed", NO_TRADE: "No trade" };
  for (const [sym, e] of Object.entries(expect)) {
    const row = table.find(r => r[0] === sym);
    check(`${sym}: screener status "${label[e.status] || e.status}"${e.day ? " = Python backtest outcome" : ""}`, row && row[1] === (label[e.status] || e.status), row);
    if (e.day && ["TARGET", "STOPPED", "TIME_EXIT"].includes(e.status)) { const r = e.day.expect.trades["breaker|dol"];
      check(`${sym}: R in the table = Python (${r.R.toFixed(2)}R)`, row && row[2].includes((r.R >= 0 ? "+" : "") + r.R.toFixed(2) + "R"), row && row[2]); }
  }
  // detail: marks on the exact candles
  for (const sym of Object.keys(expect).filter(s => s.startsWith("F_") || s === "C_MSS")) {
    await p.evaluate(s => { document.querySelector("#sbClose").click(); document.querySelector(`tr[data-sb="${s}"]`).click(); }, sym); await p.waitForTimeout(250);
    const st = await p.evaluate(() => { const s = Nav.get(document.querySelector("#sbCv")); return { a: s.a, step: s.k.step, hits: s.k.hits.map(h => ({ x: h.x, y: h.y, what: h.data.what })) }; });
    const e = expect[sym], d = e.day || cutDay, c = e.cut ? d.c.slice(0, e.cut) : d.c, sess = SB.session(c, 2e9, "breaker", "dol"), Xof = i => 6 + (i - st.a + 0.5) * st.step, idx = t => c.findIndex(x => x[0] === t);
    const h = w => st.hits.find(x => x.what === w);
    check(`${sym}: MSS mark on the MSS candle`, h("mss") && Math.abs(h("mss").x - Xof(idx(sess.mssT))) < 0.6);
    check(`${sym}: pending entry starts at the candle after the MSS (activation)`, h("activate") && Math.abs(h("activate").x - (Xof(idx(sess.mssT) + 1) - st.step / 2)) < 0.6);
    if (sess.order && sess.order.fillT) check(`${sym}: fill arrow on the fill candle`, h("fill") && Math.abs(h("fill").x - Xof(idx(sess.order.fillT))) < 0.6);
    else check(`${sym}: no fill arrow (not executed)`, !h("fill"));
    if (sess.order && sess.order.exitT) check(`${sym}: exit mark on the exit candle`, h("exit") && Math.abs(h("exit").x - Xof(idx(sess.order.exitT))) < 0.6);
    const strip = await p.$eval("#sbTrade", e => e.innerText);
    check(`${sym}: trade strip ${sess.order && sess.order.fillT ? "says FILLED" : "does not say FILLED"}`, sess.order && sess.order.fillT ? /FILLED/.test(strip) : !/FILLED/.test(strip), strip);
  }
  if (process.env.SB_SHOTS) {             // optional screenshots for a visual check
    await p.evaluate(() => document.querySelector("#sbClose").click()); await p.screenshot({ path: path.join(process.env.SB_SHOTS, "sb_table.png"), fullPage: true });
    for (const s of ["F_TARGET", "F_STOPPED", "C_MSS", "F_EXPIRED"]) { if (!expect[s]) continue;
      await p.evaluate(s => { document.querySelector("#sbClose").click(); document.querySelector(`tr[data-sb="${s}"]`).click(); }, s); await p.waitForTimeout(250);
      await p.screenshot({ path: path.join(process.env.SB_SHOTS, `sb_${s}.png`) }); }
  }
  // entry / target switches change the order, not the setup
  await p.evaluate(() => { document.querySelector("#sbClose").click(); document.querySelector('#sbEntry [data-v="fvg"]').click(); }); await p.waitForTimeout(200);
  check("entry switch: FVG entry rows recomputed", await p.$eval("#sbTable h2", e => /entry: fvg/.test(e.innerText)));
  await p.evaluate(() => { document.querySelector('#sbEntry [data-v="breaker"]').click(); document.querySelector('#sbTarget [data-v="2R"]').click(); }); await p.waitForTimeout(200);
  check("target switch: 2R", await p.$eval("#sbTable h2", e => /target: 2R/.test(e.innerText)));
  await p.evaluate(() => document.querySelector('#sbTarget [data-v="dol"]').click());
  check("phone: no horizontal page overflow", await p.evaluate(() => document.scrollingElement.scrollWidth <= innerWidth + 1));
  for (const t of ["crt", "sweep", "sb"]) { await p.evaluate(t => document.querySelector(`#appTab [data-tab="${t}"]`).click(), t); await p.waitForTimeout(150);
    check(`tab ${t} shows its view only`, await p.evaluate(t => ({ crt: "#crtView", sweep: "#swView", sb: "#sbView" }[t] && ["#crtView", "#swView", "#sbView"].every(v => document.querySelector(v).hidden === (v !== { crt: "#crtView", sweep: "#swView", sb: "#sbView" }[t]))), t)); }
  check("no page errors", errs.length === 0, errs.slice(0, 3));
  await b.close(); server.close();
  const fail = R.filter(r => !r.ok); for (const r of R) console.log((r.ok ? "PASS " : "FAIL ") + r.n + (r.ok ? "" : "  " + JSON.stringify(r.info)));
  console.log(`SB UI: ${R.length - fail.length} passed, ${fail.length} failed`); process.exit(fail.length ? 1 : 0);
})().catch(e => { console.error(e); server.close(); process.exit(1); });
