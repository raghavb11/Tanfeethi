import * as React from "react"
import { useNavigate } from "react-router-dom"
import {
  Badge, Button, Card, Input,
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@reach/shared-ui"
import { useShell } from "@reach/shell-context"
import { cn } from "@reach/shared-core"
import { BookText, Download, Eye, FileCheck2, History, Pencil, Scale, Search, ShieldCheck, Star, Trash2 } from "lucide-react"

import { CategoryBadge, PageHeader, StatCard } from "./_ui"
import { ackCount, deletePolicy, POLICY_CATS, POLICY_CATS_AR, policyCatAr, policyCatColor, usePolicies } from "../data/policies"
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

  const items = usePolicies()
  const [confirmId, setConfirmId] = React.useState<string | null>(null)
  const confirmItem = items.find((p) => p.id === confirmId)

  const open = (id: string) => navigate(`/policies/${id}`)

  const list = items.filter(
    (p) => (cat === "All" || (p.categories ?? []).includes(cat)) &&
      (q === "" || (isAr ? p.titleAr : p.title).toLowerCase().includes(q.toLowerCase()) || p.number.toLowerCase().includes(q.toLowerCase())),
  )
  const featured = list.filter((p) => p.featured)

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        icon={Scale}
        eyebrow={t("Policy Library", "مكتبة السياسات")}
        title={t("Policies & procedures", "السياسات والإجراءات")}
        desc={t("A central, versioned repository of company policies with effective dates — always the current approved version.", "مستودع مركزي بإصدارات لسياسات الشركة مع تواريخ السريان — دائمًا الإصدار المعتمد الحالي.")}
        action={isAdmin ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="lg" onClick={() => navigate("/admin/audit?module=Policies")}><History className="size-4" />{t("Audit log", "سجل التدقيق")}</Button>
            <Button size="lg" onClick={() => navigate("/policies/new")}><FileCheck2 className="size-4" />{t("Add policy", "إضافة سياسة")}</Button>
          </div>
        ) : undefined}
      />

      {isAdmin && (
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={BookText} value={String(items.length)} label={t("Policies", "سياسات")} />
          <StatCard icon={Star} value={String(items.filter((p) => p.featured).length)} label={t("Featured", "مميزة")} />
          <StatCard icon={FileCheck2} value="6" label={t("Updated", "محدّثة")} sub={t("this quarter", "هذا الربع")} />
          <StatCard icon={ShieldCheck} value={String(items.filter((p) => p.requiresAck).length)} label={t("Need acknowledgement", "تتطلب إقرارًا")} />
        </div>
      )}

      {cat === "All" && q === "" && featured.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">{t("Essential reading", "قراءة أساسية")}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {featured.map((p) => (
              <Card key={p.id} onClick={() => open(p.id)} className="flex cursor-pointer flex-col gap-3 p-5 transition-colors hover:border-primary/50">
                <div className="flex items-center gap-2">
                  <span className="accent-chip flex size-9 items-center justify-center rounded-lg"><Scale className="size-4" /></span>
                  <Badge className="bg-primary/15 text-primary">{t("Featured", "مميزة")}</Badge>
                  <span className="ms-auto font-mono text-[11px] text-muted-foreground">{p.number}</span>
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold leading-snug">{isAr ? p.titleAr : p.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{isAr ? p.summaryAr : p.summary}</p>
                </div>
                <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                  <span className="text-xs text-muted-foreground">{p.version} · {t("Effective", "سارية من")} {isAr ? p.effectiveAr : p.effective}</span>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={(e) => { e.stopPropagation(); open(p.id) }}><Eye className="size-4" />{t("View", "عرض")}</Button>
                    <Button variant="outline" size="sm" aria-label={t("Download", "تحميل")} onClick={(e) => e.stopPropagation()}><Download className="size-4" /></Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {POLICY_CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c} className={cn("rounded-full border px-3.5 py-1.5 text-sm transition-colors", cat === c ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground")}>
              {isAr ? POLICY_CATS_AR[c] : c}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search policies…", "ابحث في السياسات…")} className="w-56 ps-9" />
        </div>
      </div>

      <div className="space-y-2.5">
        {list.map((p) => (
          <Card key={p.id} onClick={() => open(p.id)} className="flex cursor-pointer flex-row items-center gap-4 p-4 transition-colors hover:border-primary/50">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><BookText className="size-5" /></div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="me-1 font-mono text-[11px] font-medium text-primary">{p.number}</span>
                {(p.categories ?? []).map((c) => <CategoryBadge key={c} label={isAr ? policyCatAr(c) : c} color={policyCatColor(c)} />)}
                <span className="text-xs text-muted-foreground">{p.version}</span>
                {p.featured && <Badge className="bg-primary/15 text-primary">{t("Featured", "مميزة")}</Badge>}
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
