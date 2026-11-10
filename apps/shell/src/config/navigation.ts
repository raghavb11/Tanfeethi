import type { LucideIcon } from "lucide-react"
import {
  Bell,
  BookOpen,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  GraduationCap,
  LayoutDashboard,
  Sparkles,
  Wrench,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  Coffee,
  ExternalLink,
  Contact,
  FolderOpen,
  FolderKanban,
  Gauge,
  Handshake,
  Gift,
  HelpCircle,
  History,
  Home,
  LayoutGrid,
  Link2,
  ListTodo,
  Megaphone,
  Network,
  Newspaper,
  Plane,
  ScrollText,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  UsersRound,
  Users,
  Wallet,
} from "lucide-react"

import { previewNav as previewNavFromDomain } from "@reach/domain-preview/nav"

/** Shell navigation contract. Grouped to match the ALTANFEETHI Figma design
 *  system: CORE · RESOURCES · ADMINISTRATION. */
export type NavItem = {
  title: string
  path: string
  icon: LucideIcon
  preview?: boolean
}

export const coreNav: NavItem[] = [
  { title: "Home", path: "/", icon: Home },
  { title: "Employee Center", path: "/employee", icon: UserRound },
  { title: "Tasks", path: "/tasks", icon: ListTodo },
  { title: "Leave Balances", path: "/leave", icon: Plane },
  { title: "Attendance", path: "/attendance", icon: CalendarClock },
  { title: "Org Chart", path: "/org-chart", icon: Network },
  { title: "Directory", path: "/directory", icon: Contact },
  { title: "Benefits", path: "/benefits", icon: Gift },
  { title: "Partner Offers", path: "/benefits/partners", icon: Handshake },
  { title: "Payslips", path: "/payslip", icon: Wallet },
  { title: "News", path: "/news", icon: Newspaper },
  { title: "Announcements", path: "/announcements", icon: Megaphone },
  { title: "Events", path: "/events", icon: CalendarDays },
  { title: "Surveys & Polls", path: "/surveys", icon: ClipboardList },
  { title: "Cafeteria", path: "/cafeteria", icon: Coffee },
  { title: "Manager Dashboard", path: "/manager", icon: UsersRound },
  { title: "Projects", path: "/projects", icon: FolderKanban },
]

export const resourcesNav: NavItem[] = [
  { title: "Policies", path: "/policies", icon: ScrollText },
  { title: "FAQs", path: "/faqs", icon: HelpCircle },
  { title: "Knowledge Center", path: "/knowledge", icon: BookOpen },
  { title: "Document Library", path: "/documents", icon: FolderOpen },
  { title: "Employee Community", path: "/community", icon: Users },
  { title: "Quick Links", path: "/links", icon: Link2 },
]

export const adminNav: NavItem[] = [
  { title: "Configuration", path: "/config", icon: SlidersHorizontal },
  { title: "Content Management", path: "/cms", icon: Gauge },
  { title: "Notifications", path: "/admin/notifications", icon: Bell },
  { title: "Partners", path: "/config/partners", icon: Handshake },
  { title: "Roles & Permissions", path: "/admin/roles", icon: ShieldCheck },
  { title: "Audit Logs", path: "/admin/audit", icon: History },
]

/** Dev-only: the earlier "Unified 4" build, served alongside for comparison.
 *  Started from .claude/launch.json as `reach-original`. Not part of the
 *  product — it is here so gaps against the original can be spotted. */
export type ExternalNavItem = { title: string; titleAr: string; url: string; icon: LucideIcon }

export const compareNav: ExternalNavItem[] = [
  { title: "Original app", titleAr: "التطبيق الأصلي", url: "http://localhost:5174", icon: ExternalLink },
  { title: "Home v2 (no side nav)", titleAr: "الرئيسية v2 (بدون قائمة جانبية)", url: "/#/v2", icon: LayoutGrid },
  { title: "Tea boy app", titleAr: "تطبيق خدمة الضيافة", url: "/#/tea-boy/login", icon: Coffee },
  { title: "Partner portal", titleAr: "بوابة الشركاء", url: "/#/partner", icon: Handshake },
]

