# ICT 2H Sweep backtest – summary (CHoCH on 5m)

Pairs: EURUSD, GBPUSD, AUDUSD, NZDUSD, USDCAD, USDCHF, USDJPY, XAUUSD. forex-data 5-minute bars from 2023-01-01; costs per pair as in the CRT backtest. Made by `python scripts/sweep_backtest.py <forex-data> --tf 2H EURUSD GBPUSD AUDUSD NZDUSD USDCAD USDCHF USDJPY XAUUSD`; execution rules in that script's header. Average R per filled trade, all pairs pooled; trades in brackets. No threshold was tuned.

## Funnel (all pairs)

| Step | Count |
|---|---|
| sweeps (closed back inside) | 3103 |
| with lower-timeframe CHoCH | 2998 |
| orders placed | 2997 |
| filled | 2270 |
| cancelled: invalidated | 90 |
| cancelled: missed | 130 |
| cancelled: expired | 507 |
| cancelled: fill and target in one bar | 0 |

## Results

| Variant | Train | Validation | Test | Win % (all) |
|---|---|---|---|---|
| all setups (rules as in the app) | -0.153 (873) | -0.306 (599) | -0.141 (798) | 15% |
| grade A or B | -0.165 (817) | -0.299 (552) | -0.120 (746) | 16% |
| grade A | -0.143 (539) | -0.206 (384) | -0.179 (504) | 16% |
| grade B | -0.210 (278) | -0.511 (168) | +0.003 (242) | 14% |
| grade C | +0.025 (56) | -0.391 (47) | -0.448 (52) | 12% |
| 4H swing >= 1.5 ATR | -0.139 (799) | -0.320 (543) | -0.133 (728) | 16% |
| sweep 0.1-1.0 ATR | -0.056 (557) | -0.166 (403) | -0.148 (503) | 17% |
| displacement >= 1.5 ATR | -0.246 (345) | -0.287 (223) | -0.172 (330) | 18% |
| FVG zone only | -0.186 (737) | -0.248 (504) | -0.191 (683) | 16% |
| R:R >= 2 | -0.176 (822) | -0.327 (569) | -0.144 (757) | 13% |
| entry in discount / premium (TTrades) | -0.360 (185) | -0.670 (114) | -0.034 (187) | 8% |
| TTrades checklist 5/5 | -0.357 (184) | -0.685 (112) | -0.034 (187) | 8% |
| A1 = grade A + TTrades checklist 5/5 | -0.018 (87) | -0.314 (57) | -0.026 (104) | 11% |
| app default filters (sweep >= 0.05, displacement >= 1.0, swing >= 1.0) | -0.078 (547) | -0.234 (391) | -0.120 (510) | 17% |

## Per pair (all setups, whole period)

| Pair | Trades | Win | Avg R | PF | Sum R | Max DD |
|---|---|---|---|---|---|---|
| EURUSD | 294 | 16.0% | -0.195 ± 0.137 | 0.77 | -57.4 | 84.7 |
| GBPUSD | 275 | 14.5% | -0.148 ± 0.16 | 0.83 | -40.6 | 101.6 |
| AUDUSD | 281 | 13.9% | -0.228 ± 0.161 | 0.75 | -64.2 | 102.2 |
| NZDUSD | 298 | 15.1% | -0.266 ± 0.139 | 0.7 | -79.2 | 99.2 |
| USDCAD | 277 | 15.9% | -0.131 ± 0.161 | 0.85 | -36.4 | 91.0 |
| USDCHF | 312 | 14.1% | -0.350 ± 0.118 | 0.61 | -109.2 | 112.5 |
| USDJPY | 277 | 15.5% | -0.173 ± 0.169 | 0.8 | -47.8 | 72.5 |
| XAUUSD | 256 | 18.0% | +0.020 ± 0.213 | 1.02 | +5.1 | 48.1 |

Not tested here: the CRT-confluence filter (it needs the CRT state at each moment), news, swaps.
