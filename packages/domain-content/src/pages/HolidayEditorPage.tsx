import * as React from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { Button, Card, Input, Textarea } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import { ArrowLeft, Check } from "lucide-react"

import {
  addHoliday, dayCount, getHolidayById, type HolidayType, newHolidayId, updateHoliday,
} from "../data/holidays"
import { TONE_DOT, useHolidayTypes } from "../data/master-data"

/** Add or edit one holiday. A full routed page, not a dialog. */
export default function HolidayEditorPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const { id } = useParams()
  const [params] = useSearchParams()

  const existing = id ? getHolidayById(id) : undefined
  const editing = !!existing

  const yearParam = Number(params.get("year"))
  const startYear = existing?.year ?? (yearParam || 2026)

  const [name, setName] = React.useState(existing?.name ?? "")
  const [nameAr, setNameAr] = React.useState(existing?.nameAr ?? "")
  const types = useHolidayTypes().filter((x) => x.active || x.id === existing?.type)
  const [type, setType] = React.useState<HolidayType>(existing?.type ?? types[0]?.id ?? "public")
  const [startISO, setStartISO] = React.useState(existing?.startISO ?? `${startYear}-01-01`)
  const [endISO, setEndISO] = React.useState(existing?.endISO ?? `${startYear}-01-01`)
  const [fixedDate, setFixedDate] = React.useState(existing?.fixedDate ?? false)
  const [notes, setNotes] = React.useState(existing?.notes ?? "")

  const year = Number(startISO.slice(0, 4))
  const sameYear = startISO.slice(0, 4) === endISO.slice(0, 4)
  const orderOk = startISO <= endISO
  const canSave = name.trim() !== "" && startISO !== "" && endISO !== "" && orderOk && sameYear

  const back = `/config/holidays?year=${year || startYear}`

  const save = () => {
    if (!canSave) return
    const fields = {
      year,
      name: name.trim(),
      nameAr: nameAr.trim() || name.trim(),
      type, startISO, endISO,
      fixedDate: fixedDate || undefined,
      notes: notes.trim() || undefined,
      notesAr: notes.trim() || undefined,
    }
    if (editing) updateHoliday(existing.id, fields)
    else addHoliday({ id: newHolidayId(), ...fields })
    navigate(back)
  }

  const label = (s: string) => (
    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{s}</label>
  )

  const days = orderOk ? dayCount(startISO, endISO) : 0

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate(back)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />{t("Back to the calendar", "العودة إلى التقويم")}
        </button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(back)}>{t("Cancel", "إلغاء")}</Button>
          <Button disabled={!canSave} onClick={save}>
            <Check className="size-4" />
            {editing ? t("Save changes", "حفظ التغييرات") : t("Add holiday", "إضافة الإجازة")}
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          {editing ? t("Edit holiday", "تعديل الإجازة") : t("New holiday", "إجازة جديدة")}
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {t("These days stop counting as working days for leave and attendance.",
             "لا تُحتسب هذه الأيام أيام عمل في الإجازات والحضور.")}
        </p>
      </div>

      <Card className="p-5">
        <div className="space-y-5">
          <div>
            {label(t("Holiday name", "اسم الإجازة"))}
            <Input value={name} onChange={(e) => setName(e.target.value)}
                   placeholder={t("Eid al-Fitr, National Day…", "عيد الفطر، اليوم الوطني…")} />
          </div>

          <div>
            {label(t("Name in Arabic", "الاسم بالعربية"))}
            <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} dir="rtl"
                   placeholder={t("Optional — falls back to the English name", "اختياري — يُستخدم الاسم الإنجليزي إن تُرك فارغًا")} />
          </div>

          <div>
            {label(t("Type", "النوع"))}
            <div className="flex flex-wrap gap-1.5">
              {types.map((ty) => (
                <button
                  key={ty.id} type="button" onClick={() => setType(ty.id)}
                  className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                    type === ty.id ? "border-primary/40 bg-primary/12 text-primary"
                                   : "border-border text-muted-foreground hover:bg-muted/40")}
                >
                  <span className={cn("size-1.5 rounded-full", TONE_DOT[ty.tone])} />
                  {isAr ? ty.nameAr : ty.name}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground/75">
              {t("Types are configured under Configuration → Master data.",
                 "تُضبط الأنواع من الإعدادات ← البيانات الرئيسية.")}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              {label(t("First day", "أول يوم"))}
              <Input type="date" value={startISO}
                     onChange={(e) => {
                       setStartISO(e.target.value)
                       // a single-day holiday is the common case — keep the end with it
                       if (e.target.value > endISO) setEndISO(e.target.value)
                     }} />
            </div>
            <div>
              {label(t("Last day", "آخر يوم"))}
              <Input type="date" value={endISO} onChange={(e) => setEndISO(e.target.value)} />
            </div>
          </div>

          {!orderOk && (
            <p className="text-[12px] font-medium text-rose-500">
              {t("The last day is before the first day.", "آخر يوم قبل أول يوم.")}
            </p>
          )}
          {orderOk && !sameYear && (
            <p className="text-[12px] font-medium text-rose-500">
              {t("A holiday has to sit inside one year. Split it across the two years instead.",
                 "يجب أن تقع الإجازة داخل سنة واحدة. قسّمها بين السنتين.")}
            </p>
          )}
          {canSave && (
            <p className="text-[12px] text-muted-foreground">
              {t(`${days} ${days === 1 ? "day" : "days"} off in ${year}.`, `${days} ${days === 1 ? "يوم" : "أيام"} عطلة في ${year}.`)}
            </p>
          )}

          <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-border/70 p-3">
            <input
              type="checkbox" checked={fixedDate} onChange={(e) => setFixedDate(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 accent-[var(--primary)]"
            />
            <span className="min-w-0">
              <span className="block text-[12.5px] font-medium">{t("Same date every year", "نفس التاريخ كل سنة")}</span>
              <span className="block text-[11.5px] text-muted-foreground">
                {t("Fixed Gregorian dates can be rolled forward when a new year is opened. Leave this off for the Eids, which move each year.",
                   "يمكن ترحيل التواريخ الميلادية الثابتة عند فتح سنة جديدة. اتركه غير مفعّل للعيدين لأنهما يتغيّران سنويًا.")}
              </span>
            </span>
          </label>

          <div>
            {label(t("Notes", "ملاحظات"))}
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
                      placeholder={t("Anything the HR team should know — half days, sightings, site differences.",
                                     "ما ينبغي أن تعرفه الموارد البشرية — أنصاف الأيام، رؤية الهلال، اختلاف المواقع.")} />
          </div>
        </div>
      </Card>
    </main>
  )
}
