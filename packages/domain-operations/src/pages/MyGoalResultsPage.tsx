/** My previous (goal-based) evaluations — Figma 4124:13384.
 *  Route: /operations/personal/history */
import * as React from "react"
import { SquareStar, Target } from "lucide-react"

import { overallScore, pastGoalReviews } from "../data/operations"
import { useOps } from "../store"
import { GoalTitleCell } from "../components/GoalTitleCell"
import { CardHeading, Cell, DataGrid, EmptyState, FilterSelect, GridRow, Page, Panel, RatingLegend, RatingText, SkeletonRows } from "../components/ui"
import { useSimulatedLoad, useT } from "../components/helpers"

// Figma columns: 40 · 565 · 85 · 226 · 226.
const TEMPLATE = "40px minmax(0,565fr) minmax(0,85fr) minmax(0,226fr) minmax(0,226fr)"

export default function MyGoalResultsPage() {
  const { t, l } = useT()
  const goals = useOps((s) => s.goals)
  const loading = useSimulatedLoad()
  const [periodId, setPeriodId] = React.useState(pastGoalReviews[0]?.id ?? "")
  const period = pastGoalReviews.find((p) => p.id === periodId)
  const rows = period ? goals.filter((g) => period.self[g.id] || period.manager[g.id]) : []

  return (
    <Page>
      <Panel>
        {/* The period picker sits in the header's action slot so the table keeps
            the position 4124:13384 draws (the frame shows one period only). */}
        <CardHeading
          icon={SquareStar}
          title={t("View my previous evaluations", "عرض تقييماتي السابقة")}
          actions={
            <div className="w-[260px]">
              <FilterSelect
                label={t("Period", "الفترة")}
                value={periodId}
                onChange={setPeriodId}
                options={pastGoalReviews.map((p) => ({ value: p.id, label: l(p.label) }))}
              />
            </div>
          }
        />
        <DataGrid
          className="mt-2"
          template={TEMPLATE}
          minWidth={720}
          headers={[
            t("No.", "ترقيم"),
            t("Goal", "الهدف"),
            t("Weight", "الوزن"),
            t("Employee self-review", "المراجعة الذاتية للموظف"),
            t("Direct manager review", "مراجعة المدير المباشر"),
          ]}
        >
          {loading ? (
            <SkeletonRows template={TEMPLATE} cols={5} rows={3} />
          ) : !period || rows.length === 0 ? (
            <EmptyState icon={Target} title={t("No evaluations for this period", "لا توجد تقييمات لهذه الفترة")} />
          ) : (
            <>
              {rows.map((g, i) => (
                <GridRow key={g.id} template={TEMPLATE} className="min-h-[50px]">
                  <Cell>{i + 1}</Cell>
                  <GoalTitleCell goal={g} />
                  <Cell className="tabular-nums">{g.weight}%</Cell>
                  <Cell>
                    <RatingText value={period.self[g.id]} />
                  </Cell>
                  <Cell>
                    <RatingText value={period.manager[g.id]} />
                  </Cell>
                </GridRow>
              ))}
              <GridRow template={TEMPLATE} className="min-h-[50px] border-b-0 font-semibold">
                <Cell />
                <Cell>{t("Overall (weighted)", "الإجمالي (مرجّح)")}</Cell>
                <Cell />
                <Cell>
                  <RatingText value={overallScore(period.self, rows)} />
                </Cell>
                <Cell>
                  <RatingText value={overallScore(period.manager, rows)} />
                </Cell>
              </GridRow>
            </>
          )}
        </DataGrid>
        <RatingLegend />
      </Panel>
    </Page>
  )
}
