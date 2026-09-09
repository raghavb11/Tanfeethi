import * as React from "react"

/** Cafeteria & tea-boy service. A free internal service — refreshments and
 *  meals delivered to a desk, meeting room or terminal office. No pricing:
 *  nothing in the SOW defines a payment or deduction model. */

// ── menu ─────────────────────────────────────────────────────────────────────
export type MenuGroupId = "hot" | "cold" | "snacks" | "meals" | "catering"

export const menuGroups: { id: MenuGroupId; label: string; labelAr: string }[] = [
  { id: "hot", label: "Hot drinks", labelAr: "مشروبات ساخنة" },
  { id: "cold", label: "Cold drinks", labelAr: "مشروبات باردة" },
  { id: "snacks", label: "Snacks", labelAr: "وجبات خفيفة" },
  { id: "meals", label: "Meals", labelAr: "وجبات" },
  { id: "catering", label: "Catering", labelAr: "ضيافة" },
]

export type MenuItem = {
  id: string
  group: MenuGroupId
  name: string
  nameAr: string
  note?: string
  noteAr?: string
  popular?: boolean
  available: boolean
  /** Hot drinks are ordered with a sugar level. */
  takesSugar?: boolean
  /** Where it can be ordered to. "all" is the common case; a kitchen that
   *  cannot plate a hot meal in a remote terminal is why the others exist. */
  servedScope?: "all" | "sites" | "places"
  /** Sites that serve it, when servedScope is "sites". */
  servedSites?: string[]
  /** Individual places that serve it, when servedScope is "places". */
  servedPlaces?: string[]
}


/** How sweet — the single most-asked question for tea and coffee. */
export type SugarLevel = "none" | "light" | "medium" | "sweet"
export const SUGAR: { id: SugarLevel; label: string; labelAr: string }[] = [
  { id: "none", label: "No sugar", labelAr: "بدون سكر" },
  { id: "light", label: "Light", labelAr: "سكر خفيف" },
  { id: "medium", label: "Medium", labelAr: "سكر وسط" },
  { id: "sweet", label: "Sweet", labelAr: "سكر زيادة" },
]
export const sugarLabel = (id: SugarLevel, isAr: boolean) => {
  const x = SUGAR.find((v) => v.id === id)
  return x ? (isAr ? x.labelAr : x.label) : id
}

