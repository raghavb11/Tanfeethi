import { createCollection, newId } from "../collections"

/** Polls & surveys shown on the Knowledge page ("الاستبيانات والتصويت",
 *  Figma 2028:3744 · 2441:5698 · 4352:14026). The full survey programme
 *  (multi-question questionnaires) lives in the Surveys module (/surveys). */
export type PollKind = "poll" | "survey"
export type PollStatus = "open" | "closed" | "draft"
export type KPollOption = { id: string; label: string; labelAr: string; votes: number }

export type KPoll = {
  id: string
  kind: PollKind
  status: PollStatus
  question: string
  questionAr: string
  /** Department tag (e.g. Operations) — shown on the phone cards. */
  dept?: string
  deptAr?: string
  /** "Closes in 2 days" / "Closed since Monday". */
  when: string
  whenAr: string
  publishDate?: string
  fromDepts?: string[]
  audience?: string[]
  options: KPollOption[]
  /** Option the signed-in employee voted for (null = not voted yet). */
  myVote: string | null
}

const SEED: KPoll[] = [
  {
    id: "kp-briefing", kind: "poll", status: "open",
    question: "What's the best time for the morning briefing?", questionAr: "ما أفضل موعد لإحاطة الصباح؟",
    dept: "Operations", deptAr: "عمليات",
    when: "Closes in 2 days", whenAr: "يغلق بعد يومين",
    options: [
      { id: "o8", label: "08:00", labelAr: "08:00", votes: 26 },
      { id: "o9", label: "09:00", labelAr: "09:00", votes: 96 },
      { id: "o10", label: "10:00", labelAr: "10:00", votes: 6 },
    ],
    myVote: null,
  },
  {
    id: "kp-townhall", kind: "poll", status: "closed",
    question: "Which day suits the monthly town hall?", questionAr: "ما اليوم الأنسب للقاء الشهري المفتوح؟",
    dept: "Corporate communications", deptAr: "الاتصال المؤسسي",
    when: "Closed since Monday", whenAr: "مغلق منذ يوم الاثنين",
    options: [
      { id: "sun", label: "Sunday", labelAr: "الأحد", votes: 26 },
      { id: "tue", label: "Tuesday", labelAr: "الثلاثاء", votes: 96 },
      { id: "thu", label: "Thursday", labelAr: "الخميس", votes: 6 },
    ],
    myVote: "tue",
  },
  {
    id: "ks-workplace", kind: "survey", status: "closed",
    question: "How satisfied are you with the new shared workspace?", questionAr: "ما مدى رضاك عن مساحة العمل المشتركة الجديدة؟",
    dept: "Facilities", deptAr: "المرافق",
    when: "Closed Aug 3", whenAr: "أُغلق ٣ أغسطس",
    options: [
      { id: "s1", label: "Very satisfied", labelAr: "راضٍ جدًا", votes: 26 },
      { id: "s2", label: "Satisfied", labelAr: "راضٍ", votes: 96 },
      { id: "s3", label: "Not satisfied", labelAr: "غير راضٍ", votes: 6 },
    ],
    myVote: null,
  },
]

const store = createCollection<KPoll>(SEED, "knowledge-polls")
export const usePolls = () => store.use()
export const getPolls = () => store.get()
export const addPoll = (p: KPoll) => store.add(p)
export const updatePoll = (id: string, patch: Partial<KPoll>) => store.update(id, patch)
export const deletePoll = (id: string) => store.remove(id)
export const newPollId = () => newId("kp")

export function castVote(id: string, optionId: string) {
  const p = store.getById(id)
  if (!p || p.myVote) return
  store.update(id, {
    myVote: optionId,
    options: p.options.map((o) => (o.id === optionId ? { ...o, votes: o.votes + 1 } : o)),
  })
}

export const pollTotal = (p: KPoll) => p.options.reduce((s, o) => s + o.votes, 0)
/** Whole-number percentages for each option. */
export const pollPct = (p: KPoll, o: KPollOption) => {
  const total = pollTotal(p)
  return total ? Math.round((o.votes / total) * 100) : 0
}
