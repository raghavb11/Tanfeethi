import { useNavigate } from "react-router-dom"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"

import { type LeaveRequest, type LeaveType, leaveTypeById, useLeaveRequests, useLiveLeaveTypes } from "../data/mock/leave"
import { Bar, Chip } from "./wijha"

const short = (s: string) => s.replace(/, \d{4}$/, "")

/** "12 – 16 مايو" / "12 – 16 May". */
export function leaveRange(r: LeaveRequest, isAr: boolean) {
  if (r.from === r.to) return isAr ? r.fromAr : short(r.from)
  if (isAr) {
    const [d1, m1] = [r.fromAr.split(" ")[0], r.fromAr.split(" ").slice(1).join(" ")]
    const m2 = r.toAr.split(" ").slice(1).join(" ")
    return m1 === m2 ? `${d1} – ${r.toAr}` : `${r.fromAr} – ${r.toAr}`
  }
  // Figma EN writes day-first: "12 – 16 May"
  const [mo1, d1] = short(r.from).split(" ")
  const [mo2, d2] = short(r.to).split(" ")
  return mo1 === mo2 ? `${d1} – ${d2} ${mo2}` : `${d1} ${mo1} – ${d2} ${mo2}`
}

/** "Requests under review" tiles (Figma: 12 – 16 مايو · إجازة سنوية · 5 يوم + chip). */
export function PendingLeaveList({ limit, columns = 2 }: { limit?: number; columns?: 1 | 2 }) {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const pending = useLeaveRequests().filter((r) => r.status === "Pending")
  const list = limit ? pending.slice(0, limit) : pending
  if (list.length === 0)
    return <p className="rounded-[10px] bg-background px-4 py-5 text-center text-[13px] text-muted-foreground">{t("No requests under review.", "لا توجد طلبات قيد المراجعة.")}</p>
  return (
    <div className={cn("grid gap-4", columns === 2 && "sm:grid-cols-2")}>
      {list.map((r) => {
        const lt = leaveTypeById(r.type)
        return (
          <button key={r.id} type="button" onClick={() => navigate("/leave")}
            className="flex h-[65px] items-center justify-between gap-3 rounded-[10px] bg-background px-4 text-start transition-colors hover:bg-secondary/40">
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold leading-[17px]">{leaveRange(r, isAr)}</span>
              <span className="mt-[5px] block truncate text-[11.5px] leading-[15px] text-muted-foreground">{isAr ? lt?.nameAr : lt?.name} · {r.days} {t(r.days === 1 ? "day" : "days", "يوم")}</span>
            </span>
            <Chip>{t("Under review", "قيد المراجعة")}</Chip>
          </button>
        )
      })}
    </div>
  )
}

/** "توزيع الإجازات" — remaining / entitled per leave type with a big percentage. */
export function LeaveDistribution({ ids = ["annual", "sick"] }: { ids?: string[] }) {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const types = useLiveLeaveTypes().filter((x) => ids.includes(x.id))
  const left = (x: LeaveType) => x.entitled - x.used
  return (
    <div>
      {types.map((x, i) => {
        const pct = Math.round((left(x) / x.entitled) * 100)
        return (
          <div key={x.id} className={cn("flex items-center gap-6 py-[18px]", i < types.length - 1 && "border-b border-secondary")}>
            <div className="w-[210px] shrink-0">
              <div className="text-[14.5px] leading-[22.75px]">{isAr ? x.nameAr.replace("إجازة ", "") : x.name.replace(" leave", "")}</div>
              <div className="mt-[3px] text-[11.5px] leading-[15px] text-muted-foreground"><b className="font-semibold text-foreground">{left(x)}</b> / {x.entitled} {t("days", "يوم")}</div>
            </div>
            <Bar className="flex-1" value={pct} tone={x.id === "annual" ? "success" : "warning"} />
            <div className="w-[78px] shrink-0 text-start text-[35px] font-light leading-[45px] tabular-nums" dir={isAr ? "rtl" : "ltr"}><span dir="ltr">{pct}%</span></div>
          </div>
        )
      })}
    </div>
  )
}
