/* ICT Silver Bullet engine (phone side): the same rules as scripts/silver_bullet_backtest.py (day_setup + trade), run on the
 * current New York session's closed 5-minute candles. forex/tests/run_tests.js checks it against the Python backtest on real days.
 *
 *  liquidity  SSL / BSL = lowest low / highest high of 00:00-09:55 NY (needs >= 60 candles, i.e. 5 hours)
 *  raid       a 10:00-10:55 candle trades below SSL (long setup) / above BSL (short setup)
 *  extreme    lowest low (highest high) from the raid candle on, until the MSS
 *  MSS        first candle after the extreme, by 10:55, that CLOSES beyond the last 5m swing (1 candle each side) from
 *             09:30 up to the extreme; both sides on the same candle = no setup
 *  FVG        last gap between the extreme and the MSS candle on the stop's far side; breaker = the broken swing level
 *  order      entry (breaker limit by default, or FVG limit, or market at the next open), stop = extreme,
 *             target = the opposite liquidity (only if >= 1R away) or 2R; limit orders active from the MSS close,
 *             cancelled at 11:00 or when stop / target trade first; exit at stop / target or the 15:55 close
 *  No costs here (the screener shows levels); the backtest adds them. Candles still forming are ignored. */
(() => {
"use strict";
const FMT = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
const cache = new Map();
function ny(t) {                       // {date: "YYYY-MM-DD", min: minutes after NY midnight}
  let v = cache.get(t); if (v) return v;
  const p = {}; for (const x of FMT.formatToParts(new Date(t * 1000))) p[x.type] = x.value;
  v = { date: `${p.year}-${p.month}-${p.day}`, min: (+p.hour % 24) * 60 + +p.minute };
  if (cache.size > 20000) cache.clear(); cache.set(t, v); return v;
}

/* the Python day_setup on one NY day's candles (arrays T,O,H,L,C and minutes M) */
function daySetup(O, H, L, C, M, raidFrom) {
  const r0 = raidFrom || 600;
  const pre = []; for (let i = 0; i < M.length; i++) if (M[i] < r0) pre.push(i);
  if (pre.length < 60) return { why: "not enough candles before the window" };
  let ssl = Infinity, bsl = -Infinity; for (const i of pre) { if (L[i] < ssl) ssl = L[i]; if (H[i] > bsl) bsl = H[i]; }
  const win = []; for (let i = 0; i < M.length; i++) if (M[i] >= r0 && M[i] < 660) win.push(i);
  const s0 = M.findIndex(m => m >= 570);
  const base = { ssl, bsl };
  if (win.length < 1 || s0 < 0) return base;
  let best = null, raids = {};
  for (const side of [1, -1]) {
    const raid = win.find(i => side === 1 ? L[i] < ssl : H[i] > bsl);
    if (raid === undefined) continue;
    raids[side] = raid;
    let ext = raid;
    for (let i = raid; i <= win[win.length - 1]; i++) {
      if (M[i] >= 660) break;
      if (side === 1 ? L[i] < L[ext] : H[i] > H[ext]) ext = i;
      if (i <= ext) continue;
      let ref = null;
      for (let j = ext - 1; j > s0; j--) {
        if (j + 1 > ext) continue;
        if (side === 1 && H[j] > H[j - 1] && H[j] >= H[j + 1]) { ref = j; break; }
        if (side === -1 && L[j] < L[j - 1] && L[j] <= L[j + 1]) { ref = j; break; }
      }
      if (ref === null) continue;
      if (side === 1 ? C[i] > H[ref] : C[i] < L[ref]) {
        if (M[i] < 600) break;
        const stop = side === 1 ? L[ext] : H[ext];
        let fvg = null, fvgK = null;
        for (let k = i - 1; k > ext; k--) {
          if (side === 1 && L[k + 1] > H[k - 1] && H[k - 1] > stop) { fvg = L[k + 1]; fvgK = k; break; }
          if (side === -1 && H[k + 1] < L[k - 1] && L[k - 1] < stop) { fvg = H[k + 1]; fvgK = k; break; }
        }
        const s = { d: side, raid, ext, ref, mss: i, stop, fvg, fvgK, brk: side === 1 ? H[ref] : L[ref], dol: side === 1 ? bsl : ssl };
        if (best === null || i < best.mss) best = s; else if (best !== "both" && i === best.mss) best = "both";
        break;
      }
    }
  }
  return Object.assign(base, { raids, setup: best });
}

/* the Python trade() without costs; returns a state even when the session is not finished yet */
function trade(s, T, O, H, L, C, M, kind, tmode) {
  const d = s.d, i = s.mss, n = T.length;
  let entry;     // limit levels are known at the MSS close; a market entry needs the next candle's open
  if (kind === "market") { if (i + 1 >= n) return { state: "WAIT_NEXT", note: "market order at the next candle's open" }; entry = O[i + 1]; }
  else if (kind === "fvg") { if (s.fvg === null) return { state: "NO_TRADE", why: "no FVG between the extreme and the MSS" }; entry = s.fvg; }
  else entry = s.brk;
  const stop = s.stop, risk = (entry - stop) * d;
  if (!(risk > 0)) return { state: "NO_TRADE", why: "entry not beyond the stop" };
  const tp = tmode === "2R" ? entry + d * 2 * risk : s.dol;
  const base = { entry, stop, tp, risk, rr: (tp - entry) * d / risk, activeT: T[i] + 300 };
  if ((tp - entry) * d < risk) return Object.assign(base, { state: "NO_TRADE", why: "the opposite liquidity is less than 1R away" });
  let k0 = i + 1;
  if (kind !== "market") {
    let fill = null;
    for (let k = i + 1; k < n; k++) {
      if (M[k] >= 660) return Object.assign(base, { state: "EXPIRED", why: "not filled by 11:00", t: T[k] });
      const touch = d === 1 ? L[k] <= entry : H[k] >= entry, st = d === 1 ? L[k] <= stop : H[k] >= stop, tg = d === 1 ? H[k] >= tp : L[k] <= tp;
      if (touch) { if (tg && !st) return Object.assign(base, { state: "NO_TRADE", why: "fill and target in one candle – order unknown, not counted", t: T[k] }); fill = k; break; }
      if (tg) return Object.assign(base, { state: "MISSED", why: "target reached before the entry", t: T[k] });
    }
    if (fill === null) return Object.assign(base, { state: "PENDING" });
    k0 = fill;
  }
  base.fillT = T[k0]; base.fillPx = entry;
  let k = k0;
  for (; k < n; k++) {
    const st = d === 1 ? L[k] <= stop : H[k] >= stop, tg = d === 1 ? H[k] >= tp : L[k] <= tp;
    if (st) return Object.assign(base, { state: "STOPPED", exitT: T[k], exitPx: stop, R: -1, note: tg ? "stop and target in one candle – order unknown, counted as a stop" : (k === k0 ? "filled and stopped in the same candle" : "") });
    if (tg) return Object.assign(base, { state: "TARGET", exitT: T[k], exitPx: tp, R: (tp - entry) * d / risk });
    if (M[k] >= 955) return Object.assign(base, { state: "TIME_EXIT", exitT: T[k], exitPx: C[k], R: (C[k] - entry) * d / risk });
  }
  return Object.assign(base, { state: "IN_TRADE", last: C[n - 1], openR: (C[n - 1] - entry) * d / risk });
}

/* screener: the latest NY session in the candles, closed candles only (t + 300 <= now) */
function session(cs, now, kind, tmode, day) {
  const closed = cs.filter(c => c[0] + 300 <= now);
  if (!closed.length) return { status: "NO_DATA" };
  const date = day || ny(closed[closed.length - 1][0]).date;
  const today = closed.filter(c => ny(c[0]).date === date);
  const T = today.map(c => c[0]), O = today.map(c => c[1]), H = today.map(c => c[2]), L = today.map(c => c[3]), C = today.map(c => c[4]), M = T.map(t => ny(t).min);
  const lastMin = M.length ? M[M.length - 1] : -1;
  const ds = daySetup(O, H, L, C, M);
  const out = { date, candles: today, lastMin, ssl: ds.ssl, bsl: ds.bsl, why: ds.why };
  if (ds.why) { out.status = lastMin < 600 ? "PRE" : "NO_DATA"; return out; }
  const s = ds.setup;
  if (s === "both") { out.status = "NO_SETUP"; out.note = "both sides broke structure on the same candle"; return out; }
  if (!s) {
    const raided = ds.raids && Object.keys(ds.raids).length;
    if (lastMin < 595) out.status = "PRE";
    else if (lastMin < 655) {
      out.status = raided ? "RAID" : "WATCH";
      // a raid is not a setup yet: report each raided side (both can be raided); the setup side is set only by the MSS
      out.raids = {};
      for (const sd of [1, -1]) { if (!ds.raids || ds.raids[sd] === undefined) continue;
        let ext = ds.raids[sd]; for (let i = ext; i < T.length; i++) if (sd === 1 ? L[i] < L[ext] : H[i] > H[ext]) ext = i;
        out.raids[sd] = { t: T[ds.raids[sd]], extT: T[ext], extPx: sd === 1 ? L[ext] : H[ext] }; }
    } else out.status = "NO_SETUP";
    return out;
  }
  Object.assign(out, { side: s.d, raidT: T[s.raid], extT: T[s.ext], extPx: s.stop, refT: T[s.ref], mssT: T[s.mss], brk: s.brk,
    fvg: s.fvg, fvgT: s.fvgK !== null ? T[s.fvgK] : null, fvgLo: s.fvgK !== null ? (s.d === 1 ? H[s.fvgK - 1] : H[s.fvgK + 1]) : null,
    fvgHi: s.fvgK !== null ? (s.d === 1 ? L[s.fvgK + 1] : L[s.fvgK - 1]) : null, dol: s.dol });
  out.order = trade(s, T, O, H, L, C, M, kind || "breaker", tmode || "dol");
  out.status = { WAIT_NEXT: "ORDER", PENDING: lastMin >= 655 ? "EXPIRED" : "ORDER" }[out.order.state] || out.order.state;
  return out;
}

window.FXSilverBullet = { ny, daySetup, trade, session };
})();
