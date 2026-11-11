import * as React from "react"
import { useShell } from "@reach/shell-context"
import { pushNotification } from "@reach/shared-mocks"
import { getShiftType, shiftSpan, type ShiftTypeRow } from "@reach/domain-content/master-data"

import { childrenOf, ME_ID, ORG, type OrgPerson, personById } from "./mock/org"
import { ROTATIONS } from "./mock/hub"

/** Shift rosters — who works which shift on which day, for one team and one
 *  week or month. Shift types are master data (Administration › Master data ›
 *  Shift types); people come from the employee master (ORG). A roster is built
 *  as a draft and published to the people on it. Deleting is a soft delete.
 *  Demo store — a real build keeps this server-side with the same rules. */

/** The employee module's "today": Tuesday 28 April 2026 (see data/mock/hub.ts). */
export const ROSTER_TODAY_ISO = "2026-04-28"
/** Minimum rest between two shifts, in hours (Saudi Labour Law practice). */
export const MIN_REST_HOURS = 11
/** More working days in a row than this is flagged. */
export const MAX_STREAK = 6

// ── dates ────────────────────────────────────────────────────────────────────
const local = (iso: string) => new Date(`${iso}T00:00:00`)
export const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
export const addDays = (iso: string, n: number) => { const d = local(iso); d.setDate(d.getDate() + n); return toISO(d) }
/** The Sunday a week starts on (the working week runs Sunday–Thursday). */
export const weekStart = (iso: string) => addDays(iso, -local(iso).getDay())
export const monthStart = (iso: string) => `${iso.slice(0, 7)}-01`
export const monthEnd = (iso: string) => { const d = local(monthStart(iso)); d.setMonth(d.getMonth() + 1); d.setDate(0); return toISO(d) }
export function daysBetween(fromISO: string, toISO_: string): string[] {
  const out: string[] = []
  for (let d = fromISO; d <= toISO_; d = addDays(d, 1)) out.push(d)
  return out
}
export const dayNum = (iso: string) => local(iso).getDate()
export const isWeekend = (iso: string) => { const g = local(iso).getDay(); return g === 5 || g === 6 }
const LOCALE = (isAr: boolean) => (isAr ? "ar-EG-u-nu-latn" : "en-GB")
export const weekdayShort = (iso: string, isAr: boolean) => local(iso).toLocaleDateString(LOCALE(isAr), { weekday: "short" })
export const weekdayLong = (iso: string, isAr: boolean) => local(iso).toLocaleDateString(LOCALE(isAr), { weekday: "long" })
export const dayMonth = (iso: string, isAr: boolean) => local(iso).toLocaleDateString(LOCALE(isAr), { day: "numeric", month: "short" })
export const fullDate = (iso: string, isAr: boolean) => local(iso).toLocaleDateString(LOCALE(isAr), { day: "numeric", month: "long", year: "numeric" })
export function periodLabel(r: Pick<Roster, "period" | "startISO" | "endISO">, isAr: boolean) {
  if (r.period === "month") return local(r.startISO).toLocaleDateString(LOCALE(isAr), { month: "long", year: "numeric" })
  return `${dayMonth(r.startISO, isAr)} – ${dayMonth(r.endISO, isAr)}`
}

