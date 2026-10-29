# Simple BOS Entry – validation backtest

Rules: see the top of `scripts/bos_backtest.py` (our exact reading of the video; the video defines no stop, no confirmation and no target rule, so those are fixed choices, not fitted). Data: forex-data 5-minute bars, 8 symbols (7 majors + gold), 2023-01 to 2026-10. Costs per pair (spread + slippage). Expectancy = average R per trade (± standard error). Max drawdown in R from the pooled equity curve in time order. Overlapping trades are all counted.

## D

| Entry | Target | Period | Trades | Expectancy R ± s.e. | Profit factor | Win rate | Max DD R |
|---|---|---|---|---|---|---|---|
| ob_limit | liq | train | 114 | +0.227 ± 0.233 | 1.37 | 38% | 8.7 |
| ob_limit | liq | validation | 76 | -0.080 ± 0.172 | 0.88 | 30% | 18.2 |
| ob_limit | liq | test | 85 | -0.229 ± 0.137 | 0.67 | 29% | 23.2 |
| ob_limit | liq | all | 275 | +0.001 ± 0.116 | 1.00 | 33% | 37.2 |
| ob_limit | 2R | train | 98 | -0.071 ± 0.126 | 0.88 | 37% | 13.9 |
| ob_limit | 2R | validation | 69 | -0.263 ± 0.150 | 0.63 | 26% | 23.2 |
| ob_limit | 2R | test | 74 | -0.268 ± 0.141 | 0.62 | 28% | 22.8 |
| ob_limit | 2R | all | 241 | -0.186 ± 0.080 | 0.72 | 31% | 52.5 |
| fvg_limit | liq | train | 50 | -0.077 ± 0.206 | 0.88 | 32% | 9.8 |
| fvg_limit | liq | validation | 42 | +0.362 ± 0.280 | 1.74 | 45% | 7.3 |
| fvg_limit | liq | test | 35 | -0.191 ± 0.203 | 0.68 | 34% | 8.8 |
| fvg_limit | liq | all | 127 | +0.037 ± 0.136 | 1.06 | 37% | 9.8 |
| fvg_limit | 2R | train | 47 | -0.152 ± 0.168 | 0.75 | 34% | 10.0 |
| fvg_limit | 2R | validation | 36 | +0.171 ± 0.226 | 1.32 | 42% | 6.9 |
| fvg_limit | 2R | test | 39 | -0.324 ± 0.159 | 0.47 | 26% | 14.5 |
| fvg_limit | 2R | all | 122 | -0.112 ± 0.107 | 0.81 | 34% | 18.3 |
| confirm | liq | train | 126 | -0.038 ± 0.093 | 0.92 | 50% | 9.4 |
| confirm | liq | validation | 88 | -0.114 ± 0.108 | 0.78 | 45% | 14.4 |
| confirm | liq | test | 88 | -0.094 ± 0.154 | 0.83 | 42% | 19.2 |
| confirm | liq | all | 302 | -0.076 ± 0.067 | 0.85 | 46% | 36.5 |
| confirm | 2R | train | 126 | +0.007 ± 0.104 | 1.01 | 44% | 11.0 |
| confirm | 2R | validation | 88 | -0.042 ± 0.130 | 0.93 | 39% | 16.5 |
| confirm | 2R | test | 88 | -0.218 ± 0.114 | 0.63 | 34% | 20.5 |
| confirm | 2R | all | 302 | -0.073 ± 0.067 | 0.87 | 39% | 35.1 |

## 4H

