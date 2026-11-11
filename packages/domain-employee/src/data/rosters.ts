import * as React from "react"
import { useShell } from "@reach/shell-context"
import { pushNotification } from "@reach/shared-mocks"
import { getShiftType, shiftHours, shiftSpan, type ShiftTypeRow } from "@reach/domain-content/master-data"

import { childrenOf, ME_ID, ORG, type OrgPerson, personById } from "./mock/org"
import { ROTATIONS } from "./mock/hub"

/** Shift rosters. A roster covers one team for a period (typically about two
 *  months). Within the period every person keeps ONE shift and their own weekly
 *  days off — shifts do not change day to day. At the end of the period the
 *  roster rolls over: the next period opens with each person's next shift
 *  suggested from the roster's rotation order, and the manager confirms it
 *  person by person before publishing. A shift only ever changes over the
 *  person's weekly day off: until their first day off in the new period they
 *  keep last period's shift. Only an admin can override that for a person.
 *  Auto-assign fills the shifts so every minimum cover is met.
 *  Shift types are master data (Administration › Master data › Shift types);
 *  people come from the employee master (ORG). Deleting is a soft delete.
 *  Demo store — a real build keeps this server-side with the same rules. */

/** The employee module's "today": Tuesday 28 April 2026 (see data/mock/hub.ts). */
export const ROSTER_TODAY_ISO = "2026-04-28"
/** Minimum rest between two shifts, in hours — checked where one period hands over to the next. */
export const MIN_REST_HOURS = 11
/** Longest roster period, in days. */
export const MAX_ROSTER_DAYS = 186

// ── dates ────────────────────────────────────────────────────────────────────
const local = (iso: string) => new Date(`${iso}T00:00:00`)
export const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
export const addDays = (iso: string, n: number) => { const d = local(iso); d.setDate(d.getDate() + n); return toISO(d) }
/** The Sunday a week starts on (the working week runs Sunday–Thursday). */
export const weekStart = (iso: string) => addDays(iso, -local(iso).getDay())
export const monthStart = (iso: string) => `${iso.slice(0, 7)}-01`
export const monthEnd = (iso: string) => { const d = local(monthStart(iso)); d.setMonth(d.getMonth() + 1); d.setDate(0); return toISO(d) }
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/
export function daysBetween(fromISO: string, toISO_: string): string[] {
  const out: string[] = []
  // a half-typed or invalid date must never start an endless walk
  if (!ISO_DAY.test(fromISO) || !ISO_DAY.test(toISO_)) return out
  for (let d = fromISO; d <= toISO_; d = addDays(d, 1)) out.push(d)
  return out
}
export const dayCount = (startISO: string, endISO: string) =>
  startISO && endISO && endISO >= startISO ? Math.round((local(endISO).getTime() - local(startISO).getTime()) / 86_400_000) + 1 : 0
/** 0 = Sunday … 6 = Saturday. */
export const weekdayOf = (iso: string) => local(iso).getDay()
export const isWeekend = (iso: string) => { const g = weekdayOf(iso); return g === 5 || g === 6 }
const LOCALE = (isAr: boolean) => (isAr ? "ar-EG-u-nu-latn" : "en-GB")
export const weekdayLong = (iso: string, isAr: boolean) => local(iso).toLocaleDateString(LOCALE(isAr), { weekday: "long" })
export const dayMonth = (iso: string, isAr: boolean) => local(iso).toLocaleDateString(LOCALE(isAr), { day: "numeric", month: "short" })
export const fullDate = (iso: string, isAr: boolean) => local(iso).toLocaleDateString(LOCALE(isAr), { day: "numeric", month: "long", year: "numeric" })
/** Sunday-first weekday names, for the days-off pickers. */
export const WEEKDAYS = [
  { en: "Sun", ar: "الأحد" }, { en: "Mon", ar: "الاثنين" }, { en: "Tue", ar: "الثلاثاء" }, { en: "Wed", ar: "الأربعاء" },
  { en: "Thu", ar: "الخميس" }, { en: "Fri", ar: "الجمعة" }, { en: "Sat", ar: "السبت" },
]
export const daysOffText = (days: number[], isAr: boolean) =>
  days.length ? [...days].sort().map((d) => (isAr ? WEEKDAYS[d].ar : WEEKDAYS[d].en)).join(isAr ? "، " : ", ") : isAr ? "بدون" : "None"
export function periodLabel(r: { startISO: string; endISO: string }, isAr: boolean) {
  // the year only when the range crosses one
  if (r.startISO.slice(0, 4) !== r.endISO.slice(0, 4)) return `${fullDate(r.startISO, isAr)} – ${fullDate(r.endISO, isAr)}`
  return `${dayMonth(r.startISO, isAr)} – ${dayMonth(r.endISO, isAr)}`
}

// ── the record ───────────────────────────────────────────────────────────────
export type RosterStatus = "draft" | "published"
/** One person's place on the roster for the whole period. */
export type Assignment = {
  /** A working shift type — the same every working day of the period. Empty = not assigned yet. */
  shiftId: string
  /** Weekly days off, 0 = Sunday … 6 = Saturday. */
  daysOff: number[]
  /** Waiting for the manager to confirm: the shift they had last period (a rollover
   *  suggestion), or "auto" when Auto-assign picked it. Cleared on confirm. */
  suggestedFrom?: string
  /** The shift they had last period. A different shift only starts after their
   *  first weekly day off in this period; until then they keep this one. */
  previousShiftId?: string
  /** Admin override: the new shift starts on day 1, without waiting for a day off. */
  changeNow?: boolean
}
export type Roster = {
  id: string
  /** RST-001 — fixed once created. */
  code: string
  /** What the team calls it, e.g. "Terminal 5 lounge". */
  name: string; nameAr: string
  department: string; departmentAr: string
  /** First and last day the roster covers, both included. */
  startISO: string; endISO: string
  /** Employee-master ids, in the order they are listed. */
  memberIds: string[]
  assignments: Record<string, Assignment>
  /** The order shifts move in at rollover — Morning → Evening → Night → Morning. */
  rotation: string[]
  /** Fewest people needed on each working shift type, per day. */
  minCover: Record<string, number>
  /** Minimum cover counts on Friday and Saturday too (a lounge), or only Sunday–Thursday (an office). */
  coverWeekends: boolean
  status: RosterStatus
  /** Published, then edited — the people on it still see the published version. */
  changedSincePublish?: boolean
  publishedISO?: string
  /** The roster this one rolled over from. */
  previousId?: string
  createdISO: string
  createdBy: string; createdByAr: string
  /** Soft delete: kept for the log, hidden from lists. */
  deleted?: boolean
  deletedISO?: string
}
export const rosterName = (r: Roster, isAr: boolean) => (isAr ? r.nameAr || r.name : r.name || r.nameAr) || (isAr ? r.departmentAr : r.department)
export const rosterDays = (r: Pick<Roster, "startISO" | "endISO">) => daysBetween(r.startISO, r.endISO)
export const DEFAULT_DAYS_OFF = [5, 6]
export const assignmentOf = (r: Roster, personId: string): Assignment =>
  r.assignments[personId] ?? { shiftId: "", daysOff: DEFAULT_DAYS_OFF }