// ── the record ───────────────────────────────────────────────────────────────
export type RosterPeriod = "week" | "month"
export type RosterStatus = "draft" | "published"
export type Roster = {
  id: string
  /** RST-001 — fixed once created. */
  code: string
  /** What the team calls it, e.g. "Terminal 5 lounge". */
  name: string; nameAr: string
  department: string; departmentAr: string
  period: RosterPeriod
  startISO: string; endISO: string
  /** Employee-master ids, in the order they are listed. */
  memberIds: string[]
  /** `${personId}|${iso}` → shift-type id. A missing key is an unplanned day. */
  cells: Record<string, string>
  /** Fewest people needed on each working shift type, per day. */
  minCover: Record<string, number>
  /** Minimum cover counts on Friday and Saturday too (a lounge), or only Sunday–Thursday (an office). */
  coverWeekends: boolean
  status: RosterStatus
  /** Published, then edited — the people on it still see the published version's dates. */
  changedSincePublish?: boolean
  publishedISO?: string
  createdISO: string
  createdBy: string; createdByAr: string
  /** Soft delete: kept for the log, hidden from lists. */
  deleted?: boolean
  deletedISO?: string
}
export const cellKey = (personId: string, iso: string) => `${personId}|${iso}`
export const rosterDays = (r: Pick<Roster, "startISO" | "endISO">) => daysBetween(r.startISO, r.endISO)
export const rosterName = (r: Roster, isAr: boolean) => (isAr ? r.nameAr || r.name : r.name || r.nameAr) || (isAr ? r.departmentAr : r.department)

// ── rotation patterns (runtime-editable list, seeded) ────────────────────────
export type RotationPattern = {
  id: string
  name: string; nameAr: string
  /** Shift-type ids, one per day, repeated. */
  sequence: string[]
  /** Each person starts one step later, so the shifts spread across the team. */
  stagger: boolean
}
const SEED_PATTERNS: RotationPattern[] = [
  { id: "pat-2-2-2-2", name: "2 mornings · 2 evenings · 2 nights · 2 off", nameAr: "صباحيتان · مسائيتان · ليليتان · راحتان",
    sequence: ["morning", "morning", "evening", "evening", "night", "night", "off", "off"], stagger: true },
  { id: "pat-early-late", name: "3 mornings · 2 evenings · 2 off", nameAr: "3 صباحية · 2 مسائية · 2 راحة",
    sequence: ["morning", "morning", "morning", "evening", "evening", "off", "off"], stagger: true },
  { id: "pat-office", name: "Office week (Sun–Thu, Fri & Sat off)", nameAr: "أسبوع مكتبي (الأحد–الخميس، الجمعة والسبت راحة)",
    sequence: ["office", "office", "office", "office", "office", "off", "off"], stagger: false },
]

