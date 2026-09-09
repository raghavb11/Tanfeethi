import * as React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Badge, Button, Card } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  AlertTriangle, ArrowLeft, CalendarDays, CalendarPlus, CalendarSearch, Check,
  ChevronLeft, ChevronRight, Copy, Download, Info, Pencil, Plus, Trash2, Upload, X,
} from "lucide-react"

import {
  addHoliday, copyYear, dayCount, daysInYear, type Holiday, type HolidayType,
  holidayType, holidayYears, newHolidayId, removeHoliday, useHolidays,
} from "../data/holidays"
import { activeHolidayTypes, useHolidayTypes } from "../data/master-data"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]

const fmt = (iso: string, isAr: boolean) => {
  const d = new Date(iso)
  return `${d.getDate()} ${isAr ? MONTHS_AR[d.getMonth()] : MONTHS[d.getMonth()]}`
}

// ── the upload format ────────────────────────────────────────────────────────
const COLUMNS = ["name", "name_ar", "type", "start_date", "end_date", "fixed_date", "notes"] as const

/** A row read off the file, with whatever is wrong with it. */
type ParsedRow = {
  line: number
  holiday?: Omit<Holiday, "id">
  raw: string[]
  error?: string
}

const TEMPLATE = [
  COLUMNS.join(","),
  'Founding Day,يوم التأسيس,public,2027-02-22,2027-02-22,yes,',
  'Eid al-Fitr,عيد الفطر,religious,2027-03-09,2027-03-14,no,Dates follow the moon sighting',
  'Saudi National Day,اليوم الوطني السعودي,public,2027-09-23,2027-09-23,yes,',
].join("\r\n")

/** Split one CSV line, honouring quoted fields that contain commas. */
function splitCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ""
  let quoted = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (quoted) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++ }
      else if (c === '"') quoted = false
      else cur += c
    } else if (c === '"') quoted = true
    else if (c === ",") { out.push(cur); cur = "" }
    else cur += c
  }
  out.push(cur)
  return out.map((v) => v.trim())
}

const ISO = /^\d{4}-\d{2}-\d{2}$/

function parseFile(text: string, t: (en: string, ar: string) => string): ParsedRow[] {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim() !== "")
  if (lines.length === 0) return []
  // the header is optional — skip it if it looks like one
  const first = splitCsvLine(lines[0]).map((v) => v.toLowerCase())
  const body = first[0] === "name" ? lines.slice(1) : lines

  return body.map((line, i) => {
    const cells = splitCsvLine(line)
    const [name, nameAr, type, startISO, endISO, fixed, notes] = cells
    const row: ParsedRow = { line: i + (first[0] === "name" ? 2 : 1), raw: cells }

    if (!name) return { ...row, error: t("The name is empty.", "الاسم فارغ.") }
    if (!ISO.test(startISO ?? "")) return { ...row, error: t("Start date must be YYYY-MM-DD.", "تاريخ البداية يجب أن يكون YYYY-MM-DD.") }
    const end = ISO.test(endISO ?? "") ? endISO : startISO
    if (end < startISO) return { ...row, error: t("The last day is before the first day.", "آخر يوم قبل أول يوم.") }
    if (end.slice(0, 4) !== startISO.slice(0, 4)) {
      return { ...row, error: t("A holiday has to sit inside one year.", "يجب أن تقع الإجازة داخل سنة واحدة.") }
    }
    const kind = (type ?? "").toLowerCase()
    const allowed = activeHolidayTypes().map((x) => x.id)
    if (kind && !allowed.includes(kind)) {
      return { ...row, error: t(`"${type}" is not a type — use ${allowed.join(", ")}.`, `"${type}" ليس نوعًا صحيحًا — استخدم ${allowed.join("، ")}.`) }
    }

    return {
      ...row,
      holiday: {
        year: Number(startISO.slice(0, 4)),
        name, nameAr: nameAr || name,
        type: (kind || allowed[0] || "public") as HolidayType,
        startISO, endISO: end,
        fixedDate: ["yes", "true", "y", "1", "نعم"].includes((fixed ?? "").toLowerCase()) || undefined,
        notes: notes || undefined, notesAr: notes || undefined,
      },
    }
  })
}

