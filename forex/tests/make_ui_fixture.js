/* Build forex/tests/ui_fixture.json for the chart UI test (forex/tests/ui_test.js):
 *  - two real pairs from forex/data/crt.json (CRT tab + real ICT setups),
 *  - synthetic 4H -> 15m pairs, one per order state, made from the hand-worked cases in sweep_cases.json and run through
 *    the real engine (forex/sweep.js) the same way scan() assembles a row - so the UI test checks the drawing of
 *    engine results, not hand-typed ones.
 * Run: node forex/tests/make_ui_fixture.js */
"use strict";
const fs = require("fs"), path = require("path");
global.window = {};
eval(fs.readFileSync(path.join(__dirname, "..", "sweep.js"), "utf8"));
const SW = window.FXSweep;
const Z = JSON.parse(fs.readFileSync(path.join(__dirname, "sweep_cases.json"), "utf8"));
const real = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "crt.json"), "utf8"));

const pick = s => Z.ltf.find(c => c.name.startsWith(s));
function row(c4, j, m15) {               // scan()'s row assembly for one closed 4H sweep
  const sw = SW.sweepAt(c4, j, false), x = SW.ltfSetup(sw, c4, m15, true, 14400), q = SW.quality(sw, x);
  return Object.assign({ dir: sw.dir, sweep: sw, dist: null }, x, { status: x.status, ltfStatus: x.status, q });
}
function pair(sym, c, extend) {
  const c4 = c.c4.map(r => r.slice()), m15 = c.m15.map(r => r.slice());
  if (extend) extend(c4, m15);
  const r = row(c4, c.j != null ? c.j : 8, m15);
  const last = m15[m15.length - 1] || c4[c4.length - 1];
  return { sym, pip: 0.01, src: "test", price: last[4], tf: { "4H": { candles: c4 } }, ltf: { "15m": m15 }, sweeps: { "4H": [r] }, sweep: [r] };
}
const base = "15m CHoCH after the sweep, displacement, FVG entry, filled after";
const P = [
  pair("TPEND", pick("order: limit placed and active, price never reaches it")),
  pair("TFILL", pick("15m CHoCH after the sweep, displacement, FVG entry, filled after")),
  pair("TTGT", pick("target on a later candle after the fill")),
  pair("TSTOP", pick("collision: after the fill one candle hits stop and target")),
  pair("TSTOP1", pick("collision: the fill candle also hits the stop")),
  pair("TMISS", pick("collision: the fill candle also reaches the target")),
  pair("TINV", pick("order: price beyond the stop before the order is active")),
  pair("TLATE", pick("order: a touch before the order is active is ignored")),
  // expired: the pending case, with 8 more quiet 4H candles and 15m candles that never come back to the limit
  pair("TEXP", pick("order: limit placed and active, price never reaches it"), (c4, m15) => {
    const t4 = c4[c4.length - 1][0], lc = m15[m15.length - 1];
    for (let i = 1; i <= 8; i++) c4.push([t4 + i * 14400, 103.4, 103.6, 103.2, 103.4]);
    for (let t = lc[0] + 900; t < t4 + 8 * 14400; t += 900) m15.push([t, 103.4, 103.6, 103.2, 103.4]);
  }),
];
const keep = real.pairs.filter(p => ["EURUSD", "XAUUSD"].includes(p.sym));
const out = Object.assign({}, real, { pairs: keep.concat(P), updated: real.updated });
fs.writeFileSync(path.join(__dirname, "ui_fixture.json"), JSON.stringify(out));
console.log("ui_fixture.json:", P.map(p => p.sym + "=" + p.sweeps["4H"][0].status + "/" + (p.sweeps["4H"][0].order ? p.sweeps["4H"][0].order.state : "-")).join(" "));
