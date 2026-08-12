import * as React from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

import {
  Badge,
  Button,
  Card,
} from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Clock,
  ListChecks,
  MessageSquareText,
  Plus,
  Timer,
  TrendingUp,
  Users,
} from "lucide-react"

import {
  activeSurveys,
  categoryAr,
  closedSurveys,
  pulsePoll,
} from "../data/mock/surveys"
import { getCompletedSurveys, getCreatedSurveys, subscribeCompleted, subscribeCreated } from "../store"

// ── small helpers ────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  value,
  label,
  sub,
}: {
  icon: typeof Users
  value: string
  label: string
  sub: string
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4 text-primary" />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className="mt-2 text-2xl font-semibold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </Card>
  )
}

function Bar({ pct, label }: { pct: number; label: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-foreground/80">{label}</span>
        <span className="tabular-nums text-muted-foreground">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full bg-primary"
        />
      </div>
    </div>
  )
}

export default function SurveysPage() {
  const { locale, role } = useShell()
  const isAr = locale === "ar"
  const isAdmin = role === "admin"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()

  const created = React.useSyncExternalStore(subscribeCreated, getCreatedSurveys)
  const completedList = React.useSyncExternalStore(subscribeCompleted, getCompletedSurveys)
  const completed = React.useMemo(() => new Set(completedList), [completedList])

  const [vote, setVote] = React.useState<string | null>(null)
  const pollTotal = pulsePoll.options.reduce((s, o) => s + o.votes, 0) + (vote ? 1 : 0)

  const awaiting = activeSurveys.filter((s) => !completed.has(s.id))
  const doneCount = completed.size
  const avgParticipation = Math.round(
    closedSurveys.reduce((s, c) => s + c.participation, 0) / closedSurveys.length,
  )

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      {/* header */}
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <ClipboardList className="size-5" />
            <span className="text-xs font-semibold uppercase tracking-[0.14em]">
              {t("Surveys & polls", "الاستبيانات والتصويت")}
            </span>
          </div>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight">
            {t("Your voice shapes Wajha", "صوتك يصنع وجهة")}
          </h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            {t(
              "Respond to active surveys, vote in quick pulses, and see the results captured across the organization.",
              "شارك في الاستبيانات النشطة، صوّت في استطلاعات سريعة، وشاهد النتائج المجمّعة على مستوى المؤسسة.",
            )}
          </p>
        </div>
        {isAdmin && (
          <Button size="lg" onClick={() => navigate("/surveys/new")} className="shrink-0">
            <Plus className="size-4" />
            {t("Create survey", "إنشاء استبيان")}
          </Button>
        )}
      </header>

      {/* KPIs */}
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={ClipboardList} value={String(awaiting.length)} label={t("Awaiting you", "بانتظارك")} sub={t("assigned to you", "مُسندة إليك")} />
        <StatCard icon={CheckCircle2} value={String(doneCount)} label={t("Completed", "مكتملة")} sub={t("this cycle", "هذه الدورة")} />
        <StatCard icon={TrendingUp} value={`${avgParticipation}%`} label={t("Participation", "المشاركة")} sub={t("org average", "متوسط المؤسسة")} />
        <StatCard icon={Clock} value={String(awaiting.filter((s) => s.closingSoon).length)} label={t("Closing soon", "تُغلق قريبًا")} sub={t("within 3 days", "خلال ٣ أيام")} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          {/* surveys you created */}
          {created.length > 0 && (
            <>
              <div className="mb-3 flex items-center gap-2">
                <ListChecks className="size-5 text-primary" />
                <h2 className="font-heading text-lg font-semibold">{t("Your surveys", "استبياناتك")}</h2>
              </div>
              <div className="mb-8 space-y-3">
                {created.map((c) => (
                  <Card key={c.id} className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-primary/15 text-primary">{t("Live", "نشط")}</Badge>
                          <Badge variant="outline">{isAr ? categoryAr[c.category] : c.category}</Badge>
                        </div>
                        <h3 className="mt-2 font-medium">{c.title}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {c.questionCount} {t("questions · just published · 0 responses", "سؤال · نُشر للتو · ٠ ردود")}
                        </p>
                      </div>
                      <Button variant="outline" disabled>
                        {t("View results", "عرض النتائج")}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}

          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold">{t("Awaiting your response", "بانتظار ردّك")}</h2>
            <Badge variant="secondary">{awaiting.length}</Badge>
          </div>

          {awaiting.length === 0 ? (
            <Card className="flex flex-col items-center gap-2 p-10 text-center">
              <CheckCircle2 className="size-8 text-primary" />
              <p className="font-medium">{t("All caught up", "أنجزت كل شيء")}</p>
              <p className="text-sm text-muted-foreground">{t("You've responded to every open survey.", "لقد أجبت على كل الاستبيانات المفتوحة.")}</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {awaiting.map((s) => (
                <Card key={s.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{isAr ? categoryAr[s.category] : s.category}</Badge>
                        {s.closingSoon && <Badge className="bg-primary/15 text-primary">{t("Closing soon", "تُغلق قريبًا")}</Badge>}
                      </div>
                      <h3 className="mt-2 font-medium">{isAr ? s.titleAr : s.title}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><MessageSquareText className="size-3.5" />{s.questions} {t("questions", "سؤال")}</span>
                        <span className="inline-flex items-center gap-1"><Timer className="size-3.5" />~{s.minutes} {t("min", "دقيقة")}</span>
                        <span className="inline-flex items-center gap-1"><Clock className="size-3.5" />{isAr ? s.dueAr : s.due}</span>
                      </div>
                    </div>
                    <Button onClick={() => navigate(`/surveys/${s.id}/respond`)}>{t("Respond", "شارك")}</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* recent results */}
          <div className="mb-3 mt-8 flex items-center gap-2">
            <BarChart3 className="size-5 text-primary" />
            <h2 className="font-heading text-lg font-semibold">{t("Recent results", "أحدث النتائج")}</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {closedSurveys.map((c) => (
              <Card key={c.id} className="p-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{isAr ? categoryAr[c.category] : c.category}</Badge>
                  <span className="text-xs text-muted-foreground">{isAr ? c.closedAr : c.closed}</span>
                </div>
                <h3 className="mt-2 font-medium">{isAr ? c.titleAr : c.title}</h3>
                <p className="mt-0.5 text-sm text-primary">{isAr ? c.headlineAr : c.headline}</p>
                <div className="mt-3 space-y-2">
                  {c.breakdown.map((b) => (
                    <Bar key={b.label} pct={b.pct} label={isAr ? b.labelAr : b.label} />
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Users className="size-3.5" />{c.responses} {t("responses", "رد")}</span>
                  <span className="inline-flex items-center gap-1"><TrendingUp className="size-3.5" />{c.participation}% {t("participation", "مشاركة")}</span>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* live pulse poll */}
        <aside className="lg:col-span-1">
          <Card className="p-5">
            <div className="flex items-center gap-2 text-primary">
              <BarChart3 className="size-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">{t("Live pulse", "نبض مباشر")}</span>
            </div>
            <h3 className="mt-2 font-medium">{isAr ? pulsePoll.questionAr : pulsePoll.question}</h3>
            <div className="mt-4 space-y-2">
              {pulsePoll.options.map((o) => {
                const voted = vote != null
                const count = o.votes + (vote === o.id ? 1 : 0)
                const pct = pollTotal ? Math.round((count / pollTotal) * 100) : 0
                if (!voted) {
                  return (
                    <button key={o.id} onClick={() => setVote(o.id)} className="w-full rounded-lg border border-border bg-card px-3 py-2 text-start text-sm transition-colors hover:border-primary hover:bg-primary/5">
                      {isAr ? o.labelAr : o.label}
                    </button>
                  )
                }
                return (
                  <div key={o.id} className={cn("rounded-lg border px-3 py-2", vote === o.id ? "border-primary bg-primary/5" : "border-border")}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="inline-flex items-center gap-1.5">{vote === o.id && <CheckCircle2 className="size-3.5 text-primary" />}{isAr ? o.labelAr : o.label}</span>
                      <span className="tabular-nums text-muted-foreground">{pct}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5, ease: "easeOut" }} className="h-full rounded-full bg-primary" />
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {vote
                ? t(`Thanks — your vote was counted. ${pollTotal} responses.`, `شكرًا — تم احتساب صوتك. ${pollTotal} رد.`)
                : t(`${pollTotal} responses so far · anonymous`, `${pollTotal} رد حتى الآن · مجهول`)}
            </p>
          </Card>
        </aside>
      </div>

    </main>
  )
}
