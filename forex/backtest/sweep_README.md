# ICT 4H Sweep backtest – summary (CHoCH on 15m)

Pairs: EURUSD, GBPUSD, AUDUSD, NZDUSD, USDCAD, USDCHF, USDJPY, XAUUSD. forex-data 5-minute bars from 2023-01-01; costs per pair as in the CRT backtest. Made by `python scripts/sweep_backtest.py <forex-data> --tf 4H EURUSD GBPUSD AUDUSD NZDUSD USDCAD USDCHF USDJPY XAUUSD`; execution rules in that script's header. Average R per filled trade, all pairs pooled; trades in brackets. No threshold was tuned.

## Funnel (all pairs)

| Step | Count |
|---|---|
| sweeps (closed back inside) | 1525 |
| with lower-timeframe CHoCH | 1412 |
| orders placed | 1411 |
| filled | 1088 |
| cancelled: invalidated | 12 |
| cancelled: missed | 52 |
| cancelled: expired | 259 |
| cancelled: fill and target in one bar | 0 |

## Results

| Variant | Train | Validation | Test | Win % (all) |
|---|---|---|---|---|
| all setups (rules as in the app) | -0.116 (423) | -0.134 (289) | -0.160 (376) | 18% |
| grade A or B | -0.052 (391) | -0.109 (277) | -0.215 (344) | 18% |
| grade A | +0.032 (255) | +0.000 (200) | -0.188 (242) | 20% |
| grade B | -0.210 (136) | -0.394 (77) | -0.280 (102) | 14% |
| grade C | -0.894 (32) | -0.692 (12) | +0.441 (32) | 14% |
| 4H swing >= 1.5 ATR | -0.110 (391) | -0.125 (269) | -0.226 (337) | 18% |
| sweep 0.1-1.0 ATR | +0.071 (278) | -0.096 (211) | -0.162 (266) | 19% |
| displacement >= 1.5 ATR | -0.260 (184) | -0.111 (137) | +0.010 (144) | 23% |
| FVG zone only | -0.035 (324) | +0.013 (240) | -0.172 (310) | 20% |
| R:R >= 2 | -0.107 (391) | -0.140 (259) | -0.161 (344) | 16% |
| entry in discount / premium (TTrades) | -0.401 (108) | -0.332 (78) | -0.410 (86) | 8% |
| TTrades checklist 5/5 | -0.401 (108) | -0.353 (77) | -0.410 (86) | 8% |
| A1 = grade A + TTrades checklist 5/5 | +0.000 (49) | -0.219 (43) | -0.325 (48) | 11% |
| app default filters (sweep >= 0.05, displacement >= 1.0, swing >= 1.0) | +0.093 (261) | +0.028 (194) | -0.170 (249) | 22% |

## Per pair (all setups, whole period)

| Pair | Trades | Win | Avg R | PF | Sum R | Max DD |
|---|---|---|---|---|---|---|
| EURUSD | 137 | 22.6% | +0.002 ± 0.197 | 1.0 | +0.2 | 36.4 |
| GBPUSD | 142 | 15.5% | -0.190 ± 0.204 | 0.78 | -27.0 | 45.3 |
| AUDUSD | 128 | 22.7% | +0.005 ± 0.198 | 1.01 | +0.6 | 29.0 |
| NZDUSD | 151 | 17.9% | -0.076 ± 0.215 | 0.91 | -11.5 | 32.8 |
| USDCAD | 151 | 16.6% | -0.077 ± 0.212 | 0.91 | -11.6 | 39.5 |
| USDCHF | 142 | 16.9% | -0.212 ± 0.176 | 0.75 | -30.1 | 37.5 |
| USDJPY | 122 | 13.9% | -0.406 ± 0.196 | 0.53 | -49.5 | 52.9 |
| XAUUSD | 115 | 20.0% | -0.165 ± 0.188 | 0.8 | -18.9 | 25.1 |

Not tested here: the CRT-confluence filter (it needs the CRT state at each moment), news, swaps.