/** The shift after this one in the rotation; a shift outside the rotation stays as it is. */
export function nextInRotation(rotation: string[], shiftId: string) {
  const i = rotation.indexOf(shiftId)
  return i < 0 || rotation.length === 0 ? shiftId : rotation[(i + 1) % rotation.length]
}

// ── approved absences (the Figma leave / remote cover list) ─────────────────
type Absence = { personId: string; fromISO: string; toISO: string; kind: "leave" | "remote" }
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const parseDay = (s: string) => {
  const [d, m] = s.trim().split(/\s+/)
  const mi = MONTHS.findIndex((x) => x.toLowerCase().startsWith((m ?? "").toLowerCase().slice(0, 3)))
  return mi < 0 ? "" : `2026-${String(mi + 1).padStart(2, "0")}-${String(Number(d)).padStart(2, "0")}`
}
const ABSENCES: Absence[] = ROTATIONS.flatMap((r) => {
  const p = ORG.find((x) => x.name === r.name)
  const fromISO = parseDay(r.from), toISO_ = parseDay(r.to)
  return p && fromISO && toISO_ ? [{ personId: p.id, fromISO, toISO: toISO_, kind: r.kind }] : []
})
export const absenceOn = (personId: string, iso: string) =>
  ABSENCES.find((a) => a.personId === personId && a.fromISO <= iso && iso <= a.toISO)
/** Approved leave that overlaps the period. */
export const leaveIn = (personId: string, startISO: string, endISO: string) =>
  ABSENCES.filter((a) => a.kind === "leave" && a.personId === personId && a.fromISO <= endISO && startISO <= a.toISO)

/** When a person's new shift starts: the period's first day if the shift is unchanged,
 *  they start the period on a day off, or an admin overrode it; otherwise the day
 *  after their first weekly day off in the period (the change happens over it). */
export function shiftChangeDate(r: Roster, personId: string): string {
  const a = assignmentOf(r, personId)
  if (!a.previousShiftId || a.previousShiftId === a.shiftId || a.changeNow) return r.startISO
  for (const iso of rosterDays(r)) {
    // starting the period on a day off: nothing is worked on the old shift
    if (a.daysOff.includes(weekdayOf(iso))) return iso === r.startISO ? r.startISO : addDays(iso, 1)
  }
  return addDays(r.endISO, 1) // no day off in the period: the change waits for the next one
}
/** For the row note: the last day worked on the old shift and the first on the new one. */
export function shiftChangeWindow(r: Roster, personId: string): { lastOld?: string; firstNew?: string } {
  const a = assignmentOf(r, personId)
  const from = shiftChangeDate(r, personId)
  const working = rosterDays(r).filter((iso) => !a.daysOff.includes(weekdayOf(iso)))
  return { lastOld: [...working].reverse().find((iso) => iso < from), firstNew: working.find((iso) => iso >= from) }
}
/** The shift a person works on a day — last period's until the change over their day off. */
export function shiftIdOn(r: Roster, personId: string, iso: string) {
  const a = assignmentOf(r, personId)
  if (a.previousShiftId && iso < shiftChangeDate(r, personId)) return a.previousShiftId
  return a.shiftId
}
/** Is this person working on this day of this roster (assigned, not a day off, not on leave)? */
export function worksOn(r: Roster, personId: string, iso: string) {
  const a = assignmentOf(r, personId)
  if (!a.shiftId || a.daysOff.includes(weekdayOf(iso))) return false
  return absenceOn(personId, iso)?.kind !== "leave"
}

// ── seed ─────────────────────────────────────────────────────────────────────
const OMAR = { createdBy: "Omar Al-Juhani", createdByAr: "عمر الجهني" }
const FAWAZ = { createdBy: "Fawaz Al-Ghailan", createdByAr: "فواز الغيلان" }
const ROT = ["morning", "evening", "night"]
const as = (shiftId: string, daysOff: number[], suggestedFrom?: string): Assignment => ({ shiftId, daysOff, suggestedFrom })

function seed(): Roster[] {
  // Terminal 5 lounge runs every day: days off are staggered so each shift keeps cover
  const loungeNow: Record<string, Assignment> = {
    "p-badr": as("morning", [5, 6]), "p-haya": as("morning", [0, 1]), "p-mazen": as("morning", [2, 3]),
    "p-reemk": as("evening", [5, 6]), "p-sultan": as("evening", [1, 2]), "p-jood": as("evening", [3, 4]),
    "p-fahd": as("night", [4, 5]), "p-ruba": as("night", [0, 1]),
  }
  // the rollover: next shifts suggested from the rotation, two already confirmed
  const loungeNext: Record<string, Assignment> = Object.fromEntries(Object.entries(loungeNow).map(([pid, a]) =>
    [pid, { ...as(nextInRotation(ROT, a.shiftId), a.daysOff, a.shiftId), previousShiftId: a.shiftId }]))
  loungeNext["p-badr"] = { ...as("evening", [5, 6]), previousShiftId: "morning" }
  loungeNext["p-haya"] = { ...as("evening", [0, 1]), previousShiftId: "morning" }
  const lounge = Object.keys(loungeNow)
  const digitalTeam = ["p-fawaz", "p-lina", "p-saady", "p-tala", "p-omarh", "p-dalia"]
  const digital: Record<string, Assignment> = Object.fromEntries(digitalTeam.map((pid) => [pid, as("office", [5, 6])]))
  // the service-desk evening cover sits with one person for the period
  digital["p-tala"] = as("evening", [5, 6])
  return [
    { id: "ros-1", code: "RST-001", name: "Terminal 5 lounge", nameAr: "صالة المبنى ٥", department: "Commercial", departmentAr: "التجاري",
      startISO: "2026-03-01", endISO: "2026-04-30", memberIds: lounge, assignments: loungeNow, rotation: ROT,
      minCover: { morning: 2, evening: 2, night: 1 }, coverWeekends: true,
      status: "published", publishedISO: "2026-02-22", createdISO: "2026-02-18", ...OMAR },
    { id: "ros-2", code: "RST-002", name: "Terminal 5 lounge", nameAr: "صالة المبنى ٥", department: "Commercial", departmentAr: "التجاري",
      startISO: "2026-05-01", endISO: "2026-06-30", memberIds: lounge, assignments: loungeNext, rotation: ROT,
      minCover: { morning: 2, evening: 2, night: 1 }, coverWeekends: true, previousId: "ros-1",
      status: "draft", createdISO: "2026-04-26", ...OMAR },
    { id: "ros-3", code: "RST-003", name: "Digital Experience", nameAr: "التجربة الرقمية", department: "Information Technology", departmentAr: "تقنية المعلومات",
      startISO: "2026-04-01", endISO: "2026-05-31", memberIds: digitalTeam, assignments: digital, rotation: [], // an office team: shifts stay the same at rollover
      minCover: { office: 4, evening: 1 }, coverWeekends: false,
      status: "published", publishedISO: "2026-03-25", createdISO: "2026-03-22", ...FAWAZ },
  ]
}

