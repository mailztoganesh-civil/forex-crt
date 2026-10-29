# ICT Silver Bullet (10:00-11:00 NY) – backtest

Rules: top of `scripts/silver_bullet_backtest.py` (fixed in advance; each entry tested on its own). Raid window from 09:30 NY. Data: forex-data 5-minute bars; periods train 2020-2022, validation 2023-2024, test 2025-2026. Expectancy = average R per trade ± standard error (one setup per day per instrument).

## Nasdaq 100 (NSXUSD ≈ NQ)

| Costs | Entry | Target | Period | Trades | Expectancy R ± s.e. | Profit factor | Win rate |
|---|---|---|---|---|---|---|---|
| no costs | market | 2R | train | 204 | -0.146 ± 0.081 | 0.76 | 36% |
| no costs | market | 2R | validation | 117 | +0.050 ± 0.114 | 1.10 | 40% |
| no costs | market | 2R | test | 114 | -0.114 ± 0.110 | 0.81 | 33% |
| no costs | market | 2R | all | 435 | -0.085 ± 0.057 | 0.85 | 36% |
| no costs | market | dol | train | 113 | -0.118 ± 0.129 | 0.82 | 34% |
| no costs | market | dol | validation | 74 | +0.036 ± 0.167 | 1.06 | 36% |
| no costs | market | dol | test | 76 | -0.042 ± 0.181 | 0.93 | 33% |
| no costs | market | dol | all | 263 | -0.052 ± 0.089 | 0.92 | 34% |
| no costs | fvg | 2R | train | 20 | -0.197 ± 0.288 | 0.72 | 30% |
| no costs | fvg | 2R | validation | 9 | -0.516 ± 0.348 | 0.34 | 22% |
| no costs | fvg | 2R | test | 15 | -0.025 ± 0.347 | 0.96 | 40% |
| no costs | fvg | 2R | all | 44 | -0.204 ± 0.188 | 0.70 | 32% |
| no costs | fvg | dol | train | 23 | -0.196 ± 0.389 | 0.76 | 17% |
| no costs | fvg | dol | validation | 9 | +0.427 ± 0.830 | 1.64 | 33% |
| no costs | fvg | dol | test | 15 | -0.143 ± 0.380 | 0.79 | 33% |
| no costs | fvg | dol | all | 47 | -0.059 ± 0.271 | 0.92 | 26% |
| no costs | breaker | 2R | train | 136 | -0.257 ± 0.102 | 0.63 | 29% |
| no costs | breaker | 2R | validation | 66 | +0.393 ± 0.174 | 1.83 | 50% |
| no costs | breaker | 2R | test | 79 | -0.258 ± 0.130 | 0.61 | 28% |
| no costs | breaker | 2R | all | 281 | -0.104 ± 0.075 | 0.83 | 34% |
| no costs | breaker | dol | train | 106 | -0.159 ± 0.146 | 0.78 | 29% |
| no costs | breaker | dol | validation | 54 | +0.402 ± 0.241 | 1.75 | 44% |
| no costs | breaker | dol | test | 64 | -0.313 ± 0.192 | 0.58 | 20% |
| no costs | breaker | dol | all | 224 | -0.067 ± 0.107 | 0.90 | 30% |
| no costs | shallower | 2R | train | 136 | -0.257 ± 0.102 | 0.63 | 29% |
| no costs | shallower | 2R | validation | 66 | +0.393 ± 0.174 | 1.83 | 50% |
| no costs | shallower | 2R | test | 79 | -0.258 ± 0.130 | 0.61 | 28% |
| no costs | shallower | 2R | all | 281 | -0.104 ± 0.075 | 0.83 | 34% |
| no costs | shallower | dol | train | 106 | -0.159 ± 0.146 | 0.78 | 29% |
| no costs | shallower | dol | validation | 54 | +0.402 ± 0.241 | 1.75 | 44% |
| no costs | shallower | dol | test | 64 | -0.313 ± 0.192 | 0.58 | 20% |
| no costs | shallower | dol | all | 224 | -0.067 ± 0.107 | 0.90 | 30% |
| futures | market | 2R | train | 204 | -0.157 ± 0.081 | 0.74 | 35% |
| futures | market | 2R | validation | 117 | +0.038 ± 0.115 | 1.07 | 40% |
| futures | market | 2R | test | 114 | -0.121 ± 0.110 | 0.80 | 33% |
| futures | market | 2R | all | 435 | -0.095 ± 0.057 | 0.84 | 36% |
| futures | market | dol | train | 109 | -0.161 ± 0.131 | 0.76 | 31% |
| futures | market | dol | validation | 74 | +0.010 ± 0.164 | 1.02 | 36% |
| futures | market | dol | test | 75 | -0.074 ± 0.179 | 0.88 | 32% |
| futures | market | dol | all | 258 | -0.087 ± 0.089 | 0.86 | 33% |
| futures | fvg | 2R | train | 20 | -0.207 ± 0.289 | 0.71 | 30% |
| futures | fvg | 2R | validation | 9 | -0.527 ± 0.350 | 0.33 | 22% |
| futures | fvg | 2R | test | 15 | -0.031 ± 0.348 | 0.95 | 40% |
| futures | fvg | 2R | all | 44 | -0.212 ± 0.188 | 0.69 | 32% |
| futures | fvg | dol | train | 23 | -0.213 ± 0.390 | 0.75 | 17% |
| futures | fvg | dol | validation | 9 | +0.415 ± 0.832 | 1.61 | 33% |
| futures | fvg | dol | test | 15 | -0.150 ± 0.381 | 0.78 | 33% |
| futures | fvg | dol | all | 47 | -0.073 ± 0.272 | 0.90 | 26% |
| futures | breaker | 2R | train | 136 | -0.268 ± 0.102 | 0.62 | 29% |
| futures | breaker | 2R | validation | 66 | +0.369 ± 0.173 | 1.77 | 50% |
| futures | breaker | 2R | test | 79 | -0.265 ± 0.130 | 0.60 | 28% |
| futures | breaker | 2R | all | 281 | -0.117 ± 0.075 | 0.82 | 33% |
| futures | breaker | dol | train | 106 | -0.171 ± 0.147 | 0.76 | 28% |
| futures | breaker | dol | validation | 54 | +0.391 ± 0.241 | 1.72 | 44% |
| futures | breaker | dol | test | 64 | -0.320 ± 0.192 | 0.58 | 20% |
| futures | breaker | dol | all | 224 | -0.078 ± 0.107 | 0.89 | 30% |
| futures | shallower | 2R | train | 136 | -0.268 ± 0.102 | 0.62 | 29% |
| futures | shallower | 2R | validation | 66 | +0.369 ± 0.173 | 1.77 | 50% |
| futures | shallower | 2R | test | 79 | -0.265 ± 0.130 | 0.60 | 28% |
| futures | shallower | 2R | all | 281 | -0.117 ± 0.075 | 0.82 | 33% |
| futures | shallower | dol | train | 106 | -0.171 ± 0.147 | 0.76 | 28% |
| futures | shallower | dol | validation | 54 | +0.391 ± 0.241 | 1.72 | 44% |
| futures | shallower | dol | test | 64 | -0.320 ± 0.192 | 0.58 | 20% |
| futures | shallower | dol | all | 224 | -0.078 ± 0.107 | 0.89 | 30% |
| cfd | market | 2R | train | 204 | -0.174 ± 0.080 | 0.72 | 34% |
| cfd | market | 2R | validation | 117 | +0.031 ± 0.114 | 1.06 | 40% |
| cfd | market | 2R | test | 114 | -0.125 ± 0.110 | 0.79 | 33% |
| cfd | market | 2R | all | 435 | -0.106 ± 0.057 | 0.82 | 36% |
| cfd | market | dol | train | 109 | -0.173 ± 0.129 | 0.74 | 31% |
| cfd | market | dol | validation | 74 | -0.008 ± 0.161 | 0.99 | 36% |
| cfd | market | dol | test | 75 | -0.134 ± 0.171 | 0.79 | 31% |
| cfd | market | dol | all | 258 | -0.114 ± 0.087 | 0.82 | 33% |
| cfd | fvg | 2R | train | 19 | -0.324 ± 0.278 | 0.57 | 26% |
| cfd | fvg | 2R | validation | 9 | -0.528 ± 0.349 | 0.33 | 22% |
| cfd | fvg | 2R | test | 15 | -0.031 ± 0.348 | 0.95 | 40% |
| cfd | fvg | 2R | all | 43 | -0.265 ± 0.185 | 0.62 | 30% |
| cfd | fvg | dol | train | 22 | -0.346 ± 0.384 | 0.61 | 14% |
| cfd | fvg | dol | validation | 9 | +0.415 ± 0.832 | 1.61 | 33% |
| cfd | fvg | dol | test | 15 | -0.151 ± 0.381 | 0.78 | 33% |
| cfd | fvg | dol | all | 46 | -0.134 ± 0.271 | 0.83 | 24% |
| cfd | breaker | 2R | train | 134 | -0.291 ± 0.102 | 0.59 | 28% |
| cfd | breaker | 2R | validation | 65 | +0.342 ± 0.174 | 1.70 | 49% |
| cfd | breaker | 2R | test | 78 | -0.295 ± 0.128 | 0.56 | 27% |
| cfd | breaker | 2R | all | 277 | -0.144 ± 0.075 | 0.78 | 32% |
| cfd | breaker | dol | train | 105 | -0.186 ± 0.147 | 0.74 | 28% |
| cfd | breaker | dol | validation | 53 | +0.297 ± 0.228 | 1.53 | 43% |
| cfd | breaker | dol | test | 63 | -0.346 ± 0.194 | 0.55 | 19% |
| cfd | breaker | dol | all | 221 | -0.116 ± 0.105 | 0.83 | 29% |
| cfd | shallower | 2R | train | 134 | -0.291 ± 0.102 | 0.59 | 28% |
| cfd | shallower | 2R | validation | 65 | +0.342 ± 0.174 | 1.70 | 49% |
| cfd | shallower | 2R | test | 78 | -0.295 ± 0.128 | 0.56 | 27% |
| cfd | shallower | 2R | all | 277 | -0.144 ± 0.075 | 0.78 | 32% |
| cfd | shallower | dol | train | 105 | -0.186 ± 0.147 | 0.74 | 28% |
| cfd | shallower | dol | validation | 53 | +0.297 ± 0.228 | 1.53 | 43% |
| cfd | shallower | dol | test | 63 | -0.346 ± 0.194 | 0.55 | 19% |
| cfd | shallower | dol | all | 221 | -0.116 ± 0.105 | 0.83 | 29% |

