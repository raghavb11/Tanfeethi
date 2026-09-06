import * as React from "react"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { Link, useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, Badge } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  ArrowRight, Banknote, Bell, BookOpen, CalendarClock, CalendarDays, ClipboardList, Coffee, Command,
  Contact, FileText, FolderOpen, Gauge, Gift, HelpCircle, Home, IdCard, Languages, Link2, ListTodo,
  Megaphone, Moon, Network, Newspaper, Plane, ScrollText, Search, ShieldCheck, Sparkles, Sun, Users,
  UsersRound, Video, Wallet,
} from "lucide-react"

/** A homepage that carries navigation itself, so the product needs no side nav.
 *  Rendered OUTSIDE AppShell — there is genuinely no sidebar on this route.
 *  Sample for review: the existing home at "/" is untouched. */

type Tile = {
  to: string
  label: string
  labelAr: string
  icon: React.ComponentType<{ className?: string }>
  hint?: string
  hintAr?: string
  badge?: string
}

type Group = { id: string; label: string; labelAr: string; tiles: Tile[] }

const GROUPS: Group[] = [
  {
    id: "me", label: "Me", labelAr: "أنا",
    tiles: [
      { to: "/employee", label: "Employee Center", labelAr: "مركز الموظف", icon: Home, hint: "Profile, pay, requests", hintAr: "الملف، الراتب، الطلبات" },
      { to: "/employee/card", label: "Business card", labelAr: "بطاقة العمل", icon: IdCard, hint: "Show or share", hintAr: "اعرض أو شارك" },
      { to: "/attendance", label: "Attendance", labelAr: "الحضور", icon: CalendarClock, hint: "Clocked in 08:42", hintAr: "الحضور 08:42" },
      { to: "/leave", label: "Leave", labelAr: "الإجازات", icon: Plane, hint: "14 days left", hintAr: "14 يومًا متبقيًا" },
      { to: "/payslip", label: "Payslips", labelAr: "قسائم الراتب", icon: Wallet },
      { to: "/benefits", label: "Benefits", labelAr: "المزايا", icon: Gift },
    ],
  },
  {
    id: "work", label: "Work", labelAr: "العمل",
    tiles: [
      { to: "/tasks", label: "My Tasks", labelAr: "مهامي", icon: ListTodo, badge: "9" },
      { to: "/work", label: "Work Center", labelAr: "مركز العمل", icon: Gauge },
      { to: "/manager", label: "Manager dashboard", labelAr: "لوحة المدير", icon: UsersRound, hint: "5 awaiting you", hintAr: "5 بانتظارك", badge: "5" },
      { to: "/org-chart", label: "Org Chart", labelAr: "الهيكل التنظيمي", icon: Network },
      { to: "/directory", label: "Directory", labelAr: "دليل الموظفين", icon: Contact },
      { to: "/intelligence", label: "Intelligence", labelAr: "التحليلات", icon: Sparkles },
    ],
  },
  {
    id: "services", label: "Services", labelAr: "الخدمات",
    tiles: [
      { to: "/services", label: "Service Center", labelAr: "مركز الخدمات", icon: ClipboardList, hint: "HR, IT, Finance", hintAr: "الموارد، التقنية، المالية" },
      { to: "/cafeteria", label: "Cafeteria", labelAr: "الكافتيريا", icon: Coffee, hint: "Order to your desk", hintAr: "اطلب إلى مكتبك" },
      { to: "/leave/request", label: "Request leave", labelAr: "طلب إجازة", icon: Plane },
      { to: "/services", label: "Submit expense", labelAr: "تقديم مصروف", icon: Banknote },
      { to: "/services", label: "Request a letter", labelAr: "طلب خطاب", icon: FileText },
    ],
  },
  {
    id: "know", label: "Know", labelAr: "المعرفة",
    tiles: [
      { to: "/news", label: "News", labelAr: "الأخبار", icon: Newspaper },
      { to: "/announcements", label: "Announcements", labelAr: "الإعلانات", icon: Megaphone, badge: "2" },
      { to: "/events", label: "Events", labelAr: "الفعاليات", icon: CalendarDays },
      { to: "/policies", label: "Policies", labelAr: "السياسات", icon: ScrollText },
      { to: "/faqs", label: "FAQs", labelAr: "الأسئلة الشائعة", icon: HelpCircle },
      { to: "/documents", label: "Document Library", labelAr: "مكتبة المستندات", icon: FolderOpen },
      { to: "/knowledge", label: "Knowledge Center", labelAr: "مركز المعرفة", icon: BookOpen, hint: "248 articles", hintAr: "248 مقالة" },
      { to: "/surveys", label: "Surveys & Polls", labelAr: "الاستبيانات", icon: ClipboardList },
      { to: "/community", label: "Community", labelAr: "المجتمع", icon: Users },
      { to: "/links", label: "Quick Links", labelAr: "روابط سريعة", icon: Link2 },
    ],
  },
  {
    id: "admin", label: "Administration", labelAr: "الإدارة",
    tiles: [
      { to: "/cms", label: "Content Management", labelAr: "إدارة المحتوى", icon: Gauge },
      { to: "/admin/notifications", label: "Notifications", labelAr: "الإشعارات", icon: Bell },
      { to: "/admin/roles", label: "Roles & Permissions", labelAr: "الأدوار والصلاحيات", icon: ShieldCheck },
      { to: "/cafeteria/admin", label: "Cafeteria queue", labelAr: "قائمة الكافتيريا", icon: Coffee },
    ],
  },
]

