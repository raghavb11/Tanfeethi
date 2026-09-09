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
  { id: "r1", name: "Sara Al-Mutairi", nameAr: "سارة المطيري", initials: "SM", title: "Senior Business Analyst", titleAr: "محللة أعمال أولى", state: "present", checkIn: "08:12", location: "HQ · L14", locationAr: "المقر · ط14", openTasks: 7, overdue: 1, utilisation: 86, leaveBalance: 14 },
  { id: "r2", name: "Mohammad Iqbal", nameAr: "محمد إقبال", initials: "MI", title: "Operations Lead", titleAr: "قائد العمليات", state: "present", checkIn: "07:48", location: "Terminal 2", locationAr: "الصالة 2", openTasks: 11, overdue: 3, utilisation: 94, leaveBalance: 6 },
  { id: "r3", name: "Layan Al Marwani", nameAr: "ليان المرواني", initials: "LM", title: "Business Analyst", titleAr: "محللة أعمال", state: "remote", checkIn: "08:35", location: "Remote", locationAr: "عن بُعد", openTasks: 5, overdue: 0, utilisation: 71, leaveBalance: 19 },
  { id: "r4", name: "Noura Saleh", nameAr: "نورة صالح", initials: "NS", title: "Service Coordinator", titleAr: "منسقة خدمات", state: "leave", location: "Annual leave", locationAr: "إجازة سنوية", openTasks: 2, overdue: 0, utilisation: 0, leaveBalance: 3 },
  { id: "r5", name: "Faisal Al-Harbi", nameAr: "فيصل الحربي", initials: "FH", title: "Operations Officer", titleAr: "مسؤول عمليات", state: "late", checkIn: "09:41", location: "Terminal 1", locationAr: "الصالة 1", openTasks: 9, overdue: 2, utilisation: 88, leaveBalance: 11 },
  { id: "r6", name: "Saud Al-Dosari", nameAr: "سعود الدوسري", initials: "SD", title: "Lounge Supervisor", titleAr: "مشرف الصالة", state: "present", checkIn: "06:55", location: "HQ · Ground", locationAr: "المقر · الأرضي", openTasks: 4, overdue: 0, utilisation: 63, leaveBalance: 21 },
  { id: "r7", name: "Reem Al-Otaibi", nameAr: "ريم العتيبي", initials: "RO", title: "Data Analyst", titleAr: "محللة بيانات", state: "present", checkIn: "08:02", location: "HQ · L12", locationAr: "المقر · ط12", openTasks: 6, overdue: 0, utilisation: 78, leaveBalance: 17 },
  { id: "r8", name: "Turki Al-Shehri", nameAr: "تركي الشهري", initials: "TS", title: "Operations Officer", titleAr: "مسؤول عمليات", state: "absent", location: "Not checked in", locationAr: "لم يسجّل حضور", openTasks: 3, overdue: 1, utilisation: 0, leaveBalance: 9 },
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
  { id: "ap1", ref: "LV-3312", who: "Sara Al-Mutairi", whoAr: "سارة المطيري", initials: "SM", kind: "leave", title: "Annual leave", titleAr: "إجازة سنوية", detail: "24 – 28 Aug · 5 days", detailAr: "24 – 28 أغسطس · 5 أيام", submitted: "1 day ago", submittedAr: "قبل يوم", ageDays: 1, state: "Pending" },
  { id: "ap2", ref: "EX-8841", who: "Mohammad Iqbal", whoAr: "محمد إقبال", initials: "MI", kind: "expense", title: "Expense claim", titleAr: "مطالبة مصروفات", detail: "Client lunch · Riyadh", detailAr: "غداء عميل · الرياض", amount: 1150, submitted: "2 days ago", submittedAr: "قبل يومين", ageDays: 2, state: "Pending" },
  { id: "ap3", ref: "OT-1207", who: "Layan Al Marwani", whoAr: "ليان المرواني", initials: "LM", kind: "overtime", title: "Overtime request", titleAr: "طلب عمل إضافي", detail: "6 hrs · 9 Aug (weekend)", detailAr: "6 ساعات · 9 أغسطس (نهاية الأسبوع)", submitted: "3 days ago", submittedAr: "قبل 3 أيام", ageDays: 3, state: "Pending" },
  { id: "ap4", ref: "PR-2290", who: "Faisal Al-Harbi", whoAr: "فيصل الحربي", initials: "FH", kind: "purchase", title: "Purchase request", titleAr: "طلب شراء", detail: "Ground handling radios ×4", detailAr: "أجهزة اتصال المناولة ×4", amount: 28400, submitted: "5 days ago", submittedAr: "قبل 5 أيام", ageDays: 5, state: "Pending" },
  { id: "ap5", ref: "LT-0765", who: "Reem Al-Otaibi", whoAr: "ريم العتيبي", initials: "RO", kind: "letter", title: "Salary certificate", titleAr: "شهادة راتب", detail: "For a bank application", detailAr: "لتقديمها إلى البنك", submitted: "6 hours ago", submittedAr: "قبل 6 ساعات", ageDays: 0, state: "Pending" },
  { id: "ap6", ref: "LV-3301", who: "Saud Al-Dosari", whoAr: "سعود الدوسري", initials: "SD", kind: "leave", title: "Annual leave", titleAr: "إجازة سنوية", detail: "2 – 4 Sep · 3 days", detailAr: "2 – 4 سبتمبر · 3 أيام", submitted: "Yesterday", submittedAr: "أمس", ageDays: 1, state: "Approved" },
]

