import * as React from "react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, Badge, Button, Card } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  ArrowRight, BadgeCheck, Banknote, Bell, Building2, CalendarCheck, CalendarClock, CalendarDays, Car, Check,
  CheckCircle2, ClipboardList, Clock, Coffee, FileCheck2, FileText, Gift, GraduationCap, Heart, Home,
  IdCard, LogOut, MapPin, Phone, Plane, Plus, Receipt, Shield, Sparkles, TrendingUp, UserCircle2, Users, Wallet, X,
} from "lucide-react"

import { allowances, approvals, attendanceSummary, emp, hrNotifications, leave, myRequests, payslip, today } from "../data/mock/center"

// ─── shared bits ─────────────────────────────────────────────────────────────
function CardHead({ icon: Icon, title, desc, action }: { icon: React.ComponentType<{ className?: string }>; title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border/60 px-5 py-4">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary"><Icon className="size-4" /></span>
        <div className="min-w-0">
          <div className="text-[13px] font-semibold leading-tight">{title}</div>
          {desc && <div className="mt-0.5 truncate text-[11px] text-muted-foreground/65">{desc}</div>}
        </div>
      </div>
      {action}
    </div>
  )
}

const money = (n: number, cur: string, isAr: boolean) => (isAr ? `${n.toLocaleString()} ${cur}` : `${cur} ${n.toLocaleString()}`)

const ALLOW_ICONS: Record<string, React.ComponentType<{ className?: string }>> = { home: Home, car: Car, phone: Phone, school: GraduationCap }
const BENEFIT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = { heart: Heart, shield: Shield, plane: Plane }
const NOTIF_ICONS: Record<string, React.ComponentType<{ className?: string }>> = { "file-check": FileCheck2, wallet: Wallet, gift: Gift, "calendar-check": CalendarCheck }
const REQ_ICONS: Record<string, React.ComponentType<{ className?: string }>> = { leave: Plane, expense: Receipt, letter: FileText, document: FileText }
const APPROVAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = { leave: Plane, expense: Receipt, overtime: Clock }

