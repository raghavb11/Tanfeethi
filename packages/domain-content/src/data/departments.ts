export type Department = { id: string; name: string; nameAr: string; headcount: number }

export const DEPARTMENTS: Department[] = [
  { id: "dep-people", name: "People & Culture", nameAr: "الموظفون والثقافة", headcount: 120 },
  { id: "dep-finance", name: "Finance", nameAr: "المالية", headcount: 65 },
  { id: "dep-ops", name: "Operations", nameAr: "العمليات", headcount: 340 },
  { id: "dep-it", name: "IT & Security", nameAr: "تقنية المعلومات والأمن", headcount: 90 },
  { id: "dep-legal", name: "Legal & Compliance", nameAr: "الشؤون القانونية والامتثال", headcount: 28 },
  { id: "dep-commercial", name: "Commercial", nameAr: "التجاري", headcount: 110 },
  { id: "dep-ground", name: "Ground Services", nameAr: "الخدمات الأرضية", headcount: 262 },
  { id: "dep-exec", name: "Executive Office", nameAr: "المكتب التنفيذي", headcount: 25 },
]

export const TOTAL_HEADCOUNT = DEPARTMENTS.reduce((s, d) => s + d.headcount, 0)

/** People affected by a targeting choice: all employees, or the sum of the
 *  selected departments' headcounts. */
export function affectedCount(deptIds: string[], all: boolean): number {
  if (all) return TOTAL_HEADCOUNT
  return DEPARTMENTS.filter((d) => deptIds.includes(d.id)).reduce((s, d) => s + d.headcount, 0)
}

export function deptById(id: string): Department | undefined {
  return DEPARTMENTS.find((d) => d.id === id)
}
