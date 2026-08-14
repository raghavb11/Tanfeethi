import * as React from "react"
import { motion } from "framer-motion"
import { NavLink } from "react-router-dom"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  ScrollArea,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { SidebarBrandLogo } from "@/components/BrandLogo"
import { adminNav, coreNav, resourcesNav } from "@/config/navigation"
import { useShell } from "@reach/shell-context"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ChevronLeft, ChevronRight } from "lucide-react"

const arLabels: Record<string, string> = {
  Home: "الرئيسية",
  "Employee Center": "مركز الموظف",
  "My Tasks": "مهامي",
  "Leave Balances": "أرصدة الإجازات",
  Attendance: "الحضور",
  News: "الأخبار",
  Announcements: "الإعلانات",
  Events: "الفعاليات",
  "Surveys & Polls": "الاستبيانات والتصويت",
  Policies: "السياسات",
  FAQs: "الأسئلة الشائعة",
  "Document Library": "مكتبة المستندات",
  "Employee Community": "مجتمع الموظفين",
  "Quick Links": "روابط سريعة",
  "Content Management": "إدارة المحتوى",
  Notifications: "الإشعارات",
  "Roles & Permissions": "الأدوار والصلاحيات",
  "Permission Groups": "مجموعات الصلاحيات",
  "Audit Logs": "سجلات التدقيق",
}

