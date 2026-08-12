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
  featured: boolean
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

let articles: Article[] = []
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
