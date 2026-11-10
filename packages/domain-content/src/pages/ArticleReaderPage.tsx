/** News details — Figma 4758:25023. Pager walks the published news; Edit and
 *  Delete open the same popups as the Knowledge page. Comments are kept below. */
import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"

import { Avatar, AvatarFallback } from "@reach/shared-ui"
import { useShell } from "@reach/shell-context"
import { MessageSquare, Newspaper, Trash2 } from "lucide-react"

import { CardHead, DeletePopup, EmptyState, toneForCategory, WButton, WCard, WPage, WTextarea, arNum } from "./_wijha"
import { StoryDetail } from "./knowledge/StoryDetail"
import { CreateContentModal } from "./knowledge/KnowledgeModals"
import { newsCatLabel } from "../data/news"
import { hideSeedNews, useNewsFeed, usePublishedNews } from "../data/newsFeed"
import { addComment, deleteArticle, getArticleById, useComments } from "../store"
import { logAudit } from "../data/audit"
import { CURRENT_USER } from "../data/currentUser"

export default function ArticleReaderPage() {
  const { locale, role } = useShell()
  const isAr = locale === "ar"
  const isAdmin = role === "admin"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const { id = "" } = useParams()

  const all = useNewsFeed()
  const published = usePublishedNews()
  const item = all.find((n) => n.id === id)
  const pos = published.findIndex((n) => n.id === id)

  const comments = useComments(id)
  const [text, setText] = React.useState("")
  const [edit, setEdit] = React.useState(false)
  const [confirm, setConfirm] = React.useState(false)

  if (!item) {
    return (
      <WPage>
        <EmptyState icon={Newspaper} title={t("News item not found", "الخبر غير موجود")}
          desc={t("It may have been removed, or the link is out of date.", "ربما حُذف الخبر أو أن الرابط قديم.")}
          action={<WButton onClick={() => navigate("/documents")}>{t("Back to Knowledge", "العودة إلى المعرفة")}</WButton>} />
      </WPage>
    )
  }

  const go = (i: number) => { const n = published[i]; if (n) navigate(`/news/${n.id}`) }
  const body = (isAr ? item.bodyAr : undefined) ?? item.body
  const post = () => {
    const b = text.trim()
    if (!b) return
    addComment(id, { id: `c-${Date.now()}`, author: CURRENT_USER.name, initials: CURRENT_USER.initials, text: b, time: t("Just now", "الآن") })
    setText("")
  }
  const remove = () => {
    if (getArticleById(item.id)) deleteArticle(item.id)
    else hideSeedNews(item.id)
    logAudit("deleted", item.title, "News")
    navigate("/documents")
  }

  return (
    <WPage className="flex flex-col gap-6">
      <StoryDetail isAr={isAr} icon={Newspaper} section={t("News", "الأخبار")}
        counter={pos >= 0 ? t(`News ${pos + 1} of ${published.length}`, `الخبر ${pos + 1} من ${published.length}`) : t("Draft", "مسودة")}
        onPrev={() => go(pos - 1)} onNext={() => go(pos + 1)} prevDisabled={pos <= 0} nextDisabled={pos < 0 || pos >= published.length - 1}
        img={item.img || null} tag={newsCatLabel(item.category, isAr)} tagTone={toneForCategory(item.category)}
        meta={isAr ? `${item.dateAr ?? item.date} · قراءة ${item.readMin ?? 2} د` : `${item.date} · ${item.readMin ?? 2} min read`}
        title={isAr ? item.titleAr : item.title}
        actions={isAdmin ? <>
          <WButton variant="outline" className="w-[84px]" onClick={() => setEdit(true)}>{t("Edit", "تعديل")}</WButton>
          <WButton variant="danger" className="w-[84px]" onClick={() => setConfirm(true)}><Trash2 />{t("Delete", "حذف")}</WButton>
        </> : undefined}>
        <div dir={isAr ? "rtl" : "ltr"} dangerouslySetInnerHTML={{ __html: body || `<p>${isAr ? item.excerptAr ?? item.excerpt : item.excerpt}</p>` }} />
      </StoryDetail>

      {/* comments (kept from v1) */}
      <WCard className="flex flex-col gap-5">
        <CardHead icon={MessageSquare} title={<>{t("Comments", "التعليقات")} <span className="text-muted-foreground">({arNum(comments.length, isAr)})</span></>} />
        <div className="flex gap-3">
          <Avatar className="size-9 shrink-0"><AvatarFallback className="accent-chip text-xs font-bold">{CURRENT_USER.initials}</AvatarFallback></Avatar>
          <div className="flex flex-1 flex-col gap-2">
            <WTextarea rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder={t("Add a comment…", "أضف تعليقًا…")} />
            <div className="flex justify-end"><WButton disabled={!text.trim()} onClick={post}>{t("Post comment", "نشر التعليق")}</WButton></div>
          </div>
        </div>
        {comments.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">{t("Be the first to comment.", "كن أول من يعلّق.")}</p>
        ) : (
          <div className="flex flex-col gap-4">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <Avatar className="size-9 shrink-0"><AvatarFallback className="bg-secondary text-xs font-semibold">{c.initials}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2"><span className="text-[13px] font-medium">{c.author}</span><span className="text-[11px] text-muted-foreground">{c.time}</span></div>
                  <p className="mt-0.5 text-[13px] leading-relaxed">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </WCard>

      <CreateContentModal open={edit} onClose={() => setEdit(false)} isAr={isAr} editNews={item} />
      <DeletePopup open={confirm} onClose={() => setConfirm(false)} isAr={isAr}
        title={t("Delete this news item?", "هل تريد حذف هذا الخبر؟")}
        body={t("The news item will be removed from the portal permanently. This can't be undone.", "سيُحذف الخبر نهائيًا من البوابة، ولا يمكن التراجع عن هذا الإجراء")}
        confirmLabel={t("Delete news", "حذف الخبر")} onConfirm={remove} />
    </WPage>
  )
}
