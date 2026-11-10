/** الأداء المؤسسي — Corporate performance dashboard. Route: /corporate-performance
 *  (?period=q1|q2|q3|q4, full year by default).
 *  No Figma frames exist for this module; it is composed from the Operations-hub /
 *  Tasks hero, the home "Projects" progress rows, the Steps-leaderboard chart + tabs
 *  and the Services-history table. */
import * as React from "react"
import { Link } from "react-router-dom"
import { cn } from "@reach/shared-core"
import {
  AlertTriangle, Banknote, BarChart3, CarFront, CircleCheck, Flag, ListChecks, OctagonAlert, SearchX, Smile, Sofa,
  Target, User, X,
} from "lucide-react"

import {
  INITIATIVES, MONTHS, OBJECTIVES, PERIODS, PILLARS, STATUS_LABEL, THRESHOLDS,
  comparisonOf, initiativeHealth, initiativesByRisk, kpiStatusCounts, pillarById, rankDepartments, scoreKpi,
  scoreObjective, scoreStrategy, type Kpi, type Status,
} from "../data/performance"
import { usePerf } from "../store"
import { BASE, DepartmentRanking, InitiativeItem, PeriodSelect } from "../components/blocks"
import { ChartLegend, ColumnChart, Sparkline, type ColumnPoint } from "../components/charts"
import {
  REF_COLOR, STATUS_TONE, fmtCompact, fmtDelta, fmtPct, fmtValue, usePeriod, useSimulatedLoad, useT,
} from "../components/helpers"
import {
  Cell, DataGrid, EmptyState, FilterSelect, GridRow, KpiTile, Legend, OutlineButton, Page, Panel, CardHeading,
  ProgressBar, Ring, SearchBox, Skeleton, SkeletonRows, Split, StatCard, StatusChip, Tabs,
} from "../components/kit"

