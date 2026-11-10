/** One department's scorecard. Route: /corporate-performance/departments/:departmentId
 *  Header with the overall score and rank, a quarter-over-quarter chart, the KPIs it
 *  owns, and the department ranking alongside. */
import * as React from "react"
import { useParams } from "react-router-dom"
import { BarChart3, Building2, SearchX, Target } from "lucide-react"

import {
  DEPARTMENTS, OBJECTIVES, PERIODS, THRESHOLDS, departmentById, pillarById, rankDepartments, scoreDepartment,
  scoreKpi,
} from "../data/performance"
import { usePerf } from "../store"
import { BASE, DepartmentRanking, DetailHero, NotFound } from "../components/blocks"
import { ChartLegend, ColumnChart, Sparkline, type ColumnPoint } from "../components/charts"
import { REF_COLOR, fmtDelta, fmtPct, fmtValue, usePeriod, useSimulatedLoad, useT } from "../components/helpers"
import {
  BackLink, CardHeading, Cell, DataGrid, EmptyState, GridRow, InfoTile, Legend, Page, Panel, ProgressBar, Ring,
  Skeleton, SkeletonRows, Split, StatusChip,
} from "../components/kit"

const TEMPLATE = "32px minmax(0,2.3fr) minmax(0,1.3fr) minmax(0,1.1fr) minmax(0,1.1fr) 88px minmax(0,1.2fr) 104px"

