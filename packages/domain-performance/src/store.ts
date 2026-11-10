/** In-memory session store for Corporate performance (demo only — resets on reload).
 *  Pages subscribe with `usePerf(selector)`; selectors must return stable references
 *  (state slices), derived numbers are computed in the page with useMemo. */
import * as React from "react"

import {
  currentUser,
  initialFeed,
  initialKpis,
  MONTHS,
  type FeedItem,
  type Kpi,
} from "./data/performance"

type State = { kpis: Kpi[]; feed: FeedItem[] }

let state: State = { kpis: initialKpis, feed: initialFeed }

const listeners = new Set<() => void>()
function set(patch: Partial<State>) {
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}
function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function usePerf<T>(selector: (s: State) => T): T {
  return React.useSyncExternalStore(subscribe, () => selector(state))
}

const stamp = () => {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  // keep the prototype's calendar (Nov 2026) but the real time of day
  return `2026-11-10T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Record (or correct) a KPI's value for one month and log it on the objective's feed. */
export function updateKpiValue(kpiId: string, month: number, value: number, note: string, display: { en: string; ar: string }) {
  const kpi = state.kpis.find((k) => k.id === kpiId)
  if (!kpi) return
  const at = stamp()
  const trimmed = note.trim()
  const updated: Kpi = {
    ...kpi,
    actuals: kpi.actuals.map((v, i) => (i === month ? value : v)),
    notes: trimmed ? { ...kpi.notes, [month]: { text: trimmed, by: currentUser.name, iso: at.slice(0, 10) } } : kpi.notes,
  }
  const m = MONTHS[month]
  const item: FeedItem = {
    id: `f${Date.now()}`,
    objectiveId: kpi.objectiveId,
    kpiId,
    kind: "value",
    author: currentUser,
    at,
    text: {
      en: `Reported ${m.en} ${kpi.name.en}: ${display.en}${trimmed ? ` — ${trimmed}` : ""}`,
      ar: `تم رفع قيمة ${kpi.name.ar} لشهر ${m.ar}: ${display.ar}${trimmed ? ` — ${trimmed}` : ""}`,
    },
  }
  set({ kpis: state.kpis.map((k) => (k.id === kpiId ? updated : k)), feed: [item, ...state.feed] })
}

export function addComment(objectiveId: string, text: string) {
  const body = text.trim()
  if (!body) return
  set({
    feed: [
      { id: `f${Date.now()}`, objectiveId, kind: "comment", author: currentUser, at: stamp(), text: { en: body, ar: body } },
      ...state.feed,
    ],
  })
}
