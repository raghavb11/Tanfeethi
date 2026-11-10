import * as React from "react"
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom"
import {
  ChevronLeft, ChevronRight, Download, Eye, FileUp, FolderOpen, FolderPlus, Info, MessagesSquare, Plus, Search,
  Trash2, UserCog,
} from "lucide-react"
import { cn } from "@reach/shared-core"

import {
  CardTitle, GoldButton, OutlineButton, PageBody, SelectInput, TextInput, Toast } from "../components/wijha"
import { useT } from "../components/i18n"
import {
  ANONYMOUS, ME, addComment, addDocuments, addFolder, authorOf, deptById, departments, people, personById,
  removeDocument, saveInvestigation, statusOptions, useReport, yesNo, type Doc, type ViolationReport, type ViolationStatus,
} from "../data/mock/violations"

/** Violation report detail.
 *  mode="reporter"     — Figma 4999:18721 (view). Route: /services/violations/reports/:reportId (?evidence=1 opens the upload)
 *  mode="investigator" — Figma 5005:19655 (edit: status, reassign, legal consultation).
 *                        Route: /services/violations/queue/:reportId
 *  Whistleblower anonymity: when the report was filed anonymously, "Created by"
 *  shows "Anonymous reporter" to everyone (the design shows the name). */
export default function ViolationReportDetailPage({ mode = "reporter" }: { mode?: "reporter" | "investigator" }) {
  const { reportId } = useParams()
  const r = useReport(reportId)
  if (!r) return <Navigate to={mode === "reporter" ? "/services/violations/reports" : "/services/violations/queue"} replace />
  return <Detail key={r.id} r={r} mode={mode} />
}

function Detail({ r, mode }: { r: ViolationReport; mode: "reporter" | "investigator" }) {
  const { t, o } = useT()
  const [params] = useSearchParams()
  const [saved, setSaved] = React.useState(false)

  return (
    <PageBody className="space-y-4">
      {saved && <Toast>{t("Changes saved and logged in the comments.", "تم حفظ التعديلات وتسجيلها في التعليقات.")}</Toast>}
      {/* Shown when arriving from "Add Evidence" (?evidence=1); the status row says it otherwise,
          so the page itself keeps the Figma 4999:18721 layout. */}
      {mode === "reporter" && r.status === "needs-evidence" && params.get("evidence") === "1" && (
        <div role="status" className="rounded-[12px] bg-warning-fill px-4 py-3 text-[12.5px] text-warning">
          {t("The investigator asked for more evidence — upload it under “Manage Evidence Documents & Violations”.",
            "طلب المحقق أدلة إضافية — ارفعها في «إدارة المستندات الأدلة والمخالفات».")}
        </div>
      )}
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_480px]">
        <div className="min-w-0 space-y-6">
          <Documents r={r} byReporter={mode === "reporter"} autoUpload={params.get("evidence") === "1"} />
          <Comments r={r} authorId={mode === "reporter" ? "me" : "investigator"} />
        </div>
        <DetailsCard r={r} mode={mode} onSaved={() => { setSaved(true); window.setTimeout(() => setSaved(false), 3000) }} />
      </div>
      <p className="sr-only">{o(r.title)}</p>
    </PageBody>
  )
}

