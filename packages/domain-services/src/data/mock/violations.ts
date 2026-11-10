import * as React from "react"
import type { Option } from "./services"

/** نظام الإبلاغ عن المخالفات — violation reporting (Figma 4999:17400 … 5005:19655).
 *  Reporter: hub → report form → follow-up list (add evidence) → report detail.
 *  Investigator: hub → follow-up queue → report detail in edit mode. */

export type ViolationStatus = "opened" | "needs-evidence" | "investigating" | "closed"

export const statusOptions: Record<ViolationStatus, Option> = {
  opened: { en: "Request opened", ar: "تم فتح الطلب" },
  "needs-evidence": { en: "Additional evidence needed", ar: "بحاجة إلى أدلة إضافية" },
  investigating: { en: "Under investigation", ar: "قيد التحقيق" },
  closed: { en: "Closed", ar: "مُغلق" },
}

export const reasons: (Option & { id: string; sub: Option[] })[] = [
  { id: "audit", en: "Audit violation", ar: "مخالفة تدقيق", sub: [
    { en: "Financial irregularity", ar: "مخالفة مالية" }, { en: "Conflict of interest", ar: "تعارض مصالح" }, { en: "Document tampering", ar: "تلاعب بالمستندات" },
  ] },
  { id: "hr", en: "HR violation", ar: "مخالفة موارد بشرية", sub: [
    { en: "Employee conduct", ar: "تعامل أحد الموظفين" }, { en: "Harassment", ar: "تحرش" }, { en: "Attendance abuse", ar: "إساءة استخدام الحضور" },
  ] },
  { id: "safety", en: "Safety violation", ar: "مخالفة سلامة", sub: [
    { en: "Unsafe practice", ar: "ممارسة غير آمنة" }, { en: "Missing protective equipment", ar: "عدم استخدام معدات الوقاية" },
  ] },
  { id: "quality", en: "Quality violation", ar: "مخالفة جودة", sub: [
    { en: "Process not followed", ar: "عدم اتباع الإجراءات" }, { en: "Service standard breach", ar: "إخلال بمعايير الخدمة" },
  ] },
]

export const departments: (Option & { id: string })[] = [
  { id: "hr", en: "Human Resources Department", ar: "إدارة الموارد البشرية" },
  { id: "audit", en: "Internal Audit Department", ar: "إدارة التدقيق الداخلي" },
  { id: "safety", en: "Safety Department", ar: "إدارة السلامة" },
  { id: "quality", en: "Quality Department", ar: "إدارة الجودة" },
  { id: "legal", en: "Legal Department", ar: "الإدارة القانونية" },
]

export const people: (Option & { id: string; initial: string })[] = [
  { id: "ali", en: "Ali Youssef", ar: "علي يوسف", initial: "ع" },
  { id: "noura", en: "Noura Al-Qahtani", ar: "نورة القحطاني", initial: "ن" },
  { id: "khalid-s", en: "Khalid Al-Saad", ar: "خالد السعد", initial: "خ" },
  { id: "mohammed", en: "Mohammed Al-Otaibi", ar: "محمد العتيبي", initial: "م" },
  { id: "fawaz", en: "Fawaz Al-Ghailan", ar: "فواز الغيلان", initial: "ف" },
]
export const personById = (id: string) => people.find((p) => p.id === id)
export const deptById = (id: string) => departments.find((d) => d.id === id)

export const yesNo: (Option & { id: "yes" | "no" })[] = [
  { id: "yes", en: "Yes", ar: "نعم" },
  { id: "no", en: "No", ar: "لا" },
]

/** The signed-in reporter. */
export const ME = { id: "khalid-m", en: "Khalid Mahmoudi", ar: "خالد محمودي", initial: "خ" }
export const ANONYMOUS: Option = { en: "Anonymous reporter", ar: "مُبلِّغ مجهول الهوية" }

