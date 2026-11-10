/** Corporate-performance building blocks, in the measurements of the Figma
 *  "Final Design 1.0" screens (copied from the Operations / Services / Tasks kits —
 *  domains can't import each other): 12px cards, 17px card titles with a 48×3 gold
 *  underline, 80px KPI tiles, 34px buttons, 36px inputs, 12.5px table headers. */
import * as React from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { cn } from "@reach/shared-core"
import {
  Check, ChevronDown, ChevronLeft, ChevronRight, Cpu, Gauge, Inbox, Search, Sparkles, TrendingUp, UsersRound,
  type LucideIcon,
} from "lucide-react"

import { STATUS_LABEL, type Pillar, type Status } from "../data/performance"
import { STATUS_TONE, inputCls, useT } from "./helpers"

// ── layout ───────────────────────────────────────────────────────────────────
/** Page body: 32px top, 40px sides, 24px bottom, 40px between sections. */
export function Page({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex min-w-0 flex-col gap-10 px-4 pb-6 pt-8 md:px-10", className)}>{children}</div>
}

/** Main column + 400px side column (Operations hub split), 24px apart. */
export function Split({ main, side, className }: { main: React.ReactNode; side: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-6 xl:flex-row xl:items-start", className)}>
      <div className="flex min-w-0 flex-1 flex-col gap-6">{main}</div>
      <aside className="flex w-full min-w-0 shrink-0 flex-col gap-6 xl:w-[400px]">{side}</aside>
    </div>
  )
}

/** Figma card: Card/Fill/Primary + hairline, radius 12, padding 20/24. */
export function Panel({ children, className, id, as: Tag = "section", ...rest }: {
  children: React.ReactNode; className?: string; id?: string; as?: "section" | "div"
} & React.AriaAttributes) {
  return <Tag id={id} className={cn("panel min-w-0 rounded-xl px-4 py-5 sm:px-6", className)} {...rest}>{children}</Tag>
}

/** Card title (17px medium) with a 16px gold icon and a 48×3 gold underline; actions at the end. */
export function CardHeading({ icon: Icon, title, actions, className, id }: {
  icon: LucideIcon; title: React.ReactNode; actions?: React.ReactNode; className?: string; id?: string
}) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-3", className)}>
      <div className="flex min-w-0 flex-col items-start gap-2">
        <h2 id={id} className="flex items-center gap-2 text-[17px] font-medium leading-[25.5px] text-foreground">
          <Icon className="size-4 shrink-0 text-primary" strokeWidth={1.8} />
          <span className="min-w-0">{title}</span>
        </h2>
        <span aria-hidden className="h-[3px] w-12 rounded-[2px] bg-primary" />
      </div>
      {actions && <div className="flex min-w-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

// ── buttons ──────────────────────────────────────────────────────────────────
type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { size?: "md" | "sm" }
const btnBase =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"

/** Button/Fill/Primary — gold @80%, dark label. 34px (md) / 28px (sm). */
export function GoldButton({ size = "md", className, type = "button", ...props }: BtnProps) {
  return (
    <button
      type={type}
      className={cn(btnBase, "btn-primary-grad", size === "md" ? "h-[34px] px-6 text-[13px] font-semibold" : "h-7 px-4 text-xs font-medium", className)}
      {...props}
    />
  )
}

export function OutlineButton({ size = "md", className, type = "button", ...props }: BtnProps) {
  return (
    <button
      type={type}
      className={cn(btnBase, "border border-secondary text-foreground hover:bg-secondary/60", size === "md" ? "h-[34px] px-4 text-[13px] font-semibold" : "h-7 px-3 text-xs font-medium", className)}
      {...props}
    />
  )
}

export function GoldLink({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) {
  return <Link to={to} className={cn(btnBase, "btn-primary-grad h-7 px-4 text-xs font-medium", className)}>{children}</Link>
}

/** Chevron that points toward the inline end (mirrors in RTL). */
export function EndChevron({ className }: { className?: string }) {
  const { isAr } = useT()
  const I = isAr ? ChevronLeft : ChevronRight
  return <I className={cn("size-4 shrink-0 text-icon", className)} />
}

/** "‹ Corporate performance" back link above a detail header. */
export function BackLink({ to, children }: { to: string; children: React.ReactNode }) {
  const { isAr } = useT()
  const I = isAr ? ChevronRight : ChevronLeft
  return (
    <Link to={to} className="inline-flex items-center gap-1 rounded-md text-[12.5px] text-muted-foreground outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring">
      <I className="size-3.5" />
      {children}
    </Link>
  )
}

// ── status & progress ────────────────────────────────────────────────────────
/** Home "Projects" chip: full radius, 12px, Status fill + text. */
export function StatusChip({ status, className, label }: { status: Status | null; className?: string; label?: string }) {
  const { t, l } = useT()
  if (!status) {
    return <span className={cn("inline-flex shrink-0 rounded-full bg-secondary px-3 py-1 text-[12px] leading-none text-muted-foreground", className)}>{label ?? t("No data", "لا توجد بيانات")}</span>
  }
  return (
    <span className={cn("inline-flex shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-[12px] leading-none", STATUS_TONE[status].chip, className)}>
      {label ?? l(STATUS_LABEL[status])}
    </span>
  )
}

/** 4px progress bar (home Projects card) — the fill carries the status. */
export function ProgressBar({ value, status, className, tone, label }: {
  value: number | null; status: Status | null; className?: string; tone?: "gold"; label?: string
}) {
  const pct = Math.max(0, Math.min(100, value ?? 0))
  return (
    <span
      role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label={label}
      className={cn("block h-1 overflow-hidden rounded-full bg-secondary", className)}
    >
      <motion.span
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={cn("block h-full rounded-full", tone === "gold" ? "bg-primary" : status ? STATUS_TONE[status].bar : "bg-muted-foreground/40")}
      />
    </span>
  )
}

/** Single-value meter ring (Tasks hero donut proportions). The fill carries the status. */
export function Ring({ value, status, size = 124, stroke = 14, label, sub }: {
  value: number | null; status: Status | null; size?: number; stroke?: number; label?: string; sub?: string
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(100, value ?? 0))
  const color = status ? STATUS_TONE[status].color : "var(--muted-foreground)"
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${label ?? ""} ${value === null ? "—" : Math.round(pct) + "%"}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--secondary)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct / 100) }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-3 text-center">
        <span className={cn("font-semibold leading-none text-foreground", size >= 120 ? "text-[28px]" : "text-[20px]")}>
          {value === null ? "—" : `${Math.round(pct)}%`}
        </span>
        {sub && <span className="mt-1 text-[10px] leading-tight text-muted-foreground">{sub}</span>}
      </div>
    </div>
  )
}