// ── team leave, next 30 days ─────────────────────────────────────────────────
export const upcomingLeave: { id: string; who: string; whoAr: string; initials: string; range: string; rangeAr: string; days: number; type: string; typeAr: string; approved: boolean }[] = [
  { id: "ul1", who: "Noura Saleh", whoAr: "نورة صالح", initials: "NS", range: "Now – 4 Sep", rangeAr: "الآن – 4 سبتمبر", days: 4, type: "Annual", typeAr: "سنوية", approved: true },
  { id: "ul2", who: "Saud Al-Dosari", whoAr: "سعود الدوسري", initials: "SD", range: "2 – 4 Sep", rangeAr: "2 – 4 سبتمبر", days: 3, type: "Annual", typeAr: "سنوية", approved: true },
  { id: "ul3", who: "Sara Al-Mutairi", whoAr: "سارة المطيري", initials: "SM", range: "24 – 28 Sep", rangeAr: "24 – 28 سبتمبر", days: 5, type: "Annual", typeAr: "سنوية", approved: false },
  { id: "ul4", who: "Reem Al-Otaibi", whoAr: "ريم العتيبي", initials: "RO", range: "29 Sep", rangeAr: "29 سبتمبر", days: 1, type: "Personal", typeAr: "شخصية", approved: true },
]

/** Days in September where two or more people are away at once. */
export const leaveClashes: { date: string; dateAr: string; who: string[] }[] = [
  { date: "2 – 4 Sep", dateAr: "2 – 4 سبتمبر", who: ["Noura Saleh", "Saud Al-Dosari"] },
]

// ── attendance trend, this month ─────────────────────────────────────────────
export const attendanceTrend = {
  monthLabel: "August 2026",
  monthLabelAr: "أغسطس 2026",
  onTimePct: 91,
  lastMonthPct: 87,
  avgHours: 8.1,
  lateInstances: 6,
  remotePct: 22,
  /** Per working day of the current week: Sun–Thu. */
  week: [
    { day: "Sun", dayAr: "الأحد", present: 7, remote: 1, leave: 0, absent: 0 },
    { day: "Mon", dayAr: "الاثنين", present: 6, remote: 1, leave: 1, absent: 0 },
    { day: "Tue", dayAr: "الثلاثاء", present: 5, remote: 2, leave: 1, absent: 0 },
    { day: "Wed", dayAr: "الأربعاء", present: 6, remote: 1, leave: 1, absent: 0 },
    { day: "Thu", dayAr: "الخميس", present: 5, remote: 1, leave: 1, absent: 1 },
  ],
}

