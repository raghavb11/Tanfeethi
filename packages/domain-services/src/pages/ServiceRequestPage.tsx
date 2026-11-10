import * as React from "react"
import { Link, Navigate, useNavigate, useParams } from "react-router-dom"
import { LayoutGrid } from "lucide-react"

import {
  AttachmentsButton, Card, CardHeader, Field, FormActions, PageBody, SelectInput, TextInput, Toast } from "../components/wijha"
import { useT } from "../components/i18n"
import { addRequest, employees, serviceItemById, type FieldDef } from "../data/mock/services"

/** Service request form — Figma 4661:13733 ("Printer services"). The fields come
 *  from the service definition, so every requestable service uses this page.
 *  Route: /services/request/:serviceId */
export default function ServiceRequestPage() {
  const { serviceId = "" } = useParams()
  const navigate = useNavigate()
  const { t, isAr, o } = useT()
  const item = serviceItemById(serviceId)
  const [values, setValues] = React.useState<Record<string, string>>({ requester: employees[0].id })
  const [files, setFiles] = React.useState<File[]>([])
  const [tried, setTried] = React.useState(false)
  const [done, setDone] = React.useState<string | null>(null)

  if (!item) return <Navigate to="/services" replace />

  const missing = item.fields.filter((f) => !values[f.key]?.trim())
  const set = (k: string, v: string) => setValues((s) => ({ ...s, [k]: v }))

  const submit = () => {
    setTried(true)
    if (missing.length) return
    const who = employees.find((e) => e.id === values.requester) ?? employees[0]
    const r = addRequest({
      categoryId: ["salary-cert", "payroll-case"].includes(item.id) ? "hr"
        : item.id === "purchase" ? "finance" : item.id === "badge" ? "facilities" : "it",
      title: item.name, titleAr: item.nameAr, requester: who.name, requesterAr: who.nameAr, flow: "standard",
    })
    setDone(r.id)
    setValues({ requester: employees[0].id }); setFiles([]); setTried(false)
  }

  const control = (f: FieldDef) => {
    const invalid = tried && !values[f.key]?.trim()
    const ring = invalid ? "border-error/70" : undefined
    if (f.kind === "employee") {
      return (
        <SelectInput
          id={f.key} value={values[f.key] ?? ""} onChange={(v) => set(f.key, v)} invalid={invalid}
          placeholder={t("Choose from the list", "أختر من القائمة")}
          prefix={
            <>
              <span className="inline-flex size-[22px] items-center justify-center rounded-full bg-primary/25 text-[8px] font-semibold text-primary">
                {employees.length}
              </span>
              {t("Employee", "الموظف")}
            </>
          }
          options={employees.map((e) => ({ value: e.id, label: isAr ? e.nameAr : e.name }))}
        />
      )
    }
    if (f.kind === "select") {
      return (
        <SelectInput
          id={f.key} value={values[f.key] ?? ""} onChange={(v) => set(f.key, v)} invalid={invalid}
          placeholder={t("Choose from the list", "أختر من القائمة")}
          options={f.options.map((x) => ({ value: x.en, label: o(x) }))}
        />
      )
    }
    return (
      <TextInput id={f.key} value={values[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)}
        placeholder={t("Text", "نص")} className={ring} />
    )
  }

  return (
    <PageBody className="space-y-4">
      {done && (
        <Toast>
          {t(`Request #${done} submitted.`, `تم إرسال الطلب #${done}.`)}
          <Link to="/services/history" className="font-semibold underline underline-offset-2">{t("View request history", "عرض سجل الطلبات")}</Link>
        </Toast>
      )}
      <Card className="px-4">
        <CardHeader icon={LayoutGrid} title={isAr ? item.nameAr : item.name} />
        <div className="mb-6 mt-[18px] flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {item.fields.map((f) => (
              <Field key={f.key} htmlFor={f.key} label={isAr ? f.labelAr : f.label} required>
                {control(f)}
              </Field>
            ))}
          </div>
          <AttachmentsButton files={files} onChange={setFiles} />
          {tried && missing.length > 0 && (
            <p className="text-[12px] text-error" role="alert">
              {t("Fill in the required fields marked *.", "يرجى تعبئة الحقول المطلوبة المعلّمة بـ *.")}
            </p>
          )}
        </div>
        <FormActions onSubmit={submit} onCancel={() => navigate(-1)} />
      </Card>
    </PageBody>
  )
}