/** Hero legend rows (Tasks hero): dot · label · value. */
export function Legend({ rows }: { rows: { label: string; value: React.ReactNode; dot: string }[] }) {
  return (
    <ul className="flex min-w-[130px] flex-col gap-[10px]">
      {rows.map((r) => (
        <li key={r.label} className="flex items-center gap-2 text-[11.5px] leading-[15px]">
          <span className={cn("size-2 shrink-0 rounded-full", r.dot)} />
          <span className="flex-1 text-foreground">{r.label}</span>
          <span className="ms-4 font-medium tabular-nums">{r.value}</span>
        </li>
      ))}
    </ul>
  )
}

// ── tiles ────────────────────────────────────────────────────────────────────
/** KPI tile: 80px, padding 16/18, 24px gold icon, 24px bold value, 11.5px label. */
export function KpiTile({ icon: Icon, value, label, to, end, inset }: {
  icon: LucideIcon; value: React.ReactNode; label: string; to?: string; end?: React.ReactNode; inset?: boolean
}) {
  const body = (
    <>
      <Icon className="size-6 shrink-0 text-primary" strokeWidth={1.6} />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-[24px] font-bold leading-8 text-foreground">{value}</span>
        <span className="truncate text-[11.5px] text-muted-foreground" title={label}>{label}</span>
      </span>
      {end}
    </>
  )
  const cls = cn(
    "flex min-h-20 min-w-0 items-center gap-3 rounded-xl px-[18px] py-4 text-start",
    inset ? "bg-background ring-1 ring-inset ring-[var(--card-ring)]" : "panel",
  )
  if (to) {
    return (
      <Link to={to} className={cn(cls, "outline-none transition-shadow hover:ring-1 hover:ring-primary/40 focus-visible:ring-2 focus-visible:ring-ring")}>
        {body}
      </Link>
    )
  }
  return <div className={cls}>{body}</div>
}

