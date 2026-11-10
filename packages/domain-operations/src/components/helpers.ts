/** Non-component helpers for Operations (kept apart from the .tsx components for fast refresh). */
import * as React from "react"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"

import type { Answer, L } from "../data/operations"

// ── i18n ─────────────────────────────────────────────────────────────────────
export function useT() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = React.useCallback((en: string, ar: string) => (isAr ? ar : en), [isAr])
  const l = React.useCallback((v: L) => (isAr ? v.ar : v.en), [isAr])
  return { isAr, t, l }
}

/** Figma shows dates as 2026/10/01 in both languages. */
export function fmtDate(iso: string | undefined | null): string {
  if (!iso) return ""
  return iso.replaceAll("-", "/")
}

/** SAR amounts grouped in threes (2,000 SAR). */
export function fmtSAR(n: number): string {
  return `${n.toLocaleString("en-US")} SAR`
}

/** Short fake load so every table shows its loading state once. */
export function useSimulatedLoad(ms = 350): boolean {
  const [loading, setLoading] = React.useState(true)
  React.useEffect(() => {
    const id = window.setTimeout(() => setLoading(false), ms)
    return () => window.clearTimeout(id)
  }, [ms])
  return loading
}

/** 36px input box. `surface="card"` for controls that sit on the secondary (modal) fill. */
export function inputCls(surface: "page" | "card" = "page", invalid = false) {
  return cn(
    "h-9 w-full min-w-0 rounded-lg px-3 text-[12.5px] font-medium text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default disabled:opacity-70",
    surface === "page" ? "bg-background" : "bg-card",
    invalid && "ring-1 ring-error",
  )
}

export const emptyAnswer = (): Answer => ({ complied: null, responsible: [], details: "", attachments: [] })
