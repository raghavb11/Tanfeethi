/** Home dashboard fixtures — mirrors the ALTANFEETHI dashboard design
 *  (greeting, next meeting, AI ask bar, agenda, inbox, tasks, approvals,
 *  project completion, quick links, announcements). Demo-only. */

export const person = {
  name: "Fawaz Al-Ghailan", nameAr: "فواز الغيلان",
  initials: "FA",
  dateLabel: "Sunday · 26 July 2026", dateLabelAr: "الأحد · ٢٦ يوليو ٢٠٢٦",
  city: "Riyadh", cityAr: "الرياض",
  temp: 43,
}

export const nextMeeting = {
  title: "Portfolio review", titleAr: "مراجعة المحفظة",
  inMinutes: 25,
  time: "10:00 AM", timeAr: "١٠:٠٠ ص",
  minutes: 60,
  platform: "Zoom",
  attendees: ["N", "M", "S"],
  more: 8,
}

export const aiSuggestions = [
  { en: "Summarise the Q3 report", ar: "تلخيص تقرير الربع الثالث" },
  { en: "Reschedule tomorrow's meetings", ar: "إعادة تنظيم اجتماعات الغد" },
  { en: "Show transactions awaiting reply", ar: "عرض المعاملات بانتظار الرد" },
]

export const kpiPills: { id: string; label: string; ar: string; value: string; icon: string; to?: string }[] = [
  { id: "tasks", label: "Open tasks", ar: "المهام المفتوحة", value: "250", icon: "check", to: "/tasks?tab=open" },
  { id: "requests", label: "Pending requests", ar: "الطلبات المعلقة", value: "250", icon: "inbox" },
  { id: "mail", label: "Important mail", ar: "البريد المهم", value: "12", icon: "mail" },
  { id: "projects", label: "Projects in progress", ar: "المشاريع قيد التنفيذ", value: "12", icon: "briefcase" },
]

export type AgendaMode = "onsite" | "zoom" | "meal"
export const agenda: { time: string; title: string; titleAr: string; place: string; placeAr: string; mins?: number; mode: AgendaMode; now?: boolean }[] = [
  { time: "09:00", title: "Morning briefing", titleAr: "إحاطة الصباح", place: "Chairman's office", placeAr: "مكتب الرئيس", mins: 15, mode: "onsite" },
  { time: "10:00", title: "Portfolio review", titleAr: "مراجعة المحفظة", place: "Finance", placeAr: "المالية", mins: 60, mode: "zoom", now: true },
  { time: "11:30", title: "Airport partners meeting", titleAr: "لقاء شركاء المطار", place: "King Khalid Airport", placeAr: "مطار الملك خالد", mins: 45, mode: "onsite" },
  { time: "13:00", title: "Working lunch", titleAr: "غداء عمل", place: "VIP lounge", placeAr: "قاعة كبار الزوار", mode: "meal" },
]

export const inbox = [
  { id: "m1", initials: "N", name: "Noura Al-Qahtani", nameAr: "نورة القحطاني", subject: "Notes on the Jeddah contract", subjectAr: "ملاحظات على عقد جدة", time: "08:42", timeAr: "٠٨:٤٢", unread: true },
  { id: "m2", initials: "S", name: "Saud Al-Dosari", nameAr: "سعود الدوسري", subject: "Lounge traffic report — July", subjectAr: "تقرير حركة الصالة — يوليو", time: "08:10", timeAr: "٠٨:١٠", unread: true },
  { id: "m3", initials: "M", name: "Mohammed Al-Otaibi", nameAr: "محمد العتيبي", subject: "Delegation visit schedule", subjectAr: "موعد زيارة الوفد", time: "Yesterday", timeAr: "أمس", unread: false },
  { id: "m4", initials: "L", name: "Lama Al-Shamri", nameAr: "لمى الشمري", subject: "Team training proposal", subjectAr: "مقترح تدريب الفرق", time: "Yesterday", timeAr: "أمس", unread: false },
  { id: "m5", initials: "F", name: "Faisal Al-Harbi", nameAr: "فيصل الحربي", subject: "Quarterly budget approval", subjectAr: "اعتماد ميزانية الربع", time: "Sunday", timeAr: "الأحد", unread: false },
  { id: "m6", initials: "H", name: "Hind Al-Zahrani", nameAr: "هند الزهراني", subject: "Member portal update", subjectAr: "تحديث بوابة الأعضاء", time: "Sunday", timeAr: "الأحد", unread: false },
]

