import * as React from "react"
import { Avatar, AvatarFallback, Badge, Button, Card, Input, Textarea } from "@reach/shared-ui"
import { useShell } from "@reach/shell-context"
import { cn } from "@reach/shared-core"
import { BarChart3, CheckCircle2, Heart, ImagePlus, MessageCircle, Plus, Send, Sparkles, Star, Users, X } from "lucide-react"

import { PageHeader, StatCard } from "./_ui"
import { createCollection, newId } from "../collections"
import { CURRENT_USER } from "../data/currentUser"

type PollOption = { id: string; text: string; votes: number }
type Post = {
  id: string
  author: string
  authorAr: string
  initials: string
  team: string
  time: string
  body: string
  bodyAr: string
  likes: number
  comments: number
  featured?: boolean
  tint?: string
  img?: string
  poll?: { options: PollOption[] }
}

type Comment = { id: string; who: string; initials: string; text: string; time: string }

const POSTS: Post[] = [
  { id: "p1", author: "Sara Al-Mutairi", authorAr: "سارة المطيري", initials: "SM", team: "Operations", time: "2h", body: "Proud of the team — we hit 68% on the terminal expansion ahead of schedule! 🏗️", bodyAr: "فخورة بالفريق — أنجزنا ٦٨٪ من توسعة المبنى قبل الموعد!", likes: 84, comments: 12, featured: true, img: "images/cms/celebrate.jpg" },
  { id: "p2", author: "Ahmed Hassan", authorAr: "أحمد حسن", initials: "AH", team: "People Ops", time: "5h", body: "Welcome to our 14 new joiners this month! Say hi 👋", bodyAr: "أهلًا بـ ١٤ زميلًا جديدًا هذا الشهر!", likes: 156, comments: 34, img: "images/cms/teamwork.jpg" },
  { id: "p3", author: "Layan Al Marwani", authorAr: "ليان المرواني", initials: "LM", team: "Digital", time: "1d", body: "Where should we host this year's team offsite? Vote below 👇", bodyAr: "أين نقيم رحلة الفريق هذا العام؟ صوّت أدناه 👇", likes: 92, comments: 21, poll: { options: [
    { id: "o1", text: "Mountain retreat", votes: 34 },
    { id: "o2", text: "Beach resort", votes: 51 },
    { id: "o3", text: "City staycation", votes: 18 },
    { id: "o4", text: "Desert camp", votes: 27 },
  ] } },
  { id: "p4", author: "Mohammad Iqbal", authorAr: "محمد إقبال", initials: "MI", team: "IT", time: "2d", body: "Reminder: phishing-awareness drill results are published in the Trust Center.", bodyAr: "تذكير: نتائج اختبار التوعية بالتصيّد منشورة في مركز الثقة.", likes: 41, comments: 6 },
]

const SAMPLE_COMMENTS: Record<string, Comment[]> = {
  p1: [
    { id: "c1", who: "Ahmed Hassan", initials: "AH", text: "Incredible work — congrats to the whole crew! 🎉", time: "1h" },
    { id: "c2", who: "Noura Saleh", initials: "NS", text: "Ahead of schedule is no small thing. Well done 👏", time: "40m" },
  ],
  p2: [
    { id: "c3", who: "Layan Al Marwani", initials: "LM", text: "Welcome everyone! 👋", time: "3h" },
  ],
  p3: [
    { id: "c4", who: "Sara Al-Mutairi", initials: "SM", text: "Beach resort for me ☀️", time: "20h" },
  ],
}

const CHAR_LIMIT = 500
const store = createCollection<Post>(POSTS, "community")

