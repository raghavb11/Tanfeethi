import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  Badge, Button, Card, Input,
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@reach/shared-ui"
import { useShell } from "@reach/shell-context"
import { cn } from "@reach/shared-core"
import { ArrowLeft, FileText, HelpCircle, Link2, Plus, Trash2, X } from "lucide-react"

import { CategoryBadge, DepartmentPicker, RICH_PROSE } from "./_ui"
import { RichTextEditor } from "./RichTextEditor"
import { addFaq, deleteFaq, type FaqLink, getFaqById, newFaqId, updateFaq } from "../data/faqs"
import { findCategory, useCategories } from "../data/faqCategories"
import { TYPE_STYLE, useDocuments } from "../data/documents"
import { logAudit } from "../data/audit"

export default function FAQEditorPage() {
  const { locale, role } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const { id } = useParams()
  const editing = id ? getFaqById(id) : undefined
  const docs = useDocuments()
  const cats = useCategories()
  const catLabel = (name: string) => (isAr ? findCategory(cats, name)?.nameAr ?? name : name)

  const [q, setQ] = React.useState(editing?.q ?? "")
  const [a, setA] = React.useState(editing?.a ?? "")
  const [categories, setCategories] = React.useState<string[]>(editing?.categories ?? [])
  const [allDepartments, setAllDepartments] = React.useState<boolean>(editing?.allDepartments ?? true)
  const [departments, setDepartments] = React.useState<string[]>(editing?.departments ?? [])
  const [relatedDocs, setRelatedDocs] = React.useState<string[]>(editing?.relatedDocs ?? [])
  const [links, setLinks] = React.useState<FaqLink[]>(editing?.relatedLinks ?? [])
  const [linkLabel, setLinkLabel] = React.useState("")
  const [linkUrl, setLinkUrl] = React.useState("")
  const [confirmDelete, setConfirmDelete] = React.useState(false)

  React.useEffect(() => { if (role !== "admin") navigate("/faqs", { replace: true }) }, [role, navigate])

  const canSave = q.trim().length > 0
  const availableCats = cats.map((c) => c.name).filter((c) => !categories.includes(c))
  const availableDocs = docs.filter((d) => !relatedDocs.includes(d.id))

  const addLink = () => {
    const label = linkLabel.trim()
    const url = linkUrl.trim()
    if (!label || !url) return
    setLinks([...links, { label, url }])
    setLinkLabel("")
    setLinkUrl("")
  }

  const save = () => {
    const question = q.trim()
    if (!question) return
    const fields = { q: question, qAr: question, a: a.trim(), aAr: a.trim(), categories, allDepartments, departments, relatedDocs, relatedLinks: links }
    if (editing) { updateFaq(editing.id, fields); logAudit("edited", question, "FAQs") }
    else { addFaq({ id: newFaqId(), ...fields, upvotes: 0, downvotes: 0, feedback: [] }); logAudit("published", question, "FAQs") }
    navigate("/faqs")
  }
  const remove = () => { if (editing) { deleteFaq(editing.id); logAudit("deleted", editing.q, "FAQs") } navigate("/faqs") }

  const label = (text: string) => <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">{text}</label>

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => navigate("/faqs")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />{t("Back to FAQs", "العودة إلى الأسئلة")}
        </button>
        <div className="flex items-center gap-2">
          {editing && <Button variant="ghost" onClick={() => setConfirmDelete(true)} className="text-destructive hover:bg-destructive/10 hover:text-destructive"><Trash2 className="size-4" />{t("Delete", "حذف")}</Button>}
          <Button variant="outline" onClick={() => navigate("/faqs")}>{t("Cancel", "إلغاء")}</Button>
          <Button disabled={!canSave} onClick={save}>{editing ? t("Save changes", "حفظ التغييرات") : t("Publish", "نشر")}</Button>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-2 text-primary">
        <HelpCircle className="size-4" />
        <span className="text-xs font-semibold uppercase tracking-[0.14em]">{editing ? t("Edit FAQ", "تحرير السؤال") : t("New FAQ", "سؤال جديد")}</span>
      </div>

      <Card className="space-y-5 p-6 sm:p-8">
        <div>{label(t("Question", "السؤال"))}<Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("What do employees ask?", "ما الذي يسأل عنه الموظفون؟")} autoFocus dir={isAr ? "rtl" : "ltr"} className="h-11 text-base" /></div>
        <div>{label(t("Answer", "الإجابة"))}<RichTextEditor initialHTML={a} onChange={setA} dir={isAr ? "rtl" : "ltr"} placeholder={t("Write a clear, complete answer — headings, lists, links…", "اكتب إجابة واضحة وكاملة — عناوين، قوائم، روابط…")} /></div>

        {/* category tags */}
        <div>
          {label(t("Topics (tag one or more)", "المواضيع (وسم واحد أو أكثر)"))}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((c) => {
              const color = findCategory(cats, c)?.color ?? "#8a8a8a"
              return (
                <span key={c} className="inline-flex items-center gap-1.5 rounded-full border py-1 pe-1.5 ps-2.5 text-sm font-medium" style={{ backgroundColor: `${color}22`, color, borderColor: `${color}55` }}>
                  <span className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
                  {catLabel(c)}
                  <button type="button" aria-label={`${t("Remove", "إزالة")} ${c}`} onClick={() => setCategories(categories.filter((x) => x !== c))} className="grid size-4 place-items-center rounded-full hover:bg-black/10 dark:hover:bg-white/10"><X className="size-3" /></button>
                </span>
              )
            })}
            {availableCats.length > 0 && (
              <select value="" onChange={(e) => { if (e.target.value) setCategories([...categories, e.target.value]) }} className="h-8 rounded-full border border-dashed border-border bg-transparent px-3 text-sm text-muted-foreground outline-none hover:border-primary/60 focus:border-primary/60">
                <option value="">{t("+ Add topic", "+ إضافة موضوع")}</option>
                {availableCats.map((c) => <option key={c} value={c}>{catLabel(c)}</option>)}
              </select>
            )}
            {categories.length === 0 && <span className="text-xs text-muted-foreground">{t("No topics tagged yet", "لم يتم وسم أي موضوع بعد")}</span>}
          </div>
        </div>

        {/* departments */}
        <div>
          {label(t("Departments (who is this for?)", "الإدارات (لمن هذا؟)"))}
          <DepartmentPicker
            all={allDepartments}
            ids={departments}
            onToggleAll={setAllDepartments}
            onToggleDept={(dId) => setDepartments(departments.includes(dId) ? departments.filter((x) => x !== dId) : [...departments, dId])}
            isAr={isAr}
          />
        </div>

        {/* related documents */}
        <div>
          {label(t("Related documents", "مستندات ذات صلة"))}
          <div className="space-y-2">
            {relatedDocs.map((did) => {
              const d = docs.find((x) => x.id === did)
              return (
                <div key={did} className="flex items-center gap-2.5 rounded-lg border border-border bg-[var(--card-elevated)] px-3 py-2 text-sm">
                  <span className={cn("flex size-7 shrink-0 items-center justify-center rounded text-[9px] font-bold text-white", d ? TYPE_STYLE[d.type] : "bg-muted-foreground")}>{d?.type ?? "?"}</span>
                  <span className="min-w-0 flex-1 truncate">{d ? (isAr ? d.nameAr : d.name) : t("(document removed)", "(مستند محذوف)")}</span>
                  <button type="button" aria-label={t("Remove", "إزالة")} onClick={() => setRelatedDocs(relatedDocs.filter((x) => x !== did))} className="grid size-5 shrink-0 place-items-center rounded hover:bg-muted"><X className="size-3.5" /></button>
                </div>
              )
            })}
            {availableDocs.length > 0 && (
              <select value="" onChange={(e) => { if (e.target.value) setRelatedDocs([...relatedDocs, e.target.value]) }} className="h-10 w-full rounded-lg border border-dashed border-border bg-transparent px-3 text-sm text-muted-foreground outline-none hover:border-primary/60 focus:border-primary/60">
                <option value="">{t("+ Attach a document from the library", "+ إرفاق مستند من المكتبة")}</option>
                {availableDocs.map((d) => <option key={d.id} value={d.id}>{isAr ? d.nameAr : d.name} · {d.type}</option>)}
              </select>
            )}
          </div>
        </div>

        {/* related links */}
        <div>
          {label(t("Related links", "روابط ذات صلة"))}
          <div className="space-y-2">
            {links.map((l, i) => (
              <div key={i} className="flex items-center gap-2.5 rounded-lg border border-border bg-[var(--card-elevated)] px-3 py-2 text-sm">
                <Link2 className="size-4 shrink-0 text-primary" />
                <span className="min-w-0 flex-1 truncate"><span className="font-medium">{l.label}</span> <span className="text-muted-foreground">· {l.url}</span></span>
                <button type="button" aria-label={t("Remove", "إزالة")} onClick={() => setLinks(links.filter((_, x) => x !== i))} className="grid size-5 shrink-0 place-items-center rounded hover:bg-muted"><X className="size-3.5" /></button>
              </div>
            ))}
            <div className="flex flex-wrap items-center gap-2">
              <Input value={linkLabel} onChange={(e) => setLinkLabel(e.target.value)} placeholder={t("Link label", "عنوان الرابط")} className="h-10 min-w-[8rem] flex-1" />
              <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLink() } }} placeholder={t("https://… or /policies/…", "https://… أو /policies/…")} className="h-10 min-w-[8rem] flex-1" />
              <Button type="button" variant="outline" disabled={!linkLabel.trim() || !linkUrl.trim()} onClick={addLink}><Plus className="size-4" />{t("Add", "إضافة")}</Button>
            </div>
          </div>
        </div>
      </Card>

      {/* preview */}
      {(q.trim() || a.trim()) && (
        <div className="mt-6">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">{t("Preview", "معاينة")}</div>
          <Card className="p-5">
            <div className="flex flex-wrap items-center gap-1.5">{categories.map((c) => <CategoryBadge key={c} label={catLabel(c)} color={findCategory(cats, c)?.color} />)}</div>
            <h3 className="mt-2 font-medium leading-snug">{q.trim() || t("Your question…", "سؤالك…")}</h3>
            {a.trim()
              ? <div className={cn("mt-1", RICH_PROSE)} dir={isAr ? "rtl" : "ltr"} dangerouslySetInnerHTML={{ __html: a }} />
              : <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">{t("Your answer will appear here.", "ستظهر إجابتك هنا.")}</p>}
            {(relatedDocs.length > 0 || links.length > 0) && (
              <div className="mt-3 flex flex-wrap gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                {relatedDocs.length > 0 && <span className="inline-flex items-center gap-1"><FileText className="size-3.5" />{relatedDocs.length} {t("docs", "مستندات")}</span>}
                {links.length > 0 && <span className="inline-flex items-center gap-1"><Link2 className="size-3.5" />{links.length} {t("links", "روابط")}</span>}
              </div>
            )}
          </Card>
        </div>
      )}

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        {confirmDelete && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>{t("Delete this FAQ?", "حذف هذا السؤال؟")}</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">{t("Employees will no longer see this question. This can't be undone.", "لن يرى الموظفون هذا السؤال بعد الآن. لا يمكن التراجع.")}</p>
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
