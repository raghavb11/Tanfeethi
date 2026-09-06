import * as React from "react"

/** Manager dashboard fixtures — the team view for a line manager.
 *  WBS 4.9 / SOW Phase 3. Demo-only; a real build reads Oracle HRMS. */

export type TodayState = "present" | "remote" | "leave" | "late" | "absent"

export type Report = {
  id: string
  name: string
  nameAr: string
  initials: string
  title: string
  titleAr: string
  state: TodayState
  checkIn?: string
  location: string
  locationAr: string
  openTasks: number
  overdue: number
  utilisation: number
  leaveBalance: number
}

export const team: Report[] = [
  { id: "r1", name: "Sara Al-Mutairi", nameAr: "سارة المطيري", initials: "SM", title: "Senior Business Analyst", titleAr: "محللة أعمال أولى", state: "present", checkIn: "08:12", location: "HQ · L14", locationAr: "المقر · ط14", openTasks: 7, overdue: 1, utilisation: 86, leaveBalance: 14 },
  { id: "r2", name: "Mohammad Iqbal", nameAr: "محمد إقبال", initials: "MI", title: "Operations Lead", titleAr: "قائد العمليات", state: "present", checkIn: "07:48", location: "Terminal 2", locationAr: "الصالة 2", openTasks: 11, overdue: 3, utilisation: 94, leaveBalance: 6 },
  { id: "r3", name: "Layan Al Marwani", nameAr: "ليان المرواني", initials: "LM", title: "Business Analyst", titleAr: "محللة أعمال", state: "remote", checkIn: "08:35", location: "Remote", locationAr: "عن بُعد", openTasks: 5, overdue: 0, utilisation: 71, leaveBalance: 19 },
  { id: "r4", name: "Noura Saleh", nameAr: "نورة صالح", initials: "NS", title: "Service Coordinator", titleAr: "منسقة خدمات", state: "leave", location: "Annual leave", locationAr: "إجازة سنوية", openTasks: 2, overdue: 0, utilisation: 0, leaveBalance: 3 },
  { id: "r5", name: "Faisal Al-Harbi", nameAr: "فيصل الحربي", initials: "FH", title: "Operations Officer", titleAr: "مسؤول عمليات", state: "late", checkIn: "09:41", location: "Terminal 1", locationAr: "الصالة 1", openTasks: 9, overdue: 2, utilisation: 88, leaveBalance: 11 },
  { id: "r6", name: "Saud Al-Dosari", nameAr: "سعود الدوسري", initials: "SD", title: "Lounge Supervisor", titleAr: "مشرف الصالة", state: "present", checkIn: "06:55", location: "HQ · Ground", locationAr: "المقر · الأرضي", openTasks: 4, overdue: 0, utilisation: 63, leaveBalance: 21 },
  { id: "r7", name: "Reem Al-Otaibi", nameAr: "ريم العتيبي", initials: "RO", title: "Data Analyst", titleAr: "محللة بيانات", state: "present", checkIn: "08:02", location: "HQ · L12", locationAr: "المقر · ط12", openTasks: 6, overdue: 0, utilisation: 78, leaveBalance: 17 },
  { id: "r8", name: "Turki Al-Shehri", nameAr: "تركي الشهري", initials: "TS", title: "Operations Officer", titleAr: "مسؤول عمليات", state: "absent", location: "Not checked in", locationAr: "لم يسجّل حضور", openTasks: 3, overdue: 1, utilisation: 0, leaveBalance: 9 },
]

// ── approvals waiting on this manager ────────────────────────────────────────
export type ApprovalKind = "leave" | "expense" | "overtime" | "letter" | "purchase"
export type ApprovalState = "Pending" | "Approved" | "Returned"

export type Approval = {
  id: string
  ref: string
  who: string
  whoAr: string
  initials: string
  kind: ApprovalKind
  title: string
  titleAr: string
  detail: string
  detailAr: string
  /** SAR, where the request carries an amount. */
  amount?: number
  submitted: string
  submittedAr: string
  ageDays: number
  state: ApprovalState
}

const SEED_APPROVALS: Approval[] = [
  { id: "ap1", ref: "LV-3312", who: "Sara Al-Mutairi", whoAr: "سارة المطيري", initials: "SM", kind: "leave", title: "Annual leave", titleAr: "إجازة سنوية", detail: "24 – 28 Aug · 5 days", detailAr: "24 – 28 أغسطس · 5 أيام", submitted: "1 day ago", submittedAr: "قبل يوم", ageDays: 1, state: "Pending" },
  { id: "ap2", ref: "EX-8841", who: "Mohammad Iqbal", whoAr: "محمد إقبال", initials: "MI", kind: "expense", title: "Expense claim", titleAr: "مطالبة مصروفات", detail: "Client lunch · Riyadh", detailAr: "غداء عميل · الرياض", amount: 1150, submitted: "2 days ago", submittedAr: "قبل يومين", ageDays: 2, state: "Pending" },
  { id: "ap3", ref: "OT-1207", who: "Layan Al Marwani", whoAr: "ليان المرواني", initials: "LM", kind: "overtime", title: "Overtime request", titleAr: "طلب عمل إضافي", detail: "6 hrs · 9 Aug (weekend)", detailAr: "6 ساعات · 9 أغسطس (نهاية الأسبوع)", submitted: "3 days ago", submittedAr: "قبل 3 أيام", ageDays: 3, state: "Pending" },
  { id: "ap4", ref: "PR-2290", who: "Faisal Al-Harbi", whoAr: "فيصل الحربي", initials: "FH", kind: "purchase", title: "Purchase request", titleAr: "طلب شراء", detail: "Ground handling radios ×4", detailAr: "أجهزة اتصال المناولة ×4", amount: 28400, submitted: "5 days ago", submittedAr: "قبل 5 أيام", ageDays: 5, state: "Pending" },
  { id: "ap5", ref: "LT-0765", who: "Reem Al-Otaibi", whoAr: "ريم العتيبي", initials: "RO", kind: "letter", title: "Salary certificate", titleAr: "شهادة راتب", detail: "For a bank application", detailAr: "لتقديمها إلى البنك", submitted: "6 hours ago", submittedAr: "قبل 6 ساعات", ageDays: 0, state: "Pending" },
  { id: "ap6", ref: "LV-3301", who: "Saud Al-Dosari", whoAr: "سعود الدوسري", initials: "SD", kind: "leave", title: "Annual leave", titleAr: "إجازة سنوية", detail: "2 – 4 Sep · 3 days", detailAr: "2 – 4 سبتمبر · 3 أيام", submitted: "Yesterday", submittedAr: "أمس", ageDays: 1, state: "Approved" },
]

