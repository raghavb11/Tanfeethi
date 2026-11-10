import * as React from "react"

import { getTasks, moveUnfinishedTasks, shiftISO, TASK_TODAY_ISO } from "./tasks"
import { allProjects } from "./projects"

/** Sprints are a master: tasks (and projects) point at one by id. Managers
 *  define them on /sprints; everyone else reads them and plans tasks into them.
 *  Demo-only in-memory store, the same pattern as data/tasks.ts. */

export type Sprint = {
  id: string
  /** "SPR-24" — the master numbers itself. */
  code: string
  name: string; nameAr: string
  startISO: string
  endISO: string
  goal?: string; goalAr?: string
  /** Set when a manager closes the sprint (the day it was closed). */
  closedISO?: string
  /** Hidden from every list, never deleted (BUILD-GUIDELINES L2). */
  archived?: boolean
}

export type SprintStatus = "planned" | "active" | "completed"

/** Three consecutive two-week sprints, Sunday to Saturday; the prototype's
 *  "today" (12 Aug 2026) falls in Sprint 24. Ids stay s23/s24/s25 so the seeded
 *  tasks and projects keep their sprint. */
const SEED: Sprint[] = [
  { id: "s23", code: "SPR-23", name: "Sprint 23", nameAr: "سبرنت 23", startISO: "2026-07-19", endISO: "2026-08-01", closedISO: "2026-08-01",
    goal: "Close the Q2 operations reporting and the terminal expansion milestone.",
    goalAr: "إغلاق تقارير عمليات الربع الثاني ومعلم توسعة المبنى." },
  { id: "s24", code: "SPR-24", name: "Sprint 24", nameAr: "سبرنت 24", startISO: "2026-08-02", endISO: "2026-08-15",
    goal: "Ship the Q2 executive brief, clear the safety audit findings and prepare the Wave 2 rollout.",
    goalAr: "تسليم الموجز التنفيذي للربع الثاني، وإغلاق ملاحظات تدقيق السلامة، والتحضير لإطلاق الموجة الثانية." },
  { id: "s25", code: "SPR-25", name: "Sprint 25", nameAr: "سبرنت 25", startISO: "2026-08-16", endISO: "2026-08-29",
    goal: "Vendor renewals and the September schedule ramp.",
    goalAr: "تجديد عقود الموردين وزيادة جدول سبتمبر." },
]

let sprints: Sprint[] = SEED
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l) }
const byStart = (a: Sprint, b: Sprint) => a.startISO.localeCompare(b.startISO)

/** Every sprint, archived included (subscribe for the archive view). */
export function useAllSprints(): Sprint[] {
  return React.useSyncExternalStore(subscribe, () => sprints)
}
/** The live (non-archived) sprints, by start date. */
export function useSprints(): Sprint[] {
  const all = useAllSprints()
  return React.useMemo(() => liveSprints(all), [all])
}
const liveSprints = (list: Sprint[]) => list.filter((s) => !s.archived).sort(byStart)
export const getSprints = () => liveSprints(sprints)

export const sprintById = (id?: string) => (id ? sprints.find((s) => s.id === id) : undefined)
export const sprintName = (s: Sprint | undefined, isAr: boolean) => (s ? (isAr ? s.nameAr : s.name) : "")

export function sprintStatus(s: Sprint, today = TASK_TODAY_ISO): SprintStatus {
  if (s.closedISO || s.endISO < today) return "completed"
  return s.startISO <= today ? "active" : "planned"
}

/** The sprint the board opens on: the active one; if none (the last one was
 *  closed early, or there is a gap) the next planned sprint once the latest
 *  started one has been closed, otherwise the latest started one. */
export function currentSprintId(today = TASK_TODAY_ISO): string {
  const live = getSprints()
  const active = live.find((s) => sprintStatus(s, today) === "active")
  if (active) return active.id
  const started = live.filter((s) => s.startISO <= today)
  const latest = started[started.length - 1]
  const next = live.find((s) => sprintStatus(s, today) === "planned")
  if (latest?.closedISO && next) return next.id
  return latest?.id ?? next?.id ?? ""
}

/** For a sprint picker: planned and active first (soonest first), completed after (newest first). */
export function sprintsForPicking(list: Sprint[]): Sprint[] {
  const open = list.filter((s) => sprintStatus(s) !== "completed")
  const done = list.filter((s) => sprintStatus(s) === "completed").reverse()
  return [...open, ...done]
}

const codeNumber = (code: string) => Number(code.replace(/\D+/g, "")) || 0
/** Next code in sequence — counts archived sprints too, so a code is never reused. */
export const nextSprintCode = () =>
  `SPR-${Math.max(0, ...sprints.map((s) => codeNumber(s.code))) + 1}`
