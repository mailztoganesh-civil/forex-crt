# ICT sweep – validation backtest

**Correction 2026-10-29:** the earlier version of this report filled limit entries at the wrong side of the spread (a buy limit when the bid reached it) and triggered stops half a spread late. Both favoured the strategy by about one spread per trade, which is a large part of the risk on these tight stops. All numbers below are from the corrected simulation; the earlier positive 2H results (+0.19 / +0.05 / +0.14 R) do not survive it.

Data: forex-data 5-minute bars (HistData, bid), 2023-01 to 2026-10. Periods in time order: train 2023-01..2024-06, validation 2024-07..2025-06, test 2025-07..end. Costs per pair (spread + slippage, e.g. EURUSD 0.8 + 0.2 pips; XAUUSD 30 + 10 cents). Entry: limit at the zone edge, placed when the lower-timeframe candle after the CHoCH has closed, fillable only after the higher-timeframe sweep candle closed; stop = sweep extreme; target = opposite liquidity; quotes treated as mid prices: a buy limit fills when the ask (mid + half spread) reaches it, a long is stopped at the bid (shorts mirrored); a 5-minute bar touching stop and target counts as a stop; entry and target in one bar = no trade. No parameter was fitted. Expectancy = average R per trade. Max drawdown from the equity curve of the trades in time order (all pairs merged in the pooled table).

## EURUSD only

### 1D → 1H

| Setups | Period | Trades | Expectancy R ± s.e. | Profit factor | Win rate | Max drawdown R |
|---|---|---|---|---|---|---|
| all setups | train | 11 | +0.934 ± 1.307 | 2.13 | 18% | 7.1 |
| all setups | validation | 7 | -0.225 ± 0.782 | 0.74 | 14% | 4.0 |
| all setups | test | 5 | +1.517 ± 2.525 | 2.88 | 20% | 2.0 |
| all setups | all | 23 | +0.708 ± 0.833 | 1.85 | 17% | 7.1 |
| grade A | train | 6 | +0.878 ± 1.887 | 2.04 | 17% | 5.0 |
| grade A | validation | 7 | -0.225 ± 0.782 | 0.74 | 14% | 4.0 |
| grade A | test | 2 | -1.012 ± 0.005 | 0.00 | 0% | 2.0 |
| grade A | all | 15 | +0.111 ± 0.815 | 1.13 | 13% | 6.0 |
| grade B | train | 4 | +1.504 ± 2.517 | 2.98 | 25% | 2.0 |
| grade B | validation | – | – | – | – | – |
| grade B | test | 2 | +5.307 ± 6.310 | 11.58 | 50% | 1.0 |
| grade B | all | 6 | +2.771 ± 2.415 | 5.11 | 33% | 2.0 |
| grade C | train | 1 | -1.013 ± – | 0.00 | 0% | 1.0 |
| grade C | validation | – | – | – | – | – |
| grade C | test | 1 | -1.006 ± – | 0.00 | 0% | 1.0 |
| grade C | all | 2 | -1.009 ± 0.003 | 0.00 | 0% | 2.0 |
| checklist 5/5 | train | 3 | -1.014 ± 0.003 | 0.00 | 0% | 3.0 |
| checklist 5/5 | validation | 1 | -1.003 ± – | 0.00 | 0% | 1.0 |
| checklist 5/5 | test | 1 | -1.017 ± – | 0.00 | 0% | 1.0 |
| checklist 5/5 | all | 5 | -1.012 ± 0.003 | 0.00 | 0% | 5.1 |
| A1 (A + 5/5) | train | 1 | -1.012 ± – | 0.00 | 0% | 1.0 |
| A1 (A + 5/5) | validation | 1 | -1.003 ± – | 0.00 | 0% | 1.0 |
| A1 (A + 5/5) | test | 1 | -1.017 ± – | 0.00 | 0% | 1.0 |
| A1 (A + 5/5) | all | 3 | -1.011 ± 0.004 | 0.00 | 0% | 3.0 |

### 4H → 15m

