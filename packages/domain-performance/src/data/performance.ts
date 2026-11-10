/** Corporate performance — mock strategy data for ALTANFEETHI's 2026 plan, plus the
 *  pure scoring rules every page uses (so all numbers agree everywhere).
 *
 *  ── Scoring rules (the one place they are defined) ─────────────────────────────
 *  • KPI attainment = actual ÷ target (higher-is-better) or target ÷ actual
 *    (lower-is-better), for the months of the chosen period that have a value.
 *    Aggregation follows the KPI: `avg` (rates, scores), `sum` (revenue, counts),
 *    `last` (cumulative counts — the latest value in the period).
 *  • KPI progress = attainment capped at 100%.
 *  • Status thresholds (KPIs, objectives, departments, strategy and initiatives):
 *        ≥ 90% of target → on track · 70–89% → at risk · < 70% → off track
 *    (judged on the rounded whole percent that the UI displays)
 *  • Objective progress = weighted average of its KPIs' progress (KPI weights sum
 *    to 100 per objective; KPIs with no value in the period are left out and the
 *    remaining weights re-normalised).
 *  • Strategy achievement = weighted average of the objectives (pillar weights).
 *  • Department score = plain average of the progress of the KPIs it owns.
 *  • Initiative health = actual progress ÷ planned progress (time elapsed between
 *    start and due date as of TODAY), with the same thresholds.
 */

export type L = { en: string; ar: string }

export type Status = "on-track" | "at-risk" | "off-track"

export const THRESHOLDS = { onTrack: 90, atRisk: 70 } as const

/** The single status rule — `pct` is attainment / progress in percent (0–100+).
 *  Judged on the whole percent the UI shows, so a "90%" never wears an "At risk" chip. */
export function statusOf(pct: number): Status {
  const v = Math.round(pct)
  if (v >= THRESHOLDS.onTrack) return "on-track"
  if (v >= THRESHOLDS.atRisk) return "at-risk"
  return "off-track"
}

export const STATUS_LABEL: Record<Status, L> = {
  "on-track": { en: "On track", ar: "على المسار" },
  "at-risk": { en: "At risk", ar: "معرّض للخطر" },
  "off-track": { en: "Off track", ar: "خارج المسار" },
}

/** "Today" for the prototype (keeps the initiative schedule maths stable). */
export const TODAY = "2026-11-10"
export const YEAR = 2026

export const MONTHS: L[] = [
  { en: "Jan", ar: "يناير" }, { en: "Feb", ar: "فبراير" }, { en: "Mar", ar: "مارس" },
  { en: "Apr", ar: "أبريل" }, { en: "May", ar: "مايو" }, { en: "Jun", ar: "يونيو" },
  { en: "Jul", ar: "يوليو" }, { en: "Aug", ar: "أغسطس" }, { en: "Sep", ar: "سبتمبر" },
  { en: "Oct", ar: "أكتوبر" }, { en: "Nov", ar: "نوفمبر" }, { en: "Dec", ar: "ديسمبر" },
]
/** Index of the current month (Nov) — the latest month a value can be reported for. */
export const CURRENT_MONTH = 10

// ── periods ──────────────────────────────────────────────────────────────────
export type PeriodId = "q1" | "q2" | "q3" | "q4" | "fy"
export type Period = { id: PeriodId; label: L; short: L; from: number; to: number }

export const PERIODS: Period[] = [
  { id: "q1", label: { en: "Q1 2026 (Jan–Mar)", ar: "الربع الأول 2026 (يناير–مارس)" }, short: { en: "Q1", ar: "الربع الأول" }, from: 0, to: 2 },
  { id: "q2", label: { en: "Q2 2026 (Apr–Jun)", ar: "الربع الثاني 2026 (أبريل–يونيو)" }, short: { en: "Q2", ar: "الربع الثاني" }, from: 3, to: 5 },
  { id: "q3", label: { en: "Q3 2026 (Jul–Sep)", ar: "الربع الثالث 2026 (يوليو–سبتمبر)" }, short: { en: "Q3", ar: "الربع الثالث" }, from: 6, to: 8 },
  { id: "q4", label: { en: "Q4 2026 (Oct–Dec, to date)", ar: "الربع الرابع 2026 (أكتوبر–ديسمبر، حتى تاريخه)" }, short: { en: "Q4", ar: "الربع الرابع" }, from: 9, to: 11 },
  { id: "fy", label: { en: "Full year 2026 (to date)", ar: "العام الكامل 2026 (حتى تاريخه)" }, short: { en: "2026", ar: "2026" }, from: 0, to: 11 },
]
export const DEFAULT_PERIOD: PeriodId = "fy"
export const periodById = (id: string | null | undefined): Period =>
  PERIODS.find((p) => p.id === id) ?? PERIODS.find((p) => p.id === DEFAULT_PERIOD)!

/** What a period is compared with for the "delta" figures. Quarters compare with
 *  the previous quarter; the full year compares with the year-to-date one month earlier. */
export function comparisonOf(p: Period, kpis: Kpi[]): { from: number; to: number; label: L } | null {
  if (p.id === "q1") return null
  if (p.id === "fy") {
    const last = lastDataMonth(kpis)
    if (last < 1) return null
    return { from: 0, to: last - 1, label: { en: `vs end of ${MONTHS[last - 1].en}`, ar: `مقارنة بنهاية ${MONTHS[last - 1].ar}` } }
  }
  const prev = PERIODS[PERIODS.findIndex((x) => x.id === p.id) - 1]
  return { from: prev.from, to: prev.to, label: { en: `vs ${prev.short.en}`, ar: `مقارنة ب${prev.short.ar}` } }
}

