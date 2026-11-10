/** Knowledge (المعرفة) — Figma 2028:3744 / 4263:20763.
 *  Main column: Document management (folders + documents table) and FAQ.
 *  Side column: create launcher, polls & surveys, announcements, news. */
import * as React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useShell } from "@reach/shell-context"
import { cn } from "@reach/shared-core"
import {
  BadgeCheck, BookMarked, ChevronDown, ChevronUp, Download, Eye, FolderOpen, FolderUp,
  Lock, Megaphone, Newspaper, Plus, RotateCcw, Search, Trash2,
} from "lucide-react"

import {
  ActionTile, CardHead, DeletePopup, DirChevron, downloadCsv, EmptyState, Pager, RadioDot, ResultBar, Skeleton, Tag, toneForCategory,
  useAsAdmin, useFakeLoading, WButton, WCard, WPage, arNum,
} from "./_wijha"
import { CreateContentModal, CreateFolderModal, FaqModal, ImageLightbox, type ContentKind } from "./knowledge/KnowledgeModals"
import {
  deleteDocument, type Doc, type FolderDef, folderMeta, isArchived, ROOT_FOLDER, TYPE_STYLE, updateDocument, useDocuments, useFolders,
} from "../data/documents"
import { castVote, deletePoll, type KPoll, pollPct, pollTotal, usePolls } from "../data/polls"
import { deleteFaq, type Faq, useFaqs } from "../data/faqs"
import { annCatLabel, useAnnouncements } from "../data/announcements"
import { newsCatLabel, type NewsItem } from "../data/news"
import { hideSeedNews, usePublishedNews } from "../data/newsFeed"
import { deleteArticle, getArticleById } from "../store"
import { logAudit } from "../data/audit"

const PAGE = 24
/** Capture helper: "?modal=news|poll|folder|faq|image" opens that Knowledge popup
 *  (Figma 2485:3150 · 2464:2865 · 4775:25446 · 2485:3307 · 4775:25339). */
const useCaptureModal = () => new URLSearchParams(useLocation().search).get("modal")
const MONTHS: Record<string, number> = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 }
const dateKey = (s: string) => {
  if (/yesterday|today|just now/i.test(s)) return 99999999
  const m = /(\w+)\s+(\d+),\s+(\d+)/.exec(s)
  return m ? Number(m[3]) * 10000 + (MONTHS[m[1]] ?? 0) * 100 + Number(m[2]) : 0
}
const sizeBytes = (s: string) => { const m = /([\d.]+)\s*(KB|MB|GB)/i.exec(s); if (!m) return 0; const u = m[2].toUpperCase(); return parseFloat(m[1]) * (u === "GB" ? 1e9 : u === "MB" ? 1e6 : 1e3) }
type SortKey = "recent" | "name" | "downloads" | "size"
const TYPES: Doc["type"][] = ["PDF", "DOCX", "XLSX"]
const ARCHIVE_ID = "archive-2025"
type T = (en: string, ar: string) => string

export default function DocumentsPage() {
  const { locale, role } = useShell()
  const isAr = locale === "ar"
  const isAdmin = useAsAdmin(role)
  const t: T = (en, ar) => (isAr ? ar : en)

  const capture = useCaptureModal()
  const [createKind, setCreateKind] = React.useState<ContentKind | null>(() =>
    capture === "news" ? "news" : capture === "poll" ? "survey" : null)
  const [editNews, setEditNews] = React.useState<NewsItem | null>(null)
  const news = usePublishedNews()
  const [lightbox, setLightbox] = React.useState<string | null>(() => (capture === "image" ? news[0]?.img || null : null))

  return (
    <WPage>
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_394px]">
        <div className="flex min-w-0 flex-col gap-6">
          <DocumentsCard isAr={isAr} isAdmin={isAdmin} t={t} />
          <FaqCard isAr={isAr} isAdmin={isAdmin} t={t} />
        </div>
        <aside className="flex min-w-0 flex-col gap-6">
          {isAdmin && (
            <button type="button" onClick={() => { setEditNews(null); setCreateKind("news") }}
              className="panel flex h-16 w-full items-center gap-3 rounded-[12px] px-[18px] text-start transition-[filter] hover:brightness-110">
              <Plus className="size-5 shrink-0" />
              <span className="flex-1 text-[16px] font-medium">{t("Create a new news post or survey", "إنشاء خبر أو استبيان جديد")}</span>
              <DirChevron dir="forward" isAr={isAr} className="size-4 shrink-0 text-icon" />
            </button>
          )}
          <PollsCard isAr={isAr} isAdmin={isAdmin} t={t} />
          <AnnouncementsCard isAr={isAr} t={t} onImage={setLightbox} />
          <NewsCard isAr={isAr} isAdmin={isAdmin} t={t} onImage={setLightbox}
            onEdit={(n) => { setEditNews(n); setCreateKind("news") }} />
        </aside>
      </div>

      <CreateContentModal open={createKind !== null} onClose={() => { setCreateKind(null); setEditNews(null) }} isAr={isAr}
        initialKind={createKind ?? "news"} editNews={editNews} />
      <ImageLightbox src={lightbox} onClose={() => setLightbox(null)} isAr={isAr} />
    </WPage>
  )
}

