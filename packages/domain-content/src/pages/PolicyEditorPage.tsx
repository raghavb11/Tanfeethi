import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  Button, Card, Input, Textarea,
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@reach/shared-ui"
import { useShell } from "@reach/shell-context"
import { cn } from "@reach/shared-core"
import { ArrowLeft, CalendarClock, Check, ChevronsUpDown, Hash, Infinity as InfinityIcon, Library, Scale, Search, Trash2, Upload, Users, X } from "lucide-react"

import { CategoryBadge, DepartmentPicker, SearchSelect as SearchSelectPlain } from "./_ui"
import { RichTextEditor } from "./RichTextEditor"
import { addPolicy, deletePolicy, getPolicyById, markSuperseded, POLICY_CATS, policyBody, policyCatAr, policyCatColor, suggestPolicyNumber, updatePolicy, usePolicies } from "../data/policies"
import { affectedCount, OWNER_TEAMS } from "../data/departments"
import { addDocument, type Doc, TYPE_STYLE, useDocuments } from "../data/documents"
import { logAudit } from "../data/audit"

const EDIT_CATS = POLICY_CATS.filter((c) => c !== "All")
const TODAY = "Aug 12, 2026"
const TODAY_AR = "١٢ أغسطس ٢٠٢٦"
const TODAY_ISO = "2026-08-12"

/** Lightweight searchable single-select combobox (no dependency on a popover
 *  primitive). Used for picking the superseded policy from a long list. */
function SearchSelect({ value, onChange, options, placeholder, searchPlaceholder, noneLabel, emptyLabel }: {
  value: string
  onChange: (id: string) => void
  options: { id: string; label: string }[]
  placeholder: string
  searchPlaceholder: string
  noneLabel: string
  emptyLabel: string
}) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const ref = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", onDoc)
    const id = window.setTimeout(() => inputRef.current?.focus(), 0)
    return () => { document.removeEventListener("mousedown", onDoc); window.clearTimeout(id) }
  }, [open])

  const selected = options.find((o) => o.id === value)
  const filtered = query.trim() ? options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase())) : options
  const pick = (id: string) => { onChange(id); setOpen(false); setQuery("") }

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-input bg-[var(--card-elevated)] px-3 text-start text-sm outline-none focus:border-primary/60">
        <span className={cn("truncate", !selected && "text-muted-foreground")}>{selected ? selected.label : placeholder}</span>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder={searchPlaceholder} className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            <button type="button" onClick={() => pick("")} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-start text-sm text-muted-foreground transition-colors hover:bg-muted">
              <span className="size-4 shrink-0">{!value && <Check className="size-4 text-primary" />}</span>{noneLabel}
            </button>
            {filtered.map((o) => (
              <button key={o.id} type="button" onClick={() => pick(o.id)} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-start text-sm transition-colors hover:bg-muted">
                <span className="size-4 shrink-0">{value === o.id && <Check className="size-4 text-primary" />}</span>
                <span className="truncate">{o.label}</span>
              </button>
            ))}
            {filtered.length === 0 && <div className="px-2.5 py-6 text-center text-sm text-muted-foreground">{emptyLabel}</div>}
          </div>
        </div>
      )}
    </div>
  )
}

