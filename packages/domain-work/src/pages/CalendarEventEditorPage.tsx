import * as React from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { cn } from "@reach/shared-core"
import { ArrowLeft, CalendarPlus, Trash2 } from "lucide-react"

import { Btn, CardHeader, ConfirmDialog, Empty, FilterSelect, Page, Panel, useT } from "../components/ui"
import {
  addCalendarEvent, CAL_NOW_MIN, CAL_TODAY_ISO, CALENDARS, type CalendarId, getCalendarEvent, minutes,
  newEventId, removeCalendarEvent, updateCalendarEvent, useCalendarEvents,
} from "../data/calendar"

const hhmm = (min: number) => `${String(Math.floor(min / 60) % 24).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`

/** New / edit appointment. The design has no screen for this, so it is a
 *  routed page in the calendar's visual language: /calendar/new, /calendar/:id/edit.
 *  ?now=1 ("Meet now") pre-fills an online meeting starting now. */
export default function CalendarEventEditorPage() {
  const { isAr, t } = useT()
  const navigate = useNavigate()
  const { id } = useParams()
  const [params] = useSearchParams()
  useCalendarEvents()
  const existing = id ? getCalendarEvent(id) : undefined
  const now = params.get("now") === "1"

  const defaultStart = params.get("start") ?? (now ? hhmm(Math.ceil(CAL_NOW_MIN / 5) * 5) : "09:00")
  const [title, setTitle] = React.useState(existing ? (isAr ? existing.titleAr : existing.title) : now ? t("Instant meeting", "اجتماع فوري") : "")
  const [calendar, setCalendar] = React.useState<CalendarId>(existing?.calendar ?? "mine")
  const [dateISO, setDateISO] = React.useState(existing?.dateISO ?? params.get("date") ?? CAL_TODAY_ISO)
  const [allDay, setAllDay] = React.useState(existing?.allDay ?? false)
  const [start, setStart] = React.useState(existing?.start ?? defaultStart)
  const [end, setEnd] = React.useState(existing?.end ?? hhmm(minutes(defaultStart) + (now ? 30 : 60)))
  const [online, setOnline] = React.useState(existing?.online ?? now)
  const [location, setLocation] = React.useState(existing ? (isAr ? existing.locationAr : existing.location) ?? "" : "")
  const [notes, setNotes] = React.useState(existing?.notes ?? "")
  const [confirm, setConfirm] = React.useState(false)

  const back = `/calendar?date=${dateISO}`
  const timesOk = allDay || (start !== "" && end !== "" && minutes(end) > minutes(start))
  const canSave = title.trim() !== "" && dateISO !== "" && timesOk

  if (id && !existing) {
    return <Page><Empty icon={CalendarPlus} text={t("That appointment no longer exists.", "لم يعد هذا الموعد موجودًا.")}
      action={<Btn onClick={() => navigate("/calendar")}>{t("Back to calendar", "العودة إلى التقويم")}</Btn>} /></Page>
  }

  const save = () => {
    if (!canSave) return
    const loc = location.trim() || (online ? t("Online call", "عبر الاتصال") : "")
    const fields = {
      calendar, dateISO, allDay: allDay || undefined,
      start: allDay ? undefined : start, end: allDay ? undefined : end,
      online: online || undefined,
      notes: notes.trim() || undefined,
      ...(isAr ? { titleAr: title.trim(), locationAr: loc || undefined } : { title: title.trim(), location: loc || undefined }),
    }
    if (existing) updateCalendarEvent(existing.id, fields)
    else addCalendarEvent({ id: newEventId(), title: title.trim(), titleAr: title.trim(), location: loc || undefined, locationAr: loc || undefined, ...fields })
    navigate(back)
  }

  const label = (s: string) => <span className="mb-1.5 block text-[12px] text-muted-foreground">{s}</span>
  const input = "h-10 w-full rounded-lg border border-input bg-background px-3 text-[13.5px] outline-none focus:border-primary/60"

  return (
    <Page className="max-w-[840px]">
      <section className="highlight-card flex flex-col gap-6 rounded-2xl px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button onClick={() => navigate(back)} className="inline-flex h-[34px] items-center gap-2 rounded-lg px-3 text-[13.5px] font-medium hover:bg-foreground/5">
            <ArrowLeft className={cn("size-[14px]", isAr && "rotate-180")} />{t("Back to calendar", "العودة إلى التقويم")}
          </button>
          <div className="flex items-center gap-2">
            {existing && <Btn variant="danger" onClick={() => setConfirm(true)}><span>{t("Delete", "حذف")}</span><Trash2 className="size-[14px]" /></Btn>}
            <Btn onClick={() => navigate(back)}>{t("Cancel", "إلغاء")}</Btn>
            <Btn variant="primary" disabled={!canSave} onClick={save}>{existing ? t("Save changes", "حفظ التعديلات") : t("Save appointment", "حفظ الموعد")}</Btn>
          </div>
        </div>
        <h1 className="text-[28px] font-medium leading-[38px]">
          {existing ? t("Edit appointment", "تعديل الموعد") : now ? t("Meet now", "اجتماع الآن") : t("New appointment", "موعد جديد")}
        </h1>
      </section>

      <Panel className="mt-6">
        <CardHeader icon={CalendarPlus} title={t("Appointment details", "تفاصيل الموعد")} />
        <div className="mt-[18px] grid gap-5">
          <label>{label(t("Title", "العنوان"))}
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={input} placeholder={t("What is it about?", "ما موضوع الموعد؟")} />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>{label(t("Calendar", "التقويم"))}
              <FilterSelect value={calendar} onChange={(v) => setCalendar(v as CalendarId)} className="[&>button]:h-10"
                lead={<span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: CALENDARS.find((c) => c.id === calendar)?.color }} />}
                options={CALENDARS.map((c) => ({ value: c.id, label: isAr ? c.ar : c.en, lead: <span className="size-2 rounded-full" style={{ backgroundColor: c.color }} /> }))} />
            </div>
            <label>{label(t("Date", "التاريخ"))}
              <input type="date" value={dateISO} onChange={(e) => setDateISO(e.target.value)} className={cn(input, "tabular-nums")} />
            </label>
          </div>
          <label className="inline-flex items-center gap-2 text-[13.5px]">
            <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} className="size-4 accent-[#bc9951]" />
            {t("All day", "طوال اليوم")}
          </label>
          {!allDay && (
            <div className="grid gap-5 sm:grid-cols-2">
              <label>{label(t("Starts", "يبدأ"))}
                <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className={cn(input, "tabular-nums")} />
              </label>
              <label>{label(t("Ends", "ينتهي"))}
                <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className={cn(input, "tabular-nums")} />
                {!timesOk && <span className="mt-1.5 block text-[12px] text-error">{t("The end has to be after the start.", "يجب أن يكون الانتهاء بعد البدء.")}</span>}
              </label>
            </div>
          )}
          <div className="grid gap-5 sm:grid-cols-2">
            <label>{label(t("Location", "المكان"))}
              <input value={location} onChange={(e) => setLocation(e.target.value)} className={input} placeholder={t("Room or site", "القاعة أو الموقع")} />
            </label>
            <label className="inline-flex items-center gap-2 self-end pb-2.5 text-[13.5px]">
              <input type="checkbox" checked={online} onChange={(e) => setOnline(e.target.checked)} className="size-4 accent-[#bc9951]" />
              {t("Online meeting (video call)", "اجتماع عبر الاتصال المرئي")}
            </label>
          </div>
          <label>{label(t("Notes", "ملاحظات"))}
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4}
              className="w-full rounded-lg border border-input bg-background p-3 text-[13.5px] outline-none focus:border-primary/60" />
          </label>
        </div>
      </Panel>

      <ConfirmDialog open={confirm} title={t("Delete this appointment?", "حذف هذا الموعد؟")}
        confirm={t("Delete", "حذف")} cancel={t("Cancel", "إلغاء")}
        onCancel={() => setConfirm(false)}
        onConfirm={() => { if (existing) removeCalendarEvent(existing.id); setConfirm(false); navigate(back) }} />
    </Page>
  )
}
