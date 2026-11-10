/** One KPI. Route: /corporate-performance/kpis/:kpiId
 *  Header (definition, owner, unit, frequency, target, current, status), actual vs
 *  target over 2026, a period breakdown, the linked objective and an inline
 *  "Update value" form that writes to the in-memory store. */
import * as React from "react"
import { Link, useParams } from "react-router-dom"
import { cn } from "@reach/shared-core"
import { ArrowDownWideNarrow, Building2, LineChart, PencilLine, Table2, Target } from "lucide-react"

import {
  CURRENT_MONTH, FREQUENCY_LABEL, MONTHS, PERIODS, UNIT_LABEL, attainmentOf, departmentById, objectiveById,
  pillarById, scoreKpi, scoreObjective, statusOf, type Kpi, type Status,
} from "../data/performance"
import { updateKpiValue, usePerf } from "../store"
import { BASE, DetailHero, NotFound } from "../components/blocks"
import { TrendLine } from "../components/charts"
import {
  fmtCompact, fmtDate, fmtNum, fmtPct, fmtValue, fmtValueL, inputCls, usePeriod, useSimulatedLoad, useT,
} from "../components/helpers"
import {
  BackLink, CardHeading, Cell, DataGrid, EndChevron, Field, FilterSelect, GoldButton, GridRow, InfoTile,
  Notice, OutlineButton, Page, Panel, PillarChip, ProgressBar, Ring, Skeleton, SkeletonRows, Split, StatusChip,
} from "../components/kit"

/** Month indices a KPI reports on (quarterly KPIs report on the quarter's last month). */
const slotsOf = (k: Kpi) => (k.frequency === "quarterly" ? [2, 5, 8, 11] : MONTHS.map((_, i) => i))

