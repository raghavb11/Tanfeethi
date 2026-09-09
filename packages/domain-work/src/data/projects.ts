import * as React from "react"

/** Projects are a master — tasks point at one by id and keep a name snapshot,
 *  so renaming a project never orphans the work already filed under it.
 *  Demo-only fixtures; a real build stores these with the task table. */

export type ProjectStatus = "planned" | "active" | "on-hold" | "done"

export type Project = {
  id: string
  code: string
  name: string; nameAr: string
  /** Owning manager or report — a person, selected, never free text. */
  ownerId: string
  owner: string; ownerAr: string
  status: ProjectStatus
  start: string; startISO: string
  due: string; dueISO: string
  description?: string; descriptionAr?: string
}

const KH = { ownerId: "me", owner: "Khalid Al-Qahtani", ownerAr: "خالد القحطاني" }

const SEED: Project[] = [
  { id: "p1", code: "PRJ-001", name: "Digital Workplace", nameAr: "بيئة العمل الرقمية", ...KH, status: "active", start: "Jan 12, 2026", startISO: "2026-01-12", due: "Dec 20, 2026", dueISO: "2026-12-20",
    description: "The Reach employee portal — phases 1 to 5, web and mobile.", descriptionAr: "بوابة الموظفين «وجهة» — المراحل من 1 إلى 5، ويب وجوال." },
  { id: "p2", code: "PRJ-002", name: "Operations · Q3", nameAr: "العمليات · الربع الثالث", ownerId: "r2", owner: "Mohammad Iqbal", ownerAr: "محمد إقبال", status: "active", start: "Jul 1, 2026", startISO: "2026-07-01", due: "Sep 30, 2026", dueISO: "2026-09-30",
    description: "Terminal throughput, rosters and the September schedule ramp.", descriptionAr: "حركة المبنى والجداول وزيادة جدول سبتمبر." },
  { id: "p3", code: "PRJ-003", name: "Operations · Q2", nameAr: "العمليات · الربع الثاني", ownerId: "r2", owner: "Mohammad Iqbal", ownerAr: "محمد إقبال", status: "done", start: "Apr 1, 2026", startISO: "2026-04-01", due: "Jun 30, 2026", dueISO: "2026-06-30",
    description: "Closed. Retained for the Q2 brief and utilisation analysis.", descriptionAr: "مغلق. محفوظ لموجز الربع الثاني وتحليل الاستغلال." },
  { id: "p4", code: "PRJ-004", name: "Safety & Standards", nameAr: "السلامة والمعايير", ownerId: "r5", owner: "Faisal Al-Harbi", ownerAr: "فيصل الحربي", status: "active", start: "Feb 2, 2026", startISO: "2026-02-02", due: "Nov 30, 2026", dueISO: "2026-11-30",
    description: "Ground-safety audits, incident closure and corrective actions.", descriptionAr: "تدقيق السلامة الأرضية وإغلاق الحوادث والإجراءات التصحيحية." },
  { id: "p5", code: "PRJ-005", name: "Employee Services", nameAr: "خدمات الموظفين", ownerId: "r4", owner: "Noura Saleh", ownerAr: "نورة صالح", status: "active", start: "Jun 1, 2026", startISO: "2026-06-01", due: "Oct 31, 2026", dueISO: "2026-10-31",
    description: "Cafeteria and hospitality ordering, service catalogue, tea-boy queue.", descriptionAr: "طلبات الكافتيريا والضيافة، ودليل الخدمات، وطابور خدمة الضيافة." },
  { id: "p6", code: "PRJ-006", name: "Capital Projects", nameAr: "مشاريع رأس المال", ...KH, status: "active", start: "Mar 1, 2026", startISO: "2026-03-01", due: "Mar 31, 2027", dueISO: "2027-03-31",
    description: "Terminal expansion milestones and the VIP lounge renovation.", descriptionAr: "معالم توسعة المبنى وتجديد صالة كبار الضيوف." },
  { id: "p7", code: "PRJ-007", name: "Compliance", nameAr: "الامتثال", ownerId: "r1", owner: "Sara Al-Mutairi", ownerAr: "سارة المطيري", status: "active", start: "Jan 5, 2026", startISO: "2026-01-05", due: "Dec 31, 2026", dueISO: "2026-12-31",
    description: "Policy acknowledgements, access audits and the PDPL workstream.", descriptionAr: "الإقرار بالسياسات وتدقيق الدخول ومسار حماية البيانات." },
  { id: "p8", code: "PRJ-008", name: "Procurement", nameAr: "المشتريات", ownerId: "r2", owner: "Mohammad Iqbal", ownerAr: "محمد إقبال", status: "active", start: "May 1, 2026", startISO: "2026-05-01", due: "Dec 15, 2026", dueISO: "2026-12-15",
    description: "Vendor contract renewals and ground-handling SLA revisions.", descriptionAr: "تجديد عقود الموردين وتعديلات اتفاقيات المناولة الأرضية." },
  { id: "p9", code: "PRJ-009", name: "People Ops", nameAr: "عمليات الموارد البشرية", ownerId: "r7", owner: "Reem Al-Otaibi", ownerAr: "ريم العتيبي", status: "active", start: "Jan 1, 2026", startISO: "2026-01-01", due: "Dec 31, 2026", dueISO: "2026-12-31",
    description: "Mandatory training, the org chart and the employee pulse survey.", descriptionAr: "التدريب الإلزامي والهيكل التنظيمي واستبيان نبض الموظفين." },
  { id: "p10", code: "PRJ-010", name: "Guest Experience", nameAr: "تجربة الضيوف", ownerId: "r6", owner: "Saud Al-Dosari", ownerAr: "سعود الدوسري", status: "active", start: "Apr 15, 2026", startISO: "2026-04-15", due: "Dec 31, 2026", dueISO: "2026-12-31",
    description: "Lounge readiness, guest standards and the hospitality rollout.", descriptionAr: "جاهزية الصالات ومعايير الضيوف وإطلاق الضيافة." },
  { id: "p11", code: "PRJ-011", name: "Finance", nameAr: "المالية", ...KH, status: "active", start: "Jan 1, 2026", startISO: "2026-01-01", due: "Dec 31, 2026", dueISO: "2026-12-31",
    description: "Expense cycles, budget lines and the IT hardware envelope.", descriptionAr: "دورات المصروفات وبنود الميزانية ومظروف أجهزة تقنية المعلومات." },
  { id: "p12", code: "PRJ-012", name: "Org Chart & Directory", nameAr: "الهيكل التنظيمي والدليل", ownerId: "r3", owner: "Layan Al Marwani", ownerAr: "ليان المرواني", status: "planned", start: "Oct 1, 2026", startISO: "2026-10-01", due: "Jan 31, 2027", dueISO: "2027-01-31",
    description: "Not started. Graph-sourced org chart and the employee directory refresh.", descriptionAr: "لم يبدأ. هيكل تنظيمي من Graph وتحديث دليل الموظفين." },
]

