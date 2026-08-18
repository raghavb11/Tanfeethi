import * as React from "react"
import { useNavigate } from "react-router-dom"
import {
  Badge, Button, Card, Input,
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@reach/shared-ui"
import { useShell } from "@reach/shell-context"
import { cn } from "@reach/shared-core"
import { Archive, BookText, CalendarClock, Download, Eye, FileCheck2, History, ListFilter, Pencil, Scale, Search, SlidersHorizontal, Tags, Trash2 } from "lucide-react"

import { CategoryBadge } from "./_ui"
import {
  ackCount, deletePolicy, lifecycleOf, POLICY_CATS, POLICY_CATS_AR, POLICY_LIFECYCLE_AR,
  POLICY_LIFECYCLES, type PolicyLifecycle, policyCatAr, policyCatColor, usePolicies,
} from "../data/policies"
import { affectedCount } from "../data/departments"
import { logAudit } from "../data/audit"

export default function PoliciesPage() {
  const { locale, role } = useShell()
  const isAr = locale === "ar"
  const isAdmin = role === "admin"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const [q, setQ] = React.useState("")
  const [cat, setCat] = React.useState("All")
  const [status, setStatus] = React.useState<"All" | PolicyLifecycle>("All")
  const [showCats, setShowCats] = React.useState(false)

  const items = usePolicies()
  const [confirmId, setConfirmId] = React.useState<string | null>(null)
  const confirmItem = items.find((p) => p.id === confirmId)

  const open = (id: string) => navigate(`/policies/${id}`)

  const list = items.filter(
    (p) => (cat === "All" || (p.categories ?? []).includes(cat)) &&
      (status === "All" || lifecycleOf(p) === status) &&
      (q === "" || (isAr ? p.titleAr : p.title).toLowerCase().includes(q.toLowerCase()) || p.number.toLowerCase().includes(q.toLowerCase())),
  )

  const counts = {
    published: items.filter((p) => lifecycleOf(p) === "Published").length,
    drafts: items.filter((p) => lifecycleOf(p) === "Draft").length,
    scheduled: items.filter((p) => lifecycleOf(p) === "Scheduled").length,
    archived: items.filter((p) => lifecycleOf(p) === "Expired").length,
  }

  return (
    <main className="@container mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
      {/* header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-[52ch]">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-primary/12 text-primary"><Scale className="size-4" /></span>
            <span className="text-[13px] font-semibold text-primary">{t("Policy Library", "مكتبة السياسات")}</span>
          </div>
          <h1 className="mt-3 font-heading text-[32px] font-bold leading-tight tracking-tight sm:text-[38px]">
            {t("Policies", "السياسات")}
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
            {t("A central, versioned repository of company policies with publish and expiry dates — always the current approved version.", "مستودع مركزي بإصدارات لسياسات الشركة مع تواريخ النشر والانتهاء — دائمًا الإصدار المعتمد الحالي.")}
          </p>
        </div>
        {isAdmin && (
          <div className="flex flex-wrap gap-2">
            {/* no policy-category admin screen exists yet — Content Management is the nearest real destination */}
            <Button variant="outline" onClick={() => navigate("/cms")}><Tags className="size-4" />{t("Manage Categories", "إدارة الفئات")}</Button>
            <Button variant="outline" onClick={() => navigate("/admin/audit?module=Policies")}><History className="size-4" />{t("Audit log", "سجل التدقيق")}</Button>
            <Button onClick={() => navigate("/policies/new")}><FileCheck2 className="size-4" />{t("New policy", "سياسة جديدة")}</Button>
          </div>
        )}
      </div>

      {/* summary */}
      {isAdmin && (
        <div className="mb-6 grid grid-cols-2 gap-4 @3xl:grid-cols-4">
          <Stat value={counts.published} label={t("Published", "منشورة")} sub={t("All time", "الإجمالي")} icon={BookText} />
          <Stat value={counts.drafts} label={t("Drafts", "مسودات")} sub={t("In review", "قيد المراجعة")} icon={Pencil} />
          <Stat value={counts.scheduled} label={t("Scheduled", "مجدولة")} sub={t("Upcoming", "قادمة")} icon={CalendarClock} />
          <Stat value={counts.archived} label={t("Archived", "مؤرشفة")} sub={t("Expired", "منتهية")} icon={Archive} />
        </div>
      )}

      {/* status pills + filters + search */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(["All", ...POLICY_LIFECYCLES] as const).map((sName) => (
            <button key={sName} onClick={() => setStatus(sName as "All" | PolicyLifecycle)} aria-pressed={status === sName}
              className={cn("rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                status === sName
                  ? "border-primary/45 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground")}>
              {sName === "All" ? t("All", "الكل") : (isAr ? POLICY_LIFECYCLE_AR[sName as PolicyLifecycle] : sName)}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setShowCats((v) => !v)} aria-pressed={showCats}>
            <SlidersHorizontal className="size-4" />{t("Filters", "تصفية")}
            {cat !== "All" && <span className="ms-1 rounded-full bg-primary/15 px-1.5 text-[11px] text-primary">1</span>}
          </Button>
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search policies…", "ابحث في السياسات…")} className="w-56 ps-9" />
          </div>
        </div>
      </div>

      {/* category filter — revealed by the Filters button */}
      {showCats && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-muted/20 p-3">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground">
            <ListFilter className="size-3.5" />{t("Category", "الفئة")}
          </span>
          {POLICY_CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c}
              className={cn("rounded-full border px-3 py-1 text-[12.5px] transition-colors",
                cat === c ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground")}>
              {isAr ? POLICY_CATS_AR[c] : c}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2.5">
        {list.map((p) => (
          <Card key={p.id} onClick={() => open(p.id)} className="flex cursor-pointer flex-row items-center gap-4 p-4 transition-colors hover:border-primary/50">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><BookText className="size-5" /></div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="me-1 font-mono text-[11px] font-medium text-primary">{p.number}</span>
                {(p.categories ?? []).map((c) => <CategoryBadge key={c} label={isAr ? policyCatAr(c) : c} color={policyCatColor(c)} />)}
                <span className="text-xs text-muted-foreground">{p.version}</span>
                {lifecycleOf(p) !== "Published" && (
                  <Badge variant="outline" className="text-[11px] text-muted-foreground">
                    {isAr ? POLICY_LIFECYCLE_AR[lifecycleOf(p)] : lifecycleOf(p)}
                  </Badge>
                )}
                {p.status === "sunset" && <Badge className="bg-destructive/15 text-destructive">{t("Sunset", "موقوفة")}</Badge>}
                {p.supersededBy && p.status !== "sunset" && <Badge variant="outline">{t("Superseded", "حُلّت محلها")}</Badge>}
                {p.requiresAck && <Badge variant="outline" className="text-primary">{t("Acknowledgement", "إقرار")}</Badge>}
              </div>
              <h3 className="mt-1 font-medium leading-snug">{isAr ? p.titleAr : p.title}</h3>
              <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{isAr ? p.summaryAr : p.summary}</p>
              {isAdmin && p.requiresAck ? (() => {
                const aff = affectedCount(p.departments ?? [], p.allDepartments ?? true)
                const ac = ackCount(p)
                const pct = aff > 0 ? Math.min(100, Math.round((ac / aff) * 100)) : 0
                return (
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 w-28 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} /></div>
                    <span className="text-xs text-muted-foreground">{pct}% {t("acknowledged", "أقرّوا")} · {ac.toLocaleString()}/{aff.toLocaleString()}</span>
                  </div>
                )
              })() : (
                <p className="mt-0.5 text-xs text-muted-foreground/70">{t("Effective", "سارية من")} {isAr ? p.effectiveAr : p.effective}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <Button onClick={(e) => { e.stopPropagation(); open(p.id) }}><Eye className="size-4" />{t("View", "عرض")}</Button>
              {isAdmin ? (
                <>
                  <Button variant="ghost" size="icon-sm" aria-label={t("Edit", "تحرير")} onClick={(e) => { e.stopPropagation(); navigate(`/policies/edit/${p.id}`) }}><Pencil className="size-4" /></Button>
                  <Button variant="ghost" size="icon-sm" aria-label={t("Delete", "حذف")} className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={(e) => { e.stopPropagation(); setConfirmId(p.id) }}><Trash2 className="size-4" /></Button>
                </>
              ) : (
                <Button variant="outline" aria-label={t("Download", "تحميل")} onClick={(e) => e.stopPropagation()}><Download className="size-4" /></Button>
              )}
            </div>
          </Card>
        ))}
        {list.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border py-14 text-center">
            <BookText className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">{t("No policies match your search.", "لا توجد سياسات مطابقة لبحثك.")}</p>
          </div>
        )}
      </div>

      <Dialog open={!!confirmId} onOpenChange={(o) => !o && setConfirmId(null)}>
        {confirmItem && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>{t("Delete this policy?", "حذف هذه السياسة؟")}</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">{t("This removes the policy from the library. This can't be undone.", "سيؤدي هذا إلى إزالة السياسة من المكتبة. لا يمكن التراجع.")}</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmId(null)}>{t("Cancel", "إلغاء")}</Button>
              <Button className="bg-destructive text-white hover:bg-destructive/90" onClick={() => { deletePolicy(confirmItem.id); logAudit("deleted", `${confirmItem.number} ${confirmItem.title}`, "Policies"); setConfirmId(null) }}><Trash2 className="size-4" />{t("Delete", "حذف")}</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </main>
  )
}

function Stat({ value, label, sub, icon: Icon }: {
  value: number; label: string; sub: string; icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="text-[30px] font-bold leading-none tabular-nums text-primary">{value}</div>
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-4" /></span>
      </div>
      <div className="mt-3 text-[14px] font-semibold">{label}</div>
      <div className="text-[12px] text-muted-foreground">{sub}</div>
    </Card>
  )
}
