import * as React from "react"

/** The personal calendar (Figma 2493:3720 week · 2521:6688 day · 2580:3222 month).
 *  Demo store; a real build reads Outlook / Graph calendars. */

export type CalendarId = "mine" | "ops" | "lounges" | "learning" | "recruiting" | "leave"

export const CALENDARS: { id: CalendarId; en: string; ar: string; color: string }[] = [
  { id: "mine",       en: "My calendar",            ar: "تقويمي",             color: "#bc9951" },
  { id: "ops",        en: "Operations team",        ar: "فريق العمليات",       color: "#a997c7" },
  { id: "lounges",    en: "Lounges & hospitality",  ar: "الصالات والضيافة",    color: "#2e9b62" },
  { id: "learning",   en: "Learning & workshops",   ar: "التعلم والورش",       color: "#ce7a5b" },
  // the design leaves these two rows as "*تقويم*" placeholders
  { id: "recruiting", en: "Recruiting & interviews", ar: "التوظيف والمقابلات", color: "#d14f45" },
  { id: "leave",      en: "Team leave",             ar: "إجازات الفريق",       color: "#d14f45" },
]
export const calendarById = (id: CalendarId) => CALENDARS.find((c) => c.id === id)!

export type CalendarEvent = {
  id: string
  calendar: CalendarId
  title: string; titleAr: string
  dateISO: string
  /** "HH:MM", 24h. Absent on an all-day entry. */
  start?: string
  end?: string
  allDay?: boolean
  location?: string; locationAr?: string
  online?: boolean
  notes?: string
}

/** The prototype's "now" for the calendar — Thursday 10 September 2026, 14:15, as drawn. */
export const CAL_TODAY_ISO = "2026-09-10"
export const CAL_NOW_MIN = 14 * 60 + 15

const OPS_COMMITTEE = { title: "Operations committee", titleAr: "لجنة العمليات", start: "09:00", end: "10:00" }
const BRIEFING = { title: "Morning briefing", titleAr: "إحاطة الصباح", start: "08:30", end: "09:00" }

