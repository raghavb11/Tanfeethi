import { motion } from "framer-motion"
import { Check } from "lucide-react"

import { Button, Card } from "@reach/shared-ui"

export function ApprovalCard({
  title,
  titleAr,
  meta,
  metaAr,
  due,
  dueAr,
  delay = 0,
  isAr = false,
}: {
  title: string
  titleAr?: string
  meta: string
  metaAr?: string
  due: string
  dueAr?: string
  delay?: number
  isAr?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1], delay }}
      className="w-full"
    >
      <Card className="gap-3 py-4">
        <div className="flex items-start justify-between gap-3 px-4">
          <div className="min-w-0 space-y-1">
            <div className="text-sm font-semibold">{isAr && titleAr ? titleAr : title}</div>
            <div className="text-xs text-muted-foreground">{isAr && metaAr ? metaAr : meta}</div>
          </div>
          <div className="shrink-0 text-[11px] text-muted-foreground">{isAr && dueAr ? dueAr : due}</div>
        </div>
        <div className="flex items-center justify-end gap-2 px-4">
          <Button size="sm" variant="ghost">
            {isAr ? "تأجيل" : "Snooze"}
          </Button>
          <Button size="sm" variant="default" className="gap-1.5">
            <Check className="size-3.5" />
            {isAr ? "موافقة" : "Approve"}
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}
