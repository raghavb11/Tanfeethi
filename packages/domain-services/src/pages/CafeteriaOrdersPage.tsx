import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Button, Card, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import { ArrowLeft, ChefHat, CircleSlash, Clock, Coffee, MapPin, PackageCheck, RotateCcw, Timer } from "lucide-react"

import {
  ME, etaMin, hhmm, isLate, itemById, locationById, minutesUntil, setOrderStatus, slotById,
  sugarLabel, useNow, useOrders, waitingMin, type CafeteriaOrder, type OrderStatus,
} from "../data/mock/cafeteria"

export const STATUS_STYLE: Record<OrderStatus, { cls: string; icon: React.ComponentType<{ className?: string }>; en: string; ar: string }> = {
  Received: { cls: "border-amber-500/35 bg-amber-500/10 text-amber-600 dark:text-amber-400", icon: Clock, en: "Received", ar: "تم الاستلام" },
  Accepted: { cls: "border-blue-500/35 bg-blue-500/10 text-blue-600 dark:text-blue-400", icon: ChefHat, en: "Accepted", ar: "تم القبول" },
  Delivered: { cls: "border-emerald-500/35 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", icon: PackageCheck, en: "Delivered", ar: "تم التوصيل" },
  Cancelled: { cls: "border-border/60 bg-muted/40 text-muted-foreground", icon: CircleSlash, en: "Cancelled", ar: "ملغى" },
}

export function OrderLines({ order, isAr }: { order: CafeteriaOrder; isAr: boolean }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {order.lines.map((l) => {
        const m = itemById(l.itemId)
        if (!m) return null
        return (
          <span key={l.itemId} className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/25 px-2.5 py-1 text-[11.5px]">
            <span className="font-semibold tabular-nums">{l.qty}×</span>
            {isAr ? m.nameAr : m.name}
            {l.sugar && <span className="text-muted-foreground">· {sugarLabel(l.sugar, isAr)}</span>}
          </span>
        )
      })}
    </div>
  )
}

/** My cafeteria orders and their status. Cancelling is a soft state change —
 *  the order stays in the list, per the build guidelines. */
