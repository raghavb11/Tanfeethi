import type { LucideIcon } from "lucide-react"
import { BookOpen, Heart, Zap } from "lucide-react"

/** Preview-only hub navigation — owned by `@reach/domain-preview`. */
export type PreviewNavItem = {
  title: string
  titleAr: string
  path: string
  icon: LucideIcon
  preview?: boolean
}

export const previewNav: PreviewNavItem[] = [
  { title: "Engagement", titleAr: "مشاركة", path: "/hubs/engagement", icon: Heart, preview: true },
  { title: "Knowledge", titleAr: "المعرفة", path: "/hubs/knowledge", icon: BookOpen, preview: true },
  { title: "Productivity", titleAr: "الإنتاجية", path: "/hubs/productivity", icon: Zap, preview: true },
]

export const hubMeta: Record<string, { title: string; titleAr: string; icon: LucideIcon; tagline: string; taglineAr: string }> = {
  engagement: {
    title: "Engagement Hub",
    titleAr: "مركز المشاركة",
    icon: Heart,
    tagline: "Posts, kudos, polls, and team moments.",
    taglineAr: "منشورات، تقدير، استطلاعات، ولحظات الفريق.",
  },
  knowledge: {
    title: "Knowledge Hub",
    titleAr: "مركز المعرفة",
    icon: BookOpen,
    tagline: "Experts, docs, and verified answers.",
    taglineAr: "خبراء، مستندات، وإجابات موثوقة.",
  },
  productivity: {
    title: "Productivity Hub",
    titleAr: "مركز الإنتاجية",
    icon: Zap,
    tagline: "Focus, goals, and measurable cadence.",
    taglineAr: "تركيز، أهداف، وإيقاع قابل للقياس.",
  },
}