// ── people ───────────────────────────────────────────────────────────────────
export type Person = { name: L; role: L; initials: string }

export const currentUser: Person = {
  name: { en: "Fawaz Al-Ghailan", ar: "فواز الغيلان" },
  role: { en: "Director, Strategy & Performance Office", ar: "مدير مكتب الاستراتيجية والأداء" },
  initials: "FG",
}

const P = {
  reem: { name: { en: "Reem Al-Otaibi", ar: "ريم العتيبي" }, role: { en: "Chief Guest Experience Officer", ar: "الرئيس التنفيذي لتجربة الضيوف" }, initials: "RO" },
  khalid: { name: { en: "Khalid Al-Harbi", ar: "خالد الحربي" }, role: { en: "Chief Operating Officer", ar: "الرئيس التنفيذي للعمليات" }, initials: "KH" },
  sultan: { name: { en: "Sultan Al-Qahtani", ar: "سلطان القحطاني" }, role: { en: "Chief Commercial Officer", ar: "الرئيس التنفيذي التجاري" }, initials: "SQ" },
  noura: { name: { en: "Noura Al-Dosari", ar: "نورة الدوسري" }, role: { en: "Chief Human Resources Officer", ar: "الرئيس التنفيذي للموارد البشرية" }, initials: "ND" },
  abdullah: { name: { en: "Abdullah Al-Shehri", ar: "عبدالله الشهري" }, role: { en: "Chief Information Officer", ar: "الرئيس التنفيذي للتقنية" }, initials: "AS" },
  majed: { name: { en: "Majed Al-Zahrani", ar: "ماجد الزهراني" }, role: { en: "Chief Financial Officer", ar: "الرئيس التنفيذي للمالية" }, initials: "MZ" },
  lama: { name: { en: "Lama Al-Mutairi", ar: "لمى المطيري" }, role: { en: "Head of Hospitality", ar: "رئيسة الضيافة" }, initials: "LM" },
  turki: { name: { en: "Turki Al-Anazi", ar: "تركي العنزي" }, role: { en: "Limousine Operations Manager", ar: "مدير عمليات الليموزين" }, initials: "TA" },
  hessa: { name: { en: "Hessa Al-Shammari", ar: "حصة الشمري" }, role: { en: "Guest Relations Manager", ar: "مديرة علاقات الضيوف" }, initials: "HS" },
  faisal: { name: { en: "Faisal Al-Rashid", ar: "فيصل الرشيد" }, role: { en: "Membership Manager", ar: "مدير العضويات" }, initials: "FR" },
  yazeed: { name: { en: "Yazeed Al-Subaie", ar: "يزيد السبيعي" }, role: { en: "Digital Products Lead", ar: "قائد المنتجات الرقمية" }, initials: "YS" },
} satisfies Record<string, Person>

// ── pillars & objectives ─────────────────────────────────────────────────────
export type PillarId = "guest" | "ops" | "commercial" | "people" | "digital"
export type Pillar = { id: PillarId; name: L; icon: "sparkles" | "gauge" | "trending" | "users" | "cpu" }

export const PILLARS: Pillar[] = [
  { id: "guest", name: { en: "Guest experience", ar: "تجربة الضيف" }, icon: "sparkles" },
  { id: "ops", name: { en: "Operational excellence", ar: "التميّز التشغيلي" }, icon: "gauge" },
  { id: "commercial", name: { en: "Commercial growth", ar: "النمو التجاري" }, icon: "trending" },
  { id: "people", name: { en: "People & capability", ar: "الكفاءات والقدرات" }, icon: "users" },
  { id: "digital", name: { en: "Digital transformation", ar: "التحوّل الرقمي" }, icon: "cpu" },
]
export const pillarById = (id: PillarId) => PILLARS.find((p) => p.id === id)!

export type Objective = {
  id: string
  code: string
  pillarId: PillarId
  title: L
  description: L
  owner: Person
  /** Weight in the overall strategy — the five weights sum to 100. */
  weight: number
}

