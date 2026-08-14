import * as React from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, Badge, Button, Card, Input } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  BadgeCheck, CalendarClock, Car, ChevronDown, Download, Dumbbell, FileText, Gift,
  Heart, Home, Landmark, LifeBuoy, Phone, Plane, School, ShieldCheck, ShoppingBag,
  Search, Sofa, Users, Wallet, X,
} from "lucide-react"

import {
  allowances, allowanceTotal, BENEFIT_DOCS, DEPENDANTS, enrolment, PERKS, PLANS,
  reward, rewardTotal, type BenefitPlan, type PlanStatus, sar,
} from "../data/mock/benefits"

/** Slice colours for the total-reward bar, darkest (cash) to lightest. */
const REWARD_COLORS = ["var(--primary)", "#5b8fce", "#c9a227", "#5f9d52"]

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home, car: Car, phone: Phone, school: School, heart: Heart, shield: ShieldCheck,
  plane: Plane, landmark: Landmark, wallet: Wallet, dumbbell: Dumbbell, "life-buoy": LifeBuoy,
  sofa: Sofa, "shopping-bag": ShoppingBag,
}

const CATEGORIES = [
  { id: "all", label: "All", ar: "الكل" },
  { id: "health", label: "Health", ar: "الصحة" },
  { id: "protection", label: "Protection", ar: "الحماية" },
  { id: "financial", label: "Financial", ar: "مالية" },
  { id: "travel", label: "Travel", ar: "السفر" },
  { id: "wellbeing", label: "Wellbeing", ar: "العافية" },
] as const

