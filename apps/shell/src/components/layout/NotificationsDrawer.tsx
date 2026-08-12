import { motion } from "framer-motion"

import {
  Button,
  ScrollArea,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@reach/shared-ui"
import { notifications as items } from "@reach/shared-mocks"

export function NotificationsDrawer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border/60 p-4 text-left">
          <SheetTitle className="text-base">Notifications</SheetTitle>
          <SheetDescription>Operational signals and Reach Assistant updates.</SheetDescription>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1 px-2 py-4">
          <div className="space-y-2">
            {items.map((n, idx) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1], delay: idx * 0.04 }}
                className="rounded-xl border border-border bg-card p-4 ring-1 ring-foreground/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-sm font-semibold">{n.title}</div>
                      {n.unread && <span className="size-2 shrink-0 rounded-full bg-primary" />}
                    </div>
                    <div className="text-sm text-muted-foreground">{n.body}</div>
                  </div>
                  <div className="shrink-0 text-[11px] text-muted-foreground">{n.time}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
        <Separator />
        <div className="p-4">
          <Button type="button" variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
