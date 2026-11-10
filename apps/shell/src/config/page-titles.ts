import { hubMeta } from "@reach/domain-preview/nav"

const titlesEn: Record<string, string> = {
  "/learning": "Learning",
  "/operations": "Operations & Performance",
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
  "/notifications": "Notification history",
  "/work": "Work Hub",
  "/employee": "Employees",
  "/services": "Services Hub",
  "/surveys": "Surveys",
  "/surveys/new": "Create survey",
  "/intelligence": "Intelligence Hub",
  "/news": "News & Announcements",
  "/news/new": "New article",
  "/circulars": "Internal Circulars",
  "/circulars/new": "New circular",
  "/events": "Events Calendar",
  "/policies": "Policies & FAQs",
  "/documents": "Document Library",
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
}

const titlesAr: Record<string, string> = {
  "/learning": "التعلم",
  "/operations": "العمليات والأداء",
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
  "/services": "مركز الخدمات",
  "/surveys": "الاستبيانات",
  "/surveys/new": "إنشاء استبيان",
  "/intelligence": "مركز الذكاء",
  "/news": "الأخبار والإعلانات",
  "/news/new": "مقال جديد",
  "/circulars": "التعاميم الداخلية",
  "/circulars/new": "تعميم جديد",
  "/events": "تقويم الفعاليات",
  "/policies": "السياسات والأسئلة الشائعة",
  "/documents": "مكتبة المستندات",
  "/links": "روابط سريعة",
  "/community": "مجتمع الموظفين",
  "/cms": "إدارة المحتوى",
  "/announcements": "الإعلانات",
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
}

export function titleForPath(pathname: string, locale: "en" | "ar" = "en"): string {
  const map = locale === "ar" ? titlesAr : titlesEn
  if (map[pathname]) return map[pathname]
  if (pathname.startsWith("/news/edit/")) return locale === "ar" ? "تحرير المقال" : "Edit article"
  if (pathname.startsWith("/news/")) return locale === "ar" ? "مقال" : "Article"
  const m = pathname.match(/^\/hubs\/([^/]+)$/)
  if (m?.[1] && hubMeta[m[1]]) {
    return locale === "ar" ? hubMeta[m[1]].titleAr : hubMeta[m[1]].title
  }
  if (pathname.startsWith("/hubs/")) return locale === "ar" ? "مركز المعاينة" : "Preview hub"
  // Operations & Performance detail routes
  const ar = locale === "ar"
  if (/^\/calendar\/[^/]+\/edit$/.test(pathname)) return ar ? "تعديل الموعد" : "Edit appointment"
  if (pathname.startsWith("/tasks/")) return ar ? "تفاصيل المهمة" : "Task details"
  if (/^\/projects\/[^/]+\/milestones\//.test(pathname)) return ar ? "المعلم" : "Milestone"
  if (/^\/projects\/[^/]+\/edit$/.test(pathname)) return ar ? "تعديل المشروع" : "Edit project"
  if (pathname.startsWith("/projects/")) return ar ? "تفاصيل المشروع" : "Project details"
  if (pathname.startsWith("/operations/checklists/")) return ar ? "قوائم التحقق التشغيلية" : "Operational checklists"
  if (pathname.startsWith("/operations/evaluations/employee/")) return ar ? "سجل تقييمات الموظف" : "Employee evaluation history"
  if (pathname.startsWith("/operations/evaluations/")) return ar ? "تفاصيل التقييم" : "Evaluation details"
  if (pathname.startsWith("/operations/evaluate/")) return ar ? "تقييم الموظف" : "Employee evaluation"
  return ar ? "وجهة" : "WIJHA"
}

/** Breadcrumb steps between the rail section and the current page, for the
 *  deeper Figma trails (e.g. العمليات والأداء › التقييم الشخصي › قائمة الأهداف). */
export function intermediateCrumbs(pathname: string, locale: "en" | "ar" = "en"): { label: string; to: string }[] {
  const ar = locale === "ar"
  if (pathname.startsWith("/operations/personal/"))
    return [{ label: ar ? "التقييم الشخصي" : "Personal evaluation", to: "/operations/personal" }]
  if (pathname.startsWith("/operations/evaluations/"))
    return [{ label: ar ? "سجل التقييمات السابقة" : "Previous evaluations log", to: "/operations/evaluations" }]
  if (pathname.startsWith("/operations/evaluate/"))
    return [{ label: ar ? "التقييم السنوي للفريق" : "Team annual evaluation", to: "/operations/evaluate" }]
  return []
}