// ── store ────────────────────────────────────────────────────────────────────
export type RosterLog = { id: string; rosterId: string; atISO: string; time: string; actor: string; actorAr: string; text: string; textAr: string }

let rosters: Roster[] = seed()
let log: RosterLog[] = [
  { id: "rl-1", rosterId: "ros-1", atISO: "2026-02-18", time: "09:12", actor: OMAR.createdBy, actorAr: OMAR.createdByAr, text: "Created the roster for 1 Mar – 30 Apr", textAr: "أنشأ الجدول للفترة 1 مارس – 30 أبريل" },
  { id: "rl-2", rosterId: "ros-1", atISO: "2026-02-22", time: "16:40", actor: OMAR.createdBy, actorAr: OMAR.createdByAr, text: "Published to 8 people", textAr: "نشر الجدول إلى 8 موظفين" },
  { id: "rl-3", rosterId: "ros-1", atISO: "2026-04-26", time: "10:05", actor: OMAR.createdBy, actorAr: OMAR.createdByAr, text: "Rolled over to RST-002 (1 May – 30 Jun)", textAr: "رُحّل إلى RST-002 (1 مايو – 30 يونيو)" },
  { id: "rl-4", rosterId: "ros-2", atISO: "2026-04-26", time: "10:05", actor: OMAR.createdBy, actorAr: OMAR.createdByAr, text: "Rolled over from RST-001 — next shifts suggested from Morning → Evening → Night", textAr: "رُحّل من RST-001 — اقتُرحت المناوبات التالية حسب صباحية ← مسائية ← ليلية" },
  { id: "rl-5", rosterId: "ros-2", atISO: "2026-04-26", time: "10:20", actor: OMAR.createdBy, actorAr: OMAR.createdByAr, text: "Confirmed Badr Al-Harbi → Evening", textAr: "أكّد بدر الحربي ← مسائية" },
  { id: "rl-6", rosterId: "ros-2", atISO: "2026-04-26", time: "10:21", actor: OMAR.createdBy, actorAr: OMAR.createdByAr, text: "Confirmed Haya Al-Subaie → Evening", textAr: "أكّد هيا السبيعي ← مسائية" },
  { id: "rl-7", rosterId: "ros-3", atISO: "2026-03-22", time: "10:00", actor: FAWAZ.createdBy, actorAr: FAWAZ.createdByAr, text: "Created the roster for 1 Apr – 31 May", textAr: "أنشأ الجدول للفترة 1 أبريل – 31 مايو" },
  { id: "rl-8", rosterId: "ros-3", atISO: "2026-03-25", time: "14:15", actor: FAWAZ.createdBy, actorAr: FAWAZ.createdByAr, text: "Published to 6 people", textAr: "نشر الجدول إلى 6 موظفين" },
]
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l) }

export const useRosters = () => React.useSyncExternalStore(subscribe, () => rosters)
export function useRosterLog(rosterId: string) {
  const all = React.useSyncExternalStore(subscribe, () => log)
  return React.useMemo(() => all.filter((e) => e.rosterId === rosterId), [all, rosterId])
}
export const getRoster = (id: string) => rosters.find((r) => r.id === id)
export const liveRosters = (list: Roster[]) => list.filter((r) => !r.deleted)

const ME = () => personById(ME_ID)
const nowTime = () => new Date().toTimeString().slice(0, 5)
function note(rosterId: string, text: string, textAr: string) {
  const me = ME()
  log = [...log, { id: `rl-${Date.now().toString(36)}-${log.length}`, rosterId, atISO: ROSTER_TODAY_ISO, time: nowTime(),
    actor: me?.name ?? "You", actorAr: me?.nameAr ?? "أنت", text, textAr }]
}
export const shiftName = (id: string | undefined, isAr: boolean) => {
  if (!id) return isAr ? "بدون مناوبة" : "No shift"
  const s = getShiftType(id)
  return s ? (isAr ? s.nameAr : s.name) : id
}
const personName = (pid: string, isAr: boolean) => { const p = personById(pid); return p ? (isAr ? p.nameAr : p.name) : pid }
export const rotationText = (ids: string[], isAr: boolean) => ids.map((id) => shiftName(id, isAr)).join(isAr ? " ← " : " → ")

export const nextRosterCode = () => `RST-${String(rosters.length + 1).padStart(3, "0")}`
export function addRoster(r: Omit<Roster, "id" | "code" | "createdISO" | "createdBy" | "createdByAr" | "status">, how: { en: string; ar: string }): string {
  const me = ME()
  const id = `ros-${Date.now().toString(36)}`
  rosters = [...rosters, { ...r, id, code: nextRosterCode(), status: "draft", createdISO: ROSTER_TODAY_ISO,
    createdBy: me?.name ?? "You", createdByAr: me?.nameAr ?? "أنت" }]
  note(id, how.en, how.ar)
  emit()
  return id
}
function patch(id: string, p: Partial<Roster>) {
  rosters = rosters.map((r) => (r.id === id ? { ...r, ...p, ...(r.status === "published" && !("status" in p) ? { changedSincePublish: true } : {}) } : r))
}
function setAssignment(rosterId: string, personId: string, next: Assignment) {
  const r = getRoster(rosterId)
  if (!r) return
  patch(rosterId, { assignments: { ...r.assignments, [personId]: next } })
}
/** Give a person their shift for the period. Picking a shift also settles a rollover suggestion. */
export function setShift(rosterId: string, personId: string, shiftId: string) {
  const r = getRoster(rosterId)
  if (!r) return
  const a = assignmentOf(r, personId)
  if (a.shiftId === shiftId && !a.suggestedFrom) return
  setAssignment(rosterId, personId, { ...a, shiftId, suggestedFrom: undefined })
  note(rosterId, `${personName(personId, false)} → ${shiftName(shiftId, false)} for the period`, `${personName(personId, true)} ← ${shiftName(shiftId, true)} طوال الفترة`)
  emit()
}
export function toggleDayOff(rosterId: string, personId: string, day: number) {
  const r = getRoster(rosterId)
  if (!r) return
  const a = assignmentOf(r, personId)
  const daysOff = a.daysOff.includes(day) ? a.daysOff.filter((d) => d !== day) : [...a.daysOff, day].sort()
  setAssignment(rosterId, personId, { ...a, daysOff })
  note(rosterId, `${personName(personId, false)}: weekly days off ${daysOffText(daysOff, false)}`, `${personName(personId, true)}: أيام الراحة الأسبوعية ${daysOffText(daysOff, true)}`)
  emit()
}
/** Admin only: start this person's new shift on day 1 instead of after their day off. */
export function setChangeNow(rosterId: string, personId: string, on: boolean) {
  const r = getRoster(rosterId)
  if (!r) return
  const a = assignmentOf(r, personId)
  setAssignment(rosterId, personId, { ...a, changeNow: on || undefined })
  note(rosterId,
    on ? `Admin override: ${personName(personId, false)} changes shift on ${dayMonth(r.startISO, false)}, without waiting for a day off`
       : `Override removed: ${personName(personId, false)} changes shift over their day off`,
    on ? `تجاوز إداري: ${personName(personId, true)} تتغير مناوبته في ${dayMonth(r.startISO, true)} دون انتظار يوم راحة`
       : `أُلغي التجاوز: ${personName(personId, true)} تتغير مناوبته في يوم راحته`)
  emit()
}

