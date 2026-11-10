import * as React from "react"
import { cn } from "@reach/shared-core"
import { MenuNoMatches, MenuSearchInput, useMenuSearch } from "@reach/shared-ui"
import { useShell } from "@reach/shell-context"
import { Check, ChevronDown } from "lucide-react"

import { categoryById, STATUS_META, type TaskStatus } from "../data/meta"

/** Locale helpers every work screen needs. */
export function useT() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = React.useCallback((en: string, ar: string) => (isAr ? ar : en), [isAr])
  return { isAr, t }
}
export type TFn = (en: string, ar: string) => string

/** Page frame: Figma content padding 32 top · 40 sides · 24 bottom. */
export function Page({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <main className={cn("mx-auto w-full max-w-[1309px] px-4 pt-6 pb-6 sm:px-6 lg:px-10 lg:pt-8", className)}>
      {children}
    </main>
  )
}

/** Figma content card: Card/Fill/Primary, radius 12, padding 20 × 16. */
export function Panel({ children, className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...rest} className={cn("panel rounded-xl px-4 py-5", className)}>{children}</div>
}

/** Card heading: accent icon + 17px title, a 48 × 3 gold underline, actions at the end. */
export function CardHeader({ icon: Icon, title, actions, className }: {
  icon?: React.ComponentType<{ className?: string }>
  title: React.ReactNode
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div className="flex flex-col items-start gap-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="size-4 shrink-0 text-primary" />}
          <h2 className="text-[17px] font-medium leading-[25.5px] text-foreground">{title}</h2>
        </div>
        <span className="h-[3px] w-12 rounded-[2px] bg-primary" />
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

/** Round initials avatar (Avatar/Fill). */
export function Initials({ text, className }: { text: string; className?: string }) {
  return (
    <span className={cn("inline-flex size-[22px] shrink-0 items-center justify-center rounded-full bg-secondary text-[9px] font-semibold text-foreground", className)}>
      {text}
    </span>
  )
}

export const initialsOf = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase()

/** Department chip: radius 6, 10px label, a 5px dot. */
export function CategoryChip({ id, isAr, className }: { id?: string; isAr: boolean; className?: string }) {
  const c = categoryById(id)
  if (!c) return null
  return (
    <span className={cn("inline-flex h-[21px] shrink-0 items-center gap-1.5 rounded-md px-2 text-[10px] font-medium", c.chip, className)}>
      <span className={cn("size-[5px] rounded-full", c.dot)} />
      {isAr ? c.ar : c.en}
    </span>
  )
}

export function StatusDot({ status, className }: { status: TaskStatus; className?: string }) {
  return <span className={cn("size-2 shrink-0 rounded-full", STATUS_META[status].dot, className)} />
}

/** A ring chart over a set of slices, with the total in the hole. */
export function Donut({ slices, total, label, size = 124, stroke = 16, mirror }: {
  slices: { value: number; color: string }[]
  total: number
  label: string
  size?: number
  stroke?: number
  /** run the slices anticlockwise (the English frames draw the ring mirrored) */
  mirror?: boolean
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const sum = slices.reduce((s, x) => s + x.value, 0)
  let offset = 0
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: mirror ? "rotate(-90deg) scaleY(-1)" : "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--secondary)" strokeWidth={stroke} />
        {sum > 0 && slices.map((s, i) => {
          const len = (s.value / sum) * c
          const el = (
            <circle
              key={i} cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke={s.color} strokeWidth={stroke}
              strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset}
            />
          )
          offset += len
          return el
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[24px] font-semibold leading-none tabular-nums">{total}</span>
        <span className="mt-1 text-[10px] text-muted-foreground">{label}</span>
      </div>
    </div>
  )
}

/** Status legend beside a donut: dot · label … count. */
export function Legend({ rows }: { rows: { label: string; value: number; dot: string }[] }) {
  return (
    <ul className="flex min-w-[110px] flex-col gap-[10px]">
      {rows.map((r) => (
        <li key={r.label} className="flex items-center gap-2 text-[11.5px] leading-[15px]">
          <span className={cn("size-2 shrink-0 rounded-full", r.dot)} />
          <span className="flex-1 text-foreground">{r.label}</span>
          <span className="ms-6 font-medium tabular-nums">{r.value}</span>
        </li>
      ))}
    </ul>
  )
}

/** "115 حرف · 17 كلمة" under an editor. */
export function TextCounter({ text, isAr }: { text: string; isAr: boolean }) {
  const chars = text.length
  const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length
  return (
    <div className="flex items-center gap-2 text-[12px] leading-[20.25px] text-muted-foreground">
      <span>{isAr ? `${chars} حرف` : `${chars} characters`}</span>
      <span>·</span>
      <span>{isAr ? `${words} كلمة` : `${words} words`}</span>
    </div>
  )
}

export type Option = {
  value: string; label: string; hint?: React.ReactNode; lead?: React.ReactNode
  /** other-language name — matched by the menu search, not shown */
  alt?: string
}

/** Figma filter dropdown (h36 · radius 8 · Card/Fill · px 12 · gap 9):
 *  [leading mark] label  value ………… [count] ⌄ . Opens a small list inline. */
export function FilterSelect({ lead, label, value, options, onChange, count, className, ariaLabel, menuClassName, hideValue, triggerClassName, footer, searchable }: {
  lead?: React.ReactNode
  label?: string
  value: string
  options: Option[]
  onChange: (v: string) => void
  count?: React.ReactNode
  className?: string
  ariaLabel?: string
  menuClassName?: string
  /** Show only the label on the trigger (the header "Reassign" button). */
  hideValue?: boolean
  /** extra classes for the trigger button (height / fill overrides) */
  triggerClassName?: string
  /** a last row under the options (e.g. "Manage sprints"); clicking it closes the list */
  footer?: React.ReactNode
  /** search row at the top of the open list — always on for people / departments; defaults to on above 10 options */
  searchable?: boolean
}) {
  const { isAr } = useT()
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)
  const btnRef = React.useRef<HTMLButtonElement>(null)
  const enabled = searchable ?? options.length > 10
  const close = React.useCallback(() => setOpen(false), [])
  const s = useMenuSearch({
    items: options, texts: (o) => [o.label, o.alt], open, enabled,
    onPick: (o) => { onChange(o.value); setOpen(false); btnRef.current?.focus({ preventScroll: true }) },
    onClose: () => { setOpen(false); btnRef.current?.focus({ preventScroll: true }) },
  })
  React.useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) close() }
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close() }
    document.addEventListener("mousedown", onDoc)
    document.addEventListener("keydown", onKey)
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey) }
  }, [open, close])
  const current = options.find((o) => o.value === value)
  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        ref={btnRef}
        type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="listbox"
        aria-label={ariaLabel ?? label}
        className={cn("flex h-9 w-full items-center gap-[9px] rounded-[8px] bg-[var(--card-elevated)] ps-3 pe-3 text-start outline-none ring-1 ring-inset ring-[var(--card-ring)] transition-colors hover:ring-primary/40 focus-visible:ring-primary", triggerClassName)}
      >
        {lead}
        {label && <span className={cn("shrink-0 text-muted-foreground", hideValue ? "flex-1 text-[13.5px] text-foreground" : "text-[11.5px]")}>{label}</span>}
        {!hideValue && <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-foreground">{current?.label}</span>}
        {count !== undefined && <span className="shrink-0 text-[12px] tabular-nums text-muted-foreground">{count}</span>}
        <ChevronDown className={cn("size-[13px] shrink-0 text-icon transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div
          ref={(el) => { s.listRef.current = el }}
          className={cn("absolute inset-x-0 top-full z-30 mt-1 max-h-72 min-w-44 overflow-y-auto rounded-lg bg-popover p-1 shadow-lg ring-1 ring-[var(--card-ring)]", menuClassName)}
        >
          {enabled && <MenuSearchInput value={s.query} onChange={s.setQuery} onKeyDown={s.onKeyDown} isAr={isAr} />}
          <ul role="listbox">
            {s.results.map((o, i) => (
              <li key={o.value}>
                <button
                  type="button" role="option" aria-selected={o.value === value} data-menu-idx={i}
                  onMouseEnter={() => enabled && s.setActive(i)}
                  onClick={() => { onChange(o.value); setOpen(false) }}
                  className={cn("flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-start text-[12.5px] transition-colors hover:bg-soft-accent",
                    enabled && i === s.active && "bg-soft-accent",
                    o.value === value && "text-primary")}
                >
                  {o.lead}
                  <span className="min-w-0 flex-1 truncate">{o.label}</span>
                  {o.hint !== undefined && <span className="text-[11px] tabular-nums text-muted-foreground">{o.hint}</span>}
                  {o.value === value && <Check className="size-3.5 shrink-0" />}
                </button>
              </li>
            ))}
          </ul>
          {s.results.length === 0 && <MenuNoMatches isAr={isAr} />}
          {footer && (
            <div className="mt-1 border-t border-border pt-1" onClick={() => setOpen(false)}>{footer}</div>
          )}
        </div>
      )}
    </div>
  )
}

