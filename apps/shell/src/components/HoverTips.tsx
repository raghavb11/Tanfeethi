import * as React from "react"
import { createPortal } from "react-dom"

/**
 * One tooltip for the whole app. Management feedback (18 Nov 2026): "tooltip is
 * not there" — the icon-only controls (edit, add, pager, top-bar icons, card
 * actions…) only carried an aria-label, which a mouse user never sees.
 *
 * Shows after a short pause on hover, or at once on keyboard focus, for:
 *   - any element with `data-tip="…"` (explicit text, e.g. roadmap bars), and
 *   - a button / link / role=button|img with an `aria-label` and no visible
 *     label of its own (icon-only, or a two-letter avatar).
 * Controls that already show their name, or opt out with `data-no-tip`, are left alone.
 */
const SELECTOR = '[data-tip], button[aria-label], a[aria-label], [role="button"][aria-label], [role="img"][aria-label]'
const DELAY_MS = 350

type Tip = { text: string; rect: DOMRect }

function tipFor(el: Element | null): { el: HTMLElement; text: string } | null {
  const hit = el instanceof Element ? (el.closest(SELECTOR) as HTMLElement | null) : null
  if (!hit || hit.closest("[data-no-tip]")) return null
  const explicit = hit.getAttribute("data-tip")
  if (explicit) return { el: hit, text: explicit }
  const label = hit.getAttribute("aria-label")?.trim()
  if (!label) return null
  // icon-only: no visible text, or a short badge such as initials
  const visible = (hit.innerText ?? "").replace(/\s+/g, " ").trim()
  if (visible.length > 2) return null
  return { el: hit, text: label }
}

export function HoverTips() {
  const [tip, setTip] = React.useState<Tip | null>(null)
  const timer = React.useRef<number | undefined>(undefined)
  const current = React.useRef<HTMLElement | null>(null)

  React.useEffect(() => {
    const hide = () => {
      window.clearTimeout(timer.current)
      current.current = null
      setTip(null)
    }
    const show = (el: HTMLElement, text: string, delay: number) => {
      window.clearTimeout(timer.current)
      current.current = el
      timer.current = window.setTimeout(() => {
        if (current.current === el && el.isConnected) setTip({ text, rect: el.getBoundingClientRect() })
      }, delay)
    }
    const onOver = (e: PointerEvent) => {
      if (e.pointerType === "touch") return
      const found = tipFor(e.target as Element)
      if (!found) { if (current.current) hide(); return }
      if (found.el !== current.current) show(found.el, found.text, DELAY_MS)
    }
    const onOut = (e: PointerEvent) => {
      const to = e.relatedTarget as Node | null
      if (current.current && (!to || !current.current.contains(to))) hide()
    }
    const onFocus = (e: FocusEvent) => {
      const el = e.target as HTMLElement
      if (!el.matches?.(":focus-visible")) return
      const found = tipFor(el)
      if (found) show(found.el, found.text, 0)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") hide() }

    document.addEventListener("pointerover", onOver)
    document.addEventListener("pointerout", onOut)
    document.addEventListener("focusin", onFocus)
    document.addEventListener("focusout", hide)
    document.addEventListener("pointerdown", hide, true)
    document.addEventListener("keydown", onKey)
    window.addEventListener("scroll", hide, true)
    window.addEventListener("resize", hide)
    return () => {
      window.clearTimeout(timer.current)
      document.removeEventListener("pointerover", onOver)
      document.removeEventListener("pointerout", onOut)
      document.removeEventListener("focusin", onFocus)
      document.removeEventListener("focusout", hide)
      document.removeEventListener("pointerdown", hide, true)
      document.removeEventListener("keydown", onKey)
      window.removeEventListener("scroll", hide, true)
      window.removeEventListener("resize", hide)
    }
  }, [])

  if (!tip) return null
  // above the control, or below it when there is no room; kept inside the window
  const below = tip.rect.top < 44
  const center = tip.rect.left + tip.rect.width / 2
  const style: React.CSSProperties = {
    top: below ? tip.rect.bottom + 8 : tip.rect.top - 8,
    left: Math.min(window.innerWidth - 12, Math.max(12, center)),
    transform: `translate(-50%, ${below ? "0" : "-100%"})`,
  }
  return createPortal(
    <div role="tooltip" style={style}
      className="pointer-events-none fixed z-[100] max-w-[280px] rounded-md bg-popover px-2.5 py-1.5 text-center text-[12px] leading-[16px] text-popover-foreground shadow-lg ring-1 ring-border animate-in fade-in-0 zoom-in-95">
      {tip.text}
    </div>,
    document.body,
  )
}
