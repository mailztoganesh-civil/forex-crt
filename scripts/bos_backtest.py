"""Backtest of the "Simple BOS Entry" video (BOS -> FVG -> order block -> retest entry -> previous high / liquidity).
The video gives no stop, no definition of "bullish confirmation" and no target rule beyond "next liquidity", so the rules
below are our exact reading of it; every choice is fixed up front (nothing fitted) and the same for all pairs and timeframes.

Bullish (bearish mirrored), on one setup timeframe (1D, 4H, 2H or 1H; NY-anchored candles as in the app):
  swing high   pivot with K=3 lower highs on each side; known once the 3 candles after it have closed
  BOS          the first candle that CLOSES above the most recent confirmed, not-yet-broken swing high
  leg low      lowest low between that swing high and the BOS candle
  order block  the last bearish candle (close < open) at or up to 3 candles before the leg low; none -> no setup
  FVG          the first bullish gap in the leg after the leg low: low[i+1] > high[i-1]
  target       "next liquidity": the nearest older swing high above the entry that price has not traded through since
               (last 100 candles); none -> 2R. A second run uses a fixed 2R target for comparison.
  stop         below the order block low (the video draws none; this is the usual rule)
  expiry       10 setup candles after the BOS; a setup-timeframe close below the OB low before entry cancels it
Entry variants:
  ob_limit     buy limit at the OB high, active from the BOS candle close
  fvg_limit    buy limit at the top of the FVG (setups with an FVG only), active from the BOS candle close
  confirm      "buy on confirmation": after price touches the zone (OB high or FVG top), the first setup candle that
               closes bullish (close > open) and above the OB low -> market buy at the next candle's open; stop = the
               lower of the OB low and the lowest low since the touch
Execution on 5-minute bars with spread + slippage per pair (crt_backtest.COST); a 5m bar that touches stop and target
counts as a stop; a limit fill and the target in the same 5m bar = no trade; max holding time as in the ICT backtest.
Periods: train 2023-01..2024-06, validation 2024-07..2025-06, test 2025-07..end.

Usage: python scripts/bos_backtest.py <forex-data checkout>   -> forex/backtest/BOS_VALIDATION.md + bos_<tf>_<pair>.json
"""
import json, math, os, sys
import numpy as np
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import forex_crt as F       # noqa: E402
import crt_backtest as B    # noqa: E402

OUT = os.path.join(HERE, "..", "forex", "backtest")
PAIRS = ["EURUSD", "GBPUSD", "AUDUSD", "NZDUSD", "USDCAD", "USDCHF", "USDJPY", "XAUUSD"]
TFS = ["D", "4H", "2H", "1H"]
SEC = {"D": 86400, "4H": 14400, "2H": 7200, "1H": 3600}
HOLD = {"D": 20 * 86400, "4H": 5 * 86400, "2H": 3 * 86400, "1H": 2 * 86400}
K, OB_BACK, EXPIRY, LIQ_BACK = int(os.environ.get("BOS_K", "3")), 3, 10, 100
# stress settings (robustness checks only; defaults = the rules above)
DELAY_MIN = int(os.environ.get("BOS_DELAY_MIN", "0"))        # limit order placed this many minutes after the BOS close
THROUGH = float(os.environ.get("BOS_THROUGH_PIPS", "0"))     # a limit fills only if price trades this many pips through it
COST_X = float(os.environ.get("BOS_COST_X", "1"))            # multiply spread + slippage
AGG = {"Open": "first", "High": "max", "Low": "min", "Close": "last"}
VARIANTS = ["ob_limit", "fvg_limit", "confirm"]


def pivots(H, L):
    n = len(H); sh = np.zeros(n, bool); sl = np.zeros(n, bool)
    for i in range(K, n - K):
        if H[i] > H[i - K:i].max() and H[i] >= H[i + 1:i + K + 1].max(): sh[i] = True
        if L[i] < L[i - K:i].min() and L[i] <= L[i + 1:i + K + 1].min(): sl[i] = True
    return sh, sl


