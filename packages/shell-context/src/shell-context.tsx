import * as React from "react"

type Locale = "en" | "ar"
type Role = "user" | "admin"

type ShellContextValue = {
  sidebarCollapsed: boolean
  setSidebarCollapsed: (v: boolean | ((prev: boolean) => boolean)) => void
  aiPanelOpen: boolean
  setAiPanelOpen: (v: boolean | ((prev: boolean) => boolean)) => void
  commandOpen: boolean
  setCommandOpen: (v: boolean | ((prev: boolean) => boolean)) => void
  notificationsOpen: boolean
  setNotificationsOpen: (v: boolean | ((prev: boolean) => boolean)) => void
  locale: Locale
  setLocale: (v: Locale) => void
  role: Role
  setRole: (v: Role) => void
}

const ShellContext = React.createContext<ShellContextValue | null>(null)

const SIDEBAR_KEY = "reach.sidebar.collapsed"
const LOCALE_KEY = "reach.locale"
const ROLE_KEY = "reach.role"

/** Read persisted shell state up-front so the first paint is already correct
 *  (avoids a hydration setState-in-effect and its flash/double-render). */
function readStoredSidebar(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === "1"
  } catch {
    return false
  }
}

function readStoredLocale(): Locale {
  try {
    return localStorage.getItem(LOCALE_KEY) === "ar" ? "ar" : "en"
  } catch {
    return "en"
  }
}

function readStoredRole(): Role {
  try {
    return localStorage.getItem(ROLE_KEY) === "user" ? "user" : "admin"
  } catch {
    return "admin"
  }
}

export function ShellProvider({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsedState] = React.useState(readStoredSidebar)
  const [aiPanelOpen, setAiPanelOpen] = React.useState(false)
  const [commandOpen, setCommandOpen] = React.useState(false)
  const [notificationsOpen, setNotificationsOpen] = React.useState(false)
  const [locale, setLocaleState] = React.useState<Locale>(readStoredLocale)
  const [role, setRoleState] = React.useState<Role>(readStoredRole)

  // Keep <html> dir/lang in sync
  React.useEffect(() => {
    const html = document.documentElement
    html.setAttribute("lang", locale)
    html.setAttribute("dir", locale === "ar" ? "rtl" : "ltr")
  }, [locale])

  const setSidebarCollapsed = React.useCallback(
    (v: boolean | ((prev: boolean) => boolean)) => {
      setSidebarCollapsedState((prev) => {
        const next = typeof v === "function" ? v(prev) : v
        try { localStorage.setItem(SIDEBAR_KEY, next ? "1" : "0") } catch { /**/ }
        return next
      })
    },
    [],
  )

  const setLocale = React.useCallback((v: Locale) => {
    setLocaleState(v)
    try { localStorage.setItem(LOCALE_KEY, v) } catch { /**/ }
  }, [])

  const setRole = React.useCallback((v: Role) => {
    setRoleState(v)
    try { localStorage.setItem(ROLE_KEY, v) } catch { /**/ }
  }, [])

  const value = React.useMemo(
    () =>
      ({
        sidebarCollapsed,
        setSidebarCollapsed,
        aiPanelOpen,
        setAiPanelOpen,
        commandOpen,
        setCommandOpen,
        notificationsOpen,
        setNotificationsOpen,
        locale,
        setLocale,
        role,
        setRole,
      }) satisfies ShellContextValue,
    [
      sidebarCollapsed,
      setSidebarCollapsed,
      aiPanelOpen,
      commandOpen,
      notificationsOpen,
      locale,
      setLocale,
      role,
      setRole,
    ],
  )

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>
}

export function useShell() {
  const ctx = React.useContext(ShellContext)
  if (!ctx) throw new Error("useShell must be used within ShellProvider")
  return ctx
}
