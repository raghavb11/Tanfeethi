/** Inline-SVG charts for Corporate performance (no chart library in the repo).
 *
 *  Follows the dataviz method with WIJHA tokens:
 *  • Columns ≤ 24px, 4px rounded data-end, square at the baseline, sitting in a
 *    Shape/Fill/Secondary track like the Steps-leaderboard chart; the fill carries
 *    the status (success / warning / error) and the chip/tooltip names it in words.
 *  • Lines 2px, round caps; the actual series is gold (--primary) with a 10% area wash;
 *    targets / earlier periods are a reference mark in foreground @42% (REF_COLOR),
 *    dashed because a target is a threshold. ΔE vs gold ≥ 15 in both themes.
 *  • Hover + keyboard focus tooltips (values lead), hit targets wider than the marks,
 *    selective direct labels, a visually-hidden table twin for every chart.
 *  • Time runs with the reading direction (right-to-left in Arabic), as the
 *    leaderboard chart does; the SVG itself is laid out LTR and mirrored by hand. */
import * as React from "react"
import { cn } from "@reach/shared-core"

import { STATUS_LABEL, type Status } from "../data/performance"
import { REF_COLOR, STATUS_TONE, niceTicks, useT, useWidth } from "./helpers"

// ── shared bits ──────────────────────────────────────────────────────────────
function Tip({ x, y, width, children }: { x: number; y: number; width: number; children: React.ReactNode }) {
  const left = Math.max(84, Math.min(width - 84, x))
  return (
    <div
      role="presentation"
      className="pointer-events-none absolute z-10 min-w-[150px] -translate-x-1/2 rounded-lg bg-popover px-3 py-2 text-start text-[11.5px] leading-[17px] text-popover-foreground shadow-lg ring-1 ring-[var(--card-ring)]"
      style={{ left, top: y, transform: "translate(-50%, calc(-100% - 10px))" }}
    >
      {children}
    </div>
  )
}

/** Legend key that mirrors the mark: a short line (solid or dashed) or a rounded rect. */
export function LegendKey({ kind, color, dashed }: { kind: "line" | "rect"; color: string; dashed?: boolean }) {
  if (kind === "rect") return <span aria-hidden className="inline-block h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: color }} />
  return (
    <svg aria-hidden width="18" height="6" className="shrink-0">
      <line x1="1" y1="3" x2="17" y2="3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeDasharray={dashed ? "4 3" : undefined} />
    </svg>
  )
}

export function ChartLegend({ items, className }: { items: { label: string; kind: "line" | "rect"; color: string; dashed?: boolean }[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px] text-muted-foreground", className)}>
      {items.map((i) => (
        <li key={i.label} className="inline-flex items-center gap-1.5">
          <LegendKey kind={i.kind} color={i.color} dashed={i.dashed} />
          {i.label}
        </li>
      ))}
    </ul>
  )
}

function SrTable({ caption, head, rows }: { caption: string; head: string[]; rows: string[][] }) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead><tr>{head.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>))}</tr>)}</tbody>
    </table>
  )
}

/** Column path: square at the baseline, 4px rounded data-end. */
function columnPath(cx: number, w: number, top: number, base: number) {
  const x0 = cx - w / 2
  const x1 = cx + w / 2
  const r = Math.max(0, Math.min(4, (base - top) / 2, w / 2))
  return `M${x0},${base} V${top + r} Q${x0},${top} ${x0 + r},${top} H${x1 - r} Q${x1},${top} ${x1},${top + r} V${base} Z`
}

// ── column chart (achievement % per month / quarter) ─────────────────────────
export type ColumnPoint = {
  key: string
  label: string
  /** Percent 0–100 (progress / achievement). */
  value: number | null
  status: Status | null
  /** Outside the selected period — drawn at reduced opacity. */
  dim?: boolean
  /** Extra tooltip line. */
  detail?: string
}

