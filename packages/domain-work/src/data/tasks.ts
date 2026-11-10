import * as React from "react"

import { projectIdForName } from "./projects"
import { CURRENT_SPRINT, type CategoryId, type TaskPriority, type TaskStatus } from "./meta"

export type { TaskPriority, TaskStatus } from "./meta"
export type Task = {
  id: string
  title: string; titleAr: string
  /** The project master row this task is filed under, plus a name snapshot. */
  projectId?: string
  project: string; projectAr: string
  /** The milestone inside that project, if the task has been placed under one. */
  milestoneId?: string
  due: string; dueAr: string; dueISO: string
  priority: TaskPriority
  status: TaskStatus
  assignedBy: string; assignedByAr: string
  /** Whose task it is. Undefined = the signed-in employee's own task. */
  assigneeId?: string
  assignee?: string; assigneeAr?: string
  description?: string; descriptionAr?: string
  /** Department the work belongs to — drives the coloured chip on the card. */
  category?: CategoryId
  /** Sprint the task is planned in (see SPRINTS). */
  sprint?: string
  /** The assistant's next-step hint shown along the bottom of the board card. */
  aiHint?: string; aiHintAr?: string
  /** When the task was created. */
  createdISO?: string
  /** What shipped, how it was checked, and how to roll it back. */
  releaseNote?: string
}

/** "Today" for the prototype — drives the overdue calculation. */
export const TASK_TODAY_ISO = "2026-08-12"
export const isOverdue = (t: Task) => t.status !== "completed" && t.dueISO < TASK_TODAY_ISO

