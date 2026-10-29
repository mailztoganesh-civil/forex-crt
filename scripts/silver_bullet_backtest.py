"""Backtest of the ICT Silver Bullet (10:00-11:00 New York) as drawn in the "Advanced Silver Bullet Model Framework" chart:
liquidity raid -> displacement + market structure shift (MSS) -> FVG -> retracement entry -> draw on liquidity.
The chart leaves the entry flexible ("FVG, or the breaker if price does not come back"); here every entry rule is fixed in
advance and each one is tested separately, so no entry is chosen after the outcome is known. Nothing is fitted.

Per instrument and New York trading day, on 5-minute bars (the chart uses 1-minute; 5-minute data misses small FVGs):
  liquidity    SSL = lowest low and BSL = highest high of 00:00-09:55 NY
  raid         a 10:00-10:55 bar trades below SSL (long setup) / above BSL (short setup)
  extreme      lowest low from the raid bar on (updated until the MSS)
  MSS          the first bar, 10:00-10:55, after the extreme that CLOSES above the last 5m swing high (1 lower high each
               side) made from 09:30 up to the extreme; displacement = that break
  FVG          the last bullish gap (low[i+1] > high[i-1]) between the extreme and the MSS bar, above the stop
  breaker      the swing-high candle that was broken; entry at its high (the MSS level)
  stop         the extreme (raid low); target = BSL (opposite liquidity, "DOL"), only if it is >= 1R away; or a fixed 2R
  entries      market    next bar open after the MSS bar (baseline)
               fvg       limit at the top of the FVG (no FVG -> no trade)
               breaker   limit at the breaker (MSS) level
               shallower limit at whichever of the FVG top / breaker level is reached first (decided in advance)
  orders       active from the MSS bar close, cancelled at 11:00 if not filled, or if stop / target trade first
  exit         stop or target; otherwise at the 15:55 bar close. One setup per day per instrument (the first MSS).
Fills: quotes are mid prices; a buy limit fills when the ask (mid + half spread) reaches it, a long is stopped at the bid
(shorts mirrored); fill and target in the same 5m bar = no trade; stop and target in the same bar = stop.
Costs in index points (spread, slippage): "cfd" NSXUSD (1.5, 0.5), SPXUSD (0.5, 0.25); "futures" NQ (0.25, 0.5),
ES (0.25, 0.25); FX majors / gold use crt_backtest.COST.
Periods: train 2020-2022, validation 2023-2024, test 2025-2026.
Usage: python scripts/silver_bullet_backtest.py <forex-data checkout>  -> forex/backtest/SILVER_BULLET.md
"""
import collections, glob, json, math, os, sys
import numpy as np
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import crt_backtest as B    # noqa: E402

OUT = os.path.join(HERE, "..", "forex", "backtest")
SPLITS = [("train", "2020-01-01", "2023-01-01"), ("validation", "2023-01-01", "2025-01-01"), ("test", "2025-01-01", "2100-01-01")]
COSTS = {"cfd": {"NSXUSD": (1.5, 0.5), "SPXUSD": (0.5, 0.25)}, "futures": {"NSXUSD": (0.25, 0.5), "SPXUSD": (0.25, 0.25)}}
PIPS = {"NSXUSD": 1.0, "SPXUSD": 1.0}
ENTRIES = ["market", "fvg", "breaker", "shallower"]
RAID_FROM = os.environ.get("SB_RAID_FROM", "10:00")          # robustness: allow the raid from 09:30


def load(root, sym):
    fs = sorted(glob.glob(os.path.join(root, "data", sym, "5m", "*.csv.gz")))
    d = pd.concat(pd.read_csv(f, parse_dates=["Datetime"]) for f in fs).set_index("Datetime")
    d.index = pd.to_datetime(d.index, utc=True)
    d = d[~d.index.duplicated()].sort_index()
    return d[["Open", "High", "Low", "Close"]]


def hm(ts): return ts.hour * 60 + ts.minute