type CardProps = { isAr: boolean; isAdmin: boolean; t: T }

/* ── Document management ──────────────────────────────────────────────────── */

function DocumentsCard({ isAr, isAdmin, t }: CardProps) {
  const navigate = useNavigate()
  const docs = useDocuments()
  const folders = useFolders()
  const loading = useFakeLoading()

  const [folder, setFolder] = React.useState<string | null>(null)
  const [q, setQ] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState<Doc["type"] | "all">("all")
  const [owner, setOwner] = React.useState("all")
  const [sort, setSort] = React.useState<SortKey>("recent")
  const [visible, setVisible] = React.useState(PAGE)
  const [newFolder, setNewFolder] = React.useState(useCaptureModal() === "folder")
  const [confirm, setConfirm] = React.useState<Doc | null>(null)
  React.useEffect(() => { setVisible(PAGE) }, [folder, q, typeFilter, owner, sort])

  const name = (f: FolderDef) => (isAr ? f.nameAr : f.name)
  const active = folders.find((f) => f.id === folder) ?? null
  const inArchive = folder === ARCHIVE_ID
  const childrenOf = React.useCallback((id: string | null) => folders.filter((f) => (f.parent ?? null) === id), [folders])
  const filesIn = React.useCallback((id: string) => (id === ARCHIVE_ID ? docs.filter((d) => isArchived(d)) : docs.filter((d) => d.folder === id && !isArchived(d))), [docs])
  const ownerOf = React.useCallback((d: Doc) => (isAr ? d.ownerPersonAr ?? d.ownerAr : d.ownerPerson ?? d.owner), [isAr])

  // breadcrumb trail root → current
  const trail: FolderDef[] = []
  for (let f: FolderDef | null = active; f; ) {
    trail.unshift(f)
    const parentId: string | null | undefined = f.parent
    f = folders.find((x) => x.id === parentId) ?? null
  }

  // every folder id under the current folder (search scope)
  const scope = React.useMemo(() => {
    const out = new Set<string>()
    const walk = (id: string | null) => childrenOf(id).forEach((c) => { out.add(c.id); walk(c.id) })
    walk(folder)
    return out
  }, [childrenOf, folder])

  const needle = q.trim().toLowerCase()
  const subfolders = childrenOf(folder).filter((f) => !needle || name(f).toLowerCase().includes(needle))
  const owners = React.useMemo(() => Array.from(new Set(docs.map(ownerOf))).sort(), [docs, ownerOf])

  const rows = React.useMemo(() => {
    let out: Doc[]
    if (inArchive) out = docs.filter((d) => isArchived(d))
    else if (needle) out = docs.filter((d) => !isArchived(d) && (d.folder === (folder ?? ROOT_FOLDER) || scope.has(d.folder)))
    else out = docs.filter((d) => !isArchived(d) && d.folder === (folder ?? ROOT_FOLDER))
    out = out.filter((d) =>
      (typeFilter === "all" || d.type === typeFilter) &&
      (owner === "all" || ownerOf(d) === owner) &&
      (!needle || (isAr ? d.nameAr : d.name).toLowerCase().includes(needle)))
    const s = [...out]
    if (sort === "recent") s.sort((a, b) => dateKey(b.updated) - dateKey(a.updated))
    else if (sort === "name") s.sort((a, b) => (isAr ? a.nameAr : a.name).localeCompare(isAr ? b.nameAr : b.name))
    else if (sort === "downloads") s.sort((a, b) => b.downloads - a.downloads)
    else s.sort((a, b) => sizeBytes(b.size) - sizeBytes(a.size))
    return s
  }, [docs, folder, scope, inArchive, needle, typeFilter, owner, sort, isAr, ownerOf])
  const shown = rows.slice(0, visible)

  const download = (d: Doc) => { updateDocument(d.id, { downloads: d.downloads + 1 }) }

  return (
    <WCard aria-label={t("Document management", "إدارة المستندات")}>
      <CardHead icon={FolderOpen} title={t("Document Management", "إدارة المستندات")}
        actions={isAdmin ? <>
          <WButton variant="outline" size="sm" className="min-w-[108px]" disabled={!!active?.readOnly}
            onClick={() => navigate(`/documents/new${folder && !active?.readOnly ? `?folder=${folder}` : ""}`)}>
            <FolderUp />{t("Upload Document", "رفع مستند")}
          </WButton>
          <WButton size="sm" className="min-w-[108px]" disabled={!!active?.readOnly} onClick={() => setNewFolder(true)}>
            <Plus />{t("New Folder", "مجلد جديد")}
          </WButton>
        </> : undefined} />

      {/* filters */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label className="flex h-9 min-w-[12rem] flex-1 items-center gap-2 rounded-[8px] bg-background pe-2 ps-3">
          <Search className="size-4 shrink-0 text-icon" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search", "البحث")} aria-label={t("Search documents", "البحث في المستندات")}
            className="h-full w-full bg-transparent text-[12px] outline-none placeholder:text-muted-foreground" />
        </label>
        <FilterSelect label={t("Type", "النوع")} value={typeFilter} onChange={(v) => setTypeFilter(v as Doc["type"] | "all")}
          options={[{ v: "all", l: t("Type", "النوع") }, ...TYPES.map((ty) => ({ v: ty, l: ty }))]} />
        <FilterSelect label={t("Owner", "المالك")} value={owner} onChange={setOwner}
          options={[{ v: "all", l: t("Owner", "المالك") }, ...owners.map((o) => ({ v: o, l: o }))]} />
        <FilterSelect label={t("Sort by", "الترتيب حسب")} value={sort} onChange={(v) => setSort(v as SortKey)}
          options={[
            { v: "recent", l: t("Sort by", "الترتيب حسب") },
            { v: "name", l: t("Name (A–Z)", "الاسم (أ–ي)") },
            { v: "downloads", l: t("Most downloaded", "الأكثر تحميلًا") },
            { v: "size", l: t("Largest", "الأكبر حجمًا") },
          ]} />
      </div>

      {/* folder breadcrumb */}
      <nav aria-label={t("Folder path", "مسار المجلد")} className="mt-3 flex flex-wrap items-center gap-2 pe-2 text-[10px] leading-[14px]">
        <button type="button" onClick={() => setFolder(null)} className={cn("hover:text-primary", !active && "font-bold")}>{t("Documents", "المستندات")}</button>
        {trail.map((f, i) => (
          <React.Fragment key={f.id}>
            <DirChevron dir="forward" isAr={isAr} className="size-2.5 text-icon" />
            <button type="button" onClick={() => setFolder(f.id)} className={cn("hover:text-primary", i === trail.length - 1 && "font-bold")}>{name(f)}</button>
          </React.Fragment>
        ))}
      </nav>

      {/* folder tiles */}
      {loading ? (
        <div className="grid gap-4 pt-[27px] sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[62px]" />)}</div>
      ) : subfolders.length > 0 && (
        <div className="grid gap-4 pt-[27px] sm:grid-cols-2 lg:grid-cols-3">
          {subfolders.map((f) => (
            <button key={f.id} type="button" onClick={() => { setFolder(f.id); setQ("") }}
              className="group flex h-[62px] items-center gap-3 rounded-[8px] bg-background p-[14px] text-start transition-shadow hover:ring-1 hover:ring-primary/30">
              <span className={cn("grid size-[34px] shrink-0 place-items-center rounded-[8px]", f.readOnly ? "bg-secondary text-icon" : "accent-chip")}>
                <FolderOpen className="size-4" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-[5px]">
                <span className="truncate text-[13px] leading-4">{name(f)}</span>
                <span className="flex items-center gap-1 truncate text-[11px] leading-[13px] text-muted-foreground">
                  {f.readOnly ? <><Lock className="size-3" />{t("Read-only", "للقراءة فقط")}</> : folderMeta(childrenOf(f.id).length, filesIn(f.id).length, isAr)}
                </span>
              </span>
              <DirChevron dir="forward" isAr={isAr} className="size-4 shrink-0 text-foreground/80" />
            </button>
          ))}
        </div>
      )}

      {/* documents in this folder */}
      <div className="flex flex-col gap-3 pt-[34px]">
        <h3 className="text-[14px]">
          {needle ? t("Search results", "نتائج البحث") : inArchive ? t("Archived documents", "المستندات المؤرشفة") : t("Documents in this folder", "مستندات هذا المجلد")}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] table-fixed border-t border-secondary text-[13px]">
            <colgroup><col className="w-[45%]" /><col className="w-[15%]" /><col className="w-[10.3%]" /><col /><col className="w-[140px]" /></colgroup>
            <thead>
              <tr className="h-9 border-b border-secondary text-[12px] text-muted-foreground">
                <th className="pe-1 ps-[70px] text-start font-normal">{t("File Name", "اسم الملف")}</th>
                <th className="px-1 text-start font-normal">{t("Owner", "المالك")}</th>
                <th className="px-1 text-start font-normal">{t("File Size", "حجم الملف")}</th>
                <th className="px-1 text-start font-normal">{t("Upload Date", "تاريخ الرفع")}</th>
                <th className="w-[140px] px-1"><span className="sr-only">{t("Actions", "الإجراءات")}</span></th>
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 2 }).map((_, i) => (
                <tr key={i}><td colSpan={5} className="px-1 py-3"><Skeleton className="h-[34px]" /></td></tr>
              )) : shown.map((d) => (
                <tr key={d.id} className="h-[58px] border-b border-secondary/60 last:border-0">
                  <td className="px-1 py-3">
                    <button type="button" onClick={() => navigate(`/documents/${d.id}`)} className="flex min-w-0 items-center gap-8 text-start hover:text-primary">
                      <span className={cn("grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[8px] text-[10px] font-bold", TYPE_STYLE[d.type])}>{d.type}</span>
                      <span className="truncate">{isAr ? d.nameAr : d.name}</span>
                      {d.restricted && <Lock className="size-3.5 shrink-0 text-icon" aria-label={t("Restricted", "مقيّد")} />}
                    </button>
                  </td>
                  <td className="px-1 py-3">{ownerOf(d)}</td>
                  <td className="px-1 py-3 tabular-nums"><bdi>{d.size}</bdi></td>
                  <td className="px-1 py-3">{isAr ? d.updatedAr : d.updated}</td>
                  <td className="px-1 py-3">
                    <div className="flex items-center justify-end gap-3">
                      {isAdmin && (isArchived(d)
                        ? <ActionTile label={t("Restore", "استعادة")} onClick={() => { updateDocument(d.id, { archiveAfter: null }); logAudit("restored", d.name, "Documents") }}><RotateCcw /></ActionTile>
                        : <ActionTile tone="error" label={t("Delete", "حذف")} onClick={() => setConfirm(d)}><Trash2 /></ActionTile>)}
                      <ActionTile label={t("View", "عرض")} onClick={() => navigate(`/documents/${d.id}`)}><Eye /></ActionTile>
                      <ActionTile label={t("Download", "تحميل")} onClick={() => download(d)}><Download /></ActionTile>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && rows.length === 0 && (
          <EmptyState icon={needle ? Search : FolderOpen}
            title={needle ? t("No documents match your search", "لا توجد مستندات مطابقة لبحثك") : t("No documents in this folder", "لا توجد مستندات في هذا المجلد")}
            desc={needle ? t("Try another name, or clear the filters.", "جرّب اسمًا آخر أو امسح عوامل التصفية.") : active?.readOnly ? t("This folder is read-only.", "هذا المجلد للقراءة فقط.") : undefined} />
        )}
        {visible < rows.length && (
          <div className="flex justify-center"><WButton variant="outline" onClick={() => setVisible((v) => v + PAGE)}>{t("Load more", "تحميل المزيد")} · {arNum(rows.length - visible, isAr)}</WButton></div>
        )}
      </div>

      <CreateFolderModal open={newFolder} onClose={() => setNewFolder(false)} isAr={isAr} folders={folders}
        currentId={folder && !active?.readOnly ? folder : null} onCreated={(id) => setFolder(id)} />
      <DeletePopup open={!!confirm} onClose={() => setConfirm(null)} isAr={isAr}
        title={t("Delete this document?", "هل تريد حذف هذا المستند؟")}
        body={t("The document will be removed from the portal permanently. This can't be undone.", "سيُحذف المستند نهائيًا من البوابة، ولا يمكن التراجع عن هذا الإجراء")}
        confirmLabel={t("Delete document", "حذف المستند")}
        onConfirm={() => { if (confirm) { deleteDocument(confirm.id); logAudit("deleted", confirm.name, "Documents") } setConfirm(null) }} />
    </WCard>
  )
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <span className="relative block w-[120px] shrink-0">
      <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full appearance-none truncate rounded-[8px] bg-card-elevated pe-8 ps-3 text-[13px] outline-none focus-visible:ring-1 focus-visible:ring-primary/60">
        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute end-2 top-1/2 size-4 -translate-y-1/2 text-icon" />
    </span>
  )
}

