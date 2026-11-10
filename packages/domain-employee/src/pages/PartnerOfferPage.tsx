import * as React from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  ArrowLeft, Bookmark, BookmarkCheck, CalendarClock, Check, CreditCard, Dumbbell, Eye,
  Globe, GraduationCap, Hotel, Info, Mail, MapPin, Navigation, Pencil, Phone, Send, ShoppingBag,
  ScrollText, Sparkles, Stethoscope, Ticket, Users, UtensilsCrossed,
} from "lucide-react"

import {
  beneficiariesFor, CATEGORY, CATEGORY_ART, cancelVoucher, directionsUrl, getOffer, hasStarted, issueVoucher,
  canIssueVoucher, OFFER_STATUS, publishOffer, submitOffer, useOffers, withdrawOffer,
  ME, type Beneficiary, fmtWhen, type PartnerCategory, type RedeemMethod, voucherStatus, VOUCHER_STATUS,
  toggleSaved, useSavedOffers, useVouchers, WHO,
} from "../data/mock/partners"
import { Chip, Empty, GoldButton, Initials, OutlineButton, Page, SectionCard, Tile } from "../components/wijha"

const CAT_ICON: Record<PartnerCategory, typeof Sparkles> = {
  wellness: Sparkles, health: Stethoscope, fitness: Dumbbell,
  dining: UtensilsCrossed, travel: Hotel, retail: ShoppingBag, education: GraduationCap,
}

const REDEEM: Record<RedeemMethod, { en: string; ar: string; icon: typeof Ticket }> = {
  card: { en: "Show your employee card", ar: "أبرز بطاقتك الوظيفية", icon: CreditCard },
  code: { en: "Quote the corporate code", ar: "اذكر رمز الشركة", icon: Ticket },
  voucher: { en: "Issue a voucher first", ar: "أصدر قسيمة أولًا", icon: Ticket },
  booking: { en: "Book through the partner", ar: "احجز عبر الشريك", icon: Globe },
}

