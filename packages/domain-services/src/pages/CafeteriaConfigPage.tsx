import * as React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Badge, Button, Card, Input } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  ArrowLeft, ChevronDown, ChevronRight, Coffee, Flame, MapPin, Pencil, Plus,
  Power, Search, Star, Trash2,
} from "lucide-react"

import {
  itemsServedAt, menuGroups, removeLocation, removeMenuItem, servesAt,
  updateLocation, updateMenuItem, useLocations, useMenu,
} from "../data/mock/cafeteria"

type Tab = "menu" | "places"

/** Cafeteria configuration — the menu the portal offers and the places an
 *  order can be delivered to. Both feed the ordering screen and the tea-boy
 *  queue, so a change here is visible to everyone immediately. */
export default function CafeteriaConfigPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  const menu = useMenu()
  const locations = useLocations()

  const tab: Tab = params.get("tab") === "places" ? "places" : "menu"
  const setTab = (v: Tab) => setParams(v === "menu" ? {} : { tab: v }, { replace: true })

  const [q, setQ] = React.useState("")
  const [confirmDelete, setConfirmDelete] = React.useState<string | null>(null)
  // which place is expanded to show what it serves
  const [openPlace, setOpenPlace] = React.useState<string | null>(null)

  const hit = (...vals: string[]) =>
    q === "" || vals.some((v) => v.toLowerCase().includes(q.toLowerCase()))

  const items = menu.filter((m) => hit(m.name, m.nameAr))
  const places = locations.filter((l) => hit(l.name, l.nameAr, l.site))
  const sites = [...new Set(places.map((l) => l.site))]

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 px-4 py-7 md:px-8">
      <button
        onClick={() => navigate("/config")}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />{t("Back to configuration", "العودة إلى الإعدادات")}
      </button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <h1 className="text-[22px] font-bold tracking-tight md:text-[26px]">
            {t("Cafeteria menu & places", "قائمة الكافتيريا والمواقع")}
          </h1>
          <p className="max-w-3xl text-[13px] text-muted-foreground">
            {t("What can be ordered, and where it can be delivered. The ordering screen and the tea-boy queue read from these two lists.",
               "ما يمكن طلبه، وأين يمكن توصيله. تعتمد شاشة الطلب وطابور خدمة الضيافة على هاتين القائمتين.")}
          </p>
        </div>
        <Button
          className="shrink-0"
          onClick={() => navigate(tab === "menu" ? "/config/cafeteria/items/new" : "/config/cafeteria/places/new")}
        >
          <Plus className="size-4" />
          {tab === "menu" ? t("Add item", "إضافة صنف") : t("Add place", "إضافة موقع")}
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-border p-0.5">
          {([["menu", Coffee, t("Menu items", "أصناف القائمة"), menu.length],
             ["places", MapPin, t("Delivery places", "مواقع التوصيل"), locations.length]] as const).map(
            ([id, Icon, text, n]) => (
              <button
                key={id} onClick={() => setTab(id as Tab)} aria-pressed={tab === id}
                className={cn("inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  tab === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
              >
                <Icon className="size-4" />{text}
                <span className={cn("rounded-full px-1.5 text-[11px] tabular-nums",
                  tab === id ? "bg-primary-foreground/20" : "bg-muted")}>{n}</span>
              </button>
            ))}
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)}
                 placeholder={tab === "menu" ? t("Search the menu…", "ابحث في القائمة…") : t("Search places…", "ابحث في المواقع…")}
                 className="w-56 ps-9" />
        </div>
      </div>

      {/* ── menu ── */}
      {tab === "menu" && (
        <div className="space-y-4">
          {menuGroups.map((g) => {
            const rows = items.filter((m) => m.group === g.id)
            if (rows.length === 0) return null
            return (
              <Card key={g.id} className="overflow-hidden p-0">
                <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
                  <span className="text-[13px] font-semibold">{isAr ? g.labelAr : g.label}</span>
                  <span className="ms-auto rounded-full bg-muted px-2 text-[11px] tabular-nums text-muted-foreground">
                    {rows.length}
                  </span>
                </div>
                <div className="divide-y divide-border/40">
                  {rows.map((m) => (
                    <div key={m.id} className="px-4 py-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={cn("text-[13px] font-medium", !m.available && "text-muted-foreground line-through")}>
                              {isAr ? m.nameAr : m.name}
                            </span>
                            {m.popular && (
                              <Badge variant="outline" className="gap-1 border-amber-500/35 bg-amber-500/10 text-[10px] text-amber-600 dark:text-amber-400">
                                <Star className="size-2.5" />{t("Popular", "الأكثر طلبًا")}
                              </Badge>
                            )}
                            {m.takesSugar && (
                              <span className="text-[10.5px] text-muted-foreground/70">{t("Asks for sugar", "يسأل عن السكر")}</span>
                            )}
                            {!m.available && (
                              <Badge variant="outline" className="border-amber-500/35 bg-amber-500/10 text-[10px] text-amber-600 dark:text-amber-400">
                                {t("Off the menu", "خارج القائمة")}
                              </Badge>
                            )}
                          </div>
                          {(isAr ? m.noteAr : m.note) && (
                            <p className="mt-0.5 text-[11.5px] text-muted-foreground/80">{isAr ? m.noteAr : m.note}</p>
                          )}
                          <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground/70">
                            <MapPin className="size-3 shrink-0" />
                            {!m.servedScope || m.servedScope === "all"
                              ? t("Served everywhere", "يُقدّم في كل المواقع")
                              : m.servedScope === "sites"
                                ? t(`Served at: ${(m.servedSites ?? []).join(", ") || "nowhere yet"}`,
                                    `يُقدّم في: ${(m.servedSites ?? []).join("، ") || "لا شيء بعد"}`)
                                : t(`Served at ${(m.servedPlaces ?? []).length} places`,
                                    `يُقدّم في ${(m.servedPlaces ?? []).length} مواقع`)}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-1.5">
                          <Button variant="ghost" size="sm" onClick={() => updateMenuItem(m.id, { available: !m.available })}>
                            <Power className="size-3.5" />
                            {m.available ? t("Take off", "إيقاف") : t("Put back", "إعادة")}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => navigate(`/config/cafeteria/items/${m.id}`)}>
                            <Pencil className="size-3.5" />{t("Edit", "تعديل")}
                          </Button>
                          <Button variant="ghost" size="sm" aria-label={t("Remove", "إزالة")}
                                  onClick={() => setConfirmDelete(confirmDelete === m.id ? null : m.id)}>
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>

                      {confirmDelete === m.id && (
                        <ConfirmRemove
                          title={t(`Remove ${m.name} from the menu?`, `إزالة ${m.nameAr} من القائمة؟`)}
                          body={t("It disappears from the ordering screen. Orders already placed keep their line.",
                                  "سيختفي من شاشة الطلب. تبقى الطلبات المسجّلة كما هي.")}
                          alt={t("Take it off instead", "أوقفه بدلًا من ذلك")}
                          onAlt={() => { updateMenuItem(m.id, { available: false }); setConfirmDelete(null) }}
                          onCancel={() => setConfirmDelete(null)}
                          onConfirm={() => { removeMenuItem(m.id); setConfirmDelete(null) }}
                          t={t}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )
          })}
          {items.length === 0 && <Empty text={t("No menu item matches.", "لا يوجد صنف مطابق.")} />}
        </div>
      )}

      {/* ── places ── */}
      {tab === "places" && (
        <div className="space-y-4">
          {sites.map((site) => {
            const rows = places.filter((l) => l.site === site)
            return (
              <Card key={site} className="overflow-hidden p-0">
                <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
                  <MapPin className="size-4 text-primary" />
                  <span className="text-[13px] font-semibold">{isAr ? rows[0].siteAr : site}</span>
                  <span className="ms-auto rounded-full bg-muted px-2 text-[11px] tabular-nums text-muted-foreground">
                    {rows.length}
                  </span>
                </div>
                <div className="divide-y divide-border/40">
                  {rows.map((l) => (
                    <div key={l.id} className="px-4 py-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <button
                          onClick={() => setOpenPlace(openPlace === l.id ? null : l.id)}
                          aria-expanded={openPlace === l.id}
                          className="flex min-w-0 flex-wrap items-center gap-1.5 text-start"
                        >
                          {openPlace === l.id
                            ? <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
                            : <ChevronRight className={cn("size-3.5 shrink-0 text-muted-foreground", isAr && "rotate-180")} />}
                          <span className={cn("min-w-0 text-[13px] font-medium", !l.active && "text-muted-foreground line-through")}>
                            {isAr ? l.nameAr : l.name}
                          </span>
                          <span className="shrink-0 rounded-full bg-muted px-1.5 text-[11px] tabular-nums text-muted-foreground">
                            {itemsServedAt(l).length}
                          </span>
                          {!l.active && (
                            <Badge variant="outline" className="ms-2 border-amber-500/35 bg-amber-500/10 text-[10px] text-amber-600 dark:text-amber-400">
                              {t("Not delivering", "لا يُوصَّل إليه")}
                            </Badge>
                          )}
                        </button>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <Button variant="ghost" size="sm" onClick={() => updateLocation(l.id, { active: !l.active })}>
                            <Power className="size-3.5" />
                            {l.active ? t("Stop", "إيقاف") : t("Resume", "استئناف")}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => navigate(`/config/cafeteria/places/${l.id}`)}>
                            <Pencil className="size-3.5" />{t("Edit", "تعديل")}
                          </Button>
                          <Button variant="ghost" size="sm" aria-label={t("Remove", "إزالة")}
                                  onClick={() => setConfirmDelete(confirmDelete === l.id ? null : l.id)}>
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>

                      {openPlace === l.id && (
                        <div className="mt-2 rounded-xl border border-border/60 bg-muted/20 p-3">
                          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            {t("Served here", "يُقدّم هنا")}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {itemsServedAt(l).map((m) => (
                              <span key={m.id} className="rounded-full border border-border/70 bg-card px-2 py-0.5 text-[11.5px]">
                                {isAr ? m.nameAr : m.name}
                              </span>
                            ))}
                          </div>
                          {menu.filter((m) => m.available && !servesAt(m, l)).length > 0 && (
                            <>
                              <p className="mb-1.5 mt-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                {t("Not available here", "غير متاح هنا")}
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {menu.filter((m) => m.available && !servesAt(m, l)).map((m) => (
                                  <span key={m.id} className="rounded-full border border-border/60 px-2 py-0.5 text-[11.5px] text-muted-foreground/70">
                                    {isAr ? m.nameAr : m.name}
                                  </span>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {confirmDelete === l.id && (
                        <ConfirmRemove
                          title={t(`Remove ${l.name}?`, `إزالة ${l.nameAr}؟`)}
                          body={t("Nobody will be able to order to this place.", "لن يتمكن أحد من الطلب إلى هذا الموقع.")}
                          alt={t("Stop delivering instead", "أوقف التوصيل بدلًا من ذلك")}
                          onAlt={() => { updateLocation(l.id, { active: false }); setConfirmDelete(null) }}
                          onCancel={() => setConfirmDelete(null)}
                          onConfirm={() => { removeLocation(l.id); setConfirmDelete(null) }}
                          t={t}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )
          })}
          {places.length === 0 && <Empty text={t("No place matches.", "لا يوجد موقع مطابق.")} />}
        </div>
      )}

      <p className="text-[11.5px] text-muted-foreground/75">
        {t("Taking an item off the menu or stopping a place is reversible and keeps the history. Removing deletes the row.",
           "إيقاف صنف أو موقع إجراء قابل للتراجع ويحتفظ بالسجل، أما الإزالة فتحذف السطر نهائيًا.")}
      </p>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <Card className="py-14 text-center">
      <Flame className="mx-auto size-8 text-muted-foreground/30" />
      <p className="mt-3 text-sm text-muted-foreground">{text}</p>
    </Card>
  )
}

/** Removing master data is confirmed, and offers the reversible option first. */
function ConfirmRemove({ title, body, alt, onAlt, onCancel, onConfirm, t }: {
  title: string; body: string; alt: string
  onAlt: () => void; onCancel: () => void; onConfirm: () => void
  t: (en: string, ar: string) => string
}) {
  return (
    <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/[0.05] p-3">
      <p className="text-[12.5px] font-semibold">{title}</p>
      <p className="mt-0.5 text-[12px] text-muted-foreground">{body}</p>
      <div className="mt-2 flex flex-wrap justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>{t("Cancel", "إلغاء")}</Button>
        <Button variant="outline" size="sm" onClick={onAlt}>{alt}</Button>
        <Button size="sm" onClick={onConfirm}>{t("Yes, remove", "نعم، أزل")}</Button>
      </div>
    </div>
  )
}
