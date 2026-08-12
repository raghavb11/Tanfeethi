import * as React from "react"
import { cn } from "@reach/shared-core"
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Underline,
} from "lucide-react"

/** Lightweight WYSIWYG editor (contentEditable + execCommand) — no external
 *  dependency. A production build would swap in TipTap/Lexical; the authoring
 *  model (toolbar + HTML output) stays the same. */
export function RichTextEditor({
  initialHTML = "",
  onChange,
  placeholder,
  dir,
}: {
  initialHTML?: string
  onChange?: (html: string) => void
  placeholder?: string
  dir?: "rtl" | "ltr"
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [, bump] = React.useReducer((x) => x + 1, 0)

  React.useEffect(() => {
    if (ref.current && initialHTML) ref.current.innerHTML = initialHTML
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const exec = (command: string, value?: string) => {
    ref.current?.focus()
    document.execCommand(command, false, value)
    onChange?.(ref.current?.innerHTML ?? "")
    bump()
  }
  const state = (command: string) => {
    try {
      return document.queryCommandState(command)
    } catch {
      return false
    }
  }

  const Btn = ({
    cmd,
    arg,
    active,
    icon: Icon,
    label,
  }: {
    cmd: string
    arg?: string
    active?: boolean
    icon: typeof Bold
    label: string
  }) => (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => exec(cmd, arg)}
      className={cn(
        "flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground",
        active && "bg-primary/10 text-primary",
      )}
    >
      <Icon className="size-4" />
    </button>
  )
  const Divider = () => <span aria-hidden className="mx-1 h-5 w-px bg-border" />

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/50 p-1.5">
        <Btn cmd="bold" active={state("bold")} icon={Bold} label="Bold" />
        <Btn cmd="italic" active={state("italic")} icon={Italic} label="Italic" />
        <Btn cmd="underline" active={state("underline")} icon={Underline} label="Underline" />
        <Btn cmd="strikeThrough" active={state("strikeThrough")} icon={Strikethrough} label="Strikethrough" />
        <Divider />
        <Btn cmd="formatBlock" arg="H2" icon={Heading2} label="Heading" />
        <Btn cmd="formatBlock" arg="H3" icon={Heading3} label="Subheading" />
        <Btn cmd="formatBlock" arg="BLOCKQUOTE" icon={Quote} label="Quote" />
        <Divider />
        <Btn cmd="insertUnorderedList" active={state("insertUnorderedList")} icon={List} label="Bulleted list" />
        <Btn cmd="insertOrderedList" active={state("insertOrderedList")} icon={ListOrdered} label="Numbered list" />
        <Divider />
        <button
          type="button"
          title="Link"
          aria-label="Link"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            const url = window.prompt("Link URL")
            if (url) exec("createLink", url)
          }}
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
        >
          <Link2 className="size-4" />
        </button>
      </div>

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        dir={dir}
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        onInput={() => onChange?.(ref.current?.innerHTML ?? "")}
        onKeyUp={bump}
        onMouseUp={bump}
        className={cn(
          "min-h-[520px] bg-[var(--card-elevated)] px-4 py-3 text-[15px] leading-relaxed outline-none",
          "empty:before:pointer-events-none empty:before:text-muted-foreground/70 empty:before:content-[attr(data-placeholder)]",
          "[&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:font-heading [&_h2]:text-xl [&_h2]:font-semibold",
          "[&_h3]:mb-1 [&_h3]:mt-3 [&_h3]:font-heading [&_h3]:text-lg [&_h3]:font-semibold",
          "[&_p]:my-2",
          "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:ps-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:ps-5",
          "[&_a]:text-primary [&_a]:underline",
          "[&_blockquote]:my-2 [&_blockquote]:border-s-2 [&_blockquote]:border-primary [&_blockquote]:ps-3 [&_blockquote]:text-muted-foreground",
        )}
      />
    </div>
  )
}
