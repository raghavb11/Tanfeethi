import * as React from "react"

/** Manager dashboard fixtures — the team view for a line manager.
 *  WBS 4.9 / SOW Phase 3. Demo-only; a real build reads Oracle HRMS. */

export type TodayState = "present" | "remote" | "leave" | "late" | "absent"

export type Report = {
  id: string
  name: string
  nameAr: string
  initials: string
  title: string
  titleAr: string
  state: TodayState
  checkIn?: string
  location: string
  locationAr: string
  openTasks: number
  overdue: number
  utilisation: number
  leaveBalance: number
}

export const team: Report[] = [
  { id: "r1", name: "Lina Al-Harbi", nameAr: "لينا الحربي", initials: "LH", title: "Product Designer", titleAr: "مصممة منتجات", state: "present", checkIn: "08:12", location: "HQ · L14", locationAr: "المقر · ط14", openTasks: 7, overdue: 1, utilisation: 86, leaveBalance: 14 },
  { id: "r2", name: "Saad Al-Yami", nameAr: "سعد اليامي", initials: "SY", title: "UX Researcher", titleAr: "باحث تجربة المستخدم", state: "late", checkIn: "08:41", location: "HQ · L9", locationAr: "المقر · ط9", openTasks: 11, overdue: 3, utilisation: 94, leaveBalance: 6 },
  { id: "r3", name: "Tala Nasser", nameAr: "تالا ناصر", initials: "TN", title: "UI Designer", titleAr: "مصممة واجهات", state: "remote", checkIn: "08:35", location: "Remote", locationAr: "عن بُعد", openTasks: 5, overdue: 0, utilisation: 71, leaveBalance: 19 },
]

// ── approvals waiting on this manager ────────────────────────────────────────
export type ApprovalKind = "leave" | "expense" | "overtime" | "letter" | "purchase"
export type ApprovalState = "Pending" | "Approved" | "Returned"

export type Approval = {
  id: string
  ref: string
  who: string
  whoAr: string
  initials: string
  kind: ApprovalKind
  title: string
  titleAr: string
  detail: string
  detailAr: string
  /** SAR, where the request carries an amount. */
  amount?: number
  submitted: string
  submittedAr: string
  ageDays: number
  state: ApprovalState
}

const SEED_APPROVALS: Approval[] = [
  { id: "ap1", ref: "LV-3312", who: "Lina Al-Harbi", whoAr: "لينا الحربي", initials: "LH", kind: "leave", title: "Annual leave", titleAr: "إجازة سنوية", detail: "24 – 28 May · 5 days", detailAr: "24 – 28 مايو · 5 أيام", submitted: "1 day ago", submittedAr: "قبل يوم", ageDays: 1, state: "Pending" },
  { id: "ap2", ref: "EX-8841", who: "Saad Al-Yami", whoAr: "سعد اليامي", initials: "SY", kind: "expense", title: "Expense claim", titleAr: "مطالبة مصروفات", detail: "User-research incentives", detailAr: "حوافز أبحاث المستخدمين", amount: 1150, submitted: "2 days ago", submittedAr: "قبل يومين", ageDays: 2, state: "Pending" },
  { id: "ap3", ref: "OT-1207", who: "Tala Nasser", whoAr: "تالا ناصر", initials: "TN", kind: "overtime", title: "Overtime request", titleAr: "طلب عمل إضافي", detail: "6 hrs · 25 Apr (weekend)", detailAr: "6 ساعات · 25 أبريل (نهاية الأسبوع)", submitted: "3 days ago", submittedAr: "قبل 3 أيام", ageDays: 3, state: "Pending" },
  { id: "ap4", ref: "PR-2290", who: "Saad Al-Yami", whoAr: "سعد اليامي", initials: "SY", kind: "purchase", title: "Purchase request", titleAr: "طلب شراء", detail: "Usability-lab testing seats ×4", detailAr: "مقاعد اختبار لمختبر قابلية الاستخدام ×4", amount: 28400, submitted: "5 days ago", submittedAr: "قبل 5 أيام", ageDays: 5, state: "Pending" },
  { id: "ap5", ref: "LT-0765", who: "Lina Al-Harbi", whoAr: "لينا الحربي", initials: "LH", kind: "letter", title: "Salary certificate", titleAr: "شهادة راتب", detail: "For a bank application", detailAr: "لتقديمها إلى البنك", submitted: "6 hours ago", submittedAr: "قبل 6 ساعات", ageDays: 0, state: "Pending" },
  { id: "ap6", ref: "LV-3301", who: "Tala Nasser", whoAr: "تالا ناصر", initials: "TN", kind: "leave", title: "Annual leave", titleAr: "إجازة سنوية", detail: "1 – 3 Jun · 3 days", detailAr: "1 – 3 يونيو · 3 أيام", submitted: "Yesterday", submittedAr: "أمس", ageDays: 1, state: "Approved" },
]

