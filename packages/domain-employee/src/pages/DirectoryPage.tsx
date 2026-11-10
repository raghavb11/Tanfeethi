import * as React from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  Building2, ChevronRight, Contact, LayoutGrid, List, Mail, MapPin, Network, Phone,
  Search, SlidersHorizontal, Users, X,
} from "lucide-react"

import { childrenOf, deptColor, deptCounts, ORG, type OrgPerson, personById } from "../data/mock/org"
import { Chip, Empty, OutlineButton, Page, SectionCard, fieldClass } from "../components/wijha"

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
    <Page className="@container space-y-5">
      {/* toolbar */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <OutlineButton onClick={() => navigate("/org-chart")}>
          <Network className="size-4" />{t("Org chart", "الهيكل التنظيمي")}
        </OutlineButton>
        <div className="inline-flex rounded-lg bg-secondary p-1">
          {([{ id: "grid", label: "Cards", ar: "بطاقات", icon: LayoutGrid }, { id: "list", label: "List", ar: "قائمة", icon: List }] as const).map((v) => (
            <button key={v.id} type="button" onClick={() => setView(v.id)} aria-pressed={view === v.id}
              className={cn("inline-flex h-7 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium transition-colors",
                view === v.id ? "bg-soft-accent text-primary" : "text-muted-foreground hover:text-foreground")}>
              <v.icon className="size-4" />{isAr ? v.ar : v.label}
            </button>
          ))}
        </div>
      </div>

      {/* search + filters */}
      <section className="panel space-y-4 rounded-xl px-4 py-5 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-0 flex-1 basis-60">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)}
              aria-label={t("Search people", "ابحث عن شخص")}
              placeholder={t("Search name, title, email or team", "ابحث بالاسم أو المسمى أو البريد أو الفريق")}
              className={cn(fieldClass, "h-10 ps-9 pe-9")} />
            {q && (
              <button type="button" onClick={() => setQ("")} aria-label={t("Clear search", "مسح البحث")}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
            )}
          </div>
          <label className="inline-flex min-w-0 items-center gap-2">
            <MapPin className="size-4 shrink-0 text-primary" />
            <select value={location} onChange={(e) => setLocation(e.target.value)} aria-label={t("Location", "الموقع")}
              className={cn(fieldClass, "h-10 w-auto min-w-0")}>
              <option value="all">{t("All locations", "جميع المواقع")}</option>
              {locations.map((l) => <option key={l.value} value={l.value}>{isAr ? l.ar : l.value}</option>)}
            </select>
          </label>
        </div>

        {/* department chips */}
        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="size-3.5 shrink-0 text-icon" />
          {allDepts.map((d) => {
            const on = depts.includes(d.name)
            return (
              <button key={d.name} type="button" onClick={() => toggleDept(d.name)} aria-pressed={on}
                className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12.5px] transition-colors",
                  on ? "bg-soft-accent text-primary ring-1 ring-inset ring-primary/40" : "bg-secondary text-muted-foreground hover:text-foreground")}>
                <span className="size-2 rounded-full" style={{ backgroundColor: deptColor(d.name) }} />
                {isAr ? d.nameAr : d.name}
                <span className="tabular-nums opacity-60">{d.count}</span>
              </button>
            )
          })}
          {filtersOn && (
            <button type="button" onClick={clearAll} className="ms-1 inline-flex items-center gap-1 text-[12.5px] font-medium text-primary hover:underline">
              <X className="size-3.5" />{t("Clear", "مسح")}
            </button>
          )}
        </div>
      </section>

      <div className="text-[12.5px] text-muted-foreground">
        {results.length} {t(results.length === 1 ? "person" : "people", "موظفًا")}
        {filtersOn && <> · {t("filtered from", "من أصل")} {ORG.length}</>}
      </div>

      <div className="grid gap-6 @5xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          {results.length === 0 ? (
            <SectionCard>
              <Empty icon={Users} title={t("No one matches those filters.", "لا أحد يطابق هذه الفلاتر.")}
                hint={t("Try a different name, team or location.", "جرّب اسمًا أو فريقًا أو موقعًا آخر.")}
                action={<OutlineButton size="sm" className="mt-2" onClick={clearAll}>{t("Clear filters", "مسح الفلاتر")}</OutlineButton>} />
            </SectionCard>
          ) : view === "grid" ? (
            <div className="grid gap-4 @xl:grid-cols-2 @4xl:grid-cols-3">
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
            <SectionCard>
              <Empty icon={Contact} title={t("No one selected", "لم يتم اختيار أحد")}
                hint={t("Select someone to see their contact details.", "اختر شخصًا لعرض بيانات التواصل.")} />
            </SectionCard>
          )}
        </div>
      </div>
    </Page>
  )
}

