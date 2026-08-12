import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  Badge, Button, Card,
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@reach/shared-ui"
import { useShell } from "@reach/shell-context"
import { cn } from "@reach/shared-core"
import { ArrowLeft, CalendarDays, CalendarPlus, Check, Clock, ListChecks, MapPin, Pencil, Ticket, Trash2, UserCircle2, Users, Video } from "lucide-react"

import { deleteEvent, getRsvp, setRsvp, useEvents } from "../data/events"
import { logAudit } from "../data/audit"

export default function EventDetailPage() {
  const { locale, role } = useShell()
  const isAr = locale === "ar"
  const isAdmin = role === "admin"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const { id = "" } = useParams()
  const e = useEvents().find((x) => x.id === id)

  const [rsvp, setRsvpState] = React.useState<string[]>(() => getRsvp())
  const [confirmReg, setConfirmReg] = React.useState(false)
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const going = e ? rsvp.includes(e.id) : false

  if (!e) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-16 text-center">
        <CalendarDays className="mx-auto size-10 text-muted-foreground/40" />
        <h1 className="mt-4 font-heading text-2xl font-semibold">{t("Event not found", "الفعالية غير موجودة")}</h1>
        <Button className="mt-6" onClick={() => navigate("/events")}>{t("Back to events", "العودة إلى الفعاليات")}</Button>
      </main>
    )
  }

  const seatsLeft = Math.max(0, e.capacity - e.attendees)
  const multiDay = !!e.endDay
  const dateText = multiDay
    ? `${e.day} ${e.mon} – ${e.endDay} ${e.endMon ?? e.mon}`
    : [isAr ? e.weekdayAr : e.weekday, `${e.day} ${e.mon}`].filter(Boolean).join(" · ")
  const FormatIcon = e.format === "In person" ? MapPin : Video

  const toggleRegister = () => {
    if (going) {
      const next = rsvp.filter((x) => x !== e.id)
      setRsvp(next); setRsvpState(next)
    } else {
      setConfirmReg(true)
    }
  }
  const confirmRegister = () => {
    const next = [...rsvp, e.id]
    setRsvp(next); setRsvpState(next); setConfirmReg(false)
  }
  const remove = () => { deleteEvent(e.id); logAudit("deleted", e.title, "Events"); navigate("/events") }

  const detail: [React.ComponentType<{ className?: string }>, string, string][] = [
    [CalendarDays, t("Date", "التاريخ"), dateText + (multiDay ? ` · ${t("Multi-day", "عدة أيام")}` : "")],
    [Clock, t("Time", "الوقت"), isAr ? e.timeAr : e.time],
    [MapPin, t("Location", "المكان"), isAr ? e.locationAr : e.location],
    [FormatIcon, t("Format", "الصيغة"), isAr ? e.formatAr : e.format],
    [UserCircle2, t("Organizer", "المنظّم"), isAr ? e.organizerAr : e.organizer],
    [Users, t("Audience", "الجمهور"), isAr ? e.audienceAr : e.audience],
  ]

  return (
    <main className="@container mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <button onClick={() => navigate("/events")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />{t("Back to events", "العودة إلى الفعاليات")}
        </button>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/events/edit/${e.id}`)}><Pencil className="size-3.5" />{t("Edit", "تحرير")}</Button>
            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setConfirmDelete(true)}><Trash2 className="size-4" />{t("Delete", "حذف")}</Button>
          </div>
        )}
      </div>

      {/* hero */}
      <div className="relative mb-6 h-56 overflow-hidden rounded-2xl border border-border bg-muted sm:h-72">
        <img src={e.img} alt="" className={cn("h-full w-full object-cover", e.past && "grayscale")} onError={(ev) => { (ev.currentTarget as HTMLImageElement).style.display = "none" }} />
        <div className="absolute bottom-4 start-4 flex size-16 flex-col items-center justify-center rounded-xl bg-[var(--card-elevated)] shadow-md ring-1 ring-border/60">
          <span className="font-heading text-2xl font-semibold leading-none tabular-nums text-foreground">{e.day}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">{e.mon}</span>
        </div>
        {multiDay && <span className="absolute end-4 top-4 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground shadow-sm">{t("Multi-day event", "فعالية متعددة الأيام")}</span>}
      </div>

      <div className="grid gap-8 @4xl:grid-cols-[minmax(0,1fr)_300px] @4xl:gap-12">
        <div className="min-w-0">
          <Badge variant="outline" className="w-fit">{isAr ? e.categoryAr : e.category}</Badge>
          <h1 className="mt-3 font-heading text-[2rem] font-bold leading-[1.1] tracking-tight text-balance sm:text-[2.5rem]">{isAr ? e.titleAr : e.title}</h1>
          <p className="mt-3 max-w-[68ch] text-lg leading-relaxed text-muted-foreground">{isAr ? e.descAr : e.desc}</p>

          {/* about / more text */}
          <div className="mt-6 space-y-3 text-[15px] leading-relaxed text-foreground/85">
            <p>{t(
              `This ${multiDay ? "multi-day programme" : "session"} is hosted by ${e.organizer} and is open to ${e.audience.toLowerCase()}. Registration helps us plan seating, catering and materials — please register in advance.`,
              `تستضيف هذه الفعالية ${e.organizerAr} وهي متاحة لـ${e.audienceAr}. يساعدنا التسجيل في تجهيز المقاعد والضيافة والمواد — يُرجى التسجيل مسبقًا.`,
            )}</p>
            <p>{t(
              "You'll receive a calendar invite and a reminder the day before. If your plans change, you can cancel your registration any time from this page.",
              "ستصلك دعوة تقويم وتذكير قبل الموعد بيوم. إذا تغيّرت خططك، يمكنك إلغاء تسجيلك في أي وقت من هذه الصفحة.",
            )}</p>
          </div>

          {/* agenda */}
          {(e.agenda?.length ?? 0) > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-semibold"><ListChecks className="size-5 text-primary" />{t("Agenda", "جدول الأعمال")}</h2>
              <ol className="space-y-0">
                {e.agenda!.map((a, i) => (
                  <li key={i} className="flex gap-4 border-s-2 border-border ps-4 pb-4 last:pb-0">
                    <span className="w-16 shrink-0 font-mono text-sm font-medium text-primary">{a.time}</span>
                    <span className="text-[15px] text-foreground/90">{isAr ? a.itemAr : a.item}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* sidebar */}
        <aside>
          <div className="@4xl:sticky @4xl:top-20 space-y-4">
            <Card className="p-5">
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">{t("Details", "التفاصيل")}</div>
              <dl className="space-y-3 text-sm">
                {detail.map(([Icon, l, v], i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
                    <dt className="w-20 shrink-0 text-muted-foreground">{l}</dt>
                    <dd className="min-w-0 flex-1 font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </Card>

            <Card className="p-5">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-1.5 font-medium"><Ticket className="size-4 text-primary" />{t("Registration", "التسجيل")}</span>
                <span className="text-muted-foreground">{e.attendees} / {e.capacity}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.round((e.attendees / e.capacity) * 100)}%` }} /></div>
              {!e.past && <p className="mt-2 text-xs text-muted-foreground">{seatsLeft} {t("seats left", "مقعد متبقٍ")}</p>}
              {!e.past && (
                <div className="mt-4 space-y-2">
                  <Button className="w-full" variant={going ? "outline" : "default"} onClick={toggleRegister}>
                    {going ? <><Check className="size-4" />{t("Registered — cancel?", "مسجّل — إلغاء؟")}</> : t("Register", "سجّل")}
                  </Button>
                  <Button variant="outline" className="w-full"><CalendarPlus className="size-4" />{t("Add to calendar", "أضف للتقويم")}</Button>
                </div>
              )}
              {e.past && <p className="mt-3 text-sm text-muted-foreground">{t("This event has ended.", "انتهت هذه الفعالية.")}</p>}
            </Card>
          </div>
        </aside>
      </div>

      {/* register confirmation */}
      <Dialog open={confirmReg} onOpenChange={setConfirmReg}>
        {confirmReg && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>{t("Confirm your registration", "تأكيد التسجيل")}</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">{t("Register for", "التسجيل في")} <span className="font-medium text-foreground">{isAr ? e.titleAr : e.title}</span> {t("on", "بتاريخ")} {dateText}? {t("You can cancel any time.", "يمكنك الإلغاء في أي وقت.")}</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmReg(false)}>{t("Cancel", "إلغاء")}</Button>
              <Button onClick={confirmRegister}><Check className="size-4" />{t("Confirm registration", "تأكيد التسجيل")}</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* delete confirmation */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        {confirmDelete && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>{t("Delete this event?", "حذف هذه الفعالية؟")}</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">{t("Registrations will be cancelled. This can't be undone.", "سيتم إلغاء التسجيلات. لا يمكن التراجع.")}</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDelete(false)}>{t("Cancel", "إلغاء")}</Button>
              <Button className="bg-destructive text-white hover:bg-destructive/90" onClick={remove}><Trash2 className="size-4" />{t("Delete", "حذف")}</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </main>
  )
}
