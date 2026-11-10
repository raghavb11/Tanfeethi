"""Re-map the wght axis of a variable font so CSS weight u draws the outlines of t(u).

  cd apps/shell/public/fonts
  python ../../scripts/remap-font-weight.py aktiv-grotesk-var.woff2 aktiv-grotesk-var-figma.woff2       "100:100,400:300,500:400,700:600,900:900"

t is piecewise linear through the given user-space points (t(100)=100, t(900)=900).
The fvar default moves to t^-1(400) so the default master stays at the original 400,
and avar is rebuilt as old_avar(old_norm(t(u))) sampled every 10 units. Needs fontTools
and brotli (pip install fonttools brotli)."""
import sys, bisect
from fontTools.ttLib import TTFont
src, dst, spec = sys.argv[1:4]
pts = sorted(tuple(map(float, p.split(':'))) for p in spec.split(','))
def interp(x, P):
    xs = [p[0] for p in P]
    i = bisect.bisect_right(xs, x) - 1
    i = max(0, min(i, len(P) - 2))
    (x0, y0), (x1, y1) = P[i], P[i + 1]
    return y0 + (y1 - y0) * (x - x0) / (x1 - x0)
t = lambda u: interp(u, pts)
tinv = lambda v: interp(v, [(b, a) for a, b in pts])
f = TTFont(src)
ax = [a for a in f['fvar'].axes if a.axisTag == 'wght'][0]
lo, d0, hi = ax.minValue, ax.defaultValue, ax.maxValue
old = sorted(f['avar'].segments['wght'].items())
def n_old(v): return (v - d0) / (d0 - lo) if v < d0 else (v - d0) / (hi - d0)
def avar_old(n): return interp(n, old)
D = round(tinv(d0), 3)
def n_new(u): return (u - D) / (D - lo) if u < D else (u - D) / (hi - D)
us = sorted(set([lo, hi, D] + list(range(int(lo), int(hi) + 1, 10))))
seg = {}
for u in us:
    seg[round(n_new(u), 5)] = round(avar_old(n_old(t(u))), 5)
seg[-1.0] = -1.0; seg[0.0] = 0.0; seg[1.0] = 1.0
f['avar'].segments['wght'] = dict(sorted(seg.items()))
ax.defaultValue = D
f.flavor = 'woff2'
f.save(dst)
print('default', D, 'entries', len(seg))
