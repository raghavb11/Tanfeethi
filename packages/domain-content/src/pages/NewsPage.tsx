import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Badge, Button, Card, Input } from "@reach/shared-ui"
import { useShell } from "@reach/shell-context"
import { cn } from "@reach/shared-core"
import { CalendarDays, FileText, History, Newspaper, Pencil, Search, Send } from "lucide-react"

import { useArticles } from "../store"
import { metaFor, NEWS, type NewsItem, type Status } from "../data/news"

const STATUS_STYLE: Record<Status, string> = {
  Published: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Scheduled: "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  Draft: "border-border bg-muted text-muted-foreground",
  Archived: "border-border bg-muted/60 text-muted-foreground",
}
const STATUS_AR: Record<Status, string> = { Published: "منشور", Scheduled: "مجدول", Draft: "مسودة", Archived: "مؤرشف" }

export default function NewsPage() {
  const { locale, role } = useShell()
  const isAr = locale === "ar"
  const isAdmin = role === "admin"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const created = useArticles()

  const [cat, setCat] = React.useState("All")
  const [q, setQ] = React.useState("")

  // Authored articles sit alongside the seeded newsroom content.
  const all: NewsItem[] = React.useMemo(() => {
    const authored: NewsItem[] = created.map((a) => ({
      id: a.id, title: a.title, titleAr: a.title, category: a.category,
      date: a.date === "—" ? "—" : a.date, excerpt: a.excerpt,
      status: (a.status === "Draft" ? "Draft" : "Published") as Status,
      tint: "#234024", img: a.cover ?? "", body: a.body ?? "",
    }))
    return [...authored, ...NEWS]
  }, [created])

  const statusOf = (n: NewsItem, i: number) => metaFor(n.id, i).status ?? n.status

  const counts = {
    published: all.filter((n, i) => statusOf(n, i) === "Published").length,
    drafts: all.filter((n, i) => statusOf(n, i) === "Draft").length,
    scheduled: all.filter((n, i) => statusOf(n, i) === "Scheduled").length,
    thisMonth: all.filter((n, i) => statusOf(n, i) === "Published" && /2026/.test(n.date)).length,
  }

  /** Employees only ever see published articles; admins also see drafts and
   *  scheduled items so they remain reachable from this screen. */
  const visible = all.filter((n, i) => (isAdmin ? true : statusOf(n, i) === "Published"))

  const categories = React.useMemo(
    () => ["All", ...Array.from(new Set(visible.map((n) => n.category)))],
    [visible],
  )

  const filtered = visible.filter((n) => {
    const inCat = cat === "All" || n.category === cat
    const needle = q.trim().toLowerCase()
    const inSearch = !needle
      || (isAr ? n.titleAr : n.title).toLowerCase().includes(needle)
      || (n.excerpt || "").toLowerCase().includes(needle)
    return inCat && inSearch
  })

  // the newest published article leads the page
  const lead = filtered.find((n, i) => statusOf(n, i) === "Published" && n.img)
  const rest = filtered.filter((n) => n !== lead)

  const open = (id: string) => navigate(`/news/${id}`)

  return (
    <main className="@container mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
      {/* header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-primary/12 text-primary"><Newspaper className="size-4" /></span>
            <span className="text-[13px] font-semibold text-primary">{t("News & Announcements", "الأخبار والإعلانات")}</span>
          </div>
          <h1 className="mt-3 font-heading text-[32px] font-bold leading-tight tracking-tight sm:text-[38px]">
            {t("What's happening at Tanfeethi", "ما الجديد في التنفيذي")}
          </h1>
          <p className="mt-2 text-[14px] text-muted-foreground">
            {isAdmin
              ? t("Corporate news, announcements and stories — authored, scheduled and published from the CMS.", "أخبار وإعلانات وقصص الشركة — تُكتب وتُجدول وتُنشر من نظام إدارة المحتوى.")
              : t("Corporate news, announcements and stories from across ALTANFEETHI.", "أخبار وإعلانات وقصص من مختلف قطاعات التنفيذي.")}
          </p>
        </div>
        {isAdmin && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate("/news/new")}><Send className="size-4" />{t("New article", "مقال جديد")}</Button>
            <Button onClick={() => navigate("/admin/audit?module=News")}><History className="size-4" />{t("Audit log", "سجل التدقيق")}</Button>
          </div>
        )}
      </div>

      {/* stats — admin only */}
      {isAdmin && (
        <div className="mb-6 grid grid-cols-2 gap-4 @3xl:grid-cols-4">
          <Stat value={counts.published} label={t("Published", "منشورة")} sub={t("all time", "الإجمالي")} icon={Newspaper} />
          <Stat value={counts.drafts} label={t("Drafts", "مسودات")} sub={t("in review", "قيد المراجعة")} icon={FileText} />
          <Stat value={counts.thisMonth} label={t("This month", "هذا الشهر")} sub={t("published", "منشورة")} icon={CalendarDays} />
          <Stat value={counts.scheduled} label={t("Scheduled", "مجدولة")} sub={t("upcoming", "قادمة")} icon={History} />
        </div>
      )}

      {/* lead story */}
      {lead && (
        <Card
          onClick={() => open(lead.id)}
          className="mb-6 grid cursor-pointer overflow-hidden p-0 transition-shadow hover:shadow-md @3xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="relative h-52 bg-muted @3xl:h-full @3xl:min-h-[260px]">
            {lead.img && <img src={lead.img} alt="" className="absolute inset-0 size-full object-cover" loading="lazy" />}
          </div>
          <div className="flex flex-col justify-center gap-3 p-6 @2xl:p-8">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="outline" className="rounded-full">{lead.category}</Badge>
              <span className="text-[12.5px] text-muted-foreground">{lead.date}</span>
            </div>
            <h2 className="font-heading text-[22px] font-bold leading-snug tracking-tight @2xl:text-[26px]">
              {isAr ? lead.titleAr : lead.title}
            </h2>
            {lead.excerpt && <p className="text-[13.5px] leading-relaxed text-muted-foreground">{lead.excerpt}</p>}
            <div>
              <Button className="mt-1" onClick={(e) => { e.stopPropagation(); open(lead.id) }}>
                {t("Read article", "اقرأ المقال")}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* category pills + search */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c}
              className={cn("rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                cat === c
                  ? "border-primary/45 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground")}>
              {c === "All" ? t("All", "الكل") : c}
            </button>
          ))}
        </div>
        <div className="relative w-[260px]">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search news…", "ابحث في الأخبار…")} className="h-10 ps-9" />
        </div>
      </div>

      {/* grid */}
      {rest.length === 0 ? (
        <Card className="p-14 text-center">
          <Newspaper className="mx-auto size-8 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">{t("No articles match this filter.", "لا توجد مقالات تطابق هذا الفلتر.")}</p>
        </Card>
      ) : (
        <div className="grid gap-5 @2xl:grid-cols-2 @5xl:grid-cols-3">
          {rest.map((n, i) => {
            const s = statusOf(n, i)
            return (
              <Card key={n.id} onClick={() => open(n.id)}
                className="group cursor-pointer overflow-hidden p-0 transition-shadow hover:shadow-md">
                <div className="relative h-44 bg-muted">
                  {n.img && <img src={n.img} alt="" className="absolute inset-0 size-full object-cover" loading="lazy" />}
                  {isAdmin && s !== "Published" && (
                    <Badge variant="outline" className={cn("absolute start-3 top-3 text-[11px] backdrop-blur", STATUS_STYLE[s])}>
                      {isAr ? STATUS_AR[s] : s}
                    </Badge>
                  )}
                  {isAdmin && (
                    <button aria-label={t("Edit", "تحرير")} onClick={(e) => { e.stopPropagation(); navigate(`/news/edit/${n.id}`) }}
                      className="absolute end-3 top-3 grid size-8 place-items-center rounded-lg border border-border bg-card/90 text-muted-foreground opacity-0 backdrop-blur transition-opacity hover:text-primary group-hover:opacity-100">
                      <Pencil className="size-4" />
                    </button>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Badge variant="outline" className="rounded-full">{n.category}</Badge>
                    <span className="text-[12px] text-muted-foreground">{n.date}</span>
                  </div>
                  <h3 className="mt-2.5 line-clamp-2 font-heading text-[15.5px] font-semibold leading-snug">{isAr ? n.titleAr : n.title}</h3>
                  {n.excerpt && <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">{n.excerpt}</p>}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </main>
  )
}

function Stat({ value, label, sub, icon: Icon }: {
  value: number; label: string; sub: string; icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="text-[30px] font-bold leading-none text-primary tabular-nums">{value}</div>
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-4" /></span>
      </div>
      <div className="mt-3 text-[14px] font-semibold">{label}</div>
      <div className="text-[12px] text-muted-foreground">{sub}</div>
    </Card>
  )
}
