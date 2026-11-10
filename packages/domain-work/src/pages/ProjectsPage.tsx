import * as React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { cn } from "@reach/shared-core"
import { AlertTriangle, ChevronRight, Clock, FolderKanban, Plus, Search } from "lucide-react"

import { CategoryChip, Empty, Initials, Page, Skeleton, useFirstPaint, useT } from "../components/ui"
import { HealthPill } from "../components/HealthPill"
import { STATUS_LABEL, type ProjectStatus, useProjects } from "../data/projects"
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

/** The project master. No Figma screen — drawn in the Tasks screens' language:
 *  hero card, segmented filter, cards with a status bar per project. */
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
  const setFilter = (id: string) => setParams(id === "all" ? {} : { status: id }, { replace: true })

  const visible = projects
    .filter((p) => filter === "all" || p.status === filter)
    .filter((p) => q === "" ||
      (isAr ? p.nameAr : p.name).toLowerCase().includes(q.toLowerCase()) ||
      p.code.toLowerCase().includes(q.toLowerCase()))

  const activeCount = projects.filter((p) => p.status === "active").length
  const overdueTotal = tasks.filter((x) => x.projectId && isOverdue(x)).length

  return (
    <Page>
      <section className="highlight-card hl-green flex flex-col gap-6 rounded-2xl px-6 py-8 lg:flex-row lg:items-center lg:justify-between lg:ps-6 lg:pe-14 lg:py-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] font-medium leading-[38px]">{t("Projects", "المشاريع")}</h1>
          <p className="text-[14px] text-muted-foreground">
            {t(`${projects.length} projects · ${activeCount} active · ${overdueTotal} overdue tasks across them.`,
               `${projects.length} مشروعًا · ${activeCount} قيد التنفيذ · ${overdueTotal} مهمة متأخرة.`)}
          </p>
        </div>
        <div className="flex flex-wrap gap-4 lg:gap-6">
          {([["active", t("Active", "قيد التنفيذ"), activeCount], ["planned", t("Planned", "مخطط"), projects.filter((p) => p.status === "planned").length],
             ["done", t("Completed", "مكتمل"), projects.filter((p) => p.status === "done").length]] as const).map(([id, label, n]) => (
            <button key={id} onClick={() => setFilter(id)}
              className="flex h-[81px] min-w-[180px] items-center gap-3 rounded-xl bg-[var(--card-elevated)] px-[18px] text-start ring-1 ring-inset ring-[var(--card-ring)] hover:ring-primary/40">
              <FolderKanban className="size-7 shrink-0 text-primary" />
              <span className="flex-1 text-[16px] font-semibold">{n} {label}</span>
              <ChevronRight className={cn("size-4 text-icon", isAr && "rotate-180")} />
            </button>
          ))}
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
          <button onClick={() => navigate("/projects/new")}
            className="btn-primary-grad inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-[13px] font-medium">
            <Plus className="size-4" />{t("New project", "مشروع جديد")}
          </button>
        </div>
        <label className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-icon" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search projects…", "ابحث في المشاريع…")}
            className="h-9 w-full rounded-lg bg-[var(--card-elevated)] ps-9 pe-3 text-[13px] outline-none ring-1 ring-inset ring-[var(--card-ring)] placeholder:text-muted-foreground focus:ring-primary/60" />
        </label>
      </div>

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

      {ready && visible.length === 0 && (
        <Empty icon={FolderKanban} text={t("No project matches that filter.", "لا يوجد مشروع مطابق لهذا التصفية.")}
          action={<button onClick={() => navigate("/projects/new")} className="btn-primary-grad inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-[13px] font-medium"><Plus className="size-4" />{t("New project", "مشروع جديد")}</button>} />
      )}
    </Page>
  )
}
