import * as React from "react"

import { projectIdForName } from "./projects"

export type TaskStatus = "open" | "in-progress" | "completed"
export type TaskPriority = "high" | "medium" | "low"
export type Task = {
  id: string
  title: string; titleAr: string
  /** The project master row this task is filed under, plus a name snapshot. */
  projectId?: string
  project: string; projectAr: string
  due: string; dueAr: string; dueISO: string
  priority: TaskPriority
  status: TaskStatus
  assignedBy: string; assignedByAr: string
  /** Whose task it is. Undefined = the signed-in employee's own task. */
  assigneeId?: string
  assignee?: string; assigneeAr?: string
  description?: string; descriptionAr?: string
}

/** "Today" for the prototype — drives the overdue calculation. */
export const TASK_TODAY_ISO = "2026-08-12"
export const isOverdue = (t: Task) => t.status !== "completed" && t.dueISO < TASK_TODAY_ISO

const SEED: Task[] = [
  { id: "t1", title: "Finalize Q2 operations brief", titleAr: "إتمام موجز عمليات الربع الثاني", project: "Operations · Q2", projectAr: "العمليات · الربع الثاني", due: "Aug 12, 2026", dueAr: "١٢ أغسطس", dueISO: "2026-08-12", priority: "high", status: "in-progress", assignedBy: "Ahmed Mohammed", assignedByAr: "أحمد محمد",
    description: "Consolidate the Q2 operational metrics, terminal throughput and incident summary into the executive brief ahead of Thursday's leadership session. Align the narrative with the Q3 priorities deck.",
    descriptionAr: "توحيد مؤشرات التشغيل للربع الثاني وحركة المبنى وملخص الحوادث في الموجز التنفيذي قبل جلسة القيادة يوم الخميس، بما يتوافق مع عرض أولويات الربع الثالث." },
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

/** Tasks the manager's reports are carrying. Seeded so the team view has
 *  something to show; a real build reads them from the same table. */
const TEAM_SEED: Task[] = [
  { id: "tm1", assigneeId: "r1", assignee: "Sara Al-Mutairi", assigneeAr: "سارة المطيري", title: "Draft terminal throughput model", titleAr: "إعداد نموذج حركة المبنى", project: "Operations · Q3", projectAr: "العمليات · الربع الثالث", due: "Aug 14, 2026", dueAr: "١٤ أغسطس", dueISO: "2026-08-14", priority: "high", status: "in-progress", assignedBy: "Khalid Al-Qahtani", assignedByAr: "خالد القحطاني" },
  { id: "tm2", assigneeId: "r1", assignee: "Sara Al-Mutairi", assigneeAr: "سارة المطيري", title: "Requirements walkthrough — Leave module", titleAr: "استعراض متطلبات وحدة الإجازات", project: "Digital Workplace", projectAr: "بيئة العمل الرقمية", due: "Aug 10, 2026", dueAr: "١٠ أغسطس", dueISO: "2026-08-10", priority: "medium", status: "open", assignedBy: "Khalid Al-Qahtani", assignedByAr: "خالد القحطاني" },
  { id: "tm3", assigneeId: "r1", assignee: "Sara Al-Mutairi", assigneeAr: "سارة المطيري", title: "Close UAT findings batch 2", titleAr: "إغلاق ملاحظات اختبار القبول الدفعة 2", project: "Digital Workplace", projectAr: "بيئة العمل الرقمية", due: "Aug 6, 2026", dueAr: "٦ أغسطس", dueISO: "2026-08-06", priority: "medium", status: "completed", assignedBy: "Khalid Al-Qahtani", assignedByAr: "خالد القحطاني" },
  { id: "tm4", assigneeId: "r2", assignee: "Mohammad Iqbal", assigneeAr: "محمد إقبال", title: "Terminal 2 shift roster — September", titleAr: "جدول ورديات الصالة 2 — سبتمبر", project: "Operations", projectAr: "العمليات", due: "Aug 9, 2026", dueAr: "٩ أغسطس", dueISO: "2026-08-09", priority: "high", status: "in-progress", assignedBy: "Khalid Al-Qahtani", assignedByAr: "خالد القحطاني" },
  { id: "tm5", assigneeId: "r2", assignee: "Mohammad Iqbal", assigneeAr: "محمد إقبال", title: "Investigate baggage belt incident #4471", titleAr: "التحقيق في حادثة سير الأمتعة #4471", project: "Safety & Standards", projectAr: "السلامة والمعايير", due: "Aug 7, 2026", dueAr: "٧ أغسطس", dueISO: "2026-08-07", priority: "high", status: "open", assignedBy: "HSE Team", assignedByAr: "فريق السلامة" },
  { id: "tm6", assigneeId: "r2", assignee: "Mohammad Iqbal", assigneeAr: "محمد إقبال", title: "Vendor SLA review — ground handling", titleAr: "مراجعة اتفاقية مستوى الخدمة — المناولة الأرضية", project: "Procurement", projectAr: "المشتريات", due: "Aug 21, 2026", dueAr: "٢١ أغسطس", dueISO: "2026-08-21", priority: "medium", status: "open", assignedBy: "Khalid Al-Qahtani", assignedByAr: "خالد القحطاني" },
  { id: "tm7", assigneeId: "r3", assignee: "Layan Al Marwani", assigneeAr: "ليان المرواني", title: "Arabic copy review — Services module", titleAr: "مراجعة النصوص العربية — وحدة الخدمات", project: "Digital Workplace", projectAr: "بيئة العمل الرقمية", due: "Aug 15, 2026", dueAr: "١٥ أغسطس", dueISO: "2026-08-15", priority: "medium", status: "in-progress", assignedBy: "Khalid Al-Qahtani", assignedByAr: "خالد القحطاني" },
  { id: "tm8", assigneeId: "r3", assignee: "Layan Al Marwani", assigneeAr: "ليان المرواني", title: "Process map — cafeteria ordering", titleAr: "خريطة عملية طلبات الكافتيريا", project: "Employee Services", projectAr: "خدمات الموظفين", due: "Aug 19, 2026", dueAr: "١٩ أغسطس", dueISO: "2026-08-19", priority: "low", status: "open", assignedBy: "Khalid Al-Qahtani", assignedByAr: "خالد القحطاني" },
  { id: "tm9", assigneeId: "r4", assignee: "Noura Saleh", assigneeAr: "نورة صالح", title: "Handover notes before annual leave", titleAr: "ملاحظات التسليم قبل الإجازة السنوية", project: "Team", projectAr: "الفريق", due: "Aug 11, 2026", dueAr: "١١ أغسطس", dueISO: "2026-08-11", priority: "medium", status: "completed", assignedBy: "Khalid Al-Qahtani", assignedByAr: "خالد القحطاني" },
  { id: "tm10", assigneeId: "r4", assignee: "Noura Saleh", assigneeAr: "نورة صالح", title: "Update service catalogue entries", titleAr: "تحديث بنود دليل الخدمات", project: "Employee Services", projectAr: "خدمات الموظفين", due: "Aug 25, 2026", dueAr: "٢٥ أغسطس", dueISO: "2026-08-25", priority: "low", status: "open", assignedBy: "Khalid Al-Qahtani", assignedByAr: "خالد القحطاني" },
  { id: "tm11", assigneeId: "r5", assignee: "Faisal Al-Harbi", assigneeAr: "فيصل الحربي", title: "Daily ops report automation", titleAr: "أتمتة تقرير العمليات اليومي", project: "Operations", projectAr: "العمليات", due: "Aug 8, 2026", dueAr: "٨ أغسطس", dueISO: "2026-08-08", priority: "high", status: "open", assignedBy: "Khalid Al-Qahtani", assignedByAr: "خالد القحطاني" },
  { id: "tm12", assigneeId: "r5", assignee: "Faisal Al-Harbi", assigneeAr: "فيصل الحربي", title: "Lounge access audit — July", titleAr: "تدقيق دخول الصالات — يوليو", project: "Compliance", projectAr: "الامتثال", due: "Aug 4, 2026", dueAr: "٤ أغسطس", dueISO: "2026-08-04", priority: "medium", status: "open", assignedBy: "Khalid Al-Qahtani", assignedByAr: "خالد القحطاني" },
  { id: "tm13", assigneeId: "r5", assignee: "Faisal Al-Harbi", assigneeAr: "فيصل الحربي", title: "Complete mandatory safety refresher", titleAr: "إكمال دورة السلامة التنشيطية", project: "People Ops", projectAr: "عمليات الموارد البشرية", due: "Aug 20, 2026", dueAr: "٢٠ أغسطس", dueISO: "2026-08-20", priority: "low", status: "in-progress", assignedBy: "People & Culture", assignedByAr: "الموظفون والثقافة" },
  { id: "tm14", assigneeId: "r6", assignee: "Saud Al-Dosari", assigneeAr: "سعود الدوسري", title: "VIP lounge readiness checklist", titleAr: "قائمة جاهزية صالة كبار الضيوف", project: "Guest Experience", projectAr: "تجربة الضيوف", due: "Aug 13, 2026", dueAr: "١٣ أغسطس", dueISO: "2026-08-13", priority: "high", status: "in-progress", assignedBy: "Khalid Al-Qahtani", assignedByAr: "خالد القحطاني" },
  { id: "tm15", assigneeId: "r6", assignee: "Saud Al-Dosari", assigneeAr: "سعود الدوسري", title: "Tea-boy shift coverage plan", titleAr: "خطة تغطية ورديات خدمة الضيافة", project: "Employee Services", projectAr: "خدمات الموظفين", due: "Aug 18, 2026", dueAr: "١٨ أغسطس", dueISO: "2026-08-18", priority: "medium", status: "open", assignedBy: "Khalid Al-Qahtani", assignedByAr: "خالد القحطاني" },
  { id: "tm16", assigneeId: "r7", assignee: "Reem Al-Otaibi", assigneeAr: "ريم العتيبي", title: "Attendance dashboard data model", titleAr: "نموذج بيانات لوحة الحضور", project: "Digital Workplace", projectAr: "بيئة العمل الرقمية", due: "Aug 17, 2026", dueAr: "١٧ أغسطس", dueISO: "2026-08-17", priority: "medium", status: "in-progress", assignedBy: "Khalid Al-Qahtani", assignedByAr: "خالد القحطاني" },
  { id: "tm17", assigneeId: "r7", assignee: "Reem Al-Otaibi", assigneeAr: "ريم العتيبي", title: "Q2 utilisation analysis", titleAr: "تحليل الاستغلال للربع الثاني", project: "Operations · Q2", projectAr: "العمليات · الربع الثاني", due: "Aug 5, 2026", dueAr: "٥ أغسطس", dueISO: "2026-08-05", priority: "low", status: "completed", assignedBy: "Khalid Al-Qahtani", assignedByAr: "خالد القحطاني" },
  { id: "tm18", assigneeId: "r8", assignee: "Turki Al-Shehri", assigneeAr: "تركي الشهري", title: "Gate allocation trial — Terminal 1", titleAr: "تجربة توزيع البوابات — الصالة 1", project: "Operations", projectAr: "العمليات", due: "Aug 3, 2026", dueAr: "٣ أغسطس", dueISO: "2026-08-03", priority: "high", status: "open", assignedBy: "Khalid Al-Qahtani", assignedByAr: "خالد القحطاني" },
  { id: "tm19", assigneeId: "r8", assignee: "Turki Al-Shehri", assigneeAr: "تركي الشهري", title: "Submit July overtime sheet", titleAr: "تقديم كشف العمل الإضافي ليوليو", project: "Finance", projectAr: "المالية", due: "Aug 16, 2026", dueAr: "١٦ أغسطس", dueISO: "2026-08-16", priority: "low", status: "open", assignedBy: "Finance", assignedByAr: "المالية" },
]

/** Seeded rows were written before the project master existed — link them. */
const linked = (list: Task[]) =>
  list.map((t) => (t.projectId ? t : { ...t, projectId: projectIdForName(t.project) }))

let tasks: Task[] = linked([...SEED, ...TEAM_SEED])
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l) }