export function Sidebar({
  mobileOpen,
  onMobileOpenChange,
}: {
  mobileOpen?: boolean
  onMobileOpenChange?: (open: boolean) => void
}) {
  const { locale } = useShell()
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const isAr = locale === "ar"

  // On mobile, render the same nav inside a Sheet (always expanded layout for usability)
  if (!isDesktop) {
    return (
      <Sheet open={!!mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent
          side={isAr ? "right" : "left"}
          className="chrome-soft flex w-72 flex-col gap-0 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{isAr ? "القائمة" : "Navigation"}</SheetTitle>
            <SheetDescription>{isAr ? "تنقّل بين أقسام التطبيق" : "Navigate between sections"}</SheetDescription>
          </SheetHeader>
          <SidebarBody collapsed={false} isAr={isAr} onNavigate={() => onMobileOpenChange?.(false)} />
        </SheetContent>
      </Sheet>
    )
  }

  return <DesktopSidebar />
}

// ─── desktop static sidebar ──────────────────────────────────────────────────

function DesktopSidebar() {
  const { sidebarCollapsed, setSidebarCollapsed, locale } = useShell()
  const isAr = locale === "ar"
  const width = sidebarCollapsed ? 60 : 248

  return (
    <motion.aside
      animate={{ width }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="chrome-soft relative hidden h-svh shrink-0 flex-col overflow-hidden bg-sidebar text-sidebar-foreground lg:flex"
    >
      {/* Inner-edge divider — logical `end` (inner edge in LTR + RTL); starts
          below the top header (top-14), matching the AI panel's divider. */}
      <span
        aria-hidden
        className="pointer-events-none absolute top-14 bottom-0 end-0 z-10 w-px bg-border/60"
      />
      <SidebarBody collapsed={sidebarCollapsed} isAr={isAr} />
      <SidebarFooter collapsed={sidebarCollapsed} isAr={isAr} onToggleCollapse={() => setSidebarCollapsed((c) => !c)} />
    </motion.aside>
  )
}

// ─── shared body (logo + nav lists) ──────────────────────────────────────────

function SidebarBody({
  collapsed,
  isAr,
  onNavigate,
}: {
  collapsed: boolean
  isAr: boolean
  onNavigate?: () => void
}) {
  const navLabel = (title: string) => (isAr ? arLabels[title] ?? title : title)
  const isAdmin = useShell().role === "admin"

  return (
    <>
      {/* Logo */}
      <div
        className={cn(
          "relative flex h-14 shrink-0 items-center justify-center border-b border-border/60",
          collapsed ? "px-0" : "px-3"
        )}
      >
        <SidebarBrandLogo collapsed={collapsed} />
      </div>

      <ScrollArea className={cn("relative min-h-0 flex-1 py-3", collapsed ? "px-1.5" : "px-2")}>
        <div className="flex flex-col gap-3">
          {/* Core */}
          <div className={cn("flex flex-col gap-0.5", collapsed && "items-center")}>
            <SectionLabel collapsed={collapsed}>{isAr ? "الأساسية" : "Core"}</SectionLabel>
            {coreNav.map((item) => (
              <SidebarLink
                key={item.path}
                collapsed={collapsed}
                to={item.path}
                title={navLabel(item.title)}
                onNavigate={onNavigate}
              >
                <item.icon className="size-[18px] shrink-0" />
                {!collapsed && <span className="truncate">{navLabel(item.title)}</span>}
              </SidebarLink>
            ))}
          </div>

          {/* Section divider */}
          <div className={cn(collapsed ? "mx-auto w-6" : "mx-2")}>
            <div className="h-px bg-border/60" />
          </div>

          {/* Resources */}
          <div className={cn("flex flex-col gap-0.5", collapsed && "items-center")}>
            <SectionLabel collapsed={collapsed}>{isAr ? "المصادر" : "Resources"}</SectionLabel>
            {resourcesNav.map((item) => (
              <SidebarLink
                key={item.path}
                collapsed={collapsed}
                to={item.path}
                title={navLabel(item.title)}
                onNavigate={onNavigate}
              >
                <item.icon className="size-[18px] shrink-0" />
                {!collapsed && <span className="truncate">{navLabel(item.title)}</span>}
              </SidebarLink>
            ))}
          </div>

          {/* Administration — admin role only */}
          {isAdmin && (
            <>
              <div className={cn(collapsed ? "mx-auto w-6" : "mx-2")}>
                <div className="h-px bg-border/60" />
              </div>
              <div className={cn("flex flex-col gap-0.5", collapsed && "items-center")}>
                <SectionLabel collapsed={collapsed}>{isAr ? "الإدارة" : "Administration"}</SectionLabel>
                {adminNav.map((item) => (
                  <SidebarLink
                    key={item.path}
                    collapsed={collapsed}
                    to={item.path}
                    title={navLabel(item.title)}
                    onNavigate={onNavigate}
                  >
                    <item.icon className="size-[18px] shrink-0" />
                    {!collapsed && <span className="truncate">{navLabel(item.title)}</span>}
                  </SidebarLink>
                ))}
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </>
  )
}

// ─── desktop footer (avatar + collapse) ──────────────────────────────────────

function SidebarFooter({
  collapsed,
  isAr,
  onToggleCollapse,
}: {
  collapsed: boolean
  isAr: boolean
  onToggleCollapse: () => void
}) {
  // In RTL the sidebar sits on the right, so the chevron meaning flips:
  // collapsed → expand (point inward = left in RTL, right in LTR)
  const ExpandIcon = isAr ? ChevronLeft : ChevronRight
  const CollapseIcon = isAr ? ChevronRight : ChevronLeft

  return (
    <div className={cn(
      "border-t border-border/60",
      collapsed ? "flex flex-col items-center gap-1 px-1.5 py-1.5" : "space-y-1 p-2",
    )}>
      {!collapsed ? (
        <NavLink to="/employee" aria-label={isAr ? "مركز الموظف" : "Employee Center"} className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 hover:bg-sidebar-accent/60 transition-colors">
          <Avatar className="size-7 shrink-0 ring-1 ring-primary/30">
            <AvatarImage src="images/avatar-khalid.jpg" alt="" className="object-cover object-top" />
            <AvatarFallback className="bg-primary/15 text-primary text-[10px] font-bold tracking-wide">KH</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12px] font-semibold leading-tight">{isAr ? "خالد" : "Khalid"}</div>
            <div className="truncate text-[10px] text-muted-foreground/80 leading-tight mt-0.5">
              {isAr ? "موظف" : "Employee"}
            </div>
          </div>
        </NavLink>
      ) : (
        <Tooltip>
          <TooltipTrigger
            render={
              <NavLink
                to="/employee"
                aria-label={isAr ? "مركز الموظف" : "Employee Center"}
                className="flex size-9 items-center justify-center rounded-lg mx-auto transition-colors hover:bg-sidebar-accent/60"
              />
            }
          >
            <Avatar className="size-6 ring-1 ring-primary/30">
              <AvatarImage src="images/avatar-khalid.jpg" alt="" className="object-cover object-top" />
              <AvatarFallback className="bg-primary/15 text-primary text-[9px] font-bold">KH</AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent side="right">{isAr ? "خالد" : "Khalid"}</TooltipContent>
        </Tooltip>
      )}
      <button
        type="button"
        onClick={onToggleCollapse}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={cn(
          "flex items-center justify-center rounded-lg text-muted-foreground/60 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
          collapsed ? "size-9 mx-auto" : "w-full h-9 rounded-xl",
        )}
      >
        {collapsed ? <ExpandIcon className="size-4" /> : <CollapseIcon className="size-4" />}
      </button>
    </div>
  )
}

// ─── small primitives ────────────────────────────────────────────────────────

function SectionLabel({ collapsed, children }: { collapsed: boolean; children: React.ReactNode }) {
  if (collapsed) return null
  return (
    <div className="px-2 pb-1.5 text-[9px] font-semibold tracking-[0.12em] text-muted-foreground/50 uppercase select-none">
      {children}
    </div>
  )
}

function SidebarLink({
  to,
  title,
  collapsed,
  children,
  onNavigate,
}: {
  to: string
  title: string
  collapsed: boolean
  children: React.ReactNode
  onNavigate?: () => void
}) {
  const link = (
    <NavLink
      to={to}
      onClick={onNavigate}
      aria-label={title}
      className={({ isActive }) => navLinkClass(isActive, collapsed)}
    >
      {children}
    </NavLink>
  )

  if (collapsed) {
    return (
      <div className="block">
        <Tooltip>
          <TooltipTrigger render={link} />
          <TooltipContent side="right">{title}</TooltipContent>
        </Tooltip>
      </div>
    )
  }

  return link
}

function navLinkClass(isActive: boolean, collapsed: boolean) {
  return cn(
    "flex items-center rounded-lg text-[13px] font-medium transition-all duration-150",
    "outline-none focus-visible:ring-2 focus-visible:ring-ring",
    collapsed ? "size-9 justify-center mx-auto" : "gap-3 rounded-xl px-2.5 py-2",
    isActive
      ? "nav-active"
      : cn("text-muted-foreground/80 hover:text-sidebar-foreground", "hover:bg-sidebar-accent/70")
  )
}