const SEED: CalendarEvent[] = [
  // week of 6 September — the frame as drawn
  { id: "ev1", calendar: "mine", ...BRIEFING, dateISO: "2026-09-06" },
  { id: "ev2", calendar: "ops", title: "Lounge operations review", titleAr: "مراجعة عمليات الصالة", dateISO: "2026-09-06", start: "11:00", end: "12:00" },
  { id: "ev3", calendar: "learning", title: "AI workshop", titleAr: "ورشة الذكاء الاصطناعي", dateISO: "2026-09-07", start: "10:00", end: "11:30", online: true, location: "Online call", locationAr: "عبر الاتصال" },
  { id: "ev4", calendar: "mine", title: "1:1 · Noura", titleAr: "لقاء فردي · نورة", dateISO: "2026-09-07", start: "14:00", end: "14:30" },
  { id: "ev5", calendar: "leave", title: "Saud's leave", titleAr: "إجازة سعود", dateISO: "2026-09-08", allDay: true },
  { id: "ev6", calendar: "mine", ...OPS_COMMITTEE, dateISO: "2026-09-08" },
  { id: "ev7", calendar: "lounges", title: "Hospitality team training", titleAr: "تدريب فريق الضيافة", dateISO: "2026-09-08", start: "13:00", end: "15:00", location: "Training hall", locationAr: "قاعة التدريب" },
  { id: "ev8", calendar: "ops", title: "Budget review", titleAr: "مراجعة الميزانية", dateISO: "2026-09-09", start: "11:00", end: "12:30" },
  { id: "ev9", calendar: "mine", title: "Jeddah site visit", titleAr: "زيارة موقع جدة", dateISO: "2026-09-09", start: "15:00", end: "17:00", location: "Jeddah lounge", locationAr: "صالة جدة" },
  { id: "ev10", calendar: "mine", ...BRIEFING, dateISO: "2026-09-10" },
  { id: "ev11", calendar: "recruiting", title: "Candidate interview", titleAr: "مقابلة مرشح", dateISO: "2026-09-10", start: "10:30", end: "11:15" },
  { id: "ev12", calendar: "ops", title: "Partnership meeting", titleAr: "اجتماع الشراكة", dateISO: "2026-09-10", start: "13:00", end: "14:00", online: true, location: "Online call", locationAr: "عبر الاتصال" },
  { id: "ev13", calendar: "lounges", title: "Executive attendance · Unit 4", titleAr: "حضور تنفيذي · الوحدة 4", dateISO: "2026-09-10", start: "16:00", end: "17:00" },

  // the rest of the month, so week and month navigation have something to show
  { id: "ev20", calendar: "mine", ...BRIEFING, dateISO: "2026-09-01" },
  { id: "ev21", calendar: "ops", title: "Q3 roster sign-off", titleAr: "اعتماد جدول الربع الثالث", dateISO: "2026-09-02", start: "12:00", end: "13:00" },
  { id: "ev22", calendar: "mine", ...BRIEFING, dateISO: "2026-09-13" },
  { id: "ev23", calendar: "mine", title: "1:1 · Noura", titleAr: "لقاء فردي · نورة", dateISO: "2026-09-14", start: "14:00", end: "14:30" },
  { id: "ev24", calendar: "learning", title: "Leadership masterclass", titleAr: "ورشة القيادة", dateISO: "2026-09-15", start: "10:00", end: "12:00", location: "Training hall", locationAr: "قاعة التدريب" },
  { id: "ev25", calendar: "ops", title: "Budget follow-up", titleAr: "متابعة الميزانية", dateISO: "2026-09-16", start: "11:00", end: "11:45" },
  { id: "ev26", calendar: "recruiting", ...OPS_COMMITTEE, dateISO: "2026-09-17" },
  { id: "ev27", calendar: "mine", ...BRIEFING, dateISO: "2026-09-17" },
  { id: "ev28", calendar: "lounges", title: "Lounge readiness walk", titleAr: "جولة جاهزية الصالة", dateISO: "2026-09-17", start: "12:00", end: "13:00" },
  { id: "ev29", calendar: "ops", title: "Vendor SLA review", titleAr: "مراجعة اتفاقية الموردين", dateISO: "2026-09-17", start: "15:00", end: "16:00", online: true, location: "Online call", locationAr: "عبر الاتصال" },
  { id: "ev30", calendar: "learning", ...OPS_COMMITTEE, dateISO: "2026-09-21" },
  { id: "ev31", calendar: "leave", title: "National Day", titleAr: "اليوم الوطني", dateISO: "2026-09-23", allDay: true },
  { id: "ev32", calendar: "mine", title: "Board briefing", titleAr: "إحاطة مجلس الإدارة", dateISO: "2026-09-28", start: "10:00", end: "11:00" },
  { id: "ev33", calendar: "lounges", ...OPS_COMMITTEE, dateISO: "2026-10-03" },
]

let events: CalendarEvent[] = SEED
let hidden = new Set<CalendarId>()
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l) }

export const useCalendarEvents = () => React.useSyncExternalStore(subscribe, () => events)
export const useHiddenCalendars = () => React.useSyncExternalStore(subscribe, () => hidden)
export const getCalendarEvent = (id: string) => events.find((e) => e.id === id)

export function toggleCalendar(id: CalendarId) {
  const next = new Set(hidden)
  if (next.has(id)) next.delete(id); else next.add(id)
  hidden = next
  emit()
}
export const newEventId = () => `ev-${Date.now().toString(36)}`
export function addCalendarEvent(e: CalendarEvent) { events = [...events, e]; emit() }
export function updateCalendarEvent(id: string, patch: Partial<CalendarEvent>) {
  events = events.map((e) => (e.id === id ? { ...e, ...patch } : e)); emit()
}
export function removeCalendarEvent(id: string) { events = events.filter((e) => e.id !== id); emit() }

// ── date helpers (local dates, no time-zone round trips) ──────────────────────
export const toDate = (iso: string) => new Date(`${iso}T00:00:00`)
export const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
export const addDays = (iso: string, n: number) => { const d = toDate(iso); d.setDate(d.getDate() + n); return toISO(d) }
export const addMonths = (iso: string, n: number) => { const d = toDate(iso); d.setDate(1); d.setMonth(d.getMonth() + n); return toISO(d) }
/** Sunday of the week the date falls in (the Saudi week starts on Sunday). */
export const weekStart = (iso: string) => addDays(iso, -toDate(iso).getDay())
export const minutes = (hhmm: string) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m }
export const durationMin = (e: CalendarEvent) => (e.allDay || !e.start || !e.end ? 0 : Math.max(0, minutes(e.end) - minutes(e.start)))
