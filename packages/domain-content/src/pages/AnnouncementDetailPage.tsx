/** Announcement details — Figma 4758:25160. Read-only view (the design has no
 *  Edit/Delete here; admins manage announcements from the Announcements list). */
import { useNavigate, useParams } from "react-router-dom"
import { useShell } from "@reach/shell-context"
import { Megaphone } from "lucide-react"

import { EmptyState, toneForCategory, WButton, WPage } from "./_wijha"
import { StoryDetail } from "./knowledge/StoryDetail"
import { useAnnouncements } from "../data/announcements"

export default function AnnouncementDetailPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const { id = "" } = useParams()
  const items = useAnnouncements()
  const pos = items.findIndex((x) => x.id === id)
  const a = items[pos]

  if (!a) {
    return (
      <WPage>
        <EmptyState icon={Megaphone} title={t("Announcement not found", "التعميم غير موجود")}
          desc={t("It may have been removed, or the link is out of date.", "ربما حُذف التعميم أو أن الرابط قديم.")}
          action={<WButton onClick={() => navigate("/announcements")}>{t("Back to announcements", "العودة إلى التعاميم")}</WButton>} />
      </WPage>
    )
  }

  const go = (i: number) => { const n = items[i]; if (n) navigate(`/announcements/${n.id}`) }
  const paras = (isAr ? a.detailsAr : a.details) ?? []

  return (
    <WPage>
      <StoryDetail isAr={isAr} icon={Megaphone} section={t("Announcements", "التعاميم")}
        counter={t(`Announcement ${pos + 1} of ${items.length}`, `التعميم ${pos + 1} من ${items.length}`)}
        onPrev={() => go(pos - 1)} onNext={() => go(pos + 1)} prevDisabled={pos <= 0} nextDisabled={pos >= items.length - 1}
        img={a.img} tag={isAr ? a.categoryAr : a.category} tagTone={toneForCategory(a.category)}
        meta={isAr ? `${a.dateAr} · قراءة ${a.readMin ?? 2} د · ${a.audienceAr}` : `${a.date} · ${a.readMin ?? 2} min read · ${a.audience}`}
        title={isAr ? a.titleAr : a.title}>
        <p>{isAr ? a.bodyAr : a.body}</p>
        {paras.map((p, i) => <p key={i}>{p}</p>)}
      </StoryDetail>
    </WPage>
  )
}
