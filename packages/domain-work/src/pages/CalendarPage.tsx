import * as React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { cn } from "@reach/shared-core"
import {
  CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, MapPin, Plus, Video,
} from "lucide-react"

import { CardHeader, Empty, Page, Skeleton, useFirstPaint, useT, type TFn } from "../components/ui"
import {
  addDays, addMonths, CAL_NOW_MIN, CAL_TODAY_ISO, CALENDARS, calendarById, type CalendarEvent,
  durationMin, minutes, toDate, toggleCalendar, toISO, useCalendarEvents, useHiddenCalendars, weekStart,
} from "../data/calendar"

type View = "day" | "week" | "month"
const HOUR_PX = 64
const FIRST_HOUR = 8
const LAST_HOUR = 18 // last labelled hour; the grid runs to 19:00

const locale = (isAr: boolean) => (isAr ? "ar-EG-u-nu-latn" : "en-US")
const fmt = (iso: string, isAr: boolean, o: Intl.DateTimeFormatOptions) => toDate(iso).toLocaleDateString(locale(isAr), o)

/** The range label, correct for each view (the design leaves the week range
 *  on the day and month frames by mistake). */
function rangeLabel(view: View, date: string, isAr: boolean) {
  if (view === "day") return fmt(date, isAr, { weekday: "long", day: "numeric", month: "long", year: "numeric" })
  if (view === "month") return fmt(date, isAr, { month: "long", year: "numeric" })
  const from = weekStart(date)
  const to = addDays(from, 4)
  const sameMonth = toDate(from).getMonth() === toDate(to).getMonth()
  const year = toDate(to).getFullYear()
  if (isAr) {
    return sameMonth
      ? `${toDate(from).getDate()} — ${toDate(to).getDate()} ${fmt(to, true, { month: "long" })} ${year}`
      : `${toDate(from).getDate()} ${fmt(from, true, { month: "long" })} — ${toDate(to).getDate()} ${fmt(to, true, { month: "long" })} ${year}`
  }
  // Figma EN: "6 — 10 September 2026"
  return sameMonth
    ? `${toDate(from).getDate()} — ${toDate(to).getDate()} ${fmt(to, false, { month: "long" })} ${year}`
    : `${toDate(from).getDate()} ${fmt(from, false, { month: "long" })} — ${toDate(to).getDate()} ${fmt(to, false, { month: "long" })} ${year}`
}

/** "09:00 – 10:00", isolated left-to-right so RTL text keeps the start first. */
const timeRange = (e: CalendarEvent) => (e.start && e.end ? `⁦${e.start} – ${e.end}⁩` : "")

/** Personal calendar — Figma 2493:3720 (week), 2521:6688 (day), 2580:3222 (month),
 *  phone 3182:10072. */
