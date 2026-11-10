import * as React from "react"
import { motion } from "framer-motion"

import { Badge, Button, Card } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import { AiCenter } from "./AiCenter"
import {
  knowledgeRecs,
  meetingSummaries,
  predictions,
  recommendations,
  smartInsights,
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
  Lightbulb,
  Mail,
  PenLine,
  PinIcon,
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
    case "email": return { bg: "bg-info/12", text: "text-info", dot: "bg-info" }
    case "meeting": return { bg: "bg-module/12", text: "text-module", dot: "bg-module" }
    case "risk": return { bg: "bg-error/12", text: "text-error", dot: "bg-error" }
    case "people": return { bg: "bg-warning/12", text: "text-warning", dot: "bg-warning" }
  }
}

function confidenceTone(c: Confidence) {
  if (c === "high") return { ring: "stroke-success", text: "text-success", value: 92 }
  if (c === "moderate") return { ring: "stroke-warning", text: "text-warning", value: 68 }
  return { ring: "stroke-muted-foreground", text: "text-muted-foreground", value: 38 }
}

function toneToColor(t: Tone): { bg: string; text: string; border: string } {
  switch (t) {
    case "primary": return { bg: "bg-primary/12", text: "text-primary", border: "border-primary/30" }
    case "emerald": return { bg: "bg-success/12", text: "text-success", border: "border-success/30" }
    case "blue": return { bg: "bg-info/12", text: "text-info", border: "border-info/30" }
    case "amber": return { bg: "bg-warning/12", text: "text-warning", border: "border-warning/30" }
    case "violet": return { bg: "bg-module/12", text: "text-module", border: "border-module/30" }
    case "rose": return { bg: "bg-error/12", text: "text-error", border: "border-error/30" }
  }
}

// ─── animated counter ────────────────────────────────────────────────────────

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

/** The v1 intelligence content (predictions, insights, notes, recommendations,
 *  meeting summaries, suggested documents), kept below the AI Center chat. */
function InsightsSection({ isAr }: { isAr: boolean }) {
  const [doneNotes, setDoneNotes] = React.useState<Set<string>>(new Set())

  const todayInsights = smartInsights.filter((i) => i.group === "today")
  const weekInsights = smartInsights.filter((i) => i.group === "week")

  return (
    <div className="space-y-6">
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
            const trendColor = p.trend === "up" ? "text-success" : p.trend === "down" ? "text-error" : "text-muted-foreground"
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: idx * 0.06 }}
                whileHover={{ y: -3 }}
              >
                <Card className="rounded-[12px] h-full gap-0 overflow-hidden py-0 ring-1 ring-foreground/10 hover:shadow-lg hover:shadow-primary/5 transition-shadow">
                  <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-2">
                    <div className="flex items-center gap-2">
                      <span className={cn("flex size-9 items-center justify-center rounded-[12px]", tone.bg, tone.text)}>
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
        <Card className="rounded-[12px] ring-1 ring-foreground/10 lg:col-span-7">
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
                      className="group flex cursor-pointer gap-3 rounded-[12px] border border-border/50 bg-muted/20 p-3.5 transition-all hover:border-primary/30 hover:bg-primary/[0.03]"
                    >
                      <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-[8px]", tone.bg, tone.text)}>
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
                      className="group flex cursor-pointer gap-3 rounded-[12px] border border-border/40 bg-card p-3.5 transition-all hover:border-primary/30 hover:bg-muted/30"
                    >
                      <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-[8px]", tone.bg, tone.text)}>
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
        <Card className="rounded-[12px] ring-1 ring-foreground/10 lg:col-span-5">
          <div className="border-b border-border/60 px-5 py-4">
            <div className="flex items-center gap-2 text-[13px] font-semibold">
              <span className="flex size-6 items-center justify-center rounded-md bg-warning/15 text-warning">
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
                    isDone ? "bg-success/[0.04]" : "hover:bg-muted/30",
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
                      isDone ? "border-success bg-success text-white" : "border-muted-foreground/40 hover:border-primary",
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
                <Card className="rounded-[12px] h-full gap-0 overflow-hidden py-0 ring-1 ring-foreground/10">
                  <div className="space-y-2 px-5 pt-4 pb-3">
                    <span className={cn("inline-flex size-8 items-center justify-center rounded-[8px]", t.bg, t.text)}>
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
        <Card className="rounded-[12px] ring-1 ring-foreground/10 lg:col-span-7">
          <div className="border-b border-border/60 px-5 py-4">
            <div className="flex items-center gap-2 text-[13px] font-semibold">
              <span className="flex size-6 items-center justify-center rounded-md bg-module/15 text-module">
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
                  className="rounded-[12px] border border-border/50 bg-muted/20 p-4 ring-1 ring-foreground/5"
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
                    <Badge variant="outline" className="gap-1 border-module/30 bg-module/10 text-[10px] text-module">
                      <FileText className="size-2.5" />
                      AI
                    </Badge>
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {bullets.map((b, i) => (
                      <li key={i} className="flex gap-2 text-[12px] leading-relaxed text-muted-foreground/85">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-module" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )
            })}
          </div>
        </Card>

        <Card className="rounded-[12px] ring-1 ring-foreground/10 lg:col-span-5">
          <div className="border-b border-border/60 px-5 py-4">
            <div className="flex items-center gap-2 text-[13px] font-semibold">
              <span className="flex size-6 items-center justify-center rounded-md bg-info/15 text-info">
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
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-info/10 text-info">
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
                        className="h-full rounded-full bg-info"
                      />
                    </div>
                    <span className="shrink-0 text-[10px] font-bold tabular-nums text-info">
                      {k.match}% {isAr ? ar.match : "match"}
                    </span>
                  </div>
                </div>
                <ArrowUpRight className={cn("self-center size-3.5 text-muted-foreground/30 group-hover:text-info transition-colors", isAr && "rotate-90")} />
              </motion.li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}

/** AI Center page (/intelligence) — Figma 2028:2252 · 4858:15788. */
export default function IntelligenceHub() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  return (
    <main className="w-full space-y-10 px-4 pb-10 pt-6 sm:px-6 lg:px-10 lg:pt-8">
      <AiCenter isAr={isAr} />
      <section aria-label={isAr ? "رؤى المساعد" : "Assistant insights"} className="space-y-6">
        <div className="flex flex-col items-start gap-2">
          <h2 className="flex items-center gap-2 text-[17px] font-medium leading-[25.5px]"><BrainCircuit className="size-4 text-primary" />{isAr ? "رؤى المساعد" : "Assistant insights"}</h2>
          <span className="h-[3px] w-12 rounded-[2px] bg-primary" />
        </div>
        <InsightsSection isAr={isAr} />
      </section>
    </main>
  )
}
