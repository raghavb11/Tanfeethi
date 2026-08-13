import * as React from "react"
import { Avatar, AvatarFallback, Card } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { Building2, Check, ChevronsUpDown, Search, Users, X } from "lucide-react"
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
      className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", className)}
      style={{ backgroundColor: `${c}22`, color: c, borderColor: `${c}55` }}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: c }} />
      {label}
    </span>
  )
}

/** Shared page furniture for the CMS/content modules. */
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
    <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="mb-3 inline-flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/12 text-primary ring-1 ring-primary/15">
            <Icon className="size-[17px]" />
          </span>
          <span className="text-[13px] font-semibold text-muted-foreground">{eyebrow}</span>
        </div>
        <h1 className="font-heading text-[2.15rem] font-semibold leading-[1.06] tracking-tight text-balance sm:text-[2.6rem]">{title}</h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{desc}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  )
}

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
    <Card className="p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="metal-text font-heading text-[1.9rem] font-semibold leading-none tracking-tight tabular-nums">{value}</div>
          <div className="mt-2 text-sm font-medium">{label}</div>
          {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
        </div>
        <div className="accent-chip flex size-10 shrink-0 items-center justify-center rounded-xl">
          <Icon className="size-5" />
        </div>
      </div>
    </Card>
  )
}

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
            "rounded-full border px-3 py-1.5 text-sm transition-colors",
            active === it ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/60",
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
  "text-[15px] leading-relaxed text-foreground/85",
  "[&_h2]:mb-1.5 [&_h2]:mt-4 [&_h2]:font-heading [&_h2]:text-lg [&_h2]:font-semibold [&_h2:first-child]:mt-0",
  "[&_h3]:mb-1 [&_h3]:mt-3 [&_h3]:font-heading [&_h3]:text-base [&_h3]:font-semibold",
  "[&_p]:my-2.5",
  "[&_ul]:my-2.5 [&_ul]:list-disc [&_ul]:ps-5 [&_ol]:my-2.5 [&_ol]:list-decimal [&_ol]:ps-5 [&_li]:my-1",
  "[&_a]:text-primary [&_a]:underline",
  "[&_blockquote]:my-2.5 [&_blockquote]:border-s-2 [&_blockquote]:border-primary [&_blockquote]:ps-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
)
