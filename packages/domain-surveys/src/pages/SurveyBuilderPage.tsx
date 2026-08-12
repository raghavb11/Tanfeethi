import * as React from "react"
import { useNavigate } from "react-router-dom"

import { Badge, Button, Card, Input } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import { ArrowLeft, CheckCircle2, ListChecks, Plus, Star, Trash2, Type } from "lucide-react"

import { categoryAr, type SurveyCategory } from "../data/mock/surveys"
import { addCreatedSurvey } from "../store"

const CATEGORIES: SurveyCategory[] = ["Pulse", "Facilities", "Product", "Culture", "Wellbeing"]

type QType = "rating" | "single" | "multi" | "text"
type QuestionDraft = { id: number; type: QType; text: string; options: string[] }

const QTYPES: { type: QType; en: string; ar: string; icon: typeof Star }[] = [
  { type: "rating", en: "Rating", ar: "تقييم", icon: Star },
  { type: "single", en: "Single choice", ar: "اختيار واحد", icon: CheckCircle2 },
  { type: "multi", en: "Multiple choice", ar: "اختيار متعدد", icon: ListChecks },
  { type: "text", en: "Text", ar: "نص", icon: Type },
]

export default function SurveyBuilderPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()

  const nextId = React.useRef(2)
  const newQuestion = (type: QType = "single"): QuestionDraft => ({
    id: nextId.current++,
    type,
    text: "",
    options: type === "single" || type === "multi" ? ["", ""] : [],
  })

  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [category, setCategory] = React.useState<SurveyCategory>("Pulse")
  const [questions, setQuestions] = React.useState<QuestionDraft[]>([
    { id: 1, type: "single", text: "", options: ["", ""] },
  ])

  const setQ = (id: number, patch: Partial<QuestionDraft>) =>
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, ...patch } : q)))

  const changeType = (id: number, type: QType) =>
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === id
          ? { ...q, type, options: (type === "single" || type === "multi") && q.options.length < 2 ? ["", ""] : q.options }
          : q,
      ),
    )

  const canPublish =
    title.trim().length > 0 &&
    questions.length > 0 &&
    questions.every(
      (q) =>
        q.text.trim().length > 0 &&
        (q.type === "text" || q.type === "rating" || q.options.filter((o) => o.trim()).length >= 2),
    )

  const publish = () => {
    addCreatedSurvey({
      id: `created-${Date.now()}`,
      title: title.trim(),
      category,
      questionCount: questions.length,
    })
    navigate("/surveys")
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      {/* header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/surveys")}
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />
          {t("Back to surveys", "العودة إلى الاستبيانات")}
        </button>
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          {t("Create a survey", "إنشاء استبيان")}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {t("Add questions, then publish to your audience.", "أضف الأسئلة، ثم انشرها لجمهورك.")}
        </p>
      </div>

      <div className="space-y-6">
        {/* details */}
        <Card className="space-y-5 p-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t("Survey title", "عنوان الاستبيان")}</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("e.g. Q4 Employee Pulse", "مثال: نبض الموظفين — الربع الرابع")}
              className={isAr ? "text-right" : undefined}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              {t("Description", "الوصف")} <span className="text-muted-foreground">({t("optional", "اختياري")})</span>
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("A short intro shown to respondents", "مقدمة قصيرة تظهر للمشاركين")}
              className={isAr ? "text-right" : undefined}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t("Category", "الفئة")}</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-colors",
                    category === c ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/60",
                  )}
                >
                  {isAr ? categoryAr[c] : c}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* questions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold">{t("Questions", "الأسئلة")}</h2>
            <Badge variant="secondary">{questions.length}</Badge>
          </div>

          {questions.map((q, qi) => (
            <Card key={q.id} className="space-y-3 p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t("Question", "سؤال")} {qi + 1}
                </span>
                {questions.length > 1 && (
                  <button
                    onClick={() => setQuestions((qs) => qs.filter((x) => x.id !== q.id))}
                    className="text-muted-foreground transition-colors hover:text-destructive"
                    aria-label={t("Remove question", "حذف السؤال")}
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {QTYPES.map((qt) => (
                  <button
                    key={qt.type}
                    onClick={() => changeType(q.id, qt.type)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors",
                      q.type === qt.type ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/60",
                    )}
                  >
                    <qt.icon className="size-3.5" />
                    {isAr ? qt.ar : qt.en}
                  </button>
                ))}
              </div>

              <Input
                value={q.text}
                onChange={(e) => setQ(q.id, { text: e.target.value })}
                placeholder={t("Type your question…", "اكتب سؤالك…")}
                className={isAr ? "text-right" : undefined}
              />

              {(q.type === "single" || q.type === "multi") && (
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <span className="w-4 text-xs text-muted-foreground">{oi + 1}.</span>
                      <Input
                        value={opt}
                        onChange={(e) => setQ(q.id, { options: q.options.map((o, i) => (i === oi ? e.target.value : o)) })}
                        placeholder={t("Option", "خيار")}
                        className={cn("h-9", isAr ? "text-right" : undefined)}
                      />
                      {q.options.length > 2 && (
                        <button
                          onClick={() => setQ(q.id, { options: q.options.filter((_, i) => i !== oi) })}
                          className="text-muted-foreground transition-colors hover:text-destructive"
                          aria-label={t("Remove option", "حذف الخيار")}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => setQ(q.id, { options: [...q.options, ""] })}>
                    <Plus className="size-3.5" />
                    {t("Add option", "إضافة خيار")}
                  </Button>
                </div>
              )}

              {q.type === "rating" && (
                <p className="text-xs text-muted-foreground">{t("Respondents rate 1–5 stars.", "يقيّم المشاركون من ١ إلى ٥ نجوم.")}</p>
              )}
              {q.type === "text" && (
                <p className="text-xs text-muted-foreground">{t("Respondents write a free-text answer.", "يكتب المشاركون إجابة نصية حرة.")}</p>
              )}
            </Card>
          ))}

          <Button variant="outline" onClick={() => setQuestions((qs) => [...qs, newQuestion()])}>
            <Plus className="size-4" />
            {t("Add question", "إضافة سؤال")}
          </Button>
        </div>

        {/* actions */}
        <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-2 border-t border-border bg-background/85 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:px-4">
          <Button variant="outline" onClick={() => navigate("/surveys")}>
            {t("Cancel", "إلغاء")}
          </Button>
          <Button disabled={!canPublish} onClick={publish}>
            {t("Publish survey", "نشر الاستبيان")}
          </Button>
        </div>
      </div>
    </main>
  )
}
