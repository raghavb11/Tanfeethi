/** Mock data for the Surveys & polls domain (BRD CM-04: surveys and polls
 *  with results capture). Demo-only fixtures. */

export type SurveyCategory = "Pulse" | "Facilities" | "Product" | "Culture" | "Wellbeing"

export const categoryAr: Record<SurveyCategory, string> = {
  Pulse: "نبض",
  Facilities: "المرافق",
  Product: "المنتج",
  Culture: "الثقافة",
  Wellbeing: "الرفاهية",
}

export type ActiveSurvey = {
  id: string
  title: string
  titleAr: string
  category: SurveyCategory
  questions: number
  minutes: number
  due: string
  dueAr: string
  closingSoon?: boolean
}

export type PollOption = { id: string; label: string; labelAr: string; votes: number }
export type PulsePoll = {
  id: string
  question: string
  questionAr: string
  options: PollOption[]
}

export type ResultBar = { label: string; labelAr: string; pct: number }
export type ClosedSurvey = {
  id: string
  title: string
  titleAr: string
  category: SurveyCategory
  responses: number
  participation: number
  closed: string
  closedAr: string
  headline: string
  headlineAr: string
  breakdown: ResultBar[]
}

export type SurveyQuestion =
  | { kind: "rating"; q: string; qAr: string }
  | { kind: "choice"; q: string; qAr: string; options: { label: string; labelAr: string }[] }
  | { kind: "text"; q: string; qAr: string }

export const activeSurveys: ActiveSurvey[] = [
  {
    id: "q3-pulse",
    title: "Q3 Employee Pulse",
    titleAr: "نبض الموظفين — الربع الثالث",
    category: "Pulse",
    questions: 8,
    minutes: 5,
    due: "Due Aug 8",
    dueAr: "الاستحقاق ٨ أغسطس",
    closingSoon: true,
  },
  {
    id: "facilities",
    title: "Workplace & Facilities",
    titleAr: "بيئة العمل والمرافق",
    category: "Facilities",
    questions: 6,
    minutes: 4,
    due: "Due Aug 12",
    dueAr: "الاستحقاق ١٢ أغسطس",
  },
  {
    id: "wajha-feedback",
    title: "Wajha Portal Feedback",
    titleAr: "ملاحظات بوابة وجهة",
    category: "Product",
    questions: 5,
    minutes: 3,
    due: "Due Aug 15",
    dueAr: "الاستحقاق ١٥ أغسطس",
  },
]

export const pulsePoll: PulsePoll = {
  id: "return-to-office",
  question: "How would you rate this week at work?",
  questionAr: "كيف تقيّم أسبوعك في العمل؟",
  options: [
    { id: "great", label: "Great", labelAr: "ممتاز", votes: 128 },
    { id: "good", label: "Good", labelAr: "جيد", votes: 96 },
    { id: "ok", label: "Okay", labelAr: "مقبول", votes: 41 },
    { id: "tough", label: "Tough", labelAr: "صعب", votes: 17 },
  ],
}

export const closedSurveys: ClosedSurvey[] = [
  {
    id: "onboarding",
    title: "Onboarding Experience 2026",
    titleAr: "تجربة الانضمام ٢٠٢٦",
    category: "Culture",
    responses: 214,
    participation: 82,
    closed: "Closed Jul 30",
    closedAr: "أُغلق ٣٠ يوليو",
    headline: "82% rated onboarding positively",
    headlineAr: "٨٢٪ قيّموا الانضمام إيجابيًا",
    breakdown: [
      { label: "Very positive", labelAr: "إيجابي جدًا", pct: 54 },
      { label: "Positive", labelAr: "إيجابي", pct: 28 },
      { label: "Neutral", labelAr: "محايد", pct: 12 },
      { label: "Negative", labelAr: "سلبي", pct: 6 },
    ],
  },
  {
    id: "wellbeing",
    title: "Wellbeing Check-in",
    titleAr: "استبيان الرفاهية",
    category: "Wellbeing",
    responses: 187,
    participation: 71,
    closed: "Closed Jul 22",
    closedAr: "أُغلق ٢٢ يوليو",
    headline: "Work–life balance is the top ask",
    headlineAr: "التوازن بين العمل والحياة هو الأولوية",
    breakdown: [
      { label: "Balance", labelAr: "التوازن", pct: 41 },
      { label: "Flexibility", labelAr: "المرونة", pct: 33 },
      { label: "Workload", labelAr: "حجم العمل", pct: 26 },
    ],
  },
]

// ── Full sectioned questionnaire (used by the full-page respond flow) ────────
export type FormQuestion =
  | { id: string; kind: "rating"; q: string; qAr: string; required?: boolean }
  | { id: string; kind: "scale"; q: string; qAr: string; required?: boolean }
  | { id: string; kind: "choice"; q: string; qAr: string; required?: boolean; options: { label: string; labelAr: string }[] }
  | { id: string; kind: "multi"; q: string; qAr: string; required?: boolean; options: { label: string; labelAr: string }[] }
  | { id: string; kind: "text"; q: string; qAr: string; required?: boolean }

export type FormSection = { title: string; titleAr: string; desc: string; descAr: string; questions: FormQuestion[] }
export type SurveyForm = { intro: string; introAr: string; minutes: number; sections: FormSection[] }

export const scaleLabels: { label: string; labelAr: string }[] = [
  { label: "Strongly disagree", labelAr: "أعارض بشدة" },
  { label: "Disagree", labelAr: "أعارض" },
  { label: "Neutral", labelAr: "محايد" },
  { label: "Agree", labelAr: "أوافق" },
  { label: "Strongly agree", labelAr: "أوافق بشدة" },
]