export let menu: MenuItem[] = [
  // hot drinks
  { id: "m-arabic-coffee", group: "hot", name: "Arabic coffee (Gahwa)", nameAr: "قهوة عربية", note: "Served with dates", noteAr: "تُقدَّم مع التمر", popular: true, available: true },
  { id: "m-tea", group: "hot", name: "Tea", nameAr: "شاي", popular: true, available: true, takesSugar: true },
  { id: "m-tea-mint", group: "hot", name: "Mint tea", nameAr: "شاي بالنعناع", available: true, takesSugar: true },
  { id: "m-green-tea", group: "hot", name: "Green tea", nameAr: "شاي أخضر", available: true, takesSugar: true },
  { id: "m-karak", group: "hot", name: "Karak tea", nameAr: "شاي كرك", note: "Spiced, with milk", noteAr: "بالحليب والبهارات", popular: true, available: true, takesSugar: true },
  { id: "m-turkish-coffee", group: "hot", name: "Turkish coffee", nameAr: "قهوة تركية", available: true, takesSugar: true },
  { id: "m-americano", group: "hot", name: "Americano", nameAr: "أمريكانو", popular: true, available: true, takesSugar: true },
  { id: "m-latte", group: "hot", name: "Latte", nameAr: "لاتيه", available: true, takesSugar: true },
  { id: "m-cappuccino", group: "hot", name: "Cappuccino", nameAr: "كابتشينو", available: false, takesSugar: true },
  { id: "m-espresso", group: "hot", name: "Espresso", nameAr: "إسبريسو", available: true, takesSugar: true },
  { id: "m-hot-chocolate", group: "hot", name: "Hot chocolate", nameAr: "شوكولاتة ساخنة", available: true },

  // cold drinks
  { id: "m-water", group: "cold", name: "Water", nameAr: "ماء", note: "Still or sparkling", noteAr: "عادي أو فوار", popular: true, available: true },
  { id: "m-iced-coffee", group: "cold", name: "Iced coffee", nameAr: "قهوة مثلجة", popular: true, available: true, takesSugar: true },
  { id: "m-iced-latte", group: "cold", name: "Iced latte", nameAr: "لاتيه مثلج", available: true, takesSugar: true },
  { id: "m-fresh-juice", group: "cold", name: "Fresh juice", nameAr: "عصير طازج", note: "Orange, mango or mixed", noteAr: "برتقال، مانجو أو مشكّل", available: true },
  { id: "m-lemon-mint", group: "cold", name: "Lemon & mint", nameAr: "ليمون بالنعناع", popular: true, available: true },
  { id: "m-laban", group: "cold", name: "Laban", nameAr: "لبن", available: true },
  { id: "m-soft-drink", group: "cold", name: "Soft drink", nameAr: "مشروب غازي", available: true },
  { id: "m-iced-tea", group: "cold", name: "Iced tea", nameAr: "شاي مثلج", available: false, takesSugar: true },

  // snacks
  { id: "m-dates", group: "snacks", name: "Dates", nameAr: "تمر", note: "Ajwa or Sukkari", noteAr: "عجوة أو سكري", popular: true, available: true },
  { id: "m-fruit", group: "snacks", name: "Fruit plate", nameAr: "طبق فواكه", available: true },
  { id: "m-pastry", group: "snacks", name: "Pastries", nameAr: "معجنات", note: "Cheese, zaatar or spinach", noteAr: "جبن، زعتر أو سبانخ", popular: true, available: true },
  { id: "m-croissant", group: "snacks", name: "Croissant", nameAr: "كرواسون", available: true },
  { id: "m-nuts", group: "snacks", name: "Mixed nuts", nameAr: "مكسرات مشكّلة", available: true },
  { id: "m-biscuits", group: "snacks", name: "Biscuits", nameAr: "بسكويت", available: true },
  { id: "m-cake", group: "snacks", name: "Cake slice", nameAr: "قطعة كيك", available: true },

  // meals
  { id: "m-sandwich", group: "meals", servedScope: "sites", servedSites: ["Headquarters", "Terminal 1", "Terminal 2"], name: "Sandwich", nameAr: "ساندويتش", note: "Chicken, cheese or vegetable", noteAr: "دجاج، جبن أو خضار", popular: true, available: true },
  { id: "m-club", group: "meals", name: "Club sandwich", nameAr: "كلوب ساندويتش", available: true },
  { id: "m-salad", group: "meals", servedScope: "sites", servedSites: ["Headquarters"], name: "Salad", nameAr: "سلطة", note: "Caesar or garden", noteAr: "سيزر أو خضراء", available: true },
  { id: "m-lunch", group: "meals", name: "Daily lunch", nameAr: "غداء اليوم", note: "Today: chicken kabsa", noteAr: "اليوم: كبسة دجاج", popular: true, available: true },
  { id: "m-shawarma", group: "meals", servedScope: "sites", servedSites: ["Headquarters", "Terminal 1", "Terminal 2"], name: "Shawarma plate", nameAr: "صحن شاورما", available: true },
  { id: "m-soup", group: "meals", name: "Soup of the day", nameAr: "شوربة اليوم", note: "Today: lentil", noteAr: "اليوم: عدس", available: true },
  { id: "m-breakfast", group: "meals", name: "Breakfast box", nameAr: "علبة فطور", note: "Foul, eggs, bread", noteAr: "فول، بيض، خبز", available: false },

  // catering — for meetings
  { id: "m-coffee-service", group: "catering", name: "Coffee service (per 6)", nameAr: "ضيافة قهوة (لكل 6)", note: "Gahwa, tea, dates, water", noteAr: "قهوة، شاي، تمر، ماء", popular: true, available: true },
  { id: "m-meeting-box", group: "catering", name: "Meeting refreshments", nameAr: "ضيافة اجتماع", note: "Drinks, pastries, fruit", noteAr: "مشروبات، معجنات، فواكه", available: true },
  { id: "m-vip-service", group: "catering", name: "VIP service", nameAr: "ضيافة كبار الشخصيات", note: "Requires 2 hours notice", noteAr: "تتطلب إشعارًا قبل ساعتين", available: true },
]

