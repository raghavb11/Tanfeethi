import * as React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { cn } from "@reach/shared-core"
import { ArrowLeft, CalendarDays, FileText, Info, RotateCcw, UserRoundCog } from "lucide-react"

import { Btn, CardHeader, FilterSelect, Initials, Page, Panel, StatusDot, TextCounter, useT } from "../components/ui"
import { ProjectPicker } from "../components/ProjectPicker"
import { MilestonePicker } from "../components/MilestonePicker"
import {
  CATEGORIES, type CategoryId, CURRENT_SPRINT, isStatus, PRIORITIES, PRIORITY_META, SPRINTS,
  STATUS_META, STATUS_ORDER, type TaskPriority, type TaskStatus,
} from "../data/meta"
import { addTask, ME, newTaskId, prettyDate, prettyDateAr, TASK_TODAY_ISO } from "../data/tasks"
import { MANAGER, team } from "../data/team"
import { getProjectById } from "../data/projects"
import { getMilestone } from "../data/milestones"

/** Create a task. A routed page (there is no create screen in the design), drawn
 *  in the detail screen's language: header card, description, details panel. */
export default function TaskEditorPage() {
  const { isAr, t } = useT()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const [title, setTitle] = React.useState("")
  const [titleAr, setTitleAr] = React.useState("")
  // a project is a master row, selected by id — never free text
  const [projectId, setProjectId] = React.useState(params.get("project") ?? "")
  const [milestoneId, setMilestoneId] = React.useState(params.get("milestone") ?? "")
  const [dueISO, setDueISO] = React.useState(TASK_TODAY_ISO)
  const [priority, setPriority] = React.useState<TaskPriority>("medium")
  const project = getProjectById(projectId)
  const [category, setCategory] = React.useState<CategoryId>(project?.category ?? "operations")
  const [sprint, setSprint] = React.useState(CURRENT_SPRINT)
  const fromManager = params.get("from") === "manager"
  const fromProject = params.get("from") === "project"
  const [assigneeId, setAssigneeId] = React.useState(params.get("assignee") ?? (fromManager ? team[0].id : "me"))
  const assignee = team.find((m) => m.id === assigneeId)
  const [status, setStatus] = React.useState<TaskStatus>(isStatus(params.get("status")) ? (params.get("status") as TaskStatus) : "open")
  const [description, setDescription] = React.useState("")

  // come back to whichever view the user opened this from
  const back = fromProject && projectId
    ? `/projects/${projectId}`
    : fromManager
      ? (assignee ? `/tasks?who=${assignee.id}` : "/tasks?who=team")
      : params.get("view") === "board" ? "/tasks" : "/tasks?view=list"

  // the editor stays mounted when a board column links back in, so follow the query string
  React.useEffect(() => {
    const st = params.get("status")
    if (isStatus(st)) setStatus(st)
    if (params.get("assignee")) setAssigneeId(params.get("assignee") as string)
    if (params.get("project")) setProjectId(params.get("project") as string)
    if (params.get("milestone")) setMilestoneId(params.get("milestone") as string)
  }, [params])

  // a milestone belongs to one project, so changing project clears it
  React.useEffect(() => {
    if (milestoneId && getMilestone(milestoneId)?.projectId !== projectId) setMilestoneId("")
    const p = getProjectById(projectId)
    if (p?.category) setCategory(p.category)
  }, [projectId])           // eslint-disable-line react-hooks/exhaustive-deps

  const canSave = title.trim() !== "" && dueISO !== ""

  const save = () => {
    if (!canSave) return
    addTask({
      id: newTaskId(),
      title: title.trim(),
      titleAr: titleAr.trim() || title.trim(),
      projectId: project?.id,
      milestoneId: project && milestoneId ? milestoneId : undefined,
      project: project ? project.name : "General",
      projectAr: project ? project.nameAr : "عام",
      due: prettyDate(dueISO), dueAr: prettyDateAr(dueISO), dueISO,
      priority, status, category, sprint, createdISO: TASK_TODAY_ISO,
      assigneeId: assignee?.id,
      assignee: assignee?.name, assigneeAr: assignee?.nameAr,
      assignedBy: assignee ? MANAGER.name : "Self",
      assignedByAr: assignee ? MANAGER.nameAr : "شخصي",
      description: description.trim() || undefined,
      descriptionAr: description.trim() || undefined,
    })
    navigate(back)
  }

  const input = "h-10 w-full rounded-lg border border-input bg-background px-3 text-[13.5px] outline-none placeholder:text-muted-foreground focus:border-primary/60"

  return (
    <Page>
      <section className="highlight-card hl-green flex flex-col gap-8 rounded-2xl px-5 py-6 lg:ps-6 lg:pe-14">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button onClick={() => navigate(back)} className="inline-flex h-[34px] items-center gap-2 rounded-lg px-3.5 text-[13.5px] font-medium hover:bg-foreground/5">
            <ArrowLeft className={cn("size-[14px]", isAr && "rotate-180")} />
            {fromProject ? t("Back to the project", "العودة إلى المشروع") : t("Back to tasks", "العودة إلى المهام")}
          </button>
          <div className="flex items-center gap-2">
            <Btn className="bg-secondary" onClick={() => navigate(back)}>{t("Cancel", "إلغاء")}</Btn>
            <Btn variant="primary" disabled={!canSave} onClick={save}>
              {assignee ? t("Assign task", "إسناد المهمة") : t("Create task", "إنشاء المهمة")}
            </Btn>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] font-medium leading-[38px]">{assignee ? t("Assign a task", "إسناد مهمة") : t("New task", "مهمة جديدة")}</h1>
          <p className="text-[14px] text-muted-foreground">
            {assignee
              ? t(`It will appear on ${assignee.name}'s board straight away.`, `ستظهر فورًا في لوحة ${assignee.nameAr}.`)
              : t("Only a title and a due date are required.", "العنوان وتاريخ الاستحقاق فقط مطلوبان.")}
          </p>
        </div>
      </section>

      <div className="mt-10 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)]">
        <Panel>
          <CardHeader icon={FileText} title={t("Task", "المهمة")} />
          <div className="mt-[18px] flex flex-col gap-5">
            <label><span className="mb-1.5 block text-[12px] text-muted-foreground">{t("Title", "العنوان")}</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={input} placeholder={t("What needs to be done?", "ما الذي يجب إنجازه؟")} />
            </label>
            <label><span className="mb-1.5 block text-[12px] text-muted-foreground">{t("Title in Arabic", "العنوان بالعربية")}</span>
              <input value={titleAr} onChange={(e) => setTitleAr(e.target.value)} dir="rtl" className={input}
                placeholder={t("Optional — falls back to the English title", "اختياري — يُستخدم العنوان الإنجليزي إن تُرك فارغًا")} />
            </label>
            <label><span className="mb-1.5 block text-[12px] text-muted-foreground">{t("Description", "الوصف")}</span>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5}
                className="min-h-[135px] w-full rounded-lg border border-input bg-background p-4 text-[13.5px] leading-[20.25px] outline-none focus:border-primary/60"
                placeholder={t("Any detail worth keeping with the task.", "أي تفاصيل تستحق الحفظ مع المهمة.")} />
            </label>
            <TextCounter text={description} isAr={isAr} />
          </div>
        </Panel>

        <Panel>
          <CardHeader icon={Info} title={t("Details", "التفاصيل")} />
          <div className="mt-[18px] overflow-hidden rounded-lg bg-background/60">
            <Field label={t("Assignee", "المسؤول")}>
              <FilterSelect className="w-full" lead={<UserRoundCog className="size-4 shrink-0 text-icon" />} label={t("Assign:", "إسناد:")}
                value={assigneeId} onChange={setAssigneeId}
                options={[{ value: "me", label: isAr ? ME.nameAr : ME.name, lead: <Initials text={ME.initials} /> },
                  ...team.map((m) => ({ value: m.id, label: isAr ? m.nameAr : m.name, lead: <Initials text={m.initials} /> }))]} />
            </Field>
            <Field label={t("Project", "المشروع")}>
              <ProjectPicker value={projectId} onChange={setProjectId} isAr={isAr} t={t} onCreate={() => navigate("/projects/new?from=task")} />
            </Field>
            <Field label={t("Milestone", "المعلم")}>
              <MilestonePicker projectId={projectId} value={milestoneId} onChange={setMilestoneId} isAr={isAr} t={t}
                onCreate={projectId ? () => navigate(`/projects/${projectId}/milestones/new`) : undefined} />
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
            <Field label={t("Due date", "تاريخ الاستحقاق")}>
              <label className="relative flex h-9 w-full items-center rounded-lg bg-[var(--card-elevated)] ring-1 ring-inset ring-[var(--card-ring)] focus-within:ring-primary">
                <CalendarDays className="pointer-events-none absolute end-3 size-4 text-icon" />
                <input type="date" value={dueISO} onChange={(e) => setDueISO(e.target.value)} aria-label={t("Due date", "تاريخ الاستحقاق")}
                  className="h-full w-full bg-transparent ps-3 pe-9 text-[12.5px] font-medium tabular-nums outline-none [&::-webkit-calendar-picker-indicator]:opacity-0" />
              </label>
            </Field>
            <Field label={t("Priority", "الأولوية")}>
              <FilterSelect className="w-full" lead={<span className={cn("size-[7px] shrink-0 rounded-full", PRIORITY_META[priority].dot)} />} label={t("Priority", "الأولوية")}
                value={priority} onChange={(v) => setPriority(v as TaskPriority)}
                options={PRIORITIES.map((p) => ({ value: p, label: isAr ? PRIORITY_META[p].ar : PRIORITY_META[p].en, lead: <span className={cn("size-2 rounded-full", PRIORITY_META[p].dot)} /> }))} />
            </Field>
            <Field label={t("Status", "الحالة")}>
              <FilterSelect className="w-full" lead={<StatusDot status={status} />} value={status} onChange={(v) => setStatus(v as TaskStatus)}
                options={STATUS_ORDER.map((s) => ({ value: s, label: isAr ? STATUS_META[s].ar : STATUS_META[s].en, lead: <StatusDot status={s} /> }))} />
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
