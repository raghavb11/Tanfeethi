export type Status = "Published" | "Draft" | "Scheduled" | "Archived"

export type NewsItem = {
  id: string
  title: string
  titleAr: string
  category: string
  date: string
  excerpt: string
  status: Status
  featured?: boolean
  tint: string
  img: string
  body: string
  // WIJHA knowledge fields (Arabic-first copy + reading time)
  categoryAr?: string
  dateAr?: string
  excerptAr?: string
  bodyAr?: string
  readMin?: number
}

/** Arabic labels for the news categories. */
export const NEWS_CAT_AR: Record<string, string> = {
  Operations: "عمليات", Corporate: "المؤسسية", People: "الموظفون", Technology: "التقنية", Events: "الفعاليات", HR: "الموارد البشرية",
}
export const newsCatLabel = (cat: string, isAr: boolean) => (isAr ? NEWS_CAT_AR[cat] ?? cat : cat)

/** Newsroom metadata shown on the News console (list + grid views). */
export type NewsMeta = {
  ref: string
  author: string; authorAr: string; initials: string
  views: number
  rating: number; ratingCount: number
  comments: number
  status?: Status
}

export const NEWS_META: Record<string, NewsMeta> = {
  n1: { ref: "N243547", author: "Sarah M.", authorAr: "سارة م.", initials: "SA", views: 1240, rating: 4.8, ratingCount: 126, comments: 24 },
  n2: { ref: "N243512", author: "Ahmed H.", authorAr: "أحمد ح.", initials: "AH", views: 980, rating: 4.5, ratingCount: 88, comments: 12 },
  n3: { ref: "N243498", author: "Sara Al-Mutairi", authorAr: "سارة المطيري", initials: "SM", views: 1465, rating: 4.7, ratingCount: 143, comments: 31 },
  n4: { ref: "N243455", author: "Layan Al Marwani", authorAr: "ليان المرواني", initials: "LM", views: 2110, rating: 4.9, ratingCount: 205, comments: 46 },
  n5: { ref: "N243401", author: "Khalid Al-Saadi", authorAr: "خالد السعدي", initials: "KS", views: 0, rating: 0, ratingCount: 0, comments: 0 },
  n6: { ref: "N243377", author: "Noura Saleh", authorAr: "نورة صالح", initials: "NS", views: 640, rating: 4.4, ratingCount: 57, comments: 9, status: "Scheduled" },
}

/** Deterministic fallback so authored articles also render in the console. */
export function metaFor(id: string, i = 0): NewsMeta {
  return NEWS_META[id] ?? {
    ref: `N${(243300 + (i + 1) * 7).toString()}`,
    author: "Khalid Al-Saadi", authorAr: "خالد السعدي", initials: "KS",
    views: 0, rating: 0, ratingCount: 0, comments: 0,
  }
}

const P = (...paras: string[]) => paras.map((p) => `<p>${p}</p>`).join("")

