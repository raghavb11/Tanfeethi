import { useSearchParams } from "react-router-dom"
import { Flame, Footprints, HeartPulse, LayoutGrid, Medal, Trophy } from "lucide-react"
import { cn } from "@reach/shared-core"

import { Card, CardTitle, PageBody } from "../components/wijha"
import { useT } from "../components/i18n"
import { HealthTileView } from "../components/HealthTile"
import { fmt, leaderboards, periodTiles, stepReports, type LeaderRow, type Period } from "../data/mock/wellness"

const medalTone: Record<number, string> = {
  1: "text-primary",
  2: "text-muted-foreground",
  3: "text-rose-gold",
}

/** صحتي — steps leaderboard with monthly / weekly / daily tabs.
 *  Figma 3056:6882 (monthly), 3056:7394 (weekly), 3056:7978 (daily).
 *  Route: /services/health (?period=monthly|weekly|daily). */
export default function StepsLeaderboardPage() {
  const { t, isAr } = useT()
  const [params, setParams] = useSearchParams()
  const period = (["monthly", "weekly", "daily"].includes(params.get("period") ?? "") ? params.get("period") : "monthly") as Period
  const report = stepReports[period]
  const board = leaderboards[period]

  const tabs: { value: Period; label: string }[] = [
    { value: "daily", label: t("Daily", "يومي") },
    { value: "weekly", label: t("Weekly", "أسبوعي") },
    { value: "monthly", label: t("Monthly", "شهري") },
  ]

  return (
    <PageBody>
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <CardTitle icon={HeartPulse}>{t("My Health", "صحتي")}</CardTitle>
          {/* period tabs: 36px, 3px padding, radius 9 */}
          <div role="tablist" className="inline-flex h-9 items-center gap-0.5 rounded-[9px] bg-card p-[3px] shadow-[inset_0_0_0_1px_var(--card-ring)]">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={period === tab.value}
                onClick={() => setParams({ period: tab.value }, { replace: true })}
                className={cn(
                  "h-[30px] w-[68px] rounded-md transition-colors",
                  period === tab.value ? "bg-soft-accent text-[15px] font-semibold text-primary" : "text-[13px] text-foreground hover:bg-secondary/60",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_448px]">
          {/* tiles + chart */}
          <div className="min-w-0 space-y-6 pt-4">
            <div className="grid gap-6 sm:grid-cols-2">
              {periodTiles[period].map((tile, i) => <HealthTileView key={`${period}-${i}`} tile={tile} />)}
            </div>

            {report && (
              <section className="rounded-xl bg-background px-6 py-5">
                <CardTitle icon={HeartPulse}>{t("My step reports", "تقارير خطواتي")}</CardTitle>
                <div className="mt-4 space-y-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10.9px] font-semibold leading-[12.5px] text-foreground">{isAr ? report.titleAr : report.title}</span>
                    <span className="text-[12.5px] font-semibold leading-[12.5px] text-primary">{fmt(report.total)}</span>
                  </div>
                  <div className="flex h-[151px] items-end justify-between gap-2.5 px-0 sm:px-6" role="img"
                    aria-label={t("Steps per period", "الخطوات لكل فترة")}>
                    {report.bars.map((b) => (
                      <div key={`${b.label}-${b.labelAr}`} className="flex h-full min-w-0 max-w-[46px] flex-1 flex-col items-center gap-2" title={`${isAr ? b.labelAr : b.label}`}>
                        <div className={cn("relative w-full flex-1 overflow-hidden rounded-md", b.current ? "bg-primary/25" : "bg-secondary")}>
                          <div
                            className={cn("absolute inset-x-0 bottom-0 rounded-md",
                              b.current || b.status === "partial" ? "bg-primary" : b.status === "low" ? "bg-error" : "bg-success")}
                            style={{ height: `${b.value}%` }}
                          />
                        </div>
                        <span className={cn("whitespace-nowrap text-[11.5px] leading-[11.5px]", b.current ? "font-semibold text-primary" : "text-foreground")}>
                          {isAr ? b.labelAr : b.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex h-[22px] items-center rounded-md bg-success-fill px-2 text-[11px] font-semibold text-success" dir="ltr">
                      +{report.changePct}%
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {isAr ? report.compareAr : report.compare} · {fmt(report.compareSteps)} {t("steps", "خطوة")}
                    </span>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* أفضل الموظفين */}
          <section className="panel rounded-xl px-4 py-5">
            <CardTitle icon={period === "monthly" ? Trophy : LayoutGrid}>{t("Top employees", "أفضل الموظفين")}</CardTitle>
            <ol className="mt-[18px] flex max-h-[712px] flex-col gap-3 overflow-y-auto pe-1 [scrollbar-color:var(--foreground)_var(--secondary)] [scrollbar-width:thin]">
              {board.map((r) => <LeaderItem key={r.rank} r={r} />)}
            </ol>
          </section>
        </div>
      </Card>
    </PageBody>
  )
}

function LeaderItem({ r }: { r: LeaderRow }) {
  const { t, isAr } = useT()
  return (
    <li
      aria-current={r.me ? "true" : undefined}
      className={cn(
        "flex min-h-[88px] items-center gap-3 rounded-[10px] border px-4 py-4",
        r.me ? "border-primary bg-primary/20" : "border-[var(--card-ring)] bg-background",
      )}
    >
      <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary text-[13px] font-semibold text-foreground">
        {r.initials}
      </span>
      <div className="min-w-0 flex-1 space-y-3">
        <div className="truncate text-[14.5px] leading-[21.75px] text-foreground">
          {isAr ? r.nameAr : r.name}
          {r.me && <span className="ms-2 text-[11px] text-primary">{t("(you)", "(أنت)")}</span>}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pe-2 text-[12.5px] leading-[18.75px] text-foreground">
          <span className="inline-flex items-center gap-2">
            <Footprints className="size-3.5 text-primary" />
            {fmt(r.steps)} {t("steps", "خطوة")}
          </span>
          <span className="inline-flex items-center gap-2">
            <Flame className="size-3.5 text-error" />
            {fmt(r.calories)} {t("kcal", "سعرة حرارية")}
          </span>
        </div>
      </div>
      {r.rank <= 3 ? (
        <span className={cn("relative inline-flex h-14 w-[38px] shrink-0 items-center justify-center", medalTone[r.rank])} aria-label={`#${r.rank}`}>
          <Medal className="size-9" strokeWidth={1.4} />
          <span className="absolute bottom-[13px] text-[11px] font-semibold">{r.rank}</span>
        </span>
      ) : (
        <span className="shrink-0 text-[40px] font-normal leading-none text-muted-foreground tabular-nums">{r.rank}</span>
      )}
    </li>
  )
}
