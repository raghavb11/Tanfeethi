// ─── categories ──────────────────────────────────────────────────────────────

export type CategoryId = "operations" | "finance" | "it" | "people" | "design" | "strategy"

export const categories: {
  id: CategoryId
  label: string
  labelAr: string
  /** tailwind tone keyword used for accent color */
  tone: "primary" | "emerald" | "blue" | "amber" | "violet" | "cyan"
}[] = [
  { id: "operations", label: "Operations", labelAr: "العمليات", tone: "primary" },
  { id: "finance", label: "Finance", labelAr: "المالية", tone: "emerald" },
  { id: "it", label: "IT", labelAr: "تقنية المعلومات", tone: "blue" },
  { id: "people", label: "People", labelAr: "الموارد البشرية", tone: "amber" },
  { id: "design", label: "Design", labelAr: "التصميم", tone: "violet" },
  { id: "strategy", label: "Strategy", labelAr: "الاستراتيجية", tone: "cyan" },
]

export type TaskPriority = "high" | "medium" | "low"
export type ColumnId = "backlog" | "progress" | "review" | "done"

// ─── kanban ──────────────────────────────────────────────────────────────────

export const kanbanColumns: {
  id: ColumnId
  title: string
  titleAr: string
  cards: {
    id: string
    title: string
    titleAr: string
    owner: string
    ownerAr: string
    initials: string
    ai: string
    aiAr: string
    category: CategoryId
    priority: TaskPriority
    due: string
    dueAr: string
  }[]
}[] = [
  {
    id: "backlog",
    title: "Backlog",
    titleAr: "قائمة الانتظار",
    cards: [
      {
        id: "k1",
        title: "Normalize vendor contacts",
        titleAr: "توحيد بيانات الموردين",
        owner: "A. Stone",
        ownerAr: "أحمد ستون",
        initials: "AS",
        ai: "Group with Vendor QBR prep",
        aiAr: "ادمجها مع تجهيزات اجتماع الموردين",
        category: "operations",
        priority: "medium",
        due: "May 8",
        dueAr: "8 مايو",
      },
      {
        id: "k2",
        title: "Draft comms — policy v3",
        titleAr: "صياغة تواصل — السياسة الإصدار 3",
        owner: "A. Mohammed",
        ownerAr: "أحمد محمد",
        initials: "AM",
        ai: "Reuse People Ops template",
        aiAr: "استخدم قالب الموارد البشرية",
        category: "people",
        priority: "low",
        due: "May 12",
        dueAr: "12 مايو",
      },
    ],
  },
  {
    id: "progress",
    title: "In progress",
    titleAr: "قيد التنفيذ",
    cards: [
      {
        id: "k3",
        title: "Reach pilot — IT cohort",
        titleAr: "تجربة ريتش — فريق تقنية المعلومات",
        owner: "M. Chen",
        ownerAr: "مايا تشن",
        initials: "MC",
        ai: "Book 20m desk with IT lead",
        aiAr: "احجز 20 دقيقة مع مدير التقنية",
        category: "it",
        priority: "high",
        due: "May 5",
        dueAr: "5 مايو",
      },
      {
        id: "k4",
        title: "Finance data quality checks",
        titleAr: "فحوصات جودة البيانات المالية",
        owner: "R. Ortiz",
        ownerAr: "رنا أورتيز",
        initials: "RO",
        ai: "Add blocker: source feed delay",
        aiAr: "أضف عائقًا: تأخير مصدر البيانات",
        category: "finance",
        priority: "high",
        due: "May 4",
        dueAr: "4 مايو",
      },
    ],
  },
  {
    id: "review",
    title: "Review",
    titleAr: "قيد المراجعة",
    cards: [
      {
        id: "k5",
        title: "Incident postmortem packet",
        titleAr: "حزمة تحليل ما بعد الحادث",
        owner: "S. Park",
        ownerAr: "سارة بارك",
        initials: "SP",
        ai: "Attach DNS timeline",
        aiAr: "أرفق الجدول الزمني لـ DNS",
        category: "it",
        priority: "medium",
        due: "May 6",
        dueAr: "6 مايو",
      },
    ],
  },
  {
    id: "done",
    title: "Done",
    titleAr: "مكتمل",
    cards: [
      {
        id: "k6",
        title: "Quarterly OKR cascade",
        titleAr: "تتالي أهداف الربع",
        owner: "D. Ali",
        ownerAr: "ضياء علي",
        initials: "DA",
        ai: "Archive to Knowledge Hub",
        aiAr: "أرشف في مركز المعرفة",
        category: "strategy",
        priority: "low",
        due: "Apr 30",
        dueAr: "30 أبريل",
      },
    ],
  },
]

