/** The Knowledge page popups, built as drawn in Figma:
 *  create news / survey (2485:3150 · 2464:2865), create folder (4775:25446),
 *  add FAQ (2485:3307) and the image lightbox (4775:25339). */
import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@reach/shared-core"
import { BadgeCheck, BookMarked, CalendarDays, FileText, FolderOpen, Newspaper, Trash2, X } from "lucide-react"

import {
  CountSelect, DraftsButton, Field, FIELD, MODAL_OUTLINE, WButton, WInput, WModal, WSelect, WTextarea,
} from "../_wijha"
import { DEPARTMENTS } from "../../data/departments"
import { addFolder, type FolderDef, newFolderId, ROOT_FOLDER } from "../../data/documents"
import { addPoll, type KPoll, newPollId, updatePoll, usePolls } from "../../data/polls"
import { addFaq, type Faq, newFaqId, updateFaq, useFaqs } from "../../data/faqs"
import { NEWS_CAT_AR, type NewsItem } from "../../data/news"
import { hideSeedNews } from "../../data/newsFeed"
import { addArticle, getArticleById, updateArticle, useArticles } from "../../store"
import { logAudit } from "../../data/audit"

const ORDINALS_AR = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع", "العاشر"]
const ORDINALS_EN = ["First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth", "Tenth"]

function useDeptOptions(isAr: boolean) {
  return React.useMemo(() => DEPARTMENTS.map((d) => ({ id: d.id, label: isAr ? d.nameAr : d.name })), [isAr])
}

/** Date field drawn as "تاريخ" with a calendar glyph at the end; switches to
 *  the native date picker on focus. */
function DateInput({ value, onChange, isAr }: { value: string; onChange: (v: string) => void; isAr: boolean }) {
  const [focused, setFocused] = React.useState(false)
  return (
    <span className="relative block">
      <input type={value || focused ? "date" : "text"} value={value} placeholder={isAr ? "تاريخ" : "Date"}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onChange={(e) => onChange(e.target.value)} aria-label={isAr ? "تاريخ النشر" : "Publish date"}
        className={cn(FIELD, "pe-9 [color-scheme:light] dark:[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0")} />
      <CalendarDays className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-icon" />
    </span>
  )
}

/* ── create news / survey / poll ──────────────────────────────────────────── */

export type ContentKind = "news" | "survey" | "poll"

