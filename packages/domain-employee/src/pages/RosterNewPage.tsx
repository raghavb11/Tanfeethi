import * as React from "react"
import { useNavigate } from "react-router-dom"
import { cn } from "@reach/shared-core"
import { matchesSearch } from "@reach/shared-ui"
import { useShell, usePageTitle } from "@reach/shell-context"
import { getShiftType, useShiftTypes } from "@reach/domain-content/master-data"
import {
  ArrowLeft, CalendarRange, Check, Copy, Eraser, Repeat, Search, ShieldCheck, Undo2, Users,
} from "lucide-react"

import {
  addPattern, addRoster, cellKey, daysBetween, departments, fillTeam, latestRosterFor, liveRosters, monthEnd,
  monthStart, peopleIn, periodLabel, type RosterPeriod, rosterDays, ROSTER_TODAY_ISO, rosterName,
  useCanManageRosters, usePatterns, useRosters, weekStart, addDays, fullDate,
} from "../data/rosters"
import { Empty, FieldLabel, GoldButton, Initials, OutlineButton, Page, SectionCard, Toggle, fieldClass } from "../components/wijha"
import { PickField, Segmented, ShiftCode, ShiftLabel } from "../components/RosterBits"

type Start = "blank" | "copy" | "pattern"

/** New roster — a full routed page. Team and period first, then who is on it,
 *  then what it starts from; the grid itself is edited on the roster page. */
