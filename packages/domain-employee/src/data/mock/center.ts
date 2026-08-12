/** Data for the Employee Center dashboard. Demo-only fixtures — a real build
 *  wires these to the HR / attendance / payroll systems. */

// ─── 1–6 · identity ──────────────────────────────────────────────────────────
export const emp = {
  name: "Khalid Al-Saadi",
  nameAr: "خالد السعدي",
  initials: "KS",
  empId: "TF-04821",
  title: "Director, Business Operations",
  titleAr: "مدير العمليات التجارية",
  department: "Business Operations",
  departmentAr: "العمليات التجارية",
  sector: "Commercial Sector",
  sectorAr: "القطاع التجاري",
  manager: "Ahmed Mohammed",
  managerAr: "أحمد محمد",
  managerTitle: "VP, Commercial",
  managerTitleAr: "نائب الرئيس، التجاري",
  managerInitials: "AM",
  location: "HQ · Riyadh",
  locationAr: "المقر · الرياض",
  workMode: "Hybrid",
  workModeAr: "هجين",
  email: "khalid@altanfeethi.com.sa",
  grade: "Grade 14",
  gradeAr: "الدرجة 14",
  joined: "Joined Mar 2019",
  joinedAr: "انضم مارس 2019",
  isManager: true,
}

// ─── 7–9 · today's attendance ────────────────────────────────────────────────
export type AttStatus = "present" | "remote" | "leave" | "absent"
export const today = {
  status: "present" as AttStatus,
  dayName: "Tuesday",
  dayNameAr: "الثلاثاء",
  dateLabel: "Aug 12, 2026",
  dateLabelAr: "١٢ أغسطس ٢٠٢٦",
  checkIn: "08:42",
  checkOut: null as string | null,
  targetHours: 8,
  workedMinutes: 263,
  location: "HQ · L14",
  locationAr: "المقر · ط14",
}

// ─── 18 · attendance summary (this month) ────────────────────────────────────
export type DayStatus = "complete" | "current" | "upcoming" | "leave" | "absent"
export const attendanceSummary = {
  monthLabel: "August 2026",
  monthLabelAr: "أغسطس ٢٠٢٦",
  presentDays: 8,
  leaveDays: 1,
  lateDays: 1,
  absentDays: 0,
  remoteDays: 3,
  onTimePct: 96,
  avgHours: 8.3,
  workedHours: 71,
  expectedHours: 80,
  week: [
    { day: "Mon", dayAr: "الإثنين", hours: 8.2, status: "complete" as DayStatus, clockIn: "08:30", clockOut: "17:12" },
    { day: "Tue", dayAr: "الثلاثاء", hours: 4.4, status: "current" as DayStatus, clockIn: "08:42", clockOut: null },
    { day: "Wed", dayAr: "الأربعاء", hours: null, status: "upcoming" as DayStatus, clockIn: null, clockOut: null },
    { day: "Thu", dayAr: "الخميس", hours: null, status: "leave" as DayStatus, clockIn: null, clockOut: null },
    { day: "Fri", dayAr: "الجمعة", hours: null, status: "upcoming" as DayStatus, clockIn: null, clockOut: null },
  ],
}

// ─── 10–12 · leave ───────────────────────────────────────────────────────────
export const leave = {
  balanceDays: 18,
  usedDays: 4,
  totalDays: 22,
  breakdown: [
    { id: "annual", label: "Annual", labelAr: "سنوية", used: 4, total: 22, color: "primary" as const },
    { id: "sick", label: "Sick", labelAr: "مرضية", used: 1, total: 14, color: "amber" as const },
    { id: "personal", label: "Personal", labelAr: "شخصية", used: 0, total: 5, color: "emerald" as const },
  ],
  upcoming: [
    { id: "up1", type: "Annual leave", typeAr: "إجازة سنوية", range: "Sep 14 – 18", rangeAr: "١٤ – ١٨ سبتمبر", days: 5, status: "Approved", statusAr: "معتمدة" },
  ],
}

// ─── 12 · my pending requests (own submissions awaiting action) ──────────────
export type ReqKind = "leave" | "expense" | "letter" | "document"
export const myRequests: { id: string; kind: ReqKind; title: string; titleAr: string; detail: string; detailAr: string; submitted: string; submittedAr: string; status: "Pending" | "In review"; statusAr: string }[] = [
  { id: "r1", kind: "leave", title: "Annual leave", titleAr: "إجازة سنوية", detail: "May 12 – 16 · 5 days", detailAr: "١٢ – ١٦ مايو · ٥ أيام", submitted: "2 days ago", submittedAr: "قبل يومين", status: "Pending", statusAr: "قيد المراجعة" },
  { id: "r2", kind: "expense", title: "Travel expense claim", titleAr: "مطالبة مصروفات سفر", detail: "SAR 2,480 · KAFD visit", detailAr: "٢٬٤٨٠ ر.س · زيارة المركز المالي", submitted: "4 days ago", submittedAr: "قبل ٤ أيام", status: "In review", statusAr: "قيد التدقيق" },
  { id: "r3", kind: "letter", title: "Salary certificate", titleAr: "شهادة راتب", detail: "For bank · Arabic + English", detailAr: "للبنك · عربي + إنجليزي", submitted: "Today", submittedAr: "اليوم", status: "Pending", statusAr: "قيد المراجعة" },
]

