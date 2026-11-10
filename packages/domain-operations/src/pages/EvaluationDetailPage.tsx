/** One past evaluation, read-only answers — Figma 4124:13130.
 *  Route: /operations/evaluations/:evaluationId */
import { useNavigate, useParams } from "react-router-dom"
import { SearchX, SquareStar } from "lucide-react"

import { answersFor, evaluatedPerson, evaluationRecords, templateById } from "../data/operations"
import { ChecklistAnswers } from "../components/ChecklistAnswers"
import { CardHeading, EmptyState, GoldButton, OutlineButton, Page, Panel } from "../components/ui"
import { fmtDate, useT } from "../components/helpers"

export default function EvaluationDetailPage() {
  const { evaluationId } = useParams()
  const { t, l } = useT()
  const navigate = useNavigate()
  const record = evaluationRecords.find((r) => r.id === evaluationId)
  const person = evaluatedPerson(record?.employeeId)

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
          title={t(`Previous evaluations of “${person.name.en}”`, `سجل التقييمات السابقة للموظف ”${person.name.ar}“`)}
        />
        <p className="mt-3 text-[12.5px] text-muted-foreground">
          {l(tpl.name)} · {t("Evaluated by", "تقييم بواسطة")} {l(record.evaluator.name)} · {fmtDate(record.date)}
        </p>
        <ChecklistAnswers questions={tpl.questions} answers={answersFor(record)} readOnly />
        <div className="pt-6">
          <OutlineButton onClick={() => navigate(-1)}>{t("Back", "رجوع")}</OutlineButton>
        </div>
      </Panel>
    </Page>
  )
}