export default function CorporatePerformancePage() {
  const { t, l, isAr } = useT()
  const { period, withPeriod } = usePeriod()
  const kpis = usePerf((s) => s.kpis)
  const loading = useSimulatedLoad()
  const [objFilter, setObjFilter] = React.useState<Status | null>(null)

  const m = React.useMemo(() => {
    const cmp = comparisonOf(period, kpis)
    const strategy = scoreStrategy(kpis, period.from, period.to)
    const objectives = OBJECTIVES.map((o) => ({
      o,
      s: scoreObjective(o, kpis, period.from, period.to),
      prev: cmp ? scoreObjective(o, kpis, cmp.from, cmp.to) : null,
    }))
    const objCount = (st: Status) => objectives.filter((x) => x.s.status === st).length
    const open = INITIATIVES.filter((i) => i.progress < 100)
    return {
      cmp,
      strategy,
      strategyPrev: cmp ? scoreStrategy(kpis, cmp.from, cmp.to) : null,
      objectives,
      objCount,
      kpiCounts: kpiStatusCounts(kpis, period.from, period.to),
      openInitiatives: open.length,
      behindPlan: open.filter((i) => initiativeHealth(i).status === "off-track").length,
      departments: rankDepartments(kpis, period.from, period.to),
    }
  }, [kpis, period])

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  const pickStatus = (s: Status) => {
    setObjFilter((cur) => (cur === s ? null : s))
    scrollTo("perf-objectives")
  }
  const delta = m.strategy.progress !== null && m.strategyPrev?.progress != null ? m.strategy.progress - m.strategyPrev.progress : null

  return (
    <Page>
      {/* ── hero ─────────────────────────────────────────────────────────── */}
      <section className="highlight-card hl-fuchsia flex flex-col gap-8 rounded-2xl px-6 py-8 lg:flex-row lg:items-center lg:justify-between lg:py-10 lg:pe-14 lg:ps-6">
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-2">
              <h1 className="text-[28px] font-medium leading-[38px] tracking-tight">{t("Corporate performance", "الأداء المؤسسي")}</h1>
              <p className="max-w-[560px] text-[14px] text-muted-foreground">
                {t(
                  "How Altanfeethi is tracking against its 2026 strategy — objectives, KPIs, departments and initiatives.",
                  "كيف يسير التنفيذي نحو استراتيجية 2026 — الأهداف والمؤشرات والإدارات والمبادرات.",
                )}
              </p>
            </div>
            <PeriodSelect />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[81px]" />)
            ) : (
              <>
                <StatCard icon={CircleCheck} tone="text-success" value={m.objCount("on-track")} label={t("on track", "على المسار")}
                  hint={t(`objectives at ≥ ${THRESHOLDS.onTrack}% of target`, `أهداف عند ${THRESHOLDS.onTrack}% أو أكثر من المستهدف`)}
                  pressed={objFilter === "on-track"} onClick={() => pickStatus("on-track")} />
                <StatCard icon={AlertTriangle} tone="text-warning" value={m.objCount("at-risk")} label={t("at risk", "معرّضة للخطر")}
                  hint={t(`objectives at ${THRESHOLDS.atRisk}–${THRESHOLDS.onTrack - 1}%`, `أهداف بين ${THRESHOLDS.atRisk} و${THRESHOLDS.onTrack - 1}%`)}
                  pressed={objFilter === "at-risk"} onClick={() => pickStatus("at-risk")} />
                <StatCard icon={OctagonAlert} tone="text-error" value={m.objCount("off-track")} label={t("off track", "خارج المسار")}
                  hint={t(`objectives below ${THRESHOLDS.atRisk}%`, `أهداف أقل من ${THRESHOLDS.atRisk}%`)}
                  pressed={objFilter === "off-track"} onClick={() => pickStatus("off-track")} />
                <StatCard icon={Flag} tone="text-primary" value={m.openInitiatives} label={t("initiatives", "مبادرات")}
                  hint={t(`in progress · ${m.behindPlan} behind plan`, `قيد التنفيذ · ${m.behindPlan} متأخرة عن الخطة`)}
                  onClick={() => scrollTo("perf-initiatives")} />
              </>
            )}
          </div>
        </div>
        <span aria-hidden className="hidden w-[2.5px] self-stretch bg-gradient-to-b from-transparent via-[var(--module-accent)] to-transparent lg:block" />
        <div className="flex flex-col items-center gap-3 lg:w-[300px]">
          <div className="flex w-full items-center justify-center gap-8 lg:justify-between">
            {loading ? (
              <Skeleton className="h-[90px] w-[130px]" />
            ) : (
              <Legend rows={[
                { label: t("KPIs on track", "مؤشرات على المسار"), value: m.kpiCounts["on-track"], dot: "bg-success" },
                { label: t("KPIs at risk", "مؤشرات معرّضة للخطر"), value: m.kpiCounts["at-risk"], dot: "bg-warning" },
                { label: t("KPIs off track", "مؤشرات خارج المسار"), value: m.kpiCounts["off-track"], dot: "bg-error" },
                ...(m.kpiCounts.none ? [{ label: t("Not reported yet", "لم تُرفع بعد"), value: m.kpiCounts.none, dot: "bg-muted-foreground/50" }] : []),
              ]} />
            )}
            <Ring value={loading ? null : m.strategy.progress} status={loading ? null : m.strategy.status} size={132}
              label={t("Strategy achievement", "إنجاز الاستراتيجية")} sub={t("achievement", "الإنجاز")} />
          </div>
          <div className="flex w-full flex-wrap items-center justify-center gap-2 text-[12px] text-muted-foreground lg:justify-end">
            <span>{t("Strategy achievement", "إنجاز الاستراتيجية")}</span>
            {!loading && <StatusChip status={m.strategy.status} />}
            {!loading && delta !== null && m.cmp && (
              <span><span dir="ltr">{fmtDelta(delta, isAr)}</span> {l(m.cmp.label)}</span>
            )}
          </div>
        </div>
      </section>

      {/* ── headline KPIs ────────────────────────────────────────────────── */}
      <HeadlineTiles kpis={kpis} loading={loading} />

      {/* ── objectives + departments ─────────────────────────────────────── */}
      <Split
        main={<ObjectivesCard rows={m.objectives} cmpLabel={m.cmp ? l(m.cmp.label) : null} loading={loading} filter={objFilter} onClearFilter={() => setObjFilter(null)} />}
        side={<DepartmentRanking rows={m.departments} loading={loading} />}
      />

      {/* ── trend + initiatives ──────────────────────────────────────────── */}
      <Split
        main={<TrendCard kpis={kpis} loading={loading} />}
        side={<InitiativesCard loading={loading} />}
      />

      {/* ── KPI table ────────────────────────────────────────────────────── */}
      <KpiTableCard kpis={kpis} loading={loading} withPeriod={withPeriod} />

      <p className="text-[11.5px] text-muted-foreground">
        {t(
          `Status rule: ≥ ${THRESHOLDS.onTrack}% of target is on track, ${THRESHOLDS.atRisk}–${THRESHOLDS.onTrack - 1}% at risk, below ${THRESHOLDS.atRisk}% off track. Objective progress is the weighted average of its KPIs; strategy achievement is the weighted average of the objectives.`,
          `قاعدة الحالة: ${THRESHOLDS.onTrack}% أو أكثر من المستهدف على المسار، ${THRESHOLDS.atRisk}–${THRESHOLDS.onTrack - 1}% معرّض للخطر، وأقل من ${THRESHOLDS.atRisk}% خارج المسار. تقدّم الهدف هو المتوسط المرجّح لمؤشراته، وإنجاز الاستراتيجية هو المتوسط المرجّح للأهداف.`,
        )}
      </p>
    </Page>
  )
}

