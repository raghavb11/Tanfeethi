import * as React from "react"
import { motion } from "framer-motion"

import { Button, Card, Input } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Coffee,
  FileText,
  Flame,
  Focus,
  Layers,
  Pause,
  Pin,
  Play,
  Plus,
  StickyNote,
  Target,
  Timer,
} from "lucide-react"

const ar = {
  hubLabel: "الإنتاجية",
  pageTitle: "مركز الإنتاجية",
  pageDesc: "ملاحظات سريعة، مهام، وكتل تركيز — كل شيء في صفحة واحدة هادئة.",
  good: "صباحك إنتاجي",
  todayDate: "الإثنين · 5 مايو",
  doneToday: "أنجزت",
  focusMin: "تركيز",
  notesAdded: "ملاحظة",
  agenda: "جدول اليوم",
  agendaDesc: "تركيز، اجتماعات، استراحات",
  notes: "ملاحظات سريعة",
  notesDesc: "اكتب الفكرة قبل ما تروح",
  notePh: "اكتب ملاحظة سريعة…",
  add: "أضف",
  tasks: "مهامي",
  tasksDesc: "تابع مهامك اليوم",
  newTask: "مهمة جديدة",
  taskPh: "اضف مهمة…",
  templates: "قوالب",
  templatesDesc: "ابدأ من قالب",
  recentDocs: "مستندات حديثة",
  focusTimer: "مؤقّت التركيز",
  focusTimerDesc: "25 دقيقة بدون مقاطعات",
  start: "ابدأ",
  pause: "إيقاف",
  done: "تم",
  inProgress: "جارٍ",
  upcoming: "قادم",
  goalsTrack: "أهداف",
  habitStreak: "أيام متتالية",
}

type ScheduleStatus = "done" | "current" | "upcoming"
type ScheduleType = "focus" | "meeting" | "break"

const schedule: { id: string; time: string; label: string; labelAr: string; status: ScheduleStatus; type: ScheduleType }[] = [
  { id: "s1", time: "09:00", label: "Morning planning", labelAr: "تخطيط الصباح", status: "done", type: "focus" },
  { id: "s2", time: "10:00", label: "Wave 2 standup", labelAr: "اجتماع الموجة الثانية", status: "done", type: "meeting" },
  { id: "s3", time: "11:30", label: "Deep work — strategy doc", labelAr: "تركيز — مستند الاستراتيجية", status: "current", type: "focus" },
  { id: "s4", time: "13:00", label: "Lunch break", labelAr: "استراحة الغداء", status: "upcoming", type: "break" },
  { id: "s5", time: "14:30", label: "1:1 with Maya", labelAr: "اجتماع فردي مع مايا", status: "upcoming", type: "meeting" },
]

const initialTasks: { id: string; text: string; textAr: string; done: boolean; priority?: "high" | "med" | "low" }[] = [
  { id: "t1", text: "Review Q2 budget reforecast", textAr: "راجع إعادة توقّع ميزانية الربع الثاني", done: false, priority: "high" },
  { id: "t2", text: "Reply to Sara about Wave 2", textAr: "ردّ على سارة بخصوص الموجة الثانية", done: false, priority: "high" },
  { id: "t3", text: "Update OKR template", textAr: "حدّث قالب الأهداف", done: true },
  { id: "t4", text: "Schedule 1:1 with Ahmed", textAr: "حدّد موعد اجتماع مع أحمد", done: false, priority: "med" },
  { id: "t5", text: "Read incident postmortem", textAr: "اقرأ تحليل ما بعد الحادث", done: true },
]

