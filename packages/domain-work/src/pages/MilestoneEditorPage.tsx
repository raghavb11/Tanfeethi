import * as React from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { cn } from "@reach/shared-core"
import { usePageTitle } from "@reach/shell-context"
import { Archive, ArrowLeft, CalendarClock, FileText, Hand, History, Info, ListChecks, Pencil, Plus, Sparkles } from "lucide-react"

import { Btn, CardHeader, ConfirmDialog, Empty, FilterSelect, Page, Panel, StatusDot, TextCounter, useT, type TFn } from "../components/ui"
import { DateField, Row } from "../components/WorkItemDetail"
import { HealthPill } from "../components/HealthPill"
import {
  addMilestone, archiveMilestone, getMilestone, HEALTH, type Milestone, type MilestoneLog, milestoneHealth,
  newMilestoneId, nextMilestoneCode, type Rag, updateMilestone, useMilestoneLog, useMilestones,
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
  mode: Mode
  reason: string
}

/** Add or edit one milestone — the task create/edit layout (Figma 3580:8965 /
 *  3580:8667): header card with the big name field, a main column of cards and a
 *  side Details card. One screen for new and edit, as the owner asked. The colour
 *  is worked out from the milestone's tasks unless a manager sets it here, and a
 *  colour set by hand always carries its reason. */
export default function MilestoneEditorPage() {
  const { isAr, t } = useT()
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
    const fields = {
      name: isAr ? alt : main, nameAr: isAr ? main : alt,
      startISO: draft.startISO, dueISO: draft.dueISO,
      ragOverride: draft.mode === "auto" ? undefined : draft.mode,
      ragReason: draft.mode === "auto" ? undefined : draft.reason.trim(),
    }
    if (milestone) {
      // the description is edited in the current language; an empty other side is filled too
      const descKey = isAr ? "descriptionAr" : "description"
      const otherKey = isAr ? "description" : "descriptionAr"
      updateMilestone(milestone.id, {
        ...fields, [descKey]: description,
        ...(milestone[otherKey] ? {} : { [otherKey]: description }),
      })
      navigate(backHref)
      return
    }
    const newId = newMilestoneId()
    addMilestone({ id: newId, projectId, code, ...fields, description, descriptionAr: description, createdISO: TASK_TODAY_ISO })
    navigate(returnTo ? `${returnTo}${returnTo.includes("?") ? "&" : "?"}milestone=${newId}` : backHref)
  }

  const archive = () => {
    if (!milestone) return
    clearMilestone(milestone.id)
    archiveMilestone(milestone.id)
    navigate(backHref)
  }

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
            {tried && missing.length > 0 && (
              <span role="alert" className="text-[12.5px] text-error">
                {t(`Fill in: ${missing.join(", ")}`, `أكمل: ${missing.join("، ")}`)}
              </span>
            )}
            {!create && (
              <Btn variant="danger" className="rounded-[8px] bg-foreground/[0.08] font-normal" onClick={() => setConfirmArchive(true)}>
                <Archive className="size-4" /><span>{t("Archive", "أرشفة")}</span>
              </Btn>
            )}
            <Btn variant="outline" className="bg-secondary" onClick={() => navigate(backHref)}>{t("Cancel", "إلغاء")}</Btn>
            <Btn variant="primary" onClick={save}>{create ? t("Create milestone", "إنشاء المعلم") : t("Save changes", "حفظ التعديلات")}</Btn>
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 flex-col gap-3 lg:flex-1">
            <div className="flex flex-col gap-1">
              <input
                autoFocus={create} value={draft.name} onChange={(e) => patch({ name: e.target.value })}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); save() } }}
                placeholder={t("Milestone name", "اسم المعلم")} aria-label={t("Milestone name", "اسم المعلم")}
                aria-invalid={!!err("name")}
                className={cn("h-[38px] w-full max-w-[640px] border-b border-dashed bg-transparent text-[27px] font-normal leading-[38px] tracking-[-0.27px] outline-none placeholder:text-muted-foreground/60",
                  err("name") ? "border-error" : "border-input focus:border-primary/70")}
              />
              {err("name") ? <p className="text-[12px] text-error">{err("name")}</p> : <TextCounter text={draft.name} isAr={isAr} />}
            </div>
            <div className="flex flex-wrap items-center gap-2.5 text-[14px]">
              <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] tabular-nums text-muted-foreground">{code}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{isAr ? project.nameAr : project.name}</span>
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
              actions={descDirty ? <span className="text-[12px] text-warning">{t("Unsaved changes", "تغييرات غير محفوظة")}</span> : undefined} />
            <div className="mt-[18px] flex flex-col gap-4">
              <textarea
                value={draft.description} onChange={(e) => patch({ description: e.target.value })}
                rows={5} aria-label={t("Description", "الوصف")}
                placeholder={t("What is true when this milestone is done…", "ما الذي يتحقق عند اكتمال هذا المعلم…")}
                className="min-h-[135px] w-full resize-none rounded-[8px] border border-primary/70 bg-background p-4 text-[13.5px] leading-[20.25px] outline-none placeholder:text-muted-foreground"
              />
              <TextCounter text={draft.description} isAr={isAr} />
            </div>
          </Panel>

          <MilestoneTasks milestone={milestone} projectId={projectId} tasks={msTasks} isAr={isAr} t={t} />
          {!create && <ChangeLog log={log} create={create} isAr={isAr} t={t} />}
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Panel>
            <CardHeader icon={Info} title={t("Details", "التفاصيل")} />
            <dl className="mt-[18px] overflow-hidden rounded-lg bg-background/60">
              <Row label={t("Project", "المشروع")} edit={false}
                view={<button onClick={() => navigate(`/projects/${project.id}`)} className="text-start hover:text-primary hover:underline">{isAr ? project.nameAr : project.name}</button>} />
              <Row label={t("Code", "الرمز")} edit={false} view={<span className="tabular-nums">{code}</span>} />
              <Row label={t("Start date", "تاريخ البدء")} edit error={err("start")} view={null}
                control={<DateField value={draft.startISO} onChange={(v) => patch({ startISO: v })} label={t("Start date", "تاريخ البدء")} invalid={!!err("start")} />} />
              <Row label={t("Due date", "تاريخ الاستحقاق")} edit error={err("due")} view={null}
                control={<DateField value={draft.dueISO} onChange={(v) => patch({ dueISO: v })} label={t("Due date", "تاريخ الاستحقاق")} invalid={!!err("due")} />} />
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
                <Row label={t("Reason", "السبب")} edit error={err("reason")} view={null}
                  control={
                    <textarea
                      value={draft.reason} onChange={(e) => patch({ reason: e.target.value })} rows={3}
                      aria-label={t("Reason for setting the colour by hand", "سبب تحديد اللون يدويًا")} aria-invalid={!!err("reason")}
                      placeholder={t("What the numbers do not show — this appears next to the colour.", "ما لا تظهره الأرقام — سيظهر بجانب اللون.")}
                      className={cn("w-full max-w-[265px] resize-none rounded-lg bg-[var(--card-elevated)] px-3 py-2 text-start text-[12.5px] leading-[18px] outline-none ring-1 ring-inset placeholder:text-muted-foreground focus:ring-primary",
                        err("reason") ? "ring-error" : "ring-[var(--card-ring)]")}
                    />
                  } />
              )}
              <Row label={t("Created", "تاريخ الإنشاء")} edit={false}
                view={shortDate((create ? TASK_TODAY_ISO : milestone?.createdISO) ?? "", isAr) || "—"} />
              {!create && <Row label={t("Tasks", "المهام")} edit={false} view={<span className="tabular-nums">{msTasks.length}</span>} />}
              <Row edit view={null} label={t("Name in Arabic", "الاسم بالإنجليزية")}
                control={
                  <input
                    value={draft.nameAlt} onChange={(e) => patch({ nameAlt: e.target.value })} dir={isAr ? "ltr" : "rtl"}
                    placeholder={t("Optional", "اختياري")} aria-label={t("Name in Arabic", "الاسم بالإنجليزية")}
                    className="h-9 w-full max-w-[265px] rounded-lg bg-[var(--card-elevated)] px-3 text-[12.5px] font-medium outline-none ring-1 ring-inset ring-[var(--card-ring)] placeholder:font-normal placeholder:text-muted-foreground focus:ring-primary"
                  />
                } />
            </dl>
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

