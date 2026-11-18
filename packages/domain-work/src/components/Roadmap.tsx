import { useNavigate } from "react-router-dom"
import { cn } from "@reach/shared-core"
import { Lock } from "lucide-react"

import { Initials, type TFn } from "./ui"
import { HealthPill } from "./HealthPill"
import { STATUS_LABEL, TYPE_LABEL, type Project, type ProjectStatus, type ProjectType } from "../data/projects"
import { HEALTH, milestoneHealth, milestonesFor, projectHealth } from "../data/milestones"
import { ME, prettyDate, TASK_TODAY_ISO, type Task } from "../data/tasks"
import { memberById } from "../data/team"

/** Bar colour per project status — the same hues as the status chips. */
const BAR: Record<ProjectStatus, { track: string; fill: string }> = {
  planned: { track: "bg-foreground/[0.10]", fill: "bg-foreground/35" },
  active: { track: "bg-info/20", fill: "bg-info" },
  "on-hold": { track: "bg-warning/20", fill: "bg-warning" },
  done: { track: "bg-success/20", fill: "bg-success/80" },
}

const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]

const at = (iso: string) => new Date(`${iso}T00:00:00`).getTime()
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

/** The portfolio on one time axis: a lane per project, grouped Strategic then PMO.
 *  Each bar runs start → due, filled to the share of tasks done; milestones sit on
 *  it as diamonds coloured by their health; a gold line marks today.
 *  Wide by nature — it scrolls sideways inside its own card, never the page. */
