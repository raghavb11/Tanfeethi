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
    { to: "/operations/personal/half-year", icon: SquareStar, label: t("Half-year evaluation", "التقييم النصف سنوي") },
    { to: "/operations/personal/goals", icon: BadgeCheck, label: t("Goals list", "قائمة الأهداف") },
    // Not on the frame — the annual self-review (4126:14074) and the employee's
    // operational log (4215:13599) had no entry point in the design.
    { to: "/operations/personal/annual", icon: CalendarCheck, label: t("Annual evaluation", "التقييم السنوي") },
    { to: "/operations/personal/operational-log", icon: ClipboardList, label: t("My operational evaluations", "سجل تقييماتي التشغيلية") },
  ]
  return (
    <Page>
      <Panel>
        <CardHeading icon={LayoutGrid} title={t("Personal evaluation", "التقييم الشخصي")} />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className="group flex min-h-[132px] flex-col overflow-hidden rounded-xl border border-border bg-background transition-colors hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring outline-none"
            >
              <div className="flex flex-1 flex-col items-start gap-3 p-4">
                <span className="icon-tile size-7">
                  <Icon className="size-3.5" strokeWidth={1.8} />
                </span>
                <span className="text-base leading-6">{label}</span>
              </div>
              <div className="flex h-[35px] items-center justify-between border-t border-border px-4 text-[11px] text-primary">
                <span>{t("Open", "فتح")}</span>
                <Arrow className="size-3.5 transition-transform group-hover:translate-y-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </Panel>
    </Page>
  )
}
