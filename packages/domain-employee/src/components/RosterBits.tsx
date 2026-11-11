import * as React from "react"
import { cn } from "@reach/shared-core"
import { SearchableSelect } from "@reach/shared-ui"
import { TONE_CHIP, TONE_DOT, type ShiftTypeRow } from "@reach/domain-content/master-data"
import { ChevronDown } from "lucide-react"

import { fieldClass } from "./wijha"
import { rotationText } from "../data/rosters"

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

/** Seven Sunday-first day toggles — weekly days off. */
export function WeekdayPills({ value, onToggle, isAr, disabled, label }: {
  value: number[]; onToggle: (day: number) => void; isAr: boolean; disabled?: boolean; label: string
}) {
  const names = isAr ? ["ح", "ن", "ث", "ر", "خ", "ج", "س"] : ["S", "M", "T", "W", "T", "F", "S"]
  const full = isAr ? ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"] : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  return (
    <div role="group" aria-label={label} className="inline-flex gap-1">
      {names.map((n, d) => {
        const on = value.includes(d)
        return (
          <button key={d} type="button" disabled={disabled} onClick={() => onToggle(d)} aria-pressed={on}
            title={`${full[d]} — ${on ? (isAr ? "راحة" : "day off") : (isAr ? "عمل" : "working")}`}
            aria-label={`${full[d]}${on ? (isAr ? " (راحة)" : " (day off)") : ""}`}
            className={cn("grid size-7 place-items-center rounded-md text-[11.5px] font-medium transition-colors disabled:cursor-default",
              // a highlighted day is a day off — that is what is being picked
              on ? "bg-soft-accent text-primary ring-1 ring-inset ring-primary/50" : "bg-background text-muted-foreground ring-1 ring-inset ring-border",
              !disabled && "hover:ring-primary/60")}>
            {n}
          </button>
        )
      })}
    </div>
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

/** Tap shifts in the order people move through them at rollover; tap again to take one out. */
export function RotationPicker({ value, onChange, options, isAr, t, disabled }: {
  value: string[]
  onChange: (v: string[]) => void
  options: ShiftTypeRow[]
  isAr: boolean
  t: (en: string, ar: string) => string
  disabled?: boolean
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {options.map((s) => {
          const at = value.indexOf(s.id)
          return (
            <button key={s.id} type="button" disabled={disabled} aria-pressed={at >= 0}
              onClick={() => onChange(at >= 0 ? value.filter((x) => x !== s.id) : [...value, s.id])}
              className={cn("inline-flex h-9 items-center gap-2 rounded-lg px-3 text-[13px] ring-1 ring-inset transition-colors disabled:cursor-default",
                at >= 0 ? "bg-soft-accent ring-primary/50" : "bg-background ring-border hover:bg-secondary/60")}>
              {at >= 0 && <span className="grid size-5 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground tabular-nums">{at + 1}</span>}
              {isAr ? s.nameAr : s.name}
            </button>
          )
        })}
      </div>
      <p className="text-[12px] text-muted-foreground">
        {value.length > 1
          ? `${rotationText(value, isAr)} ${isAr ? "← " : "→ "}${rotationText([value[0]], isAr)}`
          : t("Pick at least two shifts for people to rotate between; a shift left out stays the same at rollover.",
              "اختر مناوبتين على الأقل للتناوب بينهما؛ المناوبة غير المختارة تبقى كما هي عند الترحيل.")}
      </p>
    </div>
  )
}