export function useTasks(): Task[] {
  return React.useSyncExternalStore(subscribe, () => tasks)
}
export const newTaskId = () => `t-${Date.now().toString(36)}`
/** New tasks go to the top of the list. */
export function addTask(task: Task) {
  tasks = [task, ...tasks]
  emit()
}
export function setTaskStatus(id: string, status: TaskStatus) {
  const before = tasks.find((t) => t.id === id)
  tasks = tasks.map((t) => (t.id === id ? { ...t, status } : t))
  if (before) logStatus(id, before.status, status)
  emit()
}
export function toggleComplete(id: string) {
  const before = tasks.find((t) => t.id === id)
  tasks = tasks.map((t) => (t.id === id ? { ...t, status: t.status === "completed" ? "open" : "completed" } : t))
  if (before) logStatus(id, before.status, before.status === "completed" ? "open" : "completed")
  emit()
}
export const getTaskById = (id: string) => tasks.find((t) => t.id === id)

// ── progress updates ─────────────────────────────────────────────

/** What kind of entry it is: someone wrote it, or the system recorded a move. */
export type TaskEventKind = "comment" | "status" | "due"

export type TaskEvent = {
  id: string
  taskId: string
  kind: TaskEventKind
  author: string; authorAr: string
  initials: string
  /** The update itself, for a comment. */
  text?: string
  /** Where the task moved, for a status entry. */
  from?: TaskStatus
  to?: TaskStatus
  /** Where the due date moved, for a due entry. */
  fromDue?: string
  toDue?: string
  /** The day the update is about — today unless the author changed it. */
  dateISO?: string
  /** Percent complete the author reported with the update. */
  progress?: number
  /** Written by the line manager rather than the person doing the work. */
  manager?: boolean
  at: string; atAr: string
}

