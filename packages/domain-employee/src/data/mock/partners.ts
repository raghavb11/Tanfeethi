import * as React from "react"
import { pushNotification } from "@reach/shared-mocks"

import { allDependants, RELATION, verifiedDependants } from "./dependants"

/** Partner benefits — offers vendors extend to ALTANFEETHI staff, which the
 *  employee and, where the contract allows, their family can use. The portal
 *  shows the terms and issues the voucher; the vendor honours it at the branch.
 *  Demo fixtures; a real build reads the signed agreements from HR. */

export type PartnerCategory =
  | "wellness" | "health" | "fitness" | "dining" | "travel" | "retail" | "education"

export const CATEGORY: Record<PartnerCategory, { en: string; ar: string; chip: string }> = {
  wellness: { en: "Spa & wellness", ar: "المنتجعات والعافية", chip: "border-transparent bg-[#a997c7]/20 text-[#a997c7]" },
  health: { en: "Health & clinics", ar: "الصحة والعيادات", chip: "border-transparent bg-success-fill text-success" },
  fitness: { en: "Fitness", ar: "اللياقة", chip: "border-transparent bg-info-fill text-info" },
  dining: { en: "Dining", ar: "المطاعم", chip: "border-transparent bg-warning-fill text-warning" },
  travel: { en: "Travel & hotels", ar: "السفر والفنادق", chip: "border-transparent bg-error-fill text-error" },
  retail: { en: "Retail", ar: "التجزئة", chip: "border-transparent bg-secondary text-muted-foreground" },
  education: { en: "Education", ar: "التعليم", chip: "border-transparent bg-soft-accent text-primary" },
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
  /** The line staff read. Built from the times below when they are given. */
  hours: string; hoursAr: string
  /** Opening and closing times, 24-hour. */
  opensAt?: string
  closesAt?: string
  /** Which days those times apply to, as a label. */
  days?: string; daysAr?: string
  /** Where it is. The pin comes from a Google Maps link the partner pastes;
   *  without one, directions fall back to searching the branch by name. */
  lat?: number
  lng?: number
  mapsUrl?: string
  address?: string
}

/** Times read the same in both languages — the design uses Western digits. */
const arTime = (t: string) => t

/** "Sun-Thu 09:00-17:00" from the parts, so the editor and the card agree. */
export function hoursLine(b: Pick<Branch, "opensAt" | "closesAt" | "days">, isAr = false) {
  if (!b.opensAt || !b.closesAt) return ""
  const span = isAr ? `${arTime(b.opensAt)}–${arTime(b.closesAt)}` : `${b.opensAt}–${b.closesAt}`
  return b.days ? `${b.days} ${span}` : span
}

/** A Google Maps link the partner pasted carries the pin in one of a few
 *  shapes. Pull the coordinates out of whichever one it is. */
export function coordsFromMapsUrl(url: string): { lat: number; lng: number } | null {
  const patterns = [
    /@(-?\d+\.\d+),(-?\d+\.\d+)/,            // /maps/@24.71,46.67,15z
    /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,        // place links
    /[?&](?:q|query|destination)=(-?\d+\.\d+),\s*(-?\d+\.\d+)/, // ?q=24.71,46.67
    /^\s*(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)\s*$/,   // pasted coordinates
  ]
  for (const re of patterns) {
    const m = url.match(re)
    if (m) {
      const lat = Number(m[1]), lng = Number(m[2])
      if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng }
    }
  }
  return null
}

/** Directions straight into Google Maps. With a pin it routes to the exact
 *  spot; without one it searches the branch by name, which still gets there. */
export function directionsUrl(b: Branch, vendor: string) {
  // branch names read "Riyadh · Al Olaya"; as a search that separator and a
  // repeated city only get in the way
  const branch = b.name.replace(/\s*·\s*/g, " ").trim()
  const city = branch.toLowerCase().includes(b.city.toLowerCase()) ? "" : b.city
  const destination = b.lat != null && b.lng != null
    ? `${b.lat},${b.lng}`
    : [vendor, branch, city].filter(Boolean).join(" ")
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
}

/** Photographs that ship with the portal, offered when a partner has none of
 *  their own. */
