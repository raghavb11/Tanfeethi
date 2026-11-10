import { cn } from "@reach/shared-core"
import { Hand } from "lucide-react"

import { type Health, HEALTH } from "../data/milestones"

/** The red / amber / green chip. A hand marks a colour a manager set by hand. */
export function HealthPill({ health, isAr, overridden, size = "md", className }: {
  health: Health
  isAr: boolean
  overridden?: boolean
  size?: "sm" | "md"
  className?: string
}) {
  const h = HEALTH[health]
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border font-semibold",
        size === "sm" ? "px-2 py-0.5 text-[10.5px]" : "px-2.5 py-1 text-[11.5px]",
        h.chip, className,
      )}
      title={overridden ? (isAr ? "حُدّد يدويًا" : "Set manually") : undefined}
    >
      <span className={cn("size-2 rounded-full", h.dot)} />
      {isAr ? h.ar : h.en}
      {overridden && <Hand className="size-3 opacity-70" />}
    </span>
  )
}
