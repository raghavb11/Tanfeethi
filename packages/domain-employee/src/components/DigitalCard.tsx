import * as React from "react"
import { cn } from "@reach/shared-core"

import { businessCard, emp } from "../data/mock/center"

/** Deterministic 21×21 matrix derived from the payload, drawn with the three
 *  finder patterns a QR code has. Demo visual only — it does not scan. Swap in
 *  a real encoder (`qrcode`) when the card is wired to a live profile URL. */
function matrixFor(payload: string, size = 21): boolean[][] {
  let h = 2166136261
  for (let i = 0; i < payload.length; i++) {
    h ^= payload.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const next = () => {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5
    return (h >>> 0) / 4294967296
  }
  const grid = Array.from({ length: size }, () => Array<boolean>(size).fill(false))
  const inFinder = (r: number, c: number) =>
    (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7)

  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (!inFinder(r, c)) grid[r][c] = next() > 0.52

  // three finder patterns: 7×7 ring with a 3×3 solid centre
  const finder = (top: number, left: number) => {
    for (let r = 0; r < 7; r++)
      for (let c = 0; c < 7; c++) {
        const edge = r === 0 || r === 6 || c === 0 || c === 6
        const core = r >= 2 && r <= 4 && c >= 2 && c <= 4
        grid[top + r][left + c] = edge || core
      }
  }
  finder(0, 0); finder(0, size - 7); finder(size - 7, 0)
  return grid
}

export function QrMatrix({ payload, className }: { payload: string; className?: string }) {
  const grid = React.useMemo(() => matrixFor(payload), [payload])
  const n = grid.length
  return (
    <svg
      viewBox={`0 0 ${n} ${n}`}
      className={cn("size-full", className)}
      role="img"
      aria-label={`QR code for ${payload}`}
      shapeRendering="crispEdges"
    >
      <rect width={n} height={n} fill="#ffffff" />
      {grid.map((row, r) =>
        row.map((on, c) =>
          on ? <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#1A1A1A" /> : null,
        ),
      )}
    </svg>
  )
}

/** The card face itself — used on the Employee Center preview and full-screen
 *  on the identification page. `size="lg"` is the show-at-reception variant. */
export function DigitalCard({ isAr, size = "md" }: { isAr: boolean; size?: "md" | "lg" }) {
  const lg = size === "lg"
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl text-left",
        lg ? "p-6 sm:p-7" : "p-5",
      )}
      style={{ background: "linear-gradient(135deg, #2A1B18 0%, #3D2031 100%)" }}
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* copper wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute -end-16 -top-16 size-48 rounded-full opacity-25 blur-2xl"
        style={{ background: "#CE7B5B" }}
      />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div
            className={cn("font-bold tracking-tight", lg ? "text-[24px]" : "text-[18px]")}
            style={{ color: "#F3F0EE" }}
          >
            {isAr ? emp.nameAr : emp.name}
          </div>
          <div
            className={cn("mt-0.5 font-medium", lg ? "text-[14px]" : "text-[12.5px]")}
            style={{ color: "#CE7B5B" }}
          >
            {isAr ? emp.titleAr : emp.title}
          </div>
          <div
            className={cn("mt-0.5", lg ? "text-[12.5px]" : "text-[11.5px]")}
            style={{ color: "rgba(243,240,238,0.6)" }}
          >
            {isAr ? emp.departmentAr : emp.department} · {isAr ? emp.sectorAr : emp.sector}
          </div>
        </div>

        <div
          className={cn("shrink-0 overflow-hidden rounded-lg bg-white p-1", lg ? "size-24 sm:size-28" : "size-16")}
        >
          <QrMatrix payload={businessCard.qrPayload} />
        </div>
      </div>

      <div
        className="relative z-10 mt-5 grid gap-x-6 gap-y-2 border-t pt-4 sm:grid-cols-2"
        style={{ borderColor: "rgba(243,240,238,0.12)" }}
      >
        {[
          [isAr ? "الرقم الوظيفي" : "Employee ID", emp.empId],
          [isAr ? "الجوال" : "Mobile", businessCard.mobile],
          [isAr ? "البريد" : "Email", emp.email],
          [isAr ? "التحويلة" : "Extension", businessCard.extension],
        ].map(([label, value]) => (
          <div key={label} className="min-w-0">
            <div
              className="text-[9.5px] font-semibold uppercase tracking-[0.12em]"
              style={{ color: "rgba(243,240,238,0.42)" }}
            >
              {label}
            </div>
            <div
              className={cn("truncate font-semibold", lg ? "text-[13px]" : "text-[12px]")}
              style={{ color: "#F3F0EE" }}
              dir="ltr"
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      <div
        className="relative z-10 mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3"
        style={{ borderColor: "rgba(243,240,238,0.12)" }}
      >
        <span className="text-[10.5px] font-semibold tracking-[0.18em]" style={{ color: "rgba(243,240,238,0.7)" }}>
          ALTANFEETHI
        </span>
        <span className="text-[10.5px] italic" style={{ color: "rgba(243,240,238,0.42)" }}>
          {isAr ? businessCard.taglineAr : businessCard.tagline}
        </span>
      </div>
    </div>
  )
}
