/** Self-review against my goals — half-year (Figma 4124:13576) and annual
 *  (Figma 4126:14074). The frames have no save action; Save draft + Submit added.
 *  Routes: /operations/personal/half-year, /operations/personal/annual */
import * as React from "react"
import { SquareStar, Target } from "lucide-react"

import { overallScore, type Rating } from "../data/operations"
import { saveSelfReview, useOps } from "../store"
import { GoalTitleCell } from "../components/GoalTitleCell"
import { CardHeading, Cell, DataGrid, EmptyState, GoldButton, GridRow, Notice, OutlineButton, Page, Panel, RatingLegend, RatingSelect, RatingText, SkeletonRows } from "../components/ui"
import { useSimulatedLoad, useT } from "../components/helpers"

// Figma columns: 40 · 741 · 111 · 259 (4126:14074 / 4124:13576).
const TEMPLATE = "40px minmax(0,741fr) minmax(0,111fr) minmax(220px,259fr)"

function SelfReview({ cycle }: { cycle: "half-year" | "annual" }) {
  const { t } = useT()
  const goals = useOps((s) => s.goals)
  const saved = useOps((s) => s.selfReview[cycle])
  const submitted = useOps((s) => s.selfSubmitted[cycle])
  const loading = useSimulatedLoad()
  const [scores, setScores] = React.useState<Record<string, Rating>>(saved)
  const [status, setStatus] = React.useState<"" | "draft" | "submitted" | "invalid">("")

  const missing = goals.filter((g) => !scores[g.id])
  const title = cycle === "annual" ? t("Annual evaluation", "التقييم السنوي") : t("Mid-year evaluation", "التقييم النصف سنوي")

  const saveDraft = () => {
    saveSelfReview(cycle, scores, false)
    setStatus("draft")
  }
  const submit = () => {
    if (missing.length) {
      setStatus("invalid")
      return
    }
    saveSelfReview(cycle, scores, true)
    setStatus("submitted")
  }

  return (
    <Page>
      <Panel>
        <CardHeading icon={SquareStar} title={title} />
        <DataGrid
          className="mt-2"
          template={TEMPLATE}
          minWidth={640}
          headers={[t("No.", "ترقيم"), t("Goal", "الهدف"), t("Weight", "الوزن"), t("Self-review", "المراجعة الذاتية")]}
        >
          {loading ? (
            <SkeletonRows template={TEMPLATE} cols={4} rows={3} />
          ) : goals.length === 0 ? (
            <EmptyState
              icon={Target}
              title={t("No goals to review", "لا توجد أهداف للتقييم")}
              body={t("Add goals in the goals list first.", "أضف أهدافك في قائمة الأهداف أولاً.")}
            />
          ) : (
            goals.map((g, i) => (
              <GridRow key={g.id} template={TEMPLATE} className="min-h-[65px] py-3.5">
                <Cell>{i + 1}</Cell>
                <GoalTitleCell goal={g} />
                <Cell className="tabular-nums">{g.weight}%</Cell>
                <Cell>
                  {submitted ? (
                    <RatingText value={saved[g.id]} />
                  ) : (
                    <RatingSelect
                      ariaLabel={t("Self-review", "المراجعة الذاتية")}
                      value={scores[g.id]}
                      invalid={status === "invalid" && !scores[g.id]}
                      onChange={(v) => {
                        setScores((s) => ({ ...s, [g.id]: v }))
                        setStatus("")
                      }}
                    />
                  )}
                </Cell>
              </GridRow>
            ))
          )}
        </DataGrid>
        {!loading && goals.length > 0 && (
          <p className="mt-3 flex flex-wrap items-center gap-2 text-[13px]">
            <span className="text-muted-foreground">{t("Overall (weighted):", "الإجمالي المرجّح:")}</span>
            <RatingText value={overallScore(submitted ? saved : scores, goals)} />
          </p>
        )}
        <RatingLegend />

        <div className="mt-6 flex flex-col items-start gap-3">
          {status === "draft" && <Notice tone="success">{t("Draft saved.", "تم حفظ المسودة.")}</Notice>}
          {submitted && (
            <Notice tone="success">
              {t("Your self-review was submitted to your direct manager.", "تم إرسال مراجعتك الذاتية إلى مديرك المباشر.")}
            </Notice>
          )}
          {status === "invalid" && (
            <Notice tone="error">{t("Rate every goal before submitting.", "قيّم جميع الأهداف قبل الإرسال.")}</Notice>
          )}
          {!submitted && goals.length > 0 && (
            <div className="flex flex-wrap gap-4">
              <GoldButton onClick={submit}>{t("Submit", "إرسال")}</GoldButton>
              <OutlineButton onClick={saveDraft}>{t("Save draft", "حفظ كمسودة")}</OutlineButton>
            </div>
          )}
        </div>
      </Panel>
    </Page>
  )
}

export function HalfYearReviewPage() {
  return <SelfReview cycle="half-year" />
}

export function AnnualReviewPage() {
  return <SelfReview cycle="annual" />
}
