/** Operations & Performance — mock data (Figma "Final Design 1.0", Operations frames).
 *  Every user-facing string carries an English and an Arabic form. */

export type L = { en: string; ar: string }

// ── Current user (hub hero profile, 3907:9016) ────────────────────────────────
export const currentUser = {
  id: "e1",
  name: { en: "Mohammed Khaled Ali", ar: "محمد خالد علي" },
  jobTitle: { en: "UX Designer", ar: "مصمم تجربة المستخدم" },
  employeeNo: "1729",
  department: { en: "Administration", ar: "الإدارة" },
  manager: { en: "Nada Khaled Mahmoud", ar: "ندى خالد محمود" },
  email: "MAli@altanfeethi.com.sa",
}

// ── Lounges & checklist templates ────────────────────────────────────────────
export type Lounge = { id: string; name: L }
export const lounges: Lounge[] = [
  { id: "ruh", name: { en: "Riyadh", ar: "الرياض" } },
  { id: "jed", name: { en: "Jeddah", ar: "جدة" } },
  { id: "dmm", name: { en: "Dammam", ar: "الدمام" } },
]

export type Question = { id: string; text: L }
export type ChecklistTemplate = { id: string; name: L; questions: Question[] }

export const templates: ChecklistTemplate[] = [
  {
    id: "hospitality",
    name: { en: "Hospitality audit", ar: "تدقيق الضيافة" },
    questions: [
      {
        id: "h1",
        text: {
          ar: "يلتزم طاقم التموين بالبروتوكول المعتمد للضيافة في التنفيذي أثناء تقديم خدمة الضيافة مباشرة بعد جلوس الضيف",
          en: "Catering staff follow Al Tanfeethi's approved hospitality protocol, serving immediately after the guest is seated",
        },
      },
      {
        id: "h2",
        text: {
          ar: "الوقت المستغرق لتقديم الخدمة مناسبة ومطابقة لقائمة الطعام باستثناء أوقات الذروة",
          en: "Service time is appropriate and matches the menu, except at peak times",
        },
      },
      {
        id: "h3",
        text: {
          ar: "يرحّب موظف الاستقبال بالضيف ويتحقق من العضوية خلال دقيقتين من وصوله",
          en: "Reception greets the guest and verifies membership within two minutes of arrival",
        },
      },
    ],
  },
  {
    id: "cleanliness",
    name: { en: "Cleanliness", ar: "النظافة" },
    questions: [
      { id: "c1", text: { ar: "منطقة الجلوس نظيفة ومرتبة وخالية من المخلفات", en: "The seating area is clean, tidy and free of litter" } },
      { id: "c2", text: { ar: "دورات المياه نظيفة ومزودة بالمستلزمات بالكامل", en: "Restrooms are clean and fully stocked" } },
      { id: "c3", text: { ar: "أسطح تقديم الطعام معقّمة وفق الجدول المعتمد", en: "Food-service surfaces are sanitised on the approved schedule" } },
    ],
  },
  {
    id: "staff",
    name: { en: "Employee performance", ar: "أداء الموظفين" },
    questions: [
      { id: "s1", text: { ar: "الموظفون ملتزمون بالزي الرسمي المعتمد", en: "Staff wear the approved uniform" } },
      { id: "s2", text: { ar: "الموظفون متواجدون في مواقعهم حسب جدول المناوبات", en: "Staff are at their posts according to the duty schedule" } },
      { id: "s3", text: { ar: "يتم التعامل مع ملاحظات الضيوف وتسجيلها فوراً", en: "Guest feedback is handled and logged immediately" } },
    ],
  },
]

export function templateById(id: string): ChecklistTemplate {
  return templates.find((t) => t.id === id) ?? templates[0]
}
export function loungeById(id: string): Lounge {
  return lounges.find((l) => l.id === id) ?? lounges[0]
}

/** Lounge staff who can be held responsible for a violation. */
export const loungeStaff: { id: string; name: L }[] = [
  { id: "ali", name: { en: "Ali", ar: "علي" } },
  { id: "ahmad", name: { en: "Ahmad", ar: "أحمد" } },
  { id: "muna", name: { en: "Muna", ar: "منى" } },
  { id: "saad", name: { en: "Saad", ar: "سعد" } },
  { id: "huda", name: { en: "Huda", ar: "هدى" } },
  { id: "fahad", name: { en: "Fahad", ar: "فهد" } },
]

