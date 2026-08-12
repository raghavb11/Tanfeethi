# Reach Monorepo — Code Quality Audit

**Date:** 2026-06-25
**Scope:** All source files across `apps/shell` + `packages/*` (~11.7k LOC; 71 → 65 files after dead-code removal).
**Method:** ESLint, `tsc`, `npm audit`, production build, plus a full read-through of every
domain, the shell, and the design system across these quality attributes: correctness,
security, type-safety, accessibility (a11y), performance, maintainability, and architecture.

> Companion docs: [ARCHITECTURE.md](ARCHITECTURE.md) · [BRAND.md](BRAND.md).
> Legend: severity **H**igh / **M**edium / **L**ow · status ✅ Fixed · 📝 Documented (deferred refactor)

---

## 0. Tooling baseline (as found)

| Check | Result |
|-------|--------|
| `npm audit` | ✅ 0 vulnerabilities |
| `eslint apps packages` | ❌ 2 errors (`react-hooks/set-state-in-effect`) |
| `tsc` (via shell build) | ✅ passes, but **no standalone `typecheck` script** and **no per-package tsconfig** |
| Production build | ✅ builds, but ⚠️ **single 964 KB JS chunk** (no code-splitting) |
| `console.log` / `debugger` / `any` / `@ts-ignore` / `TODO` | ✅ none found — disciplined codebase |

---

## 1. Security & Privacy

| # | Sev | File:line | Issue | Status |
|---|-----|-----------|-------|--------|
| 1.1 | **M** | `domain-employee/.../EmployeeHub.tsx:820` | Real personal email `thebigkhaled@gmail.com` hardcoded in the org-chart card. Privacy leak + magic string; now sourced from the `profile` mock. | ✅ |
| 1.2 | L | `domain-dashboard/.../InsightCard.tsx:17` | `new RegExp("(" + highlight + ")")` interpolates user-facing text into a RegExp unescaped → throws on metacharacters. (File was also dead code → deleted.) | ✅ (deleted) |
| 1.3 | L | `shell-context.tsx` | `localStorage`/`document` reads are SSR-unsafe (no guard). Acceptable for a Vite SPA; `localStorage` is try/catch-wrapped. | 📝 |

No secrets, tokens, `dangerouslySetInnerHTML`, or `eval` anywhere. Dependencies clean.

---

## 2. Lint / Correctness bugs

| # | Sev | File:line | Issue | Status |
|---|-----|-----------|-------|--------|
| 2.1 | **H** | `apps/shell/.../AppShell.tsx:19` | **ESLint error** — `setState` synchronously in effect (reset mobile nav on route change). Fixed via derive-during-render (`prevPath`) pattern. | ✅ |
| 2.2 | **H** | `apps/shell/.../InlineSearch.tsx:192` | **ESLint error** — `setActive(0)` in effect on `[query]`. Fixed by resetting the active index inside the query setter. | ✅ |
| 2.3 | **M** | `shell-context.tsx` | Hydration via `setState`-in-effect → guaranteed double render + visible flash. The lint rule had been *suppressed* instead of fixed. Fixed with lazy `useState` initializers; suppression removed. | ✅ |
| 2.4 | **M** | `domain-preview/.../Learning.tsx:233` | Dead/nonsensical expression `ar.goalToday === ar.goalToday ? "" : ""` (always `""`). Removed. | ✅ |
| 2.5 | L | `domain-preview/.../Marketplace.tsx:370` | Pointless interpolation `` `…${"each"}` `` → literal `each`. | ✅ |
| 2.6 | **M** | `domain-dashboard/.../Dashboard.tsx:361` | Greeting hardcoded the Arabic comma `،` for **both** locales → English rendered `Good morning، Khalid`. Now locale-aware. | ✅ |
| 2.7 | **M** | `domain-employee/.../EmployeeHub.tsx:758,777` | Org-chart initials hardcoded (`"KS"`, `"AM"`), inconsistent with `profile.name` ("Khalid Al-Saadi" → "KA"). Now derived from profile data. | ✅ |
| 2.8 | L | `ServicesHub.tsx`, `IntelligenceHub.tsx`, `KanbanBoard.tsx` | Tone/`switch` helpers lacked exhaustive returns; a new union member could return `undefined` → runtime crash. Safe fallbacks / explicit return types added. | ✅ |
| 2.9 | L | `domain-services/.../ServicesHub.tsx:281` | `searchQuery` state is written but never used to filter — dead state / no-op search. | 📝 |
| 2.10 | L | `domain-work/.../WorkHub.tsx:369-374` | `focusSummary` hardcoded counts disagree with `focusDetails` rows. Two sources of truth. | 📝 |