// ── delivery locations (configurable master, per the build guidelines) ───────
export type DeliveryLocation = {
  id: string
  name: string
  nameAr: string
  site: string
  siteAr: string
  active: boolean
}

export let locations: DeliveryLocation[] = [
  // headquarters — meeting rooms
  { id: "loc-hq-boardroom", name: "HQ · Boardroom (L12)", nameAr: "المقر · قاعة المجلس (ط12)", site: "Headquarters", siteAr: "المقر الرئيسي", active: true },
  { id: "loc-hq-majlis", name: "HQ · Al Majlis (L12)", nameAr: "المقر · المجلس (ط12)", site: "Headquarters", siteAr: "المقر الرئيسي", active: true },
  { id: "loc-hq-riyadh-room", name: "HQ · Riyadh Room (L14)", nameAr: "المقر · قاعة الرياض (ط14)", site: "Headquarters", siteAr: "المقر الرئيسي", active: true },
  { id: "loc-hq-jeddah-room", name: "HQ · Jeddah Room (L14)", nameAr: "المقر · قاعة جدة (ط14)", site: "Headquarters", siteAr: "المقر الرئيسي", active: true },
  { id: "loc-hq-dammam-room", name: "HQ · Dammam Room (L11)", nameAr: "المقر · قاعة الدمام (ط11)", site: "Headquarters", siteAr: "المقر الرئيسي", active: true },
  { id: "loc-hq-training", name: "HQ · Training Room (L10)", nameAr: "المقر · قاعة التدريب (ط10)", site: "Headquarters", siteAr: "المقر الرئيسي", active: true },
  { id: "loc-hq-huddle-a", name: "HQ · Huddle A (L14)", nameAr: "المقر · غرفة اجتماع سريع أ (ط14)", site: "Headquarters", siteAr: "المقر الرئيسي", active: true },
  { id: "loc-hq-huddle-b", name: "HQ · Huddle B (L13)", nameAr: "المقر · غرفة اجتماع سريع ب (ط13)", site: "Headquarters", siteAr: "المقر الرئيسي", active: true },

  // headquarters — desks and common areas
  { id: "loc-hq-14", name: "HQ · Level 14 · My desk", nameAr: "المقر · الطابق 14 · مكتبي", site: "Headquarters", siteAr: "المقر الرئيسي", active: true },
  { id: "loc-hq-13", name: "HQ · Level 13 · Open office", nameAr: "المقر · الطابق 13 · المكتب المفتوح", site: "Headquarters", siteAr: "المقر الرئيسي", active: true },
  { id: "loc-hq-12", name: "HQ · Level 12 · Executive floor", nameAr: "المقر · الطابق 12 · الطابق التنفيذي", site: "Headquarters", siteAr: "المقر الرئيسي", active: true },
  { id: "loc-hq-lounge", name: "HQ · Ground · Executive Lounge", nameAr: "المقر · الأرضي · صالة كبار الشخصيات", site: "Headquarters", siteAr: "المقر الرئيسي", active: true },
  { id: "loc-hq-reception", name: "HQ · Ground · Reception", nameAr: "المقر · الأرضي · الاستقبال", site: "Headquarters", siteAr: "المقر الرئيسي", active: true },

  // terminals
  { id: "loc-t1-ops", name: "Terminal 1 · Operations Office", nameAr: "الصالة 1 · مكتب العمليات", site: "Terminal 1", siteAr: "الصالة 1", active: true },
  { id: "loc-t1-lounge", name: "Terminal 1 · VIP Lounge", nameAr: "الصالة 1 · صالة كبار الشخصيات", site: "Terminal 1", siteAr: "الصالة 1", active: true },
  { id: "loc-t2-ops", name: "Terminal 2 · Operations Office", nameAr: "الصالة 2 · مكتب العمليات", site: "Terminal 2", siteAr: "الصالة 2", active: true },
  { id: "loc-t2-lounge", name: "Terminal 2 · VIP Lounge", nameAr: "الصالة 2 · صالة كبار الشخصيات", site: "Terminal 2", siteAr: "الصالة 2", active: true },
  { id: "loc-t2-meeting", name: "Terminal 2 · Briefing Room", nameAr: "الصالة 2 · قاعة الإحاطة", site: "Terminal 2", siteAr: "الصالة 2", active: true },

  // operations
  { id: "loc-mcc", name: "Mission Control Centre", nameAr: "مركز التحكّم بالمهام", site: "Operations", siteAr: "العمليات", active: true },
  { id: "loc-crew", name: "Crew Rest Area", nameAr: "استراحة الطاقم", site: "Operations", siteAr: "العمليات", active: true },
  { id: "loc-old-annexe", name: "Annexe Building (closed)", nameAr: "مبنى الملحق (مغلق)", site: "Headquarters", siteAr: "المقر الرئيسي", active: false },
]

