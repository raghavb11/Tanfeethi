import * as React from "react"

/** Role model mirroring the Mendix design: one thin user role per feature
 *  (mapping to that module's Admin module role), a base Employee role, a
 *  Beta Tester role that unlocks separate beta pages, and a Portal Admin
 *  super-role. A user holds MANY roles; effective access is the union. */

export type RoleKind = "base" | "feature" | "beta" | "super"
export type RoleDef = {
  id: string
  name: string; nameAr: string
  desc: string; descAr: string
  kind: RoleKind
  /** Which portal feature this role administers (feature roles only). */
  feature?: string; featureAr?: string
  color: string
}

export const ROLE_DEFS: RoleDef[] = [
  { id: "employee", name: "Employee", nameAr: "موظف", kind: "base", color: "#8a8a8a", desc: "Base access — view all published content, submit requests, participate.", descAr: "الوصول الأساسي — عرض المحتوى المنشور وتقديم الطلبات والمشاركة." },
  { id: "news-admin", name: "News Admin", nameAr: "مدير الأخبار", kind: "feature", feature: "News", featureAr: "الأخبار", color: "#c8794f", desc: "Create, edit and publish news articles.", descAr: "إنشاء وتحرير ونشر الأخبار." },
  { id: "announce-admin", name: "Announcements Admin", nameAr: "مدير الإعلانات", kind: "feature", feature: "Announcements", featureAr: "الإعلانات", color: "#c99a3a", desc: "Publish and pin company announcements.", descAr: "نشر وتثبيت إعلانات الشركة." },
  { id: "events-admin", name: "Events Admin", nameAr: "مدير الفعاليات", kind: "feature", feature: "Events", featureAr: "الفعاليات", color: "#3f9d94", desc: "Create events and manage registrations.", descAr: "إنشاء الفعاليات وإدارة التسجيل." },
  { id: "survey-admin", name: "Survey Admin", nameAr: "مدير الاستبيانات", kind: "feature", feature: "Surveys", featureAr: "الاستبيانات", color: "#5b8fce", desc: "Build surveys & polls and view results.", descAr: "إنشاء الاستبيانات وعرض النتائج." },
  { id: "policy-admin", name: "Policy Admin", nameAr: "مدير السياسات", kind: "feature", feature: "Policies", featureAr: "السياسات", color: "#5f9d52", desc: "Author policies and track acknowledgements.", descAr: "إعداد السياسات وتتبّع الإقرارات." },
  { id: "faq-admin", name: "FAQ Admin", nameAr: "مدير الأسئلة الشائعة", kind: "feature", feature: "FAQs", featureAr: "الأسئلة الشائعة", color: "#8e6bc9", desc: "Manage FAQs, topics and improvement feedback.", descAr: "إدارة الأسئلة والمواضيع وملاحظات التحسين." },
  { id: "docs-admin", name: "Document Admin", nameAr: "مدير المستندات", kind: "feature", feature: "Documents", featureAr: "المستندات", color: "#8e4c58", desc: "Manage the document library, folders and archiving.", descAr: "إدارة مكتبة المستندات والمجلدات والأرشفة." },
  { id: "community-mod", name: "Community Moderator", nameAr: "مشرف المجتمع", kind: "feature", feature: "Community", featureAr: "المجتمع", color: "#b56576", desc: "Moderate posts, comments and polls.", descAr: "الإشراف على المنشورات والتعليقات والتصويتات." },
  { id: "beta", name: "Beta Tester", nameAr: "مختبر تجريبي", kind: "beta", color: "#7c5cd6", desc: "Access to separate beta pages for features under test. Existing pages are untouched.", descAr: "الوصول إلى صفحات تجريبية منفصلة للميزات قيد الاختبار. الصفحات الحالية لا تتأثر." },
  { id: "portal-admin", name: "Portal Admin", nameAr: "مدير البوابة", kind: "super", color: "#1f6f8b", desc: "All feature admin rights + roles, notifications and audit logs.", descAr: "جميع صلاحيات الإدارة + الأدوار والإشعارات وسجلات التدقيق." },
]

export const roleById = (id: string) => ROLE_DEFS.find((r) => r.id === id)

export type PortalUser = {
  id: string
  name: string; nameAr: string
  initials: string
  dept: string; deptAr: string
  email: string
  roles: string[]
  /** Account state — defaults to Active when omitted. */
  status?: "Active" | "Inactive"
}