export const OBJECTIVES: Objective[] = [
  {
    id: "guest-experience", code: "SO-1", pillarId: "guest", weight: 25, owner: P.reem,
    title: { en: "Deliver a consistently five-star guest journey", ar: "تقديم رحلة ضيف بمستوى خمس نجوم باستمرار" },
    description: {
      en: "From limousine pickup to boarding, every executive-terminal and lounge guest gets a seamless, personal experience.",
      ar: "من استقبال الليموزين حتى الصعود إلى الطائرة، يحظى كل ضيف في صالات ومباني التنفيذي بتجربة سلسة وشخصية.",
    },
  },
  {
    id: "operational-excellence", code: "SO-2", pillarId: "ops", weight: 20, owner: P.khalid,
    title: { en: "Run every terminal and lounge to SLA", ar: "تشغيل كل مبنى وصالة وفق مستويات الخدمة" },
    description: {
      en: "On-time limousine, baggage and lounge operations across Riyadh, Jeddah, Dammam and AlUla at a sustainable cost.",
      ar: "عمليات ليموزين وأمتعة وصالات في موعدها في الرياض وجدة والدمام والعلا وبتكلفة مستدامة.",
    },
  },
  {
    id: "commercial-growth", code: "SO-3", pillarId: "commercial", weight: 25, owner: P.sultan,
    title: { en: "Grow revenue and the membership base", ar: "تنمية الإيرادات وقاعدة العضويات" },
    description: {
      en: "Hit the 2026 revenue plan through lounge occupancy, memberships and ancillary services, and collect on time.",
      ar: "تحقيق خطة إيرادات 2026 عبر إشغال الصالات والعضويات والخدمات الإضافية، مع التحصيل في الموعد.",
    },
  },
  {
    id: "people-capability", code: "SO-4", pillarId: "people", weight: 15, owner: P.noura,
    title: { en: "Build an engaged, service-ready workforce", ar: "بناء فريق عمل متفاعل وجاهز للخدمة" },
    description: {
      en: "Engaged, well-trained frontline teams that stay with us and grow into leadership roles.",
      ar: "فرق ميدانية متفاعلة ومدرّبة جيدًا تبقى معنا وتنمو نحو الأدوار القيادية.",
    },
  },
  {
    id: "digital-transformation", code: "SO-5", pillarId: "digital", weight: 15, owner: P.abdullah,
    title: { en: "Digitise the guest and back-office journey", ar: "رقمنة رحلة الضيف والعمليات المساندة" },
    description: {
      en: "Online booking and payments, reliable core systems and automated back-office processes.",
      ar: "حجز ودفع إلكتروني، وأنظمة أساسية موثوقة، وأتمتة العمليات المساندة.",
    },
  },
]
export const objectiveById = (id: string | undefined) => OBJECTIVES.find((o) => o.id === id)

// ── departments ──────────────────────────────────────────────────────────────
export type DepartmentId = "operations" | "commercial" | "hr" | "finance" | "it" | "hospitality"
export type Department = { id: DepartmentId; name: L; head: Person }

export const DEPARTMENTS: Department[] = [
  { id: "operations", name: { en: "Operations", ar: "العمليات" }, head: P.khalid },
  { id: "commercial", name: { en: "Commercial", ar: "الإدارة التجارية" }, head: P.sultan },
  { id: "hr", name: { en: "Human resources", ar: "الموارد البشرية" }, head: P.noura },
  { id: "finance", name: { en: "Finance", ar: "المالية" }, head: P.majed },
  { id: "it", name: { en: "Information technology", ar: "تقنية المعلومات" }, head: P.abdullah },
  { id: "hospitality", name: { en: "Hospitality", ar: "الضيافة" }, head: P.lama },
]
export const departmentById = (id: string | undefined) => DEPARTMENTS.find((d) => d.id === id)

// ── KPIs ─────────────────────────────────────────────────────────────────────
export type Unit = "pct" | "score" | "sar" | "hours" | "days" | "count"
export type Agg = "avg" | "sum" | "last"
export type Frequency = "monthly" | "quarterly"
export type ValueNote = { text: string; by: L; iso: string }

export type Kpi = {
  id: string
  code: string
  name: L
  definition: L
  objectiveId: string
  departmentId: DepartmentId
  owner: Person
  unit: Unit
  direction: "up" | "down"
  frequency: Frequency
  agg: Agg
  /** Weight inside its objective — weights per objective sum to 100. */
  weight: number
  /** Monthly targets Jan–Dec 2026. */
  targets: number[]
  /** Monthly actuals Jan–Dec 2026 (null = not reported yet). Quarterly KPIs report on Mar/Jun/Sep/Dec. */
  actuals: (number | null)[]
  /** Commentary recorded with a reported value, by month index. */
  notes: Record<number, ValueNote>
}

const flat = (v: number) => Array.from({ length: 12 }, () => v)
const upTo = (values: number[]) => [...values, ...Array.from({ length: 12 - values.length }, () => null)]
const quarterly = (q1: number | null, q2: number | null, q3: number | null) =>
  [null, null, q1, null, null, q2, null, null, q3, null, null, null]

export const UNIT_LABEL: Record<Unit, L> = {
  pct: { en: "Percent (%)", ar: "نسبة مئوية (%)" },
  score: { en: "Score (−100 to 100)", ar: "درجة (−100 إلى 100)" },
  sar: { en: "Saudi riyal (SAR)", ar: "ريال سعودي" },
  hours: { en: "Hours", ar: "ساعات" },
  days: { en: "Days", ar: "أيام" },
  count: { en: "Count", ar: "عدد" },
}
export const FREQUENCY_LABEL: Record<Frequency, L> = {
  monthly: { en: "Monthly", ar: "شهري" },
  quarterly: { en: "Quarterly", ar: "ربع سنوي" },
}

