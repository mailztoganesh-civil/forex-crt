/* Stoic tab (StoicTA range model): screener table + 5m detail chart. Detection is in forex/stoic.js; this file only shows it.
 * Data: the 5m candles in data.pairs[].ltf["5m"] (live or scan) plus the multi-day history in data/sb5m.json. */
(() => {
"use strict";
const $ = s => document.querySelector(s);
const ST = window.FXStoic;
const ls = { get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
             set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const digits = p => p.pip >= 0.1 ? 2 : p.pip >= 0.01 ? 3 : 5;
const fmt = (p, v) => v == null || !isFinite(v) ? "–" : Number(v).toFixed(digits(p));
const nyhm = t => { const m = ST.ny(t).min; return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); };
const local = t => { const d = new Date(t * 1000); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
const both = t => t ? `${nyhm(t)} NY · ${local(t)} yours` : "–";
const now = () => Date.now() / 1000;
const UP = "#2962FF";                       // blue up-candles, red down-candles
const STAGE = { BO: "1 Breakout", P1: "2 Pullback", NH: "3 New high / low", ORDER: "Order pending", IN_TRADE: "In trade", TARGET: "Target hit",
  STOPPED: "Stopped", TIME_EXIT: "15:55 close", MISSED: "Missed", EXPIRED: "Expired", INVALID: "Invalidated", BREAK: "Break" };
const CLS = { ORDER: "sb-ORDER", IN_TRADE: "sb-IN_TRADE", TARGET: "sb-TARGET", STOPPED: "sb-STOPPED", NH: "sb-RAID", P1: "sb-WATCH", BO: "sb-WATCH" };
const PHASE = { RANGE: "Range building (18:00–09:30 NY)", OPEN: "Session open", LATE: "No new entries after 15:30", CLOSED: "Session closed", NO_DATA: "No data" };
let data = null, tmode = ls.get("st-target", "swing"), openSym = null, selDate = null, hist = null, histTried = false, cur = [];

const rowsOf = () => ((data && data.pairs) || []).map(p => ({ p, r: ST.scan((p.ltf && p.ltf["5m"]) || [], now(), { target: tmode }) }));
const side = d => d === 1 ? "▲ Long" : "▼ Short";
const chip = s => s ? `<span class="sbst ${CLS[s.stage] || ""}">${s.kind} ${s.d === 1 ? "▲" : "▼"} ${STAGE[s.stage] || s.stage}</span>${s.order && s.order.R != null ? ` <b>${s.order.R >= 0 ? "+" : ""}${s.order.R.toFixed(2)}R</b>` : ""}` : "–";
const pick = (r, k) => { const xs = r.setups.filter(s => s.kind === k); return xs.sort((a, b) => (ST.RANK[a.stage] ?? 20) - (ST.RANK[b.stage] ?? 20) || b.t - a.t)[0] || null; };

function clock() {
  const t = now(), m = ST.ny(t).min, toO = (570 - m + 1440) % 1440, open = t + toO * 60;
  const state = m >= 570 && m < 960 ? `<b>open</b> – closes in ${Math.floor((960 - m) / 60)}h ${(960 - m) % 60}m` : `opens in ${Math.floor(toO / 60)}h ${toO % 60}m`;
  return `Range 18:00–09:30 NY · session 09:30–16:00 NY = <b>${local(open)}–${local(open + 390 * 60)}</b> your time · ${state}`;
}
function render() {
  if (!data) return;
  document.querySelectorAll("#stTarget button").forEach(b => b.classList.toggle("on", b.dataset.v === tmode));
  $("#stClock").innerHTML = clock();
  const rows = rowsOf().sort((a, b) => ((a.r.best ? ST.RANK[a.r.best.stage] : 30) - (b.r.best ? ST.RANK[b.r.best.stage] : 30)) || a.p.sym.localeCompare(b.p.sym));
  const r0 = rows.find(x => x.r.date);
  $("#stTable").innerHTML = `<h2>Day ${esc(r0 ? r0.r.date : "")} <span style="text-transform:none;letter-spacing:0;font-weight:600">· ${r0 ? PHASE[r0.r.phase] || "" : ""} · target: ${tmode === "3R" ? "3R" : "SBS new high / PTB 2R"}</span></h2>` +
    `<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Symbol</th><th>Bias</th><th>Range low / high</th><th>Price</th><th>SBS</th><th>PTB</th><th>Order</th><th>Stop</th><th>Target</th><th>R:R</th></tr></thead><tbody>` +
    rows.map(({ p, r }) => { const sb = pick(r, "SBS"), pt = pick(r, "PTB"), b = r.best && r.best.order ? r.best : (sb && sb.order ? sb : pt && pt.order ? pt : null), o = b ? b.order : {};
      const pos = r.pos === 1 ? " ↑" : r.pos === -1 ? " ↓" : "";
      return `<tr data-st="${esc(p.sym)}"><td>${esc(p.sym)}</td><td>${r.bias === 1 ? '<span class="up">▲ Bull</span>' : r.bias === -1 ? '<span class="dn">▼ Bear</span>' : "–"}</td>` +
        `<td>${r.range ? fmt(p, r.range.lo) + " / " + fmt(p, r.range.hi) : "building"}</td><td>${fmt(p, r.price)}${pos}</td><td>${chip(sb)}</td><td>${chip(pt)}</td>` +
        `<td>${b ? `${b.kind} ${b.d === 1 ? "BUY" : "SELL"} ${fmt(p, o.entry)}` : "–"}</td><td>${fmt(p, o.stop)}</td><td>${fmt(p, o.tp)}</td><td>${b && b.rr != null ? b.rr.toFixed(1) : "–"}</td></tr>`; }).join("") +
    `</tbody></table></div>`;
  if (openSym) drawDetail();
}

/* ---------- detail ---------- */
async function loadHist() {
  if (histTried) return; histTried = true;
  try { const r = await fetch("data/sb5m.json?t=" + Math.floor(Date.now() / 600000)); if (r.ok) hist = await r.json(); } catch (e) { hist = null; }
  if (openSym) drawDetail();
}
function allCandles(p) {
  const m = new Map();
  for (const c of (hist && hist.symbols && hist.symbols[p.sym]) || []) m.set(c[0], c);
  for (const c of (p.ltf && p.ltf["5m"]) || []) m.set(c[0], c);
  return [...m.values()].sort((a, b) => a[0] - b[0]);
}
function openDetail(sym) { openSym = sym; selDate = null; $("#stSheet").hidden = false; drawDetail(); loadHist(); }
function closeDetail() { openSym = null; $("#stSheet").hidden = true; }
function strip(p, r, s) {
  const L = [`<span><b>${r.bias === 1 ? "▲ Bullish bias" : r.bias === -1 ? "▼ Bearish bias" : "No bias (20/200 SMA mixed)"}</b> · ${esc(r.date || "")} · ${PHASE[r.phase] || ""}</span>`];
  if (!s) { L.push(`<span class="can">No SBS or PTB yet today</span>`); return L.join(""); }
  const o = s.order;
  L.push(`<span><b>${s.kind} ${side(s.d)}</b> · ${STAGE[s.stage] || s.stage}</span>`);
  if (o) {
    L.push(`<span class="pend">${s.d === 1 ? "BUY" : "SELL"} limit ${fmt(p, o.entry)}</span>`, `<span class="sl">SL ${fmt(p, o.stop)}</span>`, `<span class="tp">TP ${fmt(p, o.tp)}</span>`);
    if (o.fillT) L.push(`<span class="fill"><b>FILLED</b> ${nyhm(o.fillT)}</span>`);
    if (o.exitT) L.push(`<span class="${o.state === "STOPPED" ? "sl" : "tp"}"><b>${STAGE[o.state]}</b> ${nyhm(o.exitT)} (${o.R >= 0 ? "+" : ""}${o.R.toFixed(2)}R)</span>`);
  }
  return L.join("");
}
function drawDetail() {
  const row = rowsOf().find(x => x.p.sym === openSym); if (!row) return closeDetail();
  const p = row.p, cs = allCandles(p), daysL = ST.days(cs, now()), day = selDate || row.r.date;
  const r = ST.scan(cs, now(), { target: tmode }, day);
  const sel = r.best;
  $("#stTitle").textContent = `${p.sym} · Stoic range`;
  const b = $("#stBadge"); b.textContent = sel ? `${sel.kind} ${STAGE[sel.stage] || sel.stage}` : PHASE[r.phase] || ""; b.className = "badge sbst " + (sel ? CLS[sel.stage] || "" : "");
  $("#stTrade").innerHTML = strip(p, r, sel);
  const L = [["Trading day", esc(r.date || "–")], ["Range high (18:00–09:30)", r.range ? `${fmt(p, r.range.hi)} · ${both(r.range.hiT)}` : "building"],
    ["Range low", r.range ? `${fmt(p, r.range.lo)} · ${both(r.range.loT)}` : "building"], ["SMA 20 / SMA 200 (5m)", `${fmt(p, r.s20)} / ${fmt(p, r.s200)}`]];
  for (const s of r.setups) {
    const o = s.order, head = `${s.kind} ${side(s.d)} · ${STAGE[s.stage] || s.stage}`;
    const up = s.d === 1;
    const v = s.kind === "SBS" ? `breakout ${nyhm(s.boT)} ${up ? "over" : "under"} ${fmt(p, s.a)} · leg ${up ? "low" : "high"} ${fmt(p, s.o)}${s.p1 != null ? ` · pullback ${fmt(p, s.p1)}` : ""}${s.h != null ? ` · new ${up ? "high" : "low"} ${fmt(p, s.h)}` : ""}${s.swT ? ` · sweep ${nyhm(s.swT)}` : ""}`
      : `break ${nyhm(s.brT)} of ${fmt(p, s.level)}`;
    L.push([head, v + (o ? ` · limit ${fmt(p, o.entry)} SL ${fmt(p, o.stop)} TP ${fmt(p, o.tp)}${o.fillT ? ` · filled ${nyhm(o.fillT)}` : ""}${o.R != null ? ` · ${o.R >= 0 ? "+" : ""}${o.R.toFixed(2)}R` : ""}` : "")]);
  }
  $("#stLv").innerHTML = L.map(([k, v]) => `<div>${k}<b>${v}</b></div>`).join("");
  // other days on the chart
  const rs = daysL.map(d => ({ d, x: ST.scan(cs, now(), { target: tmode }, d) }));
  const all = rs.flatMap(z => z.x.setups.filter(s => s.order && s.order.R != null)), sumR = all.reduce((a, s) => a + s.order.R, 0);
  $("#stHist").innerHTML = `<h2>Days on the chart <span style="text-transform:none;letter-spacing:0;font-weight:600">· ${daysL.length} · ${hist ? "history loaded" : histTried ? "today only" : "loading history…"}` +
    `${all.length ? ` · ${all.length} trades, ${sumR >= 0 ? "+" : ""}${sumR.toFixed(2)}R before costs` : ""}</span></h2><div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Day</th><th>Bias at end</th><th>Setups</th><th>Result</th></tr></thead><tbody>` +
    rs.map(({ d, x }) => { const done = x.setups.filter(s => s.order && s.order.R != null), R = done.reduce((a, s) => a + s.order.R, 0);
      return `<tr data-stday="${d}"${d === r.date ? ' class="sel"' : ""}><td>${d}</td><td>${x.bias === 1 ? "▲" : x.bias === -1 ? "▼" : "–"}</td><td>${x.setups.map(s => `${s.kind}${s.d === 1 ? "▲" : "▼"} ${STAGE[s.stage] || s.stage}`).join(", ") || "–"}</td>` +
        `<td>${done.length ? (R >= 0 ? "+" : "") + R.toFixed(2) + "R" : "–"}</td></tr>`; }).join("") + `</tbody></table></div>`;
  draw(p, cs, r);
}

function draw(p, cs, r) {
  const cv = $("#stCv"); cur = cs;
  const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr;
  const g = cv.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
  const C = { ink: css("--ink"), sec: css("--sec"), line: css("--line"), up: UP, dn: css("--red"), blue: UP, amber: css("--amber"), card: css("--card") || "#fff", brown: "#A0522D" };
  if (cs.length < 3) { g.fillStyle = C.sec; g.font = "13px -apple-system,Segoe UI,Roboto,sans-serif"; g.fillText("No 5-minute candles yet.", 10, H / 2); return; }
  const n = cs.length, IX = new Map(cs.map((c, i) => [c[0], i])), idx = t => t == null ? -1 : (IX.has(t) ? IX.get(t) : -1);
  const KEY = cs.map(c => ST.sessKey(c[0])), d0 = KEY.indexOf(r.date), d1 = KEY.lastIndexOf(r.date);
  const padR = 64, padB = 22, padT = 18, plotW = W - padR - 6, plotH = H - padB - padT;
  let iS = d0; for (let i = d0; i >= 0 && i <= d1; i++) { const m = ST.ny(cs[i][0]).min; if (m >= 450 && m < 960) { iS = i; break; } }   // frame from 07:30 NY
  const setup = { i0: Math.max(0, iS), i1: Math.max(d0, d1) };
  Nav.view(cv, `${p.sym}|${r.date}|${tmode}`, n, null, setup);
  const sel = r.best, so = sel && sel.order || {};
  const f = Nav.frame(cv, cs, { padT, plotW, plotH }, { core: [r.range && r.range.hi, r.range && r.range.lo, so.entry, so.stop], far: [so.tp] });
  const { X, Y, step } = f, bw = Math.max(1.2, Math.min(18, step * 0.62)), tags = [];
  g.font = "11px -apple-system,Segoe UI,Roboto,sans-serif";
  for (let k = 0; k <= 4; k++) { const v = f.lo + (f.hi - f.lo) * k / 4, y = Y(v); g.strokeStyle = C.line; g.beginPath(); g.moveTo(0, y); g.lineTo(plotW + 6, y); g.stroke(); g.fillStyle = C.sec; g.fillText(fmt(p, v), plotW + 10, y + 4); }
  g.save(); g.beginPath(); g.rect(0, 0, plotW + 6, H - padB); g.clip();
  const lab = (txt, x, y, col, al, size) => { if (x < -60 || x > plotW + 60) return; g.save(); g.font = `bold ${size || 10}px -apple-system,Segoe UI,Roboto,sans-serif`; g.fillStyle = col; g.textAlign = al || "center"; g.fillText(txt, x, y); g.restore(); };
  const seg = (v, col, x0, x1, dash, w) => { if (v == null) return; const y = Y(v); g.save(); g.strokeStyle = col; g.lineWidth = w || 1.3; g.setLineDash(dash ? [5, 4] : []); g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke(); g.restore(); };
  // session shading (09:30-16:00) and day dividers for every day in view
  let prevK = null;
  for (let i = Math.max(0, f.i0 - 1); i <= f.i1; i++) {
    const m = ST.ny(cs[i][0]).min;
    if (KEY[i] !== prevK) { const x = X(i) - step / 2; g.save(); g.strokeStyle = C.ink; g.globalAlpha = .3; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H - padB); g.stroke(); g.restore();
      lab(KEY[i].slice(5) + (KEY[i] === r.date ? " ●" : ""), Math.max(x + 4, 4), 12, KEY[i] === r.date ? C.ink : C.sec, "left"); prevK = KEY[i]; }
    if (m >= 570 && m < 960) { g.save(); g.globalAlpha = KEY[i] === r.date ? .08 : .04; g.fillStyle = C.up; g.fillRect(X(i) - step / 2, padT - 4, step + .5, plotH + 4); g.restore(); }
  }
  // SMAs (computed on all candles)
  const Cc = cs.map(c => c[4]), s20 = ST.sma(Cc, 20), s200 = ST.sma(Cc, 200);
  for (const [arr, col, w, name] of [[s200, C.brown, 2.2, "200MA"], [s20, C.amber, 1.2, "20MA"]]) {
    g.save(); g.strokeStyle = col; g.lineWidth = w; g.beginPath(); let on = false;
    for (let i = f.i0; i <= f.i1; i++) { if (arr[i] == null) { on = false; continue; } const x = X(i), y = Y(arr[i]); if (on) g.lineTo(x, y); else g.moveTo(x, y); on = true; }
    g.stroke(); g.restore();
    if (arr[f.i1] != null) lab(name, X(f.i1) - 4, Y(arr[f.i1]) - 6, col, "right");
  }
  // range high / low of the selected day
  if (r.range && d0 >= 0) { const xa = X(d0) - step / 2, xb = X(d1) + step / 2;
    seg(r.range.hi, C.brown, xa, xb, false, 1.6); seg(r.range.lo, C.brown, xa, xb, false, 1.6);
    lab("Range High", xb - 4, Y(r.range.hi) - 5, C.brown, "right", 11); lab("Range Low", xb - 4, Y(r.range.lo) + 14, C.brown, "right", 11);
    tags.push([Y(r.range.hi), C.brown, "RH"]); tags.push([Y(r.range.lo), C.brown, "RL"]); }
  // candles
  for (let i = f.i0; i <= f.i1; i++) { const c = cs[i], up = c[4] >= c[1]; g.strokeStyle = g.fillStyle = up ? C.up : C.dn;
    g.beginPath(); g.moveTo(X(i), Y(c[2])); g.lineTo(X(i), Y(c[3])); g.stroke(); const y1 = Y(Math.max(c[1], c[4])), y2 = Y(Math.min(c[1], c[4])); g.fillRect(X(i) - bw / 2, y1, bw, Math.max(1, y2 - y1)); }
  // setups of the selected day
  let nTrade = 0;
  for (const s of r.setups) {
    const d = s.d, col = d === 1 ? C.up : C.dn, isSel = s === sel, o = s.order;
    const num = (k, t, v, below) => { const i = idx(t); if (i < 0 || v == null) return; lab(k, X(i), below ? Y(v) + 16 : Y(v) - 7, C.brown, "center", 13); };
    if (s.kind === "SBS") {
      const ia = idx(s.aT), ib = idx(s.boT);
      if (ia >= 0 && ib >= 0) { seg(s.a, C.brown, X(ia), X(ib) + step / 2, false, 1.6); lab("SBS", X(ib) + step, Y(s.a) - 5, C.brown, "left", 11); }
      num("1", s.boT, d === 1 ? cs[ib] && cs[ib][2] : cs[ib] && cs[ib][3], d !== 1);
      num("2", s.p1T, s.p1, d === 1); num("3", s.nhT, s.h, d !== 1); num("4", s.swT, s.swPx, d === 1);
    } else { const ib = idx(s.brT); if (ib >= 0) { const ie = o && (o.exitT || o.endT) ? idx(o.exitT || o.endT) : d1; seg(s.level, C.brown, X(ib) - step / 2, X(Math.max(ie, ib + 3)), false, 1.6); lab("PTB", X(Math.max(ie, ib + 3)) + 4, Y(s.level) + 4, C.brown, "left", 11); } }
    if (!o) continue;
    const iA = idx(o.actT), iF = idx(o.fillT), iE = idx(o.exitT || o.endT), xA = iA >= 0 ? X(iA) - step / 2 : X(d0), xE = iE >= 0 ? X(iE) + step / 2 : X(d1) + step / 2;
    const cancelled = ["EXPIRED", "MISSED", "INVALID"].includes(o.state);
    seg(o.stop, C.dn, xA, xE, true); seg(o.tp, C.blue, xA, xE, true);
    seg(o.entry, cancelled ? C.sec : col, xA, iF >= 0 ? X(iF) : xE, true, 1.4);
    if (iF >= 0) {
      nTrade++; seg(o.entry, col, X(iF), xE, false, 1.8);
      const c = cs[iF], ya = d === 1 ? Y(c[3]) + 6 : Y(c[2]) - 6;
      g.save(); g.fillStyle = col; g.beginPath(); g.moveTo(X(iF), ya); g.lineTo(X(iF) - 6, ya + 9 * d); g.lineTo(X(iF) + 6, ya + 9 * d); g.closePath(); g.fill(); g.restore();
      lab(String(nTrade), X(iF), d === 1 ? ya + 21 : ya - 13, col, "center", 11);
    }
    if (o.exitT && iE >= 0) { const x = X(iE), y = Y(o.exitPx);
      g.save(); g.fillStyle = o.state === "STOPPED" ? C.dn : o.state === "TARGET" ? C.blue : C.amber; g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); g.restore();
      lab(`${o.R >= 0 ? "+" : ""}${o.R.toFixed(1)}R`, x, y - 9, o.state === "STOPPED" ? C.dn : C.blue); }
    if (cancelled && iE >= 0) lab(STAGE[o.state], X(iE), Y(o.entry) - 8, C.sec);
    if (isSel) { tags.push([Y(o.entry), col, "Entry"]); tags.push([Y(o.stop), C.dn, "SL"]); tags.push([Y(o.tp), C.blue, "TP"]); }
  }
  g.restore();
  Nav.timeAxis(g, cs, X, f.i0, f.i1, H, t => nyhm(t), C.sec);
  tags.push([Y(cs[n - 1][4]), C.ink, fmt(p, cs[n - 1][4])]);
  const tg = Nav.pinTags(tags, padT, H - padB).sort((a, b) => a[0] - b[0]);
  for (let i = 1; i < tg.length; i++) if (tg[i][0] - tg[i - 1][0] < 17) tg[i][0] = tg[i - 1][0] + 17;
  g.font = "bold 10px -apple-system,Segoe UI,Roboto,sans-serif"; g.textAlign = "left";
  tg.forEach(([y, col, txt]) => { g.fillStyle = col; g.fillRect(plotW + 6, y - 8, 64, 16); g.fillStyle = col === C.ink ? C.card : "#fff"; g.fillText(txt, plotW + 10, y + 4); });
  Nav.cross(cv, g, cs, { X, Y, C, plotW, H, padB, padT, fmtP: v => fmt(p, v), fmtT: t => `${ST.ny(t).date.slice(5)} ${nyhm(t)} NY` });
}

/* ---------- events ---------- */
$("#stTarget").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; tmode = b.dataset.v; ls.set("st-target", tmode); render(); });
document.addEventListener("click", e => { const r = e.target.closest("tr[data-st]"); if (r) openDetail(r.dataset.st);
  const d = e.target.closest("tr[data-stday]"); if (d && openSym) { selDate = d.dataset.stday; drawDetail(); $("#stCv").scrollIntoView({ block: "nearest" }); } });
$("#stClose").onclick = closeDetail;
$("#stSheet").addEventListener("click", e => { if (e.target.id === "stSheet") closeDetail(); });
Nav.attach($("#stCv"), { redraw: () => { if (openSym) drawDetail(); }, onMarker: () => {}, onSelect: () => {}, candles: () => cur });
window.addEventListener("fxdata", e => { data = e.detail; render(); });
addEventListener("resize", () => { if (openSym) drawDetail(); });
setInterval(() => { if (data && !document.hidden) render(); }, 60000);
if (window.FXApp && window.FXApp.data) { data = window.FXApp.data; render(); }
window.FXStoicUI = { rows: rowsOf, open: openDetail };
})();
