import * as React from "react"
import { motion, animate } from "framer-motion"

import { Badge, Button, Card, Input } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  aiKpis,
  knowledgeRecs,
  meetingSummaries,
  predictions,
  recommendations,
  smartInsights,
  suggestedPrompts,
  usefulNotes,
  type Confidence,
  type InsightCategory,
  type Tone,
} from "../data/mock/intelligence"
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  BrainCircuit,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Gauge,
  Lightbulb,
  Mail,
  PenLine,
  PinIcon,
  Send,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react"

// ─── translations ────────────────────────────────────────────────────────────

const ar = {
  hubLabel: "مركز الذكاء",
  pageTitle: "عقل ريتش",
  pageDesc: "توقّعات وملخصات وملاحظات يجمعها لك ريتش تلقائيًا.",
  helloAi: "مرحبًا في الذكاء",
  helloAiSub: "إليك ما تعلّمه ريتش عن أسبوعك",
  insights: "إشارة هذا الأسبوع",
  accuracy: "دقة التوقعات",
  timeSaved: "ساعات وفّرتها",
  models: "نماذج فعّالة",
  askAi: "اسأل ريتش",
  askPh: "اسأل أي شي عن أسبوعك…",
  send: "إرسال",
  trySomething: "جرّب",
  predictions: "توقعات",
  predictionsSub: "بدرجة ثقة ومؤشر اتجاه",
  insightsFeed: "تدفّق الإشارات الذكية",
  insightsFeedSub: "ما لاحظه ريتش لك",
  today: "اليوم",
  thisWeek: "هذا الأسبوع",
  notes: "ملاحظات مفيدة",
  notesSub: "إجراءات استخرجها ريتش لك",
  pin: "تثبيت",
  done: "تم",
  recsTitle: "توصيات الذكاء",
  recsSub: "مرتبة بالأثر والمخاطرة",
  apply: "تطبيق",
  dismiss: "تجاهل",
  summariesTitle: "ملخصات الاجتماعات",
  summariesSub: "قرارات وإجراءات تلقائية",
  knowledgeTitle: "مستندات مقترحة",
  knowledgeSub: "محتوى مرتبط ينصحك ريتش بإرفاقه",
  match: "تطابق",
  confidenceLabels: { high: "ثقة عالية", moderate: "ثقة متوسطة", low: "ثقة منخفضة" } as Record<Confidence, string>,
  categoryLabels: {
    work: "عمل",
    email: "بريد",
    meeting: "اجتماع",
    risk: "مخاطرة",
    people: "موظفون",
  } as Record<InsightCategory, string>,
}

// ─── helpers ─────────────────────────────────────────────────────────────────

const categoryIcon: Record<InsightCategory, React.ComponentType<{ className?: string }>> = {
  work: Briefcase,
  email: Mail,
  meeting: Users,
  risk: AlertTriangle,
  people: Users,
}

function categoryTone(c: InsightCategory): { bg: string; text: string; dot: string } {
  switch (c) {
    case "work": return { bg: "bg-primary/12", text: "text-primary", dot: "bg-primary" }
    case "email": return { bg: "bg-blue-500/12", text: "text-blue-500", dot: "bg-blue-500" }
    case "meeting": return { bg: "bg-violet-500/12", text: "text-violet-500", dot: "bg-violet-500" }
    case "risk": return { bg: "bg-rose-500/12", text: "text-rose-500", dot: "bg-rose-500" }
    case "people": return { bg: "bg-amber-500/12", text: "text-amber-500", dot: "bg-amber-500" }
  }
}

function confidenceTone(c: Confidence) {
  if (c === "high") return { ring: "stroke-emerald-500", text: "text-emerald-500", value: 92 }
  if (c === "moderate") return { ring: "stroke-amber-500", text: "text-amber-500", value: 68 }
  return { ring: "stroke-muted-foreground", text: "text-muted-foreground", value: 38 }
}

function toneToColor(t: Tone): { bg: string; text: string; border: string } {
  switch (t) {
    case "primary": return { bg: "bg-primary/12", text: "text-primary", border: "border-primary/30" }
    case "emerald": return { bg: "bg-emerald-500/12", text: "text-emerald-500", border: "border-emerald-500/30" }
    case "blue": return { bg: "bg-blue-500/12", text: "text-blue-500", border: "border-blue-500/30" }
    case "amber": return { bg: "bg-amber-500/12", text: "text-amber-500", border: "border-amber-500/30" }
    case "violet": return { bg: "bg-violet-500/12", text: "text-violet-500", border: "border-violet-500/30" }
    case "rose": return { bg: "bg-rose-500/12", text: "text-rose-500", border: "border-rose-500/30" }
  }
}

