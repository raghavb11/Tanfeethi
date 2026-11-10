import * as React from "react"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useNavigate } from "react-router-dom"
import { useShell } from "@reach/shell-context"
import { Building2, ChevronLeft, ChevronRight, UsersRound, X } from "lucide-react"

import { chainTo, childrenOf, ME_ID, type OrgPerson, personById } from "../data/mock/org"
import { CardTitle, Initials } from "./wijha"

/** First letter of each of the first two words — "أحمد محمد" → "أم", "Ahmed Mohammed" → "AM". */
export const initialsOf = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase()

/** Deterministic presence for the demo (Figma shows green / amber / grey dots). */
export function presenceOf(id: string): "online" | "away" | "offline" {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return (["online", "online", "away", "offline"] as const)[h % 4]
}

/** Modal 3880:8852 — "الهيكل التنظيمي": the reporting chain up from the signed-in
 *  employee (scrollable), then the colleagues who share the same manager. */
export function OrgStructureDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const me = personById(ME_ID)!
  const chain = chainTo(ME_ID) // root → me
  const managerId = me.managerId
  const peers = managerId ? childrenOf(managerId).filter((p) => p.id !== ME_ID) : []
  const name = (p: OrgPerson) => (isAr ? p.nameAr : p.name)
  const ini = (p: OrgPerson) => (isAr ? initialsOf(p.nameAr) : p.initials)

  const navigate = useNavigate()
  const chainRef = React.useRef<HTMLDivElement>(null)
  const peersRef = React.useRef<HTMLDivElement>(null)
  // which peer arrows apply: the frame shows only "next" until the row has been scrolled
  const [peerScroll, setPeerScroll] = React.useState({ back: false, more: false })
  const measurePeers = React.useCallback(() => {
    const el = peersRef.current
    if (!el) return
    const at = Math.abs(el.scrollLeft)
    setPeerScroll({ back: at > 2, more: at + el.clientWidth < el.scrollWidth - 2 })
  }, [])

  // open scrolled to the bottom of the chain, where the signed-in employee sits
  React.useEffect(() => {
    if (!open) return
    const id = window.setTimeout(() => { chainRef.current?.scrollTo({ top: chainRef.current.scrollHeight }); measurePeers() }, 30)
    return () => window.clearTimeout(id)
  }, [open, measurePeers])

  const scrollPeers = (dir: 1 | -1) => {
    const el = peersRef.current
    if (!el) return
    // in RTL scrollLeft runs negative; scrolling "forward" means toward the inline end
    el.scrollBy({ left: (isAr ? -1 : 1) * dir * (el.clientWidth * 0.8), behavior: "smooth" })
  }
  const viewProfile = (p: OrgPerson) => { onOpenChange(false); navigate(`/org-chart?person=${p.id}`) }
  const ProfileLink = ({ p, className }: { p: OrgPerson; className?: string }) => (
    <button type="button" onClick={() => viewProfile(p)} className={cn("shrink-0 text-[13px] text-primary hover:underline", className)}>
      {t("View profile", "عرض الملف التعريفي")}
    </button>
  )

  // Figma 2394:3367 — 816 wide on Shape/Fill/Secondary; 72px header; the chain is a
  // centred 624px column of 89px cards (12px apart) on a centre line; 178px peer cards.
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        dir={isAr ? "rtl" : "ltr"}
        className="max-h-[92svh] grid-cols-[minmax(0,1fr)] gap-0 overflow-hidden rounded-[16px] bg-secondary p-0 sm:max-w-[816px]"
      >
        {/* header */}
        <div className="relative z-10 flex h-[72px] items-start justify-between gap-3 bg-secondary px-8 pt-6 shadow-[0_8px_16px_-12px_rgba(0,0,0,0.6)]">
          <DialogTitle className="sr-only">{t("Org chart", "الهيكل التنظيمي")}</DialogTitle>
          <CardTitle icon={Building2} title={t("Org chart", "الهيكل التنظيمي")} />
          <DialogClose className="-mt-1 -me-1 grid size-8 place-items-center rounded-lg text-foreground transition-colors hover:bg-background/40" aria-label={t("Close", "إغلاق")}>
            <X className="size-6" />
          </DialogClose>
        </div>

        {/* reporting chain */}
        <div ref={chainRef} className="max-h-[min(338px,40svh)] overflow-y-auto px-4 sm:px-24 [scrollbar-color:var(--muted-foreground)_var(--background)] [scrollbar-width:thin]">
          <ol className="relative space-y-3">
            <span aria-hidden className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-black/25" />
            {chain.map((p) => {
              const isMe = p.id === ME_ID
              const isManager = p.id === managerId
              return (
                <li key={p.id}
                  className={cn("relative flex h-[89px] items-center gap-3 rounded-[10px] ps-4 pe-8",
                    isMe ? "bg-[color-mix(in_srgb,var(--primary)_15%,var(--secondary))]" : "bg-background")}>
                  <Initials text={ini(p)} tone={isMe ? "accent" : "violet"} presence={presenceOf(p.id)} className="size-[38px] text-[12px]" />
                  <div className="min-w-0 flex-1">
                    {isMe ? (
                      <>
                        <div className="truncate text-[14px] font-semibold leading-5">{name(p)}</div>
                        <div className="mt-1 truncate text-[11.5px] text-muted-foreground">{isAr ? p.titleAr : p.title}</div>
                      </>
                    ) : (
                      <>
                        <div className="truncate text-[11.5px] text-muted-foreground">{isManager ? t("Manager", "المدير") : (isAr ? p.titleAr : p.title)}</div>
                        <div className="truncate text-[14px] font-semibold leading-5">{name(p)}</div>
                      </>
                    )}
                    <div className="mt-1 truncate text-[11.5px] text-muted-foreground" dir="ltr" style={{ textAlign: isAr ? "right" : "left" }}>{p.email}</div>
                  </div>
                  {!isMe && <ProfileLink p={p} />}
                </li>
              )
            })}
          </ol>
        </div>

        {/* works with */}
        <div className="px-4 pb-[25px] pt-[25px] sm:px-8">
          <div className="mb-4 flex items-center justify-center gap-1.5 text-[12px] text-muted-foreground">
            <UsersRound className="size-3.5 text-primary" />
            {isAr ? <span>يعمل <b className="font-semibold text-foreground">{me.nameAr}</b> مع</span> : <span><b className="font-semibold text-foreground">{me.name}</b> works with</span>}
          </div>
          {peers.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-muted-foreground">{t("No colleagues share this manager.", "لا يوجد زملاء يتبعون نفس المدير.")}</p>
          ) : (
            <div className="relative">
              <div ref={peersRef} onScroll={measurePeers} className="flex snap-x gap-[13px] overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {peers.map((p) => (
                  <div key={p.id} className="flex h-[202px] w-[178px] shrink-0 snap-start flex-col items-center rounded-[10px] bg-background px-3 pt-[17px] text-center">
                    <Initials text={ini(p)} tone="violet" presence={presenceOf(p.id)} className="size-14 text-[16px]" />
                    <div className="mt-3 w-full truncate text-[11.5px] text-muted-foreground">{isAr ? p.titleAr : p.title}</div>
                    <div className="w-full truncate text-[14px] font-semibold leading-5">{name(p)}</div>
                    <div className="mt-1 w-full truncate text-[11px] text-muted-foreground" dir="ltr">{p.email}</div>
                    <ProfileLink p={p} className="mt-auto mb-[22px]" />
                  </div>
                ))}
              </div>
              {peerScroll.more && (
                <button type="button" onClick={() => scrollPeers(1)} aria-label={t("Next", "التالي")}
                  className="absolute -end-[14px] top-1/2 grid h-[34px] w-[29px] -translate-y-1/2 place-items-center rounded-[8px] bg-secondary text-foreground">
                  {isAr ? <ChevronLeft className="size-5" /> : <ChevronRight className="size-5" />}
                </button>
              )}
              {peerScroll.back && (
                <button type="button" onClick={() => scrollPeers(-1)} aria-label={t("Previous", "السابق")}
                  className="absolute -start-[14px] top-1/2 grid h-[34px] w-[29px] -translate-y-1/2 place-items-center rounded-[8px] bg-secondary text-foreground">
                  {isAr ? <ChevronRight className="size-5" /> : <ChevronLeft className="size-5" />}
                </button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
