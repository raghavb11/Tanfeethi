import * as React from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

import { cn } from "@reach/shared-core"
import { searchEmployees } from "@reach/shared-mocks"
import { commandNav, previewNav } from "@/config/navigation"
import { EmployeeCardDialog } from "@/pages/shell-dialogs"
import {
  BadgeCheck, Briefcase, Building2, ClipboardList, CornerDownLeft, FileText, Link2, Search, Sparkles,
  TrendingUp, User, Wallet, X,
} from "lucide-react"

type ResultGroup = "employees" | "navigate" | "suggestions"
type IconT = React.ComponentType<{ className?: string; strokeWidth?: number }>

type Result = {
  id: string
  label: string
  labelAr?: string
  group: ResultGroup
  icon: IconT
  path?: string
  employeeId?: string
  prompt?: { en: string; ar: string }
  keywords?: string
}

const GROUP_LABEL: Record<ResultGroup, { en: string; ar: string }> = {
  employees: { en: "Employees", ar: "الموظفين" },
  navigate: { en: "Navigate", ar: "تنقل" },
  suggestions: { en: "Suggestions", ar: "اقتراحات" },
}

/** Figma "Search" 2159:1656 — the empty-query shortcuts, in order. */
const SHORTCUTS: Result[] = [
  { id: "sc:approvals", label: "Approvals", labelAr: "الموافقات", icon: BadgeCheck, path: "/manager", group: "navigate", keywords: "approvals موافقات" },
  { id: "sc:projects", label: "Projects", labelAr: "المشاريع", icon: TrendingUp, path: "/projects", group: "navigate", keywords: "projects مشاريع" },
  { id: "sc:tasks", label: "Tasks", labelAr: "المهام", icon: Briefcase, path: "/tasks", group: "navigate", keywords: "tasks مهام" },
  { id: "sc:balance", label: "My balance", labelAr: "رصيدي", icon: Wallet, path: "/leave", group: "navigate", keywords: "balance leave رصيد إجازة" },
  { id: "sc:org", label: "Org structure", labelAr: "الهيكل التنظيمي", icon: Building2, path: "/org-chart", group: "navigate", keywords: "org chart structure هيكل" },
  { id: "sc:performance", label: "Performance", labelAr: "الأداء", icon: TrendingUp, path: "/operations", group: "navigate", keywords: "performance kpi أداء" },
  { id: "sc:links", label: "Links", labelAr: "روابط", icon: Link2, path: "/links", group: "navigate", keywords: "links روابط" },
]

const SUGGESTIONS: Result[] = [
  { id: "ai:salaries", label: "Report on 2026 salaries", labelAr: "تقرير عن الرواتب 2026", icon: Sparkles, group: "suggestions", prompt: { en: "Report on 2026 salaries", ar: "تقرير عن الرواتب 2026" } },
  { id: "ai:meetings", label: "Summarise today's meetings", labelAr: "تلخيص إجتماعات اليوم", icon: Sparkles, group: "suggestions", prompt: { en: "Summarise today's meetings", ar: "تلخيص إجتماعات اليوم" } },
]

const ACTIONS: Result[] = [
  { id: "act:request", label: "Submit a service request", labelAr: "تقديم طلب خدمة", group: "navigate", icon: ClipboardList, path: "/services", keywords: "service request submit طلب خدمة" },
  { id: "act:task", label: "Create a task", labelAr: "إنشاء مهمة", group: "navigate", icon: Briefcase, path: "/tasks/new", keywords: "task create new مهمة جديدة" },
  { id: "act:payslip", label: "View payslip", labelAr: "عرض كشف الراتب", group: "navigate", icon: FileText, path: "/payslip", keywords: "payslip salary راتب كشف" },
]

const thinScroll =
  "[&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:rounded-[2px] [&::-webkit-scrollbar-track]:bg-secondary [&::-webkit-scrollbar-thumb]:rounded-[2px] [&::-webkit-scrollbar-thumb]:bg-foreground/85"