export default function CalendarPage() {
  const { isAr, t } = useT()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const ready = useFirstPaint()
  const all = useCalendarEvents()
  const hidden = useHiddenCalendars()

  const view: View = params.get("view") === "day" ? "day" : params.get("view") === "month" ? "month" : "week"
  const date = /^\d{4}-\d{2}-\d{2}$/.test(params.get("date") ?? "") ? (params.get("date") as string) : CAL_TODAY_ISO
  const set = (next: { view?: View; date?: string }) => {
    const v = next.view ?? view
    const d = next.date ?? date
    const q: Record<string, string> = {}
    if (v !== "week") q.view = v
    if (d !== CAL_TODAY_ISO) q.date = d
    setParams(q, { replace: true })
  }
  const step = (dir: 1 | -1) =>
    set({ date: view === "day" ? addDays(date, dir) : view === "week" ? addDays(date, 7 * dir) : addMonths(date, dir) })

  const events = all.filter((e) => !hidden.has(e.calendar))
  const onDay = (iso: string) => events.filter((e) => e.dateISO === iso)
    .sort((a, b) => (a.allDay ? -1 : 0) - (b.allDay ? -1 : 0) || (a.start ?? "").localeCompare(b.start ?? ""))

  // booked time across the visible week (Sunday–Saturday)
  const ws = weekStart(date)
  const booked = events.filter((e) => e.dateISO >= ws && e.dateISO <= addDays(ws, 6)).reduce((s, e) => s + durationMin(e), 0)

  const openNew = (d: string, start?: string) => navigate(`/calendar/new?date=${d}${start ? `&start=${start}` : ""}`)
  const openEvent = (e: CalendarEvent) => navigate(`/calendar/${e.id}/edit`)

  return (
    <Page>
      {/* ── toolbar (h72 · radius 12 · px 18) ─────────────────────────── */}
      <div className="panel flex flex-wrap items-center justify-between gap-3 rounded-xl px-[18px] py-4">
        <div className="flex flex-wrap items-center gap-4 lg:gap-8">
          <button onClick={() => set({ date: CAL_TODAY_ISO })}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-input bg-background px-4 text-[14px] font-medium hover:bg-foreground/5">
            <span>{t("Today", "اليوم")}</span><CalendarDays className="size-4 text-icon" />
          </button>
          <div className="flex items-center gap-4">
            <button onClick={() => step(-1)} aria-label={t("Previous", "السابق")}
              className="inline-flex size-6 items-center justify-center rounded-md bg-secondary hover:bg-secondary/70">
              <ChevronLeft className={cn("size-3.5", isAr && "rotate-180")} />
            </button>
            <span className="min-w-[150px] text-center text-[15px] font-medium tabular-nums" aria-live="polite">{rangeLabel(view, date, isAr)}</span>
            <button onClick={() => step(1)} aria-label={t("Next", "التالي")}
              className="inline-flex size-6 items-center justify-center rounded-md bg-secondary hover:bg-secondary/70">
              <ChevronRight className={cn("size-3.5", isAr && "rotate-180")} />
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 lg:gap-8">
          <div className="inline-flex h-10 items-center gap-0.5 rounded-lg bg-background p-1 ring-1 ring-inset ring-[var(--card-ring)]" role="tablist">
            {(["day", "week", "month"] as const).map((v) => (
              <button key={v} role="tab" aria-selected={view === v} onClick={() => set({ view: v })}
                className={cn("h-8 rounded-md px-3.5 text-[14px] transition-colors",
                  view === v ? "bg-soft-accent font-medium text-primary" : "text-muted-foreground hover:text-foreground")}>
                {v === "day" ? t("Day", "يوم") : v === "week" ? t("Week", "أسبوع") : t("Month", "شهر")}
              </button>
            ))}
          </div>
          <button onClick={() => navigate(`/calendar/new?date=${CAL_TODAY_ISO}&now=1`)}
            className="inline-flex h-[34px] items-center gap-2 rounded-lg border border-input px-5 text-[14px] font-medium hover:bg-foreground/5">
            <span>{t("Meet now", "اجتماع الآن")}</span><Video className="size-4 text-icon" />
          </button>
          <button onClick={() => openNew(date)}
            className="btn-primary-grad inline-flex h-[34px] items-center gap-2 rounded-lg px-5 text-[14px] font-medium">
            <Plus className="size-4" />{t("New appointment", "موعد جديد")}
          </button>
        </div>
      </div>

      <div className="mt-6 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* ── main grid ─────────────────────────────────────────────── */}
        <div className="min-w-0">
          {!ready ? <Skeleton className="h-[811px]" /> : (
            <>
              <div className="hidden md:block">
                {view === "month"
                  ? <MonthGrid date={date} onDay={onDay} isAr={isAr} t={t} onOpen={openEvent} onPickDay={(d) => set({ view: "day", date: d })} />
                  : <TimeGrid days={view === "day" ? [date] : [0, 1, 2, 3, 4].map((i) => addDays(ws, i))}
                      onDay={onDay} isAr={isAr} t={t} onOpen={openEvent} onNew={openNew} />}
              </div>
              {/* phone: the selected day's agenda under the month card (3182:10072) */}
              <div className="md:hidden">
                <Agenda date={date} items={onDay(date)} isAr={isAr} t={t} onOpen={openEvent} onNew={() => openNew(date)} />
              </div>
            </>
          )}
        </div>

        {/* ── sidebar ─────────────────────────────────────────────────── */}
        <aside className="order-first flex flex-col gap-6 lg:order-none">
          <MiniMonth date={date} view={view} isAr={isAr} t={t} events={events} onPick={(d) => set({ date: d })} />
          <MyCalendars hidden={hidden} all={all} isAr={isAr} t={t} booked={booked} />
        </aside>
      </div>
    </Page>
  )
}

