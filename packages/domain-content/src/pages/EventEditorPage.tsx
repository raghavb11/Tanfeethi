import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  Button, Card, Input, Textarea,
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@reach/shared-ui"
import { useShell } from "@reach/shell-context"
import { cn } from "@reach/shared-core"
import { ArrowLeft, CalendarPlus, Trash2 } from "lucide-react"

import { addEvent, deleteEvent, EVENT_CATEGORIES, EVENT_FORMATS, EVENT_IMAGES, type EventItem, formatAr, getEventById, updateEvent } from "../data/events"
import { logAudit } from "../data/audit"

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]

export default function EventEditorPage() {
  const { locale, role } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const { id } = useParams()
  const editing = id ? getEventById(id) : undefined

  const [title, setTitle] = React.useState(editing?.title ?? "")
  const [desc, setDesc] = React.useState(editing?.desc ?? "")
  const [category, setCategory] = React.useState(editing?.category ?? "Corporate")
  const [day, setDay] = React.useState(editing?.day ?? "01")
  const [mon, setMon] = React.useState(editing?.mon ?? "SEP")
  const [time, setTime] = React.useState(editing?.time ?? "10:00–11:00")
  const [location, setLocation] = React.useState(editing?.location ?? "HQ Auditorium")
  const [format, setFormat] = React.useState<EventItem["format"]>(editing?.format ?? "In person")
  const [organizer, setOrganizer] = React.useState(editing?.organizer ?? "People & Culture")
  const [capacity, setCapacity] = React.useState(String(editing?.capacity ?? 100))
  const [img, setImg] = React.useState(editing?.img ?? EVENT_IMAGES[0])
  const [confirmDelete, setConfirmDelete] = React.useState(false)

  React.useEffect(() => { if (role !== "admin") navigate("/events", { replace: true }) }, [role, navigate])

  const canSave = title.trim().length > 0
  const save = () => {
    const ttl = title.trim()
    if (!ttl) return
    const fields = {
      title: ttl, titleAr: ttl, desc: desc.trim(), descAr: desc.trim(),
      day: day.trim() || "01", mon, weekday: editing?.weekday ?? "", weekdayAr: editing?.weekdayAr ?? "",
      time: time.trim(), timeAr: time.trim(), location: location.trim(), locationAr: location.trim(),
      format, formatAr: formatAr(format), organizer: organizer.trim(), organizerAr: organizer.trim(),
      audience: "All employees", audienceAr: "جميع الموظفين", category, categoryAr: category,
      capacity: Math.max(1, parseInt(capacity) || 100), img,
    }
    if (editing) { updateEvent(editing.id, fields); logAudit("edited", ttl, "Events") }
    else { addEvent({ id: `evt-${Date.now()}`, attendees: 0, ...fields }); logAudit("published", ttl, "Events") }
    navigate("/events")
  }
  const remove = () => { if (editing) { deleteEvent(editing.id); logAudit("deleted", editing.title, "Events") } navigate("/events") }

  const field = (id: string, label: string, node: React.ReactNode) => (
    <div><label htmlFor={id} className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</label>{node}</div>
  )
  const selectCls = "h-11 w-full rounded-lg border border-input bg-[var(--card-elevated)] px-3 text-sm outline-none focus:border-primary/60"

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => navigate("/events")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />{t("Back to events", "العودة إلى الفعاليات")}
        </button>
        <div className="flex items-center gap-2">
          {editing && <Button variant="ghost" onClick={() => setConfirmDelete(true)} className="text-destructive hover:bg-destructive/10 hover:text-destructive"><Trash2 className="size-4" />{t("Delete", "حذف")}</Button>}
          <Button variant="outline" onClick={() => navigate("/events")}>{t("Cancel", "إلغاء")}</Button>
          <Button disabled={!canSave} onClick={save}>{editing ? t("Save changes", "حفظ التغييرات") : t("Publish event", "نشر الفعالية")}</Button>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-2 text-primary">
        <CalendarPlus className="size-4" />
        <span className="text-xs font-semibold uppercase tracking-[0.14em]">{editing ? t("Edit event", "تحرير الفعالية") : t("New event", "فعالية جديدة")}</span>
      </div>

      <Card className="space-y-5 p-6 sm:p-8">
        {field("ev-title", t("Title", "العنوان"), <Input id="ev-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("Event name", "اسم الفعالية")} autoFocus className="h-11 text-base" />)}
        {field("ev-desc", t("Description", "الوصف"), <Textarea id="ev-desc" rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} className="text-[15px] leading-relaxed" />)}
        <div className="grid gap-4 sm:grid-cols-3">
          {field("ev-day", t("Day", "اليوم"), <Input id="ev-day" value={day} onChange={(e) => setDay(e.target.value)} className="h-11" />)}
          {field("ev-mon", t("Month", "الشهر"), <select id="ev-mon" value={mon} onChange={(e) => setMon(e.target.value)} className={selectCls}>{MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}</select>)}
          {field("ev-time", t("Time", "الوقت"), <Input id="ev-time" value={time} onChange={(e) => setTime(e.target.value)} className="h-11" />)}
        </div>
        {field("ev-loc", t("Location", "المكان"), <Input id="ev-loc" value={location} onChange={(e) => setLocation(e.target.value)} className="h-11" />)}
        <div className="grid gap-4 sm:grid-cols-2">
          {field("ev-cat", t("Category", "الفئة"), <select id="ev-cat" value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>{EVENT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select>)}
          {field("ev-fmt", t("Format", "الصيغة"), <select id="ev-fmt" value={format} onChange={(e) => setFormat(e.target.value as EventItem["format"])} className={selectCls}>{EVENT_FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}</select>)}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {field("ev-org", t("Organizer", "المنظّم"), <Input id="ev-org" value={organizer} onChange={(e) => setOrganizer(e.target.value)} className="h-11" />)}
          {field("ev-cap", t("Capacity", "السعة"), <Input id="ev-cap" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} className="h-11" />)}
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("Cover image", "صورة الغلاف")}</label>
          <div className="flex flex-wrap gap-2">
            {EVENT_IMAGES.map((src, i) => (
              <button key={src} type="button" aria-label={`${t("Cover", "غلاف")} ${i + 1}`} onClick={() => setImg(src)} className={cn("size-14 overflow-hidden rounded-lg ring-2", img === src ? "ring-primary" : "ring-transparent hover:ring-border")}>
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </Card>

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
