/** "تفاصيل الهدف" modal — Figma 4124:13923 (editable) and 4124:14002 (read-only).
 *  728px, Shape/Fill/Secondary, radius 12, padding 24/32, 24px gaps; 36px inputs
 *  on Card/Fill; Save (gold) + Cancel (outlined) only in the editable state. */
import * as React from "react"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { BadgeCheck, X } from "lucide-react"

import { measureUnits, type Goal, type MeasureUnit } from "../data/operations"
import { DateBox, Field, GoldButton, OutlineButton, SelectBox } from "./ui"
import { inputCls, useT } from "./helpers"

type Draft = { title: string; indicator: string; start: string; end: string; unit: MeasureUnit | ""; target: string; weight: string }

function toDraft(g: Goal | undefined, isAr: boolean): Draft {
  if (!g) return { title: "", indicator: "", start: "", end: "", unit: "", target: "", weight: "" }
  return {
    title: isAr ? g.title.ar : g.title.en,
    indicator: isAr ? g.indicator.ar : g.indicator.en,
    start: g.start,
    end: g.end,
    unit: g.unit,
    target: String(g.target),
    weight: String(g.weight),
  }
}

export function GoalModal({
  open,
  onOpenChange,
  goal,
  readOnly,
  otherWeight = 0,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  goal?: Goal
  readOnly?: boolean
  /** Sum of the weights of the other goals, to keep the total at 100%. */
  otherWeight?: number
  onSave?: (goal: Goal) => void
}) {
  const { t, l, isAr } = useT()
  const [draft, setDraft] = React.useState<Draft>(() => toDraft(goal, isAr))
  const [tried, setTried] = React.useState(false)
  const popupRef = React.useRef<HTMLDivElement>(null)

  // Re-seed the form each time the modal opens (render-time sync, no effect).
  const [seenOpen, setSeenOpen] = React.useState(open)
  if (open !== seenOpen) {
    setSeenOpen(open)
    if (open) {
      setDraft(toDraft(goal, isAr))
      setTried(false)
    }
  }

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))
  const target = Number(draft.target)
  const weight = Number(draft.weight)
  const errors = {
    title: !draft.title.trim(),
    indicator: !draft.indicator.trim(),
    start: !draft.start,
    end: !draft.end || (!!draft.start && draft.end < draft.start),
    unit: !draft.unit,
    target: draft.target === "" || Number.isNaN(target) || target < 0,
    weight: draft.weight === "" || Number.isNaN(weight) || weight <= 0 || weight + otherWeight > 100,
  }
  const invalid = Object.values(errors).some(Boolean)
  const surface = "card" as const
  // 4124:14002: read-only fields are Text/Primary on a ~19% light fill with a faint inner stroke.
  const roCls = readOnly ? "bg-foreground/[0.19] ring-1 ring-inset ring-foreground/[0.09] disabled:opacity-100 opacity-100" : undefined

  const save = () => {
    setTried(true)
    if (invalid || !draft.unit) return
    onSave?.({
      id: goal?.id ?? `g${Date.now()}`,
      title: goal && draft.title === l(goal.title) ? goal.title : { en: draft.title.trim(), ar: draft.title.trim() },
      indicator:
        goal && draft.indicator === l(goal.indicator) ? goal.indicator : { en: draft.indicator.trim(), ar: draft.indicator.trim() },
      start: draft.start,
      end: draft.end,
      unit: draft.unit,
      target,
      weight,
    })
    onOpenChange(false)
  }

  const err = (k: keyof typeof errors, msg: string) => (tried && errors[k] ? msg : undefined)
  const required = t("Required", "مطلوب")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={popupRef}
        // Focus the dialog itself on open (not the close button), so no focus
        // ring is drawn on the X the frames show at rest.
        initialFocus={popupRef}
        showCloseButton={false}
        className="max-h-[calc(100svh-2rem)] gap-6 overflow-y-auto rounded-[12px] bg-secondary px-5 py-6 text-foreground ring-0 sm:max-w-[728px] sm:px-8"
      >
        <div className="flex items-center justify-between gap-3 pb-3">
          <div className="flex flex-col items-start gap-2">
            <DialogTitle className="flex items-center gap-2 text-[17px] font-medium leading-[25.5px]">
              <BadgeCheck className="size-4 text-primary" strokeWidth={1.8} />
              {t("Goal details", "تفاصيل الهدف")}
            </DialogTitle>
            <span aria-hidden className="h-[3px] w-12 rounded-[2px] bg-primary" />
          </div>
          <DialogClose
            aria-label={t("Close", "إغلاق")}
            className="inline-flex size-[34px] items-center justify-center rounded-[8px] text-foreground hover:bg-background/40 focus-visible:ring-2 focus-visible:ring-ring outline-none"
          >
            <X className="size-6" />
          </DialogClose>
        </div>
        <DialogDescription className="sr-only">
          {readOnly ? t("Read-only goal details", "تفاصيل الهدف للعرض فقط") : t("Add or edit a goal", "إضافة هدف أو تعديله")}
        </DialogDescription>

        <div className="flex flex-col gap-4 pb-4">
          <Field label={t("Goal", "الهدف")} required={!readOnly} htmlFor="goal-title" error={err("title", required)}>
            <input
              id="goal-title"
              className={cn(inputCls(surface, tried && errors.title), roCls)}
              value={draft.title}
              disabled={readOnly}
              onChange={(e) => set({ title: e.target.value })}
            />
          </Field>
          <Field label={t("KPI", "المؤشر")} required={!readOnly} htmlFor="goal-indicator" error={err("indicator", required)}>
            <input
              id="goal-indicator"
              className={cn(inputCls(surface, tried && errors.indicator), roCls)}
              value={draft.indicator}
              disabled={readOnly}
              onChange={(e) => set({ indicator: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t("Start date", "تاريخ البدء")} required={!readOnly} htmlFor="goal-start" error={err("start", required)}>
              <DateBox id="goal-start" value={draft.start} onChange={(v) => set({ start: v })} placeholder={t("Date", "تاريخ")} surface={surface} disabled={readOnly} invalid={tried && errors.start} className={roCls} />
            </Field>
            <Field
              label={t("End date", "تاريخ الانتهاء")}
              required={!readOnly}
              htmlFor="goal-end"
              error={err("end", draft.end ? t("Must be after the start date", "يجب أن يكون بعد تاريخ البدء") : required)}
            >
              <DateBox id="goal-end" value={draft.end} onChange={(v) => set({ end: v })} min={draft.start || undefined} placeholder={t("Date", "تاريخ")} surface={surface} disabled={readOnly} invalid={tried && errors.end} className={roCls} />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label={t("Unit of measure", "وحدة القياس")} required={!readOnly} htmlFor="goal-unit" error={err("unit", required)}>
              <SelectBox
                id="goal-unit"
                value={draft.unit}
                onChange={(v) => set({ unit: v as MeasureUnit })}
                placeholder={t("Choose a unit", "اختر الوحدة")}
                surface={surface}
                disabled={readOnly}
                invalid={tried && errors.unit}
                controlClassName={roCls}
                options={measureUnits.map((u) => ({ value: u.id, label: l(u.label) }))}
              />
            </Field>
            <Field label={t("Target", "المستهدف")} required={!readOnly} htmlFor="goal-target" error={err("target", t("Enter a number", "أدخل رقماً"))}>
              <input
                id="goal-target"
                type="number"
                inputMode="decimal"
                min={0}
                className={cn(inputCls(surface, tried && errors.target), roCls)}
                value={draft.target}
                disabled={readOnly}
                onChange={(e) => set({ target: e.target.value })}
              />
            </Field>
            <Field
              label={t("Weight (%)", "الوزن")}
              required={!readOnly}
              htmlFor="goal-weight"
              error={err(
                "weight",
                weight + otherWeight > 100
                  ? t(`Goal weights can't exceed 100% (${100 - otherWeight}% left)`, `لا يتجاوز مجموع الأوزان 100% (المتبقي ${100 - otherWeight}%)`)
                  : t("Enter a weight", "أدخل الوزن"),
              )}
            >
              <input
                id="goal-weight"
                type="number"
                inputMode="numeric"
                min={1}
                max={100}
                className={cn(inputCls(surface, tried && errors.weight), roCls)}
                value={draft.weight}
                disabled={readOnly}
                onChange={(e) => set({ weight: e.target.value })}
              />
            </Field>
          </div>
        </div>

        {!readOnly && (
          <div className="flex flex-wrap items-center gap-4">
            <GoldButton onClick={save}>{t("Save", "حفظ")}</GoldButton>
            <DialogClose render={<OutlineButton className="border-background" />}>{t("Cancel", "إلغاء")}</DialogClose>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
