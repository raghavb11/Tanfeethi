import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { cn } from "@reach/shared-core"
import { useShell, usePageTitle } from "@reach/shell-context"
import { getShiftType, useShiftTypes } from "@reach/domain-content/master-data"
import {
  AlertTriangle, ArrowLeft, CalendarOff, CalendarRange, Check, CheckCheck, CircleCheck, Clock3, History, ListChecks, Plane,
  Repeat, RotateCcw, Send, ShieldAlert, ShieldCheck, Sparkles, Trash2, Undo2, UserPlus, Users, Wand2,
} from "lucide-react"

import {
  assignmentOf, autoAssign, confirmAllSuggestions, confirmSuggestion, coverageGaps, dayCount, dayMonth, datesProblem, deleteRoster,
  moveDayOff, setChangeNow, shiftChangeDate, shiftChangeWindow, staffingCheck, type StaffingAdvice,
  fullDate, gapDays, getRoster, type IssueKind, liveRosters, periodLabel, publishBlockers, publishRoster, restoreRoster,
  rolloverDates, rolloverRoster, ROSTER_TODAY_ISO, rosterIssues, rosterName, rotationText, setCoverWeekends, setMinCover,
  setRosterDates, setRotation, setShift, shiftName, toggleDayOff, unpublishRoster, useCanManageRosters, useRosterLog,
  useRosters, WEEKDAYS, weeklyCover, weeklyHours,
} from "../data/rosters"
import { personById } from "../data/mock/org"
import { Chip, Empty, GoldButton, Initials, OutlineButton, Page, SectionCard, Tile } from "../components/wijha"
import { ConfirmDelete, PickField, RotationPicker, ShiftCode, ShiftHours, WeekdayPills } from "../components/RosterBits"

const ISSUE_ICON: Record<IssueKind, typeof Clock3> = { handover: Clock3, "rest-day": CalendarOff, leave: Plane }

/** One roster period: each person's shift and weekly days off, the cover that
 *  gives in a typical week, what needs checking, and the rollover to the next
 *  period. A full routed page; only the delete confirmation is a dialog. */
