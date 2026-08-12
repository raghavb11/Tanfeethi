export type CategoryTone = "primary" | "emerald" | "blue" | "amber" | "violet" | "cyan"

export const catalog: {
  id: string
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  tone: CategoryTone
  open: number
  popular?: boolean
}[] = [
  {
    id: "s1",
    name: "IT & Access",
    nameAr: "تقنية المعلومات والصلاحيات",
    description: "Devices, SSO, privileged access, software.",
    descriptionAr: "الأجهزة، الدخول الموحد، الصلاحيات، البرامج.",
    tone: "blue",
    open: 4,
    popular: true,
  },
  {
    id: "s2",
    name: "HR & Payroll",
    nameAr: "الموارد البشرية والرواتب",
    description: "Benefits, payroll cases, transfers, HRIS.",
    descriptionAr: "المزايا، الرواتب، النقل، نظام الموارد البشرية.",
    tone: "amber",
    open: 2,
  },
  {
    id: "s3",
    name: "Facilities",
    nameAr: "المرافق",
    description: "Moves, badges, reservations, incidents.",
    descriptionAr: "الانتقالات، البطاقات، الحجوزات، الحوادث.",
    tone: "emerald",
    open: 1,
  },
  {
    id: "s4",
    name: "Finance",
    nameAr: "المالية",
    description: "Purchase requests, invoices, expense triage.",
    descriptionAr: "طلبات الشراء، الفواتير، فرز المصاريف.",
    tone: "violet",
    open: 3,
  },
]

export const popularRequests: { en: string; ar: string }[] = [
  { en: "Reset my password", ar: "إعادة تعيين كلمة المرور" },
  { en: "Order a new laptop", ar: "طلب لابتوب جديد" },
  { en: "Book a meeting room", ar: "حجز قاعة اجتماع" },
  { en: "Submit expense report", ar: "تقديم تقرير مصاريف" },
  { en: "Request VPN access", ar: "طلب وصول VPN" },
]

export type RequestStage = "submitted" | "triage" | "in-progress" | "review" | "closed"
export type SlaTone = "ok" | "warn" | "critical"

export const requestTracker: {
  id: string
  title: string
  titleAr: string
  category: string
  categoryAr: string
  ownerInitials: string
  owner: string
  ownerAr: string
  stage: RequestStage
  stageLabel: string
  stageLabelAr: string
  slaTone: SlaTone
  sla: string
  slaAr: string
  progress: number
}[] = [
  {
    id: "REQ-10412",
    title: "New laptop · M3 Pro",
    titleAr: "لابتوب جديد · M3 Pro",
    category: "IT & Access",
    categoryAr: "تقنية المعلومات",
    ownerInitials: "MC",
    owner: "M. Chen",
    ownerAr: "مايا تشن",
    stage: "in-progress",
    stageLabel: "With IT",
    stageLabelAr: "لدى تقنية المعلومات",
    slaTone: "ok",
    sla: "On track · 2 days left",
    slaAr: "في الموعد · بقي يومان",
    progress: 60,
  },
  {
    id: "REQ-10388",
    title: "Badge renewal · Building C",
    titleAr: "تجديد البطاقة · المبنى C",
    category: "Facilities",
    categoryAr: "المرافق",
    ownerInitials: "AS",
    owner: "A. Stone",
    ownerAr: "أحمد ستون",
    stage: "review",
    stageLabel: "Waiting on you",
    stageLabelAr: "بانتظار ردّك",
    slaTone: "warn",
    sla: "Due today",
    slaAr: "موعدها اليوم",
    progress: 85,
  },
  {
    id: "REQ-10371",
    title: "VPN split-tunnel exception",
    titleAr: "استثناء النفق المقسّم لـ VPN",
    category: "IT & Access",
    categoryAr: "تقنية المعلومات",
    ownerInitials: "SP",
    owner: "S. Park",
    ownerAr: "سارة بارك",
    stage: "closed",
    stageLabel: "Closed",
    stageLabelAr: "مغلق",
    slaTone: "ok",
    sla: "Met",
    slaAr: "تم",
    progress: 100,
  },
]

export const assets: {
  id: string
  name: string
  nameAr: string
  renewal: string
  renewalAr: string
  owner: string
  ownerAr: string
  icon: "laptop" | "phone" | "key"
}[] = [
  {
    id: "AS-883",
    name: "MacBook Pro 16\"",
    nameAr: "ماك بوك برو 16",
    renewal: "Aug 2027",
    renewalAr: "أغسطس 2027",
    owner: "Assigned",
    ownerAr: "مُسند",
    icon: "laptop",
  },
  {
    id: "AS-902",
    name: "iPhone 15 Pro",
    nameAr: "آيفون 15 برو",
    renewal: "Oct 2026",
    renewalAr: "أكتوبر 2026",
    owner: "Assigned",
    ownerAr: "مُسند",
    icon: "phone",
  },
  {
    id: "AS-771",
    name: "YubiKey · Tier 2",
    nameAr: "يوبي كي · المستوى الثاني",
    renewal: "Jul 2025",
    renewalAr: "يوليو 2025",
    owner: "Replace scheduled",
    ownerAr: "مجدول للاستبدال",
    icon: "key",
  },
]

export const knowledgeBase: { en: string; ar: string }[] = [
  { en: "Setting up SSO on a new device", ar: "إعداد الدخول الموحد على جهاز جديد" },
  { en: "Expense policy · 2026", ar: "سياسة المصاريف · 2026" },
  { en: "Visitor badge process", ar: "إجراءات بطاقة الزائر" },
]

export const serviceKpis = {
  open: 10,
  resolvedThisWeek: 23,
  avgResponseHours: 1.4,
  slaHitPct: 96,
}