export type Answer = {
  complied: boolean | null
  responsible: string[]
  details: string
  attachments: string[]
}

export type ChecklistRun = {
  id: string
  templateId: string
  loungeId: string
  /** Planned audit date (YYYY-MM-DD). */
  date: string
  reviewer: L | null
  status: "pending" | "completed"
  answers: Record<string, Answer>
}

const yes = (): Answer => ({ complied: true, responsible: [], details: "", attachments: [] })

function allYes(templateId: string): Record<string, Answer> {
  return Object.fromEntries(templateById(templateId).questions.map((q) => [q.id, yes()]))
}

// 4124:11545 — populated table (the pending first row opens the 4124:12320 form)
export const initialRuns: ChecklistRun[] = [
  { id: "r1", templateId: "hospitality", loungeId: "ruh", date: "2026-11-10", reviewer: null, status: "pending", answers: {} },
  { id: "r2", templateId: "cleanliness", loungeId: "jed", date: "2026-11-02", reviewer: { ar: "سلمان محمد العتيبي", en: "Salman Mohammed Al-Otaibi" }, status: "completed", answers: allYes("cleanliness") },
  { id: "r3", templateId: "cleanliness", loungeId: "ruh", date: "2026-10-28", reviewer: { ar: "نورة صالح الحربي", en: "Noura Saleh Al-Harbi" }, status: "completed", answers: allYes("cleanliness") },
  { id: "r4", templateId: "cleanliness", loungeId: "jed", date: "2026-10-21", reviewer: { ar: "عبدالله أحمد الشهري", en: "Abdullah Ahmed Al-Shehri" }, status: "completed", answers: allYes("cleanliness") },
  {
    id: "r5",
    templateId: "cleanliness",
    loungeId: "jed",
    date: "2026-10-14",
    reviewer: { ar: "ريم خالد الجهني", en: "Reem Khaled Al-Juhani" },
    status: "completed",
    answers: {
      ...allYes("cleanliness"),
      c2: {
        complied: false,
        responsible: ["ali", "saad"],
        details: "نفدت المناديل والصابون في دورة مياه الرجال عند الساعة 10:30 صباحاً.",
        attachments: ["restroom-1030.jpg"],
      },
    },
  },
  { id: "r6", templateId: "staff", loungeId: "jed", date: "2026-10-07", reviewer: { ar: "فيصل عبدالله الدوسري", en: "Faisal Abdullah Al-Dosari" }, status: "completed", answers: allYes("staff") },
]

export function violationsOf(run: ChecklistRun): number {
  return Object.values(run.answers).filter((a) => a.complied === false).length
}

// ── Team (employee evaluation card on the hub) ──────────────────────────────
export type EvaluationCycle = "half-year" | "annual"
export type TeamMember = {
  id: string
  name: L
  employeeNo: string
  role: L
  city: L
  cycle: EvaluationCycle
  manager: L
}

export const team: TeamMember[] = [
  { id: "t1", name: { ar: "فواز عبدالعزيز الغيلان", en: "Fawaz Abdulaziz Al-Ghailan" }, employeeNo: "0000", role: { ar: "مصمم تجربة المستخدم", en: "UX Designer" }, city: { ar: "الرياض", en: "Riyadh" }, cycle: "half-year", manager: { ar: "محمد", en: "Mohammed" } },
  { id: "t2", name: { ar: "سارة ناصر الحربي", en: "Sara Nasser Al-Harbi" }, employeeNo: "0001", role: { ar: "مهندسة برمجيات", en: "Software Engineer" }, city: { ar: "جدة", en: "Jeddah" }, cycle: "half-year", manager: { ar: "علي", en: "Ali" } },
  { id: "t3", name: { ar: "يوسف سلطان المطيري", en: "Yousef Sultan Al-Mutairi" }, employeeNo: "0004", role: { ar: "مدير مشروع", en: "Project Manager" }, city: { ar: "الخبر", en: "Khobar" }, cycle: "annual", manager: { ar: "ريم", en: "Reem" } },
  { id: "t4", name: { ar: "عبدالعزيز علي", en: "Abdulaziz Ali" }, employeeNo: "0007", role: { ar: "محاسب", en: "Accountant" }, city: { ar: "الرياض", en: "Riyadh" }, cycle: "annual", manager: { ar: "محمد", en: "Mohammed" } },
]

