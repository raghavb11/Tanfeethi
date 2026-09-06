import * as React from "react"

import { getPortalUsers } from "./roles"

/** Approval Rule Engine — the configuration behind "who approves what".
 *  A rule matches content by conditions, then runs an ordered set of levels. */

// ── condition vocabulary ─────────────────────────────────────────────────────
export type FieldId =
  | "contentType" | "department" | "audience" | "priority" | "authorType" | "hasAttachment"

export type OperatorId = "is" | "isNot" | "isAnyOf" | "isNoneOf"

export const FIELDS: { id: FieldId; label: string; labelAr: string; options: { id: string; label: string; labelAr: string }[] }[] = [
  {
    id: "contentType", label: "Content Type", labelAr: "نوع المحتوى",
    options: [
      { id: "news", label: "News", labelAr: "خبر" },
      { id: "announcement", label: "Announcement", labelAr: "إعلان" },
      { id: "news-or-announcement", label: "News or Announcement", labelAr: "خبر أو إعلان" },
      { id: "circular", label: "Circular", labelAr: "تعميم" },
      { id: "policy", label: "Policy", labelAr: "سياسة" },
      { id: "event", label: "Event", labelAr: "فعالية" },
      { id: "document", label: "Document", labelAr: "مستند" },
    ],
  },
  {
    id: "department", label: "Department (Publisher)", labelAr: "الإدارة (الناشر)",
    options: [
      { id: "communications", label: "Communications", labelAr: "الاتصال" },
      { id: "people-ops", label: "People Ops", labelAr: "الموارد البشرية" },
      { id: "operations", label: "Operations", labelAr: "العمليات" },
      { id: "it", label: "IT & Security", labelAr: "تقنية المعلومات" },
      { id: "finance", label: "Finance", labelAr: "المالية" },
      { id: "legal", label: "Legal & Compliance", labelAr: "القانونية والالتزام" },
    ],
  },
  {
    id: "audience", label: "Audience", labelAr: "الجمهور",
    options: [
      { id: "all", label: "All Employees", labelAr: "جميع الموظفين" },
      { id: "hq", label: "Headquarters", labelAr: "المقر الرئيسي" },
      { id: "terminals", label: "Terminals", labelAr: "الصالات" },
      { id: "managers", label: "Managers", labelAr: "المدراء" },
      { id: "executives", label: "Executives", labelAr: "الإدارة التنفيذية" },
    ],
  },
  {
    id: "priority", label: "Priority", labelAr: "الأولوية",
    options: [
      { id: "high", label: "High", labelAr: "عالية" },
      { id: "normal", label: "Normal", labelAr: "عادية" },
      { id: "low", label: "Low", labelAr: "منخفضة" },
    ],
  },
  {
    id: "authorType", label: "Author Type", labelAr: "نوع الكاتب",
    options: [
      { id: "internal", label: "Internal", labelAr: "داخلي" },
      { id: "external", label: "External", labelAr: "خارجي" },
      { id: "agency", label: "Agency", labelAr: "وكالة" },
    ],
  },
  {
    id: "hasAttachment", label: "Has Attachment", labelAr: "يحتوي مرفقًا",
    options: [
      { id: "yes", label: "Yes", labelAr: "نعم" },
      { id: "no", label: "No", labelAr: "لا" },
    ],
  },
]

export const OPERATORS: { id: OperatorId; label: string; labelAr: string; multi: boolean }[] = [
  { id: "is", label: "is", labelAr: "يساوي", multi: false },
  { id: "isNot", label: "is not", labelAr: "لا يساوي", multi: false },
  { id: "isAnyOf", label: "is any of", labelAr: "أي من", multi: true },
  { id: "isNoneOf", label: "is none of", labelAr: "ليس أيًا من", multi: true },
]

export const fieldById = (id: FieldId) => FIELDS.find((f) => f.id === id)!
export const operatorById = (id: OperatorId) => OPERATORS.find((o) => o.id === id)!
export const optionLabel = (field: FieldId, opt: string, isAr: boolean) => {
  const o = fieldById(field).options.find((x) => x.id === opt)
  return o ? (isAr ? o.labelAr : o.label) : opt
}

