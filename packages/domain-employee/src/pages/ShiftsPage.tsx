import { useNavigate } from "react-router-dom"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import { TONE_DOT } from "@reach/domain-content/master-data"
import { CalendarClock, CalendarDays, CalendarRange } from "lucide-react"

import { ROTATIONS } from "../data/mock/hub"
import {
  addDays, dayMonth, myShiftOn, rosterName, ROSTER_TODAY_ISO, useCanManageRosters, useRosters, weekdayLong, weekStart,
} from "../data/rosters"
import { Empty, OutlineButton, Page, SectionCard } from "../components/wijha"
import { RotationCard } from "../components/RotationCard"
import { ShiftHours } from "../components/RosterBits"

/** Full shift roster — Figma 3182:10056 (phone "view all" from the Employee hub),
 *  with the signed-in employee's own published shifts for the week above it. */
export default function ShiftsPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const rosters = useRosters()
  const canManage = useCanManageRosters()
  const week = Array.from({ length: 7 }, (_, i) => addDays(weekStart(ROSTER_TODAY_ISO), i))
  const mine = week.map((iso) => ({ iso, hit: myShiftOn(rosters, iso) }))
  const any = mine.some((d) => d.hit)
  const source = mine.find((d) => d.hit)?.hit?.roster

  return (
    <Page className="flex flex-col gap-6">
      {/* not in the drawn frame: the employee's own shifts from published rosters */}
      <SectionCard icon={CalendarClock} title={t("My shifts this week", "مناوباتي هذا الأسبوع")}
        action={canManage ? (
          <OutlineButton size="sm" onClick={() => navigate("/employee/rosters")}><CalendarRange className="size-4" />{t("Manage rosters", "إدارة الجداول")}</OutlineButton>
        ) : undefined}>
        {!any ? (
          <Empty icon={CalendarClock} title={t("No published roster for you this week", "لا يوجد جدول منشور لك هذا الأسبوع")} />
        ) : (
          <>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
              {mine.map(({ iso, hit }) => {
                const s = hit?.shift
                const today = iso === ROSTER_TODAY_ISO
                return (
                  <li key={iso} className={cn("flex flex-col gap-1.5 rounded-[10px] bg-background p-3 ring-1 ring-inset",
                    today ? "ring-primary/60" : "ring-border")}>
                    <span className={cn("text-[12px]", today ? "font-medium text-primary" : "text-muted-foreground")}>
                      {today ? t("Today", "اليوم") : weekdayLong(iso, isAr)} · {dayMonth(iso, isAr)}
                    </span>
                    {s ? (
                      <>
                        <span className="flex items-center gap-1.5 text-[14px] font-medium">
                          <span className={cn("size-2 rounded-full", TONE_DOT[s.tone])} />{isAr ? s.nameAr : s.name}
                        </span>
                        <ShiftHours shift={s} isAr={isAr} className="text-[12.5px] text-muted-foreground" />
                      </>
                    ) : (
                      <span className="text-[13px] text-muted-foreground">{hit ? t("Not planned", "غير مخطط") : t("No roster", "لا يوجد جدول")}</span>
                    )}
                  </li>
                )
              })}
            </ul>
            {source && <p className="mt-3 text-[12px] text-muted-foreground">{t("From", "من")} {source.code} · {rosterName(source, isAr)}</p>}
          </>
        )}
      </SectionCard>

      <SectionCard icon={CalendarDays} title={t("Shift roster", "جدول المناوبات")}
        action={<span className="text-[12px] text-muted-foreground">{ROTATIONS.length} {t("rotations", "مناوبات")}</span>}>
        {ROTATIONS.length === 0 ? (
          <Empty icon={CalendarDays} title={t("No rotations scheduled", "لا توجد مناوبات مجدولة")} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {ROTATIONS.map((r) => <RotationCard key={r.id} r={r} />)}
          </div>
        )}
      </SectionCard>
    </Page>
  )
}
