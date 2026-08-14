import * as React from "react"
import { motion } from "framer-motion"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Badge, Button, Card } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  ArrowLeft, Banknote, Building2, CalendarClock, ChevronRight, Download, Landmark,
  Mail, Printer, TrendingUp, Wallet,
} from "lucide-react"

import { emp } from "../data/mock/center"
import { money, PAYSLIPS, type Payslip, payment, totals, ytd } from "../data/mock/payslip"

export default function PayslipPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()

  // ?id=<slip> so the Employee Center card and search can deep-link a month
  const [params, setParams] = useSearchParams()
  const wanted = params.get("id")
  const selected: Payslip = PAYSLIPS.find((p) => p.id === wanted) ?? PAYSLIPS.find((p) => p.status === "Paid")!
  const select = (id: string) => setParams({ id }, { replace: true })

  const tot = totals(selected)
  const year = ytd()
  const grossPct = (n: number) => (tot.gross ? (n / tot.gross) * 100 : 0)

  return (
    <main className="@container mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
      {/* header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <button onClick={() => navigate("/employee")}
            className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />{t("Employee Center", "مركز الموظف")}
          </button>
          <div className="flex items-center gap-2 text-primary">
            <Wallet className="size-5" />
            <span className="text-xs font-semibold uppercase tracking-[0.14em]">{t("Payroll", "الرواتب")}</span>
          </div>
          <h1 className="mt-2 font-heading text-[28px] font-bold leading-tight tracking-tight sm:text-[32px]">{t("Payslips", "كشوف الرواتب")}</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">{t("Your monthly pay, broken down — and everything paid so far this year.", "راتبك الشهري بالتفصيل — وكل ما دُفع هذا العام.")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="gap-1.5"><Printer className="size-4" />{t("Print", "طباعة")}</Button>
          <Button className="gap-1.5"><Download className="size-4" />{t("Download PDF", "تنزيل PDF")}</Button>
        </div>
      </div>

      {/* year to date */}
      <div className="mb-6 grid grid-cols-2 gap-3 @3xl:grid-cols-4">
        <Stat icon={TrendingUp} value={money(year.gross, isAr)} label={t("Gross year to date", "الإجمالي منذ بداية العام")} tone="text-primary" />
        <Stat icon={Landmark} value={money(year.deducted, isAr)} label={t("Deductions YTD", "الخصومات منذ بداية العام")} tone="text-rose-500" />
        <Stat icon={Banknote} value={money(year.net, isAr)} label={t("Net paid YTD", "الصافي المدفوع")} tone="text-emerald-500" />
        <Stat icon={CalendarClock} value={String(year.months)} label={t("Months paid", "أشهر مدفوعة")} tone="text-sky-500" />
      </div>

      <div className="grid gap-5 @5xl:grid-cols-[minmax(0,1fr)_300px]">
        {/* ── the slip ── */}
        <div className="min-w-0">
          <motion.div key={selected.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <Card className="overflow-hidden p-0">
              {/* slip header */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border bg-muted/20 p-5">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">{t("Pay period", "فترة الراتب")}</div>
                  <div className="mt-0.5 font-heading text-[20px] font-bold leading-tight">{isAr ? selected.monthAr : selected.month}</div>
                  <div className="mt-1 text-[12px] text-muted-foreground">
                    {selected.status === "Paid" ? t("Paid", "دُفع") : t("Expected", "متوقع")} {isAr ? selected.payDateAr : selected.payDate}
                  </div>
                </div>
                <Badge variant="outline" className={cn("text-[10px]", selected.status === "Paid"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400")}>
                  {isAr ? selected.statusAr : selected.status}
                </Badge>
              </div>

              {/* employee strip */}
              <div className="grid gap-x-6 gap-y-2 border-b border-border/60 p-5 @xl:grid-cols-3">
                <Field label={t("Employee", "الموظف")} value={isAr ? emp.nameAr : emp.name} />
                <Field label={t("Employee ID", "الرقم الوظيفي")} value={emp.empId} />
                <Field label={t("Job title", "المسمى الوظيفي")} value={isAr ? emp.titleAr : emp.title} />
                <Field label={t("Department", "الإدارة")} value={isAr ? emp.departmentAr : emp.department} />
                <Field label={t("Grade", "الدرجة")} value={isAr ? emp.gradeAr : emp.grade} />
                <Field label={t("Location", "الموقع")} value={isAr ? emp.locationAr : emp.location} />
              </div>

              {/* earnings / deductions */}
              <div className="grid @2xl:grid-cols-2">
                <LineGroup title={t("Earnings", "المستحقات")} lines={selected.earnings} isAr={isAr} tone="earning" total={tot.gross} totalLabel={t("Gross pay", "إجمالي الراتب")} />
                <div className="border-t border-border/60 @2xl:border-s @2xl:border-t-0">
                  <LineGroup title={t("Deductions", "الاستقطاعات")} lines={selected.deductions} isAr={isAr} tone="deduction" total={tot.deducted} totalLabel={t("Total deductions", "إجمالي الاستقطاعات")} />
                </div>
              </div>

              {/* net */}
              <div className="border-t border-border bg-primary/[0.05] p-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">{t("Net pay", "صافي الراتب")}</div>
                    <div className="metal-text mt-1 text-[30px] font-bold tabular-nums leading-none">{money(tot.net, isAr)}</div>
                  </div>
                  <div className="text-[12px] text-muted-foreground">
                    {money(tot.gross, isAr)} − {money(tot.deducted, isAr)}
                  </div>
                </div>
                {/* gross split */}
                <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary" style={{ width: `${grossPct(tot.net)}%` }} />
                  <div className="h-full bg-rose-500/60" style={{ width: `${grossPct(tot.deducted)}%` }} />
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" />{t("Take home", "الصافي")} {Math.round(grossPct(tot.net))}%</span>
                  <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-rose-500/60" />{t("Deducted", "مستقطع")} {Math.round(grossPct(tot.deducted))}%</span>
                </div>
              </div>

              {/* payment */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border p-5 text-[12px]">
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <Building2 className="size-3.5" />{isAr ? payment.bankAr : payment.bank}
                </span>
                <span className="font-mono text-muted-foreground">{payment.iban}</span>
                <span className="text-muted-foreground">{isAr ? payment.methodAr : payment.method}</span>
                <a href="mailto:payroll@altanfeethi.com.sa" className="ms-auto inline-flex items-center gap-1.5 font-medium text-primary hover:underline">
                  <Mail className="size-3.5" />{t("Query this payslip", "استفسار عن الكشف")}
                </a>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* ── history ── */}
        <div className="@5xl:sticky @5xl:top-6 @5xl:self-start">
          <Card className="overflow-hidden p-0">
            <div className="border-b border-border px-4 py-3">
              <h2 className="font-heading text-[14px] font-semibold">{t("Payslip history", "سجل الكشوف")}</h2>
            </div>
            <div className="max-h-[460px] overflow-y-auto">
              {PAYSLIPS.map((p) => {
                const on = p.id === selected.id
                const n = totals(p).net
                return (
                  <button key={p.id} onClick={() => select(p.id)} aria-pressed={on}
                    className={cn("flex w-full items-center gap-3 border-b border-border/60 px-4 py-2.5 text-start transition-colors last:border-0",
                      on ? "bg-primary/[0.07]" : "hover:bg-primary/[0.04]")}>
                    <span className="min-w-0 flex-1">
                      <span className={cn("block truncate text-[12.5px]", on ? "font-semibold text-foreground" : "font-medium")}>{isAr ? p.monthAr : p.month}</span>
                      <span className="block text-[10.5px] text-muted-foreground">
                        {p.status === "Paid" ? (isAr ? p.payDateAr : p.payDate) : t("Processing", "قيد المعالجة")}
                      </span>
                    </span>
                    <span className="shrink-0 text-end">
                      <span className="block text-[12px] font-semibold tabular-nums">{n.toLocaleString("en-US")}</span>
                      <span className="block text-[9.5px] text-muted-foreground/70">{isAr ? "ر.س" : "SAR"}</span>
                    </span>
                    <ChevronRight className={cn("size-3.5 shrink-0 text-muted-foreground/40", isAr && "rotate-180")} />
                  </button>
                )
              })}
            </div>
          </Card>

          <Card className="mt-4 p-4">
            <h2 className="font-heading text-[14px] font-semibold">{t("Related", "ذات صلة")}</h2>
            <div className="mt-2 space-y-1">
              <LinkRow label={t("Benefits & allowances", "المزايا والبدلات")} onClick={() => navigate("/benefits")} isAr={isAr} />
              <LinkRow label={t("Salary certificate", "شهادة راتب")} onClick={() => navigate("/services")} isAr={isAr} />
              <LinkRow label={t("Employee Center", "مركز الموظف")} onClick={() => navigate("/employee")} isAr={isAr} />
            </div>
          </Card>
        </div>
      </div>
    </main>
  )
}

function LineGroup({ title, lines, isAr, tone, total, totalLabel }: {
  title: string; lines: { label: string; labelAr: string; amount: number; note?: string; noteAr?: string }[]
  isAr: boolean; tone: "earning" | "deduction"; total: number; totalLabel: string
}) {
  const neg = tone === "deduction"
  return (
    <div className="p-5">
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">{title}</div>
      <dl className="space-y-2">
        {lines.map((l) => (
          <div key={l.label} className="flex items-baseline justify-between gap-3 border-b border-border/40 pb-2 last:border-0">
            <dt className="min-w-0">
              <span className="block truncate text-[13px]">{isAr ? l.labelAr : l.label}</span>
              {(l.note || l.noteAr) && <span className="block text-[10.5px] text-muted-foreground/70">{isAr ? l.noteAr : l.note}</span>}
            </dt>
            <dd className={cn("shrink-0 text-[13px] font-semibold tabular-nums", neg ? "text-rose-500" : "text-foreground")}>
              {neg ? "−" : ""}{l.amount.toLocaleString("en-US")}
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-border pt-2.5">
        <span className="text-[12px] font-semibold text-muted-foreground">{totalLabel}</span>
        <span className={cn("text-[15px] font-bold tabular-nums", neg ? "text-rose-500" : "text-foreground")}>
          {neg ? "−" : ""}{total.toLocaleString("en-US")}
        </span>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/55">{label}</div>
      <div className="truncate text-[12.5px] font-medium">{value}</div>
    </div>
  )
}

function LinkRow({ label, onClick, isAr }: { label: string; onClick: () => void; isAr: boolean }) {
  return (
    <button onClick={onClick} className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-start text-[12.5px] transition-colors hover:bg-primary/[0.06] hover:text-primary">
      {label}<ChevronRight className={cn("size-3.5 text-muted-foreground/50", isAr && "rotate-180")} />
    </button>
  )
}

function Stat({ icon: Icon, value, label, tone }: {
  icon: React.ComponentType<{ className?: string }>; value: string; label: string; tone: string
}) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10", tone)}><Icon className="size-5" /></span>
      <div className="min-w-0">
        <div className={cn("truncate text-[17px] font-bold tabular-nums leading-none", tone)}>{value}</div>
        <div className="mt-1 text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground/60">{label}</div>
      </div>
    </Card>
  )
}
