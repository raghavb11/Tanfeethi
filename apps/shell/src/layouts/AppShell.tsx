import * as React from "react"
import { motion } from "framer-motion"
import { Outlet, useLocation } from "react-router-dom"

import { CommandPalette } from "@/components/command-palette"
import { AIAssistantPanel } from "@/components/layout/AIAssistantPanel"
import { Sidebar } from "@/components/layout/Sidebar"
import { TopBar } from "@/components/layout/TopBar"
import { titleForPath } from "@/config/page-titles"
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

  return (
    <div className="isolate flex h-svh bg-background text-foreground">
      <div className="app-grain" aria-hidden="true" />
      <div className="app-vignette" aria-hidden="true" />
      <Sidebar mobileOpen={mobileNavOpen} onMobileOpenChange={setMobileNavOpen} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          title={titleForPath(location.pathname, locale)}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />
        <main className="ambient-page relative min-h-0 flex-1 overflow-y-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-full"
          >
            <React.Suspense fallback={<PageFallback />}>
              <Outlet />
            </React.Suspense>
          </motion.div>
        </main>
      </div>
      <AIAssistantPanel />
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  )
}
