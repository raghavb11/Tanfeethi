/** Employee directory used by the global search and the employee card
 *  (Figma 4263:19954 · 4693:14896 · 4693:14759). Demo-only. */

export type Presence = "online" | "away" | "offline"

export type Employee = {
  id: string
  name: string; nameAr: string
  initials: string; initialsAr: string
  title: string; titleAr: string
  dept: string; deptAr: string
  /** Department / directorate (الإدارة) */
  division: string; divisionAr: string
  email: string
  empNo: string
  managerId?: string
  presence: Presence
}

const COMMERCIAL = { dept: "Commercial Operations Department", deptAr: "قسم العمليات التجارية", division: "Operations Directorate", divisionAr: "إدارة العمليات" }

export const employees: Employee[] = [
  { id: "e-ceo", name: "Abdulaziz Al-Rashid", nameAr: "عبدالعزيز الراشد", initials: "AR", initialsAr: "عب", title: "Chief Executive Officer", titleAr: "الرئيس التنفيذي", dept: "Executive Office", deptAr: "المكتب التنفيذي", division: "Executive Management", divisionAr: "الإدارة التنفيذية", email: "a.alrashid@altanfeethi.com.sa", empNo: "1001", presence: "away" },
  { id: "e-coo", name: "Nada Khaled Mahmoud", nameAr: "ندى خالد محمود", initials: "NM", initialsAr: "ند", title: "Chief Operating Officer", titleAr: "الرئيس التنفيذي للعمليات", dept: "Operations Sector", deptAr: "قطاع العمليات", division: "Operations Directorate", divisionAr: "إدارة العمليات", email: "n.mahmoud@altanfeethi.com.sa", empNo: "1104", managerId: "e-ceo", presence: "online" },
  { id: "e-mka", name: "Mohammed Khaled Ali", nameAr: "محمد خالد علي", initials: "MA", initialsAr: "مخ", title: "Director of Commercial Operations", titleAr: "مدير إدارة العمليات التجارية", ...COMMERCIAL, email: "m.ali@altanfeethi.com.sa", empNo: "1388", managerId: "e-coo", presence: "online" },
  { id: "e-khaled", name: "Khaled Al-Saadi", nameAr: "خالد السعدي", initials: "KS", initialsAr: "خا", title: "Commercial Operations Manager", titleAr: "مدير العمليات التجارية", ...COMMERCIAL, email: "khaled@altanfeethi.com.sa", empNo: "1729", managerId: "e-mka", presence: "online" },
  { id: "e-rayan", name: "Rayan Mohammed", nameAr: "ريان محمد", initials: "RM", initialsAr: "ري", title: "Partnerships Specialist", titleAr: "أخصائي الشراكات", ...COMMERCIAL, email: "r.mohammed@altanfeethi.com.sa", empNo: "1802", managerId: "e-mka", presence: "offline" },
  { id: "e-raed", name: "Raed Khaled", nameAr: "رائد خالد", initials: "RK", initialsAr: "را", title: "Commercial Analyst", titleAr: "محلل تجاري", ...COMMERCIAL, email: "r.khaled@altanfeethi.com.sa", empNo: "1815", managerId: "e-mka", presence: "online" },
  { id: "e-lama", name: "Lama Al-Shamri", nameAr: "لمى الشمري", initials: "LS", initialsAr: "لم", title: "Sales Lead", titleAr: "قائدة المبيعات", ...COMMERCIAL, email: "l.alshamri@altanfeethi.com.sa", empNo: "1740", managerId: "e-mka", presence: "away" },
  { id: "e-faisal", name: "Faisal Al-Harbi", nameAr: "فيصل الحربي", initials: "FH", initialsAr: "في", title: "Contracts Manager", titleAr: "مدير العقود", ...COMMERCIAL, email: "f.alharbi@altanfeethi.com.sa", empNo: "1655", managerId: "e-mka", presence: "online" },
  { id: "e-noura", name: "Noura Al-Qahtani", nameAr: "نورة القحطاني", initials: "NQ", initialsAr: "نو", title: "Legal Counsel", titleAr: "مستشارة قانونية", dept: "Legal Affairs", deptAr: "الشؤون القانونية", division: "Corporate Services", divisionAr: "الخدمات المؤسسية", email: "n.alqahtani@altanfeethi.com.sa", empNo: "1420", managerId: "e-coo", presence: "online" },
  { id: "e-saud", name: "Saud Al-Dosari", nameAr: "سعود الدوسري", initials: "SD", initialsAr: "سع", title: "Lounge Operations Lead", titleAr: "قائد عمليات الصالات", dept: "Lounge Operations", deptAr: "عمليات الصالات", division: "Operations Directorate", divisionAr: "إدارة العمليات", email: "s.aldosari@altanfeethi.com.sa", empNo: "1510", managerId: "e-coo", presence: "away" },
]

export const getEmployee = (id?: string) => employees.find((e) => e.id === id)

/** Reporting chain from the top of the organisation down to (and including) the employee. */
export function reportingChain(id: string): Employee[] {
  const chain: Employee[] = []
  let cur = getEmployee(id)
  while (cur) {
    chain.unshift(cur)
    cur = getEmployee(cur.managerId)
  }
  return chain
}

/** Colleagues who share the employee's manager. */
export const peersOf = (id: string) => {
  const me = getEmployee(id)
  return me?.managerId ? employees.filter((e) => e.managerId === me.managerId && e.id !== id) : []
}

export function searchEmployees(q: string) {
  const s = q.trim().toLowerCase()
  if (!s) return []
  // Short queries match the start of a word (so "ر" finds ريان, رائد);
  // longer ones match anywhere in the name, title or email.
  const hit = (e: Employee) => {
    const hay = `${e.name} ${e.nameAr} ${e.title} ${e.titleAr} ${e.email}`.toLowerCase()
    return s.length < 3 ? `${e.name} ${e.nameAr}`.toLowerCase().split(/\s+/).some((w) => w.startsWith(s)) : hay.includes(s)
  }
  return employees.filter(hit)
}