export const IMAGE_LIBRARY = [
  "images/cms/wellbeing.jpg", "images/cms/gathering.jpg", "images/cms/celebrate.jpg",
  "images/cms/office.jpg", "images/cms/teamwork.jpg", "images/cms/training.jpg",
  "images/cms/conference.jpg", "images/cms/aviation.jpg", "images/cms/ramadan.jpg",
  "images/cms/dashboard.jpg",
]

/** An offer runs between two moments. The ISO values carry a time when the
 *  partner set one ("2026-10-01T18:00"), and a bare date when they did not. */
export const prettyWhen = (iso: string, isAr = false) => {
  if (!iso) return ""
  const hasTime = iso.includes("T")
  const d = new Date(hasTime ? iso : `${iso}T00:00`)
  if (Number.isNaN(d.getTime())) return iso
  const date = d.toLocaleDateString(isAr ? "ar-EG-u-nu-latn" : "en-GB",
    { day: "numeric", month: "short", year: "numeric" })
  if (!hasTime) return date
  const time = d.toLocaleTimeString(isAr ? "ar-EG-u-nu-latn" : "en-GB",
    { hour: "2-digit", minute: "2-digit", hour12: false })
  return `${date}, ${time}`
}

/** True once the start moment has passed, or when no start was set. */
export const hasStarted = (o: Pick<PartnerOffer, "validFromISO">) => {
  if (!o.validFromISO) return true
  const d = new Date(o.validFromISO.includes("T") ? o.validFromISO : `${o.validFromISO}T00:00`)
  return Number.isNaN(d.getTime()) || d.getTime() <= Date.now()
}

