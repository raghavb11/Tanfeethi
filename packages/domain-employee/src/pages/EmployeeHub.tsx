import * as React from "react"
import { motion } from "framer-motion"

import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
} from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  attendance,
  leave,
  profile,
  type AttendanceStatus,
} from "../data/mock/employee"
import {
  Banknote,
  Bed,
  Building2,
  CalendarCheck,
  CalendarDays,
  Car,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coffee,
  GraduationCap,
  Laptop,
  LogOut,
  Mail,
  MapPin,
  Plane,
  PlayCircle,
  Plus,
  Sparkles,
  Sun,
  TrendingUp,
  UtensilsCrossed,
  Users,
  Wallet,
  Wifi,
} from "lucide-react"

/** First letter of each of the first two words of a name (e.g. "Khalid Al-Saadi" → "KA"). */
function initials(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
}

// ─── translations ─────────────────────────────────────────────────────────────

const ar = {
  hubLabel: "مركز الموظف",
  pageTitle: "هويتك المهنية",
  pageDesc: "حضورك وإجازاتك ومصاريفك ومناوباتك في صفحة واحدة.",
  todayLabel: "اليوم",
  clockedInAt: "بدأت الدوام عند",
  currentSession: "الجلسة الحالية",
  workingNow: "أعمل الآن",
  onBreak: "في استراحة",
  doneForDay: "انتهى يومي",
  clockOut: "انهاء الدوام",
  takeBreak: "استراحة",
  thisWeek: "هذا الأسبوع",
  weeklyTotal: "إجمالي الأسبوع",
  ofTarget: "من الهدف",
  target: "الهدف",
  hoursAbbr: "س",
  leaveBalance: "رصيد الإجازات",
  daysAvailable: "أيام متاحة",
  daysUsed: "مستخدمة",
  ofTotal: "من",
  pendingRequests: "طلبات قيد المراجعة",
  requestLeave: "طلب إجازة",
  noRequests: "لا توجد طلبات معلقة",
  leaveBreakdown: "توزيع الإجازات",
  daysUnit: "يوم",
  profileSection: "الملف الشخصي",
  manager: "المدير",
  reports: "تقارير مباشرة",
  viewOrgChart: "عرض الهيكل التنظيمي",
  expenseTitle: "تقديم مصروفات سريع",
  expenseDesc: "واجهة فقط — بدون نظام خلفي في النسخة الأولى",
  amount: "المبلغ",
  category: "الفئة",
  receipt: "الإيصال",
  submitExpense: "تقديم المصروف",
  shiftsTitle: "جدول المناوبات",
  shiftsDesc: "ساعات ثابتة مع ذكاء الموقع.",
  status: {
    complete: "مكتمل",
    current: "جارٍ",
    upcoming: "قادم",
    leave: "إجازة",
    weekend: "نهاية أسبوع",
  } as Record<AttendanceStatus, string>,
  // HR overview strip
  nextSalary: "الراتب القادم",
  nextSalaryHint: "خلال",
  daysShort: "يوم",
  upcomingHoliday: "إجازة قادمة",
  vacationLeft: "رصيد إجازتك",
  // org structure
  orgStructure: "الهيكل التنظيمي",
  yourPosition: "موقعك",
  directReports: "تقاريرك المباشرة",
  // expense services
  expenseServicesTitle: "خدمات المصاريف",
  expenseServicesDesc: "اختر نوع المصروف لتقديمه",
  // shifts vibrant
  shiftType: { office: "مكتب", remote: "عن بُعد", client: "عميل", focus: "تركيز" },
  onSite: "حضور",
  keyMeeting: "اجتماع مهم",
  noMeeting: "ما فيه اجتماعات",
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function useLiveSessionMinutes(initial: number) {
  const [minutes, setMinutes] = React.useState(initial)
  React.useEffect(() => {
    const id = window.setInterval(() => setMinutes((m) => m + 1), 60_000)
    return () => window.clearInterval(id)
  }, [])
  return minutes
}

function formatHM(mins: number, isAr: boolean) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (isAr) return `${h}س ${m.toString().padStart(2, "0")}د`
  return `${h}h ${m.toString().padStart(2, "0")}m`
}

function StatusPulse({ tone = "emerald" }: { tone?: "emerald" | "amber" }) {
  const dotColor = tone === "emerald" ? "bg-emerald-400" : "bg-amber-400"
  return (
    <span className="relative inline-flex size-2">
      <motion.span
        animate={{ scale: [1, 2, 1], opacity: [0.85, 0, 0.85] }}
        transition={{ duration: 2, repeat: Infinity }}
        className={cn("absolute inline-flex size-full rounded-full opacity-75", dotColor)}
      />
      <span className={cn("relative inline-flex size-2 rounded-full", dotColor)} />
    </span>
  )
}

