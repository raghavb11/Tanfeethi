import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Avatar, AvatarFallback, Badge, Button, Card, Textarea } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import { ArrowLeft, Download, FileText, Newspaper, Pencil, Star } from "lucide-react"

import { getMockArticle, metaFor } from "../data/news"
import { addComment, getArticleById, useComments } from "../store"

/** Body typography for the rendered article HTML. */
const PROSE = cn(
  "text-[15px] leading-[1.75] text-foreground/90",
  "[&_p]:my-4",
  "[&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:font-heading [&_h2]:text-[20px] [&_h2]:font-semibold [&_h2]:text-foreground",
  "[&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:font-heading [&_h3]:text-[17px] [&_h3]:font-semibold [&_h3]:text-foreground",
  "[&_ul]:my-4 [&_ul]:list-disc [&_ul]:ps-5 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:ps-5 [&_li]:my-1",
  "[&_blockquote]:my-6 [&_blockquote]:border-s-2 [&_blockquote]:border-primary [&_blockquote]:ps-4 [&_blockquote]:text-[18px] [&_blockquote]:italic [&_blockquote]:text-foreground/80",
  "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
  "[&_img]:my-6 [&_img]:rounded-lg [&_figcaption]:mt-2 [&_figcaption]:text-[14px] [&_figcaption]:italic [&_figcaption]:text-muted-foreground",
  "[&_strong]:font-semibold",
)

