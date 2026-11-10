import { useSearchParams } from "react-router-dom"
import { LayoutGrid, Laptop, Printer } from "lucide-react"

import { Card, CardHeader, GroupRow, PageBody, ServiceTile } from "../components/wijha"
import { useT } from "../components/i18n"
import { serviceItemById, technicalGroups } from "../data/mock/services"

/** IT → "Request a technical service": group list (Figma 3054:6015) and, once a
 *  group is chosen, its services beside it (3054:6317). Route:
 *  /services/catalog/it/technical  (?group=<id> keeps the selection in the URL). */
export default function TechnicalServicesPage() {
  const { t, isAr } = useT()
  const [params, setParams] = useSearchParams()
  const groupId = params.get("group")
  const group = technicalGroups.find((g) => g.id === groupId)

  return (
    <PageBody>
      <div className="grid items-start gap-5 lg:grid-cols-[397px_minmax(0,1fr)]">
        <Card>
          <CardHeader icon={LayoutGrid} title={t("Request an IT service", "طلب خدمة تقنية")} />
          <div className="mt-8 flex flex-col gap-2">
            {technicalGroups.map((g) => (
              <GroupRow
                key={g.id}
                icon={Laptop}
                label={isAr ? g.nameAr : g.name}
                selected={g.id === groupId}
                onClick={() => setParams(g.id === groupId ? {} : { group: g.id }, { replace: true })}
              />
            ))}
          </div>
        </Card>

        {group && (
          <Card className="px-4">
            <CardHeader icon={LayoutGrid} title={isAr ? group.nameAr : group.name} />
            <div className="mt-[18px] grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {group.items.map((id) => {
                const item = serviceItemById(id)
                if (!item) return null
                return (
                  <ServiceTile
                    key={id}
                    icon={id === "printers" ? Printer : Laptop}
                    title={isAr ? item.nameAr : item.name}
                    actionLabel={t("Request the service", "طلب الخدمة")}
                    to={`/services/request/${id}`}
                  />
                )
              })}
            </div>
          </Card>
        )}
      </div>
    </PageBody>
  )
}
