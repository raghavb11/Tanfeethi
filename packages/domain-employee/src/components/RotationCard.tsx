import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import { Rss, User } from "lucide-react"

import type { Rotation } from "../data/mock/hub"

/** Shift-roster card: green = leave (with substitute), violet = remote work. */
export function RotationCard({ r }: { r: Rotation }) {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const leave = r.kind === "leave"
  return (
    <div className={cn("rounded-[10px] border p-4", leave ? "border-[#1aad70]/70 bg-success-fill" : "border-[#a997c7]/60 bg-[#a997c7]/25")}>
      <div className="flex items-center gap-3">
        <span className={cn("grid size-[30px] shrink-0 place-items-center rounded-lg", leave ? "bg-[#1aad70]" : "bg-[#a997c7]")}>
          {leave ? <User className="size-4 text-white" /> : <Rss className="size-4 text-white" />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14.5px]">{isAr ? r.nameAr : r.name}</div>
          <div className="flex items-center justify-between gap-2 text-[12.5px]">
            <span>{leave ? t("Leave", "إجازة") : t("Remote work", "دوام عن بعد")}</span>
            <span className="text-foreground/90">{isAr ? `${r.fromAr} إلى ${r.toAr}` : `${r.from} to ${r.to}`}</span>
          </div>
        </div>
      </div>
      {leave && r.substitute && (
        <>
          <div aria-hidden className="my-4 h-0.5 bg-gradient-to-r from-transparent via-[#1aad70]/70 to-transparent" />
          <div className="text-[14.5px]">{t("Substitute", "الموظف البديل")}: {isAr ? r.substituteAr : r.substitute}</div>
          <div className="truncate text-[12.5px]">{t("Email", "أيميل")}: <span dir="ltr">{r.substituteEmail}</span></div>
        </>
      )}
    </div>
  )
}
