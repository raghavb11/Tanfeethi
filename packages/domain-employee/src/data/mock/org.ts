/** Organisation chart — the reporting tree used by the Org Chart page.
 *  Demo-only fixtures; a real build reads these from the HR system. */

export type OrgPerson = {
  id: string
  name: string; nameAr: string
  initials: string
  title: string; titleAr: string
  department: string; departmentAr: string
  location: string; locationAr: string
  email: string
  phone?: string
  /** null for the top of the tree. */
  managerId: string | null
  /** The signed-in employee, highlighted throughout the chart. */
  isMe?: boolean
  photo?: string
}

/** Department accent colours, shared by the chart, the avatars and the legend. */
export const DEPT_COLORS: Record<string, string> = {
  "Executive Office": "#c8794f",
  Commercial: "#5b8fce",
  "Business Operations": "#5f9d52",
  "Ground Services": "#8e6bc9",
  Finance: "#c9a227",
  "People & Culture": "#d1697f",
  "IT & Security": "#4aa3a3",
  "Legal & Compliance": "#8a8a8a",
}
export const deptColor = (d: string) => DEPT_COLORS[d] ?? "#8a8a8a"

export const ME_ID = "p-khalid"

export const ORG: OrgPerson[] = [
  // ── executive ──
  { id: "p-ceo", name: "Fahad Al-Otaibi", nameAr: "فهد العتيبي", initials: "FO", title: "Chief Executive Officer", titleAr: "الرئيس التنفيذي", department: "Executive Office", departmentAr: "المكتب التنفيذي", location: "HQ · Riyadh", locationAr: "المقر · الرياض", email: "fahad.alotaibi@altanfeethi.com.sa", phone: "+966 11 200 1000", managerId: null },
  { id: "p-eaceo", name: "Dana Al-Sudairi", nameAr: "دانة السديري", initials: "DS", title: "Chief of Staff", titleAr: "رئيس الديوان", department: "Executive Office", departmentAr: "المكتب التنفيذي", location: "HQ · Riyadh", locationAr: "المقر · الرياض", email: "dana.alsudairi@altanfeethi.com.sa", managerId: "p-ceo" },

  // ── commercial ──
  { id: "p-ahmed", name: "Ahmed Mohammed", nameAr: "أحمد محمد", initials: "AM", title: "VP, Commercial", titleAr: "نائب الرئيس، التجاري", department: "Commercial", departmentAr: "التجاري", location: "HQ · Riyadh", locationAr: "المقر · الرياض", email: "ahmed.mohammed@altanfeethi.com.sa", phone: "+966 11 200 1120", managerId: "p-ceo" },
  { id: ME_ID, name: "Khalid Al-Saadi", nameAr: "خالد السعدي", initials: "KS", title: "Director, Business Operations", titleAr: "مدير العمليات التجارية", department: "Business Operations", departmentAr: "العمليات التجارية", location: "HQ · Riyadh", locationAr: "المقر · الرياض", email: "khalid@altanfeethi.com.sa", phone: "+966 11 200 1145", managerId: "p-ahmed", isMe: true, photo: "/images/avatar-khalid.jpg" },
  { id: "p-sara", name: "Sara Al-Mutairi", nameAr: "سارة المطيري", initials: "SM", title: "Senior Operations Analyst", titleAr: "محلل عمليات أول", department: "Business Operations", departmentAr: "العمليات التجارية", location: "HQ · Riyadh", locationAr: "المقر · الرياض", email: "sara.almutairi@altanfeethi.com.sa", managerId: ME_ID },
  { id: "p-mohammad", name: "Mohammad Iqbal", nameAr: "محمد إقبال", initials: "MI", title: "Operations Analyst", titleAr: "محلل عمليات", department: "Business Operations", departmentAr: "العمليات التجارية", location: "HQ · Riyadh", locationAr: "المقر · الرياض", email: "mohammad.iqbal@altanfeethi.com.sa", managerId: ME_ID },
  { id: "p-noura", name: "Noura Saleh", nameAr: "نورة صالح", initials: "NS", title: "Operations Coordinator", titleAr: "منسق عمليات", department: "Business Operations", departmentAr: "العمليات التجارية", location: "Terminal 1", locationAr: "الصالة ١", email: "noura.saleh@altanfeethi.com.sa", managerId: ME_ID },
  { id: "p-faisal", name: "Faisal Al-Harbi", nameAr: "فيصل الحربي", initials: "FH", title: "Operations Specialist", titleAr: "أخصائي عمليات", department: "Business Operations", departmentAr: "العمليات التجارية", location: "Terminal 5", locationAr: "الصالة ٥", email: "faisal.alharbi@altanfeethi.com.sa", managerId: ME_ID },

  { id: "p-reem", name: "Reem Al-Dossari", nameAr: "ريم الدوسري", initials: "RD", title: "Director, Commercial Partnerships", titleAr: "مدير الشراكات التجارية", department: "Commercial", departmentAr: "التجاري", location: "HQ · Riyadh", locationAr: "المقر · الرياض", email: "reem.aldossari@altanfeethi.com.sa", managerId: "p-ahmed" },
  { id: "p-bandar", name: "Bandar Al-Shehri", nameAr: "بندر الشهري", initials: "BS", title: "Partnerships Manager", titleAr: "مدير الشراكات", department: "Commercial", departmentAr: "التجاري", location: "HQ · Riyadh", locationAr: "المقر · الرياض", email: "bandar.alshehri@altanfeethi.com.sa", managerId: "p-reem" },
  { id: "p-hessa", name: "Hessa Al-Muhaisen", nameAr: "حصة المحيسن", initials: "HM", title: "Contracts Specialist", titleAr: "أخصائي عقود", department: "Commercial", departmentAr: "التجاري", location: "HQ · Riyadh", locationAr: "المقر · الرياض", email: "hessa.almuhaisen@altanfeethi.com.sa", managerId: "p-reem" },

  { id: "p-turki", name: "Turki Al-Qahtani", nameAr: "تركي القحطاني", initials: "TQ", title: "Director, Lounge Experience", titleAr: "مدير تجربة الصالات", department: "Commercial", departmentAr: "التجاري", location: "Terminal 1", locationAr: "الصالة ١", email: "turki.alqahtani@altanfeethi.com.sa", managerId: "p-ahmed" },
  { id: "p-lama", name: "Lama Al-Faisal", nameAr: "لمى الفيصل", initials: "LF", title: "Guest Experience Manager", titleAr: "مدير تجربة الضيوف", department: "Commercial", departmentAr: "التجاري", location: "Terminal 1", locationAr: "الصالة ١", email: "lama.alfaisal@altanfeethi.com.sa", managerId: "p-turki" },
  { id: "p-omar", name: "Omar Al-Juhani", nameAr: "عمر الجهني", initials: "OJ", title: "Lounge Operations Manager", titleAr: "مدير عمليات الصالات", department: "Commercial", departmentAr: "التجاري", location: "Terminal 5", locationAr: "الصالة ٥", email: "omar.aljuhani@altanfeethi.com.sa", managerId: "p-turki" },

  // ── ground services ──
  { id: "p-abdullah", name: "Abdullah Al-Ghamdi", nameAr: "عبدالله الغامدي", initials: "AG", title: "VP, Ground Services", titleAr: "نائب الرئيس، الخدمات الأرضية", department: "Ground Services", departmentAr: "الخدمات الأرضية", location: "Terminal 1", locationAr: "الصالة ١", email: "abdullah.alghamdi@altanfeethi.com.sa", phone: "+966 11 200 1210", managerId: "p-ceo" },
  { id: "p-nasser", name: "Nasser Al-Balawi", nameAr: "ناصر البلوي", initials: "NB", title: "Director, Terminal Operations", titleAr: "مدير عمليات الصالات", department: "Ground Services", departmentAr: "الخدمات الأرضية", location: "Terminal 1", locationAr: "الصالة ١", email: "nasser.albalawi@altanfeethi.com.sa", managerId: "p-abdullah" },
  { id: "p-ghada", name: "Ghada Al-Otaishan", nameAr: "غادة العطيشان", initials: "GO", title: "Terminal Duty Manager", titleAr: "مدير مناوبة الصالة", department: "Ground Services", departmentAr: "الخدمات الأرضية", location: "Terminal 3", locationAr: "الصالة ٣", email: "ghada.alotaishan@altanfeethi.com.sa", managerId: "p-nasser" },
  { id: "p-salem", name: "Salem Al-Dawsari", nameAr: "سالم الدوسري", initials: "SD", title: "Director, Fleet & Transport", titleAr: "مدير الأسطول والنقل", department: "Ground Services", departmentAr: "الخدمات الأرضية", location: "Terminal 5", locationAr: "الصالة ٥", email: "salem.aldawsari@altanfeethi.com.sa", managerId: "p-abdullah" },
  { id: "p-yara", name: "Yara Al-Hamdan", nameAr: "يارا الحمدان", initials: "YH", title: "Fleet Operations Manager", titleAr: "مدير عمليات الأسطول", department: "Ground Services", departmentAr: "الخدمات الأرضية", location: "Terminal 5", locationAr: "الصالة ٥", email: "yara.alhamdan@altanfeethi.com.sa", managerId: "p-salem" },

  // ── finance ──
  { id: "p-maha", name: "Maha Al-Rashid", nameAr: "مها الرشيد", initials: "MR", title: "Chief Financial Officer", titleAr: "الرئيس المالي", department: "Finance", departmentAr: "المالية", location: "HQ · Riyadh", locationAr: "المقر · الرياض", email: "maha.alrashid@altanfeethi.com.sa", phone: "+966 11 200 1300", managerId: "p-ceo" },
  { id: "p-ibrahim", name: "Ibrahim Al-Sultan", nameAr: "إبراهيم السلطان", initials: "IS", title: "Director, Financial Planning", titleAr: "مدير التخطيط المالي", department: "Finance", departmentAr: "المالية", location: "HQ · Riyadh", locationAr: "المقر · الرياض", email: "ibrahim.alsultan@altanfeethi.com.sa", managerId: "p-maha" },
  { id: "p-rana", name: "Rana Al-Qassim", nameAr: "رنا القاسم", initials: "RQ", title: "Director, Procurement", titleAr: "مدير المشتريات", department: "Finance", departmentAr: "المالية", location: "HQ · Riyadh", locationAr: "المقر · الرياض", email: "rana.alqassim@altanfeethi.com.sa", managerId: "p-maha" },
  { id: "p-tariq", name: "Tariq Al-Anazi", nameAr: "طارق العنزي", initials: "TA", title: "Procurement Manager", titleAr: "مدير المشتريات", department: "Finance", departmentAr: "المالية", location: "HQ · Riyadh", locationAr: "المقر · الرياض", email: "tariq.alanazi@altanfeethi.com.sa", managerId: "p-rana" },

  // ── people & culture ──
  { id: "p-layla", name: "Layla Al-Amri", nameAr: "ليلى العمري", initials: "LA", title: "VP, People & Culture", titleAr: "نائب الرئيس، الموظفون والثقافة", department: "People & Culture", departmentAr: "الموظفون والثقافة", location: "HQ · Riyadh", locationAr: "المقر · الرياض", email: "layla.alamri@altanfeethi.com.sa", phone: "+966 11 200 1400", managerId: "p-ceo" },
  { id: "p-huda", name: "Huda Al-Zamil", nameAr: "هدى الزامل", initials: "HZ", title: "Director, Talent & Development", titleAr: "مدير المواهب والتطوير", department: "People & Culture", departmentAr: "الموظفون والثقافة", location: "HQ · Riyadh", locationAr: "المقر · الرياض", email: "huda.alzamil@altanfeethi.com.sa", managerId: "p-layla" },
  { id: "p-saad", name: "Saad Al-Mansour", nameAr: "سعد المنصور", initials: "SM", title: "Director, HR Operations", titleAr: "مدير عمليات الموارد البشرية", department: "People & Culture", departmentAr: "الموظفون والثقافة", location: "HQ · Riyadh", locationAr: "المقر · الرياض", email: "saad.almansour@altanfeethi.com.sa", managerId: "p-layla" },

  // ── it & security ──
  { id: "p-yousef", name: "Yousef Al-Nasser", nameAr: "يوسف الناصر", initials: "YN", title: "VP, IT & Security", titleAr: "نائب الرئيس، تقنية المعلومات والأمن", department: "IT & Security", departmentAr: "تقنية المعلومات والأمن", location: "HQ · Riyadh", locationAr: "المقر · الرياض", email: "yousef.alnasser@altanfeethi.com.sa", phone: "+966 11 200 1500", managerId: "p-ceo" },
  { id: "p-majed", name: "Majed Al-Rubaish", nameAr: "ماجد الربيش", initials: "MR", title: "Director, Infrastructure", titleAr: "مدير البنية التحتية", department: "IT & Security", departmentAr: "تقنية المعلومات والأمن", location: "HQ · Riyadh", locationAr: "المقر · الرياض", email: "majed.alrubaish@altanfeethi.com.sa", managerId: "p-yousef" },
  { id: "p-amal", name: "Amal Al-Turki", nameAr: "أمل التركي", initials: "AT", title: "Director, Digital Workplace", titleAr: "مدير مكان العمل الرقمي", department: "IT & Security", departmentAr: "تقنية المعلومات والأمن", location: "HQ · Riyadh", locationAr: "المقر · الرياض", email: "amal.alturki@altanfeethi.com.sa", managerId: "p-yousef" },
  { id: "p-waleed", name: "Waleed Al-Shammari", nameAr: "وليد الشمري", initials: "WS", title: "Information Security Manager", titleAr: "مدير أمن المعلومات", department: "IT & Security", departmentAr: "تقنية المعلومات والأمن", location: "HQ · Riyadh", locationAr: "المقر · الرياض", email: "waleed.alshammari@altanfeethi.com.sa", managerId: "p-yousef" },

  // ── legal ──
  { id: "p-hind", name: "Hind Al-Zahrani", nameAr: "هند الزهراني", initials: "HZ", title: "General Counsel", titleAr: "المستشار العام", department: "Legal & Compliance", departmentAr: "الشؤون القانونية والامتثال", location: "HQ · Riyadh", locationAr: "المقر · الرياض", email: "hind.alzahrani@altanfeethi.com.sa", phone: "+966 11 200 1600", managerId: "p-ceo" },
  { id: "p-ali", name: "Ali Al-Marzouq", nameAr: "علي المرزوق", initials: "AM", title: "Compliance Manager", titleAr: "مدير الامتثال", department: "Legal & Compliance", departmentAr: "الشؤون القانونية والامتثال", location: "HQ · Riyadh", locationAr: "المقر · الرياض", email: "ali.almarzouq@altanfeethi.com.sa", managerId: "p-hind" },
]

