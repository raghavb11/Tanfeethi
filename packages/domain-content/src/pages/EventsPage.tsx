import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Badge, Button, Card } from "@reach/shared-ui"
import { useShell } from "@reach/shell-context"
import { cn } from "@reach/shared-core"
import { CalendarDays, CalendarPlus, Check, Clock, History, MapPin, Sparkles, Ticket, UserCircle2, Users, Video } from "lucide-react"

import { PageHeader, StatCard } from "./_ui"
import { type EventItem, getRsvp, useEvents } from "../data/events"

export default function EventsPage() {
  const { locale, role } = useShell()
  const isAr = locale === "ar"
  const isAdmin = role === "admin"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const [tab, setTab] = React.useState<"upcoming" | "past">("upcoming")

  const items = useEvents()
  const rsvp = getRsvp()
  const upcoming = items.filter((e) => !e.past)
  const pastEvents = items.filter((e) => e.past)
  const spotlight = tab === "upcoming" ? upcoming[0] : null
  const rows = tab === "upcoming" ? upcoming.slice(1) : pastEvents

  const open = (id: string) => navigate(`/events/${id}`)
  const FormatIcon = (f: EventItem["format"]) => (f === "In person" ? MapPin : Video)
  const seatsLeft = (e: EventItem) => Math.max(0, e.capacity - e.attendees)
  const dateChip = (e: EventItem) => (e.endDay ? `${e.day}–${e.endDay} ${e.endMon ?? e.mon}` : `${e.day} ${e.mon}`)

  const meta = (e: EventItem) => (
    <>
      <span className="inline-flex items-center gap-1"><Clock className="size-3.5" />{isAr ? e.timeAr : e.time}</span>
      <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{isAr ? e.locationAr : e.location}</span>
      <span className="inline-flex items-center gap-1">{React.createElement(FormatIcon(e.format), { className: "size-3.5" })}{isAr ? e.formatAr : e.format}</span>
    </>
  )
  const registerBtn = (e: EventItem, full = false) => (
    <Button variant={rsvp.includes(e.id) ? "outline" : "default"} onClick={(ev) => { ev.stopPropagation(); open(e.id) }} className={cn("shrink-0", full && "w-full")}>
      {rsvp.includes(e.id) ? <><Check className="size-4" />{t("Registered", "مسجّل")}</> : t("Register", "سجّل")}
    </Button>
  )

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        icon={CalendarDays}
        eyebrow={t("Events Calendar", "تقويم الفعاليات")}
        title={t("Company events & activities", "فعاليات وأنشطة الشركة")}
        desc={t("Corporate occasions, workshops and gatherings — with registration and reminders.", "المناسبات المؤسسية وورش العمل والتجمّعات — مع التسجيل والتذكيرات.")}
        action={isAdmin ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="lg" onClick={() => navigate("/admin/audit?module=Events")}><History className="size-4" />{t("Audit log", "سجل التدقيق")}</Button>
            <Button size="lg" onClick={() => navigate("/events/new")}><CalendarPlus className="size-4" />{t("Create event", "إنشاء فعالية")}</Button>
          </div>
        ) : undefined}
      />

      {isAdmin && (
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={CalendarDays} value={String(upcoming.length)} label={t("Upcoming", "قادمة")} />
          <StatCard icon={Users} value={String(items.reduce((s, e) => s + e.attendees, 0))} label={t("Registered", "مسجّلون")} sub={t("total", "الإجمالي")} />
          <StatCard icon={Clock} value="2" label={t("This week", "هذا الأسبوع")} />
          <StatCard icon={CalendarPlus} value={String(pastEvents.length)} label={t("Past events", "فعاليات سابقة")} />
        </div>
      )}

      <div className="mb-4 inline-flex rounded-xl border border-border p-0.5">
        {(["upcoming", "past"] as const).map((k) => (
          <button key={k} onClick={() => setTab(k)} aria-pressed={tab === k} className={cn("rounded-lg px-4 py-1.5 text-sm font-medium transition-colors", tab === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
            {k === "upcoming" ? t("Upcoming", "القادمة") : t("Past", "السابقة")}
            <span className={cn("ms-1.5 text-xs", tab === k ? "text-primary-foreground/70" : "text-muted-foreground/50")}>{k === "upcoming" ? upcoming.length : pastEvents.length}</span>
          </button>
        ))}
      </div>

      {spotlight && (
        <Card onClick={() => open(spotlight.id)} className="mb-4 flex cursor-pointer flex-col overflow-hidden py-0 transition-colors hover:border-primary/50 sm:flex-row sm:items-stretch">
          <div className="group relative h-48 w-full shrink-0 overflow-hidden bg-muted sm:h-auto sm:w-72">
            <img src={spotlight.img} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" onError={(ev) => { (ev.currentTarget as HTMLImageElement).style.display = "none" }} />
            <span className="absolute start-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground shadow-sm"><Sparkles className="size-3" />{t("Next up", "التالي")}</span>
            <div className="absolute bottom-3 start-3 flex size-14 flex-col items-center justify-center rounded-lg bg-[var(--card-elevated)] shadow-sm ring-1 ring-border/60">
              <span className="font-heading text-xl font-semibold leading-none tabular-nums text-foreground">{spotlight.day}</span>
              <span className="text-[9px] font-semibold uppercase tracking-wider text-primary">{spotlight.mon}</span>
            </div>
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-2.5 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{isAr ? spotlight.categoryAr : spotlight.category}</Badge>
              {spotlight.endDay && <Badge variant="outline">{t("Multi-day", "عدة أيام")}</Badge>}
              <span className="text-xs text-muted-foreground">{dateChip(spotlight)}</span>
            </div>
            <h2 className="font-heading text-xl font-semibold leading-tight sm:text-2xl">{isAr ? spotlight.titleAr : spotlight.title}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{isAr ? spotlight.descAr : spotlight.desc}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">{meta(spotlight)}</div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><UserCircle2 className="size-3.5" />{t("Hosted by", "بتنظيم")} {isAr ? spotlight.organizerAr : spotlight.organizer}</span>
              <span className="inline-flex items-center gap-1.5"><Users className="size-3.5" />{spotlight.attendees} {t("registered", "مسجّل")}</span>
              <span className="inline-flex items-center gap-1.5 text-primary"><Ticket className="size-3.5" />{seatsLeft(spotlight)} {t("seats left", "مقعد متبقٍ")}</span>
            </div>
            <div className="mt-1 flex items-center gap-3">
              {registerBtn(spotlight)}
              <button onClick={(ev) => { ev.stopPropagation(); open(spotlight.id) }} className="text-xs font-medium text-primary hover:underline">{t("View details", "عرض التفاصيل")}</button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {rows.map((e) => (
          <Card key={e.id} onClick={() => open(e.id)} className="group flex cursor-pointer flex-row items-stretch gap-0 overflow-hidden py-0 transition-colors hover:border-primary/50">
            <div className="relative w-24 shrink-0 self-stretch overflow-hidden bg-muted sm:w-44">
              <img src={e.img} alt="" className={cn("absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105", e.past && "grayscale")} loading="lazy" onError={(ev) => { (ev.currentTarget as HTMLImageElement).style.display = "none" }} />
              <div className="absolute left-2.5 top-2.5 flex w-11 flex-col items-center rounded-lg bg-[var(--card-elevated)] py-1 shadow-sm ring-1 ring-border/60">
                <span className="font-heading text-lg font-semibold leading-none tabular-nums text-foreground">{e.day}</span>
                <span className="text-[9px] font-semibold uppercase tracking-wider text-primary">{e.mon}</span>
              </div>
            </div>
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{isAr ? e.categoryAr : e.category}</Badge>{e.endDay && <Badge variant="outline">{t("Multi-day", "عدة أيام")}</Badge>}<span className="text-xs text-muted-foreground">{dateChip(e)}</span></div>
                <h3 className="mt-1.5 font-medium">{isAr ? e.titleAr : e.title}</h3>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{isAr ? e.descAr : e.desc}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">{meta(e)}</div>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground/80">
                  <span className="inline-flex items-center gap-1"><UserCircle2 className="size-3.5" />{isAr ? e.organizerAr : e.organizer}</span>
                  <span className="inline-flex items-center gap-1"><Users className="size-3.5" />{e.attendees} {t("registered", "مسجّل")}</span>
                  {!e.past && <span className="text-primary">{seatsLeft(e)} {t("seats left", "مقعد متبقٍ")}</span>}
                </div>
              </div>
              {!e.past && registerBtn(e)}
            </div>
          </Card>
        ))}
      </div>
    </main>
  )
}
