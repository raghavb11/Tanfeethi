import * as React from "react"
import { motion } from "framer-motion"
import { useNavigate, useSearchParams } from "react-router-dom"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  ArrowLeft, Banknote, Building2, CalendarClock, ChevronRight, Download, History, Landmark,
  Link2, Mail, Printer, TrendingUp, Wallet,
} from "lucide-react"

import { emp } from "../data/mock/center"
import { money, PAYSLIPS, type Payslip, payment, totals, ytd } from "../data/mock/payslip"
import { Chip, Empty, GoldButton, IconBadge, OutlineButton, Page, SectionCard } from "../components/wijha"

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
    <Page className="@container space-y-6">
      {/* toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={() => navigate("/employee")}
          className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="size-4 rtl:rotate-180" />{t("Employee Center", "مركز الموظف")}
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <OutlineButton><Printer className="size-4" />{t("Print", "طباعة")}</OutlineButton>
          <GoldButton><Download className="size-4" />{t("Download PDF", "تنزيل PDF")}</GoldButton>
        </div>
      </div>

      {/* year to date */}
      <div className="grid grid-cols-2 gap-3 @3xl:grid-cols-4">
        <Stat icon={TrendingUp} value={money(year.gross, isAr)} label={t("Gross year to date", "الإجمالي منذ بداية العام")} tone="text-primary" />
        <Stat icon={Landmark} value={money(year.deducted, isAr)} label={t("Deductions YTD", "الخصومات منذ بداية العام")} tone="text-error" />
        <Stat icon={Banknote} value={money(year.net, isAr)} label={t("Net paid YTD", "الصافي المدفوع")} tone="text-success" />
        <Stat icon={CalendarClock} value={String(year.months)} label={t("Months paid", "أشهر مدفوعة")} tone="text-info" />
      </div>

      <div className="grid gap-6 @5xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* ── the slip ── */}
        <div className="min-w-0">
          <motion.div key={selected.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <section className="panel overflow-hidden rounded-xl">
              {/* slip header */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border p-5 sm:px-6">
                <div>
                  <div className="text-[12.5px] text-muted-foreground">{t("Pay period", "فترة الراتب")}</div>
                  <div className="mt-0.5 text-[20px] font-medium leading-tight">{isAr ? selected.monthAr : selected.month}</div>
                  <div className="mt-1 text-[12.5px] text-muted-foreground">
                    {selected.status === "Paid" ? t("Paid", "دُفع") : t("Expected", "متوقع")} {isAr ? selected.payDateAr : selected.payDate}
                  </div>
                </div>
                <Chip tone={selected.status === "Paid" ? "success" : "warning"}>
                  {isAr ? selected.statusAr : selected.status}
                </Chip>
              </div>

              {/* employee strip */}
              <div className="grid gap-x-6 gap-y-3 border-b border-border p-5 sm:px-6 @xl:grid-cols-3">
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
                <div className="border-t border-border @2xl:border-s @2xl:border-t-0">
                  <LineGroup title={t("Deductions", "الاستقطاعات")} lines={selected.deductions} isAr={isAr} tone="deduction" total={tot.deducted} totalLabel={t("Total deductions", "إجمالي الاستقطاعات")} />
                </div>
              </div>

              {/* net */}
              <div className="border-t border-border bg-soft-accent/60 p-5 sm:px-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <div className="text-[12.5px] text-muted-foreground">{t("Net pay", "صافي الراتب")}</div>
                    <div className="mt-1 text-[30px] font-semibold tabular-nums leading-none text-primary">{money(tot.net, isAr)}</div>
                  </div>
                  <div className="text-[12.5px] text-muted-foreground">
                    {money(tot.gross, isAr)} − {money(tot.deducted, isAr)}
                  </div>
                </div>
                {/* gross split */}
                <div className="mt-4 flex h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full bg-primary" style={{ width: `${grossPct(tot.net)}%` }} />
                  <div className="h-full bg-error/70" style={{ width: `${grossPct(tot.deducted)}%` }} />
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" />{t("Take home", "الصافي")} {Math.round(grossPct(tot.net))}%</span>
                  <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-error/70" />{t("Deducted", "مستقطع")} {Math.round(grossPct(tot.deducted))}%</span>
                </div>
              </div>

              {/* payment */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border p-5 text-[12.5px] sm:px-6">
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <Building2 className="size-3.5" />{isAr ? payment.bankAr : payment.bank}
                </span>
                <span className="font-mono text-muted-foreground" dir="ltr">{payment.iban}</span>
                <span className="text-muted-foreground">{isAr ? payment.methodAr : payment.method}</span>
                <a href="mailto:payroll@altanfeethi.com.sa" className="ms-auto inline-flex items-center gap-1.5 font-medium text-primary hover:underline">
                  <Mail className="size-3.5" />{t("Query this payslip", "استفسار عن الكشف")}
                </a>
              </div>
            </section>
          </motion.div>
        </div>

        {/* ── history ── */}
        <div className="@5xl:sticky @5xl:top-6 @5xl:self-start">
          <SectionCard icon={History} title={t("Payslip history", "سجل الكشوف")} bodyClassName="-mx-4 sm:-mx-6">
            {PAYSLIPS.length === 0 ? (
              <Empty icon={Wallet} title={t("No payslips yet", "لا توجد كشوف بعد")} />
            ) : (
              <div className="max-h-[460px] overflow-y-auto">
                {PAYSLIPS.map((p) => {
                  const on = p.id === selected.id
                  const n = totals(p).net
                  return (
                    <button key={p.id} type="button" onClick={() => select(p.id)} aria-pressed={on}
                      className={cn("flex w-full items-center gap-3 border-b border-border px-4 py-3 text-start transition-colors last:border-0 sm:px-6",
                        on ? "bg-soft-accent" : "hover:bg-soft-accent/40")}>
                      <span className="min-w-0 flex-1">
                        <span className={cn("block truncate text-[14px]", on ? "font-medium text-primary" : "text-foreground")}>{isAr ? p.monthAr : p.month}</span>
                        <span className="block text-[12px] text-muted-foreground">
                          {p.status === "Paid" ? (isAr ? p.payDateAr : p.payDate) : t("Processing", "قيد المعالجة")}
                        </span>
                      </span>
                      <span className="shrink-0 text-end">
                        <span className="block text-[13px] font-semibold tabular-nums">{n.toLocaleString("en-US")}</span>
                        <span className="block text-[11px] text-muted-foreground">{isAr ? "ر.س" : "SAR"}</span>
                      </span>
                      <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/50 rtl:rotate-180" />
                    </button>
                  )
                })}
              </div>
            )}
          </SectionCard>

          <SectionCard icon={Link2} title={t("Related", "ذات صلة")} className="mt-6">
            <div className="space-y-1">
              <LinkRow label={t("Benefits & allowances", "المزايا والبدلات")} onClick={() => navigate("/benefits")} />
              <LinkRow label={t("Salary certificate", "شهادة راتب")} onClick={() => navigate("/services")} />
              <LinkRow label={t("Employee Center", "مركز الموظف")} onClick={() => navigate("/employee")} />
            </div>
          </SectionCard>
        </div>
      </div>
    </Page>
  )
}

function LineGroup({ title, lines, isAr, tone, total, totalLabel }: {
  title: string; lines: { label: string; labelAr: string; amount: number; note?: string; noteAr?: string }[]
  isAr: boolean; tone: "earning" | "deduction"; total: number; totalLabel: string
}) {
  const neg = tone === "deduction"
  return (
    <div className="p-5 sm:px-6">
      <div className="mb-3 text-[14.5px] font-medium">{title}</div>
      <dl className="space-y-2">
        {lines.map((l) => (
          <div key={l.label} className="flex items-baseline justify-between gap-3 border-b border-border pb-2 last:border-0">
            <dt className="min-w-0">
              <span className="block truncate text-[13px]">{isAr ? l.labelAr : l.label}</span>
              {(l.note || l.noteAr) && <span className="block text-[12px] text-muted-foreground">{isAr ? l.noteAr : l.note}</span>}
            </dt>
            <dd className={cn("shrink-0 text-[13px] font-semibold tabular-nums", neg ? "text-error" : "text-foreground")}>
              {neg ? "−" : ""}{l.amount.toLocaleString("en-US")}
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-border pt-2.5">
        <span className="text-[12.5px] font-medium text-muted-foreground">{totalLabel}</span>
        <span className={cn("text-[15px] font-semibold tabular-nums", neg ? "text-error" : "text-foreground")}>
          {neg ? "−" : ""}{total.toLocaleString("en-US")}
        </span>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[12px] text-muted-foreground">{label}</div>
      <div className="truncate text-[14px]">{value}</div>
    </div>
  )
}

function LinkRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-start text-[14px] transition-colors hover:bg-soft-accent hover:text-primary">
      {label}<ChevronRight className="size-3.5 text-muted-foreground/50 rtl:rotate-180" />
    </button>
  )
}

function Stat({ icon, value, label, tone }: {
  icon: React.ComponentType<{ className?: string }>; value: string; label: string; tone: string
}) {
  return (
    <div className="panel flex min-w-0 items-center gap-3 rounded-xl p-4">
      <IconBadge icon={icon} className="size-10" />
      <div className="min-w-0">
        <div className={cn("truncate text-[17px] font-semibold tabular-nums leading-none", tone)}>{value}</div>
        <div className="mt-1 truncate text-[12.5px] text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}
