import * as React from "react"
import { motion } from "framer-motion"

import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import { useMediaQuery } from "@/hooks/use-media-query"
import { CalendarDays, FileText, RotateCcw, Search, ShieldCheck, Sparkles, UsersRound, X } from "lucide-react"

type Msg = { id: string; role: "assistant" | "user"; text: string }

const SUGGESTIONS = [
  { id: "q1", icon: FileText, en: "Q1 report", ar: "تقرير الربع الأول" },
  { id: "meetings", icon: CalendarDays, en: "Tomorrow's meetings", ar: "اجتماعات الغد" },
  { id: "pending", icon: UsersRound, en: "View transactions awaiting response", ar: "عرض المعاملات بانتظار الرد" },
]

const greeting = (isAr: boolean): Msg => ({
  id: "greet",
  role: "assistant",
  text: isAr
    ? "أهلاً فواز. أستطيع تلخيص بريدك، مراجعة الموافقات المعلقة، أو إعادة تنظيم جدولك."
    : "Hi Fawaz. I can summarise your mail, review pending approvals, or reorganise your schedule.",
})

const reply = (isAr: boolean): string =>
  isAr
    ? "حسناً فواز، أعمل على ذلك الآن وسأعرض لك النتيجة من بياناتك داخل وجهة خلال لحظات."
    : "On it, Fawaz — I'm pulling that together from your WIJHA data and will show you the result in a moment."

/**
 * Personal assistant — Figma 315:680 ("المساعد الشخصي"). On desktop it docks
 * at the inline-end of the shell below the top bar (516px card); when closed
 * it takes no space at all — it opens from the top-bar sparkle tile or ⌘J.
 * Below `lg` it is a sheet. Pages can hand it a prompt with
 * `window.dispatchEvent(new CustomEvent("wijha:ask", { detail: { text } }))`.
 */
export function AIAssistantPanel() {
  const { aiPanelOpen, setAiPanelOpen, locale } = useShell()
  const isAr = locale === "ar"
  const isLg = useMediaQuery("(min-width: 1024px)")
  const isXl = useMediaQuery("(min-width: 1280px)")

  const [messages, setMessages] = React.useState<Msg[]>(() => [greeting(isAr)])
  const [thinking, setThinking] = React.useState(false)
  const timer = React.useRef<number | undefined>(undefined)

  const send = React.useCallback((text: string) => {
    const q = text.trim()
    if (!q) return
    setMessages((m) => [...m, { id: `u-${Date.now()}`, role: "user", text: q }])
    setThinking(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setThinking(false)
      setMessages((m) => [...m, { id: `a-${Date.now()}`, role: "assistant", text: reply(isAr) }])
    }, 700)
  }, [isAr])

  const reset = () => {
    window.clearTimeout(timer.current)
    setThinking(false)
    setMessages([greeting(isAr)])
  }

  // Keep the greeting in the active language until the conversation starts.
  const [prevAr, setPrevAr] = React.useState(isAr)
  if (prevAr !== isAr) {
    setPrevAr(isAr)
    if (messages.length === 1) setMessages([greeting(isAr)])
  }

  // ⌘J / Ctrl+J toggles the panel; pages hand prompts over via "wijha:ask".
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault()
        setAiPanelOpen((o) => !o)
      }
    }
    const onAsk = (e: Event) => {
      const text = (e as CustomEvent<{ text?: string }>).detail?.text ?? ""
      setAiPanelOpen(true)
      send(text)
    }
    window.addEventListener("keydown", onKey)
    window.addEventListener("wijha:ask", onAsk)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("wijha:ask", onAsk)
    }
  }, [send, setAiPanelOpen])

  React.useEffect(() => () => window.clearTimeout(timer.current), [])

  const body = (
    <AssistantBody
      isAr={isAr}
      messages={messages}
      thinking={thinking}
      onSend={send}
      onReset={reset}
      onClose={() => setAiPanelOpen(false)}
    />
  )

  if (!isLg) {
    return (
      <Sheet open={aiPanelOpen} onOpenChange={setAiPanelOpen}>
        <SheetContent
          side={isAr ? "left" : "right"}
          showCloseButton={false}
          className="flex w-full flex-col gap-0 bg-card-elevated p-0 sm:max-w-[516px]"
        >
          <SheetTitle className="sr-only">{isAr ? "المساعد الشخصي" : "Personal assistant"}</SheetTitle>
          <SheetDescription className="sr-only">
            {isAr ? "يقرأ بياناتك داخل منصة وجهة فقط" : "Only reads your data within the Wijha platform"}
          </SheetDescription>
          {body}
        </SheetContent>
      </Sheet>
    )
  }

  const width = isXl ? 516 : 420
  if (!aiPanelOpen) return null
  return (
    <aside
      aria-label={isAr ? "المساعد الشخصي" : "Personal assistant"}
      style={{ width }}
      className="relative h-svh shrink-0 overflow-hidden pt-20"
    >
      {/* 80px top offset = the top bar; the card is Figma's 516×737 frame. */}
      <div className="flex h-[min(737px,calc(100svh-104px))] flex-col rounded-b-xl border border-background bg-card-elevated shadow-[0_12px_40px_-20px_rgba(0,0,0,0.5)]">
        {body}
      </div>
    </aside>
  )
}