export const slots: { id: string; label: string; labelAr: string }[] = [
  { id: "now", label: "As soon as possible", labelAr: "في أقرب وقت" },
  { id: "0930", label: "09:30", labelAr: "09:30" },
  { id: "1030", label: "10:30", labelAr: "10:30" },
  { id: "1200", label: "12:00", labelAr: "12:00" },
  { id: "1400", label: "14:00", labelAr: "14:00" },
  { id: "1530", label: "15:30", labelAr: "15:30" },
]

// ── orders ───────────────────────────────────────────────────────────────────
export type OrderStatus = "Received" | "Accepted" | "Delivered" | "Cancelled"

export type OrderLine = { itemId: string; qty: number; sugar?: SugarLevel }

export type CafeteriaOrder = {
  id: string
  ref: string
  lines: OrderLine[]
  locationId: string
  slotId: string
  note?: string
  status: OrderStatus
  /** Who placed it — the admin queue shows other people's orders too. */
  by: string
  byAr: string
  initials: string
  placed: string
  placedAr: string
  /** Minute-of-day the order was placed — drives waiting time and ETA. */
  placedMin: number
  /** Set when a tea boy claims the order. */
  acceptedBy?: string
  acceptedByAr?: string
  acceptedInitials?: string
  acceptedAtMin?: number
  /** Promised minutes from acceptance; the requester sees this as an ETA. */
  etaMinutes?: number
  deliveredAtMin?: number
}