export function CreateContentModal({ open, onClose, isAr, initialKind = "news", editNews, editPoll }: {
  open: boolean
  onClose: () => void
  isAr: boolean
  initialKind?: ContentKind
  editNews?: NewsItem | null
  editPoll?: KPoll | null
}) {
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const deptOptions = useDeptOptions(isAr)
  const articles = useArticles()
  const polls = usePolls()

  const [kind, setKind] = React.useState<ContentKind>(initialKind)
  const [title, setTitle] = React.useState("")
  const [text, setText] = React.useState("")
  const [date, setDate] = React.useState("")
  const [fromDepts, setFromDepts] = React.useState<string[]>([])
  const [audience, setAudience] = React.useState<string[]>([])
  const [link, setLink] = React.useState("")
  const [image, setImage] = React.useState<{ name: string; src: string } | null>(null)
  const [options, setOptions] = React.useState<string[]>(["", "", ""])
  const [showDrafts, setShowDrafts] = React.useState(false)
  const [editingId, setEditingId] = React.useState<{ kind: "news" | "poll"; id: string } | null>(null)
  // Buttons stay enabled (as drawn); a failed attempt shows what is missing.
  const [tried, setTried] = React.useState<"publish" | "draft" | null>(null)
  const fileRef = React.useRef<HTMLInputElement>(null)

  const reset = React.useCallback(() => {
    setTitle(""); setText(""); setDate(""); setFromDepts([]); setAudience([]); setLink(""); setImage(null)
    setOptions(["", "", ""]); setShowDrafts(false); setEditingId(null); setTried(null)
  }, [])

  // (Re)initialise whenever the popup opens.
  React.useEffect(() => {
    if (!open) return
    reset()
    if (editNews) {
      setKind("news"); setTitle(isAr ? editNews.titleAr : editNews.title)
      setText(((isAr ? editNews.bodyAr : undefined) ?? editNews.body ?? "").replace(/<[^>]+>/g, "\n").replace(/\n+/g, "\n").trim())
      setImage(editNews.img ? { name: editNews.img.split("/").pop() ?? "image", src: editNews.img } : null)
      setEditingId({ kind: "news", id: editNews.id })
    } else if (editPoll) {
      setKind(editPoll.kind); setTitle(isAr ? editPoll.questionAr : editPoll.question)
      setOptions(editPoll.options.map((o) => (isAr ? o.labelAr : o.label)))
      setDate(editPoll.publishDate ?? ""); setFromDepts(editPoll.fromDepts ?? []); setAudience(editPoll.audience ?? [])
      setEditingId({ kind: "poll", id: editPoll.id })
    } else {
      setKind(initialKind)
    }
  }, [open, editNews, editPoll, initialKind, isAr, reset])

  const newsDrafts = articles.filter((a) => a.status === "Draft")
  const pollDrafts = polls.filter((p) => p.status === "draft")
  const drafts = kind === "news" ? newsDrafts.length : pollDrafts.length

  const filledOptions = options.map((o) => o.trim()).filter(Boolean)
  const canPublish = title.trim().length > 0 && (kind === "news" ? text.trim().length > 0 : filledOptions.length >= 2)
  const canDraft = title.trim().length > 0

  const onImage = (files: FileList | null) => {
    const f = files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => setImage({ name: f.name, src: String(reader.result) })
    reader.readAsDataURL(f)
    if (fileRef.current) fileRef.current.value = ""
  }

  const deptName = (id: string) => DEPARTMENTS.find((d) => d.id === id)?.name ?? "Corporate"

  const save = (status: "Published" | "Draft") => {
    if (status === "Published" ? !canPublish : !canDraft) { setTried(status === "Published" ? "publish" : "draft"); return }
    const ttl = title.trim()
    if (kind === "news") {
      const body = text.trim().split(/\n+/).map((p) => `<p>${p.replace(/</g, "&lt;")}</p>`).join("")
      const category = fromDepts.length === 1 ? deptName(fromDepts[0]).split(" ")[0] : "Corporate"
      const fields = {
        title: ttl, category, excerpt: text.trim().split(/\n/)[0].slice(0, 180), cover: image?.src ?? null,
        status, body, date: status === "Published" ? (isAr ? "الآن" : "Just now") : "—",
        issueDate: date || undefined, userGroups: audience, visibilityStart: date || undefined,
        attachments: link.trim() ? [{ name: link.trim(), kind: "LINK" }] : [],
      }
      if (editingId?.kind === "news" && getArticleById(editingId.id)) {
        updateArticle(editingId.id, fields); logAudit("edited", ttl, "News")
      } else {
        // editing a seeded item replaces it with an authored copy
        if (editingId?.kind === "news") hideSeedNews(editingId.id)
        addArticle({ id: `art-${Date.now()}`, ...fields }); logAudit(status === "Published" ? "published" : "edited", ttl, "News")
      }
    } else {
      const opts = filledOptions.map((label, i) => ({ id: `o${i + 1}`, label, labelAr: label, votes: 0 }))
      const fields: Omit<KPoll, "id"> = {
        kind: kind === "poll" ? "poll" : "survey", status: status === "Published" ? "open" : "draft",
        question: ttl, questionAr: ttl, when: "Just published", whenAr: "نُشر الآن",
        publishDate: date || undefined, fromDepts, audience, options: opts, myVote: null,
      }
      if (editingId?.kind === "poll") { updatePoll(editingId.id, fields); logAudit("edited", ttl, "Surveys") }
      else { addPoll({ id: newPollId(), ...fields }); logAudit(status === "Published" ? "published" : "edited", ttl, "Surveys") }
    }
    onClose()
  }

  const loadDraft = (k: "news" | "poll", id: string) => {
    if (k === "news") {
      const a = articles.find((x) => x.id === id)
      if (!a) return
      setKind("news"); setTitle(a.title); setText((a.body ?? "").replace(/<[^>]+>/g, "\n").replace(/\n+/g, "\n").trim())
      setImage(a.cover ? { name: a.cover.split("/").pop() ?? "image", src: a.cover } : null)
    } else {
      const p = polls.find((x) => x.id === id)
      if (!p) return
      setKind(p.kind); setTitle(p.question); setOptions(p.options.map((o) => o.label))
      setFromDepts(p.fromDepts ?? []); setAudience(p.audience ?? []); setDate(p.publishDate ?? "")
    }
    setEditingId({ kind: k, id }); setShowDrafts(false)
  }

  const isNews = kind === "news"
  const kindSelect = (
    <Field label={t("Create News or Survey", "إنشاء خبر أو استبيان")}>
      <WSelect value={kind} onChange={(e) => setKind(e.target.value as ContentKind)} disabled={!!editingId}>
        <option value="news">{t("News", "خبر")}</option>
        <option value="survey">{t("Survey", "استبيان")}</option>
        <option value="poll">{t("Poll", "تصويت")}</option>
      </WSelect>
    </Field>
  )
  const metaRow = (
    <div className="grid gap-4 sm:grid-cols-3">
      <Field label={t("Publish Date", "تاريخ النشر")}><DateInput value={date} onChange={setDate} isAr={isAr} /></Field>
      <Field label={t("News from Department", "الخبر من إدارة")}><CountSelect options={deptOptions} value={fromDepts} onChange={setFromDepts} allLabel={t("All", "الكل")} isAr={isAr} /></Field>
      <Field label={t("Target Employees", "الموظفين المستهدفين")}><CountSelect options={deptOptions} value={audience} onChange={setAudience} allLabel={t("All", "الكل")} isAr={isAr} /></Field>
    </div>
  )

  return (
    <WModal open={open} onClose={onClose} isAr={isAr}
      title={isNews ? t("News", "الأخبار") : t("Surveys & Polls", "الاستبيانات والتصويت")}
      icon={isNews ? Newspaper : BadgeCheck}
      footer={<>
        <WButton className="px-6" onClick={() => save("Published")}>{t("Publish", "نشر")}</WButton>
        <WButton variant="outline" className={MODAL_OUTLINE} onClick={onClose}>{t("Cancel", "إلغاء")}</WButton>
        <WButton variant="outline" className={MODAL_OUTLINE} onClick={() => save("Draft")}>{t("Save as Draft", "حفظ كمسودة")}</WButton>
        <DraftsButton count={drafts} isAr={isAr} onClick={() => setShowDrafts((v) => !v)} />
      </>}>
      {showDrafts && (
        <div className="rounded-[8px] bg-[var(--card-elevated)] p-2">
          {(isNews ? newsDrafts.length : pollDrafts.length) === 0 ? (
            <p className="px-2 py-3 text-[12px] text-muted-foreground">{t("No drafts yet.", "لا توجد مسودات بعد.")}</p>
          ) : isNews ? newsDrafts.map((a) => (
            <button key={a.id} type="button" onClick={() => loadDraft("news", a.id)} className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-start text-[13px] hover:bg-secondary">
              <FileText className="size-4 text-icon" /><span className="truncate">{a.title}</span>
            </button>
          )) : pollDrafts.map((p) => (
            <button key={p.id} type="button" onClick={() => loadDraft("poll", p.id)} className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-start text-[13px] hover:bg-secondary">
              <BadgeCheck className="size-4 text-icon" /><span className="truncate">{isAr ? p.questionAr : p.question}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* 2485:3150 / 2464:2865: 212px type select + title (12px gap). */}
        <div className="grid gap-3 sm:grid-cols-[212px_minmax(0,1fr)]">
          {kindSelect}
          <Field label={t("Main Title", "العنوان الرئيسي")}>
            <WInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("Title", "عنوان")} />
            {tried && !title.trim() && <span className="px-1 text-[11px] text-error">{t("Enter a title", "أدخل العنوان")}</span>}
          </Field>
        </div>

        {isNews ? (
          <>
            <Field label={t("News Text", "نص الخبر")}>
              <WTextarea rows={1} value={text} onChange={(e) => setText(e.target.value)} placeholder={t("Text", "نص")} />
              {tried === "publish" && !text.trim() && <span className="px-1 text-[11px] text-error">{t("Enter the news text", "أدخل نص الخبر")}</span>}
            </Field>
            {metaRow}
            <Field label={t("News Link", "رابط الخبر")}>
              <WInput value={link} onChange={(e) => setLink(e.target.value)} placeholder={t("*Link*", "*رابط*")} />
            </Field>
            {/* 2485:3150: 390px 16:9 preview + 262px file column; 36px above, 40px to the footer. */}
            <div className="grid gap-2.5 pb-4 pt-5 sm:grid-cols-[390px_minmax(0,1fr)]">
              {/* 16:9 preview */}
              <div className="relative grid aspect-video place-items-center overflow-hidden rounded-[8px] bg-[repeating-linear-gradient(135deg,var(--card-elevated)_0_18px,transparent_18px_36px)] ring-1 ring-[var(--card-ring)]">
                {image ? (
                  <img src={image.src} alt="" className="absolute inset-0 size-full object-cover" />
                ) : (
                  <span className="text-center text-[15px] leading-7 text-foreground" dir="ltr">358 * 201<br />16:9 Aspect Ratio</span>
                )}
              </div>
              <div className="flex flex-col justify-between gap-4">
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => onImage(e.target.files)} />
                {image ? (
                  <div className="flex items-center gap-3 rounded-[8px] bg-background px-4 py-4">
                    <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[8px] bg-error-fill text-[10px] font-bold text-error">
                      {(image.name.split(".").pop() ?? "IMG").slice(0, 4).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13px]">{image.name}</span>
                    <button type="button" onClick={() => setImage(null)} aria-label={t("Remove image", "حذف الصورة")} className="grid size-7 place-items-center rounded-md text-error hover:bg-error-fill"><Trash2 className="size-4" /></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-[8px] bg-background px-4 py-4">
                    <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[8px] bg-error-fill text-[10px] font-bold text-error">PNG</span>
                    <span className="min-w-0 flex-1 truncate text-[13px] text-muted-foreground">{t("*Image*", "*صورة*")}</span>
                    {/* drawn in 2485:3150 even before an image is chosen */}
                    <button type="button" disabled aria-label={t("Remove image", "حذف الصورة")} className="grid size-7 place-items-center rounded-md text-error disabled:cursor-default"><Trash2 className="size-4" /></button>
                  </div>
                )}
                <WButton className="w-full" onClick={() => fileRef.current?.click()}>{t("Upload Image", "رفع صورة")}</WButton>
              </div>
            </div>
          </>
        ) : (
          <>
            {metaRow}
            {options.map((o, i) => (
              <Field key={i} label={isAr ? `الخيار ${ORDINALS_AR[i] ?? i + 1}` : ORDINALS_EN[i] ? `${ORDINALS_EN[i]} Option` : `Option ${i + 1}`}>
                <div className="flex items-center gap-4">
                  <WInput value={o} onChange={(e) => setOptions(options.map((x, j) => (j === i ? e.target.value : x)))} placeholder={t("Text", "نص")} />
                  <WButton variant="danger" className={MODAL_OUTLINE} disabled={options.length <= 2} onClick={() => setOptions(options.filter((_, j) => j !== i))}>
                    <Trash2 />{t("Delete", "حذف")}
                  </WButton>
                </div>
              </Field>
            ))}
            {tried === "publish" && filledOptions.length < 2 && <p className="px-1 text-[11px] text-error">{t("Add at least two options", "أضف خيارين على الأقل")}</p>}
            <div className="flex justify-start pb-4">
              <WButton className="px-6" disabled={options.length >= 10} onClick={() => setOptions([...options, ""])}>{t("Add New Option", "إضافة خيار جديد")}</WButton>
            </div>
          </>
        )}
      </div>
    </WModal>
  )
}

/* ── create folder ────────────────────────────────────────────────────────── */

export function CreateFolderModal({ open, onClose, isAr, folders, currentId, onCreated }: {
  open: boolean
  onClose: () => void
  isAr: boolean
  folders: FolderDef[]
  currentId: string | null
  onCreated?: (id: string) => void
}) {
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const deptOptions = useDeptOptions(isAr)
  const [name, setName] = React.useState("")
  const [parent, setParent] = React.useState<string>(currentId ?? ROOT_FOLDER)
  const [access, setAccess] = React.useState<string[]>([])
  const [owners, setOwners] = React.useState<string[]>([])
  const [tried, setTried] = React.useState(false)
  React.useEffect(() => {
    if (open) { setName(""); setParent(currentId ?? ROOT_FOLDER); setAccess([]); setOwners([]); setTried(false) }
  }, [open, currentId])

  const writable = folders.filter((f) => !f.readOnly)
  const create = () => {
    const n = name.trim()
    if (!n) { setTried(true); return }
    const id = newFolderId()
    addFolder({ id, name: n, nameAr: n, count: 0, parent: parent === ROOT_FOLDER ? null : parent, access, owners })
    logAudit("created", `${t("Folder", "مجلد")}: ${n}`, "Documents")
    onCreated?.(id)
    onClose()
  }
  return (
    <WModal open={open} onClose={onClose} isAr={isAr} icon={FolderOpen} title={t("Create New Folder", "إنشاء مجلد جديد")}
      footer={<>
        <WButton className="px-6" onClick={create}>{t("Create", "إنشاء")}</WButton>
        <WButton variant="outline" className={MODAL_OUTLINE} onClick={onClose}>{t("Cancel", "إلغاء")}</WButton>
      </>}>
      <div className="flex flex-col gap-4 pb-4">
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_214px]">
          <Field label={t("Folder name", "اسم المجلد")}>
            <WInput value={name} onChange={(e) => setName(e.target.value)} placeholder={t("Title", "عنوان")}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); create() } }} />
            {tried && !name.trim() && <span className="px-1 text-[11px] text-error">{t("Enter a folder name", "أدخل اسم المجلد")}</span>}
          </Field>
          <Field label={t("Create in", "الإنشاء في")}>
            <WSelect value={parent} onChange={(e) => setParent(e.target.value)}>
              {currentId && <option value={currentId}>{t("Current folder", "المجلد الحالي")}</option>}
              <option value={ROOT_FOLDER}>{t("Documents (top level)", "المستندات (المستوى الأعلى)")}</option>
              {writable.filter((f) => f.id !== currentId).map((f) => <option key={f.id} value={f.id}>{isAr ? f.nameAr : f.name}</option>)}
            </WSelect>
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("Who can access", "من يمكنه الوصول")}><CountSelect options={deptOptions} value={access} onChange={setAccess} allLabel={t("All", "الكل")} isAr={isAr} /></Field>
          <Field label={t("Owned by", "من يملك")}><CountSelect options={deptOptions} value={owners} onChange={setOwners} allLabel={t("All", "الكل")} isAr={isAr} /></Field>
        </div>
      </div>
    </WModal>
  )
}

