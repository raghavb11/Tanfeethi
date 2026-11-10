import * as React from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { Badge, Button, Card } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  ArrowLeft, Bookmark, BookmarkCheck, CalendarClock, Check, CreditCard, Dumbbell, Eye,
  Globe, GraduationCap, Hotel, Info, Mail, MapPin, Navigation, Pencil, Phone, Send, ShoppingBag,
  Sparkles, Stethoscope, Ticket, Users, UtensilsCrossed,
} from "lucide-react"

import {
  beneficiariesFor, CATEGORY, CATEGORY_ART, cancelVoucher, directionsUrl, getOffer, hasStarted, issueVoucher,
  canIssueVoucher, OFFER_STATUS, publishOffer, submitOffer, useOffers, withdrawOffer,
  ME, type Beneficiary, fmtWhen, type PartnerCategory, type RedeemMethod, voucherStatus, VOUCHER_STATUS,
  toggleSaved, useSavedOffers, useVouchers, WHO,
} from "../data/mock/partners"

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
      <main className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6">
        <p className="text-sm text-muted-foreground">{t("That offer is no longer listed.", "لم يعد هذا العرض متاحًا.")}</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/benefits/partners")}>
          {t("Back to partner benefits", "العودة إلى مزايا الشركاء")}
        </Button>
      </main>
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
    <div className="mx-auto max-w-[1100px] space-y-5 px-4 py-7 md:px-8">
      <button
        onClick={() => navigate("/benefits/partners")}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />{t("Back to partner benefits", "العودة إلى مزايا الشركاء")}
      </button>

      {/* published, and opened from the portal: confirm what staff are seeing */}
      {!unpublished && fromBackstage && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-emerald-500/35 bg-emerald-500/[0.06] p-3.5">
          <Check className="size-4 shrink-0 text-emerald-500" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold">
              {t("Published — this is what staff see", "منشور — هذا ما يراه الموظفون")}
            </p>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              {t("Withdraw it to make changes. It comes off the benefits page while you edit.",
                 "اسحبه لإجراء تعديلات؛ سيرتفع من صفحة المزايا أثناء ذلك.")}
            </p>
          </div>
          <Button
            variant="outline" size="sm" className="shrink-0 gap-1.5"
            onClick={() => { withdrawOffer(offer.id); navigate(`/partner/offers/${offer.id}/edit`) }}
          >
            <Pencil className="size-3.5" />{t("Withdraw to edit", "اسحب للتعديل")}
          </Button>
        </div>
      )}

      {/* not live yet: say so plainly, and offer the next step from here */}
      {unpublished && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-amber-500/35 bg-amber-500/[0.07] p-3.5">
          <Eye className="size-4 shrink-0 text-amber-500" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold">
              {t("Preview — staff cannot see this offer yet", "معاينة — الموظفون لا يرون هذا العرض بعد")}
            </p>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              {status === "submitted"
                ? t("It is with ALTANFEETHI for review.", "هو لدى التنفيذي للمراجعة.")
                : t("This is exactly how it will read once it is published.", "هكذا سيظهر بالضبط بعد النشر.")}
            </p>
          </div>
          <Badge variant="outline" className={cn("shrink-0 text-[10px]", OFFER_STATUS[status].chip)}>
            {isAr ? OFFER_STATUS[status].ar : OFFER_STATUS[status].en}
          </Badge>
          <div className="flex shrink-0 flex-wrap gap-2">
            {status !== "submitted" && (
              <Button variant="outline" size="sm" className="gap-1.5"
                      onClick={() => navigate(`/partner/offers/${offer.id}/edit`)}>
                <Pencil className="size-3.5" />{t("Edit", "تعديل")}
              </Button>
            )}
            {status !== "submitted" && (
              <Button size="sm" className="gap-1.5" onClick={() => submitOffer(offer.id)}>
                <Send className="size-3.5" />{t("Submit for review", "إرسال للمراجعة")}
              </Button>
            )}
            {status === "submitted" && (
              <Button size="sm" className="gap-1.5" onClick={() => publishOffer(offer.id)}>
                <Check className="size-3.5" />{t("Publish to staff", "نشر للموظفين")}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* header */}
      <div className="relative overflow-hidden rounded-2xl">
        {offer.image ? (
          <img src={offer.image} alt="" className="h-52 w-full object-cover sm:h-64" />
        ) : (
          <div className={cn("relative h-52 w-full bg-gradient-to-br sm:h-64", CATEGORY_ART[offer.category])}>
            <CatIcon className="absolute -bottom-8 -end-6 size-56 text-white/15" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15" />

        <button
          onClick={() => toggleSaved(offer.id)}
          aria-label={isSaved ? t("Saved", "محفوظ") : t("Save", "حفظ")}
          className="absolute end-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[12px] font-semibold text-foreground backdrop-blur transition-colors hover:bg-white"
        >
          {isSaved ? <BookmarkCheck className="size-3.5 text-primary" /> : <Bookmark className="size-3.5" />}
          {isSaved ? t("Saved", "محفوظ") : t("Save", "حفظ")}
        </button>

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-semibold text-foreground backdrop-blur">
              <CatIcon className="size-3" />
              {isAr ? CATEGORY[offer.category].ar : CATEGORY[offer.category].en}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-black/35 px-2.5 py-0.5 text-[11px] text-white/90 backdrop-blur">
              <CalendarClock className="size-3" />
              {offer.validFrom && !hasStarted(offer)
                ? t(`From ${offer.validFrom} until ${offer.validTo}`, `من ${offer.validFrom} حتى ${offer.validTo}`)
                : t(`Valid until ${offer.validTo}`, `ساري حتى ${offer.validTo}`)}
            </span>
          </div>
          <h1 className="mt-2.5 font-heading text-2xl font-bold tracking-tight text-white drop-shadow-sm sm:text-3xl">
            {isAr ? offer.vendorAr : offer.vendor}
          </h1>
          <p className="mt-1 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <span className="text-[26px] font-bold leading-none text-white">{isAr ? offer.discountAr : offer.discount}</span>
            <span className="text-[13px] text-white/90">{isAr ? offer.headlineAr : offer.headline}</span>
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-5">
          <Card className="p-4">
            <p className="text-[13.5px] leading-relaxed">{isAr ? offer.summaryAr : offer.summary}</p>
          </Card>

          {/* who can use it */}
          <Card className="p-0">
            <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
              <Users className="size-4 text-primary" />
              <p className="text-[13px] font-semibold">{t("Who can use it", "من يمكنه الاستفادة")}</p>
              {offer.guestLimit && (
                <span className="ms-auto text-[11.5px] text-muted-foreground">
                  {t(`Up to ${offer.guestLimit} family members per visit`, `حتى ${offer.guestLimit} من أفراد الأسرة لكل زيارة`)}
                </span>
              )}
            </div>
            <div className="space-y-3 p-4">
              <div className="flex flex-wrap gap-1.5">
                {(["employee", "spouse", "children", "parents"] as const).map((w) => {
                  const yes = offer.eligible.includes(w)
                  return (
                    <span
                      key={w}
                      className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px]",
                        yes ? "border-emerald-500/35 bg-emerald-500/10 font-medium text-emerald-600 dark:text-emerald-400"
                            : "border-border text-muted-foreground/50 line-through")}
                    >
                      {yes && <Check className="size-3" />}{isAr ? WHO[w].ar : WHO[w].en}
                    </span>
                  )
                })}
              </div>

              {/* named, from the employee's own registered dependants */}
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("On your record", "المسجّلون لديك")}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {people.map((p) => (
                    <span key={p.id} className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/25 px-2.5 py-1 text-[12px]">
                      <span className="flex size-5 items-center justify-center rounded-full bg-primary/12 text-[9.5px] font-bold text-primary">
                        {p.initials}
                      </span>
                      {isAr ? p.nameAr : p.name}
                      <span className="text-muted-foreground">· {isAr ? p.relationAr : p.relation}</span>
                    </span>
                  ))}
                  {people.length === 0 && (
                    <p className="text-[12px] text-muted-foreground">
                      {t("This offer covers children only, and none are registered on your record.",
                         "هذا العرض للأبناء فقط، ولا يوجد أبناء مسجّلون في ملفك.")}
                    </p>
                  )}
                </div>
                <p className="mt-1.5 text-[11px] text-muted-foreground/75">
                  {t("Family members come from your HR record. Ask People & Culture to add anyone missing.",
                     "تُؤخذ بيانات الأسرة من ملفك لدى الموارد البشرية. لإضافة أي فرد، تواصل مع الموظفين والثقافة.")}
                </p>
              </div>
            </div>
          </Card>

          {/* how to claim it */}
          <Card className="p-0">
            <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
              <RedeemIcon className="size-4 text-primary" />
              <p className="text-[13px] font-semibold">{t("How to use it", "كيفية الاستفادة")}</p>
              <span className="ms-auto text-[11.5px] text-muted-foreground">
                {isAr ? REDEEM[offer.redeem].ar : REDEEM[offer.redeem].en}
              </span>
            </div>
            <div className="p-4">
              {offer.code && (
                <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-primary/30 bg-primary/[0.06] px-3 py-2.5">
                  <span className="text-[11.5px] text-muted-foreground">{t("Corporate code", "رمز الشركة")}</span>
                  <span className="font-mono text-[14px] font-bold tracking-wider text-primary">{offer.code}</span>
                </div>
              )}
              <ol className="space-y-2">
                {(isAr ? offer.howToAr : offer.howTo).map((step, i) => (
                  <li key={i} className="flex gap-2.5 text-[12.5px]">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10.5px] font-bold tabular-nums text-muted-foreground">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </Card>

          {/* branches */}
          <Card className="p-0">
            <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
              <MapPin className="size-4 text-primary" />
              <p className="text-[13px] font-semibold">{t("Where", "أين")}</p>
              <span className="ms-auto rounded-full bg-muted px-2 text-[11px] tabular-nums text-muted-foreground">
                {offer.branches.length}
              </span>
            </div>
            <div className="divide-y divide-border/40">
              {offer.branches.map((b) => (
                <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium">{isAr ? b.nameAr : b.name}</p>
                    <p className="text-[11.5px] text-muted-foreground">{isAr ? b.hoursAr : b.hours}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-3">
                    <a href={`tel:${b.phone.replace(/\s/g, "")}`}
                       className="inline-flex items-center gap-1.5 text-[12px] font-medium text-primary hover:underline">
                      <Phone className="size-3.5" />{b.phone}
                    </a>
                    <a
                      href={directionsUrl(b, offer.vendor)} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 px-2.5 py-1.5 text-[12px] font-medium transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      <Navigation className="size-3.5" />{t("Directions", "الاتجاهات")}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* terms */}
          <Card className="p-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("Terms", "الشروط")}
            </p>
            <ul className="space-y-1.5">
              {(isAr ? offer.termsAr : offer.terms).map((x, i) => (
                <li key={i} className="flex gap-2 text-[12px] text-muted-foreground">
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/40" />
                  <span className="leading-relaxed">{x}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* ── side rail: vouchers and the vendor ── */}
        <div className="space-y-5">
          {offer.redeem === "voucher" ? (
            <Card className="p-4">
              <p className="text-[13px] font-semibold">{t("Get a voucher", "احصل على قسيمة")}</p>
              <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                {t("Issued in one person's name and valid for 30 days.",
                   "تُصدر باسم شخص واحد وصالحة لمدة ٣٠ يومًا.")}
              </p>

              {/* the allocation is the partner's business; staff see only
                  whether a voucher can be had */}
              {!canIssueVoucher(offer) && (
                <p className="mt-3 rounded-xl border border-border/70 bg-muted/30 p-3 text-[12px] text-muted-foreground">
                  {t("Vouchers for this offer have all been taken. The partner may release more — check back, or contact them directly.",
                     "نفدت قسائم هذا العرض. قد يوفّر الشريك المزيد — عاود لاحقًا أو تواصل معه مباشرة.")}
                </p>
              )}

              {canIssueVoucher(offer) && (
              <div className="mt-3 space-y-1.5">
                {people.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setPicked(p); setConfirming(false) }}
                    aria-pressed={picked?.id === p.id}
                    className={cn("flex w-full items-center gap-2 rounded-xl border px-2.5 py-2 text-start transition-colors",
                      picked?.id === p.id ? "border-primary/40 bg-primary/10" : "border-border/70 hover:bg-muted/40")}
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/12 text-[10px] font-bold text-primary">
                      {p.initials}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-medium">{isAr ? p.nameAr : p.name}</span>
                      <span className="block text-[11px] text-muted-foreground">{isAr ? p.relationAr : p.relation}</span>
                    </span>
                    {picked?.id === p.id && <Check className="size-4 shrink-0 text-primary" />}
                  </button>
                ))}
              </div>
              )}

              {picked && canIssueVoucher(offer) && !confirming && (
                <Button className="mt-3 w-full" onClick={() => setConfirming(true)}>
                  <Ticket className="size-4" />{t("Issue voucher", "إصدار القسيمة")}
                </Button>
              )}

              {/* confirm before anything is issued in someone's name */}
              {picked && confirming && (
                <div className="mt-3 rounded-xl border border-primary/30 bg-primary/[0.05] p-3">
                  <p className="text-[12.5px] font-semibold">
                    {t(`Issue this voucher to ${picked.name}?`, `إصدار القسيمة باسم ${picked.nameAr}؟`)}
                  </p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">
                    {t("The vendor checks that name against ID at the counter, and it expires in 30 days.",
                       "يتحقق المورد من الاسم مقابل الهوية عند الاستلام، وتنتهي خلال ٣٠ يومًا.")}
                  </p>
                  <div className="mt-2 flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setConfirming(false)}>{t("Cancel", "إلغاء")}</Button>
                    <Button size="sm" onClick={issue}><Check className="size-3.5" />{t("Yes, issue it", "نعم، أصدرها")}</Button>
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card className="flex items-start gap-2.5 p-4">
              <Info className="mt-0.5 size-4 shrink-0 text-primary" />
              <p className="text-[12px] leading-relaxed text-muted-foreground">
                {offer.redeem === "card"
                  ? t("No voucher needed — your digital employee card is the proof.",
                      "لا حاجة لقسيمة — بطاقتك الوظيفية الرقمية هي الإثبات.")
                  : offer.redeem === "code"
                    ? t("No voucher needed — quote the corporate code above.",
                        "لا حاجة لقسيمة — اذكر رمز الشركة أعلاه.")
                    : t("Book with the partner directly and mention ALTANFEETHI.",
                        "احجز مع الشريك مباشرة مع ذكر التنفيذي.")}
              </p>
            </Card>
          )}

          {/* vouchers already issued for this offer */}
          {mine.length > 0 && (
            <Card className="p-0">
              <div className="border-b border-border/60 px-4 py-3">
                <p className="text-[13px] font-semibold">{t("Your vouchers", "قسائمك")}</p>
              </div>
              <div className="divide-y divide-border/40">
                {mine.map((v) => (
                  <div key={v.id} className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-[13px] font-bold tracking-wider text-primary">
                        {v.ref}
                      </span>
                      <Badge variant="outline" className={cn("text-[10px]", VOUCHER_STATUS[voucherStatus(v)].chip)}>
                        {isAr ? VOUCHER_STATUS[voucherStatus(v)].ar : VOUCHER_STATUS[voucherStatus(v)].en}
                      </Badge>
                    </div>
                    <p className="mt-1.5 text-[12px]">
                      {t(`For ${v.forName} · ${v.relation}`, `لـ ${v.forNameAr} · ${v.relationAr}`)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {t(`Issued ${v.issued} · expires ${v.expires}`, `صدرت ${v.issuedAr} · تنتهي ${v.expiresAr}`)}
                    </p>
                    {v.used && v.usedAtISO && (
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                        {t(`Used ${fmtWhen(v.usedAtISO)}${v.usedBranch ? ` at ${v.usedBranch}` : ""}`,
                           `استُخدمت ${fmtWhen(v.usedAtISO, true)}${v.usedBranchAr ? ` في ${v.usedBranchAr}` : ""}`)}
                      </p>
                    )}
                    {/* the partner marks it used at the counter; staff can only
                        give back a voucher they will not use */}
                    {voucherStatus(v) === "active" && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Button variant="ghost" size="sm" onClick={() => cancelVoucher(v.id)}>
                          {t("Cancel voucher", "إلغاء القسيمة")}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* the vendor */}
          <Card className="p-4">
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("Partner contact", "التواصل مع الشريك")}
            </p>
            <div className="space-y-2 text-[12px]">
              <p className="font-medium">{isAr ? offer.contact.nameAr : offer.contact.name}</p>
              <a href={`tel:${offer.contact.phone.replace(/\s/g, "")}`}
                 className="flex items-center gap-2 text-primary hover:underline">
                <Phone className="size-3.5" />{offer.contact.phone}
              </a>
              <a href={`mailto:${offer.contact.email}`} className="flex items-center gap-2 text-primary hover:underline">
                <Mail className="size-3.5" />{offer.contact.email}
              </a>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground/75">
              {t("The vendor delivers the service. For anything about the agreement itself, contact People & Culture.",
                 "المورد هو من يقدّم الخدمة. أما ما يخص الاتفاقية نفسها فتواصل مع الموظفين والثقافة.")}
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
