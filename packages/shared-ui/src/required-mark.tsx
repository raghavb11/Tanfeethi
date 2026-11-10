import * as React from "react"
import { cn } from "@reach/shared-core"

/**
 * Required-field asterisk, exactly as the Figma forms draw it (4661:13733, 4871:16776,
 * 4851:15277, 4946:15932, 4915:18193 and their English twins): the label's own font size,
 * placed after the label text at its inline end (left of Arabic, right of English) with a
 * 4px clear gap to the last glyph. Arabic frames colour it Status/Error and sit it 1px
 * lower; the English twins draw it in the label colour.
 *
 * Render it as the label's last child with no whitespace before it, so it can never wrap
 * onto a line of its own. It is decorative: mark the control itself `required` /
 * `aria-required` (see `withAriaRequired`) for assistive tech.
 */
export function RequiredMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("ms-1 text-error ltr:text-foreground rtl:relative rtl:top-px rtl:ms-[3px]", className)}
    >
      *
    </span>
  )
}

/** Adds `aria-required` to a field's single control element (no-op for fragments/text). */
export function withAriaRequired(node: React.ReactNode, required?: boolean): React.ReactNode {
  if (!required || !React.isValidElement(node) || node.type === React.Fragment) return node
  return React.cloneElement(node as React.ReactElement<{ "aria-required"?: boolean }>, { "aria-required": true })
}