// ─── attendance hero (today) ─────────────────────────────────────────────────

function HeroStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45">{label}</div>
      <div className="mt-1.5 flex items-baseline gap-1">
        <span className="truncate text-[19px] font-bold tabular-nums leading-none text-white">{value}</span>
        {sub && <span className="shrink-0 text-[11px] font-medium text-white/50">{sub}</span>}
      </div>
    </div>
  )
}

function TodayHero({ isAr }: { isAr: boolean }) {
  const minutes = useLiveSessionMinutes(attendance.today.sessionMinutes)
  const targetMin = attendance.today.targetHours * 60
  const progress = Math.min(100, (minutes / targetMin) * 100)
  const size = 200
  const ring = 80
  const center = size / 2
  const circumference = 2 * Math.PI * ring
  const offset = circumference - (progress / 100) * circumference

  const today = attendance.today

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="highlight-card hl-green relative overflow-hidden rounded-3xl"
    >
      <div className="relative z-10 flex flex-col gap-7 p-6 md:flex-row md:items-center md:justify-between md:gap-8 md:p-8">
        {/* Left: status & info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <StatusPulse />
            <span className="text-[11px] font-semibold tracking-[0.14em] uppercase" style={{ color: "rgba(243,240,238,0.72)" }}>
              {isAr ? ar.workingNow : "Working now"}
            </span>
          </div>
          <div>
            <p className="text-[11px] tracking-[0.12em] uppercase" style={{ color: "rgba(243,240,238,0.45)" }}>
              {isAr ? ar.todayLabel : "Today"}
            </p>
            <h2 className="text-[24px] font-bold tracking-tight md:text-[28px]" style={{ color: "#F3F0EE" }}>
              {isAr ? today.dayNameAr : today.dayName}
              <span className="mx-2 opacity-40">·</span>
              <span style={{ color: "rgba(243,240,238,0.72)" }}>{isAr ? today.dateLabelAr : today.dateLabel}</span>
            </h2>
          </div>
          <div className="flex items-center gap-3 text-[13px]" style={{ color: "rgba(243,240,238,0.65)" }}>
            <PlayCircle className="size-4" style={{ color: "#CE7B5B" }} />
            <span>
              {isAr ? ar.clockedInAt : "Clocked in at"}{" "}
              <span className="font-semibold tabular-nums" style={{ color: "#F3F0EE" }}>{today.clockIn}</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#CE7B5B", color: "#fff" }}
            >
              <LogOut className="size-3.5" />
              {isAr ? ar.clockOut : "Clock out"}
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-medium transition-colors hover:bg-white/10"
              style={{ border: "1px solid rgba(243,240,238,0.20)", color: "rgba(243,240,238,0.85)" }}
            >
              <Coffee className="size-3.5" />
              {isAr ? ar.takeBreak : "Take break"}
            </button>
          </div>
        </div>

        {/* Center: quick stats — fills the band so it never reads stretched */}
        <div className="grid w-full grid-cols-3 gap-5 md:w-auto md:gap-8 md:border-x md:border-white/10 md:px-7 lg:px-10">
          <HeroStat label={isAr ? ar.thisWeek : "This week"} value={`${attendance.weeklyTotalHours}`} sub={`/ ${attendance.weeklyTargetHours}${isAr ? ar.hoursAbbr : "h"}`} />
          <HeroStat label={isAr ? ar.vacationLeft : "Leave"} value={`${leave.balanceDays}`} sub={isAr ? ar.daysUnit : "days"} />
          <HeroStat label={isAr ? ar.nextSalary : "Next pay"} value={`${hrOverview.nextSalary.inDays}`} sub={isAr ? ar.daysShort : "days"} />
        </div>

        {/* Right: progress ring */}
        <div className="relative shrink-0 self-center" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
            <circle cx={center} cy={center} r={ring} fill="none" stroke="rgba(243,240,238,0.08)" strokeWidth="9" />
            <motion.circle
              cx={center}
              cy={center}
              r={ring}
              fill="none"
              stroke="#CE7B5B"
              strokeWidth="9"
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              strokeDasharray={circumference}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
            <div className="text-[10px] font-semibold tracking-[0.16em] uppercase" style={{ color: "rgba(243,240,238,0.50)" }}>
              {isAr ? ar.currentSession : "Session"}
            </div>
            <div className="mt-1.5 whitespace-nowrap text-[26px] font-bold tabular-nums tracking-tight leading-none" style={{ color: "#F3F0EE" }}>
              {formatHM(minutes, isAr)}
            </div>
            <div className="mt-1.5 text-[11px]" style={{ color: "rgba(243,240,238,0.50)" }}>
              {isAr ? ar.target : "Target"} · {today.targetHours}{isAr ? ar.hoursAbbr : "h"}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

// ─── weekly attendance grid ──────────────────────────────────────────────────

function StatusIcon({ status }: { status: AttendanceStatus }) {
  if (status === "complete") return <CheckCircle2 className="size-3.5 text-emerald-500" />
  if (status === "current") return <PlayCircle className="size-3.5 text-primary" />
  if (status === "leave") return <Plane className="size-3.5 text-amber-500" />
  return <Clock className="size-3.5 text-muted-foreground/40" />
}

function statusColors(status: AttendanceStatus) {
  if (status === "complete") return "border-emerald-500/30 bg-emerald-500/[0.04]"
  if (status === "current") return "border-primary/40 bg-primary/[0.06] ring-2 ring-primary/20 shadow-md shadow-primary/10"
  if (status === "leave") return "border-amber-400/30 bg-amber-400/[0.04]"
  return "border-border/60 bg-card"
}

function WeeklyAttendance({ isAr }: { isAr: boolean }) {
  const totalProgress = (attendance.weeklyTotalHours / attendance.weeklyTargetHours) * 100
  const targetHourPerDay = 8

  return (
    <Card className="ring-1 ring-foreground/10">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <CalendarCheck className="size-4 text-primary" />
            <span className="text-[13px] font-semibold">{isAr ? ar.thisWeek : "This week"}</span>
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground/70">
            {isAr ? attendance.weekRangeAr : attendance.weekRange} · {isAr ? attendance.streakAr : attendance.streak}
          </div>
        </div>
        <Badge variant="outline" className="shrink-0 gap-1.5 border-emerald-500/35 bg-emerald-500/10 text-[11px] text-emerald-400">
          <TrendingUp className="size-3" />
          {isAr ? attendance.statusAr : attendance.status}
        </Badge>
      </div>

      {/* Days grid */}
      <div className="grid gap-2.5 px-5 py-5 sm:grid-cols-5">
        {attendance.week.map((d, i) => {
          const fillPct = d.hours != null ? Math.min(100, (d.hours / targetHourPerDay) * 100) : 0
          const dayLabel = isAr ? d.dayAr : d.day
          return (
            <motion.div
              key={d.day}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -2 }}
              className={cn(
                "relative flex flex-col gap-2 overflow-hidden rounded-2xl border p-3 transition-all",
                statusColors(d.status),
              )}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {dayLabel}
                  {d.status === "current" && <StatusPulse />}
                </span>
                <StatusIcon status={d.status} />
              </div>

              <div>
                <div className="text-[20px] font-bold tabular-nums tracking-tight leading-none">
                  {d.hours != null ? d.hours.toFixed(1) : "—"}
                  {d.hours != null && (
                    <span className="ms-1 text-[10px] font-medium text-muted-foreground/55">
                      {isAr ? ar.hoursAbbr : "h"}
                    </span>
                  )}
                </div>
                {/* Hours bar */}
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted/40">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${fillPct}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                      "h-full rounded-full",
                      d.status === "complete" && "bg-emerald-400/80",
                      d.status === "current" && "bg-primary",
                      d.status === "leave" && "bg-amber-400/70",
                      d.status === "upcoming" && "bg-muted-foreground/20",
                    )}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-muted-foreground/55 mt-auto">
                {d.clockIn ? (
                  <>
                    <span className="tabular-nums">{d.clockIn}</span>
                    <span className="opacity-40">→</span>
                    <span className="tabular-nums">{d.clockOut ?? "—"}</span>
                  </>
                ) : (
                  <span className="w-full text-center text-[10px] font-medium">
                    {ar.status[d.status]}
                  </span>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Weekly total bar — back to clean, single-row footer */}
      <div className="border-t border-border/50 px-5 py-4">
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/65">
            {isAr ? ar.weeklyTotal : "Weekly total"}
          </span>
          <span className="text-[12px] text-muted-foreground/65 tabular-nums">
            <span className="text-[18px] font-bold text-foreground">{attendance.weeklyTotalHours}</span>
            <span className="ms-0.5 text-[11px]">{isAr ? ar.hoursAbbr : "h"}</span>
            <span className="mx-1.5 opacity-40">/</span>
            <span>{attendance.weeklyTargetHours}{isAr ? ar.hoursAbbr : "h"}</span>
            <span className="ms-1.5 text-[11px] text-muted-foreground/55">{isAr ? ar.ofTarget : "of target"}</span>
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted/40">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${totalProgress}%` }}
            transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary"
          />
        </div>
      </div>
    </Card>
  )
}

// ─── leave card ──────────────────────────────────────────────────────────────

function LeaveCard({ isAr }: { isAr: boolean }) {
  return (
    <Card className="ring-1 ring-foreground/10">
      <div className="flex items-center gap-2 border-b border-border/60 px-5 py-4">
        <Sparkles className="size-4 text-primary" />
        <div>
          <div className="text-[13px] font-semibold">{isAr ? "مزاياي" : "My benefits"}</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground/65">
            {isAr ? "الراتب، الإجازة، والعطل" : "Salary, vacation, and holidays"}
          </div>
        </div>
      </div>

      {/* Three small vertical benefit boxes */}
      <div className="grid gap-2.5 px-5 pt-4 sm:grid-cols-3">
        {/* Next salary */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0 }}
          className="flex flex-col gap-1.5 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.06] p-3 ring-1 ring-emerald-500/10"
        >
          <span className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <Banknote className="size-4" />
          </span>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/55">
            {isAr ? ar.nextSalary : "Next salary"}
          </div>
          <div className="text-[14px] font-bold tabular-nums leading-tight">
            {isAr ? hrOverview.nextSalary.amountAr : hrOverview.nextSalary.amount}
          </div>
          <div className="text-[10px] text-muted-foreground/65">
            {isAr ? hrOverview.nextSalary.dateAr : hrOverview.nextSalary.date} · {hrOverview.nextSalary.inDays} {isAr ? ar.daysShort : "days"}
          </div>
        </motion.div>

        {/* Vacation */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="flex flex-col gap-1.5 rounded-2xl border border-violet-500/25 bg-violet-500/[0.06] p-3 ring-1 ring-violet-500/10"
        >
          <span className="flex size-8 items-center justify-center rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-400">
            <Plane className="size-4" />
          </span>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/55">
            {isAr ? ar.vacationLeft : "Vacation"}
          </div>
          <div className="text-[14px] font-bold tabular-nums leading-tight">
            {leave.balanceDays} <span className="text-[10px] font-medium text-muted-foreground/65">{isAr ? ar.daysUnit : "days"}</span>
          </div>
          <div className="text-[10px] text-muted-foreground/65">
            {leave.usedDays}/{leave.totalDays} {isAr ? "مستخدم" : "used"}
          </div>
        </motion.div>

        {/* Holiday */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="flex flex-col gap-1.5 rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] p-3 ring-1 ring-amber-500/10"
        >
          <span className="flex size-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Sun className="size-4" />
          </span>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/55">
            {isAr ? ar.upcomingHoliday : "Holiday"}
          </div>
          <div className="text-[12px] font-bold leading-tight truncate">
            {isAr ? hrOverview.upcomingHoliday.nameAr : hrOverview.upcomingHoliday.name}
          </div>
          <div className="text-[10px] text-muted-foreground/65">
            {isAr ? hrOverview.upcomingHoliday.dateAr : hrOverview.upcomingHoliday.date}
          </div>
        </motion.div>
      </div>

      {/* Breakdown */}
      <div className="space-y-3 px-5 py-4">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/65">
          {isAr ? ar.leaveBreakdown : "Breakdown"}
        </div>
        <div className="space-y-2.5">
          {leave.breakdown.map((b, i) => {
            const pct = (b.used / b.total) * 100
            const remaining = b.total - b.used
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, x: isAr ? 8 : -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.22, delay: 0.1 + i * 0.07 }}
                className="space-y-1"
              >
                <div className="flex items-baseline justify-between text-[11px]">
                  <span className="font-medium">{isAr ? b.labelAr : b.label}</span>
                  <span className="tabular-nums text-muted-foreground/65">
                    <span className="font-semibold text-foreground">{remaining}</span>
                    <span className="opacity-50"> / {b.total} {isAr ? ar.daysUnit : "days"}</span>
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted/40">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, delay: 0.2 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                      "h-full rounded-full",
                      b.color === "primary" && "bg-primary",
                      b.color === "amber" && "bg-amber-400",
                      b.color === "emerald" && "bg-emerald-400",
                    )}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Pending */}
      <div className="border-t border-border/50 px-5 py-4 space-y-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/65">
          {isAr ? ar.pendingRequests : "Pending requests"}
        </div>
        {leave.pending.length === 0 ? (
          <div className="text-[12px] text-muted-foreground/60">{isAr ? ar.noRequests : "None pending"}</div>
        ) : (
          leave.pending.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between gap-2 rounded-xl border border-amber-400/25 bg-amber-400/[0.05] px-3 py-2.5"
            >
              <div className="min-w-0">
                <div className="text-[12px] font-semibold">{isAr ? p.rangeAr : p.range}</div>
                <div className="text-[11px] text-muted-foreground/70">
                  {isAr ? p.typeAr : p.type} · {p.days} {isAr ? ar.daysUnit : "days"}
                </div>
              </div>
              <Badge variant="outline" className="shrink-0 border-amber-400/40 bg-amber-400/10 text-[10px] text-amber-500">
                {isAr ? p.statusAr : p.status}
              </Badge>
            </motion.div>
          ))
        )}
        <div className="flex justify-end">
          <Button className="gap-1.5" variant="default" size="sm">
            <Plus className="size-3.5" />
            {isAr ? ar.requestLeave : "Request leave"}
          </Button>
        </div>
      </div>
    </Card>
  )
}

