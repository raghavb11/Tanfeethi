import * as React from "react"
import { useNavigate } from "react-router-dom"
import { useShell } from "@reach/shell-context"
import { ArrowLeft, ArrowRight, Building2, Check, Contact, Eye, Globe, IdCard, Link2, Mail, Phone, Share2, Share as ShareIcon } from "lucide-react"

import { BusinessCardPanel } from "../components/BusinessCardPanel"
import { businessCard, cardEvents, emp } from "../data/mock/center"
import { Empty, GoldButton, Page, SectionCard } from "../components/wijha"

const EVENT_ICON = { shared: Share2, viewed: Eye, saved: Contact } as const

/** Business card — Figma 3610:8460 (phone; no web frame — the web Profile 4791:33007
 *  carries the same card). Identity only: no access authorisation, no door or
 *  printer functions (out of scope, SOW V4). Contact details and share history are
 *  kept from the earlier card page. */
export default function BusinessCardPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const [copied, setCopied] = React.useState(false)
  const Back = isAr ? ArrowRight : ArrowLeft

  const copyLink = () => {
    navigator.clipboard?.writeText(businessCard.qrPayload).catch(() => {})
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2400)
  }

  const details: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; ltr?: boolean }[] = [
    { icon: Mail, label: t("Email", "البريد الإلكتروني"), value: emp.email, ltr: true },
    { icon: Phone, label: t("Mobile", "الجوال"), value: businessCard.mobile, ltr: true },
    { icon: IdCard, label: t("Extension", "التحويلة"), value: businessCard.extension, ltr: true },
    { icon: Building2, label: t("Office", "المكتب"), value: isAr ? businessCard.officeAr : businessCard.office },
    { icon: Globe, label: t("Website", "الموقع"), value: businessCard.website, ltr: true },
  ]

  return (
    <Page>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={() => navigate("/employee")} className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground">
          <Back className="size-4" />{t("Back to Employee", "العودة إلى الموظف")}
        </button>
        <GoldButton onClick={copyLink}>
          {copied ? <Check className="size-4" /> : <ShareIcon className="size-4" />}
          {copied ? t("Link copied", "تم نسخ الرابط") : t("Share card link", "مشاركة رابط البطاقة")}
        </GoldButton>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,729fr)_minmax(0,480fr)]">
        <BusinessCardPanel actions={["email", "contact", "image"]} />

        <div className="min-w-0 space-y-6">
          <SectionCard icon={Contact} title={t("Contact details", "بيانات الاتصال")}>
            <div className="overflow-hidden rounded-[10px] bg-background">
              {details.map((d) => (
                <div key={d.label} className="flex items-start gap-3 border-b border-border px-4 py-3.5 last:border-b-0">
                  <d.icon className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <div className="text-[12px] text-muted-foreground">{d.label}</div>
                    <div className="mt-0.5 break-words text-[14px]" dir={d.ltr ? "ltr" : undefined}>{d.value}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-[12px] text-muted-foreground">
              {isAr ? businessCard.issuedAr : businessCard.issued} · {isAr ? businessCard.validUntilAr : businessCard.validUntil}
            </div>
          </SectionCard>

          <SectionCard icon={Link2} title={t("Card activity", "نشاط البطاقة")}>
            <p className="-mt-2 mb-3 text-[12.5px] text-muted-foreground">{t("Every share and view is recorded.", "يتم تسجيل كل مشاركة وعرض.")}</p>
            {cardEvents.length === 0 ? (
              <Empty icon={Link2} title={t("No activity yet", "لا يوجد نشاط بعد")} />
            ) : (
              <div className="divide-y divide-border">
                {cardEvents.map((e) => {
                  const Icon = EVENT_ICON[e.kind]
                  return (
                    <div key={e.id} className="flex items-start gap-3 py-3 first:pt-0">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary"><Icon className="size-4 text-primary" /></span>
                      <div className="min-w-0">
                        <div className="text-[13.5px]">{isAr ? e.detailAr : e.detail}</div>
                        <div className="mt-0.5 text-[12px] text-muted-foreground">{isAr ? e.timeAr : e.time}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </Page>
  )
}