def setups(c):
    """All BOS setups on candles c = [[t,o,h,l,c],...] (closed candles only). Uses only candles up to the BOS candle."""
    T = np.array([x[0] for x in c]); O, H, L, C = (np.array([x[k] for x in c]) for k in (1, 2, 3, 4))
    sh, sl = pivots(H, L); n = len(c); out = []
    for d in (1, -1):
        piv = sh if d == 1 else sl
        ext = H if d == 1 else L                   # the swing side
        last = None; used = set()
        for j in range(K + 1, n):
            p = j - 1 - K                          # pivot confirmed at the close of p+K <= j-1
            if p >= 0 and piv[p]: last = p
            if last is None or last in used: continue
            lvl = ext[last]
            if not ((C[j] > lvl and C[j - 1] <= lvl) if d == 1 else (C[j] < lvl and C[j - 1] >= lvl)): continue
            used.add(last)
            seg = range(last, j + 1)
            m = min(seg, key=lambda i: L[i]) if d == 1 else max(seg, key=lambda i: H[i])     # leg origin
            ob = next((i for i in range(m, max(-1, m - OB_BACK - 1), -1) if (C[i] < O[i] if d == 1 else C[i] > O[i])), None)
            if ob is None: continue
            fvg = None
            for i in range(m + 1, j):
                if d == 1 and L[i + 1] > H[i - 1]: fvg = (H[i - 1], L[i + 1]); break
                if d == -1 and H[i + 1] < L[i - 1]: fvg = (H[i + 1], L[i - 1]); break
            out.append({"d": d, "j": j, "t": int(T[j]), "ob": (float(L[ob]), float(H[ob])), "fvg": fvg, "sw": int(last)})
    return out, (T, O, H, L, C, sh, sl)


def liquidity(d, k, price, arr):
    """nearest older swing beyond price, confirmed by candle k and not traded through since (last LIQ_BACK candles)"""
    T, O, H, L, C, sh, sl = arr
    best = None
    for p in range(max(0, k - LIQ_BACK), k - K + 1):
        if d == 1 and sh[p] and H[p] > price and H[p + 1:k + 1].max() < H[p]:
            best = H[p] if best is None else min(best, H[p])
        if d == -1 and sl[p] and L[p] < price and L[p + 1:k + 1].min() > L[p]:
            best = L[p] if best is None else max(best, L[p])
    return best


def run_trade(d, entry, sl, tp, t_from, t_exp, m5, pair, tf, limit=True, t_mkt=None):
    T, O, H, L, C = m5
    pip = B.PIP[pair]; spread, slip = B.COST[pair]; hs, sp = spread * COST_X / 2 * pip, slip * COST_X * pip
    if limit:
        a = int(np.searchsorted(T, t_from + DELAY_MIN * 60, "left")); e = int(np.searchsorted(T, t_exp, "left")); fill = None
        for k in range(a, min(e, len(T))):
            touch = (L[k] + hs <= entry - THROUGH * pip) if d == 1 else (H[k] - hs >= entry + THROUGH * pip)   # buy limit: ASK reaches it; sell limit: BID
            stop = (L[k] - hs <= sl) if d == 1 else (H[k] + hs >= sl)                                          # long stopped at the bid, short at the ask
            tgt = (H[k] - hs >= tp) if d == 1 else (L[k] + hs <= tp)
            if touch:
                if tgt and not stop: return {"filled": False, "why": "fill and target in one bar"}
                fill = k; break
            if tgt: return {"filled": False, "why": "missed"}
        if fill is None: return {"filled": False, "why": "expired"}
        px = entry
    else:                                          # market order at the open of the next setup candle
        fill = int(np.searchsorted(T, t_mkt, "left"))
        if fill >= len(T): return {"filled": False, "why": "no data"}
        px = O[fill] + d * (hs + sp)
    risk = (px - sl) * d
    if risk <= 0 or (tp - px) * d <= 0: return {"filled": False, "why": "bad levels"}
    end = int(np.searchsorted(T, T[fill] + HOLD[tf], "left"))
    for k in range(fill, min(end, len(T))):
        stop = (L[k] - hs <= sl) if d == 1 else (H[k] + hs >= sl)
        tgt = (H[k] - hs >= tp) if d == 1 else (L[k] + hs <= tp)
        if stop: return {"filled": True, "R": d * ((sl - d * sp) - px) / risk, "how": "stop", "t": int(T[fill])}
        if tgt: return {"filled": True, "R": d * (tp - px) / risk, "how": "target", "t": int(T[fill])}
    k = min(end, len(T)) - 1
    return {"filled": True, "R": d * ((C[k] - d * (hs + sp)) - px) / risk, "how": "time", "t": int(T[fill])}


