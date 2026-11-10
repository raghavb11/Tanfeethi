import * as React from "react"
import { Avatar, AvatarFallback, Card } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { Building2, Check, ChevronsUpDown, Plus, Search, Users, X } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { DEPARTMENTS } from "../data/departments"

export type Person = { id: string; name: string; nameAr: string; initials: string; email?: string; dept?: string; deptAr?: string }

/** Searchable single-person picker — type to filter by name or email.
 *  Opens inline under the trigger; never a modal. */
export function PersonPicker({ value, onChange, people, isAr, placeholder, searchPlaceholder, emptyLabel, clearLabel }: {
  value: string
  onChange: (id: string) => void
  people: Person[]
  isAr: boolean
  placeholder: string
  searchPlaceholder: string
  emptyLabel: string
  clearLabel: string
}) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const ref = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", onDoc)
    const id = window.setTimeout(() => inputRef.current?.focus(), 0)
    return () => { document.removeEventListener("mousedown", onDoc); window.clearTimeout(id) }
  }, [open])

  const selected = people.find((p) => p.id === value)
  const name = (p: Person) => (isAr ? p.nameAr : p.name)
  const q = query.trim().toLowerCase()
  const filtered = q
    ? people.filter((p) => name(p).toLowerCase().includes(q) || (p.email ?? "").toLowerCase().includes(q))
    : people
  const pick = (id: string) => { onChange(id); setOpen(false); setQuery("") }

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
        className="flex h-11 w-full items-center gap-2 rounded-lg border border-input bg-[var(--card-elevated)] px-3 text-start text-sm outline-none transition-colors focus:border-primary/60">
        {selected ? (
          <>
            <Avatar className="size-6 shrink-0"><AvatarFallback className="bg-primary/12 text-[9px] font-bold text-primary">{selected.initials}</AvatarFallback></Avatar>
            <span className="min-w-0 flex-1 truncate">{name(selected)}</span>
            <span role="button" tabIndex={0} aria-label={clearLabel}
              onClick={(e) => { e.stopPropagation(); onChange("") }}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); onChange("") } }}
              className="grid size-5 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground">
              <X className="size-3.5" />
            </span>
          </>
        ) : (
          <span className="min-w-0 flex-1 truncate text-muted-foreground">{placeholder}</span>
        )}
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder={searchPlaceholder}
              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {filtered.map((p) => (
              <button key={p.id} type="button" onClick={() => pick(p.id)}
                className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-start transition-colors hover:bg-muted">
                <Avatar className="size-7 shrink-0"><AvatarFallback className="bg-muted text-[10px] font-semibold">{p.initials}</AvatarFallback></Avatar>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium">{name(p)}</span>
                  {(p.email || p.dept) && <span className="block truncate text-[11px] text-muted-foreground">{[p.email, isAr ? p.deptAr : p.dept].filter(Boolean).join(" · ")}</span>}
                </span>
                {value === p.id && <Check className="size-4 shrink-0 text-primary" />}
              </button>
            ))}
            {filtered.length === 0 && <div className="px-2.5 py-6 text-center text-sm text-muted-foreground">{emptyLabel}</div>}
          </div>
        </div>
      )}
    </div>
  )
}

/** Searchable single-select over plain string options (departments, teams…).
 *  Accepts a free-typed value too, so existing data is never orphaned. */
export function SearchSelect({ value, onChange, options, placeholder, searchPlaceholder, emptyLabel, allowCustom = true }: {
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder: string
  searchPlaceholder: string
  emptyLabel: string
  allowCustom?: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const ref = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", onDoc)
    const id = window.setTimeout(() => inputRef.current?.focus(), 0)
    return () => { document.removeEventListener("mousedown", onDoc); window.clearTimeout(id) }
  }, [open])

  const q = query.trim()
  const filtered = q ? options.filter((o) => o.toLowerCase().includes(q.toLowerCase())) : options
  const canAddCustom = allowCustom && q.length > 0 && !options.some((o) => o.toLowerCase() === q.toLowerCase())
  const pick = (v: string) => { onChange(v); setOpen(false); setQuery("") }

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
        className="flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-input bg-[var(--card-elevated)] px-3 text-start text-sm outline-none transition-colors focus:border-primary/60">
        <span className={cn("truncate", !value && "text-muted-foreground")}>{value || placeholder}</span>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder={searchPlaceholder}
              onKeyDown={(e) => { if (e.key === "Enter" && canAddCustom) { e.preventDefault(); pick(q) } }}
              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {filtered.map((o) => (
              <button key={o} type="button" onClick={() => pick(o)}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-start text-sm transition-colors hover:bg-muted">
                <span className="size-4 shrink-0">{value === o && <Check className="size-4 text-primary" />}</span>
                <span className="truncate">{o}</span>
              </button>
            ))}
            {canAddCustom && (
              <button type="button" onClick={() => pick(q)}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-start text-sm text-primary transition-colors hover:bg-muted">
                <Plus className="size-4 shrink-0" /><span className="truncate">{q}</span>
              </button>
            )}
            {filtered.length === 0 && !canAddCustom && <div className="px-2.5 py-6 text-center text-sm text-muted-foreground">{emptyLabel}</div>}
          </div>
        </div>
      )}
    </div>
  )
}

