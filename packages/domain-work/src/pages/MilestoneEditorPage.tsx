import * as React from "react"
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { cn } from "@reach/shared-core"
import { usePageTitle } from "@reach/shell-context"
import {
  Archive, ArrowLeft, CalendarClock, ChevronLeft, ChevronRight, FileText, Hand, History, Info, Link2, ListChecks, Pencil, Plus,
  Sparkles, Unlink, X,
} from "lucide-react"
import { RequiredMark, SearchableSelect } from "@reach/shared-ui"

import { Btn, CardHeader, ConfirmDialog, Empty, FilterSelect, Page, Panel, StatusDot, TextCounter, useT, type TFn } from "../components/ui"
import { DateField, Row } from "../components/WorkItemDetail"
import { HealthPill } from "../components/HealthPill"
import {
  addMilestone, archiveMilestone, getMilestone, HEALTH, type Milestone, type MilestoneLog, milestoneHealth,
  linkTask, milestonesFor, newMilestoneId, nextMilestoneCode, type Rag, unlinkTask, updateMilestone, useMilestoneLog, useMilestones,
} from "../data/milestones"
import { getProjectById, useProjects } from "../data/projects"
import { clearMilestone, relativeDue, shortDate, type Task, TASK_TODAY_ISO, useTasks } from "../data/tasks"
import { STATUS_ORDER } from "../data/meta"

type Mode = "auto" | Rag
type Draft = {
  name: string        // in the current language
  nameAlt: string     // in the other language (optional)
  startISO: string
  dueISO: string
  description: string
  descriptionAlt: string  // in the other language (optional)
  mode: Mode
  reason: string
}

/** One milestone, laid out as the task page: view mode as Figma 3580:8521 (header
 *  card with Edit / Archive and the "Milestone n of m" pager, read-only cards, a
 *  Details card) and the create / edit screen as 3580:8965 / 3580:8667 (the big
 *  name field, editable cards, Save / Cancel). The colour is worked out from the
 *  milestone's tasks unless a manager sets it, and a colour set by hand always
 *  carries its reason. Each route remounts, so an edit starts from what is saved. */
export default function MilestoneEditorPage() {
  const { pathname } = useLocation()
  return <MilestoneScreen key={pathname} />
}

