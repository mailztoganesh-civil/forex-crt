/* Stoic range model engine (forex/stoic.js): hand-made SBS / PTB days plus a random-walk robustness run. node forex/tests/stoic_test.js */
const S = require("../stoic.js");
let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log("FAIL", m); } else console.log("ok  ", m); };
// NY time helper: 2026-11-18 is EST (UTC-5)
const ts = (d, hh, mm) => Date.UTC(2026, 10, d, hh + 5, mm) / 1000;
// --- hand-made session: monotonic warm-up (bias, no swings), then a clean bullish SBS from 09:30 NY ---
function day(sign) {
  const closes = []; for (let i = 0; i < 280; i++) closes.push(1000 + i * 0.35);
  closes.push(1100, 1102, 1104, 1106, 1103, 1100, 1098.5, 1099, 1103, 1105, 1108, 1110, 1112, 1109, 1107, 1108, 1110, 1113, 1115, 1116,
    1114, 1112, 1109, 1106, 1104, 1105, 1108, 1111, 1114, 1117, 1118);
  const t0 = ts(18, 9, 30) - 280 * 300, cs = []; let prev = closes[0];
  closes.forEach((c, i) => { const o = prev; const hi = Math.max(o, c) + 0.2, lo = Math.min(o, c) - 0.2;
    cs.push(sign === 1 ? [t0 + i * 300, o, hi, lo, c] : [t0 + i * 300, 3000 - o, 3000 - lo, 3000 - hi, 3000 - c]); prev = c; });
  return S.scan(cs, cs[cs.length - 1][0] + 300, {});
}
for (const sign of [1, -1]) {
  const r = day(sign), name = sign === 1 ? "long" : "short (mirrored prices)";
  const sb = r.setups.find(s => s.kind === "SBS" && s.order);
  ok(r.bias === sign, `${name}: bias`);
  ok(sb && sb.d === sign, `${name}: SBS with an order`);
  const m = v => sign === 1 ? v : 3000 - v;
  ok(sb && Math.abs(sb.a - m(1106.2)) < 1e-6 && Math.abs(sb.o - m(1098.3)) < 1e-6 && Math.abs(sb.p1 - m(1106.8)) < 1e-6 && Math.abs(sb.h - m(1116.2)) < 1e-6,
    `${name}: swing A, leg end O, pullback P1, new extreme H`);
  ok(sb && Math.abs(sb.order.entry - (sb.h - 0.618 * (sb.h - sb.o))) < 1e-6, `${name}: limit at 61.8% of O..H`);
  ok(sb && sb.order.state === "TARGET" && Math.abs(sb.order.R - (sb.h - sb.order.entry) / (sb.order.entry - sb.o)) < 1e-9, `${name}: target hit at H`);
  const pt = r.setups.find(s => s.kind === "PTB");
  ok(pt && pt.d === sign && pt.order.state === "MISSED", `${name}: PTB break at 09:30, retest never came (missed)`);
}
// --- random walks: no exceptions, every order sane ---
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
let n = 0, orders = 0;
for (let w = 0; w < 300; w++) {
  const c = []; let p = 100, t = ts(16, 0, 0), dr = (rnd() - 0.5) * 0.04;
  for (let i = 0; i < 900; i++) { const o = p; p += dr + (rnd() - 0.5) * 0.3; const h = Math.max(o, p) + rnd() * 0.15, l = Math.min(o, p) - rnd() * 0.15; c.push([t, o, h, l, p]); t += 300; }
  for (const day of S.days(c)) {
    const x = S.scan(c, t + 1, { target: w % 2 ? "3R" : "swing" }, day); n++;
    for (const s of x.setups) if (s.order) { orders++;
      const o = s.order, d = s.d;
      if (!((o.entry - o.stop) * d > 0 && (o.tp - o.entry) * d > 0)) { fail++; console.log("bad levels", day, s); }
      if (o.fillT && S.ny(o.fillT).min < 570) { fail++; console.log("fill before 09:30", s); }
      if (o.R != null && o.state === "STOPPED" && Math.abs(o.R + 1) > 1e-9) { fail++; console.log("stop R", s); }
    }
  }
}
ok(orders > 50, `random walks: ${n} days, ${orders} orders checked`);
process.exit(fail ? 1 : 0);
