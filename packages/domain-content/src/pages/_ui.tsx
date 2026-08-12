import * as React from "react"
import { Card } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { Building2, Check, Users } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { DEPARTMENTS } from "../data/departments"

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
