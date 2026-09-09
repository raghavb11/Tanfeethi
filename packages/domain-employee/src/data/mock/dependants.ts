import * as React from "react"

/** Dependants — the employee's registered family. They drive medical cover,
 *  annual tickets and which partner offers the family can use, so a new one is
 *  submitted with a document and verified by People & Culture rather than
 *  simply appearing. Demo fixtures; a real build writes to Oracle HRMS. */

export type RelationId = "spouse" | "son" | "daughter" | "father" | "mother"

export const RELATION: Record<RelationId, {
  en: string; ar: string
  /** What HR needs to see before the record is verified. */
  document: string; documentAr: string
  /** Family that qualifies for company medical cover by default. */
  medicalByDefault: boolean
}> = {
  spouse: { en: "Spouse", ar: "الزوج/الزوجة", document: "Marriage contract", documentAr: "عقد الزواج", medicalByDefault: true },
  son: { en: "Son", ar: "ابن", document: "Birth certificate or ID", documentAr: "شهادة الميلاد أو الهوية", medicalByDefault: true },
  daughter: { en: "Daughter", ar: "ابنة", document: "Birth certificate or ID", documentAr: "شهادة الميلاد أو الهوية", medicalByDefault: true },
  father: { en: "Father", ar: "الأب", document: "ID and dependency proof", documentAr: "الهوية وإثبات الإعالة", medicalByDefault: false },
  mother: { en: "Mother", ar: "الأم", document: "ID and dependency proof", documentAr: "الهوية وإثبات الإعالة", medicalByDefault: false },
}

/** Where the record sits with People & Culture. */
export type DependantStatus = "verified" | "pending" | "returned"

export const STATUS: Record<DependantStatus, { en: string; ar: string; chip: string }> = {
  verified: { en: "Verified", ar: "موثّق", chip: "border-emerald-500/35 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  pending: { en: "Pending verification", ar: "بانتظار التوثيق", chip: "border-amber-500/35 bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  returned: { en: "Returned", ar: "معاد", chip: "border-rose-500/35 bg-rose-500/10 text-rose-600 dark:text-rose-400" },
}

export type Dependant = {
  id: string
  name: string; nameAr: string
  relation: RelationId
  /** ISO date; the age is derived so it never goes stale. */
  dobISO: string
  /** National ID or Iqama, as it reads on the document. */
  idNumber: string
  initials: string
  medical: boolean
  tickets: boolean
  status: DependantStatus
  /** Filename of the proof attached with the request. */
  document?: string
  /** Why People & Culture sent it back. */
  note?: string; noteAr?: string
  submitted: string; submittedAr: string
}

/** Age in whole years, from the date of birth. */
export const ageOf = (d: Dependant) => {
  const dob = new Date(d.dobISO)
  const now = new Date()
  let age = now.getFullYear() - dob.getFullYear()
  const m = now.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age -= 1
  return Math.max(0, age)
}

export const initialsOf = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?"

const SEED: Dependant[] = [
  { id: "d1", name: "Amal Al-Saadi", nameAr: "أمل السعدي", relation: "spouse", dobISO: "1988-04-12",
    idNumber: "2••••••417", initials: "AS", medical: true, tickets: true, status: "verified",
    submitted: "12 Mar 2024", submittedAr: "١٢ مارس ٢٠٢٤" },
  { id: "d2", name: "Rakan Al-Saadi", nameAr: "راكان السعدي", relation: "son", dobISO: "2015-01-20",
    idNumber: "1••••••882", initials: "RS", medical: true, tickets: true, status: "verified",
    submitted: "12 Mar 2024", submittedAr: "١٢ مارس ٢٠٢٤" },
  { id: "d3", name: "Jood Al-Saadi", nameAr: "جود السعدي", relation: "daughter", dobISO: "2019-06-03",
    idNumber: "1••••••905", initials: "JS", medical: true, tickets: true, status: "verified",
    submitted: "09 Aug 2024", submittedAr: "٩ أغسطس ٢٠٢٤" },
  { id: "d4", name: "Mohammed Al-Saadi", nameAr: "محمد السعدي", relation: "father", dobISO: "1958-11-02",
    idNumber: "1••••••204", initials: "MS", medical: false, tickets: false, status: "pending",
    document: "father-id-and-dependency.pdf",
    submitted: "2 days ago", submittedAr: "قبل يومين" },
]

let dependants: Dependant[] = SEED
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l) }

export const useDependants = () => React.useSyncExternalStore(subscribe, () => dependants)
export const allDependants = () => dependants
export const getDependant = (id: string) => dependants.find((d) => d.id === id)
/** Only verified family can be put on a benefit or a partner voucher. */
export const verifiedDependants = () => dependants.filter((d) => d.status === "verified")

export const newDependantId = () => `d-${Date.now().toString(36)}`

export function addDependant(d: Dependant) {
  dependants = [...dependants, d]
  emit()
}
export function updateDependant(id: string, patch: Partial<Dependant>) {
  dependants = dependants.map((d) => (d.id === id ? { ...d, ...patch } : d))
  emit()
}
export function removeDependant(id: string) {
  dependants = dependants.filter((d) => d.id !== id)
  emit()
}
