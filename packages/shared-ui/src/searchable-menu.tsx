/** Searchable dropdown menu pieces (BUILD-GUIDELINES D3 — "keep the name DD searchable everywhere").
 *
 *  - `normalizeSearch` / `matchesSearch`: case-insensitive, Arabic-normalised matching
 *    (tashkeel + tatweel ignored; أ/إ/آ/ٱ/ا, ى/ي and ة/ه treated as equal).
 *  - `useMenuSearch`: query state, filtered results, ↑/↓ active row, Enter picks, Esc closes;
 *    the query resets whenever the menu closes.
 *  - `MenuSearchInput` / `MenuNoMatches`: the pinned search row and the empty state, for
 *    packages that keep their own menu markup.
 *  - `SearchableSelect`: a complete popover listbox (single or multi) behind a trigger the
 *    caller renders — used to replace native <select>s without changing the closed field. */
import * as React from "react"
import { createPortal } from "react-dom"
import { Check, Search } from "lucide-react"

import { cn } from "@reach/shared-core"

// ── matching ────────────────────────────────────────────────────────────────
const TASHKEEL = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g

export function normalizeSearch(s: string | undefined | null): string {
  if (!s) return ""
  return s
    .normalize("NFKC")
    .toLowerCase()
    .replace(TASHKEEL, "")
    .replace(/[أإآٱا]/g, "ا")
    .replace(/[ىي]/g, "ي")
    .replace(/[ةه]/g, "ه")
    .replace(/\s+/g, " ")
    .trim()
}

/** True when every word of the query appears in one of the texts (normalised). */
export function matchesSearch(query: string, ...texts: (string | undefined | null)[]): boolean {
  const q = normalizeSearch(query)
  if (!q) return true
  const hay = texts.map(normalizeSearch).join(" \u0000 ")
  return q.split(" ").every((w) => hay.includes(w))
}

/** Default menu search placeholder / empty text. */
export function menuSearchCopy(isAr: boolean) {
  return isAr
    ? { placeholder: "ابحث بالاسم", empty: "لا توجد نتائج" }
    : { placeholder: "Search by name", empty: "No matches" }
}

/** Locale fallback when a caller doesn't pass `isAr` (the shell keeps <html lang> in sync). */
export function docIsAr(): boolean {
  return typeof document !== "undefined" && document.documentElement.getAttribute("lang") === "ar"
}

// ── hook ────────────────────────────────────────────────────────────────────
export function useMenuSearch<T>({ items, texts, open, enabled = true, onPick, onClose, isDisabled }: {
  items: T[]
  /** Texts to match for an item — the label and the other-language name (and anything else useful). */
  texts: (item: T) => (string | undefined | null)[]
  open: boolean
  enabled?: boolean
  onPick: (item: T) => void
  onClose: () => void
  isDisabled?: (item: T) => boolean
}) {
  const [query, setQuery] = React.useState("")
  const [active, setActive] = React.useState(-1)
  const listRef = React.useRef<HTMLElement | null>(null)

  React.useEffect(() => {
    if (!open) { setQuery(""); setActive(-1) }
  }, [open])

  const results = React.useMemo(
    () => (enabled && query.trim() ? items.filter((it) => matchesSearch(query, ...texts(it))) : items),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, query, enabled],
  )

  // typing restarts the highlight at the first result
  React.useEffect(() => { setActive(query.trim() ? 0 : -1) }, [query])

  React.useEffect(() => {
    if (active < 0 || !listRef.current) return
    const el = listRef.current.querySelector<HTMLElement>(`[data-menu-idx="${active}"]`)
    el?.scrollIntoView({ block: "nearest" })
  }, [active])

  const move = (dir: 1 | -1) => {
    if (results.length === 0) return
    setActive((prev) => {
      let i = prev
      for (let n = 0; n < results.length; n++) {
        i = i < 0 ? (dir === 1 ? 0 : results.length - 1) : (i + dir + results.length) % results.length
        if (!isDisabled?.(results[i])) break
      }
      return i
    })
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); move(1) }
    else if (e.key === "ArrowUp") { e.preventDefault(); move(-1) }
    else if (e.key === "Home" && !enabled) { e.preventDefault(); setActive(0) }
    else if (e.key === "End" && !enabled) { e.preventDefault(); setActive(results.length - 1) }
    else if (e.key === "Enter") {
      const it = results[active >= 0 ? active : 0]
      if (it !== undefined && !(isDisabled?.(it))) { e.preventDefault(); e.stopPropagation(); onPick(it) }
      else e.preventDefault()
    } else if (e.key === "Escape") {
      e.preventDefault(); e.stopPropagation(); setQuery(""); onClose()
    } else if (e.key === "Tab") {
      onClose()
    }
  }

  return { query, setQuery, results, active, setActive, onKeyDown, listRef }
}

