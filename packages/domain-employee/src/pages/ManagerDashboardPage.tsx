import * as React from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, Badge, Button, Card, Textarea } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  AlertTriangle, ArrowRight, BadgeCheck, CalendarDays, Check, Clock, CornerUpLeft,
  FileText, History, Plane, Receipt, ShoppingCart, TrendingUp, UserRound, Users, UsersRound,
} from "lucide-react"

import {
  attendanceTrend, decideApproval, headcount, leaveClashes, sar, team, upcomingLeave,
  useApprovals, useManagerAudit, type ApprovalKind, type TodayState,
} from "../data/mock/manager"

const STATE: Record<TodayState, { en: string; ar: string; dot: string; cls: string }> = {
  present: { en: "Present", ar: "حاضر", dot: "bg-emerald-500", cls: "border-emerald-500/35 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  remote: { en: "Remote", ar: "عن بُعد", dot: "bg-violet-500", cls: "border-violet-500/35 bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  leave: { en: "On leave", ar: "في إجازة", dot: "bg-blue-500", cls: "border-blue-500/35 bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  late: { en: "Late", ar: "متأخر", dot: "bg-amber-500", cls: "border-amber-500/35 bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  absent: { en: "Not in", ar: "غير حاضر", dot: "bg-muted-foreground/50", cls: "border-border/60 bg-muted/40 text-muted-foreground" },
}

const KIND_ICON: Record<ApprovalKind, React.ComponentType<{ className?: string }>> = {
  leave: Plane, expense: Receipt, overtime: Clock, letter: FileText, purchase: ShoppingCart,
}

function CardHead({ icon: Icon, title, desc, action }: { icon: React.ComponentType<{ className?: string }>; title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border/60 px-5 py-4">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary"><Icon className="size-4" /></span>
        <div className="min-w-0">
          <div className="text-[13px] font-semibold leading-tight">{title}</div>
          {desc && <div className="mt-0.5 truncate text-[11px] text-muted-foreground/65">{desc}</div>}
        </div>
      </div>
      {action}
    </div>
  )
}

function Stat({ value, label, tone }: { value: React.ReactNode; label: string; tone: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/15 px-3 py-2.5 text-center">
      <div className={cn("text-[20px] font-bold leading-none tabular-nums", tone)}>{value}</div>
      <div className="mt-1 text-[10.5px] font-medium text-muted-foreground">{label}</div>
    </div>
  )
}

/** Manager dashboard — the team view for a line manager (WBS 4.9). */
export default function ManagerDashboardPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const approvals = useApprovals()
  const audit = useManagerAudit()
  const [returning, setReturning] = React.useState<string | null>(null)
  const [confirming, setConfirming] = React.useState<string | null>(null)
  const [comment, setComment] = React.useState("")

  // today, in both calendars — Saudi offices work to the Hijri date as well
  const now = new Date()
  const today = now.toLocaleDateString(isAr ? "ar-SA" : "en-GB",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" })
  const todayHijri = now.toLocaleDateString(isAr ? "ar-SA-u-ca-islamic" : "en-GB-u-ca-islamic",
    { day: "numeric", month: "long", year: "numeric" })

  const pending = approvals.filter((a) => a.state === "Pending")
  const counts = team.reduce<Record<TodayState, number>>((acc, r) => {
    acc[r.state] = (acc[r.state] ?? 0) + 1
    return acc
  }, { present: 0, remote: 0, leave: 0, late: 0, absent: 0 })
  const overdueTotal = team.reduce((n, r) => n + r.overdue, 0)
  const oldest = pending.reduce((m, a) => Math.max(m, a.ageDays), 0)
  const avgUtil = Math.round(team.filter((r) => r.utilisation > 0).reduce((n, r) => n + r.utilisation, 0) / team.filter((r) => r.utilisation > 0).length)

  const send = (id: string) => {
    decideApproval(id, "Returned", comment.trim() || undefined)
    setReturning(null); setComment("")
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-7 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <h1 className="text-[22px] font-bold tracking-tight md:text-[26px]">{t("Manager dashboard", "لوحة المدير")}</h1>
            {/* the day everything on this page is "today" for */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[12px] font-medium">
              <CalendarDays className="size-3.5 text-primary" />
              <span className="tabular-nums">{today}</span>
              <span className="text-muted-foreground">· {todayHijri}</span>
            </span>
          </div>
          <p className="max-w-3xl text-[13px] text-muted-foreground">
            {t("Your team today, what is waiting on your decision, and where the pressure is.", "فريقك اليوم، وما ينتظر قرارك، وأين يقع الضغط.")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/org-chart")}><UsersRound className="size-4" />{t("Org chart", "الهيكل التنظيمي")}</Button>
          <Button variant="outline" onClick={() => navigate("/directory")}><UserRound className="size-4" />{t("Directory", "دليل الموظفين")}</Button>
        </div>
      </div>

      {/* ── team at a glance ── */}
      <motion.section
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="highlight-card hl-teal relative overflow-hidden rounded-3xl"
      >
        <div className="relative z-10 flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: "rgba(243,240,238,0.45)" }}>
              {t("Business Operations", "العمليات التجارية")}
            </div>
            <h2 className="mt-1 text-[22px] font-bold tracking-tight md:text-[26px]" style={{ color: "#F3F0EE" }}>
              {t(`${team.length} direct reports`, `${team.length} موظفين مباشرين`)}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px]" style={{ color: "rgba(243,240,238,0.55)" }}>
              <span>{t(`${headcount.filled} of ${headcount.budgeted} positions filled`, `${headcount.filled} من ${headcount.budgeted} وظيفة مشغولة`)}</span>
              <span aria-hidden>·</span>
              <span>{t(`${headcount.openRoles} open roles`, `${headcount.openRoles} وظائف شاغرة`)}</span>
              <span aria-hidden>·</span>
              <span>{t(`${headcount.probation} on probation`, `${headcount.probation} تحت التجربة`)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:min-w-[440px]">
            {(["present", "remote", "late", "leave", "absent"] as TodayState[]).map((s) => (
              <div key={s} className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-center">
                <div className="text-[20px] font-bold leading-none tabular-nums" style={{ color: "#F3F0EE" }}>{counts[s]}</div>
                <div className="mt-1 text-[10px] font-medium" style={{ color: "rgba(243,240,238,0.5)" }}>
                  {isAr ? STATE[s].ar : STATE[s].en}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── attention strip ── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat value={pending.length} label={t("Awaiting your decision", "بانتظار قرارك")} tone="text-primary" />
        <Stat value={oldest > 0 ? t(`${oldest}d`, `${oldest} ي`) : "—"} label={t("Oldest request", "أقدم طلب")} tone={oldest >= 3 ? "text-amber-500" : "text-foreground"} />
        <Stat value={overdueTotal} label={t("Overdue tasks in team", "مهام متأخرة في الفريق")} tone={overdueTotal > 0 ? "text-red-500" : "text-emerald-500"} />
        <Stat value={`${avgUtil}%`} label={t("Average utilisation", "متوسط الإشغال")} tone="text-foreground" />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-12">
        {/* ── left: approvals + team ── */}
        <div className="space-y-6 lg:col-span-8">
          <Card className="ring-1 ring-foreground/10">
            <CardHead
              icon={BadgeCheck}
              title={t("Waiting on you", "بانتظارك")}
              desc={t("Requests from your team", "طلبات من فريقك")}
              action={pending.length > 0 ? <Badge variant="outline" className="text-[11px]">{pending.length}</Badge> : undefined}
            />
            <div className="divide-y divide-border/50">
              {pending.map((a) => {
                const Icon = KIND_ICON[a.kind]
                return (
                  <div
                    key={a.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/manager/approvals/${a.id}`)}
                    onKeyDown={(e) => { if (e.key === "Enter") navigate(`/manager/approvals/${a.id}`) }}
                    aria-label={t("Open request", "فتح الطلب") + " " + a.ref}
                    className="cursor-pointer px-5 py-4 outline-none transition-colors hover:bg-muted/25 focus-visible:bg-muted/25"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 gap-3">
                        <Avatar className="size-9 shrink-0">
                          <AvatarFallback className="bg-primary/12 text-[12px] font-bold text-primary">{a.initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[13px] font-semibold">{isAr ? a.titleAr : a.title}</span>
                            <span className="text-[11px] tabular-nums text-muted-foreground/70">{a.ref}</span>
                            {a.ageDays >= 3 && (
                              <Badge variant="outline" className="gap-1 border-amber-500/35 bg-amber-500/10 text-[10px] text-amber-600 dark:text-amber-400">
                                <AlertTriangle className="size-2.5" />{t(`${a.ageDays} days waiting`, `${a.ageDays} أيام انتظار`)}
                              </Badge>
                            )}
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11.5px] text-muted-foreground">
                            <span className="inline-flex items-center gap-1"><Icon className="size-3.5" />{isAr ? a.detailAr : a.detail}</span>
                            {a.amount !== undefined && <span className="font-semibold text-foreground">{sar(a.amount, isAr)}</span>}
                          </div>
                          <div className="mt-0.5 text-[11px] text-muted-foreground/65">
                            {isAr ? a.whoAr : a.who} · {isAr ? a.submittedAr : a.submitted}
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/manager/approvals/${a.id}`)}>
                          {t("Details", "التفاصيل")}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => { setReturning(returning === a.id ? null : a.id); setComment("") }}>
                          <CornerUpLeft className="size-3.5" />{t("Return", "إعادة")}
                        </Button>
                        <Button size="sm" onClick={() => setConfirming(confirming === a.id ? null : a.id)}>
                          <Check className="size-3.5" />{t("Approve", "اعتماد")}
                        </Button>
                      </div>
                    </div>

                    {confirming === a.id && (
                      <div className="mt-3 rounded-xl border border-primary/30 bg-primary/[0.04] p-3" onClick={(e) => e.stopPropagation()}>
                        <p className="text-[12.5px] font-semibold">{t("Approve this request?", "اعتماد هذا الطلب؟")}</p>
                        <p className="mt-0.5 text-[12px] text-muted-foreground">
                          {a.ref} · {isAr ? a.titleAr : a.title}
                          {a.amount !== undefined ? ` · ${sar(a.amount, isAr)}` : ""}
                          {" — "}
                          {t("the decision is recorded against your name.", "سيُسجَّل القرار باسمك.")}
                        </p>
                        <div className="mt-2 flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => setConfirming(null)}>{t("Cancel", "إلغاء")}</Button>
                          <Button size="sm" onClick={() => { decideApproval(a.id, "Approved"); setConfirming(null) }}>
                            <Check className="size-3.5" />{t("Yes, approve", "نعم، اعتمد")}
                          </Button>
                        </div>
                      </div>
                    )}

                    {returning === a.id && (
                      <div className="mt-3 rounded-xl border border-border/60 bg-muted/20 p-3" onClick={(e) => e.stopPropagation()}>
                        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          {t("Why are you returning it?", "لماذا تعيد الطلب؟")}
                        </label>
                        <Textarea
                          rows={2} value={comment} onChange={(e) => setComment(e.target.value)}
                          placeholder={t("The team member sees this comment.", "سيرى الموظف هذه الملاحظة.")}
                        />
                        <div className="mt-2 flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => setReturning(null)}>{t("Cancel", "إلغاء")}</Button>
                          <Button size="sm" onClick={() => send(a.id)}>{t("Return with comment", "إعادة مع ملاحظة")}</Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {pending.length === 0 && (
                <div className="px-5 py-12 text-center">
                  <Check className="mx-auto size-8 text-emerald-500/60" />
                  <p className="mt-3 text-[13px] text-muted-foreground">{t("Nothing is waiting on you.", "لا يوجد ما ينتظر قرارك.")}</p>
                </div>
              )}
            </div>
          </Card>

          {/* team list */}
          <Card className="ring-1 ring-foreground/10">
            <CardHead
              icon={Users} title={t("My team today", "فريقي اليوم")}
              desc={t("Attendance, workload and leave balance", "الحضور، حجم العمل، ورصيد الإجازات")}
              action={<Button variant="outline" size="sm" onClick={() => navigate("/attendance")}>{t("Attendance", "الحضور")}<ArrowRight className={cn("size-3.5", isAr && "rotate-180")} /></Button>}
            />
            <div className="divide-y divide-border/50">
              {team.map((r) => {
                const st = STATE[r.state]
                return (
                  <div key={r.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <Avatar className="size-9 shrink-0">
                        <AvatarFallback className="bg-primary/12 text-[12px] font-bold text-primary">{r.initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-semibold">{isAr ? r.nameAr : r.name}</div>
                        <div className="truncate text-[11.5px] text-muted-foreground/70">{isAr ? r.titleAr : r.title}</div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 sm:gap-4">
                      <span className="hidden text-[11.5px] text-muted-foreground sm:inline">
                        {r.checkIn ?? "—"} · {isAr ? r.locationAr : r.location}
                      </span>
                      <span className="text-[11.5px] tabular-nums text-muted-foreground">
                        {t(`${r.openTasks} tasks`, `${r.openTasks} مهمة`)}
                        {r.overdue > 0 && <span className="ms-1 font-semibold text-red-500">({t(`${r.overdue} overdue`, `${r.overdue} متأخرة`)})</span>}
                      </span>
                      <span className="hidden w-24 items-center gap-2 md:flex">
                        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <span
                            className={cn("block h-full rounded-full", r.utilisation > 90 ? "bg-amber-500" : "bg-primary")}
                            style={{ width: `${r.utilisation}%` }}
                          />
                        </span>
                        <span className="text-[11px] tabular-nums text-muted-foreground">{r.utilisation}%</span>
                      </span>
                      <span className={cn("inline-flex w-[5.5rem] shrink-0 items-center justify-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", st.cls)}>
                        <span className={cn("size-1.5 shrink-0 rounded-full", st.dot)} />{isAr ? st.ar : st.en}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* ── right: leave, trend, audit ── */}
        <div className="space-y-6 lg:col-span-4">
          <Card className="ring-1 ring-foreground/10">
            <CardHead icon={CalendarDays} title={t("Team leave", "إجازات الفريق")} desc={t("Next 30 days", "الثلاثون يومًا القادمة")} />
            <div className="space-y-3 p-4">
              {leaveClashes.map((c) => (
                <div key={c.date} className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-[11.5px] text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                  <span>{t(`${c.who.length} people away on ${c.date}`, `${c.who.length} موظفين في إجازة ${c.dateAr}`)}</span>
                </div>
              ))}
              <div className="divide-y divide-border/50 rounded-xl border border-border/60">
                {upcomingLeave.map((l) => (
                  <div key={l.id} className="flex items-center justify-between gap-2 px-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Avatar className="size-7 shrink-0">
                        <AvatarFallback className="bg-primary/12 text-[10px] font-bold text-primary">{l.initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="truncate text-[12.5px] font-medium">{isAr ? l.whoAr : l.who}</div>
                        <div className="text-[11px] text-muted-foreground/70">{isAr ? l.rangeAr : l.range} · {isAr ? l.typeAr : l.type}</div>
                      </div>
                    </div>
                    {!l.approved && (
                      <Badge variant="outline" className="shrink-0 text-[10px] text-muted-foreground">{t("Pending", "معلّقة")}</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="ring-1 ring-foreground/10">
            <CardHead
              icon={Clock} title={t("Attendance", "الحضور")} desc={isAr ? attendanceTrend.monthLabelAr : attendanceTrend.monthLabel}
              action={
                <Badge variant="outline" className="gap-1 border-emerald-500/35 bg-emerald-500/10 text-[11px] text-emerald-500">
                  <TrendingUp className="size-3" />{attendanceTrend.onTimePct}%
                </Badge>
              }
            />
            <div className="space-y-4 p-4">
              <div className="grid grid-cols-3 gap-2.5">
                <Stat value={`${attendanceTrend.onTimePct}%`} label={t("On time", "في الوقت")} tone="text-emerald-500" />
                <Stat value={attendanceTrend.lateInstances} label={t("Late", "تأخير")} tone="text-amber-500" />
                <Stat value={`${attendanceTrend.remotePct}%`} label={t("Remote", "عن بُعد")} tone="text-violet-500" />
              </div>

              <div>
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("This week", "هذا الأسبوع")}
                </div>
                <div className="flex items-end justify-between gap-1.5">
                  {attendanceTrend.week.map((d) => {
                    const total = d.present + d.remote + d.leave + d.absent
                    return (
                      <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
                        <div className="flex h-20 w-full flex-col-reverse overflow-hidden rounded-md bg-muted/40">
                          <span className="w-full bg-emerald-500/80" style={{ height: `${(d.present / total) * 100}%` }} />
                          <span className="w-full bg-violet-500/70" style={{ height: `${(d.remote / total) * 100}%` }} />
                          <span className="w-full bg-blue-500/60" style={{ height: `${(d.leave / total) * 100}%` }} />
                        </div>
                        <span className="text-[10px] text-muted-foreground">{isAr ? d.dayAr : d.day}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-[10.5px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-emerald-500/80" />{t("Present", "حاضر")}</span>
                  <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-violet-500/70" />{t("Remote", "عن بُعد")}</span>
                  <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-blue-500/60" />{t("Leave", "إجازة")}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="ring-1 ring-foreground/10">
            <CardHead icon={History} title={t("Decision log", "سجل القرارات")} desc={t("Every approval is recorded", "يتم تسجيل كل اعتماد")} />
            <div className="max-h-64 divide-y divide-border/50 overflow-y-auto">
              {audit.map((a) => (
                <div key={a.id} className="px-5 py-3">
                  <div className="text-[12.5px] font-medium">
                    <span className={cn("font-semibold", a.action === "approved" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>
                      {a.action === "approved" ? t("Approved", "اعتُمد") : t("Returned", "أُعيد")}
                    </span>{" "}
                    {a.target}
                  </div>
                  {a.comment && <div className="mt-0.5 text-[11.5px] italic text-muted-foreground/80">“{a.comment}”</div>}
                  <div className="mt-0.5 text-[11px] text-muted-foreground/65">{a.who} · {a.time}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
