import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Badge, Button, Card } from "@reach/shared-ui"
import { useShell } from "@reach/shell-context"
import { cn } from "@reach/shared-core"
import { AlertTriangle, ArrowLeft, CalendarClock, CalendarDays, Check, Download, FileText, Hash, History, Infinity as InfinityIcon, Printer, ShieldCheck, UserCircle2, Users } from "lucide-react"

import { CategoryBadge } from "./_ui"
import { ackCount, acknowledgePolicy, formatPolicyDate, policyBody, policyCatAr, policyCatColor, usePolicies } from "../data/policies"
import { affectedCount, DEPARTMENTS } from "../data/departments"
import { TYPE_STYLE, useDocuments } from "../data/documents"
import { CURRENT_USER } from "../data/currentUser"

const PROSE = cn(
  "text-[16px] leading-[1.75]",
  "[&_h2]:mb-2 [&_h2]:mt-8 [&_h2]:font-heading [&_h2]:text-xl [&_h2]:font-semibold [&_h2:first-child]:mt-0",
  "[&_h3]:mb-1 [&_h3]:mt-5 [&_h3]:font-heading [&_h3]:text-lg [&_h3]:font-semibold",
  "[&_p]:my-4 [&_p]:text-foreground/85",
  "[&_ul]:my-4 [&_ul]:list-disc [&_ul]:ps-6 [&_ul]:text-foreground/85 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:ps-6 [&_li]:my-1.5",
  "[&_a]:text-primary [&_a]:underline",
  "[&_blockquote]:my-4 [&_blockquote]:border-s-2 [&_blockquote]:border-primary [&_blockquote]:ps-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
)

