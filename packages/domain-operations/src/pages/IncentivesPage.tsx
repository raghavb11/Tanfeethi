/** Incentives — Figma 4124:10275. Each checklist violation reduces the incentive.
 *  Route: /operations/incentives */
import { CircleDollarSign } from "lucide-react"

import { incentives } from "../data/operations"
import { CardHeading, Cell, DataGrid, EmptyState, GridRow, Page, Panel, SkeletonRows } from "../components/ui"
import { fmtDate, fmtSAR, useSimulatedLoad, useT } from "../components/helpers"

const TEMPLATE = "40px repeat(5,minmax(0,1fr)) minmax(0,3fr)"

export default function IncentivesPage() {
  const { t, l } = useT()
  const loading = useSimulatedLoad()
  return (
    <Page>
      <Panel>
        <CardHeading icon={CircleDollarSign} title={t("Incentives", "الحوافز")} />
        <DataGrid
          className="mt-2"
          template={TEMPLATE}
          minWidth={820}
          headers={[
            t("No.", "ترقيم"),
            t("Incentive date", "تاريخ الحافز"),
            t("Incentive amount", "مبلغ الحافز"),
            t("Deductions from incentive", "خصومات من مبلغ الحافز"),
            t("Violations", "عدد المخالفات"),
            t("Total incentive", "إجمالي مبلغ الحافز"),
            t("Deduction reason", "سبب الخصم"),
          ]}
        >
          {loading ? (
            <SkeletonRows template={TEMPLATE} cols={7} rows={3} />
          ) : incentives.length === 0 ? (
            <EmptyState icon={CircleDollarSign} title={t("No incentives yet", "لا توجد حوافز بعد")} />
          ) : (
            incentives.map((r, i) => (
              <GridRow key={r.id} template={TEMPLATE} className="min-h-[50px] py-3.5">
                <Cell>{i + 1}</Cell>
                <Cell>{fmtDate(r.date)}</Cell>
                <Cell className="tabular-nums">{fmtSAR(r.amount)}</Cell>
                <Cell className="tabular-nums">{fmtSAR(r.deduction)}</Cell>
                <Cell className={r.violations > 0 ? "font-bold text-error" : undefined}>{r.violations}</Cell>
                <Cell className="tabular-nums">{fmtSAR(r.amount - r.deduction)}</Cell>
                <Cell>{l(r.reason)}</Cell>
              </GridRow>
            ))
          )}
        </DataGrid>
      </Panel>
    </Page>
  )
}