/* ── add / edit FAQ ───────────────────────────────────────────────────────── */

export function FaqModal({ open, onClose, isAr, edit }: { open: boolean; onClose: () => void; isAr: boolean; edit?: Faq | null }) {
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const deptOptions = useDeptOptions(isAr)
  const faqs = useFaqs()
  const [q, setQ] = React.useState("")
  const [a, setA] = React.useState("")
  const [link, setLink] = React.useState("")
  const [date, setDate] = React.useState("")
  const [audience, setAudience] = React.useState<string[]>([])
  const [editId, setEditId] = React.useState<string | null>(null)
  const [showDrafts, setShowDrafts] = React.useState(false)
  const [tried, setTried] = React.useState<"publish" | "draft" | null>(null)

  const load = React.useCallback((f: Faq | null | undefined) => {
    setQ(f ? (isAr ? f.qAr : f.q) : ""); setA(f ? (isAr ? f.aAr : f.a) : "")
    setLink(f?.relatedLinks[0]?.url ?? ""); setDate(f?.publishDate ?? ""); setAudience(f?.audience ?? [])
    setEditId(f?.id ?? null); setShowDrafts(false); setTried(null)
  }, [isAr])
  React.useEffect(() => { if (open) load(edit) }, [open, edit, load])

  const drafts = faqs.filter((f) => f.status === "Draft")
  const save = (status: "Published" | "Draft") => {
    const question = q.trim()
    if (!question || (status === "Published" && !a.trim())) { setTried(status === "Published" ? "publish" : "draft"); return }
    const fields: Partial<Faq> = {
      ...(isAr ? { qAr: question, aAr: a.trim() } : { q: question, a: a.trim() }),
      relatedLinks: link.trim() ? [{ label: isAr ? "رابط" : "Link", url: link.trim() }] : [],
      publishDate: date || undefined, audience, status,
      allDepartments: audience.length === 0, departments: audience,
    }
    if (editId) { updateFaq(editId, fields); logAudit("edited", question, "FAQs") }
    else {
      addFaq({ id: newFaqId(), categories: ["Documents"], q: question, qAr: question, a: a.trim(), aAr: a.trim(), relatedDocs: [], relatedLinks: [], upvotes: 0, downvotes: 0, feedback: [], ...fields })
      logAudit(status === "Published" ? "published" : "edited", question, "FAQs")
    }
    onClose()
  }

  return (
    <WModal open={open} onClose={onClose} isAr={isAr} width={496} icon={BookMarked} title={t("FAQs", "الأسئلة الشائعة")}
      footer={<>
        <WButton className="px-6" onClick={() => save("Published")}>{t("Publish", "نشر")}</WButton>
        <WButton variant="outline" className={MODAL_OUTLINE} onClick={onClose}>{t("Cancel", "إلغاء")}</WButton>
        <WButton variant="outline" className={MODAL_OUTLINE} onClick={() => save("Draft")}>{t("Save as Draft", "حفظ كمسودة")}</WButton>
        <DraftsButton count={drafts.length} isAr={isAr} onClick={() => setShowDrafts((v) => !v)} />
      </>}>
      {showDrafts && (
        <div className="rounded-[8px] bg-[var(--card-elevated)] p-2">
          {drafts.length === 0 ? <p className="px-2 py-3 text-[12px] text-muted-foreground">{t("No drafts yet.", "لا توجد مسودات بعد.")}</p>
            : drafts.map((f) => (
              <button key={f.id} type="button" onClick={() => load(f)} className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-start text-[13px] hover:bg-secondary">
                <BookMarked className="size-4 text-icon" /><span className="truncate">{isAr ? f.qAr : f.q}</span>
              </button>
            ))}
        </div>
      )}
      <div className="flex flex-col gap-4">
        <Field label={t("Main title", "العنوان الرئيسي")}>
          <WInput value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Title", "عنوان")} />
          {tried && !q.trim() && <span className="px-1 text-[11px] text-error">{t("Enter a title", "أدخل العنوان")}</span>}
        </Field>
        <Field label={t("Text", "النص")}>
          <WTextarea rows={1} value={a} onChange={(e) => setA(e.target.value)} placeholder={t("Text", "نص")} />
          {tried === "publish" && !a.trim() && <span className="px-1 text-[11px] text-error">{t("Enter the answer", "أدخل النص")}</span>}
        </Field>
        <Field label={<><span className="font-semibold">{t("Link", "رابط")}</span><span className="font-normal">{t(" to the solution", " لحل المشكلة الشائعة")}</span></>}>
          <WInput value={link} onChange={(e) => setLink(e.target.value)} placeholder={t("*Link*", "*رابط*")} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("Publish date", "تاريخ النشر")}><DateInput value={date} onChange={setDate} isAr={isAr} /></Field>
          <Field label={t("Target employees", "الموظفين المستهدفين")}><CountSelect options={deptOptions} value={audience} onChange={setAudience} allLabel={t("All", "الكل")} isAr={isAr} /></Field>
        </div>
      </div>
    </WModal>
  )
}

