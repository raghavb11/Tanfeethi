import * as React from "react"

export type TaskStatus = "open" | "in-progress" | "completed"
export type TaskPriority = "high" | "medium" | "low"
export type Task = {
  id: string
  title: string; titleAr: string
  project: string; projectAr: string
  due: string; dueAr: string; dueISO: string
  priority: TaskPriority
  status: TaskStatus
  assignedBy: string; assignedByAr: string
  description?: string; descriptionAr?: string
  checklist?: { id: string; label: string; labelAr: string; done: boolean }[]
}

/** "Today" for the prototype — drives the overdue calculation. */
export const TASK_TODAY_ISO = "2026-08-12"
export const isOverdue = (t: Task) => t.status !== "completed" && t.dueISO < TASK_TODAY_ISO

const SEED: Task[] = [
  { id: "t1", title: "Finalize Q2 operations brief", titleAr: "إتمام موجز عمليات الربع الثاني", project: "Operations · Q2", projectAr: "العمليات · الربع الثاني", due: "Aug 12, 2026", dueAr: "١٢ أغسطس", dueISO: "2026-08-12", priority: "high", status: "in-progress", assignedBy: "Ahmed Mohammed", assignedByAr: "أحمد محمد",
    description: "Consolidate the Q2 operational metrics, terminal throughput and incident summary into the executive brief ahead of Thursday's leadership session. Align the narrative with the Q3 priorities deck.",
    descriptionAr: "توحيد مؤشرات التشغيل للربع الثاني وحركة المبنى وملخص الحوادث في الموجز التنفيذي قبل جلسة القيادة يوم الخميس، بما يتوافق مع عرض أولويات الربع الثالث.",
    checklist: [
      { id: "c1", label: "Pull Q2 throughput & KPI data", labelAr: "استخراج بيانات الحركة والمؤشرات", done: true },
      { id: "c2", label: "Draft executive summary", labelAr: "صياغة الملخص التنفيذي", done: true },
      { id: "c3", label: "Review with Operations leads", labelAr: "المراجعة مع قادة العمليات", done: false },
      { id: "c4", label: "Finalize slides & circulate", labelAr: "إنهاء الشرائح وتعميمها", done: false },
    ] },
  { id: "t2", title: "Review safety compliance audit", titleAr: "مراجعة تدقيق الامتثال للسلامة", project: "Safety & Standards", projectAr: "السلامة والمعايير", due: "Aug 14, 2026", dueAr: "١٤ أغسطس", dueISO: "2026-08-14", priority: "high", status: "open", assignedBy: "HSE Team", assignedByAr: "فريق السلامة",
    description: "Review the ground-safety compliance audit findings, confirm corrective actions for each non-conformance, and sign off the closure report.",
    descriptionAr: "مراجعة نتائج تدقيق الامتثال للسلامة الأرضية، وتأكيد الإجراءات التصحيحية لكل حالة عدم مطابقة، واعتماد تقرير الإغلاق." },
  { id: "t3", title: "Approve IT hardware budget", titleAr: "الموافقة على ميزانية أجهزة تقنية المعلومات", project: "Finance · IT", projectAr: "المالية · تقنية المعلومات", due: "Aug 16, 2026", dueAr: "١٦ أغسطس", dueISO: "2026-08-16", priority: "medium", status: "open", assignedBy: "Finance", assignedByAr: "المالية" },
  { id: "t4", title: "Complete mandatory training module", titleAr: "إكمال وحدة التدريب الإلزامي", project: "People Ops", projectAr: "عمليات الموارد البشرية", due: "Aug 20, 2026", dueAr: "٢٠ أغسطس", dueISO: "2026-08-20", priority: "low", status: "open", assignedBy: "People & Culture", assignedByAr: "الموظفون والثقافة" },
  { id: "t5", title: "Sign off VIP lounge renovation scope", titleAr: "اعتماد نطاق تجديد صالة كبار الضيوف", project: "Capital Projects", projectAr: "مشاريع رأس المال", due: "Aug 10, 2026", dueAr: "١٠ أغسطس", dueISO: "2026-08-10", priority: "high", status: "open", assignedBy: "Ahmed Hassan", assignedByAr: "أحمد حسن" },
  { id: "t6", title: "Submit July expense report", titleAr: "تقديم تقرير مصروفات يوليو", project: "Finance", projectAr: "المالية", due: "Aug 5, 2026", dueAr: "٥ أغسطس", dueISO: "2026-08-05", priority: "medium", status: "open", assignedBy: "Finance", assignedByAr: "المالية" },
  { id: "t7", title: "Prepare Wave 2 rollout deck", titleAr: "إعداد عرض إطلاق الموجة الثانية", project: "Digital Workplace", projectAr: "بيئة العمل الرقمية", due: "Aug 18, 2026", dueAr: "١٨ أغسطس", dueISO: "2026-08-18", priority: "medium", status: "in-progress", assignedBy: "Digital Services", assignedByAr: "الخدمات الرقمية", },
  { id: "t8", title: "Review vendor contract renewals", titleAr: "مراجعة تجديد عقود الموردين", project: "Procurement", projectAr: "المشتريات", due: "Aug 22, 2026", dueAr: "٢٢ أغسطس", dueISO: "2026-08-22", priority: "medium", status: "open", assignedBy: "Procurement", assignedByAr: "المشتريات" },
  { id: "t9", title: "1:1 notes — Maya", titleAr: "ملاحظات اجتماع — مايا", project: "Team", projectAr: "الفريق", due: "Aug 13, 2026", dueAr: "١٣ أغسطس", dueISO: "2026-08-13", priority: "low", status: "in-progress", assignedBy: "Self", assignedByAr: "شخصي" },
  { id: "t10", title: "Acknowledge Information Security Policy v4.0", titleAr: "الإقرار بسياسة أمن المعلومات 4.0", project: "Compliance", projectAr: "الامتثال", due: "Aug 15, 2026", dueAr: "١٥ أغسطس", dueISO: "2026-08-15", priority: "high", status: "open", assignedBy: "IT & Security", assignedByAr: "تقنية المعلومات والأمن" },
  { id: "t11", title: "Confirm Q3 town hall agenda", titleAr: "تأكيد جدول اللقاء القيادي للربع الثالث", project: "Executive Office", projectAr: "المكتب التنفيذي", due: "Aug 4, 2026", dueAr: "٤ أغسطس", dueISO: "2026-08-04", priority: "medium", status: "completed", assignedBy: "Executive Office", assignedByAr: "المكتب التنفيذي" },
  { id: "t12", title: "Publish updated org chart", titleAr: "نشر الهيكل التنظيمي المحدّث", project: "People Ops", projectAr: "عمليات الموارد البشرية", due: "Jul 30, 2026", dueAr: "٣٠ يوليو", dueISO: "2026-07-30", priority: "low", status: "completed", assignedBy: "People & Culture", assignedByAr: "الموظفون والثقافة" },
  { id: "t13", title: "Close terminal expansion milestone 2", titleAr: "إغلاق معلم توسعة المبنى الثاني", project: "Capital Projects", projectAr: "مشاريع رأس المال", due: "Jul 28, 2026", dueAr: "٢٨ يوليو", dueISO: "2026-07-28", priority: "high", status: "completed", assignedBy: "Capital Projects", assignedByAr: "مشاريع رأس المال" },
  { id: "t14", title: "Respond to Q3 Employee Pulse survey", titleAr: "الرد على استبيان نبض الموظفين للربع الثالث", project: "People Ops", projectAr: "عمليات الموارد البشرية", due: "Aug 8, 2026", dueAr: "٨ أغسطس", dueISO: "2026-08-08", priority: "low", status: "completed", assignedBy: "People & Culture", assignedByAr: "الموظفون والثقافة" },
]

let tasks: Task[] = SEED
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l) }

export function useTasks(): Task[] {
  return React.useSyncExternalStore(subscribe, () => tasks)
}
export function setTaskStatus(id: string, status: TaskStatus) {
  tasks = tasks.map((t) => (t.id === id ? { ...t, status } : t))
  emit()
}
export function toggleComplete(id: string) {
  tasks = tasks.map((t) => (t.id === id ? { ...t, status: t.status === "completed" ? "open" : "completed" } : t))
  emit()
}
export function toggleChecklistItem(taskId: string, itemId: string) {
  tasks = tasks.map((t) => (t.id === taskId
    ? { ...t, checklist: (t.checklist ?? []).map((c) => (c.id === itemId ? { ...c, done: !c.done } : c)) }
    : t))
  emit()
}
export const getTaskById = (id: string) => tasks.find((t) => t.id === id)
export const countByStatus = (list: Task[]) => ({
  all: list.length,
  open: list.filter((t) => t.status === "open").length,
  inProgress: list.filter((t) => t.status === "in-progress").length,
  completed: list.filter((t) => t.status === "completed").length,
  overdue: list.filter(isOverdue).length,
})