const seedKpis: Kpi[] = [
  // SO-1 Guest experience
  {
    id: "guest-nps", code: "GX-01", objectiveId: "guest-experience", departmentId: "hospitality", owner: P.hessa,
    name: { en: "Guest satisfaction (NPS)", ar: "رضا الضيوف (NPS)" },
    definition: { en: "Net Promoter Score from the post-visit survey sent to every lounge and terminal guest.", ar: "صافي نقاط الترويج من استبيان ما بعد الزيارة المرسل لكل ضيف في الصالات والمباني." },
    unit: "score", direction: "up", frequency: "monthly", agg: "avg", weight: 30,
    targets: flat(70), actuals: upTo([61, 63, 62, 64, 66, 65, 67, 68, 66, 69]), notes: {},
  },
  {
    id: "lounge-csat", code: "GX-02", objectiveId: "guest-experience", departmentId: "hospitality", owner: P.lama,
    name: { en: "Lounge satisfaction (CSAT)", ar: "رضا ضيوف الصالات (CSAT)" },
    definition: { en: "Share of lounge guests rating their visit 4 or 5 out of 5.", ar: "نسبة ضيوف الصالات الذين قيّموا زيارتهم بـ 4 أو 5 من 5." },
    unit: "pct", direction: "up", frequency: "monthly", agg: "avg", weight: 25,
    targets: flat(92), actuals: upTo([89, 90, 88, 91, 90, 89, 92, 91, 90, 93]), notes: {},
  },
  {
    id: "complaint-resolution", code: "GX-03", objectiveId: "guest-experience", departmentId: "operations", owner: P.hessa,
    name: { en: "Complaint resolution time", ar: "مدة معالجة الشكاوى" },
    definition: { en: "Average hours from a guest complaint being logged to it being closed with the guest.", ar: "متوسط الساعات من تسجيل شكوى الضيف حتى إغلاقها معه." },
    unit: "hours", direction: "down", frequency: "monthly", agg: "avg", weight: 20,
    targets: flat(24), actuals: upTo([31, 30, 29, 28, 27, 30, 26, 25, 27, 24]), notes: {},
  },
  {
    id: "vip-sla", code: "GX-04", objectiveId: "guest-experience", departmentId: "hospitality", owner: P.lama,
    name: { en: "VIP meet & assist within SLA", ar: "استقبال كبار الشخصيات ضمن مستوى الخدمة" },
    definition: { en: "Share of VIP meet & assist bookings where the host met the guest at the aircraft door on time.", ar: "نسبة حجوزات استقبال كبار الشخصيات التي التقى فيها المضيف بالضيف عند باب الطائرة في الموعد." },
    unit: "pct", direction: "up", frequency: "monthly", agg: "avg", weight: 25,
    targets: flat(95), actuals: upTo([90, 91, 92, 92, 93, 91, 94, 94, 93, 95]), notes: {},
  },
  // SO-2 Operational excellence
  {
    id: "limo-on-time", code: "OX-01", objectiveId: "operational-excellence", departmentId: "operations", owner: P.turki,
    name: { en: "On-time limousine dispatch", ar: "انطلاق الليموزين في الموعد" },
    definition: { en: "Share of limousine trips where the car was at the pickup point at least 10 minutes early.", ar: "نسبة رحلات الليموزين التي وصلت فيها السيارة إلى نقطة الاستقبال قبل الموعد بـ 10 دقائق على الأقل." },
    unit: "pct", direction: "up", frequency: "monthly", agg: "avg", weight: 30,
    targets: flat(97), actuals: upTo([88, 89, 87, 90, 91, 86, 89, 90, 92, 91]), notes: {},
  },
  {
    id: "baggage-20", code: "OX-02", objectiveId: "operational-excellence", departmentId: "operations", owner: P.khalid,
    name: { en: "Baggage delivered within 20 min", ar: "تسليم الأمتعة خلال 20 دقيقة" },
    definition: { en: "Share of arriving guests whose baggage reached them within 20 minutes of on-block.", ar: "نسبة الضيوف القادمين الذين وصلتهم أمتعتهم خلال 20 دقيقة من توقف الطائرة." },
    unit: "pct", direction: "up", frequency: "monthly", agg: "avg", weight: 25,
    targets: flat(90), actuals: upTo([70, 72, 71, 73, 68, 66, 72, 74, 75, 76]), notes: {},
  },
  {
    id: "audit-compliance", code: "OX-03", objectiveId: "operational-excellence", departmentId: "operations", owner: P.khalid,
    name: { en: "Lounge audit compliance", ar: "الالتزام في تدقيق الصالات" },
    definition: { en: "Average share of checklist items passed in operational lounge audits.", ar: "متوسط نسبة بنود قوائم التحقق المستوفاة في تدقيق الصالات التشغيلي." },
    unit: "pct", direction: "up", frequency: "monthly", agg: "avg", weight: 20,
    targets: flat(95), actuals: upTo([85, 86, 88, 87, 84, 86, 89, 90, 88, 91]), notes: {},
  },
  {
    id: "fleet-availability", code: "OX-04", objectiveId: "operational-excellence", departmentId: "operations", owner: P.turki,
    name: { en: "Limousine fleet availability", ar: "جاهزية أسطول الليموزين" },
    definition: { en: "Share of the limousine fleet available for dispatch (not in maintenance).", ar: "نسبة أسطول الليموزين الجاهز للتشغيل (خارج الصيانة)." },
    unit: "pct", direction: "up", frequency: "monthly", agg: "avg", weight: 10,
    targets: flat(97), actuals: upTo([93, 94, 94, 95, 92, 91, 94, 95, 96, 95]), notes: {},
  },
  {
    id: "cost-to-revenue", code: "OX-05", objectiveId: "operational-excellence", departmentId: "finance", owner: P.majed,
    name: { en: "Operating cost-to-revenue ratio", ar: "نسبة التكاليف التشغيلية إلى الإيرادات" },
    definition: { en: "Operating cost as a share of revenue for the month.", ar: "التكاليف التشغيلية كنسبة من إيرادات الشهر." },
    unit: "pct", direction: "down", frequency: "monthly", agg: "avg", weight: 15,
    targets: flat(62), actuals: upTo([71, 70, 69, 70, 72, 73, 70, 69, 68, 68]), notes: {},
  },
  // SO-3 Commercial growth
  {
    id: "revenue", code: "CG-01", objectiveId: "commercial-growth", departmentId: "commercial", owner: P.sultan,
    name: { en: "Revenue vs target", ar: "الإيرادات مقابل المستهدف" },
    definition: { en: "Total recognised revenue across lounges, terminals, limousine, concierge and memberships.", ar: "إجمالي الإيرادات المحققة من الصالات والمباني والليموزين والكونسيرج والعضويات." },
    unit: "sar", direction: "up", frequency: "monthly", agg: "sum", weight: 35,
    targets: [4_100_000, 4_000_000, 4_600_000, 4_400_000, 4_500_000, 5_200_000, 5_600_000, 5_400_000, 4_300_000, 4_500_000, 4_700_000, 5_200_000],
    actuals: upTo([3_820_000, 3_760_000, 4_410_000, 4_050_000, 4_180_000, 4_690_000, 5_120_000, 5_030_000, 3_980_000, 4_210_000]),
    notes: {},
  },
  {
    id: "lounge-occupancy", code: "CG-02", objectiveId: "commercial-growth", departmentId: "commercial", owner: P.sultan,
    name: { en: "Lounge occupancy", ar: "إشغال الصالات" },
    definition: { en: "Average share of lounge seat-hours occupied during opening hours, all airports.", ar: "متوسط نسبة ساعات المقاعد المشغولة في الصالات خلال ساعات العمل في جميع المطارات." },
    unit: "pct", direction: "up", frequency: "monthly", agg: "avg", weight: 25,
    targets: flat(78), actuals: upTo([64, 62, 70, 66, 68, 74, 79, 77, 65, 68]), notes: {},
  },
  {
    id: "new-memberships", code: "CG-03", objectiveId: "commercial-growth", departmentId: "commercial", owner: P.faisal,
    name: { en: "New memberships sold", ar: "العضويات الجديدة المباعة" },
    definition: { en: "New individual and corporate memberships activated in the period.", ar: "العضويات الفردية وعضويات الشركات الجديدة المفعّلة خلال الفترة." },
    unit: "count", direction: "up", frequency: "monthly", agg: "sum", weight: 20,
    targets: flat(400), actuals: upTo([310, 295, 360, 330, 340, 390, 420, 410, 300, 330]), notes: {},
  },
  {
    id: "ancillary-per-guest", code: "CG-04", objectiveId: "commercial-growth", departmentId: "commercial", owner: P.faisal,
    name: { en: "Ancillary revenue per guest", ar: "الإيرادات الإضافية لكل ضيف" },
    definition: { en: "Average spend per guest on add-ons (spa, private suites, porter, fast-track).", ar: "متوسط إنفاق الضيف على الخدمات الإضافية (السبا، الأجنحة الخاصة، الحمّالين، المسار السريع)." },
    unit: "sar", direction: "up", frequency: "monthly", agg: "avg", weight: 10,
    targets: flat(180), actuals: upTo([152, 149, 160, 158, 161, 170, 176, 172, 155, 163]), notes: {},
  },
  {
    id: "dso", code: "CG-05", objectiveId: "commercial-growth", departmentId: "finance", owner: P.majed,
    name: { en: "Days sales outstanding", ar: "متوسط أيام التحصيل" },
    definition: { en: "Average days to collect corporate and airline receivables.", ar: "متوسط أيام تحصيل مستحقات الشركات وشركات الطيران." },
    unit: "days", direction: "down", frequency: "monthly", agg: "avg", weight: 10,
    targets: flat(45), actuals: upTo([58, 57, 55, 56, 54, 55, 53, 52, 54, 51]), notes: {},
  },
  // SO-4 People & capability
  {
    id: "engagement", code: "PC-01", objectiveId: "people-capability", departmentId: "hr", owner: P.noura,
    name: { en: "Employee engagement", ar: "تفاعل الموظفين" },
    definition: { en: "Engagement index from the quarterly pulse survey.", ar: "مؤشر التفاعل من استبيان النبض الربع سنوي." },
    unit: "pct", direction: "up", frequency: "quarterly", agg: "avg", weight: 40,
    targets: flat(80), actuals: quarterly(68, 70, 71), notes: {},
  },
  {
    id: "training-hours", code: "PC-02", objectiveId: "people-capability", departmentId: "hr", owner: P.noura,
    name: { en: "Training hours per employee", ar: "ساعات التدريب لكل موظف" },
    definition: { en: "Accredited training hours completed per frontline employee (48 hours a year).", ar: "ساعات التدريب المعتمدة المنجزة لكل موظف ميداني (48 ساعة سنويًا)." },
    unit: "hours", direction: "up", frequency: "monthly", agg: "sum", weight: 30,
    targets: flat(4), actuals: upTo([2.5, 3, 3.5, 2, 3, 1.5, 2, 3.5, 4, 3.5]), notes: {},
  },
  {
    id: "turnover", code: "PC-03", objectiveId: "people-capability", departmentId: "hr", owner: P.noura,
    name: { en: "Staff turnover (annualised)", ar: "معدل دوران الموظفين (سنوي)" },
    definition: { en: "Voluntary leavers in the month, annualised, as a share of headcount.", ar: "المغادرون طوعًا خلال الشهر، محسوبًا سنويًا، كنسبة من عدد الموظفين." },
    unit: "pct", direction: "down", frequency: "monthly", agg: "avg", weight: 30,
    targets: flat(12), actuals: upTo([16, 15, 15, 14, 16, 17, 15, 14, 14, 13]), notes: {},
  },
  // SO-5 Digital transformation
  {
    id: "digital-share", code: "DT-01", objectiveId: "digital-transformation", departmentId: "it", owner: P.yazeed,
    name: { en: "Digital booking share", ar: "حصة الحجوزات الرقمية" },
    definition: { en: "Share of lounge, limousine and meet & assist bookings made through the app or website.", ar: "نسبة حجوزات الصالات والليموزين والاستقبال التي تمت عبر التطبيق أو الموقع." },
    unit: "pct", direction: "up", frequency: "monthly", agg: "avg", weight: 40,
    targets: flat(45), actuals: upTo([22, 24, 25, 26, 27, 28, 28, 30, 31, 33]), notes: {},
  },
  {
    id: "uptime", code: "DT-02", objectiveId: "digital-transformation", departmentId: "it", owner: P.abdullah,
    name: { en: "Core system uptime", ar: "جاهزية الأنظمة الأساسية" },
    definition: { en: "Availability of booking, dispatch and lounge-access systems.", ar: "توفّر أنظمة الحجز والتوجيه ودخول الصالات." },
    unit: "pct", direction: "up", frequency: "monthly", agg: "avg", weight: 25,
    targets: flat(99.9), actuals: upTo([99.5, 99.7, 99.1, 99.8, 99.6, 98.9, 99.7, 99.8, 99.4, 99.9]), notes: {},
  },
  {
    id: "automation", code: "DT-03", objectiveId: "digital-transformation", departmentId: "it", owner: P.abdullah,
    name: { en: "Processes automated", ar: "العمليات المؤتمتة" },
    definition: { en: "Cumulative number of finance and HR processes running on automation (15 by year end).", ar: "العدد التراكمي لعمليات المالية والموارد البشرية المؤتمتة (15 بنهاية العام)." },
    unit: "count", direction: "up", frequency: "monthly", agg: "last", weight: 35,
    targets: [1, 3, 4, 5, 6, 8, 9, 10, 11, 12, 14, 15], actuals: upTo([0, 1, 1, 2, 2, 3, 4, 4, 5, 6]), notes: {},
  },
]