// ── team leave, coming up ────────────────────────────────────────────────────
export const upcomingLeave: { id: string; who: string; whoAr: string; initials: string; range: string; rangeAr: string; days: number; type: string; typeAr: string; approved: boolean }[] = [
  { id: "ul1", who: "Tala Nasser", whoAr: "تالا ناصر", initials: "TN", range: "13 May", rangeAr: "13 مايو", days: 1, type: "Personal", typeAr: "شخصية", approved: true },
  { id: "ul2", who: "Lina Al-Harbi", whoAr: "لينا الحربي", initials: "LH", range: "24 – 28 May", rangeAr: "24 – 28 مايو", days: 5, type: "Annual", typeAr: "سنوية", approved: false },
  { id: "ul3", who: "Tala Nasser", whoAr: "تالا ناصر", initials: "TN", range: "1 – 3 Jun", rangeAr: "1 – 3 يونيو", days: 3, type: "Annual", typeAr: "سنوية", approved: true },
]

/** Days ahead where two or more people are away at once — none in this window. */
export const leaveClashes: { date: string; dateAr: string; who: string[] }[] = []

// ── attendance trend, this month ─────────────────────────────────────────────
export const attendanceTrend = {
  monthLabel: "April 2026",
  monthLabelAr: "أبريل 2026",
  onTimePct: 94,
  lastMonthPct: 90,
  avgHours: 8.2,
  lateInstances: 2,
  remotePct: 25,
  /** Per working day of the current week: Sun–Thu (3 direct reports). */
  week: [
    { day: "Sun", dayAr: "الأحد", present: 3, remote: 0, leave: 0, absent: 0 },
    { day: "Mon", dayAr: "الاثنين", present: 2, remote: 1, leave: 0, absent: 0 },
    { day: "Tue", dayAr: "الثلاثاء", present: 2, remote: 1, leave: 0, absent: 0 },
    { day: "Wed", dayAr: "الأربعاء", present: 3, remote: 0, leave: 0, absent: 0 },
    { day: "Thu", dayAr: "الخميس", present: 2, remote: 1, leave: 0, absent: 0 },
  ],
}

export const headcount = { budgeted: 4, filled: 3, openRoles: 1, probation: 1 }

// ── reactive store ───────────────────────────────────────────────────────────
let approvals: Approval[] = SEED_APPROVALS
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l) }

export function useApprovals(): Approval[] {
  return React.useSyncExternalStore(subscribe, () => approvals)
}
/** Decisions are state changes — nothing is removed from the list. */
export function decideApproval(id: string, state: ApprovalState, comment?: string) {
  const a = approvals.find((x) => x.id === id)
  approvals = approvals.map((x) => (x.id === id ? { ...x, state } : x))
  emit()
  if (a) logManager(state === "Approved" ? "approved" : "returned", `${a.ref} · ${a.title}`, comment)
}

export const stateOf = (r: Report) => r.state

export const getApprovalById = (id: string) => approvals.find((x) => x.id === id)

// ── the full request, as the approver needs to see it ────────────────────────
export type ApprovalLine = { label: string; labelAr: string; value: string; valueAr: string }
/** A note the approver should not miss — balance, policy, budget. */
export type ApprovalFlag = { tone: "info" | "warn"; text: string; textAr: string }
export type ChainStep = {
  role: string; roleAr: string
  who: string; whoAr: string
  state: "done" | "current" | "waiting"
  when?: string; whenAr?: string
}
export type ApprovalFile = { id: string; name: string; nameAr: string; size: string }
export type ApprovalEvent = { id: string; label: string; labelAr: string; who: string; whoAr: string; when: string; whenAr: string }

export type ApprovalDetail = {
  whoTitle: string; whoTitleAr: string
  dept: string; deptAr: string
  employeeNo: string
  submittedOn: string; submittedOnAr: string
  /** The request's own fields — what is actually being asked for. */
  lines: ApprovalLine[]
  reason: string; reasonAr: string
  flags: ApprovalFlag[]
  chain: ChainStep[]
  files: ApprovalFile[]
  history: ApprovalEvent[]
}

