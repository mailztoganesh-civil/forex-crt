# ICT Silver Bullet (10:00-11:00 NY) – backtest

**Summary (2026-10-29).** Nasdaq (the chart's market) loses with every entry rule, before and after costs: futures costs, liquidity
target, all periods pooled: market −0.14 R, breaker −0.14 R, FVG −0.16 R per trade (2R target: −0.14 / −0.19 / −0.36). S&P is about
zero (−0.01 to −0.05 R after futures costs). FX: EURUSD negative after costs, GBPUSD and gold near zero to slightly positive but
not consistent across periods and well inside the standard errors (≈ ±0.1-0.2 R). Allowing the raid from 09:30
(SILVER_BULLET_raid0930.md) does not change this. FVG entries rarely fill on 5-minute data (price seldom returns before 11:00);
"shallower" equals "breaker" because the breaker (MSS level) is always reached before the FVG. Limitation: 5-minute bars, not the
1-minute chart in the original; index data are CFD prices (≈ cash index), not futures.

Rules: top of `scripts/silver_bullet_backtest.py` (fixed in advance; each entry tested on its own). Raid window from 10:00 NY. Data: forex-data 5-minute bars; periods train 2020-2022, validation 2023-2024, test 2025-2026. Expectancy = average R per trade ± standard error (one setup per day per instrument).

## Nasdaq 100 (NSXUSD ≈ NQ)

| Costs | Entry | Target | Period | Trades | Expectancy R ± s.e. | Profit factor | Win rate |
|---|---|---|---|---|---|---|---|
| no costs | market | 2R | train | 175 | -0.182 ± 0.086 | 0.70 | 35% |
| no costs | market | 2R | validation | 109 | -0.037 ± 0.116 | 0.93 | 38% |
| no costs | market | 2R | test | 98 | -0.141 ± 0.121 | 0.77 | 32% |
| no costs | market | 2R | all | 382 | -0.130 ± 0.060 | 0.78 | 35% |
| no costs | market | dol | train | 101 | -0.169 ± 0.138 | 0.75 | 31% |
| no costs | market | dol | validation | 70 | -0.101 ± 0.155 | 0.84 | 34% |
| no costs | market | dol | test | 68 | -0.052 ± 0.196 | 0.92 | 32% |
| no costs | market | dol | all | 239 | -0.116 ± 0.092 | 0.82 | 32% |
| no costs | fvg | 2R | train | 17 | -0.338 ± 0.301 | 0.56 | 24% |
| no costs | fvg | 2R | validation | 8 | -0.625 ± 0.375 | 0.29 | 12% |
| no costs | fvg | 2R | test | 10 | -0.138 ± 0.395 | 0.77 | 40% |
| no costs | fvg | 2R | all | 35 | -0.347 ± 0.200 | 0.53 | 26% |
| no costs | fvg | dol | train | 20 | -0.075 ± 0.443 | 0.91 | 20% |
| no costs | fvg | dol | validation | 7 | -0.192 ± 0.808 | 0.78 | 14% |
| no costs | fvg | dol | test | 10 | -0.270 ± 0.422 | 0.61 | 30% |
| no costs | fvg | dol | all | 37 | -0.150 ± 0.298 | 0.81 | 22% |
| no costs | breaker | 2R | train | 117 | -0.308 ± 0.106 | 0.56 | 28% |
| no costs | breaker | 2R | validation | 59 | +0.226 ± 0.183 | 1.42 | 44% |
| no costs | breaker | 2R | test | 67 | -0.310 ± 0.139 | 0.55 | 27% |
| no costs | breaker | 2R | all | 243 | -0.179 ± 0.079 | 0.73 | 32% |
| no costs | breaker | dol | train | 93 | -0.173 ± 0.160 | 0.76 | 28% |
| no costs | breaker | dol | validation | 49 | +0.158 ± 0.235 | 1.26 | 39% |
| no costs | breaker | dol | test | 55 | -0.318 ± 0.215 | 0.58 | 20% |
| no costs | breaker | dol | all | 197 | -0.131 ± 0.113 | 0.81 | 28% |
| no costs | shallower | 2R | train | 117 | -0.308 ± 0.106 | 0.56 | 28% |
| no costs | shallower | 2R | validation | 59 | +0.226 ± 0.183 | 1.42 | 44% |
| no costs | shallower | 2R | test | 67 | -0.310 ± 0.139 | 0.55 | 27% |
| no costs | shallower | 2R | all | 243 | -0.179 ± 0.079 | 0.73 | 32% |
| no costs | shallower | dol | train | 93 | -0.173 ± 0.160 | 0.76 | 28% |
| no costs | shallower | dol | validation | 49 | +0.158 ± 0.235 | 1.26 | 39% |
| no costs | shallower | dol | test | 55 | -0.318 ± 0.215 | 0.58 | 20% |
| no costs | shallower | dol | all | 197 | -0.131 ± 0.113 | 0.81 | 28% |
| futures | market | 2R | train | 175 | -0.194 ± 0.086 | 0.69 | 35% |
| futures | market | 2R | validation | 109 | -0.048 ± 0.116 | 0.91 | 38% |
| futures | market | 2R | test | 98 | -0.148 ± 0.121 | 0.76 | 32% |
| futures | market | 2R | all | 382 | -0.140 ± 0.060 | 0.77 | 35% |
| futures | market | dol | train | 99 | -0.193 ± 0.138 | 0.72 | 29% |
| futures | market | dol | validation | 70 | -0.122 ± 0.153 | 0.81 | 34% |
| futures | market | dol | test | 67 | -0.087 ± 0.194 | 0.87 | 31% |
| futures | market | dol | all | 236 | -0.142 ± 0.091 | 0.78 | 31% |
| futures | fvg | 2R | train | 17 | -0.348 ± 0.302 | 0.55 | 24% |
| futures | fvg | 2R | validation | 8 | -0.637 ± 0.377 | 0.28 | 12% |
| futures | fvg | 2R | test | 10 | -0.143 ± 0.396 | 0.76 | 40% |
| futures | fvg | 2R | all | 35 | -0.355 ± 0.201 | 0.53 | 26% |
| futures | fvg | dol | train | 20 | -0.090 ± 0.444 | 0.89 | 20% |
| futures | fvg | dol | validation | 7 | -0.206 ± 0.811 | 0.76 | 14% |
| futures | fvg | dol | test | 10 | -0.276 ± 0.423 | 0.61 | 30% |
| futures | fvg | dol | all | 37 | -0.163 ± 0.299 | 0.80 | 22% |
| futures | breaker | 2R | train | 117 | -0.319 ± 0.107 | 0.55 | 27% |
| futures | breaker | 2R | validation | 59 | +0.199 ± 0.181 | 1.36 | 44% |
| futures | breaker | 2R | test | 67 | -0.316 ± 0.139 | 0.54 | 27% |
| futures | breaker | 2R | all | 243 | -0.192 ± 0.079 | 0.71 | 31% |
| futures | breaker | dol | train | 93 | -0.185 ± 0.160 | 0.75 | 27% |
| futures | breaker | dol | validation | 49 | +0.145 ± 0.236 | 1.24 | 39% |
| futures | breaker | dol | test | 55 | -0.325 ± 0.215 | 0.58 | 20% |
| futures | breaker | dol | all | 197 | -0.142 ± 0.113 | 0.80 | 28% |
| futures | shallower | 2R | train | 117 | -0.319 ± 0.107 | 0.55 | 27% |
| futures | shallower | 2R | validation | 59 | +0.199 ± 0.181 | 1.36 | 44% |
| futures | shallower | 2R | test | 67 | -0.316 ± 0.139 | 0.54 | 27% |
| futures | shallower | 2R | all | 243 | -0.192 ± 0.079 | 0.71 | 31% |
| futures | shallower | dol | train | 93 | -0.185 ± 0.160 | 0.75 | 27% |
| futures | shallower | dol | validation | 49 | +0.145 ± 0.236 | 1.24 | 39% |
| futures | shallower | dol | test | 55 | -0.325 ± 0.215 | 0.58 | 20% |
| futures | shallower | dol | all | 197 | -0.142 ± 0.113 | 0.80 | 28% |
| cfd | market | 2R | train | 175 | -0.212 ± 0.085 | 0.66 | 34% |
| cfd | market | 2R | validation | 109 | -0.055 ± 0.116 | 0.90 | 38% |
| cfd | market | 2R | test | 98 | -0.151 ± 0.121 | 0.75 | 32% |
| cfd | market | 2R | all | 382 | -0.152 ± 0.060 | 0.75 | 34% |
| cfd | market | dol | train | 99 | -0.206 ± 0.136 | 0.70 | 29% |
| cfd | market | dol | validation | 70 | -0.136 ± 0.151 | 0.78 | 34% |
| cfd | market | dol | test | 67 | -0.153 ± 0.186 | 0.77 | 30% |
| cfd | market | dol | all | 236 | -0.170 ± 0.089 | 0.74 | 31% |
| cfd | fvg | 2R | train | 17 | -0.349 ± 0.301 | 0.55 | 24% |
| cfd | fvg | 2R | validation | 8 | -0.637 ± 0.377 | 0.28 | 12% |
| cfd | fvg | 2R | test | 10 | -0.144 ± 0.396 | 0.76 | 40% |
| cfd | fvg | 2R | all | 35 | -0.356 ± 0.201 | 0.53 | 26% |
| cfd | fvg | dol | train | 19 | -0.238 ± 0.441 | 0.72 | 16% |
| cfd | fvg | dol | validation | 7 | -0.206 ± 0.811 | 0.76 | 14% |
| cfd | fvg | dol | test | 10 | -0.277 ± 0.423 | 0.61 | 30% |
| cfd | fvg | dol | all | 36 | -0.243 ± 0.296 | 0.70 | 19% |
| cfd | breaker | 2R | train | 116 | -0.327 ± 0.107 | 0.55 | 27% |
| cfd | breaker | 2R | validation | 58 | +0.166 ± 0.181 | 1.30 | 43% |
| cfd | breaker | 2R | test | 66 | -0.352 ± 0.137 | 0.50 | 26% |
| cfd | breaker | 2R | all | 240 | -0.215 ± 0.079 | 0.68 | 30% |
| cfd | breaker | dol | train | 93 | -0.187 ± 0.160 | 0.74 | 27% |
| cfd | breaker | dol | validation | 48 | +0.036 ± 0.215 | 1.06 | 38% |
| cfd | breaker | dol | test | 54 | -0.355 ± 0.217 | 0.55 | 19% |
| cfd | breaker | dol | all | 195 | -0.179 ± 0.111 | 0.75 | 27% |
| cfd | shallower | 2R | train | 116 | -0.327 ± 0.107 | 0.55 | 27% |
| cfd | shallower | 2R | validation | 58 | +0.166 ± 0.181 | 1.30 | 43% |
| cfd | shallower | 2R | test | 66 | -0.352 ± 0.137 | 0.50 | 26% |
| cfd | shallower | 2R | all | 240 | -0.215 ± 0.079 | 0.68 | 30% |
| cfd | shallower | dol | train | 93 | -0.187 ± 0.160 | 0.74 | 27% |
| cfd | shallower | dol | validation | 48 | +0.036 ± 0.215 | 1.06 | 38% |
| cfd | shallower | dol | test | 54 | -0.355 ± 0.217 | 0.55 | 19% |
| cfd | shallower | dol | all | 195 | -0.179 ± 0.111 | 0.75 | 27% |

Funnel (NSXUSD, first cost level): market/dol: setups 382, filled 239, DOL < 1R 143, no level 1; market/2R: setups 382, filled 382, no level 1; fvg/dol: setups 132, filled 37, no level 251, expired 11:00 71, missed 10, DOL < 1R 14; fvg/2R: setups 132, filled 35, no level 251, expired 11:00 66, missed 29, fill+target one bar 2; breaker/dol: setups 383, filled 197, DOL < 1R 79, expired 11:00 93, missed 14; breaker/2R: setups 383, filled 243, expired 11:00 106, missed 32, fill+target one bar 2; shallower/dol: setups 383, filled 197, DOL < 1R 79, expired 11:00 93, missed 14; shallower/2R: setups 383, filled 243, expired 11:00 106, missed 32, fill+target one bar 2

## S&P 500 (SPXUSD ≈ ES)

| Costs | Entry | Target | Period | Trades | Expectancy R ± s.e. | Profit factor | Win rate |
|---|---|---|---|---|---|---|---|
| no costs | market | 2R | train | 141 | +0.057 ± 0.110 | 1.10 | 40% |
| no costs | market | 2R | validation | 103 | -0.037 ± 0.129 | 0.94 | 33% |
| no costs | market | 2R | test | 77 | +0.111 ± 0.151 | 1.21 | 43% |
| no costs | market | 2R | all | 321 | +0.040 ± 0.073 | 1.07 | 38% |
| no costs | market | dol | train | 104 | +0.112 ± 0.143 | 1.20 | 40% |
| no costs | market | dol | validation | 72 | -0.113 ± 0.169 | 0.83 | 32% |
| no costs | market | dol | test | 52 | +0.027 ± 0.206 | 1.04 | 35% |
| no costs | market | dol | all | 228 | +0.021 ± 0.096 | 1.04 | 36% |
| no costs | fvg | 2R | train | 9 | -0.333 ± 0.441 | 0.57 | 22% |
| no costs | fvg | 2R | validation | 10 | -0.400 ± 0.400 | 0.50 | 20% |
| no costs | fvg | 2R | test | 11 | -0.047 ± 0.418 | 0.93 | 36% |
| no costs | fvg | 2R | all | 30 | -0.251 ± 0.236 | 0.66 | 27% |
| no costs | fvg | dol | train | 11 | -0.532 ± 0.468 | 0.41 | 9% |
| no costs | fvg | dol | validation | 12 | -0.562 ± 0.438 | 0.39 | 8% |
| no costs | fvg | dol | test | 10 | -0.049 ± 0.485 | 0.93 | 30% |
| no costs | fvg | dol | all | 33 | -0.397 ± 0.262 | 0.53 | 15% |
| no costs | breaker | 2R | train | 83 | -0.005 ± 0.147 | 0.99 | 35% |
| no costs | breaker | 2R | validation | 62 | -0.040 ± 0.173 | 0.94 | 34% |
| no costs | breaker | 2R | test | 50 | +0.183 ± 0.195 | 1.34 | 44% |
| no costs | breaker | 2R | all | 195 | +0.032 ± 0.097 | 1.05 | 37% |
| no costs | breaker | dol | train | 76 | +0.117 ± 0.203 | 1.18 | 33% |
| no costs | breaker | dol | validation | 56 | +0.006 ± 0.238 | 1.01 | 30% |
| no costs | breaker | dol | test | 42 | +0.012 ± 0.240 | 1.02 | 33% |
| no costs | breaker | dol | all | 174 | +0.056 ± 0.130 | 1.08 | 32% |
| no costs | shallower | 2R | train | 83 | -0.005 ± 0.147 | 0.99 | 35% |
| no costs | shallower | 2R | validation | 62 | -0.040 ± 0.173 | 0.94 | 34% |
| no costs | shallower | 2R | test | 50 | +0.183 ± 0.195 | 1.34 | 44% |
| no costs | shallower | 2R | all | 195 | +0.032 ± 0.097 | 1.05 | 37% |
| no costs | shallower | dol | train | 76 | +0.117 ± 0.203 | 1.18 | 33% |
| no costs | shallower | dol | validation | 56 | +0.006 ± 0.238 | 1.01 | 30% |
| no costs | shallower | dol | test | 42 | +0.012 ± 0.240 | 1.02 | 33% |
| no costs | shallower | dol | all | 174 | +0.056 ± 0.130 | 1.08 | 32% |
| futures | market | 2R | train | 141 | +0.010 ± 0.110 | 1.02 | 39% |
| futures | market | 2R | validation | 103 | -0.163 ± 0.124 | 0.75 | 30% |
| futures | market | 2R | test | 77 | +0.084 ± 0.151 | 1.15 | 43% |
| futures | market | 2R | all | 321 | -0.028 ± 0.072 | 0.95 | 37% |
| futures | market | dol | train | 98 | +0.084 ± 0.145 | 1.14 | 42% |
| futures | market | dol | validation | 69 | -0.210 ± 0.159 | 0.69 | 30% |
| futures | market | dol | test | 51 | +0.000 ± 0.203 | 1.00 | 35% |
| futures | market | dol | all | 218 | -0.029 ± 0.095 | 0.95 | 37% |
| futures | fvg | 2R | train | 9 | -0.374 ± 0.449 | 0.54 | 22% |
| futures | fvg | 2R | validation | 10 | -0.428 ± 0.405 | 0.48 | 20% |
| futures | fvg | 2R | test | 11 | -0.067 ± 0.422 | 0.90 | 36% |
| futures | fvg | 2R | all | 30 | -0.280 ± 0.239 | 0.63 | 27% |
| futures | fvg | dol | train | 12 | -0.620 ± 0.433 | 0.36 | 8% |
| futures | fvg | dol | validation | 12 | -0.605 ± 0.442 | 0.37 | 8% |
| futures | fvg | dol | test | 10 | -0.070 ± 0.490 | 0.90 | 30% |
| futures | fvg | dol | all | 34 | -0.453 ± 0.257 | 0.49 | 15% |
| futures | breaker | 2R | train | 82 | -0.018 ± 0.150 | 0.97 | 35% |
| futures | breaker | 2R | validation | 61 | -0.100 ± 0.175 | 0.85 | 33% |
| futures | breaker | 2R | test | 49 | +0.132 ± 0.197 | 1.24 | 43% |
| futures | breaker | 2R | all | 192 | -0.006 ± 0.098 | 0.99 | 36% |
| futures | breaker | dol | train | 76 | +0.083 ± 0.204 | 1.12 | 33% |
| futures | breaker | dol | validation | 54 | -0.168 ± 0.219 | 0.78 | 28% |
| futures | breaker | dol | test | 41 | -0.112 ± 0.221 | 0.84 | 32% |
| futures | breaker | dol | all | 171 | -0.043 ± 0.125 | 0.94 | 31% |
| futures | shallower | 2R | train | 82 | -0.018 ± 0.150 | 0.97 | 35% |
| futures | shallower | 2R | validation | 61 | -0.100 ± 0.175 | 0.85 | 33% |
| futures | shallower | 2R | test | 49 | +0.132 ± 0.197 | 1.24 | 43% |
| futures | shallower | 2R | all | 192 | -0.006 ± 0.098 | 0.99 | 36% |
| futures | shallower | dol | train | 76 | +0.083 ± 0.204 | 1.12 | 33% |
| futures | shallower | dol | validation | 54 | -0.168 ± 0.219 | 0.78 | 28% |
| futures | shallower | dol | test | 41 | -0.112 ± 0.221 | 0.84 | 32% |
| futures | shallower | dol | all | 171 | -0.043 ± 0.125 | 0.94 | 31% |
| cfd | market | 2R | train | 141 | +0.006 ± 0.110 | 1.01 | 39% |
| cfd | market | 2R | validation | 103 | -0.196 ± 0.122 | 0.71 | 29% |
| cfd | market | 2R | test | 77 | +0.081 ± 0.150 | 1.15 | 43% |
| cfd | market | 2R | all | 321 | -0.041 ± 0.072 | 0.93 | 37% |
| cfd | market | dol | train | 97 | +0.080 ± 0.145 | 1.14 | 42% |
| cfd | market | dol | validation | 68 | -0.259 ± 0.156 | 0.64 | 29% |
| cfd | market | dol | test | 51 | -0.011 ± 0.200 | 0.98 | 35% |
| cfd | market | dol | all | 216 | -0.048 ± 0.094 | 0.92 | 37% |
| cfd | fvg | 2R | train | 9 | -0.381 ± 0.450 | 0.54 | 22% |
| cfd | fvg | 2R | validation | 8 | -0.279 ± 0.497 | 0.64 | 25% |
| cfd | fvg | 2R | test | 11 | -0.068 ± 0.422 | 0.90 | 36% |
| cfd | fvg | 2R | all | 28 | -0.229 ± 0.253 | 0.69 | 29% |
| cfd | fvg | dol | train | 11 | -0.581 ± 0.473 | 0.39 | 9% |
| cfd | fvg | dol | validation | 10 | -0.521 ± 0.530 | 0.45 | 10% |
| cfd | fvg | dol | test | 10 | -0.070 ± 0.490 | 0.90 | 30% |
| cfd | fvg | dol | all | 31 | -0.397 ± 0.280 | 0.55 | 16% |
| cfd | breaker | 2R | train | 78 | -0.027 ± 0.155 | 0.96 | 36% |
| cfd | breaker | 2R | validation | 61 | -0.100 ± 0.175 | 0.85 | 33% |
| cfd | breaker | 2R | test | 47 | +0.052 ± 0.197 | 1.09 | 40% |
| cfd | breaker | 2R | all | 186 | -0.031 ± 0.099 | 0.95 | 36% |
| cfd | breaker | dol | train | 74 | +0.036 ± 0.200 | 1.05 | 32% |
| cfd | breaker | dol | validation | 54 | -0.215 ± 0.217 | 0.72 | 26% |
| cfd | breaker | dol | test | 39 | -0.238 ± 0.213 | 0.67 | 28% |
| cfd | breaker | dol | all | 167 | -0.109 ± 0.123 | 0.85 | 29% |
| cfd | shallower | 2R | train | 78 | -0.027 ± 0.155 | 0.96 | 36% |
| cfd | shallower | 2R | validation | 61 | -0.100 ± 0.175 | 0.85 | 33% |
| cfd | shallower | 2R | test | 47 | +0.052 ± 0.197 | 1.09 | 40% |
| cfd | shallower | 2R | all | 186 | -0.031 ± 0.099 | 0.95 | 36% |
| cfd | shallower | dol | train | 74 | +0.036 ± 0.200 | 1.05 | 32% |
| cfd | shallower | dol | validation | 54 | -0.215 ± 0.217 | 0.72 | 26% |
| cfd | shallower | dol | test | 39 | -0.238 ± 0.213 | 0.67 | 28% |
| cfd | shallower | dol | all | 167 | -0.109 ± 0.123 | 0.85 | 29% |

Funnel (SPXUSD, first cost level): market/dol: setups 321, filled 228, DOL < 1R 93; market/2R: setups 321, filled 321; fvg/dol: no level 207, setups 114, expired 11:00 67, filled 33, missed 10, DOL < 1R 4; fvg/2R: no level 207, setups 114, expired 11:00 54, filled 30, missed 30; breaker/dol: setups 321, expired 11:00 94, filled 174, DOL < 1R 42, missed 10, fill+target one bar 1; breaker/2R: setups 321, expired 11:00 94, filled 195, missed 29, fill+target one bar 3; shallower/dol: setups 321, expired 11:00 94, filled 174, DOL < 1R 42, missed 10, fill+target one bar 1; shallower/2R: setups 321, expired 11:00 94, filled 195, missed 29, fill+target one bar 3

## EURUSD

| Costs | Entry | Target | Period | Trades | Expectancy R ± s.e. | Profit factor | Win rate |
|---|---|---|---|---|---|---|---|
| no costs | market | 2R | train | – |
| no costs | market | 2R | validation | 53 | +0.135 ± 0.177 | 1.27 | 42% |
| no costs | market | 2R | test | 55 | -0.097 ± 0.154 | 0.82 | 36% |
| no costs | market | 2R | all | 108 | +0.017 ± 0.117 | 1.03 | 39% |
| no costs | market | dol | train | – |
| no costs | market | dol | validation | 50 | +0.076 ± 0.193 | 1.15 | 40% |
| no costs | market | dol | test | 49 | -0.040 ± 0.209 | 0.93 | 35% |
| no costs | market | dol | all | 99 | +0.019 ± 0.142 | 1.03 | 37% |
| no costs | fvg | 2R | train | – |
| no costs | fvg | 2R | validation | 8 | +0.634 ± 0.531 | 2.69 | 62% |
| no costs | fvg | 2R | test | 10 | +0.312 ± 0.433 | 1.74 | 40% |
| no costs | fvg | 2R | all | 18 | +0.455 ± 0.329 | 2.13 | 50% |
| no costs | fvg | dol | train | – |
| no costs | fvg | dol | validation | 8 | +1.290 ± 0.895 | 4.44 | 62% |
| no costs | fvg | dol | test | 11 | +1.213 ± 1.117 | 3.55 | 36% |
| no costs | fvg | dol | all | 19 | +1.245 ± 0.730 | 3.87 | 47% |
| no costs | breaker | 2R | train | – |
| no costs | breaker | 2R | validation | 36 | +0.187 ± 0.227 | 1.36 | 42% |
| no costs | breaker | 2R | test | 34 | -0.093 ± 0.223 | 0.85 | 29% |
| no costs | breaker | 2R | all | 70 | +0.051 ± 0.159 | 1.09 | 36% |
| no costs | breaker | dol | train | – |
| no costs | breaker | dol | validation | 35 | +0.117 ± 0.285 | 1.20 | 37% |
| no costs | breaker | dol | test | 33 | -0.117 ± 0.278 | 0.82 | 24% |
| no costs | breaker | dol | all | 68 | +0.003 ± 0.198 | 1.01 | 31% |
| no costs | shallower | 2R | train | – |
| no costs | shallower | 2R | validation | 36 | +0.187 ± 0.227 | 1.36 | 42% |
| no costs | shallower | 2R | test | 34 | -0.093 ± 0.223 | 0.85 | 29% |
| no costs | shallower | 2R | all | 70 | +0.051 ± 0.159 | 1.09 | 36% |
| no costs | shallower | dol | train | – |
| no costs | shallower | dol | validation | 35 | +0.117 ± 0.285 | 1.20 | 37% |
| no costs | shallower | dol | test | 33 | -0.117 ± 0.278 | 0.82 | 24% |
| no costs | shallower | dol | all | 68 | +0.003 ± 0.198 | 1.01 | 31% |
| retail | market | 2R | train | – |
| retail | market | 2R | validation | 53 | -0.024 ± 0.168 | 0.96 | 38% |
| retail | market | 2R | test | 55 | -0.171 ± 0.155 | 0.72 | 33% |
| retail | market | 2R | all | 108 | -0.099 ± 0.114 | 0.83 | 35% |
| retail | market | dol | train | – |
| retail | market | dol | validation | 50 | -0.071 ± 0.182 | 0.87 | 36% |
| retail | market | dol | test | 49 | -0.157 ± 0.196 | 0.76 | 33% |
| retail | market | dol | all | 99 | -0.114 ± 0.133 | 0.81 | 34% |
| retail | fvg | 2R | train | – |
| retail | fvg | 2R | validation | 7 | -0.018 ± 0.541 | 0.97 | 43% |
| retail | fvg | 2R | test | 10 | +0.289 ± 0.437 | 1.65 | 40% |
| retail | fvg | 2R | all | 17 | +0.163 ± 0.331 | 1.32 | 41% |
| retail | fvg | dol | train | – |
| retail | fvg | dol | validation | 7 | -0.085 ± 0.509 | 0.86 | 43% |
| retail | fvg | dol | test | 11 | +1.180 ± 1.120 | 3.37 | 36% |
| retail | fvg | dol | all | 18 | +0.688 ± 0.713 | 2.29 | 39% |
| retail | breaker | 2R | train | – |
| retail | breaker | 2R | validation | 35 | +0.006 ± 0.226 | 1.01 | 37% |
| retail | breaker | 2R | test | 32 | -0.152 ± 0.228 | 0.77 | 28% |
| retail | breaker | 2R | all | 67 | -0.069 ± 0.160 | 0.89 | 33% |
| retail | breaker | dol | train | – |
| retail | breaker | dol | validation | 34 | -0.055 ± 0.288 | 0.92 | 32% |
| retail | breaker | dol | test | 31 | -0.160 ± 0.292 | 0.77 | 23% |
| retail | breaker | dol | all | 65 | -0.105 ± 0.204 | 0.85 | 28% |
| retail | shallower | 2R | train | – |
| retail | shallower | 2R | validation | 35 | +0.006 ± 0.226 | 1.01 | 37% |
| retail | shallower | 2R | test | 32 | -0.152 ± 0.228 | 0.77 | 28% |
| retail | shallower | 2R | all | 67 | -0.069 ± 0.160 | 0.89 | 33% |
| retail | shallower | dol | train | – |
| retail | shallower | dol | validation | 34 | -0.055 ± 0.288 | 0.92 | 32% |
| retail | shallower | dol | test | 31 | -0.160 ± 0.292 | 0.77 | 23% |
| retail | shallower | dol | all | 65 | -0.105 ± 0.204 | 0.85 | 28% |

Funnel (EURUSD, first cost level): market/dol: setups 108, DOL < 1R 9, filled 99; market/2R: setups 108, filled 108; fvg/dol: setups 52, expired 11:00 33, no level 56, filled 19; fvg/2R: setups 52, expired 11:00 25, no level 56, missed 9, filled 18; breaker/dol: setups 108, DOL < 1R 4, expired 11:00 33, filled 68, missed 3; breaker/2R: setups 108, expired 11:00 32, filled 70, missed 6; shallower/dol: setups 108, DOL < 1R 4, expired 11:00 33, filled 68, missed 3; shallower/2R: setups 108, expired 11:00 32, filled 70, missed 6

## GBPUSD

| Costs | Entry | Target | Period | Trades | Expectancy R ± s.e. | Profit factor | Win rate |
|---|---|---|---|---|---|---|---|
| no costs | market | 2R | train | – |
| no costs | market | 2R | validation | 56 | +0.236 ± 0.165 | 1.54 | 52% |
| no costs | market | 2R | test | 53 | +0.026 ± 0.167 | 1.05 | 40% |
| no costs | market | 2R | all | 109 | +0.134 ± 0.117 | 1.28 | 46% |
| no costs | market | dol | train | – |
| no costs | market | dol | validation | 51 | +0.242 ± 0.202 | 1.49 | 49% |
| no costs | market | dol | test | 47 | +0.124 ± 0.189 | 1.25 | 45% |
| no costs | market | dol | all | 98 | +0.185 ± 0.138 | 1.37 | 47% |
| no costs | fvg | 2R | train | – |
| no costs | fvg | 2R | validation | 6 | +0.500 ± 0.671 | 2.00 | 50% |
| no costs | fvg | 2R | test | 7 | +0.001 ± 0.535 | 1.00 | 43% |
| no costs | fvg | 2R | all | 13 | +0.232 ± 0.411 | 1.43 | 46% |
| no costs | fvg | dol | train | – |
| no costs | fvg | dol | validation | 7 | +2.327 ± 1.588 | 6.43 | 57% |
| no costs | fvg | dol | test | 7 | +0.416 ± 0.839 | 1.73 | 43% |
| no costs | fvg | dol | all | 14 | +1.371 ± 0.903 | 3.74 | 50% |
| no costs | breaker | 2R | train | – |
| no costs | breaker | 2R | validation | 36 | +0.268 ± 0.220 | 1.57 | 50% |
| no costs | breaker | 2R | test | 33 | +0.108 ± 0.230 | 1.20 | 39% |
| no costs | breaker | 2R | all | 69 | +0.192 ± 0.158 | 1.38 | 45% |
| no costs | breaker | dol | train | – |
| no costs | breaker | dol | validation | 35 | +0.251 ± 0.254 | 1.49 | 49% |
| no costs | breaker | dol | test | 30 | +0.092 ± 0.283 | 1.16 | 37% |
| no costs | breaker | dol | all | 65 | +0.178 ± 0.188 | 1.33 | 43% |
| no costs | shallower | 2R | train | – |
| no costs | shallower | 2R | validation | 36 | +0.268 ± 0.220 | 1.57 | 50% |
| no costs | shallower | 2R | test | 33 | +0.108 ± 0.230 | 1.20 | 39% |
| no costs | shallower | 2R | all | 69 | +0.192 ± 0.158 | 1.38 | 45% |
| no costs | shallower | dol | train | – |
| no costs | shallower | dol | validation | 35 | +0.251 ± 0.254 | 1.49 | 49% |
| no costs | shallower | dol | test | 30 | +0.092 ± 0.283 | 1.16 | 37% |
| no costs | shallower | dol | all | 65 | +0.178 ± 0.188 | 1.33 | 43% |
| retail | market | 2R | train | – |
| retail | market | 2R | validation | 56 | +0.108 ± 0.161 | 1.22 | 46% |
| retail | market | 2R | test | 53 | -0.095 ± 0.164 | 0.84 | 38% |
| retail | market | 2R | all | 109 | +0.009 ± 0.115 | 1.02 | 42% |
| retail | market | dol | train | – |
| retail | market | dol | validation | 51 | +0.127 ± 0.190 | 1.24 | 47% |
| retail | market | dol | test | 47 | -0.071 ± 0.172 | 0.87 | 43% |
| retail | market | dol | all | 98 | +0.032 ± 0.128 | 1.06 | 45% |
| retail | fvg | 2R | train | – |
| retail | fvg | 2R | validation | – |
| retail | fvg | 2R | test | 5 | +0.370 ± 0.691 | 1.86 | 40% |
| retail | fvg | 2R | all | 9 | +0.422 ± 0.510 | 1.90 | 44% |
| retail | fvg | dol | train | – |
| retail | fvg | dol | validation | 5 | +3.223 ± 2.068 | 8.84 | 60% |
| retail | fvg | dol | test | 5 | +0.923 ± 1.089 | 3.15 | 40% |
| retail | fvg | dol | all | 10 | +2.073 ± 1.166 | 5.93 | 50% |
| retail | breaker | 2R | train | – |
| retail | breaker | 2R | validation | 31 | +0.252 ± 0.243 | 1.51 | 48% |
| retail | breaker | 2R | test | 32 | -0.102 ± 0.227 | 0.84 | 31% |
| retail | breaker | 2R | all | 63 | +0.072 ± 0.166 | 1.13 | 40% |
| retail | breaker | dol | train | – |
| retail | breaker | dol | validation | 30 | +0.205 ± 0.278 | 1.38 | 47% |
| retail | breaker | dol | test | 30 | -0.116 ± 0.266 | 0.82 | 30% |
| retail | breaker | dol | all | 60 | +0.045 ± 0.192 | 1.07 | 38% |
| retail | shallower | 2R | train | – |
| retail | shallower | 2R | validation | 31 | +0.252 ± 0.243 | 1.51 | 48% |
| retail | shallower | 2R | test | 32 | -0.102 ± 0.227 | 0.84 | 31% |
| retail | shallower | 2R | all | 63 | +0.072 ± 0.166 | 1.13 | 40% |
| retail | shallower | dol | train | – |
| retail | shallower | dol | validation | 30 | +0.205 ± 0.278 | 1.38 | 47% |
| retail | shallower | dol | test | 30 | -0.116 ± 0.266 | 0.82 | 30% |
| retail | shallower | dol | all | 60 | +0.045 ± 0.192 | 1.07 | 38% |

Funnel (GBPUSD, first cost level): market/dol: setups 109, filled 98, DOL < 1R 11; market/2R: setups 109, filled 109; fvg/dol: no level 58, setups 51, expired 11:00 37, filled 14; fvg/2R: no level 58, setups 51, expired 11:00 34, filled 13, missed 4; breaker/dol: setups 109, filled 65, expired 11:00 40, DOL < 1R 4; breaker/2R: setups 109, filled 69, expired 11:00 38, missed 2; shallower/dol: setups 109, filled 65, expired 11:00 40, DOL < 1R 4; shallower/2R: setups 109, filled 69, expired 11:00 38, missed 2

## XAUUSD

| Costs | Entry | Target | Period | Trades | Expectancy R ± s.e. | Profit factor | Win rate |
|---|---|---|---|---|---|---|---|
| no costs | market | 2R | train | 85 | +0.138 ± 0.133 | 1.30 | 45% |
| no costs | market | 2R | validation | 59 | +0.209 ± 0.165 | 1.44 | 47% |
| no costs | market | 2R | test | 68 | -0.067 ± 0.132 | 0.87 | 44% |
| no costs | market | 2R | all | 212 | +0.092 ± 0.082 | 1.19 | 45% |
| no costs | market | dol | train | 69 | +0.282 ± 0.217 | 1.57 | 42% |
| no costs | market | dol | validation | 42 | +0.195 ± 0.233 | 1.37 | 43% |
| no costs | market | dol | test | 55 | -0.048 ± 0.146 | 0.91 | 45% |
| no costs | market | dol | all | 166 | +0.151 ± 0.118 | 1.30 | 43% |
| no costs | fvg | 2R | train | 10 | -0.548 ± 0.321 | 0.31 | 20% |
| no costs | fvg | 2R | validation | 6 | +0.000 ± 0.632 | 1.00 | 33% |
| no costs | fvg | 2R | test | 9 | +0.190 ± 0.407 | 1.43 | 56% |
| no costs | fvg | 2R | all | 25 | -0.151 ± 0.245 | 0.76 | 36% |
| no costs | fvg | dol | train | 10 | -0.486 ± 0.514 | 0.46 | 10% |
| no costs | fvg | dol | validation | 6 | +0.430 ± 0.920 | 1.64 | 33% |
| no costs | fvg | dol | test | 9 | +0.294 ± 0.453 | 1.66 | 56% |
| no costs | fvg | dol | all | 25 | +0.015 ± 0.337 | 1.02 | 32% |
| no costs | breaker | 2R | train | 57 | +0.056 ± 0.164 | 1.11 | 42% |
| no costs | breaker | 2R | validation | 34 | +0.174 ± 0.225 | 1.35 | 44% |
| no costs | breaker | 2R | test | 41 | +0.158 ± 0.195 | 1.34 | 49% |
| no costs | breaker | 2R | all | 132 | +0.118 ± 0.109 | 1.24 | 45% |
| no costs | breaker | dol | train | 51 | +0.146 ± 0.289 | 1.25 | 33% |
| no costs | breaker | dol | validation | 29 | +0.088 ± 0.257 | 1.16 | 38% |
| no costs | breaker | dol | test | 38 | +0.320 ± 0.231 | 1.73 | 53% |
| no costs | breaker | dol | all | 118 | +0.188 ± 0.158 | 1.36 | 41% |
| no costs | shallower | 2R | train | 57 | +0.056 ± 0.164 | 1.11 | 42% |
| no costs | shallower | 2R | validation | 34 | +0.174 ± 0.225 | 1.35 | 44% |
| no costs | shallower | 2R | test | 41 | +0.158 ± 0.195 | 1.34 | 49% |
| no costs | shallower | 2R | all | 132 | +0.118 ± 0.109 | 1.24 | 45% |
| no costs | shallower | dol | train | 51 | +0.146 ± 0.289 | 1.25 | 33% |
| no costs | shallower | dol | validation | 29 | +0.088 ± 0.257 | 1.16 | 38% |
| no costs | shallower | dol | test | 38 | +0.320 ± 0.231 | 1.73 | 53% |
| no costs | shallower | dol | all | 118 | +0.188 ± 0.158 | 1.36 | 41% |
| retail | market | 2R | train | 85 | +0.057 ± 0.128 | 1.12 | 42% |
| retail | market | 2R | validation | 59 | +0.160 ± 0.163 | 1.33 | 47% |
| retail | market | 2R | test | 68 | -0.091 ± 0.132 | 0.83 | 44% |
| retail | market | 2R | all | 212 | +0.038 ± 0.080 | 1.08 | 44% |
| retail | market | dol | train | 69 | +0.183 ± 0.199 | 1.36 | 41% |
| retail | market | dol | validation | 40 | +0.146 ± 0.227 | 1.27 | 45% |
| retail | market | dol | test | 54 | -0.055 ± 0.146 | 0.89 | 46% |
| retail | market | dol | all | 163 | +0.095 ± 0.111 | 1.18 | 44% |
| retail | fvg | 2R | train | 8 | -0.648 ± 0.378 | 0.28 | 12% |
| retail | fvg | 2R | validation | 5 | +0.191 ± 0.738 | 1.31 | 40% |
| retail | fvg | 2R | test | 7 | +0.169 ± 0.462 | 1.39 | 57% |
| retail | fvg | 2R | all | 20 | -0.152 ± 0.286 | 0.77 | 35% |
| retail | fvg | dol | train | 9 | -0.459 ± 0.575 | 0.50 | 11% |
| retail | fvg | dol | validation | 5 | +0.694 ± 1.064 | 2.14 | 40% |
| retail | fvg | dol | test | 7 | +0.301 ± 0.528 | 1.69 | 57% |
| retail | fvg | dol | all | 21 | +0.069 ± 0.387 | 1.10 | 33% |
| retail | breaker | 2R | train | 52 | -0.155 ± 0.158 | 0.73 | 37% |
| retail | breaker | 2R | validation | 32 | +0.106 ± 0.233 | 1.20 | 44% |
| retail | breaker | 2R | test | 39 | +0.043 ± 0.195 | 1.08 | 46% |
| retail | breaker | 2R | all | 123 | -0.024 ± 0.109 | 0.96 | 41% |
| retail | breaker | dol | train | 46 | -0.089 ± 0.302 | 0.87 | 26% |
| retail | breaker | dol | validation | 27 | +0.032 ± 0.273 | 1.05 | 37% |
| retail | breaker | dol | test | 36 | +0.214 ± 0.233 | 1.45 | 50% |
| retail | breaker | dol | all | 109 | +0.041 ± 0.163 | 1.07 | 37% |
| retail | shallower | 2R | train | 52 | -0.155 ± 0.158 | 0.73 | 37% |
| retail | shallower | 2R | validation | 32 | +0.106 ± 0.233 | 1.20 | 44% |
| retail | shallower | 2R | test | 39 | +0.043 ± 0.195 | 1.08 | 46% |
| retail | shallower | 2R | all | 123 | -0.024 ± 0.109 | 0.96 | 41% |
| retail | shallower | dol | train | 46 | -0.089 ± 0.302 | 0.87 | 26% |
| retail | shallower | dol | validation | 27 | +0.032 ± 0.273 | 1.05 | 37% |
| retail | shallower | dol | test | 36 | +0.214 ± 0.233 | 1.45 | 50% |
| retail | shallower | dol | all | 109 | +0.041 ± 0.163 | 1.07 | 37% |

Funnel (XAUUSD, first cost level): market/dol: setups 212, filled 166, DOL < 1R 46; market/2R: setups 212, filled 212; fvg/dol: no level 116, setups 96, filled 25, expired 11:00 65, missed 3, DOL < 1R 3; fvg/2R: no level 116, setups 96, filled 25, expired 11:00 57, missed 14; breaker/dol: setups 212, filled 118, expired 11:00 67, DOL < 1R 20, missed 7; breaker/2R: setups 212, filled 132, expired 11:00 69, missed 11; shallower/dol: setups 212, filled 118, expired 11:00 67, DOL < 1R 20, missed 7; shallower/2R: setups 212, filled 132, expired 11:00 69, missed 11

