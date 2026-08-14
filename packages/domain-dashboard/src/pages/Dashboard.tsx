import * as React from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

import { Avatar, AvatarFallback, Badge, Button, Card, Input } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  Briefcase, Car, CheckCheck, ChevronLeft, ChevronRight, Clock, Crown, FileText, Headset, Inbox, Luggage,
  Mail, MapPin, Plane, Plus, Presentation, Sofa, Sparkles, Sun, UserPlus, Users, Utensils, Video,
} from "lucide-react"

import {
  activeTasks, agenda, aiSuggestions, announcement, inbox, kpiPills, myTasks, nextMeeting,
  pendingApprovals, person, projects, type ProjStatus, quickServices,
} from "../data/mock/home"

const KPI_ICONS: Record<string, React.ComponentType<{ className?: string }>> = { check: CheckCheck, inbox: Inbox, mail: Mail, briefcase: Briefcase }
const APPROVAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = { file: FileText, user: UserPlus, car: Car }
const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  car: Car, luggage: Luggage, sofa: Sofa, users: Users, presentation: Presentation, crown: Crown, headset: Headset, plane: Plane,
}

/** Section heading with the design's short gold underline. */
function SectionTitle({ children, meta }: { children: React.ReactNode; meta?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div>
        <h2 className="font-heading text-[15px] font-semibold leading-tight">{children}</h2>
        <span className="mt-1.5 block h-[3px] w-8 rounded-full bg-primary" />
      </div>
      {meta && <div className="shrink-0 text-[11px] text-muted-foreground">{meta}</div>}
    </div>
  )
}

function statusMeta(s: ProjStatus, isAr: boolean) {
  if (s === "onTrack") return { label: isAr ? "في الموعد" : "On track", chip: "border-emerald-500/35 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500" }
  if (s === "slight") return { label: isAr ? "متأخر قليلاً" : "Slightly late", chip: "border-amber-500/35 bg-amber-500/10 text-amber-600 dark:text-amber-400", bar: "bg-amber-500" }
  return { label: isAr ? "متأخر" : "Late", chip: "border-rose-500/35 bg-rose-500/10 text-rose-600 dark:text-rose-400", bar: "bg-rose-500" }
}