/** Dates as the seeded rows read them. Arabic keeps Latin digits, as drawn. */
const local = (iso: string) => new Date(`${iso}T00:00:00`)
export const prettyDate = (iso: string) =>
  iso ? local(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""
export const prettyDateAr = (iso: string) =>
  iso ? local(iso).toLocaleDateString("ar-EG-u-nu-latn", { month: "long", day: "numeric" }) : ""
/** Short form for cards: "Aug 17" / "17 أغسطس". */
export const shortDate = (iso: string, isAr: boolean) =>
  iso ? local(iso).toLocaleDateString(isAr ? "ar-EG-u-nu-latn" : "en-GB", { month: "long", day: "numeric" }) : ""
export function shiftISO(iso: string, days: number) {
  const d = local(iso); d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}
/** "Today" / "Tomorrow" / weekday this week / a date — for the sub-task list. */
export function relativeDue(iso: string, isAr: boolean): { text: string; tone: "error" | "warning" | "muted" } {
  const days = Math.round((local(iso).getTime() - local(TASK_TODAY_ISO).getTime()) / 86_400_000)
  if (days < 0) return { text: isAr ? `متأخرة · ${shortDate(iso, true)}` : `Overdue · ${shortDate(iso, false)}`, tone: "error" }
  if (days === 0) return { text: isAr ? "اليوم" : "Today", tone: "error" }
  if (days === 1) return { text: isAr ? "غداً" : "Tomorrow", tone: "warning" }
  if (days < 7) return { text: local(iso).toLocaleDateString(isAr ? "ar-EG" : "en-US", { weekday: "long" }), tone: "muted" }
  return { text: shortDate(iso, isAr), tone: "muted" }
}

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
  { id: "t8", title: "Review vendor contract renewals", titleAr: "مراجعة تجديد عقود الموردين", project: "Procurement", projectAr: "المشتريات", due: "Aug 22, 2026", dueAr: "٢٢ أغسطس", dueISO: "2026-08-22", priority: "medium", status: "on-hold", assignedBy: "Procurement", assignedByAr: "المشتريات" },
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
  { id: "tm7", assigneeId: "r3", assignee: "Layan Al Marwani", assigneeAr: "ليان المرواني", title: "Arabic copy review — Services module", titleAr: "مراجعة النصوص العربية — وحدة الخدمات", project: "Digital Workplace", projectAr: "بيئة العمل الرقمية", due: "Aug 15, 2026", dueAr: "١٥ أغسطس", dueISO: "2026-08-15", priority: "medium", status: "in-review", assignedBy: "Khalid Al-Qahtani", assignedByAr: "خالد القحطاني" },
  { id: "tm8", assigneeId: "r3", assignee: "Layan Al Marwani", assigneeAr: "ليان المرواني", title: "Process map — cafeteria ordering", titleAr: "خريطة عملية طلبات الكافتيريا", project: "Employee Services", projectAr: "خدمات الموظفين", due: "Aug 19, 2026", dueAr: "١٩ أغسطس", dueISO: "2026-08-19", priority: "low", status: "open", assignedBy: "Khalid Al-Qahtani", assignedByAr: "خالد القحطاني" },
  { id: "tm9", assigneeId: "r4", assignee: "Noura Saleh", assigneeAr: "نورة صالح", title: "Handover notes before annual leave", titleAr: "ملاحظات التسليم قبل الإجازة السنوية", project: "Team", projectAr: "الفريق", due: "Aug 11, 2026", dueAr: "١١ أغسطس", dueISO: "2026-08-11", priority: "medium", status: "completed", assignedBy: "Khalid Al-Qahtani", assignedByAr: "خالد القحطاني" },
  { id: "tm10", assigneeId: "r4", assignee: "Noura Saleh", assigneeAr: "نورة صالح", title: "Update service catalogue entries", titleAr: "تحديث بنود دليل الخدمات", project: "Employee Services", projectAr: "خدمات الموظفين", due: "Aug 25, 2026", dueAr: "٢٥ أغسطس", dueISO: "2026-08-25", priority: "low", status: "open", assignedBy: "Khalid Al-Qahtani", assignedByAr: "خالد القحطاني" },
  { id: "tm11", assigneeId: "r5", assignee: "Faisal Al-Harbi", assigneeAr: "فيصل الحربي", title: "Daily ops report automation", titleAr: "أتمتة تقرير العمليات اليومي", project: "Operations", projectAr: "العمليات", due: "Aug 8, 2026", dueAr: "٨ أغسطس", dueISO: "2026-08-08", priority: "high", status: "on-hold", assignedBy: "Khalid Al-Qahtani", assignedByAr: "خالد القحطاني" },
  { id: "tm12", assigneeId: "r5", assignee: "Faisal Al-Harbi", assigneeAr: "فيصل الحربي", title: "Lounge access audit — July", titleAr: "تدقيق دخول الصالات — يوليو", project: "Compliance", projectAr: "الامتثال", due: "Aug 4, 2026", dueAr: "٤ أغسطس", dueISO: "2026-08-04", priority: "medium", status: "open", assignedBy: "Khalid Al-Qahtani", assignedByAr: "خالد القحطاني" },
  { id: "tm13", assigneeId: "r5", assignee: "Faisal Al-Harbi", assigneeAr: "فيصل الحربي", title: "Complete mandatory safety refresher", titleAr: "إكمال دورة السلامة التنشيطية", project: "People Ops", projectAr: "عمليات الموارد البشرية", due: "Aug 20, 2026", dueAr: "٢٠ أغسطس", dueISO: "2026-08-20", priority: "low", status: "in-progress", assignedBy: "People & Culture", assignedByAr: "الموظفون والثقافة" },
  { id: "tm14", assigneeId: "r6", assignee: "Saud Al-Dosari", assigneeAr: "سعود الدوسري", title: "VIP lounge readiness checklist", titleAr: "قائمة جاهزية صالة كبار الضيوف", project: "Guest Experience", projectAr: "تجربة الضيوف", due: "Aug 13, 2026", dueAr: "١٣ أغسطس", dueISO: "2026-08-13", priority: "high", status: "in-progress", assignedBy: "Khalid Al-Qahtani", assignedByAr: "خالد القحطاني" },
  { id: "tm15", assigneeId: "r6", assignee: "Saud Al-Dosari", assigneeAr: "سعود الدوسري", title: "Tea-boy shift coverage plan", titleAr: "خطة تغطية ورديات خدمة الضيافة", project: "Employee Services", projectAr: "خدمات الموظفين", due: "Aug 18, 2026", dueAr: "١٨ أغسطس", dueISO: "2026-08-18", priority: "medium", status: "open", assignedBy: "Khalid Al-Qahtani", assignedByAr: "خالد القحطاني" },
  { id: "tm16", assigneeId: "r7", assignee: "Reem Al-Otaibi", assigneeAr: "ريم العتيبي", title: "Attendance dashboard data model", titleAr: "نموذج بيانات لوحة الحضور", project: "Digital Workplace", projectAr: "بيئة العمل الرقمية", due: "Aug 17, 2026", dueAr: "١٧ أغسطس", dueISO: "2026-08-17", priority: "medium", status: "in-progress", assignedBy: "Khalid Al-Qahtani", assignedByAr: "خالد القحطاني" },
  { id: "tm17", assigneeId: "r7", assignee: "Reem Al-Otaibi", assigneeAr: "ريم العتيبي", title: "Q2 utilisation analysis", titleAr: "تحليل الاستغلال للربع الثاني", project: "Operations · Q2", projectAr: "العمليات · الربع الثاني", due: "Aug 5, 2026", dueAr: "٥ أغسطس", dueISO: "2026-08-05", priority: "low", status: "completed", assignedBy: "Khalid Al-Qahtani", assignedByAr: "خالد القحطاني" },
  { id: "tm18", assigneeId: "r8", assignee: "Turki Al-Shehri", assigneeAr: "تركي الشهري", title: "Gate allocation trial — Terminal 1", titleAr: "تجربة توزيع البوابات — الصالة 1", project: "Operations", projectAr: "العمليات", due: "Aug 3, 2026", dueAr: "٣ أغسطس", dueISO: "2026-08-03", priority: "high", status: "open", assignedBy: "Khalid Al-Qahtani", assignedByAr: "خالد القحطاني" },
  { id: "tm19", assigneeId: "r8", assignee: "Turki Al-Shehri", assigneeAr: "تركي الشهري", title: "Submit July overtime sheet", titleAr: "تقديم كشف العمل الإضافي ليوليو", project: "Finance", projectAr: "المالية", due: "Aug 16, 2026", dueAr: "١٦ أغسطس", dueISO: "2026-08-16", priority: "low", status: "open", assignedBy: "Finance", assignedByAr: "المالية" },
]

