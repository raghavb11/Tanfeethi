import { hubMeta } from "@reach/domain-preview/nav"

const titlesEn: Record<string, string> = {
  "/learning": "Learning",
  "/operations": "Operations & Performance",
  "/corporate-performance": "Corporate performance",
  "/operations/delegation/new": "New delegation request",
  "/operations/incentives": "Incentives",
  "/operations/evaluations": "Previous evaluations log",
  "/operations/personal": "Personal evaluation",
  "/operations/personal/goals": "Goals list",
  "/operations/personal/history": "My previous evaluations",
  "/operations/personal/half-year": "Half-year evaluation",
  "/operations/personal/annual": "Annual evaluation",
  "/operations/personal/operational-log": "My operational evaluations",
  "/operations/evaluate": "Team annual evaluation",
  "/": "Home",
  "/notifications": "Notification History",
  "/work": "Work Hub",
  "/employee": "Employees",
  "/services": "Services",
  "/surveys": "Surveys",
  "/surveys/new": "Create survey",
  "/intelligence": "Assistant",
  "/news": "News",
  "/news/new": "New article",
  "/circulars": "Internal Circulars",
  "/circulars/new": "New circular",
  "/events": "Events Calendar",
  "/policies": "Policies & FAQs",
  "/documents": "Knowledge",
  "/links": "Quick Links",
  "/community": "Employee Community",
  "/cms": "Content Management",
  "/announcements": "Announcements",
  "/faqs": "Policies & FAQs",
  "/admin/notifications": "Notifications",
  "/admin/roles": "Roles & Permissions",
  "/admin/audit": "Audit Logs",
  "/projects": "Projects",
  "/benefits/partners": "Partner Offers",
  "/employee/dependants": "My Family",
  "/config/holidays": "Holiday Calendar",
  "/config/master-data": "Master Data",
  "/config/cafeteria": "Cafeteria Settings",
  "/projects/new": "New Project",
  "/profile": "Profile",
  "/employee/assets": "Assets",
  "/employee/shifts": "Shift roster",
  "/employee/card": "Business card",
  "/leave/request": "Leave request",
  "/attendance": "My Attendance",
  "/leave": "Leave Balances",
  "/org-chart": "Org Chart",
  "/directory": "Employee Directory",
  "/payslip": "Payslips",
  "/benefits": "Benefits & allowances",
  "/config/partners": "Partners",
  "/config/partners/new": "New partner",
  "/partner": "Partner portal",
  "/partner/offers/new": "New offer",
  "/partner/vouchers": "Voucher tracking",
  "/manager": "Manager dashboard",
  "/employee/dependants/new": "Add a dependant",
  "/calendar": "Calendar",
  "/calendar/new": "New appointment",
  "/tasks": "Tasks",
  "/tasks/new": "New task",
  "/sprints": "Sprints",
  "/sprints/new": "New sprint",
  "/services/catalog/it/technical": "Request a technical service",
  "/services/catalog/it/report-fault": "Report a fault",
  "/services/history": "Submitted services log",
  "/services/health": "My health",
  "/services/hospitality/waiter": "Request a waiter",
  "/services/violations": "Violation reporting system",
  "/services/violations/new": "Violation reporting service",
  "/services/violations/reports": "Follow up on reports",
  "/services/violations/queue": "Follow up on reports",
  "/cafeteria": "Order menu",
}

