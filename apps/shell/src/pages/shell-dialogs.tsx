import * as React from "react"
import { createPortal } from "react-dom"
import { motion } from "framer-motion"

import { cn } from "@reach/shared-core"
import {
  getEmployee, peersOf, reportingChain, type Employee, type Presence,
} from "@reach/shared-mocks"
import { ChevronLeft, ChevronRight, CircleX, Landmark, MessageSquareText, Phone, User, UsersRound, Video, X } from "lucide-react"

/* ─────────────────────────────────────────────────────────────────────────
 * Overlay primitive shared by the shell's popups: portal, backdrop, Esc,
 * focus on open, scroll-locked body.
 * ───────────────────────────────────────────────────────────────────────── */

function Overlay({
  open, onClose, label, children, className, scrim = true,
}: {
  open: boolean
  /** Dim the page behind (Figma's employee card 4263:19954 draws none). */
  scrim?: boolean
  onClose: () => void
  label: string
  children: React.ReactNode
  className?: string
}) {
  const ref = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const t = window.setTimeout(() => ref.current?.focus(), 20)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
      window.clearTimeout(t)
    }
  }, [open, onClose])

  if (typeof document === "undefined" || !open) return null
  return createPortal(
    <div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto p-4">
          <motion.div
            className={cn("fixed inset-0", scrim && "bg-black/45")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={onClose}
          />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            tabIndex={-1}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className={cn("relative w-full rounded-xl bg-secondary text-foreground shadow-[0_30px_80px_-24px_rgba(0,0,0,0.7)] outline-none", className)}
          >
            {children}
          </motion.div>
    </div>,
    document.body,
  )
}

/** Popup header: icon + 17px title, 48px underline (accent or red), close X. */
function PopupHeader({
  icon: Icon, title, tone = "accent", onClose, closeLabel,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  title: string
  tone?: "accent" | "danger"
  onClose: () => void
  closeLabel: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 pb-3">
      <div className="flex flex-col gap-2">
        <h2 className="flex items-center gap-1.5 text-[17px] font-medium leading-[26px]">
          <Icon className={cn("size-4 shrink-0", tone === "danger" ? "text-error" : "text-primary")} strokeWidth={1.8} />
          {title}
        </h2>
        <span className={cn("block h-[3px] w-12 rounded-[2px]", tone === "danger" ? "bg-error" : "bg-primary")} />
      </div>
      <button type="button" onClick={onClose} aria-label={closeLabel} className="grid size-[34px] place-items-center rounded-lg text-foreground transition-colors hover:bg-background/60">
        <X className="size-5" strokeWidth={1.8} />
      </button>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
 * Delete confirmation — Figma "delete popup" 3670:8803 (500×204).
 * ───────────────────────────────────────────────────────────────────────── */

export function ConfirmDeleteDialog({
  open, onClose, onConfirm, isAr, title, body, confirmLabel,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  isAr: boolean
  title: string
  body: string
  confirmLabel: string
}) {
  const t = (en: string, ar: string) => (isAr ? ar : en)
  return (
    <Overlay open={open} onClose={onClose} label={title} className="max-w-[500px]">
      <div className="flex flex-col gap-6 px-8 py-6">
        <PopupHeader icon={CircleX} title={title} tone="danger" onClose={onClose} closeLabel={t("Close", "إغلاق")} />
        <p className="pb-2 text-[13px] font-semibold text-foreground">{body}</p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => { onConfirm(); onClose() }}
            className="inline-flex h-[34px] items-center justify-center rounded-lg border border-error/40 bg-[#b42318]/55 px-6 text-[13px] font-semibold text-white transition-colors hover:bg-[#b42318]/75"
          >
            {confirmLabel}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-[34px] items-center justify-center rounded-lg border border-background px-4 text-[13px] font-semibold text-foreground transition-colors hover:bg-background/50"
          >
            {t("Cancel", "إلغاء")}
          </button>
        </div>
      </div>
    </Overlay>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
 * Employee card — Figma 4263:19954 (on the homepage), 4693:14896 (profile
 * tab, 728px) and 4693:14759 (org-structure tab, 816px).
 * ───────────────────────────────────────────────────────────────────────── */

const PRESENCE: Record<Presence, string> = {
  online: "bg-[#1aad70]",
  away: "bg-warning",
  offline: "bg-[#b9b9b9]",
}

function Avatar({ e, isAr, size = 92 }: { e: Employee; isAr: boolean; size?: number }) {
  const dot = size >= 80 ? "size-5" : size >= 50 ? "size-3.5" : "size-2.5"
  return (
    <span
      className="relative grid shrink-0 place-items-center rounded-full bg-[#a997c7]/25 text-[#a997c7]"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.3) }}
    >
      {isAr ? e.initialsAr : e.initials}
      <span className={cn("absolute bottom-0.5 end-0.5 rounded-full ring-2 ring-secondary", dot, PRESENCE[e.presence])} />
    </span>
  )
}

