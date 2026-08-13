import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Button, Card, Input } from "@reach/shared-ui"
import { useShell } from "@reach/shell-context"
import { cn } from "@reach/shared-core"
import { Archive, ArrowLeft, Upload } from "lucide-react"

import { SearchSelect } from "./_ui"
import { addDocument, useFolders } from "../data/documents"
import { OWNER_TEAMS } from "../data/departments"
import { logAudit } from "../data/audit"

const TYPES = ["PDF", "XLSX", "DOCX"] as const
const TODAY = "Aug 12, 2026"
const TODAY_AR = "١٢ أغسطس ٢٠٢٦"

export default function DocumentEditorPage() {
  const { locale, role } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const folders = useFolders()

  const [name, setName] = React.useState("")
  const [type, setType] = React.useState<(typeof TYPES)[number]>("PDF")
  const [folder, setFolder] = React.useState("hr")
  const [dept, setDept] = React.useState("HR")
  const [restricted, setRestricted] = React.useState(false)
  const [autoArchive, setAutoArchive] = React.useState(false)
  const [archiveAfter, setArchiveAfter] = React.useState("")

  React.useEffect(() => { if (role !== "admin") navigate("/documents", { replace: true }) }, [role, navigate])

  const canSave = name.trim().length > 0
  const save = () => {
    const nm = name.trim()
    if (!nm) return
    const folderDef = folders.find((f) => f.id === folder)
    addDocument({
      id: `doc-${Date.now()}`, name: nm, nameAr: nm, folder, type,
      size: "— KB", dept: dept.trim() || (folderDef?.name ?? "General"), deptAr: dept.trim() || (folderDef?.nameAr ?? "عام"),
      updated: TODAY, updatedAr: TODAY_AR, ver: "v1", downloads: 0,
      owner: dept.trim() || "General", ownerAr: dept.trim() || "عام", restricted,
      archiveAfter: autoArchive && archiveAfter ? archiveAfter : null,
    })
    logAudit("uploaded", `${nm}.${type.toLowerCase()}`, "Documents")
    navigate("/documents")
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => navigate("/documents")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />{t("Back to library", "العودة إلى المكتبة")}
        </button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/documents")}>{t("Cancel", "إلغاء")}</Button>
          <Button disabled={!canSave} onClick={save}><Upload className="size-4" />{t("Upload", "رفع")}</Button>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-2 text-primary">
        <Upload className="size-4" />
        <span className="text-xs font-semibold uppercase tracking-[0.14em]">{t("Upload document", "رفع مستند")}</span>
      </div>

      <Card className="space-y-5 p-6 sm:p-8">
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 py-10 text-center text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/[0.03]">
          <Upload className="size-6 text-primary" />
          <span className="font-medium text-foreground">{t("Drag a file here or click to browse", "اسحب ملفًا هنا أو انقر للتصفح")}</span>
          <span className="text-xs">{t("PDF, XLSX or DOCX — metadata below", "PDF أو XLSX أو DOCX — البيانات أدناه")}</span>
          <input type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f && !name) setName(f.name.replace(/\.[^.]+$/, "")) }} />
        </label>
        <div>
          <label htmlFor="doc-name" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("Document name", "اسم المستند")}</label>
          <Input id="doc-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("e.g. Q3 Report", "مثال: تقرير الربع الثالث")} autoFocus className="h-11 text-base" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="doc-type" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("Type", "النوع")}</label>
            <select id="doc-type" value={type} onChange={(e) => setType(e.target.value as (typeof TYPES)[number])} className="h-11 w-full rounded-lg border border-input bg-[var(--card-elevated)] px-3 text-sm outline-none focus:border-primary/60">
              {TYPES.map((ty) => <option key={ty} value={ty}>{ty}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="doc-folder" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("Folder", "المجلد")}</label>
            <select id="doc-folder" value={folder} onChange={(e) => setFolder(e.target.value)} className="h-11 w-full rounded-lg border border-input bg-[var(--card-elevated)] px-3 text-sm outline-none focus:border-primary/60">
              {folders.map((f) => <option key={f.id} value={f.id}>{f.parent ? "— " : ""}{isAr ? f.nameAr : f.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("Department", "الإدارة")}</label>
          <SearchSelect
            value={dept}
            onChange={setDept}
            options={OWNER_TEAMS}
            placeholder={t("Select a department…", "اختر الإدارة…")}
            searchPlaceholder={t("Search departments…", "ابحث عن إدارة…")}
            emptyLabel={t("No departments match", "لا توجد نتائج")}
          />
        </div>
        <label className="inline-flex items-center gap-2 pt-1 text-sm"><input type="checkbox" checked={restricted} onChange={(e) => setRestricted(e.target.checked)} className="size-4 accent-[var(--primary)]" />{t("Restrict access by department", "تقييد الوصول حسب الإدارة")}</label>

        {/* auto-archive */}
        <div className="rounded-xl border border-border bg-[var(--card-elevated)] p-4">
          <label className="inline-flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={autoArchive} onChange={(e) => setAutoArchive(e.target.checked)} className="size-4 accent-[var(--primary)]" />
            <Archive className="size-4 text-primary" />{t("Auto-archive this file after a date", "أرشفة هذا الملف تلقائيًا بعد تاريخ")}
          </label>
          {autoArchive && (
            <div className="mt-3">
              <label htmlFor="doc-archive" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("Archive after", "الأرشفة بعد")}</label>
              <Input id="doc-archive" type="date" value={archiveAfter} onChange={(e) => setArchiveAfter(e.target.value)} className="h-11 sm:max-w-xs" />
              <p className="mt-1.5 text-xs text-muted-foreground">{t("On this date the file moves to the Archived view and is hidden from the main library. It stays retrievable.", "في هذا التاريخ يُنقل الملف إلى عرض الأرشيف ويُخفى من المكتبة الرئيسية. ويبقى قابلًا للاسترجاع.")}</p>
            </div>
          )}
        </div>
      </Card>
    </main>
  )
}
