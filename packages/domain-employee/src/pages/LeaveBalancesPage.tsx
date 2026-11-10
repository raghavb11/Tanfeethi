import * as React from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  AlertTriangle, CalendarDays, CheckCircle2, Clock, Hourglass, Plane, Plus, Umbrella, Users, X,
} from "lucide-react"

import {
  cancelLeaveRequest, HOLIDAYS, type LeaveType, leaveTypeById, remaining,
  type RequestStatus, TEAM_AWAY, useLeaveRequests, useLiveLeaveTypes,
} from "../data/mock/leave"
import { Chip, Empty, GoldButton, IconBadge, Initials, Page, SectionCard, Tile, type Tone } from "../components/wijha"

type Tab = "balances" | "requests" | "calendar"

const STATUS_TONE: Record<RequestStatus, Tone> = { Approved: "success", Pending: "neutral", Rejected: "error", Cancelled: "neutral" }
const STATUS_AR: Record<RequestStatus, string> = { Approved: "معتمدة", Pending: "قيد المراجعة", Rejected: "مرفوضة", Cancelled: "ملغاة" }

/** Ring showing remaining vs entitled for one leave type (colour is the type's data colour). */
function BalanceRing({ type, isAr }: { type: LeaveType; isAr: boolean }) {
  const left = remaining(type)
  const pct = type.entitled ? Math.max(0, Math.min(100, (left / type.entitled) * 100)) : 0
  const C = 2 * Math.PI * 15.5
  return (
    <div className="relative grid size-[74px] shrink-0 place-items-center">
      <svg viewBox="0 0 36 36" className="size-[74px] -rotate-90">
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--secondary)" strokeWidth="3.5" />
        <motion.circle cx="18" cy="18" r="15.5" fill="none" stroke={type.color} strokeWidth="3.5" strokeLinecap="round"
          strokeDasharray={C} initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - pct / 100) }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} />
      </svg>
      <div className="absolute text-center">
        <div className="text-[17px] font-semibold tabular-nums leading-none">{left}</div>
        <div className="mt-0.5 text-[10px] text-muted-foreground">{isAr ? "يوم" : "days"}</div>
      </div>
    </div>
  )
}

