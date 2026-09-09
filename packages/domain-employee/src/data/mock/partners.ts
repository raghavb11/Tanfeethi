import * as React from "react"

import { RELATION, verifiedDependants } from "./dependants"

/** Partner benefits — offers vendors extend to ALTANFEETHI staff, which the
 *  employee and, where the contract allows, their family can use. The portal
 *  shows the terms and issues the voucher; the vendor honours it at the branch.
 *  Demo fixtures; a real build reads the signed agreements from HR. */

export type PartnerCategory =
  | "wellness" | "health" | "fitness" | "dining" | "travel" | "retail" | "education"

export const CATEGORY: Record<PartnerCategory, { en: string; ar: string; chip: string }> = {
  wellness: { en: "Spa & wellness", ar: "المنتجعات والعافية", chip: "border-violet-500/35 bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  health: { en: "Health & clinics", ar: "الصحة والعيادات", chip: "border-emerald-500/35 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  fitness: { en: "Fitness", ar: "اللياقة", chip: "border-sky-500/35 bg-sky-500/10 text-sky-600 dark:text-sky-400" },
  dining: { en: "Dining", ar: "المطاعم", chip: "border-amber-500/35 bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  travel: { en: "Travel & hotels", ar: "السفر والفنادق", chip: "border-rose-500/35 bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  retail: { en: "Retail", ar: "التجزئة", chip: "border-border bg-muted/50 text-muted-foreground" },
  education: { en: "Education", ar: "التعليم", chip: "border-primary/35 bg-primary/10 text-primary" },
}

/** Who a vendor lets use the offer. The employee is always included. */
export type EligibleWho = "employee" | "spouse" | "children" | "parents"

export const WHO: Record<EligibleWho, { en: string; ar: string }> = {
  employee: { en: "Employee", ar: "الموظف" },
  spouse: { en: "Spouse", ar: "الزوج/الزوجة" },
  children: { en: "Children", ar: "الأبناء" },
  parents: { en: "Parents", ar: "الوالدان" },
}

/** How the vendor wants the benefit claimed at the counter. */
export type RedeemMethod = "card" | "code" | "voucher" | "booking"

export type Branch = {
  id: string
  name: string; nameAr: string
  city: string; cityAr: string
  phone: string
  hours: string; hoursAr: string
}

export type PartnerOffer = {
  id: string
  vendor: string; vendorAr: string
  category: PartnerCategory
  /** The headline saving, as it reads on the card. */
  discount: string; discountAr: string
  headline: string; headlineAr: string
  summary: string; summaryAr: string
  eligible: EligibleWho[]
  /** Cap on family members per visit, where the vendor sets one. */
  guestLimit?: number
  redeem: RedeemMethod
  /** For "code" offers — quoted at the counter or online. */
  code?: string
  howTo: string[]; howToAr: string[]
  branches: Branch[]
  validTo: string; validToISO: string
  terms: string[]; termsAr: string[]
  contact: { name: string; nameAr: string; phone: string; email: string }
  popular?: boolean
  isNew?: boolean
  /** Hero photo, from the portal's own library. Offers without one fall back
   *  to the painted tile for their category. */
  image?: string
}

/** The painted fallback — a category gradient, so a card without a photo still
 *  reads as designed rather than empty. */
export const CATEGORY_ART: Record<PartnerCategory, string> = {
  wellness: "from-violet-500/85 via-violet-600/70 to-fuchsia-500/60",
  health: "from-emerald-500/85 via-emerald-600/70 to-teal-500/60",
  fitness: "from-sky-500/85 via-sky-600/70 to-cyan-500/60",
  dining: "from-amber-500/85 via-orange-500/70 to-rose-400/60",
  travel: "from-rose-500/85 via-rose-600/70 to-orange-400/60",
  retail: "from-slate-500/85 via-slate-600/70 to-slate-400/60",
  education: "from-primary/85 via-primary/70 to-amber-400/60",
}

export const OFFERS: PartnerOffer[] = [
  {
    id: "p-spa-almasa", image: "images/cms/wellbeing.jpg",
    vendor: "Al Masa Spa & Wellness", vendorAr: "منتجع الماسة للعافية",
    category: "wellness",
    discount: "30% off", discountAr: "خصم ٣٠٪",
    headline: "30% off all spa and massage treatments",
    headlineAr: "خصم ٣٠٪ على جميع جلسات المنتجع والمساج",
    summary: "Body treatments, massage and hammam at the Riyadh and Jeddah branches, for you and your family. Ladies' and gentlemen's sections operate separately.",
    summaryAr: "علاجات الجسم والمساج والحمام في فرعي الرياض وجدة، لك ولعائلتك. قسم الرجال وقسم السيدات منفصلان.",
    eligible: ["employee", "spouse", "children", "parents"],
    guestLimit: 3,
    redeem: "voucher",
    howTo: [
      "Issue a voucher here for the person who will use it.",
      "Book by phone and quote the voucher reference.",
      "Show the voucher and your digital employee card at reception.",
    ],
    howToAr: [
      "أصدر قسيمة من هنا باسم من سيستخدمها.",
      "احجز هاتفيًا مع ذكر رقم القسيمة.",
      "أبرز القسيمة وبطاقتك الوظيفية الرقمية عند الاستقبال.",
    ],
    branches: [
      { id: "b1", name: "Riyadh · Al Olaya", nameAr: "الرياض · العليا", city: "Riyadh", cityAr: "الرياض", phone: "+966 11 456 7788", hours: "Sat–Thu 10:00–22:00", hoursAr: "السبت–الخميس ١٠:٠٠–٢٢:٠٠" },
      { id: "b2", name: "Riyadh · Hittin", nameAr: "الرياض · حطين", city: "Riyadh", cityAr: "الرياض", phone: "+966 11 456 7799", hours: "Daily 10:00–23:00", hoursAr: "يوميًا ١٠:٠٠–٢٣:٠٠" },
      { id: "b3", name: "Jeddah · Corniche", nameAr: "جدة · الكورنيش", city: "Jeddah", cityAr: "جدة", phone: "+966 12 661 2020", hours: "Daily 11:00–23:00", hoursAr: "يوميًا ١١:٠٠–٢٣:٠٠" },
    ],
    validTo: "31 Dec 2026", validToISO: "2026-12-31",
    terms: [
      "Not combined with other promotions or seasonal offers.",
      "One voucher per visit; the voucher covers the named person only.",
      "Bookings on Thursday and Friday evenings are subject to availability.",
      "Children under 12 are admitted to the family section only.",
    ],
    termsAr: [
      "لا يُجمع مع العروض الأخرى أو العروض الموسمية.",
      "قسيمة واحدة لكل زيارة، وتغطي الشخص المذكور فقط.",
      "الحجز مساء الخميس والجمعة حسب التوفر.",
      "الأطفال دون ١٢ عامًا في القسم العائلي فقط.",
    ],
    contact: { name: "Partnerships desk", nameAr: "مكتب الشراكات", phone: "+966 11 456 7700", email: "corporate@almasaspa.sa" },
    popular: true,
  },
  {
    id: "p-clinic-nahdi",
    vendor: "Al Nahdi Medical Clinics", vendorAr: "عيادات النهدي الطبية",
    category: "health",
    discount: "25% off", discountAr: "خصم ٢٥٪",
    headline: "25% off dental and dermatology, on top of insurance",
    headlineAr: "خصم ٢٥٪ على الأسنان والجلدية إضافة إلى التأمين",
    summary: "Applies to the portion you pay yourself after Bupa settles — dentistry, dermatology and routine check-ups.",
    summaryAr: "يُطبَّق على الجزء الذي تتحمله بعد تسوية بوبا — الأسنان والجلدية والفحوصات الدورية.",
    eligible: ["employee", "spouse", "children"],
    redeem: "card",
    howTo: [
      "Book normally through the clinic app or by phone.",
      "Show your digital employee card at the reception desk.",
      "The discount is applied to your share of the bill.",
    ],
    howToAr: [
      "احجز عبر تطبيق العيادة أو هاتفيًا كالمعتاد.",
      "أبرز بطاقتك الوظيفية الرقمية عند الاستقبال.",
      "يُطبَّق الخصم على حصتك من الفاتورة.",
    ],
    branches: [
      { id: "b1", name: "Riyadh · King Fahd Road", nameAr: "الرياض · طريق الملك فهد", city: "Riyadh", cityAr: "الرياض", phone: "+966 11 202 4141", hours: "Sat–Thu 08:00–22:00", hoursAr: "السبت–الخميس ٠٨:٠٠–٢٢:٠٠" },
      { id: "b2", name: "Dammam · Al Faisaliah", nameAr: "الدمام · الفيصلية", city: "Dammam", cityAr: "الدمام", phone: "+966 13 833 5050", hours: "Sat–Thu 08:00–21:00", hoursAr: "السبت–الخميس ٠٨:٠٠–٢١:٠٠" },
    ],
    validTo: "30 Jun 2027", validToISO: "2027-06-30",
    terms: [
      "Cosmetic procedures are excluded.",
      "The insurance co-payment is settled at the clinic, not by ALTANFEETHI.",
    ],
    termsAr: [
      "الإجراءات التجميلية غير مشمولة.",
      "تُسوَّى نسبة التحمل في العيادة وليس عبر التنفيذي.",
    ],
    contact: { name: "Corporate accounts", nameAr: "حسابات الشركات", phone: "+966 11 202 4100", email: "corporate@nahdiclinics.sa" },
  },
  {
    id: "p-fitness-time",
    vendor: "Fitness Time", vendorAr: "وقت اللياقة",
    category: "fitness",
    discount: "35% off", discountAr: "خصم ٣٥٪",
    headline: "35% off annual membership, family rate included",
    headlineAr: "خصم ٣٥٪ على العضوية السنوية مع سعر عائلي",
    summary: "Corporate rate on annual memberships at all mixed and ladies' branches, with the same rate for a spouse.",
    summaryAr: "سعر الشركات على العضويات السنوية في جميع الفروع المختلطة والنسائية، وبنفس السعر للزوج/الزوجة.",
    eligible: ["employee", "spouse"],
    redeem: "code",
    code: "TANF-FT-35",
    howTo: [
      "Quote the code at any branch, or enter it online at checkout.",
      "Bring your digital employee card for the first visit.",
      "A spouse membership is added at the same rate on the same contract.",
    ],
    howToAr: [
      "اذكر الرمز في أي فرع أو أدخله عند الدفع إلكترونيًا.",
      "أحضر بطاقتك الوظيفية الرقمية في الزيارة الأولى.",
      "تُضاف عضوية الزوج/الزوجة بنفس السعر على العقد نفسه.",
    ],
    branches: [
      { id: "b1", name: "Riyadh · 30+ branches", nameAr: "الرياض · أكثر من ٣٠ فرعًا", city: "Riyadh", cityAr: "الرياض", phone: "920000404", hours: "Daily 06:00–00:00", hoursAr: "يوميًا ٠٦:٠٠–٠٠:٠٠" },
      { id: "b2", name: "Jeddah · 18 branches", nameAr: "جدة · ١٨ فرعًا", city: "Jeddah", cityAr: "جدة", phone: "920000404", hours: "Daily 06:00–00:00", hoursAr: "يوميًا ٠٦:٠٠–٠٠:٠٠" },
    ],
    validTo: "31 Mar 2027", validToISO: "2027-03-31",
    terms: [
      "Annual memberships only; monthly plans are excluded.",
      "The membership is not transferable once issued.",
    ],
    termsAr: [
      "العضويات السنوية فقط، ولا تشمل الاشتراكات الشهرية.",
      "العضوية غير قابلة للتحويل بعد إصدارها.",
    ],
    contact: { name: "Corporate sales", nameAr: "مبيعات الشركات", phone: "920000404", email: "corporate@fitnesstime.com.sa" },
    popular: true,
  },
  {
    id: "p-hotel-rosewood", image: "images/cms/aviation.jpg",
    vendor: "Rosewood Riyadh", vendorAr: "روزوود الرياض",
    category: "travel",
    discount: "20% off", discountAr: "خصم ٢٠٪",
    headline: "20% off best available rate, and late checkout",
    headlineAr: "خصم ٢٠٪ على أفضل سعر متاح مع تأخير المغادرة",
    summary: "Leisure stays for you and your family, with checkout at 16:00 when the hotel is not full.",
    summaryAr: "إقامات ترفيهية لك ولعائلتك مع مغادرة حتى ٤ عصرًا عند توفر الغرف.",
    eligible: ["employee", "spouse", "children"],
    redeem: "booking",
    howTo: [
      "Book through the partner link, or call reservations and mention ALTANFEETHI.",
      "Present your digital employee card at check-in.",
    ],
    howToAr: [
      "احجز عبر رابط الشريك أو اتصل بالحجوزات مع ذكر التنفيذي.",
      "أبرز بطاقتك الوظيفية الرقمية عند تسجيل الوصول.",
    ],
    branches: [
      { id: "b1", name: "Riyadh · Diplomatic Quarter", nameAr: "الرياض · الحي الدبلوماسي", city: "Riyadh", cityAr: "الرياض", phone: "+966 11 494 1000", hours: "Reservations 24h", hoursAr: "الحجوزات ٢٤ ساعة" },
    ],
    validTo: "31 Dec 2026", validToISO: "2026-12-31",
    terms: [
      "Leisure stays only; business travel is booked through the travel desk.",
      "Blackout on national holidays and major events.",
    ],
    termsAr: [
      "الإقامات الترفيهية فقط، أما سفر العمل فعبر مكتب السفر.",
      "لا يسري في الأعياد والمناسبات الكبرى.",
    ],
    contact: { name: "Reservations", nameAr: "الحجوزات", phone: "+966 11 494 1000", email: "reservations.riyadh@rosewoodhotels.com" },
    isNew: true,
  },
  {
    id: "p-dining-najd", image: "images/cms/gathering.jpg",
    vendor: "Najd Village Restaurants", vendorAr: "مطاعم قرية نجد",
    category: "dining",
    discount: "15% off", discountAr: "خصم ١٥٪",
    headline: "15% off the family section, any branch",
    headlineAr: "خصم ١٥٪ في القسم العائلي بجميع الفروع",
    summary: "Dine-in only, family section, for the employee and anyone at the table.",
    summaryAr: "تناول داخل المطعم في القسم العائلي، للموظف ومن معه على الطاولة.",
    eligible: ["employee", "spouse", "children", "parents"],
    redeem: "card",
    howTo: [
      "Show your digital employee card when the bill is presented.",
    ],
    howToAr: [
      "أبرز بطاقتك الوظيفية الرقمية عند تقديم الفاتورة.",
    ],
    branches: [
      { id: "b1", name: "Riyadh · Takhassusi", nameAr: "الرياض · التخصصي", city: "Riyadh", cityAr: "الرياض", phone: "+966 11 419 0000", hours: "Daily 12:00–01:00", hoursAr: "يوميًا ١٢:٠٠–٠١:٠٠" },
      { id: "b2", name: "Riyadh · Airport Road", nameAr: "الرياض · طريق المطار", city: "Riyadh", cityAr: "الرياض", phone: "+966 11 220 8080", hours: "Daily 12:00–01:00", hoursAr: "يوميًا ١٢:٠٠–٠١:٠٠" },
    ],
    validTo: "31 Dec 2026", validToISO: "2026-12-31",
    terms: ["Dine-in only. Delivery and takeaway are excluded."],
    termsAr: ["داخل المطعم فقط، ولا يشمل التوصيل أو الطلبات الخارجية."],
    contact: { name: "Guest relations", nameAr: "علاقات الضيوف", phone: "+966 11 419 0000", email: "care@najdvillage.sa" },
  },
  {
    id: "p-education-britus", image: "images/cms/training.jpg",
    vendor: "Britus International School", vendorAr: "مدارس بريتس العالمية",
    category: "education",
    discount: "10% off", discountAr: "خصم ١٠٪",
    headline: "10% off tuition for a second child onwards",
    headlineAr: "خصم ١٠٪ على رسوم الطفل الثاني فما فوق",
    summary: "Applied to annual tuition when two or more children are enrolled, on top of the school's own sibling discount.",
    summaryAr: "يُطبَّق على الرسوم السنوية عند تسجيل طفلين فأكثر، إضافة إلى خصم الأشقاء لدى المدرسة.",
    eligible: ["children"],
    redeem: "voucher",
    howTo: [
      "Issue a voucher for each child before the registration appointment.",
      "The admissions office verifies it with HR before the fees are issued.",
    ],
    howToAr: [
      "أصدر قسيمة لكل طفل قبل موعد التسجيل.",
      "يتحقق مكتب القبول منها مع الموارد البشرية قبل إصدار الرسوم.",
    ],
    branches: [
      { id: "b1", name: "Riyadh · Al Yasmin campus", nameAr: "الرياض · مجمع الياسمين", city: "Riyadh", cityAr: "الرياض", phone: "+966 11 288 3000", hours: "Sun–Thu 07:30–15:30", hoursAr: "الأحد–الخميس ٠٧:٣٠–١٥:٣٠" },
    ],
    validTo: "31 Aug 2027", validToISO: "2027-08-31",
    terms: [
      "Applies to tuition only, not to transport, uniform or trips.",
      "Withdrawn if fees fall more than 60 days overdue.",
    ],
    termsAr: [
      "يشمل الرسوم الدراسية فقط دون النقل أو الزي أو الرحلات.",
      "يُسحب عند تأخر السداد أكثر من ٦٠ يومًا.",
    ],
    contact: { name: "Admissions", nameAr: "القبول والتسجيل", phone: "+966 11 288 3000", email: "admissions@britus.edu.sa" },
  },
]

export const getOffer = (id: string) => OFFERS.find((o) => o.id === id)

/** The people this employee can put on a voucher, for a given offer. */
export type Beneficiary = { id: string; name: string; nameAr: string; relation: string; relationAr: string; initials: string }

export const ME: Beneficiary = {
  id: "me", name: "Khalid Al-Saadi", nameAr: "خالد السعدي",
  relation: "You", relationAr: "أنت", initials: "KS",
}

/** Only verified family can be named on a voucher — a pending record has not
 *  been checked against its document yet. */
export function beneficiariesFor(offer: PartnerOffer): Beneficiary[] {
  const out: Beneficiary[] = []
  if (offer.eligible.includes("employee")) out.push(ME)
  verifiedDependants().forEach((d) => {
    const ok =
      (d.relation === "spouse" && offer.eligible.includes("spouse")) ||
      ((d.relation === "son" || d.relation === "daughter") && offer.eligible.includes("children")) ||
      ((d.relation === "father" || d.relation === "mother") && offer.eligible.includes("parents"))
    if (!ok) return
    out.push({
      id: d.id, name: d.name, nameAr: d.nameAr,
      relation: RELATION[d.relation].en, relationAr: RELATION[d.relation].ar,
      initials: d.initials,
    })
  })
  return out
}


// ── vouchers ─────────────────────────────────────────────────────────────────
export type Voucher = {
  id: string
  ref: string
  offerId: string
  /** Who it is issued to — the vendor checks the name at the counter. */
  forId: string
  forName: string; forNameAr: string
  issued: string; issuedAr: string
  expires: string; expiresAr: string
  used: boolean
}

let vouchers: Voucher[] = [
  {
    id: "v1", ref: "TNF-9F42", offerId: "p-spa-almasa",
    forId: "d1", forName: "Amal Al-Saadi", forNameAr: "أمل السعدي",
    issued: "2 days ago", issuedAr: "قبل يومين",
    expires: "22 Sep 2026", expiresAr: "٢٢ سبتمبر ٢٠٢٦", used: false,
  },
]

const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l) }

