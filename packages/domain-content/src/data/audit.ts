import { createCollection, newId } from "../collections"

export type AuditAction = "published" | "edited" | "deleted" | "uploaded" | "approved" | "permission"

export type AuditEntry = {
  id: string
  who: string
  initials: string
  action: AuditAction
  target: string
  module: string
  time: string
}

/** Modules that can appear in the log — used for filter chips and deep links. */
export const AUDIT_MODULES = ["All", "News", "Announcements", "Events", "Policies", "FAQs", "Documents", "Circulars", "Surveys", "Community"]
export const AUDIT_MODULES_AR: Record<string, string> = {
  All: "الكل", News: "الأخبار", Announcements: "الإعلانات", Events: "الفعاليات", Policies: "السياسات",
  FAQs: "الأسئلة", Documents: "المستندات", Circulars: "التعاميم", Surveys: "الاستبيانات", Community: "المجتمع",
}

const SEED: AuditEntry[] = [
  { id: "l1", who: "Zaid B.", initials: "ZB", action: "published", target: "Travel & Expense Policy v2.4", module: "Policies", time: "10:12" },
  { id: "l2", who: "Sara M.", initials: "SM", action: "edited", target: "Q3 Town Hall announcement", module: "Announcements", time: "09:48" },
  { id: "l3", who: "Ahmed H.", initials: "AH", action: "approved", target: "Q4 Engagement Survey", module: "Surveys", time: "09:20" },
  { id: "l4", who: "Layan M.", initials: "LM", action: "uploaded", target: "Employee Handbook 2026.pdf", module: "Documents", time: "Yesterday" },
  { id: "l5", who: "Mohammad I.", initials: "MI", action: "permission", target: "Finance folder", module: "Documents", time: "Yesterday" },
  { id: "l6", who: "Zaid B.", initials: "ZB", action: "deleted", target: "Ramadan 2025 circular", module: "Circulars", time: "2d ago" },
  { id: "l7", who: "Sara M.", initials: "SM", action: "published", target: "New Ramadan working hours announced", module: "News", time: "2d ago" },
  { id: "l8", who: "Khalid A.", initials: "KA", action: "edited", target: "Leave & Attendance Policy", module: "Policies", time: "3d ago" },
]

const store = createCollection<AuditEntry>(SEED, "audit")
export const useAudit = () => store.use()
export const getAudit = () => store.get()

/** Append an audit entry. Called by every CRUD operation across the CMS. */
export function logAudit(action: AuditAction, target: string, module: string) {
  store.add({ id: newId("aud"), who: "Khalid A.", initials: "KH", action, target, module, time: "Just now" })
}
