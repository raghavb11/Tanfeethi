import * as React from "react"

export function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia(query).matches
  })

  React.useEffect(() => {
    const mq = window.matchMedia(query)
    const handler = () => setMatches(mq.matches)
    mq.addEventListener("change", handler)
    queueMicrotask(() => setMatches(mq.matches))
    return () => mq.removeEventListener("change", handler)
  }, [query])

  return matches
}
