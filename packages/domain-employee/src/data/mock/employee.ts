export const profile = {
  name: "Khalid Al-Saadi",
  nameAr: "خالد السعدي",
  title: "Director, Business Operations",
  titleAr: "مدير العمليات التجارية",
  location: "Riyadh · Hybrid",
  locationAr: "الرياض · هجين",
  email: "khalid@altanfeethi.com.sa",
  manager: "Ahmed Mohammed",
  managerAr: "أحمد محمد",
  reports: "12 direct / 84 extended",
  reportsAr: "12 مباشر / 84 ممتد",
}

export type AttendanceStatus = "complete" | "current" | "upcoming" | "leave" | "weekend"

export const attendance = {
  today: {
    dayName: "Tuesday",
    dayNameAr: "الثلاثاء",
    dateLabel: "April 28",
    dateLabelAr: "28 أبريل",
    clockIn: "08:42",
    sessionMinutes: 263,
    targetHours: 8,
    state: "working" as "working" | "break" | "done" | "off",
  },
  weekRange: "Apr 27 – May 3",
  weekRangeAr: "27 أبريل – 3 مايو",
  status: "On track",
  statusAr: "ضمن المسار",
  streak: "11-day on-site streak",
  streakAr: "حضور منتظم 11 يومًا",
  weeklyTotalHours: 12.5,
  weeklyTargetHours: 40,
  week: [
    { day: "Mon", dayAr: "الإثنين", short: "M", shortAr: "ن", hours: 8.2, status: "complete" as AttendanceStatus, clockIn: "08:30", clockOut: "17:00" },
    { day: "Tue", dayAr: "الثلاثاء", short: "T", shortAr: "ث", hours: 4.3, status: "current" as AttendanceStatus, clockIn: "08:42", clockOut: null },
    { day: "Wed", dayAr: "الأربعاء", short: "W", shortAr: "ر", hours: null, status: "upcoming" as AttendanceStatus, clockIn: null, clockOut: null },
    { day: "Thu", dayAr: "الخميس", short: "T", shortAr: "خ", hours: null, status: "leave" as AttendanceStatus, clockIn: null, clockOut: null },
    { day: "Fri", dayAr: "الجمعة", short: "F", shortAr: "ج", hours: null, status: "upcoming" as AttendanceStatus, clockIn: null, clockOut: null },
  ],
}

export const leave = {
  balanceDays: 18,
  usedDays: 4,
  totalDays: 22,
  pending: [
    {
      id: "lv1",
      range: "May 12–16",
      rangeAr: "12 – 16 مايو",
      type: "PTO",
      typeAr: "إجازة سنوية",
      status: "Pending",
      statusAr: "قيد المراجعة",
      days: 5,
    },
  ],
  breakdown: [
    { id: "pto", label: "Annual", labelAr: "سنوية", used: 4, total: 22, color: "primary" as const },
    { id: "sick", label: "Sick", labelAr: "مرضية", used: 1, total: 14, color: "amber" as const },
    { id: "personal", label: "Personal", labelAr: "شخصية", used: 0, total: 5, color: "emerald" as const },
  ],
}
