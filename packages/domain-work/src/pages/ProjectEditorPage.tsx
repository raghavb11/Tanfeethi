import * as React from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { cn } from "@reach/shared-core"
import { ArrowLeft, CalendarDays, FileText, Info, RotateCcw, UserRoundCog } from "lucide-react"

import { Btn, CardHeader, FilterSelect, Initials, Page, Panel, TextCounter, useT } from "../components/ui"
import { MANAGER, team } from "../data/team"
import {
  addProject, getProjectById, nextProjectCode, newProjectId,
  STATUS_LABEL, type ProjectStatus, updateProject,
} from "../data/projects"
import {
  CATEGORIES, type CategoryId, CURRENT_SPRINT, PRIORITIES, PRIORITY_META, SPRINTS, type TaskPriority,
} from "../data/meta"
import { ME, prettyDate, TASK_TODAY_ISO } from "../data/tasks"

const STATUSES: ProjectStatus[] = ["planned", "active", "on-hold", "done"]

/** Create a project, or edit one through the older routed form
 *  (/projects/:id/edit). The detail page edits inline, as drawn. */
export default function ProjectEditorPage() {
  const { isAr, t } = useT()
  const navigate = useNavigate()
  const { id } = useParams()
  const [params] = useSearchParams()

  const existing = id ? getProjectById(id) : undefined
  const editing = !!existing

  const [code] = React.useState(existing?.code ?? nextProjectCode())
  const [name, setName] = React.useState(existing?.name ?? "")
  const [nameAr, setNameAr] = React.useState(existing?.nameAr ?? "")
  const [ownerId, setOwnerId] = React.useState(existing?.ownerId ?? "me")
  const [status, setStatus] = React.useState<ProjectStatus>(existing?.status ?? "active")
  const [startISO, setStartISO] = React.useState(existing?.startISO ?? "2026-09-08")
  const [dueISO, setDueISO] = React.useState(existing?.dueISO ?? "2026-12-31")
  const [description, setDescription] = React.useState(existing?.description ?? "")
  const [category, setCategory] = React.useState<CategoryId>(existing?.category ?? "operations")
  const [sprint, setSprint] = React.useState(existing?.sprint ?? CURRENT_SPRINT)
  const [priority, setPriority] = React.useState<TaskPriority>(existing?.priority ?? "medium")

  /** Where to go back to — the picker sends people here mid-task. */
  const from = params.get("from")
  const back = editing ? `/projects/${id}` : from === "task" ? "/tasks/new" : "/projects"

  const canSave = name.trim() !== "" && dueISO !== "" && startISO <= dueISO

  const owner = ownerId === "me"
    ? { ownerId: "me", owner: MANAGER.name, ownerAr: MANAGER.nameAr }
    : (() => {
        const m = team.find((x) => x.id === ownerId)!
        return { ownerId: m.id, owner: m.name, ownerAr: m.nameAr }
      })()

  const save = () => {
    if (!canSave) return
    const fields = {
      code,
      name: name.trim(),
      nameAr: nameAr.trim() || name.trim(),
      ...owner,
      status, category, sprint, priority,
      start: prettyDate(startISO), startISO,
      due: prettyDate(dueISO), dueISO,
      description: description.trim() || undefined,
      descriptionAr: description.trim() || undefined,
    }
    if (editing) { updateProject(existing.id, fields); navigate(`/projects/${existing.id}`) }
    else {
      const newId = newProjectId()
      addProject({ id: newId, createdISO: TASK_TODAY_ISO, ...fields })
      navigate(`/projects/${newId}`)
    }
  }

  const input = "h-10 w-full rounded-lg border border-input bg-background px-3 text-[13.5px] outline-none placeholder:text-muted-foreground focus:border-primary/60"
  const date = (value: string, set: (v: string) => void, label: string) => (
    <label className="relative flex h-9 w-full items-center rounded-lg bg-[var(--card-elevated)] ring-1 ring-inset ring-[var(--card-ring)] focus-within:ring-primary">
      <CalendarDays className="pointer-events-none absolute end-3 size-4 text-icon" />
      <input type="date" value={value} onChange={(e) => set(e.target.value)} aria-label={label}
        className="h-full w-full bg-transparent ps-3 pe-9 text-[12.5px] font-medium tabular-nums outline-none [&::-webkit-calendar-picker-indicator]:opacity-0" />
    </label>
  )

  return (
    <Page>
      <section className="highlight-card hl-green flex flex-col gap-8 rounded-2xl px-5 py-6 lg:ps-6 lg:pe-14">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button onClick={() => navigate(back)} className="inline-flex h-[34px] items-center gap-2 rounded-lg px-3.5 text-[13.5px] font-medium hover:bg-foreground/5">
            <ArrowLeft className={cn("size-[14px]", isAr && "rotate-180")} />
            {editing ? t("Back to the project", "العودة إلى المشروع") : t("Back to projects", "العودة إلى المشاريع")}
          </button>
          <div className="flex items-center gap-2">
            <Btn className="bg-secondary" onClick={() => navigate(back)}>{t("Cancel", "إلغاء")}</Btn>
            <Btn variant="primary" disabled={!canSave} onClick={save}>
              {editing ? t("Save changes", "حفظ التعديلات") : t("Create project", "إنشاء المشروع")}
            </Btn>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] font-medium leading-[38px]">{editing ? t("Edit project", "تعديل المشروع") : t("New project", "مشروع جديد")}</h1>
          <p className="text-[14px] text-muted-foreground">
            {t(`Reference ${code} is reserved for this project. Tasks are filed against it and keep its name.`,
               `الرقم المرجعي ${code} محجوز لهذا المشروع، وتُسجَّل المهام تحته.`)}
          </p>
        </div>
      </section>

      <div className="mt-10 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)]">
        <Panel>
          <CardHeader icon={FileText} title={t("Project", "المشروع")} />
          <div className="mt-[18px] flex flex-col gap-5">
            <div className="grid gap-4 sm:grid-cols-[8rem_minmax(0,1fr)]">
              <label><span className="mb-1.5 block text-[12px] text-muted-foreground">{t("Reference", "الرقم المرجعي")}</span>
                <input value={code} readOnly className={cn(input, "tabular-nums text-muted-foreground")} />
              </label>
              <label><span className="mb-1.5 block text-[12px] text-muted-foreground">{t("Project name", "اسم المشروع")}</span>
                <input value={name} onChange={(e) => setName(e.target.value)} className={input} placeholder={t("What is this project called?", "ما اسم هذا المشروع؟")} />
              </label>
            </div>
            <label><span className="mb-1.5 block text-[12px] text-muted-foreground">{t("Name in Arabic", "الاسم بالعربية")}</span>
              <input value={nameAr} onChange={(e) => setNameAr(e.target.value)} dir="rtl" className={input}
                placeholder={t("Optional — falls back to the English name", "اختياري — يُستخدم الاسم الإنجليزي إن تُرك فارغًا")} />
            </label>
            <label><span className="mb-1.5 block text-[12px] text-muted-foreground">{t("Description", "الوصف")}</span>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5}
                className="min-h-[135px] w-full rounded-lg border border-input bg-background p-4 text-[13.5px] leading-[20.25px] outline-none focus:border-primary/60"
                placeholder={t("What this project covers.", "ما الذي يغطيه هذا المشروع.")} />
            </label>
            <TextCounter text={description} isAr={isAr} />
          </div>
        </Panel>

        <Panel>
          <CardHeader icon={Info} title={t("Details", "التفاصيل")} />
          <div className="mt-[18px] overflow-hidden rounded-lg bg-background/60">
            <Field label={t("Owner", "المسؤول")}>
              <FilterSelect className="w-full" lead={<UserRoundCog className="size-4 shrink-0 text-icon" />} label={t("Owner:", "المسؤول:")}
                value={ownerId} onChange={setOwnerId}
                options={[{ value: "me", label: isAr ? ME.nameAr : ME.name, lead: <Initials text={ME.initials} /> },
                  ...team.map((m) => ({ value: m.id, label: isAr ? m.nameAr : m.name, lead: <Initials text={m.initials} /> }))]} />
            </Field>
            <Field label={t("Category", "الفئة")}>
              <FilterSelect className="w-full" lead={<span className="size-[7px] shrink-0 rounded-full bg-primary" />} label={t("Category", "الفئة")}
                value={category} onChange={(v) => setCategory(v as CategoryId)}
                options={CATEGORIES.map((c) => ({ value: c.id, label: isAr ? c.ar : c.en, lead: <span className={cn("size-2 rounded-full", c.dot)} /> }))} />
            </Field>
            <Field label={t("Sprint", "السبرنت")}>
              <FilterSelect className="w-full" lead={<RotateCcw className="size-[14px] shrink-0 text-icon" />} label={t("Sprint", "السبرنت")}
                value={sprint} onChange={setSprint} options={SPRINTS.map((s) => ({ value: s.id, label: isAr ? s.ar : s.en }))} />
            </Field>
            <Field label={t("Start date", "تاريخ البدء")}>{date(startISO, setStartISO, t("Start date", "تاريخ البدء"))}</Field>
            <Field label={t("Target completion", "الاستكمال المستهدف")}>{date(dueISO, setDueISO, t("Target completion", "الاستكمال المستهدف"))}</Field>
            {startISO > dueISO && (
              <p className="px-4 pb-3 text-[12px] text-error">{t("The target date is before the start date.", "تاريخ الاستكمال قبل تاريخ البدء.")}</p>
            )}
            <Field label={t("Priority", "الأولوية")}>
              <FilterSelect className="w-full" lead={<span className={cn("size-[7px] shrink-0 rounded-full", PRIORITY_META[priority].dot)} />} label={t("Priority", "الأولوية")}
                value={priority} onChange={(v) => setPriority(v as TaskPriority)}
                options={PRIORITIES.map((p) => ({ value: p, label: isAr ? PRIORITY_META[p].ar : PRIORITY_META[p].en }))} />
            </Field>
            <Field label={t("Status", "الحالة")}>
              <FilterSelect className="w-full" value={status} onChange={(v) => setStatus(v as ProjectStatus)}
                options={STATUSES.map((s) => ({ value: s, label: isAr ? STATUS_LABEL[s].ar : STATUS_LABEL[s].en }))} />
            </Field>
          </div>
        </Panel>
      </div>
    </Page>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-[54px] items-center justify-between gap-4 border-b border-input px-4 py-2.5 last:border-b-0">
      <span className="shrink-0 text-[12px] text-muted-foreground">{label}</span>
      <div className="w-full max-w-[265px]">{children}</div>
    </div>
  )
}
