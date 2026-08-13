import * as React from "react"
import { useNavigate } from "react-router-dom"
import {
  Badge, Button, Card, Input,
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@reach/shared-ui"
import { useShell } from "@reach/shell-context"
import { cn } from "@reach/shared-core"
import { FlaskConical, Layers, Pencil, Plus, Search, ShieldCheck, Trash2, UserPlus, Users } from "lucide-react"

import { deleteGroup, roleById, usePermissionGroups } from "../data/roles"
import { logAudit } from "../data/audit"

const PAGE_SIZE = 8

export default function PermissionGroupsPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()

  const groups = usePermissionGroups()
  const [q, setQ] = React.useState("")
  const [page, setPage] = React.useState(0)
  const [confirmId, setConfirmId] = React.useState<string | null>(null)
  const confirmItem = groups.find((g) => g.id === confirmId)

  React.useEffect(() => { setPage(0) }, [q])

  const filtered = groups.filter((g) =>
    q === "" || (isAr ? g.nameAr : g.name).toLowerCase().includes(q.toLowerCase()) || (isAr ? g.descAr : g.desc).toLowerCase().includes(q.toLowerCase()),
  )
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const start = page * PAGE_SIZE
  const shown = filtered.slice(start, start + PAGE_SIZE)

  const th = "px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70"

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      {/* heading + primary action */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <Layers className="size-5" />
            <span className="text-xs font-semibold uppercase tracking-[0.14em]">{t("Permission Groups", "مجموعات الصلاحيات")}</span>
          </div>
          <h1 className="mt-2 font-heading text-[28px] font-bold leading-tight tracking-tight sm:text-[32px]">{t("Permission Groups", "مجموعات الصلاحيات")}</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">{t("Manage access levels and roles across the organization.", "إدارة مستويات الوصول والأدوار عبر المؤسسة.")}</p>
        </div>
        <Button size="lg" className="gap-1.5 shrink-0" onClick={() => navigate("/admin/permission-groups/new")}>
          <Plus className="size-4" />{t("Create Permission Group", "إنشاء مجموعة صلاحيات")}
        </Button>
      </div>

      {/* search */}
      <div className="mb-3 flex justify-end">
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search groups…", "ابحث في المجموعات…")} className="w-64 ps-9" />
        </div>
      </div>

      {/* table */}
      <Card className="overflow-hidden py-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className={th}>{t("Group name", "اسم المجموعة")}</th>
                <th className={th}>{t("Description", "الوصف")}</th>
                <th className={cn(th, "text-center")}>{t("Roles", "الأدوار")}</th>
                <th className={cn(th, "text-center")}>{t("Users", "المستخدمون")}</th>
                <th className={th}>{t("Last updated", "آخر تحديث")}</th>
                <th className={cn(th, "text-end")}>{t("Actions", "إجراءات")}</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((g) => (
                <tr key={g.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-primary/[0.03]">
                  <td className="px-4 py-3.5">
                    <button onClick={() => navigate(`/admin/permission-groups/${g.id}`)} className="text-start font-medium transition-colors hover:text-primary">
                      {isAr ? g.nameAr : g.name}
                    </button>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {g.roles.slice(0, 3).map((rid) => {
                        const r = roleById(rid)
                        if (!r) return null
                        return (
                          <span key={rid} className="inline-flex items-center gap-1 rounded-full border px-1.5 py-px text-[10px] font-medium" style={{ backgroundColor: `${r.color}1e`, color: r.color, borderColor: `${r.color}55` }}>
                            {r.kind === "beta" && <FlaskConical className="size-2.5" />}
                            {r.kind === "super" && <ShieldCheck className="size-2.5" />}
                            {isAr ? r.nameAr : r.name}
                          </span>
                        )
                      })}
                      {g.roles.length > 3 && <span className="text-[10px] text-muted-foreground">+{g.roles.length - 3}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">{isAr ? g.descAr : g.desc}</td>
                  <td className="px-4 py-3.5 text-center">
                    <Badge variant="secondary" className="tabular-nums">{g.roles.length}</Badge>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <button onClick={() => navigate(`/admin/permission-groups/${g.id}`)} className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary">
                      <Users className="size-3.5" /><span className="tabular-nums">{g.members.length}</span>
                    </button>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">{isAr ? g.updatedAr : g.updated}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" aria-label={t("Members", "الأعضاء")} onClick={() => navigate(`/admin/permission-groups/${g.id}`)}><UserPlus className="size-4" /></Button>
                      <Button variant="ghost" size="icon-sm" aria-label={t("Edit", "تحرير")} onClick={() => navigate(`/admin/permission-groups/edit/${g.id}`)}><Pencil className="size-4" /></Button>
                      <Button variant="ghost" size="icon-sm" aria-label={t("Delete", "حذف")} className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setConfirmId(g.id)}><Trash2 className="size-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {shown.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-14 text-center">
                    <Layers className="mx-auto size-8 text-muted-foreground/40" />
                    <p className="mt-3 text-sm text-muted-foreground">{q ? t("No groups match this search.", "لا توجد مجموعات مطابقة.") : t("No permission groups yet — create the first one.", "لا توجد مجموعات بعد — أنشئ الأولى.")}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* footer: count + pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/20 px-4 py-3">
          <p className="text-[12px] text-muted-foreground">
            {filtered.length === 0
              ? t("No entries", "لا توجد سجلات")
              : <>{t("Showing", "عرض")} <span className="font-medium text-foreground">{start + 1}</span> {t("to", "إلى")} <span className="font-medium text-foreground">{start + shown.length}</span> {t("of", "من")} <span className="font-medium text-foreground">{filtered.length}</span> {t("entries", "سجل")}</>}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>{t("Previous", "السابق")}</Button>
            <Button variant="outline" size="sm" disabled={page >= pageCount - 1} onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}>{t("Next", "التالي")}</Button>
          </div>
        </div>
      </Card>

      <p className="mt-4 text-xs text-muted-foreground">
        <Badge variant="outline" className="me-2">{t("Note", "ملاحظة")}</Badge>
        {t("Roles granted through a group can only be revoked here — by removing the member or editing the group — never from the individual Roles & Permissions page.", "الأدوار الممنوحة عبر مجموعة تُسحب من هنا فقط — بإزالة العضو أو تعديل المجموعة — وليس من صفحة الأدوار الفردية.")}
      </p>

      <Dialog open={!!confirmId} onOpenChange={(o) => !o && setConfirmId(null)}>
        {confirmItem && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>{t("Delete this group?", "حذف هذه المجموعة؟")}</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">{t(`Members lose the roles this group grants (${confirmItem.members.length} member${confirmItem.members.length === 1 ? "" : "s"} affected). Direct roles are unaffected.`, `سيفقد الأعضاء الأدوار الممنوحة عبر المجموعة (${confirmItem.members.length} عضو). الأدوار المباشرة لا تتأثر.`)}</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmId(null)}>{t("Cancel", "إلغاء")}</Button>
              <Button className="bg-destructive text-white hover:bg-destructive/90" onClick={() => { deleteGroup(confirmItem.id); logAudit("permission", `${t("Deleted group", "حُذفت مجموعة")} ${confirmItem.name}`, "Roles"); setConfirmId(null) }}><Trash2 className="size-4" />{t("Delete", "حذف")}</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </main>
  )
}
