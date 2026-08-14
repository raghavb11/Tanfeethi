/** Benefits, allowances and dependant cover for the Benefits page.
 *  Demo-only fixtures — a real build reads these from the HR / payroll system. */

export const CURRENCY = { code: "SAR", ar: "ر.س" }
export const sar = (n: number, isAr: boolean) =>
  isAr ? `${n.toLocaleString("en-US")} ${CURRENCY.ar}` : `${CURRENCY.code} ${n.toLocaleString("en-US")}`

// ── enrolment window ─────────────────────────────────────────────────────────
export const enrolment = {
  /** The 2027 window is not open yet — the page shows a countdown, not a form. */
  status: "upcoming" as "open" | "upcoming" | "closed",
  year: 2027,
  opens: "Sep 1, 2026", opensAr: "١ سبتمبر ٢٠٢٦",
  closes: "Sep 30, 2026", closesAr: "٣٠ سبتمبر ٢٠٢٦",
  daysUntil: 12,
  note: "You'll be able to change your medical class, add dependants and opt into voluntary cover.",
  noteAr: "ستتمكن من تغيير فئة التأمين الطبي وإضافة المعالين والاشتراك في التغطية الاختيارية.",
}

// ── monthly allowances ───────────────────────────────────────────────────────
export type Allowance = { id: string; label: string; labelAr: string; amount: number; icon: string; note?: string; noteAr?: string }

export const allowances: Allowance[] = [
  { id: "housing", label: "Housing", labelAr: "بدل سكن", amount: 4500, icon: "home", note: "25% of basic salary", noteAr: "٢٥٪ من الراتب الأساسي" },
  { id: "transport", label: "Transport", labelAr: "بدل نقل", amount: 1200, icon: "car" },
  { id: "education", label: "Education", labelAr: "بدل تعليم", amount: 1500, icon: "school", note: "Up to 2 children", noteAr: "حتى طفلين" },
  { id: "phone", label: "Communication", labelAr: "بدل اتصالات", amount: 300, icon: "phone" },
]
export const allowanceTotal = allowances.reduce((s, a) => s + a.amount, 0)

// ── total reward ─────────────────────────────────────────────────────────────
/** What the package is worth over a year, cash and non-cash. The employer-paid
 *  components are what a benefits page exists to make visible — they never show
 *  up on a payslip. */
export const reward = {
  components: [
    { id: "base", label: "Base salary", labelAr: "الراتب الأساسي", amount: 180000, note: "15,000 × 12", noteAr: "١٥٬٠٠٠ × ١٢" },
    { id: "allowances", label: "Allowances", labelAr: "البدلات", amount: 90000, note: "7,500 × 12", noteAr: "٧٬٥٠٠ × ١٢" },
    { id: "bonus", label: "Performance bonus", labelAr: "مكافأة الأداء", amount: 22500, note: "2025 cycle, variable", noteAr: "دورة ٢٠٢٥، متغيرة" },
    { id: "benefits", label: "Employer-paid benefits", labelAr: "مزايا يتحملها صاحب العمل", amount: 74795, note: "GOSI, medical, life, tickets, end-of-service", noteAr: "التأمينات، الطبي، الحياة، التذاكر، نهاية الخدمة" },
  ],
  /** The employer-paid line above, itemised. */
  employerPaid: [
    { label: "GOSI employer share", labelAr: "حصة صاحب العمل بالتأمينات", amount: 27495 },
    { label: "Medical premium", labelAr: "قسط التأمين الطبي", amount: 18000 },
    { label: "End-of-service accrual", labelAr: "استحقاق نهاية الخدمة", amount: 19500 },
    { label: "Annual air tickets", labelAr: "تذاكر السفر السنوية", amount: 7200 },
    { label: "Life insurance premium", labelAr: "قسط التأمين على الحياة", amount: 2600 },
  ],
}
export const rewardTotal = reward.components.reduce((s, c) => s + c.amount, 0)

// ── benefit plans ────────────────────────────────────────────────────────────
/** Claimable balance for benefits that run down over the year. */
export type Utilisation = { used: number; total: number; unit: string; unitAr: string }

export type PlanStatus = "active" | "eligible" | "not-enrolled"
export type BenefitPlan = {
  id: string
  name: string; nameAr: string
  category: "health" | "protection" | "travel" | "wellbeing" | "financial"
  icon: string
  status: PlanStatus
  summary: string; summaryAr: string
  provider?: string; providerAr?: string
  policyNo?: string
  /** Label/value rows shown when the plan is expanded. */
  details: { label: string; labelAr: string; value: string; valueAr: string }[]
  /** Only on benefits you draw down; drives the progress bar. */
  usage?: Utilisation
}

