import * as React from "react"
import { useNavigate } from "react-router-dom"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import { SearchableSelect } from "@reach/shared-ui"
import { AlertTriangle, CalendarDays, ChevronDown, Info, Paperclip, Umbrella, Users, X } from "lucide-react"

import {
  addLeaveRequest, type LeaveTypeId, NEEDS_ATTACHMENT, newRequestId, remaining, teamAwayBetween, useLiveLeaveTypes,
} from "../data/mock/leave"
import { emp } from "../data/mock/center"
import { childrenOf, ME_ID, personById } from "../data/mock/org"
import { FieldLabel, fieldClass, GoldButton, OutlineButton, Page, SectionCard } from "../components/wijha"
import { LeaveDistribution, PendingLeaveList } from "../components/LeaveWidgets"

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
/** Arabic month names with Western digits, matching the seeded requests. */
const prettyAr = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString("ar-EG-u-nu-latn", { month: "long", day: "numeric" }) : ""

/** Leave request — Figma 4871:16776 (web) / 4871:17529 (phone). */
export default function LeaveRequestPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()

  const [type, setType] = React.useState<LeaveTypeId | "">("")
  const [delegateId, setDelegateId] = React.useState("")
  const [from, setFrom] = React.useState("")
  const [to, setTo] = React.useState("")
  const [files, setFiles] = React.useState<File[]>([])
  const [more, setMore] = React.useState(false)
  const [halfDay, setHalfDay] = React.useState(false)
  const [reason, setReason] = React.useState("")
  const [contact, setContact] = React.useState("")
  // the button stays live as drawn; a submit with gaps shows what is missing
  const [tried, setTried] = React.useState(false)
  const fileRef = React.useRef<HTMLInputElement>(null)

  const leaveTypes = useLiveLeaveTypes()
  const selected = leaveTypes.find((x) => x.id === type)
  const me = personById(ME_ID)!
  // colleagues who can cover: teammates under the same manager, then direct reports
  const delegates = [...(me.managerId ? childrenOf(me.managerId).filter((p) => p.id !== ME_ID) : []), ...childrenOf(ME_ID)]
  const delegate = delegates.find((p) => p.id === delegateId)

  const days = halfDay ? 0.5 : workingDaysBetween(from, to)
  const left = selected ? remaining(selected) : 0
  const overBalance = !!selected && days > left && type !== "unpaid"
  const needsFiles = !!type && NEEDS_ATTACHMENT.includes(type)
  const canSubmit = !!type && !!delegateId && !!from && !!to && days > 0 && !overBalance && (!needsFiles || files.length > 0)
  const clashes = teamAwayBetween(from, to)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || !type) { setTried(true); return }
    addLeaveRequest({
      id: newRequestId(), type,
      from: pretty(from), fromAr: prettyAr(from),
      to: pretty(to), toAr: prettyAr(to),
      days, submitted: "Just now", submittedAr: "الآن",
      status: "Pending", approver: emp.manager, approverAr: emp.managerAr,
      reason: reason.trim() || undefined, reasonAr: reason.trim() || undefined,
      delegate: delegate?.name, delegateAr: delegate?.nameAr,
      attachments: files.map((f) => f.name),
    })
    navigate("/leave")
  }

  // Figma 4871:16776: 17px label line + 7px gap, 36px borderless page-fill inputs, 17px between rows
  const lbl = "mb-[7px] leading-[17px]"
  const fc = cn(fieldClass, "rounded-[8px] border-transparent")
  const selectWrap = (child: React.ReactNode) => (
    <div className="relative">
      {child}
      <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-icon" />
    </div>
  )

  return (
    <Page>
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,729fr)_minmax(0,480fr)]">
        {/* ── form ── */}
        <SectionCard icon={Umbrella} title={t("Request leave", "طلب إجازة")} className="sm:px-4">
          <form onSubmit={submit} noValidate>
            <div className="grid gap-x-4 gap-y-[17px] sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="lv-type" required className={lbl}>{t("Leave type", "نوع الإجازة")}</FieldLabel>
                {selectWrap(
                  <select id="lv-type" value={type} onChange={(e) => setType(e.target.value as LeaveTypeId)} required
                    className={cn(fc, "appearance-none pe-9", !type && "text-muted-foreground", tried && !type && "border-error")}>
                    <option value="" disabled>{t("Choose from the list", "اختر من القائمة")}</option>
                    {leaveTypes.map((x) => (
                      <option key={x.id} value={x.id}>{isAr ? x.nameAr : x.name} — {remaining(x)} {t("days available", "يوم متاح")}</option>
                    ))}
                  </select>,
                )}
              </div>
              <div>
                <FieldLabel htmlFor="lv-delegate" required className={lbl}>{t("Covering colleague", "الموظف المناب عنك")}</FieldLabel>
                {/* People picker: searchable (owner rule — "keep the name DD searchable everywhere"); same closed field as the native select. */}
                <SearchableSelect
                  value={delegateId} onChange={setDelegateId} searchable isAr={isAr}
                  options={delegates.map((p) => ({
                    value: p.id, label: `${isAr ? p.nameAr : p.name} — ${isAr ? p.titleAr : p.title}`,
                    alt: `${isAr ? p.name : p.nameAr} ${isAr ? p.title : p.titleAr}`,
                  }))}
                  renderTrigger={({ triggerProps }) => (
                    <>
                      <button {...triggerProps} id="lv-delegate" aria-required
                        className={cn(fc, "flex items-center pe-9 text-start", !delegate && "text-muted-foreground", tried && !delegateId && "border-error")}>
                        <span className="min-w-0 flex-1 truncate">
                          {delegate ? `${isAr ? delegate.nameAr : delegate.name} — ${isAr ? delegate.titleAr : delegate.title}` : t("Choose from the list", "اختر من القائمة")}
                        </span>
                      </button>
                      <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-icon" />
                    </>
                  )}
                />
              </div>
              <div>
                <FieldLabel htmlFor="lv-from" required className={lbl}>{t("Leave start date", "تاريخ بداية الإجازة")}</FieldLabel>
                <DateField id="lv-from" value={from} onChange={setFrom} placeholder={t("Choose a date", "اختر من القائمة")} />
              </div>
              <div>
                <FieldLabel htmlFor="lv-to" required className={lbl}>{t("Leave end date", "تاريخ انتهاء الإجازة")}</FieldLabel>
                <DateField id="lv-to" value={to} min={from || undefined} onChange={setTo} placeholder={t("Choose a date", "اختر من القائمة")} />
              </div>
            </div>

            {/* attachments */}
            <div className="mt-[17px]">
              <FieldLabel required={needsFiles || !type} className={lbl}>{needsFiles || !type ? t("Attachments required", "المرفقات مطلوبة") : t("Attachments (optional)", "المرفقات (اختياري)")}</FieldLabel>
              <input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => { setFiles((f) => [...f, ...Array.from(e.target.files ?? [])]); e.target.value = "" }} />
              <GoldButton className="h-[34px] w-full rounded-[8px] text-[13px] sm:w-[208px]" onClick={() => fileRef.current?.click()}>
                {t("Upload Attachments", "رفع مرفقات")}
              </GoldButton>
              {files.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {files.map((f, i) => (
                    <li key={`${f.name}-${i}`} className="flex items-center gap-2 rounded-lg bg-background px-3 py-2 text-[12.5px] ring-1 ring-border">
                      <Paperclip className="size-3.5 shrink-0 text-primary" />
                      <span className="min-w-0 flex-1 truncate" dir="ltr">{f.name}</span>
                      <button type="button" onClick={() => setFiles((all) => all.filter((_, j) => j !== i))} className="grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-error" aria-label={t("Remove", "إزالة")}>
                        <X className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* live calculation + team cover check (shown once dates are chosen) */}
            {from && to && (
              <div className={cn("mt-5 flex items-start gap-2 rounded-lg p-3 text-[12.5px]", overBalance ? "bg-error-fill text-error" : "bg-soft-accent text-foreground")}>
                {overBalance ? <AlertTriangle className="mt-0.5 size-4 shrink-0" /> : <Info className="mt-0.5 size-4 shrink-0 text-primary" />}
                <span>
                  {overBalance
                    ? t(`This request is ${days} days but only ${left} are available.`, `الطلب ${days} يوم بينما المتاح ${left} فقط.`)
                    : selected
                      ? t(`${days} working day${days === 1 ? "" : "s"} — Fri/Sat and public holidays are not deducted. Balance after approval: ${left - days}.`, `${days} يوم عمل — لا تُحتسب الجمعة والسبت والعطل الرسمية. الرصيد بعد الموافقة: ${left - days}.`)
                      : t(`${days} working day${days === 1 ? "" : "s"} — choose a leave type to check your balance.`, `${days} يوم عمل — اختر نوع الإجازة للتحقق من رصيدك.`)}
                </span>
              </div>
            )}
            {clashes.length > 0 && (
              <div className="mt-3 rounded-lg bg-warning-fill p-3 text-[12.5px]">
                <span className="inline-flex items-center gap-2 text-warning"><Users className="size-4 shrink-0" />
                  {t(clashes.length === 1 ? "A colleague is already away in this period:" : "Colleagues are already away in this period:", "زملاء في إجازة خلال هذه الفترة:")}
                </span>
                <ul className="mt-1.5 list-disc ps-6 text-muted-foreground">
                  {clashes.map((c) => <li key={c.id}>{isAr ? c.nameAr : c.name} · {isAr ? c.rangeAr : c.range}</li>)}
                </ul>
              </div>
            )}

            {/* optional details kept from the earlier form — opened from the link beside the buttons */}
            {more && (
              <div className="mt-4 grid gap-4">
                <label className="inline-flex items-center gap-2 text-[13px]">
                  <input type="checkbox" checked={halfDay} onChange={(e) => setHalfDay(e.target.checked)} className="size-4 accent-[var(--primary)]" />
                  {t("Half day", "نصف يوم")}
                </label>
                <div>
                  <FieldLabel htmlFor="lv-reason">{t("Reason", "السبب")}</FieldLabel>
                  <textarea id="lv-reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)}
                    placeholder={t("Anything your manager should know?", "أي معلومة يحتاجها مديرك؟")}
                    className={cn(fieldClass, "h-auto py-2")} />
                </div>
                <div>
                  <FieldLabel htmlFor="lv-contact">{t("Contact while away", "وسيلة تواصل أثناء الإجازة")}</FieldLabel>
                  <input id="lv-contact" value={contact} onChange={(e) => setContact(e.target.value)} placeholder={t("Phone or email", "هاتف أو بريد")} className={fieldClass} />
                </div>
                <p className="text-[12px] text-muted-foreground">
                  {t(`Goes to ${emp.manager} (${emp.managerTitle}) for approval.`, `يُرسل إلى ${emp.managerAr} (${emp.managerTitleAr}) للموافقة.`)}
                </p>
              </div>
            )}

            {tried && !canSubmit && (
              <p className="mt-4 text-[12.5px] text-error" role="alert">
                {overBalance ? t("This request is longer than your balance.", "مدة الطلب أطول من رصيدك.")
                  : t("Complete the required fields marked *.", "أكمل الحقول المطلوبة المعلّمة بـ *.")}
              </p>
            )}
            <div className="mt-[25px] flex flex-col gap-4 sm:flex-row sm:items-center">
              <GoldButton type="submit" aria-disabled={!canSubmit} className="h-[34px] w-full rounded-[8px] text-[13px] sm:w-auto sm:min-w-[118px]">{t("Submit Request", "إرسال الطلب")}</GoldButton>
              <OutlineButton className="h-[34px] w-full rounded-[8px] text-[13px] sm:w-auto sm:min-w-[83px]" onClick={() => navigate(-1)}>{t("Cancel", "إلغاء")}</OutlineButton>
              <button type="button" onClick={() => setMore((m) => !m)} aria-expanded={more}
                className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-primary sm:ms-auto">
                <ChevronDown className={cn("size-3.5 transition-transform", more && "rotate-180")} />
                {t("More details (optional)", "تفاصيل إضافية (اختياري)")}
              </button>
            </div>
          </form>
        </SectionCard>

        {/* ── side: pending + balance ── */}
        <div className="min-w-0 space-y-6">
          <SectionCard icon={Umbrella} title={t("Leave requests under review", "طلبات الإجازات قيد المراجعة")}>
            <div className="mb-3 text-[12.5px] text-muted-foreground">{t("Requests under review", "طلبات قيد المراجعة")}</div>
            <PendingLeaveList columns={1} />
          </SectionCard>
          <SectionCard icon={Umbrella} title={t("My balance", "رصيدي")}>
            <div className="text-[12.5px] text-muted-foreground">{t("Leave breakdown", "توزيع الإجازات")}</div>
            <LeaveDistribution />
          </SectionCard>
        </div>
      </div>
    </Page>
  )
}

/** Date input drawn as the Figma picker field: placeholder text + calendar icon at the end. */
function DateField({ id, value, onChange, min, placeholder }: { id: string; value: string; onChange: (v: string) => void; min?: string; placeholder: string }) {
  return (
    <div className="relative">
      <input id={id} type="date" value={value} min={min} onChange={(e) => onChange(e.target.value)} required
        className={cn(fieldClass, "relative rounded-[8px] border-transparent pe-9 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:size-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0",
          !value && "text-transparent")} />
      {!value && <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-[13px] text-muted-foreground">{placeholder}</span>}
      <CalendarDays className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-icon" />
    </div>
  )
}