/** The Sprint 24 board as drawn in Figma (2015:9895) — titles and the
 *  assistant hints are the design's copy. Assignees are mapped onto the
 *  manager's real reporting line (the design uses placeholder names). */
type Seed = Omit<Task, "due" | "dueAr"> & { due?: string; dueAr?: string }
const KH_SELF = { assignedBy: "Self", assignedByAr: "شخصي" }
const BY_KH = { assignedBy: "Khalid Al-Qahtani", assignedByAr: "خالد القحطاني" }
const R = (id: string, name: string, nameAr: string) => ({ assigneeId: id, assignee: name, assigneeAr: nameAr, ...BY_KH })
const OPS = { project: "Operations · Q3", projectAr: "العمليات · الربع الثالث" }
const DW = { project: "Digital Workplace", projectAr: "بيئة العمل الرقمية" }
const BOARD_SEED: Seed[] = [
  // قائمة الانتظار — backlog
  { id: "w1", title: "Review hospitality contracts", titleAr: "مراجعة عقود الضيافة", ...OPS, category: "operations", dueISO: "2026-08-17", createdISO: "2026-08-09", priority: "high", status: "open", ...KH_SELF,
    aiHint: "Compare it with the Jeddah contract before approval", aiHintAr: "قارنها بعقد جدة قبل الاعتماد",
    description: "Review the lounge hospitality supplier contracts — rates, service levels and renewal terms — before they are renewed.",
    descriptionAr: "مراجعة عقود موردي الضيافة في الصالات من حيث الأسعار ومستويات الخدمة وشروط التجديد قبل اعتمادها." },
  { id: "w2", title: "Update the service guide", titleAr: "تحديث دليل الخدمة", ...DW, category: "design", dueISO: "2026-08-22", createdISO: "2026-08-06", priority: "medium", status: "open", ...KH_SELF,
    aiHint: "Start from the new brand template", aiHintAr: "ابدأ من قالب الهوية الجديد" },
  { id: "w3", title: "Consolidate vendor data", titleAr: "توحيد بيانات الموردين", ...OPS, category: "operations", dueISO: "2026-08-16", createdISO: "2026-08-05", priority: "medium", status: "open", ...R("r6", "Saud Al-Dosari", "سعود الدوسري"),
    aiHint: "Combine it with the supplier-meeting prep", aiHintAr: "ادمجها مع تجهيزات اجتماع الموردين" },
  { id: "w4", title: "Draft communication — Policy Version 3", titleAr: "صياغة تواصل — السياسة الإصدار 3", project: "People Ops", projectAr: "عمليات الموارد البشرية", category: "hr", dueISO: "2026-08-20", createdISO: "2026-08-07", priority: "medium", status: "open", ...R("r2", "Mohammad Iqbal", "محمد إقبال"),
    aiHint: "Use the HR template", aiHintAr: "استخدم قالب الموارد البشرية" },
  // معلّقة — on hold
  { id: "w5", title: "Upgrade the vendor portal", titleAr: "ترقية بوابة الموردين", ...DW, category: "it", dueISO: "2026-08-18", createdISO: "2026-08-02", priority: "high", status: "on-hold", ...KH_SELF,
    aiHint: "Awaiting cybersecurity approval", aiHintAr: "بانتظار موافقة الأمن السيبراني" },
  { id: "w6", title: "Renew fleet license", titleAr: "تجديد ترخيص الأسطول", ...OPS, category: "operations", dueISO: "2026-08-24", createdISO: "2026-08-03", priority: "medium", status: "on-hold", ...KH_SELF,
    aiHint: "Remind the issuing body in 3 days", aiHintAr: "ذكّر الجهة المانحة بعد 3 أيام" },
  // قيد التنفيذ — in progress
  { id: "w7", title: "Prepare the Q1 report", titleAr: "إعداد تقرير الربع الأول", ...OPS, category: "strategy", dueISO: "2026-08-13", createdISO: "2026-08-01", priority: "high", status: "in-progress", ...KH_SELF,
    aiHint: "Pull the figures from the finance dashboard", aiHintAr: "اسحب الأرقام من لوحة المالية",
    description: "Prepare the Q1 performance report for executive management, including key indicators and recommendations.",
    descriptionAr: "إعداد تقرير أداء الربع الأول للإدارة التنفيذية متضمنًا المؤشرات الرئيسية والتوصيات." },
  { id: "w8", title: "Fine-tune the limousine request flow", titleAr: "ضبط تدفق طلبات الليموزين", ...OPS, category: "operations", dueISO: "2026-08-15", createdISO: "2026-08-04", priority: "medium", status: "in-progress", ...KH_SELF,
    aiHint: "Merge steps 3 and 4", aiHintAr: "وحّد الخطوتين 3 و 4" },
  { id: "w9", title: "Update the service level agreement", titleAr: "تحديث اتفاقية مستوى الخدمة", ...OPS, category: "strategy", dueISO: "2026-08-14", createdISO: "2026-08-04", priority: "medium", status: "in-progress", ...KH_SELF,
    aiHint: "Review the response clauses with customers", aiHintAr: "راجع بنود الاستجابة مع العملاء" },
  { id: "w10", title: "Reach pilot — IT team", titleAr: "تجربة ريتش — فريق تقنية المعلومات", ...DW, category: "it", dueISO: "2026-08-13", createdISO: "2026-08-01", priority: "medium", status: "in-progress", ...R("r3", "Layan Al Marwani", "ليان المرواني"),
    aiHint: "Book 20 minutes with the IT manager", aiHintAr: "احجز 20 دقيقة مع مدير التقنية" },
  { id: "w11", title: "Financial data quality checks", titleAr: "فحوصات جودة البيانات المالية", project: "Finance", projectAr: "المالية", category: "finance", dueISO: "2026-08-12", createdISO: "2026-08-01", priority: "high", status: "in-progress", ...R("r7", "Reem Al-Otaibi", "ريم العتيبي"),
    aiHint: "Add a blocker: data-source delay", aiHintAr: "أضف عائقًا: تأخير مصدر البيانات" },
  // قيد المراجعة — in review
  { id: "w12", title: "Post-incident analysis pack", titleAr: "حزمة تحليل ما بعد الحادث", ...DW, category: "it", dueISO: "2026-08-14", createdISO: "2026-08-03", priority: "high", status: "in-review", ...R("r1", "Sara Al-Mutairi", "سارة المطيري"),
    aiHint: "Attach the DNS timeline", aiHintAr: "أرفق الجدول الزمني لـ DNS" },
  // مكتمل — completed
  { id: "w13", title: "Quarterly goals cascade", titleAr: "تتالي أهداف الربع", ...OPS, category: "strategy", dueISO: "2026-08-10", createdISO: "2026-07-28", priority: "medium", status: "completed", ...R("r5", "Faisal Al-Harbi", "فيصل الحربي"),
    aiHint: "Archive it in the knowledge centre", aiHintAr: "أرشف في مركز المعرفة" },
]

