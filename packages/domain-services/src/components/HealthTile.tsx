import { CircleCheck, TrendingDown, TrendingUp } from "lucide-react"
import { cn } from "@reach/shared-core"

import { useT } from "./i18n"
import { FlameIcon, FootprintsIcon } from "./kpi-icons"
import type { IconType } from "./wijha"
import type { HealthTile } from "../data/mock/wellness"

const statIcons: Record<string, IconType> = { steps: FootprintsIcon, calories: FlameIcon, streak: FlameIcon }
const nudgeIcons: Record<string, IconType> = { down: TrendingDown, check: CircleCheck, up: TrendingUp, streak: FlameIcon }

/** Figma nudge fills: 166deg from Status/x/Progress bar to Status/x/Fill (mirrored to 194deg in the EN frames). */
const tones: Record<string, string> = {
  error:
    "bg-[linear-gradient(166deg,rgba(180,35,24,0.7),#f9e3e1)] dark:bg-[linear-gradient(166deg,rgba(209,79,69,0.9),rgba(180,35,24,0.25))] ltr:bg-[linear-gradient(194deg,rgba(180,35,24,0.7),#f9e3e1)] dark:ltr:bg-[linear-gradient(194deg,rgba(209,79,69,0.9),rgba(180,35,24,0.25))] text-foreground",
  success:
    "bg-[linear-gradient(166deg,rgba(6,118,71,0.7),#dffceb)] dark:bg-[linear-gradient(166deg,rgba(26,173,112,0.9),rgba(6,118,71,0.25))] ltr:bg-[linear-gradient(194deg,rgba(6,118,71,0.7),#dffceb)] dark:ltr:bg-[linear-gradient(194deg,rgba(26,173,112,0.9),rgba(6,118,71,0.25))] text-foreground",
  gold:
    "bg-[linear-gradient(166deg,rgba(171,128,37,0.7),#eae2cb)] dark:bg-[linear-gradient(166deg,rgba(226,160,40,0.9),rgba(220,104,3,0.3))] ltr:bg-[linear-gradient(194deg,rgba(171,128,37,0.7),#eae2cb)] dark:ltr:bg-[linear-gradient(194deg,rgba(226,160,40,0.9),rgba(220,104,3,0.3))] text-foreground",
  neutral: "bg-background text-foreground",
}

/** One صحتي tile (Figma 3039:5124 / 3056:7271): 80px, radius 12, 16/18 padding,
 *  24px icon, 12px gap; value 24 bold (31px line) + 2px + label 11.5 (15px line).
 *  Page fill, or a red / green / gold gradient nudge. */
export function HealthTileView({ tile, className }: { tile: HealthTile; className?: string }) {
  const { isAr } = useT()
  if (tile.kind === "stat") {
    const Icon = statIcons[tile.icon]
    const long = tile.icon === "streak"
    return (
      <div className={cn("flex h-20 items-center gap-3 rounded-[12px] bg-background px-[18px] py-4", !long && "ltr:h-[76px]", className)}>
        <Icon className={cn("h-6 w-[21px] shrink-0", tile.icon === "steps" ? "text-primary" : "text-error")} strokeWidth={1.6} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          {/* EN frames: 29px value line + 13px label line (76px tile). */}
          <div className={cn("flex h-[31px] items-center font-bold text-foreground", long ? "text-[16px] leading-[20px]" : "text-[24px] leading-[31px] ltr:h-[29px] ltr:leading-[29px]")}>
            {isAr ? tile.valueAr : tile.value}
          </div>
          <div className={cn("text-[11.5px] leading-[15px] text-muted-foreground", !long && "ltr:leading-[13px]")}>{isAr ? tile.labelAr : tile.label}</div>
        </div>
      </div>
    )
  }
  const Icon = nudgeIcons[tile.icon]
  return (
    <div className={cn("flex h-20 items-center gap-3 rounded-[12px] px-[18px] py-4", tones[tile.tone], className)}>
      <Icon className={cn(tile.icon === "streak" ? "h-6 w-[21px]" : "size-6", "shrink-0", tile.tone === "neutral" ? "text-error" : "text-foreground")} strokeWidth={1.6} />
      <div className="flex h-full min-w-0 flex-1 flex-col justify-between">
        {/* One line, truncated like the Figma EN tile ("Start Walk…"). */}
        <div className="flex min-w-0 flex-1 items-center text-[16px] font-bold leading-[20px]"><span className="truncate" title={isAr ? tile.titleAr : tile.title}>{isAr ? tile.titleAr : tile.title}</span></div>
        <div className="text-[11.5px] leading-[15px] text-muted-foreground">{isAr ? tile.hintAr : tile.hint}</div>
      </div>
    </div>
  )
}
