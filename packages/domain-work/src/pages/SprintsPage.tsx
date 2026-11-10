import * as React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { cn } from "@reach/shared-core"
import { Archive, CalendarCheck2, CalendarClock, CalendarRange, ChevronRight, Flag, Info, Plus } from "lucide-react"

import { Empty, Page, Skeleton, useFirstPaint, useT } from "../components/ui"
import { STATUS_META, STATUS_ORDER } from "../data/meta"
import { TASK_TODAY_ISO, useTasks } from "../data/tasks"
import { useCanManageSprints } from "../data/permissions"
import {
  dayCount, daysBetween, SPRINT_STATUS, sprintRange, sprintStatus, type Sprint, type SprintStatus, useAllSprints,
} from "../data/sprints"

type Filter = "all" | SprintStatus | "archived"
const FILTERS: Filter[] = ["all", "active", "planned", "completed", "archived"]
const isFilter = (v: string | null): v is Filter => !!v && (FILTERS as string[]).includes(v)

/** The sprint master. No Figma screen — drawn in the Tasks screens' language:
 *  hero card with the counts, segmented filter, and a table that scrolls in its
 *  own container. Managers and admins define sprints; everyone else reads. */
export default function SprintsPage() {
  const { isAr, t } = useT()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const ready = useFirstPaint()
  const canManage = useCanManageSprints()

  const all = useAllSprints()
  const tasks = useTasks()
  const live = React.useMemo(() => all.filter((s) => !s.archived).sort((a, b) => a.startISO.localeCompare(b.startISO)), [all])
  const archived = all.filter((s) => s.archived)

  const filter: Filter = isFilter(params.get("status")) ? (params.get("status") as Filter) : "all"
  const denied = params.get("denied") === "1"
  const setFilter = (f: Filter) => setParams(f === "all" ? {} : { status: f }, { replace: true })

  const count = (st: SprintStatus) => live.filter((s) => sprintStatus(s) === st).length
  // newest first reads best in a master list
  const rows = (filter === "archived" ? archived : live.filter((s) => filter === "all" || sprintStatus(s) === filter))
    .slice().sort((a, b) => b.startISO.localeCompare(a.startISO))

  const label = (f: Filter) =>
    f === "all" ? t("All", "الكل") : f === "archived" ? t("Archived", "المؤرشفة") : isAr ? SPRINT_STATUS[f].ar : SPRINT_STATUS[f].en
  const newSprint = () => navigate("/sprints/new")
  const hero: { id: SprintStatus; icon: typeof Flag; tone: string; hint: string }[] = [
    { id: "active", icon: CalendarClock, tone: "text-info", hint: t("Running now", "قيد التشغيل الآن") },
    { id: "planned", icon: CalendarRange, tone: "text-foreground", hint: t("Not started yet", "لم يبدأ بعد") },
    { id: "completed", icon: CalendarCheck2, tone: "text-success", hint: t("Ended or closed", "انتهى أو أُغلق") },
  ]

  return (
    <Page>
      {/* ── hero ───────────────────────────────────────────────────────── */}
      <section className="highlight-card hl-green flex flex-col gap-6 rounded-2xl px-6 py-8 lg:flex-row lg:items-center lg:justify-between lg:ps-6 lg:pe-14 lg:py-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] font-medium leading-[38px]">{t("Sprints", "السبرنتات")}</h1>
          <p className="max-w-[520px] text-[14px] text-muted-foreground">
            {t("Two-week cycles the Tasks board is planned in. Pick one to see its goal, dates and tasks.",
               "دورات العمل التي تُخطَّط عليها لوحة المهام. اختر سبرنتًا لعرض هدفه وتواريخه ومهامه.")}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 lg:flex lg:gap-6">
          {hero.map(({ id, icon: Icon, tone, hint }) => (
            <button key={id} onClick={() => setFilter(id)} aria-pressed={filter === id}
              className={cn("flex min-h-[81px] items-center gap-3 rounded-xl bg-card px-[18px] py-4 text-start ring-1 ring-inset transition-colors hover:ring-primary/40 lg:w-[215px]",
                filter === id ? "ring-primary/60" : "ring-[var(--card-ring)]")}>
              <Icon className={cn("size-8 shrink-0 stroke-[1.6]", tone)} />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="whitespace-nowrap text-[16px] font-semibold leading-8">{count(id)} {isAr ? SPRINT_STATUS[id].ar : SPRINT_STATUS[id].en.toLowerCase()}</span>
                <span className="text-[11.5px] leading-[13px] text-muted-foreground">{hint}</span>
              </span>
              <ChevronRight className={cn("size-4 shrink-0 text-icon", isAr && "rotate-180")} />
            </button>
          ))}
        </div>
      </section>

      {denied && (
        <p role="status" className="mt-6 flex items-center gap-2 rounded-xl bg-info-fill px-4 py-3 text-[13px] text-info">
          <Info className="size-4 shrink-0" />
          {t("Only managers and admins can define sprints.", "يمكن للمدراء والمسؤولين فقط تعريف السبرنتات.")}
        </p>
      )}

      {/* ── toolbar ────────────────────────────────────────────────────── */}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex flex-wrap gap-0.5 rounded-[9px] bg-[var(--card-elevated)] p-[3px]" role="tablist" aria-label={t("Status", "الحالة")}>
            {FILTERS.filter((f) => f !== "archived" || archived.length > 0).map((f) => (
              <button key={f} role="tab" onClick={() => setFilter(f)} aria-selected={filter === f}
                className={cn("inline-flex h-[30px] items-center gap-1.5 rounded-md px-3.5 text-[12.5px] font-medium transition-colors",
                  filter === f ? "bg-soft-accent text-primary" : "text-muted-foreground hover:text-foreground")}>
                {f === "archived" && <Archive className="size-3.5" />}{label(f)}
                <span className="text-[11px] tabular-nums opacity-70">
                  {f === "all" ? live.length : f === "archived" ? archived.length : count(f)}
                </span>
              </button>
            ))}
          </div>
          {canManage && (
            <button onClick={newSprint}
              className="btn-primary-grad inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-[12.5px] font-semibold">
              <Plus className="size-3.5" strokeWidth={2.2} />{t("New sprint", "سبرنت جديد")}
            </button>
          )}
        </div>
        <button onClick={() => navigate("/tasks")} className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-[12.5px] font-medium text-primary hover:bg-soft-accent">
          <Flag className="size-3.5" />{t("Open the Tasks board", "فتح لوحة المهام")}
        </button>
      </div>

      {/* ── table ──────────────────────────────────────────────────────── */}
      <div className="panel mt-4 overflow-hidden rounded-xl">
        {!ready ? (
          <div className="space-y-2 p-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : rows.length === 0 ? (
          <Empty
            icon={Flag}
            text={filter === "all"
              ? t("No sprints yet. A sprint gives the board its two-week window.", "لا توجد سبرنتات بعد. يحدد السبرنت نافذة الأسبوعين للوحة المهام.")
              : t("No sprint matches that filter.", "لا يوجد سبرنت مطابق لهذا التصفية.")}
            action={canManage && filter !== "archived" ? (
              <button onClick={newSprint} className="btn-primary-grad inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-[12.5px] font-semibold">
                <Plus className="size-3.5" strokeWidth={2.2} />{t("New sprint", "سبرنت جديد")}
              </button>
            ) : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-start text-[13px]">
              <thead>
                <tr className="text-[11.5px] text-muted-foreground">
                  <th className="px-4 py-3 text-start font-medium">{t("Code", "الرمز")}</th>
                  <th className="px-4 py-3 text-start font-medium">{t("Name", "الاسم")}</th>
                  <th className="px-4 py-3 text-start font-medium">{t("Dates", "التواريخ")}</th>
                  <th className="px-4 py-3 text-start font-medium">{t("Status", "الحالة")}</th>
                  <th className="px-4 py-3 text-start font-medium">{t("Progress", "التقدم")}</th>
                  <th className="px-4 py-3 text-start font-medium">{t("Goal", "الهدف")}</th>
                  <th className="w-10 px-2 py-3" aria-hidden />
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <SprintRow key={s.id} sprint={s} tasks={tasks.filter((x) => x.sprint === s.id)}
                    isAr={isAr} t={t} onOpen={() => navigate(`/sprints/${s.id}`)} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Page>
  )
}

function SprintRow({ sprint: s, tasks, isAr, t, onOpen }: {
  sprint: Sprint; tasks: { status: (typeof STATUS_ORDER)[number] }[]; isAr: boolean
  t: (en: string, ar: string) => string; onOpen: () => void
}) {
  const st = sprintStatus(s)
  const done = tasks.filter((x) => x.status === "completed").length
  const active = st === "active"
  const left = active ? daysBetween(TASK_TODAY_ISO, s.endISO) : 0
  const goal = isAr ? s.goalAr || s.goal : s.goal || s.goalAr
  return (
    <tr
      onClick={onOpen} tabIndex={0} role="link"
      onKeyDown={(e) => { if (e.key === "Enter") onOpen() }}
      aria-label={isAr ? s.nameAr : s.name}
      className={cn("cursor-pointer border-t border-input outline-none transition-colors hover:bg-foreground/[0.03] focus-visible:bg-foreground/[0.05]",
        active && "bg-soft-accent/40 hover:bg-soft-accent/60", s.archived && "text-muted-foreground")}
    >
      <td className={cn("whitespace-nowrap px-4 py-3.5 tabular-nums text-muted-foreground", active && "border-s-[3px] border-s-primary")}>{s.code}</td>
      <td className="whitespace-nowrap px-4 py-3.5 font-medium">
        {isAr ? s.nameAr : s.name}
        {active && <span className="ms-2 text-[11px] font-normal text-primary">{isAr ? `متبقٍ ${dayCount(left, true)}` : `${dayCount(left, false)} left`}</span>}
      </td>
      <td className="whitespace-nowrap px-4 py-3.5 tabular-nums">{sprintRange(s, isAr)}</td>
      <td className="px-4 py-3.5">
        <span className={cn("inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px]", s.archived ? "bg-secondary text-muted-foreground" : SPRINT_STATUS[st].chip)}>
          {s.archived ? t("Archived", "مؤرشف") : isAr ? SPRINT_STATUS[st].ar : SPRINT_STATUS[st].en}
        </span>
      </td>
      <td className="px-4 py-3.5">
        <div className="flex w-[150px] flex-col gap-1.5">
          <div className="flex h-1.5 overflow-hidden rounded-full bg-secondary">
            {tasks.length > 0 && STATUS_ORDER.map((k) => {
              const n = tasks.filter((x) => x.status === k).length
              return n ? <span key={k} className={STATUS_META[k].dot} style={{ width: `${(n / tasks.length) * 100}%` }} /> : null
            })}
          </div>
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {t(`${done} of ${tasks.length} done`, `${done} من ${tasks.length} مكتملة`)}
          </span>
        </div>
      </td>
      <td className="max-w-[260px] px-4 py-3.5">
        <span className="block truncate text-muted-foreground" title={goal}>{goal || "—"}</span>
      </td>
      <td className="px-2 py-3.5"><ChevronRight className={cn("size-4 text-icon", isAr && "rotate-180")} /></td>
    </tr>
  )
}