export function teamMember(id: string | undefined): TeamMember | undefined {
  return team.find((m) => m.id === id)
}

// ── Checklist-based evaluation records (4124:10533 / 4124:12781 / 4215:13599) ─
export type EvaluatedPerson = { id: string; name: L; jobTitle: L }

/** Lounge staff whose checklist evaluations the manager can browse. */
export const evaluatedStaff: EvaluatedPerson[] = [
  { id: "e1", name: { ar: "محمد خالد علي", en: "Mohammed Khaled Ali" }, jobTitle: { en: "Terminal Traffic Supervisor", ar: "مشرف حركة الصالة" } },
  { id: "e2", name: { ar: "سارة أحمد الحسن", en: "Sara Ahmed Al-Hassan" }, jobTitle: { en: "Senior Traffic Analyst", ar: "محللة حركة أولى" } },
  { id: "e3", name: { ar: "علي مصطفى سالم", en: "Ali Mustafa Salem" }, jobTitle: { en: "Traffic Coordinator", ar: "منسق حركة" } },
  { id: "e4", name: { ar: "ندى خالد محمود", en: "Nada Khalid Mahmoud" }, jobTitle: { en: "Logistics Manager", ar: "مديرة الخدمات اللوجستية" } },
  { id: "e5", name: { ar: "يوسف علي الحربي", en: "Youssef Ali Al-Harbi" }, jobTitle: { en: "Operations Supervisor", ar: "مشرف عمليات" } },
  { id: "e6", name: { ar: "ريم سامي عبدالله", en: "Reem Sami Abdullah" }, jobTitle: { en: "Fleet Manager", ar: "مديرة الأسطول" } },
  { id: "e7", name: { ar: "خالد ناصر الغامدي", en: "Khalid Nasser Al-Ghamdi" }, jobTitle: { en: "Safety Officer", ar: "مسؤول السلامة" } },
  { id: "e8", name: { ar: "ليلى حسن إبراهيم", en: "Laila Hassan Ibrahim" }, jobTitle: { en: "Traffic Analyst", ar: "محللة حركة" } },
  { id: "e9", name: { ar: "طارق محمود عبد الله", en: "Tariq Mahmoud Abdullah" }, jobTitle: { en: "Dispatch Coordinator", ar: "منسق إرسال" } },
]

/** People who carry out evaluations (shift supervisors / direct managers). */
const evaluators: EvaluatedPerson[] = [
  { id: "v1", name: { ar: "عبدالله محمد السعدي", en: "Abdullah Mohammed Al-Saadi" }, jobTitle: { en: "Fleet Manager", ar: "مدير الأسطول" } },
  { id: "v2", name: { ar: "ياسين أحمد الحربي", en: "Yassin Ahmed Al-Harbi" }, jobTitle: { en: "Safety Officer", ar: "مسؤول السلامة" } },
  { id: "v3", name: { ar: "سعاد علي الكعبي", en: "Suad Ali Al-Kaabi" }, jobTitle: { en: "Operations Supervisor", ar: "مشرفة عمليات" } },
  { id: "v4", name: { ar: "خالد سعيد الدوسري", en: "Khalid Saeed Al-Dosari" }, jobTitle: { en: "Logistics Coordinator", ar: "منسق لوجستي" } },
  { id: "v5", name: { ar: "فاطمة ناصر الهاشمي", en: "Fatima Nasser Al-Hashemi" }, jobTitle: { en: "Maintenance Lead", ar: "قائدة فريق الصيانة" } },
]

export type EvaluationRecord = {
  id: string
  employeeId: string
  evaluator: EvaluatedPerson
  /** Date the evaluation was recorded. */
  date: string
  /** The working day the evaluation covers. */
  day: string
  negatives: number
  templateId: string
}

// 4124:10533 — the latest evaluation per employee (dates + negatives verbatim).
const latest: [string, string, number][] = [
  ["e1", "2026-10-01", 0],
  ["e2", "2026-09-15", 0],
  ["e3", "2026-08-20", 1],
  ["e4", "2026-07-30", 2],
  ["e5", "2026-07-01", 0],
  ["e6", "2026-06-15", 0],
  ["e7", "2026-05-28", 1],
  ["e8", "2026-05-05", 0],
  ["e9", "2026-04-10", 0],
]

