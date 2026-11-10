/** Checklist-based evaluation log table with filters — shared by Figma 4124:10533
 *  (manager, all staff), 4124:12781 (one employee) and 4215:13599 (my own). */
import * as React from "react"
import { useNavigate } from "react-router-dom"
import { SearchX, X } from "lucide-react"

import type { L } from "../data/operations"
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

// Figma columns: 40 · 214 · 214 · 214 · 214 · 118 · 107 (10px gaps).
const TEMPLATE = "40px repeat(4,minmax(0,1fr)) 118px 107px"

export function EvaluationLog({
  rows,
  nameHeader,
  showPeopleFilters,
}: {
  rows: LogRow[]
  nameHeader: string
  /** Job-title + people filters (manager views 4124:10533 and 4124:12781). */
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

  /** People in the first column (employees, or evaluators on the per-employee log). */
  const peopleOptions = React.useMemo(() => {
    const seen = new Map<string, L>()
    rows.forEach((r) => seen.set(r.personId, r.name))
    return [...seen.entries()]
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
      <div className="flex flex-wrap gap-2 pt-4 [&>*]:w-full sm:[&>*]:w-[225px]">
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
              options={peopleOptions.map(([id, name]) => ({ value: id, label: l(name) }))}
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
        className="mt-2"
        template={TEMPLATE}
        minWidth={840}
        headers={[
          t("No.", "ترقيم"),
          nameHeader,
          t("Job title", "المسمى الوظيفي"),
          t("Evaluation date", "تاريخ التقييم"),
          t("Single-day evaluation", "تقييم خاص بيوم"),
          // Figma wraps this header onto two lines (5233:28184); keep it wrapped.
          <span key="neg" className="block max-w-[96px]">{t("Negative evaluations", "التقييمات السلبية")}</span>,
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
                <GoldButton className="w-[107px] px-0 font-medium" onClick={() => navigate(r.to)}>
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
