import * as React from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { Badge, Button, Card } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import { AlertTriangle, ArrowLeft, CalendarClock, Check, ClipboardList, Flag, FolderKanban, MessageSquare, Pencil, RotateCcw, Send, TrendingUp, UserCircle2 } from "lucide-react"
import { Textarea } from "@reach/shared-ui"

import {
  addTaskComment, isOverdue, setTaskDue, setTaskStatus, TASK_TODAY_ISO,
  type TaskEvent, type TaskStatus, toggleComplete,
  useTaskEvents, useTasks,
} from "../data/tasks"

export default function TaskDetailPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const { id = "" } = useParams()
  const [params] = useSearchParams()
  const task = useTasks().find((x) => x.id === id)
  const events = useTaskEvents(id)

  // opened from the team board: the manager is commenting on someone else's task
  const asManager = params.get("from") === "manager"
  const backHref = asManager
    ? `/tasks?scope=team${task?.assigneeId ? `&report=${task.assigneeId}` : ""}`
    : "/tasks"
  const composerRef = React.useRef<HTMLTextAreaElement>(null)
  React.useEffect(() => {
    if (params.get("comment") === "1") composerRef.current?.focus()
  }, [params, task])

  // the update being written, and the optional percentage that goes with it
  const [draft, setDraft] = React.useState("")
  const [pct, setPct] = React.useState<number | null>(null)
  // what is typed in the free-entry box; empty means a preset (or nothing) is in use
  const [custom, setCustom] = React.useState("")
  // the day the update is about — today unless changed
  const [when, setWhen] = React.useState(TASK_TODAY_ISO)
  // inline edit of the task's own due date
  const [editingDue, setEditingDue] = React.useState(false)
  const post = () => {
    if (!draft.trim()) return
    addTaskComment(id, draft.trim(), pct ?? undefined, when, asManager)
    setDraft(""); setPct(null); setCustom(""); setWhen(TASK_TODAY_ISO)
  }

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
    [CalendarClock, t("Due date", "تاريخ الاستحقاق"),
      editingDue ? (
        <span className="flex flex-wrap items-center gap-1.5">
          <input
            type="date" defaultValue={task.dueISO} autoFocus
            aria-label={t("Due date", "تاريخ الاستحقاق")}
            onChange={(e) => { if (e.target.value) { setTaskDue(task.id, e.target.value); setEditingDue(false) } }}
            className="rounded-md border border-input bg-[var(--card-elevated)] px-2 py-1 text-[12.5px] tabular-nums outline-none focus:border-primary/60"
          />
          <button onClick={() => setEditingDue(false)} className="text-[11.5px] text-muted-foreground hover:text-foreground">
            {t("Cancel", "إلغاء")}
          </button>
        </span>
      ) : (
        <button
          onClick={() => setEditingDue(true)}
          className="group inline-flex items-center gap-1.5 rounded-md text-start transition-colors hover:text-primary"
          aria-label={t("Change the due date", "تغيير تاريخ الاستحقاق")}
        >
          <span className={cn(overdue && "font-semibold text-rose-500")}>
            {isAr ? task.dueAr : task.due}{overdue && ` · ${t("overdue", "متأخرة")}`}
          </span>
          <Pencil className="size-3 shrink-0 text-muted-foreground/0 transition-colors group-hover:text-primary" />
        </button>
      )],
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
        <button onClick={() => navigate(backHref)} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />
          {asManager ? t("Back to team tasks", "العودة إلى مهام الفريق")
                     : t("Back to My Tasks", "العودة إلى مهامي")}
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

          {/* progress updates */}
          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
                <MessageSquare className="size-5 text-primary" />{t("Progress updates", "تحديثات التقدم")}
              </h2>
              <span className="text-xs text-muted-foreground">
                {events.filter((e) => e.kind === "comment").length}
              </span>
            </div>

            {/* composer */}
            <Card className="p-3.5">
              <Textarea
                ref={composerRef}
                rows={2} value={draft} onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); post() } }}
                placeholder={asManager
                  ? t(`Leave a comment for ${task.assignee ?? ""}`, `اترك تعليقًا لـ ${task.assigneeAr ?? ""}`)
                  : t("What moved since the last update?", "ما الذي أُنجز منذ آخر تحديث؟")}
              />
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("Percent complete", "نسبة الإنجاز")}
                  </span>
                  {[0, 25, 50, 75, 100].map((v) => (
                    <button
                      key={v} type="button"
                      onClick={() => { setPct(pct === v ? null : v); setCustom("") }}
                      aria-pressed={pct === v}
                      className={cn("rounded-full border px-2 py-1 text-[11.5px] font-medium tabular-nums transition-colors",
                        pct === v ? "border-primary/40 bg-primary/12 text-primary"
                                  : "border-border text-muted-foreground hover:bg-muted/40")}
                    >
                      {v}%
                    </button>
                  ))}
                  {/* anything in between */}
                  <span className={cn("inline-flex items-center rounded-full border ps-2 pe-1.5 transition-colors",
                    custom !== "" ? "border-primary/40 bg-primary/12 text-primary" : "border-border")}>
                    <input
                      type="number" min={0} max={100} inputMode="numeric"
                      value={custom}
                      aria-label={t("Custom percent complete", "نسبة إنجاز مخصصة")}
                      onChange={(e) => {
                        const raw = e.target.value
                        if (raw === "") { setCustom(""); setPct(null); return }
                        // keep it inside 0–100 whatever gets typed or pasted
                        const n = Math.max(0, Math.min(100, Math.round(Number(raw))))
                        if (Number.isNaN(n)) return
                        setCustom(String(n)); setPct(n)
                      }}
                      placeholder={t("Other", "أخرى")}
                      className="w-14 bg-transparent py-1 text-[11.5px] font-medium tabular-nums outline-none placeholder:font-normal placeholder:text-muted-foreground"
                    />
                    <span className="text-[11.5px] font-medium">%</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 rounded-full border border-border ps-2 pe-1 py-0.5">
                    <CalendarClock className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="sr-only">{t("Update date", "تاريخ التحديث")}</span>
                    <input
                      type="date" value={when} onChange={(e) => setWhen(e.target.value || TASK_TODAY_ISO)}
                      aria-label={t("Update date", "تاريخ التحديث")}
                      className="bg-transparent py-1 text-[11.5px] font-medium tabular-nums outline-none"
                    />
                  </label>
                  <Button size="sm" disabled={!draft.trim()} onClick={post}>
                      <Send className="size-3.5" />
                    {asManager ? t("Post comment", "نشر التعليق") : t("Post update", "نشر التحديث")}
                  </Button>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground/70">
                {asManager
                  ? t(`${task.assignee ?? "The assignee"} is notified, and the comment stays on the record.`,
                      `سيتم إشعار ${task.assigneeAr ?? ""}، ويبقى التعليق في السجل.`)
                  : t("Everyone on this task sees the update, and it stays on the record.",
                      "يرى التحديث كل من يعمل على المهمة، ويبقى في السجل.")}
              </p>
            </Card>

            {/* newest first */}
            <div className="mt-4 space-y-3">
              {[...events].reverse().map((e) => (
                <UpdateRow key={e.id} event={e} isAr={isAr} t={t} />
              ))}
              {events.length === 0 && (
                <p className="py-6 text-center text-[13px] text-muted-foreground">
                  {t("No updates yet. The first one starts the trail.", "لا توجد تحديثات بعد.")}
                </p>
              )}
            </div>
          </div>
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

