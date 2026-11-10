"""Pixel comparison of a running WIJHA page against its Figma frame.

Usage:
  python scripts/pixel/compare.py --figma <frame.png> --route services --name services
  (route = the hash path without "/" or "#/"; use --route "" for the home page)
         [--base http://localhost:5180] [--out scripts/pixel/out] [--locale ar|en]
         [--wait 6000]

The Figma PNG must be the frame exported at 1x (e.g. 1440 x H). The page is rendered by
headless Chrome at exactly that size, so the side rail, top bar and content line up
pixel for pixel. Writes into <out>/<name>/:
  figma.png, app.png, diff.png (changed pixels in red over a dimmed app render),
  side.png (figma | app | diff), and prints a JSON score.

Score: `mismatch` = share of pixels whose max channel delta > --threshold (default 32).
Under ~3% is a close match for a data-bearing screen; the diff image shows where to look.
"""
import argparse, json, os, shutil, subprocess, sys, tempfile, time
from pathlib import Path

import numpy as np
from PIL import Image

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"


def render(url: str, width: int, height: int, out: Path, wait_ms: int, theme: str, locale: str) -> None:
    profile = Path(tempfile.mkdtemp(prefix="wijha-pixel-"))
    # Chrome mangles a --screenshot path containing spaces ("Claude Working
    # Folder"), so render into the temp profile and move the file afterwards.
    shot = profile / "shot.png"
    try:
        # The app's defaults (dark, Arabic, minimized rail, employee view) are the
        # Figma state, and the fresh profile has empty localStorage, so no seeding.
        cmd = [
            CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars",
            f"--user-data-dir={profile}", "--force-device-scale-factor=1",
            f"--window-size={width},{height}", f"--virtual-time-budget={wait_ms}",
            f"--screenshot={shot}", url,
        ]
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=120)
        shutil.move(str(shot), str(out))
    finally:
        shutil.rmtree(profile, ignore_errors=True)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--figma", required=True)
    ap.add_argument("--route", required=True, help='hash path without leading "/" or "#/", e.g. services or operations/personal/goals; "" = home')
    ap.add_argument("--name", required=True)
    ap.add_argument("--base", default="http://localhost:5180")
    ap.add_argument("--out", default=str(Path(__file__).parent / "out"))
    ap.add_argument("--theme", default="dark")
    ap.add_argument("--locale", default="ar")
    ap.add_argument("--wait", type=int, default=8000)
    ap.add_argument("--threshold", type=int, default=32)
    a = ap.parse_args()

    out = Path(a.out) / a.name
    out.mkdir(parents=True, exist_ok=True)
    fig = Image.open(a.figma).convert("RGB")
    w, h = fig.size
    fig.save(out / "figma.png")

    app_path = out / "app.png"
    if app_path.exists():
        app_path.unlink()
    # Routes are given WITHOUT a leading "/" or "#/" (e.g. "services", "" for home):
    # Git Bash rewrites "/x" and even "#/x" into Windows paths. Undo that if it happened.
    r = a.route.replace("\\", "/")
    for junk in ("C:/Program Files/Git/", "C:/Program Files/Git"):
        r = r.replace(junk, "/")
    r = r.lstrip("#").lstrip("/")
    route = "#/" + r
    # A cold dev server can still be compiling lazy chunks when the virtual-time
    # budget runs out, leaving a blank page; retry with a longer budget.
    for attempt, budget in enumerate((a.wait, a.wait * 2, a.wait * 4)):
        if app_path.exists():
            app_path.unlink()
        render(a.base.rstrip("/") + f"/?static&lang={a.locale}" + route, w, h, app_path, budget, a.theme, a.locale)
        gray = np.asarray(Image.open(app_path).convert("L"))
        if (gray > 120).mean() > 0.002:  # any real text/content painted
            break
    app = Image.open(app_path).convert("RGB")
    if app.size != fig.size:
        app = app.crop((0, 0, w, min(h, app.size[1]))) if app.size[0] >= w else app.resize((w, h))
        if app.size != fig.size:
            canvas = Image.new("RGB", (w, h), (255, 0, 255))
            canvas.paste(app, (0, 0))
            app = canvas
    app.save(app_path)

    fa = np.asarray(fig, dtype=np.int16)
    aa = np.asarray(app, dtype=np.int16)
    delta = np.abs(fa - aa).max(axis=2)
    mask = delta > a.threshold
    mismatch = float(mask.mean())

    dim = (aa * 0.35).astype(np.uint8)
    diff = dim.copy()
    diff[mask] = [235, 64, 52]
    Image.fromarray(diff).save(out / "diff.png")

    side = Image.new("RGB", (w * 3 + 40, h), (40, 40, 40))
    side.paste(fig, (0, 0)); side.paste(app, (w + 20, 0)); side.paste(Image.fromarray(diff), (2 * w + 40, 0))
    side.save(out / "side.png")

    # Half-scale review strips, 800px of the frame each: figma | app | diff.
    for old in out.glob("cmp_*.png"):
        old.unlink()
    diff_img = Image.fromarray(diff)
    for i, y in enumerate(range(0, h, 800)):
        y2 = min(h, y + 800)
        cw, ch = w // 2, (y2 - y) // 2
        strip = Image.new("RGB", (cw * 3 + 20, ch), (70, 70, 70))
        for j, src in enumerate((fig, app, diff_img)):
            strip.paste(src.crop((0, y, w, y2)).resize((cw, ch)), (j * (cw + 10), 0))
        strip.save(out / f"cmp_{i}.png")

    # Row bands with the most mismatch, to point at the worst regions.
    rows = mask.mean(axis=1)
    bands = []
    step = 40
    for y in range(0, h, step):
        r = float(rows[y:y + step].mean())
        if r > 0.08:
            bands.append({"y": y, "y2": min(h, y + step), "mismatch": round(r, 3)})
    bands.sort(key=lambda b: -b["mismatch"])
    print(json.dumps({"name": a.name, "size": [w, h], "mismatch": round(mismatch, 4),
                      "worst_bands": bands[:8], "out": str(out)}, ensure_ascii=False))


if __name__ == "__main__":
    sys.exit(main())
