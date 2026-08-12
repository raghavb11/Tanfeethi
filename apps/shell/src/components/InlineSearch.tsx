import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

import { cn } from "@reach/shared-core"
import { commandNav, previewNav } from "@/config/navigation"
import {
  ArrowRight,
  Briefcase,
  CalendarDays,
  ClipboardList,
  CornerDownLeft,
  FileText,
  PanelRightOpen,
  Search,
  Sparkles,
  X,
} from "lucide-react"

type ResultGroup = "navigate" | "actions" | "suggestions"

type Result = {
  id: string
  label: string
  labelAr?: string
  hint?: string
  hintAr?: string
  group: ResultGroup
  icon: React.ComponentType<{ className?: string }>
  path?: string
  keywords?: string
}

const arGroupLabel: Record<ResultGroup, string> = {
  navigate: "تنقّل",
  actions: "إجراءات سريعة",
  suggestions: "اقتراحات",
}

const enGroupLabel: Record<ResultGroup, string> = {
  navigate: "Navigate",
  actions: "Quick actions",
  suggestions: "Suggestions",
}

const navIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "/": Search,
  "/work": Briefcase,
  "/employee": Sparkles,
  "/services": ClipboardList,
  "/intelligence": Sparkles,
}

const navArLabels: Record<string, string> = {
  Home: "الرئيسية",
  "Work Hub": "مركز العمل",
  "Employee Hub": "مركز الموظف",
  "Services Hub": "مركز الخدمات",
  "Intelligence Hub": "مركز الذكاء",
}

const previewArLabels: Record<string, string> = {
  Engagement: "مشاركة",
  Knowledge: "المعرفة",
  Productivity: "الإنتاجية",
}