def simulate(s, arr, m5, pair, tf, variant, tmode):
    T, O, H, L, C, sh, sl_ = arr
    d, j = s["d"], s["j"]; obl, obh = s["ob"]; stop = obl if d == 1 else obh
    n = len(T); t_act = int(T[j]) + SEC[tf]; t_exp = int(T[min(j + EXPIRY, n - 1)]) + SEC[tf]
    # a setup-timeframe close beyond the OB before entry cancels the order (known at that candle's close)
    for k in range(j + 1, min(j + EXPIRY + 1, n)):
        if (C[k] < obl) if d == 1 else (C[k] > obh): t_exp = min(t_exp, int(T[k]) + SEC[tf]); break
    def tgt(px, risk, k):
        if tmode == "2R": return px + d * 2 * risk
        lq = liquidity(d, k, px, arr); return lq if lq is not None else px + d * 2 * risk
    if variant in ("ob_limit", "fvg_limit"):
        if variant == "fvg_limit" and not s["fvg"]: return None
        entry = (obh if d == 1 else obl) if variant == "ob_limit" else (s["fvg"][1] if d == 1 else s["fvg"][0])
        risk = (entry - stop) * d
        if risk <= 0: return None
        return run_trade(d, entry, stop, tgt(entry, risk, j), t_act, t_exp, m5, pair, tf)
    # confirm: touch of the zone, then a bullish close above the OB low (setup timeframe); market entry next candle
    zone = max(obh, s["fvg"][1]) if (d == 1 and s["fvg"]) else min(obl, s["fvg"][0]) if (d == -1 and s["fvg"]) else (obh if d == 1 else obl)
    touched = None
    for k in range(j + 1, min(j + EXPIRY + 1, n - 1)):
        if (C[k] < obl) if d == 1 else (C[k] > obh): return {"filled": False, "why": "invalidated"}
        if touched is None and ((L[k] <= zone) if d == 1 else (H[k] >= zone)): touched = k
        if touched is not None and ((C[k] > O[k] and C[k] > obl) if d == 1 else (C[k] < O[k] and C[k] < obh)):
            st = min(obl, L[touched:k + 1].min()) if d == 1 else max(obh, H[touched:k + 1].max())
            px_ref = O[k + 1]; risk = (px_ref - st) * d
            if risk <= 0: return None
            return run_trade(d, None, st, tgt(px_ref, risk, k), None, None, m5, pair, tf, limit=False, t_mkt=int(T[k + 1]))
    return {"filled": False, "why": "no confirmation"}


def stats(rs):
    if not rs: return None
    n = len(rs); m = sum(rs) / n; sd = math.sqrt(sum((r - m) ** 2 for r in rs) / (n - 1)) if n > 1 else 0
    gw = sum(r for r in rs if r > 0); gl = -sum(r for r in rs if r < 0); eq = pk = dd = 0.0
    for r in rs: eq += r; pk = max(pk, eq); dd = max(dd, pk - eq)
    return {"n": n, "exp": m, "se": sd / math.sqrt(n) if n > 1 else None, "pf": gw / gl if gl else None, "win": sum(1 for r in rs if r > 0) / n * 100, "dd": dd}


def split_of(t):
    return next(nm for nm, a, b in B.SPLITS if pd.Timestamp(a).timestamp() <= t < pd.Timestamp(b).timestamp())


def run(root):
    trades = []                                    # (t, R, tf, variant, tmode, pair, split, direction)
    funnel = {}
    for pair in PAIRS:
        m5df = B.load5(root, pair)
        m5 = (np.array([int(t.timestamp()) for t in m5df.index]), m5df.Open.values, m5df.High.values, m5df.Low.values, m5df.Close.values)
        h1 = m5df.resample("1h", label="left", closed="left").agg(AGG).dropna()
        built = F.build(h1)
        for tf in TFS:
            df = h1 if tf == "1H" else built[tf]
            c = [[int(t.timestamp()), float(r.Open), float(r.High), float(r.Low), float(r.Close)] for t, r in df.iterrows()]
            c = c[:-1]                              # the last candle may be unfinished
            su, arr = setups(c)
            for v in VARIANTS:
                for tm in ("liq", "2R"):
                    f = funnel.setdefault((tf, v, tm), {"setups": 0, "filled": 0})
                    for s in su:
                        r = simulate(s, arr, m5, pair, tf, v, tm)
                        if r is None: continue
                        f["setups"] += 1
                        if r.get("filled"):
                            f["filled"] += 1; trades.append((r["t"], r["R"], tf, v, tm, pair, split_of(r["t"]), s["d"]))
                        else: f[r["why"]] = f.get(r["why"], 0) + 1
        print(pair, "done", flush=True)
    return trades, funnel


def cell(s):
    if not s: return "– | – | – | – | –"
    return f"{s['n']} | {s['exp']:+.3f} ± {s['se'] or 0:.3f} | {s['pf']:.2f} | {s['win']:.0f}% | {s['dd']:.1f}" if s["pf"] else f"{s['n']} | {s['exp']:+.3f} | – | {s['win']:.0f}% | {s['dd']:.1f}"