/* ── FAQ ──────────────────────────────────────────────────────────────────── */

function FaqCard({ isAr, isAdmin, t }: CardProps) {
  const faqs = useFaqs().filter((f) => isAdmin || f.status !== "Draft")
  const loading = useFakeLoading()
  const [openId, setOpenId] = React.useState<string | null>("fk1")
  const [modal, setModal] = React.useState<{ edit: Faq | null } | null>(useCaptureModal() === "faq" ? { edit: null } : null)
  const [confirm, setConfirm] = React.useState<Faq | null>(null)
  const list = faqs.slice(0, 5)

  return (
    <WCard className="flex flex-col gap-[18px]">
      <CardHead icon={BookMarked} title={t("FAQs", "الأسئلة الشائعة")}
        actions={isAdmin ? <WButton size="sm" className="min-w-[108px]" onClick={() => setModal({ edit: null })}>{t("Add Question", "إضافة سؤال")}<Plus /></WButton> : undefined} />
      {loading ? (
        <div className="flex flex-col gap-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
      ) : list.length === 0 ? (
        <EmptyState icon={BookMarked} title={t("No questions yet", "لا توجد أسئلة بعد")} />
      ) : (
        <div className="flex flex-col">
          {list.map((f) => {
            const isOpen = openId === f.id
            const link = f.relatedLinks[0]
            return isOpen ? (
              <div key={f.id} className="flex flex-col gap-2.5 rounded-[8px] border border-primary/45 bg-background px-4 pb-3.5 pt-3">
                <button type="button" onClick={() => setOpenId(null)} aria-expanded="true" className="flex items-center gap-3 text-start">
                  <span className="flex-1 text-[12px] font-medium leading-[14px]">{isAr ? f.qAr : f.q}</span>
                  <ChevronUp className="size-4 shrink-0 text-icon" />
                </button>
                <p className="text-[12px] leading-5 text-muted-foreground">
                  {isAr ? f.aAr : f.a}
                  {f.status === "Draft" && <Tag tone="muted" className="ms-2 h-5 text-[10px]">{t("Draft", "مسودة")}</Tag>}
                  {link && <>{" "}<a href={link.url.startsWith("/") ? `#${link.url}` : link.url} className="font-bold text-primary underline underline-offset-2">{t("Link", "رابط")}</a></>}
                </p>
                {isAdmin && (
                  <div className="flex justify-start gap-2">
                    <WButton variant="outline" className="w-[84px]" onClick={() => setModal({ edit: f })}>{t("Edit", "تعديل")}</WButton>
                    <WButton variant="danger" className="w-[84px]" onClick={() => setConfirm(f)}><Trash2 />{t("Delete", "حذف")}</WButton>
                  </div>
                )}
              </div>
            ) : (
              <button key={f.id} type="button" onClick={() => setOpenId(f.id)} aria-expanded="false"
                className="flex items-center gap-3 border-b border-secondary px-4 pb-4 pt-[17px] text-start last:border-0 last:pb-0 hover:text-primary">
                <span className="flex-1 text-[12px] leading-[14px]">{isAr ? f.qAr : f.q}</span>
                <ChevronDown className="size-4 shrink-0 text-icon" />
              </button>
            )
          })}
        </div>
      )}
      <FaqModal open={!!modal} onClose={() => setModal(null)} isAr={isAr} edit={modal?.edit} />
      <DeletePopup open={!!confirm} onClose={() => setConfirm(null)} isAr={isAr}
        title={t("Delete this question?", "هل تريد حذف هذا السؤال؟")}
        body={t("The question will be removed from the portal permanently. This can't be undone.", "سيُحذف السؤال نهائيًا من البوابة، ولا يمكن التراجع عن هذا الإجراء")}
        confirmLabel={t("Delete question", "حذف السؤال")}
        onConfirm={() => { if (confirm) { deleteFaq(confirm.id); logAudit("deleted", confirm.q, "FAQs") } setConfirm(null) }} />
    </WCard>
  )
}

