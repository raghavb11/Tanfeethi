import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

import { cn } from "@reach/shared-core"
import {
  markNotificationRead, notificationSources, removeNotification, useNotifications,
  type Notification, type NotificationSource,
} from "@reach/shared-mocks"
import { useShell } from "@reach/shell-context"
import { Bell, ChevronDown, ExternalLink, Eye, EyeOff, Trash2 } from "lucide-react"

import { ConfirmDeleteDialog } from "./shell-dialogs"

type Filter = NotificationSource | "all"

/**
 * Notification History — Figma "Wijha - Notification History - Dark" (4693:23706).
 * One card: bell + title with the gold underline, a category filter
 * (التصنيف), and the log table — No. · From · Date · Text · view / delete.
 * Route: /notifications (breadcrumb Home › Notification history).
 */
export default function NotificationHistory() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const all = useNotifications()
  const [filter, setFilter] = React.useState<Filter>("system")
  const [openId, setOpenId] = React.useState<string | null>(null)
  const [deleting, setDeleting] = React.useState<Notification | null>(null)

  const rows = all.filter((n) => filter === "all" || n.source === filter)
  const sourceLabel = (s: NotificationSource) => {
    const m = notificationSources.find((x) => x.id === s)
    return m ? (isAr ? m.ar : m.en) : s
  }

  const toggle = (n: Notification) => {
    setOpenId((id) => (id === n.id ? null : n.id))
    markNotificationRead(n.id)
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 pb-10 pt-6 md:px-10 md:pt-8">
      <section className="panel flex flex-col gap-6 rounded-xl px-4 py-5 md:px-6" aria-label={t("Notification History", "سجل التنبيهات")}>
        {/* header */}
        <div className="flex flex-col gap-2 self-start">
          <h2 className="flex items-center gap-2 text-[17px] font-medium leading-[25.5px]">
            <Bell className="size-4 text-primary" strokeWidth={1.8} />
            {t("Notification History", "سجل التنبيهات")}
          </h2>
          <span className="block h-[3px] w-full rounded-[2px] bg-primary" />
        </div>

        {/* category filter */}
        <label className="relative flex h-9 w-full max-w-[224px] items-center gap-2 rounded-lg bg-background pe-8 ps-3">
          <span className="shrink-0 text-[11px] text-muted-foreground">{t("Category", "التصنيف")}</span>
          <select
            value={filter}
            onChange={(e) => { setFilter(e.target.value as Filter); setOpenId(null) }}
            className="min-w-0 flex-1 cursor-pointer appearance-none bg-transparent text-[12.5px] font-medium text-foreground outline-none [&>option]:bg-popover"
          >
            <option value="all">{t("All notifications", "جميع التنبيهات")}</option>
            {notificationSources.map((s) => (
              <option key={s.id} value={s.id}>{isAr ? s.ar : s.en}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute end-3 size-3.5 text-foreground" strokeWidth={1.8} />
        </label>

        {/* table — scrolls inside its own box on narrow screens */}
        <div className="-mx-1 overflow-x-auto px-1">
          <table className="w-full min-w-[640px] border-collapse text-start">
            <thead>
              <tr className="border-b border-input text-[12px] text-muted-foreground">
                <th scope="col" className="w-14 py-2.5 pe-4 text-start font-normal">{t("No.", "ترقيم")}</th>
                <th scope="col" className="w-[200px] py-2.5 pe-4 text-start font-normal">{t("From", "من")}</th>
                <th scope="col" className="w-[200px] py-2.5 pe-4 text-start font-normal">{t("Date", "تاريخ")}</th>
                <th scope="col" className="py-2.5 pe-4 text-start font-normal">{t("Notification Text", "نص التنبيه")}</th>
                <th scope="col" className="w-[96px] py-2.5"><span className="sr-only">{t("Actions", "الإجراءات")}</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((n, i) => {
                const expanded = openId === n.id
                return (
                  <React.Fragment key={n.id}>
                    <tr className={cn("text-[13px] text-foreground", !expanded && "border-b border-input")}>
                      <td className="h-[63px] pe-4 tabular-nums">{i + 1}</td>
                      <td className="pe-4">{sourceLabel(n.source)}</td>
                      <td className="pe-4 tabular-nums" dir="ltr" style={{ textAlign: isAr ? "right" : "left" }}>{n.date}</td>
                      <td className="pe-4">
                        <span className="flex items-center gap-2">
                          {n.unread && <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-label={t("Unread", "غير مقروء")} />}
                          <span className="line-clamp-1">{isAr ? n.titleAr : n.title}</span>
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => toggle(n)}
                            aria-expanded={expanded}
                            aria-label={expanded ? t("Hide", "إخفاء") : t("View", "عرض")}
                            title={expanded ? t("Hide", "إخفاء") : t("View", "عرض")}
                            className="grid size-8 place-items-center rounded-lg border border-input text-foreground transition-colors hover:border-primary/50 hover:text-primary"
                          >
                            {expanded ? <EyeOff className="size-4" strokeWidth={1.6} /> : <Eye className="size-4" strokeWidth={1.6} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleting(n)}
                            aria-label={t("Delete", "حذف")}
                            title={t("Delete", "حذف")}
                            className="grid size-8 place-items-center rounded-lg border border-input text-error transition-colors hover:border-error/60 hover:bg-error-fill"
                          >
                            <Trash2 className="size-4" strokeWidth={1.6} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    <AnimatePresence initial={false}>
                      {expanded && (
                        <tr className="border-b border-input">
                          <td colSpan={5} className="p-0">
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.18 }}
                              className="overflow-hidden"
                            >
                              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-background px-4 py-3">
                                <p className="text-[13px] text-muted-foreground">{isAr ? n.bodyAr : n.body}</p>
                                {n.to && (
                                  <button type="button" onClick={() => navigate(n.to!)} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-primary hover:underline">
                                    <ExternalLink className="size-3.5" strokeWidth={1.8} />
                                    {t("Open", "فتح")}
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>

          {rows.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-14 text-center">
              <Bell className="size-5 text-primary" strokeWidth={1.6} />
              <span className="text-[13.5px] text-foreground">{t("No notifications here", "لا توجد تنبيهات")}</span>
              <span className="text-[12.5px] text-muted-foreground">
                {t("Notifications in this category will appear here.", "ستظهر هنا التنبيهات الخاصة بهذا التصنيف.")}
              </span>
            </div>
          )}
        </div>
      </section>

      <ConfirmDeleteDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => { if (deleting) removeNotification(deleting.id) }}
        isAr={isAr}
        title={t("Delete this notification?", "هل تريد حذف هذا التنبيه؟")}
        body={t(
          "The notification will be permanently removed from the log. This action cannot be undone.",
          "سيُحذف التنبيه نهائيًا من السجل، ولا يمكن التراجع عن هذا الإجراء",
        )}
        confirmLabel={t("Delete notification", "حذف التنبيه")}
      />
    </div>
  )
}
