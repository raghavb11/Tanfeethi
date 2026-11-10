/** Attendance records for the Attendance page — a month of daily entries plus
 *  today's live state. Demo-only fixtures. */

export type DayKind = "present" | "remote" | "leave" | "holiday" | "weekend" | "absent" | "future"

export type AttendanceDay = {
  /** ISO date — the month grid and log are both built from these. */
  date: string
  day: number
  weekday: string; weekdayAr: string
  kind: DayKind
  checkIn?: string
  checkOut?: string
  hours?: number
  late?: boolean
  location?: string; locationAr?: string
  note?: string; noteAr?: string
}

export const MONTH = { label: "April 2026", labelAr: "أبريل 2026", year: 2026, month: 4, days: 30, firstWeekday: 3 /* Wed */ }

/** Working week is Sunday–Thursday; Friday & Saturday are the weekend. */
const WD = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const WD_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]

const HQ = { location: "Riyadh HQ", locationAr: "مقر الرياض" }
const REMOTE = { location: "Remote", locationAr: "عن بُعد" }

/** April 2026 — 1 Apr is a Wednesday; weekends are 3–4, 10–11, 17–18, 24–25. */
const RECORDS: Partial<Record<number, Partial<AttendanceDay>>> = {
  1: { kind: "holiday", note: "Eid Al-Fitr holiday", noteAr: "إجازة عيد الفطر" },
  2: { kind: "present", checkIn: "08:05", checkOut: "16:10", hours: 8.1, ...HQ },
  5: { kind: "present", checkIn: "07:58", checkOut: "16:02", hours: 8.1, ...HQ },
  6: { kind: "remote", checkIn: "08:10", checkOut: "16:20", hours: 8.2, ...REMOTE },
  7: { kind: "leave", note: "Sick leave", noteAr: "إجازة مرضية" },
  8: { kind: "present", checkIn: "08:02", checkOut: "16:05", hours: 8.1, ...HQ },
  9: { kind: "present", checkIn: "08:31", checkOut: "16:40", hours: 8.2, late: true, ...HQ, note: "Traffic delay", noteAr: "تأخير مروري" },
  12: { kind: "present", checkIn: "07:55", checkOut: "16:00", hours: 8.1, ...HQ },
  13: { kind: "remote", checkIn: "08:00", checkOut: "16:15", hours: 8.3, ...REMOTE },
  14: { kind: "present", checkIn: "08:04", checkOut: "16:06", hours: 8, ...HQ },
  15: { kind: "present", checkIn: "08:01", checkOut: "16:12", hours: 8.2, location: "Terminal 1", locationAr: "الصالة 1" },
  16: { kind: "absent", note: "No check-in recorded — correction requested", noteAr: "لا يوجد تسجيل حضور — طُلب التصحيح" },
  19: { kind: "present", checkIn: "08:03", checkOut: "16:05", hours: 8, ...HQ },
  20: { kind: "remote", checkIn: "08:12", checkOut: "16:20", hours: 8.1, ...REMOTE },
  21: { kind: "present", checkIn: "07:59", checkOut: "16:01", hours: 8, ...HQ },
  22: { kind: "present", checkIn: "08:26", checkOut: "16:30", hours: 8.1, late: true, ...HQ, note: "Late arrival", noteAr: "تأخر في الحضور" },
  23: { kind: "present", checkIn: "08:00", checkOut: "16:05", hours: 8.1, ...HQ },
  26: { kind: "present", checkIn: "08:00", checkOut: "16:00", hours: 8, ...HQ },
  27: { kind: "present", checkIn: "08:10", checkOut: "15:40", hours: 7.5, ...HQ },
  28: { kind: "present", checkIn: "08:00", checkOut: undefined, ...HQ }, // today — hours come from the clock
}

export const TODAY_DAY = 28

export const DAYS: AttendanceDay[] = Array.from({ length: MONTH.days }, (_, i) => {
  const day = i + 1
  // 1 Apr 2026 is a Wednesday → weekday index cycles from 3
  const wd = (MONTH.firstWeekday + i) % 7
  const isWeekend = wd === 5 || wd === 6
  const rec = RECORDS[day]
  const kind: DayKind = rec?.kind ?? (isWeekend ? "weekend" : day > TODAY_DAY ? "future" : "absent")
  return {
    date: `2026-04-${String(day).padStart(2, "0")}`,
    day,
    weekday: WD[wd], weekdayAr: WD_AR[wd],
    kind,
    ...rec,
  } as AttendanceDay
})

export const today = {
  status: "present" as const,
  checkIn: "08:00",
  checkOut: null as string | null,
  targetHours: 8,
  workedMinutes: 244,
  location: "Riyadh HQ", locationAr: "مقر الرياض",
  dayLabel: "Tuesday, 28 April 2026", dayLabelAr: "الثلاثاء، 28 أبريل 2026",
}

/** Rolled-up stats for the month to date. */
export function monthStats(days: AttendanceDay[] = DAYS) {
  const worked = days.filter((d) => d.kind === "present" || d.kind === "remote")
  const hours = worked.reduce((s, d) => s + (d.hours ?? 0), 0)
  const expected = days.filter((d) => !["weekend", "holiday", "future"].includes(d.kind)).length * 8
  return {
    present: days.filter((d) => d.kind === "present").length,
    remote: days.filter((d) => d.kind === "remote").length,
    leave: days.filter((d) => d.kind === "leave").length,
    holiday: days.filter((d) => d.kind === "holiday").length,
    absent: days.filter((d) => d.kind === "absent").length,
    late: days.filter((d) => d.late).length,
    hours: Math.round(hours * 10) / 10,
    expected,
    avg: worked.length ? Math.round((hours / worked.length) * 10) / 10 : 0,
    onTimePct: worked.length ? Math.round(((worked.length - days.filter((d) => d.late).length) / worked.length) * 100) : 100,
  }
}
