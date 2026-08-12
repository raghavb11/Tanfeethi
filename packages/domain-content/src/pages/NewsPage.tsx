import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Badge, Button, Card, Input } from "@reach/shared-ui"
import { useShell } from "@reach/shell-context"
import { cn } from "@reach/shared-core"
import { CalendarDays, FileText, History, Newspaper, Pencil, Search, Star } from "lucide-react"

import { PageHeader, StatCard } from "./_ui"
import { useArticles } from "../store"
import { NEWS } from "../data/news"

const CATEGORIES = ["All", "Corporate", "People", "Operations", "Technology", "Events"]

export default function NewsPage() {
  const { locale, role } = useShell()
  const isAr = locale === "ar"
  const isAdmin = role === "admin"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const created = useArticles()

  const [cat, setCat] = React.useState("All")
  const [q, setQ] = React.useState("")

  const createdFeatured = created.find((a) => a.featured)
  const mockFeatured = NEWS.find((n) => n.featured)!
  const heroId = createdFeatured ? createdFeatured.id : mockFeatured.id
  const hero = createdFeatured
    ? {
        title: createdFeatured.title,
        titleAr: createdFeatured.title,
        category: createdFeatured.category,
        date: createdFeatured.date === "—" ? t("Draft", "مسودة") : createdFeatured.date,
        excerpt: createdFeatured.excerpt,
        img: createdFeatured.cover,
        tint: "#234024",
      }
    : mockFeatured
  const rest = NEWS.filter((n) => !n.featured).filter((n) => (cat === "All" || n.category === cat) && (q === "" || n.title.toLowerCase().includes(q.toLowerCase())))

  const open = (id: string) => navigate(`/news/${id}`)

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        icon={Newspaper}
        eyebrow={t("News & Announcements", "الأخبار والإعلانات")}
        title={t("What's happening at Tanfeethi", "ما الجديد في التنفيذي")}
        desc={t("Corporate news, announcements and stories — authored, scheduled and published from the CMS.", "أخبار الشركة والإعلانات والقصص — تُنشأ وتُجدول وتُنشر من نظام إدارة المحتوى.")}
        action={isAdmin ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="lg" onClick={() => navigate("/admin/audit?module=News")}><History className="size-4" />{t("Audit log", "سجل التدقيق")}</Button>
            <Button size="lg" onClick={() => navigate("/news/new")}><FileText className="size-4" />{t("New article", "مقال جديد")}</Button>
          </div>
        ) : undefined}
      />

      {isAdmin && (
        <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={Newspaper} value="128" label={t("Published", "منشورة")} sub={t("all time", "الإجمالي")} />
          <StatCard icon={FileText} value="3" label={t("Drafts", "مسودات")} sub={t("in review", "قيد المراجعة")} />
          <StatCard icon={CalendarDays} value="14" label={t("This month", "هذا الشهر")} sub={t("published", "منشورة")} />
          <StatCard icon={Star} value="1" label={t("Featured", "مميزة")} sub={t("on home", "على الرئيسية")} />
        </div>
      )}

      {/* featured */}
      <Card className="mb-6 cursor-pointer overflow-hidden py-0 transition-shadow hover:shadow-md" onClick={() => open(heroId)}>
        <div className="grid md:grid-cols-2">
          <div className="relative min-h-[200px] bg-muted">
            {hero.img && <img src={hero.img} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none" }} />}
            <span className="absolute left-4 top-4"><Badge className="bg-primary text-primary-foreground">{t("Featured", "مميزة")}</Badge></span>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline">{hero.category}</Badge>
              <span>{hero.date}</span>
            </div>
            <h2 className="mt-3 font-heading text-2xl font-semibold leading-tight">{isAr ? hero.titleAr : hero.title}</h2>
            <p className="mt-2 text-muted-foreground">{hero.excerpt}</p>
            <Button className="mt-4" onClick={(e) => { e.stopPropagation(); open(heroId) }}>{t("Read article", "اقرأ المقال")}</Button>
          </div>
        </div>
      </Card>

      {/* authored by you — admin only (users don't author articles) */}
      {isAdmin && created.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 font-heading text-lg font-semibold">{t("Your articles", "مقالاتك")}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {created.map((a) => (
              <Card key={a.id} onClick={() => open(a.id)} className="flex cursor-pointer flex-col overflow-hidden py-0 transition-colors hover:border-primary/60">
                <div className="relative h-28 bg-muted">
                  {a.cover && <img src={a.cover} alt="" className="absolute inset-0 h-full w-full object-cover" />}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">{a.category}</Badge>
                    {a.status === "Draft" ? <Badge className="bg-muted text-muted-foreground">{t("Draft", "مسودة")}</Badge> : <Badge className="bg-primary/15 text-primary">{t("Published", "منشور")}</Badge>}
                  </div>
                  <h3 className="mt-2 font-medium leading-snug">
                    {a.title}
                    {a.featured && <Star className="ms-1 inline size-3.5 fill-primary text-primary" />}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.excerpt}</p>
                  <div className="mt-3 flex justify-end">
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/news/edit/${a.id}`) }}>
                      <Pencil className="size-3.5" />{t("Edit", "تحرير")}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* filters */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c} className={cn("rounded-full border px-3 py-1.5 text-sm transition-colors", cat === c ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/60")}>{c}</button>
          ))}
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search news…", "ابحث في الأخبار…")} className="w-56 ps-9" />
        </div>
      </div>

      {/* list */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((n) => (
          <Card key={n.id} onClick={() => open(n.id)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(n.id) } }} aria-label={isAr ? n.titleAr : n.title} className="flex cursor-pointer flex-col overflow-hidden py-0 outline-none transition-colors hover:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring">
            <div className="relative h-28 bg-muted">
              <img src={n.img} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none" }} />
            </div>
            <div className="flex flex-1 flex-col p-4">
              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">{n.category}</Badge>
                {n.status === "Draft" ? <Badge className="bg-muted text-muted-foreground">{t("Draft", "مسودة")}</Badge> : <span>{n.date}</span>}
              </div>
              <h3 className="mt-2 font-medium leading-snug">{isAr ? n.titleAr : n.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{n.excerpt}</p>
            </div>
          </Card>
        ))}
      </div>
    </main>
  )
}
