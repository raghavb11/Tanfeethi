import * as React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Button, Card, Input, Textarea } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import { ArrowLeft, Check } from "lucide-react"

import {
  TASK_TODAY_ISO, addTask, newTaskId, type TaskPriority, type TaskStatus,
} from "../data/tasks"
import { MANAGER, team } from "../data/team"
import { getProjectById } from "../data/projects"
import { ProjectPicker } from "../components/ProjectPicker"

const PRIORITIES: { id: TaskPriority; label: string; ar: string; dot: string }[] = [
  { id: "high", label: "High", ar: "عالية", dot: "bg-rose-400" },
  { id: "medium", label: "Medium", ar: "متوسطة", dot: "bg-amber-400" },
  { id: "low", label: "Low", ar: "منخفضة", dot: "bg-muted-foreground/40" },
]

const STATUSES: { id: TaskStatus; label: string; ar: string }[] = [
  { id: "open", label: "Open", ar: "مفتوحة" },
  { id: "in-progress", label: "In progress", ar: "قيد التنفيذ" },
  { id: "completed", label: "Completed", ar: "مكتملة" },
]

/** Format an ISO date the way the seeded tasks read. */
const pretty = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""
const prettyAr = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString("ar-EG", { month: "long", day: "numeric" }) : ""

/** Create a task. A full routed page, not a dialog. */
export default function TaskEditorPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const [title, setTitle] = React.useState("")
  const [titleAr, setTitleAr] = React.useState("")
  // a project is a master row, selected by id — never free text
  const [projectId, setProjectId] = React.useState(params.get("project") ?? "")
  const [dueISO, setDueISO] = React.useState(TASK_TODAY_ISO)
  const [priority, setPriority] = React.useState<TaskPriority>("medium")
  // the board's per-column "+" pre-selects the column it was pressed in
  const initial = params.get("status")
  // assigning on behalf of the team? the manager view passes the report through
  const fromManager = params.get("from") === "manager"
  const [assigneeId, setAssigneeId] = React.useState(params.get("assignee") ?? "")
  const assignee = team.find((m) => m.id === assigneeId)
  const project = getProjectById(projectId)
  // come back to whichever view the user opened this from
  const fromProject = params.get("from") === "project"
  const back = fromProject && projectId
    ? `/projects/${projectId}`
    : fromManager
      ? (assigneeId ? `/tasks?scope=team&report=${assigneeId}` : "/tasks?scope=team")
      : params.get("view") === "board" ? "/tasks?view=board" : "/tasks"
  const [status, setStatus] = React.useState<TaskStatus>(
    STATUSES.some((s) => s.id === initial) ? (initial as TaskStatus) : "open")
  // the editor stays mounted when the manager view links back in with a
  // different report or column, so follow the query string
  React.useEffect(() => {
    const st = params.get("status")
    if (STATUSES.some((x) => x.id === st)) setStatus(st as TaskStatus)
    setAssigneeId(params.get("assignee") ?? "")
    if (params.get("project")) setProjectId(params.get("project") as string)
  }, [params])

  const [description, setDescription] = React.useState("")

  const canSave = title.trim() !== "" && dueISO !== ""

  const save = () => {
    if (!canSave) return
    const id = newTaskId()
    addTask({
      id,
      title: title.trim(),
      titleAr: titleAr.trim() || title.trim(),
      projectId: project?.id,
      project: project ? project.name : "General",
      projectAr: project ? project.nameAr : "عام",
      due: pretty(dueISO), dueAr: prettyAr(dueISO), dueISO,
      priority, status,
      assigneeId: assignee?.id,
      assignee: assignee?.name, assigneeAr: assignee?.nameAr,
      assignedBy: assignee ? MANAGER.name : "Self",
      assignedByAr: assignee ? MANAGER.nameAr : "شخصي",
      description: description.trim() || undefined,
      descriptionAr: description.trim() || undefined,
    })
    navigate(back)
  }

  const label = (s: string) => (
    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{s}</label>
  )

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate(back)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />
          {fromProject ? t("Back to the project", "العودة إلى المشروع")
            : fromManager ? t("Back to team tasks", "العودة إلى مهام الفريق")
            : t("Back to my tasks", "العودة إلى مهامي")}
        </button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(back)}>{t("Cancel", "إلغاء")}</Button>
          <Button disabled={!canSave} onClick={save}>
            <Check className="size-4" />
            {assignee ? t("Assign task", "إسناد المهمة") : t("Create task", "إنشاء المهمة")}
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          {assignee ? t("Assign a task", "إسناد مهمة") : t("New task", "مهمة جديدة")}
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {assignee
            ? t(`It will appear in ${assignee.name}'s tasks straight away.`,
                `ستظهر فورًا في مهام ${assignee.nameAr}.`)
            : t("Add a task to your list. Only a title and a due date are required.",
                "أضف مهمة إلى قائمتك. العنوان وتاريخ الاستحقاق فقط مطلوبان.")}
        </p>
      </div>

      <Card className="p-5">
        <div className="space-y-5">
          <div>
            {label(t("Title", "العنوان"))}
            <Input value={title} onChange={(e) => setTitle(e.target.value)}
                   placeholder={t("What needs to be done?", "ما الذي يجب إنجازه؟")} />
          </div>

          <div>
            {label(t("Title in Arabic", "العنوان بالعربية"))}
            <Input value={titleAr} onChange={(e) => setTitleAr(e.target.value)} dir="rtl"
                   placeholder={t("Optional — falls back to the English title", "اختياري — يُستخدم العنوان الإنجليزي إن تُرك فارغًا")} />
          </div>

          {fromManager && (
            <div>
              {label(t("Assign to", "إسناد إلى"))}
              <div className="flex flex-wrap gap-1.5">
                {team.map((m) => (
                  <button
                    key={m.id} type="button" onClick={() => setAssigneeId(m.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[12.5px] font-medium transition-colors",
                      assigneeId === m.id ? "border-primary/40 bg-primary/12 text-primary"
                                          : "border-border text-muted-foreground hover:bg-muted/40")}
                  >
                    <span className="flex size-5 items-center justify-center rounded-full bg-foreground/[0.06] text-[9.5px] font-semibold text-foreground/70">
                      {m.initials}
                    </span>
                    {isAr ? m.nameAr : m.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              {label(t("Project", "المشروع"))}
              <ProjectPicker
                value={projectId} onChange={setProjectId} isAr={isAr} t={t}
                onCreate={() => navigate("/projects/new?from=task")}
              />
            </div>
            <div>
              {label(t("Due date", "تاريخ الاستحقاق"))}
              <Input type="date" value={dueISO} onChange={(e) => setDueISO(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              {label(t("Priority", "الأولوية"))}
              <div className="flex flex-wrap gap-1.5">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.id} type="button" onClick={() => setPriority(p.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                      priority === p.id ? "border-primary/40 bg-primary/12 text-primary"
                                        : "border-border text-muted-foreground hover:bg-muted/40")}
                  >
                    <span className={cn("size-1.5 rounded-full", p.dot)} />{isAr ? p.ar : p.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              {label(t("Status", "الحالة"))}
              <div className="flex flex-wrap gap-1.5">
                {STATUSES.map((st) => (
                  <button
                    key={st.id} type="button" onClick={() => setStatus(st.id)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                      status === st.id ? "border-primary/40 bg-primary/12 text-primary"
                                       : "border-border text-muted-foreground hover:bg-muted/40")}
                  >
                    {isAr ? st.ar : st.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            {label(t("Description", "الوصف"))}
            <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
                      placeholder={t("Any detail worth keeping with the task.", "أي تفاصيل تستحق الحفظ مع المهمة.")} />
          </div>
        </div>
      </Card>
    </main>
  )
}