def day_setup(T, O, H, L, C, mins, d):
    """one day's bars (arrays) with minutes-of-day in NY; returns the first Silver Bullet setup or None"""
    r0 = int(RAID_FROM[:2]) * 60 + int(RAID_FROM[3:])
    pre = np.where(mins < r0)[0]                        # liquidity = the range before the raid window
    if len(pre) < 60: return None
    ssl, bsl = L[pre].min(), H[pre].max()
    win = np.where((mins >= r0) & (mins < 660))[0]
    start = np.where(mins >= 570)[0]
    if len(win) < 6 or not len(start): return None
    s0 = start[0]; best = None
    for side in (1, -1):
        raid = next((i for i in win if (L[i] < ssl if side == 1 else H[i] > bsl)), None)
        if raid is None: continue
        ext = raid
        for i in range(raid, win[-1] + 1):
            if mins[i] >= 660: break
            if (L[i] < L[ext]) if side == 1 else (H[i] > H[ext]): ext = i
            if i <= ext: continue
            # last 5m swing (1 bar each side) from 09:30 up to the extreme
            ref = None
            for j in range(ext - 1, s0, -1):
                if j + 1 > ext: continue
                if side == 1 and H[j] > H[j - 1] and H[j] >= H[j + 1]: ref = j; break
                if side == -1 and L[j] < L[j - 1] and L[j] <= L[j + 1]: ref = j; break
            if ref is None: continue
            if (C[i] > H[ref]) if side == 1 else (C[i] < L[ref]):
                if mins[i] < 600: break                       # MSS must be inside the 10:00-11:00 window
                stop = L[ext] if side == 1 else H[ext]
                fvg = None
                for k in range(i - 1, ext, -1):
                    if side == 1 and L[k + 1] > H[k - 1] and H[k - 1] > stop: fvg = L[k + 1]; break
                    if side == -1 and H[k + 1] < L[k - 1] and L[k - 1] < stop: fvg = H[k + 1]; break
                s = {"d": side, "mss": i, "stop": stop, "fvg": fvg, "brk": H[ref] if side == 1 else L[ref],
                     "dol": bsl if side == 1 else ssl}
                if best is None or i < best["mss"]: best = s
                elif i == best["mss"]: best = "both"
                break
    return None if best == "both" else best


def trade(s, T, O, H, L, C, mins, entry_kind, tmode, hs, sp):
    d, i = s["d"], s["mss"]
    if i + 1 >= len(T): return None
    if entry_kind == "market": entry = O[i + 1] + d * (hs + sp)
    elif entry_kind == "fvg":
        if s["fvg"] is None: return None
        entry = s["fvg"]
    elif entry_kind == "breaker": entry = s["brk"]
    else: entry = max(s["brk"], s["fvg"]) if (d == 1 and s["fvg"] is not None) else min(s["brk"], s["fvg"]) if s["fvg"] is not None else s["brk"]
    stop = s["stop"]; risk = (entry - stop) * d
    if risk <= 0: return None
    tp = entry + d * 2 * risk if tmode == "2R" else s["dol"]
    if (tp - entry) * d < risk: return {"filled": False, "why": "DOL < 1R"}
    k0 = i + 1
    if entry_kind != "market":
        fill = None
        for k in range(i + 1, len(T)):
            if mins[k] >= 660: return {"filled": False, "why": "expired 11:00"}
            touch = (L[k] + hs <= entry) if d == 1 else (H[k] - hs >= entry)
            st = (L[k] - hs <= stop) if d == 1 else (H[k] + hs >= stop)
            tg = (H[k] - hs >= tp) if d == 1 else (L[k] + hs <= tp)
            if touch:
                if tg and not st: return {"filled": False, "why": "fill+target one bar"}
                fill = k; break
            if tg: return {"filled": False, "why": "missed"}
        if fill is None: return {"filled": False, "why": "expired 11:00"}
        k0 = fill
    for k in range(k0, len(T)):
        st = (L[k] - hs <= stop) if d == 1 else (H[k] + hs >= stop)
        tg = (H[k] - hs >= tp) if d == 1 else (L[k] + hs <= tp)
        if st: return {"filled": True, "R": d * ((stop - d * sp) - entry) / risk, "how": "stop", "risk": risk}
        if tg: return {"filled": True, "R": d * (tp - entry) / risk, "how": "target", "risk": risk}
        if mins[k] >= 955: break
    k = min(k, len(T) - 1)
    return {"filled": True, "R": d * ((C[k] - d * (hs + sp)) - entry) / risk, "how": "time", "risk": risk}


