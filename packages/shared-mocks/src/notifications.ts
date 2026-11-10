import * as React from "react"

/** Which icon a notification shows (Figma 2146:4876). */
export type NotificationKind =
  | "leave" | "expense" | "meeting" | "recognition" | "shift" | "payslip" | "course" | "system"
/** "From" column / category filter on the Notification History page (4693:23706). */
export type NotificationSource = "system" | "hr" | "finance" | "meetings" | "learning"

export type Notification = {
  id: string
  title: string; titleAr: string
  body: string; bodyAr: string
  time: string; timeAr: string
  /** yyyy/mm/dd, as the history table prints it */
  date: string
  category: NotificationKind
  source: NotificationSource
  unread: boolean
  /** where clicking the notification goes */
  to?: string
  /** older items live only in the history log, not the bell dropdown */
  archived?: boolean
}

export const notificationSources: { id: NotificationSource; en: string; ar: string }[] = [
  { id: "system", en: "System Notifications", ar: "تنبيهات النظام" },
  { id: "hr", en: "Human resources", ar: "الموارد البشرية" },
  { id: "finance", en: "Finance", ar: "المالية" },
  { id: "meetings", en: "Meetings", ar: "الاجتماعات" },
  { id: "learning", en: "Learning", ar: "التعلم" },
]

const SYSTEM_HISTORY: [string, string, string, string, string][] = [
  ["s1", "Scheduled maintenance tonight", "صيانة مجدولة الليلة", "The portal will be unavailable from 01:00 to 03:00.", "ستكون البوابة غير متاحة من ٠١:٠٠ إلى ٠٣:٠٠."],
  ["s2", "Password expires in 7 days", "كلمة المرور تنتهي خلال ٧ أيام", "Update your password from Settings to keep access.", "حدّث كلمة المرور من الإعدادات للحفاظ على الوصول."],
  ["s3", "New sign-in from a new device", "تسجيل دخول من جهاز جديد", "Chrome on Windows · Riyadh. Not you? Contact IT.", "Chrome على Windows · الرياض. لست أنت؟ تواصل مع التقنية."],
  ["s4", "Two-step verification enabled", "تم تفعيل التحقق بخطوتين", "Your account is now protected with a second factor.", "حسابك الآن محمي بعامل تحقق إضافي."],
  ["s5", "Portal updated to version 2.4", "تم تحديث البوابة إلى الإصدار 2.4", "New: employee card search and the notification log.", "جديد: البحث عن بطاقة الموظف وسجل التنبيهات."],
  ["s6", "Storage limit almost reached", "اقتربت مساحة التخزين من الحد", "Your document space is 90% full.", "مساحة مستنداتك ممتلئة بنسبة ٩٠٪."],
]

