import { createCollection } from "../collections"

export type FolderDef = { id: string; name: string; nameAr: string; count: number; parent?: string | null }

/** Seed folder tree — two levels deep. A real deployment would have hundreds;
 *  the library UI is built to scale to that (searchable, collapsible tree). */
export const FOLDERS: FolderDef[] = [
  { id: "hr", name: "HR & People", nameAr: "الموارد البشرية", count: 84, parent: null },
  { id: "hr-recruit", name: "Recruitment", nameAr: "التوظيف", count: 22, parent: "hr" },
  { id: "hr-benefits", name: "Benefits & Payroll", nameAr: "المزايا والرواتب", count: 31, parent: "hr" },
  { id: "hr-learning", name: "Learning & Development", nameAr: "التعلّم والتطوير", count: 18, parent: "hr" },
  { id: "fin", name: "Finance", nameAr: "المالية", count: 56, parent: null },
  { id: "fin-budgets", name: "Budgets & Forecasts", nameAr: "الميزانيات والتوقعات", count: 20, parent: "fin" },
  { id: "fin-invoices", name: "Invoices & Payments", nameAr: "الفواتير والمدفوعات", count: 27, parent: "fin" },
  { id: "ops", name: "Operations", nameAr: "العمليات", count: 132, parent: null },
  { id: "ops-safety", name: "Health & Safety", nameAr: "الصحة والسلامة", count: 40, parent: "ops" },
  { id: "ops-manuals", name: "Manuals & SOPs", nameAr: "الأدلة والإجراءات", count: 61, parent: "ops" },
  { id: "it", name: "IT & Security", nameAr: "تقنية المعلومات", count: 47, parent: null },
  { id: "corp", name: "Corporate", nameAr: "المؤسسية", count: 38, parent: null },
  { id: "legal", name: "Legal", nameAr: "القانونية", count: 29, parent: null },
]

export type Doc = {
  id: string
  name: string
  nameAr: string
  folder: string
  type: "PDF" | "XLSX" | "DOCX"
  size: string
  dept: string
  deptAr: string
  updated: string
  updatedAr: string
  ver: string
  downloads: number
  owner: string
  ownerAr: string
  restricted?: boolean
  /** ISO date (YYYY-MM-DD). When set and reached, the file is auto-archived. */
  archiveAfter?: string | null
}

/** "Today" for the prototype — drives auto-archive evaluation. */
export const DOC_TODAY_ISO = "2026-08-12"
/** A file is archived once its archive date has passed (ISO strings compare lexically). */
export const isArchived = (d: Doc, today: string = DOC_TODAY_ISO) => !!d.archiveAfter && d.archiveAfter <= today
/** A file with a future archive date is scheduled but still active. */
export const isArchiveScheduled = (d: Doc, today: string = DOC_TODAY_ISO) => !!d.archiveAfter && d.archiveAfter > today

