import * as React from "react"
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { cn } from "@reach/shared-core"
import { usePageTitle } from "@reach/shell-context"
import {
  AlertTriangle, Archive, ArchiveRestore, ArrowLeft, CalendarRange, CheckCircle2, Clock, Flag, Info,
  LayoutGrid, ListChecks, Lock, Pencil, Target,
} from "lucide-react"

import {
  Btn, CardHeader, CategoryChip, ConfirmDialog, Donut, Empty, FilterSelect, Initials, Legend, Page, Panel,
  StatusDot, TextCounter, useT, type TFn,
} from "../components/ui"
import { DateField, Row } from "../components/WorkItemDetail"
import { STATUS_META, STATUS_ORDER, type TaskStatus } from "../data/meta"
import { isOverdue, ME, shortDate, TASK_TODAY_ISO, type Task, useTasks } from "../data/tasks"
import { memberById } from "../data/team"
import { useCanManageSprints } from "../data/permissions"
import {
  addSprint, archiveBlocker, archiveSprint, blankSprint, closeSprint, dayCount, daysBetween, newSprintId,
  overlappingSprint, restoreSprint, SPRINT_STATUS, sprintRange, sprintStatus, sprintWithName,
  type Sprint, updateSprint, useAllSprints, useSprints,
} from "../data/sprints"

/** /sprints/new, /sprints/:id, /sprints/:id?edit=1 — one layout for view, edit
 *  and create (the owner's rule), drawn like the task / project screen.
 *  Only managers and admins define sprints; everyone else is sent to the
 *  read-only view with a short note. */
export default function SprintDetailPage() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const canManage = useCanManageSprints()
  if (!canManage && !id) return <Navigate to="/sprints?denied=1" replace />
  if (!canManage && params.get("edit") === "1") return <Navigate to={`/sprints/${id}?denied=1`} replace />
  return <SprintScreen key={id ?? "new"} id={id} canManage={canManage} />
}

type Draft = {
  name: string        // in the current language
  nameAlt: string     // in the other language
  startISO: string
  endISO: string
  goal: string        // in the current language
}

