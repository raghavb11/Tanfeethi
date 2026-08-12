import * as React from "react"
import { Badge, Button, Card } from "@reach/shared-ui"
import { useShell } from "@reach/shell-context"
import { Check, Minus, Plus, ShieldCheck, Users } from "lucide-react"

import { PageHeader, StatCard } from "./_ui"

const ROLES = ["Admin", "Editor", "Author", "Viewer"] as const
const ROLES_AR: Record<string, string> = { Admin: "مدير", Editor: "محرّر", Author: "كاتب", Viewer: "مشاهد" }

type Perm = { area: string; areaAr: string; grants: boolean[] } // per ROLES order
const PERMS: Perm[] = [
  { area: "View content", areaAr: "عرض المحتوى", grants: [true, true, true, true] },
  { area: "Create & edit content", areaAr: "إنشاء وتحرير المحتوى", grants: [true, true, true, false] },
  { area: "Publish content", areaAr: "نشر المحتوى", grants: [true, true, false, false] },
  { area: "Approve / moderate", areaAr: "الاعتماد والإشراف", grants: [true, true, false, false] },
  { area: "Manage document access", areaAr: "إدارة صلاحيات المستندات", grants: [true, false, false, false] },
  { area: "Manage roles & users", areaAr: "إدارة الأدوار والمستخدمين", grants: [true, false, false, false] },
  { area: "View audit logs", areaAr: "عرض سجلات التدقيق", grants: [true, false, false, false] },
]

const MEMBERS: Record<string, number> = { Admin: 4, Editor: 12, Author: 34, Viewer: 1187 }

export default function RolesPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        icon={ShieldCheck}
        eyebrow={t("Roles & Permissions", "الأدوار والصلاحيات")}
        title={t("Role-based access control", "التحكّم بالوصول حسب الدور")}
        desc={t("Define what each role can do across the CMS. Access is enforced per action and per department.", "حدّد ما يمكن لكل دور فعله في نظام المحتوى. تُطبّق الصلاحيات لكل إجراء ولكل إدارة.")}
        action={<Button size="lg"><Plus className="size-4" />{t("New role", "دور جديد")}</Button>}
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {ROLES.map((r) => (
          <StatCard key={r} icon={Users} value={String(MEMBERS[r])} label={isAr ? ROLES_AR[r] : r} sub={t("members", "عضو")} />
        ))}
      </div>

      <h2 className="mb-3 font-heading text-lg font-semibold">{t("Permission matrix", "مصفوفة الصلاحيات")}</h2>
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="p-3 text-start text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("Capability", "الصلاحية")}</th>
              {ROLES.map((r) => (
                <th key={r} className="p-3 text-center text-xs font-semibold">{isAr ? ROLES_AR[r] : r}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMS.map((p) => (
              <tr key={p.area} className="border-b border-border last:border-0">
                <td className="p-3 font-medium">{isAr ? p.areaAr : p.area}</td>
                {p.grants.map((g, i) => (
                  <td key={i} className="p-3 text-center">
                    {g ? (
                      <Check className="mx-auto size-4 text-primary" />
                    ) : (
                      <Minus className="mx-auto size-4 text-muted-foreground/40" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <p className="mt-3 text-xs text-muted-foreground">
        <Badge variant="outline" className="me-2">{t("Note", "ملاحظة")}</Badge>
        {t("Roles map to Microsoft Entra ID groups; department scoping is applied on top of these capabilities.", "ترتبط الأدوار بمجموعات Microsoft Entra ID، وتُطبّق حدود الإدارة فوق هذه الصلاحيات.")}
      </p>
    </main>
  )
}
