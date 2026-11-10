/** Surveys & polls (الاستبيانات والتصويت). No web screen of its own in Figma —
 *  built from the Knowledge cards (2028:3744), the poll/survey result cards
 *  (2441:5698 · 4352:14026) and the phone flow (3807:9843 list ·
 *  3807:10057 voting · 3807:9948 results). Create opens popup 2464:2865. */
import * as React from "react"
import { useNavigate } from "react-router-dom"
import { useShell } from "@reach/shell-context"
import { BarChart3, BadgeCheck, CheckCircle2, ClipboardList, Clock, Download, MessageSquareText, Plus, Timer, Trash2, TrendingUp, Users } from "lucide-react"

import {
  CardHead, DeletePopup, DirChevron, downloadCsv, EmptyState, RadioDot, ResultBar, Skeleton, Tag, useFakeLoading, WButton, WCard, WPage, arNum,
} from "./_wijha"
import { SurveyCreateModal } from "./SurveyCreateModal"
import { activeSurveys, categoryAr, closedSurveys, pulsePoll, type ClosedSurvey } from "../data/mock/surveys"
import { getCompletedSurveys, getCreatedSurveys, removeCreatedSurvey, subscribeCompleted, subscribeCreated } from "../store"

export default function SurveysPage() {
  const { locale, role } = useShell()
  const isAr = locale === "ar"
  const isAdmin = role === "admin"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const loading = useFakeLoading()

  const created = React.useSyncExternalStore(subscribeCreated, getCreatedSurveys)
  const completedList = React.useSyncExternalStore(subscribeCompleted, getCompletedSurveys)
  const completed = React.useMemo(() => new Set(completedList), [completedList])
  const [creating, setCreating] = React.useState(false)
  const [hidden, setHidden] = React.useState<string[]>([])
  const [confirm, setConfirm] = React.useState<{ id: string; title: string; created?: boolean } | null>(null)

  const live = created.filter((c) => c.status !== "Draft")
  const awaiting = activeSurveys.filter((s) => !completed.has(s.id))
  const results = closedSurveys.filter((c) => !hidden.includes(c.id))
  const avgParticipation = Math.round(closedSurveys.reduce((s, c) => s + c.participation, 0) / closedSurveys.length)

  return (
    <WPage>
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_394px]">
        <div className="flex min-w-0 flex-col gap-6">
          {/* list — phone 3807:9843 */}
          <WCard>
            <CardHead icon={BadgeCheck} title={t("Surveys & polls", "الاستبيانات والتصويت")}
              actions={isAdmin ? <WButton size="sm" className="min-w-[108px]" onClick={() => setCreating(true)}><Plus />{t("Create survey", "إنشاء استبيان")}</WButton> : undefined} />
            <div className="mt-4 flex flex-col gap-3">
              {loading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[92px]" />) : (
                <>
                  {live.map((c) => (
                    <ListRow isAr={isAr} key={c.id} icon={c.kind === "poll" ? BadgeCheck : BarChart3} title={c.title}
                      tags={<><Tag tone="green">{t("Live", "نشط")}</Tag><Tag>{c.kind === "poll" ? t("Poll", "تصويت") : t("Survey", "استبيان")}</Tag></>}
                      meta={<span>{arNum(c.options?.length ?? c.questionCount, isAr)} {c.options?.length ? t("options", "خيارات") : t("questions", "سؤال")} · {t("0 responses", "٠ ردود")}</span>}
                      action={isAdmin ? <WButton variant="danger" className="w-[84px]" onClick={() => setConfirm({ id: c.id, title: c.title, created: true })}><Trash2 />{t("Delete", "حذف")}</WButton> : undefined} />
                  ))}
                  {awaiting.map((s) => (
                    <ListRow isAr={isAr} key={s.id} icon={BarChart3} title={isAr ? s.titleAr : s.title}
                      tags={<><Tag>{isAr ? categoryAr[s.category] : s.category}</Tag>{s.closingSoon && <Tag tone="rose">{t("Closing soon", "يُغلق قريبًا")}</Tag>}</>}
                      meta={<>
                        <span className="inline-flex items-center gap-1"><MessageSquareText className="size-3.5" />{arNum(s.questions, isAr)} {t("questions", "سؤال")}</span>
                        <span className="inline-flex items-center gap-1"><Timer className="size-3.5" />~{arNum(s.minutes, isAr)} {t("min", "د")}</span>
                        <span className="inline-flex items-center gap-1"><Clock className="size-3.5" />{isAr ? s.dueAr : s.due}</span>
                      </>}
                      onOpen={() => navigate(`/surveys/${s.id}/respond`)} openLabel={t("Open", "فتح")} />
                  ))}
                  {live.length === 0 && awaiting.length === 0 && (
                    <EmptyState icon={CheckCircle2} title={t("All caught up", "أنجزت كل شيء")} desc={t("You've responded to every open survey.", "لقد أجبت على كل الاستبيانات المفتوحة.")} />
                  )}
                </>
              )}
            </div>
          </WCard>

          {/* results — 4352:14026 */}
          <WCard>
            <CardHead icon={BarChart3} title={t("Recent results", "أحدث النتائج")} />
            {loading ? <div className="mt-4 grid gap-4 md:grid-cols-2"><Skeleton className="h-[290px]" /><Skeleton className="h-[290px]" /></div>
              : results.length === 0 ? <EmptyState className="mt-4" icon={BarChart3} title={t("No results yet", "لا توجد نتائج بعد")} />
                : (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {results.map((c) => <ResultCard key={c.id} c={c} isAr={isAr} isAdmin={isAdmin} t={t} onDelete={() => setConfirm({ id: c.id, title: c.title })} />)}
                  </div>
                )}
          </WCard>
        </div>

        <aside className="flex min-w-0 flex-col gap-6">
          <PulseCard isAr={isAr} t={t} />
          <WCard>
            <CardHead icon={TrendingUp} title={t("Participation", "المشاركة")} />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Stat icon={ClipboardList} value={arNum(awaiting.length, isAr)} label={t("Awaiting you", "بانتظارك")} />
              <Stat icon={CheckCircle2} value={arNum(completed.size, isAr)} label={t("Completed", "مكتملة")} />
              <Stat icon={TrendingUp} value={`${arNum(avgParticipation, isAr)}%`} label={t("Org participation", "مشاركة المؤسسة")} />
              <Stat icon={Clock} value={arNum(awaiting.filter((s) => s.closingSoon).length, isAr)} label={t("Closing soon", "تُغلق قريبًا")} />
            </div>
          </WCard>
        </aside>
      </div>

      <SurveyCreateModal open={creating} onClose={() => setCreating(false)} isAr={isAr} />
      <DeletePopup open={!!confirm} onClose={() => setConfirm(null)} isAr={isAr}
        title={t("Delete this survey?", "هل تريد حذف هذا الاستبيان؟")}
        body={t("It will be removed from the portal permanently, with its results. This can't be undone.", "سيُحذف نهائيًا من البوابة مع نتائجه، ولا يمكن التراجع عن هذا الإجراء")}
        confirmLabel={t("Delete survey", "حذف الاستبيان")}
        onConfirm={() => { if (confirm) { if (confirm.created) removeCreatedSurvey(confirm.id); else setHidden((h) => [...h, confirm.id]) } setConfirm(null) }} />
    </WPage>
  )
}

