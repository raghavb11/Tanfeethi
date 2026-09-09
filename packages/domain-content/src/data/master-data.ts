import * as React from "react"

/** Master data — the configurable lists other modules pick from. Each list is
 *  owned here so an administrator can change it without a release. The lists
 *  share a shape (name, colour, active) and add the few fields that are
 *  genuinely their own — a leave type carries an entitlement, a priority
 *  carries a response time.
 *  Demo fixtures; a real build stores these per tenant. */

// ── the lists ────────────────────────────────────────────────────────────────
export type MasterListId =
  | "holiday-types" | "leave-types" | "request-categories" | "priorities" | "document-tags"

export const MASTER_LISTS: {
  id: MasterListId
  label: string; labelAr: string
  desc: string; descAr: string
  singular: string; singularAr: string
}[] = [
  { id: "holiday-types", label: "Holiday types", labelAr: "أنواع الإجازات الرسمية",
    desc: "Used by the holiday calendar and its bulk upload.", descAr: "تُستخدم في تقويم الإجازات والرفع الجماعي.",
    singular: "holiday type", singularAr: "نوع إجازة رسمية" },
  { id: "leave-types", label: "Leave types", labelAr: "أنواع إجازات الموظفين",
    desc: "What an employee can request, and the entitlement behind it.", descAr: "ما يمكن للموظف طلبه، والرصيد المرتبط به.",
    singular: "leave type", singularAr: "نوع إجازة" },
  { id: "request-categories", label: "Request categories", labelAr: "تصنيفات الطلبات",
    desc: "How a service request is classified and where it is routed.", descAr: "كيف يُصنَّف طلب الخدمة وإلى أين يُوجَّه.",
    singular: "category", singularAr: "تصنيف" },
  { id: "priorities", label: "Priorities", labelAr: "الأولويات",
    desc: "Shared by tasks, requests and incidents, with a response time.", descAr: "مشتركة بين المهام والطلبات والبلاغات، مع زمن استجابة.",
    singular: "priority", singularAr: "أولوية" },
  { id: "document-tags", label: "Document tags", labelAr: "وسوم المستندات",
    desc: "Labels on library documents, and who they are visible to.", descAr: "وسوم مستندات المكتبة ومن يراها.",
    singular: "tag", singularAr: "وسم" },
]
export const masterList = (id: MasterListId) => MASTER_LISTS.find((l) => l.id === id)!

// ── colours ──────────────────────────────────────────────────────────────────
/** Fixed set of swatches so the classes survive the Tailwind build. */
export type Tone = "sky" | "emerald" | "amber" | "rose" | "violet" | "slate"

export const TONE_CHIP: Record<Tone, string> = {
  sky: "border-sky-500/35 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  emerald: "border-emerald-500/35 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  amber: "border-amber-500/35 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  rose: "border-rose-500/35 bg-rose-500/10 text-rose-600 dark:text-rose-400",
  violet: "border-violet-500/35 bg-violet-500/10 text-violet-600 dark:text-violet-400",
  slate: "border-border bg-muted/50 text-muted-foreground",
}
export const TONE_DOT: Record<Tone, string> = {
  sky: "bg-sky-500", emerald: "bg-emerald-500", amber: "bg-amber-500",
  rose: "bg-rose-500", violet: "bg-violet-500", slate: "bg-muted-foreground/50",
}
export const TONES: Tone[] = ["sky", "emerald", "amber", "rose", "violet", "slate"]

// ── one row ──────────────────────────────────────────────────────────────────
export type MasterRow = {
  id: string
  list: MasterListId
  name: string; nameAr: string
  tone: Tone
  description?: string; descriptionAr?: string
  /** Off means it stays on old records but is no longer offered for new ones. */
  active: boolean
  /** Shipped with the product — can be renamed or deactivated, never deleted. */
  system?: boolean

  // ── leave types ──
  /** Payroll code the HR system knows it by. */
  code?: string
  /** Working days a year, 0 for uncapped or unpaid. */
  daysPerYear?: number
  paid?: boolean
  /** A medical certificate, a marriage contract, a Hajj permit. */
  needsDocument?: boolean
  /** Days that survive into next year. */
  carryForward?: number

  // ── request categories ──
  routeTo?: string; routeToAr?: string
  /** Working days the owning team has to close it. */
  slaDays?: number
  needsApproval?: boolean

  // ── priorities ──
  /** Sort order, 1 is the most urgent. */
  rank?: number
  /** Hours to first response. */
  responseHours?: number

  // ── document tags ──
  scope?: "all" | "department" | "restricted"
}

export const SCOPES: { id: NonNullable<MasterRow["scope"]>; en: string; ar: string }[] = [
  { id: "all", en: "Everyone", ar: "الجميع" },
  { id: "department", en: "Owning department", ar: "الإدارة المالكة" },
  { id: "restricted", en: "Named roles only", ar: "أدوار محددة فقط" },
]