export const NEWS: NewsItem[] = [
  {
    id: "n0",
    title: "New Jeddah Lounge operations begin in September",
    titleAr: "تشغيل صالة جدة الجديدة يبدأ في سبتمبر",
    category: "Operations",
    categoryAr: "عمليات",
    date: "Yesterday",
    dateAr: "أمس",
    readMin: 3,
    excerpt: "The lounge welcomes its first member groups early next month with double capacity and 24/7 concierge service.",
    excerptAr: "تستقبل الصالة أول أفواج الأعضاء مطلع الشهر القادم بسعة مضاعفة وخدمة كونسيرج على مدار الساعة.",
    status: "Published",
    tint: "#3d2031",
    img: "images/cms/office.jpg",
    body: P(
      "The lounge welcomes its first member groups early next month with <b>double capacity</b> and 24/7 concierge service.",
      "Fit-out is complete and the operations team is running final service rehearsals ahead of the September opening.",
    ),
    bodyAr: P(
      "تستقبل الصالة أول أفواج الأعضاء مطلع الشهر القادم بسعة مضاعفة وخدمة كونسيرج على مدار الساعة.",
      "اكتملت أعمال التجهيز ويُجري فريق العمليات التجارب النهائية للخدمة استعدادًا للافتتاح في سبتمبر.",
    ),
  },
  {
    id: "n1",
    categoryAr: "المؤسسية", dateAr: "٢ أغسطس ٢٠٢٦", readMin: 2, excerptAr: "تكريم في جوائز التميّز الإقليمية للطيران عن عمليات صالات كبار الزوار.",
    title: "ALTANFEETHI wins Best Aviation Services 2026",
    titleAr: "التنفيذي تفوز بجائزة أفضل خدمات طيران ٢٠٢٦",
    category: "Corporate",
    date: "Aug 2, 2026",
    excerpt: "Recognized at the regional aviation excellence awards for VIP terminal operations.",
    status: "Published",
    featured: true,
    tint: "#234024",
    img: "images/cms/aviation.jpg",
    body: P(
      "ALTANFEETHI has been named <b>Best Aviation Services provider 2026</b> at the regional aviation excellence awards, recognizing the company's VIP terminal operations and private-aviation experience.",
      "The award celebrates a year of record guest satisfaction and the expansion of premium services across the Kingdom's key gateways.",
      "“This recognition belongs to every team member who makes each journey seamless,” leadership said during the ceremony.",
    ),
  },
  {
    id: "n2",
    categoryAr: "الموظفون", dateAr: "١ أغسطس ٢٠٢٦", readMin: 1, excerptAr: "نشرت الموارد البشرية الجدول المعدّل اعتبارًا من أول أيام رمضان.",
    title: "New Ramadan working hours announced",
    titleAr: "الإعلان عن ساعات عمل رمضان الجديدة",
    category: "People",
    date: "Aug 1, 2026",
    excerpt: "HR has published the adjusted schedule effective from the first of Ramadan.",
    status: "Published",
    tint: "#ce7b5b",
    img: "images/cms/ramadan.jpg",
    body: P(
      "People Operations has published the adjusted working hours for the holy month of Ramadan, effective from the first day of the month.",
      "Core hours will run from 10:00 to 16:00, with flexible arrangements available for operational teams. Full details are available in the HR circular.",
    ),
  },
  {
    id: "n3",
    categoryAr: "عمليات", dateAr: "٣٠ يوليو ٢٠٢٦", readMin: 2, excerptAr: "أعمال المرحلة الثانية تسير وفق الخطة لبلوغ هدف الربع الرابع.",
    title: "Terminal expansion reaches 68% completion",
    titleAr: "توسعة المبنى تصل إلى ٦٨٪ من الإنجاز",
    category: "Operations",
    date: "Jul 30, 2026",
    excerpt: "Phase 2 construction remains on track for the Q4 milestone.",
    status: "Published",
    tint: "#3d2031",
    img: "images/cms/office.jpg",
    body: P(
      "The terminal expansion programme has reached <b>68% completion</b>, keeping Phase 2 firmly on track for its Q4 milestone.",
      "The expanded facility will add new premium lounges, streamlined arrival flows and expanded capacity for peak-season demand.",
    ),
  },
  {
    id: "n4",
    categoryAr: "التقنية", dateAr: "٢٨ يوليو ٢٠٢٦", readMin: 2, excerptAr: "نظرة أولى على منصة تجربة الموظف الموحّدة.",
    title: "Wajha portal rollout — what's new",
    titleAr: "إطلاق بوابة وجهة — الجديد",
    category: "Technology",
    date: "Jul 28, 2026",
    excerpt: "A first look at the unified employee experience platform.",
    status: "Published",
    tint: "#ab8025",
    img: "images/cms/dashboard.jpg",
    body: P(
      "The <b>Wajha</b> employee portal brings news, services, approvals and self-service into one unified, bilingual experience.",
      "This first release covers the personalized home, work hub, employee center and the content modules — with more capabilities arriving each phase.",
    ),
  },
  {
    id: "n5",
    categoryAr: "الموظفون", dateAr: "—", readMin: 1, excerptAr: "بانتظار اعتماد القيادة قبل النشر لجميع الموظفين.",
    title: "Eid Al-Adha holiday schedule (draft)",
    titleAr: "جدول عطلة عيد الأضحى (مسودة)",
    category: "People",
    date: "—",
    excerpt: "Pending leadership approval before publishing to all staff.",
    status: "Draft",
    tint: "#9c7dde",
    img: "images/cms/gathering.jpg",
    body: P("This announcement is a draft pending leadership approval before it is published to all staff."),
  },
  {
    id: "n6",
    categoryAr: "الفعاليات", dateAr: "٢٥ يوليو ٢٠٢٦", readMin: 1, excerptAr: "انضم إلى فريق القيادة لمراجعة الربع الثالث وجلسة أسئلة مفتوحة.",
    title: "Quarterly town hall — save the date",
    titleAr: "اللقاء الفصلي — احجز الموعد",
    category: "Events",
    date: "Jul 25, 2026",
    excerpt: "Join the leadership team for the Q3 review and open Q&A.",
    status: "Published",
    tint: "#234024",
    img: "images/cms/conference.jpg",
    body: P(
      "Join the leadership team for the <b>Q3 Town Hall</b> — a review of the quarter's milestones followed by an open Q&amp;A.",
      "The session will be held in the HQ auditorium and streamed for remote colleagues. Add it to your calendar from the Events page.",
    ),
  },
]

export function getMockArticle(id: string) {
  return NEWS.find((n) => n.id === id)
}