// ── bits ─────────────────────────────────────────────────────────────────────

function PersonAvatar({ p, size = "md" }: { p: OrgPerson; size?: "sm" | "md" | "lg" }) {
  return (
    <Avatar className={cn("shrink-0", size === "sm" ? "size-8" : size === "md" ? "size-12" : "size-16")}>
      {p.photo && <AvatarImage src={p.photo} alt="" />}
      <AvatarFallback className={cn("font-medium", size === "lg" ? "text-[18px]" : "text-[13px]",
        p.isMe ? "bg-soft-accent text-primary" : "bg-secondary text-muted-foreground")}>{p.initials}</AvatarFallback>
    </Avatar>
  )
}

/** Neutral department chip with the department's legend dot. */
function DeptChip({ p, isAr }: { p: OrgPerson; isAr: boolean }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 rounded-md bg-secondary px-2 py-0.5 text-[11.5px] text-muted-foreground">
      <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: deptColor(p.department) }} />
      <span className="truncate">{isAr ? p.departmentAr : p.department}</span>
    </span>
  )
}

function PersonCard({ p, i, selected, isAr, t, onSelect }: {
  p: OrgPerson; i: number; selected: boolean; isAr: boolean
  t: (en: string, ar: string) => string; onSelect: () => void
}) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(i * 0.015, 0.2) }}
      onClick={onSelect}
      className={cn("panel flex w-full min-w-0 flex-col rounded-xl p-4 text-start transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg",
        p.isMe && "bg-soft-accent", selected && "ring-2 ring-primary/60")}>
      <div className="flex items-start gap-3">
        <PersonAvatar p={p} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[14.5px] font-medium leading-tight">{isAr ? p.nameAr : p.name}</span>
            {p.isMe && <Chip tone="accent" className="h-5 px-1.5 text-[11px]">{t("You", "أنت")}</Chip>}
          </div>
          <div className="mt-0.5 truncate text-[12.5px] leading-snug text-muted-foreground">{isAr ? p.titleAr : p.title}</div>
        </div>
      </div>

      <div className="mt-3 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
        <DeptChip p={p} isAr={isAr} />
        <span className="inline-flex min-w-0 items-center gap-1 text-[12px] text-muted-foreground">
          <MapPin className="size-3 shrink-0" /><span className="truncate">{isAr ? p.locationAr : p.location}</span>
        </span>
      </div>

      <div className="card-separator mt-3" />
      <div className="mt-2.5 flex items-center gap-1.5">
        <IconLink href={`mailto:${p.email}`} label={t("Email", "بريد")} icon={Mail} />
        {p.phone && <IconLink href={`tel:${p.phone.replace(/\s/g, "")}`} label={t("Call", "اتصال")} icon={Phone} />}
        <span className="ms-auto inline-flex items-center gap-1 text-[12px] text-primary">
          {t("Details", "التفاصيل")}<ChevronRight className="size-3 rtl:rotate-180" />
        </span>
      </div>
    </motion.button>
  )
}

function IconLink({ href, label, icon: Icon }: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <a href={href} onClick={(e) => e.stopPropagation()} aria-label={label}
      className="grid size-8 place-items-center rounded-lg bg-secondary text-primary transition-colors hover:bg-soft-accent">
      <Icon className="size-3.5" />
    </a>
  )
}

