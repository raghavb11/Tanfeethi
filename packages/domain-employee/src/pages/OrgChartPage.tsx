import * as React from "react"
import { motion } from "framer-motion"
import { useSearchParams } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage, Badge, Button, Card, Input } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  ChevronRight, Crosshair, Mail, MapPin, Maximize2, Minus, Phone, Plus, Search, Users, X,
} from "lucide-react"

import {
  chainTo, childrenOf, deptColor, ME_ID, type OrgPerson, personById, ROOT, searchPeople, teamSize,
} from "../data/mock/org"

// ── layout constants ─────────────────────────────────────────────────────────
const NODE_W = 252
const NODE_H = 108
const H_GAP = 28
const V_GAP = 76
/** Levels drawn below the root before you have to drill in. */
const MAX_DEPTH = 2

type Placed = { id: string; x: number; y: number; depth: number }
type Edge = { from: Placed; to: Placed }

/** Tidy tree layout: leaves are packed left to right, every parent is centred
 *  over its children. Returns absolute positions so the connectors can be
 *  drawn as real curves instead of faked with borders. */
function buildLayout(rootId: string, collapsed: Set<string>) {
  const nodes: Placed[] = []
  const edges: Edge[] = []
  let cursor = 0

  const walk = (id: string, depth: number): Placed => {
    const kids = depth >= MAX_DEPTH || collapsed.has(id) ? [] : childrenOf(id)
    const y = depth * (NODE_H + V_GAP)
    if (kids.length === 0) {
      const node: Placed = { id, x: cursor, y, depth }
      cursor += NODE_W + H_GAP
      nodes.push(node)
      return node
    }
    const placedKids = kids.map((k) => walk(k.id, depth + 1))
    const node: Placed = {
      id, y, depth,
      x: (placedKids[0].x + placedKids[placedKids.length - 1].x) / 2,
    }
    nodes.push(node)
    placedKids.forEach((k) => edges.push({ from: node, to: k }))
    return node
  }

  walk(rootId, 0)
  const width = Math.max(cursor - H_GAP, NODE_W)
  const depth = nodes.reduce((m, n) => Math.max(m, n.depth), 0)
  return { nodes, edges, width, height: (depth + 1) * NODE_H + depth * V_GAP }
}

/** Rounded elbow from a parent's bottom edge to a child's top edge. */
function edgePath(sx: number, sy: number, ex: number, ey: number) {
  if (Math.abs(ex - sx) < 1) return `M ${sx} ${sy} L ${ex} ${ey}`
  const mid = sy + (ey - sy) / 2
  const dir = ex > sx ? 1 : -1
  const r = Math.min(16, Math.abs(ex - sx) / 2, (ey - sy) / 2)
  return [
    `M ${sx} ${sy}`,
    `V ${mid - r}`,
    `Q ${sx} ${mid} ${sx + dir * r} ${mid}`,
    `H ${ex - dir * r}`,
    `Q ${ex} ${mid} ${ex} ${mid + r}`,
    `V ${ey}`,
  ].join(" ")
}

