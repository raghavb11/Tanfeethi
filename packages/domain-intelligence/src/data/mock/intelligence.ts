export type Confidence = "high" | "moderate" | "low"
export type InsightCategory = "work" | "email" | "meeting" | "risk" | "people"
export type Tone = "primary" | "emerald" | "blue" | "amber" | "violet" | "rose"

export const aiKpis = {
  insightsThisWeek: 127,
  accuracyPct: 94,
  timeSavedHours: 8.5,
  modelsUsed: 4,
}

export const suggestedPrompts: { en: string; ar: string }[] = [
  { en: "What's blocking Wave 2 this week?", ar: "وش اللي يعرقل الموجة الثانية هذا الأسبوع؟" },
  { en: "Forecast vendor backlog impact", ar: "توقّع أثر متأخرات الموردين" },
  { en: "Summarize my unread emails", ar: "لخّص لي الرسائل غير المقروءة" },
  { en: "Draft a status update for execs", ar: "اكتب تحديث حالة للقيادة" },
  { en: "Surface stale tasks", ar: "أظهر المهام الراكدة" },
]

export const predictions: {
  id: string
  title: string
  titleAr: string
  body: string
  bodyAr: string
  confidence: Confidence
  category: InsightCategory
  trend: "up" | "down" | "flat"
  trendValue: string
}[] = [
  {
    id: "pr1",
    title: "IT Tier-1 backlog will spike May 6",
    titleAr: "ارتفاع متوقع في متأخرات تقنية مستوى 1 يوم 6 مايو",
    body: "Predicted ticket volume exceeds SLA comfort by 12% unless two FTE shift from project work.",
    bodyAr: "حجم التذاكر المتوقع يتجاوز اتفاقية الخدمة بنسبة 12٪ ما لم يُحوَّل موظفان من أعمال المشاريع.",
    confidence: "high",
    category: "work",
    trend: "up",
    trendValue: "+12%",
  },
  {
    id: "pr2",
    title: "Design pod attrition risk",
    titleAr: "مخاطرة استنزاف فريق التصميم",
    body: "Voluntary turnover proxies spiked after the last roadmap revision. Listening sessions recommended within 10 days.",
    bodyAr: "ارتفعت مؤشرات نية الاستقالة بعد آخر تعديل لخارطة الطريق. يُنصح بجلسات استماع خلال 10 أيام.",
    confidence: "moderate",
    category: "people",
    trend: "up",
    trendValue: "+8%",
  },
  {
    id: "pr3",
    title: "Email response time improving",
    titleAr: "تحسّن في زمن الرد على البريد",
    body: "Median first-response time dropped 23% this month. Likely sustained for the next 2 weeks.",
    bodyAr: "متوسط زمن الرد الأول تراجع 23٪ هذا الشهر. متوقع استمراره لأسبوعين.",
    confidence: "high",
    category: "email",
    trend: "down",
    trendValue: "-23%",
  },
]

export const smartInsights: {
  id: string
  title: string
  titleAr: string
  detail: string
  detailAr: string
  category: InsightCategory
  group: "today" | "week"
  time: string
  timeAr: string
}[] = [
  {
    id: "in1",
    title: "Vendor approval blocking Wave 2",
    titleAr: "موافقة مورد تعرقل الموجة الثانية",
    detail: "Figma Enterprise contract awaits sign-off — 3 teams blocked.",
    detailAr: "عقد فيجما إنتربرايز ينتظر التوقيع — 3 فرق محجوبة.",
    category: "risk",
    group: "today",
    time: "2h ago",
    timeAr: "قبل ساعتين",
  },
  {
    id: "in2",
    title: "Maya's queue is over capacity",
    titleAr: "قائمة مايا تجاوزت الطاقة",
    detail: "Reach suggests delegating two tasks to even out load.",
    detailAr: "يقترح وصل تفويض مهمتين لتوازن الحمل.",
    category: "work",
    group: "today",
    time: "5h ago",
    timeAr: "قبل 5 ساعات",
  },
  {
    id: "in3",
    title: "3 unread executive emails",
    titleAr: "3 رسائل تنفيذية غير مقروءة",
    detail: "From Sara, Ahmed, and Procurement — flagged high-priority.",
    detailAr: "من سارة وأحمد والمشتريات — مُعلّمة كأولوية عالية.",
    category: "email",
    group: "today",
    time: "Today",
    timeAr: "اليوم",
  },
  {
    id: "in4",
    title: "Portfolio review decisions logged",
    titleAr: "قرارات مراجعة المحفظة موثقة",
    detail: "Wave 2 scope approved · 1 risk flagged (timeline slip).",
    detailAr: "اعتُمد نطاق الموجة الثانية · مخاطرة واحدة (تأخر زمني).",
    category: "meeting",
    group: "week",
    time: "Yesterday",
    timeAr: "أمس",
  },
  {
    id: "in5",
    title: "Pattern: recurring payroll questions",
    titleAr: "نمط: أسئلة رواتب متكررة",
    detail: "FAQ would cut volume by ~22%. Draft auto-prepared.",
    detailAr: "نشر الأسئلة الشائعة يقلّل الحجم ~22٪. المسوّدة جاهزة.",
    category: "people",
    group: "week",
    time: "2 days ago",
    timeAr: "قبل يومين",
  },
]

