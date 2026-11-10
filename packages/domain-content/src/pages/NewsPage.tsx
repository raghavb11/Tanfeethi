/** News list — phone 3667:8144 ("الأخبار" card of story cards) on the web
 *  Knowledge-card language. Create / edit open the Figma popup (2485:3150). */
import * as React from "react"
import { useNavigate } from "react-router-dom"
import { useShell } from "@reach/shell-context"
import { CalendarDays, FileText, History, Newspaper, Plus, Search, Trash2 } from "lucide-react"

import { CardHead, DeletePopup, EmptyState, IconTile, Skeleton, Tag, toneForCategory, useFakeLoading, WButton, WCard, WPage, arNum } from "./_wijha"
import { Chips, StatCard } from "./_ui"
import { CreateContentModal, ImageLightbox } from "./knowledge/KnowledgeModals"
import { newsCatLabel, type NewsItem, type Status } from "../data/news"
import { hideSeedNews, newsStatus, useNewsFeed } from "../data/newsFeed"
import { deleteArticle, getArticleById } from "../store"
import { logAudit } from "../data/audit"

const STATUS_AR: Record<Status, string> = { Published: "منشور", Scheduled: "مجدول", Draft: "مسودة", Archived: "مؤرشف" }
const STATUS_TONE: Record<Status, "green" | "purple" | "muted"> = { Published: "green", Scheduled: "purple", Draft: "muted", Archived: "muted" }

export default function NewsPage() {
  const { locale, role } = useShell()
  const isAr = locale === "ar"
  const isAdmin = role === "admin"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const all = useNewsFeed()
  const loading = useFakeLoading()

  const [cat, setCat] = React.useState("All")
  const [q, setQ] = React.useState("")
  const [modal, setModal] = React.useState<{ edit: NewsItem | null } | null>(null)
  const [confirm, setConfirm] = React.useState<NewsItem | null>(null)
  const [zoom, setZoom] = React.useState<string | null>(null)

  const withStatus = all.map((n, i) => ({ n, s: newsStatus(n, i) }))
  const visible = withStatus.filter(({ s }) => isAdmin || s === "Published")
  const cats = ["All", ...Array.from(new Set(visible.map(({ n }) => n.category)))]
  const catLabel = (c: string) => (c === "All" ? t("All", "الكل") : newsCatLabel(c, isAr))
  const needle = q.trim().toLowerCase()
  const filtered = visible.filter(({ n }) =>
    (cat === "All" || n.category === cat) &&
    (!needle || (isAr ? n.titleAr : n.title).toLowerCase().includes(needle) || (isAr ? n.excerptAr ?? n.excerpt : n.excerpt).toLowerCase().includes(needle)))

  const count = (s: Status) => withStatus.filter((x) => x.s === s).length
  const remove = (x: NewsItem) => {
    if (getArticleById(x.id)) deleteArticle(x.id)
    else hideSeedNews(x.id)
    logAudit("deleted", x.title, "News")
  }

  return (
    <WPage className="flex flex-col gap-6">
      {isAdmin && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={Newspaper} value={arNum(count("Published"), isAr)} label={t("Published", "منشورة")} sub={t("all time", "الإجمالي")} />
          <StatCard icon={FileText} value={arNum(count("Draft"), isAr)} label={t("Drafts", "مسودات")} sub={t("in review", "قيد المراجعة")} />
          <StatCard icon={History} value={arNum(count("Scheduled"), isAr)} label={t("Scheduled", "مجدولة")} sub={t("upcoming", "قادمة")} />
          <StatCard icon={CalendarDays} value={arNum(all.length, isAr)} label={t("All items", "كل الأخبار")} sub={t("including drafts", "مع المسودات")} />
        </div>
      )}

      <WCard className="flex flex-col gap-4">
        <CardHead icon={Newspaper} title={t("News", "الأخبار")}
          actions={isAdmin ? <>
            <IconTile label={t("Audit log", "سجل التدقيق")} onClick={() => navigate("/admin/audit?module=News")}><History /></IconTile>
            <WButton size="sm" className="min-w-[108px]" onClick={() => setModal({ edit: null })}><Plus />{t("New news item", "خبر جديد")}</WButton>
          </> : undefined} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Chips items={cats.map(catLabel)} active={catLabel(cat)} onSelect={(label) => setCat(cats.find((c) => catLabel(c) === label) ?? "All")} />
          <label className="flex h-9 w-full items-center gap-2 rounded-lg bg-background px-3 sm:w-[260px]">
            <Search className="size-4 shrink-0 text-icon" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search news…", "ابحث في الأخبار…")} className="h-full w-full bg-transparent text-[12px] outline-none placeholder:text-muted-foreground" />
          </label>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[340px]" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Newspaper} title={t("No news matches this filter", "لا توجد أخبار تطابق هذا التصفية")} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {filtered.map(({ n, s }) => (
              <article key={n.id} className="flex flex-col gap-3.5 rounded-lg bg-background p-4">
                {n.img ? (
                  <button type="button" onClick={() => setZoom(n.img)} aria-label={t("View image", "عرض الصورة")} className="overflow-hidden rounded-lg">
                    <img src={n.img} alt="" loading="lazy" className="aspect-[358/201] w-full object-cover transition-transform duration-300 hover:scale-[1.02]" />
                  </button>
                ) : <div className="grid aspect-[358/201] place-items-center rounded-lg bg-secondary text-icon"><Newspaper className="size-8" /></div>}
                <div className="flex flex-wrap items-center gap-2.5">
                  <Tag tone={toneForCategory(n.category)}>{newsCatLabel(n.category, isAr)}</Tag>
                  <span className="text-[11px] text-muted-foreground">{isAr ? `${n.dateAr ?? n.date} · قراءة ${n.readMin ?? 2} د` : `${n.date} · ${n.readMin ?? 2} min read`}</span>
                  {isAdmin && s !== "Published" && <Tag tone={STATUS_TONE[s]}>{isAr ? STATUS_AR[s] : s}</Tag>}
                </div>
                <h3 className="text-[13px] font-medium leading-[22px]">{isAr ? n.titleAr : n.title}</h3>
                <p className="line-clamp-3 text-[11.3px] leading-5">{isAr ? n.excerptAr ?? n.excerpt : n.excerpt}</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-1">
                  <WButton className="w-32" onClick={() => navigate(`/news/${n.id}`)}>{t("View details", "عرض التفاصيل")}</WButton>
                  {isAdmin && <>
                    <WButton variant="outline" className="w-[84px]" onClick={() => setModal({ edit: n })}>{t("Edit", "تعديل")}</WButton>
                    <WButton variant="danger" className="w-[84px]" onClick={() => setConfirm(n)}><Trash2 />{t("Delete", "حذف")}</WButton>
                  </>}
                </div>
              </article>
            ))}
          </div>
        )}
      </WCard>

      <CreateContentModal open={!!modal} onClose={() => setModal(null)} isAr={isAr} initialKind="news" editNews={modal?.edit ?? null} />
      <ImageLightbox src={zoom} onClose={() => setZoom(null)} isAr={isAr} />
      <DeletePopup open={!!confirm} onClose={() => setConfirm(null)} isAr={isAr}
        title={t("Delete this news item?", "هل تريد حذف هذا الخبر؟")}
        body={t("The news item will be removed from the portal permanently. This can't be undone.", "سيُحذف الخبر نهائيًا من البوابة، ولا يمكن التراجع عن هذا الإجراء")}
        confirmLabel={t("Delete news", "حذف الخبر")} onConfirm={() => { if (confirm) remove(confirm); setConfirm(null) }} />
    </WPage>
  )
}
