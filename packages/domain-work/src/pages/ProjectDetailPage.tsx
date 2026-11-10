import { useNavigate, useParams } from "react-router-dom"
import { Badge, Button, Card } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  AlertTriangle, ArrowLeft, CalendarClock, CheckCircle2, Flag, Hand, Pencil, Plus, UserRound,
} from "lucide-react"

import { HealthPill } from "../components/HealthPill"
import {
  countHealth, HEALTH, type Milestone, milestoneHealth, milestonesFor, projectHealth,
  taskProgress, useMilestones,
} from "../data/milestones"
import { STATUS_LABEL, getProjectById, useProjects } from "../data/projects"
import { isOverdue, prettyDate, type Task, useTasks } from "../data/tasks"

/** One project: its milestones, each with a red / amber / green read-out, and
 *  the tasks under each. Anything not yet placed sits in its own group. */
export default function ProjectDetailPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const { id = "" } = useParams()

  useProjects()
  useMilestones()
  const p = getProjectById(id)
  const allTasks = useTasks()
  const tasks = allTasks.filter((x) => x.projectId === id)

  if (!p) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6">
        <p className="text-sm text-muted-foreground">{t("That project no longer exists.", "لم يعد هذا المشروع موجودًا.")}</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/projects")}>
          {t("Back to projects", "العودة إلى المشاريع")}
        </Button>
      </main>
    )
  }

  const milestones = milestonesFor(p.id)
  const liveIds = new Set(milestones.map((m) => m.id))
  const loose = tasks.filter((x) => !x.milestoneId || !liveIds.has(x.milestoneId))
  const done = tasks.filter((x) => x.status === "completed").length
  const overdue = tasks.filter(isOverdue).length
  const pct = tasks.length === 0 ? 0 : Math.round((done / tasks.length) * 100)
  const overall = projectHealth(p.id, allTasks)
  const tally = countHealth(p.id, allTasks)

  const addTask = (milestoneId?: string) =>
    navigate(`/tasks/new?project=${p.id}&from=project${milestoneId ? `&milestone=${milestoneId}` : ""}`)

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate("/projects")}
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />{t("Back to projects", "العودة إلى المشاريع")}
      </button>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">{isAr ? p.nameAr : p.name}</h1>
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11.5px] font-medium tabular-nums text-muted-foreground">{p.code}</span>
            <Badge variant="outline" className={cn("text-[11px]", STATUS_LABEL[p.status].chip)}>
              {isAr ? STATUS_LABEL[p.status].ar : STATUS_LABEL[p.status].en}
            </Badge>
            {overall && <HealthPill health={overall} isAr={isAr} />}
          </div>
          {p.description && (
            <p className="mt-1.5 max-w-2xl text-[13px] text-muted-foreground">{isAr ? p.descriptionAr : p.description}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><UserRound className="size-3.5" />{isAr ? p.ownerAr : p.owner}</span>
            <span className="inline-flex items-center gap-1"><CalendarClock className="size-3.5" />{p.start} — {p.due}</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => navigate(`/projects/${p.id}/edit`)}>
            <Pencil className="size-4" />{t("Edit", "تعديل")}
          </Button>
          <Button variant="outline" onClick={() => navigate(`/projects/${p.id}/milestones/new`)}>
            <Flag className="size-4" />{t("Add milestone", "إضافة معلم")}
          </Button>
          <Button onClick={() => addTask()}>
            <Plus className="size-4" />{t("Add task", "إضافة مهمة")}
          </Button>
        </div>
      </div>

      {/* summary: tasks, and how the milestones are tracking */}
      <Card className="mb-5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            <Stat label={t("Tasks", "المهام")} value={String(tasks.length)} />
            <Stat label={t("Completed", "مكتملة")} value={String(done)} />
            <Stat label={t("Overdue", "متأخرة")} value={String(overdue)} tone={overdue > 0 ? "text-rose-500" : undefined} />
            <Stat label={t("Milestones", "المعالم")} value={String(milestones.length)} />
          </div>
          <div className="min-w-[12rem] flex-1">
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">{t("Tasks done", "المهام المنجزة")}</span>
              <span className="font-semibold tabular-nums">{pct}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
        {milestones.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
            {(["red", "amber", "green", "complete", "not-started"] as const).map((h) => tally[h] > 0 && (
              <span key={h} className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-medium", HEALTH[h].chip)}>
                <span className={cn("size-2 rounded-full", HEALTH[h].dot)} />
                <span className="tabular-nums">{tally[h]}</span> {isAr ? HEALTH[h].ar : HEALTH[h].en}
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* timeline of milestones */}
      {milestones.length > 0 && <Timeline milestones={milestones} tasks={allTasks} isAr={isAr} project={p} />}

      <div className="space-y-4">
        {milestones.map((m) => (
          <MilestoneCard
            key={m.id} m={m} tasks={allTasks} isAr={isAr} t={t}
            onEdit={() => navigate(`/projects/${p.id}/milestones/${m.id}/edit`)}
            onAddTask={() => addTask(m.id)}
            onOpenTask={(tid) => navigate(`/tasks/${tid}`)}
          />
        ))}

        {loose.length > 0 && (
          <Card className="overflow-hidden p-0">
            <div className="flex flex-wrap items-center gap-2 border-b border-border/60 px-4 py-3">
              <span className="text-[13px] font-semibold">{t("Not in a milestone", "خارج المعالم")}</span>
              <span className="rounded-full bg-muted px-2 text-[11px] font-medium tabular-nums text-muted-foreground">{loose.length}</span>
              {milestones.length > 0 && (
                <span className="text-[11.5px] text-muted-foreground">
                  {t("Open a task to place it under a milestone.", "افتح المهمة لوضعها تحت معلم.")}
                </span>
              )}
            </div>
            <div className="divide-y divide-border/40">
              {loose
                .sort((a, b) => a.dueISO.localeCompare(b.dueISO))
                .map((task) => <Row key={task.id} task={task} isAr={isAr} t={t} onOpen={() => navigate(`/tasks/${task.id}`)} />)}
            </div>
          </Card>
        )}

        {tasks.length === 0 && milestones.length === 0 && (
          <Card className="py-14 text-center">
            <p className="text-sm text-muted-foreground">
              {t("Break the project into milestones, then add tasks under each one.",
                 "قسّم المشروع إلى معالم، ثم أضف المهام تحت كل منها.")}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button variant="outline" onClick={() => navigate(`/projects/${p.id}/milestones/new`)}>
                <Flag className="size-4" />{t("Add the first milestone", "أضف أول معلم")}
              </Button>
              <Button onClick={() => addTask()}><Plus className="size-4" />{t("Add a task", "أضف مهمة")}</Button>
            </div>
          </Card>
        )}
      </div>
    </main>
  )
}

/** Milestones laid along the project's dates, coloured by health. */
function Timeline({ milestones, tasks, isAr, project }: {
  milestones: Milestone[]; tasks: Task[]; isAr: boolean
  project: { startISO: string; dueISO: string }
}) {
  const at = (iso: string) => new Date(`${iso}T00:00:00`).getTime()
  // ISO dates sort as strings, so the ends are picked without a time-zone round trip
  const startIso = [project.startISO, ...milestones.map((m) => m.startISO)].sort()[0]
  const endIso = [project.dueISO, ...milestones.map((m) => m.dueISO)].sort().slice(-1)[0]
  const start = at(startIso)
  const end = at(endIso)
  const span = Math.max(1, end - start)
  const pos = (iso: string) => ((at(iso) - start) / span) * 100
  const todayIso = "2026-08-12"
  return (
    <Card className="mb-5 p-4">
      <div className="relative space-y-2">
        {milestones.map((m) => {
          const h = milestoneHealth(m, tasks)
          const left = pos(m.startISO)
          const width = Math.max(2, pos(m.dueISO) - left)
          return (
            <div key={m.id} className="grid grid-cols-[minmax(0,9rem)_1fr] items-center gap-3 sm:grid-cols-[minmax(0,14rem)_1fr]">
              <span className="truncate text-[12px] text-muted-foreground">
                <span className="tabular-nums">{m.code}</span> · {isAr ? m.nameAr : m.name}
              </span>
              <div className="relative h-5 rounded-md bg-muted/40">
                <div
                  className={cn("absolute inset-y-0 rounded-md opacity-80", HEALTH[h.health].bar)}
                  style={{ insetInlineStart: `${left}%`, width: `${width}%` }}
                  title={`${prettyDate(m.startISO)} – ${prettyDate(m.dueISO)}`}
                />
              </div>
            </div>
          )
        })}
        {/* today */}
        <div className="pointer-events-none absolute inset-y-0 grid w-full grid-cols-[minmax(0,9rem)_1fr] gap-3 sm:grid-cols-[minmax(0,14rem)_1fr]">
          <span />
          <div className="relative">
            <div className="absolute inset-y-[-4px] w-px bg-foreground/60" style={{ insetInlineStart: `${pos(todayIso)}%` }} />
          </div>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap justify-between gap-2 text-[11px] text-muted-foreground">
        <span>{prettyDate(startIso)}</span>
        <span>{isAr ? "الخط = اليوم" : "Line = today"}</span>
        <span>{prettyDate(endIso)}</span>
      </div>
    </Card>
  )
}

function MilestoneCard({ m, tasks, isAr, t, onEdit, onAddTask, onOpenTask }: {
  m: Milestone; tasks: Task[]; isAr: boolean; t: (en: string, ar: string) => string
  onEdit: () => void; onAddTask: () => void; onOpenTask: (id: string) => void
}) {
  const h = milestoneHealth(m, tasks)
  const rows = tasks.filter((x) => x.milestoneId === m.id).sort((a, b) => a.dueISO.localeCompare(b.dueISO))
  return (
    <Card className="overflow-hidden p-0">
      {/* a strip in the milestone's colour, so the page scans top to bottom */}
      <div className={cn("h-1", HEALTH[h.health].bar)} />
      <div className="border-b border-border/60 px-4 py-3">
        <div className="flex flex-wrap items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">{m.code}</span>
              <span className="text-[14px] font-semibold">{isAr ? m.nameAr : m.name}</span>
              <HealthPill health={h.health} isAr={isAr} overridden={h.overridden} size="sm" />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <CalendarClock className="size-3.5" />{prettyDate(m.startISO)} — {prettyDate(m.dueISO)}
              </span>
              <span>{t(`${h.done} of ${h.total} tasks done`, `${h.done} من ${h.total} مهمة منجزة`)}</span>
              {h.overdue > 0 && (
                <span className="font-semibold text-rose-500">{t(`${h.overdue} overdue`, `${h.overdue} متأخرة`)}</span>
              )}
            </div>
            {/* why it is this colour */}
            {h.reason && (
              <p className="mt-1.5 flex items-start gap-1.5 text-[12px] text-foreground/80">
                {h.overridden ? <Hand className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                              : <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />}
                <span>
                  {isAr ? h.reasonAr : h.reason}
                  {h.overridden && h.calculated !== h.health && (
                    <span className="text-muted-foreground">
                      {t(` · Calculated: ${HEALTH[h.calculated].en}`, ` · المحسوب: ${HEALTH[h.calculated].ar}`)}
                    </span>
                  )}
                </span>
              </p>
            )}
          </div>
          <div className="flex shrink-0 flex-wrap gap-1.5">
            <Button variant="outline" size="sm" onClick={onEdit}><Pencil className="size-3.5" />{t("Edit", "تعديل")}</Button>
            <Button variant="outline" size="sm" onClick={onAddTask}><Plus className="size-3.5" />{t("Task", "مهمة")}</Button>
          </div>
        </div>
        <div className="mt-2.5 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div className={cn("h-full rounded-full transition-all", HEALTH[h.health].bar)} style={{ width: `${h.pct}%` }} />
          </div>
          <span className="w-10 text-end text-[11.5px] font-semibold tabular-nums">{h.pct}%</span>
        </div>
      </div>

      {rows.length > 0 ? (
        <div className="divide-y divide-border/40">
          {rows.map((task) => <Row key={task.id} task={task} isAr={isAr} t={t} onOpen={() => onOpenTask(task.id)} />)}
        </div>
      ) : (
        <p className="px-4 py-4 text-[12.5px] text-muted-foreground">
          {t("No tasks yet.", "لا توجد مهام بعد.")}{" "}
          <button onClick={onAddTask} className="font-medium text-primary hover:underline">{t("Add one", "أضف مهمة")}</button>
        </p>
      )}
    </Card>
  )
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <p className={cn("font-heading text-xl font-bold tabular-nums", tone)}>{value}</p>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  )
}

function Row({ task, isAr, t, onOpen }: {
  task: Task; isAr: boolean; t: (en: string, ar: string) => string; onOpen: () => void
}) {
  const overdue = isOverdue(task)
  const done = task.status === "completed"
  const dot = task.priority === "high" ? "bg-rose-400" : task.priority === "medium" ? "bg-amber-400" : "bg-muted-foreground/40"
  return (
    <div
      role="button" tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === "Enter") onOpen() }}
      aria-label={isAr ? task.titleAr : task.title}
      className="flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 outline-none transition-colors hover:bg-muted/25 focus-visible:bg-muted/25"
    >
      <span className={cn("size-2 shrink-0 rounded-full", dot)} />
      <span className={cn("min-w-0 flex-1 truncate text-[13px] font-medium", done && "text-muted-foreground line-through")}>
        {isAr ? task.titleAr : task.title}
      </span>
      <span className="shrink-0 text-[11.5px] tabular-nums text-muted-foreground">{taskProgress(task)}%</span>
      <span className="shrink-0 text-[11.5px] text-muted-foreground">
        {task.assignee ? (isAr ? task.assigneeAr : task.assignee) : t("Me", "أنا")}
      </span>
      <span className={cn("inline-flex shrink-0 items-center gap-1 text-[11.5px]",
        overdue ? "font-semibold text-rose-500" : "text-muted-foreground/70")}>
        <CalendarClock className="size-3" />{isAr ? task.dueAr : task.due}
      </span>
      {overdue && (
        <Badge variant="outline" className="shrink-0 border-rose-500/40 bg-rose-500/10 text-[9.5px] text-rose-500">
          <AlertTriangle className="me-1 size-2.5" />{t("Overdue", "متأخرة")}
        </Badge>
      )}
    </div>
  )
}
