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
}

const SEED_REQUESTS: LeaveRequest[] = [
  { id: "lr1", type: "annual", from: "Sep 14, 2026", fromAr: "١٤ سبتمبر", to: "Sep 18, 2026", toAr: "١٨ سبتمبر", days: 5, submitted: "Aug 2, 2026", submittedAr: "٢ أغسطس", status: "Approved", approver: "Ahmed Mohammed", approverAr: "أحمد محمد", reason: "Family trip", reasonAr: "رحلة عائلية" },
  { id: "lr2", type: "annual", from: "May 12, 2026", fromAr: "١٢ مايو", to: "May 16, 2026", toAr: "١٦ مايو", days: 5, submitted: "Aug 10, 2026", submittedAr: "١٠ أغسطس", status: "Pending", approver: "Ahmed Mohammed", approverAr: "أحمد محمد", reason: "Personal travel", reasonAr: "سفر شخصي" },
  { id: "lr3", type: "sick", from: "Jun 3, 2026", fromAr: "٣ يونيو", to: "Jun 3, 2026", toAr: "٣ يونيو", days: 1, submitted: "Jun 3, 2026", submittedAr: "٣ يونيو", status: "Approved", approver: "Ahmed Mohammed", approverAr: "أحمد محمد", reason: "Medical appointment", reasonAr: "موعد طبي" },
  { id: "lr4", type: "annual", from: "Mar 9, 2026", fromAr: "٩ مارس", to: "Mar 11, 2026", toAr: "١١ مارس", days: 3, submitted: "Feb 20, 2026", submittedAr: "٢٠ فبراير", status: "Approved", approver: "Ahmed Mohammed", approverAr: "أحمد محمد" },
  { id: "lr5", type: "personal", from: "Jan 22, 2026", fromAr: "٢٢ يناير", to: "Jan 22, 2026", toAr: "٢٢ يناير", days: 1, submitted: "Jan 15, 2026", submittedAr: "١٥ يناير", status: "Rejected", approver: "Ahmed Mohammed", approverAr: "أحمد محمد", reason: "Clashes with audit week", reasonAr: "يتعارض مع أسبوع التدقيق" },
]

export const HOLIDAYS = [
  { id: "h1", name: "Eid Al-Adha", nameAr: "عيد الأضحى", date: "Aug 26 – 30, 2026", dateAr: "٢٦ – ٣٠ أغسطس", days: 5 },
  { id: "h2", name: "Saudi National Day", nameAr: "اليوم الوطني السعودي", date: "Sep 23, 2026", dateAr: "٢٣ سبتمبر", days: 1 },
  { id: "h3", name: "Founding Day", nameAr: "يوم التأسيس", date: "Feb 22, 2027", dateAr: "٢٢ فبراير", days: 1 },
]

/** Colleagues away in the next fortnight — shown as a team-cover check. */
export const TEAM_AWAY = [
  { id: "u-sara", name: "Sara Al-Mutairi", nameAr: "سارة المطيري", initials: "SM", range: "Aug 18 – 20", rangeAr: "١٨ – ٢٠ أغسطس", from: "2026-08-18", to: "2026-08-20", type: "annual" as LeaveTypeId },
  { id: "u-mohammad", name: "Mohammad Iqbal", nameAr: "محمد إقبال", initials: "MI", range: "Aug 24 – 28", rangeAr: "٢٤ – ٢٨ أغسطس", from: "2026-08-24", to: "2026-08-28", type: "annual" as LeaveTypeId },
  { id: "u-noura", name: "Noura Saleh", nameAr: "نورة صالح", initials: "NS", range: "Aug 25", rangeAr: "٢٥ أغسطس", from: "2026-08-25", to: "2026-08-25", type: "sick" as LeaveTypeId },
  { id: "u-faisal", name: "Faisal Al-Harbi", nameAr: "فيصل الحربي", initials: "FH", range: "Sep 7 – 11", rangeAr: "٧ – ١١ سبتمبر", from: "2026-09-07", to: "2026-09-11", type: "annual" as LeaveTypeId },
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