Funnel (NSXUSD, first cost level): market/dol: setups 435, DOL < 1R 172, filled 263, no level 1; market/2R: setups 435, filled 435, no level 1; fvg/dol: setups 161, expired 11:00 77, filled 47, no level 275, missed 16, DOL < 1R 21; fvg/2R: setups 161, expired 11:00 77, filled 44, no level 275, missed 37, fill+target one bar 3; breaker/dol: setups 436, DOL < 1R 98, filled 224, expired 11:00 96, missed 18; breaker/2R: setups 436, expired 11:00 116, filled 281, missed 37, fill+target one bar 2; shallower/dol: setups 436, DOL < 1R 98, filled 224, expired 11:00 96, missed 18; shallower/2R: setups 436, expired 11:00 116, filled 281, missed 37, fill+target one bar 2

## S&P 500 (SPXUSD ≈ ES)

| Costs | Entry | Target | Period | Trades | Expectancy R ± s.e. | Profit factor | Win rate |
|---|---|---|---|---|---|---|---|
| no costs | market | 2R | train | 169 | +0.013 ± 0.100 | 1.02 | 38% |
| no costs | market | 2R | validation | 122 | -0.042 ± 0.117 | 0.93 | 34% |
| no costs | market | 2R | test | 96 | +0.090 ± 0.132 | 1.17 | 44% |
| no costs | market | 2R | all | 387 | +0.015 ± 0.066 | 1.03 | 38% |
| no costs | market | dol | train | 120 | +0.124 ± 0.143 | 1.21 | 38% |
| no costs | market | dol | validation | 80 | -0.106 ± 0.162 | 0.84 | 31% |
| no costs | market | dol | test | 64 | -0.033 ± 0.174 | 0.95 | 34% |
| no costs | market | dol | all | 264 | +0.016 ± 0.091 | 1.03 | 35% |
| no costs | fvg | 2R | train | 18 | +0.044 ± 0.338 | 1.07 | 33% |
| no costs | fvg | 2R | validation | 13 | -0.308 ± 0.365 | 0.60 | 23% |
| no costs | fvg | 2R | test | 15 | +0.044 ± 0.356 | 1.07 | 40% |
| no costs | fvg | 2R | all | 46 | -0.055 ± 0.201 | 0.92 | 33% |
| no costs | fvg | dol | train | 20 | -0.275 ± 0.387 | 0.66 | 15% |
| no costs | fvg | dol | validation | 14 | -0.453 ± 0.400 | 0.47 | 14% |
| no costs | fvg | dol | test | 13 | +0.161 ± 0.432 | 1.26 | 38% |
| no costs | fvg | dol | all | 47 | -0.207 ± 0.234 | 0.73 | 21% |
| no costs | breaker | 2R | train | 104 | -0.074 ± 0.128 | 0.88 | 33% |
| no costs | breaker | 2R | validation | 76 | -0.058 ± 0.153 | 0.91 | 34% |
| no costs | breaker | 2R | test | 67 | +0.136 ± 0.166 | 1.25 | 43% |
| no costs | breaker | 2R | all | 247 | -0.012 ± 0.085 | 0.98 | 36% |
| no costs | breaker | dol | train | 94 | +0.079 ± 0.185 | 1.12 | 31% |
| no costs | breaker | dol | validation | 65 | -0.013 ± 0.223 | 0.98 | 28% |
| no costs | breaker | dol | test | 54 | +0.035 ± 0.203 | 1.06 | 37% |
| no costs | breaker | dol | all | 213 | +0.040 ± 0.117 | 1.06 | 31% |
| no costs | shallower | 2R | train | 104 | -0.074 ± 0.128 | 0.88 | 33% |
| no costs | shallower | 2R | validation | 76 | -0.058 ± 0.153 | 0.91 | 34% |
| no costs | shallower | 2R | test | 67 | +0.136 ± 0.166 | 1.25 | 43% |
| no costs | shallower | 2R | all | 247 | -0.012 ± 0.085 | 0.98 | 36% |
| no costs | shallower | dol | train | 94 | +0.079 ± 0.185 | 1.12 | 31% |
| no costs | shallower | dol | validation | 65 | -0.013 ± 0.223 | 0.98 | 28% |
| no costs | shallower | dol | test | 54 | +0.035 ± 0.203 | 1.06 | 37% |
| no costs | shallower | dol | all | 213 | +0.040 ± 0.117 | 1.06 | 31% |
| futures | market | 2R | train | 169 | -0.031 ± 0.099 | 0.95 | 37% |
| futures | market | 2R | validation | 122 | -0.153 ± 0.113 | 0.77 | 30% |
| futures | market | 2R | test | 96 | +0.033 ± 0.130 | 1.06 | 43% |
| futures | market | 2R | all | 387 | -0.054 ± 0.065 | 0.91 | 36% |
| futures | market | dol | train | 113 | +0.094 ± 0.144 | 1.15 | 40% |
| futures | market | dol | validation | 77 | -0.200 ± 0.153 | 0.71 | 30% |
| futures | market | dol | test | 63 | -0.060 ± 0.171 | 0.90 | 35% |
| futures | market | dol | all | 253 | -0.034 ± 0.090 | 0.95 | 36% |
| futures | fvg | 2R | train | 18 | -0.155 ± 0.327 | 0.78 | 28% |
| futures | fvg | 2R | validation | 13 | -0.335 ± 0.369 | 0.58 | 23% |
| futures | fvg | 2R | test | 15 | +0.025 ± 0.359 | 1.04 | 40% |
| futures | fvg | 2R | all | 46 | -0.147 ± 0.199 | 0.79 | 30% |
| futures | fvg | dol | train | 21 | -0.355 ± 0.372 | 0.59 | 14% |
| futures | fvg | dol | validation | 14 | -0.493 ± 0.405 | 0.45 | 14% |
| futures | fvg | dol | test | 13 | +0.143 ± 0.435 | 1.23 | 38% |
| futures | fvg | dol | all | 48 | -0.261 ± 0.231 | 0.68 | 21% |
| futures | breaker | 2R | train | 103 | -0.090 ± 0.131 | 0.86 | 33% |
| futures | breaker | 2R | validation | 74 | -0.139 ± 0.154 | 0.80 | 32% |
| futures | breaker | 2R | test | 66 | +0.092 ± 0.167 | 1.16 | 42% |
| futures | breaker | 2R | all | 243 | -0.055 ± 0.085 | 0.91 | 35% |
| futures | breaker | dol | train | 94 | +0.047 ± 0.185 | 1.07 | 31% |
| futures | breaker | dol | validation | 62 | -0.211 ± 0.207 | 0.73 | 24% |
| futures | breaker | dol | test | 53 | -0.067 ± 0.190 | 0.90 | 36% |
| futures | breaker | dol | all | 209 | -0.058 ± 0.114 | 0.92 | 30% |
| futures | shallower | 2R | train | 103 | -0.090 ± 0.131 | 0.86 | 33% |
| futures | shallower | 2R | validation | 74 | -0.139 ± 0.154 | 0.80 | 32% |
| futures | shallower | 2R | test | 66 | +0.092 ± 0.167 | 1.16 | 42% |
| futures | shallower | 2R | all | 243 | -0.055 ± 0.085 | 0.91 | 35% |
| futures | shallower | dol | train | 94 | +0.047 ± 0.185 | 1.07 | 31% |
| futures | shallower | dol | validation | 62 | -0.211 ± 0.207 | 0.73 | 24% |
| futures | shallower | dol | test | 53 | -0.067 ± 0.190 | 0.90 | 36% |
| futures | shallower | dol | all | 209 | -0.058 ± 0.114 | 0.92 | 30% |
| cfd | market | 2R | train | 169 | -0.034 ± 0.099 | 0.94 | 37% |
| cfd | market | 2R | validation | 122 | -0.182 ± 0.112 | 0.73 | 30% |
| cfd | market | 2R | test | 96 | +0.030 ± 0.130 | 1.05 | 43% |
| cfd | market | 2R | all | 387 | -0.065 ± 0.065 | 0.89 | 36% |
| cfd | market | dol | train | 112 | +0.088 ± 0.143 | 1.15 | 40% |
| cfd | market | dol | validation | 76 | -0.216 ± 0.151 | 0.69 | 30% |
| cfd | market | dol | test | 63 | -0.070 ± 0.170 | 0.89 | 35% |
| cfd | market | dol | all | 251 | -0.043 ± 0.089 | 0.93 | 36% |
| cfd | fvg | 2R | train | 18 | -0.159 ± 0.328 | 0.78 | 28% |
| cfd | fvg | 2R | validation | 11 | -0.209 ± 0.428 | 0.72 | 27% |
| cfd | fvg | 2R | test | 15 | +0.025 ± 0.359 | 1.04 | 40% |
| cfd | fvg | 2R | all | 44 | -0.109 ± 0.206 | 0.84 | 32% |
| cfd | fvg | dol | train | 20 | -0.322 ± 0.389 | 0.62 | 15% |
| cfd | fvg | dol | validation | 12 | -0.405 ± 0.470 | 0.54 | 17% |
| cfd | fvg | dol | test | 13 | +0.142 ± 0.435 | 1.22 | 38% |
| cfd | fvg | dol | all | 45 | -0.210 ± 0.245 | 0.74 | 22% |
| cfd | breaker | 2R | train | 99 | -0.100 ± 0.134 | 0.85 | 33% |
| cfd | breaker | 2R | validation | 74 | -0.140 ± 0.154 | 0.80 | 32% |
| cfd | breaker | 2R | test | 64 | +0.032 ± 0.167 | 1.05 | 41% |
| cfd | breaker | 2R | all | 237 | -0.077 ± 0.086 | 0.88 | 35% |
| cfd | breaker | dol | train | 92 | +0.008 ± 0.182 | 1.01 | 30% |
| cfd | breaker | dol | validation | 62 | -0.212 ± 0.207 | 0.73 | 24% |
| cfd | breaker | dol | test | 51 | -0.161 ± 0.185 | 0.76 | 33% |
| cfd | breaker | dol | all | 205 | -0.101 ± 0.112 | 0.86 | 29% |
| cfd | shallower | 2R | train | 99 | -0.100 ± 0.134 | 0.85 | 33% |
| cfd | shallower | 2R | validation | 74 | -0.140 ± 0.154 | 0.80 | 32% |
| cfd | shallower | 2R | test | 64 | +0.032 ± 0.167 | 1.05 | 41% |
| cfd | shallower | 2R | all | 237 | -0.077 ± 0.086 | 0.88 | 35% |
| cfd | shallower | dol | train | 92 | +0.008 ± 0.182 | 1.01 | 30% |
| cfd | shallower | dol | validation | 62 | -0.212 ± 0.207 | 0.73 | 24% |
| cfd | shallower | dol | test | 51 | -0.161 ± 0.185 | 0.76 | 33% |
| cfd | shallower | dol | all | 205 | -0.101 ± 0.112 | 0.86 | 29% |

