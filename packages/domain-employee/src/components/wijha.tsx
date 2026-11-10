import * as React from "react"
import { cn } from "@reach/shared-core"

/* ─────────────────────────────────────────────────────────────────────────────
 * Local WIJHA primitives for the Employee module (Figma "Final Design 1.0").
 * Measured from the Employee hub (2028:760): card radius 12, padding 20/24,
 * title 17px Medium with a 16px accent icon and a 48×3 gold underline, inner
 * tiles radius 10 on the page fill with a hairline, 14.5 / 12.5 body / meta.
 * Kept inside the package (shared-ui is owned by the integrator).
 * ──────────────────────────────────────────────────────────────────────────── */

type IconType = React.ComponentType<{ className?: string; strokeWidth?: number }>

/** Page content wrapper — 40px side padding and 32px top on desktop (Figma). */
export function Page({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("w-full px-4 pb-10 pt-6 sm:px-6 lg:px-10 lg:pt-8", className)}>{children}</div>
}

/** Card title: accent icon + 17px medium title, gold 48×3 underline beneath. */
export function CardTitle({ icon: Icon, title, className }: { icon?: IconType; title: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-w-0 flex-col items-start gap-2", className)}>
      <div className="flex min-w-0 items-center gap-2">
        {Icon && <Icon className="size-[17px] shrink-0 text-primary" strokeWidth={1.75} />}
        <h2 className="truncate text-[17px] font-medium leading-[25.5px] text-foreground">{title}</h2>
      </div>
      <span aria-hidden className="h-[3px] w-12 rounded-[2px] bg-primary" />
    </div>
  )
}

/** The standard Figma card (Card/Fill/Primary + hairline), radius 12. */
export function SectionCard({
  icon, title, action, children, className, bodyClassName, id,
}: {
  icon?: IconType
  title?: React.ReactNode
  action?: React.ReactNode
  children?: React.ReactNode
  className?: string
  bodyClassName?: string
  id?: string
}) {
  return (
    <section id={id} className={cn("panel min-w-0 rounded-xl px-4 py-5 sm:px-6", className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3">
          {title ? <CardTitle icon={icon} title={title} /> : <span />}
          {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={cn(title || action ? "mt-[18px]" : "", bodyClassName)}>{children}</div>
    </section>
  )
}

/** Inner tile — page fill, hairline, radius 10, 16px padding. */
export function Tile({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-[10px] bg-background p-4 ring-1 ring-border ring-inset", className)} {...rest}>
      {children}
    </div>
  )
}

/** Small 36px secondary square holding an accent icon (tile headers). */
export function IconBadge({ icon: Icon, className, tone = "accent" }: { icon: IconType; className?: string; tone?: "accent" | "violet" | "success" }) {
  return (
    <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg bg-secondary", className)}>
      <Icon className={cn("size-[18px]", tone === "accent" && "text-primary", tone === "violet" && "text-[#a997c7]", tone === "success" && "text-success")} strokeWidth={1.75} />
    </span>
  )
}

export type Tone = "neutral" | "success" | "warning" | "error" | "info" | "violet" | "accent"
const CHIP: Record<Tone, string> = {
  neutral: "bg-secondary text-foreground",
  success: "bg-success-fill text-success",
  warning: "bg-warning-fill text-warning",
  error: "bg-error-fill text-error",
  info: "bg-info-fill text-info",
  violet: "bg-[#a997c7]/20 text-[#a997c7]",
  accent: "bg-soft-accent text-primary",
}
/** Status chip — radius 6, 12px label (Figma "قيد المراجعة"). */
export function Chip({ tone = "neutral", className, children, icon: Icon }: { tone?: Tone; className?: string; children: React.ReactNode; icon?: IconType }) {
  return (
    <span className={cn("inline-flex h-6 shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-2 text-[12px] font-medium", CHIP[tone], className)}>
      {Icon && <Icon className="size-3.5" />}
      {children}
    </span>
  )
}

/** Thin progress bar (track = Shape/Fill/Secondary). */
export function Bar({ value, tone = "success", className }: { value: number; tone?: "success" | "warning" | "accent" | "error"; className?: string }) {
  const v = Math.max(0, Math.min(100, value))
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-secondary", className)} role="progressbar" aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100}>
      <div
        className={cn("h-full rounded-full transition-[width] duration-700",
          tone === "success" && "bg-[#1aad70]/90",
          tone === "warning" && "bg-warning/90",
          tone === "accent" && "bg-primary",
          tone === "error" && "bg-error")}
        style={{ width: `${v}%` }}
      />
    </div>
  )
}

/** Donut ring (attendance). `value` 0–1. */
export function Ring({ value, size = 140, stroke = 14, children, className }: { value: number; size?: number; stroke?: number; children?: React.ReactNode; className?: string }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(1, value))
  return (
    <div className={cn("relative grid shrink-0 place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--secondary)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1aad70" strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={c * (1 - v)} style={{ transition: "stroke-dashoffset .8s cubic-bezier(.22,1,.36,1)" }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  )
}

/** Figma toggle — 64×28 track, gold when on, light knob. The Figma RTL frames keep the
 *  physical direction (knob right = on), so the switch is laid out LTR. */
export function Toggle({ checked, onChange, label, className }: { checked: boolean; onChange: (v: boolean) => void; label: string; className?: string }) {
  return (
    <button
      type="button"
      role="switch"
      dir="ltr"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-7 w-16 shrink-0 items-center rounded-full p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring",
        checked ? "bg-primary/80" : "bg-secondary",
        className,
      )}
    >
      <span
        className={cn(
          "block h-6 w-10 rounded-full bg-[#f3eef1] shadow-sm transition-transform duration-200",
          checked ? "translate-x-[20px]" : "translate-x-0",
        )}
      />
    </button>
  )
}

/** Gold primary button (Button/Fill/Primary 80%), 8px radius. */
export function GoldButton({ className, size = "md", ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { size?: "sm" | "md" | "lg" }) {
  return (
    <button
      type="button"
      {...rest}
      className={cn(
        "btn-primary-grad inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:pointer-events-none disabled:opacity-40",
        size === "sm" && "h-7 px-3 text-[13px]",
        size === "md" && "h-9 px-4 text-[14px]",
        size === "lg" && "h-10 px-5 text-[14.5px]",
        className,
      )}
    />
  )
}

/** Outlined neutral button (Button/Stroke/Secondary). */
export function OutlineButton({ className, size = "md", ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { size?: "sm" | "md" | "lg" }) {
  return (
    <button
      type="button"
      {...rest}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--btn-outline-border)] bg-transparent font-medium text-foreground transition-colors hover:bg-[var(--btn-outline-hover)] disabled:pointer-events-none disabled:opacity-40",
        size === "sm" && "h-7 px-3 text-[13px]",
        size === "md" && "h-9 px-4 text-[14px]",
        size === "lg" && "h-10 px-5 text-[14.5px]",
        className,
      )}
    />
  )
}