const STATUS_TEXT: Record<TaskStatus, { en: string; ar: string }> = {
  open: { en: "Open", ar: "مفتوحة" },
  "in-progress": { en: "In progress", ar: "قيد التنفيذ" },
  completed: { en: "Completed", ar: "مكتملة" },
}

/** One entry in the trail — a written update, or a recorded status move. */
function UpdateRow({ event, isAr, t }: {
  event: TaskEvent; isAr: boolean; t: (en: string, ar: string) => string
}) {
  const who = isAr ? event.authorAr : event.author
  const when = isAr ? event.atAr : event.at

  if (event.kind === "due") {
    return (
      <div className="flex items-center gap-2.5 ps-1 text-[12px] text-muted-foreground">
        <CalendarClock className="size-3.5 shrink-0" />
        <span>
          {t(`${who} moved the due date from ${event.fromDue} to ${event.toDue}`,
             `${who} غيّر تاريخ الاستحقاق من ${event.fromDue} إلى ${event.toDue}`)}
        </span>
        <span className="ms-auto shrink-0 text-[11px] text-muted-foreground/70">{when}</span>
      </div>
    )
  }

  if (event.kind === "status") {
    const from = event.from ? (isAr ? STATUS_TEXT[event.from].ar : STATUS_TEXT[event.from].en) : ""
    const to = event.to ? (isAr ? STATUS_TEXT[event.to].ar : STATUS_TEXT[event.to].en) : ""
    return (
      <div className="flex items-center gap-2.5 ps-1 text-[12px] text-muted-foreground">
        <RotateCcw className="size-3.5 shrink-0" />
        <span>
          {t(`${who} moved this from ${from} to ${to}`, `${who} نقل المهمة من ${from} إلى ${to}`)}
        </span>
        <span className="ms-auto shrink-0 text-[11px] text-muted-foreground/70">{when}</span>
      </div>
    )
  }

  return (
    <Card className="p-3.5">
      <div className="flex items-start gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/12 text-[11px] font-bold text-primary">
          {event.initials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[12.5px] font-semibold">{who}</span>
            <span className="text-[11px] text-muted-foreground/70">{when}</span>
            {event.manager && (
              <Badge variant="outline" className="border-primary/30 bg-primary/10 text-[10px] text-primary">
                {t("Manager", "المدير")}
              </Badge>
            )}
            {event.progress !== undefined && (
              <Badge variant="outline" className="gap-1 border-primary/30 bg-primary/10 text-[10px] text-primary">
                <TrendingUp className="size-2.5" />{event.progress}%
              </Badge>
            )}
          </div>
          <p className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed text-foreground/85">{event.text}</p>
        </div>
      </div>
    </Card>
  )
}
