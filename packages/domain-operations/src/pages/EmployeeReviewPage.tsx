/** Manager reviews one employee goal by goal — Figma 4126:14408 (annual; the
 *  same page serves half-year cycles). The frame has no save action; Save draft +
 *  Submit added. Route: /operations/evaluate/:employeeId */
import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { usePageTitle } from "@reach/shell-context"
import { SearchX, SquareStar, Users } from "lucide-react"

import { overallScore, teamMember, teamSelfScores, type Rating } from "../data/operations"
import { saveManagerScores, useOps } from "../store"
import { GoalTitleCell } from "../components/GoalTitleCell"
import { CardHeading, Cell, DataGrid, EmptyState, GoldButton, GridRow, Notice, OutlineButton, Page, Panel, RatingLegend, RatingSelect, RatingText, SkeletonRows } from "../components/ui"
import { useSimulatedLoad, useT } from "../components/helpers"

// Figma columns: 40 · 595 · 89 · 208 · 208 (4126:14408).
const TEMPLATE = "40px minmax(0,595fr) minmax(0,89fr) minmax(0,208fr) minmax(208px,208fr)"

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
  // Figma top bar carries the employee's name (4126:14408 / 5233:28759).
  const isAnnual = member?.cycle === "annual"
  usePageTitle(
    member && `${isAnnual ? "Annual evaluation" : "Mid-year evaluation"} for “${member.name.en}”`,
    member && `${isAnnual ? "التقييم السنوي" : "التقييم النصف سنوي"} للموظف "${member.name.ar}"`,
  )

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
  const cardTitle = annual ? t("Annual evaluation", "التقييم السنوي") : t("Mid-year evaluation", "التقييم النصف سنوي")
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
          title={cardTitle}
          actions={
            // The frame's title is the review type only; whose review it is sits
            // with the actions so the heading keeps 4126:14408's text.
            <>
              <span className="text-[13px] text-muted-foreground">{l(member.name)}</span>
              {annual && (
                <OutlineButton size="sm" onClick={() => navigate("/operations/evaluate")}>
                  <Users className="size-3.5" />
                  {t("All annual evaluations", "جميع التقييمات السنوية")}
                </OutlineButton>
              )}
            </>
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
              <GridRow key={g.id} template={TEMPLATE} className="min-h-[65px] py-3.5">
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
