import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Button, Card, Input, Textarea } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import { AlertTriangle, ArrowLeft, CalendarPlus, Check, HeartPulse, Info, Moon, Plane, User, Wallet, Users } from "lucide-react"

import { addLeaveRequest, type LeaveTypeId, newRequestId, remaining, teamAwayBetween, useLiveLeaveTypes } from "../data/mock/leave"

const TYPE_ICON: Record<LeaveTypeId, React.ComponentType<{ className?: string }>> = {
  annual: Plane, sick: HeartPulse, personal: User, hajj: Moon, unpaid: Wallet,
}

/** Working week is Sunday–Thursday, so Fri/Sat don't consume leave days. */
function workingDaysBetween(from: string, to: string): number {
  if (!from || !to) return 0
  const a = new Date(from), b = new Date(to)
  if (Number.isNaN(+a) || Number.isNaN(+b) || b < a) return 0
  let n = 0
  for (const d = new Date(a); d <= b; d.setDate(d.getDate() + 1)) {
    const wd = d.getDay() // 5 Fri, 6 Sat
    if (wd !== 5 && wd !== 6) n++
  }
  return n
}
const pretty = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""
/** Arabic-Indic numerals + Arabic month names, matching the seeded requests. */
const prettyAr = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString("ar-EG", { month: "long", day: "numeric" }) : ""

export default function LeaveRequestPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()

  const [type, setType] = React.useState<LeaveTypeId>("annual")
  const [from, setFrom] = React.useState("")
  const [to, setTo] = React.useState("")
  const [halfDay, setHalfDay] = React.useState(false)
  const [reason, setReason] = React.useState("")
  const [contact, setContact] = React.useState("")

  const leaveTypes = useLiveLeaveTypes()
  const selected = leaveTypes.find((x) => x.id === type)!
  const days = halfDay ? 0.5 : workingDaysBetween(from, to)
  const left = remaining(selected)
  const overBalance = days > left && type !== "unpaid"
  const canSubmit = !!from && !!to && days > 0 && !overBalance

  // only warn about colleagues whose leave genuinely overlaps the chosen window
  const clashes = teamAwayBetween(from, to)

  const submit = () => {
    if (!canSubmit) return
    addLeaveRequest({
      id: newRequestId(), type,
      from: pretty(from), fromAr: prettyAr(from),
      to: pretty(to), toAr: prettyAr(to),
      days, submitted: "Just now", submittedAr: "الآن",
      status: "Pending", approver: "Ahmed Mohammed", approverAr: "أحمد محمد",
      reason: reason.trim() || undefined, reasonAr: reason.trim() || undefined,
    })
    navigate("/leave")
  }

  const label = (s: string) => <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{s}</label>

  return (
    <main className="@container mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => navigate("/leave")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />{t("Back to leave", "العودة إلى الإجازات")}
        </button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/leave")}>{t("Cancel", "إلغاء")}</Button>
          <Button disabled={!canSubmit} onClick={submit}><Check className="size-4" />{t("Submit request", "إرسال الطلب")}</Button>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-2 text-primary">
        <CalendarPlus className="size-4" />
        <span className="text-xs font-semibold uppercase tracking-[0.14em]">{t("New leave request", "طلب إجازة جديد")}</span>
      </div>

      <Card className="space-y-5 p-6 sm:p-8">
        {/* type */}
        <div>
          {label(t("Leave type", "نوع الإجازة"))}
          <div className="grid gap-2 @xl:grid-cols-2">
            {leaveTypes.map((x) => {
              const on = type === x.id
              const Icon = TYPE_ICON[x.id]
              return (
                <button key={x.id} type="button" onClick={() => setType(x.id)} aria-pressed={on}
                  className={cn("flex items-center gap-2.5 rounded-xl border p-3 text-start transition-colors", on ? "ring-1" : "border-border hover:border-primary/50")}
                  style={on ? { backgroundColor: `${x.color}14`, borderColor: `${x.color}66` } : undefined}>
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg" style={{ backgroundColor: `${x.color}1e`, color: x.color }}><Icon className="size-4" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold" style={on ? { color: x.color } : undefined}>{isAr ? x.nameAr : x.name}</span>
                    <span className="block text-[11px] text-muted-foreground">{remaining(x)} {t("days available", "يوم متاح")}</span>
                  </span>
                  {on && <Check className="size-4 shrink-0" style={{ color: x.color }} />}
                </button>
              )
            })}
          </div>
        </div>

        {/* dates */}
        <div className="grid gap-4 @xl:grid-cols-2">
          <div>{label(t("From", "من"))}<Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-11" /></div>
          <div>{label(t("To", "إلى"))}<Input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className="h-11" /></div>
        </div>

        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={halfDay} onChange={(e) => setHalfDay(e.target.checked)} className="size-4 accent-[var(--primary)]" />
          {t("Half day", "نصف يوم")}
        </label>

        {/* live calculation */}
        {(from && to) && (
          <div className={cn("flex flex-wrap items-center gap-2 rounded-xl border p-3 text-sm",
            overBalance ? "border-rose-500/30 bg-rose-500/[0.06]" : "border-primary/30 bg-primary/[0.05]")}>
            {overBalance
              ? <><AlertTriangle className="size-4 shrink-0 text-rose-500" />{t(`This request is ${days} days but only ${left} are available.`, `الطلب ${days} يوم بينما المتاح ${left} فقط.`)}</>
              : <><Info className="size-4 shrink-0 text-primary" />{t(`${days} working day${days === 1 ? "" : "s"} — Fri/Sat and public holidays are not deducted. Balance after approval: ${left - days}.`, `${days} يوم عمل — لا تُحتسب الجمعة/السبت والعطل الرسمية. الرصيد بعد الموافقة: ${left - days}.`)}</>}
          </div>
        )}

        {clashes.length > 0 && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-3 text-sm">
            <span className="inline-flex items-center gap-2"><Users className="size-4 shrink-0 text-amber-500" />
              {t(clashes.length === 1 ? "Heads up — a colleague is already away in this period:" : "Heads up — colleagues are already away in this period:", "تنبيه — زملاء في إجازة خلال هذه الفترة:")}
            </span>
            <ul className="mt-1.5 ps-6 text-[12.5px] text-muted-foreground">
              {clashes.map((c) => <li key={c.id}>{isAr ? c.nameAr : c.name} · {isAr ? c.rangeAr : c.range}</li>)}
            </ul>
          </div>
        )}

        <div>{label(t("Reason (optional)", "السبب (اختياري)"))}<Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t("Anything your manager should know?", "أي معلومة يحتاجها مديرك؟")} dir={isAr ? "rtl" : "ltr"} /></div>
        <div>{label(t("Contact while away (optional)", "وسيلة تواصل أثناء الإجازة (اختياري)"))}<Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder={t("Phone or email", "هاتف أو بريد")} className="h-11" /></div>

        <div className="rounded-xl border border-border bg-muted/20 p-3 text-[12px] text-muted-foreground">
          {t("Goes to Ahmed Mohammed (VP, Commercial) for approval. You'll be notified once it's actioned.", "يُرسل إلى أحمد محمد (نائب الرئيس، التجاري) للموافقة. سيصلك إشعار عند اتخاذ القرار.")}
        </div>
      </Card>
    </main>
  )
}
