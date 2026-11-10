/** Operational checklist — fill-in form (Figma 4124:12320) for a pending audit,
 *  read-only answers for a completed one. Route: /operations/checklists/:runId */
import * as React from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { BadgeCheck, SearchX } from "lucide-react"

import { currentUser, loungeById, templateById, type Answer } from "../data/operations"
import { completeRun, useOps } from "../store"
import { ChecklistAnswers } from "../components/ChecklistAnswers"
import { emptyAnswer } from "../components/helpers"
import { CardHeading, EmptyState, GoldButton, Notice, OutlineButton, Page, Panel } from "../components/ui"
import { fmtDate, useT } from "../components/helpers"

export default function ChecklistRunPage() {
  const { runId } = useParams()
  const { t, l } = useT()
  const navigate = useNavigate()
  const runs = useOps((s) => s.runs)
  const run = runs.find((r) => r.id === runId)

  // Capture helper: "?state=draft" opens the half-filled form 4124:12320 draws
  // (Q1 complied, Q2 not complied with Ali responsible).
  const draft = new URLSearchParams(useLocation().search).get("state") === "draft"
  const [answers, setAnswers] = React.useState<Record<string, Answer>>(() => {
    if (!draft || !run || run.status === "completed") return run?.answers ?? {}
    const [q1, q2] = templateById(run.templateId).questions
    return {
      ...(q1 ? { [q1.id]: { ...emptyAnswer(), complied: true } } : {}),
      ...(q2 ? { [q2.id]: { ...emptyAnswer(), complied: false, responsible: ["ali"] } } : {}),
    }
  })
  const [tried, setTried] = React.useState(false)

  if (!run) {
    return (
      <Page>
        <Panel>
          <EmptyState
            icon={SearchX}
            title={t("Checklist not found", "قائمة التحقق غير موجودة")}
            body={t("It may have been removed or the link is wrong.", "ربما حُذفت أو أن الرابط غير صحيح.")}
            action={<GoldButton onClick={() => navigate("/operations")}>{t("Back to Operations", "العودة إلى العمليات والأداء")}</GoldButton>}
          />
        </Panel>
      </Page>
    )
  }

  const tpl = templateById(run.templateId)
  const lounge = l(loungeById(run.loungeId).name)
  const readOnly = run.status === "completed"
  const title = t(
    `Operational checklist for “${tpl.name.en}” – ${lounge} lounge`,
    `قائمة التحقق التشغيلية لـ”${tpl.name.ar}” للصالة ${lounge}`,
  )

  const invalid = tpl.questions.some((q) => {
    const a = answers[q.id]
    return !a || a.complied === null || (a.complied === false && a.responsible.length === 0)
  })

  const save = () => {
    setTried(true)
    if (invalid) return
    const today = new Date().toISOString().slice(0, 10)
    completeRun(run.id, answers, currentUser.name, today)
    navigate("/operations")
  }

  return (
    <Page>
      <Panel>
        <CardHeading icon={BadgeCheck} title={title} />
        {readOnly && run.reviewer && (
          <p className="mt-3 text-[12.5px] text-muted-foreground">
            {t("Reviewed by", "راجعها")} {l(run.reviewer)} · {fmtDate(run.date)}
          </p>
        )}
        <ChecklistAnswers
          questions={tpl.questions}
          answers={readOnly ? run.answers : answers}
          readOnly={readOnly}
          showErrors={tried}
          onChange={(qid, a) => setAnswers((prev) => ({ ...prev, [qid]: a ?? emptyAnswer() }))}
        />
        {tried && invalid && (
          <div className="mt-2">
            <Notice tone="error">
              {t(
                "Answer every question, and pick the responsible persons for each \"No\".",
                "أجب عن جميع الأسئلة، وحدد الأشخاص المسؤولين لكل إجابة «لا».",
              )}
            </Notice>
          </div>
        )}
        <div className="flex flex-wrap items-start gap-4 pt-6">
          {readOnly ? (
            <OutlineButton onClick={() => navigate("/operations")}>{t("Back", "رجوع")}</OutlineButton>
          ) : (
            <>
              <GoldButton onClick={save}>{t("Save", "حفظ")}</GoldButton>
              <OutlineButton className="w-[84px] px-0" onClick={() => navigate("/operations")}>{t("Cancel", "إلغاء")}</OutlineButton>
            </>
          )}
        </div>
      </Panel>
    </Page>
  )
}
