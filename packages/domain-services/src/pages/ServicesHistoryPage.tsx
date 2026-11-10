import { Inbox, Wrench } from "lucide-react"
import { cn } from "@reach/shared-core"

import { Card, CardHeader, DataTable, EmptyState, PageBody } from "../components/wijha"
import { useT } from "../components/i18n"
import { categoryById, statusOf, useRequestHistory } from "../data/mock/services"

/** Submitted services log — Figma 4777:25710. Route: /services/history */
export default function ServicesHistoryPage() {
  const { t, isAr, o } = useT()
  const rows = useRequestHistory()

  return (
    <PageBody>
      <Card>
        <CardHeader icon={Wrench} title={t("Submitted Services History", "سجل الخدمات المرفوعة")} />
        <div className="mt-2">
          {rows.length === 0 ? (
            <div className="pt-4">
              <EmptyState icon={Inbox} title={t("No requests yet", "لا توجد طلبات بعد")}
                hint={t("Requests you submit from the service catalog are listed here.", "الطلبات التي ترفعها من كتالوج الخدمات تظهر هنا.")} />
            </div>
          ) : (
            <DataTable cols={["46px", "228px", "228.5px", "228px", "228px", ""]} head={[
              t("No.", "ترقيم"), t("Request Type", "نوع الطلب"), t("From Department", "من قسم"),
              t("Request Date", "تاريخ طلب الخدمة"), t("Request No.", "رقم الطلب"), t("Status", "الحالة"),
            ]}>
              {rows.map((r, i) => {
                const cat = categoryById(r.categoryId)
                const st = statusOf(r)
                return (
                  <tr key={r.id}>
                    <td>{i + 1}</td>
                    <td>{isAr ? r.titleAr : r.title}</td>
                    <td>{cat ? (isAr ? cat.nameAr : cat.name) : "—"}</td>
                    <td><span dir="ltr">{r.iso}</span></td>
                    <td><span dir="ltr">#{r.id}</span></td>
                    <td className={cn(st.tone === "sent" && "text-muted-foreground")}>{o(st)}</td>
                  </tr>
                )
              })}
            </DataTable>
          )}
        </div>
      </Card>
    </PageBody>
  )
}