export function ColumnChart({ points, target, height = 232, ariaLabel, labelAll = false }: {
  points: ColumnPoint[]
  target: number
  height?: number
  ariaLabel: string
  /** Direct-label every column (few columns); otherwise only the latest value. */
  labelAll?: boolean
}) {
  const { t, l, isAr } = useT()
  const [ref, W] = useWidth<HTMLDivElement>()
  const [active, setActive] = React.useState<number | null>(null)

  const AXIS = 34, TOP = 22, BOTTOM = 28
  const plotH = height - TOP - BOTTOM
  const base = TOP + plotH
  const n = points.length
  const band = W > AXIS ? (W - AXIS) / n : 0
  const barW = Math.min(24, band * 0.56)
  const cx = (i: number) => (isAr ? W - AXIS - band * (i + 0.5) : AXIS + band * (i + 0.5))
  const y = (v: number) => TOP + plotH * (1 - Math.max(0, Math.min(100, v)) / 100)
  const lastWithData = points.reduce((acc, p, i) => (p.value !== null ? i : acc), -1)
  const every = band > 0 && band < 40 ? 2 : 1
  const tickX = isAr ? W - AXIS + 8 : AXIS - 8
  const act = active !== null ? points[active] : null

  return (
    <div className="relative" ref={ref} style={{ height }}>
      {W > 0 && (
        <svg width={W} height={height} style={{ direction: "ltr" }} role="group" aria-label={ariaLabel} className="block overflow-visible">
          {[0, 50, 100].map((v) => (
            <text key={v} x={tickX} y={y(v) + 4} textAnchor={isAr ? "start" : "end"} className="fill-muted-foreground text-[10.5px] tabular-nums">
              {v}%
            </text>
          ))}
          {points.map((p, i) => {
            const x = cx(i)
            const op = active !== null ? (i === active ? 1 : 0.45) : p.dim ? 0.4 : 1
            const showLabel = p.value !== null && (labelAll || i === lastWithData || i === active)
            return (
              <g key={p.key} style={{ opacity: op, transition: "opacity 150ms" }}>
                <path d={columnPath(x, barW, TOP, base)} fill="var(--secondary)" opacity={0.6} />
                {p.value !== null && p.status && (
                  <path d={columnPath(x, barW, y(p.value), base)} fill={STATUS_TONE[p.status].color} />
                )}
                {showLabel && (
                  <text x={x} y={y(p.value!) - 6} textAnchor="middle" className="fill-foreground text-[11px] font-semibold tabular-nums">
                    {Math.round(p.value!)}%
                  </text>
                )}
                {(i % every === 0 || i === n - 1) && (
                  <text x={x} y={base + 18} textAnchor="middle" className={cn("text-[11px]", p.dim ? "fill-muted-foreground" : "fill-foreground")}>
                    {p.label}
                  </text>
                )}
              </g>
            )
          })}
          {/* target — a threshold, so dashed */}
          <line
            x1={isAr ? 0 : AXIS} x2={isAr ? W - AXIS : W} y1={y(target)} y2={y(target)}
            stroke={REF_COLOR} strokeWidth={1.5} strokeDasharray="5 4" strokeLinecap="round"
          />
          {/* hit targets: the whole band, bigger than the mark */}
          {points.map((p, i) => (
            <rect
              key={p.key}
              x={cx(i) - band / 2} y={TOP - 8} width={band} height={plotH + BOTTOM + 8}
              fill="transparent" tabIndex={0} className="cursor-default outline-none focus-visible:stroke-[var(--ring)]"
              aria-label={`${p.label}: ${p.value === null ? t("no data yet", "لا توجد بيانات بعد") : `${Math.round(p.value)}% — ${l(STATUS_LABEL[p.status!])}`}`}
              onPointerEnter={() => setActive(i)} onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(i)} onBlur={() => setActive(null)}
            />
          ))}
        </svg>
      )}
      {act && active !== null && W > 0 && (
        <Tip x={cx(active)} y={act.value !== null ? y(act.value) : base - 8} width={W}>
          <div className="text-muted-foreground">{act.label}</div>
          {act.value === null ? (
            <div className="font-medium">{t("No data yet", "لا توجد بيانات بعد")}</div>
          ) : (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-[15px] font-semibold text-foreground">{Math.round(act.value)}%</span>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <span className="size-1.5 rounded-full" style={{ background: STATUS_TONE[act.status!].color }} />
                  {l(STATUS_LABEL[act.status!])}
                </span>
              </div>
              {act.detail && <div className="text-muted-foreground">{act.detail}</div>}
            </>
          )}
        </Tip>
      )}
      <SrTable
        caption={ariaLabel}
        head={[t("Period", "الفترة"), t("Achievement", "الإنجاز"), t("Status", "الحالة")]}
        rows={points.map((p) => [p.label, p.value === null ? "—" : `${Math.round(p.value)}%`, p.status ? l(STATUS_LABEL[p.status]) : "—"])}
      />
    </div>
  )
}

