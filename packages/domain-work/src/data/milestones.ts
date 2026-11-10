import * as React from "react"

import { reportedProgress, type Task, TASK_TODAY_ISO } from "./tasks"

/** Milestones break a project into dated checkpoints. Tasks sit under one, and
 *  each milestone reports red, amber or green — worked out from its tasks and
 *  its dates, unless a manager has set it by hand with a reason.
 *  Demo store; a real build keeps these beside the project table. */

export type Rag = "green" | "amber" | "red"
/** RAG plus the two states that are not a judgement: finished, and not begun. */
export type Health = Rag | "complete" | "not-started"

export type Milestone = {
  id: string
  projectId: string
  /** Numbered within its project and never reused: MS-01, MS-02… */
  code: string
  name: string; nameAr: string
  startISO: string
  dueISO: string
  description?: string; descriptionAr?: string
  /** A manager's call that overrides the calculated colour, with the reason. */
  ragOverride?: Rag
  ragReason?: string
  /** Removed milestones are kept, not deleted; their tasks fall back to the project. */
  archived?: boolean
}

export const HEALTH: Record<Health, { en: string; ar: string; dot: string; chip: string; bar: string }> = {
  green:         { en: "On track",    ar: "على المسار",   dot: "bg-success", bar: "bg-success", chip: "border-transparent bg-success-fill text-success" },
  amber:         { en: "At risk",     ar: "معرّض للخطر",  dot: "bg-warning",   bar: "bg-warning",   chip: "border-transparent bg-warning-fill text-warning" },
  red:           { en: "Off track",   ar: "متعثّر",        dot: "bg-error",    bar: "bg-error",    chip: "border-transparent bg-error-fill text-error" },
  complete:      { en: "Complete",    ar: "مكتمل",         dot: "bg-info",     bar: "bg-info",     chip: "border-transparent bg-info-fill text-info" },
  "not-started": { en: "Not started", ar: "لم يبدأ",       dot: "bg-muted-foreground/40", bar: "bg-muted-foreground/40", chip: "border-transparent bg-secondary text-muted-foreground" },
}

const SEED: Milestone[] = [
  // Digital Workplace
  { id: "m-p1-1", projectId: "p1", code: "MS-01", name: "Requirements & UAT sign-off", nameAr: "اعتماد المتطلبات واختبار القبول",
    startISO: "2026-07-01", dueISO: "2026-08-10",
    description: "Leave module walkthrough and the second batch of UAT findings closed.",
    descriptionAr: "استعراض وحدة الإجازات وإغلاق الدفعة الثانية من ملاحظات اختبار القبول." },
  { id: "m-p1-2", projectId: "p1", code: "MS-02", name: "Release 1 build", nameAr: "بناء الإصدار الأول",
    startISO: "2026-07-20", dueISO: "2026-08-20",
    description: "Services copy, the attendance dashboard model and the rest of the Release 1 scope.",
    descriptionAr: "نصوص الخدمات ونموذج لوحة الحضور وبقية نطاق الإصدار الأول." },
  { id: "m-p1-3", projectId: "p1", code: "MS-03", name: "Wave 2 rollout", nameAr: "إطلاق الموجة الثانية",
    startISO: "2026-08-10", dueISO: "2026-09-30",
    description: "Rollout deck, comms and the second wave of departments.",
    descriptionAr: "عرض الإطلاق والتواصل والموجة الثانية من الإدارات." },
  { id: "m-p1-4", projectId: "p1", code: "MS-04", name: "Go-live readiness", nameAr: "جاهزية الإطلاق",
    startISO: "2026-10-01", dueISO: "2026-12-20" },

  // Operations · Q3
  { id: "m-p2-1", projectId: "p2", code: "MS-01", name: "September roster & schedule ramp", nameAr: "جدول سبتمبر وزيادة الرحلات",
    startISO: "2026-07-15", dueISO: "2026-08-20" },
  { id: "m-p2-2", projectId: "p2", code: "MS-02", name: "Throughput model & reporting", nameAr: "نموذج الحركة والتقارير",
    startISO: "2026-07-20", dueISO: "2026-08-31" },

  // Capital Projects
  { id: "m-p6-1", projectId: "p6", code: "MS-01", name: "Terminal expansion — phase 2", nameAr: "توسعة المبنى — المرحلة الثانية",
    startISO: "2026-03-01", dueISO: "2026-07-31" },
  { id: "m-p6-2", projectId: "p6", code: "MS-02", name: "VIP lounge renovation scope", nameAr: "نطاق تجديد صالة كبار الضيوف",
    startISO: "2026-07-01", dueISO: "2026-08-20",
    // the calculation says red (the scope sign-off is past due); the manager knows better
    ragOverride: "amber",
    ragReason: "Scope agreed with the contractor on 9 Aug; formal sign-off is booked for 14 Aug." },
]

let milestones: Milestone[] = SEED
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l) }

export const useMilestones = () => React.useSyncExternalStore(subscribe, () => milestones)
export const getMilestone = (id?: string) => milestones.find((m) => m.id === id)
export const milestonesFor = (projectId: string) =>
  milestones
    .filter((m) => m.projectId === projectId && !m.archived)
    .sort((a, b) => a.dueISO.localeCompare(b.dueISO))

export const newMilestoneId = () => `m-${Date.now().toString(36)}`
/** Codes count up within a project, including archived ones, so none is reused. */
export const nextMilestoneCode = (projectId: string) => {
  const n = milestones
    .filter((m) => m.projectId === projectId)
    .reduce((max, m) => Math.max(max, Number(m.code.replace(/\D/g, "")) || 0), 0)
  return `MS-${String(n + 1).padStart(2, "0")}`
}

