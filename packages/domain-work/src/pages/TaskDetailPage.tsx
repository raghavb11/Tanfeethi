import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Badge, Button, Card } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import { AlertTriangle, ArrowLeft, CalendarClock, Check, CheckCircle2, Circle, ClipboardList, Flag, FolderKanban, ListChecks, RotateCcw, UserCircle2 } from "lucide-react"

import { isOverdue, setTaskStatus, type TaskStatus, toggleChecklistItem, toggleComplete, useTasks } from "../data/tasks"

export default function TaskDetailPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const { id = "" } = useParams()
  const task = useTasks().find((x) => x.id === id)

  if (!task) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-16 text-center">
        <ClipboardList className="mx-auto size-10 text-muted-foreground/40" />
        <h1 className="mt-4 font-heading text-2xl font-semibold">{t("Task not found", "المهمة غير موجودة")}</h1>
        <Button className="mt-6" onClick={() => navigate("/tasks")}>{t("Back to My Tasks", "العودة إلى مهامي")}</Button>
      </main>
    )
  }

  const done = task.status === "completed"
  const overdue = isOverdue(task)
  const checklist = task.checklist ?? []
  const checkDone = checklist.filter((c) => c.done).length
  const checkPct = checklist.length ? Math.round((checkDone / checklist.length) * 100) : 0

  const priorityMeta = task.priority === "high"
    ? { cls: "text-rose-500", dot: "bg-rose-400", label: t("High", "عالية") }
    : task.priority === "medium"
      ? { cls: "text-amber-500", dot: "bg-amber-400", label: t("Medium", "متوسطة") }
      : { cls: "text-muted-foreground/60", dot: "bg-muted-foreground/40", label: t("Low", "منخفضة") }

  const statuses: { id: TaskStatus; label: string; ar: string }[] = [
    { id: "open", label: "Open", ar: "مفتوحة" },
    { id: "in-progress", label: "In progress", ar: "قيد التنفيذ" },
    { id: "completed", label: "Completed", ar: "مكتملة" },
  ]

  const details: [React.ComponentType<{ className?: string }>, string, React.ReactNode][] = [
    [FolderKanban, t("Project", "المشروع"), isAr ? task.projectAr : task.project],
    [CalendarClock, t("Due date", "تاريخ الاستحقاق"), <span className={cn(overdue && "font-semibold text-rose-500")}>{isAr ? task.dueAr : task.due}{overdue && ` · ${t("overdue", "متأخرة")}`}</span>],
    [UserCircle2, t("Assigned by", "أُسندت من"), isAr ? task.assignedByAr : task.assignedBy],
    [Flag, t("Priority", "الأولوية"), <span className={cn("inline-flex items-center gap-1.5 font-medium", priorityMeta.cls)}><span className={cn("size-1.5 rounded-full", priorityMeta.dot)} />{priorityMeta.label}</span>],
  ]

  const description = isAr
    ? (task.descriptionAr ?? "لا يوجد وصف لهذه المهمة.")
    : (task.description ?? "No description was provided for this task.")

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      {/* top bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => navigate("/tasks")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />{t("Back to My Tasks", "العودة إلى مهامي")}
        </button>
        {done
          ? <Button variant="outline" className="gap-1.5" onClick={() => toggleComplete(task.id)}><RotateCcw className="size-4" />{t("Reopen task", "إعادة فتح المهمة")}</Button>
          : <Button className="gap-1.5" onClick={() => toggleComplete(task.id)}><Check className="size-4" />{t("Mark complete", "وضع علامة مكتمل")}</Button>}
      </div>

      <div className="mb-4 flex items-center gap-2 text-primary">
        <ClipboardList className="size-4" />
        <span className="text-xs font-semibold uppercase tracking-[0.14em]">{t("Task", "مهمة")}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* main */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {overdue && <Badge variant="outline" className="border-rose-500/40 bg-rose-500/10 text-[11px] text-rose-500"><AlertTriangle className="me-1 size-3" />{t("Overdue", "متأخرة")}</Badge>}
            {done && <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-[11px] text-emerald-500">{t("Completed", "مكتملة")}</Badge>}
            {task.status === "in-progress" && !overdue && <Badge variant="outline" className="border-sky-500/40 bg-sky-500/10 text-[11px] text-sky-500">{t("In progress", "قيد التنفيذ")}</Badge>}
          </div>
          <h1 className={cn("mt-3 font-heading text-[1.7rem] font-bold leading-tight tracking-tight text-balance sm:text-[2rem]", done && "text-muted-foreground line-through")}>{isAr ? task.titleAr : task.title}</h1>

          <div className="mt-5">
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60">{t("Description", "الوصف")}</div>
            <p className="max-w-[68ch] text-[15px] leading-relaxed text-foreground/85">{description}</p>
          </div>

          {/* checklist */}
          {checklist.length > 0 && (
            <div className="mt-8">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-heading text-lg font-semibold"><ListChecks className="size-5 text-primary" />{t("Checklist", "قائمة المهام الفرعية")}</h2>
                <span className="text-xs text-muted-foreground">{checkDone}/{checklist.length} · {checkPct}%</span>
              </div>
              <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-muted/50"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${checkPct}%` }} /></div>
              <div className="space-y-1">
                {checklist.map((c) => (
                  <button key={c.id} onClick={() => toggleChecklistItem(task.id, c.id)} className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-start text-sm transition-colors hover:bg-muted/40">
                    {c.done ? <CheckCircle2 className="size-4.5 shrink-0 text-emerald-500" /> : <Circle className="size-4.5 shrink-0 text-muted-foreground/40" />}
                    <span className={cn(c.done && "text-muted-foreground line-through")}>{isAr ? c.labelAr : c.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* sidebar */}
        <aside className="space-y-4">
          <Card className="p-5">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">{t("Details", "التفاصيل")}</div>
            <dl className="space-y-3 text-sm">
              {details.map(([Icon, label, value], i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
                  <dt className="w-24 shrink-0 text-muted-foreground">{label}</dt>
                  <dd className="min-w-0 flex-1 font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="p-5">
            <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">{t("Status", "الحالة")}</div>
            <div className="flex flex-col gap-2">
              {statuses.map((s) => (
                <button key={s.id} onClick={() => setTaskStatus(task.id, s.id)} aria-pressed={task.status === s.id}
                  className={cn("flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors", task.status === s.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/60")}>
                  {isAr ? s.ar : s.label}
                  {task.status === s.id && <Check className="size-4" />}
                </button>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </main>
  )
}
