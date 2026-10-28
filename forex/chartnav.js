/* Chart navigation for the hand-drawn canvas charts (CRT tab and ICT tab).
 * Horizontal zoom / pan (pinch, one-finger drag, mouse drag, wheel, + / - buttons), price-axis zoom (drag on the price
 * scale), auto-scale, fit visible candles, fit selected setup, go to latest, reset, and a crosshair with OHLC.
 * It only decides WHICH candles are drawn and at what scale; the candles and the strategy results are never touched. */
const Nav = (() => {
  "use strict";
  const ST = new WeakMap();
  const MIN_W = 6;
  const raf = s => { if (s.pending) return; s.pending = true; requestAnimationFrame(() => { s.pending = false; s.o.redraw && s.o.redraw(); }); };

  function attach(cv, o) {
    let s = ST.get(cv);
    if (s) { Object.assign(s.o, o); return s; }
    s = { o, key: null, a: 0, b: 20, n: 0, auto: true, yLo: null, yHi: null, sel: null, hover: null, def: null, setup: null, k: null };
    ST.set(cv, s);
    cv.style.touchAction = "none";
    toolbar(cv, s);
    gestures(cv, s);
    return s;
  }

  /* called by a draw function: (re)start the view for a new setup, keep it for the same one */
  function view(cv, key, n, def, setup) {
    const s = ST.get(cv); if (!s) return null;
    if (s.key !== key) { Object.assign(s, { key, n, a: def.a, b: def.b, auto: true, yLo: null, yHi: null, sel: null, hover: null }); }
    else if (n !== s.n) { if (s.b >= s.n) { s.a += n - s.n; s.b += n - s.n; } s.n = n; }     // a new candle arrived: follow it if the latest was in view
    s.def = def; s.setup = setup || null;
    return s;
  }

  /* scale for this draw: X(i), Y(v), visible index range, and the price range (auto or manual) */
  function frame(cv, cs, box, levels) {
    const s = ST.get(cv), { padT, plotW, plotH } = box, n = cs.length;
    const a = s.a, b = s.b, step = plotW / (b - a);
    const i0 = Math.max(0, Math.floor(a)), i1 = Math.min(n - 1, Math.ceil(b));
    let hi = -Infinity, lo = Infinity;
    for (let i = i0; i <= i1; i++) { if (cs[i][2] > hi) hi = cs[i][2]; if (cs[i][3] < lo) lo = cs[i][3]; }
    if (!isFinite(hi)) { hi = 1; lo = 0; }
    if (s.auto) {             // the selected setup's levels count while any of its candles is on screen
      if (s.setup && s.setup.i1 >= a && s.setup.i0 <= b) for (const v of levels || []) if (v != null && isFinite(v)) { if (v > hi) hi = v; if (v < lo) lo = v; }
      const pad = (hi - lo) * 0.06 || hi * 0.001; hi += pad; lo -= pad;
    } else { hi = s.yHi; lo = s.yLo; }
    const X = i => 6 + (i - a + 0.5) * step, Y = v => padT + (hi - v) / (hi - lo) * plotH;
    s.k = { padT, plotW, plotH, step, a, hi, lo, n, hits: [] };
    return { X, Y, step, hi, lo, i0, i1, s };
  }

  function hit(cv, h) { const s = ST.get(cv); if (s && s.k) s.k.hits.push(h); }

  /* crosshair: selected (tap) or hovered (mouse) candle, its OHLC and the price under the finger */
  function cross(cv, g, cs, f) {
    const s = ST.get(cv); if (!s || !s.k) return;
    const c0 = s.sel || s.hover; if (!c0 || !cs[c0.i]) return;
    const { X, Y, C, plotW, H, padB, padT, fmtP, fmtT } = f, c = cs[c0.i], x = X(c0.i), y = Math.max(padT, Math.min(H - padB, Y(c0.price)));
    g.save(); g.strokeStyle = C.ink; g.globalAlpha = .55; g.setLineDash([3, 3]); g.lineWidth = 1;
    g.beginPath(); g.moveTo(x, padT - 4); g.lineTo(x, H - padB); g.moveTo(0, y); g.lineTo(plotW + 6, y); g.stroke(); g.restore();
    g.save(); g.font = "bold 10px -apple-system,Segoe UI,Roboto,sans-serif";
    g.fillStyle = C.ink; g.fillRect(plotW + 6, y - 8, 64, 16); g.fillStyle = C.card; g.fillText(fmtP(c0.price), plotW + 10, y + 4);
    const tt = fmtT(c[0]), tw = g.measureText(tt).width + 10, tx = Math.max(0, Math.min(plotW + 6 - tw, x - tw / 2));
    g.fillStyle = C.ink; g.fillRect(tx, H - padB + 2, tw, 16); g.fillStyle = C.card; g.textAlign = "center"; g.fillText(tt, tx + tw / 2, H - padB + 14);
    // OHLC box, top-left (moved right when the crosshair is in that corner)
    const up = c[4] >= c[1], txt = [`O ${fmtP(c[1])}`, `H ${fmtP(c[2])}`, `L ${fmtP(c[3])}`, `C ${fmtP(c[4])}`];
    g.textAlign = "left"; g.font = "600 10px -apple-system,Segoe UI,Roboto,sans-serif";
    const bw = Math.min(plotW, g.measureText(txt.join("  ")).width + 12), bx = x < bw + 20 && y < padT + 30 ? plotW + 4 - bw : 4;
    g.globalAlpha = .92; g.fillStyle = C.card; g.fillRect(bx, padT - 2, bw, 16); g.globalAlpha = 1; g.strokeStyle = C.line; g.strokeRect(bx, padT - 2, bw, 16);
    g.fillStyle = up ? C.up : C.dn; g.fillText(txt.join("  "), bx + 6, padT + 10);
    g.restore();
  }

  /* time-axis labels for the visible candles only */
  function timeAxis(g, cs, X, i0, i1, H, fmtT, color) {
    const n = i1 - i0 + 1, every = Math.max(1, Math.ceil(n / 4));
    g.save(); g.font = "10px -apple-system,Segoe UI,Roboto,sans-serif"; g.fillStyle = color; g.textAlign = "center";
    for (let i = i0; i <= i1; i++) if ((i - i0) % every === Math.min(1, every - 1)) g.fillText(fmtT(cs[i][0]), X(i), H - 6);
    g.restore();
  }

  /* ---- view changes ---- */
  function clamp(s) {
    let w = s.b - s.a; const n = Math.max(s.n, 2);
    w = Math.max(MIN_W, Math.min(n + 40, w));
    let a = Math.max(-w + 4, Math.min(n - 4, s.a));
    s.a = a; s.b = a + w;
  }
  function zoomAt(s, f, idx) {            // f < 1 zooms in, keeping candle idx at the same place on screen
    const w = s.b - s.a, nw = Math.max(MIN_W, Math.min(s.n + 40, w * f)), r = (idx - s.a) / w;
    s.a = idx - r * nw; s.b = s.a + nw; clamp(s);
  }
  function anchor(s) {                    // zoom buttons keep the selected candle, else the selected setup, else the centre
    if (s.sel) return s.sel.i + .5;
    if (s.setup && s.setup.i1 >= s.a && s.setup.i0 <= s.b) return Math.max(s.a, Math.min(s.b, (s.setup.i0 + s.setup.i1) / 2 + .5));
    return (s.a + s.b) / 2;
  }
  function act(s, what) {
    const w = s.b - s.a;
    if (what === "in") zoomAt(s, 0.7, anchor(s));
    else if (what === "out") zoomAt(s, 1 / 0.7, anchor(s));
    else if (what === "latest") { s.b = s.n + 3; s.a = s.b - w; clamp(s); }
    else if (what === "setup" && s.setup) { const p = Math.max(3, (s.setup.i1 - s.setup.i0) * .15); s.a = s.setup.i0 - p; s.b = s.setup.i1 + p + 1; s.auto = true; clamp(s); }
    else if (what === "fit" && s.k) {     // price range = the visible candles only
      const cs = s.o.candles ? s.o.candles() : null; if (!cs || !cs.length) return;
      let hi = -Infinity, lo = Infinity;
      for (let i = Math.max(0, Math.floor(s.a)); i <= Math.min(cs.length - 1, Math.ceil(s.b)); i++) { hi = Math.max(hi, cs[i][2]); lo = Math.min(lo, cs[i][3]); }
      if (!isFinite(hi)) return; const p = (hi - lo) * .06 || hi * .001; s.auto = false; s.yHi = hi + p; s.yLo = lo - p;
    }
    else if (what === "auto") { s.auto = !s.auto; if (!s.auto && s.k) { s.yHi = s.k.hi; s.yLo = s.k.lo; } }
    else if (what === "reset" && s.def) { s.a = s.def.a; s.b = s.def.b; s.auto = true; s.sel = null; clamp(s); }
    raf(s); sync(s);
  }
  function sync(s) { if (s.bar) s.bar.querySelector('[data-a="auto"]').classList.toggle("on", s.auto); }

  function toolbar(cv, s) {
    const bar = document.createElement("div"); bar.className = "cnav";
    bar.innerHTML = [["out", "−", "Zoom out"], ["in", "+", "Zoom in"], ["setup", "◎ Setup", "Fit the selected setup"], ["fit", "Fit", "Fit price to the visible candles"],
      ["auto", "Auto", "Auto-scale price"], ["latest", "⇥", "Go to the latest candle"], ["reset", "↺", "Reset view"]]
      .map(([a, t, h]) => `<button type="button" data-a="${a}" title="${h}" aria-label="${h}">${t}</button>`).join("");
    cv.parentNode.insertBefore(bar, cv);
    bar.addEventListener("click", e => { const b = e.target.closest("button"); if (b) act(s, b.dataset.a); });
    s.bar = bar; sync(s);
  }

  function gestures(cv, s) {
    const P = new Map(); let g0 = null, lastTap = null;
    const pt = e => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const idxAt = x => s.a + (x - 6) / s.k.step - .5;
    const priceAt = y => s.k.hi - (y - s.k.padT) / s.k.plotH * (s.k.hi - s.k.lo);
    const snap = () => {
      const ps = [...P.values()], m = ps.length > 1 ? { x: (ps[0].x + ps[1].x) / 2, y: (ps[0].y + ps[1].y) / 2 } : ps[0];
      return { a: s.a, b: s.b, hi: s.auto ? s.k.hi : s.yHi, lo: s.auto ? s.k.lo : s.yLo, step: s.k.step, m, d: ps.length > 1 ? Math.max(20, Math.abs(ps[0].x - ps[1].x)) : 0,
        t: g0 ? g0.t : Date.now(), moved: g0 ? g0.moved : 0, multi: (g0 && g0.multi) || ps.length > 1, axis: ps.length === 1 && ps[0].x > s.k.plotW + 6, start: m };
    };
    cv.addEventListener("pointerdown", e => {
      if (!s.k) return; e.preventDefault();
      try { cv.setPointerCapture(e.pointerId); } catch (err) {}
      if (!P.size) g0 = null;
      P.set(e.pointerId, pt(e)); g0 = snap(); if (P.size === 1) { g0.t = Date.now(); g0.moved = 0; g0.multi = false; }
    });
    cv.addEventListener("pointermove", e => {
      if (!s.k) return;
      const q = pt(e);
      if (!P.has(e.pointerId)) {        // mouse hover: crosshair follows the pointer
        if (e.pointerType === "mouse" && q.x < s.k.plotW + 6) { const i = Math.round(idxAt(q.x)); if (i >= 0 && i < s.k.n) { s.hover = { i, price: priceAt(q.y) }; raf(s); } }
        return;
      }
      P.set(e.pointerId, q);
      const ps = [...P.values()];
      if (ps.length === 1) {
        const dx = q.x - g0.start.x, dy = q.y - g0.start.y; g0.moved = Math.max(g0.moved, Math.hypot(dx, dy));
        if (g0.multi && g0.moved < 8) return;
        if (g0.axis) {                  // drag on the price scale: stretch / squeeze the price range
          const f = Math.exp(dy * 0.01), c = (g0.hi + g0.lo) / 2, h = (g0.hi - g0.lo) / 2 * f;
          s.auto = false; s.yHi = c + h; s.yLo = c - h;
        } else {
          const sh = -dx / g0.step; s.a = g0.a + sh; s.b = g0.b + sh; clamp(s);
          if (!s.auto) { const dv = dy * (g0.hi - g0.lo) / s.k.plotH; s.yHi = g0.hi + dv; s.yLo = g0.lo + dv; }
        }
      } else {                          // pinch: horizontal zoom around the fingers, plus pan
        const m = { x: (ps[0].x + ps[1].x) / 2 }, d = Math.max(20, Math.abs(ps[0].x - ps[1].x));
        g0.moved = 99;
        const w = Math.max(MIN_W, Math.min(s.n + 40, (g0.b - g0.a) * g0.d / d)), im = g0.a + (g0.m.x - 6) / g0.step - .5, ns = s.k.plotW / w;
        s.a = im - (m.x - 6) / ns + .5; s.b = s.a + w; clamp(s);
      }
      sync(s); raf(s);
    });
    const up = e => {
      if (!P.has(e.pointerId)) return;
      const q = P.get(e.pointerId); P.delete(e.pointerId);
      if (P.size === 1) { const keep = g0; g0 = snap(); g0.multi = true; g0.t = keep.t; g0.moved = keep.moved; return; }   // pinch -> one finger: no jump
      if (P.size || !g0) return;
      const tap = !g0.multi && g0.moved < 8 && Date.now() - g0.t < 450 && e.type === "pointerup";
      g0 = null;
      if (!tap) return;
      const now = Date.now();
      if (lastTap && now - lastTap.t < 320 && Math.hypot(q.x - lastTap.x, q.y - lastTap.y) < 24) { lastTap = null; act(s, "reset"); return; }   // double tap: reset
      lastTap = { t: now, x: q.x, y: q.y };
      onTap(q);
    };
    const onTap = q => {
      if (q.x > s.k.plotW + 6) return;
      let best = null, bd = 22;          // markers first (entry / exit / history), then candle selection
      for (const h of s.k.hits) { const d = Math.hypot(h.x - q.x, h.y - q.y); if (d < (h.r || 22) && d < bd) { bd = d; best = h; } }
      if (best && s.o.onMarker) { s.o.onMarker(best.data, q); return; }
      const i = Math.round(idxAt(q.x));
      if (i < 0 || i >= s.k.n) { s.sel = null; raf(s); return; }
      s.sel = s.sel && s.sel.i === i ? null : { i, price: priceAt(q.y) };
      s.o.onSelect && s.o.onSelect(s.sel);
      raf(s);
    };
    cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
    cv.addEventListener("pointerleave", e => { if (e.pointerType === "mouse" && s.hover) { s.hover = null; raf(s); } });
    cv.addEventListener("wheel", e => {
      if (!s.k) return; e.preventDefault();
      const q = pt(e);
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) { const dd = (e.deltaX || e.deltaY) / s.k.step; s.a += dd; s.b += dd; clamp(s); }
      else zoomAt(s, Math.exp(e.deltaY * 0.0015), idxAt(q.x) + .5);
      raf(s);
    }, { passive: false });
    cv.addEventListener("contextmenu", e => e.preventDefault());
  }

  const get = cv => ST.get(cv);
  return { attach, view, frame, hit, cross, timeAxis, get, act: (cv, w) => act(ST.get(cv), w) };
})();