export default function OrgChartPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)

  // ?person=<id> lets the directory deep-link straight to someone
  const [params] = useSearchParams()
  const deepLink = params.get("person")
  const linked = deepLink && personById(deepLink) ? deepLink : null

  const [rootId, setRootId] = React.useState(() => {
    if (!linked) return ROOT.id
    const p = personById(linked)!
    return childrenOf(linked).length ? linked : p.managerId ?? linked
  })
  // nothing is selected by default, so the chart starts completely unobstructed
  const [selectedId, setSelectedId] = React.useState<string | null>(linked)
  const [collapsed, setCollapsed] = React.useState<Set<string>>(new Set())
  const [zoom, setZoom] = React.useState(1)
  const [q, setQ] = React.useState("")
  const [openSearch, setOpenSearch] = React.useState(false)

  const trail = chainTo(rootId)
  const selected = selectedId ? personById(selectedId) : undefined
  const results = searchPeople(q, isAr)

  const { nodes, edges, width, height } = React.useMemo(
    () => buildLayout(rootId, collapsed), [rootId, collapsed],
  )
  // layout is computed left-to-right; mirror it for RTL
  const mx = (x: number) => (isAr ? width - x - NODE_W : x)
  const mcx = (x: number) => (isAr ? width - x : x)

  const focusOn = (id: string) => {
    const p = personById(id)
    if (!p) return
    setRootId(childrenOf(id).length ? id : p.managerId ?? id)
    setSelectedId(id)
    setQ("")
    setOpenSearch(false)
  }
  const toggleCollapse = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  return (
    // fills the viewport below the 3.5rem top bar so the chart gets every pixel
    <main className="flex h-[calc(100svh-3.5rem)] flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
      {/* one compact toolbar — breadcrumb, search, zoom */}
      <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex min-w-0 flex-wrap items-center gap-1 text-[12.5px]">
          {trail.map((p, i) => (
            <React.Fragment key={p.id}>
              {i > 0 && <ChevronRight className={cn("size-3.5 shrink-0 text-muted-foreground/40", isAr && "rotate-180")} />}
              <button onClick={() => setRootId(p.id)}
                className={cn("truncate rounded-md px-1.5 py-0.5 transition-colors hover:bg-primary/10 hover:text-primary",
                  i === trail.length - 1 ? "font-semibold text-foreground" : "text-muted-foreground")}>
                {isAr ? p.nameAr : p.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        <div className="ms-auto flex flex-wrap items-center gap-2">
          <div className="relative w-[220px]">
            <Search className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => { setQ(e.target.value); setOpenSearch(true) }}
              onFocus={() => setOpenSearch(true)}
              placeholder={t("Search people", "ابحث عن شخص")}
              className="h-9 ps-8 pe-7 text-[13px]" />
            {q && (
              <button onClick={() => { setQ(""); setOpenSearch(false) }} aria-label={t("Clear search", "مسح البحث")}
                className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="size-3.5" /></button>
            )}
            {openSearch && q && (
              <Card className="absolute z-30 mt-1.5 w-[280px] overflow-hidden p-0 shadow-lg">
                {results.length === 0 ? (
                  <div className="px-4 py-3 text-[13px] text-muted-foreground">{t("No one found.", "لا توجد نتائج.")}</div>
                ) : results.map((p) => (
                  <button key={p.id} onClick={() => focusOn(p.id)}
                    className="flex w-full items-center gap-3 border-b border-border/60 px-3 py-2.5 text-start transition-colors last:border-0 hover:bg-primary/[0.05]">
                    <PersonAvatar p={p} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold">{isAr ? p.nameAr : p.name}</span>
                      <span className="block truncate text-[11.5px] text-muted-foreground">{isAr ? p.titleAr : p.title}</span>
                    </span>
                  </button>
                ))}
              </Card>
            )}
          </div>

          <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={() => focusOn(ME_ID)}>
            <Crosshair className="size-3.5" />{t("Find me", "أين أنا")}
          </Button>

          <div className="inline-flex items-center gap-1 rounded-lg border border-border p-0.5">
            <button onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.15).toFixed(2)))} aria-label={t("Zoom out", "تصغير")}
              className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><Minus className="size-3.5" /></button>
            <span className="min-w-[2.75rem] text-center text-[11px] font-semibold tabular-nums text-muted-foreground">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom((z) => Math.min(1.4, +(z + 0.15).toFixed(2)))} aria-label={t("Zoom in", "تكبير")}
              className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><Plus className="size-3.5" /></button>
            <span className="mx-0.5 h-4 w-px bg-border" />
            <button onClick={() => { setZoom(1); setCollapsed(new Set()); setRootId(ROOT.id); setSelectedId(null) }} aria-label={t("Reset view", "إعادة الضبط")}
              className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><Maximize2 className="size-3.5" /></button>
          </div>
        </div>
      </div>

      {/* the chart owns everything else */}
      <Card className="relative min-h-0 flex-1 overflow-hidden bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:22px_22px] p-0">
        <div className="h-full w-full overflow-auto p-6">
          <div className="mx-auto" style={{ width: width * zoom, height: height * zoom }}>
            <div className="relative origin-top-left" style={{ width, height, transform: `scale(${zoom})` }}>
              <svg width={width} height={height} className="pointer-events-none absolute inset-0 overflow-visible">
                {edges.map((e) => (
                  <path key={`${e.from.id}-${e.to.id}`}
                    d={edgePath(mcx(e.from.x + NODE_W / 2), e.from.y + NODE_H, mcx(e.to.x + NODE_W / 2), e.to.y)}
                    fill="none" stroke="var(--border)" strokeWidth={1.5} strokeLinecap="round" />
                ))}
              </svg>
              {nodes.map((n) => {
                const p = personById(n.id)!
                return (
                  <NodeCard key={n.id} p={p} x={mx(n.x)} y={n.y}
                    selected={selectedId === n.id}
                    atDepthLimit={n.depth >= MAX_DEPTH}
                    collapsed={collapsed.has(n.id)}
                    isAr={isAr} t={t}
                    onSelect={() => setSelectedId(n.id)}
                    onDrill={() => { setRootId(n.id); setSelectedId(n.id); setCollapsed(new Set()) }}
                    onToggle={() => toggleCollapse(n.id)} />
                )
              })}
            </div>
          </div>
        </div>

        {/* details float over the canvas, and only once you pick someone */}
        {selected && (
          <motion.aside
            initial={{ opacity: 0, x: isAr ? -12 : 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}
            className="absolute bottom-3 end-3 top-3 z-20 w-[290px] overflow-y-auto rounded-2xl border border-border bg-card/95 shadow-xl backdrop-blur">
            <DetailPanel p={selected} isAr={isAr} t={t} onNavigate={focusOn} onClose={() => setSelectedId(null)} />
          </motion.aside>
        )}
      </Card>
    </main>
  )
}