// ── actual vs target line (12 months) ────────────────────────────────────────
export function TrendLine({ labels, actual, target, format, formatAxis, height = 260, ariaLabel, actualLabel, targetLabel, statusAt }: {
  labels: string[]
  actual: (number | null)[]
  target: number[]
  format: (v: number) => string
  formatAxis: (v: number) => string
  height?: number
  ariaLabel: string
  actualLabel: string
  targetLabel: string
  /** Status of a month (for the tooltip). */
  statusAt: (i: number) => Status | null
}) {
  const { t, l, isAr } = useT()
  const [ref, W] = useWidth<HTMLDivElement>()
  const [active, setActive] = React.useState<number | null>(null)

  const AXIS = 58, TOP = 26, BOTTOM = 28, END = 18
  const plotH = height - TOP - BOTTOM
  const n = labels.length
  const plotW = Math.max(0, W - AXIS - END)
  const xl = (i: number) => AXIS + (n === 1 ? plotW / 2 : (plotW * i) / (n - 1))
  const x = (i: number) => (isAr ? W - xl(i) : xl(i))

  const values = [...actual.filter((v): v is number => v !== null), ...target]
  const lo = Math.min(...values)
  const hi = Math.max(...values)
  const pad = (hi - lo || Math.abs(hi) || 1) * 0.15
  const ticks = niceTicks(lo - pad, hi + pad, 4)
  const yMin = ticks[0]
  const yMax = ticks[ticks.length - 1]
  const y = (v: number) => TOP + plotH * (1 - (v - yMin) / (yMax - yMin || 1))

  // consecutive runs of reported months
  const runs: number[][] = []
  actual.forEach((v, i) => {
    if (v === null) return
    const run = runs[runs.length - 1]
    if (run && run[run.length - 1] === i - 1) run.push(i)
    else runs.push([i])
  })
  const lastIdx = actual.reduce<number>((acc, v, i) => (v !== null ? i : acc), -1)
  const line = (idx: number[], vals: (i: number) => number) => idx.map((i, k) => `${k ? "L" : "M"}${x(i)},${y(vals(i))}`).join(" ")
  const all = labels.map((_, i) => i)
  const every = plotW > 0 && plotW / n < 36 ? 2 : 1

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const box = e.currentTarget.ownerSVGElement!.getBoundingClientRect()
    const px = e.clientX - box.left
    const lx = isAr ? W - px : px
    const i = Math.round(((lx - AXIS) / (plotW || 1)) * (n - 1))
    setActive(Math.max(0, Math.min(n - 1, i)))
  }
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight" && e.key !== "Home" && e.key !== "End") return
    e.preventDefault()
    const cur = active ?? Math.max(0, lastIdx)
    if (e.key === "Home") return setActive(0)
    if (e.key === "End") return setActive(n - 1)
    const forward = (e.key === "ArrowRight") !== isAr
    setActive(Math.max(0, Math.min(n - 1, cur + (forward ? 1 : -1))))
  }

  const st = active !== null ? statusAt(active) : null
  return (
    <div className="flex flex-col gap-3">
      <ChartLegend items={[
        { label: actualLabel, kind: "line", color: "var(--primary)" },
        { label: targetLabel, kind: "line", color: REF_COLOR, dashed: true },
      ]} />
      <div
        className="relative rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
        ref={ref} style={{ height }} tabIndex={0} role="group"
        aria-label={`${ariaLabel}. ${t("Use the arrow keys to read each month.", "استخدم مفاتيح الأسهم لقراءة كل شهر.")}`}
        onKeyDown={onKey} onFocus={() => setActive((a) => a ?? Math.max(0, lastIdx))} onBlur={() => setActive(null)}
      >
        {W > 0 && (
          <svg width={W} height={height} style={{ direction: "ltr" }} aria-hidden className="block overflow-visible">
            {ticks.map((v) => (
              <g key={v}>
                <line x1={isAr ? END : AXIS} x2={isAr ? W - AXIS : W - END} y1={y(v)} y2={y(v)} stroke="var(--border)" strokeWidth={1} />
                <text x={isAr ? W - AXIS + 8 : AXIS - 8} y={y(v) + 4} textAnchor={isAr ? "start" : "end"} className="fill-muted-foreground text-[10.5px] tabular-nums">
                  {formatAxis(v)}
                </text>
              </g>
            ))}
            {labels.map((lab, i) => (i % every === 0 || i === n - 1) && (
              <text key={i} x={x(i)} y={TOP + plotH + 18} textAnchor="middle" className={cn("text-[11px]", actual[i] === null ? "fill-muted-foreground" : "fill-foreground")}>
                {lab}
              </text>
            ))}
            {runs.map((r) => (
              <path key={`a${r[0]}`} d={`${line(r, (i) => actual[i]!)} L${x(r[r.length - 1])},${y(yMin)} L${x(r[0])},${y(yMin)} Z`} fill="var(--primary)" opacity={0.1} />
            ))}
            <path d={line(all, (i) => target[i])} fill="none" stroke={REF_COLOR} strokeWidth={2} strokeDasharray="5 4" strokeLinecap="round" strokeLinejoin="round" />
            {runs.map((r) => (
              r.length > 1
                ? <path key={`l${r[0]}`} d={line(r, (i) => actual[i]!)} fill="none" stroke="var(--primary)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                : <circle key={`l${r[0]}`} cx={x(r[0])} cy={y(actual[r[0]]!)} r={4} fill="var(--primary)" stroke="var(--card)" strokeWidth={2} />
            ))}
            {lastIdx >= 0 && active === null && (
              <g>
                <circle cx={x(lastIdx)} cy={y(actual[lastIdx]!)} r={4.5} fill="var(--primary)" stroke="var(--card)" strokeWidth={2} />
                <text
                  x={Math.max(AXIS / 2, Math.min(W - 24, x(lastIdx)))} y={y(actual[lastIdx]!) - 11} textAnchor="middle"
                  className="fill-foreground text-[11.5px] font-semibold"
                >
                  {format(actual[lastIdx]!)}
                </text>
              </g>
            )}
            {active !== null && (
              <g>
                <line x1={x(active)} x2={x(active)} y1={TOP - 6} y2={TOP + plotH} stroke="var(--muted-foreground)" strokeOpacity={0.5} strokeWidth={1} />
                <circle cx={x(active)} cy={y(target[active])} r={4} fill={REF_COLOR} stroke="var(--card)" strokeWidth={2} />
                {actual[active] !== null && <circle cx={x(active)} cy={y(actual[active]!)} r={4.5} fill="var(--primary)" stroke="var(--card)" strokeWidth={2} />}
              </g>
            )}
            <rect
              x={isAr ? END - 10 : AXIS - 10} y={TOP - 10} width={plotW + 20} height={plotH + BOTTOM + 10} fill="transparent"
              onPointerMove={onMove} onPointerLeave={() => setActive(null)}
            />
          </svg>
        )}
        {active !== null && W > 0 && (
          <Tip x={x(active)} y={y(actual[active] ?? target[active])} width={W}>
            <div className="text-muted-foreground">{labels[active]}</div>
            <div className="mt-0.5 flex items-center gap-2">
              <LegendKey kind="line" color="var(--primary)" />
              <span className="text-[14px] font-semibold text-foreground">{actual[active] === null ? "—" : format(actual[active]!)}</span>
              <span className="text-muted-foreground">{actualLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <LegendKey kind="line" color={REF_COLOR} dashed />
              <span className="font-medium text-foreground">{format(target[active])}</span>
              <span className="text-muted-foreground">{targetLabel}</span>
            </div>
            {st && (
              <div className="mt-1 inline-flex items-center gap-1 text-muted-foreground">
                <span className="size-1.5 rounded-full" style={{ background: STATUS_TONE[st].color }} />
                {l(STATUS_LABEL[st])}
              </div>
            )}
          </Tip>
        )}
      </div>
      <SrTable
        caption={ariaLabel}
        head={[t("Month", "الشهر"), actualLabel, targetLabel]}
        rows={labels.map((lab, i) => [lab, actual[i] === null ? "—" : format(actual[i]!), format(target[i])])}
      />
    </div>
  )
}

