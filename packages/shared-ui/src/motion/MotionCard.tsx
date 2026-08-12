import * as React from "react"
import { motion } from "framer-motion"

import { cn } from "@reach/shared-core"

type MotionCardProps = {
  children: React.ReactNode
  className?: string
  delay?: number
  lift?: boolean
}

export function MotionCard({
  children,
  className,
  delay = 0,
  lift = true,
}: MotionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1], delay }}
      whileHover={
        lift
          ? { y: -2, transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] } }
          : undefined
      }
      className={cn("h-full", className)}
    >
      {children}
    </motion.div>
  )
}

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.02 },
  },
}

export const staggerItem = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
  },
}
