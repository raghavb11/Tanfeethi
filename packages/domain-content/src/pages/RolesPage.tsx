import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, Badge, Button, Card, Input } from "@reach/shared-ui"
import { useShell } from "@reach/shell-context"
import { cn } from "@reach/shared-core"
import { Check, ChevronDown, FlaskConical, Layers, Lock, Search, ShieldCheck, UserCog, Users } from "lucide-react"

import { PageHeader, StatCard } from "./_ui"
import { BETA_FEATURES, effectiveRoles, ROLE_DEFS, type RoleDef, roleById, roleMemberCount, rolesViaGroups, toggleUserRole, usePermissionGroups, usePortalUsers } from "../data/roles"
import { logAudit } from "../data/audit"

type Tab = "users" | "beta"

function RoleChip({ role, isAr, locked }: { role: RoleDef; isAr: boolean; locked?: boolean }) {
  const c = locked ? "#8a8a8a" : role.color
  return (
    <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: `${c}1e`, color: c, borderColor: `${c}55` }}>
      {locked && <Lock className="size-2.5" />}
      {role.kind === "beta" && <FlaskConical className="size-3" />}
      {role.kind === "super" && <ShieldCheck className="size-3" />}
      {isAr ? role.nameAr : role.name}
    </span>
  )
}

