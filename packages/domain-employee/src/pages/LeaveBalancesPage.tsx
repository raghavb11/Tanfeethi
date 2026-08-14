import * as React from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, Badge, Button, Card } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  AlertTriangle, CalendarDays, CalendarPlus, CheckCircle2, Clock, Hourglass, Plane, Users, X,
} from "lucide-react"

import {
  cancelLeaveRequest, HOLIDAYS, type LeaveType, leaveTypeById, remaining,
  type RequestStatus, TEAM_AWAY, useLeaveRequests, useLiveLeaveTypes,
} from "../data/mock/leave"

type Tab = "balances" | "requests" | "calendar"

const STATUS_STYLE: Record<RequestStatus, string> = {
  Approved: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Pending: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Rejected: "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400",
  Cancelled: "border-border bg-muted text-muted-foreground",
}
const STATUS_AR: Record<RequestStatus, string> = { Approved: "معتمدة", Pending: "قيد المراجعة", Rejected: "مرفوضة", Cancelled: "ملغاة" }

/** Ring showing remaining vs entitled for one leave type. */
function BalanceRing({ type, isAr }: { type: LeaveType; isAr: boolean }) {
  const left = remaining(type)
  const pct = type.entitled ? Math.max(0, Math.min(100, (left / type.entitled) * 100)) : 0
  const C = 2 * Math.PI * 15.5
  return (
    <div className="relative grid size-[74px] shrink-0 place-items-center">
      <svg viewBox="0 0 36 36" className="size-[74px] -rotate-90">
        <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-muted" strokeWidth="3.5" />
        <motion.circle cx="18" cy="18" r="15.5" fill="none" stroke={type.color} strokeWidth="3.5" strokeLinecap="round"
          strokeDasharray={C} initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - pct / 100) }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} />
      </svg>
      <div className="absolute text-center">
        <div className="text-[17px] font-bold tabular-nums leading-none">{left}</div>
        <div className="text-[8px] uppercase tracking-wider text-muted-foreground">{isAr ? "يوم" : "days"}</div>
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

  const TABS: { id: Tab; label: string; ar: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "balances", label: "Balances", ar: "الأرصدة", icon: Plane },
    { id: "requests", label: "My requests", ar: "طلباتي", icon: Clock },
    { id: "calendar", label: "Holidays & team", ar: "العطل والفريق", icon: CalendarDays },
  ]
  const th = "px-4 py-3 text-start text-[12px] font-medium text-muted-foreground"

  return (
    <main className="@container mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      {/* header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <Plane className="size-5" />
            <span className="text-xs font-semibold uppercase tracking-[0.14em]">{t("Leave", "الإجازات")}</span>
          </div>
          <h1 className="mt-2 font-heading text-[28px] font-bold leading-tight tracking-tight sm:text-[32px]">{t("Leave balances", "أرصدة الإجازات")}</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">{t("Your entitlements, requests and the team's cover — all in one place.", "استحقاقاتك وطلباتك وتغطية الفريق — في مكان واحد.")}</p>
        </div>
        <Button size="lg" className="shrink-0 gap-1.5" onClick={() => navigate("/leave/request")}>
          <CalendarPlus className="size-4" />{t("Request leave", "طلب إجازة")}
        </Button>
      </div>

      {/* totals */}
      <div className="mb-6 grid grid-cols-2 gap-3 @3xl:grid-cols-4">
        <Card className="flex items-center gap-3 p-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary"><Plane className="size-5" /></span>
          <div><div className="text-[22px] font-bold tabular-nums leading-none">{totals.available}</div><div className="mt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/60">{t("Days available", "أيام متاحة")}</div></div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-500/12 text-sky-500"><CheckCircle2 className="size-5" /></span>
          <div><div className="text-[22px] font-bold tabular-nums leading-none">{totals.used}</div><div className="mt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/60">{t("Days taken", "أيام مستخدمة")}</div></div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500/12 text-amber-500"><Hourglass className="size-5" /></span>
          <div><div className="text-[22px] font-bold tabular-nums leading-none">{totals.pending}</div><div className="mt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/60">{t("Awaiting approval", "بانتظار الموافقة")}</div></div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-rose-500/12 text-rose-500"><AlertTriangle className="size-5" /></span>
          <div><div className="text-[22px] font-bold tabular-nums leading-none">{totals.expiring}</div><div className="mt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/60">{t("Expiring Dec 31", "تنتهي ٣١ ديسمبر")}</div></div>
        </Card>
      </div>

      {/* tabs */}
      <div className="mb-5 inline-flex flex-wrap rounded-xl border border-border p-0.5">
        {TABS.map((tb) => (
          <button key={tb.id} onClick={() => setTab(tb.id)} aria-pressed={tab === tb.id}
            className={cn("inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors", tab === tb.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
            <tb.icon className="size-4" />{isAr ? tb.ar : tb.label}
          </button>
        ))}
      </div>

      {/* ── BALANCES ── */}
      {tab === "balances" && (
        <>
          {totals.expiring > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-3 text-sm">
              <AlertTriangle className="size-4 shrink-0 text-amber-500" />
              <span>{t(`${totals.expiring} annual leave days expire on 31 December if unused.`, `${totals.expiring} أيام من الإجازة السنوية تنتهي في ٣١ ديسمبر إن لم تُستخدم.`)}</span>
              <button onClick={() => navigate("/leave/request")} className="ms-auto text-xs font-semibold text-primary hover:underline">{t("Plan time off →", "خطط لإجازتك ←")}</button>
            </div>
          )}

          <div className="grid gap-4 @2xl:grid-cols-2">
            {types.map((x) => {
              const left = remaining(x)
              const usedPct = x.entitled ? (x.used / x.entitled) * 100 : 0
              const pendPct = x.entitled ? (x.pending / x.entitled) * 100 : 0
              return (
                <Card key={x.id} className="flex items-center gap-4 p-5">
                  <BalanceRing type={x} isAr={isAr} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="size-2 rounded-full" style={{ backgroundColor: x.color }} />
                      <span className="text-[14px] font-semibold">{isAr ? x.nameAr : x.name}</span>
                      {x.expiring ? <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-[10px] text-amber-600 dark:text-amber-400">{x.expiring} {t("expiring", "تنتهي")}</Badge> : null}
                    </div>
                    <p className="mt-0.5 text-[11.5px] text-muted-foreground">{isAr ? x.accrualAr : x.accrual}</p>
                    {/* used / pending / remaining bar */}
                    <div className="mt-2.5 flex h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full" style={{ width: `${usedPct}%`, backgroundColor: x.color }} />
                      <div className="h-full opacity-40" style={{ width: `${pendPct}%`, backgroundColor: x.color }} />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-muted-foreground">
                      <span><span className="font-semibold text-foreground">{left}</span> {t("left", "متبقٍ")}</span>
                      <span><span className="font-semibold text-foreground">{x.used}</span> {t("taken", "مستخدمة")}</span>
                      {x.pending > 0 && <span><span className="font-semibold text-foreground">{x.pending}</span> {t("pending", "معلقة")}</span>}
                      <span className="ms-auto">{t("of", "من")} {x.entitled}</span>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {upcoming.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 font-heading text-[15px] font-semibold">{t("Upcoming time off", "إجازاتك القادمة")}</h2>
              <div className="grid gap-3 @2xl:grid-cols-2">
                {upcoming.map((r) => {
                  const type = leaveTypeById(r.type)
                  return (
                    <Card key={r.id} className="flex items-center gap-3 p-4">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl" style={{ backgroundColor: `${type?.color}1e`, color: type?.color }}><Plane className="size-5" /></span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-semibold">{isAr ? r.fromAr : r.from} – {isAr ? r.toAr : r.to}</div>
                        <div className="text-[11.5px] text-muted-foreground">{isAr ? type?.nameAr : type?.name} · {r.days} {t(r.days === 1 ? "day" : "days", r.days === 1 ? "يوم" : "أيام")}</div>
                      </div>
                      <Badge variant="outline" className={cn("text-[10px]", STATUS_STYLE[r.status])}>{isAr ? STATUS_AR[r.status] : r.status}</Badge>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── REQUESTS ── */}
      {tab === "requests" && (
        <Card className="overflow-hidden py-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
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
                    <tr key={r.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-primary/[0.03]">
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-2">
                          <span className="size-2 rounded-full" style={{ backgroundColor: type?.color }} />
                          <span className="font-medium">{isAr ? type?.nameAr : type?.name}</span>
                        </span>
                        {r.reason && <div className="mt-0.5 text-[11px] text-muted-foreground">{isAr ? r.reasonAr : r.reason}</div>}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">{isAr ? r.fromAr : r.from} – {isAr ? r.toAr : r.to}</td>
                      <td className="px-4 py-3.5 text-center tabular-nums">{r.days}</td>
                      <td className="px-4 py-3.5 text-muted-foreground">{isAr ? r.submittedAr : r.submitted}</td>
                      <td className="px-4 py-3.5 text-muted-foreground">{isAr ? r.approverAr : r.approver}</td>
                      <td className="px-4 py-3.5"><Badge variant="outline" className={cn("text-[11px]", STATUS_STYLE[r.status])}>{isAr ? STATUS_AR[r.status] : r.status}</Badge></td>
                      <td className="px-4 py-3.5">
                        <div className="flex justify-end">
                          {r.status === "Pending"
                            ? <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => cancelLeaveRequest(r.id)}><X className="size-3.5" />{t("Cancel", "إلغاء")}</Button>
                            : <span className="text-[11px] text-muted-foreground/50">—</span>}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {requests.length === 0 && (
                  <tr><td colSpan={7} className="py-14 text-center">
                    <Clock className="mx-auto size-8 text-muted-foreground/40" />
                    <p className="mt-3 text-sm text-muted-foreground">{t("No leave requests yet.", "لا توجد طلبات إجازة بعد.")}</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── HOLIDAYS & TEAM ── */}
      {tab === "calendar" && (
        <div className="grid gap-5 @3xl:grid-cols-2">
          <Card className="p-5">
            <h2 className="mb-3 font-heading text-[15px] font-semibold">{t("Public holidays", "العطل الرسمية")}</h2>
            <div className="space-y-2.5">
              {HOLIDAYS.map((h) => (
                <div key={h.id} className="flex items-center gap-3 rounded-xl border border-border bg-[var(--card-elevated)] px-3.5 py-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/12 text-primary"><CalendarDays className="size-4" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold">{isAr ? h.nameAr : h.name}</div>
                    <div className="text-[11.5px] text-muted-foreground">{isAr ? h.dateAr : h.date}</div>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-[10px]">{h.days} {t(h.days === 1 ? "day" : "days", h.days === 1 ? "يوم" : "أيام")}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-1 font-heading text-[15px] font-semibold">{t("Who's away", "من في إجازة")}</h2>
            <p className="mb-3 text-[12px] text-muted-foreground">{t("Check team cover before booking your dates.", "تحقق من تغطية الفريق قبل حجز إجازتك.")}</p>
            <div className="space-y-1.5">
              {TEAM_AWAY.map((p) => {
                const type = leaveTypeById(p.type)
                return (
                  <div key={p.id} className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/40">
                    <Avatar className="size-8 shrink-0"><AvatarFallback className="bg-muted text-[10px] font-semibold">{p.initials}</AvatarFallback></Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-medium">{isAr ? p.nameAr : p.name}</div>
                      <div className="truncate text-[11px] text-muted-foreground">{isAr ? type?.nameAr : type?.name}</div>
                    </div>
                    <span className="shrink-0 text-[11.5px] text-muted-foreground">{isAr ? p.rangeAr : p.range}</span>
                  </div>
                )
              })}
            </div>
            <div className="mt-3 flex items-center gap-1.5 border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
              <Users className="size-3.5" />{TEAM_AWAY.length} {t("colleagues away in the next two weeks", "زملاء في إجازة خلال أسبوعين")}
            </div>
          </Card>
        </div>
      )}
    </main>
  )
}