export default function CafeteriaOrdersPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const orders = useOrders().filter((o) => o.by === ME)
  useNow(10000) // keep waiting times and countdowns honest
  const [confirm, setConfirm] = React.useState<CafeteriaOrder | null>(null)

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-7 md:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate("/cafeteria")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />{t("Back to the cafeteria", "العودة إلى الكافتيريا")}
        </button>
        <Button onClick={() => navigate("/cafeteria")}><Coffee className="size-4" />{t("New order", "طلب جديد")}</Button>
      </div>

      <div className="space-y-1.5">
        <h1 className="text-[22px] font-bold tracking-tight md:text-[26px]">{t("My orders", "طلباتي")}</h1>
        <p className="text-[13px] text-muted-foreground">
          {t("Track what you've ordered today.", "تابع ما طلبته اليوم.")}
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {orders.map((o) => {
          const s = STATUS_STYLE[o.status]
          const loc = locationById(o.locationId)
          const slot = slotById(o.slotId)
          const canCancel = o.status === "Received"
          const e = etaMin(o)
          return (
            <Card key={o.id} className="ring-1 ring-foreground/10">
              <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13.5px] font-bold tabular-nums">{o.ref}</span>
                    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", s.cls)}>
                      <s.icon className="size-3" />{isAr ? s.ar : s.en}
                    </span>
                  </div>
                  <OrderLines order={o} isAr={isAr} />
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{loc && (isAr ? loc.nameAr : loc.name)}</span>
                    <span className="inline-flex items-center gap-1"><Clock className="size-3.5" />{slot && (isAr ? slot.labelAr : slot.label)}</span>
                    <span>{isAr ? o.placedAr : o.placed}</span>
                  </div>
                  {/* waiting for someone to pick it up */}
                  {o.status === "Received" && (
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[12px] text-amber-600 dark:text-amber-400">
                      <span className="relative flex size-2.5">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-500/60" />
                        <span className="relative inline-flex size-2.5 rounded-full bg-amber-500" />
                      </span>
                      <span className="font-semibold">{t("Waiting to be accepted", "بانتظار القبول")}</span>
                      <span className="opacity-80">
                        {waitingMin(o) === 0
                          ? t("· just sent", "· أُرسل للتو")
                          : t(`· sent ${waitingMin(o)} min ago`, `· أُرسل قبل ${waitingMin(o)} دقيقة`)}
                      </span>
                      <span className="w-full text-[11px] opacity-70">
                        {t("You'll see a delivery time as soon as someone picks it up.",
                           "سيظهر لك وقت التوصيل بمجرد أن يقبله أحد.")}
                      </span>
                    </div>
                  )}

                  {/* accepted — how long until it arrives */}
                  {o.status === "Accepted" && o.acceptedBy && (() => {
                    const left = minutesUntil(o)
                    const total = o.etaMinutes ?? 1
                    const pct = left == null ? 0 : Math.min(100, Math.max(0, ((total - left) / total) * 100))
                    const late = isLate(o)
                    return (
                      <div className={cn(
                        "space-y-2 rounded-lg border px-3 py-2.5 text-[12px]",
                        late
                          ? "border-amber-500/35 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
                      )}>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <ChefHat className="size-3.5" />
                          <span className="font-semibold">{t(`Accepted by ${o.acceptedBy}`, `قبله ${o.acceptedByAr}`)}</span>
                        </div>
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <Timer className="size-4 self-center" />
                          <span className="text-[15px] font-bold">
                            {late
                              ? t("Running late", "هناك تأخير")
                              : left != null && left <= 0
                                ? t("Arriving now", "في الطريق الآن")
                                : t(`Arriving in ${left} min`, `يصل خلال ${left} دقيقة`)}
                          </span>
                          {e != null && (
                            <span className="opacity-75">
                              {late ? t(`(was due ${hhmm(e)})`, `(كان الموعد ${hhmm(e)})`)
                                    : t(`· by ${hhmm(e)}`, `· بحلول ${hhmm(e)}`)}
                            </span>
                          )}
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-current/15">
                          <div
                            className="h-full rounded-full bg-current transition-[width] duration-500"
                            style={{ width: `${late ? 100 : pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })()}
                  {o.note && <p className="max-w-xl text-[12px] italic text-muted-foreground/80">“{o.note}”</p>}
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  {canCancel && (
                    <Button variant="outline" size="sm" onClick={() => setConfirm(o)}>
                      {t("Cancel order", "إلغاء الطلب")}
                    </Button>
                  )}
                  {o.status === "Accepted" && (
                    <span className="text-end text-[11px] text-muted-foreground/70">
                      {t("Being prepared — call the cafeteria to change it.", "قيد التحضير — اتصل بالكافتيريا للتعديل.")}
                    </span>
                  )}
                  {o.status === "Delivered" && (
                    <Button variant="outline" size="sm" onClick={() => navigate("/cafeteria")}>
                      <RotateCcw className="size-3.5" />{t("Order again", "اطلب مرة أخرى")}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )
        })}

        {orders.length === 0 && (
          <Card className="ring-1 ring-foreground/10">
            <div className="px-5 py-12 text-center">
              <Coffee className="mx-auto size-8 text-muted-foreground/40" />
              <p className="mt-3 text-[13px] text-muted-foreground">{t("You haven't ordered anything yet.", "لم تطلب شيئًا بعد.")}</p>
              <Button className="mt-4" onClick={() => navigate("/cafeteria")}>{t("Browse the menu", "تصفّح القائمة")}</Button>
            </div>
          </Card>
        )}
      </div>

      {/* the one dialog the guidelines allow: a yes/no cancel confirmation */}
      <Dialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("Cancel this order?", "إلغاء هذا الطلب؟")}</DialogTitle>
            <DialogDescription>
              {t(
                "The cafeteria team stops preparing it. The order stays in your list as cancelled.",
                "سيتوقف فريق الكافتيريا عن تحضيره، وسيبقى الطلب في قائمتك كملغى.",
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>{t("Keep order", "الإبقاء على الطلب")}</Button>
            <Button
              onClick={() => {
                if (confirm) setOrderStatus(confirm.id, "Cancelled")
                setConfirm(null)
              }}
            >
              {t("Cancel order", "إلغاء الطلب")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
