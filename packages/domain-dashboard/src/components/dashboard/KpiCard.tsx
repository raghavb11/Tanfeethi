import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { cn } from "@reach/shared-core"

export function KpiCard({
  label,
  value,
  delta,
  trend,
  delay = 0,
  to,
}: {
  label: string
  value: string
  delta: string
  trend: "up" | "down" | "neutral"
  delay?: number
  to?: string
}) {
  const inner = (
    <>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <span className="text-[10px] font-semibold tracking-[0.10em] text-muted-foreground uppercase truncate">
            {label}
          </span>
          <span
            className={cn(
              "text-[10px] font-semibold shrink-0",
              trend === "up" && "text-emerald-500",
              trend === "down" && "text-rose-400",
              trend === "neutral" && "text-muted-foreground/40",
            )}
          >
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "—"}
          </span>
        </div>
        <div className="text-[22px] font-bold tracking-tight leading-none">{value}</div>
        <div className="text-[10px] text-muted-foreground mt-1 truncate">{delta}</div>
      </div>
    </>
  )

  const base = "panel flex items-center gap-3 rounded-2xl border border-border/60 px-4 py-3"

  if (to) {
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1], delay }} whileHover={{ y: -2 }}>
        <Link to={to} className={cn(base, "block cursor-pointer transition-colors hover:border-primary/40 hover:bg-primary/[0.03]")}>
          {inner}
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1], delay }}
      className={base}
    >
      {inner}
    </motion.div>
  )
}
