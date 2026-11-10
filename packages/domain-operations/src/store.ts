/** In-memory session store for Operations & Performance (demo only — resets on
 *  reload). Pages subscribe with `useOps(selector)`. */
import * as React from "react"

import {
  initialGoals,
  initialManagerScores,
  initialRuns,
  schedule as initialSchedule,
  type Answer,
  type ChecklistRun,
  type Goal,
  type L,
  type Rating,
  type ScheduleEntry,
} from "./data/operations"

type State = {
  runs: ChecklistRun[]
  goals: Goal[]
  /** Current user's self-review drafts/submissions per cycle. */
  selfReview: { "half-year": Record<string, Rating>; annual: Record<string, Rating> }
  selfSubmitted: { "half-year": boolean; annual: boolean }
  /** Manager scores per team member per goal. */
  managerScores: Record<string, Record<string, Rating>>
  /** Manager's overall rating per team member (team view, 4126:14560). */
  managerOverall: Record<string, Rating>
  /** Team members whose evaluation the manager has submitted. */
  evaluated: string[]
  schedule: ScheduleEntry[]
}

let state: State = {
  runs: initialRuns,
  goals: initialGoals,
  selfReview: { "half-year": { g1: 4 }, annual: { g1: 5 } },
  selfSubmitted: { "half-year": false, annual: false },
  managerScores: initialManagerScores,
  managerOverall: { t4: 5 },
  evaluated: ["t4"],
  schedule: initialSchedule,
}

const listeners = new Set<() => void>()
function set(patch: Partial<State>) {
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}
function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useOps<T>(selector: (s: State) => T): T {
  return React.useSyncExternalStore(subscribe, () => selector(state))
}

// ── checklist runs ───────────────────────────────────────────────────────────
export function createRun(templateId: string, loungeId: string, date: string): string {
  const id = `r${Date.now()}`
  set({ runs: [{ id, templateId, loungeId, date, reviewer: null, status: "pending", answers: {} }, ...state.runs] })
  return id
}

export function completeRun(id: string, answers: Record<string, Answer>, reviewer: L, date: string) {
  set({
    runs: state.runs.map((r) => (r.id === id ? { ...r, answers, reviewer, date, status: "completed" } : r)),
  })
}

// ── goals ────────────────────────────────────────────────────────────────────
export function upsertGoal(goal: Goal) {
  const exists = state.goals.some((g) => g.id === goal.id)
  set({ goals: exists ? state.goals.map((g) => (g.id === goal.id ? goal : g)) : [...state.goals, goal] })
}

// ── reviews ──────────────────────────────────────────────────────────────────
export function saveSelfReview(cycle: "half-year" | "annual", scores: Record<string, Rating>, submit: boolean) {
  set({
    selfReview: { ...state.selfReview, [cycle]: scores },
    selfSubmitted: { ...state.selfSubmitted, [cycle]: submit || state.selfSubmitted[cycle] },
  })
}

export function saveManagerScores(
  memberId: string,
  scores: Record<string, Rating>,
  submit: boolean,
  overall?: Rating,
) {
  set({
    managerScores: { ...state.managerScores, [memberId]: scores },
    managerOverall: overall ? { ...state.managerOverall, [memberId]: overall } : state.managerOverall,
    evaluated: submit && !state.evaluated.includes(memberId) ? [...state.evaluated, memberId] : state.evaluated,
  })
}

export function saveTeamOverall(overall: Record<string, Rating>, submitIds: string[]) {
  set({
    managerOverall: { ...state.managerOverall, ...overall },
    evaluated: [...new Set([...state.evaluated, ...submitIds])],
  })
}

// ── delegation ───────────────────────────────────────────────────────────────
export function addScheduleEntry(entry: ScheduleEntry) {
  set({ schedule: [entry, ...state.schedule] })
}
