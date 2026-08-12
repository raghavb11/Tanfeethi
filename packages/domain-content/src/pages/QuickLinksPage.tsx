import * as React from "react"
import { Badge, Button, Card } from "@reach/shared-ui"
import { useShell } from "@reach/shell-context"
import {
  BarChart3,
  Briefcase,
  CalendarClock,
  CreditCard,
  ExternalLink,
  GraduationCap,
  Link2,
  Mail,
  Plane,
  Plus,
  ShieldCheck,
  Ticket,
} from "lucide-react"

import { PageHeader, StatCard } from "./_ui"

type QuickLink = {
  id: string
  name: string
  nameAr: string
  desc: string
  icon: typeof Mail
  uses: number
  external?: boolean
}

const LINKS: QuickLink[] = [
  { id: "l1", name: "Outlook / Email", nameAr: "البريد الإلكتروني", desc: "Corporate mail & calendar", icon: Mail, uses: 4820, external: true },
  { id: "l2", name: "Oracle ERP", nameAr: "أوراكل ERP", desc: "Finance & procurement", icon: CreditCard, uses: 1240, external: true },
  { id: "l3", name: "HR Self-Service", nameAr: "الخدمة الذاتية للموظفين", desc: "Leave, payslips, profile", icon: Briefcase, uses: 3110 },
  { id: "l4", name: "Learning Portal", nameAr: "بوابة التعلّم", desc: "Courses & certifications", icon: GraduationCap, uses: 940, external: true },
  { id: "l5", name: "Travel Desk", nameAr: "مكتب السفر", desc: "Book flights & hotels", icon: Plane, uses: 612 },
  { id: "l6", name: "IT Service Desk", nameAr: "مكتب خدمة تقنية المعلومات", desc: "Raise a support ticket", icon: Ticket, uses: 1580 },
  { id: "l7", name: "Power BI Dashboards", nameAr: "لوحات Power BI", desc: "Analytics & reports", icon: BarChart3, uses: 720, external: true },
  { id: "l8", name: "Trust Center", nameAr: "مركز الثقة", desc: "Security & compliance", icon: ShieldCheck, uses: 210 },
  { id: "l9", name: "Room Booking", nameAr: "حجز القاعات", desc: "Reserve meeting rooms", icon: CalendarClock, uses: 1340 },
]

export default function QuickLinksPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        icon={Link2}
        eyebrow={t("Quick Links", "روابط سريعة")}
        title={t("Jump to your systems", "الوصول السريع لأنظمتك")}
        desc={t("Curated shortcuts to internal and external systems, ordered by usage and audience.", "اختصارات منتقاة للأنظمة الداخلية والخارجية، مرتبة حسب الاستخدام والجمهور.")}
        action={<Button size="lg"><Plus className="size-4" />{t("Add link", "إضافة رابط")}</Button>}
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Link2} value="24" label={t("Links", "روابط")} />
        <StatCard icon={ExternalLink} value="9" label={t("External", "خارجية")} />
        <StatCard icon={BarChart3} value="16.7k" label={t("Clicks", "نقرات")} sub={t("this month", "هذا الشهر")} />
        <StatCard icon={Mail} value="Outlook" label={t("Most used", "الأكثر استخدامًا")} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {LINKS.map((l) => (
          <Card key={l.id} className="group flex flex-row items-center gap-4 p-4 transition-colors hover:border-primary/60">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><l.icon className="size-5" /></div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate font-medium">{isAr ? l.nameAr : l.name}</span>
                {l.external && <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />}
              </div>
              <div className="truncate text-xs text-muted-foreground">{l.desc}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground/70">{l.uses.toLocaleString()} {t("clicks", "نقرة")}</div>
            </div>
          </Card>
        ))}
      </div>
    </main>
  )
}
