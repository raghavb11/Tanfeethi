/** Composite pieces shared by the Corporate-performance pages. */
import * as React from "react"
import { Link } from "react-router-dom"
import { cn } from "@reach/shared-core"
import { Building2, CalendarClock, Medal, SearchX, type LucideIcon } from "lucide-react"

import {
  PERIODS, STAGES, STATUS_LABEL, initiativeHealth, objectiveById, pillarById, stageOf,
  type Aggregate, type Department, type Initiative, type Status,
} from "../data/performance"
import { STATUS_TONE, fmtDate, fmtPct, usePeriod, useT } from "./helpers"
import {
  CardHeading, EmptyState, FilterSelect, GoldLink, Initials, Page, Panel, PillarChip, ProgressBar, Skeleton, StatusChip,
} from "./kit"

export const BASE = "/corporate-performance"

/** Period selector bound to ?period= (shared by every page so drill-downs keep it). */
export function PeriodSelect({ className }: { className?: string }) {
  const { t, l } = useT()
  const { period, setPeriod } = usePeriod()
  return (
    <FilterSelect
      className={cn("w-full sm:w-[290px]", className)}
      label={t("Period", "الفترة")}
      value={period.id}
      onChange={setPeriod}
      options={PERIODS.map((p) => ({ value: p.id, label: l(p.label) }))}
    />
  )
}

/** Detail-page header: the hero card in a compact form — module-tinted highlight
 *  card, back link, chips, title, description, info tiles and a meter ring. */
export function DetailHero({ back, chips, title, description, tiles, ring, legend }: {
  back: React.ReactNode
  chips?: React.ReactNode
  title: string
  description?: string
  tiles: React.ReactNode
  ring: React.ReactNode
  legend?: React.ReactNode
}) {
  return (
    <section className="highlight-card hl-fuchsia flex flex-col gap-8 rounded-2xl px-6 py-8 lg:flex-row lg:items-center lg:pe-14 lg:ps-6">
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {back}
          <PeriodSelect />
        </div>
        <div className="flex flex-col gap-2">
          {chips && <div className="flex flex-wrap items-center gap-2">{chips}</div>}
          <h1 className="text-[26px] font-medium leading-[36px] tracking-tight text-foreground">{title}</h1>
          {description && <p className="max-w-[760px] text-[13px] leading-[20px] text-muted-foreground">{description}</p>}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{tiles}</div>
      </div>
      <span aria-hidden className="hidden w-[2.5px] self-stretch bg-gradient-to-b from-transparent via-[var(--module-accent)] to-transparent lg:block" />
      <div className="flex shrink-0 items-center justify-center gap-8 lg:w-[300px] lg:justify-between">
        {legend}
        {ring}
      </div>
    </section>
  )
}

export function NotFound({ icon = SearchX, title }: { icon?: LucideIcon; title: string }) {
  const { t } = useT()
  const { withPeriod } = usePeriod()
  return (
    <Page>
      <Panel>
        <EmptyState
          icon={icon}
          title={title}
          body={t("It may have been renamed or removed from the 2026 strategy.", "ربما تمت إعادة تسميته أو إزالته من استراتيجية 2026.")}
          action={<GoldLink to={withPeriod(BASE)}>{t("Back to corporate performance", "العودة إلى الأداء المؤسسي")}</GoldLink>}
        />
      </Panel>
    </Page>
  )
}

/** Department ranking rows: rank (medal for the top three), name + head, a
 *  status bar, the score. */
