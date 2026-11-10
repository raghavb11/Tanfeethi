/** Checklist-based evaluation log table with filters — shared by Figma 4124:10533
 *  (manager, all staff), 4124:12781 (one employee) and 4215:13599 (my own). */
import * as React from "react"
import { useNavigate } from "react-router-dom"
import { SearchX, X } from "lucide-react"

import { evaluatedStaff, type L } from "../data/operations"
import { Cell, DataGrid, DateBox, EmptyState, FilterSelect, GoldButton, GridRow, MultiSelect, NegativeCount, SkeletonRows } from "./ui"
import { fmtDate, useSimulatedLoad, useT } from "./helpers"

export type LogRow = {
  id: string
  personId: string
  name: L
  jobTitle: L
  date: string
  day: string
  negatives: number
  to: string
}

const TEMPLATE = "30px minmax(0,1.6fr) minmax(0,1.6fr) minmax(0,1.3fr) minmax(0,1.3fr) minmax(0,1fr) 117px"

export function EvaluationLog({
  rows,
  nameHeader,
  showPeopleFilters,
}: {
  rows: LogRow[]
  nameHeader: string
  /** Job-title + employee filters (manager all-staff view only). */
  showPeopleFilters?: boolean
}) {
  const { t, l } = useT()
  const navigate = useNavigate()
  const loading = useSimulatedLoad()
  const [title, setTitle] = React.useState("all")
  const [people, setPeople] = React.useState<string[]>([])
  const [day, setDay] = React.useState("")

  const titles = React.useMemo(() => {
    const seen = new Map<string, L>()
    rows.forEach((r) => seen.set(r.jobTitle.en, r.jobTitle))
    return [...seen.values()]
  }, [rows])

  const filtered = rows.filter(
    (r) =>
      (title === "all" || r.jobTitle.en === title) &&
      (people.length === 0 || people.includes(r.personId)) &&
      (!day || r.day === day),
  )
  const filtering = title !== "all" || people.length > 0 || !!day

  return (
    <>
      <div className="mt-4 grid max-w-[700px] grid-cols-1 gap-2.5 sm:grid-cols-3">
        {showPeopleFilters && (
          <>
            <FilterSelect
              label={t("Job title", "المسمى الوظيفي")}
              value={title}
              onChange={setTitle}
              options={[{ value: "all", label: t("All", "الكل") }, ...titles.map((x) => ({ value: x.en, label: l(x) }))]}
            />
            <MultiSelect
              label={t("Employees", "الموظفون")}
              allLabel={t("All", "الكل")}
              options={evaluatedStaff
                .filter((p) => rows.some((r) => r.personId === p.id))
                .map((p) => ({ value: p.id, label: l(p.name) }))}
              value={people}
              onChange={setPeople}
            />
          </>
        )}
        <div className="relative">
          <DateBox value={day} onChange={setDay} placeholder={t("Evaluation for a specific day", "تاريخ التقييم الخاص بيوم")} />
          {day && (
            <button
              type="button"
              onClick={() => setDay("")}
              aria-label={t("Clear date", "مسح التاريخ")}
              className="absolute end-8 top-1/2 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      </div>

      <DataGrid
        className="mt-3"
        template={TEMPLATE}
        minWidth={840}
        headers={[
          t("No.", "ترقيم"),
          nameHeader,
          t("Job title", "المسمى الوظيفي"),
          t("Evaluation date", "تاريخ التقييم"),
          t("Evaluated day", "تقييم خاص بيوم"),
          t("Negative evaluations", "التقييمات السلبية"),
          t("View evaluations", "عرض التقييمات"),
        ]}
      >
        {loading ? (
          <SkeletonRows template={TEMPLATE} cols={7} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title={filtering ? t("No evaluations match these filters", "لا توجد تقييمات مطابقة لهذه التصفية") : t("No evaluations yet", "لا توجد تقييمات بعد")}
            action={
              filtering ? (
                <GoldButton
                  size="sm"
                  onClick={() => {
                    setTitle("all")
                    setPeople([])
                    setDay("")
                  }}
                >
                  {t("Clear filters", "مسح التصفية")}
                </GoldButton>
              ) : undefined
            }
          />
        ) : (
          filtered.map((r, i) => (
            <GridRow key={r.id} template={TEMPLATE}>
              <Cell>{i + 1}</Cell>
              <Cell>{l(r.name)}</Cell>
              <Cell>{l(r.jobTitle)}</Cell>
              <Cell>{fmtDate(r.date)}</Cell>
              <Cell>{fmtDate(r.day)}</Cell>
              <Cell>
                <NegativeCount n={r.negatives} />
              </Cell>
              <Cell>
                <GoldButton className="w-[117px] px-2 font-medium" onClick={() => navigate(r.to)}>
                  {t("View evaluations", "عرض التقييمات")}
                </GoldButton>
              </Cell>
            </GridRow>
          ))
        )}
      </DataGrid>
    </>
  )
}