export default function Dashboard() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const [tasks, setTasks] = React.useState(myTasks)
  const [ask, setAsk] = React.useState("")

  const doneCount = tasks.filter((x) => x.done).length
  const toggleTask = (id: string) => setTasks((ts) => ts.map((x) => (x.id === id ? { ...x, done: !x.done } : x)))

  return (
    // @container: columns respond to the real content width, not the viewport —
    // the sidebar and AI panel take ~320px, so viewport breakpoints lie.
    <div className="@container mx-auto max-w-[1500px] space-y-5 px-4 py-6 md:px-8">
      {/* ── greeting + next meeting ── */}
      <div className="grid items-start gap-5 @3xl:grid-cols-[minmax(0,1fr)_340px]">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="flex flex-wrap items-center gap-3 text-[13px]">
            <span className="font-medium text-primary">{t("Good morning", "صباح الخير")}</span>
            <span className="h-px w-8 bg-border" />
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Sun className="size-4 text-primary" />{isAr ? person.cityAr : person.city} {person.temp}°
            </span>
          </div>
          <h1 className="mt-2 font-heading text-[32px] font-bold leading-[1.1] tracking-tight md:text-[40px]">
            {isAr ? person.nameAr : person.name}
          </h1>
          <p className="mt-1.5 text-[13px] text-muted-foreground">{isAr ? person.dateLabelAr : person.dateLabel}</p>

          {/* AI ask bar */}
          <div className="mt-5">
            <div className="relative">
              <Sparkles className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-primary" />
              <Input
                value={ask}
                onChange={(e) => setAsk(e.target.value)}
                placeholder={t("How can I help? Ask me anything…", "كيف يمكنني مساعدتك؟ اطرح أي استفسار...")}
                className="h-14 rounded-2xl ps-11 pe-24 text-[14px]"
              />
              <span className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 rounded-md border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground">⌘L</span>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {aiSuggestions.map((s) => (
                <button key={s.en} className="rounded-full border border-border bg-card px-3.5 py-1.5 text-[12px] text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground">
                  {isAr ? s.ar : s.en}
                </button>
              ))}
            </div>
          </div>

          {/* KPI pills */}
          <div className="mt-4 flex flex-wrap gap-2.5">
            {kpiPills.map((k) => {
              const Icon = KPI_ICONS[k.icon] ?? CheckCheck
              const body = (
                <>
                  <Icon className="size-4 text-primary" />
                  <span className="text-[12.5px] text-muted-foreground">{isAr ? k.ar : k.label}</span>
                  <span className="text-[14px] font-bold tabular-nums">{k.value}</span>
                </>
              )
              const base = "inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2"
              // pills that map to a page are clickable and deep-link to the right tab
              return k.to ? (
                <button key={k.id} type="button" onClick={() => navigate(k.to!)}
                  className={cn(base, "cursor-pointer transition-colors hover:border-primary/50 hover:bg-primary/[0.04]")}>
                  {body}
                </button>
              ) : (
                <div key={k.id} className={base}>{body}</div>
              )
            })}
          </div>
        </motion.div>

        {/* next meeting */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.08 }}>
          <Card className="p-5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[12px] text-muted-foreground">{t("Your next meeting", "اجتماعك القادم")}</span>
              <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-primary">
                <Clock className="size-3.5" />{t(`in ${nextMeeting.inMinutes} min`, `بعد ${nextMeeting.inMinutes} دقيقة`)}
              </span>
            </div>
            <h3 className="mt-2.5 font-heading text-[20px] font-semibold">{isAr ? nextMeeting.titleAr : nextMeeting.title}</h3>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Clock className="size-3.5" />{isAr ? nextMeeting.timeAr : nextMeeting.time}</span>
              <span>· {nextMeeting.minutes} {t("min", "دقيقة")}</span>
              <span className="inline-flex items-center gap-1"><Video className="size-3.5" />{nextMeeting.platform}</span>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <Button className="gap-1.5"><Video className="size-4" />{t("Join", "دخول")}</Button>
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-2">
                  {nextMeeting.attendees.map((a) => (
                    <Avatar key={a} className="size-8 ring-2 ring-card"><AvatarFallback className="bg-primary/12 text-[10px] font-bold text-primary">{a}</AvatarFallback></Avatar>
                  ))}
                </div>
                <span className="text-[12px] text-muted-foreground">+{nextMeeting.more}</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ── agenda · inbox · tasks · approvals ── */}
      <div className="grid gap-5 @2xl:grid-cols-2 @6xl:grid-cols-4">
        {/* daily agenda */}
        <Card className="p-5">
          <SectionTitle meta={`${agenda.length} ${t("appointments", "مواعيد")}`}>{t("Daily agenda", "جدول الأعمال اليومي")}</SectionTitle>
          <div className="space-y-4">
            {agenda.map((a) => (
              <div key={a.time} className="relative ps-6">
                <span className={cn("absolute start-0 top-1.5 size-2 rounded-full", a.now ? "bg-primary" : "bg-muted-foreground/30")} />
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-medium tabular-nums text-muted-foreground">{a.time}</span>
                  <span className="text-[13px] font-semibold">{isAr ? a.titleAr : a.title}</span>
                  {a.now && <Badge className="bg-primary/15 text-[10px] text-primary">{t("Now", "الآن")}</Badge>}
                </div>
                <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                  {isAr ? a.placeAr : a.place}{a.mins ? ` · ${a.mins} ${t("min", "دقيقة")}` : ""}
                </div>
                <span className={cn("mt-1.5 inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px]",
                  a.mode === "zoom" ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground")}>
                  {a.mode === "zoom" ? <><Video className="size-3" />{t("Now on Zoom", "الآن على Zoom")}</>
                    : a.mode === "meal" ? <><Utensils className="size-3" />{t("On site", "حضوري")}</>
                      : <><MapPin className="size-3" />{t("On site", "حضوري")}</>}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* inbox */}
        <Card className="p-5">
          <SectionTitle meta={`${inbox.filter((m) => m.unread).length} ${t("unread", "غير مقروء")}`}>{t("Inbox", "صندوق البريد")}</SectionTitle>
          <div className="divide-y divide-border/60">
            {inbox.map((m) => (
              <div key={m.id} className="flex items-center gap-2.5 py-2.5 first:pt-0">
                <Avatar className="size-8 shrink-0"><AvatarFallback className="bg-muted text-[10px] font-semibold">{m.initials}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {m.unread && <span className="size-1.5 shrink-0 rounded-full bg-primary" />}
                    <span className="truncate text-[12.5px] font-semibold">{isAr ? m.nameAr : m.name}</span>
                  </div>
                  <div className="truncate text-[11.5px] text-muted-foreground">{isAr ? m.subjectAr : m.subject}</div>
                </div>
                <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground/70">{isAr ? m.timeAr : m.time}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* my tasks */}
        <Card className="p-5">
          <SectionTitle meta={
            <span className="inline-flex items-center gap-2">
              {doneCount} {t("of", "من")} {tasks.length}
              <Button size="xs" className="gap-1"><Plus className="size-3" />{t("New task", "مهمة جديدة")}</Button>
            </span>
          }>{t("My tasks", "مهامي")}</SectionTitle>
          <div className="divide-y divide-border/60">
            {tasks.slice(0, 6).map((x) => (
              <button key={x.id} onClick={() => toggleTask(x.id)} className="flex w-full items-start gap-2.5 py-2.5 text-start first:pt-0">
                <span className={cn("mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border transition-colors", x.done ? "border-primary bg-primary" : "border-muted-foreground/40")}>
                  {x.done && <CheckCheck className="size-2.5 text-primary-foreground" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block truncate text-[12.5px] font-medium", x.done && "text-muted-foreground line-through")}>{isAr ? x.titleAr : x.title}</span>
                  <span className="block text-[11px] text-muted-foreground">{isAr ? x.deptAr : x.dept}</span>
                </span>
                <span className="shrink-0 text-[11px] text-muted-foreground/70">{isAr ? x.dueAr : x.due}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* pending approvals */}
        <Card className="p-5">
          <SectionTitle meta={`${pendingApprovals.length} ${t("decisions", "قرارات")}`}>{t("Pending approvals", "الموافقات المعلقة")}</SectionTitle>
          <div className="space-y-2.5">
            {pendingApprovals.map((a) => {
              const Icon = APPROVAL_ICONS[a.icon] ?? FileText
              return (
                <div key={a.id} className="rounded-xl border border-border bg-muted/20 p-3">
                  <div className="flex items-start gap-2.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/12 text-primary"><Icon className="size-4" /></span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[12.5px] font-semibold leading-snug">{isAr ? a.titleAr : a.title}</div>
                      <div className="text-[11px] text-muted-foreground">{isAr ? a.metaAr : a.meta}</div>
                    </div>
                  </div>
                  {a.amount && <div className="mt-2 text-end text-[13px] font-bold tabular-nums">{isAr ? a.amountAr : a.amount}</div>}
                  <div className="mt-2 flex items-center justify-end gap-2">
                    <button className="text-[12px] text-muted-foreground hover:text-foreground">{t("Return", "إعادة")}</button>
                    <Button size="sm" className="gap-1"><CheckCheck className="size-3.5" />{t("Approve", "موافقة")}</Button>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* ── project completion · active tasks ── */}
      <div className="grid gap-5 @4xl:grid-cols-[1.5fr_minmax(0,1fr)]">
        <Card className="p-5">
          <SectionTitle meta={`${projects.length + 7} ${t("projects", "مشروع")} · Q3 2026`}>{t("Project completion", "إكتمال المشاريع")}</SectionTitle>
          <div className="divide-y divide-border/60">
            {projects.map((p) => {
              const m = statusMeta(p.status, isAr)
              return (
                <div key={p.id} className="grid items-center gap-3 py-3.5 first:pt-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto]">
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-semibold">{isAr ? p.nameAr : p.name}</div>
                    <div className="truncate text-[11.5px] text-muted-foreground">{isAr ? p.unitAr : p.unit} · {isAr ? p.ownerAr : p.owner}</div>
                  </div>
                  <div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${p.pct}%` }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className={cn("h-full rounded-full", m.bar)} />
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 text-[11px]">
                      <Badge variant="outline" className={cn("text-[10px]", m.chip)}>{m.label}</Badge>
                      {p.delta > 0 && <span className="text-muted-foreground">+{p.delta}% {t("this week", "هذا الأسبوع")}</span>}
                    </div>
                  </div>
                  <div className="text-end font-heading text-[22px] font-bold tabular-nums">{p.pct}%</div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle meta={
            <span className="inline-flex items-center gap-2">
              2 {t("of", "من")} {activeTasks.length}
              <Button size="xs" className="gap-1"><Plus className="size-3" />{t("New task", "مهمة جديدة")}</Button>
            </span>
          }>{t("Active tasks", "المهام النشطة")}</SectionTitle>
          <div className="divide-y divide-border/60">
            {activeTasks.map((x) => {
              const m = statusMeta(x.status, isAr)
              return (
                <div key={x.id} className="flex items-start justify-between gap-3 py-3 first:pt-0">
                  <div className="min-w-0">
                    <div className="truncate text-[12.5px] font-semibold">{isAr ? x.titleAr : x.title}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10.5px]">
                      <span className="text-muted-foreground">{isAr ? x.phaseAr : x.phase}</span>
                      <span className="text-muted-foreground/40">·</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">{isAr ? x.groupAr : x.group}</span>
                      <span className={cn("rounded-full border px-2 py-0.5", m.chip)}>{m.label}</span>
                    </div>
                  </div>
                  <span className="shrink-0 text-[12px] font-semibold tabular-nums text-muted-foreground">{x.pct}%</span>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* ── quick services · announcements ── */}
      <div className="grid gap-5 @4xl:grid-cols-[1.5fr_minmax(0,1fr)]">
        <Card className="p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h2 className="font-heading text-[15px] font-semibold leading-tight">{t("Quick links", "روابط سريعة")}</h2>
              <span className="mt-1.5 block h-[3px] w-8 rounded-full bg-primary" />
            </div>
            <Button variant="outline" size="sm" className="gap-1">{t("Edit", "تعديل")}<ChevronLeft className={cn("size-3.5", !isAr && "rotate-180")} /></Button>
          </div>
          {/* wrap rather than a fixed column count — the card is much narrower
              here than in the 1440px comp */}
          <div className="flex flex-wrap gap-x-3 gap-y-4">
            {quickServices.map((s) => {
              const Icon = SERVICE_ICONS[s.icon] ?? Car
              return (
                <button key={s.id} className="group flex w-[76px] flex-col items-center gap-2">
                  <span className="grid size-12 place-items-center rounded-full text-white shadow-sm transition-transform group-hover:scale-105" style={{ backgroundColor: s.tone }}>
                    <Icon className="size-5" />
                  </span>
                  <span className="text-center text-[10.5px] leading-tight text-muted-foreground group-hover:text-foreground">{isAr ? s.ar : s.label}</span>
                </button>
              )
            })}
          </div>
        </Card>

        <Card className="relative overflow-hidden p-0">
          <div className="absolute inset-0">
            <img src={announcement.img} alt="" className="h-full w-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20" />
          </div>
          <div className="relative flex h-full min-h-[300px] flex-col p-5">
            <div>
              <h2 className="font-heading text-[15px] font-semibold leading-tight text-white">{t("Announcements", "الإعلانات")}</h2>
              <span className="mt-1.5 block h-[3px] w-8 rounded-full bg-primary" />
            </div>
            <div className="mt-auto">
              <p className="font-heading text-[17px] font-semibold leading-snug text-white">{isAr ? announcement.titleAr : announcement.title}</p>
              <Button className="mt-3" onClick={() => navigate("/announcements")}>{t("View details", "عرض التفاصيل")}</Button>
            </div>
          </div>
          <button aria-label={t("Previous", "السابق")} className="absolute start-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white backdrop-blur transition-colors hover:bg-black/60"><ChevronLeft className="size-4" /></button>
          <button aria-label={t("Next", "التالي")} className="absolute end-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white backdrop-blur transition-colors hover:bg-black/60"><ChevronRight className="size-4" /></button>
        </Card>
      </div>
    </div>
  )
}
