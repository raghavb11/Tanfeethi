/** Question list shared by the checklist form (4124:12320) and the read-only
 *  answers views (4124:13130). Question block: padding 20/14, 16px gaps,
 *  16px semibold question, 20px radios; a "No" reveals responsible persons,
 *  details and attachments. */
import * as React from "react"
import { cn } from "@reach/shared-core"
import { Paperclip, X } from "lucide-react"

import { loungeStaff, type Answer, type Question } from "../data/operations"
import { Field, GoldButton, MultiSelect, Radio } from "./ui"
import { emptyAnswer, inputCls, useT } from "./helpers"

export function ChecklistAnswers({
  questions,
  answers,
  onChange,
  readOnly,
  showErrors,
}: {
  questions: Question[]
  answers: Record<string, Answer>
  onChange?: (qid: string, a: Answer) => void
  readOnly?: boolean
  showErrors?: boolean
}) {
  const { t, l } = useT()
  const fileRef = React.useRef<Record<string, HTMLInputElement | null>>({})

  return (
    <div className="flex flex-col pt-2">
      {questions.map((q, i) => {
        const a = answers[q.id] ?? emptyAnswer()
        const set = (patch: Partial<Answer>) => onChange?.(q.id, { ...a, ...patch })
        const missing = showErrors && a.complied === null
        const missingPeople = showErrors && a.complied === false && a.responsible.length === 0
        return (
          <fieldset
            key={q.id}
            className={cn("flex flex-col gap-4 px-3.5 py-5", i < questions.length - 1 && "border-b border-secondary")}
          >
            <legend className="sr-only">{l(q.text)}</legend>
            <p className="text-base font-semibold leading-[20.25px]">{l(q.text)}</p>
            <div className="flex flex-col gap-4">
              <Radio
                name={`q-${q.id}`}
                checked={a.complied === true}
                disabled={readOnly}
                onChange={() => set({ complied: true })}
                label={t("Yes, compliant", "نعم، تم الالتزام")}
              />
              <Radio
                name={`q-${q.id}`}
                checked={a.complied === false}
                disabled={readOnly}
                onChange={() => set({ complied: false })}
                label={t("No, not compliant", "لا، لم يتم الالتزام")}
              />
            </div>
            {missing && <p className="text-xs text-error">{t("Choose an answer.", "اختر إجابة.")}</p>}

            {a.complied === false && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4 md:flex-row">
                  <Field
                    label={t("Responsible people", "الأشخاص المسؤولون")}
                    required={!readOnly}
                    className="md:w-[300px] md:shrink-0"
                    error={missingPeople ? t("Choose at least one person.", "اختر شخصاً واحداً على الأقل.") : undefined}
                  >
                    {readOnly ? (
                      <div className={cn(inputCls(), "flex items-center")}>
                        {a.responsible.map((id) => l(loungeStaff.find((s) => s.id === id)?.name ?? { en: id, ar: id })).join("، ")}
                      </div>
                    ) : (
                      <MultiSelect
                        label={t("Responsible people", "الأشخاص المسؤولون")}
                        options={loungeStaff.map((s) => ({ value: s.id, label: l(s.name), alt: `${s.name.en} ${s.name.ar}` }))}
                        searchable
                        value={a.responsible}
                        onChange={(v) => set({ responsible: v })}
                        invalid={missingPeople}
                      />
                    )}
                  </Field>
                  <Field label={t("Details", "تفاصيل")} htmlFor={`d-${q.id}`} className="md:w-[500px]">
                    <input
                      id={`d-${q.id}`}
                      className={inputCls()}
                      value={a.details}
                      readOnly={readOnly}
                      placeholder={t("Text", "نص")}
                      onChange={(e) => set({ details: e.target.value })}
                    />
                  </Field>
                </div>

                {a.attachments.length > 0 && (
                  <ul className="flex flex-wrap gap-2">
                    {a.attachments.map((f) => (
                      <li key={f} className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs">
                        <Paperclip className="size-3" />
                        <span dir="ltr">{f}</span>
                        {!readOnly && (
                          <button
                            type="button"
                            aria-label={t(`Remove ${f}`, `إزالة ${f}`)}
                            onClick={() => set({ attachments: a.attachments.filter((x) => x !== f) })}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="size-3" />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                {!readOnly && (
                  <div>
                    <input
                      ref={(el) => {
                        fileRef.current[q.id] = el
                      }}
                      type="file"
                      multiple
                      className="sr-only"
                      tabIndex={-1}
                      onChange={(e) => {
                        const names = Array.from(e.target.files ?? []).map((f) => f.name)
                        set({ attachments: [...a.attachments, ...names.filter((n) => !a.attachments.includes(n))] })
                        e.target.value = ""
                      }}
                    />
                    <GoldButton className="w-[208px]" onClick={() => fileRef.current[q.id]?.click()}>
                      {t("Upload Attachments", "رفع مرفقات")}
                    </GoldButton>
                  </div>
                )}
              </div>
            )}
          </fieldset>
        )
      })}
    </div>
  )
}
