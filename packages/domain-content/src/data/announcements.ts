import { createCollection, newId } from "../collections"

export type Announcement = {
  id: string
  title: string; titleAr: string
  body: string; bodyAr: string
  category: string; categoryAr: string
  date: string; dateAr: string
  audience: string; audienceAr: string
  important?: boolean
  pinned?: boolean
  details?: string[]; detailsAr?: string[]
}

const SEED: Announcement[] = [
  { id: "a1", title: "Eid Al-Adha — office closure schedule", titleAr: "عيد الأضحى — جدول إغلاق المكاتب", body: "All offices will be closed from the 9th to the 13th. Operations teams follow the on-call rota shared by your line manager.", bodyAr: "ستُغلق جميع المكاتب من ٩ إلى ١٣. تتبع فرق العمليات جدول المناوبة المشترك من مديرك.", category: "HR", categoryAr: "الموارد البشرية", date: "Aug 3, 2026", dateAr: "٣ أغسطس ٢٠٢٦", audience: "All employees", audienceAr: "جميع الموظفين", important: true, pinned: true, details: [
    "All corporate offices and support functions will observe the public holiday from Wednesday the 9th through Sunday the 13th, resuming normal hours on Monday the 14th.",
    "Front-line operations, security and IT on-call will run on a reduced rota. Your line manager will confirm your individual shifts by the end of this week — please acknowledge the schedule once you receive it.",
    "Any leave beyond the official holiday should be requested through the HR self-service portal so we can maintain minimum coverage across critical teams.",
    "On behalf of the executive team, we wish you and your families a blessed and joyful Eid Al-Adha.",
  ], detailsAr: [
    "ستلتزم جميع المكاتب المؤسسية ووظائف الدعم بالعطلة الرسمية من الأربعاء ٩ حتى الأحد ١٣، وتُستأنف ساعات العمل المعتادة يوم الإثنين ١٤.",
    "ستعمل فرق العمليات والأمن والدعم التقني بجدول مناوبة مخفّض. سيؤكد مديرك مناوباتك بنهاية هذا الأسبوع — يُرجى تأكيد استلامك للجدول.",
    "يُرجى طلب أي إجازة إضافية عبر بوابة الخدمة الذاتية للموارد البشرية للحفاظ على الحد الأدنى من التغطية.",
    "نيابةً عن الفريق التنفيذي، نتمنى لكم ولعائلاتكم عيد أضحى مباركًا.",
  ] },
  { id: "a2", title: "Ramadan working hours in effect", titleAr: "ساعات عمل رمضان سارية", body: "Adjusted hours (10:00–16:00) are now active. See the HR circular for team-specific arrangements.", bodyAr: "ساعات العمل المعدّلة (١٠:٠٠–١٦:٠٠) سارية الآن. راجع تعميم الموارد البشرية للترتيبات الخاصة بكل فريق.", category: "HR", categoryAr: "الموارد البشرية", date: "Aug 1, 2026", dateAr: "١ أغسطس ٢٠٢٦", audience: "All employees", audienceAr: "جميع الموظفين", important: true, pinned: true },
  { id: "a3", title: "Phishing drill results published", titleAr: "نشر نتائج اختبار التصيّد", body: "This quarter's security-awareness results are available in the Trust Center. Great improvement across teams.", bodyAr: "نتائج التوعية الأمنية لهذا الربع متاحة في مركز الثقة. تحسّن كبير عبر الفرق.", category: "IT", categoryAr: "تقنية المعلومات", date: "Jul 30, 2026", dateAr: "٣٠ يوليو ٢٠٢٦", audience: "All employees", audienceAr: "جميع الموظفين" },
  { id: "a4", title: "New parking arrangements — HQ", titleAr: "ترتيبات مواقف جديدة — المقر", body: "Level B2 reopens Monday. Badge access required; visitor bays moved to B1.", bodyAr: "يُعاد فتح المستوى B2 يوم الإثنين. يلزم تصريح الدخول؛ نُقلت مواقف الزوّار إلى B1.", category: "Facilities", categoryAr: "المرافق", date: "Jul 28, 2026", dateAr: "٢٨ يوليو ٢٠٢٦", audience: "HQ staff", audienceAr: "موظفو المقر" },
  { id: "a5", title: "Wellbeing Day — save the date", titleAr: "يوم الرفاهية — احجز الموعد", body: "Join us on September 2 for workshops, health checks and activities in the staff lounge.", bodyAr: "انضم إلينا في ٢ سبتمبر لورش العمل والفحوصات الصحية والأنشطة في استراحة الموظفين.", category: "Culture", categoryAr: "الثقافة", date: "Jul 24, 2026", dateAr: "٢٤ يوليو ٢٠٢٦", audience: "All employees", audienceAr: "جميع الموظفين" },
]

export const ANN_CATS = ["All", "HR", "IT", "Facilities", "Culture"]
export const ANN_CATS_AR: Record<string, string> = { All: "الكل", HR: "الموارد البشرية", IT: "تقنية المعلومات", Facilities: "المرافق", Culture: "الثقافة" }

const store = createCollection<Announcement>(SEED, "announcements")
export const useAnnouncements = () => store.use()
export const getAnnouncementById = (id: string) => store.getById(id)
export const addAnnouncement = (a: Announcement) => store.add(a)
export const updateAnnouncement = (id: string, patch: Partial<Announcement>) => store.update(id, patch)
export const deleteAnnouncement = (id: string) => store.remove(id)
export const newAnnouncementId = () => newId("ann")
