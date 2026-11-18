/** News list — phone 3667:8144 ("الأخبار" card of story cards) on the web
 *  Knowledge-card language. Create / edit open the Figma popup (2485:3150).
 *  The web list has no Figma frame: the newest story leads as a wide feature,
 *  the rest follow in a three-column grid (management feedback, 18 Nov 2026). */
import * as React from "react"
import { useNavigate } from "react-router-dom"
import { useShell } from "@reach/shell-context"
import { ArrowRight, CalendarDays, Expand, FileText, History, Newspaper, Plus, Search, Trash2 } from "lucide-react"

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
          <label className="flex h-9 w-full items-center gap-2 rounded-[8px] bg-background px-3 sm:w-[260px]">
            <Search className="size-4 shrink-0 text-icon" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search news…", "ابحث في الأخبار…")} className="h-full w-full bg-transparent text-[12px] outline-none placeholder:text-muted-foreground" />
          </label>
        </div>

        {loading ? (
          <div className="flex flex-col gap-5">
            <Skeleton className="h-[300px]" />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[300px]" />)}</div>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Newspaper} title={t("No news matches this filter", "لا توجد أخبار تطابق هذا التصفية")} />
        ) : (
          <div className="flex flex-col gap-5">
            {/* the lead story */}
            {(() => {
              const { n, s } = filtered[0]!
              return (
                <article className="group grid overflow-hidden rounded-[12px] bg-background ring-1 ring-inset ring-[var(--card-ring)] lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
                  <div className="relative overflow-hidden lg:h-[340px]">
                    {n.img ? (
                      <img src={n.img} alt="" className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02] lg:aspect-auto lg:h-full" />
                    ) : <div className="grid aspect-[16/9] w-full place-items-center bg-secondary text-icon lg:aspect-auto lg:h-full"><Newspaper className="size-10" /></div>}
                    {n.img && (
                      <button type="button" onClick={() => setZoom(n.img)} aria-label={t("Enlarge image", "تكبير الصورة")}
                        className="absolute end-3 top-3 grid size-8 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition-colors hover:bg-black/65">
                        <Expand className="size-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-3.5 p-6">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-primary">{t("Latest", "الأحدث")}</span>
                      <Tag tone={toneForCategory(n.category)}>{newsCatLabel(n.category, isAr)}</Tag>
                      <span className="text-[11.5px] text-muted-foreground">{isAr ? `${n.dateAr ?? n.date} · قراءة ${n.readMin ?? 2} د` : `${n.date} · ${n.readMin ?? 2} min read`}</span>
                      {isAdmin && s !== "Published" && <Tag tone={STATUS_TONE[s]}>{isAr ? STATUS_AR[s] : s}</Tag>}
                    </div>
                    <h2 className="text-[22px] font-medium leading-[30px] tracking-[-0.2px]">{isAr ? n.titleAr : n.title}</h2>
                    <p className="line-clamp-4 text-[13.5px] leading-[22px] text-muted-foreground">{isAr ? n.excerptAr ?? n.excerpt : n.excerpt}</p>
                    <div className="mt-auto flex flex-wrap gap-2 pt-2">
                      <WButton className="w-36" onClick={() => navigate(`/news/${n.id}`)}>{t("Read the story", "اقرأ الخبر")}</WButton>
                      {isAdmin && <>
                        <WButton variant="outline" className="w-[84px]" onClick={() => setModal({ edit: n })}>{t("Edit", "تعديل")}</WButton>
                        <WButton variant="danger" className="w-[84px]" onClick={() => setConfirm(n)}><Trash2 />{t("Delete", "حذف")}</WButton>
                      </>}
                    </div>
                  </div>
                </article>
              )
            })()}

            {/* everything after it */}
            {filtered.length > 1 && (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filtered.slice(1).map(({ n, s }) => (
                  <article key={n.id} className="group flex flex-col overflow-hidden rounded-[12px] bg-background ring-1 ring-inset ring-[var(--card-ring)] transition-[box-shadow,transform] hover:-translate-y-0.5 hover:ring-primary/35">
                    <div className="relative overflow-hidden">
                      {n.img ? (
                        <img src={n.img} alt="" loading="lazy" className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                      ) : <div className="grid aspect-[16/9] place-items-center bg-secondary text-icon"><Newspaper className="size-8" /></div>}
                      {n.img && (
                        <button type="button" onClick={() => setZoom(n.img)} aria-label={t("Enlarge image", "تكبير الصورة")}
                          className="absolute end-2.5 top-2.5 grid size-7 place-items-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur transition-opacity hover:bg-black/65 focus-visible:opacity-100 group-hover:opacity-100">
                          <Expand className="size-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-2.5 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Tag tone={toneForCategory(n.category)}>{newsCatLabel(n.category, isAr)}</Tag>
                        <span className="text-[11px] text-muted-foreground">{isAr ? `${n.dateAr ?? n.date} · قراءة ${n.readMin ?? 2} د` : `${n.date} · ${n.readMin ?? 2} min read`}</span>
                        {isAdmin && s !== "Published" && <Tag tone={STATUS_TONE[s]}>{isAr ? STATUS_AR[s] : s}</Tag>}
                      </div>
                      <h3 className="line-clamp-2 text-[15px] font-medium leading-[22px]">
                        <button type="button" onClick={() => navigate(`/news/${n.id}`)} className="text-start hover:text-primary">{isAr ? n.titleAr : n.title}</button>
                      </h3>
                      <p className="line-clamp-2 text-[12.5px] leading-5 text-muted-foreground">{isAr ? n.excerptAr ?? n.excerpt : n.excerpt}</p>
                      <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
                        <button type="button" onClick={() => navigate(`/news/${n.id}`)}
                          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-primary hover:underline">
                          {t("Read more", "اقرأ المزيد")}<ArrowRight className="size-3.5 rtl:rotate-180" />
                        </button>
                        {isAdmin && <span className="ms-auto flex gap-1.5">
                          <WButton variant="outline" size="sm" onClick={() => setModal({ edit: n })}>{t("Edit", "تعديل")}</WButton>
                          <WButton variant="danger" size="sm" onClick={() => setConfirm(n)}><Trash2 />{t("Delete", "حذف")}</WButton>
                        </span>}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
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
