import * as React from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { cn } from "@reach/shared-core"
import { EyeOff } from "lucide-react"

import {
  AttachmentsButton, Card, CardHeader, Checkbox, Field, FormActions, PageBody, SelectInput, TextArea, TextInput, Toast } from "../components/wijha"
import { useT } from "../components/i18n"
import { GridIcon } from "../components/kpi-icons"
import { departments, people, reasons, submitReport, yesNo } from "../data/mock/violations"

/** Report a violation — Figma 4946:15932 (empty) and 5003:19354 (policy accepted).
 *  Adds an "anonymous report" option the design lacks (whistleblower protection).
 *  Route: /services/violations/new (?policy=accepted = the 5003:19354 state) */
export default function ViolationReportFormPage() {
  const { t, o } = useT()
  const navigate = useNavigate()
  const empty = { reason: "", sub: "", accused: "", dept: "", evidence: "", title: "", details: "", manager: "" }
  const [v, setV] = React.useState(empty)
  const [files, setFiles] = React.useState<File[]>([])
  // ?policy=accepted opens the form with the policy box ticked (Figma 5003:19354, for review/capture).
  const [params] = useSearchParams()
  const [policy, setPolicy] = React.useState(params.get("policy") === "accepted")
  const [anonymous, setAnonymous] = React.useState(false)
  const [tried, setTried] = React.useState(false)
  const [done, setDone] = React.useState<string | null>(null)

  const set = (k: keyof typeof empty) => (x: string) => setV((s) => ({ ...s, [k]: x, ...(k === "reason" ? { sub: "" } : {}) }))
  const missing = (Object.keys(empty) as (keyof typeof empty)[]).filter((k) => !v[k].trim())
  const bad = (k: keyof typeof empty) => tried && !v[k].trim()
  const choose = t("Select from the list", "اختر من القائمة")
  const reason = reasons.find((r) => r.id === v.reason)

  const submit = () => {
    setTried(true)
    if (missing.length || !policy) return
    const r = submitReport({
      reasonId: v.reason, subCategory: v.sub, accusedId: v.accused, accusedDeptId: v.dept,
      hasEvidence: v.evidence as "yes" | "no", title: v.title, details: v.details,
      reportedToManager: v.manager as "yes" | "no", anonymous, files,
    })
    setDone(r.id); setV(empty); setFiles([]); setPolicy(false); setAnonymous(false); setTried(false)
  }

  /** Section heading with the top rule (Shape/Stroke/Secondary, 12px above). */
  const section = (text: string) => (
    <div className="border-t border-secondary pt-3 text-[14px] font-semibold leading-[26px] text-foreground">{text}</div>
  )

  return (
    <PageBody className="space-y-4">
      {done && (
        <Toast>
          {t(`Report #${done} submitted. You can follow it up at any time.`, `تم إرسال البلاغ #${done}. يمكنك متابعته في أي وقت.`)}
          <Link to="/services/violations/reports" className="font-semibold underline underline-offset-2">{t("Track report requests", "متابعة طلبات الإبلاغ")}</Link>
        </Toast>
      )}
      <Card className="px-4">
        <CardHeader icon={GridIcon} title={t("Violation Reporting System Service", "خدمة نظام الإبلاغ عن المخالفات")} />
        <div className="mb-6 mt-[18px] flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("Reason for Report", "سبب الإبلاغ")} required htmlFor="v-reason">
              <SelectInput id="v-reason" value={v.reason} onChange={set("reason")} placeholder={choose} invalid={bad("reason")}
                options={reasons.map((r) => ({ value: r.id, label: o(r) }))} />
            </Field>
            <Field label={t("Subcategory", "التصنيف الفرعي")} required htmlFor="v-sub">
              <SelectInput id="v-sub" value={v.sub} onChange={set("sub")} placeholder={choose} disabled={!reason} invalid={bad("sub")}
                options={(reason?.sub ?? []).map((s) => ({ value: s.en, label: o(s) }))} />
            </Field>
          </div>

          {section(t("Who do you believe are the violators?", "من هم في رأيك الأشخاص المخالفين ؟"))}
          {/* Figma centres each field in its row when a neighbour's label wraps (EN). */}
          <div className="grid items-center gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Field label={t("Name", "الاسم")} required htmlFor="v-name">
              <SelectInput id="v-name" value={v.accused} onChange={set("accused")} placeholder={choose} invalid={bad("accused")}
                options={people.map((p) => ({ value: p.id, label: o(p), alt: `${p.en} ${p.ar}` }))} searchable />
            </Field>
            <Field label={t("Department", "الإدارة")} required htmlFor="v-dept">
              <SelectInput id="v-dept" value={v.dept} onChange={set("dept")} placeholder={choose} invalid={bad("dept")}
                options={departments.map((d) => ({ value: d.id, label: o(d), alt: `${d.en} ${d.ar}` }))} searchable />
            </Field>
            <Field label={t("Do you have any evidence or proof you can provide?", "هل لديك أي دليل أو إثبات يمكنك تقديمه")} required htmlFor="v-ev">
              <SelectInput id="v-ev" value={v.evidence} onChange={set("evidence")} placeholder={choose} invalid={bad("evidence")}
                options={yesNo.map((y) => ({ value: y.id, label: o(y) }))} />
            </Field>
            <Field label={t("Report Title", "عنوان البلاغ")} required htmlFor="v-title">
              <TextInput id="v-title" value={v.title} onChange={(e) => set("title")(e.target.value)} placeholder={t("Text", "نص")}
                className={bad("title") ? "border-error/70" : undefined} />
            </Field>
          </div>
          <Field label={t("Report Details", "تفاصيل البلاغ")} hint={t("(how, when and where the violation occurred)", "( كيفية ووقت ومكان المخالفة )")} required htmlFor="v-details">
            <TextArea id="v-details" rows={4} value={v.details} onChange={(e) => set("details")(e.target.value)} placeholder={t("Text", "نص")}
              className={cn("min-h-[104px]", bad("details") && "border-error/70")} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Field label={t("Has the case been reported to the direct manager?", "هل تم الإبلاغ عن الحالة للمدير المباشر")} required htmlFor="v-mgr">
              <SelectInput id="v-mgr" value={v.manager} onChange={set("manager")} placeholder={choose} invalid={bad("manager")}
                options={yesNo.map((y) => ({ value: y.id, label: o(y) }))} />
            </Field>
          </div>

          {section(t("Are there any additional details you would like to add about the report?", "هل يوجد أي تفاصيل إضافية تود/ين إضافتها حول البلاغ ؟"))}
          {/* Attachments, with the anonymous option (whistleblower protection — not in the
              design) at the far end of the same row so the Figma layout is unchanged. */}
          <div className="flex flex-wrap items-center justify-between gap-4 [&>label]:max-h-[34px] [&>label]:leading-[16px]">
            <AttachmentsButton files={files} onChange={setFiles} />
            <Checkbox id="v-anon" checked={anonymous} onChange={setAnonymous}>
              <span className="inline-flex items-center gap-1.5 font-semibold"><EyeOff className="size-3.5 text-primary" />{t("Submit this report anonymously", "تقديم البلاغ دون الكشف عن هويتي")}</span>
              <span className="block text-[11px] leading-[14px] text-muted-foreground">
                {t("Your name is hidden from everyone handling the report, including investigators.", "يُخفى اسمك عن جميع من يتعامل مع البلاغ، بمن فيهم المحققون.")}
              </span>
            </Checkbox>
          </div>

          <div className="border-t border-secondary pt-3.5 text-[13px] leading-[21px] text-foreground">
            {t("To review the policy, please click the following link: ", "لاستعراض السياسة يرجى الضغط على الرابط التالي ")}
            <Link to="/policies" className="font-semibold text-primary underline underline-offset-2">
              {t("Employee Violation Reporting Policy", "سياسة الإبلاغ عن المخالفات للموظفين")}
            </Link>
          </div>
          <div className="pb-2 pt-1">
            <Checkbox id="v-policy" checked={policy} onChange={setPolicy}>
              {t("I have read the Employee Violation Reporting Policy and agree to comply with it.", "لقد اطلعت على سياسة الإبلاغ عن المخالفات للموظفين وأوافق على الالتزام بها.")}
            </Checkbox>
          </div>
          {tried && (missing.length > 0 || !policy) && (
            <p className="text-[12px] text-error" role="alert">
              {missing.length > 0
                ? t("Fill in the required fields marked *.", "يرجى تعبئة الحقول المطلوبة المعلّمة بـ *.")
                : t("Please confirm you have read the policy.", "يرجى تأكيد الاطلاع على السياسة.")}
            </p>
          )}
        </div>
        <FormActions onSubmit={submit} onCancel={() => navigate(-1)} />
      </Card>
    </PageBody>
  )
}
