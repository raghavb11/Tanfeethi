import * as React from "react"
import { useShell } from "@reach/shell-context"
import type { Option } from "../data/mock/services"

/** Bilingual helpers: t(en, ar) and o({ en, ar }) for the current shell locale. */
export function useT() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = React.useCallback((en: string, ar: string) => (isAr ? ar : en), [isAr])
  const o = React.useCallback((x: Option | undefined) => (x ? (isAr ? x.ar : x.en) : ""), [isAr])
  return { isAr, t, o }
}