const SEED_USERS: PortalUser[] = [
  { id: "u-khalid", name: "Khalid Al-Saadi", nameAr: "خالد السعدي", initials: "KS", dept: "Business Operations", deptAr: "العمليات التجارية", email: "khalid@altanfeethi.com.sa", roles: ["employee", "portal-admin"] },
  { id: "u-sara", name: "Sara Al-Mutairi", nameAr: "سارة المطيري", initials: "SM", dept: "Operations", deptAr: "العمليات", email: "sara@altanfeethi.com.sa", roles: ["employee"] },
  { id: "u-layan", name: "Layan Al Marwani", nameAr: "ليان المرواني", initials: "LM", dept: "Digital", deptAr: "الرقمية", email: "layan@altanfeethi.com.sa", roles: ["employee", "survey-admin", "beta"] },
  { id: "u-mohammad", name: "Mohammad Iqbal", nameAr: "محمد إقبال", initials: "MI", dept: "IT & Security", deptAr: "تقنية المعلومات", email: "mohammad@altanfeethi.com.sa", roles: ["employee", "docs-admin"] },
  { id: "u-ahmed", name: "Ahmed Hassan", nameAr: "أحمد حسن", initials: "AH", dept: "People Ops", deptAr: "الموارد البشرية", email: "ahmed@altanfeethi.com.sa", roles: ["employee", "policy-admin"] },
  { id: "u-noura", name: "Noura Saleh", nameAr: "نورة صالح", initials: "NS", dept: "Legal & Compliance", deptAr: "القانونية", email: "noura@altanfeethi.com.sa", roles: ["employee", "faq-admin"] },
  { id: "u-fahad", name: "Fahad Al-Qahtani", nameAr: "فهد القحطاني", initials: "FQ", dept: "Commercial", deptAr: "التجاري", email: "fahad@altanfeethi.com.sa", roles: ["employee"] },
  { id: "u-reem", name: "Reem Al-Dosari", nameAr: "ريم الدوسري", initials: "RD", dept: "Ground Services", deptAr: "الخدمات الأرضية", email: "reem@altanfeethi.com.sa", roles: ["employee", "community-mod"] },
  { id: "u-omar", name: "Omar Basha", nameAr: "عمر باشا", initials: "OB", dept: "Finance", deptAr: "المالية", email: "omar@altanfeethi.com.sa", roles: ["employee"] },
]

// ── permission groups ────────────────────────────────────────────────────────
/** A permission group bundles roles; members inherit every role in the group.
 *  Group-derived roles cannot be revoked individually — only by editing the
 *  group or removing the member from it. */
export type PermissionGroup = {
  id: string
  name: string; nameAr: string
  desc: string; descAr: string
  roles: string[]
  members: string[]
  /** userId → the date that user was added to this group. */
  memberSince: Record<string, { en: string; ar: string }>
  updated: string; updatedAr: string
}

/** "Today" for the prototype — stamped on newly created groups. */
export const TODAY_LABEL = "Aug 12, 2026"
export const TODAY_LABEL_AR = "١٢ أغسطس ٢٠٢٦"

const SEED_GROUPS: PermissionGroup[] = [
  { id: "g-content", name: "Content Team", nameAr: "فريق المحتوى", desc: "Owns news and announcements across the portal.", descAr: "مسؤول عن الأخبار والإعلانات في البوابة.", roles: ["news-admin", "announce-admin"], members: ["u-sara"], memberSince: { "u-sara": { en: "Feb 2, 2026", ar: "٢ فبراير ٢٠٢٦" } }, updated: "Aug 2, 2026", updatedAr: "٢ أغسطس ٢٠٢٦" },
  { id: "g-engagement", name: "Engagement Team", nameAr: "فريق التفاعل", desc: "Runs events and employee engagement programs.", descAr: "يدير الفعاليات وبرامج تفاعل الموظفين.", roles: ["events-admin"], members: ["u-ahmed"], memberSince: { "u-ahmed": { en: "Jan 10, 2026", ar: "١٠ يناير ٢٠٢٦" } }, updated: "Jul 21, 2026", updatedAr: "٢١ يوليو ٢٠٢٦" },
  { id: "g-beta1", name: "Beta Wave 1", nameAr: "الدفعة التجريبية 1", desc: "First cohort testing the new beta pages.", descAr: "الدفعة الأولى لاختبار الصفحات التجريبية الجديدة.", roles: ["beta"], members: ["u-fahad", "u-reem"], memberSince: { "u-fahad": { en: "Aug 5, 2026", ar: "٥ أغسطس ٢٠٢٦" }, "u-reem": { en: "Aug 10, 2026", ar: "١٠ أغسطس ٢٠٢٦" } }, updated: "Aug 10, 2026", updatedAr: "١٠ أغسطس ٢٠٢٦" },
]

