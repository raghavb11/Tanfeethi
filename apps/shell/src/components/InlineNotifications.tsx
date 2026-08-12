import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"

import { Button, Tooltip, TooltipContent, TooltipTrigger } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { notifications as items } from "@reach/shared-mocks"
import { Bell, BriefcaseBusiness, CheckCheck, Flame, Shield, Sparkles } from "lucide-react"

type Category = "security" | "ai" | "operations" | "employee"

const categoryIcon: Record<Category, React.ComponentType<{ className?: string }>> = {
  security: Shield,
  ai: Sparkles,
  operations: Flame,
  employee: BriefcaseBusiness,
}

const categoryTone: Record<Category, string> = {
  security: "bg-rose-500/12 text-rose-500",
  ai: "bg-primary/15 text-primary",
  operations: "bg-amber-500/12 text-amber-500",
  employee: "bg-emerald-500/12 text-emerald-500",
}

const PANEL_WIDTH = 380
const VIEWPORT_MARGIN = 12

export function InlineNotifications({ isAr }: { isAr: boolean }) {
  const [open, setOpen] = React.useState(false)
  const [readIds, setReadIds] = React.useState<Set<string>>(new Set())
  const [alignRight, setAlignRight] = React.useState(true)
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const triggerRef = React.useRef<HTMLButtonElement | null>(null)

  const computed = React.useMemo(
    () => items.map((n) => ({ ...n, unread: n.unread && !readIds.has(n.id) })),
    [readIds],
  )
  const unreadCount = computed.filter((n) => n.unread).length

  // Decide which side has more room (in viewport coords, irrespective of locale)
  const computeAlignment = React.useCallback(() => {
    const btn = triggerRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const vw = window.innerWidth
    const spaceLeft = rect.right
    const spaceRight = vw - rect.left
    // If anchoring to right edge of button (panel grows to the left) fits, prefer it.
    // Otherwise anchor to left edge (panel grows right). Whichever has more room wins.
    const fitsRightAnchored = spaceLeft >= PANEL_WIDTH + VIEWPORT_MARGIN
    const fitsLeftAnchored = spaceRight >= PANEL_WIDTH + VIEWPORT_MARGIN
    if (fitsRightAnchored && !fitsLeftAnchored) setAlignRight(true)
    else if (!fitsRightAnchored && fitsLeftAnchored) setAlignRight(false)
    else setAlignRight(spaceLeft >= spaceRight)
  }, [])

  React.useEffect(() => {
    if (!open) return
    computeAlignment()
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    const onResize = () => computeAlignment()
    document.addEventListener("mousedown", onClick)
    document.addEventListener("keydown", onEsc)
    window.addEventListener("resize", onResize)
    return () => {
      document.removeEventListener("mousedown", onClick)
      document.removeEventListener("keydown", onEsc)
      window.removeEventListener("resize", onResize)
    }
  }, [open, computeAlignment])

  const markAllRead = () => {
    setReadIds(new Set(items.map((n) => n.id)))
  }

  return (
    <div ref={containerRef} className="relative">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              ref={triggerRef}
              variant="outline"
              size="icon-sm"
              className={cn("relative overflow-visible", open && "border-primary/40 bg-primary/5")}
              onClick={() => setOpen((v) => !v)}
              aria-label={isAr ? "الإشعارات" : "Notifications"}
              aria-expanded={open}
            >
              <Bell className="size-4" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="absolute -top-1 -right-1 flex min-w-[16px] h-[16px] px-1 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground ring-1 ring-background tabular-nums"
                >
                  {unreadCount}
                </motion.span>
              )}
            </Button>
          }
        />
        <TooltipContent>{isAr ? "الإشعارات" : "Notifications"}</TooltipContent>
      </Tooltip>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            style={{ width: PANEL_WIDTH, ...(alignRight ? { right: 0 } : { left: 0 }) }}
            className={cn(
              "absolute top-full z-50 mt-2",
              "rounded-2xl border border-border/70 bg-popover shadow-2xl shadow-black/20 ring-1 ring-black/5 dark:ring-white/5",
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Bell className="size-3.5 text-primary" />
                  <div className="text-[13px] font-semibold">
                    {isAr ? "الإشعارات" : "Notifications"}
                  </div>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-primary/15 px-1.5 text-[10px] font-bold text-primary">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 truncate text-[11px] text-muted-foreground/70">
                  {isAr
                    ? "إشارات تشغيلية وتحديثات من المساعد"
                    : "Operational signals & assistant updates"}
                </div>
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-primary/10"
                >
                  <CheckCheck className="size-3" />
                  {isAr ? "تعليم الكل كمقروء" : "Mark all read"}
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[420px] overflow-y-auto py-1.5">
              {computed.length === 0 ? (
                <div className="px-4 py-10 text-center text-[12px] text-muted-foreground/60">
                  {isAr ? "ما فيه إشعارات" : "You're all caught up"}
                </div>
              ) : (
                <ul className="space-y-0.5 px-1.5">
                  {computed.map((n, idx) => {
                    const Icon = categoryIcon[n.category as Category] ?? Bell
                    const tone = categoryTone[n.category as Category] ?? "bg-muted text-muted-foreground"
                    return (
                      <motion.li
                        key={n.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.16, delay: idx * 0.04 }}
                        className={cn(
                          "group relative flex cursor-pointer gap-3 rounded-xl px-2.5 py-2.5 transition-colors",
                          n.unread ? "bg-primary/[0.04] hover:bg-primary/[0.08]" : "hover:bg-muted/50",
                        )}
                        onClick={() => setReadIds((s) => new Set(s).add(n.id))}
                      >
                        {/* Unread indicator */}
                        {n.unread && (
                          <motion.span
                            layoutId={`dot-${n.id}`}
                            className="absolute start-1 top-3.5 size-1.5 rounded-full bg-primary"
                          />
                        )}

                        {/* Category icon */}
                        <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", tone)}>
                          <Icon className="size-3.5" />
                        </span>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <span className={cn(
                              "truncate text-[12px]",
                              n.unread ? "font-semibold text-foreground" : "font-medium text-foreground/80",
                            )}>
                              {isAr ? n.titleAr : n.title}
                            </span>
                            <span className="shrink-0 text-[10px] text-muted-foreground/55">
                              {isAr ? n.timeAr : n.time}
                            </span>
                          </div>
                          <p className={cn(
                            "mt-0.5 line-clamp-2 text-[11.5px] leading-snug",
                            n.unread ? "text-muted-foreground" : "text-muted-foreground/70",
                          )}>
                            {isAr ? n.bodyAr : n.body}
                          </p>
                        </div>
                      </motion.li>
                    )
                  })}
                </ul>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border/60 bg-muted/20 px-4 py-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full rounded-md py-1.5 text-center text-[11.5px] font-medium text-primary transition-colors hover:bg-primary/10"
              >
                {isAr ? "عرض كل الإشعارات" : "View all notifications"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
