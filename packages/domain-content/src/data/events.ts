import { createCollection } from "../collections"

export type EventItem = {
  id: string
  title: string; titleAr: string
  desc: string; descAr: string
  day: string; mon: string; weekday: string; weekdayAr: string
  time: string; timeAr: string
  location: string; locationAr: string
  format: "In person" | "Virtual" | "Hybrid"; formatAr: string
  organizer: string; organizerAr: string
  audience: string; audienceAr: string
  category: string; categoryAr: string
  attendees: number; capacity: number
  past?: boolean
  img: string
  endDay?: string; endMon?: string
  agenda?: { time: string; item: string; itemAr: string }[]
}

const SEED: EventItem[] = [
  { id: "e1", title: "Q3 Leadership Town Hall", titleAr: "اللقاء القيادي للربع الثالث", desc: "Quarterly business update from the executive team, followed by a live, open Q&A.", descAr: "تحديث ربع سنوي من الفريق التنفيذي، يتبعه نقاش مفتوح ومباشر.", day: "12", mon: "AUG", weekday: "Tuesday", weekdayAr: "الثلاثاء", time: "10:00–11:30", timeAr: "١٠:٠٠–١١:٣٠", location: "HQ Auditorium", locationAr: "قاعة المقر", format: "Hybrid", formatAr: "مزيج", organizer: "Executive Office", organizerAr: "المكتب التنفيذي", audience: "All employees", audienceAr: "جميع الموظفين", category: "Corporate", categoryAr: "مؤسسي", attendees: 218, capacity: 300, img: "images/cms/conference.jpg", agenda: [
    { time: "10:00", item: "Welcome & CEO opening", itemAr: "الترحيب وكلمة الرئيس التنفيذي" },
    { time: "10:15", item: "Q3 business results & KPIs", itemAr: "نتائج ومؤشرات الربع الثالث" },
    { time: "10:40", item: "Strategic priorities for Q4", itemAr: "الأولويات الاستراتيجية للربع الرابع" },
    { time: "11:00", item: "Recognition & team highlights", itemAr: "التكريم وإنجازات الفرق" },
    { time: "11:10", item: "Live, open Q&A", itemAr: "أسئلة وأجوبة مفتوحة ومباشرة" },
    { time: "11:25", item: "Closing remarks", itemAr: "الكلمة الختامية" },
  ] },
  { id: "e2", title: "Safety & Standards Workshop", titleAr: "ورشة السلامة والمعايير", desc: "A hands-on refresher on ground-safety standards, incident reporting and drills.", descAr: "تدريب عملي على معايير السلامة الأرضية والإبلاغ عن الحوادث.", day: "18", mon: "AUG", weekday: "Monday", weekdayAr: "الإثنين", time: "13:00–15:00", timeAr: "١٣:٠٠–١٥:٠٠", location: "Terminal Training Room", locationAr: "غرفة تدريب المحطة", format: "In person", formatAr: "حضوري", organizer: "HSE Team", organizerAr: "فريق الصحة والسلامة", audience: "Operations", audienceAr: "العمليات", category: "Training", categoryAr: "تدريب", attendees: 64, capacity: 80, img: "images/cms/training.jpg" },
  { id: "e3", title: "Wajha Portal Launch Event", titleAr: "فعالية إطلاق بوابة وجهة", desc: "Introducing the new employee portal — a walkthrough of features with live demos.", descAr: "تقديم بوابة الموظف الجديدة — جولة في المزايا مع عروض حية.", day: "24", mon: "AUG", weekday: "Sunday", weekdayAr: "الأحد", time: "09:30–11:00", timeAr: "٠٩:٣٠–١١:٠٠", location: "Innovation Hub", locationAr: "مركز الابتكار", format: "In person", formatAr: "حضوري", organizer: "Digital Workplace", organizerAr: "بيئة العمل الرقمية", audience: "All employees", audienceAr: "جميع الموظفين", category: "Product", categoryAr: "منتج", attendees: 180, capacity: 250, img: "images/cms/teamwork.jpg" },
  { id: "e4", title: "Wellbeing Day", titleAr: "يوم الرفاهية", desc: "A full day of workshops, health checks and activities across the staff lounge.", descAr: "يوم كامل من ورش العمل والفحوصات الصحية والأنشطة في استراحة الموظفين.", day: "02", mon: "SEP", weekday: "Wednesday", weekdayAr: "الأربعاء", time: "All day", timeAr: "طوال اليوم", location: "Staff Lounge", locationAr: "استراحة الموظفين", format: "In person", formatAr: "حضوري", organizer: "People & Culture", organizerAr: "الموظفون والثقافة", audience: "All employees", audienceAr: "جميع الموظفين", category: "Culture", categoryAr: "ثقافي", attendees: 140, capacity: 200, img: "images/cms/wellbeing.jpg" },
  { id: "e6", title: "Wellbeing Week", titleAr: "أسبوع الرفاهية", desc: "A full week of wellbeing sessions, on-site health screenings, fitness classes and mindfulness workshops across every location.", descAr: "أسبوع كامل من جلسات الرفاهية والفحوصات الصحية وحصص اللياقة وورش اليقظة الذهنية في جميع المواقع.", day: "14", mon: "SEP", endDay: "18", endMon: "SEP", weekday: "Mon–Fri", weekdayAr: "الإثنين–الجمعة", time: "All week · 09:00–16:00", timeAr: "طوال الأسبوع · ٠٩:٠٠–١٦:٠٠", location: "All sites", locationAr: "جميع المواقع", format: "In person", formatAr: "حضوري", organizer: "People & Culture", organizerAr: "الموظفون والثقافة", audience: "All employees", audienceAr: "جميع الموظفين", category: "Culture", categoryAr: "ثقافي", attendees: 96, capacity: 500, img: "images/cms/wellbeing.jpg", agenda: [
    { time: "Mon", item: "Health screenings & biometrics", itemAr: "الفحوصات الصحية والقياسات" },
    { time: "Tue", item: "Fitness & movement classes", itemAr: "حصص اللياقة والحركة" },
    { time: "Wed", item: "Mental-health & mindfulness workshops", itemAr: "ورش الصحة النفسية واليقظة" },
    { time: "Thu", item: "Nutrition clinics & healthy lunch", itemAr: "عيادات التغذية والغداء الصحي" },
    { time: "Fri", item: "Family day & closing celebration", itemAr: "يوم العائلة والاحتفال الختامي" },
  ] },
  { id: "e5", title: "Ramadan Iftar Gathering", titleAr: "تجمّع إفطار رمضان", desc: "An evening gathering to share iftar and celebrate together across teams.", descAr: "تجمّع مسائي لمشاركة الإفطار والاحتفال معًا عبر الفرق.", day: "28", mon: "JUL", weekday: "Monday", weekdayAr: "الإثنين", time: "18:30–20:30", timeAr: "١٨:٣٠–٢٠:٣٠", location: "HQ Garden", locationAr: "حديقة المقر", format: "In person", formatAr: "حضوري", organizer: "People & Culture", organizerAr: "الموظفون والثقافة", audience: "All employees", audienceAr: "جميع الموظفين", category: "Culture", categoryAr: "ثقافي", attendees: 205, capacity: 220, past: true, img: "images/cms/gathering.jpg" },
]

export const EVENT_CATEGORIES = ["Corporate", "Training", "Product", "Culture"]
export const EVENT_FORMATS: EventItem["format"][] = ["In person", "Virtual", "Hybrid"]
export const EVENT_IMAGES = ["conference", "training", "teamwork", "wellbeing", "gathering", "celebrate", "office"].map((n) => `images/cms/${n}.jpg`)
export const formatAr = (f: EventItem["format"]) => (f === "In person" ? "حضوري" : f === "Virtual" ? "افتراضي" : "مزيج")

const store = createCollection<EventItem>(SEED, "events")
export const useEvents = () => store.use()

const RSVP_KEY = "reach.rsvp"
export function getRsvp(): string[] {
  try { return JSON.parse(localStorage.getItem(RSVP_KEY) || "[]") } catch { return [] }
}
export function setRsvp(ids: string[]) {
  try { localStorage.setItem(RSVP_KEY, JSON.stringify(ids)) } catch { /**/ }
}
export const getEventById = (id: string) => store.getById(id)
export const addEvent = (e: EventItem) => store.append(e)
export const updateEvent = (id: string, patch: Partial<EventItem>) => store.update(id, patch)
export const deleteEvent = (id: string) => store.remove(id)
