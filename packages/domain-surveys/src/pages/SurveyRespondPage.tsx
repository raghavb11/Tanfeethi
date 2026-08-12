import * as React from "react"
import { motion } from "framer-motion"
import { useNavigate, useParams } from "react-router-dom"

import { Badge, Button, Card, Textarea } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import { ArrowLeft, CheckCircle2, ClipboardList, Lock, Star, Timer } from "lucide-react"

import { activeSurveys, categoryAr, getSurveyForm, scaleLabels, type FormQuestion } from "../data/mock/surveys"
import { markSurveyCompleted } from "../store"

type Answer = number | string | string[] | undefined

export default function SurveyRespondPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const { id = "" } = useParams()

  const survey = activeSurveys.find((s) => s.id === id)
  const form = getSurveyForm(id)
  const [answers, setAnswers] = React.useState<Record<string, Answer>>({})
  const [submitted, setSubmitted] = React.useState(false)
  const [showErrors, setShowErrors] = React.useState(false)

  const allQuestions = form.sections.flatMap((s) => s.questions)
  const required = allQuestions.filter((q) => q.required)
  const isAnswered = (q: FormQuestion) => {
    const v = answers[q.id]
    if (q.kind === "multi") return Array.isArray(v) && v.length > 0
    if (q.kind === "text") return typeof v === "string" && v.trim().length > 0
    return v !== undefined && v !== null && v !== ""
  }
  const answeredRequired = required.filter(isAnswered).length
  const pct = required.length ? Math.round((answeredRequired / required.length) * 100) : 100
  const canSubmit = answeredRequired === required.length

  const set = (qid: string, v: Answer) => setAnswers((a) => ({ ...a, [qid]: v }))
  const toggleMulti = (qid: string, label: string) => setAnswers((a) => {
    const cur = Array.isArray(a[qid]) ? (a[qid] as string[]) : []
    return { ...a, [qid]: cur.includes(label) ? cur.filter((x) => x !== label) : [...cur, label] }
  })

  const submit = () => {
    if (!canSubmit) { setShowErrors(true); window.scrollTo({ top: 0, behavior: "smooth" }); return }
    markSurveyCompleted(id)
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (submitted) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-col items-center px-4 py-20 text-center sm:px-6">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 16 }}>
          <CheckCircle2 className="size-16 text-primary" />
        </motion.div>
        <h1 className="mt-5 font-heading text-2xl font-bold">{t("Thank you — response submitted", "شكرًا — تم إرسال الرد")}</h1>
        <p className="mt-2 text-muted-foreground">{t("Your answers are anonymous and now part of the aggregated results. You can't be individually identified.", "إجاباتك مجهولة وأصبحت جزءًا من النتائج المجمّعة. لا يمكن تحديد هويتك بشكل فردي.")}</p>
        <Button className="mt-8" onClick={() => navigate("/surveys")}>{t("Back to surveys", "العودة إلى الاستبيانات")}</Button>
      </main>
    )
  }

  const title = survey ? (isAr ? survey.titleAr : survey.title) : t("Survey", "استبيان")

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
      <button onClick={() => navigate("/surveys")} className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />{t("Back to surveys", "العودة إلى الاستبيانات")}
      </button>

      {/* intro header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 text-primary">
          <ClipboardList className="size-5" />
          <span className="text-xs font-semibold uppercase tracking-[0.14em]">{t("Survey", "استبيان")}</span>
          {survey && <Badge variant="outline">{isAr ? categoryAr[survey.category] : survey.category}</Badge>}
        </div>
        <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        <p className="mt-2 leading-relaxed text-muted-foreground">{isAr ? form.introAr : form.intro}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><ClipboardList className="size-3.5" />{allQuestions.length} {t("questions", "سؤال")} · {form.sections.length} {t("sections", "أقسام")}</span>
          <span className="inline-flex items-center gap-1"><Timer className="size-3.5" />~{form.minutes} {t("min", "دقيقة")}</span>
          <span className="inline-flex items-center gap-1"><Lock className="size-3.5" />{t("Anonymous", "مجهول")}</span>
        </div>
      </div>

      {/* sticky progress */}
      <div className="sticky top-16 z-10 mb-6 rounded-xl border border-border bg-card/95 p-3 shadow-sm backdrop-blur">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-medium">{t("Progress", "التقدّم")}</span>
          <span className="tabular-nums text-muted-foreground">{answeredRequired} / {required.length} {t("required", "إلزامي")}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <motion.div className="h-full rounded-full bg-primary" animate={{ width: `${pct}%` }} transition={{ duration: 0.35 }} />
        </div>
        {showErrors && !canSubmit && <p className="mt-2 text-xs text-destructive">{t("Please answer all required questions (marked *).", "يُرجى الإجابة على جميع الأسئلة الإلزامية (المميّزة بـ *).")}</p>}
      </div>

      {/* sections */}
      <div className="space-y-6">
        {form.sections.map((sec, si) => (
          <Card key={si} className="p-5 sm:p-6">
            <div className="mb-1 flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">{si + 1}</span>
              <h2 className="font-heading text-lg font-semibold">{isAr ? sec.titleAr : sec.title}</h2>
            </div>
            <p className="mb-5 ps-8 text-sm text-muted-foreground">{isAr ? sec.descAr : sec.desc}</p>

            <div className="space-y-6">
              {sec.questions.map((q) => {
                const missing = showErrors && q.required && !isAnswered(q)
                return (
                  <div key={q.id} className={cn("rounded-lg", missing && "-mx-2 bg-destructive/5 px-2 py-2 ring-1 ring-destructive/30")}>
                    <p className="mb-2 text-sm font-medium">
                      {isAr ? q.qAr : q.q}{q.required && <span className="ms-1 text-primary">*</span>}
                    </p>

                    {q.kind === "rating" && (
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button key={n} type="button" onClick={() => set(q.id, n)} aria-label={`${n}`} className="rounded-md p-1 transition-transform hover:scale-110">
                            <Star className={cn("size-7", (answers[q.id] as number) >= n ? "fill-primary text-primary" : "text-muted-foreground/40")} />
                          </button>
                        ))}
                      </div>
                    )}

                    {q.kind === "scale" && (
                      <div className="grid grid-cols-5 gap-1.5">
                        {scaleLabels.map((o, idx) => {
                          const val = idx + 1
                          const active = answers[q.id] === val
                          return (
                            <button key={idx} type="button" onClick={() => set(q.id, val)} className={cn("flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-center text-[11px] leading-tight transition-colors", active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/60")}>
                              <span className={cn("size-2.5 rounded-full", active ? "bg-primary" : "bg-muted-foreground/30")} />
                              {isAr ? o.labelAr : o.label}
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {q.kind === "choice" && (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {q.options.map((o) => {
                          const active = answers[q.id] === o.label
                          return (
                            <button key={o.label} type="button" onClick={() => set(q.id, o.label)} className={cn("rounded-lg border px-3 py-2 text-start text-sm transition-colors", active ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/60")}>
                              <span className="inline-flex items-center gap-2">{active && <CheckCircle2 className="size-4" />}{isAr ? o.labelAr : o.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {q.kind === "multi" && (
                      <div className="flex flex-wrap gap-2">
                        {q.options.map((o) => {
                          const cur = Array.isArray(answers[q.id]) ? (answers[q.id] as string[]) : []
                          const active = cur.includes(o.label)
                          return (
                            <button key={o.label} type="button" onClick={() => toggleMulti(q.id, o.label)} className={cn("rounded-full border px-3.5 py-1.5 text-sm transition-colors", active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/60")}>
                              <span className="inline-flex items-center gap-1.5">{active && <CheckCircle2 className="size-3.5" />}{isAr ? o.labelAr : o.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {q.kind === "text" && (
                      <Textarea rows={3} value={(answers[q.id] as string) ?? ""} onChange={(e) => set(q.id, e.target.value)} placeholder={t("Your answer (optional)…", "إجابتك (اختياري)…")} dir={isAr ? "rtl" : "ltr"} className={isAr ? "text-right" : undefined} />
                    )}
                  </div>
                )
              })}
            </div>
          </Card>
        ))}
      </div>

      {/* footer submit */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 p-4">
        <p className="text-sm text-muted-foreground">{t("Your answers are anonymous and aggregated.", "إجاباتك مجهولة ومجمّعة.")}</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/surveys")}>{t("Cancel", "إلغاء")}</Button>
          <Button onClick={submit}><CheckCircle2 className="size-4" />{t("Submit response", "إرسال الرد")}</Button>
        </div>
      </div>
    </main>
  )
}
