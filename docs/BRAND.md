# ALTANFEETHI — Brand Reference

Palette + typography + logo reference for the portal. Color tokens live in
[apps/shell/src/index.css](../apps/shell/src/index.css) under the `@theme` block.

> "Reach / وجهة" is the internal **portal/product** name; **ALTANFEETHI / التنفيذي**
> is the company brand the visual identity belongs to.
> Companion docs: [ARCHITECTURE.md](ARCHITECTURE.md) · [quality.md](quality.md).

---

## 1. Color palette

Source: *ALTANFEETHI Visual Identity Guidelines* §Brand Colors.

### Primary (use in most cases)

| Name | HEX | RGB | Pantone | Token |
|------|-----|-----|---------|-------|
| **Rose Gold** | `#CE7B5B` | 211, 132, 98 | 2433 C | `--rose-gold` / `*-rose-gold` |
| **Black** | `#000000` | 0, 0, 0 | Black 6 C | `--brand-black` / `*-brand-black` |
| **Saudi Green** | `#234024` | 35, 64, 36 | 2411 C | `--saudi-green` / `*-saudi-green` |
| **Sand** | `#F3F0EE` | 243, 240, 238 | Cool Gray 1 C | `--sand` / `*-sand` |

### Secondary (accents only — sparingly, ≤5% each, never as backgrounds)

| Name | HEX | RGB | Pantone | Token |
|------|-----|-----|---------|-------|
| **Dark Gold** | `#AB8025` | 171, 128, 37 | 7551 C | `--dark-gold` |
| **Lavender** | `#9C7DDE` | 156, 125, 222 | 2087 C | `--lavender` |
| **Royal Purple** | `#3D2031` | 61, 32, 49 | 511 C | `--royal-purple` |

Tokens are real runtime CSS variables **and** generate Tailwind utilities (`bg-rose-gold`, `text-saudi-green`, …).

### Usage balance

`Black 30% · Sand 30% · Rose Gold 15% · Saudi Green 15% · Dark Gold / Royal Purple / Lavender ≤5% each`

Secondary colors are **highlights/accents only** — never background or large fills.

### Pairing rules

- **Black** — primary surface; pair with Rose Gold. May take **one** secondary accent at a time.
- **Saudi Green** — background color; pair with Sand + Black, or with Rose Gold. *When combining Saudi Green with Black, use Sand as an intermediary.*
- **Rose Gold** — as an accent pairs with any primary; as a **background/large fill** only with Sand and Black.
- **Sand** — combines with any brand color.
- **Dark Gold** — accent, only with Black.
- **Lavender** — accent, only with Black and Rose Gold.
- **Royal Purple** — accent, only with Black and Rose Gold.

---

## 2. Typography

**The portal's typeface is Aktiv Grotesk** — a single variable font that covers **both Latin and Arabic**, chosen so EN/AR UI shares one consistent type system. **Astoria** is used for display headings.

| Role | Typeface | Token |
|------|----------|-------|
| UI / body (Latin **and** Arabic) | **Aktiv Grotesk** | `--font-sans`, `--font-arabic` |
| Display headings (Latin) | **Astoria** | `--font-heading` (Aktiv Grotesk fallback for Arabic glyphs) |

```css
--font-arabic: "Aktiv Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

Fonts are self-hosted (`apps/shell/public/fonts/*.woff2`) and the primary face is preloaded in `index.html`.

> **Brand-spec reference:** the original ALTANFEETHI *print* identity specifies **Almarai** (Arabic) and **Astoria Roman + Gotham Book** (Latin). The digital portal intentionally consolidates onto **Aktiv Grotesk** (one variable font, EN+AR) for the app UI, keeping **Astoria** for headings.

---

## 3. Logo

**Shipped** ([apps/shell/src/components/BrandLogo.tsx](../apps/shell/src/components/BrandLogo.tsx), [favicon](../apps/shell/public/favicon.svg)):
a flat, two-color **gateway portal** mark — two converging paths, **Work = Rose Gold `#CE7B5B`** and
**AI = Lavender `#9C7DDE`**, meeting at one destination, with a Lavender **AI spark** above — locked up with
the Arabic wordmark **وجهة** (Aktiv Grotesk, bold). Colors are intrinsic to the SVG (no raster, theme-independent).
Rose Gold + Lavender is a compliant pairing (Lavender pairs with Rose Gold/Black) with Lavender kept as a small accent.

**Parent-brand reference:** the official ALTANFEETHI mark is the **palm-tree / runway / "T-from-Tanfeethi"**
symbol (palm canopy = Kingdom; crossed runway paths = "the beginning & ending of every journey"),
with the **التنفيذي / ALTANFEETHI** logotype — use that when representing the company itself rather than the portal.
