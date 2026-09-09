import * as React from "react"
import { motion } from "framer-motion"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Badge, Button, Card, Input } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import { AlertTriangle, CalendarClock, Check, CheckCircle2, Circle, ClipboardList, GripVertical, LayoutGrid, ListTodo, Loader, MessageSquare, Plus, RotateCcw, Rows3, Search, UserCircle2, UsersRound } from "lucide-react"

import { commentCount, countByStatus, isOverdue, myTasks, setTaskStatus, type Task, type TaskStatus, teamTasks, toggleComplete, useTasks } from "../data/tasks"
import { team } from "../data/team"

type Tab = "all" | "open" | "in-progress" | "completed" | "overdue"
const TAB_IDS: Tab[] = ["all", "open", "in-progress", "completed", "overdue"]
const isTab = (v: string | null): v is Tab => !!v && (TAB_IDS as string[]).includes(v)

/** The board shows every task by status, so the column set is the status set. */
type View = "list" | "board"
const BOARD_COLUMNS: { id: TaskStatus; label: string; ar: string; dot: string; ring: string }[] = [
  { id: "open", label: "Open", ar: "مفتوحة", dot: "bg-muted-foreground/40", ring: "ring-foreground/10" },
  { id: "in-progress", label: "In progress", ar: "قيد التنفيذ", dot: "bg-sky-500", ring: "ring-sky-500/20" },
  { id: "completed", label: "Completed", ar: "مكتملة", dot: "bg-emerald-500", ring: "ring-emerald-500/20" },
]

/** Whose work is on screen. The team scope only appears for a line manager. */
type Scope = "mine" | "team"

