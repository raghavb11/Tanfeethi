import * as React from "react"
import { useNavigate } from "react-router-dom"
import {
  Avatar, AvatarFallback, Badge, Button, Card, Input, Textarea,
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@reach/shared-ui"
import { useShell } from "@reach/shell-context"
import { cn } from "@reach/shared-core"
import { Check, ChevronDown, Clock3, ExternalLink, FileText, HelpCircle, History, LifeBuoy, Link2, MessageSquare, MessageSquareWarning, Pencil, Plus, Search, Tags, ThumbsDown, ThumbsUp, Trash2 } from "lucide-react"

import { CategoryBadge, PageHeader, RICH_PROSE, StatCard } from "./_ui"
import { addFaqFeedback, deleteFaq, resolveFaqFeedback, setFaqVote, useFaqs } from "../data/faqs"
import { findCategory, useCategories } from "../data/faqCategories"
import { TYPE_STYLE, useDocuments } from "../data/documents"
import { CURRENT_USER } from "../data/currentUser"
import { logAudit } from "../data/audit"

const VOTES_KEY = "reach.faqvotes"
type Vote = "up" | "down"

export default function FAQsPage() {
  const { locale, role } = useShell()
  const isAr = locale === "ar"
  const isAdmin = role === "admin"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const [q, setQ] = React.useState("")
  const [cat, setCat] = React.useState("All")
  const [open, setOpen] = React.useState<string | null>("f1")
  const [confirmId, setConfirmId] = React.useState<string | null>(null)

  const items = useFaqs()
  const docs = useDocuments()
  const cats = useCategories()
  const confirmItem = items.find((f) => f.id === confirmId)
  const catNames = ["All", ...cats.map((c) => c.name)]
  const catLabel = (name: string) => (name === "All" ? t("All", "الكل") : (isAr ? findCategory(cats, name)?.nameAr ?? name : name))

  const [votes, setVotes] = React.useState<Record<string, Vote>>(() => {
    try { return JSON.parse(localStorage.getItem(VOTES_KEY) || "{}") } catch { return {} }
  })
  const [feedbackFor, setFeedbackFor] = React.useState<string | null>(null)
  const [fbText, setFbText] = React.useState("")
  const [thanked, setThanked] = React.useState<string | null>(null)

  const myFeedback = (f: (typeof items)[number]) => (f.feedback ?? []).filter((fb) => fb.userId === CURRENT_USER.id)
  const myPending = (f: (typeof items)[number]) => myFeedback(f).some((fb) => !fb.resolved)

  const vote = (id: string, next: Vote) => {
    const prev = votes[id] ?? null
    const resolved: Vote | null = prev === next ? null : next
    setFaqVote(id, prev, resolved)
    setVotes((v) => {
      const n = { ...v }
      if (resolved) n[id] = resolved
      else delete n[id]
      try { localStorage.setItem(VOTES_KEY, JSON.stringify(n)) } catch { /**/ }
      return n
    })
    if (resolved === "down") {
      const f = items.find((x) => x.id === id)
      if (f && !myPending(f)) { setFeedbackFor(id); setThanked(null) } // one open feedback per user at a time
    } else if (feedbackFor === id) setFeedbackFor(null)
  }
  const sendFeedback = (id: string) => {
    const text = fbText.trim()
    if (!text) return
    addFaqFeedback(id, { userId: CURRENT_USER.id, who: CURRENT_USER.who, initials: CURRENT_USER.initials, text })
    setFbText("")
    setFeedbackFor(null)
    setThanked(id)
  }
  const openLink = (url: string) => { if (url.startsWith("/")) navigate(url); else window.open(url, "_blank", "noopener,noreferrer") }

  const list = items.filter(
    (f) => (cat === "All" || (f.categories ?? []).includes(cat)) &&
      (q === "" || (isAr ? f.qAr : f.q).toLowerCase().includes(q.toLowerCase()) || (isAr ? f.aAr : f.a).toLowerCase().includes(q.toLowerCase())),
  )
  const totalFeedback = items.reduce((s, f) => s + (f.feedback?.length ?? 0), 0)

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        icon={HelpCircle}
        eyebrow={t("Help Center", "مركز المساعدة")}
        title={t("Frequently asked questions", "الأسئلة الشائعة")}
        desc={t("Quick answers to the questions employees ask most — search, or browse by topic.", "إجابات سريعة لأكثر الأسئلة تكرارًا لدى الموظفين — ابحث أو تصفّح حسب الموضوع.")}
        action={isAdmin ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="lg" onClick={() => navigate("/admin/faq-categories")}><Tags className="size-4" />{t("Manage topics", "إدارة المواضيع")}</Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/admin/audit?module=FAQs")}><History className="size-4" />{t("Audit log", "سجل التدقيق")}</Button>
            <Button size="lg" onClick={() => navigate("/faqs/new")}><Plus className="size-4" />{t("Add FAQ", "إضافة سؤال")}</Button>
          </div>
        ) : undefined}
      />

      {isAdmin && (
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={HelpCircle} value={String(items.length)} label={t("Answers", "إجابات")} />
          <StatCard icon={ThumbsUp} value={String(items.reduce((s, f) => s + f.upvotes, 0))} label={t("Upvotes", "تصويت مؤيد")} />
          <StatCard icon={ThumbsDown} value={String(items.reduce((s, f) => s + f.downvotes, 0))} label={t("Downvotes", "تصويت معارض")} />
          <StatCard icon={MessageSquareWarning} value={String(totalFeedback)} label={t("Feedback", "ملاحظات")} sub={t("to review", "للمراجعة")} />
        </div>
      )}

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute start-4 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search questions…", "ابحث في الأسئلة…")} className="h-12 ps-11 text-[15px]" />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {catNames.map((c) => {
          const def = c === "All" ? undefined : findCategory(cats, c)
          const active = cat === c
          return (
            <button key={c} onClick={() => setCat(c)} aria-pressed={active} className={cn("inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors", active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground")}>
              {def && <span className="size-2 rounded-full" style={{ backgroundColor: def.color }} />}
              {catLabel(c)}
            </button>
          )
        })}
      </div>

      <div className="space-y-2.5">
        {list.map((f) => {
          const isOpen = open === f.id
          const myVote = votes[f.id]
          const fcats = f.categories ?? []
          const rdocs = (f.relatedDocs ?? []).map((did) => docs.find((d) => d.id === did)).filter(Boolean)
          return (
            <Card key={f.id} className="overflow-hidden py-0 transition-colors hover:border-primary/40">
              <div className="flex items-center">
                <button onClick={() => setOpen(isOpen ? null : f.id)} aria-expanded={isOpen} className="flex min-w-0 flex-1 items-center gap-3 px-5 py-4 text-start">
                  <span className="min-w-0 flex-1"><span className="block font-medium leading-snug">{isAr ? f.qAr : f.q}</span></span>
                  <span className="hidden shrink-0 items-center gap-1.5 sm:flex">
                    {fcats.slice(0, 2).map((c) => <CategoryBadge key={c} label={catLabel(c)} color={findCategory(cats, c)?.color} />)}
                    {fcats.length > 2 && <Badge variant="outline">+{fcats.length - 2}</Badge>}
                  </span>
                  <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180 text-primary")} />
                </button>
                {isAdmin && (
                  <div className="flex shrink-0 gap-1 pe-3">
                    <Button variant="ghost" size="icon-sm" aria-label={t("Edit", "تحرير")} onClick={() => navigate(`/faqs/edit/${f.id}`)}><Pencil className="size-4" /></Button>
                    <Button variant="ghost" size="icon-sm" aria-label={t("Delete", "حذف")} className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setConfirmId(f.id)}><Trash2 className="size-4" /></Button>
                  </div>
                )}
              </div>

              {isOpen && (
                <div className="space-y-4 border-t border-border/70 px-5 py-4">
                  <div className={RICH_PROSE} dir={isAr ? "rtl" : "ltr"} dangerouslySetInnerHTML={{ __html: isAr ? f.aAr : f.a }} />

                  {rdocs.length > 0 && (
                    <div>
                      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60">{t("Related documents", "مستندات ذات صلة")}</div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {rdocs.map((d) => d && (
                          <button key={d.id} onClick={() => navigate(`/documents/${d.id}`)} className="flex items-center gap-2.5 rounded-lg border border-border bg-[var(--card-elevated)] px-3 py-2 text-start text-sm transition-colors hover:border-primary/50">
                            <span className={cn("flex size-7 shrink-0 items-center justify-center rounded text-[9px] font-bold text-white", TYPE_STYLE[d.type])}>{d.type}</span>
                            <span className="min-w-0 flex-1 truncate">{isAr ? d.nameAr : d.name}</span>
                            <FileText className="size-3.5 shrink-0 text-muted-foreground" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {(f.relatedLinks?.length ?? 0) > 0 && (
                    <div>
                      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60">{t("Related links", "روابط ذات صلة")}</div>
                      <div className="flex flex-col gap-1.5">
                        {f.relatedLinks.map((l, i) => (
                          <button key={i} onClick={() => openLink(l.url)} className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                            <Link2 className="size-3.5" />{l.label}{!l.url.startsWith("/") && <ExternalLink className="size-3" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 border-t border-border/60 pt-3">
                    <span className="text-xs text-muted-foreground">{t("Was this helpful?", "هل كان هذا مفيدًا؟")}</span>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => vote(f.id, "up")} aria-pressed={myVote === "up"} className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors", myVote === "up" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground")}>
                        <ThumbsUp className="size-3.5" />{f.upvotes}
                      </button>
                      <button onClick={() => vote(f.id, "down")} aria-pressed={myVote === "down"} className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors", myVote === "down" ? "border-destructive bg-destructive/10 text-destructive" : "border-border text-muted-foreground hover:border-destructive/60 hover:text-destructive")}>
                        <ThumbsDown className="size-3.5" />{f.downvotes}
                      </button>
                    </div>
                    {thanked === f.id && <span className="text-xs text-primary">{t("Thanks — we'll use this to improve.", "شكرًا — سنستخدم هذا للتحسين.")}</span>}
                    {thanked !== f.id && !isAdmin && myPending(f) && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock3 className="size-3" />{t("You've sent feedback — pending review.", "أرسلت ملاحظة — قيد المراجعة.")}</span>}
                  </div>

                  {feedbackFor === f.id && !myPending(f) && (
                    <div className="rounded-xl border border-destructive/30 bg-destructive/[0.04] p-3">
                      <label htmlFor={`fb-${f.id}`} className="mb-1.5 block text-xs font-medium text-foreground">{t("What was missing or wrong? (optional — helps admins improve it)", "ما الذي كان ناقصًا أو خاطئًا؟ (اختياري — يساعد المشرفين على التحسين)")}</label>
                      <Textarea id={`fb-${f.id}`} rows={2} value={fbText} onChange={(e) => setFbText(e.target.value)} placeholder={t("Tell us how to make this answer better…", "أخبرنا كيف نحسّن هذه الإجابة…")} dir={isAr ? "rtl" : "ltr"} />
                      <div className="mt-2 flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setFeedbackFor(null)}>{t("Skip", "تخطٍ")}</Button>
                        <Button size="sm" disabled={!fbText.trim()} onClick={() => sendFeedback(f.id)}><MessageSquare className="size-3.5" />{t("Send feedback", "إرسال")}</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* admin: all improvement feedback — permanent panel with per-item resolve. */}
              {isAdmin && (f.feedback?.length ?? 0) > 0 && (
                <div className="border-t border-border/70 bg-[#99631a]/[0.04] px-5 py-4 dark:bg-[#d6a94a]/[0.05]">
                  <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#99631a] dark:text-[#d6a94a]">
                    <MessageSquareWarning className="size-3.5" />{t("Improvement feedback", "ملاحظات التحسين")} ({f.feedback.filter((fb) => !fb.resolved).length} {t("open", "مفتوحة")})
                  </div>
                  <div className="space-y-2">
                    {f.feedback.map((fb) => (
                      <div key={fb.id} className={cn("flex gap-2.5 rounded-lg px-3 py-2.5", fb.resolved ? "bg-muted/40 opacity-70" : "bg-[var(--card-elevated)]")}>
                        <Avatar className="size-7 shrink-0"><AvatarFallback className="bg-muted text-[10px] font-semibold">{fb.initials}</AvatarFallback></Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-medium">{fb.who}</span>
                            <span className="text-muted-foreground">· {fb.time}</span>
                            {fb.resolved && <Badge variant="outline" className="gap-1 text-[10px]"><Check className="size-2.5" />{t("Resolved", "تم الحل")}</Badge>}
                          </div>
                          <p className={cn("mt-0.5 text-sm", fb.resolved ? "text-muted-foreground line-through" : "text-foreground/85")}>{fb.text}</p>
                        </div>
                        {!fb.resolved && <Button variant="ghost" size="sm" className="shrink-0" onClick={() => resolveFaqFeedback(f.id, fb.id)}><Check className="size-3.5" />{t("Resolve", "حلّ")}</Button>}
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate(`/faqs/edit/${f.id}`)}><Pencil className="size-3.5" />{t("Improve this answer", "حسّن هذه الإجابة")}</Button>
                </div>
              )}

              {/* user: only their OWN submitted feedback, with status. */}
              {!isAdmin && myFeedback(f).length > 0 && (
                <div className="border-t border-border/70 bg-muted/20 px-5 py-3">
                  <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60">{t("Your feedback", "ملاحظتك")}</div>
                  {myFeedback(f).map((fb) => (
                    <div key={fb.id} className="flex items-start gap-2 text-sm">
                      {fb.resolved
                        ? <Badge variant="outline" className="mt-0.5 gap-1 text-[10px] text-[#16833e] dark:text-[#5bbd7e]"><Check className="size-2.5" />{t("Resolved", "تم الحل")}</Badge>
                        : <Badge variant="outline" className="mt-0.5 gap-1 text-[10px]"><Clock3 className="size-2.5" />{t("Pending", "قيد المراجعة")}</Badge>}
                      <p className="min-w-0 flex-1 text-foreground/85">{fb.text} <span className="text-xs text-muted-foreground">· {fb.time}</span></p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )
        })}
        {list.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border py-14 text-center">
            <HelpCircle className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">{t("No questions match your search.", "لا توجد أسئلة مطابقة لبحثك.")}</p>
          </div>
        )}
      </div>

      <Card className="mt-8 flex flex-row flex-wrap items-center gap-4 p-5">
        <div className="accent-chip flex size-11 shrink-0 items-center justify-center rounded-xl"><LifeBuoy className="size-5" /></div>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-[17px] font-semibold">{t("Still need help?", "ما زلت بحاجة للمساعدة؟")}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{t("Raise a request and the right team will get back to you.", "قدّم طلبًا وسيتواصل معك الفريق المختص.")}</p>
        </div>
        <Button className="shrink-0"><MessageSquare className="size-4" />{t("Contact support", "تواصل مع الدعم")}</Button>
      </Card>

      <Dialog open={!!confirmId} onOpenChange={(o) => !o && setConfirmId(null)}>
        {confirmItem && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>{t("Delete this FAQ?", "حذف هذا السؤال؟")}</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">{t("Employees will no longer see this question. This can't be undone.", "لن يرى الموظفون هذا السؤال بعد الآن. لا يمكن التراجع.")}</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmId(null)}>{t("Cancel", "إلغاء")}</Button>
              <Button className="bg-destructive text-white hover:bg-destructive/90" onClick={() => { deleteFaq(confirmItem.id); logAudit("deleted", confirmItem.q, "FAQs"); setConfirmId(null) }}><Trash2 className="size-4" />{t("Delete", "حذف")}</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </main>
  )
}
