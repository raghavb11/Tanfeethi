import { motion } from "framer-motion"

import { Avatar, AvatarFallback, Card, ScrollArea, ScrollBar } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { Clock, Sparkles } from "lucide-react"
import { categories, type CategoryId, type ColumnId, type KanbanColumn, type TaskPriority } from "../data/mock/work"

// Category tone → Tailwind classes (compose-safe; full class names for Tailwind v4 scan)
function categoryClasses(catId: CategoryId): { dot: string; chip: string } {
  const cat = categories.find((c) => c.id === catId)
  if (!cat) return { dot: "bg-muted-foreground", chip: "bg-muted text-muted-foreground" }
  switch (cat.tone) {
    case "primary":
      return { dot: "bg-primary", chip: "bg-primary/12 text-primary border-primary/25" }
    case "emerald":
      return { dot: "bg-emerald-500", chip: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 border-emerald-500/25" }
    case "blue":
      return { dot: "bg-blue-500", chip: "bg-blue-500/12 text-blue-600 dark:text-blue-400 border-blue-500/25" }
    case "amber":
      return { dot: "bg-amber-500", chip: "bg-amber-500/12 text-amber-600 dark:text-amber-400 border-amber-500/25" }
    case "violet":
      return { dot: "bg-violet-500", chip: "bg-violet-500/12 text-violet-600 dark:text-violet-400 border-violet-500/25" }
    case "cyan":
      return { dot: "bg-cyan-500", chip: "bg-cyan-500/12 text-cyan-600 dark:text-cyan-400 border-cyan-500/25" }
  }
}

function priorityDot(priority: TaskPriority) {
  if (priority === "high") return "bg-rose-500"
  if (priority === "medium") return "bg-amber-400"
  return "bg-muted-foreground/40"
}

function columnAccent(colId: ColumnId) {
  if (colId === "backlog") return "bg-muted-foreground/40"
  if (colId === "progress") return "bg-primary"
  if (colId === "review") return "bg-amber-400"
  return "bg-emerald-500"
}

export function KanbanBoard({
  columns,
  isAr = false,
  filter = null,
}: {
  columns: KanbanColumn[]
  isAr?: boolean
  filter?: CategoryId | null
}) {
  return (
    <ScrollArea className="w-full pb-4">
      <div className="flex w-max gap-4 pb-2">
        {columns.map((col, cIdx) => {
          const filtered = filter ? col.cards.filter((c) => c.category === filter) : col.cards
          return (
            <div key={col.id} className="w-[300px] shrink-0 space-y-3">
              {/* Column header */}
              <div className="flex items-center justify-between rounded-xl bg-card border border-border/60 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", columnAccent(col.id))} />
                  <div className="text-[12px] font-semibold tracking-wide">
                    {isAr ? col.titleAr : col.title}
                  </div>
                </div>
                <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-bold tabular-nums text-muted-foreground">
                  {filtered.length}
                </span>
              </div>

              <div className="space-y-3">
                {filtered.map((card, idx) => {
                  const cat = categories.find((c) => c.id === card.category)
                  const tone = categoryClasses(card.category)
                  return (
                    <motion.div
                      key={card.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1], delay: cIdx * 0.03 + idx * 0.05 }}
                      whileHover={{ y: -3, transition: { duration: 0.15 } }}
                    >
                      <Card className="gap-0 overflow-hidden py-0 ring-1 ring-foreground/10 hover:shadow-lg hover:shadow-primary/5 transition-shadow">
                        <div className="space-y-3 px-4 pt-4 pb-3">
                          {/* Top row: category + priority */}
                          <div className="flex items-center justify-between gap-2">
                            <span className={cn(
                              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                              tone.chip,
                            )}>
                              <span className={cn("size-1.5 rounded-full", tone.dot)} />
                              {cat ? (isAr ? cat.labelAr : cat.label) : ""}
                            </span>
                            <span
                              className={cn("size-2 rounded-full", priorityDot(card.priority))}
                              aria-label={card.priority}
                            />
                          </div>

                          {/* Title */}
                          <div className="text-[13px] font-semibold leading-snug">
                            {isAr ? card.titleAr : card.title}
                          </div>

                          {/* Meta row */}
                          <div className="flex items-center justify-between gap-2 pt-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <Avatar className="size-6 shrink-0">
                                <AvatarFallback className="bg-primary/15 text-primary text-[9px] font-bold">
                                  {card.initials}
                                </AvatarFallback>
                              </Avatar>
                              <span className="truncate text-[11px] text-muted-foreground">
                                {isAr ? card.ownerAr : card.owner}
                              </span>
                            </div>
                            <div className="flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground/70">
                              <Clock className="size-3" />
                              <span>{isAr ? card.dueAr : card.due}</span>
                            </div>
                          </div>
                        </div>

                        {/* Reach AI footer */}
                        <div className="flex items-start gap-2 border-t border-border/50 bg-muted/30 px-4 py-2.5 dark:bg-muted/20">
                          <Sparkles className="mt-0.5 size-3 shrink-0 text-primary" />
                          <div className="text-[11px] leading-relaxed text-muted-foreground">
                            {isAr ? card.aiAr : card.ai}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}

                {filtered.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border/60 px-3 py-6 text-center text-[11px] text-muted-foreground/60">
                    {isAr ? "لا توجد مهام" : "No tasks"}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
