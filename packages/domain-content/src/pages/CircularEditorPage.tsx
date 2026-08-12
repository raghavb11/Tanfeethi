import * as React from "react"
import { useNavigate } from "react-router-dom"

import { Badge, Button, Card, Input } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import { AlertTriangle, ArrowLeft, Megaphone, Paperclip } from "lucide-react"

import { addCircular, nextCircularRef } from "../store"

const DEPTS = ["All employees", "Finance", "Operations", "People", "IT"]

export default function CircularEditorPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()

  const ref = React.useMemo(() => nextCircularRef(), [])
  const [title, setTitle] = React.useState("")
  const [dept, setDept] = React.useState("All employees")
  const [issued, setIssued] = React.useState("")
  const [important, setImportant] = React.useState(false)
  const [attached, setAttached] = React.useState(false)

  const canPublish = title.trim().length > 0

  const publish = () => {
    addCircular({
      id: `cir-${Date.now()}`,
      ref,
      title: title.trim(),
      dept,
      issued: issued.trim() || "Today",
      important,
      status: "Published",
      file: attached ? "PDF · 210 KB" : "No attachment",
    })
    navigate("/circulars")
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <button onClick={() => navigate("/circulars")} className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />
          {t("Back to circulars", "العودة إلى التعاميم")}
        </button>
        <div className="flex items-center gap-2 text-primary">
          <Megaphone className="size-5" />
          <span className="text-xs font-semibold uppercase tracking-[0.14em]">{t("Internal Circulars", "التعاميم الداخلية")}</span>
        </div>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight">{t("New circular", "تعميم جديد")}</h1>
      </div>

      <Card className="space-y-5 p-5">
        <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2">
          <span className="text-sm text-muted-foreground">{t("Reference number", "الرقم المرجعي")}</span>
          <span className="font-mono text-sm font-medium">{ref}</span>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">{t("Circular title", "عنوان التعميم")}</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("e.g. Updated Remote Work Guidelines", "مثال: تحديث إرشادات العمل عن بُعد")} className={isAr ? "text-right" : undefined} />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">{t("Target audience", "الجمهور المستهدف")}</label>
          <div className="flex flex-wrap gap-2">
            {DEPTS.map((d) => (
              <button key={d} onClick={() => setDept(d)} className={cn("rounded-full border px-3 py-1.5 text-sm transition-colors", dept === d ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/60")}>{d}</button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">{t("Issue date", "تاريخ الإصدار")}</label>
          <Input value={issued} onChange={(e) => setIssued(e.target.value)} placeholder={t("e.g. Aug 4, 2026", "مثال: ٤ أغسطس ٢٠٢٦")} className={isAr ? "text-right" : undefined} />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">{t("Attachment", "المرفق")}</label>
          <button onClick={() => setAttached((a) => !a)} className={cn("flex w-full items-center gap-2 rounded-lg border border-dashed px-3 py-3 text-sm transition-colors", attached ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/60")}>
            <Paperclip className="size-4" />
            {attached ? t("circular.pdf attached — click to remove", "تم إرفاق circular.pdf — انقر للإزالة") : t("Attach PDF / Word document", "إرفاق ملف PDF أو Word")}
          </button>
        </div>

        <button onClick={() => setImportant((i) => !i)} className={cn("inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors", important ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/60")}>
          <AlertTriangle className={cn("size-4", important && "fill-primary/20")} />
          {important ? t("Marked important — pinned on home", "مهم — مثبّت على الرئيسية") : t("Mark as important", "وضع علامة مهم")}
        </button>
      </Card>

      <div className="sticky bottom-0 mt-6 -mx-4 flex items-center justify-between gap-2 border-t border-border bg-background/85 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
        <Badge variant="outline">{t("Audit trail recorded on publish", "يُسجّل في سجل التدقيق عند النشر")}</Badge>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/circulars")}>{t("Cancel", "إلغاء")}</Button>
          <Button disabled={!canPublish} onClick={publish}>{t("Publish circular", "نشر التعميم")}</Button>
        </div>
      </div>
    </main>
  )
}
