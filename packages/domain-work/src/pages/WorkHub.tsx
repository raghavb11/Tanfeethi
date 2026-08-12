import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"

import {
  Badge,
  Card,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import { KanbanBoard } from "../components/KanbanBoard"
import {
  aiNextActions,
  categories,
  kanbanColumns,
  myTasks,
  projects,
  type CategoryId,
  type TaskPriority,
} from "../data/mock/work"
import {
  AlertOctagon,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  Layers,
  ListChecks,
  Loader2,
  Mail,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react"

// ─── translations ────────────────────────────────────────────────────────────

const ar = {
  hubLabel: "مركز العمل",
  pageTitle: "التنفيذ والتسليم",
  pageDesc: "كل مهامك ومشاريعك في لوحة واحدة، مرتبة حسب الأولوية.",
  workflowStatus: "حالة سير العمل",
  workflowDesc: "سير الحوادث · نافذة الاستجابة",
  executePhase: "مرحلة التنفيذ",
  kpiActive: "مهام نشطة",
  kpiCompleted: "أنجزت اليوم",
  kpiBlocked: "محجوبة",
  kpiReview: "قيد المراجعة",
  kpiActiveDelta: (n: number) => `+${n} هذا الأسبوع`,
  kpiCompletedDelta: "أداء جيد",
  kpiBlockedDelta: "تحتاج تدخّل",
  kpiReviewDelta: "بانتظار المراجعة",
  filterByCategory: "تصفية حسب الفئة",
  all: "الكل",
  tabBoard: "اللوحة",
  tabTasks: "مهامي",
  tabProjects: "المشاريع",
  myTasksTitle: "مهامي",
  myTasksDesc: "مرتبة حسب الأولوية والتأثير",
  projectsTitle: "المشاريع النشطة",
  projectsDesc: "حالة الصحة والتقدم اللحظي",
  aiTitle: "إجراءات مقترحة بالذكاء الاصطناعي",
  aiDesc: "مرتبة حسب الأثر، اتفاقيات الخدمة، واكتشاف التكرار",
  updatedAgo: "آخر تحديث قبل 12 دقيقة",
  due: "موعد التسليم",
  team: "أعضاء الفريق",
  tasks: "مهمة",
  ofN: "من",
  progress: "التقدم",
  onTrack: "في الموعد",
  needsAttention: "تحتاج اهتمام",
  priority: {
    high: "عالية",
    medium: "متوسطة",
    low: "منخفضة",
  } as Record<TaskPriority, string>,
  // hero / hours
  todayLabel: "يومك",
  workingNow: "أعمل الآن",
  clockedAt: "بدأت الدوام",
  session: "الجلسة",
  target: "الهدف",
  hoursAbbr: "س",
  weekTotal: "إجمالي الأسبوع",
  ofTarget: "من الهدف",
  clockOut: "إنهاء الدوام",
  takeBreak: "استراحة",
  hoursTitle: "ساعات العمل",
  hoursDesc: "تتبع يومي وأسبوعي",
  // shifts
  shiftsTitle: "جدول المناوبات",
  shiftsDesc: "ساعات وموقع كل يوم",
  // expense
  category: "الفئة",
  receipt: "الإيصال",
  submit: "إرسال",
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function categoryTone(catId: CategoryId): { dot: string; chip: string; bar: string } {
  const cat = categories.find((c) => c.id === catId)
  switch (cat?.tone) {
    case "primary":
      return { dot: "bg-primary", chip: "bg-primary/12 text-primary border-primary/25", bar: "bg-primary" }
    case "emerald":
      return { dot: "bg-emerald-500", chip: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 border-emerald-500/25", bar: "bg-emerald-500" }
    case "blue":
      return { dot: "bg-blue-500", chip: "bg-blue-500/12 text-blue-600 dark:text-blue-400 border-blue-500/25", bar: "bg-blue-500" }
    case "amber":
      return { dot: "bg-amber-500", chip: "bg-amber-500/12 text-amber-600 dark:text-amber-400 border-amber-500/25", bar: "bg-amber-500" }
    case "violet":
      return { dot: "bg-violet-500", chip: "bg-violet-500/12 text-violet-600 dark:text-violet-400 border-violet-500/25", bar: "bg-violet-500" }
    case "cyan":
      return { dot: "bg-cyan-500", chip: "bg-cyan-500/12 text-cyan-600 dark:text-cyan-400 border-cyan-500/25", bar: "bg-cyan-500" }
    default:
      return { dot: "bg-muted-foreground", chip: "bg-muted text-muted-foreground border-border", bar: "bg-muted-foreground" }
  }
}

function priorityClasses(p: TaskPriority) {
  if (p === "high") return "border-rose-500/30 bg-rose-500/8 text-rose-500"
  if (p === "medium") return "border-amber-400/30 bg-amber-400/8 text-amber-500"
  return "border-border bg-muted/30 text-muted-foreground/70"
}

function statusClasses(status: string) {
  if (status === "in-progress") return "border-primary/30 bg-primary/10 text-primary"
  if (status === "blocked") return "border-rose-500/30 bg-rose-500/10 text-rose-500"
  if (status === "review") return "border-amber-400/30 bg-amber-400/10 text-amber-500"
  return "border-border/60 text-muted-foreground"
}

function statusIcon(status: string) {
  if (status === "in-progress") return <Loader2 className="size-3 animate-spin" />
  if (status === "blocked") return <AlertOctagon className="size-3" />
  if (status === "review") return <Eye className="size-3" />
  return <Clock className="size-3" />
}


function MyTasks({ isAr, filter }: { isAr: boolean; filter: CategoryId | null }) {
  const filtered = filter ? myTasks.filter((t) => t.category === filter) : myTasks

  return (
    <Card className="ring-1 ring-foreground/10">
      <div className="border-b border-border/60 px-5 py-4">
        <div className="text-[13px] font-semibold">{isAr ? ar.myTasksTitle : "My tasks"}</div>
        <div className="mt-0.5 text-[11px] text-muted-foreground/70">{isAr ? ar.myTasksDesc : "Sorted by impact · Reach assist on blockers"}</div>
      </div>
      <div className="divide-y divide-border/40">
        {filtered.map((t, idx) => {
          const cat = categories.find((c) => c.id === t.category)
          const tone = categoryTone(t.category)
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: idx * 0.04 }}
              whileHover={{ x: isAr ? -3 : 3 }}
              className="group flex flex-col gap-3 px-5 py-4 cursor-pointer transition-colors hover:bg-muted/20 md:flex-row md:items-center"
            >
              {/* Priority bar */}
              <div className={cn(
                "h-10 w-1 shrink-0 rounded-full self-stretch",
                t.priority === "high" && "bg-rose-500",
                t.priority === "medium" && "bg-amber-400",
                t.priority === "low" && "bg-muted-foreground/30",
              )} />

              {/* Main */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                    tone.chip,
                  )}>
                    <span className={cn("size-1.5 rounded-full", tone.dot)} />
                    {cat ? (isAr ? cat.labelAr : cat.label) : ""}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                      priorityClasses(t.priority),
                    )}
                  >
                    {isAr ? ar.priority[t.priority] : t.priority}
                  </Badge>
                </div>
                <div className="text-[13px] font-semibold leading-snug">
                  {isAr ? t.titleAr : t.title}
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted/40 max-w-[200px]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${t.progress}%` }}
                      transition={{ duration: 0.7, delay: 0.15 + idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
                      className={cn("h-full rounded-full", tone.bar)}
                    />
                  </div>
                  <span className="text-[10px] font-semibold tabular-nums text-muted-foreground/70">
                    {t.progress}%
                  </span>
                </div>
              </div>

              {/* Right meta */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
                  <CalendarDays className="size-3.5" />
                  <span>{isAr ? t.dueAr : t.due}</span>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                    statusClasses(t.status),
                  )}
                >
                  {statusIcon(t.status)}
                  {isAr ? t.statusLabelAr : t.statusLabel}
                </Badge>
                <ChevronRight className="size-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
              </div>
            </motion.div>
          )
        })}
        {filtered.length === 0 && (
          <div className="px-5 py-8 text-center text-[12px] text-muted-foreground/60">
            {isAr ? "لا توجد مهام في هذه الفئة" : "No tasks in this category"}
          </div>
        )}
      </div>
    </Card>
  )
}

// ─── Projects grid ───────────────────────────────────────────────────────────

function ProjectsGrid({ isAr, filter }: { isAr: boolean; filter: CategoryId | null }) {
  const filtered = filter ? projects.filter((p) => p.category === filter) : projects

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filtered.map((p, idx) => {
        const cat = categories.find((c) => c.id === p.category)
        const tone = categoryTone(p.category)
        return (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: idx * 0.06 }}
            whileHover={{ y: -3 }}
          >
            <Card className="h-full gap-0 overflow-hidden py-0 ring-1 ring-foreground/10 hover:shadow-lg hover:shadow-primary/5 transition-shadow">
              <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3">
                <div className="min-w-0 flex-1">
                  <span className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                    tone.chip,
                  )}>
                    <span className={cn("size-1.5 rounded-full", tone.dot)} />
                    {cat ? (isAr ? cat.labelAr : cat.label) : ""}
                  </span>
                  <div className="mt-2 text-[14px] font-semibold leading-snug">
                    {isAr ? p.nameAr : p.name}
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground/70">
                    {isAr ? p.phaseAr : p.phase}
                  </div>
                </div>
                <span
                  className={cn(
                    "mt-1 size-2.5 shrink-0 rounded-full ring-2 ring-offset-2 ring-offset-card",
                    p.health === "green" ? "bg-emerald-500 ring-emerald-500/30" : "bg-amber-400 ring-amber-400/30",
                  )}
                  aria-label={p.health}
                />
              </div>

              <div className="px-5 pb-3">
                <div className="mb-1.5 flex items-baseline justify-between text-[11px]">
                  <span className="font-semibold uppercase tracking-wider text-muted-foreground/60">
                    {isAr ? ar.progress : "Progress"}
                  </span>
                  <span className="tabular-nums font-bold text-foreground">{p.progress}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted/40">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${p.progress}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    className={cn("h-full rounded-full", tone.bar)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-border/50 bg-muted/20 px-5 py-3 dark:bg-muted/10">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Users className="size-3" />
                  <span><span className="font-semibold text-foreground">{p.team}</span> {isAr ? ar.team : "members"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground justify-end">
                  <CheckCircle2 className="size-3" />
                  <span><span className="font-semibold text-foreground tabular-nums">{p.tasks.done}</span><span className="opacity-50">/{p.tasks.total}</span></span>
                </div>
              </div>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

// ─── focus-tile detail data (tasks · emails · projects · meetings) ───────────

type FocusKey = "tasks" | "emails" | "projects" | "meetings"

type FocusDetailItem = {
  id: string
  title: string
  titleAr: string
  meta: string
  metaAr: string
  badge?: string
  badgeAr?: string
}

const focusDetails: Record<FocusKey, FocusDetailItem[]> = {
  tasks: [
    { id: "t1", title: "Finalize rollout deck v2", titleAr: "إتمام عرض الإطلاق", meta: "Strategy · due May 4", metaAr: "استراتيجية · 4 مايو", badge: "High", badgeAr: "عالية" },
    { id: "t2", title: "Approve contract redlines — Acme", titleAr: "اعتماد تعديلات عقد أكمي", meta: "Operations · waiting on Legal", metaAr: "عمليات · بانتظار القانونية", badge: "High", badgeAr: "عالية" },
    { id: "t3", title: "Reach pilot — IT cohort", titleAr: "تجربة ريتش — تقنية المعلومات", meta: "IT · due May 5", metaAr: "تقنية · 5 مايو" },
    { id: "t4", title: "Refresh incident runbook", titleAr: "تحديث دليل الحوادث", meta: "IT · due May 8", metaAr: "تقنية · 8 مايو" },
    { id: "t5", title: "Brand refresh — internal portal", titleAr: "تحديث الهوية — البوابة الداخلية", meta: "Design · due May 10", metaAr: "تصميم · 10 مايو" },
  ],
  emails: [
    { id: "e1", title: "Sara Al-Mutairi — Q2 Flight Operations Review", titleAr: "سارة المطيري — مراجعة عمليات الربع 2", meta: "9:14 AM · executive", metaAr: "9:14 ص · تنفيذية", badge: "Reply", badgeAr: "ردّ" },
    { id: "e2", title: "Ahmed Hassan — VIP Lounge Sign-off", titleAr: "أحمد حسن — موافقة صالة كبار الضيوف", meta: "8:42 AM · awaiting decision", metaAr: "8:42 ص · بانتظار قرار", badge: "Reply", badgeAr: "ردّ" },
    { id: "e3", title: "Maya Chen — Brand refresh feedback", titleAr: "مايا تشن — ملاحظات الهوية", meta: "Yesterday · awaiting your reply", metaAr: "أمس · بانتظار ردّك", badge: "Reply", badgeAr: "ردّ" },
    { id: "e4", title: "Legal — Contract review request", titleAr: "القانونية — طلب مراجعة عقد", meta: "2 days ago · awaiting your reply", metaAr: "قبل يومين · بانتظار ردّك", badge: "Reply", badgeAr: "ردّ" },
    { id: "e5", title: "Procurement — Vendor Contract Renewal", titleAr: "المشتريات — تجديد عقد مورد", meta: "Yesterday · 14 days left", metaAr: "أمس · بقي 14 يومًا" },
    { id: "e6", title: "IT Operations — System Maintenance", titleAr: "عمليات التقنية — صيانة النظام", meta: "Yesterday · informational", metaAr: "أمس · للعلم" },
  ],
  projects: [
    { id: "p1", title: "Digital check-in rollout", titleAr: "إطلاق التسجيل الرقمي", meta: "45% complete · 1 week behind", metaAr: "45٪ مكتمل · متأخر أسبوع", badge: "At risk", badgeAr: "في خطر" },
    { id: "p2", title: "Zero-trust uplift", titleAr: "ترقية الأمن المعدوم الثقة", meta: "35% complete · vendor delay", metaAr: "35٪ مكتمل · تأخر المورد", badge: "At risk", badgeAr: "في خطر" },
  ],
  meetings: [
    { id: "m1", title: "Wave 2 standup", titleAr: "اجتماع الموجة الثانية", meta: "10:00–10:15 · 8 attendees", metaAr: "10:00–10:15 · 8 حضور", badge: "Done", badgeAr: "انتهى" },
    { id: "m2", title: "Portfolio review", titleAr: "مراجعة المحفظة", meta: "11:30–12:30 · 12 attendees", metaAr: "11:30–12:30 · 12 حضور", badge: "Up next", badgeAr: "التالي" },
    { id: "m3", title: "1:1 with Maya", titleAr: "اجتماع فردي مع مايا", meta: "14:30–15:00 · in person", metaAr: "14:30–15:00 · حضوري" },
    { id: "m4", title: "Vendor sync — Figma", titleAr: "مزامنة مع مورد فيجما", meta: "16:00–16:30 · 4 attendees", metaAr: "16:00–16:30 · 4 حضور" },
  ],
}

// ─── focus summary data (tasks · emails · projects · meetings) ───────────────

const focusSummary = {
  tasks: { count: 5, hint: "2 high-priority", hintAr: "2 عالية الأولوية" },
  emails: { count: 3, hint: "from execs · oldest 2h", hintAr: "من القيادة · أقدمها قبل ساعتين" },
  projectsAtRisk: { count: 2, hint: "need a decision", hintAr: "تحتاج قرارًا" },
  meetings: { count: 4, hint: "next at 11:30", hintAr: "القادم 11:30" },
}

// ─── Today hero — focus summary canvas (no clock-in, no progress ring) ───────

function TodayFocusHero({
  isAr,
  openKey,
  onSelectKey,
}: {
  isAr: boolean
  openKey: FocusKey | null
  onSelectKey: (k: FocusKey) => void
}) {
  const tiles: {
    key: FocusKey
    label: string
    labelAr: string
    count: number
    hint: string
    hintAr: string
    icon: React.ComponentType<{ className?: string }>
    bg: string
    iconColor: string
  }[] = [
    { key: "tasks", label: "Tasks", labelAr: "مهام", count: focusSummary.tasks.count, hint: focusSummary.tasks.hint, hintAr: focusSummary.tasks.hintAr, icon: ListChecks, bg: "bg-rose-400/20", iconColor: "text-rose-200" },
    { key: "emails", label: "Emails", labelAr: "بريد", count: focusSummary.emails.count, hint: focusSummary.emails.hint, hintAr: focusSummary.emails.hintAr, icon: Mail, bg: "bg-sky-400/20", iconColor: "text-sky-200" },
    { key: "projects", label: "At-risk projects", labelAr: "مشاريع متأخرة", count: focusSummary.projectsAtRisk.count, hint: focusSummary.projectsAtRisk.hint, hintAr: focusSummary.projectsAtRisk.hintAr, icon: AlertTriangle, bg: "bg-amber-400/20", iconColor: "text-amber-200" },
    { key: "meetings", label: "Meetings today", labelAr: "اجتماعات اليوم", count: focusSummary.meetings.count, hint: focusSummary.meetings.hint, hintAr: focusSummary.meetings.hintAr, icon: CalendarDays, bg: "bg-violet-400/20", iconColor: "text-violet-200" },
  ]

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ "--hl": "#14b8a6" } as React.CSSProperties}
      className="highlight-card relative overflow-hidden rounded-3xl"
    >
      <div className="relative z-10 p-6 md:p-7">
        {/* Headline row */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="text-white">
            <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] uppercase text-white/75">
              <Sparkles className="size-3 text-amber-300" />
              {isAr ? "تركيزك اليوم" : "Today's focus"}
            </div>
            <h2 className="mt-1 text-[22px] font-bold tracking-tight md:text-[26px]">
              {isAr ? "ما يحتاج اهتمامك" : "What needs your attention"}
            </h2>
            <p className="mt-1 text-[12.5px] text-white/70">
              {isAr
                ? `${focusSummary.tasks.count + focusSummary.emails.count + focusSummary.projectsAtRisk.count} عنصر تحتاج إجراء · ${focusSummary.meetings.count} اجتماعات`
                : `${focusSummary.tasks.count + focusSummary.emails.count + focusSummary.projectsAtRisk.count} items need action · ${focusSummary.meetings.count} meetings ahead`}
            </p>
          </div>
        </div>

        {/* 4-up summary tiles */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map((t, idx) => {
            const Icon = t.icon
            const isOpen = openKey === t.key
            return (
              <motion.button
                key={t.key}
                type="button"
                onClick={() => onSelectKey(t.key)}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.1 + idx * 0.06 }}
                whileHover={{ y: -2 }}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl border p-3.5 text-start backdrop-blur-sm transition-all",
                  isOpen
                    ? "border-white/40 bg-white/15 shadow-md"
                    : "border-white/15 bg-white/[0.06] hover:bg-white/[0.12]",
                )}
              >
                <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", t.bg)}>
                  <Icon className={cn("size-5", t.iconColor)} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[24px] font-bold tabular-nums leading-none text-white">{t.count}</span>
                    <span className="text-[11px] font-medium text-white/65">{isAr ? t.labelAr : t.label}</span>
                  </div>
                  <div className="mt-1 truncate text-[10.5px] text-white/55">
                    {isAr ? t.hintAr : t.hint}
                  </div>
                </div>
                <ChevronRight className={cn(
                  "size-4 transition-all",
                  isOpen ? "rotate-90 text-white" : "text-white/40 group-hover:text-white",
                  isAr && !isOpen && "rotate-180",
                )} />
              </motion.button>
            )
          })}
        </div>

        {/* Inline expanded detail — rendered inside the same blue canvas */}
        <AnimatePresence initial={false}>
          {openKey && (
            <motion.div
              key={openKey}
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5">
                  {(() => {
                    const tile = tiles.find((tt) => tt.key === openKey)!
                    const Icon = tile.icon
                    return (
                      <div className="flex items-center gap-2 text-[12px] font-semibold text-white">
                        <span className={cn("flex size-6 items-center justify-center rounded-md", tile.bg)}>
                          <Icon className={cn("size-3.5", tile.iconColor)} />
                        </span>
                        <span>{isAr ? tile.labelAr : tile.label}</span>
                        <span className="text-white/55 font-normal">
                          · {focusDetails[openKey].length} {isAr ? "عنصر" : "items"}
                        </span>
                      </div>
                    )
                  })()}
                  <button
                    type="button"
                    onClick={() => onSelectKey(openKey)}
                    className="text-[11px] text-white/65 hover:text-white transition-colors"
                  >
                    {isAr ? "إغلاق" : "Close"} ✕
                  </button>
                </div>
                <ul className="divide-y divide-white/10">
                  {focusDetails[openKey].map((item, idx) => (
                    <motion.li
                      key={item.id}
                      initial={{ opacity: 0, x: 6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.16, delay: idx * 0.03 }}
                      className="group flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors hover:bg-white/10"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-[12.5px] font-semibold leading-snug text-white">
                          {isAr ? item.titleAr : item.title}
                        </div>
                        <div className="mt-0.5 text-[10.5px] text-white/60">{isAr ? item.metaAr : item.meta}</div>
                      </div>
                      {item.badge && (
                        <span className="shrink-0 rounded-full border border-white/30 bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white">
                          {isAr ? item.badgeAr : item.badge}
                        </span>
                      )}
                      <ChevronRight className={cn("size-4 text-white/35 group-hover:text-white transition-colors", isAr && "rotate-180")} />
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  )
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function WorkHub() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const [activeCategory, setActiveCategory] = React.useState<CategoryId | null>(null)
  const [openFocus, setOpenFocus] = React.useState<FocusKey | null>(null)
  const toggleFocus = (k: FocusKey) => setOpenFocus((cur) => (cur === k ? null : k))

  // category counts (across all kanban + tasks)
  const categoryCounts = React.useMemo(() => {
    const counts: Record<CategoryId, number> = {
      operations: 0, finance: 0, it: 0, people: 0, design: 0, strategy: 0,
    }
    kanbanColumns.forEach((col) => col.cards.forEach((c) => { counts[c.category]++ }))
    myTasks.forEach((t) => { counts[t.category]++ })
    return counts
  }, [])

  const totalCount = Object.values(categoryCounts).reduce((a, b) => a + b, 0)

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-7 md:px-8">
      {/* Page heading */}
      <div className="space-y-1.5">
        <h1 className="text-[22px] font-bold tracking-tight md:text-[26px]">
          {isAr ? ar.pageTitle : "Delivery & execution"}
        </h1>
        <p className="max-w-3xl text-[13px] text-muted-foreground">
          {isAr ? ar.pageDesc : "Your tasks and projects in one board, sorted by priority."}
        </p>
      </div>

      {/* Today focus canvas — clickable summary tiles + inline detail panel */}
      <TodayFocusHero isAr={isAr} openKey={openFocus} onSelectKey={toggleFocus} />

      {/* Category filter chips */}
      <div className="flex flex-col gap-2.5">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          {isAr ? ar.filterByCategory : "Filter by category"}
        </div>
        <div className="flex flex-wrap gap-2">
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveCategory(null)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all",
              activeCategory === null
                ? "border-primary/40 bg-primary/15 text-primary shadow-sm"
                : "border-border/60 bg-card text-muted-foreground hover:border-border hover:bg-muted/40",
            )}
          >
            <Layers className="size-3" />
            {isAr ? ar.all : "All"}
            <span className="rounded-full bg-background/60 px-1.5 text-[10px] font-bold tabular-nums">{totalCount}</span>
          </motion.button>
          {categories.map((c) => {
            const tone = categoryTone(c.id)
            const isActive = activeCategory === c.id
            return (
              <motion.button
                key={c.id}
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveCategory(isActive ? null : c.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all",
                  isActive
                    ? cn(tone.chip, "shadow-sm")
                    : "border-border/60 bg-card text-muted-foreground hover:border-border hover:bg-muted/40",
                )}
              >
                <span className={cn("size-1.5 rounded-full", tone.dot)} />
                {isAr ? c.labelAr : c.label}
                <span className="rounded-full bg-background/60 px-1.5 text-[10px] font-bold tabular-nums">
                  {categoryCounts[c.id]}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="board">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="board">{isAr ? ar.tabBoard : "Board"}</TabsTrigger>
            <TabsTrigger value="tasks">{isAr ? ar.tabTasks : "My tasks"}</TabsTrigger>
            <TabsTrigger value="projects">{isAr ? ar.tabProjects : "Projects"}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="board" className="mt-5 space-y-6">
          <KanbanBoard columns={kanbanColumns} isAr={isAr} filter={activeCategory} />
        </TabsContent>

        <TabsContent value="tasks" className="mt-5">
          <MyTasks isAr={isAr} filter={activeCategory} />
        </TabsContent>

        <TabsContent value="projects" className="mt-5">
          <ProjectsGrid isAr={isAr} filter={activeCategory} />
        </TabsContent>
      </Tabs>

      <Card className="ring-1 ring-foreground/10">
        <div className="flex flex-col gap-3 border-b border-border/60 px-5 py-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[13px] font-semibold">
              <motion.span
                animate={{ opacity: [1, 0.4, 1], scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-flex"
              >
                <Sparkles className="size-4 text-primary" />
              </motion.span>
              {isAr ? ar.aiTitle : "AI-generated next actions"}
            </div>
            <div className="text-[11px] text-muted-foreground/70">{isAr ? ar.aiDesc : "Ranked by blast radius, SLA, and duplicate detection."}</div>
          </div>
          <Badge variant="outline" className="gap-1.5 text-[11px] w-fit">
            <TrendingUp className="size-3" />
            {isAr ? ar.updatedAgo : "Updated 12m ago"}
          </Badge>
        </div>
        <div className="space-y-2.5 px-5 py-4">
          {aiNextActions.map((line, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: isAr ? 8 : -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.22, delay: idx * 0.06 }}
              whileHover={{ x: isAr ? -2 : 2 }}
              className="group flex gap-3 rounded-xl border border-border/60 bg-muted/20 p-4 cursor-pointer hover:border-primary/30 hover:bg-primary/[0.04] transition-colors"
            >
              <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Sparkles className="size-3" />
              </span>
              <div className="text-[13px] leading-relaxed flex-1">{isAr ? line.ar : line.en}</div>
              <ChevronRight className="size-4 self-center text-muted-foreground/30 group-hover:text-primary transition-colors" />
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  )
}
