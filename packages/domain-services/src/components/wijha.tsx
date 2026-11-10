/** Services-local WIJHA building blocks, measured from Figma "Final Design 1.0"
 *  (Services frames). Kept inside the package — shared-ui is not ours to edit. */
import * as React from "react"
import { Link } from "react-router-dom"
import { cn } from "@reach/shared-core"
import { ArrowDownLeft, ArrowDownRight, Check, ChevronDown, LayoutGrid, Upload, type LucideIcon } from "lucide-react"

import type { CategoryTone } from "../data/mock/services"
import { useT } from "./i18n"

// ── page frame: 32 top / 40 sides / 24 bottom (Figma content frame) ─────────
export function PageBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-[1440px] px-4 pb-6 pt-8 md:px-10", className)}>{children}</div>
}

/** Two-column page body: main (start side) + a fixed side column (end side, 397px). */
export function SplitLayout({ main, side, sideWidth = 397, className }: {
  main: React.ReactNode; side: React.ReactNode; sideWidth?: number; className?: string
}) {
  return (
    <div
      className={cn("grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_var(--side)]", className)}
      style={{ ["--side" as string]: `${sideWidth}px` }}
    >
      <div className="min-w-0 space-y-6">{main}</div>
      <div className="min-w-0 space-y-6">{side}</div>
    </div>
  )
}

// ── card: radius 12, fill Card/Fill/Primary, padding 20/24 ──────────────────
export function Card({ className, children, as: As = "section" }: {
  className?: string; children: React.ReactNode; as?: "section" | "div"
}) {
  return <As className={cn("panel rounded-xl px-6 py-5", className)}>{children}</As>
}

/** Card title: 17px medium, 16px gold icon (8px gap), 48×3 gold underline 8px below. */
export function CardTitle({ icon: Icon = LayoutGrid, children, className }: {
  icon?: LucideIcon; children: React.ReactNode; className?: string
}) {
  return (
    <div className={cn("inline-flex flex-col items-start gap-2", className)}>
      <h2 className="flex h-[26px] items-center gap-2 text-[17px] font-medium leading-[25.5px] text-foreground">
        <Icon className="size-4 shrink-0 text-primary" strokeWidth={1.8} />
        {children}
      </h2>
      <span className="h-[3px] w-12 rounded-[2px] bg-primary" aria-hidden />
    </div>
  )
}

export function CardHeader({ title, icon, actions, className }: {
  title: React.ReactNode; icon?: LucideIcon; actions?: React.ReactNode; className?: string
}) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-3", className)}>
      <CardTitle icon={icon}>{title}</CardTitle>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

// ── buttons ──────────────────────────────────────────────────────────────────
type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { size?: "sm" | "md" }

/** Gold @80% fill, dark 12px semibold label. sm = 28px (card actions), md = 34px (forms). */
export function GoldButton({ className, size = "md", ...p }: BtnProps) {
  return (
    <button
      type="button"
      {...p}
      className={cn(
        "btn-primary-grad inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" ? "h-7 px-5 text-[12px]" : "h-[34px] px-6 text-[13px]",
        className,
      )}
    />
  )
}

/** Outlined secondary button (Button/Stroke/Secondary). */
export function OutlineButton({ className, size = "md", ...p }: BtnProps) {
  return (
    <button
      type="button"
      {...p}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-secondary bg-background font-semibold text-foreground transition-colors hover:bg-secondary/60 disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" ? "h-7 px-3 text-[12px]" : "h-[34px] px-4 text-[13px]",
        className,
      )}
    />
  )
}

