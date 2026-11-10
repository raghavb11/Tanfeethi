import { Navigate, useParams } from "react-router-dom"
import { CirclePlay, Inbox, LayoutGrid } from "lucide-react"

import { Card, CardHeader, EmptyState, KpiTile, PageBody, ServiceTile, SplitLayout } from "../components/wijha"
import { useT } from "../components/i18n"
import { ClipboardClock, serviceIcons } from "../components/icons"
import { catalogKpis, catalogServices, categoryById, formatDuration } from "../data/mock/services"

/** English card titles as drawn in the EN frames (5233:24866, 5233:25971). */
const browseTitleEn: Record<string, string> = { it: "Browse IT & access services", hospitality: "Selected service" }

/** Catalog level 1 — Figma 3039:5370 (IT & Permissions) and 4915:18256 (Hospitality).
 *  Route: /services/catalog/:catalogId */
export default function ServiceCatalogPage({ catalogId: fixed }: { catalogId?: string }) {
  const params = useParams()
  const catalogId = fixed ?? params.catalogId ?? "it"
  const { t, isAr } = useT()
  const cat = categoryById(catalogId)
  if (catalogId === "violations") return <Navigate to="/services/violations" replace />
  if (!cat) return <Navigate to="/services" replace />

  const services = catalogServices[catalogId] ?? []
  const kpi = catalogKpis[catalogId] ?? { open: 0, inProgress: 0, avgMinutes: 0 }
  const name = isAr ? cat.nameAr : cat.name

  return (
    <PageBody>
      <SplitLayout
        sideWidth={250}
        main={
          <Card className="px-4">
            <CardHeader icon={LayoutGrid} title={isAr ? `تصفّح خدمات ${name}` : (browseTitleEn[catalogId] ?? `Browse ${name} services`)} />
            <div className="mt-[18px]">
              {services.length === 0 ? (
                <EmptyState icon={LayoutGrid} title={t("No services in this catalog yet", "لا توجد خدمات في هذا الكتالوج بعد")} />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {services.map((s) => (
                    <ServiceTile
                      key={s.id}
                      icon={serviceIcons[s.icon]}
                      title={isAr ? s.nameAr : s.name}
                      description={isAr ? s.descriptionAr : s.description}
                      actionLabel={s.action === "request" ? t("Request the service", "طلب الخدمة") : t("Open", "فتح")}
                      to={s.to}
                    />
                  ))}
                </div>
              )}
            </div>
          </Card>
        }
        side={
          <>
            <KpiTile icon={Inbox} value={kpi.open} label={t("Open requests", "طلبات مفتوحة")} />
            <KpiTile icon={CirclePlay} value={kpi.inProgress} label={t("Requests in progress", "طلبات قيد التنفيذ")} />
            <KpiTile
              icon={ClipboardClock}
              value={<span className="text-[16px]">{formatDuration(kpi.avgMinutes, isAr)}</span>}
              label={t("Avg. request response time", "متوسط الاستجابة للطلبات")}
            />
          </>
        }
      />
    </PageBody>
  )
}