/** Beta features currently gated behind the Beta Tester role's separate pages. */
export const BETA_FEATURES = [
  { id: "bf1", name: "Survey Builder 2.0", nameAr: "منشئ الاستبيانات 2.0", area: "Surveys", areaAr: "الاستبيانات", since: "Aug 5, 2026", sinceAr: "٥ أغسطس ٢٠٢٦" },
  { id: "bf2", name: "AI Assistant panel", nameAr: "لوحة المساعد الذكي", area: "Portal", areaAr: "البوابة", since: "Jul 28, 2026", sinceAr: "٢٨ يوليو ٢٠٢٦" },
  { id: "bf3", name: "Mobile check-in (geofenced)", nameAr: "تسجيل الحضور عبر الجوال", area: "Employee Center", areaAr: "مركز الموظف", since: "Aug 10, 2026", sinceAr: "١٠ أغسطس ٢٠٢٦" },
]

// ── reactive stores ──────────────────────────────────────────────────────────
let users: PortalUser[] = SEED_USERS
let groups: PermissionGroup[] = SEED_GROUPS
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l) }

export function usePortalUsers(): PortalUser[] {
  return React.useSyncExternalStore(subscribe, () => users)
}
export function usePermissionGroups(): PermissionGroup[] {
  return React.useSyncExternalStore(subscribe, () => groups)
}
export const groupById = (id: string) => groups.find((g) => g.id === id)

/** Toggle a DIRECT role on a user. The base Employee role can never be removed,
 *  and roles inherited from a permission group are not touched here. */
export function toggleUserRole(userId: string, roleId: string) {
  if (roleId === "employee") return
  users = users.map((u) => (u.id === userId
    ? { ...u, roles: u.roles.includes(roleId) ? u.roles.filter((r) => r !== roleId) : [...u.roles, roleId] }
    : u))
  emit()
}

export function addGroup(g: PermissionGroup) { groups = [...groups, g]; emit() }
export function updateGroup(id: string, patch: Partial<PermissionGroup>) {
  groups = groups.map((g) => (g.id === id ? { ...g, ...patch } : g))
  emit()
}
export function deleteGroup(id: string) { groups = groups.filter((g) => g.id !== id); emit() }
export function toggleGroupMember(groupId: string, userId: string) {
  groups = groups.map((g) => {
    if (g.id !== groupId) return g
    const since = { ...g.memberSince }
    if (g.members.includes(userId)) {
      delete since[userId]
      return { ...g, members: g.members.filter((m) => m !== userId), memberSince: since }
    }
    since[userId] = { en: TODAY_LABEL, ar: TODAY_LABEL_AR }
    return { ...g, members: [...g.members, userId], memberSince: since }
  })
  emit()
}
/** Add several users to a group at once, stamped with today's date. */
export function addGroupMembers(groupId: string, userIds: string[]) {
  groups = groups.map((g) => {
    if (g.id !== groupId) return g
    const since = { ...g.memberSince }
    const add = userIds.filter((id) => !g.members.includes(id))
    add.forEach((id) => { since[id] = { en: TODAY_LABEL, ar: TODAY_LABEL_AR } })
    return { ...g, members: [...g.members, ...add], memberSince: since }
  })
  emit()
}
export const newGroupId = () => `g-${Date.now().toString(36)}`

/** Map of roleId → names of the groups that grant it to this user. */
export function rolesViaGroups(all: PermissionGroup[], userId: string, isAr: boolean): Map<string, string[]> {
  const out = new Map<string, string[]>()
  for (const g of all) {
    if (!g.members.includes(userId)) continue
    for (const r of g.roles) out.set(r, [...(out.get(r) ?? []), isAr ? g.nameAr : g.name])
  }
  return out
}

/** Effective roles = direct roles ∪ group-derived roles. */
export function effectiveRoles(u: PortalUser, all: PermissionGroup[]): string[] {
  const set = new Set(u.roles)
  for (const g of all) if (g.members.includes(u.id)) g.roles.forEach((r) => set.add(r))
  return ROLE_DEFS.filter((r) => set.has(r.id)).map((r) => r.id)
}

export const roleMemberCount = (list: PortalUser[], allGroups: PermissionGroup[], roleId: string) =>
  list.filter((u) => effectiveRoles(u, allGroups).includes(roleId)).length