| Entry | Target | Period | Trades | Expectancy R ± s.e. | Profit factor | Win rate | Max DD R |
|---|---|---|---|---|---|---|---|
| ob_limit | liq | train | 531 | -0.082 ± 0.069 | 0.88 | 33% | 56.6 |
| ob_limit | liq | validation | 343 | +0.013 ± 0.086 | 1.02 | 36% | 36.2 |
| ob_limit | liq | test | 472 | -0.077 ± 0.071 | 0.88 | 33% | 56.1 |
| ob_limit | liq | all | 1346 | -0.056 ± 0.043 | 0.91 | 34% | 95.2 |
| ob_limit | 2R | train | 448 | -0.080 ± 0.060 | 0.87 | 36% | 50.4 |
| ob_limit | 2R | validation | 289 | +0.015 ± 0.078 | 1.03 | 37% | 21.5 |
| ob_limit | 2R | test | 409 | -0.068 ± 0.065 | 0.89 | 35% | 40.0 |
| ob_limit | 2R | all | 1146 | -0.052 ± 0.039 | 0.92 | 36% | 61.6 |
| fvg_limit | liq | train | 269 | -0.041 ± 0.082 | 0.93 | 38% | 30.6 |
| fvg_limit | liq | validation | 156 | -0.056 ± 0.110 | 0.91 | 36% | 24.7 |
| fvg_limit | liq | test | 247 | -0.023 ± 0.088 | 0.96 | 36% | 29.2 |
| fvg_limit | liq | all | 672 | -0.038 ± 0.053 | 0.94 | 37% | 44.7 |
| fvg_limit | 2R | train | 256 | +0.028 ± 0.078 | 1.05 | 41% | 23.6 |
| fvg_limit | 2R | validation | 162 | -0.024 ± 0.101 | 0.96 | 38% | 25.5 |
| fvg_limit | 2R | test | 223 | -0.039 ± 0.084 | 0.93 | 37% | 30.4 |
| fvg_limit | 2R | all | 641 | -0.008 ± 0.050 | 0.99 | 39% | 46.0 |
| confirm | liq | train | 609 | +0.012 ± 0.050 | 1.02 | 48% | 22.6 |
| confirm | liq | validation | 405 | -0.027 ± 0.054 | 0.94 | 49% | 35.0 |
| confirm | liq | test | 511 | -0.018 ± 0.052 | 0.96 | 50% | 26.0 |
| confirm | liq | all | 1525 | -0.009 ± 0.030 | 0.98 | 49% | 59.8 |
| confirm | 2R | train | 610 | +0.017 ± 0.049 | 1.03 | 41% | 31.0 |
| confirm | 2R | validation | 405 | +0.011 ± 0.060 | 1.02 | 41% | 35.0 |
| confirm | 2R | test | 511 | -0.015 ± 0.053 | 0.97 | 41% | 30.3 |
| confirm | 2R | all | 1526 | +0.005 ± 0.031 | 1.01 | 41% | 44.8 |

## 2H

| Entry | Target | Period | Trades | Expectancy R ± s.e. | Profit factor | Win rate | Max DD R |
|---|---|---|---|---|---|---|---|
| ob_limit | liq | train | 1062 | -0.065 ± 0.052 | 0.91 | 31% | 86.5 |
| ob_limit | liq | validation | 679 | -0.064 ± 0.061 | 0.90 | 32% | 67.3 |
| ob_limit | liq | test | 905 | -0.009 ± 0.057 | 0.99 | 33% | 68.1 |
| ob_limit | liq | all | 2646 | -0.045 ± 0.033 | 0.93 | 32% | 153.9 |
| ob_limit | 2R | train | 858 | -0.091 ± 0.045 | 0.86 | 34% | 86.8 |
| ob_limit | 2R | validation | 583 | -0.020 ± 0.056 | 0.97 | 36% | 35.1 |
| ob_limit | 2R | test | 774 | -0.086 ± 0.047 | 0.87 | 33% | 71.0 |
| ob_limit | 2R | all | 2215 | -0.070 ± 0.028 | 0.89 | 34% | 162.4 |
| fvg_limit | liq | train | 460 | -0.171 ± 0.062 | 0.74 | 33% | 82.5 |
| fvg_limit | liq | validation | 330 | -0.104 ± 0.074 | 0.84 | 35% | 47.9 |
| fvg_limit | liq | test | 444 | +0.038 ± 0.072 | 1.06 | 37% | 31.9 |
| fvg_limit | liq | all | 1234 | -0.078 ± 0.040 | 0.88 | 35% | 126.5 |
| fvg_limit | 2R | train | 444 | -0.156 ± 0.058 | 0.76 | 33% | 76.6 |
| fvg_limit | 2R | validation | 310 | -0.086 ± 0.073 | 0.87 | 35% | 47.3 |
| fvg_limit | 2R | test | 441 | -0.058 ± 0.061 | 0.91 | 35% | 43.7 |
| fvg_limit | 2R | all | 1195 | -0.102 ± 0.037 | 0.84 | 34% | 130.8 |
| confirm | liq | train | 1132 | -0.119 ± 0.032 | 0.77 | 45% | 142.5 |
| confirm | liq | validation | 764 | -0.054 ± 0.041 | 0.89 | 47% | 58.0 |
| confirm | liq | test | 1003 | -0.054 ± 0.036 | 0.89 | 48% | 97.5 |
| confirm | liq | all | 2899 | -0.079 ± 0.021 | 0.84 | 46% | 253.9 |
| confirm | 2R | train | 1132 | -0.111 ± 0.035 | 0.81 | 35% | 140.6 |
| confirm | 2R | validation | 764 | -0.018 ± 0.045 | 0.97 | 37% | 40.4 |
| confirm | 2R | test | 1006 | -0.044 ± 0.039 | 0.92 | 38% | 82.0 |
| confirm | 2R | all | 2902 | -0.063 ± 0.023 | 0.89 | 37% | 192.7 |

