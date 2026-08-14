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

export const MONTH = { label: "August 2026", labelAr: "أغسطس ٢٠٢٦", year: 2026, month: 8, days: 31, firstWeekday: 6 /* Sat */ }

/** Working week is Sunday–Thursday; Friday & Saturday are the weekend. */
const WD = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const WD_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]

const HQ = { location: "HQ · L14", locationAr: "المقر · ط14" }
const REMOTE = { location: "Remote", locationAr: "عن بُعد" }

const RECORDS: Partial<Record<number, Partial<AttendanceDay>>> = {
  2: { kind: "present", checkIn: "08:28", checkOut: "17:05", hours: 8.6, ...HQ },
  3: { kind: "present", checkIn: "08:35", checkOut: "17:10", hours: 8.6, ...HQ },
  4: { kind: "remote", checkIn: "08:50", checkOut: "17:15", hours: 8.4, ...REMOTE },
  5: { kind: "present", checkIn: "08:31", checkOut: "17:02", hours: 8.5, ...HQ },
  6: { kind: "present", checkIn: "08:44", checkOut: "16:58", hours: 8.2, ...HQ },
  9: { kind: "present", checkIn: "09:12", checkOut: "17:30", hours: 8.3, late: true, ...HQ, note: "Traffic delay", noteAr: "تأخير مروري" },
  10: { kind: "remote", checkIn: "08:40", checkOut: "17:00", hours: 8.3, ...REMOTE },
  11: { kind: "leave", note: "Annual leave", noteAr: "إجازة سنوية" },
  12: { kind: "present", checkIn: "08:30", checkOut: "17:12", hours: 8.7, ...HQ },
  13: { kind: "present", checkIn: "08:26", checkOut: "17:04", hours: 8.6, location: "Terminal 1", locationAr: "الصالة ١" },
  16: { kind: "present", checkIn: "08:33", checkOut: "17:08", hours: 8.6, ...HQ },
  17: { kind: "remote", checkIn: "08:45", checkOut: "17:05", hours: 8.3, ...REMOTE },
  18: { kind: "present", checkIn: "08:29", checkOut: "17:01", hours: 8.5, ...HQ },
  19: { kind: "present", checkIn: "08:30", checkOut: "17:12", hours: 8.7, ...HQ },
  20: { kind: "present", checkIn: "08:42", checkOut: undefined, hours: 4.4, ...HQ }, // today
  26: { kind: "holiday", note: "Eid Al-Adha", noteAr: "عيد الأضحى" },
  27: { kind: "holiday", note: "Eid Al-Adha", noteAr: "عيد الأضحى" },
  30: { kind: "holiday", note: "Eid Al-Adha", noteAr: "عيد الأضحى" },
}

export const TODAY_DAY = 20

export const DAYS: AttendanceDay[] = Array.from({ length: MONTH.days }, (_, i) => {
  const day = i + 1
  // 1 Aug 2026 is a Saturday → weekday index cycles from 6
  const wd = (MONTH.firstWeekday + i) % 7
  const isWeekend = wd === 5 || wd === 6
  const rec = RECORDS[day]
  const kind: DayKind = rec?.kind ?? (isWeekend ? "weekend" : day > TODAY_DAY ? "future" : "absent")
  return {
    date: `2026-08-${String(day).padStart(2, "0")}`,
    day,
    weekday: WD[wd], weekdayAr: WD_AR[wd],
    kind,
    ...rec,
  } as AttendanceDay
})

export const today = {
  status: "present" as const,
  checkIn: "08:42",
  checkOut: null as string | null,
  targetHours: 8,
  workedMinutes: 263,
  location: "HQ · L14", locationAr: "المقر · ط14",
  dayLabel: "Thursday, 20 August 2026", dayLabelAr: "الخميس، ٢٠ أغسطس ٢٠٢٦",
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
