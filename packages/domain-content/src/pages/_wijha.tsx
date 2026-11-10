/** WIJHA (Figma "Final Design 1.0") building blocks for the Knowledge /
 *  community pages. Values are the Figma ones (get_spec): cards r12 · p20/24,
 *  card titles 17 Medium with a 16px gold icon and a 48×3 gold underline,
 *  buttons h34 r8 13 SemiBold, inputs h36 r8, modals #2c2b2b r12 p24/32. */
import * as React from "react"
import { createPortal } from "react-dom"
import { useLocation } from "react-router-dom"
import { cn } from "@reach/shared-core"
import { MenuNoMatches, MenuSearchInput, SearchableSelect, useMenuSearch } from "@reach/shared-ui"
import { Check, ChevronDown, ChevronLeft, ChevronRight, CircleX, X } from "lucide-react"
import type { LucideIcon } from "lucide-react"

/** Capture helper: "#/route?as=admin" renders the admin view (as the Figma
 *  frames draw it) without switching the stored role. Normal use is unaffected. */
export function useAsAdmin(role: string) {
  const { search } = useLocation()
  return role === "admin" || new URLSearchParams(search).get("as") === "admin"
}

/* ── page + cards ─────────────────────────────────────────────────────────── */

/** Page content frame: 40px side padding, 32px top (Figma content frame). */
export function WPage({ className, children }: { className?: string; children: React.ReactNode }) {
  return <main className={cn("w-full px-4 pb-10 pt-6 sm:px-6 lg:px-10 lg:pt-8", className)}>{children}</main>
}

/** Figma card: Card/Fill/Primary, hairline ring, radius 12, padding 20/24. */
export function WCard({ className, children, ...rest }: React.HTMLAttributes<HTMLElement>) {
  return <section {...rest} className={cn("panel rounded-[12px] px-[18px] py-5 sm:px-6", className)}>{children}</section>
}

/** Card header: icon + 17px title, 48×3 underline beneath, actions at the end. */
export function CardHead({ icon: Icon, title, actions, tone = "gold", className }: {
  icon?: LucideIcon
  title: React.ReactNode
  actions?: React.ReactNode
  tone?: "gold" | "error"
  className?: string
}) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-3", className)}>
      <div className="flex min-w-0 flex-col items-start gap-2">
        <h2 className="flex min-w-0 items-center gap-2 text-[17px] font-medium leading-[25.5px]">
          {Icon && <Icon className={cn("size-4 shrink-0", tone === "error" ? "text-error" : "text-primary")} />}
          <span className="min-w-0 truncate">{title}</span>
        </h2>
        <span className={cn("h-[3px] w-12 rounded-[2px]", tone === "error" ? "bg-error" : "bg-primary")} />
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  )
}

/* ── buttons ──────────────────────────────────────────────────────────────── */

type BtnVariant = "primary" | "outline" | "danger" | "destructive" | "soft" | "secondary"
const BTN: Record<BtnVariant, string> = {
  primary: "btn-primary-grad",
  outline: "border border-secondary text-foreground hover:bg-secondary/60",
  danger: "border border-secondary text-error hover:bg-error-fill",
  destructive: "bg-[#b42318]/50 text-foreground ring-1 ring-error/40 hover:bg-[#b42318]/70",
  soft: "accent-chip hover:brightness-110",
  secondary: "bg-secondary text-foreground hover:brightness-110",
}

export function WButton({ variant = "primary", size = "md", className, children, type = "button", ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant
  size?: "sm" | "md"
}) {
  return (
    <button
      type={type}
      {...rest}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[8px] font-semibold transition-[filter,background-color,opacity] disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
        size === "sm" ? "h-7 px-3 text-[12px] [&_svg]:size-3" : "h-[34px] px-4 text-[13px] [&_svg]:size-4",
        BTN[variant],
        className,
      )}
    >
      {children}
    </button>
  )
}

/** 34px secondary square (card pager arrows, table actions). */
export function IconTile({ className, children, label, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button type="button" aria-label={label} title={label} {...rest}
      className={cn("icon-tile size-[34px] shrink-0 transition-[filter] hover:brightness-125 disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4", className)}>
      {children}
    </button>
  )
}

/** Outlined 34px square action (download / view / delete in the documents table). */
export function ActionTile({ tone = "neutral", className, children, label, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string; tone?: "neutral" | "error" }) {
  return (
    <button type="button" aria-label={label} title={label} {...rest}
      className={cn("grid size-[34px] shrink-0 place-items-center rounded-[8px] border border-secondary transition-colors [&_svg]:size-4",
        tone === "error" ? "text-error hover:bg-error-fill" : "text-foreground hover:bg-secondary/60", className)}>
      {children}
    </button>
  )
}