## 1H

| Entry | Target | Period | Trades | Expectancy R ± s.e. | Profit factor | Win rate | Max DD R |
|---|---|---|---|---|---|---|---|
| ob_limit | liq | train | 2049 | -0.089 ± 0.040 | 0.88 | 28% | 217.7 |
| ob_limit | liq | validation | 1434 | -0.090 ± 0.044 | 0.87 | 30% | 175.9 |
| ob_limit | liq | test | 1860 | -0.105 ± 0.040 | 0.85 | 30% | 248.3 |
| ob_limit | liq | all | 5343 | -0.095 ± 0.024 | 0.87 | 29% | 553.6 |
| ob_limit | 2R | train | 1653 | -0.092 ± 0.033 | 0.86 | 32% | 167.9 |
| ob_limit | 2R | validation | 1217 | -0.110 ± 0.038 | 0.83 | 32% | 154.9 |
| ob_limit | 2R | test | 1583 | -0.072 ± 0.034 | 0.89 | 33% | 131.5 |
| ob_limit | 2R | all | 4453 | -0.090 ± 0.020 | 0.87 | 33% | 402.6 |
| fvg_limit | liq | train | 907 | +0.022 ± 0.065 | 1.03 | 33% | 50.4 |
| fvg_limit | liq | validation | 624 | -0.063 ± 0.063 | 0.90 | 33% | 95.9 |
| fvg_limit | liq | test | 871 | -0.101 ± 0.050 | 0.85 | 33% | 108.6 |
| fvg_limit | liq | all | 2402 | -0.045 ± 0.035 | 0.93 | 33% | 165.1 |
| fvg_limit | 2R | train | 826 | -0.097 ± 0.046 | 0.85 | 33% | 89.6 |
| fvg_limit | 2R | validation | 588 | -0.050 ± 0.054 | 0.92 | 34% | 63.8 |
| fvg_limit | 2R | test | 810 | -0.071 ± 0.046 | 0.89 | 35% | 92.3 |
| fvg_limit | 2R | all | 2224 | -0.075 ± 0.028 | 0.88 | 34% | 178.0 |
| confirm | liq | train | 2141 | -0.087 ± 0.025 | 0.84 | 45% | 190.1 |
| confirm | liq | validation | 1577 | -0.062 ± 0.029 | 0.88 | 47% | 108.5 |
| confirm | liq | test | 2030 | -0.063 ± 0.026 | 0.87 | 47% | 143.4 |
| confirm | liq | all | 5748 | -0.072 ± 0.015 | 0.86 | 46% | 413.2 |
| confirm | 2R | train | 2146 | -0.095 ± 0.026 | 0.84 | 35% | 222.6 |
| confirm | 2R | validation | 1580 | -0.005 ± 0.031 | 0.99 | 39% | 64.8 |
| confirm | 2R | test | 2032 | -0.114 ± 0.027 | 0.81 | 35% | 238.7 |
| confirm | 2R | all | 5758 | -0.077 ± 0.016 | 0.87 | 36% | 444.5 |

## Test period by pair (target = liquidity)

