import * as React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { cn } from "@reach/shared-core"
import { usePageTitle } from "@reach/shell-context"
import {
  ArrowLeft, CalendarClock, CalendarDays, Check, ChevronLeft, ChevronRight, ClipboardList,
  FileText, Info, ListChecks, MessagesSquare, NotebookPen, Pencil, Plus, RotateCcw,
  Sparkles, Trash2, UserRoundCog,
} from "lucide-react"

import {
  Btn, CardHeader, CategoryChip, ConfirmDialog, Donut, Empty, FilterSelect, Initials, Legend,
  Page, Panel, StatusDot, TextCounter, useT, type TFn,
} from "./ui"
import {
  CATEGORIES, categoryById, CURRENT_SPRINT, PRIORITIES, PRIORITY_META, SPRINTS, sprintById,
  STATUS_META, STATUS_ORDER, type CategoryId, type TaskPriority, type TaskStatus,
} from "../data/meta"
import {
  addAiEvent, addTask, addTaskComment, ME, newTaskId, prettyDate, prettyDateAr, relativeDue,
  removeTask, shortDate, TASK_TODAY_ISO, type Task, type TaskEvent, toggleComplete, unlinkProject,
  updateTask, useTaskEvents, useTasks,
} from "../data/tasks"
import {
  removeProject, STATUS_LABEL, type Project, type ProjectStatus, updateProject, useProjects,
} from "../data/projects"
import { memberById, team } from "../data/team"
import { dismissSuggestion, useSuggestions } from "../data/suggestions"
import { MilestonePicker } from "./MilestonePicker"
import { HealthPill } from "./HealthPill"
import { getMilestone, HEALTH, milestoneHealth, milestonesFor, useMilestones } from "../data/milestones"

/** The editable fields both a task and a project carry on this screen. */
type Fields = {
  category?: CategoryId
  sprint?: string
  ownerId: string          // "me" or a report's id
  dueISO: string
  priority: TaskPriority
  description: string
  // project-only extras kept from the earlier project editor
  startISO?: string
  projectStatus?: ProjectStatus
}

const ownerName = (id: string, isAr: boolean) => {
  if (id === "me") return isAr ? ME.nameAr : ME.name
  const m = memberById(id)
  return m ? (isAr ? m.nameAr : m.name) : ""
}
const ownerInitials = (id: string) => (id === "me" ? ME.initials : memberById(id)?.initials ?? "")
const firstName = (s: string) => s.split(" ")[0]

/** Task and project detail — Figma 3580:8261 / 8521 (view), 3580:8667 / 8965
 *  (edit, inline on the same page), 3580:9156 / 9423 (release note edited inline). */
