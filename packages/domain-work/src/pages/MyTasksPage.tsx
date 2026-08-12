import * as React from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Badge, Button, Card, Input } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import { AlertTriangle, CalendarClock, Check, CheckCircle2, Circle, ClipboardList, ListTodo, Loader, RotateCcw, Search, UserCircle2 } from "lucide-react"

import { countByStatus, isOverdue, type Task, type TaskStatus, toggleComplete, useTasks } from "../data/tasks"

type Tab = "all" | "open" | "in-progress" | "completed" | "overdue"

export default function MyTasksPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)

  const navigate = useNavigate()
  const tasks = useTasks()
  const counts = countByStatus(tasks)
  const [tab, setTab] = React.useState<Tab>("open")
  const [q, setQ] = React.useState("")

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
      <div className="mb-6">
        <div className="flex items-center gap-2 text-primary">
          <ClipboardList className="size-5" />
          <span className="text-xs font-semibold uppercase tracking-[0.14em]">{t("My Tasks", "مهامي")}</span>
        </div>
        <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight sm:text-3xl">{t("Your tasks & to-dos", "مهامك وأعمالك")}</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">{t("Everything assigned to you — open, in progress, overdue and completed, in one place.", "كل ما هو مُسند إليك — مفتوح، قيد التنفيذ، متأخر ومكتمل، في مكان واحد.")}</p>
      </div>

      {/* stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={ListTodo} value={counts.open} label={t("Open", "مفتوحة")} tone="primary" />
        <StatCard icon={Loader} value={counts.inProgress} label={t("In progress", "قيد التنفيذ")} tone="sky" />
        <StatCard icon={AlertTriangle} value={counts.overdue} label={t("Overdue", "متأخرة")} tone="rose" />
        <StatCard icon={CheckCircle2} value={counts.completed} label={t("Completed", "مكتملة")} tone="emerald" />
      </div>

      {/* toolbar: tabs + search */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex flex-wrap rounded-xl border border-border p-0.5">
          {TABS.map((tb) => (
            <button key={tb.id} onClick={() => setTab(tb.id)} aria-pressed={tab === tb.id}
              className={cn("inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors", tab === tb.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
              {isAr ? tb.ar : tb.label}
              <span className={cn("rounded-full px-1.5 text-[11px] tabular-nums", tab === tb.id ? "bg-primary-foreground/20" : "bg-muted")}>{tb.count}</span>
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search tasks…", "ابحث في المهام…")} className="w-56 ps-9" />
        </div>
      </div>

      {/* list */}
      <Card className="overflow-hidden py-0">
        {filtered.map((task, i) => (
          <TaskRow key={task.id} task={task} isAr={isAr} t={t} first={i === 0} onOpen={() => navigate(`/tasks/${task.id}`)} />
        ))}
        {filtered.length === 0 && (
          <div className="py-14 text-center">
            <CheckCircle2 className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">{t("Nothing here — you're all caught up.", "لا شيء هنا — أنجزت كل شيء.")}</p>
          </div>
        )}
      </Card>
    </main>
  )
}

function TaskRow({ task, isAr, t, first, onOpen }: { task: Task; isAr: boolean; t: (en: string, ar: string) => string; first: boolean; onOpen: () => void }) {
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
          <StatusBadge status={task.status} overdue={overdue} isAr={isAr} t={t} />
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground/70">
          <span>{isAr ? task.projectAr : task.project}</span>
          <span className="inline-flex items-center gap-1"><CalendarClock className="size-3" /><span className={cn(overdue && "font-semibold text-rose-500")}>{isAr ? task.dueAr : task.due}</span></span>
          <span className="inline-flex items-center gap-1"><UserCircle2 className="size-3" />{isAr ? task.assignedByAr : task.assignedBy}</span>
        </div>
      </div>

      {/* priority + action */}
      <div className="flex shrink-0 items-center gap-2">
        <PriorityChip priority={task.priority} isAr={isAr} t={t} />
        {done
          ? <Button variant="ghost" size="sm" className="gap-1.5" onClick={(e) => { stop(e); toggleComplete(task.id) }}><RotateCcw className="size-3.5" />{t("Reopen", "فتح")}</Button>
          : <Button variant="outline" size="sm" className="gap-1.5" onClick={(e) => { stop(e); toggleComplete(task.id) }}><Check className="size-3.5" />{t("Complete", "إنجاز")}</Button>}
      </div>
    </motion.div>
  )
}

function StatusBadge({ status, overdue, isAr, t }: { status: TaskStatus; overdue: boolean; isAr: boolean; t: (en: string, ar: string) => string }) {
  if (overdue) return <Badge variant="outline" className="border-rose-500/40 bg-rose-500/10 text-[10px] text-rose-500"><AlertTriangle className="me-1 size-2.5" />{t("Overdue", "متأخرة")}</Badge>
  if (status === "completed") return <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-[10px] text-emerald-500">{t("Completed", "مكتملة")}</Badge>
  if (status === "in-progress") return <Badge variant="outline" className="border-sky-500/40 bg-sky-500/10 text-[10px] text-sky-500">{t("In progress", "قيد التنفيذ")}</Badge>
  return <Badge variant="outline" className="text-[10px] text-muted-foreground/70">{t("Open", "مفتوحة")}</Badge>
}

function PriorityChip({ priority, isAr, t }: { priority: Task["priority"]; isAr: boolean; t: (en: string, ar: string) => string }) {
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