export function GoldLink({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) {
  return (
    <Link to={to} className={cn("btn-primary-grad inline-flex h-7 shrink-0 items-center justify-center gap-2 rounded-lg px-5 text-[12px] font-semibold", className)}>
      {children}
    </Link>
  )
}

/** The "Open ↙" arrow — points toward the inline end, mirrored for LTR. */
export function OpenArrow({ className }: { className?: string }) {
  const { isAr } = useT()
  const I = isAr ? ArrowDownLeft : ArrowDownRight
  return <I className={cn("size-[13px] text-primary", className)} strokeWidth={2} />
}

// ── icon tile (30px, radius 8, Shape/Fill/Secondary) ────────────────────────
export function IconTile({ icon: Icon, className, tone = "neutral" }: {
  icon: LucideIcon; className?: string; tone?: "neutral" | "gold"
}) {
  return (
    <span
      className={cn(
        "inline-flex size-[30px] shrink-0 items-center justify-center rounded-lg border shadow-[0_1px_2px_rgba(0,0,0,0.24)]",
        tone === "gold" ? "border-transparent bg-soft-accent text-primary" : "border-secondary bg-secondary text-foreground",
        className,
      )}
    >
      <Icon className="size-[15px]" strokeWidth={1.7} />
    </span>
  )
}

// ── service tile (catalog cards): radius 10, Page fill, hairline ────────────
export function ServiceTile({ icon, title, description, meta, actionLabel, to, onClick, selected }: {
  icon: LucideIcon
  title: string
  description?: string
  meta?: string
  actionLabel: string
  to?: string
  onClick?: () => void
  selected?: boolean
}) {
  const body = (
    <>
      <div className="flex flex-col gap-3 px-4">
        <div className="flex items-center justify-between gap-2">
          <IconTile icon={icon} />
          {meta && <span className="text-[12px] leading-[18px] text-foreground">{meta}</span>}
        </div>
        <div className="min-h-[44.5px]">
          <div className="text-[14.5px] leading-[21.75px] text-foreground">{title}</div>
          {description && <p className="mt-1 text-[12.5px] leading-[18.75px] text-muted-foreground">{description}</p>}
        </div>
      </div>
      <div className="mt-auto flex h-[38px] items-center justify-between gap-3 border-t border-secondary px-4">
        <span className="text-[10px] font-medium leading-[13px] text-primary">{actionLabel}</span>
        <OpenArrow className="size-[11px]" />
      </div>
    </>
  )
  const cls = cn(
    "flex h-full flex-col gap-4 rounded-[10px] border bg-background pt-6 text-start transition-colors hover:border-primary/50",
    selected ? "border-primary" : "border-[var(--card-ring)]",
  )
  if (to) return <Link to={to} className={cls}>{body}</Link>
  return <button type="button" onClick={onClick} className={cn(cls, "w-full")}>{body}</button>
}

/** Master-list row (catalog level 2, violation hub): 62px, padding 14, radius 8,
 *  34px gold icon square + 11.9px medium label; gold stroke when selected. */
export function GroupRow({ icon: Icon, label, selected, onClick, filled }: {
  icon: LucideIcon; label: string; selected?: boolean; onClick?: () => void
  /** The whole row tinted gold (fault form "service you chose"). */
  filled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex min-h-[62px] w-full items-center gap-3 rounded-lg border p-3.5 text-start transition-colors",
        filled ? "border-transparent bg-primary/25" : "bg-background",
        !filled && (selected ? "border-primary" : "border-transparent hover:border-[var(--card-ring)]"),
      )}
    >
      <span className="inline-flex size-[34px] shrink-0 items-center justify-center rounded-lg bg-primary/25 text-primary">
        <Icon className="size-4" strokeWidth={1.7} />
      </span>
      <span className="min-w-0 flex-1 text-[11.9px] font-medium leading-[13px] text-foreground">{label}</span>
    </button>
  )
}