export type Folder = { id: string; name: Option; parent: string | null }
export type Doc = { id: string; folderId: string; name: string; /** English display name for seeded files. */ nameEn?: string; type: "PDF" | "IMG" | "DOC"; ownerId: string; sizeKb: number; uploaded: Option; uploadedOrder: number }
export type Comment = { id: string; authorId: string; text: Option; time: Option; unread?: boolean }

export type ViolationReport = {
  id: string
  title: Option
  description: Option
  reasonId: string
  subCategory: string
  accusedId: string
  accusedDeptId: string
  hasEvidence: "yes" | "no"
  reportedToManager: "yes" | "no"
  openedOn: string
  /** Hidden from everyone (investigators included) when anonymous. */
  createdBy: Option
  anonymous: boolean
  mine: boolean
  status: ViolationStatus
  assignedDeptId: string
  assignedToId: string
  legalConsultation: "yes" | "no"
  folders: Folder[]
  docs: Doc[]
  comments: Comment[]
}

const baseFolders = (): Folder[] => [
  { id: "root", name: { en: "Report files", ar: "ملفات البلاغ" }, parent: null },
  { id: "evidence", name: { en: "Evidence", ar: "الأدلة" }, parent: "root" },
  { id: "work", name: { en: "Work Folders", ar: "مجلدات العمل" }, parent: "evidence" },
]

const seedComments: Comment[] = [
  { id: "c1", authorId: "noura", text: { en: "Accepted the violation and assigned it to themself.", ar: "تم قبول المخالفة وأسندها إلى نفسه." }, time: { en: "Yesterday", ar: "أمس" } },
  { id: "c2", authorId: "khalid-s", text: { en: "Have the documents been verified?", ar: "هل تم التحقق من المستندات؟" }, time: { en: "08:10", ar: "08:10" } },
  { id: "c3", authorId: "mohammed", text: { en: "Any update on the evidence?", ar: "أي تحديث بخصوص الأدلة؟" }, time: { en: "08:42", ar: "08:42" }, unread: true },
]

const report = (id: string, patch: Partial<ViolationReport>): ViolationReport => ({
  id,
  title: { en: "Report an employee's conduct", ar: "إبلاغ عن تعامل أحد الموظفين" },
  description: { en: "Repeated disrespectful conduct towards colleagues.", ar: "تعامل غير لائق ومتكرر مع الزملاء." },
  reasonId: "hr", subCategory: "Employee conduct", accusedId: "fawaz", accusedDeptId: "quality",
  hasEvidence: "yes", reportedToManager: "no", openedOn: "09/09/2026",
  createdBy: { en: ME.en, ar: ME.ar }, anonymous: false, mine: true,
  status: "opened", assignedDeptId: "hr", assignedToId: "ali", legalConsultation: "no",
  folders: baseFolders(),
  docs: [{ id: `${id}-d1`, folderId: "evidence", name: "أدلة", nameEn: "Evidence", type: "PDF", ownerId: "fawaz", sizeKb: 820, uploaded: { en: "Yesterday", ar: "أمس" }, uploadedOrder: 2 }],
  comments: seedComments.map((c) => ({ ...c, id: `${id}-${c.id}` })),
  ...patch,
})

/** Report numbers are unique (the design used #BSRITM-0118845 for every row). */
let reports: ViolationReport[] = [
  report("BSRITM-0118845", { status: "needs-evidence" }),
  report("BSRITM-0118846", { openedOn: "14/09/2026", title: { en: "Safety equipment not used on the apron", ar: "عدم استخدام معدات السلامة في ساحة الطائرات" }, reasonId: "safety", subCategory: "Missing protective equipment", assignedDeptId: "safety", assignedToId: "khalid-s", anonymous: true }),
  report("BSRITM-0118851", { openedOn: "21/09/2026", mine: false, createdBy: { en: "Sara Al-Harbi", ar: "سارة الحربي" }, title: { en: "Expense claims split to avoid approval", ar: "تجزئة مطالبات المصاريف لتجاوز الاعتماد" }, reasonId: "audit", subCategory: "Financial irregularity", assignedDeptId: "audit", assignedToId: "noura", status: "investigating", legalConsultation: "yes" }),
]

