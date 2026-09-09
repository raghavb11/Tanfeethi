import { useNavigate, useParams } from "react-router-dom"
import { Badge, Button, Card } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  AlertTriangle, ArrowLeft, CalendarClock, CheckCircle2, Circle, Loader, Pencil,
  Plus, UserRound,
} from "lucide-react"

import { STATUS_LABEL, getProjectById, useProjects } from "../data/projects"
import { isOverdue, type Task, type TaskStatus, useTasks } from "../data/tasks"

const GROUPS: { id: TaskStatus; en: string; ar: string; icon: typeof Circle; tone: string }[] = [
  { id: "open", en: "Open", ar: "مفتوحة", icon: Circle, tone: "text-muted-foreground/50" },
  { id: "in-progress", en: "In progress", ar: "قيد التنفيذ", icon: Loader, tone: "text-sky-500" },
  { id: "completed", en: "Completed", ar: "مكتملة", icon: CheckCircle2, tone: "text-emerald-500" },
]

/** One project: who owns it, how it is tracking, and every task filed under it. */
export default function ProjectDetailPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const { id = "" } = useParams()

  useProjects() // re-render when the master changes
  const p = getProjectById(id)
  const tasks = useTasks().filter((x) => x.projectId === id)

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

  const done = tasks.filter((x) => x.status === "completed").length
  const overdue = tasks.filter(isOverdue).length
  const pct = tasks.length === 0 ? 0 : Math.round((done / tasks.length) * 100)

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
          </div>
          {p.description && (
            <p className="mt-1.5 max-w-2xl text-[13px] text-muted-foreground">{isAr ? p.descriptionAr : p.description}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><UserRound className="size-3.5" />{isAr ? p.ownerAr : p.owner}</span>
            <span className="inline-flex items-center gap-1">
              <CalendarClock className="size-3.5" />{p.start} — {p.due}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" onClick={() => navigate(`/projects/${p.id}/edit`)}>
            <Pencil className="size-4" />{t("Edit", "تعديل")}
          </Button>
          <Button onClick={() => navigate(`/tasks/new?project=${p.id}&from=project`)}>
            <Plus className="size-4" />{t("Add task", "إضافة مهمة")}
          </Button>
        </div>
      </div>

      {/* progress strip */}
      <Card className="mb-5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            <Stat label={t("Tasks", "المهام")} value={String(tasks.length)} />
            <Stat label={t("Completed", "مكتملة")} value={String(done)} />
            <Stat label={t("Open", "مفتوحة")} value={String(tasks.length - done)} />
            <Stat label={t("Overdue", "متأخرة")} value={String(overdue)} tone={overdue > 0 ? "text-rose-500" : undefined} />
          </div>
          <div className="min-w-[12rem] flex-1">
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">{t("Progress", "الإنجاز")}</span>
              <span className="font-semibold tabular-nums">{pct}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </Card>

      {/* tasks under the project */}
      <div className="space-y-4">
        {GROUPS.map((g) => {
          const rows = tasks
            .filter((x) => x.status === g.id)
            .sort((a, b) => a.dueISO.localeCompare(b.dueISO))
          if (rows.length === 0) return null
          const Icon = g.icon
          return (
            <Card key={g.id} className="overflow-hidden p-0">
              <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
                <Icon className={cn("size-4", g.tone)} />
                <span className="text-[13px] font-semibold">{isAr ? g.ar : g.en}</span>
                <span className="ms-auto rounded-full bg-muted px-2 text-[11px] font-medium tabular-nums text-muted-foreground">
                  {rows.length}
                </span>
              </div>
              <div className="divide-y divide-border/40">
                {rows.map((task) => <Row key={task.id} task={task} isAr={isAr} t={t} onOpen={() => navigate(`/tasks/${task.id}`)} />)}
              </div>
            </Card>
          )
        })}

        {tasks.length === 0 && (
          <Card className="py-14 text-center">
            <p className="text-sm text-muted-foreground">{t("No tasks are filed under this project yet.", "لا توجد مهام مسجَّلة تحت هذا المشروع بعد.")}</p>
            <Button className="mt-4" onClick={() => navigate(`/tasks/new?project=${p.id}&from=project`)}>
              <Plus className="size-4" />{t("Add the first task", "أضف أول مهمة")}
            </Button>
          </Card>
        )}
      </div>
    </main>
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