export const usefulNotes: {
  id: string
  text: string
  textAr: string
  source: string
  sourceAr: string
}[] = [
  {
    id: "n1",
    text: "Approve the Figma vendor request before Friday cut-off.",
    textAr: "اعتمد طلب مورد فيجما قبل نهاية الجمعة.",
    source: "Portfolio review",
    sourceAr: "مراجعة المحفظة",
  },
  {
    id: "n2",
    text: "Delegate headcount spreadsheet to Finance ops.",
    textAr: "فوّض جدول الكوادر لعمليات المالية.",
    source: "Reach suggestion",
    sourceAr: "اقتراح وصل",
  },
  {
    id: "n3",
    text: "Post a single incident update referencing DNS owners.",
    textAr: "انشر تحديثًا واحدًا للحادثة يشير لمسؤولي DNS.",
    source: "Comms playbook",
    sourceAr: "دليل التواصل",
  },
  {
    id: "n4",
    text: "Schedule a listening session with Design pod next week.",
    textAr: "حدّد جلسة استماع مع فريق التصميم الأسبوع القادم.",
    source: "Attrition signal",
    sourceAr: "إشارة استنزاف",
  },
]

export const recommendations: {
  id: string
  title: string
  titleAr: string
  impact: string
  impactAr: string
  tone: Tone
}[] = [
  {
    id: "r1",
    title: "Spin up surge crew Thu–Fri",
    titleAr: "تجهيز فريق دعم سريع الخميس–الجمعة",
    impact: "Recover ~36 tickets",
    impactAr: "تعويض ~36 تذكرة",
    tone: "primary",
  },
  {
    id: "r2",
    title: "Attach comms coach to incident INC-8891",
    titleAr: "إلحاق مدرّب تواصل بالحادثة INC-8891",
    impact: "Reduce duplicate narratives",
    impactAr: "تقليل تكرار السرد",
    tone: "blue",
  },
  {
    id: "r3",
    title: "Publish \"policy v3\" FAQ to Knowledge Hub",
    titleAr: "نشر أسئلة شائعة لـ«السياسة الإصدار 3»",
    impact: "Cut repeat questions ~22%",
    impactAr: "خفض الأسئلة المتكررة ~22٪",
    tone: "emerald",
  },
]

export const meetingSummaries: {
  id: string
  title: string
  titleAr: string
  when: string
  whenAr: string
  bullets: string[]
  bulletsAr: string[]
  duration: string
  durationAr: string
}[] = [
  {
    id: "m1",
    title: "Portfolio review",
    titleAr: "مراجعة المحفظة",
    when: "Today · 09:00",
    whenAr: "اليوم · 09:00",
    duration: "60 min",
    durationAr: "60 دقيقة",
    bullets: [
      "Approved Wave 2 scope for Reach — Services cohort",
      "Finance requested weekly burndown on vendor spend",
      "Risk: timeline slip on identity hardening (+1 week)",
    ],
    bulletsAr: [
      "اعتماد نطاق الموجة الثانية لـ ريتش — مجموعة الخدمات",
      "المالية طلبت تقرير أسبوعي لإنفاق الموردين",
      "مخاطرة: تأخر تعزيز الهوية (+ أسبوع)",
    ],
  },
  {
    id: "m2",
    title: "Zero-trust program sync",
    titleAr: "مزامنة برنامج Zero-Trust",
    when: "Yesterday · 14:00",
    whenAr: "أمس · 14:00",
    duration: "45 min",
    durationAr: "45 دقيقة",
    bullets: [
      "Device posture now blocks 3% of logins — expected",
      "Phased rollout to contractors in May",
    ],
    bulletsAr: [
      "وضعية الأجهزة تحجب 3٪ من تسجيلات الدخول — متوقع",
      "إطلاق مرحلي للمتعاقدين في مايو",
    ],
  },
]

export const knowledgeRecs: {
  id: string
  title: string
  titleAr: string
  match: number
}[] = [
  { id: "kr1", title: "Playbook · executive comms under incident", titleAr: "دليل · التواصل التنفيذي وقت الحوادث", match: 96 },
  { id: "kr2", title: "Policy library · contractor device posture", titleAr: "مكتبة السياسات · وضعية أجهزة المتعاقدين", match: 91 },
]

