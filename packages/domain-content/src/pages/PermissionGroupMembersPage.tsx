import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Avatar, AvatarFallback, Badge, Button, Card, Input } from "@reach/shared-ui"
import { useShell } from "@reach/shell-context"
import { cn } from "@reach/shared-core"
import { ChevronLeft, ChevronRight, Download, Layers, ListFilter, Plus, Search, Shield, Trash2, UserPlus, Users, X } from "lucide-react"

import { addGroupMembers, toggleGroupMember, usePermissionGroups, usePortalUsers } from "../data/roles"
import { logAudit } from "../data/audit"

const PAGE_SIZE = 8

export default function PermissionGroupMembersPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const { id = "" } = useParams()
  const group = usePermissionGroups().find((g) => g.id === id)
  const users = usePortalUsers()

  const [q, setQ] = React.useState("")
  const [page, setPage] = React.useState(0)
  const [showFilter, setShowFilter] = React.useState(false)
  const [dept, setDept] = React.useState("All")
  const [adding, setAdding] = React.useState(false)
  const [addQ, setAddQ] = React.useState("")
  const [picked, setPicked] = React.useState<string[]>([])

  React.useEffect(() => { setPage(0) }, [q, dept])

  if (!group) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-16 text-center">
        <Layers className="mx-auto size-10 text-muted-foreground/40" />
        <h1 className="mt-4 font-heading text-2xl font-semibold">{t("Group not found", "المجموعة غير موجودة")}</h1>
        <Button className="mt-6" onClick={() => navigate("/admin/permission-groups")}>{t("Back to groups", "العودة إلى المجموعات")}</Button>
      </main>
    )
  }

  const memberUsers = group.members.map((mid) => users.find((u) => u.id === mid)).filter(Boolean) as typeof users
  const depts = ["All", ...Array.from(new Set(memberUsers.map((u) => u.dept)))]

  const filtered = memberUsers.filter((u) =>
    (dept === "All" || u.dept === dept) &&
    (q === "" || (isAr ? u.nameAr : u.name).toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase())),
  )
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const start = page * PAGE_SIZE
  const shown = filtered.slice(start, start + PAGE_SIZE)

  const candidates = users.filter((u) =>
    !group.members.includes(u.id) &&
    (addQ === "" || (isAr ? u.nameAr : u.name).toLowerCase().includes(addQ.toLowerCase()) || u.email.toLowerCase().includes(addQ.toLowerCase())),
  )

  const remove = (userId: string) => {
    const u = users.find((x) => x.id === userId)
    toggleGroupMember(group.id, userId)
    if (u) logAudit("permission", `${t("Removed", "أزيل")} ${u.name} ${t("from", "من")} ${group.name}`, "Roles")
  }
  const confirmAdd = () => {
    if (picked.length === 0) return
    addGroupMembers(group.id, picked)
    logAudit("permission", `${t("Added", "أضيف")} ${picked.length} ${t("user(s) to", "مستخدم إلى")} ${group.name}`, "Roles")
    setPicked([]); setAddQ(""); setAdding(false)
  }
  const exportCsv = () => {
    const head = ["Name", "Email", "Department", "Status", "Date added"]
    const rows = filtered.map((u) => [isAr ? u.nameAr : u.name, u.email, isAr ? u.deptAr : u.dept, u.status ?? "Active", group.memberSince[u.id]?.en ?? "—"])
    const csv = [head, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n")
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }))
    const a = document.createElement("a")
    a.href = url; a.download = `${group.name.replace(/\s+/g, "-").toLowerCase()}-members.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  const th = "px-4 py-3 text-start text-[12px] font-medium text-muted-foreground"
  const crumb = "text-[12px] text-muted-foreground transition-colors hover:text-foreground"

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      {/* breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5">
        <button onClick={() => navigate("/admin/roles")} className={crumb}>{t("Permissions", "الصلاحيات")}</button>
        <ChevronRight className={cn("size-3 text-muted-foreground/40", isAr && "rotate-180")} />
        <button onClick={() => navigate("/admin/permission-groups")} className={crumb}>{t("Groups", "المجموعات")}</button>
        <ChevronRight className={cn("size-3 text-muted-foreground/40", isAr && "rotate-180")} />
        <span className="text-[12px] font-medium text-foreground">{t("Manage Users", "إدارة المستخدمين")}</span>
      </nav>

      {/* heading */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-heading text-[28px] font-bold leading-tight tracking-tight sm:text-[32px]">
            {t("Manage Users", "إدارة المستخدمين")} - {isAr ? group.nameAr : group.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[13px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Users className="size-4" />{t("Total Users:", "إجمالي المستخدمين:")} {group.members.length}</span>
            <span className="inline-flex items-center gap-1.5"><Shield className="size-4" />{t("Roles:", "الأدوار:")} {group.roles.length}</span>
          </div>
        </div>
        <Button size="lg" className="shrink-0 gap-1.5" onClick={() => setAdding((v) => !v)}>
          <Plus className="size-4" />{t("Add Users", "إضافة مستخدمين")}
        </Button>
      </div>

      {/* inline add-users panel (never a popup) */}
      {adding && (
        <Card className="mb-4 border-primary/40 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 text-sm font-semibold"><UserPlus className="size-4 text-primary" />{t("Add users to this group", "إضافة مستخدمين إلى المجموعة")}</div>
            <button type="button" onClick={() => { setAdding(false); setPicked([]); setAddQ("") }} aria-label={t("Close", "إغلاق")} className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"><X className="size-4" /></button>
          </div>
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={addQ} onChange={(e) => setAddQ(e.target.value)} placeholder={t("Search people to add…", "ابحث عن أشخاص للإضافة…")} className="w-full ps-9" />
          </div>
          <div className="max-h-56 space-y-1 overflow-y-auto">
            {candidates.map((u) => {
              const on = picked.includes(u.id)
              return (
                <button key={u.id} type="button" onClick={() => setPicked((p) => (on ? p.filter((x) => x !== u.id) : [...p, u.id]))} aria-pressed={on}
                  className={cn("flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-start transition-colors", on ? "border-primary bg-primary/[0.06]" : "border-border hover:border-primary/50")}>
                  <Avatar className="size-7 shrink-0"><AvatarFallback className="bg-muted text-[10px] font-semibold">{u.initials}</AvatarFallback></Avatar>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium">{isAr ? u.nameAr : u.name}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">{u.email} · {isAr ? u.deptAr : u.dept}</span>
                  </span>
                  {on && <Badge className="bg-primary/15 text-[10px] text-primary">{t("Selected", "محدّد")}</Badge>}
                </button>
              )
            })}
            {candidates.length === 0 && <p className="py-6 text-center text-xs text-muted-foreground">{t("Everyone is already in this group.", "الجميع أعضاء في هذه المجموعة بالفعل.")}</p>}
          </div>
          <div className="mt-3 flex items-center justify-end gap-2 border-t border-border/60 pt-3">
            <span className="me-auto text-xs text-muted-foreground">{picked.length} {t("selected", "محدّد")}</span>
            <Button variant="outline" size="sm" onClick={() => { setAdding(false); setPicked([]); setAddQ("") }}>{t("Cancel", "إلغاء")}</Button>
            <Button size="sm" disabled={picked.length === 0} onClick={confirmAdd}><Plus className="size-3.5" />{t("Add to group", "إضافة للمجموعة")}</Button>
          </div>
        </Card>
      )}

      {/* members table */}
      <Card className="overflow-hidden py-0">
        {/* toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
          <div className="relative min-w-[14rem] flex-1 sm:max-w-sm">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search users by name or email…", "ابحث بالاسم أو البريد…")} className="w-full ps-9" />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" aria-pressed={showFilter} onClick={() => setShowFilter((v) => !v)}><ListFilter className="size-4" />{t("Filter", "تصفية")}</Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={exportCsv}><Download className="size-4" />{t("Export", "تصدير")}</Button>
          </div>
        </div>

        {showFilter && (
          <div className="flex flex-wrap items-center gap-2 border-b border-border/60 bg-muted/20 px-4 py-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70">{t("Department", "الإدارة")}</span>
            {depts.map((d) => (
              <button key={d} onClick={() => setDept(d)} aria-pressed={dept === d} className={cn("rounded-full border px-3 py-1 text-xs transition-colors", dept === d ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/60")}>
                {d === "All" ? t("All", "الكل") : d}
              </button>
            ))}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className={th}>{t("User Name", "اسم المستخدم")}</th>
                <th className={th}>{t("Email", "البريد الإلكتروني")}</th>
                <th className={th}>{t("Department", "الإدارة")}</th>
                <th className={th}>{t("Status", "الحالة")}</th>
                <th className={th}>{t("Date Added", "تاريخ الإضافة")}</th>
                <th className={cn(th, "text-end")}>{t("Actions", "إجراءات")}</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((u) => {
                const active = (u.status ?? "Active") === "Active"
                return (
                  <tr key={u.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-primary/[0.03]">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-8 shrink-0"><AvatarFallback className="bg-primary/12 text-[10px] font-bold text-primary">{u.initials}</AvatarFallback></Avatar>
                        <span className="font-medium">{isAr ? u.nameAr : u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3.5 text-muted-foreground">{isAr ? u.deptAr : u.dept}</td>
                    <td className="px-4 py-3.5">
                      <Badge variant="outline" className={cn("gap-1.5 text-[11px]", active ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "border-border text-muted-foreground")}>
                        <span className={cn("size-1.5 rounded-full", active ? "bg-emerald-500" : "bg-muted-foreground/50")} />
                        {active ? t("Active", "نشط") : t("Inactive", "غير نشط")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">{(isAr ? group.memberSince[u.id]?.ar : group.memberSince[u.id]?.en) ?? "—"}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex justify-end">
                        <Button variant="ghost" size="icon-sm" aria-label={t("Remove from group", "إزالة من المجموعة")} className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => remove(u.id)}><Trash2 className="size-4" /></Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {shown.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-14 text-center">
                    <Users className="mx-auto size-8 text-muted-foreground/40" />
                    <p className="mt-3 text-sm text-muted-foreground">{group.members.length === 0 ? t("No users in this group yet — add the first one.", "لا يوجد مستخدمون بعد — أضف الأول.") : t("No users match this view.", "لا يوجد مستخدمون مطابقون.")}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* footer: count + numbered pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/20 px-4 py-3">
          <p className="text-[12px] text-muted-foreground">
            {filtered.length === 0
              ? t("No entries", "لا توجد سجلات")
              : <>{t("Showing", "عرض")} <span className="font-medium text-foreground">{start + 1}</span> {t("to", "إلى")} <span className="font-medium text-foreground">{start + shown.length}</span> {t("of", "من")} <span className="font-medium text-foreground">{filtered.length}</span> {t("entries", "سجل")}</>}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon-sm" aria-label={t("Previous", "السابق")} disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
              <ChevronLeft className={cn("size-4", isAr && "rotate-180")} />
            </Button>
            {Array.from({ length: pageCount }, (_, i) => (
              <button key={i} onClick={() => setPage(i)} aria-current={page === i} className={cn("min-w-8 rounded-md border px-2.5 py-1 text-xs font-medium tabular-nums transition-colors", page === i ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground")}>
                {i + 1}
              </button>
            ))}
            <Button variant="outline" size="icon-sm" aria-label={t("Next", "التالي")} disabled={page >= pageCount - 1} onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}>
              <ChevronRight className={cn("size-4", isAr && "rotate-180")} />
            </Button>
          </div>
        </div>
      </Card>
    </main>
  )
}
