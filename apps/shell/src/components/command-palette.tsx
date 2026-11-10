import * as React from "react"
import { useNavigate } from "react-router-dom"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@reach/shared-ui"
import { useShell } from "@reach/shell-context"
import { commandNav } from "@/config/navigation"

/**
 * Full-screen command palette. On md+ the top-bar search box owns ⌘K (Figma
 * shows the shortcut inside it); the palette keeps ⌘K on small screens and is
 * still reachable from the search icon and "Advanced search".
 */
export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const navigate = useNavigate()
  const { locale, setAiPanelOpen } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k" && !window.matchMedia("(min-width: 768px)").matches) {
        e.preventDefault()
        onOpenChange(true)
      }
    }
    window.addEventListener("keydown", down)
    return () => window.removeEventListener("keydown", down)
  }, [onOpenChange])

  const navigateTo = React.useCallback(
    (path: string) => {
      navigate(path)
      onOpenChange(false)
    },
    [navigate, onOpenChange]
  )

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title={t("WIJHA command palette", "لوحة أوامر وجهة")}>
      <CommandInput placeholder={t("Search pages, jump, or ask WIJHA…", "ابحث في الصفحات أو اسأل وجهة…")} />
      <CommandList>
        <CommandEmpty>{t("No matches.", "لا توجد نتائج.")}</CommandEmpty>
        <CommandGroup heading={t("Navigate", "تنقل")}>
          {commandNav.map((item) => (
            <CommandItem key={item.path} value={`${item.label} ${item.path}`} onSelect={() => navigateTo(item.path)}>
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading={t("Quick actions", "إجراءات سريعة")}>
          <CommandItem onSelect={() => navigateTo("/services")}>{t("Submit a service request", "تقديم طلب خدمة")}</CommandItem>
          <CommandItem onSelect={() => navigateTo("/tasks/new")}>{t("Create a task", "إنشاء مهمة")}</CommandItem>
          <CommandItem onSelect={() => navigateTo("/notifications")}>{t("Notification history", "سجل التنبيهات")}</CommandItem>
          <CommandItem onSelect={() => { onOpenChange(false); setAiPanelOpen(true) }}>{t("Ask WIJHA", "اسأل وجهة")}</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