export function Roadmap({ projects, tasks, isAr, t }: { projects: Project[]; tasks: Task[]; isAr: boolean; t: TFn }) {
  const navigate = useNavigate()

  // the axis: whole months from the earliest start to the latest due (milestones included)
  const dates = projects.flatMap((p) => [p.startISO, p.dueISO, ...milestonesFor(p.id).flatMap((m) => [m.startISO, m.dueISO])]).filter(Boolean).sort()
  const first = new Date(`${dates[0] ?? TASK_TODAY_ISO}T00:00:00`)
  const last = new Date(`${dates[dates.length - 1] ?? TASK_TODAY_ISO}T00:00:00`)
  const months: Date[] = []
  for (let d = new Date(first.getFullYear(), first.getMonth(), 1); d <= last; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) months.push(d)
  if (months.length === 0) months.push(new Date(first.getFullYear(), first.getMonth(), 1))
  const axisStart = at(iso(months[0]!))
  const axisEnd = at(iso(new Date(months[months.length - 1]!.getFullYear(), months[months.length - 1]!.getMonth() + 1, 1)))
  const pct = (d: string) => Math.min(100, Math.max(0, ((at(d) - axisStart) / (axisEnd - axisStart)) * 100))
  const todayPct = pct(TASK_TODAY_ISO)
  const showToday = at(TASK_TODAY_ISO) >= axisStart && at(TASK_TODAY_ISO) <= axisEnd
  // 64px a month keeps a year readable; the card scrolls when the span is longer
  const trackWidth = Math.max(720, months.length * 64)

  const groups = (["strategic", "pmo"] as ProjectType[])
    .map((type) => ({ type, items: projects.filter((p) => p.type === type).sort((a, b) => a.startISO.localeCompare(b.startISO)) }))
    .filter((g) => g.items.length > 0)

  const monthLabel = (d: Date, i: number) => {
    const m = isAr ? MONTHS_AR[d.getMonth()] : MONTHS_EN[d.getMonth()]
    // the year on the first column and wherever January starts a new one
    return i === 0 || d.getMonth() === 0 ? `${m} ${d.getFullYear()}` : m
  }

  return (
    <div className="panel overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <div style={{ minWidth: 280 + trackWidth }}>
          {/* ── month header ─────────────────────────────────────────────── */}
          <div className="sticky top-0 z-20 flex border-b border-border bg-background/95 backdrop-blur">
            <div className="sticky start-0 z-10 w-[280px] shrink-0 border-e border-border bg-background/95 px-4 py-3 text-[12px] font-semibold text-muted-foreground">
              {t("Project", "المشروع")}
            </div>
            <div className="relative flex-1">
              <div className="flex h-full">
                {months.map((d, i) => (
                  <div key={i} className={cn("flex-1 border-s border-border/60 px-2 py-3 text-[11.5px] tabular-nums text-muted-foreground",
                    d.getMonth() === 0 && i > 0 && "border-s-foreground/25 font-semibold text-foreground")}>
                    {monthLabel(d, i)}
                  </div>
                ))}
              </div>
              {showToday && (
                <span className="absolute bottom-0 z-10 -translate-x-1/2 translate-y-1/2 rounded-full bg-primary px-2 py-px text-[10px] font-semibold leading-[14px] text-primary-foreground rtl:translate-x-1/2"
                  style={{ insetInlineStart: `${todayPct}%` }}>
                  {t("Today", "اليوم")}
                </span>
              )}
            </div>
          </div>

          {groups.map((g) => (
            <section key={g.type} aria-label={isAr ? TYPE_LABEL[g.type].ar : TYPE_LABEL[g.type].en}>
              {/* ── group header ───────────────────────────────────────────── */}
              <div className="flex border-b border-border bg-foreground/[0.03]">
                <div className="sticky start-0 z-10 flex w-[280px] shrink-0 items-center gap-2 border-e border-border bg-[color-mix(in_oklab,var(--background)_92%,var(--foreground))] px-4 py-2.5">
                  <span className={cn("size-2 rounded-full", TYPE_LABEL[g.type].dot)} />
                  <span className="text-[13px] font-semibold">{isAr ? TYPE_LABEL[g.type].ar : TYPE_LABEL[g.type].en}</span>
                  <span className="text-[12px] tabular-nums text-muted-foreground">{g.items.length}</span>
                  {g.type === "strategic" && (
                    <span tabIndex={0} data-tip={t("Milestones on strategic projects are fixed by the strategy office", "معالم المشاريع الاستراتيجية يحددها مكتب الاستراتيجية ولا تتغير")}
                      className="ms-auto inline-flex items-center gap-1 rounded-full bg-soft-accent px-2 py-0.5 text-[11px] text-primary outline-none">
                      <Lock className="size-3" />{t("Milestones locked", "المعالم ثابتة")}
                    </span>
                  )}
                </div>
                <div className="flex-1" />
              </div>

              {g.items.map((p) => {
                const own = tasks.filter((x) => x.projectId === p.id)
                const done = own.filter((x) => x.status === "completed").length
                const progress = own.length ? Math.round((done / own.length) * 100) : p.status === "done" ? 100 : 0
                const health = projectHealth(p.id, tasks)
                const owner = p.ownerId === "me" ? undefined : memberById(p.ownerId)
                const ms = milestonesFor(p.id)
                const left = pct(p.startISO)
                const width = Math.max(1.2, pct(p.dueISO) - left)
                const name = isAr ? p.nameAr : p.name
                return (
                  <div key={p.id} className="group flex border-b border-border/70 last:border-b-0 hover:bg-foreground/[0.025]">
                    {/* the lane's label */}
                    <button type="button" onClick={() => navigate(`/projects/${p.id}`)}
                      className="sticky start-0 z-10 flex w-[280px] shrink-0 items-center gap-3 border-e border-border bg-background px-4 py-3 text-start outline-none transition-colors group-hover:bg-[color-mix(in_oklab,var(--background)_96%,var(--foreground))] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
                      <Initials text={owner ? owner.initials : ME.initials} />
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="truncate text-[13.5px] font-medium leading-[18px]">{name}</span>
                        <span className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span className="tabular-nums">{p.code}</span>
                          <span>·</span>
                          <span className="truncate">{isAr ? STATUS_LABEL[p.status].ar : STATUS_LABEL[p.status].en}</span>
                        </span>
                      </span>
                      {health && <HealthPill health={health} isAr={isAr} size="sm" className="shrink-0" />}
                    </button>

                    {/* the lane */}
                    <div className="relative min-h-[60px] flex-1">
                      {/* month gridlines */}
                      <div aria-hidden className="absolute inset-0 flex">
                        {months.map((d, i) => <div key={i} className={cn("flex-1 border-s border-border/40", d.getMonth() === 0 && i > 0 && "border-s-foreground/20")} />)}
                      </div>
                      {showToday && <span aria-hidden className="absolute inset-y-0 z-[1] w-px bg-primary/70" style={{ insetInlineStart: `${todayPct}%` }} />}

                      {/* the project bar: start → due, filled to the tasks done */}
                      <button type="button" onClick={() => navigate(`/projects/${p.id}`)}
                        data-tip={`${name} · ${prettyDate(p.startISO)} – ${prettyDate(p.dueISO)} · ${t(`${progress}% of tasks done`, `${progress}٪ من المهام منجزة`)}`}
                        aria-label={`${name}: ${prettyDate(p.startISO)} – ${prettyDate(p.dueISO)}`}
                        className={cn("absolute top-1/2 z-[2] h-[18px] -translate-y-1/2 overflow-hidden rounded-full outline-none ring-1 ring-inset ring-foreground/10 transition-[filter] hover:brightness-125 focus-visible:ring-2 focus-visible:ring-ring",
                          BAR[p.status].track)}
                        style={{ insetInlineStart: `${left}%`, width: `${width}%` }}>
                        <span className={cn("absolute inset-y-0 start-0 rounded-full", BAR[p.status].fill)} style={{ width: `${progress}%` }} />
                      </button>

                      {/* milestones as diamonds on their due date */}
                      {ms.map((m) => {
                        const h = milestoneHealth(m, tasks)
                        const mName = isAr ? m.nameAr : m.name
                        return (
                          <button key={m.id} type="button" onClick={() => navigate(`/projects/${p.id}/milestones/${m.id}`)}
                            data-tip={`${m.code} · ${mName} · ${t("due", "الاستحقاق")} ${prettyDate(m.dueISO)} · ${isAr ? HEALTH[h.health].ar : HEALTH[h.health].en}${p.type === "strategic" ? ` · ${t("locked", "ثابت")}` : ""}`}
                            aria-label={`${m.code} ${mName}`}
                            className="absolute top-1/2 z-[3] -translate-x-1/2 -translate-y-1/2 p-1 outline-none rtl:translate-x-1/2 focus-visible:[&>span]:ring-2 focus-visible:[&>span]:ring-ring"
                            style={{ insetInlineStart: `${pct(m.dueISO)}%` }}>
                            <span className={cn("block size-3 rotate-45 rounded-[2px] ring-2 ring-background", HEALTH[h.health].dot)} />
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </section>
          ))}
        </div>
      </div>

      {/* ── key ────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border px-4 py-3 text-[11.5px] text-muted-foreground">
        {(Object.keys(BAR) as ProjectStatus[]).map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <span className={cn("h-2 w-5 rounded-full", BAR[s].fill)} />{isAr ? STATUS_LABEL[s].ar : STATUS_LABEL[s].en}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rotate-45 rounded-[1px] bg-success" />{t("Milestone (colour = health)", "معلم (اللون = الحالة)")}</span>
        {showToday && <span className="inline-flex items-center gap-1.5"><span className="h-3 w-px bg-primary" />{t("Today", "اليوم")}</span>}
        <span className="ms-auto">{t("The filled part of a bar is the share of tasks done.", "الجزء الممتلئ من الشريط هو نسبة المهام المنجزة.")}</span>
      </div>
    </div>
  )
}