export default function KpiDetailPage() {
  const { kpiId } = useParams()
  const { t, l, isAr } = useT()
  const { period, withPeriod } = usePeriod()
  const kpis = usePerf((s) => s.kpis)
  const loading = useSimulatedLoad()
  const k = kpis.find((x) => x.id === kpiId)

  if (!k) return <NotFound title={t("KPI not found", "المؤشر غير موجود")} />

  const s = scoreKpi(k, period.from, period.to)
  const obj = objectiveById(k.objectiveId)!
  const dept = departmentById(k.departmentId)!
  const objScore = scoreObjective(obj, kpis, period.from, period.to)
  const slots = slotsOf(k)
  const slotLabel = (m: number) => (k.frequency === "quarterly" ? l(PERIODS[Math.floor(m / 3)].short) : l(MONTHS[m]))
  const fmt = (v: number | null) => fmtValue(k.unit, v, isAr)
  const lastReported = k.actuals.reduce<number>((acc, v, i) => (v !== null ? i : acc), -1)

  return (
    <Page>
      <DetailHero
        back={<BackLink to={withPeriod(`${BASE}/objectives/${obj.id}`)}>{l(pillarById(obj.pillarId).name)}</BackLink>}
        chips={
          <>
            <PillarChip pillar={pillarById(obj.pillarId)} />
            <span className="text-[12px] text-muted-foreground">{k.code}</span>
            <StatusChip status={s.status} />
            {k.direction === "down" && (
              <span className="inline-flex h-[21px] items-center gap-1 rounded-md bg-secondary px-2 text-[10.5px] font-medium text-foreground">
                <ArrowDownWideNarrow className="size-3" />{t("Lower is better", "الأقل أفضل")}
              </span>
            )}
          </>
        }
        title={l(k.name)}
        description={l(k.definition)}
        tiles={
          <>
            <InfoTile value={l(k.owner.name)} label={t("Owner", "المسؤول")} />
            <InfoTile value={l(FREQUENCY_LABEL[k.frequency])} label={`${t("Frequency", "التكرار")} · ${l(UNIT_LABEL[k.unit])}`} />
            <InfoTile value={fmt(s.target)} label={`${t("Target", "المستهدف")} · ${l(period.short)}`} />
            <InfoTile value={fmt(s.actual)} label={`${t("Current", "الحالي")} · ${l(period.short)}`} />
          </>
        }
        legend={
          <dl className="flex min-w-[130px] flex-col gap-2.5 text-[11.5px]">
            <div className="flex justify-between gap-4"><dt className="text-muted-foreground">{t("Attainment", "نسبة التحقق")}</dt><dd className="font-medium">{fmtPct(s.attainment)}</dd></div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{t("Variance", "الفرق")}</dt>
              <dd className="font-medium" dir="ltr">{s.actual !== null && s.target !== null ? signed(k, s.actual - s.target, isAr) : "—"}</dd>
            </div>
            <div className="flex justify-between gap-4"><dt className="text-muted-foreground">{t("Last reported", "آخر رفع")}</dt><dd className="font-medium">{lastReported >= 0 ? slotLabel(lastReported) : "—"}</dd></div>
          </dl>
        }
        ring={<Ring value={loading ? null : s.progress} status={loading ? null : s.status} label={t("Progress to target", "التقدّم نحو المستهدف")} sub={t("of target", "من المستهدف")} />}
      />

      <Split
        main={
          <>
            <Panel aria-labelledby="kpi-trend">
              <CardHeading id="kpi-trend" icon={LineChart} title={t("Actual vs target — 2026", "الفعلي مقابل المستهدف — 2026")} />
              <div className="mt-4">
                {loading ? <Skeleton className="h-[300px]" /> : (
                  <TrendLine
                    labels={slots.map(slotLabel)}
                    actual={slots.map((m) => k.actuals[m])}
                    target={slots.map((m) => k.targets[m])}
                    format={(v) => fmt(v)}
                    formatAxis={(v) => fmtCompact(k.unit, v, isAr)}
                    statusAt={(i) => {
                      const a = k.actuals[slots[i]]
                      return a === null ? null : statusOf(attainmentOf(k, a, k.targets[slots[i]]))
                    }}
                    actualLabel={t("Actual", "الفعلي")}
                    targetLabel={t("Target", "المستهدف")}
                    ariaLabel={t(`${k.name.en}: actual vs target by ${k.frequency === "quarterly" ? "quarter" : "month"}, 2026`, `${k.name.ar}: الفعلي مقابل المستهدف، 2026`)}
                  />
                )}
              </div>
            </Panel>
            <Breakdown k={k} loading={loading} slots={slots} slotLabel={slotLabel} />
          </>
        }
        side={
          <>
            <UpdateValueCard key={k.id} k={k} slotLabel={slotLabel} />
            <Panel aria-labelledby="kpi-obj">
              <CardHeading id="kpi-obj" icon={Target} title={t("Linked objective", "الهدف المرتبط")} />
              <Link
                to={withPeriod(`${BASE}/objectives/${obj.id}`)}
                className="mt-[18px] flex flex-col gap-3 rounded-[10px] border border-[var(--card-ring)] bg-background p-4 outline-none transition-colors hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block text-[12px] text-muted-foreground">{obj.code} · {l(pillarById(obj.pillarId).name)}</span>
                    <span className="mt-0.5 block text-[14.5px] leading-[21px] text-foreground">{l(obj.title)}</span>
                  </span>
                  <EndChevron className="mt-1" />
                </span>
                <ProgressBar value={objScore.progress} status={objScore.status} label={l(obj.title)} />
                <span className="flex flex-wrap items-center justify-between gap-2 text-[12px] text-muted-foreground">
                  <span className="flex items-center gap-2"><StatusChip status={objScore.status} /><span className="text-[17px] text-foreground">{fmtPct(objScore.progress)}</span></span>
                  <span>{t(`This KPI carries ${k.weight}%`, `وزن هذا المؤشر ${k.weight}%`)}</span>
                </span>
              </Link>
              <Link
                to={withPeriod(`${BASE}/departments/${dept.id}`)}
                className="mt-3 flex h-16 items-center gap-3 rounded-xl px-[18px] outline-none ring-1 ring-inset ring-[var(--card-ring)] transition-colors hover:bg-secondary/40 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Building2 className="size-[19px] shrink-0 text-primary" strokeWidth={1.7} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold">{l(dept.name)}</span>
                  <span className="block truncate text-[11.5px] text-muted-foreground">{t("Department scorecard", "بطاقة أداء الإدارة")}</span>
                </span>
                <EndChevron />
              </Link>
            </Panel>
          </>
        }
      />
    </Page>
  )
}

function signed(k: Kpi, d: number, isAr: boolean) {
  const sign = d > 0 ? "+" : d < 0 ? "−" : "±"
  return `${sign}${fmtValue(k.unit, Math.abs(d), isAr)}`
}

// ── period breakdown ─────────────────────────────────────────────────────────
const TEMPLATE = "minmax(0,0.9fr) minmax(0,1.1fr) minmax(0,1.1fr) minmax(0,1.1fr) 84px 112px minmax(0,2fr)"