const HAND_DOCS: Doc[] = [
  { id: "d1", name: "Employee Handbook 2026", nameAr: "دليل الموظف ٢٠٢٦", folder: "hr", type: "PDF", size: "3.2 MB", dept: "HR", deptAr: "الموارد البشرية", updated: "Aug 2, 2026", updatedAr: "٢ أغسطس ٢٠٢٦", ver: "v6", downloads: 1240, owner: "People & Culture", ownerAr: "الموظفون والثقافة" },
  { id: "d2", name: "Brand Guidelines", nameAr: "دليل الهوية", folder: "corp", type: "PDF", size: "12.4 MB", dept: "Corporate", deptAr: "المؤسسية", updated: "Jul 20, 2026", updatedAr: "٢٠ يوليو ٢٠٢٦", ver: "v2", downloads: 380, owner: "Marketing", ownerAr: "التسويق" },
  { id: "d3", name: "FY26 Budget Template", nameAr: "قالب ميزانية ٢٠٢٦", folder: "fin-budgets", type: "XLSX", size: "240 KB", dept: "Finance", deptAr: "المالية", updated: "Aug 5, 2026", updatedAr: "٥ أغسطس ٢٠٢٦", ver: "v3", downloads: 96, owner: "Finance", ownerAr: "المالية", restricted: true },
  { id: "d4", name: "Terminal Operations Manual", nameAr: "دليل عمليات المحطة", folder: "ops-manuals", type: "PDF", size: "8.1 MB", dept: "Operations", deptAr: "العمليات", updated: "Jun 15, 2026", updatedAr: "١٥ يونيو ٢٠٢٦", ver: "v4", downloads: 512, owner: "Operations", ownerAr: "العمليات", archiveAfter: "2027-01-15" },
  { id: "d5", name: "Vendor Onboarding Form", nameAr: "نموذج تسجيل المورّد", folder: "fin-invoices", type: "DOCX", size: "88 KB", dept: "Procurement", deptAr: "المشتريات", updated: "Jul 28, 2026", updatedAr: "٢٨ يوليو ٢٠٢٦", ver: "v1", downloads: 143, owner: "Procurement", ownerAr: "المشتريات" },
  { id: "d6", name: "Data Classification Policy", nameAr: "سياسة تصنيف البيانات", folder: "it", type: "PDF", size: "420 KB", dept: "IT", deptAr: "تقنية المعلومات", updated: "Feb 1, 2026", updatedAr: "١ فبراير ٢٠٢٦", ver: "v2", downloads: 210, owner: "IT & Security", ownerAr: "تقنية المعلومات والأمن", restricted: true, archiveAfter: "2026-07-01" },
  { id: "d7", name: "Leave Request Form", nameAr: "نموذج طلب إجازة", folder: "hr-benefits", type: "DOCX", size: "64 KB", dept: "HR", deptAr: "الموارد البشرية", updated: "May 10, 2026", updatedAr: "١٠ مايو ٢٠٢٦", ver: "v2", downloads: 890, owner: "People & Culture", ownerAr: "الموظفون والثقافة" },
  { id: "d8", name: "Incident Report Template", nameAr: "قالب تقرير حادث", folder: "ops-safety", type: "DOCX", size: "120 KB", dept: "Operations", deptAr: "العمليات", updated: "Jul 3, 2026", updatedAr: "٣ يوليو ٢٠٢٦", ver: "v1", downloads: 205, owner: "HSE", ownerAr: "الصحة والسلامة" },
  { id: "d9", name: "Non-Disclosure Agreement", nameAr: "اتفاقية عدم الإفصاح", folder: "legal", type: "PDF", size: "180 KB", dept: "Legal", deptAr: "القانونية", updated: "Apr 12, 2026", updatedAr: "١٢ أبريل ٢٠٢٦", ver: "v3", downloads: 132, owner: "Legal & Compliance", ownerAr: "الشؤون القانونية", restricted: true, archiveAfter: "2026-06-30" },
  { id: "d10", name: "Expense Claim Sheet", nameAr: "كشف مطالبة المصروفات", folder: "fin-invoices", type: "XLSX", size: "96 KB", dept: "Finance", deptAr: "المالية", updated: "Aug 1, 2026", updatedAr: "١ أغسطس ٢٠٢٦", ver: "v5", downloads: 640, owner: "Finance", ownerAr: "المالية" },
]

