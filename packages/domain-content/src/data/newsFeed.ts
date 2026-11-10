import * as React from "react"

import { useArticles } from "../store"
import { metaFor, NEWS, NEWS_CAT_AR, type NewsItem, type Status } from "./news"

/** Hidden seed news ids (deleted from the Knowledge page this session). */
let hidden: string[] = []
const listeners = new Set<() => void>()
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l) } }
export function hideSeedNews(id: string) { hidden = [...hidden, id]; listeners.forEach((l) => l()) }

/** Authored CMS articles first, then the seeded newsroom — one list for the
 *  Knowledge card, the News page and the news details pager. */
export function useNewsFeed(): NewsItem[] {
  const created = useArticles()
  const hiddenIds = React.useSyncExternalStore(subscribe, () => hidden)
  return React.useMemo(() => {
    const authored: NewsItem[] = created.map((a) => ({
      id: a.id, title: a.title, titleAr: a.title, category: a.category, categoryAr: NEWS_CAT_AR[a.category],
      date: a.date, dateAr: a.date === "—" ? "—" : a.date, excerpt: a.excerpt, excerptAr: a.excerpt,
      status: (a.status === "Draft" ? "Draft" : "Published") as Status,
      tint: "#234024", img: a.cover ?? "", body: a.body ?? "", readMin: Math.max(1, Math.round((a.body ?? "").replace(/<[^>]+>/g, "").split(/\s+/).length / 200)),
    }))
    // newly authored first, then the newsroom seed, then the legacy CMS seed articles
    const fresh = authored.filter((a) => !a.id.startsWith("seed-"))
    const legacy = authored.filter((a) => a.id.startsWith("seed-"))
    return [...fresh, ...NEWS.filter((n) => !hiddenIds.includes(n.id)), ...legacy]
  }, [created, hiddenIds])
}

export const newsStatus = (n: NewsItem, i: number): Status => metaFor(n.id, i).status ?? n.status

/** Published items only — what employees see and what the pager walks. */
export function usePublishedNews(): NewsItem[] {
  const all = useNewsFeed()
  return React.useMemo(() => all.filter((n, i) => newsStatus(n, i) === "Published"), [all])
}
