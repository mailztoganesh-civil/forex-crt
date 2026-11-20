/* Prints the Stoic tab's open orders / trades (forex/stoic.js on forex/data/crt.json) as JSON for scripts/alerts.py. */
const S = require("../forex/stoic.js"), path = require("path");
const d = require(path.join(__dirname, "..", "forex", "data", "crt.json"));
const out = [];
for (const p of d.pairs || []) {
  const cs = (p.ltf && p.ltf["5m"]) || []; if (!cs.length) continue;
  const now = Date.now() / 1000, r = S.scan(cs, now, { target: process.env.STOIC_TARGET || "swing" });
  for (const s of r.setups) if (s.order && (s.stage === "ORDER" || s.stage === "IN_TRADE"))
    out.push({ sym: p.sym, pip: p.pip, key: s.key, kind: s.kind, d: s.d, stage: s.stage, rr: s.rr, bias: r.bias, ...s.order });
}
process.stdout.write(JSON.stringify(out));