/** Round 62px service button (Shape/Fill/Secondary + accent icon) with label. */
export function ServiceButton({ icon: Icon, label, onClick }: { icon: IconType; label: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="group flex flex-col items-center gap-3 text-center">
      <span className="grid size-[62px] place-items-center rounded-full bg-secondary transition-colors group-hover:bg-soft-accent">
        <Icon className="size-6 text-primary" strokeWidth={1.5} />
      </span>
      <span className="text-[14px] text-foreground">{label}</span>
    </button>
  )
}

/** Form field label with the red required asterisk. */
export function FieldLabel({ children, required, htmlFor, className }: { children: React.ReactNode; required?: boolean; htmlFor?: string; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={cn("mb-2 block text-[13px] font-medium text-foreground", className)}>
      {children}
      {required && <span className="ms-1 text-error">*</span>}
    </label>
  )
}

/** Input chrome shared by selects, dates and text fields (Figma: 36px, radius 8, page fill). */
export const fieldClass =
  "h-9 w-full rounded-lg border border-border bg-background px-3 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/20"

/** Avatar circle with initials (Avatar/Fill). */
export function Initials({ text, className, tone = "muted", presence }: { text: string; className?: string; tone?: "muted" | "accent" | "violet"; presence?: "online" | "away" | "offline" }) {
  return (
    <span className={cn("relative grid shrink-0 place-items-center rounded-full text-[13px] font-medium",
      tone === "muted" && "bg-secondary text-muted-foreground",
      tone === "accent" && "bg-soft-accent text-primary",
      tone === "violet" && "bg-[#a997c7]/20 text-[#a997c7]",
      className)}>
      {text}
      {presence && (
        <span className={cn("absolute bottom-0 start-0 size-3.5 rounded-full ring-2 ring-[var(--card)]",
          presence === "online" && "bg-[#1aad70]", presence === "away" && "bg-warning", presence === "offline" && "bg-[#c9c5c7]")} />
      )}
    </span>
  )
}

/** Empty state used inside cards. */
export function Empty({ icon: Icon, title, hint, action }: { icon: IconType; title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
      <span className="grid size-11 place-items-center rounded-full bg-secondary"><Icon className="size-5 text-icon" /></span>
      <p className="text-[14px] font-medium">{title}</p>
      {hint && <p className="max-w-xs text-[12.5px] text-muted-foreground">{hint}</p>}
      {action}
    </div>
  )
}

/** Fading hairline (Figma "Card Separater"). */
export function Separator({ className }: { className?: string }) {
  return <div aria-hidden className={cn("card-separator", className)} />
}

/** Key/value row (Profile "الملف الشخصي" list). */
export function InfoRow({ label, value, ltr }: { label: string; value: React.ReactNode; ltr?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-4 last:border-b-0">
      <span className="shrink-0 text-[12.5px] text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate text-[14px] text-foreground" dir={ltr ? "ltr" : undefined}>{value}</span>
    </div>
  )
}

/** Western-digit duration "4س و 4د" / "4h 4m". */
export function hmShort(min: number, isAr: boolean) {
  const h = Math.floor(min / 60), m = min % 60
  return isAr ? `${h}س و ${m}د` : `${h}h ${m}m`
}
/** "7 ساعات و 30 دقيقة" / "7 h 30 min". */
export function hmWords(min: number, isAr: boolean) {
  const h = Math.floor(min / 60), m = min % 60
  if (!isAr) return m ? `${h} h ${m} min` : `${h} hours`
  const hw = h === 1 ? "ساعة" : h === 2 ? "ساعتان" : h >= 3 && h <= 10 ? `${h} ساعات` : `${h} ساعة`
  if (!m) return h === 0 ? "0 دقيقة" : hw
  const mw = m >= 3 && m <= 10 ? `${m} دقائق` : `${m} دقيقة`
  return h === 0 ? mw : `${hw} و ${mw}`
}
/** 24h "08:00" → "8:00 AM". */
export function to12h(hhmm: string | null | undefined) {
  if (!hhmm) return "—"
  const [hs, ms] = hhmm.split(":")
  const h = Number(hs)
  const ap = h >= 12 ? "PM" : "AM"
  return `${((h + 11) % 12) + 1}:${ms} ${ap}`
}