/** Auto-assign: give everyone without a confirmed shift a shift so the minimum cover
 *  is met on every counted weekday. The hardest gap is filled first (the shift and
 *  weekday the fewest open people could cover), then single moves and swaps are
 *  tried while they shrink the total shortfall; leftover people spread evenly, and
 *  their next rotation shift wins a tie. Picks wait for the manager to confirm. */
export function autoAssign(rosterId: string): number {
  const r = getRoster(rosterId)
  if (!r) return 0
  const days = countedWeekdays(r.coverWeekends)
  const fixed = r.memberIds.filter((pid) => { const a = assignmentOf(r, pid); return a.shiftId && !a.suggestedFrom })
  const open = r.memberIds.filter((pid) => !fixed.includes(pid))
  const withMin = Object.entries(r.minCover).filter(([, n]) => n > 0).map(([id]) => id)
  const pool = [...new Set([...withMin, ...r.rotation])].filter((id) => { const s = getShiftType(id); return s && !s.isOff && s.active })
  if (!open.length || !pool.length) return 0
  const works = (pid: string) => days.filter((d) => !assignmentOf(r, pid).daysOff.includes(d))
  const min = (id: string) => r.minCover[id] ?? 0
  const preferred = (pid: string) => { const prev = assignmentOf(r, pid).previousShiftId; return prev ? nextInRotation(r.rotation, prev) : undefined }

  const pick: Record<string, string> = {}
  const cover = () => {
    const c: Record<string, number[]> = Object.fromEntries(pool.map((id) => [id, [0, 0, 0, 0, 0, 0, 0]]))
    for (const pid of fixed) { const id = assignmentOf(r, pid).shiftId; if (c[id]) for (const d of works(pid)) c[id][d]++ }
    for (const [pid, id] of Object.entries(pick)) for (const d of works(pid)) c[id][d]++
    return c
  }
  const shortfall = () => { const c = cover(); return pool.reduce((n, id) => n + days.reduce((m, d) => m + Math.max(0, min(id) - c[id][d]), 0), 0) }
  const liked = () => Object.entries(pick).filter(([pid, id]) => preferred(pid) === id).length

  // 1 · the hardest gap first
  let left = [...open]
  for (;;) {
    const c = cover()
    const gaps = pool.flatMap((id) => days.filter((d) => c[id][d] < min(id)).map((d) => ({ id, d, who: left.filter((pid) => works(pid).includes(d)) })))
      .filter((g) => g.who.length > 0)
      .sort((a, b) => a.who.length - b.who.length || (min(b.id) - c[b.id][b.d]) - (min(a.id) - c[a.id][a.d]))
    if (!gaps.length) break
    const g = gaps[0]
    const gain = (pid: string) => works(pid).reduce((n, d) => n + (c[g.id][d] < min(g.id) ? 1 : 0), 0)
    const who = [...g.who].sort((a, b) => gain(b) - gain(a) || (preferred(b) === g.id ? 1 : 0) - (preferred(a) === g.id ? 1 : 0))[0]
    pick[who] = g.id
    left = left.filter((pid) => pid !== who)
  }
  // 2 · everyone else spreads over the pool, by load against the minimum
  for (const pid of left) {
    const c = cover()
    const load = (id: string) => days.reduce((n, d) => n + c[id][d], 0) / Math.max(1, min(id))
    pick[pid] = [...pool].sort((a, b) => (preferred(pid) === b ? 1 : 0) - (preferred(pid) === a ? 1 : 0) || load(a) - load(b))[0]
  }
  // 3 · moves and swaps while they shrink the shortfall (or keep it and honour the rotation)
  for (let round = 0; round < 40; round++) {
    let best = { gap: shortfall(), liked: liked() }
    let improved = false
    for (const x of open) {
      for (const id of pool) {
        if (pick[x] === id) continue
        const was = pick[x]; pick[x] = id
        const now = { gap: shortfall(), liked: liked() }
        if (now.gap < best.gap || (now.gap === best.gap && now.liked > best.liked)) { best = now; improved = true } else pick[x] = was
      }
      for (const y of open) {
        if (x >= y || pick[x] === pick[y]) continue
        ;[pick[x], pick[y]] = [pick[y], pick[x]]
        const now = { gap: shortfall(), liked: liked() }
        if (now.gap < best.gap || (now.gap === best.gap && now.liked > best.liked)) { best = now; improved = true } else [pick[x], pick[y]] = [pick[y], pick[x]]
      }
    }
    if (!improved) break
  }

  const assignments = { ...r.assignments }
  for (const pid of open) {
    const a = assignmentOf(r, pid)
    assignments[pid] = { ...a, shiftId: pick[pid], suggestedFrom: a.previousShiftId ?? "auto" }
  }
  patch(rosterId, { assignments })
  const gap = shortfall()
  note(rosterId,
    `Auto-assigned shifts to ${open.length} ${open.length === 1 ? "person" : "people"}${gap ? ` — ${gap} shift-days still short of the minimum` : " — every minimum met"}; waiting for confirmation`,
    `وُزّعت المناوبات تلقائيًا على ${open.length} موظفين${gap ? ` — ما زال ${gap} يوم مناوبة دون الحد الأدنى` : " — تحققت كل الحدود الدنيا"}؛ بانتظار التأكيد`)
  emit()
  return open.length
}