// ── lookups ──────────────────────────────────────────────────────────────────
const BY_ID = new Map(ORG.map((p) => [p.id, p]))
const CHILDREN = new Map<string, OrgPerson[]>()
for (const p of ORG) {
  if (!p.managerId) continue
  const list = CHILDREN.get(p.managerId) ?? []
  list.push(p)
  CHILDREN.set(p.managerId, list)
}

export const personById = (id: string) => BY_ID.get(id)
export const childrenOf = (id: string): OrgPerson[] => CHILDREN.get(id) ?? []
export const ROOT = ORG.find((p) => p.managerId === null)!

/** Root → person, used for the breadcrumb trail. */
export function chainTo(id: string): OrgPerson[] {
  const out: OrgPerson[] = []
  let cur = BY_ID.get(id)
  while (cur) {
    out.unshift(cur)
    cur = cur.managerId ? BY_ID.get(cur.managerId) : undefined
  }
  return out
}

/** Everyone below a person, at any depth. */
export function teamSize(id: string): number {
  return childrenOf(id).reduce((n, c) => n + 1 + teamSize(c.id), 0)
}

export function searchPeople(q: string, isAr: boolean): OrgPerson[] {
  const needle = q.trim().toLowerCase()
  if (!needle) return []
  return ORG.filter((p) =>
    [isAr ? p.nameAr : p.name, isAr ? p.titleAr : p.title, isAr ? p.departmentAr : p.department, p.email]
      .some((f) => f.toLowerCase().includes(needle)),
  ).slice(0, 8)
}

/** Headcount per department, for the legend and the summary strip. */
export function deptCounts(): { name: string; nameAr: string; count: number }[] {
  const m = new Map<string, { nameAr: string; count: number }>()
  for (const p of ORG) {
    const e = m.get(p.department) ?? { nameAr: p.departmentAr, count: 0 }
    e.count++
    m.set(p.department, e)
  }
  return [...m.entries()].map(([name, v]) => ({ name, nameAr: v.nameAr, count: v.count })).sort((a, b) => b.count - a.count)
}