// ── headline KPI tiles ───────────────────────────────────────────────────────
function HeadlineTiles({ kpis, loading }: { kpis: Kpi[]; loading: boolean }) {
  const { t, l, isAr } = useT()
  const { period, withPeriod } = usePeriod()
  const pick = (id: string) => kpis.find((k) => k.id === id)!
  const tiles = [
    { k: pick("guest-nps"), icon: Smile },
    { k: pick("lounge-occupancy"), icon: Sofa },
    { k: pick("revenue"), icon: Banknote },
    { k: pick("limo-on-time"), icon: CarFront },
  ]
  if (loading) {
    return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">{tiles.map((x) => <Skeleton key={x.k.id} className="h-20" />)}</div>
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
      {tiles.map(({ k, icon }) => {
        const s = scoreKpi(k, period.from, period.to)
        const revenue = k.unit === "sar" && k.agg === "sum"
        const value = revenue ? fmtPct(s.attainment) : fmtValue(k.unit, s.actual, isAr)
        const label = revenue && s.actual !== null && s.target !== null
          ? `${l(k.name)} · ${fmtCompact("sar", s.actual, isAr)} / ${fmtCompact("sar", s.target, isAr)} ${isAr ? "ر.س" : "SAR"}`
          : `${l(k.name)} · ${t("target", "المستهدف")} ${fmtValue(k.unit, s.target, isAr)}`
        return (
          <KpiTile
            key={k.id} icon={icon} value={value} label={label}
            to={withPeriod(`${BASE}/kpis/${k.id}`)}
            end={<StatusChip status={s.status} className="px-2.5 text-[11px]" />}
          />
        )
      })}
    </div>
  )
}

