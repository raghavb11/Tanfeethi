import * as React from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"

import { Badge, Button } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import {
  approvals,
  displayName,
  displayNameAr,
  kpis,
  meetingsToday,
  quickLinks,
  upcomingEvents,
  type QuickLinkIcon,
} from "../data/mock/dashboard"
import { KpiCard } from "../components/dashboard/KpiCard"
import { ApprovalCard } from "../components/cards/ApprovalCard"
import { useShell } from "@reach/shell-context"
import {
  BarChart3,
  CalendarDays,
  CheckSquare,
  ChevronRight,
  Folder,
  Inbox,
  Mail,
  MessageSquare,
  Sparkles,
  Users,
  Video,
  Zap,
} from "lucide-react"

// ─── translations ─────────────────────────────────────────────────────────────

const ar = {
  home: "الرئيسية",
  greetMorning: "صباح الخير",
  greetAfternoon: "مساء الخير",
  greetEvening: "مساء الخير",
  priorityInbox: "صندوق الوارد المهم",
  unread: (n: number) => `${n} غير مقروءة`,
  viewAll: "عرض الكل",
  activeTasks: "المهام النشطة",
  projectPulse: "نبض المشاريع",
  allProjects: "كل المشاريع",
  smartApprovals: "الموافقات الذكية",
  aiRanked: "مرتبة بالذكاء الاصطناعي",
  todayMeetings: "اجتماعات اليوم",
  joinNextBlock: "انضم للجلسة القادمة",
  joinCall: "انضم للاجتماع",
  quickLinks: "روابط سريعة",
  apps: "التطبيقات",
  upcomingEvents: "الفعاليات القادمة",
  acrossOrg: "عبر المؤسسة",
  announcements: "الإعلانات",
  onTrack: "في الموعد",
  atRisk: "في خطر",
  updatesThisWeek: (n: number) => `${n} ${n === 1 ? "تحديث" : "تحديثات"} هذا الأسبوع`,
  today: "اليوم",
  inProgress: "قيد التنفيذ",
  pending: "معلق",
  notStarted: "لم يبدأ",
  spotlightBadge: "موارد بشرية",
  spotlightTitle: "تأكيد راتب رمضان",
  spotlightBody: "تم تأكيد تعديل راتبك خلال شهر رمضان وسيتم صرفه مع دورة رواتب 29 أبريل. تحقق من كشف راتبك للتفاصيل.",
  readUpdate: "عرض كشف الراتب",
  talkPeopleOps: "تواصل مع الموارد البشرية",
  liveNow: "مباشر الآن",
  kpiLabels: {
    tasks: "المهام المفتوحة",
    requests: "الطلبات المعلقة",
    emails: "البريد الإلكتروني",
    projects: "المشاريع",
  } as Record<string, string>,
  kpiDeltas: {
    tasks: "+٣ مقارنة بالأسبوع الماضي",
    requests: "مستوى الخدمة جيد",
    emails: "٤ غير مقروءة اليوم",
    projects: "٢ في خطر",
  } as Record<string, string>,
} as const

// ─── mock data ────────────────────────────────────────────────────────────────

