import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import { Rss, User } from "lucide-react"

import type { Rotation } from "../data/mock/hub"

/** Shift-roster card (Figma 2101:2061): green = leave (with substitute), violet = remote work.
 *  Rows 44.5 tall (22.75 + 3 + 19), 16px padding inside a 1px status border. */
export function RotationCard({ r }: { r: Rotation }) {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const leave = r.kind === "leave"
  return (
    <div className={cn("rounded-[10px] border p-4",
      leave
        ? "border-[color-mix(in_srgb,#1aad70_58%,var(--background))] bg-[color-mix(in_srgb,#1aad70_16%,var(--background))]"
        : "border-[color-mix(in_srgb,#a997c7_61%,var(--background))] bg-[color-mix(in_srgb,#a997c7_23%,var(--background))]")}>
      <div className="flex items-center gap-3">
        <span className={cn("grid size-[30px] shrink-0 place-items-center rounded-md",
          leave ? "bg-[color-mix(in_srgb,#1aad70_58%,var(--background))]" : "bg-[color-mix(in_srgb,#a997c7_61%,var(--background))]")}>
          {leave ? <User className="size-[15px] text-foreground" /> : <Rss className="size-[15px] text-foreground" />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14.5px] leading-[22.75px]">{isAr ? r.nameAr : r.name}</div>
          <div className="mt-[3px] flex items-center justify-between gap-2 text-[12.5px] leading-[19px] text-muted-foreground">
            <span>{leave ? t("Leave", "إجازة") : t("Remote work", "دوام عن بعد")}</span>
            <span>{isAr ? `${r.fromAr} إلى ${r.toAr}` : `${r.from} to ${r.to}`}</span>
          </div>
        </div>
      </div>
      {leave && r.substitute && (
        <>
          <div aria-hidden className="my-4 h-0.5 rounded-full bg-[#1aad70]/15" />
          <div className="truncate text-[14.5px] leading-[22.75px]">{t("Substitute employee", "الموظف البديل")}: {isAr ? r.substituteAr : r.substitute}</div>
          <div className="mt-[3px] truncate text-[12.5px] leading-[19px] text-muted-foreground">{t("Email", "إيميل")}: <span dir="ltr">{r.substituteEmail}</span></div>
        </>
      )}
    </div>
  )
}