const titlesAr: Record<string, string> = {
  "/learning": "التعلم",
  "/operations": "العمليات والأداء",
  "/corporate-performance": "الأداء المؤسسي",
  "/operations/delegation/new": "طلب إنابة جديد",
  "/operations/incentives": "الحوافز",
  "/operations/evaluations": "سجل التقييمات السابقة",
  "/operations/personal": "التقييم الشخصي",
  "/operations/personal/goals": "قائمة الأهداف",
  "/operations/personal/history": "عرض تقييماتي السابقة",
  "/operations/personal/half-year": "التقييم النصف سنوي",
  "/operations/personal/annual": "التقييم السنوي",
  "/operations/personal/operational-log": "سجل تقييماتي التشغيلية",
  "/operations/evaluate": "التقييم السنوي للفريق",
  "/": "الرئيسية",
  "/notifications": "سجل التنبيهات",
  "/work": "مركز العمل",
  "/employee": "الموظفين",
  "/services": "الخدمات",
  "/surveys": "الاستبيانات",
  "/surveys/new": "إنشاء استبيان",
  "/intelligence": "المساعد",
  "/news": "الأخبار",
  "/news/new": "مقال جديد",
  "/circulars": "التعاميم الداخلية",
  "/circulars/new": "تعميم جديد",
  "/events": "تقويم الفعاليات",
  "/policies": "السياسات والأسئلة الشائعة",
  "/documents": "المعرفة",
  "/links": "روابط سريعة",
  "/community": "مجتمع الموظفين",
  "/cms": "إدارة المحتوى",
  "/announcements": "التعاميم",
  "/faqs": "السياسات والأسئلة الشائعة",
  "/admin/notifications": "الإشعارات",
  "/admin/roles": "الأدوار والصلاحيات",
  "/admin/audit": "سجلات التدقيق",
  "/projects": "المشاريع",
  "/benefits/partners": "عروض الشركاء",
  "/employee/dependants": "عائلتي",
  "/config/holidays": "تقويم الإجازات",
  "/config/master-data": "البيانات الرئيسية",
  "/config/cafeteria": "إعدادات الكافتيريا",
  "/projects/new": "مشروع جديد",
  "/profile": "الملف الشخصي",
  "/employee/assets": "الأصول",
  "/employee/shifts": "جدول المناوبات",
  "/employee/card": "بطاقة العمل",
  "/leave/request": "طلب إجازة",
  "/attendance": "حضوري",
  "/leave": "أرصدة الإجازات",
  "/org-chart": "الهيكل التنظيمي",
  "/directory": "دليل الموظفين",
  "/payslip": "كشوف الرواتب",
  "/benefits": "المزايا والبدلات",
  "/config/partners": "الشركاء",
  "/config/partners/new": "شريك جديد",
  "/partner": "بوابة الشركاء",
  "/partner/offers/new": "عرض جديد",
  "/partner/vouchers": "متابعة القسائم",
  "/manager": "لوحة المدير",
  "/employee/dependants/new": "إضافة معال",
  "/calendar": "التقويم",
  "/calendar/new": "موعد جديد",
  "/tasks": "المهام",
  "/tasks/new": "مهمة جديدة",
  "/sprints": "السبرنتات",
  "/sprints/new": "سبرنت جديد",
  "/services/catalog/it/technical": "طلب خدمة تقنية",
  "/services/catalog/it/report-fault": "الإبلاغ عن عطل",
  "/services/history": "سجل الخدمات المرفوعة",
  "/services/health": "صحتي",
  "/services/hospitality/waiter": "طلب النادل",
  "/services/violations": "نظام الإبلاغ عن المخالفات",
  "/services/violations/new": "خدمة الإبلاغ عن المخالفات",
  "/services/violations/reports": "متابعة طلبات الإبلاغ",
  "/services/violations/queue": "متابعة طلبات الإبلاغ",
  "/cafeteria": "قائمة الطلبات",
}

/** Service catalog names — mirror of domain-services data/mock/services.ts. */
const serviceCatalogs: Record<string, [string, string]> = {
  it: ["IT & Permissions", "تقنية المعلومات والصلاحيات"],
  hr: ["HR & Payroll", "الموارد البشرية والرواتب"],
  finance: ["Finance", "المالية"],
  facilities: ["Facilities", "المرافق"],
  hospitality: ["Hospitality", "الضيافة"],
}