const listeners = new Set<() => void>()
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l) } }
const emit = () => listeners.forEach((l) => l())

export const useReports = () => React.useSyncExternalStore(subscribe, () => reports)
export const useReport = (id: string | undefined) =>
  React.useSyncExternalStore(subscribe, () => reports.find((r) => r.id === id))

const update = (id: string, fn: (r: ViolationReport) => ViolationReport) => {
  reports = reports.map((r) => (r.id === id ? fn(r) : r)); emit()
}

export function submitReport(input: {
  reasonId: string; subCategory: string; accusedId: string; accusedDeptId: string; hasEvidence: "yes" | "no"
  title: string; details: string; reportedToManager: "yes" | "no"; anonymous: boolean; files: File[]
}): ViolationReport {
  const n = Math.max(...reports.map((r) => Number(r.id.split("-")[1]))) + 1
  const id = `BSRITM-${String(n).padStart(7, "0")}`
  const d = new Date()
  const r = report(id, {
    title: { en: input.title, ar: input.title }, description: { en: input.details, ar: input.details },
    reasonId: input.reasonId, subCategory: input.subCategory, accusedId: input.accusedId, accusedDeptId: input.accusedDeptId,
    hasEvidence: input.hasEvidence, reportedToManager: input.reportedToManager, anonymous: input.anonymous,
    openedOn: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`,
    status: "opened", assignedDeptId: input.reasonId === "hr" ? "hr" : input.reasonId, assignedToId: "ali",
    docs: input.files.map((f, i) => docFromFile(id, f, "evidence", i)), comments: [],
  })
  reports = [r, ...reports]; emit()
  return r
}

const docFromFile = (reportId: string, f: File, folderId: string, i = 0): Doc => ({
  id: `${reportId}-u${Date.now().toString(36)}${i}`, folderId, name: f.name,
  type: /pdf$/i.test(f.name) ? "PDF" : /\.(png|jpe?g|gif|webp|heic)$/i.test(f.name) ? "IMG" : "DOC",
  ownerId: "me", sizeKb: Math.max(1, Math.round(f.size / 1024)), uploaded: { en: "Just now", ar: "الآن" }, uploadedOrder: 0,
})

export function addDocuments(reportId: string, files: File[], folderId: string, byReporter: boolean) {
  update(reportId, (r) => ({
    ...r,
    docs: [...files.map((f, i) => docFromFile(reportId, f, folderId, i)), ...r.docs],
    // evidence supplied → back to the investigator
    status: byReporter && r.status === "needs-evidence" ? "opened" : r.status,
  }))
}
export function removeDocument(reportId: string, docId: string) {
  update(reportId, (r) => ({ ...r, docs: r.docs.filter((d) => d.id !== docId) }))
}
export function addFolder(reportId: string, name: string, parent: string) {
  update(reportId, (r) => ({ ...r, folders: [...r.folders, { id: `f-${Date.now().toString(36)}`, name: { en: name, ar: name }, parent }] }))
}
export function addComment(reportId: string, authorId: string, text: string) {
  update(reportId, (r) => ({
    ...r,
    comments: [...r.comments, { id: `c-${Date.now().toString(36)}`, authorId, text: { en: text, ar: text }, time: { en: "Now", ar: "الآن" } }],
  }))
}
export function saveInvestigation(reportId: string, patch: Pick<ViolationReport, "status" | "assignedDeptId" | "assignedToId" | "legalConsultation">, note: Option) {
  update(reportId, (r) => ({
    ...r, ...patch,
    comments: [...r.comments, { id: `c-${Date.now().toString(36)}`, authorId: "investigator", text: note, time: { en: "Now", ar: "الآن" } }],
  }))
}

export const authorOf = (id: string): Option & { initial: string } => {
  if (id === "me") return { ...ME }
  if (id === "investigator") return { en: "Investigator", ar: "المحقق", initial: "م" }
  return personById(id) ?? { en: id, ar: id, initial: "؟" }
}
