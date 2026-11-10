import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  FolderOpen, HeartPulse, Laptop, Trash2, User, Wrench,
} from "lucide-react"
import { cn } from "@reach/shared-core"

import {
  Card, CardHeader, CategoryChip, EmptyState, GoldButton, KpiTile, PageBody, ServiceTile, SplitLayout, Stepper } from "../components/wijha"
import { useT } from "../components/i18n"
import { GridIcon, PlayRingIcon, TrayIcon } from "../components/kpi-icons"
import {
  assets, categories, categoryById, isComplete, serviceKpis, stepsFor, useActiveRequests,
  type ServiceRequest,
} from "../data/mock/services"
import { homeTiles } from "../data/mock/wellness"
import { HealthTileView } from "../components/HealthTile"
import { categoryIcons } from "../components/icons"

/** Services home — Figma 2028:1506. */
export default function ServicesHub() {
  const { t, isAr } = useT()
  const navigate = useNavigate()
  const [hidden, setHidden] = React.useState<string[]>([])
  const activeRequests = useActiveRequests()
  const visible = activeRequests.filter((r) => !hidden.includes(r.id))

  const countLabel = (n: number) =>
    isAr ? (n === 1 ? "طلب 1" : n === 2 ? "طلبين" : `${n} طلبات`) : `${n} request${n === 1 ? "" : "s"}`

  return (
    <PageBody>
      <SplitLayout
        main={
          <>
            {/* KPIs */}
            <div className="grid gap-6 sm:grid-cols-2">
              <KpiTile icon={TrayIcon} value={serviceKpis.open} label={t("Open requests", "طلبات مفتوحة")} />
              <KpiTile icon={PlayRingIcon} value={serviceKpis.inProgress} label={t("Requests in progress", "طلبات قيد التنفيذ")} />
            </div>

            {/* صحتي */}
            <Card>
              <CardHeader
                icon={HeartPulse}
                title={t("My Health", "صحتي")}
                actions={<GoldButton size="sm" onClick={() => navigate("/services/health")}>{t("View leaderboard", "عرض لوحة المتصدرين")}</GoldButton>}
              />
              <div className="mt-4 grid grid-cols-2 gap-6 xl:grid-cols-[1fr_1fr_192.25px_1fr]">
                {/* EN home frame draws this whole row 76px tall. */}
                {homeTiles.map((tile, i) => <HealthTileView key={i} tile={tile} className="ltr:h-[76px]" />)}
              </div>
            </Card>

            {/* حالة طلباتي النشطة */}
            <Card>
              <CardHeader
                icon={Wrench}
                title={t("My Active Requests", "حالة طلباتي النشطة")}
                actions={<GoldButton size="sm" onClick={() => navigate("/services/history")}>{t("View Request History", "عرض سجل الطلبات")}</GoldButton>}
              />
              <ScrollTrackList className="mt-2" maxHeight={989}>
                {visible.length === 0 ? (
                  <div className="py-6">
                    <EmptyState icon={TrayIcon} title={t("No active requests", "لا توجد طلبات نشطة")}
                      hint={t("Requests you raise from the catalog appear here.", "الطلبات التي ترفعها من الكتالوج تظهر هنا.")} />
                  </div>
                ) : visible.map((r, i) => (
                  <RequestRow key={r.id} r={r} last={i === visible.length - 1} onHide={() => setHidden((h) => [...h, r.id])} />
                ))}
              </ScrollTrackList>
              {hidden.length > 0 && (
                <button type="button" onClick={() => setHidden([])} className="mt-2 text-[12px] text-primary hover:underline">
                  {t(`Show hidden (${hidden.length})`, `إظهار المخفية (${hidden.length})`)}
                </button>
              )}
            </Card>
          </>
        }
        side={
          <>
            {/* تصفّح الخدمات */}
            <Card className="px-4">
              <CardHeader icon={GridIcon} title={t("Browse services", "تصفّح الخدمات")} />
              <div className="mt-[18px] flex flex-col gap-4">
                {categories.map((c) => (
                  <ServiceTile
                    key={c.id}
                    icon={categoryIcons[c.icon]}
                    title={isAr ? c.nameAr : c.name}
                    description={isAr ? c.descriptionAr : c.description}
                    meta={c.open ? countLabel(c.open) : undefined}
                    actionLabel={t("Open", "فتح")}
                    to={c.to}
                    compactEn
                  />
                ))}
              </div>
            </Card>

            {/* الأصول */}
            <Card>
              <CardHeader icon={Laptop} title={t("Assets", "الأصول")} />
              <ul className="mt-8 flex flex-col gap-4">
                {assets.map((a) => (
                  <li key={a.id} className="flex h-[62px] items-center gap-3 rounded-[10px] border border-[var(--card-ring)] bg-background px-[13px]">
                    <span className="inline-flex size-[34px] shrink-0 items-center justify-center rounded-[8px] bg-soft-accent text-primary">
                      <FolderOpen className="size-4" strokeWidth={1.7} />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-[12.5px] font-medium leading-[13px] text-foreground">{isAr ? a.nameAr : a.name}</span>
                        <span className="shrink-0 text-[11px] leading-[12px] text-muted-foreground" dir="ltr">{a.id}</span>
                      </div>
                      <div className="text-[11px] leading-[12px] text-muted-foreground">{isAr ? a.dateAr : a.date}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </>
        }
      />
    </PageBody>
  )
}

function RequestRow({ r, last, onHide }: { r: ServiceRequest; last: boolean; onHide: () => void }) {
  const { t, isAr, o } = useT()
  const cat = categoryById(r.categoryId)
  const done = isComplete(r)
  return (
    <article className={cn("flex flex-col gap-6 py-[18px]", !last && "border-b border-secondary")}>
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12.5px] leading-[19px] text-muted-foreground" dir="ltr">#{r.id}</span>
            <span className="text-[12.5px] leading-[19px] text-muted-foreground">·</span>
            {cat && <CategoryChip tone={cat.tone}>{isAr ? cat.nameAr : cat.name}</CategoryChip>}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10.8px] leading-[12px] text-muted-foreground">{isAr ? r.dateAr : r.date}</span>
            {done && (
              <button type="button" onClick={onHide}
                className="inline-flex h-7 items-center gap-2 rounded-[8px] border border-secondary px-3 text-[12px] font-semibold text-error hover:bg-error-fill">
                {t("Hide", "إخفاء")}
                <Trash2 className="size-3" />
              </button>
            )}
          </div>
        </div>
        <Link to="/services/history" className="pb-1 pt-2 text-[14.5px] leading-[22px] text-foreground hover:text-primary">
          {isAr ? r.titleAr : r.title}
        </Link>
        <div className="flex items-center gap-2 ps-1 text-[12.5px] leading-[19px] text-muted-foreground">
          <User className="size-3 text-muted-foreground" />
          {isAr ? r.requesterAr : r.requester}
        </div>
      </div>
      <Stepper steps={stepsFor(r).map(o)} current={r.step} tone={done ? "success" : "gold"} wideEnd={r.flow === "hospitality"} />
    </article>
  )
}

/** A list with the design's own 4px scroll track on the inline end (Figma 3039:5171):
 *  Shape/Fill/Secondary track, Shape/Icons thumb, 24px from the content. */
function ScrollTrackList({ children, maxHeight, className }: { children: React.ReactNode; maxHeight: number; className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [thumb, setThumb] = React.useState({ top: 0, size: 1 })
  const sync = React.useCallback(() => {
    const el = ref.current
    if (!el) return
    const size = el.scrollHeight > 0 ? Math.min(1, el.clientHeight / el.scrollHeight) : 1
    const top = el.scrollHeight > el.clientHeight ? (el.scrollTop / el.scrollHeight) : 0
    setThumb({ top, size })
  }, [])
  React.useLayoutEffect(() => {
    sync()
    const el = ref.current
    if (!el || typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    if (el.firstElementChild) ro.observe(el.firstElementChild)
    return () => ro.disconnect()
  }, [sync])
  const scrolls = thumb.size < 1
  return (
    <div className={cn("flex gap-6", className)}>
      <div ref={ref} onScroll={sync} style={{ maxHeight }}
        className="min-w-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div>{children}</div>
      </div>
      {scrolls && (
        <div aria-hidden className="relative w-1 shrink-0 rounded-full bg-secondary">
          <span className="absolute inset-x-0 rounded-full bg-[var(--icon,var(--muted-foreground))]"
            style={{ top: `${thumb.top * 100}%`, height: `${thumb.size * 100}%` }} />
        </div>
      )}
    </div>
  )
}
