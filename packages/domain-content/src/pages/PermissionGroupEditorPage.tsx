import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button, Card, Input, Textarea } from "@reach/shared-ui"
import { useShell } from "@reach/shell-context"
import { cn } from "@reach/shared-core"
import { ArrowLeft, Check, FlaskConical, Layers, ShieldCheck } from "lucide-react"

import { addGroup, groupById, newGroupId, ROLE_DEFS, TODAY_LABEL, TODAY_LABEL_AR, updateGroup } from "../data/roles"
import { logAudit } from "../data/audit"

/** Roles a group may bundle — everything except the implicit Employee base. */
const SELECTABLE = ROLE_DEFS.filter((r) => r.id !== "employee")

export default function PermissionGroupEditorPage() {
  const { locale, role } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const { id } = useParams()
  const editing = id ? groupById(id) : undefined

  const [name, setName] = React.useState(editing?.name ?? "")
  const [desc, setDesc] = React.useState(editing?.desc ?? "")
  const [roles, setRoles] = React.useState<string[]>(editing?.roles ?? [])

  React.useEffect(() => { if (role !== "admin") navigate("/admin/permission-groups", { replace: true }) }, [role, navigate])

  const canSave = name.trim().length > 0 && roles.length > 0
  const toggleRole = (rid: string) => setRoles((rs) => (rs.includes(rid) ? rs.filter((x) => x !== rid) : [...rs, rid]))

  const save = () => {
    const nm = name.trim()
    if (!canSave) return
    if (editing) {
      updateGroup(editing.id, { name: nm, nameAr: nm, desc: desc.trim(), descAr: desc.trim(), roles, updated: TODAY_LABEL, updatedAr: TODAY_LABEL_AR })
      logAudit("permission", `${t("Edited group", "عُدّلت مجموعة")} ${nm}`, "Roles")
    } else {
      addGroup({ id: newGroupId(), name: nm, nameAr: nm, desc: desc.trim(), descAr: desc.trim(), roles, members: [], memberSince: {}, updated: TODAY_LABEL, updatedAr: TODAY_LABEL_AR })
      logAudit("permission", `${t("Created group", "أُنشئت مجموعة")} ${nm}`, "Roles")
    }
    navigate("/admin/permission-groups")
  }

  const label = (text: string) => <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{text}</label>

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => navigate("/admin/permission-groups")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />{t("Back to groups", "العودة إلى المجموعات")}
        </button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/admin/permission-groups")}>{t("Cancel", "إلغاء")}</Button>
          <Button disabled={!canSave} onClick={save}>{editing ? t("Save changes", "حفظ التغييرات") : t("Create group", "إنشاء المجموعة")}</Button>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-2 text-primary">
        <Layers className="size-4" />
        <span className="text-xs font-semibold uppercase tracking-[0.14em]">{editing ? t("Edit group", "تحرير المجموعة") : t("New permission group", "مجموعة صلاحيات جديدة")}</span>
      </div>

      <Card className="space-y-5 p-6 sm:p-8">
        <div>{label(t("Group name", "اسم المجموعة"))}<Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("e.g. Content Team", "مثال: فريق المحتوى")} autoFocus className="h-11 text-base" /></div>
        <div>{label(t("Description", "الوصف"))}<Textarea rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={t("What is this group responsible for?", "ما مسؤولية هذه المجموعة؟")} /></div>

        <div>
          {label(t("Roles in this group", "الأدوار في هذه المجموعة"))}
          <p className="-mt-1 mb-3 text-xs text-muted-foreground">{t("Members inherit every selected role. What each role can do is fixed by the platform — you only choose which roles the group grants.", "يرث الأعضاء كل الأدوار المحددة. صلاحيات كل دور ثابتة في المنصة — تختار هنا فقط الأدوار التي تمنحها المجموعة.")}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {SELECTABLE.map((r) => {
              const on = roles.includes(r.id)
              return (
                <button key={r.id} type="button" onClick={() => toggleRole(r.id)} aria-pressed={on}
                  className={cn("flex items-start gap-2.5 rounded-xl border p-3 text-start transition-colors", on ? "ring-1" : "border-border hover:border-primary/50")}
                  style={on ? { backgroundColor: `${r.color}14`, borderColor: `${r.color}66` } : undefined}>
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border" style={on ? { backgroundColor: r.color, borderColor: r.color, color: "#fff" } : { borderColor: "var(--border)" }}>
                    {on && <Check className="size-3.5" />}
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-[13px] font-semibold" style={on ? { color: r.color } : undefined}>
                      {r.kind === "beta" && <FlaskConical className="size-3.5" />}
                      {r.kind === "super" && <ShieldCheck className="size-3.5" />}
                      {isAr ? r.nameAr : r.name}
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground/75">{isAr ? r.descAr : r.desc}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </Card>
    </main>
  )
}
