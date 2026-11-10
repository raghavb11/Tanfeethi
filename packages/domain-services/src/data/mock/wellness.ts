/** صحتي — steps challenge mock data (Figma 3056:6882 / 7394 / 7978, 2028:1506). */

export type Period = "daily" | "weekly" | "monthly"

export type HealthTile =
  | { kind: "stat"; icon: "steps" | "calories" | "streak"; value: string; valueAr: string; label: string; labelAr: string }
  | { kind: "nudge"; tone: "error" | "success" | "gold" | "neutral"; icon: "down" | "check" | "up" | "streak";
      title: string; titleAr: string; hint: string; hintAr: string }

/** Services home widget — exactly the four tiles drawn on 2028:1506. */
export const homeTiles: HealthTile[] = [
  { kind: "stat", icon: "steps", value: "10", valueAr: "10", label: "Steps", labelAr: "خطوات" },
  { kind: "stat", icon: "calories", value: "4", valueAr: "4", label: "Calories", labelAr: "سعرات حرارية" },
  { kind: "stat", icon: "streak", value: "4 weeks in a row", valueAr: "4 أسابيع متتالية", label: "In the top 10", labelAr: "ضمن أفضل 10" },
  { kind: "nudge", tone: "error", icon: "down", title: "Start Walking", titleAr: "ابدأ بالمشي", hint: "Step count dropped", hintAr: "انخفاض عدد الخطوات" },
]

/** Leaderboard page tiles per tab (2×2 grid: steps, calories, streak, nudge). */
export const periodTiles: Record<Period, HealthTile[]> = {
  monthly: [
    { kind: "stat", icon: "steps", value: "10", valueAr: "10", label: "Steps", labelAr: "خطوات" },
    { kind: "stat", icon: "calories", value: "4", valueAr: "4", label: "Calories", labelAr: "سعرات حرارية" },
    { kind: "nudge", tone: "neutral", icon: "streak", title: "4 weeks in a row", titleAr: "4 أسابيع متتالية", hint: "In the top 10", hintAr: "ضمن أفضل 10" },
    { kind: "nudge", tone: "success", icon: "check", title: "You hit today's goal", titleAr: "حققت هدف اليوم", hint: "You walked more than 7,000 steps", hintAr: "حققت أكثر من 7000 خطوة" },
  ],
  weekly: [
    { kind: "stat", icon: "steps", value: "10", valueAr: "10", label: "Steps", labelAr: "خطوات" },
    { kind: "stat", icon: "calories", value: "4", valueAr: "4", label: "Calories", labelAr: "سعرات حرارية" },
    { kind: "nudge", tone: "neutral", icon: "streak", title: "Your streak was broken", titleAr: "انقطعت سلسلتك", hint: "Walk today to rejoin the top 10", hintAr: "امشِ اليوم لتنضم ضمن أفضل 10 من جديد" },
    { kind: "nudge", tone: "gold", icon: "up", title: "You're on track", titleAr: "أنت على المسار الصحيح", hint: "Keep walking", hintAr: "استمر في المشي" },
  ],
  daily: [
    { kind: "stat", icon: "steps", value: "10", valueAr: "10", label: "Steps", labelAr: "خطوات" },
    { kind: "stat", icon: "calories", value: "4", valueAr: "4", label: "Calories", labelAr: "سعرات حرارية" },
    { kind: "nudge", tone: "neutral", icon: "streak", title: "Start a walking streak", titleAr: "ابدأ سلسلة المشي", hint: "Walk today to rank among the top 10 employees", hintAr: "امشِ اليوم لتتصدر ضمن أفضل 10 موظفين" },
    { kind: "nudge", tone: "error", icon: "down", title: "Increase your steps", titleAr: "زد من خطواتك", hint: "Step count dropped", hintAr: "انخفاض عدد الخطوات" },
  ],
}

export type Bar = { label: string; labelAr: string; value: number; status: "met" | "partial" | "low"; current?: boolean }

/** Step reports chart. Monthly uses Arabic month names in Arabic (the design
 *  showed English Jan–Dec) and compares with last month, not "last week". */