function ContactActions({ isAr }: { isAr: boolean }) {
  const t = (en: string, ar: string) => (isAr ? ar : en)
  return (
    <div className="flex items-center gap-6 px-2 pt-3 text-primary">
      <button type="button" aria-label={t("Chat", "محادثة")} title={t("Chat", "محادثة")} className="hover:opacity-80"><MessageSquareText className="size-5" strokeWidth={1.6} /></button>
      <button type="button" aria-label={t("Call", "اتصال")} title={t("Call", "اتصال")} className="hover:opacity-80"><Phone className="size-5" strokeWidth={1.6} /></button>
      <button type="button" aria-label={t("Video call", "مكالمة فيديو")} title={t("Video call", "مكالمة فيديو")} className="hover:opacity-80"><Video className="size-5" strokeWidth={1.6} /></button>
    </div>
  )
}

function Identity({ e, isAr, action }: { e: Employee; isAr: boolean; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start gap-3 px-4 py-2">
      <Avatar e={e} isAr={isAr} />
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-[12px] leading-[17px] text-muted-foreground">{isAr ? e.deptAr : e.dept}</span>
        <span className="text-[24px] font-semibold leading-9 text-foreground">{isAr ? e.nameAr : e.name}</span>
        <span className="text-[13px] leading-5 text-muted-foreground">{isAr ? e.titleAr : e.title}</span>
        <ContactActions isAr={isAr} />
      </div>
      {action && <div className="ms-auto self-center">{action}</div>}
    </div>
  )
}

export function EmployeeCardDialog({
  employeeId, onClose, isAr,
}: {
  employeeId: string | null
  onClose: () => void
  isAr: boolean
}) {
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const [currentId, setCurrentId] = React.useState<string | null>(employeeId)
  const [tab, setTab] = React.useState<"profile" | "org">("profile")

  // Reset to the picked employee each time the card is opened for someone new.
  const [prevId, setPrevId] = React.useState(employeeId)
  if (prevId !== employeeId) {
    setPrevId(employeeId)
    setCurrentId(employeeId)
    setTab("profile")
  }

  const e = getEmployee(currentId ?? undefined)
  const manager = getEmployee(e?.managerId)
  const show = (id: string) => { setCurrentId(id); setTab("profile") }

  return (
    <Overlay
      open={!!employeeId && !!e}
      onClose={onClose}
      label={t("Profile", "الملف التعريفي")}
      className={tab === "org" ? "max-w-[816px]" : "max-w-[728px]"}
      scrim={false}
    >
      {e && (
        <div className="relative flex max-h-[calc(100svh-32px)] flex-col gap-4 overflow-y-auto px-5 py-6 sm:px-8">
          <PopupHeader icon={User} title={t("Profile", "الملف التعريفي")} onClose={onClose} closeLabel={t("Close", "إغلاق")} />
          <Identity e={e} isAr={isAr} />

          {/* segmented tabs + full-bleed hairline */}
          <div className="relative flex pb-3">
            <div role="tablist" className="inline-flex gap-0.5 rounded-[9px] bg-card-elevated p-[3px] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              {([
                { id: "profile", icon: User, en: "Profile", ar: "الملف التعريفي" },
                { id: "org", icon: Landmark, en: "Org structure", ar: "الهيكل التنظيمي" },
              ] as const).map(({ id, icon: Icon, en, ar }) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={tab === id}
                  onClick={() => setTab(id)}
                  className={cn(
                    "inline-flex h-[30px] items-center gap-[7px] rounded-md px-3.5 text-[12px] transition-colors",
                    tab === id ? "bg-soft-accent font-semibold text-primary" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-3.5" strokeWidth={1.6} />
                  {isAr ? ar : en}
                </button>
              ))}
            </div>
            <span aria-hidden className="absolute inset-x-[-20px] bottom-0 h-0.5 bg-foreground/10 sm:inset-x-[-32px]" />
          </div>

          {tab === "profile" ? (
            <>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[12px] leading-[17px] text-muted-foreground">{t("Employee Information", "معلومات الموظف")}</span>
                  <span className="text-[16px] font-semibold leading-8">{t("Work Details", "تفاصيل العمل")}</span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    { label: t("Name", "الاسم"), value: isAr ? e.nameAr : e.name },
                    { label: t("Department", "الإدارة"), value: isAr ? e.divisionAr : e.division },
                    { label: t("Job Title", "المسمى الوظيفي"), value: isAr ? e.titleAr : e.title },
                    { label: t("Employee ID", "الرقم الوظيفي"), value: e.empNo },
                    { label: t("Email", "البريد الإلكتروني"), value: e.email, ltr: true },
                    { label: t("Direct Manager", "المدير المباشر"), value: manager ? (isAr ? manager.nameAr : manager.name) : "—" },
                  ].map((f) => (
                    <div key={f.label} className="flex min-h-[81px] flex-col justify-center gap-1 rounded-xl bg-background px-[18px] py-4">
                      <span className="truncate text-[16px] font-semibold leading-6 text-foreground" dir={f.ltr ? "ltr" : undefined} style={f.ltr ? { textAlign: isAr ? "right" : "left" } : undefined}>{f.value}</span>
                      <span className="text-[12px] text-muted-foreground">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {manager && (
                <>
                  <span aria-hidden className="h-0.5 bg-foreground/10" />
                  <div className="flex flex-col gap-3">
                    <span className="text-[16px] font-semibold leading-8">{t("Direct Manager", "المدير المباشر")}</span>
                    <Identity
                      e={manager}
                      isAr={isAr}
                      action={
                        <button type="button" onClick={() => show(manager.id)} className="btn-primary-grad inline-flex h-[34px] items-center rounded-lg px-4 text-[12px] font-semibold">
                          {t("View Profile", "عرض الملف التعريفي")}
                        </button>
                      }
                    />
                  </div>
                </>
              )}
            </>
          ) : (
            <OrgTab e={e} isAr={isAr} onShow={show} />
          )}
        </div>
      )}
    </Overlay>
  )
}

