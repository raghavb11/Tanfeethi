import * as React from "react"

/** Services module mock data — WIJHA v2 (Figma "Final Design 1.0", Services).
 *  Everything a services screen shows lives here, not inline in the pages. */

// ── tones ────────────────────────────────────────────────────────────────────
/** Category colour, as drawn on the request chips (Figma). */
export type CategoryTone = "neutral" | "success" | "violet" | "gold" | "rose" | "error"

export type CategoryIcon = "laptop" | "hr" | "finance" | "facilities" | "hospitality" | "violation"

// ── service categories (Services home → تصفّح الخدمات) ──────────────────────
export type ServiceCategory = {
  id: string
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  icon: CategoryIcon
  tone: CategoryTone
  /** Open requests the employee has in this category (0 hides the count). */
  open: number
  /** Where "Open" goes. */
  to: string
}

export const categories: ServiceCategory[] = [
  {
    id: "it", name: "IT & Permissions", nameAr: "تقنية المعلومات والصلاحيات",
    description: "Devices, single sign-on, permissions, software.",
    descriptionAr: "الأجهزة، الدخول الموحد، الصلاحيات، البرامج.",
    icon: "laptop", tone: "neutral", open: 6, to: "/services/catalog/it",
  },
  {
    id: "hr", name: "HR & Payroll", nameAr: "الموارد البشرية والرواتب",
    description: "Benefits, payroll, transfers, HR system.",
    descriptionAr: "المزايا، الرواتب، النقل، نظام الموارد البشرية.",
    icon: "hr", tone: "gold", open: 2, to: "/services/catalog/hr",
  },
  {
    id: "finance", name: "Finance", nameAr: "المالية",
    description: "Purchase requests, invoices, expense triage.",
    descriptionAr: "طلبات الشراء، الفواتير، فرز المصاريف.",
    icon: "finance", tone: "success", open: 1, to: "/services/catalog/finance",
  },
  {
    id: "facilities", name: "Facilities", nameAr: "المرافق",
    description: "Moves, badges, bookings, incidents.",
    descriptionAr: "الانتقالات، البطاقات، الحجوزات، الحوادث.",
    icon: "facilities", tone: "rose", open: 1, to: "/services/catalog/facilities",
  },
  {
    id: "hospitality", name: "Hospitality", nameAr: "الضيافة",
    description: "Tea, coffee and water served to your office or meeting room.",
    descriptionAr: "شاي وقهوة ومياه تُقدَّم إلى مكتبك أو قاعة الاجتماعات",
    icon: "hospitality", tone: "violet", open: 0, to: "/services/catalog/hospitality",
  },
  {
    id: "violations", name: "Violation reporting system", nameAr: "نظام الإبلاغ عن المخالفات",
    description: "Report audit, HR, safety and quality violations.",
    descriptionAr: "للإبلاغ عن مخالفات التدقيق، الموارد البشرية و السلامة و الجودة",
    icon: "violation", tone: "error", open: 0, to: "/services/violations",
  },
]

export const categoryById = (id: string) => categories.find((c) => c.id === id)

// ── request KPIs ─────────────────────────────────────────────────────────────
export const serviceKpis = { open: 10, inProgress: 4 }

/** Per-catalog KPIs. The design copied the IT numbers onto Hospitality;
 *  each catalog now carries its own. */
export const catalogKpis: Record<string, { open: number; inProgress: number; avgMinutes: number }> = {
  it: { open: 6, inProgress: 2, avgMinutes: 100 },
  hospitality: { open: 3, inProgress: 1, avgMinutes: 12 },
  hr: { open: 2, inProgress: 1, avgMinutes: 1440 },
  finance: { open: 1, inProgress: 1, avgMinutes: 380 },
  facilities: { open: 1, inProgress: 0, avgMinutes: 245 },
}

/** "1 hour 40 min" / "ساعة و 40 دقيقة". */
export function formatDuration(min: number, isAr: boolean) {
  const d = Math.floor(min / 1440)
  const h = Math.floor((min % 1440) / 60)
  const m = min % 60
  if (isAr) {
    const parts: string[] = []
    if (d) parts.push(d === 1 ? "يوم" : d === 2 ? "يومان" : `${d} أيام`)
    if (h) parts.push(h === 1 ? "ساعة" : h === 2 ? "ساعتان" : `${h} ساعات`)
    if (m) parts.push(`${m} دقيقة`)
    return parts.join(" و ") || "—"
  }
  const parts: string[] = []
  if (d) parts.push(`${d} day${d === 1 ? "" : "s"}`)
  if (h) parts.push(`${h} hour${h === 1 ? "" : "s"}`)
  if (m) parts.push(`${m} min`)
  return parts.join(" ") || "—"
}