const BOARD_IDS = new Set(BOARD_SEED.map((t) => t.id))

/** Older seeded rows carry no department — read one off the project name. */
const CATEGORY_FOR_PROJECT: Record<string, Task["category"]> = {
  "Operations · Q2": "operations", "Operations · Q3": "operations", "Operations": "operations",
  "Safety & Standards": "operations", "Capital Projects": "operations", "Procurement": "operations",
  "Guest Experience": "operations", "Finance": "finance", "Finance · IT": "finance",
  "People Ops": "hr", "Digital Workplace": "it", "Digital Services": "it",
  "Compliance": "strategy", "Executive Office": "strategy", "Team": "strategy",
  "Employee Services": "design",
}

/** Where the seeded tasks sit in their projects' milestones. */
const SEED_MILESTONE: Record<string, string> = {
  tm2: "m-p1-1", tm3: "m-p1-1",
  tm7: "m-p1-2", tm16: "m-p1-2",
  t7: "m-p1-3",
  tm4: "m-p2-1", tm18: "m-p2-1",
  tm1: "m-p2-2", tm11: "m-p2-2",
  w1: "m-p2-1", w3: "m-p2-1", w6: "m-p2-1",
  w7: "m-p2-2", w8: "m-p2-2", w9: "m-p2-2", w13: "m-p2-2",
  w5: "m-p1-3", w10: "m-p1-2", w12: "m-p1-2",
  t13: "m-p6-1",
  t5: "m-p6-2",
}