export function WorkItemDetail({ kind, id }: { kind: "task" | "project"; id: string }) {
  const { isAr, t } = useT()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const allTasks = useTasks()
  const projects = useProjects()
  useMilestones()

  const task = kind === "task" ? allTasks.find((x) => x.id === id) : undefined
  const project = kind === "project" ? projects.find((p) => p.id === id) : undefined
  const exists = kind === "task" ? !!task : !!project

  // opened from the team board: the manager is working on someone else's task
  const asManager = params.get("from") === "manager"
  const backHref = kind === "project" ? "/projects" : asManager ? "/tasks?who=team" : "/tasks"
  const backLabel = kind === "project" ? t("Back to projects", "العودة إلى المشاريع") : t("Back to tasks", "العودة إلى المهام")

  // full edit mode lives on this page, as drawn; ?edit=1 deep-links straight in
  const editing = params.get("edit") === "1"
  const setEditing = (on: boolean) => {
    const next = new URLSearchParams(params)
    if (on) next.set("edit", "1"); else next.delete("edit")
    setParams(next, { replace: true })
  }

  const fields: Fields | undefined = task
    ? { category: task.category, sprint: task.sprint, ownerId: task.assigneeId ?? "me", dueISO: task.dueISO,
        priority: task.priority, description: (isAr ? task.descriptionAr : task.description) ?? "" }
    : project
      ? { category: project.category, sprint: project.sprint, ownerId: project.ownerId, dueISO: project.dueISO,
          priority: project.priority ?? "medium", description: (isAr ? project.descriptionAr : project.description) ?? "",
          startISO: project.startISO, projectStatus: project.status }
      : undefined

  const [draft, setDraft] = React.useState<Fields | undefined>(fields)
  React.useEffect(() => { if (editing) setDraft(fields) }, [editing, id])  // eslint-disable-line react-hooks/exhaustive-deps

  const [confirmDelete, setConfirmDelete] = React.useState(false)

  if (!exists || !fields) {
    return (
      <Page>
        <Empty
          icon={ClipboardList}
          text={kind === "task" ? t("That task no longer exists.", "لم تعد هذه المهمة موجودة.") : t("That project no longer exists.", "لم يعد هذا المشروع موجودًا.")}
          action={<Btn onClick={() => navigate(backHref)}>{backLabel}</Btn>}
        />
      </Page>
    )
  }

  // ── writes ────────────────────────────────────────────────────────────
  const assign = (ownerId: string) => {
    if (task) {
      const m = memberById(ownerId)
      updateTask(task.id, m
        ? { assigneeId: m.id, assignee: m.name, assigneeAr: m.nameAr, assignedBy: ME.name, assignedByAr: ME.nameAr }
        : { assigneeId: undefined, assignee: undefined, assigneeAr: undefined })
    } else if (project) {
      updateProject(project.id, { ownerId, owner: ownerName(ownerId, false), ownerAr: ownerName(ownerId, true) })
    }
  }

  const save = () => {
    if (!draft) return
    if (draft.ownerId !== fields.ownerId) assign(draft.ownerId)
    const descKey = isAr ? "descriptionAr" : "description"
    if (task) {
      updateTask(task.id, {
        category: draft.category, sprint: draft.sprint, dueISO: draft.dueISO, priority: draft.priority,
        [descKey]: draft.description.trim() || undefined,
      })
    } else if (project) {
      updateProject(project.id, {
        category: draft.category, sprint: draft.sprint, priority: draft.priority,
        dueISO: draft.dueISO, due: prettyDate(draft.dueISO),
        startISO: draft.startISO, start: draft.startISO ? prettyDate(draft.startISO) : project.start,
        status: draft.projectStatus ?? project.status,
        [descKey]: draft.description.trim() || undefined,
      })
    }
    setEditing(false)
  }

  const remove = () => {
    if (task) { removeTask(task.id); navigate(backHref) }
    if (project) { unlinkProject(project.id); removeProject(project.id); navigate("/projects") }
  }

  // ── pager: "Task 7 of 13" over this sprint's board, "Project 7 of 13" over the master ──
  const order = (x: Task) => STATUS_ORDER.indexOf(x.status)
  const siblings = kind === "task"
    ? (() => {
        const sprintSet = allTasks.filter((x) => x.sprint === (task?.sprint ?? CURRENT_SPRINT))
        const list = sprintSet.some((x) => x.id === id) ? sprintSet : allTasks
        return [...list].sort((a, b) => order(a) - order(b) || a.dueISO.localeCompare(b.dueISO)).map((x) => x.id)
      })()
    : projects.map((p) => p.id)
  const pos = siblings.indexOf(id)
  const go = (delta: number) => {
    const next = siblings[(pos + delta + siblings.length) % siblings.length]
    navigate(kind === "task" ? `/tasks/${next}${asManager ? "?from=manager" : ""}` : `/projects/${next}`)
  }

  const title = task ? (isAr ? task.titleAr : task.title) : project ? (isAr ? project.nameAr : project.name) : ""
  // Figma top bar: "مهمة: <title>" / "المشروع: <name>".
  usePageTitle(
    task ? `Task: ${task.title}` : project ? `Project: ${project.name}` : undefined,
    task ? `مهمة: ${task.titleAr}` : project ? `المشروع: ${project.nameAr}` : undefined,
  )
  const projectTasks = project ? allTasks.filter((x) => x.projectId === project.id) : []
  const statusCount = (s: TaskStatus) => projectTasks.filter((x) => x.status === s).length

  const ownerOptions = [
    { value: "me", label: isAr ? ME.nameAr : ME.name, lead: <Initials text={ME.initials} /> },
    ...team.map((m) => ({ value: m.id, label: isAr ? m.nameAr : m.name, lead: <Initials text={m.initials} /> })),
  ]

  return (
    <Page>
      {/* ── header card ──────────────────────────────────────────────── */}
      <section className="highlight-card hl-green flex flex-col gap-8 rounded-2xl px-5 py-6 lg:ps-6 lg:pe-14">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button onClick={() => navigate(backHref)}
            className="inline-flex h-[34px] items-center gap-2 rounded-lg px-3.5 text-[13.5px] font-medium transition-colors hover:bg-foreground/5">
            <ArrowLeft className={cn("size-[14px]", isAr && "rotate-180")} />{backLabel}
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {!editing ? (
              <>
                <FilterSelect
                  className="w-[225px]" ariaLabel={t("Reassign", "إعادة إسناد")}
                  lead={<UserRoundCog className="size-4 shrink-0 text-icon" />}
                  label={t("Reassign", "إعادة إسناد")}
                  value={fields.ownerId} options={ownerOptions} onChange={assign}
                  menuClassName="w-64" hideValue triggerClassName="h-[34px] bg-foreground/[0.08]"
                />
                {task && (
                  <FilterSelect
                    className="w-[225px]" ariaLabel={t("Status", "الحالة")}
                    lead={<StatusDot status={task.status} />}
                    value={task.status}
                    onChange={(v) => updateTask(task.id, { status: v as TaskStatus })}
                    options={STATUS_ORDER.map((s) => ({ value: s, label: isAr ? STATUS_META[s].ar : STATUS_META[s].en, lead: <StatusDot status={s} /> }))}
                    triggerClassName="h-[34px] bg-foreground/[0.08]"
                  />
                )}
                <Btn className="rounded-[8px] bg-foreground/[0.08] px-3 font-normal" onClick={() => setEditing(true)}><Pencil className="size-[14px]" /><span>{t("Edit", "تعديل")}</span></Btn>
                <Btn variant="danger" className="rounded-[8px] bg-foreground/[0.08] font-normal" onClick={() => setConfirmDelete(true)}><Trash2 className="size-4" /><span>{t("Delete", "حذف")}</span></Btn>
              </>
            ) : (
              <>
                <Btn variant="outline" className="bg-secondary" onClick={() => setEditing(false)}>{t("Cancel", "إلغاء")}</Btn>
                <Btn variant="primary" onClick={save}>{t("Save changes", "حفظ التعديلات")}</Btn>
              </>
            )}
            {siblings.length > 1 && pos >= 0 && (
              <div className="ms-1 flex items-center gap-2 border-s border-input ps-3">
                <span className="text-[13px] tabular-nums text-muted-foreground">
                  {kind === "task" ? t(`Task ${pos + 1} of ${siblings.length}`, `المهمة ${pos + 1} من ${siblings.length}`)
                    : t(`Project ${pos + 1} of ${siblings.length}`, `المشروع ${pos + 1} من ${siblings.length}`)}
                </span>
                <button onClick={() => go(-1)} aria-label={t("Previous", "السابق")}
                  className="inline-flex size-[34px] items-center justify-center rounded-[8px] bg-foreground/[0.06] ring-1 ring-inset ring-[var(--card-ring)] hover:bg-foreground/10">
                  <ChevronLeft className={cn("size-4", isAr && "rotate-180")} />
                </button>
                <button onClick={() => go(1)} aria-label={t("Next", "التالي")}
                  className="inline-flex size-[34px] items-center justify-center rounded-[8px] bg-foreground/[0.06] ring-1 ring-inset ring-[var(--card-ring)] hover:bg-foreground/10">
                  <ChevronRight className={cn("size-4", isAr && "rotate-180")} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 flex-col gap-3">
            <h1 className={cn("text-[27px] font-normal leading-[38px] tracking-[-0.27px]", task?.status === "completed" && "text-muted-foreground line-through")}>{title}</h1>
            <div className="flex flex-wrap items-center gap-2.5 text-[14px]">
              {task && <><CategoryChip id={task.category} isAr={isAr} className="h-[30px] px-2.5 text-[13px]" /><span className="text-muted-foreground">·</span></>}
              <Initials text={ownerInitials(fields.ownerId)} className="size-6 text-[9px]" />
              <span className="text-muted-foreground">{ownerName(fields.ownerId, isAr)}</span>
            </div>
          </div>
          {project && (
            <div className="flex items-center gap-10 self-center lg:self-auto">
              <Legend rows={STATUS_ORDER.map((s) => ({ label: s === "open" ? t("Pending", "قيد الانتظار") : isAr ? STATUS_META[s].ar : STATUS_META[s].en, value: statusCount(s), dot: STATUS_META[s].dot }))} />
              <Donut total={projectTasks.length} label={t("Tasks", "مهام")}
                slices={STATUS_ORDER.map((s) => ({ value: statusCount(s), color: s === "completed" ? "color-mix(in oklab, var(--success) 70%, var(--background))" : STATUS_META[s].color }))} />
            </div>
          )}
        </div>
      </section>

      {/* ── body: main column + side column (729 / 480, gap 20) ─────────── */}
      <div className="mt-10 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)]">
        <div className="flex min-w-0 flex-col gap-6">
          {/* description */}
          <Panel>
            <CardHeader icon={FileText} title={t("Description", "الوصف")}
              actions={editing ? <span className="text-[12px] text-warning">{t("Unsaved changes", "تغييرات غير محفوظة")}</span> : undefined} />
            <div className="mt-[18px]">
              {editing && draft ? (
                <div className="flex flex-col gap-4">
                  <textarea
                    value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                    rows={5} aria-label={t("Description", "الوصف")}
                    className="min-h-[135px] w-full resize-none rounded-[8px] border border-primary/70 bg-background p-4 text-[13.5px] leading-[20.25px] outline-none"
                  />
                  <TextCounter text={draft.description} isAr={isAr} />
                </div>
              ) : (
                <p className="text-[13.5px] leading-[20.25px] text-foreground">
                  {fields.description || <span className="text-muted-foreground">{t("No description yet.", "لا يوجد وصف بعد.")}</span>}
                </p>
              )}
            </div>
          </Panel>

          {/* release note — edited inline in either mode */}
          <ReleaseNote
            key={id}
            value={(task ? task.releaseNote : project?.releaseNote) ?? ""}
            onSave={(v) => task ? updateTask(task.id, { releaseNote: v }) : project && updateProject(project.id, { releaseNote: v })}
            isAr={isAr} t={t}
          />

          {project && <SubTasks project={project} tasks={projectTasks} isAr={isAr} t={t} />}
          <Activity subjectId={id} isAr={isAr} t={t} asManager={asManager} task={task} />

          {/* kept from the earlier project page; below the drawn cards */}
          {project && <Milestones project={project} tasks={allTasks} isAr={isAr} t={t} />}
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          {project && <Suggestions project={project} isAr={isAr} t={t} />}

          <Panel>
            <CardHeader icon={Info} title={t("Details", "التفاصيل")} />
            <dl className="mt-[18px] overflow-hidden rounded-lg bg-background/60">
              <Row label={t("Category", "الفئة")} edit={editing}
                view={(() => { const c = categoryById(fields.category); return c ? (isAr ? c.ar : c.en) : "—" })()}
                control={draft && (
                  <FilterSelect className="w-full max-w-[265px]" lead={<span className="size-[7px] shrink-0 rounded-full bg-primary" />}
                    label={t("Category", "الفئة")} value={draft.category ?? ""}
                    onChange={(v) => setDraft({ ...draft, category: v as CategoryId })}
                    options={CATEGORIES.map((c) => ({ value: c.id, label: isAr ? c.ar : c.en, lead: <span className={cn("size-2 rounded-full", c.dot)} /> }))} />
                )} />
              <Row label={t("Sprint", "السبرنت")} edit={editing}
                view={(() => { const s = sprintById(fields.sprint); return s ? (isAr ? s.ar : s.en) : "—" })()}
                control={draft && (
                  <FilterSelect className="w-full max-w-[265px]" lead={<RotateCcw className="size-[14px] shrink-0 text-icon" />}
                    label={t("Sprint", "السبرنت")} value={draft.sprint ?? ""}
                    onChange={(v) => setDraft({ ...draft, sprint: v })}
                    options={SPRINTS.map((s) => ({ value: s.id, label: isAr ? s.ar : s.en }))} />
                )} />
              <Row label={t("Assignee", "المسؤول")} edit={editing}
                view={firstName(ownerName(fields.ownerId, isAr))}
                control={draft && (
                  <FilterSelect className="w-full max-w-[265px]" lead={<UserRoundCog className="size-4 shrink-0 text-icon" />}
                    label={t("Reassign:", "إعادة إسناد:")} value={draft.ownerId}
                    onChange={(v) => setDraft({ ...draft, ownerId: v })} options={ownerOptions} />
                )} />
              <Row label={t("Due date", "تاريخ الاستحقاق")} edit={editing}
                view={<span className={cn(task && task.status !== "completed" && task.dueISO < TASK_TODAY_ISO && "text-error")}>{shortDate(fields.dueISO, isAr)}</span>}
                control={draft && <DateField value={draft.dueISO} onChange={(v) => setDraft({ ...draft, dueISO: v })} label={t("Date", "تاريخ")} />} />
              {project && (
                <Row label={t("Start date", "تاريخ البدء")} edit={editing}
                  view={shortDate(project.startISO, isAr)}
                  control={draft && <DateField value={draft.startISO ?? ""} onChange={(v) => setDraft({ ...draft, startISO: v })} label={t("Date", "تاريخ")} />} />
              )}
              <Row label={t("Created", "تاريخ الإنشاء")} edit={false}
                view={shortDate((task ? task.createdISO : project?.createdISO) ?? "", isAr) || "—"} />
              <Row label={t("Priority", "الأولوية")} edit={editing}
                view={isAr ? PRIORITY_META[fields.priority].ar : PRIORITY_META[fields.priority].en}
                control={draft && (
                  <FilterSelect className="w-full max-w-[265px]" lead={<span className={cn("size-[7px] shrink-0 rounded-full", PRIORITY_META[draft.priority].dot)} />}
                    label={t("Priority", "الأولوية")} value={draft.priority}
                    onChange={(v) => setDraft({ ...draft, priority: v as TaskPriority })}
                    options={PRIORITIES.map((p) => ({ value: p, label: isAr ? PRIORITY_META[p].ar : PRIORITY_META[p].en, lead: <span className={cn("size-2 rounded-full", PRIORITY_META[p].dot)} /> }))} />
                )} />
              {project && (
                <Row label={t("Project status", "حالة المشروع")} edit={editing}
                  view={<span className={cn("rounded-full px-2 py-0.5 text-[11.5px]", STATUS_LABEL[project.status].chip)}>{isAr ? STATUS_LABEL[project.status].ar : STATUS_LABEL[project.status].en}</span>}
                  control={draft && (
                    <FilterSelect className="w-full max-w-[265px]" value={draft.projectStatus ?? project.status}
                      onChange={(v) => setDraft({ ...draft, projectStatus: v as ProjectStatus })}
                      options={(Object.keys(STATUS_LABEL) as ProjectStatus[]).map((s) => ({ value: s, label: isAr ? STATUS_LABEL[s].ar : STATUS_LABEL[s].en }))} />
                  )} />
              )}
              {project && <Row label={t("Reference", "الرقم المرجعي")} edit={false} view={<span className="tabular-nums">{project.code}</span>} />}
              {task && (
                <Row label={t("Project", "المشروع")} edit={false}
                  view={task.projectId
                    ? <button onClick={() => navigate(`/projects/${task.projectId}`)} className="text-start hover:text-primary hover:underline">{isAr ? task.projectAr : task.project}</button>
                    : (isAr ? task.projectAr : task.project)} />
              )}
              {task && task.projectId && (
                <Row label={t("Milestone", "المعلم")} edit={false}
                  view={
                    <span className="flex w-full max-w-[265px] flex-col items-end gap-1.5">
                      <MilestonePicker projectId={task.projectId} value={task.milestoneId ?? ""} isAr={isAr} t={t}
                        onChange={(mid) => updateTask(task.id, { milestoneId: mid || undefined })} />
                      {(() => { const m = getMilestone(task.milestoneId); return m ? <HealthPill health={milestoneHealth(m, allTasks).health} isAr={isAr} size="sm" /> : null })()}
                    </span>
                  } />
              )}
              {task && <Row label={t("Assigned by", "أُسندت من")} edit={false} view={isAr ? task.assignedByAr : task.assignedBy} />}
            </dl>
            {task && !editing && (
              <button
                onClick={() => toggleComplete(task.id)}
                className={cn("mt-4 inline-flex h-[34px] w-full items-center justify-center gap-2 rounded-lg text-[13.5px] font-medium",
                  task.status === "completed" ? "border border-input hover:bg-foreground/5" : "btn-primary-grad")}
              >
                {task.status === "completed" ? <><RotateCcw className="size-4" />{t("Reopen task", "إعادة فتح المهمة")}</> : <><Check className="size-4" />{t("Mark complete", "وضع علامة مكتمل")}</>}
              </button>
            )}
          </Panel>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={kind === "task" ? t("Delete this task?", "حذف هذه المهمة؟") : t("Delete this project?", "حذف هذا المشروع؟")}
        body={kind === "task"
          ? t("The task and its activity will be removed. This cannot be undone.", "ستُحذف المهمة وسجل نشاطها. لا يمكن التراجع عن ذلك.")
          : t("Its tasks stay, no longer linked to a project. This cannot be undone.", "تبقى مهامه دون ربطها بمشروع. لا يمكن التراجع عن ذلك.")}
        confirm={t("Delete", "حذف")} cancel={t("Cancel", "إلغاء")}
        onConfirm={() => { setConfirmDelete(false); remove() }}
        onCancel={() => setConfirmDelete(false)}
      />
    </Page>
  )
}

/** One key/value line of the Details card; becomes a control in edit mode. */
function Row({ label, view, control, edit }: { label: string; view: React.ReactNode; control?: React.ReactNode; edit: boolean }) {
  return (
    <div className="flex min-h-[54px] items-center justify-between gap-4 border-b border-input px-4 py-2.5 last:border-b-0">
      <dt className="shrink-0 text-[12px] text-muted-foreground">{label}</dt>
      <dd className="flex min-w-0 flex-1 justify-end text-end text-[14px] text-foreground">{edit && control ? control : view}</dd>
    </div>
  )
}

function DateField({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <label className="relative flex h-9 w-full max-w-[265px] items-center rounded-lg bg-[var(--card-elevated)] ring-1 ring-inset ring-[var(--card-ring)] focus-within:ring-primary">
      <CalendarDays className="pointer-events-none absolute end-3 size-4 text-icon" />
      <input
        type="date" value={value} onChange={(e) => e.target.value && onChange(e.target.value)} aria-label={label}
        className="h-full w-full rounded-lg bg-transparent ps-3 pe-9 text-[12.5px] font-medium tabular-nums outline-none [&::-webkit-calendar-picker-indicator]:opacity-0"
      />
    </label>
  )
}

/** "ملاحظة النشر" — always editable; Save / Cancel appear once it differs. */
const NOTE_DRAFT = {
  en: "Version 2.4 deployed to production. Verification: run quality checks on April data. Rollback plan: restore version 2.3",
  ar: "تم نشر الإصدار 2.4 على بيئة الإنتاج. التحقق: تشغيل فحوصات الجودة على بيانات أبريل. خطة التراجع: استعادة الإصدار 2.3",
}

function ReleaseNote({ value, onSave, isAr, t }: { value: string; onSave: (v: string) => void; isAr: boolean; t: TFn }) {
  // ?note=draft opens the note mid-edit with a sample draft (Figma 3580:9156 / 9423)
  const [params] = useSearchParams()
  const seeded = params.get("note") === "draft" ? (isAr ? NOTE_DRAFT.ar : NOTE_DRAFT.en) : value
  const [text, setText] = React.useState(seeded)
  React.useEffect(() => setText(seeded), [seeded])
  const dirty = text !== value
  return (
    <Panel>
      <CardHeader icon={NotebookPen} title={t("Release note", "ملاحظة النشر")}
        actions={dirty ? <span className="text-[12px] text-warning">{t("Unsaved changes", "تغييرات غير محفوظة")}</span> : undefined} />
      <div className="mt-[18px] flex flex-col gap-4">
        <textarea
          value={text} onChange={(e) => setText(e.target.value)} rows={5}
          aria-label={t("Release note", "ملاحظة النشر")}
          placeholder={t("Write release notes: what changed, verification steps and rollback plan…", "اكتب ملاحظات النشر: ما الذي تغيّر، خطوات التحقق، وخطة التراجع…")}
          className={cn("min-h-[135px] w-full resize-none rounded-[8px] border bg-background p-4 text-[13.5px] leading-[20.25px] outline-none placeholder:text-muted-foreground",
            dirty ? "border-primary/70" : "border-input focus:border-primary/60")}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TextCounter text={text} isAr={isAr} />
          {dirty && (
            <div className="flex items-center gap-2">
              <Btn onClick={() => setText(value)}>{t("Cancel", "إلغاء")}</Btn>
              <Btn variant="primary" onClick={() => onSave(text.trim())}>{t("Save changes", "حفظ التعديلات")}</Btn>
            </div>
          )}
        </div>
      </div>
    </Panel>
  )
}

/** "المهام الفرعية" — the project's tasks with a tick box and a due label. */
function SubTasks({ project, tasks, isAr, t }: { project: Project; tasks: Task[]; isAr: boolean; t: TFn }) {
  const navigate = useNavigate()
  const rows = [...tasks].sort((a, b) => (a.status === "completed" ? 1 : 0) - (b.status === "completed" ? 1 : 0) || a.dueISO.localeCompare(b.dueISO))
  return (
    <Panel>
      <CardHeader icon={ListChecks} title={t("Subtasks", "المهام الفرعية")}
        actions={
          <button onClick={() => navigate(`/tasks/new?project=${project.id}&from=project`)}
            className="btn-primary-grad inline-flex h-7 items-center gap-1.5 rounded-lg px-3 text-[12.5px] font-medium">
            <Plus className="size-3.5" />{t("New task", "مهمة جديدة")}
          </button>
        } />
      {/* six rows show, as drawn; longer lists scroll inside the card */}
      <ul className="mt-[18px] max-h-[300px] overflow-y-auto [scrollbar-width:thin]">
        {rows.map((x) => {
          const done = x.status === "completed"
          const due = relativeDue(x.dueISO, isAr)
          return (
            <li key={x.id} className="flex min-h-[50px] items-center gap-3 border-b border-input py-2 last:border-b-0">
              <button onClick={() => toggleComplete(x.id)} aria-pressed={done}
                aria-label={done ? t("Reopen", "إعادة فتح") : t("Mark complete", "وضع علامة مكتمل")}
                className={cn("inline-flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors",
                  done ? "border-success bg-success text-background" : "border-foreground/70 hover:border-primary")}>
                {done && <Check className="size-3" strokeWidth={3} />}
              </button>
              <button onClick={() => navigate(`/tasks/${x.id}`)}
                className={cn("min-w-0 flex-1 truncate text-start text-[14px] hover:text-primary", done && "text-muted-foreground line-through")}>
                {isAr ? x.titleAr : x.title}
              </button>
              <span className={cn("shrink-0 text-[12.5px] font-medium",
                done ? "text-muted-foreground" : due.tone === "error" ? "text-error" : due.tone === "warning" ? "text-warning" : "text-muted-foreground")}>
                {done ? t("Done", "منجزة") : due.text}
              </span>
            </li>
          )
        })}
      </ul>
      {rows.length === 0 && <Empty icon={ListChecks} text={t("No tasks under this project yet.", "لا توجد مهام تحت هذا المشروع بعد.")} />}
    </Panel>
  )
}

/** Milestones — kept from the earlier project page, restyled as a card here. */
function Milestones({ project, tasks, isAr, t }: { project: Project; tasks: Task[]; isAr: boolean; t: TFn }) {
  const navigate = useNavigate()
  const ms = milestonesFor(project.id)
  const at = (iso: string) => new Date(`${iso}T00:00:00`).getTime()
  const startIso = [project.startISO, ...ms.map((m) => m.startISO)].sort()[0]
  const endIso = [project.dueISO, ...ms.map((m) => m.dueISO)].sort().slice(-1)[0]
  const span = Math.max(1, at(endIso) - at(startIso))
  const pos = (iso: string) => ((at(iso) - at(startIso)) / span) * 100
  return (
    <Panel>
      <CardHeader icon={CalendarClock} title={t("Milestones", "المعالم")}
        actions={<Btn className="h-7 px-3 text-[12.5px]" onClick={() => navigate(`/projects/${project.id}/milestones/new`)}><Plus className="size-3.5" />{t("Milestone", "معلم")}</Btn>} />
      <div className="mt-[18px] flex flex-col">
        {ms.map((m) => {
          const h = milestoneHealth(m, tasks)
          return (
            <div key={m.id} className="flex flex-col gap-2 border-b border-input py-3 last:border-b-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] tabular-nums text-muted-foreground">{m.code}</span>
                <span className="min-w-0 flex-1 truncate text-[14px] font-medium">{isAr ? m.nameAr : m.name}</span>
                <HealthPill health={h.health} isAr={isAr} overridden={h.overridden} size="sm" />
                <button onClick={() => navigate(`/projects/${project.id}/milestones/${m.id}/edit`)} aria-label={t("Edit milestone", "تعديل المعلم")}
                  className="inline-flex size-7 items-center justify-center rounded-md text-icon hover:bg-foreground/5 hover:text-foreground">
                  <Pencil className="size-3.5" />
                </button>
                <button onClick={() => navigate(`/tasks/new?project=${project.id}&milestone=${m.id}&from=project`)} aria-label={t("Add a task to this milestone", "إضافة مهمة إلى هذا المعلم")}
                  className="inline-flex size-7 items-center justify-center rounded-md text-icon hover:bg-foreground/5 hover:text-foreground">
                  <Plus className="size-3.5" />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-muted-foreground">
                <span>{shortDate(m.startISO, isAr)} — {shortDate(m.dueISO, isAr)}</span>
                <span>{t(`${h.done} of ${h.total} tasks done`, `${h.done} من ${h.total} مهمة منجزة`)}</span>
                {h.overdue > 0 && <span className="font-semibold text-error">{t(`${h.overdue} overdue`, `${h.overdue} متأخرة`)}</span>}
              </div>
              {h.reason && <p className="text-[12px] text-foreground/80">{isAr ? h.reasonAr : h.reason}</p>}
              {/* where it sits in the project's span, and how far through it is */}
              <div className="relative h-1.5 rounded-full bg-secondary" title={`${prettyDate(m.startISO)} – ${prettyDate(m.dueISO)}`}>
                <div className={cn("absolute inset-y-0 rounded-full opacity-35", HEALTH[h.health].bar)}
                  style={{ insetInlineStart: `${pos(m.startISO)}%`, width: `${Math.max(2, pos(m.dueISO) - pos(m.startISO))}%` }} />
                <div className={cn("absolute inset-y-0 rounded-full", HEALTH[h.health].bar)}
                  style={{ insetInlineStart: `${pos(m.startISO)}%`, width: `${Math.max(1, (pos(m.dueISO) - pos(m.startISO)) * h.pct / 100)}%` }} />
              </div>
            </div>
          )
        })}
      </div>
      {ms.length === 0 && (
        <Empty icon={CalendarClock} text={t("Break the project into milestones to track it red, amber or green.", "قسّم المشروع إلى معالم لمتابعة حالته.")} />
      )}
    </Panel>
  )
}

/** "اقتراح المساعد" — add a suggestion as a sub-task, or turn it down. */
function Suggestions({ project, isAr, t }: { project: Project; isAr: boolean; t: TFn }) {
  const list = useSuggestions(project.id)
  const accept = (sid: string, text: string, textAr: string) => {
    addTask({
      id: newTaskId(), title: text, titleAr: textAr, projectId: project.id, project: project.name, projectAr: project.nameAr,
      due: prettyDate(TASK_TODAY_ISO), dueAr: prettyDateAr(TASK_TODAY_ISO), dueISO: TASK_TODAY_ISO,
      priority: "medium", status: "open", assignedBy: "Assistant", assignedByAr: "المساعد",
      category: project.category, sprint: CURRENT_SPRINT, createdISO: TASK_TODAY_ISO,
    })
    addAiEvent(project.id, `Added as a sub-task: ${text}`, `أُضيف كمهمة فرعية: ${textAr}`)
    dismissSuggestion(sid)
  }
  return (
    <Panel>
      <CardHeader icon={Sparkles} title={t("Assistant suggestion", "اقتراح المساعد")} />
      <div className="mt-[18px] flex flex-col gap-4">
        {list.map((s) => (
          <div key={s.id} className="flex flex-col gap-3 rounded-[12px] bg-background/60 p-6 ring-1 ring-inset ring-input">
            <p className="text-[14px]">{isAr ? s.textAr : s.text}</p>
            <div className="grid grid-cols-2 gap-10 [&>button]:h-8">
              <Btn variant="primary" onClick={() => accept(s.id, s.text, s.textAr)}>{t("Add as subtask", "أضفه كمهمة فرعية")}</Btn>
              <Btn onClick={() => { addAiEvent(project.id, `Suggestion turned down: ${s.text}`, `رُفض الاقتراح: ${s.textAr}`); dismissSuggestion(s.id) }}>{t("Reject", "رفض")}</Btn>
            </div>
          </div>
        ))}
        {list.length === 0 && <Empty icon={Sparkles} text={t("No suggestions right now.", "لا توجد اقتراحات حاليًا.")} />}
      </div>
    </Panel>
  )
}

const STATUS_TEXT = (s: TaskStatus | undefined, isAr: boolean) => (s ? (isAr ? STATUS_META[s].ar : STATUS_META[s].en) : "")

/** "النشاط" — the trail, oldest first, with the comment box at the bottom. */
function Activity({ subjectId, isAr, t, asManager, task }: { subjectId: string; isAr: boolean; t: TFn; asManager: boolean; task?: Task }) {
  const events = useTaskEvents(subjectId)
  const [draft, setDraft] = React.useState("")
  const [pct, setPct] = React.useState<number | null>(null)
  const [when, setWhen] = React.useState(TASK_TODAY_ISO)
  const [params] = useSearchParams()
  const inputRef = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => { if (params.get("comment") === "1") inputRef.current?.focus() }, [params])

  const post = () => {
    if (!draft.trim()) return
    addTaskComment(subjectId, draft.trim(), pct ?? undefined, when, asManager)
    setDraft(""); setPct(null); setWhen(TASK_TODAY_ISO)
  }

  return (
    <Panel>
      <CardHeader icon={MessagesSquare} title={t("Activity", "النشاط")} />
      <ul className="mt-[18px]">
        {events.map((e) => <ActivityRow key={e.id} e={e} isAr={isAr} t={t} />)}
      </ul>
      {events.length === 0 && <p className="py-6 text-center text-[13px] text-muted-foreground">{t("No activity yet.", "لا يوجد نشاط بعد.")}</p>}

      <div className="mt-[23px] flex items-center gap-3">
        <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-input bg-background ps-2 pe-3 focus-within:border-primary/60">
          <Initials text={ME.initials} className="size-6" />
          <input
            ref={inputRef} value={draft} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); post() } }}
            placeholder={asManager && task?.assignee
              ? t(`Leave a comment for ${task.assignee}…`, `اترك تعليقًا لـ ${task.assigneeAr}…`)
              : t("Add a comment…", "أضف تعليقًا…")}
            aria-label={t("Add a comment", "أضف تعليقًا")}
            className="h-full min-w-0 flex-1 bg-transparent text-[13.5px] outline-none placeholder:text-muted-foreground"
          />
        </div>
        <button onClick={post} disabled={!draft.trim()}
          className="btn-primary-grad inline-flex h-10 w-20 shrink-0 items-center justify-center gap-1.5 rounded-[8px] text-[13.5px] font-medium disabled:cursor-not-allowed">
          {t("Send", "إرسال")}
        </button>
      </div>

      {/* progress reporting, kept from the earlier task page — shows once something is typed */}
      {task && draft.trim() !== "" && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11.5px]">
          <span className="text-muted-foreground">{t("Percent complete", "نسبة الإنجاز")}</span>
          {[0, 25, 50, 75, 100].map((v) => (
            <button key={v} type="button" onClick={() => setPct(pct === v ? null : v)} aria-pressed={pct === v}
              className={cn("rounded-full px-2 py-0.5 tabular-nums ring-1 ring-inset", pct === v ? "bg-soft-accent text-primary ring-primary/40" : "text-muted-foreground ring-input hover:bg-foreground/5")}>
              {v}%
            </button>
          ))}
          <label className="ms-auto inline-flex items-center gap-1.5 text-muted-foreground">
            <CalendarDays className="size-3.5" />
            <input type="date" value={when} onChange={(e) => setWhen(e.target.value || TASK_TODAY_ISO)}
              aria-label={t("Update date", "تاريخ التحديث")} className="bg-transparent tabular-nums outline-none" />
          </label>
        </div>
      )}
    </Panel>
  )
}