// ── التفاصيل ─────────────────────────────────────────────────────────────────
function DetailsCard({ r, mode, onSaved }: { r: ViolationReport; mode: "reporter" | "investigator"; onSaved: () => void }) {
  const { t, o } = useT()
  const navigate = useNavigate()
  const [status, setStatus] = React.useState<ViolationStatus>(r.status)
  const [dept, setDept] = React.useState(r.assignedDeptId)
  const [to, setTo] = React.useState(r.assignedToId)
  const [legal, setLegal] = React.useState(r.legalConsultation)
  const edit = mode === "investigator"
  const dirty = status !== r.status || dept !== r.assignedDeptId || to !== r.assignedToId || legal !== r.legalConsultation

  const save = () => {
    if (!dirty) return
    const changes: string[] = []
    const changesAr: string[] = []
    if (status !== r.status) { changes.push(`status → ${statusOptions[status].en}`); changesAr.push(`الحالة ← ${statusOptions[status].ar}`) }
    if (dept !== r.assignedDeptId) { changes.push(`reassigned to ${deptById(dept)?.en}`); changesAr.push(`إعادة إسناد إلى ${deptById(dept)?.ar}`) }
    if (to !== r.assignedToId) { changes.push(`assigned to ${personById(to)?.en}`); changesAr.push(`إسناد إلى ${personById(to)?.ar}`) }
    if (legal !== r.legalConsultation) { changes.push(`legal consultation: ${legal}`); changesAr.push(`الاستشارة القانونية: ${legal === "yes" ? "نعم" : "لا"}`) }
    saveInvestigation(r.id, { status, assignedDeptId: dept, assignedToId: to, legalConsultation: legal },
      { en: `Updated: ${changes.join(", ")}.`, ar: `تم التحديث: ${changesAr.join("، ")}.` })
    onSaved()
  }

  const row = (label: string, value: React.ReactNode, last = false) => (
    <div className={cn("flex min-h-[54px] items-center justify-between gap-4 p-4", !last && "border-b border-secondary")}>
      <span className="shrink-0 text-[11.5px] leading-[17.25px] text-muted-foreground">{label}</span>
      <span className="min-w-0 text-end text-[13.5px] leading-[20.25px] text-foreground">{value}</span>
    </div>
  )
  const control = (node: React.ReactNode) => <div className="w-[237px] max-w-full">{node}</div>
  const reassign = <span className="inline-flex items-center gap-1"><UserCog className="size-3" />{t("Reassign:", "إعادة إسناد:")}</span>

  return (
    <section className="panel rounded-[12px] px-4 py-5">
      <CardTitle icon={Info}>{t("Details", "التفاصيل")}</CardTitle>
      <div className={cn("mt-[18px] overflow-hidden rounded-[8px] bg-background", edit && "mb-6")}>
        {row(t("Report Title", "عنوان البلاغ"), o(r.title))}
        {row(t("Description", "وصف"), o(r.description))}
        {row(t("Report No.", "رقم البلاغ"), <span dir="ltr">#{r.id}</span>)}
        {row(t("Request opened on", "تم فتح الطلب في"), <span dir="ltr">{r.openedOn}</span>)}
        {row(t("Request created by", "تم إنشاء الطلب بواسطة"), r.anonymous
          ? <span className="text-muted-foreground">{o(ANONYMOUS)}</span>
          : o(r.createdBy))}
        {edit
          ? row(t("Request Status", "حالة الطلب"), control(
              <SelectInput value={status} onChange={(v) => setStatus(v as ViolationStatus)} className="[&_select]:bg-card [&_select]:text-[12.5px] [&_select]:font-medium [&>button]:bg-card [&>button]:text-[12.5px] [&>button]:font-medium"
                options={(Object.keys(statusOptions) as ViolationStatus[]).map((s) => ({ value: s, label: o(statusOptions[s]) }))} />))
          : row(t("Request Status", "حالة الطلب"), o(statusOptions[r.status]))}
        {edit
          ? row(t("Assigned to Department", "مسند للإدارة"), control(
              <SelectInput value={dept} onChange={setDept} prefix={reassign} className="[&_select]:bg-card [&_select]:text-[12.5px] [&_select]:font-medium [&>button]:bg-card [&>button]:text-[12.5px] [&>button]:font-medium"
                options={departments.map((d) => ({ value: d.id, label: o(d), alt: `${d.en} ${d.ar}` }))} searchable />))
          : row(t("Assigned to Department", "مسند للإدارة"), o(deptById(r.assignedDeptId)))}
        {edit
          ? row(t("Assigned to Employee", "مسند للموظف"), control(
              <SelectInput value={to} onChange={setTo} prefix={reassign} className="[&_select]:bg-card [&_select]:text-[12.5px] [&_select]:font-medium [&>button]:bg-card [&>button]:text-[12.5px] [&>button]:font-medium"
                options={people.map((p) => ({ value: p.id, label: o(p), alt: `${p.en} ${p.ar}` }))} searchable />))
          : row(t("Assigned to Employee", "مسند للموظف"), o(personById(r.assignedToId)))}
        {edit
          ? row(t("Is legal consultation needed?", "هل يوجد حاجة للاستشارة القانونية"), control(
              <SelectInput value={legal} onChange={(v) => setLegal(v as "yes" | "no")} className="[&_select]:bg-card [&_select]:text-[12.5px] [&_select]:font-medium [&>button]:bg-card [&>button]:text-[12.5px] [&>button]:font-medium"
                options={yesNo.map((y) => ({ value: y.id, label: o(y) }))} />), true)
          : row(t("Is legal consultation needed?", "هل يوجد حاجة للاستشارة القانونية"), o(yesNo.find((y) => y.id === r.legalConsultation)), true)}
      </div>
      {edit && (
        <div className="flex flex-wrap items-center gap-4">
          {/* Figma draws Save at full strength; with nothing changed it is a no-op. */}
          <GoldButton onClick={save}>{t("Save Changes", "حفظ التعديلات")}</GoldButton>
          <OutlineButton className="min-w-[84px]" onClick={() => navigate("/services/violations/queue")}>{t("Cancel", "إلغاء")}</OutlineButton>
        </div>
      )}
    </section>
  )
}

// ── إدارة المستندات الأدلة والمخالفات ───────────────────────────────────────
function Documents({ r, byReporter, autoUpload }: { r: ViolationReport; byReporter: boolean; autoUpload: boolean }) {
  const { t, isAr, o } = useT()
  const fileRef = React.useRef<HTMLInputElement>(null)
  const [folder, setFolder] = React.useState(r.folders.find((f) => f.id === "evidence") ? "evidence" : "root")
  const [query, setQuery] = React.useState("")
  const [type, setType] = React.useState("")
  const [owner, setOwner] = React.useState("")
  const [sort, setSort] = React.useState("")
  const [newFolder, setNewFolder] = React.useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = React.useState<string | null>(null)
  const [highlight, setHighlight] = React.useState(autoUpload)
  const Sep = isAr ? ChevronLeft : ChevronRight

  React.useEffect(() => {
    if (!autoUpload) return
    const h = window.setTimeout(() => setHighlight(false), 2500)
    return () => window.clearTimeout(h)
  }, [autoUpload])

  const path: typeof r.folders = []
  for (let f = r.folders.find((x) => x.id === folder); f; f = r.folders.find((x) => x.id === f!.parent)) path.unshift(f)
  const subfolders = r.folders.filter((f) => f.parent === folder)
  const countIn = (id: string) => ({
    folders: r.folders.filter((f) => f.parent === id).length,
    files: r.docs.filter((d) => d.folderId === id).length,
  })

  let docs = r.docs.filter((d) => d.folderId === folder)
    .filter((d) => !query.trim() || d.name.toLowerCase().includes(query.trim().toLowerCase()))
    .filter((d) => !type || d.type === type)
    .filter((d) => !owner || d.ownerId === owner)
  if (sort === "name") docs = [...docs].sort((a, b) => a.name.localeCompare(b.name))
  if (sort === "size") docs = [...docs].sort((a, b) => b.sizeKb - a.sizeKb)
  if (sort === "newest") docs = [...docs].sort((a, b) => a.uploadedOrder - b.uploadedOrder)
  const owners = [...new Set(r.docs.map((d) => d.ownerId))]

  const size = (kb: number) => (kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`)
  const filesLabel = (n: { folders: number; files: number }) => isAr
    ? `${n.folders} مجلدات · ${n.files === 1 ? "ملف واحد" : `${n.files} ملفات`}`
    : `${n.folders} folder${n.folders === 1 ? "" : "s"} · ${n.files} file${n.files === 1 ? "" : "s"}`

  return (
    <section className={cn("panel rounded-[12px] px-6 py-5 transition-shadow", highlight && "shadow-[inset_0_0_0_1px_var(--primary)]")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <CardTitle icon={FolderOpen}>{t("Manage Evidence Documents & Violations", "إدارة المستندات الأدلة والمخالفات")}</CardTitle>
        <div className="flex items-center gap-3">
          <OutlineButton size="sm" className="w-[108px]" onClick={() => fileRef.current?.click()}>
            <FileUp className="size-3.5" />{t("Upload Document", "رفع مستند")}
          </OutlineButton>
          <GoldButton size="sm" className="w-[108px] px-2" onClick={() => setNewFolder("")}>
            <Plus className="size-3" />{t("New Folder", "مجلد جديد")}
          </GoldButton>
          <input ref={fileRef} type="file" multiple hidden
            onChange={(e) => { const f = Array.from(e.target.files ?? []); if (f.length) addDocuments(r.id, f, folder, byReporter); e.target.value = "" }} />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {/* search + filters */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex h-9 min-w-[200px] flex-1 items-center gap-2 rounded-[8px] bg-background pe-3 ps-2 sm:max-w-[297px]">
            <Search className="size-4 shrink-0 text-icon" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("Search", "البحث")}
              className="h-full min-w-0 flex-1 bg-transparent text-[12px] text-foreground outline-none placeholder:text-foreground/90" />
          </label>
          {[
            { v: type, set: setType, ph: t("Type", "النوع"), opts: ["PDF", "IMG", "DOC"].map((x) => ({ value: x, label: x })) },
            { v: owner, set: setOwner, ph: t("Owner", "المالك"), opts: owners.map((id) => ({ value: id, label: o(authorOf(id)), alt: `${authorOf(id)?.en ?? ""} ${authorOf(id)?.ar ?? ""}` })), people: true },
            { v: sort, set: setSort, ph: t("Sort by", "الترتيب حسب"), opts: [
              { value: "newest", label: t("Newest", "الأحدث") }, { value: "name", label: t("Name", "الاسم") }, { value: "size", label: t("Size", "الحجم") }] },
          ].map((f, i) => (
            <SelectInput key={i} value={f.v} onChange={f.set} placeholder={f.ph} options={f.opts} searchable={"people" in f}
              className="w-[120px] [&_select]:bg-card [&_select]:text-[12.5px] [&_select]:font-medium [&>button]:bg-card [&>button]:text-[12.5px] [&>button]:font-medium" />
          ))}
        </div>

        {/* folder breadcrumb */}
        <nav aria-label={t("Folder path", "مسار المجلد")} className="flex flex-wrap items-center gap-2 pe-2 text-[10px] leading-[14px] text-foreground">
          {path.map((f, i) => (
            <React.Fragment key={f.id}>
              {i > 0 && <Sep className="size-3 opacity-60" aria-hidden />}
              {i === path.length - 1
                ? <span className="font-bold">{o(f.name)}</span>
                : <button type="button" onClick={() => setFolder(f.id)} className="hover:text-primary">{o(f.name)}</button>}
            </React.Fragment>
          ))}
        </nav>

        {/* sub-folders */}
        {(subfolders.length > 0 || newFolder !== null) && (
          <div className="grid gap-3 pt-4 sm:grid-cols-2 xl:grid-cols-3">
            {subfolders.map((f) => (
              <button key={f.id} type="button" onClick={() => setFolder(f.id)}
                className="flex h-[62px] items-center gap-3 rounded-[8px] bg-background p-3.5 text-start transition-colors hover:bg-secondary/40">
                <span className="inline-flex size-[34px] shrink-0 items-center justify-center rounded-[8px] bg-primary/25 text-primary"><FolderOpen className="size-4" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[11.9px] font-medium leading-[13px] text-foreground">{o(f.name)}</span>
                  <span className="mt-[5px] block text-[10.8px] leading-[11.5px] text-muted-foreground">{filesLabel(countIn(f.id))}</span>
                </span>
                <Sep className="size-3 text-icon" />
              </button>
            ))}
            {newFolder !== null && (
              <form className="flex h-[62px] items-center gap-2 rounded-[8px] bg-background p-2.5"
                onSubmit={(e) => { e.preventDefault(); if (newFolder.trim()) { addFolder(r.id, newFolder.trim(), folder); setNewFolder(null) } }}>
                <FolderPlus className="size-4 shrink-0 text-primary" />
                <TextInput autoFocus value={newFolder} onChange={(e) => setNewFolder(e.target.value)} placeholder={t("Folder name", "اسم المجلد")} className="h-8 bg-card" />
                <GoldButton type="submit" size="sm" className="px-3">{t("Add", "إضافة")}</GoldButton>
                <button type="button" onClick={() => setNewFolder(null)} className="text-[11px] text-muted-foreground hover:text-foreground">{t("Cancel", "إلغاء")}</button>
              </form>
            )}
          </div>
        )}

        {/* مستندات هذا المجلد */}
        <div className="pt-6">
          <h3 className="mb-[9px] text-[14px] font-medium text-foreground">{t("Documents in this folder", "مستندات هذا المجلد")}</h3>
          <div className="overflow-x-auto border-t border-secondary">
            {/* Figma columns: type 69 · name 155 · owner 126 · size 98 · date (rest) · actions 126. */}
            <table className="w-full min-w-[560px] table-fixed text-start">
              <colgroup><col className="w-[69px]" /><col className="w-[155px]" /><col className="w-[126px]" /><col className="w-[98px]" /><col /><col className="w-[126px]" /></colgroup>
              <thead>
                <tr className="border-b border-secondary text-[11.5px] text-muted-foreground">
                  <th />
                  <th className="py-[10px] text-start font-normal">{t("File Name", "اسم الملف")}</th>
                  <th className="py-[10px] text-start font-normal">{t("Owner", "المالك")}</th>
                  <th className="py-[10px] text-start font-normal">{t("File Size", "حجم الملف")}</th>
                  <th className="py-[10px] text-start font-normal">{t("Upload Date", "تاريخ الرفع")}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {docs.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 text-center text-[12px] text-muted-foreground">
                    {query || type || owner ? t("No documents match these filters.", "لا توجد مستندات مطابقة.") : t("No documents in this folder yet.", "لا توجد مستندات في هذا المجلد بعد.")}
                  </td></tr>
                ) : docs.map((d) => (
                  <DocRow key={d.id} d={d} size={size(d.sizeKb)} confirming={confirmDelete === d.id}
                    onDelete={() => setConfirmDelete(d.id)} onCancel={() => setConfirmDelete(null)}
                    onConfirm={() => { removeDocument(r.id, d.id); setConfirmDelete(null) }} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}

function DocRow({ d, size, confirming, onDelete, onCancel, onConfirm }: {
  d: Doc; size: string; confirming: boolean; onDelete: () => void; onCancel: () => void; onConfirm: () => void
}) {
  const { t, o, isAr } = useT()
  const tile = "grid size-[34px] place-items-center rounded-[8px] border border-secondary text-foreground transition-colors hover:bg-secondary/60"
  return (
    <tr className="text-foreground">
      <td className="py-3 pe-3">
        <span className={cn("inline-flex h-[31px] w-9 items-center justify-center rounded text-[10px] font-semibold",
          d.type === "PDF" ? "bg-error/25 text-error" : d.type === "IMG" ? "bg-success-fill text-success" : "bg-info-fill text-info")}>{d.type}</span>
      </td>
      <td className="py-3 text-[11.5px]">{isAr ? d.name : d.nameEn ?? d.name}</td>
      <td className="py-3 text-[10.9px]">{o(authorOf(d.ownerId))}</td>
      <td className="py-3 text-[12px]"><span dir="ltr">{size}</span></td>
      <td className="py-3 text-[10.7px]">{o(d.uploaded)}</td>
      <td className="py-3">
        {confirming ? (
          <div role="alertdialog" aria-label={t("Delete this file?", "حذف هذا الملف؟")} className="flex items-center justify-end gap-1.5 text-[11px]">
            <span>{t("Delete?", "حذف؟")}</span>
            <button type="button" onClick={onConfirm} className="rounded-[6px] bg-error-fill px-2 py-1 font-semibold text-error">{t("Yes", "نعم")}</button>
            <button type="button" onClick={onCancel} className="rounded-[6px] border border-secondary px-2 py-1">{t("No", "لا")}</button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-3">
            {/* Figma order from the inline start: delete, view, download. */}
            <button type="button" onClick={onDelete} className={cn(tile, "text-error")} aria-label={t("Delete", "حذف")}><Trash2 className="size-4" /></button>
            <button type="button" className={tile} aria-label={t("View", "عرض")}><Eye className="size-4" /></button>
            <button type="button" className={tile} aria-label={t("Download", "تنزيل")}><Download className="size-4" /></button>
          </div>
        )}
      </td>
    </tr>
  )
}

// ── التعليقات ────────────────────────────────────────────────────────────────
function Comments({ r, authorId }: { r: ViolationReport; authorId: string }) {
  const { t, o, isAr } = useT()
  /** Avatar letters: the Arabic initial, or the first letter(s) of the English name (Figma EN). */
  const initials = (a: { en: string; initial: string }, n = 1) =>
    isAr ? a.initial : a.en.split(/[\s-]+/).filter(Boolean).map((w) => w[0]).join("").slice(0, n).toUpperCase()
  const [text, setText] = React.useState("")
  const me = authorOf(authorId)
  const send = () => { if (!text.trim()) return; addComment(r.id, authorId, text.trim()); setText("") }

  return (
    <section className="panel rounded-[12px] px-4 py-5">
      <CardTitle icon={MessagesSquare}>{t("Comments", "التعليقات")}</CardTitle>
      <div className="mt-[18px] flex flex-col gap-6">
        {r.comments.length === 0 ? (
          <p className="py-4 text-center text-[12px] text-muted-foreground">{t("No comments yet.", "لا توجد تعليقات بعد.")}</p>
        ) : (
          <ul>
            {r.comments.map((c, i) => {
              // the reporter's own comments stay anonymous on an anonymous report
              const a = c.authorId === "me" && r.anonymous ? { ...ANONYMOUS, initial: "؟" } : authorOf(c.authorId)
              return (
                <li key={c.id} className={cn("flex items-center gap-0 py-2", i < r.comments.length - 1 && "border-b border-secondary")}>
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-[13px] text-foreground">{initials(a)}</span>
                  <span className="flex w-5 shrink-0 justify-center self-start pt-2">
                    {c.unread && <span className="size-1.5 rounded-full bg-primary" aria-label={t("Unread", "غير مقروء")} />}
                  </span>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="text-[13.5px] leading-[20.25px] text-foreground">{o(a)}</div>
                    <div className="text-[12.5px] leading-[18.75px] text-muted-foreground">{o(c.text)}</div>
                  </div>
                  <span className="shrink-0 self-center text-[12px] leading-[18px] text-muted-foreground">{o(c.time)}</span>
                </li>
              )
            })}
          </ul>
        )}
        <form className="flex items-center gap-4" onSubmit={(e) => { e.preventDefault(); send() }}>
          <label className="flex h-10 min-w-0 flex-1 items-center gap-3 rounded-[8px] border border-secondary bg-background px-4 py-1">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-[12px] text-foreground">
              {authorId === "me" && r.anonymous ? "؟" : initials(me.initial ? me : ME, 2)}
            </span>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder={t("Add a comment…", "أضف تعليقًا…")}
              className="h-full min-w-0 flex-1 bg-transparent text-[13px] font-medium text-foreground outline-none placeholder:text-foreground/90" />
          </label>
          <GoldButton type="submit" className="h-10 px-6 font-medium">{t("Send", "إرسال")}</GoldButton>
        </form>
      </div>
    </section>
  )
}
