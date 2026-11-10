/** Goals list — Figma 4124:13741, with the goal-details modals 4124:13923
 *  (add, editable) and 4124:14002 (info icon, read-only). Route: /operations/personal/goals */
import * as React from "react"
import { BadgeCheck, Target } from "lucide-react"

import { measureUnits, type Goal } from "../data/operations"
import { upsertGoal, useOps } from "../store"
import { GoalModal } from "../components/GoalModal"
import { CardHeading, Cell, DataGrid, EmptyState, GoldButton, GridRow, InfoButton, Page, Panel, SkeletonRows } from "../components/ui"
import { fmtDate, useSimulatedLoad, useT } from "../components/helpers"

const TEMPLATE =
  "30px minmax(0,2.2fr) minmax(0,3fr) minmax(0,1fr) minmax(0,1fr) minmax(0,0.9fr) minmax(0,0.6fr) minmax(0,0.5fr)"

export default function GoalsListPage() {
  const { t, l } = useT()
  const goals = useOps((s) => s.goals)
  const loading = useSimulatedLoad()
  const [viewing, setViewing] = React.useState<Goal | undefined>()
  const [adding, setAdding] = React.useState(false)
  const totalWeight = goals.reduce((s, g) => s + g.weight, 0)

  return (
    <Page>
      <Panel>
        <CardHeading
          icon={BadgeCheck}
          title={t("Goals list", "قائمة الأهداف")}
          actions={
            <GoldButton size="sm" onClick={() => setAdding(true)} disabled={totalWeight >= 100}>
              {t("Add new goal", "إضافة هدف جديد")}
            </GoldButton>
          }
        />
        <DataGrid
          className="mt-2"
          template={TEMPLATE}
          minWidth={900}
          headers={[
            t("No.", "ترقيم"),
            t("Goal", "الهدف"),
            t("Indicator", "المؤشر"),
            t("Start date", "تاريخ البدء"),
            t("End date", "تاريخ الانتهاء"),
            t("Unit of measure", "وحدة القياس"),
            t("Target", "المستهدف"),
            t("Weight", "الوزن"),
          ]}
        >
          {loading ? (
            <SkeletonRows template={TEMPLATE} cols={8} rows={3} />
          ) : goals.length === 0 ? (
            <EmptyState
              icon={Target}
              title={t("No goals yet", "لا توجد أهداف بعد")}
              body={t("Add your goals for this year so they can be reviewed.", "أضف أهدافك لهذا العام ليتم تقييمها.")}
            />
          ) : (
            goals.map((g, i) => (
              <GridRow key={g.id} template={TEMPLATE} className="min-h-[50px]">
                <Cell>{i + 1}</Cell>
                <Cell className="flex items-center gap-2">
                  <span className="min-w-0">{l(g.title)}</span>
                  <InfoButton label={t("Goal details", "تفاصيل الهدف")} onClick={() => setViewing(g)} />
                </Cell>
                <Cell className="truncate" >
                  <span title={l(g.indicator)}>{l(g.indicator)}</span>
                </Cell>
                <Cell>{fmtDate(g.start)}</Cell>
                <Cell>{fmtDate(g.end)}</Cell>
                <Cell>{l(measureUnits.find((u) => u.id === g.unit)!.label)}</Cell>
                <Cell className="tabular-nums">{g.target}</Cell>
                <Cell className="tabular-nums">{g.weight}%</Cell>
              </GridRow>
            ))
          )}
        </DataGrid>
        {!loading && goals.length > 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            {t(`Total weight: ${totalWeight}% of 100%`, `مجموع الأوزان: ${totalWeight}% من 100%`)}
          </p>
        )}
      </Panel>

      <GoalModal open={!!viewing} onOpenChange={(o) => !o && setViewing(undefined)} goal={viewing} readOnly />
      <GoalModal open={adding} onOpenChange={setAdding} otherWeight={totalWeight} onSave={upsertGoal} />
    </Page>
  )
}