// ── catalog services (level 1) ───────────────────────────────────────────────
export type ServiceIcon =
  | "laptop" | "fault" | "development" | "change" | "health" | "knowledge"
  | "menu" | "waiter" | "hr" | "finance" | "facilities"

export type CatalogService = {
  id: string
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  icon: ServiceIcon
  /** "open" drills further; "request" opens a form. */
  action: "open" | "request"
  to: string
}

export const catalogServices: Record<string, CatalogService[]> = {
  it: [
    { id: "report-fault", name: "Report a fault", nameAr: "الإبلاغ عن عطل",
      description: "Something not working as it should? Log a report and we'll follow up with you.",
      descriptionAr: "شيء لا يعمل كما ينبغي؟ سجّل بلاغًا وسنتابعه معك.",
      icon: "fault", action: "open", to: "/services/catalog/it/report-fault" },
    { id: "technical", name: "Request a technical service", nameAr: "طلب خدمة تقنية",
      description: "Browse the service guide and request what you need: a device, a permission or software.",
      descriptionAr: "تصفّح دليل الخدمات واطلب ما تحتاجه: جهاز، صلاحية، أو برنامج.",
      icon: "laptop", action: "open", to: "/services/catalog/it/technical" },
    { id: "development", name: "Request development or a new service", nameAr: "طلب تطوير أو خدمة جديدة",
      description: "Suggest an improvement to an existing service, or a service that isn't available yet.",
      descriptionAr: "اقترح تحسينًا على خدمة حالية أو خدمة غير متوفرة بعد.",
      icon: "development", action: "open", to: "/services/request/development" },
    { id: "change", name: "Change request", nameAr: "طلب تغيير",
      description: "A change to an existing system or service, with an impact review before it's made.",
      descriptionAr: "تعديل على نظام أو خدمة قائمة، مع مراجعة الأثر قبل التنفيذ.",
      icon: "change", action: "open", to: "/services/request/change" },
    { id: "health-report", name: "Systems health report", nameAr: "تقرير سلامة الأنظمة",
      description: "Ask for a periodic check of the state of systems and technical services.",
      descriptionAr: "اطلب فحصًا دوريًا لحالة الأنظمة والخدمات التقنية.",
      icon: "health", action: "open", to: "/services/request/health-report" },
    { id: "knowledge", name: "Knowledge base", nameAr: "قاعدة المعرفة",
      description: "Search articles and ready-made solutions.",
      descriptionAr: "ابحث في المقالات والحلول الجاهزة.",
      icon: "knowledge", action: "open", to: "/documents" },
  ],
  hospitality: [
    { id: "menu", name: "Order menu", nameAr: "قائمة الطلبات",
      description: "Tea, coffee and water served to your office or meeting room.",
      descriptionAr: "شاي وقهوة ومياه تُقدَّم إلى مكتبك أو قاعة الاجتماعات",
      icon: "menu", action: "open", to: "/cafeteria" },
    { id: "waiter", name: "Request a waiter", nameAr: "طلب النادل",
      description: "To customise your order.", descriptionAr: "لتخصيص طلبك",
      icon: "waiter", action: "open", to: "/services/hospitality/waiter" },
  ],
  hr: [
    { id: "salary-cert", name: "Salary certificate", nameAr: "شهادة راتب",
      description: "A stamped certificate for a bank or an embassy.", descriptionAr: "شهادة مختومة للبنك أو السفارة.",
      icon: "hr", action: "request", to: "/services/request/salary-cert" },
    { id: "payroll-case", name: "Payroll enquiry", nameAr: "استفسار عن الراتب",
      description: "A question about a payslip, allowance or deduction.", descriptionAr: "سؤال عن قسيمة راتب أو بدل أو استقطاع.",
      icon: "finance", action: "request", to: "/services/request/payroll-case" },
  ],
  finance: [
    { id: "purchase", name: "Purchase request", nameAr: "طلب شراء",
      description: "Buy goods or services through procurement.", descriptionAr: "شراء سلع أو خدمات عبر المشتريات.",
      icon: "finance", action: "request", to: "/services/request/purchase" },
  ],
  facilities: [
    { id: "badge", name: "Badge renewal", nameAr: "تجديد البطاقة",
      description: "Renew or replace your building access card.", descriptionAr: "جدّد أو استبدل بطاقة دخول المبنى.",
      icon: "facilities", action: "request", to: "/services/request/badge" },
  ],
}