/** Reading-direction chevron: "forward" points left in Arabic, right in English.
 *  (Chosen in JS — a CSS rtl: rotate on the svg does not paint reliably.) */
export function DirChevron({ dir, isAr, className }: { dir: "forward" | "back"; isAr: boolean; className?: string }) {
  const Icon = (dir === "forward") !== isAr ? ChevronRight : ChevronLeft
  return <Icon className={className} />
}

/** Card pager — previous / next in reading order (chevrons mirror in RTL). */
export function Pager({ onPrev, onNext, prevDisabled, nextDisabled, isAr }: {
  onPrev: () => void; onNext: () => void; prevDisabled?: boolean; nextDisabled?: boolean; isAr: boolean
}) {
  return (
    <div className="flex items-center gap-4">
      {/* Figma draws both arrows at full strength, also at the ends of the list. */}
      <IconTile label={isAr ? "السابق" : "Previous"} onClick={onPrev} disabled={prevDisabled} className="disabled:opacity-100"><DirChevron dir="back" isAr={isAr} /></IconTile>
      <IconTile label={isAr ? "التالي" : "Next"} onClick={onNext} disabled={nextDisabled} className="disabled:opacity-100"><DirChevron dir="forward" isAr={isAr} /></IconTile>
    </div>
  )
}

/* ── tags / meta ──────────────────────────────────────────────────────────── */

const TAG: Record<string, string> = {
  gold: "accent-chip",
  rose: "bg-[#ce7a5b]/20 text-[#ce7a5b]",
  purple: "bg-[#a997c7]/20 text-[#a997c7]",
  green: "bg-success-fill text-success",
  muted: "bg-secondary text-muted-foreground",
  error: "bg-error-fill text-error",
}
export type TagTone = keyof typeof TAG
/** Figma tag: radius 4, 8px padding, 12px label. */
export function Tag({ tone = "gold", className, children }: { tone?: TagTone; className?: string; children: React.ReactNode }) {
  return <span className={cn("inline-flex h-[30px] shrink-0 items-center rounded px-2 text-[12px] font-medium", TAG[tone], className)}>{children}</span>
}

/** Map a content category to the tag tones the designs use (HR is rose gold). */
export function toneForCategory(cat: string): TagTone {
  const c = cat.toLowerCase()
  if (c === "hr" || c === "people" || c.includes("موارد")) return "rose"
  if (c === "it" || c === "technology") return "purple"
  if (c === "culture" || c === "events") return "green"
  return "gold"
}

/* ── form fields (modal + editor) ─────────────────────────────────────────── */

export const FIELD = "h-9 w-full min-w-0 rounded-[8px] bg-[var(--card-elevated)] px-3 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary/60"

export function Field({ label, children, className }: { label: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-2", className)}>
      <span className="px-1 text-[13px] font-semibold leading-[17px]">{label}</span>
      {children}
    </label>
  )
}

export function WInput({ className, ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...rest} className={cn(FIELD, className)} />
}

export function WTextarea({ className, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...rest} className={cn(FIELD, "h-auto min-h-9 resize-y py-2 leading-relaxed", className)} />
}

/** Native select styled as the Figma "Selection container" (chevron at the end). */
export function WSelect({ className, children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className={cn("relative block min-w-0", className)}>
      <select {...rest} className={cn(FIELD, "appearance-none pe-9")}>{children}</select>
      <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-icon" />
    </span>
  )
}

/** WSelect's closed field over a searchable list — for people, departments and lists that can pass ~10. */
export function WSearchSelect({ value, onChange, options, placeholder, isAr, className, disabled, searchable = true }: {
  value: string
  onChange: (v: string) => void
  /** `alt` = the other-language name, matched by the search but not shown */
  options: { value: string; label: string; alt?: string }[]
  placeholder?: string
  isAr?: boolean
  className?: string
  disabled?: boolean
  searchable?: boolean
}) {
  const current = options.find((o) => o.value === value)
  return (
    <SearchableSelect
      className={cn("block", className)} value={value} onChange={onChange} options={options} searchable={searchable} isAr={isAr} disabled={disabled}
      renderTrigger={({ triggerProps }) => (
        <>
          <button {...triggerProps} disabled={disabled} className={cn(FIELD, "flex items-center pe-9 text-start", !current && "text-muted-foreground")}>
            <span className="min-w-0 flex-1 truncate">{current?.label ?? placeholder ?? ""}</span>
          </button>
          <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-icon" />
        </>
      )}
    />
  )
}