function shiftMonths(iso: string, months: number): string {
  const [y, m, d] = iso.split("-").map(Number)
  const dt = new Date(Date.UTC(y, m - 1 - months, d))
  return dt.toISOString().slice(0, 10)
}

// 4124:12781 — Mohammed Khalid Ali's history (evaluators + dates verbatim).
const e1History: EvaluationRecord[] = [
  { id: "ev-e1-1", employeeId: "e1", evaluator: evaluators[0], date: "2026-10-01", day: "2026-10-01", negatives: 0, templateId: "hospitality" },
  { id: "ev-e1-2", employeeId: "e1", evaluator: evaluators[1], date: "2026-09-15", day: "2026-09-15", negatives: 0, templateId: "hospitality" },
  { id: "ev-e1-3", employeeId: "e1", evaluator: evaluators[2], date: "2026-08-20", day: "2026-08-20", negatives: 0, templateId: "staff" },
  { id: "ev-e1-4", employeeId: "e1", evaluator: evaluators[3], date: "2026-07-05", day: "2026-07-05", negatives: 0, templateId: "cleanliness" },
  { id: "ev-e1-5", employeeId: "e1", evaluator: evaluators[4], date: "2026-06-10", day: "2026-06-10", negatives: 0, templateId: "staff" },
]

/** Other employees get their latest record (from the manager log) plus two older ones. */
const otherHistory: EvaluationRecord[] = latest
  .filter(([id]) => id !== "e1")
  .flatMap(([id, date, negatives], i) => [
    { id: `ev-${id}-1`, employeeId: id, evaluator: evaluators[i % 5], date, day: date, negatives, templateId: "hospitality" },
    { id: `ev-${id}-2`, employeeId: id, evaluator: evaluators[(i + 2) % 5], date: shiftMonths(date, 1), day: shiftMonths(date, 1), negatives: 0, templateId: "cleanliness" },
    { id: `ev-${id}-3`, employeeId: id, evaluator: evaluators[(i + 4) % 5], date: shiftMonths(date, 2), day: shiftMonths(date, 2), negatives: 0, templateId: "staff" },
  ])

/** Team members (hub employee cards) — reached via "عرض التقييمات السابقة". */
const teamHistory: EvaluationRecord[] = (
  [
    ["t1", "2026-10-12", 0],
    ["t2", "2026-10-05", 1],
    ["t3", "2026-09-28", 0],
    ["t4", "2026-09-21", 0],
  ] as [string, string, number][]
).flatMap(([id, date, negatives], i) => [
  { id: `ev-${id}-1`, employeeId: id, evaluator: evaluators[(i + 1) % 5], date, day: date, negatives, templateId: "hospitality" },
  { id: `ev-${id}-2`, employeeId: id, evaluator: evaluators[(i + 3) % 5], date: shiftMonths(date, 1), day: shiftMonths(date, 1), negatives: 0, templateId: "staff" },
])

export const evaluationRecords: EvaluationRecord[] = [...e1History, ...otherHistory, ...teamHistory]

/** 4215:13599 — the signed-in employee's own operational evaluations (evaluator,
 *  date and negatives verbatim from the frame). Kept apart from e1's manager-side
 *  history (4124:12781) so both screens show exactly what their frames draw. */
export const myLogRecords: EvaluationRecord[] = latest.map(([, date, negatives], i) => ({
  id: `my-ev-${i + 1}`,
  employeeId: currentUser.id,
  evaluator: evaluatedStaff[i],
  date,
  day: date,
  negatives,
  templateId: ["hospitality", "cleanliness", "staff"][i % 3],
}))

/** Look up any evaluation record (manager-side or the employee's own log). */
export const findEvaluationRecord = (id: string | undefined) =>
  evaluationRecords.find((r) => r.id === id) ?? myLogRecords.find((r) => r.id === id)

/** Any person whose checklist evaluations can be listed (lounge staff or a team member). */
export function evaluatedPerson(id: string | undefined): EvaluatedPerson | undefined {
  const staff = evaluatedStaff.find((p) => p.id === id)
  if (staff) return staff
  const m = team.find((t) => t.id === id)
  return m ? { id: m.id, name: m.name, jobTitle: m.role } : undefined
}

/** Weighted overall score (one decimal) of the goals that have a rating. */
export function overallScore(scores: Record<string, number>, goals: { id: string; weight: number }[]): number | undefined {
  let sum = 0
  let w = 0
  for (const g of goals) {
    const s = scores[g.id]
    if (s) {
      sum += s * g.weight
      w += g.weight
    }
  }
  return w ? Math.round((sum / w) * 10) / 10 : undefined
}

