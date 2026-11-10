import * as React from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Textarea } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  AlertTriangle, ArrowLeft, BadgeCheck, CalendarDays, Check, Clock, CornerUpLeft,
  FileText, History, Plane, Receipt, ShoppingCart, TrendingUp, UserRound, Users, UsersRound,
} from "lucide-react"

import {
  attendanceTrend, decideApproval, headcount, leaveClashes, sar, team, upcomingLeave,
  useApprovals, useManagerAudit, type ApprovalKind, type TodayState,
} from "../data/mock/manager"
import {
  Bar, Chip, Empty, FieldLabel, GoldButton, IconBadge, Initials, OutlineButton, Page, SectionCard, Tile, type Tone,
} from "../components/wijha"

const STATE: Record<TodayState, { en: string; ar: string; tone: Tone }> = {
  present: { en: "Present", ar: "حاضر", tone: "success" },
  remote: { en: "Remote", ar: "عن بُعد", tone: "violet" },
  leave: { en: "On leave", ar: "في إجازة", tone: "info" },
  late: { en: "Late", ar: "متأخر", tone: "warning" },
  absent: { en: "Not in", ar: "غير حاضر", tone: "neutral" },
}

const KIND_ICON: Record<ApprovalKind, React.ComponentType<{ className?: string }>> = {
  leave: Plane, expense: Receipt, overtime: Clock, letter: FileText, purchase: ShoppingCart,
}

/** The prototype's "today" — Tuesday 28 April 2026. */
const TODAY = new Date(2026, 3, 28)

