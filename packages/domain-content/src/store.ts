/** Content store for authored news articles, circulars and comments, shared
 *  across list pages, editors and the reader. Persisted to a JSON file via the
 *  dev server's /api/cms endpoint, so content survives refreshes and restarts.
 *  A production build would point the same calls at the real CMS backend. */
import * as React from "react"

export type ArticleStatus = "Draft" | "Published"
export type ArticleAttachment = { name: string; kind: string }
export type Article = {
  id: string
  title: string
  category: string
  excerpt: string
  cover: string | null
  status: ArticleStatus
  /** Legacy — news articles are no longer featured/pinned. */
  featured?: boolean
  date: string
  body?: string
  // extended authoring fields
  issueDate?: string
  author?: string
  attachments?: ArticleAttachment[]
  userGroups?: string[]
  specificUsers?: string[]
  locations?: string[]
  visibilityStart?: string
  visibilityEnd?: string | null
  important?: boolean
  emailNotify?: boolean
}

export type Circular = {
  id: string
  ref: string
  title: string
  dept: string
  issued: string
  important: boolean
  status: ArticleStatus
  file: string
}

/** Default seed articles — used when no persisted CMS content is available
 *  (e.g. a static deploy with no /api/cms backend). */
const SEED_ARTICLES: Article[] = [
  {
    id: "seed-1", title: "Terminal expansion hits 68% ahead of schedule", category: "Operations",
    excerpt: "The east-wing expansion reached a major construction milestone weeks early, adding 12 new gates.",
    cover: "images/cms/aviation.jpg", status: "Published", featured: true, date: "2 days ago",
    body: "<p>The terminal expansion programme has reached <b>68% completion</b> — several weeks ahead of the original schedule. The east wing adds 12 new gates, expanded security lanes and a redesigned arrivals hall.</p><h2>What's next</h2><p>Fit-out of the new retail and lounge areas begins next month, with a phased opening planned through the end of the year. Thank you to the Capital Projects and Operations teams for an outstanding effort.</p>",
  },
  {
    id: "seed-2", title: "Welcome to our 14 new joiners this month", category: "People",
    excerpt: "A warm welcome to the newest members of the ALTANFEETHI family across Operations, IT and Commercial.",
    cover: "images/cms/teamwork.jpg", status: "Published", featured: false, date: "5 days ago",
    body: "<p>This month we welcomed <b>14 new colleagues</b> across Operations, IT and Commercial. Say hello when you see them, and check the Employee Community to connect.</p><p>Onboarding sessions run every Sunday — new joiners should coordinate with People Ops for their schedule.</p>",
  },
  {
    id: "seed-3", title: "Wajha employee portal now live internally", category: "Technology",
    excerpt: "The new unified employee experience portal is available to all staff — one place for services, news and requests.",
    cover: "images/cms/dashboard.jpg", status: "Published", featured: false, date: "1 week ago",
    body: "<p>The <b>Wajha (وجهة)</b> employee portal is now live for all staff. It brings your attendance, leave, payslips, requests, policies, documents and company news into a single place.</p><h2>Highlights</h2><ul><li>Employee Center dashboard with today's attendance and leave balance</li><li>My Tasks, News, Announcements and Events</li><li>Document library, policies and FAQs</li></ul><p>Feedback is welcome in the Product channel.</p>",
  },
  {
    id: "seed-4", title: "Ramadan working hours now in effect", category: "Corporate",
    excerpt: "Adjusted hours (10:00–16:00) are active. See the HR circular for team-specific arrangements.",
    cover: "images/cms/ramadan.jpg", status: "Published", featured: false, date: "2 weeks ago",
    body: "<p>Adjusted Ramadan working hours of <b>10:00–16:00</b> are now in effect. Operations and front-line teams follow the rota shared by their line managers.</p><p>Please refer to the HR circular in the Document Library for full details and team-specific arrangements.</p>",
  },
]

let articles: Article[] = SEED_ARTICLES
let circulars: Circular[] = []
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

// ── persistence (server file via /api/cms — survives dev-server restarts) ─────
let saveTimer: ReturnType<typeof setTimeout> | undefined
function persist() {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    fetch("/api/cms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articles, circulars, comments }),
    }).catch(() => {
      /* API unavailable — content stays in-memory for this session */
    })
  }, 150)
}
async function loadPersisted() {
  try {
    const res = await fetch("/api/cms")
    if (!res.ok) return
    const data = await res.json()
    if (Array.isArray(data.articles)) articles = data.articles
    if (Array.isArray(data.circulars)) circulars = data.circulars
    if (data.comments && typeof data.comments === "object") comments = data.comments
    emit()
  } catch {
    /* offline / no API — keep in-memory defaults */
  }
}

export function getArticles() {
  return articles
}
export function getArticleById(id: string) {
  return articles.find((a) => a.id === id)
}
export function addArticle(a: Article) {
  articles = [a, ...articles]
  persist()
  emit()
}
export function updateArticle(id: string, patch: Partial<Article>) {
  articles = articles.map((a) => (a.id === id ? { ...a, ...patch } : a))
  persist()
  emit()
}
export function deleteArticle(id: string) {
  articles = articles.filter((a) => a.id !== id)
  persist()
  emit()
}
export function getCirculars() {
  return circulars
}
export function getCircularById(id: string) {
  return circulars.find((c) => c.id === id)
}
export function addCircular(c: Circular) {
  circulars = [c, ...circulars]
  persist()
  emit()
}
export function updateCircular(id: string, patch: Partial<Circular>) {
  circulars = circulars.map((c) => (c.id === id ? { ...c, ...patch } : c))
  persist()
  emit()
}
export function deleteCircular(id: string) {
  circulars = circulars.filter((c) => c.id !== id)
  persist()
  emit()
}
export function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

// ── comments ─────────────────────────────────────────────────────────────────
export type Comment = { id: string; author: string; initials: string; text: string; time: string }

const EMPTY_COMMENTS: Comment[] = []
let comments: Record<string, Comment[]> = {
  n1: [
    { id: "s1", author: "Sara Al-Mutairi", initials: "SM", text: "Huge congratulations to the whole team — so well deserved! 🎉", time: "1h ago" },
    { id: "s2", author: "Ahmed Hassan", initials: "AH", text: "Proud to be part of ALTANFEETHI. Onwards to 2027!", time: "40m ago" },
  ],
  n3: [
    { id: "s3", author: "Mohammad Iqbal", initials: "MI", text: "Great progress. Any update on the new lounge opening dates?", time: "2h ago" },
  ],
}

export function getComments(articleId: string) {
  return comments[articleId] ?? EMPTY_COMMENTS
}
export function addComment(articleId: string, c: Comment) {
  comments = { ...comments, [articleId]: [...(comments[articleId] ?? []), c] }
  persist()
  emit()
}
export function useComments(articleId: string) {
  return React.useSyncExternalStore(subscribe, () => getComments(articleId))
}

/** Next reference number for a new circular, continuing the mock series. */
export function nextCircularRef() {
  return `CIR-2026-${String(143 + circulars.length).padStart(4, "0")}`
}

export function useArticles() {
  return React.useSyncExternalStore(subscribe, getArticles)
}
export function useCirculars() {
  return React.useSyncExternalStore(subscribe, getCirculars)
}

// Hydrate from the server file once, at module load.
loadPersisted()
