/** Learning — mock data for the learning dashboard (Figma 2028:5236, phone 3610:8241).
 *  Every user-facing string carries an English and an Arabic form. */

export type L = { en: string; ar: string }

export const learner = {
  streakDays: 11,
  longestStreak: 18,
  /** Daily goal in minutes. */
  dailyGoal: 45,
  todayMinutes: 30,
  /** Change vs last week, percent. */
  weekOverWeek: 18,
  /** A day counts toward "days learned" at this many minutes. */
  activeDayMinutes: 15,
}

/** Minutes per day, Sunday → Saturday; the last entry is today. Totals 3 h 45 min. */
export const week: { day: L; minutes: number; today?: boolean }[] = [
  { day: { en: "S", ar: "ح" }, minutes: 45 },
  { day: { en: "M", ar: "ن" }, minutes: 25 },
  { day: { en: "T", ar: "ث" }, minutes: 45 },
  { day: { en: "W", ar: "ر" }, minutes: 10 },
  { day: { en: "T", ar: "خ" }, minutes: 45 },
  { day: { en: "F", ar: "ج" }, minutes: 25 },
  { day: { en: "S", ar: "س" }, minutes: 30, today: true },
]

export type Course = {
  id: string
  title: L
  category: L
  unit: number
  units: number
  progress: number
}

export const inProgress: Course[] = [
  { id: "c1", title: { ar: "الحضور التنفيذي في 60 دقيقة", en: "Executive presence in 60 minutes" }, category: { ar: "قيادة", en: "Leadership" }, unit: 4, units: 6, progress: 72 },
  { id: "c2", title: { ar: "إدارة الوقت للقادة", en: "Time management for leaders" }, category: { ar: "قيادة", en: "Leadership" }, unit: 2, units: 5, progress: 35 },
]

export type LearningPath = {
  id: string
  title: L
  category: L
  units: number
  weeks: number
  hours: number
  icon: "users" | "concierge" | "sparkles" | "wallet" | "shield" | "mic"
}

export const learningPaths: LearningPath[] = [
  { id: "p1", title: { ar: "مسار المدير الأول", en: "First-time manager path" }, category: { ar: "قيادة", en: "Leadership" }, units: 6, weeks: 12, hours: 18, icon: "users" },
  { id: "p2", title: { ar: "التميز في تجربة الضيوف", en: "Guest experience excellence" }, category: { ar: "عمليات", en: "Operations" }, units: 5, weeks: 8, hours: 12, icon: "concierge" },
  { id: "p3", title: { ar: "الذكاء الاصطناعي في العمل", en: "AI at work" }, category: { ar: "تقنية", en: "Technology" }, units: 4, weeks: 6, hours: 9, icon: "sparkles" },
  { id: "p4", title: { ar: "أساسيات الإدارة المالية", en: "Finance fundamentals" }, category: { ar: "مالية", en: "Finance" }, units: 5, weeks: 10, hours: 14, icon: "wallet" },
  { id: "p5", title: { ar: "السلامة والجودة في الصالات", en: "Lounge safety & quality" }, category: { ar: "عمليات", en: "Operations" }, units: 4, weeks: 8, hours: 10, icon: "shield" },
  { id: "p6", title: { ar: "التواصل التنفيذي", en: "Executive communication" }, category: { ar: "قيادة", en: "Leadership" }, units: 6, weeks: 12, hours: 16, icon: "mic" },
]

export type Workshop = { id: string; title: L; instructor: L; initials: string; date: L; time: string }

export const workshops: Workshop[] = [
  { id: "w1", title: { ar: "إتقان الذكاء الاصطناعي للمديرين", en: "Mastering AI for managers" }, instructor: { ar: "د. لينا حسن", en: "Dr. Lina Hassan" }, initials: "LH", date: { ar: "6 مايو", en: "6 May" }, time: "14:00" },
  { id: "w2", title: { ar: "التفاوض تحت الضغط", en: "Negotiating under pressure" }, instructor: { ar: "عمر الصالح", en: "Omar Al-Saleh" }, initials: "OS", date: { ar: "9 مايو", en: "9 May" }, time: "10:00" },
]

export type Recommendation = { id: string; title: L; letter: L; duration: L }

export const recommendations: Recommendation[] = [
  { id: "r1", title: { ar: "أساسيات الإلقاء", en: "Presentation basics" }, letter: { ar: "أ", en: "P" }, duration: { ar: "45 د", en: "45 min" } },
  { id: "r2", title: { ar: "التفكير الاستراتيجي", en: "Strategic thinking" }, letter: { ar: "ت", en: "S" }, duration: { ar: "1 س 20 د", en: "1 h 20 min" } },
  { id: "r3", title: { ar: "إدارة الهندسة 101", en: "Engineering management 101" }, letter: { ar: "إ", en: "E" }, duration: { ar: "2 س", en: "2 h" } },
  { id: "r4", title: { ar: "الكتابة العربية في الأعمال", en: "Arabic business writing" }, letter: { ar: "ك", en: "A" }, duration: { ar: "50 د", en: "50 min" } },
]

export type Certificate = { id: string; title: L; issued: L }

export const certificates: Certificate[] = [
  { id: "cert1", title: { ar: "أساسيات السحابة", en: "Cloud fundamentals" }, issued: { ar: "يناير 2026", en: "January 2026" } },
  { id: "cert2", title: { ar: "محترف عمليات الصالات التنفيذية", en: "Executive lounge operations professional" }, issued: { ar: "مارس 2026", en: "March 2026" } },
]
