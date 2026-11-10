import * as React from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Badge, Button, Card, Input, Textarea } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  ArrowLeft, Check, Eye, Handshake, MapPin, Pencil, Plus, RotateCcw, Search,
  ShieldOff, Undo2,
} from "lucide-react"

import {
  CATEGORY, offersFor, OFFER_STATUS, PARTNER_STATUS, type Partner, publishOffer,
  returnOffer, setPartnerStatus, useOffers, usePartnerLog, usePartners,
} from "../data/mock/partners"

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
    <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-7 md:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1.5">
          <Link to="/config" className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground">
            <ArrowLeft className={cn("size-3.5", isAr && "rotate-180")} />{t("Configuration", "الإعدادات")}
          </Link>
          <h1 className="text-[22px] font-bold tracking-tight md:text-[26px]">{t("Partners", "الشركاء")}</h1>
          <p className="max-w-3xl text-[13px] text-muted-foreground">
            {t("The vendors with a signed agreement, and the offers they submit for staff.",
               "الجهات الموقّعة على اتفاقيات، والعروض التي تقدّمها لمنسوبي التنفيذي.")}
          </p>
        </div>
        <Button size="lg" className="shrink-0 gap-1.5" onClick={() => navigate("/config/partners/new")}>
          <Plus className="size-4" />{t("Add partner", "إضافة شريك")}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {([["partners", t("Partners", "الشركاء"), partners.length],
           ["review", t("Offers for review", "عروض للمراجعة"), awaiting.length]] as const).map(([id, label, n]) => (
          <button
            key={id} onClick={() => setTab(id as Tab)}
            className={cn("inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors",
              tab === id ? "border-primary/40 bg-primary/10 text-primary" : "border-border/70 text-muted-foreground hover:bg-muted/50")}
          >
            {label}
            <span className={cn("rounded-full px-1.5 text-[11px] tabular-nums",
              id === "review" && n > 0 ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" : "bg-muted text-muted-foreground")}>
              {n}
            </span>
          </button>
        ))}
      </div>

      {tab === "partners" && (
        <>
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder={t("Search by name or code…", "ابحث بالاسم أو الرمز…")}
              className="ps-9"
            />
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {shown.map((p) => {
              const c = counts(p.id)
              return (
                <Card key={p.id} className="p-4">
                  <div className="flex flex-wrap items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
                      <Handshake className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[14px] font-semibold">{isAr ? p.nameAr : p.name}</span>
                        <span className="text-[11px] tabular-nums text-muted-foreground">{p.code}</span>
                        <Badge variant="outline" className={cn("text-[10px]", PARTNER_STATUS[p.status].chip)}>
                          {isAr ? PARTNER_STATUS[p.status].ar : PARTNER_STATUS[p.status].en}
                        </Badge>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
                        <span className={cn("rounded-full border px-1.5 py-0.5 text-[10.5px]", CATEGORY[p.category].chip)}>
                          {isAr ? CATEGORY[p.category].ar : CATEGORY[p.category].en}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3.5" />
                          {t(`${p.branches.length} branches`, `${p.branches.length} فروع`)}
                        </span>
                        <span>{t(`Agreement to ${p.agreementTo}`, `الاتفاقية حتى ${p.agreementTo}`)}</span>
                      </div>
                      <div className="mt-2 text-[12px]">
                        <span className="font-medium">{t(`${c.live} live`, `${c.live} منشور`)}</span>
                        <span className="text-muted-foreground"> · {t(`${c.total} offers in total`, `${c.total} عرضًا إجمالًا`)}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-1.5">
                      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate(`/config/partners/${p.id}/edit`)}>
                        <Pencil className="size-3.5" />{t("Edit", "تعديل")}
                      </Button>
                      {p.status === "active" ? (
                        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setConfirming(p)}>
                          <ShieldOff className="size-3.5" />{t("Suspend", "إيقاف")}
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setPartnerStatus(p.id, "active")}>
                          <RotateCcw className="size-3.5" />{t("Reinstate", "إعادة تفعيل")}
                        </Button>
                      )}
                    </div>
                  </div>

                  {confirming?.id === p.id && (
                    <div className="mt-3 rounded-xl border border-amber-500/35 bg-amber-500/[0.06] p-3">
                      <p className="text-[13px] font-semibold">
                        {t(`Suspend ${p.name}?`, `إيقاف ${p.nameAr}؟`)}
                      </p>
                      <p className="mt-1 text-[12px] text-muted-foreground">
                        {t(`Their ${c.live} published offers stop showing to staff, and they cannot submit new ones. Vouchers already issued are not cancelled.`,
                           `ستتوقف عروضهم المنشورة (${c.live}) عن الظهور للموظفين، ولن يتمكنوا من تقديم عروض جديدة. القسائم الصادرة لا تُلغى.`)}
                      </p>
                      <div className="mt-3 flex flex-wrap justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setConfirming(null)}>{t("Cancel", "إلغاء")}</Button>
                        <Button size="sm" className="gap-1.5" onClick={() => { setPartnerStatus(p.id, "suspended"); setConfirming(null) }}>
                          <Check className="size-3.5" />{t("Yes, suspend", "نعم، أوقف")}
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              )
            })}

            {shown.length === 0 && (
              <Card className="p-8 text-center text-[13px] text-muted-foreground lg:col-span-2">
                {t("No partner matches that search.", "لا يوجد شريك مطابق لهذا البحث.")}
              </Card>
            )}
          </div>
        </>
      )}

      {tab === "review" && (
        <div className="space-y-3">
          {awaiting.map((o) => (
            <Card key={o.id} className="p-4">
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[14px] font-semibold">{isAr ? o.headlineAr : o.headline}</span>
                    <Badge variant="outline" className={cn("text-[10px]", OFFER_STATUS.submitted.chip)}>
                      {isAr ? OFFER_STATUS.submitted.ar : OFFER_STATUS.submitted.en}
                    </Badge>
                  </div>
                  <div className="mt-1 text-[12px] text-muted-foreground">
                    {isAr ? o.vendorAr : o.vendor} · {isAr ? CATEGORY[o.category].ar : CATEGORY[o.category].en} ·{" "}
                    {t(`valid to ${o.validTo}`, `سارٍ حتى ${o.validTo}`)}
                  </div>
                  <p className="mt-2 max-w-3xl text-[12.5px] text-foreground/85">{isAr ? o.summaryAr : o.summary}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-1.5">
                  <Button variant="outline" size="sm" className="gap-1.5"
                          onClick={() => navigate(`/benefits/partners/${o.id}?preview=1`)}>
                    <Eye className="size-3.5" />{t("Preview", "معاينة")}
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { setReturningId(o.id); setNote("") }}>
                    <Undo2 className="size-3.5" />{t("Return", "إعادة")}
                  </Button>
                  <Button size="sm" className="gap-1.5" onClick={() => publishOffer(o.id)}>
                    <Check className="size-3.5" />{t("Publish", "نشر")}
                  </Button>
                </div>
              </div>

              {returningId === o.id && (
                <div className="mt-3 rounded-xl border border-border/70 bg-muted/25 p-3">
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("Why it is going back", "سبب الإعادة")}
                  </label>
                  <Textarea
                    rows={2} value={note} onChange={(e) => setNote(e.target.value)}
                    placeholder={t("The partner sees this and can correct the offer.", "سيظهر هذا للشريك ليصحّح العرض.")}
                  />
                  <div className="mt-3 flex flex-wrap justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setReturningId(null)}>{t("Cancel", "إلغاء")}</Button>
                    <Button size="sm" disabled={!note.trim()} onClick={() => { returnOffer(o.id, note.trim()); setReturningId(null) }}>
                      {t("Send back", "إرسال للشريك")}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}

          {awaiting.length === 0 && (
            <Card className="p-8 text-center text-[13px] text-muted-foreground">
              {t("Nothing is waiting for review.", "لا يوجد ما ينتظر المراجعة.")}
            </Card>
          )}
        </div>
      )}

      {/* the trail — agreements and discounts are money, so changes are answerable */}
      <Card className="p-4">
        <h2 className="text-[13.5px] font-semibold">{t("Recent changes", "آخر التغييرات")}</h2>
        {log.length === 0 ? (
          <p className="mt-2 text-[12.5px] text-muted-foreground">
            {t("Nothing has changed in this session.", "لم يتغيّر شيء في هذه الجلسة.")}
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-border/60">
            {log.slice(0, 8).map((e) => (
              <li key={e.id} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 py-2 text-[12.5px]">
                <span className="font-medium capitalize">{e.entity === "partner" ? t("Partner", "شريك") : t("Offer", "عرض")}</span>
                <span className="text-primary">{e.action}</span>
                <span className="min-w-0 flex-1 truncate text-muted-foreground">{e.detail}</span>
                <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground/70">{e.at}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
