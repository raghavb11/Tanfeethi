import * as React from "react"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
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

  const chainRef = React.useRef<HTMLDivElement>(null)
  const peersRef = React.useRef<HTMLDivElement>(null)

  // open scrolled to the bottom of the chain, where the signed-in employee sits
  React.useEffect(() => {
    if (!open) return
    const id = window.setTimeout(() => { chainRef.current?.scrollTo({ top: chainRef.current.scrollHeight }) }, 30)
    return () => window.clearTimeout(id)
  }, [open])

  const scrollPeers = (dir: 1 | -1) => {
    const el = peersRef.current
    if (!el) return
    // in RTL scrollLeft runs negative; scrolling "forward" means toward the inline end
    el.scrollBy({ left: (isAr ? -1 : 1) * dir * (el.clientWidth * 0.8), behavior: "smooth" })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        dir={isAr ? "rtl" : "ltr"}
        className="max-h-[92svh] gap-0 overflow-hidden rounded-2xl bg-popover p-0 ring-1 ring-border sm:max-w-[728px]"
      >
        {/* header */}
        <div className="relative z-10 flex items-start justify-between gap-3 bg-gradient-to-b from-popover via-popover to-popover/80 px-6 pb-3 pt-6 shadow-[0_8px_16px_-12px_rgba(0,0,0,0.6)]">
          <DialogTitle className="sr-only">{t("Org structure", "الهيكل التنظيمي")}</DialogTitle>
          <CardTitle icon={Building2} title={t("Org structure", "الهيكل التنظيمي")} />
          <DialogClose className="grid size-9 place-items-center rounded-lg text-foreground transition-colors hover:bg-secondary" aria-label={t("Close", "إغلاق")}>
            <X className="size-6" />
          </DialogClose>
        </div>

        {/* reporting chain */}
        <div ref={chainRef} className="max-h-[min(400px,42svh)] overflow-y-auto px-6 pt-2 [scrollbar-color:var(--muted-foreground)_transparent] [scrollbar-width:thin]">
          <ol className="relative space-y-4 pb-2">
            <span aria-hidden className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-secondary" />
            {chain.map((p) => {
              const isMe = p.id === ME_ID
              const isManager = p.id === managerId
              return (
                <li key={p.id}
                  className={cn("relative flex items-center gap-4 rounded-xl px-5 py-4",
                    isMe ? "bg-soft-accent ring-1 ring-primary/20" : "bg-background")}>
                  <Initials text={ini(p)} tone={isMe ? "accent" : "violet"} presence={presenceOf(p.id)} className="size-[50px] text-[15px]" />
                  <div className="min-w-0 flex-1">
                    {isMe ? (
                      <>
                        <div className="truncate text-[17px] font-semibold">{name(p)}</div>
                        <div className="truncate text-[13px] text-muted-foreground">{isAr ? p.titleAr : p.title}</div>
                      </>
                    ) : (
                      <>
                        <div className="truncate text-[13px] text-muted-foreground">{isManager ? t("Manager", "المدير") : (isAr ? p.titleAr : p.title)}</div>
                        <div className="truncate text-[17px] font-semibold">{name(p)}</div>
                      </>
                    )}
                    <div className="mt-1.5 truncate text-[13px] text-muted-foreground" dir="ltr" style={{ textAlign: isAr ? "right" : "left" }}>{p.email}</div>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>

        {/* works with */}
        <div className="px-6 pb-6 pt-5">
          <div className="mb-4 flex items-center justify-center gap-1.5 text-[13px] text-muted-foreground">
            <UsersRound className="size-4 text-primary" />
            {isAr ? <span>يعمل <b className="font-semibold text-foreground">{me.nameAr}</b> مع</span> : <span><b className="font-semibold text-foreground">{me.name}</b> works with</span>}
          </div>
          {peers.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-muted-foreground">{t("No colleagues share this manager.", "لا يوجد زملاء يتبعون نفس المدير.")}</p>
          ) : (
            <div className="relative">
              <div ref={peersRef} className="flex snap-x gap-4 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {peers.map((p) => (
                  <div key={p.id} className="flex w-[calc((100%-48px)/4)] min-w-[150px] shrink-0 snap-start flex-col items-center rounded-xl bg-background px-3 pb-5 pt-5 text-center">
                    <Initials text={ini(p)} tone="violet" presence={presenceOf(p.id)} className="size-[70px] text-[18px]" />
                    <div className="mt-4 w-full truncate text-[12.5px] text-muted-foreground">{isAr ? p.titleAr : p.title}</div>
                    <div className="w-full truncate text-[15px] font-semibold">{name(p)}</div>
                    <div className="mt-1 w-full truncate text-[11.5px] text-muted-foreground" dir="ltr">{p.email}</div>
                  </div>
                ))}
              </div>
              {peers.length > 4 && (
                <>
                  <button type="button" onClick={() => scrollPeers(1)} aria-label={t("Next", "التالي")}
                    className="absolute -end-4 top-1/2 grid h-10 w-8 -translate-y-1/2 place-items-center rounded-lg bg-secondary text-foreground">
                    {isAr ? <ChevronLeft className="size-5" /> : <ChevronRight className="size-5" />}
                  </button>
                  <button type="button" onClick={() => scrollPeers(-1)} aria-label={t("Previous", "السابق")}
                    className="absolute -start-4 top-1/2 grid h-10 w-8 -translate-y-1/2 place-items-center rounded-lg bg-secondary text-foreground">
                    {isAr ? <ChevronRight className="size-5" /> : <ChevronLeft className="size-5" />}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
