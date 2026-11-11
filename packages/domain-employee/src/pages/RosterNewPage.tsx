import * as React from "react"
import { useNavigate } from "react-router-dom"
import { cn } from "@reach/shared-core"
import { matchesSearch } from "@reach/shared-ui"
import { useShell, usePageTitle } from "@reach/shell-context"
import { useShiftTypes } from "@reach/domain-content/master-data"
import { AlertTriangle, ArrowLeft, CalendarRange, Check, CircleCheck, Copy, Eraser, Repeat, Search, ShieldCheck, Users, Wand2 } from "lucide-react"

import {
  addDays, addRoster, type Assignment, assignmentOf, autoAssign, datesProblem, dayCount, DEFAULT_DAYS_OFF, departments, peopleNeeded,
  latestRosterFor, liveRosters, monthEnd, monthStart, nextInRotation, peopleIn, periodLabel, rolloverDates, ROSTER_TODAY_ISO,
  rosterName, rotationText, useCanManageRosters, useRosters,
} from "../data/rosters"
import { Empty, FieldLabel, GoldButton, Initials, OutlineButton, Page, SectionCard, fieldClass } from "../components/wijha"
import { PickField, RotationPicker, Segmented, ShiftCode, WeekdayPills } from "../components/RosterBits"

type Start = "rollover" | "copy" | "auto" | "blank"

/** New roster — a full routed page. Team and dates first, then who is on it,
 *  then where each person's shift comes from. Each person keeps one shift and
 *  their weekly days off for the whole period; both are set on the roster page. */
