import * as React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { cn } from "@reach/shared-core"
import { usePageTitle } from "@reach/shell-context"
import { RequiredMark } from "@reach/shared-ui"
import {
  ArrowLeft, CalendarClock, CalendarDays, Check, ChevronLeft, ChevronRight, ClipboardList,
  FileText, Info, ListChecks, MessagesSquare, NotebookPen, Pencil, Plus, RotateCcw,
  Sparkles, Trash2, UserRoundCog, X,
} from "lucide-react"

import {
  Btn, CardHeader, CategoryChip, ConfirmDialog, Donut, Empty, FilterSelect, Initials, Legend,
  Page, Panel, StatusDot, TextCounter, useT, type TFn,
} from "./ui"
import {
  CATEGORIES, categoryById, isStatus, PRIORITIES, PRIORITY_META,
  STATUS_META, STATUS_ORDER, type CategoryId, type TaskPriority, type TaskStatus,
} from "../data/meta"
import {
  addAiEvent, addCreatedEvent, addSubtask, addTask, addTaskComment, ME, newTaskId, prettyDate, prettyDateAr, relativeDue,
  removeSubtask, removeTask, shortDate, TASK_TODAY_ISO, type SubTask, type Task, type TaskEvent, toggleComplete,
  toggleSubtask, unlinkProject, updateTask, useTaskEvents, useTasks,
} from "../data/tasks"
import {
  addProject, getProjectById, newProjectId, nextProjectCode, removeProject, STATUS_LABEL,
  type Project, type ProjectStatus, updateProject, useProjects,
} from "../data/projects"
import { MANAGER, memberById, team } from "../data/team"
import { dismissSuggestion, draftProjectIdeas, useSuggestions } from "../data/suggestions"
import { MilestonePicker } from "./MilestonePicker"
import { ProjectPicker } from "./ProjectPicker"
import { HealthPill } from "./HealthPill"
import { getMilestone, HEALTH, milestoneHealth, milestonesFor, useMilestones } from "../data/milestones"
import { currentSprintId, SPRINT_STATUS, sprintById, sprintsForPicking, sprintStatus, useSprints } from "../data/sprints"

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
  title?: string           // in the current language
  titleAlt?: string        // in the other language (optional) — sits right under the title
  descriptionAlt?: string  // in the other language (optional) — sits right under the description
  // create mode only — what the old routed editors asked for
  projectId?: string
  milestoneId?: string
  status?: TaskStatus
  releaseNote?: string
  subtasks?: string[]      // a new project's first tasks, or a new task's checklist
}

const ownerName = (id: string, isAr: boolean) => {
  if (id === "me") return isAr ? ME.nameAr : ME.name
  const m = memberById(id)
  return m ? (isAr ? m.nameAr : m.name) : ""
}
const ownerInitials = (id: string) => (id === "me" ? ME.initials : memberById(id)?.initials ?? "")
const firstName = (s: string) => s.split(" ")[0]

/** A half-filled task survives a detour to create a project (?resume=1 brings it back). */
const DRAFT_KEY = "wijha.work.task-draft"
const stashDraft = (d: Fields) => { try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d)) } catch { /* private mode */ } }
const readDraft = (): Partial<Fields> | undefined => {
  try { const s = sessionStorage.getItem(DRAFT_KEY); return s ? JSON.parse(s) : undefined } catch { return undefined }
}
const clearDraft = () => { try { sessionStorage.removeItem(DRAFT_KEY) } catch { /* ignore */ } }

/** The blank record a create screen starts from, prefilled from the query string. */
function blankDraft(kind: "task" | "project", params: URLSearchParams): Fields {
  if (kind === "project") {
    return {
      title: "", titleAlt: "", description: "", descriptionAlt: "", releaseNote: "", subtasks: [],
      category: "operations", sprint: currentSprintId(), ownerId: "me", priority: "medium",
      startISO: TASK_TODAY_ISO, dueISO: "", projectStatus: "active",
    }
  }
  const pid = params.get("project") ?? ""
  const p = getProjectById(pid)
  const st = params.get("status")
  const d: Fields = {
    title: "", titleAlt: "", description: "", descriptionAlt: "", releaseNote: "", subtasks: [],
    category: p?.category ?? "operations", sprint: currentSprintId(),
    ownerId: params.get("assignee") ?? (params.get("from") === "manager" ? team[0].id : "me"),
    dueISO: TASK_TODAY_ISO, priority: "medium",
    projectId: p ? pid : "", milestoneId: params.get("milestone") ?? "",
    status: isStatus(st) ? st : "open",
  }
  if (params.get("resume") === "1") {
    const saved = readDraft()
    if (saved) Object.assign(d, saved, p ? { projectId: pid, category: p.category } : {})
    // back from adding a milestone: keep the draft's project, select the new milestone
    const mid = params.get("milestone")
    if (mid) d.milestoneId = mid
  }
  if (d.milestoneId && getMilestone(d.milestoneId)?.projectId !== d.projectId) d.milestoneId = ""
  return d
}

/** Task and project detail — Figma 3580:8261 / 8521 (view), 3580:8667 / 8965
 *  (edit, inline on the same page), 3580:9156 / 9423 (release note edited inline).
 *  `create` opens the same screen in edit mode over a blank record
 *  (/tasks/new, /projects/new): one layout for new and edit, as the owner asked. */
