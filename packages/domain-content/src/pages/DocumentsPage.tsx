import * as React from "react"
import { useNavigate } from "react-router-dom"
import {
  Badge, Button, Card, Input,
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@reach/shared-ui"
import { useShell } from "@reach/shell-context"
import { cn } from "@reach/shared-core"
import { Archive, ChevronRight, Clock, Download, Eye, FileText, Folder, FolderOpen, FolderPlus, History, Lock, Plus, RotateCcw, Search, Trash2, Upload, X } from "lucide-react"

import { PageHeader, StatCard } from "./_ui"
import { addFolder, deleteDocument, type Doc, type FolderDef, formatDocDate, isArchived, isArchiveScheduled, newFolderId, TYPE_STYLE, updateDocument, useDocuments, useFolders } from "../data/documents"
import { logAudit } from "../data/audit"

const PAGE = 24
const MONTHS: Record<string, number> = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 }
const dateKey = (s: string) => { const m = /(\w+)\s+(\d+),\s+(\d+)/.exec(s); return m ? Number(m[3]) * 10000 + (MONTHS[m[1]] ?? 0) * 100 + Number(m[2]) : 0 }
const sizeBytes = (s: string) => { const m = /([\d.]+)\s*(KB|MB|GB)/i.exec(s); if (!m) return 0; const u = m[2].toUpperCase(); return parseFloat(m[1]) * (u === "GB" ? 1e9 : u === "MB" ? 1e6 : 1e3) }
type SortKey = "recent" | "name" | "downloads" | "size"
const TYPES: Doc["type"][] = ["PDF", "DOCX", "XLSX"]