/** Kept for the command palette / inline search preview hubs. */
export const previewNav: NavItem[] = previewNavFromDomain

export const commandNav: { label: string; path: string; group: string }[] = [
  { label: "Home", path: "/", group: "Core" },
  { label: "Employee Center", path: "/employee", group: "Core" },
  { label: "My family (dependants)", path: "/employee/dependants", group: "Core" },
  { label: "Add a dependant", path: "/employee/dependants/new", group: "Core" },
  { label: "Digital business card", path: "/employee/card", group: "Core" },
  { label: "Tasks", path: "/tasks", group: "Core" },
  { label: "New task", path: "/tasks/new", group: "Core" },
  { label: "Team tasks", path: "/tasks?scope=team", group: "Core" },
  { label: "Projects", path: "/projects", group: "Core" },
  { label: "Holiday calendar", path: "/config/holidays", group: "Core" },
  { label: "Master data", path: "/config/master-data", group: "Core" },
  { label: "Cafeteria menu & places", path: "/config/cafeteria", group: "Core" },
  { label: "New project", path: "/projects/new", group: "Core" },
  { label: "Assign a task", path: "/tasks/new?from=manager", group: "Core" },
  { label: "Leave Balances", path: "/leave", group: "Core" },
  { label: "Request Leave", path: "/leave/request", group: "Core" },
  { label: "Attendance", path: "/attendance", group: "Core" },
  { label: "Org Chart", path: "/org-chart", group: "Core" },
  { label: "Directory", path: "/directory", group: "Core" },
  { label: "Benefits", path: "/benefits", group: "Core" },
  { label: "Payslips", path: "/payslip", group: "Core" },
  { label: "News", path: "/news", group: "Core" },
  { label: "Announcements", path: "/announcements", group: "Core" },
  { label: "Events", path: "/events", group: "Core" },
  { label: "Surveys & Polls", path: "/surveys", group: "Core" },
  { label: "Cafeteria", path: "/cafeteria", group: "Core" },
  { label: "Manager dashboard", path: "/manager", group: "Core" },
  { label: "Home v2 (no side nav)", path: "/v2", group: "Core" },
  { label: "My cafeteria orders", path: "/cafeteria/orders", group: "Core" },
  { label: "Cafeteria service queue", path: "/cafeteria/admin", group: "Core" },
  { label: "Policies", path: "/policies", group: "Resources" },
  { label: "FAQs", path: "/faqs", group: "Resources" },
  { label: "Knowledge Center", path: "/knowledge", group: "Resources" },
  { label: "Document Library", path: "/documents", group: "Resources" },
  { label: "Employee Community", path: "/community", group: "Resources" },
  { label: "Quick Links", path: "/links", group: "Resources" },
  { label: "Configuration", path: "/config", group: "Administration" },
  { label: "Partners", path: "/config/partners", group: "Administration" },
  { label: "Partner portal", path: "/partner", group: "Administration" },
  { label: "Partner voucher tracking", path: "/partner/vouchers", group: "Administration" },
  { label: "Approval Rule Engine", path: "/config/rules", group: "Administration" },
  { label: "Content Management", path: "/cms", group: "Administration" },
  { label: "Notifications", path: "/admin/notifications", group: "Administration" },
  { label: "Roles & Permissions", path: "/admin/roles", group: "Administration" },
  { label: "Permission Groups", path: "/admin/permission-groups", group: "Administration" },
  { label: "Audit Logs", path: "/admin/audit", group: "Administration" },
]

// ─── WIJHA rail (Figma "Side Bar" component) ────────────────────────────────
/** Module keys drive the per-module accent (html[data-module]) — see index.css. */
export type ModuleKey = "home" | "work" | "employee" | "services" | "ai" | "knowledge" | "learning" | "operations" | "admin"