// ─── animated counter ────────────────────────────────────────────────────────

function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [display, setDisplay] = React.useState(0)
  React.useEffect(() => {
    const ctrl = animate(0, value, {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(decimals === 0 ? Math.round(v) : Math.round(v * 10) / 10),
    })
    return ctrl.stop
  }, [value, decimals])
  return <>{decimals === 0 ? display : display.toFixed(decimals)}</>
}

// ─── confidence ring ─────────────────────────────────────────────────────────

function ConfidenceRing({ confidence }: { confidence: Confidence }) {
  const { ring, text, value } = confidenceTone(confidence)
  const r = 18
  const c = 2 * Math.PI * r
  const offset = c - (value / 100) * c
  return (
    <div className="relative flex shrink-0 items-center justify-center">
      <svg width="48" height="48" viewBox="0 0 48 48" className="-rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" stroke="currentColor" strokeWidth="3" className="text-muted-foreground/15" />
        <motion.circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          className={ring}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          strokeDasharray={c}
        />
      </svg>
      <div className={cn("absolute text-[11px] font-bold tabular-nums", text)}>{value}</div>
    </div>
  )
}

// ─── hero illustration: AI brain with sparkles ───────────────────────────────

function BrainIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 280 200" className={className} xmlns="http://www.w3.org/2000/svg" fill="none">
      <circle cx="40" cy="40" r="32" fill="rgba(206,123,91,0.10)" />
      <circle cx="240" cy="160" r="38" fill="rgba(35,64,36,0.18)" />

      {/* Brain shape — half circuit, half organic */}
      <motion.g
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Outer brain blob */}
        <path
          d="M140 50 Q105 50 90 80 Q75 95 80 120 Q85 145 110 155 Q125 165 145 160 Q170 165 185 150 Q205 140 200 115 Q205 90 185 75 Q170 50 140 50Z"
          fill="rgba(206,123,91,0.18)"
          stroke="#CE7B5B"
          strokeWidth="1.5"
        />
        {/* Center divider */}
        <path d="M140 50 Q138 105 145 160" stroke="rgba(206,123,91,0.5)" strokeWidth="1.5" fill="none" strokeDasharray="2 3" />
        {/* Circuit nodes (left) */}
        <circle cx="105" cy="90" r="3" fill="#CE7B5B" />
        <circle cx="100" cy="120" r="3" fill="#CE7B5B" />
        <circle cx="120" cy="135" r="3" fill="#CE7B5B" />
        <line x1="105" y1="90" x2="100" y2="120" stroke="#CE7B5B" strokeWidth="1.5" />
        <line x1="100" y1="120" x2="120" y2="135" stroke="#CE7B5B" strokeWidth="1.5" />
        {/* Organic curves (right) */}
        <path d="M155 75 Q175 90 165 110 Q160 130 180 140" stroke="#234024" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M170 80 Q185 95 175 115" stroke="#234024" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Center pulse */}
        <motion.circle
          cx="140"
          cy="105"
          r="6"
          fill="#CE7B5B"
          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.g>

      {/* Floating sparkles around the brain */}
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "140px 105px" }}
      >
        <path d="M55 60 l1.5 4.5 4.5 0 -3.5 3 1.5 4.5 -4-3 -4 3 1.5-4.5 -3.5-3 4.5 0z" fill="rgba(206,123,91,0.5)" />
        <path d="M225 70 l1 3 3 0 -2.5 2 1 3 -2.5-2 -2.5 2 1-3 -2.5-2 3 0z" fill="rgba(206,123,91,0.45)" />
        <path d="M70 165 l1 3 3 0 -2.5 2 1 3 -2.5-2 -2.5 2 1-3 -2.5-2 3 0z" fill="rgba(35,64,36,0.5)" />
        <circle cx="220" cy="45" r="2.5" fill="rgba(206,123,91,0.5)" />
        <circle cx="245" cy="120" r="2" fill="rgba(206,123,91,0.4)" />
      </motion.g>

      {/* Data lines emerging */}
      <motion.g
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <line x1="55" y1="105" x2="80" y2="105" stroke="rgba(206,123,91,0.5)" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="200" y1="105" x2="230" y2="105" stroke="rgba(206,123,91,0.5)" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="140" y1="40" x2="140" y2="55" stroke="rgba(206,123,91,0.5)" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="140" y1="155" x2="140" y2="175" stroke="rgba(206,123,91,0.5)" strokeWidth="1" strokeDasharray="3 3" />
      </motion.g>
    </svg>
  )
}