/** Multi-select drawn as "الكل (4)": label + count badge + chevron; opens an
 *  inline checklist. Empty selection means everyone ("All"). */
export function CountSelect({ options, value, onChange, allLabel, isAr, className, searchable = true }: {
  /** `alt` = the other-language name, matched by the search but not shown */
  options: { id: string; label: string; alt?: string }[]
  value: string[]
  onChange: (ids: string[]) => void
  allLabel: string
  isAr: boolean
  className?: string
  /** search row at the top of the open list (departments / people) */
  searchable?: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)
  const btnRef = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [open])
  const all = value.length === 0 || value.length === options.length
  const count = all ? options.length : value.length
  const label = all ? allLabel : options.filter((o) => value.includes(o.id)).map((o) => o.label).join("، ")
  const toggle = (id: string) => {
    const base = all ? options.map((o) => o.id) : value
    const next = base.includes(id) ? base.filter((x) => x !== id) : [...base, id]
    onChange(next.length === options.length ? [] : next)
  }
  const s = useMenuSearch({
    items: options, texts: (o) => [o.label, o.alt], open, enabled: searchable,
    onPick: (o) => toggle(o.id),
    onClose: () => { setOpen(false); btnRef.current?.focus({ preventScroll: true }) },
  })
  const filtering = s.query.trim() !== ""
  return (
    <div ref={ref} className={cn("relative min-w-0", className)}>
      <button ref={btnRef} type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
        className={cn(FIELD, "flex items-center gap-[9px] pe-3 ps-2 text-start")}>
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-secondary text-[10px] font-medium text-primary tabular-nums">{count}</span>
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <ChevronDown className="size-4 shrink-0 text-icon" />
      </button>
      {open && (
        <div ref={(el) => { s.listRef.current = el }} className="absolute inset-x-0 z-40 mt-1 max-h-72 overflow-y-auto rounded-[8px] bg-[var(--card-elevated)] p-1 shadow-lg ring-1 ring-[var(--card-ring)]">
          {searchable && <MenuSearchInput value={s.query} onChange={s.setQuery} onKeyDown={s.onKeyDown} isAr={isAr} className="bg-[var(--card-elevated)]" />}
          {!filtering && (
            <button type="button" onClick={() => onChange([])} className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-start text-[13px] hover:bg-secondary">
              <span className={cn("grid size-4 place-items-center rounded border", all ? "border-primary bg-primary text-primary-foreground" : "border-border")}>{all && <Check className="size-3" />}</span>
              {allLabel}
            </button>
          )}
          {s.results.map((o, i) => {
            const on = all || value.includes(o.id)
            return (
              <button key={o.id} type="button" onClick={() => toggle(o.id)} data-menu-idx={i} onMouseEnter={() => s.setActive(i)}
                className={cn("flex w-full items-center gap-2 rounded-md px-2 py-2 text-start text-[13px] hover:bg-secondary", i === s.active && "bg-secondary")}>
                <span className={cn("grid size-4 place-items-center rounded border", on ? "border-primary bg-primary text-primary-foreground" : "border-border")}>{on && <Check className="size-3" />}</span>
                <span className="truncate">{o.label}</span>
              </button>
            )
          })}
          {s.results.length === 0 && <MenuNoMatches isAr={isAr} />}
          <p className="px-2 pb-1 pt-2 text-[11px] text-muted-foreground">{isAr ? "عدم التحديد يعني الجميع" : "No selection means everyone"}</p>
        </div>
      )}
    </div>
  )
}

/* ── modal (Figma popups: #2c2b2b, r12, p24/32, gap 24) ───────────────────── */

