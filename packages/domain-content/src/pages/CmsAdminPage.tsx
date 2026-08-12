import * as React from "react"
import { Badge, Button, Card } from "@reach/shared-ui"
import { useShell } from "@reach/shell-context"
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FolderOpen,
  Gauge,
  Link2,
  Megaphone,
  Newspaper,
  ScrollText,
  ShieldCheck,
  Users,
} from "lucide-react"

import { PageHeader, StatCard } from "./_ui"

const MODULES = [
  { name: "News & Announcements", nameAr: "الأخبار والإعلانات", icon: Newspaper, count: 128, draft: 3 },
  { name: "Internal Circulars", nameAr: "التعاميم الداخلية", icon: Megaphone, count: 142, draft: 1 },
  { name: "Events", nameAr: "الفعاليات", icon: CalendarDays, count: 31, draft: 2 },
  { name: "Surveys & Polls", nameAr: "الاستبيانات", icon: ClipboardList, count: 24, draft: 4 },
  { name: "Policies & FAQs", nameAr: "السياسات", icon: ScrollText, count: 34, draft: 0 },
  { name: "Documents", nameAr: "المستندات", icon: FolderOpen, count: 1284, draft: 0 },
  { name: "Quick Links", nameAr: "روابط سريعة", icon: Link2, count: 24, draft: 0 },
  { name: "Community", nameAr: "المجتمع", icon: Users, count: 340, draft: 0 },
]

const APPROVALS = [
  { title: "Eid Al-Adha holiday schedule", type: "News", by: "HR", age: "2h" },
  { title: "Procurement Approval Matrix v2", type: "Circular", by: "Finance", age: "5h" },
  { title: "Q4 Engagement Survey", type: "Survey", by: "People Ops", age: "1d" },
]

const AUDIT = [
  { who: "Zaid B.", action: "published", what: "Travel & Expense Policy v2.4", age: "1h" },
  { who: "Sara M.", action: "scheduled", what: "Town Hall announcement", age: "3h" },
  { who: "Ahmed H.", action: "archived", what: "Ramadan 2025 circular", age: "6h" },
  { who: "Layan M.", action: "edited", what: "Wajha launch news", age: "1d" },
]

export default function CmsAdminPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        icon={Gauge}
        eyebrow={t("CMS Administration", "إدارة المحتوى")}
        title={t("Content command center", "مركز التحكّم بالمحتوى")}
        desc={t("Manage every content module — approvals, scheduling, audit logs and role-based access.", "أدر كل وحدات المحتوى — الاعتمادات والجدولة وسجلات التدقيق والصلاحيات حسب الدور.")}
        action={<Button size="lg" variant="outline"><ShieldCheck className="size-4" />{t("Roles & access", "الأدوار والصلاحيات")}</Button>}
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Newspaper} value="2,007" label={t("Content items", "عناصر المحتوى")} />
        <StatCard icon={CheckCircle2} value="3" label={t("Pending approval", "بانتظار الاعتماد")} />
        <StatCard icon={CalendarDays} value="8" label={t("Scheduled", "مجدولة")} sub={t("next 7 days", "٧ أيام قادمة")} />
        <StatCard icon={Users} value="12" label={t("Editors", "محرّرون")} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* modules */}
        <div className="lg:col-span-2">
          <h2 className="mb-3 font-heading text-lg font-semibold">{t("Modules", "الوحدات")}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {MODULES.map((m) => (
              <Card key={m.name} className="flex flex-row items-center gap-3 p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><m.icon className="size-5" /></div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{isAr ? m.nameAr : m.name}</div>
                  <div className="text-xs text-muted-foreground">{m.count.toLocaleString()} {t("items", "عنصر")}</div>
                </div>
                {m.draft > 0 && <Badge className="bg-muted text-muted-foreground">{m.draft} {t("draft", "مسودة")}</Badge>}
              </Card>
            ))}
          </div>
        </div>

        {/* right column */}
        <div className="space-y-6">
          <div>
            <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-semibold"><CheckCircle2 className="size-5 text-primary" />{t("Pending approvals", "بانتظار الاعتماد")}</h2>
            <div className="space-y-2">
              {APPROVALS.map((a, i) => (
                <Card key={i} className="p-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">{a.type}</Badge><span>{a.by} · {a.age}</span>
                  </div>
                  <div className="mt-1 text-sm font-medium">{a.title}</div>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" className="h-7">{t("Approve", "اعتماد")}</Button>
                    <Button size="sm" variant="outline" className="h-7">{t("Review", "مراجعة")}</Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-semibold"><ScrollText className="size-5 text-primary" />{t("Audit log", "سجل التدقيق")}</h2>
            <Card className="divide-y divide-border">
              {AUDIT.map((a, i) => (
                <div key={i} className="p-3 text-sm">
                  <span className="font-medium">{a.who}</span>{" "}
                  <span className="text-muted-foreground">{t(a.action, a.action)}</span>{" "}
                  <span>{a.what}</span>
                  <div className="text-xs text-muted-foreground/70">{a.age} {t("ago", "مضت")}</div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
