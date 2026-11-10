/** Home dashboard fixtures — mirror the WIJHA "Homepage - Dark" Figma frames
 *  (2013:5689 base, 2227:5149 / 5897 / 6645 hero variants, 315:680 with the
 *  assistant docked). Demo-only. Every string ships in English + Arabic. */

export const person = {
  name: "Fawaz Al-Ghailan", nameAr: "فواز الغيلان",
  firstName: "Fawaz", firstNameAr: "فواز",
  initials: "FA",
  dateLabel: "Sunday • 26 July 2026", dateLabelAr: "الأحد • 26 يوليو 2026",
  city: "Riyadh", cityAr: "الرياض",
  temp: 43,
}

/* ── Hero: left widget, driven by the 4-icon vertical switcher ─────────────── */

export type HeroTab = "meeting" | "course" | "news" | "weather"

export const nextMeeting = {
  title: "Portfolio review", titleAr: "مراجعة المحفظة",
  inMinutes: 25,
  time: "10:00 AM", timeAr: "10:00 ص",
  minutes: 60,
  platform: "Zoom",
  attendees: [
    { initials: "NQ", img: "images/avatar-khalid.jpg" },
    { initials: "SD", img: "" },
    { initials: "MO", img: "" },
  ],
  more: 8,
}

export const currentCourse = {
  title: "Executive Leadership Program", titleAr: "برنامج القيادة التنفيذية",
  session: "10/07",
  progress: 68,
  minutes: 20,
  platform: "Zoom",
  remaining: 3,
}

export const heroNews = [
  {
    id: "eid",
    title: "Eid Al-Adha & Hajj holiday — office closure schedule",
    titleAr: "إجازة عيد الأضحى و الحج - جدول إغلاق المكتب",
    img: "images/cms/ramadan.jpg",
    to: "/announcements",
  },
  {
    id: "jeddah",
    title: "The new Jeddah lounge opens in September",
    titleAr: "تشغيل صالة جدة الجديدة يبدأ في سبتمبر",
    img: "images/cms/aviation.jpg",
    to: "/news",
  },
  {
    id: "training",
    title: "Registration opens for the Q3 leadership training",
    titleAr: "فتح التسجيل في برنامج التدريب القيادي للربع الثالث",
    img: "images/cms/training.jpg",
    to: "/news",
  },
]

export type WeatherIcon = "sun" | "cloudSun" | "moon"
export const weather = {
  city: "Riyadh", cityAr: "الرياض",
  temp: 43,
  condition: "Clear", conditionAr: "صافٍ",
  min: 29, max: 50,
  wind: 12,
  humidity: 8,
  // Figma labels every slot "AM" (8, 12, 4, 8 AM) — corrected to a real
  // four-hourly forecast that matches the falling temperatures.
  hourly: [
    { time: "8:00 AM", timeAr: "8:00 ص", icon: "sun" as WeatherIcon, temp: 44 },
    { time: "12:00 PM", timeAr: "12:00 م", icon: "sun" as WeatherIcon, temp: 42 },
    { time: "4:00 PM", timeAr: "4:00 م", icon: "cloudSun" as WeatherIcon, temp: 36 },
    { time: "8:00 PM", timeAr: "8:00 م", icon: "moon" as WeatherIcon, temp: 31 },
  ],
}

/* ── Hero: AI ask bar ──────────────────────────────────────────────────────── */

export const aiSuggestions = [
  { id: "q1", icon: "file", en: "Q1 report", ar: "تقرير الربع الأول" },
  { id: "meetings", icon: "calendar", en: "Tomorrow’s meetings", ar: "اجتماعات الغد" },
  { id: "pending", icon: "users", en: "Show transactions awaiting reply", ar: "عرض المعاملات بانتظار الرد" },
]

/* ── KPI tiles (Figma order, inline-start → end) ──────────────────────────── */

export const kpiTiles: { id: string; label: string; ar: string; value: string; icon: string; to?: string }[] = [
  { id: "projects", label: "Projects", ar: "المشاريع", value: "12", icon: "projects", to: "/projects" },
  { id: "mail", label: "Mail", ar: "البريد", value: "12", icon: "mail" },
  { id: "requests", label: "Requests", ar: "الطلبات", value: "250", icon: "requests", to: "/services" },
  { id: "tasks", label: "Tasks", ar: "المهام", value: "250", icon: "tasks", to: "/tasks?tab=open" },
]

/* ── Agenda ────────────────────────────────────────────────────────────────── */