const SEED_ORDERS: CafeteriaOrder[] = [
  {
    id: "o1", ref: "CF-2418", lines: [{ itemId: "m-arabic-coffee", qty: 6 }, { itemId: "m-dates", qty: 2 }],
    locationId: "loc-hq-boardroom", slotId: "1030", note: "Board meeting — please deliver before the session starts.",
    status: "Accepted", by: "Khalid Al-Saadi", byAr: "خالد السعدي", initials: "KS",
    placed: "Today · 09:12", placedAr: "اليوم · 09:12", placedMin: 552,
    acceptedBy: "Rashid Karim", acceptedByAr: "راشد كريم", acceptedInitials: "RK",
    acceptedAtMin: 558, etaMinutes: 15,
  },
  {
    id: "o2", ref: "CF-2417", lines: [{ itemId: "m-tea", qty: 1, sugar: "light" }],
    locationId: "loc-hq-14", slotId: "now",
    status: "Delivered", by: "Khalid Al-Saadi", byAr: "خالد السعدي", initials: "KS",
    placed: "Today · 08:05", placedAr: "اليوم · 08:05", placedMin: 485,
    acceptedBy: "Rashid Karim", acceptedByAr: "راشد كريم", acceptedInitials: "RK",
    acceptedAtMin: 488, etaMinutes: 10, deliveredAtMin: 499,
  },
  {
    id: "o3", ref: "CF-2415", lines: [{ itemId: "m-lunch", qty: 3 }, { itemId: "m-water", qty: 3 }],
    locationId: "loc-t2-ops", slotId: "1200",
    status: "Received", by: "Noura Al-Qahtani", byAr: "نورة القحطاني", initials: "NQ",
    placed: "Today · 09:40", placedAr: "اليوم · 09:40", placedMin: 580,
  },
  {
    id: "o4", ref: "CF-2409", lines: [{ itemId: "m-americano", qty: 2 }, { itemId: "m-pastry", qty: 4 }],
    locationId: "loc-hq-lounge", slotId: "0930",
    status: "Received", by: "Saud Al-Dosari", byAr: "سعود الدوسري", initials: "SD",
    placed: "Today · 08:58", placedAr: "اليوم · 08:58", placedMin: 538,
  },
  {
    id: "o5", ref: "CF-2402", lines: [{ itemId: "m-fresh-juice", qty: 2 }],
    locationId: "loc-mcc", slotId: "1400",
    status: "Cancelled", by: "Khalid Al-Saadi", byAr: "خالد السعدي", initials: "KS",
    placed: "Yesterday · 13:20", placedAr: "أمس · 13:20", placedMin: 800,
  },
]

/** The signed-in employee, so "my orders" can be separated from the queue. */
export const ME = "Khalid Al-Saadi"

// ── reactive store ───────────────────────────────────────────────────────────
/** Baseline "now" for the seeded data (10:05), as a minute of the day. */
export const NOW_MIN = 605
/** Real elapsed time since the page loaded, so waiting times and ETAs tick. */
const BOOT = Date.now()
export const nowMin = () => NOW_MIN + Math.floor((Date.now() - BOOT) / 60000)
/** Seconds within the current minute — lets a countdown feel alive. */
export const nowSec = () => Math.floor((Date.now() - BOOT) / 1000)

