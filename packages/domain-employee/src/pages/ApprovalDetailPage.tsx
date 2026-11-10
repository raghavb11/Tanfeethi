import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Textarea } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  Activity, AlertTriangle, ArrowLeft, Building2, CalendarClock, Check, CheckCircle2, Circle,
  ClipboardList, Clock, CornerUpLeft, FileSearch, FileText, Info, Paperclip, Quote, Receipt, Route,
  ShoppingCart, Timer, UserRound,
} from "lucide-react"

import {
  decideApproval, getApprovalById, getApprovalDetail, sar,
  useApprovals, type ApprovalKind,
} from "../data/mock/manager"
import {
  Chip, Empty, FieldLabel, GoldButton, IconBadge, Initials, OutlineButton, Page, SectionCard, Tile,
} from "../components/wijha"

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

  const backLink = (
    <button
      onClick={() => navigate("/manager")}
      className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />
      {t("Back to the dashboard", "العودة إلى لوحة المدير")}
    </button>
  )

  if (!a) {
    return (
      <Page className="mx-auto max-w-3xl">
        <SectionCard>
          <Empty
            icon={FileSearch}
            title={t("That request no longer exists.", "لم يعد هذا الطلب موجودًا.")}
            action={<OutlineButton className="mt-2" onClick={() => navigate("/manager")}>{t("Back to the dashboard", "العودة إلى لوحة المدير")}</OutlineButton>}
          />
        </SectionCard>
      </Page>
    )
  }

  const Icon = KIND_ICON[a.kind]
  const pending = a.state === "Pending"

  const approve = () => { decideApproval(a.id, "Approved"); navigate("/manager") }
  const send = () => { decideApproval(a.id, "Returned", comment.trim() || undefined); navigate("/manager") }

  const stateTone = a.state === "Approved" ? "success" : a.state === "Returned" ? "warning" : "neutral"

  return (
    <Page className="mx-auto max-w-6xl">
      <div className="mb-6">{backLink}</div>

      {/* ── header ── */}
      <section className="highlight-card hl-green mb-6 rounded-2xl px-6 py-6 md:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 gap-3">
            <IconBadge icon={Icon} className="size-11" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[22px] font-medium leading-tight">{isAr ? a.titleAr : a.title}</h2>
                <Chip><span dir="ltr">{a.ref}</span></Chip>
                <Chip tone={stateTone}>
                  {a.state === "Pending" ? t("Pending your decision", "بانتظار قرارك")
                    : a.state === "Approved" ? t("Approved", "معتمد")
                    : t("Returned", "معاد")}
                </Chip>
              </div>
              <p className="mt-1 text-[13px] text-muted-foreground">
                {isAr ? a.detailAr : a.detail}
                {a.amount !== undefined && <span className="ms-2 font-medium text-foreground">{sar(a.amount, isAr)}</span>}
              </p>
            </div>
          </div>

          {pending && (
            <div className="flex shrink-0 items-center gap-2">
              <OutlineButton onClick={() => { setConfirm(confirm === "return" ? null : "return"); setComment("") }}>
                <CornerUpLeft className="size-4" />{t("Return", "إعادة")}
              </OutlineButton>
              <GoldButton onClick={() => setConfirm(confirm === "approve" ? null : "approve")}>
                <Check className="size-4" />{t("Approve", "اعتماد")}
              </GoldButton>
            </div>
          )}
        </div>
      </section>

      {/* ── confirmation, before anything is decided ── */}
      {confirm === "approve" && (
        <Tile className="mb-6 bg-soft-accent ring-primary/30">
          <p className="text-[14px] font-medium">{t("Approve this request?", "اعتماد هذا الطلب؟")}</p>
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            {t(`${a.ref} moves to the next approver and ${isAr ? a.whoAr : a.who} is notified. This is recorded against your name.`,
               `سينتقل ${a.ref} إلى المعتمد التالي وسيتم إشعار ${a.whoAr}. سيُسجَّل القرار باسمك.`)}
          </p>
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <OutlineButton size="sm" onClick={() => setConfirm(null)}>{t("Cancel", "إلغاء")}</OutlineButton>
            <GoldButton size="sm" onClick={approve}><Check className="size-3.5" />{t("Yes, approve", "نعم، اعتمد")}</GoldButton>
          </div>
        </Tile>
      )}

      {confirm === "return" && (
        <Tile className="mb-6 bg-warning-fill ring-warning/30">
          <p className="mb-3 text-[14px] font-medium">{t("Return this request?", "إعادة هذا الطلب؟")}</p>
          <FieldLabel>{t("Why are you returning it?", "لماذا تعيد الطلب؟")}</FieldLabel>
          <Textarea
            rows={2} value={comment} onChange={(e) => setComment(e.target.value)}
            className="rounded-lg bg-background"
            placeholder={t("The team member sees this comment.", "سيرى الموظف هذه الملاحظة.")}
          />
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <OutlineButton size="sm" onClick={() => setConfirm(null)}>{t("Cancel", "إلغاء")}</OutlineButton>
            <GoldButton size="sm" onClick={send}>
              <CornerUpLeft className="size-3.5" />{t("Return with comment", "إعادة مع ملاحظة")}
            </GoldButton>
          </div>
        </Tile>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          {/* requester */}
          <SectionCard>
            <div className="flex flex-wrap items-center gap-3">
              <Initials text={a.initials} tone="accent" className="size-11" />
              <div className="min-w-0">
                <p className="text-[14.5px] font-medium">{isAr ? a.whoAr : a.who}</p>
                <p className="text-[12.5px] text-muted-foreground">
                  {d ? `${isAr ? d.whoTitleAr : d.whoTitle} · ${isAr ? d.deptAr : d.dept} · ${d.employeeNo}` : ""}
                </p>
              </div>
              <div className="ms-auto text-end text-[12px] text-muted-foreground">
                <p className="inline-flex items-center gap-1"><Clock className="size-3.5" />{isAr ? a.submittedAr : a.submitted}</p>
                {d && <p className="mt-0.5 tabular-nums">{isAr ? d.submittedOnAr : d.submittedOn}</p>}
              </div>
            </div>
          </SectionCard>

          {/* the request itself */}
          {d && (
            <SectionCard icon={ClipboardList} title={t("Request details", "تفاصيل الطلب")}>
              <dl className="grid gap-x-6 sm:grid-cols-2">
                {d.lines.map((l) => (
                  <div key={l.label} className="flex items-baseline justify-between gap-3 border-b border-border py-3">
                    <dt className="text-[12.5px] text-muted-foreground">{isAr ? l.labelAr : l.label}</dt>
                    <dd className="text-end text-[14px]">{isAr ? l.valueAr : l.value}</dd>
                  </div>
                ))}
              </dl>
            </SectionCard>
          )}

          {/* the employee's own words */}
          {d && (
            <SectionCard icon={Quote} title={t("Reason given", "السبب المذكور")}>
              <p className="text-[14px] leading-relaxed">{isAr ? d.reasonAr : d.reason}</p>
            </SectionCard>
          )}

          {/* attachments */}
          {d && (
            <SectionCard icon={Paperclip} title={t("Attachments", "المرفقات")}>
              {d.files.length === 0 ? (
                <p className="text-[12.5px] text-muted-foreground">{t("No attachments with this request.", "لا توجد مرفقات مع هذا الطلب.")}</p>
              ) : (
                <div className="space-y-2">
                  {d.files.map((f) => (
                    <Tile key={f.id} className="flex items-center gap-3 px-3 py-2.5">
                      <FileText className="size-4 shrink-0 text-primary" />
                      <span className="min-w-0 flex-1 truncate text-[13px]">{isAr ? f.nameAr : f.name}</span>
                      <span className="shrink-0 text-[12px] tabular-nums text-muted-foreground" dir="ltr">{f.size}</span>
                    </Tile>
                  ))}
                </div>
              )}
            </SectionCard>
          )}

          {/* trail */}
          {d && (
            <SectionCard icon={Activity} title={t("Activity", "السجل")}>
              <div className="space-y-3">
                {d.history.map((h) => (
                  <div key={h.id} className="flex gap-2.5">
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary/60" />
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium">{isAr ? h.labelAr : h.label}</p>
                      <p className="text-[12px] text-muted-foreground">
                        {isAr ? h.whoAr : h.who} · {isAr ? h.whenAr : h.when}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>

        {/* ── side rail: what to watch, and who signs next ── */}
        <div className="min-w-0 space-y-6">
          {d && d.flags.length > 0 && (
            <SectionCard icon={AlertTriangle} title={t("Before you decide", "قبل أن تقرر")}>
              <div className="space-y-2">
                {d.flags.map((f, i) => (
                  <div key={i} className={cn("flex gap-2 rounded-[10px] p-2.5", f.tone === "warn" ? "bg-warning-fill" : "bg-background ring-1 ring-border ring-inset")}>
                    {f.tone === "warn"
                      ? <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-warning" />
                      : <Info className="mt-0.5 size-3.5 shrink-0 text-icon" />}
                    <p className={cn("text-[12.5px] leading-snug", f.tone === "warn" ? "font-medium" : "text-muted-foreground")}>
                      {isAr ? f.textAr : f.text}
                    </p>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {d && (
            <SectionCard icon={Route} title={t("Approval route", "مسار الاعتماد")}>
              <div className="space-y-3">
                {d.chain.map((c, i) => (
                  <div key={i} className="flex gap-2.5">
                    {c.state === "done"
                      ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                      : c.state === "current"
                        ? <Circle className="mt-0.5 size-4 shrink-0 fill-primary/20 text-primary" />
                        : <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground/40" />}
                    <div className="min-w-0">
                      <p className={cn("text-[13px]", c.state === "current" ? "font-medium text-primary" : "")}>
                        {isAr ? c.whoAr : c.who}
                      </p>
                      <p className="text-[12px] text-muted-foreground">
                        {isAr ? c.roleAr : c.role}
                        {c.when ? ` · ${isAr ? c.whenAr : c.when}` : c.state === "current" ? ` · ${t("now", "الآن")}` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {d && (
            <SectionCard icon={UserRound} title={t("Requester", "مقدّم الطلب")}>
              <div className="space-y-2.5 text-[13px]">
                <p className="flex items-center gap-2"><UserRound className="size-3.5 text-icon" />{isAr ? d.whoTitleAr : d.whoTitle}</p>
                <p className="flex items-center gap-2"><Building2 className="size-3.5 text-icon" />{isAr ? d.deptAr : d.dept}</p>
                <p className="flex items-center gap-2 tabular-nums"><FileText className="size-3.5 text-icon" />{d.employeeNo}</p>
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </Page>
  )
}