function OrgTab({ e, isAr, onShow }: { e: Employee; isAr: boolean; onShow: (id: string) => void }) {
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const chain = reportingChain(e.id)
  const peers = peersOf(e.id)
  const rowRef = React.useRef<HTMLDivElement | null>(null)
  const chainRef = React.useRef<HTMLOListElement | null>(null)
  // Figma shows the chain scrolled to its end — the employee's own card.
  React.useEffect(() => {
    const el = chainRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [e.id])
  const scrollBy = (dir: 1 | -1) => {
    // inline-end in both directions; scrollLeft is negative in RTL
    rowRef.current?.scrollBy({ left: dir * (isAr ? -1 : 1) * 200, behavior: "smooth" })
  }
  const Back = isAr ? ChevronRight : ChevronLeft
  const Fwd = isAr ? ChevronLeft : ChevronRight

  return (
    <div className="flex flex-col gap-6">
      {/* reporting chain, top → this employee */}
      <ol ref={chainRef} className="flex max-h-[340px] flex-col overflow-y-auto pe-6 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-[2px] [&::-webkit-scrollbar-thumb]:bg-foreground/60 [&::-webkit-scrollbar-track]:bg-background">
        {chain.map((m, i) => {
          const me = m.id === e.id
          return (
            <li key={m.id} className="flex flex-col items-center">
              {i > 0 && <span aria-hidden className="h-3 w-px bg-foreground/15" />}
              <div className={cn("flex w-full items-center gap-3 rounded-lg px-4 py-3", me ? "bg-soft-accent" : "bg-background")}>
                <Avatar e={m} isAr={isAr} size={40} />
                <div className="min-w-0 flex-1">
                  {me ? (
                    <>
                      <div className="text-[14px] font-semibold">{isAr ? m.nameAr : m.name}</div>
                      <div className="text-[12px] text-muted-foreground">{isAr ? m.titleAr : m.title}</div>
                    </>
                  ) : (
                    <>
                      <div className="text-[11px] text-muted-foreground">{isAr ? m.titleAr : m.title}</div>
                      <div className="text-[14px] font-semibold">{isAr ? m.nameAr : m.name}</div>
                    </>
                  )}
                  <div className="truncate text-[11px] text-muted-foreground" dir="ltr" style={{ textAlign: isAr ? "right" : "left" }}>{m.email}</div>
                </div>
                {!me && (
                  <button type="button" onClick={() => onShow(m.id)} className="shrink-0 text-[12px] text-primary hover:underline">
                    {t("View Profile", "عرض الملف التعريفي")}
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ol>

      {peers.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-center gap-1.5 text-[12px] text-muted-foreground">
            <UsersRound className="size-3.5 text-primary" strokeWidth={1.6} />
            {isAr ? <span><b className="font-semibold text-foreground">{e.nameAr}</b> يعمل مع</span> : <span><b className="font-semibold text-foreground">{e.name}</b> works with</span>}
          </div>
          <div className="relative">
            <div ref={rowRef} className="flex snap-x gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {peers.map((p) => (
                <div key={p.id} className="flex w-[179px] shrink-0 snap-start flex-col items-center gap-1 rounded-lg bg-background px-3 py-4 text-center">
                  <Avatar e={p} isAr={isAr} size={56} />
                  <span className="mt-2 text-[11px] text-muted-foreground">{isAr ? p.titleAr : p.title}</span>
                  <span className="text-[14px] font-semibold">{isAr ? p.nameAr : p.name}</span>
                  <span className="w-full truncate text-[11px] text-muted-foreground" dir="ltr">{p.email}</span>
                  <button type="button" onClick={() => onShow(p.id)} className="mt-3 text-[12px] text-primary hover:underline">
                    {t("View Profile", "عرض الملف التعريفي")}
                  </button>
                </div>
              ))}
            </div>
            {peers.length > 4 && (
              <button type="button" aria-label={t("Previous", "السابق")} onClick={() => scrollBy(-1)} className="absolute -start-4 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg bg-card-elevated text-foreground shadow">
                <Back className="size-4" />
              </button>
            )}
            <button type="button" aria-label={t("More colleagues", "المزيد من الزملاء")} onClick={() => scrollBy(1)} className="absolute -end-4 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg bg-card-elevated text-foreground shadow">
              <Fwd className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
