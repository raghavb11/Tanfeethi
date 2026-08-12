import * as React from "react"
import { motion } from "framer-motion"

import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  Input,
  Textarea,
} from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  assets,
  catalog,
  knowledgeBase,
  popularRequests,
  requestTracker,
  serviceKpis,
  type CategoryTone,
  type RequestStage,
  type SlaTone,
} from "../data/mock/services"
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  HardDrive,
  Headset,
  KeyRound,
  Laptop,
  Plus,
  Search,
  Send,
  Settings2,
  Smartphone,
  Sparkles,
  TimerReset,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react"

// ─── translations ────────────────────────────────────────────────────────────

const ar = {
  hubLabel: "مركز الخدمات",
  pageTitle: "كتالوج الخدمات والتنفيذ",
  pageDesc: "اطلب خدمة، تابع طلباتك، وأشرف على أصولك في مكان واحد.",
  helloKhalid: "مرحبًا خالد",
  helpToday: "كيف نقدر نساعدك اليوم؟",
  searchPh: "ابحث عن خدمة، حالة طلب، أو دليل…",
  popular: "الأكثر طلبًا",
  kpiOpen: "طلبات مفتوحة",
  kpiOpenSub: "حاليًا في الطابور",
  kpiResolved: "أُغلقت هذا الأسبوع",
  kpiResolvedSub: "خلال 7 أيام",
  kpiResponse: "متوسط الاستجابة",
  kpiResponseSub: "ساعات",
  kpiSla: "نسبة الوفاء",
  kpiSlaSub: "اتفاقيات الخدمة",
  catalog: "تصفّح الكتالوج",
  catalogSub: "اختر الفئة المناسبة لطلبك",
  popularBadge: "شائع",
  openBadge: (n: number) => `${n} مفتوحة`,
  open: "فتح",
  myRequests: "طلباتي النشطة",
  myRequestsSub: "تابع التقدم والتسليم",
  viewAll: "عرض الكل",
  newRequest: "طلب جديد",
  newRequestSub: "نموذج مختصر لإرسال سريع",
  category: "الفئة",
  categoryPh: "صلاحيات · أجهزة · تطبيق",
  urgency: "درجة الأولوية",
  urgencyPh: "عادي / عالي / حرج",
  description: "الوصف",
  descriptionPh: "وش تبي الفريق يعرف؟",
  submit: "إرسال الطلب",
  knowledgeBase: "مركز المعرفة",
  knowledgeBaseSub: "حلول جاهزة بدون انتظار",
  exploreKb: "استكشف المركز",
  assets: "أصولك",
  assetsSub: "ما تملكه حاليًا من أجهزة",
  renewal: "التجديد",
}

// ─── tone mapping ────────────────────────────────────────────────────────────

function toneClasses(tone: CategoryTone) {
  switch (tone) {
    case "emerald":
      return { bg: "bg-emerald-500/12", text: "text-emerald-500", border: "border-emerald-500/30", dot: "bg-emerald-500" }
    case "blue":
      return { bg: "bg-blue-500/12", text: "text-blue-500", border: "border-blue-500/30", dot: "bg-blue-500" }
    case "amber":
      return { bg: "bg-amber-500/12", text: "text-amber-500", border: "border-amber-500/30", dot: "bg-amber-500" }
    case "violet":
      return { bg: "bg-violet-500/12", text: "text-violet-500", border: "border-violet-500/30", dot: "bg-violet-500" }
    case "cyan":
      return { bg: "bg-cyan-500/12", text: "text-cyan-500", border: "border-cyan-500/30", dot: "bg-cyan-500" }
    case "primary":
    default:
      return { bg: "bg-primary/12", text: "text-primary", border: "border-primary/30", dot: "bg-primary" }
  }
}

const categoryIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  s1: HardDrive,
  s2: Users,
  s3: Wrench,
  s4: CreditCard,
}

const stageOrder: RequestStage[] = ["submitted", "triage", "in-progress", "review", "closed"]

function stageIndex(s: RequestStage) {
  return stageOrder.indexOf(s)
}

function slaClasses(tone: SlaTone) {
  if (tone === "ok") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
  if (tone === "warn") return "border-amber-500/30 bg-amber-500/10 text-amber-500"
  return "border-rose-500/30 bg-rose-500/10 text-rose-500"
}

// ─── hero illustration ───────────────────────────────────────────────────────