---

## 3. Type safety

| # | Sev | Area | Issue | Status |
|---|-----|------|-------|--------|
| 3.1 | **H** | root | **No `typecheck` script**; root `tsconfig.json` was a no-op stub (`"files": []`). Added a strict, project-wide `tsconfig.json` covering `apps`+`packages` and a `typecheck` npm script — **0 errors under `strict`**. | ✅ |
| 3.2 | **M** | `domain-preview/.../PreviewHubPage.tsx:9` | Used `React.ComponentType` as a type with **no `React` import** (relied on a UMD global). Added explicit `import type`. | ✅ |
| 3.3 | L | `domain-preview/.../Engagement.tsx` | `FeedItem` models post+kudos as one all-optional type, forcing non-null `!` everywhere. A discriminated union would remove the casts. | 📝 |
| 3.4 | L | `shared-ui/.../input-group.tsx` | `(e.target as HTMLElement)` unchecked cast hardened to an `instanceof` guard. | ✅ |

---

## 4. Accessibility (a11y)

| # | Sev | File:line | Issue | Status |
|---|-----|-----------|-------|--------|
| 4.1 | **M** | `shared-ui/.../command.tsx` | `DialogTitle`/`DialogDescription` rendered as a **sibling of** `DialogContent` → command palette had no resolvable accessible name. Moved inside `DialogContent`. | ✅ |
| 4.2 | **M** | `domain-preview/.../Productivity.tsx:404` | Icon-only "add note" `<Button>` had no `aria-label`. Added. | ✅ |
| 4.3 | M | many pages | `cursor-pointer` cards/rows that are non-interactive `<div>`s (no `onClick`/`role`/`tabIndex`/keyboard). Presentational mock affordances; flagged for the real-data pass. | 📝 |
| 4.4 | L | `KpiCard.tsx` | Status conveyed by color/glyph only (no text alt / `aria-current`). | 📝 |
| 4.5 | L | `shared-ui/.../command.tsx:165` | Decorative icon missing `aria-hidden`. Added. | ✅ |

---

## 5. Performance

