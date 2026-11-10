import * as React from "react"
import { useShell } from "@reach/shell-context"
import { BookUser, Check, Download, IdCard, MailPlus } from "lucide-react"

import { businessCard, emp } from "../data/mock/center"
import { setShare, SHARE_FIELDS, type ShareField, usePrefs } from "../data/mock/hub"
import { QrMatrix } from "./DigitalCard"
import { SectionCard, Toggle } from "./wijha"

/** WIJHA gate mark (two arches: gold outer, violet inner) — redrawn locally. */
export function WijhaMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden focusable="false">
      <path d="M7.2 34V13.6a10.8 10.8 0 0 1 21.6 0V34" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M11.9 34V14.9a6.1 6.1 0 0 1 12.2 0V34" stroke="#a997c7" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

/** The vCard the QR resolves to — only the fields the employee chose to share. */
export function buildVCard(share: Record<ShareField, boolean>) {
  return [
    "BEGIN:VCARD", "VERSION:3.0",
    `FN:${emp.name}`,
    "ORG:ALTANFEETHI" + (share.department ? `;${emp.department}` : ""),
    share.title ? `TITLE:${emp.title}` : "",
    share.email ? `EMAIL:${emp.email}` : "",
    share.mobile ? `TEL;TYPE=CELL:${businessCard.mobile}` : "",
    share.location ? `ADR;TYPE=WORK:;;${emp.location};${emp.city};;;Saudi Arabia` : "",
    `URL:${businessCard.qrPayload}`,
    "END:VCARD",
  ].filter(Boolean).join("\r\n")
}

type Action = "email" | "contact" | "image"

/** Business card — Figma 4791:33007 (web, in Profile) / 3610:8460 (phone):
 *  identity header, QR, caption, WIJHA mark, actions, "what is shared" toggles. */
export function BusinessCardPanel({ actions = ["email", "image"], className }: { actions?: Action[]; className?: string }) {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const { share } = usePrefs()
  const vcard = React.useMemo(() => buildVCard(share), [share])
  const qrRef = React.useRef<HTMLDivElement>(null)
  const [done, setDone] = React.useState<Action | null>(null)
  const flash = (a: Action) => { setDone(a); window.setTimeout(() => setDone(null), 2200) }

  const download = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = name
    a.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const run = (a: Action) => {
    if (a === "email") {
      const body = encodeURIComponent(`${emp.name}\n${share.title ? emp.title + "\n" : ""}${share.email ? emp.email + "\n" : ""}${share.mobile ? businessCard.mobile + "\n" : ""}${businessCard.qrPayload}`)
      window.location.href = `mailto:?subject=${encodeURIComponent(`${emp.name} — ALTANFEETHI`)}&body=${body}`
    } else if (a === "contact") {
      download(new Blob([vcard], { type: "text/vcard" }), `${emp.empId}.vcf`)
    } else {
      // rasterise the QR svg to a PNG
      const svg = qrRef.current?.querySelector("svg")
      if (!svg) return
      const xml = new XMLSerializer().serializeToString(svg)
      const img = new Image()
      img.onload = () => {
        const c = document.createElement("canvas")
        c.width = c.height = 600
        const ctx = c.getContext("2d")
        if (!ctx) return
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(img, 0, 0, 600, 600)
        c.toBlob((b) => b && download(b, `${emp.empId}-qr.png`), "image/png")
      }
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`
    }
    flash(a)
  }

  const ACTIONS: Record<Action, { icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; label: string }> = {
    email: { icon: MailPlus, label: t("Send by email", "إرسال بالبريد") },
    contact: { icon: BookUser, label: t("Add to contacts", "إضافة إلى جهات الاتصال") },
    image: { icon: Download, label: t("Save code as image", "حفظ الرمز كصورة") },
  }

  const subtitle = [share.title ? (isAr ? emp.titleAr : emp.title) : "", share.department ? (isAr ? emp.departmentAr : emp.department) : ""].filter(Boolean).join(" · ")

  return (
    <SectionCard icon={IdCard} title={t("Business card", "بطاقة العمل")} className={className}>
      {/* identity */}
      <div className="flex items-center justify-between gap-4 px-0 pb-5 sm:px-4">
        <div className="min-w-0">
          <div className="truncate text-[17px] font-medium">{isAr ? emp.nameAr : emp.name}</div>
          <div className="mt-1 truncate text-[12.5px] text-muted-foreground">{subtitle || t("ALTANFEETHI", "التنفيذي")}</div>
        </div>
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-soft-accent text-[18px] font-medium tracking-wide text-primary ring-1 ring-primary" dir="ltr">{emp.initials}</span>
      </div>
      <div aria-hidden className="h-0.5 bg-[var(--divider)]" />

      {/* QR + caption + mark */}
      <div className="flex flex-col items-center pt-9 text-center">
        <div ref={qrRef} className="size-[188px] bg-white p-0">
          <QrMatrix payload={vcard} size={29} />
        </div>
        <p className="mt-9 max-w-[250px] text-[12.5px] leading-5 text-muted-foreground">
          {t("Scan the code to add me to your contacts directly — no app needed.", "امسح الرمز لإضافتي إلى جهات الاتصال مباشرة دون الحاجة إلى التطبيق.")}
        </p>
        <div className="mt-4 flex items-center gap-1.5">
          <WijhaMark className="size-9" />
          <span className="flex flex-col items-start leading-none">
            <span className="text-[15px]">وجهة</span>
            <span className="mt-[3px] text-[10px] tracking-wide text-muted-foreground">WIJHA</span>
          </span>
        </div>

        {/* actions */}
        <div className="mt-9 flex flex-wrap justify-center gap-x-24 gap-y-6">
          {actions.map((a) => {
            const A = ACTIONS[a]
            const Icon = done === a ? Check : A.icon
            return (
              <button key={a} type="button" onClick={() => run(a)} className="group flex w-24 flex-col items-center gap-3">
                <span className="grid size-[62px] place-items-center rounded-full bg-secondary transition-colors group-hover:bg-soft-accent">
                  <Icon className="size-6 text-primary" strokeWidth={1.6} />
                </span>
                <span className="text-[12.5px] leading-snug">{A.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* what is shared */}
      <div className="mt-8 px-0 pb-4 sm:px-4 text-[17px] font-medium">{t("What is being shared", "ما الذي تتم مشاركته")}</div>
      <div aria-hidden className="h-0.5 bg-secondary" />
      <ul>
        {SHARE_FIELDS.map((f) => (
          <li key={f.id} className="flex items-center justify-between gap-4 border-b border-secondary px-0 py-4 last:border-b-0 sm:px-4">
            <span className="text-[17px]">{isAr ? f.labelAr : f.label}</span>
            <Toggle checked={share[f.id]} onChange={(v) => setShare(f.id, v)} label={isAr ? f.labelAr : f.label} />
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}
