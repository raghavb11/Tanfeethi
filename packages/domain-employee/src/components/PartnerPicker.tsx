import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@reach/shared-core"
import { matchesSearch } from "@reach/shared-ui"
import { Check, ChevronsUpDown, Handshake, Plus, Search, X } from "lucide-react"

import { CATEGORY, PARTNER_STATUS, usePartners } from "../data/mock/partners"

/** Searchable single-select over the partner master. Opens under the trigger —
 *  never a modal. The list is drawn in a portal at the page layer, because the
 *  picker often sits inside a card that clips its overflow. */
export function PartnerPicker({ value, onChange, isAr, t, onCreate, activeOnly = true, clearable = true }: {
  value: string
  onChange: (id: string) => void
  isAr: boolean
  t: (en: string, ar: string) => string
  onCreate?: () => void
  /** Suspended partners cannot take new offers, so they are hidden by default. */
  activeOnly?: boolean
  clearable?: boolean
}) {
  const all = usePartners()
  const partners = activeOnly ? all.filter((p) => p.status === "active" || p.id === value) : all
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const ref = React.useRef<HTMLDivElement>(null)
  const panelRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  /** Where the panel sits, in viewport coordinates. It opens upward when there
   *  is not room below. */
  const PANEL_MAX = 360
  const [pos, setPos] = React.useState<{ left: number; width: number; top?: number; bottom?: number }>()
  const place = React.useCallback(() => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    const below = window.innerHeight - r.bottom
    setPos(below < PANEL_MAX && r.top > below
      ? { left: r.left, width: r.width, bottom: window.innerHeight - r.top + 4 }
      : { left: r.left, width: r.width, top: r.bottom + 4 })
  }, [])

  React.useEffect(() => {
    if (!open) return
    place()
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node
      // the panel lives outside the trigger's tree, so both count as inside
      if (ref.current?.contains(target) || panelRef.current?.contains(target)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    document.addEventListener("mousedown", onDoc)
    document.addEventListener("keydown", onKey)
    window.addEventListener("resize", place)
    window.addEventListener("scroll", place, true)       // any scrolling ancestor
    const id = window.setTimeout(() => inputRef.current?.focus(), 0)
    return () => {
      document.removeEventListener("mousedown", onDoc)
      document.removeEventListener("keydown", onKey)
      window.removeEventListener("resize", place)
      window.removeEventListener("scroll", place, true)
      window.clearTimeout(id)
    }
  }, [open, place])

  const selected = partners.find((p) => p.id === value)
  const filtered = partners.filter((p) => matchesSearch(query, p.name, p.nameAr, p.code))

  const pick = (id: string) => { onChange(id); setOpen(false); setQuery("") }

  return (
    <div ref={ref} className="relative">
      <button
        type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
        aria-label={t("Partner", "الشريك")}
        className="flex h-9 w-full items-center gap-2 rounded-lg border border-border bg-background px-3 text-start text-[13px] outline-none transition-colors focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
      >
        {selected ? (
          <>
            <Handshake className="size-4 shrink-0 text-primary" />
            <span className="min-w-0 flex-1 truncate">{isAr ? selected.nameAr : selected.name}</span>
            <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground" dir="ltr">{selected.code}</span>
            {clearable && (
              <span
                role="button" tabIndex={0} aria-label={t("Clear", "مسح")}
                onClick={(e) => { e.stopPropagation(); onChange("") }}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); onChange("") } }}
                className="grid size-5 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="size-3.5" />
              </span>
            )}
          </>
        ) : (
          <span className="min-w-0 flex-1 truncate text-muted-foreground">{t("Select a partner", "اختر شريكًا")}</span>
        )}
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
      </button>

      {open && pos && createPortal(
        <div
          ref={panelRef}
          dir={isAr ? "rtl" : "ltr"}
          style={{ position: "fixed", left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom }}
          className="z-[60] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg"
        >
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder={t("Search partners…", "ابحث في الشركاء…")}
              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="max-h-64 overflow-y-auto py-1">
            {filtered.map((p) => (
              <button
                key={p.id} type="button" onClick={() => pick(p.id)}
                className={cn("flex w-full items-center gap-2 px-3 py-2 text-start text-[13px] transition-colors hover:bg-secondary",
                  p.id === value && "bg-soft-accent text-primary")}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium leading-tight">{isAr ? p.nameAr : p.name}</span>
                  <span className="block truncate text-[11px] leading-tight text-muted-foreground">
                    {p.code} · {isAr ? CATEGORY[p.category].ar : CATEGORY[p.category].en}
                  </span>
                </span>
                {p.status !== "active" && (
                  <span className={cn("shrink-0 rounded-md border px-1.5 py-0.5 text-[11px]", PARTNER_STATUS[p.status].chip)}>
                    {isAr ? PARTNER_STATUS[p.status].ar : PARTNER_STATUS[p.status].en}
                  </span>
                )}
                {p.id === value && <Check className="size-3.5 shrink-0" />}
              </button>
            ))}

            {filtered.length === 0 && (
              <p className="px-3 py-4 text-center text-[12.5px] text-muted-foreground">
                {t("No partner matches.", "لا يوجد شريك مطابق.")}
              </p>
            )}
          </div>

          {onCreate && (
            <button
              type="button"
              onClick={() => { setOpen(false); onCreate() }}
              className="flex w-full items-center gap-2 border-t border-border px-3 py-2.5 text-start text-[13px] font-medium text-primary transition-colors hover:bg-soft-accent"
            >
              <Plus className="size-3.5" />{t("Add a new partner", "إضافة شريك جديد")}
            </button>
          )}
        </div>,
        document.body,
      )}
    </div>
  )
}