/** Ops-hub profile tile: 81px, 16px semibold value over an 11.5px label. */
export function InfoTile({ value, label, className }: { value: React.ReactNode; label: string; className?: string }) {
  return (
    <div className={cn("flex min-h-[81px] min-w-0 flex-col justify-center gap-0.5 rounded-xl bg-[var(--card-elevated)] px-[18px] py-4 ring-1 ring-inset ring-[var(--card-ring)]", className)}>
      <span className="truncate text-base font-semibold leading-8 text-foreground" dir="auto">{value}</span>
      <span className="text-[11.5px] text-muted-foreground">{label}</span>
    </div>
  )
}

/** Tasks-hero "work card selector": 81px, 32px status icon, value + hint, chevron. */
export function StatCard({ icon: Icon, tone, value, label, hint, onClick, pressed }: {
  icon: LucideIcon; tone: string; value: number; label: string; hint: string; onClick?: () => void; pressed?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className={cn(
        "group flex min-h-[81px] min-w-0 items-center gap-3 rounded-xl bg-[var(--card-elevated)] px-[18px] py-4 text-start ring-1 ring-inset transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
        pressed ? "ring-primary/60" : "ring-[var(--card-ring)] hover:ring-primary/40",
      )}
    >
      <Icon className={cn("size-8 shrink-0", tone)} strokeWidth={1.6} />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-[16px] font-semibold leading-8">{value} {label}</span>
        <span className="truncate text-[11.5px] text-muted-foreground">{hint}</span>
      </span>
      <EndChevron />
    </button>
  )
}

// ── avatars & pillars ────────────────────────────────────────────────────────
export function Initials({ text, className }: { text: string; className?: string }) {
  return (
    <span aria-hidden className={cn("inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-foreground", className)}>
      {text}
    </span>
  )
}

const PILLAR_ICON: Record<Pillar["icon"], LucideIcon> = {
  sparkles: Sparkles, gauge: Gauge, trending: TrendingUp, users: UsersRound, cpu: Cpu,
}

/** Category chip (Services kit): radius 6, 21px, 10px medium, gold dot. */
export function PillarChip({ pillar }: { pillar: Pillar }) {
  const { l } = useT()
  const Icon = PILLAR_ICON[pillar.icon]
  return (
    <span className="inline-flex h-[21px] shrink-0 items-center gap-1.5 rounded-md bg-soft-accent px-2 text-[10.5px] font-medium text-primary">
      <Icon className="size-3" strokeWidth={1.8} />
      {l(pillar.name)}
    </span>
  )
}

// ── table (CSS grid so columns keep their proportions; scrolls in its own box) ─
export function DataGrid({ template, minWidth = 720, headers, children, className, label }: {
  template: string; minWidth?: number; headers: React.ReactNode[]; children: React.ReactNode; className?: string; label?: string
}) {
  return (
    <div className={cn("-mx-1 overflow-x-auto px-1", className)}>
      <div role="table" aria-label={label} style={{ minWidth }}>
        <div role="row" className="grid items-end gap-x-3 border-b border-secondary pb-3 pt-2 text-[12.5px] leading-[18.75px] text-muted-foreground" style={{ gridTemplateColumns: template }}>
          {headers.map((h, i) => <div role="columnheader" key={i} className="min-w-0 text-start">{h}</div>)}
        </div>
        {children}
      </div>
    </div>
  )
}

const rowCls = "grid min-h-[63px] items-center gap-x-3 border-b border-secondary py-3.5 text-[13.5px] leading-[20.25px] text-foreground last:border-b-0"

