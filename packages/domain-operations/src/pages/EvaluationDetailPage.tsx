/** One past evaluation, read-only answers — Figma 4124:13130.
 *  Route: /operations/evaluations/:evaluationId */
import { useNavigate, useParams } from "react-router-dom"
import { usePageTitle } from "@reach/shell-context"
import { SearchX, SquareStar } from "lucide-react"

import { answersFor, evaluatedPerson, findEvaluationRecord, templateById } from "../data/operations"
import { ChecklistAnswers } from "../components/ChecklistAnswers"
import { CardHeading, EmptyState, GoldButton, Page, Panel } from "../components/ui"
import { useT } from "../components/helpers"

export default function EvaluationDetailPage() {
  const { evaluationId } = useParams()
  const { t } = useT()
  const navigate = useNavigate()
  const record = findEvaluationRecord(evaluationId)
  const person = evaluatedPerson(record?.employeeId)
  // Figma top bar carries the record name (4124:13130 / 5233:28552).
  usePageTitle(
    person && `Previous evaluations log for “${person.name.en}”`,
    person && `سجل التقييمات السابقة للموظف “${person.name.ar}”`,
  )

  if (!record || !person) {
    return (
      <Page>
        <Panel>
          <EmptyState
            icon={SearchX}
            title={t("Evaluation not found", "التقييم غير موجود")}
            action={<GoldButton onClick={() => navigate("/operations/evaluations")}>{t("Back to the log", "العودة إلى السجل")}</GoldButton>}
          />
        </Panel>
      </Page>
    )
  }

  const tpl = templateById(record.templateId)
  return (
    <Page>
      <Panel>
        <CardHeading
          icon={SquareStar}
          title={t(`Previous evaluations log for “${person.name.en}”`, `سجل التقييمات السابقة للموظف “${person.name.ar}”`)}
        />
        <ChecklistAnswers questions={tpl.questions} answers={answersFor(record)} readOnly />
      </Panel>
    </Page>
  )
}