function Breakdown({ k, loading, slots, slotLabel }: { k: Kpi; loading: boolean; slots: number[]; slotLabel: (m: number) => string }) {
  const { t, l, isAr } = useT()
  const { period } = usePeriod()
  const total = scoreKpi(k, period.from, period.to)
  return (
    <Panel aria-labelledby="kpi-breakdown">
      <CardHeading id="kpi-breakdown" icon={Table2} title={t("Period breakdown", "التفصيل حسب الفترة")}
        actions={<span className="text-[12px] text-muted-foreground">{t("Highlighted rows are in the selected period", "الصفوف المظللة ضمن الفترة المحددة")}</span>} />
      <DataGrid
        className="mt-2" template={TEMPLATE} minWidth={860} label={t("Period breakdown", "التفصيل حسب الفترة")}
        headers={[t("Period", "الفترة"), t("Target", "المستهدف"), t("Actual", "الفعلي"), t("Variance", "الفرق"), t("Attainment", "التحقق"), t("Status", "الحالة"), t("Note", "ملاحظة")]}
      >
        {loading ? <SkeletonRows template={TEMPLATE} cols={7} rows={6} /> : (
          <>
            {slots.map((m) => {
              const a = k.actuals[m]
              const tg = k.targets[m]
              const att = a === null ? null : attainmentOf(k, a, tg)
              const st: Status | null = att === null ? null : statusOf(att)
              const inPeriod = m >= period.from && m <= period.to
              const upcoming = m > CURRENT_MONTH
              const note = k.notes[m]
              return (
                <GridRow key={m} template={TEMPLATE} className={cn("min-h-[56px] py-3", inPeriod && "bg-soft-accent/40")}>
                  <Cell className="ps-2">{slotLabel(m)}</Cell>
                  <Cell className="tabular-nums">{fmtValue(k.unit, tg, isAr)}</Cell>
                  <Cell className="tabular-nums">{fmtValue(k.unit, a, isAr)}</Cell>
                  <Cell className="tabular-nums text-muted-foreground"><span dir="ltr">{a === null ? "—" : signed(k, a - tg, isAr)}</span></Cell>
                  <Cell className="tabular-nums">{fmtPct(att)}</Cell>
                  <Cell><StatusChip status={st} label={st ? undefined : upcoming ? t("Upcoming", "قادم") : t("Not reported", "لم يُرفع")} /></Cell>
                  <Cell className="text-[12.5px] leading-[18px] text-muted-foreground">
                    {note ? <>{note.text} <span className="whitespace-nowrap text-[11.5px]">— {l(note.by)}, <span dir="ltr">{fmtDate(note.iso)}</span></span></> : ""}
                  </Cell>
                </GridRow>
              )
            })}
            <div role="row" className="grid min-h-[56px] items-center gap-x-3 bg-foreground/[0.03] py-3 text-[13.5px] font-semibold" style={{ gridTemplateColumns: TEMPLATE }}>
              <div role="cell" className="ps-2">{l(period.short)}</div>
              <div role="cell" className="tabular-nums">{fmtValue(k.unit, total.target, isAr)}</div>
              <div role="cell" className="tabular-nums">{fmtValue(k.unit, total.actual, isAr)}</div>
              <div role="cell" className="tabular-nums"><span dir="ltr">{total.actual !== null && total.target !== null ? signed(k, total.actual - total.target, isAr) : "—"}</span></div>
              <div role="cell" className="tabular-nums">{fmtPct(total.attainment)}</div>
              <div role="cell"><StatusChip status={total.status} /></div>
              <div role="cell" className="text-[12px] font-normal text-muted-foreground">
                {k.agg === "sum" ? t("Total of the reported months", "مجموع الأشهر المرفوعة")
                  : k.agg === "last" ? t("Latest reported value", "آخر قيمة مرفوعة")
                    : t("Average of the reported months", "متوسط الأشهر المرفوعة")}
              </div>
            </div>
          </>
        )}
      </DataGrid>
    </Panel>
  )
}

