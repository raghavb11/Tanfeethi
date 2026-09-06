import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { Badge, Card, Input } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import { ArrowRight, ChevronRight, GitBranch, History, Layers, Search } from "lucide-react"

import { fieldById, optionLabel, useRuleAudit, useRules } from "../data/rules"

/** The rules list — every approval rule the engine knows about. */
export default function RuleEngineListPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const all = useRules().filter((r) => !r.archived)
  const audit = useRuleAudit()
  const [q, setQ] = React.useState("")
  const [only, setOnly] = React.useState<"all" | "active" | "inactive">("all")

  const rules = all.filter((r) => {
    if (only === "active" && !r.active) return false
    if (only === "inactive" && r.active) return false
    const s = q.trim().toLowerCase()
    return !s || r.name.toLowerCase().includes(s) || r.nameAr.includes(q.trim())
  })

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-7 md:px-8">
      <nav className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-muted-foreground">
        <Link to="/config" className="hover:text-foreground">{t("Configuration", "الإعدادات")}</Link>
        <ChevronRight className={cn("size-3.5", isAr && "rotate-180")} />
        <span className="font-medium text-foreground">{t("Approval Rule Engine", "محرك قواعد الاعتماد")}</span>
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1.5">
          <h1 className="text-[22px] font-bold tracking-tight md:text-[26px]">{t("Approval Rule Engine", "محرك قواعد الاعتماد")}</h1>
          <p className="max-w-3xl text-[13px] text-muted-foreground">
            {t("Rules decide what needs approval, who approves it and in what order.",
               "تحدّد القواعد ما الذي يحتاج اعتمادًا ومن يعتمده وبأي ترتيب.")}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search rules…", "ابحث في القواعد…")} className="ps-9" />
        </div>
        <div className="flex gap-1.5">
          {([
            ["all", t("All", "الكل")],
            ["active", t("Active", "نشطة")],
            ["inactive", t("Inactive", "غير نشطة")],
          ] as const).map(([k, label]) => (
            <button
              key={k} type="button" onClick={() => setOnly(k)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors",
                only === k ? "border-primary/40 bg-primary/12 text-primary" : "border-border/60 text-muted-foreground hover:bg-muted/40",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-8">
          {rules.map((r) => (
            <Card key={r.id} className="ring-1 ring-foreground/10 transition-colors hover:border-primary/30">
              <button
                type="button" onClick={() => navigate(`/config/rules/${r.id}`)}
                className="flex w-full flex-wrap items-start justify-between gap-4 px-5 py-4 text-start"
              >
                <div className="flex min-w-0 gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
                    <GitBranch className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[14px] font-semibold">{isAr ? r.nameAr : r.name}</span>
                      <Badge
                        variant="outline"
                        className={cn("text-[10.5px]", r.active
                          ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "text-muted-foreground")}
                      >
                        {r.active ? t("Active", "نشطة") : t("Inactive", "غير نشطة")}
                      </Badge>
                    </div>
                    <p className="mt-1 max-w-2xl text-[12px] text-muted-foreground">{isAr ? r.descriptionAr : r.description}</p>

                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {r.conditions.slice(0, 3).map((c) => (
                        <span key={c.id} className="rounded-full border border-border/60 bg-muted/25 px-2.5 py-1 text-[11px] text-muted-foreground">
                          {isAr ? fieldById(c.field).labelAr : fieldById(c.field).label}
                          {": "}
                          {c.values.map((v) => optionLabel(c.field, v, isAr)).join(", ") || "—"}
                        </span>
                      ))}
                      {r.conditions.length > 3 && (
                        <span className="rounded-full border border-border/60 bg-muted/25 px-2.5 py-1 text-[11px] text-muted-foreground">
                          +{r.conditions.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-5">
                  <div className="text-center">
                    <div className="text-[18px] font-bold leading-none tabular-nums">{r.levels.length}</div>
                    <div className="mt-1 text-[10.5px] text-muted-foreground">{t("Levels", "مستويات")}</div>
                  </div>
                  <div className="hidden text-end sm:block">
                    <div className="text-[11px] text-muted-foreground">{t("Updated", "آخر تحديث")}</div>
                    <div className="text-[12px] font-medium">{r.updatedOn}</div>
                  </div>
                  <ArrowRight className={cn("size-4 text-muted-foreground/40", isAr && "rotate-180")} />
                </div>
              </button>
            </Card>
          ))}

          {rules.length === 0 && (
            <Card className="ring-1 ring-foreground/10">
              <div className="px-5 py-12 text-center">
                <Layers className="mx-auto size-8 text-muted-foreground/40" />
                <p className="mt-3 text-[13px] text-muted-foreground">{t("No rules match that.", "لا توجد قواعد مطابقة.")}</p>
              </div>
            </Card>
          )}
        </div>

        <div className="lg:col-span-4">
          <Card className="ring-1 ring-foreground/10">
            <div className="flex items-center gap-2.5 border-b border-border/60 px-5 py-4">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/12 text-primary"><History className="size-4" /></span>
              <div>
                <div className="text-[13px] font-semibold">{t("Rule activity", "نشاط القواعد")}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground/65">{t("Every change is recorded", "يتم تسجيل كل تغيير")}</div>
              </div>
            </div>
            <div className="max-h-[520px] divide-y divide-border/50 overflow-y-auto">
              {audit.map((a) => (
                <div key={a.id} className="px-5 py-3">
                  <div className="text-[12.5px]">
                    <span className="font-semibold capitalize">{a.action}</span> — {a.target}
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground/65">{a.who} · {a.time}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
