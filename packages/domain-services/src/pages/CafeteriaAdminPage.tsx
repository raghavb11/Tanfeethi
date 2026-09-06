import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, Badge, Button, Card } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import { ArrowLeft, ChefHat, Clock, History, MapPin, PackageCheck, ShieldCheck } from "lucide-react"

import { OrderLines, STATUS_STYLE } from "./CafeteriaOrdersPage"
import {
  locationById, setOrderStatus, slotById, useCafeteriaAudit, useOrders, type OrderStatus,
} from "../data/mock/cafeteria"

const QUEUE: OrderStatus[] = ["Received", "Accepted", "Delivered", "Cancelled"]

/** Cafeteria Service admin — the fulfilment queue for the cafeteria and
 *  tea-boy team. Second module role alongside the ordering employee. */
export default function CafeteriaAdminPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const orders = useOrders()
  const audit = useCafeteriaAudit()
  const [tab, setTab] = React.useState<OrderStatus>("Received")

  const counts = QUEUE.reduce<Record<string, number>>((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length
    return acc
  }, {})
  const shown = orders.filter((o) => o.status === tab)

  const nextAction = (s: OrderStatus) =>
    s === "Received"
      ? { to: "Accepted" as OrderStatus, en: "Accept", ar: "قبول", icon: ChefHat }
      : s === "Accepted"
        ? { to: "Delivered" as OrderStatus, en: "Mark delivered", ar: "تم التوصيل", icon: PackageCheck }
        : null

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-7 md:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate("/cafeteria")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />{t("Back to the cafeteria", "العودة إلى الكافتيريا")}
        </button>
        <Badge variant="outline" className="gap-1"><ShieldCheck className="size-3" />{t("Cafeteria Service admin", "مسؤول خدمة الكافتيريا")}</Badge>
      </div>

      <div className="space-y-1.5">
        <h1 className="text-[22px] font-bold tracking-tight md:text-[26px]">{t("Service queue", "قائمة الخدمة")}</h1>
        <p className="text-[13px] text-muted-foreground">
          {t("Incoming cafeteria and tea-boy requests across HQ and the terminals.", "الطلبات الواردة للكافتيريا وخدمة الضيافة في المقر والصالات.")}
        </p>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <div className="flex flex-wrap gap-1.5">
            {QUEUE.map((s) => {
              const st = STATUS_STYLE[s]
              return (
                <button
                  key={s} type="button" onClick={() => setTab(s)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors",
                    tab === s ? "border-primary/40 bg-primary/12 text-primary" : "border-border/60 text-muted-foreground hover:bg-muted/40",
                  )}
                >
                  <st.icon className="size-3" />
                  {isAr ? st.ar : st.en}
                  <span className="tabular-nums opacity-70">{counts[s] ?? 0}</span>
                </button>
              )
            })}
          </div>

          <div className="space-y-3">
            {shown.map((o) => {
              const loc = locationById(o.locationId)
              const slot = slotById(o.slotId)
              const next = nextAction(o.status)
              return (
                <Card key={o.id} className="ring-1 ring-foreground/10">
                  <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
                    <div className="flex min-w-0 gap-3">
                      <Avatar className="size-9 shrink-0">
                        <AvatarFallback className="bg-primary/12 text-[12px] font-bold text-primary">{o.initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[13.5px] font-bold tabular-nums">{o.ref}</span>
                          <span className="text-[12.5px] text-muted-foreground">{isAr ? o.byAr : o.by}</span>
                        </div>
                        <OrderLines order={o} isAr={isAr} />
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-muted-foreground">
                          <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{loc && (isAr ? loc.nameAr : loc.name)}</span>
                          <span className="inline-flex items-center gap-1"><Clock className="size-3.5" />{slot && (isAr ? slot.labelAr : slot.label)}</span>
                          <span>{isAr ? o.placedAr : o.placed}</span>
                        </div>
                        {o.note && <p className="max-w-xl text-[12px] italic text-muted-foreground/80">“{o.note}”</p>}
                      </div>
                    </div>
                    {next && (
                      <Button size="sm" onClick={() => setOrderStatus(o.id, next.to)}>
                        <next.icon className="size-4" />{isAr ? next.ar : next.en}
                      </Button>
                    )}
                  </div>
                </Card>
              )
            })}

            {shown.length === 0 && (
              <Card className="ring-1 ring-foreground/10">
                <div className="px-5 py-12 text-center text-[13px] text-muted-foreground">
                  {t("Nothing in this queue.", "لا يوجد شيء في هذه القائمة.")}
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* audit trail */}
        <div className="lg:col-span-4">
          <Card className="ring-1 ring-foreground/10">
            <div className="flex items-center gap-2.5 border-b border-border/60 px-5 py-4">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/12 text-primary">
                <History className="size-4" />
              </span>
              <div className="min-w-0">
                <div className="text-[13px] font-semibold">{t("Activity", "السجل")}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground/65">
                  {t("Every order and status change is recorded", "يتم تسجيل كل طلب وتغيير حالة")}
                </div>
              </div>
            </div>
            <div className="max-h-[520px] divide-y divide-border/50 overflow-y-auto">
              {audit.map((a) => (
                <div key={a.id} className="px-5 py-3">
                  <div className="text-[12.5px] font-medium">{a.target}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground/65">{a.who} · {a.time}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </main>
  )
}