// ── strategic objectives (home "Projects" rows) ──────────────────────────────
function ObjectivesCard({ rows, cmpLabel, loading, filter, onClearFilter }: {
  rows: { o: (typeof OBJECTIVES)[number]; s: ReturnType<typeof scoreObjective>; prev: ReturnType<typeof scoreObjective> | null }[]
  cmpLabel: string | null
  loading: boolean
  filter: Status | null
  onClearFilter: () => void
}) {
  const { t, l, isAr } = useT()
  const { withPeriod } = usePeriod()
  const visible = filter ? rows.filter((r) => r.s.status === filter) : rows
  return (
    <Panel id="perf-objectives" aria-labelledby="perf-objectives-h" className="scroll-mt-6">
      <CardHeading
        id="perf-objectives-h" icon={Target} title={t("Strategic objectives", "الأهداف الاستراتيجية")}
        actions={filter && (
          <button type="button" onClick={onClearFilter}
            className={cn("inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[12px] outline-none focus-visible:ring-2 focus-visible:ring-ring", STATUS_TONE[filter].chip)}>
            {l(STATUS_LABEL[filter])}
            <X className="size-3.5" aria-label={t("Clear filter", "إزالة التصفية")} />
          </button>
        )}
      />
      <div className="mt-3">
        {loading && Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="my-3 h-[70px]" />)}
        {!loading && visible.length === 0 && (
          <EmptyState icon={CircleCheck}
            title={t("No objectives with this status", "لا توجد أهداف بهذه الحالة")}
            body={t("Nothing matches this status in the selected period.", "لا يوجد ما يطابق هذه الحالة في الفترة المحددة.")}
            action={<OutlineButton size="sm" onClick={onClearFilter}>{t("Show all objectives", "عرض كل الأهداف")}</OutlineButton>} />
        )}
        {!loading && visible.map(({ o, s, prev }, i) => {
          const pillar = pillarById(o.pillarId)
          const d = s.progress !== null && prev?.progress != null ? s.progress - prev.progress : null
          return (
            <Link
              key={o.id}
              to={withPeriod(`${BASE}/objectives/${o.id}`)}
              className={cn(
                "grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-3 py-[18px] text-start outline-none transition-colors hover:bg-foreground/[0.02] focus-visible:ring-2 focus-visible:ring-ring md:grid-cols-[minmax(0,1fr)_minmax(0,300px)_auto]",
                i < visible.length - 1 && "border-b border-input",
              )}
            >
              <span className="min-w-0">
                <span className="block truncate text-[15px] leading-[22px] text-foreground">{l(pillar.name)}</span>
                <span className="mt-0.5 block truncate text-[12.5px] text-muted-foreground" title={l(o.title)}>{o.code} · {l(o.title)}</span>
                <span className="mt-1 flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
                  <User className="size-3.5" strokeWidth={1.6} />
                  {l(o.owner.name)}
                </span>
              </span>
              <span className="col-span-2 row-start-2 flex flex-col gap-2.5 md:col-span-1 md:row-start-auto">
                <ProgressBar value={s.progress} status={s.status} label={l(pillar.name)} />
                <span className="flex flex-wrap items-center gap-3 text-[12px]">
                  <StatusChip status={s.status} />
                  {d !== null && cmpLabel && (
                    <span className="text-muted-foreground"><span dir="ltr">{fmtDelta(d, isAr)}</span> {cmpLabel}</span>
                  )}
                </span>
              </span>
              <span className="text-end text-[32px] leading-10 text-foreground">{fmtPct(s.progress)}</span>
            </Link>
          )
        })}
      </div>
    </Panel>
  )
}

