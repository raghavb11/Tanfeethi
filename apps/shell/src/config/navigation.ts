import type { LucideIcon } from "lucide-react"
import {
  Bell,
  BookOpen,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  Coffee,
  ExternalLink,
  Contact,
  FolderOpen,
  Gauge,
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
  { title: "My Tasks", path: "/tasks", icon: ListTodo },
  { title: "Leave Balances", path: "/leave", icon: Plane },
  { title: "Attendance", path: "/attendance", icon: CalendarClock },
  { title: "Org Chart", path: "/org-chart", icon: Network },
  { title: "Directory", path: "/directory", icon: Contact },
  { title: "Benefits", path: "/benefits", icon: Gift },
  { title: "Payslips", path: "/payslip", icon: Wallet },
  { title: "News", path: "/news", icon: Newspaper },
  { title: "Announcements", path: "/announcements", icon: Megaphone },
  { title: "Events", path: "/events", icon: CalendarDays },
  { title: "Surveys & Polls", path: "/surveys", icon: ClipboardList },
  { title: "Cafeteria", path: "/cafeteria", icon: Coffee },
  { title: "Manager Dashboard", path: "/manager", icon: UsersRound },
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
]

/** Kept for the command palette / inline search preview hubs. */
export const previewNav: NavItem[] = previewNavFromDomain

export const commandNav: { label: string; path: string; group: string }[] = [
  { label: "Home", path: "/", group: "Core" },
  { label: "Employee Center", path: "/employee", group: "Core" },
  { label: "Digital business card", path: "/employee/card", group: "Core" },
  { label: "My Tasks", path: "/tasks", group: "Core" },
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
  { label: "Approval Rule Engine", path: "/config/rules", group: "Administration" },
  { label: "Content Management", path: "/cms", group: "Administration" },
  { label: "Notifications", path: "/admin/notifications", group: "Administration" },
  { label: "Roles & Permissions", path: "/admin/roles", group: "Administration" },
  { label: "Permission Groups", path: "/admin/permission-groups", group: "Administration" },
  { label: "Audit Logs", path: "/admin/audit", group: "Administration" },
]
