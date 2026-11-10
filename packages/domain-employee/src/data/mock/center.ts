/** Data for the Employee Center dashboard. Demo-only fixtures — a real build
 *  wires these to the HR / attendance / payroll systems. */

// ─── 1–6 · identity ──────────────────────────────────────────────────────────
export const emp = {
  name: "Fawaz Al-Ghailan",
  nameAr: "فواز الغيلان",
  initials: "FA",
  empId: "TF-05317",
  title: "UX Designer",
  titleAr: "مصمم تجربة المستخدم",
  department: "Information Technology",
  departmentAr: "تقنية المعلومات",
  sector: "Technology Solutions",
  sectorAr: "الحلول التقنية",
  manager: "Amani Al-Harthi",
  managerAr: "أماني الحارثي",
  managerTitle: "Head of Digital Experience",
  managerTitleAr: "رئيسة التجربة الرقمية",
  managerInitials: "AH",
  location: "ALTANFEETHI Head Office",
  locationAr: "المقر الرئيسي للتنفيذي",
  city: "Riyadh",
  cityAr: "الرياض",
  workMode: "Hybrid",
  workModeAr: "هجين",
  email: "Falghilan@altanfeethi.com.sa",
  mobile: "0550214873",
  grade: "Grade 11",
  gradeAr: "الدرجة 11",
  joined: "Joined Feb 2022",
  joinedAr: "انضم فبراير 2022",
  /** Leads a small design team, so the approvals queue applies. */
  isManager: true,
}

// ─── 7–9 · today's attendance ────────────────────────────────────────────────
export type AttStatus = "present" | "remote" | "leave" | "absent"
export const today = {
  status: "present" as AttStatus,
  dayName: "Tuesday",
  dayNameAr: "الثلاثاء",
  dateLabel: "April 28",
  dateLabelAr: "28 أبريل",
  checkIn: "08:00",
  checkOut: null as string | null,
  targetHours: 8,
  workedMinutes: 263,
  location: "Riyadh HQ",
  locationAr: "مقر الرياض",
}

// ─── 18 · attendance summary (this month) ────────────────────────────────────
export type DayStatus = "complete" | "current" | "upcoming" | "leave" | "absent"
export const attendanceSummary = {
  monthLabel: "April 2026",
  monthLabelAr: "أبريل 2026",
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
    { id: "up1", type: "Annual leave", typeAr: "إجازة سنوية", range: "Sep 14 – 18", rangeAr: "14 – 18 سبتمبر", days: 5, status: "Approved", statusAr: "معتمدة" },
  ],
}

// ─── 12 · my pending requests (own submissions awaiting action) ──────────────
export type ReqKind = "leave" | "expense" | "letter" | "document"
export const myRequests: { id: string; kind: ReqKind; title: string; titleAr: string; detail: string; detailAr: string; submitted: string; submittedAr: string; status: "Pending" | "In review"; statusAr: string }[] = [
  { id: "r1", kind: "leave", title: "Annual leave", titleAr: "إجازة سنوية", detail: "May 12 – 16 · 5 days", detailAr: "12 – 16 مايو · 5 أيام", submitted: "2 days ago", submittedAr: "قبل يومين", status: "Pending", statusAr: "قيد المراجعة" },
  { id: "r2", kind: "expense", title: "Travel expense claim", titleAr: "مطالبة مصروفات سفر", detail: "SAR 2,480 · KAFD visit", detailAr: "٢٬٤٨٠ ر.س · زيارة المركز المالي", submitted: "4 days ago", submittedAr: "قبل ٤ أيام", status: "In review", statusAr: "قيد التدقيق" },
  { id: "r3", kind: "letter", title: "Salary certificate", titleAr: "شهادة راتب", detail: "For bank · Arabic + English", detailAr: "للبنك · عربي + إنجليزي", submitted: "Today", submittedAr: "اليوم", status: "Pending", statusAr: "قيد المراجعة" },
]

