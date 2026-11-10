/** Locale helper for Learning (separate from the components for fast refresh). */
import * as React from "react"
import { useShell } from "@reach/shell-context"

import type { L } from "../data/learning"

export function useT() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = React.useCallback((en: string, ar: string) => (isAr ? ar : en), [isAr])
  const l = React.useCallback((v: L) => (isAr ? v.ar : v.en), [isAr])
  return { isAr, t, l }
}