// ── IT → Request a technical service (level 2 groups + level 3 items) ───────
export type ServiceGroup = { id: string; name: string; nameAr: string; items: string[] }

export const technicalGroups: ServiceGroup[] = [
  { id: "account-email", name: "Account & email services", nameAr: "خدمات الحساب والبريد الإلكتروني", items: ["new-account", "mailbox"] },
  { id: "surveillance", name: "Security surveillance system", nameAr: "نظام المراقبة الأمنية", items: ["cctv-access"] },
  { id: "database", name: "Database", nameAr: "قاعدة بيانات", items: ["db-access"] },
  { id: "devices", name: "Device services", nameAr: "خدمات الأجهزة", items: ["devices", "printers"] },
  { id: "permissions", name: "Permissions management", nameAr: "إدارة الصلاحيات", items: ["app-permission"] },
  { id: "infosec", name: "Information security", nameAr: "أمن المعلومات", items: ["usb-exception"] },
  { id: "network", name: "Network services", nameAr: "خدمات الشبكة", items: ["vpn"] },
  { id: "software", name: "Software services", nameAr: "خدمات البرامج", items: ["software-install"] },
]

/** A requestable service and the fields its form asks for. */
export type Option = { en: string; ar: string }
export type FieldDef =
  | { key: string; kind: "employee"; label: string; labelAr: string }
  | { key: string; kind: "select"; label: string; labelAr: string; options: Option[] }
  | { key: string; kind: "text"; label: string; labelAr: string }

export type ServiceItem = { id: string; name: string; nameAr: string; fields: FieldDef[] }

const requester: FieldDef = { key: "requester", kind: "employee", label: "Requester", labelAr: "مقدم الطلب" }
const location: FieldDef = {
  key: "location", kind: "select", label: "Location", labelAr: "الموقع",
  options: [
    { en: "HQ · Level 14", ar: "المقر · الطابق 14" }, { en: "HQ · Level 13", ar: "المقر · الطابق 13" },
    { en: "HQ · Level 12", ar: "المقر · الطابق 12" }, { en: "Terminal 1", ar: "الصالة 1" },
    { en: "Terminal 2", ar: "الصالة 2" }, { en: "Mission Control Centre", ar: "مركز التحكّم بالمهام" },
  ],
}
const requestType = (options: Option[]): FieldDef =>
  ({ key: "type", kind: "select", label: "Request type", labelAr: "نوع الطلب", options })