def report(trades, funnel):
    trades.sort()
    L = ["# Simple BOS Entry – validation backtest", "",
         "Rules: see the top of `scripts/bos_backtest.py` (our exact reading of the video; the video defines no stop, no confirmation and no "
         "target rule, so those are fixed choices, not fitted). Data: forex-data 5-minute bars, 8 symbols (7 majors + gold), 2023-01 to "
         f"{pd.Timestamp(max(t[0] for t in trades), unit='s'):%Y-%m}. Costs per pair (spread + slippage). Expectancy = average R per trade "
         "(± standard error). Max drawdown in R from the pooled equity curve in time order. Overlapping trades are all counted.", ""]
    for tf in TFS:
        L += [f"## {tf}", "", "| Entry | Target | Period | Trades | Expectancy R ± s.e. | Profit factor | Win rate | Max DD R |", "|---|---|---|---|---|---|---|---|"]
        for v in VARIANTS:
            for tm in ("liq", "2R"):
                for sp in [s[0] for s in B.SPLITS] + ["all"]:
                    rs = [t[1] for t in trades if t[2] == tf and t[3] == v and t[4] == tm and (sp == "all" or t[6] == sp)]
                    L.append(f"| {v} | {tm} | {sp} | {cell(stats(rs))} |")
        L.append("")
    L += ["## Test period by pair (target = liquidity)", "", "| TF | Entry | " + " | ".join(PAIRS) + " |", "|---|---|" + "---|" * len(PAIRS)]
    for tf in TFS:
        for v in VARIANTS:
            row = []
            for p in PAIRS:
                rs = [t[1] for t in trades if t[2] == tf and t[3] == v and t[4] == "liq" and t[5] == p and t[6] == "test"]
                row.append(f"{sum(rs) / len(rs):+.2f} ({len(rs)})" if rs else "–")
            L.append(f"| {tf} | {v} | " + " | ".join(row) + " |")
    L += ["", "## Funnel (all periods)", "", "| TF | Entry | Target | Setups | Filled | Cancelled |", "|---|---|---|---|---|---|"]
    for (tf, v, tm), f in funnel.items():
        L.append(f"| {tf} | {v} | {tm} | {f['setups']} | {f['filled']} | " + ", ".join(f"{k} {n}" for k, n in f.items() if k not in ("setups", "filled")) + " |")
    # stress runs (written earlier by this script with BOS_TAG / BOS_* settings), if present
    import collections
    def cl(sel):
        if len(sel) < 5: return "–"
        n = len(sel); m = sum(x[1] for x in sel) / n; g = collections.defaultdict(float)
        for x in sel: g[x[0] // 86400] += x[1] - m
        return f"{m:+.3f} ± {math.sqrt(sum(v * v for v in g.values())) / n:.3f}"
    cfgs = [("no costs", "_c0"), ("rules as above", ""), ("costs ×1.5", "_c15"), ("costs ×2", "_c2"), ("order 15 min late", "_d15"), ("order 60 min late", "_d60"),
            ("limit must trade 1 pip through", "_th1"), ("swing K=2", "_k2"), ("swing K=5", "_k5")]
    have = [(nm, tg) for nm, tg in cfgs if tg == "" or os.path.exists(os.path.join(OUT, f"bos_trades{tg}.json"))]
    if len(have) > 1 and not os.environ.get("BOS_TAG"):
        L += ["", "## Stress tests – OB limit entry, liquidity target (s.e. clustered by trading day)", "",
              "| TF | Setting | Train | Validation | Test |", "|---|---|---|---|---|"]
        for tf in TFS:
            for nm, tg in have:
                T_ = trades if tg == "" else json.load(open(os.path.join(OUT, f"bos_trades{tg}.json")))
                sel = [x for x in T_ if x[2] == tf and x[3] == "ob_limit" and x[4] == "liq"]
                L.append(f"| {tf} | {nm} | " + " | ".join(cl([x for x in sel if x[6] == sp]) for sp in ("train", "validation", "test")) + " |")
    tag = os.environ.get("BOS_TAG", "")
    if not tag: open(os.path.join(OUT, "BOS_VALIDATION.md"), "w").write("\n".join(L) + "\n")
    json.dump(trades, open(os.path.join(OUT, f"bos_trades{tag}.json"), "w"))
    print("wrote forex/backtest/BOS_VALIDATION.md")


if __name__ == "__main__":
    tr, fu = run(sys.argv[1])
    report(tr, fu)
