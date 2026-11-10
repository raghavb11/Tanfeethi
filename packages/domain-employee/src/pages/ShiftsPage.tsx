import { useShell } from "@reach/shell-context"
import { CalendarDays } from "lucide-react"

import { ROTATIONS } from "../data/mock/hub"
import { Empty, Page, SectionCard } from "../components/wijha"
import { RotationCard } from "../components/RotationCard"

/** Full shift roster — Figma 3182:10056 (phone "view all" from the Employee hub). */
export default function ShiftsPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  return (
    <Page>
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
