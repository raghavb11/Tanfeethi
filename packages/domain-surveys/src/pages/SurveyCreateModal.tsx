/** Create survey / poll popup — Figma 2464:2865, built as drawn. Choosing
 *  "News" in the type field hands over to the news editor. */
import * as React from "react"
import { useNavigate } from "react-router-dom"
import { cn } from "@reach/shared-core"
import { BadgeCheck, CalendarDays, Trash2 } from "lucide-react"

import { CountSelect, DraftsButton, Field, FIELD, MODAL_OUTLINE, WButton, WInput, WModal, WSelect } from "./_wijha"
import { SURVEY_DEPTS } from "../data/mock/surveys"
import { addCreatedSurvey, getCreatedSurveys, subscribeCreated, updateCreatedSurvey } from "../store"

const ORDINALS_AR = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع", "العاشر"]

export function SurveyCreateModal({ open, onClose, isAr }: { open: boolean; onClose: () => void; isAr: boolean }) {
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const created = React.useSyncExternalStore(subscribeCreated, getCreatedSurveys)
  const deptOptions = React.useMemo(() => SURVEY_DEPTS.map((d) => ({ id: d.id, label: isAr ? d.ar : d.en, alt: isAr ? d.en : d.ar })), [isAr])

  const [kind, setKind] = React.useState<"survey" | "poll">("survey")
  const [title, setTitle] = React.useState("")
  const [date, setDate] = React.useState("")
  const [dateFocus, setDateFocus] = React.useState(false)
  const [fromDepts, setFromDepts] = React.useState<string[]>([])
  const [audience, setAudience] = React.useState<string[]>([])
  const [options, setOptions] = React.useState<string[]>(["", "", ""])
  const [draftId, setDraftId] = React.useState<string | null>(null)
  const [showDrafts, setShowDrafts] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    setKind("survey"); setTitle(""); setDate(""); setFromDepts([]); setAudience([]); setOptions(["", "", ""]); setDraftId(null); setShowDrafts(false)
  }, [open])

  const drafts = created.filter((c) => c.status === "Draft")
  const filled = options.map((o) => o.trim()).filter(Boolean)
  const canPublish = title.trim().length > 0 && filled.length >= 2

  const save = (status: "Published" | "Draft") => {
    const fields = { title: title.trim(), category: "Pulse" as const, questionCount: 1, kind, status, options: filled, publishDate: date || undefined, fromDepts, audience }
    if (draftId) updateCreatedSurvey(draftId, fields)
    else addCreatedSurvey({ id: `created-${Date.now()}`, ...fields })
    onClose()
  }

  return (
    <WModal open={open} onClose={onClose} isAr={isAr} icon={BadgeCheck} title={t("Surveys & polls", "الاستبيانات والتصويت")}
      footer={<>
        <WButton className="px-6" disabled={!canPublish} onClick={() => save("Published")}>{t("Publish", "نشر")}</WButton>
        <WButton variant="outline" className={MODAL_OUTLINE} onClick={onClose}>{t("Cancel", "إلغاء")}</WButton>
        <WButton variant="outline" className={MODAL_OUTLINE} disabled={!title.trim()} onClick={() => save("Draft")}>{t("Save as draft", "حفظ كمسودة")}</WButton>
        <DraftsButton count={drafts.length} isAr={isAr} onClick={() => setShowDrafts((v) => !v)} />
      </>}>
      {showDrafts && (
        <div className="rounded-[8px] bg-card-elevated p-2">
          {drafts.length === 0 ? <p className="px-2 py-3 text-[12px] text-muted-foreground">{t("No drafts yet.", "لا توجد مسودات بعد.")}</p>
            : drafts.map((d) => (
              <button key={d.id} type="button" className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-start text-[13px] hover:bg-secondary"
                onClick={() => { setDraftId(d.id); setTitle(d.title); setKind(d.kind ?? "survey"); setOptions(d.options?.length ? d.options : ["", "", ""]); setFromDepts(d.fromDepts ?? []); setAudience(d.audience ?? []); setDate(d.publishDate ?? ""); setShowDrafts(false) }}>
                <BadgeCheck className="size-4 text-icon" /><span className="truncate">{d.title}</span>
              </button>
            ))}
        </div>
      )}
      <div className="flex flex-col gap-4">
        <div className="grid gap-2 sm:grid-cols-[266px_minmax(0,1fr)]">
          <Field label={t("Create news or survey", "إنشاء خبر أو استبيان")}>
            <WSelect value={kind} onChange={(e) => { const v = e.target.value; if (v === "news") { onClose(); navigate("/news/new") } else setKind(v as "survey" | "poll") }}>
              <option value="survey">{t("Survey", "استبيان")}</option>
              <option value="poll">{t("Poll", "تصويت")}</option>
              <option value="news">{t("News", "خبر")}</option>
            </WSelect>
          </Field>
          <Field label={t("Main title", "العنوان الرئيسي")} required><WInput aria-required value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("Title", "عنوان")} autoFocus /></Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={t("Publish date", "تاريخ النشر")}>
            <span className="relative block">
              <input type={date || dateFocus ? "date" : "text"} value={date} placeholder={t("Date", "تاريخ")} onFocus={() => setDateFocus(true)} onBlur={() => setDateFocus(false)}
                onChange={(e) => setDate(e.target.value)} aria-label={t("Publish date", "تاريخ النشر")}
                className={cn(FIELD, "pe-9 [color-scheme:light] dark:[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0")} />
              <CalendarDays className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-icon" />
            </span>
          </Field>
          <Field label={t("From department", "الخبر من إدارة")}><CountSelect options={deptOptions} value={fromDepts} onChange={setFromDepts} allLabel={t("All", "الكل")} isAr={isAr} /></Field>
          <Field label={t("Target employees", "الموظفين المستهدفين")}><CountSelect options={deptOptions} value={audience} onChange={setAudience} allLabel={t("All", "الكل")} isAr={isAr} /></Field>
        </div>
        {options.map((o, i) => (
          <Field key={i} required={i < 2} label={isAr ? `الخيار ${ORDINALS_AR[i] ?? i + 1}` : `Option ${i + 1}`}>
            <div className="flex items-center gap-4">
              <WInput aria-required={i < 2 || undefined} value={o} onChange={(e) => setOptions(options.map((x, j) => (j === i ? e.target.value : x)))} placeholder={t("Text", "نص")} />
              <WButton variant="danger" className={MODAL_OUTLINE} disabled={options.length <= 2} onClick={() => setOptions(options.filter((_, j) => j !== i))}><Trash2 />{t("Delete", "حذف")}</WButton>
            </div>
          </Field>
        ))}
        <div className="flex justify-end">
          <WButton className="px-6" disabled={options.length >= 10} onClick={() => setOptions([...options, ""])}>{t("Add new option", "إضافة خيار جديد")}</WButton>
        </div>
      </div>
    </WModal>
  )
}