const workEmails = [
  {
    id: "e1",
    from: "Sara Al-Mutairi",
    fromAr: "سارة المطيري",
    initials: "SM",
    subject: "Q2 Flight Operations Review",
    subjectAr: "مراجعة عمليات الطيران للربع الثاني",
    preview: "Please review the summary before Thursday's leadership session.",
    previewAr: "يرجى مراجعة الملخص قبل جلسة القيادة يوم الخميس.",
    time: "9:14 AM",
    unread: true,
  },
  {
    id: "e2",
    from: "Ahmed Hassan",
    fromAr: "أحمد حسن",
    initials: "AH",
    subject: "VIP Lounge Renovation — Sign-off",
    subjectAr: "تجديد صالة كبار الضيوف — طلب موافقة",
    preview: "The contractor submitted final scope. Awaiting your approval.",
    previewAr: "قدّم المقاول النطاق النهائي. بانتظار موافقتك.",
    time: "8:42 AM",
    unread: true,
  },
  {
    id: "e3",
    from: "Procurement Team",
    fromAr: "فريق المشتريات",
    initials: "PR",
    subject: "Vendor Contract Renewal — 14 Days",
    subjectAr: "تجديد عقد المورد — 14 يومًا",
    preview: "Three contracts up for renewal. Please review and action.",
    previewAr: "ثلاثة عقود قيد التجديد. يرجى المراجعة والإجراء.",
    time: "أمس",
    unread: false,
  },
  {
    id: "e4",
    from: "IT Operations",
    fromAr: "عمليات تقنية المعلومات",
    initials: "IT",
    subject: "System Maintenance — April 28",
    subjectAr: "صيانة النظام — 28 أبريل",
    preview: "Scheduled downtime 02:00–04:00 AST. No action needed.",
    previewAr: "توقف مجدول 02:00–04:00 بتوقيت الرياض. لا إجراء مطلوب.",
    time: "أمس",
    unread: false,
  },
]

const activeTasks = [
  {
    id: "t1",
    title: "Finalize Q2 operations brief",
    titleAr: "إتمام موجز عمليات الربع الثاني",
    project: "Operations · Q2",
    projectAr: "العمليات · الربع الثاني",
    due: "Today",
    status: "in-progress" as const,
    priority: "high" as const,
  },
  {
    id: "t2",
    title: "Review safety compliance audit",
    titleAr: "مراجعة تدقيق الامتثال للسلامة",
    project: "Safety & Standards",
    projectAr: "السلامة والمعايير",
    due: "Apr 25",
    status: "pending" as const,
    priority: "high" as const,
  },
  {
    id: "t3",
    title: "Approve IT hardware budget",
    titleAr: "الموافقة على ميزانية أجهزة تقنية المعلومات",
    project: "Finance · IT",
    projectAr: "المالية · تقنية المعلومات",
    due: "Apr 26",
    status: "pending" as const,
    priority: "medium" as const,
  },
  {
    id: "t4",
    title: "Complete mandatory training module",
    titleAr: "إكمال وحدة التدريب الإلزامي",
    project: "People Ops",
    projectAr: "عمليات الموارد البشرية",
    due: "Apr 30",
    status: "not-started" as const,
    priority: "low" as const,
  },
]

const projectPulse = [
  {
    id: "p1",
    name: "Terminal Expansion",
    nameAr: "توسعة المطار",
    phase: "Construction Phase 2",
    phaseAr: "مرحلة البناء الثانية",
    progress: 68,
    onTrack: true,
    owner: "Capital Projects",
    ownerAr: "مشاريع رأس المال",
    updates: 3,
  },
  {
    id: "p2",
    name: "Digital Check-in",
    nameAr: "تسجيل الوصول الرقمي",
    phase: "Rollout & Testing",
    phaseAr: "الإطلاق والاختبار",
    progress: 45,
    onTrack: false,
    owner: "Digital Services",
    ownerAr: "الخدمات الرقمية",
    updates: 1,
  },
  {
    id: "p3",
    name: "Staff Training Wave 2",
    nameAr: "التدريب الوظيفي — الموجة الثانية",
    phase: "Active Delivery",
    phaseAr: "التسليم النشط",
    progress: 91,
    onTrack: true,
    owner: "People Ops",
    ownerAr: "عمليات الموارد البشرية",
    updates: 5,
  },
]

const announcementsEnriched = [
  {
    id: "n1",
    titleEn: "Eid Al-Adha & Hajj holiday — office closure schedule",
    titleAr: "إجازة عيد الأضحى والحج — جدول إغلاق المكتب",
    img: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=600&h=280&q=85",
    imgThumb: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=80&h=80&q=80",
  },
  {
    id: "n2",
    titleEn: "Phishing drill results published in Trust Center",
    titleAr: "نتائج اختبار التصيد الاحتيالي في مركز الثقة",
    img: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&h=280&q=80",
    imgThumb: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=80&h=80&q=75",
  },
  {
    id: "n3",
    titleEn: "Ramadan working hours — effective April 29",
    titleAr: "ساعات العمل خلال رمضان — تسري من 29 أبريل",
    img: "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=600&h=280&q=85",
    imgThumb: "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=80&h=80&q=80",
  },
]

