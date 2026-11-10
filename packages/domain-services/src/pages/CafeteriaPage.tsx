import * as React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import {
  Bookmark, BookmarkCheck, ChevronDown, ClipboardList, Clock, Coffee, ConciergeBell, Cookie, CupSoda, Heart, LayoutGrid, MapPin,
  Minus, Plus, RotateCcw, Search, Send, ShieldCheck, ShoppingBag, Star, Trash2, UtensilsCrossed, X, type LucideIcon,
} from "lucide-react"
import { cn } from "@reach/shared-core"

import {
  Card, CardHeader, CardTitle, EmptyState, GoldButton, ImagePlaceholder, OutlineButton, PageBody, TextArea, TextInput, Toast } from "../components/wijha"
import { useT } from "../components/i18n"
import {
  MAX_USUALS, addOrder, itemById, locations, menu, menuGroups, newOrderId, newOrderRef, nowMin, removeUsual,
  replaceUsual, saveUsual, servesAt, setPrefs, slots, sugarLabel, toggleFavorite, useOrders, usePrefs,
  type MenuGroupId, type MenuItem, type OrderLine, type SavedUsual, type SugarLevel,
} from "../data/mock/cafeteria"

/** The three sugar levels the Figma segmented control offers (light stays valid data). */
const SUGAR_UI: SugarLevel[] = ["none", "medium", "sweet"]

const groupIcon: Record<MenuGroupId, LucideIcon> = {
  hot: Coffee, cold: CupSoda, snacks: Cookie, meals: UtensilsCrossed, catering: ConciergeBell,
}

/** Hospitality → Order menu with basket — Figma 4915:17913. Route: /cafeteria.
 *  A free internal service: items, a delivery point and a time; no pricing. */
