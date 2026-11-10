import * as React from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Input } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  BadgeCheck, CalendarClock, Car, ChevronDown, Download, Dumbbell, FileText, Gift,
  Heart, Home, Landmark, LifeBuoy, Phone, Plane, School, Search, ShieldCheck, ShoppingBag,
  Sofa, Users, Wallet, X,
} from "lucide-react"

import {
  allowances, allowanceTotal, BENEFIT_DOCS, DEPENDANTS, enrolment, PERKS, PLANS,
  reward, rewardTotal, type BenefitPlan, type PlanStatus, sar,
} from "../data/mock/benefits"
import { Bar, Chip, Empty, IconBadge, Initials, OutlineButton, Page, SectionCard, Tile, type Tone } from "../components/wijha"

/** Slice colours for the total-reward bar — token colours only. */
const REWARD_COLORS = ["var(--primary)", "var(--info)", "var(--warning)", "var(--success)"]

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

const STATUS_META: Record<PlanStatus, { label: string; ar: string; tone: Tone }> = {
  active: { label: "Active", ar: "نشط", tone: "success" },
  eligible: { label: "Eligible", ar: "مؤهل", tone: "warning" },
  "not-enrolled": { label: "Not enrolled", ar: "غير مشترك", tone: "neutral" },
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
    <Page className="@container">
      {/* toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-end gap-2">
        <OutlineButton onClick={() => navigate("/benefits/partners")}><Gift className="size-4" />{t("Partner offers", "عروض الشركاء")}</OutlineButton>
        <OutlineButton><Download className="size-4" />{t("Benefits statement", "بيان المزايا")}</OutlineButton>
      </div>

      {/* enrolment + total reward hero */}
      <section className="highlight-card hl-green mb-6 rounded-2xl p-5 sm:p-6 lg:px-8 lg:py-7">
        <div className="flex flex-wrap items-center gap-4">
          <IconBadge icon={CalendarClock} tone={enrolment.status === "open" ? "success" : "accent"} className="size-11" />
          <div className="min-w-[220px] flex-1">
            <div className="text-[14.5px] font-medium">
              {enrolment.status === "open"
                ? t(`${enrolment.year} enrolment is open`, `التسجيل لعام ${enrolment.year} مفتوح`)
                : t(`${enrolment.year} enrolment opens in ${enrolment.daysUntil} days`, `التسجيل لعام ${enrolment.year} يبدأ خلال ${enrolment.daysUntil} أيام`)}
            </div>
            <p className="mt-0.5 text-[12.5px] text-muted-foreground">{isAr ? enrolment.noteAr : enrolment.note}</p>
          </div>
          <Chip tone={enrolment.status === "open" ? "success" : "accent"}>
            {isAr ? enrolment.opensAr : enrolment.opens} — {isAr ? enrolment.closesAr : enrolment.closes}
          </Chip>
        </div>

        <div className="card-separator my-5" />

        {/* total reward — what the package is worth once employer-paid parts count */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[12.5px] text-muted-foreground">{t("Total annual reward", "إجمالي المكافأة السنوية")}</div>
            <div className="mt-1 text-[32px] font-medium tabular-nums leading-none">{sar(rewardTotal, isAr)}</div>
            <p className="mt-2 max-w-[52ch] text-[12.5px] text-muted-foreground">
              {t(
                `Base salary is about ${basePct}% of it — the rest is allowances, bonus and cover the company pays for on your behalf.`,
                `الراتب الأساسي يمثل نحو ${basePct}٪ منها — والباقي بدلات ومكافآت وتغطية يتحملها صاحب العمل نيابةً عنك.`,
              )}
            </p>
          </div>
          <OutlineButton size="sm" onClick={() => navigate("/payslip")}><Wallet className="size-3.5" />{t("See payslips", "عرض كشوف الرواتب")}</OutlineButton>
        </div>

        <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-secondary">
          {reward.components.map((c, i) => (
            <div key={c.id} className="h-full transition-all" style={{ width: `${(c.amount / rewardTotal) * 100}%`, backgroundColor: REWARD_COLORS[i] }} />
          ))}
        </div>
        <div className="mt-4 grid gap-x-5 gap-y-3 @xl:grid-cols-2 @4xl:grid-cols-4">
          {reward.components.map((c, i) => (
            <div key={c.id} className="min-w-0">
              <span className="flex items-center gap-1.5">
                <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: REWARD_COLORS[i] }} />
                <span className="truncate text-[12.5px] text-muted-foreground">{isAr ? c.labelAr : c.label}</span>
              </span>
              <div className="mt-1 ps-3.5 text-[16px] font-medium tabular-nums leading-none">{c.amount.toLocaleString("en-US")}</div>
              <div className="mt-0.5 ps-3.5 text-[11px] text-muted-foreground">{isAr ? c.noteAr : c.note}</div>
            </div>
          ))}
        </div>

        <details className="group mt-5">
          <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-[13px] font-medium text-primary hover:underline">
            <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" />
            {t("What's in the employer-paid share?", "مما تتكون حصة صاحب العمل؟")}
          </summary>
          <dl className="mt-3 grid gap-x-6 gap-y-1.5 @xl:grid-cols-2">
            {reward.employerPaid.map((e) => (
              <div key={e.label} className="flex items-baseline justify-between gap-3 border-b border-border pb-1.5">
                <dt className="text-[12.5px] text-muted-foreground">{isAr ? e.labelAr : e.label}</dt>
                <dd className="text-[13px] font-medium tabular-nums">{e.amount.toLocaleString("en-US")}</dd>
              </div>
            ))}
          </dl>
        </details>
      </section>

      {/* summary */}
      <div className="mb-6 grid grid-cols-2 gap-6 @3xl:grid-cols-4">
        <Stat icon={Wallet} value={sar(allowanceTotal, isAr)} label={t("Monthly allowances", "البدلات الشهرية")} tone="accent" />
        <Stat icon={BadgeCheck} value={String(activeCount)} label={t("Active benefits", "مزايا نشطة")} tone="success" />
        <Stat icon={Users} value={String(medicalCovered)} label={t("Dependants covered", "معالون مشمولون")} tone="accent" />
        <Stat icon={Gift} value={String(PERKS.length)} label={t("Partner perks", "عروض الشركاء")} tone="violet" />
      </div>

      <div className="grid gap-6 @5xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* ── main column ── */}
        <div className="min-w-0 space-y-6">
          <SectionCard
            icon={ShieldCheck}
            title={t("Your benefits", "مزاياك")}
            action={
              <div className="flex flex-wrap justify-end gap-1">
                {CATEGORIES.map((c) => (
                  <button key={c.id} onClick={() => setCat(c.id)} aria-pressed={cat === c.id}
                    className={cn("h-7 rounded-full px-3 text-[12.5px] font-medium transition-colors",
                      cat === c.id ? "bg-soft-accent text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}>
                    {isAr ? c.ar : c.label}
                  </button>
                ))}
              </div>
            }
          >
            <div className="space-y-3">
              {plans.map((p, i) => (
                <PlanRow key={p.id} plan={p} i={i} open={openPlan === p.id} isAr={isAr} t={t}
                  onToggle={() => setOpenPlan((cur) => (cur === p.id ? null : p.id))} />
              ))}
              {plans.length === 0 && <Empty icon={ShieldCheck} title={t("No benefits in this category", "لا توجد مزايا في هذه الفئة")} />}
            </div>
          </SectionCard>

          <SectionCard
            icon={Wallet}
            title={t("Monthly allowances", "البدلات الشهرية")}
            action={
              <span className="text-[12.5px] text-muted-foreground">
                {t("Paid with salary", "تُدفع مع الراتب")} · <span className="font-medium text-foreground">{sar(allowanceTotal, isAr)}</span>
              </span>
            }
          >
            <div className="mb-4 flex h-2 overflow-hidden rounded-full bg-secondary">
              {allowances.map((a, i) => (
                <div key={a.id} className="h-full transition-all"
                  style={{ width: `${(a.amount / allowanceTotal) * 100}%`, backgroundColor: "var(--primary)", opacity: 1 - i * 0.18 }} />
              ))}
            </div>
            <div className="grid gap-3 @xl:grid-cols-2">
              {allowances.map((a) => {
                const Icon = ICONS[a.icon] ?? Wallet
                return (
                  <Tile key={a.id} className="flex items-center gap-3">
                    <IconBadge icon={Icon} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14.5px]">{isAr ? a.labelAr : a.label}</div>
                      {(a.note || a.noteAr) && <div className="truncate text-[12.5px] text-muted-foreground">{isAr ? a.noteAr : a.note}</div>}
                    </div>
                    <div className="shrink-0 text-end">
                      <div className="text-[16px] font-medium tabular-nums leading-none">{a.amount.toLocaleString("en-US")}</div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">{isAr ? "ر.س / شهر" : "SAR / mo"}</div>
                    </div>
                  </Tile>
                )
              })}
            </div>
          </SectionCard>

          <SectionCard
            icon={Gift}
            title={t("Partner perks & discounts", "عروض وخصومات الشركاء")}
            action={
              <OutlineButton size="sm" onClick={() => navigate("/benefits/partners")}>
                {t("All partner offers", "كل عروض الشركاء")}
              </OutlineButton>
            }
          >
            <div className="relative mb-4 max-w-xs">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input value={perkQuery} onChange={(e) => setPerkQuery(e.target.value)}
                placeholder={t("Search perks", "ابحث في العروض")} className="h-9 rounded-lg bg-background ps-8 pe-7 text-[13px]" />
              {perkQuery && (
                <button onClick={() => setPerkQuery("")} aria-label={t("Clear", "مسح")}
                  className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="size-3.5" /></button>
              )}
            </div>
            {perks.length === 0 ? (
              <Empty icon={Search} title={t("No perks match that search.", "لا توجد عروض مطابقة.")} />
            ) : (
              <div className="grid gap-3 @xl:grid-cols-2 @4xl:grid-cols-3">
                {perks.map((k) => {
                  const Icon = ICONS[k.icon] ?? Gift
                  return (
                    <Tile key={k.id} className="transition-colors hover:ring-primary/30">
                      <div className="flex items-start gap-3">
                        <IconBadge icon={Icon} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[14.5px]">{isAr ? k.nameAr : k.name}</div>
                          <div className="text-[12px] text-muted-foreground">{isAr ? k.categoryAr : k.category}</div>
                        </div>
                      </div>
                      <p className="mt-3 text-[12.5px] leading-snug text-muted-foreground">{isAr ? k.offerAr : k.offer}</p>
                    </Tile>
                  )
                })}
              </div>
            )}
          </SectionCard>
        </div>

        {/* ── side column ── */}
        <div className="space-y-6">
          <SectionCard icon={Users} title={t("Dependants", "المعالون")} action={<Chip>{DEPENDANTS.length}</Chip>}>
            {DEPENDANTS.length === 0 ? (
              <Empty icon={Users} title={t("No dependants on record", "لا يوجد معالون مسجّلون")} />
            ) : (
              <div className="space-y-3">
                {DEPENDANTS.map((d) => (
                  <Tile key={d.id} className="flex items-center gap-3 p-3">
                    <Initials text={d.initials} tone="accent" className="size-9" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14px]">{isAr ? d.nameAr : d.name}</div>
                      <div className="truncate text-[12px] text-muted-foreground">
                        {isAr ? d.relationAr : d.relation} · {d.age} {t("yrs", "سنة")}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {d.medical && <CoverPip label={t("Medical", "طبي")} icon={Heart} />}
                      {d.tickets && <CoverPip label={t("Tickets", "تذاكر")} icon={Plane} />}
                    </div>
                  </Tile>
                ))}
              </div>
            )}
            <p className="mt-3 text-[12px] text-muted-foreground">
              {t("Dependants can be added during the enrolment window or within 30 days of a life event.", "يمكن إضافة المعالين خلال فترة التسجيل أو خلال 30 يومًا من أي حدث عائلي.")}
            </p>
            <OutlineButton size="sm" className="mt-3 w-full" onClick={() => navigate("/employee/dependants")}>
              {t("Manage family", "إدارة العائلة")}
            </OutlineButton>
          </SectionCard>

          <SectionCard icon={FileText} title={t("Documents", "المستندات")}>
            {BENEFIT_DOCS.length === 0 ? (
              <Empty icon={FileText} title={t("No documents yet", "لا توجد مستندات بعد")} />
            ) : (
              <div className="space-y-1">
                {BENEFIT_DOCS.map((d) => (
                  <button key={d.id} className="flex w-full items-center gap-3 rounded-lg p-2 text-start transition-colors hover:bg-soft-accent">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-icon"><FileText className="size-4" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] leading-tight">{isAr ? d.nameAr : d.name}</span>
                      <span className="block text-[11.5px] text-muted-foreground">{isAr ? d.metaAr : d.meta}</span>
                    </span>
                    <Download className="size-4 shrink-0 text-primary" />
                  </button>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard icon={LifeBuoy} title={t("Questions?", "لديك سؤال؟")}>
            <p className="text-[13px] text-muted-foreground">
              {t("People & Culture can help with cover, claims and enrolment.", "فريق الموظفين والثقافة يساعدك في التغطية والمطالبات والتسجيل.")}
            </p>
            <a href="mailto:benefits@altanfeethi.com.sa"
              className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-[var(--btn-outline-border)] text-[14px] font-medium transition-colors hover:bg-[var(--btn-outline-hover)] hover:text-primary">
              <LifeBuoy className="size-4" />{t("Contact HR", "تواصل مع الموارد البشرية")}
            </a>
          </SectionCard>
        </div>
      </div>
    </Page>
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
      <div className={cn("overflow-hidden rounded-[10px] bg-background ring-1 ring-border ring-inset transition-colors", open && "ring-primary/30")}>
        <button onClick={onToggle} aria-expanded={open}
          className="flex w-full items-center gap-3.5 p-4 text-start transition-colors hover:bg-soft-accent/40">
          <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg bg-secondary",
            plan.status === "not-enrolled" ? "text-icon" : "text-primary")}>
            <Icon className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-[14.5px] leading-tight">{isAr ? plan.nameAr : plan.name}</span>
              <Chip tone={status.tone}>{isAr ? status.ar : status.label}</Chip>
            </span>
            <span className="mt-0.5 block truncate text-[12.5px] text-muted-foreground">{isAr ? plan.summaryAr : plan.summary}</span>
            {plan.usage && (
              <span className="mt-2 block max-w-[300px]">
                <span className="flex items-center justify-between text-[11.5px] text-muted-foreground">
                  <span>{t("Used", "المستخدم")} {plan.usage.used.toLocaleString("en-US")} {t("of", "من")} {plan.usage.total.toLocaleString("en-US")} {isAr ? plan.usage.unitAr : plan.usage.unit}</span>
                  <span className="tabular-nums">{Math.round((plan.usage.used / plan.usage.total) * 100)}%</span>
                </span>
                <Bar className="mt-1" tone="accent" value={(plan.usage.used / plan.usage.total) * 100} />
              </span>
            )}
          </span>
          <ChevronDown className={cn("size-4 shrink-0 text-icon transition-transform", open && "rotate-180")} />
        </button>

        {open && (
          <div className="border-t border-border px-4 py-3.5">
            {plan.provider && (
              <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px]">
                <span className="text-muted-foreground">{t("Provider", "مزود الخدمة")}: <span className="text-foreground">{isAr ? plan.providerAr : plan.provider}</span></span>
                {plan.policyNo && <span className="text-muted-foreground">{t("Policy", "رقم الوثيقة")}: <span className="font-mono text-foreground" dir="ltr">{plan.policyNo}</span></span>}
              </div>
            )}
            <dl className="grid gap-x-6 gap-y-2 @xl:grid-cols-2">
              {plan.details.map((d) => (
                <div key={d.label} className="flex items-baseline justify-between gap-3 border-b border-border pb-1.5 last:border-0">
                  <dt className="text-[12.5px] text-muted-foreground">{isAr ? d.labelAr : d.label}</dt>
                  <dd className="text-[13px] font-medium tabular-nums">{isAr ? d.valueAr : d.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function CoverPip({ label, icon: Icon }: { label: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <span title={label} aria-label={label} className="grid size-6 place-items-center rounded-md bg-success-fill text-success">
      <Icon className="size-3" />
    </span>
  )
}

function Stat({ icon, value, label, tone }: {
  icon: React.ComponentType<{ className?: string }>; value: string; label: string; tone: "accent" | "success" | "violet"
}) {
  return (
    <div className="panel flex items-center gap-3 rounded-xl p-4">
      <IconBadge icon={icon} tone={tone} className="size-10" />
      <div className="min-w-0">
        <div className="truncate text-[18px] font-medium tabular-nums leading-none">{value}</div>
        <div className="mt-1 text-[12.5px] text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}
