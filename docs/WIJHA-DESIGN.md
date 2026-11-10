# WIJHA v2 — design implementation guide

Source of truth: Figma file **"وجهة - WIJHA (Copy)"**, page **"Final Design 1.0"** (read through the
DesignAgent bridge). Every screen is drawn **dark + Arabic (RTL)** at 1440px (web) and 393px (phone).
A screen-by-screen inventory with Arabic labels and translations lives in
`ALTANFEETHI/design/Wijha - Screen Inventory.md`.

## Tokens (already in `apps/shell/src/index.css`)

Use the semantic Tailwind utilities — never hex in components (except the purple badge `#a997c7`).

| Figma variable | Utility / var | Dark | Light |
|---|---|---|---|
| Page/Fill | `bg-background` | #0f0e0e | #f3f0ee |
| Card/Fill/Primary | `bg-card` (`.panel`) | #1b1a1a @50% | #fdfcfc @50% |
| Card/Stroke/On-Color | `border-border` | #f3eef1 @9% | #1e1218 @9% |
| Text/Primary | `text-foreground` | #f3eef1 | #0f0e0e |
| Text/Secondary | `text-muted-foreground` | #f3eef1 @70% | #0f0e0e @71% |
| Shape/Icons | `text-icon` | #f3eef1 @70% | |
| Shape/Accent, Text/Accent | `text-primary` / `bg-primary` | #bc9951 | #ab8025 |
| Button/Fill/Primary 15% | `bg-soft-accent` | gold @15% | |
| Shape/Fill/Secondary | `bg-secondary` / `bg-muted` | #2c2b2b | #eae2cb |
| Card Separater | `.card-separator` (fading hairline) | | |
| Status/* | `text-success bg-success-fill`, `warning`, `error`, `info` | | |
| Second Accent (per module) | `text-module` / `var(--module-accent)` | set by the shell from the route | |

Radius: cards 12–16px (`rounded-xl`/`rounded-2xl`), buttons/inputs 8px (`rounded-lg`), chips full.
Spacing scale: 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40. Page content padding is **40px** (`px-10`) with
**24px** gaps between cards and **40px** between page sections.
Typeface: Aktiv Grotesk everywhere (already the default). Sizes: title 18 bold, card title 16 bold,
body 14, meta 12, micro 10.

## Ready-made classes

- `.panel` — the standard Figma card (translucent fill + hairline ring). Add `rounded-2xl p-5`.
- `.highlight-card` — the "Hero Section" special card (module-tinted gradient, radius via markup).
  Optional hue: `.hl-green` (employee), `.hl-violet` (knowledge/AI), `.hl-rose` (learning),
  `.hl-fuchsia` (operations), `.hl-amber` (gold).
- `.btn-primary-grad` — Figma primary button: gold @80%, dark label. Shared `<Button>` default
  variant already maps to `--primary`.
- `.accent-chip` — gold-tinted chip. `.icon-tile` — 36px secondary square icon button.
- Card header pattern from the designs: title (16 bold) with a small accent icon at the start,
  a short gold underline beneath the title, actions at the end.

## Rules (from `ALTANFEETHI/BUILD-GUIDELINES.md` — they still apply)

- Every string in **English and Arabic**; layouts use logical properties (`ps-`, `me-`, `start-`,
  `end-`, `text-start`); directional icons mirror in RTL.
- **No horizontal page scroll**; wide tables scroll inside their own container.
- **Match Figma exactly — the owner's decision of 2026-11-10 overrides BUILD-GUIDELINES U1 for v2.**
  Where Figma draws a create/edit *modal* or popup, build it as a modal/popup exactly as drawn,
  opened from the page that shows it. Existing routed editor pages stay reachable (do not delete
  capability) but are not the primary path where a modal exists in the design.
- Build every state the design shows (empty, loading, no-results, filled, error).
- Do not delete existing fields or capability because a design omits them — keep and restyle.
- Currency SAR, grouped in threes; never Indian grouping.
- Domains never import other domains. Shared shell files (`App.tsx`, `config/navigation.ts`,
  `config/page-titles.ts`, `index.css`, `layouts/*`, `components/layout/Sidebar.tsx`,
  `components/layout/TopBar.tsx`) are owned by the integrator — report the routes/titles you need.
- Fix obvious placeholder errors in the designs rather than copying them (duplicate request IDs,
  "Page 1 › Page 2" breadcrumbs, wrong titles, mismatched counts).