export function confirmSuggestion(rosterId: string, personId: string) {
  const r = getRoster(rosterId)
  if (!r) return
  const a = assignmentOf(r, personId)
  if (!a.suggestedFrom) return
  setAssignment(rosterId, personId, { ...a, suggestedFrom: undefined })
  note(rosterId, `Confirmed ${personName(personId, false)} → ${shiftName(a.shiftId, false)}`, `أكّد ${personName(personId, true)} ← ${shiftName(a.shiftId, true)}`)
  emit()
}
export function confirmAllSuggestions(rosterId: string) {
  const r = getRoster(rosterId)
  if (!r) return
  const pending = r.memberIds.filter((pid) => assignmentOf(r, pid).suggestedFrom)
  if (!pending.length) return
  patch(rosterId, { assignments: Object.fromEntries(Object.entries(r.assignments).map(([pid, a]) => [pid, { ...a, suggestedFrom: undefined }])) })
  note(rosterId, `Confirmed all ${pending.length} suggested shifts`, `أكّد كل المناوبات المقترحة (${pending.length})`)
  emit()
}
export function setRotation(rosterId: string, rotation: string[]) {
  patch(rosterId, { rotation })
  note(rosterId, `Rotation order set to ${rotationText(rotation, false)}`, `ترتيب التناوب أصبح ${rotationText(rotation, true)}`)
  emit()
}
export function setMinCover(rosterId: string, shiftId: string, n: number) {
  const r = getRoster(rosterId)
  if (!r) return
  const minCover = { ...r.minCover }
  if (n > 0) minCover[shiftId] = n; else delete minCover[shiftId]
  patch(rosterId, { minCover })
  note(rosterId, `Minimum cover for ${shiftName(shiftId, false)} set to ${n}`, `الحد الأدنى لـ ${shiftName(shiftId, true)} أصبح ${n}`)
  emit()
}
export function setCoverWeekends(rosterId: string, on: boolean) {
  patch(rosterId, { coverWeekends: on })
  note(rosterId, on ? "Minimum cover now counts every day" : "Minimum cover now counts Sunday–Thursday only",
    on ? "الحد الأدنى للتغطية يُحتسب كل يوم" : "الحد الأدنى للتغطية يُحتسب من الأحد إلى الخميس فقط")
  emit()
}
/** Does the minimum count on this day? */
export const coverCounts = (r: Pick<Roster, "coverWeekends">, iso: string) => r.coverWeekends || !isWeekend(iso)

/** What is wrong with a date range for a department's roster, if anything. */
export function datesProblem(list: Roster[], department: string, startISO: string, endISO: string, ignoreId?: string): { en: string; ar: string } | undefined {
  if (!startISO) return { en: "Choose the start date", ar: "اختر تاريخ البداية" }
  if (!endISO) return { en: "Choose the end date", ar: "اختر تاريخ النهاية" }
  if (endISO < startISO) return { en: "The end date is before the start date", ar: "تاريخ النهاية قبل تاريخ البداية" }
  if (dayCount(startISO, endISO) > MAX_ROSTER_DAYS) return { en: `A roster period can run up to ${MAX_ROSTER_DAYS} days`, ar: `لا تتجاوز فترة الجدول ${MAX_ROSTER_DAYS} يومًا` }
  const clash = liveRosters(list).find((r) => r.id !== ignoreId && r.department === department && r.startISO <= endISO && startISO <= r.endISO)
  if (clash) return { en: `${clash.code} already covers ${periodLabel(clash, false)} for this department`, ar: `الجدول ${clash.code} يغطي ${periodLabel(clash, true)} لهذه الإدارة` }
  return undefined
}
export function setRosterDates(rosterId: string, startISO: string, endISO: string) {
  const r = getRoster(rosterId)
  if (!r || (r.startISO === startISO && r.endISO === endISO)) return
  const before = { en: periodLabel(r, false), ar: periodLabel(r, true) }
  patch(rosterId, { startISO, endISO })
  const after = { en: periodLabel({ startISO, endISO }, false), ar: periodLabel({ startISO, endISO }, true) }
  note(rosterId, `Dates changed from ${before.en} to ${after.en}`, `تغيّرت التواريخ من ${before.ar} إلى ${after.ar}`)
  emit()
}

/** The next period starts the day after this one ends. A period of whole months
 *  (1 May – 30 Jun) rolls over by the same number of months (1 Jul – 31 Aug);
 *  any other period keeps its length in days. */
export function rolloverDates(r: Pick<Roster, "startISO" | "endISO">) {
  const startISO = addDays(r.endISO, 1)
  if (r.startISO === monthStart(r.startISO) && r.endISO === monthEnd(r.endISO)) {
    const months = (Number(r.endISO.slice(0, 4)) - Number(r.startISO.slice(0, 4))) * 12 + Number(r.endISO.slice(5, 7)) - Number(r.startISO.slice(5, 7)) + 1
    let endISO = startISO
    for (let i = 0; i < months; i++) endISO = monthEnd(i === 0 ? startISO : addDays(endISO, 1))
    return { startISO, endISO }
  }
  return { startISO, endISO: addDays(startISO, dayCount(r.startISO, r.endISO) - 1) }
}
/** Same team, days off and cover; each person's next shift suggested from the
 *  rotation, waiting for the manager to confirm. Returns the new roster's id. */
export function rolloverRoster(rosterId: string): string | undefined {
  const r = getRoster(rosterId)
  if (!r) return undefined
  const { startISO, endISO } = rolloverDates(r)
  if (datesProblem(rosters, r.department, startISO, endISO)) return undefined
  const assignments = Object.fromEntries(r.memberIds.map((pid) => {
    const a = assignmentOf(r, pid)
    return [pid, { shiftId: a.shiftId ? nextInRotation(r.rotation, a.shiftId) : "", daysOff: a.daysOff,
      suggestedFrom: a.shiftId || undefined, previousShiftId: a.shiftId || undefined }]
  }))
  const id = addRoster({
    name: r.name, nameAr: r.nameAr, department: r.department, departmentAr: r.departmentAr,
    startISO, endISO, memberIds: r.memberIds, assignments, rotation: r.rotation,
    minCover: r.minCover, coverWeekends: r.coverWeekends, previousId: r.id,
  }, { en: `Rolled over from ${r.code} — next shifts suggested from ${rotationText(r.rotation, false)}`,
       ar: `رُحّل من ${r.code} — اقتُرحت المناوبات التالية حسب ${rotationText(r.rotation, true)}` })
  const created = getRoster(id)!
  note(r.id, `Rolled over to ${created.code} (${periodLabel(created, false)})`, `رُحّل إلى ${created.code} (${periodLabel(created, true)})`)
  emit()
  return id
}

