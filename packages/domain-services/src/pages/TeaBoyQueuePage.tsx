import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, Badge, Button, Card } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import {
  AlertTriangle, Check, ChefHat, Clock, Coffee, LogOut, MapPin, PackageCheck, StickyNote,
} from "lucide-react"

import {
  ACCEPT_SLA_MIN, acceptOrder, etaMin, hhmm, isLate, isOverdueToAccept, itemById, useNow,
  locationById, markDelivered, setOnShift, signOut, slotById, staffById, suggestEta, sugarLabel,
  useOrders, useSignedInStaff, useStaff, waitingMin, type CafeteriaOrder,
} from "../data/mock/cafeteria"

const ETA_CHOICES = [5, 10, 15, 20, 30]

/** The tea boy's app: new requests to accept, then his own to deliver.
 *  Arabic-first, phone-shaped, big touch targets. */
export default function TeaBoyQueuePage() {
  const navigate = useNavigate()
  const orders = useOrders()
  const signedId = useSignedInStaff()
  useStaff()
  const me = staffById(signedId)
  const [ar, setAr] = React.useState(true)
  const t = (en: string, arv: string) => (ar ? arv : en)
  const [tab, setTab] = React.useState<"new" | "mine" | "done">("new")
  const [etaFor, setEtaFor] = React.useState<string | null>(null)
  const [toast, setToast] = React.useState<string | null>(null)
  const [onlyMine, setOnlyMine] = React.useState(true)
  const now = useNow(10000)

  React.useEffect(() => { if (!signedId) navigate("/tea-boy/login", { replace: true }) }, [signedId, navigate])
  if (!me) return null

  const covers = (o: CafeteriaOrder) => me.covers.length === 0 || me.covers.includes(o.locationId)
  const newOrders = orders
    .filter((o) => o.status === "Received" && (!onlyMine || covers(o)))
    .sort((a, b) => a.placedMin - b.placedMin)
  const mine = orders.filter((o) => o.status === "Accepted" && o.acceptedBy === me.name)
  const done = orders.filter((o) => o.status === "Delivered" && o.acceptedBy === me.name)
  const overdue = newOrders.filter(isOverdueToAccept).length

  const flash = (m: string) => { setToast(m); window.setTimeout(() => setToast(null), 2800) }

  const accept = (o: CafeteriaOrder, eta: number) => {
    const ok = acceptOrder(o.id, me.id, eta)
    setEtaFor(null)
    flash(ok
      ? t(`${o.ref} accepted · ETA ${eta} min`, `تم قبول ${o.ref} · الوقت المتوقع ${eta} دقيقة`)
      : t("Someone else already took that one.", "أخذها شخص آخر بالفعل."))
    if (ok) setTab("mine")
  }

  const Lines = ({ o }: { o: CafeteriaOrder }) => (
    <div className="flex flex-wrap gap-1.5">
      {o.lines.map((l) => {
        const m = itemById(l.itemId)
        if (!m) return null
        return (
          <span key={l.itemId} className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/25 px-2.5 py-1 text-[12.5px]">
            <span className="font-bold tabular-nums">{l.qty}×</span>{ar ? m.nameAr : m.name}
            {l.sugar && <span className="font-semibold text-primary">· {sugarLabel(l.sugar, ar)}</span>}
          </span>
        )
      })}
    </div>
  )

  const Where = ({ o }: { o: CafeteriaOrder }) => {
    const loc = locationById(o.locationId)
    const slot = slotById(o.slotId)
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
        <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{loc && (ar ? loc.nameAr : loc.name)}</span>
        <span className="inline-flex items-center gap-1"><Clock className="size-3.5" />{slot && (ar ? slot.labelAr : slot.label)}</span>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-background text-foreground" dir={ar ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-md px-4 pb-24 pt-5">
        {/* who + shift */}
        <div className="flex items-center gap-3">
          <Avatar className="size-11 shrink-0">
            <AvatarFallback className="bg-primary/12 text-[13px] font-bold text-primary">{me.initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[15px] font-bold">{ar ? me.nameAr : me.name}</div>
            <button
              onClick={() => setOnShift(me.id, !me.onShift)}
              className={cn(
                "mt-0.5 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors",
                me.onShift
                  ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-border/60 text-muted-foreground",
              )}
            >
              <span className={cn("size-1.5 rounded-full", me.onShift ? "bg-emerald-500" : "bg-muted-foreground/50")} />
              {me.onShift ? t("On shift", "في الوردية") : t("Off shift", "خارج الوردية")}
            </button>
          </div>
          <button onClick={() => setAr(!ar)} className="rounded-full border border-border/60 px-3 py-1.5 text-[12px] font-semibold text-muted-foreground">
            {ar ? "EN" : "ع"}
          </button>
          <button
            onClick={() => signOut()}
            aria-label={t("Sign out", "خروج")}
            className="rounded-full border border-border/60 p-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <LogOut className="size-4" />
          </button>
        </div>

        {/* unaccepted alert */}
        {overdue > 0 && tab === "new" && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-[12.5px] text-red-600 dark:text-red-400">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <span>{t(
              `${overdue} request(s) waiting more than ${ACCEPT_SLA_MIN} minutes. The supervisor has been notified.`,
              `${overdue} طلب ينتظر أكثر من ${ACCEPT_SLA_MIN} دقيقة. تم إشعار المشرف.`,
            )}</span>
          </div>
        )}

        {/* tabs */}
        <div className="mt-4 grid grid-cols-3 gap-1.5 rounded-xl bg-muted/40 p-1">
          {([
            ["new", t("New", "جديدة"), newOrders.length],
            ["mine", t("My orders", "طلباتي"), mine.length],
            ["done", t("Done", "منجزة"), done.length],
          ] as const).map(([k, label, n]) => (
            <button
              key={k} onClick={() => setTab(k)}
              className={cn(
                "rounded-lg py-2.5 text-[13px] font-semibold transition-colors",
                tab === k ? "bg-card shadow-sm" : "text-muted-foreground",
              )}
            >
              {label}{n > 0 && <span className="ms-1 tabular-nums opacity-70">{n}</span>}
            </button>
          ))}
        </div>

        {tab === "new" && (
          <label className="mt-3 flex items-center gap-2 text-[12px] text-muted-foreground">
            <input type="checkbox" checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} className="size-4" />
            {t("Only my locations", "مواقعي فقط")}
          </label>
        )}

        {/* list */}
        <div className="mt-4 space-y-3">
          {tab === "new" && newOrders.map((o) => {
            const late = isOverdueToAccept(o)
            const picking = etaFor === o.id
            return (
              <Card key={o.id} className={cn("ring-1", late ? "border-red-500/35 ring-red-500/15" : "ring-foreground/10")}>
                <div className="space-y-3 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[14px] font-bold tabular-nums">{o.ref}</span>
                    <span className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11.5px] font-semibold",
                      late ? "border-red-500/35 bg-red-500/10 text-red-600 dark:text-red-400"
                           : "border-amber-500/35 bg-amber-500/10 text-amber-600 dark:text-amber-400",
                    )}>
                      <Clock className="size-3" />
                      {t(`Waiting ${waitingMin(o)} min`, `منتظر ${waitingMin(o)} دقيقة`)}
                    </span>
                  </div>

                  <Lines o={o} />
                  <Where o={o} />
                  <div className="text-[12px] text-muted-foreground">{ar ? o.byAr : o.by}</div>
                  {o.note && (
                    <p className="flex items-start gap-1.5 rounded-lg bg-muted/30 p-2 text-[12px] italic text-muted-foreground">
                      <StickyNote className="mt-0.5 size-3.5 shrink-0" />{o.note}
                    </p>
                  )}

                  {picking ? (
                    <div>
                      <div className="mb-2 text-[12px] font-semibold text-muted-foreground">
                        {t("How long will it take?", "كم يستغرق التجهيز؟")}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {ETA_CHOICES.map((m) => (
                          <button
                            key={m} onClick={() => accept(o, m)}
                            className={cn(
                              "min-w-16 rounded-xl border px-3 py-2.5 text-[13px] font-bold transition-colors",
                              m === suggestEta(o)
                                ? "border-primary/40 bg-primary/12 text-primary"
                                : "border-border/60 hover:bg-muted/40",
                            )}
                          >
                            {m} {t("min", "د")}
                          </button>
                        ))}
                      </div>
                      <button onClick={() => setEtaFor(null)} className="mt-2 text-[12px] text-muted-foreground underline underline-offset-2">
                        {t("Cancel", "إلغاء")}
                      </button>
                    </div>
                  ) : (
                    <Button className="h-11 w-full text-[14px]" onClick={() => setEtaFor(o.id)}>
                      <Check className="size-4" />{t("Accept", "قبول")}
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}

          {tab === "mine" && mine.map((o) => {
            const e = etaMin(o)
            const late = isLate(o)
            return (
              <Card key={o.id} className={cn("ring-1", late ? "border-amber-500/40 ring-amber-500/15" : "ring-foreground/10")}>
                <div className="space-y-3 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[14px] font-bold tabular-nums">{o.ref}</span>
                    <span className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11.5px] font-semibold",
                      late ? "border-amber-500/35 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                           : "border-blue-500/35 bg-blue-500/10 text-blue-600 dark:text-blue-400",
                    )}>
                      <ChefHat className="size-3" />
                      {e != null && (late
                        ? t(`Late — due ${hhmm(e)}`, `متأخر — كان ${hhmm(e)}`)
                        : t(`Due ${hhmm(e)}`, `الموعد ${hhmm(e)}`))}
                    </span>
                  </div>
                  <Lines o={o} />
                  <Where o={o} />
                  <div className="text-[12px] text-muted-foreground">{ar ? o.byAr : o.by}</div>
                  {o.note && (
                    <p className="flex items-start gap-1.5 rounded-lg bg-muted/30 p-2 text-[12px] italic text-muted-foreground">
                      <StickyNote className="mt-0.5 size-3.5 shrink-0" />{o.note}
                    </p>
                  )}
                  <Button
                    className="h-11 w-full text-[14px]"
                    onClick={() => { markDelivered(o.id); flash(t(`${o.ref} delivered`, `تم توصيل ${o.ref}`)) }}
                  >
                    <PackageCheck className="size-4" />{t("Mark delivered", "تم التوصيل")}
                  </Button>
                </div>
              </Card>
            )
          })}

          {tab === "done" && done.map((o) => (
            <Card key={o.id} className="ring-1 ring-foreground/10">
              <div className="flex items-center gap-3 p-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-500">
                  <PackageCheck className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-bold tabular-nums">{o.ref}</div>
                  <div className="mt-0.5 truncate text-[12px] text-muted-foreground">
                    {ar ? o.byAr : o.by}
                    {o.deliveredAtMin != null && ` · ${hhmm(o.deliveredAtMin)}`}
                  </div>
                </div>
                <Badge variant="outline" className="border-emerald-500/35 bg-emerald-500/10 text-[10.5px] text-emerald-600 dark:text-emerald-400">
                  {t("Delivered", "تم التوصيل")}
                </Badge>
              </div>
            </Card>
          ))}

          {((tab === "new" && newOrders.length === 0) ||
            (tab === "mine" && mine.length === 0) ||
            (tab === "done" && done.length === 0)) && (
            <Card className="ring-1 ring-foreground/10">
              <div className="px-5 py-14 text-center">
                <Coffee className="mx-auto size-8 text-muted-foreground/40" />
                <p className="mt-3 text-[13px] text-muted-foreground">
                  {tab === "new" ? t("No new requests right now.", "لا توجد طلبات جديدة الآن.")
                    : tab === "mine" ? t("Nothing accepted yet.", "لم تقبل أي طلب بعد.")
                    : t("Nothing delivered today.", "لم تُسلّم أي طلبات اليوم.")}
                </p>
              </div>
            </Card>
          )}
        </div>

        <p className="mt-6 text-center text-[11px] text-muted-foreground/60">
          {t(`Now ${hhmm(now)}`, `الوقت الآن ${hhmm(now)}`)}
        </p>
      </div>

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
          <div className="rounded-xl bg-foreground px-4 py-2.5 text-[13px] font-semibold text-background shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </div>
  )
}
