import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Avatar, AvatarFallback, Badge, Button, Card, Input } from "@reach/shared-ui"
import { useShell } from "@reach/shell-context"
import { cn } from "@reach/shared-core"
import { ArrowLeft, Check, FlaskConical, Layers, Pencil, Search, UserPlus, X } from "lucide-react"

import { roleById, toggleGroupMember, usePermissionGroups, usePortalUsers } from "../data/roles"
import { logAudit } from "../data/audit"

export default function PermissionGroupMembersPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const { id = "" } = useParams()
  const group = usePermissionGroups().find((g) => g.id === id)
  const users = usePortalUsers()
  const [q, setQ] = React.useState("")

  if (!group) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-16 text-center">
        <Layers className="mx-auto size-10 text-muted-foreground/40" />
        <h1 className="mt-4 font-heading text-2xl font-semibold">{t("Group not found", "المجموعة غير موجودة")}</h1>
        <Button className="mt-6" onClick={() => navigate("/admin/permission-groups")}>{t("Back to groups", "العودة إلى المجموعات")}</Button>
      </main>
    )
  }

  const filtered = users.filter((u) =>
    q === "" || (isAr ? u.nameAr : u.name).toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()) || (isAr ? u.deptAr : u.dept).toLowerCase().includes(q.toLowerCase()),
  )
  // members first, then the rest alphabetically
  const sorted = [...filtered].sort((a, b) =>
    Number(group.members.includes(b.id)) - Number(group.members.includes(a.id)) || (isAr ? a.nameAr : a.name).localeCompare(isAr ? b.nameAr : b.name),
  )

  const toggle = (userId: string) => {
    const u = users.find((x) => x.id === userId)
    const was = group.members.includes(userId)
    toggleGroupMember(group.id, userId)
    if (u) logAudit("permission", `${was ? t("Removed", "أزيل") : t("Added", "أضيف")} ${u.name} ${was ? t("from", "من") : t("to", "إلى")} ${group.name}`, "Roles")
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => navigate("/admin/permission-groups")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />{t("Back to groups", "العودة إلى المجموعات")}
        </button>
        <Button variant="outline" size="sm" onClick={() => navigate(`/admin/permission-groups/edit/${group.id}`)}><Pencil className="size-3.5" />{t("Edit group", "تحرير المجموعة")}</Button>
      </div>

      <div className="mb-2 flex items-center gap-2 text-primary">
        <UserPlus className="size-4" />
        <span className="text-xs font-semibold uppercase tracking-[0.14em]">{t("Group members", "أعضاء المجموعة")}</span>
      </div>
      <h1 className="font-heading text-2xl font-bold tracking-tight">{isAr ? group.nameAr : group.name}</h1>
      <p className="mt-1 text-[13px] text-muted-foreground">{isAr ? group.descAr : group.desc}</p>

      {/* roles this group grants (read-only) */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/60">{t("Grants:", "تمنح:")}</span>
        {group.roles.map((rid) => {
          const r = roleById(rid)
          if (!r) return null
          return (
            <span key={rid} className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: `${r.color}1e`, color: r.color, borderColor: `${r.color}55` }}>
              {r.kind === "beta" && <FlaskConical className="size-3" />}
              {isAr ? r.nameAr : r.name}
            </span>
          )
        })}
      </div>

      <div className="mb-3 mt-6 flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">{group.members.length} {t("members — everyone below can be added or removed", "عضو — يمكن إضافة أو إزالة أي شخص أدناه")}</span>
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search people…", "ابحث عن أشخاص…")} className="w-64 ps-9" />
        </div>
      </div>

      <Card className="overflow-hidden py-0">
        {sorted.map((u, i) => {
          const isMember = group.members.includes(u.id)
          return (
            <div key={u.id} className={cn("flex items-center gap-3 px-4 py-3", i > 0 && "border-t border-border/70", isMember && "bg-primary/[0.03]")}>
              <Avatar className="size-9 shrink-0"><AvatarFallback className={cn("text-[11px] font-bold", isMember ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>{u.initials}</AvatarFallback></Avatar>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold">{isAr ? u.nameAr : u.name}</div>
                <div className="text-[11px] text-muted-foreground/70">{isAr ? u.deptAr : u.dept} · {u.email}</div>
              </div>
              {isMember && <Badge variant="outline" className="border-primary/40 bg-primary/10 text-[10px] text-primary"><Check className="me-1 size-3" />{t("Member", "عضو")}</Badge>}
              <Button size="sm" variant={isMember ? "ghost" : "outline"} className="gap-1.5 shrink-0" onClick={() => toggle(u.id)}>
                {isMember ? <><X className="size-3.5" />{t("Remove", "إزالة")}</> : <><UserPlus className="size-3.5" />{t("Add", "إضافة")}</>}
              </Button>
            </div>
          )
        })}
        {sorted.length === 0 && (
          <div className="py-14 text-center"><Search className="mx-auto size-8 text-muted-foreground/40" /><p className="mt-3 text-sm text-muted-foreground">{t("No people match this search.", "لا نتائج مطابقة.")}</p></div>
        )}
      </Card>
    </main>
  )
}