export type Condition = { id: string; field: FieldId; operator: OperatorId; values: string[] }

// ── approval levels ──────────────────────────────────────────────────────────
export type ApprovalType = "serial" | "parallel"
export type Criteria = "any" | "all"
export type ApproverKind = "user" | "group" | "managerOf" | "role"
export type OnReject = "stop" | "returnPrevious" | "returnAuthor"

export type Approver = {
  id: string
  kind: ApproverKind
  /** For kind "user" this is a PortalUser id; otherwise a group / role label. */
  ref: string
  label: string
  labelAr: string
  sublabel?: string
  sublabelAr?: string
  initials?: string
  /** Group size, shown as "8 members". */
  members?: number
}

export type Level = {
  id: string
  name: string
  nameAr: string
  type: ApprovalType
  criteria: Criteria
  approvers: Approver[]
  timeLimitDays: number
  onReject: OnReject
}

export const ON_REJECT: { id: OnReject; label: string; labelAr: string }[] = [
  { id: "stop", label: "Stop the process", labelAr: "إيقاف العملية" },
  { id: "returnPrevious", label: "Return to previous level", labelAr: "الإعادة للمستوى السابق" },
  { id: "returnAuthor", label: "Return to the author", labelAr: "الإعادة إلى الكاتب" },
]

// ── the rule ─────────────────────────────────────────────────────────────────
export type Rule = {
  id: string
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  active: boolean
  conditions: Condition[]
  /** Every condition must match — the engine has no OR groups yet. */
  matchAll: true
  levels: Level[]
  settings: {
    escalateAfterDue: boolean
    escalationEveryDays: number
    remindEveryDays: number
    exceptions: number
  }
  notes: string
  createdBy: string
  createdOn: string
  updatedOn: string
  /** Soft delete — nothing is ever removed. */
  archived?: boolean
}

const u = (id: string): Approver => {
  const p = getPortalUsers().find((x) => x.id === id)!
  return {
    id: `ap-${id}`, kind: "user", ref: id,
    label: p.name, labelAr: p.nameAr, initials: p.initials,
    sublabel: p.dept, sublabelAr: p.deptAr,
  }
}