export default function RosterNewPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const canManage = useCanManageRosters()
  const rosters = useRosters()
  const shiftTypes = useShiftTypes()
  const working = shiftTypes.filter((s) => s.active && !s.isOff)
  usePageTitle("New roster", "جدول جديد")

  const back = "/employee/rosters"
  // a two-month period from next month, by default
  const firstOfNext = monthStart(addDays(monthEnd(ROSTER_TODAY_ISO), 1))
  const [dept, setDept] = React.useState("")
  const [name, setName] = React.useState("")
  const [nameAlt, setNameAlt] = React.useState("")
  const [startISO, setStartISO] = React.useState(firstOfNext)
  const [endISO, setEndISO] = React.useState(monthEnd(addDays(monthEnd(firstOfNext), 1)))
  const [members, setMembers] = React.useState<string[]>([])
  const [peopleQ, setPeopleQ] = React.useState("")
  const [start, setStart] = React.useState<Start>("blank")
  const [defaultOff, setDefaultOff] = React.useState<number[]>(DEFAULT_DAYS_OFF)
  const [rotation, setRotation] = React.useState<string[]>(working.filter((s) => s.id !== "office").map((s) => s.id))
  const [minCover, setMinCover] = React.useState<Record<string, number>>({})
  const [coverWeekends, setCoverWeekends] = React.useState(true)
  const [tried, setTried] = React.useState(false)

  const source = dept ? latestRosterFor(rosters, dept) : undefined
  const dateIssue = datesProblem(rosters, dept, startISO, endISO)
  const clash = dept && startISO && endISO ? liveRosters(rosters).find((r) => r.department === dept && r.startISO <= endISO && startISO <= r.endISO) : undefined
  const presets = [1, 2, 3].map((n) => {
    const to = monthEnd(addDays(firstOfNext, 31 * (n - 1)))
    return { label: n === 1 ? t("Next month", "الشهر القادم") : t(`Next ${n} months`, `الأشهر الـ${n} القادمة`), from: firstOfNext, to }
  })

  // a department brings its last roster's team, names, rotation and cover; the new period follows it
  const pickDept = (d: string) => {
    setDept(d)
    const last = latestRosterFor(rosters, d)
    setMembers(last ? last.memberIds : [])
    if (last) {
      setName(isAr ? last.nameAr : last.name); setNameAlt(isAr ? last.name : last.nameAr)
      setRotation(last.rotation); setMinCover(last.minCover); setCoverWeekends(last.coverWeekends)
      const next = rolloverDates(last)
      setStartISO(next.startISO); setEndISO(next.endISO)
      setStart("rollover")
    } else {
      setName(""); setNameAlt(""); setStart("blank")
    }
  }

  const people = dept ? peopleIn(dept) : []
  const listed = people.filter((p) => matchesSearch(peopleQ, p.name, p.nameAr, p.title, p.titleAr))
  const toggle = (id: string) => setMembers((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]))

  const errors = {
    dept: !dept && t("Choose the department", "اختر الإدارة"),
    dates: !!dateIssue && (isAr ? dateIssue.ar : dateIssue.en),
    people: members.length === 0 && t("Choose at least one person", "اختر موظفًا واحدًا على الأقل"),
  }
  const invalid = Object.values(errors).some(Boolean)

  const create = () => {
    if (invalid) {
      setTried(true)
      requestAnimationFrame(() => document.querySelector<HTMLElement>("main [aria-invalid='true']")?.scrollIntoView({ block: "center", behavior: "smooth" }))
      return
    }
    const deptRow = departments().find((d) => d.name === dept)!
    const main = name.trim() || (isAr ? deptRow.nameAr : deptRow.name)
    const alt = nameAlt.trim() || main
    const assignments: Record<string, Assignment> = {}
    let how = { en: `Created the roster for ${periodLabel({ startISO, endISO }, false)}`, ar: `أنشأ الجدول للفترة ${periodLabel({ startISO, endISO }, true)}` }
    for (const pid of members) {
      const before = source && source.memberIds.includes(pid) ? assignmentOf(source, pid) : undefined
      if (start === "rollover" && before?.shiftId) {
        assignments[pid] = { shiftId: nextInRotation(rotation, before.shiftId), daysOff: before.daysOff, suggestedFrom: before.shiftId, previousShiftId: before.shiftId }
      } else if (start === "copy" && before) {
        assignments[pid] = { shiftId: before.shiftId, daysOff: before.daysOff, previousShiftId: before.shiftId || undefined }
      } else {
        // blank or auto: no shift yet; last period's shift still governs when a new one may start
        assignments[pid] = { shiftId: "", daysOff: before?.daysOff ?? defaultOff, previousShiftId: before?.shiftId || undefined }
      }
    }
    if (start === "rollover" && source) how = { en: `Rolled over from ${source.code} — next shifts suggested from ${rotationText(rotation, false)}`, ar: `رُحّل من ${source.code} — اقتُرحت المناوبات التالية حسب ${rotationText(rotation, true)}` }
    if (start === "copy" && source) how = { en: `Copied the shifts from ${source.code}`, ar: `نسخ المناوبات من ${source.code}` }
    if (start === "auto") how = { en: `Created the roster for ${periodLabel({ startISO, endISO }, false)}, to be assigned automatically`, ar: `أنشأ الجدول للفترة ${periodLabel({ startISO, endISO }, true)} للتوزيع التلقائي` }
    const id = addRoster({
      name: isAr ? alt : main, nameAr: isAr ? main : alt,
      department: deptRow.name, departmentAr: deptRow.nameAr,
      startISO, endISO, memberIds: members, assignments, rotation, minCover, coverWeekends,
      previousId: start === "rollover" ? source?.id : undefined,
    }, how)
    if (start === "auto") autoAssign(id)
    navigate(`/employee/rosters/${id}`, { replace: true })
  }

  if (!canManage) {
    return (
      <Page>
        <SectionCard icon={CalendarRange} title={t("New roster", "جدول جديد")}>
          <Empty icon={Users} title={t("Rosters are built by managers", "يُعِدّ المدراء جداول المناوبات")} />
        </SectionCard>
      </Page>
    )
  }

  const err = (k: keyof typeof errors) => (tried ? errors[k] : false)
  const shownErrors = (Object.keys(errors) as (keyof typeof errors)[]).map((k) => errors[k]).filter(Boolean) as string[]

  return (
    <Page className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => navigate(back)} className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />{t("Back to rosters", "العودة إلى الجداول")}
        </button>
        <div className="flex flex-wrap items-center gap-2">
          {tried && shownErrors.length > 0 && (
            <span role="alert" className="text-[12.5px] text-error">{t("Fill in: ", "أكمل: ")}{shownErrors.join(isAr ? "، " : ", ")}</span>
          )}
          <OutlineButton onClick={() => navigate(back)}>{t("Cancel", "إلغاء")}</OutlineButton>
          <GoldButton onClick={create}><Check className="size-4" />{t("Create roster", "إنشاء الجدول")}</GoldButton>
        </div>
      </div>

      {/* 1 · team and dates */}
      <SectionCard icon={CalendarRange} title={t("Team and dates", "الفريق والتواريخ")}>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <FieldLabel required htmlFor="ros-dept">{t("Department", "الإدارة")}</FieldLabel>
            <PickField id="ros-dept" isAr={isAr} value={dept} onChange={pickDept} invalid={!!err("dept")}
              placeholder={t("Choose from the list", "اختر من القائمة")}
              options={departments().map((d) => ({ value: d.name, label: isAr ? d.nameAr : d.name, alt: isAr ? d.name : d.nameAr }))} />
            {err("dept") && <p className="mt-1.5 text-[12px] text-error">{err("dept")}</p>}
          </div>
          <div>
            {/* start and end share a row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel required htmlFor="ros-start">{t("Start date", "تاريخ البداية")}</FieldLabel>
                <input id="ros-start" type="date" value={startISO} aria-required aria-invalid={!!err("dates") || undefined}
                  onChange={(e) => { const v = e.target.value; setStartISO(v); if (v && endISO && endISO < v) setEndISO(v) }}
                  className={cn(fieldClass, err("dates") && "border-error")} dir="ltr" />
              </div>
              <div>
                <FieldLabel required htmlFor="ros-end">{t("End date", "تاريخ النهاية")}</FieldLabel>
                <input id="ros-end" type="date" value={endISO} min={startISO || undefined} aria-required aria-invalid={!!err("dates") || undefined}
                  onChange={(e) => setEndISO(e.target.value)} className={cn(fieldClass, err("dates") && "border-error")} dir="ltr" />
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]">
              {dayCount(startISO, endISO) > 0 && <span className="text-muted-foreground">{t(`${dayCount(startISO, endISO)} days`, `${dayCount(startISO, endISO)} يومًا`)}</span>}
              {presets.map((p) => (
                <button key={p.label} type="button" onClick={() => { setStartISO(p.from); setEndISO(p.to) }} className="text-primary hover:underline">{p.label}</button>
              ))}
            </div>
            {err("dates") && (
              <p className="mt-1.5 text-[12px] text-error">
                {err("dates")}{" "}
                {clash && <button className="underline" onClick={() => navigate(`/employee/rosters/${clash.id}`)}>{t("Open it", "افتحه")}</button>}
              </p>
            )}
          </div>
          <div>
            <FieldLabel htmlFor="ros-name">{t("Roster name", "اسم الجدول")}</FieldLabel>
            <input id="ros-name" value={name} onChange={(e) => setName(e.target.value)} className={fieldClass}
              placeholder={dept ? (isAr ? departments().find((d) => d.name === dept)?.nameAr : dept) : t("e.g. Terminal 5 lounge", "مثال: صالة المبنى ٥")} />
          </div>
          {/* the same name in the other language, beside it */}
          <div>
            <FieldLabel htmlFor="ros-name-alt">{t("Name in Arabic", "الاسم بالإنجليزية")} · {t("optional", "اختياري")}</FieldLabel>
            <input id="ros-name-alt" value={nameAlt} onChange={(e) => setNameAlt(e.target.value)} className={fieldClass} dir={isAr ? "ltr" : "rtl"} />
          </div>
        </div>
      </SectionCard>

      {/* 2 · people */}
      <SectionCard icon={Users} title={t("People on the roster", "الموظفون في الجدول")}
        action={<span className="text-[12px] tabular-nums text-muted-foreground">{t(`${members.length} chosen`, `${members.length} مختارون`)}</span>}>
        {!dept ? (
          <p className="text-[13px] text-muted-foreground">{t("Choose a department first.", "اختر الإدارة أولًا.")}</p>
        ) : (
          <>
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <label className="relative sm:w-72">
                <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-icon" />
                <input value={peopleQ} onChange={(e) => setPeopleQ(e.target.value)} placeholder={t("Search people", "ابحث عن موظف")}
                  aria-label={t("Search people", "ابحث عن موظف")} className={cn(fieldClass, "ps-9")} />
              </label>
              <div className="flex gap-2">
                <OutlineButton size="sm" onClick={() => setMembers((m) => [...new Set([...m, ...listed.map((p) => p.id)])])}>{t("Select all shown", "اختر كل المعروض")}</OutlineButton>
                <OutlineButton size="sm" onClick={() => setMembers([])}>{t("Clear", "مسح")}</OutlineButton>
              </div>
            </div>
            <ul aria-invalid={!!err("people") || undefined} className={cn("grid max-h-[360px] gap-2 overflow-y-auto p-0.5 sm:grid-cols-2 lg:grid-cols-3", err("people") && "rounded-lg ring-1 ring-error")}>
              {listed.map((p) => {
                const on = members.includes(p.id)
                return (
                  <li key={p.id}>
                    <label className={cn("flex cursor-pointer items-center gap-3 rounded-[10px] p-3 ring-1 ring-inset transition-colors",
                      on ? "bg-soft-accent ring-primary/40" : "bg-background ring-border hover:bg-secondary/60")}>
                      <input type="checkbox" checked={on} onChange={() => toggle(p.id)} className="size-4 shrink-0 accent-[var(--primary)]" />
                      <Initials text={p.initials} className="size-8 text-[11px]" />
                      <span className="min-w-0">
                        <span className="block truncate text-[13.5px] font-medium">{isAr ? p.nameAr : p.name}</span>
                        <span className="block truncate text-[12px] text-muted-foreground">{isAr ? p.titleAr : p.title}</span>
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
            {err("people") && <p className="mt-1.5 text-[12px] text-error">{err("people")}</p>}
          </>
        )}
      </SectionCard>

      {/* 3 · where the shifts come from */}
      <SectionCard icon={Repeat} title={t("Shifts", "المناوبات")}>
        <p className="mb-4 text-[12.5px] text-muted-foreground">
          {t("Each person keeps one shift and their weekly days off for the whole period.", "يحتفظ كل موظف بمناوبة واحدة وأيام راحته الأسبوعية طوال الفترة.")}
        </p>
        <div role="radiogroup" className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <StartCard on={start === "rollover"} onPick={() => source && setStart("rollover")} icon={Repeat} disabled={!source}
            title={t("Roll over the last roster", "ترحيل الجدول السابق")}
            body={source
              ? t(`Next shift suggested for each person from ${source.code}; you confirm them one by one.`, `يُقترح لكل موظف مناوبته التالية من ${source.code}، وتؤكدها واحدًا تلو الآخر.`)
              : t("No earlier roster for this department.", "لا يوجد جدول سابق لهذه الإدارة.")} />
          <StartCard on={start === "copy"} onPick={() => source && setStart("copy")} icon={Copy} disabled={!source}
            title={t("Keep the same shifts", "الإبقاء على المناوبات نفسها")}
            body={source ? `${source.code} · ${rosterName(source, isAr)} · ${periodLabel(source, isAr)}` : t("No earlier roster for this department.", "لا يوجد جدول سابق لهذه الإدارة.")} />
          <StartCard on={start === "auto"} onPick={() => setStart("auto")} icon={Wand2}
            title={t("Assign automatically", "التوزيع التلقائي")}
            body={t("Shifts are filled to meet the minimum cover below; you confirm them on the next page.", "تُوزَّع المناوبات بما يحقق الحد الأدنى للتغطية أدناه، وتؤكدها في الصفحة التالية.")} />
          <StartCard on={start === "blank"} onPick={() => setStart("blank")} icon={Eraser}
            title={t("Assign on the roster", "التعيين في الجدول")} body={t("Everyone starts without a shift; pick one per person on the next page.", "يبدأ الجميع بدون مناوبة؛ اختر لكل موظف في الصفحة التالية.")} />
        </div>

        {(start === "blank" || start === "auto") && (
          <div className="mt-5">
            <FieldLabel>{t("Weekly days off to start with", "أيام الراحة الأسبوعية المبدئية")}</FieldLabel>
            <WeekdayPills value={defaultOff} isAr={isAr} label={t("Weekly days off", "أيام الراحة الأسبوعية")}
              onToggle={(d) => setDefaultOff((v) => (v.includes(d) ? v.filter((x) => x !== d) : [...v, d].sort()))} />
            <p className="mt-1.5 text-[12px] text-muted-foreground">{t("Change them per person on the roster.", "يمكن تغييرها لكل موظف في الجدول.")}</p>
          </div>
        )}

        <div className="mt-5">
          <FieldLabel>{t("Rotation order at rollover", "ترتيب التناوب عند الترحيل")}</FieldLabel>
          <RotationPicker value={rotation} onChange={setRotation} options={working} isAr={isAr} t={t} />
        </div>
      </SectionCard>

      {/* 4 · minimum cover */}
      <SectionCard icon={ShieldCheck} title={t("Minimum cover", "الحد الأدنى للتغطية")}>
        <p className="mb-4 text-[12.5px] text-muted-foreground">
          {t("The fewest people each shift needs on a day, after days off and leave. Leave at 0 for no minimum.",
             "أقل عدد من الموظفين تحتاجه كل مناوبة في اليوم بعد أيام الراحة والإجازات. اتركه 0 إن لم يكن هناك حد.")}
        </p>
        <div className="mb-4">
          <Segmented<"all" | "weekdays"> ariaLabel={t("Minimum applies on", "يُطبَّق الحد الأدنى في")}
            value={coverWeekends ? "all" : "weekdays"} onChange={(v) => setCoverWeekends(v === "all")}
            options={[{ value: "all", label: t("Every day", "كل الأيام") }, { value: "weekdays", label: t("Sunday–Thursday only", "من الأحد إلى الخميس فقط") }]} />
        </div>
        {(() => {
          // the people these minimums need, against the people chosen
          const off = source ? (source.memberIds.map((pid) => assignmentOf(source, pid).daysOff)[0] ?? defaultOff) : defaultOff
          const need = peopleNeeded(minCover, coverWeekends, off)
          if (!need) return null
          const ok = members.length >= need
          return (
            <div className={cn("mb-4 flex items-start gap-2.5 rounded-[10px] px-3 py-2.5 text-[13px]", ok ? "bg-success-fill text-success" : "bg-error-fill text-error")}>
              {ok ? <CircleCheck className="mt-0.5 size-4 shrink-0" /> : <AlertTriangle className="mt-0.5 size-4 shrink-0" />}
              <span>
                {ok ? t(`Enough people: these minimums need at least ${need}; ${members.length} chosen.`, `العدد كافٍ: تحتاج هذه الحدود الدنيا إلى ${need} على الأقل؛ واخترت ${members.length}.`)
                  : t(`Not enough people: these minimums need at least ${need}; ${members.length} chosen. Add ${need - members.length} more, or lower a minimum.`,
                      `العدد غير كافٍ: تحتاج هذه الحدود الدنيا إلى ${need} على الأقل؛ واخترت ${members.length}. أضف ${need - members.length}، أو خفّض أحد الحدود.`)}
              </span>
            </div>
          )
        })()}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {working.map((s) => (
            <label key={s.id} className="flex items-center justify-between gap-3 rounded-[10px] bg-background p-3 ring-1 ring-border ring-inset">
              <span className="flex min-w-0 items-center gap-2 text-[13px]"><ShiftCode shift={s} className="h-6 min-w-6" /><span className="truncate">{isAr ? s.nameAr : s.name}</span></span>
              <input type="number" min={0} max={50} value={minCover[s.id] ?? 0}
                onChange={(e) => setMinCover((m) => ({ ...m, [s.id]: Math.max(0, Math.round(Number(e.target.value) || 0)) }))}
                aria-label={t(`Minimum on ${s.name}`, `الحد الأدنى في ${s.nameAr}`)} className={cn(fieldClass, "w-16 text-center tabular-nums")} />
            </label>
          ))}
        </div>
      </SectionCard>
    </Page>
  )
}

function StartCard({ on, onPick, icon: Icon, title, body, disabled }: {
  on: boolean; onPick: () => void; icon: React.ComponentType<{ className?: string }>; title: string; body: string; disabled?: boolean
}) {
  return (
    <button type="button" role="radio" aria-checked={on} onClick={onPick} disabled={disabled}
      className={cn("flex flex-col items-start gap-1.5 rounded-[10px] p-4 text-start ring-1 ring-inset transition-colors disabled:opacity-50",
        on ? "bg-soft-accent ring-primary/50" : "bg-background ring-border hover:bg-secondary/60")}>
      <span className="flex items-center gap-2 text-[14px] font-medium"><Icon className="size-4 text-primary" />{title}</span>
      <span className="text-[12.5px] text-muted-foreground">{body}</span>
    </button>
  )
}