export const PLANS: BenefitPlan[] = [
  {
    id: "medical", name: "Medical insurance", nameAr: "التأمين الطبي", category: "health", icon: "heart", status: "active",
    summary: "Class A · family cover", summaryAr: "فئة أ · تغطية عائلية",
    provider: "Bupa Arabia", providerAr: "بوبا العربية", policyNo: "BA-4471-08822",
    details: [
      { label: "Class", labelAr: "الفئة", value: "A", valueAr: "أ" },
      { label: "Annual limit", labelAr: "الحد السنوي", value: "SAR 500,000", valueAr: "٥٠٠٬٠٠٠ ر.س" },
      { label: "Covered", labelAr: "المشمولون", value: "You + 3 dependants", valueAr: "أنت + ٣ معالين" },
      { label: "Dental & optical", labelAr: "الأسنان والبصريات", value: "Included", valueAr: "مشمول" },
      { label: "Renews", labelAr: "التجديد", value: "Jan 1, 2027", valueAr: "١ يناير ٢٠٢٧" },
    ],
  },
  {
    id: "life", name: "Life insurance", nameAr: "التأمين على الحياة", category: "protection", icon: "shield", status: "active",
    summary: "24× basic salary", summaryAr: "٢٤× الراتب الأساسي",
    provider: "Tawuniya", providerAr: "التعاونية", policyNo: "TW-99-201455",
    details: [
      { label: "Cover", labelAr: "التغطية", value: "SAR 441,600", valueAr: "٤٤١٬٦٠٠ ر.س" },
      { label: "Accidental death", labelAr: "الوفاة العرضية", value: "Doubled", valueAr: "مضاعف" },
      { label: "Beneficiary", labelAr: "المستفيد", value: "On file", valueAr: "مسجّل" },
    ],
  },
  {
    id: "tickets", name: "Annual air tickets", nameAr: "تذاكر السفر السنوية", category: "travel", icon: "plane", status: "active",
    summary: "Family · economy, once a year", summaryAr: "للعائلة · اقتصادية، مرة سنويًا",
    details: [
      { label: "Entitlement", labelAr: "الاستحقاق", value: "4 tickets", valueAr: "٤ تذاكر" },
      { label: "Used this year", labelAr: "المستخدم هذا العام", value: "0", valueAr: "٠" },
      { label: "Route", labelAr: "الوجهة", value: "Point of origin", valueAr: "بلد المنشأ" },
    ],
    usage: { used: 0, total: 4, unit: "tickets", unitAr: "تذاكر" },
  },
  {
    id: "gosi", name: "GOSI · social insurance", nameAr: "التأمينات الاجتماعية", category: "financial", icon: "landmark", status: "active",
    summary: "Employer 11.75% · employee 9.75%", summaryAr: "صاحب العمل ١١٫٧٥٪ · الموظف ٩٫٧٥٪",
    details: [
      { label: "Registered since", labelAr: "مسجّل منذ", value: "Mar 2019", valueAr: "مارس ٢٠١٩" },
      { label: "Monthly contribution", labelAr: "الاشتراك الشهري", value: "SAR 1,794", valueAr: "١٬٧٩٤ ر.س" },
    ],
  },
  {
    id: "eos", name: "End-of-service award", nameAr: "مكافأة نهاية الخدمة", category: "financial", icon: "wallet", status: "active",
    summary: "Accrued per Saudi Labour Law", summaryAr: "تُحتسب وفق نظام العمل السعودي",
    details: [
      { label: "Service", labelAr: "مدة الخدمة", value: "7 years 5 months", valueAr: "٧ سنوات و٥ أشهر" },
      { label: "Accrued to date", labelAr: "المستحق حتى تاريخه", value: "SAR 96,600", valueAr: "٩٦٬٦٠٠ ر.س" },
    ],
  },
  {
    id: "wellness", name: "Wellness allowance", nameAr: "بدل العافية", category: "wellbeing", icon: "dumbbell", status: "eligible",
    summary: "SAR 3,000 a year — gym, sports, fitness", summaryAr: "٣٬٠٠٠ ر.س سنويًا — النوادي والرياضة",
    details: [
      { label: "Claimed", labelAr: "المطالب به", value: "SAR 0 of 3,000", valueAr: "٠ من ٣٬٠٠٠ ر.س" },
      { label: "Claim by", labelAr: "آخر موعد", value: "Dec 31, 2026", valueAr: "٣١ ديسمبر ٢٠٢٦" },
    ],
    usage: { used: 0, total: 3000, unit: "SAR", unitAr: "ر.س" },
  },
  {
    id: "eap", name: "Employee assistance", nameAr: "برنامج مساندة الموظفين", category: "wellbeing", icon: "life-buoy", status: "active",
    summary: "Confidential counselling, 24/7", summaryAr: "استشارات سرية على مدار الساعة",
    details: [
      { label: "Sessions", labelAr: "الجلسات", value: "2 of 8 used, free", valueAr: "٢ من ٨ مستخدمة، مجانًا" },
      { label: "Covers", labelAr: "يشمل", value: "You and household", valueAr: "أنت وأفراد أسرتك" },
    ],
    usage: { used: 2, total: 8, unit: "sessions", unitAr: "جلسات" },
  },
  {
    id: "voluntary", name: "Voluntary critical illness", nameAr: "تأمين الأمراض الحرجة الاختياري", category: "protection", icon: "shield", status: "not-enrolled",
    summary: "Opt in during enrolment — from SAR 85/month", summaryAr: "الاشتراك خلال فترة التسجيل — من ٨٥ ر.س شهريًا",
    details: [
      { label: "Cover options", labelAr: "خيارات التغطية", value: "SAR 100k – 500k", valueAr: "١٠٠ ألف – ٥٠٠ ألف ر.س" },
      { label: "Opens", labelAr: "يبدأ", value: "Sep 1, 2026", valueAr: "١ سبتمبر ٢٠٢٦" },
    ],
  },
]