export function WorkItemDetail({ kind, id = "", create = false }: { kind: "task" | "project"; id?: string; create?: boolean }) {
  const { isAr, t } = useT()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const allTasks = useTasks()
  const projects = useProjects()
  const sprints = useSprints()
  useMilestones()

  const isTask = kind === "task"
  const isProject = kind === "project"
  const task = !create && isTask ? allTasks.find((x) => x.id === id) : undefined
  const project = !create && isProject ? projects.find((p) => p.id === id) : undefined
  const exists = create || (isTask ? !!task : !!project)

  const from = params.get("from")
  // opened from the team board: the manager is working on someone else's task
  const asManager = from === "manager"
  const backParam = params.get("back")
  const safeBack = backParam && backParam.startsWith("/") && !backParam.startsWith("//") ? backParam : undefined

  // where Back / Cancel lead — create screens return to whichever view opened them
  const backHref = create
    ? isProject
      ? safeBack ?? (from === "task" ? "/tasks/new" : "/projects")
      : from === "project" && params.get("project")
        ? `/projects/${params.get("project")}`
        : asManager
          ? (params.get("assignee") ? `/tasks?who=${params.get("assignee")}` : "/tasks?who=team")
          : safeBack ?? (params.get("view") === "board" ? "/tasks" : "/tasks?view=list")
    : isProject
      ? "/projects"
      : from === "project" && task?.projectId ? `/projects/${task.projectId}` : asManager ? "/tasks?who=team" : "/tasks"
  const backLabel = backHref.startsWith("/projects/") ? t("Back to the project", "العودة إلى المشروع")
    : backHref.startsWith("/projects") ? t("Back to projects", "العودة إلى المشاريع")
      : backHref.startsWith("/tasks/new") ? t("Back to the task", "العودة إلى المهمة")
        : t("Back to tasks", "العودة إلى المهام")

  // full edit mode lives on this page, as drawn; ?edit=1 deep-links straight in
  const editing = create || params.get("edit") === "1"
  const setEditing = (on: boolean) => {
    const next = new URLSearchParams(params)
    if (on) next.set("edit", "1"); else next.delete("edit")
    setParams(next, { replace: true })
  }

  const loaded: Fields | undefined = task
    ? { category: task.category, sprint: task.sprint, ownerId: task.assigneeId ?? "me", dueISO: task.dueISO,
        priority: task.priority, description: (isAr ? task.descriptionAr : task.description) ?? "",
        title: isAr ? task.titleAr : task.title, titleAlt: isAr ? task.title : task.titleAr,
        descriptionAlt: (isAr ? task.description : task.descriptionAr) ?? "" }
    : project
      ? { category: project.category, sprint: project.sprint, ownerId: project.ownerId, dueISO: project.dueISO,
          priority: project.priority ?? "medium", description: (isAr ? project.descriptionAr : project.description) ?? "",
          startISO: project.startISO, projectStatus: project.status,
          title: isAr ? project.nameAr : project.name, titleAlt: isAr ? project.name : project.nameAr,
          descriptionAlt: (isAr ? project.description : project.descriptionAr) ?? "" }
      : undefined

  const [draft, setDraft] = React.useState<Fields | undefined>(() => (create ? blankDraft(kind, params) : loaded))
  React.useEffect(() => { if (editing && !create) setDraft(loaded) }, [editing, id])  // eslint-disable-line react-hooks/exhaustive-deps
  const fields = create ? draft : loaded
  const patch = (p: Partial<Fields>) => setDraft((d) => (d ? { ...d, ...p } : d))

  // the create screen stays mounted when a board column links back in, so follow the query string
  const qs = params.toString()
  React.useEffect(() => {
    if (!create || !isTask) return
    const st = params.get("status"), who = params.get("assignee"), pid = params.get("project"), mid = params.get("milestone")
    setDraft((d) => {
      if (!d) return d
      const next = { ...d }
      if (isStatus(st)) next.status = st
      if (who) next.ownerId = who
      if (pid && getProjectById(pid)) { next.projectId = pid; next.category = getProjectById(pid)?.category ?? next.category }
      if (mid) next.milestoneId = mid
      return next
    })
  }, [qs])  // eslint-disable-line react-hooks/exhaustive-deps

  const [code] = React.useState(() => (create && isProject ? nextProjectCode() : ""))
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const [tried, setTried] = React.useState(false)
  const titleRef = React.useRef<HTMLInputElement>(null)

  const title = task ? (isAr ? task.titleAr : task.title) : project ? (isAr ? project.nameAr : project.name) : ""
  // Figma top bar: "مهمة: <title>" / "المشروع: <name>"; create screens: "مهمة جديدة" / "مشروع جديد".
  usePageTitle(
    create ? (isTask ? "New task" : "New project") : task ? `Task: ${task.title}` : project ? `Project: ${project.name}` : undefined,
    create ? (isTask ? "مهمة جديدة" : "مشروع جديد") : task ? `مهمة: ${task.titleAr}` : project ? `المشروع: ${project.nameAr}` : undefined,
  )

  if (!exists || !fields) {
    return (
      <Page>
        <Empty
          icon={ClipboardList}
          text={isTask ? t("That task no longer exists.", "لم تعد هذه المهمة موجودة.") : t("That project no longer exists.", "لم يعد هذا المشروع موجودًا.")}
          action={<Btn onClick={() => navigate(backHref)}>{backLabel}</Btn>}
        />
      </Page>
    )
  }

  // ── validation (inline, shown after the first save attempt) ──────────────
  const errors = {
    title: editing && draft && !draft.title?.trim()
      ? (isTask ? t("Give the task a title.", "أدخل عنوانًا للمهمة.") : t("Give the project a name.", "أدخل اسمًا للمشروع."))
      : undefined,
    due: editing && draft && !draft.dueISO ? t("Pick a due date.", "اختر تاريخ الاستحقاق.") : undefined,
    start: editing && draft && isProject && draft.startISO && draft.dueISO && draft.startISO > draft.dueISO
      ? t("The due date is before the start date.", "تاريخ الاستحقاق قبل تاريخ البدء.")
      : undefined,
  }
  const err = (k: keyof typeof errors) => (tried ? errors[k] : undefined)
  const invalid = Object.values(errors).some(Boolean)
  // Fields still missing, named next to the save button so a blocked save is never silent.
  const missing = [
    errors.title && (isTask ? t("title", "العنوان") : t("name", "الاسم")),
    errors.due && t("due date", "تاريخ الاستحقاق"),
    errors.start && t("start/due dates", "تاريخا البدء والاستحقاق"),
  ].filter(Boolean) as string[]
  /** Bring the first invalid field into view and focus it (Details can be below the fold). */
  const revealFirstInvalid = () => requestAnimationFrame(() => {
    const el = document.querySelector<HTMLElement>('main [aria-invalid="true"]')
    el?.scrollIntoView({ block: "center", behavior: "smooth" })
    el?.focus({ preventScroll: true })
  })

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
    if (!draft || !loaded) return
    if (invalid) { setTried(true); revealFirstInvalid(); return }
    if (draft.ownerId !== loaded.ownerId) assign(draft.ownerId)
    const descKey = isAr ? "descriptionAr" : "description"
    const altDescKey = isAr ? "description" : "descriptionAr"
    const newName = draft.title?.trim()
    const altName = draft.titleAlt?.trim() || newName
    const desc = draft.description.trim() || undefined
    const altDesc = draft.descriptionAlt?.trim() || desc
    if (task) {
      updateTask(task.id, {
        ...(newName ? { [isAr ? "titleAr" : "title"]: newName, [isAr ? "title" : "titleAr"]: altName } : {}),
        category: draft.category, sprint: draft.sprint, dueISO: draft.dueISO, priority: draft.priority,
        [descKey]: desc, [altDescKey]: altDesc,
      })
    } else if (project) {
      updateProject(project.id, {
        ...(newName ? { [isAr ? "nameAr" : "name"]: newName, [isAr ? "name" : "nameAr"]: altName } : {}),
        category: draft.category, sprint: draft.sprint, priority: draft.priority,
        dueISO: draft.dueISO, due: prettyDate(draft.dueISO),
        startISO: draft.startISO, start: draft.startISO ? prettyDate(draft.startISO) : project.start,
        status: draft.projectStatus ?? project.status,
        [descKey]: desc, [altDescKey]: altDesc,
      })
    }
    setTried(false)
    setEditing(false)
  }

  /** Create mode: add the record to the store, then open it. */
  const createRecord = () => {
    if (!draft) return
    if (invalid) { setTried(true); revealFirstInvalid(); return }
    const main = draft.title!.trim()
    const alt = draft.titleAlt?.trim() || main
    const en = isAr ? alt : main
    const ar = isAr ? main : alt
    const description = draft.description.trim() || undefined
    const descriptionAlt = draft.descriptionAlt?.trim() || description
    const descEn = isAr ? descriptionAlt : description
    const descAr = isAr ? description : descriptionAlt
    const releaseNote = draft.releaseNote?.trim() || undefined
    if (isTask) {
      const m = memberById(draft.ownerId)
      const p = getProjectById(draft.projectId ?? "")
      const newId = newTaskId()
      addTask({
        id: newId, title: en, titleAr: ar,
        projectId: p?.id, milestoneId: p && draft.milestoneId ? draft.milestoneId : undefined,
        project: p ? p.name : "General", projectAr: p ? p.nameAr : "عام",
        due: prettyDate(draft.dueISO), dueAr: prettyDateAr(draft.dueISO), dueISO: draft.dueISO,
        priority: draft.priority, status: draft.status ?? "open",
        category: draft.category, sprint: draft.sprint, createdISO: TASK_TODAY_ISO,
        assigneeId: m?.id, assignee: m?.name, assigneeAr: m?.nameAr,
        assignedBy: m ? MANAGER.name : "Self", assignedByAr: m ? MANAGER.nameAr : "شخصي",
        description: descEn, descriptionAr: descAr, releaseNote,
        subtasks: (draft.subtasks ?? []).map((x) => x.trim()).filter(Boolean)
          .map((x, i) => ({ id: `${newId}-s${i + 1}`, title: x, titleAr: x, dueISO: draft.dueISO, done: false })),
      })
      addCreatedEvent(newId, m ? { en: m.name, ar: m.nameAr } : undefined)
      clearDraft()
      navigate(`/tasks/${newId}${from === "project" && p ? "?from=project" : m ? "?from=manager" : ""}`)
    } else {
      const newId = newProjectId()
      addProject({
        id: newId, code, name: en, nameAr: ar,
        ownerId: draft.ownerId, owner: ownerName(draft.ownerId, false), ownerAr: ownerName(draft.ownerId, true),
        status: draft.projectStatus ?? "active", category: draft.category, sprint: draft.sprint, priority: draft.priority,
        start: prettyDate(draft.startISO ?? TASK_TODAY_ISO), startISO: draft.startISO ?? TASK_TODAY_ISO,
        due: prettyDate(draft.dueISO), dueISO: draft.dueISO,
        description: descEn, descriptionAr: descAr, createdISO: TASK_TODAY_ISO, releaseNote,
      })
      // the first subtasks, in the order they were typed (addTask puts new rows on top)
      ;[...(draft.subtasks ?? []).map((x) => x.trim()).filter(Boolean)].reverse().forEach((s, i) => addTask({
        id: `${newTaskId()}-${i}`, title: s, titleAr: s, projectId: newId, project: en, projectAr: ar,
        due: prettyDate(draft.dueISO), dueAr: prettyDateAr(draft.dueISO), dueISO: draft.dueISO,
        priority: "medium", status: "open", assignedBy: "Self", assignedByAr: "شخصي",
        category: draft.category, sprint: draft.sprint, createdISO: TASK_TODAY_ISO,
      }))
      // picked "create a new project" from a task form: go back to it with the project chosen
      if (from === "task") navigate(`${backHref}${backHref.includes("?") ? "&" : "?"}project=${newId}`)
      else navigate(`/projects/${newId}`)
    }
  }

  const cancel = () => {
    if (!create) { setTried(false); setEditing(false); return }
    if (isTask) clearDraft()
    navigate(backHref)
  }

  /** "Create a new project" from the task's project picker keeps this draft for the way back. */
  const createMilestoneFromTask = () => {
    if (!draft?.projectId) return
    stashDraft(draft)
    const ret = new URLSearchParams(params)
    ret.set("resume", "1"); ret.delete("project"); ret.delete("milestone")
    navigate(`/projects/${draft.projectId}/milestones/new?back=${encodeURIComponent(`/tasks/new?${ret}`)}`)
  }

  const createProjectFromTask = () => {
    if (draft) stashDraft(draft)
    const ret = new URLSearchParams(params)
    ret.set("resume", "1"); ret.delete("project"); ret.delete("milestone")
    navigate(`/projects/new?from=task&back=${encodeURIComponent(`/tasks/new?${ret}`)}`)
  }

  const remove = () => {
    if (task) { removeTask(task.id); navigate(backHref) }
    if (project) { unlinkProject(project.id); removeProject(project.id); navigate("/projects") }
  }

  // ── pager: "Task 7 of 13" over this sprint's board, "Project 7 of 13" over the master ──
  const order = (x: Task) => STATUS_ORDER.indexOf(x.status)
  const siblings = create ? [] : isTask
    ? (() => {
        const sprintSet = allTasks.filter((x) => x.sprint === (task?.sprint ?? currentSprintId()))
        const list = sprintSet.some((x) => x.id === id) ? sprintSet : allTasks
        return [...list].sort((a, b) => order(a) - order(b) || a.dueISO.localeCompare(b.dueISO)).map((x) => x.id)
      })()
    : projects.map((p) => p.id)
  const pos = siblings.indexOf(id)
  const go = (delta: number) => {
    const next = siblings[(pos + delta + siblings.length) % siblings.length]
    navigate(isTask ? `/tasks/${next}${asManager ? "?from=manager" : ""}` : `/projects/${next}`)
  }

  const projectTasks = project ? allTasks.filter((x) => x.projectId === project.id) : []
  const statusCount = (s: TaskStatus) => create
    ? (s === "open" ? draft?.subtasks?.filter((x) => x.trim()).length ?? 0 : 0)
    : projectTasks.filter((x) => x.status === s).length
  const taskTotal = create ? draft?.subtasks?.filter((x) => x.trim()).length ?? 0 : projectTasks.length

  const ownerOptions = [
    { value: "me", label: isAr ? ME.nameAr : ME.name, alt: isAr ? ME.name : ME.nameAr, lead: <Initials text={ME.initials} /> },
    ...team.map((m) => ({ value: m.id, label: isAr ? m.nameAr : m.name, alt: isAr ? m.name : m.nameAr, lead: <Initials text={m.initials} /> })),
  ]

  return (
    <Page>
      {/* ── header card ──────────────────────────────────────────────── */}
      <section className="highlight-card hl-green flex flex-col gap-8 rounded-2xl px-5 py-6 lg:ps-6 lg:pe-14">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button onClick={() => (create ? cancel() : navigate(backHref))}
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
                  menuClassName="w-64" hideValue triggerClassName="h-[34px] bg-foreground/[0.08]" searchable
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
                {tried && missing.length > 0 && (
                  <span role="alert" className="text-[12.5px] text-error">
                    {t(`Fill in: ${missing.join(", ")}`, `أكمل: ${missing.join("، ")}`)}
                  </span>
                )}
                <Btn variant="outline" className="bg-secondary" onClick={cancel}>{t("Cancel", "إلغاء")}</Btn>
                <Btn variant="primary" onClick={create ? createRecord : save}>
                  {!create ? t("Save changes", "حفظ التعديلات") : isTask ? (asManager ? t("Assign task", "إسناد المهمة") : t("Create task", "إنشاء المهمة")) : t("Create project", "إنشاء المشروع")}
                </Btn>
              </>
            )}
            {!create && siblings.length > 1 && pos >= 0 && (
              <div className="ms-1 flex items-center gap-2 border-s border-input ps-3">
                <span className="text-[13px] tabular-nums text-muted-foreground">
                  {isTask ? t(`Task ${pos + 1} of ${siblings.length}`, `المهمة ${pos + 1} من ${siblings.length}`)
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
          <div className={cn("flex min-w-0 flex-col gap-3", create && "lg:flex-1")}>
            {editing && draft ? (
              <div className="flex flex-col gap-1">
                <input
                  ref={titleRef} autoFocus={create} value={draft.title ?? ""} onChange={(e) => patch({ title: e.target.value })}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (create) createRecord(); else save() } }}
                  placeholder={isTask ? t("Task title", "عنوان المهمة") : t("Project name", "اسم المشروع")}
                  aria-label={isTask ? t("Task title", "عنوان المهمة") : t("Project name", "اسم المشروع")}
                  aria-invalid={!!err("title")}
                  className={cn("h-[38px] w-full max-w-[640px] border-b border-dashed bg-transparent text-[27px] font-normal leading-[38px] tracking-[-0.27px] outline-none placeholder:text-muted-foreground/60",
                    err("title") ? "border-error" : "border-input focus:border-primary/70")}
                />
                {err("title") ? <p className="text-[12px] text-error">{err("title")}</p> : <TextCounter text={draft.title ?? ""} isAr={isAr} />}
                {/* the same name in the other language, directly beneath it */}
                <label className="mt-3 flex max-w-[640px] flex-col gap-1">
                  <span className="text-[12px] text-muted-foreground">
                    {isTask ? t("Title in Arabic", "العنوان بالإنجليزية") : t("Name in Arabic", "الاسم بالإنجليزية")} · {t("optional", "اختياري")}
                  </span>
                  <input
                    value={draft.titleAlt ?? ""} onChange={(e) => patch({ titleAlt: e.target.value })} dir={isAr ? "ltr" : "rtl"}
                    placeholder={isTask ? t("عنوان المهمة", "Task title") : t("اسم المشروع", "Project name")}
                    className="h-[30px] w-full border-b border-dashed border-input bg-transparent text-[18px] leading-[30px] outline-none placeholder:text-muted-foreground/60 focus:border-primary/70"
                  />
                </label>
              </div>
            ) : (
              <h1 className={cn("text-[27px] font-normal leading-[38px] tracking-[-0.27px]", task?.status === "completed" && "text-muted-foreground line-through")}>{title}</h1>
            )}
            <div className="flex flex-wrap items-center gap-2.5 text-[14px]">
              {isTask && <><CategoryChip id={fields.category} isAr={isAr} className="h-[30px] px-2.5 text-[13px]" /><span className="text-muted-foreground">·</span></>}
              <Initials text={ownerInitials(fields.ownerId)} className="size-6 text-[9px]" />
              <span className="text-muted-foreground">{ownerName(fields.ownerId, isAr)}</span>
            </div>
          </div>
          {isProject && (
            <div className="flex items-center gap-10 self-center lg:self-auto">
              <Legend rows={STATUS_ORDER.map((s) => ({ label: s === "open" ? t("Pending", "قيد الانتظار") : isAr ? STATUS_META[s].ar : STATUS_META[s].en, value: statusCount(s), dot: STATUS_META[s].dot }))} />
              <Donut total={taskTotal} label={t("Tasks", "مهام")}
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
              actions={editing && !create ? <span className="text-[12px] text-warning">{t("Unsaved changes", "تغييرات غير محفوظة")}</span> : undefined} />
            <div className="mt-[18px]">
              {editing && draft ? (
                <div className="flex flex-col gap-4">
                  <textarea
                    value={draft.description} onChange={(e) => patch({ description: e.target.value })}
                    rows={5} aria-label={t("Description", "الوصف")}
                    placeholder={create ? (isTask ? t("What needs to be done, and any detail worth keeping with the task…", "ما المطلوب إنجازه، وأي تفاصيل تستحق الحفظ مع المهمة…")
                      : t("What this project covers…", "ما الذي يغطيه هذا المشروع…")) : undefined}
                    className="min-h-[135px] w-full resize-none rounded-[8px] border border-primary/70 bg-background p-4 text-[13.5px] leading-[20.25px] outline-none placeholder:text-muted-foreground"
                  />
                  <TextCounter text={draft.description} isAr={isAr} />
                  {/* the same description in the other language, directly beneath it */}
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[12px] text-muted-foreground">{t("Description in Arabic", "الوصف بالإنجليزية")} · {t("optional", "اختياري")}</span>
                    <textarea
                      value={draft.descriptionAlt ?? ""} onChange={(e) => patch({ descriptionAlt: e.target.value })}
                      rows={4} dir={isAr ? "ltr" : "rtl"}
                      className="min-h-[108px] w-full resize-none rounded-[8px] border border-input bg-background p-4 text-[13.5px] leading-[20.25px] outline-none focus:border-primary/70"
                    />
                  </label>
                </div>
              ) : (
                <p className="text-[13.5px] leading-[20.25px] text-foreground">
                  {fields.description || <span className="text-muted-foreground">{t("No description yet.", "لا يوجد وصف بعد.")}</span>}
                </p>
              )}
            </div>
          </Panel>

          {/* release note — edited inline in either mode; part of the draft on a create screen */}
          {create && draft ? (
            <ReleaseNote value="" draftValue={draft.releaseNote ?? ""} onDraftChange={(v) => patch({ releaseNote: v })} onSave={() => {}} isAr={isAr} t={t} />
          ) : (
            <ReleaseNote
              key={id}
              value={(task ? task.releaseNote : project?.releaseNote) ?? ""}
              onSave={(v) => task ? updateTask(task.id, { releaseNote: v }) : project && updateProject(project.id, { releaseNote: v })}
              isAr={isAr} t={t}
            />
          )}

          {project && <SubTasks project={project} tasks={projectTasks} isAr={isAr} t={t} />}
          {task && <TaskSubTasks task={task} isAr={isAr} t={t} />}
          {create && draft && (
            <DraftSubTasks items={draft.subtasks ?? []} onChange={(subtasks) => patch({ subtasks })} forTask={isTask} isAr={isAr} t={t} />
          )}

          {/* not in the drawn frame; sits with the project's work, above Activity, so it is found */}
          {project && <Milestones project={project} tasks={allTasks} isAr={isAr} t={t} />}
          {create && isProject && (
            <Panel>
              <CardHeader icon={CalendarClock} title={t("Milestones", "المعالم")} />
              <Empty icon={CalendarClock} text={t("Milestones can be added once the project is created.", "يمكن إضافة المعالم بعد إنشاء المشروع.")} />
            </Panel>
          )}

          {/* nothing has happened yet on a new task/project — no Activity card while creating */}
          {!create && <Activity subjectId={id} isAr={isAr} t={t} asManager={asManager} task={task} />}
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          {project && <Suggestions project={project} isAr={isAr} t={t} />}
          {create && isProject && draft && (
            <DraftSuggestions
              category={draft.category ?? "operations"} name={draft.title ?? ""} added={draft.subtasks ?? []}
              onAdd={(text) => patch({ subtasks: [...(draft.subtasks ?? []).filter((x) => x.trim()), text] })}
              isAr={isAr} t={t}
            />
          )}

          <Panel>
            <CardHeader icon={Info} title={t("Details", "التفاصيل")} />
            <dl className="mt-[18px] overflow-hidden rounded-lg bg-background/60">
              <Row label={t("Category", "الفئة")} edit={editing}
                view={(() => { const c = categoryById(fields.category); return c ? (isAr ? c.ar : c.en) : "—" })()}
                control={draft && (
                  <FilterSelect className="w-full max-w-[265px]" lead={<span className="size-[7px] shrink-0 rounded-full bg-primary" />}
                    label={t("Category", "الفئة")} value={draft.category ?? ""}
                    onChange={(v) => patch({ category: v as CategoryId })}
                    options={CATEGORIES.map((c) => ({ value: c.id, label: isAr ? c.ar : c.en, lead: <span className={cn("size-2 rounded-full", c.dot)} /> }))} />
                )} />
              <Row label={t("Sprint", "السبرنت")} edit={editing}
                view={(() => {
                  const s = sprintById(fields.sprint)
                  return s
                    ? <button onClick={() => navigate(`/sprints/${s.id}`)} className="text-start hover:text-primary hover:underline">{isAr ? s.nameAr : s.name}</button>
                    : "—"
                })()}
                control={draft && (
                  <FilterSelect className="w-full max-w-[265px]" lead={<RotateCcw className="size-[14px] shrink-0 text-icon" />}
                    label={t("Sprint", "السبرنت")} value={draft.sprint ?? ""}
                    onChange={(v) => patch({ sprint: v })}
                    // planned and active first, completed after; the record's own sprint stays pickable even if archived
                    options={[...sprintsForPicking(sprints), ...(() => { const own = sprintById(draft.sprint); return own?.archived ? [own] : [] })()]
                      .map((s) => {
                        const st = sprintStatus(s)
                        return { value: s.id, label: isAr ? s.nameAr : s.name, hint: isAr ? SPRINT_STATUS[st].ar : SPRINT_STATUS[st].en }
                      })} />
                )} />
              <Row label={t("Assignee", "المسؤول")} edit={editing}
                view={firstName(ownerName(fields.ownerId, isAr))}
                control={draft && (
                  <FilterSelect className="w-full max-w-[265px]" lead={<UserRoundCog className="size-4 shrink-0 text-icon" />}
                    label={create ? t("Assign:", "إسناد:") : t("Reassign:", "إعادة إسناد:")} value={draft.ownerId}
                    onChange={(v) => patch({ ownerId: v })} options={ownerOptions} searchable />
                )} />
              <Row label={t("Due date", "تاريخ الاستحقاق")} edit={editing} required error={err("due") ?? err("start")}
                view={<span className={cn(task && task.status !== "completed" && task.dueISO < TASK_TODAY_ISO && "text-error")}>{shortDate(fields.dueISO, isAr)}</span>}
                control={draft && <DateField value={draft.dueISO} onChange={(v) => patch({ dueISO: v })} label={t("Date", "تاريخ")} required invalid={!!(err("due") ?? err("start"))} />} />
              {isProject && (
                <Row label={t("Start date", "تاريخ البدء")} edit={editing}
                  view={shortDate(fields.startISO ?? "", isAr)}
                  control={draft && <DateField value={draft.startISO ?? ""} onChange={(v) => patch({ startISO: v })} label={t("Date", "تاريخ")} />} />
              )}
              <Row label={t("Created", "تاريخ الإنشاء")} edit={false}
                view={shortDate((create ? TASK_TODAY_ISO : task ? task.createdISO : project?.createdISO) ?? "", isAr) || "—"} />
              <Row label={t("Priority", "الأولوية")} edit={editing}
                view={isAr ? PRIORITY_META[fields.priority].ar : PRIORITY_META[fields.priority].en}
                control={draft && (
                  <FilterSelect className="w-full max-w-[265px]" lead={<span className={cn("size-[7px] shrink-0 rounded-full", PRIORITY_META[draft.priority].dot)} />}
                    label={t("Priority", "الأولوية")} value={draft.priority}
                    onChange={(v) => patch({ priority: v as TaskPriority })}
                    options={PRIORITIES.map((p) => ({ value: p, label: isAr ? PRIORITY_META[p].ar : PRIORITY_META[p].en, lead: <span className={cn("size-2 rounded-full", PRIORITY_META[p].dot)} /> }))} />
                )} />
              {isProject && (
                <Row label={t("Project status", "حالة المشروع")} edit={editing}
                  view={project && <span className={cn("rounded-full px-2 py-0.5 text-[11.5px]", STATUS_LABEL[project.status].chip)}>{isAr ? STATUS_LABEL[project.status].ar : STATUS_LABEL[project.status].en}</span>}
                  control={draft && (
                    <FilterSelect className="w-full max-w-[265px]" value={draft.projectStatus ?? project?.status ?? "active"}
                      onChange={(v) => patch({ projectStatus: v as ProjectStatus })}
                      options={(Object.keys(STATUS_LABEL) as ProjectStatus[]).map((s) => ({ value: s, label: isAr ? STATUS_LABEL[s].ar : STATUS_LABEL[s].en }))} />
                  )} />
              )}
              {isProject && <Row label={t("Reference", "الرقم المرجعي")} edit={false} view={<span className="tabular-nums">{create ? code : project?.code}</span>} />}
              {isTask && (
                <Row label={t("Project", "المشروع")} edit={create}
                  view={task && (task.projectId
                    ? <button onClick={() => navigate(`/projects/${task.projectId}`)} className="text-start hover:text-primary hover:underline">{isAr ? task.projectAr : task.project}</button>
                    : (isAr ? task.projectAr : task.project))}
                  control={draft && (
                    <div className="w-full max-w-[265px]">
                      <ProjectPicker value={draft.projectId ?? ""} isAr={isAr} t={t} onCreate={createProjectFromTask}
                        onChange={(pid) => setDraft((d) => d && {
                          ...d, projectId: pid,
                          milestoneId: d.milestoneId && getMilestone(d.milestoneId)?.projectId === pid ? d.milestoneId : "",
                          category: getProjectById(pid)?.category ?? d.category,
                        })} />
                    </div>
                  )} />
              )}
              {create && isTask && draft && (
                <Row label={t("Milestone", "المعلم")} edit
                  view={null}
                  control={
                    <div className="w-full max-w-[265px]">
                      <MilestonePicker projectId={draft.projectId ?? ""} value={draft.milestoneId ?? ""} isAr={isAr} t={t}
                        onChange={(mid) => patch({ milestoneId: mid })}
                        onCreate={draft.projectId ? createMilestoneFromTask : undefined} />
                    </div>
                  } />
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
              {create && isTask && draft && (
                <Row label={t("Status", "الحالة")} edit
                  view={null}
                  control={
                    <FilterSelect className="w-full max-w-[265px]" lead={<StatusDot status={draft.status ?? "open"} />}
                      value={draft.status ?? "open"} onChange={(v) => patch({ status: v as TaskStatus })}
                      options={STATUS_ORDER.map((s) => ({ value: s, label: isAr ? STATUS_META[s].ar : STATUS_META[s].en, lead: <StatusDot status={s} /> }))} />
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

      {!create && (
        <ConfirmDialog
          open={confirmDelete}
          title={isTask ? t("Delete this task?", "حذف هذه المهمة؟") : t("Delete this project?", "حذف هذا المشروع؟")}
          body={isTask
            ? t("The task and its activity will be removed. This cannot be undone.", "ستُحذف المهمة وسجل نشاطها. لا يمكن التراجع عن ذلك.")
            : t("Its tasks stay, no longer linked to a project. This cannot be undone.", "تبقى مهامه دون ربطها بمشروع. لا يمكن التراجع عن ذلك.")}
          confirm={t("Delete", "حذف")} cancel={t("Cancel", "إلغاء")}
          onConfirm={() => { setConfirmDelete(false); remove() }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </Page>
  )
}

/** One key/value line of the Details card; becomes a control in edit mode. */
export function Row({ label, view, control, edit, error, required }: {
  label: string; view: React.ReactNode; control?: React.ReactNode; edit: boolean; error?: string
  /** Edit mode only: the Figma required asterisk after the label (pass `required` to the control too). */
  required?: boolean
}) {
  return (
    <div className={cn("flex min-h-[54px] items-center justify-between gap-4 border-b border-input px-4 py-2.5 last:border-b-0", error && "flex-wrap gap-y-1")}>
      <dt className="shrink-0 text-[12px] text-muted-foreground">{label}{edit && control && required && <RequiredMark />}</dt>
      <dd className="flex min-w-0 flex-1 justify-end text-end text-[14px] text-foreground">{edit && control ? control : view}</dd>
      {error && <p role="alert" className="w-full text-end text-[11.5px] text-error">{error}</p>}
    </div>
  )
}

export function DateField({ value, onChange, label, invalid, required }: { value: string; onChange: (v: string) => void; label: string; invalid?: boolean; required?: boolean }) {
  return (
    <label className={cn("relative flex h-9 w-full max-w-[265px] items-center rounded-lg bg-[var(--card-elevated)] ring-1 ring-inset focus-within:ring-primary",
      invalid ? "ring-error" : "ring-[var(--card-ring)]")}>
      <CalendarDays className="pointer-events-none absolute end-3 size-4 text-icon" />
      <input
        type="date" value={value} onChange={(e) => e.target.value && onChange(e.target.value)} aria-label={label} aria-invalid={invalid} aria-required={required || undefined}
        className={cn("h-full w-full rounded-lg bg-transparent ps-3 pe-9 text-[12.5px] font-medium tabular-nums outline-none [&::-webkit-calendar-picker-indicator]:opacity-0",
          !value && "text-muted-foreground")}
      />
    </label>
  )
}

/** "ملاحظة النشر" — always editable; Save / Cancel appear once it differs. */
const NOTE_DRAFT = {
  en: "Version 2.4 deployed to production. Verification: run quality checks on April data. Rollback plan: restore version 2.3",
  ar: "تم نشر الإصدار 2.4 على بيئة الإنتاج. التحقق: تشغيل فحوصات الجودة على بيانات أبريل. خطة التراجع: استعادة الإصدار 2.3",
}

function ReleaseNote({ value, onSave, isAr, t, draftValue, onDraftChange }: {
  value: string; onSave: (v: string) => void; isAr: boolean; t: TFn
  /** create screen: the note is part of the new record's draft — no Save / Cancel of its own */
  draftValue?: string; onDraftChange?: (v: string) => void
}) {
  // ?note=draft opens the note mid-edit with a sample draft (Figma 3580:9156 / 9423)
  const [params] = useSearchParams()
  const seeded = params.get("note") === "draft" ? (isAr ? NOTE_DRAFT.ar : NOTE_DRAFT.en) : value
  const [own, setOwn] = React.useState(seeded)
  React.useEffect(() => setOwn(seeded), [seeded])
  const controlled = onDraftChange !== undefined
  const text = controlled ? draftValue ?? "" : own
  const setText = controlled ? onDraftChange : setOwn
  const dirty = !controlled && text !== value
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

/** "المهام الفرعية" on a task — its own checklist. "مهمة جديدة" opens a row to type in;
 *  Enter keeps it and opens the next, Escape or an empty row drops it. */
function TaskSubTasks({ task, isAr, t }: { task: Task; isAr: boolean; t: TFn }) {
  const [adding, setAdding] = React.useState(false)
  const [text, setText] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  React.useEffect(() => { if (adding) { inputRef.current?.focus(); inputRef.current?.scrollIntoView({ block: "nearest" }) } }, [adding])
  const items: SubTask[] = task.subtasks ?? []
  const doneCount = items.filter((x) => x.done).length
  const commit = (keepOpen: boolean) => {
    const v = text.trim()
    if (v) addSubtask(task.id, v, task.dueISO)
    setText("")
    setAdding(keepOpen && !!v)
  }
  return (
    <Panel>
      <CardHeader icon={ListChecks} title={t("Subtasks", "المهام الفرعية")}
        actions={
          <div className="flex items-center gap-3">
            {items.length > 0 && <span className="text-[12px] tabular-nums text-muted-foreground">{doneCount}/{items.length}</span>}
            <button type="button" onClick={() => setAdding(true)}
              className="btn-primary-grad inline-flex h-7 items-center gap-1.5 rounded-lg px-3 text-[12.5px] font-medium">
              <Plus className="size-3.5" />{t("New task", "مهمة جديدة")}
            </button>
          </div>
        } />
      {/* six rows show, as drawn; longer lists scroll inside the card */}
      <ul className="mt-[18px] max-h-[300px] overflow-y-auto [scrollbar-width:thin]">
        {items.map((x) => {
          const due = x.dueISO ? relativeDue(x.dueISO, isAr) : undefined
          return (
            <li key={x.id} className="group flex min-h-[50px] items-center gap-3 border-b border-input py-2 last:border-b-0">
              <button type="button" onClick={() => toggleSubtask(task.id, x.id)} aria-pressed={x.done}
                aria-label={x.done ? t("Reopen", "إعادة فتح") : t("Mark complete", "وضع علامة مكتمل")}
                className={cn("inline-flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors",
                  x.done ? "border-success bg-success text-background" : "border-foreground/70 hover:border-primary")}>
                {x.done && <Check className="size-3" strokeWidth={3} />}
              </button>
              <span className={cn("min-w-0 flex-1 truncate text-[14px]", x.done && "text-muted-foreground line-through")}>
                {isAr ? x.titleAr : x.title}
              </span>
              <span className={cn("shrink-0 text-[12.5px] font-medium",
                x.done || !due ? "text-muted-foreground" : due.tone === "error" ? "text-error" : due.tone === "warning" ? "text-warning" : "text-muted-foreground")}>
                {x.done ? t("Done", "منجزة") : due?.text}
              </span>
              <button type="button" onClick={() => removeSubtask(task.id, x.id)} aria-label={t("Remove", "إزالة")}
                className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-icon opacity-0 hover:bg-foreground/5 hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100">
                <X className="size-3.5" />
              </button>
            </li>
          )
        })}
        {adding && (
          <li className="flex min-h-[50px] items-center gap-3 border-t border-input py-2 first:border-t-0">
            <span className="inline-flex size-5 shrink-0 rounded-full border-[1.5px] border-foreground/70" />
            <input
              ref={inputRef} value={text} onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); commit(true) }
                if (e.key === "Escape") { e.preventDefault(); setText(""); setAdding(false) }
              }}
              onBlur={() => commit(false)}
              placeholder={t("Subtask title", "عنوان المهمة الفرعية")}
              aria-label={t("New subtask", "مهمة فرعية جديدة")}
              className="h-9 min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
            />
          </li>
        )}
      </ul>
      {items.length === 0 && !adding && <Empty icon={ListChecks} text={t("No subtasks on this task yet.", "لا توجد مهام فرعية لهذه المهمة بعد.")} />}
    </Panel>
  )
}

/** "المهام الفرعية" on a create screen: "مهمة جديدة" adds an editable row (focused);
 *  Enter adds the next one. Rows are created with the project (as its tasks) or the
 *  task (as its checklist); blank rows are dropped. */
function DraftSubTasks({ items, onChange, forTask, isAr, t }: { items: string[]; onChange: (v: string[]) => void; forTask?: boolean; isAr: boolean; t: TFn }) {
  const refs = React.useRef<(HTMLInputElement | null)[]>([])
  const [focusIndex, setFocusIndex] = React.useState<number | null>(null)
  React.useEffect(() => {
    if (focusIndex == null) return
    const el = refs.current[focusIndex]
    el?.focus(); el?.scrollIntoView({ block: "nearest" })
    setFocusIndex(null)
  }, [focusIndex, items.length])

  const addAt = (i: number) => {
    // reuse an empty last row instead of stacking blanks
    if (items.length > 0 && items[items.length - 1].trim() === "" && i >= items.length) { setFocusIndex(items.length - 1); return }
    const next = [...items.slice(0, i), "", ...items.slice(i)]
    onChange(next); setFocusIndex(i)
  }
  const setAt = (i: number, v: string) => onChange(items.map((x, j) => (j === i ? v : x)))
  const removeAt = (i: number) => onChange(items.filter((_, j) => j !== i))
  const filled = items.filter((x) => x.trim()).length

  return (
    <Panel>
      <CardHeader icon={ListChecks} title={t("Subtasks", "المهام الفرعية")}
        actions={
          <button type="button" onClick={() => addAt(items.length)}
            className="btn-primary-grad inline-flex h-7 items-center gap-1.5 rounded-lg px-3 text-[12.5px] font-medium">
            <Plus className="size-3.5" />{t("New task", "مهمة جديدة")}
          </button>
        } />
      {/* room for the six rows drawn on the edit screen; longer lists scroll */}
      <ul className="mt-[18px] max-h-[300px] min-h-[300px] overflow-y-auto [scrollbar-width:thin]">
        {items.map((s, i) => (
          <li key={i} className="flex min-h-[50px] items-center gap-3 border-b border-input py-2">
            <span className="inline-flex size-5 shrink-0 rounded-full border-[1.5px] border-foreground/70" />
            <input
              ref={(el) => { refs.current[i] = el }}
              value={s}
              onChange={(e) => setAt(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); if (s.trim()) addAt(i + 1) }
                if (e.key === "Backspace" && s === "") { e.preventDefault(); removeAt(i); setFocusIndex(Math.max(0, i - 1)) }
              }}
              placeholder={t("Task title", "عنوان المهمة")}
              aria-label={t(`Subtask ${i + 1}`, `المهمة الفرعية ${i + 1}`)}
              className="h-9 min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
            />
            <button type="button" onClick={() => removeAt(i)} aria-label={t("Remove", "إزالة")}
              className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-icon hover:bg-foreground/5 hover:text-foreground">
              <X className="size-3.5" />
            </button>
          </li>
        ))}
        {items.length === 0 && (
          <li>
            <button type="button" onClick={() => addAt(0)}
              className="flex min-h-[50px] w-full items-center gap-3 py-2 text-start text-[13px] text-muted-foreground hover:text-foreground">
              <span className="inline-flex size-5 shrink-0 rounded-full border-[1.5px] border-dashed border-foreground/40" />
              {forTask
                ? t("Break the task into steps — they are created with it", "قسّم المهمة إلى خطوات — تُنشأ مع المهمة")
                : t("Add the project's first tasks — they are created with it", "أضف أول مهام المشروع — تُنشأ مع المشروع")}
            </button>
          </li>
        )}
      </ul>
      {filled > 0 && (
        <p className="mt-2 text-[12px] text-muted-foreground">
          {isAr ? `${filled} مهمة فرعية ستُنشأ مع ${forTask ? "المهمة" : "المشروع"}` : `${filled} subtask${filled === 1 ? "" : "s"} will be created with the ${forTask ? "task" : "project"}`}
        </p>
      )}
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
        actions={
          <button type="button" onClick={() => navigate(`/projects/${project.id}/milestones/new`)}
            className="btn-primary-grad inline-flex h-7 items-center gap-1.5 rounded-lg px-3 text-[12.5px] font-medium">
            <Plus className="size-3.5" />{t("New milestone", "معلم جديد")}
          </button>
        } />
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

/** "اقتراح المساعد" while creating a project — same card as on a project; ideas follow
 *  the category and name as they are typed. "Add as subtask" puts it in the Subtasks
 *  card (created with the project); "Reject" hides it for this draft. */
function DraftSuggestions({ category, name, added, onAdd, isAr, t }: {
  category: string; name: string; added: string[]; onAdd: (text: string) => void; isAr: boolean; t: TFn
}) {
  const [rejected, setRejected] = React.useState<string[]>([])
  const taken = new Set(added.map((x) => x.trim()))
  const ideas = draftProjectIdeas(category, name)
    .filter((i) => !rejected.includes(i.key) && !taken.has(isAr ? i.textAr : i.text))
    .slice(0, 2)
  return (
    <Panel>
      <CardHeader icon={Sparkles} title={t("Assistant suggestion", "اقتراح المساعد")} />
      <div className="mt-[18px] flex flex-col gap-4">
        {ideas.map((i) => (
          <div key={i.key} className="flex flex-col gap-3 rounded-[12px] bg-background/60 p-6 ring-1 ring-inset ring-input">
            <p className="text-[14px]">{isAr ? i.textAr : i.text}</p>
            <div className="grid grid-cols-2 gap-10 [&>button]:h-8">
              <Btn variant="primary" onClick={() => onAdd(isAr ? i.textAr : i.text)}>{t("Add as subtask", "أضفه كمهمة فرعية")}</Btn>
              <Btn onClick={() => setRejected((r) => [...r, i.key])}>{t("Reject", "رفض")}</Btn>
            </div>
          </div>
        ))}
        {ideas.length === 0 && <Empty icon={Sparkles} text={t("No more suggestions for this project.", "لا توجد اقتراحات أخرى لهذا المشروع.")} />}
      </div>
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
      category: project.category, sprint: currentSprintId(), createdISO: TASK_TODAY_ISO,
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
function Activity({ subjectId, isAr, t, asManager, task, disabled }: { subjectId: string; isAr: boolean; t: TFn; asManager: boolean; task?: Task; disabled?: boolean }) {
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
      {events.length === 0 && (
        // a new record keeps the drawn trail's room (three rows) so the card sits as on the edit screen
        <p className={cn("py-6 text-center text-[13px] text-muted-foreground", disabled && "flex min-h-[160px] items-center justify-center")}>
          {disabled ? t("No activity yet — the trail starts once it is created.", "لا يوجد نشاط بعد — يبدأ السجل بعد الإنشاء.") : t("No activity yet.", "لا يوجد نشاط بعد.")}
        </p>
      )}

      <div className="mt-[23px] flex items-center gap-3">
        <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-input bg-background ps-2 pe-3 focus-within:border-primary/60">
          <Initials text={ME.initials} className="size-6" />
          <input
            ref={inputRef} value={draft} onChange={(e) => setDraft(e.target.value)} disabled={disabled}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); post() } }}
            placeholder={disabled
              ? t("Comments open once it is created", "يُتاح التعليق بعد الإنشاء")
              : asManager && task?.assignee
                ? t(`Leave a comment for ${task.assignee}…`, `اترك تعليقًا لـ ${task.assigneeAr}…`)
                : t("Add a comment…", "أضف تعليقًا…")}
            aria-label={t("Add a comment", "أضف تعليقًا")}
            className="h-full min-w-0 flex-1 bg-transparent text-[13.5px] outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
          />
        </div>
        <button onClick={post} disabled={disabled || !draft.trim()}
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
