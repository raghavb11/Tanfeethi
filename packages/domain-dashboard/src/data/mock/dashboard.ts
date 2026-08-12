export const kpis = [
  {
    id: "tasks",
    label: "Open tasks",
    value: "24",
    delta: "+3 vs last week",
    trend: "up" as const,
  },
  {
    id: "requests",
    label: "Pending requests",
    value: "9",
    delta: "SLA healthy",
    trend: "neutral" as const,
  },
  {
    id: "emails",
    label: "Emails",
    value: "12",
    delta: "4 unread today",
    trend: "up" as const,
  },
  {
    id: "projects",
    label: "Projects",
    value: "7",
    delta: "2 at risk",
    trend: "neutral" as const,
  },
]

export const agenda = [
  { id: "1", time: "09:00", title: "Portfolio review", room: "Atlas · L42" },
  { id: "2", time: "11:30", title: "Design sync — Reach rollout", room: "Zoom" },
  { id: "3", time: "14:00", title: "Vendor QBR", room: "Summit · S02" },
  { id: "4", time: "16:30", title: "1:1 — Engineering", room: "Reach · Profile" },
]

export const approvals = [
  {
    id: "a1",
    title: "Approve software purchase",
    titleAr: "الموافقة على شراء برنامج",
    meta: "Design · Figma Enterprise · $24k ARR",
    metaAr: "التصميم · فيجما إنتربرايز · 24 ألف دولار سنوياً",
    due: "Today",
    dueAr: "اليوم",
  },
  {
    id: "a2",
    title: "Sign off headcount plan",
    titleAr: "اعتماد خطة الكوادر الوظيفية",
    meta: "Finance · FY26 Q3",
    metaAr: "المالية · الربع الثالث ٢٠٢٦",
    due: "Tomorrow",
    dueAr: "غداً",
  },
  {
    id: "a3",
    title: "Release comms — policy update",
    titleAr: "إصدار التواصل — تحديث السياسة",
    meta: "People Ops · Internal",
    metaAr: "الموارد البشرية · داخلي",
    due: "Apr 26",
    dueAr: "٢٦ أبريل",
  },
]

export type ActivityFilter = "all" | "team" | "systems"

export const activityFeed = [
  {
    id: "act1",
    actor: "Maya Chen",
    action: "approved access",
    target: "Vault admin (90d)",
    time: "12m ago",
    filter: "team" as const,
  },
  {
    id: "act2",
    actor: "Reach",
    action: "rerouted ticket",
    target: "INC-8891 → Cloud Network",
    time: "26m ago",
    filter: "systems" as const,
  },
  {
    id: "act3",
    actor: "Ahmed Mohammed",
    action: "published summary",
    target: "Exec QBR — Operations",
    time: "1h ago",
    filter: "team" as const,
  },
  {
    id: "act4",
    actor: "Systems",
    action: "opened maintenance",
    target: "Identity sync window",
    time: "2h ago",
    filter: "systems" as const,
  },
]

export const smartSummary =
  "Today’s operating picture is stable with two attention items: a concentrated task load on Maya’s queue and elevated IT backlog in EMEA. Reach recommends delegating two tasks and holding a 15-minute cross-team sync on duplicate comms before 4:00 PM."

export const dashboardChecklist = [
  "Acknowledge anomaly on APAC privileged use",
  "Delegate “API hardening” to Platform pod",
  "Confirm executive readout ships by 17:00",
]

export const displayName = "Khalid"
export const displayNameAr = "خالد"

export const myTickets = [
  {
    id: "t1",
    ticketId: "INC-8891",
    title: "VPN handshake failures · EMEA edge",
    channel: "IT",
    status: "open" as const,
  },
  {
    id: "t2",
    ticketId: "REQ-4402",
    title: "Figma Enterprise renewal · Design",
    channel: "Procurement",
    status: "pending" as const,
  },
  {
    id: "t3",
    ticketId: "HR-112",
    title: "Benefits enrollment · dependent add",
    channel: "People",
    status: "open" as const,
  },
]

export const recentDocuments = [
  { id: "d1", title: "Company directory · FY26", kind: "PDF" },
  { id: "d2", title: "Employee handbook", kind: "Policy" },
  { id: "d3", title: "Security acceptable use", kind: "Compliance" },
]

export const upcomingEvents = [
  { id: "e1", title: "Engineering town hall", titleAr: "اجتماع الهندسة العام", date: "Apr 24", dateAr: "٢٤ أبريل", stripe: "primary" as const },
  { id: "e2", title: "Frisco innovation week", titleAr: "أسبوع الابتكار في فريسكو", date: "Apr 28", dateAr: "٢٨ أبريل", stripe: "muted" as const },
  { id: "e3", title: "People Ops · office hours", titleAr: "الموارد البشرية · ساعات مكتبية", date: "May 2", dateAr: "٢ مايو", stripe: "soft" as const },
]

export const portalAnnouncements = [
  { id: "n1", title: "New parental leave policy effective May 1" },
  { id: "n2", title: "Phishing drill results published in Trust Center" },
]

export const meetingsToday = [
  {
    id: "m1",
    title: "Portfolio review",
    titleAr: "مراجعة المحفظة",
    time: "09:00–10:00",
    joinable: true,
    accent: "primary" as const,
    faces: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=64&h=64&q=80",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=64&h=64&q=80",
    ],
  },
  {
    id: "m2",
    title: "Design sync — Reach rollout",
    titleAr: "مزامنة التصميم — إطلاق ريتش",
    time: "11:30–12:00",
    joinable: true,
    accent: "soft" as const,
    faces: [
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=64&h=64&q=80",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=64&h=64&q=80",
    ],
  },
]

export type QuickLinkIcon = "slack" | "mail" | "calendar" | "drive" | "teams"

export const quickLinks: { id: string; label: string; href: string; icon: QuickLinkIcon; swatch: string }[] = [
  { id: "slack", label: "Slack", href: "#", icon: "slack", swatch: "bg-[#4A154B]" },
  { id: "mail", label: "Mail", href: "#", icon: "mail", swatch: "bg-[#EA4335]" },
  { id: "cal", label: "Calendar", href: "#", icon: "calendar", swatch: "bg-[#34A853]" },
  { id: "drive", label: "Drive", href: "#", icon: "drive", swatch: "bg-[#4285F4]" },
  { id: "teams", label: "Teams", href: "#", icon: "teams", swatch: "bg-[#6264A7]" },
]
