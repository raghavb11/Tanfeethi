import * as React from "react"
import { cn } from "@reach/shared-core"
import { Check, ChevronsUpDown, FolderOpen, Plus, Search, X } from "lucide-react"

import { STATUS_LABEL, useProjects } from "../data/projects"

/** Searchable single-select over the project master. Opens inline under the
 *  trigger — never a modal — and offers a way out to create a project. */
export function ProjectPicker({ value, onChange, isAr, t, onCreate }: {
  value: string
  onChange: (id: string) => void
  isAr: boolean
  t: (en: string, ar: string) => string
  onCreate?: () => void
}) {
  const projects = useProjects()
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

  const name = (id: string) => {
    const p = projects.find((x) => x.id === id)
    return p ? (isAr ? p.nameAr : p.name) : ""
  }
  const selected = projects.find((p) => p.id === value)
  const q = query.trim().toLowerCase()
  const filtered = q
    ? projects.filter((p) => (isAr ? p.nameAr : p.name).toLowerCase().includes(q) || p.code.toLowerCase().includes(q))
    : projects

  const pick = (id: string) => { onChange(id); setOpen(false); setQuery("") }

  return (
    <div ref={ref} className="relative">
      <button
        type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
        aria-label={t("Project", "المشروع")}
        className="flex h-11 w-full items-center gap-2 rounded-lg border border-input bg-[var(--card-elevated)] px-3 text-start text-sm outline-none transition-colors focus:border-primary/60"
      >
        {selected ? (
          <>
            <FolderOpen className="size-4 shrink-0 text-primary" />
            <span className="min-w-0 flex-1 truncate">{name(selected.id)}</span>
            <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">{selected.code}</span>
            <span
              role="button" tabIndex={0} aria-label={t("Clear", "مسح")}
              onClick={(e) => { e.stopPropagation(); onChange("") }}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); onChange("") } }}
              className="grid size-5 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-3.5" />
            </span>
          </>
        ) : (
          <span className="min-w-0 flex-1 truncate text-muted-foreground">{t("Select a project", "اختر مشروعًا")}</span>
        )}
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder={t("Search projects…", "ابحث في المشاريع…")}
              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="max-h-64 overflow-y-auto py-1">
            {filtered.map((p) => (
              <button
                key={p.id} type="button" onClick={() => pick(p.id)}
                className={cn("flex w-full items-center gap-2 px-3 py-2 text-start text-[13px] transition-colors hover:bg-muted/60",
                  p.id === value && "bg-primary/10 text-primary")}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium leading-tight">{isAr ? p.nameAr : p.name}</span>
                  <span className="block truncate text-[11px] leading-tight text-muted-foreground">
                    {p.code} · {isAr ? p.ownerAr : p.owner}
                  </span>
                </span>
                <span className={cn("shrink-0 rounded-full border px-1.5 py-0.5 text-[10px]", STATUS_LABEL[p.status].chip)}>
                  {isAr ? STATUS_LABEL[p.status].ar : STATUS_LABEL[p.status].en}
                </span>
                {p.id === value && <Check className="size-3.5 shrink-0" />}
              </button>
            ))}

            {filtered.length === 0 && (
              <p className="px-3 py-4 text-center text-[12.5px] text-muted-foreground">
                {t("No project matches.", "لا يوجد مشروع مطابق.")}
              </p>
            )}
          </div>

          {onCreate && (
            <button
              type="button"
              onClick={() => { setOpen(false); onCreate() }}
              className="flex w-full items-center gap-2 border-t border-border px-3 py-2.5 text-start text-[12.5px] font-medium text-primary transition-colors hover:bg-primary/[0.06]"
            >
              <Plus className="size-3.5" />{t("Create a new project", "إنشاء مشروع جديد")}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
