import * as React from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

import { cn } from "@reach/shared-core"
import {
  BadgeCheck, Building2, Bus, CalendarDays, Car, Check, Clock3, Cog, Crown, DoorOpen, FileText,
  Handshake, Headset, Inbox, Kanban, Link2, ListChecks, Luggage, Mail, MailOpen, Megaphone, Plane, Plus,
  Presentation, Radio, Search, Sofa, SquareCheckBig, TrendingUp, User, UserPlus, Users, UsersRound, Video,
} from "lucide-react"

import {
  agenda, inbox, kpiTiles, type ApprovalStatus, type DueTone, type myTasks, pendingApprovals, type ProjStatus,
  projects, quickLinks,
} from "../../data/mock/home"
import { CardHeading, goldButton, HomeCard, outlineButton, thinScroll } from "./ui"

type Icon = React.ComponentType<{ className?: string; strokeWidth?: number }>
type T = (en: string, ar: string) => string

/* ── KPI tiles (164×81, padding 16/18, 24px gold icon, 24px bold value) ─── */

const KPI_ICONS: Record<string, Icon> = { projects: Kanban, mail: MailOpen, requests: Inbox, tasks: SquareCheckBig }

export function KpiTiles({ isAr }: { isAr: boolean }) {
  const navigate = useNavigate()
  return (
    <div className="grid grid-cols-2 gap-3 @lg:grid-cols-4 @lg:gap-6">
      {kpiTiles.map((k) => {
        const Ico = KPI_ICONS[k.icon] ?? SquareCheckBig
        return (
          <button
            key={k.id}
            type="button"
            onClick={() => k.to && navigate(k.to)}
            disabled={!k.to}
            className="panel flex h-[81px] items-center gap-3 rounded-xl px-[18px] py-4 text-start transition-colors enabled:hover:ring-1 enabled:hover:ring-primary/40 disabled:cursor-default"
          >
            <Ico className="size-6 shrink-0 text-primary" strokeWidth={1.6} />
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-[24px] font-bold leading-8 tabular-nums text-foreground">{k.value}</span>
              <span className="truncate text-[11.5px] text-muted-foreground">{isAr ? k.ar : k.label}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

/* ── Approvals (search · pending cards · under-review · all-done) ───────── */

const APPROVAL_ICONS: Record<string, Icon> = { file: FileText, user: UserPlus, car: Car }

export function ApprovalsCard({ isAr, t, className }: { isAr: boolean; t: T; className?: string }) {
  const [items, setItems] = React.useState(pendingApprovals)
  const [q, setQ] = React.useState("")

  const decide = (id: string) => setItems((xs) => xs.filter((x) => x.id !== id))
  const query = q.trim().toLowerCase()
  const visible = items.filter((a) =>
    !query || `${a.title} ${a.titleAr} ${a.meta} ${a.metaAr} ${a.keywords}`.toLowerCase().includes(query))

  return (
    <HomeCard className={cn("flex flex-col px-4 py-5", className)} aria-label={t("Approvals", "الموافقات")}>
      <CardHeading icon={BadgeCheck} title={t("Approvals", "الموافقات")} short />

      <div className="flex flex-col gap-4 pt-[18px]">
        <label className="flex h-[33px] items-center gap-2 rounded-lg bg-background pe-2 ps-3">
          <Search className="size-4 shrink-0 text-foreground" strokeWidth={1.6} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("Search people, approval type", "ابحث عن أشخاص، نوع الموافقات")}
            className="min-w-0 flex-1 bg-transparent text-[12px] leading-[18px] text-foreground outline-none placeholder:text-foreground"
          />
        </label>

        <div className="flex flex-col gap-4">
          {visible.map((a) => (
            <ApprovalItem key={a.id} a={a} isAr={isAr} t={t} onDecide={decide} />
          ))}
          {query && visible.length === 0 && (
            <p className="py-6 text-center text-[12.5px] text-muted-foreground">
              {t("No approvals match your search.", "لا توجد موافقات مطابقة لبحثك.")}
            </p>
          )}
        </div>

        {/* All-done state (Figma 2013:5689, 102px block): only once nothing is
            left awaiting a decision — items under review don't need one. */}
        {!query && !items.some((a) => a.status === "pending") && (
          <div className="flex flex-col items-center gap-2 pb-2 pt-6 text-center">
            <BadgeCheck className="size-5 text-primary" strokeWidth={1.8} />
            <div className="flex flex-col gap-0.5">
              <span className="text-[13.5px] leading-[21px] text-foreground">{t("All approvals reviewed", "تمّت مراجعة جميع الموافقات")}</span>
              <span className="text-[12.5px] leading-[19px] text-muted-foreground">
                {t("You've reviewed all your approvals. We'll notify you when a new request arrives.", "راجعت كل الموافقات لديك. سنُشعرك عند وصول طلب جديد.")}
              </span>
            </div>
          </div>
        )}
      </div>
    </HomeCard>
  )
}

function ApprovalItem({
  a, isAr, t, onDecide,
}: {
  a: (typeof pendingApprovals)[number]
  isAr: boolean
  t: T
  onDecide: (id: string) => void
}) {
  const Ico = APPROVAL_ICONS[a.icon] ?? FileText
  const status: ApprovalStatus = a.status
  return (
    <div className={cn("flex flex-col rounded-[10px] border border-border bg-background p-4", a.amount ? "gap-[11px]" : "gap-3.5")}>
      <div className="flex items-start gap-3">
        <span className="grid size-[30px] shrink-0 place-items-center rounded-lg border border-input bg-[linear-gradient(180deg,rgba(44,43,43,0.75),rgba(44,43,43,0.1))] text-foreground">
          <Ico className="size-[15px]" strokeWidth={1.6} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[14.5px] leading-[21.75px] text-foreground">{isAr ? a.titleAr : a.title}</div>
          <div className="mt-1 text-[12.5px] leading-[18.75px] text-muted-foreground">{isAr ? a.metaAr : a.meta}</div>
        </div>
        {status === "review" && (
          <span className="shrink-0 rounded-md bg-secondary px-2 py-1 text-[10.5px] leading-[13px] text-foreground">
            {t("Under Review", "قيد المراجعة")}
          </span>
        )}
      </div>
      {status === "pending" && (
        <>
          {a.amount && (
            <div className="text-[17px] leading-[25.5px] tracking-[0.17px] text-foreground">{isAr ? a.amountAr : a.amount}</div>
          )}
          <div className="flex items-center gap-10 pt-2">
            <button type="button" onClick={() => onDecide(a.id)} className={cn(goldButton, "h-[34px] flex-1 text-[13px] font-medium")}>
              {t("Approve", "موافقة")}
            </button>
            <button type="button" onClick={() => onDecide(a.id)} className={cn(outlineButton, "h-[34px] flex-1 text-[13px]")}>
              {t("Reject", "رفض")}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

/* ── My tasks ───────────────────────────────────────────────────────────── */

const TASK_ICONS: Record<string, Icon> = { gear: Cog, handshake: Handshake, bus: Bus, building: Building2, megaphone: Megaphone, users: Users }
const DUE_TONE: Record<DueTone, string> = {
  today: "font-bold text-error",
  tomorrow: "font-bold text-warning",
  later: "text-muted-foreground",
}

export function TasksCard({
  isAr, t, tasks, onToggle, className,
}: {
  isAr: boolean
  t: T
  tasks: typeof myTasks
  onToggle: (id: string) => void
  className?: string
}) {
  const navigate = useNavigate()
  return (
    <HomeCard className={cn("flex flex-col px-[18px] py-5", className)} aria-label={t("My tasks", "مهامي")}>
      <CardHeading icon={ListChecks} title={t("My tasks", "مهامي")}>
        <button type="button" onClick={() => navigate("/tasks/new")} className={cn(goldButton, "h-7 w-[108px] text-[12px]")}>
          <Plus className="size-3" strokeWidth={2.2} />
          {t("New task", "مهمة جديدة")}
        </button>
      </CardHeading>

      <div className={cn("mt-3.5 max-h-[420px] overflow-y-scroll pe-4", thinScroll)}>
        {tasks.map((x, i) => {
          const DeptIcon = TASK_ICONS[x.icon] ?? Cog
          return (
            <div key={x.id} className={cn("flex items-center gap-3 py-3.5", i < tasks.length - 1 && "border-b border-input")}>
              <button
                type="button"
                role="checkbox"
                aria-checked={x.done}
                aria-label={isAr ? x.titleAr : x.title}
                onClick={() => onToggle(x.id)}
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-full border transition-colors",
                  x.done ? "border-primary bg-primary text-primary-foreground" : "border-foreground/70 hover:border-primary",
                )}
              >
                {x.done && <Check className="size-[11px]" strokeWidth={3} />}
              </button>
              <div className="min-w-0 flex-1">
                <div className={cn("truncate text-[13.5px] leading-[20.25px] text-foreground", x.done && "text-muted-foreground line-through")}>
                  {isAr ? x.titleAr : x.title}
                </div>
                <div className="mt-[3px] flex items-center gap-1 text-[12px] leading-[18px] text-muted-foreground">
                  <DeptIcon className="size-3" strokeWidth={1.8} />
                  {isAr ? x.deptAr : x.dept}
                </div>
              </div>
              <span className={cn("shrink-0 text-[12px] leading-[18px]", DUE_TONE[x.tone])}>{isAr ? x.dueAr : x.due}</span>
            </div>
          )
        })}
        {tasks.length === 0 && (
          <p className="py-10 text-center text-[12.5px] text-muted-foreground">{t("No open tasks.", "لا توجد مهام مفتوحة.")}</p>
        )}
      </div>
    </HomeCard>
  )
}

/* ── Mail ───────────────────────────────────────────────────────────────── */

export function MailCard({ isAr, t, className }: { isAr: boolean; t: T; className?: string }) {
  const [all, setAll] = React.useState(false)
  const unread = inbox.filter((m) => m.unread).length
  return (
    <HomeCard className={cn("flex flex-col px-[18px] py-5", className)} aria-label={t("Mail", "البريد")}>
      <CardHeading
        icon={Mail}
        title={t("Mail", "البريد")}
        short
        middle={<span className="block text-[12px] leading-[18px] text-muted-foreground">{isAr ? `${unread} غير مقروء` : `${unread} unread`}</span>}
      >
        <button type="button" onClick={() => setAll((v) => !v)} className={cn(goldButton, "h-7 px-4 text-[12px]")}>
          {all ? t("Show less", "عرض أقل") : t("View All", "عرض الكل")}
        </button>
      </CardHeading>

      <div className={cn("mt-3 overflow-y-scroll pe-4", !all && "max-h-[407px]", thinScroll)}>
        {inbox.map((m, i) => (
          <div key={m.id} className={cn("flex items-center py-2", i < inbox.length - 1 && "border-b border-input")}>
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-[13px] text-foreground">
              {isAr ? m.initialAr : m.initial}
            </span>
            {/* Figma: a 20px column for the unread dot, level with the name */}
            <span className="flex w-5 shrink-0 justify-center self-start pt-[7px]">
              {m.unread && <span className="size-1.5 rounded-full bg-primary" aria-label={t("Unread", "غير مقروء")} />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13.5px] leading-[20.25px] text-foreground">{isAr ? m.nameAr : m.name}</div>
              <div className="mt-0.5 truncate text-[12.5px] leading-[19px] text-muted-foreground">{isAr ? m.subjectAr : m.subject}</div>
            </div>
            <span className="shrink-0 text-[12.5px] leading-[18px] tabular-nums text-muted-foreground">{isAr ? m.timeAr : m.time}</span>
          </div>
        ))}
      </div>
    </HomeCard>
  )
}

/* ── Agenda timeline ───────────────────────────────────────────────────── */

export function AgendaCard({ isAr, t, className }: { isAr: boolean; t: T; className?: string }) {
  return (
    <HomeCard className={cn("flex flex-col px-[18px] py-5", className)} aria-label={t("Agenda", "جدول الأعمال")}>
      <CardHeading icon={CalendarDays} title={t("Agenda", "جدول الأعمال")} short>
        <span className="text-[12px] text-muted-foreground">
          {isAr ? `${agenda.length} مواعيد` : `${agenda.length} appointments`}
        </span>
      </CardHeading>

      <div className={cn("mt-[18px] max-h-[393px] overflow-y-scroll pb-2 pe-1", thinScroll)}>
        <ol className="relative">
          {agenda.map((a, i) => (
            <li key={a.id} className="relative flex pb-8 last:pb-0">
              {/* time column (42) + dot column (20) + connecting line */}
              <span className="w-[42px] shrink-0 text-end text-[13px] leading-[19px] tabular-nums text-muted-foreground">{a.time}</span>
              <span className="relative flex w-5 shrink-0 justify-center">
                <span
                  className={cn(
                    "relative z-10 rounded-full",
                    a.now ? "mt-[5px] size-[9px] bg-primary shadow-[0_0_0_3px_rgba(188,153,81,0.25)]" : "mt-[5px] size-2 bg-secondary",
                  )}
                />
                {i < agenda.length - 1 && <span aria-hidden className="absolute top-[17px] -bottom-8 w-px bg-secondary" />}
              </span>
              <div className="min-w-0 flex-1 pe-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[15px] leading-[22px] text-foreground">{isAr ? a.titleAr : a.title}</span>
                  {a.now && (
                    <span className="inline-flex h-[19px] items-center gap-[3px] rounded-md bg-primary px-2 text-[10px] font-medium leading-4 text-primary-foreground">
                      <Radio className="size-2.5" strokeWidth={2} />
                      {t("Now", "الآن")}
                    </span>
                  )}
                </div>
                <div className={cn("flex h-[25px] flex-wrap items-start gap-x-3 gap-y-1 text-[13px] leading-[17px] text-muted-foreground", a.now ? "mt-1" : "mt-[5px]")}>
                  <span className="inline-flex items-center gap-1">
                    {a.mode === "zoom" ? <Video className="me-0 ms-1 size-3.5" strokeWidth={1.6} /> : <DoorOpen className="size-3.5" strokeWidth={1.6} />}
                    {isAr ? a.placeAr : a.place}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="size-3.5" strokeWidth={1.6} />
                    {isAr ? `${a.mins} دقيقة` : `${a.mins} min`}
                  </span>
                </div>
                {a.now && a.mode === "zoom" && (
                  <button
                    type="button"
                    className="mt-1 inline-flex h-[30px] items-center gap-[7px] rounded-lg border border-[#8f743e] px-[13px] text-[13px] leading-4 text-foreground transition-colors hover:bg-soft-accent"
                  >
                    <Video className="size-3.5 text-primary" strokeWidth={1.6} />
                    {t("Now on Zoom", "الآن على Zoom")}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </HomeCard>
  )
}

/* ── Projects progress ─────────────────────────────────────────────────── */

function statusMeta(s: ProjStatus, t: T) {
  if (s === "onTrack") return { label: t("On track", "في الموعد"), chip: "bg-success-fill text-success", bar: "bg-success" }
  if (s === "slight") return { label: t("Delayed", "متأخر"), chip: "bg-warning-fill text-warning", bar: "bg-warning" }
  return { label: t("Delayed", "متأخر"), chip: "bg-error-fill text-error", bar: "bg-error" }
}

export function ProjectsCard({ isAr, t, className }: { isAr: boolean; t: T; className?: string }) {
  const navigate = useNavigate()
  return (
    <HomeCard className={cn("flex flex-col px-6 py-5", className)} aria-label={t("Projects", "المشاريع")}>
      <CardHeading icon={TrendingUp} title={t("Projects", "المشاريع")} short />
      <div className="mt-2">
        {projects.map((p, i) => {
          const m = statusMeta(p.status, t)
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => navigate("/projects")}
              className={cn(
                "grid w-full items-center gap-x-6 gap-y-3 py-[18px] text-start @lg:grid-cols-[minmax(0,1fr)_minmax(0,345px)_78px]",
                "grid-cols-[minmax(0,1fr)_auto]",
                i < projects.length - 1 && "border-b border-input",
              )}
            >
              <span className="min-w-0">
                <span className="block truncate text-[15px] leading-[22px] text-foreground">{isAr ? p.nameAr : p.name}</span>
                <span className="mt-1 flex items-center gap-2 text-[13px] leading-[19px] text-muted-foreground">
                  <User className="ms-1 size-3" strokeWidth={1.6} />
                  {isAr ? p.ownerAr : p.owner}
                </span>
              </span>
              <span className="col-span-2 row-start-2 flex flex-col gap-3 @lg:col-span-1 @lg:row-start-auto">
                <span className="block h-1.5 overflow-hidden rounded-full bg-secondary">
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: `${p.pct}%` }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className={cn("block h-full rounded-full", m.bar)}
                  />
                </span>
                <span className="flex h-6 items-center gap-3.5 text-[12px]">
                  <span className={cn("rounded-full px-3 py-[3px] leading-[18px]", m.chip)}>{m.label}</span>
                  {p.delta > 0 && (
                    <span className="leading-[19px] text-muted-foreground">{isAr ? `${p.delta}%+ هذا الأسبوع` : `+${p.delta}% this week`}</span>
                  )}
                </span>
              </span>
              <span className="text-start text-[32px] leading-[45px] tabular-nums text-foreground">{p.pct}%</span>
            </button>
          )
        })}
      </div>
    </HomeCard>
  )
}

/* ── Links grid ────────────────────────────────────────────────────────── */

const LINK_ICONS: Record<string, Icon> = {
  users: UsersRound, presentation: Presentation, crown: Crown, headset: Headset, plane: Plane, car: Car, luggage: Luggage, sofa: Sofa,
}

export function LinksCard({ isAr, t, className }: { isAr: boolean; t: T; className?: string }) {
  const navigate = useNavigate()
  return (
    <HomeCard className={cn("flex flex-col gap-[22px] px-6 py-5", className)} aria-label={t("Links", "روابط")}>
      <CardHeading icon={Link2} title={t("Links", "روابط")} short />
      <div className="grid grid-cols-4 gap-x-3 gap-y-6 pb-2 @lg:grid-cols-[repeat(4,63.3px)] @lg:justify-between @lg:px-6">
        {quickLinks.map((l) => {
          const Ico = LINK_ICONS[l.icon] ?? Link2
          return (
            <button key={l.id} type="button" onClick={() => navigate(l.to)} className="group flex flex-col items-center gap-3">
              <span className="grid size-12 place-items-center rounded-full bg-secondary text-primary transition-transform group-hover:scale-105 @lg:size-[62px]">
                <Ico className="size-5 @lg:size-6" strokeWidth={1.5} />
              </span>
              <span className="text-center text-[11.5px] leading-tight text-foreground @lg:whitespace-nowrap @lg:text-[13px] @lg:leading-[18px]">{isAr ? l.ar : l.label}</span>
            </button>
          )
        })}
      </div>
    </HomeCard>
  )
}