| # | Sev | Area | Issue | Status |
|---|-----|------|-------|--------|
| 5.1 | **H** | `apps/shell/.../App.tsx` | Routes used **static imports** → one 964 KB JS bundle (the architecture doc had claimed lazy routes were "done"; they weren't). Converted to `React.lazy` + `Suspense` so each domain ships as its own chunk (26–113 KB, on demand). Architecture doc corrected. | ✅ |
| 5.1b | **M** | `apps/shell/vite.config.ts` | Shared vendor libs all bundled into the entry chunk (688 KB > 500 KB warning). Added `manualChunks` splitting react / framer-motion / radix-base-ui into long-lived cache chunks. Warning cleared. | ✅ |
| 5.2 | L | `domain-work/.../WorkHub.tsx:640` | `columns={[...kanbanColumns]}` allocated a new array each render, defeating child memo. Pass the array directly. | ✅ |
| 5.3 | L | `IntelligenceHub.tsx`, preview hubs | Duplicated render blocks / inline literal arrays recreated each render. | 📝 |

---

## 6. Maintainability / Dead code

| # | Sev | File | Issue | Status |
|---|-----|------|-------|--------|
| 6.1 | **M** | `InsightCard.tsx`, `MiniCalendar.tsx`, `WorkflowStepper.tsx` | Three full components never imported (not in barrels). Deleted. | ✅ |
| 6.2 | **M** | `domain-preview/.../data/mock/previewHubs.ts` | ~187 lines of `previewContent` mock, never imported (incl. a stale `collaboration` hub). Deleted. | ✅ |
| 6.3 | M | mocks (`work.ts`, `employee.ts`, `dashboard.ts`) | Many exported mock constants never consumed. Removed those tied to deleted components; remainder noted. | ✅ / 📝 |
| 6.4 | **M** | `packages/shared-contracts/` | Empty package — no `package.json`, no source. Removed. | ✅ |
| 6.5 | L | `shared-ui/.../tooltip.tsx:53` | Dead `data-[state=delayed-open]` CSS (Radix leftover; Base UI uses `data-open`). Removed. | ✅ |
| 6.6 | **M** | `domain-preview/.../hubs/*.tsx` | 5 hub pages are structural near-copies. Should collapse into a shared `<HubLayout>` + primitives. Large refactor — deferred (see §8). | 📝 |
| 6.7 | L | `shared-ui/.../input-group.tsx` | Addon `onClick` didn't compose with consumer `onClick`; focus targeted `input` only. Now targets `[data-slot=input-group-control]` and composes. | ✅ |
| 6.8 | **M** | Dashboard/WorkHub/EmployeeHub | Inline mock data + repeated brand hex/rgba that bypass design tokens; monolithic page components. *(Brand tokens now exist — see [BRAND.md](BRAND.md) — so these can migrate to `bg-rose-gold`/`var(--rose-gold)`.)* | 📝 |

---

## 7. Architecture (verified ✅ — no violations)

- Domain → domain imports: **none** (boundary rule holds).
- Dependency direction `shell → domain-* → shared-*` is respected.
- Each domain exposes a clean named public API via `src/index.ts`.
- Preview nav is consumed by the shell via `@reach/domain-preview/nav` as documented.

---

## 8. Deferred refactors (recommended, not done in this pass)

1. **Collapse the 5 preview hubs** into a data-driven `<HubLayout>` + shared `<PageHeading>`, `<HubHero>`, `<CardHeader>`, and a `useSetToggle()` hook.
2. **Extract inline mock data** from `Dashboard.tsx` / `WorkHub.tsx` / `EmployeeHub.tsx` into each domain's `data/mock/*`.
3. **Tokenize hardcoded brand colors** into the brand tokens now defined in `index.css` (see [BRAND.md](BRAND.md)).
4. **Real interactivity + a11y pass** when mock affordances become wired (add `role`/`tabIndex`/keyboard or promote to `<button>`/`<a>`).
5. **Add `import/no-restricted-paths`** ESLint rule to *enforce* the domain-isolation boundary ([ARCHITECTURE.md](ARCHITECTURE.md) migration note #6).

---

## 9. Verification (post-fix)

| Gate | Before | After |
| ---- | ------ | ----- |
| `npm run lint` | ❌ 2 errors | ✅ 0 errors |
| `npm run typecheck` (new) | ⚠️ no script; non-strict, partial coverage | ✅ 0 errors, **strict**, project-wide |
| `npm run build` | ⚠️ 964 KB single chunk + size warning | ✅ code-split, no warnings |
| `npm audit` | ✅ 0 | ✅ 0 |
| Source files | 71 | 65 (6 dead files removed) |

---

## 10. Subsequent work (post-audit)

- **Brand palette wired in** — the official ALTANFEETHI colors are now design tokens in `index.css` (see [BRAND.md](BRAND.md)).
- **Logo redesigned** — flat two-color **وجهة** gateway mark (Work = Rose Gold + AI = Lavender + spark), code-drawn SVG; favicon updated to match; replaced ~448 KB of raster PNGs.
- **Typography confirmed** — the portal standardizes on **Aktiv Grotesk** (EN+AR) + **Astoria** headings.
- **Docs reorganized** — `ARCHITECTURE.md`, `BRAND.md`, and this file moved under `docs/`.