export default function PolicyReaderPage() {
  const { locale, role } = useShell()
  const isAr = locale === "ar"
  const isAdmin = role === "admin"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const { id = "" } = useParams()
  const policies = usePolicies()
  const allDocs = useDocuments()
  const policy = policies.find((p) => p.id === id)

  if (!policy) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-16 text-center">
        <FileText className="mx-auto size-10 text-muted-foreground/40" />
        <h1 className="mt-4 font-heading text-2xl font-semibold">{t("Policy not found", "السياسة غير موجودة")}</h1>
        <Button className="mt-6" onClick={() => navigate("/policies")}>{t("Back to policies", "العودة إلى السياسات")}</Button>
      </main>
    )
  }

  const affected = affectedCount(policy.departments ?? [], policy.allDepartments ?? true)
  const acked = ackCount(policy)
  const ackedByMe = (policy.acknowledgedBy ?? []).includes(CURRENT_USER.id)
  const ackPct = affected > 0 ? Math.min(100, Math.round((acked / affected) * 100)) : 0
  const deptLabel = policy.allDepartments ?? true
    ? t("All employees", "كل الموظفين")
    : (policy.departments ?? []).map((d) => { const dep = DEPARTMENTS.find((x) => x.id === d); return isAr ? dep?.nameAr : dep?.name }).filter(Boolean).join("، ")
  const supersededBy = policy.supersededBy ? policies.find((p) => p.id === policy.supersededBy) : undefined
  const supersedes = policy.supersedes ? policies.find((p) => p.id === policy.supersedes) : undefined
  const isSunset = policy.status === "sunset"
  const attachedDocs = (policy.relatedDocs ?? []).map((did) => allDocs.find((d) => d.id === did)).filter(Boolean) as ReturnType<typeof useDocuments>
  const fromText = formatPolicyDate(policy.applicableFrom, isAr)
  const tillText = policy.applicableFrom
    ? (policy.applicableTill ? formatPolicyDate(policy.applicableTill, isAr) : t("indefinitely", "بلا نهاية"))
    : ""

  return (
    <main className="@container mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <button onClick={() => navigate("/policies")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />{t("Back to policies", "العودة إلى السياسات")}
        </button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Printer className="size-3.5" />{t("Print", "طباعة")}</Button>
          <Button size="sm"><Download className="size-4" />{t("Download PDF", "تحميل PDF")}</Button>
        </div>
      </div>

      {/* superseded / sunset notice */}
      {supersededBy && (
        <div className={cn("mb-5 flex flex-wrap items-center gap-2 rounded-xl border p-3 text-sm", isSunset ? "border-destructive/30 bg-destructive/[0.05]" : "border-[#99631a]/30 bg-[#99631a]/[0.05]")}>
          <History className={cn("size-4 shrink-0", isSunset ? "text-destructive" : "text-[#99631a] dark:text-[#d6a94a]")} />
          <span>{isSunset ? t("This policy is sunset and no longer effective.", "هذه السياسة موقوفة ولم تعد سارية.") : t("This policy has been superseded but remains effective.", "حلّت محلها سياسة أخرى لكنها ما زالت سارية.")}</span>
          <button onClick={() => navigate(`/policies/${supersededBy.id}`)} className="font-medium text-primary hover:underline">{t("View", "عرض")} {supersededBy.number} →</button>
        </div>
      )}

      <div className="grid gap-8 @4xl:grid-cols-[minmax(0,1fr)_290px] @4xl:gap-12">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono text-[11px] tracking-wide">{policy.number}</Badge>
            {(policy.categories ?? []).map((c) => <CategoryBadge key={c} label={isAr ? policyCatAr(c) : c} color={policyCatColor(c)} />)}
            <span className="text-xs text-muted-foreground">{policy.version}</span>
            {policy.featured && <Badge className="bg-primary/15 text-primary">{t("Featured", "مميزة")}</Badge>}
            {isSunset && <Badge className="bg-destructive/15 text-destructive">{t("Sunset", "موقوفة")}</Badge>}
          </div>

          <h1 className="mt-4 font-heading text-[2rem] font-bold leading-[1.1] tracking-tight text-balance sm:text-[2.5rem]">{isAr ? policy.titleAr : policy.title}</h1>
          <p className="mt-3 max-w-[68ch] text-lg leading-relaxed text-muted-foreground">{isAr ? policy.summaryAr : policy.summary}</p>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-border py-3.5 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-4" />{t("Effective", "سارية من")} {isAr ? policy.effectiveAr : policy.effective}</span>
            {fromText && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="size-4" />{t("Applicable", "سريان")} {fromText} <span className="opacity-60">→</span> {policy.applicableTill ? tillText : <span className="inline-flex items-center gap-1"><InfinityIcon className="size-3.5" />{tillText}</span>}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5"><UserCircle2 className="size-4" />{isAr ? policy.ownerAr : policy.owner}</span>
            <span className="inline-flex items-center gap-1.5"><Users className="size-4" />{deptLabel}</span>
          </div>

          {supersedes && (
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <History className="size-3.5" />{t("Supersedes", "تحلّ محل")} <button onClick={() => navigate(`/policies/${supersedes.id}`)} className="font-medium text-primary hover:underline">{supersedes.number} {isAr ? supersedes.titleAr : supersedes.title}</button>
            </p>
          )}

          {/* acknowledgement banner (user) */}
          {policy.requiresAck && !isAdmin && (
            ackedByMe ? (
              <div className="mt-5 flex items-center gap-2 rounded-xl border border-[#16833e]/30 bg-[#16833e]/[0.06] p-3 text-sm">
                <Check className="size-4 text-[#16833e] dark:text-[#5bbd7e]" />{t("You have acknowledged this policy. Thank you.", "لقد أقررت بهذه السياسة. شكرًا لك.")}
              </div>
            ) : (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/[0.05] p-4">
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="size-4 text-primary" />{t("Please read this policy and acknowledge that you understand it.", "يرجى قراءة هذه السياسة والإقرار بأنك فهمتها.")}
                </div>
                <Button onClick={() => acknowledgePolicy(policy.id, CURRENT_USER.id)}><Check className="size-4" />{t("I have read & accept", "قرأت وأوافق")}</Button>
              </div>
            )
          )}

          <div className={cn("mt-8 max-w-[72ch]", PROSE)} dir={isAr ? "rtl" : "ltr"} dangerouslySetInnerHTML={{ __html: policyBody(policy, isAr) }} />

          {/* attached documents */}
          {attachedDocs.length > 0 && (
            <div className="mt-8 max-w-[72ch]">
              <h2 className="mb-3 flex items-center gap-2 font-heading text-xl font-semibold"><FileText className="size-5 text-primary" />{t("Attached documents", "المستندات المرفقة")}</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {attachedDocs.map((d) => (
                  <button key={d.id} onClick={() => navigate(`/documents/${d.id}`)} className="flex items-center gap-2.5 rounded-lg border border-border bg-[var(--card-elevated)] px-3 py-2.5 text-start text-sm transition-colors hover:border-primary/50">
                    <span className={cn("flex size-8 shrink-0 items-center justify-center rounded text-[9px] font-bold text-white", TYPE_STYLE[d.type])}>{d.type}</span>
                    <span className="min-w-0 flex-1 truncate font-medium">{isAr ? d.nameAr : d.name}</span>
                    <Download className="size-4 shrink-0 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* acknowledge again at the end (user, unacked) */}
          {policy.requiresAck && !isAdmin && !ackedByMe && (
            <div className="mt-6 flex justify-center">
              <Button size="lg" onClick={() => acknowledgePolicy(policy.id, CURRENT_USER.id)}><Check className="size-4" />{t("I have read & accept this policy", "قرأت وأوافق على هذه السياسة")}</Button>
            </div>
          )}

          <div className="mt-10 rounded-xl border border-dashed border-border p-4 text-xs text-muted-foreground">
            {t(`Controlled document ${policy.number} · ${policy.version}. Printed copies are uncontrolled — always refer to the portal for the current approved version.`, `وثيقة مضبوطة ${policy.number} · ${policy.version}. النسخ المطبوعة غير مضبوطة — ارجع دائمًا إلى البوابة للإصدار المعتمد الحالي.`)}
          </div>
        </div>

        {/* details sidebar */}
        <aside className="@4xl:block hidden">
          <div className="sticky top-20 space-y-4">
            <Card className="p-5">
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">{t("Document details", "تفاصيل الوثيقة")}</div>
              <dl className="space-y-3 text-sm">
                <div className="flex items-center gap-2.5"><Hash className="size-4 shrink-0 text-primary" /><dt className="w-24 shrink-0 text-muted-foreground">{t("Number", "الرقم")}</dt><dd className="min-w-0 flex-1 truncate font-mono text-[13px] font-medium">{policy.number}</dd></div>
                <div className="flex items-start gap-2.5"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" /><dt className="w-24 shrink-0 text-muted-foreground">{t("Categories", "الفئات")}</dt><dd className="flex min-w-0 flex-1 flex-wrap gap-1">{(policy.categories ?? []).map((c) => <CategoryBadge key={c} label={isAr ? policyCatAr(c) : c} color={policyCatColor(c)} />)}</dd></div>
                <div className="flex items-center gap-2.5"><FileText className="size-4 shrink-0 text-primary" /><dt className="w-24 shrink-0 text-muted-foreground">{t("Version", "الإصدار")}</dt><dd className="min-w-0 flex-1 truncate font-medium">{policy.version}</dd></div>
                <div className="flex items-center gap-2.5"><CalendarDays className="size-4 shrink-0 text-primary" /><dt className="w-24 shrink-0 text-muted-foreground">{t("Effective", "سارية من")}</dt><dd className="min-w-0 flex-1 truncate font-medium">{isAr ? policy.effectiveAr : policy.effective}</dd></div>
                <div className="flex items-start gap-2.5"><Users className="mt-0.5 size-4 shrink-0 text-primary" /><dt className="w-24 shrink-0 text-muted-foreground">{t("Applies to", "تُطبّق على")}</dt><dd className="min-w-0 flex-1 font-medium">{deptLabel}<div className="mt-0.5 text-xs font-normal text-muted-foreground">{affected.toLocaleString()} {t("employees", "موظف")}</div></dd></div>
              </dl>
            </Card>

            {/* acknowledgement stats (admin) */}
            {policy.requiresAck && isAdmin && (
              <Card className="p-5">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">{t("Acknowledgement", "الإقرار")}</div>
                <div className="flex items-end justify-between">
                  <div className="metal-text font-heading text-[1.8rem] font-semibold leading-none tabular-nums">{ackPct}%</div>
                  <div className="text-xs text-muted-foreground">{acked.toLocaleString()} {t("of", "من")} {affected.toLocaleString()}</div>
                </div>
                <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${ackPct}%` }} /></div>
                <p className="mt-2 text-xs text-muted-foreground">{(affected - acked).toLocaleString()} {t("employees still to acknowledge", "موظف لم يُقرّوا بعد")}</p>
              </Card>
            )}

            <Card className="p-5">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">{t("Actions", "إجراءات")}</div>
              <div className="space-y-2">
                {isAdmin && <Button variant="outline" className="w-full" onClick={() => navigate(`/policies/edit/${policy.id}`)}>{t("Edit policy", "تحرير السياسة")}</Button>}
                <Button className="w-full"><Download className="size-4" />{t("Download PDF", "تحميل PDF")}</Button>
                <Button variant="outline" className="w-full" onClick={() => navigate("/policies")}>{t("All policies", "كل السياسات")}</Button>
              </div>
            </Card>
          </div>
        </aside>
      </div>
    </main>
  )
}