export const serviceItems: ServiceItem[] = [
  { id: "printers", name: "Printer services", nameAr: "خدمات الطابعات", fields: [
    requester,
    requestType([{ en: "New printer", ar: "طابعة جديدة" }, { en: "Repair", ar: "إصلاح" }, { en: "Toner / supplies", ar: "حبر ومستلزمات" }, { en: "Move printer", ar: "نقل طابعة" }]),
    { key: "model", kind: "text", label: "Printer model", labelAr: "طراز الطابعة" },
    location,
  ] },
  { id: "devices", name: "Device services", nameAr: "خدمات الأجهزة", fields: [
    requester,
    requestType([{ en: "New laptop", ar: "لابتوب جديد" }, { en: "Monitor", ar: "شاشة" }, { en: "Phone", ar: "هاتف" }, { en: "Accessories", ar: "ملحقات" }]),
    { key: "model", kind: "text", label: "Preferred model", labelAr: "الطراز المفضل" },
    location,
  ] },
  { id: "new-account", name: "New account", nameAr: "حساب جديد", fields: [
    requester, requestType([{ en: "Employee", ar: "موظف" }, { en: "Contractor", ar: "متعاقد" }, { en: "Service account", ar: "حساب خدمة" }]),
    { key: "name", kind: "text", label: "Account holder", labelAr: "صاحب الحساب" },
  ] },
  { id: "mailbox", name: "Shared mailbox", nameAr: "صندوق بريد مشترك", fields: [
    requester, { key: "address", kind: "text", label: "Mailbox address", labelAr: "عنوان الصندوق" },
    requestType([{ en: "Create", ar: "إنشاء" }, { en: "Add members", ar: "إضافة أعضاء" }, { en: "Increase size", ar: "زيادة السعة" }]),
  ] },
  { id: "cctv-access", name: "Camera footage access", nameAr: "الوصول إلى تسجيلات الكاميرات", fields: [
    requester, location, { key: "reason", kind: "text", label: "Reason", labelAr: "السبب" },
  ] },
  { id: "db-access", name: "Database access", nameAr: "صلاحية قاعدة بيانات", fields: [
    requester, { key: "db", kind: "text", label: "Database", labelAr: "قاعدة البيانات" },
    requestType([{ en: "Read", ar: "قراءة" }, { en: "Read / write", ar: "قراءة وكتابة" }]),
  ] },
  { id: "app-permission", name: "Application permission", nameAr: "صلاحية تطبيق", fields: [
    requester, { key: "app", kind: "text", label: "Application", labelAr: "التطبيق" },
    requestType([{ en: "Grant", ar: "منح" }, { en: "Revoke", ar: "سحب" }, { en: "Change role", ar: "تغيير الدور" }]),
  ] },
  { id: "usb-exception", name: "USB storage exception", nameAr: "استثناء وحدات التخزين", fields: [
    requester, { key: "reason", kind: "text", label: "Business reason", labelAr: "مبرر العمل" },
  ] },
  { id: "vpn", name: "VPN access", nameAr: "الوصول عبر VPN", fields: [
    requester, requestType([{ en: "New access", ar: "وصول جديد" }, { en: "Extend", ar: "تمديد" }]),
  ] },
  { id: "software-install", name: "Software installation", nameAr: "تثبيت برنامج", fields: [
    requester, { key: "software", kind: "text", label: "Software", labelAr: "البرنامج" }, location,
  ] },
  // catalog-level services that open a form directly
  { id: "development", name: "Request development or a new service", nameAr: "طلب تطوير أو خدمة جديدة", fields: [
    requester, { key: "title", kind: "text", label: "Idea title", labelAr: "عنوان الفكرة" },
    requestType([{ en: "Improve an existing service", ar: "تحسين خدمة حالية" }, { en: "New service", ar: "خدمة جديدة" }]),
  ] },
  { id: "change", name: "Change request", nameAr: "طلب تغيير", fields: [
    requester, { key: "system", kind: "text", label: "System", labelAr: "النظام" },
    requestType([{ en: "Standard", ar: "اعتيادي" }, { en: "Urgent", ar: "عاجل" }]),
  ] },
  { id: "health-report", name: "Systems health report", nameAr: "تقرير سلامة الأنظمة", fields: [
    requester, { key: "system", kind: "text", label: "System", labelAr: "النظام" },
    requestType([{ en: "One-off", ar: "مرة واحدة" }, { en: "Monthly", ar: "شهري" }, { en: "Quarterly", ar: "ربع سنوي" }]),
  ] },
  { id: "salary-cert", name: "Salary certificate", nameAr: "شهادة راتب", fields: [
    requester, { key: "addressee", kind: "text", label: "Addressed to", labelAr: "موجهة إلى" },
    requestType([{ en: "Arabic", ar: "عربي" }, { en: "English", ar: "إنجليزي" }]),
  ] },
  { id: "payroll-case", name: "Payroll enquiry", nameAr: "استفسار عن الراتب", fields: [
    requester, { key: "subject", kind: "text", label: "Subject", labelAr: "الموضوع" },
  ] },
  { id: "purchase", name: "Purchase request", nameAr: "طلب شراء", fields: [
    requester, { key: "item", kind: "text", label: "What to buy", labelAr: "المطلوب شراؤه" },
    requestType([{ en: "Goods", ar: "سلع" }, { en: "Services", ar: "خدمات" }]),
  ] },
  { id: "badge", name: "Badge renewal", nameAr: "تجديد البطاقة", fields: [
    requester, requestType([{ en: "Renewal", ar: "تجديد" }, { en: "Lost card", ar: "بطاقة مفقودة" }, { en: "Damaged", ar: "تالفة" }]), location,
  ] },
]
export const serviceItemById = (id: string) => serviceItems.find((s) => s.id === id)

