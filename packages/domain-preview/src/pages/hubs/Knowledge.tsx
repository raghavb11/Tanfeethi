import * as React from "react"
import { motion } from "framer-motion"

import { Avatar, AvatarFallback, Badge, Button, Card, Input } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  ArrowUpRight,
  BookMarked,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Database,
  FileText,
  History,
  Lightbulb,
  Library,
  PenLine,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from "lucide-react"

const ar = {
  hubLabel: "المعرفة",
  pageTitle: "مركز المعرفة",
  pageDesc: "ابحث عن إجابات موثوقة، اقرأ المقالات الجديدة، واكتشف خبراء فريقك.",
  searchPh: "ابحث في المقالات والأدلة والأسئلة الشائعة…",
  askExpert: "اسأل خبيرًا",
  askAi: "اسأل ريتش",
  totalArticles: "مقالة",
  contributors: "كاتبًا",
  weeklyUpdates: "تحديثًا هذا الأسبوع",
  featured: "أدلة مميّزة",
  featuredDesc: "اختيار المحررين هذا الأسبوع",
  categories: "تصفّح حسب الفئة",
  recently: "آخر التحديثات",
  recentlyDesc: "محتوى حديث أو مُنقّح",
  topContributors: "أبرز الكتّاب",
  bookmarks: "محفوظاتك",
  verifiedQa: "إجابات موثّقة",
  readTime: (n: number) => `${n} د قراءة`,
  by: "بقلم",
  articleCount: (n: number) => `${n} مقالة`,
  contributions: (n: number) => `${n} مساهمة`,
  verified: "موثّق",
  view: "عرض",
  saved: "محفوظ",
  updated: "حُدّث",
}

const stats = {
  articles: 248,
  contributors: 34,
  weeklyUpdates: 17,
}

const featured: {
  id: string
  title: string
  titleAr: string
  excerpt: string
  excerptAr: string
  cover: string
  category: string
  categoryAr: string
  readMin: number
  author: { initials: string; name: string; nameAr: string }
}[] = [
  {
    id: "f1",
    title: "How we handle incident communications",
    titleAr: "كيف نتعامل مع تواصل الحوادث",
    excerpt: "A practical playbook for execs — what to send, when, and to whom.",
    excerptAr: "دليل عملي للقيادة — وش ترسل، ومتى، ولمن.",
    cover: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=600&h=320&q=85",
    category: "Operations",
    categoryAr: "عمليات",
    readMin: 6,
    author: { initials: "SP", name: "Sara P.", nameAr: "سارة ب." },
  },
  {
    id: "f2",
    title: "Hajj 1446 — work calendar & expectations",
    titleAr: "حج 1446 — التقويم الوظيفي والتوقّعات",
    excerpt: "Holiday window, on-call coverage, and travel approvals at a glance.",
    excerptAr: "نافذة الإجازة، تغطية الطوارئ، وموافقات السفر بنظرة سريعة.",
    cover: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=600&h=320&q=85",
    category: "People",
    categoryAr: "موظفون",
    readMin: 4,
    author: { initials: "AM", name: "Ahmed M.", nameAr: "أحمد م." },
  },
  {
    id: "f3",
    title: "SSO setup on a new device",
    titleAr: "إعداد الدخول الموحّد على جهاز جديد",
    excerpt: "Step-by-step with screenshots and common gotchas.",
    excerptAr: "خطوة بخطوة مع لقطات وأشياء شائعة تنتبه لها.",
    cover: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=600&h=320&q=85",
    category: "IT",
    categoryAr: "تقنية",
    readMin: 3,
    author: { initials: "MC", name: "Maya C.", nameAr: "مايا ت." },
  },
]

const categories: {
  id: string
  name: string
  nameAr: string
  count: number
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { id: "c1", name: "Operations", nameAr: "العمليات", count: 48, icon: BookOpen },
  { id: "c2", name: "People & HR", nameAr: "الموظفون", count: 32, icon: Users },
  { id: "c3", name: "Engineering", nameAr: "الهندسة", count: 67, icon: FileText },
  { id: "c4", name: "Design", nameAr: "التصميم", count: 24, icon: Lightbulb },
  { id: "c5", name: "Finance", nameAr: "المالية", count: 18, icon: TrendingUp },
  { id: "c6", name: "Data & Analytics", nameAr: "البيانات", count: 21, icon: Database },
]

