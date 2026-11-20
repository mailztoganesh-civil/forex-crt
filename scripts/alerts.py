"""WhatsApp alerts for the Forex CRT app (runs after scripts/forex_crt.py in the scan workflow).

Reads forex/data/crt.json and sends ONE WhatsApp message (via CallMeBot) listing what is new since
the last run:
  - CRT FORMED      a pair/timeframe in ALERT_TFS reached "formed" (C2 closed back inside C1)
  - SWEEP ENTRY     an ICT sweep setup (D->1H, 4H->15m, 2H->5m) reached ENTRY_READY (limit order known)

Already-sent alerts are kept in forex/data/alerts_sent.json, so each setup is sent once.
The first run (no alerts_sent.json yet) only records what is on screen and sends nothing.

Settings (GitHub repo -> Settings -> Secrets and variables -> Actions):
  secret   CALLMEBOT_PHONE    your WhatsApp number with country code, e.g. 971501234567
  secret   CALLMEBOT_APIKEY   the key CallMeBot sends you
  variable ALERT_TFS          CRT timeframes to alert on (default "4H,D,W")
  variable ALERT_SWEEPS       sweep screeners to alert on (default "D,4H,2H"; empty = off)
  variable ALERT_MIN_GRADE    lowest sweep grade to send: A, B or C (default "B")
Run with --test to send a test message.
"""
import json, os, sys, time, urllib.parse, urllib.request
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "..", "forex", "data")
CRT = os.path.join(DATA, "crt.json")
SENT = os.path.join(DATA, "alerts_sent.json")
APP = "https://mailztoganesh-civil.github.io/forex-crt/"
TZ = ZoneInfo("Asia/Dubai")
KEEP_SENT = 1500
MAX_CHARS = 1500          # CallMeBot messages are split into parts of this size
SWEEP_LTF = {"D": "1H", "4H": "15m", "2H": "5m"}


def env_list(name, default):
    v = os.environ.get(name)
    v = default if v is None else v
    return [x.strip() for x in v.split(",") if x.strip()]


def fmt(v, pip):
    if v is None:
        return "-"
    dg = 2 if pip >= 0.1 else 3 if pip >= 0.01 else 5
    return f"{v:.{dg}f}"


def events(crt, tfs, sweep_tfs, min_grade):
    """-> list of (key, text) for everything currently alert-worthy."""
    out = []
    grades = "ABC"[: "ABC".index(min_grade) + 1] if min_grade in "ABC" else "AB"
    for p in crt.get("pairs", []):
        sym, pip = p["sym"], p.get("pip", 0.0001)
        f = lambda v: fmt(v, pip)
        for tf in tfs:
            r = p.get("tf", {}).get(tf)
            if not r or r.get("status") != "formed":
                continue
            d = r.get("dir", 0)
            key = f"crt|{sym}|{tf}|{r.get('c2t')}|{d}"
            side = "Bullish" if d == 1 else "Bearish"
            text = (f"{'🟢' if d == 1 else '🔴'} {sym} {tf} CRT formed - {side}\n"
                    f"   C1 {f(r.get('c1l'))}-{f(r.get('c1h'))} | T1 {f(r.get('t1'))} | T2 {f(r.get('t2'))} | inval {f(r.get('inv'))}")
            if r.get("rr") is not None:
                text += f" | RR {r['rr']:.1f}"
            out.append((key, text))
        for k in sweep_tfs:
            for s in p.get("sweeps", {}).get(k, []) or []:
                if s.get("status") != "ENTRY_READY":
                    continue
                g = (s.get("q") or {}).get("grade", "C")
                if g not in grades:
                    continue
                sw = s.get("sweep") or {}
                o = s.get("order") or {}
                key = f"sweep|{sym}|{k}|{sw.get('t')}|{s.get('dir')}"
                rr = s.get("rr")
                text = (f"{'🔵' if s.get('dir') == 1 else '🟠'} {sym} {k}->{SWEEP_LTF.get(k, '')} sweep - "
                        f"{o.get('side', 'BUY' if s.get('dir') == 1 else 'SELL')} limit {f(s.get('entry'))}\n"
                        f"   SL {f(s.get('sl'))} | TP {f(s.get('tp'))}"
                        + (f" | RR {rr:.1f}" if rr is not None else "")
                        + f" | grade {g} | {(s.get('zone') or {}).get('type', '')}")
                out.append((key, text))
    return out


def send(text, phone, key):
    url = ("https://api.callmebot.com/whatsapp.php?" +
           urllib.parse.urlencode({"phone": phone, "text": text, "apikey": key}))
    with urllib.request.urlopen(url, timeout=30) as r:
        body = r.read().decode("utf-8", "replace")
    if r.status != 200 or "error" in body.lower() and "queued" not in body.lower():
        raise RuntimeError(f"CallMeBot HTTP {r.status}: {body[:200]}")


def send_all(text, phone, key):
    parts, cur = [], ""
    for block in text.split("\n\n"):
        if cur and len(cur) + len(block) + 2 > MAX_CHARS:
            parts.append(cur); cur = ""
        cur = (cur + "\n\n" + block) if cur else block
    if cur:
        parts.append(cur)
    for i, part in enumerate(parts):
        if i:
            time.sleep(3)          # CallMeBot rate limit
        send(part, phone, key)


def main(argv=sys.argv[1:], sender=send_all):
    phone = os.environ.get("CALLMEBOT_PHONE", "").strip().lstrip("+")
    apikey = os.environ.get("CALLMEBOT_APIKEY", "").strip()
    now = datetime.now(timezone.utc).astimezone(TZ).strftime("%d %b %H:%M")
    if "--test" in argv:
        if not (phone and apikey):
            print("CALLMEBOT_PHONE / CALLMEBOT_APIKEY secrets are not set"); return 1
        sender(f"✅ Forex CRT alerts are working ({now} Dubai)\n{APP}", phone, apikey)
        print("test message sent"); return 0

    if not os.path.exists(CRT):
        print("no crt.json"); return 0
    crt = json.load(open(CRT))
    evs = events(crt, env_list("ALERT_TFS", "4H,D,W"), env_list("ALERT_SWEEPS", "D,4H,2H"),
                 (os.environ.get("ALERT_MIN_GRADE") or "B").strip().upper())
    first = not os.path.exists(SENT)
    sent = [] if first else json.load(open(SENT)).get("keys", [])
    seen = set(sent)
    new = [(k, t) for k, t in evs if k not in seen]
    print(f"{len(evs)} alert-worthy, {len(new)} new")
    if not new:
        return 0
    if first:
        print("first run: recording current setups without sending")
    elif not (phone and apikey):
        print("WhatsApp not set up (CALLMEBOT_PHONE / CALLMEBOT_APIKEY); recording without sending")
    else:
        msg = f"📈 Forex CRT ({now} Dubai)\n\n" + "\n\n".join(t for _, t in new) + f"\n\n{APP}"
        print(msg)
        try:
            sender(msg, phone, apikey)
        except Exception as e:      # not recorded, so it is tried again next run
            print("send failed:", e); return 0
    sent = (sent + [k for k, _ in new])[-KEEP_SENT:]
    json.dump({"updated": crt.get("updated"), "keys": sent}, open(SENT, "w"), indent=0)
    return 0


if __name__ == "__main__":
    sys.exit(main())
