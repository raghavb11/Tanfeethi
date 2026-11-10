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
  /** Add-FAQ modal fields (Figma 2485:3307). */
  status?: "Published" | "Draft"
  publishDate?: string
  /** Target employees (department ids); empty = everyone. */
  audience?: string[]
}

const SEED: Faq[] = [
  // Knowledge-library questions drawn on the Knowledge page (Figma 2028:3744)
  { id: "fk1", categories: ["Documents"], q: "How do I request access to a shared folder?", qAr: "كيف أطلب صلاحية الوصول إلى مجلد مشترك؟", a: "Send the request from the folder page using the “Request Access” button; it goes to the folder owner for approval within one business day. You'll get an email once approved, and the folder will appear automatically in “Shared Folder”.", aAr: "أرسل الطلب من صفحة المجلد عبر زر «طلب صلاحية»، فيصل إلى مالك المجلد للاعتماد خلال يوم عمل واحد. تصلك رسالة في البريد عند الموافقة، ويظهر المجلد تلقائياً في «المجلد المشترك».", relatedDocs: [], relatedLinks: [{ label: "Request access", url: "/documents" }], upvotes: 34, downvotes: 1, feedback: [] },
  { id: "fk2", categories: ["Documents"], q: "How long are archived documents kept?", qAr: "ما مدة الاحتفاظ بالمستندات المؤرشفة؟", a: "Archived documents are kept for seven years in read-only folders, then reviewed by Legal & Compliance before disposal.", aAr: "تُحفظ المستندات المؤرشفة سبع سنوات في مجلدات للقراءة فقط، ثم تراجعها الشؤون القانونية والامتثال قبل إتلافها.", relatedDocs: [], relatedLinks: [], upvotes: 12, downvotes: 0, feedback: [] },
  { id: "fk3", categories: ["Documents"], q: "Who approves updates to operating policies?", qAr: "من يعتمد تحديث سياسات التشغيل؟", a: "The policy owner drafts the change; the department head and the Operations Excellence office approve it before it is published to the library.", aAr: "يُعدّ مالك السياسة التعديل، ثم يعتمده مدير الإدارة ومكتب التميّز التشغيلي قبل نشره في المكتبة.", relatedDocs: [], relatedLinks: [], upvotes: 9, downvotes: 0, feedback: [] },
  { id: "fk4", categories: ["Documents"], q: "How do I share a document with an external party?", qAr: "كيف أشارك مستنداً مع جهة خارجية؟", a: "Use “Share externally” from the document's menu. A time-limited link is created after your manager approves it; restricted documents can't be shared outside the company.", aAr: "استخدم «مشاركة خارجية» من قائمة المستند. يُنشأ رابط محدود المدة بعد موافقة مديرك، ولا يمكن مشاركة المستندات المقيّدة خارج الشركة.", relatedDocs: [], relatedLinks: [], upvotes: 15, downvotes: 2, feedback: [] },
  { id: "fk5", categories: ["Documents"], q: "Can a deleted file be restored?", qAr: "هل يمكن استرجاع ملف محذوف؟", a: "Yes — deleted files stay in the recycle bin for 30 days. Ask the folder owner or the IT Service Desk to restore one.", aAr: "نعم، تبقى الملفات المحذوفة في سلة المحذوفات ٣٠ يومًا. اطلب من مالك المجلد أو مكتب خدمة تقنية المعلومات استرجاعها.", relatedDocs: [], relatedLinks: [], upvotes: 21, downvotes: 0, feedback: [] },
  { id: "f1", categories: ["People"], q: "How do I request annual leave?", qAr: "كيف أطلب إجازة سنوية؟", a: "Open the Employee Center → Leave, choose your dates and submit for manager approval. You'll receive a notification once it's actioned.", aAr: "افتح مركز الموظف ← الإجازات، اختر التواريخ وأرسلها لاعتماد المدير. ستصلك إشعار بمجرد اتخاذ الإجراء.", relatedDocs: ["d7"], relatedLinks: [], upvotes: 42, downvotes: 3, feedback: [{ id: "fb1", userId: "u-sara", who: "Sara Al-Mutairi", initials: "SM", text: "The approval steps changed recently — this answer looks out of date.", time: "2d ago" }, { id: "fb2", userId: "u-mohammad", who: "Mohammad Iqbal", initials: "MI", text: "Doesn't mention the annual carry-over limit.", time: "5d ago" }] },
  { id: "f2", categories: ["Finance", "Travel"], q: "What is the expense reimbursement limit?", qAr: "ما حد استرداد المصروفات؟", a: "Limits are defined in the Travel & Expense Policy v2.4 by grade and category. Submit claims within 30 days of the expense date.", aAr: "الحدود محددة في سياسة السفر والمصروفات الإصدار ٢٫٤ حسب الدرجة والفئة. قدّم المطالبات خلال ٣٠ يومًا من تاريخ المصروف.", relatedDocs: ["d10"], relatedLinks: [{ label: "Travel & Expense Policy", url: "/policies/p2" }], upvotes: 28, downvotes: 1, feedback: [] },
  { id: "f3", categories: ["IT"], q: "How do I reset my portal password?", qAr: "كيف أعيد ضبط كلمة مرور البوابة؟", a: "Sign-in uses Microsoft Entra ID single sign-on — use the company password reset flow. For lockouts, contact the IT Service Desk.", aAr: "الدخول عبر Microsoft Entra ID — استخدم إجراء إعادة تعيين كلمة المرور للشركة. عند القفل تواصل مع مكتب خدمة تقنية المعلومات.", relatedDocs: [], relatedLinks: [{ label: "IT Service Desk", url: "https://servicedesk.example" }], upvotes: 55, downvotes: 2, feedback: [] },
  { id: "f4", categories: ["People"], q: "Where can I find my payslip?", qAr: "أين أجد كشف الراتب؟", a: "Payslips are published monthly in the Employee Center → Payroll. Ramadan and off-cycle adjustments appear on the same screen.", aAr: "تُنشر كشوف الرواتب شهريًا في مركز الموظف ← الرواتب. تظهر تعديلات رمضان والدورات الاستثنائية في الشاشة نفسها.", relatedDocs: [], relatedLinks: [], upvotes: 30, downvotes: 0, feedback: [] },
  { id: "f5", categories: ["IT"], q: "How do I request new hardware or software?", qAr: "كيف أطلب أجهزة أو برامج جديدة؟", a: "Raise a request from Services → IT. Standard items are auto-approved; non-standard requests route to your line manager and IT.", aAr: "قدّم طلبًا من الخدمات ← تقنية المعلومات. البنود القياسية تُعتمد تلقائيًا، وغير القياسية تُحوّل لمديرك ولتقنية المعلومات.", relatedDocs: [], relatedLinks: [], upvotes: 18, downvotes: 1, feedback: [] },
  { id: "f6", categories: ["Facilities"], q: "How do I book a meeting room?", qAr: "كيف أحجز قاعة اجتماعات؟", a: "Meeting rooms are booked through Outlook or the Services → Facilities tile. Visitor bays and parking follow the same flow.", aAr: "تُحجز قاعات الاجتماعات عبر Outlook أو بطاقة الخدمات ← المرافق. مواقف الزوّار تتبع الإجراء نفسه.", relatedDocs: [], relatedLinks: [], upvotes: 12, downvotes: 0, feedback: [] },
  { id: "f7", categories: ["Travel"], q: "How do I arrange business travel?", qAr: "كيف أرتّب سفر العمل؟", a: "Create a travel request in Services → Travel at least 7 days ahead. Approved trips sync to the travel desk for booking.", aAr: "أنشئ طلب سفر في الخدمات ← السفر قبل ٧ أيام على الأقل. تُزامَن الرحلات المعتمدة مع مكتب السفر للحجز.", relatedDocs: [], relatedLinks: [], upvotes: 9, downvotes: 0, feedback: [] },
  { id: "f8", categories: ["People"], q: "Who do I contact about a workplace concern?", qAr: "بمن أتواصل بشأن مشكلة في العمل؟", a: "Reach out to your HR Business Partner, or use the confidential Speak-Up channel described in the Code of Conduct.", aAr: "تواصل مع شريك الموارد البشرية، أو استخدم قناة الإبلاغ السرية الموضحة في مدونة السلوك.", relatedDocs: [], relatedLinks: [], upvotes: 21, downvotes: 0, feedback: [] },
]

const store = createCollection<Faq>(SEED, "faqs-v2")
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