/** Seeded rows were written before the project master existed — link them,
 *  and fill the board fields (department, sprint, created) they predate. */
const linked = (list: Seed[]): Task[] =>
  list.map((t) => ({
    ...t,
    due: prettyDate(t.dueISO),
    dueAr: prettyDateAr(t.dueISO),
    projectId: t.projectId ?? projectIdForName(t.project),
    milestoneId: t.milestoneId ?? SEED_MILESTONE[t.id],
    category: t.category ?? CATEGORY_FOR_PROJECT[t.project] ?? "operations",
    // the Sprint 24 board is the design's set; older rows sit in the sprint
    // before (finished or overdue) or the one after (still ahead)
    sprint: t.sprint ?? (BOARD_IDS.has(t.id) ? CURRENT_SPRINT
      : t.status === "completed" || t.dueISO < TASK_TODAY_ISO ? "s23" : "s25"),
    createdISO: t.createdISO ?? shiftISO(t.dueISO, -10),
  }))

let tasks: Task[] = linked([...BOARD_SEED, ...SEED, ...TEAM_SEED])
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
/** Change any of a task's own fields (edit mode, release note, reassign). */
export function updateTask(id: string, patch: Partial<Task>) {
  const before = tasks.find((t) => t.id === id)
  if (!before) return
  if (patch.dueISO && patch.dueISO !== before.dueISO) {
    patch = { ...patch, due: prettyDate(patch.dueISO), dueAr: prettyDateAr(patch.dueISO) }
  }
  tasks = tasks.map((t) => (t.id === id ? { ...t, ...patch } : t))
  if (patch.status && patch.status !== before.status) logStatus(id, before.status, patch.status)
  if (patch.dueISO && patch.dueISO !== before.dueISO) logDue(id, before.due, prettyDate(patch.dueISO))
  emit()
}
/** Delete a task and its trail. */
export function removeTask(id: string) {
  tasks = tasks.filter((t) => t.id !== id)
  events = events.filter((e) => e.taskId !== id)
  emit()
}
/** A project was deleted: its tasks stay, keeping the project's name. */
export function unlinkProject(projectId: string) {
  tasks = tasks.map((t) => (t.projectId === projectId ? { ...t, projectId: undefined, milestoneId: undefined } : t))
  emit()
}
/** Move a task under a milestone, or out of one (empty id). */
export function setTaskMilestone(id: string, milestoneId: string) {
  tasks = tasks.map((t) => (t.id === id ? { ...t, milestoneId: milestoneId || undefined } : t))
  emit()
}
/** When a milestone is removed its tasks stay in the project, just ungrouped. */
export function clearMilestone(milestoneId: string) {
  tasks = tasks.map((t) => (t.milestoneId === milestoneId ? { ...t, milestoneId: undefined } : t))
  emit()
}