export default function RosterEditorPage() {
  const { locale, role } = useShell()
  const isAdmin = role === "admin"
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const { id = "" } = useParams()
  const all = useRosters()
  const shiftTypes = useShiftTypes()
  const canManage = useCanManageRosters()
  const r = getRoster(id)
  const log = useRosterLog(id)
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  // section-level inline edits (not dialogs)
  const [dates, setDates] = React.useState<{ start: string; end: string } | null>(null)
  const [editRotation, setEditRotation] = React.useState<string[] | null>(null)
  usePageTitle(r ? `Roster: ${rosterName(r, false)}` : undefined, r ? `الجدول: ${rosterName(r, true)}` : undefined)

  if (!r) {
    return (
      <Page>
        <SectionCard icon={CalendarRange} title={t("Roster", "الجدول")}>
          <Empty icon={CalendarRange} title={t("That roster does not exist.", "هذا الجدول غير موجود.")}
            action={<OutlineButton size="sm" onClick={() => navigate("/employee/rosters")}>{t("Back to rosters", "العودة إلى الجداول")}</OutlineButton>} />
        </SectionCard>
      </Page>
    )
  }

  const editable = canManage && !r.deleted
  const working = shiftTypes.filter((s) => !s.isOff && (s.active || Object.values(r.assignments).some((a) => a.shiftId === s.id)))
  const issues = rosterIssues(r)
  const gaps = coverageGaps(r)
  const blockers = publishBlockers(r)
  const staffing = staffingCheck(r)
  const applyAdvice = (x: StaffingAdvice) => {
    if (x.apply?.kind === "shift") setShift(r.id, x.apply.personId, x.apply.shiftId)
    if (x.apply?.kind === "day-off") moveDayOff(r.id, x.apply.personId, x.apply.from, x.apply.to)
  }
  const ADVICE_ICON = { "add-people": UserPlus, "move-person": Users, "move-day-off": CalendarOff, leave: Plane, "change-over": Repeat } as const
  const weekly = weeklyCover(r)
  const coverRows = working.filter((s) => weekly[s.id] || (r.minCover[s.id] ?? 0) > 0)
  const next = rolloverDates(r)
  const nextExisting = liveRosters(all).find((x) => x.id !== r.id && x.department === r.department && x.startISO <= next.endISO && next.startISO <= x.endISO)
  const prev = r.previousId ? getRoster(r.previousId) : undefined
  const shiftOptions = shiftTypes.filter((s) => s.active && !s.isOff).map((s) => ({
    value: s.id, label: isAr ? s.nameAr : s.name, alt: isAr ? s.name : s.nameAr,
    lead: <ShiftCode shift={s} className="h-6 min-w-6" />, hint: <ShiftHours shift={s} isAr={isAr} />,
  }))
  const blockerText = [
    blockers.toConfirm && t(`confirm ${blockers.toConfirm} suggested shifts`, `أكّد ${blockers.toConfirm} مناوبات مقترحة`),
    blockers.noShift && t(`give ${blockers.noShift} people a shift`, `حدّد مناوبة لـ ${blockers.noShift} موظفين`),
  ].filter(Boolean).join(isAr ? " و" : " and ")
  const doRollover = () => { const nid = rolloverRoster(r.id); if (nid) navigate(`/employee/rosters/${nid}`) }

  return (
    <Page className="flex flex-col gap-6">
      {/* ── header card ── */}
      <section className="highlight-card flex flex-col gap-6 rounded-2xl px-5 py-6 lg:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button onClick={() => navigate("/employee/rosters")}
            className="inline-flex h-[34px] items-center gap-2 rounded-lg px-3 text-[13.5px] font-medium transition-colors hover:bg-foreground/5">
            <ArrowLeft className={cn("size-[14px]", isAr && "rotate-180")} />{t("Back to rosters", "العودة إلى الجداول")}
          </button>
          {editable && (
            <div className="flex flex-wrap items-center justify-end gap-2">
              {blockers.blocked && (r.status === "draft" || r.changedSincePublish) && (
                <span className="text-[12.5px] text-warning">{t("To publish: ", "للنشر: ")}{blockerText}</span>
              )}
              <OutlineButton onClick={() => setConfirmDelete(true)} className="text-error"><Trash2 className="size-4" />{t("Delete", "حذف")}</OutlineButton>
              {r.status === "published" && (
                <OutlineButton onClick={() => unpublishRoster(r.id)}><Undo2 className="size-4" />{t("Withdraw to draft", "إعادته إلى مسودة")}</OutlineButton>
              )}
              {(r.status === "draft" || r.changedSincePublish) && (
                <GoldButton disabled={blockers.blocked} onClick={() => publishRoster(r.id)}>
                  <Send className="size-4" />{r.status === "draft" ? t("Publish", "نشر") : t("Publish changes", "نشر التعديلات")}
                </GoldButton>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-[27px] font-normal leading-[38px] tracking-[-0.27px]">{rosterName(r, isAr)}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[13.5px] text-muted-foreground">
              <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] tabular-nums">{r.code}</span>
              <span>{isAr ? r.departmentAr : r.department}</span><span>·</span>
              {!dates && <>
                <span>{periodLabel(r, isAr)}</span>
                <span className="tabular-nums">({t(`${dayCount(r.startISO, r.endISO)} days`, `${dayCount(r.startISO, r.endISO)} يومًا`)})</span>
                {editable && (
                  <button onClick={() => setDates({ start: r.startISO, end: r.endISO })} className="text-[12.5px] text-primary hover:underline">{t("Change dates", "تغيير التواريخ")}</button>
                )}
              </>}
              {r.deleted ? <Chip tone="error">{t("Deleted", "محذوف")}</Chip>
                : r.status === "published"
                  ? <Chip tone="success">{r.changedSincePublish ? t("Published · unsent changes", "منشور · تعديلات غير منشورة") : t("Published", "منشور")}</Chip>
                  : <Chip tone="warning">{t("Draft", "مسودة")}</Chip>}
            </div>
            {prev && (
              <p className="mt-2 text-[12.5px] text-muted-foreground">
                {t("Rolled over from", "مُرحّل من")}{" "}
                <button onClick={() => navigate(`/employee/rosters/${prev.id}`)} className="text-primary hover:underline">{prev.code} · {periodLabel(prev, isAr)}</button>
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label={t("People", "الموظفون")} value={r.memberIds.length} />
            <Stat label={t("To confirm", "للتأكيد")} value={blockers.toConfirm} tone={blockers.toConfirm ? "warning" : undefined} />
            <Stat label={t("To check", "للمراجعة")} value={issues.filter((x) => x.kind !== "leave").length} tone={issues.some((x) => x.kind !== "leave") ? "warning" : undefined} />
            <Stat label={t("Days short", "أيام النقص")} value={gapDays(r)} tone={gaps.length ? "error" : undefined} />
          </div>
        </div>
      </section>

      {dates && (() => {
        const problem = datesProblem(all, r.department, dates.start, dates.end, r.id)
        return (
          <section className="panel flex flex-col gap-3 rounded-xl px-4 py-4 sm:px-6" aria-label={t("Change dates", "تغيير التواريخ")}>
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1.5 text-[13px] font-medium">
                <span>{t("Start date", "تاريخ البداية")}<span className="text-error"> *</span></span>
                <input type="date" value={dates.start} dir="ltr" aria-required
                  onChange={(e) => setDates((d) => d && { start: e.target.value, end: d.end && d.end < e.target.value ? e.target.value : d.end })}
                  className="h-9 rounded-lg border border-border bg-background px-3 text-[13px] outline-none focus:border-primary/60" />
              </label>
              <label className="flex flex-col gap-1.5 text-[13px] font-medium">
                <span>{t("End date", "تاريخ النهاية")}<span className="text-error"> *</span></span>
                <input type="date" value={dates.end} min={dates.start || undefined} dir="ltr" aria-required
                  onChange={(e) => setDates((d) => d && { ...d, end: e.target.value })}
                  className="h-9 rounded-lg border border-border bg-background px-3 text-[13px] outline-none focus:border-primary/60" />
              </label>
              <div className="flex gap-2">
                <OutlineButton onClick={() => setDates(null)}>{t("Cancel", "إلغاء")}</OutlineButton>
                <GoldButton disabled={!!problem} onClick={() => { setRosterDates(r.id, dates.start, dates.end); setDates(null) }}>{t("Save dates", "حفظ التواريخ")}</GoldButton>
              </div>
            </div>
            {problem && <p className="text-[12px] text-error">{isAr ? problem.ar : problem.en}</p>}
          </section>
        )
      })()}

      {r.deleted && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-error-fill px-4 py-3 text-[13px] text-error">
          <span>{t(`Deleted on ${fullDate(r.deletedISO ?? ROSTER_TODAY_ISO, false)}. It is kept for the record and can be restored.`,
                   `حُذف في ${fullDate(r.deletedISO ?? ROSTER_TODAY_ISO, true)}. محفوظ للسجل ويمكن استعادته.`)}</span>
          {canManage && <OutlineButton size="sm" onClick={() => restoreRoster(r.id)}><RotateCcw className="size-3.5" />{t("Restore", "استعادة")}</OutlineButton>}
        </div>
      )}

      {/* ── staffing check: enough people for the minimum cover? ── */}
      <SectionCard icon={Sparkles} title={t("Staffing check", "فحص التوظيف")}
        action={editable ? (
          <GoldButton size="sm" onClick={() => autoAssign(r.id)}
            disabled={!r.memberIds.some((pid) => { const a = assignmentOf(r, pid); return !a.shiftId || a.suggestedFrom })}
            title={t("Fill every shift that is not confirmed yet so the minimum cover is met", "املأ كل مناوبة غير مؤكدة بما يحقق الحد الأدنى للتغطية")}>
            <Wand2 className="size-4" />{t("Auto-assign shifts", "توزيع المناوبات تلقائيًا")}
          </GoldButton>
        ) : undefined}>
        <div className={cn("flex items-start gap-3 rounded-[10px] px-4 py-3 text-[13.5px]",
          staffing.verdict === "enough" ? "bg-success-fill text-success" : staffing.verdict === "rearrange" ? "bg-warning-fill text-warning" : "bg-error-fill text-error")}>
          {staffing.verdict === "enough" ? <CircleCheck className="mt-0.5 size-5 shrink-0" /> : staffing.verdict === "rearrange" ? <AlertTriangle className="mt-0.5 size-5 shrink-0" /> : <ShieldAlert className="mt-0.5 size-5 shrink-0" />}
          <div className="min-w-0">
            <div className="font-semibold">
              {staffing.verdict === "enough" ? t("Enough people for this staffing", "عدد الموظفين كافٍ لهذه التغطية")
                : staffing.verdict === "rearrange" ? t("Enough people — but they need rearranging", "العدد كافٍ — لكن يلزم إعادة الترتيب")
                  : t("Not enough people for this staffing", "عدد الموظفين غير كافٍ لهذه التغطية")}
            </div>
            <div className="text-[12.5px] opacity-90">
              {staffing.needed
                ? t(`The minimum cover needs at least ${staffing.needed} people; the roster has ${staffing.have}.`, `يتطلب الحد الأدنى للتغطية ${staffing.needed} موظفين على الأقل؛ والجدول فيه ${staffing.have}.`)
                : t("No minimum cover is set — set one below to check the staffing.", "لم يُحدَّد حد أدنى للتغطية — حدّده أدناه لفحص التوظيف.")}
            </div>
          </div>
        </div>
        {staffing.shifts.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 text-[12.5px]">
            {staffing.shifts.map((s) => {
              const ok = s.headcount >= s.needed && s.shortWeekdays.length === 0
              return (
                <span key={s.shiftId} className={cn("inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 ring-1 ring-inset",
                  ok ? "ring-border" : "ring-warning/50 bg-warning-fill/50")}>
                  <ShiftCode shift={getShiftType(s.shiftId)} className="h-6 min-w-6" />
                  {shiftName(s.shiftId, isAr)} · {t(`${s.headcount} of ${s.needed} people`, `${s.headcount} من ${s.needed} موظفين`)}
                  {s.shortWeekdays.length > 0 && <span className="text-warning">· {t("short", "ناقصة")} {s.shortWeekdays.map((d) => (isAr ? WEEKDAYS[d].ar : WEEKDAYS[d].en)).join(isAr ? "، " : ", ")}</span>}
                </span>
              )
            })}
          </div>
        )}
        {staffing.advice.length > 0 && (
          <ul className="mt-4 flex flex-col gap-2">
            {staffing.advice.map((x, i) => {
              const Icon = ADVICE_ICON[x.kind]
              return (
                <li key={i}>
                  <Tile className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="flex items-start gap-2.5 text-[13px]"><Icon className="mt-0.5 size-4 shrink-0 text-primary" />{isAr ? x.textAr : x.text}</span>
                    {editable && x.apply && (
                      <OutlineButton size="sm" onClick={() => applyAdvice(x)}><Check className="size-3.5" />{t("Apply", "تطبيق")}</OutlineButton>
                    )}
                  </Tile>
                </li>
              )
            })}
          </ul>
        )}
      </SectionCard>

      {/* ── shifts for the period ── */}
      <SectionCard icon={Users} title={t("Shifts for this period", "المناوبات لهذه الفترة")}
        action={editable && blockers.toConfirm > 0 ? (
          <OutlineButton size="sm" onClick={() => confirmAllSuggestions(r.id)}><CheckCheck className="size-4" />{t("Confirm all suggestions", "تأكيد كل المقترحات")}</OutlineButton>
        ) : undefined}>
        <p className="mb-4 text-[12.5px] text-muted-foreground">
          {t("Each person works the same shift every working day of the period. Highlighted days are their weekly days off.",
             "يعمل كل موظف المناوبة نفسها في كل أيام عمله خلال الفترة. الأيام المميزة هي أيام راحته الأسبوعية.")}
        </p>
        {blockers.toConfirm > 0 && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-warning-fill px-3 py-2.5 text-[12.5px] text-warning">
            <Repeat className="mt-0.5 size-4 shrink-0" />
            <span>{t(`${blockers.toConfirm} shifts are suggestions from the rollover (${rotationText(r.rotation, false)}). Confirm each one, or pick a different shift.`,
                     `${blockers.toConfirm} مناوبات مقترحة من الترحيل (${rotationText(r.rotation, true)}). أكّد كل واحدة أو اختر مناوبة أخرى.`)}</span>
          </div>
        )}
        {/* the table scrolls inside its card on narrow screens; the page never scrolls sideways */}
        <div className="overflow-x-auto rounded-[10px] ring-1 ring-border ring-inset [scrollbar-width:thin]">
          <table className="w-full min-w-[820px] text-[13px]">
            <thead>
              <tr className="text-[12px] text-muted-foreground">
                <th scope="col" className="border-b border-border px-3 py-2 text-start font-medium">{t("Employee", "الموظف")}</th>
                <th scope="col" className="border-b border-border px-3 py-2 text-start font-medium">{t("Shift for the period", "مناوبة الفترة")}</th>
                <th scope="col" className="border-b border-border px-3 py-2 text-start font-medium">{t("Weekly days off", "أيام الراحة الأسبوعية")}</th>
                <th scope="col" className="border-b border-border px-3 py-2 text-end font-medium">{t("Hours / week", "ساعات / أسبوع")}</th>
              </tr>
            </thead>
            <tbody>
              {r.memberIds.map((pid) => {
                const p = personById(pid)
                const a = assignmentOf(r, pid)
                const mine = issues.filter((x) => x.personId === pid)
                return (
                  <tr key={pid} className={cn(a.suggestedFrom && "bg-warning-fill/40")}>
                    <th scope="row" className="border-b border-border px-3 py-2.5 text-start align-top font-normal">
                      <div className="flex items-center gap-2.5">
                        <Initials text={p?.initials ?? "?"} className="size-8 text-[11px]" />
                        <div className="min-w-0">
                          <div className="truncate font-medium">{p ? (isAr ? p.nameAr : p.name) : pid}</div>
                          <div className="truncate text-[11.5px] text-muted-foreground">{p ? (isAr ? p.titleAr : p.title) : ""}</div>
                        </div>
                      </div>
                      {mine.map((x, i) => {
                        const Icon = ISSUE_ICON[x.kind]
                        return (
                          <p key={i} className={cn("mt-1.5 flex max-w-[360px] items-start gap-1.5 text-[11.5px]", x.kind === "leave" ? "text-muted-foreground" : "text-warning")}>
                            <Icon className="mt-0.5 size-3.5 shrink-0" />{isAr ? x.textAr : x.text}
                          </p>
                        )
                      })}
                    </th>
                    <td className="border-b border-border px-3 py-2.5 align-top">
                      {editable ? (
                        <div className="flex flex-col gap-1.5">
                          <PickField className="w-56" isAr={isAr} value={a.shiftId} onChange={(v) => setShift(r.id, pid, v)} options={shiftOptions}
                            invalid={!a.shiftId} placeholder={t("Choose a shift", "اختر مناوبة")}
                            ariaLabel={t(`Shift for ${p?.name ?? ""}`, `مناوبة ${p?.nameAr ?? ""}`)} />
                          {a.suggestedFrom && (
                            <div className="flex flex-wrap items-center gap-2 text-[11.5px] text-warning">
                              <span>{a.suggestedFrom === "auto" ? t("Auto-assigned", "موزّعة تلقائيًا")
                                : t(`Suggested · was ${shiftName(a.suggestedFrom, false)}`, `مقترحة · كانت ${shiftName(a.suggestedFrom, true)}`)}</span>
                              <button onClick={() => confirmSuggestion(r.id, pid)}
                                className="inline-flex h-6 items-center gap-1 rounded-md bg-primary px-2 text-[11.5px] font-medium text-primary-foreground hover:brightness-110">
                                <Check className="size-3" />{t("Confirm", "تأكيد")}
                              </button>
                            </div>
                          )}
                        </div>
                      ) : a.shiftId ? (
                        <span className="inline-flex items-center gap-2"><ShiftCode shift={getShiftType(a.shiftId)} className="h-6 min-w-6" />{shiftName(a.shiftId, isAr)}</span>
                      ) : <span className="text-muted-foreground">{t("No shift", "بدون مناوبة")}</span>}
                      {/* a changed shift starts over their day off, unless an admin overrode it */}
                      {a.shiftId && a.previousShiftId && a.previousShiftId !== a.shiftId && (() => {
                        const from = shiftChangeDate(r, pid)
                        const win = shiftChangeWindow(r, pid)
                        return (
                          <div className="mt-1.5 flex max-w-[260px] flex-col gap-1 text-[11.5px] text-muted-foreground">
                            {a.changeNow ? (
                              <span className="text-warning">{t(`Changes on ${dayMonth(r.startISO, false)} — admin override`, `تتغير في ${dayMonth(r.startISO, true)} — تجاوز إداري`)}</span>
                            ) : from > r.startISO && win.lastOld ? (
                              <span>{t(`Keeps ${shiftName(a.previousShiftId, false)} to ${dayMonth(win.lastOld, false)}; ${shiftName(a.shiftId, false)} from ${win.firstNew ? dayMonth(win.firstNew, false) : "the next period"}, after their day off`,
                                       `يبقى على ${shiftName(a.previousShiftId, true)} حتى ${dayMonth(win.lastOld, true)}؛ و${shiftName(a.shiftId, true)} من ${win.firstNew ? dayMonth(win.firstNew, true) : "الفترة التالية"} بعد يوم راحته`)}</span>
                            ) : (
                              <span>{t("Changes on day 1 — it starts the period on a day off", "تتغير من اليوم الأول — يبدأ الفترة بيوم راحة")}</span>
                            )}
                            {isAdmin && editable && (from > r.startISO || a.changeNow) && (
                              <button onClick={() => setChangeNow(r.id, pid, !a.changeNow)} className="self-start text-primary hover:underline">
                                {a.changeNow ? t("Remove override", "إلغاء التجاوز") : t(`Override: change on ${dayMonth(r.startISO, false)}`, `تجاوز: التغيير في ${dayMonth(r.startISO, true)}`)}
                              </button>
                            )}
                          </div>
                        )
                      })()}
                    </td>
                    <td className="border-b border-border px-3 py-2.5 align-top">
                      <WeekdayPills value={a.daysOff} isAr={isAr} disabled={!editable} onToggle={(d) => toggleDayOff(r.id, pid, d)}
                        label={t(`Weekly days off for ${p?.name ?? ""}`, `أيام راحة ${p?.nameAr ?? ""}`)} />
                    </td>
                    <td className="border-b border-border px-3 py-2.5 text-end align-top tabular-nums">{Math.round(weeklyHours(r, pid) * 10) / 10}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="grid items-start gap-6 xl:grid-cols-2">
        {/* ── a typical week of cover ── */}
        <SectionCard icon={ShieldCheck} title={t("Cover in a typical week", "التغطية في أسبوع اعتيادي")}>
          {coverRows.length === 0 ? (
            <Empty icon={ShieldCheck} title={t("No shifts assigned yet", "لم تُحدَّد مناوبات بعد")} />
          ) : (
            <div className="overflow-x-auto [scrollbar-width:thin]">
              <table className="w-full min-w-[520px] text-[12.5px]">
                <thead>
                  <tr className="text-[11.5px] text-muted-foreground">
                    <th scope="col" className="px-2 py-2 text-start font-medium">{t("Shift", "المناوبة")}</th>
                    {WEEKDAYS.map((d, i) => (
                      <th key={i} scope="col" className={cn("px-1 py-2 text-center font-medium", (i === 5 || i === 6) && "bg-secondary/50")}>{isAr ? d.ar : d.en}</th>
                    ))}
                    <th scope="col" className="px-2 py-2 text-center font-medium">{t("Min", "الأدنى")}</th>
                  </tr>
                </thead>
                <tbody>
                  {coverRows.map((s) => {
                    const need = r.minCover[s.id] ?? 0
                    return (
                      <tr key={s.id} className="border-t border-border">
                        <th scope="row" className="px-2 py-2 text-start font-normal">
                          <span className="inline-flex items-center gap-2"><ShiftCode shift={s} className="h-6 min-w-6" />{isAr ? s.nameAr : s.name}</span>
                        </th>
                        {(weekly[s.id] ?? [0, 0, 0, 0, 0, 0, 0]).map((n, d) => {
                          const counts = r.coverWeekends || (d !== 5 && d !== 6)
                          const short = counts && need > 0 && n < need
                          return (
                            <td key={d} className={cn("px-1 py-2 text-center tabular-nums", (d === 5 || d === 6) && "bg-secondary/50")}>
                              <span className={cn("inline-flex h-6 min-w-7 items-center justify-center rounded-md px-1",
                                short ? "bg-error-fill font-semibold text-error" : counts && need ? "text-success" : "text-muted-foreground")}>{n}</span>
                            </td>
                          )
                        })}
                        <td className="px-2 py-2 text-center">
                          <input type="number" min={0} max={50} value={need} disabled={!editable}
                            onChange={(e) => setMinCover(r.id, s.id, Math.max(0, Math.round(Number(e.target.value) || 0)))}
                            aria-label={t(`Minimum on ${s.name}`, `الحد الأدنى في ${s.nameAr}`)}
                            className="h-7 w-12 rounded-md border border-border bg-background text-center tabular-nums outline-none focus:border-primary/60 disabled:opacity-60" />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[12.5px] text-muted-foreground">
            <span>{t("Minimum cover counts on", "يُحتسب الحد الأدنى في")}</span>
            <select value={r.coverWeekends ? "all" : "weekdays"} disabled={!editable}
              onChange={(e) => setCoverWeekends(r.id, e.target.value === "all")} aria-label={t("Minimum cover counts on", "يُحتسب الحد الأدنى في")}
              className="h-8 rounded-lg border border-border bg-background px-2 text-[12.5px] text-foreground outline-none focus:border-primary/60 disabled:opacity-60">
              <option value="all">{t("every day", "كل الأيام")}</option>
              <option value="weekdays">{t("Sunday–Thursday only", "من الأحد إلى الخميس فقط")}</option>
            </select>
            <span>· {t("leave is taken out on the days it falls", "تُستبعد الإجازات في أيامها")}</span>
          </div>
        </SectionCard>

        {/* ── what needs checking ── */}
        <SectionCard icon={ListChecks} title={t("To check before publishing", "للمراجعة قبل النشر")}
          action={<span className="text-[12px] tabular-nums text-muted-foreground">{issues.length + gaps.length}</span>}>
          {issues.length + gaps.length === 0 ? (
            <Empty icon={ShieldCheck} title={t("Nothing to check", "لا توجد ملاحظات")}
              hint={t("Everyone has a weekly day off, the handover from the last period keeps 11 hours' rest, and every minimum is met.",
                      "لكل موظف يوم راحة أسبوعي، والانتقال من الفترة السابقة يحفظ 11 ساعة راحة، وكل الحدود الدنيا مستوفاة.")} />
          ) : (
            <ul className="flex max-h-[420px] flex-col gap-2 overflow-y-auto">
              {gaps.map((g) => (
                <li key={`gap-${g.shiftId}-${g.have}-${g.need}`}>
                  <Tile className="flex items-start gap-3 p-3">
                    <Users className="mt-0.5 size-4 shrink-0 text-error" />
                    <div className="min-w-0 text-[13px]">
                      <div className="font-medium">{shiftName(g.shiftId, isAr)} · {t(`${g.have} of ${g.need} people on ${g.dates.length} days`, `${g.have} من ${g.need} موظفين في ${g.dates.length} أيام`)}</div>
                      <div className="text-[12.5px] text-muted-foreground">
                        {g.dates.slice(0, 5).map((d) => dayMonth(d, isAr)).join(isAr ? "، " : ", ")}{g.dates.length > 5 ? (isAr ? ` و${g.dates.length - 5} أخرى` : ` and ${g.dates.length - 5} more`) : ""}
                      </div>
                    </div>
                  </Tile>
                </li>
              ))}
              {issues.map((x, i) => {
                const p = personById(x.personId)
                const Icon = ISSUE_ICON[x.kind]
                return (
                  <li key={`iss-${i}`}>
                    <Tile className="flex items-start gap-3 p-3">
                      <Icon className={cn("mt-0.5 size-4 shrink-0", x.kind === "leave" ? "text-icon" : "text-warning")} />
                      <div className="min-w-0 text-[13px]">
                        <div className="font-medium">{p ? (isAr ? p.nameAr : p.name) : x.personId}</div>
                        <div className="text-[12.5px] text-muted-foreground">{isAr ? x.textAr : x.text}</div>
                      </div>
                    </Tile>
                  </li>
                )
              })}
            </ul>
          )}
        </SectionCard>

        {/* ── rotation and rollover ── */}
        <SectionCard icon={Repeat} title={t("Rotation and rollover", "التناوب والترحيل")}>
          <div className="flex flex-col gap-4">
            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[13px] font-medium">{t("Order shifts move in at rollover", "ترتيب انتقال المناوبات عند الترحيل")}</span>
                {editable && !editRotation && (
                  <button onClick={() => setEditRotation(r.rotation)} className="text-[12.5px] text-primary hover:underline">{t("Change", "تغيير")}</button>
                )}
              </div>
              {editRotation ? (
                <div className="flex flex-col gap-3">
                  <RotationPicker value={editRotation} onChange={setEditRotation} options={working} isAr={isAr} t={t} />
                  <div className="flex gap-2">
                    <OutlineButton size="sm" onClick={() => setEditRotation(null)}>{t("Cancel", "إلغاء")}</OutlineButton>
                    <GoldButton size="sm" onClick={() => { setRotation(r.id, editRotation); setEditRotation(null) }}>{t("Save order", "حفظ الترتيب")}</GoldButton>
                  </div>
                </div>
              ) : (
                <p className="text-[13px] text-muted-foreground">
                  {r.rotation.length > 1 ? `${rotationText(r.rotation, isAr)} ${isAr ? "← " : "→ "}${shiftName(r.rotation[0], isAr)}` : t("No rotation — shifts stay the same at rollover.", "بدون تناوب — تبقى المناوبات كما هي عند الترحيل.")}
                </p>
              )}
            </div>
            <Tile className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-[13px]">
                <div className="font-medium">{t("Next period", "الفترة التالية")} · {periodLabel(next, isAr)}</div>
                <div className="text-[12.5px] text-muted-foreground">
                  {nextExisting
                    ? t(`Already planned in ${nextExisting.code}.`, `مخطط لها في ${nextExisting.code}.`)
                    : t("Same people, days off and cover; each person's next shift is suggested for you to confirm.",
                        "الموظفون وأيام الراحة والتغطية نفسها؛ تُقترح لكل موظف مناوبته التالية لتؤكدها.")}
                </div>
              </div>
              {nextExisting ? (
                <OutlineButton size="sm" onClick={() => navigate(`/employee/rosters/${nextExisting.id}`)}>{t(`Open ${nextExisting.code}`, `فتح ${nextExisting.code}`)}</OutlineButton>
              ) : editable && (
                <GoldButton size="sm" onClick={doRollover}><Repeat className="size-4" />{t("Roll over", "ترحيل")}</GoldButton>
              )}
            </Tile>
          </div>
        </SectionCard>

        {/* ── change log ── */}
        <SectionCard icon={History} title={t("Change log", "سجل التعديلات")}
          action={<span className="text-[12px] tabular-nums text-muted-foreground">{log.length}</span>}>
          <ul className="flex max-h-[420px] flex-col overflow-y-auto">
            {[...log].reverse().map((e) => (
              <li key={e.id} className="flex items-start gap-3 border-b border-input py-3 last:border-b-0">
                <Initials text={(isAr ? e.actorAr : e.actor).split(" ").map((w) => w[0]).slice(0, 2).join("")} className="size-7 text-[10px]" />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px]"><span className="font-medium">{isAr ? e.actorAr : e.actor}</span> · {isAr ? e.textAr : e.text}</div>
                  <div className="text-[11.5px] text-muted-foreground tabular-nums">{dayMonth(e.atISO, isAr)} · {e.time}</div>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <ConfirmDelete open={confirmDelete}
        title={t(`Delete ${r.code}?`, `حذف ${r.code}؟`)}
        body={r.status === "published"
          ? t("It is published — the people on it will no longer see these shifts. It stays in Deleted rosters and can be restored.",
              "الجدول منشور — لن يرى الموظفون هذه المناوبات بعد الآن. يبقى في الجداول المحذوفة ويمكن استعادته.")
          : t("It moves to Deleted rosters and can be restored.", "ينتقل إلى الجداول المحذوفة ويمكن استعادته.")}
        confirm={t("Delete", "حذف")} cancel={t("Cancel", "إلغاء")}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => { deleteRoster(r.id); setConfirmDelete(false); navigate("/employee/rosters") }} />
    </Page>
  )
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "warning" | "error" }) {
  return (
    <div className="min-w-[110px] rounded-[10px] bg-background/70 px-3 py-2 ring-1 ring-border ring-inset">
      <div className={cn("text-[20px] font-medium tabular-nums leading-7", tone === "warning" && "text-warning", tone === "error" && "text-error")}>{value}</div>
      <div className="text-[11.5px] text-muted-foreground">{label}</div>
    </div>
  )
}