export function titleForPath(pathname: string, locale: "en" | "ar" = "en"): string {
  const map = locale === "ar" ? titlesAr : titlesEn
  if (map[pathname]) return map[pathname]
  if (pathname.startsWith("/news/edit/")) return locale === "ar" ? "تحرير الخبر" : "Edit news"
  if (pathname.startsWith("/news/")) return locale === "ar" ? "تفاصيل الخبر" : "News details"
  if (pathname.startsWith("/announcements/edit/")) return locale === "ar" ? "تحرير التعميم" : "Edit announcement"
  if (pathname.startsWith("/announcements/")) return locale === "ar" ? "تفاصيل التعميم" : "Announcement details"
  const m = pathname.match(/^\/hubs\/([^/]+)$/)
  if (m?.[1] && hubMeta[m[1]]) {
    return locale === "ar" ? hubMeta[m[1]].titleAr : hubMeta[m[1]].title
  }
  if (pathname.startsWith("/hubs/")) return locale === "ar" ? "مركز المعاينة" : "Preview hub"
  // Operations & Performance detail routes
  const ar = locale === "ar"
  const catalog = pathname.match(/^\/services\/catalog\/([^/]+)$/)
  if (catalog?.[1] && serviceCatalogs[catalog[1]]) return serviceCatalogs[catalog[1]][ar ? 1 : 0]
  if (pathname.startsWith("/services/request/")) return ar ? "طلب خدمة" : "Service request"
  if (/^\/services\/violations\/(reports|queue)\/[^/]+$/.test(pathname)) return ar ? "بلاغ مخالفة" : "Violation report"
  if (/^\/calendar\/[^/]+\/edit$/.test(pathname)) return ar ? "تعديل الموعد" : "Edit appointment"
  if (pathname.startsWith("/tasks/")) return ar ? "تفاصيل المهمة" : "Task details"
  if (pathname.startsWith("/sprints/")) return ar ? "السبرنت" : "Sprint"
  if (/^\/projects\/[^/]+\/milestones\//.test(pathname)) return ar ? "المعلم" : "Milestone"
  if (/^\/projects\/[^/]+\/edit$/.test(pathname)) return ar ? "تعديل المشروع" : "Edit project"
  if (pathname.startsWith("/projects/")) return ar ? "تفاصيل المشروع" : "Project details"
  if (pathname.startsWith("/operations/checklists/")) return ar ? "قوائم التحقق التشغيلية" : "Operational checklists"
  if (pathname.startsWith("/operations/evaluations/employee/")) return ar ? "سجل تقييمات الموظف" : "Employee evaluation history"
  if (pathname.startsWith("/operations/evaluations/")) return ar ? "تفاصيل التقييم" : "Evaluation details"
  if (pathname.startsWith("/operations/evaluate/")) return ar ? "تقييم الموظف" : "Employee evaluation"
  if (pathname.startsWith("/corporate-performance/objectives/")) return ar ? "هدف استراتيجي" : "Strategic objective"
  if (pathname.startsWith("/corporate-performance/kpis/")) return ar ? "تفاصيل المؤشر" : "KPI detail"
  if (pathname.startsWith("/corporate-performance/departments/")) return ar ? "بطاقة أداء الإدارة" : "Department scorecard"
  return ar ? "وجهة" : "WIJHA"
}

/** Breadcrumb steps between the rail section and the current page, for the
 *  deeper Figma trails (e.g. العمليات والأداء › التقييم الشخصي › قائمة الأهداف). */
export function intermediateCrumbs(pathname: string, locale: "en" | "ar" = "en"): { label: string; to: string }[] {
  const ar = locale === "ar"
  if (pathname === "/services/catalog/it/technical" || pathname === "/services/catalog/it/report-fault")
    return [{ label: ar ? "تقنية المعلومات والصلاحيات" : "IT & Permissions", to: "/services/catalog/it" }]
  if (pathname === "/cafeteria" || pathname === "/services/hospitality/waiter")
    return [{ label: ar ? "الضيافة" : "Hospitality", to: "/services/catalog/hospitality" }]
  // Violations (4946:15932, 4999:18052, 4999:19203, 4999:18721, 5005:19655):
  // the hub's service group, or the follow-up list for a single report.
  const report = pathname.match(/^\/services\/violations\/(reports|queue)\/[^/]+$/)
  if (report)
    return [{ label: ar ? "متابعة طلبات الإبلاغ" : "Follow up on reports", to: `/services/violations/${report[1]}` }]
  if (pathname === "/services/violations/queue")
    return [{ label: ar ? "خدمات التحقيق" : "Investigation Services", to: "/services/violations?group=investigation" }]
  if (pathname.startsWith("/services/violations/"))
    return [{ label: ar ? "خدمات الإبلاغ" : "Reporting Services", to: "/services/violations" }]
  // The operational log sits directly under the section in Figma (4215:13599).
  if (pathname.startsWith("/operations/personal/") && pathname !== "/operations/personal/operational-log")
    return [{ label: ar ? "التقييم الشخصي" : "Personal evaluation", to: "/operations/personal" }]
  if (pathname.startsWith("/operations/evaluations/"))
    return [{ label: ar ? "سجل التقييمات السابقة" : "Previous evaluations log", to: "/operations/evaluations" }]
  // Sprint screens sit under the sprint master: المهام › السبرنتات › <sprint>.
  if (pathname.startsWith("/sprints/"))
    return [{ label: ar ? "السبرنتات" : "Sprints", to: "/sprints" }]
  // Team evaluation pages are section › page in Figma (4126:14560, 4126:14408).
  return []
}