// ── dependants ───────────────────────────────────────────────────────────────
export type Dependant = {
  id: string
  name: string; nameAr: string
  relation: string; relationAr: string
  age: number
  initials: string
  medical: boolean
  tickets: boolean
}

export const DEPENDANTS: Dependant[] = [
  { id: "d1", name: "Amal Al-Saadi", nameAr: "أمل السعدي", relation: "Spouse", relationAr: "الزوجة", age: 38, initials: "AS", medical: true, tickets: true },
  { id: "d2", name: "Rakan Al-Saadi", nameAr: "راكان السعدي", relation: "Son", relationAr: "ابن", age: 11, initials: "RS", medical: true, tickets: true },
  { id: "d3", name: "Jood Al-Saadi", nameAr: "جود السعدي", relation: "Daughter", relationAr: "ابنة", age: 7, initials: "JS", medical: true, tickets: true },
]

// ── perks ────────────────────────────────────────────────────────────────────
export type Perk = { id: string; name: string; nameAr: string; category: string; categoryAr: string; offer: string; offerAr: string; icon: string }

export const PERKS: Perk[] = [
  { id: "k1", name: "Airport lounge access", nameAr: "دخول صالات المطار", category: "Travel", categoryAr: "السفر", offer: "Unlimited, all ALTANFEETHI lounges", offerAr: "غير محدود، جميع صالات التنفيذي", icon: "sofa" },
  { id: "k2", name: "Saudia", nameAr: "السعودية", category: "Travel", categoryAr: "السفر", offer: "15% off published fares", offerAr: "خصم ١٥٪ على الأسعار المعلنة", icon: "plane" },
  { id: "k3", name: "Fitness Time", nameAr: "وقت اللياقة", category: "Wellbeing", categoryAr: "العافية", offer: "30% off annual membership", offerAr: "خصم ٣٠٪ على العضوية السنوية", icon: "dumbbell" },
  { id: "k4", name: "Jarir Bookstore", nameAr: "مكتبة جرير", category: "Retail", categoryAr: "التجزئة", offer: "10% off electronics", offerAr: "خصم ١٠٪ على الإلكترونيات", icon: "shopping-bag" },
  { id: "k5", name: "Al Rajhi Bank", nameAr: "مصرف الراجحي", category: "Financial", categoryAr: "مالية", offer: "Preferential salary-transfer rates", offerAr: "أسعار تفضيلية لتحويل الراتب", icon: "landmark" },
  { id: "k6", name: "Careem", nameAr: "كريم", category: "Travel", categoryAr: "السفر", offer: "SAR 25 off first 4 rides monthly", offerAr: "خصم ٢٥ ر.س على أول ٤ رحلات شهريًا", icon: "car" },
]

// ── documents ────────────────────────────────────────────────────────────────
export const BENEFIT_DOCS = [
  { id: "doc1", name: "Medical insurance card", nameAr: "بطاقة التأمين الطبي", meta: "PDF · 240 KB", metaAr: "PDF · ٢٤٠ ك.ب" },
  { id: "doc2", name: "Benefits handbook 2026", nameAr: "دليل المزايا ٢٠٢٦", meta: "PDF · 3.1 MB", metaAr: "PDF · ٣٫١ م.ب" },
  { id: "doc3", name: "Bupa network hospitals", nameAr: "شبكة مستشفيات بوبا", meta: "PDF · 1.4 MB", metaAr: "PDF · ١٫٤ م.ب" },
]
