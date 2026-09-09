import * as React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Card, Input } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, CalendarClock, Dumbbell,
  GraduationCap, Handshake, Hotel, MapPin, Search, Sparkles, Stethoscope,
  Ticket, UtensilsCrossed, Users, ShoppingBag,
} from "lucide-react"

import {
  CATEGORY, CATEGORY_ART, type EligibleWho, OFFERS, type PartnerCategory,
  type PartnerOffer, toggleSaved, useSavedOffers, useVouchers, WHO,
} from "../data/mock/partners"

/** A face for each category, used on the painted tiles. */
const CAT_ICON: Record<PartnerCategory, typeof Sparkles> = {
  wellness: Sparkles, health: Stethoscope, fitness: Dumbbell,
  dining: UtensilsCrossed, travel: Hotel, retail: ShoppingBag, education: GraduationCap,
}

const CATS: ("all" | PartnerCategory)[] = [
  "all", "wellness", "health", "fitness", "dining", "travel", "education",
]
const WHOS: ("anyone" | EligibleWho)[] = ["anyone", "employee", "spouse", "children", "parents"]

/** Partner benefits — what vendors offer ALTANFEETHI staff and their families. */
export default function PartnerOffersPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  const saved = useSavedOffers()
  const vouchers = useVouchers().filter((v) => !v.used)

  const rawCat = params.get("cat")
  const cat = (CATS as string[]).includes(rawCat ?? "") ? (rawCat as typeof CATS[number]) : "all"
  const rawWho = params.get("who")
  const who = (WHOS as string[]).includes(rawWho ?? "") ? (rawWho as typeof WHOS[number]) : "anyone"
  const setFilter = (next: { cat?: string; who?: string }) => {
    const c = next.cat ?? cat, w = next.who ?? who
    const q: Record<string, string> = {}
    if (c !== "all") q.cat = c
    if (w !== "anyone") q.who = w
    setParams(q, { replace: true })
  }

  const [query, setQuery] = React.useState("")

  const visible = OFFERS.filter((o) => {
    if (cat !== "all" && o.category !== cat) return false
    if (who !== "anyone" && !o.eligible.includes(who)) return false
    const q = query.trim().toLowerCase()
    if (!q) return true
    return [o.vendor, o.vendorAr, o.headline, o.headlineAr, isAr ? CATEGORY[o.category].ar : CATEGORY[o.category].en]
      .some((f) => f.toLowerCase().includes(q))
  })

  const familyOffers = OFFERS.filter((o) => o.eligible.some((e) => e !== "employee")).length

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 px-4 py-7 md:px-8">
      <button
        onClick={() => navigate("/benefits")}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />{t("Back to benefits", "العودة إلى المزايا")}
      </button>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-primary">
          <Handshake className="size-5" />
          <span className="text-xs font-semibold uppercase tracking-[0.14em]">{t("Partner benefits", "مزايا الشركاء")}</span>
        </div>
        <h1 className="text-[22px] font-bold tracking-tight md:text-[26px]">
          {t("Offers from our partners", "عروض شركائنا")}
        </h1>
        <p className="max-w-3xl text-[13px] text-muted-foreground">
          {t(`${OFFERS.length} vendors extend a rate to ALTANFEETHI staff — ${familyOffers} of them cover your family too. Each offer says who can use it and how it is claimed.`,
             `${OFFERS.length} شركاء يقدمون أسعارًا خاصة لمنسوبي التنفيذي، منها ${familyOffers} تشمل عائلتك. يوضّح كل عرض من يمكنه الاستفادة وكيفية المطالبة.`)}
        </p>
      </div>

      {/* live vouchers, so they are not lost inside an offer page */}
      {vouchers.length > 0 && (
        <Card className="overflow-hidden p-0">
          <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
            <Ticket className="size-4 text-primary" />
            <span className="text-[13px] font-semibold">{t("Your active vouchers", "قسائمك النشطة")}</span>
            <span className="ms-auto rounded-full bg-muted px-2 text-[11px] tabular-nums text-muted-foreground">
              {vouchers.length}
            </span>
          </div>
          <div className="divide-y divide-border/40">
            {vouchers.map((v) => {
              const offer = OFFERS.find((o) => o.id === v.offerId)
              return (
                <button
                  key={v.id}
                  onClick={() => navigate(`/benefits/partners/${v.offerId}`)}
                  className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 text-start transition-colors hover:bg-muted/25"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold">
                      {offer ? (isAr ? offer.vendorAr : offer.vendor) : v.offerId}
                    </p>
                    <p className="text-[11.5px] text-muted-foreground">
                      {t(`For ${v.forName}`, `لـ ${v.forNameAr}`)} · {t(`Expires ${v.expires}`, `تنتهي ${v.expiresAr}`)}
                    </p>
                  </div>
                  <span className="rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-[12.5px] font-semibold text-primary">
                    {v.ref}
                  </span>
                </button>
              )
            })}
          </div>
        </Card>
      )}

      {/* filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {CATS.map((c) => (
              <button
                key={c} onClick={() => setFilter({ cat: c })} aria-pressed={c === cat}
                className={cn("rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                  c === cat ? "border-primary/40 bg-primary/12 text-primary"
                            : "border-border text-muted-foreground hover:bg-muted/40")}
              >
                {c === "all" ? t("All", "الكل") : (isAr ? CATEGORY[c].ar : CATEGORY[c].en)}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)}
                   placeholder={t("Search partners…", "ابحث في الشركاء…")} className="w-56 ps-9" />
          </div>
        </div>

        {/* the question Amani's team gets asked: can my family use it? */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Users className="size-3.5" />{t("Who is it for", "لمن العرض")}
          </span>
          {WHOS.map((w) => (
            <button
              key={w} onClick={() => setFilter({ who: w })} aria-pressed={w === who}
              className={cn("rounded-full border px-2.5 py-1 text-[12px] transition-colors",
                w === who ? "border-primary/40 bg-primary/12 font-medium text-primary"
                          : "border-border text-muted-foreground hover:bg-muted/40")}
            >
              {w === "anyone" ? t("Anyone", "الجميع") : (isAr ? WHO[w].ar : WHO[w].en)}
            </button>
          ))}
        </div>
      </div>

      {/* the offers */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((o) => (
          <OfferCard
            key={o.id} offer={o} isAr={isAr} t={t}
            saved={saved.includes(o.id)}
            onOpen={() => navigate(`/benefits/partners/${o.id}`)}
          />
        ))}
      </div>

      {visible.length === 0 && (
        <Card className="py-14 text-center">
          <Handshake className="mx-auto size-8 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">
            {t("No partner offer matches that.", "لا يوجد عرض مطابق.")}
          </p>
        </Card>
      )}

      <p className="text-[11.5px] text-muted-foreground/75">
        {t("Offers are agreed between ALTANFEETHI and the vendor. The vendor provides the service and handles any complaint about it; People & Culture handles the agreement.",
           "العروض متفق عليها بين التنفيذي والمورد. يقدّم المورد الخدمة ويعالج أي شكوى بشأنها، بينما تتولى الموظفون والثقافة الاتفاقية.")}
      </p>
    </div>
  )
}