export const newSprintId = () => `s-${Date.now().toString(36)}`

/** What a new sprint starts as: the next code, the day after the latest sprint
 *  ends, two weeks long, named after its number. */
export function blankSprint(): Omit<Sprint, "id"> {
  const live = getSprints()
  const lastEnd = live.reduce((m, s) => (s.endISO > m ? s.endISO : m), "")
  const startISO = lastEnd ? shiftISO(lastEnd, 1) : TASK_TODAY_ISO
  const code = nextSprintCode()
  const n = codeNumber(code)
  return { code, name: `Sprint ${n}`, nameAr: `سبرنت ${n}`, startISO, endISO: shiftISO(startISO, 13), goal: "", goalAr: "" }
}

/** The first live sprint (other than `exceptId`) whose dates overlap [startISO, endISO]. */
export function overlappingSprint(startISO: string, endISO: string, exceptId?: string): Sprint | undefined {
  return getSprints().find((s) => s.id !== exceptId && startISO <= s.endISO && endISO >= s.startISO)
}

/** Another live sprint already using this name, in either language. */
export function sprintWithName(name: string, exceptId?: string): Sprint | undefined {
  const n = name.trim().toLowerCase()
  if (!n) return undefined
  return getSprints().find((s) => s.id !== exceptId && (s.name.trim().toLowerCase() === n || s.nameAr.trim().toLowerCase() === n))
}

export function addSprint(s: Sprint) {
  sprints = [...sprints, s]
  emit()
}
export function updateSprint(id: string, patch: Partial<Sprint>) {
  sprints = sprints.map((s) => (s.id === id ? { ...s, ...patch } : s))
  emit()
}

/** Close a sprint today; its unfinished tasks move to `moveTo` (or stay). Returns how many moved. */
export function closeSprint(id: string, moveTo?: string): number {
  const moved = moveTo && moveTo !== id && sprintById(moveTo) ? moveUnfinishedTasks(id, moveTo) : 0
  updateSprint(id, { closedISO: TASK_TODAY_ISO })
  return moved
}

/** Why a sprint cannot be archived yet, or undefined when it can. */
export function archiveBlocker(id: string): { tasks: number; projects: number } | undefined {
  const tasks = getTasks().filter((t) => t.sprint === id).length
  const projects = allProjects().filter((p) => p.sprint === id).length
  return tasks || projects ? { tasks, projects } : undefined
}

/** Archive (never delete) — only once nothing is planned in the sprint. */
export function archiveSprint(id: string): { ok: true } | { ok: false; tasks: number; projects: number } {
  const blocked = archiveBlocker(id)
  if (blocked) return { ok: false, ...blocked }
  updateSprint(id, { archived: true })
  return { ok: true }
}

/** Bring an archived sprint back, unless its dates now clash with a live one. */
export function restoreSprint(id: string): { ok: true } | { ok: false; clash: Sprint } {
  const s = sprintById(id)
  if (!s) return { ok: true }
  const clash = overlappingSprint(s.startISO, s.endISO, id)
  if (clash) return { ok: false, clash }
  updateSprint(id, { archived: false })
  return { ok: true }
}

/** Calendar days from `a` to `b` (b − a). */
export const daysBetween = (a: string, b: string) =>
  Math.round((new Date(`${b}T00:00:00`).getTime() - new Date(`${a}T00:00:00`).getTime()) / 86_400_000)

/** "2 Aug – 15 Aug 2026" / "2 أغسطس – 15 أغسطس 2026". */
export function sprintRange(s: { startISO: string; endISO: string }, isAr: boolean) {
  const loc = isAr ? "ar-EG-u-nu-latn" : "en-GB"
  const f = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString(loc, { day: "numeric", month: "short" })
  if (!s.startISO || !s.endISO) return ""
  return `${f(s.startISO)} – ${f(s.endISO)} ${s.endISO.slice(0, 4)}`
}

export const SPRINT_STATUS: Record<SprintStatus, { en: string; ar: string; chip: string }> = {
  planned: { en: "Planned", ar: "مخطط", chip: "bg-secondary text-muted-foreground" },
  active: { en: "Active", ar: "نشط", chip: "bg-info-fill text-info" },
  completed: { en: "Completed", ar: "مكتمل", chip: "bg-success-fill text-success" },
}

/** "4 days" / "4 أيام" — Arabic counts take their proper noun form. */
export function dayCount(n: number, isAr: boolean) {
  if (!isAr) return `${n} ${n === 1 ? "day" : "days"}`
  if (n === 1) return "يوم واحد"
  if (n === 2) return "يومان"
  if (n >= 3 && n <= 10) return `${n} أيام`
  return `${n} يومًا`
}