export default function CommunityPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)

  const posts = store.use()
  const [liked, setLiked] = React.useState<Set<string>>(new Set())
  const [draft, setDraft] = React.useState("")

  // poll composer
  const [pollMode, setPollMode] = React.useState(false)
  const [pollOptions, setPollOptions] = React.useState<string[]>(["", ""])

  // in-feed poll voting
  const [pollVotes, setPollVotes] = React.useState<Record<string, string>>({})

  // comments
  const [openComments, setOpenComments] = React.useState<Set<string>>(new Set())
  const [extraComments, setExtraComments] = React.useState<Record<string, Comment[]>>({})
  const [commentDraft, setCommentDraft] = React.useState<Record<string, string>>({})

  const remaining = CHAR_LIMIT - draft.length
  const validPoll = pollOptions.filter((o) => o.trim()).length >= 2
  const canPost = draft.trim().length > 0 && draft.length <= CHAR_LIMIT && (!pollMode || validPoll)

  const post = () => {
    const body = draft.trim()
    if (!canPost) return
    const poll = pollMode && validPoll
      ? { options: pollOptions.filter((o) => o.trim()).map((text, i) => ({ id: `o${i + 1}`, text: text.trim(), votes: 0 })) }
      : undefined
    store.add({
      id: newId("post"), author: CURRENT_USER.name, authorAr: CURRENT_USER.name, initials: CURRENT_USER.initials,
      team: t("You", "أنت"), time: t("now", "الآن"), body, bodyAr: body, likes: 0, comments: 0, poll,
    })
    setDraft(""); setPollMode(false); setPollOptions(["", ""])
  }

  const setOption = (i: number, v: string) => setPollOptions((o) => o.map((x, idx) => (idx === i ? v : x)))
  const addOption = () => setPollOptions((o) => (o.length < 4 ? [...o, ""] : o))
  const removeOption = (i: number) => setPollOptions((o) => (o.length > 2 ? o.filter((_, idx) => idx !== i) : o))

  const toggleComments = (id: string) => setOpenComments((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const commentsFor = (id: string): Comment[] => [...(SAMPLE_COMMENTS[id] ?? []), ...(extraComments[id] ?? [])]
  const commentCount = (p: Post) => p.comments + (extraComments[p.id]?.length ?? 0)
  const addComment = (id: string) => {
    const text = (commentDraft[id] ?? "").trim()
    if (!text) return
    setExtraComments((m) => ({ ...m, [id]: [...(m[id] ?? []), { id: newId("cmt"), who: CURRENT_USER.who, initials: CURRENT_USER.initials, text, time: t("now", "الآن") }] }))
    setCommentDraft((m) => ({ ...m, [id]: "" }))
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        icon={Users}
        eyebrow={t("Employee Community", "مجتمع الموظفين")}
        title={t("Share, celebrate, connect", "شارك، احتفِ، تواصل")}
        desc={t("A social space for achievements, initiatives and internal posts — with likes, comments and moderation.", "مساحة اجتماعية للإنجازات والمبادرات والمنشورات الداخلية — مع الإعجابات والتعليقات والإشراف.")}
      />

      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatCard icon={Users} value="1.2k" label={t("Members", "الأعضاء")} />
        <StatCard icon={MessageCircle} value="340" label={t("Posts", "منشورات")} sub={t("this month", "هذا الشهر")} />
        <StatCard icon={Sparkles} value="98%" label={t("Positive", "إيجابية")} />
      </div>

      {/* composer */}
      <Card className="mb-6 p-4">
        <div className="flex gap-3">
          <Avatar className="size-9 shrink-0"><AvatarFallback className="bg-primary/15 text-primary text-xs font-bold">{CURRENT_USER.initials}</AvatarFallback></Avatar>
          <div className="flex-1">
            <Textarea value={draft} onChange={(e) => setDraft(e.target.value.slice(0, CHAR_LIMIT))} rows={2} placeholder={pollMode ? t("Ask a question…", "اطرح سؤالًا…") : t("Share something with your colleagues…", "شارك شيئًا مع زملائك…")} className={isAr ? "text-right" : undefined} />

            {/* poll builder */}
            {pollMode && (
              <div className="mt-3 space-y-2 rounded-xl border border-border bg-[var(--card-elevated)] p-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary"><BarChart3 className="size-3.5" />{t("Poll", "تصويت")}</span>
                  <button type="button" onClick={() => { setPollMode(false); setPollOptions(["", ""]) }} className="grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={t("Remove poll", "إزالة التصويت")}><X className="size-4" /></button>
                </div>
                {pollOptions.map((o, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">{i + 1}</span>
                    <Input value={o} onChange={(e) => setOption(i, e.target.value)} placeholder={`${t("Option", "خيار")} ${i + 1}`} className="h-9 flex-1" dir={isAr ? "rtl" : "ltr"} />
                    {pollOptions.length > 2 && <button type="button" onClick={() => removeOption(i)} className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted" aria-label={t("Remove option", "إزالة الخيار")}><X className="size-3.5" /></button>}
                  </div>
                ))}
                {pollOptions.length < 4 && <button type="button" onClick={addOption} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"><Plus className="size-3.5" />{t("Add option", "إضافة خيار")}</button>}
              </div>
            )}

            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" disabled={pollMode}><ImagePlus className="size-4" />{t("Photo", "صورة")}</Button>
                <Button variant={pollMode ? "secondary" : "ghost"} size="sm" onClick={() => setPollMode((v) => !v)}><BarChart3 className="size-4" />{t("Poll", "تصويت")}</Button>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn("text-xs tabular-nums", remaining < 0 ? "text-destructive" : remaining <= 60 ? "text-amber-500" : "text-muted-foreground")}>{remaining}</span>
                <Button size="sm" disabled={!canPost} onClick={post}><Send className="size-4" />{t("Post", "نشر")}</Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* feed */}
      <div className="space-y-4">
        {posts.map((p) => {
          const isLiked = liked.has(p.id)
          const likes = p.likes + (isLiked ? 1 : 0)
          const showComments = openComments.has(p.id)
          const voted = pollVotes[p.id]
          const pollTotal = p.poll ? p.poll.options.reduce((s, o) => s + o.votes, 0) + (voted ? 1 : 0) : 0
          return (
            <Card key={p.id} className="overflow-hidden py-0 gap-0">
              {p.featured && <div className="h-1.5 w-full bg-primary" />}
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="size-9"><AvatarFallback className="bg-muted text-xs font-semibold">{p.initials}</AvatarFallback></Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{isAr ? p.authorAr : p.author}</span>
                      {p.featured && <Badge className="bg-primary/15 text-primary"><Star className="me-1 size-3" />{t("Featured", "مميّز")}</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground">{p.team} · {p.time}</div>
                  </div>
                </div>
                <p className="mt-3 leading-relaxed">{isAr ? p.bodyAr : p.body}</p>

                {p.img && (
                  <div className="relative mt-3 h-44 overflow-hidden rounded-xl bg-muted">
                    <img src={p.img} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none" }} />
                  </div>
                )}

                {/* poll */}
                {p.poll && (
                  <div className="mt-3 space-y-2">
                    {p.poll.options.map((o) => {
                      const count = o.votes + (voted === o.id ? 1 : 0)
                      const pct = pollTotal ? Math.round((count / pollTotal) * 100) : 0
                      if (!voted) {
                        return (
                          <button key={o.id} onClick={() => setPollVotes((v) => ({ ...v, [p.id]: o.id }))} className="w-full rounded-lg border border-border bg-card px-3 py-2 text-start text-sm transition-colors hover:border-primary hover:bg-primary/5">
                            {o.text}
                          </button>
                        )
                      }
                      return (
                        <div key={o.id} className={cn("relative overflow-hidden rounded-lg border px-3 py-2", voted === o.id ? "border-primary" : "border-border")}>
                          <div className="absolute inset-y-0 start-0 bg-primary/10" style={{ width: `${pct}%` }} />
                          <div className="relative flex items-center justify-between text-sm">
                            <span className="inline-flex items-center gap-1.5">{voted === o.id && <CheckCircle2 className="size-3.5 text-primary" />}{o.text}</span>
                            <span className="tabular-nums text-muted-foreground">{pct}%</span>
                          </div>
                        </div>
                      )
                    })}
                    <p className="text-xs text-muted-foreground">{voted ? t(`${pollTotal} votes · thanks for voting`, `${pollTotal} صوت · شكرًا لمشاركتك`) : t(`${pollTotal} votes · tap an option`, `${pollTotal} صوت · اختر خيارًا`)}</p>
                  </div>
                )}

                <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                  <button onClick={() => setLiked((s) => { const n = new Set(s); n.has(p.id) ? n.delete(p.id) : n.add(p.id); return n })} className={cn("inline-flex items-center gap-1.5 transition-colors hover:text-primary", isLiked && "text-primary")}>
                    <Heart className={cn("size-4", isLiked && "fill-primary")} />{likes}
                  </button>
                  <button onClick={() => toggleComments(p.id)} className={cn("inline-flex items-center gap-1.5 transition-colors hover:text-primary", showComments && "text-primary")}>
                    <MessageCircle className="size-4" />{commentCount(p)}
                  </button>
                </div>

                {/* comments */}
                {showComments && (
                  <div className="mt-3 space-y-3 border-t border-border/70 pt-3">
                    {commentsFor(p.id).length === 0 && <p className="text-xs text-muted-foreground">{t("Be the first to comment.", "كن أول من يعلّق.")}</p>}
                    {commentsFor(p.id).map((c) => (
                      <div key={c.id} className="flex gap-2.5">
                        <Avatar className="size-7 shrink-0"><AvatarFallback className="bg-muted text-[10px] font-semibold">{c.initials}</AvatarFallback></Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="rounded-2xl bg-muted/60 px-3 py-2">
                            <div className="flex items-baseline gap-2">
                              <span className="text-sm font-medium">{c.who}</span>
                              <span className="text-[11px] text-muted-foreground">{c.time}</span>
                            </div>
                            <p className="text-sm leading-relaxed">{c.text}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <Avatar className="size-7 shrink-0"><AvatarFallback className="bg-primary/15 text-primary text-[10px] font-bold">{CURRENT_USER.initials}</AvatarFallback></Avatar>
                      <Input value={commentDraft[p.id] ?? ""} onChange={(e) => setCommentDraft((m) => ({ ...m, [p.id]: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addComment(p.id) } }} placeholder={t("Write a comment…", "اكتب تعليقًا…")} className="h-9 flex-1 rounded-full" dir={isAr ? "rtl" : "ltr"} />
                      <Button size="icon-sm" variant="ghost" disabled={!(commentDraft[p.id] ?? "").trim()} onClick={() => addComment(p.id)} aria-label={t("Send", "إرسال")}><Send className="size-4" /></Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </main>
  )
}