function OfferCard({ offer, isAr, t, saved, onOpen }: {
  offer: PartnerOffer; isAr: boolean; t: (en: string, ar: string) => string
  saved: boolean; onOpen: () => void
}) {
  const cities = [...new Set(offer.branches.map((b) => (isAr ? b.cityAr : b.city)))]
  const CatIcon = CAT_ICON[offer.category]
  return (
    <Card
      role="button" tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === "Enter") onOpen() }}
      aria-label={isAr ? offer.vendorAr : offer.vendor}
      className="group cursor-pointer overflow-hidden p-0 outline-none transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-foreground/5 focus-visible:border-primary/40"
    >
      {/* hero */}
      <div className="relative h-36 overflow-hidden">
        {offer.image ? (
          <img
            src={offer.image} alt=""
            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          />
        ) : (
          <div className={cn("size-full bg-gradient-to-br", CATEGORY_ART[offer.category])}>
            <CatIcon className="absolute -bottom-4 -end-3 size-28 text-white/15" />
          </div>
        )}
        {/* scrim, so the type over it stays readable on any photo */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-foreground backdrop-blur">
              <CatIcon className="size-2.5" />
              {isAr ? CATEGORY[offer.category].ar : CATEGORY[offer.category].en}
            </span>
            {offer.isNew && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                {t("New", "جديد")}
              </span>
            )}
            {offer.popular && !offer.isNew && (
              <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-semibold text-amber-950">
                {t("Popular", "الأكثر طلبًا")}
              </span>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); toggleSaved(offer.id) }}
            aria-label={saved ? t("Remove from saved", "إزالة من المحفوظات") : t("Save", "حفظ")}
            className="grid size-8 shrink-0 place-items-center rounded-full bg-white/85 text-foreground/70 backdrop-blur transition-colors hover:bg-white hover:text-primary"
          >
            {saved ? <BookmarkCheck className="size-4 text-primary" /> : <Bookmark className="size-4" />}
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="text-[22px] font-bold leading-none text-white drop-shadow-sm">
            {isAr ? offer.discountAr : offer.discount}
          </p>
          <p className="mt-1 truncate text-[13.5px] font-semibold text-white/95">
            {isAr ? offer.vendorAr : offer.vendor}
          </p>
        </div>
      </div>

      <div className="p-4">
      <p className="text-[12.5px] leading-snug text-foreground/80">{isAr ? offer.headlineAr : offer.headline}</p>

      {/* who can use it — the whole point of the section */}
      <div className="mt-3 flex flex-wrap gap-1">
        {offer.eligible.map((e) => (
          <span key={e} className="rounded-full border border-border/60 bg-muted/25 px-2 py-0.5 text-[11px] text-muted-foreground">
            {isAr ? WHO[e].ar : WHO[e].en}
          </span>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground/75">
        <span className="inline-flex items-center gap-1"><MapPin className="size-3" />{cities.join(", ")}</span>
        <span className="inline-flex items-center gap-1"><CalendarClock className="size-3" />{t(`Until ${offer.validTo}`, `حتى ${offer.validTo}`)}</span>
      </div>

      <div className="mt-3 flex items-center justify-end">
        <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-primary">
          {t("See details", "التفاصيل")}
          <ArrowRight className={cn("size-3.5 transition-transform group-hover:translate-x-0.5", isAr && "rotate-180 group-hover:-translate-x-0.5")} />
        </span>
      </div>
      </div>
    </Card>
  )
}