/**
 * Global search — Figma top-bar search (447×33) with its dropdown:
 * empty query = 2159:1656 / 2159:2117 (Navigate + AI suggestions);
 * typed query = 2423:2562 (Employees · Navigate · Suggestions).
 * Picking an employee opens the employee card (4263:19954).
 */
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
  const [employeeId, setEmployeeId] = React.useState<string | null>(null)
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const t = (en: string, ar: string) => (isAr ? ar : en)

  // Everything the typed query can reach: the curated shortcuts plus the full
  // command navigation, preview hubs and quick actions (kept from v1).
  const navPool = React.useMemo<Result[]>(() => {
    const seen = new Set(SHORTCUTS.map((s) => s.path))
    const extra: Result[] = [
      ...commandNav.map((n) => ({ id: `nav:${n.path}`, label: n.label, group: "navigate" as const, icon: Search as IconT, path: n.path, keywords: `${n.label} ${n.path}` })),
      ...previewNav.map((p) => ({ id: `preview:${p.path}`, label: `${p.title} hub`, group: "navigate" as const, icon: p.icon as IconT, path: p.path, keywords: `${p.title} preview hub` })),
      ...ACTIONS,
    ].filter((r) => (r.path && !seen.has(r.path) ? (seen.add(r.path), true) : false))
    return [...SHORTCUTS, ...extra]
  }, [])

  const results = React.useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase()
    if (!q) return [...SHORTCUTS.slice(0, 6), ...SUGGESTIONS]
    const people: Result[] = searchEmployees(q).slice(0, 4).map((e) => ({
      id: `emp:${e.id}`, label: e.name, labelAr: e.nameAr, group: "employees", icon: User, employeeId: e.id,
    }))
    const words = (r: Result) => `${r.label} ${r.labelAr ?? ""} ${r.keywords ?? ""}`.toLowerCase()
    const nav = navPool
      .filter((r) => (q.length < 3 ? words(r).split(/\s+/).some((w) => w.startsWith(q) || w.startsWith(`ال${q}`)) : words(r).includes(q)))
      .slice(0, 6)
    // Figma echoes the raw query four times here — real suggestions instead.
    const raw = query.trim()
    const ask: Result[] = [
      { id: "ai:ask", label: `Ask WIJHA: “${raw}”`, labelAr: `اسأل وجهة: «${raw}»`, icon: Sparkles, group: "suggestions", prompt: { en: raw, ar: raw } },
      ...SUGGESTIONS.filter((s) => `${s.label} ${s.labelAr}`.toLowerCase().includes(q)),
    ]
    return [...people, ...nav, ...ask]
  }, [query, navPool])

  const grouped = React.useMemo(() => {
    const order: ResultGroup[] = ["employees", "navigate", "suggestions"]
    return order
      .map((g) => ({ group: g, items: results.filter((r) => r.group === g) }))
      .filter((g) => g.items.length > 0)
  }, [results])

  const updateQuery = (v: string) => { setQuery(v); setActive(0); setOpen(true) }

  React.useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [open])

  // ⌘K / Ctrl+K focuses this box wherever it is visible (md+); the command
  // palette keeps the shortcut on small screens.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k" && window.matchMedia("(min-width: 768px)").matches) {
        e.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const handleSelect = (r: Result) => {
    setOpen(false)
    setQuery("")
    inputRef.current?.blur()
    if (r.employeeId) { setEmployeeId(r.employeeId); return }
    if (r.prompt) {
      window.dispatchEvent(new CustomEvent("wijha:ask", { detail: { text: isAr ? r.prompt.ar : r.prompt.en } }))
      return
    }
    if (r.path) navigate(r.path)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((i) => Math.min(results.length - 1, i + 1)) }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(0, i - 1)) }
    else if (e.key === "Enter") { e.preventDefault(); const r = results[active]; if (r) handleSelect(r) }
    else if (e.key === "Escape") { e.preventDefault(); setOpen(false); inputRef.current?.blur() }
  }

  return (
    <div ref={containerRef} className="relative hidden md:block">
      {/* Figma top-bar search: 447×33, Page/Fill, radius 8, padding 7.5/12/7.5/8 */}
      <label
        className={cn(
          "flex h-[33px] w-72 items-center gap-2 rounded-lg bg-background pe-2 ps-3 transition-shadow lg:w-[447px]",
          open && "ring-1 ring-primary/40",
        )}
      >
        <Search className={cn("size-4 shrink-0", open ? "text-primary" : "text-foreground")} strokeWidth={1.6} />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => updateQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={t("Search people, tasks, documents, services…", "أبحث عن أشخاص، مهام، مستندات، خدمات...")}
          aria-label={t("Search", "بحث")}
          aria-expanded={open}
          role="combobox"
          aria-controls="wijha-search-list"
          className="min-w-0 flex-1 bg-transparent text-[12px] leading-[18px] text-foreground outline-none placeholder:text-foreground [&::-webkit-search-cancel-button]:hidden"
        />
        {query ? (
          <button type="button" onClick={() => updateQuery("")} aria-label={t("Clear", "مسح")} className="rounded p-0.5 text-muted-foreground hover:text-foreground">
            <X className="size-3.5" />
          </button>
        ) : (
          <kbd className="pointer-events-none shrink-0 font-sans text-[11px] text-foreground">⌘K</kbd>
        )}
      </label>

        {open && (
          <motion.div
            id="wijha-search-list"
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="absolute end-0 top-full z-50 mt-2 w-[min(509px,calc(100vw-24px))] rounded-xl bg-popover px-[18px] py-5 text-popover-foreground shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)] ring-1 ring-border"
          >
            <div className={cn("max-h-[428px] overflow-y-auto pe-4", thinScroll)}>
              {grouped.map(({ group, items }, gi) => (
                <div key={group} className={cn(gi > 0 && "pt-4")}>
                  <div className="flex items-center gap-1 pb-1 text-[12px] text-muted-foreground">
                    {group === "suggestions" && <Sparkles className="size-3 text-primary" strokeWidth={1.8} />}
                    {isAr ? GROUP_LABEL[group].ar : GROUP_LABEL[group].en}
                  </div>
                  {items.map((r, i) => {
                    const flat = results.indexOf(r)
                    const isActive = flat === active
                    const Icon = r.icon
                    return (
                      <button
                        key={r.id}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        onMouseEnter={() => setActive(flat)}
                        onClick={() => handleSelect(r)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-md py-3 text-start transition-colors",
                          i < items.length - 1 && "border-b border-input",
                          isActive && "bg-soft-accent/40",
                        )}
                      >
                        <span className={cn("grid size-[30px] shrink-0 place-items-center rounded-lg bg-secondary", r.group === "suggestions" ? "text-primary" : "text-foreground")}>
                          <Icon className="size-[15px]" strokeWidth={1.6} />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[14.5px] leading-[21.75px] text-foreground">
                          {isAr && r.labelAr ? r.labelAr : r.label}
                        </span>
                        {isActive && <CornerDownLeft className="size-3 shrink-0 text-primary" />}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => { setOpen(false); onOpenFullPalette() }}
              className="mt-3 text-[11.5px] font-medium text-primary hover:opacity-80"
            >
              {t("Advanced search", "البحث الموسّع")}
            </button>
          </motion.div>
        )}

      <EmployeeCardDialog employeeId={employeeId} onClose={() => setEmployeeId(null)} isAr={isAr} />
    </div>
  )
}
