import * as React from "react"
import { cn } from "@reach/shared-core"
import { SearchableSelect } from "@reach/shared-ui"
import { TONE_CHIP, TONE_DOT, type ShiftTypeRow } from "@reach/domain-content/master-data"
import { ChevronDown } from "lucide-react"

import { fieldClass } from "./wijha"

/* Small pieces shared by the roster screens. */

/** The shift's code in its master-data colour — what a roster cell shows. */
export function ShiftCode({ shift, className }: { shift?: ShiftTypeRow; className?: string }) {
  if (!shift) return null
  return (
    <span className={cn("inline-flex h-7 min-w-8 items-center justify-center rounded-md border px-1.5 text-[12.5px] font-semibold tabular-nums",
      TONE_CHIP[shift.tone], className)}>
      {shift.code ?? shift.name.slice(0, 1)}
    </span>
  )
}

/** "Morning 06:00 – 14:00" — the legend entry and the cell menu's row. */
export function ShiftLabel({ shift, isAr, compact }: { shift: ShiftTypeRow; isAr: boolean; compact?: boolean }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <span className={cn("size-2 shrink-0 rounded-full", TONE_DOT[shift.tone])} />
      <span className="truncate">{isAr ? shift.nameAr : shift.name}</span>
      {!compact && <ShiftHours shift={shift} isAr={isAr} className="text-muted-foreground" />}
    </span>
  )
}
export function ShiftHours({ shift, isAr, className }: { shift: ShiftTypeRow; isAr: boolean; className?: string }) {
  if (shift.isOff) return <span className={className}>{isAr ? "راحة" : "Rest"}</span>
  return <span dir="ltr" className={cn("tabular-nums", className)}>{shift.startTime}–{shift.endTime}</span>
}

/** Two or three mutually exclusive options as one pill row. */
export function Segmented<T extends string>({ value, onChange, options, ariaLabel }: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string; disabled?: boolean }[]
  ariaLabel: string
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="inline-flex rounded-lg bg-secondary p-1">
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value} disabled={o.disabled}
          onClick={() => onChange(o.value)}
          className={cn("h-8 rounded-md px-3.5 text-[13px] font-medium transition-colors disabled:opacity-40",
            value === o.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** A searchable dropdown with the standard closed field (36px, page fill). */
export function PickField({ value, onChange, options, placeholder, isAr, invalid, id, ariaLabel, className }: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string; alt?: string; lead?: React.ReactNode; hint?: React.ReactNode }[]
  placeholder: string
  isAr: boolean
  invalid?: boolean
  id?: string
  ariaLabel?: string
  className?: string
}) {
  const sel = options.find((o) => o.value === value)
  return (
    <SearchableSelect
      value={value} onChange={onChange} isAr={isAr} options={options}
      renderTrigger={({ triggerProps }) => (
        <span className={cn("relative block", className)}>
          <button {...triggerProps} id={id} aria-label={ariaLabel} aria-invalid={invalid || undefined}
            className={cn(fieldClass, "flex items-center gap-2 pe-9 text-start", !sel && "text-muted-foreground", invalid && "border-error")}>
            {sel?.lead}
            <span className="min-w-0 flex-1 truncate">{sel ? sel.label : placeholder}</span>
          </button>
          <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-icon" />
        </span>
      )}
    />
  )
}

/** Delete confirmation — the one place a dialog is allowed. */
export function ConfirmDelete({ open, title, body, confirm, cancel, onConfirm, onCancel }: {
  open: boolean; title: string; body?: string; confirm: string; cancel: string
  onConfirm: () => void; onCancel: () => void
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
      <div className="w-full max-w-[480px] rounded-2xl bg-card p-6 shadow-2xl ring-1 ring-border">
        <h2 className="text-[18px] font-semibold">{title}</h2>
        {body && <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{body}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} className="h-9 rounded-lg border border-border px-4 text-[13.5px] font-medium hover:bg-secondary">{cancel}</button>
          <button onClick={onConfirm} autoFocus className="h-9 rounded-lg bg-error px-4 text-[13.5px] font-medium text-white hover:brightness-110">{confirm}</button>
        </div>
      </div>
    </div>
  )
}