const STATUS_META: Record<PlanStatus, { label: string; ar: string; cls: string }> = {
  active: { label: "Active", ar: "نشط", cls: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  eligible: { label: "Eligible", ar: "مؤهل", cls: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  "not-enrolled": { label: "Not enrolled", ar: "غير مشترك", cls: "border-border bg-muted/40 text-muted-foreground" },
}

export default function BenefitsPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)

  const navigate = useNavigate()
  const [cat, setCat] = React.useState<string>("all")
  const [perkQuery, setPerkQuery] = React.useState("")
  const [openPlan, setOpenPlan] = React.useState<string | null>("medical")

  const plans = cat === "all" ? PLANS : PLANS.filter((p) => p.category === cat)
  const perks = React.useMemo(() => {
    const q = perkQuery.trim().toLowerCase()
    if (!q) return PERKS
    return PERKS.filter((k) => [isAr ? k.nameAr : k.name, isAr ? k.categoryAr : k.category, isAr ? k.offerAr : k.offer]
      .some((f) => f.toLowerCase().includes(q)))
  }, [perkQuery, isAr])
  const basePct = Math.round((reward.components[0].amount / rewardTotal) * 100)
  const activeCount = PLANS.filter((p) => p.status === "active").length
  const medicalCovered = DEPENDANTS.filter((d) => d.medical).length

  return (
    <main className="@container mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
      {/* header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <Gift className="size-5" />
            <span className="text-xs font-semibold uppercase tracking-[0.14em]">{t("Rewards", "المكافآت")}</span>
          </div>
          <h1 className="mt-2 font-heading text-[28px] font-bold leading-tight tracking-tight sm:text-[32px]">{t("Benefits & allowances", "المزايا والبدلات")}</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">{t("Everything you're entitled to — cover, allowances, dependants and perks.", "كل ما تستحقه — التغطية والبدلات والمعالون والعروض.")}</p>
        </div>
        <Button variant="outline" className="shrink-0 gap-1.5"><Download className="size-4" />{t("Benefits statement", "بيان المزايا")}</Button>
      </div>

      {/* enrolment banner */}
      <Card className={cn("mb-6 flex flex-wrap items-center gap-4 border p-4",
        enrolment.status === "open" ? "border-emerald-500/30 bg-emerald-500/[0.06]" : "border-primary/25 bg-primary/[0.04]")}>
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary"><CalendarClock className="size-5" /></span>
        <div className="min-w-[220px] flex-1">
          <div className="text-[14px] font-semibold">
            {enrolment.status === "open"
              ? t(`${enrolment.year} enrolment is open`, `التسجيل لعام ${enrolment.year} مفتوح`)
              : t(`${enrolment.year} enrolment opens in ${enrolment.daysUntil} days`, `التسجيل لعام ${enrolment.year} يبدأ خلال ${enrolment.daysUntil} يومًا`)}
          </div>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">{isAr ? enrolment.noteAr : enrolment.note}</p>
        </div>
        <div className="text-[12px] text-muted-foreground">
          <div className="tabular-nums">{isAr ? enrolment.opensAr : enrolment.opens} — {isAr ? enrolment.closesAr : enrolment.closes}</div>
        </div>
      </Card>

      {/* total reward — the headline a benefits page exists for: what the
          package is worth once the employer-paid parts are counted */}
      <Card className="mb-6 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">{t("Total annual reward", "إجمالي المكافأة السنوية")}</div>
            <div className="metal-text mt-1 text-[30px] font-bold tabular-nums leading-none">{sar(rewardTotal, isAr)}</div>
            <p className="mt-1.5 max-w-[46ch] text-[12px] text-muted-foreground">
              {t(
                `Base salary is about ${basePct}% of it — the rest is allowances, bonus and cover the company pays for on your behalf.`,
                `الراتب الأساسي يمثل نحو ${basePct}٪ منها — والباقي بدلات ومكافآت وتغطية يتحملها صاحب العمل نيابةً عنك.`,
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => navigate("/payslip")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-[12.5px] font-medium transition-colors hover:border-primary/50 hover:text-primary">
              <Wallet className="size-3.5" />{t("See payslips", "عرض كشوف الرواتب")}
            </button>
          </div>
        </div>

        {/* stacked split */}
        <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-muted">
          {reward.components.map((c, i) => (
            <div key={c.id} className="h-full transition-all"
              style={{ width: `${(c.amount / rewardTotal) * 100}%`, backgroundColor: REWARD_COLORS[i] }} />
          ))}
        </div>
        <div className="mt-3 grid gap-x-5 gap-y-2 @xl:grid-cols-2 @4xl:grid-cols-4">
          {reward.components.map((c, i) => (
            <div key={c.id} className="min-w-0">
              <span className="flex items-center gap-1.5">
                <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: REWARD_COLORS[i] }} />
                <span className="truncate text-[11.5px] text-muted-foreground">{isAr ? c.labelAr : c.label}</span>
              </span>
              <div className="mt-0.5 ps-3.5 text-[14px] font-bold tabular-nums leading-none">{c.amount.toLocaleString("en-US")}</div>
              <div className="ps-3.5 text-[10px] text-muted-foreground/60">{isAr ? c.noteAr : c.note}</div>
            </div>
          ))}
        </div>

        {/* what the employer-paid slice is made of */}
        <details className="group mt-4 border-t border-border/60 pt-3">
          <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-[12px] font-medium text-primary hover:underline">
            <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" />
            {t("What's in the employer-paid share?", "مما تتكون حصة صاحب العمل؟")}
          </summary>
          <dl className="mt-2.5 grid gap-x-6 gap-y-1.5 @xl:grid-cols-2">
            {reward.employerPaid.map((e) => (
              <div key={e.label} className="flex items-baseline justify-between gap-3 border-b border-border/40 pb-1.5">
                <dt className="text-[12px] text-muted-foreground">{isAr ? e.labelAr : e.label}</dt>
                <dd className="text-[12.5px] font-semibold tabular-nums">{e.amount.toLocaleString("en-US")}</dd>
              </div>
            ))}
          </dl>
        </details>
      </Card>

      {/* summary */}
      <div className="mb-6 grid grid-cols-2 gap-3 @3xl:grid-cols-4">
        <Stat icon={Wallet} value={sar(allowanceTotal, isAr)} label={t("Monthly allowances", "البدلات الشهرية")} tone="text-primary" />
        <Stat icon={BadgeCheck} value={String(activeCount)} label={t("Active benefits", "مزايا نشطة")} tone="text-emerald-500" />
        <Stat icon={Users} value={String(medicalCovered)} label={t("Dependants covered", "معالون مشمولون")} tone="text-sky-500" />
        <Stat icon={Gift} value={String(PERKS.length)} label={t("Partner perks", "عروض الشركاء")} tone="text-amber-500" />
      </div>

      <div className="grid gap-5 @5xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* ── main column ── */}
        <div className="min-w-0 space-y-6">
          {/* plans */}
          <section>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-heading text-[16px] font-semibold">{t("Your benefits", "مزاياك")}</h2>
              <div className="inline-flex flex-wrap gap-1">
                {CATEGORIES.map((c) => (
                  <button key={c.id} onClick={() => setCat(c.id)} aria-pressed={cat === c.id}
                    className={cn("rounded-full px-3 py-1 text-[12px] font-medium transition-colors",
                      cat === c.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                    {isAr ? c.ar : c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              {plans.map((p, i) => (
                <PlanRow key={p.id} plan={p} i={i} open={openPlan === p.id} isAr={isAr} t={t}
                  onToggle={() => setOpenPlan((cur) => (cur === p.id ? null : p.id))} />
              ))}
            </div>
          </section>

          {/* allowances */}
          <section>
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-heading text-[16px] font-semibold">{t("Monthly allowances", "البدلات الشهرية")}</h2>
              <span className="text-[12.5px] text-muted-foreground">
                {t("Paid with salary", "تُدفع مع الراتب")} · <span className="font-semibold text-foreground">{sar(allowanceTotal, isAr)}</span>
              </span>
            </div>
            <Card className="p-5">
              {/* proportion bar */}
              <div className="mb-4 flex h-2.5 overflow-hidden rounded-full bg-muted">
                {allowances.map((a, i) => (
                  <div key={a.id} className="h-full transition-all"
                    style={{ width: `${(a.amount / allowanceTotal) * 100}%`, backgroundColor: `var(--primary)`, opacity: 1 - i * 0.18 }} />
                ))}
              </div>
              <div className="grid gap-3 @xl:grid-cols-2">
                {allowances.map((a) => {
                  const Icon = ICONS[a.icon] ?? Wallet
                  return (
                    <div key={a.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/15 p-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/12 text-primary"><Icon className="size-4" /></span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-semibold">{isAr ? a.labelAr : a.label}</div>
                        {(a.note || a.noteAr) && <div className="truncate text-[11px] text-muted-foreground">{isAr ? a.noteAr : a.note}</div>}
                      </div>
                      <div className="shrink-0 text-end">
                        <div className="text-[14px] font-bold tabular-nums leading-none">{a.amount.toLocaleString("en-US")}</div>
                        <div className="text-[10px] text-muted-foreground">{isAr ? "ر.س / شهر" : "SAR / mo"}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </section>

          {/* perks */}
          <section>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-heading text-[16px] font-semibold">{t("Partner perks & discounts", "عروض وخصومات الشركاء")}</h2>
              <div className="relative w-[220px]">
                <Search className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input value={perkQuery} onChange={(e) => setPerkQuery(e.target.value)}
                  placeholder={t("Search perks", "ابحث في العروض")} className="h-9 ps-8 pe-7 text-[13px]" />
                {perkQuery && (
                  <button onClick={() => setPerkQuery("")} aria-label={t("Clear", "مسح")}
                    className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="size-3.5" /></button>
                )}
              </div>
            </div>
            {perks.length === 0 && (
              <Card className="p-8 text-center text-[13px] text-muted-foreground">{t("No perks match that search.", "لا توجد عروض مطابقة.")}</Card>
            )}
            <div className="grid gap-3 @xl:grid-cols-2 @4xl:grid-cols-3">
              {perks.map((k) => {
                const Icon = ICONS[k.icon] ?? Gift
                return (
                  <Card key={k.id} className="p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-start gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" /></span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-semibold">{isAr ? k.nameAr : k.name}</div>
                        <div className="text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground/60">{isAr ? k.categoryAr : k.category}</div>
                      </div>
                    </div>
                    <p className="mt-2.5 text-[12px] leading-snug text-muted-foreground">{isAr ? k.offerAr : k.offer}</p>
                  </Card>
                )
              })}
            </div>
          </section>
        </div>

        {/* ── side column ── */}
        <div className="space-y-5">
          {/* dependants */}
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-heading text-[15px] font-semibold">{t("Dependants", "المعالون")}</h2>
              <Badge variant="outline" className="text-[10px]">{DEPENDANTS.length}</Badge>
            </div>
            <div className="space-y-2.5">
              {DEPENDANTS.map((d) => (
                <div key={d.id} className="flex items-center gap-3 rounded-xl border border-border/60 p-2.5">
                  <Avatar className="size-9 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">{d.initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12.5px] font-semibold">{isAr ? d.nameAr : d.name}</div>
                    <div className="truncate text-[11px] text-muted-foreground">
                      {isAr ? d.relationAr : d.relation} · {d.age} {t("yrs", "سنة")}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {d.medical && <CoverPip label={t("Medical", "طبي")} icon={Heart} />}
                    {d.tickets && <CoverPip label={t("Tickets", "تذاكر")} icon={Plane} />}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11.5px] text-muted-foreground">
              {t("Dependants can be added during the enrolment window or within 30 days of a life event.", "يمكن إضافة المعالين خلال فترة التسجيل أو خلال ٣٠ يومًا من أي حدث عائلي.")}
            </p>
          </Card>

          {/* documents */}
          <Card className="p-5">
            <h2 className="mb-3 font-heading text-[15px] font-semibold">{t("Documents", "المستندات")}</h2>
            <div className="space-y-1.5">
              {BENEFIT_DOCS.map((d) => (
                <button key={d.id} className="flex w-full items-center gap-3 rounded-lg p-2 text-start transition-colors hover:bg-primary/[0.06]">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground"><FileText className="size-4" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-medium leading-tight">{isAr ? d.nameAr : d.name}</span>
                    <span className="block text-[10.5px] text-muted-foreground">{isAr ? d.metaAr : d.meta}</span>
                  </span>
                  <Download className="size-3.5 shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>
          </Card>

          {/* help */}
          <Card className="p-5">
            <h2 className="font-heading text-[15px] font-semibold">{t("Questions?", "لديك سؤال؟")}</h2>
            <p className="mt-1 text-[12.5px] text-muted-foreground">
              {t("People & Culture can help with cover, claims and enrolment.", "فريق الموظفين والثقافة يساعدك في التغطية والمطالبات والتسجيل.")}
            </p>
            <a href="mailto:benefits@altanfeethi.com.sa"
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-primary/50 hover:bg-primary/[0.06] hover:text-primary">
              <LifeBuoy className="size-4" />{t("Contact HR", "تواصل مع الموارد البشرية")}
            </a>
          </Card>
        </div>
      </div>
    </main>
  )
}

// ── plan row ─────────────────────────────────────────────────────────────────

function PlanRow({ plan, i, open, isAr, t, onToggle }: {
  plan: BenefitPlan; i: number; open: boolean; isAr: boolean
  t: (en: string, ar: string) => string; onToggle: () => void
}) {
  const Icon = ICONS[plan.icon] ?? Gift
  const status = STATUS_META[plan.status]
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.2) }}>
      <Card className={cn("overflow-hidden p-0 transition-shadow", open && "shadow-md")}>
        <button onClick={onToggle} aria-expanded={open}
          className="flex w-full items-center gap-3.5 p-4 text-start transition-colors hover:bg-primary/[0.03]">
          <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl",
            plan.status === "not-enrolled" ? "bg-muted text-muted-foreground" : "bg-primary/12 text-primary")}>
            <Icon className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-[14px] font-semibold leading-tight">{isAr ? plan.nameAr : plan.name}</span>
              <Badge variant="outline" className={cn("text-[10px]", status.cls)}>{isAr ? status.ar : status.label}</Badge>
            </span>
            <span className="mt-0.5 block truncate text-[12px] text-muted-foreground">{isAr ? plan.summaryAr : plan.summary}</span>
            {/* how much of a drawdown benefit is left */}
            {plan.usage && (
              <span className="mt-2 block max-w-[280px]">
                <span className="flex items-center justify-between text-[10.5px] text-muted-foreground">
                  <span>{t("Used", "المستخدم")} {plan.usage.used.toLocaleString("en-US")} {t("of", "من")} {plan.usage.total.toLocaleString("en-US")} {isAr ? plan.usage.unitAr : plan.usage.unit}</span>
                  <span className="tabular-nums">{Math.round((plan.usage.used / plan.usage.total) * 100)}%</span>
                </span>
                <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-muted">
                  <span className="block h-full rounded-full bg-primary" style={{ width: `${(plan.usage.used / plan.usage.total) * 100}%` }} />
                </span>
              </span>
            )}
          </span>
          <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
        </button>

        {open && (
          <div className="border-t border-border/60 bg-muted/15 px-4 py-3.5">
            {plan.provider && (
              <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]">
                <span className="text-muted-foreground">{t("Provider", "مزود الخدمة")}: <span className="font-medium text-foreground">{isAr ? plan.providerAr : plan.provider}</span></span>
                {plan.policyNo && <span className="text-muted-foreground">{t("Policy", "رقم الوثيقة")}: <span className="font-mono font-medium text-foreground">{plan.policyNo}</span></span>}
              </div>
            )}
            <dl className="grid gap-x-6 gap-y-2 @xl:grid-cols-2">
              {plan.details.map((d) => (
                <div key={d.label} className="flex items-baseline justify-between gap-3 border-b border-border/40 pb-1.5 last:border-0">
                  <dt className="text-[12px] text-muted-foreground">{isAr ? d.labelAr : d.label}</dt>
                  <dd className="text-[12.5px] font-semibold tabular-nums">{isAr ? d.valueAr : d.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </Card>
    </motion.div>
  )
}

function CoverPip({ label, icon: Icon }: { label: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <span title={label} className="grid size-6 place-items-center rounded-md bg-emerald-500/12 text-emerald-600 dark:text-emerald-400">
      <Icon className="size-3" />
    </span>
  )
}

function Stat({ icon: Icon, value, label, tone }: {
  icon: React.ComponentType<{ className?: string }>; value: string; label: string; tone: string
}) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10", tone)}><Icon className="size-5" /></span>
      <div className="min-w-0">
        <div className={cn("truncate text-[18px] font-bold tabular-nums leading-none", tone)}>{value}</div>
        <div className="mt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/60">{label}</div>
      </div>
    </Card>
  )
}