export default function MyTasksPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)

  const navigate = useNavigate()
  const all = useTasks()
  // ?tab=open lets the dashboard deep-link straight to a filter
  const [params, setParams] = useSearchParams()

  // mine and the team's live on the same page, behind this switch
  const manages = team.length > 0
  const scope: Scope = manages && params.get("scope") === "team" ? "team" : "mine"
  const report = params.get("report") ?? "all"

  const teamAll = teamTasks(all)
  const tasks = scope === "mine"
    ? myTasks(all)
    : report === "all" ? teamAll : teamAll.filter((x) => x.assigneeId === report)
  const counts = countByStatus(tasks)

  /** Keep tab and view when the scope or the person changes. */
  const setQuery = (next: Record<string, string | undefined>) => {
    const merged: Record<string, string> = { tab, ...(view === "board" ? { view: "board" } : {}) }
    if (scope === "team") merged.scope = "team"
    if (scope === "team" && report !== "all") merged.report = report
    Object.entries(next).forEach(([k, v]) => { if (v === undefined) delete merged[k]; else merged[k] = v })
    setParams(merged, { replace: true })
  }
  const openCount = (id: string) => teamAll.filter((x) => x.assigneeId === id && x.status !== "completed").length
  const overdueCount = (id: string) => teamAll.filter((x) => x.assigneeId === id && isOverdue(x)).length
  const tab: Tab = isTab(params.get("tab")) ? (params.get("tab") as Tab) : "open"
  const setTab = (next: Tab) => setQuery({ tab: next })
  const [q, setQ] = React.useState("")
  // ?view=board deep-links straight to the Kanban
  const view: View = params.get("view") === "board" ? "board" : "list"
  const setView = (next: View) => setQuery({ view: next === "board" ? "board" : undefined })
  const [dragId, setDragId] = React.useState<string | null>(null)
  const [overCol, setOverCol] = React.useState<TaskStatus | null>(null)

  /** The board ignores the status tabs — it is the status view. */
  const boardTasks = tasks.filter(
    (x) => q === "" || (isAr ? x.titleAr : x.title).toLowerCase().includes(q.toLowerCase()))

  const drop = (status: TaskStatus) => {
    if (dragId) setTaskStatus(dragId, status)
    setDragId(null); setOverCol(null)
  }

  const filtered = tasks
    .filter((x) => {
      if (tab === "overdue") return isOverdue(x)
      if (tab === "all") return true
      return x.status === tab
    })
    .filter((x) => q === "" || (isAr ? x.titleAr : x.title).toLowerCase().includes(q.toLowerCase()))
    // active first, then by due date
    .sort((a, b) => (a.status === "completed" ? 1 : 0) - (b.status === "completed" ? 1 : 0) || a.dueISO.localeCompare(b.dueISO))

  const TABS: { id: Tab; label: string; ar: string; count: number }[] = [
    { id: "all", label: "All", ar: "الكل", count: counts.all },
    { id: "open", label: "Open", ar: "مفتوحة", count: counts.open },
    { id: "in-progress", label: "In progress", ar: "قيد التنفيذ", count: counts.inProgress },
    { id: "overdue", label: "Overdue", ar: "متأخرة", count: counts.overdue },
    { id: "completed", label: "Completed", ar: "مكتملة", count: counts.completed },
  ]

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      {/* header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-primary">
            <ClipboardList className="size-5" />
            <span className="text-xs font-semibold uppercase tracking-[0.14em]">{t("Tasks", "المهام")}</span>
          </div>
          <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            {scope === "mine" ? t("Your tasks & to-dos", "مهامك وأعمالك") : t("Your team's tasks", "مهام فريقك")}
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {scope === "mine"
              ? t("Everything assigned to you \u2014 open, in progress, overdue and completed, in one place.", "كل ما هو مُسند إليك — مفتوح، قيد التنفيذ، متأخر ومكتمل، في مكان واحد.")
              : t("See what your team is carrying, move work between states, and assign new tasks.", "اطّلع على ما ينجزه فريقك، وانقل الأعمال بين الحالات، وأسند مهامًا جديدة.")}
          </p>
        </div>
        <Button
          className="shrink-0"
          onClick={() => navigate(scope === "team"
            ? `/tasks/new?from=manager${report !== "all" ? `&assignee=${report}` : ""}`
            : view === "board" ? "/tasks/new?view=board" : "/tasks/new")}
        >
          <Plus className="size-4" />
          {scope === "team" ? t("Assign task", "إسناد مهمة") : t("Add task", "إضافة مهمة")}
        </Button>
      </div>

      {/* whose tasks \u2014 only a manager sees the second option */}
      {manages && (
        <div className="mb-5 inline-flex rounded-xl border border-border p-0.5">
          {([["mine", ClipboardList, t("My tasks", "مهامي"), myTasks(all).filter((x) => x.status !== "completed").length],
             ["team", UsersRound, t("Team tasks", "مهام الفريق"), teamAll.filter((x) => x.status !== "completed").length]] as const).map(
            ([id, Icon, text, n]) => (
              <button
                key={id}
                onClick={() => setParams(id === "team" ? { scope: "team", tab } : { tab }, { replace: true })}
                aria-pressed={scope === id}
                className={cn("inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  scope === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
              >
                <Icon className="size-4" />{text}
                <span className={cn("rounded-full px-1.5 text-[11px] tabular-nums",
                  scope === id ? "bg-primary-foreground/20" : "bg-muted")}>{n}</span>
              </button>
            ))}
        </div>
      )}

      {/* the reporting line, when looking at the team */}
      {scope === "team" && (
        <div className="mb-5 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 pe-1 text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
            <UsersRound className="size-3.5" />{t("My team", "فريقي")}
          </span>
          <button
            onClick={() => setQuery({ report: undefined })}
            aria-pressed={report === "all"}
            className={cn("rounded-full border px-2.5 py-1 text-[12px] transition-colors",
              report === "all" ? "border-primary/40 bg-primary/12 font-medium text-primary"
                               : "border-border text-muted-foreground hover:bg-muted/40")}
          >
            {t("Everyone", "الجميع")}
          </button>
          {team.map((m) => {
            const late = overdueCount(m.id)
            return (
              <button
                key={m.id}
                onClick={() => setQuery({ report: m.id })}
                aria-pressed={report === m.id}
                className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] transition-colors",
                  report === m.id ? "border-primary/40 bg-primary/12 font-medium text-primary"
                                  : "border-border text-muted-foreground hover:bg-muted/40")}
              >
                <span className="flex size-5 items-center justify-center rounded-full bg-foreground/[0.06] text-[9.5px] font-semibold text-foreground/70">
                  {m.initials}
                </span>
                {isAr ? m.nameAr : m.name}
                {late > 0
                  ? <span className="rounded-full bg-rose-500/15 px-1.5 text-[10.5px] font-semibold tabular-nums text-rose-500">{late}</span>
                  : <span className="text-[10.5px] tabular-nums text-muted-foreground/70">{openCount(m.id)}</span>}
              </button>
            )
          })}
        </div>
      )}

      {/* stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={ListTodo} value={counts.open} label={t("Open", "مفتوحة")} tone="primary" />
        <StatCard icon={Loader} value={counts.inProgress} label={t("In progress", "قيد التنفيذ")} tone="sky" />
        <StatCard icon={AlertTriangle} value={counts.overdue} label={t("Overdue", "متأخرة")} tone="rose" />
        <StatCard icon={CheckCircle2} value={counts.completed} label={t("Completed", "مكتملة")} tone="emerald" />
      </div>

      {/* toolbar: tabs + search */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className={cn("inline-flex flex-wrap rounded-xl border border-border p-0.5", view === "board" && "hidden")}>
          {TABS.map((tb) => (
            <button key={tb.id} onClick={() => setTab(tb.id)} aria-pressed={tab === tb.id}
              className={cn("inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors", tab === tb.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
              {isAr ? tb.ar : tb.label}
              <span className={cn("rounded-full px-1.5 text-[11px] tabular-nums", tab === tb.id ? "bg-primary-foreground/20" : "bg-muted")}>{tb.count}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search tasks…", "ابحث في المهام…")} className="w-56 ps-9" />
          </div>
          {/* list / board switch */}
          <div className="inline-flex rounded-xl border border-border p-0.5">
            {([["list", Rows3, t("List", "قائمة")], ["board", LayoutGrid, t("Board", "لوحة")]] as const).map(
              ([id, Icon, label]) => (
                <button
                  key={id} onClick={() => setView(id as View)} aria-pressed={view === id}
                  className={cn("inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    view === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
                >
                  <Icon className="size-4" />{label}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* board */}
      {view === "board" && (
        <div className="grid gap-4 md:grid-cols-3">
          {BOARD_COLUMNS.map((col) => {
            const cards = boardTasks
              .filter((x) => x.status === col.id)
              .sort((a, b) => a.dueISO.localeCompare(b.dueISO))
            return (
              <div
                key={col.id}
                onDragOver={(e) => { e.preventDefault(); setOverCol(col.id) }}
                onDragLeave={() => setOverCol((c) => (c === col.id ? null : c))}
                onDrop={() => drop(col.id)}
                className={cn(
                  "rounded-2xl border p-2.5 transition-colors",
                  overCol === col.id ? "border-primary/40 bg-primary/[0.04]" : "border-border/70 bg-muted/20",
                )}
              >
                <div className="mb-2.5 flex items-center gap-2 px-1.5 pt-1">
                  <span className={cn("size-2 rounded-full", col.dot)} />
                  <span className="text-[13px] font-semibold">{isAr ? col.ar : col.label}</span>
                  <span className="ms-auto rounded-full bg-muted px-2 text-[11px] font-medium tabular-nums text-muted-foreground">
                    {cards.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {cards.map((task) => (
                    <BoardCard
                      key={task.id} task={task} isAr={isAr} t={t}
                      showWho={scope === "team" && report === "all"}
                      dragging={dragId === task.id}
                      onDragStart={() => setDragId(task.id)}
                      onDragEnd={() => { setDragId(null); setOverCol(null) }}
                      onOpen={() => navigate(scope === "team" ? `/tasks/${task.id}?from=manager` : `/tasks/${task.id}`)}
                    />
                  ))}
                  {cards.length === 0 && (
                    <div className="rounded-xl border border-dashed border-border/70 py-8 text-center text-[12px] text-muted-foreground/70">
                      {t("Drop a task here", "أفلت مهمة هنا")}
                    </div>
                  )}
                  <button
                    onClick={() => navigate(scope === "team"
                      ? `/tasks/new?status=${col.id}&from=manager${report !== "all" ? `&assignee=${report}` : ""}`
                      : `/tasks/new?status=${col.id}&view=board`)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border/70 py-2 text-[12px] font-medium text-muted-foreground/80 transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    <Plus className="size-3.5" />
                    {scope === "team" ? t("Assign task", "إسناد مهمة") : t("Add task", "إضافة مهمة")}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {view === "board" && (
        <p className="mt-3 text-center text-[11.5px] text-muted-foreground/70">
          {t("Drag a card between columns to change its status.", "اسحب البطاقة بين الأعمدة لتغيير حالتها.")}
        </p>
      )}

      {/* list */}
      {view === "list" && (
      <Card className="overflow-hidden py-0">
        {filtered.map((task, i) => (
          <TaskRow
            key={task.id} task={task} isAr={isAr} t={t} first={i === 0}
            showWho={scope === "team" && report === "all"}
            onOpen={() => navigate(scope === "team" ? `/tasks/${task.id}?from=manager` : `/tasks/${task.id}`)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="py-14 text-center">
            <CheckCircle2 className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">{t("Nothing here — you're all caught up.", "لا شيء هنا — أنجزت كل شيء.")}</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate("/tasks/new")}>
              <Plus className="size-4" />{t("Add task", "إضافة مهمة")}
            </Button>
          </div>
        )}
      </Card>
      )}
    </main>
  )
}

/** A single card on the board. Draggable; the whole card opens the task. */
function BoardCard({ task, isAr, t, showWho, dragging, onDragStart, onDragEnd, onOpen }: {
  task: Task; isAr: boolean; t: (en: string, ar: string) => string; showWho?: boolean
  dragging: boolean; onDragStart: () => void; onDragEnd: () => void; onOpen: () => void
}) {
  const overdue = isOverdue(task)
  const done = task.status === "completed"
  const comments = commentCount(task.id)
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen() } }}
      aria-label={isAr ? task.titleAr : task.title}
      className={cn(
        "group cursor-pointer rounded-xl border border-border/70 bg-card p-3 shadow-sm outline-none transition-all",
        "hover:-translate-y-0.5 hover:border-primary/30 focus-visible:border-primary/40",
        dragging && "opacity-40",
        overdue && !done && "border-rose-500/35",
      )}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="mt-0.5 size-3.5 shrink-0 cursor-grab text-muted-foreground/30" />
        <span className={cn("min-w-0 flex-1 text-[12.5px] font-medium leading-snug",
          done && "text-muted-foreground line-through")}>
          {isAr ? task.titleAr : task.title}
        </span>
        <PriorityDot priority={task.priority} />
      </div>

      <div className="mt-2 ps-5 text-[11px] text-muted-foreground/70">
        {showWho && task.assignee ? `${isAr ? task.assigneeAr : task.assignee} \u00b7 ` : ""}
        {isAr ? task.projectAr : task.project}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 ps-5 text-[11px]">
        <span className={cn("inline-flex items-center gap-1", overdue && !done ? "font-semibold text-rose-500" : "text-muted-foreground/70")}>
          <CalendarClock className="size-3" />{isAr ? task.dueAr : task.due}
        </span>
        {comments > 0 && (
          <span className="inline-flex items-center gap-1 text-muted-foreground/70">
            <MessageSquare className="size-3" />{comments}
          </span>
        )}
        {overdue && !done && (
          <Badge variant="outline" className="border-rose-500/40 bg-rose-500/10 text-[9.5px] text-rose-500">
            <AlertTriangle className="me-1 size-2.5" />{t("Overdue", "متأخرة")}
          </Badge>
        )}
      </div>
    </div>
  )
}

function PriorityDot({ priority }: { priority: Task["priority"] }) {
  const cls = priority === "high" ? "bg-rose-400" : priority === "medium" ? "bg-amber-400" : "bg-muted-foreground/40"
  return <span className={cn("mt-1 size-2 shrink-0 rounded-full", cls)} />
}

function TaskRow({ task, isAr, t, first, showWho, onOpen }: { task: Task; isAr: boolean; t: (en: string, ar: string) => string; first: boolean; showWho?: boolean; onOpen: () => void }) {
  const done = task.status === "completed"
  const overdue = isOverdue(task)
  const stop = (e: React.MouseEvent) => e.stopPropagation()
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen() } }}
      aria-label={isAr ? task.titleAr : task.title}
      className={cn("group flex cursor-pointer items-start gap-3 px-4 py-3.5 outline-none transition-colors hover:bg-primary/[0.03] focus-visible:bg-primary/[0.04]", !first && "border-t border-border/70")}
    >
      {/* complete checkbox */}
      <button onClick={(e) => { stop(e); toggleComplete(task.id) }} aria-label={done ? t("Reopen", "إعادة فتح") : t("Mark complete", "وضع علامة مكتمل")} className="mt-0.5 shrink-0">
        {done
          ? <CheckCircle2 className="size-5 text-emerald-500" />
          : <Circle className="size-5 text-muted-foreground/40 transition-colors group-hover:text-primary" />}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("text-[13px] font-medium leading-snug transition-colors group-hover:text-primary", done && "text-muted-foreground line-through group-hover:text-muted-foreground")}>{isAr ? task.titleAr : task.title}</span>
          <StatusBadge status={task.status} overdue={overdue} t={t} />
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground/70">
          <span>{isAr ? task.projectAr : task.project}</span>
          <span className="inline-flex items-center gap-1"><CalendarClock className="size-3" /><span className={cn(overdue && "font-semibold text-rose-500")}>{isAr ? task.dueAr : task.due}</span></span>
          <span className="inline-flex items-center gap-1">
            <UserCircle2 className="size-3" />
            {showWho && task.assignee ? (isAr ? task.assigneeAr : task.assignee) : (isAr ? task.assignedByAr : task.assignedBy)}
          </span>
        </div>
      </div>

      {/* priority + action */}
      <div className="flex shrink-0 items-center gap-2">
        <PriorityChip priority={task.priority} t={t} />
        {done
          ? <Button variant="ghost" size="sm" className="gap-1.5" onClick={(e) => { stop(e); toggleComplete(task.id) }}><RotateCcw className="size-3.5" />{t("Reopen", "فتح")}</Button>
          : <Button variant="outline" size="sm" className="gap-1.5" onClick={(e) => { stop(e); toggleComplete(task.id) }}><Check className="size-3.5" />{t("Complete", "إنجاز")}</Button>}
      </div>
    </motion.div>
  )
}

function StatusBadge({ status, overdue, t }: { status: TaskStatus; overdue: boolean; t: (en: string, ar: string) => string }) {
  if (overdue) return <Badge variant="outline" className="border-rose-500/40 bg-rose-500/10 text-[10px] text-rose-500"><AlertTriangle className="me-1 size-2.5" />{t("Overdue", "متأخرة")}</Badge>
  if (status === "completed") return <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-[10px] text-emerald-500">{t("Completed", "مكتملة")}</Badge>
  if (status === "in-progress") return <Badge variant="outline" className="border-sky-500/40 bg-sky-500/10 text-[10px] text-sky-500">{t("In progress", "قيد التنفيذ")}</Badge>
  return <Badge variant="outline" className="text-[10px] text-muted-foreground/70">{t("Open", "مفتوحة")}</Badge>
}

function PriorityChip({ priority, t }: { priority: Task["priority"]; t: (en: string, ar: string) => string }) {
  const meta = priority === "high"
    ? { cls: "text-rose-500", label: t("High", "عالية") }
    : priority === "medium"
      ? { cls: "text-amber-500", label: t("Medium", "متوسطة") }
      : { cls: "text-muted-foreground/50", label: t("Low", "منخفضة") }
  return <span className={cn("hidden items-center gap-1 text-[11px] font-medium sm:inline-flex", meta.cls)}><span className={cn("size-1.5 rounded-full", priority === "high" ? "bg-rose-400" : priority === "medium" ? "bg-amber-400" : "bg-muted-foreground/40")} />{meta.label}</span>
}

function StatCard({ icon: Icon, value, label, tone }: { icon: React.ComponentType<{ className?: string }>; value: number; label: string; tone: "primary" | "sky" | "rose" | "emerald" }) {
  const toneCls = tone === "primary" ? "bg-primary/12 text-primary" : tone === "sky" ? "bg-sky-500/12 text-sky-500" : tone === "rose" ? "bg-rose-500/12 text-rose-500" : "bg-emerald-500/12 text-emerald-500"
  return (
    <Card className="flex items-center gap-3 p-4">
      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", toneCls)}><Icon className="size-5" /></span>
      <div>
        <div className="text-[22px] font-bold tabular-nums leading-none">{value}</div>
        <div className="mt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/60">{label}</div>
      </div>
    </Card>
  )
}
