import * as React from "react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage, Badge, Button, Card, Input } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  Building2, ChevronDown, ChevronRight, Crosshair, Mail, MapPin, Network, Phone,
  Search, Users, X,
} from "lucide-react"

import {
  chainTo, childrenOf, deptColor, deptCounts, ME_ID, ORG, type OrgPerson,
  personById, ROOT, searchPeople, teamSize,
} from "../data/mock/org"

type View = "chart" | "list"

export default function OrgChartPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)

  /** The person whose subtree is drawn. Drilling in re-roots the chart. */
  const [rootId, setRootId] = React.useState(ROOT.id)
  const [selectedId, setSelectedId] = React.useState<string | null>(ME_ID)
  const [view, setView] = React.useState<View>("chart")
  const [q, setQ] = React.useState("")
  const [openSearch, setOpenSearch] = React.useState(false)

  const root = personById(rootId) ?? ROOT
  const trail = chainTo(rootId)
  const selected = selectedId ? personById(selectedId) : undefined
  const results = searchPeople(q, isAr)
  const depts = deptCounts()

  /** Re-root on a person's manager so the person is visible as a child. */
  const focusOn = (id: string) => {
    const p = personById(id)
    if (!p) return
    setRootId(childrenOf(id).length ? id : p.managerId ?? id)
    setSelectedId(id)
    setQ("")
    setOpenSearch(false)
  }

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
                  view === v.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
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
          <Card className="absolute z-20 mt-1.5 w-full overflow-hidden p-0">
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

      {/* summary — the last two describe the chart's current root, so they only
          make sense in chart view */}
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
            {/* breadcrumb */}
            <div className="mb-3 flex flex-wrap items-center gap-1 text-[12.5px]">
              {trail.map((p, i) => (
                <React.Fragment key={p.id}>
                  {i > 0 && <ChevronRight className={cn("size-3.5 shrink-0 text-muted-foreground/50", isAr && "rotate-180")} />}
                  <button onClick={() => setRootId(p.id)}
                    className={cn("rounded-md px-1.5 py-0.5 transition-colors hover:bg-primary/10 hover:text-primary",
                      i === trail.length - 1 ? "font-semibold text-foreground" : "text-muted-foreground")}>
                    {isAr ? p.nameAr : p.name}
                  </button>
                </React.Fragment>
              ))}
            </div>

            <Card className="overflow-x-auto p-5 sm:p-6">
              <Tree root={root} selectedId={selectedId} isAr={isAr} t={t}
                onSelect={setSelectedId} onDrill={(id) => { setRootId(id); setSelectedId(id) }} />
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

          {/* detail panel */}
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

// ── chart ────────────────────────────────────────────────────────────────────

/** Two levels below the root: the root's reports, and each report's reports.
 *  Deeper levels are reached by drilling in, which keeps the chart legible at
 *  any org size. */
