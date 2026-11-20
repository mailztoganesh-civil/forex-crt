/* Stoic range model engine (StoicTA): one range, two setups (SBS and PTB), 20/200 SMA bias. 5-minute candles, New York time.
 * Runs in the app (window.FXStoic) and in node (module.exports) for the WhatsApp alerts (scripts/stoic_events.js).
 *
 *  session    a trading day D runs from 18:00 NY the evening before to 16:00 NY on D
 *  range      the high / low of 18:00 (D-1) to 09:30 (D)
 *  bias       close > SMA20 > SMA200 = bullish, close < SMA20 < SMA200 = bearish, else none (no trade against it)
 *  window     orders fill only 09:30-15:30 NY; open trades close at the 15:55 candle's close
 *
 *  SBS (Swing Breakout Sequence), long (short is the mirror; swings = fractals of 2 candles each side, used only once confirmed):
 *    1 Breakout   a close above the last swing high A, with bullish bias. O = lowest low between A and the breakout.
 *    2 Pullback   the first swing low P1 after the breakout, above O.
 *    3 New high   price trades above the breakout-leg high (the high before P1). H = new high (tracked).
 *    4 Sweep      price trades below P1 (takes the pullback stops) but stays above O -> BUY limit at 61.8% of O..H,
 *                 stop O, target H (or 3R). Cancelled if H trades before the fill (missed), 36 candles after the sweep or 15:30.
 *    5 Entry      the limit fills (the double-bottom area) -> in trade until stop / target / 15:55 close.
 *    Price trading below P1 before the new high, at / below O before the sweep, or no sweep within 48 candles (4h) of the
 *    breakout resets the sequence.
 *  PTB (Pass Through and Back / break and retest), long: the first 09:30-15:30 close above the range high with bullish bias.
 *    BUY limit at the range high, stop = the last swing low before the break (else the 6-candle low), target 2R (or 3R).
 *    Cancelled if the target trades first, 24 candles after the break or 15:30. One PTB per side per day.
 *  Fills are simulated from candle high/low without costs. A fill candle that also reaches the stop is a stop;
 *  the target is only checked from the candle after the fill. Candles still forming are ignored. */
