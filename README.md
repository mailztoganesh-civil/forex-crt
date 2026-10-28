# Forex CRT

Forex screener PWA: Candle Range Theory (CRT) setups and ICT liquidity sweeps (1D → 1H, 4H → 15m, 2H → 5m).

- App: https://mailztoganesh-civil.github.io/forex-crt/ (served from `forex/`)
- Scan: `.github/workflows/forex_crt.yml` runs the tests, then `scripts/forex_crt.py`, which writes `forex/data/crt.json`
- Tests: `python -m unittest scripts/test_forex_crt.py` and `node forex/tests/run_tests.js`
- Backtests: `scripts/crt_backtest.py`, `scripts/sweep_backtest.py`, `scripts/ict_report.py` (results in `forex/backtest/`)
- Live prices come from the Cloudflare Worker forex-proxy (source kept in the ganesh-charts repo, `forex/worker`).

Moved from mailztoganesh-civil/ganesh-charts (`forex/`).