/** "المهام في هذا المعلم" — its tasks with a status dot and a due label. */
function MilestoneTasks({ milestone, projectId, tasks, isAr, t }: { milestone?: Milestone; projectId: string; tasks: Task[]; isAr: boolean; t: TFn }) {
  const navigate = useNavigate()
  const order = (x: Task) => STATUS_ORDER.indexOf(x.status)
  const rows = [...tasks].sort((a, b) => (a.status === "completed" ? 1 : 0) - (b.status === "completed" ? 1 : 0) || order(a) - order(b) || a.dueISO.localeCompare(b.dueISO))
  return (
    <Panel>
      <CardHeader icon={ListChecks} title={t("Tasks in this milestone", "المهام في هذا المعلم")}
        actions={milestone ? (
          <button onClick={() => navigate(`/tasks/new?project=${projectId}&milestone=${milestone.id}&from=project`)}
            className="btn-primary-grad inline-flex h-7 items-center gap-1.5 rounded-lg px-3 text-[12.5px] font-medium">
            <Plus className="size-3.5" />{t("New task", "مهمة جديدة")}
          </button>
        ) : undefined} />
      {rows.length > 0 && (
        <ul className="mt-[18px] max-h-[300px] overflow-y-auto [scrollbar-width:thin]">
          {rows.map((x) => {
            const done = x.status === "completed"
            const due = relativeDue(x.dueISO, isAr)
            return (
              <li key={x.id} className="flex min-h-[50px] items-center gap-3 border-b border-input py-2 last:border-b-0">
                <StatusDot status={x.status} />
                <button onClick={() => navigate(`/tasks/${x.id}`)}
                  className={cn("min-w-0 flex-1 truncate text-start text-[14px] hover:text-primary", done && "text-muted-foreground line-through")}>
                  {isAr ? x.titleAr : x.title}
                </button>
                <span className={cn("shrink-0 text-[12.5px] font-medium",
                  done ? "text-muted-foreground" : due.tone === "error" ? "text-error" : due.tone === "warning" ? "text-warning" : "text-muted-foreground")}>
                  {done ? t("Done", "منجزة") : due.text}
                </span>
              </li>
            )
          })}
        </ul>
      )}
      {rows.length === 0 && (
        <Empty icon={ListChecks} text={milestone
          ? t("No tasks under this milestone yet.", "لا توجد مهام تحت هذا المعلم بعد.")
          : t("Tasks can be added once the milestone is created.", "يمكن إضافة المهام بعد إنشاء المعلم.")} />
      )}
    </Panel>
  )
}

const LOG_ACTION_AR: Record<string, string> = {
  created: "أُنشئ", updated: "عُدّل", removed: "أُرشف", "RAG back to automatic": "عاد اللون إلى الحساب التلقائي",
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
            const Icon = e.action.startsWith("set ") || e.action.startsWith("RAG") ? Hand : e.action === "created" ? Plus : e.action === "removed" ? Archive : Pencil
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
