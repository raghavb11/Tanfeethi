import { useNavigate } from "react-router-dom"
import { useShell } from "@reach/shell-context"
import { LogOut, Settings, UserRound } from "lucide-react"

import { BusinessCardPanel } from "../components/BusinessCardPanel"
import { businessCard, emp } from "../data/mock/center"
import { setNotifications, usePrefs } from "../data/mock/hub"
import { InfoRow, Page, SectionCard, Toggle } from "../components/wijha"

/** Profile — Figma 4791:33007 (web) / 3610:8007 Account (phone).
 *  Business card with sharing toggles, the personal profile list and settings. */
export default function ProfilePage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const { notifications } = usePrefs()

  return (
    <Page>
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,729fr)_minmax(0,480fr)]">
        {/* start column — business card (second on narrow screens, as on the phone Account) */}
        <div className="order-2 min-w-0 xl:order-1">
          <BusinessCardPanel actions={["email", "image"]} />
        </div>

        {/* end column — profile + settings */}
        <div className="order-1 min-w-0 space-y-6 xl:order-2">
          <SectionCard icon={UserRound} title={t("Profile", "الملف الشخصي")}>
            {/* phone Account header: avatar, name, title */}
            <div className="mb-4 flex items-center gap-3 xl:hidden">
              <span className="grid size-14 shrink-0 place-items-center rounded-full bg-soft-accent text-[18px] font-medium text-primary ring-1 ring-primary" dir="ltr">{emp.initials}</span>
              <div className="min-w-0">
                <div className="truncate text-[17px] font-medium">{isAr ? emp.nameAr : emp.name}</div>
                <div className="truncate text-[12.5px] text-muted-foreground">{isAr ? emp.titleAr : emp.title}</div>
              </div>
            </div>
            <div className="overflow-hidden rounded-[10px] bg-background">
              <InfoRow label={t("Email", "البريد")} value={emp.email} ltr />
              <InfoRow label={t("Mobile Number", "رقم الجوال")} value={businessCard.mobile} ltr />
              <InfoRow label={t("Department", "الإدارة")} value={isAr ? emp.sectorAr : emp.sector} />
              <InfoRow label={t("Direct Manager", "المدير المباشر")} value={isAr ? emp.managerAr : emp.manager} />
              <InfoRow label={t("Work Location", "موقع العمل")} value={isAr ? emp.locationAr : emp.location} />
            </div>
          </SectionCard>

          <SectionCard icon={Settings} title={t("Settings", "الإعدادات")}>
            <div className="divide-y divide-border">
              <div className="flex items-center justify-between gap-4 px-4 py-4">
                <span className="text-[17px]">{t("Notifications", "التنبيهات")}</span>
                <Toggle checked={notifications} onChange={setNotifications} label={t("Notifications", "التنبيهات")} />
              </div>
              <button type="button" onClick={() => navigate("/")}
                className="flex w-full items-center justify-between gap-4 px-4 py-4 text-start text-error transition-colors hover:bg-error-fill">
                <span className="text-[17px]">{t("Log out", "تسجيل الخروج")}</span>
                <LogOut className="size-5 rtl:-scale-x-100" />
              </button>
            </div>
          </SectionCard>
        </div>
      </div>
    </Page>
  )
}