export default function RolesPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()

  const users = usePortalUsers()
  const groups = usePermissionGroups()
  const [tab, setTab] = React.useState<Tab>("users")
  const [q, setQ] = React.useState("")
  const [expanded, setExpanded] = React.useState<string | null>(null)

  const betaCount = roleMemberCount(users, groups, "beta")
  const adminCount = users.filter((u) => effectiveRoles(u, groups).some((r) => roleById(r)?.kind === "feature")).length

  const filteredUsers = users.filter((u) =>
    q === "" || (isAr ? u.nameAr : u.name).toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()) || (isAr ? u.deptAr : u.dept).toLowerCase().includes(q.toLowerCase()),
  )

  const toggle = (userId: string, roleId: string) => {
    const u = users.find((x) => x.id === userId)
    const r = roleById(roleId)
    if (!u || !r) return
    const had = u.roles.includes(roleId)
    toggleUserRole(userId, roleId)
    logAudit("permission", `${had ? t("Removed", "أزيل") : t("Granted", "مُنح")} ${r.name} · ${u.name}`, "Roles")
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        icon={ShieldCheck}
        eyebrow={t("Roles & Permissions", "الأدوار والصلاحيات")}
        title={t("Assign roles to people", "إسناد الأدوار للأشخاص")}
        desc={t("Grant individual roles here. Roles that come from a permission group are locked — manage those in the group itself.", "امنح الأدوار الفردية هنا. الأدوار القادمة من مجموعة صلاحيات مقفلة — تُدار من المجموعة نفسها.")}
        action={<Button variant="outline" size="lg" onClick={() => navigate("/admin/permission-groups")}><Layers className="size-4" />{t("Permission groups", "مجموعات الصلاحيات")}</Button>}
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Users} value={String(users.length)} label={t("Users", "مستخدمون")} />
        <StatCard icon={UserCog} value={String(adminCount)} label={t("Feature admins", "مدراء الميزات")} />
        <StatCard icon={FlaskConical} value={String(betaCount)} label={t("Beta testers", "مختبرون")} />
        <StatCard icon={Layers} value={String(groups.length)} label={t("Groups", "مجموعات")} />
      </div>

      {/* tabs */}
      <div className="mb-5 inline-flex rounded-xl border border-border p-0.5">
        {([{ id: "users", label: "Users", ar: "المستخدمون", icon: Users }, { id: "beta", label: "Beta program", ar: "البرنامج التجريبي", icon: FlaskConical }] as const).map((tb) => (
          <button key={tb.id} onClick={() => setTab(tb.id)} aria-pressed={tab === tb.id} className={cn("inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors", tab === tb.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
            <tb.icon className="size-4" />{isAr ? tb.ar : tb.label}
          </button>
        ))}
      </div>

      {tab === "users" && (
        <>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">{t("Click a user to grant or remove roles. Changes are audit-logged.", "انقر على مستخدم لمنح الأدوار أو إزالتها. تُسجّل التغييرات في التدقيق.")}</p>
            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search name, email, department…", "ابحث بالاسم أو البريد أو الإدارة…")} className="w-72 ps-9" />
            </div>
          </div>

          <Card className="overflow-hidden py-0">
            {filteredUsers.map((u, i) => {
              const isOpen = expanded === u.id
              const viaGroup = rolesViaGroups(groups, u.id, isAr)
              const effective = effectiveRoles(u, groups)
              return (
                <div key={u.id} className={cn(i > 0 && "border-t border-border/70")}>
                  <button onClick={() => setExpanded(isOpen ? null : u.id)} className="flex w-full items-center gap-3 px-4 py-3 text-start transition-colors hover:bg-primary/[0.03]" aria-expanded={isOpen}>
                    <Avatar className="size-9 shrink-0"><AvatarFallback className="bg-primary/12 text-[11px] font-bold text-primary">{u.initials}</AvatarFallback></Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="text-[13px] font-semibold">{isAr ? u.nameAr : u.name}</span>
                        <span className="text-[11px] text-muted-foreground/70">{isAr ? u.deptAr : u.dept} · {u.email}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {effective.map((rid) => { const r = roleById(rid); return r ? <RoleChip key={rid} role={r} isAr={isAr} locked={viaGroup.has(rid) && !u.roles.includes(rid)} /> : null })}
                      </div>
                    </div>
                    <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                  </button>

                  {/* inline role editor */}
                  {isOpen && (
                    <div className="border-t border-border/60 bg-muted/20 px-4 py-3.5">
                      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/65">{t("Individual roles", "الأدوار الفردية")}</div>
                      <div className="flex flex-wrap gap-1.5">
                        {ROLE_DEFS.map((r) => {
                          const direct = u.roles.includes(r.id)
                          const fromGroups = viaGroup.get(r.id)
                          const groupLocked = !!fromGroups && !direct
                          const baseLocked = r.id === "employee"
                          const disabled = baseLocked || groupLocked
                          return (
                            <button
                              key={r.id}
                              type="button"
                              disabled={disabled}
                              onClick={() => toggle(u.id, r.id)}
                              aria-pressed={direct || groupLocked}
                              title={groupLocked
                                ? `${t("Granted by group:", "ممنوح عبر مجموعة:")} ${fromGroups!.join(", ")} — ${t("revoke it there", "يُسحب من هناك")}`
                                : baseLocked ? t("Base role — always on", "الدور الأساسي — دائم") : (isAr ? r.descAr : r.desc)}
                              className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium transition-all", disabled && "cursor-not-allowed", groupLocked && "opacity-55 grayscale", baseLocked && "opacity-60")}
                              style={direct || groupLocked || baseLocked
                                ? { backgroundColor: `${groupLocked ? "#8a8a8a" : r.color}22`, color: groupLocked ? "#8a8a8a" : r.color, borderColor: `${groupLocked ? "#8a8a8a" : r.color}66` }
                                : { borderColor: "var(--border)", color: "var(--muted-foreground)" }}
                            >
                              {groupLocked ? <Lock className="size-3.5" /> : (direct || baseLocked) ? <Check className="size-3.5" /> : <span className="size-3.5 rounded-full border border-current opacity-40" />}
                              {r.kind === "beta" && <FlaskConical className="size-3" />}
                              {isAr ? r.nameAr : r.name}
                              {groupLocked && <span className="text-[10px] opacity-80">· {fromGroups![0]}</span>}
                            </button>
                          )
                        })}
                      </div>
                      <p className="mt-2 text-[11px] text-muted-foreground/60">
                        <Lock className="me-1 inline size-3" />
                        {t("Locked roles come from a permission group — remove the user from the group to revoke them.", "الأدوار المقفلة قادمة من مجموعة صلاحيات — أزل المستخدم من المجموعة لسحبها.")}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
            {filteredUsers.length === 0 && (
              <div className="py-14 text-center"><Users className="mx-auto size-8 text-muted-foreground/40" /><p className="mt-3 text-sm text-muted-foreground">{t("No users match this search.", "لا يوجد مستخدمون مطابقون.")}</p></div>
            )}
          </Card>
        </>
      )}

      {tab === "beta" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="self-start p-5">
            <div className="mb-1 flex items-center gap-2"><FlaskConical className="size-4" style={{ color: "#7c5cd6" }} /><h2 className="font-heading text-[15px] font-semibold">{t("Features in beta", "الميزات التجريبية")}</h2></div>
            <p className="mb-4 text-[12px] text-muted-foreground">{t("Separate beta pages visible only to Beta Testers — production pages are untouched.", "صفحات تجريبية منفصلة يراها المختبرون فقط — دون تأثير على الصفحات الحالية.")}</p>
            <div className="space-y-2.5">
              {BETA_FEATURES.map((f) => (
                <div key={f.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-[var(--card-elevated)] px-3.5 py-3">
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold">{isAr ? f.nameAr : f.name}</div>
                    <div className="text-[11px] text-muted-foreground/70">{isAr ? f.areaAr : f.area} · {t("in beta since", "تجريبية منذ")} {isAr ? f.sinceAr : f.since}</div>
                  </div>
                  <Badge variant="outline" className="shrink-0 gap-1 border-[#7c5cd6]/40 bg-[#7c5cd6]/10 text-[10px] text-[#7c5cd6]"><FlaskConical className="size-3" />{t("Beta", "تجريبي")}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="self-start p-5">
            <div className="mb-1 flex items-center gap-2"><Users className="size-4 text-primary" /><h2 className="font-heading text-[15px] font-semibold">{t("Beta testers", "المختبرون التجريبيون")} <span className="text-muted-foreground">({betaCount})</span></h2></div>
            <p className="mb-4 text-[12px] text-muted-foreground">{t("Grant or remove the individual Beta Tester role. Members of a beta group are locked here.", "امنح دور المختبر الفردي أو أزله. أعضاء المجموعات التجريبية مقفلون هنا.")}</p>
            <div className="space-y-1.5">
              {users.map((u) => {
                const viaGroup = rolesViaGroups(groups, u.id, isAr).get("beta")
                const direct = u.roles.includes("beta")
                const inBeta = direct || !!viaGroup
                return (
                  <div key={u.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/40">
                    <Avatar className="size-8 shrink-0"><AvatarFallback className="bg-muted text-[10px] font-semibold">{u.initials}</AvatarFallback></Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-medium">{isAr ? u.nameAr : u.name}</div>
                      <div className="truncate text-[11px] text-muted-foreground/65">{viaGroup ? `${t("Via group", "عبر مجموعة")} ${viaGroup[0]}` : (isAr ? u.deptAr : u.dept)}</div>
                    </div>
                    {viaGroup ? (
                      <Button size="sm" variant="ghost" disabled className="gap-1.5 opacity-60"><Lock className="size-3.5" />{t("In beta", "مشارك")}</Button>
                    ) : (
                      <Button size="sm" variant={inBeta ? "secondary" : "outline"} className="gap-1.5" onClick={() => toggle(u.id, "beta")}>
                        {inBeta ? <><Check className="size-3.5" />{t("In beta", "مشارك")}</> : t("Add", "إضافة")}
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      )}

      <p className="mt-5 text-xs text-muted-foreground">
        <Badge variant="outline" className="me-2">{t("Mendix mapping", "ربط Mendix")}</Badge>
        {t("Each role = a Mendix user role with fixed module-role capabilities. Permission groups and individual grants both resolve to the same user-role assignment; group-derived grants are system-managed.", "كل دور = دور مستخدم في Mendix بصلاحيات ثابتة. تُحل المجموعات والمنح الفردية إلى نفس إسناد الأدوار؛ المنح عبر المجموعات يديرها النظام.")}
      </p>
    </main>
  )
}
