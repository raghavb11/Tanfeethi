/** Local building blocks for the Operations & Performance pages, sized from the
 *  Figma specs (card 12px radius / 20·24 padding, 17px card titles with a 48×3
 *  gold underline, 34px buttons, 36px inputs, 12.5px table headers, 13.5px cells). */
import * as React from "react"
import { Link } from "react-router-dom"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { CalendarDays, ChevronDown, Inbox, Info } from "lucide-react"

import { ratingInfo, ratingScale, type Rating } from "../data/operations"
import { fmtDate, inputCls, useT } from "./helpers"

// ── layout ───────────────────────────────────────────────────────────────────
/** Page body: 32px top, 40px sides, 24px bottom, 40px between sections. */
export function Page({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex flex-col gap-10 px-4 pb-6 pt-8 md:px-10", className)}>{children}</div>
}

/** Figma card: Card/Fill/Primary + hairline, radius 12, padding 20/24. */
export function Panel({
  children,
  className,
  as: Tag = "section",
}: {
  children: React.ReactNode
  className?: string
  as?: "section" | "div"
}) {
  return <Tag className={cn("panel min-w-0 rounded-[12px] px-4 py-5 sm:px-6", className)}>{children}</Tag>
}

/** Card title (17px medium) with a 16px gold icon and a 48×3 gold underline; actions at the end. */
export function CardHeading({
  icon: Icon,
  title,
  actions,
  className,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  title: React.ReactNode
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-3", className)}>
      <div className="flex min-w-0 flex-col items-start gap-2">
        <h2 className="flex items-center gap-2 text-[17px] font-medium leading-[25.5px] text-foreground">
          <Icon className="size-4 shrink-0 text-primary" strokeWidth={1.8} />
          <span className="min-w-0">{title}</span>
        </h2>
        <span aria-hidden className="h-[3px] w-12 rounded-[2px] bg-primary" />
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}

// ── buttons ──────────────────────────────────────────────────────────────────
type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { size?: "md" | "sm" }

const btnBase =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[8px] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"

/** Button/Fill/Primary 50% — gold @80%, dark label. 34px (md) / 28px (sm). */
export function GoldButton({ size = "md", className, type = "button", ...props }: BtnProps) {
  return (
    <button
      type={type}
      className={cn(
        btnBase,
        "btn-primary-grad",
        size === "md" ? "h-[34px] px-6 text-[13px] font-semibold" : "h-7 px-3 text-xs font-semibold",
        className,
      )}
      {...props}
    />
  )
}

/** Outlined secondary button (Button/Stroke/Secondary). */
export function OutlineButton({ size = "md", className, type = "button", ...props }: BtnProps) {
  return (
    <button
      type={type}
      className={cn(
        btnBase,
        "border border-secondary text-foreground hover:bg-secondary/60",
        size === "md" ? "h-[34px] px-4 text-[13px] font-semibold" : "h-7 px-3 text-xs font-medium",
        className,
      )}
      {...props}
    />
  )
}

export function GoldLink({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) {
  return (
    <Link to={to} className={cn(btnBase, "btn-primary-grad h-[34px] px-6 text-[13px] font-medium", className)}>
      {children}
    </Link>
  )
}

// ── table (CSS grid so columns keep Figma's proportions; scrolls in its own box) ─
export function DataGrid({
  template,
  minWidth = 720,
  headers,
  children,
  className,
}: {
  template: string
  minWidth?: number
  headers: React.ReactNode[]
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("-mx-1 overflow-x-auto px-1", className)}>
      <div role="table" style={{ minWidth }}>
        <div
          role="row"
          className="grid items-end gap-x-2.5 border-b border-secondary pb-3 pt-2 text-[12.5px] leading-[18.75px] text-muted-foreground"
          style={{ gridTemplateColumns: template }}
        >
          {headers.map((h, i) => (
            <div role="columnheader" key={i} className="min-w-0 text-start">
              {h}
            </div>
          ))}
        </div>
        {children}
      </div>
    </div>
  )
}

export function GridRow({
  template,
  children,
  className,
}: {
  template: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      role="row"
      className={cn(
        "grid min-h-[63px] items-center gap-x-2.5 border-b border-secondary py-3.5 text-[13.5px] leading-[20.25px] text-foreground",
        className,
      )}
      style={{ gridTemplateColumns: template }}
    >
      {children}
    </div>
  )
}

export function Cell({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <div role="cell" className={cn("min-w-0 text-start", className)}>
      {children}
    </div>
  )
}

export function SkeletonRows({ template, cols, rows = 4 }: { template: string; cols: number; rows?: number }) {
  return (
    <div aria-busy="true">
      {Array.from({ length: rows }).map((_, r) => (
        <GridRow key={r} template={template}>
          {Array.from({ length: cols }).map((__, c) => (
            <Cell key={c}>
              <span className="block h-3.5 w-3/4 animate-pulse rounded bg-secondary" />
            </Cell>
          ))}
        </GridRow>
      ))}
    </div>
  )
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  body,
  action,
}: {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  body?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
      <span className="icon-tile size-10">
        <Icon className="size-5 text-icon" />
      </span>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {body && <p className="max-w-sm text-xs text-muted-foreground">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

/** "لا يوجد" when zero, red count otherwise (Status/Error/Text). */
export function NegativeCount({ n }: { n: number }) {
  const { t } = useT()
  if (n === 0) return <span>{t("None", "لا يوجد")}</span>
  return <span className="font-bold text-error">{n}</span>
}

export function InfoButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring outline-none"
    >
      <Info className="size-4" strokeWidth={1.6} />
    </button>
  )
}

// ── form controls ────────────────────────────────────────────────────────────
/** Label (13px semibold, 4px inset) above a control, 8px gap. */
export function Field({
  label,
  htmlFor,
  children,
  className,
  error,
}: {
  label: string
  htmlFor?: string
  children: React.ReactNode
  className?: string
  error?: string
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <label htmlFor={htmlFor} className="px-1 text-[13px] font-semibold leading-[15px] text-foreground rtl:leading-[17px]">
        {label}
      </label>
      {children}
      {error && <p className="px-1 text-xs text-error">{error}</p>}
    </div>
  )
}

export function SelectBox({
  id,
  value,
  onChange,
  options,
  placeholder,
  surface = "page",
  disabled,
  invalid,
  className,
  controlClassName,
  ariaLabel,
}: {
  id?: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  surface?: "page" | "card"
  disabled?: boolean
  invalid?: boolean
  className?: string
  /** Extra classes for the <select> itself (e.g. the read-only fill). */
  controlClassName?: string
  ariaLabel?: string
}) {
  return (
    <div className={cn("relative min-w-0", className)}>
      <select
        id={id}
        aria-label={ariaLabel}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={cn(inputCls(surface, invalid), "appearance-none pe-8", !value && "text-muted-foreground", controlClassName)}
      >
        {placeholder !== undefined && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-popover text-foreground">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute end-3 top-1/2 size-[13px] -translate-y-1/2 text-foreground" />
    </div>
  )
}

/** Date box: shows 2026/01/01 (or a placeholder) with a calendar icon at the end;
 *  the native picker opens on click. */
export function DateBox({
  id,
  value,
  onChange,
  placeholder,
  surface = "page",
  disabled,
  invalid,
  ariaLabel,
  min,
  className,
}: {
  id?: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  surface?: "page" | "card"
  disabled?: boolean
  invalid?: boolean
  ariaLabel?: string
  min?: string
  className?: string
}) {
  const ref = React.useRef<HTMLInputElement>(null)
  return (
    <div
      className={cn(inputCls(surface, invalid), "relative flex items-center justify-between gap-2", !disabled && "cursor-pointer", className)}
      onClick={() => {
        if (disabled) return
        try {
          ref.current?.showPicker?.()
        } catch {
          ref.current?.focus()
        }
      }}
    >
      <span className={cn("truncate", !value && "text-muted-foreground")}>{value ? fmtDate(value) : placeholder}</span>
      <CalendarDays aria-hidden className="size-[13px] shrink-0 text-foreground" strokeWidth={1.8} />
      <input
        ref={ref}
        id={id}
        type="date"
        aria-label={ariaLabel ?? placeholder}
        value={value}
        min={min}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="pointer-events-none absolute inset-0 h-full w-full opacity-0 [color-scheme:dark]"
        tabIndex={disabled ? -1 : 0}
      />
    </div>
  )
}

/** Multi-select with the Figma "Selection container" look:
 *  [count badge] [muted label] [first value] … [caret]. */
export function MultiSelect({
  label,
  options,
  value,
  onChange,
  allLabel,
  className,
  invalid,
}: {
  label: string
  options: { value: string; label: string }[]
  value: string[]
  onChange: (v: string[]) => void
  /** Shown when nothing is selected (e.g. "الكل"). */
  allLabel?: string
  className?: string
  invalid?: boolean
}) {
  const first = options.find((o) => o.value === value[0])?.label
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(inputCls("page", invalid), "flex items-center gap-[9px] text-start", className)}
        aria-label={label}
      >
        {value.length > 0 && (
          <span className="inline-flex size-[22px] shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
            {value.length}
          </span>
        )}
        <span className="shrink-0 text-[11.3px] font-normal text-muted-foreground">{label}</span>
        <span className="min-w-0 flex-1 truncate">{first ?? allLabel ?? ""}</span>
        <ChevronDown aria-hidden className="size-[13px] shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-48">
        {options.map((o) => (
          <DropdownMenuCheckboxItem
            key={o.value}
            checked={value.includes(o.value)}
            onCheckedChange={(checked) =>
              onChange(checked ? [...value, o.value] : value.filter((v) => v !== o.value))
            }
          >
            {o.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Compact filter select used above the evaluation logs: [muted label] [value] … [caret]. */
export function FilterSelect({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  className?: string
}) {
  const current = options.find((o) => o.value === value)?.label ?? ""
  return (
    <label className={cn(inputCls("page"), "relative flex cursor-pointer items-center gap-[9px]", className)}>
      <span className="shrink-0 text-[11.3px] font-normal text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1 truncate font-semibold">{current}</span>
      <ChevronDown aria-hidden className="size-[13px] shrink-0" />
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 cursor-pointer appearance-none opacity-0"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

/** 20px radio with the purple (Second Accent · Purple) 11px dot. */
export function Radio({
  name,
  checked,
  onChange,
  label,
  disabled,
}: {
  name: string
  checked: boolean
  onChange?: () => void
  label: string
  disabled?: boolean
}) {
  return (
    <label className={cn("inline-flex items-center gap-3 text-[13.5px] leading-[20.25px]", !disabled && "cursor-pointer")}>
      <input type="radio" name={name} checked={checked} onChange={onChange} disabled={disabled} className="peer sr-only" />
      <span
        aria-hidden
        className="inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-foreground p-px peer-focus-visible:ring-2 peer-focus-visible:ring-ring"
      >
        {checked && <span className="size-[11px] rounded-full bg-[#a997c7]" />}
      </span>
      <span>{label}</span>
    </label>
  )
}

// ── rating scale (one display everywhere: "score · label") ──────────────────
const toneCls = {
  success: "bg-success",
  info: "bg-info",
  warning: "bg-warning",
  error: "bg-error",
} as const

export function RatingText({ value }: { value: number | undefined }) {
  const { l, t } = useT()
  const info = ratingInfo(value === undefined ? undefined : Math.round(value))
  if (!info || value === undefined) return <span className="text-muted-foreground">{t("Not rated", "لم يُقيَّم")}</span>
  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden className={cn("size-2 shrink-0 rounded-full", toneCls[info.tone])} />
      <span className="tabular-nums">{value}</span>
      <span className="text-muted-foreground">·</span>
      <span>{l(info.label)}</span>
    </span>
  )
}

export function RatingSelect({
  value,
  onChange,
  ariaLabel,
  invalid,
}: {
  value: Rating | undefined
  onChange: (v: Rating) => void
  ariaLabel: string
  invalid?: boolean
}) {
  const { l, t } = useT()
  return (
    <SelectBox
      ariaLabel={ariaLabel}
      value={value ? String(value) : ""}
      onChange={(v) => onChange(Number(v) as Rating)}
      placeholder={t("Choose a rating", "اختر التقييم")}
      invalid={invalid}
      options={ratingScale.map((r) => ({ value: String(r.value), label: `${r.value} · ${l(r.label)}` }))}
    />
  )
}

/** Legend for the shared 1–5 scale, shown under review tables. */
export function RatingLegend() {
  const { l, t } = useT()
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
      <span>{t("Rating scale:", "مقياس التقييم:")}</span>
      {ratingScale.map((r) => (
        <span key={r.value} className="inline-flex items-center gap-1.5">
          <span aria-hidden className={cn("size-1.5 rounded-full", toneCls[r.tone])} />
          {r.value} · {l(r.label)}
        </span>
      ))}
    </div>
  )
}

/** Inline status banner (save confirmation / validation summary). */
export function Notice({ tone, children }: { tone: "success" | "error"; children: React.ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-[8px] px-4 py-3 text-[13px]",
        tone === "success" ? "bg-success-fill text-success" : "bg-error-fill text-error",
      )}
    >
      {children}
    </div>
  )
}