// A few recorded notes so the breakdown table has commentary from day one.
seedKpis.find((k) => k.id === "lounge-occupancy")!.notes[8] = {
  text: "September dip after the summer peak; corporate day-pass campaign launched on 20 Sep.",
  by: P.sultan.name, iso: "2026-10-04",
}
seedKpis.find((k) => k.id === "baggage-20")!.notes[5] = {
  text: "Jeddah apron works during June added 6–8 minutes to most deliveries.",
  by: P.khalid.name, iso: "2026-07-03",
}
seedKpis.find((k) => k.id === "uptime")!.notes[5] = {
  text: "Dispatch platform outage on 14 Jun (5h 40m). Root-cause fix deployed.",
  by: P.abdullah.name, iso: "2026-07-02",
}

export const initialKpis: Kpi[] = seedKpis

// ── initiatives ──────────────────────────────────────────────────────────────
export type Initiative = {
  id: string
  objectiveId: string
  title: L
  owner: Person
  start: string
  due: string
  progress: number
}

export const STAGES: L[] = [
  { en: "Planning", ar: "التخطيط" },
  { en: "Design", ar: "التصميم" },
  { en: "Build", ar: "التنفيذ" },
  { en: "Rollout", ar: "الإطلاق" },
  { en: "Closed", ar: "مكتملة" },
]
export function stageOf(progress: number): number {
  if (progress >= 100) return 4
  if (progress >= 80) return 3
  if (progress >= 45) return 2
  if (progress >= 20) return 1
  return 0
}

