import * as React from "react"
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { Input, Textarea } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import { ArrowLeft, Check, Eye, FileText, ImagePlus, Plus, Save, Send, Tag, Upload, Users, X } from "lucide-react"

import { PartnerPicker } from "../components/PartnerPicker"
import {
  addOffer, CATEGORY, type EligibleWho, getOffer, getPartner, IMAGE_LIBRARY,
  newOfferId, type PartnerCategory, prettyWhen, type RedeemMethod, updateOffer, WHO,
} from "../data/mock/partners"
import { FieldLabel, fieldClass, GoldButton, OutlineButton, Page, SectionCard } from "../components/wijha"

/** The shared inputs, at the design's 36px / radius 8 / page-fill chrome. */
const In = (p: React.ComponentProps<typeof Input>) => <Input {...p} className={cn("h-9 rounded-lg bg-background", p.className)} />
const TA = (p: React.ComponentProps<typeof Textarea>) => <Textarea {...p} className={cn("rounded-lg bg-background", p.className)} />

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
          <In
            value={line} disabled={readOnly}
            onChange={(e) => set(items.map((x, j) => (j === i ? e.target.value : x)))}
            placeholder={placeholder}
          />
          {!readOnly && (
            <button
              onClick={() => set(items.filter((_, j) => j !== i))} aria-label={t("Remove", "إزالة")}
              className="grid size-9 shrink-0 place-items-center rounded-lg text-icon hover:bg-error-fill hover:text-error"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      ))}
      {!readOnly && (
        <OutlineButton size="sm" onClick={() => set([...items, ""])}>
          <Plus className="size-3.5" />{addLabel}
        </OutlineButton>
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

  const label = (s: string, required = false) => <FieldLabel required={required}>{s}</FieldLabel>

  if (viewOnly && offer) {
    return <Navigate to={`/benefits/partners/${offer.id}?preview=1`} replace />
  }

  return (
    <Page className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => navigate(back)} className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground">
          <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />{t("Back to your offers", "العودة إلى عروضك")}
        </button>
        {!readOnly && (
          <div className="flex flex-wrap gap-2">
            <OutlineButton onClick={() => navigate(back)}>{t("Cancel", "إلغاء")}</OutlineButton>
            <OutlineButton disabled={!canSave} onClick={() => save("draft")}>
              <Save className="size-4" />{t("Save draft", "حفظ كمسودة")}
            </OutlineButton>
            <OutlineButton disabled={!canSave} onClick={() => save("draft", "preview")}>
              <Eye className="size-4" />{t("Save & preview", "حفظ ومعاينة")}
            </OutlineButton>
            <GoldButton disabled={!canSave} onClick={() => save("submitted")}>
              <Send className="size-4" />{t("Submit for review", "إرسال للمراجعة")}
            </GoldButton>
          </div>
        )}
      </div>

      <SectionCard icon={Tag} title={editing ? t("Edit offer", "تعديل العرض") : t("New offer", "عرض جديد")}>
        <p className="-mt-1 mb-5 text-[12.5px] text-muted-foreground">
          {readOnly
            ? t("This offer is with ALTANFEETHI or already published, so it is read-only. Withdraw it to make changes.",
                "هذا العرض لدى التنفيذي أو منشور بالفعل، لذا للقراءة فقط. اسحبه لتعديله.")
            : t("Say what the saving is, who may use it and how it is claimed. Arabic falls back to English where left empty.",
                "وضّح قيمة الخصم ومن يستفيد وكيفية المطالبة. تُستخدم الإنجليزية عند ترك العربية فارغة.")}
        </p>
        <div className="space-y-5">
          <div>
            {label(t("Partner", "الشريك"), !readOnly)}
            {editing || readOnly ? (
              <In value={partner ? (isAr ? partner.nameAr : partner.name) : ""} readOnly className="bg-secondary/50 text-muted-foreground" />
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
                className={cn(fieldClass, "disabled:opacity-60")}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{isAr ? CATEGORY[c].ar : CATEGORY[c].en}</option>
                ))}
              </select>
            </div>
            <div>
              {label(t("Valid from", "سارٍ من"))}
              <In
                type="datetime-local" value={validFromISO} disabled={readOnly}
                onChange={(e) => setValidFromISO(e.target.value)}
              />
              <p className="mt-1.5 text-[12px] text-muted-foreground">
                {t("Leave empty to start as soon as it is published.",
                   "اتركه فارغًا ليبدأ فور النشر.")}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              {label(t("Valid to", "سارٍ حتى"), !readOnly)}
              <In
                aria-required={!readOnly || undefined} type="datetime-local" value={validToISO} disabled={readOnly}
                onChange={(e) => setValidToISO(e.target.value)}
              />
            </div>
            <div>
              {label(t("Runs", "مدة السريان"))}
              <div className="flex h-9 items-center rounded-lg bg-secondary/50 px-3 text-[12.5px] text-muted-foreground">
                {validToISO
                  ? `${validFromISO ? prettyWhen(validFromISO, isAr) : t("On publishing", "عند النشر")} → ${prettyWhen(validToISO, isAr)}`
                  : t("Set an end date", "حدّد تاريخ الانتهاء")}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              {label(t("The saving", "قيمة الخصم"), !readOnly)}
              <In aria-required={!readOnly || undefined} value={discount} disabled={readOnly} onChange={(e) => setDiscount(e.target.value)} placeholder={t("30% off", "خصم 30٪")} />
            </div>
            <div>
              {label(t("The saving in Arabic", "قيمة الخصم بالعربية"))}
              <In value={discountAr} disabled={readOnly} onChange={(e) => setDiscountAr(e.target.value)} dir="rtl" />
            </div>
          </div>

          <div>
            {label(t("Headline", "العنوان"), !readOnly)}
            <In aria-required={!readOnly || undefined} value={headline} disabled={readOnly} onChange={(e) => setHeadline(e.target.value)}
                   placeholder={t("30% off all spa treatments", "خصم 30٪ على جميع جلسات المنتجع")} />
          </div>
          <div>
            {label(t("Headline in Arabic", "العنوان بالعربية"))}
            <In value={headlineAr} disabled={readOnly} onChange={(e) => setHeadlineAr(e.target.value)} dir="rtl" />
          </div>

          <div>
            {label(t("Summary", "الوصف"))}
            <TA rows={3} value={summary} disabled={readOnly} onChange={(e) => setSummary(e.target.value)}
                      placeholder={t("What is included, and anything staff should know before they go.",
                                     "ما الذي يشمله العرض، وما يجدر بالموظف معرفته قبل الزيارة.")} />
          </div>
          <div>
            {label(t("Summary in Arabic", "الوصف بالعربية"))}
            <TA rows={3} value={summaryAr} disabled={readOnly} onChange={(e) => setSummaryAr(e.target.value)} dir="rtl" />
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={Users} title={t("Who and how", "المستفيدون وطريقة المطالبة")}>
        <div className="space-y-5">
          <div>
            {label(t("Who may use it", "من يمكنه الاستفادة"))}
            <div className="flex flex-wrap gap-2">
              {WHO_IDS.map((w) => {
                const on = w === "employee" || eligible.includes(w)
                return (
                  <button
                    key={w} type="button" disabled={readOnly || w === "employee"} onClick={() => toggleWho(w)}
                    className={cn("h-8 rounded-full px-3 text-[12.5px] font-medium transition-colors",
                      on ? "bg-soft-accent text-primary" : "bg-secondary text-muted-foreground hover:text-foreground",
                      w === "employee" && "opacity-70")}
                  >
                    {isAr ? WHO[w].ar : WHO[w].en}
                  </button>
                )
              })}
            </div>
            <p className="mt-1.5 text-[12px] text-muted-foreground">
              {t("The employee is always included. Family members must be verified by HR before they can be named on a voucher.",
                 "الموظف مشمول دائمًا. يجب أن تعتمد الموارد البشرية أفراد العائلة قبل إصدار قسيمة بأسمائهم.")}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              {label(t("Family members per visit", "عدد أفراد العائلة لكل زيارة"))}
              <In type="number" min="0" value={guestLimit} disabled={readOnly}
                     onChange={(e) => setGuestLimit(e.target.value)} placeholder={t("Leave empty for no cap", "اتركه فارغًا بلا حد")} />
            </div>
            <div>
              {label(t("How it is claimed", "طريقة المطالبة"))}
              <select
                value={redeem} disabled={readOnly} onChange={(e) => setRedeem(e.target.value as RedeemMethod)}
                className={cn(fieldClass, "disabled:opacity-60")}
              >
                {(Object.keys(REDEEM) as RedeemMethod[]).map((r) => (
                  <option key={r} value={r}>{isAr ? REDEEM[r].ar : REDEEM[r].en}</option>
                ))}
              </select>
              <p className="mt-1.5 text-[12px] text-muted-foreground">
                {isAr ? REDEEM[redeem].hintAr : REDEEM[redeem].hint}
              </p>
            </div>
          </div>

          {redeem === "voucher" && (
            <div>
              {label(t("Vouchers available", "عدد القسائم المتاحة"))}
              <In
                type="number" min="1" value={quota} disabled={readOnly}
                onChange={(e) => setQuota(e.target.value)}
                placeholder={t("Leave empty for no limit", "اتركه فارغًا بلا حد")}
              />
              <p className="mt-1.5 text-[12px] text-muted-foreground">
                {t("How many you will honour in total. The count goes down as staff take them, and only you see what is left.",
                   "كم قسيمة ستقبلونها إجمالًا. ينقص العدد مع كل إصدار، ولا يراه إلا أنتم.")}
              </p>
            </div>
          )}

          {redeem === "code" && (
            <div>
              {label(t("Discount code", "رمز الخصم"))}
              <In value={code} disabled={readOnly} onChange={(e) => setCode(e.target.value)} placeholder="TNF-2026" dir="ltr" />
            </div>
          )}

          <div>
            {label(t("Branches where it applies", "الفروع المشمولة"))}
            {partner && partner.branches.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {partner.branches.map((b) => (
                  <button
                    key={b.id} type="button" disabled={readOnly} onClick={() => toggleBranch(b.id)}
                    className={cn("h-8 rounded-full px-3 text-[12.5px] transition-colors",
                      branchIds.includes(b.id) ? "bg-soft-accent text-primary" : "bg-secondary text-muted-foreground hover:text-foreground")}
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
        </div>
      </SectionCard>

      <SectionCard icon={FileText} title={t("Details", "التفاصيل")}>
        <div className="space-y-5">
          <div>
            {label(t("How to use it", "كيفية الاستخدام"))}
            {listField(howTo, setHowTo, t("One step per line", "خطوة واحدة في كل سطر"), t("Add a step", "إضافة خطوة"))}
          </div>

          {/* the picture staff see on the card and at the top of the offer */}
          <div>
            {label(t("Picture", "الصورة"))}
            {image ? (
              <div className="flex flex-wrap items-start gap-3">
                <img src={image} alt="" className="h-28 w-44 rounded-[10px] object-cover ring-1 ring-border" />
                {!readOnly && (
                  <div className="flex flex-col gap-2">
                    <OutlineButton size="sm" onClick={() => fileRef.current?.click()}>
                      <Upload className="size-3.5" />{t("Replace", "استبدال")}
                    </OutlineButton>
                    <OutlineButton size="sm" className="text-error" onClick={() => setImage("")}>
                      <X className="size-3.5" />{t("Remove", "إزالة")}
                    </OutlineButton>
                  </div>
                )}
              </div>
            ) : (
              !readOnly && (
                <GoldButton onClick={() => fileRef.current?.click()}>
                  <ImagePlus className="size-4" />{t("Upload a picture", "رفع صورة")}
                </GoldButton>
              )
            )}
            <input
              ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => onFile(e.target.files?.[0])}
            />

            {!readOnly && (
              <>
                <p className="mt-3 text-[12px] text-muted-foreground">
                  {t("Or pick one from the portal's library.", "أو اختر صورة من مكتبة البوابة.")}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {IMAGE_LIBRARY.map((src) => (
                    <button
                      key={src} type="button" onClick={() => setImage(src)}
                      aria-label={src}
                      className={cn("overflow-hidden rounded-lg ring-1 transition-all",
                        image === src ? "ring-2 ring-primary" : "ring-border hover:ring-primary/40")}
                    >
                      <img src={src} alt="" className="h-14 w-20 object-cover" />
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[12px] text-muted-foreground">
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
      </SectionCard>

      {readOnly && offer?.status === "submitted" && (
        <p className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
          <Check className="size-4 text-warning" />
          {t("With ALTANFEETHI for review.", "لدى التنفيذي للمراجعة.")}
        </p>
      )}
    </Page>
  )
}