// ── team leave, next 30 days ─────────────────────────────────────────────────
export const upcomingLeave: { id: string; who: string; whoAr: string; initials: string; range: string; rangeAr: string; days: number; type: string; typeAr: string; approved: boolean }[] = [
  { id: "ul1", who: "Noura Saleh", whoAr: "نورة صالح", initials: "NS", range: "Now – 4 Sep", rangeAr: "الآن – 4 سبتمبر", days: 4, type: "Annual", typeAr: "سنوية", approved: true },
  { id: "ul2", who: "Saud Al-Dosari", whoAr: "سعود الدوسري", initials: "SD", range: "2 – 4 Sep", rangeAr: "2 – 4 سبتمبر", days: 3, type: "Annual", typeAr: "سنوية", approved: true },
  { id: "ul3", who: "Sara Al-Mutairi", whoAr: "سارة المطيري", initials: "SM", range: "24 – 28 Sep", rangeAr: "24 – 28 سبتمبر", days: 5, type: "Annual", typeAr: "سنوية", approved: false },
  { id: "ul4", who: "Reem Al-Otaibi", whoAr: "ريم العتيبي", initials: "RO", range: "29 Sep", rangeAr: "29 سبتمبر", days: 1, type: "Personal", typeAr: "شخصية", approved: true },
]

/** Days in September where two or more people are away at once. */
export const leaveClashes: { date: string; dateAr: string; who: string[] }[] = [
  { date: "2 – 4 Sep", dateAr: "2 – 4 سبتمبر", who: ["Noura Saleh", "Saud Al-Dosari"] },
]

// ── attendance trend, this month ─────────────────────────────────────────────
export const attendanceTrend = {
  monthLabel: "August 2026",
  monthLabelAr: "أغسطس 2026",
  onTimePct: 91,
  lastMonthPct: 87,
  avgHours: 8.1,
  lateInstances: 6,
  remotePct: 22,
  /** Per working day of the current week: Sun–Thu. */
  week: [
    { day: "Sun", dayAr: "الأحد", present: 7, remote: 1, leave: 0, absent: 0 },
    { day: "Mon", dayAr: "الاثنين", present: 6, remote: 1, leave: 1, absent: 0 },
    { day: "Tue", dayAr: "الثلاثاء", present: 5, remote: 2, leave: 1, absent: 0 },
    { day: "Wed", dayAr: "الأربعاء", present: 6, remote: 1, leave: 1, absent: 0 },
    { day: "Thu", dayAr: "الخميس", present: 5, remote: 1, leave: 1, absent: 1 },
  ],
}

export const headcount = { budgeted: 10, filled: 8, openRoles: 2, probation: 1 }

// ── reactive store ───────────────────────────────────────────────────────────
let approvals: Approval[] = SEED_APPROVALS
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l) }

export function useApprovals(): Approval[] {
  return React.useSyncExternalStore(subscribe, () => approvals)
}
/** Decisions are state changes — nothing is removed from the list. */
export function decideApproval(id: string, state: ApprovalState, comment?: string) {
  const a = approvals.find((x) => x.id === id)
  approvals = approvals.map((x) => (x.id === id ? { ...x, state } : x))
  emit()
  if (a) logManager(state === "Approved" ? "approved" : "returned", `${a.ref} · ${a.title}`, comment)
}

export const stateOf = (r: Report) => r.state

// ── audit ────────────────────────────────────────────────────────────────────
export type ManagerAudit = { id: string; action: string; target: string; comment?: string; who: string; time: string }
let auditLog: ManagerAudit[] = [
  { id: "m1", action: "approved", target: "LV-3301 · Annual leave", who: "Khalid A.", time: "Yesterday · 16:20" },
]
export const useManagerAudit = () => React.useSyncExternalStore(subscribe, () => auditLog)
function logManager(action: string, target: string, comment?: string) {
  auditLog = [{ id: `m-${Date.now().toString(36)}`, action, target, comment, who: "Khalid A.", time: "Just now" }, ...auditLog]
}

/** SAR with Saudi/international grouping — never lakh/crore. */
export const sar = (n: number, isAr: boolean) =>
  isAr ? `${n.toLocaleString("en-US")} ر.س` : `SAR ${n.toLocaleString("en-US")}`
