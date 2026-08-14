import * as React from "react"
import { motion } from "framer-motion"
import { Badge, Button, Card } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  CalendarClock, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock, Coffee,
  Download, Home, LogOut, MapPin, Plane, TrendingUp,
} from "lucide-react"

import { type AttendanceDay, DAYS, type DayKind, MONTH, monthStats, TODAY_DAY, today } from "../data/mock/attendance"

type Tab = "calendar" | "log"

const KIND_META: Record<DayKind, { label: string; ar: string; dot: string; cell: string }> = {
  present: { label: "Present", ar: "حاضر", dot: "bg-emerald-500", cell: "border-emerald-500/30 bg-emerald-500/[0.08]" },
  remote: { label: "Remote", ar: "عن بُعد", dot: "bg-violet-500", cell: "border-violet-500/30 bg-violet-500/[0.08]" },
  leave: { label: "Leave", ar: "إجازة", dot: "bg-amber-500", cell: "border-amber-500/30 bg-amber-500/[0.08]" },
  holiday: { label: "Holiday", ar: "عطلة", dot: "bg-sky-500", cell: "border-sky-500/30 bg-sky-500/[0.08]" },
  absent: { label: "Absent", ar: "غياب", dot: "bg-rose-500", cell: "border-rose-500/30 bg-rose-500/[0.08]" },
  weekend: { label: "Weekend", ar: "نهاية الأسبوع", dot: "bg-muted-foreground/30", cell: "border-border/50 bg-muted/30" },
  future: { label: "Upcoming", ar: "قادم", dot: "bg-muted-foreground/20", cell: "border-dashed border-border/60" },
}
const WEEK_HEADS = [
  { en: "Sun", ar: "الأحد" }, { en: "Mon", ar: "الإثنين" }, { en: "Tue", ar: "الثلاثاء" },
  { en: "Wed", ar: "الأربعاء" }, { en: "Thu", ar: "الخميس" }, { en: "Fri", ar: "الجمعة" }, { en: "Sat", ar: "السبت" },
]