// ─── page ────────────────────────────────────────────────────────────────────
export default function EmployeeCenter() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)

  const workedMin = today.workedMinutes
  const targetMin = today.targetHours * 60
  const remainingMin = Math.max(0, targetMin - workedMin)
  const fmtHM = (m: number) => (isAr ? `${Math.floor(m / 60)}س ${String(m % 60).padStart(2, "0")}د` : `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`)
  const dayProgress = Math.min(100, Math.round((workedMin / targetMin) * 100))

  const statusMeta: Record<string, { label: string; ar: string; cls: string; dot: string }> = {
    present: { label: "Present", ar: "حاضر", cls: "border-emerald-500/35 bg-emerald-500/10 text-emerald-500", dot: "bg-emerald-500" },
    remote: { label: "Remote", ar: "عن بُعد", cls: "border-violet-500/35 bg-violet-500/10 text-violet-500", dot: "bg-violet-500" },
    leave: { label: "On leave", ar: "في إجازة", cls: "border-amber-500/35 bg-amber-500/10 text-amber-500", dot: "bg-amber-500" },
    absent: { label: "Absent", ar: "غائب", cls: "border-rose-500/35 bg-rose-500/10 text-rose-500", dot: "bg-rose-500" },
  }
  const st = statusMeta[today.status]

  const quickActions: { id: string; label: string; ar: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "clock", label: today.checkOut ? "Clock in" : "Clock out", ar: today.checkOut ? "تسجيل حضور" : "تسجيل انصراف", icon: LogOut },
    { id: "leave", label: "Request leave", ar: "طلب إجازة", icon: Plane },
    { id: "expense", label: "Submit expense", ar: "تقديم مصروف", icon: Receipt },
    { id: "payslip", label: "View payslip", ar: "عرض القسيمة", icon: Wallet },
    { id: "letter", label: "Request letter", ar: "طلب خطاب", icon: FileText },
    { id: "profile", label: "Update profile", ar: "تحديث الملف", icon: UserCircle2 },
  ]

  const identity = [
    { icon: IdCard, label: t("Employee ID", "الرقم الوظيفي"), value: emp.empId },
    { icon: Building2, label: t("Department / Sector", "الإدارة / القطاع"), value: `${isAr ? emp.departmentAr : emp.department} · ${isAr ? emp.sectorAr : emp.sector}` },
    { icon: Users, label: t("Direct manager", "المدير المباشر"), value: isAr ? emp.managerAr : emp.manager },
    { icon: MapPin, label: t("Work location", "موقع العمل"), value: `${isAr ? emp.locationAr : emp.location} · ${isAr ? emp.workModeAr : emp.workMode}` },
  ]

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-7 md:px-8">
      {/* heading */}
      <div className="space-y-1.5">
        <h1 className="text-[22px] font-bold tracking-tight md:text-[26px]">{t("Employee Center", "مركز الموظف")}</h1>
        <p className="max-w-3xl text-[13px] text-muted-foreground">{t("Your profile, attendance, leave, pay and requests — all in one place.", "ملفك، حضورك، إجازاتك، راتبك وطلباتك — في مكان واحد.")}</p>
      </div>

      {/* ── 1–7 · identity band ── */}
      <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="highlight-card hl-teal relative overflow-hidden rounded-3xl">
        <div className="relative z-10 flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="flex items-center gap-4 md:gap-5">
            <Avatar className="size-16 ring-2 ring-white/20 md:size-20">
              <AvatarFallback className="bg-[#CE7B5B] text-[20px] font-bold text-white md:text-[24px]">{emp.initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[22px] font-bold tracking-tight md:text-[26px]" style={{ color: "#F3F0EE" }}>{isAr ? emp.nameAr : emp.name}</h2>
                <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", st.cls)}>
                  <span className={cn("size-1.5 rounded-full", st.dot)} />{isAr ? st.ar : st.label}
                </span>
              </div>
              <p className="mt-1 text-[14px] font-medium" style={{ color: "rgba(243,240,238,0.78)" }}>{isAr ? emp.titleAr : emp.title}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px]" style={{ color: "rgba(243,240,238,0.55)" }}>
                <span className="inline-flex items-center gap-1"><BadgeCheck className="size-3.5" />{emp.empId}</span>
                <span className="inline-flex items-center gap-1"><Building2 className="size-3.5" />{isAr ? emp.departmentAr : emp.department}</span>
                <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{isAr ? emp.locationAr : emp.location}</span>
                <span>{isAr ? emp.gradeAr : emp.grade}</span>
              </div>
            </div>
          </div>

          {/* identity detail grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3.5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:min-w-[380px]">
            {identity.map((it) => (
              <div key={it.label} className="min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: "rgba(243,240,238,0.45)" }}><it.icon className="size-3" />{it.label}</div>
                <div className="mt-0.5 truncate text-[12.5px] font-semibold" style={{ color: "#F3F0EE" }}>{it.value}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── 7–9 · today at work  +  16 · quick actions ── */}
      <div className="grid items-stretch gap-6 lg:grid-cols-12">
        <Card className="ring-1 ring-foreground/10 lg:col-span-8">
          <CardHead icon={CalendarCheck} title={t("Today at work", "اليوم في العمل")} desc={`${isAr ? today.dayNameAr : today.dayName} · ${isAr ? today.dateLabelAr : today.dateLabel}`}
            action={<span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold", st.cls)}><span className={cn("size-1.5 rounded-full", st.dot)} />{isAr ? st.ar : st.label}</span>} />
          <div className="grid gap-4 p-5 sm:grid-cols-4">
            <TodayTile icon={CheckCircle2} label={t("Status", "الحالة")} value={isAr ? st.ar : st.label} sub={`${isAr ? today.locationAr : today.location}`} tone="emerald" />
            <TodayTile icon={Clock} label={t("Check-in", "الحضور")} value={today.checkIn} sub={t("On time", "في الوقت")} tone="primary" />
            <TodayTile icon={LogOut} label={t("Check-out", "الانصراف")} value={today.checkOut ?? "—"} sub={today.checkOut ? "" : t("Still working", "ما زلت أعمل")} tone="muted" />
            <TodayTile icon={CalendarClock} label={t("Remaining", "المتبقي")} value={fmtHM(remainingMin)} sub={`${t("of", "من")} ${today.targetHours}h`} tone="amber" />
          </div>
          <div className="px-5 pb-5">
            <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted-foreground/70">
              <span>{t("Today's progress", "تقدّم اليوم")}</span>
              <span className="tabular-nums">{fmtHM(workedMin)} / {today.targetHours}h · {dayProgress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted/50"><motion.div initial={{ width: 0 }} animate={{ width: `${dayProgress}%` }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary" /></div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" className="gap-1.5"><LogOut className="size-3.5" />{t("Clock out", "تسجيل انصراف")}</Button>
              <Button size="sm" variant="outline" className="gap-1.5"><Coffee className="size-3.5" />{t("Take break", "استراحة")}</Button>
            </div>
          </div>
        </Card>

        {/* quick actions */}
        <Card className="ring-1 ring-foreground/10 lg:col-span-4">
          <CardHead icon={Sparkles} title={t("Quick actions", "إجراءات سريعة")} />
          <div className="grid grid-cols-2 gap-2.5 p-4">
            {quickActions.map((a) => (
              <button key={a.id} type="button" className="group flex flex-col items-start gap-2 rounded-xl border border-border/60 bg-muted/15 p-3 text-start ring-1 ring-foreground/5 transition-all hover:border-primary/30 hover:bg-primary/[0.04]">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/12 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"><a.icon className="size-4" /></span>
                <span className="text-[12px] font-semibold leading-tight">{isAr ? a.ar : a.label}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* ── main grid ── */}
      <div className="grid items-start gap-6 lg:grid-cols-12">
        {/* left column */}
        <div className="space-y-6 lg:col-span-8">
          {/* 18 · attendance summary */}
          <Card className="ring-1 ring-foreground/10">
            <CardHead icon={CalendarDays} title={t("Attendance summary", "ملخّص الحضور")} desc={isAr ? attendanceSummary.monthLabelAr : attendanceSummary.monthLabel}
              action={<Badge variant="outline" className="gap-1 border-emerald-500/35 bg-emerald-500/10 text-[11px] text-emerald-500"><TrendingUp className="size-3" />{attendanceSummary.onTimePct}% {t("on-time", "في الوقت")}</Badge>} />
            <div className="grid grid-cols-2 gap-3 px-5 py-4 sm:grid-cols-5">
              <SummaryStat value={attendanceSummary.presentDays} label={t("Present", "حضور")} tone="emerald" />
              <SummaryStat value={attendanceSummary.remoteDays} label={t("Remote", "عن بُعد")} tone="violet" />
              <SummaryStat value={attendanceSummary.leaveDays} label={t("Leave", "إجازة")} tone="amber" />
              <SummaryStat value={attendanceSummary.lateDays} label={t("Late", "تأخير")} tone="rose" />
              <SummaryStat value={`${attendanceSummary.avgHours}h`} label={t("Avg / day", "متوسط/يوم")} tone="primary" />
            </div>
            <div className="grid gap-2.5 border-t border-border/50 px-5 py-4 sm:grid-cols-5">
              {attendanceSummary.week.map((d) => (
                <div key={d.day} className={cn("flex flex-col gap-1.5 rounded-xl border p-2.5",
                  d.status === "complete" && "border-emerald-500/25 bg-emerald-500/[0.05]",
                  d.status === "current" && "border-primary/40 bg-primary/[0.06] ring-1 ring-primary/15",
                  d.status === "leave" && "border-amber-500/25 bg-amber-500/[0.05]",
                  d.status === "upcoming" && "border-border/60")}>
                  <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {isAr ? d.dayAr : d.day}
                    {d.status === "complete" && <CheckCircle2 className="size-3 text-emerald-500" />}
                    {d.status === "current" && <span className="size-1.5 rounded-full bg-primary" />}
                    {d.status === "leave" && <Plane className="size-3 text-amber-500" />}
                  </div>
                  <div className="text-[16px] font-bold tabular-nums leading-none">{d.hours != null ? d.hours.toFixed(1) : "—"}<span className="ms-0.5 text-[9px] font-medium text-muted-foreground/55">{d.hours != null ? "h" : ""}</span></div>
                  <div className="text-[9.5px] tabular-nums text-muted-foreground/60">{d.clockIn ? `${d.clockIn}–${d.clockOut ?? "…"}` : t("—", "—")}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-border/50 px-5 py-3.5 text-[11px] text-muted-foreground/70">
              <span>{t("Worked this month", "ساعات هذا الشهر")}</span>
              <span className="tabular-nums"><span className="text-[15px] font-bold text-foreground">{attendanceSummary.workedHours}h</span> / {attendanceSummary.expectedHours}h</span>
            </div>
          </Card>

          {/* 10–11 · leave balance + upcoming */}
          <Card className="ring-1 ring-foreground/10">
            <CardHead icon={Plane} title={t("Leave balance", "رصيد الإجازات")} desc={t("Entitlement and upcoming time off", "الاستحقاق والإجازات القادمة")}
              action={<Button size="sm" variant="outline" className="gap-1.5"><Plus className="size-3.5" />{t("Request", "طلب")}</Button>} />
            <div className="grid gap-4 p-5 md:grid-cols-[220px_1fr]">
              {/* balance donut-ish */}
              <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-muted/15 p-4">
                <div className="relative grid size-20 shrink-0 place-items-center">
                  <svg viewBox="0 0 36 36" className="size-20 -rotate-90">
                    <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-muted" strokeWidth="4" />
                    <motion.circle cx="18" cy="18" r="15.5" fill="none" className="stroke-primary" strokeWidth="4" strokeLinecap="round" strokeDasharray={2 * Math.PI * 15.5} initial={{ strokeDashoffset: 2 * Math.PI * 15.5 }} animate={{ strokeDashoffset: 2 * Math.PI * 15.5 * (1 - leave.balanceDays / leave.totalDays) }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} />
                  </svg>
                  <div className="absolute text-center"><div className="text-[18px] font-bold tabular-nums leading-none">{leave.balanceDays}</div><div className="text-[8px] uppercase tracking-wider text-muted-foreground/60">{t("days", "يوم")}</div></div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">{t("Available", "متاح")}</div>
                  <div className="text-[13px] font-semibold">{leave.balanceDays} {t("of", "من")} {leave.totalDays} {t("days", "يوم")}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground/65">{leave.usedDays} {t("used this year", "مستخدمة هذا العام")}</div>
                </div>
              </div>
              {/* breakdown */}
              <div className="space-y-2.5">
                {leave.breakdown.map((b) => {
                  const remaining = b.total - b.used
                  return (
                    <div key={b.id} className="space-y-1">
                      <div className="flex items-baseline justify-between text-[11.5px]"><span className="font-medium">{isAr ? b.labelAr : b.label}</span><span className="tabular-nums text-muted-foreground/65"><span className="font-semibold text-foreground">{remaining}</span> / {b.total} {t("days", "يوم")}</span></div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted/40"><motion.div initial={{ width: 0 }} animate={{ width: `${(b.used / b.total) * 100}%` }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className={cn("h-full rounded-full", b.color === "primary" && "bg-primary", b.color === "amber" && "bg-amber-400", b.color === "emerald" && "bg-emerald-400")} /></div>
                    </div>
                  )
                })}
              </div>
            </div>
            {/* upcoming leave */}
            <div className="border-t border-border/50 px-5 py-4">
              <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/65">{t("Upcoming leave", "الإجازات القادمة")}</div>
              {leave.upcoming.map((u) => (
                <div key={u.id} className="flex items-center justify-between gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.05] px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500"><Plane className="size-4" /></span>
                    <div><div className="text-[12.5px] font-semibold">{isAr ? u.rangeAr : u.range}</div><div className="text-[11px] text-muted-foreground/70">{isAr ? u.typeAr : u.type} · {u.days} {t("days", "أيام")}</div></div>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-[10px] text-emerald-500"><Check className="me-1 size-3" />{isAr ? u.statusAr : u.status}</Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* 12 · my pending requests */}
          <Card className="ring-1 ring-foreground/10">
            <CardHead icon={ClipboardList} title={t("My pending requests", "طلباتي المعلّقة")} desc={t("Submissions awaiting action", "طلبات بانتظار الإجراء")}
              action={<Badge variant="secondary">{myRequests.length}</Badge>} />
            <div className="divide-y divide-border/60">
              {myRequests.map((r) => {
                const Icon = REQ_ICONS[r.kind] ?? FileText
                return (
                  <div key={r.id} className="flex items-center gap-3 px-5 py-3.5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Icon className="size-4" /></span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold">{isAr ? r.titleAr : r.title}</div>
                      <div className="mt-0.5 text-[11.5px] text-muted-foreground/70">{isAr ? r.detailAr : r.detail} · {isAr ? r.submittedAr : r.submitted}</div>
                    </div>
                    <Badge variant="outline" className="shrink-0 border-amber-400/40 bg-amber-400/10 text-[10px] text-amber-500">{isAr ? r.statusAr : r.status}</Badge>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* right column */}
        <div className="space-y-6 lg:col-span-4">
          {/* 14 · latest payslip */}
          <Card className="ring-1 ring-foreground/10">
            <CardHead icon={Wallet} title={t("Latest payslip", "آخر قسيمة راتب")} desc={isAr ? payslip.monthAr : payslip.month}
              action={<Badge variant="outline" className="border-emerald-500/35 bg-emerald-500/10 text-[10px] text-emerald-500">{isAr ? payslip.statusAr : payslip.status}</Badge>} />
            <div className="p-5">
              <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-4">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">{t("Net pay", "صافي الراتب")}</div>
                <div className="mt-1 metal-text text-[26px] font-bold tabular-nums leading-none">{money(payslip.net, isAr ? payslip.currencyAr : payslip.currency, isAr)}</div>
                <div className="mt-1 text-[11px] text-muted-foreground/65">{t("Paid", "دُفع")} {isAr ? payslip.payDateAr : payslip.payDate}</div>
              </div>
              <div className="mt-3 space-y-2">
                {payslip.lines.map((l) => (
                  <div key={l.label} className="flex items-center justify-between text-[12px]">
                    <span className="text-muted-foreground/80">{isAr ? l.labelAr : l.label}</span>
                    <span className={cn("font-semibold tabular-nums", l.kind === "deduction" ? "text-rose-500" : "text-foreground")}>{l.amount < 0 ? "−" : ""}{money(Math.abs(l.amount), isAr ? payslip.currencyAr : payslip.currency, isAr)}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="mt-4 w-full gap-1.5"><FileText className="size-3.5" />{t("View full payslip", "عرض القسيمة كاملة")}<ArrowRight className={cn("size-3.5", isAr && "rotate-180")} /></Button>
            </div>
          </Card>

          {/* 15 · benefits / allowances */}
          <Card className="ring-1 ring-foreground/10">
            <CardHead icon={Gift} title={t("Benefits & allowances", "المزايا والبدلات")} desc={`${money(allowances.monthlyTotal, isAr ? allowances.currencyAr : allowances.currency, isAr)} / ${t("mo", "شهر")}`} />
            <div className="grid grid-cols-2 gap-2.5 p-4">
              {allowances.items.map((a) => {
                const Icon = ALLOW_ICONS[a.icon] ?? Banknote
                return (
                  <div key={a.id} className="rounded-xl border border-border/60 bg-muted/15 p-3">
                    <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground/60"><Icon className="size-3.5 text-primary" />{isAr ? a.labelAr : a.label}</div>
                    <div className="mt-1 text-[14px] font-bold tabular-nums">{money(a.amount, isAr ? allowances.currencyAr : allowances.currency, isAr)}</div>
                  </div>
                )
              })}
            </div>
            <div className="space-y-1.5 border-t border-border/50 px-4 py-3.5">
              {allowances.benefits.map((b) => {
                const Icon = BENEFIT_ICONS[b.icon] ?? Heart
                return <div key={b.id} className="flex items-center gap-2 text-[11.5px] text-muted-foreground/80"><Icon className="size-3.5 shrink-0 text-primary/70" />{isAr ? b.labelAr : b.label}</div>
              })}
            </div>
          </Card>

          {/* 17 · HR notifications */}
          <Card className="ring-1 ring-foreground/10">
            <CardHead icon={Bell} title={t("HR notifications", "إشعارات الموارد البشرية")}
              action={<Badge variant="secondary">{hrNotifications.length}</Badge>} />
            <div className="divide-y divide-border/60">
              {hrNotifications.map((n) => {
                const Icon = NOTIF_ICONS[n.icon] ?? Bell
                const tone = n.kind === "success" ? "text-emerald-500 bg-emerald-500/12" : n.kind === "action" ? "text-primary bg-primary/12" : n.kind === "alert" ? "text-rose-500 bg-rose-500/12" : "text-sky-500 bg-sky-500/12"
                return (
                  <div key={n.id} className="flex gap-3 px-5 py-3.5">
                    <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", tone)}><Icon className="size-4" /></span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2"><div className="text-[12.5px] font-semibold leading-snug">{isAr ? n.titleAr : n.title}</div><span className="shrink-0 text-[10px] text-muted-foreground/55">{isAr ? n.timeAr : n.time}</span></div>
                      <div className="mt-0.5 text-[11.5px] leading-snug text-muted-foreground/70">{isAr ? n.bodyAr : n.body}</div>
                      {n.cta && <button className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline">{isAr ? n.ctaAr : n.cta}<ArrowRight className={cn("size-3", isAr && "rotate-180")} /></button>}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* ── 13 · pending approvals (manager) ── */}
      {emp.isManager && (
        <Card className="ring-1 ring-foreground/10">
          <CardHead icon={BadgeCheck} title={t("Pending approvals", "الموافقات المعلّقة")} desc={t("Requests from your team awaiting your decision", "طلبات من فريقك بانتظار قرارك")}
            action={<Badge className="bg-primary/15 text-primary">{approvals.length} {t("to review", "للمراجعة")}</Badge>} />
          <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
            {approvals.map((a) => {
              const Icon = APPROVAL_ICONS[a.kind] ?? FileText
              return (
                <div key={a.id} className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-muted/15 p-4 ring-1 ring-foreground/5">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-9"><AvatarFallback className="bg-primary/12 text-[11px] font-bold text-primary">{a.initials}</AvatarFallback></Avatar>
                    <div className="min-w-0 flex-1"><div className="truncate text-[12.5px] font-semibold">{isAr ? a.whoAr : a.who}</div><div className="text-[10.5px] text-muted-foreground/65">{isAr ? a.submittedAr : a.submitted}</div></div>
                    <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-3.5" /></span>
                  </div>
                  <div className="rounded-xl border border-border/50 bg-card px-3 py-2">
                    <div className="text-[12px] font-semibold">{isAr ? a.titleAr : a.title}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground/70">{isAr ? a.detailAr : a.detail}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 gap-1.5"><Check className="size-3.5" />{t("Approve", "موافقة")}</Button>
                    <Button size="sm" variant="outline" className="flex-1 gap-1.5 text-rose-500 hover:bg-rose-500/10 hover:text-rose-500"><X className="size-3.5" />{t("Decline", "رفض")}</Button>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}

// ─── tiles ───────────────────────────────────────────────────────────────────
function TodayTile({ icon: Icon, label, value, sub, tone }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub?: string; tone: "emerald" | "primary" | "amber" | "muted" }) {
  const toneCls = tone === "emerald" ? "bg-emerald-500/12 text-emerald-500" : tone === "primary" ? "bg-primary/12 text-primary" : tone === "amber" ? "bg-amber-500/12 text-amber-500" : "bg-muted text-muted-foreground"
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/15 p-3.5">
      <span className={cn("flex size-8 items-center justify-center rounded-lg", toneCls)}><Icon className="size-4" /></span>
      <div className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/55">{label}</div>
      <div className="mt-0.5 text-[17px] font-bold tabular-nums leading-tight">{value}</div>
      {sub && <div className="text-[10.5px] text-muted-foreground/60">{sub}</div>}
    </div>
  )
}

function SummaryStat({ value, label, tone }: { value: string | number; label: string; tone: "emerald" | "violet" | "amber" | "rose" | "primary" }) {
  const toneCls = tone === "emerald" ? "text-emerald-500" : tone === "violet" ? "text-violet-500" : tone === "amber" ? "text-amber-500" : tone === "rose" ? "text-rose-500" : "text-primary"
  return (
    <div className="rounded-xl border border-border/60 bg-muted/15 p-3 text-center">
      <div className={cn("text-[22px] font-bold tabular-nums leading-none", toneCls)}>{value}</div>
      <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">{label}</div>
    </div>
  )
}