export default function DocumentsPage() {
  const { locale, role } = useShell()
  const isAr = locale === "ar"
  const isAdmin = role === "admin"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()

  const docs = useDocuments()
  const folders = useFolders()

  const [folder, setFolder] = React.useState<string | null>(null)
  const [q, setQ] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState<Doc["type"] | "all">("all")
  const [sort, setSort] = React.useState<SortKey>("recent")
  const [showArchived, setShowArchived] = React.useState(false)
  const [visible, setVisible] = React.useState(PAGE)

  const archivedCount = React.useMemo(() => docs.filter((d) => isArchived(d)).length, [docs])

  // folder tree state
  const [folderQuery, setFolderQuery] = React.useState("")
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set())
  const [creating, setCreating] = React.useState(false)
  const [newName, setNewName] = React.useState("")

  const [confirmId, setConfirmId] = React.useState<string | null>(null)
  const confirmItem = docs.find((d) => d.id === confirmId)

  const open = (id: string) => navigate(`/documents/${id}`)
  const docCount = React.useCallback((fid: string) => docs.filter((d) => d.folder === fid && isArchived(d) === showArchived).length, [docs, showArchived])
  const folderName = (f: FolderDef) => (isAr ? f.nameAr : f.name)
  const activeFolder = folders.find((f) => f.id === folder)
  const topFolders = folders.filter((f) => !f.parent)
  const childrenOf = (id: string) => folders.filter((f) => f.parent === id)

  // reset pagination whenever the query set changes
  React.useEffect(() => { setVisible(PAGE) }, [folder, q, typeFilter, sort, showArchived])

  const filtered = React.useMemo(() => {
    const out = docs.filter((d) =>
      isArchived(d) === showArchived &&
      (folder === null || d.folder === folder) &&
      (typeFilter === "all" || d.type === typeFilter) &&
      (q === "" || (isAr ? d.nameAr : d.name).toLowerCase().includes(q.toLowerCase())),
    )
    const sorted = [...out]
    if (sort === "recent") sorted.sort((a, b) => dateKey(b.updated) - dateKey(a.updated))
    else if (sort === "name") sorted.sort((a, b) => (isAr ? a.nameAr : a.name).localeCompare(isAr ? b.nameAr : b.name))
    else if (sort === "downloads") sorted.sort((a, b) => b.downloads - a.downloads)
    else if (sort === "size") sorted.sort((a, b) => sizeBytes(b.size) - sizeBytes(a.size))
    return sorted
  }, [docs, folder, typeFilter, q, sort, isAr, showArchived])

  const shown = filtered.slice(0, visible)

  const matchedFolders = folderQuery.trim()
    ? folders.filter((f) => folderName(f).toLowerCase().includes(folderQuery.trim().toLowerCase()))
    : []

  const createFolder = () => {
    const name = newName.trim()
    if (!name) return
    const id = newFolderId()
    addFolder({ id, name, nameAr: name, count: 0, parent: folder ?? null })
    logAudit("created", `${t("Folder", "مجلد")}: ${name}`, "Documents")
    if (folder) setExpanded((s) => new Set(s).add(folder))
    setFolder(id)
    setNewName(""); setCreating(false)
  }

  const FolderRow = ({ f, depth }: { f: FolderDef; depth: number }) => {
    const kids = childrenOf(f.id)
    const isOpen = expanded.has(f.id)
    const active = folder === f.id
    return (
      <div>
        <div className={cn("group flex items-center gap-1 rounded-lg pe-1.5 transition-colors", active ? "bg-primary/10" : "hover:bg-muted")} style={{ paddingInlineStart: `${depth * 14 + 4}px` }}>
          {kids.length > 0 ? (
            <button onClick={() => setExpanded((s) => { const n = new Set(s); n.has(f.id) ? n.delete(f.id) : n.add(f.id); return n })} className="grid size-5 shrink-0 place-items-center rounded text-muted-foreground hover:text-foreground" aria-label={t("Toggle", "طي")}>
              <ChevronRight className={cn("size-3.5 transition-transform", isOpen && "rotate-90", isAr && !isOpen && "rotate-180")} />
            </button>
          ) : <span className="size-5 shrink-0" />}
          <button onClick={() => setFolder(active ? null : f.id)} className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-start">
            {active ? <FolderOpen className="size-4 shrink-0 text-primary" /> : <Folder className={cn("size-4 shrink-0", active ? "text-primary" : "text-primary/70")} />}
            <span className={cn("truncate text-sm", active ? "font-medium text-primary" : "text-foreground/90")}>{folderName(f)}</span>
            <span className="ms-auto shrink-0 text-[11px] tabular-nums text-muted-foreground">{docCount(f.id)}</span>
          </button>
        </div>
        {isOpen && kids.map((k) => <FolderRow key={k.id} f={k} depth={depth + 1} />)}
      </div>
    )
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        icon={FolderOpen}
        eyebrow={t("Document Library", "مكتبة المستندات")}
        title={t("Company documents", "مستندات الشركة")}
        desc={t("Folders, versioning, department-based access and download tracking across all document types.", "مجلدات وإصدارات وصلاحيات حسب الإدارة وتتبّع التحميلات لكل أنواع الملفات.")}
        action={isAdmin ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="lg" onClick={() => navigate("/admin/audit?module=Documents")}><History className="size-4" />{t("Audit log", "سجل التدقيق")}</Button>
            <Button size="lg" onClick={() => navigate("/documents/new")}><Upload className="size-4" />{t("Upload", "رفع ملف")}</Button>
          </div>
        ) : undefined}
      />

      {isAdmin && (
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={FileText} value={(docs.length - archivedCount).toLocaleString()} label={t("Active documents", "مستندات نشطة")} />
          <StatCard icon={Folder} value={String(folders.length)} label={t("Folders", "مجلدات")} />
          <StatCard icon={Archive} value={String(archivedCount)} label={t("Archived", "مؤرشفة")} />
          <StatCard icon={Download} value="9.4k" label={t("Downloads", "تحميلات")} sub={t("this month", "هذا الشهر")} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[268px_minmax(0,1fr)]">
        {/* folder tree sidebar */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Card className="p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="ps-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">{t("Folders", "المجلدات")}</span>
              {isAdmin && (
                <Button variant="ghost" size="icon-sm" aria-label={t("New folder", "مجلد جديد")} onClick={() => { setCreating((v) => !v); setNewName("") }}><FolderPlus className="size-4" /></Button>
              )}
            </div>

            {/* inline new-folder input (never a popup) */}
            {isAdmin && creating && (
              <div className="mb-2 rounded-lg border border-primary/40 bg-primary/[0.04] p-2">
                <p className="mb-1.5 px-0.5 text-[11px] text-muted-foreground">{folder ? `${t("New folder in", "مجلد جديد في")} “${activeFolder ? folderName(activeFolder) : ""}”` : t("New top-level folder", "مجلد رئيسي جديد")}</p>
                <div className="flex items-center gap-1.5">
                  <Input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); createFolder() } if (e.key === "Escape") { setCreating(false); setNewName("") } }} placeholder={t("Folder name", "اسم المجلد")} className="h-8 flex-1 text-sm" />
                  <Button size="icon-sm" disabled={!newName.trim()} onClick={createFolder} aria-label={t("Create", "إنشاء")}><Plus className="size-4" /></Button>
                  <Button size="icon-sm" variant="ghost" onClick={() => { setCreating(false); setNewName("") }} aria-label={t("Cancel", "إلغاء")}><X className="size-4" /></Button>
                </div>
              </div>
            )}

            {/* folder search */}
            <div className="relative mb-2">
              <Search className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input value={folderQuery} onChange={(e) => setFolderQuery(e.target.value)} placeholder={t("Find a folder…", "ابحث عن مجلد…")} className="h-9 ps-8 text-sm" />
            </div>

            <div className="max-h-[56vh] space-y-0.5 overflow-y-auto pe-1">
              {/* all documents */}
              <button onClick={() => setFolder(null)} className={cn("flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-start transition-colors", folder === null ? "bg-primary/10" : "hover:bg-muted")}>
                <FolderOpen className={cn("size-4 shrink-0", folder === null ? "text-primary" : "text-primary/70")} />
                <span className={cn("text-sm", folder === null ? "font-medium text-primary" : "text-foreground/90")}>{t("All documents", "كل المستندات")}</span>
                <span className="ms-auto text-[11px] tabular-nums text-muted-foreground">{docs.length}</span>
              </button>

              {folderQuery.trim() ? (
                matchedFolders.length > 0 ? matchedFolders.map((f) => (
                  <button key={f.id} onClick={() => { setFolder(f.id); setFolderQuery("") }} className={cn("flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-start transition-colors", folder === f.id ? "bg-primary/10" : "hover:bg-muted")}>
                    <Folder className="size-4 shrink-0 text-primary/70" />
                    <span className="truncate text-sm">{folderName(f)}</span>
                    {f.parent && <span className="truncate text-[11px] text-muted-foreground">· {folderName(folders.find((x) => x.id === f.parent)!)}</span>}
                    <span className="ms-auto shrink-0 text-[11px] tabular-nums text-muted-foreground">{docCount(f.id)}</span>
                  </button>
                )) : <p className="px-2 py-4 text-center text-xs text-muted-foreground">{t("No folders match", "لا توجد مجلدات مطابقة")}</p>
              ) : (
                topFolders.map((f) => <FolderRow key={f.id} f={f} depth={0} />)
              )}
            </div>
          </Card>
        </aside>

        {/* documents */}
        <section className="min-w-0">
          {/* breadcrumb + count */}
          <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1">
            <button onClick={() => setFolder(null)} className="text-sm text-muted-foreground transition-colors hover:text-foreground">{t("Library", "المكتبة")}</button>
            {activeFolder?.parent && (
              <>
                <ChevronRight className={cn("size-3.5 text-muted-foreground/50", isAr && "rotate-180")} />
                <button onClick={() => setFolder(activeFolder.parent!)} className="text-sm text-muted-foreground transition-colors hover:text-foreground">{folderName(folders.find((x) => x.id === activeFolder.parent)!)}</button>
              </>
            )}
            {activeFolder && (
              <>
                <ChevronRight className={cn("size-3.5 text-muted-foreground/50", isAr && "rotate-180")} />
                <span className="text-sm font-medium text-foreground">{folderName(activeFolder)}</span>
              </>
            )}
            <Badge variant="secondary" className="ms-1">{filtered.length}</Badge>
          </div>

          {/* active / archived toggle */}
          <div className="mb-3 inline-flex rounded-lg border border-border p-0.5">
            <button onClick={() => setShowArchived(false)} aria-pressed={!showArchived} className={cn("inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors", !showArchived ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
              <FileText className="size-4" />{t("Active", "النشطة")}
            </button>
            <button onClick={() => setShowArchived(true)} aria-pressed={showArchived} className={cn("inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors", showArchived ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
              <Archive className="size-4" />{t("Archived", "المؤرشفة")}<span className={cn("rounded-full px-1.5 text-[11px] tabular-nums", showArchived ? "bg-primary-foreground/20" : "bg-muted")}>{archivedCount}</span>
            </button>
          </div>

          {/* toolbar */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="relative min-w-[12rem] flex-1">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search documents…", "ابحث في المستندات…")} className="w-full ps-9" />
            </div>
            <div className="inline-flex rounded-lg border border-border p-0.5">
              <button onClick={() => setTypeFilter("all")} aria-pressed={typeFilter === "all"} className={cn("rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors", typeFilter === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>{t("All", "الكل")}</button>
              {TYPES.map((ty) => (
                <button key={ty} onClick={() => setTypeFilter(ty)} aria-pressed={typeFilter === ty} className={cn("rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors", typeFilter === ty ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>{ty}</button>
              ))}
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="h-10 rounded-lg border border-input bg-[var(--card-elevated)] px-3 text-sm outline-none focus:border-primary/60">
              <option value="recent">{t("Recently updated", "الأحدث تحديثًا")}</option>
              <option value="name">{t("Name (A–Z)", "الاسم (أ–ي)")}</option>
              <option value="downloads">{t("Most downloaded", "الأكثر تحميلًا")}</option>
              <option value="size">{t("Largest", "الأكبر حجمًا")}</option>
            </select>
          </div>

          <Card className="overflow-hidden py-0">
            {shown.map((d, i) => (
              <div
                key={d.id}
                onClick={() => open(d.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(d.id) } }}
                aria-label={isAr ? d.nameAr : d.name}
                className={cn("group flex cursor-pointer flex-wrap items-center gap-4 px-4 py-3 outline-none transition-colors hover:bg-primary/[0.04] focus-visible:bg-primary/[0.04]", i > 0 && "border-t border-border/70")}
              >
                <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white", TYPE_STYLE[d.type])}>{d.type}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={cn("truncate font-medium", showArchived && "text-muted-foreground")}>{isAr ? d.nameAr : d.name}</span>
                    {d.restricted && <Lock className="size-3.5 shrink-0 text-muted-foreground" />}
                    {isArchived(d) && <Badge className="bg-muted text-muted-foreground"><Archive className="me-1 size-3" />{t("Archived", "مؤرشف")} {formatDocDate(d.archiveAfter, isAr)}</Badge>}
                    {isArchiveScheduled(d) && <Badge variant="outline" className="text-[#99631a] dark:text-[#d6a94a]"><Clock className="me-1 size-3" />{t("Archives", "يُؤرشف")} {formatDocDate(d.archiveAfter, isAr)}</Badge>}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <Badge variant="outline">{isAr ? d.deptAr : d.dept}</Badge>
                    <span>{d.size} · {d.ver}</span>
                    <span>{t("Updated", "حُدّث")} {isAr ? d.updatedAr : d.updated}</span>
                    <span className="inline-flex items-center gap-1"><Download className="size-3" />{d.downloads.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {isArchived(d) && isAdmin ? (
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); updateDocument(d.id, { archiveAfter: null }); logAudit("restored", d.name, "Documents") }}><RotateCcw className="size-4" />{t("Restore", "استعادة")}</Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); open(d.id) }}><Eye className="size-4" />{t("Preview", "معاينة")}</Button>
                  )}
                  <Button variant="ghost" size="sm" aria-label={t("Download", "تحميل")} onClick={(e) => e.stopPropagation()}><Download className="size-4" /></Button>
                  {isAdmin && <Button variant="ghost" size="icon-sm" aria-label={t("Delete", "حذف")} className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={(e) => { e.stopPropagation(); setConfirmId(d.id) }}><Trash2 className="size-4" /></Button>}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="py-14 text-center">
                {showArchived ? <Archive className="mx-auto size-8 text-muted-foreground/40" /> : <FolderOpen className="mx-auto size-8 text-muted-foreground/40" />}
                <p className="mt-3 text-sm text-muted-foreground">{showArchived ? t("No archived documents in this view.", "لا توجد مستندات مؤرشفة في هذا العرض.") : t("No documents in this view.", "لا توجد مستندات في هذا العرض.")}</p>
              </div>
            )}
          </Card>

          {/* pagination */}
          {filtered.length > 0 && (
            <div className="mt-4 flex flex-col items-center gap-3">
              <p className="text-xs text-muted-foreground">{t("Showing", "عرض")} {shown.length} {t("of", "من")} {filtered.length.toLocaleString()} {t("documents", "مستند")}</p>
              {visible < filtered.length && (
                <Button variant="outline" onClick={() => setVisible((v) => v + PAGE)}>{t("Load more", "تحميل المزيد")}</Button>
              )}
            </div>
          )}
        </section>
      </div>

      <Dialog open={!!confirmId} onOpenChange={(o) => !o && setConfirmId(null)}>
        {confirmItem && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>{t("Delete this document?", "حذف هذا المستند؟")}</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">{t("This removes the file from the library. This can't be undone.", "سيؤدي هذا إلى إزالة الملف من المكتبة. لا يمكن التراجع.")}</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmId(null)}>{t("Cancel", "إلغاء")}</Button>
              <Button className="bg-destructive text-white hover:bg-destructive/90" onClick={() => { deleteDocument(confirmItem.id); logAudit("deleted", confirmItem.name, "Documents"); setConfirmId(null) }}><Trash2 className="size-4" />{t("Delete", "حذف")}</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </main>
  )
}