export default function RosterNewPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const canManage = useCanManageRosters()
  const rosters = useRosters()
  const patterns = usePatterns()
  const shiftTypes = useShiftTypes()
  const working = shiftTypes.filter((s) => s.active && !s.isOff)
  usePageTitle("New roster", "جدول جديد")

  const back = "/employee/rosters"
  const [dept, setDept] = React.useState("")
  const [name, setName] = React.useState("")
  const [nameAlt, setNameAlt] = React.useState("")
  const [period, setPeriod] = React.useState<RosterPeriod>("week")
  // next week by default — this week is usually already planned
  const [startISO, setStartISO] = React.useState(addDays(weekStart(ROSTER_TODAY_ISO), 7))
  const [members, setMembers] = React.useState<string[]>([])
  const [peopleQ, setPeopleQ] = React.useState("")
  const [start, setStart] = React.useState<Start>("pattern")
  const [patternId, setPatternId] = React.useState(patterns[0]?.id ?? "")
  const [custom, setCustom] = React.useState<string[]>([])
  const [useCustom, setUseCustom] = React.useState(false)
  const [savePattern, setSavePattern] = React.useState(false)
  const [patternName, setPatternName] = React.useState("")
  const [minCover, setMinCover] = React.useState<Record<string, number>>({})
  const [coverWeekends, setCoverWeekends] = React.useState(true)
  const [tried, setTried] = React.useState(false)

  const source = dept ? latestRosterFor(rosters, dept) : undefined
  const range = period === "week"
    ? { startISO: weekStart(startISO), endISO: addDays(weekStart(startISO), 6) }
    : { startISO: monthStart(startISO), endISO: monthEnd(startISO) }
  const days = daysBetween(range.startISO, range.endISO)
  const clash = dept ? liveRosters(rosters).find((r) => r.department === dept && r.startISO <= range.endISO && range.startISO <= r.endISO) : undefined
  const pattern = useCustom ? { sequence: custom, stagger: true } : patterns.find((p) => p.id === patternId)

  // picking a department fills the team from its last roster, and its names and cover
  const pickDept = (d: string) => {
    setDept(d)
    const last = latestRosterFor(rosters, d)
    setMembers(last ? last.memberIds : [])
    setMinCover(last ? last.minCover : {})
    setCoverWeekends(last ? last.coverWeekends : true)
    if (last) { setName(isAr ? last.nameAr : last.name); setNameAlt(isAr ? last.name : last.nameAr) }
    else { setName(""); setNameAlt("") }
    setStart(last ? "copy" : "pattern")
  }

  const people = dept ? peopleIn(dept) : []
  const listed = people.filter((p) => matchesSearch(peopleQ, p.name, p.nameAr, p.title, p.titleAr))
  const toggle = (id: string) => setMembers((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]))

  const errors = {
    dept: !dept && t("Choose the department", "اختر الإدارة"),
    people: members.length === 0 && t("Choose at least one person", "اختر موظفًا واحدًا على الأقل"),
    clash: !!clash && t(`${clash.code} already covers ${periodLabel(clash, false)} for this department`,
      `الجدول ${clash.code} يغطي ${periodLabel(clash, true)} لهذه الإدارة`),
    pattern: start === "pattern" && (!pattern || pattern.sequence.length === 0) && t("Choose or build a pattern", "اختر نمطًا أو أنشئ نمطًا"),
    patternName: start === "pattern" && useCustom && savePattern && !patternName.trim() && t("Name the pattern to save it", "سمِّ النمط لحفظه"),
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
    let cells: Record<string, string> = {}
    let how = { en: "Created a blank roster", ar: "أنشأ جدولًا فارغًا" }
    if (start === "copy" && source) {
      // day n of the new period takes day n of the last one (wrapping for a longer period)
      const src = rosterDays(source)
      for (const pid of members) {
        if (!source.memberIds.includes(pid)) continue
        days.forEach((iso, i) => {
          const v = source.cells[cellKey(pid, src[i % src.length])]
          if (v) cells[cellKey(pid, iso)] = v
        })
      }
      how = { en: `Copied from ${source.code}`, ar: `نسخ الجدول من ${source.code}` }
    } else if (start === "pattern" && pattern) {
      cells = fillTeam(members, days, pattern)
      let label = useCustom ? custom.map((id) => getShiftType(id)?.code ?? id).join(" ") : ""
      let labelAr = label
      if (!useCustom) {
        const p = patterns.find((x) => x.id === patternId)!
        label = p.name; labelAr = p.nameAr
      } else if (savePattern) {
        addPattern({ name: patternName.trim(), nameAr: patternName.trim(), sequence: custom, stagger: true })
        label = labelAr = patternName.trim()
      }
      how = { en: `Created the roster from ${label}`, ar: `أنشأ الجدول من نمط ${labelAr}` }
    }
    const id = addRoster({
      name: isAr ? alt : main, nameAr: isAr ? main : alt,
      department: deptRow.name, departmentAr: deptRow.nameAr,
      period, ...range, memberIds: members, cells, minCover, coverWeekends,
    }, how)
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

      {/* 1 · team and period */}
      <SectionCard icon={CalendarRange} title={t("Team and period", "الفريق والفترة")}>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <FieldLabel required htmlFor="ros-dept">{t("Department", "الإدارة")}</FieldLabel>
            <PickField id="ros-dept" isAr={isAr} value={dept} onChange={pickDept} invalid={!!err("dept")}
              placeholder={t("Choose from the list", "اختر من القائمة")}
              options={departments().map((d) => ({ value: d.name, label: isAr ? d.nameAr : d.name, alt: isAr ? d.name : d.nameAr }))} />
            {err("dept") && <p className="mt-1.5 text-[12px] text-error">{err("dept")}</p>}
          </div>
          <div>
            <FieldLabel>{t("Period", "الفترة")}</FieldLabel>
            <div className="flex flex-wrap items-center gap-3">
              <Segmented<RosterPeriod> ariaLabel={t("Period", "الفترة")} value={period} onChange={setPeriod}
                options={[{ value: "week", label: t("Week", "أسبوع") }, { value: "month", label: t("Month", "شهر") }]} />
              {period === "week" ? (
                <input type="date" value={startISO} onChange={(e) => e.target.value && setStartISO(e.target.value)}
                  aria-label={t("Any day in the week", "أي يوم في الأسبوع")} className={cn(fieldClass, "w-auto")} dir="ltr" />
              ) : (
                <input type="month" value={startISO.slice(0, 7)} onChange={(e) => e.target.value && setStartISO(`${e.target.value}-01`)}
                  aria-label={t("Month", "الشهر")} className={cn(fieldClass, "w-auto")} dir="ltr" />
              )}
            </div>
            <p className="mt-1.5 text-[12px] text-muted-foreground">
              {fullDate(range.startISO, isAr)} – {fullDate(range.endISO, isAr)} · {t(`${days.length} days`, `${days.length} يومًا`)}
            </p>
            {err("clash") && (
              <p className="mt-1.5 text-[12px] text-error" aria-invalid="true">
                {err("clash")}{" "}
                <button className="underline" onClick={() => navigate(`/employee/rosters/${clash!.id}`)}>{t("Open it", "افتحه")}</button>
              </p>
            )}
          </div>
          <div className="md:col-span-2">
            <FieldLabel htmlFor="ros-name">{t("Roster name", "اسم الجدول")}</FieldLabel>
            <input id="ros-name" value={name} onChange={(e) => setName(e.target.value)} className={fieldClass}
              placeholder={dept ? (isAr ? departments().find((d) => d.name === dept)?.nameAr : dept) : t("e.g. Terminal 5 lounge", "مثال: صالة المبنى ٥")} />
            {/* the same name in the other language, directly beneath it */}
            <FieldLabel htmlFor="ros-name-alt" className="mt-3 text-[12px] font-normal text-muted-foreground">
              {t("Name in Arabic", "الاسم بالإنجليزية")} · {t("optional", "اختياري")}
            </FieldLabel>
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

      {/* 3 · starting point */}
      <SectionCard icon={Repeat} title={t("Start from", "البداية من")}>
        <div className="grid gap-3 md:grid-cols-3">
          <StartCard on={start === "pattern"} onPick={() => setStart("pattern")} icon={Repeat}
            title={t("A rotation pattern", "نمط تناوب")} body={t("Repeat a sequence of shifts, staggered across the team.", "كرّر تسلسل مناوبات موزعًا على الفريق.")} />
          <StartCard on={start === "copy"} onPick={() => source && setStart("copy")} icon={Copy} disabled={!source}
            title={t("Copy the last period", "نسخ الفترة السابقة")}
            body={source ? `${source.code} · ${rosterName(source, isAr)} · ${periodLabel(source, isAr)}` : t("No earlier roster for this department.", "لا يوجد جدول سابق لهذه الإدارة.")} />
          <StartCard on={start === "blank"} onPick={() => setStart("blank")} icon={Eraser}
            title={t("Blank", "فارغ")} body={t("Every day unplanned; fill it in on the grid.", "كل الأيام غير مخططة؛ املأها في الجدول.")} />
        </div>

        {start === "pattern" && (
          <div className="mt-5 flex flex-col gap-4">
            <Segmented<"saved" | "custom"> ariaLabel={t("Pattern", "النمط")} value={useCustom ? "custom" : "saved"} onChange={(v) => setUseCustom(v === "custom")}
              options={[{ value: "saved", label: t("Saved pattern", "نمط محفوظ") }, { value: "custom", label: t("Build one", "أنشئ نمطًا") }]} />
            {!useCustom ? (
              <div className="max-w-xl">
                <PickField isAr={isAr} value={patternId} onChange={setPatternId} ariaLabel={t("Pattern", "النمط")} placeholder={t("Choose a pattern", "اختر نمطًا")}
                  options={patterns.map((p) => ({ value: p.id, label: isAr ? p.nameAr : p.name, alt: isAr ? p.name : p.nameAr }))} />
                {pattern && <Sequence ids={pattern.sequence} />}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-[12.5px] text-muted-foreground">{t("Tap shifts in the order one person works them; the team starts at different steps.", "اضغط المناوبات بالترتيب الذي يعمل به الموظف؛ يبدأ كل فرد من خطوة مختلفة.")}</p>
                <div className="flex flex-wrap gap-2">
                  {shiftTypes.filter((s) => s.active).map((s) => (
                    <button key={s.id} type="button" onClick={() => setCustom((c) => [...c, s.id])}
                      className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-3 text-[13px] hover:bg-secondary">
                      <ShiftCode shift={s} className="h-6 min-w-6" /><ShiftLabel shift={s} isAr={isAr} compact />
                    </button>
                  ))}
                  <button type="button" onClick={() => setCustom((c) => c.slice(0, -1))} disabled={!custom.length}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] text-muted-foreground hover:bg-secondary disabled:opacity-40">
                    <Undo2 className="size-4" />{t("Undo", "تراجع")}
                  </button>
                </div>
                <Sequence ids={custom} empty={t("No steps yet.", "لا توجد خطوات بعد.")} />
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Toggle checked={savePattern} onChange={setSavePattern} label={t("Save for reuse", "حفظه لإعادة الاستخدام")} />
                  {savePattern && (
                    <input value={patternName} onChange={(e) => setPatternName(e.target.value)} aria-invalid={!!err("patternName") || undefined}
                      placeholder={t("Pattern name", "اسم النمط")} className={cn(fieldClass, "sm:w-72", err("patternName") && "border-error")} />
                  )}
                </div>
              </div>
            )}
            {err("pattern") && <p className="text-[12px] text-error" aria-invalid="true">{err("pattern")}</p>}
          </div>
        )}
      </SectionCard>

      {/* 4 · minimum cover */}
      <SectionCard icon={ShieldCheck} title={t("Minimum cover", "الحد الأدنى للتغطية")}>
        <p className="mb-4 text-[12.5px] text-muted-foreground">
          {t("The fewest people each shift needs on a day. Days below it are flagged on the roster. Leave at 0 for no minimum.",
             "أقل عدد من الموظفين تحتاجه كل مناوبة في اليوم. تُعلَّم الأيام الأقل منه في الجدول. اتركه 0 إن لم يكن هناك حد.")}
        </p>
        <div className="mb-4">
          <Segmented<"all" | "weekdays"> ariaLabel={t("Minimum applies on", "يُطبَّق الحد الأدنى في")}
            value={coverWeekends ? "all" : "weekdays"} onChange={(v) => setCoverWeekends(v === "all")}
            options={[{ value: "all", label: t("Every day", "كل الأيام") }, { value: "weekdays", label: t("Sunday–Thursday only", "من الأحد إلى الخميس فقط") }]} />
        </div>
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

function Sequence({ ids, empty }: { ids: string[]; empty?: string }) {
  if (!ids.length) return empty ? <p className="text-[12.5px] text-muted-foreground">{empty}</p> : null
  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5" dir="ltr">
      {ids.map((id, i) => <ShiftCode key={i} shift={getShiftType(id)} className="h-7 min-w-7" />)}
      <span className="ms-1 text-[12px] text-muted-foreground">↻</span>
    </div>
  )
}
