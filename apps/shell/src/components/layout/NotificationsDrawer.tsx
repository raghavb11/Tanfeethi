import { useNavigate } from "react-router-dom"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { markAllNotificationsRead, markNotificationRead, useNotifications } from "@reach/shared-mocks"
import { useShell } from "@reach/shell-context"

/**
 * Small-screen notifications sheet — same content as the Figma dropdown
 * (2146:4876) for when there is no room for the 509px panel.
 */
export function NotificationsDrawer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const items = useNotifications().filter((n) => !n.archived)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={isAr ? "left" : "right"} className="flex w-full flex-col gap-0 bg-popover p-0 sm:max-w-[509px]">
        <SheetHeader className="flex-row items-start justify-between gap-3 px-[18px] pb-2 pt-5 text-start">
          <div className="flex flex-col gap-2">
            <SheetTitle className="text-[17px] font-medium">{t("Notifications", "التنبيهات")}</SheetTitle>
            <span className="block h-[3px] w-12 rounded-[2px] bg-primary" />
            <SheetDescription className="sr-only">{t("Your latest notifications", "أحدث التنبيهات")}</SheetDescription>
          </div>
          <button type="button" onClick={markAllNotificationsRead} className="me-8 text-[12px] font-bold text-primary underline underline-offset-2">
            {t("Mark all as read", "تحديد الكل كمقروء")}
          </button>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-[18px] pb-6">
          {items.map((n, i) => (
            <button
              key={n.id}
              type="button"
              onClick={() => { markNotificationRead(n.id); onOpenChange(false); if (n.to) navigate(n.to) }}
              className={cn("flex w-full items-start justify-between gap-3 py-3.5 text-start", i < items.length - 1 && "border-b border-input")}
            >
              <span className="min-w-0">
                <span className="flex items-center gap-2">
                  <span className="truncate text-[14.5px] text-foreground">{isAr ? n.titleAr : n.title}</span>
                  {n.unread && <span className="size-1.5 shrink-0 rounded-full bg-primary" />}
                </span>
                <span className="block text-[12.5px] text-muted-foreground">{isAr ? n.bodyAr : n.body}</span>
              </span>
              <span className="shrink-0 text-[12.5px] text-muted-foreground">{isAr ? n.timeAr : n.time}</span>
            </button>
          ))}
        </div>
        <div className="border-t border-input px-[18px] py-3">
          <button type="button" onClick={() => { onOpenChange(false); navigate("/notifications") }} className="text-[12px] font-medium text-primary">
            {t("Notification history", "سجل التنبيهات")}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
