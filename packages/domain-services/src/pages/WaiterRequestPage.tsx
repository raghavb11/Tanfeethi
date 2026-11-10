import * as React from "react"
import { Link, useNavigate } from "react-router-dom"

import { Card, CardHeader, Field, FormActions, PageBody, SelectInput, Toast } from "../components/wijha"
import { useT } from "../components/i18n"
import { GridIcon } from "../components/kpi-icons"
import { addOrder, floorOf, newOrderId, newOrderRef, nowMin, useLocations } from "../data/mock/cafeteria"

/** Hospitality → Request a waiter — Figma 4915:18193. Calls an attendant to a
 *  floor and place; it lands in the same tea-boy queue as menu orders.
 *  Route: /services/hospitality/waiter */
export default function WaiterRequestPage() {
  const { t, isAr } = useT()
  const navigate = useNavigate()
  const locations = useLocations().filter((l) => l.active)
  const [floor, setFloor] = React.useState("")
  const [place, setPlace] = React.useState("")
  const [tried, setTried] = React.useState(false)
  const [done, setDone] = React.useState<string | null>(null)

  const floors = [...new Map(locations.map((l) => [floorOf(l).id, floorOf(l)])).values()]
  const places = locations.filter((l) => floorOf(l).id === floor)
  const choose = t("Select from the list", "اختر من القائمة")

  const submit = () => {
    setTried(true)
    if (!floor || !place) return
    const ref = newOrderRef()
    addOrder({
      id: newOrderId(), ref, kind: "waiter", lines: [], locationId: place, slotId: "now",
      note: "Waiter requested · طلب النادل", status: "Received",
      by: "Khalid Al-Saadi", byAr: "خالد السعدي", initials: "KS", placed: "Just now", placedAr: "الآن", placedMin: nowMin(),
    })
    setDone(ref); setFloor(""); setPlace(""); setTried(false)
  }

  return (
    <PageBody className="space-y-4">
      {done && (
        <Toast>
          {t(`Waiter requested (${done}) — someone is on the way.`, `تم طلب النادل (${done}) — سيصلك أحد فريق الضيافة.`)}
          <Link to="/cafeteria/orders" className="font-semibold underline underline-offset-2">{t("Track it", "تتبّعه")}</Link>
        </Toast>
      )}
      <Card className="px-4">
        <CardHeader icon={GridIcon} title={t("Waiter Request Service", "خدمة طلب النادل")} />
        <div className="mb-6 mt-[18px] grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Field label={t("Floor", "دور")} required htmlFor="w-floor">
            <SelectInput id="w-floor" value={floor} onChange={(v) => { setFloor(v); setPlace("") }} placeholder={choose}
              invalid={tried && !floor}
              options={floors.map((f) => ({ value: f.id, label: isAr ? f.labelAr : f.label }))} />
          </Field>
          <Field label={t("Address", "عنوان")} required htmlFor="w-place">
            <SelectInput id="w-place" value={place} onChange={setPlace} placeholder={choose} disabled={!floor}
              invalid={tried && !place}
              options={places.map((l) => ({ value: l.id, label: isAr ? l.nameAr : l.name }))} />
          </Field>
        </div>
        {tried && (!floor || !place) && (
          <p className="-mt-3 mb-4 text-[12px] text-error" role="alert">{t("Choose a floor and an address.", "يرجى اختيار الدور والعنوان.")}</p>
        )}
        <FormActions onSubmit={submit} onCancel={() => navigate(-1)} />
      </Card>
    </PageBody>
  )
}