export function addMilestone(m: Milestone) {
  milestones = [...milestones, m]
  record(m.id, "created", `${m.code} · ${m.name}`)
  emit()
}
export function updateMilestone(id: string, patch: Partial<Milestone>) {
  const before = getMilestone(id)
  milestones = milestones.map((m) => (m.id === id ? { ...m, ...patch } : m))
  const after = getMilestone(id)
  if (before && after) {
    if (before.ragOverride !== after.ragOverride) {
      record(id, after.ragOverride ? `set ${after.ragOverride}` : "RAG back to automatic",
        after.ragReason ?? "")
    }
    record(id, "updated", `${after.code} · ${after.name}`)
  }
  emit()
}
export function archiveMilestone(id: string) {
  milestones = milestones.map((m) => (m.id === id ? { ...m, archived: true } : m))
  const m = getMilestone(id)
  if (m) record(id, "removed", `${m.code} · ${m.name}`)
  emit()
}

// ── the calculation ─────────────────────────────────────────────────────────
const DAY = 86_400_000
const at = (iso: string) => new Date(`${iso}T00:00:00`).getTime()

/** A task's share of done: finished is 100, otherwise the last percentage
 *  someone reported, with a modest default once work has begun. */
export const taskProgress = (t: Task) =>
  t.status === "completed" ? 100
    : reportedProgress(t.id) ?? (t.status === "in-review" ? 80 : t.status === "in-progress" || t.status === "on-hold" ? 25 : 0)

export type HealthReport = {
  health: Health
  /** What the numbers alone say, before any manual override. */
  calculated: Health
  reason: string; reasonAr: string
  pct: number
  total: number; done: number; overdue: number
  overridden: boolean
}

export function milestoneHealth(m: Milestone, allTasks: Task[], today = TASK_TODAY_ISO): HealthReport {
  const tasks = allTasks.filter((t) => t.milestoneId === m.id)
  const total = tasks.length
  const done = tasks.filter((t) => t.status === "completed").length
  const overdue = tasks.filter((t) => t.status !== "completed" && t.dueISO < today).length
  const pct = total ? Math.round(tasks.reduce((s, t) => s + taskProgress(t), 0) / total) : 0

  const span = Math.max(DAY, at(m.dueISO) - at(m.startISO))
  const elapsed = Math.min(100, Math.max(0, Math.round(((at(today) - at(m.startISO)) / span) * 100)))
  const daysLeft = Math.round((at(m.dueISO) - at(today)) / DAY)

  let calculated: Health
  let reason: string, reasonAr: string
  if (total === 0) {
    calculated = "not-started"
    reason = "No tasks under this milestone yet."
    reasonAr = "لا توجد مهام تحت هذا المعلم بعد."
  } else if (done === total) {
    calculated = "complete"
    reason = "Every task is done."
    reasonAr = "اكتملت جميع المهام."
  } else if (m.dueISO < today) {
    calculated = "red"
    reason = `Due date passed with ${total - done} task${total - done === 1 ? "" : "s"} still open.`
    reasonAr = `انقضى الموعد و${total - done} مهمة ما زالت مفتوحة.`
  } else if (overdue > 0) {
    calculated = "red"
    reason = `${overdue} task${overdue === 1 ? " is" : "s are"} overdue.`
    reasonAr = `${overdue} مهمة متأخرة.`
  } else if (elapsed - pct > 25) {
    calculated = "amber"
    reason = `${pct}% done with ${elapsed}% of the time used.`
    reasonAr = `إنجاز ${pct}٪ مقابل انقضاء ${elapsed}٪ من المدة.`
  } else if (daysLeft <= 7 && pct < 75) {
    calculated = "amber"
    reason = `Due in ${daysLeft} day${daysLeft === 1 ? "" : "s"} at ${pct}% done.`
    reasonAr = `يستحق خلال ${daysLeft} يوم والإنجاز ${pct}٪.`
  } else {
    calculated = "green"
    reason = `${pct}% done with ${elapsed}% of the time used.`
    reasonAr = `إنجاز ${pct}٪ مقابل انقضاء ${elapsed}٪ من المدة.`
  }

  const overridden = !!m.ragOverride
  return {
    health: m.ragOverride ?? calculated,
    calculated,
    reason: overridden ? (m.ragReason ?? "") : reason,
    reasonAr: overridden ? (m.ragReason ?? "") : reasonAr,
    pct, total, done, overdue, overridden,
  }
}

/** A project is as healthy as its worst live milestone. */
export function projectHealth(projectId: string, allTasks: Task[]): Health | undefined {
  const ms = milestonesFor(projectId)
  if (ms.length === 0) return undefined
  const hs = ms.map((m) => milestoneHealth(m, allTasks).health)
  for (const h of ["red", "amber", "green"] as Health[]) if (hs.includes(h)) return h
  return hs.every((h) => h === "complete") ? "complete" : "not-started"
}

export const countHealth = (projectId: string, allTasks: Task[]) => {
  const out: Record<Health, number> = { green: 0, amber: 0, red: 0, complete: 0, "not-started": 0 }
  milestonesFor(projectId).forEach((m) => { out[milestoneHealth(m, allTasks).health] += 1 })
  return out
}

// ── the trail ───────────────────────────────────────────────────────────────
export type MilestoneLog = { id: string; milestoneId: string; action: string; detail: string; at: string }
let log: MilestoneLog[] = []
export const useMilestoneLog = () => React.useSyncExternalStore(subscribe, () => log)
function record(milestoneId: string, action: string, detail: string) {
  log = [{
    id: `ml-${Date.now().toString(36)}-${log.length}`, milestoneId, action, detail,
    at: new Date().toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
  }, ...log]
}