/** The acting line manager — the signed-in employee, Fawaz Al-Ghailan. */
const ME = { who: "Fawaz Al-Ghailan", whoAr: "فواز الغيلان" }

export const approvalDetail: Record<string, ApprovalDetail> = {
  ap1: {
    whoTitle: "Product Designer", whoTitleAr: "مصممة منتجات",
    dept: "Digital Experience", deptAr: "التجربة الرقمية",
    employeeNo: "EMP-10428",
    submittedOn: "27 Apr 2026 · 09:14", submittedOnAr: "27 أبريل 2026 · 09:14",
    lines: [
      { label: "Leave type", labelAr: "نوع الإجازة", value: "Annual", valueAr: "سنوية" },
      { label: "From", labelAr: "من", value: "24 May 2026 (Sun)", valueAr: "24 مايو 2026 (الأحد)" },
      { label: "To", labelAr: "إلى", value: "28 May 2026 (Thu)", valueAr: "28 مايو 2026 (الخميس)" },
      { label: "Working days", labelAr: "أيام العمل", value: "5", valueAr: "5" },
      { label: "Back at work", labelAr: "العودة للعمل", value: "31 May 2026", valueAr: "31 مايو 2026" },
      { label: "Balance after", labelAr: "الرصيد بعد", value: "9 of 21 days", valueAr: "9 من 21 يومًا" },
      { label: "Cover", labelAr: "البديل", value: "Tala Nasser", valueAr: "تالا ناصر" },
    ],
    reason: "Family trip booked before the Q3 freeze. Handover pack is ready and Tala will cover the design reviews.",
    reasonAr: "رحلة عائلية محجوزة قبل إغلاق الربع الثالث. ملف التسليم جاهز وستتولى تالا مراجعات التصميم.",
    flags: [
      { tone: "warn", text: "Overlaps the Wave 2 UAT window (24 – 28 May).", textAr: "يتعارض مع فترة اختبار القبول للموجة الثانية (24 – 28 مايو)." },
      { tone: "info", text: "No one else on the team is away those days.", textAr: "لا يوجد زميل آخر في إجازة خلال تلك الأيام." },
    ],
    chain: [
      { role: "Line manager", roleAr: "المدير المباشر", ...ME, state: "current" },
      { role: "People & Culture", roleAr: "الموظفون والثقافة", who: "Hind Al-Amri", whoAr: "هند العمري", state: "waiting" },
    ],
    files: [],
    history: [
      { id: "h1", label: "Submitted", labelAr: "تم الإرسال", who: "Lina Al-Harbi", whoAr: "لينا الحربي", when: "27 Apr · 09:14", whenAr: "27 أبريل · 09:14" },
      { id: "h2", label: "Balance verified by Oracle HRMS", labelAr: "تم التحقق من الرصيد", who: "System", whoAr: "النظام", when: "27 Apr · 09:14", whenAr: "27 أبريل · 09:14" },
    ],
  },

  ap2: {
    whoTitle: "UX Researcher", whoTitleAr: "باحث تجربة المستخدم",
    dept: "Digital Experience", deptAr: "التجربة الرقمية",
    employeeNo: "EMP-10133",
    submittedOn: "26 Apr 2026 · 17:02", submittedOnAr: "26 أبريل 2026 · 17:02",
    lines: [
      { label: "Category", labelAr: "الفئة", value: "Research incentives", valueAr: "حوافز أبحاث" },
      { label: "Date of expense", labelAr: "تاريخ المصروف", value: "22 Apr 2026", valueAr: "22 أبريل 2026" },
      { label: "Merchant", labelAr: "الجهة", value: "Jarir Bookstore, Riyadh", valueAr: "مكتبة جرير، الرياض" },
      { label: "Participants", labelAr: "المشاركون", value: "10 usability-test participants", valueAr: "10 مشاركين في اختبار الاستخدام" },
      { label: "Payment", labelAr: "الدفع", value: "Personal card · reimburse", valueAr: "بطاقة شخصية · استرداد" },
      { label: "Cost centre", labelAr: "مركز التكلفة", value: "CC-4120 · Digital Experience", valueAr: "CC-4120 · التجربة الرقمية" },
      { label: "VAT", labelAr: "ضريبة القيمة المضافة", value: "SAR 150 · included", valueAr: "150 ر.س · مشمولة" },
    ],
    reason: "Gift vouchers for the ten staff who took part in the Services-module usability tests.",
    reasonAr: "قسائم هدايا للموظفين العشرة الذين شاركوا في اختبارات قابلية استخدام وحدة الخدمات.",
    flags: [
      { tone: "info", text: "Within the SAR 150 per participant research limit.", textAr: "ضمن حد الأبحاث البالغ 150 ر.س للمشارك." },
      { tone: "info", text: "Receipt attached and matches the claimed amount.", textAr: "الإيصال مرفق ومطابق للمبلغ." },
    ],
    chain: [
      { role: "Line manager", roleAr: "المدير المباشر", ...ME, state: "current" },
      { role: "Finance", roleAr: "المالية", who: "Abdulaziz Al-Rasheed", whoAr: "عبدالعزيز الرشيد", state: "waiting" },
    ],
    files: [
      { id: "f1", name: "Receipt · Jarir.pdf", nameAr: "إيصال · جرير.pdf", size: "412 KB" },
      { id: "f2", name: "Participant list.xlsx", nameAr: "قائمة المشاركين.xlsx", size: "18 KB" },
    ],
    history: [
      { id: "h1", label: "Submitted", labelAr: "تم الإرسال", who: "Saad Al-Yami", whoAr: "سعد اليامي", when: "26 Apr · 17:02", whenAr: "26 أبريل · 17:02" },
      { id: "h2", label: "Policy check passed", labelAr: "اجتاز فحص السياسة", who: "System", whoAr: "النظام", when: "26 Apr · 17:03", whenAr: "26 أبريل · 17:03" },
    ],
  },

  ap3: {
    whoTitle: "UI Designer", whoTitleAr: "مصممة واجهات",
    dept: "Digital Experience", deptAr: "التجربة الرقمية",
    employeeNo: "EMP-10517",
    submittedOn: "25 Apr 2026 · 20:40", submittedOnAr: "25 أبريل 2026 · 20:40",
    lines: [
      { label: "Date worked", labelAr: "تاريخ العمل", value: "25 Apr 2026 (Saturday)", valueAr: "25 أبريل 2026 (السبت)" },
      { label: "Hours", labelAr: "الساعات", value: "6 (10:00 – 16:00)", valueAr: "6 (10:00 – 16:00)" },
      { label: "Rate", labelAr: "المعدل", value: "Weekend · 150%", valueAr: "نهاية الأسبوع · 150%" },
      { label: "Project", labelAr: "المشروع", value: "Wave 2 · Arabic content freeze", valueAr: "الموجة 2 · إغلاق المحتوى العربي" },
      { label: "Estimated cost", labelAr: "التكلفة التقديرية", value: "SAR 1,320", valueAr: "1,320 ر.س" },
      { label: "Month to date", labelAr: "منذ بداية الشهر", value: "14 of 30 OT hours", valueAr: "14 من 30 ساعة إضافية" },
    ],
    reason: "Arabic copy for the Services module had to be locked before Sunday's build. Worked with the translation vendor over the weekend.",
    reasonAr: "كان يجب إغلاق النصوص العربية لوحدة الخدمات قبل إصدار يوم الأحد، وتم العمل مع مورد الترجمة نهاية الأسبوع.",
    flags: [
      { tone: "warn", text: "Third weekend claim this quarter for this employee.", textAr: "ثالث مطالبة نهاية أسبوع لهذا الموظف هذا الربع." },
      { tone: "info", text: "Attendance log confirms badge-in at 09:52.", textAr: "سجل الحضور يؤكد الدخول الساعة 09:52." },
    ],
    chain: [
      { role: "Line manager", roleAr: "المدير المباشر", ...ME, state: "current" },
      { role: "Payroll", roleAr: "الرواتب", who: "Payroll desk", whoAr: "مكتب الرواتب", state: "waiting" },
    ],
    files: [
      { id: "f1", name: "Badge log · 25 Apr.pdf", nameAr: "سجل الدخول · 25 أبريل.pdf", size: "96 KB" },
    ],
    history: [
      { id: "h1", label: "Submitted", labelAr: "تم الإرسال", who: "Tala Nasser", whoAr: "تالا ناصر", when: "25 Apr · 20:40", whenAr: "25 أبريل · 20:40" },
    ],
  },

  ap4: {
    whoTitle: "UX Researcher", whoTitleAr: "باحث تجربة المستخدم",
    dept: "Digital Experience", deptAr: "التجربة الرقمية",
    employeeNo: "EMP-10604",
    submittedOn: "23 Apr 2026 · 11:26", submittedOnAr: "23 أبريل 2026 · 11:26",
    lines: [
      { label: "Item", labelAr: "الصنف", value: "Eye-tracking testing seat (hardware + licence)", valueAr: "مقعد اختبار بتتبع العين (جهاز + ترخيص)" },
      { label: "Quantity", labelAr: "الكمية", value: "4", valueAr: "4" },
      { label: "Unit price", labelAr: "سعر الوحدة", value: "SAR 7,100", valueAr: "7,100 ر.س" },
      { label: "Total", labelAr: "الإجمالي", value: "SAR 28,400", valueAr: "28,400 ر.س" },
      { label: "Supplier", labelAr: "المورد", value: "Al-Faisaliah Tech (approved)", valueAr: "الفيصلية للتقنية (معتمد)" },
      { label: "Budget line", labelAr: "بند الميزانية", value: "OPEX · Research tools", valueAr: "تشغيلي · أدوات الأبحاث" },
      { label: "Needed by", labelAr: "مطلوب بحلول", value: "1 Jun 2026", valueAr: "1 يونيو 2026" },
    ],
    reason: "The research lab needs four testing seats before the June round of Services-module usability studies.",
    reasonAr: "يحتاج مختبر الأبحاث إلى أربعة مقاعد اختبار قبل جولة يونيو من دراسات قابلية استخدام وحدة الخدمات.",
    flags: [
      { tone: "warn", text: "Above your SAR 25,000 limit — needs Finance after you.", textAr: "يتجاوز حدك البالغ 25,000 ر.س — يحتاج إلى المالية بعدك." },
      { tone: "warn", text: "5 days waiting — the SLA is 3 working days.", textAr: "5 أيام انتظار — المستوى المتفق عليه 3 أيام عمل." },
      { tone: "info", text: "Research tools budget: SAR 61,200 of 180,000 used.", textAr: "ميزانية أدوات الأبحاث: 61,200 من 180,000 ر.س." },
    ],
    chain: [
      { role: "Line manager", roleAr: "المدير المباشر", ...ME, state: "current" },
      { role: "Finance", roleAr: "المالية", who: "Abdulaziz Al-Rasheed", whoAr: "عبدالعزيز الرشيد", state: "waiting" },
      { role: "Procurement", roleAr: "المشتريات", who: "Procurement desk", whoAr: "مكتب المشتريات", state: "waiting" },
    ],
    files: [
      { id: "f1", name: "Quotation · Al-Faisaliah.pdf", nameAr: "عرض سعر · الفيصلية.pdf", size: "780 KB" },
      { id: "f2", name: "Lab setup plan.pdf", nameAr: "خطة تجهيز المختبر.pdf", size: "1.2 MB" },
    ],
    history: [
      { id: "h1", label: "Submitted", labelAr: "تم الإرسال", who: "Saad Al-Yami", whoAr: "سعد اليامي", when: "23 Apr · 11:26", whenAr: "23 أبريل · 11:26" },
      { id: "h2", label: "Budget availability confirmed", labelAr: "تأكيد توفر الميزانية", who: "System", whoAr: "النظام", when: "23 Apr · 11:27", whenAr: "23 أبريل · 11:27" },
      { id: "h3", label: "Reminder sent to approver", labelAr: "تذكير مرسل للمعتمد", who: "System", whoAr: "النظام", when: "26 Apr · 08:00", whenAr: "26 أبريل · 08:00" },
    ],
  },

  ap5: {
    whoTitle: "Product Designer", whoTitleAr: "مصممة منتجات",
    dept: "Digital Experience", deptAr: "التجربة الرقمية",
    employeeNo: "EMP-10712",
    submittedOn: "28 Apr 2026 · 06:20", submittedOnAr: "28 أبريل 2026 · 06:20",
    lines: [
      { label: "Letter type", labelAr: "نوع الخطاب", value: "Salary certificate", valueAr: "شهادة راتب" },
      { label: "Addressed to", labelAr: "موجه إلى", value: "Al Rajhi Bank", valueAr: "مصرف الراجحي" },
      { label: "Language", labelAr: "اللغة", value: "Arabic & English", valueAr: "عربي وإنجليزي" },
      { label: "Include salary", labelAr: "تضمين الراتب", value: "Yes · gross only", valueAr: "نعم · الإجمالي فقط" },
      { label: "Delivery", labelAr: "التسليم", value: "Digital copy · stamped PDF", valueAr: "نسخة رقمية · PDF مختوم" },
    ],
    reason: "Required for a personal home-finance application. No copy of the contract is needed.",
    reasonAr: "مطلوبة لطلب تمويل عقاري شخصي، ولا تلزم نسخة من العقد.",
    flags: [
      { tone: "info", text: "Routine request — People & Culture issues it after you.", textAr: "طلب اعتيادي — يصدر من الموظفين والثقافة بعد موافقتك." },
    ],
    chain: [
      { role: "Line manager", roleAr: "المدير المباشر", ...ME, state: "current" },
      { role: "People & Culture", roleAr: "الموظفون والثقافة", who: "Hind Al-Amri", whoAr: "هند العمري", state: "waiting" },
    ],
    files: [],
    history: [
      { id: "h1", label: "Submitted", labelAr: "تم الإرسال", who: "Lina Al-Harbi", whoAr: "لينا الحربي", when: "28 Apr · 06:20", whenAr: "28 أبريل · 06:20" },
    ],
  },

  ap6: {
    whoTitle: "UI Designer", whoTitleAr: "مصممة واجهات",
    dept: "Digital Experience", deptAr: "التجربة الرقمية",
    employeeNo: "EMP-10517",
    submittedOn: "26 Apr 2026 · 13:05", submittedOnAr: "26 أبريل 2026 · 13:05",
    lines: [
      { label: "Leave type", labelAr: "نوع الإجازة", value: "Annual", valueAr: "سنوية" },
      { label: "From", labelAr: "من", value: "1 Jun 2026", valueAr: "1 يونيو 2026" },
      { label: "To", labelAr: "إلى", value: "3 Jun 2026", valueAr: "3 يونيو 2026" },
      { label: "Working days", labelAr: "أيام العمل", value: "3", valueAr: "3" },
      { label: "Cover", labelAr: "البديل", value: "Lina Al-Harbi", valueAr: "لينا الحربي" },
    ],
    reason: "Personal travel. Lina will cover the UI reviews for all three days.",
    reasonAr: "سفر شخصي، وستتولى لينا مراجعات الواجهات طوال الأيام الثلاثة.",
    flags: [
      { tone: "info", text: "No one else on the team is away those days.", textAr: "لا يوجد زميل آخر في إجازة خلال تلك الأيام." },
    ],
    chain: [
      { role: "Line manager", roleAr: "المدير المباشر", ...ME, state: "done", when: "Yesterday · 16:20", whenAr: "أمس · 16:20" },
      { role: "People & Culture", roleAr: "الموظفون والثقافة", who: "Hind Al-Amri", whoAr: "هند العمري", state: "current" },
    ],
    files: [],
    history: [
      { id: "h1", label: "Submitted", labelAr: "تم الإرسال", who: "Tala Nasser", whoAr: "تالا ناصر", when: "26 Apr · 13:05", whenAr: "26 أبريل · 13:05" },
      { id: "h2", label: "Approved by line manager", labelAr: "اعتمده المدير المباشر", who: "Fawaz Al-Ghailan", whoAr: "فواز الغيلان", when: "Yesterday · 16:20", whenAr: "أمس · 16:20" },
    ],
  },
}

export const getApprovalDetail = (id: string) => approvalDetail[id]


// ── audit ────────────────────────────────────────────────────────────────────
export type ManagerAudit = { id: string; action: string; target: string; comment?: string; who: string; time: string }
let auditLog: ManagerAudit[] = [
  { id: "m1", action: "approved", target: "LV-3301 · Annual leave", who: "Fawaz A.", time: "Yesterday · 16:20" },
]
export const useManagerAudit = () => React.useSyncExternalStore(subscribe, () => auditLog)
function logManager(action: string, target: string, comment?: string) {
  auditLog = [{ id: `m-${Date.now().toString(36)}`, action, target, comment, who: "Fawaz A.", time: "Just now" }, ...auditLog]
}

/** SAR with Saudi/international grouping — never lakh/crore. */
export const sar = (n: number, isAr: boolean) =>
  isAr ? `${n.toLocaleString("en-US")} ر.س` : `SAR ${n.toLocaleString("en-US")}`
