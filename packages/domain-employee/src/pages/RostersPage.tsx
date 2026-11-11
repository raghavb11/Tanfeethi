import * as React from "react"
import { useNavigate } from "react-router-dom"
import { cn } from "@reach/shared-core"
import { matchesSearch } from "@reach/shared-ui"
import { useShell } from "@reach/shell-context"
import {
  AlertTriangle, CalendarRange, ChevronLeft, ChevronRight, Plus, RotateCcw, Search, Settings2, Users,
} from "lucide-react"

import {
  dayCount, departments, gapDays, liveRosters, periodLabel, publishBlockers, restoreRoster, type Roster, rosterIssues,
  rosterName, ROSTER_TODAY_ISO, useCanManageRosters, useRosters,
} from "../data/rosters"
import { Chip, Empty, GoldButton, OutlineButton, Page, SectionCard, fieldClass } from "../components/wijha"
import { PickField, Segmented } from "../components/RosterBits"

const PAGE_SIZE = 10
type StatusFilter = "all" | "draft" | "published" | "deleted"

/** Shift rosters — every team's roster periods, newest first. Managers and admins. */
export default function RostersPage() {
  const { locale, role } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const canManage = useCanManageRosters()
  const all = useRosters()

  const [status, setStatus] = React.useState<StatusFilter>("all")
  const [dept, setDept] = React.useState("")
  const [q, setQ] = React.useState("")
  const [page, setPage] = React.useState(0)

  const rows = React.useMemo(() => {
    const base = status === "deleted" ? all.filter((r) => r.deleted) : liveRosters(all)
    return base
      .filter((r) => status === "all" || status === "deleted" || r.status === status)
      .filter((r) => !dept || r.department === dept)
      .filter((r) => matchesSearch(q, r.code, r.name, r.nameAr, r.department, r.departmentAr))
      .sort((a, b) => b.startISO.localeCompare(a.startISO) || b.code.localeCompare(a.code))
  }, [all, status, dept, q])
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const shown = rows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)
  // a filter change starts from the first page again
  const resetPage = <T,>(set: (v: T) => void) => (v: T) => { set(v); setPage(0) }

  if (!canManage) {
    return (
      <Page>
        <SectionCard icon={CalendarRange} title={t("Shift rosters", "جداول المناوبات")}>
          <Empty icon={Users} title={t("Rosters are built by managers", "يُعِدّ المدراء جداول المناوبات")}
            hint={t("Your own shifts are on My shifts.", "مناوباتك في صفحة مناوباتي.")}
            action={<OutlineButton size="sm" onClick={() => navigate("/employee/shifts")}>{t("Open my shifts", "عرض مناوباتي")}</OutlineButton>} />
        </SectionCard>
      </Page>
    )
  }

  const live = liveRosters(all)
  const drafts = live.filter((r) => r.status === "draft").length
  const thisWeek = live.filter((r) => r.status === "published" && r.startISO <= ROSTER_TODAY_ISO && ROSTER_TODAY_ISO <= r.endISO).length

  return (
    <Page className="flex flex-col gap-6">
      <section className="highlight-card flex flex-col gap-5 rounded-2xl px-5 py-6 lg:flex-row lg:items-end lg:justify-between lg:px-6">
        <div className="min-w-0">
          <h1 className="text-[24px] font-normal leading-[34px]">{t("Shift rosters", "جداول المناوبات")}</h1>
          <p className="mt-1 max-w-2xl text-[13.5px] text-muted-foreground">
            {t("Each period gives every person one shift and their weekly days off. At the end of a period, roll it over: the next shifts are suggested for you to confirm.",
               "تمنح كل فترة كل موظف مناوبة واحدة وأيام راحته الأسبوعية. في نهاية الفترة رحّلها: تُقترح المناوبات التالية لتؤكدها.")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[12.5px]">
            <Chip tone="success">{t(`${thisWeek} running now`, `${thisWeek} سارية الآن`)}</Chip>
            <Chip tone="warning">{t(`${drafts} drafts`, `${drafts} مسودات`)}</Chip>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {role === "admin" && (
            <OutlineButton onClick={() => navigate("/config/master-data?list=shift-types")}>
              <Settings2 className="size-4" />{t("Shift types", "أنواع المناوبات")}
            </OutlineButton>
          )}
          <GoldButton onClick={() => navigate("/employee/rosters/new")}>
            <Plus className="size-4" />{t("New roster", "جدول جديد")}
          </GoldButton>
        </div>
      </section>

      <SectionCard icon={CalendarRange} title={t("All rosters", "كل الجداول")}
        action={<span className="text-[12px] tabular-nums text-muted-foreground">{rows.length}</span>}>
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Segmented<StatusFilter> ariaLabel={t("Status", "الحالة")} value={status} onChange={resetPage(setStatus)}
            options={[
              { value: "all", label: t("All", "الكل") },
              { value: "draft", label: t("Drafts", "المسودات") },
              { value: "published", label: t("Published", "المنشورة") },
              { value: "deleted", label: t("Deleted", "المحذوفة") },
            ]} />
          <div className="flex flex-col gap-2 sm:flex-row">
            <PickField className="sm:w-60" isAr={isAr} value={dept} onChange={resetPage(setDept)} ariaLabel={t("Department", "الإدارة")}
              placeholder={t("All departments", "كل الإدارات")}
              options={[{ value: "", label: t("All departments", "كل الإدارات") },
                ...departments().map((d) => ({ value: d.name, label: isAr ? d.nameAr : d.name, alt: isAr ? d.name : d.nameAr }))]} />
            <label className="relative sm:w-64">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-icon" />
              <input value={q} onChange={(e) => resetPage(setQ)(e.target.value)} placeholder={t("Search rosters", "ابحث في الجداول")}
                aria-label={t("Search rosters", "ابحث في الجداول")} className={cn(fieldClass, "ps-9")} />
            </label>
          </div>
        </div>

        {shown.length === 0 ? (
          <Empty icon={CalendarRange} title={status === "deleted" ? t("Nothing deleted", "لا توجد جداول محذوفة") : t("No rosters match", "لا توجد جداول مطابقة")}
            hint={status === "deleted" ? undefined : t("Change the filters, or start a new roster.", "غيّر عوامل التصفية أو ابدأ جدولًا جديدًا.")} />
        ) : (
          <ul className="flex flex-col gap-2">
            {shown.map((r) => <RosterRow key={r.id} r={r} isAr={isAr} t={t} onOpen={() => navigate(`/employee/rosters/${r.id}`)} />)}
          </ul>
        )}

        {pages > 1 && (
          <div className="mt-4 flex items-center justify-between text-[12.5px] text-muted-foreground">
            <span className="tabular-nums">
              {t(`${page * PAGE_SIZE + 1}–${Math.min(rows.length, (page + 1) * PAGE_SIZE)} of ${rows.length}`,
                 `${page * PAGE_SIZE + 1}–${Math.min(rows.length, (page + 1) * PAGE_SIZE)} من ${rows.length}`)}
            </span>
            <div className="flex gap-1">
              <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} aria-label={t("Previous page", "الصفحة السابقة")}
                className="grid size-8 place-items-center rounded-lg border border-border hover:bg-secondary disabled:opacity-40">
                {isAr ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
              </button>
              <button disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)} aria-label={t("Next page", "الصفحة التالية")}
                className="grid size-8 place-items-center rounded-lg border border-border hover:bg-secondary disabled:opacity-40">
                {isAr ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
              </button>
            </div>
          </div>
        )}
      </SectionCard>
    </Page>
  )
}

