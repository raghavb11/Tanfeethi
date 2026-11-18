import * as React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { cn } from "@reach/shared-core"
import { AlertTriangle, CalendarClock, ChartGantt, ChevronRight, CirclePause, CirclePlay, Clock, FolderKanban, LayoutGrid, Lock, Plus, Search } from "lucide-react"

import { CategoryChip, Donut, Empty, Initials, Legend, Page, Skeleton, useFirstPaint, useT } from "../components/ui"
import { HealthPill } from "../components/HealthPill"
import { Roadmap } from "../components/Roadmap"
import { STATUS_LABEL, TYPE_LABEL, type ProjectStatus, type ProjectType, useProjects } from "../data/projects"
import { projectHealth, useMilestones } from "../data/milestones"
import { STATUS_META, STATUS_ORDER } from "../data/meta"
import { ME, isOverdue, shortDate, useTasks } from "../data/tasks"
import { memberById } from "../data/team"

const FILTERS: { id: "all" | ProjectStatus; en: string; ar: string }[] = [
  { id: "all", en: "All", ar: "الكل" },
  { id: "active", en: "Active", ar: "قيد التنفيذ" },
  { id: "planned", en: "Planned", ar: "مخطط" },
  { id: "on-hold", en: "On hold", ar: "متوقف" },
  { id: "done", en: "Completed", ar: "مكتمل" },
]

/** Project status in the hero: colours follow the status chips; the hint sits under the count. */
const HERO_STATUS: Record<ProjectStatus, { dot: string; color: string; tone: string; hint: string; hintAr: string }> = {
  planned: { dot: "bg-foreground/70", color: "color-mix(in oklab, var(--foreground) 75%, transparent)", tone: "text-foreground", hint: "Not started yet", hintAr: "لم يبدأ بعد" },
  active: { dot: "bg-info", color: "var(--info)", tone: "text-info", hint: "Being delivered now", hintAr: "قيد التسليم الآن" },
  "on-hold": { dot: "bg-warning", color: "var(--warning)", tone: "text-warning", hint: "Paused, waiting on a decision", hintAr: "متوقف بانتظار قرار" },
  done: { dot: "bg-success", color: "color-mix(in oklab, var(--success) 70%, var(--background))", tone: "text-success", hint: "Delivered", hintAr: "تم التسليم" },
}
const HERO_CARDS = ["planned", "active", "on-hold"] as const
const TYPE_FILTERS: { id: "all" | ProjectType; en: string; ar: string }[] = [
  { id: "all", en: "All types", ar: "كل الأنواع" },
  { id: "strategic", en: "Strategic", ar: "استراتيجي" },
  { id: "pmo", en: "PMO", ar: "مكتب إدارة المشاريع" },
]
type View = "cards" | "roadmap"
const DONUT_ORDER: ProjectStatus[] = ["planned", "active", "on-hold", "done"]

/** The project portfolio. No Figma screen — drawn in the Tasks screens' language:
 *  the Tasks hero (2015:9895: title, three status cards, divider, legend +
 *  donut), segmented filters, then either cards with a status bar per project or
 *  the roadmap (every project on one time axis, Strategic then PMO).
 *  ?view=roadmap · ?type=strategic|pmo · ?status=… are all deep-linkable. */
