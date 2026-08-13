import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"

import {
  Badge, Button, Card,
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import { ArrowLeft, Bell, Calendar, Check, Eye, FileText, ImageIcon, MapPin, Newspaper, Paperclip, PenLine, Star, Trash2, Upload, UserCircle2, Users, X } from "lucide-react"

import { addArticle, type ArticleAttachment, deleteArticle, updateArticle, useArticles } from "../store"
import { logAudit } from "../data/audit"
import { RichTextEditor } from "./RichTextEditor"

const PROSE = cn(
  "text-[15px] leading-relaxed",
  "[&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:font-semibold",
  "[&_h3]:mb-1 [&_h3]:mt-4 [&_h3]:font-heading [&_h3]:text-xl [&_h3]:font-semibold",
  "[&_p]:my-3",
  "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:ps-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:ps-6",
  "[&_a]:text-primary [&_a]:underline",
  "[&_blockquote]:my-3 [&_blockquote]:border-s-2 [&_blockquote]:border-primary [&_blockquote]:ps-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
)

const CATEGORIES = ["Corporate", "People", "Operations", "Technology", "Events"]
const COVERS = [
  "aviation", "conference", "office", "dashboard", "gathering",
  "training", "teamwork", "wellbeing", "celebrate", "ramadan",
].map((n) => `images/cms/${n}.jpg`)

type Opt = { id: string; label: string; ar: string }
const USER_GROUPS: Opt[] = [
  { id: "all", label: "All Employees", ar: "جميع الموظفين" },
  { id: "managers", label: "Managers", ar: "المدراء" },
  { id: "hr", label: "HR & People", ar: "الموارد البشرية" },
  { id: "it", label: "IT & Security", ar: "تقنية المعلومات" },
  { id: "ops", label: "Operations", ar: "العمليات" },
  { id: "finance", label: "Finance", ar: "المالية" },
  { id: "commercial", label: "Commercial", ar: "التجاري" },
]
const SPECIFIC_USERS: Opt[] = [
  { id: "u-khalid", label: "Khalid Al-Saadi", ar: "خالد السعدي" },
  { id: "u-sara", label: "Sara Al-Mutairi", ar: "سارة المطيري" },
  { id: "u-ahmed", label: "Ahmed Mohammed", ar: "أحمد محمد" },
  { id: "u-layan", label: "Layan Al Marwani", ar: "ليان المرواني" },
  { id: "u-mohammad", label: "Mohammad Iqbal", ar: "محمد إقبال" },
  { id: "u-noura", label: "Noura Saleh", ar: "نورة صالح" },
]
const LOCATIONS: Opt[] = [
  { id: "hq", label: "HQ · Riyadh", ar: "المقر · الرياض" },
  { id: "t1", label: "Terminal 1", ar: "المبنى 1" },
  { id: "t2", label: "Terminal 2", ar: "المبنى 2" },
  { id: "mcc", label: "Mission Control Center", ar: "مركز التحكم" },
  { id: "hub", label: "Innovation Hub", ar: "مركز الابتكار" },
  { id: "jeddah", label: "Jeddah Office", ar: "مكتب جدة" },
]

const SELECT_CLS = "h-11 w-full rounded-lg border border-input bg-[var(--card-elevated)] px-3 text-sm outline-none focus:border-primary/60"

export default function NewsEditorPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const { id } = useParams()
  const articles = useArticles()
  const editing = id ? articles.find((a) => a.id === id) : undefined

  const [title, setTitle] = React.useState(editing?.title ?? "")
  const [category, setCategory] = React.useState(editing?.category ?? "Corporate")
  const [excerpt, setExcerpt] = React.useState(editing?.excerpt ?? "")
  const [body, setBody] = React.useState(editing?.body ?? "")
  const [cover, setCover] = React.useState<string | null>(editing ? editing.cover : COVERS[0])
  const [issueDate, setIssueDate] = React.useState(editing?.issueDate ?? "")
  const [author, setAuthor] = React.useState(editing?.author ?? "")
  const [attachments, setAttachments] = React.useState<ArticleAttachment[]>(editing?.attachments ?? [])
  const [userGroups, setUserGroups] = React.useState<string[]>(editing?.userGroups ?? [])
  const [specificUsers, setSpecificUsers] = React.useState<string[]>(editing?.specificUsers ?? [])
  const [locations, setLocations] = React.useState<string[]>(editing?.locations ?? [])
  const [visibilityStart, setVisibilityStart] = React.useState(editing?.visibilityStart ?? "")
  const [visibilityEnd, setVisibilityEnd] = React.useState(editing?.visibilityEnd ?? "")
  const [important, setImportant] = React.useState(editing?.important ?? false)
  const [emailNotify, setEmailNotify] = React.useState(editing?.emailNotify ?? true)
  const [mode, setMode] = React.useState<"write" | "preview">("write")
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const [formKey, setFormKey] = React.useState(editing?.id ?? "new")

  // Deep-linked / hard-reloaded edit: the CMS store loads async, so populate the
  // form (incl. the rich-text body via a remount key) once the article arrives.
  const hydrated = React.useRef(false)
  React.useEffect(() => {
    if (!editing || hydrated.current) return
    hydrated.current = true
    setTitle(editing.title); setCategory(editing.category); setExcerpt(editing.excerpt)
    setBody(editing.body ?? ""); setCover(editing.cover)
    setIssueDate(editing.issueDate ?? ""); setAuthor(editing.author ?? "")
    setAttachments(editing.attachments ?? []); setUserGroups(editing.userGroups ?? [])
    setSpecificUsers(editing.specificUsers ?? []); setLocations(editing.locations ?? [])
    setVisibilityStart(editing.visibilityStart ?? ""); setVisibilityEnd(editing.visibilityEnd ?? "")
    setImportant(editing.important ?? false)
    setEmailNotify(editing.emailNotify ?? true); setFormKey(editing.id)
  }, [editing])

  const coverRef = React.useRef<HTMLInputElement>(null)
  const fileRef = React.useRef<HTMLInputElement>(null)
  const canSave = title.trim().length > 0
  const authorLabel = SPECIFIC_USERS.find((u) => u.id === author)

  const onCoverFile = (files: FileList | null) => {
    const f = files?.[0]
    if (f) setCover(URL.createObjectURL(f))
    if (coverRef.current) coverRef.current.value = ""
  }
  const onAttachFiles = (files: FileList | null) => {
    if (!files) return
    const add = Array.from(files).map((f) => ({ name: f.name, kind: (f.name.split(".").pop() ?? "file").toUpperCase() }))
    setAttachments((prev) => [...prev, ...add])
    if (fileRef.current) fileRef.current.value = ""
  }

  const remove = () => {
    if (editing) { deleteArticle(editing.id); logAudit("deleted", editing.title, "News") }
    navigate("/news")
  }

  const save = (status: "Draft" | "Published") => {
    const fields = {
      title: title.trim(), category,
      excerpt: excerpt.trim() || t("No summary provided.", "لا يوجد ملخص."),
      cover, status, body,
      date: status === "Published" ? "Just now" : "—",
      issueDate, author, attachments, userGroups, specificUsers, locations,
      visibilityStart, visibilityEnd: visibilityEnd || null, important, emailNotify,
    }
    if (editing) { updateArticle(editing.id, fields); logAudit("edited", fields.title, "News") }
    else { addArticle({ id: `art-${Date.now()}`, ...fields }); logAudit(status === "Published" ? "published" : "edited", fields.title, "News") }
    navigate("/news")
  }

  const fieldLabel = (text: string) => <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{text}</label>

  return (
    <main className="ambient-page mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      {/* top bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => navigate("/news")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />{t("Back to news", "العودة إلى الأخبار")}
        </button>
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-lg border border-border p-0.5">
            {(["write", "preview"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} className={cn("inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors", mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
                {m === "write" ? <PenLine className="size-3.5" /> : <Eye className="size-3.5" />}
                {m === "write" ? t("Write", "تحرير") : t("Preview", "معاينة")}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {editing && <Button variant="ghost" onClick={() => setConfirmDelete(true)} className="text-destructive hover:bg-destructive/10 hover:text-destructive"><Trash2 className="size-4" />{t("Delete", "حذف")}</Button>}
            <Button variant="outline" disabled={!canSave} onClick={() => save("Draft")}>{t("Save draft", "حفظ كمسودة")}</Button>
            <Button disabled={!canSave} onClick={() => save("Published")}>{t("Publish", "نشر")}</Button>
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-2 text-primary">
        <Newspaper className="size-4" />
        <span className="text-xs font-semibold uppercase tracking-[0.14em]">{editing ? t("Edit article", "تحرير المقال") : t("New article", "مقال جديد")}</span>
        <Badge variant="outline" className="ms-1 text-[10px]">{editing?.status ?? t("Draft", "مسودة")}</Badge>
      </div>

      <div className={cn("grid gap-6 lg:grid-cols-3", mode !== "write" && "hidden")}>
        {/* main column */}
        <div className="space-y-5 lg:col-span-2">
          <Card className="space-y-4 p-5">
            <div>
              {fieldLabel(t("Title", "العنوان"))}
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("Article title goes here…", "عنوان المقال هنا…")} dir={isAr ? "rtl" : "ltr"} autoFocus
                className={cn("w-full rounded-lg border bg-[var(--card-elevated)] px-3 py-2.5 font-heading text-xl font-bold outline-none transition-colors", "placeholder:font-sans placeholder:text-base placeholder:font-normal placeholder:text-muted-foreground/50", "focus:border-primary/60 focus:ring-2 focus:ring-primary/15", title.trim() ? "border-border" : "border-primary/40")} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                {fieldLabel(t("Issue date", "تاريخ الإصدار"))}
                <div className="relative">
                  <Calendar className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className={SELECT_CLS} />
                </div>
              </div>
              <div>
                {fieldLabel(t("Author (optional)", "الكاتب (اختياري)"))}
                <select value={author} onChange={(e) => setAuthor(e.target.value)} className={SELECT_CLS}>
                  <option value="">{t("Select", "اختر")}</option>
                  {SPECIFIC_USERS.map((u) => <option key={u.id} value={u.id}>{isAr ? u.ar : u.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              {fieldLabel(t("Summary", "الملخص"))}
              <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder={t("One line shown in the news list", "سطر واحد يظهر في قائمة الأخبار")} dir={isAr ? "rtl" : "ltr"}
                className="w-full rounded-lg border border-border bg-[var(--card-elevated)] px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary/60 focus:ring-2 focus:ring-primary/15" />
            </div>

            <div>
              {fieldLabel(t("Description / Content", "الوصف / المحتوى"))}
              <RichTextEditor key={formKey} initialHTML={body} onChange={setBody} dir={isAr ? "rtl" : "ltr"} placeholder={t("Write your article — use the toolbar to format…", "اكتب مقالك — استخدم الشريط للتنسيق…")} />
            </div>
          </Card>

          {/* attachment */}
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium"><Paperclip className="size-4 text-primary" />{t("Attachment (optional)", "المرفقات (اختياري)")}</div>

            {/* cover image */}
            <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={(e) => onCoverFile(e.target.files)} />
            {cover ? (
              <div className="relative mb-3 aspect-[1200/630] overflow-hidden rounded-xl border border-border">
                <img src={cover} alt="" className="h-full w-full object-cover" />
                <button onClick={() => setCover(null)} className="absolute end-2 top-2 inline-flex items-center gap-1 rounded-md bg-background/90 px-2 py-1 text-xs text-muted-foreground shadow-sm hover:text-destructive"><X className="size-3" />{t("Remove", "إزالة")}</button>
              </div>
            ) : (
              <button onClick={() => coverRef.current?.click()} className="mb-3 flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border bg-muted/20 py-8 text-center transition-colors hover:border-primary/50 hover:bg-primary/[0.03]">
                <ImageIcon className="size-6 text-muted-foreground/50" />
                <span className="text-sm text-muted-foreground">{t("Drop cover image · 1200 × 630 recommended", "أسقط صورة الغلاف · يُفضّل 1200 × 630")}</span>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"><Upload className="size-3.5" />{t("Browse files", "تصفّح الملفات")}</span>
              </button>
            )}
            {/* preset covers */}
            <div className="mb-4 grid grid-cols-6 gap-1.5">
              {COVERS.map((src) => (
                <button key={src} onClick={() => setCover(src)} className={cn("relative aspect-square overflow-hidden rounded-md ring-2 transition", cover === src ? "ring-primary" : "ring-transparent hover:ring-border")}>
                  <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                  {cover === src && <span className="absolute inset-0 flex items-center justify-center bg-primary/30"><Check className="size-4 text-white" /></span>}
                </button>
              ))}
            </div>

            {/* file attachments */}
            <div className="space-y-2">
              {attachments.map((a, i) => (
                <div key={i} className="flex items-center gap-2.5 rounded-lg border border-border bg-[var(--card-elevated)] px-3 py-2 text-sm">
                  <FileText className="size-4 shrink-0 text-primary" />
                  <span className="min-w-0 flex-1 truncate">{a.name}</span>
                  <Badge variant="outline" className="shrink-0 text-[10px]">{a.kind}</Badge>
                  <button onClick={() => setAttachments(attachments.filter((_, x) => x !== i))} aria-label={t("Remove", "إزالة")} className="grid size-5 shrink-0 place-items-center rounded hover:bg-muted"><X className="size-3.5" /></button>
                </div>
              ))}
              <input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => onAttachFiles(e.target.files)} />
              <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"><Paperclip className="size-3.5" />{t("Attach files", "إرفاق ملفات")}</button>
            </div>
          </Card>
        </div>

        {/* general settings */}
        <aside className="space-y-4">
          <Card className="space-y-4 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold"><Users className="size-4 text-primary" />{t("General settings", "الإعدادات العامة")}</div>

            <div>
              {fieldLabel(t("Category", "الفئة"))}
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button key={c} onClick={() => setCategory(c)} className={cn("rounded-full border px-3 py-1 text-sm transition-colors", category === c ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/60")}>{c}</button>
                ))}
              </div>
            </div>

            <MultiSelect label={t("Specific user groups", "مجموعات مستخدمين محددة")} icon={Users} options={USER_GROUPS} value={userGroups} onChange={setUserGroups} isAr={isAr} placeholder={t("Select", "اختر")} />
            <MultiSelect label={t("Specific users", "مستخدمون محددون")} icon={UserCircle2} options={SPECIFIC_USERS} value={specificUsers} onChange={setSpecificUsers} isAr={isAr} placeholder={t("Select", "اختر")} />
            <MultiSelect label={t("Locations", "المواقع")} icon={MapPin} options={LOCATIONS} value={locations} onChange={setLocations} isAr={isAr} placeholder={t("Select", "اختر")} />

            <div className="grid gap-3 sm:grid-cols-2 sm:items-end">
              <div className="flex flex-col">{fieldLabel(t("Visibility start", "بداية الظهور"))}<input type="date" value={visibilityStart} onChange={(e) => setVisibilityStart(e.target.value)} className={SELECT_CLS} /></div>
              <div className="flex flex-col">{fieldLabel(t("Visibility end", "نهاية الظهور"))}<input type="date" value={visibilityEnd} min={visibilityStart || undefined} onChange={(e) => setVisibilityEnd(e.target.value)} className={SELECT_CLS} /></div>
            </div>

            <div className="space-y-1 border-t border-border/60 pt-3">
              <CheckRow icon={Star} label={t("Mark as important", "وضع علامة مهم")} checked={important} onChange={setImportant} />
              <CheckRow icon={Bell} label={t("Send email notifications", "إرسال إشعارات بريدية")} checked={emailNotify} onChange={setEmailNotify} />
            </div>
          </Card>
        </aside>
      </div>

      {mode === "preview" && (
        <article className="mx-auto max-w-3xl">
          <Card className="overflow-hidden py-0 gap-0">
            {cover && <div className="aspect-[1200/630]"><img src={cover} alt="" className="h-full w-full object-cover" /></div>}
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Badge variant="outline">{category}</Badge>
                {important && <Badge className="bg-primary/15 text-primary"><Star className="me-1 size-3 fill-primary" />{t("Important", "مهم")}</Badge>}
              </div>
              <h1 className="mt-3 font-heading text-3xl font-bold leading-tight sm:text-4xl">{title.trim() || t("Untitled article", "مقال بدون عنوان")}</h1>
              {excerpt.trim() && <p className="mt-3 text-lg text-muted-foreground">{excerpt}</p>}
              <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-border pb-4 text-xs text-muted-foreground">
                <span>{t("By", "بقلم")} {authorLabel ? (isAr ? authorLabel.ar : authorLabel.label) : t("Khalid", "خالد")}</span>
                <span>·</span><span>{issueDate || t("Just now", "الآن")}</span>
                <span>·</span><span>{category}</span>
                {attachments.length > 0 && <><span>·</span><span className="inline-flex items-center gap-1"><Paperclip className="size-3" />{attachments.length} {t("files", "ملفات")}</span></>}
              </div>
              <div className={cn("mt-6", PROSE)} dir={isAr ? "rtl" : "ltr"} dangerouslySetInnerHTML={{ __html: body || `<p style="color:var(--muted-foreground)">${t("Start writing to see your article here.", "ابدأ الكتابة لرؤية مقالك هنا.")}</p>` }} />
            </div>
          </Card>
        </article>
      )}

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        {confirmDelete && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("Delete this article?", "حذف هذا المقال؟")}</DialogTitle>
              <DialogDescription>{t("This permanently removes the article and its comments. This can't be undone.", "سيؤدي هذا إلى حذف المقال وتعليقاته نهائيًا. لا يمكن التراجع.")}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDelete(false)}>{t("Cancel", "إلغاء")}</Button>
              <Button onClick={remove} className="bg-destructive text-white hover:bg-destructive/90"><Trash2 className="size-4" />{t("Delete article", "حذف المقال")}</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </main>
  )
}

// ─── helpers ─────────────────────────────────────────────────────────────────
function MultiSelect({ label, icon: Icon, options, value, onChange, isAr, placeholder }: {
  label: string; icon: React.ComponentType<{ className?: string }>; options: Opt[]; value: string[]; onChange: (v: string[]) => void; isAr: boolean; placeholder: string
}) {
  const selected = options.filter((o) => value.includes(o.id))
  const available = options.filter((o) => !value.includes(o.id))
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"><Icon className="size-3.5 text-primary" />{label}</label>
      <select value="" onChange={(e) => { if (e.target.value) onChange([...value, e.target.value]) }} className={SELECT_CLS}>
        <option value="">{placeholder}</option>
        {available.map((o) => <option key={o.id} value={o.id}>{isAr ? o.ar : o.label}</option>)}
      </select>
      {selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selected.map((o) => (
            <span key={o.id} className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 py-1 pe-1.5 ps-2.5 text-xs font-medium text-primary">
              {isAr ? o.ar : o.label}
              <button type="button" aria-label="remove" onClick={() => onChange(value.filter((x) => x !== o.id))} className="grid size-4 place-items-center rounded-full hover:bg-primary/20"><X className="size-3" /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function CheckRow({ icon: Icon, label, checked, onChange }: { icon: React.ComponentType<{ className?: string }>; label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-2 text-sm transition-colors hover:bg-muted/40">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-[var(--primary)]" />
      <Icon className="size-4 text-muted-foreground" />
      <span className="font-medium">{label}</span>
    </label>
  )
}