export function WModal({ open, onClose, title, icon, tone = "gold", width = 728, children, footer, isAr }: {
  open: boolean
  onClose: () => void
  title: React.ReactNode
  icon?: LucideIcon
  tone?: "gold" | "error"
  width?: number
  children?: React.ReactNode
  footer?: React.ReactNode
  isAr: boolean
}) {
  const boxRef = React.useRef<HTMLDivElement>(null)
  // Focus the dialog itself on open (screen readers land in it; no field shows a
  // focus ring at rest, as in the frames).
  React.useEffect(() => { if (open) boxRef.current?.focus({ preventScroll: true }) }, [open])
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev }
  }, [open, onClose])
  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-10 backdrop-blur-[2px] sm:items-center"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div ref={boxRef} tabIndex={-1} role="dialog" aria-modal="true" dir={isAr ? "rtl" : "ltr"}
        className="flex w-full flex-col gap-6 rounded-[12px] bg-secondary px-5 py-6 text-foreground shadow-2xl outline-none sm:px-8"
        style={{ maxWidth: width }}>
        <div className="flex items-center justify-between gap-4 pb-3">
          <CardHead icon={icon} title={title} tone={tone} />
          <button type="button" onClick={onClose} aria-label={isAr ? "إغلاق" : "Close"} className="grid size-[34px] shrink-0 place-items-center rounded-[8px] text-foreground hover:bg-background/40">
            <X className="size-6" />
          </button>
        </div>
        {children}
        {footer && <div className="flex flex-wrap items-center gap-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

/** Outline button used inside modals (stroke = page fill on the #2c2b2b popup). */
export const MODAL_OUTLINE = "border-background hover:bg-background/40"

/** Figma "delete popup" (3670:8803). */
export function DeletePopup({ open, onClose, onConfirm, title, body, confirmLabel, isAr }: {
  open: boolean; onClose: () => void; onConfirm: () => void
  title: string; body: string; confirmLabel: string; isAr: boolean
}) {
  return (
    <WModal open={open} onClose={onClose} title={title} icon={CircleX} tone="error" width={500} isAr={isAr}
      footer={<>
        <WButton variant="destructive" className="px-6" onClick={onConfirm}>{confirmLabel}</WButton>
        <WButton variant="outline" className={MODAL_OUTLINE} onClick={onClose}>{isAr ? "إلغاء" : "Cancel"}</WButton>
      </>}>
      <p className="pb-2 text-[13px] font-semibold">{body}</p>
    </WModal>
  )
}

/** Drafts button with a count bubble (create modals footer). */
export function DraftsButton({ count, onClick, isAr }: { count: number; onClick?: () => void; isAr: boolean }) {
  return (
    <WButton variant="outline" className={MODAL_OUTLINE} onClick={onClick}>
      {isAr ? "المسودات" : "Drafts"}
      <span className="grid size-[18px] place-items-center rounded-full bg-foreground/70 text-[10px] font-semibold text-background tabular-nums">{count}</span>
    </WButton>
  )
}

/* ── results + states ─────────────────────────────────────────────────────── */

/** Result row: label · % and a 6px track (gold fill). */
export function ResultBar({ label, pct, selected, radio }: { label: string; pct: number; selected?: boolean; radio?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3 text-[13px]">
        <span className="flex items-center gap-2">
          {radio && <RadioDot on={!!selected} />}
          {label}
        </span>
        <span className="tabular-nums">{pct}%</span>
      </div>
      {/* 2441:5698 / 4352:14026 fill the bar from the left in both directions. */}
      <div dir="ltr" className="h-1.5 overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

/** Radio dot — the voted option is filled with the module accent (purple). */
export function RadioDot({ on }: { on: boolean }) {
  return (
    <span className={cn("grid size-4 shrink-0 place-items-center rounded-full border", on ? "border-module" : "border-icon")}>
      {on && <span className="size-2 rounded-full bg-module" />}
    </span>
  )
}

export function EmptyState({ icon: Icon, title, desc, action, className }: { icon: LucideIcon; title: string; desc?: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-2 rounded-[8px] bg-background px-6 py-10 text-center", className)}>
      <span className="icon-tile size-10 text-icon"><Icon className="size-5" /></span>
      <p className="mt-1 text-[14px] font-medium">{title}</p>
      {desc && <p className="max-w-sm text-[12px] text-muted-foreground">{desc}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-[8px] bg-secondary/70", className)} />
}

/** Short simulated load so list/card loading states are visible on first paint. */
export function useFakeLoading(ms = 350) {
  const [loading, setLoading] = React.useState(true)
  React.useEffect(() => { const id = window.setTimeout(() => setLoading(false), ms); return () => window.clearTimeout(id) }, [ms])
  return loading
}

/** Arabic-Indic digits for counts the designs print in Arabic (e.g. ١٢٨ مشاركة). */
export function arNum(n: number | string, isAr: boolean) {
  const s = String(n)
  return isAr ? s.replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]) : s
}

/** Download rows as a UTF-8 CSV that Excel opens directly ("Export to Excel"). */
export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n")
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
