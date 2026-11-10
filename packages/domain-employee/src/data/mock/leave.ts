import * as React from "react"

/** Leave entitlements, requests and holidays for the Leave Balances page.
 *  Demo-only fixtures — a real build reads these from the HR system. */

export type LeaveTypeId = "annual" | "sick" | "personal" | "unpaid" | "hajj"
export type LeaveType = {
  id: LeaveTypeId
  name: string; nameAr: string
  entitled: number
  used: number
  pending: number
  /** Days that expire if unused by the carry-over deadline. */
  expiring?: number
  accrual: string; accrualAr: string
  color: string
}

export const LEAVE_TYPES: LeaveType[] = [
  { id: "annual", name: "Annual leave", nameAr: "إجازة سنوية", entitled: 22, used: 4, pending: 5, expiring: 3, accrual: "1.83 days / month", accrualAr: "١٫٨٣ يوم / شهر", color: "#c8794f" },
  { id: "sick", name: "Sick leave", nameAr: "إجازة مرضية", entitled: 14, used: 1, pending: 0, accrual: "Full pay first 30 days", accrualAr: "أجر كامل لأول ٣٠ يومًا", color: "#5b8fce" },
  { id: "personal", name: "Personal leave", nameAr: "إجازة شخصية", entitled: 5, used: 0, pending: 0, accrual: "Resets each year", accrualAr: "تُجدد سنويًا", color: "#5f9d52" },
  { id: "hajj", name: "Hajj leave", nameAr: "إجازة حج", entitled: 10, used: 0, pending: 0, accrual: "Once per service period", accrualAr: "مرة واحدة خلال الخدمة", color: "#8e6bc9" },
  { id: "unpaid", name: "Unpaid leave", nameAr: "إجازة بدون راتب", entitled: 30, used: 0, pending: 0, accrual: "Subject to approval", accrualAr: "تخضع للموافقة", color: "#8a8a8a" },
]

export const remaining = (t: LeaveType) => t.entitled - t.used - t.pending

export type RequestStatus = "Approved" | "Pending" | "Rejected" | "Cancelled"
export type LeaveRequest = {
  id: string
  type: LeaveTypeId
  from: string; fromAr: string
  to: string; toAr: string
  days: number
  submitted: string; submittedAr: string
  status: RequestStatus
  approver: string; approverAr: string
  reason?: string; reasonAr?: string
  /** Colleague covering while away ("الموظف المناب عنك"). */
  delegate?: string; delegateAr?: string
  attachments?: string[]
}

/** Leave types that must carry a supporting document. */
export const NEEDS_ATTACHMENT: LeaveTypeId[] = ["sick", "hajj"]

const SEED_REQUESTS: LeaveRequest[] = [
  { id: "lr1", type: "annual", from: "Sep 14, 2026", fromAr: "14 سبتمبر", to: "Sep 18, 2026", toAr: "18 سبتمبر", days: 5, submitted: "Apr 2, 2026", submittedAr: "2 أبريل", status: "Approved", approver: "Amani Al-Harthi", approverAr: "أماني الحارثي", reason: "Family trip", reasonAr: "رحلة عائلية" },
  { id: "lr2", type: "annual", from: "May 12, 2026", fromAr: "12 مايو", to: "May 16, 2026", toAr: "16 مايو", days: 5, submitted: "Apr 20, 2026", submittedAr: "20 أبريل", status: "Pending", approver: "Amani Al-Harthi", approverAr: "أماني الحارثي", reason: "Personal travel", reasonAr: "سفر شخصي" },
  { id: "lr6", type: "personal", from: "Jun 4, 2026", fromAr: "4 يونيو", to: "Jun 4, 2026", toAr: "4 يونيو", days: 1, submitted: "Apr 26, 2026", submittedAr: "26 أبريل", status: "Pending", approver: "Amani Al-Harthi", approverAr: "أماني الحارثي", reason: "Family occasion", reasonAr: "مناسبة عائلية" },
  { id: "lr3", type: "sick", from: "Apr 7, 2026", fromAr: "7 أبريل", to: "Apr 7, 2026", toAr: "7 أبريل", days: 1, submitted: "Apr 7, 2026", submittedAr: "7 أبريل", status: "Approved", approver: "Amani Al-Harthi", approverAr: "أماني الحارثي", reason: "Medical appointment", reasonAr: "موعد طبي" },
  { id: "lr4", type: "annual", from: "Mar 9, 2026", fromAr: "9 مارس", to: "Mar 11, 2026", toAr: "11 مارس", days: 3, submitted: "Feb 20, 2026", submittedAr: "20 فبراير", status: "Approved", approver: "Amani Al-Harthi", approverAr: "أماني الحارثي" },
  { id: "lr5", type: "personal", from: "Jan 22, 2026", fromAr: "22 يناير", to: "Jan 22, 2026", toAr: "22 يناير", days: 1, submitted: "Jan 15, 2026", submittedAr: "15 يناير", status: "Rejected", approver: "Amani Al-Harthi", approverAr: "أماني الحارثي", reason: "Clashes with audit week", reasonAr: "يتعارض مع أسبوع التدقيق" },
]

