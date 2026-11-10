import * as React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  AlertTriangle, Bell, Check, Eye, FileText, Handshake, MapPin, Pencil, Plus, Send, Ticket,
  Undo2,
} from "lucide-react"

import { PartnerPicker } from "../components/PartnerPicker"
import {
  CATEGORY, getPartner, issuedCount, markNoticesRead, noticesFor, OFFER_STATUS,
  offersFor, PARTNER_STATUS, submitOffer, useOffers, usePartnerNotices, usePartners,
  useVouchers, usedCount, vouchersLeft, withdrawOffer,
} from "../data/mock/partners"
import { Chip, Empty, FieldLabel, GoldButton, OutlineButton, Page, SectionCard } from "../components/wijha"

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
    <Page className="space-y-6">
      {/* who is signed in, and the page-level actions */}
      <section className="highlight-card hl-green rounded-2xl p-5 sm:p-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-0 flex-1 sm:min-w-[260px]">
            <FieldLabel>{t("Signed in as", "تعمل باسم")}</FieldLabel>
            <PartnerPicker value={asId} onChange={setAs} isAr={isAr} t={t} activeOnly={false} clearable={false} />
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <OutlineButton disabled={!partner} onClick={() => navigate(`/partner/vouchers?as=${asId}`)}>
              <Ticket className="size-4" />{t("Voucher tracking", "متابعة القسائم")}
            </OutlineButton>
            <GoldButton disabled={!partner || suspended} onClick={() => navigate(`/partner/offers/new?as=${asId}`)}>
              <Plus className="size-4" />{t("New offer", "عرض جديد")}
            </GoldButton>
          </div>
        </div>
        {partner && (
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12.5px] text-muted-foreground">
            <Chip className={PARTNER_STATUS[partner.status].chip}>
              {isAr ? PARTNER_STATUS[partner.status].ar : PARTNER_STATUS[partner.status].en}
            </Chip>
            <span className="tabular-nums" dir="ltr">{partner.code}</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" />{t(`${partner.branches.length} branches`, `${partner.branches.length} فروع`)}
            </span>
            <span>{t(`Agreement to ${partner.agreementTo}`, `الاتفاقية حتى ${partner.agreementTo}`)}</span>
          </div>
        )}
        <p className="mt-3 max-w-3xl text-[12.5px] text-muted-foreground">
          {t("Write an offer, submit it, and ALTANFEETHI publishes it to staff. You can edit anything that is not published.",
             "اكتب العرض وأرسله، ثم ينشره التنفيذي للموظفين. يمكنك تعديل أي عرض غير منشور.")}
        </p>

        {suspended && (
          <p className="mt-4 flex items-start gap-2 rounded-[10px] bg-error-fill p-3 text-[13px]">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-error" />
            {t("This agreement is suspended. Existing offers are hidden from staff and no new offer can be submitted until ALTANFEETHI reinstates it.",
               "هذه الاتفاقية موقوفة. العروض الحالية مخفية عن الموظفين ولا يمكن تقديم عرض جديد حتى يعيد التنفيذي تفعيلها.")}
          </p>
        )}
      </section>

      {/* what the partner is told: vouchers taken, and by whom */}
      {notices.length > 0 && (
        <SectionCard
          icon={Bell}
          title={t("Notifications", "الإشعارات")}
          action={
            <>
              {unread > 0 && <Chip tone="accent">{t(`${unread} new`, `${unread} جديد`)}</Chip>}
              {unread > 0 && partner && (
                <OutlineButton size="sm" onClick={() => markNoticesRead(partner.id)}>
                  {t("Mark all read", "تعليم الكل كمقروء")}
                </OutlineButton>
              )}
            </>
          }
        >
          <ul className="divide-y divide-border">
            {notices.slice(0, 6).map((n) => (
              <li key={n.id} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 py-2.5">
                {n.unread && <span className="size-1.5 shrink-0 rounded-full bg-primary" />}
                <span className="text-[13.5px] font-medium">{isAr ? n.titleAr : n.title}</span>
                <span className="min-w-0 flex-1 text-[12.5px] text-muted-foreground">{isAr ? n.bodyAr : n.body}</span>
                <span className="shrink-0 text-[12px] tabular-nums text-muted-foreground">{n.at}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      {returned.length > 0 && (
        <div className="rounded-xl bg-error-fill px-4 py-4 sm:px-6">
          <h2 className="flex items-center gap-2 text-[15px] font-medium">
            <Undo2 className="size-4 text-error" />
            {t(`${returned.length} offer sent back`, `${returned.length} عرض أُعيد إليك`)}
          </h2>
          <ul className="mt-2 space-y-1.5">
            {returned.map((o) => (
              <li key={o.id} className="text-[13px]">
                <span className="font-medium">{isAr ? o.headlineAr : o.headline}</span>
                {o.reviewNote && <span className="text-muted-foreground"> — {o.reviewNote}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-3">
        {([[t("Published", "منشور"), live, "text-success"],
          [t("Awaiting review", "قيد المراجعة"), mine.filter((o) => o.status === "submitted").length, "text-warning"],
          [t("Drafts", "مسودات"), mine.filter((o) => o.status === "draft").length, "text-foreground"]] as const).map(([label, n, tone]) => (
          <div key={label} className="panel rounded-xl p-5">
            <div className={cn("text-[28px] font-medium tabular-nums leading-none", tone)}>{n}</div>
            <div className="mt-1.5 text-[12.5px] text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      <SectionCard icon={Handshake} title={t("Your offers", "عروضك")} action={<Chip>{mine.length}</Chip>}>
        <div className="space-y-3">
          {mine.map((o) => {
            const st = o.status ?? "draft"
            return (
              <div key={o.id} className="rounded-[10px] bg-background p-4 ring-1 ring-border ring-inset">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[14.5px] font-medium">{isAr ? o.headlineAr : o.headline}</span>
                      <Chip className={OFFER_STATUS[st].chip}>{isAr ? OFFER_STATUS[st].ar : OFFER_STATUS[st].en}</Chip>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-muted-foreground">
                      <Chip className={cn("h-5 text-[11px]", CATEGORY[o.category].chip)}>
                        {isAr ? CATEGORY[o.category].ar : CATEGORY[o.category].en}
                      </Chip>
                      <span className="font-medium text-primary">{isAr ? o.discountAr : o.discount}</span>
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
                      <p className="mt-2 text-[13px] text-error">{o.reviewNote}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {st === "published" || st === "submitted" ? (
                      <OutlineButton size="sm" onClick={() => navigate(`/benefits/partners/${o.id}?preview=1`)}>
                        <Eye className="size-3.5" />{t("Preview", "معاينة")}
                      </OutlineButton>
                    ) : (
                      <OutlineButton size="sm" onClick={() => navigate(`/partner/offers/${o.id}/edit?as=${asId}`)}>
                        <Pencil className="size-3.5" />{t("Edit", "تعديل")}
                      </OutlineButton>
                    )}
                    {(st === "draft" || st === "returned") && (
                      <GoldButton size="sm" disabled={suspended} onClick={() => setSubmitting(o.id)}>
                        <Send className="size-3.5" />{t("Submit", "إرسال")}
                      </GoldButton>
                    )}
                    {st === "submitted" && (
                      <OutlineButton size="sm" onClick={() => withdrawOffer(o.id)}>
                        {t("Withdraw", "سحب")}
                      </OutlineButton>
                    )}
                  </div>
                </div>

                {/* submitting hands it to ALTANFEETHI, so it is confirmed first */}
                {submitting === o.id && (
                  <div className="mt-4 rounded-[10px] bg-soft-accent p-3.5">
                    <p className="text-[14px] font-medium">{t("Submit this offer for review?", "إرسال هذا العرض للمراجعة؟")}</p>
                    <p className="mt-1 text-[12.5px] text-muted-foreground">
                      {t("It goes to ALTANFEETHI. You cannot edit it while it is under review, but you can withdraw it.",
                         "سيصل إلى التنفيذي. لا يمكنك تعديله أثناء المراجعة، لكن يمكنك سحبه.")}
                    </p>
                    <div className="mt-3 flex flex-wrap justify-end gap-2">
                      <OutlineButton size="sm" onClick={() => setSubmitting(null)}>{t("Cancel", "إلغاء")}</OutlineButton>
                      <GoldButton size="sm" onClick={() => { submitOffer(o.id); setSubmitting(null) }}>
                        <Check className="size-3.5" />{t("Yes, submit", "نعم، أرسل")}
                      </GoldButton>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {partner && mine.length === 0 && (
            <Empty
              icon={FileText}
              title={t("No offers yet", "لا توجد عروض بعد")}
              hint={t("Create one and submit it for review.", "أنشئ عرضًا وأرسله للمراجعة.")}
              action={
                <GoldButton className="mt-2" disabled={suspended} onClick={() => navigate(`/partner/offers/new?as=${asId}`)}>
                  <Plus className="size-4" />{t("New offer", "عرض جديد")}
                </GoldButton>
              }
            />
          )}
          {!partner && (
            <Empty icon={Handshake} title={t("Choose a partner above", "اختر شريكًا أعلاه")} />
          )}
        </div>
      </SectionCard>
    </Page>
  )
}
