/** AI Center (المساعد) — Figma 2028:2252 (base) and 4858:15788 (files attached).
 *  Conversations card at the start, chat thread + suggestion chips +
 *  attachment chips + prompt bar at the end. Replies are canned (prototype). */
import * as React from "react"
import { cn } from "@reach/shared-core"
import { CalendarDays, FileText, Paperclip, Plus, Search, Sparkles, Trash2, UsersRound } from "lucide-react"

import { cannedReply, chatChips, conversations as SEED, type ChatAttachment, type ChatMessage, type Conversation } from "../data/mock/intelligence"

const CHIP_ICON = { report: FileText, calendar: CalendarDays, approvals: UsersRound }
const KIND_STYLE: Record<ChatAttachment["kind"], string> = {
  PDF: "bg-error-fill text-error",
  Word: "bg-info-fill text-info",
  Excel: "bg-success-fill text-success",
  Image: "bg-warning-fill text-warning",
  File: "bg-secondary text-icon",
}
const kindOf = (name: string): ChatAttachment["kind"] => {
  const ext = (name.split(".").pop() ?? "").toLowerCase()
  if (ext === "pdf") return "PDF"
  if (ext === "doc" || ext === "docx") return "Word"
  if (ext === "xls" || ext === "xlsx" || ext === "csv") return "Excel"
  if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext)) return "Image"
  return "File"
}

