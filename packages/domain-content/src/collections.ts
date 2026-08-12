import * as React from "react"

/** Reactive collection store with optional file-backed persistence (via the dev
 *  server's /api/collections endpoint). Pass a `key` to persist a collection so
 *  its create / edit / delete changes survive a full reload; omit it for a
 *  session-only store. Mirrors the shape of the persisted news store. */
export type WithId = { id: string }

const API = "/api/collections"

export function createCollection<T extends WithId>(seed: T[], key?: string) {
  let items: T[] = seed
  const listeners = new Set<() => void>()
  const emit = () => listeners.forEach((l) => l())
  const subscribe = (l: () => void) => {
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  }

  let saveTimer: ReturnType<typeof setTimeout> | undefined
  const persist = () => {
    if (!key) return
    clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, items }) }).catch(() => {
        /* API unavailable — stays in-memory for this session */
      })
    }, 150)
  }

  // Hydrate from the persisted file once, at module load.
  if (key) {
    fetch(API)
      .then((r) => (r.ok ? r.json() : {}))
      .then((data) => {
        if (data && Array.isArray(data[key])) {
          items = data[key]
          emit()
        }
      })
      .catch(() => {
        /* offline / no API — keep seeded defaults */
      })
  }

  return {
    get: () => items,
    getById: (id: string) => items.find((i) => i.id === id),
    add: (item: T) => { items = [item, ...items]; persist(); emit() },
    /** append to the end (preserves seeded order for chronological lists) */
    append: (item: T) => { items = [...items, item]; persist(); emit() },
    update: (id: string, patch: Partial<T>) => { items = items.map((i) => (i.id === id ? { ...i, ...patch } : i)); persist(); emit() },
    remove: (id: string) => { items = items.filter((i) => i.id !== id); persist(); emit() },
    use: () => React.useSyncExternalStore(subscribe, () => items),
  }
}

/** Session-stable, reload-unique id with a prefix (Date.now avoids collisions
 *  with persisted ids after a reload resets the counter). */
let counter = 0
export function newId(prefix: string) {
  counter += 1
  return `${prefix}-${Date.now().toString(36)}-${counter}`
}
