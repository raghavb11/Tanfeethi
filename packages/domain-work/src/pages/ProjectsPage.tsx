import * as React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Badge, Button, Card, Input } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  AlertTriangle, ArrowRight, CalendarClock, FolderKanban, Plus, Search, UserRound,
} from "lucide-react"

import { STATUS_LABEL, type ProjectStatus, useProjects } from "../data/projects"
import { isOverdue, useTasks } from "../data/tasks"

const FILTERS: { id: "all" | ProjectStatus; en: string; ar: string }[] = [
  { id: "all", en: "All", ar: "الكل" },
  { id: "active", en: "Active", ar: "قيد التنفيذ" },
  { id: "planned", en: "Planned", ar: "مخطط" },
  { id: "on-hold", en: "On hold", ar: "متوقف" },
  { id: "done", en: "Completed", ar: "مكتمل" },
]

/** The manager's project master: what exists, who owns it, how the work under
 *  it is tracking, and the way in to create a new one. */
export default function ProjectsPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  const projects = useProjects()
  const tasks = useTasks()
  const [q, setQ] = React.useState("")

  const raw = params.get("status")
  const filter = FILTERS.some((f) => f.id === raw) ? (raw as "all" | ProjectStatus) : "all"
  const setFilter = (id: string) => setParams(id === "all" ? {} : { status: id }, { replace: true })

  const stats = (projectId: string) => {
    const own = tasks.filter((x) => x.projectId === projectId)
    return {
      total: own.length,
      done: own.filter((x) => x.status === "completed").length,
      overdue: own.filter(isOverdue).length,
    }
  }

  const visible = projects
    .filter((p) => filter === "all" || p.status === filter)
    .filter((p) => q === "" ||
      (isAr ? p.nameAr : p.name).toLowerCase().includes(q.toLowerCase()) ||
      p.code.toLowerCase().includes(q.toLowerCase()))

  const activeCount = projects.filter((p) => p.status === "active").length
  const overdueTotal = tasks.filter((x) => x.projectId && isOverdue(x)).length

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-primary">
            <FolderKanban className="size-5" />
            <span className="text-xs font-semibold uppercase tracking-[0.14em]">{t("Manager view", "عرض المدير")}</span>
          </div>
          <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight sm:text-3xl">{t("Projects", "المشاريع")}</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {t(`${projects.length} projects · ${activeCount} active · ${overdueTotal} overdue tasks across them.`,
               `${projects.length} مشروعًا · ${activeCount} قيد التنفيذ · ${overdueTotal} مهمة متأخرة.`)}
          </p>
        </div>
        <Button className="shrink-0" onClick={() => navigate("/projects/new")}>
          <Plus className="size-4" />{t("New project", "مشروع جديد")}
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex flex-wrap rounded-xl border border-border p-0.5">
          {FILTERS.map((f) => (
            <button
              key={f.id} onClick={() => setFilter(f.id)} aria-pressed={filter === f.id}
              className={cn("rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                filter === f.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              {isAr ? f.ar : f.en}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)}
                 placeholder={t("Search projects…", "ابحث في المشاريع…")} className="w-56 ps-9" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((p) => {
          const s = stats(p.id)
          const pct = s.total === 0 ? 0 : Math.round((s.done / s.total) * 100)
          return (
            <Card
              key={p.id}
              role="button" tabIndex={0}
              onClick={() => navigate(`/projects/${p.id}`)}
              onKeyDown={(e) => { if (e.key === "Enter") navigate(`/projects/${p.id}`) }}
              aria-label={isAr ? p.nameAr : p.name}
              className="cursor-pointer p-4 outline-none transition-all hover:-translate-y-0.5 hover:border-primary/30 focus-visible:border-primary/40"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold leading-tight">{isAr ? p.nameAr : p.name}</p>
                  <p className="mt-0.5 text-[11px] tabular-nums text-muted-foreground">{p.code}</p>
                </div>
                <Badge variant="outline" className={cn("shrink-0 text-[10.5px]", STATUS_LABEL[p.status].chip)}>
                  {isAr ? STATUS_LABEL[p.status].ar : STATUS_LABEL[p.status].en}
                </Badge>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-muted-foreground">
                <span className="inline-flex items-center gap-1"><UserRound className="size-3.5" />{isAr ? p.ownerAr : p.owner}</span>
                <span className="inline-flex items-center gap-1"><CalendarClock className="size-3.5" />{isAr ? "حتى" : "to"} {p.due}</span>
              </div>

              {/* progress */}
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">
                    {t(`${s.done} of ${s.total} tasks done`, `${s.done} من ${s.total} مهمة مكتملة`)}
                  </span>
                  <span className="font-semibold tabular-nums">{pct}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                {s.overdue > 0 ? (
                  <Badge variant="outline" className="border-rose-500/40 bg-rose-500/10 text-[10px] text-rose-500">
                    <AlertTriangle className="me-1 size-2.5" />
                    {t(`${s.overdue} overdue`, `${s.overdue} متأخرة`)}
                  </Badge>
                ) : <span className="text-[11px] text-muted-foreground/70">{t("Nothing overdue", "لا شيء متأخر")}</span>}
                <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-primary">
                  {t("Open", "فتح")}<ArrowRight className={cn("size-3.5", isAr && "rotate-180")} />
                </span>
              </div>
            </Card>
          )
        })}
      </div>

      {visible.length === 0 && (
        <Card className="py-14 text-center">
          <FolderKanban className="mx-auto size-8 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">{t("No project matches that filter.", "لا يوجد مشروع مطابق لهذا التصفية.")}</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/projects/new")}>
            <Plus className="size-4" />{t("New project", "مشروع جديد")}
          </Button>
        </Card>
      )}
    </main>
  )
}