/** The signed-in employee. A real build takes this from the session. */
export const ME = { name: "Khalid Al-Qahtani", nameAr: "خالد القحطاني", initials: "KQ" }

const SEED_EVENTS: TaskEvent[] = [
  { id: "e1", taskId: "t1", kind: "status", from: "open", to: "in-progress", author: ME.name, authorAr: ME.nameAr, initials: ME.initials, at: "5 days ago", atAr: "قبل 5 أيام" },
  { id: "e2", taskId: "t1", kind: "comment", author: ME.name, authorAr: ME.nameAr, initials: ME.initials, progress: 40,
    text: "Q2 throughput and KPI data pulled from the ops warehouse. Incident summary still waiting on HSE.", at: "4 days ago", atAr: "قبل 4 أيام" },
  { id: "e3", taskId: "t1", kind: "comment", author: "Reem Al-Otaibi", authorAr: "ريم العتيبي", initials: "RO",
    text: "Utilisation figures are final — use the 78% number, not the draft one.", at: "2 days ago", atAr: "قبل يومين" },
  { id: "e4", taskId: "t1", kind: "comment", author: ME.name, authorAr: ME.nameAr, initials: ME.initials, progress: 65,
    text: "Executive summary drafted. Review with the Operations leads is booked for Wednesday.", at: "Yesterday", atAr: "أمس" },
  { id: "e5", taskId: "tm4", kind: "comment", author: "Mohammad Iqbal", authorAr: "محمد إقبال", initials: "MI", progress: 50,
    text: "Roster built for weeks 1 and 2. Weeks 3 and 4 depend on the leave approvals still pending.", at: "Yesterday", atAr: "أمس" },
  { id: "e6", taskId: "tm11", kind: "comment", author: "Faisal Al-Harbi", authorAr: "فيصل الحربي", initials: "FH",
    text: "Blocked — the reporting service account has no read access to the ops schema yet. Raised INC-4471 with IT.", at: "3 days ago", atAr: "قبل 3 أيام" },
]