const RECENT: Tile[] = [
  { to: "/news", label: "News", labelAr: "الأخبار", icon: Newspaper },
  { to: "/manager", label: "Manager dashboard", labelAr: "لوحة المدير", icon: UsersRound },
  { to: "/cafeteria", label: "Cafeteria", labelAr: "الكافتيريا", icon: Coffee },
  { to: "/knowledge", label: "Knowledge Center", labelAr: "مركز المعرفة", icon: BookOpen },
]

const TODAY = [
  { to: "/manager", icon: ClipboardList, value: "5", label: "Awaiting your approval", labelAr: "بانتظار اعتمادك", tone: "text-primary" },
  { to: "/tasks", icon: ListTodo, value: "9", label: "Open tasks", labelAr: "مهام مفتوحة", tone: "text-foreground" },
  { to: "/employee", icon: Bell, value: "2", label: "HR notifications", labelAr: "إشعارات الموارد البشرية", tone: "text-foreground" },
  { to: "/cafeteria/orders", icon: Coffee, value: "2", label: "Cafeteria orders", labelAr: "طلبات الكافتيريا", tone: "text-foreground" },
]

export default function HomeV2() {
  const { locale, setLocale, setCommandOpen } = useShell()
  const { resolvedTheme, setTheme } = useTheme()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const [query, setQuery] = React.useState("")

  const all = React.useMemo(() => GROUPS.flatMap((g) => g.tiles.map((x) => ({ ...x, group: g }))), [])
  const q = query.trim().toLowerCase()
  const hits = q
    ? all.filter((x) => x.label.toLowerCase().includes(q) || x.labelAr.includes(query.trim())).slice(0, 8)
    : []

  return (
    <div className="ambient-page relative min-h-svh bg-background text-foreground" dir={isAr ? "rtl" : "ltr"}>
      <div className="app-grain" aria-hidden="true" />
      <div className="app-vignette" aria-hidden="true" />

      {/* slim utility bar — no navigation, just identity and preferences */}
      <header className="relative z-10 mx-auto flex max-w-[1180px] items-center justify-between gap-3 px-4 py-5 md:px-8">
        <span className="text-[13px] font-semibold tracking-[0.18em] text-muted-foreground">ALTANFEETHI</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setLocale(isAr ? "en" : "ar")}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-[12px] font-semibold text-muted-foreground transition-colors hover:bg-muted/40"
          >
            <Languages className="size-3.5" />{isAr ? "EN" : "ع"}
          </button>
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label={t("Toggle theme", "تبديل المظهر")}
            className="rounded-full border border-border/60 p-2 text-muted-foreground transition-colors hover:bg-muted/40"
          >
            {resolvedTheme === "dark" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
          </button>
          <Link to="/employee" className="ms-1 flex items-center gap-2 rounded-full border border-border/60 py-1 pe-3 ps-1 transition-colors hover:bg-muted/40">
            <Avatar className="size-7"><AvatarFallback className="bg-[#CE7B5B] text-[11px] font-bold text-white">KS</AvatarFallback></Avatar>
            <span className="text-[12px] font-semibold">{t("Khalid", "خالد")}</span>
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-[1180px] px-4 pb-20 md:px-8">
        {/* hero */}
        <motion.section initial={{ y: 10 }} animate={{ y: 0 }} transition={{ duration: 0.35 }} className="pt-6 text-center md:pt-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/25 px-3 py-1 text-[11.5px] text-muted-foreground">
            <Sun className="size-3.5 text-primary" />
            {t("Sunday · 26 July 2026 · Riyadh 43°", "الأحد · 26 يوليو 2026 · الرياض 43°")}
          </div>
          <h1 className="mt-4 text-[30px] font-bold tracking-tight md:text-[42px]">
            {t("Good morning, Khalid", "صباح الخير، خالد")}
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-[14px] text-muted-foreground">
            {t("Everything you need is one search or one tap away.", "كل ما تحتاجه على بُعد بحث واحد أو نقرة واحدة.")}
          </p>

          {/* the primary way to get anywhere */}
          <div className="relative mx-auto mt-7 max-w-2xl">
            <Search className="pointer-events-none absolute start-5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground/60" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && hits[0]) navigate(hits[0].to) }}
              placeholder={t("Search for anything — leave, payslip, a policy, a colleague…", "ابحث عن أي شيء — إجازة، قسيمة راتب، سياسة، زميل…")}
              className="h-14 w-full rounded-2xl border border-border/60 bg-card ps-14 pe-28 text-[14px] shadow-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
            />
            <button
              onClick={() => setCommandOpen(true)}
              className="absolute end-3 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-muted"
            >
              <Command className="size-3" />K
            </button>

            {hits.length > 0 && (
              <div className="absolute inset-x-0 top-[60px] z-20 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xl">
                {hits.map((h) => (
                  <button
                    key={`${h.to}-${h.label}`}
                    onClick={() => navigate(h.to)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-start transition-colors hover:bg-muted/50"
                  >
                    <span className="flex size-8 items-center justify-center rounded-lg bg-primary/12 text-primary"><h.icon className="size-4" /></span>
                    <span className="text-[13px] font-medium">{isAr ? h.labelAr : h.label}</span>
                    <span className="ms-auto text-[11px] text-muted-foreground/60">{isAr ? h.group.labelAr : h.group.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* AI suggestions, same idea as the assistant bar */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {[
              ["Summarise the Q3 report", "لخّص تقرير الربع الثالث"],
              ["What needs my approval?", "ما الذي يحتاج اعتمادي؟"],
              ["Order coffee to the boardroom", "اطلب قهوة إلى قاعة المجلس"],
            ].map(([en, ar]) => (
              <button
                key={en}
                onClick={() => setCommandOpen(true)}
                className="rounded-full border border-border/60 bg-card/60 px-3.5 py-1.5 text-[12px] text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
              >
                {isAr ? ar : en}
              </button>
            ))}
          </div>
        </motion.section>

        {/* today strip */}
        <section className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TODAY.map((c) => (
            <Link
              key={c.label}
              to={c.to}
              className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-card/70 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary"><c.icon className="size-5" /></span>
              <div className="min-w-0">
                <div className={cn("text-[20px] font-bold leading-none tabular-nums", c.tone)}>{c.value}</div>
                <div className="mt-1 truncate text-[11.5px] text-muted-foreground">{isAr ? c.labelAr : c.label}</div>
              </div>
              <ArrowRight className={cn("ms-auto size-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5", isAr && "rotate-180 group-hover:-translate-x-0.5")} />
            </Link>
          ))}
        </section>

        {/* next meeting — the one thing worth surfacing whole */}
        <section className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/25 bg-primary/[0.06] p-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary"><Video className="size-5" /></span>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">{t("In 25 minutes", "خلال 25 دقيقة")}</div>
              <div className="mt-0.5 truncate text-[15px] font-bold">{t("Portfolio review", "مراجعة المحفظة")}</div>
              <div className="mt-0.5 text-[11.5px] text-muted-foreground">{t("10:00 AM · 60 min · Zoom · 8 attendees", "10:00 · 60 دقيقة · Zoom · 8 مشاركين")}</div>
            </div>
          </div>
          <button className="rounded-xl bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90">
            {t("Join", "انضم")}
          </button>
        </section>

        {/* jump back in */}
        <section className="mt-10">
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {t("Jump back in", "متابعة")}
          </h2>
          <div className="flex flex-wrap gap-2">
            {RECENT.map((r) => (
              <Link
                key={r.label}
                to={r.to}
                className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-2 text-[12.5px] font-medium transition-all hover:-translate-y-0.5 hover:border-primary/30"
              >
                <r.icon className="size-4 text-primary" />{isAr ? r.labelAr : r.label}
              </Link>
            ))}
          </div>
        </section>

        {/* knowledge center — the answer layer, given its own presence */}
        <section className="mt-10">
          <Link
            to="/knowledge"
            className="group flex flex-col gap-5 rounded-2xl border border-border/60 bg-card/70 p-6 transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lg md:flex-row md:items-center md:justify-between"
          >
            <div className="flex min-w-0 items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <BookOpen className="size-6" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[17px] font-bold tracking-tight">{t("Knowledge Center", "مركز المعرفة")}</h2>
                  <Badge variant="outline" className="border-primary/30 text-[10px] text-primary">
                    {t("17 updated this week", "17 تحديثًا هذا الأسبوع")}
                  </Badge>
                </div>
                <p className="mt-1 max-w-xl text-[12.5px] text-muted-foreground">
                  {t(
                    "Verified answers, guides and the people who wrote them — search before you ask.",
                    "إجابات موثوقة وأدلة ومن كتبها — ابحث قبل أن تسأل.",
                  )}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    ["Incident communications", "تواصل الحوادث"],
                    ["Hajj 1446 work calendar", "تقويم عمل حج 1446"],
                    ["SSO on a new device", "الدخول الموحّد على جهاز جديد"],
                  ].map(([en, arv]) => (
                    <span key={en} className="rounded-full border border-border/60 bg-muted/25 px-3 py-1 text-[11.5px] text-muted-foreground">
                      {isAr ? arv : en}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-6 md:gap-8">
              <div className="text-center">
                <div className="text-[22px] font-bold leading-none tabular-nums">248</div>
                <div className="mt-1 text-[10.5px] text-muted-foreground">{t("Articles", "مقالة")}</div>
              </div>
              <div className="text-center">
                <div className="text-[22px] font-bold leading-none tabular-nums">34</div>
                <div className="mt-1 text-[10.5px] text-muted-foreground">{t("Contributors", "كاتبًا")}</div>
              </div>
              <ArrowRight className={cn("size-5 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5", isAr && "rotate-180 group-hover:-translate-x-0.5")} />
            </div>
          </Link>
        </section>

        {/* the navigation itself */}
        {GROUPS.map((g) => (
          <section key={g.id} className="mt-10">
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {isAr ? g.labelAr : g.label}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {g.tiles.map((tile) => (
                <Link
                  key={`${g.id}-${tile.label}`}
                  to={tile.to}
                  className="group relative flex items-start gap-3 overflow-hidden rounded-2xl border border-border/60 bg-card/70 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lg"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <tile.icon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[13.5px] font-semibold">{isAr ? tile.labelAr : tile.label}</span>
                      {tile.badge && <Badge variant="outline" className="shrink-0 border-primary/30 text-[10px] text-primary">{tile.badge}</Badge>}
                    </div>
                    {(tile.hint || tile.hintAr) && (
                      <div className="mt-0.5 truncate text-[11.5px] text-muted-foreground/70">{isAr ? tile.hintAr : tile.hint}</div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <p className="mt-14 text-center text-[11.5px] text-muted-foreground/60">
          {t(
            "Sample home — navigation lives on this page, so no side menu is needed.",
            "صفحة رئيسية تجريبية — التنقّل داخل الصفحة، فلا حاجة إلى قائمة جانبية.",
          )}
        </p>
      </main>
    </div>
  )
}