export default function CafeteriaPage() {
  const { t, isAr } = useT()
  const navigate = useNavigate()
  const orders = useOrders()
  const prefs = usePrefs()

  const [group, setGroup] = React.useState<MenuGroupId | "all">("all")
  const [query, setQuery] = React.useState("")
  // ?basket=demo opens the page with the basket drawn in Figma 4915:17913 (for review/capture).
  const [params] = useSearchParams()
  const [lines, setLines] = React.useState<OrderLine[]>(() => params.get("basket") === "demo"
    ? [
        { itemId: "m-macchiato", qty: 1, sugar: "medium" },
        { itemId: "m-iced-latte", qty: 2, sugar: "medium" },
        { itemId: "m-memories-wafer", qty: 1 },
      ]
    : [])
  /** Sugar chosen on a card before the item is in the basket. */
  const [pendingSugar, setPendingSugar] = React.useState<Record<string, SugarLevel>>({})
  const [locationId, setLocationId] = React.useState(prefs.locationId)
  const [deliveryOpen, setDeliveryOpen] = React.useState(false)
  const [locQuery, setLocQuery] = React.useState("")
  const [slotId, setSlotId] = React.useState(slots[0].id)
  const [note, setNote] = React.useState("")
  const [placed, setPlaced] = React.useState<string | null>(null)
  const [usualName, setUsualName] = React.useState("")
  const [savedUsual, setSavedUsual] = React.useState(false)
  const [replacing, setReplacing] = React.useState(false)
  const [confirmUsual, setConfirmUsual] = React.useState<SavedUsual | null>(null)
  const [confirmLoc, setConfirmLoc] = React.useState(prefs.locationId)
  const [confirmQuery, setConfirmQuery] = React.useState("")

  const shelfFull = prefs.usuals.length >= MAX_USUALS
  const lineOf = (id: string) => lines.find((l) => l.itemId === id)
  const sugarOf = (m: MenuItem) => lineOf(m.id)?.sugar ?? pendingSugar[m.id] ?? prefs.sugar

  const bump = (id: string, by: number) =>
    setLines((prev) => {
      const next = prev.map((l) => (l.itemId === id ? { ...l, qty: l.qty + by } : l))
      if (!prev.some((l) => l.itemId === id) && by > 0) {
        const m = itemById(id)
        next.push({ itemId: id, qty: by, sugar: m?.takesSugar ? (pendingSugar[id] ?? prefs.sugar) : undefined })
      }
      return next.filter((l) => l.qty > 0)
    })
  const removeLine = (id: string) => setLines((prev) => prev.filter((l) => l.itemId !== id))
  const setSugar = (id: string, sugar: SugarLevel) => {
    setPendingSugar((p) => ({ ...p, [id]: sugar }))
    setLines((prev) => prev.map((l) => (l.itemId === id ? { ...l, sugar } : l)))
  }

  // only what the chosen place is actually served
  const chosenPlace = locations.find((l) => l.id === locationId)
  const q = query.trim().toLowerCase()
  const matches = (m: MenuItem) =>
    (!q || m.name.toLowerCase().includes(q) || m.nameAr.includes(query.trim())) && servesAt(m, chosenPlace)
  const hiddenByPlace = chosenPlace ? menu.filter((m) => m.available && !servesAt(m, chosenPlace)).length : 0

  const favourites = menu.filter((m) => prefs.favorites.includes(m.id) && matches(m))
  const sections = menuGroups
    .filter((g) => group === "all" || g.id === group)
    .map((g) => ({ ...g, items: menu.filter((m) => m.group === g.id && matches(m)) }))
    .filter((g) => g.items.length > 0)
  const nothing = sections.length === 0 && (group !== "all" || favourites.length === 0)

  const locOptions = locations.filter((l) => {
    if (!l.active) return false
    const lq = locQuery.trim().toLowerCase()
    return !lq || l.name.toLowerCase().includes(lq) || l.nameAr.includes(locQuery.trim())
  })
  const confirmOptions = locations.filter((l) => {
    if (!l.active) return false
    const cq = confirmQuery.trim().toLowerCase()
    return !cq || l.name.toLowerCase().includes(cq) || l.nameAr.includes(confirmQuery.trim())
  })

  const loc = locations.find((l) => l.id === locationId)
  const locName = loc ? (isAr ? loc.nameAr : loc.name) : undefined
  const slot = slots.find((x) => x.id === slotId)
  const slotName = slot ? (isAr ? slot.labelAr : slot.label) : ""

  const totalItems = lines.reduce((n, l) => n + l.qty, 0)
  const canSubmit = totalItems > 0 && !!locationId && !!slotId
  const mine = orders.filter((o) => o.by === "Khalid Al-Saadi" && (o.status === "Received" || o.status === "Accepted"))

  const flash = (ref: string) => { setPlaced(ref); window.setTimeout(() => setPlaced(null), 4000) }
  const submit = () => {
    if (!canSubmit) return
    const ref = newOrderRef()
    addOrder({
      id: newOrderId(), ref, lines, locationId, slotId, note: note.trim() || undefined, status: "Received",
      by: "Khalid Al-Saadi", byAr: "خالد السعدي", initials: "KS", placed: "Just now", placedAr: "الآن", placedMin: nowMin(),
    })
    setLines([]); setNote(""); flash(ref)
  }
  const placeUsual = () => {
    if (!confirmUsual || !confirmLoc) return
    const ref = newOrderRef()
    addOrder({
      id: newOrderId(), ref, lines: confirmUsual.lines.map((l) => ({ ...l })), locationId: confirmLoc, slotId,
      note: confirmUsual.note?.trim() || undefined, status: "Received",
      by: "Khalid Al-Saadi", byAr: "خالد السعدي", initials: "KS", placed: "Just now", placedAr: "الآن", placedMin: nowMin(),
    })
    setConfirmUsual(null); setConfirmQuery(""); flash(ref)
  }
  const applyUsual = (u: SavedUsual) => { setLines(u.lines.map((l) => ({ ...l }))); setLocationId(prefs.locationId); setNote(u.note ?? "") }
  const keepSaved = () => { setSavedUsual(true); window.setTimeout(() => setSavedUsual(false), 2400) }

  const countLabel = (n: number) => (isAr ? `${n} طلبات` : `${n} request${n === 1 ? "" : "s"}`)
  const label = (s: string) => <div className="mb-2 px-1 text-[13px] font-semibold text-foreground">{s}</div>

  return (
    <PageBody className="space-y-4">
      {placed && (
        <Toast>
          {t(`Order ${placed} placed — waiting for a tea boy to accept it.`, `تم إرسال الطلب ${placed} — بانتظار قبوله من فريق الضيافة.`)}
          <button type="button" onClick={() => navigate("/cafeteria/orders")} className="font-semibold underline underline-offset-2">
            {t("Track it", "تتبّعه")}
          </button>
        </Toast>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[397px_minmax(0,1fr)]">
        {/* ── الطلبات (basket) ── */}
        <div className="space-y-6 lg:sticky lg:top-4">
          <Card>
            <div className="flex items-start justify-between gap-3">
              <CardTitle icon={ShoppingBag}>{t("Requests", "الطلبات")}</CardTitle>
              <span className="text-[12px] leading-[18px] text-foreground">{countLabel(totalItems)}</span>
            </div>

            <div className="mt-4 flex flex-col gap-5">
              {lines.length === 0 ? (
                <EmptyState icon={ShoppingBag} title={t("Nothing added yet", "لم تتم الإضافة بعد")}
                  hint={t("Choose “Order” on an item to add it here.", "اضغط «طلب المشروب» على أي صنف لإضافته هنا.")} />
              ) : lines.map((l) => {
                const m = itemById(l.itemId)
                if (!m) return null
                return (
                  <div key={l.itemId} className="flex gap-3 rounded-[10px] border border-[var(--card-ring)] bg-background px-4 py-6">
                    <ImagePlaceholder icon={groupIcon[m.group]} className="size-[78px] shrink-0" />
                    <div className="flex min-w-0 flex-1 flex-col gap-4">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[14.5px] leading-[21.75px] text-foreground">{isAr ? m.nameAr : m.name}</span>
                        <HeartButton on={prefs.favorites.includes(m.id)} onClick={() => toggleFavorite(m.id)} size="sm" />
                      </div>
                      {m.takesSugar && (
                        <div className="flex gap-1 rounded-lg bg-card p-1">
                          {SUGAR_UI.map((s) => (
                            <button key={s} type="button" onClick={() => setSugar(m.id, s)} aria-pressed={l.sugar === s}
                              className={cn("h-[25px] flex-1 rounded px-1 text-[12px] transition-colors",
                                l.sugar === s ? "bg-soft-accent font-medium text-primary" : "text-foreground hover:bg-secondary/60")}>
                              {sugarLabel(s, isAr)}
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-4">
                        <QtyStepper qty={l.qty} onMinus={() => bump(m.id, -1)} onPlus={() => bump(m.id, 1)} size="sm" />
                        <TrashButton onClick={() => removeLine(m.id)} size="sm" />
                      </div>
                    </div>
                  </div>
                )
              })}

              <GoldButton className="w-full" disabled={!canSubmit} onClick={submit}>
                <Send className="size-3.5" />{t("Submit Request", "تقديم الطلب")}
              </GoldButton>

              {/* Delivery place, time and note — kept from the existing ordering flow, folded
                  below the submit button so the basket matches Figma 4915:17913. */}
              <details className="group rounded-[10px] bg-background px-3 py-2.5" open={deliveryOpen || !locationId}
                onToggle={(e) => setDeliveryOpen((e.currentTarget as HTMLDetailsElement).open)}>
                <summary className="flex cursor-pointer list-none items-center gap-2 text-[12px] text-foreground [&::-webkit-details-marker]:hidden">
                  <MapPin className="size-3.5 shrink-0 text-primary" />
                  <span className="min-w-0 flex-1 truncate">
                    {t("Deliver to", "التوصيل إلى")}: {locName ?? t("Choose a place", "اختر المكان")} · {slotName}
                  </span>
                  <ChevronDown className="size-3.5 shrink-0 text-icon transition-transform group-open:rotate-180" />
                </summary>
                <div className="mt-3 flex flex-col gap-5">
                {/* delivery — kept from the existing ordering flow */}
                <div>
                  <div className="mb-2 flex items-center justify-between gap-2 px-1">
                    <span className="text-[13px] font-semibold text-foreground">{t("Deliver to", "التوصيل إلى")}</span>
                    {locationId && locationId !== prefs.locationId && (
                      <button type="button" onClick={() => setPrefs({ locationId })} className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline">
                        <Star className="size-3" />{t("Make this my default", "اجعله الافتراضي")}
                      </button>
                    )}
                  </div>
                  <div className="relative mb-2">
                    <MapPin className="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-icon" />
                    <TextInput value={locQuery} onChange={(e) => setLocQuery(e.target.value)} placeholder={t("Search locations…", "ابحث عن الموقع…")} className="ps-8" />
                  </div>
                  <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg bg-background p-1 [scrollbar-width:thin]">
                    {locOptions.map((l) => (
                      <button key={l.id} type="button" onClick={() => setLocationId(l.id)}
                        className={cn("flex w-full items-center gap-1.5 rounded-md px-2.5 py-1.5 text-start text-[12px] transition-colors",
                          locationId === l.id ? "bg-soft-accent font-semibold text-primary" : "text-foreground hover:bg-secondary/60")}>
                        {isAr ? l.nameAr : l.name}
                        {l.id === prefs.locationId && <Star className="size-3 shrink-0 fill-primary/30 text-primary" />}
                      </button>
                    ))}
                    {locOptions.length === 0 && <p className="px-2.5 py-3 text-center text-[12px] text-muted-foreground">{t("No matching location", "لا يوجد موقع مطابق")}</p>}
                  </div>
                </div>
                <div>
                  {label(t("When", "الوقت"))}
                  <div className="flex flex-wrap gap-1.5">
                    {slots.map((s) => (
                      <button key={s.id} type="button" onClick={() => setSlotId(s.id)}
                        className={cn("inline-flex h-7 items-center gap-1 rounded-full px-3 text-[11.5px] font-medium transition-colors",
                          slotId === s.id ? "bg-soft-accent text-primary" : "bg-background text-foreground hover:bg-secondary/60")}>
                        {s.id === "now" && <Clock className="size-3" />}
                        {isAr ? s.labelAr : s.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  {label(t("Note for the team", "ملاحظة للفريق"))}
                  <TextArea value={note} onChange={(e) => setNote(e.target.value)} rows={2}
                    placeholder={t("Extra cups, deliver before the meeting…", "أكواب إضافية، التوصيل قبل الاجتماع…")} />
                </div>
                </div>
              </details>

              {/* keep this basket under a name — up to four */}
              {lines.length > 0 && (
                <div className="rounded-[10px] bg-background p-3">
                  {savedUsual ? (
                    <p className="flex items-center justify-center gap-1.5 text-[12px] font-semibold text-success"><BookmarkCheck className="size-3.5" />{t("Saved", "تم الحفظ")}</p>
                  ) : shelfFull && !replacing ? (
                    <div className="space-y-2">
                      <p className="text-[11.5px] text-muted-foreground">{t(`You have ${MAX_USUALS} saved orders — replace one to keep this.`, `لديك ${MAX_USUALS} طلبات محفوظة — استبدل أحدها للاحتفاظ بهذا الطلب.`)}</p>
                      <OutlineButton size="sm" className="w-full" onClick={() => setReplacing(true)}><Bookmark className="size-3.5" />{t("Replace one", "استبدال")}</OutlineButton>
                    </div>
                  ) : replacing ? (
                    <div className="space-y-1.5">
                      <p className="text-[11.5px] font-semibold text-muted-foreground">{t("Which one does this replace?", "أي طلب محفوظ تريد استبداله؟")}</p>
                      {prefs.usuals.map((u) => (
                        <button key={u.id} type="button"
                          onClick={() => { replaceUsual(u.id, lines, note.trim() || undefined); setPrefs({ locationId }); setReplacing(false); keepSaved() }}
                          className="flex w-full items-center justify-between gap-2 rounded-lg bg-card px-2.5 py-1.5 text-[12px] hover:text-primary">
                          <span className="min-w-0 truncate font-medium">{u.name}</span>
                          <span className="shrink-0 text-[11px] text-muted-foreground">{u.lines.length} {t("items", "أصناف")}</span>
                        </button>
                      ))}
                      <button type="button" onClick={() => setReplacing(false)} className="w-full pt-1 text-[11.5px] text-muted-foreground hover:text-foreground">{t("Cancel", "إلغاء")}</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <TextInput value={usualName} onChange={(e) => setUsualName(e.target.value)} placeholder={t("Name it — Morning karak…", "سمِّ هذا الطلب")} className="flex-1 bg-card" />
                      <GoldButton size="sm" disabled={!usualName.trim()}
                        onClick={() => { if (!saveUsual(usualName.trim(), lines, note.trim() || undefined)) return; setPrefs({ locationId }); setUsualName(""); keepSaved() }}>
                        <Bookmark className="size-3.5" />{t("Save", "حفظ كطلب معتاد")}
                      </GoldButton>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <OutlineButton size="sm" onClick={() => navigate("/cafeteria/orders")}>
                  <ClipboardList className="size-3.5" />{t("My orders", "طلباتي")}
                  {mine.length > 0 && <span className="rounded-full bg-soft-accent px-1.5 text-[10px] text-primary">{mine.length}</span>}
                </OutlineButton>
                <OutlineButton size="sm" onClick={() => navigate("/cafeteria/admin")}>
                  <ShieldCheck className="size-3.5" />{t("Service queue", "قائمة الخدمة")}
                </OutlineButton>
              </div>
              <p className="text-center text-[11px] text-muted-foreground">{t("Provided free to ALTANFEETHI employees.", "خدمة مجانية لمنسوبي التنفيذي.")}</p>
            </div>
          </Card>

          {/* My usuals — one-tap reorder, confirmed before sending */}
          {prefs.usuals.length > 0 && (
            <Card>
              <div className="flex items-start justify-between gap-3">
                <CardTitle icon={Star}>{t("My usuals", "طلباتي المعتادة")}</CardTitle>
                <span className="text-[12px] text-muted-foreground tabular-nums">{prefs.usuals.length}/{MAX_USUALS}</span>
              </div>
              <ul className="mt-4 flex flex-col gap-3">
                {prefs.usuals.map((u) => (
                  <li key={u.id} className="rounded-[10px] border border-[var(--card-ring)] bg-background p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold text-foreground">{u.name}</div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {u.lines.map((l) => {
                            const m = itemById(l.itemId)
                            return m ? (
                              <span key={l.itemId} className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-foreground">
                                {l.qty}× {isAr ? m.nameAr : m.name}{l.sugar && ` · ${sugarLabel(l.sugar, isAr)}`}
                              </span>
                            ) : null
                          })}
                        </div>
                      </div>
                      <button type="button" onClick={() => removeUsual(u.id)} aria-label={t("Remove", "إزالة")} className="grid size-7 place-items-center rounded-md text-muted-foreground hover:text-error">
                        <X className="size-3.5" />
                      </button>
                    </div>
                    {confirmUsual?.id === u.id ? (
                      <div className="mt-3 space-y-2 rounded-lg bg-soft-accent p-3">
                        <p className="text-[12px] font-semibold text-foreground">{t(`Send "${u.name}" now?`, `تأكيد الطلب: «${u.name}»`)}</p>
                        <p className="text-[11.5px] text-muted-foreground">
                          {t("Deliver to", "التوصيل إلى")}{" "}
                          <span className="font-semibold text-foreground">{(() => { const l = locations.find((x) => x.id === confirmLoc); return l ? (isAr ? l.nameAr : l.name) : "—" })()}</span>
                        </p>
                        <TextInput value={confirmQuery} onChange={(e) => setConfirmQuery(e.target.value)} placeholder={t("Change the place — search locations…", "ابحث عن الموقع…")} />
                        {confirmQuery.trim() !== "" && (
                          <div className="max-h-32 space-y-1 overflow-y-auto rounded-lg bg-card p-1">
                            {confirmOptions.map((l) => (
                              <button key={l.id} type="button" onClick={() => { setConfirmLoc(l.id); setConfirmQuery("") }}
                                className="block w-full rounded-md px-2 py-1 text-start text-[12px] hover:bg-secondary/60">{isAr ? l.nameAr : l.name}</button>
                            ))}
                            {confirmOptions.length === 0 && <p className="px-2 py-2 text-center text-[12px] text-muted-foreground">{t("No matching location", "لا يوجد موقع مطابق")}</p>}
                          </div>
                        )}
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <button type="button" onClick={() => { applyUsual(u); setConfirmUsual(null) }} className="text-[11.5px] text-muted-foreground underline underline-offset-2 hover:text-foreground">
                            {t("Edit before sending", "تعديل قبل الإرسال")}
                          </button>
                          <OutlineButton size="sm" onClick={() => setConfirmUsual(null)}>{t("Cancel", "إلغاء")}</OutlineButton>
                          <GoldButton size="sm" onClick={placeUsual}><Send className="size-3" />{t("Confirm & send", "تأكيد وإرسال")}</GoldButton>
                        </div>
                      </div>
                    ) : (
                      <OutlineButton size="sm" className="mt-2" onClick={() => { setConfirmUsual(u); setConfirmLoc(prefs.locationId); setConfirmQuery("") }}>
                        <RotateCcw className="size-3" />{t("Order this", "اطلبه مرة أخرى")}
                      </OutlineButton>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        {/* ── menu ── */}
        <div className="min-w-0 space-y-6">
          {/* search + filter */}
          <div className="panel flex flex-wrap items-center justify-between gap-6 rounded-xl px-[18px] py-4">
            <label className="relative flex h-[33px] min-w-[200px] max-w-[394px] flex-1 items-center gap-2 rounded-lg bg-background pe-3 ps-2">
              <Search className="size-4 shrink-0 text-icon" />
              <input value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder={t("Search drinks, snacks", "أبحث عن المشروبات، الوجبات الخفيفة")}
                className="h-full min-w-0 flex-1 bg-transparent text-[12px] text-foreground outline-none placeholder:text-foreground/90" />
            </label>
            <div role="tablist" className="flex flex-wrap gap-0.5 rounded-[9px] bg-card p-1 shadow-[inset_0_0_0_1px_var(--card-ring)]">
              {[{ id: "all" as const, label: "All", labelAr: "الكل" }, ...menuGroups].map((g) => (
                <button key={g.id} type="button" role="tab" aria-selected={group === g.id} onClick={() => setGroup(g.id)}
                  className={cn("min-h-[42px] w-[86px] rounded-md px-1 py-1 leading-tight transition-colors",
                    group === g.id ? "bg-soft-accent text-[15px] font-semibold text-primary" : "text-[13px] text-foreground hover:bg-secondary/60")}>
                  {isAr ? g.labelAr : g.label}
                </button>
              ))}
            </div>
          </div>

          {group === "all" && favourites.length > 0 && (
            <MenuSection title={t("Browse favorites", "تصفّح قائمة المفضلة")}>
              {favourites.map((m) => (
                <ProductCard key={`fav-${m.id}`} m={m} line={lineOf(m.id)} sugar={sugarOf(m)} fav
                  onFav={() => toggleFavorite(m.id)} onAdd={() => bump(m.id, 1)} onMinus={() => bump(m.id, -1)}
                  onRemove={() => removeLine(m.id)} onSugar={(s) => setSugar(m.id, s)} />
              ))}
            </MenuSection>
          )}

          {sections.map((g) => (
            <MenuSection key={g.id} title={t(`Browse ${g.label.toLowerCase()}`, `تصفّح قائمة ${g.labelAr}`)}>
              {g.items.map((m) => (
                <ProductCard key={m.id} m={m} line={lineOf(m.id)} sugar={sugarOf(m)} fav={prefs.favorites.includes(m.id)}
                  onFav={() => toggleFavorite(m.id)} onAdd={() => bump(m.id, 1)} onMinus={() => bump(m.id, -1)}
                  onRemove={() => removeLine(m.id)} onSugar={(s) => setSugar(m.id, s)} />
              ))}
            </MenuSection>
          ))}

          {nothing && (
            <Card><EmptyState icon={Search} title={t("Nothing on the menu matches that.", "لا يوجد عنصر مطابق في القائمة.")} /></Card>
          )}
          {hiddenByPlace > 0 && (
            <p className="text-center text-[11.5px] text-muted-foreground">
              {t(`${hiddenByPlace} more items are not served at ${chosenPlace?.name}.`, `هناك ${hiddenByPlace} أصناف إضافية لا تُقدّم في ${chosenPlace?.nameAr}.`)}
            </p>
          )}
        </div>
      </div>
    </PageBody>
  )
}

function MenuSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="px-4">
      <CardHeader icon={LayoutGrid} title={title} />
      <div className="grid gap-6 px-0 pb-6 pt-[18px] sm:grid-cols-2 sm:gap-8 sm:px-4">{children}</div>
    </Card>
  )
}

/** Product card: 24px padding, 29px gaps, image 310×290, 16px medium title,
 *  "Order the drink" or a stepper + delete, and the sugar segmented control. */
function ProductCard({ m, line, sugar, fav, onFav, onAdd, onMinus, onRemove, onSugar }: {
  m: MenuItem; line?: OrderLine; sugar: SugarLevel; fav: boolean
  onFav: () => void; onAdd: () => void; onMinus: () => void; onRemove: () => void; onSugar: (s: SugarLevel) => void
}) {
  const { t, isAr } = useT()
  const isDrink = m.group === "hot" || m.group === "cold"
  return (
    <article className={cn("flex flex-col gap-[29px] rounded-[10px] border border-[var(--card-ring)] bg-background p-6", !m.available && "opacity-60")}>
      <div className="relative">
        <ImagePlaceholder icon={groupIcon[m.group]} className="aspect-[310/290] w-full" />
        <HeartButton on={fav} onClick={onFav} className="absolute end-4 top-4" />
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h4 className="text-[16px] font-medium leading-[25px] text-foreground">{isAr ? m.nameAr : m.name}</h4>
          {!m.available && <p className="text-[11px] text-muted-foreground">{t("Not available today", "غير متوفر اليوم")}</p>}
          {m.available && (m.note || m.noteAr) && <p className="text-[11px] text-muted-foreground">{isAr ? m.noteAr : m.note}</p>}
        </div>
        {line ? (
          <div className="flex shrink-0 items-center gap-5">
            <QtyStepper qty={line.qty} onMinus={onMinus} onPlus={onAdd} />
            <TrashButton onClick={onRemove} />
          </div>
        ) : (
          <GoldButton size="sm" className="h-8 shrink-0 px-5 font-medium" disabled={!m.available} onClick={onAdd}>
            {isDrink ? t("Order Drink", "طلب المشروب") : t("Order", "طلب")}
          </GoldButton>
        )}
      </div>
      {m.takesSugar && (
        <div className="flex gap-0.5 rounded-[9px] bg-card p-[3px]">
          {SUGAR_UI.map((s) => (
            <button key={s} type="button" onClick={() => onSugar(s)} aria-pressed={sugar === s}
              className={cn("h-[30px] flex-1 rounded-md transition-colors",
                sugar === s ? "bg-soft-accent text-[15px] font-semibold text-primary" : "text-[13px] text-foreground hover:bg-secondary/60")}>
              {sugarLabel(s, isAr)}
            </button>
          ))}
        </div>
      )}
    </article>
  )
}

function QtyStepper({ qty, onMinus, onPlus, size = "md" }: { qty: number; onMinus: () => void; onPlus: () => void; size?: "sm" | "md" }) {
  const { t } = useT()
  const btn = cn("grid shrink-0 place-items-center rounded-full bg-secondary text-foreground hover:bg-secondary/70", size === "sm" ? "size-6" : "size-8")
  return (
    <div className={cn("flex items-center", size === "sm" ? "gap-2" : "gap-4")}>
      <button type="button" onClick={onMinus} className={btn} aria-label={t("Remove one", "إنقاص واحد")}><Minus className={size === "sm" ? "size-3" : "size-4"} /></button>
      <span className={cn("min-w-3 text-center tabular-nums text-foreground", size === "sm" ? "text-[12px] font-medium" : "text-[16px] font-semibold")}>{qty}</span>
      <button type="button" onClick={onPlus} className={btn} aria-label={t("Add one", "إضافة واحد")}><Plus className={size === "sm" ? "size-3" : "size-4"} /></button>
    </div>
  )
}

function TrashButton({ onClick, size = "md" }: { onClick: () => void; size?: "sm" | "md" }) {
  const { t } = useT()
  return (
    <button type="button" onClick={onClick} aria-label={t("Remove from the order", "إزالة من الطلب")}
      className={cn("grid shrink-0 place-items-center rounded-full bg-error/35 text-error hover:bg-error/50", size === "sm" ? "size-7" : "size-8")}>
      <Trash2 className="size-3.5" />
    </button>
  )
}

function HeartButton({ on, onClick, size = "md", className }: { on: boolean; onClick: () => void; size?: "sm" | "md"; className?: string }) {
  const { t } = useT()
  return (
    <button type="button" onClick={onClick} aria-pressed={on} aria-label={on ? t("Remove from favourites", "إزالة من المفضلة") : t("Add to favourites", "إضافة إلى المفضلة")}
      className={cn("grid shrink-0 place-items-center border border-secondary bg-background shadow-sm",
        size === "sm" ? "size-[30px] rounded-lg" : "size-10 rounded-[9.4px]", className)}>
      <Heart className={cn(size === "sm" ? "size-3.5" : "size-4", on ? "fill-error text-error" : "text-foreground")} />
    </button>
  )
}
