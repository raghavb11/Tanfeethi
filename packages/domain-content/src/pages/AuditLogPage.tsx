import * as React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Avatar, AvatarFallback, Badge, Button, Card, Input } from "@reach/shared-ui"
import { useShell } from "@reach/shell-context"
import { cn } from "@reach/shared-core"
import { CheckCircle2, Clock, FileEdit, History, Search, ShieldAlert, Trash2, Upload, X } from "lucide-react"

import { PageHeader, StatCard } from "./_ui"
import { AUDIT_MODULES, AUDIT_MODULES_AR, type AuditAction, useAudit } from "../data/audit"

const META: Record<AuditAction, { icon: typeof FileEdit; label: string; labelAr: string; tone: string }> = {
  published: { icon: CheckCircle2, label: "published", labelAr: "نشر", tone: "text-[#16833e] dark:text-[#5bbd7e]" },
  edited: { icon: FileEdit, label: "edited", labelAr: "حرّر", tone: "text-primary" },
  deleted: { icon: Trash2, label: "deleted", labelAr: "حذف", tone: "text-destructive" },
  uploaded: { icon: Upload, label: "uploaded", labelAr: "رفع", tone: "text-primary" },
  approved: { icon: CheckCircle2, label: "approved", labelAr: "اعتمد", tone: "text-[#16833e] dark:text-[#5bbd7e]" },
  permission: { icon: ShieldAlert, label: "changed permissions on", labelAr: "غيّر صلاحيات", tone: "text-[#99631a] dark:text-[#d6a94a]" },
}

export default function AuditLogPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const module = params.get("module") ?? "All"
  const [q, setQ] = React.useState("")

  const entries = useAudit()

  const setModule = (m: string) => {
    if (m === "All") setParams({}, { replace: true })
    else setParams({ module: m }, { replace: true })
  }

  const list = entries.filter(
    (e) =>
      (module === "All" || e.module === module) &&
      (q === "" || `${e.who} ${e.target} ${e.module}`.toLowerCase().includes(q.toLowerCase())),
  )

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        icon={History}
        eyebrow={t("Audit Logs", "سجلات التدقيق")}
        title={module === "All" ? t("Activity & audit trail", "سجل النشاط والتدقيق") : t(`${module} audit trail`, `سجل ${AUDIT_MODULES_AR[module] ?? module}`)}
        desc={t("An immutable record of every content and permission change across the CMS, for compliance and review.", "سجل غير قابل للتعديل لكل تغيير في المحتوى والصلاحيات عبر النظام، لأغراض الامتثال والمراجعة.")}
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={History} value={String(list.length)} label={module === "All" ? t("Events", "أحداث") : t("Entries", "سجلات")} sub={module === "All" ? t("this month", "هذا الشهر") : (isAr ? AUDIT_MODULES_AR[module] : module)} />
        <StatCard icon={CheckCircle2} value={String(list.filter((e) => e.action === "published").length)} label={t("Publishes", "عمليات نشر")} />
        <StatCard icon={Trash2} value={String(list.filter((e) => e.action === "deleted").length)} label={t("Deletions", "عمليات حذف")} />
        <StatCard icon={Clock} value="90d" label={t("Retention", "الاحتفاظ")} />
      </div>

      {/* module filter + search */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {AUDIT_MODULES.map((m) => (
            <button
              key={m}
              onClick={() => setModule(m)}
              aria-pressed={module === m}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition-colors",
                module === m ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground",
              )}
            >
              {isAr ? AUDIT_MODULES_AR[m] : m}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search the log…", "ابحث في السجل…")} className="w-56 ps-9" />
        </div>
      </div>

      {module !== "All" && (
        <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm">
          <span className="text-muted-foreground">{t("Filtered to", "مُصفّى حسب")}</span>
          <span className="font-medium text-primary">{isAr ? AUDIT_MODULES_AR[module] : module}</span>
          <button onClick={() => setModule("All")} aria-label={t("Clear filter", "مسح التصفية")} className="text-muted-foreground hover:text-foreground"><X className="size-3.5" /></button>
        </div>
      )}

      <Card className="divide-y divide-border p-0">
        {list.map((e) => {
          const m = META[e.action]
          return (
            <div key={e.id} className="flex items-center gap-3 p-4">
              <Avatar className="size-9 shrink-0"><AvatarFallback className="bg-muted text-xs font-semibold">{e.initials}</AvatarFallback></Avatar>
              <div className="min-w-0 flex-1 text-sm">
                <span className="font-medium">{e.who}</span>{" "}
                <span className={cn("inline-flex items-center gap-1", m.tone)}><m.icon className="size-3.5" />{isAr ? m.labelAr : m.label}</span>{" "}
                <span className="font-medium">{e.target}</span>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  <button onClick={() => setModule(e.module)} className="me-2 inline-flex"><Badge variant="outline" className="hover:border-primary/60 hover:text-primary">{isAr ? (AUDIT_MODULES_AR[e.module] ?? e.module) : e.module}</Badge></button>
                  {e.time}
                </div>
              </div>
            </div>
          )
        })}
        {list.length === 0 && (
          <div className="py-14 text-center">
            <History className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">{t("No activity recorded for this view yet.", "لا يوجد نشاط مسجّل لهذا العرض بعد.")}</p>
          </div>
        )}
      </Card>

      <div className="mt-4 flex justify-center">
        <Button variant="outline" onClick={() => navigate("/cms")}>{t("Back to CMS overview", "العودة إلى نظرة عامة")}</Button>
      </div>
    </main>
  )
}
