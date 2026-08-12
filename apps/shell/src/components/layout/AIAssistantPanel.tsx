import * as React from "react"
import { motion } from "framer-motion"

import {
  Button,
  Input,
  ScrollArea,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@reach/shared-ui"
import { useShell } from "@reach/shell-context"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ChevronRight, SendHorizontal, Sparkles } from "lucide-react"

const promptsEn = [
  "Summarize my riskiest approvals today.",
  "What should I delegate before 5pm?",
  "Draft an incident update for executives.",
]

const promptsAr = [
  "لخّص الموافقات الأكثر خطورة اليوم.",
  "ما الذي يجب أن أفوّضه قبل الساعة 5 مساءً؟",
  "أعدّ تحديثًا للحوادث لإدارة التنفيذيين.",
]

export function AIAssistantPanel() {
  const { aiPanelOpen, setAiPanelOpen, locale } = useShell()
  const isAr = locale === "ar"
  const isLg = useMediaQuery("(min-width: 1024px)")

  if (!isLg) {
    return (
      <Sheet open={aiPanelOpen} onOpenChange={setAiPanelOpen}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
          <SheetHeader className="border-b border-border/60 p-4 text-left">
            <SheetTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-4 text-primary" />
              {isAr ? "مساعد ريتش" : "Reach Assistant"}
            </SheetTitle>
            <SheetDescription>
              {isAr ? "ذكاء متكامل — مرتبط بمراكز عملك." : "Embedded intelligence — grounded in your hubs."}
            </SheetDescription>
          </SheetHeader>
          <AssistantBody isAr={isAr} />
        </SheetContent>
      </Sheet>
    )
  }

  const expandedWidth = 380
  const collapsedWidth = 52

  return (
    <motion.div
      className="chrome-light relative hidden h-svh shrink-0 bg-background transition-[width] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] lg:flex"
      style={{ width: aiPanelOpen ? expandedWidth : collapsedWidth }}
    >
      {/* Inner-edge divider — logical `start` so it sits on the edge facing the
          content in both LTR and RTL; begins below the top header (top-14). */}
      <span
        aria-hidden
        className="pointer-events-none absolute top-14 bottom-0 start-0 z-10 w-px bg-border/60"
      />

      {!aiPanelOpen && (
        <div className="flex h-full w-full flex-col items-center gap-3 py-4">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-primary"
            aria-label="Expand assistant"
            onClick={() => setAiPanelOpen(true)}
          >
            <Sparkles className="size-5" />
          </Button>
          <div className="pointer-events-none flex-1 select-none text-[10px] font-medium text-muted-foreground [writing-mode:vertical-rl]">
            {isAr ? "اسأل ريتش" : "Ask Reach"}
          </div>
        </div>
      )}

      {aiPanelOpen && (
        <div className="flex h-full min-w-0 flex-1 flex-col">
          <div className="flex h-14 items-center justify-between gap-2 border-b border-border/60 px-3">
            <div className="flex min-w-0 items-center gap-2">
              <Sparkles className="size-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">
                  {isAr ? "مساعد ريتش" : "Reach Assistant"}
                </div>
                <div className="truncate text-[11px] text-muted-foreground">
                  {isAr ? "مرتبط بمخطط عملك" : "Grounded in your work graph"}
                </div>
              </div>
            </div>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Collapse assistant" onClick={() => setAiPanelOpen(false)}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
          <AssistantBody isAr={isAr} />
        </div>
      )}
    </motion.div>
  )
}

function AssistantBody({ isAr }: { isAr: boolean }) {
  const [draft, setDraft] = React.useState("")
  const prompts = isAr ? promptsAr : promptsEn

  return (
    <>
      <ScrollArea className="min-h-0 flex-1 px-4 py-4">
        <div className="space-y-4 text-sm leading-relaxed">
          <div className="rounded-xl border border-border bg-muted/40 p-4">
            <div className="mb-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              {isAr ? "الملخص" : "Summary"}
            </div>
            <p>
              {isAr
                ? "الوضع اليوم بشكل عام تمام، بس فيه شغلتين تبغى قرار منك: شغل كثير متجمّع على قائد واحد، وفيه تراكم في طلبات تقنية المعلومات من الفرق التجارية يزيد يوم بعد يوم."
                : "Things look decent overall today, but two threads need a call from you: too much work piling up on one lead, and IT requests from the business teams keep stacking up day after day."}
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              {isAr ? "اقتراحات" : "Suggested prompts"}
            </div>
            <div className="flex flex-wrap gap-2">
              {prompts.map((p) => (
                <Button key={p} variant="outline" size="xs" className="h-auto max-w-full justify-start py-2 text-left whitespace-normal" onClick={() => setDraft(p)}>
                  {p}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Message
              isAr={isAr}
              role="assistant"
              text={isAr
                ? "هلا خالد — أنا متابع لك الموافقات والحوادث وتوزيع الشغل على الفريق. اسألني أي شي، أو اختر من الاقتراحات."
                : "Hey Khalid — I'm tracking your approvals, incidents, and how work's split across the team. Ask me anything, or pick a suggestion."}
            />
            <Message
              isAr={isAr}
              role="user"
              text={isAr ? "وش اللي لازم أركّز عليه الحين؟" : "What should I focus on right now?"}
            />
            <Message
              isAr={isAr}
              role="assistant"
              text={isAr
                ? "ركّز على ثلاث نقاط: قفل موافقات الموردين المعلّقة من الموجة الثانية، فوّض مهمتين من قائمة أحمد عشان تخفّف عنه، وارسل ايميل قبل الساعة 4 العصر."
                : "Focus on three things: lock down the pending vendor approvals from Wave 2, hand off two tasks from Ahmed's queue to lighten his load, and send an email before 4 PM."}
            />
          </div>
        </div>
      </ScrollArea>

      <div className="border-t border-border/60 p-4">
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={isAr ? "اسأل أي شيء…" : "Ask anything…"}
            className="flex-1"
            dir={isAr ? "rtl" : "ltr"}
          />
          <Button type="button" size="icon-sm" variant="default" aria-label="Send" disabled={!draft.trim()}>
            <SendHorizontal className="size-4" />
          </Button>
        </div>
      </div>
    </>
  )
}

function Message({ role, text, isAr = false }: { role: "assistant" | "user"; text: string; isAr?: boolean }) {
  const isAssistant = role === "assistant"
  const speaker = isAssistant
    ? (isAr ? "وصل" : "Reach")
    : (isAr ? "أنت" : "You")
  return (
    <motion.div
      initial={{ opacity: 0, x: isAssistant ? 8 : -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className={isAssistant ? "rounded-xl bg-muted/50 p-3 ring-1 ring-border" : "ms-6 rounded-xl border border-primary/35 bg-primary/10 p-3"}
    >
      <div className="text-[11px] font-medium text-muted-foreground">{speaker}</div>
      <div className="mt-1 text-foreground">{text}</div>
    </motion.div>
  )
}
