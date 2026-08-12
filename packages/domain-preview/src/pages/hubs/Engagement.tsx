import * as React from "react"
import { motion } from "framer-motion"

import { Avatar, AvatarFallback, Badge, Button, Card, Input } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import {
  Cake,
  CalendarDays,
  CheckCircle2,
  Hash,
  Heart,
  HeartHandshake,
  Image as ImageIcon,
  MapPin,
  MessageCircle,
  Send,
  Smile,
  Sparkles,
  Vote,
} from "lucide-react"

const ar = {
  hubLabel: "مشاركة",
  pageTitle: "مركز المشاركة",
  pageDesc: "منشورات، تقدير، استطلاعات، ولحظات تجمع الفريق.",
  composerPh: "وش في بالك يا خالد؟",
  postUpdate: "نشر",
  giveKudos: "تقدير",
  startPoll: "استطلاع",
  feed: "تدفّق الفريق",
  recognized: "قدّر",
  reactions: "إعجاب",
  comments: "تعليق",
  poll: "استطلاع",
  vote: "صوّت",
  endsIn: (s: string) => `ينتهي ${s}`,
  votedBy: (n: number) => `${n} صوت`,
  online: "متصل الآن",
  events: "قادم",
  rsvp: "أؤكد",
  birthdays: "ميلاد قريب",
  send: "أرسل تهنئة",
  rooms: "غرف الفريق",
  joinRoom: "انضم",
}

type FeedKind = "post" | "kudos"

type FeedItem = {
  id: string
  kind: FeedKind
  time: string
  timeAr: string
  reactions: number
  liked?: boolean
  // post fields
  author?: { name: string; nameAr: string; initials: string; role: string; roleAr: string }
  content?: string
  contentAr?: string
  comments?: number
  // kudos fields
  from?: { name: string; nameAr: string; initials: string }
  to?: { name: string; nameAr: string; initials: string }
  reason?: string
  reasonAr?: string
  emoji?: string
}

const feed: FeedItem[] = [
  {
    id: "f1",
    kind: "post",
    author: { name: "Sara Al-Mutairi", nameAr: "سارة المطيري", initials: "SM", role: "Operations Lead", roleAr: "قائدة العمليات" },
    time: "12 min ago",
    timeAr: "قبل 12 دقيقة",
    content: "Wave 2 review wrapped — huge thanks to the IT cohort for joining live. Decisions log is in the room.",
    contentAr: "خلّصنا مراجعة الموجة الثانية — شكر كبير لفريق التقنية اللي حضر مباشر. سجل القرارات موجود في الغرفة.",
    reactions: 24,
    comments: 6,
    liked: true,
  },
  {
    id: "f2",
    kind: "kudos",
    from: { name: "Maya Chen", nameAr: "مايا تشن", initials: "MC" },
    to: { name: "Rana Ortiz", nameAr: "رنا أورتيز", initials: "RO" },
    reason: "Brilliant work on the brand refresh — leadership loved it.",
    reasonAr: "شغل رائع على تحديث الهوية — أعجب القيادة.",
    time: "1h ago",
    timeAr: "قبل ساعة",
    emoji: "🎨",
    reactions: 24,
  },
  {
    id: "f3",
    kind: "post",
    author: { name: "Ahmed Mohammed", nameAr: "أحمد محمد", initials: "AM", role: "Engineering Manager", roleAr: "مدير الهندسة" },
    time: "2h ago",
    timeAr: "قبل ساعتين",
    content: "Heads up — staging refreshes tonight at 22:00. No action needed; deploys queued automatically.",
    contentAr: "تنبيه — بيئة الاختبار تتحدّث الليلة 22:00. ما يحتاج إجراء.",
    reactions: 18,
    comments: 2,
  },
  {
    id: "f4",
    kind: "kudos",
    from: { name: "Tareq N.", nameAr: "طارق ن.", initials: "TN" },
    to: { name: "Yousef H.", nameAr: "يوسف ه.", initials: "YH" },
    reason: "Picked up the on-call shift last weekend without being asked.",
    reasonAr: "غطّى مناوبة الطوارئ نهاية الأسبوع بدون ما نطلب.",
    time: "Yesterday",
    timeAr: "أمس",
    emoji: "🙌",
    reactions: 31,
  },
]

