import * as React from "react"

import { cn } from "@reach/shared-core"

/** Figma card shell: Card/Fill/Primary + hairline stroke, radius 12. */
export function HomeCard({ className, children, ...rest }: React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn("panel rounded-xl", className)} {...rest}>
      {children}
    </section>
  )
}

/**
 * Figma card header: 16px gold icon + 17px medium title, 3px gold underline
 * 8px beneath. `short` gives the 48px underline some cards use; otherwise it
 * spans the title. `meta` / `action` sit at the inline-end.
 */
export function CardHeading({
  icon: Icon,
  title,
  short,
  children,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  title: string
  short?: boolean
  children?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-2">
        <h2 className="flex items-center gap-2 text-[17px] font-medium leading-[25.5px] text-foreground">
          <Icon className="size-4 shrink-0 text-primary" strokeWidth={1.8} />
          <span className="truncate">{title}</span>
        </h2>
        <span className={cn("block h-[3px] rounded-[2px] bg-primary", short ? "w-12" : "w-full")} />
      </div>
      {children && <div className="flex shrink-0 items-center gap-4">{children}</div>}
    </div>
  )
}

/** The design's 4px scroll track (Shape/Fill/Secondary) with a light thumb. */
export const thinScroll =
  "[&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:rounded-[2px] [&::-webkit-scrollbar-track]:bg-secondary [&::-webkit-scrollbar-thumb]:rounded-[2px] [&::-webkit-scrollbar-thumb]:bg-foreground/85"

/** Gold primary button (Button/Fill/Primary 80% with the dark on-colour label). */
export const goldButton =
  "btn-primary-grad inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"

/** Outline button (Button/Stroke/Secondary). */
export const outlineButton =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-transparent font-medium text-foreground transition-colors hover:bg-soft-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
