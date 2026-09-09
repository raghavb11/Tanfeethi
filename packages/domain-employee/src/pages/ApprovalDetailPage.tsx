import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Avatar, AvatarFallback, Badge, Button, Card, Textarea } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  AlertTriangle, ArrowLeft, Building2, CalendarClock, Check, CheckCircle2, Circle,
  Clock, CornerUpLeft, FileText, Info, Paperclip, Receipt, ShoppingCart, Timer, UserRound,
} from "lucide-react"

import {
  decideApproval, getApprovalById, getApprovalDetail, sar,
  useApprovals, type ApprovalKind,
} from "../data/mock/manager"

const KIND_ICON: Record<ApprovalKind, typeof FileText> = {
  leave: CalendarClock, expense: Receipt, overtime: Timer, letter: FileText, purchase: ShoppingCart,
}

/** The full request behind a row on the manager dashboard: what was asked for,
 *  what the approver should watch out for, who signs after them, and the trail. */
export default function ApprovalDetailPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const { id = "" } = useParams()

  // subscribe so an approve/return here re-renders the state chip
  useApprovals()
  const a = getApprovalById(id)
  const d = getApprovalDetail(id)

  /** Every decision is confirmed — an approval is hard to walk back. */
  const [confirm, setConfirm] = React.useState<"approve" | "return" | null>(null)
  const [comment, setComment] = React.useState("")

  if (!a) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6">
        <p className="text-sm text-muted-foreground">{t("That request no longer exists.", "لم يعد هذا الطلب موجودًا.")}</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/manager")}>
          {t("Back to the dashboard", "العودة إلى لوحة المدير")}
        </Button>
      </main>
    )
  }

  const Icon = KIND_ICON[a.kind]
  const pending = a.state === "Pending"

  const approve = () => { decideApproval(a.id, "Approved"); navigate("/manager") }
  const send = () => { decideApproval(a.id, "Returned", comment.trim() || undefined); navigate("/manager") }

  const stateChip =
    a.state === "Approved" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
    : a.state === "Returned" ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
    : "border-border bg-muted/40 text-muted-foreground"

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate("/manager")}
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />
        {t("Back to the dashboard", "العودة إلى لوحة المدير")}
      </button>

      {/* ── header ── */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <Icon className="size-5" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-xl font-bold tracking-tight sm:text-2xl">{isAr ? a.titleAr : a.title}</h1>
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11.5px] font-medium tabular-nums text-muted-foreground">{a.ref}</span>
              <Badge variant="outline" className={cn("text-[11px]", stateChip)}>
                {a.state === "Pending" ? t("Pending your decision", "بانتظار قرارك")
                  : a.state === "Approved" ? t("Approved", "معتمد")
                  : t("Returned", "معاد")}
              </Badge>
            </div>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {isAr ? a.detailAr : a.detail}
              {a.amount !== undefined && <span className="ms-2 font-semibold text-foreground">{sar(a.amount, isAr)}</span>}
            </p>
          </div>
        </div>

        {pending && (
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" onClick={() => { setConfirm(confirm === "return" ? null : "return"); setComment("") }}>
              <CornerUpLeft className="size-4" />{t("Return", "إعادة")}
            </Button>
            <Button onClick={() => setConfirm(confirm === "approve" ? null : "approve")}>
              <Check className="size-4" />{t("Approve", "اعتماد")}
            </Button>
          </div>
        )}
      </div>

      {/* ── confirmation, before anything is decided ── */}
      {confirm === "approve" && (
        <Card className="mb-5 border-primary/30 bg-primary/[0.04] p-4">
          <p className="text-[13px] font-semibold">{t("Approve this request?", "اعتماد هذا الطلب؟")}</p>
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            {t(`${a.ref} moves to the next approver and ${isAr ? a.whoAr : a.who} is notified. This is recorded against your name.`,
               `سينتقل ${a.ref} إلى المعتمد التالي وسيتم إشعار ${a.whoAr}. سيُسجَّل القرار باسمك.`)}
          </p>
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setConfirm(null)}>{t("Cancel", "إلغاء")}</Button>
            <Button size="sm" onClick={approve}><Check className="size-3.5" />{t("Yes, approve", "نعم، اعتمد")}</Button>
          </div>
        </Card>
      )}

      {confirm === "return" && (
        <Card className="mb-5 border-amber-500/30 bg-amber-500/[0.05] p-4">
          <p className="text-[13px] font-semibold">{t("Return this request?", "إعادة هذا الطلب؟")}</p>
          <label className="mb-1.5 mt-2 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {t("Why are you returning it?", "لماذا تعيد الطلب؟")}
          </label>
          <Textarea
            rows={2} value={comment} onChange={(e) => setComment(e.target.value)}
            placeholder={t("The team member sees this comment.", "سيرى الموظف هذه الملاحظة.")}
          />
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setConfirm(null)}>{t("Cancel", "إلغاء")}</Button>
            <Button size="sm" onClick={send}>
              <CornerUpLeft className="size-3.5" />{t("Return with comment", "إعادة مع ملاحظة")}
            </Button>
          </div>
        </Card>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0 space-y-5">
          {/* requester */}
          <Card className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <Avatar className="size-10 shrink-0">
                <AvatarFallback className="bg-primary/12 text-[13px] font-bold text-primary">{a.initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{isAr ? a.whoAr : a.who}</p>
                <p className="text-[11.5px] text-muted-foreground">
                  {d ? `${isAr ? d.whoTitleAr : d.whoTitle} · ${isAr ? d.deptAr : d.dept} · ${d.employeeNo}` : ""}
                </p>
              </div>
              <div className="ms-auto text-end text-[11.5px] text-muted-foreground">
                <p className="inline-flex items-center gap-1"><Clock className="size-3.5" />{isAr ? a.submittedAr : a.submitted}</p>
                {d && <p className="mt-0.5 tabular-nums">{isAr ? d.submittedOnAr : d.submittedOn}</p>}
              </div>
            </div>
          </Card>

          {/* the request itself */}
          {d && (
            <Card className="p-0">
              <div className="border-b border-border/60 px-4 py-3">
                <p className="text-[13px] font-semibold">{t("Request details", "تفاصيل الطلب")}</p>
              </div>
              <dl className="grid gap-x-6 gap-y-0 px-4 py-1 sm:grid-cols-2">
                {d.lines.map((l) => (
                  <div key={l.label} className="flex items-baseline justify-between gap-3 border-b border-border/40 py-2.5 last:border-0">
                    <dt className="text-[12px] text-muted-foreground">{isAr ? l.labelAr : l.label}</dt>
                    <dd className="text-end text-[12.5px] font-medium">{isAr ? l.valueAr : l.value}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          )}

          {/* the employee's own words */}
          {d && (
            <Card className="p-4">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t("Reason given", "السبب المذكور")}
              </p>
              <p className="text-[13px] leading-relaxed">{isAr ? d.reasonAr : d.reason}</p>
            </Card>
          )}

          {/* attachments */}
          {d && d.files.length > 0 && (
            <Card className="p-0">
              <div className="border-b border-border/60 px-4 py-3">
                <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold">
                  <Paperclip className="size-3.5" />{t("Attachments", "المرفقات")}
                </p>
              </div>
              <div className="divide-y divide-border/40">
                {d.files.map((f) => (
                  <div key={f.id} className="flex items-center gap-3 px-4 py-2.5">
                    <FileText className="size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate text-[12.5px]">{isAr ? f.nameAr : f.name}</span>
                    <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">{f.size}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* trail */}
          {d && (
            <Card className="p-0">
              <div className="border-b border-border/60 px-4 py-3">
                <p className="text-[13px] font-semibold">{t("Activity", "السجل")}</p>
              </div>
              <div className="space-y-3 px-4 py-3.5">
                {d.history.map((h) => (
                  <div key={h.id} className="flex gap-2.5">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-medium">{isAr ? h.labelAr : h.label}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {isAr ? h.whoAr : h.who} · {isAr ? h.whenAr : h.when}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* ── side rail: what to watch, and who signs next ── */}
        <div className="space-y-5">
          {d && d.flags.length > 0 && (
            <Card className="p-4">
              <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t("Before you decide", "قبل أن تقرر")}
              </p>
              <div className="space-y-2.5">
                {d.flags.map((f, i) => (
                  <div key={i} className="flex gap-2">
                    {f.tone === "warn"
                      ? <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
                      : <Info className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/70" />}
                    <p className={cn("text-[12px] leading-snug", f.tone === "warn" ? "font-medium" : "text-muted-foreground")}>
                      {isAr ? f.textAr : f.text}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {d && (
            <Card className="p-4">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t("Approval route", "مسار الاعتماد")}
              </p>
              <div className="space-y-3">
                {d.chain.map((c, i) => (
                  <div key={i} className="flex gap-2.5">
                    {c.state === "done"
                      ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                      : c.state === "current"
                        ? <Circle className="mt-0.5 size-4 shrink-0 fill-primary/20 text-primary" />
                        : <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground/30" />}
                    <div className="min-w-0">
                      <p className={cn("text-[12.5px]", c.state === "current" ? "font-semibold" : "font-medium")}>
                        {isAr ? c.whoAr : c.who}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {isAr ? c.roleAr : c.role}
                        {c.when ? ` · ${isAr ? c.whenAr : c.when}` : c.state === "current" ? ` · ${t("now", "الآن")}` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {d && (
            <Card className="p-4">
              <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t("Requester", "مقدّم الطلب")}
              </p>
              <div className="space-y-2 text-[12px]">
                <p className="flex items-center gap-2"><UserRound className="size-3.5 text-muted-foreground" />{isAr ? d.whoTitleAr : d.whoTitle}</p>
                <p className="flex items-center gap-2"><Building2 className="size-3.5 text-muted-foreground" />{isAr ? d.deptAr : d.dept}</p>
                <p className="flex items-center gap-2 tabular-nums"><FileText className="size-3.5 text-muted-foreground" />{d.employeeNo}</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
}
