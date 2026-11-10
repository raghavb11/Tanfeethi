import * as React from "react"

/** Fixtures for the WIJHA Employee hub (Figma 2028:760) and its popups, the
 *  shift roster, assets and the profile / business-card sharing settings.
 *  Demo-only — a real build reads these from HR, attendance and asset systems.
 *  The signed-in employee is `emp` in ./center (Fawaz Al-Ghailan). */

// ─── today / this week ───────────────────────────────────────────────────────
/** The prototype's "today": Tuesday 28 April 2026 (working week Sun–Thu). */
export const TODAY = {
  weekday: "Tuesday", weekdayAr: "الثلاثاء",
  date: "28 April", dateAr: "28 أبريل",
  geofence: "Inside Riyadh HQ range", geofenceAr: "داخل نطاق مقر الرياض",
  accuracyM: 12,
}

export type WeekDay = {
  id: string
  day: string; dayAr: string
  /** Minutes worked; null = today (read live from the clock) or not yet worked. */
  minutes: number | null
  isToday?: boolean
  upcoming?: boolean
}

/** Sunday–Thursday of the current week. Today's minutes come from the clock store. */
export const WEEK: WeekDay[] = [
  { id: "sun", day: "Sunday", dayAr: "الأحد", minutes: 8 * 60 },
  { id: "mon", day: "Monday", dayAr: "الأثنين", minutes: 7 * 60 + 30 },
  { id: "tue", day: "Tuesday", dayAr: "الثلاثاء", minutes: null, isToday: true },
  { id: "wed", day: "Wednesday", dayAr: "الإربعاء", minutes: null, upcoming: true },
  { id: "thu", day: "Thursday", dayAr: "الخميس", minutes: null, upcoming: true },
]
export const DAY_TARGET_MIN = 8 * 60
export const WEEK_TARGET_H = 40

// ─── small cards ─────────────────────────────────────────────────────────────
export const executiveVisits = { count: 5 }

// ─── shift roster (team leave / remote cover) ────────────────────────────────
export type RotationKind = "leave" | "remote"
export type Rotation = {
  id: string
  kind: RotationKind
  name: string; nameAr: string
  from: string; fromAr: string
  to: string; toAr: string
  substitute?: string; substituteAr?: string
  substituteEmail?: string
}

export const ROTATIONS: Rotation[] = [
  { id: "ro1", kind: "leave", name: "Lina Al-Harbi", nameAr: "لينا الحربي", from: "3 May", fromAr: "3 مايو", to: "7 May", toAr: "7 مايو", substitute: "Tala Nasser", substituteAr: "تالا ناصر", substituteEmail: "tala.nasser@altanfeethi.com.sa" },
  { id: "ro2", kind: "remote", name: "Saad Al-Yami", nameAr: "سعد اليامي", from: "4 May", fromAr: "4 مايو", to: "14 May", toAr: "14 مايو" },
  { id: "ro3", kind: "leave", name: "Rakan Al-Mutlaq", nameAr: "راكان المطلق", from: "10 May", fromAr: "10 مايو", to: "14 May", toAr: "14 مايو", substitute: "Fawaz Al-Ghailan", substituteAr: "فواز الغيلان", substituteEmail: "Falghilan@altanfeethi.com.sa" },
  { id: "ro4", kind: "remote", name: "Nouf Al-Shammari", nameAr: "نوف الشمري", from: "17 May", fromAr: "17 مايو", to: "21 May", toAr: "21 مايو" },
  { id: "ro5", kind: "leave", name: "Omar Haddad", nameAr: "عمر حداد", from: "7 June", fromAr: "7 يونيو", to: "11 June", toAr: "11 يونيو", substitute: "Dalia Al-Saeed", substituteAr: "داليا السعيد", substituteEmail: "dalia.alsaeed@altanfeethi.com.sa" },
  { id: "ro6", kind: "remote", name: "Tala Nasser", nameAr: "تالا ناصر", from: "4 June", fromAr: "4 يونيو", to: "1 September", toAr: "1 سبتمبر" },
]

