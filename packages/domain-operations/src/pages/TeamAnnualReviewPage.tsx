/** Annual evaluation of the whole team, one row per employee — Figma 4126:14560.
 *  The frame titled one employee while listing another twice; here it lists each
 *  annual-cycle employee once. Save action added. Route: /operations/evaluate */
import * as React from "react"
import { Link } from "react-router-dom"
import { SquareStar, Users } from "lucide-react"

import { initialGoals, overallScore, team, teamSelfScores, type Rating } from "../data/operations"
import { saveTeamOverall, useOps } from "../store"
import { CardHeading, Cell, DataGrid, EmptyState, GoldButton, GridRow, Notice, Page, Panel, RatingLegend, RatingSelect, RatingText, SkeletonRows } from "../components/ui"
import { useSimulatedLoad, useT } from "../components/helpers"

// Figma columns: 40 · 654 · 229 · 229 (4126:14560); the select is 208 wide.
const TEMPLATE = "40px minmax(0,654fr) minmax(0,229fr) minmax(220px,229fr)"
const annualTeam = team.filter((m) => m.cycle === "annual")

export default function TeamAnnualReviewPage() {
  const { t, l } = useT()
  const goals = useOps((s) => s.goals)
  const overall = useOps((s) => s.managerOverall)
  const evaluated = useOps((s) => s.evaluated)
  const loading = useSimulatedLoad()
  const [draft, setDraft] = React.useState<Record<string, Rating>>({})
  const [saved, setSaved] = React.useState(false)

  const pendingRated = Object.keys(draft).filter((id) => !evaluated.includes(id))

  return (
    <Page>
      <Panel>
        <CardHeading icon={SquareStar} title={t("Annual evaluation", "التقييم السنوي")} />
        <DataGrid
          className="mt-2"
          template={TEMPLATE}
          minWidth={640}
          headers={[
            t("No.", "ترقيم"),
            t("Employee name", "أسم الموظف"),
            t("Employee self-review", "المراجعة الذاتية للموظف"),
            t("Direct manager review", "مراجعة المدير المباشر"),
          ]}
        >
          {loading ? (
            <SkeletonRows template={TEMPLATE} cols={4} rows={2} />
          ) : annualTeam.length === 0 ? (
            <EmptyState icon={Users} title={t("No annual evaluations due", "لا توجد تقييمات سنوية مستحقة")} />
          ) : (
            annualTeam.map((m, i) => {
              const done = evaluated.includes(m.id)
              return (
                <GridRow key={m.id} template={TEMPLATE} className="min-h-[65px] py-3.5">
                  <Cell>{i + 1}</Cell>
                  <Cell>
                    <Link to={`/operations/evaluate/${m.id}`} className="hover:text-primary hover:underline">
                      {l(m.name)}
                    </Link>
                  </Cell>
                  <Cell>
                    <RatingText value={overallScore(teamSelfScores[m.id] ?? {}, goals.length ? goals : initialGoals)} />
                  </Cell>
                  <Cell>
                    {done ? (
                      <RatingText value={overall[m.id]} />
                    ) : (
                      <div className="max-w-[208px]">
                        <RatingSelect
                          ariaLabel={t("Direct manager review", "مراجعة المدير المباشر")}
                          value={draft[m.id] ?? overall[m.id]}
                          onChange={(v) => {
                            setDraft((d) => ({ ...d, [m.id]: v }))
                            setSaved(false)
                          }}
                        />
                      </div>
                    )}
                  </Cell>
                </GridRow>
              )
            })
          )}
        </DataGrid>
        <RatingLegend />
        <div className="mt-6 flex flex-col items-start gap-3">
          {saved && <Notice tone="success">{t("Evaluations submitted.", "تم إرسال التقييمات.")}</Notice>}
          <GoldButton
            disabled={pendingRated.length === 0}
            onClick={() => {
              saveTeamOverall(draft, pendingRated)
              setDraft({})
              setSaved(true)
            }}
          >
            {t("Save", "حفظ")}
          </GoldButton>
        </div>
      </Panel>
    </Page>
  )
}
