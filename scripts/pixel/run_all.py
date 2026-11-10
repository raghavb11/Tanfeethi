"""Score every frame of an area against the app, Arabic and English.

  python scripts/pixel/run_all.py --area services          # all frames of one area
  python scripts/pixel/run_all.py --area services --only 3039:5370
  python scripts/pixel/run_all.py                          # everything (slow)

Uses frames.json (AR frame -> route) and figma-text.json (AR -> EN twin). For each
frame present in scripts/pixel/figma/ it runs compare.py in ar (and en for the twin)
and appends a row to scripts/pixel/out/summary-<area>.md:
  | frame | lang | route | mismatch |
Run one area at a time; each comparison launches a headless Chrome.
"""
import argparse, json, subprocess, sys
from pathlib import Path

HERE = Path(__file__).parent


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--area")
    ap.add_argument("--only", nargs="*")
    ap.add_argument("--langs", default="ar,en")
    a = ap.parse_args()
    frames = json.load(open(HERE / "frames.json", encoding="utf-8"))["frames"]
    pairs = {p["ar"]: p["en"] for p in json.load(open(HERE / "figma-text.json", encoding="utf-8"))["pairs"]}
    rows = []
    for f in frames:
        if a.area and f["area"] != a.area:
            continue
        if a.only and f["ar"] not in a.only:
            continue
        for lang in a.langs.split(","):
            fid = f["ar"] if lang == "ar" else pairs.get(f["ar"])
            if not fid:
                continue
            png = HERE / "figma" / (fid.replace(":", "-") + ".png")
            if not png.exists():
                rows.append((fid, lang, f["route"], "no export"))
                continue
            name = f"{fid.replace(':', '-')}-{lang}"
            r = subprocess.run([sys.executable, str(HERE / "compare.py"), "--figma", str(png), "--route", f["route"],
                                "--name", name, "--locale", lang], capture_output=True, text=True, encoding="utf-8")
            try:
                score = f"{json.loads(r.stdout.strip().splitlines()[-1])['mismatch'] * 100:.2f}%"
            except Exception:
                score = "error: " + (r.stderr.strip().splitlines() or ["?"])[-1][:80]
            rows.append((fid, lang, f["route"], score))
            print(f"{fid:>12} {lang} {score:>8}  #/{f['route']}", flush=True)
    out = HERE / "out" / f"summary-{a.area or 'all'}.md"
    out.parent.mkdir(exist_ok=True)
    out.write_text("| frame | lang | route | mismatch |\n|---|---|---|---|\n" +
                   "".join(f"| {r[0]} | {r[1]} | `#/{r[2]}` | {r[3]} |\n" for r in rows), encoding="utf-8")
    print("wrote", out)
    return 0


if __name__ == "__main__":
    sys.exit(main())