// ─── 13 · pending approvals (manager view) ───────────────────────────────────
export const approvals: { id: string; who: string; whoAr: string; initials: string; kind: "leave" | "expense" | "overtime"; title: string; titleAr: string; detail: string; detailAr: string; submitted: string; submittedAr: string }[] = [
  { id: "a1", who: "Lina Al-Harbi", whoAr: "لينا الحربي", initials: "LH", kind: "leave", title: "Annual leave", titleAr: "إجازة سنوية", detail: "May 24 – 28 · 5 days", detailAr: "24 – 28 مايو · 5 أيام", submitted: "1 day ago", submittedAr: "قبل يوم" },
  { id: "a2", who: "Saad Al-Yami", whoAr: "سعد اليامي", initials: "SY", kind: "expense", title: "Expense claim", titleAr: "مطالبة مصروفات", detail: "SAR 1,150 · User-research incentives", detailAr: "1,150 ر.س · حوافز أبحاث المستخدمين", submitted: "2 days ago", submittedAr: "قبل يومين" },
  { id: "a3", who: "Tala Nasser", whoAr: "تالا ناصر", initials: "TN", kind: "overtime", title: "Overtime request", titleAr: "طلب عمل إضافي", detail: "6 hrs · Apr 25 (weekend)", detailAr: "6 ساعات · 25 أبريل (نهاية الأسبوع)", submitted: "3 days ago", submittedAr: "قبل 3 أيام" },
]

// ─── 14 · latest payslip ─────────────────────────────────────────────────────
export const payslip = {
  month: "March 2026",
  monthAr: "مارس 2026",
  payDate: "Mar 27, 2026",
  payDateAr: "27 مارس 2026",
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
  { id: "n2", kind: "success", icon: "wallet", title: "March payslip available", titleAr: "قسيمة راتب مارس متاحة", body: "Your salary of SAR 18,400 was paid on Mar 27.", bodyAr: "تم دفع راتبك 18,400 ر.س في 27 مارس.", time: "Mar 27", timeAr: "27 مارس", cta: "View", ctaAr: "عرض" },
  { id: "n3", kind: "info", icon: "gift", title: "Benefits enrolment opens May 1", titleAr: "التسجيل في المزايا يبدأ 1 مايو", body: "Review and update your benefit selections for 2027.", bodyAr: "راجع وحدّث اختيارات مزاياك لعام 2027.", time: "1 day ago", timeAr: "قبل يوم" },
  { id: "n4", kind: "success", icon: "calendar-check", title: "Leave request approved", titleAr: "تمت الموافقة على طلب الإجازة", body: "Your Sep 14–18 annual leave was approved.", bodyAr: "تمت الموافقة على إجازتك السنوية 14–18 سبتمبر.", time: "2 days ago", timeAr: "قبل يومين" },
]

// ─── 19 · digital business card ──────────────────────────────────────────────
/** The digital employee / business card. Scope is deliberately narrow — view,
 *  share, and show for identification. No access control, no authorisation:
 *  door access and printer release are out of scope (SOW V4). */
export const businessCard = {
  mobile: "0550214873",
  extension: "5317",
  office: "ALTANFEETHI HQ · King Khalid International Airport, Riyadh",
  officeAr: "المقر الرئيسي · مطار الملك خالد الدولي، الرياض",
  website: "altanfeethi.com.sa",
  tagline: "The difference of every journey.",
  taglineAr: "الفرق في كل رحلة.",
  /** What a scanner resolves to — the employee's public profile card. */
  qrPayload: "https://wajha.altanfeethi.com.sa/c/TF-05317",
  issued: "Issued 6 Feb 2022",
  issuedAr: "صدرت 6 فبراير 2022",
  validUntil: "Valid to 31 Dec 2027",
  validUntilAr: "سارية حتى 31 ديسمبر 2027",
}

/** Share / view history for the card. In the Mendix build this is emitted to
 *  the shared Audit module rather than held here. */
export type CardEvent = {
  id: string
  kind: "shared" | "viewed" | "saved"
  detail: string
  detailAr: string
  time: string
  timeAr: string
}
export const cardEvents: CardEvent[] = [
  { id: "c1", kind: "shared", detail: "Shared by link with Noura Al-Qahtani", detailAr: "تمت المشاركة عبر رابط مع نورة القحطاني", time: "Today · 09:14", timeAr: "اليوم · 09:14" },
  { id: "c2", kind: "viewed", detail: "Shown for identification at HQ reception", detailAr: "عُرضت للتعريف في استقبال المقر", time: "Yesterday · 08:36", timeAr: "أمس · 08:36" },
  { id: "c3", kind: "saved", detail: "Saved as a contact by Saud Al-Dosari", detailAr: "تم حفظها كجهة اتصال بواسطة سعود الدوسري", time: "26 Apr", timeAr: "26 أبريل" },
]