/** What still stops a roster from being published. */
export function publishBlockers(r: Roster) {
  const toConfirm = r.memberIds.filter((pid) => assignmentOf(r, pid).suggestedFrom).length
  const noShift = r.memberIds.filter((pid) => !assignmentOf(r, pid).shiftId).length
  return { toConfirm, noShift, blocked: toConfirm > 0 || noShift > 0 }
}
export function publishRoster(rosterId: string) {
  const r = getRoster(rosterId)
  if (!r || publishBlockers(r).blocked) return
  const again = r.status === "published"
  rosters = rosters.map((x) => (x.id === rosterId ? { ...x, status: "published", changedSincePublish: false, publishedISO: ROSTER_TODAY_ISO } : x))
  note(rosterId,
    again ? `Published changes to ${r.memberIds.length} people` : `Published to ${r.memberIds.length} people`,
    again ? `نشر التعديلات إلى ${r.memberIds.length} موظفين` : `نشر الجدول إلى ${r.memberIds.length} موظفين`)
  // the "تحديث المناوبة" notification drawn in Figma
  pushNotification({
    title: again ? "Shift roster updated" : "Shift roster published", titleAr: again ? "تحديث المناوبة" : "نُشر جدول المناوبات",
    body: `${rosterName(r, false)} · ${periodLabel(r, false)}`, bodyAr: `${rosterName(r, true)} · ${periodLabel(r, true)}`,
    category: "shift", source: "hr", to: "/employee/shifts",
  })
  emit()
}
/** Back to draft: the people on it no longer see it. */
export function unpublishRoster(rosterId: string) {
  rosters = rosters.map((x) => (x.id === rosterId ? { ...x, status: "draft", changedSincePublish: false } : x))
  note(rosterId, "Withdrawn to draft", "أُعيد إلى مسودة")
  emit()
}
export function deleteRoster(rosterId: string) {
  rosters = rosters.map((x) => (x.id === rosterId ? { ...x, deleted: true, deletedISO: ROSTER_TODAY_ISO } : x))
  note(rosterId, "Deleted", "حُذف")
  emit()
}
export function restoreRoster(rosterId: string) {
  rosters = rosters.map((x) => (x.id === rosterId ? { ...x, deleted: false, deletedISO: undefined } : x))
  note(rosterId, "Restored", "استُعيد")
  emit()
}

// ── checks ───────────────────────────────────────────────────────────────────
export type IssueKind = "handover" | "rest-day" | "leave"
export type RosterIssue = { kind: IssueKind; personId: string; text: string; textAr: string }
/** The roster this one follows directly, if any — where the handover rest is checked. */
export const previousRoster = (r: Roster) =>
  liveRosters(rosters).find((x) => x.id !== r.id && x.department === r.department && x.endISO === addDays(r.startISO, -1))

export function rosterIssues(r: Roster): RosterIssue[] {
  const out: RosterIssue[] = []
  const prev = previousRoster(r)
  for (const pid of r.memberIds) {
    const a = assignmentOf(r, pid)
    if (!a.shiftId) continue
    // rest where the last period hands over to this one — only an admin override can
    // put a changed shift straight onto day 1; otherwise it waits for a day off
    if (prev && prev.memberIds.includes(pid) && (a.changeNow || !a.previousShiftId || a.previousShiftId === a.shiftId)) {
      const before = assignmentOf(prev, pid)
      const lastWorks = !!before.shiftId && !before.daysOff.includes(weekdayOf(prev.endISO))
      const firstWorks = !a.daysOff.includes(weekdayOf(r.startISO))
      const s1 = getShiftType(before.shiftId), s2 = getShiftType(a.shiftId)
      const x = s1 ? shiftSpan(s1) : undefined, y = s2 ? shiftSpan(s2) : undefined
      if (lastWorks && firstWorks && x && y) {
        const restMin = 24 * 60 + y.start - (x.start + x.length)
        if (restMin < MIN_REST_HOURS * 60) {
          const h = Math.max(0, Math.round(restMin / 60))
          out.push({ kind: "handover", personId: pid,
            text: `Only ${h}h rest between ${shiftName(before.shiftId, false)} on ${dayMonth(prev.endISO, false)} (${prev.code}) and ${shiftName(a.shiftId, false)} on ${dayMonth(r.startISO, false)} — give them the first day off or a later shift`,
            textAr: `${h} ساعات راحة فقط بين ${shiftName(before.shiftId, true)} في ${dayMonth(prev.endISO, true)} (${prev.code}) و${shiftName(a.shiftId, true)} في ${dayMonth(r.startISO, true)} — امنحه اليوم الأول راحة أو مناوبة أبعد` })
        }
      }
    }
    if (a.daysOff.length === 0) {
      out.push({ kind: "rest-day", personId: pid, text: "No weekly day off", textAr: "بدون يوم راحة أسبوعي" })
    }
    for (const lv of leaveIn(pid, r.startISO, r.endISO)) {
      out.push({ kind: "leave", personId: pid,
        text: `On approved leave ${dayMonth(lv.fromISO, false)} – ${dayMonth(lv.toISO, false)} — not counted in cover those days`,
        textAr: `في إجازة معتمدة ${dayMonth(lv.fromISO, true)} – ${dayMonth(lv.toISO, true)} — لا يُحتسب في التغطية خلالها` })
    }
  }
  return out
}
/** People on each working shift on one day (days off and leave taken out). */
export function coverOn(r: Roster, iso: string): Record<string, number> {
  const day: Record<string, number> = {}
  for (const pid of r.memberIds) {
    if (!worksOn(r, pid, iso)) continue
    const id = shiftIdOn(r, pid, iso)
    day[id] = (day[id] ?? 0) + 1
  }
  return day
}
/** Days a shift falls below its minimum, grouped by shift and shortfall. */
export function coverageGaps(r: Roster): { shiftId: string; have: number; need: number; dates: string[] }[] {
  const groups = new Map<string, { shiftId: string; have: number; need: number; dates: string[] }>()
  for (const iso of rosterDays(r)) {
    if (!coverCounts(r, iso)) continue
    const cov = coverOn(r, iso)
    for (const [shiftId, need] of Object.entries(r.minCover)) {
      const have = cov[shiftId] ?? 0
      if (have >= need) continue
      const k = `${shiftId}|${have}|${need}`
      const g = groups.get(k) ?? { shiftId, have, need, dates: [] }
      g.dates.push(iso)
      groups.set(k, g)
    }
  }
  return [...groups.values()]
}
export const gapDays = (r: Roster) => new Set(coverageGaps(r).flatMap((g) => g.dates)).size
/** A typical week: people on each shift for each weekday (before leave). */
export function weeklyCover(r: Roster): Record<string, number[]> {
  const out: Record<string, number[]> = {}
  for (const pid of r.memberIds) {
    const a = assignmentOf(r, pid)
    if (!a.shiftId) continue
    const row = out[a.shiftId] ?? [0, 0, 0, 0, 0, 0, 0]
    for (let d = 0; d < 7; d++) if (!a.daysOff.includes(d)) row[d]++
    out[a.shiftId] = row
  }
  return out
}
// ── staffing check: are there enough people for the minimum cover? ──────────
/** The weekdays a minimum counts on (Sunday–Thursday only for an office). */
export const countedWeekdays = (coverWeekends: boolean) => (coverWeekends ? [0, 1, 2, 3, 4, 5, 6] : [0, 1, 2, 3, 4])
/** People one shift needs to hold `min` on every counted day, when each works `perPerson` of those days. */
export const headcountFor = (min: number, counted: number, perPerson: number) =>
  min > 0 ? Math.ceil((min * counted) / Math.max(1, perPerson)) : 0