/* ── Polls & surveys ──────────────────────────────────────────────────────── */

function PollsCard({ isAr, isAdmin, t }: CardProps) {
  const polls = usePolls().filter((p) => p.status !== "draft")
  const loading = useFakeLoading()
  // Capture helper: "?poll=N" opens the card on the Nth published poll/survey
  // (1 = closed poll results 2441:5698, 2 = survey results 4352:14026).
  const [i, setI] = React.useState(() => Number(new URLSearchParams(useLocation().search).get("poll")) || 0)
  const [pick, setPick] = React.useState<string | null>(null)
  const [confirm, setConfirm] = React.useState<KPoll | null>(null)
  const idx = Math.min(i, Math.max(0, polls.length - 1))
  const p = polls[idx]
  const pid = p?.id
  React.useEffect(() => { setPick(null) }, [pid])

  return (
    <WCard className="px-4 pb-6 sm:px-4">
      <CardHead icon={BadgeCheck} title={t("Surveys & Polls", "الاستبيانات والتصويت")}
        actions={polls.length > 1 ? <Pager isAr={isAr} onPrev={() => setI(Math.max(0, idx - 1))} onNext={() => setI(Math.min(polls.length - 1, idx + 1))} prevDisabled={idx === 0} nextDisabled={idx >= polls.length - 1} /> : undefined} />
      <div className="mt-[18px]">
        {loading ? <Skeleton className="h-[250px]" /> : !p ? (
          <EmptyState icon={BadgeCheck} title={t("No open surveys or polls", "لا توجد استبيانات أو تصويتات حالية")} />
        ) : (
          <PollBody p={p} isAr={isAr} isAdmin={isAdmin} t={t} pick={pick} setPick={setPick} onDelete={() => setConfirm(p)} />
        )}
      </div>
      <DeletePopup open={!!confirm} onClose={() => setConfirm(null)} isAr={isAr}
        title={confirm?.kind === "survey" ? t("Delete this survey?", "هل تريد حذف هذا الاستبيان؟") : t("Delete this poll?", "هل تريد حذف هذا التصويت؟")}
        body={t("It will be removed from the portal permanently, with its results. This can't be undone.", "سيُحذف نهائيًا من البوابة مع نتائجه، ولا يمكن التراجع عن هذا الإجراء")}
        confirmLabel={t("Delete", "حذف")}
        onConfirm={() => { if (confirm) { deletePoll(confirm.id); logAudit("deleted", confirm.question, "Surveys") } setConfirm(null) }} />
    </WCard>
  )
}