function SprintScreen({ id, canManage }: { id?: string; canManage: boolean }) {
  const { isAr, t } = useT()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const all = useAllSprints()
  const live = useSprints()
  const tasks = useTasks()

  const create = !id
  const sprint = id ? all.find((s) => s.id === id) : undefined
  const editing = create || (params.get("edit") === "1" && !sprint?.archived)
  const denied = params.get("denied") === "1"
  const setEditing = (on: boolean) => {
    const next = new URLSearchParams(params)
    if (on) next.set("edit", "1"); else next.delete("edit")
    next.delete("denied")
    setParams(next, { replace: true })
  }

  const [blank] = React.useState(() => (create ? blankSprint() : undefined))
  const code = create ? blank!.code : sprint?.code ?? ""
  const loadDraft = (): Draft | undefined => {
    if (create && blank) {
      return { name: isAr ? blank.nameAr : blank.name, nameAlt: isAr ? blank.name : blank.nameAr, startISO: blank.startISO, endISO: blank.endISO, goal: "" }
    }
    if (!sprint) return undefined
    return {
      name: isAr ? sprint.nameAr : sprint.name, nameAlt: isAr ? sprint.name : sprint.nameAr,
      startISO: sprint.startISO, endISO: sprint.endISO, goal: (isAr ? sprint.goalAr : sprint.goal) ?? "",
    }
  }
  const [draft, setDraft] = React.useState<Draft | undefined>(loadDraft)
  React.useEffect(() => { if (editing) setDraft(loadDraft()) }, [editing, isAr])  // eslint-disable-line react-hooks/exhaustive-deps
  const patch = (p: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...p } : d))
  const [tried, setTried] = React.useState(false)
  const nameRef = React.useRef<HTMLInputElement>(null)

  const [closing, setClosing] = React.useState(false)
  const [archiving, setArchiving] = React.useState(false)
  const [notice, setNotice] = React.useState<{ tone: "success" | "info" | "error"; text: string } | null>(null)

  usePageTitle(
    create ? "New sprint" : sprint ? `Sprint: ${sprint.name}` : undefined,
    create ? "سبرنت جديد" : sprint ? `السبرنت: ${sprint.nameAr}` : undefined,
  )

  if (!create && !sprint) {
    return (
      <Page>
        <Empty icon={Flag} text={t("That sprint no longer exists.", "لم يعد هذا السبرنت موجودًا.")}
          action={<Btn onClick={() => navigate("/sprints")}>{t("Back to sprints", "العودة إلى السبرنتات")}</Btn>} />
      </Page>
    )
  }

  // ── validation (inline, shown after the first save attempt) ──────────────
  const d = draft
  const nameTaken = d && editing ? sprintWithName(d.name, id) ?? (d.nameAlt.trim() ? sprintWithName(d.nameAlt, id) : undefined) : undefined
  const clash = d && editing && d.startISO && d.endISO && d.endISO >= d.startISO ? overlappingSprint(d.startISO, d.endISO, id) : undefined
  const errors = {
    name: !d || !editing ? undefined
      : !d.name.trim() ? t("Give the sprint a name.", "أدخل اسمًا للسبرنت.")
        : nameTaken ? t(`${nameTaken.code} already uses that name.`, `الاسم مستخدم بالفعل في ${nameTaken.code}.`)
          : undefined,
    start: d && editing && !d.startISO ? t("Pick a start date.", "اختر تاريخ البدء.") : undefined,
    end: !d || !editing ? undefined
      : !d.endISO ? t("Pick an end date.", "اختر تاريخ الانتهاء.")
        : d.startISO && d.endISO < d.startISO ? t("The end date is before the start date.", "تاريخ الانتهاء قبل تاريخ البدء.")
          : clash ? t(`These dates overlap ${clash.name} (${sprintRange(clash, false)}).`, `هذه التواريخ تتداخل مع ${clash.nameAr} (${sprintRange(clash, true)}).`)
            : undefined,
  }
  const err = (k: keyof typeof errors) => (tried ? errors[k] : undefined)
  const invalid = Object.values(errors).some(Boolean)

  // ── writes ────────────────────────────────────────────────────────────
  const save = () => {
    if (!d) return
    if (invalid) { setTried(true); if (errors.name) nameRef.current?.focus(); return }
    const main = d.name.trim()
    const alt = d.nameAlt.trim() || main
    const en = isAr ? alt : main
    const ar = isAr ? main : alt
    const goal = d.goal.trim() || undefined
    if (create) {
      const newId = newSprintId()
      addSprint({ id: newId, code, name: en, nameAr: ar, startISO: d.startISO, endISO: d.endISO, goal, goalAr: goal })
      navigate(`/sprints/${newId}`, { replace: true })
      return
    }
    if (!sprint) return
    updateSprint(sprint.id, { name: en, nameAr: ar, startISO: d.startISO, endISO: d.endISO, [isAr ? "goalAr" : "goal"]: goal })
    setTried(false)
    setEditing(false)
  }
  const cancel = () => {
    setTried(false)
    if (create) navigate("/sprints")
    else setEditing(false)
  }

  // ── the sprint's own numbers ────────────────────────────────────────────
  const own = sprint ? tasks.filter((x) => x.sprint === sprint.id) : []
  const n = (s: TaskStatus) => own.filter((x) => x.status === s).length
  const done = n("completed")
  const unfinished = own.length - done
  const status = sprint ? sprintStatus(sprint) : "planned"
  const view = editing && d ? { name: d.name, startISO: d.startISO, endISO: d.endISO } : sprint
    ? { name: isAr ? sprint.nameAr : sprint.name, startISO: sprint.startISO, endISO: sprint.endISO } : { name: "", startISO: "", endISO: "" }
  const length = view.startISO && view.endISO && view.endISO >= view.startISO ? daysBetween(view.startISO, view.endISO) + 1 : 0
  const left = sprint && status === "active" ? daysBetween(TASK_TODAY_ISO, sprint.endISO) : 0
  const canClose = canManage && !!sprint && !sprint.archived && !sprint.closedISO && sprint.startISO <= TASK_TODAY_ISO
  const goalText = sprint ? (isAr ? sprint.goalAr || sprint.goal : sprint.goal || sprint.goalAr) : ""
  const goalOtherLang = !!sprint && !!goalText && !(isAr ? sprint.goalAr : sprint.goal)
  const nextPlanned = live.filter((s) => s.id !== id && sprintStatus(s) === "planned")

  const restore = () => {
    if (!sprint) return
    const r = restoreSprint(sprint.id)
    setNotice(r.ok
      ? { tone: "success", text: t("Sprint restored.", "تمت استعادة السبرنت.") }
      : { tone: "error", text: t(`It can't come back yet: its dates overlap ${r.clash.name}.`, `لا يمكن استعادته الآن: تواريخه تتداخل مع ${r.clash.nameAr}.`) })
  }

  return (
    <Page>
      {/* ── header card ──────────────────────────────────────────────── */}
      <section className="highlight-card hl-green flex flex-col gap-8 rounded-2xl px-5 py-6 lg:ps-6 lg:pe-14">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button onClick={() => (create ? cancel() : navigate("/sprints"))}
            className="inline-flex h-[34px] items-center gap-2 rounded-lg px-3.5 text-[13.5px] font-medium transition-colors hover:bg-foreground/5">
            <ArrowLeft className={cn("size-[14px]", isAr && "rotate-180")} />{t("Back to sprints", "العودة إلى السبرنتات")}
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {editing ? (
              <>
                <Btn variant="outline" className="bg-secondary" onClick={cancel}>{t("Cancel", "إلغاء")}</Btn>
                <Btn variant="primary" onClick={save}>{create ? t("Create sprint", "إنشاء السبرنت") : t("Save changes", "حفظ التعديلات")}</Btn>
              </>
            ) : canManage && sprint ? (
              sprint.archived ? (
                <Btn className="rounded-[8px] bg-foreground/[0.08] px-3 font-normal" onClick={restore}>
                  <ArchiveRestore className="size-[14px]" /><span>{t("Restore", "استعادة")}</span>
                </Btn>
              ) : (
                <>
                  <Btn className="rounded-[8px] bg-foreground/[0.08] px-3 font-normal" onClick={() => setEditing(true)}>
                    <Pencil className="size-[14px]" /><span>{t("Edit", "تعديل")}</span>
                  </Btn>
                  {canClose && (
                    <Btn className="rounded-[8px] bg-foreground/[0.08] px-3 font-normal" onClick={() => setClosing(true)}>
                      <Lock className="size-[14px]" /><span>{t("Close sprint", "إغلاق السبرنت")}</span>
                    </Btn>
                  )}
                  <Btn variant="danger" className="rounded-[8px] bg-foreground/[0.08] font-normal" onClick={() => setArchiving(true)}>
                    <Archive className="size-4" /><span>{t("Archive", "أرشفة")}</span>
                  </Btn>
                </>
              )
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className={cn("flex min-w-0 flex-col gap-3", editing && "lg:flex-1")}>
            {editing && d ? (
              <div className="flex flex-col gap-1">
                <input
                  ref={nameRef} autoFocus={create} value={d.name} onChange={(e) => patch({ name: e.target.value })}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); save() } }}
                  placeholder={t("Sprint name", "اسم السبرنت")} aria-label={t("Sprint name", "اسم السبرنت")}
                  aria-invalid={!!err("name")}
                  className={cn("h-[38px] w-full max-w-[640px] border-b border-dashed bg-transparent text-[27px] font-normal leading-[38px] tracking-[-0.27px] outline-none placeholder:text-muted-foreground/60",
                    err("name") ? "border-error" : "border-input focus:border-primary/70")}
                />
                {err("name") && <p role="alert" className="text-[12px] text-error">{err("name")}</p>}
              </div>
            ) : (
              <h1 className="text-[27px] font-normal leading-[38px] tracking-[-0.27px]">{view.name}</h1>
            )}
            <div className="flex flex-wrap items-center gap-2.5 text-[13.5px]">
              <span className="accent-chip inline-flex h-[26px] items-center rounded-full px-2.5 text-[12px] tabular-nums">{code}</span>
              {sprint?.archived ? (
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[12px] text-muted-foreground">{t("Archived", "مؤرشف")}</span>
              ) : !create && (
                <span className={cn("rounded-full px-2.5 py-0.5 text-[12px]", SPRINT_STATUS[status].chip)}>
                  {isAr ? SPRINT_STATUS[status].ar : SPRINT_STATUS[status].en}
                </span>
              )}
              {view.startISO && view.endISO && (
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <CalendarRange className="size-4 text-icon" />{sprintRange(view, isAr)}
                </span>
              )}
              {status === "active" && !editing && (
                <span className="text-primary">· {isAr ? `متبقٍ ${dayCount(left, true)}` : `${dayCount(left, false)} left`}</span>
              )}
            </div>
          </div>
          {!create && (
            <div className="flex items-center gap-10 self-center lg:self-auto">
              <Legend rows={STATUS_ORDER.map((s) => ({ label: s === "open" ? t("Pending", "قيد الانتظار") : isAr ? STATUS_META[s].ar : STATUS_META[s].en, value: n(s), dot: STATUS_META[s].dot }))} />
              <Donut total={own.length} label={t("Tasks", "مهام")}
                slices={STATUS_ORDER.map((s) => ({ value: n(s), color: s === "completed" ? "color-mix(in oklab, var(--success) 70%, var(--background))" : STATUS_META[s].color }))} />
            </div>
          )}
        </div>
      </section>

      {(denied || notice || sprint?.archived) && (
        <div className="mt-6 flex flex-col gap-2">
          {denied && <Note tone="info" text={t("Only managers and admins can define sprints.", "يمكن للمدراء والمسؤولين فقط تعريف السبرنتات.")} />}
          {sprint?.archived && <Note tone="info" text={t("This sprint is archived — hidden from the board and the sprint pickers.", "هذا السبرنت مؤرشف — مخفي من لوحة المهام وقوائم اختيار السبرنت.")} />}
          {notice && <Note tone={notice.tone} text={notice.text} />}
        </div>
      )}

      {/* ── body: main column + side column ─────────────────────────────── */}
      <div className="mt-10 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)]">
        <div className="flex min-w-0 flex-col gap-6">
          <Panel>
            <CardHeader icon={Target} title={t("Sprint goal", "هدف السبرنت")}
              actions={editing && !create ? <span className="text-[12px] text-warning">{t("Unsaved changes", "تغييرات غير محفوظة")}</span> : undefined} />
            <div className="mt-[18px]">
              {editing && d ? (
                <div className="flex flex-col gap-4">
                  <textarea
                    value={d.goal} onChange={(e) => patch({ goal: e.target.value })} rows={4}
                    aria-label={t("Sprint goal", "هدف السبرنت")}
                    placeholder={t("What the team commits to deliver in this sprint…", "ما يلتزم الفريق بتسليمه خلال هذا السبرنت…")}
                    className="min-h-[110px] w-full resize-none rounded-[8px] border border-primary/70 bg-background p-4 text-[13.5px] leading-[20.25px] outline-none placeholder:text-muted-foreground"
                  />
                  <TextCounter text={d.goal} isAr={isAr} />
                </div>
              ) : goalText ? (
                <>
                  <p className="text-[13.5px] leading-[20.25px]">{goalText}</p>
                  {goalOtherLang && (
                    <p className="mt-2 text-[11.5px] text-muted-foreground">
                      {t("No English goal yet — shown in Arabic.", "لا يوجد هدف بالعربية بعد — معروض بالإنجليزية.")}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-[13.5px] text-muted-foreground">{t("No goal set yet.", "لم يُحدَّد هدف بعد.")}</p>
              )}
            </div>
          </Panel>

          <Panel>
            <CardHeader icon={ListChecks} title={t("Sprint tasks", "مهام السبرنت")}
              actions={sprint && (
                <Btn variant="soft" onClick={() => navigate(`/tasks?sprint=${sprint.id}`)}>
                  <LayoutGrid className="size-[14px]" />{t("Open on the board", "عرض في لوحة المهام")}
                </Btn>
              )} />
            <div className="mt-[18px]">
              {create ? (
                <Empty icon={ListChecks} text={t("Once the sprint is created, plan tasks into it from a task's Sprint field.",
                  "بعد إنشاء السبرنت، خطّط المهام فيه من حقل السبرنت في المهمة.")} />
              ) : own.length === 0 ? (
                <Empty icon={ListChecks} text={t("No tasks are planned in this sprint yet.", "لا توجد مهام مخططة في هذا السبرنت بعد.")} />
              ) : (
                <div className="flex flex-col gap-5">
                  {STATUS_ORDER.filter((s) => n(s) > 0).map((s) => (
                    <div key={s}>
                      <div className="mb-2 flex items-center gap-2 text-[12.5px] font-medium">
                        <StatusDot status={s} />{isAr ? STATUS_META[s].ar : STATUS_META[s].en}
                        <span className="text-[11.5px] tabular-nums text-muted-foreground">{n(s)}</span>
                      </div>
                      <div className="overflow-hidden rounded-[10px] bg-background/60 ring-1 ring-inset ring-[var(--card-ring)]">
                        {own.filter((x) => x.status === s).sort((a, b) => a.dueISO.localeCompare(b.dueISO)).map((x, i) => (
                          <SprintTaskRow key={x.id} task={x} first={i === 0} isAr={isAr} t={t}
                            onOpen={() => navigate(x.assigneeId ? `/tasks/${x.id}?from=manager` : `/tasks/${x.id}`)} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Panel>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Panel>
            <CardHeader icon={Info} title={t("Details", "التفاصيل")} />
            <dl className="mt-[18px] overflow-hidden rounded-lg bg-background/60">
              <Row label={t("Reference", "الرمز")} edit={false} view={<span className="tabular-nums">{code}</span>} />
              {editing && d ? (
                <Row edit view={null} label={t("Name in Arabic", "الاسم بالإنجليزية")}
                  control={
                    <input
                      value={d.nameAlt} onChange={(e) => patch({ nameAlt: e.target.value })} dir={isAr ? "ltr" : "rtl"}
                      placeholder={t("Optional", "اختياري")} aria-label={t("Name in Arabic", "الاسم بالإنجليزية")}
                      className="h-9 w-full max-w-[265px] rounded-lg bg-[var(--card-elevated)] px-3 text-[12.5px] font-medium outline-none ring-1 ring-inset ring-[var(--card-ring)] placeholder:font-normal placeholder:text-muted-foreground focus:ring-primary"
                    />
                  } />
              ) : sprint && (
                <Row edit={false} label={t("Name in Arabic", "الاسم بالإنجليزية")} view={<span dir={isAr ? "ltr" : "rtl"}>{isAr ? sprint.name : sprint.nameAr}</span>} />
              )}
              <Row label={t("Start date", "تاريخ البدء")} edit={editing} error={err("start")}
                view={shortDate(view.startISO, isAr)}
                control={d && <DateField value={d.startISO} onChange={(v) => patch({ startISO: v })} label={t("Start date", "تاريخ البدء")} invalid={!!err("start")} />} />
              <Row label={t("End date", "تاريخ الانتهاء")} edit={editing} error={err("end")}
                view={shortDate(view.endISO, isAr)}
                control={d && <DateField value={d.endISO} onChange={(v) => patch({ endISO: v })} label={t("End date", "تاريخ الانتهاء")} invalid={!!err("end")} />} />
              <Row label={t("Length", "المدة")} edit={false} view={length ? dayCount(length, isAr) : "—"} />
              {!create && sprint && (
                <Row label={t("Status", "الحالة")} edit={false}
                  view={<span className={cn("rounded-full px-2 py-0.5 text-[11.5px]", sprint.archived ? "bg-secondary text-muted-foreground" : SPRINT_STATUS[status].chip)}>
                    {sprint.archived ? t("Archived", "مؤرشف") : isAr ? SPRINT_STATUS[status].ar : SPRINT_STATUS[status].en}
                  </span>} />
              )}
              {sprint?.closedISO && <Row label={t("Closed on", "تاريخ الإغلاق")} edit={false} view={shortDate(sprint.closedISO, isAr)} />}
              {!create && (
                <Row label={t("Progress", "التقدم")} edit={false}
                  view={<span className="tabular-nums">{t(`${done} of ${own.length} tasks done`, `${done} من ${own.length} مهمة مكتملة`)}</span>} />
              )}
            </dl>
            {!canManage && (
              <p className="mt-4 flex items-center gap-2 text-[11.5px] text-muted-foreground">
                <Lock className="size-3.5 shrink-0" />
                {t("Only managers and admins can define sprints.", "يمكن للمدراء والمسؤولين فقط تعريف السبرنتات.")}
              </p>
            )}
          </Panel>
        </div>
      </div>

      {sprint && (
        <CloseSprintDialog
          open={closing} sprint={sprint} unfinished={unfinished} targets={nextPlanned} isAr={isAr} t={t}
          onCancel={() => setClosing(false)}
          onConfirm={(moveTo) => {
            setClosing(false)
            const moved = closeSprint(sprint.id, moveTo)
            const to = nextPlanned.find((s) => s.id === moveTo)
            setNotice({
              tone: "success",
              text: moved && to
                ? t(`Sprint closed. ${moved} unfinished ${moved === 1 ? "task" : "tasks"} moved to ${to.name}.`, `أُغلق السبرنت. نُقلت ${moved} من المهام غير المكتملة إلى ${to.nameAr}.`)
                : t("Sprint closed.", "أُغلق السبرنت."),
            })
          }}
        />
      )}

      {sprint && (() => {
        const blocked = archiving ? archiveBlocker(sprint.id) : undefined
        if (blocked) {
          return (
            <SmallDialog open title={t(`${sprint.name} can't be archived yet`, `لا يمكن أرشفة ${sprint.nameAr} الآن`)}
              onClose={() => setArchiving(false)}
              actions={<Btn variant="primary" onClick={() => setArchiving(false)}>{t("OK", "حسنًا")}</Btn>}>
              <p className="text-[14px] leading-relaxed text-muted-foreground">
                {t(`${blocked.tasks} ${blocked.tasks === 1 ? "task is" : "tasks are"}${blocked.projects ? ` and ${blocked.projects} ${blocked.projects === 1 ? "project is" : "projects are"}` : ""} still planned in it. Move them to another sprint first — archiving never takes work off the board silently.`,
                   `ما زال مخططًا فيه ${blocked.tasks} مهمة${blocked.projects ? ` و${blocked.projects} مشروع` : ""}. انقلها إلى سبرنت آخر أولًا — الأرشفة لا تُخفي العمل من اللوحة دون علمك.`)}
              </p>
            </SmallDialog>
          )
        }
        return (
          <ConfirmDialog
            open={archiving}
            title={t(`Archive ${sprint.name}?`, `أرشفة ${sprint.nameAr}؟`)}
            body={t("It leaves the board's sprint list and the sprint pickers. Nothing is deleted — it can be restored from the Archived tab.",
              "سيختفي من قائمة سبرنتات اللوحة ومن قوائم الاختيار. لن يُحذف شيء — يمكن استعادته من تبويب المؤرشفة.")}
            confirm={t("Archive", "أرشفة")} cancel={t("Cancel", "إلغاء")}
            onCancel={() => setArchiving(false)}
            onConfirm={() => {
              setArchiving(false)
              if (archiveSprint(sprint.id).ok) navigate("/sprints")
            }}
          />
        )
      })()}
    </Page>
  )
}

function Note({ tone, text }: { tone: "success" | "info" | "error"; text: string }) {
  const Icon = tone === "success" ? CheckCircle2 : tone === "error" ? AlertTriangle : Info
  return (
    <p role="status" className={cn("flex items-center gap-2 rounded-xl px-4 py-3 text-[13px]",
      tone === "success" ? "bg-success-fill text-success" : tone === "error" ? "bg-error-fill text-error" : "bg-info-fill text-info")}>
      <Icon className="size-4 shrink-0" />{text}
    </p>
  )
}

/** A task line in the sprint's status groups — the list row of the Tasks board. */
function SprintTaskRow({ task, first, isAr, t, onOpen }: { task: Task; first: boolean; isAr: boolean; t: TFn; onOpen: () => void }) {
  const overdue = isOverdue(task)
  const owner = task.assigneeId ? memberById(task.assigneeId) : undefined
  const done = task.status === "completed"
  return (
    <div
      onClick={onOpen} role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen() } }}
      aria-label={isAr ? task.titleAr : task.title}
      className={cn("group flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-3 outline-none transition-colors hover:bg-foreground/[0.03] focus-visible:bg-foreground/[0.05]",
        !first && "border-t border-input")}
    >
      <span className={cn("min-w-0 flex-1 basis-[220px] text-[13px] leading-snug group-hover:text-primary", done && "text-muted-foreground line-through")}>
        {isAr ? task.titleAr : task.title}
      </span>
      <CategoryChip id={task.category} isAr={isAr} />
      <span className="inline-flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
        <Initials text={owner ? owner.initials : ME.initials} className="size-[18px] text-[8px]" />
        {owner ? (isAr ? owner.nameAr : owner.name).split(" ")[0] : t("Me", "أنا")}
      </span>
      <span className={cn("inline-flex items-center gap-1 text-[11.5px]", overdue ? "font-semibold text-error" : "text-muted-foreground")}>
        {overdue ? <AlertTriangle className="size-3" /> : <Clock className="size-3" />}{shortDate(task.dueISO, isAr)}
      </span>
    </div>
  )
}

/** The small dialog shell (same look as the yes/no confirmation). */
function SmallDialog({ open, title, children, actions, onClose }: {
  open: boolean; title: string; children: React.ReactNode; actions: React.ReactNode; onClose: () => void
}) {
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="w-full max-w-[500px] rounded-2xl bg-[var(--card-elevated)] p-6 shadow-2xl ring-1 ring-[var(--card-ring)]">
        <h2 className="text-[18px] font-semibold">{title}</h2>
        <div className="mt-2">{children}</div>
        <div className="mt-6 flex justify-end gap-2">{actions}</div>
      </div>
    </div>
  )
}

/** "Close sprint" — yes/no, with where the unfinished tasks go. */
function CloseSprintDialog({ open, sprint, unfinished, targets, isAr, t, onCancel, onConfirm }: {
  open: boolean; sprint: Sprint; unfinished: number; targets: Sprint[]; isAr: boolean; t: TFn
  onCancel: () => void; onConfirm: (moveTo?: string) => void
}) {
  const [moveTo, setMoveTo] = React.useState<string>(targets[0]?.id ?? "")
  React.useEffect(() => { if (open) setMoveTo(targets[0]?.id ?? "") }, [open])  // eslint-disable-line react-hooks/exhaustive-deps
  const name = isAr ? sprint.nameAr : sprint.name
  return (
    <SmallDialog open={open} title={t(`Close ${sprint.name}?`, `إغلاق ${sprint.nameAr}؟`)} onClose={onCancel}
      actions={<>
        <Btn onClick={onCancel}>{t("Cancel", "إلغاء")}</Btn>
        <Btn variant="primary" autoFocus onClick={() => onConfirm(unfinished && moveTo ? moveTo : undefined)}>{t("Close sprint", "إغلاق السبرنت")}</Btn>
      </>}>
      <p className="text-[14px] leading-relaxed text-muted-foreground">
        {unfinished === 0
          ? t("Every task in it is done. It will be marked completed today.", "كل مهامه مكتملة. سيُعلَّم مكتملًا اليوم.")
          : t(`${unfinished} ${unfinished === 1 ? "task isn't" : "tasks aren't"} finished. Where should ${unfinished === 1 ? "it" : "they"} go?`,
              `${unfinished} من المهام غير مكتملة. إلى أين تُنقل؟`)}
      </p>
      {unfinished > 0 && (
        <FilterSelect
          className="mt-4" label={t("Move to", "نقل إلى")}
          lead={<Flag className="size-[14px] shrink-0 text-icon" />}
          value={moveTo} onChange={setMoveTo}
          options={[
            ...targets.map((s) => ({ value: s.id, label: isAr ? s.nameAr : s.name, hint: sprintRange(s, isAr) })),
            { value: "", label: t(`Leave them in ${name}`, `إبقاؤها في ${name}`) },
          ]}
        />
      )}
    </SmallDialog>
  )
}
