/** Previous evaluations of one employee — Figma 4124:12781.
 *  Route: /operations/evaluations/employee/:employeeId */
import { useNavigate, useParams } from "react-router-dom"
import { usePageTitle } from "@reach/shell-context"
import { SearchX, SquareStar } from "lucide-react"

import { evaluatedPerson, evaluationRecords } from "../data/operations"
import { EvaluationLog, type LogRow } from "../components/EvaluationLog"
import { CardHeading, EmptyState, GoldButton, Page, Panel } from "../components/ui"
import { useT } from "../components/helpers"

export default function EmployeeEvaluationsPage() {
  const { employeeId } = useParams()
  const { t } = useT()
  const navigate = useNavigate()
  const person = evaluatedPerson(employeeId)
  // Figma top bar carries the record name (4124:12781 / 5233:28448).
  usePageTitle(
    person && `Previous evaluations log for “${person.name.en}”`,
    person && `سجل التقييمات السابقة للموظف “${person.name.ar}”`,
  )

  if (!person) {
    return (
      <Page>
        <Panel>
          <EmptyState
            icon={SearchX}
            title={t("Employee not found", "الموظف غير موجود")}
            action={<GoldButton onClick={() => navigate("/operations/evaluations")}>{t("Back to the log", "العودة إلى السجل")}</GoldButton>}
          />
        </Panel>
      </Page>
    )
  }

  const rows: LogRow[] = evaluationRecords
    .filter((r) => r.employeeId === person.id)
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

  return (
    <Page>
      <Panel>
        <CardHeading
          icon={SquareStar}
          title={t(`Previous evaluations log for “${person.name.en}”`, `سجل التقييمات السابقة للموظف “${person.name.ar}”`)}
        />
        <EvaluationLog rows={rows} nameHeader={t("Evaluated by", "تقييم بواسطة")} showPeopleFilters />
      </Panel>
    </Page>
  )
}
