import * as React from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Badge, Button, Card, Input, Textarea } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  Check, ClipboardList, Coffee, MapPin, Minus, Plus, Search, Send, ShieldCheck, Sparkles, Clock,
  Bookmark, BookmarkCheck, RotateCcw, Star,
} from "lucide-react"

import {
  SUGAR, addOrder, itemById, locations, menu, menuGroups, newOrderId, newOrderRef, nowMin,
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

  const applyUsual = () => {
    if (!prefs.usual) return
    setLines(prefs.usual.map((l) => ({ ...l })))
    setLocationId(prefs.locationId)
    if (prefs.usualNote) setNote(prefs.usualNote)
  }

  const visible = menu.filter((m) => {
    const inGroup = group === "all" || m.group === group
    const q = query.trim().toLowerCase()
    const hit = !q || m.name.toLowerCase().includes(q) || m.nameAr.includes(query.trim())
    return inGroup && hit
  })

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

      {prefs.usual && prefs.usual.length > 0 && (
        <Card className="mb-5 ring-1 ring-foreground/10">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
                <Star className="size-4" />
              </span>
              <div className="min-w-0">
                <div className="text-[13px] font-semibold">{t("My usual", "طلبي المعتاد")}</div>
                <div className="mt-0.5 flex flex-wrap gap-1.5">
                  {prefs.usual.map((l) => {
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
            </div>
            <Button variant="outline" size="sm" onClick={applyUsual}>
              <RotateCcw className="size-3.5" />{t("Order this again", "اطلبه مرة أخرى")}
            </Button>
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
                {label(t("Deliver to", "التوصيل إلى"))}
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
                      {isAr ? l.nameAr : l.name}
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

              <button
                type="button"
                disabled={lines.length === 0}
                onClick={() => {
                  saveUsual(lines, note.trim() || undefined)
                  setPrefs({ locationId })
                  setSavedUsual(true)
                  window.setTimeout(() => setSavedUsual(false), 2400)
                }}
                className="flex w-full items-center justify-center gap-1.5 text-[12px] font-semibold text-muted-foreground transition-colors hover:text-primary disabled:opacity-40"
              >
                {savedUsual ? <BookmarkCheck className="size-3.5" /> : <Bookmark className="size-3.5" />}
                {savedUsual ? t("Saved as your usual", "تم الحفظ كطلبك المعتاد") : t("Save as my usual", "حفظ كطلبي المعتاد")}
              </button>
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
