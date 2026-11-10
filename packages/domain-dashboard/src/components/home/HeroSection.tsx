import * as React from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

import { cn } from "@reach/shared-core"
import {
  AlignLeft, CalendarDays, ChevronLeft, ChevronRight, Clock3, CloudSun, Droplet, FileText, GraduationCap,
  MapPin, MoonStar, Newspaper, Search, Sparkles, Sun, Thermometer, Timer, UsersRound, Video, Wind,
} from "lucide-react"

import {
  aiSuggestions, currentCourse, heroNews, type HeroTab, nextMeeting, person, weather, type WeatherIcon,
} from "../../data/mock/home"
import { askAssistant } from "./helpers"
import { goldButton } from "./ui"

const CHIP_ICONS: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  file: FileText, calendar: CalendarDays, users: UsersRound,
}
const WEATHER_ICONS: Record<WeatherIcon, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  sun: Sun, cloudSun: CloudSun, moon: MoonStar,
}

const TABS: { id: HeroTab; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; en: string; ar: string }[] = [
  { id: "meeting", icon: Video, en: "Next meeting", ar: "الاجتماع القادم" },
  { id: "course", icon: GraduationCap, en: "Learning", ar: "التعلم" },
  { id: "news", icon: Newspaper, en: "News", ar: "الأخبار" },
  { id: "weather", icon: CloudSun, en: "Weather", ar: "الطقس" },
]

type T = (en: string, ar: string) => string

/** "صباح الخير، فواز الغيلان | ☀ الرياض 43°" — 12px, gold weather. */
function GreetingLine({ isAr, t }: { isAr: boolean; t: T }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 text-[12px] leading-3">
      <span className="text-foreground">
        {t("Good morning, ", "صباح الخير، ")}{isAr ? person.nameAr : person.name}
      </span>
      <span aria-hidden className="h-3 w-px bg-foreground" />
      <Sun className="size-[13px] text-primary" strokeWidth={1.8} />
      <span className="text-primary">{isAr ? person.cityAr : person.city} {person.temp}°</span>
    </div>
  )
}

/**
 * Figma "Hero Section" (2013:5689 · 2227:5149 / 5897 / 6645): greeting + AI ask
 * bar on the inline-start side, a 2.5px gold divider, then a 352px widget card
 * switched by the 46px vertical icon rail. `compact` (assistant panel docked,
 * 315:680) drops the ask bar — the chat panel takes that role.
 */
