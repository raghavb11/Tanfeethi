import * as React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Badge, Button, Card } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  AlertTriangle, Bell, Check, Eye, Handshake, MapPin, Pencil, Plus, Send, Ticket,
  Undo2,
} from "lucide-react"

import { PartnerPicker } from "../components/PartnerPicker"
import {
  CATEGORY, getPartner, issuedCount, markNoticesRead, noticesFor, OFFER_STATUS,
  offersFor, PARTNER_STATUS, submitOffer, useOffers, usePartnerNotices, usePartners,
  useVouchers, usedCount, vouchersLeft, withdrawOffer,
} from "../data/mock/partners"

/** What a partner sees: their own offers and nothing else. Until sign-in
 *  exists, the partner is chosen here and carried in the query string. */
export default function PartnerPortalPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  const partners = usePartners()
  useOffers()                        // re-render as statuses change
  const asId = params.get("as") ?? partners[0]?.id ?? ""
  const partner = getPartner(asId)
  const setAs = (id: string) => setParams(id ? { as: id } : {}, { replace: true })

  const mine = partner ? offersFor(partner.id) : []
  const live = mine.filter((o) => o.status === "published").length
  const returned = mine.filter((o) => o.status === "returned")
  const suspended = partner?.status === "suspended"

  const [submitting, setSubmitting] = React.useState<string | null>(null)

  usePartnerNotices()
  useVouchers()                      // claimed and used counts stay current
  const notices = partner ? noticesFor(partner.id) : []
  const unread = notices.filter((n) => n.unread).length

  return (
    <div className="mx-auto max-w-[1100px] space-y-6 px-4 py-7 md:px-8">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-primary">
          <Handshake className="size-5" />
          <span className="text-xs font-semibold uppercase tracking-[0.14em]">{t("Partner portal", "بوابة الشركاء")}</span>
        </div>
        <h1 className="text-[22px] font-bold tracking-tight md:text-[26px]">{t("Your offers", "عروضك")}</h1>
        <p className="max-w-3xl text-[13px] text-muted-foreground">
          {t("Write an offer, submit it, and ALTANFEETHI publishes it to staff. You can edit anything that is not published.",
             "اكتب العرض وأرسله، ثم ينشره التنفيذي للموظفين. يمكنك تعديل أي عرض غير منشور.")}
        </p>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[260px] flex-1">
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("Signed in as", "تعمل باسم")}
            </label>
            <PartnerPicker value={asId} onChange={setAs} isAr={isAr} t={t} activeOnly={false} clearable={false} />
          </div>
          {partner && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
              <Badge variant="outline" className={cn("text-[10px]", PARTNER_STATUS[partner.status].chip)}>
                {isAr ? PARTNER_STATUS[partner.status].ar : PARTNER_STATUS[partner.status].en}
              </Badge>
              <span className="tabular-nums">{partner.code}</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" />{t(`${partner.branches.length} branches`, `${partner.branches.length} فروع`)}
              </span>
              <span>{t(`Agreement to ${partner.agreementTo}`, `الاتفاقية حتى ${partner.agreementTo}`)}</span>
            </div>
          )}
          <Button
            variant="outline" size="lg" className="shrink-0 gap-1.5" disabled={!partner}
            onClick={() => navigate(`/partner/vouchers?as=${asId}`)}
          >
            <Ticket className="size-4" />{t("Voucher tracking", "متابعة القسائم")}
          </Button>
          <Button
            size="lg" className="shrink-0 gap-1.5" disabled={!partner || suspended}
            onClick={() => navigate(`/partner/offers/new?as=${asId}`)}
          >
            <Plus className="size-4" />{t("New offer", "عرض جديد")}
          </Button>
        </div>

        {suspended && (
          <p className="mt-3 flex items-start gap-2 rounded-xl border border-rose-500/35 bg-rose-500/[0.06] p-3 text-[12.5px]">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-rose-500" />
            {t("This agreement is suspended. Existing offers are hidden from staff and no new offer can be submitted until ALTANFEETHI reinstates it.",
               "هذه الاتفاقية موقوفة. العروض الحالية مخفية عن الموظفين ولا يمكن تقديم عرض جديد حتى يعيد التنفيذي تفعيلها.")}
          </p>
        )}
      </Card>

      {/* what the partner is told: vouchers taken, and by whom */}
      {notices.length > 0 && (
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Bell className="size-4 text-primary" />
            <h2 className="text-[13.5px] font-semibold">{t("Notifications", "الإشعارات")}</h2>
            {unread > 0 && (
              <span className="rounded-full bg-primary/12 px-2 py-0.5 text-[11px] font-semibold text-primary">
                {t(`${unread} new`, `${unread} جديد`)}
              </span>
            )}
            {unread > 0 && partner && (
              <Button variant="outline" size="sm" className="ms-auto"
                      onClick={() => markNoticesRead(partner.id)}>
                {t("Mark all read", "تعليم الكل كمقروء")}
              </Button>
            )}
          </div>
          <ul className="mt-2 divide-y divide-border/60">
            {notices.slice(0, 6).map((n) => (
              <li key={n.id} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 py-2">
                {n.unread && <span className="size-1.5 shrink-0 rounded-full bg-primary" />}
                <span className="text-[12.5px] font-medium">{isAr ? n.titleAr : n.title}</span>
                <span className="min-w-0 flex-1 text-[12px] text-muted-foreground">{isAr ? n.bodyAr : n.body}</span>
                <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground/70">{n.at}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {returned.length > 0 && (
        <Card className="border-rose-500/30 p-4">
          <h2 className="flex items-center gap-2 text-[13.5px] font-semibold">
            <Undo2 className="size-4 text-rose-500" />
            {t(`${returned.length} offer sent back`, `${returned.length} عرض أُعيد إليك`)}
          </h2>
          <ul className="mt-2 space-y-2">
            {returned.map((o) => (
              <li key={o.id} className="text-[12.5px]">
                <span className="font-medium">{isAr ? o.headlineAr : o.headline}</span>
                {o.reviewNote && <span className="text-muted-foreground"> — {o.reviewNote}</span>}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {[[t("Published", "منشور"), live],
          [t("Awaiting review", "قيد المراجعة"), mine.filter((o) => o.status === "submitted").length],
          [t("Drafts", "مسودات"), mine.filter((o) => o.status === "draft").length]].map(([label, n]) => (
          <Card key={String(label)} className="p-4">
            <div className="text-[24px] font-bold tabular-nums">{n as number}</div>
            <div className="text-[12px] text-muted-foreground">{label as string}</div>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        {mine.map((o) => {
          const st = o.status ?? "draft"
          return (
            <Card key={o.id} className="p-4">
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[14px] font-semibold">{isAr ? o.headlineAr : o.headline}</span>
                    <Badge variant="outline" className={cn("text-[10px]", OFFER_STATUS[st].chip)}>
                      {isAr ? OFFER_STATUS[st].ar : OFFER_STATUS[st].en}
                    </Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
                    <span className={cn("rounded-full border px-1.5 py-0.5 text-[10.5px]", CATEGORY[o.category].chip)}>
                      {isAr ? CATEGORY[o.category].ar : CATEGORY[o.category].en}
                    </span>
                    <span className="font-medium text-foreground">{isAr ? o.discountAr : o.discount}</span>
                    {o.redeem === "voucher" && (
                      <span className="inline-flex items-center gap-1">
                        <Ticket className="size-3.5" />
                        <button
                          onClick={() => navigate(`/partner/vouchers?as=${asId}&offer=${o.id}`)}
                          className="hover:text-primary hover:underline"
                        >
                          {t(`${issuedCount(o.id)} claimed · ${usedCount(o.id)} used`,
                             `${issuedCount(o.id)} مطلوبة · ${usedCount(o.id)} مستخدمة`)}
                          {vouchersLeft(o) != null &&
                            t(` · ${vouchersLeft(o)} of ${o.voucherQuota} left`, ` · متبقٍ ${vouchersLeft(o)} من ${o.voucherQuota}`)}
                        </button>
                      </span>
                    )}
                    <span>
                      {o.validFrom
                        ? t(`${o.validFrom} → ${o.validTo}`, `${o.validFrom} ← ${o.validTo}`)
                        : t(`valid to ${o.validTo}`, `سارٍ حتى ${o.validTo}`)}
                    </span>
                  </div>
                  {st === "returned" && o.reviewNote && (
                    <p className="mt-2 text-[12.5px] text-rose-600 dark:text-rose-400">{o.reviewNote}</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap gap-1.5">
                  {st === "published" || st === "submitted" ? (
                    <Button variant="outline" size="sm" className="gap-1.5"
                            onClick={() => navigate(`/benefits/partners/${o.id}?preview=1`)}>
                      <Eye className="size-3.5" />{t("Preview", "معاينة")}
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="gap-1.5"
                            onClick={() => navigate(`/partner/offers/${o.id}/edit?as=${asId}`)}>
                      <Pencil className="size-3.5" />{t("Edit", "تعديل")}
                    </Button>
                  )}
                  {(st === "draft" || st === "returned") && (
                    <Button size="sm" className="gap-1.5" disabled={suspended} onClick={() => setSubmitting(o.id)}>
                      <Send className="size-3.5" />{t("Submit", "إرسال")}
                    </Button>
                  )}
                  {st === "submitted" && (
                    <Button variant="outline" size="sm" onClick={() => withdrawOffer(o.id)}>
                      {t("Withdraw", "سحب")}
                    </Button>
                  )}
                </div>
              </div>

              {/* submitting hands it to ALTANFEETHI, so it is confirmed first */}
              {submitting === o.id && (
                <div className="mt-3 rounded-xl border border-primary/30 bg-primary/[0.04] p-3">
                  <p className="text-[13px] font-semibold">{t("Submit this offer for review?", "إرسال هذا العرض للمراجعة؟")}</p>
                  <p className="mt-1 text-[12px] text-muted-foreground">
                    {t("It goes to ALTANFEETHI. You cannot edit it while it is under review, but you can withdraw it.",
                       "سيصل إلى التنفيذي. لا يمكنك تعديله أثناء المراجعة، لكن يمكنك سحبه.")}
                  </p>
                  <div className="mt-3 flex flex-wrap justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSubmitting(null)}>{t("Cancel", "إلغاء")}</Button>
                    <Button size="sm" className="gap-1.5" onClick={() => { submitOffer(o.id); setSubmitting(null) }}>
                      <Check className="size-3.5" />{t("Yes, submit", "نعم، أرسل")}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )
        })}

        {partner && mine.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-[13px] text-muted-foreground">
              {t("No offers yet. Create one and submit it for review.", "لا توجد عروض بعد. أنشئ عرضًا وأرسله للمراجعة.")}
            </p>
            <Button className="mt-3 gap-1.5" disabled={suspended} onClick={() => navigate(`/partner/offers/new?as=${asId}`)}>
              <Plus className="size-4" />{t("New offer", "عرض جديد")}
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
