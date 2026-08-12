import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Badge, Button, Card, Input } from "@reach/shared-ui"
import { useShell } from "@reach/shell-context"
import { cn } from "@reach/shared-core"
import { Download, Eye, FileText, Megaphone, Pin, Plus, Search } from "lucide-react"

import { PageHeader, StatCard } from "./_ui"
import { useCirculars } from "../store"

type Circular = {
  id: string
  ref: string
  title: string
  titleAr: string
  issued: string
  dept: string
  important?: boolean
  pinned?: boolean
  views: number
  downloads: number
  file: string
}

const CIRCULARS: Circular[] = [
  { id: "c1", ref: "CIR-2026-0142", title: "Updated Travel & Expense Policy", titleAr: "تحديث سياسة السفر والمصروفات", issued: "Aug 2, 2026", dept: "All employees", important: true, pinned: true, views: 842, downloads: 613, file: "PDF · 240 KB" },
  { id: "c2", ref: "CIR-2026-0141", title: "Ramadan Working Hours Directive", titleAr: "توجيه ساعات عمل رمضان", issued: "Aug 1, 2026", dept: "All employees", important: true, views: 1204, downloads: 402, file: "PDF · 180 KB" },
  { id: "c3", ref: "CIR-2026-0140", title: "IT Security Awareness — Phishing Drill", titleAr: "التوعية الأمنية — اختبار التصيّد", issued: "Jul 29, 2026", dept: "All employees", views: 587, downloads: 210, file: "PDF · 320 KB" },
  { id: "c4", ref: "CIR-2026-0139", title: "Procurement Approval Matrix Update", titleAr: "تحديث مصفوفة اعتماد المشتريات", issued: "Jul 25, 2026", dept: "Finance", views: 214, downloads: 156, file: "DOCX · 96 KB" },
  { id: "c5", ref: "CIR-2026-0138", title: "Terminal Access Badge Renewal", titleAr: "تجديد بطاقات دخول المبنى", issued: "Jul 20, 2026", dept: "Operations", views: 331, downloads: 288, file: "PDF · 150 KB" },
  { id: "c6", ref: "CIR-2026-0137", title: "Annual Leave Carry-over Rules", titleAr: "قواعد ترحيل الإجازات السنوية", issued: "Jul 14, 2026", dept: "People", views: 720, downloads: 512, file: "PDF · 120 KB" },
]

const FILTERS = ["All", "Important", "All employees", "Finance", "Operations", "People"]

export default function CircularsPage() {
  const { locale, role } = useShell()
  const isAr = locale === "ar"
  const isAdmin = role === "admin"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const created = useCirculars()

  const [q, setQ] = React.useState("")
  const [filter, setFilter] = React.useState("All")

  const matches = (c: Circular) => {
    const text = q === "" || c.title.toLowerCase().includes(q.toLowerCase()) || c.ref.toLowerCase().includes(q.toLowerCase())
    const f = filter === "All" || (filter === "Important" ? c.important : c.dept === filter)
    return text && f
  }
  const list = CIRCULARS.filter(matches)
  const pinned = list.filter((c) => c.pinned)
  const rest = list.filter((c) => !c.pinned)

  const Row = (c: Circular, authored?: boolean) => (
    <Card key={c.id} className="flex flex-row flex-wrap items-center gap-4 p-4">
      <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-lg", c.important ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
        {c.file.startsWith("DOCX") ? <FileText className="size-5" /> : <Megaphone className="size-5" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">{c.ref}</span>
          {authored && <Badge className="bg-primary/15 text-primary">{t("New", "جديد")}</Badge>}
          {c.important && <Badge className="bg-primary/15 text-primary">{t("Important", "مهم")}</Badge>}
          {c.pinned && <Badge variant="outline"><Pin className="me-1 size-3" />{t("Pinned", "مثبّت")}</Badge>}
        </div>
        <h3 className="mt-1 font-medium">{isAr ? c.titleAr : c.title}</h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>{t("Issued", "صدر")} {c.issued}</span>
          <Badge variant="outline">{c.dept}</Badge>
          <span>{c.file}</span>
          <span className="inline-flex items-center gap-1"><Eye className="size-3.5" />{(c.views ?? 0).toLocaleString()}</span>
          <span className="inline-flex items-center gap-1"><Download className="size-3.5" />{(c.downloads ?? 0).toLocaleString()}</span>
        </div>
      </div>
      <Button variant="outline" className="shrink-0"><Download className="size-4" />{t("Download", "تحميل")}</Button>
    </Card>
  )

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        icon={Megaphone}
        eyebrow={t("Internal Circulars", "التعاميم الداخلية")}
        title={t("Official circulars & communications", "التعاميم والمراسلات الرسمية")}
        desc={t("Reference-numbered circulars with issue dates, targeting, view/download tracking and audit trail.", "تعاميم مرقّمة مع تواريخ الإصدار والاستهداف وتتبّع المشاهدات والتحميلات وسجل التدقيق.")}
        action={isAdmin ? <Button size="lg" onClick={() => navigate("/circulars/new")}><Plus className="size-4" />{t("New circular", "تعميم جديد")}</Button> : undefined}
      />

      {isAdmin && (
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={Megaphone} value={String(142 + created.length)} label={t("Published", "منشورة")} />
          <StatCard icon={Pin} value="3" label={t("Pinned", "مثبّتة")} sub={t("on home", "على الرئيسية")} />
          <StatCard icon={Eye} value="4.2k" label={t("Views", "مشاهدات")} sub={t("this month", "هذا الشهر")} />
          <StatCard icon={Download} value="1.6k" label={t("Downloads", "تحميلات")} sub={t("this month", "هذا الشهر")} />
        </div>
      )}

      {/* filters + search */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cn("rounded-full border px-3 py-1.5 text-sm transition-colors", filter === f ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/60")}>
              {f === "All" ? t("All", "الكل") : f === "Important" ? t("Important", "مهم") : f}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search by title or reference…", "ابحث بالعنوان أو الرقم المرجعي…")} className="w-64 ps-9" />
        </div>
      </div>

      {/* authored this session */}
      {created.length > 0 && filter === "All" && q === "" && (
        <div className="mb-3 space-y-3">
          {created.map((c) => Row({ ...c, titleAr: c.title }, true))}
        </div>
      )}

      {pinned.length > 0 && <div className="mb-3 space-y-3">{pinned.map((c) => Row(c))}</div>}
      <div className="space-y-3">{rest.map((c) => Row(c))}</div>

      {list.length === 0 && created.length === 0 && (
        <Card className="p-10 text-center text-muted-foreground">{t("No circulars match your filters.", "لا توجد تعاميم مطابقة.")}</Card>
      )}
    </main>
  )
}