/** Searchable multi-person picker — filter by name or email, tick several.
 *  Selected people show as removable chips under the trigger. */
export function PeopleMultiPicker({ value, onChange, people, isAr, placeholder, searchPlaceholder, emptyLabel }: {
  value: string[]
  onChange: (ids: string[]) => void
  people: Person[]
  isAr: boolean
  placeholder: string
  searchPlaceholder: string
  emptyLabel: string
}) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const ref = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", onDoc)
    const id = window.setTimeout(() => inputRef.current?.focus(), 0)
    return () => { document.removeEventListener("mousedown", onDoc); window.clearTimeout(id) }
  }, [open])

  const name = (p: Person) => (isAr ? p.nameAr : p.name)
  const q = query.trim().toLowerCase()
  const filtered = q
    ? people.filter((p) => name(p).toLowerCase().includes(q) || (p.email ?? "").toLowerCase().includes(q))
    : people
  const selected = people.filter((p) => value.includes(p.id))
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id])

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
        className="flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-input bg-[var(--card-elevated)] px-3 text-start text-sm outline-none transition-colors focus:border-primary/60">
        <span className={cn("truncate", value.length === 0 && "text-muted-foreground")}>
          {value.length === 0 ? placeholder : `${value.length} ${isAr ? "محدّد" : "selected"}`}
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder={searchPlaceholder}
              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {filtered.map((p) => {
              const on = value.includes(p.id)
              return (
                <button key={p.id} type="button" onClick={() => toggle(p.id)} aria-pressed={on}
                  className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-start transition-colors hover:bg-muted">
                  <span className={cn("grid size-4 shrink-0 place-items-center rounded border", on ? "border-primary bg-primary text-primary-foreground" : "border-border")}>
                    {on && <Check className="size-3" />}
                  </span>
                  <Avatar className="size-7 shrink-0"><AvatarFallback className="bg-muted text-[10px] font-semibold">{p.initials}</AvatarFallback></Avatar>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium">{name(p)}</span>
                    {(p.email || p.dept) && <span className="block truncate text-[11px] text-muted-foreground">{[p.email, isAr ? p.deptAr : p.dept].filter(Boolean).join(" · ")}</span>}
                  </span>
                </button>
              )
            })}
            {filtered.length === 0 && <div className="px-2.5 py-6 text-center text-sm text-muted-foreground">{emptyLabel}</div>}
          </div>
        </div>
      )}

      {selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selected.map((p) => (
            <span key={p.id} className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 py-1 pe-1.5 ps-2.5 text-xs font-medium text-primary">
              {name(p)}
              <button type="button" aria-label={`remove ${p.name}`} onClick={() => toggle(p.id)} className="grid size-4 place-items-center rounded-full hover:bg-primary/20"><X className="size-3" /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

/** Multi-select department picker with an "All employees" shortcut. When `all`
 *  is true, the individual departments are ignored (everyone is targeted). */
export function DepartmentPicker({ all, ids, onToggleAll, onToggleDept, isAr }: {
  all: boolean
  ids: string[]
  onToggleAll: (v: boolean) => void
  onToggleDept: (id: string) => void
  isAr: boolean
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onToggleAll(!all)}
        aria-pressed={all}
        className={cn("inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors", all ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground")}
      >
        {all ? <Check className="size-3.5" /> : <Users className="size-3.5" />}
        {isAr ? "كل الموظفين" : "All employees"}
      </button>
      {DEPARTMENTS.map((d) => {
        const sel = !all && ids.includes(d.id)
        return (
          <button
            key={d.id}
            type="button"
            disabled={all}
            onClick={() => onToggleDept(d.id)}
            aria-pressed={sel}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
              all ? "cursor-not-allowed border-border/60 text-muted-foreground/40" : sel ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground",
            )}
          >
            {sel && <Check className="size-3.5" />}
            <Building2 className={cn("size-3.5", sel && "hidden")} />
            {isAr ? d.nameAr : d.name}
            <span className="text-xs opacity-60">· {d.headcount}</span>
          </button>
        )
      })}
    </div>
  )
}

/** A soft, color-coded category badge. Pass the category's color (hex); it
 *  renders a tinted pill readable in both light and dark themes. */
export function CategoryBadge({ label, color, className }: { label: string; color?: string; className?: string }) {
  const c = color ?? "#8a8a8a"
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded px-2 py-1 text-[12px] font-medium", className)}
      style={{ backgroundColor: `${c}26`, color: c }}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: c }} />
      {label}
    </span>
  )
}

