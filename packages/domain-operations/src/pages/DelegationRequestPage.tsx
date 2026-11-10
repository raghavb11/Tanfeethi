/** New delegation request + current duty schedule — Figma 4124:9654.
 *  Route: /operations/delegation/new */
import * as React from "react"
import { cn } from "@reach/shared-core"
import { CalendarDays, CalendarX2, UserRound, UserRoundPlus, Wifi } from "lucide-react"

import { currentUser, delegates, type ScheduleEntry } from "../data/operations"
import { addScheduleEntry, useOps } from "../store"
import { CardHeading, DateBox, EmptyState, Field, GoldButton, Notice, Page, Panel, SelectBox } from "../components/ui"
import { useT } from "../components/helpers"

function dayMonth(iso: string, isAr: boolean) {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(isAr ? "ar-SA-u-nu-latn-ca-gregory" : "en-GB", {
    day: "numeric",
    month: "long",
  })
}

function ScheduleCard({ e }: { e: ScheduleEntry }) {
  const { t, l, isAr } = useT()
  const leave = e.kind === "leave"
  return (
    <article
      className={cn(
        "flex flex-col gap-4 rounded-[10px] border p-4",
        // Sampled from 4124:9654 (dark): green #156b47 / #11281e, purple #6d627f / #322e38.
        leave ? "border-[#156b47] bg-[#11281e]" : "border-[#6d627f] bg-[#322e38]",
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "inline-flex size-[30px] shrink-0 items-center justify-center rounded-[8px]",
            leave ? "bg-[#156b47] text-foreground" : "bg-[#6d627f] text-foreground",
          )}
        >
          {leave ? <UserRound className="size-[15px]" strokeWidth={2} /> : <Wifi className="size-[15px]" strokeWidth={2} />}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-[14.5px] leading-[21.75px]">{l(e.employee)}</span>
            {e.pending && (
              <span className="shrink-0 rounded-full bg-warning-fill px-2 py-0.5 text-[11px] text-warning">
                {t("Pending approval", "بانتظار الاعتماد")}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-[12.5px] leading-5 text-muted-foreground">
            <span>{leave ? t("Leave", "إجازة") : t("Remote work", "دوام عن بعد")}</span>
            <span>
              {dayMonth(e.from, isAr)} {t("to", "إلى")} {dayMonth(e.to, isAr)}
            </span>
          </div>
        </div>
      </div>
      {e.substitute && (
        <>
          <div aria-hidden className="h-px bg-gradient-to-r from-transparent via-success/15 to-transparent" />
          <div className="flex flex-col gap-1">
            <span className="text-[14.5px] leading-[21.75px]">
              {t("Substitute employee", "الموظف البديل")}: {l(e.substitute)}
            </span>
            {e.email && (
              <span className="text-[12.5px] leading-5 text-muted-foreground">
                {t("Email", "البريد الإلكتروني")}: <span dir="ltr">{e.email}</span>
              </span>
            )}
          </div>
        </>
      )}
    </article>
  )
}

export default function DelegationRequestPage() {
  const { t, l } = useT()
  const schedule = useOps((s) => s.schedule)
  const [start, setStart] = React.useState("")
  const [end, setEnd] = React.useState("")
  const [delegate, setDelegate] = React.useState("")
  const [tried, setTried] = React.useState(false)
  const [sent, setSent] = React.useState(false)

  const endBeforeStart = !!start && !!end && end < start
  const valid = !!start && !!end && !!delegate && !endBeforeStart

  const submit = () => {
    setTried(true)
    setSent(false)
    if (!valid) return
    const d = delegates.find((x) => x.id === delegate)
    addScheduleEntry({
      id: `s${Date.now()}`,
      employee: currentUser.name,
      kind: "leave",
      from: start,
      to: end,
      substitute: d?.name,
      email: d?.email,
      pending: true,
    })
    setStart("")
    setEnd("")
    setDelegate("")
    setTried(false)
    setSent(true)
  }

  return (
    <Page>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <Panel className="flex-1">
          <CardHeading icon={UserRoundPlus} title={t("New delegation request", "طلب إنابة جديد")} />
          <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label={t("Delegation start date", "تاريخ بداية الإنابة")} htmlFor="dl-start" error={tried && !start ? t("Required", "مطلوب") : undefined}>
              <DateBox id="dl-start" value={start} onChange={setStart} placeholder={t("Date", "تاريخ")} invalid={tried && !start} />
            </Field>
            <Field
              label={t("Delegation end date", "تاريخ انتهاء الإنابة")}
              htmlFor="dl-end"
              error={
                tried && !end
                  ? t("Required", "مطلوب")
                  : endBeforeStart
                    ? t("Must be after the start date", "يجب أن يكون بعد تاريخ البداية")
                    : undefined
              }
            >
              <DateBox id="dl-end" value={end} onChange={setEnd} min={start || undefined} placeholder={t("Date", "تاريخ")} invalid={(tried && !end) || endBeforeStart} />
            </Field>
            <Field label={t("Your delegate", "الموظف المناب عنك")} htmlFor="dl-emp" error={tried && !delegate ? t("Required", "مطلوب") : undefined}>
              <SelectBox
                id="dl-emp"
                value={delegate}
                onChange={setDelegate}
                placeholder={t("Employee", "الموظف")}
                invalid={tried && !delegate}
                options={delegates.map((d) => ({ value: d.id, label: l(d.name) }))}
              />
            </Field>
          </div>
          <div className="mt-4 flex flex-col items-start gap-3">
            <GoldButton onClick={submit}>{t("Submit delegation request", "إرسال طلب الإنابة")}</GoldButton>
            {sent && (
              <Notice tone="success">
                {t("Your delegation request was sent for approval.", "تم إرسال طلب الإنابة للاعتماد.")}
              </Notice>
            )}
          </div>
        </Panel>

        <Panel className="w-full shrink-0 sm:px-4 lg:w-[480px]">
          <CardHeading icon={CalendarDays} title={t("Current shift schedule", "جدول المناوبات الحالي")} />
          <div className="mt-[18px] flex flex-col gap-4">
            {schedule.length === 0 ? (
              <EmptyState icon={CalendarX2} title={t("No absences scheduled", "لا توجد غيابات مجدولة")} />
            ) : (
              schedule.map((e) => <ScheduleCard key={e.id} e={e} />)
            )}
          </div>
        </Panel>
      </div>
    </Page>
  )
}