export const stepReports: Partial<Record<Period, {
  title: string; titleAr: string; total: number; bars: Bar[]
  changePct: number; compare: string; compareAr: string; compareSteps: number
}>> = {
  monthly: {
    title: "Your progress this year", titleAr: "تقدّمك هذه السنة", total: 380357,
    changePct: 18, compare: "vs last month", compareAr: "عن الشهر الماضي", compareSteps: 31420,
    bars: [
      { label: "Jan", labelAr: "يناير", value: 100, status: "met" },
      { label: "Feb", labelAr: "فبراير", value: 100, status: "met" },
      { label: "Mar", labelAr: "مارس", value: 100, status: "met" },
      { label: "Apr", labelAr: "أبريل", value: 100, status: "met" },
      { label: "May", labelAr: "مايو", value: 100, status: "met" },
      { label: "Jun", labelAr: "يونيو", value: 100, status: "met" },
      { label: "Jul", labelAr: "يوليو", value: 69.5, status: "partial" },
      { label: "Aug", labelAr: "أغسطس", value: 100, status: "met" },
      { label: "Sep", labelAr: "سبتمبر", value: 47.3, status: "low" },
      { label: "Oct", labelAr: "أكتوبر", value: 100, status: "met" },
      { label: "Nov", labelAr: "نوفمبر", value: 74, status: "met" },
      { label: "Dec", labelAr: "ديسمبر", value: 61.8, status: "partial", current: true },
    ],
  },
  weekly: {
    title: "Your Progress This Week", titleAr: "تقدّمك هذا الأسبوع", total: 134806,
    changePct: 18, compare: "vs last week", compareAr: "عن الأسبوع الماضي", compareSteps: 24265,
    bars: [
      { label: "S", labelAr: "ح", value: 100, status: "met" },
      { label: "N", labelAr: "ن", value: 69.5, status: "partial" },
      { label: "T", labelAr: "ث", value: 100, status: "met" },
      { label: "W", labelAr: "ر", value: 47.3, status: "low" },
      { label: "T", labelAr: "خ", value: 100, status: "met" },
      { label: "F", labelAr: "ج", value: 74, status: "met" },
      { label: "S", labelAr: "س", value: 61.8, status: "partial", current: true },
    ],
  },
}

export type LeaderRow = {
  rank: number; name: string; nameAr: string; initials: string
  steps: number; calories: number; me?: boolean
}

const monthlyBoard: LeaderRow[] = [
  { rank: 1, name: "Faisal Mansour Al-Tamimi", nameAr: "فيصل منصور التميمي", initials: "FT", steps: 337428, calories: 16858 },
  { rank: 2, name: "Linda Fahd Al-Jabri", nameAr: "ليندا فهد الجابري", initials: "LJ", steps: 320912, calories: 15642 },
  { rank: 3, name: "Rami Khaled Al-Harbi", nameAr: "رامي خالد الحربي", initials: "RH", steps: 298765, calories: 14903 },
  { rank: 4, name: "Sara Yousef Al-Qahtani", nameAr: "سارة يوسف القحطاني", initials: "SQ", steps: 285430, calories: 13457 },
  { rank: 5, name: "Mohammed Nasser Al-Zahrani", nameAr: "محمد ناصر الزهراني", initials: "MZ", steps: 270112, calories: 12891, me: true },
  { rank: 6, name: "Huda Abdullah Al-Shammari", nameAr: "هدى عبد الله الشمري", initials: "HS", steps: 256784, calories: 11670 },
  { rank: 100, name: "Reem Fahd Al-Hashemi", nameAr: "ريم فهد الهاشمي", initials: "RH", steps: 250784, calories: 10670 },
]

/** The design reuses one board for every tab; weekly/daily scale it down. */
const scale = (rows: LeaderRow[], f: number) =>
  rows.map((r) => ({ ...r, steps: Math.round(r.steps * f), calories: Math.round(r.calories * f) }))

export const leaderboards: Record<Period, LeaderRow[]> = {
  monthly: monthlyBoard,
  weekly: scale(monthlyBoard, 0.24),
  daily: scale(monthlyBoard, 0.036),
}

/** Grouped in threes — never Indian grouping. */
export const fmt = (n: number) => n.toLocaleString("en-US")
