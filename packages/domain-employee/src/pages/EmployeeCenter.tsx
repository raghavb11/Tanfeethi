import * as React from "react"
import { useNavigate } from "react-router-dom"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  AlertTriangle, ArrowLeft, ArrowRight, Banknote, BadgeCheck, BedDouble, Bell, Building2, CalendarCheck, CalendarDays, Car, Check,
  ChevronLeft, ChevronRight, ClipboardList, Clock, Coffee, FileCheck2, FileText, Gift, GraduationCap, Heart, HeartHandshake, Home, IdCard,
  Laptop, LineChart, Link2, LogIn, LogOut, Mail, MapPin, Phone, Plane, Plus, Receipt, Shield, TrendingUp, Umbrella, Users,
  UtensilsCrossed, Wallet, X,
} from "lucide-react"

import { allowances, approvals, emp, hrNotifications, myRequests, payslip } from "../data/mock/center"
import { ageOf, RELATION, STATUS, useDependants } from "../data/mock/dependants"
import {
  clockIn, clockInAgain, clockOut, dayStatus, lateBy, nowTime, remainingMinutes, toggleBreak, useClock, workedMinutes,
} from "../data/mock/clock"
import { executiveVisits, performance, ROTATIONS, SERVICES, TODAY, WEEK, WEEK_TARGET_H } from "../data/mock/hub"
import { HOLIDAYS, type LeaveType, useLiveLeaveTypes } from "../data/mock/leave"
import { LeaveDistribution, PendingLeaveList } from "../components/LeaveWidgets"
import { childrenOf, ME_ID, personById } from "../data/mock/org"
import {
  Bar, Chip, GoldButton, hmShort, IconBadge, Initials, OutlineButton, Page, Ring, SectionCard, Separator, ServiceButton, Tile, to12h,
} from "../components/wijha"
import { HoursGlyph, WeeklyHoursDialog } from "../components/WeeklyHoursDialog"
import { initialsOf, OrgStructureDialog } from "../components/OrgStructureDialog"
import { RotationCard } from "../components/RotationCard"

type IconType = React.ComponentType<{ className?: string; strokeWidth?: number }>
const SERVICE_ICON: Record<string, IconType> = {
  plane: Plane, bed: BedDouble, utensils: UtensilsCrossed, car: Car, laptop: Laptop, graduation: GraduationCap, idcard: IdCard,
}
const ALLOW_ICONS: Record<string, IconType> = { home: Home, car: Car, phone: Phone, school: GraduationCap }
const BENEFIT_ICONS: Record<string, IconType> = { heart: Heart, shield: Shield, plane: Plane }
const NOTIF_ICONS: Record<string, IconType> = { "file-check": FileCheck2, wallet: Wallet, gift: Gift, "calendar-check": CalendarCheck }
const REQ_ICONS: Record<string, IconType> = { leave: Plane, expense: Receipt, letter: FileText, document: FileText }
const APPROVAL_ICONS: Record<string, IconType> = { leave: Plane, expense: Receipt, overtime: Clock }

const money = (n: number, isAr: boolean) => (isAr ? `${n.toLocaleString("en-US")} ر.س` : `SAR ${n.toLocaleString("en-US")}`)