/** Answers shown on the read-only evaluation page (4124:13130). The first
 *  `negatives` questions after the first are marked "not complied", with the
 *  violation details the checklist form captured. */
export function answersFor(record: EvaluationRecord): Record<string, Answer> {
  const tpl = templateById(record.templateId)
  return Object.fromEntries(
    tpl.questions.map((q, i) => {
      const failed = i >= 1 && i <= record.negatives
      return [
        q.id,
        failed
          ? {
              complied: false,
              responsible: ["ali"],
              details: "تأخر تقديم الخدمة لأكثر من عشر دقائق في غير أوقات الذروة.",
              attachments: ["service-log.pdf"],
            }
          : yes(),
      ]
    }),
  )
}

// ── Incentives (4124:10275) ──────────────────────────────────────────────────
export type Incentive = {
  id: string
  date: string
  amount: number
  deduction: number
  violations: number
  reason: L
}

export const incentives: Incentive[] = [
  { id: "i1", date: "2026-09-09", amount: 2000, deduction: 0, violations: 0, reason: { ar: "لا يوجد خصم", en: "No deduction" } },
  {
    id: "i2",
    date: "2026-10-15",
    amount: 2000,
    deduction: 1500,
    violations: 1,
    reason: { ar: "مخالفة في تدقيق النظافة — صالة جدة", en: "Violation in the cleanliness audit — Jeddah lounge" },
  },
  {
    id: "i3",
    date: "2026-11-20",
    amount: 2000,
    deduction: 2000,
    violations: 2,
    reason: { ar: "مخالفتان في تدقيق الضيافة — صالة الرياض", en: "Two violations in the hospitality audit — Riyadh lounge" },
  },
]

// ── Delegation (4124:9654) ───────────────────────────────────────────────────
export type ScheduleEntry = {
  id: string
  employee: L
  kind: "leave" | "remote"
  from: string
  to: string
  substitute?: L
  email?: string
  pending?: boolean
}

export const schedule: ScheduleEntry[] = [
  { id: "s1", employee: { ar: "أحمد خالد", en: "Ahmed Khaled" }, kind: "leave", from: "2026-06-04", to: "2026-09-01", substitute: { ar: "خالد محمد", en: "Khaled Mohammed" }, email: "K.Mohammed@altanfeethi.com.sa" },
  { id: "s2", employee: { ar: "سارة ناصر", en: "Sara Nasser" }, kind: "remote", from: "2026-06-10", to: "2026-06-14" },
  { id: "s3", employee: { ar: "منى العتيبي", en: "Muna Al-Otaibi" }, kind: "leave", from: "2026-07-01", to: "2026-07-20", substitute: { ar: "فهد السالم", en: "Fahad Al-Salem" }, email: "F.Alsalem@altanfeethi.com.sa" },
]

export const delegates: { id: string; name: L; email: string }[] = [
  { id: "d1", name: { ar: "خالد محمد", en: "Khalid Mohammed" }, email: "K.Mohammed@altanfeethi.com.sa" },
  { id: "d2", name: { ar: "فهد السالم", en: "Fahad Al-Salem" }, email: "F.Alsalem@altanfeethi.com.sa" },
  { id: "d3", name: { ar: "نورة صالح الحربي", en: "Noura Saleh Al-Harbi" }, email: "N.Alharbi@altanfeethi.com.sa" },
  { id: "d4", name: { ar: "سلمان محمد العتيبي", en: "Salman Mohammed Al-Otaibi" }, email: "S.Alotaibi@altanfeethi.com.sa" },
]

// ── Goals & ratings (4124:13741, 4124:13923, 4124:13384, 4124:13576, 4126:14074) ─
export type MeasureUnit = "percent" | "number" | "minutes" | "sar"
export const measureUnits: { id: MeasureUnit; label: L }[] = [
  { id: "percent", label: { ar: "% - النسبة", en: "% – Percentage" } },
  { id: "number", label: { ar: "عدد", en: "Count" } },
  { id: "minutes", label: { ar: "دقائق", en: "Minutes" } },
  { id: "sar", label: { ar: "ريال سعودي", en: "SAR" } },
]

