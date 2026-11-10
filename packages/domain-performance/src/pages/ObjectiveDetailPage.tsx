/** One strategic objective. Route: /corporate-performance/objectives/:objectiveId
 *  Header (pillar, owner, period, status, progress ring), its KPIs with the
 *  weighted-average maths shown, its initiatives, and an updates feed. */
import * as React from "react"
import { useParams } from "react-router-dom"
import { cn } from "@reach/shared-core"
import { Activity, ListChecks, MessageSquareText, PencilLine, Send, Target, TrendingUp } from "lucide-react"

import {
  INITIATIVES, comparisonOf, currentUser, initiativesByRisk, kpisOf, objectiveById, pillarById,
  scoreKpi, scoreObjective, type FeedItem,
} from "../data/performance"
import { addComment, usePerf } from "../store"
import { BASE, DetailHero, InitiativeItem, NotFound } from "../components/blocks"
import { STATUS_TONE, fmtDateTime, fmtDelta, fmtPct, fmtValue, inputCls, usePeriod, useSimulatedLoad, useT } from "../components/helpers"
import {
  BackLink, CardHeading, Cell, DataGrid, EmptyState, GoldButton, GridRow, InfoTile, Initials, Legend, Panel, Page,
  PillarChip, ProgressBar, Ring, Skeleton, SkeletonRows, Split, StatusChip,
} from "../components/kit"

const TEMPLATE = "32px minmax(0,2.4fr) 64px minmax(0,1.1fr) minmax(0,1.1fr) minmax(0,1.3fr) 92px 104px"

