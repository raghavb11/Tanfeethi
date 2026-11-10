import * as React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
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
import { childrenOf, ME_ID, personById, teamSize } from "../data/mock/org"
import {
  Bar, Chip, GoldButton, hmShort, IconBadge, Initials, OutlineButton, Page, Ring, SectionCard, ServiceButton, Tile, to12h,
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
  // ?popup=hours | org opens a popup directly (deep links and pixel captures)
  const [params] = useSearchParams()
  const [weekOpen, setWeekOpen] = React.useState(params.get("popup") === "hours")
  const [orgOpen, setOrgOpen] = React.useState(params.get("popup") === "org")

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
          {/* three small cards — 231 · 231 · 219 wide, 81 tall */}
          <div className="grid gap-6 sm:grid-cols-[231fr_231fr_219fr]">
            <button type="button" onClick={() => navigate("/benefits/partners")}
              className="flex h-[81px] items-center justify-center gap-3 rounded-xl bg-[#009e69] px-5 text-white transition-[filter] hover:brightness-110"
              aria-label={t("WalaPlus loyalty programme", "برنامج ولاء بلس")}>
              <HeartHandshake className="size-9" strokeWidth={1.6} />
              <span className="flex flex-col items-start leading-none">
                <span className="text-[19px] font-bold">ولاء بلس</span>
                <span className="mt-1 text-[16px] font-extrabold tracking-tight">WalaPlus</span>
              </span>
            </button>

            <button type="button" onClick={() => navigate("/services")} className="panel flex h-[81px] items-center gap-3 rounded-xl px-[18px] text-start transition-colors hover:bg-secondary/40">
              <Car className="size-6 shrink-0 text-primary" strokeWidth={1.6} />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="block text-[24px] font-semibold leading-[31px]">{executiveVisits.count} {t("visits", "زيارات")}</span>
                <span className="block text-[11.5px] leading-[15px] text-muted-foreground">{t("Al Tanfeethi Services", "خدمات التنفيذي")}</span>
              </span>
            </button>

            <button type="button" onClick={() => setWeekOpen(true)} className="panel flex h-[81px] items-center gap-3 rounded-xl px-[18px] text-start transition-colors hover:bg-secondary/40"
              aria-haspopup="dialog">
              <HoursGlyph className="size-6" />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="block truncate text-[14px] font-semibold leading-8">
                  {Math.floor(weekMin / 60)} {t("h", "ساعة")} <span className="font-normal">/ {WEEK_TARGET_H} {t("h", "ساعة")}</span>
                </span>
                <span className="block truncate text-[11.5px] leading-[15px] text-muted-foreground">{t("Your hours this week", "دوامك لهذا الأسبوع")}</span>
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
          <SectionCard icon={Link2} title={t("Services", "خدمات")} bodyClassName="mt-[22px]">
            <div className={cn("grid grid-cols-4 gap-y-6 pb-2 sm:justify-start sm:ps-[19px]",
              // columns hug their longest label (the English labels are wider than the 62px circles)
              isAr ? "sm:grid-cols-[repeat(4,62px)] sm:gap-x-[43px]" : "sm:grid-cols-[repeat(4,minmax(62px,auto))] sm:gap-x-[43px] sm:ps-9 [&_button>span:last-child]:text-[12px]")}>
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
    { label: t("Total hours", "أجمالي الساعات"), value: status === "not-started" ? "—" : `${Math.floor(worked / 60)}h : ${String(worked % 60).padStart(2, "0")}m` },
  ]

  // Figma 2101:2030 — 220 tall: 40 top/bottom, 24 start / 56 end padding, radius 16.
  return (
    <section className="highlight-card hl-green rounded-2xl px-5 py-6 sm:py-[39px] sm:ps-[23px] sm:pe-[55px]">
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        {/* start: date + actions (390 wide, title block and buttons pushed apart) */}
        <div className="flex min-w-0 flex-col gap-6 md:min-h-[140px] md:w-[390px] md:justify-between md:gap-4 md:self-stretch">
          <div className="space-y-2">
            <h2 className="text-[24px] font-normal leading-[38px] tracking-[-0.01em] sm:text-[27px]">
              {isAr ? `${TODAY.weekdayAr} -- ${TODAY.dateAr}` : `${TODAY.weekday} — ${TODAY.date}`}
            </h2>
            <p className="text-[12.5px] leading-4 text-muted-foreground">{t("Manage your attendance, leave and expenses with ease", "أدر حضورك و إجازاتك ومصاريفك بسلاسة")}</p>
          </div>

          {/* geofence strip — drawn on the phone frame only */}
          <div className="flex items-center justify-between gap-2 rounded-lg bg-success-fill px-3 py-2 text-[12px] md:hidden">
            <span className="inline-flex items-center gap-1.5 text-success"><MapPin className="size-3.5" />{isAr ? TODAY.geofenceAr : TODAY.geofence}</span>
            <span className="text-muted-foreground">{t(`Accuracy ${TODAY.accuracyM} m`, `دقة ${TODAY.accuracyM} م`)}</span>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:gap-6">
            {action === "out" ? (
              <button type="button" onClick={() => setConfirm({ action: "out", at: nowTime() })}
                className="inline-flex h-[34px] flex-1 items-center justify-center gap-2 rounded-lg bg-[rgba(180,35,24,0.5)] md:w-[181.5px] md:flex-none text-[13px] font-bold text-foreground transition-[filter] hover:brightness-125">
                <LogOut className="size-4 md:hidden" />{t("Check out", "تسجيل خروج")}
              </button>
            ) : (
              <GoldButton className="h-[34px] flex-1 text-[13px] font-bold" onClick={() => setConfirm({ action: "in", at: nowTime() })}>
                <LogIn className="size-4" />{status === "done" ? t("Check in again", "تسجيل دخول مرة أخرى") : t("Check in", "تسجيل دخول")}
              </GoldButton>
            )}
            {status === "working" && (
              <OutlineButton className={cn("h-[34px] flex-1 border-[1.5px] md:w-[184.5px] md:flex-none border-secondary text-[13px] font-bold", onBreak && "border-warning/60 text-warning")} onClick={toggleBreak} aria-pressed={onBreak}>
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

        {/* end: ring + times (ring 140, 32 gap, 135-wide list) */}
        <div className="flex items-center gap-8 self-center md:self-auto">
          <dl className="flex w-[135px] flex-col gap-2.5">
            {rows.map((r) => (
              <div key={r.label} className="flex h-[15px] items-center justify-between gap-2">
                <dt className="text-[11px] leading-[14px]">{r.label}</dt>
                <dd className="text-[11.5px] font-semibold leading-[15px] tabular-nums" dir="ltr">{r.value}</dd>
              </div>
            ))}
          </dl>
          <Ring value={worked / (clock.targetHours * 60)} size={140} stroke={18} track="var(--background)">
            <span className="flex flex-col items-center gap-[4.5px]">
              <span className="block text-[10.3px] leading-[13px] text-muted-foreground">{onBreak ? t("On break", "في إستراحة") : t("Your attendance", "سجل حضورك")}</span>
              <span className="block text-[17.2px] font-bold leading-[27px]">{hmShort(worked, isAr)}</span>
            </span>
          </Ring>
        </div>
      </div>
    </section>
  )
}

// ─── my balance ──────────────────────────────────────────────────────────────
/** Figma 2101:2180 — 729 × 503: tiles 96 tall, pending tiles 65, distribution rows 81. */
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
    <SectionCard icon={Umbrella} title={t("My balance", "رصيدي")} bodyClassName="mt-2"
      action={<GoldButton size="sm" className="gap-2 px-[17px] text-[12px]" onClick={() => navigate("/leave/request")}><Plus className="size-3" />{t("Request leave", "طلب إجازة")}</GoldButton>}>
      <div className="grid gap-6 sm:grid-cols-2">
        <BalanceTile label={t("Your leave balance", "رصيد إجازتك")}
          value={<><b className="text-[15.5px] font-semibold leading-5">{left(annual)}</b> <span className="text-[10px] leading-[13px]">{t("days", "يوم")}</span></>}
          sub={`${annual.used}/${annual.entitled} ${t("used", "مستخدم")}`} />
        <BalanceTile label={t("Upcoming leave", "إجازة قادمة")}
          value={<span className="text-[14px] font-semibold leading-[18px]">{isAr ? holiday.nameAr : holiday.name}</span>}
          sub={isAr ? holiday.startAr : holiday.start} subClass="text-[10px] leading-[13px]" />
      </div>

      <div className="mb-3 mt-4 text-[12.5px] leading-4 text-muted-foreground">{t("Requests under review", "طلبات قيد المراجعة")}</div>
      <PendingLeaveList limit={2} />

      <div aria-hidden className="mt-4 h-0.5 bg-gradient-to-r from-transparent via-secondary/75 to-transparent" />
      <div className="mt-4 text-[12.5px] leading-4 text-muted-foreground">{t("Leave breakdown", "توزيع الإجازات")}</div>
      <LeaveDistribution />
    </SectionCard>
  )
}

