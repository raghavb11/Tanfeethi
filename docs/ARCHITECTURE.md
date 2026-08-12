# Reach — frontend modular architecture

This repo uses a **modular monolith** (single SPA, npm workspaces): one deployable app (`@reach/shell`) composes **domain packages** plus **shared** layers. Domain packages must not import each other.

> Companion docs: [BRAND.md](BRAND.md) (colors + typography) · [quality.md](quality.md) (code-quality audit).
> "Reach / وجهة" is the portal product; **ALTANFEETHI / التنفيذي** is the company brand.

---

## 1. Strategy

**Chosen:** modular monolith + route-based lazy loading (`React.lazy`).
**Not chosen by default:** Module Federation — add only when a domain needs independent deployment.

**Why:** Strong team boundaries via packages + CI without the runtime integration cost of microfrontends.

---

## 2–3. Domains & ownership

| Package | Purpose | Route (shell registers) |
|---------|---------|--------------------------|
| `@reach/domain-dashboard` | Exec/employee dashboard aggregations | `/` |
| `@reach/domain-work` | Tasks, Kanban, workflows | `/work` |
| `@reach/domain-employee` | Profile, attendance, leave, expenses | `/employee` |
| `@reach/domain-services` | Catalog, requests, assets | `/services` |
| `@reach/domain-intelligence` | Copilot, predictions, summaries | `/intelligence` |
| `@reach/domain-preview` | Preview hubs; exports `previewNav`, `hubMeta` | `/hubs/:hubId` |

*(An operations domain — ops tiles, incidents, alerts — is a candidate future package; not implemented.)*

**Shell-only:** layout, sidebar, command palette, notifications drawer, navigation merge (`mainNav` + preview hubs from the preview domain).

---

## 4. Target layout (implemented)

```
apps/shell/                 # Vite host: router, shell UI, CSS tokens, providers
packages/shared-core/       # cn(), tiny utils
packages/shared-ui/         # Design system (shadcn/base-ui primitives + MotionCard)
packages/shared-mocks/      # Cross-cutting demo data (e.g. notifications)
packages/shell-context/     # Shell-only React context (avoids shell ↔ domain cycles)
packages/domain-*/          # One package per bounded context; public API = src/index.ts
```

**Circular dependency rule:** `apps/shell` → `domain-*` → `shared-*`. Domains never import other domains. Preview navigation is consumed by the shell via `@reach/domain-preview/nav`. *(Verified clean — see [quality.md](quality.md) §7.)*

---

## 5. Shared layers (allowed / forbidden)

| Layer | Allowed | Forbidden |
|-------|---------|-----------|
| `shared-ui` | Primitives, composition helpers | Domain entities, routes |
| `shared-core` | Pure utilities (`cn`) | React-specific business state |
| `shared-mocks` | Demo fixtures shared by shell + pages | Production API shapes (mock-only for now) |
| `shell-context` | Shell UI state (panels, sidebar, locale) | Domain data |

*(Future: `shared/types`, `shared/api`, `shared/config`, `shared/permissions` once a real backend lands.)*

---

## 6. Dependency boundaries

- **Domains may import:** `@reach/shared-ui`, `@reach/shared-core`, `@reach/shell-context` (only when a screen needs shell affordances, e.g. opening notifications), `react`, `react-router-dom`, `lucide-react`, `framer-motion`.
- **Domains must not import:** other `@reach/domain-*`, or `apps/shell` paths.
- **Cross-domain communication:** URLs, shared read-only types (future `shared/types`), or shell-level events — not direct imports.

---

## 7. Styling & typography

- **CSS tokens** live in `apps/shell/src/index.css` (`@theme` + light/dark `:root`/`.dark`), consumed as Tailwind v4 utilities.
- **Fonts (as implemented):** **Aktiv Grotesk** — one variable font covering Latin **and** Arabic — drives UI/body (`--font-sans`, `--font-arabic`); **Astoria** drives display headings (`--font-heading`, Aktiv Grotesk fallback for Arabic glyphs).
- **Brand palette:** the ALTANFEETHI colors are exposed as tokens (`--rose-gold`, `--saudi-green`, …) → utilities `bg-rose-gold` etc. Full palette + pairing rules in [BRAND.md](BRAND.md).

---

## 8. Vite / build setup

- **Workspaces** link `@reach/*` packages.
- **Lazy routes** in `apps/shell/src/App.tsx` use `React.lazy` + a `Suspense` fallback so each domain ships as its own chunk, fetched on first visit.
- **`manualChunks`** (`vite.config.ts`) split heavy vendors (react / framer-motion / radix-base-ui) into long-lived cache chunks. No single chunk exceeds the 500 KB warning threshold.
- No Module Federation unless requirements change.

---

## 9. Folder reference

See the repository tree under `apps/` and `packages/`. Each domain exposes a **public API** in `src/index.ts` (e.g. `DashboardPage`, `WorkPage`) as a `default`-aliased named export.

---

## 10. Migration notes (incremental)

1. Extract **shared-ui** + **shared-core** — ✅ done.
2. Introduce **shell-context** for shared shell state — ✅ done.
3. Move **one domain at a time** into `packages/domain-*` with `index.ts` exports — ✅ done.
4. Switch shell to **lazy imports** — ✅ done (real `React.lazy` + `Suspense`).
5. Add a strict, project-wide **`typecheck`** gate — ✅ done (`tsconfig.json` covers `apps`+`packages`).
6. **Next:** add ESLint **`import/no-restricted-paths`** to *enforce* the domain-isolation boundary at lint time.

---

## 11. Conventions

- **Exports:** Only named exports from `packages/domain-*/src/index.ts` (e.g. `DashboardPage`).
- **Routes:** Shell owns the router; domains export page components only.
- **State:** Prefer local/domain state; shell context for global chrome only.
- **API (future):** Per-domain `api/` clients built on a shared transport package — not inside `shared-ui`.

---

## Commands

```bash
npm install          # root — installs all workspaces
npm run dev          # runs @reach/shell dev server
npm run lint         # eslint apps packages
npm run typecheck    # strict, project-wide tsc --noEmit
npm run build        # production build (shell): typecheck + vite build
```
