/** Goal title + info icon that opens the read-only goal-details modal (4124:14002). */
import * as React from "react"

import type { Goal } from "../data/operations"
import { GoalModal } from "./GoalModal"
import { Cell, InfoButton } from "./ui"
import { useT } from "./helpers"

export function GoalTitleCell({ goal }: { goal: Goal }) {
  const { t, l } = useT()
  const [open, setOpen] = React.useState(false)
  return (
    <Cell className="flex items-center gap-2">
      <span className="min-w-0">{l(goal.title)}</span>
      <InfoButton label={t("Goal details", "تفاصيل الهدف")} onClick={() => setOpen(true)} />
      <GoalModal open={open} onOpenChange={setOpen} goal={goal} readOnly />
    </Cell>
  )
}
