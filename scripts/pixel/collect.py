"""Move DesignAgent `export_asset` output into scripts/pixel/figma/<node-id>.png.

The bridge can only write under its working directory (C:\\Windows\\System32 here), so
frames are exported with dir="spool/drivers/color" (user-writable) and collected with:
  python scripts/pixel/collect.py '<the "written" JSON array from export_asset>'
"""
import json, shutil, sys
from pathlib import Path

BRIDGE_ROOT = Path(r"C:\Windows\System32")
DEST = Path(__file__).parent / "figma"


def main() -> int:
    DEST.mkdir(exist_ok=True)
    written = json.loads(sys.argv[1])
    if isinstance(written, dict):
        written = written.get("written", [])
    for w in written:
        src = BRIDGE_ROOT / w["path"]
        dst = DEST / (w["nodeId"].replace(":", "-") + ".png")
        shutil.move(str(src), str(dst))
        print(f"{w['nodeId']:>12}  {w['width']}x{w['height']}  -> {dst.name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
