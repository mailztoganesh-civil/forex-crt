/* Silver Bullet tab: screener table (every symbol, the current New York session) + detail sheet with a navigable 5m chart.
 * Detection is forex/sb.js (same rules as scripts/silver_bullet_backtest.py); this file only draws its results. */
(() => {
"use strict";
const $ = s => document.querySelector(s);
const SB = window.FXSilverBullet;
const ls = { get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
             set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const digits = p => p.pip >= 0.1 ? 2 : p.pip >= 0.01 ? 3 : 5;
const fmt = (p, v) => v == null || !isFinite(v) ? "–" : Number(v).toFixed(digits(p));
const nyhm = t => { const m = SB.ny(t).min; return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); };
const local = t => { const d = new Date(t * 1000); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
const both = t => t ? `${nyhm(t)} NY · ${local(t)} yours` : "–";
const STATUS = { PRE: "Before window", WATCH: "Watching", RAID: "Liquidity raided", ORDER: "Order pending", IN_TRADE: "In trade", TARGET: "Target hit",
  STOPPED: "Stopped", TIME_EXIT: "Closed 15:55", EXPIRED: "Expired 11:00", MISSED: "Missed", NO_TRADE: "No trade", NO_SETUP: "No setup", NO_DATA: "No data" };
const RANK = { IN_TRADE: 0, ORDER: 1, RAID: 2, WATCH: 3, TARGET: 4, STOPPED: 5, TIME_EXIT: 6, MISSED: 7, EXPIRED: 8, NO_TRADE: 9, NO_SETUP: 10, PRE: 11, NO_DATA: 12 };
let data = null, openSym = null, entry = ls.get("sb-entry", "breaker"), tmode = ls.get("sb-target", "dol");
const now = () => Date.now() / 1000;
const rowsOf = () => ((data && data.pairs) || []).map(p => ({ p, s: SB.session((p.ltf && p.ltf["5m"]) || [], now(), entry, tmode) }));

/* ---------- screener ---------- */
function windowLine() {
  // 10:00 NY today in the viewer's clock
  const t = now(), n = SB.ny(t), m = n.min, open = t + (600 - m) * 60, close = open + 3600;
  const state = m < 600 ? `opens in ${Math.floor((600 - m) / 60)}h ${(600 - m) % 60}m` : m < 660 ? `<b>open</b> – closes in ${660 - m}m` : "closed for today";
  return `Window 10:00–11:00 New York = <b>${local(open)}–${local(close)}</b> your time · ${state}`;
}
function render() {
  if (!data) return;
  document.querySelectorAll("#sbEntry button").forEach(b => b.classList.toggle("on", b.dataset.v === entry));
  document.querySelectorAll("#sbTarget button").forEach(b => b.classList.toggle("on", b.dataset.v === tmode));
  $("#sbClock").innerHTML = windowLine();
  const rows = rowsOf().sort((a, b) => RANK[a.s.status] - RANK[b.s.status] || a.p.sym.localeCompare(b.p.sym));
  const day = rows.find(r => r.s.date) ? rows.find(r => r.s.date).s.date : "";
  $("#sbTable").innerHTML = `<h2>Session ${esc(day)} <span style="text-transform:none;letter-spacing:0;font-weight:600">· ${rows.length} symbols · entry: ${entry} · target: ${tmode === "dol" ? "opposite liquidity" : "2R"}</span></h2>` +
    `<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Symbol</th><th>Status</th><th>Side</th><th>Liquidity (SSL / BSL)</th><th>Entry</th><th>Stop</th><th>Target</th><th>R:R</th><th>When (NY)</th></tr></thead><tbody>` +
    rows.map(({ p, s }) => { const o = s.order || {}, side = s.side ? (s.side === 1 ? "▲ Long" : "▼ Short") : s.raids ? Object.keys(s.raids).map(k => k === "1" ? "SSL raided" : "BSL raided").join(", ") : "–";
      const when = o.exitT ? nyhm(o.exitT) : o.fillT ? nyhm(o.fillT) : s.mssT ? nyhm(s.mssT) : s.raids ? nyhm(Object.values(s.raids)[0].t) : "–";
      return `<tr data-sb="${esc(p.sym)}"><td>${esc(p.sym)}</td><td><span class="sbst sb-${s.status}">${STATUS[s.status] || s.status}</span>${o.R != null ? ` <b>${o.R >= 0 ? "+" : ""}${o.R.toFixed(2)}R</b>` : ""}</td>` +
        `<td>${side}</td><td>${fmt(p, s.ssl)} / ${fmt(p, s.bsl)}</td><td>${fmt(p, o.entry)}</td><td>${fmt(p, o.stop)}</td><td>${fmt(p, o.tp)}</td><td>${o.rr != null ? o.rr.toFixed(1) : "–"}</td><td>${when}</td></tr>`; }).join("") +
    `</tbody></table></div>`;
  if (openSym) drawDetail();
}

/* ---------- detail ---------- */
function strip(p, s) {
  const o = s.order, sp = (c, x) => `<span class="${c}">${x}</span>`, L = [];
  L.push(sp("", `<b>${s.side === 1 ? "▲ Long" : s.side === -1 ? "▼ Short" : "No side yet"}</b> · Silver Bullet 10–11 NY · ${esc(s.date || "")}`));
  if (!o) { L.push(sp("can", STATUS[s.status] || s.status)); return L.join(""); }
  const lim = entry === "market" ? "market" : `${s.side === 1 ? "BUY" : "SELL"} limit`;
  L.push(sp("pend", `${lim} ${fmt(p, o.entry)} (${entry})`), sp("", `active ${o.activeT ? nyhm(o.activeT) + " NY" : "–"}`));
  if (o.fillT) L.push(sp("fill", `<b>FILLED</b> ${nyhm(o.fillT)} @ ${fmt(p, o.fillPx)}`));
  else if (s.status === "ORDER") L.push(sp("pend", "<b>PENDING</b> – not executed"));
  if (o.exitT) L.push(sp(o.state === "STOPPED" ? "sl" : "tp", `<b>${{ STOPPED: "STOP", TARGET: "TARGET", TIME_EXIT: "15:55 CLOSE" }[o.state]}</b> ${nyhm(o.exitT)} @ ${fmt(p, o.exitPx)} (${o.R >= 0 ? "+" : ""}${o.R.toFixed(2)}R)`));
  else if (["EXPIRED", "MISSED", "NO_TRADE"].includes(o.state)) L.push(sp("can", `<b>${STATUS[o.state].toUpperCase()}</b>${o.t ? " " + nyhm(o.t) : ""} – ${esc(o.why || "")}`));
  if (o.note) L.push(`<span class="can note">* ${esc(o.note)}</span>`);
  return L.join("");
}
function openDetail(sym) { openSym = sym; $("#sbSheet").hidden = false; hidePop(); drawDetail(); }
function closeDetail() { openSym = null; $("#sbSheet").hidden = true; hidePop(); }
function drawDetail() {
  const r = rowsOf().find(x => x.p.sym === openSym); if (!r) return closeDetail();
  const { p, s } = r, o = s.order || {};
  $("#sbTitle").textContent = `${p.sym} · Silver Bullet`;
  const b = $("#sbBadge"); b.textContent = STATUS[s.status] || s.status; b.className = "badge sbst sb-" + s.status;
  $("#sbTrade").innerHTML = strip(p, s);
  const L = [["Session (NY date)", esc(s.date || "–")], ["Sell-side liquidity (00:00–09:55 low)", fmt(p, s.ssl)], ["Buy-side liquidity (00:00–09:55 high)", fmt(p, s.bsl)]];
  if (s.raids) for (const [k, v] of Object.entries(s.raids)) L.push([`${k === "1" ? "SSL" : "BSL"} raided`, `${both(v.t)} · extreme ${fmt(p, v.extPx)}`]);
  if (s.mssT) L.push(["Raid (setup side)", both(s.raidT)], ["Extreme = stop", `${fmt(p, s.extPx)} · ${both(s.extT)}`], ["MSS (5m close beyond the swing)", `${both(s.mssT)} · level ${fmt(p, s.brk)}`],
    ["FVG", s.fvg != null ? `${fmt(p, s.fvgLo)}–${fmt(p, s.fvgHi)} (entry edge ${fmt(p, s.fvg)})` : "none between the extreme and the MSS"], ["Breaker (broken swing)", fmt(p, s.brk)]);
  if (o.entry != null) L.push(["Entry (" + entry + ")", fmt(p, o.entry)], ["Order active from", o.activeT ? both(o.activeT) : "–"], ["Stop", fmt(p, o.stop)],
    ["Target (" + (tmode === "dol" ? "opposite liquidity" : "2R") + ")", fmt(p, o.tp)], ["R:R", o.rr != null ? o.rr.toFixed(2) : "–"]);
  if (o.fillT) L.push(["Simulated fill", `${both(o.fillT)} @ ${fmt(p, o.fillPx)}`]);
  if (o.exitT) L.push(["Exit", `${both(o.exitT)} @ ${fmt(p, o.exitPx)} · ${o.R >= 0 ? "+" : ""}${o.R.toFixed(2)}R`]);
  if (o.state === "IN_TRADE") L.push(["Open result", `${o.openR >= 0 ? "+" : ""}${o.openR.toFixed(2)}R at ${fmt(p, o.last)}`]);
  if (o.why) L.push(["Reason", esc(o.why)]);
  L.push(["Data up to", s.candles && s.candles.length ? both(s.candles[s.candles.length - 1][0] + 300) + " (closed 5m candles only)" : "–"]);
  $("#sbLv").innerHTML = L.map(([k, v]) => `<div>${k}<b>${v}</b></div>`).join("");
  draw(p, s);
}

/* ---------- chart ---------- */
let cur = [];
function draw(p, s) {
  const cv = $("#sbCv"), cs = s.candles || []; cur = cs;
  const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr;
  const g = cv.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
  const C = { ink: css("--ink"), sec: css("--sec"), line: css("--line"), up: css("--green"), dn: css("--red"), blue: css("--blue"), amber: css("--amber"), card: css("--card") || "#fff" };
  if (cs.length < 3) { g.fillStyle = C.sec; g.font = "13px -apple-system,Segoe UI,Roboto,sans-serif"; g.fillText("No 5-minute candles for this session yet.", 10, H / 2); return; }
  const o = s.order || {}, n = cs.length, M = cs.map(c => SB.ny(c[0]).min), at = m => { const i = M.findIndex(x => x >= m); return i < 0 ? n : i; }, idx = t => cs.findIndex(c => c[0] === t);
  const iEnd = o.exitT ? idx(o.exitT) : o.t ? idx(o.t) : n - 1;
  const setup = { i0: Math.max(0, at(540)), i1: Math.max(Math.min(n - 1, at(660)), iEnd) };
  const padR = 64, padB = 22, padT = 18, plotW = W - padR - 6, plotH = H - padB - padT;
  Nav.view(cv, `${p.sym}|${s.date}|${entry}|${tmode}`, n, null, setup);
  const f = Nav.frame(cv, cs, { padT, plotW, plotH }, { core: [o.entry, o.stop, s.brk, s.extPx, s.fvgLo, s.fvgHi], far: [o.tp, s.ssl, s.bsl] });
  const { X, Y, step } = f, bw = Math.max(1.2, Math.min(18, step * 0.62)), tags = [];
  g.font = "11px -apple-system,Segoe UI,Roboto,sans-serif";
  for (let k = 0; k <= 4; k++) { const v = f.lo + (f.hi - f.lo) * k / 4, y = Y(v); g.strokeStyle = C.line; g.beginPath(); g.moveTo(0, y); g.lineTo(plotW + 6, y); g.stroke(); g.fillStyle = C.sec; g.fillText(fmt(p, v), plotW + 10, y + 4); }
  g.save(); g.beginPath(); g.rect(0, 0, plotW + 6, H - padB); g.clip();
  const lab = (txt, x, y, col, al) => { if (x < -30 || x > plotW + 30) return; g.save(); g.font = "bold 10px -apple-system,Segoe UI,Roboto,sans-serif"; g.fillStyle = col; g.textAlign = al || "center"; g.fillText(txt, x, y); g.restore(); };
  const hl = (v, col, txt, x0, dash, w) => { if (v == null) return; const y = Y(v); g.save(); g.strokeStyle = col; g.lineWidth = w || 1.3; g.setLineDash(dash ? [5, 4] : []); g.beginPath(); g.moveTo(x0, y); g.lineTo(plotW + 6, y); g.stroke(); g.restore(); if (txt) tags.push([y, col, txt]); };
  // the 10:00-11:00 window and the 09:30 open
  const w0 = at(600), w1 = at(660), xw0 = X(w0) - step / 2, xw1 = X(w1) - step / 2;
  g.save(); g.globalAlpha = .12; g.fillStyle = C.up; g.fillRect(xw0, padT - 4, Math.max(2, xw1 - xw0), plotH + 4); g.restore(); lab("Silver Bullet 10–11", (xw0 + xw1) / 2, padT + 2, C.up);
  const i930 = at(570); g.save(); g.strokeStyle = C.sec; g.setLineDash([3, 4]); g.globalAlpha = .6; g.beginPath(); g.moveTo(X(i930) - step / 2, padT - 4); g.lineTo(X(i930) - step / 2, H - padB); g.stroke(); g.restore();
  lab("09:30", X(i930) - step / 2, H - padB - 4, C.sec);
  // liquidity (the 00:00-09:55 range)
  hl(s.ssl, C.dn, "SSL", 0, true, 1.2); hl(s.bsl, C.blue, "BSL", 0, true, 1.2);
  // FVG box (behind the candles)
  if (s.fvgT != null && s.fvgLo != null) { const iz = idx(s.fvgT), x1 = X(iz) - step / 2; g.save(); g.globalAlpha = .14; g.fillStyle = C.blue; g.fillRect(x1, Y(s.fvgHi), plotW + 6 - x1, Y(s.fvgLo) - Y(s.fvgHi)); g.restore();
    lab("FVG", x1 + 4, Y(Math.max(s.fvgHi, s.fvgLo)) - 4, C.blue, "left"); }
  for (let i = f.i0; i <= f.i1; i++) { const c = cs[i], up = c[4] >= c[1]; g.strokeStyle = g.fillStyle = up ? C.up : C.dn;
    g.beginPath(); g.moveTo(X(i), Y(c[2])); g.lineTo(X(i), Y(c[3])); g.stroke(); const y1 = Y(Math.max(c[1], c[4])), y2 = Y(Math.min(c[1], c[4])); g.fillRect(X(i) - bw / 2, y1, bw, Math.max(1, y2 - y1)); }
  // raids (before an MSS: every raided side; after: the setup's extreme)
  if (s.raids) for (const [k, v] of Object.entries(s.raids)) { const i = idx(v.extT); if (i >= 0) { g.fillStyle = C.amber; g.beginPath(); g.arc(X(i), Y(v.extPx), 4, 0, 7); g.fill(); lab("Raid", X(i), k === "1" ? Y(v.extPx) + 15 : Y(v.extPx) - 8, C.amber); } }
  if (s.mssT) {
    const d = s.side, col = d === 1 ? C.up : C.dn, iX = idx(s.extT), iR = idx(s.refT), iM = idx(s.mssT);
    if (iX >= 0) { g.fillStyle = C.dn; g.beginPath(); g.arc(X(iX), Y(s.extPx), 4, 0, 7); g.fill(); lab("Raid", X(iX), d === 1 ? Y(s.extPx) + 15 : Y(s.extPx) - 8, C.dn); Nav.hit(cv, { x: X(iX), y: Y(s.extPx), data: { what: "raid" } }); }
    if (iR >= 0 && iM >= 0) { const y = Y(s.brk); g.save(); g.strokeStyle = col; g.lineWidth = 2; g.beginPath(); g.moveTo(X(iR), y); g.lineTo(X(iM) + step / 2, y); g.stroke(); g.restore();
      lab("MSS", X(iM), d === 1 ? y - 6 : y + 14, col); Nav.hit(cv, { x: X(iM), y, data: { what: "mss" } }); }
    // order: pending (dashed from the activation), fill (arrow), exit (✕ stop / ✓ target / ◆ 15:55), cancelled (grey ✕ + reason)
    if (o.entry != null) {
      const iA = Math.min(n, iM + 1), xA = (iA < n ? X(iA) : X(n - 1) + step) - step / 2, yE = Y(o.entry), iF = o.fillT ? idx(o.fillT) : -1, iE = o.exitT ? idx(o.exitT) : o.t ? idx(o.t) : -1;
      const cancelled = ["EXPIRED", "MISSED", "NO_TRADE"].includes(o.state), pc = cancelled ? C.sec : col, xEnd = cancelled && iE >= 0 ? X(iE) + step / 2 : plotW + 6;
      hl(o.stop, C.dn, "SL", xA, true); hl(o.tp, C.blue, tmode === "dol" ? "TP (DOL)" : "TP 2R", xA, true);
      g.save(); g.strokeStyle = pc; g.lineWidth = 1.4; g.setLineDash([6, 4]); g.beginPath(); g.moveTo(xA, yE); g.lineTo(iF >= 0 ? X(iF) : xEnd, yE); g.stroke(); g.restore();
      g.save(); g.strokeStyle = pc; g.fillStyle = C.card; g.lineWidth = 1.5; g.beginPath(); g.moveTo(xA, yE - 5); g.lineTo(xA + 5, yE); g.lineTo(xA, yE + 5); g.lineTo(xA - 5, yE); g.closePath(); g.fill(); g.stroke(); g.restore();
      Nav.hit(cv, { x: xA, y: yE, data: { what: "activate" } });
      if (iF >= 0) {
        const c = cs[iF], ya = d === 1 ? Y(c[3]) + 6 : Y(c[2]) - 6, dd = d;
        g.save(); g.strokeStyle = col; g.lineWidth = 2; g.beginPath(); g.moveTo(X(iF), yE); g.lineTo(iE >= 0 && o.exitT ? X(iE) : plotW + 6, yE); g.stroke(); g.restore();
        g.save(); g.fillStyle = col; g.beginPath(); g.moveTo(X(iF), ya); g.lineTo(X(iF) - 6, ya + 9 * dd); g.lineTo(X(iF) + 6, ya + 9 * dd); g.closePath(); g.fill(); g.restore();
        lab(`${d === 1 ? "BUY" : "SELL"} ${nyhm(o.fillT)}`, X(iF), d === 1 ? Math.min(H - padB - 2, ya + 22) : Math.max(padT + 10, ya - 14), col);
        Nav.hit(cv, { x: X(iF), y: ya + 5 * dd, r: 26, data: { what: "fill" } }); tags.push([yE, col, "Entry"]);
      } else tags.push([yE, pc, cancelled ? "Cancelled" : entry === "market" ? "Market" : "LMT"]);
      if (o.exitT && iE >= 0) { const x = X(iE), y = Y(o.exitPx);
        g.save(); if (o.state === "STOPPED") { g.strokeStyle = C.dn; g.lineWidth = 2.4; g.beginPath(); g.moveTo(x - 5, y - 5); g.lineTo(x + 5, y + 5); g.moveTo(x + 5, y - 5); g.lineTo(x - 5, y + 5); g.stroke(); }
        else if (o.state === "TARGET") { g.fillStyle = C.blue; g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill(); }
        else { g.fillStyle = C.amber; g.beginPath(); g.moveTo(x, y - 6); g.lineTo(x + 6, y); g.lineTo(x, y + 6); g.lineTo(x - 6, y); g.fill(); } g.restore();
        lab(`${{ STOPPED: "SL", TARGET: "TP", TIME_EXIT: "15:55" }[o.state]}${o.note ? "*" : ""} ${nyhm(o.exitT)}`, x, y - 10, o.state === "STOPPED" ? C.dn : C.blue);
        Nav.hit(cv, { x, y, data: { what: "exit" } }); }
      if (cancelled && iE >= 0) { const x = X(iE); g.save(); g.strokeStyle = C.sec; g.lineWidth = 2.2; g.beginPath(); g.moveTo(x - 5, yE - 5); g.lineTo(x + 5, yE + 5); g.moveTo(x + 5, yE - 5); g.lineTo(x - 5, yE + 5); g.stroke(); g.restore();
        lab(`${STATUS[o.state]} ${nyhm(o.t)}`, x, yE - 9, C.sec); Nav.hit(cv, { x, y: yE, data: { what: "cancel" } }); }
    }
  }
  g.restore();
  // time axis (NY) + price tags + crosshair
  Nav.timeAxis(g, cs, X, f.i0, f.i1, H, t => nyhm(t), C.sec);
  if (p.price != null) tags.push([Y(cs[n - 1][4]), C.blue, fmt(p, cs[n - 1][4])]);
  const tg = Nav.pinTags(tags, padT, H - padB).sort((a, b) => a[0] - b[0]);
  for (let i = 1; i < tg.length; i++) if (tg[i][0] - tg[i - 1][0] < 17) tg[i][0] = tg[i - 1][0] + 17;
  g.font = "bold 10px -apple-system,Segoe UI,Roboto,sans-serif"; g.textAlign = "left";
  tg.forEach(([y, col, txt]) => { g.fillStyle = col; g.fillRect(plotW + 6, y - 8, 64, 16); g.fillStyle = "#fff"; g.fillText(txt, plotW + 10, y + 4); });
  Nav.cross(cv, g, cs, { X, Y, C, plotW, H, padB, padT, fmtP: v => fmt(p, v), fmtT: t => `${nyhm(t)} NY` });
}
function pop(data, q) {
  const cv = $("#sbCv"), wrap = cv.parentNode; let el = wrap.querySelector(".mpop");
  if (!el) { el = document.createElement("div"); el.className = "mpop"; wrap.appendChild(el); }
  const r = rowsOf().find(x => x.p.sym === openSym); if (!r) return;
  el.innerHTML = `<button type="button" class="x" aria-label="Close">✕</button>` + $("#sbLv").innerHTML.replace(/<div>/g, "<div><span>").replace(/<b>/g, "</span><b>") +
    `<div class="muted">Simulated from 5-minute high/low, no costs; the order of events inside one candle is unknown.</div>`;
  el.hidden = false; el.style.top = (cv.offsetTop + 4) + "px";
}
function hidePop() { const el = document.querySelector("#sbSheet .mpop"); if (el) el.hidden = true; }

/* ---------- events ---------- */
$("#sbEntry").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; entry = b.dataset.v; ls.set("sb-entry", entry); render(); });
$("#sbTarget").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; tmode = b.dataset.v; ls.set("sb-target", tmode); render(); });
document.addEventListener("click", e => { const r = e.target.closest("tr[data-sb]"); if (r) openDetail(r.dataset.sb); });
$("#sbClose").onclick = closeDetail;
$("#sbSheet").addEventListener("click", e => { if (e.target.id === "sbSheet") closeDetail(); if (e.target.closest(".mpop .x")) hidePop(); });
Nav.attach($("#sbCv"), { redraw: () => { if (openSym) drawDetail(); }, onMarker: (d, q) => pop(d, q), onSelect: hidePop, candles: () => cur });
window.addEventListener("fxdata", e => { data = e.detail; render(); });
addEventListener("resize", () => { if (openSym) drawDetail(); });
setInterval(() => { if (data && !document.hidden) render(); }, 60000);     // window countdown, 11:00 expiry
if (window.FXApp && window.FXApp.data) { data = window.FXApp.data; render(); }
window.FXSBUI = { rows: rowsOf, open: openDetail };
})();