function PersonTable({ rows, selectedId, isAr, t, onSelect }: {
  rows: OrgPerson[]; selectedId: string | null; isAr: boolean
  t: (en: string, ar: string) => string; onSelect: (id: string) => void
}) {
  const th = "px-4 py-3 text-start text-[12.5px] font-medium text-muted-foreground"
  return (
    <SectionCard bodyClassName="-mx-4 -my-5 sm:-mx-6">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-[13px]">
          <thead>
            <tr className="border-b border-border">
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
                className={cn("cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-soft-accent/40",
                  selectedId === p.id && "bg-soft-accent", p.isMe && selectedId !== p.id && "bg-soft-accent/50")}>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2.5">
                    <PersonAvatar p={p} size="sm" />
                    <span className="font-medium">{isAr ? p.nameAr : p.name}</span>
                    {p.isMe && <Chip tone="accent" className="h-5 px-1.5 text-[11px]">{t("You", "أنت")}</Chip>}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{isAr ? p.titleAr : p.title}</td>
                <td className="px-4 py-3"><DeptChip p={p} isAr={isAr} /></td>
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
    </SectionCard>
  )
}

function ContactCard({ p, isAr, t, onOrgChart, onSelect }: {
  p: OrgPerson; isAr: boolean; t: (en: string, ar: string) => string
  onOrgChart: () => void; onSelect: (id: string) => void
}) {
  const manager = p.managerId ? personById(p.managerId) : undefined
  const reports = childrenOf(p.id)
  return (
    <section className="panel overflow-hidden rounded-xl">
      <div className="relative p-5 text-center">
        <span className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-soft-accent to-transparent" />
        <span className="relative block">
          <span className="mx-auto block w-fit"><PersonAvatar p={p} size="lg" /></span>
          <div className="mt-2.5 flex items-center justify-center gap-1.5">
            <span className="text-[17px] font-medium leading-tight">{isAr ? p.nameAr : p.name}</span>
            {p.isMe && <Chip tone="accent">{t("You", "أنت")}</Chip>}
          </div>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">{isAr ? p.titleAr : p.title}</p>
          <span className="mt-2 inline-flex"><DeptChip p={p} isAr={isAr} /></span>
        </span>
      </div>

      <div className="space-y-2.5 border-t border-border p-4">
        <DetailRow icon={Mail} value={p.email} href={`mailto:${p.email}`} ltr />
        {p.phone && <DetailRow icon={Phone} value={p.phone} href={`tel:${p.phone.replace(/\s/g, "")}`} ltr />}
        <DetailRow icon={MapPin} value={isAr ? p.locationAr : p.location} />
        <DetailRow icon={Building2} value={isAr ? p.departmentAr : p.department} />
      </div>

      <div className="px-4 pb-4">
        <OutlineButton className="w-full" onClick={onOrgChart}>
          <Network className="size-4" />{t("View in org chart", "عرض في الهيكل التنظيمي")}
        </OutlineButton>
      </div>

      {manager && (
        <div className="border-t border-border p-4">
          <div className="mb-2 text-[12px] text-muted-foreground">{t("Reports to", "يتبع لـ")}</div>
          <MiniRow p={manager} isAr={isAr} onClick={() => onSelect(manager.id)} />
        </div>
      )}

      {reports.length > 0 && (
        <div className="border-t border-border p-4">
          <div className="mb-2 text-[12px] text-muted-foreground">
            {t("Direct reports", "التابعون المباشرون")} <span className="tabular-nums opacity-70">({reports.length})</span>
          </div>
          <div className="space-y-1">
            {reports.map((r) => <MiniRow key={r.id} p={r} isAr={isAr} onClick={() => onSelect(r.id)} />)}
          </div>
        </div>
      )}
    </section>
  )
}

function DetailRow({ icon: Icon, value, href, ltr }: { icon: React.ComponentType<{ className?: string }>; value: string; href?: string; ltr?: boolean }) {
  const body = (
    <span className="flex items-center gap-2.5 text-[13px]">
      <Icon className="size-4 shrink-0 text-primary" />
      <span className="min-w-0 flex-1 truncate text-start" dir={ltr ? "ltr" : undefined}>{value}</span>
    </span>
  )
  return href ? <a href={href} className="block transition-colors hover:text-primary">{body}</a> : <div className="text-muted-foreground">{body}</div>
}

function MiniRow({ p, isAr, onClick }: { p: OrgPerson; isAr: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-2.5 rounded-lg p-1.5 text-start transition-colors hover:bg-soft-accent/50">
      <PersonAvatar p={p} size="sm" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] leading-tight">{isAr ? p.nameAr : p.name}</span>
        <span className="block truncate text-[12px] leading-tight text-muted-foreground">{isAr ? p.titleAr : p.title}</span>
      </span>
    </button>
  )
}
