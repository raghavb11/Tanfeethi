import * as React from "react"
import { Button, Card } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import { AlertTriangle, Check, Clock, LogIn, LogOut, MapPin } from "lucide-react"

import {
  arNum, clockIn, clockOut, dayStatus, hm, hmLong, hoursWord, lateBy, nowTime,
  remainingMinutes, SHIFT_START, useClock, workedMinutes,
} from "../data/mock/clock"

/** Clock in or out, with a confirmation first — it writes to the attendance
 *  record, and clocking out early is worth catching before it is filed.
 *  Before the day starts it says so, rather than showing a bare button. */
export function ClockAction({ size = "sm" }: { size?: "sm" | "default" }) {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)

  const clock = useClock()
  const status = dayStatus(clock)
  const worked = workedMinutes(clock)
  const remaining = remainingMinutes(clock)

  const [confirming, setConfirming] = React.useState(false)
  const [done, setDone] = React.useState<"in" | "out" | null>(null)
  const [at, setAt] = React.useState(nowTime())

  const action: "in" | "out" = status === "working" ? "out" : "in"
  const early = action === "out" && remaining > 0
  const late = lateBy(at)

  const open = () => { setAt(nowTime()); setConfirming(true) }
  const commit = () => {
    if (action === "out") clockOut()
    else clockIn()
    setConfirming(false)
    setDone(action)
    window.setTimeout(() => setDone(null), 3000)
  }

  return (
    <div className="w-full">
      {/* the day has not started — say so before offering the button */}
      {status === "not-started" && !confirming && (
        <div className="mb-3 flex flex-wrap items-start gap-2.5 rounded-xl border border-amber-500/35 bg-amber-500/[0.07] p-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold">
              {t("You haven't clocked in today", "لم تسجّل حضورك اليوم")}
            </p>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              {lateBy() > 0
                ? t(`The working day started at ${SHIFT_START} — that is ${hmLong(lateBy())} ago. Nothing is on your record until you clock in.`,
                     `بدأ يوم العمل الساعة ${arNum(SHIFT_START)} — أي قبل ${hmLong(lateBy(), true)}. لن يُسجَّل شيء حتى تسجّل حضورك.`)
                : t(`The working day starts at ${SHIFT_START}. Nothing is on your record until you clock in.`,
                     `يبدأ يوم العمل الساعة ${arNum(SHIFT_START)}. لن يُسجَّل شيء حتى تسجّل حضورك.`)}
            </p>
          </div>
        </div>
      )}

      {status === "done" && !confirming && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-muted/25 p-3 text-[12.5px]">
          <Check className="size-4 shrink-0 text-emerald-500" />
          <span className="font-medium">
            {t(`Day closed — ${clock.checkIn} to ${clock.checkOut}`,
               `انتهى اليوم — من ${arNum(clock.checkIn ?? "")} إلى ${arNum(clock.checkOut ?? "")}`)}
          </span>
          <span className="text-muted-foreground">· {hm(worked, isAr)}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button size={size} className="gap-1.5" onClick={open}>
          {action === "out" ? <LogOut className="size-3.5" /> : <LogIn className="size-3.5" />}
          {action === "out"
            ? t("Clock out", "تسجيل انصراف")
            : status === "done" ? t("Clock in again", "تسجيل حضور مرة أخرى") : t("Clock in", "تسجيل حضور")}
        </Button>

        {done && (
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">
            <Check className="size-3.5" />
            {done === "out"
              ? t(`Clocked out at ${clock.checkOut}`, `تم تسجيل الانصراف ${arNum(clock.checkOut ?? "")}`)
              : t(`Clocked in at ${clock.checkIn}`, `تم تسجيل الحضور ${arNum(clock.checkIn ?? "")}`)}
          </span>
        )}
      </div>

      {/* nothing is recorded until this is confirmed */}
      {confirming && (
        <Card className={cn("mt-3 p-3.5", early || (action === "in" && late > 0)
          ? "border-amber-500/35 bg-amber-500/[0.06]"
          : "border-primary/30 bg-primary/[0.04]")}>
          <p className="text-[13px] font-semibold">
            {action === "out"
              ? t(`Clock out at ${at}?`, `تسجيل الانصراف الساعة ${arNum(at)}؟`)
              : t(`Clock in at ${at}?`, `تسجيل الحضور الساعة ${arNum(at)}؟`)}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" />{isAr ? clock.locationAr : clock.location}
            </span>
            {action === "out" && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5" />
                {t(`${hm(worked)} worked today`, `عمل اليوم ${hm(worked, true)}`)}
              </span>
            )}
          </div>

          {early && (
            <p className="mt-2 flex items-start gap-2 text-[12px] font-medium text-amber-600 dark:text-amber-400">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              {t(`That is ${hmLong(remaining)} short of your ${clock.targetHours}-hour day. The shortfall goes on your record and your manager sees it.`,
                 `هذا أقل بـ${hmLong(remaining, true)} من يوم العمل (${hoursWord(clock.targetHours, true)}). سيظهر النقص في سجلك ويطّلع عليه مديرك.`)}
            </p>
          )}

          {action === "in" && late > 0 && (
            <p className="mt-2 flex items-start gap-2 text-[12px] font-medium text-amber-600 dark:text-amber-400">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              {t(`That is ${hmLong(late)} after the ${SHIFT_START} start, so the day is recorded as late.`,
                 `هذا بعد ${hmLong(late, true)} من بداية الدوام (${arNum(SHIFT_START)})، وسيُسجَّل اليوم كتأخير.`)}
            </p>
          )}

          {action === "out" && !early && (
            <p className="mt-2 text-[12px] text-muted-foreground">
              {t("Your day is complete. The record is filed against today's date.",
                 "اكتمل يومك، وسيُسجَّل ذلك بتاريخ اليوم.")}
            </p>
          )}
          {action === "in" && (
            <p className="mt-2 text-[12px] text-muted-foreground">
              {t("The time is taken from now and cannot be edited afterwards — ask your manager to correct a wrong entry.",
                 "يُؤخذ الوقت من الآن ولا يمكن تعديله لاحقًا — راجع مديرك لتصحيح أي إدخال خاطئ.")}
            </p>
          )}

          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setConfirming(false)}>{t("Cancel", "إلغاء")}</Button>
            <Button size="sm" onClick={commit}>
              <Check className="size-3.5" />
              {action === "out"
                ? (early ? t("Clock out anyway", "سجّل الانصراف على أي حال") : t("Yes, clock out", "نعم، سجّل الانصراف"))
                : t("Yes, clock in", "نعم، سجّل الحضور")}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
