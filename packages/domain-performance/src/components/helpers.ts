/** Non-component helpers for Corporate performance (kept apart from the .tsx
 *  components for fast refresh). */
import * as React from "react"
import { useSearchParams } from "react-router-dom"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"

import { DEFAULT_PERIOD, periodById, type L, type Status, type Unit } from "../data/performance"

// ── i18n ─────────────────────────────────────────────────────────────────────
export function useT() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = React.useCallback((en: string, ar: string) => (isAr ? ar : en), [isAr])
  const l = React.useCallback((v: L) => (isAr ? v.ar : v.en), [isAr])
  return { isAr, t, l }
}
export type TFn = (en: string, ar: string) => string

// ── numbers ──────────────────────────────────────────────────────────────────
/** Western digits grouped in threes (1,234,567) in both languages, as in Figma. */
export function fmtNum(n: number, maxDecimals = 1): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: maxDecimals })
}

export const fmtPct = (n: number | null | undefined) => (n === null || n === undefined ? "—" : `${Math.round(n)}%`)

/** SAR amounts grouped in threes ("4,210,000 SAR" / "4,210,000 ر.س"). */
export function fmtSAR(n: number, isAr: boolean): string {
  return `${fmtNum(n, n >= 1000 ? 0 : 1)} ${isAr ? "ر.س" : "SAR"}`
}

/** A KPI value in its unit. */
export function fmtValue(unit: Unit, v: number | null | undefined, isAr: boolean): string {
  if (v === null || v === undefined) return "—"
  switch (unit) {
    case "pct": return `${fmtNum(v)}%`
    case "score": return fmtNum(v)
    case "sar": return fmtSAR(v, isAr)
    case "hours": return `${fmtNum(v)} ${isAr ? "ساعة" : "h"}`
    case "days": return `${fmtNum(v)} ${isAr ? "يوم" : "days"}`
    case "count": return fmtNum(v, 0)
  }
}

/** Short form for chart axes and tiles ("4.2M"). */
export function fmtCompact(unit: Unit, v: number, isAr: boolean): string {
  if (unit === "sar" && Math.abs(v) >= 1_000_000) return `${fmtNum(v / 1_000_000, 2)}${isAr ? " مليون" : "M"}`
  if (unit === "sar" && Math.abs(v) >= 10_000) return `${fmtNum(v / 1000, 0)}${isAr ? " ألف" : "K"}`
  if (unit === "pct") return `${fmtNum(v)}%`
  return fmtNum(v)
}

/** Value in both languages — used when the store logs an update to the feed. */
export const fmtValueL = (unit: Unit, v: number): L => ({ en: fmtValue(unit, v, false), ar: fmtValue(unit, v, true) })

/** Signed percentage-point change ("+3 pts"). */
export function fmtDelta(d: number, isAr: boolean): string {
  const r = Math.round(d)
  const sign = r > 0 ? "+" : r < 0 ? "−" : "±"
  return `${sign}${Math.abs(r)} ${isAr ? "نقطة" : "pts"}`
}

// ── dates (Figma shows 2026/10/01 in both languages) ─────────────────────────
export const fmtDate = (iso: string) => iso.slice(0, 10).replaceAll("-", "/")
export const fmtDateTime = (at: string) => `${fmtDate(at)} · ${at.slice(11, 16)}`

// ── status presentation ──────────────────────────────────────────────────────
export const STATUS_TONE: Record<Status, { chip: string; bar: string; text: string; color: string }> = {
  "on-track": { chip: "bg-success-fill text-success", bar: "bg-success", text: "text-success", color: "var(--success)" },
  "at-risk": { chip: "bg-warning-fill text-warning", bar: "bg-warning", text: "text-warning", color: "var(--warning)" },
  "off-track": { chip: "bg-error-fill text-error", bar: "bg-error", text: "text-error", color: "var(--error)" },
}

/** Reference marks (targets, earlier periods) — foreground at 42%: clears the
 *  gold actuals by ΔE ≥ 15 in both themes (checked with the dataviz validator). */
export const REF_COLOR = "color-mix(in oklab, var(--foreground) 42%, transparent)"

// ── period (kept in the URL so it survives drill-downs) ──────────────────────
export function usePeriod() {
  const [params, setParams] = useSearchParams()
  const period = periodById(params.get("period"))
  const setPeriod = React.useCallback(
    (id: string) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (id === DEFAULT_PERIOD) next.delete("period")
          else next.set("period", id)
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )
  /** Append the current period to an internal link. */
  const withPeriod = React.useCallback(
    (path: string) => (period.id === DEFAULT_PERIOD ? path : `${path}?period=${period.id}`),
    [period.id],
  )
  return { period, setPeriod, withPeriod }
}

/** Short fake load so every page shows its loading state once. */
export function useSimulatedLoad(ms = 450): boolean {
  const [loading, setLoading] = React.useState(true)
  React.useEffect(() => {
    const id = window.setTimeout(() => setLoading(false), ms)
    return () => window.clearTimeout(id)
  }, [ms])
  return loading
}

/** Width of an element (charts draw in pixels so rounded caps never stretch). */
export function useWidth<T extends HTMLElement>(): [(el: T | null) => void, number] {
  const [el, setEl] = React.useState<T | null>(null)
  const [w, setW] = React.useState(0)
  React.useLayoutEffect(() => {
    if (!el) return
    // ResizeObserver reports the initial size on observe(), so no sync setState here
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [el])
  return [setEl, w]
}

/** Clean axis ticks covering [min, max]. */
export function niceTicks(min: number, max: number, count = 4): number[] {
  if (min === max) { min -= 1; max += 1 }
  const raw = (max - min) / count
  const mag = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? 10 * mag
  const lo = Math.floor(min / step) * step
  const hi = Math.ceil(max / step) * step
  const out: number[] = []
  for (let v = lo; v <= hi + step / 2; v += step) out.push(Number(v.toFixed(6)))
  return out
}

/** 36px input (radius 8, Page fill, hairline). */
export function inputCls(invalid = false) {
  return cn(
    "h-9 w-full min-w-0 rounded-lg bg-background px-3 text-[12.5px] font-medium text-foreground outline-none ring-1 ring-inset ring-[var(--card-ring)] placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60",
    invalid && "ring-error",
  )
}