// ── KPI tile: 80px, padding 16/18, icon 24 gold, value 24 bold, label 11.5 ──
export function KpiTile({ icon: Icon, value, label, className, inset }: {
  icon: LucideIcon; value: React.ReactNode; label: string; className?: string; inset?: boolean
}) {
  return (
    <div className={cn(
      "flex h-20 items-center gap-3 rounded-xl px-[18px] py-4",
      inset ? "bg-background" : "panel",
      className,
    )}>
      <Icon className="size-6 shrink-0 text-primary" strokeWidth={1.6} />
      <div className="min-w-0 space-y-0.5">
        <div className="text-[24px] font-bold leading-[31px] text-foreground">{value}</div>
        <div className="text-[11.5px] leading-[15px] text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}

// ── category chip: radius 6, 21px, 10px medium, 5px dot ─────────────────────
const chipTone: Record<CategoryTone, string> = {
  neutral: "bg-secondary text-foreground [--dot:var(--foreground)]",
  success: "bg-success-fill text-success [--dot:var(--success)]",
  violet: "bg-[#a997c7]/15 text-[#a997c7] [--dot:#a997c7]",
  gold: "bg-soft-accent text-primary [--dot:var(--primary)]",
  rose: "bg-rose-gold/15 text-rose-gold [--dot:var(--rose-gold)]",
  error: "bg-error-fill text-error [--dot:var(--error)]",
}
export function CategoryChip({ tone, children }: { tone: CategoryTone; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex h-[21px] items-center gap-1.5 rounded-md px-2 text-[10px] font-medium", chipTone[tone])}>
      <span className="size-[5px] shrink-0 rounded-full bg-[var(--dot)]" aria-hidden />
      {children}
    </span>
  )
}

// ── stepper (Figma 3039:5192): 51px tall, 8px side padding, 12px dots at y5,
//    6px bars 12px from each dot, 12.5px labels centred under the dots at y24 ──
export function Stepper({ steps, current, tone, wideEnd }: {
  steps: string[]; current: number; tone: "gold" | "success"
  /** The last label is long ("تم التوصيل"): the design keeps 24px on that side. */
  wideEnd?: boolean
}) {
  // Status/Succes/Progress bar (#1aad70 @90% dark, #067647 @70% light).
  const fill = tone === "success" ? "bg-[rgba(6,118,71,0.7)] dark:bg-[rgba(26,173,112,0.9)]" : "bg-primary"
  return (
    <ol className={cn("flex h-[51px] items-start ps-2 pt-[5px]", wideEnd ? "pe-6" : "pe-2")} aria-label="progress">
      {steps.map((s, i) => {
        const reached = i <= current
        return (
          <React.Fragment key={i}>
            <li className="relative flex w-3 shrink-0 flex-col items-center" aria-current={i === current ? "step" : undefined}>
              <span className={cn("size-3 rounded-full", reached ? fill : "bg-muted-foreground/80")} />
              <span className={cn(
                "absolute left-1/2 top-[19px] -translate-x-1/2 whitespace-nowrap text-[12.5px] leading-[18.75px]",
                reached ? "text-foreground" : "text-muted-foreground",
                i === current && tone === "gold" && "font-medium",
              )}>{s}</span>
            </li>
            {i < steps.length - 1 && (
              <li aria-hidden className="mx-3 mt-[3px] h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                <span className={cn("block h-full rounded-full", i < current ? fill : "w-0")} />
              </li>
            )}
          </React.Fragment>
        )
      })}
    </ol>
  )
}

// ── form fields (34px, radius 8, Page fill, hairline) ───────────────────────
export function Field({ label, required, hint, children, className, htmlFor }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode; className?: string; htmlFor?: string
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <label htmlFor={htmlFor} className="px-1 text-[13px] font-semibold leading-[17px] text-foreground">
        {label}
        {required && <span className="ms-0.5 text-error">*</span>}
        {hint && <span className="ms-1.5 text-[11px] font-normal text-muted-foreground">{hint}</span>}
      </label>
      {children}
    </div>
  )
}

/** Figma "Selection container": 36px, radius 8, Page fill, no stroke, 12/8 padding, 11.3px text. */
const controlCls =
  "h-9 w-full min-w-0 rounded-lg border border-transparent bg-background ps-3 pe-2 text-[12px] text-foreground outline-none transition-colors placeholder:text-[11.3px] placeholder:text-foreground/90 focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/25 disabled:opacity-60"

export function TextInput(p: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...p} className={cn(controlCls, p.className)} />
}

export function TextArea(p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...p} className={cn(controlCls, "h-auto min-h-9 resize-y py-2.5 leading-[18px]", p.className)} />
}

export function SelectInput({ value, onChange, options, placeholder, id, className, disabled, prefix, invalid }: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  id?: string
  className?: string
  disabled?: boolean
  /** Small muted label inside the control, before the value (e.g. "Reassign:"). */
  prefix?: React.ReactNode
  invalid?: boolean
}) {
  return (
    <div className={cn("relative", className)}>
      {prefix && (
        <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center gap-1 text-[11px] text-muted-foreground">{prefix}</span>
      )}
      <select
        id={id}
        value={value}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        onChange={(e) => onChange(e.target.value)}
        className={cn(controlCls, "appearance-none pe-8", invalid && "border-error/70", prefix && "ps-[92px]", !value && "text-[11.3px] text-foreground/90")}
      >
        <option value="">{placeholder ?? "—"}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute end-2 top-1/2 size-[13px] -translate-y-1/2 text-icon" />
    </div>
  )
}