const initialNotes: { id: string; text: string; textAr: string; tone: "yellow" | "rose" | "blue" | "green"; pinned?: boolean }[] = [
  { id: "n1", text: "Follow up with vendor about Figma renewal terms.", textAr: "تابع مع مورد فيجما شروط التجديد.", tone: "yellow", pinned: true },
  { id: "n2", text: "Idea: monthly engineering office hours.", textAr: "فكرة: ساعات مكتبية شهرية للهندسة.", tone: "rose" },
  { id: "n3", text: "Hajj working hours — confirm with HR.", textAr: "ساعات الحج — أكّد مع الموارد البشرية.", tone: "blue" },
  { id: "n4", text: "Reach AI demo prep — 3 use cases.", textAr: "تحضير عرض ريتش — 3 حالات.", tone: "green" },
]

const templates: { id: string; title: string; titleAr: string; icon: React.ComponentType<{ className?: string }>; tone: string }[] = [
  { id: "tp1", title: "Meeting notes", titleAr: "محضر اجتماع", icon: FileText, tone: "bg-info/12 text-info dark:text-info" },
  { id: "tp2", title: "Weekly review", titleAr: "مراجعة أسبوعية", icon: Target, tone: "bg-warning/12 text-warning dark:text-warning" },
  { id: "tp3", title: "Project brief", titleAr: "موجز مشروع", icon: Briefcase, tone: "bg-success/12 text-success dark:text-success" },
  { id: "tp4", title: "Decision log", titleAr: "سجل القرارات", icon: Layers, tone: "bg-module/12 text-module dark:text-module" },
]

const recentDocs: { id: string; title: string; titleAr: string; updated: string; updatedAr: string }[] = [
  { id: "d1", title: "Wave 2 rollout plan", titleAr: "خطة إطلاق الموجة الثانية", updated: "2h ago", updatedAr: "قبل ساعتين" },
  { id: "d2", title: "Q2 OKRs draft", titleAr: "مسوّدة أهداف الربع 2", updated: "Yesterday", updatedAr: "أمس" },
  { id: "d3", title: "Vendor talking points", titleAr: "نقاط نقاش الموردين", updated: "2 days ago", updatedAr: "قبل يومين" },
]

function noteTone(t: "yellow" | "rose" | "blue" | "green") {
  if (t === "yellow") return "bg-warning/95 dark:bg-warning/15 border-warning/60 dark:border-warning/30"
  if (t === "rose") return "bg-error/95 dark:bg-error/15 border-error/60 dark:border-error/30"
  if (t === "green") return "bg-success/95 dark:bg-success/15 border-success/60 dark:border-success/30"
  return "bg-info/95 dark:bg-info/15 border-info/60 dark:border-info/30"
}

function scheduleIcon(type: ScheduleType) {
  if (type === "focus") return Focus
  if (type === "meeting") return Briefcase
  return Coffee
}

function scheduleTone(status: ScheduleStatus) {
  if (status === "done") return "bg-success/12 text-success dark:text-success"
  if (status === "current") return "bg-warning/15 text-warning dark:text-warning ring-2 ring-warning/25"
  return "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
}

function priorityDot(p?: "high" | "med" | "low") {
  if (p === "high") return "bg-error"
  if (p === "med") return "bg-warning"
  return "bg-slate-300 dark:bg-slate-600"
}

