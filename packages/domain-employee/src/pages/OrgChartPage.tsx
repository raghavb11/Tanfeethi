import * as React from "react"
import { motion } from "framer-motion"
import { useSearchParams } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage, Badge, Button, Card, Input } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  Building2, ChevronRight, Crosshair, Mail, MapPin, Maximize2, Minus, Network, Phone,
  Plus, Search, Users, X,
} from "lucide-react"

import {
  chainTo, childrenOf, deptColor, deptCounts, ME_ID, ORG, type OrgPerson,
  personById, ROOT, searchPeople, teamSize,
} from "../data/mock/org"

type View = "chart" | "list"

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
  const initial = deepLink && personById(deepLink) ? deepLink : ME_ID
  const initialRoot = React.useMemo(() => {
    const p = personById(initial)!
    return childrenOf(initial).length ? initial : p.managerId ?? initial
  }, [initial])

  const [rootId, setRootId] = React.useState(deepLink ? initialRoot : ROOT.id)
  const [selectedId, setSelectedId] = React.useState<string | null>(initial)
  const [collapsed, setCollapsed] = React.useState<Set<string>>(new Set())
  const [view, setView] = React.useState<View>("chart")
  const [zoom, setZoom] = React.useState(1)
  const [q, setQ] = React.useState("")
  const [openSearch, setOpenSearch] = React.useState(false)

  const root = personById(rootId) ?? ROOT
  const trail = chainTo(rootId)
  const selected = selectedId ? personById(selectedId) : undefined
  const results = searchPeople(q, isAr)
  const depts = deptCounts()

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
    <main className="@container mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
      {/* header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <Network className="size-5" />
            <span className="text-xs font-semibold uppercase tracking-[0.14em]">{t("Organisation", "المنظمة")}</span>
          </div>
          <h1 className="mt-2 font-heading text-[28px] font-bold leading-tight tracking-tight sm:text-[32px]">{t("Org chart", "الهيكل التنظيمي")}</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">{t("Who reports to whom across ALTANFEETHI — search anyone, or drill into a team.", "من يتبع لمن في التنفيذي — ابحث عن أي شخص أو تصفح فريقًا.")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="gap-1.5" onClick={() => focusOn(ME_ID)}>
            <Crosshair className="size-4" />{t("Find me", "أين أنا")}
          </Button>
          <div className="inline-flex rounded-xl border border-border p-0.5">
            {([{ id: "chart", label: "Chart", ar: "المخطط", icon: Network }, { id: "list", label: "Directory", ar: "الدليل", icon: Users }] as const).map((v) => (
              <button key={v.id} onClick={() => setView(v.id)} aria-pressed={view === v.id}
                className={cn("inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
                  view === v.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                <v.icon className="size-4" />{isAr ? v.ar : v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* search */}
      <div className="relative mb-5 max-w-md">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpenSearch(true) }}
          onFocus={() => setOpenSearch(true)}
          placeholder={t("Search by name, title or department", "ابحث بالاسم أو المسمى أو الإدارة")}
          className="h-11 ps-9 pe-9"
        />
        {q && (
          <button onClick={() => { setQ(""); setOpenSearch(false) }} aria-label={t("Clear search", "مسح البحث")}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
        )}
        {openSearch && q && (
          <Card className="absolute z-20 mt-1.5 w-full overflow-hidden p-0 shadow-lg">
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
                {p.isMe && <Badge variant="outline" className="shrink-0 border-primary/40 bg-primary/10 text-[10px] text-primary">{t("You", "أنت")}</Badge>}
              </button>
            ))}
          </Card>
        )}
      </div>

      {/* summary — the last two describe the chart's current root */}
      <div className={cn("mb-5 grid grid-cols-2 gap-3", view === "chart" ? "@2xl:grid-cols-4" : "@2xl:grid-cols-2")}>
        <Stat icon={Users} value={ORG.length} label={t("People", "موظفون")} />
        <Stat icon={Building2} value={depts.length} label={t("Departments", "الإدارات")} />
        {view === "chart" && (
          <>
            <Stat icon={Network} value={childrenOf(root.id).length} label={t("Direct reports", "التابعون المباشرون")} />
            <Stat icon={Crosshair} value={teamSize(root.id)} label={t("In this team", "في هذا الفريق")} />
          </>
        )}
      </div>

      {view === "chart" ? (
        <div className="grid gap-5 @5xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            {/* toolbar: breadcrumb + zoom */}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1 text-[12.5px]">
                {trail.map((p, i) => (
                  <React.Fragment key={p.id}>
                    {i > 0 && <ChevronRight className={cn("size-3.5 shrink-0 text-muted-foreground/40", isAr && "rotate-180")} />}
                    <button onClick={() => setRootId(p.id)}
                      className={cn("rounded-md px-1.5 py-0.5 transition-colors hover:bg-primary/10 hover:text-primary",
                        i === trail.length - 1 ? "font-semibold text-foreground" : "text-muted-foreground")}>
                      {isAr ? p.nameAr : p.name}
                    </button>
                  </React.Fragment>
                ))}
              </div>
              <div className="inline-flex items-center gap-1 rounded-lg border border-border p-0.5">
                <button onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.15).toFixed(2)))} aria-label={t("Zoom out", "تصغير")}
                  className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><Minus className="size-3.5" /></button>
                <span className="min-w-[3rem] text-center text-[11px] font-semibold tabular-nums text-muted-foreground">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom((z) => Math.min(1.4, +(z + 0.15).toFixed(2)))} aria-label={t("Zoom in", "تكبير")}
                  className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><Plus className="size-3.5" /></button>
                <span className="mx-0.5 h-4 w-px bg-border" />
                <button onClick={() => { setZoom(1); setCollapsed(new Set()) }} aria-label={t("Reset view", "إعادة الضبط")}
                  className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><Maximize2 className="size-3.5" /></button>
              </div>
            </div>

            {/* canvas */}
            <Card className="overflow-x-auto bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:22px_22px] p-6">
              <div className="mx-auto" style={{ width: width * zoom, height: height * zoom }}>
                <div className="relative origin-top-left" style={{ width, height, transform: `scale(${zoom})` }}>
                  {/* connectors */}
                  <svg width={width} height={height} className="pointer-events-none absolute inset-0 overflow-visible">
                    {edges.map((e) => (
                      <path key={`${e.from.id}-${e.to.id}`}
                        d={edgePath(mcx(e.from.x + NODE_W / 2), e.from.y + NODE_H, mcx(e.to.x + NODE_W / 2), e.to.y)}
                        fill="none" stroke="var(--border)" strokeWidth={1.5} strokeLinecap="round" />
                    ))}
                  </svg>
                  {/* nodes */}
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
            </Card>

            {/* legend */}
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              {depts.map((d) => (
                <span key={d.name} className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="size-2 rounded-full" style={{ backgroundColor: deptColor(d.name) }} />
                  {isAr ? d.nameAr : d.name} <span className="tabular-nums opacity-60">{d.count}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="@5xl:sticky @5xl:top-6 @5xl:self-start">
            {selected ? <DetailPanel p={selected} isAr={isAr} t={t} onNavigate={focusOn} /> : (
              <Card className="p-6 text-center text-[13px] text-muted-foreground">{t("Select someone to see their details.", "اختر شخصًا لعرض تفاصيله.")}</Card>
            )}
          </div>
        </div>
      ) : (
        <Directory isAr={isAr} t={t} onOpen={focusOn} />
      )}
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

function DetailPanel({ p, isAr, t, onNavigate }: {
  p: OrgPerson; isAr: boolean; t: (en: string, ar: string) => string; onNavigate: (id: string) => void
}) {
  const manager = p.managerId ? personById(p.managerId) : undefined
  const reports = childrenOf(p.id)
  const color = deptColor(p.department)
  return (
    <Card className="overflow-hidden p-0">
      <div className="relative p-5 text-center">
        <span className="absolute inset-x-0 top-0 h-20" style={{ background: `linear-gradient(${color}1c, transparent)` }} />
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
    </Card>
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

// ── directory ────────────────────────────────────────────────────────────────

function Directory({ isAr, t, onOpen }: {
  isAr: boolean; t: (en: string, ar: string) => string; onOpen: (id: string) => void
}) {
  const th = "px-4 py-3 text-start text-[12px] font-medium text-muted-foreground"
  const sorted = [...ORG].sort((a, b) =>
    a.department.localeCompare(b.department) || (isAr ? a.nameAr.localeCompare(b.nameAr) : a.name.localeCompare(b.name)))
  return (
    <Card className="overflow-hidden py-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className={th}>{t("Name", "الاسم")}</th>
              <th className={th}>{t("Title", "المسمى الوظيفي")}</th>
              <th className={th}>{t("Department", "الإدارة")}</th>
              <th className={th}>{t("Reports to", "يتبع لـ")}</th>
              <th className={th}>{t("Location", "الموقع")}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => {
              const mgr = p.managerId ? personById(p.managerId) : undefined
              return (
                <tr key={p.id} onClick={() => onOpen(p.id)} tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter") onOpen(p.id) }}
                  className={cn("cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-primary/[0.04]", p.isMe && "bg-primary/[0.05]")}>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2.5">
                      <PersonAvatar p={p} size="sm" />
                      <span className="font-medium">{isAr ? p.nameAr : p.name}</span>
                      {p.isMe && <Badge variant="outline" className="border-primary/40 bg-primary/10 text-[10px] text-primary">{t("You", "أنت")}</Badge>}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{isAr ? p.titleAr : p.title}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-[12.5px]">
                      <span className="size-2 rounded-full" style={{ backgroundColor: deptColor(p.department) }} />
                      {isAr ? p.departmentAr : p.department}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{mgr ? (isAr ? mgr.nameAr : mgr.name) : "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{isAr ? p.locationAr : p.location}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="border-t border-border bg-muted/20 px-4 py-3 text-[12px] text-muted-foreground">
        {ORG.length} {t("people", "موظفًا")}
      </div>
    </Card>
  )
}

function Stat({ icon: Icon, value, label }: { icon: React.ComponentType<{ className?: string }>; value: number; label: string }) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary"><Icon className="size-5" /></span>
      <div>
        <div className="text-[22px] font-bold tabular-nums leading-none">{value}</div>
        <div className="mt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/60">{label}</div>
      </div>
    </Card>
  )
}