let events: TaskEvent[] = SEED_EVENTS

export function useTaskEvents(taskId: string): TaskEvent[] {
  const all = React.useSyncExternalStore(subscribe, () => events)
  return React.useMemo(() => all.filter((e) => e.taskId === taskId), [all, taskId])
}

/** How many people-written updates a task carries — for the list and board cards. */
export const commentCount = (taskId: string) =>
  events.filter((e) => e.taskId === taskId && e.kind === "comment").length

/** The last percentage anyone reported on this task, if any. */
export const reportedProgress = (taskId: string): number | undefined => {
  const withPct = events.filter((e) => e.taskId === taskId && e.progress !== undefined)
  return withPct.length ? withPct[withPct.length - 1].progress : undefined
}

/** Dates as the seeded rows read them. */
export const prettyDate = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""
export const prettyDateAr = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString("ar-EG", { month: "long", day: "numeric" }) : ""

export function addTaskComment(
  taskId: string, text: string, progress?: number, dateISO?: string, asManager = false,
) {
  // an update dated today reads as "Just now"; a back-dated one shows its date
  const backdated = !!dateISO && dateISO !== TASK_TODAY_ISO
  events = [...events, {
    id: `e-${Date.now().toString(36)}`,
    taskId, kind: "comment",
    author: ME.name, authorAr: ME.nameAr, initials: ME.initials,
    text, progress, manager: asManager || undefined, dateISO: dateISO ?? TASK_TODAY_ISO,
    at: backdated ? prettyDate(dateISO!) : "Just now",
    atAr: backdated ? prettyDateAr(dateISO!) : "الآن",
  }]
  emit()
}