// ── sparkline (table trend cell) ─────────────────────────────────────────────
/** 12-slot sparkline in the reference ink; the latest reported value in gold. */
export function Sparkline({ values, width = 76, height = 26, label }: {
  values: (number | null)[]; width?: number; height?: number; label: string
}) {
  const { isAr } = useT()
  const pts = values.map((v, i) => ({ v, i })).filter((p): p is { v: number; i: number } => p.v !== null)
  if (pts.length === 0) return <span className="text-[12px] text-muted-foreground">—</span>
  const lo = Math.min(...pts.map((p) => p.v))
  const hi = Math.max(...pts.map((p) => p.v))
  const P = 4
  const xl = (i: number) => P + ((width - 2 * P) * i) / Math.max(1, values.length - 1)
  const x = (i: number) => (isAr ? width - xl(i) : xl(i))
  const y = (v: number) => (hi === lo ? height / 2 : P + (height - 2 * P) * (1 - (v - lo) / (hi - lo)))
  const d = pts.map((p, k) => `${k ? "L" : "M"}${x(p.i)},${y(p.v)}`).join(" ")
  const last = pts[pts.length - 1]
  return (
    <svg width={width} height={height} role="img" aria-label={label} className="block overflow-visible" style={{ direction: "ltr" }}>
      <path d={d} fill="none" stroke={REF_COLOR} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x(last.i)} cy={y(last.v)} r={3} fill="var(--primary)" stroke="var(--card)" strokeWidth={1.5} />
    </svg>
  )
}
