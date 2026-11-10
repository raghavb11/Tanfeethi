import { useSearchParams } from "react-router-dom"

import { Card, CardHeader, GroupRow, PageBody, ServiceTile } from "../components/wijha"
import { useT } from "../components/i18n"
import { GridIcon, OctagonAlertIcon } from "../components/kpi-icons"

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
          <CardHeader icon={GridIcon} title={t("Violation Reporting System Request", "طلب نظام الإبلاغ عن المخالفات")} />
          <div className="mt-8 flex flex-col gap-2">
            <GroupRow icon={OctagonAlertIcon} label={t("Reporting Services", "خدمات الإبلاغ")} selected={group === "reporting"}
              onClick={() => setParams({}, { replace: true })} />
            <GroupRow icon={OctagonAlertIcon} label={t("Investigation Services", "خدمات التحقيق")} selected={group === "investigation"}
              onClick={() => setParams({ group: "investigation" }, { replace: true })} />
          </div>
        </Card>

        <Card className="px-4">
          {group === "reporting" ? (
            <>
              <CardHeader icon={GridIcon} title={t("Reporting Services", "خدمات الإبلاغ")} />
              <div className="mt-[18px] grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <ServiceTile icon={OctagonAlertIcon} title={t("Violation Reporting Service", "خدمة الإبلاغ عن المخالفات")}
                  actionLabel={t("Request service", "طلب الخدمة")} to="/services/violations/new" />
                <ServiceTile icon={OctagonAlertIcon} title={t("Track report requests", "متابعة طلبات الإبلاغ")}
                  actionLabel={t("Go", "انتقل")} to="/services/violations/reports" />
              </div>
            </>
          ) : (
            <>
              <CardHeader icon={GridIcon} title={t("Investigation Services", "خدمات التحقيق")} />
              <div className="mt-[18px] grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <ServiceTile icon={OctagonAlertIcon} title={t("Violation Investigation Service", "خدمة التحقيق عن المخالفات")}
                  actionLabel={t("Request service", "طلب الخدمة")} to="/services/violations/queue" />
              </div>
            </>
          )}
        </Card>
      </div>
    </PageBody>
  )
}
