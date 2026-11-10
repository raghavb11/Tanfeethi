import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { LayoutGrid, Laptop } from "lucide-react"

import {
  AttachmentsButton, Card, CardHeader, Field, FormActions, GroupRow, PageBody, SelectInput, TextInput, Toast } from "../components/wijha"
import { useT } from "../components/i18n"
import { addRequest, faultOptions } from "../data/mock/services"

/** IT → "Report a fault" — Figma 4851:15277. Route: /services/catalog/it/report-fault */
export default function ReportFaultPage() {
  const { t, o } = useT()
  const navigate = useNavigate()
  const empty = { category: "", sub: "", priority: "", contact: "", description: "" }
  const [v, setV] = React.useState(empty)
  const [files, setFiles] = React.useState<File[]>([])
  const [tried, setTried] = React.useState(false)
  const [done, setDone] = React.useState<string | null>(null)
  const set = (k: keyof typeof empty) => (x: string) => setV((s) => ({ ...s, [k]: x, ...(k === "category" ? { sub: "" } : {}) }))

  const missing = (Object.keys(empty) as (keyof typeof empty)[]).filter((k) => !v[k].trim())
  const bad = (k: keyof typeof empty) => (tried && !v[k].trim() ? "border-error/70" : undefined)
  const opts = (xs: { en: string; ar: string }[]) => xs.map((x) => ({ value: x.en, label: o(x) }))
  const choose = t("Choose from the list", "أختر من القائمة")

  const submit = () => {
    setTried(true)
    if (missing.length) return
    const cat = faultOptions.category.find((c) => c.en === v.category)
    const r = addRequest({
      categoryId: "it", flow: "standard",
      title: `Fault · ${v.category}${v.sub ? ` / ${v.sub}` : ""}`,
      titleAr: `بلاغ عطل · ${cat?.ar ?? v.category}`,
      requester: "Saud Al-Dosari", requesterAr: "سعود الدوسري",
    })
    setDone(r.id); setV(empty); setFiles([]); setTried(false)
  }

  const required = [
    t("Category", "التصنيف"), t("Sub-category", "التصنيف الفرعي"), t("Priority", "الاهمية"),
    t("Contact method", "طريقة التواصل"), t("Description", "الوصف"),
  ]

  return (
    <PageBody className="space-y-4">
      {done && (
        <Toast>
          {t(`Fault report #${done} logged — we'll follow up with you.`, `تم تسجيل البلاغ #${done} — سنتابعه معك.`)}
          <Link to="/services/history" className="font-semibold underline underline-offset-2">{t("View request history", "عرض سجل الطلبات")}</Link>
        </Toast>
      )}
      <div className="grid items-start gap-5 lg:grid-cols-[397px_minmax(0,1fr)]">
        {/* الخدمة التي اخترتها */}
        <Card>
          <CardHeader icon={LayoutGrid} title={t("The service you chose", "الخدمة التي اخترتها")} />
          <div className="mt-4 flex flex-col gap-3 pt-4">
            <GroupRow icon={Laptop} label={t("Report a fault", "الإبلاغ عن عطل")} filled />
            <div className="pt-2 text-[13px] font-semibold text-foreground">{t("Required fields:", "الحقول المطلوبة:")}</div>
            <ul className="list-disc ps-5 text-[11.3px] leading-6 text-foreground">
              {required.map((r) => <li key={r}>{r} <span className="text-error">*</span></li>)}
            </ul>
          </div>
        </Card>

        {/* خدمات الإبلاغ عن عطل */}
        <Card className="px-4">
          <CardHeader icon={LayoutGrid} title={t("Fault reporting services", "خدمات الإبلاغ عن عطل")} />
          <div className="mb-6 mt-[18px] flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("Category", "التصنيف")} required htmlFor="f-cat">
                <SelectInput id="f-cat" value={v.category} onChange={set("category")} placeholder={choose} options={opts(faultOptions.category)} invalid={!!bad("category")} />
              </Field>
              <Field label={t("Sub-category", "التصنيف الفرعي")} required htmlFor="f-sub">
                <SelectInput id="f-sub" value={v.sub} onChange={set("sub")} placeholder={choose} disabled={!v.category}
                  options={opts(faultOptions.subCategory[v.category] ?? [])} invalid={!!bad("sub")} />
              </Field>
              <Field label={t("Priority", "الاهمية")} required htmlFor="f-pri">
                <SelectInput id="f-pri" value={v.priority} onChange={set("priority")} placeholder={choose} options={opts(faultOptions.priority)} invalid={!!bad("priority")} />
              </Field>
              <Field label={t("Contact method", "طريقة التواصل")} hint={t("(to understand the problem)", "( لفهم المشكلة )")} required htmlFor="f-con">
                <SelectInput id="f-con" value={v.contact} onChange={set("contact")} placeholder={choose} options={opts(faultOptions.contact)} invalid={!!bad("contact")} />
              </Field>
            </div>
            <Field label={t("Description", "الوصف")} required htmlFor="f-desc">
              <TextInput id="f-desc" value={v.description} onChange={(e) => set("description")(e.target.value)} placeholder={t("Text", "نص")} className={bad("description")} />
            </Field>
            <AttachmentsButton files={files} onChange={setFiles} />
            {tried && missing.length > 0 && (
              <p className="text-[12px] text-error" role="alert">{t("Fill in the required fields marked *.", "يرجى تعبئة الحقول المطلوبة المعلّمة بـ *.")}</p>
            )}
          </div>
          <FormActions onSubmit={submit} onCancel={() => navigate(-1)} />
        </Card>
      </div>
    </PageBody>
  )
}