export default function ObjectiveDetailPage() {
  const { objectiveId } = useParams()
  const { t, l, isAr } = useT()
  const { period, withPeriod } = usePeriod()
  const kpis = usePerf((s) => s.kpis)
  const feed = usePerf((s) => s.feed)
  const loading = useSimulatedLoad()
  const o = objectiveById(objectiveId)

  const m = React.useMemo(() => {
    if (!o) return null
    const cmp = comparisonOf(period, kpis)
    const list = kpisOf(kpis, o.id).map((k) => ({ k, s: scoreKpi(k, period.from, period.to) }))
    const live = list.filter((x) => x.s.progress !== null)
    const liveWeight = live.reduce((s, x) => s + x.k.weight, 0)
    return {
      cmp,
      score: scoreObjective(o, kpis, period.from, period.to),
      prev: cmp ? scoreObjective(o, kpis, cmp.from, cmp.to) : null,
      list,
      liveWeight,
      contribution: live.reduce((s, x) => s + (x.s.progress! * x.k.weight) / 100, 0),
      count: (st: string) => list.filter((x) => x.s.status === st).length,
    }
  }, [o, kpis, period])

  if (!o || !m) return <NotFound title={t("Objective not found", "الهدف غير موجود")} />

  const pillar = pillarById(o.pillarId)
  const initiatives = initiativesByRisk(INITIATIVES.filter((i) => i.objectiveId === o.id))
  const items = feed.filter((f) => f.objectiveId === o.id).sort((a, b) => b.at.localeCompare(a.at))
  const delta = m.score.progress !== null && m.prev?.progress != null ? m.score.progress - m.prev.progress : null

  return (
    <Page>
      <DetailHero
        back={<BackLink to={withPeriod(BASE)}>{t("Corporate performance", "الأداء المؤسسي")}</BackLink>}
        chips={<><PillarChip pillar={pillar} /><span className="text-[12px] text-muted-foreground">{o.code}</span><StatusChip status={m.score.status} /></>}
        title={l(o.title)}
        description={l(o.description)}
        tiles={
          <>
            <InfoTile value={l(o.owner.name)} label={l(o.owner.role)} />
            <InfoTile value={l(period.label)} label={t("Period", "الفترة")} />
            <InfoTile value={`${o.weight}%`} label={t("Weight in the strategy", "الوزن في الاستراتيجية")} />
            <InfoTile value={isAr ? `${m.list.length} مؤشرات` : `${m.list.length} KPIs`} label={t(`${m.count("on-track")} on track`, `${m.count("on-track")} على المسار`)} />
          </>
        }
        legend={
          <div className="flex flex-col gap-3">
            <Legend rows={[
              { label: t("On track", "على المسار"), value: m.count("on-track"), dot: "bg-success" },
              { label: t("At risk", "معرّض للخطر"), value: m.count("at-risk"), dot: "bg-warning" },
              { label: t("Off track", "خارج المسار"), value: m.count("off-track"), dot: "bg-error" },
            ]} />
            {delta !== null && m.cmp && (
              <span className="text-[11.5px] text-muted-foreground"><span dir="ltr">{fmtDelta(delta, isAr)}</span> {l(m.cmp.label)}</span>
            )}
          </div>
        }
        ring={<Ring value={loading ? null : m.score.progress} status={loading ? null : m.score.status} label={t("Objective progress", "تقدّم الهدف")} sub={t("progress", "التقدّم")} />}
      />

      <Split
        main={
          <>
            <Panel aria-labelledby="obj-kpis">
              <CardHeading id="obj-kpis" icon={Target} title={t("KPIs for this objective", "مؤشرات هذا الهدف")} />
              <DataGrid
                className="mt-2" template={TEMPLATE} minWidth={880} label={t("KPIs for this objective", "مؤشرات هذا الهدف")}
                headers={[
                  t("No.", "ترقيم"), t("KPI", "المؤشر"), t("Weight", "الوزن"), t("Target", "المستهدف"), t("Actual", "الفعلي"),
                  t("Progress", "التقدّم"), t("Contribution", "المساهمة"), t("Status", "الحالة"),
                ]}
              >
                {loading ? <SkeletonRows template={TEMPLATE} cols={8} rows={m.list.length} /> : (
                  <>
                    {m.list.map(({ k, s }, i) => (
                      <GridRow key={k.id} template={TEMPLATE} to={withPeriod(`${BASE}/kpis/${k.id}`)}>
                        <Cell className="text-muted-foreground">{i + 1}</Cell>
                        <Cell>
                          <span className="block truncate">{l(k.name)}</span>
                          <span className="block truncate text-[12px] text-muted-foreground">{k.code} · {l(k.owner.name)}</span>
                        </Cell>
                        <Cell className="tabular-nums">{k.weight}%</Cell>
                        <Cell className="tabular-nums">{fmtValue(k.unit, s.target, isAr)}</Cell>
                        <Cell className="tabular-nums">{fmtValue(k.unit, s.actual, isAr)}</Cell>
                        <Cell>
                          <span className="flex items-center gap-2">
                            <ProgressBar className="flex-1" value={s.progress} status={s.status} label={l(k.name)} />
                            <span className="w-10 shrink-0 text-end text-[12.5px] tabular-nums">{fmtPct(s.progress)}</span>
                          </span>
                        </Cell>
                        <Cell className="tabular-nums text-muted-foreground">
                          {s.progress === null ? "—" : isAr ? `${((s.progress * k.weight) / 100).toFixed(1)} نقطة` : `${((s.progress * k.weight) / 100).toFixed(1)} pts`}
                        </Cell>
                        <Cell><StatusChip status={s.status} /></Cell>
                      </GridRow>
                    ))}
                    <div role="row" className="grid min-h-[56px] items-center gap-x-3 bg-foreground/[0.02] py-3 text-[13.5px]" style={{ gridTemplateColumns: TEMPLATE }}>
                      <div role="cell" />
                      <div role="cell" className="font-semibold">{t("Objective progress (weighted)", "تقدّم الهدف (مرجّح)")}</div>
                      <div role="cell" className="tabular-nums text-muted-foreground">{m.liveWeight}%</div>
                      <div role="cell" className="col-span-2 text-[12px] text-muted-foreground">
                        {m.liveWeight < 100
                          ? t(`Re-weighted over the ${m.liveWeight}% of KPIs reported in this period`, `أُعيد التوزيع على ${m.liveWeight}% من المؤشرات المرفوعة في هذه الفترة`)
                          : t("Σ contribution ÷ 100% weight", "مجموع المساهمات ÷ 100% من الوزن")}
                      </div>
                      <div role="cell">
                        <span className="flex items-center gap-2">
                          <ProgressBar className="flex-1" value={m.score.progress} status={m.score.status} label={t("Objective progress", "تقدّم الهدف")} />
                          <span className="w-10 shrink-0 text-end font-semibold tabular-nums">{fmtPct(m.score.progress)}</span>
                        </span>
                      </div>
                      <div role="cell" className="font-semibold tabular-nums">{isAr ? `${m.contribution.toFixed(1)} نقطة` : `${m.contribution.toFixed(1)} pts`}</div>
                      <div role="cell"><StatusChip status={m.score.status} /></div>
                    </div>
                  </>
                )}
              </DataGrid>
            </Panel>

            <Panel id="initiatives" aria-labelledby="obj-init">
              <CardHeading
                id="obj-init" icon={ListChecks} title={t("Initiatives", "المبادرات")}
                actions={<span className="text-[12px] text-muted-foreground">{isAr ? `${initiatives.length} مبادرات · الأعلى خطرًا أولًا` : `${initiatives.length} initiatives · highest risk first`}</span>}
              />
              <div className="mt-2">
                {loading
                  ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="my-3 h-[110px]" />)
                  : initiatives.length === 0
                    ? <EmptyState icon={ListChecks} title={t("No initiatives linked yet", "لا توجد مبادرات مرتبطة بعد")} body={t("Initiatives that deliver this objective will appear here.", "ستظهر هنا المبادرات التي تحقق هذا الهدف.")} />
                    : initiatives.map((i, k) => <InitiativeItem key={i.id} i={i} showObjective={false} showStages last={k === initiatives.length - 1} />)}
              </div>
            </Panel>
          </>
        }
        side={<UpdatesFeed objectiveId={o.id} items={items} loading={loading} />}
      />
    </Page>
  )
}