function ActivityRow({ e, isAr, t }: { e: TaskEvent; isAr: boolean; t: TFn }) {
  const who = isAr ? e.authorAr : e.author
  const when = isAr ? e.atAr : e.at
  let text: React.ReactNode = isAr ? (e.textAr ?? e.text) : e.text
  if (e.kind === "status") text = t(`Moved this from ${STATUS_TEXT(e.from, false)} to ${STATUS_TEXT(e.to, false)}`, `نقل المهمة من ${STATUS_TEXT(e.from, true)} إلى ${STATUS_TEXT(e.to, true)}`)
  if (e.kind === "due") text = t(`Moved the due date from ${e.fromDue} to ${e.toDue}`, `غيّر تاريخ الاستحقاق من ${e.fromDue} إلى ${e.toDue}`)
  const ai = e.kind === "ai"
  return (
    <li className="flex items-center gap-3 border-b border-input py-2.5 last:border-b-0">
      <span className={cn("inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-[12px] font-medium", ai && "text-primary")}>
        {ai ? <Sparkles className="size-4" /> : e.kind === "status" ? <RotateCcw className="size-3.5 text-icon" />
          : e.kind === "due" ? <CalendarClock className="size-3.5 text-icon" /> : who.charAt(0)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13.5px] font-medium leading-5">{who}</span>
          {(ai || e.kind === "comment") && <span className="size-1.5 rounded-full bg-primary" />}
          {e.manager && <span className="rounded-full bg-soft-accent px-1.5 text-[10px] text-primary">{t("Manager", "المدير")}</span>}
          {e.progress !== undefined && <span className="rounded-full bg-soft-accent px-1.5 text-[10px] tabular-nums text-primary">{e.progress}%</span>}
        </div>
        <p className="whitespace-pre-wrap text-[12px] leading-[18px] text-muted-foreground">{text}</p>
      </div>
      <span className="shrink-0 text-[12px] tabular-nums text-muted-foreground">{when}</span>
    </li>
  )
}
