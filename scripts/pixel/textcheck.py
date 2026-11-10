"""Check that a page shows the exact Arabic / English copy of its Figma frame.

Usage (repo root, Git Bash — routes WITHOUT a leading "/" or "#/"):
  python scripts/pixel/textcheck.py --frame 2013:5689 --route "" --lang ar
  python scripts/pixel/textcheck.py --frame 5233:29613 --route "" --lang en
  python scripts/pixel/textcheck.py --pair 2013:5689 --route ""      # checks AR frame in ar AND its EN twin in en

The Figma strings come from scripts/pixel/figma-text.json (every text layer of every
Arabic frame and its English twin under "English Version", plus the AR→EN pairing).
The page is rendered in headless Chrome with ?static&lang=<lang> and its DOM text is
searched for each Figma string (whitespace-normalised).

Output: MISSING strings (not on the page at all), DIGITS-ONLY differences (same text but
Arabic-Indic vs Western digits), and a summary. Layer names that are not copy
("Search Input", "Frame", icon names…) are skipped. Strings that are sample data the team
deliberately corrected may legitimately be missing — everything else must match exactly.
"""
import argparse, html, json, re, shutil, subprocess, sys, tempfile
from pathlib import Path

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
HERE = Path(__file__).parent
SKIP = re.compile(r"^(Search Input|Frame|Group|Vector|Icon|div|span|Rectangle|Ellipse|Line|Container|Text|Label)\b", re.I)
AR_DIGITS = str.maketrans("٠١٢٣٤٥٦٧٨٩٬٫", "0123456789,.")


def norm(s: str) -> str:
    s = html.unescape(s).replace("\u200f", "").replace("\u200e", "").replace("\xa0", " ")
    return re.sub(r"\s+", " ", s).strip()


def page_text(route: str, lang: str, wait: int) -> str:
    r = route.replace("\\", "/")
    for junk in ("C:/Program Files/Git/", "C:/Program Files/Git"):
        r = r.replace(junk, "/")
    r = r.lstrip("#").lstrip("/")
    url = f"http://localhost:5180/?static&lang={lang}#/{r}"
    prof = Path(tempfile.mkdtemp(prefix="wijha-text-"))
    try:
        for budget in (wait, wait * 3):
            out = subprocess.run(
                [CHROME, "--headless=new", "--disable-gpu", f"--user-data-dir={prof}", "--window-size=1440,2000",
                 f"--virtual-time-budget={budget}", "--dump-dom", url],
                capture_output=True, text=True, encoding="utf-8", errors="ignore", timeout=180).stdout
            body = out[out.find("<body"):]
            body = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", body, flags=re.S)
            # keep attribute text people see (placeholders, aria-labels, titles)
            attrs = " ".join(m.group(2) for m in re.finditer(r'(placeholder|aria-label|title|value)="([^"]*)"', body))
            text = norm(re.sub(r"<[^>]+>", " ", body) + " " + attrs)
            if len(text) > 200:
                return text
        return text
    finally:
        shutil.rmtree(prof, ignore_errors=True)


def check(frame: str, route: str, lang: str, wait: int, data: dict) -> int:
    f = data["frames"].get(frame)
    if not f:
        print(f"[{frame}] not in figma-text.json"); return 1
    text = page_text(route, lang, wait)
    text_d = text.translate(AR_DIGITS)
    missing, digits = [], []
    for s in f["texts"]:
        s = norm(s)
        if not s or SKIP.match(s) or len(s) < 2 and not s.isdigit():
            continue
        if s in text:
            continue
        if s.translate(AR_DIGITS) in text_d:
            digits.append(s)
        else:
            missing.append(s)
    total = len([s for s in f["texts"] if norm(s) and not SKIP.match(norm(s))])
    print(f"\n[{frame}] {f['name']}  lang={lang}  route=#/{route}")
    print(f"  {total - len(missing) - len(digits)}/{total} strings exact · {len(digits)} digit-style only · {len(missing)} missing")
    for s in digits:
        print(f"  DIGITS  {s}")
    for s in missing:
        print(f"  MISSING {s}")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--frame")
    ap.add_argument("--pair", help="Arabic frame id: checks it in ar and its English twin in en")
    ap.add_argument("--route", required=True)
    ap.add_argument("--lang", default="ar")
    ap.add_argument("--wait", type=int, default=8000)
    a = ap.parse_args()
    data = json.load(open(HERE / "figma-text.json", encoding="utf-8"))
    if sys.stdout.encoding.lower() != "utf-8":
        sys.stdout.reconfigure(encoding="utf-8")
    if a.pair:
        check(a.pair, a.route, "ar", a.wait, data)
        en = next((p["en"] for p in data["pairs"] if p["ar"] == a.pair), None)
        if en:
            check(en, a.route, "en", a.wait, data)
        else:
            print(f"\n[{a.pair}] has no English twin in the Figma file")
        return 0
    return check(a.frame, a.route, a.lang, a.wait, data)


if __name__ == "__main__":
    sys.exit(main())
