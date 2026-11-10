import * as React from "react"

/** The assistant's suggestions on a project ("اقتراح المساعد", Figma 3580:8261).
 *  Each one can be added as a sub-task or turned down. Demo store. */
export type Suggestion = {
  id: string
  /** Project the suggestion is about. */
  subjectId: string
  text: string; textAr: string
}

const SEED: Suggestion[] = [
  { id: "sg1", subjectId: "p2", text: "Pull the numbers from the finance dashboard", textAr: "اسحب الأرقام من لوحة المالية" },
  { id: "sg2", subjectId: "p2", text: "Compare the hospitality contracts with the Jeddah contract", textAr: "قارن عقود الضيافة بعقد جدة" },
  { id: "sg3", subjectId: "p1", text: "Book a 20-minute walkthrough with the IT manager", textAr: "احجز 20 دقيقة مع مدير التقنية لاستعراض التجربة" },
  { id: "sg4", subjectId: "p6", text: "Attach the contractor's revised scope before sign-off", textAr: "أرفق النطاق المعدّل من المقاول قبل الاعتماد" },
]

let list: Suggestion[] = SEED
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l) }

export function useSuggestions(subjectId: string): Suggestion[] {
  const all = React.useSyncExternalStore(subscribe, () => list)
  return React.useMemo(() => all.filter((s) => s.subjectId === subjectId), [all, subjectId])
}

/** Taken up or turned down — either way it leaves the card. */
export function dismissSuggestion(id: string) {
  list = list.filter((s) => s.id !== id)
  emit()
}