const recentlyUpdated: {
  id: string
  title: string
  titleAr: string
  category: string
  categoryAr: string
  time: string
  timeAr: string
  author: string
  authorAr: string
  initials: string
}[] = [
  { id: "r1", title: "Q2 budget reforecast template", titleAr: "قالب إعادة توقّع ميزانية الربع الثاني", category: "Finance", categoryAr: "مالية", time: "Updated 2h ago", timeAr: "حُدّث قبل ساعتين", author: "Rana O.", authorAr: "رنا أ.", initials: "RO" },
  { id: "r2", title: "Vendor approval checklist", titleAr: "قائمة اعتماد الموردين", category: "Operations", categoryAr: "عمليات", time: "Updated yesterday", timeAr: "حُدّث أمس", author: "Sara M.", authorAr: "سارة م.", initials: "SM" },
  { id: "r3", title: "API style guide v3", titleAr: "دليل واجهات API الإصدار 3", category: "Engineering", categoryAr: "هندسة", time: "Updated 2 days ago", timeAr: "حُدّث قبل يومين", author: "Maya C.", authorAr: "مايا ت.", initials: "MC" },
  { id: "r4", title: "Contractor onboarding checklist", titleAr: "قائمة انضمام المتعاقدين", category: "People", categoryAr: "موظفون", time: "Updated 3 days ago", timeAr: "حُدّث قبل 3 أيام", author: "Ahmed M.", authorAr: "أحمد م.", initials: "AM" },
]

const contributors: { initials: string; name: string; nameAr: string; role: string; roleAr: string; contributions: number }[] = [
  { initials: "SM", name: "Sara Al-Mutairi", nameAr: "سارة المطيري", role: "Operations", roleAr: "عمليات", contributions: 84 },
  { initials: "AM", name: "Ahmed Mohammed", nameAr: "أحمد محمد", role: "Engineering", roleAr: "هندسة", contributions: 63 },
  { initials: "MC", name: "Maya Chen", nameAr: "مايا تشن", role: "Design", roleAr: "تصميم", contributions: 42 },
]

const bookmarks: { id: string; title: string; titleAr: string; date: string; dateAr: string }[] = [
  { id: "b1", title: "Quarterly OKR drafting guide", titleAr: "دليل صياغة أهداف الربع", date: "Saved Apr 28", dateAr: "محفوظ 28 أبريل" },
  { id: "b2", title: "Vendor approval checklist", titleAr: "قائمة اعتماد الموردين", date: "Saved Apr 22", dateAr: "محفوظ 22 أبريل" },
  { id: "b3", title: "Hajj working hours policy", titleAr: "سياسة ساعات العمل في الحج", date: "Saved Apr 18", dateAr: "محفوظ 18 أبريل" },
]