Funnel (SPXUSD, first cost level): market/dol: setups 387, filled 264, DOL < 1R 123; market/2R: setups 387, filled 387; fvg/dol: no level 243, setups 144, expired 11:00 75, filled 47, missed 11, DOL < 1R 11; fvg/2R: no level 243, setups 144, expired 11:00 66, filled 46, missed 32; breaker/dol: setups 387, expired 11:00 97, filled 213, DOL < 1R 64, missed 12, fill+target one bar 1; breaker/2R: setups 387, expired 11:00 100, filled 247, missed 37, fill+target one bar 3; shallower/dol: setups 387, expired 11:00 97, filled 213, DOL < 1R 64, missed 12, fill+target one bar 1; shallower/2R: setups 387, expired 11:00 100, filled 247, missed 37, fill+target one bar 3

## EURUSD

| Costs | Entry | Target | Period | Trades | Expectancy R ± s.e. | Profit factor | Win rate |
|---|---|---|---|---|---|---|---|
| no costs | market | 2R | train | – |
| no costs | market | 2R | validation | 69 | +0.072 ± 0.148 | 1.14 | 41% |
| no costs | market | 2R | test | 61 | -0.156 ± 0.142 | 0.73 | 34% |
| no costs | market | 2R | all | 130 | -0.035 ± 0.103 | 0.94 | 38% |
| no costs | market | dol | train | – |
| no costs | market | dol | validation | 62 | +0.078 ± 0.174 | 1.15 | 40% |
| no costs | market | dol | test | 55 | -0.108 ± 0.189 | 0.82 | 33% |
| no costs | market | dol | all | 117 | -0.009 ± 0.128 | 0.98 | 37% |
| no costs | fvg | 2R | train | – |
| no costs | fvg | 2R | validation | 12 | +0.509 ± 0.398 | 2.49 | 58% |
| no costs | fvg | 2R | test | 9 | +0.124 ± 0.437 | 1.26 | 33% |
| no costs | fvg | 2R | all | 21 | +0.344 ± 0.290 | 1.87 | 48% |
| no costs | fvg | dol | train | – |
| no costs | fvg | dol | validation | 12 | +0.919 ± 0.627 | 3.68 | 58% |
| no costs | fvg | dol | test | 10 | +1.075 ± 1.226 | 3.05 | 30% |
| no costs | fvg | dol | all | 22 | +0.990 ± 0.637 | 3.33 | 45% |
| no costs | breaker | 2R | train | – |
| no costs | breaker | 2R | validation | 46 | +0.099 ± 0.196 | 1.18 | 39% |
| no costs | breaker | 2R | test | 39 | -0.166 ± 0.201 | 0.75 | 28% |
| no costs | breaker | 2R | all | 85 | -0.023 ± 0.141 | 0.96 | 34% |
| no costs | breaker | dol | train | – |
| no costs | breaker | dol | validation | 45 | +0.013 ± 0.232 | 1.02 | 36% |
| no costs | breaker | dol | test | 38 | -0.182 ± 0.248 | 0.73 | 24% |
| no costs | breaker | dol | all | 83 | -0.076 ± 0.169 | 0.88 | 30% |
| no costs | shallower | 2R | train | – |
| no costs | shallower | 2R | validation | 46 | +0.099 ± 0.196 | 1.18 | 39% |
| no costs | shallower | 2R | test | 39 | -0.166 ± 0.201 | 0.75 | 28% |
| no costs | shallower | 2R | all | 85 | -0.023 ± 0.141 | 0.96 | 34% |
| no costs | shallower | dol | train | – |
| no costs | shallower | dol | validation | 45 | +0.013 ± 0.232 | 1.02 | 36% |
| no costs | shallower | dol | test | 38 | -0.182 ± 0.248 | 0.73 | 24% |
| no costs | shallower | dol | all | 83 | -0.076 ± 0.169 | 0.88 | 30% |
| retail | market | 2R | train | – |
| retail | market | 2R | validation | 69 | -0.067 ± 0.142 | 0.88 | 36% |
| retail | market | 2R | test | 61 | -0.229 ± 0.142 | 0.63 | 31% |
| retail | market | 2R | all | 130 | -0.143 ± 0.100 | 0.75 | 34% |
| retail | market | dol | train | – |
| retail | market | dol | validation | 62 | -0.063 ± 0.165 | 0.89 | 35% |
| retail | market | dol | test | 55 | -0.215 ± 0.178 | 0.68 | 31% |
| retail | market | dol | all | 117 | -0.134 ± 0.121 | 0.78 | 33% |
| retail | fvg | 2R | train | – |
| retail | fvg | 2R | validation | 11 | -0.006 ± 0.409 | 0.99 | 45% |
| retail | fvg | 2R | test | 9 | +0.099 ± 0.439 | 1.20 | 33% |
| retail | fvg | 2R | all | 20 | +0.041 ± 0.292 | 1.08 | 40% |
| retail | fvg | dol | train | – |
| retail | fvg | dol | validation | 11 | -0.078 ± 0.378 | 0.86 | 45% |
| retail | fvg | dol | test | 10 | +1.049 ± 1.229 | 2.92 | 30% |
| retail | fvg | dol | all | 21 | +0.459 ± 0.614 | 1.83 | 38% |
| retail | breaker | 2R | train | – |
| retail | breaker | 2R | validation | 45 | -0.066 ± 0.196 | 0.90 | 33% |
| retail | breaker | 2R | test | 36 | -0.248 ± 0.207 | 0.65 | 25% |
| retail | breaker | 2R | all | 81 | -0.147 ± 0.142 | 0.78 | 30% |
| retail | breaker | dol | train | – |
| retail | breaker | dol | validation | 44 | -0.146 ± 0.234 | 0.79 | 30% |
| retail | breaker | dol | test | 35 | -0.250 ± 0.264 | 0.66 | 20% |
| retail | breaker | dol | all | 79 | -0.192 ± 0.174 | 0.73 | 25% |
| retail | shallower | 2R | train | – |
| retail | shallower | 2R | validation | 45 | -0.066 ± 0.196 | 0.90 | 33% |
| retail | shallower | 2R | test | 36 | -0.248 ± 0.207 | 0.65 | 25% |
| retail | shallower | 2R | all | 81 | -0.147 ± 0.142 | 0.78 | 30% |
| retail | shallower | dol | train | – |
| retail | shallower | dol | validation | 44 | -0.146 ± 0.234 | 0.79 | 30% |
| retail | shallower | dol | test | 35 | -0.250 ± 0.264 | 0.66 | 20% |
| retail | shallower | dol | all | 79 | -0.192 ± 0.174 | 0.73 | 25% |