/** Employees the requester picker offers. */
export const employees: { id: string; name: string; nameAr: string; initials: string }[] = [
  { id: "e-ali", name: "Ali Youssef", nameAr: "علي يوسف", initials: "AY" },
  { id: "e-khalid", name: "Khalid Al-Saadi", nameAr: "خالد السعدي", initials: "KS" },
  { id: "e-saud", name: "Saud Al-Dosari", nameAr: "سعود الدوسري", initials: "SD" },
  { id: "e-noura", name: "Noura Al-Qahtani", nameAr: "نورة القحطاني", initials: "NQ" },
  { id: "e-huda", name: "Huda Al-Zahrani", nameAr: "هدى الزهراني", initials: "HZ" },
]

// ── IT → Report a fault ──────────────────────────────────────────────────────
export const faultOptions = {
  category: [
    { en: "Hardware", ar: "الأجهزة" }, { en: "Software", ar: "البرامج" },
    { en: "Network", ar: "الشبكة" }, { en: "Account & access", ar: "الحساب والصلاحيات" },
  ] as Option[],
  subCategory: {
    Hardware: [{ en: "Laptop", ar: "لابتوب" }, { en: "Monitor", ar: "شاشة" }, { en: "Printer", ar: "طابعة" }, { en: "Phone", ar: "هاتف" }],
    Software: [{ en: "Email", ar: "البريد الإلكتروني" }, { en: "Office apps", ar: "تطبيقات المكتب" }, { en: "Business system", ar: "نظام أعمال" }],
    Network: [{ en: "Wi-Fi", ar: "الشبكة اللاسلكية" }, { en: "VPN", ar: "VPN" }, { en: "Internet", ar: "الإنترنت" }],
    "Account & access": [{ en: "Password", ar: "كلمة المرور" }, { en: "Locked account", ar: "حساب مقفل" }, { en: "Permissions", ar: "الصلاحيات" }],
  } as Record<string, Option[]>,
  priority: [{ en: "Low", ar: "منخفضة" }, { en: "Medium", ar: "متوسطة" }, { en: "High", ar: "عالية" }, { en: "Critical", ar: "حرجة" }] as Option[],
  contact: [{ en: "Phone call", ar: "اتصال هاتفي" }, { en: "Email", ar: "البريد الإلكتروني" }, { en: "Teams chat", ar: "محادثة Teams" }, { en: "Desk visit", ar: "زيارة المكتب" }] as Option[],
}

// ── requests (Services home + history) ───────────────────────────────────────
export type ServiceRequest = {
  id: string
  categoryId: string
  title: string
  titleAr: string
  requester: string
  requesterAr: string
  date: string
  dateAr: string
  /** yyyy/mm/dd for the history table. */
  iso: string
  /** Index of the current step on the stepper (0-based). */
  step: number
  /** Hospitality orders run a 3-step flow ending in "Delivered". */
  flow: "standard" | "hospitality"
}

export const standardSteps: Option[] = [
  { en: "Sent", ar: "أُرسل" }, { en: "In progress", ar: "قيد التنفيذ" },
  { en: "Review", ar: "مراجعة" }, { en: "Closed", ar: "مُغلق" },
]
export const hospitalitySteps: Option[] = [
  { en: "Sent", ar: "أُرسل" }, { en: "In progress", ar: "قيد التنفيذ" }, { en: "Delivered", ar: "تم التوصيل" },
]
export const stepsFor = (r: ServiceRequest) => (r.flow === "hospitality" ? hospitalitySteps : standardSteps)
export const isComplete = (r: ServiceRequest) => r.step >= stepsFor(r).length - 1