export function AiCenter({ isAr, initials = "FA" }: { isAr: boolean; initials?: string }) {
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const [convs, setConvs] = React.useState<Conversation[]>(SEED)
  const [activeId, setActiveId] = React.useState(SEED[0].id)
  const [draft, setDraft] = React.useState("")
  // "#/intelligence?files=1" opens with the two attachments of Figma 4858:15788 (capture helper).
  const [files, setFiles] = React.useState<ChatAttachment[]>(() =>
    new URLSearchParams(window.location.hash.split("?")[1] ?? "").has("files")
      ? [{ name: isAr ? "جدول أعمالي" : "My agenda", kind: "PDF" }, { name: isAr ? "جدول أعمالي 2" : "My agenda 2", kind: "Word" }]
      : [])
  const [typing, setTyping] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const fileRef = React.useRef<HTMLInputElement>(null)
  const endRef = React.useRef<HTMLDivElement>(null)
  const active = convs.find((c) => c.id === activeId) ?? convs[0]

  // ⌘J / Ctrl+J focuses the prompt (shortcut drawn in the bar)
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") { e.preventDefault(); inputRef.current?.focus() }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])
  React.useEffect(() => { endRef.current?.scrollIntoView({ block: "nearest" }) }, [active.messages.length, typing])

  const push = (convId: string, msg: ChatMessage) =>
    setConvs((cs) => cs.map((c) => (c.id === convId ? { ...c, messages: [...c.messages, msg] } : c)))

  const send = (text: string) => {
    const body = text.trim()
    if ((!body && files.length === 0) || typing) return
    const convId = active.id
    const attached = files
    push(convId, { id: `u-${Date.now()}`, role: "user", text: body, textAr: body, attachments: attached.length ? attached : undefined })
    setDraft(""); setFiles([]); setTyping(true)
    window.setTimeout(() => {
      const reply = cannedReply(body, isAr, attached.length)
      push(convId, { id: `a-${Date.now()}`, role: "assistant", text: reply, textAr: reply })
      setTyping(false)
    }, 900)
  }

  const newConversation = () => {
    const id = `c-${Date.now()}`
    setConvs((cs) => [{ id, title: "New conversation", titleAr: "محادثة جديدة", messages: [] }, ...cs])
    setActiveId(id)
    inputRef.current?.focus()
  }

  return (
    <div className="grid items-stretch gap-5 xl:grid-cols-[397px_minmax(0,1fr)]">
      {/* conversations */}
      <section className="panel flex flex-col rounded-[12px] px-6 py-5 xl:max-h-[calc(100svh-160px)]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col items-start gap-2">
            <h2 className="flex items-center gap-2 text-[17px] font-medium leading-[25.5px]"><Sparkles className="size-4 text-primary" />{t("Conversations", "المحادثات")}</h2>
            <span className="h-[3px] w-12 rounded-[2px] bg-primary" />
          </div>
          <button type="button" onClick={newConversation} aria-label={t("New conversation", "محادثة جديدة")} title={t("New conversation", "محادثة جديدة")}
            className="icon-tile size-[34px] hover:brightness-125"><Plus className="size-4" /></button>
        </div>
        <ul className="-me-2 mt-4 flex flex-col gap-3 overflow-y-auto pe-2">
          {convs.map((c) => (
            <li key={c.id}>
              <button type="button" onClick={() => setActiveId(c.id)} aria-current={c.id === active.id ? "true" : undefined}
                className={cn("flex h-[62px] w-full items-center gap-3 rounded-[8px] bg-background p-[14px] text-start transition-shadow hover:ring-1 hover:ring-primary/30",
                  c.id === active.id && "ring-1 ring-primary/50")}>
                <span className="accent-chip grid size-[34px] shrink-0 place-items-center rounded-[8px]"><Sparkles className="size-4" /></span>
                <span className="min-w-0 flex-1 truncate text-[13px]">{isAr ? c.titleAr : c.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* chat */}
      <section aria-label={t("Chat", "المحادثة")} className="flex min-h-[560px] flex-col justify-end px-0 py-5 sm:px-[18px]">
        <div className="flex flex-col gap-4">
          {active.messages.length === 0 && !typing ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <span className="grid size-12 place-items-center rounded-full border border-primary bg-soft-accent text-primary"><Sparkles className="size-5" /></span>
              <p className="text-[15px] font-medium">{t("How can I help you today?", "كيف أستطيع مساعدتك اليوم؟")}</p>
              <p className="text-[12px] text-muted-foreground">{t("Ask a question, or pick a suggestion below.", "اطرح سؤالك أو اختر أحد الاقتراحات بالأسفل.")}</p>
            </div>
          ) : active.messages.map((m) => <Bubble key={m.id} m={m} isAr={isAr} initials={initials} />)}
          {typing && (
            <div className="flex items-start gap-3 self-end" aria-live="polite">
              <div className="flex h-11 items-center gap-1 rounded-[8px] border border-primary px-4">
                {[0, 1, 2].map((i) => <span key={i} className="size-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: `${i * 120}ms` }} />)}
                <span className="sr-only">{t("Assistant is typing", "المساعد يكتب")}</span>
              </div>
              <AiAvatar />
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="flex flex-col gap-2.5 pt-10">
          {/* suggestion chips */}
          <div className="flex flex-wrap gap-3">
            {chatChips.map((c) => {
              const Icon = CHIP_ICON[c.icon]
              return (
                <button key={c.id} type="button" onClick={() => send(isAr ? c.ar : c.en)}
                  className="inline-flex h-[38px] items-center gap-2 rounded-[8px] border border-secondary px-4 text-[13px] transition-colors hover:border-primary/50 hover:bg-soft-accent">
                  <Icon className="size-3.5 text-primary" />{isAr ? c.ar : c.en}
                </button>
              )
            })}
          </div>

          {/* attachments (4858:15788) */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {files.map((f, i) => (
                <div key={`${f.name}-${i}`} className="flex h-[62px] min-w-[220px] items-center gap-3 rounded-[8px] border border-secondary p-[14px]">
                  <span className={cn("grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[8px] text-[10px] font-bold", KIND_STYLE[f.kind])}>{f.kind}</span>
                  <span className="min-w-0 flex-1 truncate text-[13px]">{f.name}</span>
                  <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} aria-label={t("Remove file", "حذف الملف")}
                    className="grid size-[34px] shrink-0 place-items-center rounded-[8px] border border-secondary text-error hover:bg-error-fill"><Trash2 className="size-4" /></button>
                </div>
              ))}
            </div>
          )}

          {/* prompt bar */}
          <form onSubmit={(e) => { e.preventDefault(); send(draft) }}
            className="flex h-[52px] items-center gap-3 rounded-[8px] border border-secondary bg-background pe-[5px] ps-5 focus-within:border-primary/50">
            <Sparkles className="size-4 shrink-0 text-primary" />
            <input ref={inputRef} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={t("Ask a question...", "اطرح استفسارك...")}
              aria-label={t("Ask your question", "اطرح استفسارك")} className="h-full min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-foreground" />
            <kbd className="hidden text-[11px] text-muted-foreground sm:inline" dir="ltr">⌘J</kbd>
            <input ref={fileRef} type="file" multiple className="hidden"
              onChange={(e) => { const list = Array.from(e.target.files ?? []).map((f) => ({ name: f.name, kind: kindOf(f.name) })); setFiles((p) => [...p, ...list]); e.target.value = "" }} />
            <button type="button" onClick={() => fileRef.current?.click()} aria-label={t("Attach a file", "إرفاق ملف")} className="grid size-9 place-items-center rounded-[8px] text-icon hover:text-foreground"><Paperclip className="size-4" /></button>
            <button type="submit" disabled={(!draft.trim() && files.length === 0) || typing} aria-label={t("Send", "إرسال")}
              className="grid size-[42px] shrink-0 place-items-center rounded-full border border-primary bg-soft-accent text-primary transition-[filter] hover:brightness-125 disabled:opacity-50">
              <Search className="size-4" />
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}

function AiAvatar() {
  return <span className="grid size-[30px] shrink-0 place-items-center rounded-full border border-primary bg-soft-accent text-primary"><Sparkles className="size-3.5" /></span>
}

function Bubble({ m, isAr, initials }: { m: ChatMessage; isAr: boolean; initials: string }) {
  const user = m.role === "user"
  const text = isAr ? m.textAr : m.text
  return (
    <div className={cn("flex max-w-[min(100%,480px)] items-start gap-3", user ? "self-start" : "flex-row-reverse self-end")}>
      {user
        ? <span className="grid size-[30px] shrink-0 place-items-center rounded-full border border-primary bg-soft-accent text-[11px] font-bold text-primary">{initials}</span>
        : <AiAvatar />}
      <div className={cn("flex flex-col gap-2 rounded-[8px] border px-4 py-3 text-[13px] leading-6", user ? "border-secondary" : "border-primary")}>
        {text && <p>{text}</p>}
        {m.attachments && (
          <div className="flex flex-wrap gap-2">
            {m.attachments.map((f, i) => (
              <span key={i} className="inline-flex items-center gap-2 rounded-md bg-secondary px-2 py-1 text-[11px]">
                <span className={cn("rounded px-1 text-[9px] font-bold", KIND_STYLE[f.kind])}>{f.kind}</span>{f.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