// ── node ─────────────────────────────────────────────────────────────────────

function NodeCard({ p, x, y, selected, atDepthLimit, collapsed, isAr, t, onSelect, onDrill, onToggle }: {
  p: OrgPerson; x: number; y: number; selected: boolean; atDepthLimit: boolean; collapsed: boolean
  isAr: boolean; t: (en: string, ar: string) => string
  onSelect: () => void; onDrill: () => void; onToggle: () => void
}) {
  const color = deptColor(p.department)
  const reports = childrenOf(p.id).length
  const total = teamSize(p.id)
  // at the depth limit the only way further down is to re-root the chart
  const hasHidden = reports > 0 && (atDepthLimit || collapsed)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.22 }}
      className="absolute" style={{ left: x, top: y, width: NODE_W, height: NODE_H }}>
      <button
        onClick={onSelect}
        onDoubleClick={() => reports && onDrill()}
        className={cn(
          "group relative flex h-full w-full flex-col justify-between rounded-2xl border bg-card p-3.5 text-start shadow-sm transition-all duration-200",
          "hover:-translate-y-0.5 hover:shadow-lg",
          selected ? "border-primary/60 shadow-md ring-2 ring-primary/20" : "border-border/80 hover:border-border",
          p.isMe && !selected && "border-primary/40",
        )}>
        <div className="flex items-start gap-3">
          <span className="relative shrink-0">
            <Avatar className="size-11 ring-2 ring-offset-2 ring-offset-card" style={{ ["--tw-ring-color" as string]: `${color}66` }}>
              {p.photo && <AvatarImage src={p.photo} alt="" />}
              <AvatarFallback className="text-[12px] font-bold" style={{ backgroundColor: `${color}1f`, color }}>{p.initials}</AvatarFallback>
            </Avatar>
            {p.isMe && (
              <span className="absolute -bottom-0.5 -end-0.5 rounded-full bg-primary px-1.5 py-px text-[8.5px] font-bold uppercase tracking-wide text-primary-foreground ring-2 ring-card">
                {t("You", "أنت")}
              </span>
            )}
          </span>
          <span className="min-w-0 flex-1 pt-0.5">
            <span className="block truncate text-[14px] font-semibold leading-tight">{isAr ? p.nameAr : p.name}</span>
            <span className="mt-0.5 block truncate text-[11.5px] leading-snug text-muted-foreground">{isAr ? p.titleAr : p.title}</span>
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="truncate rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: `${color}16`, color }}>
            {isAr ? p.departmentAr : p.department}
          </span>
          {reports > 0 && (
            <span className="inline-flex shrink-0 items-center gap-1 text-[10.5px] tabular-nums text-muted-foreground/70">
              <Users className="size-3" />{reports}{total > reports && <span className="opacity-60">/{total}</span>}
            </span>
          )}
        </div>
      </button>

      {/* expand / collapse handle sits on the bottom edge, the standard org-chart affordance */}
      {reports > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); hasHidden && atDepthLimit ? onDrill() : onToggle() }}
          aria-label={hasHidden ? t("Expand", "توسيع") : t("Collapse", "طي")}
          className={cn(
            "absolute -bottom-3 start-1/2 z-10 inline-flex h-6 -translate-x-1/2 items-center gap-0.5 rounded-full border bg-card px-2 text-[10px] font-semibold tabular-nums shadow-sm transition-colors rtl:translate-x-1/2",
            hasHidden ? "border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground" : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary",
          )}>
          {hasHidden ? <Plus className="size-3" /> : <Minus className="size-3" />}
          {hasHidden && reports}
        </button>
      )}
    </motion.div>
  )
}

