import { useSearchParams } from "react-router-dom"
import * as React from "react"
import { HeartPulse, Trophy } from "lucide-react"
import { cn } from "@reach/shared-core"

import { Card, CardTitle, PageBody } from "../components/wijha"
import { useT } from "../components/i18n"
import { HealthTileView } from "../components/HealthTile"
import { FlameIcon, FootprintsIcon, GridIcon } from "../components/kpi-icons"
import medal1 from "../assets/leaderboard/medal-1.png"
import medal2 from "../assets/leaderboard/medal-2.png"
import medal3 from "../assets/leaderboard/medal-3.png"
import avatar1 from "../assets/leaderboard/avatar-1.png"
import avatar2 from "../assets/leaderboard/avatar-2.png"
import avatar3 from "../assets/leaderboard/avatar-3.png"
import avatar4 from "../assets/leaderboard/avatar-4.png"
import avatar5 from "../assets/leaderboard/avatar-5.png"
import avatar6 from "../assets/leaderboard/avatar-6.png"
import avatar7 from "../assets/leaderboard/avatar-7.png"
import { fmt, leaderboards, periodTiles, stepReports, type LeaderRow, type Period } from "../data/mock/wellness"

/** Medal artwork (monthly tab only — weekly/daily show plain ranks) and the sample portraits, taken 1:1 from the Figma frame (3056:6882). */
const medalArt: Record<number, string> = { 1: medal1, 2: medal2, 3: medal3 }
const avatars = [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6, avatar7]

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
                  "h-[30px] w-[68px] rounded-[6px] transition-colors",
                  period === tab.value ? "bg-soft-accent text-[15px] font-semibold text-primary" : "text-[13px] text-muted-foreground hover:bg-secondary/60",
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
              <section className="rounded-[12px] bg-background px-6 py-5">
                <CardTitle icon={HeartPulse}>{t("My step reports", "تقارير خطواتي")}</CardTitle>
                <div className="mt-4 space-y-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10.9px] font-semibold leading-[12.5px] text-foreground">{isAr ? report.titleAr : report.title}</span>
                    <span className="text-[12.5px] font-semibold leading-[12.5px] text-primary">{fmt(report.total)}</span>
                  </div>
                  {/* 12 bars × 46px, 6px apart (Figma); tracks Shape/Fill/Secondary @80%, the
                      current period gold @15%; fills = Status/x/Progress bar. */}
                  <div className="flex h-[151px] items-end justify-between gap-1.5 px-0 sm:px-6" role="img"
                    aria-label={t("Steps per period", "الخطوات لكل فترة")}>
                    {report.bars.map((b) => (
                      <div key={`${b.label}-${b.labelAr}`} className="flex h-full min-w-0 max-w-[46px] flex-1 flex-col items-center gap-2" title={`${isAr ? b.labelAr : b.label}`}>
                        <div className={cn("relative w-full flex-1 overflow-hidden rounded-[6px]", b.current ? "bg-primary/15" : "bg-secondary/80")}>
                          <div
                            className={cn("absolute inset-x-0 bottom-0 rounded-[6px]",
                              b.current || b.status === "partial" ? "bg-primary"
                                : b.status === "low" ? "bg-[rgba(180,35,24,0.7)] dark:bg-[rgba(209,79,69,0.9)]"
                                : "bg-[rgba(6,118,71,0.7)] dark:bg-[rgba(26,173,112,0.9)]")}
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
                    <span className="inline-flex h-[30px] min-w-[46px] items-center justify-center rounded-[6px] bg-success-fill px-1.5 text-[12.5px] text-success" dir="ltr">
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

          {/* أفضل الموظفين — card 16/20, list beside a 4px scroll track (thumb 212px) */}
          <section className="panel rounded-[12px] px-4 py-5">
            <CardTitle icon={period === "monthly" ? Trophy : GridIcon}>{t("Top employees", "أفضل الموظفين")}</CardTitle>
            <Leaderboard rows={board} medals={period === "monthly"} />
          </section>
        </div>
      </Card>
    </PageBody>
  )
}

const THUMB = 212

/** The list scrolls inside 712px; the design draws its own track + fixed-size thumb
 *  at the end side, so the native scrollbar is hidden and the thumb follows scrollTop. */
function Leaderboard({ rows, medals }: { rows: LeaderRow[]; medals: boolean }) {
  const ref = React.useRef<HTMLOListElement>(null)
  const [top, setTop] = React.useState(0)
  const [trackH, setTrackH] = React.useState(712)
  const sync = React.useCallback(() => {
    const el = ref.current
    if (!el) return
    setTrackH(el.clientHeight)
    const range = el.scrollHeight - el.clientHeight
    setTop(range > 0 ? (el.scrollTop / range) * Math.max(0, el.clientHeight - THUMB) : 0)
  }, [])
  React.useLayoutEffect(sync, [sync, rows])
  return (
    <div className="mt-[18px] flex gap-4">
      <ol ref={ref} onScroll={sync}
        className="flex max-h-[712px] min-w-0 flex-1 flex-col gap-3 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {rows.map((r, i) => <LeaderItem key={r.rank} r={r} avatar={avatars[i % avatars.length]} medal={medals && r.rank <= 3} />)}
      </ol>
      <div aria-hidden className="relative w-1 shrink-0 rounded-[2px] bg-secondary" style={{ height: trackH }}>
        <span className="absolute inset-x-0 rounded-[2px] bg-foreground" style={{ top, height: Math.min(THUMB, trackH) }} />
      </div>
    </div>
  )
}

/** Row (Figma 3056:7165): radius 10, Card/Stroke/On-Color, 16px vertical padding,
 *  16px at the start / 12px (medal) or 16px (rank) at the end; 44px portrait, name 14.5, stats 12.5 muted,
 *  37.7×56 medal or a 40px rank at the end. */
function LeaderItem({ r, avatar, medal }: { r: LeaderRow; avatar: string; medal: boolean }) {
  const { t, isAr } = useT()
  return (
    <li
      aria-current={r.me ? "true" : undefined}
      className={cn(
        "flex shrink-0 items-center gap-3 rounded-[10px] border py-4 ps-4", medal ? "pe-3" : "pe-4",
        r.me ? "border-primary bg-primary/20" : "border-foreground/[0.09] bg-background",
      )}
    >
      <img src={avatar} alt="" className="size-11 shrink-0 rounded-full object-cover" />
      <div className="min-w-0 flex-1 space-y-3">
        <div className="truncate pb-[0.75px] text-[14.5px] leading-[21.75px] text-foreground">
          {isAr ? r.nameAr : r.name}
          {r.me && <span className="ms-2 text-[11px] text-primary">{t("(you)", "(أنت)")}</span>}
        </div>
        {/* Items shrink and wrap their own text (Figma: "250,784 / خطوة" beside a wide rank). */}
        <div className="flex items-center gap-x-4 pe-2 text-[12.5px] leading-[18.75px] text-muted-foreground">
          <span className="flex min-w-0 items-center gap-2">
            <FootprintsIcon className="shrink-0 text-primary" />
            <span className="min-w-0">{fmt(r.steps)} {t("steps", "خطوة")}</span>
          </span>
          <span className="flex min-w-0 items-center gap-2">
            <FlameIcon className="shrink-0 text-error" />
            <span className="min-w-0">{fmt(r.calories)} {t("kcal", "سعرة حرارية")}</span>
          </span>
        </div>
      </div>
      {medal ? (
        <img src={medalArt[r.rank]} alt={`#${r.rank}`} className="h-14 w-[38px] shrink-0" />
      ) : (
        // Figma: 40px regular with a soft Text/Primary → Page fill gradient (≈62%→54% on the glyph).
        <span className="shrink-0 bg-gradient-to-b from-foreground/[0.66] to-foreground/[0.5] bg-clip-text text-[40px] font-normal leading-[51px] text-transparent tabular-nums">{r.rank}</span>
      )}
    </li>
  )
}
