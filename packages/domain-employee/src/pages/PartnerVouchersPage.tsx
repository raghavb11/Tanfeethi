import * as React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Badge, Button, Card, Input } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import { ArrowLeft, Check, MapPin, ScanLine, Search, Ticket, UserRound } from "lucide-react"

import {
  type Branch, fmtWhen, getOffer, getPartner, markVoucherUsed, offersFor, useOffers,
  usePartners, useVouchers, type Voucher, voucherStatus, type VoucherStatus,
  VOUCHER_STATUS, vouchersForPartner,
} from "../data/mock/partners"

type Filter = "all" | VoucherStatus

/** The partner's side of vouchers: who claimed each one, for which family
 *  member, and whether it has been honoured. Marking a voucher used happens
 *  here, at the counter, and is confirmed before it is written. */
export default function PartnerVouchersPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  const partners = usePartners()
  useOffers()
  useVouchers()                                   // re-render as vouchers change

  const asId = params.get("as") ?? partners[0]?.id ?? ""
  const partner = getPartner(asId)
  const offerFilter = params.get("offer") ?? "all"
  const setParam = (k: string, v: string) => {
    const next = new URLSearchParams(params)
    if (v === "all" || !v) next.delete(k); else next.set(k, v)
    setParams(next, { replace: true })
  }

  const myOffers = partner ? offersFor(partner.id).filter((o) => o.redeem === "voucher") : []
  const all = partner ? vouchersForPartner(partner.id) : []

  const [status, setStatus] = React.useState<Filter>("all")
  const [query, setQuery] = React.useState("")
  const [marking, setMarking] = React.useState<string | null>(null)
  const [branchId, setBranchId] = React.useState("")

  // ── the numbers the partner tracks: claimed against used ──
  const counted = all.filter((v) => voucherStatus(v) !== "cancelled")
  const count = (s: VoucherStatus) => all.filter((v) => voucherStatus(v) === s).length
  const usedN = count("used")
  const rate = counted.length ? Math.round((usedN / counted.length) * 100) : 0

  const q = query.trim().toLowerCase()
  const shown = all.filter((v) => {
    if (offerFilter !== "all" && v.offerId !== offerFilter) return false
    if (status !== "all" && voucherStatus(v) !== status) return false
    if (!q) return true
    return v.ref.toLowerCase().includes(q) ||
      v.forName.toLowerCase().includes(q) || v.claimedByName.toLowerCase().includes(q) ||
      v.forNameAr.includes(query.trim()) || v.claimedByNameAr.includes(query.trim())
  })

  // a reference typed in full is a counter look-up, so bring that one forward
  const exact = q.length >= 8 ? all.find((v) => v.ref.toLowerCase() === q) : undefined

  const startMarking = (v: Voucher) => {
    const o = getOffer(v.offerId)
    setMarking(v.id)
    setBranchId(o?.branches[0]?.id ?? "")
  }
  const confirmUsed = (v: Voucher) => {
    const o = getOffer(v.offerId)
    const branch: Branch | undefined = o?.branches.find((b) => b.id === branchId)
    markVoucherUsed(v.id, branch)
    setMarking(null)
  }

  const row = (v: Voucher, highlight = false) => {
    const o = getOffer(v.offerId)
    const st = voucherStatus(v)
    return (
      <Card key={v.id} className={cn("p-4", highlight && "ring-2 ring-primary/40")}>
        <div className="flex flex-wrap items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[12.5px] font-bold tracking-wider text-primary">
                {v.ref}
              </span>
              <Badge variant="outline" className={cn("text-[10px]", VOUCHER_STATUS[st].chip)}>
                {isAr ? VOUCHER_STATUS[st].ar : VOUCHER_STATUS[st].en}
              </Badge>
              {o && <span className="min-w-0 truncate text-[12px] text-muted-foreground">{isAr ? o.headlineAr : o.headline}</span>}
            </div>

            {/* who it is for, and who claimed it */}
            <div className="mt-2 grid gap-x-6 gap-y-1 text-[12.5px] sm:grid-cols-2">
              <div className="flex items-center gap-1.5">
                <UserRound className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="text-muted-foreground">{t("For", "لـ")}</span>
                <span className="font-medium">{isAr ? v.forNameAr : v.forName}</span>
                {/* "You" is the employee's word; to the partner that person is the employee */}
                <span className="text-muted-foreground">
                  · {v.relation === "You" ? t("Employee", "الموظف") : isAr ? v.relationAr : v.relation}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Ticket className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="text-muted-foreground">{t("Claimed by", "طلبها")}</span>
                <span className="font-medium">{isAr ? v.claimedByNameAr : v.claimedByName}</span>
              </div>
            </div>

            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-muted-foreground">
              <span>{t(`Claimed ${fmtWhen(v.issuedISO)}`, `طُلبت ${fmtWhen(v.issuedISO, true)}`)}</span>
              {st === "used" && v.usedAtISO ? (
                <span className="text-emerald-600 dark:text-emerald-400">
                  {t(`Used ${fmtWhen(v.usedAtISO)}`, `استُخدمت ${fmtWhen(v.usedAtISO, true)}`)}
                  {v.usedBranch && <> · <MapPin className="inline size-3" /> {isAr ? v.usedBranchAr : v.usedBranch}</>}
                </span>
              ) : (
                <span>{t(`Expires ${v.expires}`, `تنتهي ${v.expiresAr}`)}</span>
              )}
            </div>
          </div>

          {st === "active" && marking !== v.id && (
            <Button size="sm" className="shrink-0 gap-1.5" onClick={() => startMarking(v)}>
              <Check className="size-3.5" />{t("Mark as used", "تعليمها كمستخدمة")}
            </Button>
          )}
        </div>

        {/* confirm at the counter: the name has been checked, and where */}
        {marking === v.id && (
          <div className="mt-3 rounded-xl border border-primary/30 bg-primary/[0.04] p-3">
            <p className="text-[13px] font-semibold">
              {t(`Mark ${v.ref} as used by ${v.forName}?`, `تعليم ${v.ref} كمستخدمة من ${v.forNameAr}؟`)}
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              {t("Check the name against their ID first. This cannot be undone, and the employee is told.",
                 "تحقق من الاسم مقابل الهوية أولًا. لا يمكن التراجع، وسيُبلغ الموظف.")}
            </p>
            {o && o.branches.length > 0 && (
              <div className="mt-3 max-w-xs">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("Used at", "مكان الاستخدام")}
                </label>
                <select
                  value={branchId} onChange={(e) => setBranchId(e.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-[var(--card-elevated)] px-3 text-sm outline-none focus:border-primary/60"
                >
                  {o.branches.map((b) => (
                    <option key={b.id} value={b.id}>{isAr ? b.nameAr : b.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="mt-3 flex flex-wrap justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setMarking(null)}>{t("Cancel", "إلغاء")}</Button>
              <Button size="sm" className="gap-1.5" onClick={() => confirmUsed(v)}>
                <Check className="size-3.5" />{t("Yes, mark as used", "نعم، سجّل الاستخدام")}
              </Button>
            </div>
          </div>
        )}
      </Card>
    )
  }

  const FILTERS: [Filter, string, number][] = [
    ["all", t("All", "الكل"), all.length],
    ["active", t("Not used yet", "لم تُستخدم"), count("active")],
    ["used", t("Used", "مستخدمة"), usedN],
    ["expired", t("Expired", "منتهية"), count("expired")],
    ["cancelled", t("Cancelled", "ملغاة"), count("cancelled")],
  ]

  return (
    <div className="mx-auto max-w-[1100px] space-y-6 px-4 py-7 md:px-8">
      <div className="space-y-1.5">
        <button
          onClick={() => navigate(`/partner?as=${asId}`)}
          className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className={cn("size-3.5", isAr && "rotate-180")} />{t("Back to your offers", "العودة إلى عروضك")}
        </button>
        <h1 className="text-[22px] font-bold tracking-tight md:text-[26px]">{t("Voucher tracking", "متابعة القسائم")}</h1>
        <p className="max-w-3xl text-[13px] text-muted-foreground">
          {partner
            ? t(`Every voucher ${partner.name} has issued: who claimed it, who it is for, and whether it has been used.`,
                `كل القسائم الصادرة لـ ${partner.nameAr}: من طلبها، ولمن، وهل استُخدمت.`)
            : ""}
        </p>
      </div>

      {/* claimed against used */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [t("Claimed", "مطلوبة"), counted.length, "text-foreground"],
          [t("Used", "مستخدمة"), usedN, "text-emerald-600 dark:text-emerald-400"],
          [t("Not used yet", "لم تُستخدم"), count("active"), "text-amber-600 dark:text-amber-400"],
          [t("Expired unused", "انتهت دون استخدام"), count("expired"), "text-muted-foreground"],
        ].map(([label, n, tone]) => (
          <Card key={String(label)} className="p-4">
            <div className={cn("text-[26px] font-bold tabular-nums", tone as string)}>{n as number}</div>
            <div className="text-[12px] text-muted-foreground">{label as string}</div>
          </Card>
        ))}
      </div>

      {/* usage by offer */}
      {myOffers.length > 0 && (
        <Card className="p-4">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-[13.5px] font-semibold">{t("Usage by offer", "الاستخدام حسب العرض")}</h2>
            <span className="text-[12px] text-muted-foreground">
              {t(`${rate}% of claimed vouchers used overall`, `استُخدم ${rate}٪ من القسائم المطلوبة`)}
            </span>
          </div>
          <div className="space-y-3">
            {myOffers.map((o) => {
              const vs = all.filter((v) => v.offerId === o.id && voucherStatus(v) !== "cancelled")
              const used = vs.filter((v) => v.used).length
              const pct = vs.length ? Math.round((used / vs.length) * 100) : 0
              return (
                <button
                  key={o.id} onClick={() => setParam("offer", o.id)}
                  className="block w-full text-start"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2 text-[12.5px]">
                    <span className="min-w-0 truncate font-medium">{isAr ? o.headlineAr : o.headline}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {t(`${used} used of ${vs.length} claimed`, `${used} مستخدمة من ${vs.length}`)}
                      {o.voucherQuota != null && t(` · allocation ${o.voucherQuota}`, ` · المخصص ${o.voucherQuota}`)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                  </div>
                </button>
              )
            })}
          </div>
        </Card>
      )}

      {/* look-up and filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[16rem] flex-1">
            <ScanLine className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder={t("Voucher reference, or a name", "رقم القسيمة، أو اسم")}
              className="ps-9" dir="ltr"
            />
          </div>
          {myOffers.length > 1 && (
            <select
              value={offerFilter} onChange={(e) => setParam("offer", e.target.value)}
              className="h-11 rounded-lg border border-input bg-[var(--card-elevated)] px-3 text-sm outline-none focus:border-primary/60"
            >
              <option value="all">{t("All offers", "كل العروض")}</option>
              {myOffers.map((o) => (
                <option key={o.id} value={o.id}>{isAr ? o.headlineAr : o.headline}</option>
              ))}
            </select>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(([id, label, n]) => (
            <button
              key={id} onClick={() => setStatus(id)}
              className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                status === id ? "border-primary/40 bg-primary/10 text-primary" : "border-border/70 text-muted-foreground hover:bg-muted/50")}
            >
              {label}<span className="rounded-full bg-muted px-1.5 text-[11px] tabular-nums text-muted-foreground">{n}</span>
            </button>
          ))}
          {offerFilter !== "all" && (
            <button onClick={() => setParam("offer", "all")} className="text-[12px] text-primary hover:underline">
              {t("Show all offers", "عرض كل العروض")}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {exact && row(exact, true)}
        {shown.filter((v) => v.id !== exact?.id).map((v) => row(v))}

        {shown.length === 0 && !exact && (
          <Card className="p-8 text-center text-[13px] text-muted-foreground">
            <Search className="mx-auto mb-2 size-5 text-muted-foreground/60" />
            {all.length === 0
              ? t("No vouchers have been issued for your offers yet.", "لم تُصدر أي قسائم لعروضك بعد.")
              : t("No voucher matches that.", "لا توجد قسيمة مطابقة.")}
          </Card>
        )}
      </div>
    </div>
  )
}
