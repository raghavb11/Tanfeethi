import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Badge, Button, Card } from "@reach/shared-ui"
import { useShell } from "@reach/shell-context"
import { cn } from "@reach/shared-core"
import { ArrowLeft, Download, FileText, HardDrive, History, Lock, UserCircle2 } from "lucide-react"

import { documentPreview, TYPE_STYLE, useDocuments } from "../data/documents"

const PAGE = cn(
  "text-[15px] leading-[1.7] text-foreground/85",
  "[&_h3]:mb-4 [&_h3]:font-heading [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-foreground",
  "[&_p]:my-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:ps-6 [&_li]:my-1",
  "[&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm",
  "[&_th]:border [&_th]:border-border [&_th]:bg-muted/60 [&_th]:px-3 [&_th]:py-2 [&_th]:text-start [&_th]:font-semibold",
  "[&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2",
  "[&_.note]:mt-6 [&_.note]:border-t [&_.note]:border-dashed [&_.note]:border-border [&_.note]:pt-3 [&_.note]:text-xs [&_.note]:text-muted-foreground",
)

export default function DocumentPreviewPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const { id = "" } = useParams()
  const doc = useDocuments().find((d) => d.id === id)

  if (!doc) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-16 text-center">
        <FileText className="mx-auto size-10 text-muted-foreground/40" />
        <h1 className="mt-4 font-heading text-2xl font-semibold">{t("Document not found", "المستند غير موجود")}</h1>
        <Button className="mt-6" onClick={() => navigate("/documents")}>{t("Back to library", "العودة إلى المكتبة")}</Button>
      </main>
    )
  }

  const detail: [React.ComponentType<{ className?: string }>, string, string][] = [
    [FileText, t("Type", "النوع"), `${doc.type} · ${doc.size}`],
    [History, t("Version", "الإصدار"), doc.ver],
    [UserCircle2, t("Owner", "المالك"), isAr ? doc.ownerAr : doc.owner],
    [HardDrive, t("Updated", "حُدّث"), isAr ? doc.updatedAr : doc.updated],
    [Download, t("Downloads", "التحميلات"), doc.downloads.toLocaleString()],
  ]

  return (
    <main className="@container mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <button onClick={() => navigate("/documents")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />
          {t("Back to library", "العودة إلى المكتبة")}
        </button>
        <Button size="sm"><Download className="size-4" />{t("Download", "تحميل")}</Button>
      </div>

      {/* title row */}
      <div className="mb-6 flex items-start gap-4">
        <div className={cn("flex size-12 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold text-white", TYPE_STYLE[doc.type])}>{doc.type}</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{isAr ? doc.deptAr : doc.dept}</Badge>
            <span className="text-xs text-muted-foreground">{doc.ver} · {doc.size}</span>
            {doc.restricted && <Badge variant="outline"><Lock className="me-1 size-3" />{t("Restricted", "مقيّد")}</Badge>}
          </div>
          <h1 className="mt-1.5 font-heading text-2xl font-semibold leading-tight sm:text-[1.9rem]">{isAr ? doc.nameAr : doc.name}</h1>
        </div>
      </div>

      <div className="grid gap-8 @4xl:grid-cols-[minmax(0,1fr)_290px] @4xl:gap-10">
        {/* preview page */}
        <div className="min-w-0">
          <div className="rounded-2xl border border-border bg-muted/30 p-4 sm:p-8">
            <div
              className={cn("mx-auto max-w-[70ch] rounded-lg bg-[var(--card-elevated)] p-6 shadow-sm ring-1 ring-border/60 sm:p-10", PAGE)}
              dir={isAr ? "rtl" : "ltr"}
              dangerouslySetInnerHTML={{ __html: documentPreview(doc, isAr) }}
            />
          </div>
        </div>

        {/* details sidebar */}
        <aside className="@4xl:block hidden">
          <div className="sticky top-20 space-y-4">
            <Card className="p-5">
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">{t("File details", "تفاصيل الملف")}</div>
              <dl className="space-y-3 text-sm">
                {detail.map(([Icon, label, value], i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <Icon className="size-4 shrink-0 text-primary" />
                    <dt className="w-24 shrink-0 text-muted-foreground">{label}</dt>
                    <dd className="min-w-0 flex-1 truncate font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </Card>
            {doc.restricted && (
              <Card className="p-5">
                <div className="flex items-center gap-2 text-sm font-medium text-primary"><Lock className="size-4" />{t("Restricted access", "وصول مقيّد")}</div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{t("Access to this document is limited by department. Downloads are logged.", "الوصول إلى هذا المستند محدود حسب الإدارة. تُسجَّل عمليات التحميل.")}</p>
              </Card>
            )}
            <Card className="p-5">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">{t("Actions", "إجراءات")}</div>
              <div className="space-y-2">
                <Button className="w-full"><Download className="size-4" />{t("Download", "تحميل")}</Button>
                <Button variant="outline" className="w-full" onClick={() => navigate("/documents")}>{t("All documents", "كل المستندات")}</Button>
              </div>
            </Card>
          </div>
        </aside>
      </div>
    </main>
  )
}