function ListRow({ icon: Icon, title, tags, meta, onOpen, openLabel, action, isAr }: {
  icon: typeof Users; title: string; tags: React.ReactNode; meta: React.ReactNode; isAr: boolean
  onOpen?: () => void; openLabel?: string; action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg bg-background p-4">
      <div className="flex items-start gap-3">
        <span className="accent-chip grid size-[34px] shrink-0 place-items-center rounded-lg"><Icon className="size-4" /></span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">{tags}</div>
          <h3 className="mt-2 text-[14px] font-medium leading-5">{title}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">{meta}</div>
        </div>
      </div>
      {(onOpen || action) && (
        <div className="flex items-center justify-end gap-2 border-t border-secondary pt-3">
          {action}
          {onOpen && (
            <button type="button" onClick={onOpen} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:underline">
              {openLabel}<DirChevron dir="forward" isAr={isAr} className="size-4" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function ResultCard({ c, isAr, isAdmin, t, onDelete }: { c: ClosedSurvey; isAr: boolean; isAdmin: boolean; t: (en: string, ar: string) => string; onDelete: () => void }) {
  const exportXlsx = () => downloadCsv(`${c.title}.csv`, [
    [t("Answer", "الإجابة"), "%"],
    ...c.breakdown.map((b) => [isAr ? b.labelAr : b.label, b.pct]),
    [t("Responses", "الردود"), c.responses],
  ])
  return (
    <div className="flex flex-col gap-4 rounded-lg bg-background p-4">
      <div className="flex items-center gap-3">
        <Tag>{t("Surveys", "الاستبيانات")}</Tag>
        <span className="text-[11px] text-muted-foreground">{isAr ? c.closedAr : c.closed}</span>
      </div>
      <div>
        <h3 className="text-[15px] font-medium leading-6">{isAr ? c.titleAr : c.title}</h3>
        <p className="mt-0.5 text-[12px] text-primary">{isAr ? c.headlineAr : c.headline}</p>
      </div>
      <div className="flex flex-col gap-4">
        {c.breakdown.map((b) => <ResultBar key={b.label} label={isAr ? b.labelAr : b.label} pct={b.pct} />)}
      </div>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
        <span className="text-[11px] text-muted-foreground">{arNum(c.responses, isAr)} {t("participations", "مشاركة")} · {arNum(c.participation, isAr)}%</span>
        {isAdmin && (
          <div className="flex items-center gap-4">
            <WButton className="px-6" onClick={exportXlsx}><Download />{t("Export to Excel", "تصدير إلى إكسل")}</WButton>
            <WButton variant="danger" className="w-[84px]" onClick={onDelete}><Trash2 />{t("Delete", "حذف")}</WButton>
          </div>
        )}
      </div>
    </div>
  )
}

/** Live poll — voting (3807:10057) then results (3807:9948). */
function PulseCard({ isAr, t }: { isAr: boolean; t: (en: string, ar: string) => string }) {
  const [pick, setPick] = React.useState<string | null>(null)
  const [vote, setVote] = React.useState<string | null>(null)
  const total = pulsePoll.options.reduce((s, o) => s + o.votes, 0) + (vote ? 1 : 0)
  const pct = (id: string, votes: number) => Math.round(((votes + (vote === id ? 1 : 0)) / total) * 100)
  return (
    <WCard className="px-4 sm:px-4">
      <CardHead icon={BadgeCheck} title={vote ? t("Poll results", "نتائج التصويت") : t("Voting", "التصويت")} />
      <div className="mt-4 flex flex-col gap-4 rounded-lg bg-background p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Tag>{isAr ? pulsePoll.deptAr : pulsePoll.dept}</Tag>
          <span className="text-[11px] text-muted-foreground">{isAr ? pulsePoll.whenAr : pulsePoll.when}</span>
        </div>
        <h3 className="text-[15px] font-medium leading-6">{isAr ? pulsePoll.questionAr : pulsePoll.question}</h3>
        {vote ? (
          <div className="flex flex-col gap-4">
            {pulsePoll.options.map((o) => <ResultBar key={o.id} label={isAr ? o.labelAr : o.label} pct={pct(o.id, o.votes)} radio selected={vote === o.id} />)}
          </div>
        ) : (
          <>
            <div role="radiogroup" className="flex flex-col gap-3">
              {pulsePoll.options.map((o) => (
                <button key={o.id} type="button" role="radio" aria-checked={pick === o.id} onClick={() => setPick(o.id)} className="flex items-center gap-2 text-start text-[13px]">
                  <RadioDot on={pick === o.id} />{isAr ? o.labelAr : o.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">{t("Choose an answer, then press “Vote” to see the results", "اختر إجابة ثم اضغط «تصويت» لعرض النتائج")}</p>
          </>
        )}
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-[11px] text-muted-foreground">{arNum(total, isAr)} {t("participations", "مشاركة")}</span>
          {!vote && <WButton className="w-[130px]" disabled={!pick} onClick={() => setVote(pick)}>{t("Vote", "تصويت")}</WButton>}
        </div>
      </div>
    </WCard>
  )
}

function Stat({ icon: Icon, value, label }: { icon: typeof Users; value: string; label: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-background p-3">
      <span className="accent-chip grid size-7 place-items-center rounded-md"><Icon className="size-3.5" /></span>
      <span className="text-[20px] font-bold leading-none tabular-nums">{value}</span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  )
}
