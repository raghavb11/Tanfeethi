import * as React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Input } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, CalendarClock, Dumbbell,
  GraduationCap, Handshake, Hotel, MapPin, Search, Sparkles, Stethoscope,
  Ticket, UtensilsCrossed, Users, ShoppingBag,
} from "lucide-react"

import {
  CATEGORY, CATEGORY_ART, type EligibleWho, hasStarted, ME, type PartnerCategory, publishedOffers, useOffers,
  voucherStatus,
  type PartnerOffer, toggleSaved, useSavedOffers, useVouchers, WHO,
} from "../data/mock/partners"
import { Chip, Empty, Page, SectionCard } from "../components/wijha"

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
  const vouchers = useVouchers().filter((v) => v.claimedById === ME.id && voucherStatus(v) === "active")

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

  useOffers()                       // re-render when an offer is published
  const all = publishedOffers()
  const visible = all.filter((o) => {
    if (cat !== "all" && o.category !== cat) return false
    if (who !== "anyone" && !o.eligible.includes(who)) return false
    const q = query.trim().toLowerCase()
    if (!q) return true
    return [o.vendor, o.vendorAr, o.headline, o.headlineAr, isAr ? CATEGORY[o.category].ar : CATEGORY[o.category].en]
      .some((f) => f.toLowerCase().includes(q))
  })

  const familyOffers = all.filter((o) => o.eligible.some((e) => e !== "employee")).length

  return (
    <Page className="space-y-6">
      <button
        onClick={() => navigate("/benefits")}
        className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />{t("Back to benefits", "العودة إلى المزايا")}
      </button>

      <div className="highlight-card hl-green flex items-start gap-3 rounded-2xl p-5 sm:p-6">
        <Handshake className="mt-0.5 size-5 shrink-0 text-primary" />
        <p className="max-w-3xl text-[14px] text-muted-foreground">
          {t(`${all.length} vendors extend a rate to ALTANFEETHI staff — ${familyOffers} of them cover your family too. Each offer says who can use it and how it is claimed.`,
             `${all.length} شركاء يقدمون أسعارًا خاصة لمنسوبي التنفيذي، منها ${familyOffers} تشمل عائلتك. يوضّح كل عرض من يمكنه الاستفادة وكيفية المطالبة.`)}
        </p>
      </div>

      {/* live vouchers, so they are not lost inside an offer page */}
      {vouchers.length > 0 && (
        <SectionCard icon={Ticket} title={t("Your active vouchers", "قسائمك النشطة")} action={<Chip>{vouchers.length}</Chip>}>
          <div className="divide-y divide-border">
            {vouchers.map((v) => {
              const offer = all.find((o) => o.id === v.offerId)
              return (
                <button
                  key={v.id}
                  onClick={() => navigate(`/benefits/partners/${v.offerId}`)}
                  className="flex w-full flex-wrap items-center justify-between gap-3 py-3 text-start transition-colors hover:bg-soft-accent/40"
                >
                  <div className="min-w-0">
                    <p className="text-[14.5px]">
                      {offer ? (isAr ? offer.vendorAr : offer.vendor) : v.offerId}
                    </p>
                    <p className="text-[12.5px] text-muted-foreground">
                      {t(`For ${v.forName}`, `لـ ${v.forNameAr}`)} · {t(`Expires ${v.expires}`, `تنتهي ${v.expiresAr}`)}
                    </p>
                  </div>
                  <span dir="ltr" className="accent-chip rounded-md px-2.5 py-1 font-mono text-[12.5px] font-semibold">
                    {v.ref}
                  </span>
                </button>
              )
            })}
          </div>
        </SectionCard>
      )}

      {/* filters */}
      <div className="panel space-y-3 rounded-xl px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {CATS.map((c) => (
              <button
                key={c} onClick={() => setFilter({ cat: c })} aria-pressed={c === cat}
                className={cn("h-8 rounded-full px-3 text-[12.5px] font-medium transition-colors",
                  c === cat ? "bg-soft-accent text-primary"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground")}
              >
                {c === "all" ? t("All", "الكل") : (isAr ? CATEGORY[c].ar : CATEGORY[c].en)}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)}
                   placeholder={t("Search partners…", "ابحث في الشركاء…")} className="h-9 w-56 rounded-lg bg-background ps-9" />
          </div>
        </div>

        {/* the question Amani's team gets asked: can my family use it? */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
            <Users className="size-3.5" />{t("Who is it for", "لمن العرض")}
          </span>
          {WHOS.map((w) => (
            <button
              key={w} onClick={() => setFilter({ who: w })} aria-pressed={w === who}
              className={cn("h-7 rounded-full px-2.5 text-[12px] transition-colors",
                w === who ? "bg-soft-accent font-medium text-primary"
                          : "bg-secondary text-muted-foreground hover:text-foreground")}
            >
              {w === "anyone" ? t("Anyone", "الجميع") : (isAr ? WHO[w].ar : WHO[w].en)}
            </button>
          ))}
        </div>
      </div>

      {/* the offers */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((o) => (
          <OfferCard
            key={o.id} offer={o} isAr={isAr} t={t}
            saved={saved.includes(o.id)}
            onOpen={() => navigate(`/benefits/partners/${o.id}`)}
          />
        ))}
      </div>

      {visible.length === 0 && (
        <div className="panel rounded-xl">
          <Empty icon={Handshake} title={t("No partner offer matches that.", "لا يوجد عرض مطابق.")} />
        </div>
      )}

      <p className="text-[12px] text-muted-foreground">
        {t("Offers are agreed between ALTANFEETHI and the vendor. The vendor provides the service and handles any complaint about it; People & Culture handles the agreement.",
           "العروض متفق عليها بين التنفيذي والمورد. يقدّم المورد الخدمة ويعالج أي شكوى بشأنها، بينما تتولى الموظفون والثقافة الاتفاقية.")}
      </p>
    </Page>
  )
}

