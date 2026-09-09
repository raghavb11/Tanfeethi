import * as React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Badge, Button, Card } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  ArrowLeft, CalendarDays, Clock, FileText, Lock, Pencil, Plane, Plus, Power,
  Tags, Ticket, Trash2,
} from "lucide-react"

import { useHolidays } from "../data/holidays"
import {
  MASTER_LISTS, type MasterListId, type MasterRow, removeMasterRow, rowsIn,
  SCOPES, TONE_DOT, updateMasterRow, useMasterRows,
} from "../data/master-data"

const ICON: Record<MasterListId, typeof Tags> = {
  "holiday-types": CalendarDays,
  "leave-types": Plane,
  "request-categories": Ticket,
  priorities: Clock,
  "document-tags": FileText,
}

/** Master data — every configurable list in one place. */
export default function MasterDataPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  useMasterRows() // re-render on any change
  const holidays = useHolidays()

  const raw = params.get("list")
  const list: MasterListId = MASTER_LISTS.some((l) => l.id === raw)
    ? (raw as MasterListId)
    : "holiday-types"
  const setList = (id: MasterListId) => setParams({ list: id }, { replace: true })
  const meta = MASTER_LISTS.find((l) => l.id === list)!
  const rows = rowsIn(list)

  const [confirmDelete, setConfirmDelete] = React.useState<string | null>(null)

  /** Only the holiday list can be counted against real records so far. */
  const usage = (row: MasterRow) =>
    row.list === "holiday-types" ? holidays.filter((h) => h.type === row.id).length : null

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 px-4 py-7 md:px-8">
      <button
        onClick={() => navigate("/config")}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />{t("Back to configuration", "العودة إلى الإعدادات")}
      </button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <h1 className="text-[22px] font-bold tracking-tight md:text-[26px]">{t("Master data", "البيانات الرئيسية")}</h1>
          <p className="max-w-3xl text-[13px] text-muted-foreground">
            {t("The configurable lists the modules pick from. Changing a list here changes every picker that reads it.",
               "القوائم القابلة للضبط التي تعتمد عليها الوحدات. أي تغيير هنا ينعكس على كل قائمة اختيار تقرأ منها.")}
          </p>
        </div>
        <Button className="shrink-0" onClick={() => navigate(`/config/master-data/${list}/new`)}>
          <Plus className="size-4" />
          {t(`Add ${meta.singular}`, `إضافة ${meta.singularAr}`)}
        </Button>
      </div>

      {/* which list */}
      <div className="flex flex-wrap gap-1.5">
        {MASTER_LISTS.map((l) => {
          const Icon = ICON[l.id]
          const n = rowsIn(l.id).length
          return (
            <button
              key={l.id} onClick={() => setList(l.id)} aria-pressed={l.id === list}
              className={cn("inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[13px] font-medium transition-colors",
                l.id === list ? "border-primary/40 bg-primary/12 text-primary"
                              : "border-border text-muted-foreground hover:bg-muted/40")}
            >
              <Icon className="size-3.5" />{isAr ? l.labelAr : l.label}
              <span className={cn("rounded-full px-1.5 text-[11px] tabular-nums",
                l.id === list ? "bg-primary/15" : "bg-muted")}>{n}</span>
            </button>
          )
        })}
      </div>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-border/60 px-4 py-3">
          <p className="text-[13px] font-semibold">{isAr ? meta.labelAr : meta.label}</p>
          <p className="text-[11.5px] text-muted-foreground">{isAr ? meta.descAr : meta.desc}</p>
        </div>

        <div className="divide-y divide-border/40">
          {rows.map((row) => {
            const inUse = usage(row)
            return (
              <div key={row.id} className="px-4 py-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn("size-2 shrink-0 rounded-full", TONE_DOT[row.tone])} />
                      <span className={cn("text-[13.5px] font-semibold", !row.active && "text-muted-foreground line-through")}>
                        {isAr ? row.nameAr : row.name}
                      </span>
                      <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10.5px] text-muted-foreground">
                        {row.code ?? row.id}
                      </span>
                      {row.system && (
                        <Badge variant="outline" className="gap-1 text-[10px] text-muted-foreground">
                          <Lock className="size-2.5" />{t("Built-in", "مدمج")}
                        </Badge>
                      )}
                      {!row.active && (
                        <Badge variant="outline" className="border-amber-500/35 bg-amber-500/10 text-[10px] text-amber-600 dark:text-amber-400">
                          {t("Inactive", "غير مفعّل")}
                        </Badge>
                      )}
                    </div>

                    {(isAr ? row.descriptionAr : row.description) && (
                      <p className="mt-0.5 max-w-2xl text-[11.5px] text-muted-foreground/80">
                        {isAr ? row.descriptionAr : row.description}
                      </p>
                    )}

                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground/75">
                      <Facts row={row} t={t} />
                      {inUse !== null && (
                        <span>
                          {inUse > 0
                            ? t(`Used by ${inUse} ${inUse === 1 ? "holiday" : "holidays"}`, `مستخدم في ${inUse} إجازة`)
                            : t("Not used yet", "غير مستخدم بعد")}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => updateMasterRow(row.list, row.id, { active: !row.active })}
                    >
                      <Power className="size-3.5" />
                      {row.active ? t("Deactivate", "إيقاف") : t("Activate", "تفعيل")}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/config/master-data/${list}/${row.id}`)}>
                      <Pencil className="size-3.5" />{t("Edit", "تعديل")}
                    </Button>
                    {!row.system && (
                      <Button
                        variant="ghost" size="sm" aria-label={t("Remove", "إزالة")}
                        onClick={() => setConfirmDelete(confirmDelete === row.id ? null : row.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                {confirmDelete === row.id && (
                  <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/[0.05] p-3">
                    <p className="text-[12.5px] font-semibold">
                      {t(`Remove "${row.name}" from ${meta.label.toLowerCase()}?`, `إزالة "${row.nameAr}" من ${meta.labelAr}؟`)}
                    </p>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">
                      {inUse
                        ? t(`${inUse} records still use it. Deactivate it instead — removing it would leave them without a value.`,
                            `لا تزال ${inUse} سجلات تستخدمه. أوقفه بدلًا من إزالته حتى لا تبقى دون قيمة.`)
                        : t("Nothing uses it, so nothing else changes.", "لا يستخدمه شيء، ولن يتغيّر شيء آخر.")}
                    </p>
                    <div className="mt-2 flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setConfirmDelete(null)}>{t("Cancel", "إلغاء")}</Button>
                      {inUse ? (
                        <Button size="sm" onClick={() => { updateMasterRow(row.list, row.id, { active: false }); setConfirmDelete(null) }}>
                          {t("Deactivate instead", "أوقفه بدلًا من ذلك")}
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => { removeMasterRow(row.list, row.id); setConfirmDelete(null) }}>
                          {t("Yes, remove", "نعم، أزل")}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {rows.length === 0 && (
            <div className="px-4 py-14 text-center">
              <Tags className="mx-auto size-8 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">{t("This list is empty.", "هذه القائمة فارغة.")}</p>
              <Button className="mt-4" onClick={() => navigate(`/config/master-data/${list}/new`)}>
                <Plus className="size-4" />{t(`Add the first ${meta.singular}`, `أضف أول ${meta.singularAr}`)}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

/** The two or three numbers that actually distinguish a row in its list. */
function Facts({ row, t }: {
  row: MasterRow; t: (en: string, ar: string) => string
}) {
  if (row.list === "leave-types") {
    return (
      <>
        <span>
          {row.daysPerYear
            ? t(`${row.daysPerYear} days a year`, `${row.daysPerYear} يومًا سنويًا`)
            : t("No fixed entitlement", "بدون رصيد ثابت")}
        </span>
        <span>{row.paid ? t("Paid", "مدفوعة") : t("Unpaid", "بدون أجر")}</span>
        {row.needsDocument && <span>{t("Needs a document", "يلزم مستند")}</span>}
        {!!row.carryForward && <span>{t(`Carries ${row.carryForward} days forward`, `يُرحَّل ${row.carryForward} يومًا`)}</span>}
      </>
    )
  }
  if (row.list === "request-categories") {
    return (
      <>
        <span>{t(`Routes to ${row.routeTo}`, `يُوجَّه إلى ${row.routeToAr}`)}</span>
        <span>{t(`${row.slaDays} working days`, `${row.slaDays} أيام عمل`)}</span>
        <span>{row.needsApproval ? t("Needs approval", "يحتاج اعتمادًا") : t("No approval", "بدون اعتماد")}</span>
      </>
    )
  }
  if (row.list === "priorities") {
    return (
      <>
        <span>{t(`Rank ${row.rank}`, `الترتيب ${row.rank}`)}</span>
        <span>{t(`Respond within ${row.responseHours}h`, `الاستجابة خلال ${row.responseHours} ساعة`)}</span>
      </>
    )
  }
  if (row.list === "document-tags") {
    const s = SCOPES.find((x) => x.id === (row.scope ?? "all"))!
    return <span>{t(`Visible to: ${s.en}`, `الظهور لـ: ${s.ar}`)}</span>
  }
  return null
}