/** Poll / survey card body — voting (2028:3744), poll results (2441:5698) and
 *  survey results (4352:14026). */
function PollBody({ p, isAr, isAdmin, t, pick, setPick, onDelete }: {
  p: KPoll; isAr: boolean; isAdmin: boolean; t: T
  pick: string | null; setPick: (v: string | null) => void; onDelete: () => void
}) {
  const voting = p.status === "open" && !p.myVote
  const total = pollTotal(p)
  const exportXlsx = () => downloadCsv(`${p.question.slice(0, 40)}.csv`, [
    [t("Option", "الخيار"), t("Votes", "الأصوات"), "%"],
    ...p.options.map((o) => [isAr ? o.labelAr : o.label, o.votes, pollPct(p, o)]),
    [t("Total", "الإجمالي"), total, 100],
  ])
  return (
    <div className="flex flex-col gap-3 rounded-[8px] bg-background p-4">
      <div className="flex items-center gap-3">
        <Tag className="text-[10.5px] font-semibold">{p.kind === "survey" ? t("Surveys", "الاستبيانات") : t("Vote", "تصويت")}</Tag>
        {p.kind === "poll" && <span className="text-[10.4px] leading-[11.5px] text-muted-foreground">{isAr ? p.whenAr : p.when}</span>}
      </div>
      <h3 className="text-[14px] font-medium leading-[22px]">{isAr ? p.questionAr : p.question}</h3>
      {voting ? (
        <>
          <div role="radiogroup" aria-label={isAr ? p.questionAr : p.question} className="flex flex-col gap-3">
            {p.options.map((o) => (
              <button key={o.id} type="button" role="radio" aria-checked={pick === o.id} onClick={() => setPick(o.id)}
                className="flex items-center gap-2 text-start text-[13px] leading-4">
                <RadioDot on={pick === o.id} />{isAr ? o.labelAr : o.label}
              </button>
            ))}
          </div>
          <p className="-mb-0.5 text-[11px] leading-[14px] text-muted-foreground">{t("Choose an answer, then tap “Vote” to see results", "اختر إجابة ثم اضغط «تصويت» لعرض النتائج")}</p>
        </>
      ) : (
        <div className="flex flex-col gap-2">
          {p.options.map((o) => (
            <ResultBar key={o.id} label={isAr ? o.labelAr : o.label} pct={pollPct(p, o)} radio={p.kind === "poll"} selected={p.myVote === o.id} />
          ))}
        </div>
      )}
      <div className={cn("flex flex-wrap items-center justify-between gap-3", !voting && "pt-6")}>
        <span className="text-[11px] text-muted-foreground">{arNum(total, isAr)} {t("responses", "مشاركة")}</span>
        <div className="flex items-center gap-2">
          {voting ? (
            <WButton className="w-[86px]" disabled={!pick} onClick={() => { if (pick) { castVote(p.id, pick); setPick(null) } }}>{t("Vote", "تصويت")}</WButton>
          ) : isAdmin ? (
            <WButton className="px-6" onClick={exportXlsx}><Download />{t("Export to Excel", "تصدير إلى إكسل")}</WButton>
          ) : null}
          {isAdmin && <WButton variant="danger" className="w-[84px]" onClick={onDelete}><Trash2 />{t("Delete", "حذف")}</WButton>}
        </div>
      </div>
    </div>
  )
}

