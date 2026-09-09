import * as React from "react"

import { holidayTypeChip, holidayTypeLabel } from "./master-data"

/** The holiday master — the calendar of non-working days, defined per year.
 *  Two reasons it is per-year rather than a fixed list: the Hijri holidays
 *  (both Eids) move about eleven days earlier each Gregorian year, and the
 *  observed bridge days are announced annually. Leave, attendance and the
 *  working-day count all read from here.
 *  Demo fixtures; a real build stores these against the HR calendar. */

/** The id of a row in the holiday-type master, not a fixed union — the list
 *  is configurable under Configuration → Master data. */
export type HolidayType = string

export type Holiday = {
  id: string
  year: number
  name: string; nameAr: string
  type: HolidayType
  /** Inclusive range. A single-day holiday has the same start and end. */
  startISO: string
  endISO: string
  /** Set when the date is fixed in the Gregorian year and can be rolled forward. */
  fixedDate?: boolean
  notes?: string; notesAr?: string
}


const SEED: Holiday[] = [
  // ── 2026 ──
  { id: "h26-1", year: 2026, name: "Founding Day", nameAr: "يوم التأسيس", type: "public", startISO: "2026-02-22", endISO: "2026-02-22", fixedDate: true },
  { id: "h26-2", year: 2026, name: "Eid al-Fitr", nameAr: "عيد الفطر", type: "religious", startISO: "2026-03-19", endISO: "2026-03-24",
    notes: "Dates follow the moon sighting and are confirmed closer to the day.", notesAr: "التواريخ تتبع رؤية الهلال وتُؤكَّد قبل الموعد." },
  { id: "h26-3", year: 2026, name: "Eid al-Adha", nameAr: "عيد الأضحى", type: "religious", startISO: "2026-05-26", endISO: "2026-05-30",
    notes: "Includes Arafat day.", notesAr: "يشمل يوم عرفة." },
  { id: "h26-4", year: 2026, name: "Saudi National Day", nameAr: "اليوم الوطني السعودي", type: "public", startISO: "2026-09-23", endISO: "2026-09-23", fixedDate: true },
  { id: "h26-5", year: 2026, name: "Company day — Tanfeethi anniversary", nameAr: "يوم المؤسسة — ذكرى التنفيذي", type: "company", startISO: "2026-11-05", endISO: "2026-11-05", fixedDate: true,
    notes: "Half day for terminal operations; full day for head office.", notesAr: "نصف يوم لعمليات المباني ويوم كامل للمقر." },

  // ── 2027, opened early so leave can be planned across the year end ──
  { id: "h27-1", year: 2027, name: "Founding Day", nameAr: "يوم التأسيس", type: "public", startISO: "2027-02-22", endISO: "2027-02-22", fixedDate: true },
  { id: "h27-2", year: 2027, name: "Eid al-Fitr", nameAr: "عيد الفطر", type: "religious", startISO: "2027-03-09", endISO: "2027-03-14",
    notes: "Provisional — to be confirmed by the moon sighting.", notesAr: "مبدئي — يُؤكَّد برؤية الهلال." },
  { id: "h27-3", year: 2027, name: "Saudi National Day", nameAr: "اليوم الوطني السعودي", type: "public", startISO: "2027-09-23", endISO: "2027-09-23", fixedDate: true },
]

let holidays: Holiday[] = SEED
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l) }

export function useHolidays(): Holiday[] {
  return React.useSyncExternalStore(subscribe, () => holidays)
}

export const getHolidayById = (id: string) => holidays.find((h) => h.id === id)
export const holidayYears = () =>
  [...new Set(holidays.map((h) => h.year))].sort((a, b) => a - b)

/** Days off in a range, both ends counted. */
export const dayCount = (startISO: string, endISO: string) => {
  if (!startISO || !endISO) return 0
  const ms = new Date(endISO).getTime() - new Date(startISO).getTime()
  return Math.max(1, Math.round(ms / 86400000) + 1)
}
export const daysInYear = (year: number) =>
  holidays.filter((h) => h.year === year).reduce((n, h) => n + dayCount(h.startISO, h.endISO), 0)

export const newHolidayId = () => `h-${Date.now().toString(36)}`

export function addHoliday(h: Holiday) {
  holidays = [...holidays, h]
  emit()
}
export function updateHoliday(id: string, patch: Partial<Holiday>) {
  holidays = holidays.map((h) => (h.id === id ? { ...h, ...patch } : h))
  emit()
}
export function removeHoliday(id: string) {
  holidays = holidays.filter((h) => h.id !== id)
  emit()
}

/** Open a new year by rolling the fixed-date holidays forward. The moving
 *  ones are left out on purpose — they need the year's own announcement. */
export function copyYear(from: number, to: number): number {
  const source = holidays.filter((h) => h.year === from && h.fixedDate)
  if (source.length === 0) return 0
  const shift = (iso: string) => `${to}${iso.slice(4)}`
  holidays = [
    ...holidays,
    ...source.map((h, i) => ({
      ...h,
      id: `h-${to}-${Date.now().toString(36)}-${i}`,
      year: to,
      startISO: shift(h.startISO),
      endISO: shift(h.endISO),
    })),
  ]
  emit()
  return source.length
}

/** Label + swatch for a holiday's type, read from the master. */
export const holidayType = (id: HolidayType, isAr: boolean) => ({
  label: holidayTypeLabel(id, isAr),
  chip: holidayTypeChip(id),
})
