import * as React from "react"
import { useTheme } from "next-themes"
import { Link } from "react-router-dom"

import { Tooltip, TooltipContent, TooltipTrigger } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import { useMediaQuery } from "@/hooks/use-media-query"
import { InlineSearch } from "@/components/InlineSearch"
import { InlineNotifications } from "@/components/InlineNotifications"
import { ChevronLeft, ChevronRight, Menu, Moon, PanelLeft, PanelRight, Search, Sparkles, Sun } from "lucide-react"

export type Crumb = { label: string; to?: string }

/**
 * Figma "Top Bar" component — 80px, padding 16/40, transparent over the page.
 * Start side: side-bar toggle, then breadcrumb over the page title.
 * End side: global search (447px, ⌘K), then 36px icon tiles — AI assistant,
 * language (ع / EN), theme, notifications.
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
  const Sep = isAr ? ChevronLeft : ChevronRight
  const PanelIcon = isAr ? PanelRight : PanelLeft

  return (
    <header className="sticky top-0 z-40 h-20 shrink-0">
      <div className="flex h-full items-center gap-4 px-4 md:px-10">
        <IconTile
          label={isAr ? "القائمة الجانبية" : "Side bar"}
          onClick={() => (isDesktop ? setSidebarCollapsed((c) => !c) : onOpenMobileNav?.())}
        >
          {isDesktop ? <PanelIcon className="size-[18px]" strokeWidth={1.6} /> : <Menu className="size-[18px]" strokeWidth={1.6} />}
        </IconTile>

        <div className="min-w-0 flex-1">
          {crumbs && crumbs.length > 0 && (
            <nav aria-label={isAr ? "مسار التنقل" : "Breadcrumb"} className="mb-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
              {crumbs.map((c, i) => (
                <React.Fragment key={i}>
                  {c.to ? (
                    <Link to={c.to} className="truncate hover:text-foreground">
                      {c.label}
                    </Link>
                  ) : (
                    <span className="truncate">{c.label}</span>
                  )}
                  <Sep className="size-3 shrink-0 opacity-60" aria-hidden />
                </React.Fragment>
              ))}
              <span className="truncate text-foreground/80">{title}</span>
            </nav>
          )}
          <h1 className="truncate text-[18px] font-bold leading-tight text-foreground">{title ?? ""}</h1>
        </div>

        <InlineSearch isAr={isAr} onOpenFullPalette={() => setCommandOpen(true)} />

        <div className="flex items-center gap-4">
          {/* wrapper owns the breakpoint: .icon-tile sets its own display */}
          <span className="contents md:hidden">
            <IconTile label={isAr ? "بحث" : "Search"} onClick={() => setCommandOpen(true)}>
              <Search className="size-[18px]" strokeWidth={1.6} />
            </IconTile>
          </span>

          <IconTile label={isAr ? "المساعد الشخصي" : "Personal assistant"} onClick={() => setAiPanelOpen((o) => !o)}>
            <Sparkles className="size-[18px]" strokeWidth={1.6} />
          </IconTile>

          <IconTile
            label={isAr ? "التبديل للإنجليزية" : "Switch to Arabic"}
            onClick={() => setLocale(isAr ? "en" : "ar")}
            className="text-[15px] font-semibold"
          >
            {/* Figma: the tile shows the active language ("ع" in Arabic) */}
            {isAr ? "ع" : "EN"}
          </IconTile>

          <IconTile
            label={isAr ? "المظهر" : "Theme"}
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            disabled={!mounted}
          >
            {!mounted || resolvedTheme === "dark" ? (
              <Moon className="size-[18px]" strokeWidth={1.6} />
            ) : (
              <Sun className="size-[18px]" strokeWidth={1.6} />
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
            className={cn(
              "icon-tile size-9 shrink-0 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
              className,
            )}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
