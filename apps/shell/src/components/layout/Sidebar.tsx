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
import { RailAdminIcon } from "@/components/layout/shell-icons"
import {
  railGroupLabels,
  railGroups,
  railItemForPath,
  railPermissionsLabel,
  type RailItem,
} from "@/config/navigation"
import { useShell } from "@reach/shell-context"
import { useMediaQuery } from "@/hooks/use-media-query"

/**
 * WIJHA side bar — the Figma "Side Bar" component (2015:7788). Two states:
 *   Minimize (default) 131px — 2010:4015 / 3134:5607: icon over label.
 *   Default (expanded) 253px — 2010:4014 / 3134:5634: icon beside label,
 *                             group headings, profile footer.
 * The EMPLOYEE view shows exactly the Figma items. The ADMIN view keeps every
 * Figma item where it is and adds the Administration group after them, plus
 * sub-page flyouts (rail) / nested sub-items (expanded).
 * The rail sits on the inline-start edge (right in Arabic); its 2px Page/Stroke
 * edge faces the content.
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
          className="flex w-[253px] flex-col gap-0 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{isAr ? "القائمة" : "Navigation"}</SheetTitle>
            <SheetDescription>{isAr ? "تنقّل بين أقسام التطبيق" : "Navigate between sections"}</SheetDescription>
          </SheetHeader>
          <ExpandedSidebarBody isAr={isAr} onNavigate={() => onMobileOpenChange?.(false)} />
        </SheetContent>
      </Sheet>
    )
  }

  return <DesktopSidebar />
}

/** Pixel checks can open a state directly: ?sidebar=expanded, ?role=admin. */
function urlFlag(name: string): string | null {
  try {
    return new URLSearchParams(window.location.search + "&" + (window.location.hash.split("?")[1] ?? "")).get(name)
  } catch {
    return null
  }
}

function useIsAdmin() {
  const { role } = useShell()
  return urlFlag("role") === "admin" || role === "admin"
}

