import { useSearchParams } from "react-router-dom"
import { CircleAlert, LayoutGrid } from "lucide-react"

import { Card, CardHeader, GroupRow, PageBody, ServiceTile } from "../components/wijha"
import { useT } from "../components/i18n"

/** Violation reporting system hub — Figma 4999:17400 (reporting services) and
 *  4999:17869 (investigation services). Route: /services/violations
 *  (?group=investigation selects the investigator side). The design titled the
 *  investigation state "Hospitality" by mistake; the page keeps one title. */
export default function ViolationsHubPage() {
  const { t } = useT()
  const [params, setParams] = useSearchParams()
  const group = params.get("group") === "investigation" ? "investigation" : "reporting"

  return (
    <PageBody>
      <div className="grid items-start gap-5 lg:grid-cols-[397px_minmax(0,1fr)]">
        <Card>
          <CardHeader icon={LayoutGrid} title={t("Violation reporting system request", "طلب نظام الإبلاغ عن المخالفات")} />
          <div className="mt-8 flex flex-col gap-2">
            <GroupRow icon={CircleAlert} label={t("Reporting services", "خدمات الإبلاغ")} selected={group === "reporting"}
              onClick={() => setParams({}, { replace: true })} />
            <GroupRow icon={CircleAlert} label={t("Investigation services", "خدمات التحقيق")} selected={group === "investigation"}
              onClick={() => setParams({ group: "investigation" }, { replace: true })} />
          </div>
        </Card>

        <Card className="px-4">
          {group === "reporting" ? (
            <>
              <CardHeader icon={LayoutGrid} title={t("Reporting services", "خدمات الإبلاغ")} />
              <div className="mt-[18px] grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <ServiceTile icon={CircleAlert} title={t("Violation reporting service", "خدمة الإبلاغ عن المخالفات")}
                  actionLabel={t("Request the service", "طلب الخدمة")} to="/services/violations/new" />
                <ServiceTile icon={CircleAlert} title={t("Follow up on reports", "متابعة طلبات الإبلاغ")}
                  actionLabel={t("Go", "إنتقل")} to="/services/violations/reports" />
              </div>
            </>
          ) : (
            <>
              <CardHeader icon={LayoutGrid} title={t("Investigation services", "خدمات التحقيق")} />
              <div className="mt-[18px] grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <ServiceTile icon={CircleAlert} title={t("Violation investigation service", "خدمة التحقيق عن المخالفات")}
                  actionLabel={t("Request the service", "طلب الخدمة")} to="/services/violations/queue" />
              </div>
            </>
          )}
        </Card>
      </div>
    </PageBody>
  )
}