const SEED: Rule[] = [
  {
    id: "r-news-ann",
    name: "News & Announcement Approval",
    nameAr: "اعتماد الأخبار والإعلانات",
    description: "Define the conditions, approvers and order of approval for news and announcements before they are published.",
    descriptionAr: "تحديد الشروط والمعتمدين وترتيب الاعتماد للأخبار والإعلانات قبل نشرها.",
    active: true,
    matchAll: true,
    conditions: [
      { id: "c1", field: "contentType", operator: "is", values: ["news-or-announcement"] },
      { id: "c2", field: "department", operator: "isAnyOf", values: ["communications"] },
      { id: "c3", field: "audience", operator: "isAnyOf", values: ["all"] },
      { id: "c4", field: "priority", operator: "is", values: ["high"] },
    ],
    levels: [
      {
        id: "l1", name: "Content Review", nameAr: "مراجعة المحتوى",
        type: "serial", criteria: "all", timeLimitDays: 2, onReject: "stop",
        approvers: [u("u-ahmed"), u("u-sara"), u("u-layan"), u("u-mohammad"), u("u-noura")],
      },
      {
        id: "l2", name: "Team Review", nameAr: "مراجعة الفريق",
        type: "parallel", criteria: "all", timeLimitDays: 2, onReject: "returnPrevious",
        approvers: [{
          id: "ap-comms", kind: "group", ref: "g-comms",
          label: "Communications Team", labelAr: "فريق الاتصال", members: 8,
        }],
      },
      {
        id: "l3", name: "Final Approval", nameAr: "الاعتماد النهائي",
        type: "serial", criteria: "all", timeLimitDays: 3, onReject: "stop",
        approvers: [u("u-fahad")],
      },
    ],
    settings: { escalateAfterDue: true, escalationEveryDays: 1, remindEveryDays: 1, exceptions: 2 },
    notes: "",
    createdBy: "System Admin",
    createdOn: "20 May 2026 10:30",
    updatedOn: "20 May 2026 10:30",
  },
  {
    id: "r-policy",
    name: "Policy Publication Approval",
    nameAr: "اعتماد نشر السياسات",
    description: "Legal and compliance sign-off before a policy is published to employees.",
    descriptionAr: "اعتماد الجهة القانونية والالتزام قبل نشر السياسة للموظفين.",
    active: true,
    matchAll: true,
    conditions: [{ id: "c1", field: "contentType", operator: "is", values: ["policy"] }],
    levels: [
      {
        id: "l1", name: "Legal Review", nameAr: "المراجعة القانونية",
        type: "serial", criteria: "all", timeLimitDays: 5, onReject: "returnAuthor",
        approvers: [u("u-noura")],
      },
    ],
    settings: { escalateAfterDue: true, escalationEveryDays: 2, remindEveryDays: 2, exceptions: 0 },
    notes: "",
    createdBy: "System Admin",
    createdOn: "2 Jun 2026 09:05",
    updatedOn: "18 Aug 2026 14:22",
  },
  {
    id: "r-cafeteria",
    name: "Cafeteria Bulk Order Approval",
    nameAr: "اعتماد طلبات الكافتيريا الكبيرة",
    description: "Manager approval for cafeteria orders above the standard head count.",
    descriptionAr: "اعتماد المدير لطلبات الكافتيريا التي تتجاوز العدد المعتاد.",
    active: false,
    matchAll: true,
    conditions: [{ id: "c1", field: "department", operator: "isAnyOf", values: ["operations"] }],
    levels: [
      {
        id: "l1", name: "Line Manager", nameAr: "المدير المباشر",
        type: "serial", criteria: "any", timeLimitDays: 1, onReject: "stop",
        approvers: [{
          id: "ap-mgr", kind: "managerOf", ref: "requester",
          label: "User's Manager", labelAr: "مدير الموظف",
        }],
      },
    ],
    settings: { escalateAfterDue: false, escalationEveryDays: 1, remindEveryDays: 1, exceptions: 0 },
    notes: "",
    createdBy: "System Admin",
    createdOn: "28 Aug 2026 11:40",
    updatedOn: "28 Aug 2026 11:40",
  },
]

// ── reactive store ───────────────────────────────────────────────────────────
let rules: Rule[] = SEED
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l) }

export function useRules(): Rule[] {
  return React.useSyncExternalStore(subscribe, () => rules)
}
export const getRule = (id: string) => rules.find((r) => r.id === id)
export function useRule(id: string): Rule | undefined {
  const all = useRules()
  return all.find((r) => r.id === id)
}
export function saveRule(next: Rule) {
  rules = rules.map((r) => (r.id === next.id ? { ...next, updatedOn: "Just now" } : r))
  emit()
  logRule("saved", next.name)
}
export function setRuleActive(id: string, active: boolean) {
  const r = rules.find((x) => x.id === id)
  rules = rules.map((x) => (x.id === id ? { ...x, active } : x))
  emit()
  if (r) logRule(active ? "activated" : "deactivated", r.name)
}
/** Soft delete only — archived rules stay in the store. */
export function archiveRule(id: string) {
  const r = rules.find((x) => x.id === id)
  rules = rules.map((x) => (x.id === id ? { ...x, archived: true, active: false } : x))
  emit()
  if (r) logRule("archived", r.name)
}

export const newId = (p: string) => `${p}-${Date.now().toString(36)}`

// ── audit ────────────────────────────────────────────────────────────────────
export type RuleAudit = { id: string; action: string; target: string; who: string; time: string }
let auditLog: RuleAudit[] = [
  { id: "ra1", action: "activated", target: "News & Announcement Approval", who: "System Admin", time: "20 May 2026 10:30" },
  { id: "ra2", action: "saved", target: "Policy Publication Approval", who: "Khalid A.", time: "18 Aug 2026 14:22" },
]
export const useRuleAudit = () => React.useSyncExternalStore(subscribe, () => auditLog)
function logRule(action: string, target: string) {
  auditLog = [{ id: newId("ra"), action, target, who: "Khalid A.", time: "Just now" }, ...auditLog]
}
