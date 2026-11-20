# Forex CRT

Forex screener PWA: Candle Range Theory (CRT) setups, ICT liquidity sweeps (1D → 1H, 4H → 15m, 2H → 5m), ICT Silver Bullet and the
Stoic range model (StoicTA: overnight range, SBS and PTB on 5m with the 20/200 SMA bias; `forex/stoic.js`, test `node forex/tests/stoic_test.js`).

- App: https://mailztoganesh-civil.github.io/forex-crt/ (served from `forex/`)
- Scan: `.github/workflows/forex_crt.yml` runs the tests, then `scripts/forex_crt.py`, which writes `forex/data/crt.json`
- Tests: `python -m unittest scripts/test_forex_crt.py` and `node forex/tests/run_tests.js`
- Backtests: `scripts/crt_backtest.py`, `scripts/sweep_backtest.py`, `scripts/ict_report.py` (results in `forex/backtest/`)
- Live prices come from the Cloudflare Worker forex-proxy (source kept in the ganesh-charts repo, `forex/worker`).

Moved from mailztoganesh-civil/ganesh-charts (`forex/`).

## WhatsApp alerts

`scripts/alerts.py` runs after every scan and sends one WhatsApp message (via CallMeBot) for each new
CRT formed (4H, D, W), each new sweep ENTRY_READY setup (grade B or better) and each new Stoic SBS / PTB order or fill. Sent alerts are kept in
`forex/data/alerts_sent.json` so nothing is sent twice.

Setup (either one, both free): add repo secret `WHATSAPP_LINK` = the full link Whatabot or CallMeBot sends you, or get a CallMeBot key (callmebot.com → WhatsApp), then add repo secrets `CALLMEBOT_PHONE`
(e.g. 971501234567) and `CALLMEBOT_APIKEY`. Test: Actions → Forex CRT scan → Run workflow → tick
"Only send a WhatsApp test message". Optional repo variables: `ALERT_TFS` (default `4H,D,W`),
`ALERT_SWEEPS` (default `D,4H,2H`), `ALERT_MIN_GRADE` (default `B`), `ALERT_STOIC` (default `SBS,PTB`).