/* ── Announcements + News carousels ───────────────────────────────────────── */

function StoryBody({ img, tag, tagTone, meta, title, excerpt, onImage, isAr }: {
  img?: string; tag: string; tagTone: ReturnType<typeof toneForCategory>; meta: string; title: string; excerpt: string; onImage: (src: string) => void; isAr: boolean
}) {
  return (
    <div className="flex flex-col gap-3.5 pt-3.5">
      {img ? (
        <button type="button" onClick={() => onImage(img)} aria-label={isAr ? "عرض الصورة" : "View image"} className="block overflow-hidden rounded-[8px]">
          <img src={img} alt="" loading="lazy" className="aspect-[358/201] w-full object-cover transition-transform duration-300 hover:scale-[1.02]" />
        </button>
      ) : (
        <div className="grid aspect-[358/201] w-full place-items-center rounded-[8px] bg-secondary text-icon"><Newspaper className="size-8" /></div>
      )}
      <div className="flex items-center gap-2.5">
        <Tag tone={tagTone} className="text-[10.5px] font-semibold">{tag}</Tag>
        <span className="text-[10.4px] leading-[11.5px] text-muted-foreground">{meta}</span>
      </div>
      <h3 className="text-[13px] font-medium leading-[22px]">{title}</h3>
      <p className="line-clamp-2 min-h-[40px] text-[11.3px] leading-5 text-muted-foreground rtl:line-clamp-3 rtl:min-h-[60px]">{excerpt}</p>
    </div>
  )
}

