/** Tiny in-memory store for surveys authored during this session, shared
 *  between the list page and the full-page builder. Demo-only (resets on
 *  reload) — a real build would persist via the CMS/content API. */
import type { SurveyCategory } from "./data/mock/surveys"

export type CreatedSurvey = {
  id: string
  title: string
  category: SurveyCategory
  questionCount: number
  /** Created from the Figma create popup (2464:2865). */
  kind?: "survey" | "poll"
  status?: "Published" | "Draft"
  options?: string[]
  publishDate?: string
  fromDepts?: string[]
  audience?: string[]
}

let created: CreatedSurvey[] = []
const listeners = new Set<() => void>()

export function getCreatedSurveys(): CreatedSurvey[] {
  return created
}

export function addCreatedSurvey(survey: CreatedSurvey): void {
  created = [survey, ...created]
  listeners.forEach((l) => l())
}

export function updateCreatedSurvey(id: string, patch: Partial<CreatedSurvey>): void {
  created = created.map((c) => (c.id === id ? { ...c, ...patch } : c))
  listeners.forEach((l) => l())
}

export function removeCreatedSurvey(id: string): void {
  created = created.filter((c) => c.id !== id)
  listeners.forEach((l) => l())
}

export function subscribeCreated(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// ── Completed surveys (shared between list page and the full-page respond flow,
//    so a submitted response survives the route change back to the list) ──────
let completed: string[] = []
const completedListeners = new Set<() => void>()

export function getCompletedSurveys(): string[] {
  return completed
}

export function markSurveyCompleted(id: string): void {
  if (completed.includes(id)) return
  completed = [...completed, id]
  completedListeners.forEach((l) => l())
}

export function subscribeCompleted(listener: () => void): () => void {
  completedListeners.add(listener)
  return () => completedListeners.delete(listener)
}
