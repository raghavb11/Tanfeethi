import * as React from "react"
import { useTheme } from "next-themes"
import { Link } from "react-router-dom"

import { Tooltip, TooltipContent, TooltipTrigger } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import { useMediaQuery } from "@/hooks/use-media-query"
import { InlineSearch } from "@/components/InlineSearch"
import { InlineNotifications } from "@/components/InlineNotifications"
import { CrumbChevronIcon, TopMoonIcon, TopSidebarIcon, TopSparkleIcon } from "@/components/layout/shell-icons"
import { Menu, Search, Sun } from "lucide-react"

export type Crumb = { label: string; to?: string }

/** Figma top-bar tile (Button/Fill/On-Color = Page/Fill): 34px, radius 8. */
export const topBarTileClass =
  "relative inline-flex size-[34px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-background text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

/**
 * Figma "Top Bar" component (2015:8104) — 80px, padding 16/40, gap 16.
 * Start side: 34px side-bar toggle, then the title block (breadcrumb row 10px/14
 * over the 16px/24 bold page title, 4px apart).
 * End side: global search (447×33), 24px, then four 34px tiles spread over
 * 185px — assistant, language (ع / EN), theme, notifications.
 * Behind it: the module-tinted wash in the end corner (see .topbar-wash).
 */
export function TopBar({
  title,
  crumbs,
  onOpenMobileNav,
}: {
  title?: string
  crumbs?: Crumb[]
  onOpenMobileNav?: () => void
}) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    queueMicrotask(() => setMounted(true))
  }, [])
  const { setCommandOpen, setAiPanelOpen, locale, setLocale, setSidebarCollapsed } = useShell()
  const isAr = locale === "ar"
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  return (
    <header className="topbar-wash sticky top-0 z-40 h-20 shrink-0">
      <div className="flex h-full items-center gap-4 px-4 md:px-10">
        <IconTile
          label={isAr ? "القائمة الجانبية" : "Side bar"}
          onClick={() => (isDesktop ? setSidebarCollapsed((c) => !c) : onOpenMobileNav?.())}
        >
          {isDesktop ? <TopSidebarIcon /> : <Menu className="size-4" strokeWidth={1.6} />}
        </IconTile>

        <div className="flex min-w-0 flex-1 translate-y-px flex-col gap-1">
          {/* Figma always draws the breadcrumb row: earlier steps in Text/Secondary,
              the current page in bold Text/Primary, "›" chevrons 8px apart. */}
          <nav aria-label={isAr ? "مسار التنقل" : "Breadcrumb"} className="flex h-[14px] min-w-0 items-center gap-2 text-[10px] leading-[14px]">
            {(crumbs ?? []).map((c, i) => (
              <React.Fragment key={i}>
                {c.to ? (
                  <Link to={c.to} className="shrink-0 text-muted-foreground hover:text-foreground">
                    {c.label}
                  </Link>
                ) : (
                  <span className="shrink-0 text-muted-foreground">{c.label}</span>
                )}
                <CrumbChevronIcon className="size-2.5 shrink-0 text-muted-foreground" />
              </React.Fragment>
            ))}
            <span aria-current="page" className="truncate font-bold text-foreground">
              {title}
            </span>
          </nav>
          <h1 className="relative top-px truncate text-[16px] font-bold leading-6 text-foreground">{title ?? ""}</h1>
        </div>

        <InlineSearch isAr={isAr} onOpenFullPalette={() => setCommandOpen(true)} />

        <div className="flex items-center gap-4 md:ms-2 lg:w-[185px] lg:justify-between lg:gap-0">
          <span className="contents md:hidden">
            <IconTile label={isAr ? "بحث" : "Search"} onClick={() => setCommandOpen(true)}>
              <Search className="size-4" strokeWidth={1.6} />
            </IconTile>
          </span>

          <IconTile label={isAr ? "المساعد الشخصي" : "Personal assistant"} onClick={() => setAiPanelOpen((o) => !o)}>
            <TopSparkleIcon className="size-[34px]" />
          </IconTile>

          <IconTile
            label={isAr ? "التبديل للإنجليزية" : "Switch to Arabic"}
            onClick={() => setLocale(isAr ? "en" : "ar")}
            className="pb-1 text-[16px] leading-[14px]"
          >
            {/* Figma: the tile shows the active language ("ع" in Arabic) */}
            {isAr ? "ع" : "En"}
          </IconTile>

          <IconTile
            label={isAr ? "المظهر" : "Theme"}
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            disabled={!mounted}
          >
            {!mounted || resolvedTheme === "dark" ? (
              <TopMoonIcon className="size-[34px]" />
            ) : (
              <Sun className="size-4" strokeWidth={1.6} />
            )}
          </IconTile>

          <InlineNotifications isAr={isAr} />
        </div>
      </div>
    </header>
  )
}

function IconTile({
  label,
  onClick,
  children,
  className,
  disabled,
}: {
  label: string
  onClick?: () => void
  children: React.ReactNode
  className?: string
  disabled?: boolean
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label={label}
            onClick={onClick}
            disabled={disabled}
            className={cn(topBarTileClass, className)}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
