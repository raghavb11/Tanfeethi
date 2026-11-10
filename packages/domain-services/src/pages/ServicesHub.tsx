import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  CirclePlay, FolderOpen, HeartPulse, Inbox, LayoutGrid, Laptop, Trash2, User, Wrench,
} from "lucide-react"
import { cn } from "@reach/shared-core"

import {
  Card, CardHeader, CategoryChip, EmptyState, GoldButton, KpiTile, PageBody, ServiceTile, SplitLayout, Stepper } from "../components/wijha"
import { useT } from "../components/i18n"
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
    isAr ? (n === 1 ? "1 طلب" : n === 2 ? "طلبين" : `${n} طلبات`) : `${n} request${n === 1 ? "" : "s"}`

  return (
    <PageBody>
      <SplitLayout
        main={
          <>
            {/* KPIs */}
            <div className="grid gap-6 sm:grid-cols-2">
              <KpiTile icon={Inbox} value={serviceKpis.open} label={t("Open requests", "طلبات مفتوحة")} />
              <KpiTile icon={CirclePlay} value={serviceKpis.inProgress} label={t("Requests in progress", "طلبات قيد التنفيذ")} />
            </div>

            {/* صحتي */}
            <Card>
              <CardHeader
                icon={HeartPulse}
                title={t("My health", "صحتي")}
                actions={<GoldButton size="sm" onClick={() => navigate("/services/health")}>{t("View leaderboard", "عرض لوحة المتصدرين")}</GoldButton>}
              />
              <div className="mt-4 grid grid-cols-2 gap-6 xl:grid-cols-[1fr_1fr_1.15fr_1fr]">
                {homeTiles.map((tile, i) => <HealthTileView key={i} tile={tile} />)}
              </div>
            </Card>

            {/* حالة طلباتي النشطة */}
            <Card>
              <CardHeader
                icon={Wrench}
                title={t("Status of my active requests", "حالة طلباتي النشطة")}
                actions={<GoldButton size="sm" onClick={() => navigate("/services/history")}>{t("View request history", "عرض سجل الطلبات")}</GoldButton>}
              />
              <div className="mt-2 max-h-[989px] overflow-y-auto [scrollbar-color:var(--secondary)_transparent] [scrollbar-width:thin]">
                {visible.length === 0 ? (
                  <div className="py-6">
                    <EmptyState icon={Inbox} title={t("No active requests", "لا توجد طلبات نشطة")}
                      hint={t("Requests you raise from the catalog appear here.", "الطلبات التي ترفعها من الكتالوج تظهر هنا.")} />
                  </div>
                ) : visible.map((r, i) => (
                  <RequestRow key={r.id} r={r} last={i === visible.length - 1} onHide={() => setHidden((h) => [...h, r.id])} />
                ))}
              </div>
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
              <CardHeader icon={LayoutGrid} title={t("Browse services", "تصفّح الخدمات")} />
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
                  />
                ))}
              </div>
            </Card>

            {/* الأصول */}
            <Card>
              <CardHeader icon={Laptop} title={t("Assets", "الأصول")} />
              <ul className="mt-[18px] flex flex-col gap-3">
                {assets.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 rounded-[10px] border border-[var(--card-ring)] bg-background px-3 py-3">
                    <span className="inline-flex size-[30px] shrink-0 items-center justify-center rounded-lg bg-soft-accent text-primary">
                      <FolderOpen className="size-[15px]" strokeWidth={1.7} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12.5px] font-medium text-foreground">{isAr ? a.nameAr : a.name}</div>
                      <div className="text-[11px] text-muted-foreground">{isAr ? a.dateAr : a.date}</div>
                    </div>
                    <span className="shrink-0 text-[11px] text-muted-foreground" dir="ltr">{a.id}</span>
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
            <span className="text-[12.5px] text-foreground" dir="ltr">#{r.id}</span>
            <span className="text-[12.5px] text-foreground">·</span>
            {cat && <CategoryChip tone={cat.tone}>{isAr ? cat.nameAr : cat.name}</CategoryChip>}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10.8px] text-foreground">{isAr ? r.dateAr : r.date}</span>
            {done && (
              <button type="button" onClick={onHide}
                className="inline-flex h-7 items-center gap-2 rounded-lg border border-secondary px-3 text-[12px] font-semibold text-error hover:bg-error-fill">
                <Trash2 className="size-2.5" />
                {t("Hide", "إخفاء")}
              </button>
            )}
          </div>
        </div>
        <Link to="/services/history" className="pb-1 pt-2 text-[14.5px] leading-[21.75px] text-foreground hover:text-primary">
          {isAr ? r.titleAr : r.title}
        </Link>
        <div className="flex items-center gap-2 ps-1 text-[12.5px] text-foreground">
          <User className="size-3 text-foreground" />
          {isAr ? r.requesterAr : r.requester}
        </div>
      </div>
      <Stepper steps={stepsFor(r).map(o)} current={r.step} tone={done ? "success" : "gold"} />
    </article>
  )
}