/** People a set of minimums needs, before anyone is placed — the New roster page's check. */
export function peopleNeeded(minCover: Record<string, number>, coverWeekends: boolean, daysOff: number[]) {
  const days = countedWeekdays(coverWeekends)
  const perPerson = days.filter((d) => !daysOff.includes(d)).length
  return Object.values(minCover).reduce((n, min) => n + headcountFor(min, days.length, perPerson), 0)
}

export type StaffingAdvice = {
  kind: "add-people" | "move-person" | "move-day-off" | "leave" | "change-over"
  text: string; textAr: string
  /** One click applies it. */
  apply?: { kind: "shift"; personId: string; shiftId: string } | { kind: "day-off"; personId: string; from: number; to: number }
}
export type StaffingShift = { shiftId: string; min: number; headcount: number; needed: number; shortWeekdays: number[] }
export type Staffing = { verdict: "enough" | "rearrange" | "not-enough"; needed: number; have: number; shifts: StaffingShift[]; advice: StaffingAdvice[] }

const wd = (d: number, isAr: boolean) => (isAr ? WEEKDAYS[d].ar : WEEKDAYS[d].en)
const wdList = (ds: number[], isAr: boolean) => ds.map((d) => wd(d, isAr)).join(isAr ? "، " : ", ")

/** Reads the minimum cover against who is on the roster and says whether the
 *  team is enough — and if not, what would fix it: more people, a person moved
 *  to the short shift, a day off moved off the short weekday, or cover for leave. */
export function staffingCheck(r: Roster): Staffing {
  const days = countedWeekdays(r.coverWeekends)
  const weekly = weeklyCover(r)
  const mins = Object.entries(r.minCover).filter(([, n]) => n > 0)
  const assigned = r.memberIds.filter((pid) => assignmentOf(r, pid).shiftId)
  // how many counted days one person works, on average across the team
  const perPersonAvg = assigned.length
    ? assigned.reduce((n, pid) => n + days.filter((d) => !assignmentOf(r, pid).daysOff.includes(d)).length, 0) / assigned.length
    : days.filter((d) => !DEFAULT_DAYS_OFF.includes(d)).length
  const shifts: StaffingShift[] = mins.map(([shiftId, min]) => {
    const row = weekly[shiftId] ?? [0, 0, 0, 0, 0, 0, 0]
    return {
      shiftId, min,
      headcount: assigned.filter((pid) => assignmentOf(r, pid).shiftId === shiftId).length,
      needed: headcountFor(min, days.length, Math.round(perPersonAvg)),
      shortWeekdays: days.filter((d) => row[d] < min),
    }
  })
  const needed = shifts.reduce((n, s) => n + s.needed, 0)
  const have = r.memberIds.length
  const advice: StaffingAdvice[] = []

  if (have < needed) {
    const more = needed - have
    advice.push({ kind: "add-people",
      text: `These minimums need at least ${needed} people (each working about ${Math.round(perPersonAvg)} of the counted days a week); the roster has ${have}. Add ${more} more ${more === 1 ? "person" : "people"}, or lower a minimum.`,
      textAr: `تحتاج هذه الحدود الدنيا إلى ${needed} موظفين على الأقل (يعمل كل منهم نحو ${Math.round(perPersonAvg)} أيام من الأيام المحتسبة أسبوعيًا)؛ والجدول فيه ${have}. أضف ${more}، أو خفّض أحد الحدود الدنيا.` })
  }
  // a short shift takes a person from a shift with more than it needs
  const spare = new Map(shifts.map((s) => [s.shiftId, s.headcount - s.needed]))
  const unconstrained = assigned.filter((pid) => !r.minCover[assignmentOf(r, pid).shiftId])
  for (const s of shifts) {
    let gap = s.needed - s.headcount
    while (gap > 0) {
      const donorShift = [...spare.entries()].find(([id, n]) => id !== s.shiftId && n > 0)?.[0]
      const donor = donorShift
        ? assigned.find((pid) => assignmentOf(r, pid).shiftId === donorShift)
        : unconstrained.shift()
      if (!donor) break
      const from = assignmentOf(r, donor).shiftId
      if (donorShift) spare.set(donorShift, (spare.get(donorShift) ?? 0) - 1)
      const p = personById(donor)
      advice.push({ kind: "move-person", apply: { kind: "shift", personId: donor, shiftId: s.shiftId },
        text: `${shiftName(s.shiftId, false)} has ${s.headcount} of the ${s.needed} people it needs. Move ${p?.name ?? donor} from ${shiftName(from, false)}.`,
        textAr: `لدى ${shiftName(s.shiftId, true)} ${s.headcount} من ${s.needed} موظفين تحتاجهم. انقل ${p?.nameAr ?? donor} من ${shiftName(from, true)}.` })
      gap--
    }
  }
  // enough people on a shift, but too many off on the same weekday
  for (const s of shifts) {
    if (s.headcount < s.needed || !s.shortWeekdays.length) continue
    const row = [...(weekly[s.shiftId] ?? [0, 0, 0, 0, 0, 0, 0])]
    for (const short of s.shortWeekdays) {
      if (row[short] >= s.min) continue
      const swap = assigned
        .filter((pid) => assignmentOf(r, pid).shiftId === s.shiftId && assignmentOf(r, pid).daysOff.includes(short))
        .map((pid) => ({ pid, to: days.find((d) => !assignmentOf(r, pid).daysOff.includes(d) && row[d] > s.min) }))
        .find((x) => x.to !== undefined)
      if (!swap || swap.to === undefined) continue
      row[short]++; row[swap.to]--
      const p = personById(swap.pid)
      advice.push({ kind: "move-day-off", apply: { kind: "day-off", personId: swap.pid, from: short, to: swap.to },
        text: `${shiftName(s.shiftId, false)} is short on ${wd(short, false)}s (${(weekly[s.shiftId] ?? [])[short] ?? 0} of ${s.min}). Move ${p?.name ?? swap.pid}'s day off from ${wd(short, false)} to ${wd(swap.to, false)}.`,
        textAr: `${shiftName(s.shiftId, true)} ناقصة يوم ${wd(short, true)} (${(weekly[s.shiftId] ?? [])[short] ?? 0} من ${s.min}). انقل يوم راحة ${p?.nameAr ?? swap.pid} من ${wd(short, true)} إلى ${wd(swap.to, true)}.` })
    }
  }
  // dates short although a typical week is fine: someone on leave, or people still on
  // last period's shift until their day off (the change-over)
  for (const g of coverageGaps(r)) {
    const odd = g.dates.filter((iso) => ((weekly[g.shiftId] ?? [])[weekdayOf(iso)] ?? 0) >= g.need)
    const carrying = (iso: string) => r.memberIds.filter((pid) => assignmentOf(r, pid).shiftId === g.shiftId && shiftIdOn(r, pid, iso) !== g.shiftId && worksOn(r, pid, iso))
    const carryDates = odd.filter((iso) => carrying(iso).length > 0)
    if (carryDates.length) {
      const who = [...new Set(carryDates.flatMap(carrying))]
      const names = (isAr: boolean) => who.map((pid) => { const p = personById(pid); return p ? (isAr ? p.nameAr : p.name) : pid }).join(isAr ? "، " : ", ")
      const span = (isAr: boolean) => carryDates.length > 1 ? `${dayMonth(carryDates[0], isAr)} – ${dayMonth(carryDates[carryDates.length - 1], isAr)}` : dayMonth(carryDates[0], isAr)
      advice.push({ kind: "change-over",
        text: `${shiftName(g.shiftId, false)} is short on ${span(false)} while ${names(false)} finish last period's shift before their day off. An admin can override the change-over for them, or arrange cover.`,
        textAr: `${shiftName(g.shiftId, true)} ناقصة في ${span(true)} بينما ينهي ${names(true)} مناوبة الفترة السابقة قبل يوم راحتهم. يمكن للمسؤول تجاوز موعد التغيير لهم، أو ترتيب تغطية.` })
    }
    const leaveDates = odd.filter((iso) => !carryDates.includes(iso))
    if (!leaveDates.length) continue
    const away = [...new Set(leaveDates.flatMap((iso) => r.memberIds.filter((pid) =>
      shiftIdOn(r, pid, iso) === g.shiftId && absenceOn(pid, iso)?.kind === "leave")))]
    const names = (isAr: boolean) => away.map((pid) => { const p = personById(pid); return p ? (isAr ? p.nameAr : p.name) : pid }).join(isAr ? "، " : ", ")
    const span = (isAr: boolean) => leaveDates.length > 1 ? `${dayMonth(leaveDates[0], isAr)} – ${dayMonth(leaveDates[leaveDates.length - 1], isAr)}` : dayMonth(leaveDates[0], isAr)
    advice.push({ kind: "leave",
      text: `${shiftName(g.shiftId, false)} drops to ${g.have} of ${g.need} on ${leaveDates.length} day${leaveDates.length === 1 ? "" : "s"} (${span(false)}) while ${names(false) || "someone"} is on leave. Arrange cover for those days.`,
      textAr: `تنخفض ${shiftName(g.shiftId, true)} إلى ${g.have} من ${g.need} في ${leaveDates.length} أيام (${span(true)}) أثناء إجازة ${names(true) || "أحد الموظفين"}. رتّب تغطية لتلك الأيام.` })
  }

  const short = shifts.some((s) => s.shortWeekdays.length > 0 || s.headcount < s.needed) || gapDays(r) > 0
  return { verdict: have < needed ? "not-enough" : short ? "rearrange" : "enough", needed, have, shifts, advice }
}
/** Move one weekly day off to another weekday. */
export function moveDayOff(rosterId: string, personId: string, from: number, to: number) {
  const r = getRoster(rosterId)
  if (!r) return
  const a = assignmentOf(r, personId)
  const daysOff = [...a.daysOff.filter((d) => d !== from), to].sort()
  setAssignment(rosterId, personId, { ...a, daysOff })
  note(rosterId, `${personName(personId, false)}: day off moved from ${wd(from, false)} to ${wd(to, false)}`, `${personName(personId, true)}: نُقل يوم الراحة من ${wd(from, true)} إلى ${wd(to, true)}`)
  emit()
}
export { wdList as weekdayList }

