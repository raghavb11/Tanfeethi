/** Previous evaluations log, manager view of all staff — Figma 4124:10533.
 *  Route: /operations/evaluations */
import { SquareStar } from "lucide-react"

import { evaluatedStaff, evaluationRecords } from "../data/operations"
import { EvaluationLog, type LogRow } from "../components/EvaluationLog"
import { CardHeading, Page, Panel } from "../components/ui"
import { useT } from "../components/helpers"

/** One row per employee: their most recent evaluation. */
const rows: LogRow[] = evaluatedStaff.flatMap((p) => {
  const latest = evaluationRecords
    .filter((r) => r.employeeId === p.id)
    .sort((a, b) => b.date.localeCompare(a.date))[0]
  return latest
    ? [{ id: latest.id, personId: p.id, name: p.name, jobTitle: p.jobTitle, date: latest.date, day: latest.day, negatives: latest.negatives, to: `/operations/evaluations/employee/${p.id}` }]
    : []
})

export default function EvaluationsLogPage() {
  const { t } = useT()
  return (
    <Page>
      <Panel>
        <CardHeading icon={SquareStar} title={t("Previous evaluations log", "سجل التقييمات السابقة")} />
        <EvaluationLog rows={rows} nameHeader={t("Name", "الأسم")} showPeopleFilters />
      </Panel>
    </Page>
  )
}