/** A rich example form with categories (sections) and 12 questions. */
export const q3PulseForm: SurveyForm = {
  intro: "Twelve short questions across five areas. Your answers are anonymous and aggregated with everyone else's — there are no individual reports.",
  introAr: "اثنا عشر سؤالًا قصيرًا عبر خمسة مجالات. إجاباتك مجهولة وتُجمّع مع إجابات الجميع — لا توجد تقارير فردية.",
  minutes: 5,
  sections: [
    {
      title: "Work Environment", titleAr: "بيئة العمل",
      desc: "Your physical and digital workspace.", descAr: "مساحة عملك المادية والرقمية.",
      questions: [
        { id: "we1", kind: "scale", required: true, q: "My workspace helps me do my best work.", qAr: "تساعدني مساحة عملي على تقديم أفضل ما لديّ." },
        { id: "we2", kind: "rating", required: true, q: "How satisfied are you with the office facilities?", qAr: "ما مدى رضاك عن مرافق المكتب؟" },
        { id: "we3", kind: "choice", required: true, q: "Which area would you most like us to improve?", qAr: "أي مجال تودّ أن نحسّنه أكثر؟", options: [
          { label: "Facilities", labelAr: "المرافق" }, { label: "Tools & systems", labelAr: "الأدوات والأنظمة" }, { label: "Communication", labelAr: "التواصل" }, { label: "Recognition", labelAr: "التقدير" },
        ] },
      ],
    },
    {
      title: "Leadership & Direction", titleAr: "القيادة والتوجّه",
      desc: "How connected you feel to where we're going.", descAr: "مدى ارتباطك بوجهتنا.",
      questions: [
        { id: "ld1", kind: "scale", required: true, q: "I understand how my work connects to company goals.", qAr: "أفهم كيف يرتبط عملي بأهداف الشركة." },
        { id: "ld2", kind: "scale", required: true, q: "Leadership communicates openly and honestly.", qAr: "تتواصل القيادة بانفتاح وصدق." },
        { id: "ld3", kind: "rating", required: true, q: "Rate your confidence in the company's direction.", qAr: "قيّم ثقتك في وجهة الشركة." },
      ],
    },
    {
      title: "Growth & Development", titleAr: "النمو والتطوير",
      desc: "Learning, feedback and career progression.", descAr: "التعلّم والملاحظات والتقدّم المهني.",
      questions: [
        { id: "gd1", kind: "scale", required: true, q: "I have opportunities to learn and grow here.", qAr: "لديّ فرص للتعلّم والنمو هنا." },
        { id: "gd2", kind: "choice", required: true, q: "How often do you receive useful feedback?", qAr: "كم مرة تتلقّى ملاحظات مفيدة؟", options: [
          { label: "Weekly", labelAr: "أسبوعيًا" }, { label: "Monthly", labelAr: "شهريًا" }, { label: "Quarterly", labelAr: "كل ربع" }, { label: "Rarely", labelAr: "نادرًا" },
        ] },
      ],
    },
    {
      title: "Wellbeing & Balance", titleAr: "الرفاهية والتوازن",
      desc: "How sustainable your work life feels.", descAr: "مدى استدامة حياتك العملية.",
      questions: [
        { id: "wb1", kind: "scale", required: true, q: "I can maintain a healthy work–life balance.", qAr: "أستطيع الحفاظ على توازن صحي بين العمل والحياة." },
        { id: "wb2", kind: "multi", q: "Which wellbeing benefits matter most to you?", qAr: "أي مزايا رفاهية تهمّك أكثر؟", options: [
          { label: "Flexible hours", labelAr: "ساعات مرنة" }, { label: "Remote days", labelAr: "أيام عن بُعد" }, { label: "Health screening", labelAr: "فحوصات صحية" }, { label: "Fitness", labelAr: "اللياقة" }, { label: "Mental-health support", labelAr: "دعم الصحة النفسية" },
        ] },
      ],
    },
    {
      title: "Your Voice", titleAr: "صوتك",
      desc: "The last word is yours.", descAr: "الكلمة الأخيرة لك.",
      questions: [
        { id: "yv1", kind: "rating", required: true, q: "Overall, how happy are you working here?", qAr: "بشكل عام، ما مدى سعادتك بالعمل هنا؟" },
        { id: "yv2", kind: "text", q: "What one change would make the biggest difference?", qAr: "ما التغيير الوحيد الذي سيُحدث أكبر فرق؟" },
      ],
    },
  ],
}

/** Forms keyed by survey id; every active survey falls back to the pulse form. */
export const surveyForms: Record<string, SurveyForm> = { "q3-pulse": q3PulseForm }
export const getSurveyForm = (id: string): SurveyForm => surveyForms[id] ?? q3PulseForm

export const sampleQuestionnaire: SurveyQuestion[] = [
  {
    kind: "rating",
    q: "How satisfied are you with your work environment?",
    qAr: "ما مدى رضاك عن بيئة عملك؟",
  },
  {
    kind: "choice",
    q: "Which area would you most like us to improve?",
    qAr: "أي مجال تود أن نحسّنه أكثر؟",
    options: [
      { label: "Facilities", labelAr: "المرافق" },
      { label: "Tools & systems", labelAr: "الأدوات والأنظمة" },
      { label: "Communication", labelAr: "التواصل" },
      { label: "Recognition", labelAr: "التقدير" },
    ],
  },
  {
    kind: "text",
    q: "Anything else you'd like leadership to know?",
    qAr: "هل هناك ما تود أن تعرفه القيادة؟",
  },
]