export function GridRow({ template, children, className, to }: { template: string; children: React.ReactNode; className?: string; to?: string }) {
  if (to) {
    return (
      <Link role="row" to={to} className={cn(rowCls, "outline-none transition-colors hover:bg-foreground/[0.03] focus-visible:bg-foreground/[0.05] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring", className)} style={{ gridTemplateColumns: template }}>
        {children}
      </Link>
    )
  }
  return <div role="row" className={cn(rowCls, className)} style={{ gridTemplateColumns: template }}>{children}</div>
}

export function Cell({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <div role="cell" className={cn("min-w-0 text-start", className)}>{children}</div>
}

export function SkeletonRows({ template, cols, rows = 4 }: { template: string; cols: number; rows?: number }) {
  return (
    <div aria-busy="true">
      {Array.from({ length: rows }).map((_, r) => (
        <GridRow key={r} template={template}>
          {Array.from({ length: cols }).map((__, c) => (
            <Cell key={c}><span className="block h-3.5 w-3/4 animate-pulse rounded bg-secondary" /></Cell>
          ))}
        </GridRow>
      ))}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-xl bg-foreground/[0.06]", className)} />
}

export function EmptyState({ icon: Icon = Inbox, title, body, action, className }: {
  icon?: LucideIcon; title: string; body?: string; action?: React.ReactNode; className?: string
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 px-4 py-10 text-center", className)}>
      <span className="icon-tile size-10"><Icon className="size-5 text-icon" /></span>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {body && <p className="max-w-sm text-xs text-muted-foreground">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

// ── form controls (36px, radius 8, Page fill) ────────────────────────────────
/** Compact filter select: [muted label] [value] … [caret]. */
export function FilterSelect({ label, value, onChange, options, className, id }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; className?: string; id?: string
}) {
  const current = options.find((o) => o.value === value)?.label ?? ""
  return (
    <label className={cn(inputCls(), "relative flex cursor-pointer items-center gap-[9px] focus-within:ring-2 focus-within:ring-ring", className)}>
      <span className="shrink-0 text-[11.3px] font-normal text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1 truncate font-semibold">{current}</span>
      <ChevronDown aria-hidden className="size-[13px] shrink-0" />
      <select id={id} aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer appearance-none opacity-0">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  )
}

export function SearchBox({ value, onChange, placeholder, className }: {
  value: string; onChange: (v: string) => void; placeholder: string; className?: string
}) {
  return (
    <label className={cn("relative block", className)}>
      <Search aria-hidden className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-icon" strokeWidth={1.6} />
      <input
        type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder}
        className={cn(inputCls(), "ps-9")}
      />
    </label>
  )
}

export function Field({ label, htmlFor, error, hint, children, className }: {
  label: string; htmlFor?: string; error?: string; hint?: string; children: React.ReactNode; className?: string
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <label htmlFor={htmlFor} className="px-1 text-[13px] font-semibold leading-[17px] text-foreground">
        {label}
        {hint && <span className="ms-1.5 text-[11px] font-normal text-muted-foreground">{hint}</span>}
      </label>
      {children}
      {error && <span className="px-1 text-[11.5px] text-error">{error}</span>}
    </div>
  )
}

/** Leaderboard period tabs: 36px, 3px padding, radius 9, gold-tinted selection. */
export function Tabs<T extends string>({ value, onChange, options, label }: {
  value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; label: string
}) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex h-9 items-center gap-0.5 rounded-[9px] bg-card p-[3px] shadow-[inset_0_0_0_1px_var(--card-ring)]">
      {options.map((o) => (
        <button
          key={o.value} type="button" role="tab" aria-selected={value === o.value} onClick={() => onChange(o.value)}
          className={cn(
            "h-[30px] min-w-[68px] rounded-md px-3 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
            value === o.value ? "bg-soft-accent text-[13px] font-semibold text-primary" : "text-[13px] text-foreground hover:bg-secondary/60",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** Inline confirmation strip shown after a submit. */
export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div role="status" className="flex items-start gap-2 rounded-xl bg-success-fill px-4 py-3 text-[12.5px] text-success">
      <Check className="mt-px size-4 shrink-0" />
      <span>{children}</span>
    </div>
  )
}
