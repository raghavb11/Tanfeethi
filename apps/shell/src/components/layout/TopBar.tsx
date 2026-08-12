import * as React from "react"
import { useTheme } from "next-themes"
import { useNavigate } from "react-router-dom"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@reach/shared-ui"
import { useShell } from "@reach/shell-context"
import { useMediaQuery } from "@/hooks/use-media-query"
import { InlineSearch } from "@/components/InlineSearch"
import { InlineNotifications } from "@/components/InlineNotifications"
import { Menu, Moon, Search, ShieldCheck, Sparkles, Sun, UserRound } from "lucide-react"

const LANG_LABEL: Record<"en" | "ar", string> = { en: "EN", ar: "ع" }

export function TopBar({ title, onOpenMobileNav }: { title?: string; onOpenMobileNav?: () => void }) {
  const navigate = useNavigate()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    queueMicrotask(() => setMounted(true))
  }, [])
  const { setCommandOpen, setAiPanelOpen, locale, setLocale, role, setRole } = useShell()
  const isAr = locale === "ar"
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  return (
    <header className="sticky top-0 z-40 h-14 shrink-0 border-b border-border/60 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75">
      {/* Same container as the page content (mx-auto max-w-[1400px] px-4 md:px-8)
          so the title aligns with the page heading at every width. */}
      <div className="mx-auto flex h-full max-w-[1400px] items-center gap-2.5 px-4 md:px-8">
      <Button
        variant="outline"
        size="icon-sm"
        onClick={onOpenMobileNav}
        aria-label="Open menu"
        className="lg:hidden"
      >
        <Menu className="size-4" />
      </Button>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-semibold tracking-tight text-foreground">{title ?? ""}</div>
      </div>

      <InlineSearch isAr={locale === "ar"} onOpenFullPalette={() => setCommandOpen(true)} />

      <Button variant="outline" size="icon-sm" className="md:hidden" onClick={() => setCommandOpen(true)} aria-label="Search">
        <Search className="size-4" />
      </Button>

      {!isDesktop && (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="outline" size="icon-sm" onClick={() => setAiPanelOpen(true)} aria-label="Ask Reach">
                <Sparkles className="size-4 text-primary" />
              </Button>
            }
          />
          <TooltipContent>Ask Reach</TooltipContent>
        </Tooltip>
      )}

      <InlineNotifications isAr={locale === "ar"} />

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRole(role === "admin" ? "user" : "admin")}
              aria-label={role === "admin" ? "Switch to User role" : "Switch to Admin role"}
              aria-pressed={role === "admin"}
              className="gap-1.5 px-2.5 text-[12px] font-semibold"
            >
              {role === "admin" ? (
                <ShieldCheck className="size-3.5 text-primary" />
              ) : (
                <UserRound className="size-3.5" />
              )}
              <span className="hidden sm:inline">
                {role === "admin" ? (isAr ? "مدير" : "Admin") : (isAr ? "مستخدم" : "User")}
              </span>
            </Button>
          }
        />
        <TooltipContent>
          {role === "admin" ? "Viewing as Admin — switch to User" : "Viewing as User — switch to Admin"}
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setLocale(locale === "en" ? "ar" : "en")}
              aria-label="Switch language"
              className="font-semibold text-[12px]"
            >
              {LANG_LABEL[locale]}
            </Button>
          }
        />
        <TooltipContent>{locale === "en" ? "Switch to Arabic" : "التبديل للإنجليزية"}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              aria-label="Toggle light and dark theme"
              disabled={!mounted}
            >
              {!mounted ? (
                <Sun className="size-4 opacity-40" />
              ) : resolvedTheme === "dark" ? (
                <Moon className="size-4" />
              ) : (
                <Sun className="size-4" />
              )}
            </Button>
          }
        />
        <TooltipContent>Theme</TooltipContent>
      </Tooltip>

      <Button
        variant="ghost"
        size="icon-sm"
        className="rounded-full"
        aria-label={locale === "ar" ? "مركز الموظف — خالد" : "Employee Center — Khalid"}
        onClick={() => navigate("/employee")}
      >
        <Avatar className="size-8 ring-2 ring-border/60">
          <AvatarImage src="images/avatar-khalid.jpg" alt="" className="object-cover object-top" />
          <AvatarFallback className="bg-primary/15 text-primary text-xs font-bold">KH</AvatarFallback>
        </Avatar>
      </Button>
      </div>
    </header>
  )
}
