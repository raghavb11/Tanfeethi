import * as React from "react"
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { Button, Card, Input, Textarea } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import { ArrowLeft, Check, Eye, ImagePlus, Plus, Save, Send, Upload, X } from "lucide-react"

import { PartnerPicker } from "../components/PartnerPicker"
import {
  addOffer, CATEGORY, type EligibleWho, getOffer, getPartner, IMAGE_LIBRARY,
  newOfferId, type PartnerCategory, prettyWhen, type RedeemMethod, updateOffer, WHO,
} from "../data/mock/partners"

const CATEGORIES = Object.keys(CATEGORY) as PartnerCategory[]
const WHO_IDS = Object.keys(WHO) as EligibleWho[]

const REDEEM: Record<RedeemMethod, { en: string; ar: string; hint: string; hintAr: string }> = {
  voucher: { en: "Voucher", ar: "قسيمة", hint: "Staff issue a voucher in the portal and show it at the counter.", hintAr: "يُصدر الموظف قسيمة من البوابة ويبرزها عند الاستلام." },
  code: { en: "Discount code", ar: "رمز خصم", hint: "One code, quoted at the counter or online.", hintAr: "رمز واحد يُذكر عند الدفع أو عبر الإنترنت." },
  card: { en: "Employee card", ar: "البطاقة الوظيفية", hint: "The digital employee card is enough.", hintAr: "تكفي البطاقة الوظيفية الرقمية." },
  booking: { en: "Booking request", ar: "طلب حجز", hint: "Staff book with you first and mention ALTANFEETHI.", hintAr: "يحجز الموظف معكم أولًا مع ذكر التنفيذي." },
}

/** Write one offer. The partner owns this page; an administrator opens the same
 *  page read-only from the review queue once it is published. */