export default function ProductivityHub() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const [running, setRunning] = React.useState(false)
  const [seconds, setSeconds] = React.useState(25 * 60)
  const [noteDraft, setNoteDraft] = React.useState("")
  const [taskDraft, setTaskDraft] = React.useState("")
  const [notes, setNotes] = React.useState(initialNotes)
  const [tasks, setTasks] = React.useState(initialTasks)

  // tick down focus timer
  React.useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => window.clearInterval(id)
  }, [running])

  const minutesLeft = String(Math.floor(seconds / 60)).padStart(2, "0")
  const secLeft = String(seconds % 60).padStart(2, "0")
  const timerProgress = ((25 * 60 - seconds) / (25 * 60)) * 100

  const tasksDone = tasks.filter((t) => t.done).length
  const focusToday = 184

  const addNote = () => {
    if (!noteDraft.trim()) return
    const tones: ("yellow" | "rose" | "blue" | "green")[] = ["yellow", "rose", "blue", "green"]
    setNotes((prev) => [{ id: `n${Date.now()}`, text: noteDraft, textAr: noteDraft, tone: tones[prev.length % 4] }, ...prev])
    setNoteDraft("")
  }

  const addTask = () => {
    if (!taskDraft.trim()) return
    setTasks((prev) => [{ id: `t${Date.now()}`, text: taskDraft, textAr: taskDraft, done: false }, ...prev])
    setTaskDraft("")
  }

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }

  return (
    <div className="w-full space-y-6 px-4 pb-10 pt-6 sm:px-6 lg:px-10 lg:pt-8">
      <div className="space-y-1.5">
        <h1 className="text-[18px] font-bold leading-7">
          {isAr ? ar.pageTitle : "Productivity Hub"}
        </h1>
        <p className="text-[13px] text-muted-foreground">
          {isAr ? ar.pageDesc : "Quick notes, tasks, and focus blocks — everything in one calm page."}
        </p>
      </div>

      {/* Minimal greeting strip — no big gradient hero, just clean inline stats */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-4 rounded-xl border border-border/60 panel px-5 py-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <div className="text-[15px] font-semibold tracking-tight">
            {isAr ? ar.good : "Good morning, Khalid"}
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground/70">
            {isAr ? ar.todayDate : "Monday · May 5"}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-success" />
            <div>
              <div className="text-[16px] font-bold tabular-nums leading-none">{tasksDone}</div>
              <div className="text-[10px] text-muted-foreground/55">{isAr ? ar.doneToday : "Done"}</div>
            </div>
          </div>
          <div className="h-8 w-px bg-border/60" />
          <div className="flex items-center gap-2">
            <Timer className="size-4 text-warning" />
            <div>
              <div className="text-[16px] font-bold tabular-nums leading-none">{focusToday}<span className="ms-0.5 text-[10px] font-medium text-muted-foreground/55">{isAr ? "د" : "m"}</span></div>
              <div className="text-[10px] text-muted-foreground/55">{isAr ? ar.focusMin : "Focus"}</div>
            </div>
          </div>
          <div className="h-8 w-px bg-border/60" />
          <div className="flex items-center gap-2">
            <StickyNote className="size-4 text-error" />
            <div>
              <div className="text-[16px] font-bold tabular-nums leading-none">{notes.length}</div>
              <div className="text-[10px] text-muted-foreground/55">{isAr ? ar.notesAdded : "Notes"}</div>
            </div>
          </div>
          <div className="h-8 w-px bg-border/60" />
          <div className="flex items-center gap-2">
            <Flame className="size-4 text-warning" />
            <div>
              <div className="text-[16px] font-bold tabular-nums leading-none">11</div>
              <div className="text-[10px] text-muted-foreground/55">{isAr ? ar.habitStreak : "Streak"}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Two-col: Tasks + Agenda */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Tasks */}
        <Card className="rounded-xl ring-1 ring-foreground/10 lg:col-span-7">
          <div className="border-b border-border/60 px-5 py-4">
            <div className="flex items-center gap-2 text-[13px] font-semibold">
              <CheckCircle2 className="size-3.5 text-success" />
              {isAr ? ar.tasks : "My tasks"}
              <span className="ms-auto text-[11px] font-medium text-muted-foreground/65">
                {tasksDone}/{tasks.length}
              </span>
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground/65">{isAr ? ar.tasksDesc : "Track today's commitments"}</div>
          </div>
          <div className="px-5 py-3 space-y-2">
            <div className="flex gap-2">
              <Input
                value={taskDraft}
                onChange={(e) => setTaskDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                placeholder={isAr ? ar.taskPh : "Add a task…"}
                className="flex-1 h-9"
                dir={isAr ? "rtl" : "ltr"}
              />
              <Button onClick={addTask} disabled={!taskDraft.trim()} size="icon-sm" aria-label={isAr ? ar.add : "Add"}>
                <Plus className="size-4" />
              </Button>
            </div>
            <ul className="divide-y divide-border/40 -mx-5">
              {tasks.map((t, idx) => (
                <motion.li
                  key={t.id}
                  initial={{ opacity: 0, x: 4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15, delay: idx * 0.03 }}
                  className="group flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-muted/30"
                >
                  <button
                    type="button"
                    onClick={() => toggleTask(t.id)}
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      t.done ? "border-success bg-success text-white" : "border-muted-foreground/40 hover:border-success",
                    )}
                  >
                    {t.done && <CheckCircle2 className="size-3" />}
                  </button>
                  {!t.done && t.priority && (
                    <span className={cn("size-1.5 shrink-0 rounded-full", priorityDot(t.priority))} />
                  )}
                  <span className={cn(
                    "flex-1 text-[12.5px] leading-snug",
                    t.done && "text-muted-foreground/55 line-through",
                  )}>
                    {isAr ? t.textAr : t.text}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        </Card>

        {/* Agenda */}
        <Card className="rounded-xl ring-1 ring-foreground/10 lg:col-span-5">
          <div className="border-b border-border/60 px-5 py-4">
            <div className="flex items-center gap-2 text-[13px] font-semibold">
              <Calendar className="size-3.5 text-info" />
              {isAr ? ar.agenda : "Today's agenda"}
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground/65">{isAr ? ar.agendaDesc : "Focus, meetings, breaks"}</div>
          </div>
          <ul className="divide-y divide-border/40">
            {schedule.map((s, idx) => {
              const Icon = scheduleIcon(s.type)
              const tone = scheduleTone(s.status)
              return (
                <motion.li
                  key={s.id}
                  initial={{ opacity: 0, x: 4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.16, delay: idx * 0.03 }}
                  className="flex items-center gap-3 px-5 py-3"
                >
                  <span className="font-mono text-[10px] tabular-nums w-9 shrink-0 text-muted-foreground/55">{s.time}</span>
                  <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg", tone)}>
                    <Icon className="size-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className={cn(
                      "text-[12px] font-semibold leading-snug",
                      s.status === "done" && "text-muted-foreground/55 line-through",
                    )}>
                      {isAr ? s.labelAr : s.label}
                    </div>
                  </div>
                  {s.status === "current" && (
                    <span className="size-1.5 rounded-full bg-warning animate-pulse" />
                  )}
                </motion.li>
              )
            })}
          </ul>
        </Card>
      </div>

      {/* Focus timer + sticky notes */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Focus timer — quiet card */}
        <Card className="rounded-xl ring-1 ring-foreground/10 lg:col-span-5">
          <div className="border-b border-border/60 px-5 py-4">
            <div className="flex items-center gap-2 text-[13px] font-semibold">
              <Focus className="size-3.5 text-warning" />
              {isAr ? ar.focusTimer : "Focus timer"}
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground/65">{isAr ? ar.focusTimerDesc : "25 min · no interruptions"}</div>
          </div>
          <div className="flex flex-col items-center gap-4 px-5 py-6">
            {/* Timer ring */}
            <div className="relative size-36">
              <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/30" />
                <motion.circle
                  cx="50" cy="50" r="44" fill="none"
                  strokeWidth="6"
                  strokeLinecap="round"
                  className="text-warning"
                  stroke="currentColor"
                  strokeDasharray={2 * Math.PI * 44}
                  animate={{ strokeDashoffset: (2 * Math.PI * 44) * (1 - timerProgress / 100) }}
                  transition={{ duration: 0.4 }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-[28px] font-bold tabular-nums tracking-tight leading-none">{minutesLeft}:{secLeft}</div>
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/55">
                  {running ? (isAr ? "تركيز…" : "Focusing…") : (isAr ? "جاهز" : "Ready")}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setRunning((r) => !r)}
                size="sm"
                className="gap-1.5 bg-warning hover:bg-warning"
              >
                {running ? <Pause className="size-3.5" fill="currentColor" /> : <Play className="size-3.5" fill="currentColor" />}
                {running ? (isAr ? ar.pause : "Pause") : (isAr ? ar.start : "Start")}
              </Button>
              <Button
                onClick={() => { setRunning(false); setSeconds(25 * 60) }}
                size="sm"
                variant="outline"
              >
                {isAr ? "إعادة" : "Reset"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Sticky notes */}
        <Card className="rounded-xl ring-1 ring-foreground/10 lg:col-span-7">
          <div className="border-b border-border/60 px-5 py-4">
            <div className="flex items-center gap-2 text-[13px] font-semibold">
              <StickyNote className="size-3.5 text-error" />
              {isAr ? ar.notes : "Quick notes"}
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground/65">{isAr ? ar.notesDesc : "Capture before you forget"}</div>
          </div>
          <div className="px-5 py-4 space-y-4">
            <div className="flex gap-2">
              <Input
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addNote()}
                placeholder={isAr ? ar.notePh : "Type a quick note…"}
                className="flex-1 h-9"
                dir={isAr ? "rtl" : "ltr"}
              />
              <Button onClick={addNote} disabled={!noteDraft.trim()} size="icon-sm" aria-label={isAr ? ar.add : "Add"}>
                <Plus className="size-4" />
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {notes.map((n, idx) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.18, delay: idx * 0.04 }}
                  whileHover={{ y: -2, rotate: idx % 2 === 0 ? -1 : 1 }}
                  className={cn(
                    "relative rounded-xl border p-4 shadow-sm cursor-pointer transition-shadow hover:shadow-md",
                    noteTone(n.tone),
                  )}
                >
                  {n.pinned && <Pin className="absolute top-2 end-2 size-3 text-foreground/45" fill="currentColor" />}
                  <p className="text-[12.5px] leading-relaxed text-foreground/90">
                    {isAr ? n.textAr : n.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Templates + recent docs */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="rounded-xl ring-1 ring-foreground/10 lg:col-span-7">
          <div className="border-b border-border/60 px-5 py-4">
            <div className="flex items-center gap-2 text-[13px] font-semibold">
              <Layers className="size-3.5 text-module" />
              {isAr ? ar.templates : "Templates"}
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground/65">{isAr ? ar.templatesDesc : "Start from a template"}</div>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            {templates.map((t, idx) => {
              const Icon = t.icon
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.16, delay: idx * 0.04 }}
                  whileHover={{ y: -2 }}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/50 bg-muted/15 p-3 ring-1 ring-foreground/5 transition-all hover:border-module/30 hover:shadow-sm"
                >
                  <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", t.tone)}>
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] font-semibold">{isAr ? t.titleAr : t.title}</div>
                  </div>
                  <Plus className="size-3.5 text-muted-foreground/40" />
                </motion.div>
              )
            })}
          </div>
        </Card>

        <Card className="rounded-xl ring-1 ring-foreground/10 lg:col-span-5">
          <div className="border-b border-border/60 px-5 py-4">
            <div className="flex items-center gap-2 text-[13px] font-semibold">
              <FileText className="size-3.5 text-info" />
              {isAr ? ar.recentDocs : "Recent documents"}
            </div>
          </div>
          <ul className="divide-y divide-border/40">
            {recentDocs.map((d, idx) => (
              <motion.li
                key={d.id}
                initial={{ opacity: 0, x: 4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.16, delay: idx * 0.04 }}
                className="group flex cursor-pointer items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/30"
              >
                <FileText className="size-3.5 shrink-0 text-muted-foreground/45" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] font-semibold">{isAr ? d.titleAr : d.title}</div>
                  <div className="text-[10.5px] text-muted-foreground/55">{isAr ? d.updatedAr : d.updated}</div>
                </div>
              </motion.li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
