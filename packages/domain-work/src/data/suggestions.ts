import * as React from "react"

/** The assistant's suggestions on a project ("اقتراح المساعد", Figma 3580:8261).
 *  Each one can be added as a sub-task or turned down. Demo store. */
export type Suggestion = {
  id: string
  /** Project the suggestion is about. */
  subjectId: string
  text: string; textAr: string
}

const SEED: Suggestion[] = [
  { id: "sg1", subjectId: "p2", text: "Pull the figures from the finance dashboard", textAr: "اسحب الأرقام من لوحة المالية" },
  { id: "sg2", subjectId: "p2", text: "Compare the hospitality contracts with the Jeddah contract", textAr: "قارن عقود الضيافة بعقد جدة" },
  { id: "sg3", subjectId: "p1", text: "Book a 20-minute walkthrough with the IT manager", textAr: "احجز 20 دقيقة مع مدير التقنية لاستعراض التجربة" },
  { id: "sg4", subjectId: "p6", text: "Attach the contractor's revised scope before sign-off", textAr: "أرفق النطاق المعدّل من المقاول قبل الاعتماد" },
]

let list: Suggestion[] = SEED
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l) }

export function useSuggestions(subjectId: string): Suggestion[] {
  const all = React.useSyncExternalStore(subscribe, () => list)
  return React.useMemo(() => all.filter((s) => s.subjectId === subjectId), [all, subjectId])
}

/** Taken up or turned down — either way it leaves the card. */
export function dismissSuggestion(id: string) {
  list = list.filter((s) => s.id !== id)
  emit()
}

// ── Suggestions while a project is being created ───────────────────────────
type Idea = { key: string; text: string; textAr: string }

/** First-step subtasks the assistant proposes for a new project, by category. */
const STARTERS: Record<string, Idea[]> = {
  operations: [
    { key: "op1", text: "Map the current process and its owners", textAr: "ارسم العملية الحالية ومسؤوليها" },
    { key: "op2", text: "Agree the service levels with the lounge managers", textAr: "اتفق على مستويات الخدمة مع مدراء الصالات" },
    { key: "op3", text: "Plan the rollout across Riyadh and Jeddah", textAr: "خطّط للتطبيق في الرياض وجدة" },
  ],
  design: [
    { key: "de1", text: "Gather the guest-journey pain points", textAr: "اجمع نقاط الألم في رحلة الضيف" },
    { key: "de2", text: "Prepare wireframes for review", textAr: "جهّز المخططات الأولية للمراجعة" },
    { key: "de3", text: "Run a usability test with five guests", textAr: "نفّذ اختبار استخدام مع خمسة ضيوف" },
  ],
  hr: [
    { key: "hr1", text: "Confirm the roles and headcount needed", textAr: "حدّد الأدوار وعدد الموظفين المطلوب" },
    { key: "hr2", text: "Draft the job descriptions", textAr: "اكتب الأوصاف الوظيفية" },
    { key: "hr3", text: "Schedule onboarding with the training team", textAr: "جدول التهيئة مع فريق التدريب" },
  ],
  it: [
    { key: "it1", text: "Document the technical requirements", textAr: "وثّق المتطلبات التقنية" },
    { key: "it2", text: "Review security and access with the IT manager", textAr: "راجع الأمن والصلاحيات مع مدير التقنية" },
    { key: "it3", text: "Set up a test environment", textAr: "جهّز بيئة الاختبار" },
  ],
  strategy: [
    { key: "st1", text: "Define the objectives and success measures", textAr: "حدّد الأهداف ومؤشرات النجاح" },
    { key: "st2", text: "Pull the figures from the finance dashboard", textAr: "اسحب الأرقام من لوحة المالية" },
    { key: "st3", text: "Book a briefing with the executive team", textAr: "احجز إحاطة مع الفريق التنفيذي" },
  ],
  finance: [
    { key: "fi1", text: "Prepare the budget estimate", textAr: "جهّز تقدير الميزانية" },
    { key: "fi2", text: "Get quotes from three suppliers", textAr: "احصل على عروض أسعار من ثلاثة موردين" },
    { key: "fi3", text: "Route the approval to finance", textAr: "أرسل طلب الاعتماد إلى المالية" },
  ],
}

/** Ideas for a project being created: category starters, plus one tied to its name. */
export function draftProjectIdeas(category: string, name: string): Idea[] {
  const base = STARTERS[category] ?? STARTERS.operations
  const n = name.trim()
  const named: Idea[] = n.length >= 3
    ? [{ key: `kick-${n}`, text: `Hold a kickoff meeting for "${n}"`, textAr: `اعقد اجتماع انطلاق لمشروع «${n}»` }]
    : []
  return [...named, ...base]
}