/** Fill one person's days from a pattern. `offset` is the step the first day takes. */
export function fillFromPattern(cells: Record<string, string>, personId: string, days: string[], sequence: string[], offset: number) {
  if (!sequence.length) return cells
  const next = { ...cells }
  days.forEach((iso, i) => { next[cellKey(personId, iso)] = sequence[(i + offset) % sequence.length] })
  return next
}
/** Spread a pattern across a team: staggered patterns start each person a step later. */
export function fillTeam(memberIds: string[], days: string[], p: Pick<RotationPattern, "sequence" | "stagger">) {
  let cells: Record<string, string> = {}
  memberIds.forEach((id, i) => {
    const offset = p.stagger ? Math.round((i * p.sequence.length) / Math.max(1, memberIds.length)) % p.sequence.length : 0
    cells = fillFromPattern(cells, id, days, p.sequence, offset)
  })
  return cells
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

// ── seed ─────────────────────────────────────────────────────────────────────
const LOUNGE = ["p-badr", "p-haya", "p-mazen", "p-reemk", "p-sultan", "p-jood", "p-fahd", "p-ruba"]
const DIGITAL = ["p-fawaz", "p-lina", "p-saady", "p-tala", "p-omarh", "p-dalia"]
const LOUNGE_COVER = { morning: 2, evening: 2, night: 2 }
const OMAR = { createdBy: "Omar Al-Juhani", createdByAr: "عمر الجهني" }
const FAWAZ = { createdBy: "Fawaz Al-Ghailan", createdByAr: "فواز الغيلان" }

function seed(): Roster[] {
  const w1 = rosterDays({ startISO: "2026-04-26", endISO: "2026-05-02" })
  const w2 = rosterDays({ startISO: "2026-05-03", endISO: "2026-05-09" })
  const rot = SEED_PATTERNS[0]
  // next week continues the same rotation, one week on
  const loungeW2 = (() => {
    let cells: Record<string, string> = {}
    LOUNGE.forEach((id, i) => { cells = fillFromPattern(cells, id, w2, rot.sequence, (i + 7) % rot.sequence.length) })
    // a hand edit that breaks the rest rule — the editor flags it
    cells[cellKey("p-mazen", "2026-05-06")] = "evening"
    cells[cellKey("p-mazen", "2026-05-07")] = "morning"
    return cells
  })()
  const office = SEED_PATTERNS[2]
  const digital = (days: string[]) => {
    const cells = fillTeam(DIGITAL, days, office)
    // a Thursday evening service-desk cover that moves around the team (Friday is off, so rest is kept)
    cells[cellKey(DIGITAL[days === w1 ? 3 : 4], days[4])] = "evening"
    return cells
  }
  return [
    { id: "ros-1", code: "RST-001", name: "Terminal 5 lounge", nameAr: "صالة المبنى ٥", department: "Commercial", departmentAr: "التجاري",
      period: "week", startISO: w1[0], endISO: w1[6], memberIds: LOUNGE, cells: fillTeam(LOUNGE, w1, rot), minCover: LOUNGE_COVER, coverWeekends: true,
      status: "published", publishedISO: "2026-04-22", createdISO: "2026-04-20", ...OMAR },
    { id: "ros-2", code: "RST-002", name: "Terminal 5 lounge", nameAr: "صالة المبنى ٥", department: "Commercial", departmentAr: "التجاري",
      period: "week", startISO: w2[0], endISO: w2[6], memberIds: LOUNGE, cells: loungeW2, minCover: LOUNGE_COVER, coverWeekends: true,
      status: "draft", createdISO: "2026-04-27", ...OMAR },
    { id: "ros-3", code: "RST-003", name: "Digital Experience", nameAr: "التجربة الرقمية", department: "Information Technology", departmentAr: "تقنية المعلومات",
      period: "week", startISO: w1[0], endISO: w1[6], memberIds: DIGITAL, cells: digital(w1), minCover: { office: 4 }, coverWeekends: false,
      status: "published", publishedISO: "2026-04-23", createdISO: "2026-04-21", ...FAWAZ },
    // Lina is on approved leave 3–7 May; the draft still has her in — flagged
    { id: "ros-4", code: "RST-004", name: "Digital Experience", nameAr: "التجربة الرقمية", department: "Information Technology", departmentAr: "تقنية المعلومات",
      period: "week", startISO: w2[0], endISO: w2[6], memberIds: DIGITAL, cells: digital(w2), minCover: { office: 4 }, coverWeekends: false,
      status: "draft", createdISO: "2026-04-28", ...FAWAZ },
  ]
}

// ── store ────────────────────────────────────────────────────────────────────
export type RosterLog = { id: string; rosterId: string; atISO: string; time: string; actor: string; actorAr: string; text: string; textAr: string }

let rosters: Roster[] = seed()
let patterns: RotationPattern[] = SEED_PATTERNS
let log: RosterLog[] = [
  { id: "rl-1", rosterId: "ros-1", atISO: "2026-04-20", time: "09:12", actor: OMAR.createdBy, actorAr: OMAR.createdByAr, text: "Created the roster from 2 mornings · 2 evenings · 2 nights · 2 off", textAr: "أنشأ الجدول من نمط صباحيتان · مسائيتان · ليليتان · راحتان" },
  { id: "rl-2", rosterId: "ros-1", atISO: "2026-04-22", time: "16:40", actor: OMAR.createdBy, actorAr: OMAR.createdByAr, text: "Published to 8 people", textAr: "نشر الجدول إلى 8 موظفين" },
  { id: "rl-3", rosterId: "ros-2", atISO: "2026-04-27", time: "11:05", actor: OMAR.createdBy, actorAr: OMAR.createdByAr, text: "Copied from RST-001", textAr: "نسخ الجدول من RST-001" },
  { id: "rl-4", rosterId: "ros-2", atISO: "2026-04-27", time: "11:20", actor: OMAR.createdBy, actorAr: OMAR.createdByAr, text: "Mazen Al-Otaibi: Wed 6 May → Evening, Thu 7 May → Morning", textAr: "مازن العتيبي: الأربعاء 6 مايو ← مسائية، الخميس 7 مايو ← صباحية" },
  { id: "rl-5", rosterId: "ros-3", atISO: "2026-04-21", time: "10:00", actor: FAWAZ.createdBy, actorAr: FAWAZ.createdByAr, text: "Created the roster from Office week", textAr: "أنشأ الجدول من نمط الأسبوع المكتبي" },
  { id: "rl-6", rosterId: "ros-3", atISO: "2026-04-23", time: "14:15", actor: FAWAZ.createdBy, actorAr: FAWAZ.createdByAr, text: "Published to 6 people", textAr: "نشر الجدول إلى 6 موظفين" },
  { id: "rl-7", rosterId: "ros-4", atISO: "2026-04-28", time: "08:30", actor: FAWAZ.createdBy, actorAr: FAWAZ.createdByAr, text: "Copied from RST-003", textAr: "نسخ الجدول من RST-003" },
]
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l) }