export type Goal = {
  id: string
  title: L
  indicator: L
  start: string
  end: string
  unit: MeasureUnit
  target: number
  /** Percent of the overall evaluation. */
  weight: number
}

export const initialGoals: Goal[] = [
  {
    id: "g1",
    title: { ar: "إدارة والتواصل مع المساهمين", en: "Stakeholder management & communication" },
    indicator: {
      ar: "نسبة المتطلبات والميزات الموجودة في خارطة الطريق من إجمالي المتطلبات",
      en: "Share of requirements and features on the roadmap out of total requirements",
    },
    start: "2026-01-01",
    end: "2026-12-31",
    unit: "percent",
    target: 90,
    weight: 25,
  },
  {
    id: "g2",
    title: { ar: "تحسين تجربة الضيوف في الصالات", en: "Improve the lounge guest experience" },
    indicator: { ar: "متوسط رضا الضيوف في استبيانات ما بعد الزيارة", en: "Average guest satisfaction in post-visit surveys" },
    start: "2026-01-01",
    end: "2026-12-31",
    unit: "percent",
    target: 85,
    weight: 25,
  },
  {
    id: "g3",
    title: { ar: "تقليل زمن تقديم الضيافة", en: "Reduce hospitality service time" },
    indicator: { ar: "متوسط زمن تقديم الضيافة بعد جلوس الضيف", en: "Average time to serve after the guest is seated" },
    start: "2026-01-01",
    end: "2026-12-31",
    unit: "minutes",
    target: 5,
    weight: 20,
  },
  {
    id: "g4",
    title: { ar: "الالتزام بقوائم التحقق التشغيلية", en: "Operational checklist compliance" },
    indicator: { ar: "عدد المخالفات المسجلة في تدقيقات الصالة خلال العام", en: "Violations recorded in lounge audits during the year" },
    start: "2026-01-01",
    end: "2026-12-31",
    unit: "number",
    target: 2,
    weight: 15,
  },
]

/** ONE rating scale for every goal review (half-year, annual, self and manager).
 *  The design mixed qualitative labels (half-year) with bare numbers (annual);
 *  here every rating shows as "score · label". */
export type Rating = 1 | 2 | 3 | 4 | 5
export const ratingScale: { value: Rating; label: L; tone: "success" | "info" | "warning" | "error" }[] = [
  { value: 5, label: { ar: "متجاوز للمستهدف", en: "Exceeds target" }, tone: "success" },
  { value: 4, label: { ar: "على المسار الصحيح", en: "On track" }, tone: "info" },
  { value: 3, label: { ar: "يوجد بعض التحديات", en: "Some challenges" }, tone: "warning" },
  { value: 2, label: { ar: "دون المستهدف", en: "Below target" }, tone: "error" },
  { value: 1, label: { ar: "متعثر", en: "Off track" }, tone: "error" },
]

export function ratingInfo(value: number | undefined) {
  return ratingScale.find((r) => r.value === value)
}

export type GoalReviewPeriod = { id: string; label: L; self: Record<string, Rating>; manager: Record<string, Rating> }

/** Past goal-based results (4124:13384). */
export const pastGoalReviews: GoalReviewPeriod[] = [
  {
    id: "h1-2026",
    label: { ar: "التقييم النصف سنوي 2026", en: "Mid-year evaluation 2026" },
    self: { g1: 4, g2: 4, g3: 3, g4: 5 },
    manager: { g1: 3, g2: 4, g3: 3, g4: 4 },
  },
  {
    id: "y-2025",
    label: { ar: "التقييم السنوي 2025", en: "Annual evaluation 2025" },
    self: { g1: 5, g2: 4, g3: 4, g4: 4 },
    manager: { g1: 4, g2: 4, g3: 3, g4: 4 },
  },
]

/** Each team member's own self-review scores for the current cycle. */
export const teamSelfScores: Record<string, Record<string, Rating>> = {
  t1: { g1: 4, g2: 4, g3: 3, g4: 5 },
  t2: { g1: 5, g2: 4, g3: 4, g4: 4 },
  t3: { g1: 5, g2: 5, g3: 4, g4: 5 },
  t4: { g1: 5, g2: 5, g3: 5, g4: 5 },
}

/** Manager scores already recorded before this session (4126:14560 shows one done). */
export const initialManagerScores: Record<string, Record<string, Rating>> = {
  t4: { g1: 5, g2: 5, g3: 5, g4: 5 },
}