| TF | Entry | EURUSD | GBPUSD | AUDUSD | NZDUSD | USDCAD | USDCHF | USDJPY | XAUUSD |
|---|---|---|---|---|---|---|---|---|---|
| D | ob_limit | -0.60 (8) | -0.33 (18) | -0.30 (12) | -0.21 (14) | -0.17 (6) | -0.72 (8) | +0.16 (11) | +0.36 (8) |
| D | fvg_limit | -0.13 (2) | -0.61 (9) | -0.73 (3) | +0.02 (3) | -1.00 (3) | -0.25 (5) | +0.74 (5) | +0.36 (5) |
| D | confirm | -0.37 (10) | -0.20 (15) | -0.28 (10) | -0.38 (12) | -0.57 (6) | -0.53 (12) | +0.99 (10) | +0.43 (13) |
| 4H | ob_limit | +0.08 (59) | -0.39 (59) | -0.28 (60) | -0.15 (60) | +0.11 (64) | -0.38 (54) | +0.16 (56) | +0.20 (60) |
| 4H | fvg_limit | -0.05 (29) | -0.38 (41) | -0.10 (29) | +0.06 (34) | -0.07 (27) | -0.06 (31) | +0.45 (32) | +0.07 (24) |
| 4H | confirm | +0.01 (70) | -0.14 (54) | -0.23 (68) | -0.04 (69) | +0.23 (69) | -0.08 (62) | -0.09 (58) | +0.16 (61) |
| 2H | ob_limit | -0.07 (109) | -0.05 (117) | -0.23 (121) | -0.31 (115) | -0.14 (109) | +0.21 (115) | +0.20 (118) | +0.37 (101) |
| 2H | fvg_limit | +0.11 (53) | -0.03 (54) | -0.31 (56) | -0.16 (62) | -0.10 (48) | +0.18 (58) | +0.00 (55) | +0.59 (58) |
| 2H | confirm | +0.09 (120) | -0.04 (123) | -0.22 (134) | -0.24 (130) | +0.03 (109) | -0.11 (133) | +0.03 (133) | +0.07 (121) |
| 1H | ob_limit | -0.22 (237) | +0.17 (238) | -0.16 (232) | -0.39 (214) | -0.09 (243) | -0.02 (230) | -0.01 (273) | -0.17 (193) |
| 1H | fvg_limit | -0.24 (118) | +0.28 (114) | -0.04 (117) | -0.38 (98) | -0.09 (120) | -0.31 (117) | -0.01 (107) | -0.03 (80) |
| 1H | confirm | -0.09 (241) | +0.14 (254) | -0.14 (265) | -0.29 (249) | -0.05 (260) | -0.06 (257) | -0.03 (285) | +0.01 (219) |

## Funnel (all periods)

| TF | Entry | Target | Setups | Filled | Cancelled |
|---|---|---|---|---|---|
| D | ob_limit | liq | 640 | 275 | missed 286, expired 78, fill and target in one bar 1 |
| D | ob_limit | 2R | 640 | 241 | missed 370, expired 29 |
| D | fvg_limit | liq | 329 | 127 | missed 155, expired 47 |
| D | fvg_limit | 2R | 329 | 122 | missed 158, expired 49 |
| D | confirm | liq | 640 | 302 | invalidated 55, no confirmation 283 |
| D | confirm | 2R | 640 | 302 | invalidated 55, no confirmation 283 |
| 4H | ob_limit | liq | 3379 | 1346 | missed 1544, expired 488, fill and target in one bar 1 |
| 4H | ob_limit | 2R | 3379 | 1146 | missed 2061, expired 170, fill and target in one bar 2 |
| 4H | fvg_limit | liq | 1633 | 672 | missed 706, expired 253, fill and target in one bar 2 |
| 4H | fvg_limit | 2R | 1633 | 641 | missed 821, expired 171 |
| 4H | confirm | liq | 3377 | 1525 | no confirmation 1528, invalidated 323, bad levels 1 |
| 4H | confirm | 2R | 3377 | 1526 | no confirmation 1528, invalidated 323 |
| 2H | ob_limit | liq | 6542 | 2646 | missed 2894, expired 995, fill and target in one bar 7 |
| 2H | ob_limit | 2R | 6542 | 2215 | missed 3926, expired 397, fill and target in one bar 4 |
| 2H | fvg_limit | liq | 3175 | 1234 | missed 1366, expired 573, fill and target in one bar 2 |
| 2H | fvg_limit | 2R | 3175 | 1195 | missed 1598, expired 379, fill and target in one bar 3 |
| 2H | confirm | liq | 6535 | 2899 | invalidated 653, no confirmation 2980, bad levels 3 |
| 2H | confirm | 2R | 6535 | 2902 | invalidated 653, no confirmation 2980 |
| 1H | ob_limit | liq | 12673 | 5343 | missed 5454, expired 1865, fill and target in one bar 11 |
| 1H | ob_limit | 2R | 12673 | 4453 | missed 7429, fill and target in one bar 11, expired 780 |
| 1H | fvg_limit | liq | 5958 | 2402 | missed 2499, expired 1054, fill and target in one bar 3 |
| 1H | fvg_limit | 2R | 5958 | 2224 | missed 2999, expired 732, fill and target in one bar 3 |
| 1H | confirm | liq | 12663 | 5748 | no confirmation 5359, invalidated 1546, bad levels 10 |
| 1H | confirm | 2R | 12663 | 5758 | no confirmation 5359, invalidated 1546 |

## Stress tests – OB limit entry, liquidity target (s.e. clustered by trading day)