export const INITIATIVES: Initiative[] = [
  { id: "kiosks", objectiveId: "guest-experience", owner: P.lama, start: "2026-02-01", due: "2026-12-15", progress: 78,
    title: { en: "Self-service check-in kiosks in Riyadh lounges", ar: "أجهزة تسجيل الدخول الذاتي في صالات الرياض" } },
  { id: "feedback-loop", objectiveId: "guest-experience", owner: P.hessa, start: "2026-04-01", due: "2027-03-31", progress: 55,
    title: { en: "Real-time guest feedback loop in the app", ar: "حلقة ملاحظات الضيوف الفورية في التطبيق" } },
  { id: "ai-routing", objectiveId: "operational-excellence", owner: P.turki, start: "2026-03-01", due: "2026-12-31", progress: 70,
    title: { en: "Limousine dispatch optimisation (AI routing)", ar: "تحسين توجيه الليموزين (التوجيه الذكي)" } },
  { id: "baggage-jeddah", objectiveId: "operational-excellence", owner: P.khalid, start: "2026-01-15", due: "2026-11-30", progress: 64,
    title: { en: "Baggage SLA recovery programme — Jeddah", ar: "برنامج استعادة مستوى خدمة الأمتعة — جدة" } },
  { id: "alula-lounge", objectiveId: "commercial-growth", owner: P.sultan, start: "2026-05-01", due: "2026-12-01", progress: 82,
    title: { en: "AlUla seasonal lounge launch", ar: "إطلاق صالة العلا الموسمية" } },
  { id: "corporate-tier", objectiveId: "commercial-growth", owner: P.faisal, start: "2026-03-15", due: "2026-10-31", progress: 88,
    title: { en: "Corporate membership tier relaunch", ar: "إعادة إطلاق فئة عضوية الشركات" } },
  { id: "service-academy", objectiveId: "people-capability", owner: P.noura, start: "2026-01-10", due: "2026-12-31", progress: 58,
    title: { en: "Frontline service academy", ar: "أكاديمية الخدمة للفرق الميدانية" } },
  { id: "succession", objectiveId: "people-capability", owner: P.noura, start: "2026-06-01", due: "2027-05-31", progress: 40,
    title: { en: "Leadership succession plan", ar: "خطة التعاقب القيادي" } },
  { id: "booking-platform", objectiveId: "digital-transformation", owner: P.yazeed, start: "2026-01-01", due: "2026-12-31", progress: 52,
    title: { en: "Online booking & payments platform", ar: "منصة الحجز والدفع الإلكتروني" } },
  { id: "rpa", objectiveId: "digital-transformation", owner: P.abdullah, start: "2026-02-15", due: "2027-02-15", progress: 35,
    title: { en: "Robotic process automation — finance & HR", ar: "الأتمتة الروبوتية للعمليات — المالية والموارد البشرية" } },
  { id: "wifi6", objectiveId: "digital-transformation", owner: P.abdullah, start: "2026-03-01", due: "2026-09-30", progress: 100,
    title: { en: "Dammam lounge Wi-Fi 6 upgrade", ar: "ترقية شبكة Wi-Fi 6 في صالة الدمام" } },
]