| Setups | Period | Trades | Expectancy R ± s.e. | Profit factor | Win rate | Max drawdown R |
|---|---|---|---|---|---|---|
| all setups | train | 47 | +0.051 ± 0.322 | 1.07 | 26% | 11.7 |
| all setups | validation | 37 | -0.851 ± 0.098 | 0.09 | 8% | 31.5 |
| all setups | test | 53 | +0.553 ± 0.402 | 1.79 | 30% | 7.6 |
| all setups | all | 137 | +0.002 ± 0.197 | 1.00 | 23% | 36.4 |
| grade A | train | 27 | -0.074 ± 0.335 | 0.90 | 26% | 10.6 |
| grade A | validation | 29 | -0.842 ± 0.120 | 0.11 | 7% | 24.4 |
| grade A | test | 32 | +0.405 ± 0.471 | 1.57 | 28% | 7.1 |
| grade A | all | 88 | -0.153 ± 0.209 | 0.81 | 20% | 35.1 |
| grade B | train | 16 | +0.380 ± 0.758 | 1.50 | 25% | 7.0 |
| grade B | validation | 7 | -1.014 ± 0.002 | 0.00 | 0% | 7.1 |
| grade B | test | 14 | +0.657 ± 0.693 | 2.00 | 36% | 2.1 |
| grade B | all | 37 | +0.221 ± 0.424 | 1.29 | 24% | 9.1 |
| grade C | train | 4 | -0.421 ± 0.610 | 0.46 | 25% | 3.1 |
| grade C | validation | 1 | +0.016 ± – | – | 100% | 0.0 |
| grade C | test | 7 | +1.022 ± 1.800 | 2.39 | 29% | 3.6 |
| grade C | all | 12 | +0.457 ± 1.052 | 1.67 | 33% | 3.6 |
| checklist 5/5 | train | 9 | +0.049 ± 1.091 | 1.05 | 11% | 7.3 |
| checklist 5/5 | validation | 9 | -1.014 ± 0.002 | 0.00 | 0% | 9.1 |
| checklist 5/5 | test | 15 | -0.175 ± 0.851 | 0.82 | 7% | 8.2 |
| checklist 5/5 | all | 33 | -0.343 ± 0.480 | 0.64 | 6% | 18.3 |
| A1 (A + 5/5) | train | 3 | -1.057 ± 0.023 | 0.00 | 0% | 3.2 |
| A1 (A + 5/5) | validation | 7 | -1.014 ± 0.002 | 0.00 | 0% | 7.1 |
| A1 (A + 5/5) | test | 10 | -1.024 ± 0.005 | 0.00 | 0% | 10.2 |
| A1 (A + 5/5) | all | 20 | -1.025 ± 0.005 | 0.00 | 0% | 20.5 |

### 2H → 5m

| Setups | Period | Trades | Expectancy R ± s.e. | Profit factor | Win rate | Max drawdown R |
|---|---|---|---|---|---|---|
| all setups | train | 112 | -0.448 ± 0.148 | 0.49 | 14% | 53.1 |
| all setups | validation | 73 | -0.275 ± 0.275 | 0.70 | 12% | 28.3 |
| all setups | test | 109 | +0.118 ± 0.279 | 1.14 | 20% | 20.8 |
| all setups | all | 294 | -0.195 ± 0.137 | 0.77 | 16% | 84.7 |
| grade A | train | 71 | -0.322 ± 0.206 | 0.62 | 17% | 26.9 |
| grade A | validation | 52 | -0.287 ± 0.316 | 0.68 | 13% | 23.5 |
| grade A | test | 71 | -0.480 ± 0.173 | 0.45 | 14% | 34.1 |
| grade A | all | 194 | -0.371 ± 0.129 | 0.58 | 15% | 75.9 |
| grade B | train | 32 | -0.723 ± 0.174 | 0.23 | 9% | 23.1 |
| grade B | validation | 14 | -0.543 ± 0.510 | 0.44 | 7% | 12.6 |
| grade B | test | 31 | +1.296 ± 0.762 | 2.94 | 35% | 4.2 |
| grade B | all | 77 | +0.123 ± 0.343 | 1.15 | 19% | 35.7 |
| grade C | train | 9 | -0.461 ± 0.599 | 0.51 | 11% | 4.3 |
| grade C | validation | 7 | +0.350 ± 1.399 | 1.39 | 14% | 6.3 |
| grade C | test | 7 | +0.960 ± 1.934 | 2.15 | 14% | 4.1 |
| grade C | all | 23 | +0.218 ± 0.735 | 1.24 | 13% | 10.4 |
| checklist 5/5 | train | 26 | -0.898 ± 0.152 | 0.11 | 4% | 23.4 |
| checklist 5/5 | validation | 16 | -0.422 ± 0.520 | 0.54 | 12% | 8.5 |
| checklist 5/5 | test | 30 | +0.105 ± 0.604 | 1.12 | 13% | 13.6 |
| checklist 5/5 | all | 72 | -0.374 ± 0.284 | 0.60 | 10% | 37.1 |
| A1 (A + 5/5) | train | 16 | -0.796 ± 0.247 | 0.19 | 6% | 12.7 |
| A1 (A + 5/5) | validation | 9 | +0.091 ± 0.909 | 1.11 | 22% | 4.2 |
| A1 (A + 5/5) | test | 20 | -0.875 ± 0.166 | 0.12 | 5% | 17.5 |
| A1 (A + 5/5) | all | 45 | -0.654 ± 0.214 | 0.31 | 9% | 29.4 |