const activePoll = {
  question: "Which team event should we plan next?",
  questionAr: "أي فعالية فريق نخطّط لها بعدين؟",
  endsIn: "2 days",
  endsInAr: "خلال يومين",
  totalVotes: 84,
  options: [
    { id: "o1", label: "Off-site retreat", labelAr: "خلوة خارجية", votes: 38, emoji: "🏝️" },
    { id: "o2", label: "Hack week", labelAr: "أسبوع ابتكار", votes: 24, emoji: "⚡" },
    { id: "o3", label: "Volunteering day", labelAr: "يوم تطوّع", votes: 14, emoji: "🤝" },
    { id: "o4", label: "Family BBQ", labelAr: "حفل شواء", votes: 8, emoji: "🍖" },
  ],
}

const onlineNow = [
  { initials: "RO", name: "Rana O." },
  { initials: "SP", name: "Sara P." },
  { initials: "JL", name: "Jamal L." },
  { initials: "DA", name: "Dana A." },
  { initials: "TN", name: "Tareq N." },
  { initials: "YH", name: "Yousef H." },
]

const upcomingEvent = {
  title: "Engineering town hall",
  titleAr: "اجتماع الهندسة العام",
  date: "May 14 · 14:00",
  dateAr: "14 مايو · 14:00",
  location: "HQ Auditorium",
  locationAr: "مسرح المقر",
  attendees: 124,
  cover: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&h=240&q=80",
}

const birthdays: { initials: string; name: string; nameAr: string; date: string; dateAr: string }[] = [
  { initials: "RO", name: "Rana Ortiz", nameAr: "رنا أورتيز", date: "Today", dateAr: "اليوم" },
  { initials: "TN", name: "Tareq N.", nameAr: "طارق ن.", date: "Friday", dateAr: "الجمعة" },
]

const rooms: { id: string; name: string; nameAr: string; active: boolean }[] = [
  { id: "r1", name: "Leadership", nameAr: "القيادة", active: true },
  { id: "r2", name: "Wave 2 launch", nameAr: "إطلاق الموجة الثانية", active: true },
  { id: "r3", name: "Coffee corner", nameAr: "ركن القهوة", active: true },
]

