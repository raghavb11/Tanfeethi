import * as React from "react"
import { createPortal } from "react-dom"
import { motion } from "framer-motion"
import { NavLink, useLocation } from "react-router-dom"

import {
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
import { WijhaLockup } from "@/components/BrandLogo"
import { compareNav, railGroups, railItemForPath, type RailItem } from "@/config/navigation"
import { useShell } from "@reach/shell-context"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ShieldCheck, UserRound } from "lucide-react"

/**
 * WIJHA side bar — the Figma "Side Bar" component. Two states, as in the file:
 *   Minimize (default) — 131px rail, icon over label, sub-pages in a flyout.
 *   Expanded           — 248px, icon beside label, sub-pages nested under the
 *                        active item.
 * The rail sits on the inline-start edge, so it is on the right in Arabic.
 */
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

  if (!isDesktop) {
    return (
      <Sheet open={!!mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent
          side={isAr ? "right" : "left"}
          className="flex w-72 flex-col gap-0 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{isAr ? "القائمة" : "Navigation"}</SheetTitle>
            <SheetDescription>{isAr ? "تنقّل بين أقسام التطبيق" : "Navigate between sections"}</SheetDescription>
          </SheetHeader>
          <div className="flex h-[72px] shrink-0 items-center px-5">
            <WijhaLockup />
          </div>
          <ScrollArea className="min-h-0 flex-1 px-3 pb-4">
            <ExpandedNav isAr={isAr} onNavigate={() => onMobileOpenChange?.(false)} />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    )
  }

  return <DesktopSidebar />
}

