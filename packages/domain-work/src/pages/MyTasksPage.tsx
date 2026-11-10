import * as React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { cn } from "@reach/shared-core"
import {
  AlertTriangle, CalendarClock, CheckCircle2, ChevronRight, Circle, CirclePause, CirclePlay, Clock,
  Flag, FolderOpen, FolderPlus, Inbox, LayoutGrid, List, ListPlus, Plus, RotateCcw, Search, Settings2, Sparkles,
  SquarePlus,
} from "lucide-react"

import {
  CategoryChip, Donut, Empty, FilterSelect, Initials, Legend, Page, Skeleton, StatusDot,
  useFirstPaint, useT, type TFn,
} from "../components/ui"
import {
  CATEGORIES, PRIORITY_META, STATUS_META, STATUS_ORDER,
  type TaskStatus,
} from "../data/meta"
import { currentSprintId, SPRINT_STATUS, sprintStatus, useSprints } from "../data/sprints"
import { useCanManageSprints } from "../data/permissions"
import { ME, isOverdue, setTaskStatus, shortDate, type Task, toggleComplete, useTasks } from "../data/tasks"
import { memberById, team } from "../data/team"

/** List tabs. "overdue" is a cut across the statuses, kept from the earlier list. */
type Tab = "all" | TaskStatus | "overdue"
const TABS: Tab[] = ["all", "open", "on-hold", "in-progress", "in-review", "overdue", "completed"]
const isTab = (v: string | null): v is Tab => !!v && (TABS as string[]).includes(v)

type View = "board" | "list"

/** Whose work is on screen: everyone, only me, only the team, or one report. */
const whoFromParams = (p: URLSearchParams): string => {
  const who = p.get("who")
  if (who) return who
  // older links: ?scope=team[&report=r1]
  if (p.get("scope") === "team") return p.get("report") ?? "team"
  return "all"
}