function Tree({ root, selectedId, isAr, t, onSelect, onDrill }: {
  root: OrgPerson; selectedId: string | null; isAr: boolean
  t: (en: string, ar: string) => string
  onSelect: (id: string) => void; onDrill: (id: string) => void
}) {
  const reports = childrenOf(root.id)
  return (
    <div className="flex min-w-max flex-col items-center">
      <NodeCard p={root} selected={selectedId === root.id} isAr={isAr} t={t} onSelect={onSelect} onDrill={onDrill} lead />
      {reports.length > 0 && (
        <>
          <Connector />
          <div className="flex items-start gap-6">
            {reports.map((r, i) => (
              <Branch key={r.id} p={r} first={i === 0} last={i === reports.length - 1} only={reports.length === 1}
                selectedId={selectedId} isAr={isAr} t={t} onSelect={onSelect} onDrill={onDrill} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function Branch({ p, first, last, only, selectedId, isAr, t, onSelect, onDrill }: {
  p: OrgPerson; first: boolean; last: boolean; only: boolean; selectedId: string | null
  isAr: boolean; t: (en: string, ar: string) => string
  onSelect: (id: string) => void; onDrill: (id: string) => void
}) {
  const kids = childrenOf(p.id)
  const [open, setOpen] = React.useState(true)
  return (
    <div className="flex flex-col items-center">
      {/* horizontal rail joining siblings, clipped at the ends */}
      <div className="relative h-5 w-full">
        <span className={cn("absolute top-0 h-px bg-border", only ? "start-1/2 w-0" : first ? "start-1/2 end-0" : last ? "start-0 end-1/2" : "inset-x-0")} />
        <span className="absolute start-1/2 top-0 h-5 w-px -translate-x-1/2 bg-border rtl:translate-x-1/2" />
      </div>

      <NodeCard p={p} selected={selectedId === p.id} isAr={isAr} t={t} onSelect={onSelect} onDrill={onDrill} />

      {kids.length > 0 && (
        <>
          <button onClick={() => setOpen((v) => !v)} aria-expanded={open}
            className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 text-[10.5px] text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary">
            <ChevronDown className={cn("size-3 transition-transform", !open && "-rotate-90 rtl:rotate-90")} />
            {kids.length} {t(kids.length === 1 ? "report" : "reports", kids.length === 1 ? "تابع" : "تابعين")}
          </button>
          {open && (
            <>
              <Connector short />
              <div className="flex flex-col gap-2">
                {kids.map((k) => (
                  <LeafCard key={k.id} p={k} selected={selectedId === k.id} isAr={isAr} t={t}
                    onSelect={onSelect} onDrill={onDrill} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

const Connector = ({ short }: { short?: boolean }) => <span className={cn("w-px bg-border", short ? "h-3" : "h-5")} />

function NodeCard({ p, selected, isAr, t, onSelect, onDrill, lead }: {
  p: OrgPerson; selected: boolean; isAr: boolean; t: (en: string, ar: string) => string
  onSelect: (id: string) => void; onDrill: (id: string) => void; lead?: boolean
}) {
  const color = deptColor(p.department)
  const reports = childrenOf(p.id).length
  return (
    <motion.button
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
      onClick={() => onSelect(p.id)} onDoubleClick={() => reports && onDrill(p.id)}
      className={cn("relative w-[210px] rounded-2xl border bg-card p-3 text-start transition-all hover:-translate-y-0.5 hover:shadow-md",
        selected ? "border-primary ring-2 ring-primary/25" : "border-border",
        p.isMe && !selected && "border-primary/50", lead && "w-[230px]")}>
      <span className="absolute inset-x-3 top-0 h-[3px] rounded-b-full" style={{ backgroundColor: color }} />
      <div className="flex items-center gap-2.5">
        <PersonAvatar p={p} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[13px] font-semibold leading-tight">{isAr ? p.nameAr : p.name}</span>
            {p.isMe && <span className="shrink-0 rounded-full bg-primary px-1.5 py-px text-[9px] font-bold text-primary-foreground">{t("YOU", "أنت")}</span>}
          </div>
          <div className="truncate text-[11px] leading-tight text-muted-foreground">{isAr ? p.titleAr : p.title}</div>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="truncate text-[10px] font-medium uppercase tracking-wide" style={{ color }}>{isAr ? p.departmentAr : p.department}</span>
        {reports > 0 && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground">
            <Users className="size-2.5" />{reports}
          </span>
        )}
      </div>
    </motion.button>
  )
}

function LeafCard({ p, selected, isAr, t, onSelect, onDrill }: {
  p: OrgPerson; selected: boolean; isAr: boolean; t: (en: string, ar: string) => string
  onSelect: (id: string) => void; onDrill: (id: string) => void
}) {
  const reports = childrenOf(p.id).length
  return (
    <button onClick={() => onSelect(p.id)} onDoubleClick={() => reports && onDrill(p.id)}
      className={cn("flex w-[210px] items-center gap-2 rounded-xl border bg-card px-2.5 py-2 text-start transition-colors hover:border-primary/50",
        selected ? "border-primary ring-2 ring-primary/25" : "border-border", p.isMe && !selected && "border-primary/50")}>
      <span className="h-7 w-[3px] shrink-0 rounded-full" style={{ backgroundColor: deptColor(p.department) }} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-[12px] font-semibold leading-tight">{isAr ? p.nameAr : p.name}</span>
          {p.isMe && <span className="shrink-0 rounded-full bg-primary px-1.5 py-px text-[9px] font-bold text-primary-foreground">{t("YOU", "أنت")}</span>}
        </span>
        <span className="block truncate text-[10.5px] leading-tight text-muted-foreground">{isAr ? p.titleAr : p.title}</span>
      </span>
      {reports > 0 && <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">+{reports}</span>}
    </button>
  )
}

function PersonAvatar({ p, size = "md" }: { p: OrgPerson; size?: "sm" | "md" }) {
  return (
    <Avatar className={cn("shrink-0", size === "sm" ? "size-8" : "size-9")}>
      {p.photo && <AvatarImage src={p.photo} alt="" />}
      <AvatarFallback className="text-[11px] font-semibold" style={{ backgroundColor: `${deptColor(p.department)}22`, color: deptColor(p.department) }}>
        {p.initials}
      </AvatarFallback>
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
      <div className="p-5 text-center" style={{ backgroundColor: `${color}12` }}>
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