## All 7 majors + gold, pooled

### 1D → 1H

| Setups | Period | Trades | Expectancy R ± s.e. | Profit factor | Win rate | Max drawdown R |
|---|---|---|---|---|---|---|
| all setups | train | 84 | -0.250 ± 0.281 | 0.72 | 11% | 31.3 |
| all setups | validation | 64 | -0.370 ± 0.292 | 0.59 | 11% | 28.3 |
| all setups | test | 59 | -0.320 ± 0.305 | 0.63 | 12% | 29.8 |
| all setups | all | 207 | -0.307 ± 0.169 | 0.66 | 11% | 63.6 |
| grade A | train | 47 | +0.143 ± 0.450 | 1.17 | 17% | 13.6 |
| grade A | validation | 47 | -0.583 ± 0.184 | 0.35 | 11% | 29.4 |
| grade A | test | 37 | -0.475 ± 0.317 | 0.45 | 11% | 28.5 |
| grade A | all | 131 | -0.292 ± 0.197 | 0.66 | 13% | 47.0 |
| grade B | train | 32 | -0.707 ± 0.315 | 0.29 | 3% | 26.6 |
| grade B | validation | 13 | -0.660 ± 0.359 | 0.30 | 8% | 8.6 |
| grade B | test | 16 | +0.300 ± 0.854 | 1.36 | 19% | 5.1 |
| grade B | all | 61 | -0.433 ± 0.289 | 0.54 | 8% | 38.3 |
| grade C | train | 5 | -1.016 ± 0.002 | 0.00 | 0% | 5.1 |
| grade C | validation | 4 | +3.078 ± 4.088 | 5.06 | 25% | 3.0 |
| grade C | test | 6 | -1.018 ± 0.009 | 0.00 | 0% | 6.1 |
| grade C | all | 15 | +0.075 ± 1.091 | 1.08 | 7% | 9.1 |
| checklist 5/5 | train | 29 | -0.535 ± 0.492 | 0.46 | 3% | 20.6 |
| checklist 5/5 | validation | 15 | +0.075 ± 1.090 | 1.08 | 7% | 7.1 |
| checklist 5/5 | test | 20 | -1.024 ± 0.004 | 0.00 | 0% | 20.5 |
| checklist 5/5 | all | 64 | -0.545 ± 0.336 | 0.45 | 3% | 34.9 |
| A1 (A + 5/5) | train | 11 | +0.272 ± 1.296 | 1.29 | 9% | 5.2 |
| A1 (A + 5/5) | validation | 6 | -1.007 ± 0.002 | 0.00 | 0% | 6.0 |
| A1 (A + 5/5) | test | 13 | -1.020 ± 0.003 | 0.00 | 0% | 13.3 |
| A1 (A + 5/5) | all | 30 | -0.544 ± 0.475 | 0.45 | 3% | 24.4 |

### 4H → 15m

| Setups | Period | Trades | Expectancy R ± s.e. | Profit factor | Win rate | Max drawdown R |
|---|---|---|---|---|---|---|
| all setups | train | 423 | -0.116 ± 0.118 | 0.86 | 17% | 95.4 |
| all setups | validation | 289 | -0.133 ± 0.140 | 0.84 | 19% | 82.1 |
| all setups | test | 376 | -0.160 ± 0.114 | 0.81 | 19% | 88.5 |
| all setups | all | 1088 | -0.136 ± 0.071 | 0.84 | 18% | 174.4 |
| grade A | train | 255 | +0.032 ± 0.157 | 1.04 | 20% | 28.2 |
| grade A | validation | 200 | +0.001 ± 0.166 | 1.00 | 22% | 58.7 |
| grade A | test | 242 | -0.188 ± 0.124 | 0.77 | 19% | 68.5 |
| grade A | all | 697 | -0.053 ± 0.086 | 0.93 | 20% | 68.5 |
| grade B | train | 136 | -0.211 ± 0.214 | 0.76 | 15% | 58.8 |
| grade B | validation | 77 | -0.393 ± 0.296 | 0.58 | 8% | 38.4 |
| grade B | test | 102 | -0.280 ± 0.189 | 0.67 | 18% | 37.3 |
| grade B | all | 315 | -0.278 ± 0.132 | 0.69 | 14% | 109.1 |
| grade C | train | 32 | -0.896 ± 0.106 | 0.09 | 6% | 28.7 |
| grade C | validation | 12 | -0.704 ± 0.217 | 0.14 | 25% | 8.4 |
| grade C | test | 32 | +0.437 ± 0.745 | 1.53 | 19% | 14.0 |
| grade C | all | 76 | -0.305 ± 0.324 | 0.66 | 14% | 41.3 |
| checklist 5/5 | train | 108 | -0.400 ± 0.217 | 0.58 | 8% | 51.4 |
| checklist 5/5 | validation | 77 | -0.355 ± 0.332 | 0.64 | 6% | 39.1 |
| checklist 5/5 | test | 86 | -0.412 ± 0.251 | 0.57 | 8% | 44.8 |
| checklist 5/5 | all | 271 | -0.391 ± 0.150 | 0.59 | 8% | 117.0 |
| A1 (A + 5/5) | train | 49 | -0.000 ± 0.410 | 1.00 | 12% | 18.4 |
| A1 (A + 5/5) | validation | 43 | -0.220 ± 0.420 | 0.76 | 9% | 23.6 |
| A1 (A + 5/5) | test | 48 | -0.325 ± 0.335 | 0.65 | 10% | 36.3 |
| A1 (A + 5/5) | all | 140 | -0.179 ± 0.223 | 0.81 | 11% | 43.2 |