// ─── library spot illustration ──────────────────────────────────────────────
function LibraryIllustration() {
  return (
    <svg viewBox="0 0 240 180" className="h-32 w-auto" xmlns="http://www.w3.org/2000/svg" fill="none">
      {/* shelf */}
      <rect x="20" y="130" width="200" height="6" rx="2" fill="#94a3b8" opacity="0.4" />
      {/* books — left cluster */}
      <rect x="30" y="80" width="14" height="50" rx="2" fill="#1e40af" />
      <rect x="46" y="70" width="12" height="60" rx="2" fill="#0f766e" />
      <rect x="60" y="78" width="14" height="52" rx="2" fill="#7c3aed" />
      <rect x="76" y="74" width="10" height="56" rx="2" fill="#b45309" />
      {/* gap */}
      {/* center stacked */}
      <motion.g
        initial={{ y: 0 }}
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <rect x="100" y="76" width="36" height="10" rx="1.5" fill="#0f766e" />
        <rect x="100" y="86" width="36" height="10" rx="1.5" fill="#1e40af" />
        <rect x="100" y="96" width="36" height="10" rx="1.5" fill="#b45309" />
        <rect x="100" y="106" width="36" height="10" rx="1.5" fill="#7c3aed" />
        <rect x="100" y="116" width="36" height="14" rx="1.5" fill="#475569" />
      </motion.g>
      {/* right cluster */}
      <rect x="148" y="72" width="12" height="58" rx="2" fill="#7c3aed" />
      <rect x="162" y="78" width="14" height="52" rx="2" fill="#b45309" />
      <rect x="178" y="68" width="12" height="62" rx="2" fill="#1e40af" />
      <rect x="192" y="80" width="14" height="50" rx="2" fill="#0f766e" />
      {/* magnifier */}
      <motion.g
        initial={{ rotate: -10 }}
        animate={{ rotate: [-10, 4, -10] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "118px 50px" }}
      >
        <circle cx="118" cy="50" r="20" fill="rgba(255,255,255,0.92)" stroke="#1e40af" strokeWidth="2.5" />
        <circle cx="118" cy="50" r="13" fill="rgba(30,64,175,0.08)" />
        <line x1="135" y1="65" x2="148" y2="80" stroke="#1e40af" strokeWidth="3.5" strokeLinecap="round" />
      </motion.g>
      {/* sparkles */}
      <circle cx="40" cy="40" r="2.5" fill="#1e40af" opacity="0.6" />
      <circle cx="200" cy="50" r="2" fill="#7c3aed" opacity="0.6" />
      <path d="M210 100 l1 3 3 0 -2.5 2 1 3 -2.5-2 -2.5 2 1-3 -2.5-2 3 0z" fill="#b45309" opacity="0.5" />
    </svg>
  )
}

