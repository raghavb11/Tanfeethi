import * as React from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Input, Textarea } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  ArrowLeft, Check, Eye, Handshake, History, Inbox, MapPin, Pencil, Plus, RotateCcw, Search,
  ShieldOff, Undo2,
} from "lucide-react"

import {
  CATEGORY, offersFor, OFFER_STATUS, PARTNER_STATUS, type Partner, publishOffer,
  returnOffer, setPartnerStatus, useOffers, usePartnerLog, usePartners,
} from "../data/mock/partners"
import { Chip, Empty, FieldLabel, GoldButton, IconBadge, OutlineButton, Page, SectionCard } from "../components/wijha"

type Tab = "partners" | "review"

/** Where an administrator keeps the partner master and decides what reaches
 *  staff. Partners are created on their own page; only the suspend and publish
 *  decisions are taken here, and each is confirmed before it is written. */
export default function PartnersAdminPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  const partners = usePartners()
  const offers = useOffers()
  const log = usePartnerLog()
  const awaiting = offers.filter((o) => o.status === "submitted")

  const tab: Tab = params.get("tab") === "review" ? "review" : "partners"
  const setTab = (v: Tab) => setParams(v === "review" ? { tab: "review" } : {}, { replace: true })

  const [query, setQuery] = React.useState("")
  const q = query.trim().toLowerCase()
  const shown = q
    ? partners.filter((p) =>
        p.name.toLowerCase().includes(q) || p.nameAr.includes(query.trim()) ||
        p.code.toLowerCase().includes(q))
    : partners

  // suspending a partner hides their offers from staff, so it is confirmed first
  const [confirming, setConfirming] = React.useState<Partner | null>(null)
  // returning an offer needs a reason the partner can act on
  const [returningId, setReturningId] = React.useState<string | null>(null)
  const [note, setNote] = React.useState("")

  const counts = (id: string) => {
    const mine = offersFor(id)
    return { total: mine.length, live: mine.filter((o) => o.status === "published").length }
  }

  return (
    <Page className="space-y-6">
      {/* toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/config" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground">
          <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />{t("Configuration", "الإعدادات")}
        </Link>
        <GoldButton onClick={() => navigate("/config/partners/new")}>
          <Plus className="size-4" />{t("Add partner", "إضافة شريك")}
        </GoldButton>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {([["partners", t("Partners", "الشركاء"), partners.length],
             ["review", t("Offers for review", "عروض للمراجعة"), awaiting.length]] as const).map(([id, label, n]) => (
            <button
              key={id} onClick={() => setTab(id as Tab)} aria-pressed={tab === id}
              className={cn("inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-[13px] font-medium transition-colors",
                tab === id ? "bg-soft-accent text-primary" : "bg-secondary text-muted-foreground hover:text-foreground")}
            >
              {label}
              <span className={cn("rounded-md px-1.5 text-[11px] tabular-nums",
                id === "review" && n > 0 ? "bg-warning-fill text-warning" : "bg-background text-muted-foreground")}>
                {n}
              </span>
            </button>
          ))}
        </div>
        {tab === "partners" && (
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder={t("Search by name or code…", "ابحث بالاسم أو الرمز…")}
              className="h-9 rounded-lg bg-background ps-9"
            />
          </div>
        )}
      </div>

      {tab === "partners" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {shown.map((p) => {
            const c = counts(p.id)
            return (
              <div key={p.id} className="panel rounded-xl px-4 py-5 sm:px-6">
                <div className="flex flex-wrap items-start gap-3">
                  <IconBadge icon={Handshake} className="size-10" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[15px] font-medium">{isAr ? p.nameAr : p.name}</span>
                      <span className="text-[12px] tabular-nums text-muted-foreground" dir="ltr">{p.code}</span>
                      <Chip className={PARTNER_STATUS[p.status].chip}>
                        {isAr ? PARTNER_STATUS[p.status].ar : PARTNER_STATUS[p.status].en}
                      </Chip>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-muted-foreground">
                      <Chip className={cn("h-5 text-[11px]", CATEGORY[p.category].chip)}>
                        {isAr ? CATEGORY[p.category].ar : CATEGORY[p.category].en}
                      </Chip>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3.5" />
                        {t(`${p.branches.length} branches`, `${p.branches.length} فروع`)}
                      </span>
                      <span>{t(`Agreement to ${p.agreementTo}`, `الاتفاقية حتى ${p.agreementTo}`)}</span>
                    </div>
                    <div className="mt-2 text-[13px]">
                      <span className="font-medium text-success">{t(`${c.live} live`, `${c.live} منشور`)}</span>
                      <span className="text-muted-foreground"> · {t(`${c.total} offers in total`, `${c.total} عرضًا إجمالًا`)}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <OutlineButton size="sm" onClick={() => navigate(`/config/partners/${p.id}/edit`)}>
                      <Pencil className="size-3.5" />{t("Edit", "تعديل")}
                    </OutlineButton>
                    {p.status === "active" ? (
                      <OutlineButton size="sm" className="text-error" onClick={() => setConfirming(p)}>
                        <ShieldOff className="size-3.5" />{t("Suspend", "إيقاف")}
                      </OutlineButton>
                    ) : (
                      <OutlineButton size="sm" onClick={() => setPartnerStatus(p.id, "active")}>
                        <RotateCcw className="size-3.5" />{t("Reinstate", "إعادة تفعيل")}
                      </OutlineButton>
                    )}
                  </div>
                </div>

                {confirming?.id === p.id && (
                  <div className="mt-4 rounded-[10px] bg-warning-fill p-3.5">
                    <p className="text-[14px] font-medium">
                      {t(`Suspend ${p.name}?`, `إيقاف ${p.nameAr}؟`)}
                    </p>
                    <p className="mt-1 text-[12.5px] text-muted-foreground">
                      {t(`Their ${c.live} published offers stop showing to staff, and they cannot submit new ones. Vouchers already issued are not cancelled.`,
                         `ستتوقف عروضهم المنشورة (${c.live}) عن الظهور للموظفين، ولن يتمكنوا من تقديم عروض جديدة. القسائم الصادرة لا تُلغى.`)}
                    </p>
                    <div className="mt-3 flex flex-wrap justify-end gap-2">
                      <OutlineButton size="sm" onClick={() => setConfirming(null)}>{t("Cancel", "إلغاء")}</OutlineButton>
                      <GoldButton size="sm" onClick={() => { setPartnerStatus(p.id, "suspended"); setConfirming(null) }}>
                        <Check className="size-3.5" />{t("Yes, suspend", "نعم، أوقف")}
                      </GoldButton>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {shown.length === 0 && (
            <div className="panel rounded-xl lg:col-span-2">
              <Empty icon={Search} title={t("No partner matches that search.", "لا يوجد شريك مطابق لهذا البحث.")} />
            </div>
          )}
        </div>
      )}

      {tab === "review" && (
        <SectionCard icon={Inbox} title={t("Offers for review", "عروض للمراجعة")} action={<Chip tone={awaiting.length ? "warning" : "neutral"}>{awaiting.length}</Chip>}>
          <div className="space-y-3">
            {awaiting.map((o) => (
              <div key={o.id} className="rounded-[10px] bg-background p-4 ring-1 ring-border ring-inset">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[14.5px] font-medium">{isAr ? o.headlineAr : o.headline}</span>
                      <Chip className={OFFER_STATUS.submitted.chip}>
                        {isAr ? OFFER_STATUS.submitted.ar : OFFER_STATUS.submitted.en}
                      </Chip>
                    </div>
                    <div className="mt-1 text-[12.5px] text-muted-foreground">
                      {isAr ? o.vendorAr : o.vendor} · {isAr ? CATEGORY[o.category].ar : CATEGORY[o.category].en} ·{" "}
                      {t(`valid to ${o.validTo}`, `سارٍ حتى ${o.validTo}`)}
                    </div>
                    <p className="mt-2 max-w-3xl text-[13px] text-foreground/90">{isAr ? o.summaryAr : o.summary}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <OutlineButton size="sm" onClick={() => navigate(`/benefits/partners/${o.id}?preview=1`)}>
                      <Eye className="size-3.5" />{t("Preview", "معاينة")}
                    </OutlineButton>
                    <OutlineButton size="sm" onClick={() => { setReturningId(o.id); setNote("") }}>
                      <Undo2 className="size-3.5" />{t("Return", "إعادة")}
                    </OutlineButton>
                    <GoldButton size="sm" onClick={() => publishOffer(o.id)}>
                      <Check className="size-3.5" />{t("Publish", "نشر")}
                    </GoldButton>
                  </div>
                </div>

                {returningId === o.id && (
                  <div className="mt-4 rounded-[10px] bg-secondary/50 p-3.5">
                    <FieldLabel required>{t("Why it is going back", "سبب الإعادة")}</FieldLabel>
                    <Textarea
                      rows={2} value={note} onChange={(e) => setNote(e.target.value)}
                      className="rounded-lg bg-background"
                      placeholder={t("The partner sees this and can correct the offer.", "سيظهر هذا للشريك ليصحّح العرض.")}
                    />
                    <div className="mt-3 flex flex-wrap justify-end gap-2">
                      <OutlineButton size="sm" onClick={() => setReturningId(null)}>{t("Cancel", "إلغاء")}</OutlineButton>
                      <GoldButton size="sm" disabled={!note.trim()} onClick={() => { returnOffer(o.id, note.trim()); setReturningId(null) }}>
                        {t("Send back", "إرسال للشريك")}
                      </GoldButton>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {awaiting.length === 0 && (
              <Empty icon={Inbox} title={t("Nothing is waiting for review.", "لا يوجد ما ينتظر المراجعة.")} />
            )}
          </div>
        </SectionCard>
      )}

      {/* the trail — agreements and discounts are money, so changes are answerable */}
      <SectionCard icon={History} title={t("Recent changes", "آخر التغييرات")}>
        {log.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">
            {t("Nothing has changed in this session.", "لم يتغيّر شيء في هذه الجلسة.")}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {log.slice(0, 8).map((e) => (
              <li key={e.id} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 py-2.5 text-[13px]">
                <span className="font-medium capitalize">{e.entity === "partner" ? t("Partner", "شريك") : t("Offer", "عرض")}</span>
                <span className="text-primary">{e.action}</span>
                <span className="min-w-0 flex-1 truncate text-muted-foreground">{e.detail}</span>
                <span className="shrink-0 text-[12px] tabular-nums text-muted-foreground">{e.at}</span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </Page>
  )
}