function DesktopSidebar() {
  const { sidebarCollapsed, locale } = useShell()
  const isAr = locale === "ar"
  const minimized = sidebarCollapsed

  return (
    <motion.aside
      animate={{ width: minimized ? 131 : 248 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="relative hidden h-svh shrink-0 flex-col border-e border-page-stroke bg-sidebar text-sidebar-foreground lg:flex"
    >
      <div className={cn("flex h-[72px] shrink-0 items-center px-5", minimized && "justify-center")}>
        <WijhaLockup />
      </div>
      <ScrollArea className="min-h-0 flex-1">
        {minimized ? (
          <RailNav isAr={isAr} />
        ) : (
          <div className="px-3 pt-6 pb-6">
            <ExpandedNav isAr={isAr} />
          </div>
        )}
      </ScrollArea>
      <div className="flex shrink-0 justify-center py-5">
        <ProfileButton isAr={isAr} />
      </div>
    </motion.aside>
  )
}

// ─── Minimize state: the rail ────────────────────────────────────────────────

function RailNav({ isAr }: { isAr: boolean }) {
  const { pathname } = useLocation()
  const active = railItemForPath(pathname)
  const { role } = useShell()
  const groups = visibleGroups(role === "admin")

  return (
    <nav aria-label={isAr ? "التنقل الرئيسي" : "Main navigation"} className="flex flex-col items-center gap-1 pt-6 pb-6">
      {groups.map((group, gi) => (
        <React.Fragment key={gi}>
          {gi > 0 && <div aria-hidden className="my-2 h-px w-[85px] bg-border" />}
          {group.map((item) => (
            <RailTile key={item.key} item={item} active={active?.key === item.key} isAr={isAr} />
          ))}
        </React.Fragment>
      ))}
      <div aria-hidden className="my-2 h-px w-[85px] bg-border" />
      <RoleSwitchTile isAr={isAr} />
      <CompareTiles isAr={isAr} />
    </nav>
  )
}

const tileClass =
  "relative flex w-[85px] flex-col items-center gap-1.5 rounded-lg px-1 py-2.5 text-center text-[12px] leading-[1.25] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"

function RailTile({ item, active, isAr }: { item: RailItem; active: boolean; isAr: boolean }) {
  const label = isAr ? item.titleAr : item.title
  const ref = React.useRef<HTMLAnchorElement>(null)
  const [flyout, setFlyout] = React.useState<DOMRect | null>(null)
  const closeTimer = React.useRef<number | undefined>(undefined)

  const open = () => {
    window.clearTimeout(closeTimer.current)
    if (item.children?.length && ref.current) setFlyout(ref.current.getBoundingClientRect())
  }
  const close = () => {
    closeTimer.current = window.setTimeout(() => setFlyout(null), 120)
  }

  if (item.inert) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={<span aria-disabled="true" className={cn(tileClass, "cursor-not-allowed text-icon opacity-50")} />}
        >
          <item.icon className="size-5" strokeWidth={1.6} />
          <span>{label}</span>
        </TooltipTrigger>
        <TooltipContent side={isAr ? "left" : "right"}>
          {isAr ? "لا يوجد تصميم لهذه الصفحة بعد" : "No design for this page yet"}
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <div onMouseEnter={open} onMouseLeave={close} onFocus={open} onBlur={close}>
      <NavLink
        ref={ref}
        to={item.path}
        end={item.path === "/"}
        aria-current={active ? "page" : undefined}
        className={cn(
          tileClass,
          active ? "nav-active" : "text-icon hover:bg-[var(--btn-ghost-hover)] hover:text-foreground",
        )}
      >
        <span className="relative">
          <item.icon className="size-5" strokeWidth={1.6} />
          {item.badge ? (
            <span className="absolute -top-1.5 -end-3 flex size-4 items-center justify-center rounded-full bg-[#a997c7] text-[10px] font-semibold text-[#0f0e0e]">
              {item.badge}
            </span>
          ) : null}
        </span>
        <span className={cn(active ? "text-primary" : "text-muted-foreground")}>{label}</span>
      </NavLink>
      {flyout &&
        item.children &&
        createPortal(
          <Flyout rect={flyout} isAr={isAr} title={label} items={item.children} onEnter={open} onLeave={close} />,
          document.body,
        )}
    </div>
  )
}

function Flyout({
  rect,
  isAr,
  title,
  items,
  onEnter,
  onLeave,
}: {
  rect: DOMRect
  isAr: boolean
  title: string
  items: NonNullable<RailItem["children"]>
  onEnter: () => void
  onLeave: () => void
}) {
  const { pathname } = useLocation()
  // Opens towards the content: left of the rail in RTL, right of it in LTR.
  const style: React.CSSProperties = isAr
    ? { top: rect.top, right: window.innerWidth - rect.left + 14 }
    : { top: rect.top, left: rect.right + 14 }
  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={style}
      className="fixed z-50 min-w-52 rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-2xl"
    >
      <div className="px-2.5 pt-1.5 pb-2 text-[11px] font-semibold text-muted-foreground">{title}</div>
      {items.map((c) => (
        <NavLink
          key={c.path}
          to={c.path}
          className={cn(
            "block rounded-lg px-2.5 py-2 text-[13px] transition-colors",
            pathname === c.path ? "bg-soft-accent text-primary" : "hover:bg-[var(--btn-ghost-hover)]",
          )}
        >
          {isAr ? c.titleAr : c.title}
        </NavLink>
      ))}
    </div>
  )
}

/** Figma "التبديل إلى واجهة المسؤول" — flips the demo role. */
function RoleSwitchTile({ isAr }: { isAr: boolean }) {
  const { role, setRole } = useShell()
  const toAdmin = role !== "admin"
  const label = toAdmin
    ? isAr ? "التبديل إلى واجهة المسؤول" : "Switch to admin view"
    : isAr ? "التبديل إلى واجهة الموظف" : "Switch to employee view"
  return (
    <button
      type="button"
      onClick={() => setRole(toAdmin ? "admin" : "user")}
      className={cn(tileClass, "text-icon hover:bg-[var(--btn-ghost-hover)] hover:text-foreground")}
    >
      {toAdmin ? <ShieldCheck className="size-5" strokeWidth={1.6} /> : <UserRound className="size-5" strokeWidth={1.6} />}
      <span className="text-muted-foreground">{label}</span>
    </button>
  )
}