export const headcount = { budgeted: 10, filled: 8, openRoles: 2, probation: 1 }

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

const KHALID = { who: "Khalid Al-Qahtani", whoAr: "خالد القحطاني" }

export const approvalDetail: Record<string, ApprovalDetail> = {
  ap1: {
    whoTitle: "Senior Business Analyst", whoTitleAr: "محللة أعمال أولى",
    dept: "Digital Workplace", deptAr: "بيئة العمل الرقمية",
    employeeNo: "EMP-10428",
    submittedOn: "11 Aug 2026 · 09:14", submittedOnAr: "11 أغسطس 2026 · 09:14",
    lines: [
      { label: "Leave type", labelAr: "نوع الإجازة", value: "Annual", valueAr: "سنوية" },
      { label: "From", labelAr: "من", value: "24 Aug 2026 (Mon)", valueAr: "24 أغسطس 2026 (الاثنين)" },
      { label: "To", labelAr: "إلى", value: "28 Aug 2026 (Fri)", valueAr: "28 أغسطس 2026 (الجمعة)" },
      { label: "Working days", labelAr: "أيام العمل", value: "5", valueAr: "5" },
      { label: "Back at work", labelAr: "العودة للعمل", value: "31 Aug 2026", valueAr: "31 أغسطس 2026" },
      { label: "Balance after", labelAr: "الرصيد بعد", value: "9 of 21 days", valueAr: "9 من 21 يومًا" },
      { label: "Cover", labelAr: "البديل", value: "Layan Al Marwani", valueAr: "ليان المرواني" },
    ],
    reason: "Family trip booked before the Q3 freeze. Handover pack is ready and Layan will cover the Leave module walkthroughs.",
    reasonAr: "رحلة عائلية محجوزة قبل إغلاق الربع الثالث. ملف التسليم جاهز وستتولى ليان جلسات وحدة الإجازات.",
    flags: [
      { tone: "warn", text: "Overlaps the Wave 2 UAT window (23 – 27 Aug).", textAr: "يتعارض مع فترة اختبار القبول للموجة الثانية (23 – 27 أغسطس)." },
      { tone: "info", text: "No one else on the team is away those days.", textAr: "لا يوجد زميل آخر في إجازة خلال تلك الأيام." },
    ],
    chain: [
      { role: "Line manager", roleAr: "المدير المباشر", ...KHALID, state: "current" },
      { role: "People & Culture", roleAr: "الموظفون والثقافة", who: "Hind Al-Amri", whoAr: "هند العمري", state: "waiting" },
    ],
    files: [],
    history: [
      { id: "h1", label: "Submitted", labelAr: "تم الإرسال", who: "Sara Al-Mutairi", whoAr: "سارة المطيري", when: "11 Aug · 09:14", whenAr: "11 أغسطس · 09:14" },
      { id: "h2", label: "Balance verified by Oracle HRMS", labelAr: "تم التحقق من الرصيد", who: "System", whoAr: "النظام", when: "11 Aug · 09:14", whenAr: "11 أغسطس · 09:14" },
    ],
  },

  ap2: {
    whoTitle: "Operations Lead", whoTitleAr: "قائد العمليات",
    dept: "Ground Operations", deptAr: "العمليات الأرضية",
    employeeNo: "EMP-10133",
    submittedOn: "10 Aug 2026 · 17:02", submittedOnAr: "10 أغسطس 2026 · 17:02",
    lines: [
      { label: "Category", labelAr: "الفئة", value: "Business meal", valueAr: "ضيافة عمل" },
      { label: "Date of expense", labelAr: "تاريخ المصروف", value: "6 Aug 2026", valueAr: "6 أغسطس 2026" },
      { label: "Merchant", labelAr: "الجهة", value: "Najd Village, Riyadh", valueAr: "قرية نجد، الرياض" },
      { label: "Attendees", labelAr: "الحضور", value: "4 (2 client, 2 staff)", valueAr: "4 (2 عميل، 2 موظف)" },
      { label: "Payment", labelAr: "الدفع", value: "Personal card · reimburse", valueAr: "بطاقة شخصية · استرداد" },
      { label: "Cost centre", labelAr: "مركز التكلفة", value: "CC-2200 · Ground Ops", valueAr: "CC-2200 · العمليات الأرضية" },
      { label: "VAT", labelAr: "ضريبة القيمة المضافة", value: "SAR 150 · included", valueAr: "150 ر.س · مشمولة" },
    ],
    reason: "Working lunch with the ground-handling vendor to close the September SLA revisions before the contract renewal.",
    reasonAr: "غداء عمل مع مورد المناولة الأرضية لإغلاق تعديلات اتفاقية الخدمة لشهر سبتمبر قبل تجديد العقد.",
    flags: [
      { tone: "info", text: "Within the SAR 300 per head hospitality limit.", textAr: "ضمن حد الضيافة البالغ 300 ر.س للفرد." },
      { tone: "info", text: "Receipt attached and matches the claimed amount.", textAr: "الإيصال مرفق ومطابق للمبلغ." },
    ],
    chain: [
      { role: "Line manager", roleAr: "المدير المباشر", ...KHALID, state: "current" },
      { role: "Finance", roleAr: "المالية", who: "Abdulaziz Al-Rasheed", whoAr: "عبدالعزيز الرشيد", state: "waiting" },
    ],
    files: [
      { id: "f1", name: "Receipt · Najd Village.pdf", nameAr: "إيصال · قرية نجد.pdf", size: "412 KB" },
      { id: "f2", name: "Attendee list.xlsx", nameAr: "قائمة الحضور.xlsx", size: "18 KB" },
    ],
    history: [
      { id: "h1", label: "Submitted", labelAr: "تم الإرسال", who: "Mohammad Iqbal", whoAr: "محمد إقبال", when: "10 Aug · 17:02", whenAr: "10 أغسطس · 17:02" },
      { id: "h2", label: "Policy check passed", labelAr: "اجتاز فحص السياسة", who: "System", whoAr: "النظام", when: "10 Aug · 17:03", whenAr: "10 أغسطس · 17:03" },
    ],
  },

  ap3: {
    whoTitle: "Business Analyst", whoTitleAr: "محللة أعمال",
    dept: "Digital Workplace", deptAr: "بيئة العمل الرقمية",
    employeeNo: "EMP-10517",
    submittedOn: "9 Aug 2026 · 20:40", submittedOnAr: "9 أغسطس 2026 · 20:40",
    lines: [
      { label: "Date worked", labelAr: "تاريخ العمل", value: "9 Aug 2026 (Saturday)", valueAr: "9 أغسطس 2026 (السبت)" },
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
      { role: "Line manager", roleAr: "المدير المباشر", ...KHALID, state: "current" },
      { role: "Payroll", roleAr: "الرواتب", who: "Payroll desk", whoAr: "مكتب الرواتب", state: "waiting" },
    ],
    files: [
      { id: "f1", name: "Badge log · 9 Aug.pdf", nameAr: "سجل الدخول · 9 أغسطس.pdf", size: "96 KB" },
    ],
    history: [
      { id: "h1", label: "Submitted", labelAr: "تم الإرسال", who: "Layan Al Marwani", whoAr: "ليان المرواني", when: "9 Aug · 20:40", whenAr: "9 أغسطس · 20:40" },
    ],
  },

  ap4: {
    whoTitle: "Operations Officer", whoTitleAr: "مسؤول عمليات",
    dept: "Ground Operations", deptAr: "العمليات الأرضية",
    employeeNo: "EMP-10604",
    submittedOn: "7 Aug 2026 · 11:26", submittedOnAr: "7 أغسطس 2026 · 11:26",
    lines: [
      { label: "Item", labelAr: "الصنف", value: "Motorola DP4801e radio", valueAr: "جهاز اتصال Motorola DP4801e" },
      { label: "Quantity", labelAr: "الكمية", value: "4", valueAr: "4" },
      { label: "Unit price", labelAr: "سعر الوحدة", value: "SAR 7,100", valueAr: "7,100 ر.س" },
      { label: "Total", labelAr: "الإجمالي", value: "SAR 28,400", valueAr: "28,400 ر.س" },
      { label: "Supplier", labelAr: "المورد", value: "Al-Faisaliah Comms (approved)", valueAr: "الفيصلية للاتصالات (معتمد)" },
      { label: "Budget line", labelAr: "بند الميزانية", value: "OPEX · Ops equipment", valueAr: "تشغيلي · معدات العمليات" },
      { label: "Needed by", labelAr: "مطلوب بحلول", value: "1 Sep 2026", valueAr: "1 سبتمبر 2026" },
    ],
    reason: "Four handsets from the T1 pool failed the last radio check. Replacements are needed before the September schedule ramp.",
    reasonAr: "أربعة أجهزة من مجموعة الصالة 1 لم تجتز الفحص الأخير، والبدائل مطلوبة قبل زيادة جدول سبتمبر.",
    flags: [
      { tone: "warn", text: "Above your SAR 25,000 limit — needs Finance after you.", textAr: "يتجاوز حدك البالغ 25,000 ر.س — يحتاج إلى المالية بعدك." },
      { tone: "warn", text: "5 days waiting — the SLA is 3 working days.", textAr: "5 أيام انتظار — المستوى المتفق عليه 3 أيام عمل." },
      { tone: "info", text: "Ops equipment budget: SAR 61,200 of 180,000 used.", textAr: "ميزانية معدات العمليات: 61,200 من 180,000 ر.س." },
    ],
    chain: [
      { role: "Line manager", roleAr: "المدير المباشر", ...KHALID, state: "current" },
      { role: "Finance", roleAr: "المالية", who: "Abdulaziz Al-Rasheed", whoAr: "عبدالعزيز الرشيد", state: "waiting" },
      { role: "Procurement", roleAr: "المشتريات", who: "Procurement desk", whoAr: "مكتب المشتريات", state: "waiting" },
    ],
    files: [
      { id: "f1", name: "Quotation · Al-Faisaliah.pdf", nameAr: "عرض سعر · الفيصلية.pdf", size: "780 KB" },
      { id: "f2", name: "Radio check report.pdf", nameAr: "تقرير فحص الأجهزة.pdf", size: "1.2 MB" },
    ],
    history: [
      { id: "h1", label: "Submitted", labelAr: "تم الإرسال", who: "Faisal Al-Harbi", whoAr: "فيصل الحربي", when: "7 Aug · 11:26", whenAr: "7 أغسطس · 11:26" },
      { id: "h2", label: "Budget availability confirmed", labelAr: "تأكيد توفر الميزانية", who: "System", whoAr: "النظام", when: "7 Aug · 11:27", whenAr: "7 أغسطس · 11:27" },
      { id: "h3", label: "Reminder sent to approver", labelAr: "تذكير مرسل للمعتمد", who: "System", whoAr: "النظام", when: "10 Aug · 08:00", whenAr: "10 أغسطس · 08:00" },
    ],
  },

  ap5: {
    whoTitle: "Data Analyst", whoTitleAr: "محللة بيانات",
    dept: "Digital Workplace", deptAr: "بيئة العمل الرقمية",
    employeeNo: "EMP-10712",
    submittedOn: "12 Aug 2026 · 06:20", submittedOnAr: "12 أغسطس 2026 · 06:20",
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
      { role: "Line manager", roleAr: "المدير المباشر", ...KHALID, state: "current" },
      { role: "People & Culture", roleAr: "الموظفون والثقافة", who: "Hind Al-Amri", whoAr: "هند العمري", state: "waiting" },
    ],
    files: [],
    history: [
      { id: "h1", label: "Submitted", labelAr: "تم الإرسال", who: "Reem Al-Otaibi", whoAr: "ريم العتيبي", when: "12 Aug · 06:20", whenAr: "12 أغسطس · 06:20" },
    ],
  },

  ap6: {
    whoTitle: "Lounge Supervisor", whoTitleAr: "مشرف الصالة",
    dept: "Guest Experience", deptAr: "تجربة الضيوف",
    employeeNo: "EMP-10288",
    submittedOn: "10 Aug 2026 · 13:05", submittedOnAr: "10 أغسطس 2026 · 13:05",
    lines: [
      { label: "Leave type", labelAr: "نوع الإجازة", value: "Annual", valueAr: "سنوية" },
      { label: "From", labelAr: "من", value: "2 Sep 2026", valueAr: "2 سبتمبر 2026" },
      { label: "To", labelAr: "إلى", value: "4 Sep 2026", valueAr: "4 سبتمبر 2026" },
      { label: "Working days", labelAr: "أيام العمل", value: "3", valueAr: "3" },
      { label: "Cover", labelAr: "البديل", value: "Turki Al-Shehri", valueAr: "تركي الشهري" },
    ],
    reason: "Personal travel. Lounge shift is covered for all three days.",
    reasonAr: "سفر شخصي، ووردية الصالة مغطاة طوال الأيام الثلاثة.",
    flags: [
      { tone: "warn", text: "Clashes with Noura Saleh's leave (2 – 4 Sep).", textAr: "يتعارض مع إجازة نورة صالح (2 – 4 سبتمبر)." },
    ],
    chain: [
      { role: "Line manager", roleAr: "المدير المباشر", ...KHALID, state: "done", when: "Yesterday · 16:20", whenAr: "أمس · 16:20" },
      { role: "People & Culture", roleAr: "الموظفون والثقافة", who: "Hind Al-Amri", whoAr: "هند العمري", state: "current" },
    ],
    files: [],
    history: [
      { id: "h1", label: "Submitted", labelAr: "تم الإرسال", who: "Saud Al-Dosari", whoAr: "سعود الدوسري", when: "10 Aug · 13:05", whenAr: "10 أغسطس · 13:05" },
      { id: "h2", label: "Approved by line manager", labelAr: "اعتمده المدير المباشر", who: "Khalid A.", whoAr: "خالد أ.", when: "Yesterday · 16:20", whenAr: "أمس · 16:20" },
    ],
  },
}

export const getApprovalDetail = (id: string) => approvalDetail[id]


// ── audit ────────────────────────────────────────────────────────────────────
export type ManagerAudit = { id: string; action: string; target: string; comment?: string; who: string; time: string }
let auditLog: ManagerAudit[] = [
  { id: "m1", action: "approved", target: "LV-3301 · Annual leave", who: "Khalid A.", time: "Yesterday · 16:20" },
]
export const useManagerAudit = () => React.useSyncExternalStore(subscribe, () => auditLog)
function logManager(action: string, target: string, comment?: string) {
  auditLog = [{ id: `m-${Date.now().toString(36)}`, action, target, comment, who: "Khalid A.", time: "Just now" }, ...auditLog]
}

/** SAR with Saudi/international grouping — never lakh/crore. */
export const sar = (n: number, isAr: boolean) =>
  isAr ? `${n.toLocaleString("en-US")} ر.س` : `SAR ${n.toLocaleString("en-US")}`
