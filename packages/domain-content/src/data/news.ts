export type Status = "Published" | "Draft"

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
}

const P = (...paras: string[]) => paras.map((p) => `<p>${p}</p>`).join("")

export const NEWS: NewsItem[] = [
  {
    id: "n1",
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