// ── update value form ────────────────────────────────────────────────────────
function UpdateValueCard({ k, slotLabel }: { k: Kpi; slotLabel: (m: number) => string }) {
  const { t, isAr } = useT()
  const options = slotsOf(k).filter((m) => m <= CURRENT_MONTH)
  const firstOpen = () => String(options.find((m) => k.actuals[m] === null) ?? options[options.length - 1])
  const [slot, setSlot] = React.useState(firstOpen)
  const [value, setValue] = React.useState("")
  const [note, setNote] = React.useState("")
  const [tried, setTried] = React.useState(false)
  const [saved, setSaved] = React.useState<string | null>(null)

  const m = Number(slot)
  const current = k.actuals[m]
  const num = Number(value)
  const [lo, hi] = k.unit === "pct" ? [0, 100] : k.unit === "score" ? [-100, 100] : [0, Number.POSITIVE_INFINITY]
  const error = value.trim() === ""
    ? t("Enter a value", "أدخل قيمة")
    : !Number.isFinite(num)
      ? t("Enter a number", "أدخل رقمًا")
      : num < lo || num > hi
        ? (hi === Number.POSITIVE_INFINITY ? t("Value can't be negative", "لا يمكن أن تكون القيمة سالبة") : t(`Enter a value from ${lo} to ${hi}`, `أدخل قيمة من ${lo} إلى ${hi}`))
        : null
  const suffix = k.unit === "pct" ? "%" : k.unit === "sar" ? (isAr ? "ر.س" : "SAR") : k.unit === "hours" ? (isAr ? "ساعة" : "h") : k.unit === "days" ? (isAr ? "يوم" : "days") : ""

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setTried(true)
    if (error) return
    updateKpiValue(k.id, m, num, note, fmtValueL(k.unit, num))
    setSaved(isAr
      ? `تم حفظ قيمة ${slotLabel(m)}: ${fmtValue(k.unit, num, true)}. تم تحديث الهدف ولوحة الأداء.`
      : `Saved ${slotLabel(m)}: ${fmtValue(k.unit, num, false)}. The objective and dashboard now use it.`)
    setValue(""); setNote(""); setTried(false)
  }

  return (
    <Panel aria-labelledby="kpi-update">
      <CardHeading id="kpi-update" icon={PencilLine} title={t("Update value", "تحديث القيمة")} />
      <form className="mt-[18px] flex flex-col gap-4" onSubmit={submit} noValidate>
        {saved && <Notice>{saved}</Notice>}
        <Field label={t("Period", "الفترة")} htmlFor="kpi-slot">
          <FilterSelect
            id="kpi-slot" label={k.frequency === "quarterly" ? t("Quarter", "الربع") : t("Month", "الشهر")} value={slot}
            onChange={(v) => { setSlot(v); setSaved(null) }}
            options={options.map((o) => ({
              value: String(o),
              label: `${slotLabel(o)} 2026${k.actuals[o] === null ? (isAr ? " · لم يُرفع" : " · not reported") : ` · ${fmtValue(k.unit, k.actuals[o], isAr)}`}`,
            }))}
          />
        </Field>
        <Field
          label={t("Value", "القيمة")} htmlFor="kpi-value"
          hint={current !== null ? t(`replaces ${fmtValue(k.unit, current, false)}`, `تستبدل ${fmtValue(k.unit, current, true)}`) : `${t("target", "المستهدف")} ${fmtNum(k.targets[m])}`}
          error={tried && error ? error : undefined}
        >
          <div className="relative">
            <input
              id="kpi-value" inputMode="decimal" value={value} autoComplete="off"
              onChange={(e) => { setValue(e.target.value.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))).replace(/٫/g, ".").replace(/,/g, "")); setSaved(null) }}
              aria-invalid={(tried && !!error) || undefined}
              placeholder={fmtNum(k.targets[m])}
              className={cn(inputCls(tried && !!error), "tabular-nums", suffix && "pe-14")}
              dir="ltr"
            />
            {suffix && <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-[12px] text-muted-foreground">{suffix}</span>}
          </div>
        </Field>
        <Field label={t("Note", "ملاحظة")} htmlFor="kpi-note" hint={t("optional", "اختياري")}>
          <textarea
            id="kpi-note" rows={3} maxLength={280} value={note} onChange={(e) => setNote(e.target.value)}
            placeholder={t("What drove this result?", "ما الذي أدى إلى هذه النتيجة؟")}
            className={cn(inputCls(), "h-auto resize-y py-2.5 leading-[19px]")}
          />
        </Field>
        <div className="flex flex-wrap items-center gap-3">
          <GoldButton type="submit">{t("Save value", "حفظ القيمة")}</GoldButton>
          <OutlineButton onClick={() => { setValue(""); setNote(""); setTried(false); setSaved(null); setSlot(firstOpen()) }}>{t("Reset", "إعادة تعيين")}</OutlineButton>
        </div>
      </form>
    </Panel>
  )
}
