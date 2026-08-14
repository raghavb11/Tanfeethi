import type { LucideIcon } from "lucide-react"
import {
  Bell,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  Contact,
  FolderOpen,
  Gauge,
  Gift,
  HelpCircle,
  History,
  Home,
  Link2,
  ListTodo,
  Megaphone,
  Network,
  Newspaper,
  Plane,
  ScrollText,
  ShieldCheck,
  UserRound,
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
]

export const resourcesNav: NavItem[] = [
  { title: "Policies", path: "/policies", icon: ScrollText },
  { title: "FAQs", path: "/faqs", icon: HelpCircle },
  { title: "Document Library", path: "/documents", icon: FolderOpen },
  { title: "Employee Community", path: "/community", icon: Users },
  { title: "Quick Links", path: "/links", icon: Link2 },
]

export const adminNav: NavItem[] = [
  { title: "Content Management", path: "/cms", icon: Gauge },
  { title: "Notifications", path: "/admin/notifications", icon: Bell },
  { title: "Roles & Permissions", path: "/admin/roles", icon: ShieldCheck },
  { title: "Audit Logs", path: "/admin/audit", icon: History },
]

/** Kept for the command palette / inline search preview hubs. */
export const previewNav: NavItem[] = previewNavFromDomain

export const commandNav: { label: string; path: string; group: string }[] = [
  { label: "Home", path: "/", group: "Core" },
  { label: "Employee Center", path: "/employee", group: "Core" },
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
  { label: "Policies", path: "/policies", group: "Resources" },
  { label: "FAQs", path: "/faqs", group: "Resources" },
  { label: "Document Library", path: "/documents", group: "Resources" },
  { label: "Employee Community", path: "/community", group: "Resources" },
  { label: "Quick Links", path: "/links", group: "Resources" },
  { label: "Content Management", path: "/cms", group: "Administration" },
  { label: "Notifications", path: "/admin/notifications", group: "Administration" },
  { label: "Roles & Permissions", path: "/admin/roles", group: "Administration" },
  { label: "Permission Groups", path: "/admin/permission-groups", group: "Administration" },
  { label: "Audit Logs", path: "/admin/audit", group: "Administration" },
]