export const readMeta = (date: string, mins: number | undefined, isAr: boolean) =>
  isAr ? `${date} · قراءة ${mins ?? 2} د` : `${date} · ${mins ?? 2} min read`

function AnnouncementsCard({ isAr, t, onImage }: { isAr: boolean; t: T; onImage: (src: string) => void }) {
  const navigate = useNavigate()
  const items = useAnnouncements()
  const loading = useFakeLoading()
  const [i, setI] = React.useState(0)
  const idx = Math.min(i, Math.max(0, items.length - 1))
  const a = items[idx]
  return (
    <WCard className="px-[18px] sm:px-[18px]">
      <CardHead icon={Megaphone} title={t("Circulars", "التعاميم")}
        actions={items.length > 1 ? <Pager isAr={isAr} onPrev={() => setI(Math.max(0, idx - 1))} onNext={() => setI(Math.min(items.length - 1, idx + 1))} prevDisabled={idx === 0} nextDisabled={idx >= items.length - 1} /> : undefined} />
      {loading ? <Skeleton className="mt-3.5 h-[360px]" /> : !a ? (
        <EmptyState className="mt-4" icon={Megaphone} title={t("No announcements", "لا توجد تعاميم")} />
      ) : (
        <>
          <StoryBody img={a.img} tag={annCatLabel(a, isAr)} tagTone={toneForCategory(a.category)}
            meta={readMeta(isAr ? a.dateAr : a.date, a.readMin, isAr)} title={isAr ? a.titleAr : a.title} excerpt={isAr ? a.bodyAr : a.body} onImage={onImage} isAr={isAr} />
          <div className="mt-4 flex justify-end gap-2">
            <WButton className="w-32" onClick={() => navigate(`/announcements/${a.id}`)}>{t("View Details", "عرض التفاصيل")}</WButton>
          </div>
        </>
      )}
    </WCard>
  )
}