// ── achievement trend (Steps-leaderboard columns + tabs) ─────────────────────
function TrendCard({ kpis, loading }: { kpis: Kpi[]; loading: boolean }) {
  const { t, l } = useT()
  const { period } = usePeriod()
  const [view, setView] = React.useState<"year" | "quarter">("year")

  const points: ColumnPoint[] = React.useMemo(() => {
    const target = t(`Target ${THRESHOLDS.onTrack}%`, `المستهدف ${THRESHOLDS.onTrack}%`)
    if (view === "year") {
      return MONTHS.map((mo, i) => {
        const s = scoreStrategy(kpis, i, i)
        return { key: mo.en, label: l(mo), value: s.progress, status: s.status, dim: i < period.from || i > period.to, detail: target }
      })
    }
    return PERIODS.filter((p) => p.id !== "fy").map((p) => {
      const s = scoreStrategy(kpis, p.from, p.to)
      return { key: p.id, label: l(p.short), value: s.progress, status: s.status, dim: period.id !== "fy" && p.id !== period.id, detail: target }
    })
  }, [kpis, view, period, t, l])

  return (
    <Panel aria-labelledby="perf-trend">
      <CardHeading
        id="perf-trend" icon={BarChart3} title={t("Strategy achievement over time", "إنجاز الاستراتيجية عبر الزمن")}
        actions={
          <Tabs label={t("Granularity", "الدقة الزمنية")} value={view} onChange={setView}
            options={[{ value: "quarter", label: t("Quarter", "ربعي") }, { value: "year", label: t("Year", "سنوي") }]} />
        }
      />
      <ChartLegend className="mt-4" items={[
        { label: t("On track", "على المسار"), kind: "rect", color: "var(--success)" },
        { label: t("At risk", "معرّض للخطر"), kind: "rect", color: "var(--warning)" },
        { label: t("Off track", "خارج المسار"), kind: "rect", color: "var(--error)" },
        { label: t(`Target ${THRESHOLDS.onTrack}%`, `المستهدف ${THRESHOLDS.onTrack}%`), kind: "line", color: REF_COLOR, dashed: true },
      ]} />
      <div className="mt-4">
        {loading ? <Skeleton className="h-[232px]" /> : (
          <ColumnChart
            points={points} target={THRESHOLDS.onTrack} labelAll={view === "quarter"}
            ariaLabel={view === "year"
              ? t("Strategy achievement by month, 2026", "إنجاز الاستراتيجية حسب الشهر، 2026")
              : t("Strategy achievement by quarter, 2026", "إنجاز الاستراتيجية حسب الربع، 2026")}
          />
        )}
      </div>
      <p className="mt-2 text-[11.5px] text-muted-foreground">
        {view === "year"
          ? t("Each month scores only that month's reported values. Months outside the selected period are dimmed.", "يُحتسب كل شهر من القيم المرفوعة له فقط. الأشهر خارج الفترة المحددة باهتة.")
          : t("Each quarter scores the months reported so far.", "يُحتسب كل ربع من الأشهر المرفوعة حتى الآن.")}
      </p>
    </Panel>
  )
}

// ── initiatives (top 5 by risk) ──────────────────────────────────────────────
function InitiativesCard({ loading }: { loading: boolean }) {
  const { t } = useT()
  const top = initiativesByRisk(INITIATIVES.filter((i) => i.progress < 100)).slice(0, 5)
  return (
    <Panel id="perf-initiatives" aria-labelledby="perf-initiatives-h" className="scroll-mt-6">
      <CardHeading
        id="perf-initiatives-h" icon={ListChecks} title={t("Initiatives", "المبادرات")}
        actions={<span className="text-[12px] text-muted-foreground">{t("Top 5 by risk", "أعلى 5 من حيث المخاطر")}</span>}
      />
      <div className="mt-2">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="my-3 h-[92px]" />)
          : top.length === 0
            ? <EmptyState icon={CircleCheck} title={t("No open initiatives", "لا توجد مبادرات مفتوحة")} />
            : top.map((i, k) => <InitiativeItem key={i.id} i={i} last={k === top.length - 1} />)}
      </div>
    </Panel>
  )
}

// ── KPI table ────────────────────────────────────────────────────────────────
const KPI_TEMPLATE = "32px minmax(0,2.4fr) minmax(0,1.3fr) minmax(0,1.1fr) minmax(0,1.1fr) 88px 104px"

