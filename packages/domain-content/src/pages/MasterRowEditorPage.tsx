import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button, Card, Input, Textarea } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import { ArrowLeft, Check, Lock } from "lucide-react"

import {
  addMasterRow, getMasterRow, MASTER_LISTS, type MasterListId, type MasterRow,
  rowsIn, SCOPES, slugify, TONE_CHIP, TONE_DOT, TONES, type Tone, updateMasterRow,
} from "../data/master-data"

/** Add or edit one row of a master list. A full routed page, not a dialog.
 *  The shared fields are the same everywhere; each list adds its own few. */
export default function MasterRowEditorPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const { list: listParam, id } = useParams()

  const list: MasterListId = MASTER_LISTS.some((l) => l.id === listParam)
    ? (listParam as MasterListId)
    : "holiday-types"
  const meta = MASTER_LISTS.find((l) => l.id === list)!
  const existing = id ? getMasterRow(list, id) : undefined
  const editing = !!existing

  const back = `/config/master-data?list=${list}`

  // shared
  const [name, setName] = React.useState(existing?.name ?? "")
  const [nameAr, setNameAr] = React.useState(existing?.nameAr ?? "")
  const [tone, setTone] = React.useState<Tone>(existing?.tone ?? "sky")
  const [description, setDescription] = React.useState(existing?.description ?? "")
  const [active, setActive] = React.useState(existing?.active ?? true)

  // leave types
  const [code, setCode] = React.useState(existing?.code ?? "")
  const [daysPerYear, setDaysPerYear] = React.useState(String(existing?.daysPerYear ?? 0))
  const [paid, setPaid] = React.useState(existing?.paid ?? true)
  const [needsDocument, setNeedsDocument] = React.useState(existing?.needsDocument ?? false)
  const [carryForward, setCarryForward] = React.useState(String(existing?.carryForward ?? 0))

  // request categories
  const [routeTo, setRouteTo] = React.useState(existing?.routeTo ?? "")
  const [routeToAr, setRouteToAr] = React.useState(existing?.routeToAr ?? "")
  const [slaDays, setSlaDays] = React.useState(String(existing?.slaDays ?? 3))
  const [needsApproval, setNeedsApproval] = React.useState(existing?.needsApproval ?? false)

  // priorities
  const nextRank = rowsIn("priorities").length + 1
  const [rank, setRank] = React.useState(String(existing?.rank ?? nextRank))
  const [responseHours, setResponseHours] = React.useState(String(existing?.responseHours ?? 24))

  // document tags
  const [scope, setScope] = React.useState<NonNullable<MasterRow["scope"]>>(existing?.scope ?? "all")

  const proposedId = editing ? existing.id : slugify(name)
  const clash = !editing && rowsIn(list).some((r) => r.id === proposedId)
  const num = (v: string) => Math.max(0, Math.round(Number(v) || 0))
  const canSave = name.trim() !== "" && !clash
    && (list !== "request-categories" || routeTo.trim() !== "")

  const save = () => {
    if (!canSave) return
    const base: Partial<MasterRow> = {
      name: name.trim(),
      nameAr: nameAr.trim() || name.trim(),
      tone,
      description: description.trim() || undefined,
      descriptionAr: description.trim() || undefined,
      active,
    }
    const extra: Partial<MasterRow> =
      list === "leave-types"
        ? { code: code.trim().toUpperCase() || undefined, daysPerYear: num(daysPerYear), paid, needsDocument, carryForward: num(carryForward) }
      : list === "request-categories"
        ? { routeTo: routeTo.trim(), routeToAr: routeToAr.trim() || routeTo.trim(), slaDays: num(slaDays), needsApproval }
      : list === "priorities"
        ? { rank: num(rank) || 1, responseHours: num(responseHours) }
      : list === "document-tags"
        ? { scope }
        : {}

    if (editing) updateMasterRow(list, existing.id, { ...base, ...extra })
    else addMasterRow({ id: proposedId, list, ...base, ...extra } as MasterRow)
    navigate(back)
  }

  const label = (s: string) => (
    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{s}</label>
  )

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate(back)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />{t("Back to master data", "العودة إلى البيانات الرئيسية")}
        </button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(back)}>{t("Cancel", "إلغاء")}</Button>
          <Button disabled={!canSave} onClick={save}>
            <Check className="size-4" />
            {editing ? t("Save changes", "حفظ التغييرات") : t("Add", "إضافة")}
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          {editing
            ? t(`Edit ${meta.singular}`, `تعديل ${meta.singularAr}`)
            : t(`New ${meta.singular}`, `${meta.singularAr} جديد`)}
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">{isAr ? meta.descAr : meta.desc}</p>
      </div>

      <Card className="p-5">
        <div className="space-y-5">
          <div>
            {label(t("Name", "الاسم"))}
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            {label(t("Name in Arabic", "الاسم بالعربية"))}
            <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} dir="rtl"
                   placeholder={t("Optional — falls back to the English name", "اختياري — يُستخدم الاسم الإنجليزي إن تُرك فارغًا")} />
          </div>

          <div>
            {label(t("Reference", "المعرّف"))}
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-muted px-2 py-1 font-mono text-[12.5px]">{proposedId || "—"}</span>
              {editing && (
                <span className="inline-flex items-center gap-1 text-[11.5px] text-muted-foreground">
                  <Lock className="size-3" />{t("Fixed once created", "ثابت بعد الإنشاء")}
                </span>
              )}
            </div>
            {clash && (
              <p className="mt-1.5 text-[12px] font-medium text-rose-500">
                {t("A value with that reference already exists in this list.", "توجد قيمة بهذا المعرّف في هذه القائمة.")}
              </p>
            )}
          </div>

          {/* ── per-list fields ── */}
          {list === "leave-types" && (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  {label(t("Payroll code", "رمز الرواتب"))}
                  <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="AL" className="uppercase" />
                </div>
                <div>
                  {label(t("Days a year", "الأيام سنويًا"))}
                  <Input type="number" min={0} max={365} value={daysPerYear}
                         onChange={(e) => setDaysPerYear(e.target.value)} />
                </div>
                <div>
                  {label(t("Carried forward", "المُرحَّل"))}
                  <Input type="number" min={0} max={365} value={carryForward}
                         onChange={(e) => setCarryForward(e.target.value)} />
                </div>
              </div>
              <p className="-mt-2 text-[11px] text-muted-foreground/75">
                {t("Zero days a year means there is no fixed entitlement — unpaid or case by case.",
                   "صفر يوم سنويًا يعني عدم وجود رصيد ثابت — بدون أجر أو حسب الحالة.")}
              </p>
              <Toggle checked={paid} onChange={setPaid}
                      title={t("Paid leave", "إجازة مدفوعة")}
                      body={t("Salary continues for the days taken.", "يستمر الراتب خلال أيام الإجازة.")} />
              <Toggle checked={needsDocument} onChange={setNeedsDocument}
                      title={t("Requires a supporting document", "يتطلب مستندًا داعمًا")}
                      body={t("A medical report, a Hajj permit, a marriage contract.", "تقرير طبي أو تصريح حج أو عقد زواج.")} />
            </>
          )}

          {list === "request-categories" && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  {label(t("Routes to", "يُوجَّه إلى"))}
                  <Input value={routeTo} onChange={(e) => setRouteTo(e.target.value)}
                         placeholder={t("IT & Security", "تقنية المعلومات والأمن")} />
                </div>
                <div>
                  {label(t("Routes to (Arabic)", "الجهة بالعربية"))}
                  <Input value={routeToAr} onChange={(e) => setRouteToAr(e.target.value)} dir="rtl"
                         placeholder={t("Optional", "اختياري")} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  {label(t("Close within (working days)", "الإغلاق خلال (أيام عمل)"))}
                  <Input type="number" min={0} max={90} value={slaDays} onChange={(e) => setSlaDays(e.target.value)} />
                </div>
              </div>
              <Toggle checked={needsApproval} onChange={setNeedsApproval}
                      title={t("Needs manager approval first", "يحتاج اعتماد المدير أولًا")}
                      body={t("The request waits on the line manager before the team sees it.",
                              "ينتظر الطلب اعتماد المدير المباشر قبل وصوله للفريق.")} />
            </>
          )}

          {list === "priorities" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                {label(t("Rank", "الترتيب"))}
                <Input type="number" min={1} max={20} value={rank} onChange={(e) => setRank(e.target.value)} />
                <p className="mt-1.5 text-[11px] text-muted-foreground/75">
                  {t("1 is the most urgent; the list sorts by this.", "1 هي الأكثر إلحاحًا، وتُرتَّب القائمة عليها.")}
                </p>
              </div>
              <div>
                {label(t("Respond within (hours)", "الاستجابة خلال (ساعات)"))}
                <Input type="number" min={0} max={720} value={responseHours}
                       onChange={(e) => setResponseHours(e.target.value)} />
              </div>
            </div>
          )}

          {list === "document-tags" && (
            <div>
              {label(t("Visible to", "الظهور لـ"))}
              <div className="flex flex-wrap gap-1.5">
                {SCOPES.map((s) => (
                  <button
                    key={s.id} type="button" onClick={() => setScope(s.id)}
                    className={cn("rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                      scope === s.id ? "border-primary/40 bg-primary/12 text-primary"
                                     : "border-border text-muted-foreground hover:bg-muted/40")}
                  >
                    {isAr ? s.ar : s.en}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground/75">
                {t("Named roles only hides a document from everyone the folder does not list.",
                   "«أدوار محددة فقط» تُخفي المستند عن كل من لا يذكره المجلد.")}
              </p>
            </div>
          )}

          <div>
            {label(t("Colour", "اللون"))}
            <div className="flex flex-wrap gap-1.5">
              {TONES.map((tn) => (
                <button
                  key={tn} type="button" onClick={() => setTone(tn)}
                  aria-label={tn} aria-pressed={tone === tn}
                  className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-medium capitalize transition-colors",
                    tone === tn ? "border-primary/50 ring-1 ring-primary/30" : "border-border",
                    TONE_CHIP[tn])}
                >
                  <span className={cn("size-1.5 rounded-full", TONE_DOT[tn])} />{tn}
                </button>
              ))}
            </div>
          </div>

          <div>
            {label(t("Description", "الوصف"))}
            <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)}
                      placeholder={t("What belongs under this value.", "ما الذي يندرج تحت هذه القيمة.")} />
          </div>

          <Toggle checked={active} onChange={setActive}
                  title={t("Offered for new records", "متاح للسجلات الجديدة")}
                  body={t("Turn this off to retire a value without touching the records already using it.",
                          "أوقفه لسحب القيمة من الاستخدام دون المساس بالسجلات التي تستخدمها.")} />
        </div>
      </Card>
    </main>
  )
}

function Toggle({ checked, onChange, title, body }: {
  checked: boolean; onChange: (v: boolean) => void; title: string; body: string
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-border/70 p-3">
      <input
        type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 accent-[var(--primary)]"
      />
      <span className="min-w-0">
        <span className="block text-[12.5px] font-medium">{title}</span>
        <span className="block text-[11.5px] text-muted-foreground">{body}</span>
      </span>
    </label>
  )
}
