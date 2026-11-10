/** Small local building blocks for Learning (domains can't share code with each
 *  other; these mirror the Figma card pattern: 17px title, 16px gold icon, 48×3
 *  gold underline; 34px gold buttons). */
import * as React from "react"
import { cn } from "@reach/shared-core"

export function CardHeading({
  icon: Icon,
  title,
  id,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  title: string
  id?: string
}) {
  return (
    <div className="flex flex-col items-start gap-2">
      <h2 id={id} className="flex items-center gap-2 text-[17px] font-medium leading-[25.5px] text-foreground">
        <Icon className="size-4 shrink-0 text-primary" strokeWidth={1.8} />
        {title}
      </h2>
      <span aria-hidden className="h-[3px] w-12 rounded-[2px] bg-primary" />
    </div>
  )
}

const btnBase =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[8px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { size?: "md" | "sm" }

export function GoldButton({ size = "md", className, type = "button", ...props }: BtnProps) {
  return (
    <button
      type={type}
      className={cn(btnBase, "btn-primary-grad font-semibold", size === "md" ? "h-[34px] px-6 text-[13px]" : "h-7 px-3 text-xs", className)}
      {...props}
    />
  )
}

export function OutlineButton({ size = "md", className, type = "button", ...props }: BtnProps) {
  return (
    <button
      type={type}
      className={cn(
        btnBase,
        "border border-foreground/25 font-semibold text-foreground hover:bg-secondary/60",
        size === "md" ? "h-[34px] px-6 text-[13px]" : "h-7 px-3 text-xs",
        className,
      )}
      {...props}
    />
  )
}

/** 4px progress track (Shape/Fill/Secondary) with a gold fill. */
export function ProgressBar({ value, className, label }: { value: number; className?: string; label: string }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-1 w-full overflow-hidden rounded-full bg-secondary", className)}
    >
      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )
}

/** Category chip with a dot — gold (accent) or purple (#a997c7, the design's purple badge). */
export function Chip({ children, tone = "gold" }: { children: React.ReactNode; tone?: "gold" | "purple" }) {
  return (
    <span
      className={cn(
        "inline-flex h-[21px] items-center gap-1.5 rounded-md px-2 text-[10.1px] font-medium",
        tone === "gold" ? "accent-chip" : "bg-[#a997c7]/20 text-[#a997c7]",
      )}
    >
      <span aria-hidden className="size-[5px] rounded-full bg-current" />
      {children}
    </span>
  )
}