/** Move the due date, and put the change on the record. */
export function setTaskDue(id: string, dueISO: string) {
  const before = tasks.find((t) => t.id === id)
  if (!before || before.dueISO === dueISO) return
  tasks = tasks.map((t) => (t.id === id
    ? { ...t, dueISO, due: prettyDate(dueISO), dueAr: prettyDateAr(dueISO) }
    : t))
  events = [...events, {
    id: `e-${Date.now().toString(36)}-due`,
    taskId: id, kind: "due",
    fromDue: before.due, toDue: prettyDate(dueISO),
    author: ME.name, authorAr: ME.nameAr, initials: ME.initials,
    at: "Just now", atAr: "الآن",
  }]
  emit()
}

/** Status moves land in the same trail, so the thread reads as the history. */
function logStatus(taskId: string, from: TaskStatus, to: TaskStatus) {
  if (from === to) return
  events = [...events, {
    id: `e-${Date.now().toString(36)}-${taskId}`,
    taskId, kind: "status", from, to,
    author: ME.name, authorAr: ME.nameAr, initials: ME.initials,
    at: "Just now", atAr: "الآن",
  }]
}

/** The signed-in employee's own tasks — anything without an assignee. */
export const myTasks = (list: Task[]) => list.filter((t) => !t.assigneeId)
/** One report's tasks. */
export const tasksFor = (list: Task[], assigneeId: string) =>
  list.filter((t) => t.assigneeId === assigneeId)
/** Every task the manager's reports are carrying. */
export const teamTasks = (list: Task[]) => list.filter((t) => !!t.assigneeId)
/** Everything filed under one project. */
export const tasksInProject = (list: Task[], projectId: string) =>
  list.filter((t) => t.projectId === projectId)
export const countByStatus = (list: Task[]) => ({
  all: list.length,
  open: list.filter((t) => t.status === "open").length,
  inProgress: list.filter((t) => t.status === "in-progress").length,
  completed: list.filter((t) => t.status === "completed").length,
  overdue: list.filter(isOverdue).length,
})