/** Employee hub — Figma 2028:760 (web) / 3182:10064 (phone). */
export default function EmployeeCenter() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const [weekOpen, setWeekOpen] = React.useState(false)
  const [orgOpen, setOrgOpen] = React.useState(false)

  // minute tick so the live worked time keeps moving
  const [, tick] = React.useReducer((n: number) => n + 1, 0)
  React.useEffect(() => { const id = window.setInterval(tick, 30_000); return () => window.clearInterval(id) }, [])

  const clock = useClock()
  const weekMin = WEEK.reduce((n, d) => n + (d.isToday ? workedMinutes(clock) : d.minutes ?? 0), 0)

  return (
    <Page>
      <AttendanceHero />

      {/* ── main grid: wide column (start) · narrow column (end) — 729 / 480 at 1440 ── */}
      <div className="mt-10 grid items-start gap-5 xl:grid-cols-[minmax(0,729fr)_minmax(0,480fr)]">
        <div className="min-w-0 space-y-6">
          {/* three small cards */}
          <div className="grid gap-6 sm:grid-cols-3">
            <button type="button" onClick={() => navigate("/benefits/partners")}
              className="flex h-[81px] items-center justify-center gap-3 rounded-xl bg-[#1aad70] px-5 text-white transition-[filter] hover:brightness-110"
              aria-label={t("WalaPlus loyalty programme", "برنامج ولاء بلس")}>
              <HeartHandshake className="size-9" strokeWidth={1.6} />
              <span className="flex flex-col items-start leading-none">
                <span className="text-[19px] font-bold">ولاء بلس</span>
                <span className="mt-1 text-[16px] font-extrabold tracking-tight">WalaPlus</span>
              </span>
            </button>

            <button type="button" onClick={() => navigate("/services")} className="panel flex h-[81px] items-center gap-3 rounded-xl px-5 text-start transition-colors hover:bg-secondary/40">
              <Car className="size-6 shrink-0 text-primary" strokeWidth={1.6} />
              <span className="min-w-0">
                <span className="block text-[22px] font-semibold leading-tight">{executiveVisits.count} {t("visits", "زيارات")}</span>
                <span className="block text-[12.5px] text-muted-foreground">{t("Executive services", "خدمات التنفيذي")}</span>
              </span>
            </button>

            <button type="button" onClick={() => setWeekOpen(true)} className="panel flex h-[81px] items-center gap-3 rounded-xl px-5 text-start transition-colors hover:bg-secondary/40"
              aria-haspopup="dialog">
              <HoursGlyph className="size-7" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[16px] font-semibold leading-tight">
                  {Math.floor(weekMin / 60)} {t("h", "ساعة")} <span className="text-[13px] font-medium text-muted-foreground">/ {WEEK_TARGET_H} {t("h", "ساعة")}</span>
                </span>
                <span className="block truncate text-[12.5px] text-muted-foreground">{t("Your hours this week", "دوامك لهذا الأسبوع")}</span>
              </span>
              {isAr ? <ChevronLeft className="size-4 shrink-0 text-icon" /> : <ChevronRight className="size-4 shrink-0 text-icon" />}
            </button>
          </div>

          <BalanceCard />

          <div className="grid items-stretch gap-6 md:grid-cols-2">
            <PerformanceCard />
            <OrgCard onOpen={() => setOrgOpen(true)} />
          </div>
        </div>

        <div className="min-w-0 space-y-6">
          <ShiftsCard />
          <SectionCard icon={Link2} title={t("Services", "خدمات")}>
            <div className="grid grid-cols-4 gap-x-2 gap-y-6 pt-2">
              {SERVICES.map((s) => (
                <ServiceButton key={s.id} icon={SERVICE_ICON[s.icon]} label={isAr ? s.labelAr : s.label} onClick={() => navigate(s.to)} />
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* ── more of the employee record (kept from the previous Employee Center) ── */}
      <MoreSection />

      <WeeklyHoursDialog open={weekOpen} onOpenChange={setWeekOpen} />
      <OrgStructureDialog open={orgOpen} onOpenChange={setOrgOpen} />
    </Page>
  )
}

// ─── hero: today's attendance ────────────────────────────────────────────────
function AttendanceHero() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const clock = useClock()
  const status = dayStatus(clock)
  const worked = workedMinutes(clock)
  const remaining = remainingMinutes(clock)
  const onBreak = !!clock.breakStart
  const [confirm, setConfirm] = React.useState<null | { action: "in" | "out"; at: string }>(null)
  const [flash, setFlash] = React.useState<string | null>(null)

  const action: "in" | "out" = status === "working" ? "out" : "in"
  const early = confirm?.action === "out" && remaining > 0
  const late = confirm?.action === "in" ? lateBy(confirm.at) : 0

  const commit = () => {
    if (!confirm) return
    if (confirm.action === "out") clockOut()
    else if (status === "done") clockInAgain()
    else clockIn()
    setFlash(confirm.action === "out" ? t(`Checked out at ${to12h(confirm.at)}`, `تم تسجيل الخروج ${to12h(confirm.at)}`) : t(`Checked in at ${to12h(confirm.at)}`, `تم تسجيل الدخول ${to12h(confirm.at)}`))
    setConfirm(null)
    window.setTimeout(() => setFlash(null), 3000)
  }

  const rows = [
    { label: t("Check-in", "حضور"), value: to12h(clock.checkIn) },
    { label: t("Check-out", "إنصراف"), value: clock.checkOut ? to12h(clock.checkOut) : "—" },
    { label: t("Hours remaining", "الساعات المتبقية"), value: status === "not-started" ? "—" : `${Math.floor(remaining / 60)}h : ${String(remaining % 60).padStart(2, "0")}m` },
  ]

  return (
    <section className="highlight-card hl-green rounded-2xl px-5 py-6 sm:py-10 sm:ps-6 sm:pe-14">
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        {/* start: date + actions */}
        <div className="flex min-w-0 flex-col gap-6 md:w-[390px] md:justify-between md:self-stretch">
          <div className="space-y-2">
            <h2 className="text-[24px] font-normal leading-[38px] tracking-[-0.01em] sm:text-[27px]">
              {isAr ? `${TODAY.weekdayAr} -- ${TODAY.dateAr}` : `${TODAY.weekday} — ${TODAY.date}`}
            </h2>
            <p className="text-[12.5px] text-foreground/90">{t("Manage your attendance, leave and expenses smoothly", "أدر حضورك و إجازاتك ومصاريفك بسلاسة")}</p>
          </div>

          {/* geofence strip — drawn on the phone frame only */}
          <div className="flex items-center justify-between gap-2 rounded-lg bg-success-fill px-3 py-2 text-[12px] md:hidden">
            <span className="inline-flex items-center gap-1.5 text-success"><MapPin className="size-3.5" />{isAr ? TODAY.geofenceAr : TODAY.geofence}</span>
            <span className="text-muted-foreground">{t(`Accuracy ${TODAY.accuracyM} m`, `دقة ${TODAY.accuracyM} م`)}</span>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:gap-6">
            {action === "out" ? (
              <button type="button" onClick={() => setConfirm({ action: "out", at: nowTime() })}
                className="inline-flex h-[34px] flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--error)] text-[13px] font-bold text-white transition-[filter] hover:brightness-110">
                <LogOut className="size-4 md:hidden" />{t("Check out", "تسجيل خروج")}
              </button>
            ) : (
              <GoldButton className="h-[34px] flex-1 text-[13px] font-bold" onClick={() => setConfirm({ action: "in", at: nowTime() })}>
                <LogIn className="size-4" />{status === "done" ? t("Check in again", "تسجيل دخول مرة أخرى") : t("Check in", "تسجيل دخول")}
              </GoldButton>
            )}
            {status === "working" && (
              <OutlineButton className={cn("h-[34px] flex-1 text-[13px] font-bold", onBreak && "border-warning/60 text-warning")} onClick={toggleBreak} aria-pressed={onBreak}>
                <Coffee className="size-4 md:hidden" />{onBreak ? t("End break", "إنهاء الإستراحة") : t("Break", "إستراحة")}
              </OutlineButton>
            )}
          </div>

          {flash && <p className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-success"><Check className="size-3.5" />{flash}</p>}

          {confirm && (
            <div className={cn("rounded-xl p-3.5 ring-1", early || late > 0 ? "bg-warning-fill ring-warning/30" : "bg-background/70 ring-border")}>
              <p className="text-[13px] font-semibold">
                {confirm.action === "out" ? t(`Check out at ${to12h(confirm.at)}?`, `تسجيل الخروج الساعة ${to12h(confirm.at)}؟`) : t(`Check in at ${to12h(confirm.at)}?`, `تسجيل الدخول الساعة ${to12h(confirm.at)}؟`)}
              </p>
              {early && (
                <p className="mt-1.5 flex items-start gap-1.5 text-[12px] text-warning">
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                  {t(`That is ${hmShort(remaining, false)} short of your ${clock.targetHours}-hour day — your manager sees the shortfall.`, `هذا أقل بـ ${hmShort(remaining, true)} من يوم العمل (${clock.targetHours} ساعات) — سيظهر النقص لمديرك.`)}
                </p>
              )}
              {late > 0 && (
                <p className="mt-1.5 flex items-start gap-1.5 text-[12px] text-warning">
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                  {t("After the 8:00 AM start — the day is recorded as late.", "بعد بداية الدوام 8:00 AM — سيُسجَّل اليوم كتأخير.")}
                </p>
              )}
              <div className="mt-3 flex justify-end gap-2">
                <OutlineButton size="sm" onClick={() => setConfirm(null)}>{t("Cancel", "إلغاء")}</OutlineButton>
                <GoldButton size="sm" onClick={commit}><Check className="size-3.5" />{t("Confirm", "تأكيد")}</GoldButton>
              </div>
            </div>
          )}
        </div>

        {/* end: ring + times */}
        <div className="flex items-center gap-8 self-center md:self-auto">
          <dl className="w-[150px] space-y-2.5 text-[12px]">
            {rows.map((r) => (
              <div key={r.label} className="flex items-center justify-between gap-3">
                <dt className="text-foreground/90">{r.label}</dt>
                <dd className="font-medium tabular-nums" dir="ltr">{r.value}</dd>
              </div>
            ))}
          </dl>
          <Ring value={worked / (clock.targetHours * 60)} size={140} stroke={14}>
            <span>
              <span className="block text-[10.5px] text-foreground/80">{onBreak ? t("On break", "في إستراحة") : t("Your attendance", "سجل حضورك")}</span>
              <span className="mt-1 block text-[18px] font-bold">{hmShort(worked, isAr)}</span>
            </span>
          </Ring>
        </div>
      </div>
    </section>
  )
}

// ─── my balance ──────────────────────────────────────────────────────────────
function BalanceCard() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const types = useLiveLeaveTypes()
  const annual = types.find((x) => x.id === "annual")!
  const holiday = HOLIDAYS[0]
  const left = (x: LeaveType) => x.entitled - x.used

  return (
    <SectionCard icon={Umbrella} title={t("My balance", "رصيدي")}
      action={<GoldButton size="sm" onClick={() => navigate("/leave/request")}><Plus className="size-4" />{t("Request leave", "طلب إجازة")}</GoldButton>}>
      <div className="grid gap-6 sm:grid-cols-2">
        <Tile className="flex items-start gap-3">
          <IconBadge icon={Umbrella} tone="violet" />
          <div className="min-w-0">
            <div className="text-[12.5px] text-muted-foreground">{t("Your leave balance", "رصيد إجازتك")}</div>
            <div className="mt-1 text-[14.5px]"><b className="text-[17px] font-semibold">{left(annual)}</b> {t("days", "يوم")}</div>
            <div className="mt-2 text-[12px] text-muted-foreground">{annual.used}/{annual.entitled} {t("used", "مستخدم")}</div>
          </div>
        </Tile>
        <Tile className="flex items-start gap-3">
          <IconBadge icon={Umbrella} tone="violet" />
          <div className="min-w-0">
            <div className="text-[12.5px] text-muted-foreground">{t("Upcoming holiday", "إجازة قادمة")}</div>
            <div className="mt-1 text-[17px] font-semibold">{isAr ? holiday.nameAr : holiday.name}</div>
            <div className="mt-2 text-[12px] text-muted-foreground">{isAr ? holiday.startAr : holiday.start} · {holiday.days} {t("days", "أيام")}</div>
          </div>
        </Tile>
      </div>

      <div className="mb-3 mt-4 text-[12.5px] text-muted-foreground">{t("Requests under review", "طلبات قيد المراجعة")}</div>
      <PendingLeaveList limit={2} />

      <Separator className="mt-6 h-0.5" />
      <div className="mt-4 text-[12.5px] text-muted-foreground">{t("Leave distribution", "توزيع الإجازات")}</div>
      <div className="mt-1"><LeaveDistribution /></div>
    </SectionCard>
  )
}