const KIND_ICON = { comment: MessageSquareText, value: TrendingUp, status: Activity } as const

function UpdatesFeed({ objectiveId, items, loading }: { objectiveId: string; items: FeedItem[]; loading: boolean }) {
  const { t, l } = useT()
  const [text, setText] = React.useState("")
  const [error, setError] = React.useState(false)
  const kindLabel = {
    comment: t("Comment", "تعليق"),
    value: t("Value update", "تحديث قيمة"),
    status: t("Status change", "تغيير حالة"),
  }
  const post = () => {
    if (!text.trim()) { setError(true); return }
    addComment(objectiveId, text)
    setText("")
    setError(false)
  }
  return (
    <Panel aria-labelledby="obj-feed">
      <CardHeading id="obj-feed" icon={PencilLine} title={t("Updates & notes", "التحديثات والملاحظات")} />
      <div className="mt-[18px] flex flex-col gap-3 rounded-[10px] border border-[var(--card-ring)] bg-background p-3">
        <div className="flex items-center gap-2">
          <Initials text={currentUser.initials} className="size-7 text-[10px]" />
          <span className="text-[12.5px] text-muted-foreground">{l(currentUser.name)}</span>
        </div>
        <label htmlFor="obj-comment" className="sr-only">{t("Add an update", "أضف تحديثًا")}</label>
        <textarea
          id="obj-comment" rows={3} value={text} maxLength={500}
          onChange={(e) => { setText(e.target.value); if (error) setError(false) }}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) post() }}
          placeholder={t("Share progress, a risk or a decision…", "شارك تقدّمًا أو خطرًا أو قرارًا…")}
          aria-invalid={error || undefined}
          className={cn(inputCls(error), "h-auto resize-y py-2.5 leading-[19px]")}
        />
        <div className="flex items-center justify-between gap-2">
          <span className={cn("text-[11.5px]", error ? "text-error" : "text-muted-foreground")}>
            {error ? t("Write something first.", "اكتب شيئًا أولًا.") : `${text.length}/500`}
          </span>
          <GoldButton size="sm" onClick={post}><Send className="size-3.5 rtl:-scale-x-100" />{t("Post update", "نشر التحديث")}</GoldButton>
        </div>
      </div>

      <ol className="mt-4 flex flex-col">
        {loading && Array.from({ length: 3 }).map((_, i) => <li key={i}><Skeleton className="my-2 h-16" /></li>)}
        {!loading && items.length === 0 && (
          <li><EmptyState icon={MessageSquareText} title={t("No updates yet", "لا توجد تحديثات بعد")} body={t("Post the first update for this objective.", "انشر أول تحديث لهذا الهدف.")} /></li>
        )}
        {!loading && items.map((f, i) => {
          const Icon = KIND_ICON[f.kind]
          return (
            <li key={f.id} className={cn("flex gap-3 py-3.5", i < items.length - 1 && "border-b border-input")}>
              <Initials text={f.author.initials} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                  <span className="text-[13.5px] text-foreground">{l(f.author.name)}</span>
                  <span className="text-[11.5px] text-muted-foreground" dir="ltr">{fmtDateTime(f.at)}</span>
                </div>
                <span className={cn("mt-0.5 inline-flex items-center gap-1 text-[11.5px]", f.kind === "status" ? STATUS_TONE["at-risk"].text : "text-primary")}>
                  <Icon className="size-3" strokeWidth={1.8} />
                  {kindLabel[f.kind]}
                </span>
                <p className="mt-1 whitespace-pre-line text-[12.5px] leading-[19px] text-muted-foreground">{l(f.text)}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </Panel>
  )
}
