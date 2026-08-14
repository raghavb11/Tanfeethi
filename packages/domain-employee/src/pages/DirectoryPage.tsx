import * as React from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage, Badge, Button, Card, Input } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  Building2, ChevronRight, Contact, LayoutGrid, List, Mail, MapPin, Network, Phone,
  Search, SlidersHorizontal, Users, X,
} from "lucide-react"

import { childrenOf, deptColor, deptCounts, ORG, type OrgPerson, personById } from "../data/mock/org"

type View = "grid" | "list"

export default function DirectoryPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()

  const [q, setQ] = React.useState("")
  const [depts, setDepts] = React.useState<string[]>([])
  const [location, setLocation] = React.useState("all")
  const [view, setView] = React.useState<View>("grid")
  const [selectedId, setSelectedId] = React.useState<string | null>(null)

  const allDepts = deptCounts()
  // filter on the English value but label it in the active locale
  const locations = React.useMemo(() => {
    const m = new Map<string, string>()
    for (const p of ORG) if (!m.has(p.location)) m.set(p.location, p.locationAr)
    return [...m.entries()].map(([value, ar]) => ({ value, ar })).sort((a, b) => a.value.localeCompare(b.value))
  }, [])

  const results = React.useMemo(() => {
    const needle = q.trim().toLowerCase()
    return ORG
      .filter((p) => depts.length === 0 || depts.includes(p.department))
      .filter((p) => location === "all" || p.location === location)
      .filter((p) => !needle || [isAr ? p.nameAr : p.name, isAr ? p.titleAr : p.title, p.email, isAr ? p.departmentAr : p.department]
        .some((f) => f.toLowerCase().includes(needle)))
      .sort((a, b) => (isAr ? a.nameAr.localeCompare(b.nameAr) : a.name.localeCompare(b.name)))
  }, [q, depts, location, isAr])

  const selected = selectedId ? personById(selectedId) : undefined
  const filtersOn = depts.length > 0 || location !== "all" || q.trim() !== ""
  const toggleDept = (d: string) =>
    setDepts((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))
  const clearAll = () => { setQ(""); setDepts([]); setLocation("all") }

  return (
    <main className="@container mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
      {/* header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <Contact className="size-5" />
            <span className="text-xs font-semibold uppercase tracking-[0.14em]">{t("People", "الموظفون")}</span>
          </div>
          <h1 className="mt-2 font-heading text-[28px] font-bold leading-tight tracking-tight sm:text-[32px]">{t("Employee directory", "دليل الموظفين")}</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">{t("Find anyone at ALTANFEETHI — by name, team or location.", "ابحث عن أي زميل في التنفيذي — بالاسم أو الفريق أو الموقع.")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="gap-1.5" onClick={() => navigate("/org-chart")}>
            <Network className="size-4" />{t("Org chart", "الهيكل التنظيمي")}
          </Button>
          <div className="inline-flex rounded-xl border border-border p-0.5">
            {([{ id: "grid", label: "Cards", ar: "بطاقات", icon: LayoutGrid }, { id: "list", label: "List", ar: "قائمة", icon: List }] as const).map((v) => (
              <button key={v.id} onClick={() => setView(v.id)} aria-pressed={view === v.id}
                className={cn("inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
                  view === v.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                <v.icon className="size-4" />{isAr ? v.ar : v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* search + location */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)}
            placeholder={t("Search name, title, email or team", "ابحث بالاسم أو المسمى أو البريد أو الفريق")}
            className="h-11 ps-9 pe-9" />
          {q && (
            <button onClick={() => setQ("")} aria-label={t("Clear search", "مسح البحث")}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
          )}
        </div>
        <label className="inline-flex items-center gap-2">
          <MapPin className="size-4 shrink-0 text-muted-foreground" />
          <select value={location} onChange={(e) => setLocation(e.target.value)}
            className="h-11 rounded-xl border border-border bg-card px-3 text-sm outline-none transition-colors focus:border-primary">
            <option value="all">{t("All locations", "جميع المواقع")}</option>
            {locations.map((l) => <option key={l.value} value={l.value}>{isAr ? l.ar : l.value}</option>)}
          </select>
        </label>
      </div>

      {/* department chips */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <SlidersHorizontal className="size-3.5 shrink-0 text-muted-foreground/60" />
        {allDepts.map((d) => {
          const on = depts.includes(d.name)
          const color = deptColor(d.name)
          return (
            <button key={d.name} onClick={() => toggleDept(d.name)} aria-pressed={on}
              className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-medium transition-colors",
                on ? "text-foreground" : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground")}
              style={on ? { backgroundColor: `${color}18`, borderColor: `${color}66` } : undefined}>
              <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
              {isAr ? d.nameAr : d.name}
              <span className="tabular-nums opacity-50">{d.count}</span>
            </button>
          )
        })}
        {filtersOn && (
          <button onClick={clearAll} className="ms-1 inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:underline">
            <X className="size-3.5" />{t("Clear", "مسح")}
          </button>
        )}
      </div>

      <div className="mb-3 text-[12.5px] text-muted-foreground">
        {results.length} {t(results.length === 1 ? "person" : "people", "موظفًا")}
        {filtersOn && <> · {t("filtered from", "من أصل")} {ORG.length}</>}
      </div>

      <div className="grid gap-5 @5xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          {results.length === 0 ? (
            <Card className="p-10 text-center">
              <Users className="mx-auto size-8 text-muted-foreground/40" />
              <p className="mt-3 text-[14px] font-semibold">{t("No one matches those filters.", "لا أحد يطابق هذه الفلاتر.")}</p>
              <p className="mt-1 text-[12.5px] text-muted-foreground">{t("Try a different name, team or location.", "جرّب اسمًا أو فريقًا أو موقعًا آخر.")}</p>
              <Button variant="outline" className="mt-4" onClick={clearAll}>{t("Clear filters", "مسح الفلاتر")}</Button>
            </Card>
          ) : view === "grid" ? (
            <div className="grid gap-3 @xl:grid-cols-2 @4xl:grid-cols-3">
              {results.map((p, i) => (
                <PersonCard key={p.id} p={p} i={i} selected={selectedId === p.id} isAr={isAr} t={t}
                  onSelect={() => setSelectedId(p.id)} />
              ))}
            </div>
          ) : (
            <PersonTable rows={results} selectedId={selectedId} isAr={isAr} t={t} onSelect={setSelectedId} />
          )}
        </div>

        <div className="@5xl:sticky @5xl:top-6 @5xl:self-start">
          {selected ? (
            <ContactCard p={selected} isAr={isAr} t={t}
              onOrgChart={() => navigate(`/org-chart?person=${selected.id}`)}
              onSelect={setSelectedId} />
          ) : (
            <Card className="p-6 text-center">
              <Contact className="mx-auto size-7 text-muted-foreground/40" />
              <p className="mt-2.5 text-[13px] text-muted-foreground">{t("Select someone to see their contact details.", "اختر شخصًا لعرض بيانات التواصل.")}</p>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
}

// ── cards ────────────────────────────────────────────────────────────────────

function PersonCard({ p, i, selected, isAr, t, onSelect }: {
  p: OrgPerson; i: number; selected: boolean; isAr: boolean
  t: (en: string, ar: string) => string; onSelect: () => void
}) {
  const color = deptColor(p.department)
  return (
    <motion.button
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(i * 0.015, 0.2) }}
      onClick={onSelect}
      className={cn("flex w-full flex-col rounded-2xl border bg-card p-4 text-start shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg",
        selected ? "border-primary/60 ring-2 ring-primary/20" : "border-border/80")}>
      <div className="flex items-start gap-3">
        <Avatar className="size-12 shrink-0 ring-2 ring-offset-2 ring-offset-card" style={{ ["--tw-ring-color" as string]: `${color}55` }}>
          {p.photo && <AvatarImage src={p.photo} alt="" />}
          <AvatarFallback className="text-[13px] font-bold" style={{ backgroundColor: `${color}1f`, color }}>{p.initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[14px] font-semibold leading-tight">{isAr ? p.nameAr : p.name}</span>
            {p.isMe && <Badge variant="outline" className="shrink-0 border-primary/40 bg-primary/10 px-1.5 text-[9.5px] text-primary">{t("You", "أنت")}</Badge>}
          </div>
          <div className="mt-0.5 truncate text-[11.5px] leading-snug text-muted-foreground">{isAr ? p.titleAr : p.title}</div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="truncate rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: `${color}16`, color }}>
          {isAr ? p.departmentAr : p.department}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <MapPin className="size-3" />{isAr ? p.locationAr : p.location}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-1.5 border-t border-border/60 pt-2.5">
        <IconLink href={`mailto:${p.email}`} label={t("Email", "بريد")} icon={Mail} />
        {p.phone && <IconLink href={`tel:${p.phone.replace(/\s/g, "")}`} label={t("Call", "اتصال")} icon={Phone} />}
        <span className="ms-auto inline-flex items-center gap-1 text-[10.5px] text-muted-foreground/70">
          {t("Details", "التفاصيل")}<ChevronRight className={cn("size-3", isAr && "rotate-180")} />
        </span>
      </div>
    </motion.button>
  )
}