/** Shared page furniture for the CMS/content modules — WIJHA card-header
 *  language: the page title lives in the shell top bar, so the in-page header
 *  is a compact Figma card header (16px accent icon, 17px title, 48×3 gold
 *  underline) with the description beneath and actions at the end. */
export function PageHeader({
  eyebrow,
  title,
  desc,
  icon: Icon,
  action,
}: {
  eyebrow: string
  title: string
  desc: string
  icon: LucideIcon
  action?: React.ReactNode
}) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 flex-col items-start gap-2">
        <span className="text-[12px] text-muted-foreground">{eyebrow}</span>
        <h1 className="flex items-center gap-2 text-[17px] font-medium leading-[25.5px]">
          <Icon className="size-4 shrink-0 text-primary" />
          {title}
        </h1>
        <span className="h-[3px] w-12 rounded-[2px] bg-primary" />
        <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">{desc}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  )
}

/** KPI tile — Figma card (r12, hairline) with a 34px soft-gold icon tile. */
export function StatCard({
  icon: Icon,
  value,
  label,
  sub,
}: {
  icon: LucideIcon
  value: string
  label: string
  sub?: string
}) {
  return (
    <Card className="rounded-xl gap-0  px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[24px] font-bold leading-none tabular-nums">{value}</div>
          <div className="mt-2 text-[13px] font-medium">{label}</div>
          {sub && <div className="mt-0.5 text-[11px] text-muted-foreground">{sub}</div>}
        </div>
        <div className="accent-chip grid size-[34px] shrink-0 place-items-center rounded-lg">
          <Icon className="size-4" />
        </div>
      </div>
    </Card>
  )
}

/** Filter chips — selected chip is the soft-gold accent; others sit on Shape/Fill/Secondary. */
export function Chips({
  items,
  active,
  onSelect,
}: {
  items: string[]
  active: string
  onSelect: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => (
        <button
          key={it}
          onClick={() => onSelect(it)}
          aria-pressed={active === it}
          className={cn(
            "h-8 rounded-lg px-3 text-[13px] font-medium transition-colors",
            active === it ? "accent-chip ring-1 ring-primary/40" : "bg-secondary text-foreground hover:brightness-110",
          )}
        >
          {it}
        </button>
      ))}
    </div>
  )
}

export function useT() {
  // placeholder to keep import symmetry; pages call useShell directly
  return (en: string) => en
}

/** Shared prose styling for rich-text (contentEditable HTML) bodies rendered
 *  read-only — matches the RichTextEditor toolbar's output. */
export const RICH_PROSE = cn(
  "text-[13px] leading-6 text-foreground/90",
  "[&_h2]:mb-1.5 [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h2:first-child]:mt-0",
  "[&_h3]:mb-1 [&_h3]:mt-3 [&_h3]:text-base [&_h3]:font-semibold",
  "[&_p]:my-2.5",
  "[&_ul]:my-2.5 [&_ul]:list-disc [&_ul]:ps-5 [&_ol]:my-2.5 [&_ol]:list-decimal [&_ol]:ps-5 [&_li]:my-1",
  "[&_a]:text-primary [&_a]:underline",
  "[&_blockquote]:my-2.5 [&_blockquote]:border-s-2 [&_blockquote]:border-primary [&_blockquote]:ps-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
)