(() => {
"use strict";
const FMT = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
const cache = new Map();
function ny(t) {
  let v = cache.get(t); if (v) return v;
  const p = {}; for (const x of FMT.formatToParts(new Date(t * 1000))) p[x.type] = x.value;
  v = { date: `${p.year}-${p.month}-${p.day}`, min: (+p.hour % 24) * 60 + +p.minute };
  if (cache.size > 30000) cache.clear(); cache.set(t, v); return v;
}
const sessKey = t => ny(t + 6 * 3600).date;            // 18:00 NY starts the next trading day
const K = 2, FIB = 0.618, SBS_EXP = 36, SEQ_MAX = 48, PTB_EXP = 24, OPEN = 570, LAST = 930, CLOSE = 955, END = 960;

function sma(C, n) {
  const out = new Array(C.length).fill(null); let s = 0;
  for (let i = 0; i < C.length; i++) { s += C[i]; if (i >= n) s -= C[i - n]; if (i >= n - 1) out[i] = s / n; }
  return out;
}

/* one direction on (possibly mirrored) arrays: long logic only */
function run(A, i0, i1, rng, opt) {
  const { T, H, L, C, S20, S200, inSess } = A, M = A.SM;
  const bias = i => S20[i] != null && S200[i] != null && C[i] > S20[i] && S20[i] > S200[i];
  const win = i => inSess[i] && M[i] >= OPEN && M[i] < LAST;
  const isSH = j => { for (let k = 1; k <= K; k++) if (!(H[j] > H[j - k]) || !(H[j] >= H[j + k])) return false; return true; };
  const isSL = j => { for (let k = 1; k <= K; k++) if (!(L[j] < L[j - k]) || !(L[j] <= L[j + k])) return false; return true; };
  const tgtR = opt.target === "3R";
  const sbs = [], ptb = [];
  let st = null, lastSH = null, lastSL = null, ptbDone = false, pt = null;
  const trade = (o, i, kind) => {        // advance an order / trade on candle i; returns true when finished
    if (o.state === "ORDER") {
      if (i > o.expI || M[i] >= LAST || !inSess[i]) { o.state = "EXPIRED"; o.endI = i; return true; }
      if (H[i] >= o.tp && !(win(i) && L[i] <= o.entry)) { o.state = "MISSED"; o.endI = i; return true; }
      if (L[i] <= o.entry) {
        if (!win(i)) { if (L[i] <= o.stop) { o.state = "INVALID"; o.endI = i; return true; } return false; }
        o.state = "IN_TRADE"; o.fillI = i;
        if (L[i] <= o.stop) { o.state = "STOPPED"; o.exitI = i; o.exitPx = o.stop; return true; }
      }
      return false;
    }
    if (o.state === "IN_TRADE") {
      if (L[i] <= o.stop) { o.state = "STOPPED"; o.exitI = i; o.exitPx = o.stop; return true; }
      if (H[i] >= o.tp) { o.state = "TARGET"; o.exitI = i; o.exitPx = o.tp; return true; }
      if (M[i] >= CLOSE || !inSess[i]) { o.state = "TIME_EXIT"; o.exitI = i; o.exitPx = C[i]; return true; }
    }
    return false;
  };
  for (let i = i0; i <= i1; i++) {
    // swings confirmed on this candle (j = i - K)
    const j = i - K;
    if (j - K >= i0 - 60 && j - K >= 0) { if (isSH(j)) lastSH = { i: j, v: H[j], used: false }; if (isSL(j)) lastSL = { i: j, v: L[j] }; }
    // ---- SBS ----
    if (st && !st.state && i - st.boI > SEQ_MAX) st = null;      // no sweep within 4 hours of the breakout: start over
    if (st && (st.state === "ORDER" || st.state === "IN_TRADE")) { if (trade(st, i, "SBS")) { sbs.push(st); st = null; } }
    else if (st && st.stage === "BO") {
      st.legH = Math.max(st.legH, H[i]);
      if (C[i] < st.O) { st = null; }
      else if (lastSL && lastSL.i > st.boI && lastSL.v > st.O && st.p1 == null) {
        st.p1 = lastSL.v; st.p1I = lastSL.i; let hl = -Infinity, ha = -Infinity, hk = -1;
        for (let k = st.boI; k <= lastSL.i; k++) hl = Math.max(hl, H[k]);
        for (let k = lastSL.i + 1; k <= i; k++) if (H[k] > ha) { ha = H[k]; hk = k; }
        st.hleg = hl; st.stage = "P1"; st.fresh = true;
        if (ha > hl) { st.stage = "NH"; st.h = ha; st.nhI = i; }    // the new high came while P1 was being confirmed
      }
    }
    if (st && st.fresh) st.fresh = false;
    else if (st && st.stage === "P1") {
      const brk = H[i] > st.hleg, swept = L[i] < st.p1;
      if (swept || C[i] < st.O) st = null;
      else if (brk) { st.stage = "NH"; st.h = H[i]; st.nhI = i; }
    } else if (st && st.stage === "NH" && st.nhI < i) {
      if (L[i] <= st.O) st = null;
      else if (L[i] < st.p1) {
        const h = st.h, entry = h - FIB * (h - st.O), risk = entry - st.O;
        Object.assign(st, { stage: "SWEEP", swI: i, swPx: L[i], entry, stop: st.O, tpSwing: h, tp: tgtR ? entry + 3 * risk : h, state: "ORDER", actI: i, expI: i + SBS_EXP });
        st.rr = (st.tp - entry) / risk;
        if (L[i] <= entry && win(i)) {        // the sweep candle already reached the 61.8% level
          st.state = "IN_TRADE"; st.fillI = i;
          if (L[i] <= st.stop) { st.state = "STOPPED"; st.exitI = i; st.exitPx = st.stop; sbs.push(st); st = null; }
        }
      } else if (H[i] > st.h) { st.h = H[i]; st.nhI = i; }
    }
    if (!st && lastSH && !lastSH.used && lastSH.i < i && C[i] > lastSH.v && bias(i) && inSess[i] && M[i] < LAST) {
      let o = Infinity, hl = -Infinity; for (let k = lastSH.i; k <= i; k++) { o = Math.min(o, L[k]); hl = Math.max(hl, H[k]); }
      lastSH.used = true;
      st = { kind: "SBS", stage: "BO", aI: lastSH.i, a: lastSH.v, boI: i, O: o, legH: hl, p1: null };
    }
    // ---- PTB ----
    if (pt) { if (trade(pt, i, "PTB")) { ptb.push(pt); pt = null; ptbDone = true; } }
    else if (!ptbDone && rng && win(i) && C[i] > rng.hi && bias(i)) {
      let stop = lastSL && lastSL.v < rng.hi && lastSL.i < i ? lastSL.v : null;
      if (stop == null) { stop = Infinity; for (let k = Math.max(0, i - 6); k < i; k++) stop = Math.min(stop, L[k]); }
      const entry = rng.hi, risk = entry - stop;
      if (risk > 0) pt = { kind: "PTB", stage: "BREAK", brI: i, entry, stop, tp: entry + (tgtR ? 3 : 2) * risk, rr: tgtR ? 3 : 2, state: "ORDER", actI: i + 1, expI: i + PTB_EXP };
      else ptbDone = true;
    }
  }
  if (st) sbs.push(st);
  if (pt) ptb.push(pt);
  return { sbs, ptb };
}

const RANK = { IN_TRADE: 0, ORDER: 1, NH: 2, P1: 3, BO: 4, TARGET: 5, STOPPED: 6, TIME_EXIT: 7, MISSED: 8, EXPIRED: 9, INVALID: 10 };
const stageOf = s => s.state || s.stage;

/* cs: [[t,o,h,l,c],...] 5m, sorted. now: unix seconds (forming candle dropped). date: trading day (default = the latest).
 * opt.target: "swing" (SBS -> new high, PTB -> 2R) or "3R". */
function scan(cs, now, opt, date) {
  opt = opt || {};
  const all = (cs || []).filter(c => c[0] + 300 <= (now || Infinity));
  const out = { date: null, phase: "NO_DATA", range: null, bias: 0, setups: [], best: null };
  if (all.length < 30) return out;
  const T = all.map(c => c[0]), O = all.map(c => c[1]), Hh = all.map(c => c[2]), Ll = all.map(c => c[3]), Cc = all.map(c => c[4]);
  const M = T.map(t => ny(t).min), KEY = T.map(sessKey);
  const day = date || KEY[KEY.length - 1];
  const inSess = T.map((t, i) => KEY[i] === day && (M[i] < END || M[i] >= 1080));
  const i0 = inSess.indexOf(true), i1 = inSess.lastIndexOf(true);
  out.date = day;
  if (i0 < 0) return out;
  let hi = -Infinity, lo = Infinity, hiI = -1, loI = -1, nR = 0;
  for (let i = i0; i <= i1; i++) if (M[i] >= 1080 || M[i] < OPEN) { nR++; if (Hh[i] > hi) { hi = Hh[i]; hiI = i; } if (Ll[i] < lo) { lo = Ll[i]; loI = i; } }
  const SM = M.map(m => m >= 1080 ? m - 1440 : m), z = T.length - 1;     // session minutes: 18:00 = -360, 09:30 = 570
  out.phase = KEY[z] !== day || (M[z] >= END && M[z] < 1080) ? "CLOSED" : SM[i1] < OPEN ? "RANGE" : SM[i1] >= LAST ? "LATE" : "OPEN";
  out.range = nR >= 12 ? { hi, lo, hiT: T[hiI], loT: T[loI], n: nR, done: out.phase !== "RANGE" } : null;
  const S20 = sma(Cc, 20), S200 = sma(Cc, 200);
  const b = i1;
  out.s20 = S20[b]; out.s200 = S200[b]; out.price = Cc[b]; out.t = T[b];
  out.bias = S20[b] == null || S200[b] == null ? 0 : Cc[b] > S20[b] && S20[b] > S200[b] ? 1 : Cc[b] < S20[b] && S20[b] < S200[b] ? -1 : 0;
  if (out.range) out.pos = Cc[b] > hi ? 1 : Cc[b] < lo ? -1 : 0;
  const neg = a => a.map(v => v == null ? null : -v);
  const res = [];
  for (const d of [1, -1]) {
    const A = d === 1 ? { T, H: Hh, L: Ll, C: Cc, SM, S20, S200, inSess }
                      : { T, H: neg(Ll), L: neg(Hh), C: neg(Cc), SM, S20: neg(S20), S200: neg(S200), inSess };
    const rng = out.range && out.range.done ? (d === 1 ? { hi } : { hi: -lo }) : null;
    const r = run(A, i0, i1, rng, opt), f = v => v == null ? null : d * v;
    for (const s of [...r.sbs, ...r.ptb]) {
      if ((s.state === "EXPIRED" || s.state === "INVALID" || s.state === "MISSED") && s.endI != null && SM[s.endI] < OPEN) continue;   // overnight orders that never reached the window
      const x = { kind: s.kind, d, stage: stageOf(s), rr: s.rr != null ? s.rr : null };
      const tt = i => i == null || i < 0 ? null : T[i];
      if (s.kind === "SBS") Object.assign(x, { aT: tt(s.aI), a: f(s.a), boT: tt(s.boI), o: f(s.O), p1T: tt(s.p1I), p1: f(s.p1), legH: f(s.hleg),
        nhT: tt(s.nhI), h: f(s.h), swT: tt(s.swI), swPx: f(s.swPx) });
      else Object.assign(x, { brT: tt(s.brI), level: d === 1 ? hi : lo });
      if (s.state) {
        x.order = { entry: f(s.entry), stop: f(s.stop), tp: f(s.tp), actT: tt(Math.min(s.actI, i1)), fillT: tt(s.fillI), exitT: tt(s.exitI),
          exitPx: f(s.exitPx), endT: tt(s.endI), state: s.state };
        if (s.exitPx != null) x.order.R = (s.exitPx - s.entry) / (s.entry - s.stop);
        x.t = s.exitI != null ? T[s.exitI] : s.endI != null ? T[s.endI] : s.fillI != null ? T[s.fillI] : T[s.swI != null ? s.swI : s.brI];
      } else x.t = T[s.nhI != null ? s.nhI : s.p1I != null ? s.p1I : s.boI];
      x.key = `${s.kind}|${day}|${d}|${s.kind === "SBS" ? T[s.boI] : T[s.brI]}`;
      res.push(x);
    }
  }
  out.setups = res.sort((a, b) => a.t - b.t);
  const rank = s => RANK[s.stage] != null ? RANK[s.stage] : 20;
  out.best = res.slice().sort((a, b) => rank(a) - rank(b) || b.t - a.t)[0] || null;
  return out;
}
/* all trading days present in the candles, newest first */
function days(cs, now) {
  const s = new Set(); for (const c of cs || []) if (c[0] + 300 <= (now || Infinity)) s.add(sessKey(c[0]));
  return [...s].sort().reverse();
}

const API = { ny, sessKey, sma, scan, days, RANK };
if (typeof module !== "undefined" && module.exports) module.exports = API;
if (typeof window !== "undefined") window.FXStoic = API;
})();
