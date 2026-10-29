# ICT 1D Sweep backtest – summary (CHoCH on 1H)

Pairs: EURUSD, GBPUSD, AUDUSD, NZDUSD, USDCAD, USDCHF, USDJPY, XAUUSD. forex-data 5-minute bars from 2023-01-01; costs per pair as in the CRT backtest. Made by `python scripts/sweep_backtest.py <forex-data> --tf D EURUSD GBPUSD AUDUSD NZDUSD USDCAD USDCHF USDJPY XAUUSD`; execution rules in that script's header. Average R per filled trade, all pairs pooled; trades in brackets. No threshold was tuned.

## Funnel (all pairs)

| Step | Count |
|---|---|
| sweeps (closed back inside) | 256 |
| with lower-timeframe CHoCH | 251 |
| orders placed | 251 |
| filled | 207 |
| cancelled: invalidated | 4 |
| cancelled: missed | 6 |
| cancelled: expired | 34 |
| cancelled: fill and target in one bar | 0 |

## Results

| Variant | Train | Validation | Test | Win % (all) |
|---|---|---|---|---|
| all setups (rules as in the app) | -0.250 (84) | -0.369 (64) | -0.320 (59) | 11% |
| grade A or B | -0.201 (79) | -0.600 (60) | -0.242 (53) | 11% |
| grade A | +0.145 (47) | -0.583 (47) | -0.473 (37) | 13% |
| grade B | -0.709 (32) | -0.669 (13) | +0.300 (16) | 8% |
| grade C | -1.000 (5) | +3.075 (4) | -1.017 (6) | 7% |
| 4H swing >= 1.5 ATR | -0.211 (80) | -0.362 (56) | -0.242 (53) | 12% |
| sweep 0.1-1.0 ATR | -0.252 (56) | -0.553 (45) | -0.608 (39) | 11% |
| displacement >= 1.5 ATR | +0.168 (38) | -0.415 (33) | -0.622 (23) | 16% |
| FVG zone only | +0.202 (53) | -0.537 (52) | -0.140 (47) | 14% |
| R:R >= 2 | -0.250 (84) | -0.440 (62) | -0.329 (56) | 10% |
| entry in discount / premium (TTrades) | -0.534 (29) | +0.073 (15) | -1.020 (20) | 3% |
| TTrades checklist 5/5 | -0.534 (29) | +0.073 (15) | -1.020 (20) | 3% |
| A1 = grade A + TTrades checklist 5/5 | +0.273 (11) | -1.000 (6) | -1.015 (13) | 3% |
| app default filters (sweep >= 0.05, displacement >= 1.0, swing >= 1.0) | -0.192 (53) | -0.572 (46) | -0.065 (37) | 13% |

## Per pair (all setups, whole period)

| Pair | Trades | Win | Avg R | PF | Sum R | Max DD |
|---|---|---|---|---|---|---|
| EURUSD | 23 | 17.4% | +0.708 ± 0.833 | 1.85 | +16.3 | 7.1 |
| GBPUSD | 26 | 3.8% | -0.852 ± 0.157 | 0.12 | -22.2 | 22.2 |
| AUDUSD | 41 | 12.2% | -0.448 ± 0.304 | 0.5 | -18.4 | 19.2 |
| NZDUSD | 25 | 8.0% | -0.723 ± 0.209 | 0.23 | -18.1 | 18.1 |
| USDCAD | 24 | 16.7% | +0.109 ± 0.707 | 1.13 | +2.6 | 8.1 |
| USDCHF | 26 | 7.7% | -0.607 ± 0.262 | 0.32 | -15.8 | 18.9 |
| USDJPY | 26 | 11.5% | -0.030 ± 0.646 | 0.97 | -0.8 | 14.1 |
| XAUUSD | 16 | 12.5% | -0.456 ± 0.375 | 0.45 | -7.3 | 7.9 |

Not tested here: the CRT-confluence filter (it needs the CRT state at each moment), news, swaps.