/** Paid hours a week for one person. */
export function weeklyHours(r: Roster, personId: string) {
  const a = assignmentOf(r, personId)
  const s = a.shiftId ? getShiftType(a.shiftId) : undefined
  return s ? shiftHours(s) * (7 - a.daysOff.length) : 0
}

// ── the signed-in employee ───────────────────────────────────────────────────
export type MyDay = { roster: Roster; shift?: ShiftTypeRow; off: boolean; leave: boolean }
/** My day from a published roster, if one covers it. */
export function myShiftOn(list: Roster[], iso: string, personId = ME_ID): MyDay | undefined {
  const r = list.find((x) => !x.deleted && x.status === "published" && x.memberIds.includes(personId) && x.startISO <= iso && iso <= x.endISO)
  if (!r) return undefined
  const a = assignmentOf(r, personId)
  const id = a.shiftId ? shiftIdOn(r, personId, iso) : ""
  return { roster: r, shift: id ? getShiftType(id) : undefined, off: a.daysOff.includes(weekdayOf(iso)), leave: absenceOn(personId, iso)?.kind === "leave" }
}

// ── who may build rosters ────────────────────────────────────────────────────
/** Admins and line managers build and publish rosters; everyone sees their own shifts.
 *  Prototype UI rule only — the real app enforces it server-side. */
export function useCanManageRosters(): boolean {
  const { role } = useShell()
  return role === "admin" || childrenOf(ME_ID).length > 0
}

// ── departments and people, from the employee master ────────────────────────
export function departments(): { name: string; nameAr: string }[] {
  const m = new Map<string, string>()
  for (const p of ORG) if (!m.has(p.department)) m.set(p.department, p.departmentAr)
  return [...m].map(([name, nameAr]) => ({ name, nameAr }))
}
export const peopleIn = (department: string): OrgPerson[] => ORG.filter((p) => p.department === department)
/** Every searchable word on a roster: code, names, department, period, and the people on it. */
export function rosterSearchText(r: Roster): string[] {
  const people = r.memberIds.flatMap((pid) => { const p = personById(pid); return p ? [p.name, p.nameAr] : [] })
  return [r.code, r.name, r.nameAr, r.department, r.departmentAr, periodLabel(r, false), periodLabel(r, true), ...people]
}
/** The most recent live roster for a department — the new one starts from it. */
export const latestRosterFor = (list: Roster[], department: string) =>
  [...liveRosters(list)].filter((r) => r.department === department).sort((a, b) => b.startISO.localeCompare(a.startISO))[0]