function PersonAvatar({ p, size = "md" }: { p: OrgPerson; size?: "sm" | "md" }) {
  const color = deptColor(p.department)
  return (
    <Avatar className={cn("shrink-0", size === "sm" ? "size-8" : "size-9")}>
      {p.photo && <AvatarImage src={p.photo} alt="" />}
      <AvatarFallback className="text-[11px] font-semibold" style={{ backgroundColor: `${color}22`, color }}>{p.initials}</AvatarFallback>
    </Avatar>
  )
}

// ── detail panel ─────────────────────────────────────────────────────────────

function DetailPanel({ p, isAr, t, onNavigate, onClose }: {
  p: OrgPerson; isAr: boolean; t: (en: string, ar: string) => string
  onNavigate: (id: string) => void; onClose: () => void
}) {
  const manager = p.managerId ? personById(p.managerId) : undefined
  const reports = childrenOf(p.id)
  const color = deptColor(p.department)
  return (
    <>
      <div className="relative p-5 text-center">
        <span className="absolute inset-x-0 top-0 h-20 rounded-t-2xl" style={{ background: `linear-gradient(${color}1c, transparent)` }} />
        <button onClick={onClose} aria-label={t("Close", "إغلاق")}
          className="absolute end-2.5 top-2.5 z-10 grid size-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <X className="size-4" />
        </button>
        <span className="relative">
          <Avatar className="mx-auto size-16 ring-2 ring-card">
            {p.photo && <AvatarImage src={p.photo} alt="" />}
            <AvatarFallback className="text-[18px] font-bold" style={{ backgroundColor: `${color}26`, color }}>{p.initials}</AvatarFallback>
          </Avatar>
          <div className="mt-2.5 flex items-center justify-center gap-1.5">
            <span className="font-heading text-[16px] font-bold leading-tight">{isAr ? p.nameAr : p.name}</span>
            {p.isMe && <Badge variant="outline" className="border-primary/40 bg-primary/10 text-[10px] text-primary">{t("You", "أنت")}</Badge>}
          </div>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">{isAr ? p.titleAr : p.title}</p>
          <span className="mt-2 inline-block rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide"
            style={{ backgroundColor: `${color}1e`, color }}>{isAr ? p.departmentAr : p.department}</span>
        </span>
      </div>

      <div className="space-y-2.5 p-4">
        <Row icon={Mail} value={p.email} href={`mailto:${p.email}`} />
        {p.phone && <Row icon={Phone} value={p.phone} href={`tel:${p.phone.replace(/\s/g, "")}`} />}
        <Row icon={MapPin} value={isAr ? p.locationAr : p.location} />
      </div>

      {manager && (
        <div className="border-t border-border p-4">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">{t("Reports to", "يتبع لـ")}</div>
          <MiniPerson p={manager} isAr={isAr} onClick={() => onNavigate(manager.id)} />
        </div>
      )}

      {reports.length > 0 && (
        <div className="border-t border-border p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">{t("Direct reports", "التابعون المباشرون")}</span>
            <span className="text-[10px] tabular-nums text-muted-foreground">{reports.length} · {teamSize(p.id)} {t("total", "الإجمالي")}</span>
          </div>
          <div className="space-y-1.5">
            {reports.map((r) => <MiniPerson key={r.id} p={r} isAr={isAr} onClick={() => onNavigate(r.id)} />)}
          </div>
        </div>
      )}
    </>
  )
}

function Row({ icon: Icon, value, href }: { icon: React.ComponentType<{ className?: string }>; value: string; href?: string }) {
  const body = (
    <span className="flex items-center gap-2.5 text-[12.5px]">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1 truncate">{value}</span>
    </span>
  )
  return href ? <a href={href} className="block transition-colors hover:text-primary">{body}</a> : <div className="text-muted-foreground">{body}</div>
}

function MiniPerson({ p, isAr, onClick }: { p: OrgPerson; isAr: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-2.5 rounded-lg p-1.5 text-start transition-colors hover:bg-primary/[0.06]">
      <PersonAvatar p={p} size="sm" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12.5px] font-medium leading-tight">{isAr ? p.nameAr : p.name}</span>
        <span className="block truncate text-[11px] leading-tight text-muted-foreground">{isAr ? p.titleAr : p.title}</span>
      </span>
    </button>
  )
}
