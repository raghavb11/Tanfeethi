import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button, Card, Input } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import { ArrowLeft, Check } from "lucide-react"


import {
  addLocation, addMenuItem, getLocation, getMenuItem, locations, type MenuGroupId,
  menuGroups, newLocationId, newMenuItemId, sites, updateLocation, updateMenuItem,
} from "../data/mock/cafeteria"

/** Add or edit one menu item, or one delivery place. A full routed page, not a
 *  dialog. The two forms live together because they are the same shape of work. */
export default function CafeteriaItemEditorPage({ kind }: { kind: "item" | "place" }) {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const { id } = useParams()

  const item = kind === "item" && id ? getMenuItem(id) : undefined
  const place = kind === "place" && id ? getLocation(id) : undefined
  const editing = !!(item || place)

  const back = kind === "item" ? "/config/cafeteria" : "/config/cafeteria?tab=places"

  // shared
  const [name, setName] = React.useState(item?.name ?? place?.name ?? "")
  const [nameAr, setNameAr] = React.useState(item?.nameAr ?? place?.nameAr ?? "")
  const [active, setActive] = React.useState(item?.available ?? place?.active ?? true)

  // menu item only
  const [group, setGroup] = React.useState<MenuGroupId>(item?.group ?? "hot")
  const [note, setNote] = React.useState(item?.note ?? "")
  const [popular, setPopular] = React.useState(item?.popular ?? false)
  const [takesSugar, setTakesSugar] = React.useState(item?.takesSugar ?? false)
  // where the item can be ordered to
  const [servedScope, setServedScope] = React.useState(item?.servedScope ?? "all")
  const [servedSites, setServedSites] = React.useState<string[]>(item?.servedSites ?? [])
  const [servedPlaces, setServedPlaces] = React.useState<string[]>(item?.servedPlaces ?? [])
  const toggle = (arr: string[], v: string) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]

  // place only
  const knownSites = sites()
  const [site, setSite] = React.useState(place?.site ?? knownSites[0] ?? "Headquarters")
  const [siteAr, setSiteAr] = React.useState(place?.siteAr ?? "")

  const canSave = name.trim() !== "" && (kind === "item" || site.trim() !== "")

  const save = () => {
    if (!canSave) return
    if (kind === "item") {
      const fields = {
        group, name: name.trim(), nameAr: nameAr.trim() || name.trim(),
        note: note.trim() || undefined, noteAr: note.trim() || undefined,
        popular: popular || undefined, available: active,
        takesSugar: takesSugar || undefined,
        servedScope,
        servedSites: servedScope === "sites" ? servedSites : undefined,
        servedPlaces: servedScope === "places" ? servedPlaces : undefined,
      }
      if (item) updateMenuItem(item.id, fields)
      else addMenuItem({ id: newMenuItemId(name), ...fields })
    } else {
      // an existing site keeps its Arabic name so the grouping stays consistent
      const known = knownSites.includes(site.trim())
      const fields = {
        name: name.trim(), nameAr: nameAr.trim() || name.trim(),
        site: site.trim(),
        siteAr: siteAr.trim() || (known ? place?.siteAr ?? site.trim() : site.trim()),
        active,
      }
      if (place) updateLocation(place.id, fields)
      else addLocation({ id: newLocationId(name), ...fields })
    }
    navigate(back)
  }

  const label = (s: string) => (
    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{s}</label>
  )

  const heading = kind === "item"
    ? (editing ? t("Edit menu item", "تعديل صنف") : t("New menu item", "صنف جديد"))
    : (editing ? t("Edit delivery place", "تعديل موقع التوصيل") : t("New delivery place", "موقع توصيل جديد"))

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate(back)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />
          {t("Back to cafeteria settings", "العودة إلى إعدادات الكافتيريا")}
        </button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(back)}>{t("Cancel", "إلغاء")}</Button>
          <Button disabled={!canSave} onClick={save}>
            <Check className="size-4" />
            {editing ? t("Save changes", "حفظ التغييرات") : t("Add", "إضافة")}
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">{heading}</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {kind === "item"
            ? t("Everything here shows on the ordering screen and in the tea-boy queue.",
                "كل ما هنا يظهر في شاشة الطلب وطابور خدمة الضيافة.")
            : t("Places are grouped by site on the ordering screen.",
                "تُجمَّع المواقع حسب المبنى في شاشة الطلب.")}
        </p>
      </div>

      <Card className="p-5">
        <div className="space-y-5">
          <div>
            {label(kind === "item" ? t("Item name", "اسم الصنف") : t("Place name", "اسم الموقع"))}
            <Input value={name} onChange={(e) => setName(e.target.value)}
                   placeholder={kind === "item"
                     ? t("Karak tea, Fresh juice…", "شاي كرك، عصير طازج…")
                     : t("HQ · Level 14 · Boardroom", "المقر · الطابق 14 · قاعة المجلس")} />
          </div>

          <div>
            {label(t("Name in Arabic", "الاسم بالعربية"))}
            <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} dir="rtl"
                   placeholder={t("Optional — falls back to the English name", "اختياري — يُستخدم الاسم الإنجليزي إن تُرك فارغًا")} />
          </div>

          {kind === "item" ? (
            <>
              <div>
                {label(t("Group", "المجموعة"))}
                <div className="flex flex-wrap gap-1.5">
                  {menuGroups.map((g) => (
                    <button
                      key={g.id} type="button" onClick={() => setGroup(g.id)}
                      className={cn("rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                        group === g.id ? "border-primary/40 bg-primary/12 text-primary"
                                       : "border-border text-muted-foreground hover:bg-muted/40")}
                    >
                      {isAr ? g.labelAr : g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                {label(t("Note", "ملاحظة"))}
                <Input value={note} onChange={(e) => setNote(e.target.value)}
                       placeholder={t("Served with dates · Orange, mango or mixed", "تُقدَّم مع التمر · برتقال، مانجو أو مشكّل")} />
              </div>

              {/* served where */}
              <div>
                {label(t("Served at", "يُقدّم في"))}
                <div className="flex flex-wrap gap-1.5">
                  {([["all", t("Everywhere", "كل المواقع")],
                     ["sites", t("Selected sites", "مبانٍ محددة")],
                     ["places", t("Selected places", "مواقع محددة")]] as const).map(
                    ([id, text]) => (
                      <button
                        key={id} type="button" onClick={() => setServedScope(id)}
                        className={cn("rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                          servedScope === id ? "border-primary/40 bg-primary/12 text-primary"
                                             : "border-border text-muted-foreground hover:bg-muted/40")}
                      >
                        {text}
                      </button>
                    ))}
                </div>

                {servedScope === "sites" && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {knownSites.map((s) => (
                      <button
                        key={s} type="button" onClick={() => setServedSites(toggle(servedSites, s))}
                        aria-pressed={servedSites.includes(s)}
                        className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[12px] transition-colors",
                          servedSites.includes(s) ? "border-primary/40 bg-primary/12 text-primary"
                                                  : "border-border text-muted-foreground hover:bg-muted/40")}
                      >
                        {servedSites.includes(s) && <Check className="size-3" />}{s}
                      </button>
                    ))}
                  </div>
                )}

                {servedScope === "places" && (
                  <div className="mt-2.5 max-h-56 space-y-1 overflow-y-auto rounded-xl border border-border/60 p-2">
                    {locations.map((l) => (
                      <label key={l.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-[12.5px] hover:bg-muted/40">
                        <input
                          type="checkbox" checked={servedPlaces.includes(l.id)}
                          onChange={() => setServedPlaces(toggle(servedPlaces, l.id))}
                          className="size-3.5 shrink-0 accent-[var(--primary)]"
                        />
                        <span className="min-w-0 truncate">{isAr ? l.nameAr : l.name}</span>
                      </label>
                    ))}
                  </div>
                )}

                <p className="mt-1.5 text-[11px] text-muted-foreground/75">
                  {servedScope === "all"
                    ? t("Anyone can order it to any delivery place.", "يمكن طلبه إلى أي موقع توصيل.")
                    : t("It is hidden from the ordering screen when the chosen place is not on the list.",
                        "يُخفى من شاشة الطلب إذا لم يكن الموقع ضمن القائمة.")}
                </p>
              </div>

              <Toggle
                checked={takesSugar} onChange={setTakesSugar}
                title={t("Ask for a sugar level", "اسأل عن مستوى السكر")}
                body={t("Hot drinks are ordered with none, light, medium or sweet.",
                        "تُطلب المشروبات الساخنة بدون سكر أو خفيف أو وسط أو زيادة.")}
              />
              <Toggle
                checked={popular} onChange={setPopular}
                title={t("Show under Popular", "إظهاره ضمن الأكثر طلبًا")}
                body={t("Pinned to the top of the ordering screen.", "يُثبَّت في أعلى شاشة الطلب.")}
              />
              <Toggle
                checked={active} onChange={setActive}
                title={t("On the menu", "متاح في القائمة")}
                body={t("Turn this off when the kitchen runs out — it stays configured.",
                        "أوقفه عند نفاد الصنف من المطبخ، ويبقى معرَّفًا.")}
              />
            </>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  {label(t("Site", "المبنى"))}
                  <Input list="cafeteria-sites" value={site} onChange={(e) => setSite(e.target.value)}
                         placeholder={t("Headquarters, Terminal 1…", "المقر الرئيسي، الصالة 1…")} />
                  <datalist id="cafeteria-sites">
                    {knownSites.map((s) => <option key={s} value={s} />)}
                  </datalist>
                  <p className="mt-1.5 text-[11px] text-muted-foreground/75">
                    {t("Pick an existing site or type a new one.", "اختر مبنى موجودًا أو اكتب مبنى جديدًا.")}
                  </p>
                </div>
                <div>
                  {label(t("Site in Arabic", "المبنى بالعربية"))}
                  <Input value={siteAr} onChange={(e) => setSiteAr(e.target.value)} dir="rtl"
                         placeholder={t("Optional", "اختياري")} />
                </div>
              </div>

              <Toggle
                checked={active} onChange={setActive}
                title={t("Delivering here", "التوصيل إلى هنا")}
                body={t("Turn this off during a fit-out or a closure — orders stop, the place stays.",
                        "أوقفه أثناء التجهيز أو الإغلاق، فتتوقف الطلبات ويبقى الموقع.")}
              />
            </>
          )}
        </div>
      </Card>
    </main>
  )
}

function Toggle({ checked, onChange, title, body }: {
  checked: boolean; onChange: (v: boolean) => void; title: string; body: string
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-border/70 p-3">
      <input
        type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 accent-[var(--primary)]"
      />
      <span className="min-w-0">
        <span className="block text-[12.5px] font-medium">{title}</span>
        <span className="block text-[11.5px] text-muted-foreground">{body}</span>
      </span>
    </label>
  )
}