| TF | Setting | Train | Validation | Test |
|---|---|---|---|---|
| D | no costs | +0.233 ± 0.223 | -0.075 ± 0.180 | -0.207 ± 0.140 |
| D | rules as above | +0.227 ± 0.222 | -0.080 ± 0.180 | -0.229 ± 0.140 |
| D | costs ×1.5 | +0.037 ± 0.147 | -0.081 ± 0.180 | -0.240 ± 0.139 |
| D | costs ×2 | +0.033 ± 0.148 | -0.084 ± 0.180 | -0.242 ± 0.139 |
| D | order 15 min late | +0.227 ± 0.222 | -0.080 ± 0.180 | -0.229 ± 0.140 |
| D | order 60 min late | +0.226 ± 0.222 | -0.080 ± 0.180 | -0.229 ± 0.140 |
| D | limit must trade 1 pip through | +0.227 ± 0.224 | -0.086 ± 0.180 | -0.228 ± 0.140 |
| D | swing K=2 | +0.177 ± 0.177 | -0.089 ± 0.157 | -0.295 ± 0.116 |
| D | swing K=5 | +0.201 ± 0.215 | -0.455 ± 0.196 | -0.265 ± 0.197 |
| 4H | no costs | +0.006 ± 0.075 | +0.070 ± 0.106 | +0.033 ± 0.084 |
| 4H | rules as above | -0.082 ± 0.074 | +0.013 ± 0.102 | -0.077 ± 0.080 |
| 4H | costs ×1.5 | -0.113 ± 0.070 | +0.001 ± 0.102 | -0.095 ± 0.081 |
| 4H | costs ×2 | -0.199 ± 0.064 | -0.037 ± 0.104 | -0.131 ± 0.081 |
| 4H | order 15 min late | -0.086 ± 0.074 | +0.017 ± 0.102 | -0.083 ± 0.080 |
| 4H | order 60 min late | -0.085 ± 0.074 | -0.011 ± 0.103 | -0.091 ± 0.079 |
| 4H | limit must trade 1 pip through | -0.156 ± 0.067 | -0.052 ± 0.102 | -0.114 ± 0.079 |
| 4H | swing K=2 | -0.033 ± 0.065 | +0.064 ± 0.075 | -0.034 ± 0.063 |
| 4H | swing K=5 | -0.127 ± 0.090 | -0.142 ± 0.135 | -0.153 ± 0.096 |
| 2H | no costs | +0.019 ± 0.059 | +0.057 ± 0.067 | +0.109 ± 0.074 |
| 2H | rules as above | -0.065 ± 0.058 | -0.064 ± 0.066 | -0.009 ± 0.066 |
| 2H | costs ×1.5 | -0.106 ± 0.057 | -0.108 ± 0.067 | -0.052 ± 0.065 |
| 2H | costs ×2 | -0.176 ± 0.054 | -0.145 ± 0.067 | -0.089 ± 0.065 |
| 2H | order 15 min late | -0.089 ± 0.058 | -0.060 ± 0.067 | -0.024 ± 0.066 |
| 2H | order 60 min late | -0.122 ± 0.056 | -0.083 ± 0.066 | -0.042 ± 0.065 |
| 2H | limit must trade 1 pip through | -0.143 ± 0.055 | -0.108 ± 0.068 | -0.053 ± 0.066 |
| 2H | swing K=2 | -0.060 ± 0.047 | -0.101 ± 0.052 | -0.013 ± 0.052 |
| 2H | swing K=5 | -0.218 ± 0.065 | +0.030 ± 0.090 | -0.058 ± 0.075 |
| 1H | no costs | +0.032 ± 0.046 | +0.019 ± 0.047 | +0.044 ± 0.044 |
| 1H | rules as above | -0.089 ± 0.043 | -0.090 ± 0.045 | -0.105 ± 0.043 |
| 1H | costs ×1.5 | -0.158 ± 0.042 | -0.129 ± 0.045 | -0.158 ± 0.041 |
| 1H | costs ×2 | -0.224 ± 0.041 | -0.179 ± 0.045 | -0.226 ± 0.039 |
| 1H | order 15 min late | -0.108 ± 0.043 | -0.100 ± 0.044 | -0.115 ± 0.043 |
| 1H | order 60 min late | -0.120 ± 0.045 | -0.147 ± 0.043 | -0.116 ± 0.043 |
| 1H | limit must trade 1 pip through | -0.194 ± 0.041 | -0.141 ± 0.045 | -0.181 ± 0.040 |
| 1H | swing K=2 | -0.093 ± 0.037 | -0.123 ± 0.040 | -0.146 ± 0.034 |
| 1H | swing K=5 | -0.088 ± 0.057 | -0.076 ± 0.061 | -0.055 ± 0.063 |