### 2H → 5m

| Setups | Period | Trades | Expectancy R ± s.e. | Profit factor | Win rate | Max drawdown R |
|---|---|---|---|---|---|---|
| all setups | train | 873 | -0.153 ± 0.096 | 0.83 | 15% | 234.8 |
| all setups | validation | 599 | -0.306 ± 0.088 | 0.65 | 15% | 186.1 |
| all setups | test | 798 | -0.141 ± 0.098 | 0.84 | 16% | 142.5 |
| all setups | all | 2270 | -0.189 ± 0.055 | 0.78 | 15% | 541.2 |
| grade A | train | 539 | -0.143 ± 0.112 | 0.84 | 15% | 126.8 |
| grade A | validation | 384 | -0.206 ± 0.115 | 0.76 | 17% | 94.7 |
| grade A | test | 504 | -0.179 ± 0.113 | 0.79 | 17% | 124.9 |
| grade A | all | 1427 | -0.172 ± 0.066 | 0.80 | 16% | 307.0 |
| grade B | train | 278 | -0.210 ± 0.167 | 0.76 | 15% | 95.9 |
| grade B | validation | 168 | -0.511 ± 0.140 | 0.46 | 10% | 87.7 |
| grade B | test | 242 | +0.003 ± 0.207 | 1.00 | 16% | 56.8 |
| grade B | all | 688 | -0.208 ± 0.105 | 0.77 | 14% | 226.0 |
| grade C | train | 56 | +0.026 ± 0.628 | 1.03 | 14% | 28.6 |
| grade C | validation | 47 | -0.392 ± 0.357 | 0.58 | 13% | 25.0 |
| grade C | test | 52 | -0.447 ± 0.351 | 0.55 | 8% | 38.1 |
| grade C | all | 155 | -0.259 ± 0.276 | 0.73 | 12% | 85.1 |
| checklist 5/5 | train | 184 | -0.355 ± 0.216 | 0.64 | 8% | 66.1 |
| checklist 5/5 | validation | 112 | -0.686 ± 0.163 | 0.32 | 5% | 76.9 |
| checklist 5/5 | test | 187 | -0.034 ± 0.274 | 0.96 | 10% | 42.0 |
| checklist 5/5 | all | 483 | -0.308 ± 0.140 | 0.69 | 8% | 166.4 |
| A1 (A + 5/5) | train | 87 | -0.017 ± 0.385 | 0.98 | 10% | 40.5 |
| A1 (A + 5/5) | validation | 57 | -0.313 ± 0.314 | 0.67 | 11% | 18.9 |
| A1 (A + 5/5) | test | 104 | -0.025 ± 0.355 | 0.97 | 12% | 35.5 |
| A1 (A + 5/5) | all | 248 | -0.088 ± 0.213 | 0.91 | 11% | 56.8 |

## Execution-delay sensitivity (all setups, pooled, train / validation / test)

Measured with `ICT_DELAY_BARS=n python scripts/sweep_backtest.py ...` (order placed n lower-timeframe candles later):

| Delay | 2H → 5m | 4H → 15m |
|---|---|---|
| 0 (zone known) | −0.153 / −0.306 / −0.141 | −0.116 / −0.133 / −0.160 |
| 1 candle | −0.173 / −0.312 / −0.194 | −0.148 / −0.190 / −0.184 |
| 2 candles | −0.180 / −0.314 / −0.208 | −0.156 / −0.212 / −0.204 |
| 4 candles | −0.243 / −0.366 / −0.258 | −0.086 / −0.217 / −0.182 |

With correct bid/ask fills every period is negative at every delay, for 2H and 4H; later execution makes 2H worse.

A1 and the TTrades 5/5 checklist are labels for the setup's shape, not evidence of an edge: compare their rows across the three periods and with the standard errors.