function AssistantBody({
  isAr, messages, thinking, onSend, onReset, onClose,
}: {
  isAr: boolean
  messages: Msg[]
  thinking: boolean
  onSend: (text: string) => void
  onReset: () => void
  onClose: () => void
}) {
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const [draft, setDraft] = React.useState("")
  const endRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" })
  }, [messages.length, thinking])

  const submit = (text: string) => {
    if (!text.trim()) return
    onSend(text)
    setDraft("")
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col justify-between px-[18px] py-5">
      {/* header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-[#8f743e] bg-[linear-gradient(180deg,rgba(171,128,37,0.24),rgba(171,128,37,0.09))] text-primary">
            <Sparkles className="size-[18px]" strokeWidth={1.6} />
          </span>
          <div className="min-w-0">
            <div className="truncate text-[17px] font-medium leading-[25.5px] text-foreground">{t("Personal assistant", "المساعد الشخصي")}</div>
            <div className="flex items-center gap-1 truncate text-[12px] text-muted-foreground">
              <ShieldCheck className="size-3.5 shrink-0" strokeWidth={1.6} />
              {t("Only reads your data within the Wijha platform", "يقرأ بياناتك داخل منصة وجهة فقط")}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={onReset} aria-label={t("New conversation", "محادثة جديدة")} title={t("New conversation", "محادثة جديدة")}
            className="grid size-10 place-items-center rounded-lg bg-background text-foreground transition-colors hover:text-primary">
            <RotateCcw className="size-[18px]" strokeWidth={1.6} />
          </button>
          <button type="button" onClick={onClose} aria-label={t("Close", "إغلاق")} title={t("Close", "إغلاق")}
            className="grid size-10 place-items-center rounded-lg bg-background text-foreground transition-colors hover:text-primary">
            <X className="size-[18px]" strokeWidth={1.6} />
          </button>
        </div>
      </div>

      {/* conversation — anchored to the bottom like the design */}
      <div className="flex min-h-0 flex-1 flex-col justify-end overflow-hidden py-5">
        <div className="min-h-0 space-y-4 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-[2px] [&::-webkit-scrollbar-thumb]:bg-secondary">
          {messages.map((m) => (
            <Bubble key={m.id} role={m.role} text={m.text} isAr={isAr} />
          ))}
          {thinking && (
            <div className="flex items-center gap-3" aria-live="polite">
              <AssistantAvatar />
              <span className="inline-flex gap-1 rounded-xl border border-primary/60 px-4 py-3">
                {[0, 1, 2].map((i) => (
                  <motion.span key={i} className="size-1.5 rounded-full bg-primary" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }} />
                ))}
              </span>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      {/* suggestions + input */}
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map(({ id, icon: Icon, en, ar }) => (
            <button key={id} type="button" onClick={() => submit(isAr ? ar : en)}
              className="inline-flex h-[38px] items-center gap-2 rounded-lg border border-input bg-background px-4 text-[12.5px] text-foreground transition-colors hover:border-primary/50">
              <Icon className="size-[13px] text-primary" strokeWidth={1.8} />
              {isAr ? ar : en}
            </button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); submit(draft) }}
          className="flex h-[52px] items-center gap-3 rounded-[10px] border border-input bg-background ps-5 pe-[5px] focus-within:border-primary/60">
          <Sparkles className="size-[17px] shrink-0 text-primary" strokeWidth={1.6} />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t("Ask a question...", "اطرح استفسارك...")}
            aria-label={t("Ask the assistant", "اسأل المساعد")}
            autoFocus
            className="min-w-0 flex-1 bg-transparent text-[13.5px] text-foreground outline-none placeholder:text-foreground"
          />
          <kbd className="shrink-0 font-sans text-[11.5px] text-foreground">⌘J</kbd>
          <button type="submit" aria-label={t("Send", "إرسال")}
            className="grid size-10 shrink-0 place-items-center rounded-full border border-[#8f743e] bg-[linear-gradient(180deg,rgba(171,128,37,0.24),rgba(171,128,37,0.09))] text-primary transition-colors hover:bg-soft-accent">
            <Search className="size-4" strokeWidth={1.8} />
          </button>
        </form>
      </div>
    </div>
  )
}

function AssistantAvatar() {
  return (
    <span className="grid size-7 shrink-0 place-items-center self-start rounded-full border border-[#8f743e] bg-soft-accent text-primary">
      <Sparkles className="size-3.5" strokeWidth={1.6} />
    </span>
  )
}

function Bubble({ role, text, isAr }: { role: Msg["role"]; text: string; isAr: boolean }) {
  const isAssistant = role === "assistant"
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className={cn("flex items-start gap-3", !isAssistant && "flex-row-reverse")}
    >
      {isAssistant ? (
        <AssistantAvatar />
      ) : (
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-[10px] font-semibold text-foreground">
          {isAr ? "ف" : "FA"}
        </span>
      )}
      <p
        className={cn(
          "max-w-[85%] rounded-xl px-4 py-3 text-[14px] leading-[23px] text-foreground",
          isAssistant ? "border border-primary/70" : "bg-secondary",
        )}
      >
        {text}
      </p>
    </motion.div>
  )
}