// ─── services grid ───────────────────────────────────────────────────────────
export type ServiceTile = { id: string; label: string; labelAr: string; icon: "plane" | "bed" | "utensils" | "car" | "laptop" | "graduation" | "idcard"; to: string }
/** Order as drawn (RTL reading order: Travel first). */
export const SERVICES: ServiceTile[] = [
  { id: "travel", label: "Travel", labelAr: "سفر", icon: "plane", to: "/services" },
  { id: "stay", label: "Accommodation", labelAr: "إقامة", icon: "bed", to: "/services" },
  { id: "meals", label: "Meals", labelAr: "وجبات", icon: "utensils", to: "/cafeteria" },
  { id: "transport", label: "Transport", labelAr: "تنقّلات", icon: "car", to: "/services" },
  { id: "devices", label: "Devices", labelAr: "أجهزة", icon: "laptop", to: "/employee/assets" },
  { id: "training", label: "Training", labelAr: "تدريب", icon: "graduation", to: "/learning" },
  { id: "card", label: "Business card", labelAr: "بطاقة العمل", icon: "idcard", to: "/employee/card" },
]

// ─── performance ─────────────────────────────────────────────────────────────
export const performance = {
  goals: [
    { id: "g1", title: "Lead the Wave 2 launch", titleAr: "قيادة إطلاق الموجة 2", pct: 90 },
    { id: "g2", title: "Mentoring Engineers", titleAr: "إرشاد مهندسين", pct: 60 },
    { id: "g3", title: "Reduce incident resolution time by 20%", titleAr: "خفض زمن معالجة الحوادث 20٪", pct: 45 },
  ],
  rating: 4.6,
  outOf: 5,
  verdict: "Exceeds Expectations", verdictAr: "يفوق التوقعات",
  nextReview: "July 15", nextReviewAr: "15 يوليو",
}

// ─── assets / custody (phone 3610:8106) ──────────────────────────────────────
export type AssetStatus = "ok" | "replacement" | "fault"
export type Asset = {
  id: string
  code: string
  name: string; nameAr: string
  icon: "laptop" | "phone" | "key" | "monitor"
  /** Warranty / return date. */
  date: string; dateAr: string
  status: AssetStatus
}
const SEED_ASSETS: Asset[] = [
  { id: "as1", code: "AS-883", name: "MacBook Pro 16", nameAr: "ماك بوك برو 16", icon: "laptop", date: "August 2027", dateAr: "أغسطس 2027", status: "ok" },
  { id: "as2", code: "AS-902", name: "iPhone 15 Pro Max", nameAr: "آيفون 15 برو ماكس", icon: "phone", date: "September 2027", dateAr: "سبتمبر 2027", status: "ok" },
  { id: "as3", code: "AS-771", name: "YubiKey · Level 2", nameAr: "يوبي كي · المستوى الثاني", icon: "key", date: "July 2025", dateAr: "يوليو 2025", status: "replacement" },
  { id: "as4", code: "AS-640", name: "27-inch monitor", nameAr: "شاشة 27 بوصة", icon: "monitor", date: "March 2028", dateAr: "مارس 2028", status: "ok" },
]

let assets = SEED_ASSETS
const assetListeners = new Set<() => void>()
const subAssets = (l: () => void) => { assetListeners.add(l); return () => assetListeners.delete(l) }
export const useAssets = () => React.useSyncExternalStore(subAssets, () => assets)
export function setAssetStatus(id: string, status: AssetStatus) {
  assets = assets.map((a) => (a.id === id ? { ...a, status } : a))
  assetListeners.forEach((l) => l())
}

// ─── business-card sharing + profile settings ────────────────────────────────
export type ShareField = "title" | "department" | "email" | "mobile" | "location"
export const SHARE_FIELDS: { id: ShareField; label: string; labelAr: string }[] = [
  { id: "title", label: "Job Title", labelAr: "المسمى الوظيفي" },
  { id: "department", label: "Department", labelAr: "الإدارة" },
  { id: "email", label: "Email", labelAr: "البريد الإلكتروني" },
  { id: "mobile", label: "Mobile Number", labelAr: "رقم الجوال" },
  { id: "location", label: "Work Location", labelAr: "موقع العمل" },
]

type Prefs = { share: Record<ShareField, boolean>; notifications: boolean }
let prefs: Prefs = {
  share: { title: true, department: false, email: true, mobile: true, location: false },
  notifications: true,
}
const prefListeners = new Set<() => void>()
const subPrefs = (l: () => void) => { prefListeners.add(l); return () => prefListeners.delete(l) }
export const usePrefs = () => React.useSyncExternalStore(subPrefs, () => prefs)
export function setShare(field: ShareField, on: boolean) {
  prefs = { ...prefs, share: { ...prefs.share, [field]: on } }
  prefListeners.forEach((l) => l())
}
export function setNotifications(on: boolean) {
  prefs = { ...prefs, notifications: on }
  prefListeners.forEach((l) => l())
}