export const useVouchers = () => React.useSyncExternalStore(subscribe, () => vouchers)
export const vouchersFor = (offerId: string) => vouchers.filter((v) => v.offerId === offerId)

const REF_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
const newRef = () =>
  `TNF-${Array.from({ length: 4 }, () => REF_CHARS[Math.floor(Math.random() * REF_CHARS.length)]).join("")}`

/** Vouchers run for 30 days, which is what the agreements say. */
export function issueVoucher(offerId: string, who: Beneficiary): Voucher {
  const expiry = new Date()
  expiry.setDate(expiry.getDate() + 30)
  const v: Voucher = {
    id: `v-${Date.now().toString(36)}`,
    ref: newRef(),
    offerId,
    forId: who.id, forName: who.name, forNameAr: who.nameAr,
    issued: "Just now", issuedAr: "الآن",
    expires: expiry.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    expiresAr: expiry.toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" }),
    used: false,
  }
  vouchers = [v, ...vouchers]
  emit()
  return v
}
export function markVoucherUsed(id: string) {
  vouchers = vouchers.map((v) => (v.id === id ? { ...v, used: true } : v))
  emit()
}
export function cancelVoucher(id: string) {
  vouchers = vouchers.filter((v) => v.id !== id)
  emit()
}

// ── saved offers ─────────────────────────────────────────────────────────────
let saved: string[] = ["p-spa-almasa"]
export const useSavedOffers = () => React.useSyncExternalStore(subscribe, () => saved)
export function toggleSaved(id: string) {
  saved = saved.includes(id) ? saved.filter((x) => x !== id) : [...saved, id]
  emit()
}
