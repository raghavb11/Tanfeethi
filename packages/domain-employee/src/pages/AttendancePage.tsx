import * as React from "react"

import { ClockAction } from "../components/ClockAction"
import { dayStatus, remainingMinutes, toggleBreak, useClock, workedMinutes } from "../data/mock/clock"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  CalendarCheck, CalendarClock, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock, Coffee,
  Download, Home, ListChecks, LogOut, MapPin, Plane, TrendingUp,
} from "lucide-react"

import { type AttendanceDay, DAYS, type DayKind, MONTH, monthStats, TODAY_DAY, today } from "../data/mock/attendance"
import { Chip, IconBadge, OutlineButton, Page, Ring, SectionCard, Tile, type Tone, hmShort, to12h } from "../components/wijha"

type Tab = "calendar" | "log"

const KIND_META: Record<DayKind, { label: string; ar: string; dot: string; cell: string; tone: Tone }> = {
  present: { label: "Present", ar: "حاضر", dot: "bg-success", cell: "border-success/30 bg-success-fill", tone: "success" },
  remote: { label: "Remote", ar: "عن بُعد", dot: "bg-[#a997c7]", cell: "border-[#a997c7]/35 bg-[#a997c7]/12", tone: "violet" },
  leave: { label: "Leave", ar: "إجازة", dot: "bg-warning", cell: "border-warning/30 bg-warning-fill", tone: "warning" },
  holiday: { label: "Holiday", ar: "عطلة", dot: "bg-info", cell: "border-info/30 bg-info-fill", tone: "info" },
  absent: { label: "Absent", ar: "غياب", dot: "bg-error", cell: "border-error/30 bg-error-fill", tone: "error" },
  weekend: { label: "Weekend", ar: "نهاية الأسبوع", dot: "bg-muted-foreground/30", cell: "border-border bg-secondary/40", tone: "neutral" },
  future: { label: "Upcoming", ar: "قادم", dot: "bg-muted-foreground/20", cell: "border-dashed border-border", tone: "neutral" },
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
  // the day is whatever the clock store says — it may not have started yet
  const clock = useClock()
  const status = dayStatus(clock)
  const started = status !== "not-started"
  const onBreak = status === "working" && !!clock.breakStart
  const workedMin = workedMinutes(clock)
  const targetMin = clock.targetHours * 60
  const remainingMin = remainingMinutes(clock)
  const hm = (m: number) => hmShort(m, isAr)
  const dayProgress = Math.min(100, Math.round((workedMin / targetMin) * 100))

  // leading blanks so day 1 lands on its weekday column
  const lead = Array.from({ length: MONTH.firstWeekday }, (_, i) => i)
  // the log is a record of what already happened — nothing past today
  const logged = DAYS.filter((d) => d.day <= TODAY_DAY)
  /** "8.2h" / "8.2 س" — Western digits, as the Figma writes them. */
  const hrs = (n: number) => (isAr ? `${n} س` : `${n}h`)
  /** Today's hours come from the live clock rather than the fixture. */
  const dayHours = (d: AttendanceDay) =>
    d.day === TODAY_DAY ? (started ? Math.round((workedMin / 60) * 10) / 10 : undefined) : d.hours
  const monthName = isAr ? MONTH.labelAr.split(" ")[0] : MONTH.label.split(" ")[0]

  const statusChip = status === "not-started"
    ? <Chip tone="warning">{t("Not clocked in", "لم يُسجّل الحضور")}</Chip>
    : status === "done"
      ? <Chip tone="neutral" icon={CheckCircle2}>{t("Day complete", "اكتمل اليوم")}</Chip>
      : onBreak
        ? <Chip tone="warning" icon={Coffee}>{t("On break", "في استراحة")}</Chip>
        : <Chip tone="success">{t("Present", "حاضر")}</Chip>

  const th = "px-4 py-3 text-start text-[12.5px] font-medium text-muted-foreground"

  return (
    <Page className="@container space-y-6">
      {/* toolbar */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <OutlineButton><Download className="size-4" />{t("Export month", "تصدير الشهر")}</OutlineButton>
      </div>

      {/* today — hero band */}
      <section className="highlight-card hl-green rounded-2xl p-5 sm:p-8">
        <div className="flex flex-col gap-6 @3xl:flex-row @3xl:items-center @3xl:justify-between">
          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <div className="text-[12.5px] text-muted-foreground">{t("Today", "اليوم")}</div>
                <div className="mt-0.5 text-[22px] font-medium leading-tight sm:text-[26px]">{isAr ? today.dayLabelAr : today.dayLabel}</div>
              </div>
              {statusChip}
            </div>

            <div className="grid grid-cols-2 gap-3 @xl:grid-cols-4">
              <StatTile icon={Clock} label={t("Check-in", "الحضور")} value={clock.checkIn ? to12h(clock.checkIn) : "—"}
                sub={started ? t("On time", "في الوقت") : t("Not yet", "لم يتم بعد")} />
              <StatTile icon={LogOut} label={t("Check-out", "الانصراف")} value={clock.checkOut ? to12h(clock.checkOut) : "—"}
                sub={clock.checkOut ? "" : started ? t("Still working", "ما زلت أعمل") : ""} />
              <StatTile icon={CheckCircle2} label={t("Worked", "ساعات العمل")} value={started ? hm(workedMin) : "—"}
                sub={`${t("of", "من")} ${hrs(clock.targetHours)}`} />
              <StatTile icon={CalendarClock} label={t("Remaining", "المتبقي")} value={hm(remainingMin)}
                sub={isAr ? clock.locationAr : clock.location} />
            </div>

            <div className="flex flex-wrap items-start gap-3">
              <div className="min-w-0 flex-1"><ClockAction /></div>
              {status === "working" && (
                <OutlineButton size="sm" onClick={toggleBreak}>
                  <Coffee className="size-3.5" />{onBreak ? t("End break", "إنهاء الاستراحة") : t("Break", "إستراحة")}
                </OutlineButton>
              )}
            </div>
          </div>

          <Ring value={dayProgress / 100} size={140} stroke={14} className="self-center">
            <div>
              <div className="text-[11px] text-muted-foreground">{t("Today's progress", "تقدّم اليوم")}</div>
              <div className="mt-1 text-[18px] font-semibold tabular-nums">{started ? hm(workedMin) : "—"}</div>
              <div className="text-[11px] tabular-nums text-muted-foreground">{dayProgress}%</div>
            </div>
          </Ring>
        </div>
      </section>

      {/* month stats */}
      <div className="grid grid-cols-2 gap-3 @2xl:grid-cols-3 @5xl:grid-cols-6">
        <Stat value={s.present} label={t("Present", "حضور")} cls="text-success" />
        <Stat value={s.remote} label={t("Remote", "عن بُعد")} cls="text-[#a997c7]" />
        <Stat value={s.leave} label={t("Leave", "إجازة")} cls="text-warning" />
        <Stat value={s.late} label={t("Late", "تأخير")} cls="text-error" />
        <Stat value={hrs(s.avg)} label={t("Avg / day", "متوسط/يوم")} cls="text-primary" />
        <Stat value={`${s.onTimePct}%`} label={t("On time", "الالتزام")} cls="text-primary" />
      </div>

      {/* tabs + month switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg bg-secondary p-1">
          {([{ id: "calendar", label: "Calendar", ar: "التقويم", icon: CalendarDays }, { id: "log", label: "Daily log", ar: "السجل اليومي", icon: ListChecks }] as const).map((tb) => (
            <button key={tb.id} type="button" onClick={() => setTab(tb.id)} aria-pressed={tab === tb.id}
              className={cn("inline-flex h-8 items-center gap-1.5 rounded-md px-3.5 text-[13px] font-medium transition-colors",
                tab === tb.id ? "bg-soft-accent text-primary" : "text-muted-foreground hover:text-foreground")}>
              <tb.icon className="size-4" />{isAr ? tb.ar : tb.label}
            </button>
          ))}
        </div>
        <div className="inline-flex items-center gap-2">
          <button type="button" className="icon-tile size-9" aria-label={t("Previous month", "الشهر السابق")}><ChevronLeft className="size-4 rtl:rotate-180" /></button>
          <span className="min-w-[8rem] text-center text-[14px] font-medium">{isAr ? MONTH.labelAr : MONTH.label}</span>
          <button type="button" className="icon-tile size-9 opacity-40" disabled aria-label={t("Next month", "الشهر التالي")}><ChevronRight className="size-4 rtl:rotate-180" /></button>
        </div>
      </div>

      {/* ── CALENDAR ── */}
      {tab === "calendar" && (
        <SectionCard icon={CalendarDays} title={t("Monthly record", "السجل الشهري")}>
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {WEEK_HEADS.map((w) => (
              <div key={w.en} className="truncate pb-1 text-center text-[11px] font-medium text-muted-foreground">{isAr ? w.ar : w.en}</div>
            ))}
            {lead.map((i) => <div key={`lead-${i}`} />)}
            {DAYS.map((d) => {
              const meta = KIND_META[d.kind]
              const isToday = d.day === TODAY_DAY
              const h = dayHours(d)
              return (
                <button key={d.date} type="button" onClick={() => setSelected(d)} aria-pressed={selected?.date === d.date}
                  className={cn("relative flex min-h-[56px] min-w-0 flex-col items-start gap-1 rounded-[10px] border p-1.5 text-start transition-colors hover:border-primary/50 sm:min-h-[68px] sm:p-2",
                    meta.cell, isToday && "ring-2 ring-primary/50", selected?.date === d.date && "border-primary")}>
                  <span className={cn("text-[12px] font-semibold tabular-nums", isToday && "text-primary")}>{d.day}</span>
                  {h != null && <span className="hidden text-[10px] tabular-nums text-muted-foreground sm:block">{hrs(h)}</span>}
                  {d.kind === "leave" && <Plane className="size-3 text-warning" />}
                  {d.kind === "holiday" && <CalendarDays className="size-3 text-info" />}
                  {d.kind === "remote" && <Home className="size-3 text-[#a997c7]" />}
                  {d.late && <span className="absolute end-1.5 top-1.5 size-1.5 rounded-full bg-error" />}
                </button>
              )
            })}
          </div>

          {/* legend */}
          <div className="card-separator mt-4" />
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
            {(["present", "remote", "leave", "holiday", "absent", "weekend"] as DayKind[]).map((k) => (
              <span key={k} className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
                <span className={cn("size-2 rounded-full", KIND_META[k].dot)} />{isAr ? KIND_META[k].ar : KIND_META[k].label}
              </span>
            ))}
            <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground"><span className="size-1.5 rounded-full bg-error" />{t("Late arrival", "تأخر في الحضور")}</span>
          </div>

          {/* selected day */}
          {selected ? (
            <Tile className="mt-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-[14.5px] font-medium">
                  {isAr ? selected.weekdayAr : selected.weekday} · {selected.day} {isAr ? MONTH.labelAr : MONTH.label}
                </div>
                <Chip tone={KIND_META[selected.kind].tone}>{isAr ? KIND_META[selected.kind].ar : KIND_META[selected.kind].label}</Chip>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[12.5px] text-muted-foreground">
                {selected.checkIn && <span className="inline-flex items-center gap-1.5"><Clock className="size-3.5" />{to12h(selected.checkIn)} – {selected.checkOut ? to12h(selected.checkOut) : t("in progress", "جارٍ")}</span>}
                {dayHours(selected) != null && <span>{hrs(dayHours(selected)!)}</span>}
                {selected.location && <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5" />{isAr ? selected.locationAr ?? selected.location : selected.location}</span>}
                {selected.late && <span className="text-error">{t("Late arrival", "تأخر في الحضور")}</span>}
                {selected.note && <span>{isAr ? selected.noteAr ?? selected.note : selected.note}</span>}
                {!selected.checkIn && !selected.note && <span>{t("Nothing recorded for this day.", "لا يوجد سجل لهذا اليوم.")}</span>}
              </div>
            </Tile>
          ) : (
            <p className="mt-4 text-[12.5px] text-muted-foreground">{t("Select a day to see its record.", "اختر يومًا لعرض سجله.")}</p>
          )}
        </SectionCard>
      )}

      {/* ── DAILY LOG ── */}
      {tab === "log" && (
        <SectionCard icon={ListChecks} title={t("Daily log", "السجل اليومي")} bodyClassName="-mx-4 sm:-mx-6">
          {logged.length === 0 ? (
            <div className="py-10 text-center text-[13px] text-muted-foreground">{t("No days recorded yet this month.", "لا توجد أيام مسجّلة هذا الشهر بعد.")}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-[13px]">
                <thead>
                  <tr className="border-b border-border">
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
                    const h = dayHours(d)
                    return (
                      <tr key={d.date} className={cn("border-b border-border transition-colors last:border-0 hover:bg-soft-accent/40", d.day === TODAY_DAY && "bg-soft-accent/50")}>
                        <td className="px-4 py-3 tabular-nums">{d.day} {monthName}</td>
                        <td className="px-4 py-3 text-muted-foreground">{isAr ? d.weekdayAr : d.weekday}</td>
                        <td className="px-4 py-3 tabular-nums">{d.checkIn ? to12h(d.checkIn) : "—"}{d.late && <span className="ms-1.5 text-[11px] font-medium text-error">{t("late", "متأخر")}</span>}</td>
                        <td className="px-4 py-3 tabular-nums">{d.checkOut ? to12h(d.checkOut) : (d.checkIn ? <span className="text-muted-foreground">{t("in progress", "جارٍ")}</span> : "—")}</td>
                        <td className="px-4 py-3 text-center tabular-nums">{h ?? "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{d.location ? (isAr ? d.locationAr ?? d.location : d.location) : (d.note ? (isAr ? d.noteAr ?? d.note : d.note) : "—")}</td>
                        <td className="px-4 py-3"><Chip tone={meta.tone}>{isAr ? meta.ar : meta.label}</Chip></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="mx-4 mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 text-[12.5px] text-muted-foreground sm:mx-6">
            <span className="inline-flex items-center gap-1.5"><CalendarCheck className="size-3.5" />{logged.length} {t("days recorded", "يوم مسجّل")}</span>
            <span className="inline-flex items-center gap-1.5">
              <TrendingUp className="size-3.5 text-success" />
              <span className="font-semibold text-foreground">{hrs(s.hours)}</span> {t("worked of", "من أصل")} {hrs(s.expected)} {t("expected", "متوقعة")}
            </span>
          </div>
        </SectionCard>
      )}
    </Page>
  )
}

function StatTile({ icon, label, value, sub }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub?: string }) {
  return (
    <Tile className="min-w-0 p-3.5">
      <div className="flex min-w-0 items-center gap-2">
        <IconBadge icon={icon} className="size-8" />
        <span className="truncate text-[12.5px] text-muted-foreground">{label}</span>
      </div>
      <div className="mt-2 truncate text-[17px] font-semibold tabular-nums leading-tight">{value}</div>
      {sub && <div className="truncate text-[12px] text-muted-foreground">{sub}</div>}
    </Tile>
  )
}

function Stat({ value, label, cls }: { value: string | number; label: string; cls: string }) {
  return (
    <div className="panel rounded-xl p-4 text-center">
      <div className={cn("text-[24px] font-semibold tabular-nums leading-none", cls)}>{value}</div>
      <div className="mt-1.5 text-[12.5px] text-muted-foreground">{label}</div>
    </div>
  )
}
