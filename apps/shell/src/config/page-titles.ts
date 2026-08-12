import { hubMeta } from "@reach/domain-preview/nav"

const titlesEn: Record<string, string> = {
  "/": "Home",
  "/work": "Work Hub",
  "/employee": "Employee Hub",
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
}

const titlesAr: Record<string, string> = {
  "/": "الرئيسية",
  "/work": "مركز العمل",
  "/employee": "مركز الموظف",
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
  return "Reach"
}