const SEED: MasterRow[] = [
  // ── holiday types ──
  { id: "public", list: "holiday-types", name: "Public", nameAr: "رسمية", tone: "sky", active: true, system: true,
    description: "Declared by the Kingdom — Founding Day, National Day.", descriptionAr: "معلنة من المملكة — يوم التأسيس واليوم الوطني." },
  { id: "religious", list: "holiday-types", name: "Religious", nameAr: "دينية", tone: "emerald", active: true, system: true,
    description: "Hijri holidays whose dates move each Gregorian year.", descriptionAr: "إجازات هجرية تتغيّر تواريخها كل سنة ميلادية." },
  { id: "company", list: "holiday-types", name: "Company", nameAr: "مؤسسية", tone: "amber", active: true, system: true,
    description: "Days Tanfeethi grants on top of the statutory calendar.", descriptionAr: "أيام يمنحها التنفيذي إضافة إلى التقويم النظامي." },
  { id: "site", list: "holiday-types", name: "Site-specific", nameAr: "خاصة بالموقع", tone: "violet", active: true,
    description: "Applies to one terminal or site rather than everyone.", descriptionAr: "تنطبق على مبنى أو موقع واحد بدلًا من الجميع." },

  // ── leave types ──
  { id: "annual", list: "leave-types", name: "Annual leave", nameAr: "إجازة سنوية", tone: "sky", active: true, system: true,
    code: "AL", daysPerYear: 21, paid: true, carryForward: 10,
    description: "21 days, rising to 30 after five years of service.", descriptionAr: "21 يومًا، وترتفع إلى 30 بعد خمس سنوات خدمة." },
  { id: "sick", list: "leave-types", name: "Sick leave", nameAr: "إجازة مرضية", tone: "rose", active: true, system: true,
    code: "SL", daysPerYear: 30, paid: true, needsDocument: true, carryForward: 0,
    description: "First 30 days on full pay; a medical report is required.", descriptionAr: "أول 30 يومًا بأجر كامل، ويلزم تقرير طبي." },
  { id: "casual", list: "leave-types", name: "Casual / emergency", nameAr: "إجازة عارضة", tone: "amber", active: true, system: true,
    code: "CL", daysPerYear: 5, paid: true, carryForward: 0,
    description: "Short notice, deducted from the annual balance.", descriptionAr: "بإشعار قصير، وتُخصم من الرصيد السنوي." },
  { id: "maternity", list: "leave-types", name: "Maternity leave", nameAr: "إجازة وضع", tone: "violet", active: true,
    code: "ML", daysPerYear: 70, paid: true, needsDocument: true, carryForward: 0,
    description: "Ten weeks, taken around the delivery date.", descriptionAr: "عشرة أسابيع تُؤخذ حول تاريخ الولادة." },
  { id: "paternity", list: "leave-types", name: "Paternity leave", nameAr: "إجازة أبوة", tone: "violet", active: true,
    code: "PL", daysPerYear: 3, paid: true, carryForward: 0 },
  { id: "hajj", list: "leave-types", name: "Hajj leave", nameAr: "إجازة حج", tone: "emerald", active: true,
    code: "HL", daysPerYear: 10, paid: true, needsDocument: true, carryForward: 0,
    description: "Once in service, for an employee who has not performed Hajj.", descriptionAr: "مرة واحدة خلال الخدمة لمن لم يؤدِّ الحج." },
  { id: "bereavement", list: "leave-types", name: "Bereavement", nameAr: "إجازة وفاة", tone: "slate", active: true,
    code: "BL", daysPerYear: 5, paid: true, carryForward: 0 },
  { id: "unpaid", list: "leave-types", name: "Unpaid leave", nameAr: "إجازة بدون راتب", tone: "slate", active: true,
    code: "UL", daysPerYear: 0, paid: false, carryForward: 0,
    description: "By agreement; service continues, pay stops.", descriptionAr: "بالاتفاق؛ تستمر الخدمة ويتوقف الأجر." },

  // ── request categories ──
  { id: "it-support", list: "request-categories", name: "IT support", nameAr: "الدعم التقني", tone: "sky", active: true, system: true,
    routeTo: "IT & Security", routeToAr: "تقنية المعلومات والأمن", slaDays: 2, needsApproval: false },
  { id: "hr-letters", list: "request-categories", name: "HR letters", nameAr: "خطابات الموارد البشرية", tone: "emerald", active: true, system: true,
    routeTo: "People & Culture", routeToAr: "الموظفون والثقافة", slaDays: 3, needsApproval: true,
    description: "Salary certificates, employment letters, embassy letters.", descriptionAr: "شهادات راتب وخطابات تعريف وخطابات سفارات." },
  { id: "facilities", list: "request-categories", name: "Facilities", nameAr: "الخدمات المساندة", tone: "amber", active: true,
    routeTo: "Facilities", routeToAr: "إدارة المرافق", slaDays: 3, needsApproval: false },
  { id: "access-badges", list: "request-categories", name: "Access & badges", nameAr: "التصاريح والبطاقات", tone: "violet", active: true,
    routeTo: "Security", routeToAr: "الأمن", slaDays: 5, needsApproval: true },
  { id: "finance", list: "request-categories", name: "Finance & expenses", nameAr: "المالية والمصروفات", tone: "rose", active: true,
    routeTo: "Finance", routeToAr: "المالية", slaDays: 5, needsApproval: true },
  { id: "travel", list: "request-categories", name: "Travel", nameAr: "السفر", tone: "sky", active: true,
    routeTo: "Travel desk", routeToAr: "مكتب السفر", slaDays: 4, needsApproval: true },

  // ── priorities ──
  { id: "critical", list: "priorities", name: "Critical", nameAr: "حرجة", tone: "rose", active: true, system: true,
    rank: 1, responseHours: 1, description: "Operations are stopped or a flight is at risk.", descriptionAr: "توقف العمليات أو تعرّض رحلة للخطر." },
  { id: "high", list: "priorities", name: "High", nameAr: "عالية", tone: "amber", active: true, system: true,
    rank: 2, responseHours: 4 },
  { id: "medium", list: "priorities", name: "Medium", nameAr: "متوسطة", tone: "sky", active: true, system: true,
    rank: 3, responseHours: 24 },
  { id: "low", list: "priorities", name: "Low", nameAr: "منخفضة", tone: "slate", active: true, system: true,
    rank: 4, responseHours: 72 },

  // ── document tags ──
  { id: "policy", list: "document-tags", name: "Policy", nameAr: "سياسة", tone: "sky", active: true, system: true, scope: "all" },
  { id: "circular", list: "document-tags", name: "Circular", nameAr: "تعميم", tone: "emerald", active: true, system: true, scope: "all" },
  { id: "form", list: "document-tags", name: "Form", nameAr: "نموذج", tone: "amber", active: true, scope: "all" },
  { id: "template", list: "document-tags", name: "Template", nameAr: "قالب", tone: "violet", active: true, scope: "department" },
  { id: "confidential", list: "document-tags", name: "Confidential", nameAr: "سري", tone: "rose", active: true, system: true, scope: "restricted",
    description: "Only the roles named on the folder can open it.", descriptionAr: "لا يفتحه إلا الأدوار المحددة على المجلد." },
]