/** "Upload attachments" — a gold 34px button that opens a file picker and lists picks. */
export function AttachmentsButton({ files, onChange, className }: {
  files: File[]; onChange: (f: File[]) => void; className?: string
}) {
  const { t } = useT()
  const ref = React.useRef<HTMLInputElement>(null)
  return (
    <div className={cn("flex flex-col items-start gap-2", className)}>
      <GoldButton onClick={() => ref.current?.click()} className="w-[208px] max-w-full">
        <Upload className="size-3.5" />
        {t("Upload Attachments", "رفع مرفقات")}
      </GoldButton>
      <input ref={ref} type="file" multiple hidden onChange={(e) => onChange([...files, ...Array.from(e.target.files ?? [])])} />
      {files.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {files.map((f, i) => (
            <li key={i} className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2 py-1 text-[11px] text-foreground">
              {f.name}
              <button type="button" onClick={() => onChange(files.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-error" aria-label={t("Remove", "إزالة")}>×</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function Checkbox({ checked, onChange, children, id }: {
  checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode; id?: string
}) {
  return (
    <label htmlFor={id} className="inline-flex cursor-pointer items-start gap-3 text-[12.5px] leading-[18.75px] text-foreground">
      <span className="relative mt-px inline-flex size-[18px] shrink-0">
        <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer absolute inset-0 cursor-pointer opacity-0" />
        <span className={cn(
          "flex size-[18px] items-center justify-center rounded-[4px] border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40",
          checked ? "border-primary bg-primary text-primary-foreground" : "border-foreground/70 bg-transparent",
        )}>
          {checked && <Check className="size-3" strokeWidth={3} />}
        </span>
      </span>
      <span>{children}</span>
    </label>
  )
}

/** Form footer: primary then Cancel (start-aligned, 12px apart). */
export function FormActions({ onSubmit, onCancel, submitLabel, disabled }: {
  onSubmit: () => void; onCancel: () => void; submitLabel?: string; disabled?: boolean
}) {
  const { t } = useT()
  return (
    <div className="flex flex-wrap items-center gap-4">
      <GoldButton onClick={onSubmit} disabled={disabled}>{submitLabel ?? t("Submit Request", "إرسال الطلب")}</GoldButton>
      <OutlineButton onClick={onCancel} className="min-w-[84px]">{t("Cancel", "إلغاء")}</OutlineButton>
    </div>
  )
}

// ── table ────────────────────────────────────────────────────────────────────
export function DataTable({ head, children, className }: {
  head: React.ReactNode[]; children: React.ReactNode; className?: string
}) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      {/* Figma table: header 12.5px (8/12 padding), rows 13.5px with 14px vertical padding,
          No. column 40px, Shape/Stroke/Secondary row rules, last row open. */}
      <table className="w-full min-w-[720px] border-collapse text-start">
        <thead>
          <tr className="border-b border-secondary">
            {head.map((h, i) => (
              <th key={i} scope="col" className="px-[5px] pb-3 pt-2 text-start text-[12.5px] font-normal leading-[18.75px] text-muted-foreground first:w-10 first:ps-0">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>tr:not(:last-child)]:border-b [&>tr]:border-secondary [&_td]:px-[5px] [&_td]:py-[14px] [&_td]:align-middle [&_td]:text-[13.5px] [&_td]:leading-[20.25px] [&_td]:text-foreground [&_td:first-child]:ps-0">
          {children}
        </tbody>
      </table>
    </div>
  )
}

// ── misc ─────────────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, hint, action }: {
  icon: LucideIcon; title: string; hint?: string; action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-[10px] border border-dashed border-[var(--card-ring)] px-6 py-10 text-center">
      <Icon className="size-6 text-icon" strokeWidth={1.5} />
      <div className="text-[13px] font-medium text-foreground">{title}</div>
      {hint && <p className="max-w-sm text-[12px] text-muted-foreground">{hint}</p>}
      {action}
    </div>
  )
}

/** Inline confirmation strip shown after a submit. */
export function Toast({ children, tone = "success" }: { children: React.ReactNode; tone?: "success" | "error" }) {
  return (
    <div role="status" className={cn(
      "flex flex-wrap items-center gap-2 rounded-xl px-4 py-3 text-[12.5px]",
      tone === "success" ? "bg-success-fill text-success" : "bg-error-fill text-error",
    )}>
      <Check className="size-4" />
      {children}
    </div>
  )
}

/** Diagonal-stripe image placeholder (Figma product / thumbnail frames). */
export function ImagePlaceholder({ icon: Icon, className }: { icon?: LucideIcon; className?: string }) {
  return (
    <div
      className={cn("flex items-center justify-center overflow-hidden rounded-lg bg-secondary/70", className)}
      style={{ backgroundImage: "repeating-linear-gradient(135deg, transparent 0 14px, color-mix(in oklab, var(--foreground) 4%, transparent) 14px 28px)" }}
    >
      {Icon && <Icon className="size-1/4 max-h-12 max-w-12 text-foreground/15" strokeWidth={1.2} />}
    </div>
  )
}

/** Segmented control (sugar level, period tabs). */
export function Segmented<T extends string>({ value, onChange, options, size = "sm", className }: {
  value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; size?: "sm" | "md"; className?: string
}) {
  return (
    <div role="tablist" className={cn("inline-flex items-stretch gap-1 rounded-lg border border-[var(--card-ring)] bg-background p-1", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "flex-1 rounded-md px-3 transition-colors",
            size === "sm" ? "h-[26px] text-[10.5px]" : "h-8 text-[12.5px]",
            value === o.value ? "bg-soft-accent font-semibold text-primary shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--primary)_30%,transparent)]" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
