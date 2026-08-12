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
import { commandNav } from "@/config/navigation"

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const navigate = useNavigate()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
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
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Reach command palette">
      <CommandInput placeholder="Search hubs, jump, or ask Reach…" />
      <CommandList>
        <CommandEmpty>No matches.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {commandNav.map((item) => (
            <CommandItem key={item.path} value={`${item.label} ${item.path}`} onSelect={() => navigateTo(item.path)}>
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick actions">
          <CommandItem onSelect={() => navigateTo("/services")}>Submit service request</CommandItem>
          <CommandItem onSelect={() => navigateTo("/work")}>Create task (Work Hub)</CommandItem>
          <CommandItem onSelect={() => navigateTo("/intelligence")}>Open Intelligence Hub</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