export default function ArticleReaderPage() {
  const { locale, role } = useShell()
  const isAr = locale === "ar"
  const isAdmin = role === "admin"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const { id = "" } = useParams()

  // articles come from two places: the CMS store (authored) and the seeded
  // newsroom content — resolve both into one shape
  const authored = getArticleById(id)
  const mock = getMockArticle(id)
  const article = authored
    ? {
        title: authored.title, category: authored.category,
        date: authored.date === "—" ? t("Draft", "مسودة") : authored.date,
        issueDate: authored.issueDate, excerpt: authored.excerpt,
        cover: authored.cover, body: authored.body || "",
        status: authored.status, attachments: authored.attachments,
      }
    : mock
      ? {
          title: isAr ? mock.titleAr : mock.title, category: mock.category,
          date: mock.date, issueDate: undefined as string | undefined,
          excerpt: mock.excerpt, cover: mock.img, body: mock.body,
          status: mock.status, attachments: undefined,
        }
      : null

  const comments = useComments(id)
  const [text, setText] = React.useState("")
  const [myRating, setMyRating] = React.useState(0)
  const [hoverRating, setHoverRating] = React.useState(0)
  const [rated, setRated] = React.useState(false)

  const post = () => {
    const body = text.trim()
    if (!body) return
    addComment(id, { id: `c-${Date.now()}`, author: "Khalid", initials: "KH", text: body, time: t("Just now", "الآن") })
    setText("")
  }

  if (!article) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-16 text-center sm:px-6">
        <Newspaper className="mx-auto size-10 text-muted-foreground/50" />
        <h1 className="mt-4 font-heading text-2xl font-bold">{t("Article not found", "المقال غير موجود")}</h1>
        <p className="mt-2 text-muted-foreground">{t("It may have been removed, or the link is out of date.", "قد يكون قد أُزيل أو أن الرابط قديم.")}</p>
        <Button className="mt-6" onClick={() => navigate("/news")}>{t("Back to news", "العودة إلى الأخبار")}</Button>
      </main>
    )
  }

  const meta = metaFor(id, 0)
  const published = article.status === "Published"

  return (
    <main className="@container mx-auto w-full max-w-[1128px] px-4 py-6 sm:px-6 lg:px-8">
      {/* back */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <button onClick={() => navigate("/news")} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:underline">
          <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />
          {t("Back to All News", "العودة إلى كل الأخبار")}
        </button>
        {isAdmin && (
          <Button variant="outline" size="sm" onClick={() => navigate(`/news/edit/${id}`)}>
            <Pencil className="size-3.5" />{t("Edit article", "تحرير المقال")}
          </Button>
        )}
      </div>

      {/* the article is one content card, per the Figma News Preview frame */}
      <Card className="overflow-hidden p-0">
        {/* hero */}
        {article.cover && (
          <div className="relative h-[240px] w-full sm:h-[320px] @3xl:h-[400px]">
            <img src={article.cover} alt="" className="size-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}

        {/* header & meta */}
        <div className="border-b border-border p-6 @2xl:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-full bg-primary px-2.5 text-[10.5px] font-semibold uppercase tracking-wide text-[var(--btn-primary-fg)]">
              {article.category}
            </Badge>
            <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
              published
                ? "border-emerald-500/45 bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
                : "border-border bg-muted/50 text-muted-foreground")}>
              {published ? t("Published", "منشور") : t("Draft", "مسودة")}
            </span>
          </div>

          <h1 className="mt-3 font-heading text-[28px] font-bold leading-[1.12] tracking-tight text-balance sm:text-[34px] @2xl:text-[40px]">
            {article.title}
          </h1>

          {/* labelled meta fields, as in the design */}
          <div className="mt-5 flex flex-wrap gap-x-10 gap-y-4">
            <MetaField label={t("Author", "الكاتب")} value={isAr ? meta.authorAr : meta.author} />
            <MetaField label={t("News Date", "تاريخ الخبر")} value={article.issueDate || article.date} />
            <MetaField label={t("Published On", "تاريخ النشر")} value={article.date} />
            <div>
              <div className="text-[11px] font-medium text-muted-foreground">{t("Ratings", "التقييمات")}</div>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[14px] font-semibold tabular-nums">{meta.rating.toFixed(1)}</span>
                <Stars value={meta.rating} />
                <span className="text-[13px] text-muted-foreground">({meta.ratingCount})</span>
              </div>
            </div>
          </div>
        </div>

        {/* body */}
        <div className="p-6 @2xl:p-8">
          {article.excerpt && (
            <p className="mb-5 text-[20px] font-medium leading-[1.55] text-foreground">{article.excerpt}</p>
          )}
          <div className={PROSE} dir={isAr ? "rtl" : "ltr"}
            dangerouslySetInnerHTML={{ __html: article.body || "" }} />
        </div>

        {/* attachments */}
        {article.attachments && article.attachments.length > 0 && (
          <div className="border-t border-border p-6 @2xl:p-8">
            <h2 className="mb-3 font-heading text-[18px] font-semibold">{t("Attachments", "المرفقات")}</h2>
            <div className="grid gap-2.5 @xl:grid-cols-2">
              {article.attachments.map((a) => (
                <button key={a.name}
                  className="flex items-center gap-3 rounded-xl border border-border p-3 text-start transition-colors hover:border-primary/50 hover:bg-primary/[0.04]">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-rose-500/10 text-rose-500">
                    <FileText className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium">{a.name}</span>
                    <span className="block text-[11px] uppercase text-muted-foreground">{a.kind}</span>
                  </span>
                  <Download className="size-4 shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ratings */}
        <div className="border-t border-border p-6 @2xl:p-8">
          <h2 className="mb-3 font-heading text-[18px] font-semibold">{t("Ratings", "التقييمات")}</h2>
          <div className="rounded-xl border border-border bg-muted/30 p-5">
            <h3 className="font-heading text-[15px] font-semibold">{t("Rate this article", "قيّم هذا المقال")}</h3>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {rated
                ? t("Thanks — your rating has been recorded.", "شكرًا — تم تسجيل تقييمك.")
                : t("Your feedback helps us improve our content.", "ملاحظاتك تساعدنا على تحسين المحتوى.")}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" aria-label={`${n}`} disabled={rated}
                    onMouseEnter={() => setHoverRating(n)} onClick={() => setMyRating(n)}
                    className="transition-transform hover:scale-110 disabled:cursor-default disabled:hover:scale-100">
                    <Star className={cn("size-6 transition-colors",
                      (hoverRating || myRating) >= n ? "fill-amber-400 text-amber-400" : "text-muted-foreground/35")} />
                  </button>
                ))}
              </div>
              <Button size="sm" disabled={!myRating || rated} onClick={() => setRated(true)}>
                {t("Submit Rating", "إرسال التقييم")}
              </Button>
            </div>
          </div>
        </div>

        {/* comments */}
        <div className="border-t border-border p-6 @2xl:p-8">
          <h2 className="mb-4 font-heading text-[18px] font-semibold">
            {t("Comments", "التعليقات")} <span className="font-normal text-muted-foreground">({comments.length})</span>
          </h2>

          <div className="flex gap-3">
            <Avatar className="size-12 shrink-0"><AvatarFallback className="bg-primary/15 text-[13px] font-bold text-primary">KH</AvatarFallback></Avatar>
            <div className="min-w-0 flex-1">
              <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={3}
                placeholder={t("Share your thoughts…", "شاركنا رأيك…")} dir={isAr ? "rtl" : "ltr"} />
              <div className="mt-2 flex justify-end">
                <Button size="sm" disabled={!text.trim()} onClick={post}>{t("Post comment", "نشر التعليق")}</Button>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("Be the first to comment.", "كن أول من يعلّق.")}</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <Avatar className="size-12 shrink-0"><AvatarFallback className="bg-muted text-[13px] font-semibold">{c.initials}</AvatarFallback></Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[13.5px] font-semibold">{c.author}</span>
                      <span className="text-[11.5px] text-muted-foreground">{c.time}</span>
                    </div>
                    <p className="mt-1 text-[14px] leading-relaxed">{c.text}</p>
                    <button className="mt-1.5 text-[12px] font-medium text-primary hover:underline">{t("Reply", "رد")}</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>
    </main>
  )
}

function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 truncate text-[14px] font-medium">{value}</div>
    </div>
  )
}

/** Read-only average, with half-star precision rounded to the nearest whole. */
function Stars({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={cn("size-3.5", n <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
      ))}
    </span>
  )
}
