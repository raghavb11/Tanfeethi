import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, Badge, Button, Card, Input } from "@reach/shared-ui"
import { useShell } from "@reach/shell-context"
import { cn } from "@reach/shared-core"
import {
  CalendarDays, ChevronLeft, ChevronRight, Clock, Eye, FileText, History, LayoutGrid, ListFilter,
  MessageSquare, Newspaper, Pencil, RotateCw, Search, Send, Star, Tags, Trash2,
} from "lucide-react"

import { PageHeader, StatCard } from "./_ui"
import { useArticles } from "../store"
import { metaFor, NEWS, type NewsItem, type Status } from "../data/news"

type Tab = "All" | "Published" | "Scheduled" | "Drafts" | "Archived"
const TABS: Tab[] = ["All", "Published", "Scheduled", "Drafts", "Archived"]
const TAB_AR: Record<Tab, string> = { All: "الكل", Published: "منشورة", Scheduled: "مجدولة", Drafts: "مسودات", Archived: "مؤرشفة" }
const PAGE_SIZE = 10

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

  const [tab, setTab] = React.useState<Tab>("All")
  const [q, setQ] = React.useState("")
  const [view, setView] = React.useState<"list" | "grid">(role === "admin" ? "list" : "grid")
  const [page, setPage] = React.useState(0)

  React.useEffect(() => { setPage(0) }, [tab, q])

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
    live: all.filter((n, i) => statusOf(n, i) === "Published").length,
    scheduled: all.filter((n, i) => statusOf(n, i) === "Scheduled").length,
    drafts: all.filter((n, i) => statusOf(n, i) === "Draft").length,
    archived: all.filter((n, i) => statusOf(n, i) === "Archived").length,
  }

  const filtered = all.filter((n, i) => {
    const s = statusOf(n, i)
    // employees see published articles only — drafts, scheduled and archived
    // items are editorial state and are not theirs to see
    if (!isAdmin) return s === "Published" && (q === "" || (isAr ? n.titleAr : n.title).toLowerCase().includes(q.toLowerCase()))
    const inTab = tab === "All" || (tab === "Drafts" ? s === "Draft" : s === tab)
    const inSearch = q === "" || (isAr ? n.titleAr : n.title).toLowerCase().includes(q.toLowerCase())
    return inTab && inSearch
  })
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const start = page * PAGE_SIZE
  const shown = filtered.slice(start, start + PAGE_SIZE)

  const open = (id: string) => navigate(`/news/${id}`)
  const th = "px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70"

  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        icon={Newspaper}
        eyebrow={t("News & Announcements", "الأخبار والإعلانات")}
        title={t("News", "الأخبار")}
        desc={isAdmin
          ? t("Create, schedule, and publish Altanfeethi news — from draft to auto-archive.", "أنشئ وجدول وانشر أخبار التنفيذي — من المسودة إلى الأرشفة التلقائية.")
          : t("The latest from across ALTANFEETHI.", "أحدث الأخبار من التنفيذي.")}
        action={isAdmin ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="lg" onClick={() => navigate("/admin/audit?module=News")}><Tags className="size-4" />{t("Manage categories", "إدارة الفئات")}</Button>
            <Button size="lg" onClick={() => navigate("/news/new")}><Send className="size-4" />{t("New article", "مقال جديد")}</Button>
          </div>
        ) : undefined}
      />

      {isAdmin && (
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={Newspaper} value={String(counts.live)} label={t("Live now", "منشورة الآن")} sub={t("visible to employees", "مرئية للموظفين")} />
          <StatCard icon={Clock} value={String(counts.scheduled)} label={t("Scheduled", "مجدولة")} sub={t("+3 vs last week", "+٣ مقارنة بالأسبوع الماضي")} />
          <StatCard icon={FileText} value={String(counts.drafts)} label={t("Drafts", "مسودات")} sub={t("in review", "قيد المراجعة")} />
          <StatCard icon={History} value={String(counts.archived)} label={t("Expiring soon", "تنتهي قريبًا")} sub={t("auto-archive enabled", "الأرشفة التلقائية مفعّلة")} />
        </div>
      )}

      {/* tabs + toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className={cn("inline-flex flex-wrap rounded-xl border border-border p-0.5", !isAdmin && "hidden")}>
          {TABS.map((tb) => (
            <button key={tb} onClick={() => setTab(tb)} aria-pressed={tab === tb}
              className={cn("rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors", tab === tb ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
              {isAr ? TAB_AR[tb] : tb}{tb === "All" && <span className="ms-1 opacity-70">- {all.length}</span>}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search news…", "ابحث في الأخبار…")} className="w-56 ps-9" />
          </div>
          <Button variant="outline" size="icon-sm" aria-label={t("Refresh", "تحديث")} onClick={() => setQ("")}><RotateCw className="size-4" /></Button>
          <Button variant="outline" size="icon-sm" aria-label={t("Filter", "تصفية")}><ListFilter className="size-4" /></Button>
          <div className="inline-flex rounded-lg border border-border p-0.5">
            <button onClick={() => setView("list")} aria-pressed={view === "list"} aria-label={t("List view", "عرض قائمة")}
              className={cn("grid size-8 place-items-center rounded-md transition-colors", view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
              <ListFilter className="size-4 rotate-90" />
            </button>
            <button onClick={() => setView("grid")} aria-pressed={view === "grid"} aria-label={t("Grid view", "عرض شبكي")}
              className={cn("grid size-8 place-items-center rounded-md transition-colors", view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
              <LayoutGrid className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── LIST ── */}
      {view === "list" && (
        <Card className="overflow-hidden py-0">
          <div className="overflow-x-auto">
            <table className={cn("w-full text-sm", isAdmin ? "min-w-[980px]" : "min-w-[640px]")}>
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {isAdmin && <th className={th}>{t("ID", "المعرّف")}</th>}
                  <th className={th}>{t("Article title", "عنوان المقال")}</th>
                  {isAdmin && <th className={th}>{t("Created by", "أنشأه")}</th>}
                  <th className={th}>{t("Category", "الفئة")}</th>
                  <th className={th}>{t("Date", "التاريخ")}</th>
                  <th className={th}>{t("Ratings", "التقييمات")}</th>
                  {isAdmin && <th className={th}>{t("Status", "الحالة")}</th>}
                  {isAdmin && <th className={cn(th, "text-end")}>{t("Actions", "إجراءات")}</th>}
                </tr>
              </thead>
              <tbody>
                {shown.map((n, i) => {
                  const m = metaFor(n.id, start + i)
                  const s = m.status ?? n.status
                  return (
                    <tr key={n.id} onClick={() => open(n.id)} className="cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-primary/[0.03]">
                      {isAdmin && <td className="px-4 py-3 font-mono text-[12px] text-muted-foreground">{m.ref}</td>}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                            {n.img && <img src={n.img} alt="" className="h-full w-full object-cover" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none" }} />}
                          </div>
                          <span className="line-clamp-2 max-w-[20rem] font-medium leading-snug">{isAr ? n.titleAr : n.title}</span>
                        </div>
                      </td>
                      {isAdmin && <td className="px-4 py-3 text-muted-foreground">{isAr ? m.authorAr : m.author}</td>}
                      <td className="px-4 py-3"><Badge variant="outline">{n.category}</Badge></td>
                      <td className="px-4 py-3 text-muted-foreground">{n.date}</td>
                      <td className="px-4 py-3">
                        {m.ratingCount > 0 ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Star className="size-3.5 fill-amber-400 text-amber-400" />
                            <span className="font-medium tabular-nums">{m.rating.toFixed(1)}</span>
                            <span className="text-[12px] text-muted-foreground">({m.ratingCount})</span>
                          </span>
                        ) : (
                          <span className="text-[12px] text-muted-foreground">{t("Not rated yet", "لم يُقيَّم بعد")}</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={cn("text-[11px]", STATUS_STYLE[s])}>{isAr ? STATUS_AR[s] : s}</Badge>
                        </td>
                      )}
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon-sm" aria-label={t("Delete", "حذف")} className="text-destructive hover:bg-destructive/10 hover:text-destructive"><Trash2 className="size-4" /></Button>
                            <Button variant="ghost" size="icon-sm" aria-label={t("Edit", "تحرير")} onClick={() => navigate(`/news/edit/${n.id}`)}><Pencil className="size-4" /></Button>
                            <Button variant="ghost" size="icon-sm" aria-label={t("View", "عرض")} onClick={() => open(n.id)}><Eye className="size-4" /></Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
                {shown.length === 0 && (
                  <tr><td colSpan={isAdmin ? 8 : 4} className="py-14 text-center">
                    <Newspaper className="mx-auto size-8 text-muted-foreground/40" />
                    <p className="mt-3 text-sm text-muted-foreground">{t("No articles in this view.", "لا توجد مقالات في هذا العرض.")}</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── GRID ── */}
      {view === "grid" && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((n, i) => {
            const m = metaFor(n.id, start + i)
            const s = m.status ?? n.status
            return (
              <Card key={n.id} onClick={() => open(n.id)} className="cursor-pointer overflow-hidden py-0 gap-0 transition-shadow hover:shadow-md">
                <div className="relative h-44 bg-muted">
                  {n.img && <img src={n.img} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none" }} />}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/15 text-primary">{n.category}</Badge>
                    {isAdmin && <Badge variant="outline" className={cn("text-[11px]", STATUS_STYLE[s])}>{isAr ? STATUS_AR[s] : s}</Badge>}
                    {isAdmin && <span className="font-mono text-[11px] text-muted-foreground">{m.ref}</span>}
                    {isAdmin && <Button variant="ghost" size="icon-sm" aria-label={t("Edit", "تحرير")} className="ms-auto" onClick={(e) => { e.stopPropagation(); navigate(`/news/edit/${n.id}`) }}><Pencil className="size-4" /></Button>}
                  </div>
                  <h3 className={cn("mt-2 font-heading text-[15px] font-semibold", isAdmin ? "line-clamp-1" : "line-clamp-2")}>{isAr ? n.titleAr : n.title}</h3>
                  {!isAdmin && n.excerpt && <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-snug text-muted-foreground">{n.excerpt}</p>}
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-3.5" />
                      <span><span className="block text-[9px] uppercase tracking-wide opacity-70">{t("Published on", "نُشر في")}</span>{n.date}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Star className="size-3.5" />
                      <span><span className="block font-semibold text-foreground">{m.rating || "—"}</span>{m.ratingCount} {t("ratings", "تقييم")}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MessageSquare className="size-3.5" />
                      <span><span className="block font-semibold text-foreground">{m.comments}</span>{t("comments", "تعليق")}</span>
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/60 pt-3">
                    <span className="inline-flex items-center gap-2">
                      <Avatar className="size-7"><AvatarFallback className="bg-primary/12 text-[10px] font-bold text-primary">{m.initials}</AvatarFallback></Avatar>
                      <span className="text-[12px] font-medium">{isAr ? m.authorAr : m.author}</span>
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-[12px] font-medium text-primary">{t("View", "عرض")}<ChevronRight className={cn("size-3.5", isAr && "rotate-180")} /></span>
                  </div>
                </div>
              </Card>
            )
          })}
          {shown.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-border py-14 text-center">
              <Newspaper className="mx-auto size-8 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">{t("No articles in this view.", "لا توجد مقالات في هذا العرض.")}</p>
            </div>
          )}
        </div>
      )}

      {/* pagination */}
      {filtered.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[12px] text-muted-foreground">
            {t("Showing", "عرض")} <span className="font-medium text-foreground">{start + 1}</span>–<span className="font-medium text-foreground">{start + shown.length}</span> {t("of", "من")} <span className="font-medium text-foreground">{filtered.length}</span>
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon-sm" aria-label={t("Previous", "السابق")} disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
              <ChevronLeft className={cn("size-4", isAr && "rotate-180")} />
            </Button>
            {Array.from({ length: pageCount }, (_, i) => (
              <button key={i} onClick={() => setPage(i)} aria-current={page === i}
                className={cn("min-w-8 rounded-md border px-2.5 py-1 text-xs font-medium tabular-nums transition-colors", page === i ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground")}>
                {i + 1}
              </button>
            ))}
            <Button variant="outline" size="icon-sm" aria-label={t("Next", "التالي")} disabled={page >= pageCount - 1} onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}>
              <ChevronRight className={cn("size-4", isAr && "rotate-180")} />
            </Button>
          </div>
        </div>
      )}
    </main>
  )
}