let rows: MasterRow[] = SEED
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l) }

export function useMasterRows(): MasterRow[] {
  return React.useSyncExternalStore(subscribe, () => rows)
}
/** One list, in the order it should read — priorities by rank, the rest as entered. */
export const rowsIn = (list: MasterListId) => {
  const own = rows.filter((r) => r.list === list)
  return list === "priorities" ? [...own].sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99)) : own
}
export const activeRowsIn = (list: MasterListId) => rowsIn(list).filter((r) => r.active)
export const getMasterRow = (list: MasterListId, id: string) =>
  rows.find((r) => r.list === list && r.id === id)

export function addMasterRow(row: MasterRow) { rows = [...rows, row]; emit() }
export function updateMasterRow(list: MasterListId, id: string, patch: Partial<MasterRow>) {
  rows = rows.map((r) => (r.list === list && r.id === id ? { ...r, ...patch } : r)); emit()
}
export function removeMasterRow(list: MasterListId, id: string) {
  rows = rows.filter((r) => !(r.list === list && r.id === id && !r.system)); emit()
}

/** Ids are slugs so imported files can name a value in plain words. */
export const slugify = (s: string) =>
  s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `row-${Date.now().toString(36)}`

// ── what the holiday module reads ────────────────────────────────────────────
export type HolidayTypeRow = MasterRow

export function useHolidayTypes(): HolidayTypeRow[] {
  const all = useMasterRows()
  return React.useMemo(() => all.filter((r) => r.list === "holiday-types"), [all])
}
export const allHolidayTypes = () => rowsIn("holiday-types")
export const activeHolidayTypes = () => activeRowsIn("holiday-types")
export const getHolidayType = (id: string) => getMasterRow("holiday-types", id)

/** How a type reads, falling back gracefully if a record points at a removed one. */
export const holidayTypeLabel = (id: string, isAr: boolean) => {
  const row = getHolidayType(id)
  return row ? (isAr ? row.nameAr : row.name) : id
}
export const holidayTypeChip = (id: string) => TONE_CHIP[getHolidayType(id)?.tone ?? "slate"]
