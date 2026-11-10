import * as React from "react"
import { useNavigate } from "react-router-dom"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  AlertTriangle, ArrowLeft, Handshake, Heart, Paperclip, Pencil, Plane, Plus,
  ShieldCheck, Trash2, Users,
} from "lucide-react"

import {
  ageOf, type Dependant, RELATION, removeDependant, STATUS, useDependants,
} from "../data/mock/dependants"
import { Chip, Empty, GoldButton, IconBadge, Initials, OutlineButton, Page, SectionCard, Tile } from "../components/wijha"

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
    <Page>
      {/* toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate("/employee")}
          className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />{t("Back to Employee Center", "العودة إلى مركز الموظف")}
        </button>
        <GoldButton onClick={() => navigate("/employee/dependants/new")}>
          <Plus className="size-4" />{t("Add dependant", "إضافة معال")}
        </GoldButton>
      </div>

      <div className="space-y-6">
        {/* the three numbers that matter */}
        <div className="grid gap-6 sm:grid-cols-3">
          <Stat icon={Users} label={t("Registered", "مسجّلون")} value={dependants.length} />
          <Stat icon={ShieldCheck} label={t("Verified", "موثّقون")} value={verified} />
          <Stat icon={Heart} label={t("On medical cover", "على التأمين الطبي")} value={onMedical} />
        </div>

        {pending > 0 && (
          <div className="flex items-start gap-2.5 rounded-xl bg-warning-fill p-4">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
            <p className="text-[13px]">
              {t(`${pending} ${pending === 1 ? "record is" : "records are"} waiting on People & Culture. Cover and partner offers apply only once verified.`,
                 `${pending} من السجلات بانتظار قسم الموظفين والثقافة. لا تسري التغطية وعروض الشركاء إلا بعد التوثيق.`)}
            </p>
          </div>
        )}

        <SectionCard
          icon={Users}
          title={t("My family", "عائلتي")}
          action={<Chip tone="accent">{dependants.length}</Chip>}
        >
          <p className="mb-4 max-w-2xl text-[12.5px] text-muted-foreground">
            {t("The dependants on your HR record. They drive medical cover, ticket entitlement and which partner offers your family can use.",
               "المعالون المسجّلون في ملفك. تعتمد عليهم التغطية الطبية واستحقاق التذاكر وعروض الشركاء المتاحة لعائلتك.")}
          </p>

          {dependants.length === 0 ? (
            <Empty
              icon={Users}
              title={t("No dependants are registered on your record.", "لا يوجد معالون مسجّلون في ملفك.")}
              action={
                <GoldButton className="mt-2" onClick={() => navigate("/employee/dependants/new")}>
                  <Plus className="size-4" />{t("Add your first dependant", "أضف أول معال")}
                </GoldButton>
              }
            />
          ) : (
            <div className="space-y-3">
              {dependants.map((d) => (
                <Tile key={d.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 gap-3">
                      <Initials text={d.initials} tone="accent" className="size-11" />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[14.5px] font-medium">{isAr ? d.nameAr : d.name}</span>
                          <Chip tone={STATUS[d.status].tone}>{isAr ? STATUS[d.status].ar : STATUS[d.status].en}</Chip>
                        </div>
                        <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                          {isAr ? RELATION[d.relation].ar : RELATION[d.relation].en} · {t(`${ageOf(d)} years`, `${ageOf(d)} سنة`)}
                        </p>

                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
                          <span className="tabular-nums" dir="ltr">{d.idNumber}</span>
                          {d.medical && (
                            <span className="inline-flex items-center gap-1"><Heart className="size-3 text-primary" />{t("Medical", "تأمين طبي")}</span>
                          )}
                          {d.tickets && (
                            <span className="inline-flex items-center gap-1"><Plane className="size-3 text-primary" />{t("Tickets", "تذاكر")}</span>
                          )}
                          {d.status === "verified" && (
                            <span className="inline-flex items-center gap-1"><Handshake className="size-3 text-primary" />{t("Partner offers", "عروض الشركاء")}</span>
                          )}
                          {d.document && (
                            <span className="inline-flex items-center gap-1"><Paperclip className="size-3" />{d.document}</span>
                          )}
                        </div>

                        {d.status === "returned" && (isAr ? d.noteAr : d.note) && (
                          <p className="mt-1 text-[12px] font-medium text-error">{isAr ? d.noteAr : d.note}</p>
                        )}
                        {d.status === "pending" && (
                          <p className="mt-1 text-[11.5px] text-muted-foreground">
                            {t(`Submitted ${d.submitted}`, `أُرسل ${d.submittedAr}`)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <OutlineButton size="sm" onClick={() => navigate(`/employee/dependants/${d.id}`)}>
                        <Pencil className="size-3.5" />{t("Edit", "تعديل")}
                      </OutlineButton>
                      <button
                        type="button"
                        aria-label={t("Remove", "إزالة")}
                        onClick={() => setConfirmDelete(confirmDelete === d.id ? null : d.id)}
                        className="grid size-7 place-items-center rounded-lg text-error transition-colors hover:bg-error-fill"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  {confirmDelete === d.id && (
                    <div className="mt-3 rounded-[10px] bg-error-fill p-3">
                      <p className="text-[13px] font-medium">
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
                        <OutlineButton size="sm" onClick={() => setConfirmDelete(null)}>{t("Cancel", "إلغاء")}</OutlineButton>
                        <button
                          type="button"
                          onClick={() => { removeDependant(d.id); setConfirmDelete(null) }}
                          className="inline-flex h-7 items-center rounded-lg bg-error px-3 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
                        >
                          {t("Yes, remove", "نعم، أزل")}
                        </button>
                      </div>
                    </div>
                  )}
                </Tile>
              ))}
            </div>
          )}
        </SectionCard>

        <p className="text-[12px] text-muted-foreground">
          {t("Records are verified by People & Culture against the original document. Anything you change here goes back for verification.",
             "يوثّق قسم الموظفين والثقافة السجلات مقابل المستند الأصلي، وأي تعديل هنا يعود للتوثيق من جديد.")}
        </p>
      </div>
    </Page>
  )
}

function Stat({ icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
  return (
    <div className="panel flex items-center gap-3 rounded-xl px-5 py-4">
      <IconBadge icon={icon} />
      <div>
        <p className="text-[24px] font-semibold leading-none tabular-nums">{value}</p>
        <p className="mt-1 text-[12.5px] text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

export type { Dependant }