const SEED: Notification[] = [
  // ── the bell dropdown (Figma 2146:4876, in order) ──
  {
    id: "n1", category: "leave", source: "hr", unread: true, to: "/leave", date: "2026/09/15",
    title: "Your leave request was approved", titleAr: "تمت الموافقة على طلب إجازتك",
    body: "12 – 16 May · Annual leave, 5 days — approved by Ahmed Mohammed.", bodyAr: "١٢ – ١٦ مايو · إجازة سنوية ٥ أيام — اعتمدها أحمد محمد.",
    time: "4 min ago", timeAr: "قبل ٤ د",
  },
  {
    id: "n2", category: "expense", source: "finance", unread: true, to: "/employee", date: "2026/09/15",
    title: "Expense awaiting document", titleAr: "مصروف بانتظار مستند",
    body: "Riyadh hotel invoice SAR 2,480 needs a photo of the receipt.", bodyAr: "فاتورة فندق الرياض ٢٫٤٨٠ ر.س تحتاج صورة الإيصال.",
    time: "22 min ago", timeAr: "قبل ٢٢ د",
  },
  {
    id: "n3", category: "meeting", source: "meetings", unread: false, to: "/calendar", date: "2026/09/15",
    title: "Reminder: Wave 2 meeting", titleAr: "تذكير: اجتماع الموجة الثانية",
    body: "Today 10:00 · HQ room, F14, with 12 participants.", bodyAr: "اليوم ١٠:٠٠ · قاعة المقر ط١٤ مع ١٢ مشاركًا.",
    time: "40 min ago", timeAr: "قبل ٤٠ د",
  },
  {
    id: "n4", category: "recognition", source: "hr", unread: false, to: "/employee", date: "2026/09/15",
    title: "New recognition from Sara Al-Mutairi", titleAr: "تقدير جديد من سارة المطيري",
    body: "\"Great leadership managing the Q2 operations review.\"", bodyAr: "\"قيادة رائعة في إدارة مراجعة عمليات الربع الثاني.\"",
    time: "1 hour ago", timeAr: "قبل ساعة",
  },
  {
    id: "n5", category: "shift", source: "hr", unread: false, to: "/attendance", date: "2026/09/15",
    title: "Shift update", titleAr: "تحديث المناوبة",
    body: "Thursday is now a client visit · Financial Centre 10:00 – 18:00.", bodyAr: "الخميس أصبح زيارة عميل · المركز المالي ١٠:٠٠ – ١٨:٠٠.",
    time: "3 h ago", timeAr: "قبل ٣ س",
  },
  {
    id: "n6", category: "payslip", source: "finance", unread: false, to: "/payslip", date: "2026/09/14",
    title: "Payslip ready", titleAr: "كشف الراتب جاهز",
    body: "April salary SAR 18,400 · deposited on 27 May.", bodyAr: "راتب أبريل ١٨٫٤٠٠ ر.س · يودع في ٢٧ مايو.",
    time: "Yesterday", timeAr: "أمس",
  },
  {
    id: "n7", category: "course", source: "learning", unread: false, to: "/learning", date: "2026/09/14",
    title: "Suggested course for you", titleAr: "دورة تدريبية مقترحة لك",
    body: "Executive portfolio management · starts 9 June, 4 sessions.", bodyAr: "إدارة المحافظ التنفيذية · تبدأ ٩ يونيو، ٤ جلسات.",
    time: "Yesterday", timeAr: "أمس",
  },
  // ── older system notices — history log only ──
  ...SYSTEM_HISTORY.map(([id, title, titleAr, body, bodyAr]): Notification => ({
    id, title, titleAr, body, bodyAr,
    category: "system", source: "system", unread: false, archived: true, date: "2026/09/15",
    time: "15 Sep", timeAr: "١٥ سبتمبر",
  })),
]

/** The bell and the history page read this. Anything in the portal can add to
 *  it — issuing a voucher, for one — so the seed is only a starting point. */
let items: Notification[] = [...SEED]

const listeners = new Set<() => void>()
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l) } }
const emit = () => listeners.forEach((l) => l())

export const useNotifications = () =>
  React.useSyncExternalStore(subscribe, () => items)

function today() {
  const d = new Date()
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`
}

export function pushNotification(n: {
  title: string; titleAr: string
  body: string; bodyAr: string
  category?: NotificationKind
  source?: NotificationSource
  to?: string
}) {
  items = [{
    id: `n-${Date.now().toString(36)}`,
    title: n.title, titleAr: n.titleAr,
    body: n.body, bodyAr: n.bodyAr,
    time: "Now", timeAr: "الآن",
    date: today(),
    category: n.category ?? "system",
    source: n.source ?? "system",
    unread: true,
    to: n.to,
  }, ...items]
  emit()
}

export function markNotificationRead(id: string) {
  items = items.map((n) => (n.id === id && n.unread ? { ...n, unread: false } : n))
  emit()
}

export function markAllNotificationsRead() {
  items = items.map((n) => (n.unread ? { ...n, unread: false } : n))
  emit()
}

export function removeNotification(id: string) {
  items = items.filter((n) => n.id !== id)
  emit()
}

/** Kept for anything still reading the plain list. */
export const notifications = SEED
