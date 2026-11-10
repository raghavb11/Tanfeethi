/** Operations & Performance hub — Figma 3907:9016 (empty table), 4124:11249
 *  (create-checklist filters) and 4124:11545 (populated table). */
import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { cn } from "@reach/shared-core"
import { BadgeCheck, ChevronLeft, ChevronRight, CircleDollarSign, ClipboardList, Plus, UserRound } from "lucide-react"

import {
  currentUser,
  loungeById,
  lounges,
  team,
  templateById,
  templates,
  violationsOf,
  type TeamMember,
} from "../data/operations"
import { createRun, useOps } from "../store"
import { CardHeading, Cell, DataGrid, DateBox, EmptyState, Field, GoldButton, GridRow, NegativeCount, OutlineButton, Page, Panel, SelectBox, SkeletonRows } from "../components/ui"
import { fmtDate, useSimulatedLoad, useT } from "../components/helpers"

const TEMPLATE = "30px minmax(0,2fr) minmax(0,2fr) minmax(0,1fr) minmax(0,1.1fr) minmax(0,1fr) 117px"

function ProfileTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="panel flex min-h-[81px] min-w-0 flex-col justify-center gap-0.5 rounded-xl px-[18px] py-4">
      <span className="truncate text-base font-semibold leading-8 text-foreground" dir="auto">
        {value}
      </span>
      <span className="text-[11.5px] text-muted-foreground">{label}</span>
    </div>
  )
}