export default function AttendancePage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const [tab, setTab] = React.useState<Tab>("calendar")
  const [selected, setSelected] = React.useState<AttendanceDay | null>(null)

  const s = monthStats()
  const targetMin = today.targetHours * 60
  const remainingMin = Math.max(0, targetMin - today.workedMinutes)
  const hm = (m: number) => (isAr ? `${Math.floor(m / 60)}س ${String(m % 60).padStart(2, "0")}د` : `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`)
  const dayProgress = Math.min(100, Math.round((today.workedMinutes / targetMin) * 100))

  // leading blanks so day 1 lands on its weekday column
  const lead = Array.from({ length: MONTH.firstWeekday }, (_, i) => i)
  // the log is a record of what already happened — nothing past today
  const logged = DAYS.filter((d) => d.day <= TODAY_DAY)
  /** "8.2h" in English, "٨٫٢ س" in Arabic. */
  const hrs = (n: number) => (isAr ? `${n} س` : `${n}h`)

  const th = "px-4 py-3 text-start text-[12px] font-medium text-muted-foreground"

  return (
    <main className="@container mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      {/* header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <CalendarClock className="size-5" />
            <span className="text-xs font-semibold uppercase tracking-[0.14em]">{t("Attendance", "الحضور")}</span>
          </div>
          <h1 className="mt-2 font-heading text-[28px] font-bold leading-tight tracking-tight sm:text-[32px]">{t("My attendance", "حضوري")}</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">{t("Your check-ins, hours and monthly record.", "تسجيلات الحضور والساعات والسجل الشهري.")}</p>
        </div>
        <Button variant="outline" size="lg" className="shrink-0 gap-1.5"><Download className="size-4" />{t("Export month", "تصدير الشهر")}</Button>
      </div>

      {/* today */}
      <Card className="mb-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/60">{t("Today", "اليوم")}</div>
            <div className="mt-0.5 text-[15px] font-semibold">{isAr ? today.dayLabelAr : today.dayLabel}</div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-500" />{t("Present", "حاضر")}
          </span>
        </div>

        <div className="mt-4 grid gap-3 @xl:grid-cols-4">
          <Tile icon={Clock} label={t("Check-in", "الحضور")} value={today.checkIn} sub={t("On time", "في الوقت")} tone="primary" />
          <Tile icon={LogOut} label={t("Check-out", "الانصراف")} value={today.checkOut ?? "—"} sub={today.checkOut ? "" : t("Still working", "ما زلت أعمل")} tone="muted" />
          <Tile icon={CheckCircle2} label={t("Worked", "ساعات العمل")} value={hm(today.workedMinutes)} sub={`${t("of", "من")} ${hrs(today.targetHours)}`} tone="emerald" />
          <Tile icon={CalendarClock} label={t("Remaining", "المتبقي")} value={hm(remainingMin)} sub={isAr ? today.locationAr : today.location} tone="amber" />
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{t("Today's progress", "تقدّم اليوم")}</span><span className="tabular-nums">{dayProgress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <motion.div initial={{ width: 0 }} animate={{ width: `${dayProgress}%` }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" className="gap-1.5"><LogOut className="size-3.5" />{t("Clock out", "تسجيل انصراف")}</Button>
            <Button size="sm" variant="outline" className="gap-1.5"><Coffee className="size-3.5" />{t("Take break", "استراحة")}</Button>
          </div>
        </div>
      </Card>

      {/* month stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 @2xl:grid-cols-3 @5xl:grid-cols-6">
        <Stat value={s.present} label={t("Present", "حضور")} tone="text-emerald-500" />
        <Stat value={s.remote} label={t("Remote", "عن بُعد")} tone="text-violet-500" />
        <Stat value={s.leave} label={t("Leave", "إجازة")} tone="text-amber-500" />
        <Stat value={s.late} label={t("Late", "تأخير")} tone="text-rose-500" />
        <Stat value={hrs(s.avg)} label={t("Avg / day", "متوسط/يوم")} tone="text-primary" />
        <Stat value={`${s.onTimePct}%`} label={t("On time", "الالتزام")} tone="text-primary" />
      </div>

      {/* tabs */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-border p-0.5">
          {([{ id: "calendar", label: "Calendar", ar: "التقويم", icon: CalendarDays }, { id: "log", label: "Daily log", ar: "السجل اليومي", icon: Clock }] as const).map((tb) => (
            <button key={tb.id} onClick={() => setTab(tb.id)} aria-pressed={tab === tb.id}
              className={cn("inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors", tab === tb.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
              <tb.icon className="size-4" />{isAr ? tb.ar : tb.label}
            </button>
          ))}
        </div>
        <div className="inline-flex items-center gap-2">
          <Button variant="outline" size="icon-sm" aria-label={t("Previous month", "الشهر السابق")}><ChevronLeft className={cn("size-4", isAr && "rotate-180")} /></Button>
          <span className="min-w-[9rem] text-center text-[13px] font-semibold">{isAr ? MONTH.labelAr : MONTH.label}</span>
          <Button variant="outline" size="icon-sm" aria-label={t("Next month", "الشهر التالي")} disabled><ChevronRight className={cn("size-4", isAr && "rotate-180")} /></Button>
        </div>
      </div>

      {/* ── CALENDAR ── */}
      {tab === "calendar" && (
        <Card className="p-4 sm:p-5">
          <div className="grid grid-cols-7 gap-1.5">
            {WEEK_HEADS.map((w) => (
              <div key={w.en} className="pb-1 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/60">{isAr ? w.ar : w.en}</div>
            ))}
            {lead.map((i) => <div key={`lead-${i}`} />)}
            {DAYS.map((d) => {
              const meta = KIND_META[d.kind]
              const isToday = d.day === TODAY_DAY
              return (
                <button key={d.date} onClick={() => setSelected(d)}
                  className={cn("relative flex min-h-[68px] flex-col items-start gap-1 rounded-xl border p-2 text-start transition-colors hover:border-primary/50",
                    meta.cell, isToday && "ring-2 ring-primary/40")}>
                  <span className={cn("text-[12px] font-semibold tabular-nums", isToday && "text-primary")}>{d.day}</span>
                  {d.hours != null && <span className="text-[10px] tabular-nums text-muted-foreground">{hrs(d.hours)}</span>}
                  {d.kind === "leave" && <Plane className="size-3 text-amber-500" />}
                  {d.kind === "holiday" && <CalendarDays className="size-3 text-sky-500" />}
                  {d.kind === "remote" && <Home className="size-3 text-violet-500" />}
                  {d.late && <span className="absolute end-1.5 top-1.5 size-1.5 rounded-full bg-rose-500" />}
                </button>
              )
            })}
          </div>

          {/* legend */}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-border/60 pt-3">
            {(["present", "remote", "leave", "holiday", "absent", "weekend"] as DayKind[]).map((k) => (
              <span key={k} className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className={cn("size-2 rounded-full", KIND_META[k].dot)} />{isAr ? KIND_META[k].ar : KIND_META[k].label}
              </span>
            ))}
            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"><span className="size-1.5 rounded-full bg-rose-500" />{t("Late arrival", "تأخر في الحضور")}</span>
          </div>

          {/* selected day */}
          {selected && (
            <div className="mt-4 rounded-xl border border-border bg-muted/20 p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-[13px] font-semibold">
                  {isAr ? selected.weekdayAr : selected.weekday} · {selected.day} {isAr ? MONTH.labelAr : MONTH.label}
                </div>
                <Badge variant="outline" className="text-[10px]">{isAr ? KIND_META[selected.kind].ar : KIND_META[selected.kind].label}</Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-muted-foreground">
                {selected.checkIn && <span className="inline-flex items-center gap-1.5"><Clock className="size-3.5" />{selected.checkIn} – {selected.checkOut ?? t("in progress", "جارٍ")}</span>}
                {selected.hours != null && <span>{hrs(selected.hours)}</span>}
                {selected.location && <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5" />{isAr ? selected.locationAr ?? selected.location : selected.location}</span>}
                {selected.late && <span className="text-rose-500">{t("Late arrival", "تأخر في الحضور")}</span>}
                {selected.note && <span>{isAr ? selected.noteAr ?? selected.note : selected.note}</span>}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* ── DAILY LOG ── */}
      {tab === "log" && (
        <Card className="overflow-hidden py-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className={th}>{t("Date", "التاريخ")}</th>
                  <th className={th}>{t("Day", "اليوم")}</th>
                  <th className={th}>{t("Check-in", "الحضور")}</th>
                  <th className={th}>{t("Check-out", "الانصراف")}</th>
                  <th className={cn(th, "text-center")}>{t("Hours", "الساعات")}</th>
                  <th className={th}>{t("Location", "الموقع")}</th>
                  <th className={th}>{t("Status", "الحالة")}</th>
                </tr>
              </thead>
              <tbody>
                {logged.map((d) => {
                  const meta = KIND_META[d.kind]
                  return (
                    <tr key={d.date} className={cn("border-b border-border/60 transition-colors last:border-0 hover:bg-primary/[0.03]", d.day === TODAY_DAY && "bg-primary/[0.04]")}>
                      <td className="px-4 py-3 tabular-nums">{d.day} {isAr ? MONTH.labelAr.split(" ")[0] : MONTH.label.split(" ")[0]}</td>
                      <td className="px-4 py-3 text-muted-foreground">{isAr ? d.weekdayAr : d.weekday}</td>
                      <td className="px-4 py-3 tabular-nums">{d.checkIn ?? "—"}{d.late && <span className="ms-1.5 text-[10px] font-semibold text-rose-500">{t("late", "متأخر")}</span>}</td>
                      <td className="px-4 py-3 tabular-nums">{d.checkOut ?? (d.checkIn ? <span className="text-muted-foreground">{t("in progress", "جارٍ")}</span> : "—")}</td>
                      <td className="px-4 py-3 text-center tabular-nums">{d.hours ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{d.location ? (isAr ? d.locationAr ?? d.location : d.location) : (d.note ? (isAr ? d.noteAr ?? d.note : d.note) : "—")}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-[12px]">
                          <span className={cn("size-2 rounded-full", meta.dot)} />{isAr ? meta.ar : meta.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/20 px-4 py-3 text-[12px] text-muted-foreground">
            <span>{logged.length} {t("days recorded", "يوم مسجّل")}</span>
            <span className="inline-flex items-center gap-1.5">
              <TrendingUp className="size-3.5 text-emerald-500" />
              <span className="font-semibold text-foreground">{hrs(s.hours)}</span> {t("worked of", "من أصل")} {hrs(s.expected)} {t("expected", "متوقعة")}
            </span>
          </div>
        </Card>
      )}
    </main>
  )
}

function Tile({ icon: Icon, label, value, sub, tone }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub?: string; tone: "primary" | "muted" | "emerald" | "amber" }) {
  const cls = tone === "primary" ? "bg-primary/12 text-primary" : tone === "emerald" ? "bg-emerald-500/12 text-emerald-500" : tone === "amber" ? "bg-amber-500/12 text-amber-500" : "bg-muted text-muted-foreground"
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/15 p-3.5">
      <span className={cn("flex size-8 items-center justify-center rounded-lg", cls)}><Icon className="size-4" /></span>
      <div className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/55">{label}</div>
      <div className="mt-0.5 text-[17px] font-bold tabular-nums leading-tight">{value}</div>
      {sub && <div className="text-[10.5px] text-muted-foreground/60">{sub}</div>}
    </div>
  )
}

function Stat({ value, label, tone }: { value: string | number; label: string; tone: string }) {
  return (
    <Card className="p-3 text-center">
      <div className={cn("text-[22px] font-bold tabular-nums leading-none", tone)}>{value}</div>
      <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">{label}</div>
    </Card>
  )
}
