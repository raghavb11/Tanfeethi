import * as React from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Badge, Button, Card, Input, Textarea } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  Bookmark, BookmarkCheck, Check, ClipboardList, Clock, Coffee, MapPin, Minus, Plus, RotateCcw, Search, Send, ShieldCheck, Sparkles, Star, X,
} from "lucide-react"

import {
  MAX_USUALS, SUGAR, addOrder, itemById, locations, menu, menuGroups, newOrderId, newOrderRef,
  nowMin, removeUsual, replaceUsual, type SavedUsual, servesAt,
  saveUsual, setPrefs, slots, sugarLabel, useOrders, usePrefs,
  type MenuGroupId, type OrderLine, type SugarLevel,
} from "../data/mock/cafeteria"

/** Cafeteria & tea-boy ordering. A free internal service, so there is no
 *  pricing or checkout — you pick items, a delivery point and a time. */
export default function CafeteriaPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const orders = useOrders()

  const [group, setGroup] = React.useState<MenuGroupId | "all">("all")
  const [query, setQuery] = React.useState("")
  const [lines, setLines] = React.useState<OrderLine[]>([])
  const prefs = usePrefs()
  const [locationId, setLocationId] = React.useState(prefs.locationId)
  const [savedUsual, setSavedUsual] = React.useState(false)
  const [locQuery, setLocQuery] = React.useState("")
  const [slotId, setSlotId] = React.useState(slots[0].id)
  const [note, setNote] = React.useState("")
  const [placed, setPlaced] = React.useState<string | null>(null)

  const qtyOf = (id: string) => lines.find((l) => l.itemId === id)?.qty ?? 0
  const bump = (id: string, by: number) =>
    setLines((prev) => {
      const next = prev.map((l) => (l.itemId === id ? { ...l, qty: l.qty + by } : l))
      if (!prev.some((l) => l.itemId === id) && by > 0) {
        const m = itemById(id)
        next.push({ itemId: id, qty: by, sugar: m?.takesSugar ? prefs.sugar : undefined })
      }
      return next.filter((l) => l.qty > 0)
    })

  /** Sugar is per line, so two teas in one order can differ. */
  const setSugar = (id: string, sugar: SugarLevel) =>
    setLines((prev) => prev.map((l) => (l.itemId === id ? { ...l, sugar } : l)))

  const applyUsual = (u: SavedUsual) => {
    setLines(u.lines.map((l) => ({ ...l })))
    setLocationId(prefs.locationId)
    setNote(u.note ?? "")
  }

  // naming a basket before it is kept, and which saved order to overwrite
  const [usualName, setUsualName] = React.useState("")
  /** The usual being confirmed, and the place it will go to — the default
   *  unless the person changes it here. */
  const [confirmUsual, setConfirmUsual] = React.useState<SavedUsual | null>(null)
  const [confirmLoc, setConfirmLoc] = React.useState(prefs.locationId)
  const [confirmQuery, setConfirmQuery] = React.useState("")
  const [replacing, setReplacing] = React.useState(false)
  const shelfFull = prefs.usuals.length >= MAX_USUALS

  // only what the chosen place is actually served
  const chosenPlace = locations.find((l) => l.id === locationId)
  const visible = menu.filter((m) => {
    const inGroup = group === "all" || m.group === group
    const q = query.trim().toLowerCase()
    const hit = !q || m.name.toLowerCase().includes(q) || m.nameAr.includes(query.trim())
    return inGroup && hit && servesAt(m, chosenPlace)
  })
  /** Items that place cannot get — worth saying, rather than quietly hiding. */
  const hiddenByPlace = chosenPlace
    ? menu.filter((m) => m.available && !servesAt(m, chosenPlace)).length
    : 0

  /** Searchable location list — the guidelines require a searchable dropdown
   *  rather than a long unfiltered select. */
  const locOptions = locations.filter((l) => {
    if (!l.active) return false
    const q = locQuery.trim().toLowerCase()
    return !q || l.name.toLowerCase().includes(q) || l.nameAr.includes(locQuery.trim())
  })

  const totalItems = lines.reduce((n, l) => n + l.qty, 0)
  const canSubmit = totalItems > 0 && !!locationId && !!slotId

  const submit = () => {
    if (!canSubmit) return
    const ref = newOrderRef()
    addOrder({
      id: newOrderId(), ref, lines, locationId, slotId,
      note: note.trim() || undefined, status: "Received",
      by: "Khalid Al-Saadi", byAr: "خالد السعدي", initials: "KS",
      placed: "Just now", placedAr: "الآن", placedMin: nowMin(),
    })
    setPlaced(ref)
    setLines([]); setNote("")
    window.setTimeout(() => setPlaced(null), 4000)
  }

  /** Reorder a usual as it stands — same shape as submit, minus the basket. */
  const placeUsual = () => {
    if (!confirmUsual || !confirmLoc) return
    const ref = newOrderRef()
    addOrder({
      id: newOrderId(), ref, lines: confirmUsual.lines.map((l) => ({ ...l })),
      locationId: confirmLoc, slotId,
      note: confirmUsual.note?.trim() || undefined, status: "Received",
      by: "Khalid Al-Saadi", byAr: "خالد السعدي", initials: "KS",
      placed: "Just now", placedAr: "الآن", placedMin: nowMin(),
    })
    setPlaced(ref)
    setConfirmUsual(null); setConfirmQuery("")
    window.setTimeout(() => setPlaced(null), 4000)
  }

  const confirmOptions = locations.filter((l) => {
    if (!l.active) return false
    const q = confirmQuery.trim().toLowerCase()
    return !q || l.name.toLowerCase().includes(q) || l.nameAr.includes(confirmQuery.trim())
  })

  const mine = orders.filter((o) => o.by === "Khalid Al-Saadi" && (o.status === "Received" || o.status === "Accepted"))

  const label = (s: string) => (
    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{s}</label>
  )

  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 py-7 md:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1.5">
          <h1 className="text-[22px] font-bold tracking-tight md:text-[26px]">{t("Cafeteria", "الكافتيريا")}</h1>
          <p className="max-w-3xl text-[13px] text-muted-foreground">
            {t(
              "Order refreshments and meals to your desk, a meeting room or a terminal office.",
              "اطلب المشروبات والوجبات إلى مكتبك أو قاعة الاجتماعات أو مكتب الصالة.",
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/cafeteria/orders")}>
            <ClipboardList className="size-4" />
            {t("My orders", "طلباتي")}
            {mine.length > 0 && <Badge variant="outline" className="ms-1 text-[10px]">{mine.length}</Badge>}
          </Button>
          <Button variant="outline" onClick={() => navigate("/cafeteria/admin")}>
            <ShieldCheck className="size-4" />{t("Service queue", "قائمة الخدمة")}
          </Button>
        </div>
      </div>

      {placed && (
        <motion.div
          initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex flex-wrap items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-[13px] text-emerald-600 dark:text-emerald-400"
        >
          <Check className="size-4" />
          {t(`Order ${placed} placed — waiting for a tea boy to accept it.`, `تم إرسال الطلب ${placed} — بانتظار قبوله من فريق الضيافة.`)}
          <button onClick={() => navigate("/cafeteria/orders")} className="font-semibold underline underline-offset-2">
            {t("Track it", "تتبّعه")}
          </button>
        </motion.div>
      )}

      {prefs.usuals.length > 0 && (
        <Card className="mb-5 ring-1 ring-foreground/10">
          <div className="flex items-center gap-2 border-b border-border/60 px-5 py-3">
            <Star className="size-4 text-primary" />
            <span className="text-[13px] font-semibold">{t("My usuals", "طلباتي المعتادة")}</span>
            <span className="ms-auto text-[11.5px] tabular-nums text-muted-foreground">
              {prefs.usuals.length}/{MAX_USUALS}
            </span>
          </div>
          <div className="grid gap-px bg-border/40 sm:grid-cols-2">
            {prefs.usuals.map((u) => (
              <div key={u.id} className="flex flex-wrap items-start justify-between gap-3 bg-card px-5 py-3.5">
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold">{u.name}</div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {u.lines.map((l) => {
                      const m = itemById(l.itemId)
                      if (!m) return null
                      return (
                        <span key={l.itemId} className="rounded-full border border-border/60 bg-muted/25 px-2.5 py-0.5 text-[11.5px] text-muted-foreground">
                          <span className="font-semibold tabular-nums">{l.qty}×</span> {isAr ? m.nameAr : m.name}
                          {l.sugar && ` · ${sugarLabel(l.sugar, isAr)}`}
                        </span>
                      )
                    })}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="outline" size="sm"
                    onClick={() => {
                      setConfirmUsual(confirmUsual?.id === u.id ? null : u)
                      setConfirmLoc(prefs.locationId)
                      setConfirmQuery("")
                    }}
                  >
                    <RotateCcw className="size-3.5" />{t("Order this", "اطلبه مرة أخرى")}
                  </Button>
                  <button
                    onClick={() => removeUsual(u.id)}
                    aria-label={t("Remove", "إزالة")}
                    className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-rose-500"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>

                {/* nothing is sent until this is confirmed */}
                {confirmUsual?.id === u.id && (
                  <div className="w-full rounded-xl border border-primary/30 bg-primary/[0.04] p-3">
                    <p className="text-[12.5px] font-semibold">
                      {t(`Send "${u.name}" now?`, `تأكيد الطلب: «${u.name}»`)}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px]">
                      <span className="text-muted-foreground">{t("Deliver to", "التوصيل إلى")}</span>
                      <span className="font-semibold">
                        {(() => {
                          const l = locations.find((x) => x.id === confirmLoc)
                          return l ? (isAr ? l.nameAr : l.name) : "—"
                        })()}
                      </span>
                      {confirmLoc === prefs.locationId && (
                        <Badge variant="outline" className="gap-1 border-primary/30 bg-primary/10 text-[10px] text-primary">
                          <Star className="size-2.5" />{t("Your default", "موقعك الافتراضي")}
                        </Badge>
                      )}
                      <span className="text-muted-foreground">· {t("As soon as possible", "في أقرب وقت")}</span>
                    </div>

                    {/* change it here, without leaving the confirmation */}
                    <div className="mt-2">
                      <Input
                        value={confirmQuery} onChange={(e) => setConfirmQuery(e.target.value)}
                        placeholder={t("Change the place — search locations…", "ابحث عن الموقع…")}
                        className="h-9 text-[12.5px]"
                      />
                      {confirmQuery.trim() !== "" && (
                        <div className="mt-1 max-h-36 space-y-1 overflow-y-auto rounded-lg border border-border/60 bg-card p-1">
                          {confirmOptions.map((l) => (
                            <button
                              key={l.id} type="button"
                              onClick={() => { setConfirmLoc(l.id); setConfirmQuery("") }}
                              className={cn("block w-full rounded-md px-2.5 py-1.5 text-start text-[12px] transition-colors",
                                confirmLoc === l.id ? "bg-primary/12 font-semibold text-primary" : "hover:bg-muted/40")}
                            >
                              {isAr ? l.nameAr : l.name}
                            </button>
                          ))}
                          {confirmOptions.length === 0 && (
                            <p className="px-2.5 py-2 text-center text-[12px] text-muted-foreground">
                              {t("No matching location", "لا يوجد موقع مطابق")}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                      <button
                        onClick={() => { applyUsual(u); setConfirmUsual(null) }}
                        className="text-[11.5px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
                      >
                        {t("Edit before sending", "تعديل قبل الإرسال")}
                      </button>
                      <Button variant="outline" size="sm" onClick={() => setConfirmUsual(null)}>
                        {t("Cancel", "إلغاء")}
                      </Button>
                      <Button size="sm" onClick={placeUsual}>
                        <Send className="size-3.5" />{t("Confirm & send", "تأكيد وإرسال")}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-12">
        {/* ── menu ── */}
        <div className="space-y-4 lg:col-span-8">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder={t("Search the menu…", "ابحث في القائمة…")} className="ps-9"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[{ id: "all" as const, label: "All", labelAr: "الكل" }, ...menuGroups].map((g) => (
                <button
                  key={g.id} type="button" onClick={() => setGroup(g.id as MenuGroupId | "all")}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors",
                    group === g.id
                      ? "border-primary/40 bg-primary/12 text-primary"
                      : "border-border/60 text-muted-foreground hover:bg-muted/40",
                  )}
                >
                  {isAr ? g.labelAr : g.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((m) => {
              const qty = qtyOf(m.id)
              return (
                <Card
                  key={m.id}
                  className={cn(
                    "ring-1 ring-foreground/10 transition-colors",
                    !m.available && "opacity-55",
                    qty > 0 && "border-primary/35 ring-primary/20",
                  )}
                >
                  <div className="flex h-full flex-col gap-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[13.5px] font-semibold leading-tight">{isAr ? m.nameAr : m.name}</span>
                          {m.popular && (
                            <Badge variant="outline" className="gap-1 border-primary/30 text-[10px] text-primary">
                              <Sparkles className="size-2.5" />{t("Popular", "الأكثر طلبًا")}
                            </Badge>
                          )}
                        </div>
                        {(m.note || m.noteAr) && (
                          <div className="mt-0.5 text-[11.5px] text-muted-foreground/70">{isAr ? m.noteAr : m.note}</div>
                        )}
                        {!m.available && (
                          <div className="mt-1 text-[11px] font-medium text-muted-foreground">
                            {t("Not available today", "غير متوفر اليوم")}
                          </div>
                        )}
                      </div>
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
                        <Coffee className="size-4" />
                      </span>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-2">
                      {qty > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <Button size="sm" variant="outline" onClick={() => bump(m.id, -1)} aria-label={t("Remove one", "إنقاص واحد")}>
                            <Minus className="size-3.5" />
                          </Button>
                          <span className="min-w-6 text-center text-[13px] font-bold tabular-nums">{qty}</span>
                          <Button size="sm" variant="outline" onClick={() => bump(m.id, 1)} aria-label={t("Add one", "إضافة واحد")}>
                            <Plus className="size-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" disabled={!m.available} onClick={() => bump(m.id, 1)}>
                          <Plus className="size-3.5" />{t("Add", "إضافة")}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {hiddenByPlace > 0 && (
            <p className="mt-3 text-center text-[11.5px] text-muted-foreground/75">
              {t(`${hiddenByPlace} more items are not served at ${chosenPlace?.name}.`,
                 `هناك ${hiddenByPlace} أصناف إضافية لا تُقدّم في ${chosenPlace?.nameAr}.`)}
            </p>
          )}

          {visible.length === 0 && (
            <Card className="ring-1 ring-foreground/10">
              <div className="px-5 py-10 text-center text-[13px] text-muted-foreground">
                {t("Nothing on the menu matches that.", "لا يوجد عنصر مطابق في القائمة.")}
              </div>
            </Card>
          )}
        </div>

        {/* ── order panel ── */}
        <div className="lg:col-span-4 lg:sticky lg:top-6">
          <Card className="ring-1 ring-foreground/10">
            <div className="flex items-center gap-2.5 border-b border-border/60 px-5 py-4">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/12 text-primary">
                <ClipboardList className="size-4" />
              </span>
              <div className="min-w-0">
                <div className="text-[13px] font-semibold">{t("Your order", "طلبك")}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground/65">
                  {totalItems > 0
                    ? t(`${totalItems} item${totalItems === 1 ? "" : "s"}`, `${totalItems} عنصر`)
                    : t("Nothing added yet", "لم تتم الإضافة بعد")}
                </div>
              </div>
            </div>

            <div className="space-y-4 p-4">
              {lines.length > 0 && (
                <div className="divide-y divide-border/50 rounded-xl border border-border/60">
                  {lines.map((l) => {
                    const m = menu.find((x) => x.id === l.itemId)!
                    return (
                      <div key={l.itemId} className="px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="min-w-0 truncate text-[12.5px] font-medium">{isAr ? m.nameAr : m.name}</span>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <button onClick={() => bump(l.itemId, -1)} className="rounded-md border border-border/60 p-1 hover:bg-muted/40" aria-label={t("Remove one", "إنقاص واحد")}>
                            <Minus className="size-3" />
                          </button>
                          <span className="min-w-5 text-center text-[12.5px] font-bold tabular-nums">{l.qty}</span>
                          <button onClick={() => bump(l.itemId, 1)} className="rounded-md border border-border/60 p-1 hover:bg-muted/40" aria-label={t("Add one", "إضافة واحد")}>
                            <Plus className="size-3" />
                          </button>
                        </div>
                      </div>
                      {m.takesSugar && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {SUGAR.map((x) => (
                            <button
                              key={x.id} type="button" onClick={() => setSugar(l.itemId, x.id)}
                              className={cn(
                                "rounded-full border px-2 py-0.5 text-[10.5px] font-medium transition-colors",
                                l.sugar === x.id
                                  ? "border-primary/40 bg-primary/12 text-primary"
                                  : "border-border/60 text-muted-foreground hover:bg-muted/40",
                              )}
                            >
                              {isAr ? x.labelAr : x.label}
                            </button>
                          ))}
                        </div>
                      )}
                      </div>
                    )
                  })}
                </div>
              )}

              <div>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("Deliver to", "التوصيل إلى")}
                  </label>
                  {locationId && locationId !== prefs.locationId && (
                    <button
                      onClick={() => setPrefs({ locationId })}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                    >
                      <Star className="size-3" />{t("Make this my default", "اجعله الافتراضي")}
                    </button>
                  )}
                </div>
                <div className="relative mb-2">
                  <MapPin className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
                  <Input
                    value={locQuery} onChange={(e) => setLocQuery(e.target.value)}
                    placeholder={t("Search locations…", "ابحث عن الموقع…")} className="ps-9"
                  />
                </div>
                <div className="max-h-44 space-y-1 overflow-y-auto rounded-xl border border-border/60 p-1">
                  {locOptions.map((l) => (
                    <button
                      key={l.id} type="button" onClick={() => setLocationId(l.id)}
                      className={cn(
                        "block w-full rounded-lg px-2.5 py-2 text-start text-[12.5px] transition-colors",
                        locationId === l.id ? "bg-primary/12 font-semibold text-primary" : "hover:bg-muted/40",
                      )}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {isAr ? l.nameAr : l.name}
                        {l.id === prefs.locationId && (
                          <Star className="size-3 shrink-0 fill-primary/30 text-primary" />
                        )}
                      </span>
                    </button>
                  ))}
                  {locOptions.length === 0 && (
                    <div className="px-2.5 py-3 text-center text-[12px] text-muted-foreground">
                      {t("No matching location", "لا يوجد موقع مطابق")}
                    </div>
                  )}
                </div>
              </div>

              <div>
                {label(t("When", "الوقت"))}
                <div className="flex flex-wrap gap-1.5">
                  {slots.map((s) => (
                    <button
                      key={s.id} type="button" onClick={() => setSlotId(s.id)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors",
                        slotId === s.id
                          ? "border-primary/40 bg-primary/12 text-primary"
                          : "border-border/60 text-muted-foreground hover:bg-muted/40",
                      )}
                    >
                      {s.id === "now" && <Clock className="size-3" />}
                      {isAr ? s.labelAr : s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                {label(t("Note for the team", "ملاحظة للفريق"))}
                <Textarea
                  value={note} onChange={(e) => setNote(e.target.value)} rows={2}
                  placeholder={t("Sugar-free, extra cups, deliver before the meeting…", "بدون سكر، أكواب إضافية، التوصيل قبل الاجتماع…")}
                />
              </div>

              <Button className="w-full" disabled={!canSubmit} onClick={submit}>
                <Send className="size-4" />{t("Place order", "إرسال الطلب")}
              </Button>

              {/* keep this basket, under a name, up to four of them */}
              {lines.length > 0 && (
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                  {savedUsual ? (
                    <p className="flex items-center justify-center gap-1.5 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <BookmarkCheck className="size-3.5" />{t("Saved", "تم الحفظ")}
                    </p>
                  ) : shelfFull && !replacing ? (
                    <div className="space-y-2">
                      <p className="text-[11.5px] text-muted-foreground">
                        {t(`You have ${MAX_USUALS} saved orders — replace one to keep this.`, "لديك 4 طلبات محفوظة — استبدل أحدها:")}
                      </p>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => setReplacing(true)}>
                        <Bookmark className="size-3.5" />{t("Replace one", "استبدال")}
                      </Button>
                    </div>
                  ) : replacing ? (
                    <div className="space-y-1.5">
                      <p className="text-[11.5px] font-semibold text-muted-foreground">
                        {t("Which one does this replace?", "لديك 4 طلبات محفوظة — استبدل أحدها:")}
                      </p>
                      {prefs.usuals.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            replaceUsual(u.id, lines, note.trim() || undefined)
                            setPrefs({ locationId })
                            setReplacing(false); setSavedUsual(true)
                            window.setTimeout(() => setSavedUsual(false), 2400)
                          }}
                          className="flex w-full items-center justify-between gap-2 rounded-lg border border-border/60 bg-card px-2.5 py-1.5 text-[12px] transition-colors hover:border-primary/40 hover:text-primary"
                        >
                          <span className="min-w-0 truncate font-medium">{u.name}</span>
                          <span className="shrink-0 text-[11px] text-muted-foreground">
                            {u.lines.length} {t("items", "أصناف")}
                          </span>
                        </button>
                      ))}
                      <button onClick={() => setReplacing(false)}
                              className="w-full pt-1 text-[11.5px] text-muted-foreground hover:text-foreground">
                        {t("Cancel", "إلغاء")}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        value={usualName}
                        onChange={(e) => setUsualName(e.target.value)}
                        placeholder={t("Name it — Morning karak, Team round…", "سمِّ هذا الطلب")}
                        className="h-9 flex-1 text-[12.5px]"
                      />
                      <Button
                        size="sm"
                        disabled={!usualName.trim()}
                        onClick={() => {
                          if (!saveUsual(usualName.trim(), lines, note.trim() || undefined)) return
                          setPrefs({ locationId })
                          setUsualName(""); setSavedUsual(true)
                          window.setTimeout(() => setSavedUsual(false), 2400)
                        }}
                      >
                        <Bookmark className="size-3.5" />{t("Save", "حفظ كطلب معتاد")}
                      </Button>
                    </div>
                  )}
                </div>
              )}
              <p className="text-center text-[11px] text-muted-foreground/70">
                {t("Provided free to ALTANFEETHI employees.", "خدمة مجانية لمنسوبي التنفيذي.")}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </main>
  )
}