// ─── org structure ───────────────────────────────────────────────────────────
function OrgCard({ onOpen }: { onOpen: () => void }) {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const me = personById(ME_ID)!
  const mgr = me.managerId ? personById(me.managerId) : undefined
  const reports = childrenOf(ME_ID)
  const ini = (p: { nameAr: string; initials: string }) => (isAr ? initialsOf(p.nameAr) : p.initials)

  return (
    <SectionCard icon={Building2} title={t("Org structure", "الهيكل التنظيمي")} className="flex flex-col sm:px-4" bodyClassName="flex flex-1 flex-col">
      <div className="relative space-y-3">
        <span aria-hidden className="absolute inset-y-6 left-1/2 w-0.5 -translate-x-1/2 bg-secondary" />
        {mgr && (
          <div className="relative flex items-center gap-3 rounded-xl bg-background px-5 py-4">
            <Initials text={ini(mgr)} tone="violet" className="size-10" />
            <div className="min-w-0">
              <div className="text-[12px] text-muted-foreground">{t("Manager", "المدير")}</div>
              <div className="truncate text-[15px] font-semibold">{isAr ? mgr.nameAr : mgr.name}</div>
            </div>
          </div>
        )}
        <div className="relative flex items-center gap-3 rounded-xl px-5 py-6 [background-color:color-mix(in_oklab,var(--primary)_22%,var(--background))]">
          <Initials text={ini(me)} tone="accent" className="size-[46px]" />
          <div className="min-w-0">
            <div className="truncate text-[15px] font-semibold">{isAr ? me.nameAr : me.name}</div>
            <div className="truncate text-[12px] text-muted-foreground">{isAr ? me.titleAr : me.title}</div>
          </div>
        </div>
        <div className="relative flex items-center justify-between gap-3 rounded-xl bg-background px-5 py-3.5">
          <div className="min-w-0">
            <div className="text-[12px] text-muted-foreground">{t("Your direct reports", "تقاريرك المباشرة")}</div>
            <div className="text-[14px]"><b className="font-semibold">{reports.length}</b> {t(reports.length === 1 ? "employee" : "employees", reports.length >= 3 && reports.length <= 10 ? "موظفين" : "موظف")}</div>
          </div>
          {reports.length > 0 ? (
            <div className="flex -space-x-1.5 rtl:space-x-reverse">
              {reports.slice(0, 3).map((r) => (
                <span key={r.id} className="grid size-6 place-items-center rounded-full bg-secondary text-[9px] font-medium ring-2 ring-background" dir="ltr">{r.initials}</span>
              ))}
              {reports.length > 3 && <span className="grid size-6 place-items-center rounded-full bg-soft-accent text-[9px] text-primary ring-2 ring-background">+{reports.length - 3}</span>}
            </div>
          ) : <span className="text-[12px] text-muted-foreground">{t("None", "لا يوجد")}</span>}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-1 text-[12.5px] text-muted-foreground">
        <span className="inline-flex min-w-0 items-center gap-1.5"><Mail className="size-4 shrink-0 text-primary" /><span className="truncate" dir="ltr">{emp.email}</span></span>
        <span className="inline-flex items-center gap-1.5"><MapPin className="size-4 text-primary" />{isAr ? `${emp.cityAr} · ${emp.workModeAr}` : `${emp.city} · ${emp.workMode}`}</span>
      </div>

      <button type="button" onClick={onOpen} aria-haspopup="dialog"
        className="mt-auto inline-flex items-center gap-1.5 self-end pt-6 text-[13.5px] font-medium text-primary hover:underline">
        {t("View org structure", "عرض الهيكل التنظيمي")}
        {isAr ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
      </button>
    </SectionCard>
  )
}

// ─── performance ─────────────────────────────────────────────────────────────
function PerformanceCard() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  return (
    <SectionCard icon={LineChart} title={t("Performance", "الأداء")} className="flex flex-col" bodyClassName="flex flex-1 flex-col">
      <div>
        {performance.goals.map((g) => (
          <div key={g.id} className="border-b border-secondary py-3.5 first:pt-1">
            <div className="text-[14.5px]">{isAr ? g.titleAr : g.title}</div>
            <div className="mt-2 flex items-center gap-4">
              <Bar className="flex-1" value={g.pct} tone={g.pct >= 75 ? "success" : "warning"} />
              <span className="w-9 shrink-0 text-end text-[12.5px] text-muted-foreground tabular-nums" dir="ltr">{g.pct}%</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-8">
        <div className="max-w-[110px] text-[12.5px] text-muted-foreground">{t("Next review", "المراجعة القادمة")} · {isAr ? performance.nextReviewAr : performance.nextReview}</div>
        <div className="flex items-baseline gap-1.5" dir="ltr">
          <span className="text-[34px] font-bold leading-none">{performance.rating}</span>
          <span className="text-[13px] text-muted-foreground">/ {performance.outOf}</span>
        </div>
        <Chip tone="success" icon={TrendingUp}>{isAr ? performance.verdictAr : performance.verdict}</Chip>
      </div>
    </SectionCard>
  )
}

// ─── shift roster ────────────────────────────────────────────────────────────
function ShiftsCard() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  return (
    <SectionCard icon={CalendarDays} title={t("Shift roster", "جدول المناوبات")} className="sm:px-4"
      action={<span className="text-[12px] text-muted-foreground">{ROTATIONS.length} {t("rotations", "مناوبات")}</span>}>
      {ROTATIONS.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-muted-foreground">{t("No rotations scheduled.", "لا توجد مناوبات مجدولة.")}</p>
      ) : (
        <div className="space-y-4">
          {ROTATIONS.slice(0, 3).map((r) => <RotationCard key={r.id} r={r} />)}
        </div>
      )}
      {ROTATIONS.length > 3 && (
        <button type="button" onClick={() => navigate("/employee/shifts")} className="mx-auto mt-4 flex items-center gap-1 text-[13px] font-medium text-primary hover:underline">
          {t("View all", "عرض جميع المواعيد")}{isAr ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
        </button>
      )}
    </SectionCard>
  )
}

// ─── the rest of the employee record (requests, family, pay, benefits, HR, approvals) ──
function MoreSection() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const dependants = useDependants()
  const Arrow = isAr ? ArrowLeft : ArrowRight

  return (
    <div className="mt-10 grid items-start gap-6 lg:grid-cols-2 2xl:grid-cols-3">
      {/* my pending requests */}
      <SectionCard icon={ClipboardList} title={t("My requests", "طلباتي")} action={<Chip>{myRequests.length}</Chip>}>
        <div className="divide-y divide-border">
          {myRequests.map((r) => {
            const Icon = REQ_ICONS[r.kind] ?? FileText
            return (
              <div key={r.id} className="flex items-center gap-3 py-3 first:pt-0">
                <IconBadge icon={Icon} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-medium">{isAr ? r.titleAr : r.title}</div>
                  <div className="truncate text-[12px] text-muted-foreground">{isAr ? r.detailAr : r.detail} · {isAr ? r.submittedAr : r.submitted}</div>
                </div>
                <Chip tone={r.status === "Pending" ? "neutral" : "warning"}>{isAr ? r.statusAr : r.status}</Chip>
              </div>
            )
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <OutlineButton size="sm" onClick={() => navigate("/services")}><Receipt className="size-3.5" />{t("Submit expense", "تقديم مصروف")}</OutlineButton>
          <OutlineButton size="sm" onClick={() => navigate("/services")}><FileText className="size-3.5" />{t("Request letter", "طلب خطاب")}</OutlineButton>
        </div>
      </SectionCard>

      {/* my family */}
      <SectionCard icon={Users} title={t("My family", "عائلتي")}
        action={<OutlineButton size="sm" onClick={() => navigate("/employee/dependants/new")}><Plus className="size-3.5" />{t("Add", "إضافة")}</OutlineButton>}>
        {dependants.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-muted-foreground">{t("No dependants registered yet.", "لا يوجد معالون مسجّلون بعد.")}</p>
        ) : (
          <div className="space-y-2">
            {dependants.map((d) => (
              <button key={d.id} type="button" onClick={() => navigate(`/employee/dependants/${d.id}`)}
                className="flex w-full items-center gap-3 rounded-[10px] bg-background px-3 py-2.5 text-start transition-colors hover:bg-secondary/40">
                <Initials text={d.initials} tone="accent" className="size-9 text-[11px]" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px]">{isAr ? d.nameAr : d.name}</span>
                  <span className="block truncate text-[12px] text-muted-foreground">{isAr ? RELATION[d.relation].ar : RELATION[d.relation].en} · {ageOf(d)}</span>
                </span>
                {d.status !== "verified" && <Chip tone={d.status === "pending" ? "warning" : "error"}>{isAr ? STATUS[d.status].ar : STATUS[d.status].en}</Chip>}
              </button>
            ))}
          </div>
        )}
        <OutlineButton size="sm" className="mt-4 w-full" onClick={() => navigate("/employee/dependants")}>{t("Manage family", "إدارة العائلة")}</OutlineButton>
      </SectionCard>

      {/* latest payslip */}
      <SectionCard icon={Wallet} title={t("Latest payslip", "آخر قسيمة راتب")} action={<Chip tone="success">{isAr ? payslip.statusAr : payslip.status}</Chip>}>
        <Tile>
          <div className="text-[12px] text-muted-foreground">{t("Net pay", "صافي الراتب")} · {isAr ? payslip.monthAr : payslip.month}</div>
          <div className="mt-1 text-[26px] font-semibold tabular-nums text-primary">{money(payslip.net, isAr)}</div>
          <div className="mt-1 text-[12px] text-muted-foreground">{t("Paid", "دُفع")} {isAr ? payslip.payDateAr : payslip.payDate}</div>
        </Tile>
        <div className="mt-3 space-y-2">
          {payslip.lines.map((l) => (
            <div key={l.label} className="flex items-center justify-between text-[13px]">
              <span className="text-muted-foreground">{isAr ? l.labelAr : l.label}</span>
              <span className={cn("font-medium tabular-nums", l.kind === "deduction" && "text-error")}>{l.amount < 0 ? "−" : ""}{money(Math.abs(l.amount), isAr)}</span>
            </div>
          ))}
        </div>
        <OutlineButton size="sm" className="mt-4 w-full" onClick={() => navigate("/payslip")}><FileText className="size-3.5" />{t("View full payslip", "عرض القسيمة كاملة")}<Arrow className="size-3.5" /></OutlineButton>
      </SectionCard>

      {/* benefits & allowances */}
      <SectionCard icon={Gift} title={t("Benefits & allowances", "المزايا والبدلات")}
        action={<span className="text-[12px] text-muted-foreground">{money(allowances.monthlyTotal, isAr)} / {t("mo", "شهر")}</span>}>
        <div className="grid grid-cols-2 gap-3">
          {allowances.items.map((a) => {
            const Icon = ALLOW_ICONS[a.icon] ?? Banknote
            return (
              <Tile key={a.id} className="p-3">
                <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground"><Icon className="size-3.5 text-primary" />{isAr ? a.labelAr : a.label}</div>
                <div className="mt-1 text-[15px] font-semibold tabular-nums">{money(a.amount, isAr)}</div>
              </Tile>
            )
          })}
        </div>
        <div className="mt-4 space-y-1.5">
          {allowances.benefits.map((b) => {
            const Icon = BENEFIT_ICONS[b.icon] ?? Heart
            return <div key={b.id} className="flex items-center gap-2 text-[12.5px] text-muted-foreground"><Icon className="size-3.5 shrink-0 text-primary" />{isAr ? b.labelAr : b.label}</div>
          })}
        </div>
        <OutlineButton size="sm" className="mt-4 w-full" onClick={() => navigate("/benefits")}>{t("All benefits", "جميع المزايا")}<Arrow className="size-3.5" /></OutlineButton>
      </SectionCard>

      {/* HR notifications */}
      <SectionCard icon={Bell} title={t("HR notifications", "إشعارات الموارد البشرية")} action={<Chip>{hrNotifications.length}</Chip>}>
        <div className="divide-y divide-border">
          {hrNotifications.map((n) => {
            const Icon = NOTIF_ICONS[n.icon] ?? Bell
            const tone = n.kind === "success" ? "bg-success-fill text-success" : n.kind === "action" ? "bg-soft-accent text-primary" : n.kind === "alert" ? "bg-error-fill text-error" : "bg-info-fill text-info"
            return (
              <div key={n.id} className="flex gap-3 py-3 first:pt-0">
                <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", tone)}><Icon className="size-4" /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-[13.5px] font-medium leading-snug">{isAr ? n.titleAr : n.title}</div>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{isAr ? n.timeAr : n.time}</span>
                  </div>
                  <div className="mt-0.5 text-[12px] leading-snug text-muted-foreground">{isAr ? n.bodyAr : n.body}</div>
                  {n.cta && <button type="button" className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:underline">{isAr ? n.ctaAr : n.cta}<Arrow className="size-3" /></button>}
                </div>
              </div>
            )
          })}
        </div>
      </SectionCard>

      {/* pending approvals (manager) */}
      {emp.isManager && (
        <SectionCard icon={BadgeCheck} title={t("Pending approvals", "الموافقات المعلّقة")}
          action={<Chip tone="accent">{approvals.length} {t("to review", "للمراجعة")}</Chip>}>
          {approvals.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-muted-foreground">{t("Nothing waiting for you.", "لا شيء بانتظارك.")}</p>
          ) : (
            <div className="space-y-3">
              {approvals.map((a) => {
                const Icon = APPROVAL_ICONS[a.kind] ?? FileText
                return (
                  <Tile key={a.id} className="p-3.5">
                    <div className="flex items-center gap-3">
                      <Initials text={a.initials} tone="accent" className="size-9 text-[11px]" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13.5px] font-medium">{isAr ? a.whoAr : a.who}</div>
                        <div className="truncate text-[12px] text-muted-foreground">{isAr ? a.titleAr : a.title} · {isAr ? a.detailAr : a.detail}</div>
                      </div>
                      <Icon className="size-4 shrink-0 text-primary" />
                    </div>
                    <div className="mt-3 flex gap-2">
                      <GoldButton size="sm" className="flex-1"><Check className="size-3.5" />{t("Approve", "موافقة")}</GoldButton>
                      <OutlineButton size="sm" className="flex-1 text-error"><X className="size-3.5" />{t("Decline", "رفض")}</OutlineButton>
                    </div>
                  </Tile>
                )
              })}
            </div>
          )}
          <OutlineButton size="sm" className="mt-4 w-full" onClick={() => navigate("/manager")}>{t("Open manager view", "فتح واجهة المدير")}<Arrow className="size-3.5" /></OutlineButton>
        </SectionCard>
      )}
    </div>
  )
}
