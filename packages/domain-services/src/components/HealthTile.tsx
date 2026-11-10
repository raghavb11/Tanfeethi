import { CircleCheck, Flame, Footprints, TrendingDown, TrendingUp, type LucideIcon } from "lucide-react"
import { cn } from "@reach/shared-core"

import { useT } from "./i18n"
import type { HealthTile } from "../data/mock/wellness"

const statIcons: Record<string, LucideIcon> = { steps: Footprints, calories: Flame, streak: Flame }
const nudgeIcons: Record<string, LucideIcon> = { down: TrendingDown, check: CircleCheck, up: TrendingUp, streak: Flame }

const tones: Record<string, string> = {
  error: "bg-[linear-gradient(180deg,var(--error),color-mix(in_oklab,var(--error)_72%,black))] text-white",
  success: "bg-[linear-gradient(180deg,var(--success),color-mix(in_oklab,var(--success)_70%,black))] text-white",
  gold: "bg-[linear-gradient(180deg,var(--primary),color-mix(in_oklab,var(--primary)_70%,black))] text-white",
  neutral: "bg-background text-foreground",
}

/** One صحتي tile (Figma 3039:5124 / 3056:7271): 80px, radius 12, 16/18 padding,
 *  24px icon — Page fill, or a red / green / gold gradient nudge. */
export function HealthTileView({ tile }: { tile: HealthTile }) {
  const { isAr } = useT()
  if (tile.kind === "stat") {
    const Icon = statIcons[tile.icon]
    const long = tile.icon === "streak"
    return (
      <div className="flex min-h-20 items-center gap-3 rounded-xl bg-background px-[18px] py-4">
        <Icon className={cn("size-6 shrink-0", tile.icon === "steps" ? "text-primary" : "text-error")} strokeWidth={1.6} />
        <div className="min-w-0">
          <div className={cn("font-bold leading-tight text-foreground", long ? "text-[16px]" : "text-[24px]")}>{isAr ? tile.valueAr : tile.value}</div>
          <div className="mt-0.5 text-[11.5px] text-muted-foreground">{isAr ? tile.labelAr : tile.label}</div>
        </div>
      </div>
    )
  }
  const Icon = nudgeIcons[tile.icon]
  return (
    <div className={cn("flex min-h-20 items-center gap-3 rounded-xl px-[18px] py-4", tones[tile.tone])}>
      <Icon className={cn("size-6 shrink-0", tile.tone === "neutral" && "text-error")} strokeWidth={1.6} />
      <div className="min-w-0">
        <div className="text-[16px] font-bold leading-tight">{isAr ? tile.titleAr : tile.title}</div>
        <div className={cn("mt-0.5 text-[11.5px]", tile.tone === "neutral" ? "text-muted-foreground" : "text-white/80")}>{isAr ? tile.hintAr : tile.hint}</div>
      </div>
    </div>
  )
}