// ─── KPI mini ────────────────────────────────────────────────────────────────

function HeroKpi({ label, value, suffix = "", icon: Icon, delay = 0 }: { label: string; value: number; suffix?: string; icon: React.ComponentType<{ className?: string }>; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/10 px-3 py-2 backdrop-blur-sm"
    >
      <span className="flex size-7 items-center justify-center rounded-lg bg-white/15 text-amber-300">
        <Icon className="size-3.5" />
      </span>
      <div>
        <div className="text-[16px] font-bold tabular-nums leading-none text-white">
          <AnimatedNumber value={value} decimals={value % 1 !== 0 ? 1 : 0} />{suffix}
        </div>
        <div className="mt-1 text-[10px] font-medium tracking-wide text-white/65">
          {label}
        </div>
      </div>
    </motion.div>
  )
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function IntelligenceHub() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const [draft, setDraft] = React.useState("")
  const [doneNotes, setDoneNotes] = React.useState<Set<string>>(new Set())

  const todayInsights = smartInsights.filter((i) => i.group === "today")
  const weekInsights = smartInsights.filter((i) => i.group === "week")

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-7 md:px-8">
      {/* Page heading */}
      <div className="space-y-1.5">
        <h1 className="text-[22px] font-bold tracking-tight md:text-[26px]">
          {isAr ? ar.pageTitle : "The brain of Reach"}
        </h1>
        <p className="max-w-3xl text-[13px] text-muted-foreground">
          {isAr ? ar.pageDesc : "Predictions, summaries, and notes Reach pulls together for you."}
        </p>
      </div>

      {/* ── Hero — indigo/violet (intelligence palette) ── */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="highlight-card hl-indigo relative overflow-hidden rounded-3xl"
      >
        <div className="relative z-10 flex flex-col gap-6 p-6 md:flex-row md:items-center md:p-8">
          <div className="flex-1 space-y-4">
            <div className="space-y-1">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.14em] uppercase text-white/80">
                <BrainCircuit className="size-3" />
                {isAr ? ar.helloAi : "Hello from intelligence"}
              </p>
              <h2 className="text-[20px] font-bold leading-tight md:text-[22px] text-white">
                {isAr ? ar.helloAiSub : "Here's what Reach learned about your week"}
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              <HeroKpi label={isAr ? ar.insights : "Insights"} value={aiKpis.insightsThisWeek} icon={Sparkles} delay={0.1} />
              <HeroKpi label={isAr ? ar.accuracy : "Accuracy"} value={aiKpis.accuracyPct} suffix="%" icon={Gauge} delay={0.16} />
              <HeroKpi label={isAr ? ar.timeSaved : "Time saved"} value={aiKpis.timeSavedHours} suffix={isAr ? "س" : "h"} icon={Clock} delay={0.22} />
              <HeroKpi label={isAr ? ar.models : "Models"} value={aiKpis.modelsUsed} icon={Zap} delay={0.28} />
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="hidden md:block shrink-0"
          >
            <BrainIllustration className="h-44 w-auto" />
          </motion.div>
        </div>
      </motion.section>

      {/* ── Ask AI prompt strip ── */}
      <Card className="ring-1 ring-foreground/10">
        <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-3">
          <div className="flex items-center gap-2">
            <motion.span
              animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="flex size-7 items-center justify-center rounded-lg bg-primary/15 text-primary"
            >
              <Sparkles className="size-3.5" />
            </motion.span>
            <div>
              <div className="text-[13px] font-semibold">{isAr ? ar.askAi : "Ask Reach"}</div>
              <div className="mt-0.5 text-[10.5px] text-muted-foreground/65">{isAr ? ar.trySomething : "Try one of the suggestions"}</div>
            </div>
          </div>
        </div>
        <div className="space-y-3 px-5 py-4">
          <div className="flex gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={isAr ? ar.askPh : "Ask anything about your week…"}
              className="flex-1"
              dir={isAr ? "rtl" : "ltr"}
            />
            <Button size="icon-sm" disabled={!draft.trim()} aria-label={isAr ? ar.send : "Send"}>
              <Send className="size-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((p) => (
              <motion.button
                key={p.en}
                type="button"
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setDraft(isAr ? p.ar : p.en)}
                className="rounded-full border border-border/60 panel px-3 py-1.5 text-[11.5px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
              >
                <Sparkles className="me-1 inline size-2.5 text-primary" />
                {isAr ? p.ar : p.en}
              </motion.button>
            ))}
          </div>
        </div>
      </Card>

      {/* ── Predictions grid ── */}
      <section>
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md bg-primary/15 text-primary">
              <TrendingUp className="size-3.5" />
            </span>
            <span className="text-[13px] font-semibold">{isAr ? ar.predictions : "Predictions"}</span>
          </div>
          <div className="mt-0.5 ms-8 text-[11px] text-muted-foreground/65">{isAr ? ar.predictionsSub : "Confidence-scored with trend signals"}</div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {predictions.map((p, idx) => {
            const tone = categoryTone(p.category)
            const Icon = categoryIcon[p.category]
            const TrendIcon = p.trend === "up" ? TrendingUp : p.trend === "down" ? TrendingDown : ArrowRight
            const trendColor = p.trend === "up" ? "text-emerald-500" : p.trend === "down" ? "text-rose-500" : "text-muted-foreground"
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: idx * 0.06 }}
                whileHover={{ y: -3 }}
              >
                <Card className="h-full gap-0 overflow-hidden py-0 ring-1 ring-foreground/10 hover:shadow-lg hover:shadow-primary/5 transition-shadow">
                  <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-2">
                    <div className="flex items-center gap-2">
                      <span className={cn("flex size-9 items-center justify-center rounded-xl", tone.bg, tone.text)}>
                        <Icon className="size-4" />
                      </span>
                      <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {isAr ? ar.categoryLabels[p.category] : p.category}
                      </span>
                    </div>
                    <ConfidenceRing confidence={p.confidence} />
                  </div>
                  <div className="px-5 pb-3">
                    <div className="text-[13px] font-semibold leading-snug">{isAr ? p.titleAr : p.title}</div>
                    <p className="mt-2 text-[11.5px] leading-relaxed text-muted-foreground/80">
                      {isAr ? p.bodyAr : p.body}
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-border/50 bg-muted/20 px-5 py-2.5 dark:bg-muted/10">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                      {isAr ? ar.confidenceLabels[p.confidence] : `${p.confidence} confidence`}
                    </span>
                    <span className={cn("flex items-center gap-1 text-[11px] font-semibold tabular-nums", trendColor)}>
                      <TrendIcon className="size-3" />
                      {p.trendValue}
                    </span>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ── Two-column: Insights feed + Useful notes ── */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Smart insights feed */}
        <Card className="ring-1 ring-foreground/10 lg:col-span-7">
          <div className="border-b border-border/60 px-5 py-4">
            <div className="flex items-center gap-2 text-[13px] font-semibold">
              <span className="flex size-6 items-center justify-center rounded-md bg-primary/15 text-primary">
                <BrainCircuit className="size-3.5" />
              </span>
              {isAr ? ar.insightsFeed : "Smart insights feed"}
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground/65">{isAr ? ar.insightsFeedSub : "What Reach noticed for you"}</div>
          </div>
          <div className="px-5 py-4 space-y-5">
            {/* Today */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary" />
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">{isAr ? ar.today : "Today"}</div>
              </div>
              <div className="space-y-2">
                {todayInsights.map((i, idx) => {
                  const tone = categoryTone(i.category)
                  const Icon = categoryIcon[i.category]
                  return (
                    <motion.div
                      key={i.id}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.18, delay: idx * 0.05 }}
                      whileHover={{ x: isAr ? -2 : 2 }}
                      className="group flex cursor-pointer gap-3 rounded-xl border border-border/50 bg-muted/20 p-3.5 transition-all hover:border-primary/30 hover:bg-primary/[0.03]"
                    >
                      <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", tone.bg, tone.text)}>
                        <Icon className="size-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-[12.5px] font-semibold leading-snug">{isAr ? i.titleAr : i.title}</div>
                          <span className="shrink-0 text-[10px] text-muted-foreground/55">{isAr ? i.timeAr : i.time}</span>
                        </div>
                        <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground/75">{isAr ? i.detailAr : i.detail}</p>
                      </div>
                      <ChevronRight className={cn("self-center size-4 text-muted-foreground/30 group-hover:text-primary transition-colors", isAr && "rotate-180")} />
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* This week */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-muted-foreground/40" />
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/60">{isAr ? ar.thisWeek : "This week"}</div>
              </div>
              <div className="space-y-2">
                {weekInsights.map((i, idx) => {
                  const tone = categoryTone(i.category)
                  const Icon = categoryIcon[i.category]
                  return (
                    <motion.div
                      key={i.id}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.18, delay: 0.15 + idx * 0.05 }}
                      whileHover={{ x: isAr ? -2 : 2 }}
                      className="group flex cursor-pointer gap-3 rounded-xl border border-border/40 bg-card p-3.5 transition-all hover:border-primary/30 hover:bg-muted/30"
                    >
                      <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", tone.bg, tone.text)}>
                        <Icon className="size-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-[12.5px] font-semibold leading-snug">{isAr ? i.titleAr : i.title}</div>
                          <span className="shrink-0 text-[10px] text-muted-foreground/55">{isAr ? i.timeAr : i.time}</span>
                        </div>
                        <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground/70">{isAr ? i.detailAr : i.detail}</p>
                      </div>
                      <ChevronRight className={cn("self-center size-4 text-muted-foreground/30 group-hover:text-primary transition-colors", isAr && "rotate-180")} />
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        </Card>

        {/* Useful notes */}
        <Card className="ring-1 ring-foreground/10 lg:col-span-5">
          <div className="border-b border-border/60 px-5 py-4">
            <div className="flex items-center gap-2 text-[13px] font-semibold">
              <span className="flex size-6 items-center justify-center rounded-md bg-amber-500/15 text-amber-500">
                <Lightbulb className="size-3.5" />
              </span>
              {isAr ? ar.notes : "Useful notes"}
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground/65">{isAr ? ar.notesSub : "Action items Reach pulled out for you"}</div>
          </div>
          <ul className="divide-y divide-border/40">
            {usefulNotes.map((n, i) => {
              const isDone = doneNotes.has(n.id)
              return (
                <motion.li
                  key={n.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.16, delay: i * 0.05 }}
                  className={cn(
                    "group flex items-start gap-3 px-5 py-3.5 transition-colors",
                    isDone ? "bg-emerald-500/[0.04]" : "hover:bg-muted/30",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setDoneNotes((s) => {
                      const next = new Set(s)
                      if (next.has(n.id)) next.delete(n.id); else next.add(n.id)
                      return next
                    })}
                    className={cn(
                      "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      isDone ? "border-emerald-500 bg-emerald-500 text-white" : "border-muted-foreground/40 hover:border-primary",
                    )}
                    aria-label={isAr ? ar.done : "Done"}
                  >
                    {isDone && <CheckCircle2 className="size-3" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className={cn(
                      "text-[12.5px] leading-snug",
                      isDone ? "text-muted-foreground/55 line-through" : "text-foreground",
                    )}>
                      {isAr ? n.textAr : n.text}
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground/55">
                      <Bookmark className="size-2.5" />
                      <span>{isAr ? n.sourceAr : n.source}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-primary transition-all"
                    aria-label={isAr ? ar.pin : "Pin"}
                  >
                    <PinIcon className="size-3.5" />
                  </button>
                </motion.li>
              )
            })}
          </ul>
        </Card>
      </div>

      {/* ── Recommendations ── */}
      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-md bg-primary/15 text-primary">
                <Zap className="size-3.5" />
              </span>
              <span className="text-[13px] font-semibold">{isAr ? ar.recsTitle : "AI recommendations"}</span>
            </div>
            <div className="mt-0.5 ms-8 text-[11px] text-muted-foreground/65">{isAr ? ar.recsSub : "Ranked by impact and risk"}</div>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {recommendations.map((r, idx) => {
            const t = toneToColor(r.tone)
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.06 }}
                whileHover={{ y: -2 }}
              >
                <Card className="h-full gap-0 overflow-hidden py-0 ring-1 ring-foreground/10">
                  <div className="space-y-2 px-5 pt-4 pb-3">
                    <span className={cn("inline-flex size-8 items-center justify-center rounded-lg", t.bg, t.text)}>
                      <Sparkles className="size-3.5" />
                    </span>
                    <div className="text-[13px] font-semibold leading-snug">{isAr ? r.titleAr : r.title}</div>
                    <div className="text-[11.5px] text-muted-foreground/75">{isAr ? r.impactAr : r.impact}</div>
                  </div>
                  <div className="flex items-center justify-end gap-1.5 border-t border-border/50 bg-muted/15 px-5 py-2.5 dark:bg-muted/10">
                    <Button size="xs" variant="ghost" className="gap-1 text-muted-foreground">
                      <X className="size-3" />
                      {isAr ? ar.dismiss : "Dismiss"}
                    </Button>
                    <Button size="xs" variant="default" className="gap-1">
                      <CheckCircle2 className="size-3" />
                      {isAr ? ar.apply : "Apply"}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ── Auto-summaries + Knowledge recs ── */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="ring-1 ring-foreground/10 lg:col-span-7">
          <div className="border-b border-border/60 px-5 py-4">
            <div className="flex items-center gap-2 text-[13px] font-semibold">
              <span className="flex size-6 items-center justify-center rounded-md bg-violet-500/15 text-violet-500">
                <PenLine className="size-3.5" />
              </span>
              {isAr ? ar.summariesTitle : "Auto-generated summaries"}
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground/65">{isAr ? ar.summariesSub : "Decisions and actions, automatic"}</div>
          </div>
          <div className="space-y-4 px-5 py-4">
            {meetingSummaries.map((m, idx) => {
              const bullets = isAr ? m.bulletsAr : m.bullets
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  className="rounded-xl border border-border/50 bg-muted/20 p-4 ring-1 ring-foreground/5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[13px] font-semibold">{isAr ? m.titleAr : m.title}</div>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground/70">
                        <Clock className="size-2.5" />
                        <span>{isAr ? m.whenAr : m.when}</span>
                        <span className="text-muted-foreground/30">·</span>
                        <span>{isAr ? m.durationAr : m.duration}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="gap-1 border-violet-500/30 bg-violet-500/10 text-[10px] text-violet-500">
                      <FileText className="size-2.5" />
                      AI
                    </Badge>
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {bullets.map((b, i) => (
                      <li key={i} className="flex gap-2 text-[12px] leading-relaxed text-muted-foreground/85">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-violet-500" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )
            })}
          </div>
        </Card>

        <Card className="ring-1 ring-foreground/10 lg:col-span-5">
          <div className="border-b border-border/60 px-5 py-4">
            <div className="flex items-center gap-2 text-[13px] font-semibold">
              <span className="flex size-6 items-center justify-center rounded-md bg-blue-500/15 text-blue-500">
                <FileText className="size-3.5" />
              </span>
              {isAr ? ar.knowledgeTitle : "Knowledge recommendations"}
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground/65">{isAr ? ar.knowledgeSub : "Reach matched documents you should attach"}</div>
          </div>
          <ul className="divide-y divide-border/40">
            {knowledgeRecs.map((k, idx) => (
              <motion.li
                key={k.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.18, delay: idx * 0.05 }}
                whileHover={{ backgroundColor: "rgba(59,130,246,0.04)" }}
                className="group flex cursor-pointer items-start gap-3 px-5 py-3.5 transition-colors"
              >
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                  <FileText className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-semibold leading-snug">{isAr ? k.titleAr : k.title}</div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted/40">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${k.match}%` }}
                        transition={{ duration: 0.7, delay: 0.2 + idx * 0.1 }}
                        className="h-full rounded-full bg-blue-500"
                      />
                    </div>
                    <span className="shrink-0 text-[10px] font-bold tabular-nums text-blue-500">
                      {k.match}% {isAr ? ar.match : "match"}
                    </span>
                  </div>
                </div>
                <ArrowUpRight className={cn("self-center size-3.5 text-muted-foreground/30 group-hover:text-blue-500 transition-colors", isAr && "rotate-90")} />
              </motion.li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