// ── progress updates ─────────────────────────────────────────────

/** What kind of entry it is: someone wrote it, or the system recorded a move. */
export type TaskEventKind = "comment" | "status" | "due" | "created" | "ai"

export type TaskEvent = {
  id: string
  /** The task — or, for a project's own trail, the project id. */
  taskId: string
  kind: TaskEventKind
  author: string; authorAr: string
  initials: string
  /** The update itself, for a comment or an assistant suggestion. */
  text?: string; textAr?: string
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

/** The trail drawn on the detail screens (3580:8261 / 3580:8521). */
const NOURA = { author: "Noura Saleh", authorAr: "نورة صالح", initials: "NS" }
const AI = { author: "Assistant", authorAr: "المساعد", initials: "AI" }
const MI = { author: "Mohammad Iqbal", authorAr: "محمد إقبال", initials: "MI" }
const DETAIL_EVENTS: TaskEvent[] = [
  { id: "ew1", taskId: "w1", kind: "created", ...NOURA, text: "Created the task and assigned it to Khalid.", textAr: "أنشأت المهمة وأسندتها إلى خالد.", at: "Yesterday", atAr: "أمس" },
  { id: "ew2", taskId: "w1", kind: "ai", ...AI, text: "Suggested: Compare it with the Jeddah contract before approval", textAr: "اقترح: قارنها بعقد جدة قبل الاعتماد", at: "08:10", atAr: "08:10" },
  { id: "ew3", taskId: "w1", kind: "comment", ...MI, text: "Any update on the tasks?", textAr: "أي تحديث بخصوص المهام؟", at: "08:42", atAr: "08:42" },
  { id: "ew4", taskId: "w7", kind: "created", author: ME.name, authorAr: ME.nameAr, initials: ME.initials, text: "created the task and assigned it to himself.", textAr: "أنشأ المهمة وأسندها إلى نفسه.", at: "Yesterday", atAr: "أمس" },
  { id: "ew5", taskId: "w7", kind: "ai", ...AI, text: "Suggested: Pull the figures from the finance dashboard", textAr: "اقترح: اسحب الأرقام من لوحة المالية", at: "08:10", atAr: "08:10" },
  { id: "ew6", taskId: "w7", kind: "comment", ...MI, text: "Any update on the tasks?", textAr: "أي تحديث بخصوص المهام؟", at: "08:42", atAr: "08:42" },
  // the Operations · Q3 project's own trail
  { id: "ep1", taskId: "p2", kind: "created", ...MI, text: "Created the project and assigned it to himself.", textAr: "أنشأ المشروع وأسنده إلى نفسه.", at: "Yesterday", atAr: "أمس" },
  { id: "ep2", taskId: "p2", kind: "ai", ...AI, text: "Suggested: Pull the figures from the finance dashboard", textAr: "اقترح: اسحب الأرقام من لوحة المالية", at: "08:10", atAr: "08:10" },
  { id: "ep3", taskId: "p2", kind: "comment", author: "Reem Al-Otaibi", authorAr: "ريم العتيبي", initials: "RO", text: "Any update on the tasks?", textAr: "أي تحديث بخصوص المهام؟", at: "08:42", atAr: "08:42" },
]

let events: TaskEvent[] = [...DETAIL_EVENTS, ...SEED_EVENTS]

/** Record that the assistant's suggestion was taken up or turned down. */
export function addAiEvent(subjectId: string, text: string, textAr: string) {
  events = [...events, {
    id: `e-${Date.now().toString(36)}-ai`, taskId: subjectId, kind: "ai", ...AI,
    text, textAr, at: "Just now", atAr: "الآن",
  }]
  emit()
}

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
  logDue(id, before.due, prettyDate(dueISO))
  emit()
}
function logDue(taskId: string, fromDue: string, toDue: string) {
  events = [...events, {
    id: `e-${Date.now().toString(36)}-due`,
    taskId, kind: "due", fromDue, toDue,
    author: ME.name, authorAr: ME.nameAr, initials: ME.initials,
    at: "Just now", atAr: "الآن",
  }]
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
  onHold: list.filter((t) => t.status === "on-hold").length,
  inProgress: list.filter((t) => t.status === "in-progress").length,
  inReview: list.filter((t) => t.status === "in-review").length,
  completed: list.filter((t) => t.status === "completed").length,
  overdue: list.filter(isOverdue).length,
})