export function DepartmentRanking({ rows, highlightId, loading, title }: {
  rows: { dept: Department; score: Aggregate; rank: number }[]
  highlightId?: string
  loading?: boolean
  title?: string
}) {
  const { t, l } = useT()
  const { withPeriod } = usePeriod()
  return (
    <Panel aria-labelledby="perf-depts">
      <CardHeading id="perf-depts" icon={Building2} title={title ?? t("Department performance", "أداء الإدارات")} />
      <ol className="mt-[18px] flex flex-col gap-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <li key={i}><Skeleton className="h-[72px]" /></li>)
          : rows.map(({ dept, score, rank }) => {
              const me = dept.id === highlightId
              return (
                <li key={dept.id}>
                  <Link
                    to={withPeriod(`${BASE}/departments/${dept.id}`)}
                    aria-current={me ? "page" : undefined}
                    className={cn(
                      "flex min-h-[72px] items-center gap-3 rounded-[10px] border px-4 py-3 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                      me ? "border-primary bg-primary/15" : "border-[var(--card-ring)] bg-background hover:border-primary/40",
                    )}
                  >
                    <span className="relative inline-flex w-[30px] shrink-0 items-center justify-center" aria-label={t(`Rank ${rank}`, `الترتيب ${rank}`)}>
                      {rank <= 3 ? (
                        <>
                          <Medal className={cn("size-[30px]", rank === 1 ? "text-primary" : rank === 2 ? "text-muted-foreground" : "text-rose-gold")} strokeWidth={1.4} />
                          <span className="absolute bottom-[5px] text-[9.5px] font-semibold">{rank}</span>
                        </>
                      ) : (
                        <span className="text-[26px] leading-none text-muted-foreground">{rank}</span>
                      )}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-2">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-[14px] leading-5 text-foreground">{l(dept.name)}</span>
                        <span className="shrink-0 text-[17px] font-medium leading-5 text-foreground">{fmtPct(score.progress)}</span>
                      </span>
                      <ProgressBar value={score.progress} status={score.status} label={l(dept.name)} />
                      <span className="flex items-center justify-between gap-2 text-[11.5px] text-muted-foreground">
                        <span className="truncate">{l(dept.head.name)}</span>
                        {score.status && <span className={cn("shrink-0", STATUS_TONE[score.status].text)}>{l(STATUS_LABEL[score.status])}</span>}
                      </span>
                    </span>
                  </Link>
                </li>
              )
            })}
      </ol>
    </Panel>
  )
}

/** Five-segment stage track (Planning → Closed). */
export function StageTrack({ progress }: { progress: number }) {
  const { l } = useT()
  const stage = stageOf(progress)
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <ol className="flex gap-1" aria-label={l(STAGES[stage])}>
        {STAGES.map((s, i) => (
          <li key={i} title={l(s)} className={cn("h-1.5 flex-1 rounded-full", i < stage ? "bg-primary" : i === stage ? "bg-primary/55" : "bg-secondary")} />
        ))}
      </ol>
      <span className="text-[11.5px] text-muted-foreground">{l(STAGES[stage])}</span>
    </div>
  )
}

/** One initiative: title, objective, owner, due date, progress vs plan, status. */
export function InitiativeItem({ i, showObjective = true, showStages = false, last }: {
  i: Initiative; showObjective?: boolean; showStages?: boolean; last?: boolean
}) {
  const { t, l, isAr } = useT()
  const { withPeriod } = usePeriod()
  const h = initiativeHealth(i)
  const obj = objectiveById(i.objectiveId)!
  const done = h.status === "done"
  const tone: Status = h.status === "done" ? "on-track" : h.status
  const statusLabel = done
    ? t("Completed", "مكتملة")
    : h.overdue ? t("Overdue", "متأخرة عن الموعد") : undefined
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className="min-w-0 text-[14px] leading-[21px] text-foreground">{l(i.title)}</span>
        <StatusChip status={tone} label={statusLabel} />
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-muted-foreground">
        {showObjective && <PillarChip pillar={pillarById(obj.pillarId)} />}
        <span className="inline-flex items-center gap-1.5">
          <Initials text={i.owner.initials} className="size-5 text-[8.5px]" />
          {l(i.owner.name)}
        </span>
        <span className={cn("inline-flex items-center gap-1", h.overdue && "font-semibold text-error")}>
          <CalendarClock className="size-3.5" strokeWidth={1.6} />
          {t("Due", "الاستحقاق")} <span dir="ltr">{fmtDate(i.due)}</span>
        </span>
      </div>
      <div className={cn("grid items-center gap-x-4 gap-y-2", showStages ? "sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" : "")}>
        <div className="flex flex-col gap-1.5">
          <ProgressBar value={i.progress} status={tone} label={l(i.title)} />
          <span className="text-[11.5px] text-muted-foreground">
            {isAr
              ? `${i.progress}% منجز · المخطط ${Math.round(h.planned)}%`
              : `${i.progress}% complete · ${Math.round(h.planned)}% planned`}
          </span>
        </div>
        {showStages && <StageTrack progress={i.progress} />}
      </div>
    </>
  )
  const cls = cn("flex flex-col gap-3 py-4", !last && "border-b border-secondary")
  if (showObjective) {
    return (
      <Link to={withPeriod(`${BASE}/objectives/${obj.id}`)} className={cn(cls, "rounded-sm outline-none transition-colors hover:bg-foreground/[0.02] focus-visible:ring-2 focus-visible:ring-ring")}>
        {body}
      </Link>
    )
  }
  return <div className={cls}>{body}</div>
}
