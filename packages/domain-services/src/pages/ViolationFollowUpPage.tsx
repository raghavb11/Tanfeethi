import { Link, useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight, CircleAlert, Inbox } from "lucide-react"

import { Card, CardHeader, DataTable, EmptyState, GoldButton, GoldLink, PageBody } from "../components/wijha"
import { useT } from "../components/i18n"
import { deptById, personById, statusOptions, useReports } from "../data/mock/violations"

/** Follow up on reports.
 *  mode="reporter"     — Figma 4999:18052: my reports; "Add evidence" when asked. Route: /services/violations/reports
 *  mode="investigator" — Figma 4999:19203: the investigation queue, rows open the
 *                        editable detail. Route: /services/violations/queue */
export default function ViolationFollowUpPage({ mode = "reporter" }: { mode?: "reporter" | "investigator" }) {
  const { t, isAr, o } = useT()
  const navigate = useNavigate()
  const all = useReports()
  const rows = mode === "reporter" ? all.filter((r) => r.mine) : all
  const base = mode === "reporter" ? "/services/violations/reports" : "/services/violations/queue"
  const Chevron = isAr ? ChevronLeft : ChevronRight

  return (
    <PageBody>
      <Card>
        <CardHeader icon={CircleAlert} title={t("Follow up on reports", "متابعة طلبات الإبلاغ")} />
        <div className="mt-2">
          {rows.length === 0 ? (
            <div className="pt-4">
              <EmptyState icon={Inbox} title={t("No reports yet", "لا توجد بلاغات بعد")}
                hint={mode === "reporter" ? t("Reports you submit appear here.", "البلاغات التي ترسلها تظهر هنا.") : t("New reports land in this queue.", "تصل البلاغات الجديدة إلى هذه القائمة.")}
                action={mode === "reporter" ? <GoldLink to="/services/violations/new" className="mt-2">{t("Report a violation", "الإبلاغ عن مخالفة")}</GoldLink> : undefined} />
            </div>
          ) : (
            <DataTable head={[
              t("No.", "ترقيم"), t("Report title", "عنوان البلاغ"), t("Report number", "رقم البلاغ"),
              t("Assigned department", "مسند للإدارة"), t("Assigned employee", "مسند للموظف"), t("Status", "الحالة"),
              ...(mode === "investigator" ? [""] : []),
            ]}>
              {rows.map((r, i) => (
                <tr key={r.id}
                  onClick={mode === "investigator" ? () => navigate(`${base}/${r.id}`) : undefined}
                  className={mode === "investigator" ? "cursor-pointer transition-colors hover:bg-secondary/30" : undefined}>
                  <td>{i + 1}</td>
                  <td>
                    <Link to={`${base}/${r.id}`} onClick={(e) => e.stopPropagation()} className="hover:text-primary">{o(r.title)}</Link>
                  </td>
                  <td><span dir="ltr">#{r.id}</span></td>
                  <td>{o(deptById(r.assignedDeptId))}</td>
                  <td>{o(personById(r.assignedToId))}</td>
                  <td>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span>{o(statusOptions[r.status])}</span>
                      {mode === "reporter" && r.status === "needs-evidence" && (
                        <GoldButton className="h-[34px] px-3 text-[13px] font-medium" onClick={() => navigate(`${base}/${r.id}?evidence=1`)}>
                          {t("Add evidence", "إضافة دليل")}
                        </GoldButton>
                      )}
                    </div>
                  </td>
                  {mode === "investigator" && (
                    <td className="w-8 text-end"><Chevron className="inline size-4 text-icon" aria-hidden /></td>
                  )}
                </tr>
              ))}
            </DataTable>
          )}
        </div>
      </Card>
    </PageBody>
  )
}
