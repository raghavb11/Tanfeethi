import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button, Card, Input } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import { AlertTriangle, ArrowLeft, Check, FileUp, Info, Paperclip } from "lucide-react"

import {
  addDependant, type Dependant, getDependant, initialsOf, newDependantId,
  RELATION, type RelationId, updateDependant,
} from "../data/mock/dependants"

const RELATIONS: RelationId[] = ["spouse", "son", "daughter", "father", "mother"]

/** Add or edit a dependant. A full routed page, not a dialog. The relation is
 *  picked first because it decides the document and the default cover. */
export default function DependantEditorPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const { id } = useParams()

  const existing = id ? getDependant(id) : undefined
  const editing = !!existing
  const back = "/employee/dependants"

  const [relation, setRelation] = React.useState<RelationId | null>(existing?.relation ?? null)
  const [name, setName] = React.useState(existing?.name ?? "")
  const [nameAr, setNameAr] = React.useState(existing?.nameAr ?? "")
  const [dobISO, setDobISO] = React.useState(existing?.dobISO ?? "")
  const [idNumber, setIdNumber] = React.useState(existing?.idNumber ?? "")
  const [medical, setMedical] = React.useState(existing?.medical ?? false)
  const [tickets, setTickets] = React.useState(existing?.tickets ?? false)
  const [document, setDocument] = React.useState(existing?.document ?? "")
  const [confirming, setConfirming] = React.useState(false)
  const fileRef = React.useRef<HTMLInputElement>(null)

  // the relation sets the sensible defaults the first time it is chosen
  const pickRelation = (r: RelationId) => {
    setRelation(r)
    if (!editing) {
      setMedical(RELATION[r].medicalByDefault)
      setTickets(RELATION[r].medicalByDefault)
    }
  }

  const canSubmit =
    !!relation && name.trim() !== "" && dobISO !== "" && idNumber.trim() !== "" && document !== ""

  const save = () => {
    if (!canSubmit || !relation) return
    const fields = {
      name: name.trim(),
      nameAr: nameAr.trim() || name.trim(),
      relation, dobISO,
      idNumber: idNumber.trim(),
      initials: initialsOf(name),
      medical, tickets,
      document,
      // any change goes back through verification, since cover depends on it
      status: "pending" as const,
      note: undefined, noteAr: undefined,
      submitted: "Just now", submittedAr: "الآن",
    }
    if (editing) updateDependant(existing.id, fields)
    else addDependant({ id: newDependantId(), ...fields } as Dependant)
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
          <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />{t("Back to my family", "العودة إلى عائلتي")}
        </button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(back)}>{t("Cancel", "إلغاء")}</Button>
          <Button disabled={!canSubmit} onClick={() => setConfirming(true)}>
            <Check className="size-4" />
            {editing ? t("Resubmit", "إعادة الإرسال") : t("Submit for verification", "إرسال للتوثيق")}
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          {editing ? t("Edit dependant", "تعديل بيانات المعال") : t("Add a dependant", "إضافة معال")}
        </h1>
        <p className="mt-1 max-w-2xl text-[13px] text-muted-foreground">
          {t("People & Culture verify the document before the record affects medical cover, tickets or partner offers.",
             "يتحقق قسم الموظفين والثقافة من المستند قبل أن يؤثر السجل على التأمين الطبي أو التذاكر أو عروض الشركاء.")}
        </p>
      </div>

      <Card className="p-5">
        <div className="space-y-5">
          {/* the relation comes first — it decides the rest */}
          <div>
            {label(t("Relation", "صلة القرابة"))}
            <div className="flex flex-wrap gap-1.5">
              {RELATIONS.map((r) => (
                <button
                  key={r} type="button" onClick={() => pickRelation(r)}
                  aria-pressed={relation === r}
                  className={cn("rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                    relation === r ? "border-primary/40 bg-primary/12 text-primary"
                                   : "border-border text-muted-foreground hover:bg-muted/40")}
                >
                  {isAr ? RELATION[r].ar : RELATION[r].en}
                </button>
              ))}
            </div>
          </div>

          {!relation ? (
            <p className="rounded-xl border border-dashed border-border/70 px-4 py-8 text-center text-[12.5px] text-muted-foreground">
              {t("Choose the relation to continue — it sets which document is needed.",
                 "اختر صلة القرابة للمتابعة — فهي تحدد المستند المطلوب.")}
            </p>
          ) : (
            <>
              {/* what this relation needs */}
              <div className="flex items-start gap-2.5 rounded-xl border border-primary/25 bg-primary/[0.05] p-3">
                <Info className="mt-0.5 size-4 shrink-0 text-primary" />
                <p className="text-[12px] leading-relaxed">
                  {t(`For a ${RELATION[relation].en.toLowerCase()}, People & Culture need the ${RELATION[relation].document.toLowerCase()}.`,
                     `لإضافة ${RELATION[relation].ar}، يلزم ${RELATION[relation].documentAr}.`)}
                  {!RELATION[relation].medicalByDefault && (
                    <>
                      {" "}
                      {t("Parents are not covered by the company medical plan by default; HR will confirm whether cover can be extended.",
                         "الوالدان غير مشمولين بالتأمين الطبي افتراضيًا، وستؤكد الموارد البشرية إمكانية التمديد.")}
                    </>
                  )}
                </p>
              </div>

              <div>
                {label(t("Full name", "الاسم الكامل"))}
                <Input value={name} onChange={(e) => setName(e.target.value)}
                       placeholder={t("As it appears on the ID", "كما يظهر في الهوية")} />
              </div>

              <div>
                {label(t("Full name in Arabic", "الاسم بالعربية"))}
                <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} dir="rtl"
                       placeholder={t("Optional — falls back to the English name", "اختياري — يُستخدم الاسم الإنجليزي إن تُرك فارغًا")} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  {label(t("Date of birth", "تاريخ الميلاد"))}
                  <Input type="date" value={dobISO} max={new Date().toISOString().slice(0, 10)}
                         onChange={(e) => setDobISO(e.target.value)} />
                </div>
                <div>
                  {label(t("National ID / Iqama", "رقم الهوية / الإقامة"))}
                  <Input value={idNumber} onChange={(e) => setIdNumber(e.target.value)}
                         inputMode="numeric" placeholder="1XXXXXXXXX" />
                </div>
              </div>

              {/* the document */}
              <div>
                {label(t("Supporting document", "المستند الداعم"))}
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                    <FileUp className="size-3.5" />
                    {document ? t("Replace file", "استبدال الملف") : t("Choose file", "اختيار ملف")}
                  </Button>
                  <input
                    ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) setDocument(f.name) }}
                  />
                  {document && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-muted/25 px-2.5 py-1 text-[12px]">
                      <Paperclip className="size-3.5 text-muted-foreground" />{document}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-[11px] text-muted-foreground/75">
                  {t(`${RELATION[relation].document} · PDF or photo, up to 10 MB.`,
                     `${RELATION[relation].documentAr} · PDF أو صورة، حتى ١٠ ميجابايت.`)}
                </p>
              </div>

              {/* what the record should entitle them to */}
              <div className="space-y-2">
                {label(t("Request cover for", "طلب التغطية لـ"))}
                <Toggle
                  checked={medical} onChange={setMedical}
                  title={t("Company medical insurance", "التأمين الطبي")}
                  body={t("Adds them to the Bupa policy once verified, subject to the plan rules.",
                          "يُضاف إلى وثيقة بوبا بعد التوثيق وفق شروط الخطة.")}
                />
                <Toggle
                  checked={tickets} onChange={setTickets}
                  title={t("Annual ticket entitlement", "استحقاق التذاكر السنوية")}
                  body={t("Counts towards the family tickets in your grade.", "يُحتسب ضمن تذاكر العائلة حسب درجتك الوظيفية.")}
                />
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-border/70 p-3">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
                <p className="text-[11.5px] leading-relaxed text-muted-foreground">
                  {t("Submitting a false or altered document is a disciplinary matter. The record stays pending until People & Culture verify it against the original.",
                     "تقديم مستند غير صحيح أو معدّل يُعد مخالفة. يبقى السجل معلّقًا حتى يتحقق قسم الموظفين والثقافة من الأصل.")}
                </p>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* nothing is filed until this is confirmed */}
      {confirming && relation && (
        <Card className="mt-4 border-primary/30 bg-primary/[0.04] p-4">
          <p className="text-[13px] font-semibold">
            {editing
              ? t(`Resubmit ${name.trim()} for verification?`, `إعادة إرسال ${name.trim()} للتوثيق؟`)
              : t(`Submit ${name.trim()} as your ${RELATION[relation].en.toLowerCase()}?`,
                  `إرسال ${name.trim()} بصفته ${RELATION[relation].ar}؟`)}
          </p>
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            {t("People & Culture check the document against the original. Medical cover and tickets change only after they verify it.",
               "يتحقق قسم الموظفين والثقافة من المستند مقابل الأصل، ولا تتغير التغطية أو التذاكر إلا بعد التوثيق.")}
          </p>
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setConfirming(false)}>{t("Cancel", "إلغاء")}</Button>
            <Button size="sm" onClick={save}>
              <Check className="size-3.5" />{t("Yes, submit", "نعم، أرسل")}
            </Button>
          </div>
        </Card>
      )}
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