export default function EngagementHub() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const [draft, setDraft] = React.useState("")
  const [pollVote, setPollVote] = React.useState<string | null>(null)
  const [likedSet, setLikedSet] = React.useState<Set<string>>(new Set(feed.filter((f) => f.liked).map((f) => f.id)))

  const toggleLike = (id: string) => {
    setLikedSet((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 px-4 py-7 md:px-8">
      {/* Heading */}
      <div className="space-y-1.5">
        <h1 className="text-[22px] font-bold tracking-tight md:text-[26px]">
          {isAr ? ar.pageTitle : "Engagement Hub"}
        </h1>
        <p className="text-[13px] text-muted-foreground">
          {isAr ? ar.pageDesc : "Posts, kudos, polls — everything that connects the team."}
        </p>
      </div>

      {/* Hero — violet/purple box. White input on solid white background = readable placeholder. */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="highlight-card hl-fuchsia relative overflow-hidden rounded-3xl"
      >
        <div className="relative z-10 p-5 md:p-6 space-y-4">
          {/* Greeting line */}
          <div className="flex items-center justify-between gap-3">
            <div className="text-white">
              <div className="text-[10.5px] font-semibold tracking-[0.14em] uppercase text-white/70">
                {isAr ? ar.hubLabel : "Engagement"}
              </div>
              <div className="mt-1 text-[16px] font-bold tracking-tight md:text-[18px]">
                {isAr ? "وش في بالك يا خالد؟" : "What's on your mind, Khalid?"}
              </div>
            </div>
            <Avatar className="size-11 shrink-0 ring-2 ring-white/30 shadow-md">
              <AvatarFallback className="bg-white text-violet-700 text-[13px] font-bold">
                {isAr ? "خ" : "KS"}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Composer — solid white background → placeholder is plainly readable */}
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={isAr ? "اكتب منشورًا أو شارك تقديرًا أو ابدأ استطلاعًا…" : "Write a post, share kudos, or start a poll…"}
            className="h-11 w-full rounded-xl border-0 !bg-white text-[14px] !text-slate-900 placeholder:!text-slate-500 shadow-sm focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-violet-600 dark:!bg-white dark:!text-slate-900 dark:placeholder:!text-slate-500"
            dir={isAr ? "rtl" : "ltr"}
          />

          {/* Action chips + post */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              <button type="button" className="flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/95 backdrop-blur-sm transition-colors hover:bg-white/20">
                <ImageIcon className="size-3" />
                {isAr ? "صورة" : "Photo"}
              </button>
              <button type="button" className="flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/95 backdrop-blur-sm transition-colors hover:bg-white/20">
                <HeartHandshake className="size-3" />
                {isAr ? ar.giveKudos : "Kudos"}
              </button>
              <button type="button" className="flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/95 backdrop-blur-sm transition-colors hover:bg-white/20">
                <Vote className="size-3" />
                {isAr ? ar.startPoll : "Poll"}
              </button>
              <button type="button" className="flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/95 backdrop-blur-sm transition-colors hover:bg-white/20">
                <Smile className="size-3" />
                {isAr ? "تعبير" : "Emoji"}
              </button>
            </div>
            <Button
              disabled={!draft.trim()}
              size="sm"
              className="shrink-0 gap-1.5 bg-white text-violet-700 hover:bg-white/95 disabled:bg-white/40 disabled:text-violet-700/60"
            >
              <Send className="size-3.5" />
              {isAr ? ar.postUpdate : "Post"}
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Two-column: Feed | Sidebar */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Feed */}
        <div className="space-y-3 lg:col-span-8">
          <div className="text-[13px] font-semibold flex items-center gap-2">
            <Sparkles className="size-3.5 text-rose-500" />
            {isAr ? ar.feed : "Team feed"}
          </div>
          {feed.map((item, idx) => {
            const liked = likedSet.has(item.id)
            const likeCount = item.reactions + (liked && !item.liked ? 1 : 0) - (!liked && item.liked ? 1 : 0)

            if (item.kind === "kudos") {
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  className="rounded-2xl border border-amber-200/70 dark:border-amber-500/25 bg-gradient-to-r from-amber-50/70 to-rose-50/40 dark:from-amber-950/15 dark:to-rose-950/15 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <Avatar className="size-9">
                        <AvatarFallback className="bg-amber-200 dark:bg-amber-500/30 text-amber-800 dark:text-amber-200 text-[10px] font-bold">
                          {item.from!.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute -bottom-1 -end-1 flex size-5 items-center justify-center rounded-full bg-card text-[12px] ring-2 ring-card">
                        {item.emoji}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="outline" className="gap-1 border-amber-500/30 bg-amber-500/10 text-[10px] text-amber-700 dark:text-amber-300">
                          <HeartHandshake className="size-2.5" />
                          {isAr ? "تقدير" : "Kudos"}
                        </Badge>
                        <span className="text-[12.5px]">
                          <span className="font-semibold">{isAr ? item.from!.nameAr : item.from!.name}</span>
                          <span className="text-muted-foreground"> {isAr ? ar.recognized : "recognized"} </span>
                          <span className="font-semibold">{isAr ? item.to!.nameAr : item.to!.name}</span>
                        </span>
                      </div>
                      <p className="mt-1.5 text-[12.5px] leading-relaxed text-foreground/85">
                        "{isAr ? item.reasonAr : item.reason}"
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-[10.5px] text-muted-foreground/55">
                        <span>{isAr ? item.timeAr : item.time}</span>
                        <button
                          type="button"
                          onClick={() => toggleLike(item.id)}
                          className={cn("flex items-center gap-1 transition-colors", liked ? "text-rose-500" : "hover:text-rose-500")}
                        >
                          <Heart className={cn("size-3", liked && "fill-current")} />
                          <span className="tabular-nums">{likeCount}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            }

            // post
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
              >
                <Card className="ring-1 ring-foreground/10">
                  <div className="px-5 pt-4 pb-3 space-y-2.5">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="size-9">
                          <AvatarFallback className="bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 text-[10px] font-bold">
                            {item.author!.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="absolute -bottom-0.5 -end-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-card" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[12.5px] font-semibold">{isAr ? item.author!.nameAr : item.author!.name}</div>
                        <div className="text-[10.5px] text-muted-foreground/65">
                          {isAr ? item.author!.roleAr : item.author!.role} <span className="text-muted-foreground/30">·</span> {isAr ? item.timeAr : item.time}
                        </div>
                      </div>
                    </div>
                    <p className="text-[13px] leading-relaxed text-foreground/90">
                      {isAr ? item.contentAr : item.content}
                    </p>
                  </div>
                  <div className="flex border-t border-border/50 px-2 py-1">
                    <button
                      type="button"
                      onClick={() => toggleLike(item.id)}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors",
                        liked ? "text-rose-500 hover:bg-rose-500/10" : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                      )}
                    >
                      <Heart className={cn("size-3.5", liked && "fill-current")} />
                      <span className="tabular-nums">{likeCount}</span>
                    </button>
                    <button type="button" className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground">
                      <MessageCircle className="size-3.5" />
                      <span className="tabular-nums">{item.comments ?? 0}</span>
                    </button>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 lg:col-span-4">
          {/* Active poll */}
          <Card className="ring-1 ring-foreground/10 overflow-hidden">
            <div className="border-b border-border/60 px-4 py-3">
              <div className="flex items-center gap-2 text-[13px] font-semibold">
                <Vote className="size-3.5 text-fuchsia-500" />
                {isAr ? ar.poll : "Active poll"}
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground/65">
                {isAr ? ar.endsIn(activePoll.endsInAr) : `Ends in ${activePoll.endsIn}`} · {isAr ? ar.votedBy(activePoll.totalVotes) : `${activePoll.totalVotes} votes`}
              </div>
            </div>
            <div className="px-4 py-3 space-y-3">
              <div className="text-[12.5px] font-semibold leading-snug">
                {isAr ? activePoll.questionAr : activePoll.question}
              </div>
              <div className="space-y-1.5">
                {activePoll.options.map((o) => {
                  const total = activePoll.totalVotes + (pollVote ? 1 : 0)
                  const own = pollVote === o.id
                  const votes = o.votes + (own ? 1 : 0)
                  const pct = (votes / total) * 100
                  const showResults = pollVote !== null
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setPollVote(o.id)}
                      className={cn(
                        "relative w-full overflow-hidden rounded-lg border px-3 py-2 text-start transition-all",
                        own ? "border-fuchsia-500/60 bg-fuchsia-500/[0.05]" : "border-border/60 hover:border-fuchsia-500/40 hover:bg-fuchsia-500/[0.03]",
                      )}
                    >
                      {showResults && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                          className={cn("absolute inset-y-0 start-0", own ? "bg-fuchsia-500/15" : "bg-muted/40")}
                        />
                      )}
                      <div className="relative flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[14px]">{o.emoji}</span>
                          <span className="text-[11.5px] font-medium truncate">{isAr ? o.labelAr : o.label}</span>
                          {own && <CheckCircle2 className="size-3 shrink-0 text-fuchsia-500" />}
                        </div>
                        {showResults && (
                          <span className="text-[10.5px] font-bold tabular-nums text-foreground/70 shrink-0">{pct.toFixed(0)}%</span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </Card>

          {/* Online now */}
          <Card className="ring-1 ring-foreground/10">
            <div className="border-b border-border/60 px-4 py-3 text-[13px] font-semibold flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {isAr ? ar.online : "Online now"}
              <span className="ms-auto rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                {onlineNow.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 px-4 py-3">
              {onlineNow.map((u) => (
                <div key={u.initials} className="relative" title={u.name}>
                  <Avatar className="size-8 ring-2 ring-card">
                    <AvatarFallback className="bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 text-[9.5px] font-bold">
                      {u.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-0.5 -end-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-card" />
                </div>
              ))}
            </div>
          </Card>

          {/* Upcoming event */}
          <Card className="ring-1 ring-foreground/10 overflow-hidden">
            <div className="relative h-20">
              <img src={upcomingEvent.cover} alt="" className="size-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/55 to-pink-600/65" />
              <div className="absolute inset-x-3 bottom-2 text-white">
                <div className="text-[10px] font-semibold tracking-[0.10em] uppercase opacity-80">
                  {isAr ? ar.events : "Upcoming"}
                </div>
                <div className="text-[13px] font-bold leading-tight">{isAr ? upcomingEvent.titleAr : upcomingEvent.title}</div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="space-y-0.5 text-[10.5px] text-muted-foreground/75">
                <div className="flex items-center gap-1"><CalendarDays className="size-2.5 text-rose-500" /> {isAr ? upcomingEvent.dateAr : upcomingEvent.date}</div>
                <div className="flex items-center gap-1"><MapPin className="size-2.5 text-rose-500" /> {isAr ? upcomingEvent.locationAr : upcomingEvent.location}</div>
              </div>
              <Button size="xs" className="gap-1 bg-rose-500 hover:bg-rose-600">
                {isAr ? ar.rsvp : "RSVP"}
              </Button>
            </div>
          </Card>

          {/* Birthdays */}
          <Card className="ring-1 ring-foreground/10">
            <div className="border-b border-border/60 px-4 py-3 text-[13px] font-semibold flex items-center gap-2">
              <Cake className="size-3.5 text-amber-500" />
              {isAr ? ar.birthdays : "Birthdays"}
            </div>
            <ul className="divide-y divide-border/40">
              {birthdays.map((b) => (
                <li key={b.initials} className="flex items-center gap-3 px-4 py-2.5">
                  <Avatar className="size-7">
                    <AvatarFallback className="bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                      {b.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12px] font-semibold">{isAr ? b.nameAr : b.name}</div>
                    <div className="text-[10.5px] text-muted-foreground/65">{isAr ? b.dateAr : b.date}</div>
                  </div>
                  <Button size="xs" variant="ghost" className="shrink-0 text-[11px] text-amber-600 hover:bg-amber-500/10">
                    {isAr ? ar.send : "Wish"}
                  </Button>
                </li>
              ))}
            </ul>
          </Card>

          {/* Rooms */}
          <Card className="ring-1 ring-foreground/10">
            <div className="border-b border-border/60 px-4 py-3 text-[13px] font-semibold flex items-center gap-2">
              <Hash className="size-3.5 text-rose-500" />
              {isAr ? ar.rooms : "Team rooms"}
            </div>
            <ul className="divide-y divide-border/40">
              {rooms.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-2 px-4 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-rose-500 font-bold">#</span>
                    <span className="truncate text-[12px] font-medium">{isAr ? r.nameAr : r.name}</span>
                    {r.active && <span className="size-1.5 shrink-0 rounded-full bg-emerald-500 animate-pulse" />}
                  </div>
                  <Button size="xs" variant="ghost" className="shrink-0 text-[11px] text-rose-500 hover:bg-rose-500/10">
                    {isAr ? ar.joinRoom : "Join"}
                  </Button>
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>
    </div>
  )
}
