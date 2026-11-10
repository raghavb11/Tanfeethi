/** Learning dashboard — Figma 2028:5236 (web), 3610:8241 (phone). Route: /learning
 *  Hero (continue · weekly chart · streak), then learning paths (wide column) and
 *  continue learning / live workshops / recommended / certificates (side column). */
import * as React from "react"
import { cn } from "@reach/shared-core"
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  ConciergeBell,
  FileText,
  GraduationCap,
  Mic,
  Presentation,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
  Wallet,
} from "lucide-react"

import {
  certificates,
  inProgress,
  learner,
  learningPaths,
  recommendations,
  week,
  workshops,
  type Certificate,
  type LearningPath,
} from "../data/learning"
import { CardHeading, Chip, GoldButton, OutlineButton, ProgressBar } from "../components/ui"
import { useT } from "../components/i18n"

function fmtMinutes(min: number, isAr: boolean) {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (isAr) return h ? `${h} س ${m} د` : `${m} د`
  return h ? `${h}h ${m}m` : `${m}m`
}

/** Shown where the design links to screens that don't exist yet (course player). */
function useComingSoon() {
  const [msg, setMsg] = React.useState("")
  React.useEffect(() => {
    if (!msg) return
    const id = window.setTimeout(() => setMsg(""), 3500)
    return () => window.clearTimeout(id)
  }, [msg])
  return [msg, setMsg] as const
}