function MilestoneScreen() {
  const { isAr, t } = useT()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { id: projectId = "", mid } = useParams()
  const [params] = useSearchParams()
  useProjects()
  useMilestones()
  const tasks = useTasks()
  const allLog = useMilestoneLog()

  const project = getProjectById(projectId)
  const milestone = mid ? getMilestone(mid) : undefined
  const create = !mid
  // view mode at …/milestones/:mid, the form at …/:mid/edit and …/new
  const editing = create || pathname.endsWith("/edit")
  const viewHref = mid ? `/projects/${projectId}/milestones/${mid}` : ""
  // Opened from a task being created: return there (draft restored) with the new milestone.
  const backParam = params.get("back")
  const returnTo = backParam && backParam.startsWith("/") && !backParam.startsWith("//") ? backParam : undefined
  const backHref = returnTo ?? `/projects/${projectId}`
  const backLabel = backHref.startsWith("/tasks/new") ? t("Back to the task", "العودة إلى المهمة")
    : backHref.startsWith("/projects/") ? t("Back to the project", "العودة إلى المشروع")
      : t("Back", "رجوع")

  const [code] = React.useState(() => milestone?.code ?? nextMilestoneCode(projectId))
  const [draft, setDraft] = React.useState<Draft>(() => ({
    name: (milestone ? (isAr ? milestone.nameAr : milestone.name) : "") ?? "",
    nameAlt: (milestone ? (isAr ? milestone.name : milestone.nameAr) : "") ?? "",
    startISO: milestone?.startISO ?? project?.startISO ?? "",
    dueISO: milestone?.dueISO ?? "",
    description: (milestone ? (isAr ? milestone.descriptionAr ?? milestone.description : milestone.description ?? milestone.descriptionAr) : "") ?? "",
    descriptionAlt: (milestone ? (isAr ? milestone.description : milestone.descriptionAr) : "") ?? "",
    mode: milestone?.ragOverride ?? "auto",
    reason: milestone?.ragReason ?? "",
  }))
  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }))
  const [tried, setTried] = React.useState(false)
  const [confirmArchive, setConfirmArchive] = React.useState(false)

  // Figma top bar: "المعلم: <name>"; the create screen: "معلم جديد".
  usePageTitle(
    create ? "New milestone" : milestone ? `Milestone: ${milestone.name}` : undefined,
    create ? "معلم جديد" : milestone ? `المعلم: ${milestone.nameAr}` : undefined,
  )

  if (!project || (!create && !milestone)) {
    return (
      <Page>
        <Empty
          icon={CalendarClock}
          text={!project ? t("That project no longer exists.", "لم يعد هذا المشروع موجودًا.") : t("That milestone no longer exists.", "لم يعد هذا المعلم موجودًا.")}
          action={<Btn onClick={() => navigate(project ? backHref : "/projects")}>{project ? backLabel : t("Back to projects", "العودة إلى المشاريع")}</Btn>}
        />
      </Page>
    )
  }

  const msTasks = milestone ? tasks.filter((x) => x.milestoneId === milestone.id) : []
  const log = milestone ? allLog.filter((e) => e.milestoneId === milestone.id) : []
  // what the calculation says for these dates right now, so the manager overrides knowingly
  const probe: Milestone = {
    ...(milestone ?? { id: "__new__", projectId, code, name: "", nameAr: "" }),
    startISO: draft.startISO || milestone?.startISO || TASK_TODAY_ISO,
    dueISO: draft.dueISO || milestone?.dueISO || TASK_TODAY_ISO,
    ragOverride: undefined,
  }
  const report = milestoneHealth(probe, tasks)

  // ── validation (inline, shown after the first save attempt) ──────────────
  const errors = {
    name: !draft.name.trim() ? t("Give the milestone a name.", "أدخل اسمًا للمعلم.") : undefined,
    start: !draft.startISO ? t("Pick a start date.", "اختر تاريخ البدء.") : undefined,
    due: !draft.dueISO ? t("Pick a due date.", "اختر تاريخ الاستحقاق.")
      : draft.startISO && draft.startISO > draft.dueISO ? t("The due date has to be on or after the start.", "يجب أن يكون الاستحقاق في يوم البدء أو بعده.")
        : undefined,
    reason: draft.mode !== "auto" && draft.reason.trim().length < 5
      ? t("A colour set by hand needs a reason (at least 5 characters).", "اللون المحدد يدويًا يحتاج إلى سبب (5 أحرف على الأقل).")
      : undefined,
  }
  const err = (k: keyof typeof errors) => (tried ? errors[k] : undefined)
  const invalid = Object.values(errors).some(Boolean)
  // Fields still missing, named next to the save button so a blocked save is never silent.
  const missing = [
    errors.name && t("name", "الاسم"),
    errors.start && t("start date", "تاريخ البدء"),
    errors.due && (draft.dueISO ? t("start/due dates", "تاريخا البدء والاستحقاق") : t("due date", "تاريخ الاستحقاق")),
    errors.reason && t("reason", "السبب"),
  ].filter(Boolean) as string[]
  /** Bring the first invalid field into view and focus it (Details can be below the fold). */
  const revealFirstInvalid = () => requestAnimationFrame(() => {
    const el = document.querySelector<HTMLElement>('main [aria-invalid="true"]')
    el?.scrollIntoView({ block: "center", behavior: "smooth" })
    el?.focus({ preventScroll: true })
  })

  // ── writes ────────────────────────────────────────────────────────────
  const save = () => {
    if (invalid) { setTried(true); revealFirstInvalid(); return }
    const main = draft.name.trim()
    const alt = draft.nameAlt.trim() || main
    const description = draft.description.trim() || undefined
    // an empty other-language description takes the main one
    const descriptionAlt = draft.descriptionAlt.trim() || description
    const fields = {
      name: isAr ? alt : main, nameAr: isAr ? main : alt,
      description: isAr ? descriptionAlt : description, descriptionAr: isAr ? description : descriptionAlt,
      startISO: draft.startISO, dueISO: draft.dueISO,
      ragOverride: draft.mode === "auto" ? undefined : draft.mode,
      ragReason: draft.mode === "auto" ? undefined : draft.reason.trim(),
    }
    if (milestone) {
      updateMilestone(milestone.id, fields)
      navigate(returnTo ?? viewHref)
      return
    }
    const newId = newMilestoneId()
    addMilestone({ id: newId, projectId, code, ...fields, createdISO: TASK_TODAY_ISO })
    navigate(returnTo ? `${returnTo}${returnTo.includes("?") ? "&" : "?"}milestone=${newId}` : backHref)
  }

  const archive = () => {
    if (!milestone) return
    clearMilestone(milestone.id)
    archiveMilestone(milestone.id)
    navigate(backHref)
  }

  const cancel = () => navigate(milestone && !returnTo ? viewHref : backHref)
  // the pager walks the project's milestones, as the task page walks its list
  const siblings = milestonesFor(projectId)
  const at = milestone ? siblings.findIndex((m) => m.id === milestone.id) : -1
  const go = (step: number) => {
    const next = siblings[(at + step + siblings.length) % siblings.length]
    if (next) navigate(`/projects/${projectId}/milestones/${next.id}`)
  }
  const saved = milestone ? milestoneHealth(milestone, tasks) : undefined
  const doneCount = msTasks.filter((x) => x.status === "completed").length
  const viewDescription = milestone ? (isAr ? milestone.descriptionAr || milestone.description : milestone.description || milestone.descriptionAr) : ""

  const descDirty = !create && draft.description !== ((isAr ? milestone?.descriptionAr ?? milestone?.description : milestone?.description ?? milestone?.descriptionAr) ?? "")
  const healthOptions = [
    { value: "auto", label: t("Automatic", "تلقائي"), lead: <Sparkles className="size-3.5 shrink-0 text-icon" /> },
    ...(["green", "amber", "red"] as const).map((h) => ({ value: h, label: isAr ? HEALTH[h].ar : HEALTH[h].en, lead: <span className={cn("size-2 shrink-0 rounded-full", HEALTH[h].dot)} /> })),
  ]

  return (
    <Page>
      {/* ── header card ──────────────────────────────────────────────── */}
      <section className="highlight-card hl-green flex flex-col gap-8 rounded-2xl px-5 py-6 lg:ps-6 lg:pe-14">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button onClick={() => navigate(backHref)}
            className="inline-flex h-[34px] items-center gap-2 rounded-lg px-3.5 text-[13.5px] font-medium transition-colors hover:bg-foreground/5">
            <ArrowLeft className={cn("size-[14px]", isAr && "rotate-180")} />{backLabel}
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {!editing ? (
              <>
                <Btn className="rounded-[8px] bg-foreground/[0.08] px-3 font-normal" onClick={() => navigate(`${viewHref}/edit`)}>
                  <Pencil className="size-[14px]" /><span>{t("Edit", "تعديل")}</span>
                </Btn>
                <Btn variant="danger" className="rounded-[8px] bg-foreground/[0.08] font-normal" onClick={() => setConfirmArchive(true)}>
                  <Archive className="size-4" /><span>{t("Archive", "أرشفة")}</span>
                </Btn>
              </>
            ) : (
              <>
                {tried && missing.length > 0 && (
                  <span role="alert" className="text-[12.5px] text-error">
                    {t(`Fill in: ${missing.join(", ")}`, `أكمل: ${missing.join("، ")}`)}
                  </span>
                )}
                <Btn variant="outline" className="bg-secondary" onClick={cancel}>{t("Cancel", "إلغاء")}</Btn>
                <Btn variant="primary" onClick={save}>{create ? t("Create milestone", "إنشاء المعلم") : t("Save changes", "حفظ التعديلات")}</Btn>
              </>
            )}
            {!create && siblings.length > 1 && at >= 0 && (
              <div className="ms-1 flex items-center gap-2 border-s border-input ps-3">
                <span className="text-[13px] tabular-nums text-muted-foreground">
                  {t(`Milestone ${at + 1} of ${siblings.length}`, `المعلم ${at + 1} من ${siblings.length}`)}
                </span>
                <button onClick={() => go(-1)} aria-label={t("Previous", "السابق")}
                  className="inline-flex size-[34px] items-center justify-center rounded-[8px] bg-foreground/[0.06] ring-1 ring-inset ring-[var(--card-ring)] hover:bg-foreground/10">
                  <ChevronLeft className={cn("size-4", isAr && "rotate-180")} />
                </button>
                <button onClick={() => go(1)} aria-label={t("Next", "التالي")}
                  className="inline-flex size-[34px] items-center justify-center rounded-[8px] bg-foreground/[0.06] ring-1 ring-inset ring-[var(--card-ring)] hover:bg-foreground/10">
                  <ChevronRight className={cn("size-4", isAr && "rotate-180")} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className={cn("flex min-w-0 flex-col gap-3", editing && "lg:flex-1")}>
            {!editing && milestone ? (
              <h1 className="text-[27px] font-normal leading-[38px] tracking-[-0.27px]">{isAr ? milestone.nameAr : milestone.name}</h1>
            ) : (
            <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-[12px] text-muted-foreground">{t("Name", "الاسم")}<RequiredMark /></span>
                <input
                  autoFocus={create} value={draft.name} onChange={(e) => patch({ name: e.target.value })}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); save() } }}
                  placeholder={t("Milestone name", "اسم المعلم")} aria-label={t("Milestone name", "اسم المعلم")}
                  aria-invalid={!!err("name")}
                  className={cn("h-[38px] w-full border-b border-dashed bg-transparent text-[27px] font-normal leading-[38px] tracking-[-0.27px] outline-none placeholder:text-muted-foreground/60",
                    err("name") ? "border-error" : "border-input focus:border-primary/70")}
                />
                {err("name") ? <p className="text-[12px] text-error">{err("name")}</p> : <TextCounter text={draft.name} isAr={isAr} />}
              </div>
              {/* the same name in the other language, beside it */}
              <label className="flex min-w-0 flex-col gap-1">
                <span className="text-[12px] text-muted-foreground">{t("Name in Arabic", "الاسم بالإنجليزية")} · {t("optional", "اختياري")}</span>
                <input
                  value={draft.nameAlt} onChange={(e) => patch({ nameAlt: e.target.value })} dir={isAr ? "ltr" : "rtl"}
                  placeholder={t("اسم المعلم", "Milestone name")}
                  className="h-[38px] w-full border-b border-dashed border-input bg-transparent text-[27px] font-normal leading-[38px] tracking-[-0.27px] outline-none placeholder:text-muted-foreground/60 focus:border-primary/70"
                />
              </label>
            </div>
            )}
            <div className="flex flex-wrap items-center gap-2.5 text-[14px]">
              <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] tabular-nums text-muted-foreground">{code}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{isAr ? project.nameAr : project.name}</span>
              {!editing && saved && <><span className="text-muted-foreground">·</span><HealthPill health={saved.health} isAr={isAr} overridden={saved.overridden} size="sm" /></>}
            </div>
          </div>
        </div>
      </section>

      {/* ── body: main column + side column (729 / 480, gap 20) ─────────── */}
      <div className="mt-10 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)]">
        <div className="flex min-w-0 flex-col gap-6">
          {/* description */}
          <Panel>
            <CardHeader icon={FileText} title={t("Description", "الوصف")}
              actions={editing && descDirty ? <span className="text-[12px] text-warning">{t("Unsaved changes", "تغييرات غير محفوظة")}</span> : undefined} />
            {!editing ? (
              <p className="mt-[18px] text-[13.5px] leading-[20.25px] text-foreground">
                {viewDescription || <span className="text-muted-foreground">{t("No description yet.", "لا يوجد وصف بعد.")}</span>}
              </p>
            ) : (
            <div className="mt-[18px] flex flex-col gap-4">
              <textarea
                value={draft.description} onChange={(e) => patch({ description: e.target.value })}
                rows={5} aria-label={t("Description", "الوصف")}
                placeholder={t("What is true when this milestone is done…", "ما الذي يتحقق عند اكتمال هذا المعلم…")}
                className="min-h-[135px] w-full resize-none rounded-[8px] border border-primary/70 bg-background p-4 text-[13.5px] leading-[20.25px] outline-none placeholder:text-muted-foreground"
              />
              <TextCounter text={draft.description} isAr={isAr} />
              {/* the same description in the other language, directly beneath it */}
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] text-muted-foreground">{t("Description in Arabic", "الوصف بالإنجليزية")} · {t("optional", "اختياري")}</span>
                <textarea
                  value={draft.descriptionAlt} onChange={(e) => patch({ descriptionAlt: e.target.value })}
                  rows={4} dir={isAr ? "ltr" : "rtl"}
                  className="min-h-[108px] w-full resize-none rounded-[8px] border border-input bg-background p-4 text-[13.5px] leading-[20.25px] outline-none focus:border-primary/70"
                />
              </label>
            </div>
            )}
          </Panel>

          <MilestoneTasks milestone={milestone} projectId={projectId} tasks={msTasks}
            candidates={milestone ? tasks.filter((x) => x.projectId === projectId && x.milestoneId !== milestone.id) : []}
            isAr={isAr} t={t} />
          {!create && <ChangeLog log={log} create={create} isAr={isAr} t={t} />}
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Panel>
            <CardHeader icon={Info} title={t("Details", "التفاصيل")} />
            {!editing && milestone && saved ? (
            <dl className="mt-[18px] overflow-hidden rounded-lg bg-background/60">
              <Row label={t("Project", "المشروع")} edit={false}
                view={<button onClick={() => navigate(`/projects/${project.id}`)} className="text-start hover:text-primary hover:underline">{isAr ? project.nameAr : project.name}</button>} />
              <Row label={t("Code", "الرمز")} edit={false} view={<span className="tabular-nums">{code}</span>} />
              <Row label={t("Start date", "تاريخ البدء")} edit={false} view={shortDate(milestone.startISO, isAr)} />
              <Row label={t("Due date", "تاريخ الاستحقاق")} edit={false} view={shortDate(milestone.dueISO, isAr)} />
              <Row label={t("Health", "لون الحالة")} edit={false}
                view={
                  <span className="flex flex-col items-end gap-1">
                    <HealthPill health={saved.health} isAr={isAr} overridden={saved.overridden} size="sm" />
                    <span className="text-end text-[11.5px] leading-[16px] text-muted-foreground">
                      {saved.overridden ? milestone.ragReason : isAr ? saved.reasonAr : saved.reason}
                    </span>
                  </span>
                } />
              <Row label={t("Tasks", "المهام")} edit={false}
                view={<span className="tabular-nums">{t(`${doneCount} of ${msTasks.length} done`, `${doneCount} من ${msTasks.length} منجزة`)}</span>} />
              <Row label={t("Created", "تاريخ الإنشاء")} edit={false} view={shortDate(milestone.createdISO ?? "", isAr) || "—"} />
            </dl>
            ) : (
            <dl className="mt-[18px] overflow-hidden rounded-lg bg-background/60">
              <Row label={t("Project", "المشروع")} edit={false}
                view={<button onClick={() => navigate(`/projects/${project.id}`)} className="text-start hover:text-primary hover:underline">{isAr ? project.nameAr : project.name}</button>} />
              <Row label={t("Code", "الرمز")} edit={false} view={<span className="tabular-nums">{code}</span>} />
              <Row label={t("Start date", "تاريخ البدء")} edit required error={err("start")} view={null}
                control={<DateField value={draft.startISO} onChange={(v) => patch({ startISO: v })} label={t("Start date", "تاريخ البدء")} required invalid={!!err("start")} />} />
              <Row label={t("Due date", "تاريخ الاستحقاق")} edit required error={err("due")} view={null}
                control={<DateField value={draft.dueISO} onChange={(v) => patch({ dueISO: v })} label={t("Due date", "تاريخ الاستحقاق")} required invalid={!!err("due")} />} />
              <Row label={t("Health", "لون الحالة")} edit view={null}
                control={
                  <span className="flex w-full max-w-[265px] flex-col items-end gap-1.5">
                    <FilterSelect className="w-full" ariaLabel={t("Health", "لون الحالة")}
                      lead={draft.mode === "auto" ? <Sparkles className="size-3.5 shrink-0 text-icon" /> : <span className={cn("size-[7px] shrink-0 rounded-full", HEALTH[draft.mode].dot)} />}
                      value={draft.mode} onChange={(v) => patch({ mode: v as Mode })} options={healthOptions} />
                    <span className="inline-flex flex-wrap items-center justify-end gap-1.5 text-[11.5px] text-muted-foreground">
                      {t("Calculated:", "المحسوب:")}
                      <HealthPill health={report.calculated} isAr={isAr} size="sm" />
                    </span>
                    <span className="text-[11.5px] leading-[16px] text-muted-foreground">{isAr ? report.reasonAr : report.reason}</span>
                  </span>
                } />
              {draft.mode !== "auto" && (
                <Row label={t("Reason", "السبب")} edit required error={err("reason")} view={null}
                  control={
                    <textarea
                      value={draft.reason} onChange={(e) => patch({ reason: e.target.value })} rows={3}
                      aria-label={t("Reason for setting the colour by hand", "سبب تحديد اللون يدويًا")} aria-invalid={!!err("reason")} aria-required
                      placeholder={t("What the numbers do not show — this appears next to the colour.", "ما لا تظهره الأرقام — سيظهر بجانب اللون.")}
                      className={cn("w-full max-w-[265px] resize-none rounded-lg bg-[var(--card-elevated)] px-3 py-2 text-start text-[12.5px] leading-[18px] outline-none ring-1 ring-inset placeholder:text-muted-foreground focus:ring-primary",
                        err("reason") ? "ring-error" : "ring-[var(--card-ring)]")}
                    />
                  } />
              )}
              <Row label={t("Created", "تاريخ الإنشاء")} edit={false}
                view={shortDate((create ? TASK_TODAY_ISO : milestone?.createdISO) ?? "", isAr) || "—"} />
              {!create && <Row label={t("Tasks", "المهام")} edit={false} view={<span className="tabular-nums">{msTasks.length}</span>} />}
            </dl>
            )}
          </Panel>
        </div>
      </div>

      {milestone && (
        <ConfirmDialog
          open={confirmArchive}
          title={t(`Archive ${milestone.code}?`, `أرشفة ${milestone.code}؟`)}
          body={t(`Its ${msTasks.length} task${msTasks.length === 1 ? "" : "s"} stay in the project, no longer grouped. The milestone is kept in the history.`,
            `تبقى مهامه (${msTasks.length}) في المشروع دون تجميع، ويُحتفظ بالمعلم في السجل.`)}
          confirm={t("Archive", "أرشفة")} cancel={t("Cancel", "إلغاء")}
          onConfirm={() => { setConfirmArchive(false); archive() }}
          onCancel={() => setConfirmArchive(false)}
        />
      )}
    </Page>
  )
}