export const myTasks = [
  { id: "t1", title: "Approve the summer operating plan", titleAr: "اعتماد خطة التشغيل الصيفية", dept: "Operations", deptAr: "العمليات", due: "Today", dueAr: "اليوم", done: false },
  { id: "t2", title: "Review hospitality partner proposal", titleAr: "مراجعة عرض شركاء الضيافة", dept: "Commercial", deptAr: "التجارية", due: "Tomorrow", dueAr: "غداً", done: false },
  { id: "t3", title: "Sign the limousine contract annex", titleAr: "توقيع ملحق عقد الليموزين", dept: "Transport", deptAr: "النقل", due: "Thursday", dueAr: "الخميس", done: false },
  { id: "t4", title: "Board briefing", titleAr: "إحاطة مجلس الإدارة", dept: "Chairmanship", deptAr: "الرئاسة", due: "2 Aug", dueAr: "٢ أغسطس", done: false },
  { id: "t5", title: "Creative team meeting", titleAr: "اجتماع الفريق الإبداعي", dept: "Marketing", deptAr: "التسويق", due: "10 Aug", dueAr: "١٠ أغسطس", done: false },
  { id: "t6", title: "Project planning session", titleAr: "جلسة تخطيط المشروع", dept: "Development", deptAr: "التطوير", due: "15 Aug", dueAr: "١٥ أغسطس", done: false },
  { id: "t7", title: "Annual performance review", titleAr: "مراجعة الأداء السنوي", dept: "Human Resources", deptAr: "الموارد البشرية", due: "22 Aug", dueAr: "٢٢ أغسطس", done: false },
]

export const pendingApprovals = [
  { id: "a1", icon: "file", title: "Jeddah lounge operating contract", titleAr: "عقد تشغيل صالة جدة", meta: "Operations · ends tomorrow", metaAr: "العمليات · ينتهي غداً", amount: "SAR 420,000", amountAr: "٤٢٠٬٠٠٠ ر.س" },
  { id: "a2", icon: "user", title: "Hire a guest services manager", titleAr: "توظيف مدير خدمة الضيوف", meta: "HR · 3 candidates", metaAr: "الموارد البشرية · ٣ مرشحين", amount: "", amountAr: "" },
  { id: "a3", icon: "car", title: "Renew the limousine fleet", titleAr: "تجديد أسطول الليموزين", meta: "Transport · second review", metaAr: "النقل · مراجعة ثانية", amount: "SAR 1,250,000", amountAr: "١٬٢٥٠٬٠٠٠ ر.س" },
]