export type KanbanColumn = (typeof kanbanColumns)[number]

// ─── my tasks ────────────────────────────────────────────────────────────────

export const myTasks: {
  id: string
  title: string
  titleAr: string
  status: "in-progress" | "blocked" | "queued" | "review"
  statusLabel: string
  statusLabelAr: string
  due: string
  dueAr: string
  category: CategoryId
  priority: TaskPriority
  progress: number
}[] = [
  {
    id: "t1",
    title: "Finalize rollout deck v2",
    titleAr: "إتمام عرض الإطلاق — الإصدار 2",
    status: "in-progress",
    statusLabel: "In progress",
    statusLabelAr: "قيد التنفيذ",
    due: "May 4",
    dueAr: "4 مايو",
    category: "strategy",
    priority: "high",
    progress: 65,
  },
  {
    id: "t2",
    title: "Approve contract redlines — Acme",
    titleAr: "اعتماد تعديلات عقد أكمي",
    status: "blocked",
    statusLabel: "Blocked",
    statusLabelAr: "محجوب",
    due: "May 5",
    dueAr: "5 مايو",
    category: "operations",
    priority: "high",
    progress: 30,
  },
  {
    id: "t3",
    title: "Refresh incident runbook",
    titleAr: "تحديث دليل الحوادث",
    status: "queued",
    statusLabel: "Queued",
    statusLabelAr: "في الطابور",
    due: "May 8",
    dueAr: "8 مايو",
    category: "it",
    priority: "medium",
    progress: 10,
  },
  {
    id: "t4",
    title: "Q2 budget reforecast",
    titleAr: "إعادة توقع ميزانية الربع الثاني",
    status: "review",
    statusLabel: "In review",
    statusLabelAr: "قيد المراجعة",
    due: "May 6",
    dueAr: "6 مايو",
    category: "finance",
    priority: "high",
    progress: 80,
  },
  {
    id: "t5",
    title: "Brand refresh — internal portal",
    titleAr: "تحديث الهوية — البوابة الداخلية",
    status: "in-progress",
    statusLabel: "In progress",
    statusLabelAr: "قيد التنفيذ",
    due: "May 10",
    dueAr: "10 مايو",
    category: "design",
    priority: "medium",
    progress: 45,
  },
  {
    id: "t6",
    title: "Onboarding flow review",
    titleAr: "مراجعة تدفق الانضمام",
    status: "queued",
    statusLabel: "Queued",
    statusLabelAr: "في الطابور",
    due: "May 12",
    dueAr: "12 مايو",
    category: "people",
    priority: "low",
    progress: 5,
  },
]

// ─── projects ────────────────────────────────────────────────────────────────

export const projects: {
  id: string
  name: string
  nameAr: string
  health: "green" | "amber"
  phase: string
  phaseAr: string
  category: CategoryId
  progress: number
  team: number
  tasks: { total: number; done: number }
}[] = [
  {
    id: "p1",
    name: "Reach Enterprise",
    nameAr: "ريتش للمؤسسات",
    health: "green",
    phase: "Wave 2 — Services",
    phaseAr: "الموجة 2 — الخدمات",
    category: "strategy",
    progress: 68,
    team: 14,
    tasks: { total: 42, done: 28 },
  },
  {
    id: "p2",
    name: "Zero-trust uplift",
    nameAr: "ترقية الأمن المُعدوم الثقة",
    health: "amber",
    phase: "Foundations",
    phaseAr: "الأساسيات",
    category: "it",
    progress: 35,
    team: 8,
    tasks: { total: 31, done: 11 },
  },
  {
    id: "p3",
    name: "Data platform migration",
    nameAr: "ترحيل منصة البيانات",
    health: "green",
    phase: "Cutover planning",
    phaseAr: "تخطيط التحول",
    category: "it",
    progress: 82,
    team: 11,
    tasks: { total: 56, done: 46 },
  },
]

// ─── AI next actions ─────────────────────────────────────────────────────────

export const aiNextActions: { en: string; ar: string }[] = [
  {
    en: "Delegate “Normalize vendor contacts” to the Vendor ops intern",
    ar: "فوّض «توحيد بيانات الموردين» لمتدرب عمليات الموردين",
  },
  {
    en: "Snooze “Policy v3” until legal review completes (May 6)",
    ar: "أجّل «السياسة الإصدار 3» حتى انتهاء المراجعة القانونية (6 مايو)",
  },
  {
    en: "Turn “Incident postmortem” into a template for Network events",
    ar: "حوّل «تحليل الحادث» إلى قالب لأحداث الشبكة",
  },
]