export const useRosters = () => React.useSyncExternalStore(subscribe, () => rosters)
export const usePatterns = () => React.useSyncExternalStore(subscribe, () => patterns)
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
const shiftName = (id: string | undefined, isAr: boolean) => {
  if (!id) return isAr ? "بدون" : "None"
  const s = getShiftType(id)
  return s ? (isAr ? s.nameAr : s.name) : id
}
/** One cell. An empty id clears the day. */
export function setCell(rosterId: string, personId: string, iso: string, shiftId: string) {
  const r = getRoster(rosterId)
  if (!r) return
  const key = cellKey(personId, iso)
  const before = r.cells[key]
  if ((before ?? "") === shiftId) return
  const cells = { ...r.cells }
  if (shiftId) cells[key] = shiftId; else delete cells[key]
  patch(rosterId, { cells })
  const p = personById(personId)
  note(rosterId,
    `${p?.name ?? personId}: ${weekdayShort(iso, false)} ${dayMonth(iso, false)} → ${shiftName(shiftId, false)}`,
    `${p?.nameAr ?? personId}: ${weekdayShort(iso, true)} ${dayMonth(iso, true)} ← ${shiftName(shiftId, true)}`)
  emit()
}
/** Lay a pattern over one person's whole period. */
export function applyPatternToPerson(rosterId: string, personId: string, pattern: RotationPattern, offset = 0) {
  const r = getRoster(rosterId)
  if (!r) return
  patch(rosterId, { cells: fillFromPattern(r.cells, personId, rosterDays(r), pattern.sequence, offset) })
  const p = personById(personId)
  note(rosterId, `${p?.name ?? personId}: applied ${pattern.name}`, `${p?.nameAr ?? personId}: طُبّق نمط ${pattern.nameAr}`)
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
export function publishRoster(rosterId: string) {
  const r = getRoster(rosterId)
  if (!r) return
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
export function addPattern(p: Omit<RotationPattern, "id">): string {
  const id = `pat-${Date.now().toString(36)}`
  patterns = [...patterns, { ...p, id }]
  emit()
  return id
}

// ── checks ───────────────────────────────────────────────────────────────────
export type IssueKind = "leave" | "rest" | "streak"
export type RosterIssue = { kind: IssueKind; personId: string; iso: string; text: string; textAr: string }
const working = (id: string | undefined) => { const s = id ? getShiftType(id) : undefined; return !!s && !s.isOff }

export function rosterIssues(r: Roster): RosterIssue[] {
  const days = rosterDays(r)
  const out: RosterIssue[] = []
  for (const pid of r.memberIds) {
    let streak = 0
    days.forEach((iso, i) => {
      const id = r.cells[cellKey(pid, iso)]
      const s = id ? getShiftType(id) : undefined
      // on approved leave but given a shift
      const away = absenceOn(pid, iso)
      if (away?.kind === "leave" && s && !s.isOff) {
        out.push({ kind: "leave", personId: pid, iso, text: "On approved leave this day", textAr: "في إجازة معتمدة هذا اليوم" })
      }
      // rest between yesterday's shift and today's
      if (i > 0 && s) {
        const prev = getShiftType(r.cells[cellKey(pid, days[i - 1])] ?? "")
        const a = prev ? shiftSpan(prev) : undefined
        const b = shiftSpan(s)
        if (a && b) {
          const restMin = 24 * 60 + b.start - (a.start + a.length)
          if (restMin < MIN_REST_HOURS * 60) {
            const h = Math.max(0, Math.round(restMin / 60))
            out.push({ kind: "rest", personId: pid, iso, text: `Only ${h}h rest after the previous shift (minimum ${MIN_REST_HOURS}h)`,
              textAr: `${h} ساعات راحة فقط بعد المناوبة السابقة (الحد الأدنى ${MIN_REST_HOURS} ساعة)` })
          }
        }
      }
      streak = working(id) ? streak + 1 : 0
      if (streak === MAX_STREAK + 1) {
        out.push({ kind: "streak", personId: pid, iso, text: `${streak} working days in a row (maximum ${MAX_STREAK})`,
          textAr: `${streak} أيام عمل متتالية (الحد الأقصى ${MAX_STREAK})` })
      }
    })
  }
  return out
}
/** People on each working shift, per day. */
export function coverage(r: Roster): Record<string, Record<string, number>> {
  const out: Record<string, Record<string, number>> = {}
  for (const iso of rosterDays(r)) {
    const day: Record<string, number> = {}
    for (const pid of r.memberIds) {
      const id = r.cells[cellKey(pid, iso)]
      if (working(id)) day[id!] = (day[id!] ?? 0) + 1
    }
    out[iso] = day
  }
  return out
}
/** Days where a shift has fewer people than its minimum. */
export function coverageGaps(r: Roster): { iso: string; shiftId: string; have: number; need: number }[] {
  const cov = coverage(r)
  const out: { iso: string; shiftId: string; have: number; need: number }[] = []
  for (const iso of rosterDays(r)) {
    if (!coverCounts(r, iso)) continue
    for (const [shiftId, need] of Object.entries(r.minCover)) {
      const have = cov[iso][shiftId] ?? 0
      if (have < need) out.push({ iso, shiftId, have, need })
    }
  }
  return out
}
export const unplannedCount = (r: Roster) =>
  r.memberIds.reduce((n, pid) => n + rosterDays(r).filter((iso) => !r.cells[cellKey(pid, iso)]).length, 0)
export function hoursFor(r: Roster, personId: string) {
  return rosterDays(r).reduce((h, iso) => {
    const s = getShiftType(r.cells[cellKey(personId, iso)] ?? "")
    const span = s ? shiftSpan(s) : undefined
    return h + (span ? Math.max(0, span.length - (s!.breakMinutes ?? 0)) / 60 : 0)
  }, 0)
}

// ── the signed-in employee ───────────────────────────────────────────────────
/** My published shift on a day, if a roster has one. */
export function myShiftOn(list: Roster[], iso: string, personId = ME_ID): { roster: Roster; shift?: ShiftTypeRow } | undefined {
  const r = list.find((x) => !x.deleted && x.status === "published" && x.memberIds.includes(personId) && x.startISO <= iso && iso <= x.endISO)
  if (!r) return undefined
  return { roster: r, shift: getShiftType(r.cells[cellKey(personId, iso)] ?? "") }
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
/** The most recent live roster for a department — "copy last period" starts from it. */
export const latestRosterFor = (list: Roster[], department: string) =>
  [...liveRosters(list)].filter((r) => r.department === department).sort((a, b) => b.startISO.localeCompare(a.startISO))[0]