const DAY = 86_400_000
const ms = (iso: string) => new Date(`${iso}T00:00:00Z`).getTime()

export type InitiativeHealth = { planned: number; ratio: number; status: Status | "done"; overdue: boolean }

export function initiativeHealth(i: Initiative): InitiativeHealth {
  if (i.progress >= 100) return { planned: 100, ratio: 100, status: "done", overdue: false }
  const span = Math.max(DAY, ms(i.due) - ms(i.start))
  const elapsed = Math.min(Math.max(ms(TODAY) - ms(i.start), 0), span)
  const planned = Math.max(1, (elapsed / span) * 100)
  const ratio = (i.progress / planned) * 100
  return { planned, ratio, status: statusOf(ratio), overdue: ms(TODAY) > ms(i.due) }
}

/** Most at-risk first (lowest progress against plan). Closed initiatives last. */
export function initiativesByRisk(list: Initiative[]): Initiative[] {
  return [...list].sort((a, b) => initiativeHealth(a).ratio - initiativeHealth(b).ratio)
}

// ── activity feed ────────────────────────────────────────────────────────────
export type FeedItem = {
  id: string
  objectiveId: string
  kpiId?: string
  kind: "comment" | "value" | "status"
  author: Person
  /** yyyy-mm-ddThh:mm */
  at: string
  text: L
}

export const initialFeed: FeedItem[] = [
  { id: "f1", objectiveId: "guest-experience", kind: "value", kpiId: "guest-nps", author: P.hessa, at: "2026-11-04T09:20",
    text: { en: "Reported October NPS: 69 — highest month of the year.", ar: "تم رفع قيمة NPS لشهر أكتوبر: 69 — أعلى شهر هذا العام." } },
  { id: "f2", objectiveId: "guest-experience", kind: "comment", author: P.reem, at: "2026-11-05T14:05",
    text: { en: "Kiosk pilot at Riyadh T5 lounge cut average check-in to 90 seconds. Rolling out to the remaining lounges in December.", ar: "خفّضت تجربة الأجهزة الذاتية في صالة مبنى 5 بالرياض متوسط تسجيل الدخول إلى 90 ثانية. سيتم التعميم على بقية الصالات في ديسمبر." } },
  { id: "f3", objectiveId: "guest-experience", kind: "comment", author: currentUser, at: "2026-11-06T10:40",
    text: { en: "Thanks Reem — please add the kiosk adoption rate to next month's review pack.", ar: "شكرًا ريم — يُرجى إضافة نسبة استخدام الأجهزة الذاتية إلى ملف مراجعة الشهر القادم." } },
  { id: "f4", objectiveId: "operational-excellence", kind: "status", author: P.khalid, at: "2026-11-03T08:15",
    text: { en: "Baggage SLA recovery in Jeddah moved to “off track”: two extra belt teams start on 15 November.", ar: "تم تحويل برنامج استعادة خدمة الأمتعة في جدة إلى «خارج المسار»: يبدأ فريقان إضافيان للسير في 15 نوفمبر." } },
  { id: "f5", objectiveId: "operational-excellence", kind: "value", kpiId: "limo-on-time", author: P.turki, at: "2026-11-02T16:30",
    text: { en: "Reported October on-time dispatch: 91%.", ar: "تم رفع نسبة الانطلاق في الموعد لشهر أكتوبر: 91%." } },
  { id: "f6", objectiveId: "commercial-growth", kind: "comment", author: P.sultan, at: "2026-11-07T11:00",
    text: { en: "AlUla seasonal lounge opens 1 December; pre-sales already cover 60% of December capacity.", ar: "تفتتح صالة العلا الموسمية في 1 ديسمبر؛ والمبيعات المسبقة تغطي 60% من سعة ديسمبر." } },
  { id: "f7", objectiveId: "commercial-growth", kind: "value", kpiId: "revenue", author: P.majed, at: "2026-11-05T09:00",
    text: { en: "October revenue closed at 4,210,000 SAR (94% of the month's target).", ar: "أُغلقت إيرادات أكتوبر عند 4,210,000 ريال (94% من مستهدف الشهر)." } },
  { id: "f8", objectiveId: "people-capability", kind: "comment", author: P.noura, at: "2026-10-28T13:10",
    text: { en: "Q4 pulse survey goes out on 1 December. Academy cohort 3 delayed by two weeks for Riyadh Season staffing.", ar: "يُرسل استبيان النبض للربع الرابع في 1 ديسمبر. تأجلت الدفعة الثالثة من الأكاديمية أسبوعين بسبب احتياج موسم الرياض." } },
  { id: "f9", objectiveId: "digital-transformation", kind: "status", author: P.abdullah, at: "2026-11-01T10:00",
    text: { en: "Payments gateway certification slipped to December; booking platform go-live now planned for January.", ar: "تأخر اعتماد بوابة الدفع إلى ديسمبر؛ والإطلاق الآن مخطط له في يناير." } },
  { id: "f10", objectiveId: "digital-transformation", kind: "comment", author: currentUser, at: "2026-11-02T09:30",
    text: { en: "Let's review the automation backlog with Finance before the board pack — we need 6 more processes by December.", ar: "لنراجع قائمة الأتمتة مع المالية قبل ملف مجلس الإدارة — نحتاج 6 عمليات إضافية بحلول ديسمبر." } },
]