Funnel (EURUSD, first cost level): market/dol: setups 130, DOL < 1R 13, filled 117; market/2R: setups 130, filled 130; fvg/dol: setups 65, expired 11:00 42, no level 65, filled 22, missed 1; fvg/2R: setups 65, expired 11:00 30, no level 65, missed 14, filled 21; breaker/dol: setups 130, DOL < 1R 5, expired 11:00 39, filled 83, missed 3; breaker/2R: setups 130, expired 11:00 38, filled 85, missed 7; shallower/dol: setups 130, DOL < 1R 5, expired 11:00 39, filled 83, missed 3; shallower/2R: setups 130, expired 11:00 38, filled 85, missed 7

## GBPUSD

| Costs | Entry | Target | Period | Trades | Expectancy R ± s.e. | Profit factor | Win rate |
|---|---|---|---|---|---|---|---|
| no costs | market | 2R | train | – |
| no costs | market | 2R | validation | 67 | +0.257 ± 0.152 | 1.59 | 52% |
| no costs | market | 2R | test | 68 | -0.005 ± 0.145 | 0.99 | 38% |
| no costs | market | 2R | all | 135 | +0.125 ± 0.105 | 1.26 | 45% |
| no costs | market | dol | train | – |
| no costs | market | dol | validation | 59 | +0.233 ± 0.184 | 1.47 | 49% |
| no costs | market | dol | test | 60 | +0.029 ± 0.156 | 1.06 | 43% |
| no costs | market | dol | all | 119 | +0.130 ± 0.120 | 1.26 | 46% |
| no costs | fvg | 2R | train | – |
| no costs | fvg | 2R | validation | 9 | +0.333 ± 0.527 | 1.60 | 44% |
| no costs | fvg | 2R | test | 10 | -0.299 ± 0.396 | 0.57 | 30% |
| no costs | fvg | 2R | all | 19 | +0.001 ± 0.324 | 1.00 | 37% |
| no costs | fvg | dol | train | – |
| no costs | fvg | dol | validation | 10 | +1.578 ± 1.170 | 4.16 | 50% |
| no costs | fvg | dol | test | 10 | -0.065 ± 0.566 | 0.91 | 30% |
| no costs | fvg | dol | all | 20 | +0.757 ± 0.660 | 2.26 | 40% |
| no costs | breaker | 2R | train | – |
| no costs | breaker | 2R | validation | 45 | +0.331 ± 0.201 | 1.71 | 51% |
| no costs | breaker | 2R | test | 45 | +0.004 ± 0.192 | 1.01 | 36% |
| no costs | breaker | 2R | all | 90 | +0.167 ± 0.140 | 1.32 | 43% |
| no costs | breaker | dol | train | – |
| no costs | breaker | dol | validation | 43 | +0.274 ± 0.227 | 1.54 | 49% |
| no costs | breaker | dol | test | 42 | -0.103 ± 0.204 | 0.83 | 33% |
| no costs | breaker | dol | all | 85 | +0.088 ± 0.153 | 1.16 | 41% |
| no costs | shallower | 2R | train | – |
| no costs | shallower | 2R | validation | 45 | +0.331 ± 0.201 | 1.71 | 51% |
| no costs | shallower | 2R | test | 45 | +0.004 ± 0.192 | 1.01 | 36% |
| no costs | shallower | 2R | all | 90 | +0.167 ± 0.140 | 1.32 | 43% |
| no costs | shallower | dol | train | – |
| no costs | shallower | dol | validation | 43 | +0.274 ± 0.227 | 1.54 | 49% |
| no costs | shallower | dol | test | 42 | -0.103 ± 0.204 | 0.83 | 33% |
| no costs | shallower | dol | all | 85 | +0.088 ± 0.153 | 1.16 | 41% |
| retail | market | 2R | train | – |
| retail | market | 2R | validation | 67 | +0.142 ± 0.149 | 1.30 | 48% |
| retail | market | 2R | test | 68 | -0.137 ± 0.139 | 0.77 | 37% |
| retail | market | 2R | all | 135 | +0.001 ± 0.102 | 1.00 | 42% |
| retail | market | dol | train | – |
| retail | market | dol | validation | 59 | +0.124 ± 0.173 | 1.24 | 47% |
| retail | market | dol | test | 60 | -0.149 ± 0.140 | 0.74 | 40% |
| retail | market | dol | all | 119 | -0.014 ± 0.111 | 0.97 | 44% |
| retail | fvg | 2R | train | – |
| retail | fvg | 2R | validation | 7 | +0.272 ± 0.611 | 1.47 | 43% |
| retail | fvg | 2R | test | 8 | -0.157 ± 0.487 | 0.76 | 25% |
| retail | fvg | 2R | all | 15 | +0.043 ± 0.376 | 1.07 | 33% |
| retail | fvg | dol | train | – |
| retail | fvg | dol | validation | 8 | +1.946 ± 1.411 | 4.80 | 50% |
| retail | fvg | dol | test | 8 | +0.099 ± 0.669 | 1.15 | 25% |
| retail | fvg | dol | all | 16 | +1.022 ± 0.791 | 2.75 | 38% |
| retail | breaker | 2R | train | – |
| retail | breaker | 2R | validation | 40 | +0.323 ± 0.218 | 1.66 | 50% |
| retail | breaker | 2R | test | 44 | -0.163 ± 0.188 | 0.75 | 30% |
| retail | breaker | 2R | all | 84 | +0.068 ± 0.145 | 1.12 | 39% |
| retail | breaker | dol | train | – |
| retail | breaker | dol | validation | 38 | +0.237 ± 0.245 | 1.44 | 47% |
| retail | breaker | dol | test | 42 | -0.268 ± 0.188 | 0.61 | 29% |
| retail | breaker | dol | all | 80 | -0.028 ± 0.154 | 0.95 | 38% |
| retail | shallower | 2R | train | – |
| retail | shallower | 2R | validation | 40 | +0.323 ± 0.218 | 1.66 | 50% |
| retail | shallower | 2R | test | 44 | -0.163 ± 0.188 | 0.75 | 30% |
| retail | shallower | 2R | all | 84 | +0.068 ± 0.145 | 1.12 | 39% |
| retail | shallower | dol | train | – |
| retail | shallower | dol | validation | 38 | +0.237 ± 0.245 | 1.44 | 47% |
| retail | shallower | dol | test | 42 | -0.268 ± 0.188 | 0.61 | 29% |
| retail | shallower | dol | all | 80 | -0.028 ± 0.154 | 0.95 | 38% |