export default function KnowledgeHub() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const [query, setQuery] = React.useState("")

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 px-4 py-7 md:px-8">
      {/* Heading */}
      <div className="space-y-1.5">
        <h1 className="text-[22px] font-bold tracking-tight md:text-[26px]">
          {isAr ? ar.pageTitle : "Knowledge Hub"}
        </h1>
        <p className="text-[13px] text-muted-foreground">
          {isAr ? ar.pageDesc : "Find verified answers, read fresh articles, and discover experts on your team."}
        </p>
      </div>

      {/* Hero — soft slate/parchment, NOT green */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="highlight-card hl-sky relative overflow-hidden rounded-3xl"
      >
        <div className="relative z-10 flex flex-col gap-5 p-6 md:flex-row md:items-center md:p-7">
          <div className="flex-1 space-y-4">
            <Badge variant="outline" className="gap-1 border-blue-400/25 bg-blue-400/10 text-[10px] text-blue-200">
              <Library className="size-2.5" />
              {isAr ? "مكتبة الفريق" : "Team library"}
            </Badge>
            <div>
              <h2 className="font-heading text-[20px] font-bold leading-tight tracking-tight md:text-[24px] text-white">
                {isAr ? "وش تبي تتعلمه اليوم؟" : "What do you want to learn today?"}
              </h2>
              <p className="mt-1.5 text-[13px] text-white/60">
                {isAr ? `${stats.articles} مقالة · ${stats.contributors} كاتبًا · ${stats.weeklyUpdates} تحديثًا هذا الأسبوع` : `${stats.articles} articles · ${stats.contributors} contributors · ${stats.weeklyUpdates} updates this week`}
              </p>
            </div>
            <div className="relative">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 size-4 text-white/40", isAr ? "right-4" : "left-4")} />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isAr ? ar.searchPh : "Search articles, guides, FAQs…"}
                className={cn(
                  "h-11 rounded-xl border-white/15 bg-white/5 text-[14px] text-white placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-400/40",
                  isAr ? "pe-12 ps-4" : "ps-12 pe-4",
                )}
                dir={isAr ? "rtl" : "ltr"}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11.5px] font-medium text-white/85 transition-colors hover:bg-white/10">
                <Sparkles className="size-3 text-blue-300" />
                {isAr ? ar.askAi : "Ask Reach AI"}
              </button>
              <button type="button" className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11.5px] font-medium text-white/85 transition-colors hover:bg-white/10">
                <Users className="size-3 text-amber-300" />
                {isAr ? ar.askExpert : "Ask an expert"}
              </button>
            </div>
          </div>
          <div className="hidden md:block shrink-0">
            <LibraryIllustration />
          </div>
        </div>
      </motion.section>

      {/* Featured guides */}
      <section>
        <div className="mb-4 flex items-baseline gap-2">
          <Star className="size-3.5 text-amber-500" />
          <span className="text-[13px] font-semibold">{isAr ? ar.featured : "Featured guides"}</span>
          <span className="text-[11px] text-muted-foreground/65">{isAr ? ar.featuredDesc : "Editor's pick this week"}</span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {featured.map((a, idx) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: idx * 0.06 }}
              whileHover={{ y: -3 }}
            >
              <Card className="h-full gap-0 cursor-pointer overflow-hidden py-0 ring-1 ring-foreground/10 hover:shadow-lg hover:shadow-blue-500/5 transition-shadow">
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img src={a.cover} alt="" className="size-full object-cover transition-transform duration-300 hover:scale-105" loading="lazy" />
                  <Badge variant="outline" className="absolute top-2 start-2 border-white/30 bg-black/40 text-[10px] text-white backdrop-blur-sm">
                    {isAr ? a.categoryAr : a.category}
                  </Badge>
                </div>
                <div className="space-y-2 px-4 pt-3 pb-4">
                  <div className="text-[13.5px] font-semibold leading-snug">{isAr ? a.titleAr : a.title}</div>
                  <p className="line-clamp-2 text-[11.5px] leading-snug text-muted-foreground/75">
                    {isAr ? a.excerptAr : a.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      <Avatar className="size-5">
                        <AvatarFallback className="bg-blue-500/15 text-blue-600 dark:text-blue-400 text-[8px] font-bold">
                          {a.author.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[10.5px] text-muted-foreground/70">
                        {isAr ? a.author.nameAr : a.author.name}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-[10.5px] text-muted-foreground/55">
                      <Clock className="size-2.5" />
                      {isAr ? ar.readTime(a.readMin) : `${a.readMin} min read`}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories — clean uniform grid */}
      <section>
        <div className="mb-4 text-[13px] font-semibold">{isAr ? ar.categories : "Browse by category"}</div>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, idx) => {
            const Icon = c.icon
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.16, delay: idx * 0.03 }}
                whileHover={{ x: isAr ? -3 : 3 }}
                className="group flex cursor-pointer items-center gap-3 rounded-xl border border-border/60 panel p-3.5 transition-all hover:border-blue-500/30 hover:shadow-sm"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/8 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/15">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-semibold">{isAr ? c.nameAr : c.name}</div>
                  <div className="text-[10.5px] text-muted-foreground/65">
                    {isAr ? ar.articleCount(c.count) : `${c.count} articles`}
                  </div>
                </div>
                <ChevronRight className={cn("size-4 text-muted-foreground/30 group-hover:text-blue-500 transition-colors", isAr && "rotate-180")} />
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Recently updated + sidebar */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="ring-1 ring-foreground/10 lg:col-span-7">
          <div className="border-b border-border/60 px-5 py-4">
            <div className="flex items-center gap-2 text-[13px] font-semibold">
              <History className="size-3.5 text-slate-500" />
              {isAr ? ar.recently : "Recently updated"}
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground/65">{isAr ? ar.recentlyDesc : "Fresh or recently revised"}</div>
          </div>
          <ul className="divide-y divide-border/40">
            {recentlyUpdated.map((r, idx) => (
              <motion.li
                key={r.id}
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.18, delay: idx * 0.04 }}
                className="group flex cursor-pointer items-center gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/40"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <FileText className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12.5px] font-semibold leading-snug">{isAr ? r.titleAr : r.title}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-[10.5px] text-muted-foreground/65">
                    <Badge variant="outline" className="border-border/60 px-1.5 py-0 text-[9px]">
                      {isAr ? r.categoryAr : r.category}
                    </Badge>
                    <span>{isAr ? r.timeAr : r.time}</span>
                    <span className="text-muted-foreground/30">·</span>
                    <Avatar className="size-4">
                      <AvatarFallback className="bg-slate-200 dark:bg-slate-700 text-[7px] font-bold">{r.initials}</AvatarFallback>
                    </Avatar>
                    <span>{isAr ? r.authorAr : r.author}</span>
                  </div>
                </div>
                <ArrowUpRight className={cn("size-3.5 text-muted-foreground/30 group-hover:text-blue-500 transition-colors", isAr && "rotate-90")} />
              </motion.li>
            ))}
          </ul>
        </Card>

        <div className="space-y-4 lg:col-span-5">
          {/* Top contributors */}
          <Card className="ring-1 ring-foreground/10">
            <div className="border-b border-border/60 px-4 py-3 text-[13px] font-semibold flex items-center gap-2">
              <Star className="size-3.5 text-amber-500" />
              {isAr ? ar.topContributors : "Top contributors"}
            </div>
            <ul className="divide-y divide-border/40">
              {contributors.map((c, i) => (
                <li key={c.initials} className="flex items-center gap-3 px-4 py-3">
                  <span className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold tabular-nums",
                    i === 0 ? "bg-amber-500 text-white" : i === 1 ? "bg-slate-300 text-slate-700" : "bg-amber-700/60 text-white",
                  )}>
                    {i + 1}
                  </span>
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-blue-500/15 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                      {c.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12px] font-semibold">{isAr ? c.nameAr : c.name}</div>
                    <div className="truncate text-[10.5px] text-muted-foreground/65">{isAr ? c.roleAr : c.role}</div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold tabular-nums text-blue-600 dark:text-blue-400">
                    <PenLine className="size-3" />
                    {c.contributions}
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          {/* Bookmarks */}
          <Card className="ring-1 ring-foreground/10">
            <div className="border-b border-border/60 px-4 py-3 text-[13px] font-semibold flex items-center gap-2">
              <BookMarked className="size-3.5 text-violet-500" />
              {isAr ? ar.bookmarks : "Your bookmarks"}
            </div>
            <ul className="divide-y divide-border/40">
              {bookmarks.map((b) => (
                <li key={b.id} className="group flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors">
                  <BookMarked className="mt-0.5 size-3.5 shrink-0 text-violet-500" fill="currentColor" fillOpacity={0.2} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] font-semibold leading-snug">{isAr ? b.titleAr : b.title}</div>
                    <div className="mt-0.5 text-[10.5px] text-muted-foreground/55">{isAr ? b.dateAr : b.date}</div>
                  </div>
                  <ArrowUpRight className="size-3.5 self-center text-muted-foreground/30 group-hover:text-violet-500 transition-colors" />
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {/* Verified Q&A */}
      <Card className="ring-1 ring-foreground/10">
        <div className="border-b border-border/60 px-5 py-4 text-[13px] font-semibold flex items-center gap-2">
          <CheckCircle2 className="size-3.5 text-emerald-500" />
          {isAr ? ar.verifiedQa : "Verified answers"}
        </div>
        <ul className="divide-y divide-border/40">
          {[
            { id: "q1", q: "What's the policy on remote-work stipends?", qAr: "وش سياسة بدلات العمل عن بُعد؟", v: "People Ops", vAr: "الموارد البشرية" },
            { id: "q2", q: "How do I escalate a stuck procurement request?", qAr: "كيف أرفع طلب مشتريات متوقف؟", v: "Procurement", vAr: "المشتريات" },
            { id: "q3", q: "Which expense category covers conference travel?", qAr: "أي فئة مصاريف تغطي السفر للمؤتمرات؟", v: "Finance", vAr: "المالية" },
          ].map((q, idx) => (
            <motion.li
              key={q.id}
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.16, delay: idx * 0.04 }}
              className="group flex items-start gap-3 px-5 py-3.5 cursor-pointer transition-colors hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20"
            >
              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] font-semibold leading-snug">{isAr ? q.qAr : q.q}</div>
                <div className="mt-1 text-[10.5px] text-muted-foreground/65">
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">{isAr ? ar.verified : "Verified"}</span> · {isAr ? q.vAr : q.v}
                </div>
              </div>
              <Button size="xs" variant="ghost" className="shrink-0 text-[11px] text-muted-foreground group-hover:text-emerald-600">
                {isAr ? ar.view : "View"}
              </Button>
            </motion.li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