/** Day and week views: hours down the side, one column per day. */
function TimeGrid({ days, onDay, isAr, t, onOpen, onNew }: {
  days: string[]; onDay: (iso: string) => CalendarEvent[]; isAr: boolean; t: TFn
  onOpen: (e: CalendarEvent) => void; onNew: (d: string, start?: string) => void
}) {
  const hours = Array.from({ length: LAST_HOUR - FIRST_HOUR + 1 }, (_, i) => FIRST_HOUR + i)
  const bodyH = hours.length * HOUR_PX
  const cols = `56px repeat(${days.length}, minmax(0, 1fr))`
  const nowTop = ((CAL_NOW_MIN - FIRST_HOUR * 60) / 60) * HOUR_PX
  return (
    <div className="panel overflow-hidden rounded-xl">
      {/* day headings */}
      <div className="grid border-b border-input" style={{ gridTemplateColumns: cols }}>
        <span />
        {days.map((d) => {
          const today = d === CAL_TODAY_ISO
          return (
            <div key={d} className={cn("relative flex h-[66px] flex-col items-center justify-center border-s border-input", today && "bg-foreground/[0.04]")}>
              <span className={cn("text-[18px] font-semibold leading-6 tabular-nums", today && "text-primary")}>{toDate(d).getDate()}</span>
              <span className={cn("text-[11px] text-muted-foreground", today && "text-primary")}>{fmt(d, isAr, { weekday: "long" })}</span>
              {today && (
                <button onClick={() => onNew(d)} aria-label={t("New appointment today", "موعد جديد اليوم")}
                  className="absolute end-2.5 top-2.5 inline-flex size-5 items-center justify-center rounded-full bg-primary/80 text-background hover:bg-primary">
                  <Plus className="size-3.5" strokeWidth={2.5} />
                </button>
              )}
            </div>
          )
        })}
      </div>
      {/* all-day row */}
      <div className="grid min-h-10 border-b border-input" style={{ gridTemplateColumns: cols }}>
        <span className="flex items-center justify-center text-[10px] text-muted-foreground">{t("All day", "طوال اليوم")}</span>
        {days.map((d) => (
          <div key={d} className={cn("flex flex-col gap-1 border-s border-input p-1", d === CAL_TODAY_ISO && "bg-foreground/[0.04]")}>
            {onDay(d).filter((e) => e.allDay).map((e) => <EventChip key={e.id} e={e} isAr={isAr} onOpen={onOpen} />)}
          </div>
        ))}
      </div>
      {/* hours */}
      <div className="relative grid" style={{ gridTemplateColumns: cols, height: bodyH }}>
        <div className="relative">
          {hours.map((h, i) => (
            <span key={h} className="absolute inset-x-0 text-center text-[11px] tabular-nums text-muted-foreground" style={{ top: i * HOUR_PX + 8 }}>
              {String(h).padStart(2, "0")}:00
            </span>
          ))}
        </div>
        {days.map((d) => {
          const today = d === CAL_TODAY_ISO
          return (
            <div key={d} className={cn("relative border-s border-input", today && "bg-foreground/[0.04]")}>
              {hours.map((h, i) => (
                <button key={h} onClick={() => onNew(d, `${String(h).padStart(2, "0")}:00`)}
                  aria-label={t(`New appointment at ${h}:00`, `موعد جديد الساعة ${h}:00`)}
                  className="absolute inset-x-0 border-t border-input/70 transition-colors hover:bg-foreground/[0.03]"
                  style={{ top: i * HOUR_PX, height: HOUR_PX }} />
              ))}
              {onDay(d).filter((e) => !e.allDay && e.start && e.end).map((e) => {
                const top = ((minutes(e.start!) - FIRST_HOUR * 60) / 60) * HOUR_PX
                const h = Math.max(28, (durationMin(e) / 60) * HOUR_PX - 4)
                return (
                  <div key={e.id} className="absolute inset-x-1" style={{ top: top + 2, height: h }}>
                    <EventBlock e={e} isAr={isAr} onOpen={onOpen} />
                  </div>
                )
              })}
              {today && nowTop > 0 && nowTop < bodyH && (
                <div className="pointer-events-none absolute inset-x-0 z-10 h-0.5 bg-primary" style={{ top: nowTop }}>
                  <span className="absolute -end-1 -top-[4px] size-2.5 rounded-full bg-primary" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** A timed event: calendar-tinted fill, a 2px edge at the end side. */
function EventBlock({ e, isAr, onOpen }: { e: CalendarEvent; isAr: boolean; onOpen: (e: CalendarEvent) => void }) {
  const c = calendarById(e.calendar).color
  const short = durationMin(e) <= 30
  return (
    <button
      onClick={() => onOpen(e)}
      className="flex h-full w-full flex-col overflow-hidden rounded-md border-e-2 px-2 py-1.5 text-start transition-[filter] hover:brightness-125"
      style={{ backgroundColor: `color-mix(in oklab, ${c} 18%, var(--background))`, borderInlineEndColor: c }}
    >
      <span className="truncate text-[11.5px] font-medium leading-4">{isAr ? e.titleAr : e.title}</span>
      {!short && <span className="mt-1.5 text-[10px] tabular-nums text-muted-foreground">{timeRange(e)}</span>}
      {!short && (e.location || e.online) && durationMin(e) >= 90 && (
        <span className="mt-auto flex items-center gap-1 text-[10px] text-muted-foreground">
          {e.online ? <Video className="size-3" /> : <MapPin className="size-3" />}
          <span className="truncate">{isAr ? e.locationAr : e.location}</span>
        </span>
      )}
    </button>
  )
}

function EventChip({ e, isAr, onOpen, withTime }: { e: CalendarEvent; isAr: boolean; onOpen: (e: CalendarEvent) => void; withTime?: boolean }) {
  const c = calendarById(e.calendar).color
  return (
    <button onClick={() => onOpen(e)}
      className="flex w-full flex-col rounded-md border-e-2 px-2 py-1 text-start hover:brightness-125"
      style={{ backgroundColor: `color-mix(in oklab, ${c} 18%, var(--background))`, borderInlineEndColor: c }}>
      <span className="truncate text-[11px] font-medium" style={{ color: e.allDay ? c : undefined }}>{isAr ? e.titleAr : e.title}</span>
      {withTime && e.start && <span className="mt-1 text-[10px] tabular-nums text-muted-foreground">{timeRange(e)}</span>}
    </button>
  )
}

/** Month view: Sunday to Saturday, six rows; one event shown, "+N more" for the rest. */
function MonthGrid({ date, onDay, isAr, t, onOpen, onPickDay }: {
  date: string; onDay: (iso: string) => CalendarEvent[]; isAr: boolean; t: TFn
  onOpen: (e: CalendarEvent) => void; onPickDay: (iso: string) => void
}) {
  const first = toDate(date); first.setDate(1)
  const start = weekStart(toISO(first))
  const cells = Array.from({ length: 42 }, (_, i) => addDays(start, i))
  const month = toDate(date).getMonth()
  return (
    <div className="panel overflow-hidden rounded-xl">
      <div className="grid grid-cols-7 border-b border-input">
        {cells.slice(0, 7).map((d) => (
          <span key={d} className="py-3 text-center text-[12.5px] font-medium">{fmt(d, isAr, { weekday: "long" })}</span>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((d, i) => {
          const items = onDay(d)
          const inMonth = toDate(d).getMonth() === month
          const today = d === CAL_TODAY_ISO
          return (
            <div key={d} className={cn("flex h-32 min-w-0 flex-col gap-1.5 border-input p-2", i % 7 !== 0 && "border-s", i >= 7 && "border-t")}>
              <button onClick={() => onPickDay(d)}
                className={cn("self-start rounded-md px-1 text-[12.5px] tabular-nums hover:text-primary",
                  !inMonth && "text-muted-foreground/60", today && "bg-primary/80 px-1.5 font-semibold text-background")}>
                {toDate(d).getDate()}
              </button>
              {items[0] && <EventChip e={items[0]} isAr={isAr} onOpen={onOpen} withTime />}
              {items.length > 1 && (
                <button onClick={() => onPickDay(d)}
                  className="rounded-md border-e-2 px-2 py-1 text-start text-[10.5px] underline underline-offset-2 hover:brightness-125"
                  style={{ backgroundColor: `color-mix(in oklab, ${calendarById(items[1].calendar).color} 18%, var(--background))`, borderInlineEndColor: calendarById(items[1].calendar).color }}>
                  {t(`${items.length - 1}+ more events`, `${items.length - 1}+ فعاليات إضافية`)}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** Phone agenda for one day. */
function Agenda({ date, items, isAr, t, onOpen, onNew }: {
  date: string; items: CalendarEvent[]; isAr: boolean; t: TFn; onOpen: (e: CalendarEvent) => void; onNew: () => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[13px] text-muted-foreground">{fmt(date, isAr, { weekday: "long", day: "numeric", month: "long" })}</p>
      {items.map((e) => {
        const c = calendarById(e.calendar).color
        return (
          <button key={e.id} onClick={() => onOpen(e)}
            className="flex flex-col gap-1 rounded-xl border-e-2 px-4 py-3 text-start"
            style={{ backgroundColor: `color-mix(in oklab, ${c} 16%, var(--background))`, borderInlineEndColor: c }}>
            <span className="text-[14px] font-medium">{isAr ? e.titleAr : e.title}</span>
            <span className="text-[12px] tabular-nums text-muted-foreground">{e.allDay ? t("All day", "طوال اليوم") : timeRange(e)}</span>
          </button>
        )
      })}
      {items.length === 0 && (
        <Empty icon={CalendarDays} text={t("Nothing booked on this day.", "لا توجد مواعيد في هذا اليوم.")}
          action={<button onClick={onNew} className="btn-primary-grad inline-flex h-[34px] items-center gap-2 rounded-lg px-4 text-[13px] font-medium"><Plus className="size-4" />{t("New appointment", "موعد جديد")}</button>} />
      )}
    </div>
  )
}

/** Sidebar month picker: up / down change month, the visible week is shaded,
 *  today is gold. Dots mark days with events on the phone layout. */
function MiniMonth({ date, view, isAr, t, events, onPick }: {
  date: string; view: View; isAr: boolean; t: TFn; events: CalendarEvent[]; onPick: (d: string) => void
}) {
  const [shown, setShown] = React.useState(date)
  React.useEffect(() => setShown(date), [date])
  const first = toDate(shown); first.setDate(1)
  const start = weekStart(toISO(first))
  const cells = Array.from({ length: 42 }, (_, i) => addDays(start, i))
  const month = toDate(shown).getMonth()
  const ws = weekStart(date)
  const initials = isAr ? ["ح", "ن", "ث", "ر", "خ", "ج", "س"] : ["S", "M", "T", "W", "T", "F", "S"]
  const has = new Set(events.map((e) => e.dateISO))
  return (
    <div className="panel rounded-xl px-4 py-5">
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-semibold">{fmt(shown, isAr, { month: "long", year: "numeric" })}</span>
        <div className="flex gap-2">
          <button onClick={() => setShown(addMonths(shown, -1))} aria-label={t("Previous month", "الشهر السابق")}
            className="inline-flex size-6 items-center justify-center rounded-md bg-secondary"><ChevronUp className="size-3.5" /></button>
          <button onClick={() => setShown(addMonths(shown, 1))} aria-label={t("Next month", "الشهر التالي")}
            className="inline-flex size-6 items-center justify-center rounded-md bg-secondary"><ChevronDown className="size-3.5" /></button>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-7 gap-y-1 text-center">
        {initials.map((d, i) => <span key={i} className="pb-3 text-[11px] text-muted-foreground">{d}</span>)}
        {cells.map((d) => {
          const inMonth = toDate(d).getMonth() === month
          const today = d === CAL_TODAY_ISO
          const inWeek = view === "week" && d >= ws && d <= addDays(ws, 4)
          const selected = view !== "week" && d === date
          return (
            <button key={d} onClick={() => onPick(d)}
              className={cn("relative mx-auto flex h-7 w-9 items-center justify-center rounded-md text-[12px] tabular-nums transition-colors hover:bg-foreground/10",
                !inMonth && "text-muted-foreground/60",
                (inWeek || selected) && "bg-secondary font-semibold",
                today && "bg-primary/80 font-semibold text-background hover:bg-primary")}>
              {toDate(d).getDate()}
              {has.has(d) && !today && <span className="absolute bottom-0.5 size-1 rounded-full bg-primary md:hidden" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** "تقاويمي" — which calendars are shown, with counts, and the week's booked time. */
function MyCalendars({ hidden, all, isAr, t, booked }: {
  hidden: Set<string>; all: CalendarEvent[]; isAr: boolean; t: TFn; booked: number
}) {
  const h = Math.floor(booked / 60)
  const m = booked % 60
  return (
    <div className="panel hidden rounded-xl px-4 py-5 md:block">
      <CardHeader icon={CalendarDays} title={t("My calendars", "تقاويمي")} />
      <ul className="mt-5 border-s-2 border-secondary ps-4">
        {CALENDARS.map((c) => {
          const on = !hidden.has(c.id)
          return (
            <li key={c.id} className="border-b border-input last:border-b-0">
              <label className="flex h-[49px] cursor-pointer items-center gap-3">
                <input type="checkbox" checked={on} onChange={() => toggleCalendar(c.id)} className="sr-only" />
                <span aria-hidden className={cn("inline-flex size-5 shrink-0 items-center justify-center rounded-[5px] border-[1.5px]",
                  on ? "border-[#a997c7] bg-[#a997c7] text-background" : "border-foreground/80")}>
                  {on && <Check className="size-3.5" strokeWidth={3} />}
                </span>
                <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="min-w-0 flex-1 truncate text-[14px]">{isAr ? c.ar : c.en}</span>
                <span className="text-[14px] tabular-nums text-muted-foreground">{all.filter((e) => e.calendar === c.id).length}</span>
              </label>
            </li>
          )
        })}
      </ul>
      <div className="card-separator mt-10" />
      <div className="mt-5 flex items-center justify-between gap-3 text-[14px]">
        <span className="text-muted-foreground">{t("Time booked this week", "الوقت المحجوز هذا الأسبوع")}</span>
        <span className="font-medium tabular-nums text-primary">{isAr ? `${h} س ${m} د` : `${h} h ${m} m`}</span>
      </div>
    </div>
  )
}
