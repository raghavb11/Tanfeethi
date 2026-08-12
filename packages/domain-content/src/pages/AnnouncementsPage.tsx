import * as React from "react"
import { useNavigate } from "react-router-dom"
import {
  Badge, Button, Card, Input,
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@reach/shared-ui"
import { useShell } from "@reach/shell-context"
import { cn } from "@reach/shared-core"
import { Bell, Building2, History, Megaphone, PartyPopper, Pencil, Pin, Plus, Search, ShieldCheck, Trash2, Users } from "lucide-react"

import { PageHeader, StatCard } from "./_ui"
import { type Announcement, ANN_CATS, ANN_CATS_AR, deleteAnnouncement, useAnnouncements } from "../data/announcements"
import { logAudit } from "../data/audit"

const CAT_ICON: Record<string, React.ComponentType<{ className?: string }>> = { HR: Users, IT: ShieldCheck, Facilities: Building2, Culture: PartyPopper }

export default function AnnouncementsPage() {
  const { locale, role } = useShell()
  const isAr = locale === "ar"
  const isAdmin = role === "admin"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const [q, setQ] = React.useState("")
  const [cat, setCat] = React.useState("All")

  const items = useAnnouncements()
  const [confirmId, setConfirmId] = React.useState<string | null>(null)
  const confirmItem = items.find((a) => a.id === confirmId)

  const filtered = items.filter(
    (a) => (cat === "All" || a.category === cat) && (q === "" || (isAr ? a.titleAr : a.title).toLowerCase().includes(q.toLowerCase())),
  )
  const showPinned = cat === "All" && q === ""
  const pinned = items.filter((a) => a.pinned)
  const rest = showPinned ? filtered.filter((a) => !a.pinned) : filtered

  const Row = (a: Announcement, featured = false) => {
    const Icon = CAT_ICON[a.category] ?? Megaphone
    return (
      <Card key={a.id} onClick={() => navigate(`/announcements/${a.id}`)} className={cn("group flex cursor-pointer flex-row flex-wrap items-start gap-4 p-4 transition-colors hover:border-primary/50", a.important && "ring-1 ring-primary/25")}>
        <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", a.important ? "accent-chip" : "bg-muted text-muted-foreground")}>
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{isAr ? a.categoryAr : a.category}</Badge>
            {a.important && <Badge className="bg-primary/15 text-primary">{t("Important", "مهم")}</Badge>}
            {a.pinned && <Badge variant="outline"><Pin className="me-1 size-3" />{t("Pinned", "مثبّت")}</Badge>}
            <span className="text-xs text-muted-foreground">{isAr ? a.dateAr : a.date}</span>
          </div>
          <h3 className={cn("mt-1.5 font-medium leading-snug transition-colors group-hover:text-primary", featured && "font-heading text-lg font-semibold")}>{isAr ? a.titleAr : a.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{isAr ? a.bodyAr : a.body}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground/80">
            <span className="inline-flex items-center gap-1"><Users className="size-3.5" />{isAr ? a.audienceAr : a.audience}</span>
            <span className="font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">{t("Read more →", "اقرأ المزيد ←")}</span>
          </div>
        </div>
        {isAdmin && (
          <div className="flex shrink-0 gap-1">
            <Button variant="ghost" size="icon-sm" aria-label={t("Edit", "تحرير")} onClick={(e) => { e.stopPropagation(); navigate(`/announcements/edit/${a.id}`) }}><Pencil className="size-4" /></Button>
            <Button variant="ghost" size="icon-sm" aria-label={t("Delete", "حذف")} className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={(e) => { e.stopPropagation(); setConfirmId(a.id) }}><Trash2 className="size-4" /></Button>
          </div>
        )}
      </Card>
    )
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        icon={Megaphone}
        eyebrow={t("Announcements", "الإعلانات")}
        title={t("Company announcements", "إعلانات الشركة")}
        desc={t("Short, targeted notices for the whole organization — pinned to the home page when important.", "إشعارات قصيرة وموجّهة لكل المؤسسة — تُثبّت على الرئيسية عند الأهمية.")}
        action={isAdmin ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="lg" onClick={() => navigate("/admin/audit?module=Announcements")}><History className="size-4" />{t("Audit log", "سجل التدقيق")}</Button>
            <Button size="lg" onClick={() => navigate("/announcements/new")}><Plus className="size-4" />{t("New announcement", "إعلان جديد")}</Button>
          </div>
        ) : undefined}
      />

      {isAdmin && (
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={Megaphone} value={String(items.length)} label={t("Published", "منشورة")} />
          <StatCard icon={Pin} value={String(pinned.length)} label={t("Pinned", "مثبّتة")} sub={t("on home", "على الرئيسية")} />
          <StatCard icon={Bell} value={String(items.filter((a) => a.important).length)} label={t("Important", "مهمة")} />
          <StatCard icon={Users} value="1.2k" label={t("Reached", "الوصول")} sub={t("employees", "موظف")} />
        </div>
      )}

      {showPinned && pinned.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60"><Pin className="size-3.5 text-primary" />{t("Pinned", "المثبّتة")}</h2>
          <div className="space-y-3">{pinned.map((a) => Row(a, true))}</div>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {ANN_CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c} className={cn("rounded-full border px-3.5 py-1.5 text-sm transition-colors", cat === c ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground")}>
              {isAr ? ANN_CATS_AR[c] : c}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search announcements…", "ابحث في الإعلانات…")} className="w-56 ps-9" />
        </div>
      </div>

      <div className="space-y-3">
        {rest.map((a) => Row(a))}
        {rest.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border py-14 text-center">
            <Megaphone className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">{t("No announcements match this view.", "لا توجد إعلانات مطابقة لهذا العرض.")}</p>
          </div>
        )}
      </div>

      <Dialog open={!!confirmId} onOpenChange={(o) => !o && setConfirmId(null)}>
        {confirmItem && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>{t("Delete this announcement?", "حذف هذا الإعلان؟")}</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">{t("This removes it for everyone. This can't be undone.", "سيؤدي هذا إلى إزالته للجميع. لا يمكن التراجع.")}</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmId(null)}>{t("Cancel", "إلغاء")}</Button>
              <Button className="bg-destructive text-white hover:bg-destructive/90" onClick={() => { deleteAnnouncement(confirmItem.id); logAudit("deleted", confirmItem.title, "Announcements"); setConfirmId(null) }}><Trash2 className="size-4" />{t("Delete", "حذف")}</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </main>
  )
}