export function InlineSearch({
  isAr,
  onOpenFullPalette,
}: {
  isAr: boolean
  onOpenFullPalette: () => void
}) {
  const navigate = useNavigate()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [active, setActive] = React.useState(0)
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  // Build results from nav + actions
  const allResults = React.useMemo<Result[]>(() => {
    const navResults: Result[] = commandNav.map((n) => ({
      id: `nav:${n.path}`,
      label: n.label,
      labelAr: navArLabels[n.label],
      group: "navigate",
      icon: navIconMap[n.path] ?? Search,
      path: n.path,
      keywords: `${n.label} ${navArLabels[n.label] ?? ""} ${n.path}`,
    }))

    const previewResults: Result[] = previewNav.map((p) => ({
      id: `preview:${p.path}`,
      label: `${p.title} Hub`,
      labelAr: previewArLabels[p.title] ? `مركز ${previewArLabels[p.title]}` : undefined,
      hint: "Preview",
      hintAr: "معاينة",
      group: "navigate",
      icon: p.icon,
      path: p.path,
      keywords: `${p.title} ${previewArLabels[p.title] ?? ""} preview hub`,
    }))

    const actionResults: Result[] = [
      {
        id: "act:request",
        label: "Submit service request",
        labelAr: "تقديم طلب خدمة",
        group: "actions",
        icon: ClipboardList,
        path: "/services",
        keywords: "service request submit طلب خدمة",
      },
      {
        id: "act:task",
        label: "Create task",
        labelAr: "إنشاء مهمة",
        group: "actions",
        icon: PanelRightOpen,
        path: "/work",
        keywords: "task create work مهمة",
      },
      {
        id: "act:meeting",
        label: "Today's meetings",
        labelAr: "اجتماعات اليوم",
        group: "actions",
        icon: CalendarDays,
        path: "/",
        keywords: "meeting calendar today اجتماعات اليوم",
      },
      {
        id: "act:payslip",
        label: "View payslip",
        labelAr: "عرض كشف الراتب",
        group: "actions",
        icon: FileText,
        path: "/employee",
        keywords: "payslip salary راتب كشف",
      },
    ]

    const suggestions: Result[] = [
      {
        id: "sug:approvals",
        label: "Smart approvals",
        labelAr: "الموافقات الذكية",
        hint: "AI-ranked",
        hintAr: "مرتبة بالذكاء الاصطناعي",
        group: "suggestions",
        icon: Sparkles,
        path: "/work",
        keywords: "approvals smart ai موافقات ذكية",
      },
      {
        id: "sug:assistant",
        label: "Ask Reach",
        labelAr: "اسأل وصل",
        hint: "Open AI panel",
        hintAr: "فتح المساعد",
        group: "suggestions",
        icon: Sparkles,
        keywords: "ai assistant reach وصل مساعد",
      },
    ]

    return [...navResults, ...previewResults, ...actionResults, ...suggestions]
  }, [])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return allResults
    return allResults.filter((r) => {
      const haystack = `${r.label} ${r.labelAr ?? ""} ${r.hint ?? ""} ${r.hintAr ?? ""} ${r.keywords ?? ""}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [query, allResults])

  // Group results
  const grouped = React.useMemo(() => {
    const order: ResultGroup[] = ["navigate", "actions", "suggestions"]
    const map: Record<ResultGroup, Result[]> = { navigate: [], actions: [], suggestions: [] }
    filtered.forEach((r) => map[r.group].push(r))
    return order.filter((g) => map[g].length > 0).map((g) => ({ group: g, items: map[g] }))
  }, [filtered])

  // Reset highlight to the top whenever the query changes (handled in the
  // query setter below, not an effect, to avoid a cascading re-render).
  const updateQuery = React.useCallback((value: string) => {
    setQuery(value)
    setActive(0)
  }, [])

  // Click-outside handling
  React.useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [open])

  // Focus input when opening
  React.useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 30)
      return () => window.clearTimeout(t)
    }
  }, [open])

  const handleSelect = React.useCallback((r: Result) => {
    setOpen(false)
    updateQuery("")
    if (r.id === "sug:assistant") {
      onOpenFullPalette()
      return
    }
    if (r.path) navigate(r.path)
  }, [navigate, onOpenFullPalette, updateQuery])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive((i) => Math.min(filtered.length - 1, i + 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((i) => Math.max(0, i - 1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      const r = filtered[active]
      if (r) handleSelect(r)
    } else if (e.key === "Escape") {
      e.preventDefault()
      setOpen(false)
    }
  }

  const placeholder = isAr
    ? "ابحث عن أشخاص، مهام، مستندات، خدمات…"
    : "Search for people, tasks, documents, services…"

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger / fake input */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open search"
        aria-expanded={open}
        className={cn(
          "hidden md:flex items-center gap-2.5 rounded-xl border bg-[var(--card-elevated)] px-3.5 py-2 text-left transition-all w-72 lg:w-96",
          "hover:border-primary/30 hover:shadow-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          open ? "border-primary/40 shadow-sm" : "border-border/60",
        )}
      >
        <Search className={cn("size-3.5 shrink-0 transition-colors", open ? "text-primary" : "text-muted-foreground/50")} />
        <span className="flex-1 truncate text-[13px] text-muted-foreground/60">
          {placeholder}
        </span>
        <kbd className="pointer-events-none shrink-0 rounded-md border border-border/60 bg-muted/80 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground/60">
          ⌘K
        </kbd>
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "absolute top-full z-50 mt-2 hidden w-[420px] md:block lg:w-[480px]",
              "rounded-2xl border border-border/70 bg-popover shadow-2xl shadow-black/20 ring-1 ring-black/5 dark:ring-white/5",
              isAr ? "end-0" : "start-0",
            )}
          >
            {/* Active input */}
            <div className="flex items-center gap-2.5 border-b border-border/60 px-3.5 py-2.5">
              <Search className="size-4 shrink-0 text-primary" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => updateQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground/50"
                dir={isAr ? "rtl" : "ltr"}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => updateQuery("")}
                  className="rounded-md p-0.5 text-muted-foreground/60 transition-colors hover:bg-muted/60 hover:text-foreground"
                  aria-label={isAr ? "مسح" : "Clear"}
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto py-1.5">
              {grouped.length === 0 ? (
                <div className="px-3.5 py-6 text-center text-[12px] text-muted-foreground/60">
                  {isAr ? "ما فيه نتائج مطابقة" : "No matches found"}
                </div>
              ) : (
                grouped.map(({ group, items }) => (
                  <div key={group} className="px-1.5 py-1">
                    <div className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/55">
                      {isAr ? arGroupLabel[group] : enGroupLabel[group]}
                    </div>
                    {items.map((r) => {
                      const flatIndex = filtered.indexOf(r)
                      const isActive = flatIndex === active
                      const Icon = r.icon
                      const label = isAr && r.labelAr ? r.labelAr : r.label
                      const hint = isAr && r.hintAr ? r.hintAr : r.hint
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onMouseEnter={() => setActive(flatIndex)}
                          onClick={() => handleSelect(r)}
                          className={cn(
                            "group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-start transition-colors",
                            isActive
                              ? "bg-primary/10 text-foreground"
                              : "hover:bg-muted/60",
                          )}
                        >
                          <span className={cn(
                            "flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors",
                            isActive ? "bg-primary/20 text-primary" : "bg-muted/60 text-muted-foreground",
                          )}>
                            <Icon className="size-3.5" />
                          </span>
                          <span className="flex-1 truncate text-[12.5px] font-medium">{label}</span>
                          {hint && (
                            <span className="shrink-0 rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                              {hint}
                            </span>
                          )}
                          {isActive && (
                            <CornerDownLeft className="size-3 shrink-0 text-primary" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer hint */}
            <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-3.5 py-2 text-[10px] text-muted-foreground/60">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border/60 bg-background px-1 py-0.5 font-mono">↑↓</kbd>
                  {isAr ? "تنقل" : "navigate"}
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border/60 bg-background px-1 py-0.5 font-mono">↵</kbd>
                  {isAr ? "اختر" : "select"}
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border/60 bg-background px-1 py-0.5 font-mono">esc</kbd>
                  {isAr ? "إغلاق" : "close"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => { setOpen(false); onOpenFullPalette() }}
                className="flex items-center gap-1 font-medium text-primary transition-colors hover:text-primary/80"
              >
                {isAr ? "البحث الموسّع" : "Advanced search"}
                <ArrowRight className={cn("size-3", isAr && "rotate-180")} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