// ── presentational pieces ───────────────────────────────────────────────────
/** The pinned search row at the top of an open menu (autofocused). */
export function MenuSearchInput({ value, onChange, onKeyDown, isAr, placeholder, className, ariaControls, activeId }: {
  value: string
  onChange: (v: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  isAr?: boolean
  placeholder?: string
  className?: string
  ariaControls?: string
  activeId?: string
}) {
  const ref = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => {
    const id = window.setTimeout(() => ref.current?.focus({ preventScroll: true }), 0)
    return () => window.clearTimeout(id)
  }, [])
  const copy = menuSearchCopy(isAr ?? docIsAr())
  return (
    <div className={cn("sticky top-0 z-10 -mx-1 -mt-1 mb-1 bg-popover px-1 pt-1 pb-1", className)}>
      <div className="relative">
        <Search aria-hidden className="pointer-events-none absolute start-2.5 top-1/2 size-[13px] -translate-y-1/2 text-icon" strokeWidth={1.8} />
        <input
          ref={ref}
          type="text"
          role="combobox"
          aria-expanded
          aria-autocomplete="list"
          aria-controls={ariaControls}
          aria-activedescendant={activeId}
          aria-label={placeholder ?? copy.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder ?? copy.placeholder}
          autoComplete="off"
          spellCheck={false}
          className="h-8 w-full rounded-[8px] bg-[var(--card-elevated)] ps-8 pe-2.5 text-[12.5px] text-foreground outline-none ring-1 ring-inset ring-[var(--card-ring)] placeholder:text-muted-foreground focus-visible:ring-primary/50"
        />
      </div>
    </div>
  )
}

export function MenuNoMatches({ isAr, text, className }: { isAr?: boolean; text?: string; className?: string }) {
  return (
    <div role="status" className={cn("px-2.5 py-3 text-center text-[12.5px] text-muted-foreground", className)}>
      {text ?? menuSearchCopy(isAr ?? docIsAr()).empty}
    </div>
  )
}

// ── full searchable select ─────────────────────────────────────────────────
export type SearchableOption = {
  value: string
  label: string
  /** The other-language name (or any extra text) — matched by the search but not shown. */
  alt?: string
  keywords?: string
  lead?: React.ReactNode
  hint?: React.ReactNode
  disabled?: boolean
}

export type SearchableTriggerProps = {
  ref: React.RefObject<HTMLButtonElement | null>
  type: "button"
  onClick: () => void
  onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void
  "aria-expanded": boolean
  "aria-haspopup": "listbox"
  "aria-controls"?: string
}

/** A popover listbox behind a caller-rendered trigger. The trigger keeps its own look;
 *  only the open menu is this component's. Single (`value`) or multi (`values`). */