def run(root, sym, costs):
    df = load(root, sym); ny = df.index.tz_convert("America/New_York")
    out = collections.defaultdict(list); fun = collections.defaultdict(collections.Counter)
    for day, idx in pd.Series(np.arange(len(df)), index=ny).groupby(ny.date):
        a = idx.values
        if len(a) < 150: continue
        T = df.index[a]; O, H, L, C = (df[c].values[a] for c in ("Open", "High", "Low", "Close"))
        mins = np.array([hm(t) for t in ny[a]])
        s = day_setup(T, O, H, L, C, mins, day)
        if not s: continue
        t0 = pd.Timestamp(day).tz_localize("UTC").timestamp()
        split = next(n for n, x, y in SPLITS if pd.Timestamp(x).timestamp() <= t0 < pd.Timestamp(y).timestamp())
        for cname, (spread, slip) in costs.items():
            hs, sp = spread / 2, slip
            for ek in ENTRIES:
                for tm in ("dol", "2R"):
                    r = trade(s, T, O, H, L, C, mins, ek, tm, hs, sp)
                    key = (cname, ek, tm)
                    if r is None: fun[key]["no level"] += 1; continue
                    fun[key]["setups"] += 1
                    if r["filled"]: fun[key]["filled"] += 1; out[key].append((int(t0), r["R"], split, s["d"], r["how"]))
                    else: fun[key][r["why"]] += 1
    return out, fun


def cl(rs):
    if len(rs) < 5: return "–"
    v = [x[1] for x in rs]; n = len(v); m = sum(v) / n; sd = math.sqrt(sum((x - m) ** 2 for x in v) / (n - 1))
    gw = sum(x for x in v if x > 0); gl = -sum(x for x in v if x < 0)
    return f"{n} | {m:+.3f} ± {sd / math.sqrt(n):.3f} | {gw / gl if gl else float('nan'):.2f} | {sum(1 for x in v if x > 0) / n * 100:.0f}%"


def main(root):
    L = ["# ICT Silver Bullet (10:00-11:00 NY) – backtest", "", "Rules: top of `scripts/silver_bullet_backtest.py` (fixed in advance; each entry tested on its own). "
         f"Raid window from {RAID_FROM} NY. Data: forex-data 5-minute bars; periods train 2020-2022, validation 2023-2024, test 2025-2026. "
         "Expectancy = average R per trade ± standard error (one setup per day per instrument).", ""]
    jobs = [("NSXUSD", COSTS["cfd"] | {}), ("SPXUSD", None)]
    allres = {}
    for sym in ["NSXUSD", "SPXUSD"]:
        allres[sym] = run(root, sym, {"no costs": (0, 0), "futures": COSTS["futures"][sym], "cfd": COSTS["cfd"][sym]})
        print(sym, "done", flush=True)
    for sym in ["EURUSD", "GBPUSD", "XAUUSD"]:
        pip = B.PIP[sym]; sp_, sl_ = B.COST[sym]
        allres[sym] = run(root, sym, {"no costs": (0, 0), "retail": (sp_ * pip, sl_ * pip)})
        print(sym, "done", flush=True)
    for sym, (res, fun) in allres.items():
        name = {"NSXUSD": "Nasdaq 100 (NSXUSD ≈ NQ)", "SPXUSD": "S&P 500 (SPXUSD ≈ ES)"}.get(sym, sym)
        L += [f"## {name}", "", "| Costs | Entry | Target | Period | Trades | Expectancy R ± s.e. | Profit factor | Win rate |", "|---|---|---|---|---|---|---|---|"]
        for key in sorted(res, key=lambda k: (list(dict.fromkeys(x[0] for x in res)).index(k[0]), ENTRIES.index(k[1]), k[2])):
            for sp in ["train", "validation", "test", "all"]:
                L.append(f"| {key[0]} | {key[1]} | {key[2]} | {sp} | " + cl([x for x in res[key] if sp == "all" or x[2] == sp]) + " |")
        L += ["", "Funnel (" + sym + ", first cost level): " + "; ".join(f"{k[1]}/{k[2]}: " + ", ".join(f"{a} {b}" for a, b in v.items())
                                                       for k, v in fun.items() if k[0] == "no costs"), ""]
    tag = "" if RAID_FROM == "10:00" else "_raid" + RAID_FROM.replace(":", "")
    open(os.path.join(OUT, f"SILVER_BULLET{tag}.md"), "w").write("\n".join(L) + "\n")
    json.dump({s: {"|".join(k): v for k, v in r[0].items()} for s, r in allres.items()}, open(os.path.join(OUT, f"silver_bullet_trades{tag}.json"), "w"))
    print(f"wrote forex/backtest/SILVER_BULLET{tag}.md")


if __name__ == "__main__":
    main(sys.argv[1])