export const HOLIDAYS = [
  { id: "h1", name: "Eid Al-Adha", nameAr: "عيد الأضحى", date: "May 26 – 29, 2026", dateAr: "26 – 29 مايو", start: "May 26", startAr: "26 مايو", days: 4 },
  { id: "h2", name: "Saudi National Day", nameAr: "اليوم الوطني السعودي", date: "Sep 23, 2026", dateAr: "23 سبتمبر", start: "Sep 23", startAr: "23 سبتمبر", days: 1 },
  { id: "h3", name: "Founding Day", nameAr: "يوم التأسيس", date: "Feb 22, 2027", dateAr: "22 فبراير", start: "Feb 22", startAr: "22 فبراير", days: 1 },
]

/** Colleagues away in the next fortnight — shown as a team-cover check. */
export const TEAM_AWAY = [
  { id: "u-lina", name: "Lina Al-Harbi", nameAr: "لينا الحربي", initials: "LH", range: "May 3 – 7", rangeAr: "3 – 7 مايو", from: "2026-05-03", to: "2026-05-07", type: "annual" as LeaveTypeId },
  { id: "u-rakan", name: "Rakan Al-Mutlaq", nameAr: "راكان المطلق", initials: "RM", range: "May 10 – 14", rangeAr: "10 – 14 مايو", from: "2026-05-10", to: "2026-05-14", type: "annual" as LeaveTypeId },
  { id: "u-nouf", name: "Nouf Al-Shammari", nameAr: "نوف الشمري", initials: "NS", range: "May 13", rangeAr: "13 مايو", from: "2026-05-13", to: "2026-05-13", type: "sick" as LeaveTypeId },
  { id: "u-omar", name: "Omar Haddad", nameAr: "عمر حداد", initials: "OH", range: "Jun 7 – 11", rangeAr: "7 – 11 يونيو", from: "2026-06-07", to: "2026-06-11", type: "annual" as LeaveTypeId },
]

/** Colleagues whose leave actually overlaps the given window. */
export function teamAwayBetween(from: string, to: string) {
  if (!from || !to) return []
  return TEAM_AWAY.filter((c) => c.from <= to && c.to >= from)
}

// ── reactive store ───────────────────────────────────────────────────────────
let requests: LeaveRequest[] = SEED_REQUESTS
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l) }

export function useLeaveRequests(): LeaveRequest[] {
  return React.useSyncExternalStore(subscribe, () => requests)
}
export function addLeaveRequest(r: LeaveRequest) { requests = [r, ...requests]; emit() }
export function cancelLeaveRequest(id: string) {
  requests = requests.map((r) => (r.id === id ? { ...r, status: "Cancelled" as RequestStatus } : r))
  emit()
}
export const newRequestId = () => `lr-${Date.now().toString(36)}`
export const leaveTypeById = (id: LeaveTypeId) => LEAVE_TYPES.find((t) => t.id === id)

/** Entitlements with `pending` recomputed from the live request store, so a
 *  newly submitted request immediately shows up in the balances. */
export function useLiveLeaveTypes(): LeaveType[] {
  const reqs = useLeaveRequests()
  return React.useMemo(() => {
    const pendingDays = new Map<LeaveTypeId, number>()
    for (const r of reqs) {
      if (r.status !== "Pending") continue
      pendingDays.set(r.type, (pendingDays.get(r.type) ?? 0) + r.days)
    }
    return LEAVE_TYPES.map((t) => ({ ...t, pending: pendingDays.get(t.id) ?? 0 }))
  }, [reqs])
}