// ── Synthetic bulk documents ─────────────────────────────────────────────────
// Deterministically generated so the library has enough content to exercise the
// scale-oriented UI (folder tree, search, type filter, sort, pagination).
const DOC_TITLES: [string, string][] = [
  ["Quarterly Report", "تقرير ربع سنوي"], ["Standard Operating Procedure", "إجراء تشغيل قياسي"],
  ["Onboarding Checklist", "قائمة الانضمام"], ["Compliance Certificate", "شهادة امتثال"],
  ["Meeting Minutes", "محضر اجتماع"], ["Training Manual", "دليل تدريب"],
  ["Audit Findings", "نتائج التدقيق"], ["Vendor Contract", "عقد مورّد"],
  ["Risk Assessment", "تقييم المخاطر"], ["Budget Forecast", "توقعات الميزانية"],
  ["Service Agreement", "اتفاقية خدمة"], ["Incident Log", "سجل الحوادث"],
  ["Performance Review", "تقييم الأداء"], ["Project Charter", "ميثاق مشروع"],
  ["Technical Specification", "مواصفات فنية"], ["Policy Brief", "موجز سياسة"],
]
const GEN_SIZES = ["96 KB", "240 KB", "512 KB", "840 KB", "1.2 MB", "2.4 MB", "3.8 MB", "5.6 MB"]
const GEN_DATES: [string, string][] = [
  ["Aug 8, 2026", "٨ أغسطس ٢٠٢٦"], ["Jul 30, 2026", "٣٠ يوليو ٢٠٢٦"], ["Jun 14, 2026", "١٤ يونيو ٢٠٢٦"],
  ["May 2, 2026", "٢ مايو ٢٠٢٦"], ["Apr 19, 2026", "١٩ أبريل ٢٠٢٦"], ["Mar 3, 2026", "٣ مارس ٢٠٢٦"],
]
const GEN_FOLDERS: [string, string, string][] = [
  ["hr", "HR", "الموارد البشرية"], ["hr-recruit", "Recruitment", "التوظيف"], ["hr-benefits", "Benefits", "المزايا"],
  ["hr-learning", "L&D", "التعلّم والتطوير"], ["fin", "Finance", "المالية"], ["fin-budgets", "Budgets", "الميزانيات"],
  ["fin-invoices", "Invoices", "الفواتير"], ["ops", "Operations", "العمليات"], ["ops-safety", "Safety", "السلامة"],
  ["ops-manuals", "Operations", "العمليات"], ["it", "IT", "تقنية المعلومات"], ["corp", "Corporate", "المؤسسية"],
  ["legal", "Legal", "القانونية"],
]
const GEN_TYPES: Doc["type"][] = ["PDF", "DOCX", "XLSX"]

function generateDocs(): Doc[] {
  const out: Doc[] = []
  let n = 100
  GEN_FOLDERS.forEach(([fid, dept, deptAr], fi) => {
    const per = 4 + (fi % 3) // 4–6 documents per folder
    for (let i = 0; i < per; i++) {
      n++
      const [tn, tnAr] = DOC_TITLES[(fi * 3 + i) % DOC_TITLES.length]
      const type = GEN_TYPES[(fi + i) % GEN_TYPES.length]
      const [upd, updAr] = GEN_DATES[(fi + i) % GEN_DATES.length]
      out.push({
        id: `d${n}`, name: `${tn} ${String(i + 1).padStart(2, "0")}`, nameAr: `${tnAr} ${i + 1}`,
        folder: fid, type, size: GEN_SIZES[(fi + i) % GEN_SIZES.length], dept, deptAr,
        updated: upd, updatedAr: updAr, ver: `v${1 + (i % 4)}`, downloads: 40 + ((n * 37) % 900),
        owner: dept, ownerAr: deptAr, restricted: n % 9 === 0,
      })
    }
  })
  return out
}

export const DOCS: Doc[] = [...HAND_DOCS, ...generateDocs()]

export const TYPE_STYLE: Record<Doc["type"], string> = {
  PDF: "bg-[#ce7b5b]",
  XLSX: "bg-[#3f7c77]",
  DOCX: "bg-[#8e4c58]",
}

const store = createCollection<Doc>(DOCS, "documents")
export const useDocuments = () => store.use()
export const addDocument = (d: Doc) => store.add(d)
export const updateDocument = (id: string, patch: Partial<Doc>) => store.update(id, patch)
export const deleteDocument = (id: string) => store.remove(id)
export function getDocumentById(id: string): Doc | undefined {
  return store.getById(id)
}

