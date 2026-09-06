import * as React from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Avatar, AvatarFallback, Badge, Button, Card, Input, Textarea } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  AlertTriangle, ArrowRight, Bell, Check, ChevronRight, Clock, GripVertical, Info, Plus, Save,
  Search, Settings2, Trash2, Users, X,
} from "lucide-react"

import { getPortalUsers } from "../data/roles"
import {
  FIELDS, ON_REJECT, OPERATORS, fieldById, newId, optionLabel, saveRule, setRuleActive, useRule,
  type Approver, type Condition, type FieldId, type Level, type OperatorId, type Rule,
} from "../data/rules"

// ── small primitives (shared-ui has no select / radio / switch) ──────────────
function Select<T extends string>({
  value, onChange, options, className,
}: {
  value: T
  onChange: (v: T) => void
  options: { id: T; label: string }[]
  className?: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className={cn(
        "h-9 w-full rounded-lg border border-border/60 bg-card px-3 text-[13px] outline-none",
        "transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10",
        className,
      )}
    >
      {options.map((o) => (
        <option key={o.id} value={o.id}>{o.label}</option>
      ))}
    </select>
  )
}

function Radio({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button type="button" onClick={onChange} className="flex items-center gap-2 text-start">
      <span className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
        checked ? "border-primary" : "border-border",
      )}>
        {checked && <span className="size-2 rounded-full bg-primary" />}
      </span>
      <span className="text-[12.5px]">{label}</span>
    </button>
  )
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[12.5px] font-medium text-muted-foreground">{label}</span>
      <button
        type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)}
        className={cn("relative h-6 w-11 rounded-full transition-colors", on ? "bg-primary" : "bg-muted")}
      >
        <span className={cn(
          "absolute top-0.5 size-5 rounded-full bg-white shadow transition-all",
          on ? "start-[22px]" : "start-0.5",
        )} />
      </button>
    </div>
  )
}

function SectionHead({ n, title, desc, action }: { n: number; title: string; desc: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
      <div className="flex min-w-0 gap-3">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-primary-foreground">{n}</span>
        <div className="min-w-0">
          <div className="text-[14px] font-semibold leading-tight">{title}</div>
          <div className="mt-0.5 text-[12px] text-muted-foreground">{desc}</div>
        </div>
      </div>
      {action}
    </div>
  )
}

const TABS = [
  { id: "builder", en: "Rule Builder", ar: "منشئ القاعدة" },
  { id: "test", en: "Test Rule", ar: "اختبار القاعدة" },
  { id: "audit", en: "Audit Log", ar: "سجل التدقيق" },
  { id: "history", en: "Rule History", ar: "تاريخ القاعدة" },
] as const

/** The Approval Rule Engine editor — conditions, approval levels and settings,
 *  with a right rail that swaps to a level's approver list when one is opened. */