type TaskPriority = "high" | "medium" | "low"

const QUICK_ICONS: Record<QuickLinkIcon, React.ComponentType<{ className?: string }>> = {
  slack: MessageSquare,
  mail: Mail,
  calendar: CalendarDays,
  drive: Folder,
  teams: Users,
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function useGreeting(now: Date, isAr: boolean) {
  const h = now.getHours()
  if (isAr) {
    return h < 12 ? ar.greetMorning : ar.greetAfternoon
  }
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

function PriorityDot({ priority }: { priority: TaskPriority }) {
  return (
    <span
      className={cn(
        "mt-[3px] size-[7px] shrink-0 rounded-full",
        priority === "high" && "bg-rose-400",
        priority === "medium" && "bg-amber-400",
        priority === "low" && "bg-muted-foreground/30",
      )}
    />
  )
}

function SectionHeader({
  icon: Icon,
  title,
  badge,
  to,
  linkLabel = "View all",
}: {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  badge?: React.ReactNode
  to?: string
  linkLabel?: string
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {Icon && (
          <motion.span
            whileHover={{ scale: 1.15, rotate: 8 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="inline-flex"
          >
            <Icon className="size-[15px] text-primary/80" />
          </motion.span>
        )}
        <span className="text-[13px] font-semibold">{title}</span>
        {badge}
      </div>
      {to && (
        <Link
          to={to}
          className="flex items-center gap-0.5 text-[11px] font-medium text-muted-foreground/60 transition-colors hover:text-foreground"
        >
          {linkLabel}
          <ChevronRight className="size-3" />
        </Link>
      )}
    </div>
  )
}

// ─── Live pulse dot ───────────────────────────────────────────────────────────

function LivePulse() {
  return (
    <span className="relative inline-flex size-2">
      <motion.span
        animate={{ scale: [1, 2, 1], opacity: [0.8, 0, 0.8] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inline-flex size-full rounded-full bg-emerald-400 opacity-75"
      />
      <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
    </span>
  )
}

// ─── main ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const [clock, setClock] = React.useState(() => new Date())

  React.useEffect(() => {
    const id = window.setInterval(() => setClock(new Date()), 60_000)
    return () => window.clearInterval(id)
  }, [])

  const greeting = useGreeting(clock, isAr)
  const stamp = new Intl.DateTimeFormat(isAr ? "ar-SA" : "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(clock)

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-7 md:px-8">

      {/* ── Header ───────────────────────────────────────────── */}
      <header>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <h1 className="font-heading text-[30px] font-light leading-[1.04] tracking-[-0.02em] text-foreground md:text-[40px]">
            {greeting}{isAr ? "،" : ","}{" "}{isAr ? displayNameAr : displayName}
          </h1>
          <p className="mt-2 text-[13px] text-muted-foreground">{stamp}</p>
        </motion.div>
      </header>

      {/* ── KPI strip ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <KpiCard
            key={k.id}
            {...k}
            label={isAr ? (ar.kpiLabels[k.id] ?? k.label) : k.label}
            delta={isAr ? (ar.kpiDeltas[k.id] ?? k.delta) : k.delta}
            delay={i * 0.06}
            to={k.id === "tasks" ? "/tasks" : undefined}
          />
        ))}
      </div>

      {/* ── Hero spotlight — soft dark highlight card (People Ops green hue) ── */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        style={{ "--hl": "#22c55e" } as React.CSSProperties}
        className="highlight-card relative overflow-hidden rounded-3xl"
      >
        <div className="relative z-10 flex items-center gap-4 p-5 md:p-6">
          <div className="flex-1 space-y-2 md:max-w-xl">
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-1 rounded-full border border-green-400/25 bg-green-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-green-200"
            >
              {isAr ? ar.spotlightBadge : "People Ops"}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-heading text-[16px] font-semibold leading-tight tracking-tight text-white md:text-[17px]"
            >
              {isAr ? ar.spotlightTitle : "Ramadan Salary Confirmation"}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-[12.5px] leading-snug text-white/65"
            >
              {isAr ? ar.spotlightBody : "Your Ramadan salary adjustment is confirmed — April 29 payroll."}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-2 pt-1"
            >
              <Button size="sm">{isAr ? ar.readUpdate : "View payslip"}</Button>
              <Button size="sm" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">{isAr ? ar.talkPeopleOps : "Contact People Ops"}</Button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ── Main two-column layout ────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Left: 2/3 ─────────────────────────────────────────── */}
        <div className="space-y-8 lg:col-span-2">

          {/* Priority Inbox */}
          <section>
            <SectionHeader
              icon={Inbox}
              title={isAr ? ar.priorityInbox : "Priority inbox"}
              badge={
                <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] px-1.5 py-0">
                  {isAr
                    ? ar.unread(workEmails.filter((e) => e.unread).length)
                    : `${workEmails.filter((e) => e.unread).length} unread`}
                </Badge>
              }
              to="/mail"
              linkLabel={isAr ? ar.viewAll : "View all"}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {workEmails.map((email, i) => (
                <motion.div
                  key={email.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.06 }}
                  whileHover={{ y: -2, transition: { duration: 0.15 } }}
                  className={cn(
                    "group flex cursor-pointer gap-3 rounded-2xl border p-4 transition-all duration-150 hover:border-primary/30 hover:shadow-md",
                    email.unread ? "border-border/70 bg-card shadow-sm" : "border-border/50 bg-card",
                  )}
                >
                  <motion.span
                    whileHover={{ scale: 1.08 }}
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold",
                      email.unread ? "bg-primary/12 text-primary ring-1 ring-primary/20" : "bg-muted/60 text-muted-foreground",
                    )}
                  >
                    {email.initials}
                  </motion.span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className={cn("truncate text-[12px] font-semibold", email.unread ? "text-foreground" : "text-foreground/80")}>
                        {isAr ? email.fromAr : email.from}
                      </span>
                      <span className="shrink-0 text-[10px] text-muted-foreground/60">{email.time}</span>
                    </div>
                    <p className={cn("truncate text-[12px]", email.unread ? "font-medium text-foreground/85" : "text-foreground/70")}>
                      {isAr ? email.subjectAr : email.subject}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground/75">
                      {isAr ? email.previewAr : email.preview}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Smart Approvals — grouped with the inbox as "act on this" */}
          <section>
            <SectionHeader
              title={isAr ? ar.smartApprovals : "Smart approvals"}
              badge={
                <Badge variant="outline" className="border-primary/25 bg-primary/8 text-[10px] text-primary gap-1">
                  <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                    <Sparkles className="size-2.5" />
                  </motion.span>
                  {isAr ? ar.aiRanked : "AI-ranked"}
                </Badge>
              }
            />
            <div className="space-y-3">
              {approvals.map((a, i) => (
                <ApprovalCard key={a.id} {...a} delay={i * 0.06} isAr={isAr} />
              ))}
            </div>
          </section>

          {/* Active Tasks */}
          <section>
            <SectionHeader
              icon={CheckSquare}
              title={isAr ? ar.activeTasks : "Active tasks"}
              to="/work"
              linkLabel={isAr ? ar.viewAll : "View all"}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {activeTasks.map((task, i) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.06 }}
                  whileHover={{ y: -2, transition: { duration: 0.15 } }}
                  className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border/60 panel p-4 transition-all hover:border-primary/25 hover:shadow-md"
                >
                  <PriorityDot priority={task.priority} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium leading-snug">{isAr ? task.titleAr : task.title}</p>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground/55">
                      <span>{isAr ? task.projectAr : task.project}</span>
                      <span>·</span>
                      <span className={cn("font-medium", task.due === "Today" ? "text-primary" : "")}>
                        {task.due === "Today" ? (isAr ? ar.today : "Today") : task.due}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "shrink-0 self-start text-[10px] capitalize",
                      task.status === "in-progress" && "border-primary/25 bg-primary/8 text-primary",
                      task.status === "pending" && "border-border text-muted-foreground/70",
                      task.status === "not-started" && "border-border/40 text-muted-foreground/40",
                    )}
                  >
                    {isAr
                      ? task.status === "in-progress" ? ar.inProgress
                        : task.status === "pending" ? ar.pending
                        : ar.notStarted
                      : task.status.replace("-", " ")}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Project Pulse */}
          <section>
            <SectionHeader
              icon={BarChart3}
              title={isAr ? ar.projectPulse : "Project pulse"}
              to="/work"
              linkLabel={isAr ? ar.allProjects : "All projects"}
            />
            <div className="rounded-2xl border border-border/60 panel divide-y divide-border/50 overflow-hidden">
              {projectPulse.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: isAr ? 12 : -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.22, delay: i * 0.07 }}
                  className="flex flex-col gap-2.5 px-5 py-4 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold">{isAr ? project.nameAr : project.name}</span>
                        <motion.span
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5 }}
                          className={cn("size-[6px] rounded-full", project.onTrack ? "bg-emerald-400" : "bg-amber-400")}
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground/55 mt-0.5">
                        {isAr ? project.phaseAr : project.phase} · {isAr ? project.ownerAr : project.owner}
                      </p>
                    </div>
                    <div className="shrink-0 text-end">
                      <span className="text-[14px] font-bold tabular-nums">{project.progress}%</span>
                      <p className={cn("text-[10px] font-medium", project.onTrack ? "text-emerald-500" : "text-amber-500")}>
                        {isAr ? (project.onTrack ? ar.onTrack : ar.atRisk) : (project.onTrack ? "On track" : "At risk")}
                      </p>
                    </div>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted/50">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress}%` }}
                      transition={{ duration: 0.8, delay: 0.15 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      className={cn("h-full rounded-full", project.onTrack ? "bg-primary" : "bg-amber-400")}
                    />
                  </div>
                  {project.updates > 0 && (
                    <p className="text-[10px] text-muted-foreground/40">
                      {isAr ? ar.updatesThisWeek(project.updates) : `${project.updates} update${project.updates !== 1 ? "s" : ""} this week`}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </section>

        </div>

        {/* Right sidebar ──────────────────────────────────────── */}
        <aside className="space-y-5">

          {/* Today's meetings — lead the rail with what's happening now */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.1 }}
            className="rounded-2xl border border-border/60 panel overflow-hidden"
          >
            <div className="border-b border-border/50 px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold">{isAr ? ar.todayMeetings : "Today's meetings"}</p>
                <p className="text-[11px] text-muted-foreground/60 mt-0.5">{isAr ? ar.joinNextBlock : "Join the next live block"}</p>
              </div>
              <LivePulse />
            </div>
            <div className="space-y-3 p-4">
              {meetingsToday.map((m) => (
                <div key={m.id} className="rounded-xl border border-border/50 bg-muted/20 p-3.5 dark:bg-muted/30">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[13px] font-semibold">{isAr && m.titleAr ? m.titleAr : m.title}</p>
                      <p className="text-[11px] text-muted-foreground/60">{m.time}</p>
                    </div>
                    <div className="flex -space-x-2">
                      {m.faces.map((src, fi) => (
                        <img key={src} src={src} alt="" className="size-7 rounded-full object-cover ring-2 ring-background" style={{ zIndex: m.faces.length - fi }} loading="lazy" />
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button
                      size="sm"
                      variant={m.accent === "primary" ? "default" : "outline"}
                      className="gap-1.5"
                    >
                      <Video className="size-3.5" />
                      {isAr ? ar.joinCall : "Join call"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Announcements */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.15 }}
            className="rounded-2xl border border-border/60 panel overflow-hidden"
          >
            <div className="border-b border-border/50 px-4 py-3 flex items-center gap-2">
              <motion.span
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              >
                <Zap className="size-3.5 text-primary" />
              </motion.span>
              <p className="text-[13px] font-semibold">{isAr ? ar.announcements : "Announcements"}</p>
            </div>
            <ul className="divide-y divide-border/40">
              {announcementsEnriched.map((a, i) => {
                const isFeatured = i === 0
                return (
                  <motion.li
                    key={a.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, delay: 0.12 + i * 0.07 }}
                    className="cursor-pointer"
                  >
                    {isFeatured ? (
                      <div className="relative overflow-hidden">
                        <img
                          src={a.img}
                          alt=""
                          className="w-full h-36 object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <p className="absolute bottom-0 left-0 right-0 px-3 pb-3 text-[12px] font-semibold leading-snug text-white">
                          {isAr ? a.titleAr : a.titleEn}
                        </p>
                      </div>
                    ) : (
                      <motion.div
                        whileHover={{ backgroundColor: "rgba(206,123,91,0.04)" }}
                        className="flex items-center gap-3 px-3 py-3"
                      >
                        <img
                          src={a.imgThumb}
                          alt=""
                          className="size-16 shrink-0 rounded-xl object-cover ring-1 ring-border/60"
                          loading="lazy"
                        />
                        <p className="text-[12px] leading-snug text-muted-foreground">
                          {isAr ? a.titleAr : a.titleEn}
                        </p>
                      </motion.div>
                    )}
                  </motion.li>
                )
              })}
            </ul>
          </motion.div>

          {/* Upcoming events */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.2 }}
            className="rounded-2xl border border-border/60 panel overflow-hidden"
          >
            <div className="border-b border-border/50 px-4 py-3">
              <p className="text-[13px] font-semibold">{isAr ? ar.upcomingEvents : "Upcoming events"}</p>
              <p className="text-[11px] text-muted-foreground/60 mt-0.5">{isAr ? ar.acrossOrg : "Across org & ERGs"}</p>
            </div>
            <div className="space-y-2 p-3">
              {upcomingEvents.map((e, i) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.18, delay: 0.25 + i * 0.06 }}
                  className="relative flex flex-col overflow-hidden rounded-xl border border-border/50 bg-muted/10 px-3 py-2.5 ps-4 hover:bg-muted/20 transition-colors cursor-pointer"
                >
                  <span className={cn("absolute start-0 top-0 h-full w-[3px]", e.stripe === "primary" && "bg-primary", e.stripe === "muted" && "bg-muted-foreground/40", e.stripe === "soft" && "bg-amber-400/60")} />
                  <p className="text-[12px] font-semibold">{isAr && e.titleAr ? e.titleAr : e.title}</p>
                  <p className="text-[11px] text-muted-foreground/60">{isAr && e.dateAr ? e.dateAr : e.date}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick links */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.25 }}
            className="rounded-2xl border border-border/60 panel p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[13px] font-semibold">{isAr ? ar.quickLinks : "Quick links"}</p>
              <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wide">{isAr ? ar.apps : "Apps"}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickLinks.map((q, i) => {
                const Icon = QUICK_ICONS[q.icon]
                return (
                  <motion.a
                    key={q.id}
                    href={q.href}
                    whileHover={{ scale: 1.08, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, delay: 0.2 + i * 0.05 }}
                    className="group flex flex-col items-center gap-1.5 rounded-xl p-2.5 transition-colors hover:bg-muted/50"
                  >
                    <span className={cn("flex size-10 items-center justify-center rounded-xl text-white shadow-sm", q.swatch)}>
                      <Icon className="size-[17px]" />
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground/60 group-hover:text-foreground">{q.label}</span>
                  </motion.a>
                )
              })}
            </div>
          </motion.div>
        </aside>
      </div>
    </div>
  )
}