// ── Folders (reactive so new folders can be created from the library) ─────────
const folderStore = createCollection<FolderDef>(FOLDERS, "folders")
export const useFolders = () => folderStore.use()
export const addFolder = (f: FolderDef) => folderStore.append(f)
export const deleteFolder = (id: string) => folderStore.remove(id)
export const folderById = (id: string) => folderStore.getById(id)
export const newFolderId = () => `fld-${Date.now().toString(36)}`

const DOC_MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const DOC_MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
/** Format an ISO date ("2026-08-12") for display; falls back to the raw string. */
export function formatDocDate(iso: string | null | undefined, isAr: boolean): string {
  if (!iso) return ""
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return iso
  const [, y, mo, d] = m
  const mon = (isAr ? DOC_MONTHS_AR : DOC_MONTHS_EN)[Number(mo) - 1] ?? mo
  return isAr ? `${Number(d)} ${mon} ${y}` : `${mon} ${Number(d)}, ${y}`
}

/** Mock preview body — a plausible rendered representation per file type. */
export function documentPreview(d: Doc, isAr: boolean): string {
  const title = isAr ? d.nameAr : d.name
  if (d.type === "XLSX") {
    const head = isAr ? ["البند", "الفئة", "المبلغ", "الحالة"] : ["Item", "Category", "Amount", "Status"]
    const rows = isAr
      ? [["سفر", "مصروفات", "٤٬٢٠٠", "معتمد"], ["إقامة", "مصروفات", "٢٬٨٥٠", "قيد المراجعة"], ["مواصلات", "مصروفات", "٦٤٠", "معتمد"]]
      : [["Travel", "Expense", "4,200", "Approved"], ["Accommodation", "Expense", "2,850", "Pending"], ["Transport", "Expense", "640", "Approved"]]
    return `<h3>${title}</h3>
      <table><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
      <tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>
      <p class="note">${isAr ? "معاينة — يحتوي الملف الكامل على أوراق وصيغ إضافية." : "Preview — the full spreadsheet contains additional sheets and formulas."}</p>`
  }
  if (d.type === "DOCX") {
    return `<h3>${title}</h3>
      <p>${isAr ? "يُستخدم هذا النموذج لتقديم الطلبات الرسمية. يُرجى تعبئة جميع الحقول المطلوبة وإرفاق المستندات الداعمة." : "This form is used to submit official requests. Please complete all required fields and attach supporting documents."}</p>
      <p><strong>${isAr ? "القسم أ — التفاصيل" : "Section A — Details"}</strong></p>
      <ul><li>${isAr ? "الاسم / الرقم الوظيفي" : "Name / Employee ID"}</li><li>${isAr ? "الإدارة" : "Department"}</li><li>${isAr ? "التاريخ ونوع الطلب" : "Date and request type"}</li></ul>
      <p class="note">${isAr ? "معاينة — افتح الملف للتعبئة والتوقيع." : "Preview — open the file to complete and sign."}</p>`
  }
  return `<h3>${title}</h3>
    <p>${isAr ? "هذه معاينة للصفحة الأولى من المستند. يقدّم هذا المستند إرشادات ومعايير معتمدة للاستخدام داخل المؤسسة." : "This is a preview of the document's first page. It provides approved guidance and standards for use across the organization."}</p>
    <p><strong>1. ${isAr ? "المقدمة" : "Introduction"}</strong></p>
    <p>${isAr ? "يحدّد هذا القسم الغرض والنطاق والجمهور المستهدف من المستند." : "This section sets out the purpose, scope and intended audience of the document."}</p>
    <p><strong>2. ${isAr ? "الإرشادات" : "Guidance"}</strong></p>
    <p>${isAr ? "تفاصيل كاملة متاحة في النسخة القابلة للتحميل من المستند." : "Full details are available in the downloadable version of the document."}</p>
    <p class="note">${isAr ? "معاينة الصفحة ١ — نزّل الملف لعرض المستند كاملًا." : "Page 1 preview — download the file to view the full document."}</p>`
}