export default function PolicyEditorPage() {
  const { locale, role } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const { id } = useParams()
  const all = usePolicies()
  const editing = id ? getPolicyById(id) : undefined
  const docs = useDocuments()

  const [title, setTitle] = React.useState(editing?.title ?? "")
  const [number, setNumber] = React.useState(editing?.number ?? suggestPolicyNumber(all))
  const [summary, setSummary] = React.useState(editing?.summary ?? "")
  const [body, setBody] = React.useState(editing ? policyBody(editing, isAr) : "")
  const [relatedDocs, setRelatedDocs] = React.useState<string[]>(editing?.relatedDocs ?? [])
  const [applicableFrom, setApplicableFrom] = React.useState(editing?.applicableFrom ?? TODAY_ISO)
  const [indefinite, setIndefinite] = React.useState(editing ? !editing.applicableTill : true)
  const [applicableTill, setApplicableTill] = React.useState(editing?.applicableTill ?? "")
  const [categories, setCategories] = React.useState<string[]>(editing?.categories ?? [])
  const [allDepartments, setAllDepartments] = React.useState<boolean>(editing?.allDepartments ?? true)
  const [departments, setDepartments] = React.useState<string[]>(editing?.departments ?? [])
  const [version, setVersion] = React.useState(editing?.version ?? "v1.0")
  const [owner, setOwner] = React.useState(editing?.owner ?? "Legal & Compliance")
  const [featured, setFeatured] = React.useState(editing?.featured ?? false)
  const [requiresAck, setRequiresAck] = React.useState(editing?.requiresAck ?? false)
  const [supersedesId, setSupersedesId] = React.useState(editing?.supersedes ?? "")
  const [sunsetOld, setSunsetOld] = React.useState(true)
  const [confirmDelete, setConfirmDelete] = React.useState(false)

  React.useEffect(() => { if (role !== "admin") navigate("/policies", { replace: true }) }, [role, navigate])

  const canSave = title.trim().length > 0
  const availableCats = EDIT_CATS.filter((c) => !categories.includes(c))
  const availableDocs = docs.filter((d) => !relatedDocs.includes(d.id))
  const affected = affectedCount(departments, allDepartments)
  const others = all.filter((p) => p.id !== editing?.id)
  const supersedeTarget = all.find((p) => p.id === supersedesId)

  const fileRef = React.useRef<HTMLInputElement>(null)
  const onUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const added: string[] = []
    Array.from(files).forEach((f, i) => {
      const ext = f.name.split(".").pop()?.toUpperCase()
      const type: Doc["type"] = ext === "XLSX" || ext === "XLS" ? "XLSX" : ext === "DOCX" || ext === "DOC" ? "DOCX" : "PDF"
      const kb = f.size / 1024
      const size = kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(kb))} KB`
      const id = `doc-${Date.now()}-${i}`
      const base = f.name.replace(/\.[^.]+$/, "")
      const who = owner.trim() || "Legal & Compliance"
      addDocument({ id, name: base, nameAr: base, folder: "corp", type, size, dept: who, deptAr: who, updated: TODAY, updatedAr: TODAY_AR, ver: "v1", downloads: 0, owner: who, ownerAr: who })
      added.push(id)
    })
    setRelatedDocs((prev) => [...prev, ...added])
    if (fileRef.current) fileRef.current.value = ""
  }

  const save = () => {
    const ttl = title.trim()
    if (!ttl) return
    const pid = editing ? editing.id : `pol-${Date.now()}`
    const num = number.trim() || suggestPolicyNumber(all)
    const fields = {
      title: ttl, titleAr: ttl, number: num, categories, allDepartments, departments,
      version: version.trim() || "v1.0", owner: owner.trim(), ownerAr: owner.trim(),
      summary: summary.trim(), summaryAr: summary.trim(), body, relatedDocs, featured, requiresAck,
      applicableFrom, applicableTill: indefinite ? null : (applicableTill || null),
      supersedes: supersedesId || null,
    }
    if (editing) { updatePolicy(pid, fields); logAudit("edited", `${num} ${ttl}`, "Policies") }
    else { addPolicy({ id: pid, effective: TODAY, effectiveAr: TODAY_AR, acknowledgedBy: [], status: "active", supersededBy: null, ...fields }); logAudit("published", `${num} ${ttl}`, "Policies") }
    if (supersedesId) markSuperseded(supersedesId, pid, sunsetOld)
    navigate("/policies")
  }
  const remove = () => { if (editing) { deletePolicy(editing.id); logAudit("deleted", `${editing.number} ${editing.title}`, "Policies") } navigate("/policies") }

  const label = (text: React.ReactNode) => <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">{text}</label>

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => navigate("/policies")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />{t("Back to policies", "العودة إلى السياسات")}
        </button>
        <div className="flex items-center gap-2">
          {editing && <Button variant="ghost" onClick={() => setConfirmDelete(true)} className="text-destructive hover:bg-destructive/10 hover:text-destructive"><Trash2 className="size-4" />{t("Delete", "حذف")}</Button>}
          <Button variant="outline" onClick={() => navigate("/policies")}>{t("Cancel", "إلغاء")}</Button>
          <Button disabled={!canSave} onClick={save}>{editing ? t("Save changes", "حفظ التغييرات") : t("Publish policy", "نشر السياسة")}</Button>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-2 text-primary">
        <Scale className="size-4" />
        <span className="text-xs font-semibold uppercase tracking-[0.14em]">{editing ? `${t("Edit policy", "تحرير السياسة")} · ${editing.number}` : `${t("New policy", "سياسة جديدة")} · ${number}`}</span>
      </div>

      <div className="space-y-5">
        <Card className="space-y-5 p-6 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
            <div>{label(t("Title", "العنوان"))}<Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("Policy title", "عنوان السياسة")} autoFocus className="h-11 text-base" /></div>
            <div>{label(<span className="inline-flex items-center gap-1.5"><Hash className="size-3.5 text-primary" />{t("Policy number", "رقم السياسة")}</span>)}<Input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="TF-POL-###" className="h-11 font-mono text-sm" /></div>
          </div>
          <div>{label(t("Summary", "الملخص"))}<Textarea rows={2} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder={t("One or two lines describing the policy", "سطر أو سطران يصفان السياسة")} className="text-[15px] leading-relaxed" /></div>

          {/* category chips */}
          <div>
            {label(t("Categories (select one or more)", "الفئات (اختر واحدة أو أكثر)"))}
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((c) => {
                const color = policyCatColor(c) ?? "#8a8a8a"
                return (
                  <span key={c} className="inline-flex items-center gap-1.5 rounded-full border py-1 pe-1.5 ps-2.5 text-sm font-medium" style={{ backgroundColor: `${color}22`, color, borderColor: `${color}55` }}>
                    <span className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
                    {isAr ? policyCatAr(c) : c}
                    <button type="button" aria-label={`${t("Remove", "إزالة")} ${c}`} onClick={() => setCategories(categories.filter((x) => x !== c))} className="grid size-4 place-items-center rounded-full hover:bg-black/10 dark:hover:bg-white/10"><X className="size-3" /></button>
                  </span>
                )
              })}
              {availableCats.length > 0 && (
                <select value="" onChange={(e) => { if (e.target.value) setCategories([...categories, e.target.value]) }} className="h-8 rounded-full border border-dashed border-border bg-transparent px-3 text-sm text-muted-foreground outline-none hover:border-primary/60 focus:border-primary/60">
                  <option value="">{t("+ Add category", "+ إضافة فئة")}</option>
                  {availableCats.map((c) => <option key={c} value={c}>{isAr ? policyCatAr(c) : c}</option>)}
                </select>
              )}
            </div>
          </div>

          {/* departments + affected */}
          <div>
            {label(t("Applies to which departments?", "على أي إدارات تُطبّق؟"))}
            <DepartmentPicker all={allDepartments} ids={departments} onToggleAll={setAllDepartments} onToggleDept={(dId) => setDepartments(departments.includes(dId) ? departments.filter((x) => x !== dId) : [...departments, dId])} isAr={isAr} />
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground"><Users className="size-4 text-primary" />{t("Affects", "يؤثّر على")} <span className="font-semibold text-foreground">{affected.toLocaleString()}</span> {t("employees", "موظف")}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>{label(t("Version", "الإصدار"))}<Input value={version} onChange={(e) => setVersion(e.target.value)} className="h-11" /></div>
            <div>{label(t("Owner", "المالك"))}
              <SearchSelectPlain
                value={owner}
                onChange={setOwner}
                options={OWNER_TEAMS}
                placeholder={t("Select an owning team…", "اختر الجهة المالكة…")}
                searchPlaceholder={t("Search teams…", "ابحث عن جهة…")}
                emptyLabel={t("No teams match", "لا توجد نتائج")}
              />
            </div>
          </div>

          {/* applicable period */}
          <div className="border-t border-border/60 pt-4">
            {label(<span className="inline-flex items-center gap-1.5"><CalendarClock className="size-3.5 text-primary" />{t("Applicable period", "فترة السريان")}</span>)}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <span className="mb-1 block text-xs text-muted-foreground">{t("Applicable from", "ساري من")}</span>
                <Input type="date" value={applicableFrom} onChange={(e) => setApplicableFrom(e.target.value)} className="h-11" />
              </div>
              <div>
                <span className="mb-1 block text-xs text-muted-foreground">{t("Applicable till", "ساري حتى")}</span>
                {indefinite ? (
                  <div className="flex h-11 items-center gap-1.5 rounded-lg border border-dashed border-border bg-muted/30 px-3 text-sm text-muted-foreground"><InfinityIcon className="size-4 text-primary" />{t("Indefinitely — no end date", "بلا نهاية — دون تاريخ انتهاء")}</div>
                ) : (
                  <Input type="date" value={applicableTill} min={applicableFrom} onChange={(e) => setApplicableTill(e.target.value)} className="h-11" />
                )}
              </div>
            </div>
            <label className="mt-2 inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={indefinite} onChange={(e) => setIndefinite(e.target.checked)} className="size-4 accent-[var(--primary)]" />
              {t("No end date (applies indefinitely)", "دون تاريخ انتهاء (يسري بلا نهاية)")}
            </label>
          </div>

          <div className="flex flex-col gap-3 border-t border-border/60 pt-4">
            <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="size-4 accent-[var(--primary)]" />{t("Mark as essential reading", "وضع علامة كقراءة أساسية")}</label>
            <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={requiresAck} onChange={(e) => setRequiresAck(e.target.checked)} className="size-4 accent-[var(--primary)]" />{t("Require all affected employees to read & acknowledge this policy", "طلب من جميع الموظفين المتأثرين قراءة السياسة والإقرار بها")}</label>
          </div>

          {/* supersede */}
          <div className="border-t border-border/60 pt-4">
            {label(t("Supersedes a previous policy? (optional)", "هل تحلّ محل سياسة سابقة؟ (اختياري)")) }
            <SearchSelect
              value={supersedesId}
              onChange={setSupersedesId}
              options={others.map((p) => ({ id: p.id, label: `${p.number} · ${isAr ? p.titleAr : p.title}` }))}
              placeholder={t("— None —", "— لا شيء —")}
              searchPlaceholder={t("Search by number or title…", "ابحث بالرقم أو العنوان…")}
              noneLabel={t("— None —", "— لا شيء —")}
              emptyLabel={t("No matching policies", "لا توجد سياسات مطابقة")}
            />
            {supersedeTarget && (
              <div className="mt-3 rounded-xl border border-border bg-muted/30 p-3 text-sm">
                <p className="mb-2 text-muted-foreground">{t("What happens to", "ماذا يحدث لـ")} <span className="font-medium text-foreground">{supersedeTarget.number} {isAr ? supersedeTarget.titleAr : supersedeTarget.title}</span>?</p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setSunsetOld(false)} className={cn("rounded-lg border px-3 py-1.5 text-sm transition-colors", !sunsetOld ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/60")}>{t("Remains effective", "يبقى ساريًا")}</button>
                  <button type="button" onClick={() => setSunsetOld(true)} className={cn("rounded-lg border px-3 py-1.5 text-sm transition-colors", sunsetOld ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/60")}>{t("Sunset (no longer effective)", "إيقاف (لم يعد ساريًا)")}</button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* rich text body */}
        <div>
          {label(t("Policy text", "نص السياسة"))}
          <RichTextEditor initialHTML={body} onChange={setBody} dir={isAr ? "rtl" : "ltr"} placeholder={t("Write the full policy — headings, sections, lists…", "اكتب السياسة كاملة — عناوين، أقسام، قوائم…")} />
        </div>

        {/* attached documents (visible to users) */}
        <Card className="p-6 sm:p-8">
          {label(t("Attached documents (visible to employees)", "المستندات المرفقة (مرئية للموظفين)"))}
          <p className="-mt-1 mb-3 text-xs text-muted-foreground">{t("Add supporting files — employees will see and can open these on the policy page. Upload a new file, or attach one from the document library.", "أضف ملفات داعمة — سيراها الموظفون ويمكنهم فتحها في صفحة السياسة. ارفع ملفًا جديدًا أو أرفق ملفًا من مكتبة المستندات.")}</p>

          <div className="space-y-2">
            {relatedDocs.map((did) => {
              const d = docs.find((x) => x.id === did)
              return (
                <div key={did} className="flex items-center gap-2.5 rounded-lg border border-border bg-[var(--card-elevated)] px-3 py-2 text-sm">
                  <span className={cn("flex size-7 shrink-0 items-center justify-center rounded text-[9px] font-bold text-white", d ? TYPE_STYLE[d.type] : "bg-muted-foreground")}>{d?.type ?? "?"}</span>
                  <span className="min-w-0 flex-1 truncate">{d ? (isAr ? d.nameAr : d.name) : t("(document removed)", "(مستند محذوف)")}</span>
                  {d && <span className="shrink-0 text-xs text-muted-foreground">{d.size}</span>}
                  <button type="button" aria-label={t("Remove", "إزالة")} onClick={() => setRelatedDocs(relatedDocs.filter((x) => x !== did))} className="grid size-5 shrink-0 place-items-center rounded hover:bg-muted"><X className="size-3.5" /></button>
                </div>
              )
            })}
          </div>

          <input ref={fileRef} type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx" className="hidden" onChange={(e) => onUpload(e.target.files)} />
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {/* option 1 — upload */}
            <button type="button" onClick={() => fileRef.current?.click()} className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-[var(--card-elevated)] px-4 py-5 text-center transition-colors hover:border-primary/60 hover:bg-primary/[0.03]">
              <Upload className="size-5 text-primary" />
              <span className="text-sm font-medium">{t("Upload a file", "رفع ملف")}</span>
              <span className="text-xs text-muted-foreground">{t("PDF, Word or Excel", "PDF أو Word أو Excel")}</span>
            </button>

            {/* option 2 — attach from library */}
            <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-[var(--card-elevated)] px-4 py-5 text-center">
              <Library className="size-5 text-primary" />
              <span className="text-sm font-medium">{t("Attach from library", "إرفاق من المكتبة")}</span>
              {availableDocs.length > 0 ? (
                <select value="" onChange={(e) => { if (e.target.value) setRelatedDocs([...relatedDocs, e.target.value]) }} className="mt-1 h-9 w-full max-w-[16rem] rounded-lg border border-border bg-card px-2 text-sm text-muted-foreground outline-none hover:border-primary/60 focus:border-primary/60">
                  <option value="">{t("Choose a document…", "اختر مستندًا…")}</option>
                  {availableDocs.map((d) => <option key={d.id} value={d.id}>{isAr ? d.nameAr : d.name} · {d.type}</option>)}
                </select>
              ) : (
                <span className="text-xs text-muted-foreground">{t("All library documents attached", "تم إرفاق جميع مستندات المكتبة")}</span>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* live category preview */}
      {categories.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{t("Preview:", "معاينة:")}</span>
          {categories.map((c) => <CategoryBadge key={c} label={isAr ? policyCatAr(c) : c} color={policyCatColor(c)} />)}
        </div>
      )}

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        {confirmDelete && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>{t("Delete this policy?", "حذف هذه السياسة؟")}</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">{t("This removes the policy from the library. This can't be undone.", "سيؤدي هذا إلى إزالة السياسة من المكتبة. لا يمكن التراجع.")}</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDelete(false)}>{t("Cancel", "إلغاء")}</Button>
              <Button className="bg-destructive text-white hover:bg-destructive/90" onClick={remove}><Trash2 className="size-4" />{t("Delete", "حذف")}</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </main>
  )
}