export type ProjStatus = "onTrack" | "slight" | "late"
export const projects: { id: string; name: string; nameAr: string; owner: string; ownerAr: string; unit: string; unitAr: string; pct: number; delta: number; status: ProjStatus }[] = [
  { id: "p1", name: "Riyadh lounge expansion", nameAr: "توسعة صالة الرياض", owner: "Saud Al-Dosari", ownerAr: "سعود الدوسري", unit: "Delivery", unitAr: "التنفيذ", pct: 78, delta: 4, status: "onTrack" },
  { id: "p2", name: "Executive membership app", nameAr: "تطبيق العضوية التنفيذية", owner: "Hind Al-Zahrani", ownerAr: "هند الزهراني", unit: "Design", unitAr: "التصميم", pct: 54, delta: 1, status: "slight" },
  { id: "p3", name: "User interface refresh", nameAr: "تحديث واجهة المستخدم", owner: "Khaled Al-Salmi", ownerAr: "خالد السلمي", unit: "Engineering", unitAr: "البرمجة", pct: 72, delta: 3, status: "onTrack" },
  { id: "p4", name: "Data analytics", nameAr: "تحليل البيانات", owner: "Reem Al-Otaibi", ownerAr: "ريم العتيبي", unit: "Data", unitAr: "البيانات", pct: 38, delta: 2, status: "slight" },
  { id: "p5", name: "Private transport fleet", nameAr: "أسطول النقل الخاص", owner: "Faisal Al-Harbi", ownerAr: "فيصل الحربي", unit: "Supply", unitAr: "التوريد", pct: 31, delta: 0, status: "late" },
]

export const activeTasks: { id: string; title: string; titleAr: string; phase: string; phaseAr: string; group: string; groupAr: string; pct: number; status: ProjStatus }[] = [
  { id: "at1", title: "Airport expansion", titleAr: "توسعة المطار", phase: "Construction phase 2", phaseAr: "مرحلة البناء الثانية", group: "Capital projects", groupAr: "مشاريع رأس المال", pct: 68, status: "onTrack" },
  { id: "at2", title: "Infrastructure upgrade", titleAr: "تحديث البنية التحتية", phase: "Planning phase", phaseAr: "مرحلة التخطيط", group: "Capital projects", groupAr: "مشاريع رأس المال", pct: 45, status: "late" },
  { id: "at3", title: "Road network development", titleAr: "تطوير شبكة الطرق", phase: "Delivery phase", phaseAr: "مرحلة التنفيذ", group: "Transport projects", groupAr: "مشاريع النقل", pct: 82, status: "onTrack" },
  { id: "at4", title: "Solar power installation", titleAr: "تركيب أنظمة الطاقة الشمسية", phase: "Installation phase", phaseAr: "مرحلة التركيب", group: "Energy projects", groupAr: "مشاريع الطاقة", pct: 53, status: "slight" },
  { id: "at5", title: "New residential compound", titleAr: "إنشاء المجمع السكني الجديد", phase: "Finishing phase", phaseAr: "مرحلة التشطيب", group: "Housing projects", groupAr: "مشاريع الإسكان", pct: 77, status: "onTrack" },
  { id: "at6", title: "Water network improvement", titleAr: "تحسين شبكات المياه", phase: "Delivery phase", phaseAr: "مرحلة التنفيذ", group: "Infrastructure", groupAr: "مشاريع البنية التحتية", pct: 60, status: "late" },
]

export const quickServices = [
  { id: "car", label: "Car & driver", ar: "السيارة والسائق", icon: "car", tone: "#b4643f" },
  { id: "baggage", label: "Baggage transfer", ar: "نقل الأمتعة", icon: "luggage", tone: "#a97b4a" },
  { id: "lounge", label: "Lounge", ar: "الصالة", icon: "sofa", tone: "#2f6f5e" },
  { id: "reception", label: "Reception", ar: "الاستقبال", icon: "users", tone: "#8e4c58" },
  { id: "meeting", label: "Meeting room", ar: "قاعة الاجتماعات", icon: "presentation", tone: "#6b4f8a" },
  { id: "membership", label: "Membership", ar: "العضوية", icon: "crown", tone: "#7a3f3f" },
  { id: "concierge", label: "Concierge", ar: "الكونسيرج", icon: "headset", tone: "#4a5a6b" },
  { id: "trips", label: "My trips", ar: "رحلاتي", icon: "plane", tone: "#3f5a7a" },
]

export const announcement = {
  title: "Eid Al-Adha & Hajj holiday — office closure schedule",
  titleAr: "إجازة عيد الأضحى و الحج - جدول إغلاق المكتب",
  img: "images/cms/ramadan.jpg",
}
