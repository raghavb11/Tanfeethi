import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"

import { Avatar, AvatarFallback, Badge, Button, Card, Textarea } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import { ArrowLeft, CalendarDays, Clock, Link2, MessageSquare, Newspaper, Pencil, Share2, Star } from "lucide-react"

import { getMockArticle } from "../data/news"
import { addComment, getArticleById, useComments } from "../store"

const PROSE = cn(
  "text-[17px] leading-[1.75]",
  "[&_h2]:mb-2 [&_h2]:mt-8 [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:font-semibold",
  "[&_h3]:mb-1 [&_h3]:mt-5 [&_h3]:font-heading [&_h3]:text-xl [&_h3]:font-semibold",
  "[&_p]:my-5",
  "[&_ul]:my-4 [&_ul]:list-disc [&_ul]:ps-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:ps-6",
  "[&_a]:text-primary [&_a]:underline",
  "[&_blockquote]:my-4 [&_blockquote]:border-s-2 [&_blockquote]:border-primary [&_blockquote]:ps-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
)

export default function ArticleReaderPage() {
  const { locale, role } = useShell()
  const isAr = locale === "ar"
  const isAdmin = role === "admin"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const { id = "" } = useParams()

  const authored = getArticleById(id)
  const mock = getMockArticle(id)

  const article = authored
    ? {
        title: authored.title,
        category: authored.category,
        date: authored.date === "—" ? t("Draft", "مسودة") : authored.date,
        excerpt: authored.excerpt,
        cover: authored.cover,
        body: authored.body || "",
        featured: authored.featured,
        status: authored.status,
      }
    : mock
      ? {
          title: isAr ? mock.titleAr : mock.title,
          category: mock.category,
          date: mock.date,
          excerpt: mock.excerpt,
          cover: mock.img,
          body: mock.body,
          featured: mock.featured,
          status: mock.status,
        }
      : null

  const comments = useComments(id)
  const [text, setText] = React.useState("")
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

  const readMins = Math.max(
    1,
    Math.round((article.body || article.excerpt || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length / 200),
  )

  return (
    <main className="@container mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <button onClick={() => navigate("/news")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />
          {t("Back to news", "العودة إلى الأخبار")}
        </button>
        {authored && isAdmin && (
          <Button variant="outline" size="sm" onClick={() => navigate(`/news/edit/${id}`)}>
            <Pencil className="size-3.5" />{t("Edit article", "تحرير المقال")}
          </Button>
        )}
      </div>

      <div className="grid gap-8 @4xl:grid-cols-[minmax(0,1fr)_290px] @4xl:gap-12">
        {/* main column */}
        <div className="min-w-0">
          <article>
            {/* header */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="outline">{article.category}</Badge>
              {article.status === "Draft" && <Badge className="bg-muted text-muted-foreground">{t("Draft", "مسودة")}</Badge>}
              {article.featured && (
                <span className="inline-flex items-center gap-1 text-primary">
                  <Star className="size-3.5 fill-primary" />
                  {t("Featured", "مميّز")}
                </span>
              )}
            </div>

            <h1 className="mt-4 font-heading text-[2rem] font-bold leading-[1.08] tracking-tight text-balance sm:text-[2.6rem] @2xl:text-[3rem]">{article.title}</h1>
            {article.excerpt && <p className="mt-4 max-w-[68ch] text-lg leading-relaxed text-muted-foreground @xl:text-xl">{article.excerpt}</p>}

            {/* meta row */}
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-border py-3.5 text-sm">
              <div className="flex items-center gap-2.5">
                <Avatar className="size-9"><AvatarFallback className="bg-primary/15 text-xs font-bold text-primary">TF</AvatarFallback></Avatar>
                <span className="font-medium">{t("Corporate Communications", "الاتصال المؤسسي")}</span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-muted-foreground"><CalendarDays className="size-4" />{article.date}</span>
              <span className="inline-flex items-center gap-1.5 text-muted-foreground"><Clock className="size-4" />{readMins} {t("min read", "دقيقة قراءة")}</span>
              <div className="ms-auto flex items-center gap-1.5 @4xl:hidden">
                <Button variant="outline" size="sm"><Share2 className="size-3.5" />{t("Share", "مشاركة")}</Button>
              </div>
            </div>

            {/* cover */}
            {article.cover && (
              <div className="mt-6 overflow-hidden rounded-2xl border border-border">
                <img src={article.cover} alt="" className="h-[260px] w-full object-cover sm:h-[360px] @2xl:h-[440px]" />
              </div>
            )}

            {/* body */}
            <div
              className={cn("mt-8 max-w-[68ch]", PROSE)}
              dir={isAr ? "rtl" : "ltr"}
              dangerouslySetInnerHTML={{ __html: article.body || `<p>${article.excerpt}</p>` }}
            />
          </article>

          {/* comments */}
          <section className="mt-12 border-t border-border pt-8">
            <h2 className="mb-4 flex items-center gap-2 font-heading text-xl font-semibold">
              <MessageSquare className="size-5 text-primary" />
              {t("Comments", "التعليقات")} <span className="text-muted-foreground">({comments.length})</span>
            </h2>

            {/* composer */}
            <div className="flex gap-3">
              <Avatar className="size-9 shrink-0"><AvatarFallback className="bg-primary/15 text-xs font-bold text-primary">KH</AvatarFallback></Avatar>
              <div className="flex-1">
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={2}
                  placeholder={t("Add a comment…", "أضف تعليقًا…")}
                  dir={isAr ? "rtl" : "ltr"}
                />
                <div className="mt-2 flex justify-end">
                  <Button size="sm" disabled={!text.trim()} onClick={post}>{t("Post comment", "نشر التعليق")}</Button>
                </div>
              </div>
            </div>

            {/* list */}
            <div className="mt-6 space-y-5">
              {comments.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("Be the first to comment.", "كن أول من يعلّق.")}</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <Avatar className="size-9 shrink-0"><AvatarFallback className="bg-muted text-xs font-semibold">{c.initials}</AvatarFallback></Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{c.author}</span>
                        <span className="text-xs text-muted-foreground">{c.time}</span>
                      </div>
                      <p className="mt-0.5 text-sm leading-relaxed">{c.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* sidebar — appears when the column is wide enough */}
        <aside className="hidden @4xl:block">
          <div className="sticky top-20 space-y-4">
            <Card className="p-5">
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">{t("About this article", "عن هذا المقال")}</div>
              <dl className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between gap-3"><dt className="text-muted-foreground">{t("Category", "الفئة")}</dt><dd className="font-medium">{article.category}</dd></div>
                <div className="flex items-center justify-between gap-3"><dt className="text-muted-foreground">{t("Published", "نُشر")}</dt><dd className="font-medium">{article.date}</dd></div>
                <div className="flex items-center justify-between gap-3"><dt className="text-muted-foreground">{t("Reading time", "وقت القراءة")}</dt><dd className="font-medium">{readMins} {t("min", "دقيقة")}</dd></div>
                <div className="flex items-center justify-between gap-3"><dt className="text-muted-foreground">{t("Author", "الكاتب")}</dt><dd className="font-medium">{t("Corp. Comms", "الاتصال المؤسسي")}</dd></div>
              </dl>
            </Card>

            <Card className="p-5">
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">{t("Share", "مشاركة")}</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1"><Link2 className="size-3.5" />{t("Copy link", "نسخ الرابط")}</Button>
                <Button variant="outline" size="sm" aria-label={t("Share", "مشاركة")}><Share2 className="size-3.5" /></Button>
              </div>
            </Card>

            <Card className="p-5">
              <div className="mb-1.5 flex items-center gap-2 text-sm font-semibold"><Newspaper className="size-4 text-primary" />{t("Newsroom", "غرفة الأخبار")}</div>
              <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{t("Browse the latest company news and announcements.", "تصفّح أحدث أخبار وإعلانات الشركة.")}</p>
              <Button variant="outline" size="sm" className="w-full" onClick={() => navigate("/news")}>{t("All news", "كل الأخبار")}</Button>
            </Card>
          </div>
        </aside>
      </div>
    </main>
  )
}
