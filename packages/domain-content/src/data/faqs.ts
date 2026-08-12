import { createCollection, newId } from "../collections"

export type FaqLink = { label: string; url: string }
export type FaqFeedback = { id: string; userId: string; who: string; initials: string; text: string; time: string; resolved?: boolean }

export type Faq = {
  id: string
  categories: string[]
  allDepartments?: boolean
  departments?: string[]
  q: string
  qAr: string
  a: string
  aAr: string
  relatedDocs: string[]
  relatedLinks: FaqLink[]
  upvotes: number
  downvotes: number
  feedback: FaqFeedback[]
}

const SEED: Faq[] = [
  { id: "f1", categories: ["People"], q: "How do I request annual leave?", qAr: "كيف أطلب إجازة سنوية؟", a: "Open the Employee Center → Leave, choose your dates and submit for manager approval. You'll receive a notification once it's actioned.", aAr: "افتح مركز الموظف ← الإجازات، اختر التواريخ وأرسلها لاعتماد المدير. ستصلك إشعار بمجرد اتخاذ الإجراء.", relatedDocs: ["d7"], relatedLinks: [], upvotes: 42, downvotes: 3, feedback: [{ id: "fb1", userId: "u-sara", who: "Sara Al-Mutairi", initials: "SM", text: "The approval steps changed recently — this answer looks out of date.", time: "2d ago" }, { id: "fb2", userId: "u-mohammad", who: "Mohammad Iqbal", initials: "MI", text: "Doesn't mention the annual carry-over limit.", time: "5d ago" }] },
  { id: "f2", categories: ["Finance", "Travel"], q: "What is the expense reimbursement limit?", qAr: "ما حد استرداد المصروفات؟", a: "Limits are defined in the Travel & Expense Policy v2.4 by grade and category. Submit claims within 30 days of the expense date.", aAr: "الحدود محددة في سياسة السفر والمصروفات الإصدار ٢٫٤ حسب الدرجة والفئة. قدّم المطالبات خلال ٣٠ يومًا من تاريخ المصروف.", relatedDocs: ["d10"], relatedLinks: [{ label: "Travel & Expense Policy", url: "/policies/p2" }], upvotes: 28, downvotes: 1, feedback: [] },
  { id: "f3", categories: ["IT"], q: "How do I reset my portal password?", qAr: "كيف أعيد ضبط كلمة مرور البوابة؟", a: "Sign-in uses Microsoft Entra ID single sign-on — use the company password reset flow. For lockouts, contact the IT Service Desk.", aAr: "الدخول عبر Microsoft Entra ID — استخدم إجراء إعادة تعيين كلمة المرور للشركة. عند القفل تواصل مع مكتب خدمة تقنية المعلومات.", relatedDocs: [], relatedLinks: [{ label: "IT Service Desk", url: "https://servicedesk.example" }], upvotes: 55, downvotes: 2, feedback: [] },
  { id: "f4", categories: ["People"], q: "Where can I find my payslip?", qAr: "أين أجد كشف الراتب؟", a: "Payslips are published monthly in the Employee Center → Payroll. Ramadan and off-cycle adjustments appear on the same screen.", aAr: "تُنشر كشوف الرواتب شهريًا في مركز الموظف ← الرواتب. تظهر تعديلات رمضان والدورات الاستثنائية في الشاشة نفسها.", relatedDocs: [], relatedLinks: [], upvotes: 30, downvotes: 0, feedback: [] },
  { id: "f5", categories: ["IT"], q: "How do I request new hardware or software?", qAr: "كيف أطلب أجهزة أو برامج جديدة؟", a: "Raise a request from Services → IT. Standard items are auto-approved; non-standard requests route to your line manager and IT.", aAr: "قدّم طلبًا من الخدمات ← تقنية المعلومات. البنود القياسية تُعتمد تلقائيًا، وغير القياسية تُحوّل لمديرك ولتقنية المعلومات.", relatedDocs: [], relatedLinks: [], upvotes: 18, downvotes: 1, feedback: [] },
  { id: "f6", categories: ["Facilities"], q: "How do I book a meeting room?", qAr: "كيف أحجز قاعة اجتماعات؟", a: "Meeting rooms are booked through Outlook or the Services → Facilities tile. Visitor bays and parking follow the same flow.", aAr: "تُحجز قاعات الاجتماعات عبر Outlook أو بطاقة الخدمات ← المرافق. مواقف الزوّار تتبع الإجراء نفسه.", relatedDocs: [], relatedLinks: [], upvotes: 12, downvotes: 0, feedback: [] },
  { id: "f7", categories: ["Travel"], q: "How do I arrange business travel?", qAr: "كيف أرتّب سفر العمل؟", a: "Create a travel request in Services → Travel at least 7 days ahead. Approved trips sync to the travel desk for booking.", aAr: "أنشئ طلب سفر في الخدمات ← السفر قبل ٧ أيام على الأقل. تُزامَن الرحلات المعتمدة مع مكتب السفر للحجز.", relatedDocs: [], relatedLinks: [], upvotes: 9, downvotes: 0, feedback: [] },
  { id: "f8", categories: ["People"], q: "Who do I contact about a workplace concern?", qAr: "بمن أتواصل بشأن مشكلة في العمل؟", a: "Reach out to your HR Business Partner, or use the confidential Speak-Up channel described in the Code of Conduct.", aAr: "تواصل مع شريك الموارد البشرية، أو استخدم قناة الإبلاغ السرية الموضحة في مدونة السلوك.", relatedDocs: [], relatedLinks: [], upvotes: 21, downvotes: 0, feedback: [] },
]

const store = createCollection<Faq>(SEED, "faqs")
export const useFaqs = () => store.use()
export const getFaqById = (id: string) => store.getById(id)
export const addFaq = (f: Faq) => store.append(f)
export const updateFaq = (id: string, patch: Partial<Faq>) => store.update(id, patch)
export const deleteFaq = (id: string) => store.remove(id)
export const newFaqId = () => newId("faq")

/** Apply a vote change from prev → next ("up" | "down" | null). */
export function setFaqVote(id: string, prev: "up" | "down" | null, next: "up" | "down" | null) {
  const f = store.getById(id)
  if (!f) return
  let up = f.upvotes
  let down = f.downvotes
  if (prev === "up") up -= 1
  if (prev === "down") down -= 1
  if (next === "up") up += 1
  if (next === "down") down += 1
  store.update(id, { upvotes: Math.max(0, up), downvotes: Math.max(0, down) })
}

/** Append downvote feedback. */
export function addFaqFeedback(id: string, entry: { userId: string; who: string; initials: string; text: string }) {
  const f = store.getById(id)
  if (!f) return
  store.update(id, { feedback: [{ id: newId("fb"), ...entry, time: "Just now", resolved: false }, ...(f.feedback ?? [])] })
}

/** Mark a piece of feedback resolved (admin). */
export function resolveFaqFeedback(faqId: string, feedbackId: string) {
  const f = store.getById(faqId)
  if (!f) return
  store.update(faqId, { feedback: (f.feedback ?? []).map((fb) => (fb.id === feedbackId ? { ...fb, resolved: true } : fb)) })
}
