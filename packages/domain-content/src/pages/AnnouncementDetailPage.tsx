import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  Badge, Button, Card,
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@reach/shared-ui"
import { useShell } from "@reach/shell-context"
import { cn } from "@reach/shared-core"
import { ArrowLeft, Bell, Building2, CalendarDays, Megaphone, PartyPopper, Pencil, Pin, ShieldCheck, Trash2, Users } from "lucide-react"

import { type Announcement, deleteAnnouncement, useAnnouncements } from "../data/announcements"
import { logAudit } from "../data/audit"

const CAT_ICON: Record<string, React.ComponentType<{ className?: string }>> = { HR: Users, IT: ShieldCheck, Facilities: Building2, Culture: PartyPopper }

export default function AnnouncementDetailPage() {
  const { locale, role } = useShell()
  const isAr = locale === "ar"
  const isAdmin = role === "admin"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const { id = "" } = useParams()
  const a: Announcement | undefined = useAnnouncements().find((x) => x.id === id)
  const [confirmDelete, setConfirmDelete] = React.useState(false)

  if (!a) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-16 text-center">
        <Megaphone className="mx-auto size-10 text-muted-foreground/40" />
        <h1 className="mt-4 font-heading text-2xl font-semibold">{t("Announcement not found", "الإعلان غير موجود")}</h1>
        <Button className="mt-6" onClick={() => navigate("/announcements")}>{t("Back to announcements", "العودة إلى الإعلانات")}</Button>
      </main>
    )
  }

  const Icon = CAT_ICON[a.category] ?? Megaphone
  const paras = (isAr ? a.detailsAr : a.details) ?? []
  const remove = () => { deleteAnnouncement(a.id); logAudit("deleted", a.title, "Announcements"); navigate("/announcements") }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <button onClick={() => navigate("/announcements")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />{t("Back to announcements", "العودة إلى الإعلانات")}
        </button>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/announcements/edit/${a.id}`)}><Pencil className="size-3.5" />{t("Edit", "تحرير")}</Button>
            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setConfirmDelete(true)}><Trash2 className="size-4" />{t("Delete", "حذف")}</Button>
          </div>
        )}
      </div>

      <article className={cn("overflow-hidden rounded-2xl border border-border bg-card", a.important && "ring-1 ring-primary/25")}>
        <div className={cn("flex items-center gap-4 border-b border-border/70 p-6", a.important ? "bg-primary/5" : "bg-muted/40")}>
          <div className={cn("flex size-14 shrink-0 items-center justify-center rounded-2xl", a.important ? "accent-chip" : "bg-background text-muted-foreground ring-1 ring-border")}>
            <Icon className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{isAr ? a.categoryAr : a.category}</Badge>
              {a.important && <Badge className="bg-primary/15 text-primary"><Bell className="me-1 size-3" />{t("Important", "مهم")}</Badge>}
              {a.pinned && <Badge variant="outline"><Pin className="me-1 size-3" />{t("Pinned", "مثبّت")}</Badge>}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" />{isAr ? a.dateAr : a.date}</span>
              <span className="inline-flex items-center gap-1"><Users className="size-3.5" />{isAr ? a.audienceAr : a.audience}</span>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <h1 className="font-heading text-[1.7rem] font-bold leading-tight tracking-tight text-balance sm:text-[2rem]">{isAr ? a.titleAr : a.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-foreground/90">{isAr ? a.bodyAr : a.body}</p>
          {paras.length > 0 ? (
            <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-foreground/80" dir={isAr ? "rtl" : "ltr"}>
              {paras.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          ) : (
            <p className="mt-5 text-sm text-muted-foreground">{t("For any questions about this announcement, contact the issuing team via the Help Desk.", "لأي استفسار حول هذا الإعلان، تواصل مع الفريق المُصدر عبر مكتب المساعدة.")}</p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-border/60 pt-5 text-xs text-muted-foreground">
            <Megaphone className="size-3.5 text-primary" />
            {t("Official company announcement", "إعلان رسمي من الشركة")} · {isAr ? a.categoryAr : a.category}
          </div>
        </div>
      </article>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        {confirmDelete && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>{t("Delete this announcement?", "حذف هذا الإعلان؟")}</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">{t("This removes it for everyone. This can't be undone.", "سيؤدي هذا إلى إزالته للجميع. لا يمكن التراجع.")}</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDelete(false)}>{t("Cancel", "إلغاء")}</Button>
              <Button className="bg-destructive text-white hover:bg-destructive/90" onClick={remove}><Trash2 className="size-4" />{t("Delete", "حذف")}</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </main>
  )
}