export default function RuleEditorPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const { id = "" } = useParams()
  const stored = useRule(id)

  const [draft, setDraft] = React.useState<Rule | null>(null)
  const [tab, setTab] = React.useState<(typeof TABS)[number]["id"]>("builder")
  const [openLevel, setOpenLevel] = React.useState<string | null>(null)
  const [approverQuery, setApproverQuery] = React.useState("")
  const [saved, setSaved] = React.useState(false)
  const [drag, setDrag] = React.useState<string | null>(null)

  // load the rule into a local draft once
  React.useEffect(() => { if (stored && !draft) setDraft(stored) }, [stored, draft])

  if (!stored) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center md:px-8">
        <p className="text-[13px] text-muted-foreground">{t("That rule no longer exists.", "هذه القاعدة لم تعد موجودة.")}</p>
        <Button className="mt-4" onClick={() => navigate("/config/rules")}>{t("Back to rules", "العودة إلى القواعد")}</Button>
      </main>
    )
  }
  if (!draft) return null

  const set = (patch: Partial<Rule>) => setDraft({ ...draft, ...patch })
  const setLevel = (lid: string, patch: Partial<Level>) =>
    set({ levels: draft.levels.map((l) => (l.id === lid ? { ...l, ...patch } : l)) })

  const level = draft.levels.find((l) => l.id === openLevel) ?? null

  // ── conditions ──
  const addCondition = () =>
    set({ conditions: [...draft.conditions, { id: newId("c"), field: "contentType", operator: "is", values: [] }] })
  const setCondition = (cid: string, patch: Partial<Condition>) =>
    set({ conditions: draft.conditions.map((c) => (c.id === cid ? { ...c, ...patch } : c)) })
  const removeCondition = (cid: string) =>
    set({ conditions: draft.conditions.filter((c) => c.id !== cid) })

  // ── levels ──
  const addLevel = () =>
    set({
      levels: [...draft.levels, {
        id: newId("l"), name: `Level ${draft.levels.length + 1}`, nameAr: `المستوى ${draft.levels.length + 1}`,
        type: "serial", criteria: "all", approvers: [], timeLimitDays: 2, onReject: "stop",
      }],
    })
  const removeLevel = (lid: string) => {
    set({ levels: draft.levels.filter((l) => l.id !== lid) })
    if (openLevel === lid) setOpenLevel(null)
  }

  // ── approvers on the open level ──
  const candidates = getPortalUsers().filter((p) => {
    if (!level) return false
    if (level.approvers.some((a) => a.ref === p.id)) return false
    const q = approverQuery.trim().toLowerCase()
    return !q || p.name.toLowerCase().includes(q) || p.nameAr.includes(approverQuery.trim())
  })
  const addApprover = (userId: string) => {
    if (!level) return
    const p = getPortalUsers().find((x) => x.id === userId)!
    const a: Approver = {
      id: newId("ap"), kind: "user", ref: p.id,
      label: p.name, labelAr: p.nameAr, initials: p.initials,
      sublabel: p.dept, sublabelAr: p.deptAr,
    }
    setLevel(level.id, { approvers: [...level.approvers, a] })
    setApproverQuery("")
  }
  const removeApprover = (aid: string) =>
    level && setLevel(level.id, { approvers: level.approvers.filter((a) => a.id !== aid) })
  const reorder = (from: string, to: string) => {
    if (!level || from === to) return
    const list = [...level.approvers]
    const fi = list.findIndex((a) => a.id === from)
    const ti = list.findIndex((a) => a.id === to)
    if (fi < 0 || ti < 0) return
    list.splice(ti, 0, list.splice(fi, 1)[0])
    setLevel(level.id, { approvers: list })
  }

  const commit = () => {
    saveRule(draft)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2600)
  }

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-6 md:px-8">
      {/* breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-muted-foreground">
        <Link to="/config" className="hover:text-foreground">{t("Approval Rule Engine", "محرك قواعد الاعتماد")}</Link>
        <ChevronRight className={cn("size-3.5", isAr && "rotate-180")} />
        <Link to="/config/rules" className="hover:text-foreground">{t("Rules", "القواعد")}</Link>
        <ChevronRight className={cn("size-3.5", isAr && "rotate-180")} />
        <span className="font-medium text-foreground">{isAr ? draft.nameAr : draft.name}</span>
      </nav>

      {/* header */}
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[22px] font-bold tracking-tight md:text-[24px]">{isAr ? draft.nameAr : draft.name}</h1>
            <Badge
              variant="outline"
              className={cn("text-[11px]", draft.active
                ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "text-muted-foreground")}
            >
              {draft.active ? t("Active", "نشطة") : t("Inactive", "غير نشطة")}
            </Badge>
          </div>
          <p className="mt-1 max-w-3xl text-[12.5px] text-muted-foreground">{isAr ? draft.descriptionAr : draft.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Toggle
            on={draft.active}
            onChange={(v) => { set({ active: v }); setRuleActive(draft.id, v) }}
            label={t("Rule Status", "حالة القاعدة")}
          />
          <Button onClick={commit}>
            {saved ? <Check className="size-4" /> : <Save className="size-4" />}
            {saved ? t("Saved", "تم الحفظ") : t("Save Rule", "حفظ القاعدة")}
          </Button>
        </div>
      </div>

      {/* tabs */}
      <div className="mt-5 flex flex-wrap gap-1 border-b border-border/60">
        {TABS.map((x) => (
          <button
            key={x.id} type="button" onClick={() => setTab(x.id)}
            className={cn(
              "-mb-px border-b-2 px-3.5 py-2.5 text-[13px] font-semibold transition-colors",
              tab === x.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {isAr ? x.ar : x.en}
          </button>
        ))}
      </div>

      {tab !== "builder" ? (
        <Card className="mt-6 ring-1 ring-foreground/10">
          <div className="px-5 py-16 text-center text-[13px] text-muted-foreground">
            {t(`${TABS.find((x) => x.id === tab)!.en} is not part of this prototype yet.`,
               `${TABS.find((x) => x.id === tab)!.ar} غير متاح في هذا النموذج بعد.`)}
          </div>
        </Card>
      ) : (
        <div className="mt-6 grid items-start gap-6 xl:grid-cols-12">
          {/* ── main column ── */}
          <div className="space-y-6 xl:col-span-8">
            {/* 1 · conditions */}
            <Card className="ring-1 ring-foreground/10">
              <SectionHead
                n={1}
                title={t("When to apply this rule", "متى تُطبَّق هذه القاعدة")}
                desc={t("Define the conditions under which this approval rule will be triggered.", "حدّد الشروط التي تُفعّل بموجبها قاعدة الاعتماد.")}
              />
              <div className="space-y-2.5 border-t border-border/60 p-5">
                {draft.conditions.map((c, i) => {
                  const f = fieldById(c.field)
                  const multi = OPERATORS.find((o) => o.id === c.operator)!.multi
                  return (
                    <div key={c.id} className="flex flex-wrap items-start gap-2">
                      <div className="min-w-[180px] flex-1">
                        <Select<FieldId>
                          value={c.field}
                          onChange={(v) => setCondition(c.id, { field: v, values: [] })}
                          options={FIELDS.map((x) => ({ id: x.id, label: isAr ? x.labelAr : x.label }))}
                        />
                      </div>
                      <div className="min-w-[130px] flex-1">
                        <Select<OperatorId>
                          value={c.operator}
                          onChange={(v) => setCondition(c.id, { operator: v, values: multi ? c.values : c.values.slice(0, 1) })}
                          options={OPERATORS.map((x) => ({ id: x.id, label: isAr ? x.labelAr : x.label }))}
                        />
                      </div>

                      {/* value chips + picker */}
                      <div className="min-w-[200px] flex-[1.4]">
                        <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-lg border border-border/60 bg-card px-2 py-1.5">
                          {c.values.map((v) => (
                            <span key={v} className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 text-[12px]">
                              {optionLabel(c.field, v, isAr)}
                              <button onClick={() => setCondition(c.id, { values: c.values.filter((x) => x !== v) })} aria-label="remove">
                                <X className="size-3 text-muted-foreground hover:text-foreground" />
                              </button>
                            </span>
                          ))}
                          <select
                            value=""
                            onChange={(e) => {
                              const v = e.target.value
                              if (!v) return
                              setCondition(c.id, { values: multi ? [...c.values, v] : [v] })
                            }}
                            className="min-w-16 flex-1 bg-transparent text-[12.5px] outline-none"
                          >
                            <option value="">{c.values.length ? "" : t("Select…", "اختر…")}</option>
                            {f.options.filter((o) => !c.values.includes(o.id)).map((o) => (
                              <option key={o.id} value={o.id}>{isAr ? o.labelAr : o.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <span className="flex h-9 items-center rounded-lg border border-border/60 px-3 text-[11.5px] font-semibold text-muted-foreground">
                        {i === draft.conditions.length - 1 ? t("—", "—") : t("AND", "و")}
                      </span>
                      <button
                        onClick={() => removeCondition(c.id)}
                        className="flex size-9 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:border-red-500/40 hover:text-red-500"
                        aria-label={t("Delete condition", "حذف الشرط")}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  )
                })}

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Button variant="outline" size="sm" onClick={addCondition}>
                    <Plus className="size-4" />{t("Add Condition", "إضافة شرط")}
                  </Button>
                  <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
                    {t("All conditions must match", "يجب تحقّق جميع الشروط")}
                    <Info className="size-3.5" />
                  </span>
                </div>
              </div>
            </Card>

            {/* 2 · approval workflow */}
            <Card className="ring-1 ring-foreground/10">
              <SectionHead
                n={2}
                title={t("Approval workflow", "مسار الاعتماد")}
                desc={t("Configure approvers for each level. Choose approval type and criteria for each level.", "حدّد المعتمدين لكل مستوى، ونوع الاعتماد ومعياره.")}
                action={<Button variant="outline" size="sm" onClick={addLevel}><Plus className="size-4" />{t("Add Level", "إضافة مستوى")}</Button>}
              />
              <div className="space-y-3 border-t border-border/60 p-5">
                {draft.levels.map((l, i) => (
                  <div
                    key={l.id}
                    className={cn(
                      "rounded-xl border p-4 transition-colors",
                      openLevel === l.id ? "border-primary/40 bg-primary/[0.04]" : "border-border/60",
                    )}
                  >
                    <div className="flex flex-wrap items-start gap-4">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-primary-foreground">{i + 1}</span>

                      <div className="min-w-[150px] flex-1">
                        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          {t(`Level ${i + 1}`, `المستوى ${i + 1}`)}
                        </div>
                        <Input
                          value={isAr ? l.nameAr : l.name}
                          onChange={(e) => setLevel(l.id, isAr ? { nameAr: e.target.value } : { name: e.target.value })}
                        />
                      </div>

                      <div className="min-w-[150px]">
                        <div className="mb-1.5 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          {t("Approval Type", "نوع الاعتماد")}<Info className="size-3" />
                        </div>
                        <div className="space-y-1.5">
                          <Radio checked={l.type === "serial"} onChange={() => setLevel(l.id, { type: "serial" })} label={t("Serial (One after another)", "تسلسلي (واحد تلو الآخر)")} />
                          <Radio checked={l.type === "parallel"} onChange={() => setLevel(l.id, { type: "parallel" })} label={t("Parallel (All at once)", "متوازٍ (الجميع معًا)")} />
                        </div>
                      </div>

                      <div className="min-w-[140px]">
                        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{t("Approvers", "المعتمدون")}</div>
                        <button
                          type="button"
                          onClick={() => { setOpenLevel(openLevel === l.id ? null : l.id); setApproverQuery("") }}
                          className="flex w-full items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2 text-start transition-colors hover:border-primary/30"
                        >
                          <Users className="size-4 shrink-0 text-muted-foreground" />
                          <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium">
                            {l.approvers.length === 1
                              ? (isAr ? l.approvers[0].labelAr : l.approvers[0].label)
                              : t(`${l.approvers.length} approvers`, `${l.approvers.length} معتمدين`)}
                          </span>
                          <ArrowRight className={cn("size-3.5 shrink-0 text-muted-foreground/50", isAr && "rotate-180")} />
                        </button>
                      </div>

                      <div className="min-w-[160px]">
                        <div className="mb-1.5 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          {t("Approval Criteria", "معيار الاعتماد")}<Info className="size-3" />
                        </div>
                        <div className="space-y-1.5">
                          <Radio checked={l.criteria === "any"} onChange={() => setLevel(l.id, { criteria: "any" })} label={t("Any one approver must approve", "يكفي اعتماد شخص واحد")} />
                          <Radio checked={l.criteria === "all"} onChange={() => setLevel(l.id, { criteria: "all" })} label={t("All approvers must approve", "يجب اعتماد الجميع")} />
                        </div>
                      </div>

                      <button
                        onClick={() => removeLevel(l.id)}
                        className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:border-red-500/40 hover:text-red-500"
                        aria-label={t("Remove level", "حذف المستوى")}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border/50 pt-3">
                      <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
                        <Clock className="size-3.5" />{t("Time limit", "المهلة")}
                        <input
                          type="number" min={1} value={l.timeLimitDays}
                          onChange={(e) => setLevel(l.id, { timeLimitDays: Math.max(1, Number(e.target.value) || 1) })}
                          className="h-7 w-14 rounded-md border border-border/60 bg-card px-2 text-[12px] tabular-nums outline-none"
                        />
                        {t("days", "أيام")}
                      </label>
                      <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
                        <AlertTriangle className="size-3.5" />{t("On rejection", "عند الرفض")}
                        <Select
                          value={l.onReject}
                          onChange={(v) => setLevel(l.id, { onReject: v })}
                          options={ON_REJECT.map((x) => ({ id: x.id, label: isAr ? x.labelAr : x.label }))}
                          className="h-7 w-auto min-w-40 px-2 text-[12px]"
                        />
                      </label>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addLevel}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-[13px] font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Plus className="size-4" />{t("Add Level", "إضافة مستوى")}
                </button>
              </div>
            </Card>

            {/* 3 · rule settings */}
            <Card className="ring-1 ring-foreground/10">
              <SectionHead
                n={3}
                title={t("Rule settings", "إعدادات القاعدة")}
                desc={t("Configure rule behaviour and exceptions.", "اضبط سلوك القاعدة والاستثناءات.")}
              />
              <div className="grid gap-5 border-t border-border/60 p-5 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{t("If no response", "عند عدم الرد")}</div>
                  <Toggle
                    on={draft.settings.escalateAfterDue}
                    onChange={(v) => set({ settings: { ...draft.settings, escalateAfterDue: v } })}
                    label={t("Escalate", "تصعيد")}
                  />
                </div>
                <div>
                  <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{t("Escalation", "التصعيد")}</div>
                  <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
                    {t("Every", "كل")}
                    <input
                      type="number" min={1} value={draft.settings.escalationEveryDays}
                      onChange={(e) => set({ settings: { ...draft.settings, escalationEveryDays: Math.max(1, Number(e.target.value) || 1) } })}
                      className="h-8 w-14 rounded-md border border-border/60 bg-card px-2 tabular-nums outline-none"
                    />
                    {t("day(s)", "يوم")}
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{t("Reminder", "التذكير")}</div>
                  <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
                    <Bell className="size-3.5" />{t("Every", "كل")}
                    <input
                      type="number" min={1} value={draft.settings.remindEveryDays}
                      onChange={(e) => set({ settings: { ...draft.settings, remindEveryDays: Math.max(1, Number(e.target.value) || 1) } })}
                      className="h-8 w-14 rounded-md border border-border/60 bg-card px-2 tabular-nums outline-none"
                    />
                    {t("day(s)", "يوم")}
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{t("Rule exceptions", "استثناءات القاعدة")}</div>
                  <div className="flex items-center gap-2 text-[12.5px]">
                    <Settings2 className="size-3.5 text-muted-foreground" />
                    {t(`${draft.settings.exceptions} exceptions added`, `${draft.settings.exceptions} استثناءات مضافة`)}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* ── right rail: summary, or the open level's approvers ── */}
          <div className="space-y-6 xl:col-span-4">
            {level ? (
              <Card className="ring-1 ring-foreground/10">
                <div className="flex items-start justify-between gap-2 border-b border-border/60 px-5 py-4">
                  <div className="min-w-0">
                    <div className="text-[14px] font-semibold">
                      {t(`Level ${draft.levels.findIndex((l) => l.id === level.id) + 1}`, `المستوى ${draft.levels.findIndex((l) => l.id === level.id) + 1}`)}
                      {" — "}{isAr ? level.nameAr : level.name}
                    </div>
                    <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                      {level.type === "serial" ? t("Serial approval", "اعتماد تسلسلي") : t("Parallel approval", "اعتماد متوازٍ")}
                      {" · "}
                      {t(`${level.approvers.length} approvers`, `${level.approvers.length} معتمدين`)}
                    </div>
                  </div>
                  <button onClick={() => setOpenLevel(null)} aria-label={t("Close", "إغلاق")} className="text-muted-foreground hover:text-foreground">
                    <X className="size-4" />
                  </button>
                </div>

                <div className="space-y-4 p-4">
                  {level.type === "serial" && (
                    <div className="flex gap-2.5 rounded-xl border border-primary/25 bg-primary/[0.06] p-3 text-[12px] text-muted-foreground">
                      <Info className="mt-0.5 size-4 shrink-0 text-primary" />
                      <p>{t(
                        "For serial approval, the order of approval follows the order approvers are added. Drag to change the order.",
                        "في الاعتماد التسلسلي يتبع الترتيب تسلسل إضافة المعتمدين. اسحب لتغيير الترتيب.",
                      )}</p>
                    </div>
                  )}

                  <div className="relative">
                    <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
                    <Input
                      value={approverQuery} onChange={(e) => setApproverQuery(e.target.value)}
                      placeholder={t("Search approvers", "ابحث عن معتمد")} className="ps-9"
                    />
                  </div>

                  {approverQuery.trim() !== "" && (
                    <div className="max-h-44 space-y-1 overflow-y-auto rounded-xl border border-border/60 p-1">
                      {candidates.map((p) => (
                        <button
                          key={p.id} onClick={() => addApprover(p.id)}
                          className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-start transition-colors hover:bg-muted/50"
                        >
                          <Avatar className="size-7"><AvatarFallback className="bg-primary/12 text-[10px] font-bold text-primary">{p.initials}</AvatarFallback></Avatar>
                          <div className="min-w-0">
                            <div className="truncate text-[12.5px] font-medium">{isAr ? p.nameAr : p.name}</div>
                            <div className="truncate text-[11px] text-muted-foreground/70">{isAr ? p.deptAr : p.dept}</div>
                          </div>
                          <Plus className="ms-auto size-3.5 text-muted-foreground" />
                        </button>
                      ))}
                      {candidates.length === 0 && (
                        <div className="px-2 py-3 text-center text-[12px] text-muted-foreground">{t("No matching approver", "لا يوجد معتمد مطابق")}</div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-[auto_1fr] gap-x-3 text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                    <span>{t("Order", "الترتيب")}</span><span>{t("Approver", "المعتمد")}</span>
                  </div>

                  <div className="divide-y divide-border/50 rounded-xl border border-border/60">
                    {level.approvers.map((a, i) => (
                      <div
                        key={a.id}
                        draggable
                        onDragStart={() => setDrag(a.id)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => { if (drag) reorder(drag, a.id); setDrag(null) }}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2.5 transition-colors",
                          drag === a.id ? "opacity-50" : "hover:bg-muted/25",
                        )}
                      >
                        <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground/40" />
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border/60 text-[12px] font-bold tabular-nums">{i + 1}</span>
                        <Avatar className="size-8 shrink-0">
                          <AvatarFallback className="bg-primary/12 text-[11px] font-bold text-primary">
                            {a.initials ?? (a.kind === "group" ? "GR" : "MG")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[12.5px] font-semibold">{isAr ? a.labelAr : a.label}</div>
                          <div className="truncate text-[11px] text-muted-foreground/70">
                            {a.members ? t(`${a.members} members`, `${a.members} أعضاء`) : (isAr ? a.sublabelAr : a.sublabel) ?? t("Dynamic approver", "معتمد ديناميكي")}
                          </div>
                        </div>
                        <button onClick={() => removeApprover(a.id)} aria-label={t("Remove", "إزالة")} className="text-muted-foreground hover:text-red-500">
                          <X className="size-4" />
                        </button>
                      </div>
                    ))}
                    {level.approvers.length === 0 && (
                      <div className="px-3 py-8 text-center text-[12px] text-muted-foreground">
                        {t("No approvers yet — search above to add one.", "لا يوجد معتمدون — ابحث أعلاه لإضافة معتمد.")}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11.5px] text-muted-foreground">
                    <span>{t("Drag and drop to reorder", "اسحب وأفلت لإعادة الترتيب")}</span>
                    <span>{t(`Showing ${level.approvers.length} of ${level.approvers.length}`, `عرض ${level.approvers.length} من ${level.approvers.length}`)}</span>
                  </div>

                  <div className="flex justify-end gap-2 border-t border-border/60 pt-4">
                    <Button variant="outline" onClick={() => setOpenLevel(null)}>{t("Cancel", "إلغاء")}</Button>
                    <Button onClick={() => setOpenLevel(null)}>{t("Done", "تم")}</Button>
                  </div>
                </div>
              </Card>
            ) : (
              <>
                {/* rule summary */}
                <Card className="ring-1 ring-foreground/10">
                  <div className="border-b border-border/60 px-5 py-4 text-[14px] font-semibold">{t("Rule Summary", "ملخّص القاعدة")}</div>
                  <div className="space-y-3.5 p-5 text-[12.5px]">
                    {[
                      [t("Rule Name", "اسم القاعدة"), isAr ? draft.nameAr : draft.name],
                      [t("Conditions", "الشروط"), t(`${draft.conditions.length} conditions defined`, `${draft.conditions.length} شروط محدّدة`)],
                      [t("Levels", "المستويات"), t(`${draft.levels.length} approval levels`, `${draft.levels.length} مستويات اعتماد`)],
                      [t("Created By", "أنشأها"), draft.createdBy],
                      [t("Created On", "تاريخ الإنشاء"), draft.createdOn],
                      [t("Last Updated", "آخر تحديث"), draft.updatedOn],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">{k}</div>
                        <div className="mt-0.5 font-medium">{v}</div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* workflow diagram */}
                <Card className="ring-1 ring-foreground/10">
                  <div className="border-b border-border/60 px-5 py-4 text-[14px] font-semibold">{t("Workflow Diagram", "مخطّط المسار")}</div>
                  <div className="space-y-2 p-5">
                    {draft.levels.map((l, i) => (
                      <React.Fragment key={l.id}>
                        <div className="rounded-xl border border-primary/25 bg-primary/[0.06] px-4 py-3 text-center">
                          <div className="text-[12.5px] font-semibold">{isAr ? l.nameAr : l.name}</div>
                          <div className="mt-0.5 text-[11px] text-muted-foreground">
                            {l.criteria === "any" ? t("Any one approver", "يكفي معتمد واحد") : t("All approvers", "جميع المعتمدين")}
                            {" · "}
                            {l.type === "serial" ? t("Serial", "تسلسلي") : t("Parallel", "متوازٍ")}
                          </div>
                        </div>
                        {i < draft.levels.length - 1 && (
                          <div className="flex justify-center text-muted-foreground/50">↓</div>
                        )}
                      </React.Fragment>
                    ))}
                    <div className="flex justify-center text-muted-foreground/50">↓</div>
                    <div className="flex items-center justify-center gap-2 text-[12.5px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <Check className="size-4" />{t("Publish", "نشر")}
                    </div>
                  </div>
                </Card>

                {/* notes */}
                <Card className="ring-1 ring-foreground/10">
                  <div className="border-b border-border/60 px-5 py-4 text-[14px] font-semibold">
                    {t("Notes", "ملاحظات")} <span className="text-[11.5px] font-normal text-muted-foreground">({t("Optional", "اختياري")})</span>
                  </div>
                  <div className="p-4">
                    <Textarea
                      rows={4} maxLength={500} value={draft.notes}
                      onChange={(e) => set({ notes: e.target.value })}
                      placeholder={t("Add notes about this rule…", "أضف ملاحظات حول هذه القاعدة…")}
                    />
                    <div className="mt-1 text-end text-[11px] text-muted-foreground">{draft.notes.length} / 500</div>
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