export function HeroSection({ isAr, compact, openTasks }: { isAr: boolean; compact: boolean; openTasks: number }) {
  const t: T = (en, ar) => (isAr ? ar : en)
  // ?hero=learning|news|weather opens a widget directly (pixel checks of 2227:5149 / 5897 / 6645)
  const [tab, setTab] = React.useState<HeroTab>(() => {
    const h = new URLSearchParams(window.location.search + "&" + (window.location.hash.split("?")[1] ?? "")).get("hero")
    return h === "learning" || h === "course" ? "course" : h === "news" ? "news" : h === "weather" ? "weather" : "meeting"
  })
  const [ask, setAsk] = React.useState("")

  const submit = (text: string) => {
    const q = text.trim()
    if (!q) return
    askAssistant(q)
    setAsk("")
  }

  return (
    <section
      className={cn(
        "highlight-card flex flex-col gap-6 rounded-xl px-4 py-6 @3xl:flex-row @3xl:items-center @3xl:justify-between @3xl:gap-0 @3xl:py-[23px] @3xl:ps-[23px] @3xl:pe-[19px]",
        // Assistant docked (315:680): one row — greeting over the widget, tab rail at the end; py 24, px 40.
        compact && "@3xl:ps-[39px] @3xl:pe-[39px]",
      )}
    >
      {compact ? null : (
        <>
          {/* ── greeting + "how can I help" + ask bar ── */}
          <div className="flex min-w-0 flex-1 flex-col items-start @3xl:max-w-[693px]">
            <GreetingLine isAr={isAr} t={t} />
            <h1 className="pt-3 text-[27px] leading-[38px] tracking-[-0.27px] text-foreground">
              {t("How can I help you ?", "كيف يمكنني مساعدتك ؟")}
            </h1>
            <div className="mt-2 flex h-4 items-center gap-[9px] text-[12.5px] leading-4">
              <Sparkles className="size-3.5 text-primary" strokeWidth={1.8} />
              <span className="text-foreground">
                {isAr ? `لديك ${openTasks} مهام` : `You have ${openTasks} tasks`}
              </span>
              <button
                type="button"
                onClick={() => askAssistant(t("Summarise my open tasks", "لخّص مهامي المفتوحة"))}
                className="inline-flex items-center gap-1 text-[12px] font-bold text-primary underline underline-offset-2 hover:opacity-80"
              >
                <AlignLeft className="size-2.5" strokeWidth={2.4} />
                {t("Summarize", "تلخيص")}
              </button>
            </div>

            <div className="flex w-full max-w-[524px] flex-col gap-2.5 pt-5">
              <form
                onSubmit={(e) => { e.preventDefault(); submit(ask) }}
                className="flex h-[52px] items-center gap-3 rounded-full border border-input bg-background ps-5 pe-[5px] focus-within:border-primary/60"
              >
                <Sparkles className="size-[17px] shrink-0 text-primary" strokeWidth={1.6} />
                <input
                  value={ask}
                  onChange={(e) => setAsk(e.target.value)}
                  placeholder={t("Ask a question...", "اطرح استفسارك...")}
                  aria-label={t("Ask the assistant", "اسأل المساعد")}
                  className="min-w-0 flex-1 bg-transparent text-[13.5px] leading-[20.25px] text-foreground outline-none placeholder:text-foreground"
                />
                <kbd dir="ltr" className="shrink-0 font-sans text-[11.5px] text-muted-foreground">⌘J</kbd>
                <button
                  type="submit"
                  aria-label={t("Ask", "اسأل")}
                  className="grid size-10 shrink-0 place-items-center rounded-full border border-[#8f743e] bg-[linear-gradient(180deg,rgba(171,128,37,0.24),rgba(171,128,37,0.09))] text-primary transition-colors hover:bg-soft-accent"
                >
                  <Search className="size-4" strokeWidth={1.8} />
                </button>
              </form>
              <div className="flex gap-[9px]">
                {aiSuggestions.map((s) => {
                  const Icon = CHIP_ICONS[s.icon] ?? FileText
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => submit(isAr ? s.ar : s.en)}
                      className="inline-flex h-[38px] shrink-0 items-center gap-2 rounded-lg last:min-w-0 last:shrink border border-input bg-background px-4 text-start text-[12.5px] leading-[14px] text-foreground transition-colors hover:border-primary/50"
                    >
                      <Icon className="size-[13px] shrink-0 text-primary" strokeWidth={1.8} />
                      <span className="min-w-0">{isAr ? s.ar : s.en}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* gold divider (Card Separater, vertical) */}
          <div
            aria-hidden
            className="hidden w-[2.5px] self-stretch bg-[linear-gradient(180deg,transparent,#614a1b_50%,transparent)] opacity-30 @3xl:mx-6 @3xl:block"
          />
        </>
      )}

      {/* ── switchable widget + vertical rail ── */}
      <div className={cn("flex items-center gap-4 @md:gap-8", compact ? "w-full" : "@3xl:w-[430px] @3xl:shrink-0")}>
        <div className={cn("flex min-w-0 flex-1", compact ? "flex-col" : "min-h-[238px] items-center @3xl:h-[238.75px]")}>
          {compact && (
            <div className="px-5 pt-5">
              <GreetingLine isAr={isAr} t={t} />
            </div>
          )}
          {/* keyed swap (no exit wait) so the switch is instant even when rAF is throttled */}
          <motion.div
              key={tab}
              initial={{ opacity: 0.4, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className={cn("w-full", compact && "-mt-3")}
            >
              {tab === "meeting" && <MeetingCard isAr={isAr} t={t} />}
              {tab === "course" && <CourseCard isAr={isAr} t={t} />}
              {tab === "news" && <NewsCard isAr={isAr} t={t} />}
              {tab === "weather" && <WeatherCard isAr={isAr} t={t} />}
            </motion.div>
        </div>

        <div
          role="tablist"
          aria-orientation="vertical"
          aria-label={t("Hero widget", "بطاقة الواجهة")}
          className="flex w-[46px] shrink-0 flex-col items-center gap-2 rounded-lg border border-border bg-card-elevated px-1 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
        >
          {TABS.map(({ id, icon: Icon, en, ar }) => {
            const active = tab === id
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={isAr ? ar : en}
                title={isAr ? ar : en}
                onClick={() => setTab(id)}
                className={cn(
                  "grid size-9 place-items-center rounded-full transition-colors",
                  active
                    ? "border border-[#8f743e] bg-[linear-gradient(180deg,rgba(171,128,37,0.24),rgba(171,128,37,0.09))] text-primary"
                    : "text-icon hover:text-foreground",
                )}
              >
                <Icon className="size-4" strokeWidth={1.6} />
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ── widget cards (352px, padding 20, gap 8) ──────────────────────────────── */

function MeetingCard({ isAr, t }: { isAr: boolean; t: T }) {
  const m = nextMeeting
  return (
    <div className="flex flex-col gap-2 p-5">
      <span className="inline-flex items-center gap-1.5 text-[12px] text-primary">
        <Timer className="size-3.5" strokeWidth={1.8} />
        {isAr ? `بعد ${m.inMinutes} دقيقة` : `In ${m.inMinutes} minutes`}
      </span>
      <h3 className="pt-1 text-[20px] font-medium leading-[26px] text-foreground">{isAr ? m.titleAr : m.title}</h3>
      <div className="flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Clock3 className="size-3.5" strokeWidth={1.8} />
          {isAr ? `${m.timeAr} · ${m.minutes} دقيقة` : `${m.time} · ${m.minutes} min`}
        </span>
        <span className="inline-flex items-center gap-1">
          <Video className="size-3.5" strokeWidth={1.8} />
          {m.platform}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3 pt-3">
        <div className="flex items-center">
          <div className="flex -space-x-1 rtl:space-x-reverse">
            {m.attendees.map((a) => (
              <span key={a.initials} className="grid size-7 place-items-center overflow-hidden rounded-full border border-input bg-secondary text-[9px] font-semibold text-foreground">
                {a.img ? <img src={a.img} alt="" className="size-full object-cover" /> : a.initials}
              </span>
            ))}
          </div>
          <span className="ps-2 text-[12px] text-foreground">{m.more}+</span>
        </div>
        <button type="button" className={cn(goldButton, "h-[34px] px-6 text-[13px]")}>
          <Video className="size-[15px]" strokeWidth={1.8} />
          {t("Join", "دخول")}
        </button>
      </div>
    </div>
  )
}

/* Figma "Hero-Section Second Cards" · Courses (352×197): p 20, gap 8 —
   session 12/15 · title row + 6px bar (16 apart, pb 4) · meta 13/17 · button row (pt 12). */
function CourseCard({ isAr, t }: { isAr: boolean; t: T }) {
  const c = currentCourse
  const navigate = useNavigate()
  return (
    <div className="flex flex-col gap-2 p-5">
      <span className="inline-flex h-[15px] items-center gap-1.5 text-[12px] leading-[15px] text-primary">
        <GraduationCap className="size-3.5" strokeWidth={1.8} />
        {isAr ? `حصة ${c.session}` : `${c.sessionEn} sessions`}
      </span>
      <div className="flex flex-col gap-4 pb-1">
        <div className="flex h-[29px] items-center justify-between gap-3">
          <h3 className="truncate text-[20px] font-medium leading-[26px] text-foreground">{isAr ? c.titleAr : c.title}</h3>
          <span className="shrink-0 text-[16px] font-medium tabular-nums text-foreground">{c.progress}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuenow={c.progress} aria-valuemin={0} aria-valuemax={100}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${c.progress}%` }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="h-full rounded-full bg-primary" />
        </div>
      </div>
      <div className="flex h-[17px] flex-wrap items-center gap-2 text-[13px] leading-[17px] text-muted-foreground">
        <span className="inline-flex items-center gap-1"><Clock3 className="size-3.5" strokeWidth={1.8} />{isAr ? `${c.minutes} دقيقة` : `${c.minutes} min`}</span>
        <span className="inline-flex items-center gap-1"><Video className="size-3.5" strokeWidth={1.8} />{c.platform}</span>
        <span className="inline-flex items-center gap-1"><GraduationCap className="size-3.5" strokeWidth={1.8} />{isAr ? `${c.remaining} حصص متبقية` : `${c.remaining} sessions left`}</span>
      </div>
      {/* Figma: the button sits at the row's end */}
      <div className="flex justify-end pt-3">
        <button type="button" onClick={() => navigate("/learning")} className={cn(goldButton, "h-[34px] px-6 text-[13px]")}>
          <GraduationCap className="size-[15px]" strokeWidth={1.8} />
          {t("Join", "دخول")}
        </button>
      </div>
    </div>
  )
}

/* Figma · News (352×238.75, radius 16, image fill): content pinned to the bottom —
   16px medium title, then (pt 12) the arrows (34px, Shape/Fill/Secondary, 16 apart)
   at the start and the 151px gold "view details" button at the end. */
function NewsCard({ isAr, t }: { isAr: boolean; t: T }) {
  const navigate = useNavigate()
  const [i, setI] = React.useState(0)
  const n = heroNews[i]
  const go = (d: number) => setI((x) => (x + d + heroNews.length) % heroNews.length)
  const Prev = isAr ? ChevronRight : ChevronLeft
  const Next = isAr ? ChevronLeft : ChevronRight
  return (
    <div className="relative h-[238.75px] overflow-hidden rounded-2xl bg-secondary">
      <img
        src={n.img}
        alt=""
        className="absolute inset-0 size-full object-cover"
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-black/30 to-black/5" />
      <div className="relative flex h-full flex-col justify-end gap-2 p-5">
        <p className="truncate pt-1 text-[16px] font-medium leading-5 text-white">{isAr ? n.titleAr : n.title}</p>
        <div className="flex items-center justify-between pt-3">
          <div className="flex items-center gap-4">
            <button type="button" aria-label={t("Previous", "السابق")} onClick={() => go(-1)} className="grid size-[34px] place-items-center rounded-lg bg-secondary text-foreground transition-colors hover:brightness-125">
              <Prev className="size-4" />
            </button>
            <button type="button" aria-label={t("Next", "التالي")} onClick={() => go(1)} className="grid size-[34px] place-items-center rounded-lg bg-secondary text-foreground transition-colors hover:brightness-125">
              <Next className="size-4" />
            </button>
          </div>
          <button type="button" onClick={() => navigate(n.to)} className={cn(goldButton, "h-[34px] px-6 text-[13px] font-semibold")}>
            <Newspaper className="size-[15px]" strokeWidth={1.8} />
            {t("View details", "عرض التفاصيل")}
          </button>
        </div>
      </div>
    </div>
  )
}

/* Figma · Weather (352×193): p 20, gap 8 — city 12/15 · 24px sun + 20px medium
   temperature (pt 4) · meta 13/17 (gap 8) · four 77.5px hourly columns (pt 12):
   time 10.5 · icon · 12px temperature. */
function WeatherCard({ isAr, t }: { isAr: boolean; t: T }) {
  const w = weather
  return (
    <div className="flex flex-col gap-2 p-5">
      <span className="inline-flex h-[15px] items-center gap-1.5 text-[12px] leading-[15px] text-primary">
        <MapPin className="size-3.5" strokeWidth={1.8} />
        {isAr ? w.cityAr : w.city}
      </span>
      <div className="flex items-center gap-2 pt-1">
        <Sun className="size-6 text-primary" strokeWidth={1.6} />
        <span className="text-[20px] font-medium leading-[26px] text-foreground">{w.temp}° {isAr ? w.conditionAr : w.condition}</span>
      </div>
      <div className="flex h-[17px] flex-wrap items-center gap-x-2 text-[13px] leading-[17px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Thermometer className="size-3.5" strokeWidth={1.8} />
          {t(`Today's forecast: ${w.min}° to ${w.max}°`, `المتوقع لليوم من ${w.min}° إلى ${w.max}°`)}
        </span>
        <span className="inline-flex items-center gap-1" title={t("Wind km/h", "الرياح كم/س")}><Wind className="size-3.5" strokeWidth={1.8} />{w.wind}</span>
        <span className="inline-flex items-center gap-1" title={t("Humidity", "الرطوبة")}><Droplet className="size-3.5" strokeWidth={1.8} />{w.humidity}%</span>
      </div>
      <div className="flex justify-between pt-3">
        {w.hourly.map((h) => {
          const Icon = WEATHER_ICONS[h.icon]
          return (
            <div key={h.time} className="flex w-[77.5px] flex-col items-center gap-[7px] text-center">
              <span className="text-[10.5px] leading-[13px] text-foreground">{isAr ? h.timeAr : h.time}</span>
              <Icon className="size-[13px] text-primary" strokeWidth={1.8} />
              <span className="text-[12px] leading-[15px] text-foreground">{h.temp}°</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