export default function PartnerOfferEditorPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const { id } = useParams()
  const [params] = useSearchParams()

  const offer = id ? getOffer(id) : undefined
  const editing = !!offer
  /** A published or submitted offer is not edited in place. There is nothing
   *  useful in a form full of disabled fields, so viewing one means the
   *  preview — the offer as staff see it. */
  const viewOnly = offer?.status === "published" || offer?.status === "submitted"
  const readOnly = false

  const [partnerId, setPartnerId] = React.useState(offer?.partnerId ?? params.get("as") ?? "")
  const partner = getPartner(partnerId)
  const back = `/partner${partnerId ? `?as=${partnerId}` : ""}`

  const [category, setCategory] = React.useState<PartnerCategory>(offer?.category ?? partner?.category ?? "wellness")
  const [discount, setDiscount] = React.useState(offer?.discount ?? "")
  const [discountAr, setDiscountAr] = React.useState(offer?.discountAr ?? "")
  const [headline, setHeadline] = React.useState(offer?.headline ?? "")
  const [headlineAr, setHeadlineAr] = React.useState(offer?.headlineAr ?? "")
  const [summary, setSummary] = React.useState(offer?.summary ?? "")
  const [summaryAr, setSummaryAr] = React.useState(offer?.summaryAr ?? "")
  const [eligible, setEligible] = React.useState<EligibleWho[]>(offer?.eligible ?? ["employee"])
  const [guestLimit, setGuestLimit] = React.useState(offer?.guestLimit ? String(offer.guestLimit) : "")
  const [redeem, setRedeem] = React.useState<RedeemMethod>(offer?.redeem ?? "voucher")
  const [code, setCode] = React.useState(offer?.code ?? "")
  /** `datetime-local` only understands "2026-12-31T00:00", so an older
   *  date-only value has to be widened before it will show at all. */
  const asLocal = (iso?: string) => (iso ? (iso.includes("T") ? iso : `${iso}T00:00`) : "")
  const [validFromISO, setValidFromISO] = React.useState(asLocal(offer?.validFromISO))
  const [validToISO, setValidToISO] = React.useState(asLocal(offer?.validToISO))
  const [branchIds, setBranchIds] = React.useState<string[]>(offer?.branches.map((b) => b.id) ?? [])
  const [howTo, setHowTo] = React.useState<string[]>(offer?.howTo ?? [])
  const [terms, setTerms] = React.useState<string[]>(offer?.terms ?? [])
  const [image, setImage] = React.useState(offer?.image ?? "")
  const [quota, setQuota] = React.useState(offer?.voucherQuota ? String(offer.voucherQuota) : "")
  const fileRef = React.useRef<HTMLInputElement>(null)

  /** Read the chosen file straight into the offer. A real build would put it
   *  in the media library and keep the URL. */
  const onFile = (f?: File) => {
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => setImage(String(reader.result))
    reader.readAsDataURL(f)
  }

  // the partner's category is the sensible default for their first offer
  React.useEffect(() => {
    if (!editing && partner) setCategory(partner.category)
  }, [partnerId])           // eslint-disable-line react-hooks/exhaustive-deps


  const toggleWho = (w: EligibleWho) =>
    setEligible((e) => (w === "employee" ? e : e.includes(w) ? e.filter((x) => x !== w) : [...e, w]))
  const toggleBranch = (bid: string) =>
    setBranchIds((b) => (b.includes(bid) ? b.filter((x) => x !== bid) : [...b, bid]))

  const listField = (
    items: string[], set: (v: string[]) => void, placeholder: string, addLabel: string,
  ) => (
    <div className="space-y-2">
      {items.map((line, i) => (
        <div key={i} className="flex gap-2">
          <Input
            value={line} disabled={readOnly}
            onChange={(e) => set(items.map((x, j) => (j === i ? e.target.value : x)))}
            placeholder={placeholder}
          />
          {!readOnly && (
            <button
              onClick={() => set(items.filter((_, j) => j !== i))} aria-label={t("Remove", "إزالة")}
              className="shrink-0 text-muted-foreground hover:text-rose-500"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      ))}
      {!readOnly && (
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => set([...items, ""])}>
          <Plus className="size-3.5" />{addLabel}
        </Button>
      )}
    </div>
  )

  const canSave = !!partner && headline.trim() !== "" && discount.trim() !== "" && validToISO !== ""

  const build = (status: "draft" | "submitted") => {
    const p = partner!
    return {
      partnerId: p.id,
      status,
      vendor: p.name, vendorAr: p.nameAr,
      category,
      discount: discount.trim(), discountAr: discountAr.trim() || discount.trim(),
      headline: headline.trim(), headlineAr: headlineAr.trim() || headline.trim(),
      summary: summary.trim(), summaryAr: summaryAr.trim() || summary.trim(),
      eligible: eligible.includes("employee") ? eligible : ["employee" as EligibleWho, ...eligible],
      guestLimit: guestLimit.trim() ? Number(guestLimit) : undefined,
      redeem,
      code: redeem === "code" ? code.trim() || undefined : undefined,
      howTo: howTo.filter((x) => x.trim() !== ""),
      howToAr: howTo.filter((x) => x.trim() !== ""),
      branches: p.branches.filter((b) => branchIds.includes(b.id)),
      validFrom: prettyWhen(validFromISO), validFromISO: validFromISO || undefined,
      validTo: prettyWhen(validToISO), validToISO,
      terms: terms.filter((x) => x.trim() !== ""),
      termsAr: terms.filter((x) => x.trim() !== ""),
      contact: p.contact,
      image: image.trim() || undefined,
      voucherQuota: redeem === "voucher" && quota.trim() ? Number(quota) : undefined,
    }
  }

  /** Saving can land back on the list, or on the preview — what staff would
   *  see — so nothing is submitted sight unseen. */
  const save = (status: "draft" | "submitted", then: "list" | "preview" = "list") => {
    if (!canSave) return
    const fields = build(status)
    const offerId = offer ? offer.id : newOfferId(partner!.name)
    if (offer) updateOffer(offer.id, fields)
    else addOffer({ id: offerId, ...fields })
    navigate(then === "preview" ? `/benefits/partners/${offerId}?preview=1&as=${partnerId}` : back)
  }

  const label = (s: string) => (
    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{s}</label>
  )

  if (viewOnly && offer) {
    return <Navigate to={`/benefits/partners/${offer.id}?preview=1`} replace />
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => navigate(back)} className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-foreground">
          <ArrowLeft className={cn("size-3.5", isAr && "rotate-180")} />{t("Back to your offers", "العودة إلى عروضك")}
        </button>
        {!readOnly && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate(back)}>{t("Cancel", "إلغاء")}</Button>
            <Button variant="outline" disabled={!canSave} className="gap-1.5" onClick={() => save("draft")}>
              <Save className="size-4" />{t("Save draft", "حفظ كمسودة")}
            </Button>
            <Button variant="outline" disabled={!canSave} className="gap-1.5" onClick={() => save("draft", "preview")}>
              <Eye className="size-4" />{t("Save & preview", "حفظ ومعاينة")}
            </Button>
            <Button disabled={!canSave} className="gap-1.5" onClick={() => save("submitted")}>
              <Send className="size-4" />{t("Submit for review", "إرسال للمراجعة")}
            </Button>
          </div>
        )}
      </div>

      <div className="mb-5">
        <h1 className="font-heading text-[26px] font-bold leading-tight tracking-tight">
          {editing ? t("Edit offer", "تعديل العرض") : t("New offer", "عرض جديد")}
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {readOnly
            ? t("This offer is with ALTANFEETHI or already published, so it is read-only. Withdraw it to make changes.",
                "هذا العرض لدى التنفيذي أو منشور بالفعل، لذا للقراءة فقط. اسحبه لتعديله.")
            : t("Say what the saving is, who may use it and how it is claimed. Arabic falls back to English where left empty.",
                "وضّح قيمة الخصم ومن يستفيد وكيفية المطالبة. تُستخدم الإنجليزية عند ترك العربية فارغة.")}
        </p>
      </div>

      <Card className="p-5">
        <div className="space-y-5">
          <div>
            {label(t("Partner", "الشريك"))}
            {editing || readOnly ? (
              <Input value={partner ? (isAr ? partner.nameAr : partner.name) : ""} readOnly className="bg-muted/40 text-muted-foreground" />
            ) : (
              <PartnerPicker value={partnerId} onChange={setPartnerId} isAr={isAr} t={t}
                             onCreate={() => navigate("/config/partners/new")} />
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              {label(t("Category", "الفئة"))}
              <select
                value={category} disabled={readOnly} onChange={(e) => setCategory(e.target.value as PartnerCategory)}
                className="h-11 w-full rounded-lg border border-input bg-[var(--card-elevated)] px-3 text-sm outline-none focus:border-primary/60 disabled:opacity-60"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{isAr ? CATEGORY[c].ar : CATEGORY[c].en}</option>
                ))}
              </select>
            </div>
            <div>
              {label(t("Valid from", "سارٍ من"))}
              <Input
                type="datetime-local" value={validFromISO} disabled={readOnly}
                onChange={(e) => setValidFromISO(e.target.value)}
              />
              <p className="mt-1.5 text-[11.5px] text-muted-foreground">
                {t("Leave empty to start as soon as it is published.",
                   "اتركه فارغًا ليبدأ فور النشر.")}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              {label(t("Valid to", "سارٍ حتى"))}
              <Input
                type="datetime-local" value={validToISO} disabled={readOnly}
                onChange={(e) => setValidToISO(e.target.value)}
              />
            </div>
            <div>
              {label(t("Runs", "مدة السريان"))}
              <div className="flex h-11 items-center rounded-lg border border-border/60 bg-muted/30 px-3 text-[12.5px] text-muted-foreground">
                {validToISO
                  ? `${validFromISO ? prettyWhen(validFromISO, isAr) : t("On publishing", "عند النشر")} → ${prettyWhen(validToISO, isAr)}`
                  : t("Set an end date", "حدّد تاريخ الانتهاء")}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              {label(t("The saving", "قيمة الخصم"))}
              <Input value={discount} disabled={readOnly} onChange={(e) => setDiscount(e.target.value)} placeholder={t("30% off", "خصم ٣٠٪")} />
            </div>
            <div>
              {label(t("The saving in Arabic", "قيمة الخصم بالعربية"))}
              <Input value={discountAr} disabled={readOnly} onChange={(e) => setDiscountAr(e.target.value)} dir="rtl" />
            </div>
          </div>

          <div>
            {label(t("Headline", "العنوان"))}
            <Input value={headline} disabled={readOnly} onChange={(e) => setHeadline(e.target.value)}
                   placeholder={t("30% off all spa treatments", "خصم ٣٠٪ على جميع جلسات المنتجع")} />
          </div>
          <div>
            {label(t("Headline in Arabic", "العنوان بالعربية"))}
            <Input value={headlineAr} disabled={readOnly} onChange={(e) => setHeadlineAr(e.target.value)} dir="rtl" />
          </div>

          <div>
            {label(t("Summary", "الوصف"))}
            <Textarea rows={3} value={summary} disabled={readOnly} onChange={(e) => setSummary(e.target.value)}
                      placeholder={t("What is included, and anything staff should know before they go.",
                                     "ما الذي يشمله العرض، وما يجدر بالموظف معرفته قبل الزيارة.")} />
          </div>
          <div>
            {label(t("Summary in Arabic", "الوصف بالعربية"))}
            <Textarea rows={3} value={summaryAr} disabled={readOnly} onChange={(e) => setSummaryAr(e.target.value)} dir="rtl" />
          </div>

          <div>
            {label(t("Who may use it", "من يمكنه الاستفادة"))}
            <div className="flex flex-wrap gap-2">
              {WHO_IDS.map((w) => {
                const on = w === "employee" || eligible.includes(w)
                return (
                  <button
                    key={w} type="button" disabled={readOnly || w === "employee"} onClick={() => toggleWho(w)}
                    className={cn("rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                      on ? "border-primary/40 bg-primary/10 text-primary" : "border-border/70 text-muted-foreground hover:bg-muted/50",
                      w === "employee" && "opacity-70")}
                  >
                    {isAr ? WHO[w].ar : WHO[w].en}
                  </button>
                )
              })}
            </div>
            <p className="mt-1.5 text-[11.5px] text-muted-foreground">
              {t("The employee is always included. Family members must be verified by HR before they can be named on a voucher.",
                 "الموظف مشمول دائمًا. يجب أن تعتمد الموارد البشرية أفراد العائلة قبل إصدار قسيمة بأسمائهم.")}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              {label(t("Family members per visit", "عدد أفراد العائلة لكل زيارة"))}
              <Input type="number" min="0" value={guestLimit} disabled={readOnly}
                     onChange={(e) => setGuestLimit(e.target.value)} placeholder={t("Leave empty for no cap", "اتركه فارغًا بلا حد")} />
            </div>
            <div>
              {label(t("How it is claimed", "طريقة المطالبة"))}
              <select
                value={redeem} disabled={readOnly} onChange={(e) => setRedeem(e.target.value as RedeemMethod)}
                className="h-11 w-full rounded-lg border border-input bg-[var(--card-elevated)] px-3 text-sm outline-none focus:border-primary/60 disabled:opacity-60"
              >
                {(Object.keys(REDEEM) as RedeemMethod[]).map((r) => (
                  <option key={r} value={r}>{isAr ? REDEEM[r].ar : REDEEM[r].en}</option>
                ))}
              </select>
              <p className="mt-1.5 text-[11.5px] text-muted-foreground">
                {isAr ? REDEEM[redeem].hintAr : REDEEM[redeem].hint}
              </p>
            </div>
          </div>

          {redeem === "voucher" && (
            <div>
              {label(t("Vouchers available", "عدد القسائم المتاحة"))}
              <Input
                type="number" min="1" value={quota} disabled={readOnly}
                onChange={(e) => setQuota(e.target.value)}
                placeholder={t("Leave empty for no limit", "اتركه فارغًا بلا حد")}
              />
              <p className="mt-1.5 text-[11.5px] text-muted-foreground">
                {t("How many you will honour in total. The count goes down as staff take them, and only you see what is left.",
                   "كم قسيمة ستقبلونها إجمالًا. ينقص العدد مع كل إصدار، ولا يراه إلا أنتم.")}
              </p>
            </div>
          )}

          {redeem === "code" && (
            <div>
              {label(t("Discount code", "رمز الخصم"))}
              <Input value={code} disabled={readOnly} onChange={(e) => setCode(e.target.value)} placeholder="TNF-2026" dir="ltr" />
            </div>
          )}

          <div>
            {label(t("Branches where it applies", "الفروع المشمولة"))}
            {partner && partner.branches.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {partner.branches.map((b) => (
                  <button
                    key={b.id} type="button" disabled={readOnly} onClick={() => toggleBranch(b.id)}
                    className={cn("rounded-full border px-3 py-1.5 text-[12.5px] transition-colors",
                      branchIds.includes(b.id) ? "border-primary/40 bg-primary/10 text-primary" : "border-border/70 text-muted-foreground hover:bg-muted/50")}
                  >
                    {isAr ? b.nameAr : b.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[12.5px] text-muted-foreground">
                {t("This partner has no branches on file. Ask ALTANFEETHI to add them.",
                   "لا توجد فروع مسجّلة لهذا الشريك. اطلب من التنفيذي إضافتها.")}
              </p>
            )}
          </div>

          <div>
            {label(t("How to use it", "كيفية الاستخدام"))}
            {listField(howTo, setHowTo, t("One step per line", "خطوة واحدة في كل سطر"), t("Add a step", "إضافة خطوة"))}
          </div>

          {/* the picture staff see on the card and at the top of the offer */}
          <div>
            {label(t("Picture", "الصورة"))}
            {image ? (
              <div className="flex flex-wrap items-start gap-3">
                <img src={image} alt="" className="h-28 w-44 rounded-xl object-cover ring-1 ring-border/60" />
                {!readOnly && (
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => fileRef.current?.click()}>
                      <Upload className="size-3.5" />{t("Replace", "استبدال")}
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setImage("")}>
                      <X className="size-3.5" />{t("Remove", "إزالة")}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              !readOnly && (
                <Button variant="outline" className="gap-1.5" onClick={() => fileRef.current?.click()}>
                  <ImagePlus className="size-4" />{t("Upload a picture", "رفع صورة")}
                </Button>
              )
            )}
            <input
              ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => onFile(e.target.files?.[0])}
            />

            {!readOnly && (
              <>
                <p className="mt-3 text-[11.5px] text-muted-foreground">
                  {t("Or pick one from the portal's library.", "أو اختر صورة من مكتبة البوابة.")}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {IMAGE_LIBRARY.map((src) => (
                    <button
                      key={src} type="button" onClick={() => setImage(src)}
                      aria-label={src}
                      className={cn("overflow-hidden rounded-lg ring-1 transition-all",
                        image === src ? "ring-2 ring-primary" : "ring-border/60 hover:ring-primary/40")}
                    >
                      <img src={src} alt="" className="h-14 w-20 object-cover" />
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[11.5px] text-muted-foreground">
                  {t("Without a picture the card falls back to a painted tile in the category colour.",
                     "بدون صورة تظهر البطاقة بتدرج لون الفئة.")}
                </p>
              </>
            )}
          </div>

          <div>
            {label(t("Terms", "الشروط"))}
            {listField(terms, setTerms, t("One condition per line", "شرط واحد في كل سطر"), t("Add a term", "إضافة شرط"))}
          </div>

          {!readOnly && !canSave && (
            <p className="text-[12px] text-muted-foreground">
              {t("A partner, a headline, the saving and a valid-to date are needed before this can be saved.",
                 "يلزم اختيار الشريك وكتابة العنوان وقيمة الخصم وتاريخ الانتهاء قبل الحفظ.")}
            </p>
          )}
        </div>
      </Card>

      {readOnly && offer?.status === "submitted" && (
        <p className="mt-4 flex items-center gap-2 text-[12.5px] text-muted-foreground">
          <Check className="size-4 text-amber-500" />
          {t("With ALTANFEETHI for review.", "لدى التنفيذي للمراجعة.")}
        </p>
      )}
    </main>
  )
}