// ── hero ─────────────────────────────────────────────────────────────────────
function Hero({ onPlayer }: { onPlayer: () => void }) {
  const { t, l, isAr } = useT()
  const course = inProgress[0]
  const total = week.reduce((s, d) => s + d.minutes, 0)
  const activeDays = week.filter((d) => d.minutes >= learner.activeDayMinutes).length
  const left = Math.max(0, learner.dailyGoal - learner.todayMinutes)

  return (
    <section className="highlight-card hl-violet overflow-hidden rounded-[12px] p-6 lg:pe-10">
      <div className="flex flex-col gap-6 lg:min-h-[237px] lg:flex-row lg:items-stretch lg:justify-between lg:gap-0">
        {/* Continue */}
        {/* Continue — Figma 3071:8990: 444 wide; 12 label, 50 title, 24 meta, then a 340-wide block. */}
        <div className="flex min-w-0 flex-col justify-center lg:w-[444px]">
          <span className="text-[10.5px] leading-3 text-muted-foreground">{t("Learning Center", "مركز التعلم")}</span>
          <h2 className="flex min-h-[50px] items-center text-[27px] font-normal leading-[38px] tracking-[-0.27px]">{t("Continue Where You Left Off", "واصل ما بدأته")}</h2>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-[11px] leading-4 text-muted-foreground">
            <GraduationCap className="size-3.5 text-primary" strokeWidth={1.8} />
            <span className="text-foreground/90">{l(course.title)}</span>
            <span>{t(`Module ${course.unit} of ${course.units}`, `الوحدة ${course.unit} من ${course.units}`)}</span>
          </p>
          <div className="flex w-full max-w-[340px] flex-col gap-2.5 pt-5">
            <div className="flex flex-col gap-2">
              <div className="flex h-3 items-center justify-between text-[10.5px] leading-3">
                <span className="text-muted-foreground">{t("Today's Goal", "هدف اليوم")}</span>
                <span className="font-semibold text-primary tabular-nums">
                  <span dir="ltr">
                    {learner.todayMinutes} / {learner.dailyGoal}
                  </span>{" "}
                  {t("min", "د")}
                </span>
              </div>
              <ProgressBar
                className="h-1.5"
                value={(learner.todayMinutes / learner.dailyGoal) * 100}
                label={t("Today's goal", "هدف اليوم")}
              />
              <span className="text-[10.5px] leading-3 text-muted-foreground">
                {t(`${left} minutes away from keeping your streak`, `${left} دقيقة تفصلك عن الحفاظ على تتابعك`)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <GoldButton className="px-3" onClick={onPlayer}>
                <Video className="size-4" />
                {t("Continue Learning", "تابع الدراسة")}
              </GoldButton>
              <OutlineButton
                className="px-3"
                onClick={() => document.getElementById("learning-certificates")?.scrollIntoView({ behavior: "smooth", block: "center" })}
              >
                <FileText className="size-4" />
                {t("Your Certificates", "شهاداتك")}
              </OutlineButton>
            </div>
          </div>
        </div>

        <div aria-hidden className="hidden w-[2.5px] self-stretch bg-gradient-to-b from-transparent via-[#937dba]/60 to-transparent lg:block" />

        {/* Weekly chart — Figma 3071:8931: 380 wide, 12.5 header, 113 bars, 30 footer, 20 gaps. */}
        <div className="flex min-w-0 flex-col justify-center gap-5 lg:w-[380px]">
          <div className="flex h-[12.5px] items-center justify-between">
            <span className="text-[10.9px] font-semibold leading-[12.5px]">{t("Your Progress This Week", "تقدّمك هذا الأسبوع")}</span>
            <span className="text-[12.5px] font-semibold leading-[12.5px] text-primary tabular-nums">{fmtMinutes(total, isAr)}</span>
          </div>
          <div className="flex items-end gap-2.5" role="img" aria-label={t("Minutes learned per day this week", "دقائق التعلم يومياً هذا الأسبوع")}>
            {week.map((d, i) => {
              const pct = Math.min(1, d.minutes / learner.dailyGoal)
              const fill = d.today
                ? "bg-primary"
                : d.minutes >= learner.dailyGoal
                  ? "bg-success"
                  : d.minutes >= learner.activeDayMinutes
                    ? "bg-primary"
                    : "bg-error"
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className={cn(
                      "relative flex h-[93px] w-full items-end overflow-hidden rounded-[4px]",
                      d.today ? "bg-gradient-to-b from-primary/25 to-secondary" : "bg-secondary",
                    )}
                    title={`${l(d.day)} · ${fmtMinutes(d.minutes, isAr)}`}
                  >
                    <div className={cn("w-full rounded-[4px]", fill)} style={{ height: `${pct * 100}%` }} />
                  </div>
                  <span className={cn("h-3 text-[10px] leading-3", d.today ? "font-semibold text-primary" : "text-muted-foreground")}>{l(d.day)}</span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-[30px] items-center rounded-[4px] bg-success-fill px-2 pb-[2px] pt-[3px] text-[11px] font-medium leading-[11px] text-success" dir="ltr">
              +{learner.weekOverWeek}%
            </span>
            <span className="text-[8.8px] leading-[11.5px] text-muted-foreground">
              {t(`vs last week · ${activeDays} of 7 days`, `عن الأسبوع الماضي · ${activeDays} من 7 أيام`)}
            </span>
          </div>
        </div>

        <div aria-hidden className="hidden w-[2.5px] self-stretch bg-gradient-to-b from-transparent via-[#937dba]/60 to-transparent lg:block" />

        {/* Streak — Figma 3071:8921: 124 wide, 14px rhythm. */}
        <div className="flex flex-col items-center justify-center gap-3.5 whitespace-nowrap text-center lg:min-w-[124px]">
          <div className="flex h-16 items-baseline gap-1 pt-1">
            <span className="text-[56px] font-bold leading-none text-primary tabular-nums">{learner.streakDays}</span>
            <span className="text-sm">{t("days", "يوماً")}</span>
          </div>
          <span className="text-[12px] font-medium leading-[14px]">{t("Learning streak", "تتابع متواصل من التعلم")}</span>
          <span className="text-[9.7px] leading-[11.5px] text-muted-foreground">
            {t(`Your longest streak: ${learner.longestStreak} days`, `أطول تتابع لك: ${learner.longestStreak} يوماً`)}
          </span>
        </div>
      </div>
    </section>
  )
}

// ── learning paths ───────────────────────────────────────────────────────────
const pathIcon: Record<LearningPath["icon"], typeof Users> = {
  users: Users,
  concierge: ConciergeBell,
  sparkles: Sparkles,
  wallet: Wallet,
  shield: ShieldCheck,
  mic: Mic,
}

/** Striped thumbnail (the design's "course thumb" placeholder) with the topic icon. */
function Thumb({ icon: Icon, className }: { icon: typeof Users; className?: string }) {
  return (
    <div
      className={cn("flex items-center justify-center rounded-[12px]", className)}
      style={{
        backgroundImage:
          "repeating-linear-gradient(135deg, color-mix(in oklab, var(--foreground) 4%, transparent) 0 14px, transparent 14px 28px)",
        backgroundColor: "var(--card)",
      }}
    >
      <Icon className="size-8 text-icon" strokeWidth={1.4} />
    </div>
  )
}

function PathCard({ p, started, onStart }: { p: LearningPath; started: boolean; onStart: () => void }) {
  const { t, l } = useT()
  return (
    <article className="flex min-h-[440px] flex-col gap-4 rounded-2xl bg-background p-4">
      {/* Figma 3071:9222 — 250px thumb, 14px rhythm, 21px chip row, 16/22 title, 33px meta row. */}
      <div className="flex flex-col">
        <div className="flex flex-col gap-3.5">
          <Thumb icon={pathIcon[p.icon]} className="h-[250px] w-full rounded-[8px]" />
          <div className="flex h-[21px] flex-wrap items-center gap-2.5">
            <Chip tone="purple">{l(p.category)}</Chip>
            <span className="text-[10.4px] leading-[11.5px] text-muted-foreground">
              {t(`${p.units} modules over ${p.weeks} weeks`, `${p.units} وحدات خلال ${p.weeks} أسبوعًا`)}
            </span>
          </div>
          <h3 className="pb-1 text-base font-medium leading-[22px]">{l(p.title)}</h3>
        </div>
        <div className="flex items-center gap-3 py-2 text-[13px] text-muted-foreground">
          <span>{t(`${p.units} modules`, `${p.units} وحدات`)}</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" />
            {t(`${p.hours} h`, `${p.hours} ساعة`)}
          </span>
        </div>
      </div>
      <div className="mt-auto self-end">
        {started ? (
          <OutlineButton size="md" onClick={onStart} aria-pressed className="px-4">
            <Check className="size-4 text-success" />
            {t("Track started", "بدأت المسار")}
          </OutlineButton>
        ) : (
          <GoldButton onClick={onStart}>{t("Start Track", "ابدأ المسار")}</GoldButton>
        )}
      </div>
    </article>
  )
}

// ── side cards ───────────────────────────────────────────────────────────────
function SideCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("panel flex flex-col gap-5 rounded-[12px] p-4 sm:px-6 sm:py-5", className)}>{children}</section>
}

function ContinueLearning({ onPlayer }: { onPlayer: () => void }) {
  const { t, l, isAr } = useT()
  const Chevron = isAr ? ChevronLeft : ChevronRight
  return (
    <SideCard>
      <CardHeading icon={GraduationCap} title={t("Continue Learning", "أكمل التعلم")} />
      <div className="flex flex-col gap-4">
        {inProgress.map((c) => (
          <article key={c.id} className="flex min-h-[130px] overflow-hidden rounded-[12px] bg-background">
            <div className="relative w-[150px] shrink-0">
              <Thumb icon={GraduationCap} className="h-full rounded-none" />
              <span className="btn-primary-grad absolute bottom-3 end-3 inline-flex size-7 items-center justify-center rounded-full">
                <Video className="size-3.5" />
              </span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 p-4">
              <div>
                <Chip>{l(c.category)}</Chip>
              </div>
              <h3 className="text-sm font-medium">{l(c.title)}</h3>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold tabular-nums">{c.progress}%</span>
                <button
                  type="button"
                  onClick={onPlayer}
                  className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                >
                  {t("Continue", "تابع")}
                  <Chevron className="size-3" />
                </button>
              </div>
              <ProgressBar value={c.progress} label={l(c.title)} />
            </div>
          </article>
        ))}
      </div>
    </SideCard>
  )
}

function LiveWorkshops() {
  const { t, l } = useT()
  const [registered, setRegistered] = React.useState<string[]>([])
  return (
    <SideCard>
      <CardHeading icon={Presentation} title={t("Upcoming Live Workshops", "ورش مباشرة قادمة")} />
      <div className="flex flex-col gap-4">
        {workshops.map((w) => {
          const on = registered.includes(w.id)
          return (
            <article key={w.id} className="flex flex-col gap-3 rounded-[12px] bg-background p-4">
              <h3 className="text-[13.5px] font-medium">{l(w.title)}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex size-6 items-center justify-center rounded-full border border-primary text-[10px] font-semibold text-primary" dir="ltr">
                  {w.initials}
                </span>
                {l(w.instructor)}
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="size-3.5" />
                  {l(w.date)} · {w.time}
                </span>
                {on ? (
                  <OutlineButton
                    size="sm"
                    className="w-[92px]"
                    aria-pressed
                    onClick={() => setRegistered((r) => r.filter((x) => x !== w.id))}
                    title={t("Cancel registration", "إلغاء التسجيل")}
                  >
                    <Check className="size-3.5 text-success" />
                    {t("Registered", "مسجّل")}
                  </OutlineButton>
                ) : (
                  <GoldButton size="sm" className="w-[92px]" onClick={() => setRegistered((r) => [...r, w.id])}>
                    {t("Register", "سجّل")}
                  </GoldButton>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </SideCard>
  )
}

function Recommended() {
  const { t, l } = useT()
  return (
    <SideCard className="gap-2.5">
      <CardHeading icon={Presentation} title={t("Recommended for You", "موصى به لك")} />
      <ul className="flex flex-col">
        {recommendations.map((r, i) => (
          <li
            key={r.id}
            className={cn("flex items-center gap-3 py-[13px]", i < recommendations.length - 1 && "border-b border-secondary")}
          >
            <span className="inline-flex size-[30px] shrink-0 items-center justify-center rounded-full bg-secondary text-xs">{l(r.letter)}</span>
            <span className="min-w-0 flex-1 truncate text-sm">{l(r.title)}</span>
            <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3.5" />
              {l(r.duration)}
            </span>
          </li>
        ))}
      </ul>
    </SideCard>
  )
}

function downloadCertificate(c: Certificate, isAr: boolean) {
  const text = isAr
    ? `شهادة إتمام\n\n${c.title.ar}\nصدرت: ${c.issued.ar}\nالتنفيذي`
    : `Certificate of completion\n\n${c.title.en}\nIssued: ${c.issued.en}\nAltanfeethi`
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }))
  const a = document.createElement("a")
  a.href = url
  a.download = `${c.id}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

function Certificates() {
  const { t, l, isAr } = useT()
  const Chevron = isAr ? ChevronLeft : ChevronRight
  return (
    <SideCard>
      <CardHeading id="learning-certificates" icon={FileText} title={t("Your Certificates", "شهاداتك")} />
      {certificates.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          {t("Finish a course to earn your first certificate.", "أكمل دورة لتحصل على شهادتك الأولى.")}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {certificates.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => downloadCertificate(c, isAr)}
              className="flex min-h-20 items-center gap-4 rounded-[12px] bg-background px-4 text-start outline-none transition-colors hover:bg-secondary/40 focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={t(`Download ${c.title.en}`, `تنزيل ${c.title.ar}`)}
            >
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary">
                <FileText className="size-5 text-icon" strokeWidth={1.6} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate text-[13.5px]">{l(c.title)}</span>
                <span className="text-xs text-muted-foreground">
                  {t("Issued", "صدرت")} · {l(c.issued)}
                </span>
              </span>
              <Chevron className="size-4 shrink-0 text-icon" />
            </button>
          ))}
        </div>
      )}
    </SideCard>
  )
}

export default function LearningPage() {
  const { t } = useT()
  const [started, setStarted] = React.useState<string[]>([])
  const [notice, setNotice] = useComingSoon()
  const openPlayer = () =>
    setNotice(t("The course player isn't part of this prototype yet.", "مشغّل الدورات غير متاح في هذا النموذج بعد."))

  return (
    <div className="flex flex-col gap-10 px-4 pb-6 pt-8 md:px-10">
      <Hero onPlayer={openPlayer} />
      {notice && (
        <div role="status" className="-mt-6 rounded-[8px] bg-info-fill px-4 py-3 text-[13px] text-info">
          {notice}
        </div>
      )}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <section className="panel min-w-0 flex-1 rounded-[12px] p-4 sm:px-6 sm:py-5">
          <CardHeading icon={Presentation} title={t("Learning Paths", "مسارات تعلم")} />
          <div className="mt-[18px] grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
            {learningPaths.map((p) => (
              <PathCard
                key={p.id}
                p={p}
                started={started.includes(p.id)}
                onStart={() => setStarted((s) => (s.includes(p.id) ? s.filter((x) => x !== p.id) : [...s, p.id]))}
              />
            ))}
          </div>
        </section>
        <aside className="flex w-full shrink-0 flex-col gap-6 lg:w-[480px]">
          <ContinueLearning onPlayer={openPlayer} />
          <LiveWorkshops />
          <Recommended />
          <Certificates />
        </aside>
      </div>
    </div>
  )
}