// ─── HR overview data ────────────────────────────────────────────────────────

const hrOverview = {
  nextSalary: { date: "May 27", dateAr: "27 مايو", amount: "SAR 18,400", amountAr: "18,400 ر.س", inDays: 22 },
  upcomingHoliday: { name: "Eid Al-Adha", nameAr: "عيد الأضحى", date: "Jun 6", dateAr: "6 يونيو", inDays: 32 },
}

// ─── performance ─────────────────────────────────────────────────────────────

const performance = {
  rating: 4.6,
  ratingLabel: "Exceeds", ratingLabelAr: "يفوق التوقعات",
  cycleLabel: "H1 2026",
  nextReview: "Jul 15", nextReviewAr: "15 يوليو",
  goals: [
    { id: "g1", label: "Lead Wave 2 rollout", labelAr: "قيادة إطلاق الموجة 2", progress: 78 },
    { id: "g2", label: "Mentor 2 engineers", labelAr: "إرشاد مهندسَين", progress: 60 },
    { id: "g3", label: "Cut incident MTTR 20%", labelAr: "خفض زمن معالجة الحوادث 20٪", progress: 45 },
  ],
  kudos: 12,
  recentKudos: {
    from: "Sara Al-Mutairi", fromAr: "سارة المطيري",
    text: "Great leadership steering the Q2 operations review.",
    textAr: "قيادة رائعة في إدارة مراجعة عمليات الربع الثاني.",
  },
}