/** The holiday master, one year at a time. Leave and attendance read from it,
 *  so each year has to be opened and confirmed before it is used. */
export default function HolidayCalendarPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  const holidays = useHolidays()
  useHolidayTypes() // re-render when the type master changes
  const years = holidayYears()
  const raw = Number(params.get("year"))
  // any year can be opened, defined or not — an undefined one shows the empty state
  const year = Number.isFinite(raw) && raw > 2000 && raw < 2100
    ? raw
    : (years.includes(2026) ? 2026 : years[0])
  const setYear = (y: number) => setParams({ year: String(y) }, { replace: true })
  const defined = (y: number) => years.includes(y)

  // deleting a holiday is confirmed — leave balances are calculated off this
  const [confirmDelete, setConfirmDelete] = React.useState<string | null>(null)
  const [note, setNote] = React.useState<string | null>(null)

  // bulk upload
  const [showImport, setShowImport] = React.useState(false)
  const [parsed, setParsed] = React.useState<ParsedRow[] | null>(null)
  const [fileName, setFileName] = React.useState("")
  const fileRef = React.useRef<HTMLInputElement>(null)

  const rows = holidays
    .filter((h) => h.year === year)
    .sort((a, b) => a.startISO.localeCompare(b.startISO))

  /** The most recent defined year before this one — what an empty year copies from. */
  const previousDefined = years.filter((y) => y < year).pop()

  const openYear = (from: number, to: number) => {
    const n = copyYear(from, to)
    setNote(n > 0
      ? t(`${to} opened with ${n} fixed-date holidays rolled forward from ${from}. Add the moving ones when they are announced.`,
          `تم فتح ${to} بترحيل ${n} إجازات ثابتة من ${from}. أضف المتغيرة عند إعلانها.`)
      : t(`${from} has no fixed-date holidays to roll forward.`, `لا توجد إجازات ثابتة في ${from} لترحيلها.`))
    setYear(to)
  }

  const downloadTemplate = () => {
    // BOM so Excel opens the Arabic column correctly
    const blob = new Blob(["﻿" + TEMPLATE], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "holiday-calendar-template.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const readFile = (file: File) => {
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = () => setParsed(parseFile(String(reader.result ?? ""), t))
    reader.readAsText(file)
  }

  const good = parsed?.filter((r) => r.holiday) ?? []
  const bad = parsed?.filter((r) => r.error) ?? []

  const runImport = () => {
    good.forEach((r) => addHoliday({ id: newHolidayId(), ...r.holiday! }))
    const importedYears = [...new Set(good.map((r) => r.holiday!.year))].sort()
    setNote(t(`${good.length} holidays imported into ${importedYears.join(", ")}${bad.length ? ` · ${bad.length} rows skipped` : ""}.`,
              `تم استيراد ${good.length} إجازة إلى ${importedYears.join("، ")}${bad.length ? ` · تم تخطي ${bad.length} صفوف` : ""}.`))
    if (importedYears.length) setYear(importedYears[0])
    setParsed(null); setFileName(""); setShowImport(false)
    if (fileRef.current) fileRef.current.value = ""
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 px-4 py-7 md:px-8">
      <button
        onClick={() => navigate("/config")}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />{t("Back to configuration", "العودة إلى الإعدادات")}
      </button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <h1 className="text-[22px] font-bold tracking-tight md:text-[26px]">{t("Holiday calendar", "تقويم الإجازات")}</h1>
          <p className="max-w-3xl text-[13px] text-muted-foreground">
            {t("The non-working days for each year. Leave requests, attendance and working-day counts all read from this calendar.",
               "أيام العطل لكل سنة. تعتمد طلبات الإجازات والحضور وحساب أيام العمل على هذا التقويم.")}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setShowImport((v) => !v)}>
            <Upload className="size-4" />{t("Bulk upload", "رفع جماعي")}
          </Button>
          <Button onClick={() => navigate(`/config/holidays/new?year=${year}`)}>
            <Plus className="size-4" />{t("Add holiday", "إضافة إجازة")}
          </Button>
        </div>
      </div>

      {/* year switcher — the year either side, and a jump for anything further */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center rounded-xl border border-border p-0.5">
            <button
              onClick={() => setYear(year - 1)}
              aria-label={t("Earlier year", "سنة أسبق")}
              className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              <ChevronLeft className={cn("size-4", isAr && "rotate-180")} />
            </button>

            {[year - 1, year, year + 1].map((y) => (
              <button
                key={y} onClick={() => setYear(y)} aria-pressed={y === year}
                title={defined(y) ? undefined : t("Not defined yet", "غير معرّفة بعد")}
                className={cn("rounded-lg px-3.5 py-1.5 text-sm font-medium tabular-nums transition-colors",
                  y === year ? "bg-primary text-primary-foreground"
                             : defined(y) ? "text-muted-foreground hover:text-foreground"
                                          : "text-muted-foreground/45 hover:text-muted-foreground")}
              >
                {y}
              </button>
            ))}

            <button
              onClick={() => setYear(year + 1)}
              aria-label={t("Later year", "سنة لاحقة")}
              className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              <ChevronRight className={cn("size-4", isAr && "rotate-180")} />
            </button>
          </div>

          {/* jump straight to a year that already has holidays */}
          <label className="inline-flex items-center gap-1.5 rounded-xl border border-border px-2.5 py-1.5">
            <CalendarSearch className="size-4 shrink-0 text-muted-foreground" />
            <span className="sr-only">{t("Go to year", "الانتقال إلى سنة")}</span>
            <select
              value={years.includes(year) ? year : ""}
              onChange={(e) => e.target.value && setYear(Number(e.target.value))}
              aria-label={t("Go to year", "الانتقال إلى سنة")}
              className="bg-transparent text-[13px] font-medium tabular-nums outline-none"
            >
              <option value="" disabled>{t("Go to year", "الانتقال إلى سنة")}</option>
              {years.map((y) => (
                <option key={y} value={y}>{y} · {holidays.filter((h) => h.year === y).length}</option>
              ))}
            </select>
          </label>

          {!defined(year) && previousDefined !== undefined && (
            <Button variant="outline" size="sm" onClick={() => openYear(previousDefined, year)}>
              <CalendarPlus className="size-3.5" />
              {t(`Open ${year} from ${previousDefined}`, `فتح ${year} من ${previousDefined}`)}
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[12.5px] text-muted-foreground">
          <span><strong className="font-semibold text-foreground tabular-nums">{rows.length}</strong> {t("holidays", "إجازة")}</span>
          <span><strong className="font-semibold text-foreground tabular-nums">{daysInYear(year)}</strong> {t("days off", "يوم عطلة")}</span>
        </div>
      </div>

      {note && (
        <Card className="flex items-start gap-2.5 border-primary/30 bg-primary/[0.04] p-3.5">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" />
          <p className="flex-1 text-[12.5px]">{note}</p>
          <button onClick={() => setNote(null)} className="text-[12px] text-muted-foreground hover:text-foreground">
            {t("Dismiss", "إخفاء")}
          </button>
        </Card>
      )}

      {/* ── bulk upload ── */}
      {showImport && (
        <Card className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[13.5px] font-semibold">{t("Bulk upload holidays", "رفع الإجازات جماعيًا")}</p>
              <p className="mt-0.5 max-w-2xl text-[12px] text-muted-foreground">
                {t("Download the template, fill a row per holiday, and upload it back. Rows carry their own year, so one file can cover several years.",
                   "نزّل النموذج، واملأ صفًا لكل إجازة، ثم ارفعه. كل صف يحمل سنته، فيمكن أن يغطي ملف واحد عدة سنوات.")}
              </p>
            </div>
            <button onClick={() => { setShowImport(false); setParsed(null) }} aria-label={t("Close", "إغلاق")}
                    className="text-muted-foreground hover:text-foreground">
              <X className="size-4" />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="size-3.5" />{t("Download template", "تنزيل النموذج")}
            </Button>
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <Upload className="size-3.5" />{t("Choose file", "اختيار ملف")}
            </Button>
            <input
              ref={fileRef} type="file" accept=".csv,text/csv" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) readFile(f) }}
            />
            {fileName && <span className="text-[12px] text-muted-foreground">{fileName}</span>}
          </div>

          <p className="mt-2 text-[11px] text-muted-foreground/75">
            {t(`Columns: name, name_ar, type (${activeHolidayTypes().map((x) => x.id).join(" / ")}), start_date, end_date, fixed_date (yes/no), notes. Dates are YYYY-MM-DD. The template opens in Excel.`,
               "الأعمدة: name، name_ar، type (public / religious / company)، start_date، end_date، fixed_date (yes/no)، notes. التواريخ بصيغة YYYY-MM-DD. يفتح النموذج في Excel.")}
          </p>

          {/* what the file contains, before anything is written */}
          {parsed && (
            <div className="mt-4">
              <div className="mb-2 flex flex-wrap items-center gap-3 text-[12.5px]">
                <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                  <Check className="size-3.5" />{t(`${good.length} ready to import`, `${good.length} جاهزة للاستيراد`)}
                </span>
                {bad.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 font-medium text-rose-500">
                    <AlertTriangle className="size-3.5" />{t(`${bad.length} will be skipped`, `${bad.length} سيتم تخطيها`)}
                  </span>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto rounded-xl border border-border/60">
                <div className="divide-y divide-border/40">
                  {parsed.map((r) => (
                    <div key={r.line} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-[12px]">
                      <span className="w-8 shrink-0 tabular-nums text-muted-foreground/60">{r.line}</span>
                      {r.holiday ? (
                        <>
                          <Check className="size-3.5 shrink-0 text-emerald-500" />
                          <span className="min-w-0 flex-1 truncate font-medium">{r.holiday.name}</span>
                          <span className="shrink-0 tabular-nums text-muted-foreground">
                            {r.holiday.startISO}
                            {r.holiday.endISO !== r.holiday.startISO && ` → ${r.holiday.endISO}`}
                          </span>
                          <Badge variant="outline" className={cn("shrink-0 text-[10px]", holidayType(r.holiday.type, isAr).chip)}>
                            {holidayType(r.holiday.type, isAr).label}
                          </Badge>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="size-3.5 shrink-0 text-rose-500" />
                          <span className="min-w-0 flex-1 truncate text-muted-foreground">{r.raw.join(", ") || "—"}</span>
                          <span className="shrink-0 font-medium text-rose-500">{r.error}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => { setParsed(null); setFileName(""); if (fileRef.current) fileRef.current.value = "" }}>
                  {t("Cancel", "إلغاء")}
                </Button>
                <Button size="sm" disabled={good.length === 0} onClick={runImport}>
                  <Check className="size-3.5" />
                  {t(`Import ${good.length} holidays`, `استيراد ${good.length} إجازة`)}
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* the year */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
          <CalendarDays className="size-4 text-primary" />
          <span className="text-[13px] font-semibold tabular-nums">{year}</span>
          <Button
            variant="ghost" size="sm" className="ms-auto"
            onClick={() => { const n = copyYear(year, year + 1); setNote(
              n > 0
                ? t(`${n} fixed-date holidays copied into ${year + 1}.`, `تم نسخ ${n} إجازات ثابتة إلى ${year + 1}.`)
                : t("Nothing to copy — this year has no fixed-date holidays.", "لا يوجد ما يُنسخ — لا توجد إجازات ثابتة التاريخ.")) }}
          >
            <Copy className="size-3.5" />{t(`Copy fixed dates to ${year + 1}`, `نسخ الثوابت إلى ${year + 1}`)}
          </Button>
        </div>

        <div className="divide-y divide-border/40">
          {rows.map((h) => {
            const days = dayCount(h.startISO, h.endISO)
            const range = days === 1
              ? fmt(h.startISO, isAr)
              : `${fmt(h.startISO, isAr)} — ${fmt(h.endISO, isAr)}`
            return (
              <div key={h.id} className="px-4 py-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[13.5px] font-semibold">{isAr ? h.nameAr : h.name}</span>
                      <Badge variant="outline" className={cn("text-[10px]", holidayType(h.type, isAr).chip)}>
                        {holidayType(h.type, isAr).label}
                      </Badge>
                      {h.fixedDate ? (
                        <span className="text-[10.5px] text-muted-foreground/70">{t("Fixed date", "تاريخ ثابت")}</span>
                      ) : (
                        <span className="text-[10.5px] text-amber-600 dark:text-amber-400">{t("Moves each year", "يتغيّر سنويًا")}</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">
                      <span className="tabular-nums">{range}</span>
                      {" · "}
                      {days} {days === 1 ? t("day", "يوم") : t("days", "أيام")}
                    </p>
                    {(isAr ? h.notesAr : h.notes) && (
                      <p className="mt-1 max-w-2xl text-[11.5px] text-muted-foreground/75">{isAr ? h.notesAr : h.notes}</p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/config/holidays/${h.id}`)}>
                      <Pencil className="size-3.5" />{t("Edit", "تعديل")}
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => setConfirmDelete(confirmDelete === h.id ? null : h.id)}
                      aria-label={t("Remove", "إزالة")}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

                {confirmDelete === h.id && (
                  <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/[0.05] p-3">
                    <p className="text-[12.5px] font-semibold">
                      {t(`Remove ${h.name} from ${year}?`, `إزالة ${h.nameAr} من ${year}؟`)}
                    </p>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">
                      {t("Those days become working days again, and leave requests spanning them are recalculated.",
                         "ستعود تلك الأيام أيام عمل، وسيُعاد احتساب طلبات الإجازات التي تشملها.")}
                    </p>
                    <div className="mt-2 flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setConfirmDelete(null)}>{t("Cancel", "إلغاء")}</Button>
                      <Button size="sm" onClick={() => { removeHoliday(h.id); setConfirmDelete(null) }}>
                        {t("Yes, remove", "نعم، أزل")}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {rows.length === 0 && (
            <div className="px-4 py-14 text-center">
              <CalendarDays className="mx-auto size-8 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">
                {t(`No holidays are defined for ${year} yet.`, `لم تُعرَّف إجازات لعام ${year} بعد.`)}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Button onClick={() => navigate(`/config/holidays/new?year=${year}`)}>
                  <Plus className="size-4" />{t("Add the first holiday", "أضف أول إجازة")}
                </Button>
                {previousDefined !== undefined && (
                  <Button variant="outline" onClick={() => openYear(previousDefined, year)}>
                    <CalendarPlus className="size-4" />
                    {t(`Roll forward from ${previousDefined}`, `ترحيل من ${previousDefined}`)}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      <p className="text-[11.5px] text-muted-foreground/75">
        {t("The two Eids move about eleven days earlier each Gregorian year, so they are entered per year rather than rolled forward. Fixed dates — Founding Day, National Day — can be copied.",
           "يتقدّم العيدان نحو أحد عشر يومًا كل سنة ميلادية، لذا يُدخلان لكل سنة بدلًا من ترحيلهما. أما التواريخ الثابتة — يوم التأسيس واليوم الوطني — فيمكن نسخها.")}
      </p>
    </div>
  )
}
