/** Personal evaluation launcher — Figma 4124:10928. Route: /operations/personal */
import { Link } from "react-router-dom"
import { ArrowDownLeft, ArrowDownRight, BadgeCheck, CalendarCheck, ClipboardList, LayoutGrid, SquareStar } from "lucide-react"

import { CardHeading, Page, Panel } from "../components/ui"
import { useT } from "../components/helpers"

export default function PersonalEvaluationPage() {
  const { t, isAr } = useT()
  const Arrow = isAr ? ArrowDownLeft : ArrowDownRight
  const tiles = [
    { to: "/operations/personal/history", icon: SquareStar, label: t("View my previous evaluations", "عرض تقييماتي السابقة") },
    { to: "/operations/personal/half-year", icon: SquareStar, label: t("Mid-year evaluation", "التقييم النصف سنوي") },
    { to: "/operations/personal/goals", icon: BadgeCheck, label: t("Goals list", "قائمة الأهداف") },
    // Not on the frame — the annual self-review (4126:14074) and the employee's
    // operational log (4215:13599) had no entry point in the design.
    { to: "/operations/personal/annual", icon: CalendarCheck, label: t("Annual evaluation", "التقييم السنوي") },
    { to: "/operations/personal/operational-log", icon: ClipboardList, label: t("My operational evaluations", "سجل تقييماتي التشغيلية") },
  ]
  return (
    <Page>
      <Panel className="sm:px-4">
        <CardHeading icon={LayoutGrid} title={t("Personal evaluation", "التقييم الشخصي")} />
        {/* Tile: page fill, hairline, radius 10, 24 top padding, 30px icon tile,
            14.5px label, 38px "Open" footer (10px gold) — 4124:10928. */}
        <div className="mt-[18px] grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className="group flex min-h-[145px] flex-col gap-4 overflow-hidden rounded-[10px] border border-border bg-background pt-6 transition-colors hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring outline-none"
            >
              <div className="flex flex-1 flex-col items-start gap-3 px-4">
                <span className="icon-tile size-[30px] border border-secondary bg-gradient-to-b from-secondary/75 to-secondary/10">
                  <Icon className="size-[15px]" strokeWidth={1.8} />
                </span>
                <span className="text-[14.5px] leading-[21.75px]">{label}</span>
              </div>
              <div className="flex h-[38px] items-center justify-between gap-3 border-t border-secondary px-4 text-[10px] font-medium text-primary">
                <span>{t("Open", "فتح")}</span>
                <Arrow className="size-2.5 transition-transform group-hover:translate-y-0.5" strokeWidth={2.2} />
              </div>
            </Link>
          ))}
        </div>
      </Panel>
    </Page>
  )
}
