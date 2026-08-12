import * as React from "react"
import { Badge, Card } from "@reach/shared-ui"
import { useShell } from "@reach/shell-context"
import { cn } from "@reach/shared-core"
import { Bell, Mail, MessageSquare, Send, Smartphone } from "lucide-react"

import { PageHeader, StatCard } from "./_ui"

const CHANNELS = [
  { name: "In-app", nameAr: "داخل التطبيق", icon: MessageSquare, on: true, sub: "Bell + drawer" },
  { name: "Email", nameAr: "البريد", icon: Mail, on: true, sub: "Digest & alerts" },
  { name: "Push (mobile)", nameAr: "الجوال", icon: Smartphone, on: true, sub: "Wajha app" },
]

type Notif = { id: string; title: string; channel: string; audience: string; sent: string; status: "Sent" | "Scheduled" | "Failed" }
const NOTIFS: Notif[] = [
  { id: "n1", title: "Eid Al-Adha office closure", channel: "In-app · Email", audience: "All employees", sent: "Aug 3, 09:10", status: "Sent" },
  { id: "n2", title: "New circular: Travel & Expense v2.4", channel: "In-app", audience: "All employees", sent: "Aug 2, 14:22", status: "Sent" },
  { id: "n3", title: "Q3 Pulse survey reminder", channel: "Push · In-app", audience: "Non-respondents", sent: "Aug 8, 08:00", status: "Scheduled" },
  { id: "n4", title: "Town hall — starting soon", channel: "Push", audience: "All employees", sent: "Aug 12, 09:45", status: "Scheduled" },
  { id: "n5", title: "Payslip available", channel: "Email", audience: "All employees", sent: "Jul 29, 06:00", status: "Failed" },
]

const statusTone: Record<Notif["status"], string> = {
  Sent: "bg-[color-mix(in_oklab,#22c55e_18%,transparent)] text-[#16833e]",
  Scheduled: "bg-primary/15 text-primary",
  Failed: "bg-destructive/15 text-destructive",
}

export default function NotificationsAdminPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        icon={Bell}
        eyebrow={t("Notifications", "الإشعارات")}
        title={t("Notification framework", "منظومة الإشعارات")}
        desc={t("Configure delivery channels and track every notification sent across the portal.", "اضبط قنوات التسليم وتتبّع كل إشعار يُرسل عبر البوابة.")}
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Send} value="3,412" label={t("Sent", "مُرسلة")} sub={t("this month", "هذا الشهر")} />
        <StatCard icon={Bell} value="2" label={t("Scheduled", "مجدولة")} />
        <StatCard icon={Mail} value="98.2%" label={t("Delivery", "التسليم")} />
        <StatCard icon={MessageSquare} value="1" label={t("Failed", "فشل")} sub={t("needs retry", "تحتاج إعادة")} />
      </div>

      {/* channels */}
      <h2 className="mb-3 font-heading text-lg font-semibold">{t("Channels", "القنوات")}</h2>
      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        {CHANNELS.map((c) => (
          <Card key={c.name} className="flex flex-row items-center gap-3 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><c.icon className="size-5" /></div>
            <div className="min-w-0 flex-1">
              <div className="font-medium">{isAr ? c.nameAr : c.name}</div>
              <div className="text-xs text-muted-foreground">{c.sub}</div>
            </div>
            <span className={cn("h-5 w-9 rounded-full p-0.5", c.on ? "bg-primary" : "bg-muted")}>
              <span className={cn("block size-4 rounded-full bg-white transition-transform", c.on && (isAr ? "-translate-x-4" : "translate-x-4"))} />
            </span>
          </Card>
        ))}
      </div>

      {/* recent */}
      <h2 className="mb-3 font-heading text-lg font-semibold">{t("Recent notifications", "أحدث الإشعارات")}</h2>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <th className="p-3 text-start font-medium">{t("Notification", "الإشعار")}</th>
              <th className="p-3 text-start font-medium">{t("Channel", "القناة")}</th>
              <th className="p-3 text-start font-medium">{t("Audience", "الجمهور")}</th>
              <th className="p-3 text-start font-medium">{t("Time", "الوقت")}</th>
              <th className="p-3 text-start font-medium">{t("Status", "الحالة")}</th>
            </tr>
          </thead>
          <tbody>
            {NOTIFS.map((n) => (
              <tr key={n.id} className="border-b border-border last:border-0">
                <td className="p-3 font-medium">{n.title}</td>
                <td className="p-3 text-muted-foreground">{n.channel}</td>
                <td className="p-3 text-muted-foreground">{n.audience}</td>
                <td className="p-3 text-muted-foreground">{n.sent}</td>
                <td className="p-3"><Badge className={statusTone[n.status]}>{n.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