// ─── 13 · pending approvals (manager view) ───────────────────────────────────
export const approvals: { id: string; who: string; whoAr: string; initials: string; kind: "leave" | "expense" | "overtime"; title: string; titleAr: string; detail: string; detailAr: string; submitted: string; submittedAr: string }[] = [
  { id: "a1", who: "Sara Al-Mutairi", whoAr: "سارة المطيري", initials: "SM", kind: "leave", title: "Annual leave", titleAr: "إجازة سنوية", detail: "Aug 24 – 28 · 5 days", detailAr: "٢٤ – ٢٨ أغسطس · ٥ أيام", submitted: "1 day ago", submittedAr: "قبل يوم" },
  { id: "a2", who: "Mohammad Iqbal", whoAr: "محمد إقبال", initials: "MI", kind: "expense", title: "Expense claim", titleAr: "مطالبة مصروفات", detail: "SAR 1,150 · Client lunch", detailAr: "١٬١٥٠ ر.س · غداء عميل", submitted: "2 days ago", submittedAr: "قبل يومين" },
  { id: "a3", who: "Layan Al Marwani", whoAr: "ليان المرواني", initials: "LM", kind: "overtime", title: "Overtime request", titleAr: "طلب عمل إضافي", detail: "6 hrs · Aug 9 (weekend)", detailAr: "٦ ساعات · ٩ أغسطس (نهاية الأسبوع)", submitted: "3 days ago", submittedAr: "قبل ٣ أيام" },
]

// ─── 14 · latest payslip ─────────────────────────────────────────────────────
export const payslip = {
  month: "July 2026",
  monthAr: "يوليو ٢٠٢٦",
  payDate: "Jul 27, 2026",
  payDateAr: "٢٧ يوليو ٢٠٢٦",
  currency: "SAR",
  currencyAr: "ر.س",
  gross: 22500,
  deductions: 4100,
  net: 18400,
  status: "Paid",
  statusAr: "مدفوع",
  lines: [
    { label: "Basic salary", labelAr: "الراتب الأساسي", amount: 15000, kind: "earning" as const },
    { label: "Allowances", labelAr: "البدلات", amount: 7500, kind: "earning" as const },
    { label: "GOSI & deductions", labelAr: "التأمينات والخصومات", amount: -4100, kind: "deduction" as const },
  ],
}

// ─── 15 · benefits / allowances ──────────────────────────────────────────────
export const allowances = {
  currency: "SAR",
  currencyAr: "ر.س",
  monthlyTotal: 7500,
  items: [
    { id: "housing", label: "Housing", labelAr: "بدل سكن", amount: 4500, icon: "home" },
    { id: "transport", label: "Transport", labelAr: "بدل نقل", amount: 1200, icon: "car" },
    { id: "phone", label: "Communication", labelAr: "بدل اتصالات", amount: 300, icon: "phone" },
    { id: "education", label: "Education", labelAr: "بدل تعليم", amount: 1500, icon: "school" },
  ],
  benefits: [
    { id: "medical", label: "Medical — Class A (family)", labelAr: "تأمين طبي — فئة أ (عائلي)", icon: "heart" },
    { id: "insurance", label: "Life insurance — 24× salary", labelAr: "تأمين على الحياة — 24× الراتب", icon: "shield" },
    { id: "tickets", label: "Annual air tickets — family", labelAr: "تذاكر سفر سنوية — للعائلة", icon: "plane" },
  ],
}

// ─── 17 · HR notifications ───────────────────────────────────────────────────
export const hrNotifications: { id: string; kind: "info" | "action" | "success" | "alert"; icon: string; title: string; titleAr: string; body: string; bodyAr: string; time: string; timeAr: string; cta?: string; ctaAr?: string }[] = [
  { id: "n1", kind: "action", icon: "file-check", title: "Acknowledge updated policy", titleAr: "الإقرار بسياسة محدّثة", body: "Information Security Policy v4.0 needs your acknowledgement.", bodyAr: "سياسة أمن المعلومات الإصدار 4.0 بحاجة إلى إقرارك.", time: "2h ago", timeAr: "قبل ساعتين", cta: "Review", ctaAr: "مراجعة" },
  { id: "n2", kind: "success", icon: "wallet", title: "July payslip available", titleAr: "قسيمة راتب يوليو متاحة", body: "Your salary of SAR 18,400 was paid on Jul 27.", bodyAr: "تم دفع راتبك 18,400 ر.س في 27 يوليو.", time: "Jul 27", timeAr: "٢٧ يوليو", cta: "View", ctaAr: "عرض" },
  { id: "n3", kind: "info", icon: "gift", title: "Benefits enrolment opens Sep 1", titleAr: "التسجيل في المزايا يبدأ 1 سبتمبر", body: "Review and update your benefit selections for 2027.", bodyAr: "راجع وحدّث اختيارات مزاياك لعام 2027.", time: "1 day ago", timeAr: "قبل يوم" },
  { id: "n4", kind: "success", icon: "calendar-check", title: "Leave request approved", titleAr: "تمت الموافقة على طلب الإجازة", body: "Your Sep 14–18 annual leave was approved.", bodyAr: "تمت الموافقة على إجازتك السنوية 14–18 سبتمبر.", time: "2 days ago", timeAr: "قبل يومين" },
]