export type AgendaMode = "onsite" | "zoom"
export const agenda: { id: string; time: string; title: string; titleAr: string; place: string; placeAr: string; mins: number; mode: AgendaMode; now?: boolean }[] = [
  { id: "ag1", time: "09:00", title: "Morning briefing", titleAr: "إحاطة الصباح", place: "Jeddah hall", placeAr: "قاعة جدة", mins: 60, mode: "onsite" },
  { id: "ag2", time: "10:00", title: "Portfolio review", titleAr: "مراجعة المحفظة", place: "Zoom", placeAr: "Zoom", mins: 60, mode: "zoom", now: true },
  { id: "ag3", time: "11:30", title: "Airport partners meeting", titleAr: "لقاء شركاء المطار", place: "Riyadh hall", placeAr: "قاعة الرياض", mins: 60, mode: "onsite" },
  { id: "ag4", time: "13:00", title: "Working lunch", titleAr: "غداء عمل", place: "Riyadh hall", placeAr: "قاعة الرياض", mins: 60, mode: "onsite" },
  // Figma's header says "6 appointments" but draws four — two more keep the count honest.
  { id: "ag5", time: "15:00", title: "Hospitality partners follow-up", titleAr: "متابعة شركاء الضيافة", place: "Zoom", placeAr: "Zoom", mins: 30, mode: "zoom" },
  { id: "ag6", time: "16:30", title: "Weekly operations review", titleAr: "مراجعة العمليات الأسبوعية", place: "Jeddah hall", placeAr: "قاعة جدة", mins: 45, mode: "onsite" },
]

/* ── Mail ──────────────────────────────────────────────────────────────────── */

export const inbox = [
  { id: "m1", initial: "N", initialAr: "ن", name: "Noura Al-Qahtani", nameAr: "نورة القحطاني", subject: "Notes on the Jeddah contract", subjectAr: "ملاحظات على عقد جدة", time: "08:42", timeAr: "08:42", unread: true },
  { id: "m2", initial: "S", initialAr: "س", name: "Saud Al-Dosari", nameAr: "سعود الدوسري", subject: "Lounge traffic report — July", subjectAr: "تقرير حركة الصالة — يوليو", time: "08:10", timeAr: "08:10", unread: true },
  { id: "m3", initial: "M", initialAr: "م", name: "Mohammed Al-Otaibi", nameAr: "محمد العتيبي", subject: "Delegation visit schedule", subjectAr: "موعد زيارة الوفد", time: "Yesterday", timeAr: "أمس", unread: false },
  { id: "m4", initial: "L", initialAr: "ل", name: "Lama Al-Shamri", nameAr: "لمى الشمري", subject: "Team training proposal", subjectAr: "مقترح تدريب الفرق", time: "Yesterday", timeAr: "أمس", unread: false },
  { id: "m5", initial: "F", initialAr: "ف", name: "Faisal Al-Harbi", nameAr: "فيصل الحربي", subject: "Quarterly budget approval", subjectAr: "اعتماد ميزانية الربع", time: "Sunday", timeAr: "الأحد", unread: false },
  { id: "m6", initial: "H", initialAr: "ه", name: "Hind Al-Zahrani", nameAr: "هند الزهراني", subject: "Member portal update", subjectAr: "تحديث بوابة الأعضاء", time: "Sunday", timeAr: "الأحد", unread: false },
  { id: "m7", initial: "H", initialAr: "ه", name: "Hind Al-Zahrani", nameAr: "هند الزهراني", subject: "Lounge shift roster", subjectAr: "جدول مناوبات الصالة", time: "Sunday", timeAr: "الأحد", unread: false },
]

/* ── My tasks ──────────────────────────────────────────────────────────────── */

export type DueTone = "today" | "tomorrow" | "later"
export const myTasks: { id: string; title: string; titleAr: string; dept: string; deptAr: string; icon: string; due: string; dueAr: string; tone: DueTone; done: boolean }[] = [
  { id: "t1", title: "Approve the summer operating plan", titleAr: "اعتماد خطة التشغيل الصيفية", dept: "Operations", deptAr: "العمليات", icon: "gear", due: "Today", dueAr: "اليوم", tone: "today", done: false },
  { id: "t2", title: "Review hospitality partner proposal", titleAr: "مراجعة عرض شركاء الضيافة", dept: "Commercial", deptAr: "التجارية", icon: "handshake", due: "Tomorrow", dueAr: "غداً", tone: "tomorrow", done: false },
  { id: "t3", title: "Sign the limousine contract annex", titleAr: "توقيع ملحق عقد الليموزين", dept: "Transport", deptAr: "النقل", icon: "bus", due: "Thursday", dueAr: "الخميس", tone: "later", done: false },
  { id: "t4", title: "Board briefing", titleAr: "إحاطة مجلس الإدارة", dept: "Chairmanship", deptAr: "الرئاسة", icon: "building", due: "2 Aug", dueAr: "2 أغسطس", tone: "later", done: false },
  // Figma repeats "Board briefing" as filler rows — replaced with distinct tasks.
  { id: "t5", title: "Creative team meeting", titleAr: "اجتماع الفريق الإبداعي", dept: "Marketing", deptAr: "التسويق", icon: "megaphone", due: "10 Aug", dueAr: "10 أغسطس", tone: "later", done: false },
  { id: "t6", title: "Annual performance review", titleAr: "مراجعة الأداء السنوي", dept: "Human Resources", deptAr: "الموارد البشرية", icon: "users", due: "22 Aug", dueAr: "22 أغسطس", tone: "later", done: false },
]

