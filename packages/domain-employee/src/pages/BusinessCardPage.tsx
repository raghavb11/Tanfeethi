import * as React from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Badge, Button, Card } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  ArrowLeft, Building2, Check, Contact, Eye, Globe, IdCard, Link2, Mail, Phone, QrCode, Share2, Share as ShareIcon,
} from "lucide-react"

import { DigitalCard } from "../components/DigitalCard"
import { businessCard, cardEvents, emp } from "../data/mock/center"

const EVENT_ICON = { shared: Share2, viewed: Eye, saved: Contact } as const

/** Full-screen digital business card — the "show this to identify yourself"
 *  view, plus share and save-contact actions. Identity only: no access
 *  authorisation, no door or printer functions (out of scope, SOW V4). */
export default function BusinessCardPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const [copied, setCopied] = React.useState(false)
  const [saved, setSaved] = React.useState(false)

  const copyLink = () => {
    navigator.clipboard?.writeText(businessCard.qrPayload).catch(() => {})
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2400)
  }

  /** Save-contact produces a vCard the recipient's phone can import. */
  const saveContact = () => {
    const vcard = [
      "BEGIN:VCARD", "VERSION:3.0",
      `FN:${emp.name}`,
      `TITLE:${emp.title}`,
      `ORG:ALTANFEETHI;${emp.department}`,
      `EMAIL:${emp.email}`,
      `TEL;TYPE=CELL:${businessCard.mobile}`,
      `URL:${businessCard.qrPayload}`,
      "END:VCARD",
    ].join("\r\n")
    const url = URL.createObjectURL(new Blob([vcard], { type: "text/vcard" }))
    const a = document.createElement("a")
    a.href = url
    a.download = `${emp.empId}.vcf`
    a.click()
    URL.revokeObjectURL(url)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2400)
  }

  const details: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; ltr?: boolean }[] = [
    { icon: Mail, label: t("Email", "البريد الإلكتروني"), value: emp.email, ltr: true },
    { icon: Phone, label: t("Mobile", "الجوال"), value: businessCard.mobile, ltr: true },
    { icon: IdCard, label: t("Extension", "التحويلة"), value: businessCard.extension, ltr: true },
    { icon: Building2, label: t("Office", "المكتب"), value: isAr ? businessCard.officeAr : businessCard.office },
    { icon: Globe, label: t("Website", "الموقع"), value: businessCard.website, ltr: true },
  ]

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-7 md:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate("/employee")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />
          {t("Back to Employee Center", "العودة إلى مركز الموظف")}
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={saveContact}>
            {saved ? <Check className="size-4" /> : <Contact className="size-4" />}
            {saved ? t("Saved", "تم الحفظ") : t("Save contact", "حفظ جهة الاتصال")}
          </Button>
          <Button onClick={copyLink}>
            {copied ? <Check className="size-4" /> : <ShareIcon className="size-4" />}
            {copied ? t("Link copied", "تم نسخ الرابط") : t("Share card", "مشاركة البطاقة")}
          </Button>
        </div>
      </div>

      <div className="space-y-1.5">
        <h1 className="text-[22px] font-bold tracking-tight md:text-[26px]">
          {t("Digital business card", "بطاقة العمل الرقمية")}
        </h1>
        <p className="max-w-3xl text-[13px] text-muted-foreground">
          {t(
            "Show this card to identify yourself, or share it with someone you meet.",
            "اعرض هذه البطاقة للتعريف بنفسك، أو شاركها مع من تقابله.",
          )}
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {/* the card, at identification size */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-7"
        >
          <DigitalCard isAr={isAr} size="lg" />

          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11.5px] text-muted-foreground">
            <Badge variant="outline" className="gap-1">
              <QrCode className="size-3" />
              {t("Scan to open profile", "امسح لفتح الملف")}
            </Badge>
            <span>{isAr ? businessCard.issuedAr : businessCard.issued}</span>
            <span aria-hidden>·</span>
            <span>{isAr ? businessCard.validUntilAr : businessCard.validUntil}</span>
          </div>
        </motion.div>

        {/* contact detail + recent activity */}
        <div className="space-y-6 lg:col-span-5">
          <Card className="ring-1 ring-foreground/10">
            <div className="flex items-center gap-2.5 border-b border-border/60 px-5 py-4">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/12 text-primary">
                <Contact className="size-4" />
              </span>
              <div className="text-[13px] font-semibold">{t("Contact details", "بيانات الاتصال")}</div>
            </div>
            <div className="divide-y divide-border/50">
              {details.map((d) => (
                <div key={d.label} className="flex items-start gap-3 px-5 py-3">
                  <d.icon className="mt-0.5 size-4 shrink-0 text-muted-foreground/70" />
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/60">
                      {d.label}
                    </div>
                    <div className="mt-0.5 break-words text-[12.5px] font-medium" dir={d.ltr ? "ltr" : undefined}>
                      {d.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="ring-1 ring-foreground/10">
            <div className="flex items-center gap-2.5 border-b border-border/60 px-5 py-4">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/12 text-primary">
                <Link2 className="size-4" />
              </span>
              <div className="min-w-0">
                <div className="text-[13px] font-semibold">{t("Card activity", "نشاط البطاقة")}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground/65">
                  {t("Every share and view is recorded", "يتم تسجيل كل مشاركة وعرض")}
                </div>
              </div>
            </div>
            <div className="divide-y divide-border/50">
              {cardEvents.map((e) => {
                const Icon = EVENT_ICON[e.kind]
                return (
                  <div key={e.id} className="flex items-start gap-3 px-5 py-3">
                    <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground/70" />
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-medium">{isAr ? e.detailAr : e.detail}</div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground/65">{isAr ? e.timeAr : e.time}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    </main>
  )
}