/** Projects & Tasks — Figma 2015:9895 (web) and 3356:6232 (phone). */
export default function MyTasksPage() {
  const { isAr, t } = useT()
  const navigate = useNavigate()
  const all = useTasks()
  const [params, setParams] = useSearchParams()
  const ready = useFirstPaint()
  const sprints = useSprints()
  const canManageSprints = useCanManageSprints()
  // the live current sprint (re-read whenever the sprint store changes)
  const CURRENT_SPRINT = React.useMemo(() => currentSprintId(), [sprints])  // eslint-disable-line react-hooks/exhaustive-deps

  const who = whoFromParams(params)
  const category = params.get("category") ?? "all"
  // a status deep-link (?tab=open from the dashboard) opens the list; otherwise the board
  const view: View = params.get("view") === "list" || (params.get("tab") && params.get("view") !== "board") ? "list" : "board"
  // the board is a sprint board (the current sprint; Sprint 24 as drawn); the list spans every sprint unless narrowed
  const sprint = params.get("sprint") ?? (view === "board" ? CURRENT_SPRINT : "all")
  const tab: Tab = isTab(params.get("tab")) ? (params.get("tab") as Tab) : "all"
  const [q, setQ] = React.useState("")
  // which column the phone layout shows
  const [phoneCol, setPhoneCol] = React.useState<TaskStatus>("open")

  const setQuery = (next: Record<string, string | undefined>) => {
    const merged: Record<string, string> = {}
    params.forEach((v, k) => { if (k !== "scope" && k !== "report") merged[k] = v })
    if (who !== "all") merged.who = who
    Object.entries(next).forEach(([k, v]) => { if (v === undefined) delete merged[k]; else merged[k] = v })
    setParams(merged, { replace: true })
  }

  // ── filters ────────────────────────────────────────────────────────────
  const byWho = (x: Task) =>
    who === "all" ? true
      : who === "me" ? !x.assigneeId
        : who === "team" ? !!x.assigneeId
          : x.assigneeId === who
  const bySprint = (x: Task) => sprint === "all" || x.sprint === sprint
  const byCategory = (x: Task) => category === "all" || x.category === category
  const byText = (x: Task) => q === "" || (isAr ? x.titleAr : x.title).toLowerCase().includes(q.toLowerCase())

  const scoped = all.filter(byWho).filter(bySprint)
  const visible = scoped.filter(byCategory)

  const count = (s: TaskStatus) => visible.filter((x) => x.status === s).length
  const active = count("open") + count("on-hold") + count("in-progress")

  const managerView = who !== "all" && who !== "me"
  const openTask = (x: Task) => navigate(x.assigneeId ? `/tasks/${x.id}?from=manager` : `/tasks/${x.id}`)
  const newTask = (status?: TaskStatus) => {
    const qs = new URLSearchParams()
    if (status) qs.set("status", status)
    if (managerView) { qs.set("from", "manager"); if (who !== "team") qs.set("assignee", who) }
    if (view === "board") qs.set("view", "board")
    const s = qs.toString()
    navigate(`/tasks/new${s ? `?${s}` : ""}`)
  }

  // ── drag between columns ───────────────────────────────────────────────
  const [dragId, setDragId] = React.useState<string | null>(null)
  const [overCol, setOverCol] = React.useState<TaskStatus | null>(null)
  const drop = (status: TaskStatus) => {
    if (dragId) setTaskStatus(dragId, status)
    setDragId(null); setOverCol(null)
  }

  const listRows = visible
    .filter((x) => tab === "all" ? true : tab === "overdue" ? isOverdue(x) : x.status === tab)
    .filter(byText)
    .sort((a, b) => (a.status === "completed" ? 1 : 0) - (b.status === "completed" ? 1 : 0) || a.dueISO.localeCompare(b.dueISO))

  const whoOptions = [
    { value: "all", label: t("All", "الكل") },
    { value: "me", label: t("Only me", "أنا فقط") },
    { value: "team", label: t("My team", "فريقي") },
    ...team.map((m) => ({
      value: m.id, label: isAr ? m.nameAr : m.name, alt: isAr ? m.name : m.nameAr, lead: <Initials text={m.initials} />,
      hint: all.filter((x) => x.assigneeId === m.id && x.status !== "completed").length,
    })),
  ]

  return (
    <Page>
      {/* ── hero ───────────────────────────────────────────────────────── */}
      <section className="highlight-card hl-green flex flex-col gap-8 rounded-[16px] px-6 py-8 lg:flex-row lg:items-center lg:justify-between lg:gap-0 lg:ps-6 lg:pe-14 lg:py-10">
        <div className="flex min-w-0 flex-col justify-between gap-5 lg:min-h-[163px] lg:w-[693px] lg:gap-[15px]">
          <div className="flex flex-col gap-2">
            <h1 className="text-[28px] font-medium leading-[38px] tracking-tight">{t("Projects & Tasks", "المشاريع و المهام")}</h1>
            <p className="text-[14px] text-muted-foreground">
              {t("All your tasks and projects on one board, sorted by priority.", "كل مهامك ومشاريعك في لوحة واحدة، مرتبة حسب الأولوية.")}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 lg:flex lg:gap-6">
            {(["open", "on-hold", "in-progress"] as const).map((s) => (
              <StatusCard key={s} status={s} value={count(s)} isAr={isAr}
                onClick={() => setQuery({ view: "list", tab: s })} />
            ))}
          </div>
        </div>
        <span aria-hidden className="hidden w-[2.5px] self-stretch lg:my-px bg-gradient-to-b from-transparent via-[#1c331c] to-transparent lg:block" />
        <div className="flex items-center justify-center gap-8 lg:w-[300px] lg:justify-between">
          <Legend rows={(["open", "on-hold", "in-progress"] as const).map((s) => ({
            label: s === "open" ? t("Pending", "قيد الانتظار") : isAr ? STATUS_META[s].ar : STATUS_META[s].en, value: count(s), dot: STATUS_META[s].dot,
          }))} />
          <Donut
            mirror={!isAr}
            total={active} label={t("Tasks", "مهام")}
            slices={(["open", "on-hold", "in-progress"] as const).map((s) => ({ value: count(s), color: STATUS_META[s].color }))}
          />
        </div>
      </section>

      {/* ── toolbar ────────────────────────────────────────────────────── */}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex h-9 items-center gap-0.5 rounded-[9px] bg-[var(--card-elevated)] p-[3px]" role="tablist" aria-label={t("View", "العرض")}>
            {([["board", LayoutGrid, t("Kanban", "كانبان")], ["list", List, t("List", "قائمة")]] as const).map(([id, Icon, label]) => (
              <button
                key={id} role="tab" aria-selected={view === id}
                onClick={() => setQuery({ view: id === "board" ? "board" : "list", tab: id === "board" ? undefined : tab })}
                className={cn("inline-flex h-[30px] items-center gap-2 rounded-md px-3.5 text-[12.5px] font-medium transition-colors",
                  view === id ? "bg-soft-accent text-primary" : "text-muted-foreground hover:text-foreground")}
              >
                <Icon className="size-[14px]" />{label}
              </button>
            ))}
          </div>
          {/* create: the home "مهامي" card's gold "+ مهمة جديدة" button, in the free space after the toggle */}
          <NewMenu
            isAr={isAr} t={t}
            onTask={() => newTask()}
            onProject={() => navigate(`/projects/new?back=${encodeURIComponent(`/tasks${params.toString() ? `?${params}` : ""}`)}`)}
            onProjects={() => navigate("/projects")}
            onSprint={canManageSprints ? () => navigate("/sprints/new") : undefined}
            onSprints={() => navigate("/sprints")}
            manageSprints={canManageSprints}
          />
        </div>

        <div className="flex w-full flex-wrap items-center gap-3 lg:w-auto">
          <FilterSelect
            className="w-full sm:w-[200px]"
            lead={<span className="size-[7px] shrink-0 rounded-full bg-primary" />}
            label={t("Category", "الفئة")}
            value={category}
            count={scoped.filter((x) => category === "all" || x.category === category).length}
            onChange={(v) => setQuery({ category: v === "all" ? undefined : v })}
            options={[{ value: "all", label: t("All", "الكل"), hint: scoped.length },
              ...CATEGORIES.map((c) => ({ value: c.id, label: isAr ? c.ar : c.en, hint: scoped.filter((x) => x.category === c.id).length,
                lead: <span className={cn("size-2 rounded-full", c.dot)} /> }))]}
          />
          <FilterSelect
            className="w-full sm:w-[200px]"
            lead={<Flag className="size-[14px] shrink-0 text-icon" />}
            label={t("Sprint", "السبرنت")}
            value={sprint}
            onChange={(v) => setQuery({ sprint: v === (view === "board" ? CURRENT_SPRINT : "all") ? undefined : v })}
            options={[...sprints.map((s) => {
              const st = sprintStatus(s)
              return { value: s.id, label: isAr ? s.nameAr : s.name, hint: st === "completed" ? undefined : isAr ? SPRINT_STATUS[st].ar : SPRINT_STATUS[st].en }
            }), { value: "all", label: t("All sprints", "كل السبرنتات") }]}
            footer={
              <button type="button" onClick={() => navigate("/sprints")}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-start text-[12.5px] font-medium text-primary transition-colors hover:bg-soft-accent">
                <Settings2 className="size-3.5 shrink-0" />
                {canManageSprints ? t("Manage sprints", "إدارة السبرنتات") : t("Sprints", "السبرنتات")}
              </button>
            }
          />
          {/* Visible way into sprint definitions (the menu entries alone were too hidden). */}
          <button type="button" onClick={() => navigate("/sprints")}
            title={canManageSprints ? t("Define and manage sprints", "تعريف السبرنتات وإدارتها") : t("View sprints", "عرض السبرنتات")}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[8px] border border-input bg-[var(--card-elevated)] px-3 text-[12.5px] font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary">
            <Settings2 className="size-[14px] shrink-0 text-primary" />
            {t("Sprints", "السبرنتات")}
          </button>
          <FilterSelect
            className="w-full sm:w-[225px]"
            lead={<span className="inline-flex size-[22px] shrink-0 items-center justify-center rounded-full bg-soft-accent text-[10px] font-semibold text-primary">{team.length}</span>}
            label={t("Employees", "الموظفين")}
            value={who}
            onChange={(v) => setQuery({ who: v === "all" ? undefined : v })}
            options={whoOptions}
            searchable
          />
        </div>
      </div>

      {/* ── board ──────────────────────────────────────────────────────── */}
      {view === "board" && !ready && (
        <div className="mt-4 flex gap-4 overflow-hidden">
          {STATUS_ORDER.map((s) => <Skeleton key={s} className="h-80 min-w-[208px] flex-1" />)}
        </div>
      )}

      {view === "board" && ready && (
        <>
          {/* phone: one status at a time (3356:6232) */}
          <div className="mt-4 md:hidden">
            <div className="flex gap-1 overflow-x-auto rounded-xl bg-[var(--card-elevated)] p-1">
              {STATUS_ORDER.map((s) => (
                <button key={s} onClick={() => setPhoneCol(s)} aria-pressed={phoneCol === s}
                  className={cn("shrink-0 rounded-lg px-3 py-2 text-[12.5px] font-medium",
                    phoneCol === s ? "bg-soft-accent text-primary" : "text-muted-foreground")}>
                  {isAr ? STATUS_META[s].ar : STATUS_META[s].en} <span className="tabular-nums opacity-70">{count(s)}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 space-y-3">
              {visible.filter((x) => x.status === phoneCol).sort((a, b) => a.dueISO.localeCompare(b.dueISO)).map((x) => (
                <BoardCard key={x.id} task={x} isAr={isAr} t={t} onOpen={() => openTask(x)} />
              ))}
              {count(phoneCol) === 0 && <Empty icon={Inbox} text={t("Nothing in this column.", "لا توجد مهام في هذا العمود.")} />}
            </div>
          </div>

          {/* web: five columns, scrolling sideways inside their own track */}
          <BoardScroller>
              {STATUS_ORDER.map((s) => {
                // board order is the manual (seeded) order, not due date
                const cards = visible.filter((x) => x.status === s)
                return (
                  <div
                    key={s}
                    onDragOver={(e) => { e.preventDefault(); setOverCol(s) }}
                    onDragLeave={() => setOverCol((c) => (c === s ? null : c))}
                    onDrop={() => drop(s)}
                    className={cn("group/col flex w-[208px] shrink-0 flex-col gap-3 rounded-[10px] transition-colors",
                      overCol === s && "bg-soft-accent/40 outline-1 outline-dashed outline-primary/50")}
                  >
                    <div className="flex h-12 items-center justify-between rounded-[10px] bg-card px-3.5 ring-1 ring-inset ring-[var(--card-ring)]">
                      <span className="flex items-center gap-2">
                        <StatusDot status={s} />
                        <span className="text-[12.4px] font-medium">{isAr ? STATUS_META[s].ar : STATUS_META[s].en}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        {/* add-to-column: revealed on hover / keyboard focus so the column reads as drawn */}
                        <button
                          onClick={() => newTask(s)}
                          aria-label={managerView ? t("Assign task", "إسناد مهمة") : t("New task", "مهمة جديدة")}
                          className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-foreground/5 hover:text-primary focus-visible:opacity-100 group-hover/col:opacity-100"
                        >
                          <Plus className="size-3.5" />
                        </button>
                        <span className="text-[12px] tabular-nums">{cards.length}</span>
                      </span>
                    </div>
                    {cards.map((x) => (
                      <BoardCard
                        key={x.id} task={x} isAr={isAr} t={t}
                        dragging={dragId === x.id}
                        onDragStart={() => setDragId(x.id)}
                        onDragEnd={() => { setDragId(null); setOverCol(null) }}
                        onOpen={() => openTask(x)}
                      />
                    ))}
                    {cards.length === 0 && (
                      <div className="rounded-[10px] border border-dashed border-input py-8 text-center text-[11.5px] text-muted-foreground">
                        {t("Drop a task here", "أفلت مهمة هنا")}
                      </div>
                    )}
                  </div>
                )
              })}
          </BoardScroller>
          {visible.length === 0 && (
            <Empty icon={CheckCircle2} text={t("No tasks match these filters.", "لا توجد مهام مطابقة لهذه التصفية.")} />
          )}
        </>
      )}

      {/* ── list ───────────────────────────────────────────────────────── */}
      {view === "list" && (
        <div className="mt-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1 rounded-[9px] bg-[var(--card-elevated)] p-[3px]">
              {TABS.map((id) => {
                const n = id === "all" ? visible.length : id === "overdue" ? visible.filter(isOverdue).length : count(id)
                const label = id === "all" ? t("All", "الكل") : id === "overdue" ? t("Overdue", "متأخرة")
                  : isAr ? STATUS_META[id].ar : STATUS_META[id].en
                return (
                  <button key={id} onClick={() => setQuery({ tab: id })} aria-pressed={tab === id}
                    className={cn("inline-flex h-[30px] items-center gap-1.5 rounded-md px-3 text-[12.5px] font-medium transition-colors",
                      tab === id ? "bg-soft-accent text-primary" : "text-muted-foreground hover:text-foreground")}>
                    {label}<span className="text-[11px] tabular-nums opacity-70">{n}</span>
                  </button>
                )
              })}
            </div>
            <label className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-icon" />
              <input
                value={q} onChange={(e) => setQ(e.target.value)}
                placeholder={t("Search tasks…", "ابحث في المهام…")}
                className="h-9 w-full rounded-lg bg-[var(--card-elevated)] ps-9 pe-3 text-[13px] outline-none ring-1 ring-inset ring-[var(--card-ring)] placeholder:text-muted-foreground focus:ring-primary/60"
              />
            </label>
          </div>
          <div className="panel overflow-hidden rounded-xl">
            {!ready ? (
              <div className="space-y-2 p-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>
            ) : listRows.length === 0 ? (
              <Empty
                icon={CheckCircle2}
                text={q ? t("No task matches that search.", "لا توجد مهمة مطابقة للبحث.") : t("Nothing here — you're all caught up.", "لا شيء هنا — أنجزت كل شيء.")}
              />
            ) : listRows.map((x, i) => (
              <TaskRow key={x.id} task={x} isAr={isAr} t={t} first={i === 0} onOpen={() => openTask(x)} />
            ))}
          </div>
        </div>
      )}
    </Page>
  )
}

/** The board track (2062:2570): 208px columns centred with 16px gaps, scrolling
 *  sideways inside itself, and the drawn 4px scroll indicator (2062:2923) under it. */
/** "+ جديد" — a small menu: new task, new project, or the project list. */
function NewMenu({ isAr, t, onTask, onProject, onProjects, onSprint, onSprints, manageSprints }: {
  isAr: boolean; t: TFn; onTask: () => void; onProject: () => void; onProjects: () => void
  /** only for managers and admins — they define sprints */
  onSprint?: () => void
  onSprints: () => void
  manageSprints: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    document.addEventListener("mousedown", onDoc)
    document.addEventListener("keydown", onKey)
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey) }
  }, [open])
  const items: { icon: typeof Plus; label: string; run: () => void; divider?: boolean }[] = [
    { icon: ListPlus, label: t("New task", "مهمة جديدة"), run: onTask },
    { icon: FolderPlus, label: t("New project", "مشروع جديد"), run: onProject },
    ...(onSprint ? [{ icon: SquarePlus, label: t("New sprint", "سبرنت جديد"), run: onSprint }] : []),
    { icon: FolderOpen, label: t("View projects", "عرض المشاريع"), run: onProjects, divider: true },
    { icon: Flag, label: manageSprints ? t("Manage sprints", "إدارة السبرنتات") : t("Sprints", "السبرنتات"), run: onSprints },
  ]
  return (
    <div ref={ref} className="relative">
      <button
        type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}
        className="btn-primary-grad inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3.5 text-[12.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Plus className="size-3.5" strokeWidth={2.2} />{t("New", "جديد")}
      </button>
      {open && (
        <div role="menu" dir={isAr ? "rtl" : "ltr"}
          className="absolute start-0 top-full z-30 mt-1 w-52 rounded-lg bg-popover p-1 shadow-lg ring-1 ring-[var(--card-ring)]">
          {items.map(({ icon: Icon, label, run, divider }) => (
            <button key={label} type="button" role="menuitem" onClick={() => { setOpen(false); run() }}
              className={cn("flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-start text-[12.5px] transition-colors hover:bg-soft-accent",
                divider && "mt-1 border-t border-border pt-2.5")}>
              <Icon className="size-4 shrink-0 text-primary" />{label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function BoardScroller({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null)
  // thumb share and offset; the frame draws a 66% thumb at the start when nothing overflows
  const [bar, setBar] = React.useState({ size: 0.658, at: 0 })
  const measure = React.useCallback(() => {
    const el = ref.current
    if (!el) return
    const over = el.scrollWidth - el.clientWidth
    if (over <= 1) { setBar({ size: 0.658, at: 0 }); return }
    const size = el.clientWidth / el.scrollWidth
    setBar({ size, at: (Math.abs(el.scrollLeft) / over) * (1 - size) })
  }, [])
  React.useEffect(() => {
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [measure])
  return (
    <div className="mt-4 hidden md:block">
      <div ref={ref} onScroll={measure} className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max justify-center gap-4 lg:min-w-0">{children}</div>
      </div>
      <div aria-hidden className="relative mt-4 h-1 rounded-[2px] bg-secondary">
        <span className="absolute inset-y-0 rounded-[2px] bg-muted-foreground" style={{ width: `${bar.size * 100}%`, insetInlineStart: `${bar.at * 100}%` }} />
      </div>
    </div>
  )
}

/** Hero selector card ("Work Card Selector"): 81 high, radius 12, icon 32. */
function StatusCard({ status, value, isAr, onClick }: { status: "open" | "on-hold" | "in-progress"; value: number; isAr: boolean; onClick: () => void }) {
  const Icon = status === "open" ? Inbox : status === "on-hold" ? CirclePause : CirclePlay
  const tone = status === "open" ? "text-foreground" : status === "on-hold" ? "text-warning" : "text-success"
  const m = STATUS_META[status]
  return (
    <button
      onClick={onClick}
      className="group flex min-h-[81px] items-center gap-3 rounded-[12px] bg-card px-[18px] py-4 text-start ring-1 ring-inset ring-[var(--card-ring)] transition-colors hover:ring-primary/40 lg:w-[215px]"
    >
      <Icon className={cn("size-8 shrink-0 stroke-[1.6]", tone)} />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[16px] font-semibold leading-8">{value} {isAr ? (status === "open" ? "قيد الانتظار" : m.ar) : (status === "open" ? "pending" : m.en.toLowerCase())}</span>
        <span className="text-[11.5px] leading-[13px] text-muted-foreground">{isAr ? m.hintAr : m.hint}</span>
      </span>
      <ChevronRight className={cn("size-4 shrink-0 text-icon transition-transform", isAr && "rotate-180")} />
    </button>
  )
}

/** Board card (2062:2579): category chip + status dot, title, owner and due,
 *  then the assistant's hint along the bottom. Draggable on the web board. */
function BoardCard({ task, isAr, t, dragging, onDragStart, onDragEnd, onOpen }: {
  task: Task; isAr: boolean; t: TFn
  dragging?: boolean; onDragStart?: () => void; onDragEnd?: () => void; onOpen: () => void
}) {
  const overdue = isOverdue(task)
  const owner = task.assigneeId ? memberById(task.assigneeId) : undefined
  const ownerName = owner ? (isAr ? owner.nameAr : owner.name) : isAr ? ME.nameAr : ME.name
  const first = ownerName.split(" ")[0]
  const initials = owner ? owner.initials : ME.initials
  const hint = isAr ? task.aiHintAr : task.aiHint
  return (
    <div
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onOpen}
      role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen() } }}
      aria-label={isAr ? task.titleAr : task.title}
      className={cn(
        "group cursor-pointer overflow-hidden rounded-[10px] bg-background text-start outline-none ring-1 ring-inset ring-[var(--card-ring)] transition-all",
        "hover:-translate-y-0.5 hover:ring-primary/40 focus-visible:ring-primary",
        dragging && "opacity-40",
      )}
    >
      <div className="flex flex-col gap-3 px-3.5 pt-3.5 pb-3">
        <div className="flex items-center justify-between gap-2">
          <CategoryChip id={task.category} isAr={isAr} />
          <StatusDot status={task.status} />
        </div>
        <p className="text-[12.1px] leading-[21px] text-foreground">
          {isAr ? task.titleAr : task.title}
        </p>
        <div className="flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-[7px]">
            <Initials text={initials} />
            <span className="truncate text-[11px] text-muted-foreground">{first}</span>
          </span>
          <span className={cn("flex shrink-0 items-center gap-1 text-[11px]", overdue ? "font-semibold text-error" : "text-muted-foreground")}>
            {shortDate(task.dueISO, isAr)}
            {overdue ? <AlertTriangle className="size-3" /> : <Clock className="size-3" />}
          </span>
        </div>
      </div>
      {hint ? (
        <div className="flex items-center justify-center gap-2 border-t border-input px-3 py-3">
          <Sparkles className="size-[13px] shrink-0 text-primary" />
          <span className="text-center text-[10px] leading-[13px] text-muted-foreground">{hint}</span>
        </div>
      ) : overdue ? (
        <div className="flex items-center justify-center gap-2 border-t border-input px-3 py-3 text-error">
          <AlertTriangle className="size-[13px] shrink-0" />
          <span className="text-[10px] font-medium leading-[13px]">{t("Overdue — needs a new date", "متأخرة — تحتاج موعدًا جديدًا")}</span>
        </div>
      ) : null}
    </div>
  )
}

function TaskRow({ task, isAr, t, first, onOpen }: { task: Task; isAr: boolean; t: TFn; first: boolean; onOpen: () => void }) {
  const done = task.status === "completed"
  const overdue = isOverdue(task)
  const owner = task.assigneeId ? memberById(task.assigneeId) : undefined
  const stop = (e: React.MouseEvent) => e.stopPropagation()
  const pr = PRIORITY_META[task.priority]
  return (
    <div
      onClick={onOpen} role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen() } }}
      aria-label={isAr ? task.titleAr : task.title}
      className={cn("group flex cursor-pointer items-start gap-3 px-4 py-3.5 outline-none transition-colors hover:bg-foreground/[0.03] focus-visible:bg-foreground/[0.04]",
        !first && "border-t border-input")}
    >
      <button onClick={(e) => { stop(e); toggleComplete(task.id) }} className="mt-0.5 shrink-0"
        aria-label={done ? t("Reopen", "إعادة فتح") : t("Mark complete", "وضع علامة مكتمل")}>
        {done ? <CheckCircle2 className="size-5 text-success" /> : <Circle className="size-5 text-icon transition-colors group-hover:text-primary" />}
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("text-[13.5px] leading-snug group-hover:text-primary", done && "text-muted-foreground line-through")}>
            {isAr ? task.titleAr : task.title}
          </span>
          <CategoryChip id={task.category} isAr={isAr} />
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><StatusDot status={task.status} className="size-1.5" />{isAr ? STATUS_META[task.status].ar : STATUS_META[task.status].en}</span>
          <span>{isAr ? task.projectAr : task.project}</span>
          <span className={cn("inline-flex items-center gap-1", overdue && "font-semibold text-error")}>
            <CalendarClock className="size-3" />{shortDate(task.dueISO, isAr)}{overdue && ` · ${t("overdue", "متأخرة")}`}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Initials text={owner ? owner.initials : ME.initials} className="size-[18px] text-[8px]" />
            {owner ? (isAr ? owner.nameAr : owner.name) : t("Me", "أنا")}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className={cn("hidden items-center gap-1.5 text-[11.5px] sm:inline-flex", pr.text)}>
          <span className={cn("size-1.5 rounded-full", pr.dot)} />{isAr ? pr.ar : pr.en}
        </span>
        <button
          onClick={(e) => { stop(e); toggleComplete(task.id) }}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-input px-2.5 text-[12px] font-medium hover:bg-foreground/5"
        >
          {done ? <><RotateCcw className="size-3.5" />{t("Reopen", "فتح")}</> : <><CheckCircle2 className="size-3.5" />{t("Complete", "إنجاز")}</>}
        </button>
      </div>
    </div>
  )
}
