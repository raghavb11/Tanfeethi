import * as React from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { Button, Input, Textarea } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import { ArrowLeft, Check, Trash2 } from "lucide-react"

import { HealthPill } from "../components/HealthPill"
import {
  addMilestone, archiveMilestone, getMilestone, HEALTH, milestoneHealth, newMilestoneId,
  nextMilestoneCode, type Rag, updateMilestone, useMilestoneLog,
} from "../data/milestones"
import { getProjectById } from "../data/projects"
import { clearMilestone, useTasks } from "../data/tasks"

/** Add or edit one milestone. A full routed page, never a dialog. The colour
 *  is worked out from the milestone's tasks unless a manager sets it here,
 *  and a colour set by hand always carries its reason. */
export default function MilestoneEditorPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const { id: projectId = "", mid } = useParams()

  const project = getProjectById(projectId)
  const milestone = mid ? getMilestone(mid) : undefined
  const editing = !!milestone
  // Opened from a task being created: return there (draft restored) with the new milestone.
  const [params] = useSearchParams()
  const returnTo = params.get("back")
  const back = returnTo ?? `/projects/${projectId}`
  const tasks = useTasks()
  const log = useMilestoneLog().filter((e) => e.milestoneId === mid)

  const [code] = React.useState(milestone?.code ?? nextMilestoneCode(projectId))
  const [name, setName] = React.useState(milestone?.name ?? "")
  const [nameAr, setNameAr] = React.useState(milestone?.nameAr ?? "")
  const [startISO, setStartISO] = React.useState(milestone?.startISO ?? project?.startISO ?? "")
  const [dueISO, setDueISO] = React.useState(milestone?.dueISO ?? "")
  const [description, setDescription] = React.useState(milestone?.description ?? "")
  const [mode, setMode] = React.useState<"auto" | Rag>(milestone?.ragOverride ?? "auto")
  const [reason, setReason] = React.useState(milestone?.ragReason ?? "")
  const [removing, setRemoving] = React.useState(false)

  // what the calculation says right now, so the manager overrides knowingly
  const report = milestone ? milestoneHealth({ ...milestone, ragOverride: undefined }, tasks) : undefined
  const taskCount = milestone ? tasks.filter((x) => x.milestoneId === milestone.id).length : 0

  const datesOk = !!startISO && !!dueISO && startISO <= dueISO
  const reasonOk = mode === "auto" || reason.trim().length >= 5
  const canSave = !!project && name.trim() !== "" && datesOk && reasonOk

  const save = () => {
    if (!canSave) return
    const fields = {
      name: name.trim(), nameAr: nameAr.trim() || name.trim(),
      startISO, dueISO,
      description: description.trim() || undefined,
      descriptionAr: description.trim() || undefined,
      ragOverride: mode === "auto" ? undefined : mode,
      ragReason: mode === "auto" ? undefined : reason.trim(),
    }
    if (milestone) { updateMilestone(milestone.id, fields); navigate(back); return }
    const newId = newMilestoneId()
    addMilestone({ id: newId, projectId, code, ...fields })
    navigate(returnTo ? `${returnTo}${returnTo.includes("?") ? "&" : "?"}milestone=${newId}` : back)
  }

  const remove = () => {
    if (!milestone) return
    clearMilestone(milestone.id)
    archiveMilestone(milestone.id)
    navigate(back)
  }

  const label = (s: string) => (
    <label className="mb-1.5 block text-[12px] text-muted-foreground">{s}</label>
  )

  if (!project) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6">
        <p className="text-sm text-muted-foreground">{t("That project no longer exists.", "لم يعد هذا المشروع موجودًا.")}</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/projects")}>{t("Back to projects", "العودة إلى المشاريع")}</Button>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-[840px] px-4 pt-6 pb-6 sm:px-6 lg:px-10 lg:pt-8">
      <section className="highlight-card hl-green mb-10 flex flex-col gap-8 rounded-2xl px-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => navigate(back)} className="inline-flex h-[34px] items-center gap-2 rounded-lg px-3 text-[13.5px] font-medium hover:bg-foreground/5">
          <ArrowLeft className={cn("size-[14px]", isAr && "rotate-180")} />{isAr ? project.nameAr : project.name}
        </button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(back)}>{t("Cancel", "إلغاء")}</Button>
          <Button disabled={!canSave} className="gap-1.5" onClick={save}>
            <Check className="size-4" />{editing ? t("Save milestone", "حفظ المعلم") : t("Create milestone", "إنشاء المعلم")}
          </Button>
        </div>
      </div>

      <div>
        <h1 className="text-[28px] font-medium leading-[38px]">
          {editing ? t("Edit milestone", "تعديل المعلم") : t("New milestone", "معلم جديد")}
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {t("A dated checkpoint in the project. Tasks sit under it, and its colour follows them.",
             "نقطة مؤرخة في المشروع، تندرج تحتها المهام ويتبع لونها تقدّمها.")}
        </p>
      </div>
      </section>

      <div className="panel rounded-xl px-4 py-5">
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
            <div>
              {label(t("Code", "الرمز"))}
              <Input value={code} readOnly className="bg-muted/40 tabular-nums text-muted-foreground" />
            </div>
            <div>
              {label(t("Name", "الاسم"))}
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("Release 1 build", "بناء الإصدار الأول")} />
            </div>
          </div>

          <div>
            {label(t("Name in Arabic", "الاسم بالعربية"))}
            <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} dir="rtl" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              {label(t("Starts", "يبدأ"))}
              <Input type="date" value={startISO} onChange={(e) => setStartISO(e.target.value)} />
            </div>
            <div>
              {label(t("Due", "يستحق"))}
              <Input type="date" value={dueISO} onChange={(e) => setDueISO(e.target.value)} />
              {startISO && dueISO && !datesOk && (
                <p className="mt-1.5 text-[11.5px] text-error">
                  {t("The due date has to be on or after the start.", "يجب أن يكون الاستحقاق في يوم البدء أو بعده.")}
                </p>
              )}
            </div>
          </div>

          <div>
            {label(t("What it delivers", "ما الذي يسلّمه"))}
            <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
                      placeholder={t("What is true when this milestone is done.", "ما الذي يتحقق عند اكتمال هذا المعلم.")} />
          </div>

          {/* RAG: calculated by default, a manager can overrule it with a reason */}
          <div className="rounded-lg bg-background/60 p-4 ring-1 ring-inset ring-input">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-[13.5px] font-semibold">{t("Status colour", "لون الحالة")}</h2>
              {report && (
                <span className="inline-flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
                  {t("Calculated:", "المحسوب:")}
                  <HealthPill health={report.calculated} isAr={isAr} size="sm" />
                </span>
              )}
            </div>
            {report && (
              <p className="mt-1 text-[12px] text-muted-foreground">
                {isAr ? milestoneHealth({ ...milestone!, ragOverride: undefined }, tasks).reasonAr
                      : milestoneHealth({ ...milestone!, ragOverride: undefined }, tasks).reason}
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              {(["auto", "green", "amber", "red"] as const).map((m) => (
                <button
                  key={m} type="button" onClick={() => setMode(m)} aria-pressed={mode === m}
                  className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                    mode === m ? "border-transparent bg-soft-accent text-primary" : "border-input text-muted-foreground hover:bg-muted/50")}
                >
                  {m !== "auto" && <span className={cn("size-2 rounded-full", HEALTH[m].dot)} />}
                  {m === "auto" ? t("Work it out from the tasks", "احسبه من المهام") : isAr ? HEALTH[m].ar : HEALTH[m].en}
                </button>
              ))}
            </div>

            {mode !== "auto" && (
              <div className="mt-3">
                {label(t("Why you are setting it", "سبب التحديد اليدوي"))}
                <Textarea
                  rows={2} value={reason} onChange={(e) => setReason(e.target.value)}
                  placeholder={t("What the numbers do not show — this appears next to the colour.",
                                 "ما لا تظهره الأرقام — سيظهر بجانب اللون.")}
                />
                {!reasonOk && (
                  <p className="mt-1.5 text-[11.5px] text-muted-foreground">
                    {t("A colour set by hand needs a reason.", "اللون المحدد يدويًا يحتاج إلى سبب.")}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {editing && (
        <div className="panel mt-6 rounded-xl px-4 py-5">
          <h2 className="text-[13.5px] font-semibold">{t("History", "السجل")}</h2>
          {log.length === 0 ? (
            <p className="mt-1.5 text-[12.5px] text-muted-foreground">{t("No changes in this session.", "لا توجد تغييرات في هذه الجلسة.")}</p>
          ) : (
            <ul className="mt-2 divide-y divide-border/60">
              {log.map((e) => (
                <li key={e.id} className="flex flex-wrap items-baseline gap-x-2 py-2 text-[12.5px]">
                  <span className="font-medium text-primary">{e.action}</span>
                  <span className="min-w-0 flex-1 text-muted-foreground">{e.detail}</span>
                  <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground/70">{e.at}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 border-t border-border/60 pt-4">
            {!removing ? (
              <Button variant="outline" className="gap-1.5 text-error hover:text-error" onClick={() => setRemoving(true)}>
                <Trash2 className="size-4" />{t("Remove milestone", "إزالة المعلم")}
              </Button>
            ) : (
              <div className="rounded-xl border border-error/35 bg-error-fill p-3">
                <p className="text-[13px] font-semibold">{t(`Remove ${milestone!.code}?`, `إزالة ${milestone!.code}؟`)}</p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  {t(`Its ${taskCount} task${taskCount === 1 ? "" : "s"} stay in the project, no longer grouped. The milestone is kept in the history.`,
                     `تبقى مهامه (${taskCount}) في المشروع دون تجميع، ويُحتفظ بالمعلم في السجل.`)}
                </p>
                <div className="mt-3 flex flex-wrap justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setRemoving(false)}>{t("Cancel", "إلغاء")}</Button>
                  <Button size="sm" className="bg-error text-white hover:brightness-110" onClick={remove}>
                    {t("Yes, remove it", "نعم، أزله")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
