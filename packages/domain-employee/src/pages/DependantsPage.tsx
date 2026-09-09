import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Badge, Button, Card } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  AlertTriangle, ArrowLeft, Handshake, Heart, Paperclip, Pencil, Plane, Plus,
  Trash2, Users,
} from "lucide-react"

import {
  ageOf, type Dependant, RELATION, removeDependant, STATUS, useDependants,
} from "../data/mock/dependants"

/** My family — the dependants on the employee's record, and the way to add one. */
export default function DependantsPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()

  const dependants = useDependants()
  const [confirmDelete, setConfirmDelete] = React.useState<string | null>(null)

  const verified = dependants.filter((d) => d.status === "verified").length
  const pending = dependants.filter((d) => d.status === "pending").length
  const onMedical = dependants.filter((d) => d.medical && d.status === "verified").length

  return (
    <div className="mx-auto max-w-[1100px] space-y-5 px-4 py-7 md:px-8">
      <button
        onClick={() => navigate("/employee")}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />{t("Back to Employee Center", "العودة إلى مركز الموظف")}
      </button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 text-primary">
            <Users className="size-5" />
            <span className="text-xs font-semibold uppercase tracking-[0.14em]">{t("Employee Center", "مركز الموظف")}</span>
          </div>
          <h1 className="text-[22px] font-bold tracking-tight md:text-[26px]">{t("My family", "عائلتي")}</h1>
          <p className="max-w-2xl text-[13px] text-muted-foreground">
            {t("The dependants on your HR record. They drive medical cover, ticket entitlement and which partner offers your family can use.",
               "المعالون المسجّلون في ملفك. تعتمد عليهم التغطية الطبية واستحقاق التذاكر وعروض الشركاء المتاحة لعائلتك.")}
          </p>
        </div>
        <Button className="shrink-0" onClick={() => navigate("/employee/dependants/new")}>
          <Plus className="size-4" />{t("Add dependant", "إضافة معال")}
        </Button>
      </div>

      {/* the three numbers that matter */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label={t("Registered", "مسجّلون")} value={String(dependants.length)} />
        <Stat label={t("Verified", "موثّقون")} value={String(verified)} />
        <Stat label={t("On medical cover", "على التأمين الطبي")} value={String(onMedical)} />
      </div>

      {pending > 0 && (
        <Card className="flex items-start gap-2.5 border-amber-500/30 bg-amber-500/[0.06] p-3.5">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
          <p className="text-[12.5px]">
            {t(`${pending} ${pending === 1 ? "record is" : "records are"} waiting on People & Culture. Cover and partner offers apply only once verified.`,
               `${pending} من السجلات بانتظار قسم الموظفين والثقافة. لا تسري التغطية وعروض الشركاء إلا بعد التوثيق.`)}
          </p>
        </Card>
      )}

      <Card className="overflow-hidden p-0">
        <div className="divide-y divide-border/40">
          {dependants.map((d) => (
            <div key={d.id} className="px-4 py-3.5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/12 text-[13px] font-bold text-primary">
                    {d.initials}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[13.5px] font-semibold">{isAr ? d.nameAr : d.name}</span>
                      <span className="text-[11.5px] text-muted-foreground">
                        {isAr ? RELATION[d.relation].ar : RELATION[d.relation].en} · {t(`${ageOf(d)} years`, `${ageOf(d)} سنة`)}
                      </span>
                      <Badge variant="outline" className={cn("text-[10px]", STATUS[d.status].chip)}>
                        {isAr ? STATUS[d.status].ar : STATUS[d.status].en}
                      </Badge>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-muted-foreground/80">
                      <span className="tabular-nums">{d.idNumber}</span>
                      {d.medical && (
                        <span className="inline-flex items-center gap-1"><Heart className="size-3" />{t("Medical", "تأمين طبي")}</span>
                      )}
                      {d.tickets && (
                        <span className="inline-flex items-center gap-1"><Plane className="size-3" />{t("Tickets", "تذاكر")}</span>
                      )}
                      {d.status === "verified" && (
                        <span className="inline-flex items-center gap-1"><Handshake className="size-3" />{t("Partner offers", "عروض الشركاء")}</span>
                      )}
                      {d.document && (
                        <span className="inline-flex items-center gap-1"><Paperclip className="size-3" />{d.document}</span>
                      )}
                    </div>

                    {d.status === "returned" && (isAr ? d.noteAr : d.note) && (
                      <p className="mt-1 text-[11.5px] font-medium text-rose-500">{isAr ? d.noteAr : d.note}</p>
                    )}
                    {d.status === "pending" && (
                      <p className="mt-1 text-[11px] text-muted-foreground/70">
                        {t(`Submitted ${d.submitted}`, `أُرسل ${d.submittedAr}`)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/employee/dependants/${d.id}`)}>
                    <Pencil className="size-3.5" />{t("Edit", "تعديل")}
                  </Button>
                  <Button
                    variant="ghost" size="sm" aria-label={t("Remove", "إزالة")}
                    onClick={() => setConfirmDelete(confirmDelete === d.id ? null : d.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>

              {confirmDelete === d.id && (
                <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/[0.05] p-3">
                  <p className="text-[12.5px] font-semibold">
                    {t(`Remove ${d.name} from your record?`, `إزالة ${d.nameAr} من ملفك؟`)}
                  </p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">
                    {d.medical
                      ? t("They come off the medical policy and can no longer be named on a partner voucher. People & Culture are notified.",
                          "سيُرفع من وثيقة التأمين ولن يمكن إدراجه في قسائم الشركاء، وسيتم إشعار الموظفين والثقافة.")
                      : t("They can no longer be named on a partner voucher. People & Culture are notified.",
                          "لن يمكن إدراجه في قسائم الشركاء، وسيتم إشعار الموظفين والثقافة.")}
                  </p>
                  <div className="mt-2 flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setConfirmDelete(null)}>{t("Cancel", "إلغاء")}</Button>
                    <Button size="sm" onClick={() => { removeDependant(d.id); setConfirmDelete(null) }}>
                      {t("Yes, remove", "نعم، أزل")}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {dependants.length === 0 && (
            <div className="px-4 py-14 text-center">
              <Users className="mx-auto size-8 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">
                {t("No dependants are registered on your record.", "لا يوجد معالون مسجّلون في ملفك.")}
              </p>
              <Button className="mt-4" onClick={() => navigate("/employee/dependants/new")}>
                <Plus className="size-4" />{t("Add your first dependant", "أضف أول معال")}
              </Button>
            </div>
          )}
        </div>
      </Card>

      <p className="text-[11.5px] text-muted-foreground/75">
        {t("Records are verified by People & Culture against the original document. Anything you change here goes back for verification.",
           "يوثّق قسم الموظفين والثقافة السجلات مقابل المستند الأصلي، وأي تعديل هنا يعود للتوثيق من جديد.")}
      </p>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="font-heading text-2xl font-bold tabular-nums">{value}</p>
      <p className="mt-0.5 text-[11.5px] text-muted-foreground">{label}</p>
    </Card>
  )
}

export type { Dependant }
