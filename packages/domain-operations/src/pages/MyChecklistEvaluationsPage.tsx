/** My previous (checklist-based) evaluations, employee self view — Figma 4215:13599.
 *  Route: /operations/personal/operational-log */
import { SquareStar } from "lucide-react"

import { currentUser, evaluationRecords } from "../data/operations"
import { EvaluationLog, type LogRow } from "../components/EvaluationLog"
import { CardHeading, Page, Panel } from "../components/ui"
import { useT } from "../components/helpers"

// The current user's own records — not a copy of the manager's all-staff list.
const rows: LogRow[] = evaluationRecords
  .filter((r) => r.employeeId === currentUser.id)
  .sort((a, b) => b.date.localeCompare(a.date))
  .map((r) => ({
    id: r.id,
    personId: r.evaluator.id,
    name: r.evaluator.name,
    jobTitle: r.evaluator.jobTitle,
    date: r.date,
    day: r.day,
    negatives: r.negatives,
    to: `/operations/evaluations/${r.id}`,
  }))

export default function MyChecklistEvaluationsPage() {
  const { t } = useT()
  return (
    <Page>
      <Panel>
        <CardHeading icon={SquareStar} title={t("View my previous evaluations", "عرض تقييماتي السابقة")} />
        <EvaluationLog rows={rows} nameHeader={t("Name", "الأسم المدير المباشر")} />
      </Panel>
    </Page>
  )
}
