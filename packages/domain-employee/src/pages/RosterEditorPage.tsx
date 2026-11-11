import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { cn } from "@reach/shared-core"
import { SearchableSelect } from "@reach/shared-ui"
import { useShell, usePageTitle } from "@reach/shell-context"
import { getShiftType, useShiftTypes } from "@reach/domain-content/master-data"
import {
  AlertTriangle, ArrowLeft, CalendarRange, CircleAlert, Clock3, History, ListChecks, MoreHorizontal, Plane,
  RotateCcw, Send, ShieldCheck, Trash2, Undo2, Users,
} from "lucide-react"

import {
  absenceOn, applyPatternToPerson, cellKey, coverCounts, coverage, coverageGaps, setCoverWeekends, dayMonth, deleteRoster, fullDate, getRoster,
  hoursFor, isWeekend, type IssueKind, periodLabel, publishRoster, restoreRoster, rosterDays, rosterIssues, rosterName,
  ROSTER_TODAY_ISO, setCell, setMinCover, unplannedCount, unpublishRoster, useCanManageRosters, usePatterns, useRosterLog,
  useRosters, weekdayLong, weekdayShort, dayNum,
} from "../data/rosters"
import { personById } from "../data/mock/org"
import { Chip, Empty, GoldButton, Initials, OutlineButton, Page, SectionCard, Tile } from "../components/wijha"
import { ConfirmDelete, ShiftCode, ShiftHours, ShiftLabel } from "../components/RosterBits"

const ISSUE_ICON: Record<IssueKind, typeof AlertTriangle> = { leave: Plane, rest: Clock3, streak: CircleAlert }

/** One roster: the people × days grid, the cover underneath, what needs checking,
 *  and the change log. A full routed page; only the delete confirmation is a dialog. */