let projects: Project[] = SEED
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l) }

export function useProjects(): Project[] {
  return React.useSyncExternalStore(subscribe, () => projects)
}

export const getProjectById = (id: string) => projects.find((p) => p.id === id)
export const allProjects = () => projects

/** Next code in sequence — the master numbers itself. */
export const nextProjectCode = () =>
  `PRJ-${String(projects.length + 1).padStart(3, "0")}`
export const newProjectId = () => `p-${Date.now().toString(36)}`

export function addProject(p: Project) {
  projects = [...projects, p]
  emit()
}
export function updateProject(id: string, patch: Partial<Project>) {
  projects = projects.map((p) => (p.id === id ? { ...p, ...patch } : p))
  emit()
}

/** Names the seeded tasks were written with, so old rows link to a project. */
const ALIAS: Record<string, string> = {
  "Digital Workplace": "p1",
  "Digital Services": "p1",
  "Operations · Q3": "p2",
  "Operations": "p2",
  "Operations · Q2": "p3",
  "Safety & Standards": "p4",
  "Employee Services": "p5",
  "Capital Projects": "p6",
  "Compliance": "p7",
  "Procurement": "p8",
  "People Ops": "p9",
  "Guest Experience": "p10",
  "Finance": "p11",
  "Finance · IT": "p11",
}
export const projectIdForName = (name: string): string | undefined => ALIAS[name]

export const STATUS_LABEL: Record<ProjectStatus, { en: string; ar: string; chip: string }> = {
  planned: { en: "Planned", ar: "مخطط", chip: "border-border bg-muted/50 text-muted-foreground" },
  active: { en: "Active", ar: "قيد التنفيذ", chip: "border-sky-500/35 bg-sky-500/10 text-sky-600 dark:text-sky-400" },
  "on-hold": { en: "On hold", ar: "متوقف", chip: "border-amber-500/35 bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  done: { en: "Completed", ar: "مكتمل", chip: "border-emerald-500/35 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
}