/* ── Approvals ─────────────────────────────────────────────────────────────── */

export type ApprovalStatus = "pending" | "review"
export const pendingApprovals: { id: string; icon: string; title: string; titleAr: string; meta: string; metaAr: string; amount: string; amountAr: string; status: ApprovalStatus; keywords: string }[] = [
  { id: "a1", icon: "file", title: "Jeddah lounge operating contract", titleAr: "عقد تشغيل صالة جدة", meta: "Operations · ends tomorrow", metaAr: "العمليات · ينتهي غداً", amount: "SAR 420,000", amountAr: "٤٢٠٬٠٠٠ ر.س", status: "pending", keywords: "contract operations عقد العمليات" },
  { id: "a2", icon: "user", title: "Hire a guest services manager", titleAr: "توظيف مدير خدمة الضيوف", meta: "HR · 3 candidates", metaAr: "الموارد البشرية · 3 مرشحين", amount: "", amountAr: "", status: "pending", keywords: "hiring hr توظيف" },
  { id: "a3", icon: "car", title: "Renew the limousine fleet", titleAr: "تجديد أسطول الليموزين", meta: "Transport · second review", metaAr: "النقل · مراجعة ثانية", amount: "SAR 1,250,000", amountAr: "١٬٢٥٠٬٠٠٠ ر.س", status: "pending", keywords: "fleet transport أسطول النقل" },
  // Figma repeats the "guest services manager" request as its under-review
  // example — a distinct request here so the list has no duplicate.
  { id: "a4", icon: "user", title: "Hire a lounge shift supervisor", titleAr: "توظيف مشرف مناوبة الصالة", meta: "HR · 2 candidates", metaAr: "الموارد البشرية · 2 مرشحين", amount: "", amountAr: "", status: "review", keywords: "hiring hr توظيف" },
]

/* ── Projects ──────────────────────────────────────────────────────────────── */

export type ProjStatus = "onTrack" | "slight" | "late"
export const projects: { id: string; name: string; nameAr: string; owner: string; ownerAr: string; pct: number; delta: number; status: ProjStatus }[] = [
  { id: "p1", name: "Riyadh lounge expansion", nameAr: "توسعة صالة الرياض", owner: "Saud Al-Dosari", ownerAr: "سعود الدوسري", pct: 78, delta: 4, status: "onTrack" },
  { id: "p2", name: "Executive membership app", nameAr: "تطبيق العضوية التنفيذية", owner: "Hind Al-Zahrani", ownerAr: "هند الزهراني", pct: 54, delta: 1, status: "slight" },
  { id: "p3", name: "Private transport fleet", nameAr: "أسطول النقل الخاص", owner: "Faisal Al-Harbi", ownerAr: "فيصل الحربي", pct: 31, delta: 0, status: "late" },
]

/* ── Links (Figma order, inline-start → end, row by row) ──────────────────── */

export const quickLinks = [
  { id: "reception", label: "Reception", ar: "الاستقبال", icon: "users", to: "/services" },
  { id: "meeting", label: "Meeting room", ar: "قاعة الاجتماعات", icon: "presentation", to: "/services" },
  { id: "membership", label: "Membership", ar: "العضوية", icon: "crown", to: "/services" },
  { id: "concierge", label: "Concierge", ar: "الكونسيرج", icon: "headset", to: "/services" },
  { id: "trips", label: "My trips", ar: "رحلاتي", icon: "plane", to: "/services" },
  { id: "car", label: "Car & driver", ar: "السيارة والسائق", icon: "car", to: "/services" },
  { id: "baggage", label: "Baggage transfer", ar: "نقل الأمتعة", icon: "luggage", to: "/services" },
  { id: "lounge", label: "Lounge", ar: "الصالة", icon: "sofa", to: "/services" },
]