// ── AI Center conversations (Figma 2028:2252 / 4858:15788) ──────────────────
export type ChatAttachment = { name: string; kind: "PDF" | "Word" | "Excel" | "Image" | "File" }
export type ChatMessage = { id: string; role: "user" | "assistant"; text: string; textAr: string; attachments?: ChatAttachment[] }
export type Conversation = { id: string; title: string; titleAr: string; messages: ChatMessage[] }

export const conversations: Conversation[] = [
  {
    id: "c-mail", title: "Mail summary", titleAr: "تلخيص البريد",
    messages: [
      { id: "m1", role: "user", text: "Summarize my mail, review pending approvals and reorganize my schedule.", textAr: "لخص بريدي، راجع الموافقات المعلقة، و إعد تنظيم جدولي." },
      { id: "m2", role: "assistant", text: "Hi Fawaz — I'm summarizing your mail, reviewing your approvals and reorganizing your schedule now.", textAr: "أهلاً فواز، يتم الآن تلخيص بريدك، مراجعة الموافقات و إعادة تنظيم جدولك" },
    ],
  },
  { id: "c-q1", title: "Q1 report", titleAr: "تقرير الربع الأول", messages: [
    { id: "m1", role: "user", text: "Draft the Q1 operations report.", textAr: "أعدّ مسودة تقرير العمليات للربع الأول." },
    { id: "m2", role: "assistant", text: "Here's an outline: volumes, on-time performance, guest satisfaction and cost per movement. Shall I fill in the figures from the dashboard?", textAr: "إليك المخطط: الأحجام، الالتزام بالمواعيد، رضا الضيوف وتكلفة الحركة. هل أملأ الأرقام من لوحة المؤشرات؟" },
  ] },
  { id: "c-meetings", title: "Tomorrow's meetings", titleAr: "اجتماعات الغد", messages: [] },
  { id: "c-approvals", title: "Pending approvals", titleAr: "الموافقات المعلقة", messages: [] },
  { id: "c-leave", title: "Leave balance", titleAr: "رصيد الإجازات", messages: [] },
  { id: "c-travel", title: "Travel policy", titleAr: "سياسة السفر", messages: [] },
  { id: "c-expense", title: "Expense claim", titleAr: "مطالبة المصروفات", messages: [] },
  { id: "c-team", title: "Team performance", titleAr: "أداء الفريق", messages: [] },
  { id: "c-onboarding", title: "Onboarding checklist", titleAr: "قائمة الانضمام", messages: [] },
]

/** Suggestion chips under the thread. */
export const chatChips: { id: string; en: string; ar: string; icon: "report" | "calendar" | "approvals" }[] = [
  { id: "q1", en: "Q1 report", ar: "تقرير الربع الأول", icon: "report" },
  { id: "tomorrow", en: "Tomorrow's meetings", ar: "اجتماعات الغد", icon: "calendar" },
  { id: "awaiting", en: "View transactions awaiting response", ar: "عرض المعاملات بانتظار الرد", icon: "approvals" },
]

/** Canned assistant reply for the prototype (no model call). */
export function cannedReply(prompt: string, isAr: boolean, files: number): string {
  const p = prompt.toLowerCase()
  if (files > 0) return isAr ? `استلمت ${files === 1 ? "الملف" : `${files} ملفات`}. سألخّص المحتوى وأستخرج المهام والمواعيد المهمة.` : `Got ${files === 1 ? "the file" : `${files} files`}. I'll summarize them and pull out the key tasks and dates.`
  if (/meeting|اجتماع/.test(p)) return isAr ? "لديك ٣ اجتماعات غدًا: مراجعة العمليات ٩:٠٠، لجنة المشتريات ١١:٣٠، ومكالمة مع فريق جدة ١٤:٠٠." : "You have 3 meetings tomorrow: operations review 09:00, procurement committee 11:30 and a call with the Jeddah team 14:00."
  if (/report|تقرير/.test(p)) return isAr ? "جهّزت مسودة تقرير الربع الأول: الأحجام +12٪، الالتزام بالمواعيد 96٪، ورضا الضيوف 4.7 من 5." : "I've drafted the Q1 report: volumes +12%, on-time performance 96% and guest satisfaction 4.7 / 5."
  if (/await|transaction|معامل|موافق/.test(p)) return isAr ? "هناك ٤ معاملات بانتظار ردك: طلبا إجازة، مطالبة مصروفات، وطلب شراء. هل أفتح قائمة الموافقات؟" : "4 items are waiting for you: two leave requests, an expense claim and a purchase request. Open the approvals list?"
  return isAr ? "حسنًا، أعمل على ذلك الآن وسأوافيك بالنتيجة خلال لحظات." : "On it — I'll get back to you with the result in a moment."
}