function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 280 200" className={className} xmlns="http://www.w3.org/2000/svg" fill="none">
      {/* Ambient glows */}
      <circle cx="40" cy="40" r="36" fill="rgba(206,123,91,0.10)" />
      <circle cx="240" cy="170" r="28" fill="rgba(35,64,36,0.18)" />

      {/* Floating tickets */}
      <motion.g
        initial={{ y: 0 }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <rect x="40" y="36" width="78" height="50" rx="8" fill="rgba(243,240,238,0.92)" stroke="rgba(206,123,91,0.4)" strokeWidth="1.2" />
        <rect x="48" y="46" width="40" height="4" rx="2" fill="#234024" />
        <rect x="48" y="55" width="56" height="2.5" rx="1.25" fill="rgba(35,64,36,0.4)" />
        <rect x="48" y="62" width="48" height="2.5" rx="1.25" fill="rgba(35,64,36,0.3)" />
        <rect x="48" y="74" width="20" height="6" rx="3" fill="#CE7B5B" />
      </motion.g>

      <motion.g
        initial={{ y: 0 }}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4.5, delay: 0.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <rect x="172" y="50" width="78" height="50" rx="8" fill="rgba(243,240,238,0.88)" stroke="rgba(35,64,36,0.45)" strokeWidth="1.2" />
        <rect x="180" y="60" width="44" height="4" rx="2" fill="#234024" />
        <rect x="180" y="69" width="60" height="2.5" rx="1.25" fill="rgba(35,64,36,0.4)" />
        <rect x="180" y="76" width="40" height="2.5" rx="1.25" fill="rgba(35,64,36,0.3)" />
        <circle cx="240" cy="62" r="5" fill="#CE7B5B" />
      </motion.g>

      {/* Support agent character */}
      <g transform="translate(95, 92)">
        {/* Headset arc */}
        <path d="M5 28 Q5 4 45 4 Q85 4 85 28" stroke="#CE7B5B" strokeWidth="3" fill="none" strokeLinecap="round" />
        <rect x="0" y="26" width="10" height="14" rx="3" fill="#CE7B5B" />
        <rect x="80" y="26" width="10" height="14" rx="3" fill="#CE7B5B" />
        {/* Head */}
        <circle cx="45" cy="38" r="20" fill="#FBBF9A" />
        <path d="M28 32 Q45 18 62 32 Q60 22 45 21 Q30 22 28 32Z" fill="#2d1b0e" />
        {/* Mic */}
        <circle cx="64" cy="48" r="3" fill="#234024" />
        <path d="M62 47 Q66 50 64 56" stroke="#CE7B5B" strokeWidth="2" fill="none" />
        {/* Body */}
        <path d="M22 64 Q18 56 28 54 L45 60 L62 54 Q72 56 68 64 L66 92 Q45 98 24 92Z" fill="#234024" />
        {/* Tag */}
        <rect x="38" y="64" width="14" height="6" rx="2" fill="rgba(243,240,238,0.85)" />
      </g>

      {/* Sparkles */}
      <circle cx="160" cy="22" r="2.5" fill="rgba(206,123,91,0.5)" />
      <circle cx="20" cy="120" r="3" fill="rgba(206,123,91,0.4)" />
      <circle cx="265" cy="100" r="2" fill="rgba(35,64,36,0.45)" />
      <path d="M250 28 l1.5 4 4 0 -3 2.5 1 4 -3.5-2.5 -3.5 2.5 1-4 -3-2.5 4 0z" fill="rgba(206,123,91,0.45)" />
    </svg>
  )
}

// ─── KPI mini-card ───────────────────────────────────────────────────────────

function KpiMini({
  label,
  value,
  hint,
  icon: Icon,
  tone,
  delay = 0,
}: {
  label: string
  value: string
  hint: string
  icon: React.ComponentType<{ className?: string }>
  tone: CategoryTone
  delay?: number
}) {
  const t = toneClasses(tone)
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-3 rounded-2xl border border-border/60 panel px-4 py-3 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.04]"
    >
      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", t.bg, t.text)}>
        <Icon className="size-[18px]" />
      </span>
      <div className="min-w-0">
        <div className="text-[10px] font-semibold tracking-[0.10em] uppercase text-muted-foreground/55 truncate">{label}</div>
        <div className="mt-0.5 text-[22px] font-bold tabular-nums leading-none">{value}</div>
        <div className="mt-1 text-[10px] text-muted-foreground/55 truncate">{hint}</div>
      </div>
    </motion.div>
  )
}

// ─── stage timeline ──────────────────────────────────────────────────────────

