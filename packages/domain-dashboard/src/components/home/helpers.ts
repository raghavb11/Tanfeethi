import * as React from "react"

/** Small media-query hook (the shell's hook lives in apps/, out of reach for domains). */
export function useMedia(query: string) {
  const get = React.useCallback(() => (typeof window !== "undefined" ? window.matchMedia(query).matches : false), [query])
  const [matches, setMatches] = React.useState(get)
  React.useEffect(() => {
    const mql = window.matchMedia(query)
    const on = () => setMatches(mql.matches)
    on()
    mql.addEventListener("change", on)
    return () => mql.removeEventListener("change", on)
  }, [query])
  return matches
}

/**
 * Hands a prompt to the shell's personal-assistant panel. Domains can't import
 * the shell, so this goes through a window event the panel listens for.
 */
export function askAssistant(text: string) {
  window.dispatchEvent(new CustomEvent("wijha:ask", { detail: { text } }))
}