export default function LeaveBalancesPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const requests = useLeaveRequests()
  const [tab, setTab] = React.useState<Tab>("balances")

  const types = useLiveLeaveTypes()
  const annual = types[0]
  const totals = {
    available: types.reduce((s, x) => s + remaining(x), 0),
    used: types.reduce((s, x) => s + x.used, 0),
    pending: types.reduce((s, x) => s + x.pending, 0),
    expiring: annual.expiring ?? 0,
  }
  const upcoming = requests.filter((r) => r.status === "Approved").slice(0, 2)
  const daysWord = (n: number) => t(n === 1 ? "day" : "days", n === 1 ? "يوم" : n <= 10 ? "أيام" : "يوم")

  const TABS: { id: Tab; label: string; ar: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "balances", label: "Balances", ar: "الأرصدة", icon: Umbrella },
    { id: "requests", label: "My requests", ar: "طلباتي", icon: Clock },
    { id: "calendar", label: "Holidays & team", ar: "العطل والفريق", icon: CalendarDays },
  ]
  const th = "px-4 py-3 text-start text-[12.5px] font-medium text-muted-foreground"

  return (
    <Page className="@container space-y-6">
      {/* toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex flex-wrap rounded-lg bg-secondary p-1">
          {TABS.map((tb) => (
            <button key={tb.id} type="button" onClick={() => setTab(tb.id)} aria-pressed={tab === tb.id}
              className={cn("inline-flex h-8 items-center gap-1.5 rounded-md px-3.5 text-[13px] font-medium transition-colors",
                tab === tb.id ? "bg-soft-accent text-primary" : "text-muted-foreground hover:text-foreground")}>
              <tb.icon className="size-4" />{isAr ? tb.ar : tb.label}
            </button>
          ))}
        </div>
        <GoldButton size="sm" onClick={() => navigate("/leave/request")}>
          <Plus className="size-4" />{t("Request leave", "طلب إجازة")}
        </GoldButton>
      </div>

      {/* totals */}
      <div className="grid grid-cols-2 gap-3 @3xl:grid-cols-4">
        <Total icon={Plane} value={totals.available} label={t("Days available", "أيام متاحة")} />
        <Total icon={CheckCircle2} value={totals.used} label={t("Days taken", "أيام مستخدمة")} />
        <Total icon={Hourglass} value={totals.pending} label={t("Awaiting approval", "بانتظار الموافقة")} />
        <Total icon={AlertTriangle} value={totals.expiring} label={t("Expiring Dec 31", "تنتهي 31 ديسمبر")} />
      </div>

      {/* ── BALANCES ── */}
      {tab === "balances" && (
        <>
          {totals.expiring > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-[10px] bg-warning-fill p-3 text-[13px] ring-1 ring-inset ring-warning/30">
              <AlertTriangle className="size-4 shrink-0 text-warning" />
              <span>{t(`${totals.expiring} annual leave days expire on 31 December if unused.`, `${totals.expiring} أيام من الإجازة السنوية تنتهي في 31 ديسمبر إن لم تُستخدم.`)}</span>
              <button type="button" onClick={() => navigate("/leave/request")} className="ms-auto text-[12.5px] font-medium text-primary hover:underline">{t("Plan time off →", "خطط لإجازتك ←")}</button>
            </div>
          )}

          <SectionCard icon={Umbrella} title={t("My balance", "رصيدي")}>
            <div className="grid gap-4 @2xl:grid-cols-2">
              {types.map((x) => {
                const left = remaining(x)
                const usedPct = x.entitled ? (x.used / x.entitled) * 100 : 0
                const pendPct = x.entitled ? (x.pending / x.entitled) * 100 : 0
                return (
                  <Tile key={x.id} className="flex items-center gap-4">
                    <BalanceRing type={x} isAr={isAr} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="size-2 rounded-full" style={{ backgroundColor: x.color }} />
                        <span className="text-[14.5px] font-medium">{isAr ? x.nameAr : x.name}</span>
                        {x.expiring ? <Chip tone="warning">{x.expiring} {t("expiring", "تنتهي")}</Chip> : null}
                      </div>
                      <p className="mt-0.5 text-[12.5px] text-muted-foreground">{isAr ? x.accrualAr : x.accrual}</p>
                      {/* used / pending / remaining bar */}
                      <div className="mt-2.5 flex h-1.5 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full" style={{ width: `${usedPct}%`, backgroundColor: x.color }} />
                        <div className="h-full opacity-40" style={{ width: `${pendPct}%`, backgroundColor: x.color }} />
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5 text-[12px] text-muted-foreground">
                        <span><span className="font-semibold text-foreground">{left}</span> {t("left", "متبقٍ")}</span>
                        <span><span className="font-semibold text-foreground">{x.used}</span> {t("taken", "مستخدمة")}</span>
                        {x.pending > 0 && <span><span className="font-semibold text-foreground">{x.pending}</span> {t("pending", "معلقة")}</span>}
                        <span className="ms-auto">{t("of", "من")} {x.entitled}</span>
                      </div>
                    </div>
                  </Tile>
                )
              })}
            </div>
          </SectionCard>

          <SectionCard icon={Plane} title={t("Upcoming time off", "إجازاتك القادمة")}>
            {upcoming.length === 0 ? (
              <Empty icon={Plane} title={t("No approved time off yet", "لا توجد إجازات معتمدة بعد")}
                hint={t("Approved requests appear here.", "تظهر الطلبات المعتمدة هنا.")} />
            ) : (
              <div className="grid gap-3 @2xl:grid-cols-2">
                {upcoming.map((r) => {
                  const type = leaveTypeById(r.type)
                  return (
                    <Tile key={r.id} className="flex items-center gap-3">
                      <IconBadge icon={Plane} />
                      <div className="min-w-0 flex-1">
                        <div className="text-[14.5px] font-medium">{isAr ? r.fromAr : r.from} – {isAr ? r.toAr : r.to}</div>
                        <div className="text-[12.5px] text-muted-foreground">{isAr ? type?.nameAr : type?.name} · {r.days} {daysWord(r.days)}</div>
                      </div>
                      <Chip tone={STATUS_TONE[r.status]}>{isAr ? STATUS_AR[r.status] : r.status}</Chip>
                    </Tile>
                  )
                })}
              </div>
            )}
          </SectionCard>
        </>
      )}

      {/* ── REQUESTS ── */}
      {tab === "requests" && (
        <SectionCard icon={Clock} title={t("My requests", "طلباتي")} bodyClassName="-mx-4 sm:-mx-6">
          {requests.length === 0 ? (
            <Empty icon={Clock} title={t("No leave requests yet.", "لا توجد طلبات إجازة بعد.")} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-[13px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className={th}>{t("Type", "النوع")}</th>
                    <th className={th}>{t("Dates", "التواريخ")}</th>
                    <th className={cn(th, "text-center")}>{t("Days", "الأيام")}</th>
                    <th className={th}>{t("Submitted", "تاريخ التقديم")}</th>
                    <th className={th}>{t("Approver", "المعتمد")}</th>
                    <th className={th}>{t("Status", "الحالة")}</th>
                    <th className={cn(th, "text-end")}>{t("Actions", "إجراءات")}</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => {
                    const type = leaveTypeById(r.type)
                    return (
                      <tr key={r.id} className="border-b border-border transition-colors last:border-0 hover:bg-soft-accent/40">
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-2">
                            <span className="size-2 rounded-full" style={{ backgroundColor: type?.color }} />
                            <span className="font-medium">{isAr ? type?.nameAr : type?.name}</span>
                          </span>
                          {r.reason && <div className="mt-0.5 text-[12px] text-muted-foreground">{isAr ? r.reasonAr : r.reason}</div>}
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground">{isAr ? r.fromAr : r.from} – {isAr ? r.toAr : r.to}</td>
                        <td className="px-4 py-3.5 text-center tabular-nums">{r.days}</td>
                        <td className="px-4 py-3.5 text-muted-foreground">{isAr ? r.submittedAr : r.submitted}</td>
                        <td className="px-4 py-3.5 text-muted-foreground">{isAr ? r.approverAr : r.approver}</td>
                        <td className="px-4 py-3.5"><Chip tone={STATUS_TONE[r.status]}>{isAr ? STATUS_AR[r.status] : r.status}</Chip></td>
                        <td className="px-4 py-3.5">
                          <div className="flex justify-end">
                            {r.status === "Pending"
                              ? (
                                <button type="button" onClick={() => cancelLeaveRequest(r.id)}
                                  className="inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-[12.5px] font-medium text-error transition-colors hover:bg-error-fill">
                                  <X className="size-3.5" />{t("Cancel", "إلغاء")}
                                </button>
                              )
                              : <span className="text-[12px] text-muted-foreground/50">—</span>}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      )}

      {/* ── HOLIDAYS & TEAM ── */}
      {tab === "calendar" && (
        <div className="grid gap-6 @3xl:grid-cols-2">
          <SectionCard icon={CalendarDays} title={t("Public holidays", "العطل الرسمية")}>
            {HOLIDAYS.length === 0 ? (
              <Empty icon={CalendarDays} title={t("No upcoming holidays", "لا توجد عطل قادمة")} />
            ) : (
              <div className="space-y-3">
                {HOLIDAYS.map((h) => (
                  <Tile key={h.id} className="flex items-center gap-3">
                    <IconBadge icon={CalendarDays} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[14.5px] font-medium">{isAr ? h.nameAr : h.name}</div>
                      <div className="text-[12.5px] text-muted-foreground">{isAr ? h.dateAr : h.date}</div>
                    </div>
                    <Chip>{h.days} {daysWord(h.days)}</Chip>
                  </Tile>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard icon={Users} title={t("Who's away", "من في إجازة")}>
            <p className="-mt-1 mb-3 text-[12.5px] text-muted-foreground">{t("Check team cover before booking your dates.", "تحقق من تغطية الفريق قبل حجز إجازتك.")}</p>
            {TEAM_AWAY.length === 0 ? (
              <Empty icon={Users} title={t("Everyone's in", "الفريق متواجد بالكامل")} />
            ) : (
              <div className="space-y-1">
                {TEAM_AWAY.map((p) => {
                  const type = leaveTypeById(p.type)
                  return (
                    <div key={p.id} className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-secondary/50">
                      <Initials text={p.initials} className="size-9" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[14px]">{isAr ? p.nameAr : p.name}</div>
                        <div className="truncate text-[12px] text-muted-foreground">{isAr ? type?.nameAr : type?.name}</div>
                      </div>
                      <span className="shrink-0 text-[12.5px] text-muted-foreground">{isAr ? p.rangeAr : p.range}</span>
                    </div>
                  )
                })}
              </div>
            )}
            <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-3 text-[12px] text-muted-foreground">
              <Users className="size-3.5" />{TEAM_AWAY.length} {t("colleagues away in the next two weeks", "زملاء في إجازة خلال أسبوعين")}
            </div>
          </SectionCard>
        </div>
      )}
    </Page>
  )
}

function Total({ icon, value, label }: { icon: React.ComponentType<{ className?: string }>; value: number; label: string }) {
  return (
    <div className="panel flex min-w-0 items-center gap-3 rounded-xl p-4">
      <IconBadge icon={icon} className="size-10" />
      <div className="min-w-0">
        <div className="text-[22px] font-semibold tabular-nums leading-none">{value}</div>
        <div className="mt-1 truncate text-[12.5px] text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}