/** Re-renders on a timer so elapsed time on screen stays honest. */
export function useNow(everyMs = 10000) {
  const [, tick] = React.useReducer((n: number) => n + 1, 0)
  React.useEffect(() => {
    const h = window.setInterval(tick, everyMs)
    return () => window.clearInterval(h)
  }, [everyMs])
  return nowMin()
}
export const hhmm = (min: number) => {
  const m = ((min % 1440) + 1440) % 1440
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`
}

// ── service staff (the tea boys) ─────────────────────────────────────────────
export type Staff = {
  id: string
  name: string
  nameAr: string
  initials: string
  /** Location ids this person covers; empty means everywhere. */
  covers: string[]
  onShift: boolean
}

let staff: Staff[] = [
  { id: "s-rashid", name: "Rashid Karim", nameAr: "راشد كريم", initials: "RK", covers: ["loc-hq-14", "loc-hq-13", "loc-hq-12", "loc-hq-boardroom", "loc-hq-majlis",
    "loc-hq-riyadh-room", "loc-hq-jeddah-room", "loc-hq-training", "loc-hq-huddle-a",
    "loc-hq-huddle-b", "loc-hq-dammam-room", "loc-hq-lounge", "loc-hq-reception"], onShift: true },
  { id: "s-imran", name: "Imran Hussain", nameAr: "عمران حسين", initials: "IH", covers: ["loc-t1-ops", "loc-t1-lounge", "loc-t2-ops", "loc-t2-lounge", "loc-t2-meeting", "loc-mcc", "loc-crew"], onShift: true },
  { id: "s-bilal", name: "Bilal Ahmed", nameAr: "بلال أحمد", initials: "BA", covers: [], onShift: false },
]

/** Who is signed in to the tea-boy app. Null until they pick themselves. */
let signedIn: string | null = null

// ── reactive store ───────────────────────────────────────────────────────────
let orders: CafeteriaOrder[] = SEED_ORDERS
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l) }

// ── the menu and the places, as configuration ────────────────────────────────
/** Both lists are administered under Configuration → Cafeteria menu & places.
 *  They are exported as live bindings, so every screen picks up an edit. */
export function useMenu(): MenuItem[] {
  return React.useSyncExternalStore(subscribe, () => menu)
}
export function useLocations(): DeliveryLocation[] {
  return React.useSyncExternalStore(subscribe, () => locations)
}
export const getMenuItem = (id: string) => menu.find((m) => m.id === id)
export const getLocation = (id: string) => locations.find((l) => l.id === id)

export const newMenuItemId = (name: string) =>
  `m-${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || Date.now().toString(36)}`
export const newLocationId = (name: string) =>
  `loc-${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || Date.now().toString(36)}`

export function addMenuItem(item: MenuItem) { menu = [...menu, item]; emit() }
export function updateMenuItem(id: string, patch: Partial<MenuItem>) {
  menu = menu.map((m) => (m.id === id ? { ...m, ...patch } : m)); emit()
}
export function removeMenuItem(id: string) { menu = menu.filter((m) => m.id !== id); emit() }

export function addLocation(loc: DeliveryLocation) { locations = [...locations, loc]; emit() }
export function updateLocation(id: string, patch: Partial<DeliveryLocation>) {
  locations = locations.map((l) => (l.id === id ? { ...l, ...patch } : l)); emit()
}
export function removeLocation(id: string) { locations = locations.filter((l) => l.id !== id); emit() }

/** The sites locations are grouped under — itself a small master list. */
export const sites = () => [...new Set(locations.map((l) => l.site))]

/** Is this item orderable to that place? An item with no scope is served
 *  everywhere, which keeps the seeded data and any import valid by default. */
export function servesAt(item: MenuItem, location: DeliveryLocation | undefined): boolean {
  if (!location) return true
  if (!item.servedScope || item.servedScope === "all") return true
  if (item.servedScope === "sites") return (item.servedSites ?? []).includes(location.site)
  return (item.servedPlaces ?? []).includes(location.id)
}

/** How many of these items reach that place — for the places list. */
export const itemsServedAt = (location: DeliveryLocation) =>
  menu.filter((m) => m.available && servesAt(m, location))


export function useOrders(): CafeteriaOrder[] {
  return React.useSyncExternalStore(subscribe, () => orders)
}
export const useStaff = () => React.useSyncExternalStore(subscribe, () => staff)
export const useSignedInStaff = () =>
  React.useSyncExternalStore(subscribe, () => signedIn)
export const staffById = (id: string | null) => staff.find((s) => s.id === id) ?? null

export function signIn(id: string) { signedIn = id; emit(); logCafeteria("signed in", staffById(id)?.name ?? id) }
export function signOut() {
  const who = staffById(signedIn)
  /** Shift handover — anything still accepted goes back to the queue. */
  if (who) {
    const returned = orders.filter((o) => o.status === "Accepted" && o.acceptedBy === who.name)
    if (returned.length) {
      orders = orders.map((o) =>
        o.status === "Accepted" && o.acceptedBy === who.name
          ? { ...o, status: "Received" as OrderStatus, acceptedBy: undefined, acceptedByAr: undefined, acceptedInitials: undefined, acceptedAtMin: undefined, etaMinutes: undefined }
          : o)
      logCafeteria("handover", `${returned.length} order(s) returned to the queue`)
    }
    logCafeteria("signed out", who.name)
  }
  signedIn = null
  emit()
}
export function setOnShift(id: string, on: boolean) {
  staff = staff.map((s) => (s.id === id ? { ...s, onShift: on } : s))
  emit()
  logCafeteria(on ? "on shift" : "off shift", staffById(id)?.name ?? id)
}

export function addOrder(o: CafeteriaOrder) { orders = [o, ...orders]; emit(); logCafeteria("placed", o.ref) }

/** Claim an order. Returns false if someone else got there first. */
export function acceptOrder(id: string, staffId: string, etaMinutes: number): boolean {
  const o = orders.find((x) => x.id === id)
  const who = staffById(staffId)
  if (!o || !who || o.status !== "Received") return false
  orders = orders.map((x) => (x.id === id ? {
    ...x, status: "Accepted" as OrderStatus,
    acceptedBy: who.name, acceptedByAr: who.nameAr, acceptedInitials: who.initials,
    acceptedAtMin: nowMin(), etaMinutes,
  } : x))
  emit()
  logCafeteria("accepted", `${o.ref} · ETA ${etaMinutes} min`, who.name)
  return true
}

export function markDelivered(id: string) {
  const o = orders.find((x) => x.id === id)
  orders = orders.map((x) => (x.id === id ? { ...x, status: "Delivered" as OrderStatus, deliveredAtMin: nowMin() } : x))
  emit()
  if (o) logCafeteria("delivered", o.ref, o.acceptedBy)
}

/** Nothing is ever removed — a cancelled order stays in the list. */
export function setOrderStatus(id: string, status: OrderStatus) {
  const o = orders.find((x) => x.id === id)
  orders = orders.map((x) => (x.id === id ? { ...x, status } : x))
  emit()
  if (o) logCafeteria(status === "Cancelled" ? "cancelled" : "status", `${o.ref} → ${status}`)
}

export const newOrderId = () => `o-${Date.now().toString(36)}`
export const newOrderRef = () => `CF-${2419 + orders.filter((o) => o.ref.startsWith("CF-")).length}`

export const itemById = (id: string) => menu.find((m) => m.id === id)
export const locationById = (id: string) => locations.find((l) => l.id === id)
export const slotById = (id: string) => slots.find((s) => s.id === id)

// ── derived helpers ──────────────────────────────────────────────────────────
/** How long an unaccepted order has been waiting. */
export const waitingMin = (o: CafeteriaOrder) => Math.max(0, nowMin() - o.placedMin)

/** Orders unaccepted beyond this are flagged to the supervisor. */
export const ACCEPT_SLA_MIN = 10
export const isOverdueToAccept = (o: CafeteriaOrder) =>
  o.status === "Received" && waitingMin(o) > ACCEPT_SLA_MIN

/** Promised delivery time, as a minute of day. */
export const etaMin = (o: CafeteriaOrder) =>
  o.acceptedAtMin != null && o.etaMinutes != null ? o.acceptedAtMin + o.etaMinutes : null
export const isLate = (o: CafeteriaOrder) => {
  const e = etaMin(o)
  return o.status === "Accepted" && e != null && nowMin() > e
}
/** Minutes still to wait — negative once the promised time has passed. */
export const minutesUntil = (o: CafeteriaOrder) => {
  const e = etaMin(o)
  return e == null ? null : e - nowMin()
}

/** A sensible ETA to pre-fill: base + per-item + a little for the terminals. */
export function suggestEta(o: CafeteriaOrder): number {
  const items = o.lines.reduce((n, l) => n + l.qty, 0)
  const loc = locationById(o.locationId)
  const far = loc ? loc.site !== "Headquarters" : false
  const raw = 5 + Math.ceil(items / 3) * 5 + (far ? 10 : 0)
  return Math.min(30, Math.max(5, Math.round(raw / 5) * 5))
}

/** The last order this person placed, for "order again". */
export const lastOrderOf = (who: string) =>
  orders.find((o) => o.by === who && o.status !== "Cancelled") ?? null

// ── audit ────────────────────────────────────────────────────────────────────
/** Local audit trail. In the Mendix build these events are emitted to the
 *  shared Audit module instead of being held inside the feature. */
export type CafeteriaAudit = { id: string; action: string; target: string; who: string; time: string }
let auditLog: CafeteriaAudit[] = [
  { id: "a1", action: "delivered", target: "CF-2417", who: "Rashid Karim", time: "08:19" },
  { id: "a2", action: "accepted", target: "CF-2418 · ETA 15 min", who: "Rashid Karim", time: "09:18" },
  { id: "a3", action: "placed", target: "CF-2418", who: "Khalid A.", time: "09:12" },
]
export const useCafeteriaAudit = () => React.useSyncExternalStore(subscribe, () => auditLog)
function logCafeteria(action: string, target: string, who = "Khalid A.") {
  auditLog = [{ id: `a-${Date.now().toString(36)}`, action, target, who, time: hhmm(nowMin()) }, ...auditLog]
}

// ── my preferences ───────────────────────────────────────────────────────────
/** What an employee wants by default, so ordering is one tap most days. */
export type Prefs = {
  /** Applied to every hot drink added, unless changed on the item. */
  sugar: SugarLevel
  /** Pre-selected delivery point. */
  locationId: string
  /** Saved orders — reorder one in a tap. Up to MAX_USUALS of them. */
  usuals: SavedUsual[]
}

/** A basket someone kept, under a name they chose. */
export type SavedUsual = {
  id: string
  name: string
  lines: OrderLine[]
  note?: string
}

/** Four is enough to cover a morning drink, a desk snack and two rounds for
 *  the room, without turning the top of the page into a list. */
export const MAX_USUALS = 4

let prefs: Prefs = {
  sugar: "light",
  locationId: "loc-hq-14",
  usuals: [
    { id: "u1", name: "Morning karak",
      lines: [{ itemId: "m-karak", qty: 1, sugar: "light" }, { itemId: "m-dates", qty: 1 }] },
    { id: "u2", name: "Team round · 6",
      lines: [{ itemId: "m-arabic-coffee", qty: 3 }, { itemId: "m-tea", qty: 3, sugar: "medium" }, { itemId: "m-dates", qty: 2 }],
      note: "Boardroom — leave on the side table" },
  ],
}

export const usePrefs = () => React.useSyncExternalStore(subscribe, () => prefs)
export const getPrefs = () => prefs

export function setPrefs(patch: Partial<Prefs>) {
  prefs = { ...prefs, ...patch }
  emit()
  logCafeteria("preferences updated", Object.keys(patch).join(", "))
}
export const newUsualId = () => `u-${Date.now().toString(36)}`

/** Keep the current basket under a name. Returns false when the shelf is full. */
export function saveUsual(name: string, lines: OrderLine[], note?: string): boolean {
  if (!lines.length || prefs.usuals.length >= MAX_USUALS) return false
  prefs = { ...prefs, usuals: [...prefs.usuals, { id: newUsualId(), name, lines, note }] }
  emit()
  logCafeteria("usual saved", `${name} · ${lines.length} item(s)`)
  return true
}
/** Overwrite one of the saved orders with what is in the basket now. */
export function replaceUsual(id: string, lines: OrderLine[], note?: string) {
  prefs = { ...prefs, usuals: prefs.usuals.map((u) => (u.id === id ? { ...u, lines, note } : u)) }
  emit()
  logCafeteria("usual replaced", `${prefs.usuals.find((u) => u.id === id)?.name ?? id}`)
}
export function renameUsual(id: string, name: string) {
  prefs = { ...prefs, usuals: prefs.usuals.map((u) => (u.id === id ? { ...u, name } : u)) }
  emit()
  logCafeteria("usual renamed", name)
}
export function removeUsual(id: string) {
  const gone = prefs.usuals.find((u) => u.id === id)
  prefs = { ...prefs, usuals: prefs.usuals.filter((u) => u.id !== id) }
  emit()
  logCafeteria("usual removed", gone?.name ?? id)
}