function OfferCard({ offer, isAr, t, saved, onOpen }: {
  offer: PartnerOffer; isAr: boolean; t: (en: string, ar: string) => string
  saved: boolean; onOpen: () => void
}) {
  const cities = [...new Set(offer.branches.map((b) => (isAr ? b.cityAr : b.city)))]
  const CatIcon = CAT_ICON[offer.category]
  return (
    <div
      role="button" tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === "Enter") onOpen() }}
      aria-label={isAr ? offer.vendorAr : offer.vendor}
      className="panel group cursor-pointer overflow-hidden rounded-xl outline-none transition-all hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-ring"
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
            <CatIcon className="absolute -bottom-4 -end-3 size-28 text-foreground/15" />
          </div>
        )}
        {/* scrim, so the type over it stays readable on any photo */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-md bg-background/85 px-2 py-0.5 text-[11px] font-medium text-foreground backdrop-blur">
              <CatIcon className="size-3" />
              {isAr ? CATEGORY[offer.category].ar : CATEGORY[offer.category].en}
            </span>
            {offer.isNew && (
              <span className="rounded-md bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground">
                {t("New", "جديد")}
              </span>
            )}
            {offer.popular && !offer.isNew && (
              <span className="rounded-md bg-warning px-2 py-0.5 text-[11px] font-medium text-primary-foreground">
                {t("Popular", "الأكثر طلبًا")}
              </span>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); toggleSaved(offer.id) }}
            aria-label={saved ? t("Remove from saved", "إزالة من المحفوظات") : t("Save", "حفظ")}
            className="grid size-8 shrink-0 place-items-center rounded-full bg-background/85 text-icon backdrop-blur transition-colors hover:bg-background hover:text-primary"
          >
            {saved ? <BookmarkCheck className="size-4 text-primary" /> : <Bookmark className="size-4" />}
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="text-[22px] font-medium leading-none text-primary drop-shadow-sm">
            {isAr ? offer.discountAr : offer.discount}
          </p>
          <p className="mt-1 truncate text-[14.5px] font-medium text-white">
            {isAr ? offer.vendorAr : offer.vendor}
          </p>
        </div>
      </div>

      <div className="p-4">
      <p className="text-[14px] leading-snug text-foreground">{isAr ? offer.headlineAr : offer.headline}</p>

      {/* who can use it — the whole point of the section */}
      <div className="mt-3 flex flex-wrap gap-1">
        {offer.eligible.map((e) => (
          <Chip key={e} className="h-5 text-[11px]">{isAr ? WHO[e].ar : WHO[e].en}</Chip>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
        <span className="inline-flex items-center gap-1"><MapPin className="size-3" />{cities.join(", ")}</span>
        <span className="inline-flex items-center gap-1">
          <CalendarClock className="size-3" />
          {hasStarted(offer)
            ? t(`Until ${offer.validTo}`, `حتى ${offer.validTo}`)
            : t(`From ${offer.validFrom}`, `من ${offer.validFrom}`)}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-end">
        <span className="inline-flex items-center gap-1 text-[13px] font-medium text-primary">
          {t("See details", "التفاصيل")}
          <ArrowRight className={cn("size-3.5 transition-transform group-hover:translate-x-0.5", isAr && "rotate-180 group-hover:-translate-x-0.5")} />
        </span>
      </div>
      </div>
    </div>
  )
}
