/** Look-up lists the task screens share: statuses, categories, sprints and
 *  priorities, each with its bilingual label and its Figma colour.
 *  Demo masters; a real build reads them from configuration. */

export type TaskStatus = "open" | "on-hold" | "in-progress" | "in-review" | "completed"
export type TaskPriority = "high" | "medium" | "low"
export type CategoryId = "operations" | "design" | "hr" | "it" | "strategy" | "finance"

/** Board order (Figma 2015:9895, read from the start edge). "open" is the
 *  backlog — the id predates the board and is kept so old links still work. */
export const STATUS_ORDER: TaskStatus[] = ["open", "on-hold", "in-progress", "in-review", "completed"]

export const STATUS_META: Record<TaskStatus, {
  en: string; ar: string
  /** dot colour */
  dot: string
  /** donut / bar colour, as a CSS colour */
  color: string
  /** one-line hint under the hero count */
  hint: string; hintAr: string
}> = {
  open:          { en: "Backlog",     ar: "قائمة الانتظار", dot: "bg-foreground/70",  color: "color-mix(in oklab, var(--foreground) 75%, transparent)", hint: "Waiting to start",         hintAr: "بإنتظار البدء" },
  "on-hold":     { en: "On hold",     ar: "معلّقة",          dot: "bg-warning",        color: "var(--warning)", hint: "Waiting on another party", hintAr: "بانتظار طرف آخر" },
  "in-progress": { en: "In progress", ar: "قيد التنفيذ",     dot: "bg-success",        color: "var(--success)", hint: "Working on it now",        hintAr: "تعمل عليها الآن" },
  "in-review":   { en: "In review",   ar: "قيد المراجعة",    dot: "bg-info",           color: "var(--info)",    hint: "Waiting for sign-off",     hintAr: "بانتظار الاعتماد" },
  completed:     { en: "Completed",   ar: "مكتمل",           dot: "bg-success",        color: "var(--success)", hint: "Done",                     hintAr: "منجزة" },
}

export const isStatus = (v: string | null | undefined): v is TaskStatus =>
  !!v && (STATUS_ORDER as string[]).includes(v)

export const CATEGORIES: { id: CategoryId; en: string; ar: string; chip: string; dot: string }[] = [
  { id: "operations", en: "Operations",      ar: "العمليات",          chip: "bg-soft-accent text-primary",                  dot: "bg-primary" },
  { id: "design",     en: "Design",          ar: "التصميم",           chip: "bg-soft-accent text-primary",                  dot: "bg-primary" },
  { id: "hr",         en: "Human resources", ar: "الموارد البشرية",   chip: "bg-error-fill text-error",                     dot: "bg-error" },
  { id: "it",         en: "IT",              ar: "تقنية المعلومات",   chip: "bg-[#a997c7]/15 text-[#a997c7]",               dot: "bg-[#a997c7]" },
  { id: "strategy",   en: "Strategy",        ar: "الاستراتيجية",      chip: "bg-foreground/10 text-foreground",             dot: "bg-foreground" },
  { id: "finance",    en: "Finance",         ar: "المالية",           chip: "bg-success-fill text-success",                 dot: "bg-success" },
]
export const categoryById = (id?: string) => CATEGORIES.find((c) => c.id === id)

export const SPRINTS: { id: string; en: string; ar: string }[] = [
  { id: "s23", en: "Sprint 23", ar: "سبرنت 23" },
  { id: "s24", en: "Sprint 24", ar: "سبرنت 24" },
  { id: "s25", en: "Sprint 25", ar: "سبرنت 25" },
]
export const CURRENT_SPRINT = "s24"
export const sprintById = (id?: string) => SPRINTS.find((s) => s.id === id)

export const PRIORITY_META: Record<TaskPriority, { en: string; ar: string; dot: string; text: string }> = {
  high:   { en: "High",   ar: "عالية",   dot: "bg-error",   text: "text-error" },
  medium: { en: "Medium", ar: "متوسطة",  dot: "bg-warning", text: "text-warning" },
  low:    { en: "Low",    ar: "منخفضة",  dot: "bg-foreground/40", text: "text-muted-foreground" },
}
export const PRIORITIES: TaskPriority[] = ["high", "medium", "low"]

/** Characters and words in a block of text, for the editor counters. */
export const textStats = (s: string) => ({
  chars: s.length,
  words: s.trim() === "" ? 0 : s.trim().split(/\s+/).length,
})
