/** Manager reviews one employee goal by goal — Figma 4126:14408 (annual; the
 *  same page serves half-year cycles). The frame has no save action; Save draft +
 *  Submit added. Route: /operations/evaluate/:employeeId */
import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { SearchX, SquareStar, Users } from "lucide-react"

import { overallScore, teamMember, teamSelfScores, type Rating } from "../data/operations"
import { saveManagerScores, useOps } from "../store"
import { GoalTitleCell } from "../components/GoalTitleCell"
import { CardHeading, Cell, DataGrid, EmptyState, GoldButton, GridRow, Notice, OutlineButton, Page, Panel, RatingLegend, RatingSelect, RatingText, SkeletonRows } from "../components/ui"
import { useSimulatedLoad, useT } from "../components/helpers"

const TEMPLATE = "30px minmax(0,2.6fr) minmax(0,0.6fr) minmax(0,1.3fr) minmax(220px,1.4fr)"

export default function EmployeeReviewPage() {
  const { employeeId } = useParams()
  const { t, l } = useT()
  const navigate = useNavigate()
  const member = teamMember(employeeId)
  const goals = useOps((s) => s.goals)
  const allScores = useOps((s) => s.managerScores)
  const evaluated = useOps((s) => s.evaluated)
  const loading = useSimulatedLoad()
  const [scores, setScores] = React.useState<Record<string, Rating>>(() => (employeeId ? allScores[employeeId] ?? {} : {}))
  const [status, setStatus] = React.useState<"" | "draft" | "invalid">("")

  if (!member) {
    return (
      <Page>
        <Panel>
          <EmptyState
            icon={SearchX}
            title={t("Employee not found", "الموظف غير موجود")}
            action={<GoldButton onClick={() => navigate("/operations")}>{t("Back to Operations", "العودة إلى العمليات والأداء")}</GoldButton>}
          />
        </Panel>
      </Page>
    )
  }

  const done = evaluated.includes(member.id)
  const self = teamSelfScores[member.id] ?? {}
  const annual = member.cycle === "annual"
  const cardTitle = annual ? t("Annual evaluation", "التقييم السنوي") : t("Half-year evaluation", "التقييم النصف سنوي")
  const missing = goals.some((g) => !scores[g.id])

  const submit = () => {
    if (missing) {
      setStatus("invalid")
      return
    }
    const overall = overallScore(scores, goals)
    saveManagerScores(member.id, scores, true, overall ? (Math.round(overall) as Rating) : undefined)
    navigate("/operations")
  }

  return (
    <Page>
      <Panel>
        <CardHeading
          icon={SquareStar}
          title={
            <>
              {cardTitle}
              <span className="text-muted-foreground"> — {l(member.name)}</span>
            </>
          }
          actions={
            annual && (
              <OutlineButton size="sm" onClick={() => navigate("/operations/evaluate")}>
                <Users className="size-3.5" />
                {t("All annual evaluations", "جميع التقييمات السنوية")}
              </OutlineButton>
            )
          }
        />
        <DataGrid
          className="mt-2"
          template={TEMPLATE}
          minWidth={760}
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
          ) : (
            goals.map((g, i) => (
              <GridRow key={g.id} template={TEMPLATE} className="min-h-[50px] py-3">
                <Cell>{i + 1}</Cell>
                <GoalTitleCell goal={g} />
                <Cell className="tabular-nums">{g.weight}%</Cell>
                <Cell>
                  <RatingText value={self[g.id]} />
                </Cell>
                <Cell>
                  {done ? (
                    <RatingText value={allScores[member.id]?.[g.id]} />
                  ) : (
                    <RatingSelect
                      ariaLabel={t("Direct manager review", "مراجعة المدير المباشر")}
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
        {!loading && (
          <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-[13px]">
            <span className="inline-flex items-center gap-2">
              <span className="text-muted-foreground">{t("Self (weighted):", "الذاتي (مرجّح):")}</span>
              <RatingText value={overallScore(self, goals)} />
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="text-muted-foreground">{t("Manager (weighted):", "المدير (مرجّح):")}</span>
              <RatingText value={overallScore(done ? allScores[member.id] ?? {} : scores, goals)} />
            </span>
          </div>
        )}
        <RatingLegend />

        <div className="mt-6 flex flex-col items-start gap-3">
          {done && <Notice tone="success">{t("This evaluation has been submitted.", "تم إرسال هذا التقييم.")}</Notice>}
          {status === "draft" && <Notice tone="success">{t("Draft saved.", "تم حفظ المسودة.")}</Notice>}
          {status === "invalid" && (
            <Notice tone="error">{t("Rate every goal before submitting.", "قيّم جميع الأهداف قبل الإرسال.")}</Notice>
          )}
          {!done && (
            <div className="flex flex-wrap gap-4">
              <GoldButton onClick={submit}>{t("Submit evaluation", "إرسال التقييم")}</GoldButton>
              <OutlineButton
                onClick={() => {
                  saveManagerScores(member.id, scores, false)
                  setStatus("draft")
                }}
              >
                {t("Save draft", "حفظ كمسودة")}
              </OutlineButton>
            </div>
          )}
        </div>
      </Panel>
    </Page>
  )
}
