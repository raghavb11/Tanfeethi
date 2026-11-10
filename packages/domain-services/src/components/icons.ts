import {
  Banknote, BookOpen, CircleAlert, ClipboardClock, Coffee, ConciergeBell, GitPullRequestArrow, Handshake,
  Laptop, Lightbulb, MonitorCog, TriangleAlert, Wrench, type LucideIcon,
} from "lucide-react"
import type { CategoryIcon, ServiceIcon } from "../data/mock/services"

/** Lucide equivalents of the catalog service icons. */
export const serviceIcons: Record<ServiceIcon, LucideIcon> = {
  laptop: Laptop,
  fault: TriangleAlert,
  development: Lightbulb,
  change: GitPullRequestArrow,
  health: MonitorCog,
  knowledge: BookOpen,
  menu: Coffee,
  waiter: ConciergeBell,
  hr: Handshake,
  finance: Banknote,
  facilities: Wrench,
}

export { ClipboardClock, CircleAlert }

/** Services home category icons. */
export const categoryIcons: Record<CategoryIcon, LucideIcon> = {
  laptop: Laptop, hr: Handshake, finance: Banknote, facilities: Wrench, hospitality: Coffee, violation: CircleAlert,
}