function StageTimeline({ stage, isAr }: { stage: RequestStage; isAr: boolean }) {
  const idx = stageIndex(stage)
  const labels: Record<RequestStage, { en: string; ar: string }> = {
    submitted: { en: "Submitted", ar: "أُرسل" },
    triage: { en: "Triaged", ar: "فُرز" },
    "in-progress": { en: "In progress", ar: "قيد التنفيذ" },
    review: { en: "Review", ar: "مراجعة" },
    closed: { en: "Closed", ar: "مغلق" },
  }
  return (
    <div className="flex items-center gap-1.5">
      {stageOrder.map((s, i) => {
        const passed = i <= idx
        const current = i === idx
        const label = labels[s]
        return (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  "size-2 shrink-0 rounded-full transition-colors",
                  passed ? "bg-primary" : "bg-muted-foreground/20",
                  current && "ring-2 ring-primary/30",
                )}
              />
              <span className={cn(
                "hidden lg:block text-[9px] font-medium tracking-tight",
                passed ? "text-foreground/70" : "text-muted-foreground/40",
              )}>
                {isAr ? label.ar : label.en}
              </span>
            </div>
            {i < stageOrder.length - 1 && (
              <span className={cn(
                "h-px flex-1 transition-colors",
                i < idx ? "bg-primary" : "bg-muted-foreground/20",
              )} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function ServicesHub() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const [searchQuery, setSearchQuery] = React.useState("")

  const assetIcon = (icon: "laptop" | "phone" | "key") => {
    if (icon === "laptop") return Laptop
    if (icon === "phone") return Smartphone
    return KeyRound
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-7 md:px-8">
      {/* Page heading */}
      <div className="space-y-1.5">
        <h1 className="text-[22px] font-bold tracking-tight md:text-[26px]">
          {isAr ? ar.pageTitle : "Service catalog & fulfillment"}
        </h1>
        <p className="max-w-3xl text-[13px] text-muted-foreground">
          {isAr ? ar.pageDesc : "Request a service, track your tickets, and keep an eye on your assets."}
        </p>
      </div>

      {/* ── Hero with search — calm blue/sky palette ── */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="highlight-card hl-sky relative overflow-hidden rounded-3xl"
      >
        <div className="relative z-10 flex flex-col gap-6 p-6 md:flex-row md:items-center md:p-8">
          <div className="flex-1 space-y-4">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-white/85">
                <Headset className="me-1.5 inline size-3" />
                {isAr ? ar.helloKhalid : "Hi Khalid"}
              </p>
              <h2 className="text-[22px] font-bold leading-tight md:text-[26px] text-white">
                {isAr ? ar.helpToday : "How can we help today?"}
              </h2>
            </div>
            <div className="relative">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 size-4 text-slate-400", isAr ? "right-4" : "left-4")} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? ar.searchPh : "Search a service, request, or guide…"}
                className={cn(
                  "h-12 rounded-xl border-0 !bg-white text-[14px] !text-slate-900 placeholder:!text-slate-500 shadow-lg shadow-black/20 focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600 dark:!bg-white dark:!text-slate-900 dark:placeholder:!text-slate-500",
                  isAr ? "pe-12 ps-4 text-right" : "ps-12 pe-4",
                )}
                dir={isAr ? "rtl" : "ltr"}
              />
            </div>
            <div className="space-y-2">
              <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-white/75">
                {isAr ? ar.popular : "Popular"}
              </div>
              <div className="flex flex-wrap gap-2">
                {popularRequests.map((p) => (
                  <motion.button
                    key={p.en}
                    type="button"
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSearchQuery(isAr ? p.ar : p.en)}
                    className="rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-[12px] font-medium text-white/95 backdrop-blur-sm transition-colors hover:bg-white/25"
                  >
                    {isAr ? p.ar : p.en}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="hidden md:block shrink-0"
          >
            <HeroIllustration className="h-44 w-auto" />
          </motion.div>
        </div>
      </motion.section>

      {/* ── KPI strip ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiMini
          label={isAr ? ar.kpiOpen : "Open requests"}
          value={String(serviceKpis.open)}
          hint={isAr ? ar.kpiOpenSub : "Currently in queue"}
          icon={TimerReset}
          tone="primary"
          delay={0}
        />
        <KpiMini
          label={isAr ? ar.kpiResolved : "Resolved this week"}
          value={String(serviceKpis.resolvedThisWeek)}
          hint={isAr ? ar.kpiResolvedSub : "Last 7 days"}
          icon={CheckCircle2}
          tone="emerald"
          delay={0.06}
        />
        <KpiMini
          label={isAr ? ar.kpiResponse : "Avg response"}
          value={`${serviceKpis.avgResponseHours}${isAr ? "س" : "h"}`}
          hint={isAr ? ar.kpiResponseSub : "Median time-to-first reply"}
          icon={Clock}
          tone="blue"
          delay={0.12}
        />
        <KpiMini
          label={isAr ? ar.kpiSla : "SLA hit rate"}
          value={`${serviceKpis.slaHitPct}%`}
          hint={isAr ? ar.kpiSlaSub : "Service-level agreements"}
          icon={TrendingUp}
          tone="violet"
          delay={0.18}
        />
      </div>

      {/* ── Catalog grid ── */}
      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <div>
            <div className="text-[13px] font-semibold">{isAr ? ar.catalog : "Browse the catalog"}</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground/65">{isAr ? ar.catalogSub : "Pick a category to start a request"}</div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {catalog.map((c, idx) => {
            const t = toneClasses(c.tone)
            const Icon = categoryIconMap[c.id] ?? Wrench
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: idx * 0.06 }}
                whileHover={{ y: -3 }}
              >
                <Card className="h-full gap-0 cursor-pointer overflow-hidden py-0 ring-1 ring-foreground/10 hover:shadow-lg hover:shadow-primary/5 transition-shadow">
                  <div className="space-y-3 px-5 pt-5 pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <span className={cn("flex size-11 items-center justify-center rounded-2xl", t.bg, t.text)}>
                        <Icon className="size-5" />
                      </span>
                      <div className="flex flex-col items-end gap-1">
                        {c.popular && (
                          <Badge variant="outline" className="gap-1 border-primary/30 bg-primary/10 text-[10px] text-primary">
                            <Sparkles className="size-2.5" />
                            {isAr ? ar.popularBadge : "Popular"}
                          </Badge>
                        )}
                        <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-bold tabular-nums text-muted-foreground">
                          {isAr ? ar.openBadge(c.open) : `${c.open} open`}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold leading-tight">{isAr ? c.nameAr : c.name}</div>
                      <div className="mt-1 text-[12px] leading-snug text-muted-foreground/75">
                        {isAr ? c.descriptionAr : c.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-border/50 bg-muted/20 px-5 py-2.5 dark:bg-muted/10">
                    <span className="text-[11px] font-medium text-primary">{isAr ? ar.open : "Open catalog"}</span>
                    <ArrowUpRight className={cn("size-3.5 text-primary", isAr && "rotate-90")} />
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ── Two-column: My requests | Quick form ── */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* My requests */}
        <Card className="ring-1 ring-foreground/10 lg:col-span-7">
          <div className="flex items-start justify-between gap-3 border-b border-border/60 px-5 py-4">
            <div>
              <div className="flex items-center gap-2 text-[13px] font-semibold">
                <span className="flex size-6 items-center justify-center rounded-md bg-primary/15 text-primary">
                  <Headset className="size-3.5" />
                </span>
                {isAr ? ar.myRequests : "My active requests"}
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground/65">
                {isAr ? ar.myRequestsSub : "Track progress and ETAs"}
              </div>
            </div>
            <Button variant="ghost" size="xs" className="gap-1 text-[11px] text-muted-foreground hover:text-primary">
              {isAr ? ar.viewAll : "View all"}
              <ChevronRight className={cn("size-3", isAr && "rotate-180")} />
            </Button>
          </div>
          <div className="divide-y divide-border/40">
            {requestTracker.map((r, idx) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: idx * 0.05 }}
                whileHover={{ x: isAr ? -3 : 3 }}
                className="group cursor-pointer space-y-3 px-5 py-4 transition-colors hover:bg-muted/20"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="rounded-md bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
                        {r.id}
                      </span>
                      <Badge variant="outline" className="border-border/60 text-[10px]">
                        {isAr ? r.categoryAr : r.category}
                      </Badge>
                    </div>
                    <div className="text-[13px] font-semibold leading-snug">{isAr ? r.titleAr : r.title}</div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <Avatar className="size-5">
                        <AvatarFallback className="bg-primary/15 text-primary text-[8px] font-bold">
                          {r.ownerInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[11px] text-muted-foreground">{isAr ? r.ownerAr : r.owner}</span>
                      <span className="text-muted-foreground/30">·</span>
                      <span className="text-[11px] text-muted-foreground">{isAr ? r.stageLabelAr : r.stageLabel}</span>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn("shrink-0 gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", slaClasses(r.slaTone))}
                  >
                    <Clock className="size-2.5" />
                    {isAr ? r.slaAr : r.sla}
                  </Badge>
                </div>
                <StageTimeline stage={r.stage} isAr={isAr} />
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Quick form + Knowledge base */}
        <div className="space-y-6 lg:col-span-5">
          <Card className="ring-1 ring-foreground/10">
            <div className="border-b border-border/60 px-5 py-4">
              <div className="flex items-center gap-2 text-[13px] font-semibold">
                <span className="flex size-6 items-center justify-center rounded-md bg-primary/15 text-primary">
                  <Plus className="size-3.5" />
                </span>
                {isAr ? ar.newRequest : "Submit a new request"}
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground/65">
                {isAr ? ar.newRequestSub : "Short form, quick send"}
              </div>
            </div>
            <div className="space-y-3 px-5 py-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/65">
                  <Settings2 className="size-3" />
                  {isAr ? ar.category : "Category"}
                </div>
                <Input placeholder={isAr ? ar.categoryPh : "Access · Hardware · Application"} dir={isAr ? "rtl" : "ltr"} />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/65">
                  <TrendingUp className="size-3" />
                  {isAr ? ar.urgency : "Urgency"}
                </div>
                <Input placeholder={isAr ? ar.urgencyPh : "Standard / High / Critical"} dir={isAr ? "rtl" : "ltr"} />
              </div>
              <div className="space-y-1.5">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/65">
                  {isAr ? ar.description : "Description"}
                </div>
                <Textarea
                  placeholder={isAr ? ar.descriptionPh : "What should the team know?"}
                  className="min-h-[90px] resize-none"
                  dir={isAr ? "rtl" : "ltr"}
                />
              </div>
              <Button className="w-full gap-2">
                <Send className="size-3.5" />
                {isAr ? ar.submit : "Submit request"}
              </Button>
            </div>
          </Card>

          <Card className="ring-1 ring-foreground/10">
            <div className="border-b border-border/60 px-5 py-4">
              <div className="flex items-center gap-2 text-[13px] font-semibold">
                <span className="flex size-6 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-500">
                  <BookOpen className="size-3.5" />
                </span>
                {isAr ? ar.knowledgeBase : "Knowledge base"}
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground/65">
                {isAr ? ar.knowledgeBaseSub : "Resolve faster, no waiting"}
              </div>
            </div>
            <ul className="divide-y divide-border/40">
              {knowledgeBase.map((k, i) => (
                <motion.li
                  key={k.en}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.18, delay: 0.1 + i * 0.05 }}
                  whileHover={{ backgroundColor: "rgba(35,144,90,0.05)" }}
                  className="group flex cursor-pointer items-center gap-3 px-5 py-3 transition-colors"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                    <BookOpen className="size-3.5" />
                  </span>
                  <span className="flex-1 text-[12px] leading-snug">{isAr ? k.ar : k.en}</span>
                  <ArrowRight className={cn("size-3.5 text-muted-foreground/30 group-hover:text-emerald-500 transition-colors", isAr && "rotate-180")} />
                </motion.li>
              ))}
            </ul>
            <div className="border-t border-border/40 px-5 py-3">
              <Button variant="ghost" size="xs" className="w-full justify-center text-[11px] text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-500">
                {isAr ? ar.exploreKb : "Explore the knowledge base"}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* ── Assets ── */}
      <Card className="ring-1 ring-foreground/10">
        <div className="flex items-center justify-between gap-2 border-b border-border/60 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md bg-violet-500/15 text-violet-500">
              <Laptop className="size-3.5" />
            </span>
            <div>
              <div className="text-[13px] font-semibold">{isAr ? ar.assets : "Your assets"}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground/65">{isAr ? ar.assetsSub : "Devices currently in your name"}</div>
            </div>
          </div>
        </div>
        <div className="grid gap-3 p-4 md:grid-cols-3">
          {assets.map((a, idx) => {
            const Icon = assetIcon(a.icon)
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: idx * 0.04 }}
                whileHover={{ y: -2 }}
                className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/20 p-4 ring-1 ring-foreground/5 transition-all hover:border-primary/30 hover:shadow-sm"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-500 ring-1 ring-violet-500/20">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-mono text-muted-foreground/55">{a.id}</div>
                  <div className="text-[13px] font-semibold leading-tight">{isAr ? a.nameAr : a.name}</div>
                  <div className="mt-1 text-[11px] text-muted-foreground/65">
                    {isAr ? ar.renewal : "Renewal"} · {isAr ? a.renewalAr : a.renewal}
                  </div>
                </div>
                <Badge variant="outline" className="shrink-0 text-[10px]">
                  {isAr ? a.ownerAr : a.owner}
                </Badge>
              </motion.div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
