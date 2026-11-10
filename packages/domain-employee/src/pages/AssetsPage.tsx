import * as React from "react"
import { useShell } from "@reach/shell-context"
import { Check, KeyRound, Laptop, Monitor, PackageOpen, Smartphone } from "lucide-react"

import { type Asset, type AssetStatus, setAssetStatus, useAssets } from "../data/mock/hub"
import { Chip, Empty, IconBadge, OutlineButton, Page, SectionCard } from "../components/wijha"

const ICON = { laptop: Laptop, phone: Smartphone, key: KeyRound, monitor: Monitor } as const

/** My assets / custody — Figma 3610:8106 (phone only; laid out as a card grid on web). */
export default function AssetsPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const assets = useAssets()

  return (
    <Page>
      <SectionCard icon={PackageOpen} title={t("Assets", "الأصول")}>
        <p className="-mt-1 mb-5 text-[13px] text-muted-foreground">
          {t("Custody items and assets registered in your name. You can request a replacement or report a fault for any asset.",
             "العهد و الأصول المسجّلة باسمك، يمكنك طلب استبدالًا أو أبلغ عن عطل من أي أصل.")}
        </p>
        {assets.length === 0 ? (
          <Empty icon={PackageOpen} title={t("No assets in your custody", "لا توجد أصول مسجّلة باسمك")} />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
            {assets.map((a) => <AssetCard key={a.id} a={a} />)}
          </div>
        )}
      </SectionCard>
    </Page>
  )
}

function AssetCard({ a }: { a: Asset }) {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const [confirm, setConfirm] = React.useState<AssetStatus | null>(null)

  const STATUS: Record<AssetStatus, { label: string; tone: "success" | "warning" | "error" }> = {
    ok: { label: t("Sound", "سليم"), tone: "success" },
    replacement: { label: t("Replacement requested", "طلب أستبدال"), tone: "warning" },
    fault: { label: t("Fault reported", "تم الإبلاغ عن عطل"), tone: "error" },
  }
  const s = STATUS[a.status]

  return (
    <div className="rounded-xl bg-background p-4 ring-1 ring-border">
      <div className="flex items-start gap-3">
        <IconBadge icon={ICON[a.icon]} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-medium">{isAr ? a.nameAr : a.name}</div>
          <div className="mt-0.5 text-[12.5px] text-muted-foreground">{isAr ? a.dateAr : a.date}</div>
          <Chip tone={s.tone} className="mt-2">{s.label}</Chip>
        </div>
        <span className="shrink-0 text-[12.5px] text-muted-foreground" dir="ltr">{a.code}</span>
      </div>

      {/* an asset with an open request hides its actions (as drawn) */}
      {a.status === "ok" && !confirm && (
        <div className="mt-4 space-y-3">
          <OutlineButton className="h-11 w-full text-muted-foreground" onClick={() => setConfirm("replacement")}>{t("Request replacement", "طلب أستبدال")}</OutlineButton>
          <OutlineButton className="h-11 w-full text-error" onClick={() => setConfirm("fault")}>{t("Report a fault", "الإبلاغ عن عطل")}</OutlineButton>
        </div>
      )}
      {confirm && (
        <div className="mt-4 rounded-lg bg-secondary/60 p-3">
          <p className="text-[13px]">
            {confirm === "replacement"
              ? t(`Request a replacement for ${a.name} (${a.code})?`, `طلب استبدال ${a.nameAr} (${a.code})؟`)
              : t(`Report a fault on ${a.name} (${a.code})? IT support will contact you.`, `الإبلاغ عن عطل في ${a.nameAr} (${a.code})؟ سيتواصل معك الدعم الفني.`)}
          </p>
          <div className="mt-3 flex justify-end gap-2">
            <OutlineButton size="sm" onClick={() => setConfirm(null)}>{t("Cancel", "إلغاء")}</OutlineButton>
            <OutlineButton size="sm" className={confirm === "fault" ? "text-error" : "text-primary"} onClick={() => { setAssetStatus(a.id, confirm); setConfirm(null) }}>
              <Check className="size-3.5" />{t("Confirm", "تأكيد")}
            </OutlineButton>
          </div>
        </div>
      )}
    </div>
  )
}