function KpiTableCard({ kpis, loading, withPeriod }: { kpis: Kpi[]; loading: boolean; withPeriod: (p: string) => string }) {
  const { t, l, isAr } = useT()
  const { period } = usePeriod()
  const [pillar, setPillar] = React.useState("all")
  const [q, setQ] = React.useState("")

  const query = q.trim().toLowerCase()
  const rows = kpis.filter((k) => {
    const obj = OBJECTIVES.find((o) => o.id === k.objectiveId)!
    if (pillar !== "all" && obj.pillarId !== pillar) return false
    if (!query) return true
    return `${k.code} ${k.name.en} ${k.name.ar} ${k.owner.name.en} ${k.owner.name.ar}`.toLowerCase().includes(query)
  })
  const filtered = pillar !== "all" || query !== ""

  return (
    <Panel aria-labelledby="perf-kpis">
      <CardHeading
        id="perf-kpis" icon={Target} title={t("Key performance indicators", "مؤشرات الأداء الرئيسية")}
        actions={
          <>
            <FilterSelect
              className="w-full sm:w-[230px]" label={t("Pillar", "المحور")} value={pillar} onChange={setPillar}
              options={[{ value: "all", label: t("All pillars", "كل المحاور") }, ...PILLARS.map((p) => ({ value: p.id, label: l(p.name) }))]}
            />
            <SearchBox className="w-full sm:w-[240px]" value={q} onChange={setQ} placeholder={t("Search KPI, code or owner", "ابحث بالمؤشر أو الرمز أو المسؤول")} />
          </>
        }
      />
      {!loading && (
        <p className="mt-3 text-[12px] text-muted-foreground" aria-live="polite">
          {isAr ? `${rows.length} من ${kpis.length} مؤشرًا` : `${rows.length} of ${kpis.length} KPIs`}
        </p>
      )}
      <DataGrid
        className="mt-1" template={KPI_TEMPLATE} minWidth={880} label={t("Key performance indicators", "مؤشرات الأداء الرئيسية")}
        headers={[t("No.", "ترقيم"), t("KPI", "المؤشر"), t("Pillar", "المحور"), t("Target", "المستهدف"), t("Actual", "الفعلي"), t("Trend", "الاتجاه"), t("Status", "الحالة")]}
      >
        {loading ? <SkeletonRows template={KPI_TEMPLATE} cols={7} rows={6} /> : rows.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title={t("No KPIs match", "لا توجد مؤشرات مطابقة")}
            body={t("Try another pillar or search term.", "جرّب محورًا آخر أو كلمة بحث مختلفة.")}
            action={filtered && <OutlineButton size="sm" onClick={() => { setPillar("all"); setQ("") }}>{t("Clear filters", "مسح عوامل التصفية")}</OutlineButton>}
          />
        ) : rows.map((k, i) => {
          const s = scoreKpi(k, period.from, period.to)
          const obj = OBJECTIVES.find((o) => o.id === k.objectiveId)!
          return (
            <GridRow key={k.id} template={KPI_TEMPLATE} to={withPeriod(`${BASE}/kpis/${k.id}`)}>
              <Cell className="text-muted-foreground">{i + 1}</Cell>
              <Cell>
                <span className="block truncate">{l(k.name)}</span>
                <span className="block truncate text-[12px] text-muted-foreground">{k.code} · {l(k.owner.name)}</span>
              </Cell>
              <Cell className="truncate text-muted-foreground">{l(pillarById(obj.pillarId).name)}</Cell>
              <Cell className="tabular-nums">{fmtValue(k.unit, s.target, isAr)}</Cell>
              <Cell className="tabular-nums">{fmtValue(k.unit, s.actual, isAr)}</Cell>
              <Cell>
                <Sparkline values={k.actuals} label={t(`${k.name.en} trend, 2026`, `اتجاه ${k.name.ar}، 2026`)} />
              </Cell>
              <Cell><StatusChip status={s.status} /></Cell>
            </GridRow>
          )
        })}
      </DataGrid>
    </Panel>
  )
}