/** "المهام في هذا المعلم" — its tasks with a status dot and a due label. Tasks
 *  join it two ways: link one the project already has (searchable list; a task
 *  under another milestone moves here), or create a new one with the milestone
 *  filled in. A linked task can be unlinked; it stays in the project. */
function MilestoneTasks({ milestone, projectId, tasks, candidates, isAr, t }: {
  milestone?: Milestone; projectId: string; tasks: Task[]; candidates: Task[]; isAr: boolean; t: TFn
}) {
  const navigate = useNavigate()
  const linkOptions = [...candidates]
    .sort((a, b) => (a.milestoneId ? 1 : 0) - (b.milestoneId ? 1 : 0) || a.dueISO.localeCompare(b.dueISO))
    .map((x) => {
      const elsewhere = x.milestoneId ? getMilestone(x.milestoneId) : undefined
      return {
        value: x.id,
        label: isAr ? x.titleAr : x.title,
        alt: isAr ? x.title : x.titleAr,
        lead: <StatusDot status={x.status} />,
        hint: elsewhere ? <span className="text-[11.5px] text-muted-foreground">{t(`in ${elsewhere.code}`, `في ${elsewhere.code}`)}</span>
          : <span className="text-[11.5px] text-muted-foreground">{shortDate(x.dueISO, isAr)}</span>,
      }
    })
  const order = (x: Task) => STATUS_ORDER.indexOf(x.status)
  const rows = [...tasks].sort((a, b) => (a.status === "completed" ? 1 : 0) - (b.status === "completed" ? 1 : 0) || order(a) - order(b) || a.dueISO.localeCompare(b.dueISO))
  return (
    <Panel>
      <CardHeader icon={ListChecks} title={t("Tasks in this milestone", "المهام في هذا المعلم")}
        actions={milestone ? (
          <div className="flex flex-wrap items-center justify-end gap-2">
            {/* pick from the project's tasks; the list stays open to link several */}
            <SearchableSelect
              values={[]} onToggle={(id) => linkTask(milestone.id, id)} options={linkOptions} searchable isAr={isAr} minMenuWidth={320}
              disabled={linkOptions.length === 0}
              searchPlaceholder={t("Search the project's tasks", "ابحث في مهام المشروع")}
              emptyText={t("No matching task", "لا توجد مهمة مطابقة")}
              header={<div className="px-3 pb-1 pt-2 text-[11.5px] font-medium text-muted-foreground">{t("Link a task from this project", "اربط مهمة من هذا المشروع")}</div>}
              renderTrigger={({ triggerProps }) => (
                <button {...triggerProps} disabled={linkOptions.length === 0}
                  title={linkOptions.length === 0 ? t("Every task in the project is already in this milestone", "كل مهام المشروع موجودة في هذا المعلم") : undefined}
                  className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-foreground/[0.08] px-3 text-[12.5px] font-medium hover:bg-foreground/[0.12] disabled:opacity-50">
                  <Link2 className="size-3.5" />{t("Link existing", "ربط مهمة موجودة")}
                </button>
              )}
            />
            <button onClick={() => navigate(`/tasks/new?project=${projectId}&milestone=${milestone.id}&from=project`)}
              className="btn-primary-grad inline-flex h-7 items-center gap-1.5 rounded-lg px-3 text-[12.5px] font-medium">
              <Plus className="size-3.5" />{t("New task", "مهمة جديدة")}
            </button>
          </div>
        ) : undefined} />
      {rows.length > 0 && (
        <ul className="mt-[18px] max-h-[300px] overflow-y-auto [scrollbar-width:thin]">
          {rows.map((x) => {
            const done = x.status === "completed"
            const due = relativeDue(x.dueISO, isAr)
            return (
              <li key={x.id} className="group flex min-h-[50px] items-center gap-3 border-b border-input py-2 last:border-b-0">
                <StatusDot status={x.status} />
                <button onClick={() => navigate(`/tasks/${x.id}`)}
                  className={cn("min-w-0 flex-1 truncate text-start text-[14px] hover:text-primary", done && "text-muted-foreground line-through")}>
                  {isAr ? x.titleAr : x.title}
                </button>
                <span className={cn("shrink-0 text-[12.5px] font-medium",
                  done ? "text-muted-foreground" : due.tone === "error" ? "text-error" : due.tone === "warning" ? "text-warning" : "text-muted-foreground")}>
                  {done ? t("Done", "منجزة") : due.text}
                </span>
                {milestone && (
                  <button onClick={() => unlinkTask(milestone.id, x.id)}
                    aria-label={t(`Unlink ${x.title} from this milestone`, `فك ربط ${x.titleAr} من هذا المعلم`)}
                    title={t("Unlink — the task stays in the project", "فك الربط — تبقى المهمة في المشروع")}
                    className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-icon opacity-0 hover:bg-foreground/5 hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100">
                    <X className="size-3.5" />
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
      {rows.length === 0 && (
        <Empty icon={ListChecks} text={milestone
          ? t("No tasks under this milestone yet — link one the project already has, or create a new one.", "لا توجد مهام تحت هذا المعلم بعد — اربط مهمة موجودة في المشروع أو أنشئ مهمة جديدة.")
          : t("Tasks can be added once the milestone is created.", "يمكن إضافة المهام بعد إنشاء المعلم.")} />
      )}
    </Panel>
  )
}

const LOG_ACTION_AR: Record<string, string> = {
  created: "أُنشئ", updated: "عُدّل", removed: "أُرشف", "RAG back to automatic": "عاد اللون إلى الحساب التلقائي",
  "task linked": "رُبطت مهمة", "task unlinked": "فُكّ ربط مهمة",
}
const logAction = (a: string, isAr: boolean) => {
  const set = a.match(/^set (green|amber|red)$/)
  if (set) {
    const h = HEALTH[set[1] as Rag]
    return isAr ? `حُدّد يدويًا: ${h.ar}` : `Set by hand: ${h.en}`
  }
  if (a === "removed") return isAr ? LOG_ACTION_AR[a] : "Archived"
  return isAr ? LOG_ACTION_AR[a] ?? a : a.charAt(0).toUpperCase() + a.slice(1)
}

/** "سجل التغييرات" — the milestone's trail, styled as the task Activity card. */
function ChangeLog({ log, create, isAr, t }: { log: MilestoneLog[]; create: boolean; isAr: boolean; t: TFn }) {
  return (
    <Panel>
      <CardHeader icon={History} title={t("Change log", "سجل التغييرات")} />
      {log.length > 0 ? (
        <ul className="mt-[18px]">
          {log.map((e) => {
            const Icon = e.action.startsWith("set ") || e.action.startsWith("RAG") ? Hand : e.action === "created" ? Plus : e.action === "removed" ? Archive
              : e.action === "task linked" ? Link2 : e.action === "task unlinked" ? Unlink : Pencil
            return (
              <li key={e.id} className="flex items-center gap-3 border-b border-input py-2.5 last:border-b-0">
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                  <Icon className="size-3.5 text-icon" />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="text-[13.5px] font-medium leading-5">{logAction(e.action, isAr)}</span>
                  {e.detail && <p className="whitespace-pre-wrap text-[12px] leading-[18px] text-muted-foreground">{e.detail}</p>}
                </div>
                <span className="shrink-0 text-[12px] tabular-nums text-muted-foreground">{e.at}</span>
              </li>
            )
          })}
        </ul>
      ) : (
        // a new milestone keeps the trail's room so the card sits as on the edit screen
        <p className={cn("py-6 text-center text-[13px] text-muted-foreground", create && "flex min-h-[160px] items-center justify-center")}>
          {create ? t("No changes yet — the log starts once it is created.", "لا توجد تغييرات بعد — يبدأ السجل بعد الإنشاء.")
            : t("No changes in this session.", "لا توجد تغييرات في هذه الجلسة.")}
        </p>
      )}
    </Panel>
  )
}
