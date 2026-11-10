import * as React from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

import { Tooltip, TooltipContent, TooltipTrigger } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import {
  markAllNotificationsRead, markNotificationRead, useNotifications,
  type Notification, type NotificationKind,
} from "@reach/shared-mocks"
import { TopBellIcon } from "@/components/layout/shell-icons"
import { Bell, CalendarDays, GraduationCap, History, Plane, ReceiptText, Sparkles, Wallet } from "lucide-react"

const notificationIcon: Record<NotificationKind, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  leave: Plane,
  expense: ReceiptText,
  meeting: CalendarDays,
  recognition: Sparkles,
  shift: CalendarDays,
  payslip: Wallet,
  course: GraduationCap,
  system: Bell,
}

/** Shared 4px scroll track from the Figma lists. */
const thinScroll =
  "[&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:rounded-[2px] [&::-webkit-scrollbar-track]:bg-secondary [&::-webkit-scrollbar-thumb]:rounded-[2px] [&::-webkit-scrollbar-thumb]:bg-foreground/85"

/**
 * Notifications dropdown — Figma "Notification" 2146:4876 (drawn light) and its
 * dark use on the homepage 2146:3946. 509px card, padding 20/18, radius 12,
 * theme tokens so it reads correctly in both modes.
 */
export function InlineNotifications({ isAr }: { isAr: boolean }) {
  const all = useNotifications()
  const navigate = useNavigate()
  // ?notifications=1 opens the dropdown (pixel check of 2146:3946)
  const [open, setOpen] = React.useState(() => new URLSearchParams(window.location.search + "&" + (window.location.hash.split("?")[1] ?? "")).has("notifications"))
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const t = (en: string, ar: string) => (isAr ? ar : en)

  const items = all.filter((n) => !n.archived)
  const unreadCount = items.filter((n) => n.unread).length

  React.useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    document.addEventListener("mousedown", onClick)
    document.addEventListener("keydown", onEsc)
    return () => {
      document.removeEventListener("mousedown", onClick)
      document.removeEventListener("keydown", onEsc)
    }
  }, [open])

  const openItem = (n: Notification) => {
    markNotificationRead(n.id)
    setOpen(false)
    if (n.to) navigate(n.to)
  }

  return (
    <div ref={containerRef} className="relative">
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              className={cn(
                // Figma top-bar tile: 34px, Page/Fill, radius 8 (same as TopBar tiles)
                "relative inline-flex size-[34px] shrink-0 items-center justify-center rounded-lg bg-background text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                open && "text-primary ring-1 ring-primary/40",
              )}
              onClick={() => setOpen((v) => !v)}
              aria-label={t("Notifications", "التنبيهات")}
              aria-expanded={open}
            />
          }
        >
          <TopBellIcon className="size-4" />
          {/* Figma: a 5.7px glowing gold dot on the bell (left 20, top 8.1), no count */}
          {unreadCount > 0 && (
            <span
              aria-label={isAr ? `${unreadCount} غير مقروءة` : `${unreadCount} unread`}
              className="absolute top-[8.13px] left-[20px] size-[5.745px] rounded-full bg-primary shadow-[0_0_4.085px_0_var(--primary)]"
            />
          )}
        </TooltipTrigger>
        <TooltipContent>{t("Notifications", "التنبيهات")}</TooltipContent>
      </Tooltip>

        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-label={t("Notifications", "التنبيهات")}
            className="absolute -end-4 top-full z-50 mt-3 flex w-[min(509px,calc(100vw-24px))] flex-col gap-2 rounded-xl bg-popover px-[18px] py-5 dark:bg-[rgba(27,26,26,0.5)] dark:backdrop-blur-xl text-popover-foreground shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)] ring-1 ring-border"
          >
            {/* header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="relative">
                    <Bell className="size-4 text-primary" strokeWidth={1.8} />
                    {unreadCount > 0 && <span className="absolute -end-0.5 -top-0.5 size-1.5 rounded-full bg-error" />}
                  </span>
                  <span className="text-[17px] font-medium leading-[25.5px]">{t("Notifications", "التنبيهات")}</span>
                </div>
                <span className="block h-[3px] w-12 rounded-[2px] bg-primary" />
              </div>
              <button
                type="button"
                onClick={markAllNotificationsRead}
                disabled={unreadCount === 0}
                className="text-[12px] font-bold text-primary underline underline-offset-2 transition-opacity hover:opacity-80 disabled:cursor-default disabled:opacity-50"
              >
                {t("Mark all as read", "تحديد الكل كمقروء")}
              </button>
            </div>

            {/* list */}
            <div className={cn("max-h-[392px] overflow-y-scroll pb-6 pe-4 pt-3", thinScroll)}>
              {items.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                  <Bell className="size-5 text-primary" strokeWidth={1.6} />
                  <span className="text-[13.5px]">{t("You're all caught up", "لا توجد تنبيهات جديدة")}</span>
                </div>
              ) : (
                <>
                  <ul>
                    {items.map((n, i) => (
                      <li key={n.id}>
                        <NotificationRow n={n} isAr={isAr} onOpen={openItem} last={i === items.length - 1} />
                      </li>
                    ))}
                  </ul>
                  {/* Figma 2146:4876 end-of-list note */}
                  <div className="flex flex-col items-center gap-2 pt-6 pb-2 text-center">
                    <History className="size-5 text-primary" strokeWidth={1.8} />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[13.5px] leading-[21px] text-foreground">{t("You've reached the end of the list", "وصلت إلى نهاية القائمة")}</span>
                      <span className="text-[12.5px] leading-[19px] text-muted-foreground">{t("No older notifications", "لا توجد إشعارات أقدم من ذلك")}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setOpen(false); navigate("/notifications") }}
                      className="text-[12px] font-medium text-primary underline underline-offset-2 hover:opacity-80"
                    >
                      {t("Notification History", "سجل التنبيهات")}
                    </button>
                  </div>
                </>
              )}
            </div>

          </motion.div>
        )}
    </div>
  )
}

function NotificationRow({
  n, isAr, onOpen, last,
}: {
  n: Notification
  isAr: boolean
  onOpen: (n: Notification) => void
  last?: boolean
}) {
  const Icon = notificationIcon[n.category] ?? Bell
  // Figma 2146:4876 row (58.25): py 8 · 32px icon disc · 20px unread-dot column ·
  // title 13.5/20.25 + body 12.5/18.75 (2 apart) · time 12/18 at the end.
  return (
    <button
      type="button"
      onClick={() => onOpen(n)}
      className={cn(
        "flex w-full items-center py-2 text-start transition-colors hover:bg-soft-accent/40",
        !last && "border-b border-input",
      )}
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-foreground">
        <Icon className="size-[13px]" strokeWidth={1.8} />
      </span>
      <span className="flex w-5 shrink-0 justify-center self-start pt-[7px]">
        {n.unread && <span className="size-1.5 rounded-full bg-primary" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] leading-[20.25px] text-foreground">{isAr ? n.titleAr : n.title}</span>
        <span className="mt-0.5 block truncate text-[12.5px] leading-[18.75px] text-muted-foreground">{isAr ? n.bodyAr : n.body}</span>
      </span>
      <span className="shrink-0 text-[12px] leading-[18px] text-muted-foreground">{isAr ? n.timeAr : n.time}</span>
    </button>
  )
}