export default function DepartmentScorecardPage() {
  const { departmentId } = useParams()
  const { t, l, isAr } = useT()
  const { period, withPeriod } = usePeriod()
  const kpis = usePerf((s) => s.kpis)
  const loading = useSimulatedLoad()
  const dept = departmentById(departmentId)

  const m = React.useMemo(() => {
    if (!dept) return null
    const ranking = rankDepartments(kpis, period.from, period.to)
    const own = kpis.filter((k) => k.departmentId === dept.id).map((k) => ({ k, s: scoreKpi(k, period.from, period.to) }))
    const quarters = PERIODS.filter((p) => p.id !== "fy").map((p) => ({ p, s: scoreDepartment(dept, kpis, p.from, p.to) }))
    return {
      ranking,
      rank: ranking.find((r) => r.dept.id === dept.id)!.rank,
      score: scoreDepartment(dept, kpis, period.from, period.to),
      own,
      quarters,
      count: (st: string) => own.filter((x) => x.s.status === st).length,
    }
  }, [dept, kpis, period])

  if (!dept || !m) return <NotFound icon={Building2} title={t("Department not found", "الإدارة غير موجودة")} />

  const points: ColumnPoint[] = m.quarters.map(({ p, s }) => ({
    key: p.id, label: l(p.short), value: s.progress, status: s.status,
    dim: period.id !== "fy" && p.id !== period.id,
    detail: isAr ? `${s.counted} مؤشرات مرفوعة` : `${s.counted} KPIs reported`,
  }))
  // quarter-over-quarter: the selected quarter (or the latest reported one) vs the one before
  const qi = period.id === "fy" ? m.quarters.reduce((acc, q, i) => (q.s.progress !== null ? i : acc), -1) : PERIODS.findIndex((p) => p.id === period.id)
  const qoq = qi > 0 && m.quarters[qi].s.progress !== null && m.quarters[qi - 1].s.progress !== null
    ? m.quarters[qi].s.progress! - m.quarters[qi - 1].s.progress!
    : null

  return (
    <Page>
      <DetailHero
        back={<BackLink to={withPeriod(BASE)}>{t("Corporate performance", "الأداء المؤسسي")}</BackLink>}
        chips={<><span className="text-[12px] text-muted-foreground">{t("Department scorecard", "بطاقة أداء الإدارة")}</span><StatusChip status={m.score.status} /></>}
        title={l(dept.name)}
        description={t(
          "The department score is the average progress of the KPIs it owns, against the same targets the strategy office tracks.",
          "درجة الإدارة هي متوسط تقدّم المؤشرات التي تملكها، مقابل المستهدفات نفسها التي يتابعها مكتب الاستراتيجية.",
        )}
        tiles={
          <>
            <InfoTile value={l(dept.head.name)} label={l(dept.head.role)} />
            <InfoTile value={isAr ? `${m.rank} من ${DEPARTMENTS.length}` : `#${m.rank} of ${DEPARTMENTS.length}`} label={t("Rank across departments", "الترتيب بين الإدارات")} />
            <InfoTile value={isAr ? `${m.own.length} مؤشرات` : `${m.own.length} KPIs`} label={t("Owned KPIs", "المؤشرات المملوكة")} />
            <InfoTile value={l(period.label)} label={t("Period", "الفترة")} />
          </>
        }
        legend={
          <Legend rows={[
            { label: t("On track", "على المسار"), value: m.count("on-track"), dot: "bg-success" },
            { label: t("At risk", "معرّض للخطر"), value: m.count("at-risk"), dot: "bg-warning" },
            { label: t("Off track", "خارج المسار"), value: m.count("off-track"), dot: "bg-error" },
          ]} />
        }
        ring={<Ring value={loading ? null : m.score.progress} status={loading ? null : m.score.status} label={t("Department score", "درجة الإدارة")} sub={t("score", "الدرجة")} />}
      />

      <Split
        main={
          <>
            <Panel aria-labelledby="dept-qoq">
              <CardHeading
                id="dept-qoq" icon={BarChart3} title={t("Quarter-over-quarter score", "مقارنة الدرجة ربعًا بربع")}
                actions={qoq !== null && (
                  <span className="text-[12px] text-muted-foreground">
                    {l(PERIODS[qi].short)} <span dir="ltr" className="font-semibold text-foreground">{fmtDelta(qoq, isAr)}</span> {t(`vs ${PERIODS[qi - 1].short.en}`, `مقارنة ب${PERIODS[qi - 1].short.ar}`)}
                  </span>
                )}
              />
              <ChartLegend className="mt-4" items={[
                { label: t("On track", "على المسار"), kind: "rect", color: "var(--success)" },
                { label: t("At risk", "معرّض للخطر"), kind: "rect", color: "var(--warning)" },
                { label: t("Off track", "خارج المسار"), kind: "rect", color: "var(--error)" },
                { label: t(`Target ${THRESHOLDS.onTrack}%`, `المستهدف ${THRESHOLDS.onTrack}%`), kind: "line", color: REF_COLOR, dashed: true },
              ]} />
              <div className="mx-auto mt-4 max-w-[560px]">
                {loading ? <Skeleton className="h-[232px]" /> : (
                  <ColumnChart points={points} target={THRESHOLDS.onTrack} labelAll
                    ariaLabel={t(`${dept.name.en} score by quarter, 2026`, `درجة ${dept.name.ar} حسب الربع، 2026`)} />
                )}
              </div>
              <p className="mt-2 text-[11.5px] text-muted-foreground">
                {t("Q4 covers the months reported so far.", "يشمل الربع الرابع الأشهر المرفوعة حتى الآن.")}
              </p>
            </Panel>

            <Panel aria-labelledby="dept-kpis">
              <CardHeading id="dept-kpis" icon={Target} title={t("KPIs owned by this department", "مؤشرات هذه الإدارة")} />
              <DataGrid
                className="mt-2" template={TEMPLATE} minWidth={920} label={t("KPIs owned by this department", "مؤشرات هذه الإدارة")}
                headers={[
                  t("No.", "ترقيم"), t("KPI", "المؤشر"), t("Objective", "الهدف"), t("Target", "المستهدف"), t("Actual", "الفعلي"),
                  t("Trend", "الاتجاه"), t("Progress", "التقدّم"), t("Status", "الحالة"),
                ]}
              >
                {loading ? <SkeletonRows template={TEMPLATE} cols={8} rows={Math.max(2, m.own.length)} /> : m.own.length === 0 ? (
                  <EmptyState icon={SearchX} title={t("No KPIs assigned yet", "لا توجد مؤشرات مسندة بعد")} />
                ) : m.own.map(({ k, s }, i) => {
                  const obj = OBJECTIVES.find((o) => o.id === k.objectiveId)!
                  return (
                    <GridRow key={k.id} template={TEMPLATE} to={withPeriod(`${BASE}/kpis/${k.id}`)}>
                      <Cell className="text-muted-foreground">{i + 1}</Cell>
                      <Cell>
                        <span className="block truncate">{l(k.name)}</span>
                        <span className="block truncate text-[12px] text-muted-foreground">{k.code} · {l(k.owner.name)}</span>
                      </Cell>
                      <Cell className="truncate text-muted-foreground">{obj.code} · {l(pillarById(obj.pillarId).name)}</Cell>
                      <Cell className="tabular-nums">{fmtValue(k.unit, s.target, isAr)}</Cell>
                      <Cell className="tabular-nums">{fmtValue(k.unit, s.actual, isAr)}</Cell>
                      <Cell><Sparkline values={k.actuals} label={t(`${k.name.en} trend, 2026`, `اتجاه ${k.name.ar}، 2026`)} /></Cell>
                      <Cell>
                        <span className="flex items-center gap-2">
                          <ProgressBar className="flex-1" value={s.progress} status={s.status} label={l(k.name)} />
                          <span className="w-10 shrink-0 text-end text-[12.5px] tabular-nums">{fmtPct(s.progress)}</span>
                        </span>
                      </Cell>
                      <Cell><StatusChip status={s.status} /></Cell>
                    </GridRow>
                  )
                })}
              </DataGrid>
            </Panel>
          </>
        }
        side={<DepartmentRanking rows={m.ranking} highlightId={dept.id} loading={loading} title={t("Department ranking", "ترتيب الإدارات")} />}
      />
    </Page>
  )
}