function PerformanceCard({ isAr }: { isAr: boolean }) {
  return (
    <Card className="ring-1 ring-foreground/10">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 px-5 py-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-4 text-primary" />
          <div>
            <div className="text-[13px] font-semibold">{isAr ? "الأداء" : "Performance"}</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground/65">{isAr ? "الأهداف والتقييم والتقدير" : "Goals, rating, and recognition"}</div>
          </div>
        </div>
        <Badge variant="outline" className="shrink-0 gap-1 text-[10px]">{performance.cycleLabel}</Badge>
      </div>
      <div className="grid gap-5 p-5 md:grid-cols-[auto_1.2fr_1fr] md:gap-7">
        {/* Rating */}
        <div className="flex flex-col justify-center gap-1.5 md:border-e md:border-border/50 md:pe-7">
          <div className="flex items-baseline gap-1">
            <span className="text-[34px] font-bold tabular-nums leading-none">{performance.rating}</span>
            <span className="text-[13px] text-muted-foreground/55">/ 5</span>
          </div>
          <Badge variant="outline" className="w-fit gap-1 border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-500">
            <TrendingUp className="size-2.5" />{isAr ? performance.ratingLabelAr : performance.ratingLabel}
          </Badge>
          <div className="mt-0.5 text-[10.5px] text-muted-foreground/60">
            {isAr ? "المراجعة القادمة" : "Next review"} · {isAr ? performance.nextReviewAr : performance.nextReview}
          </div>
        </div>
        {/* Goals */}
        <div className="space-y-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/55">{isAr ? "الأهداف" : "Goals"}</div>
          {performance.goals.map((g, i) => (
            <div key={g.id} className="space-y-1">
              <div className="flex items-baseline justify-between gap-2 text-[11.5px]">
                <span className="truncate font-medium">{isAr ? g.labelAr : g.label}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground/65">{g.progress}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted/40">
                <motion.div initial={{ width: 0 }} animate={{ width: `${g.progress}%` }} transition={{ duration: 0.7, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] }} className="h-full rounded-full bg-primary" />
              </div>
            </div>
          ))}
        </div>
        {/* Recognition */}
        <div className="space-y-2 md:border-s md:border-border/50 md:ps-7">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/55">{isAr ? "التقدير" : "Recognition"}</div>
            <Badge variant="outline" className="gap-1 text-[10px] text-amber-500"><Sparkles className="size-2.5" />{performance.kudos}</Badge>
          </div>
          <div className="rounded-xl border border-border/50 bg-muted/15 p-3">
            <div className="text-[11.5px] leading-snug text-foreground/85">“{isAr ? performance.recentKudos.textAr : performance.recentKudos.text}”</div>
            <div className="mt-1.5 text-[10.5px] text-muted-foreground/60">— {isAr ? performance.recentKudos.fromAr : performance.recentKudos.from}</div>
          </div>
        </div>
      </div>
    </Card>
  )
}