function IconLink({ href, label, icon: Icon }: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <a href={href} onClick={(e) => e.stopPropagation()} aria-label={label}
      className="grid size-7 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/[0.06] hover:text-primary">
      <Icon className="size-3.5" />
    </a>
  )
}

function PersonTable({ rows, selectedId, isAr, t, onSelect }: {
  rows: OrgPerson[]; selectedId: string | null; isAr: boolean
  t: (en: string, ar: string) => string; onSelect: (id: string) => void
}) {
  const th = "px-4 py-3 text-start text-[12px] font-medium text-muted-foreground"
  return (
    <Card className="overflow-hidden py-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className={th}>{t("Name", "الاسم")}</th>
              <th className={th}>{t("Title", "المسمى الوظيفي")}</th>
              <th className={th}>{t("Department", "الإدارة")}</th>
              <th className={th}>{t("Location", "الموقع")}</th>
              <th className={th}>{t("Contact", "التواصل")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} onClick={() => onSelect(p.id)} tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") onSelect(p.id) }}
                className={cn("cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-primary/[0.04]",
                  selectedId === p.id && "bg-primary/[0.06]", p.isMe && selectedId !== p.id && "bg-primary/[0.03]")}>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2.5">
                    <Avatar className="size-8 shrink-0">
                      {p.photo && <AvatarImage src={p.photo} alt="" />}
                      <AvatarFallback className="text-[11px] font-semibold"
                        style={{ backgroundColor: `${deptColor(p.department)}22`, color: deptColor(p.department) }}>{p.initials}</AvatarFallback>
                    </Avatar>
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
                <td className="px-4 py-3 text-muted-foreground">{isAr ? p.locationAr : p.location}</td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1.5">
                    <IconLink href={`mailto:${p.email}`} label={t("Email", "بريد")} icon={Mail} />
                    {p.phone && <IconLink href={`tel:${p.phone.replace(/\s/g, "")}`} label={t("Call", "اتصال")} icon={Phone} />}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function ContactCard({ p, isAr, t, onOrgChart, onSelect }: {
  p: OrgPerson; isAr: boolean; t: (en: string, ar: string) => string
  onOrgChart: () => void; onSelect: (id: string) => void
}) {
  const color = deptColor(p.department)
  const manager = p.managerId ? personById(p.managerId) : undefined
  const reports = childrenOf(p.id)
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
        <DetailRow icon={Mail} value={p.email} href={`mailto:${p.email}`} />
        {p.phone && <DetailRow icon={Phone} value={p.phone} href={`tel:${p.phone.replace(/\s/g, "")}`} />}
        <DetailRow icon={MapPin} value={isAr ? p.locationAr : p.location} />
        <DetailRow icon={Building2} value={isAr ? p.departmentAr : p.department} />
      </div>

      <div className="px-4 pb-4">
        <Button variant="outline" className="w-full gap-1.5" onClick={onOrgChart}>
          <Network className="size-4" />{t("View in org chart", "عرض في الهيكل التنظيمي")}
        </Button>
      </div>

      {manager && (
        <div className="border-t border-border p-4">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">{t("Reports to", "يتبع لـ")}</div>
          <MiniRow p={manager} isAr={isAr} onClick={() => onSelect(manager.id)} />
        </div>
      )}

      {reports.length > 0 && (
        <div className="border-t border-border p-4">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            {t("Direct reports", "التابعون المباشرون")} <span className="tabular-nums opacity-70">({reports.length})</span>
          </div>
          <div className="space-y-1.5">
            {reports.map((r) => <MiniRow key={r.id} p={r} isAr={isAr} onClick={() => onSelect(r.id)} />)}
          </div>
        </div>
      )}
    </Card>
  )
}

function DetailRow({ icon: Icon, value, href }: { icon: React.ComponentType<{ className?: string }>; value: string; href?: string }) {
  const body = (
    <span className="flex items-center gap-2.5 text-[12.5px]">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1 truncate">{value}</span>
    </span>
  )
  return href ? <a href={href} className="block transition-colors hover:text-primary">{body}</a> : <div className="text-muted-foreground">{body}</div>
}

function MiniRow({ p, isAr, onClick }: { p: OrgPerson; isAr: boolean; onClick: () => void }) {
  const color = deptColor(p.department)
  return (
    <button onClick={onClick} className="flex w-full items-center gap-2.5 rounded-lg p-1.5 text-start transition-colors hover:bg-primary/[0.06]">
      <Avatar className="size-8 shrink-0">
        {p.photo && <AvatarImage src={p.photo} alt="" />}
        <AvatarFallback className="text-[11px] font-semibold" style={{ backgroundColor: `${color}22`, color }}>{p.initials}</AvatarFallback>
      </Avatar>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12.5px] font-medium leading-tight">{isAr ? p.nameAr : p.name}</span>
        <span className="block truncate text-[11px] leading-tight text-muted-foreground">{isAr ? p.titleAr : p.title}</span>
      </span>
    </button>
  )
}
