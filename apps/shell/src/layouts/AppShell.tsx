import * as React from "react"
import { motion } from "framer-motion"
import { Outlet, useLocation } from "react-router-dom"

import { CommandPalette } from "@/components/command-palette"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { AIAssistantPanel } from "@/components/layout/AIAssistantPanel"
import { Sidebar } from "@/components/layout/Sidebar"
import { TopBar } from "@/components/layout/TopBar"
import { railItemForPath } from "@/config/navigation"
import { intermediateCrumbs, titleForPath } from "@/config/page-titles"
import { useShell } from "@reach/shell-context"

/** Lightweight placeholder shown while a lazily-loaded domain chunk resolves. */
function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-live="polite">
      <span className="size-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
      <span className="sr-only">Loading…</span>
    </div>
  )
}

export function AppShell() {
  const location = useLocation()
  const { commandOpen, setCommandOpen, locale } = useShell()
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false)

  // Close mobile sidebar on route change — derive during render instead of
  // an effect to avoid a cascading re-render (react-hooks/set-state-in-effect).
  const [prevPath, setPrevPath] = React.useState(location.pathname)
  if (location.pathname !== prevPath) {
    setPrevPath(location.pathname)
    setMobileNavOpen(false)
  }

  // Per-module accent (Figma "Second Accent Color") — read by index.css.
  const railItem = railItemForPath(location.pathname)
  const module = railItem?.module ?? "home"
  React.useEffect(() => {
    document.documentElement.setAttribute("data-module", module)
  }, [module])

  // Breadcrumb: the owning rail section, unless we are on its landing page.
  const isAr = locale === "ar"
  const crumbs =
    railItem && railItem.path !== location.pathname
      ? [
          { label: isAr ? railItem.titleAr : railItem.title, to: railItem.path },
          ...intermediateCrumbs(location.pathname, locale),
        ]
      : undefined

  return (
    <div className="isolate flex h-svh bg-background text-foreground">
      <Sidebar mobileOpen={mobileNavOpen} onMobileOpenChange={setMobileNavOpen} />
      <div className="ambient-page flex min-w-0 flex-1 flex-col">
        <TopBar
          title={titleForPath(location.pathname, locale)}
          crumbs={crumbs}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />
        <main className="relative min-h-0 flex-1 overflow-y-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-full"
          >
            <ErrorBoundary label={location.pathname}>
              <React.Suspense fallback={<PageFallback />}>
                <Outlet />
              </React.Suspense>
            </ErrorBoundary>
          </motion.div>
        </main>
      </div>
      <AIAssistantPanel />
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  )
}
