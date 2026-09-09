import * as React from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { Button, Card, Input, Textarea } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import { ArrowLeft, Check } from "lucide-react"

import { MANAGER, team } from "../data/team"
import {
  addProject, getProjectById, nextProjectCode, newProjectId,
  STATUS_LABEL, type ProjectStatus, updateProject,
} from "../data/projects"

const STATUSES: ProjectStatus[] = ["planned", "active", "on-hold", "done"]

const pretty = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""

/** Create or edit a project. A full routed page, not a dialog. */
export default function ProjectEditorPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const { id } = useParams()
  const [params] = useSearchParams()

  const existing = id ? getProjectById(id) : undefined
  const editing = !!existing

  const [code] = React.useState(existing?.code ?? nextProjectCode())
  const [name, setName] = React.useState(existing?.name ?? "")
  const [nameAr, setNameAr] = React.useState(existing?.nameAr ?? "")
  const [ownerId, setOwnerId] = React.useState(existing?.ownerId ?? "me")
  const [status, setStatus] = React.useState<ProjectStatus>(existing?.status ?? "active")
  const [startISO, setStartISO] = React.useState(existing?.startISO ?? "2026-09-08")
  const [dueISO, setDueISO] = React.useState(existing?.dueISO ?? "2026-12-31")
  const [description, setDescription] = React.useState(existing?.description ?? "")

  /** Where to go back to — the picker sends people here mid-task. */
  const from = params.get("from")
  const back = editing ? `/projects/${id}` : from === "task" ? "/tasks/new" : "/projects"

  const canSave = name.trim() !== "" && dueISO !== "" && startISO <= dueISO

  const owner = ownerId === "me"
    ? { ownerId: "me", owner: MANAGER.name, ownerAr: MANAGER.nameAr }
    : (() => {
        const m = team.find((x) => x.id === ownerId)!
        return { ownerId: m.id, owner: m.name, ownerAr: m.nameAr }
      })()

  const save = () => {
    if (!canSave) return
    const fields = {
      code,
      name: name.trim(),
      nameAr: nameAr.trim() || name.trim(),
      ...owner,
      status,
      start: pretty(startISO), startISO,
      due: pretty(dueISO), dueISO,
      description: description.trim() || undefined,
      descriptionAr: description.trim() || undefined,
    }
    if (editing) { updateProject(existing.id, fields); navigate(`/projects/${existing.id}`) }
    else {
      const newId = newProjectId()
      addProject({ id: newId, ...fields })
      navigate(`/projects/${newId}`)
    }
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
          <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />
          {editing ? t("Back to the project", "العودة إلى المشروع") : t("Back to projects", "العودة إلى المشاريع")}
        </button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(back)}>{t("Cancel", "إلغاء")}</Button>
          <Button disabled={!canSave} onClick={save}>
            <Check className="size-4" />
            {editing ? t("Save changes", "حفظ التغييرات") : t("Create project", "إنشاء المشروع")}
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          {editing ? t("Edit project", "تعديل المشروع") : t("New project", "مشروع جديد")}
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {t(`Reference ${code} is reserved for this project. Tasks are filed against it and keep its name.`,
             `الرقم المرجعي ${code} محجوز لهذا المشروع، وتُسجَّل المهام تحته.`)}
        </p>
      </div>

      <Card className="p-5">
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-[8rem_minmax(0,1fr)]">
            <div>
              {label(t("Reference", "الرقم المرجعي"))}
              <Input value={code} readOnly className="tabular-nums text-muted-foreground" />
            </div>
            <div>
              {label(t("Project name", "اسم المشروع"))}
              <Input value={name} onChange={(e) => setName(e.target.value)}
                     placeholder={t("What is this project called?", "ما اسم هذا المشروع؟")} />
            </div>
          </div>

          <div>
            {label(t("Name in Arabic", "الاسم بالعربية"))}
            <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} dir="rtl"
                   placeholder={t("Optional — falls back to the English name", "اختياري — يُستخدم الاسم الإنجليزي إن تُرك فارغًا")} />
          </div>

          <div>
            {label(t("Owner", "المالك"))}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button" onClick={() => setOwnerId("me")}
                className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[12.5px] font-medium transition-colors",
                  ownerId === "me" ? "border-primary/40 bg-primary/12 text-primary" : "border-border text-muted-foreground hover:bg-muted/40")}
              >
                {t("Me", "أنا")} · {isAr ? MANAGER.nameAr : MANAGER.name}
              </button>
              {team.map((m) => (
                <button
                  key={m.id} type="button" onClick={() => setOwnerId(m.id)}
                  className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[12.5px] font-medium transition-colors",
                    ownerId === m.id ? "border-primary/40 bg-primary/12 text-primary" : "border-border text-muted-foreground hover:bg-muted/40")}
                >
                  <span className="flex size-5 items-center justify-center rounded-full bg-foreground/[0.06] text-[9.5px] font-semibold text-foreground/70">
                    {m.initials}
                  </span>
                  {isAr ? m.nameAr : m.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              {label(t("Starts", "يبدأ"))}
              <Input type="date" value={startISO} onChange={(e) => setStartISO(e.target.value)} />
            </div>
            <div>
              {label(t("Target completion", "الاستكمال المستهدف"))}
              <Input type="date" value={dueISO} onChange={(e) => setDueISO(e.target.value)} />
            </div>
          </div>

          {startISO > dueISO && (
            <p className="text-[12px] font-medium text-rose-500">
              {t("The target date is before the start date.", "تاريخ الاستكمال قبل تاريخ البدء.")}
            </p>
          )}

          <div>
            {label(t("Status", "الحالة"))}
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map((st) => (
                <button
                  key={st} type="button" onClick={() => setStatus(st)}
                  className={cn("rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                    status === st ? "border-primary/40 bg-primary/12 text-primary" : "border-border text-muted-foreground hover:bg-muted/40")}
                >
                  {isAr ? STATUS_LABEL[st].ar : STATUS_LABEL[st].en}
                </button>
              ))}
            </div>
          </div>

          <div>
            {label(t("Description", "الوصف"))}
            <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
                      placeholder={t("What this project covers.", "ما الذي يغطيه هذا المشروع.")} />
          </div>
        </div>
      </Card>
    </main>
  )
}
