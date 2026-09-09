import * as React from "react"

import { today } from "./center"

/** The working day as the portal knows it. Clocking in and out is the one
 *  action on these screens that writes to the attendance record, so the
 *  Employee Center and the Attendance page read this single state.
 *  Demo store; a real build posts to the time system. */

export type ClockState = {
  /** Null until the person clocks in — the day has not started. */
  checkIn: string | null
  checkOut: string | null
  location: string
  locationAr: string
  targetHours: number
}

/** When the working day is expected to start, and the grace before "late". */
export const SHIFT_START = "08:00"
const GRACE_MINUTES = 15

let state: ClockState = {
  // the day opens unstarted; nothing is on the record until someone clocks in
  checkIn: null,
  checkOut: null,
  location: today.location,
  locationAr: today.locationAr,
  targetHours: today.targetHours,
}

const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l) }

export const useClock = () => React.useSyncExternalStore(subscribe, () => state)
export const getClock = () => state

/** Wall-clock time, as the record stores it. */
export const nowTime = () =>
  new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number)
  return (h || 0) * 60 + (m || 0)
}

/** Where the day is: not started, open, or closed. */
export type DayStatus = "not-started" | "working" | "done"
export const dayStatus = (s: ClockState = state): DayStatus =>
  !s.checkIn ? "not-started" : s.checkOut ? "done" : "working"

/** Worked time is derived, so it keeps counting while the day is open. */
export const workedMinutes = (s: ClockState = state) => {
  if (!s.checkIn) return 0
  const end = s.checkOut ? toMinutes(s.checkOut) : toMinutes(nowTime())
  return Math.max(0, end - toMinutes(s.checkIn))
}

/** Minutes past the shift start, once the grace period is used up. */
export const lateBy = (at: string = nowTime()) => {
  const late = toMinutes(at) - toMinutes(SHIFT_START) - GRACE_MINUTES
  return late > 0 ? late + GRACE_MINUTES : 0
}

/** Arabic-Indic digits, as the rest of the portal writes numbers in Arabic. */
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩"
export const arNum = (v: number | string) =>
  String(v).replace(/[0-9]/g, (d) => AR_DIGITS[Number(d)])

const pad = (n: number) => String(n).padStart(2, "0")

/** Compact duration for a tile or a chip — "8h 05m" / "٨ س ٠٥ د". */
export const hm = (min: number, isAr = false) => {
  const h = Math.floor(min / 60), m = min % 60
  return isAr ? `${arNum(h)} س ${arNum(pad(m))} د` : `${h}h ${pad(m)}m`
}

/** Arabic counts its nouns by number, so the word changes with it. */
export const hoursWord = (n: number, isAr = false) => {
  if (!isAr) return `${n}h`
  if (n === 1) return "ساعة"
  if (n === 2) return "ساعتان"
  if (n >= 3 && n <= 10) return `${arNum(n)} ساعات`
  return `${arNum(n)} ساعة`
}
const minutesWord = (n: number) => {
  if (n === 1) return "دقيقة"
  if (n === 2) return "دقيقتان"
  if (n >= 3 && n <= 10) return `${arNum(n)} دقائق`
  return `${arNum(n)} دقيقة`
}

/** Spelled out, for a sentence rather than a tile. */
export const hmLong = (min: number, isAr = false) => {
  const h = Math.floor(min / 60), m = min % 60
  if (!isAr) {
    const parts = [h > 0 ? `${h} ${h === 1 ? "hour" : "hours"}` : "", m > 0 ? `${m} ${m === 1 ? "minute" : "minutes"}` : ""]
    return parts.filter(Boolean).join(" ") || "0 minutes"
  }
  const parts = [h > 0 ? hoursWord(h, true) : "", m > 0 ? minutesWord(m) : ""]
  return parts.filter(Boolean).join(" و") || "صفر دقيقة"
}

/** What the day still owes, in minutes. Zero once the target is met. */
export const remainingMinutes = (s: ClockState = state) =>
  Math.max(0, s.targetHours * 60 - workedMinutes(s))

export function clockIn() {
  state = { ...state, checkIn: nowTime(), checkOut: null }
  emit()
}
export function clockOut() {
  state = { ...state, checkOut: nowTime() }
  emit()
}
/** Start a second session after clocking out — a late return to the office. */
export function clockInAgain() {
  state = { ...state, checkIn: nowTime(), checkOut: null }
  emit()
}