function Stat({ value, label, tone = "text-foreground", icon }: { value: React.ReactNode; label: string; tone?: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="panel flex items-center gap-3 rounded-xl px-5 py-4">
      <IconBadge icon={icon} />
      <div className="min-w-0">
        <div className={cn("text-[22px] font-semibold leading-none tabular-nums", tone)}>{value}</div>
        <div className="mt-1 truncate text-[12.5px] text-muted-foreground">{label}</div>
      </div>
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
  const today = TODAY.toLocaleDateString(isAr ? "ar-SA-u-nu-latn-ca-gregory" : "en-GB",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" })
  const todayHijri = TODAY.toLocaleDateString(isAr ? "ar-SA-u-nu-latn-ca-islamic" : "en-GB-u-ca-islamic",
    { day: "numeric", month: "long", year: "numeric" })

  const pending = approvals.filter((a) => a.state === "Pending")
  const counts = team.reduce<Record<TodayState, number>>((acc, r) => {
    acc[r.state] = (acc[r.state] ?? 0) + 1
    return acc
  }, { present: 0, remote: 0, leave: 0, late: 0, absent: 0 })
  const overdueTotal = team.reduce((n, r) => n + r.overdue, 0)
  const oldest = pending.reduce((m, a) => Math.max(m, a.ageDays), 0)
  const working = team.filter((r) => r.utilisation > 0)
  const avgUtil = working.length ? Math.round(working.reduce((n, r) => n + r.utilisation, 0) / working.length) : 0

  const send = (id: string) => {
    decideApproval(id, "Returned", comment.trim() || undefined)
    setReturning(null); setComment("")
  }

  return (
    <Page>
      {/* toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex h-9 items-center gap-2 rounded-lg bg-secondary px-3 text-[13px]">
          <CalendarDays className="size-4 text-primary" />
          <span className="tabular-nums">{today}</span>
          <span className="text-muted-foreground">· {todayHijri}</span>
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <OutlineButton onClick={() => navigate("/org-chart")}><UsersRound className="size-4" />{t("Org chart", "الهيكل التنظيمي")}</OutlineButton>
          <OutlineButton onClick={() => navigate("/directory")}><UserRound className="size-4" />{t("Directory", "دليل الموظفين")}</OutlineButton>
        </div>
      </div>

      <div className="space-y-6">
        {/* ── team at a glance ── */}
        <motion.section
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className="highlight-card hl-green relative overflow-hidden rounded-2xl"
        >
          <div className="relative z-10 flex flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between md:px-10">
            <div>
              <div className="text-[12.5px] text-muted-foreground">{t("Digital Experience", "التجربة الرقمية")}</div>
              <h2 className="mt-1 text-[28px] font-medium leading-tight">
                {t(`${team.length} direct reports`, `${team.length} موظفين مباشرين`)}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-muted-foreground">
                <span>{t(`${headcount.filled} of ${headcount.budgeted} positions filled`, `${headcount.filled} من ${headcount.budgeted} وظيفة مشغولة`)}</span>
                <span aria-hidden>·</span>
                <span>{t(`${headcount.openRoles} open roles`, `${headcount.openRoles} وظائف شاغرة`)}</span>
                <span aria-hidden>·</span>
                <span>{t(`${headcount.probation} on probation`, `${headcount.probation} تحت التجربة`)}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:min-w-[440px]">
              {(["present", "remote", "late", "leave", "absent"] as TodayState[]).map((s) => (
                <Tile key={s} className="px-3 py-3 text-center">
                  <div className="text-[22px] font-semibold leading-none tabular-nums">{counts[s]}</div>
                  <div className="mt-1.5"><Chip tone={STATE[s].tone} className="h-5 px-1.5 text-[11px]">{isAr ? STATE[s].ar : STATE[s].en}</Chip></div>
                </Tile>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── attention strip ── */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={BadgeCheck} value={pending.length} label={t("Awaiting your decision", "بانتظار قرارك")} tone="text-primary" />
          <Stat icon={Clock} value={oldest > 0 ? t(`${oldest}d`, `${oldest} ي`) : "—"} label={t("Oldest request", "أقدم طلب")} tone={oldest >= 3 ? "text-warning" : "text-foreground"} />
          <Stat icon={AlertTriangle} value={overdueTotal} label={t("Overdue tasks in team", "مهام متأخرة في الفريق")} tone={overdueTotal > 0 ? "text-error" : "text-success"} />
          <Stat icon={TrendingUp} value={`${avgUtil}%`} label={t("Average utilisation", "متوسط الإشغال")} />
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-12">
          {/* ── approvals + team ── */}
          <div className="min-w-0 space-y-6 lg:col-span-8">
            <SectionCard
              icon={BadgeCheck}
              title={t("Waiting on you", "بانتظارك")}
              action={pending.length > 0 ? <Chip tone="accent">{pending.length}</Chip> : undefined}
            >
              <p className="-mt-2 mb-4 text-[12.5px] text-muted-foreground">{t("Requests from your team", "طلبات من فريقك")}</p>
              {pending.length === 0 ? (
                <Empty icon={Check} title={t("Nothing is waiting on you.", "لا يوجد ما ينتظر قرارك.")} />
              ) : (
                <div className="space-y-3">
                  {pending.map((a) => {
                    const Icon = KIND_ICON[a.kind]
                    return (
                      <Tile
                        key={a.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate(`/manager/approvals/${a.id}`)}
                        onKeyDown={(e) => { if (e.key === "Enter") navigate(`/manager/approvals/${a.id}`) }}
                        aria-label={t("Open request", "فتح الطلب") + " " + a.ref}
                        className="cursor-pointer outline-none transition-colors hover:ring-primary/30 focus-visible:ring-primary/50"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex min-w-0 gap-3">
                            <Initials text={a.initials} tone="accent" className="size-10" />
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[14.5px] font-medium">{isAr ? a.titleAr : a.title}</span>
                                <span className="text-[12px] tabular-nums text-muted-foreground" dir="ltr">{a.ref}</span>
                                {a.ageDays >= 3 && (
                                  <Chip tone="warning" icon={AlertTriangle}>{t(`${a.ageDays} days waiting`, `${a.ageDays} أيام انتظار`)}</Chip>
                                )}
                              </div>
                              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12.5px] text-muted-foreground">
                                <span className="inline-flex items-center gap-1"><Icon className="size-3.5 text-primary" />{isAr ? a.detailAr : a.detail}</span>
                                {a.amount !== undefined && <span className="font-medium text-foreground">{sar(a.amount, isAr)}</span>}
                              </div>
                              <div className="mt-0.5 text-[12px] text-muted-foreground">
                                {isAr ? a.whoAr : a.who} · {isAr ? a.submittedAr : a.submitted}
                              </div>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button type="button" onClick={() => navigate(`/manager/approvals/${a.id}`)} className="h-7 px-2 text-[13px] text-primary hover:underline">
                              {t("Details", "التفاصيل")}
                            </button>
                            <OutlineButton size="sm" onClick={() => { setReturning(returning === a.id ? null : a.id); setComment("") }}>
                              <CornerUpLeft className="size-3.5" />{t("Return", "إعادة")}
                            </OutlineButton>
                            <GoldButton size="sm" onClick={() => setConfirming(confirming === a.id ? null : a.id)}>
                              <Check className="size-3.5" />{t("Approve", "اعتماد")}
                            </GoldButton>
                          </div>
                        </div>

                        {confirming === a.id && (
                          <div className="mt-3 rounded-[10px] bg-soft-accent p-3" onClick={(e) => e.stopPropagation()}>
                            <p className="text-[13px] font-medium">{t("Approve this request?", "اعتماد هذا الطلب؟")}</p>
                            <p className="mt-0.5 text-[12px] text-muted-foreground">
                              {a.ref} · {isAr ? a.titleAr : a.title}
                              {a.amount !== undefined ? ` · ${sar(a.amount, isAr)}` : ""}
                              {" — "}
                              {t("the decision is recorded against your name.", "سيُسجَّل القرار باسمك.")}
                            </p>
                            <div className="mt-2 flex justify-end gap-2">
                              <OutlineButton size="sm" onClick={() => setConfirming(null)}>{t("Cancel", "إلغاء")}</OutlineButton>
                              <GoldButton size="sm" onClick={() => { decideApproval(a.id, "Approved"); setConfirming(null) }}>
                                <Check className="size-3.5" />{t("Yes, approve", "نعم، اعتمد")}
                              </GoldButton>
                            </div>
                          </div>
                        )}

                        {returning === a.id && (
                          <div className="mt-3 rounded-[10px] bg-secondary/60 p-3" onClick={(e) => e.stopPropagation()}>
                            <FieldLabel>{t("Why are you returning it?", "لماذا تعيد الطلب؟")}</FieldLabel>
                            <Textarea
                              rows={2} value={comment} onChange={(e) => setComment(e.target.value)}
                              className="rounded-lg bg-background"
                              placeholder={t("The team member sees this comment.", "سيرى الموظف هذه الملاحظة.")}
                            />
                            <div className="mt-2 flex justify-end gap-2">
                              <OutlineButton size="sm" onClick={() => setReturning(null)}>{t("Cancel", "إلغاء")}</OutlineButton>
                              <GoldButton size="sm" onClick={() => send(a.id)}>{t("Return with comment", "إعادة مع ملاحظة")}</GoldButton>
                            </div>
                          </div>
                        )}
                      </Tile>
                    )
                  })}
                </div>
              )}
            </SectionCard>

            {/* team list */}
            <SectionCard
              icon={Users} title={t("My team today", "فريقي اليوم")}
              action={
                <button type="button" onClick={() => navigate("/attendance")} className="inline-flex items-center gap-1 text-[13px] text-primary hover:underline">
                  {t("Attendance", "الحضور")}<ArrowLeft className={cn("size-3.5", !isAr && "rotate-180")} />
                </button>
              }
            >
              <p className="-mt-2 mb-2 text-[12.5px] text-muted-foreground">{t("Attendance, workload and leave balance", "الحضور، حجم العمل، ورصيد الإجازات")}</p>
              {team.length === 0 ? (
                <Empty icon={Users} title={t("No direct reports yet.", "لا يوجد موظفون مباشرون بعد.")} />
              ) : (
                <div>
                  {team.map((r) => {
                    const st = STATE[r.state]
                    return (
                      <div key={r.id} className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-b-0">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <Initials text={r.initials} tone="accent" className="size-10" />
                          <div className="min-w-0">
                            <div className="truncate text-[14px] font-medium">{isAr ? r.nameAr : r.name}</div>
                            <div className="truncate text-[12px] text-muted-foreground">{isAr ? r.titleAr : r.title}</div>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
                          <span className="hidden text-[12px] text-muted-foreground sm:inline">
                            {r.checkIn ?? "—"} · {isAr ? r.locationAr : r.location}
                          </span>
                          <span className="text-[12px] tabular-nums text-muted-foreground">
                            {t(`${r.openTasks} tasks`, `${r.openTasks} مهمة`)}
                            {r.overdue > 0 && <span className="ms-1 font-medium text-error">({t(`${r.overdue} overdue`, `${r.overdue} متأخرة`)})</span>}
                          </span>
                          <span className="hidden w-28 items-center gap-2 md:flex">
                            <Bar value={r.utilisation} tone={r.utilisation > 90 ? "warning" : "success"} />
                            <span className="text-[12px] tabular-nums text-muted-foreground">{r.utilisation}%</span>
                          </span>
                          <Chip tone={st.tone} className="w-[5.5rem] justify-center">{isAr ? st.ar : st.en}</Chip>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </SectionCard>
          </div>

          {/* ── leave, trend, audit ── */}
          <div className="min-w-0 space-y-6 lg:col-span-4">
            <SectionCard icon={CalendarDays} title={t("Team leave", "إجازات الفريق")}>
              <p className="-mt-2 mb-3 text-[12.5px] text-muted-foreground">{t("Coming up", "القادمة")}</p>
              <div className="space-y-3">
                {leaveClashes.map((c) => (
                  <div key={c.date} className="flex items-start gap-2 rounded-[10px] bg-warning-fill px-3 py-2.5 text-[12.5px] text-warning">
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                    <span>{t(`${c.who.length} people away on ${c.date}`, `${c.who.length} موظفين في إجازة ${c.dateAr}`)}</span>
                  </div>
                ))}
                {upcomingLeave.length === 0 ? (
                  <Empty icon={Plane} title={t("No leave booked.", "لا توجد إجازات محجوزة.")} />
                ) : (
                  <div className="space-y-2">
                    {upcomingLeave.map((l) => (
                      <Tile key={l.id} className="flex items-center justify-between gap-2 px-3 py-2.5">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <Initials text={l.initials} className="size-8 text-[11px]" />
                          <div className="min-w-0">
                            <div className="truncate text-[13px] font-medium">{isAr ? l.whoAr : l.who}</div>
                            <div className="text-[12px] text-muted-foreground">{isAr ? l.rangeAr : l.range} · {isAr ? l.typeAr : l.type}</div>
                          </div>
                        </div>
                        {!l.approved && <Chip>{t("Pending", "معلّقة")}</Chip>}
                      </Tile>
                    ))}
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard
              icon={Clock} title={t("Attendance", "الحضور")}
              action={<Chip tone="success" icon={TrendingUp}>{attendanceTrend.onTimePct}%</Chip>}
            >
              <p className="-mt-2 mb-3 text-[12.5px] text-muted-foreground">{isAr ? attendanceTrend.monthLabelAr : attendanceTrend.monthLabel}</p>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2.5">
                  <MiniStat value={`${attendanceTrend.onTimePct}%`} label={t("On time", "في الوقت")} tone="text-success" />
                  <MiniStat value={attendanceTrend.lateInstances} label={t("Late", "تأخير")} tone="text-warning" />
                  <MiniStat value={`${attendanceTrend.remotePct}%`} label={t("Remote", "عن بُعد")} tone="text-[#a997c7]" />
                </div>

                <div>
                  <div className="mb-2 text-[12.5px] text-muted-foreground">{t("This week", "هذا الأسبوع")}</div>
                  <div className="flex items-end justify-between gap-1.5">
                    {attendanceTrend.week.map((d) => {
                      const total = d.present + d.remote + d.leave + d.absent
                      return (
                        <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
                          <div className="flex h-20 w-full flex-col-reverse overflow-hidden rounded-md bg-secondary">
                            <span className="w-full bg-[#1aad70]/90" style={{ height: `${(d.present / total) * 100}%` }} />
                            <span className="w-full bg-[#a997c7]/80" style={{ height: `${(d.remote / total) * 100}%` }} />
                            <span className="w-full bg-info/70" style={{ height: `${(d.leave / total) * 100}%` }} />
                          </div>
                          <span className="text-[11px] text-muted-foreground">{isAr ? d.dayAr : d.day}</span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[11.5px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-[#1aad70]" />{t("Present", "حاضر")}</span>
                    <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-[#a997c7]" />{t("Remote", "عن بُعد")}</span>
                    <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-info" />{t("Leave", "إجازة")}</span>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard icon={History} title={t("Decision log", "سجل القرارات")}>
              <p className="-mt-2 mb-2 text-[12.5px] text-muted-foreground">{t("Every approval is recorded", "يتم تسجيل كل اعتماد")}</p>
              {audit.length === 0 ? (
                <Empty icon={History} title={t("No decisions yet.", "لا توجد قرارات بعد.")} />
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {audit.map((a) => (
                    <div key={a.id} className="border-b border-border py-3 last:border-b-0">
                      <div className="text-[13px]">
                        <span className={cn("font-medium", a.action === "approved" ? "text-success" : "text-warning")}>
                          {a.action === "approved" ? t("Approved", "اعتُمد") : t("Returned", "أُعيد")}
                        </span>{" "}
                        {a.target}
                      </div>
                      {a.comment && <div className="mt-0.5 text-[12px] italic text-muted-foreground">“{a.comment}”</div>}
                      <div className="mt-0.5 text-[11.5px] text-muted-foreground">{a.who} · {a.time}</div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      </div>
    </Page>
  )
}

function MiniStat({ value, label, tone }: { value: React.ReactNode; label: string; tone: string }) {
  return (
    <Tile className="px-2 py-2.5 text-center">
      <div className={cn("text-[18px] font-semibold leading-none tabular-nums", tone)}>{value}</div>
      <div className="mt-1 text-[11.5px] text-muted-foreground">{label}</div>
    </Tile>
  )
}