/** Where a partner goes to find their branch and copy its link. */
export const mapsSearchUrl = (q: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`

/** Where an offer is in its life: the partner drafts it, submits it, and an
 *  administrator publishes it. Employees only ever see published offers. */
export type OfferStatus = "draft" | "submitted" | "published" | "returned"

export const OFFER_STATUS: Record<OfferStatus, { en: string; ar: string; chip: string }> = {
  draft:     { en: "Draft",     ar: "\u0645\u0633\u0648\u062f\u0629", chip: "border-transparent bg-secondary text-muted-foreground" },
  submitted: { en: "Submitted", ar: "\u0645\u064f\u0631\u0633\u0644 \u0644\u0644\u0645\u0631\u0627\u062c\u0639\u0629", chip: "border-transparent bg-warning-fill text-warning" },
  published: { en: "Published", ar: "\u0645\u0646\u0634\u0648\u0631", chip: "border-transparent bg-success-fill text-success" },
  returned:  { en: "Returned",  ar: "\u0645\u064f\u0639\u0627\u062f", chip: "border-transparent bg-error-fill text-error" },
}

export type PartnerOffer = {
  id: string
  /** The partner who owns it. The vendor name below is a snapshot for display. */
  partnerId?: string
  status?: OfferStatus
  /** Why an administrator sent it back, shown to the partner. */
  reviewNote?: string
  vendor: string; vendorAr: string
  category: PartnerCategory
  /** The headline saving, as it reads on the card. */
  discount: string; discountAr: string
  headline: string; headlineAr: string
  summary: string; summaryAr: string
  eligible: EligibleWho[]
  /** Cap on family members per visit, where the vendor sets one. */
  guestLimit?: number
  /** How many vouchers the partner will honour in total. Undefined = no cap.
   *  Only the partner sees what is left; staff never see a countdown. */
  voucherQuota?: number
  redeem: RedeemMethod
  /** For "code" offers — quoted at the counter or online. */
  code?: string
  howTo: string[]; howToAr: string[]
  branches: Branch[]
  /** When it opens. Empty means it is live as soon as it is published. */
  validFrom?: string; validFromISO?: string
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
  wellness: "from-[#a997c7]/85 via-[#a997c7]/60 to-[#a997c7]/30",
  health: "from-success/85 via-success/60 to-[#1aad70]/30",
  fitness: "from-info/85 via-info/60 to-info/30",
  dining: "from-warning/85 via-warning/60 to-primary/40",
  travel: "from-primary/85 via-error/55 to-error/30",
  retail: "from-secondary via-secondary/80 to-muted-foreground/30",
  education: "from-primary/85 via-primary/65 to-primary/35",
}

/** Seed only. The live list is `offers` below, which the portal mutates. */
const SEED_OFFERS: PartnerOffer[] = [
  {
    id: "p-spa-almasa", image: "images/cms/wellbeing.jpg",
    vendor: "Al Masa Spa & Wellness", vendorAr: "منتجع الماسة للعافية",
    category: "wellness",
    discount: "30% off", discountAr: "خصم 30٪",
    headline: "30% off all spa and massage treatments",
    headlineAr: "خصم 30٪ على جميع جلسات المنتجع والمساج",
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
      { id: "b1", name: "Riyadh · Al Olaya", nameAr: "الرياض · العليا", city: "Riyadh", cityAr: "الرياض", phone: "+966 11 456 7788", hours: "Sat–Thu 10:00–22:00", hoursAr: "السبت–الخميس 10:00–22:00" },
      { id: "b2", name: "Riyadh · Hittin", nameAr: "الرياض · حطين", city: "Riyadh", cityAr: "الرياض", phone: "+966 11 456 7799", hours: "Daily 10:00–23:00", hoursAr: "يوميًا 10:00–23:00" },
      { id: "b3", name: "Jeddah · Corniche", nameAr: "جدة · الكورنيش", city: "Jeddah", cityAr: "جدة", phone: "+966 12 661 2020", hours: "Daily 11:00–23:00", hoursAr: "يوميًا 11:00–23:00" },
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
      "الأطفال دون 12 عامًا في القسم العائلي فقط.",
    ],
    contact: { name: "Partnerships desk", nameAr: "مكتب الشراكات", phone: "+966 11 456 7700", email: "corporate@almasaspa.sa" },
    popular: true,
  },
  {
    id: "p-clinic-nahdi",
    vendor: "Al Nahdi Medical Clinics", vendorAr: "عيادات النهدي الطبية",
    category: "health",
    discount: "25% off", discountAr: "خصم 25٪",
    headline: "25% off dental and dermatology, on top of insurance",
    headlineAr: "خصم 25٪ على الأسنان والجلدية إضافة إلى التأمين",
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
      { id: "b1", name: "Riyadh · King Fahd Road", nameAr: "الرياض · طريق الملك فهد", city: "Riyadh", cityAr: "الرياض", phone: "+966 11 202 4141", hours: "Sat–Thu 08:00–22:00", hoursAr: "السبت–الخميس 08:00–22:00" },
      { id: "b2", name: "Dammam · Al Faisaliah", nameAr: "الدمام · الفيصلية", city: "Dammam", cityAr: "الدمام", phone: "+966 13 833 5050", hours: "Sat–Thu 08:00–21:00", hoursAr: "السبت–الخميس 08:00–21:00" },
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
    discount: "35% off", discountAr: "خصم 35٪",
    headline: "35% off annual membership, family rate included",
    headlineAr: "خصم 35٪ على العضوية السنوية مع سعر عائلي",
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
      { id: "b1", name: "Riyadh · 30+ branches", nameAr: "الرياض · أكثر من 30 فرعًا", city: "Riyadh", cityAr: "الرياض", phone: "920000404", hours: "Daily 06:00–00:00", hoursAr: "يوميًا 06:00–00:00" },
      { id: "b2", name: "Jeddah · 18 branches", nameAr: "جدة · 18 فرعًا", city: "Jeddah", cityAr: "جدة", phone: "920000404", hours: "Daily 06:00–00:00", hoursAr: "يوميًا 06:00–00:00" },
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
    discount: "20% off", discountAr: "خصم 20٪",
    headline: "20% off best available rate, and late checkout",
    headlineAr: "خصم 20٪ على أفضل سعر متاح مع تأخير المغادرة",
    summary: "Leisure stays for you and your family, with checkout at 16:00 when the hotel is not full.",
    summaryAr: "إقامات ترفيهية لك ولعائلتك مع مغادرة حتى 4 عصرًا عند توفر الغرف.",
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
      { id: "b1", name: "Riyadh · Diplomatic Quarter", nameAr: "الرياض · الحي الدبلوماسي", city: "Riyadh", cityAr: "الرياض", phone: "+966 11 494 1000", hours: "Reservations 24h", hoursAr: "الحجوزات 24 ساعة" },
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
    discount: "15% off", discountAr: "خصم 15٪",
    headline: "15% off the family section, any branch",
    headlineAr: "خصم 15٪ في القسم العائلي بجميع الفروع",
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
      { id: "b1", name: "Riyadh · Takhassusi", nameAr: "الرياض · التخصصي", city: "Riyadh", cityAr: "الرياض", phone: "+966 11 419 0000", hours: "Daily 12:00–01:00", hoursAr: "يوميًا 12:00–01:00" },
      { id: "b2", name: "Riyadh · Airport Road", nameAr: "الرياض · طريق المطار", city: "Riyadh", cityAr: "الرياض", phone: "+966 11 220 8080", hours: "Daily 12:00–01:00", hoursAr: "يوميًا 12:00–01:00" },
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
    discount: "10% off", discountAr: "خصم 10٪",
    headline: "10% off tuition for a second child onwards",
    headlineAr: "خصم 10٪ على رسوم الطفل الثاني فما فوق",
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
      { id: "b1", name: "Riyadh · Al Yasmin campus", nameAr: "الرياض · مجمع الياسمين", city: "Riyadh", cityAr: "الرياض", phone: "+966 11 288 3000", hours: "Sun–Thu 07:30–15:30", hoursAr: "الأحد–الخميس 07:30–15:30" },
    ],
    validTo: "31 Aug 2027", validToISO: "2027-08-31",
    terms: [
      "Applies to tuition only, not to transport, uniform or trips.",
      "Withdrawn if fees fall more than 60 days overdue.",
    ],
    termsAr: [
      "يشمل الرسوم الدراسية فقط دون النقل أو الزي أو الرحلات.",
      "يُسحب عند تأخر السداد أكثر من 60 يومًا.",
    ],
    contact: { name: "Admissions", nameAr: "القبول والتسجيل", phone: "+966 11 288 3000", email: "admissions@britus.edu.sa" },
  },
]


/** The people this employee can put on a voucher, for a given offer. */
export type Beneficiary = { id: string; name: string; nameAr: string; relation: string; relationAr: string; initials: string }

export const ME: Beneficiary = {
  id: "me", name: "Fawaz Al-Ghailan", nameAr: "فواز الغيلان",
  relation: "You", relationAr: "أنت", initials: "FA",
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


// ── partners ─────────────────────────────────────────────────────────────────
/** A vendor with a signed agreement. Offers point at one of these rather than
 *  repeating a typed vendor name, so branches and contacts are kept once. */
export type PartnerStatus = "active" | "suspended"

export const PARTNER_STATUS: Record<PartnerStatus, { en: string; ar: string; chip: string }> = {
  active:    { en: "Active",    ar: "نشِط",  chip: "border-transparent bg-success-fill text-success" },
  suspended: { en: "Suspended", ar: "موقوف", chip: "border-transparent bg-error-fill text-error" },
}

export type Partner = {
  id: string
  /** Shown on screen and quoted in correspondence — unique, never reused. */
  code: string
  name: string; nameAr: string
  category: PartnerCategory
  contact: { name: string; nameAr: string; phone: string; email: string }
  branches: Branch[]
  agreementTo: string; agreementToISO: string
  status: PartnerStatus
}

const pad = (n: number) => String(n).padStart(4, "0")

/** The six seeded offers came with a vendor, branches and a contact, so the
 *  partners are derived from them and the offers are pointed back. */
let partners: Partner[] = SEED_OFFERS.map((o, i) => ({
  id: `ptr-${i + 1}`,
  code: `PTR-${pad(i + 1)}`,
  name: o.vendor, nameAr: o.vendorAr,
  category: o.category,
  contact: o.contact,
  branches: o.branches,
  agreementTo: o.validTo, agreementToISO: o.validToISO,
  status: "active",
}))

let offers: PartnerOffer[] = SEED_OFFERS.map((o, i) => ({
  ...o, partnerId: `ptr-${i + 1}`, status: "published",
}))

const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l) }

export const usePartners = () => React.useSyncExternalStore(subscribe, () => partners)
export const getPartner = (id?: string) => partners.find((p) => p.id === id)
export const activePartners = () => partners.filter((p) => p.status === "active")

export const newPartnerId = () => `ptr-${Date.now().toString(36)}`
/** Codes count up and are never reused, so an old one always means one partner. */
export const nextPartnerCode = () =>
  `PTR-${pad(partners.reduce((m, p) => Math.max(m, Number(p.code.replace(/\D/g, "")) || 0), 0) + 1)}`

export function addPartner(p: Partner) {
  partners = [p, ...partners]
  log("partner", p.id, "created", `${p.code} · ${p.name}`)
  emit()
}
export function updatePartner(id: string, fields: Partial<Partner>) {
  partners = partners.map((p) => (p.id === id ? { ...p, ...fields } : p))
  const p = getPartner(id)
  if (p) {
    // the name is stamped onto every offer, so a rename has to follow through
    if (fields.name || fields.nameAr) {
      offers = offers.map((o) => (o.partnerId === id ? { ...o, vendor: p.name, vendorAr: p.nameAr } : o))
    }
    log("partner", id, "updated", `${p.code} · ${p.name}`)
  }
  emit()
}
export function setPartnerStatus(id: string, status: PartnerStatus) {
  partners = partners.map((p) => (p.id === id ? { ...p, status } : p))
  const p = getPartner(id)
  log("partner", id, status === "active" ? "reinstated" : "suspended", p ? `${p.code} · ${p.name}` : id)
  emit()
}

// ── offers ───────────────────────────────────────────────────────────────────
export const useOffers = () => React.useSyncExternalStore(subscribe, () => offers)
/** What employees see. Everything else is still being written or reviewed. */
export const publishedOffers = () => offers.filter((o) => o.status === "published")
export const offersFor = (partnerId: string) => offers.filter((o) => o.partnerId === partnerId)
export const offersAwaitingReview = () => offers.filter((o) => o.status === "submitted")
export const getOffer = (id: string) => offers.find((o) => o.id === id)

export const newOfferId = (vendor: string) =>
  `p-${vendor.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 18)}-${Date.now().toString(36).slice(-4)}`

export function addOffer(o: PartnerOffer) {
  offers = [o, ...offers]
  log("offer", o.id, o.status === "submitted" ? "submitted" : "created", o.headline)
  emit()
}
export function updateOffer(id: string, fields: Partial<PartnerOffer>) {
  offers = offers.map((o) => (o.id === id ? { ...o, ...fields } : o))
  const o = getOffer(id)
  if (o) log("offer", id, "updated", o.headline)
  emit()
}
/** The partner hands it over for review; the review note from any earlier
 *  return is cleared so it does not read as a standing objection. */
export function submitOffer(id: string) {
  offers = offers.map((o) => (o.id === id ? { ...o, status: "submitted", reviewNote: undefined } : o))
  const o = getOffer(id)
  if (o) log("offer", id, "submitted", o.headline)
  emit()
}
export function publishOffer(id: string) {
  offers = offers.map((o) => (o.id === id ? { ...o, status: "published", reviewNote: undefined } : o))
  const o = getOffer(id)
  if (o) log("offer", id, "published", o.headline)
  emit()
}
export function returnOffer(id: string, note: string) {
  offers = offers.map((o) => (o.id === id ? { ...o, status: "returned", reviewNote: note } : o))
  const o = getOffer(id)
  if (o) log("offer", id, "returned", `${o.headline} — ${note}`)
  emit()
}
export function withdrawOffer(id: string) {
  offers = offers.map((o) => (o.id === id ? { ...o, status: "draft" } : o))
  const o = getOffer(id)
  if (o) log("offer", id, "withdrawn", o.headline)
  emit()
}

// ── audit trail ──────────────────────────────────────────────────────────────
/** Every change to a partner or an offer is written down. Agreements and
 *  discounts are money, so who changed what has to be answerable later. */
export type PartnerLogEntry = {
  id: string
  at: string
  entity: "partner" | "offer"
  entityId: string
  action: string
  detail: string
}

let partnerLog: PartnerLogEntry[] = []
export const usePartnerLog = () => React.useSyncExternalStore(subscribe, () => partnerLog)
export const logFor = (entityId: string) => partnerLog.filter((e) => e.entityId === entityId)

function log(entity: PartnerLogEntry["entity"], entityId: string, action: string, detail: string) {
  partnerLog = [{
    id: `log-${Date.now().toString(36)}-${partnerLog.length}`,
    at: new Date().toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
    entity, entityId, action, detail,
  }, ...partnerLog]
}


// ── vouchers ─────────────────────────────────────────────────────────────────
export type Voucher = {
  id: string
  ref: string
  offerId: string
  /** The employee who claimed it — the account it was issued from. */
  claimedById: string
  claimedByName: string; claimedByNameAr: string
  /** Who it is issued to — the vendor checks the name at the counter. */
  forId: string
  forName: string; forNameAr: string
  /** How that person relates to the employee: You, Spouse, Son… */
  relation: string; relationAr: string
  issued: string; issuedAr: string
  issuedISO: string
  expires: string; expiresAr: string
  expiresISO: string
  used: boolean
  /** Set by the partner at the counter, never by the employee. */
  usedAtISO?: string
  usedBranch?: string; usedBranchAr?: string
  /** Cancelled vouchers are kept, not deleted, so the partner's history stays whole. */
  cancelled?: boolean
}

export type VoucherStatus = "active" | "used" | "expired" | "cancelled"

export const VOUCHER_STATUS: Record<VoucherStatus, { en: string; ar: string; chip: string }> = {
  active:    { en: "Not used yet", ar: "لم تُستخدم", chip: "border-transparent bg-warning-fill text-warning" },
  used:      { en: "Used",         ar: "مستخدمة", chip: "border-transparent bg-success-fill text-success" },
  expired:   { en: "Expired",      ar: "منتهية", chip: "border-transparent bg-secondary text-muted-foreground" },
  cancelled: { en: "Cancelled",    ar: "ملغاة", chip: "border-transparent bg-error-fill text-error" },
}

export function voucherStatus(v: Voucher, now = Date.now()): VoucherStatus {
  if (v.cancelled) return "cancelled"
  if (v.used) return "used"
  return new Date(v.expiresISO).getTime() < now ? "expired" : "active"
}

const fmt = (d: Date, isAr = false) =>
  d.toLocaleDateString(isAr ? "ar-EG-u-nu-latn" : "en-GB", { day: "numeric", month: "short", year: "numeric" })
export const fmtWhen = (iso: string, isAr = false) => {
  const d = new Date(iso)
  return `${fmt(d, isAr)}, ${d.toLocaleTimeString(isAr ? "ar-EG-u-nu-latn" : "en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })}`
}

/** A demo history spread across employees and families, dated relative to
 *  today so the statuses stay sensible whenever the prototype is opened. */
function seedVoucher(v: {
  id: string; ref: string; offerId: string
  by: [string, string, string]; forP: [string, string, string]; rel: [string, string]
  daysAgo: number; usedDaysAgo?: number; branch?: [string, string]; cancelled?: boolean
}): Voucher {
  const issued = new Date(); issued.setDate(issued.getDate() - v.daysAgo); issued.setHours(10 + (v.daysAgo % 7), 15, 0, 0)
  const expires = new Date(issued); expires.setDate(expires.getDate() + 30)
  const used = v.usedDaysAgo != null ? new Date() : undefined
  if (used) { used.setDate(used.getDate() - v.usedDaysAgo!); used.setHours(17, 40, 0, 0) }
  return {
    id: v.id, ref: v.ref, offerId: v.offerId,
    claimedById: v.by[0], claimedByName: v.by[1], claimedByNameAr: v.by[2],
    forId: v.forP[0], forName: v.forP[1], forNameAr: v.forP[2],
    relation: v.rel[0], relationAr: v.rel[1],
    issued: fmt(issued), issuedAr: fmt(issued, true), issuedISO: issued.toISOString(),
    expires: fmt(expires), expiresAr: fmt(expires, true), expiresISO: expires.toISOString(),
    used: !!used, usedAtISO: used?.toISOString(),
    usedBranch: v.branch?.[0], usedBranchAr: v.branch?.[1],
    cancelled: v.cancelled,
  }
}

const FAWAZ: [string, string, string] = ["me", "Fawaz Al-Ghailan", "فواز الغيلان"]
/** A dependant on the signed-in employee's record, named as the HR record names them. */
const DEP = (id: string, fallback: [string, string]): [string, string, string] => {
  const d = allDependants().find((x) => x.id === id)
  return [id, d?.name ?? fallback[0], d?.nameAr ?? fallback[1]]
}
const NOURA: [string, string, string] = ["e-noura", "Noura Al-Qahtani", "نورة القحطاني"]
const SAUD: [string, string, string] = ["e-saud", "Saud Al-Dosari", "سعود الدوسري"]
const FAHAD: [string, string, string] = ["e-fahad", "Fahad Al-Harbi", "فهد الحربي"]
const SELF: [string, string] = ["You", "أنت"]
const SPOUSE: [string, string] = ["Spouse", "الزوج/الزوجة"]
const OLAYA: [string, string] = ["Riyadh · Al Olaya", "الرياض · العليا"]
const HITTIN: [string, string] = ["Riyadh · Hittin", "الرياض · حطين"]

let vouchers: Voucher[] = [
  seedVoucher({ id: "v1", ref: "TNF-9F42", offerId: "p-spa-almasa", by: FAWAZ,
    forP: DEP("d1", ["Amal Al-Ghailan", "أمل الغيلان"]), rel: SPOUSE, daysAgo: 2 }),
  seedVoucher({ id: "v2", ref: "TNF-K7PM", offerId: "p-spa-almasa", by: NOURA,
    forP: NOURA, rel: SELF, daysAgo: 12, usedDaysAgo: 9, branch: OLAYA }),
  seedVoucher({ id: "v3", ref: "TNF-3RQW", offerId: "p-spa-almasa", by: SAUD,
    forP: ["e-saud-w", "Hessa Al-Dosari", "حصة الدوسري"], rel: SPOUSE, daysAgo: 8, usedDaysAgo: 3, branch: HITTIN }),
  seedVoucher({ id: "v4", ref: "TNF-Z2DX", offerId: "p-spa-almasa", by: SAUD,
    forP: SAUD, rel: SELF, daysAgo: 6 }),
  seedVoucher({ id: "v5", ref: "TNF-8HNB", offerId: "p-spa-almasa", by: FAHAD,
    forP: ["e-fahad-m", "Latifa Al-Harbi", "لطيفة الحربي"], rel: ["Mother", "الأم"], daysAgo: 41 }),
  seedVoucher({ id: "v6", ref: "TNF-4LCT", offerId: "p-spa-almasa", by: FAHAD,
    forP: FAHAD, rel: SELF, daysAgo: 20, cancelled: true }),
  seedVoucher({ id: "v7", ref: "TNF-Q9VA", offerId: "p-education-britus", by: FAWAZ,
    forP: DEP("d2", ["Rakan Al-Ghailan", "راكان الغيلان"]), rel: ["Son", "الابن"], daysAgo: 15, usedDaysAgo: 11 }),
]

export const useVouchers = () => React.useSyncExternalStore(subscribe, () => vouchers)
export const vouchersFor = (offerId: string) => vouchers.filter((v) => v.offerId === offerId)

const REF_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
const newRef = () =>
  `TNF-${Array.from({ length: 4 }, () => REF_CHARS[Math.floor(Math.random() * REF_CHARS.length)]).join("")}`

/** How many have gone out, and how many the partner has left to honour. */
export const usedCount = (offerId: string) =>
  vouchers.filter((v) => v.offerId === offerId && v.used && !v.cancelled).length
export const issuedCount = (offerId: string) =>
  vouchers.filter((v) => v.offerId === offerId && !v.cancelled).length
export function vouchersLeft(o: PartnerOffer) {
  if (o.voucherQuota == null) return null          // no cap set
  return Math.max(0, o.voucherQuota - issuedCount(o.id))
}
/** False only when the partner's allocation is used up. */
export const canIssueVoucher = (o: PartnerOffer) => {
  const left = vouchersLeft(o)
  return left == null || left > 0
}

/** Vouchers run for 30 days, which is what the agreements say. */
export function issueVoucher(offerId: string, who: Beneficiary): Voucher {
  const expiry = new Date()
  expiry.setDate(expiry.getDate() + 30)
  const now = new Date()
  const v: Voucher = {
    id: `v-${Date.now().toString(36)}`,
    ref: newRef(),
    offerId,
    claimedById: ME.id, claimedByName: ME.name, claimedByNameAr: ME.nameAr,
    forId: who.id, forName: who.name, forNameAr: who.nameAr,
    relation: who.relation, relationAr: who.relationAr,
    issued: fmt(now), issuedAr: fmt(now, true), issuedISO: now.toISOString(),
    expires: fmt(expiry), expiresAr: fmt(expiry, true), expiresISO: expiry.toISOString(),
    used: false,
  }
  vouchers = [v, ...vouchers]

  // both sides hear about it: the employee gets the reference, the partner
  // gets the name to expect and what is left of their allocation
  const offer = getOffer(offerId)
  if (offer) {
    pushNotification({
      title: `Voucher ${v.ref} issued — ${offer.vendor}`,
      titleAr: `صدرت القسيمة ${v.ref} — ${offer.vendorAr}`,
      body: `For ${who.name}. ${offer.headline}. Valid until ${v.expires}.`,
      bodyAr: `باسم ${who.nameAr}. ${offer.headlineAr}. صالحة حتى ${v.expiresAr}.`,
    })
    const left = vouchersLeft(offer)
    notifyPartner(offer.partnerId, offerId, {
      title: `Voucher ${v.ref} issued`,
      titleAr: `صدرت القسيمة ${v.ref}`,
      body: `${who.name} on "${offer.headline}". ${left == null ? "No allocation limit." : `${left} of ${offer.voucherQuota} left.`}`,
      bodyAr: `${who.nameAr} على "${offer.headlineAr}". ${left == null ? "لا يوجد حد للإصدار." : `متبقٍ ${left} من ${offer.voucherQuota}.`}`,
    })
  }

  emit()
  return v
}

// ── what the partner is told ─────────────────────────────────────────────────
/** The partner's own feed. Staff never see it, and it never carries more than
 *  the vendor needs: who to expect, and how much allocation is left. */
export type PartnerNotice = {
  id: string
  partnerId?: string
  offerId?: string
  title: string; titleAr: string
  body: string; bodyAr: string
  at: string
  unread: boolean
}

let notices: PartnerNotice[] = []
export const usePartnerNotices = () => React.useSyncExternalStore(subscribe, () => notices)
export const noticesFor = (partnerId: string) => notices.filter((n) => n.partnerId === partnerId)

function notifyPartner(partnerId: string | undefined, offerId: string, n: {
  title: string; titleAr: string; body: string; bodyAr: string
}) {
  notices = [{
    id: `pn-${Date.now().toString(36)}-${notices.length}`,
    partnerId, offerId,
    ...n,
    at: new Date().toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
    unread: true,
  }, ...notices]
}

export function markNoticesRead(partnerId: string) {
  notices = notices.map((n) => (n.partnerId === partnerId ? { ...n, unread: false } : n))
  emit()
}
/** The partner confirms the voucher was honoured, and where. The employee is
 *  told, and the change goes on the partner audit trail. */
export function markVoucherUsed(id: string, branch?: Branch) {
  const now = new Date()
  vouchers = vouchers.map((v) => (v.id === id
    ? { ...v, used: true, usedAtISO: now.toISOString(), usedBranch: branch?.name, usedBranchAr: branch?.nameAr }
    : v))
  const v = vouchers.find((x) => x.id === id)
  const offer = v ? getOffer(v.offerId) : undefined
  if (v && offer) {
    const where = branch ? ` at ${branch.name}` : ""
    const whereAr = branch ? ` في ${branch.nameAr}` : ""
    pushNotification({
      title: `Voucher ${v.ref} used — ${offer.vendor}`,
      titleAr: `استُخدمت القسيمة ${v.ref} — ${offer.vendorAr}`,
      body: `${v.forName} used it${where}. Thank you for using partner benefits.`,
      bodyAr: `استخدمها ${v.forNameAr}${whereAr}.`,
    })
    log("offer", offer.id, "voucher used", `${v.ref} · ${v.forName}${where}`)
  }
  emit()
}
/** Soft cancel: the voucher stops being usable but stays in the history, and
 *  its place in the allocation is given back. */
export function cancelVoucher(id: string) {
  vouchers = vouchers.map((v) => (v.id === id ? { ...v, cancelled: true } : v))
  emit()
}

/** Everything the partner has issued, across all their offers, newest first. */
export const vouchersForPartner = (partnerId: string) => {
  const ids = new Set(offers.filter((o) => o.partnerId === partnerId).map((o) => o.id))
  return vouchers
    .filter((v) => ids.has(v.offerId))
    .sort((a, b) => b.issuedISO.localeCompare(a.issuedISO))
}

// ── saved offers ─────────────────────────────────────────────────────────────
let saved: string[] = ["p-spa-almasa"]
export const useSavedOffers = () => React.useSyncExternalStore(subscribe, () => saved)
export function toggleSaved(id: string) {
  saved = saved.includes(id) ? saved.filter((x) => x !== id) : [...saved, id]
  emit()
}