export default function RosterEditorPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const { id = "" } = useParams()
  useRosters()
  const shiftTypes = useShiftTypes()
  const patterns = usePatterns()
  const canManage = useCanManageRosters()
  const r = getRoster(id)
  const log = useRosterLog(id)
  const [confirmDelete, setConfirmDelete] = React.useState(false)
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
  const days = rosterDays(r)
  const issues = rosterIssues(r)
  const gaps = coverageGaps(r)
  const cov = coverage(r)
  const unplanned = unplannedCount(r)
  const totalHours = r.memberIds.reduce((h, pid) => h + hoursFor(r, pid), 0)
  const issueAt = (pid: string, iso: string) => issues.filter((x) => x.personId === pid && x.iso === iso)
  // working shifts shown under the grid: anything with a minimum, or used on this roster
  const used = new Set(Object.values(r.cells))
  const coverRows = shiftTypes.filter((s) => !s.isOff && (s.active || used.has(s.id)) && (used.has(s.id) || (r.minCover[s.id] ?? 0) > 0))
  const legend = shiftTypes.filter((s) => s.active || used.has(s.id))
  const cellOptions = [
    ...shiftTypes.filter((s) => s.active).map((s) => ({
      value: s.id, label: isAr ? s.nameAr : s.name, alt: isAr ? s.name : s.nameAr, keywords: s.code,
      lead: <ShiftCode shift={s} className="h-6 min-w-6" />, hint: <ShiftHours shift={s} isAr={isAr} />,
    })),
    { value: "", label: t("Clear the day", "مسح اليوم"), lead: <Undo2 className="size-4 text-icon" /> },
  ]

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
            <div className="flex flex-wrap items-center gap-2">
              <OutlineButton onClick={() => setConfirmDelete(true)} className="text-error">
                <Trash2 className="size-4" />{t("Delete", "حذف")}
              </OutlineButton>
              {r.status === "published" && (
                <OutlineButton onClick={() => unpublishRoster(r.id)}><Undo2 className="size-4" />{t("Withdraw to draft", "إعادته إلى مسودة")}</OutlineButton>
              )}
              {(r.status === "draft" || r.changedSincePublish) && (
                <GoldButton onClick={() => publishRoster(r.id)}>
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
              <span>{periodLabel(r, isAr)}</span>
              {r.deleted ? <Chip tone="error">{t("Deleted", "محذوف")}</Chip>
                : r.status === "published"
                  ? <Chip tone="success">{r.changedSincePublish ? t("Published · unsent changes", "منشور · تعديلات غير منشورة") : t("Published", "منشور")}</Chip>
                  : <Chip tone="warning">{t("Draft", "مسودة")}</Chip>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label={t("People", "الموظفون")} value={r.memberIds.length} />
            <Stat label={t("Planned hours", "الساعات المخططة")} value={Math.round(totalHours)} />
            <Stat label={t("To check", "للمراجعة")} value={issues.length} tone={issues.length ? "warning" : undefined} />
            <Stat label={t("Cover gaps", "نقص التغطية")} value={gaps.length} tone={gaps.length ? "error" : undefined} />
          </div>
        </div>
      </section>

      {r.deleted && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-error-fill px-4 py-3 text-[13px] text-error">
          <span>{t(`Deleted on ${fullDate(r.deletedISO ?? ROSTER_TODAY_ISO, false)}. It is kept for the record and can be restored.`,
                   `حُذف في ${fullDate(r.deletedISO ?? ROSTER_TODAY_ISO, true)}. محفوظ للسجل ويمكن استعادته.`)}</span>
          {canManage && <OutlineButton size="sm" onClick={() => restoreRoster(r.id)}><RotateCcw className="size-3.5" />{t("Restore", "استعادة")}</OutlineButton>}
        </div>
      )}

      {/* ── the grid ── */}
      <SectionCard icon={CalendarRange} title={t("Roster", "الجدول")}
        action={unplanned > 0 ? <Chip>{t(`${unplanned} days unplanned`, `${unplanned} أيام غير مخططة`)}</Chip> : undefined}>
        <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2 text-[12.5px]">
          {legend.map((s) => (
            <span key={s.id} className="inline-flex items-center gap-1.5"><ShiftCode shift={s} className="h-6 min-w-6" /><ShiftLabel shift={s} isAr={isAr} /></span>
          ))}
        </div>
        {/* the grid scrolls inside its card; the page never scrolls sideways */}
        <div className="overflow-x-auto rounded-[10px] ring-1 ring-border ring-inset [scrollbar-width:thin]">
          <table className="w-max min-w-full border-separate border-spacing-0 text-[13px]">
            <thead>
              <tr>
                <th scope="col" className="sticky start-0 z-10 min-w-[200px] border-b border-border bg-card px-3 py-2 text-start text-[12px] font-medium text-muted-foreground">
                  {t("Employee", "الموظف")}
                </th>
                {days.map((iso) => (
                  <th key={iso} scope="col" title={weekdayLong(iso, isAr)}
                    className={cn("min-w-[52px] border-b border-border px-1 py-2 text-center font-normal",
                      isWeekend(iso) && "bg-secondary/50", iso === ROSTER_TODAY_ISO && "text-primary")}>
                    <span className="block text-[11px] text-muted-foreground">{weekdayShort(iso, isAr)}</span>
                    <span className={cn("mx-auto mt-0.5 grid size-6 place-items-center rounded-full text-[12.5px] tabular-nums",
                      iso === ROSTER_TODAY_ISO && "bg-primary text-primary-foreground")}>{dayNum(iso)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {r.memberIds.map((pid) => {
                const p = personById(pid)
                return (
                  <tr key={pid}>
                    <th scope="row" className="sticky start-0 z-10 border-b border-border bg-card px-3 py-2 text-start font-normal">
                      <div className="flex items-center gap-2.5">
                        <Initials text={p?.initials ?? "?"} className="size-8 text-[11px]" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[13px] font-medium">{p ? (isAr ? p.nameAr : p.name) : pid}</div>
                          <div className="truncate text-[11.5px] text-muted-foreground">
                            {t(`${Math.round(hoursFor(r, pid))} h`, `${Math.round(hoursFor(r, pid))} س`)} · {p ? (isAr ? p.titleAr : p.title) : ""}
                          </div>
                        </div>
                        {editable && (
                          <SearchableSelect
                            isAr={isAr} minMenuWidth={260}
                            onChange={(v) => { const pat = patterns.find((x) => x.id === v); if (pat) applyPatternToPerson(r.id, pid, pat) }}
                            options={patterns.map((x) => ({ value: x.id, label: isAr ? x.nameAr : x.name, alt: isAr ? x.name : x.nameAr }))}
                            header={<div className="px-3 pb-1 pt-2 text-[11.5px] font-medium text-muted-foreground">{t("Apply a pattern to this row", "طبّق نمطًا على هذا الصف")}</div>}
                            renderTrigger={({ triggerProps }) => (
                              <button {...triggerProps} aria-label={t(`Row options for ${p?.name ?? ""}`, `خيارات صف ${p?.nameAr ?? ""}`)}
                                className="grid size-7 shrink-0 place-items-center rounded-md text-icon hover:bg-secondary hover:text-foreground">
                                <MoreHorizontal className="size-4" />
                              </button>
                            )}
                          />
                        )}
                      </div>
                    </th>
                    {days.map((iso) => {
                      const shiftId = r.cells[cellKey(pid, iso)] ?? ""
                      const s = shiftId ? getShiftType(shiftId) : undefined
                      const found = issueAt(pid, iso)
                      const away = absenceOn(pid, iso)
                      const tip = [
                        `${p ? (isAr ? p.nameAr : p.name) : ""} · ${weekdayLong(iso, isAr)} ${dayMonth(iso, isAr)}`,
                        s ? `${isAr ? s.nameAr : s.name}${s.isOff ? "" : ` ${s.startTime}–${s.endTime}`}` : t("Not planned", "غير مخطط"),
                        away ? (away.kind === "leave" ? t("Approved leave", "إجازة معتمدة") : t("Working remotely", "عمل عن بعد")) : "",
                        ...found.map((x) => (isAr ? x.textAr : x.text)),
                      ].filter(Boolean).join("\n")
                      const face = (
                        <span className="relative inline-flex">
                          {s ? <ShiftCode shift={s} /> : <span className="inline-flex h-7 min-w-8 items-center justify-center rounded-md border border-dashed border-border text-[12px] text-muted-foreground/60">·</span>}
                          {found.length > 0 && <span className="absolute -end-1 -top-1 size-2.5 rounded-full bg-warning ring-2 ring-card" />}
                        </span>
                      )
                      return (
                        <td key={iso} className={cn("border-b border-border p-1 text-center",
                          isWeekend(iso) && "bg-secondary/50", away?.kind === "leave" && "bg-[repeating-linear-gradient(135deg,transparent_0_6px,var(--secondary)_6px_8px)]")}>
                          {editable ? (
                            <SearchableSelect
                              value={shiftId} onChange={(v) => setCell(r.id, pid, iso, v)} isAr={isAr} options={cellOptions} minMenuWidth={230}
                              renderTrigger={({ triggerProps }) => (
                                <button {...triggerProps} title={tip} aria-label={tip.replace(/\n/g, ", ")}
                                  className="rounded-lg p-0.5 outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-primary/40">
                                  {face}
                                </button>
                              )}
                            />
                          ) : <span title={tip}>{face}</span>}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
            {coverRows.length > 0 && (
              <tfoot>
                {coverRows.map((s) => {
                  const needAll = r.minCover[s.id] ?? 0
                  return (
                    <tr key={s.id}>
                      <th scope="row" className="sticky start-0 z-10 border-t border-border bg-card px-3 py-2 text-start font-normal">
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex min-w-0 items-center gap-2 text-[12.5px]"><ShiftCode shift={s} className="h-6 min-w-6" />
                            <span className="truncate">{t(`${s.name} cover`, `تغطية ${s.nameAr}`)}</span></span>
                          <label className="flex shrink-0 items-center gap-1 text-[11.5px] text-muted-foreground">
                            {t("min", "الأدنى")}
                            <input type="number" min={0} max={50} value={needAll} disabled={!editable}
                              onChange={(e) => setMinCover(r.id, s.id, Math.max(0, Math.round(Number(e.target.value) || 0)))}
                              aria-label={t(`Minimum on ${s.name}`, `الحد الأدنى في ${s.nameAr}`)}
                              className="h-7 w-11 rounded-md border border-border bg-background text-center text-[12px] tabular-nums outline-none focus:border-primary/60 disabled:opacity-60" />
                          </label>
                        </div>
                      </th>
                      {days.map((iso) => {
                        const have = cov[iso][s.id] ?? 0
                        const need = coverCounts(r, iso) ? needAll : 0
                        const short = have < need
                        return (
                          <td key={iso} className={cn("border-t border-border p-1 text-center text-[12px] tabular-nums", isWeekend(iso) && "bg-secondary/50")}>
                            <span className={cn("inline-flex h-6 min-w-8 items-center justify-center rounded-md px-1",
                              short ? "bg-error-fill font-semibold text-error" : need ? "text-success" : "text-muted-foreground")}>
                              {need ? `${have}/${need}` : have}
                            </span>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tfoot>
            )}
          </table>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[12.5px] text-muted-foreground">
          <span>{t("Minimum cover counts on", "يُحتسب الحد الأدنى في")}</span>
          <select value={r.coverWeekends ? "all" : "weekdays"} disabled={!editable}
            onChange={(e) => setCoverWeekends(r.id, e.target.value === "all")} aria-label={t("Minimum cover counts on", "يُحتسب الحد الأدنى في")}
            className="h-8 rounded-lg border border-border bg-background px-2 text-[12.5px] text-foreground outline-none focus:border-primary/60 disabled:opacity-60">
            <option value="all">{t("every day", "كل الأيام")}</option>
            <option value="weekdays">{t("Sunday–Thursday only", "من الأحد إلى الخميس فقط")}</option>
          </select>
        </div>
        {editable && (
          <p className="mt-3 text-[12px] text-muted-foreground">
            {t("Click a day to set or change its shift. Use ··· on a row to lay a pattern over that person's whole period.",
               "اضغط على يوم لتحديد مناوبته أو تغييرها. استخدم ··· في الصف لتطبيق نمط على كامل فترة الموظف.")}
          </p>
        )}
      </SectionCard>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        {/* ── what needs checking ── */}
        <SectionCard icon={ListChecks} title={t("To check before publishing", "للمراجعة قبل النشر")}
          action={<span className="text-[12px] tabular-nums text-muted-foreground">{issues.length + gaps.length}</span>}>
          {issues.length + gaps.length === 0 ? (
            <Empty icon={ShieldCheck} title={t("Nothing to check", "لا توجد ملاحظات")}
              hint={t(`Rest of ${11}h, at most ${6} days in a row, no one rostered on leave, and every minimum met.`,
                      `راحة ${11} ساعة، وبحد أقصى ${6} أيام متتالية، ولا أحد مجدول في إجازته، وكل الحدود الدنيا مستوفاة.`)} />
          ) : (
            <ul className="flex max-h-[420px] flex-col gap-2 overflow-y-auto">
              {gaps.map((g) => {
                const s = getShiftType(g.shiftId)
                return (
                  <li key={`gap-${g.iso}-${g.shiftId}`}>
                    <Tile className="flex items-start gap-3 p-3">
                      <Users className="mt-0.5 size-4 shrink-0 text-error" />
                      <div className="min-w-0 text-[13px]">
                        <div className="font-medium">{weekdayLong(g.iso, isAr)} {dayMonth(g.iso, isAr)} · {s ? (isAr ? s.nameAr : s.name) : g.shiftId}</div>
                        <div className="text-[12.5px] text-muted-foreground">{t(`${g.have} of ${g.need} people`, `${g.have} من ${g.need} موظفين`)}</div>
                      </div>
                    </Tile>
                  </li>
                )
              })}
              {issues.map((x, i) => {
                const p = personById(x.personId)
                const Icon = ISSUE_ICON[x.kind]
                return (
                  <li key={`iss-${i}`}>
                    <Tile className="flex items-start gap-3 p-3">
                      <Icon className="mt-0.5 size-4 shrink-0 text-warning" />
                      <div className="min-w-0 text-[13px]">
                        <div className="font-medium">{p ? (isAr ? p.nameAr : p.name) : x.personId} · {weekdayLong(x.iso, isAr)} {dayMonth(x.iso, isAr)}</div>
                        <div className="text-[12.5px] text-muted-foreground">{isAr ? x.textAr : x.text}</div>
                      </div>
                    </Tile>
                  </li>
                )
              })}
            </ul>
          )}
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