export function SearchableSelect({
  options, value, values, onChange, onToggle, searchable, isAr, renderTrigger, className,
  menuClassName, minMenuWidth = 176, searchPlaceholder, emptyText, header, footer, disabled,
}: {
  options: SearchableOption[]
  value?: string
  values?: string[]
  /** single mode: called with the picked value (menu closes) */
  onChange?: (v: string) => void
  /** multi mode: called with the toggled value (menu stays open) */
  onToggle?: (v: string) => void
  /** defaults to on when there are more than 10 options */
  searchable?: boolean
  isAr?: boolean
  renderTrigger: (p: { open: boolean; triggerProps: SearchableTriggerProps }) => React.ReactNode
  className?: string
  menuClassName?: string
  minMenuWidth?: number
  searchPlaceholder?: string
  emptyText?: string
  /** rows above the options (e.g. "All"), not filtered */
  header?: React.ReactNode
  /** row under the options; clicking it closes the menu */
  footer?: React.ReactNode
  disabled?: boolean
}) {
  const multi = values !== undefined
  const enabled = searchable ?? options.length > 10
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement | null>(null)
  const menuRef = React.useRef<HTMLDivElement | null>(null)
  const listId = React.useId()
  const ar = isAr ?? docIsAr()

  const close = React.useCallback((refocus = true) => {
    setOpen(false)
    if (refocus) window.setTimeout(() => triggerRef.current?.focus({ preventScroll: true }), 0)
  }, [])

  const isSelected = (v: string) => (multi ? values!.includes(v) : v === value)
  const pick = (o: SearchableOption) => {
    if (o.disabled) return
    if (multi) onToggle?.(o.value)
    else { onChange?.(o.value); close() }
  }

  const s = useMenuSearch({
    items: options,
    texts: (o) => [o.label, o.alt, o.keywords],
    open,
    enabled,
    onPick: pick,
    onClose: () => close(),
    isDisabled: (o) => !!o.disabled,
  })

  // when not searchable, start the highlight on the selected row
  React.useEffect(() => {
    if (!open || enabled) return
    const i = options.findIndex((o) => isSelected(o.value))
    s.setActive(i >= 0 ? i : 0)
    window.setTimeout(() => menuRef.current?.focus({ preventScroll: true }), 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // outside click / resize closes
  React.useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return
      close(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [open, close])

  const pos = useAnchoredPosition(triggerRef, menuRef, open, minMenuWidth)

  const triggerProps: SearchableTriggerProps = {
    ref: triggerRef,
    type: "button",
    onClick: () => { if (!disabled) setOpen((o) => !o) },
    onKeyDown: (e) => {
      if (disabled) return
      if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) { e.preventDefault(); setOpen(true) }
    },
    "aria-expanded": open,
    "aria-haspopup": "listbox",
    "aria-controls": open ? listId : undefined,
  }

  const optId = (i: number) => `${listId}-o${i}`
  const menu = open && pos.container
    ? createPortal(
        <div
          ref={menuRef}
          tabIndex={-1}
          onKeyDown={enabled ? undefined : s.onKeyDown}
          style={pos.style}
          dir={ar ? "rtl" : "ltr"}
          className={cn(
            "z-[100] flex flex-col overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-lg outline-none ring-1 ring-[var(--card-ring)]",
            menuClassName,
          )}
        >
          <div ref={(el) => { s.listRef.current = el }} className="min-h-0 flex-1 overflow-y-auto p-1">
            {enabled && (
              <MenuSearchInput
                value={s.query} onChange={s.setQuery} onKeyDown={s.onKeyDown} isAr={ar}
                placeholder={searchPlaceholder} ariaControls={listId}
                activeId={s.active >= 0 ? optId(s.active) : undefined}
              />
            )}
            {header && !s.query.trim() && <div onClick={() => { if (!multi) close() }}>{header}</div>}
            <ul id={listId} role="listbox" aria-multiselectable={multi || undefined}>
              {s.results.map((o, i) => {
                const sel = isSelected(o.value)
                return (
                  <li key={o.value || `__empty${i}`}>
                    <button
                      type="button" role="option" id={optId(i)} aria-selected={sel} disabled={o.disabled}
                      tabIndex={-1} data-menu-idx={i} data-active={i === s.active || undefined}
                      onMouseEnter={() => s.setActive(i)}
                      onClick={() => pick(o)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-start text-[12.5px] transition-colors hover:bg-soft-accent disabled:pointer-events-none disabled:opacity-50",
                        i === s.active && "bg-soft-accent",
                        sel && "text-primary",
                      )}
                    >
                      {multi && (
                        <span aria-hidden className={cn("flex size-4 shrink-0 items-center justify-center rounded-[4px] border", sel ? "border-primary bg-primary text-primary-foreground" : "border-foreground/40")}>
                          {sel && <Check className="size-3" strokeWidth={3} />}
                        </span>
                      )}
                      {o.lead}
                      <span className="min-w-0 flex-1 truncate">{o.label}</span>
                      {o.hint !== undefined && <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">{o.hint}</span>}
                      {!multi && sel && <Check className="size-3.5 shrink-0" />}
                    </button>
                  </li>
                )
              })}
            </ul>
            {s.results.length === 0 && <MenuNoMatches isAr={ar} text={emptyText} />}
            {footer && (
              <div className="mt-1 border-t border-border pt-1" onClick={() => close()}>{footer}</div>
            )}
          </div>
        </div>,
        pos.container,
      )
    : null

  return (
    <div className={cn("relative min-w-0", className)}>
      {renderTrigger({ open, triggerProps })}
      {menu}
    </div>
  )
}

// ── positioning ─────────────────────────────────────────────────────────────
/** Positions a menu under (or above) its trigger. Portals into the nearest dialog popup when
 *  the trigger lives in one (so focus traps / outside-press keep working), else into <body>. */
function useAnchoredPosition(
  anchorRef: React.RefObject<HTMLElement | null>,
  menuRef: React.RefObject<HTMLElement | null>,
  open: boolean,
  minWidth: number,
) {
  const [state, setState] = React.useState<{ container: HTMLElement | null; style: React.CSSProperties }>({ container: null, style: {} })

  React.useLayoutEffect(() => {
    if (!open) { setState({ container: null, style: {} }); return }
    const anchor = anchorRef.current
    if (!anchor) return
    const dlg = anchor.closest<HTMLElement>('[role="dialog"],[role="alertdialog"]')
    const container = dlg && getComputedStyle(dlg).position !== "static" ? dlg : document.body

    const place = () => {
      const a = anchor.getBoundingClientRect()
      const vw = window.innerWidth
      const vh = window.innerHeight
      const below = vh - a.bottom - 8
      const above = a.top - 8
      const want = 300
      const up = below < Math.min(want, 200) && above > below
      const maxH = Math.max(120, Math.min(want, up ? above - 4 : below - 4))
      const width = Math.max(a.width, minWidth)
      const isRtl = getComputedStyle(anchor).direction === "rtl"
      let left = isRtl ? a.right - width : a.left
      left = Math.min(Math.max(8, left), Math.max(8, vw - 8 - width))
      const top = up ? undefined : a.bottom + 4
      const bottom = up ? vh - a.top + 4 : undefined

      if (container === document.body) {
        setState({ container, style: { position: "fixed", left, width, top, bottom, maxHeight: maxH } })
      } else {
        const c = container.getBoundingClientRect()
        const ox = c.left + container.clientLeft - container.scrollLeft
        const oy = c.top + container.clientTop - container.scrollTop
        const style: React.CSSProperties = up
          // opening upward: pin the menu's bottom edge just above the trigger
          ? { position: "absolute", left: left - ox, width, maxHeight: maxH, top: a.top - 4 - oy, transform: "translateY(-100%)" }
          : { position: "absolute", left: left - ox, width, maxHeight: maxH, top: (top as number) - oy }
        setState({ container, style })
      }
    }
    place()
    const onMove = (e: Event) => {
      if (menuRef.current && e.target instanceof Node && menuRef.current.contains(e.target)) return
      place()
    }
    window.addEventListener("resize", onMove)
    window.addEventListener("scroll", onMove, true)
    return () => { window.removeEventListener("resize", onMove); window.removeEventListener("scroll", onMove, true) }
  }, [open, anchorRef, menuRef, minWidth])

  return state
}