function RosterRow({ r, isAr, t, onOpen }: { r: Roster; isAr: boolean; t: (en: string, ar: string) => string; onOpen: () => void }) {
  const issues = rosterIssues(r).filter((x) => x.kind !== "leave").length
  const gaps = gapDays(r)
  const { toConfirm, noShift } = publishBlockers(r)
  const current = r.startISO <= ROSTER_TODAY_ISO && ROSTER_TODAY_ISO <= r.endISO
  return (
    <li className="flex flex-col gap-3 rounded-[10px] bg-background p-4 ring-1 ring-border ring-inset sm:flex-row sm:items-center sm:justify-between">
      <button onClick={onOpen} disabled={r.deleted} className="flex min-w-0 flex-1 flex-col items-start gap-1 text-start disabled:cursor-default">
        <span className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] tabular-nums text-muted-foreground">{r.code}</span>
          <span className="truncate text-[14.5px] font-medium hover:text-primary">{rosterName(r, isAr)}</span>
          {current && !r.deleted && <Chip tone="accent">{t("Running now", "سارٍ الآن")}</Chip>}
        </span>
        <span className="text-[12.5px] text-muted-foreground">
          {isAr ? r.departmentAr : r.department} · {periodLabel(r, isAr)} ({t(`${dayCount(r.startISO, r.endISO)} days`, `${dayCount(r.startISO, r.endISO)} يومًا`)}) · {t(`${r.memberIds.length} people`, `${r.memberIds.length} موظفين`)}
        </span>
      </button>
      <div className="flex flex-wrap items-center gap-2">
        {toConfirm > 0 && <Chip tone="warning">{t(`${toConfirm} to confirm`, `${toConfirm} للتأكيد`)}</Chip>}
        {noShift > 0 && <Chip>{t(`${noShift} without a shift`, `${noShift} بدون مناوبة`)}</Chip>}
        {issues > 0 && <Chip tone="warning" icon={AlertTriangle}>{t(`${issues} to check`, `${issues} للمراجعة`)}</Chip>}
        {gaps > 0 && <Chip tone="error">{t(`${gaps} days short`, `${gaps} أيام نقص`)}</Chip>}
        {r.deleted ? (
          <OutlineButton size="sm" onClick={() => restoreRoster(r.id)}><RotateCcw className="size-3.5" />{t("Restore", "استعادة")}</OutlineButton>
        ) : r.status === "published" ? (
          <Chip tone="success">{r.changedSincePublish ? t("Published · unsent changes", "منشور · تعديلات غير منشورة") : t("Published", "منشور")}</Chip>
        ) : (
          <Chip tone="warning">{t("Draft", "مسودة")}</Chip>
        )}
      </div>
    </li>
  )
}