/** One partner offer: the terms, who in the family may use it, and the way in. */
export default function PartnerOfferPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const { id = "" } = useParams()
  const [params] = useSearchParams()
  /** Reached from the partner portal or the review queue, rather than by a
   *  member of staff browsing the benefits. */
  const fromBackstage = params.get("preview") === "1"

  useOffers()                        // the preview follows the offer's status
  const offer = getOffer(id)
  const saved = useSavedOffers()
  const allVouchers = useVouchers()

  // issuing a voucher names a person, so it is chosen and then confirmed
  const [picked, setPicked] = React.useState<Beneficiary | null>(null)
  const [confirming, setConfirming] = React.useState(false)

  if (!offer) {
    return (
      <Page>
        <div className="panel rounded-xl">
          <Empty icon={Ticket} title={t("That offer is no longer listed.", "لم يعد هذا العرض متاحًا.")}
            action={<OutlineButton className="mt-2" onClick={() => navigate("/benefits/partners")}>{t("Back to partner benefits", "العودة إلى مزايا الشركاء")}</OutlineButton>} />
        </div>
      </Page>
    )
  }

  const people = beneficiariesFor(offer)
  // an employee sees the vouchers they claimed; everyone else's are the partner's business
  const mine = allVouchers.filter((v) => v.offerId === offer.id && v.claimedById === ME.id && !v.cancelled)
  const isSaved = saved.includes(offer.id)
  const CatIcon = CAT_ICON[offer.category]
  const RedeemIcon = REDEEM[offer.redeem].icon

  const issue = () => {
    if (!picked) return
    issueVoucher(offer.id, picked)
    setPicked(null); setConfirming(false)
  }

  const status = offer.status ?? "published"
  const unpublished = status !== "published"

  return (
    <Page className="space-y-6">
      <button
        onClick={() => navigate("/benefits/partners")}
        className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />{t("Back to partner benefits", "العودة إلى مزايا الشركاء")}
      </button>

      {/* published, and opened from the portal: confirm what staff are seeing */}
      {!unpublished && fromBackstage && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-success-fill p-4">
          <Check className="size-4 shrink-0 text-success" />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-medium">
              {t("Published — this is what staff see", "منشور — هذا ما يراه الموظفون")}
            </p>
            <p className="mt-0.5 text-[12.5px] text-muted-foreground">
              {t("Withdraw it to make changes. It comes off the benefits page while you edit.",
                 "اسحبه لإجراء تعديلات؛ سيرتفع من صفحة المزايا أثناء ذلك.")}
            </p>
          </div>
          <OutlineButton size="sm" onClick={() => { withdrawOffer(offer.id); navigate(`/partner/offers/${offer.id}/edit`) }}>
            <Pencil className="size-3.5" />{t("Withdraw to edit", "اسحب للتعديل")}
          </OutlineButton>
        </div>
      )}

      {/* not live yet: say so plainly, and offer the next step from here */}
      {unpublished && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-warning-fill p-4">
          <Eye className="size-4 shrink-0 text-warning" />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-medium">
              {t("Preview — staff cannot see this offer yet", "معاينة — الموظفون لا يرون هذا العرض بعد")}
            </p>
            <p className="mt-0.5 text-[12.5px] text-muted-foreground">
              {status === "submitted"
                ? t("It is with ALTANFEETHI for review.", "هو لدى التنفيذي للمراجعة.")
                : t("This is exactly how it will read once it is published.", "هكذا سيظهر بالضبط بعد النشر.")}
            </p>
          </div>
          <Chip className={OFFER_STATUS[status].chip}>{isAr ? OFFER_STATUS[status].ar : OFFER_STATUS[status].en}</Chip>
          <div className="flex shrink-0 flex-wrap gap-2">
            {status !== "submitted" && (
              <OutlineButton size="sm" onClick={() => navigate(`/partner/offers/${offer.id}/edit`)}>
                <Pencil className="size-3.5" />{t("Edit", "تعديل")}
              </OutlineButton>
            )}
            {status !== "submitted" && (
              <GoldButton size="sm" onClick={() => submitOffer(offer.id)}>
                <Send className="size-3.5" />{t("Submit for review", "إرسال للمراجعة")}
              </GoldButton>
            )}
            {status === "submitted" && (
              <GoldButton size="sm" onClick={() => publishOffer(offer.id)}>
                <Check className="size-3.5" />{t("Publish to staff", "نشر للموظفين")}
              </GoldButton>
            )}
          </div>
        </div>
      )}

      {/* header */}
      <div className="relative overflow-hidden rounded-2xl ring-1 ring-border ring-inset">
        {offer.image ? (
          <img src={offer.image} alt="" className="h-52 w-full object-cover sm:h-64" />
        ) : (
          <div className={cn("relative h-52 w-full bg-gradient-to-br sm:h-64", CATEGORY_ART[offer.category])}>
            <CatIcon className="absolute -bottom-8 -end-6 size-56 text-foreground/15" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15" />

        <button
          onClick={() => toggleSaved(offer.id)}
          aria-label={isSaved ? t("Saved", "محفوظ") : t("Save", "حفظ")}
          className="absolute end-4 top-4 inline-flex h-8 items-center gap-1.5 rounded-lg bg-background/85 px-3 text-[12.5px] font-medium text-foreground backdrop-blur transition-colors hover:bg-background"
        >
          {isSaved ? <BookmarkCheck className="size-3.5 text-primary" /> : <Bookmark className="size-3.5" />}
          {isSaved ? t("Saved", "محفوظ") : t("Save", "حفظ")}
        </button>

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-background/85 px-2.5 py-0.5 text-[12px] font-medium text-foreground backdrop-blur">
              <CatIcon className="size-3" />
              {isAr ? CATEGORY[offer.category].ar : CATEGORY[offer.category].en}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-black/40 px-2.5 py-0.5 text-[12px] text-white backdrop-blur">
              <CalendarClock className="size-3" />
              {offer.validFrom && !hasStarted(offer)
                ? t(`From ${offer.validFrom} until ${offer.validTo}`, `من ${offer.validFrom} حتى ${offer.validTo}`)
                : t(`Valid until ${offer.validTo}`, `ساري حتى ${offer.validTo}`)}
            </span>
          </div>
          <h2 className="mt-2.5 text-2xl font-medium tracking-tight text-white drop-shadow-sm sm:text-[28px]">
            {isAr ? offer.vendorAr : offer.vendor}
          </h2>
          <p className="mt-1 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <span className="text-[26px] font-medium leading-none text-primary">{isAr ? offer.discountAr : offer.discount}</span>
            <span className="text-[14px] text-white/90">{isAr ? offer.headlineAr : offer.headline}</span>
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-6">
          <SectionCard icon={Info} title={t("About this offer", "عن العرض")}>
            <p className="text-[14.5px] leading-relaxed">{isAr ? offer.summaryAr : offer.summary}</p>
          </SectionCard>

          {/* who can use it */}
          <SectionCard
            icon={Users}
            title={t("Who can use it", "من يمكنه الاستفادة")}
            action={offer.guestLimit ? (
              <span className="text-[12.5px] text-muted-foreground">
                {t(`Up to ${offer.guestLimit} family members per visit`, `حتى ${offer.guestLimit} من أفراد الأسرة لكل زيارة`)}
              </span>
            ) : undefined}
          >
            <div className="space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {(["employee", "spouse", "children", "parents"] as const).map((w) => {
                  const yes = offer.eligible.includes(w)
                  return yes ? (
                    <Chip key={w} tone="success" icon={Check}>{isAr ? WHO[w].ar : WHO[w].en}</Chip>
                  ) : (
                    <Chip key={w} className="text-muted-foreground/60 line-through">{isAr ? WHO[w].ar : WHO[w].en}</Chip>
                  )
                })}
              </div>

              {/* named, from the employee's own registered dependants */}
              <div>
                <p className="mb-2 text-[12.5px] text-muted-foreground">{t("On your record", "المسجّلون لديك")}</p>
                <div className="flex flex-wrap gap-2">
                  {people.map((p) => (
                    <span key={p.id} className="inline-flex items-center gap-2 rounded-full bg-background py-1 pe-3 ps-1 text-[13px] ring-1 ring-border ring-inset">
                      <Initials text={p.initials} tone="accent" className="size-6 text-[10px]" />
                      {isAr ? p.nameAr : p.name}
                      <span className="text-muted-foreground">· {isAr ? p.relationAr : p.relation}</span>
                    </span>
                  ))}
                  {people.length === 0 && (
                    <p className="text-[12.5px] text-muted-foreground">
                      {t("This offer covers children only, and none are registered on your record.",
                         "هذا العرض للأبناء فقط، ولا يوجد أبناء مسجّلون في ملفك.")}
                    </p>
                  )}
                </div>
                <p className="mt-2 text-[12px] text-muted-foreground">
                  {t("Family members come from your HR record. Ask People & Culture to add anyone missing.",
                     "تُؤخذ بيانات الأسرة من ملفك لدى الموارد البشرية. لإضافة أي فرد، تواصل مع الموظفين والثقافة.")}
                </p>
              </div>
            </div>
          </SectionCard>

          {/* how to claim it */}
          <SectionCard
            icon={RedeemIcon}
            title={t("How to use it", "كيفية الاستفادة")}
            action={<Chip tone="accent">{isAr ? REDEEM[offer.redeem].ar : REDEEM[offer.redeem].en}</Chip>}
          >
            {offer.code && (
              <Tile className="mb-4 flex flex-wrap items-center gap-3 py-3">
                <span className="text-[12.5px] text-muted-foreground">{t("Corporate code", "رمز الشركة")}</span>
                <span dir="ltr" className="font-mono text-[15px] font-bold tracking-wider text-primary">{offer.code}</span>
              </Tile>
            )}
            <ol className="space-y-2.5">
              {(isAr ? offer.howToAr : offer.howTo).map((step, i) => (
                <li key={i} className="flex gap-3 text-[14px]">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-soft-accent text-[11.5px] font-medium tabular-nums text-primary">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </SectionCard>

          {/* branches */}
          <SectionCard icon={MapPin} title={t("Where", "أين")} action={<Chip>{offer.branches.length}</Chip>}>
            {offer.branches.length === 0 ? (
              <Empty icon={MapPin} title={t("No branches listed", "لا توجد فروع مسجّلة")} />
            ) : (
              <div className="space-y-3">
                {offer.branches.map((b) => (
                  <Tile key={b.id} className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[14.5px]">{isAr ? b.nameAr : b.name}</p>
                      <p className="text-[12.5px] text-muted-foreground">{isAr ? b.hoursAr : b.hours}</p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-3">
                      <a href={`tel:${b.phone.replace(/\s/g, "")}`} dir="ltr"
                         className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primary hover:underline">
                        <Phone className="size-3.5" />{b.phone}
                      </a>
                      <a
                        href={directionsUrl(b, offer.vendor)} target="_blank" rel="noopener noreferrer"
                        className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-[var(--btn-outline-border)] px-3 text-[13px] font-medium transition-colors hover:bg-[var(--btn-outline-hover)] hover:text-primary"
                      >
                        <Navigation className="size-3.5" />{t("Directions", "الاتجاهات")}
                      </a>
                    </div>
                  </Tile>
                ))}
              </div>
            )}
          </SectionCard>

          {/* terms */}
          <SectionCard icon={ScrollText} title={t("Terms", "الشروط")}>
            <ul className="space-y-2">
              {(isAr ? offer.termsAr : offer.terms).map((x, i) => (
                <li key={i} className="flex gap-2.5 text-[13px] text-muted-foreground">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
                  <span className="leading-relaxed">{x}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>

        {/* ── side rail: vouchers and the vendor ── */}
        <div className="space-y-6">
          {offer.redeem === "voucher" ? (
            <SectionCard icon={Ticket} title={t("Get a voucher", "احصل على قسيمة")}>
              <p className="text-[12.5px] text-muted-foreground">
                {t("Issued in one person's name and valid for 30 days.",
                   "تُصدر باسم شخص واحد وصالحة لمدة 30 يومًا.")}
              </p>

              {/* the allocation is the partner's business; staff see only
                  whether a voucher can be had */}
              {!canIssueVoucher(offer) && (
                <Tile className="mt-3 text-[12.5px] text-muted-foreground">
                  {t("Vouchers for this offer have all been taken. The partner may release more — check back, or contact them directly.",
                     "نفدت قسائم هذا العرض. قد يوفّر الشريك المزيد — عاود لاحقًا أو تواصل معه مباشرة.")}
                </Tile>
              )}

              {canIssueVoucher(offer) && (
              <div className="mt-3 space-y-2">
                {people.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setPicked(p); setConfirming(false) }}
                    aria-pressed={picked?.id === p.id}
                    className={cn("flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-start ring-1 ring-inset transition-colors",
                      picked?.id === p.id ? "bg-soft-accent ring-primary/40" : "bg-background ring-border hover:ring-primary/30")}
                  >
                    <Initials text={p.initials} tone="accent" className="size-8 text-[11px]" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px]">{isAr ? p.nameAr : p.name}</span>
                      <span className="block text-[12px] text-muted-foreground">{isAr ? p.relationAr : p.relation}</span>
                    </span>
                    {picked?.id === p.id && <Check className="size-4 shrink-0 text-primary" />}
                  </button>
                ))}
              </div>
              )}

              {picked && canIssueVoucher(offer) && !confirming && (
                <GoldButton className="mt-4 w-full" onClick={() => setConfirming(true)}>
                  <Ticket className="size-4" />{t("Issue voucher", "إصدار القسيمة")}
                </GoldButton>
              )}

              {/* confirm before anything is issued in someone's name */}
              {picked && confirming && (
                <div className="mt-4 rounded-[10px] bg-soft-accent p-3.5">
                  <p className="text-[13.5px] font-medium">
                    {t(`Issue this voucher to ${picked.name}?`, `إصدار القسيمة باسم ${picked.nameAr}؟`)}
                  </p>
                  <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                    {t("The vendor checks that name against ID at the counter, and it expires in 30 days.",
                       "يتحقق المورد من الاسم مقابل الهوية عند الاستلام، وتنتهي خلال 30 يومًا.")}
                  </p>
                  <div className="mt-3 flex justify-end gap-2">
                    <OutlineButton size="sm" onClick={() => setConfirming(false)}>{t("Cancel", "إلغاء")}</OutlineButton>
                    <GoldButton size="sm" onClick={issue}><Check className="size-3.5" />{t("Yes, issue it", "نعم، أصدرها")}</GoldButton>
                  </div>
                </div>
              )}
            </SectionCard>
          ) : (
            <div className="panel flex items-start gap-3 rounded-xl p-5">
              <Info className="mt-0.5 size-4 shrink-0 text-primary" />
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {offer.redeem === "card"
                  ? t("No voucher needed — your digital employee card is the proof.",
                      "لا حاجة لقسيمة — بطاقتك الوظيفية الرقمية هي الإثبات.")
                  : offer.redeem === "code"
                    ? t("No voucher needed — quote the corporate code above.",
                        "لا حاجة لقسيمة — اذكر رمز الشركة أعلاه.")
                    : t("Book with the partner directly and mention ALTANFEETHI.",
                        "احجز مع الشريك مباشرة مع ذكر التنفيذي.")}
              </p>
            </div>
          )}

          {/* vouchers already issued for this offer */}
          {mine.length > 0 && (
            <SectionCard icon={Ticket} title={t("Your vouchers", "قسائمك")} action={<Chip>{mine.length}</Chip>}>
              <div className="space-y-3">
                {mine.map((v) => {
                  const st = VOUCHER_STATUS[voucherStatus(v)]
                  return (
                    <Tile key={v.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span dir="ltr" className="accent-chip rounded-md px-2.5 py-1 font-mono text-[13px] font-bold tracking-wider">
                          {v.ref}
                        </span>
                        <Chip className={st.chip}>{isAr ? st.ar : st.en}</Chip>
                      </div>
                      <p className="mt-2 text-[13.5px]">
                        {t(`For ${v.forName} · ${v.relation}`, `لـ ${v.forNameAr} · ${v.relationAr}`)}
                      </p>
                      <p className="text-[12px] text-muted-foreground">
                        {t(`Issued ${v.issued} · expires ${v.expires}`, `صدرت ${v.issuedAr} · تنتهي ${v.expiresAr}`)}
                      </p>
                      {v.used && v.usedAtISO && (
                        <p className="text-[12px] text-success">
                          {t(`Used ${fmtWhen(v.usedAtISO)}${v.usedBranch ? ` at ${v.usedBranch}` : ""}`,
                             `استُخدمت ${fmtWhen(v.usedAtISO, true)}${v.usedBranchAr ? ` في ${v.usedBranchAr}` : ""}`)}
                        </p>
                      )}
                      {/* the partner marks it used at the counter; staff can only
                          give back a voucher they will not use */}
                      {voucherStatus(v) === "active" && (
                        <button onClick={() => cancelVoucher(v.id)} className="mt-2 text-[12.5px] font-medium text-error hover:underline">
                          {t("Cancel voucher", "إلغاء القسيمة")}
                        </button>
                      )}
                    </Tile>
                  )
                })}
              </div>
            </SectionCard>
          )}

          {/* the vendor */}
          <SectionCard icon={Phone} title={t("Partner contact", "التواصل مع الشريك")}>
            <div className="space-y-2 text-[13px]">
              <p className="text-[14.5px]">{isAr ? offer.contact.nameAr : offer.contact.name}</p>
              <a href={`tel:${offer.contact.phone.replace(/\s/g, "")}`}
                 className="flex items-center gap-2 text-primary hover:underline">
                <Phone className="size-3.5" /><span dir="ltr">{offer.contact.phone}</span>
              </a>
              <a href={`mailto:${offer.contact.email}`} className="flex items-center gap-2 break-all text-primary hover:underline">
                <Mail className="size-3.5 shrink-0" />{offer.contact.email}
              </a>
            </div>
            <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
              {t("The vendor delivers the service. For anything about the agreement itself, contact People & Culture.",
                 "المورد هو من يقدّم الخدمة. أما ما يخص الاتفاقية نفسها فتواصل مع الموظفين والثقافة.")}
            </p>
          </SectionCard>
        </div>
      </div>
    </Page>
  )
}