export default function ProjectsPage() {
  const { isAr, t } = useT()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const ready = useFirstPaint()

  const projects = useProjects()
  const tasks = useTasks()
  useMilestones()
  const [q, setQ] = React.useState("")

  const raw = params.get("status")
  const filter = FILTERS.some((f) => f.id === raw) ? (raw as "all" | ProjectStatus) : "all"
  const rawType = params.get("type")
  const typeFilter = TYPE_FILTERS.some((f) => f.id === rawType) ? (rawType as "all" | ProjectType) : "all"
  const view: View = params.get("view") === "roadmap" ? "roadmap" : "cards"
  /** One query param at a time changes; the others stay as they are. */
  const setParam = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value); else next.delete(key)
    setParams(next, { replace: true })
  }
  const setFilter = (id: string) => setParam("status", id === "all" ? undefined : id)

  const visible = projects
    .filter((p) => filter === "all" || p.status === filter)
    .filter((p) => typeFilter === "all" || p.type === typeFilter)
    .filter((p) => q === "" ||
      (isAr ? p.nameAr : p.name).toLowerCase().includes(q.toLowerCase()) ||
      p.code.toLowerCase().includes(q.toLowerCase()))

  const countOf = (s: ProjectStatus) => projects.filter((p) => p.status === s).length
  const overdueTotal = tasks.filter((x) => x.projectId && isOverdue(x)).length
  const typeCount = (k: ProjectType) => projects.filter((p) => p.type === k).length

  return (
    <Page>
      {/* ── hero, as the Tasks board's ─────────────────────────────────── */}
      <section className="highlight-card hl-green flex flex-col gap-8 rounded-[16px] px-6 py-8 lg:flex-row lg:items-center lg:justify-between lg:gap-0 lg:ps-6 lg:pe-14 lg:py-10">
        <div className="flex min-w-0 flex-col justify-between gap-5 lg:min-h-[163px] lg:w-[693px] lg:gap-[15px]">
          <div className="flex flex-col gap-2">
            <h1 className="text-[28px] font-medium leading-[38px] tracking-tight">{t("Project portfolio", "محفظة المشاريع")}</h1>
            <p className="text-[14px] text-muted-foreground">
              {t(`${typeCount("strategic")} strategic and ${typeCount("pmo")} PMO projects with their health and progress — ${overdueTotal} overdue tasks across them.`,
                 `${typeCount("strategic")} مشاريع استراتيجية و${typeCount("pmo")} مشاريع لمكتب إدارة المشاريع مع حالتها وتقدّمها — ${overdueTotal} مهمة متأخرة فيها.`)}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 lg:flex lg:gap-6">
            {HERO_CARDS.map((s) => (
              <ProjectStatusCard key={s} status={s} value={countOf(s)} isAr={isAr} onClick={() => setFilter(s)} />
            ))}
          </div>
        </div>
        <span aria-hidden className="hidden w-[2.5px] self-stretch lg:my-px bg-gradient-to-b from-transparent via-[#1c331c] to-transparent lg:block" />
        <div className="flex items-center justify-center gap-8 lg:w-[300px] lg:justify-between">
          {/* each status filters the projects below; the active one clears it */}
          <Legend
            rows={DONUT_ORDER.map((s) => ({ key: s, label: isAr ? STATUS_LABEL[s].ar : STATUS_LABEL[s].en, value: countOf(s), dot: HERO_STATUS[s].dot }))}
            active={filter === "all" ? undefined : filter}
            onSelect={(s) => setFilter(filter === s ? "all" : s)}
          />
          <Donut
            mirror={!isAr}
            total={projects.length} label={t("Projects", "مشاريع")}
            slices={DONUT_ORDER.map((s) => ({ value: countOf(s), color: HERO_STATUS[s].color }))}
          />
        </div>
      </section>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex flex-wrap gap-0.5 rounded-[9px] bg-[var(--card-elevated)] p-[3px]">
            {FILTERS.map((f) => (
              <button key={f.id} onClick={() => setFilter(f.id)} aria-pressed={filter === f.id}
                className={cn("h-[30px] rounded-md px-3.5 text-[12.5px] font-medium transition-colors",
                  filter === f.id ? "bg-soft-accent text-primary" : "text-muted-foreground hover:text-foreground")}>
                {isAr ? f.ar : f.en}
              </button>
            ))}
          </div>
          <div className="inline-flex flex-wrap gap-0.5 rounded-[9px] bg-[var(--card-elevated)] p-[3px]">
            {TYPE_FILTERS.map((f) => (
              <button key={f.id} onClick={() => setParam("type", f.id === "all" ? undefined : f.id)} aria-pressed={typeFilter === f.id}
                className={cn("inline-flex h-[30px] items-center gap-1.5 rounded-md px-3.5 text-[12.5px] font-medium transition-colors",
                  typeFilter === f.id ? "bg-soft-accent text-primary" : "text-muted-foreground hover:text-foreground")}>
                {f.id === "strategic" ? <Lock className="size-3" /> : f.id === "pmo" ? <span className={cn("size-1.5 rounded-full", TYPE_LABEL.pmo.dot)} /> : null}
                {isAr ? f.ar : f.en}
              </button>
            ))}
          </div>
          <button onClick={() => navigate("/projects/new")}
            className="btn-primary-grad inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-[13px] font-medium">
            <Plus className="size-4" />{t("New project", "مشروع جديد")}
          </button>
        </div>
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
        {/* cards or the roadmap — the same filtered set either way */}
        <div role="group" aria-label={t("View", "طريقة العرض")} className="inline-flex gap-0.5 rounded-[9px] bg-[var(--card-elevated)] p-[3px]">
          {([["cards", LayoutGrid, "Cards", "بطاقات"], ["roadmap", ChartGantt, "Roadmap", "خارطة الطريق"]] as const).map(([v, Icon, en, ar]) => (
            <button key={v} onClick={() => setParam("view", v === "cards" ? undefined : v)} aria-pressed={view === v}
              className={cn("inline-flex h-[30px] items-center gap-1.5 rounded-md px-3 text-[12.5px] font-medium transition-colors",
                view === v ? "bg-soft-accent text-primary" : "text-muted-foreground hover:text-foreground")}>
              <Icon className="size-3.5" />{isAr ? ar : en}
            </button>
          ))}
        </div>
        <label className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-icon" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search projects…", "ابحث في المشاريع…")}
            className="h-9 w-full rounded-lg bg-[var(--card-elevated)] ps-9 pe-3 text-[13px] outline-none ring-1 ring-inset ring-[var(--card-ring)] placeholder:text-muted-foreground focus:ring-primary/60" />
        </label>
        </div>
      </div>

      {view === "roadmap" && ready && visible.length > 0 && (
        <div className="mt-4"><Roadmap projects={visible} tasks={tasks} isAr={isAr} t={t} /></div>
      )}
      {view === "roadmap" && !ready && <Skeleton className="mt-4 h-[520px]" />}

      {view === "cards" && (
      <div className="mt-4 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {!ready && [0, 1, 2].map((i) => <Skeleton key={i} className="h-[214px]" />)}
        {ready && visible.map((p) => {
          const own = tasks.filter((x) => x.projectId === p.id)
          const done = own.filter((x) => x.status === "completed").length
          const overdue = own.filter(isOverdue).length
          const health = projectHealth(p.id, tasks)
          const owner = p.ownerId === "me" ? undefined : memberById(p.ownerId)
          return (
            <div
              key={p.id} role="button" tabIndex={0}
              onClick={() => navigate(`/projects/${p.id}`)}
              onKeyDown={(e) => { if (e.key === "Enter") navigate(`/projects/${p.id}`) }}
              aria-label={isAr ? p.nameAr : p.name}
              className="panel flex cursor-pointer flex-col gap-4 rounded-xl px-4 py-5 outline-none transition-all hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[17px] font-medium leading-[25px]">{isAr ? p.nameAr : p.name}</p>
                  <span className="mt-2 block h-[3px] w-12 rounded-[2px] bg-primary" />
                </div>
                <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px]", STATUS_LABEL[p.status].chip)}>
                  {isAr ? STATUS_LABEL[p.status].ar : STATUS_LABEL[p.status].en}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium", TYPE_LABEL[p.type].chip)}>
                  {p.type === "strategic" ? <Lock className="size-2.5" /> : <span className={cn("size-1.5 rounded-full", TYPE_LABEL[p.type].dot)} />}
                  {isAr ? TYPE_LABEL[p.type].ar : TYPE_LABEL[p.type].en}
                </span>
                <CategoryChip id={p.category} isAr={isAr} />
                <span className="text-[11px] tabular-nums text-muted-foreground">{p.code}</span>
                {health && <HealthPill health={health} isAr={isAr} size="sm" />}
              </div>
              {/* the tasks by status, as one bar */}
              <div>
                <div className="flex h-1.5 overflow-hidden rounded-full bg-secondary">
                  {own.length > 0 && STATUS_ORDER.map((s) => {
                    const n = own.filter((x) => x.status === s).length
                    return n ? <span key={s} className={STATUS_META[s].dot} style={{ width: `${(n / own.length) * 100}%` }} /> : null
                  })}
                </div>
                <p className="mt-1.5 text-[11.5px] text-muted-foreground">
                  {t(`${done} of ${own.length} tasks done`, `${done} من ${own.length} مهمة مكتملة`)}
                </p>
              </div>
              <div className="mt-auto flex items-center justify-between gap-2 border-t border-input pt-3 text-[11.5px]">
                <span className="flex min-w-0 items-center gap-[7px]">
                  <Initials text={owner ? owner.initials : ME.initials} />
                  <span className="truncate text-muted-foreground">{isAr ? p.ownerAr : p.owner}</span>
                </span>
                {overdue > 0 ? (
                  <span className="flex items-center gap-1 font-semibold text-error"><AlertTriangle className="size-3" />{t(`${overdue} overdue`, `${overdue} متأخرة`)}</span>
                ) : (
                  <span className="flex items-center gap-1 text-muted-foreground"><Clock className="size-3" />{shortDate(p.dueISO, isAr)}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
      )}

      {ready && visible.length === 0 && (
        <Empty icon={FolderKanban} text={t("No project matches that filter.", "لا يوجد مشروع مطابق لهذا التصفية.")}
          action={<button onClick={() => navigate("/projects/new")} className="btn-primary-grad inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-[13px] font-medium"><Plus className="size-4" />{t("New project", "مشروع جديد")}</button>} />
      )}
    </Page>
  )
}

/** Hero selector card, as the Tasks board's ("Work Card Selector"): 81 high, radius 12, icon 32. */
function ProjectStatusCard({ status, value, isAr, onClick }: { status: (typeof HERO_CARDS)[number]; value: number; isAr: boolean; onClick: () => void }) {
  const Icon = status === "planned" ? CalendarClock : status === "on-hold" ? CirclePause : CirclePlay
  const m = HERO_STATUS[status]
  return (
    <button
      onClick={onClick}
      className="group flex min-h-[81px] items-center gap-3 rounded-[12px] bg-card px-[18px] py-4 text-start ring-1 ring-inset ring-[var(--card-ring)] transition-colors hover:ring-primary/40 lg:w-[215px]"
    >
      <Icon className={cn("size-8 shrink-0 stroke-[1.6]", m.tone)} />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[16px] font-semibold leading-8">{value} {isAr ? STATUS_LABEL[status].ar : STATUS_LABEL[status].en.toLowerCase()}</span>
        <span className="text-[11.5px] leading-[13px] text-muted-foreground">{isAr ? m.hintAr : m.hint}</span>
      </span>
      <ChevronRight className={cn("size-4 shrink-0 text-icon transition-transform", isAr && "rotate-180")} />
    </button>
  )
}
