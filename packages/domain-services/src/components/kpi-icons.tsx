/** Duotone KPI icons drawn in the Services frames (gold Shape/Accent outline + the
 *  purple Second Accent detail), traced from Figma 3039:5874 / 5881 / 5888. 24×24 boxes;
 *  the gold part follows `currentColor` so `text-primary` drives it. The English frames
 *  draw them mirrored (ltr:-scale-x-100). */
import { cn } from "@reach/shared-core"

const PURPLE = "#a997c7"
type P = { className?: string; strokeWidth?: number }

/** "Open requests" — tray with a wave. */
export function TrayIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={cn("size-6 ltr:-scale-x-100", className)}>
      <rect x="1" y="3" width="22" height="18" rx="1.2" stroke="currentColor" strokeWidth="2" />
      <path d="M2 13.5 H6.8 C7.8 13.5 8.4 14.2 9 15 C9.6 16 10.5 16.8 11.5 16.8 H12.5 C13.5 16.8 14.4 16 15 15 C15.6 14.2 16.2 13.5 17.2 13.5 H22"
        stroke={PURPLE} strokeWidth="2" />
    </svg>
  )
}

/** "Requests in progress" — play button in a ring. */
export function PlayRingIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={cn("size-6 ltr:-scale-x-100", className)}>
      <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2" />
      <path d="M9.5 7.6 L16.6 12 L9.5 16.4 Z" stroke={PURPLE} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

/** "Average response time" — receipt with a stopwatch. */
export function ReceiptTimerIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={cn("size-6 ltr:-scale-x-100", className)}>
      <path d="M3 21 V4 Q3 3 4 3 H18.2 Q19.2 3 19.2 4 V9.5" stroke="currentColor" strokeWidth="2" />
      <path d="M3 19 H10.5" stroke="currentColor" strokeWidth="2" />
      <rect x="5" y="5.8" width="12" height="2" fill="currentColor" />
      <rect x="5" y="9.8" width="10" height="2" fill="currentColor" />
      <rect x="5" y="13.8" width="6" height="2" fill="currentColor" />
      <circle cx="17" cy="17.7" r="4.2" stroke={PURPLE} strokeWidth="1.3" />
      <path d="M15.4 11.6 H18.6 M17 11.6 V13.3 M17 15.2 V17.6" stroke={PURPLE} strokeWidth="1.3" />
    </svg>
  )
}

/** Hospitality catalog tile icon — tea cup on a purple saucer (Figma 4915:18256).
 *  16×16 so it sits on whole pixels inside the 30px icon tile. */
export function TeaCupIcon({ className }: P) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden className={cn(className, "size-4 ltr:-scale-x-100")}>
      <path d="M2.5 2.6 V8.5 Q2.6 11.6 6.8 11.6 Q10.4 11.6 10.5 8.5 V2.6 Z" />
      <path d="M2.5 2.6 H12.6 Q13.6 2.6 13.6 3.6 V4.6 Q13.6 5.6 12.5 6 L10.6 6.5" />
      <path d="M3 6 H10.5" strokeOpacity="0.6" strokeWidth="2" />
      <path d="M2 13.45 H12.6" stroke={PURPLE} strokeWidth="1.3" />
    </svg>
  )
}

/** Card-title "grid" glyph (Figma: four 7px squares, 2px apart, 1.4px stroke, a faint
 *  accent cross between them) — lucide's LayoutGrid draws smaller, rounder squares. */
export function GridIcon({ className }: P) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden className={cn("size-4", className)}>
      <path d="M7 1 V15 M1 8 H15" strokeOpacity="0.18" strokeWidth="2" />
      <rect x="0.7" y="0.7" width="5.6" height="5.6" rx="0.5" />
      <rect x="9.7" y="0.7" width="5.6" height="5.6" rx="0.5" />
      <rect x="0.7" y="9.7" width="5.6" height="5.6" rx="0.5" />
      <rect x="9.7" y="9.7" width="5.6" height="5.6" rx="0.5" />
    </svg>
  )
}

/** Group-row laptop (Figma: 16×12 laptop, half-filled base, purple camera notch). */
export function LaptopDuoIcon({ className }: P) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden className={cn(className, "size-4")}>
      <rect x="1.5" y="2.5" width="13" height="8.2" rx="0.8" />
      <path d="M0.55 10.8 H15.45 V12.9 Q15.45 13.45 14.9 13.45 H1.1 Q0.55 13.45 0.55 12.9 Z" fill="currentColor" fillOpacity="0.45" />
      <rect x="6" y="4" width="4" height="1.3" rx="0.6" fill={PURPLE} stroke="none" />
    </svg>
  )
}

/** Leaderboard "steps" glyph — two footprint outlines (Figma 12×13.5, gold). */
export function FootprintsIcon({ className }: P) {
  const foot = "M3.1 0.9 C1.6 0.9 0.8 3 0.9 5 C1 6.6 1.6 7.6 1.6 7.6 H5.4 C5.4 7.6 6 6.4 5.9 4.6 C5.8 2.5 4.6 0.9 3.1 0.9 Z M1.8 8.1 C1.8 10.3 2.5 11.3 3.5 11.3 C4.5 11.3 5.3 10.4 5.3 8.1"
  return (
    <svg viewBox="0 0 13 15" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden className={cn("h-[15px] w-[13px]", className)}>
      <path d={foot} />
      <path d={foot} transform="translate(6.3 3.4)" />
    </svg>
  )
}

/** Leaderboard "calories" glyph — flame outline with an inner flame (Figma 12×14, red). */
export function FlameIcon({ className }: P) {
  return (
    <svg viewBox="0 0 12 14" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" aria-hidden className={cn("h-[14px] w-3", className)}>
      <path d="M3.7 1 C3 3 0.6 4 0.6 8 C0.6 10.9 2.9 13.1 5.6 13.1 C8.4 13.1 10.6 11 10.6 8.2 C10.6 6 9.7 4.6 8.7 3.8 L7.2 5.3 C6.6 3.6 5.3 2 3.7 1 Z" />
      <path d="M4.6 12.6 C3.4 12.6 2.9 11.5 3.2 10.5 C3.5 9.5 4.6 8.4 4.6 8.4 C4.6 8.4 5.8 9.5 6 10.5 C6.3 11.5 5.8 12.6 4.6 12.6 Z" strokeWidth="1" />
    </svg>
  )
}

/** Violation glyph — octagon outline (currentColor) with a red exclamation (Figma 4999:17400). */
export function OctagonAlertIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={cn("size-4", className)}>
      <path stroke="currentColor" d="M15.312 2a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z" />
      <path stroke="#d14f45" d="M12 8v4M12 16h.01" />
    </svg>
  )
}