/* ── image lightbox (4775:25339) ──────────────────────────────────────────── */

export function ImageLightbox({ src, onClose, isAr }: { src: string | null; onClose: () => void; isAr: boolean }) {
  React.useEffect(() => {
    if (!src) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [src, onClose])
  if (!src) return null
  return createPortal(
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4 backdrop-blur-[2px]" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      {/* 4775:25339: 964 wide, 32px sides, 84px header with the close X, 900×506 (16:9) image. */}
      <div role="dialog" aria-modal="true" dir={isAr ? "rtl" : "ltr"} className="relative w-full max-w-[964px] rounded-[12px] bg-secondary px-4 pb-[25px] pt-[84px] shadow-2xl sm:px-8">
        <button type="button" onClick={onClose} aria-label={isAr ? "إغلاق" : "Close"} className="absolute end-6 top-6 grid size-[34px] place-items-center rounded-[8px] text-foreground hover:bg-background/40">
          <X className="size-6" />
        </button>
        <img src={src} alt="" className="aspect-video max-h-[70vh] w-full rounded-[8px] object-cover" />
      </div>
    </div>,
    document.body,
  )
}

/** Category → Arabic label for authored news (shared by the cards). */
export const catAr = (c: string) => NEWS_CAT_AR[c] ?? c