// ── scoring ──────────────────────────────────────────────────────────────────
export type Score = {
  actual: number | null
  target: number | null
  /** Attainment against target, in percent (uncapped). */
  attainment: number | null
  /** Attainment capped at 100. */
  progress: number | null
  status: Status | null
}
const EMPTY: Score = { actual: null, target: null, attainment: null, progress: null, status: null }

export function lastDataMonth(kpis: Kpi[]): number {
  let last = -1
  for (const k of kpis) k.actuals.forEach((v, i) => { if (v !== null && i > last) last = i })
  return last
}

export function attainmentOf(k: Pick<Kpi, "direction">, actual: number, target: number): number {
  if (k.direction === "up") return target === 0 ? 100 : (actual / target) * 100
  return actual === 0 ? 100 : (target / actual) * 100
}

/** One KPI over the months [from, to]. */
export function scoreKpi(k: Kpi, from: number, to: number): Score {
  const idx: number[] = []
  for (let m = from; m <= to; m++) if (k.actuals[m] !== null && k.actuals[m] !== undefined) idx.push(m)
  if (idx.length === 0) return EMPTY
  let actual: number
  let target: number
  if (k.agg === "last") {
    const m = idx[idx.length - 1]
    actual = k.actuals[m]!
    target = k.targets[m]
  } else {
    const a = idx.reduce((s, m) => s + k.actuals[m]!, 0)
    const t = idx.reduce((s, m) => s + k.targets[m], 0)
    actual = k.agg === "sum" ? a : a / idx.length
    target = k.agg === "sum" ? t : t / idx.length
  }
  const attainment = attainmentOf(k, actual, target)
  const progress = Math.min(attainment, 100)
  return { actual, target, attainment, progress, status: statusOf(attainment) }
}

export const scoreKpiFor = (k: Kpi, p: Pick<Period, "from" | "to">) => scoreKpi(k, p.from, p.to)

export type Aggregate = { progress: number | null; status: Status | null; counted: number }

function weighted(items: { progress: number | null; weight: number }[]): Aggregate {
  const live = items.filter((x) => x.progress !== null)
  const w = live.reduce((s, x) => s + x.weight, 0)
  if (live.length === 0 || w === 0) return { progress: null, status: null, counted: 0 }
  const progress = live.reduce((s, x) => s + x.progress! * x.weight, 0) / w
  return { progress, status: statusOf(progress), counted: live.length }
}

export const kpisOf = (kpis: Kpi[], objectiveId: string) => kpis.filter((k) => k.objectiveId === objectiveId)

export function scoreObjective(o: Objective, kpis: Kpi[], from: number, to: number): Aggregate {
  return weighted(kpisOf(kpis, o.id).map((k) => ({ progress: scoreKpi(k, from, to).progress, weight: k.weight })))
}

export function scoreStrategy(kpis: Kpi[], from: number, to: number): Aggregate {
  return weighted(OBJECTIVES.map((o) => ({ progress: scoreObjective(o, kpis, from, to).progress, weight: o.weight })))
}

export function scoreDepartment(d: Department, kpis: Kpi[], from: number, to: number): Aggregate {
  return weighted(kpis.filter((k) => k.departmentId === d.id).map((k) => ({ progress: scoreKpi(k, from, to).progress, weight: 1 })))
}

/** Departments best-first with their 1-based rank (ties share a rank). */
export function rankDepartments(kpis: Kpi[], from: number, to: number) {
  const rows = DEPARTMENTS.map((d) => ({ dept: d, score: scoreDepartment(d, kpis, from, to) }))
    .sort((a, b) => (b.score.progress ?? -1) - (a.score.progress ?? -1))
  return rows.map((r) => ({
    ...r,
    rank: 1 + rows.filter((x) => Math.round(x.score.progress ?? -1) > Math.round(r.score.progress ?? -1)).length,
  }))
}

/** Count of KPIs per status for the period (KPIs with no value are "no data"). */
export function kpiStatusCounts(kpis: Kpi[], from: number, to: number) {
  const c = { "on-track": 0, "at-risk": 0, "off-track": 0, none: 0 }
  for (const k of kpis) {
    const s = scoreKpi(k, from, to).status
    c[s ?? "none"]++
  }
  return c
}