// ─── expense services ────────────────────────────────────────────────────────

const expenseServices: {
  id: string
  label: string
  labelAr: string
  hint: string
  hintAr: string
  icon: React.ComponentType<{ className?: string }>
  tone: string
}[] = [
  { id: "travel", label: "Travel", labelAr: "سفر", hint: "Flights & trips", hintAr: "طيران ورحلات", icon: Plane, tone: "bg-sky-500/12 text-sky-600 dark:text-sky-400" },
  { id: "lodging", label: "Lodging", labelAr: "إقامة", hint: "Hotels & stays", hintAr: "فنادق وإقامات", icon: Bed, tone: "bg-violet-500/12 text-violet-600 dark:text-violet-400" },
  { id: "meals", label: "Meals", labelAr: "وجبات", hint: "Food & client meals", hintAr: "طعام وضيافة", icon: UtensilsCrossed, tone: "bg-amber-500/12 text-amber-600 dark:text-amber-400" },
  { id: "mileage", label: "Mileage", labelAr: "تنقّلات", hint: "Car & taxi", hintAr: "سيارة وتاكسي", icon: Car, tone: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400" },
  { id: "equipment", label: "Equipment", labelAr: "أجهزة", hint: "Devices & tools", hintAr: "أجهزة وأدوات", icon: Laptop, tone: "bg-blue-500/12 text-blue-600 dark:text-blue-400" },
  { id: "training", label: "Training", labelAr: "تدريب", hint: "Courses & events", hintAr: "كورسات ومؤتمرات", icon: GraduationCap, tone: "bg-rose-500/12 text-rose-600 dark:text-rose-400" },
]

// ─── richer shift data (Mon → Fri) ───────────────────────────────────────────

type ShiftType = "office" | "remote" | "client" | "focus"

const richShifts: {
  day: string
  dayAr: string
  type: ShiftType
  window: string
  windowAr?: string
  site: string
  siteAr: string
  onSite: number
  meeting: string | null
  meetingAr: string | null
}[] = [
  { day: "Monday", dayAr: "الإثنين", type: "office", window: "09:00–17:30", site: "HQ · L14", siteAr: "المقر · ط14", onSite: 12, meeting: "Wave 2 standup · 10:00", meetingAr: "اجتماع الموجة الثانية · 10:00" },
  { day: "Tuesday", dayAr: "الثلاثاء", type: "office", window: "09:00–17:30", site: "HQ · L14", siteAr: "المقر · ط14", onSite: 14, meeting: "1:1 with Maya · 14:30", meetingAr: "اجتماع مع مايا · 14:30" },
  { day: "Wednesday", dayAr: "الأربعاء", type: "remote", window: "Flexible", windowAr: "مرن", site: "Focus block · AM", siteAr: "كتلة تركيز · صباحًا", onSite: 0, meeting: null, meetingAr: null },
  { day: "Thursday", dayAr: "الخميس", type: "client", window: "10:00–18:00", site: "Client · KAFD", siteAr: "العميل · المركز المالي", onSite: 4, meeting: "Vendor review · 11:00", meetingAr: "مراجعة المورد · 11:00" },
  { day: "Friday", dayAr: "الجمعة", type: "office", window: "09:00–15:00", site: "HQ · L14", siteAr: "المقر · ط14", onSite: 8, meeting: "Portfolio sync · 09:30", meetingAr: "مزامنة المحفظة · 09:30" },
]

function shiftTypeMeta(type: ShiftType) {
  switch (type) {
    case "office":
      return { icon: Building2, tone: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 border-emerald-500/25", chipBg: "bg-emerald-500" }
    case "remote":
      return { icon: Wifi, tone: "bg-violet-500/12 text-violet-600 dark:text-violet-400 border-violet-500/25", chipBg: "bg-violet-500" }
    case "client":
      return { icon: Users, tone: "bg-amber-500/12 text-amber-600 dark:text-amber-400 border-amber-500/25", chipBg: "bg-amber-500" }
    case "focus":
      return { icon: Sparkles, tone: "bg-blue-500/12 text-blue-600 dark:text-blue-400 border-blue-500/25", chipBg: "bg-blue-500" }
  }
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function EmployeeHub() {
  const { locale } = useShell()
  const isAr = locale === "ar"

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-7 md:px-8">
      {/* Page heading */}
      <div className="space-y-1.5">
        <h1 className="text-[22px] font-bold tracking-tight md:text-[26px]">
          {isAr ? ar.pageTitle : "Your work identity"}
        </h1>
        <p className="max-w-3xl text-[13px] text-muted-foreground">
          {isAr ? ar.pageDesc : "Your attendance, leave, expenses, and shifts on one page."}
        </p>
      </div>

      {/* ── Today hero (prominent attendance tracker) ── */}
      <TodayHero isAr={isAr} />

      {/* ── This week + My benefits (paired so neither reads stretched) ── */}
      <div className="grid items-start gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <WeeklyAttendance isAr={isAr} />
          <PerformanceCard isAr={isAr} />
        </div>
        <div className="lg:col-span-4">
          <LeaveCard isAr={isAr} />
        </div>
      </div>

      {/* ── Organization (narrow, chart fills) · Expenses (wide) ── */}
      <div className="grid items-start gap-6 lg:grid-cols-12">
        {/* Organization structure */}
        <Card className="ring-1 ring-foreground/10 lg:col-span-4">
          <div className="flex items-center gap-2 border-b border-border/60 px-5 py-4">
            <Building2 className="size-4 text-primary" />
            <div>
              <div className="text-[13px] font-semibold">{isAr ? ar.orgStructure : "Organization structure"}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground/65">{isAr ? "مديرك، موقعك، وفريقك" : "Your manager, position, and team"}</div>
            </div>
          </div>
          <div className="px-5 py-5">
            <div className="flex flex-col items-center gap-2">
              {/* Manager node */}
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
                className="flex items-center gap-3 rounded-2xl border border-border/60 panel px-4 py-2.5 shadow-sm"
              >
                <Avatar className="size-9">
                  <AvatarFallback className="bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                    {initials(isAr ? profile.managerAr : profile.manager)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/55">{isAr ? ar.manager : "Manager"}</div>
                  <div className="text-[12.5px] font-semibold leading-tight">{isAr ? profile.managerAr : profile.manager}</div>
                </div>
              </motion.div>
              {/* connector */}
              <div className="h-5 w-px bg-border/60" />
              {/* You node */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, delay: 0.1 }}
                className="flex items-center gap-3 rounded-2xl border-2 border-primary bg-primary/5 px-4 py-3 shadow-md shadow-primary/10"
              >
                <Avatar className="size-12 ring-2 ring-primary/30">
                  <AvatarFallback className="bg-primary/15 text-primary text-[13px] font-bold">
                    {initials(isAr ? profile.nameAr : profile.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">{isAr ? ar.yourPosition : "You"}</span>
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="text-[14px] font-bold leading-tight">{isAr ? profile.nameAr : profile.name}</div>
                  <div className="text-[11px] text-muted-foreground/75">{isAr ? profile.titleAr : profile.title}</div>
                </div>
              </motion.div>
              {/* connector */}
              <div className="h-5 w-px bg-border/60" />
              {/* Reports row */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.2 }}
                className="flex items-center gap-3 rounded-2xl border border-border/60 panel px-4 py-2.5 shadow-sm"
              >
                <div className="flex -space-x-2">
                  {["RO", "TN", "DA", "YH"].map((init) => (
                    <Avatar key={init} className="size-7 ring-2 ring-card">
                      <AvatarFallback className="bg-primary/12 text-primary text-[9px] font-bold">{init}</AvatarFallback>
                    </Avatar>
                  ))}
                  <span className="flex size-7 items-center justify-center rounded-full bg-muted ring-2 ring-card text-[9px] font-bold text-muted-foreground">+8</span>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/55">{isAr ? ar.directReports : "Direct reports"}</div>
                  <div className="text-[12.5px] font-semibold leading-tight">12 {isAr ? "موظف" : "people"} <span className="text-[10px] font-medium text-muted-foreground/65">· 84 {isAr ? "ممتد" : "extended"}</span></div>
                </div>
              </motion.div>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="gap-1 text-[10px]">
                  <MapPin className="size-2.5" />
                  {isAr ? profile.locationAr : profile.location}
                </Badge>
                <Badge variant="outline" className="gap-1 text-[10px]">
                  <Mail className="size-2.5" />
                  {profile.email}
                </Badge>
              </div>
              <Button size="xs" variant="outline" className="gap-1">
                {isAr ? ar.viewOrgChart : "View full org chart"}
                <ChevronRight className={cn("size-3", isAr && "rotate-180")} />
              </Button>
            </div>
          </div>
        </Card>

        {/* Expense services */}
        <Card className="ring-1 ring-foreground/10 lg:col-span-8">
        <div className="flex items-center gap-2 border-b border-border/60 px-5 py-4">
          <Wallet className="size-4 text-primary" />
          <div>
            <div className="text-[13px] font-semibold">{isAr ? ar.expenseServicesTitle : "Expense services"}</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground/65">{isAr ? ar.expenseServicesDesc : "Choose a category to file an expense"}</div>
          </div>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          {expenseServices.map((s, idx) => {
            const Icon = s.icon
            return (
              <motion.button
                key={s.id}
                type="button"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: idx * 0.04 }}
                whileHover={{ y: -2 }}
                className="group flex items-center gap-3 rounded-xl border border-border/60 bg-muted/15 p-3.5 ring-1 ring-foreground/5 text-start transition-all hover:border-primary/30 hover:bg-primary/[0.04] hover:shadow-sm"
              >
                <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-2xl", s.tone)}>
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-semibold">{isAr ? s.labelAr : s.label}</div>
                  <div className="text-[10.5px] text-muted-foreground/65">{isAr ? s.hintAr : s.hint}</div>
                </div>
                <ChevronRight className={cn("size-4 text-muted-foreground/30 group-hover:text-primary transition-colors", isAr && "rotate-180")} />
              </motion.button>
            )
          })}
        </div>
      </Card>
      </div>

      {/* ── Vibrant shifts ── */}
      <Card className="ring-1 ring-foreground/10">
        <div className="flex items-center gap-2 border-b border-border/60 px-5 py-4">
          <CalendarDays className="size-4 text-primary" />
          <div>
            <div className="text-[13px] font-semibold">{isAr ? ar.shiftsTitle : "Shift schedule preview"}</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground/65">{isAr ? ar.shiftsDesc : "Hours, location, and key meetings per day"}</div>
          </div>
        </div>
        <div className="grid gap-3 p-4 md:grid-cols-5">
          {richShifts.map((s, idx) => {
            const meta = shiftTypeMeta(s.type)
            const Icon = meta.icon
            const typeLabel = isAr ? ar.shiftType[s.type] : s.type.charAt(0).toUpperCase() + s.type.slice(1)
            return (
              <motion.div
                key={s.day}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                whileHover={{ y: -3 }}
                className={cn(
                  "group relative flex flex-col gap-3 overflow-hidden rounded-2xl border bg-card p-3.5 ring-1 ring-foreground/5 transition-all hover:shadow-md",
                  meta.tone,
                )}
              >
                {/* Top accent bar */}
                <span className={cn("absolute inset-x-0 top-0 h-1", meta.chipBg)} />
                {/* Header: day + type chip */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-foreground/85">
                    {isAr ? s.dayAr : s.day.slice(0, 3)}
                  </div>
                  <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider", meta.tone)}>
                    <Icon className="size-2.5" />
                    {typeLabel}
                  </span>
                </div>
                {/* Time window — big */}
                <div>
                  <div className="text-[15px] font-bold tabular-nums leading-tight">
                    {isAr && s.windowAr ? s.windowAr : s.window}
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[10.5px] text-muted-foreground/70">
                    <MapPin className="size-2.5" />
                    <span className="truncate">{isAr ? s.siteAr : s.site}</span>
                  </div>
                </div>
                {/* On-site count + meeting */}
                <div className="space-y-1.5 border-t border-border/40 pt-2 text-[10.5px]">
                  <div className="flex items-center gap-1.5 text-muted-foreground/75">
                    <Users className="size-2.5" />
                    <span>
                      {s.onSite > 0 ? (
                        <><span className="font-semibold text-foreground tabular-nums">{s.onSite}</span> {isAr ? ar.onSite : "on-site"}</>
                      ) : (
                        <span className="text-violet-600 dark:text-violet-400">{isAr ? "عن بُعد" : "Remote day"}</span>
                      )}
                    </span>
                  </div>
                  {s.meeting ? (
                    <div className="flex items-start gap-1.5 leading-snug text-muted-foreground/70">
                      <CalendarDays className="mt-0.5 size-2.5 shrink-0 text-primary" />
                      <span className="line-clamp-2">{isAr ? s.meetingAr : s.meeting}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-muted-foreground/45">
                      <CalendarDays className="size-2.5" />
                      <span>{isAr ? ar.noMeeting : "No meetings"}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
