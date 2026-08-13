import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  Badge, Button, Card, Input, Textarea,
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@reach/shared-ui"
import { useShell } from "@reach/shell-context"
import { cn } from "@reach/shared-core"
import { ArrowLeft, Megaphone, Pin, Trash2 } from "lucide-react"

import { SearchSelect } from "./_ui"
import { addAnnouncement, ANN_CATS, ANN_CATS_AR, AUDIENCE_NAMES, audienceArFor, deleteAnnouncement, getAnnouncementById, newAnnouncementId, updateAnnouncement } from "../data/announcements"
import { logAudit } from "../data/audit"

const EDIT_CATS = ANN_CATS.filter((c) => c !== "All")

export default function AnnouncementEditorPage() {
  const { locale, role } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const { id } = useParams()
  const editing = id ? getAnnouncementById(id) : undefined

  const [title, setTitle] = React.useState(editing?.title ?? "")
  const [body, setBody] = React.useState(editing?.body ?? "")
  const [category, setCategory] = React.useState(editing?.category ?? "HR")
  const [audience, setAudience] = React.useState(editing?.audience ?? "All employees")
  const [important, setImportant] = React.useState(editing?.important ?? false)
  const [pinned, setPinned] = React.useState(editing?.pinned ?? false)
  const [confirmDelete, setConfirmDelete] = React.useState(false)

  React.useEffect(() => { if (role !== "admin") navigate("/announcements", { replace: true }) }, [role, navigate])

  const canSave = title.trim().length > 0
  const save = () => {
    const ttl = title.trim()
    if (!ttl) return
    const fields = {
      title: ttl, titleAr: ttl, body: body.trim(), bodyAr: body.trim(),
      category, categoryAr: ANN_CATS_AR[category] ?? category,
      audience: audience.trim() || "All employees", audienceAr: audienceArFor(audience.trim() || "All employees"),
      important, pinned,
    }
    if (editing) { updateAnnouncement(editing.id, fields); logAudit("edited", ttl, "Announcements") }
    else { addAnnouncement({ id: newAnnouncementId(), date: t("Just now", "الآن"), dateAr: "الآن", ...fields }); logAudit("published", ttl, "Announcements") }
    navigate("/announcements")
  }
  const remove = () => { if (editing) { deleteAnnouncement(editing.id); logAudit("deleted", editing.title, "Announcements") } navigate("/announcements") }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => navigate("/announcements")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />{t("Back to announcements", "العودة إلى الإعلانات")}
        </button>
        <div className="flex items-center gap-2">
          {editing && <Button variant="ghost" onClick={() => setConfirmDelete(true)} className="text-destructive hover:bg-destructive/10 hover:text-destructive"><Trash2 className="size-4" />{t("Delete", "حذف")}</Button>}
          <Button variant="outline" onClick={() => navigate("/announcements")}>{t("Cancel", "إلغاء")}</Button>
          <Button disabled={!canSave} onClick={save}>{editing ? t("Save changes", "حفظ التغييرات") : t("Publish", "نشر")}</Button>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-2 text-primary">
        <Megaphone className="size-4" />
        <span className="text-xs font-semibold uppercase tracking-[0.14em]">{editing ? t("Edit announcement", "تحرير الإعلان") : t("New announcement", "إعلان جديد")}</span>
      </div>

      <Card className="space-y-5 p-6 sm:p-8">
        <div>
          <label htmlFor="ann-title" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("Title", "العنوان")}</label>
          <Input id="ann-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("Announcement title", "عنوان الإعلان")} autoFocus className="h-11 text-base" />
        </div>
        <div>
          <label htmlFor="ann-body" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("Message", "الرسالة")}</label>
          <Textarea id="ann-body" rows={5} value={body} onChange={(e) => setBody(e.target.value)} placeholder={t("What do you want to announce?", "ما الذي تريد الإعلان عنه؟")} className="text-[15px] leading-relaxed" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ann-cat" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("Category", "الفئة")}</label>
            <select id="ann-cat" value={category} onChange={(e) => setCategory(e.target.value)} className="h-11 w-full rounded-lg border border-input bg-[var(--card-elevated)] px-3 text-sm outline-none focus:border-primary/60">
              {EDIT_CATS.map((c) => <option key={c} value={c}>{isAr ? ANN_CATS_AR[c] : c}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("Audience", "الجمهور")}</label>
            <SearchSelect
              value={audience}
              onChange={setAudience}
              options={AUDIENCE_NAMES}
              placeholder={t("Select an audience…", "اختر الجمهور…")}
              searchPlaceholder={t("Search audiences…", "ابحث عن جمهور…")}
              emptyLabel={t("No audiences match", "لا توجد نتائج")}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-5 pt-1">
          <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={important} onChange={(e) => setImportant(e.target.checked)} className="size-4 accent-[var(--primary)]" />{t("Mark as important", "وضع علامة مهم")}</label>
          <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="size-4 accent-[var(--primary)]" /><Pin className="size-3.5" />{t("Pin to home page", "تثبيت على الرئيسية")}</label>
        </div>
      </Card>

      {(title.trim() || body.trim()) && (
        <div className="mt-6">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">{t("Preview", "معاينة")}</div>
          <Card className={cn("p-5", important && "ring-1 ring-primary/25")}>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{isAr ? ANN_CATS_AR[category] : category}</Badge>
              {important && <Badge className="bg-primary/15 text-primary">{t("Important", "مهم")}</Badge>}
              {pinned && <Badge variant="outline"><Pin className="me-1 size-3" />{t("Pinned", "مثبّت")}</Badge>}
            </div>
            <h3 className="mt-2 font-medium leading-snug">{title.trim() || t("Your title…", "عنوانك…")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{body.trim() || t("Your message will appear here.", "ستظهر رسالتك هنا.")}</p>
          </Card>
        </div>
      )}

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