Funnel (GBPUSD, first cost level): market/dol: setups 135, filled 119, DOL < 1R 16; market/2R: setups 135, filled 135; fvg/dol: no level 74, setups 61, expired 11:00 40, filled 20, missed 1; fvg/2R: no level 74, setups 61, expired 11:00 36, filled 19, missed 6; breaker/dol: setups 135, filled 85, expired 11:00 44, DOL < 1R 6; breaker/2R: setups 135, filled 90, expired 11:00 41, missed 4; shallower/dol: setups 135, filled 85, expired 11:00 44, DOL < 1R 6; shallower/2R: setups 135, filled 90, expired 11:00 41, missed 4

## XAUUSD

| Costs | Entry | Target | Period | Trades | Expectancy R ± s.e. | Profit factor | Win rate |
|---|---|---|---|---|---|---|---|
| no costs | market | 2R | train | 106 | +0.086 ± 0.115 | 1.19 | 43% |
| no costs | market | 2R | validation | 66 | +0.241 ± 0.159 | 1.51 | 47% |
| no costs | market | 2R | test | 77 | -0.033 ± 0.126 | 0.93 | 45% |
| no costs | market | 2R | all | 249 | +0.090 ± 0.075 | 1.19 | 45% |
| no costs | market | dol | train | 88 | +0.187 ± 0.177 | 1.38 | 41% |
| no costs | market | dol | validation | 48 | +0.275 ± 0.211 | 1.57 | 48% |
| no costs | market | dol | test | 63 | +0.002 ± 0.144 | 1.00 | 46% |
| no costs | market | dol | all | 199 | +0.149 ± 0.104 | 1.30 | 44% |
| no costs | fvg | 2R | train | 15 | -0.279 ± 0.286 | 0.57 | 33% |
| no costs | fvg | 2R | validation | 8 | -0.250 ± 0.491 | 0.67 | 25% |
| no costs | fvg | 2R | test | 11 | +0.519 ± 0.396 | 2.43 | 64% |
| no costs | fvg | 2R | all | 34 | -0.014 ± 0.217 | 0.98 | 41% |
| no costs | fvg | dol | train | 15 | -0.257 ± 0.392 | 0.65 | 27% |
| no costs | fvg | dol | validation | 8 | +0.072 ± 0.713 | 1.10 | 25% |
| no costs | fvg | dol | test | 11 | +0.915 ± 0.603 | 3.52 | 64% |
| no costs | fvg | dol | all | 34 | +0.200 ± 0.312 | 1.32 | 38% |
| no costs | breaker | 2R | train | 76 | +0.057 ± 0.138 | 1.12 | 42% |
| no costs | breaker | 2R | validation | 42 | +0.258 ± 0.207 | 1.54 | 45% |
| no costs | breaker | 2R | test | 48 | +0.140 ± 0.180 | 1.29 | 48% |
| no costs | breaker | 2R | all | 166 | +0.132 ± 0.097 | 1.27 | 45% |
| no costs | breaker | dol | train | 69 | +0.113 ± 0.224 | 1.20 | 35% |
| no costs | breaker | dol | validation | 36 | +0.212 ± 0.228 | 1.43 | 44% |
| no costs | breaker | dol | test | 45 | +0.320 ± 0.222 | 1.69 | 51% |
| no costs | breaker | dol | all | 150 | +0.199 ± 0.134 | 1.39 | 42% |
| no costs | shallower | 2R | train | 76 | +0.057 ± 0.138 | 1.12 | 42% |
| no costs | shallower | 2R | validation | 42 | +0.258 ± 0.207 | 1.54 | 45% |
| no costs | shallower | 2R | test | 48 | +0.140 ± 0.180 | 1.29 | 48% |
| no costs | shallower | 2R | all | 166 | +0.132 ± 0.097 | 1.27 | 45% |
| no costs | shallower | dol | train | 69 | +0.113 ± 0.224 | 1.20 | 35% |
| no costs | shallower | dol | validation | 36 | +0.212 ± 0.228 | 1.43 | 44% |
| no costs | shallower | dol | test | 45 | +0.320 ± 0.222 | 1.69 | 51% |
| no costs | shallower | dol | all | 150 | +0.199 ± 0.134 | 1.39 | 42% |
| retail | market | 2R | train | 106 | +0.010 ± 0.110 | 1.02 | 42% |
| retail | market | 2R | validation | 66 | +0.195 ± 0.157 | 1.40 | 47% |
| retail | market | 2R | test | 77 | -0.057 ± 0.126 | 0.89 | 45% |
| retail | market | 2R | all | 249 | +0.038 ± 0.074 | 1.08 | 44% |
| retail | market | dol | train | 87 | +0.086 ± 0.164 | 1.17 | 39% |
| retail | market | dol | validation | 46 | +0.225 ± 0.205 | 1.46 | 50% |
| retail | market | dol | test | 61 | +0.008 ± 0.145 | 1.02 | 48% |
| retail | market | dol | all | 194 | +0.094 ± 0.099 | 1.19 | 44% |
| retail | fvg | 2R | train | 13 | -0.310 ± 0.322 | 0.55 | 31% |
| retail | fvg | 2R | validation | 7 | -0.159 ± 0.557 | 0.78 | 29% |
| retail | fvg | 2R | test | 9 | +0.576 ± 0.444 | 2.71 | 67% |
| retail | fvg | 2R | all | 29 | +0.001 ± 0.243 | 1.00 | 41% |
| retail | fvg | dol | train | 14 | -0.238 ± 0.418 | 0.68 | 29% |
| retail | fvg | dol | validation | 7 | +0.200 ± 0.800 | 1.27 | 29% |
| retail | fvg | dol | test | 9 | +1.056 ± 0.706 | 4.13 | 67% |
| retail | fvg | dol | all | 30 | +0.253 ± 0.345 | 1.41 | 40% |
| retail | breaker | 2R | train | 71 | -0.105 ± 0.134 | 0.80 | 38% |
| retail | breaker | 2R | validation | 40 | +0.206 ± 0.214 | 1.40 | 45% |
| retail | breaker | 2R | test | 46 | +0.039 ± 0.179 | 1.07 | 46% |
| retail | breaker | 2R | all | 157 | +0.016 ± 0.097 | 1.03 | 42% |
| retail | breaker | dol | train | 64 | -0.067 ± 0.229 | 0.89 | 30% |
| retail | breaker | dol | validation | 34 | +0.170 ± 0.240 | 1.32 | 44% |
| retail | breaker | dol | test | 43 | +0.229 ± 0.224 | 1.47 | 49% |
| retail | breaker | dol | all | 141 | +0.080 ± 0.137 | 1.14 | 39% |
| retail | shallower | 2R | train | 71 | -0.105 ± 0.134 | 0.80 | 38% |
| retail | shallower | 2R | validation | 40 | +0.206 ± 0.214 | 1.40 | 45% |
| retail | shallower | 2R | test | 46 | +0.039 ± 0.179 | 1.07 | 46% |
| retail | shallower | 2R | all | 157 | +0.016 ± 0.097 | 1.03 | 42% |
| retail | shallower | dol | train | 64 | -0.067 ± 0.229 | 0.89 | 30% |
| retail | shallower | dol | validation | 34 | +0.170 ± 0.240 | 1.32 | 44% |
| retail | shallower | dol | test | 43 | +0.229 ± 0.224 | 1.47 | 49% |
| retail | shallower | dol | all | 141 | +0.080 ± 0.137 | 1.14 | 39% |

Funnel (XAUUSD, first cost level): market/dol: setups 249, filled 199, DOL < 1R 50; market/2R: setups 249, filled 249; fvg/dol: setups 111, expired 11:00 69, no level 138, filled 34, DOL < 1R 5, missed 3; fvg/2R: setups 111, missed 16, no level 138, filled 34, expired 11:00 61; breaker/dol: setups 249, filled 150, expired 11:00 68, DOL < 1R 24, missed 7; breaker/2R: setups 249, filled 166, expired 11:00 68, missed 15; shallower/dol: setups 249, filled 150, expired 11:00 68, DOL < 1R 24, missed 7; shallower/2R: setups 249, filled 166, expired 11:00 68, missed 15

