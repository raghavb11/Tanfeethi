import { Link } from "react-router-dom"
import { Badge, Card } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  ArrowRight, Bell, Building2, CalendarDays, Coffee, FolderTree, GitBranch,
  ShieldCheck, Tags,
} from "lucide-react"

import { useRules } from "../data/rules"
import { daysInYear, holidayYears, useHolidays } from "../data/holidays"
import { useHolidayTypes } from "../data/master-data"

/** Configuration hub — where an administrator sets up how the portal behaves.
 *  The Approval Rule Engine is the live area; the rest are placeholders so the
 *  shape of the section is visible. */
export default function ConfigurationPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const rules = useRules().filter((r) => !r.archived)
  const active = rules.filter((r) => r.active).length
  const holidays = useHolidays()
  const years = holidayYears()
  const thisYear = years.includes(2026) ? 2026 : years[0]
  const thisYearCount = holidays.filter((h) => h.year === thisYear).length
  const types = useHolidayTypes()

  const areas: {
    to?: string
    icon: React.ComponentType<{ className?: string }>
    label: string; labelAr: string
    desc: string; descAr: string
    meta?: string; metaAr?: string
    ready: boolean
  }[] = [
    {
      to: "/config/rules", icon: GitBranch,
      label: "Approval Rule Engine", labelAr: "محرك قواعد الاعتماد",
      desc: "Decide what needs approval, who approves it and in what order.",
      descAr: "حدّد ما يحتاج اعتمادًا ومن يعتمده وبأي ترتيب.",
      meta: `${rules.length} rules · ${active} active`, metaAr: `${rules.length} قواعد · ${active} نشطة`,
      ready: true,
    },
    {
      to: "/config/holidays", icon: CalendarDays,
      label: "Holiday calendar", labelAr: "تقويم الإجازات",
      desc: "The non-working days for each year — leave and attendance read from it.",
      descAr: "أيام العطل لكل سنة — تعتمد عليها الإجازات والحضور.",
      meta: `${thisYearCount} holidays · ${daysInYear(thisYear)} days off · ${thisYear}`,
      metaAr: `${thisYearCount} إجازة · ${daysInYear(thisYear)} يوم · ${thisYear}`,
      ready: true,
    },
    {
      icon: Building2, label: "Organisation", labelAr: "الهيكل التنظيمي",
      desc: "Departments, sectors and sites that drive folders and audiences.",
      descAr: "الإدارات والقطاعات والمواقع التي تُبنى عليها المجلدات والجماهير.",
      ready: false,
    },
    {
      to: "/config/master-data", icon: Tags,
      label: "Master data", labelAr: "البيانات الرئيسية",
      desc: "Categories, tags, priorities and other configurable lists.",
      descAr: "التصنيفات والوسوم والأولويات والقوائم القابلة للضبط.",
      meta: `${types.length} holiday types · ${types.filter((x) => x.active).length} active`,
      metaAr: `${types.length} أنواع إجازات · ${types.filter((x) => x.active).length} مفعّلة`,
      ready: true,
    },
    {
      to: "/config/cafeteria", icon: Coffee,
      label: "Cafeteria menu & places", labelAr: "قائمة الكافتيريا والمواقع",
      desc: "What can be ordered, and where it can be delivered.",
      descAr: "ما يمكن طلبه، وأين يمكن توصيله.",
      ready: true,
    },
    {
      icon: Bell, label: "Notifications", labelAr: "الإشعارات",
      desc: "Templates, channels and quiet hours.",
      descAr: "القوالب والقنوات وأوقات الصمت.",
      ready: false,
    },
    {
      icon: ShieldCheck, label: "Roles & permissions", labelAr: "الأدوار والصلاحيات",
      desc: "Who can see and do what, per module.",
      descAr: "من يرى وماذا يفعل، لكل وحدة.",
      ready: false,
    },
    {
      icon: FolderTree, label: "Document library settings", labelAr: "إعدادات مكتبة المستندات",
      desc: "Folder rules, file types and size limits.",
      descAr: "قواعد المجلدات وأنواع الملفات وحدود الحجم.",
      ready: false,
    },
  ]

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-7 md:px-8">
      <div className="space-y-1.5">
        <h1 className="text-[22px] font-bold tracking-tight md:text-[26px]">{t("Configuration", "الإعدادات")}</h1>
        <p className="max-w-3xl text-[13px] text-muted-foreground">
          {t("Set up how the portal behaves — approvals, organisation, master data and module settings.",
             "اضبط طريقة عمل البوابة — الاعتمادات والهيكل التنظيمي والبيانات الرئيسية وإعدادات الوحدات.")}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {areas.map((a) => {
          const body = (
            <div className={cn(
              "group flex h-full items-start gap-3 rounded-2xl border border-border/60 bg-card/70 p-5 transition-all",
              a.ready ? "hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lg" : "opacity-60",
            )}>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <a.icon className="size-5" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[13.5px] font-semibold">{isAr ? a.labelAr : a.label}</span>
                  {!a.ready && (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">{t("Coming soon", "قريبًا")}</Badge>
                  )}
                </div>
                <p className="mt-1 text-[12px] text-muted-foreground">{isAr ? a.descAr : a.desc}</p>
                {a.meta && (
                  <div className="mt-2 text-[11.5px] font-medium text-primary">{isAr ? a.metaAr : a.meta}</div>
                )}
              </div>
              {a.ready && (
                <ArrowRight className={cn("ms-auto size-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5", isAr && "rotate-180 group-hover:-translate-x-0.5")} />
              )}
            </div>
          )
          return a.to
            ? <Link key={a.label} to={a.to} className="block">{body}</Link>
            : <div key={a.label}>{body}</div>
        })}
      </div>

      <Card className="ring-1 ring-foreground/10">
        <div className="px-5 py-4 text-[12.5px] text-muted-foreground">
          {t("The cafeteria menu and places are seeded with a working list and can be edited here; the client's own list will replace it. The tea-boy fulfilment screen is live under Cafeteria → Service queue.",
             "قائمة الكافتيريا والمواقع محمّلة بقائمة أولية وقابلة للتعديل هنا؛ وستحل محلها قائمة العميل. شاشة خدمة الضيافة متاحة ضمن الكافتيريا ← قائمة الخدمة.")}
        </div>
      </Card>
    </div>
  )
}