function Hero() {
  const { t, l } = useT()
  const tiles: [string, string][] = [
    [l(currentUser.name), t("Name", "الاسم")],
    [l(currentUser.jobTitle), t("Job title", "المسمى الوظيفي")],
    [currentUser.employeeNo, t("Employee no.", "الرقم الوظيفي")],
    [l(currentUser.department), t("Department", "الإدارة")],
    [l(currentUser.manager), t("Direct manager", "المدير المباشر")],
    [currentUser.email, t("Email", "البريد الإلكتروني")],
  ]
  return (
    // Figma Hero: radius 16, padding 40 / 24 (start) / 40 / 56 (end), green glow.
    <section className="highlight-card hl-green relative overflow-hidden rounded-2xl px-6 py-10 md:pe-14 md:ps-6">
      <div className="flex min-h-[268px] flex-col justify-between gap-5">
        <div className="flex flex-col gap-2">
          <h2 className="text-[27px] font-normal leading-[38px] tracking-[-0.27px] text-foreground">
            {t("Operations & Performance", "العمليات والأداء")}
          </h2>
          <p className="text-[12.5px] text-foreground">
            {t(
              "Evaluate and follow up the quality and performance of Altanfeethi's staff",
              "قيّم وتابع جودة وأداء موظفي التنفيذي",
            )}
          </p>
        </div>
        <div className="grid w-full max-w-[798px] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map(([v, lab]) => (
            <ProfileTile key={lab} value={v} label={lab} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ChecklistsCard() {
  const { t, l } = useT()
  const navigate = useNavigate()
  const runs = useOps((s) => s.runs)
  const loading = useSimulatedLoad()
  const [creating, setCreating] = React.useState(false)
  const [lounge, setLounge] = React.useState("")
  const [template, setTemplate] = React.useState("")
  const [date, setDate] = React.useState("")
  const [tried, setTried] = React.useState(false)

  const submit = () => {
    setTried(true)
    if (!lounge || !template || !date) return
    const id = createRun(template, lounge, date)
    navigate(`/operations/checklists/${id}`)
  }

  return (
    <Panel>
      <CardHeading
        icon={BadgeCheck}
        title={t("Operational checklists", "قوائم التحقق التشغيلية")}
        actions={
          !creating && (
            <GoldButton size="sm" onClick={() => setCreating(true)}>
              {t("Create new audit checklist", "إنشاء قائمة تدقيق جديدة")}
            </GoldButton>
          )
        }
      />

      {creating && (
        <div className="mt-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label={t("Choose lounge", "اختر الصالة")} htmlFor="ops-lounge" error={tried && !lounge ? t("Required", "مطلوب") : undefined}>
              <SelectBox
                id="ops-lounge"
                value={lounge}
                onChange={setLounge}
                placeholder={t("Lounge", "الصالة")}
                invalid={tried && !lounge}
                options={lounges.map((x) => ({ value: x.id, label: l(x.name) }))}
              />
            </Field>
            <Field label={t("Choose audit checklist", "اختر قائمة التدقيق")} htmlFor="ops-template" error={tried && !template ? t("Required", "مطلوب") : undefined}>
              <SelectBox
                id="ops-template"
                value={template}
                onChange={setTemplate}
                placeholder={t("Audit checklist", "قائمة التدقيق")}
                invalid={tried && !template}
                options={templates.map((x) => ({ value: x.id, label: l(x.name) }))}
              />
            </Field>
            <Field label={t("Choose date", "اختر التاريخ")} htmlFor="ops-date" error={tried && !date ? t("Required", "مطلوب") : undefined}>
              <DateBox id="ops-date" value={date} onChange={setDate} placeholder={t("Date", "تاريخ")} invalid={tried && !date} />
            </Field>
          </div>
          <div className="flex flex-wrap gap-3">
            <GoldButton onClick={submit}>{t("Create new audit checklist", "إنشاء قائمة تدقيق جديدة")}</GoldButton>
            <OutlineButton
              onClick={() => {
                setCreating(false)
                setTried(false)
              }}
            >
              {t("Cancel", "إلغاء")}
            </OutlineButton>
          </div>
        </div>
      )}

      <DataGrid
        className="mt-2"
        template={TEMPLATE}
        minWidth={720}
        headers={[
          t("No.", "ترقيم"),
          t("Audit checklist", "قائمة التدقيق"),
          t("Reviewer name", "اسم المراجع"),
          t("Review date", "تاريخ المراجعة"),
          t("Lounge", "الصالة"),
          t("Violations", "عدد المخالفات"),
          t("Evaluations", "التقييمات"),
        ]}
      >
        {loading ? (
          <SkeletonRows template={TEMPLATE} cols={7} />
        ) : runs.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title={t("No audit checklists yet", "لا توجد قوائم تدقيق بعد")}
            body={t("Create an audit checklist to start reviewing a lounge.", "أنشئ قائمة تدقيق لبدء مراجعة إحدى الصالات.")}
          />
        ) : (
          runs.map((r, i) => {
            const pending = r.status === "pending"
            return (
              <GridRow key={r.id} template={TEMPLATE}>
                <Cell>{i + 1}</Cell>
                <Cell>{l(templateById(r.templateId).name)}</Cell>
                <Cell>{r.reviewer ? l(r.reviewer) : ""}</Cell>
                <Cell>{pending ? "" : fmtDate(r.date)}</Cell>
                <Cell>{l(loungeById(r.loungeId).name)}</Cell>
                <Cell>{pending ? t("Not evaluated", "لم يتم التقييم") : <NegativeCount n={violationsOf(r)} />}</Cell>
                <Cell>
                  <GoldButton
                    className="w-[117px] px-2 font-medium"
                    onClick={() => navigate(`/operations/checklists/${r.id}`)}
                  >
                    {pending ? t("Evaluate", "تقييم") : t("View evaluation", "عرض التقييم")}
                  </GoldButton>
                </Cell>
              </GridRow>
            )
          })
        )}
      </DataGrid>
    </Panel>
  )
}

function LinkRow({
  to,
  icon: Icon,
  iconClass,
  label,
}: {
  to: string
  icon: typeof Plus
  iconClass?: string
  label: string
}) {
  const { isAr } = useT()
  const Chevron = isAr ? ChevronLeft : ChevronRight
  return (
    <Link
      to={to}
      className="panel flex h-16 items-center gap-3 rounded-xl px-[18px] py-4 transition-colors hover:bg-secondary/40 focus-visible:ring-2 focus-visible:ring-ring outline-none"
    >
      <Icon className={cn("size-[19px] shrink-0", iconClass)} strokeWidth={1.7} />
      <span className="min-w-0 flex-1 truncate text-base font-semibold leading-8">{label}</span>
      <Chevron className="size-4 shrink-0 text-foreground" />
    </Link>
  )
}

function EmployeeCard({ m }: { m: TeamMember }) {
  const { t, l } = useT()
  const navigate = useNavigate()
  return (
    <article className="flex flex-col gap-3.5 rounded-[10px] border border-border bg-background p-4">
      <div className="flex items-start gap-3">
        <span className="icon-tile size-[30px] shrink-0 border border-secondary">
          <UserRound className="size-[15px]" strokeWidth={1.7} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-[14.5px] leading-[21.75px]">{l(m.name)}</span>
            <span className="shrink-0 text-[12.5px] text-muted-foreground">
              {t("Employee no.", "الرقم الوظيفي")}: {m.employeeNo}
            </span>
          </div>
          <span className="text-[12.5px] text-muted-foreground">
            {l(m.role)} · {l(m.city)}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2 text-[14.5px] leading-[21.75px]">
        <span>{m.cycle === "annual" ? t("Annual evaluation", "تقييم سنوي") : t("Half-year evaluation", "تقييم نصف سنوي")}</span>
        <span>
          {t("Direct manager", "المدير المباشر")}: {l(m.manager)}
        </span>
      </div>
      <div className="flex items-center gap-6 pt-2">
        <GoldButton className="flex-1 px-2 font-medium" onClick={() => navigate(`/operations/evaluate/${m.id}`)}>
          {t("Evaluate", "تقييم")}
        </GoldButton>
        <OutlineButton
          className="flex-1 px-2 font-medium"
          onClick={() => navigate(`/operations/evaluations/employee/${m.id}`)}
        >
          {t("View previous evaluations", "عرض التقييمات السابقة")}
        </OutlineButton>
      </div>
    </article>
  )
}

function EmployeeEvaluationCard() {
  const { t } = useT()
  const navigate = useNavigate()
  const evaluated = useOps((s) => s.evaluated)
  const pending = team.filter((m) => !evaluated.includes(m.id))
  return (
    <Panel className="sm:px-4">
      <CardHeading
        icon={BadgeCheck}
        title={t("Employee evaluation", "تقييم الموظفين")}
        actions={
          <GoldButton size="sm" onClick={() => navigate("/operations/evaluations")}>
            {t("Previous evaluations", "التقييمات السابقة")}
          </GoldButton>
        }
      />
      <div className="mt-[18px] flex flex-col">
        {pending.map((m) => (
          <EmployeeCard key={m.id} m={m} />
        ))}
        {pending.length === 0 && (
          <div className="flex flex-col items-center gap-2 pb-2 pt-6 text-center">
            <BadgeCheck className="size-5 text-primary" strokeWidth={1.7} />
            <p className="text-sm font-medium">{t("All employees have been evaluated", "تم تقييم جميع الموظفين")}</p>
            <p className="text-xs text-muted-foreground">
              {t(
                "You've evaluated your whole team for this cycle. We'll let you know when a new evaluation is due.",
                "قيّمت جميع موظفيك لهذه الدورة. سنُشعرك عند استحقاق تقييم جديد.",
              )}
            </p>
          </div>
        )}
      </div>
    </Panel>
  )
}

export default function OperationsHubPage() {
  const { t } = useT()
  return (
    <Page>
      <Hero />
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <ChecklistsCard />
        </div>
        <aside className="flex w-full shrink-0 flex-col gap-6 lg:w-[400px]">
          <LinkRow to="/operations/delegation/new" icon={Plus} label={t("Raise a new delegation request", "رفع طلب إنابة جديد")} />
          <LinkRow to="/operations/incentives" icon={CircleDollarSign} iconClass="text-primary" label={t("Incentives", "الحوافز")} />
          <LinkRow to="/operations/personal" icon={BadgeCheck} iconClass="text-primary" label={t("Personal evaluation", "التقييم الشخصي")} />
          <EmployeeEvaluationCard />
        </aside>
      </div>
    </Page>
  )
}