/** Dev-only links to the other builds (kept from v1, demoted below the rail). */
function CompareTiles({ isAr }: { isAr: boolean }) {
  return (
    <div className="mt-2 flex flex-col items-center gap-1">
      {compareNav.map((item) => (
        <Tooltip key={item.url}>
          <TooltipTrigger
            render={
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                aria-label={isAr ? item.titleAr : item.title}
                className="flex size-8 items-center justify-center rounded-lg text-icon opacity-60 transition-colors hover:bg-[var(--btn-ghost-hover)] hover:opacity-100"
              />
            }
          >
            <item.icon className="size-4" strokeWidth={1.6} />
          </TooltipTrigger>
          <TooltipContent side={isAr ? "left" : "right"}>{isAr ? item.titleAr : item.title}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}

// ─── Expanded state (and the mobile sheet) ───────────────────────────────────

function ExpandedNav({ isAr, onNavigate }: { isAr: boolean; onNavigate?: () => void }) {
  const { pathname } = useLocation()
  const active = railItemForPath(pathname)
  const { role } = useShell()
  const groups = visibleGroups(role === "admin")

  return (
    <nav aria-label={isAr ? "التنقل الرئيسي" : "Main navigation"} className="flex flex-col gap-1">
      {groups.map((group, gi) => (
        <React.Fragment key={gi}>
          {gi > 0 && <div aria-hidden className="mx-2 my-2 h-px bg-border" />}
          {group.map((item) => {
            const isActive = active?.key === item.key
            const label = isAr ? item.titleAr : item.title
            if (item.inert) {
              return (
                <span
                  key={item.key}
                  aria-disabled="true"
                  title={isAr ? "لا يوجد تصميم لهذه الصفحة بعد" : "No design for this page yet"}
                  className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-icon opacity-50"
                >
                  <item.icon className="size-5 shrink-0" strokeWidth={1.6} />
                  <span className="truncate">{label}</span>
                </span>
              )
            }
            return (
              <div key={item.key}>
                <NavLink
                  to={item.path}
                  end={item.path === "/"}
                  onClick={onNavigate}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition-colors",
                    isActive
                      ? "bg-soft-accent text-primary"
                      : "text-muted-foreground hover:bg-[var(--btn-ghost-hover)] hover:text-foreground",
                  )}
                >
                  <item.icon className="size-5 shrink-0" strokeWidth={1.6} />
                  <span className="flex-1 truncate">{label}</span>
                  {item.badge ? (
                    <span className="flex size-5 items-center justify-center rounded-full bg-[#a997c7] text-[10px] font-semibold text-[#0f0e0e]">
                      {item.badge}
                    </span>
                  ) : null}
                </NavLink>
                {isActive && item.children && (
                  <div className="ms-8 mt-1 mb-1 flex flex-col gap-0.5 border-s border-border ps-2">
                    {item.children.map((c) => (
                      <NavLink
                        key={c.path}
                        to={c.path}
                        end
                        onClick={onNavigate}
                        className={({ isActive: on }) =>
                          cn(
                            "rounded-md px-2.5 py-1.5 text-[12.5px] transition-colors",
                            on ? "text-primary" : "text-muted-foreground hover:text-foreground",
                          )
                        }
                      >
                        {isAr ? c.titleAr : c.title}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </React.Fragment>
      ))}
      <div aria-hidden className="mx-2 my-2 h-px bg-border" />
      <ExpandedRoleSwitch isAr={isAr} />
    </nav>
  )
}

function ExpandedRoleSwitch({ isAr }: { isAr: boolean }) {
  const { role, setRole } = useShell()
  const toAdmin = role !== "admin"
  return (
    <button
      type="button"
      onClick={() => setRole(toAdmin ? "admin" : "user")}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-start text-[13px] text-muted-foreground transition-colors hover:bg-[var(--btn-ghost-hover)] hover:text-foreground"
    >
      {toAdmin ? <ShieldCheck className="size-5 shrink-0" strokeWidth={1.6} /> : <UserRound className="size-5 shrink-0" strokeWidth={1.6} />}
      <span>
        {toAdmin
          ? isAr ? "التبديل إلى واجهة المسؤول" : "Switch to admin view"
          : isAr ? "التبديل إلى واجهة الموظف" : "Switch to employee view"}
      </span>
    </button>
  )
}

function visibleGroups(isAdmin: boolean) {
  return railGroups.map((g) => g.filter((i) => !i.adminOnly || isAdmin)).filter((g) => g.length > 0)
}

function ProfileButton({ isAr }: { isAr: boolean }) {
  return (
    <NavLink
      to="/employee"
      aria-label={isAr ? "ملفي — فواز الغيلان" : "My profile — Fawaz Al-Ghaylan"}
      className="flex size-[30px] items-center justify-center rounded-full border border-primary/40 bg-[var(--avatar-fill)] text-[11px] font-semibold text-primary"
    >
      FA
    </NavLink>
  )
}