function BalanceTile({ label, value, sub, subClass = "text-[11px] leading-[14px]" }: { label: string; value: React.ReactNode; sub: string; subClass?: string }) {
  return (
    <div className="flex min-h-[96px] items-start gap-3 rounded-[10px] bg-background p-4 ring-1 ring-border ring-inset">
      <span className="grid size-[26px] shrink-0 place-items-center rounded-md bg-secondary">
        <Umbrella className="size-3.5 text-[#a997c7]" strokeWidth={1.75} />
      </span>
      <div className="flex min-w-0 flex-col gap-2">
        <div className="text-[11px] leading-[14px] text-muted-foreground">{label}</div>
        <div className="flex items-baseline gap-1">{value}</div>
        <div className={cn("text-muted-foreground", subClass)}>{sub}</div>
      </div>
    </div>
  )
}

// ─── org structure ───────────────────────────────────────────────────────────
/** Figma 2101:2277 — 352.5 × 424: manager 70, you 91, reports 58, 12px connectors. */
function OrgCard({ onOpen }: { onOpen: () => void }) {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const me = personById(ME_ID)!
  const mgr = me.managerId ? personById(me.managerId) : undefined
  const reports = childrenOf(ME_ID)
  const ini = (p: { nameAr: string; initials: string }) => (isAr ? initialsOf(p.nameAr) : p.initials)

  return (
    <SectionCard icon={Building2} title={t("Org chart", "الهيكل التنظيمي")} className="flex flex-col sm:px-[18px]" bodyClassName="mt-3 flex flex-1 flex-col">
      <div>
        {mgr && (
          <>
            <div className="flex h-[70px] items-center gap-3 rounded-xl bg-background px-4">
              <Initials text={ini(mgr)} tone="violet" className="size-[38px] text-[12px]" />
              <div className="min-w-0">
                <div className="text-[11px] leading-[14px] text-muted-foreground">{t("Manager", "المدير")}</div>
                <div className="mt-1 truncate text-[13px] font-semibold leading-[17px]">{isAr ? mgr.nameAr : mgr.name}</div>
              </div>
            </div>
            <OrgConnector />
          </>
        )}
        <div className="flex h-[91px] items-center gap-3 rounded-xl px-4 [background-color:color-mix(in_srgb,var(--primary)_18%,var(--background))]">
          <Initials text={ini(me)} tone="accent" className="size-11" />
          <div className="min-w-0">
            <div className="truncate text-[13px] font-semibold leading-[17px]">{isAr ? me.nameAr : me.name}</div>
            <div className="mt-1 truncate text-[11px] leading-[14px] text-muted-foreground">{isAr ? me.titleAr : me.title}</div>
          </div>
        </div>
        <OrgConnector />
        <div className="flex h-[58px] items-center justify-between gap-3 rounded-xl bg-background px-4">
          <div className="min-w-0">
            <div className="text-[11px] leading-[14px] text-muted-foreground">{t("Your direct reports", "تقاريرك المباشرة")}</div>
            <div className="mt-1 text-[12.5px] leading-4"><b className="font-semibold">{reports.length}</b> {t("Employee", reports.length >= 3 && reports.length <= 10 ? "موظفين" : "موظف")} <span className="text-[11.5px] text-muted-foreground">{t(`· ${teamSize(ME_ID)} extended`, `· ${teamSize(ME_ID)} ممتد`)}</span></div>
          </div>
          {reports.length > 0 ? (
            <div className="flex">
              {reports.slice(0, 3).map((r, i) => (
                <span key={r.id} className={cn("grid size-[26px] place-items-center rounded-full bg-secondary text-[9.5px] font-medium ring-2 ring-background", i > 0 && "-ms-[5px]")} dir="ltr">{r.initials}</span>
              ))}
              {reports.length > 3 && <span className="-ms-[5px] grid size-[26px] place-items-center rounded-full bg-soft-accent text-[9.5px] text-primary ring-2 ring-background" dir="ltr">{reports.length - 3}+</span>}
            </div>
          ) : <span className="text-[12px] text-muted-foreground">{t("None", "لا يوجد")}</span>}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-y-2 text-[11.5px] leading-[15px] text-muted-foreground">
        <span className="inline-flex h-7 min-w-0 items-center gap-1.5 px-2.5"><Mail className="size-[13px] shrink-0 text-primary" /><span className="truncate" dir="ltr">{emp.email}</span></span>
        <span className="inline-flex h-7 items-center gap-1.5 px-2.5"><MapPin className="size-[13px] text-primary" />{isAr ? `${emp.cityAr} · ${emp.workModeAr}` : `${emp.city} · ${emp.workMode}`}</span>
      </div>

      <button type="button" onClick={onOpen} aria-haspopup="dialog"
        className="mt-2 inline-flex h-10 w-full items-center justify-start gap-1.5 rounded-lg px-3 text-[12.5px] font-medium text-primary hover:bg-soft-accent">
        {t("View org chart", "عرض الهيكل التنظيمي")}
        {isAr ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
      </button>
    </SectionCard>
  )
}

/** 3 × 12 connector between the org tiles. */
function OrgConnector() {
  return <span aria-hidden className="mx-auto block h-3 w-[3px] rounded-full bg-secondary" />
}

// ─── performance ─────────────────────────────────────────────────────────────
/** Figma 2101:2340 — goal rows 61 tall (label 12.5, 34px % column, 6px bar), footer 36. */
function PerformanceCard() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  return (
    <SectionCard icon={LineChart} title={t("Performance", "الأداء")} className="flex flex-col sm:px-[18px]" bodyClassName="mt-3 flex flex-1 flex-col">
      <div>
        {performance.goals.map((g) => (
          <div key={g.id} className="border-b border-secondary py-3">
            <div className="truncate text-[12.5px] leading-4">{isAr ? g.titleAr : g.title}</div>
            <div className="mt-1.5 flex h-[15px] items-center gap-2.5">
              <Bar className="flex-1" value={g.pct} tone={g.pct >= 75 ? "success" : "warning"} />
              <span className="w-[34px] shrink-0 text-center text-[11.5px] leading-[15px] text-muted-foreground tabular-nums" dir="ltr">{g.pct}%</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-auto flex items-center justify-between gap-2.5 pt-8">
        <div className="max-w-[114px] text-[11.5px] leading-[15px] text-muted-foreground">{t("Next review", "المراجعة القادمة")} · {isAr ? performance.nextReviewAr : performance.nextReview}</div>
        {/* "/ 5" sits on the start side of the score in both directions (AR and EN frames) */}
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] leading-[17px] text-muted-foreground" dir="ltr">/ {performance.outOf}</span>
          <span className="text-[28px] font-bold leading-9" dir="ltr">{performance.rating}</span>
        </div>
        <Chip tone="success" icon={TrendingUp} className="px-2.5 text-[11.5px] [&_svg]:size-3">{isAr ? performance.verdictAr : performance.verdict}</Chip>
      </div>
    </SectionCard>
  )
}

// ─── shift roster ────────────────────────────────────────────────────────────
/** Figma 2101:2051 — 480 × 519.5, three rotation cards 157 / 78.5 / 157, 16 apart. */
function ShiftsCard() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  return (
    <SectionCard icon={CalendarDays} title={t("Shift schedule", "جدول المناوبات")} className="sm:px-4"
      action={ROTATIONS.length > 3 ? (
        <button type="button" onClick={() => navigate("/employee/shifts")} className="inline-flex h-[18px] items-center gap-0.5 text-[11.5px] text-muted-foreground hover:text-primary">
          {t("View all", "عرض الكل")}{isAr ? <ChevronLeft className="size-3" /> : <ChevronRight className="size-3" />}
        </button>
      ) : undefined}>
      {ROTATIONS.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-muted-foreground">{t("No rotations scheduled.", "لا توجد مناوبات مجدولة.")}</p>
      ) : (
        <div className="space-y-4">
          {ROTATIONS.slice(0, 3).map((r) => <RotationCard key={r.id} r={r} />)}
        </div>
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