/** Small yes/no confirmation — the one dialog the build rules allow. */
export function ConfirmDialog({ open, title, body, confirm, cancel, onConfirm, onCancel }: {
  open: boolean
  title: string
  body?: string
  confirm: string
  cancel: string
  onConfirm: () => void
  onCancel: () => void
}) {
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel() }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onCancel])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="w-full max-w-[500px] rounded-2xl bg-[var(--card-elevated)] p-6 shadow-2xl ring-1 ring-[var(--card-ring)]">
        <h2 className="text-[18px] font-semibold">{title}</h2>
        {body && <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{body}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} className="h-9 rounded-lg border border-input px-4 text-[13.5px] font-medium hover:bg-foreground/5">{cancel}</button>
          <button onClick={onConfirm} autoFocus className="h-9 rounded-lg bg-error px-4 text-[13.5px] font-medium text-white hover:brightness-110">{confirm}</button>
        </div>
      </div>
    </div>
  )
}

/** Plain outline/neutral button at the Figma 34px height. */
export function Btn({ variant = "outline", className, children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "outline" | "primary" | "danger" | "ghost" | "soft"
}) {
  return (
    <button
      type="button" {...rest}
      className={cn(
        "inline-flex h-[34px] shrink-0 items-center justify-center gap-2 rounded-lg px-3.5 text-[13.5px] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
        variant === "outline" && "border border-input bg-transparent text-foreground hover:bg-foreground/5",
        variant === "primary" && "btn-primary-grad",
        variant === "danger" && "border border-input bg-transparent text-error hover:bg-error-fill",
        variant === "ghost" && "text-foreground hover:bg-foreground/5",
        variant === "soft" && "bg-soft-accent text-primary hover:bg-primary/25",
        className,
      )}
    >
      {children}
    </button>
  )
}

/** Empty / no-results block used inside panels and columns. */
export function Empty({ icon: Icon, text, action }: {
  icon: React.ComponentType<{ className?: string }>
  text: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <Icon className="size-8 text-muted-foreground/40" />
      <p className="text-[13px] text-muted-foreground">{text}</p>
      {action}
    </div>
  )
}

/** Mount-time skeleton for the first paint of a lazy page. */
export function useFirstPaint(ms = 250) {
  const [ready, setReady] = React.useState(false)
  React.useEffect(() => { const id = window.setTimeout(() => setReady(true), ms); return () => window.clearTimeout(id) }, [ms])
  return ready
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-foreground/[0.06]", className)} />
}
