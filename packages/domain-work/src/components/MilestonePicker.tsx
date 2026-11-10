import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@reach/shared-core"
import { matchesSearch } from "@reach/shared-ui"
import { Check, ChevronsUpDown, Flag, Plus, Search, X } from "lucide-react"

import { milestonesFor, useMilestones } from "../data/milestones"
import { prettyDate } from "../data/tasks"

/** Searchable single-select over one project's milestones. The list is drawn
 *  in a portal so a card that clips its overflow cannot cut it off. */
export function MilestonePicker({ projectId, value, onChange, isAr, t, onCreate, disabled }: {
  projectId: string
  value: string
  onChange: (id: string) => void
  isAr: boolean
  t: (en: string, ar: string) => string
  onCreate?: () => void
  disabled?: boolean
}) {
  useMilestones()
  const options = projectId ? milestonesFor(projectId) : []
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const ref = React.useRef<HTMLDivElement>(null)
  const panelRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const [pos, setPos] = React.useState<{ left: number; width: number; top?: number; bottom?: number }>()
  const place = React.useCallback(() => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    const below = window.innerHeight - r.bottom
    setPos(below < 320 && r.top > below
      ? { left: r.left, width: r.width, bottom: window.innerHeight - r.top + 4 }
      : { left: r.left, width: r.width, top: r.bottom + 4 })
  }, [])

  React.useEffect(() => {
    if (!open) return
    place()
    const onDoc = (e: MouseEvent) => {
      const n = e.target as Node
      if (ref.current?.contains(n) || panelRef.current?.contains(n)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    document.addEventListener("mousedown", onDoc)
    document.addEventListener("keydown", onKey)
    window.addEventListener("resize", place)
    window.addEventListener("scroll", place, true)
    const id = window.setTimeout(() => inputRef.current?.focus(), 0)
    return () => {
      document.removeEventListener("mousedown", onDoc)
      document.removeEventListener("keydown", onKey)
      window.removeEventListener("resize", place)
      window.removeEventListener("scroll", place, true)
      window.clearTimeout(id)
    }
  }, [open, place])

  const selected = options.find((m) => m.id === value)
  const filtered = options.filter((m) => matchesSearch(query, m.name, m.nameAr, m.code))
  const pick = (id: string) => { onChange(id); setOpen(false); setQuery("") }
  const off = disabled || !projectId

  return (
    <div ref={ref} className="relative">
      <button
        type="button" disabled={off} onClick={() => setOpen((o) => !o)} aria-expanded={open}
        aria-label={t("Milestone", "المعلم")}
        className="flex h-9 w-full items-center gap-[9px] rounded-lg bg-[var(--card-elevated)] px-3 text-start text-[12.5px] font-medium outline-none ring-1 ring-inset ring-[var(--card-ring)] transition-colors focus:border-primary/60 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {selected ? (
          <>
            <Flag className="size-4 shrink-0 text-primary" />
            <span className="min-w-0 flex-1 truncate">{isAr ? selected.nameAr : selected.name}</span>
            <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">{selected.code}</span>
            <span
              role="button" tabIndex={0} aria-label={t("Clear", "مسح")}
              onClick={(e) => { e.stopPropagation(); onChange("") }}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); onChange("") } }}
              className="grid size-5 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-3.5" />
            </span>
          </>
        ) : (
          <span className="min-w-0 flex-1 truncate text-muted-foreground">
            {!projectId
              ? t("Pick a project first", "اختر مشروعًا أولًا")
              : options.length === 0
                ? t("This project has no milestones", "لا توجد معالم لهذا المشروع")
                : t("No milestone", "بدون معلم")}
          </span>
        )}
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
      </button>

      {open && pos && createPortal(
        <div
          ref={panelRef} dir={isAr ? "rtl" : "ltr"}
          style={{ position: "fixed", left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom }}
          className="z-[60] overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-lg ring-1 ring-[var(--card-ring)]"
        >
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder={t("Search milestones…", "ابحث في المعالم…")}
              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {filtered.map((m) => (
              <button
                key={m.id} type="button" onClick={() => pick(m.id)}
                className={cn("flex w-full items-center gap-2 px-3 py-2 text-start text-[13px] transition-colors hover:bg-soft-accent",
                  m.id === value && "bg-primary/10 text-primary")}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium leading-tight">{isAr ? m.nameAr : m.name}</span>
                  <span className="block truncate text-[11px] leading-tight text-muted-foreground">
                    {m.code} · {t("due", "يستحق")} {prettyDate(m.dueISO)}
                  </span>
                </span>
                {m.id === value && <Check className="size-3.5 shrink-0" />}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-4 text-center text-[12.5px] text-muted-foreground">
                {t("No milestone matches.", "لا يوجد معلم مطابق.")}
              </p>
            )}
          </div>
          {onCreate && (
            <button
              type="button" onClick={() => { setOpen(false); onCreate() }}
              className="flex w-full items-center gap-2 border-t border-border px-3 py-2.5 text-start text-[12.5px] font-medium text-primary transition-colors hover:bg-primary/[0.06]"
            >
              <Plus className="size-3.5" />{t("Add a milestone", "إضافة معلم")}
            </button>
          )}
        </div>,
        document.body,
      )}
    </div>
  )
}