function NewsCard({ isAr, isAdmin, t, onImage, onEdit }: CardProps & { onImage: (src: string) => void; onEdit: (n: NewsItem) => void }) {
  const navigate = useNavigate()
  const items = usePublishedNews()
  const loading = useFakeLoading()
  const [i, setI] = React.useState(0)
  const [confirm, setConfirm] = React.useState<NewsItem | null>(null)
  const idx = Math.min(i, Math.max(0, items.length - 1))
  const n = items[idx]
  const remove = (x: NewsItem) => {
    if (getArticleById(x.id)) deleteArticle(x.id)
    else hideSeedNews(x.id)
    logAudit("deleted", x.title, "News")
  }
  return (
    <WCard className="px-[18px] sm:px-[18px]">
      <CardHead icon={Newspaper} title={t("News", "الأخبار")}
        actions={items.length > 1 ? <Pager isAr={isAr} onPrev={() => setI(Math.max(0, idx - 1))} onNext={() => setI(Math.min(items.length - 1, idx + 1))} prevDisabled={idx === 0} nextDisabled={idx >= items.length - 1} /> : undefined} />
      {loading ? <Skeleton className="mt-3.5 h-[360px]" /> : !n ? (
        <EmptyState className="mt-4" icon={Newspaper} title={t("No news yet", "لا توجد أخبار بعد")} />
      ) : (
        <>
          <StoryBody img={n.img || undefined} tag={newsCatLabel(n.category, isAr)} tagTone={toneForCategory(n.category)}
            meta={readMeta(isAr ? n.dateAr ?? n.date : n.date, n.readMin, isAr)} title={isAr ? n.titleAr : n.title}
            excerpt={isAr ? n.excerptAr ?? n.excerpt : n.excerpt} onImage={onImage} isAr={isAr} />
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <WButton className="w-32" onClick={() => navigate(`/news/${n.id}`)}>{t("View Details", "عرض التفاصيل")}</WButton>
            {isAdmin && <>
              <WButton variant="outline" className="w-[84px]" onClick={() => onEdit(n)}>{t("Edit", "تعديل")}</WButton>
              <WButton variant="danger" className="w-[84px]" onClick={() => setConfirm(n)}><Trash2 />{t("Delete", "حذف")}</WButton>
            </>}
          </div>
        </>
      )}
      <DeletePopup open={!!confirm} onClose={() => setConfirm(null)} isAr={isAr}
        title={t("Delete this news item?", "هل تريد حذف هذا الخبر؟")}
        body={t("The news item will be removed from the portal permanently. This can't be undone.", "سيُحذف الخبر نهائيًا من البوابة، ولا يمكن التراجع عن هذا الإجراء")}
        confirmLabel={t("Delete news", "حذف الخبر")}
        onConfirm={() => { if (confirm) remove(confirm); setConfirm(null) }} />
    </WCard>
  )
}
