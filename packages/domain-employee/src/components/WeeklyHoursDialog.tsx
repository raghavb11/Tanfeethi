import { Dialog, DialogClose, DialogContent, DialogTitle } from "@reach/shared-ui"
import { useShell } from "@reach/shell-context"
import { BriefcaseBusiness, Clock, X } from "lucide-react"

import { DAY_TARGET_MIN, WEEK } from "../data/mock/hub"
import { useClock, workedMinutes } from "../data/mock/clock"
import { Bar, CardTitle, hmWords } from "./wijha"

/** Briefcase with a small violet clock — the Figma "hours" glyph. */
export function HoursGlyph({ className = "size-7" }: { className?: string }) {
  return (
    <span className={`relative inline-grid shrink-0 place-items-center ${className}`}>
      <BriefcaseBusiness className="size-full text-primary" strokeWidth={1.6} />
      <span className="absolute -bottom-0.5 -end-0.5 grid size-[55%] place-items-center rounded-full bg-[#a997c7] ring-2 ring-[var(--popover)]">
        <Clock className="size-[70%] text-background" strokeWidth={2.4} />
      </span>
    </span>
  )
}

/** Popup 3063:8507 — "دوامك لهذا الأسبوع": worked vs target per working day. */
export function WeeklyHoursDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const clock = useClock()
  const today = workedMinutes(clock)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        dir={isAr ? "rtl" : "ltr"}
        className="max-h-[90svh] gap-0 overflow-hidden rounded-2xl bg-popover p-0 ring-1 ring-border sm:max-w-[378px]"
      >
        <div className="flex items-start justify-between gap-3 px-4 pb-4 pt-5">
          <DialogTitle className="sr-only">{t("Your hours this week", "دوامك لهذا الأسبوع")}</DialogTitle>
          <CardTitle icon={() => <HoursGlyph className="size-[18px]" />} title={t("Your hours this week", "دوامك لهذا الأسبوع")} />
          <DialogClose className="grid size-8 place-items-center rounded-lg text-foreground transition-colors hover:bg-secondary" aria-label={t("Close", "إغلاق")}>
            <X className="size-5" />
          </DialogClose>
        </div>

        <div className="max-h-[calc(90svh-80px)] space-y-2.5 overflow-y-auto px-4 pb-4">
          {WEEK.map((d) => {
            const min = d.isToday ? today : d.minutes ?? 0
            const pct = (min / DAY_TARGET_MIN) * 100
            const full = min >= DAY_TARGET_MIN - 30
            return (
              <div key={d.id} className="rounded-xl bg-background p-4">
                <div className="flex items-start gap-3">
                  <HoursGlyph className="mt-0.5 size-7" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-1.5">
                      {d.upcoming ? (
                        <span className="text-[17px] font-medium text-muted-foreground">{t("Not started", "لم يبدأ بعد")}</span>
                      ) : (
                        <>
                          <span className="text-[17px] font-medium">{hmWords(min, isAr)}</span>
                          <span className="text-[13px] text-muted-foreground">/ <b className="font-semibold">{hmWords(DAY_TARGET_MIN, isAr)}</b></span>
                        </>
                      )}
                    </div>
                    <div className="mt-1 text-[12.5px] text-muted-foreground">
                      {isAr ? d.dayAr : d.day}{d.isToday && ` · ${t("today", "اليوم")}`}
                    </div>
                  </div>
                </div>
                <Bar className="mt-3" value={d.upcoming ? 0 : pct} tone={full ? "success" : "warning"} />
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