/** Request numbers are unique (the design reused #REQ-10412 three times). */
export const activeRequests: ServiceRequest[] = [
  { id: "REQ-10412", categoryId: "it", title: "New laptop · M3 Pro", titleAr: "لابتوب جديد · M3 Pro",
    requester: "Saud Al-Dosari", requesterAr: "سعود الدوسري", date: "27 Aug", dateAr: "27 أغسطس", iso: "2026/08/27", step: 1, flow: "standard" },
  { id: "REQ-10431", categoryId: "finance", title: "National Day events", titleAr: "فعاليات يوم الوطني",
    requester: "Faisal Al-Harbi", requesterAr: "فيصل الحربي", date: "5 Aug", dateAr: "5 أغسطس", iso: "2026/08/05", step: 0, flow: "standard" },
  { id: "REQ-10489", categoryId: "hospitality", title: "Iced coffee", titleAr: "قهوة باردة",
    requester: "Fadi", requesterAr: "فادي", date: "1 Aug", dateAr: "1 أغسطس", iso: "2026/08/01", step: 2, flow: "hospitality" },
  { id: "REQ-10414", categoryId: "hr", title: "New employee training", titleAr: "تدريب الموظفين الجدد",
    requester: "Huda Al-Zahrani", requesterAr: "هدى الزهراني", date: "7 Aug", dateAr: "7 أغسطس", iso: "2026/08/07", step: 3, flow: "standard" },
  { id: "REQ-10398", categoryId: "facilities", title: "Badge renewal · Building C", titleAr: "تجديد البطاقة · المبنى C",
    requester: "Hind Al-Zahrani", requesterAr: "هند الزهراني", date: "1 Aug", dateAr: "1 أغسطس", iso: "2026/08/01", step: 3, flow: "standard" },
]

/** Submitted services log — the history table (newest first). */
export const requestHistory: ServiceRequest[] = [
  activeRequests[0],
  activeRequests[3],
  activeRequests[4],
  { id: "REQ-10377", categoryId: "it", title: "VPN access extension", titleAr: "تمديد الوصول عبر VPN",
    requester: "Saud Al-Dosari", requesterAr: "سعود الدوسري", date: "21 Jul", dateAr: "21 يوليو", iso: "2026/07/21", step: 3, flow: "standard" },
  { id: "REQ-10352", categoryId: "finance", title: "Conference travel advance", titleAr: "سلفة سفر لمؤتمر",
    requester: "Saud Al-Dosari", requesterAr: "سعود الدوسري", date: "9 Jul", dateAr: "9 يوليو", iso: "2026/07/09", step: 2, flow: "standard" },
]

/** Status label used by the history table. */
export function statusOf(r: ServiceRequest): Option & { tone: "progress" | "done" | "sent" } {
  const s = stepsFor(r)[r.step]
  if (isComplete(r)) return { ...s, tone: "done" }
  if (r.step === 0) return { ...s, tone: "sent" }
  return { ...s, tone: "progress" }
}

// ── assets (Services home → الأصول) ─────────────────────────────────────────
export const assets: { id: string; name: string; nameAr: string; date: string; dateAr: string }[] = [
  { id: "AS-883", name: "MacBook Pro 16\"", nameAr: "ماك بوك برو 16", date: "Aug 2027", dateAr: "أغسطس 2027" },
  { id: "AS-902", name: "iPhone 15 Pro Max", nameAr: "آيفون 15 برو ماكس", date: "Sep 2027", dateAr: "سبتمبر 2027" },
  { id: "AS-771", name: "YubiKey · Level 2", nameAr: "يوبي كي · المستوى الثاني", date: "Jul 2025", dateAr: "يوليو 2025" },
]

// ── live store: requests raised in this session join the lists ──────────────
let submitted: ServiceRequest[] = []
const listeners = new Set<() => void>()
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l) } }
let activeSnap = [...activeRequests]
let historySnap = [...requestHistory]

/** Next request number — unique, after the highest seeded one. */
const nextNumber = () => {
  const all = [...activeRequests, ...requestHistory, ...submitted].map((r) => Number(r.id.replace(/\D/g, "")))
  return `REQ-${Math.max(...all) + 1}`
}

export function addRequest(r: Omit<ServiceRequest, "id" | "date" | "dateAr" | "iso" | "step">): ServiceRequest {
  const d = new Date()
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const monthsAr = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
  const req: ServiceRequest = {
    ...r, id: nextNumber(), step: 0,
    date: `${d.getDate()} ${months[d.getMonth()]}`, dateAr: `${d.getDate()} ${monthsAr[d.getMonth()]}`,
    iso: `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`,
  }
  submitted = [req, ...submitted]
  activeSnap = [req, ...activeRequests]
  historySnap = [req, ...requestHistory]
  listeners.forEach((l) => l())
  return req
}

export const useActiveRequests = () => React.useSyncExternalStore(subscribe, () => activeSnap)
export const useRequestHistory = () => React.useSyncExternalStore(subscribe, () => historySnap)
