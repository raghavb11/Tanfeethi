/** The line manager's direct reports. Mirrors the roster in
 *  @reach/domain-employee's manager fixtures; kept local so the work package
 *  stays independent of the employee package. Demo-only — a real build reads
 *  the reporting line from Oracle HRMS. */

export type Member = {
  id: string
  name: string; nameAr: string
  initials: string
  title: string; titleAr: string
}

export const MANAGER = { name: "Khalid Al-Qahtani", nameAr: "خالد القحطاني" }

export const team: Member[] = [
  { id: "r1", name: "Sara Al-Mutairi", nameAr: "سارة المطيري", initials: "SM", title: "Senior Business Analyst", titleAr: "محللة أعمال أولى" },
  { id: "r2", name: "Mohammad Iqbal", nameAr: "محمد إقبال", initials: "MI", title: "Operations Lead", titleAr: "قائد العمليات" },
  { id: "r3", name: "Layan Al Marwani", nameAr: "ليان المرواني", initials: "LM", title: "Business Analyst", titleAr: "محللة أعمال" },
  { id: "r4", name: "Noura Saleh", nameAr: "نورة صالح", initials: "NS", title: "Service Coordinator", titleAr: "منسقة خدمات" },
  { id: "r5", name: "Faisal Al-Harbi", nameAr: "فيصل الحربي", initials: "FH", title: "Operations Officer", titleAr: "مسؤول عمليات" },
  { id: "r6", name: "Saud Al-Dosari", nameAr: "سعود الدوسري", initials: "SD", title: "Lounge Supervisor", titleAr: "مشرف الصالة" },
  { id: "r7", name: "Reem Al-Otaibi", nameAr: "ريم العتيبي", initials: "RO", title: "Data Analyst", titleAr: "محللة بيانات" },
  { id: "r8", name: "Turki Al-Shehri", nameAr: "تركي الشهري", initials: "TS", title: "Operations Officer", titleAr: "مسؤول عمليات" },
]

export const memberById = (id: string) => team.find((m) => m.id === id)