function DesktopSidebar() {
  const { sidebarCollapsed, locale } = useShell()
  const isAr = locale === "ar"
  const minimized = urlFlag("sidebar") === "expanded" ? false : sidebarCollapsed

  return (
    <motion.aside
      initial={false}
      animate={{ width: minimized ? 131 : 253 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="relative hidden h-svh shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex"
    >
      {/* Figma: 2px Page/Stroke on the content-facing edge, outside the layout box */}
      <span aria-hidden className="pointer-events-none absolute inset-y-0 end-0 z-10 w-0.5 bg-page-stroke" />
      {minimized ? (
        <>
          <div className="flex h-[72px] shrink-0 items-center justify-center">
            <WijhaLockup />
          </div>
          <ScrollArea className="min-h-0 flex-1">
            <RailNav isAr={isAr} />
          </ScrollArea>
        </>
      ) : (
        <ExpandedSidebarBody isAr={isAr} />
      )}
    </motion.aside>
  )
}

// ─── Minimize state: the rail ────────────────────────────────────────────────

function visibleGroups(isAdmin: boolean) {
  return railGroups.map((g) => g.filter((i) => !i.adminOnly || isAdmin))
}

/** Figma divider between rail groups: 85×2, Shape/Fill/Secondary, round ends. */
function RailDivider() {
  return <div aria-hidden className="h-0.5 w-[85px] shrink-0 rounded-full bg-secondary" />
}

function RailNav({ isAr }: { isAr: boolean }) {
  const { pathname } = useLocation()
  const active = railItemForPath(pathname)
  const isAdmin = useIsAdmin()
  const [main, discover, performance, admin] = visibleGroups(isAdmin)

  const tiles = (items: RailItem[]) =>
    items.map((item) => <RailTile key={item.key} item={item} active={active?.key === item.key} isAr={isAr} flyouts={isAdmin} />)

  // Figma Side Bar 2010:4015 — Container: pt 24, pb 80, gap 4 between the
  // groups and the dividers; groups after the first have pt 4.
  return (
    <nav aria-label={isAr ? "التنقل الرئيسي" : "Main navigation"} className="flex flex-col items-center gap-1 pt-6 pb-20">
      <div className="flex flex-col">{tiles(main ?? [])}</div>
      <RailDivider />
      <div className="flex flex-col pt-1">{tiles(discover ?? [])}</div>
      <RailDivider />
      <div className="flex flex-col pt-1">
        {tiles(performance ?? [])}
        <RoleSwitchTile isAr={isAr} />
        {admin && admin.length > 0 && (
          <>
            <div className="flex justify-center py-1">
              <RailDivider />
            </div>
            {tiles(admin)}
          </>
        )}
        <div className="flex w-[85px] justify-center py-3">
          <ProfileAvatar isAr={isAr} />
        </div>
      </div>
    </nav>
  )
}

/* Figma "Minimized Sidebar Tabs": 85 wide, padding 12.5/8, gap 8, radius 4,
   15px icon over a 12.5px label (15px line box). */
const tileClass =
  "relative flex w-[85px] flex-col items-center gap-2 rounded-[4px] px-2 py-[12.5px] text-center text-[12.5px] leading-[15px] outline-none ltr:px-1 transition-colors focus-visible:ring-2 focus-visible:ring-ring"

function RailTile({
  item,
  active,
  isAr,
  flyouts,
}: {
  item: RailItem
  active: boolean
  isAr: boolean
  flyouts: boolean
}) {
  const label = isAr ? item.titleAr : item.title
  const ref = React.useRef<HTMLAnchorElement>(null)
  const [flyout, setFlyout] = React.useState<DOMRect | null>(null)
  const closeTimer = React.useRef<number | undefined>(undefined)
  const hasFlyout = flyouts && !!item.children?.length

  const open = () => {
    window.clearTimeout(closeTimer.current)
    if (hasFlyout && ref.current) setFlyout(ref.current.getBoundingClientRect())
  }
  const close = () => {
    closeTimer.current = window.setTimeout(() => setFlyout(null), 120)
  }
  // Figma's rail draws wrapped English labels (3134:5607) and "مجتمع التنفيذي" on 18px lines.
  const labelClass = cn((isAr ? item.tallLabel : label.includes(" ")) && "leading-[18px]")

  if (item.inert) {
    return (
      <Tooltip>
        <TooltipTrigger render={<span aria-disabled="true" className={cn(tileClass, "cursor-not-allowed text-icon opacity-50")} />}>
          <item.icon className="size-[15px] shrink-0" />
          <span className={labelClass}>{label}</span>
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
        className={cn(tileClass, active ? "bg-soft-accent" : "hover:bg-[var(--btn-ghost-hover)]")}
      >
        <item.icon className={cn("size-[15px] shrink-0", active ? "text-primary" : "text-icon")} />
        <span className={cn(labelClass, active ? "font-bold text-foreground" : "text-muted-foreground")}>{label}</span>
        {active && <ActiveBar />}
        {item.badge ? <RailBadge value={item.badge} /> : null}
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

/** Figma active marker: 3×19 gold bar on the tile's inline-start edge. */
function ActiveBar() {
  return (
    <span
      aria-hidden
      className="absolute start-0 top-1/2 h-[19px] w-[3px] -translate-y-1/2 rounded-e-[1.5px] bg-primary"
    />
  )
}

/** Figma "Minimized Assistant Badge Number": 16px purple dot, 8px from the
 *  top and 17px from the tile's inline-end edge. */
function RailBadge({ value }: { value: number }) {
  return (
    <span className="absolute end-[17px] top-2 flex size-4 items-center justify-center rounded-full bg-[#a997c7] text-[10px] font-medium leading-none text-[#0f0e0e]">
      {value}
    </span>
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

function roleSwitchLabel(toAdmin: boolean, isAr: boolean) {
  return toAdmin
    ? isAr ? "التبديل إلى واجهة المسؤول" : "Switch to admin view"
    : isAr ? "التبديل إلى واجهة الموظف" : "Switch to employee view"
}

/** Figma "التبديل إلى واجهة المسؤول" — flips the demo role. */
function RoleSwitchTile({ isAr }: { isAr: boolean }) {
  const { setRole } = useShell()
  const toAdmin = !useIsAdmin()
  return (
    <button
      type="button"
      onClick={() => setRole(toAdmin ? "admin" : "user")}
      className={cn(tileClass, "hover:bg-[var(--btn-ghost-hover)]")}
    >
      <RailAdminIcon className="size-[15px] shrink-0 text-icon" />
      <span className={cn("text-muted-foreground", !isAr && "leading-[18px]")}>{roleSwitchLabel(toAdmin, isAr)}</span>
    </button>
  )
}

/** Figma "Minimized Sidebar User Container": 30px initials disc. */
function ProfileAvatar({ isAr, className }: { isAr: boolean; className?: string }) {
  return (
    <NavLink
      to="/profile"
      aria-label={isAr ? "ملفي — فواز الغيلان" : "My profile — Fawaz Al-Ghaylan"}
      className={cn(
        "flex size-[30px] shrink-0 items-center justify-center rounded-full border-[0.5px] border-primary bg-soft-accent text-[12px] font-semibold leading-none text-primary",
        className,
      )}
    >
      FA
    </NavLink>
  )
}

// ─── Default (expanded) state, also the mobile sheet ─────────────────────────
// Figma Side Bar "Default" 2010:4014 (RTL) / 3134:5634 (LTR), 253px:
//   header 72 (px 20) · nav (pt 16) of groups — each px 20, pt 4, pb 20, gap 4:
//   a 10px SemiBold heading, then 38px items (py 10, px 16, gap 8, radius 4,
//   15px icon + 12.5/18 label) · 64px · profile row (pt 16, px 20, gap 12).

function ExpandedSidebarBody({ isAr, onNavigate }: { isAr: boolean; onNavigate?: () => void }) {
  return (
    <>
      <div className="flex h-[72px] shrink-0 items-center px-5">
        <WijhaLockup />
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <ExpandedNav isAr={isAr} onNavigate={onNavigate} />
        <div className="mt-16 flex items-center gap-3 px-5 pt-4 pb-20">
          <ProfileAvatar isAr={isAr} className="border-[#8f743e]" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12px] font-bold leading-[18px] text-foreground">
              {isAr ? "فواز عبدالعزيز الغيلان" : "Fawaz Abdulaziz Alghilan"}
            </div>
            <div className="truncate text-[10px] leading-[14px] text-foreground">UX/UI Designer</div>
          </div>
        </div>
      </ScrollArea>
    </>
  )
}

function ExpandedGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 px-5 pt-1 pb-5">
      <div className="text-[10px] font-semibold leading-[14px] text-foreground">{title}</div>
      <div className="flex flex-col pt-1">{children}</div>
    </div>
  )
}

const expandedItemClass =
  "relative flex h-[38px] w-full items-center gap-2 rounded-[4px] px-4 py-2.5 text-start text-[12.5px] leading-[18px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"

function ExpandedNav({ isAr, onNavigate }: { isAr: boolean; onNavigate?: () => void }) {
  const { pathname } = useLocation()
  const active = railItemForPath(pathname)
  const isAdmin = useIsAdmin()
  const groups = visibleGroups(isAdmin)
  const { setRole } = useShell()

  const renderItem = (item: RailItem) => {
    const isActive = active?.key === item.key
    const label = isAr ? item.titleAr : item.title
    return (
      <div key={item.key}>
        <NavLink
          to={item.path}
          end={item.path === "/"}
          onClick={onNavigate}
          aria-current={isActive ? "page" : undefined}
          className={cn(expandedItemClass, isActive ? "bg-soft-accent" : "hover:bg-[var(--btn-ghost-hover)]")}
        >
          <item.icon className={cn("size-[15px] shrink-0", isActive ? "text-primary" : "text-icon")} />
          <span className={cn("min-w-0 flex-1 truncate", isActive ? "font-bold text-foreground" : "text-muted-foreground")}>{label}</span>
          {item.badge ? (
            <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[#a997c7] text-[10px] font-medium leading-none text-[#0f0e0e]">
              {item.badge}
            </span>
          ) : null}
          {isActive && <ActiveBar />}
        </NavLink>
        {/* Sub-pages are an admin-view addition; the employee view matches Figma. */}
        {isAdmin && isActive && item.children && (
          <div className="ms-7 mt-1 mb-1 flex flex-col gap-0.5 border-s border-border ps-2">
            {item.children.map((c) => (
              <NavLink
                key={c.path}
                to={c.path}
                end
                onClick={onNavigate}
                className={({ isActive: on }) =>
                  cn(
                    "rounded-md px-2.5 py-1.5 text-[12px] transition-colors",
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
  }

  const toAdmin = !isAdmin
  const label = (l: { title: string; titleAr: string }) => (isAr ? l.titleAr : l.title)

  return (
    <nav aria-label={isAr ? "التنقل الرئيسي" : "Main navigation"} className="flex flex-col pt-4">
      {groups.slice(0, 3).map((group, gi) => (
        <ExpandedGroup key={gi} title={label(railGroupLabels[gi]!)}>
          {group.map(renderItem)}
        </ExpandedGroup>
      ))}
      <ExpandedGroup title={label(railPermissionsLabel)}>
        <button
          type="button"
          onClick={() => setRole(toAdmin ? "admin" : "user")}
          className={cn(expandedItemClass, "hover:bg-[var(--btn-ghost-hover)]")}
        >
          <RailAdminIcon className="size-[15px] shrink-0 text-icon" />
          <span className="min-w-0 flex-1 truncate text-muted-foreground">{roleSwitchLabel(toAdmin, isAr)}</span>
        </button>
      </ExpandedGroup>
      {groups[3] && groups[3].length > 0 && (
        <ExpandedGroup title={label(railGroupLabels[3]!)}>{groups[3].map(renderItem)}</ExpandedGroup>
      )}
    </nav>
  )
}