export type RailChild = { title: string; titleAr: string; path: string }

export type RailItem = {
  key: string
  title: string
  titleAr: string
  /** Where the rail tile itself navigates. */
  path: string
  icon: LucideIcon
  module: ModuleKey
  /** Path prefixes that light this tile up (in addition to `path` and children). */
  match?: string[]
  badge?: number
  /** Sub-pages, shown in a flyout on the rail and nested when expanded. Keeps
   *  every v1 page reachable now that the rail only has the Figma top-level items. */
  children?: RailChild[]
  /** In the design but with no screens and no page yet — rendered inert and
   *  flagged (BUILD-GUIDELINES U5). */
  inert?: boolean
  adminOnly?: boolean
}

export const railGroups: RailItem[][] = [
  [
    { key: "home", title: "Home", titleAr: "الرئيسية", path: "/", icon: LayoutDashboard, module: "home", match: ["/notifications"] },
    {
      key: "calendar", title: "Calendar", titleAr: "التقويم", path: "/calendar", icon: CalendarDays, module: "work",
      match: ["/events", "/config/holidays"],
      children: [
        { title: "My calendar", titleAr: "تقويمي", path: "/calendar" },
        { title: "Events", titleAr: "الفعاليات", path: "/events" },
        { title: "Holiday calendar", titleAr: "تقويم العطل", path: "/config/holidays" },
      ],
    },
    {
      key: "work", title: "Work", titleAr: "العمل", path: "/tasks", icon: BriefcaseBusiness, module: "work",
      match: ["/work", "/tasks", "/projects", "/manager"],
      children: [
        { title: "Tasks", titleAr: "المهام", path: "/tasks" },
        { title: "Projects", titleAr: "المشاريع", path: "/projects" },
        { title: "Work hub", titleAr: "مركز العمل", path: "/work" },
        { title: "Manager dashboard", titleAr: "لوحة المدير", path: "/manager" },
      ],
    },
    {
      key: "employee", title: "Employee", titleAr: "الموظف", path: "/employee", icon: UserRound, module: "employee",
      match: ["/employee", "/leave", "/attendance", "/org-chart", "/directory", "/benefits", "/payslip", "/profile"],
      children: [
        { title: "Employee center", titleAr: "مركز الموظف", path: "/employee" },
        { title: "Leave", titleAr: "الإجازات", path: "/leave" },
        { title: "Attendance", titleAr: "الحضور", path: "/attendance" },
        { title: "Org chart", titleAr: "الهيكل التنظيمي", path: "/org-chart" },
        { title: "Directory", titleAr: "دليل الموظفين", path: "/directory" },
        { title: "Benefits", titleAr: "المزايا", path: "/benefits" },
        { title: "Partner offers", titleAr: "عروض الشركاء", path: "/benefits/partners" },
        { title: "Payslips", titleAr: "كشوف الرواتب", path: "/payslip" },
        { title: "My family", titleAr: "عائلتي", path: "/employee/dependants" },
        { title: "Business card", titleAr: "بطاقة العمل", path: "/employee/card" },
        { title: "Assets", titleAr: "الأصول", path: "/employee/assets" },
        { title: "Shift roster", titleAr: "جدول المناوبات", path: "/employee/shifts" },
        { title: "Profile", titleAr: "الملف الشخصي", path: "/profile" },
      ],
    },
    {
      key: "services", title: "Services", titleAr: "الخدمات", path: "/services", icon: Wrench, module: "services",
      match: ["/services", "/cafeteria"],
      children: [
        { title: "Services", titleAr: "الخدمات", path: "/services" },
        { title: "Cafeteria", titleAr: "الكافتيريا", path: "/cafeteria" },
        { title: "My orders", titleAr: "طلباتي", path: "/cafeteria/orders" },
      ],
    },
    { key: "assistant", title: "Assistant", titleAr: "المساعد", path: "/intelligence", icon: Sparkles, module: "ai", badge: 2 },
  ],
  [
    {
      key: "community", title: "Executive community", titleAr: "مجتمع التنفيذي", path: "/community", icon: Users, module: "knowledge",
      match: ["/community", "/news", "/announcements", "/surveys", "/circulars"],
      children: [
        { title: "Community", titleAr: "المجتمع", path: "/community" },
        { title: "News", titleAr: "الأخبار", path: "/news" },
        { title: "Announcements", titleAr: "الإعلانات", path: "/announcements" },
        { title: "Surveys & polls", titleAr: "الاستبيانات", path: "/surveys" },
        { title: "Circulars", titleAr: "التعاميم", path: "/circulars" },
      ],
    },
    {
      key: "knowledge", title: "Knowledge", titleAr: "المعرفة", path: "/documents", icon: BookOpen, module: "knowledge",
      match: ["/documents", "/policies", "/faqs", "/knowledge", "/links", "/hubs"],
      children: [
        { title: "Document library", titleAr: "مكتبة المستندات", path: "/documents" },
        { title: "Policies", titleAr: "السياسات", path: "/policies" },
        { title: "FAQs", titleAr: "الأسئلة الشائعة", path: "/faqs" },
        { title: "Knowledge center", titleAr: "مركز المعرفة", path: "/knowledge" },
        { title: "Quick links", titleAr: "روابط سريعة", path: "/links" },
      ],
    },
    { key: "learning", title: "Learning", titleAr: "التعلم", path: "/learning", icon: GraduationCap, module: "learning" },
  ],
  [
    { key: "operations", title: "Operations & Performance", titleAr: "العمليات والأداء", path: "/operations", icon: Gauge, module: "operations" },
    {
      key: "corporate", title: "Corporate performance", titleAr: "الأداء المؤسسي", path: "/corporate-performance",
      icon: ChartNoAxesCombined, module: "operations", inert: true,
    },
    {
      key: "admin", title: "Administration", titleAr: "الإدارة", path: "/config", icon: SlidersHorizontal, module: "admin", adminOnly: true,
      match: ["/config", "/cms", "/admin", "/partner"],
      children: [
        { title: "Configuration", titleAr: "الإعدادات", path: "/config" },
        { title: "Content management", titleAr: "إدارة المحتوى", path: "/cms" },
        { title: "Notifications", titleAr: "الإشعارات", path: "/admin/notifications" },
        { title: "Partners", titleAr: "الشركاء", path: "/config/partners" },
        { title: "Roles & permissions", titleAr: "الأدوار والصلاحيات", path: "/admin/roles" },
        { title: "Audit logs", titleAr: "سجلات التدقيق", path: "/admin/audit" },
        { title: "Approval rules", titleAr: "قواعد الموافقات", path: "/config/rules" },
        { title: "Master data", titleAr: "البيانات المرجعية", path: "/config/master-data" },
      ],
    },
  ],
]

const railItems = railGroups.flat()

function matchesPrefix(prefix: string, pathname: string) {
  return prefix === "/" ? pathname === "/" : pathname === prefix || pathname.startsWith(prefix + "/")
}

/** Rail item that owns a route (most specific prefix wins). */
export function railItemForPath(pathname: string): RailItem | undefined {
  let best: { item: RailItem; len: number } | undefined
  for (const item of railItems) {
    const prefixes = [item.path, ...(item.match ?? []), ...(item.children ?? []).map((c) => c.path)]
    for (const p of prefixes) {
      if (matchesPrefix(p, pathname) && (!best || p.length > best.len)) best = { item, len: p.length }
    }
  }
  return best?.item
}

export function moduleForPath(pathname: string): ModuleKey {
  return railItemForPath(pathname)?.module ?? "home"
}
