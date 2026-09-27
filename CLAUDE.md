# Brewnal — Project Context

Specialty coffee brewing journal app.

## Stack

- FE: React + Vite + TypeScript (apps/web)
- BE: Node.js + Fastify + TypeScript (apps/api)
- ORM: Prisma
- DB: PostgreSQL (VPS)
- Storage: VPS
- AI: Gemini
- i18n: i18next (ID + EN)
- prioritize security

## Current Phase

MVP — urutan dev:

1. Auth flow (register, login, JWT) ← NEXT
2. Beans CRUD
3. Brew Journal CRUD
4. AI scan kemasan
5. Dashboard

## Key Decisions

- Sensory scale 1-3 (bodyness, sweetness, acidity)
- Expected (dari beans/kemasan) vs Actual (dari brew)
- Light mode default, dark mode opsional
- Bahasa Indonesia sebagai default language

## Design System

Source of truth: **Brewnal Design System** in Claude Design: https://claude.ai/design/p/2c9c6bb0-d28a-4c00-984a-e66720ee13f2

- The token file `colors_and_type.css` and the `preview/` cards are authoritative. The prose `README.md` there still describes the old cream/orange/teal palette and Fraunces. Ignore those parts.
- Tokens are mirrored in `apps/web/src/index.css` (CSS variables for light and dark) and `apps/web/tailwind.config.js`. Change the design system first, then sync here. Never hardcode hex values in components; use the Tailwind tokens.
- Palette: `primary` is navy `#0D319D` (CTAs, active nav, links, stat numbers). `secondary` is orange `#FE782F`, used **for fills and tints only**; orange text on an orange tint uses `text-secondary-ink`. `pop` is yellow `#FFBE0B` (★ ratings only). The background `bg` is grey `#F4F4F4` and `surface` is white.
- Fonts (self-hosted via `@fontsource`, no Google Fonts CDN): `font-display` is Montserrat 900 (titles, the `brewnal` wordmark, stat numbers). `font-sans` is Varta (all UI). `font-mono` is JetBrains Mono (numbers, dose/ratio/ml, tasting-note chips).
- Component patterns (from `preview/components-*.html`):
  - Card: `bg-surface border border-border rounded-xl p-4`, with `hover:border-primary`. No shadow.
  - Primary button: `bg-primary text-white rounded-lg px-4 py-2 hover:bg-primary-hover`.
  - Secondary button: `bg-secondary/15 text-ink rounded-lg`.
  - Ghost button: `border border-border text-muted`.
  - Danger button: `text-danger`, no background.
  - Input: `bg-surface border border-border rounded-lg`, with `focus:border-primary` and no ring.
  - Tags (`rounded-full`): origin `bg-bg border border-border text-muted`; process `bg-secondary/15 text-ink`; roast `bg-primary/10 text-primary`.
  - Tasting chip: `font-mono text-secondary-ink bg-secondary/10 rounded`.
  - Motion: `transition-colors` only. No hover transforms.

## UI Assets (public collections)

Always use these collections. Don't mix in other sets, emoji-as-icons, or AI-generated images.

### Icons: Lucide (`lucide-react`, ISC), as recommended by the design system

- Single-weight stroke style, matching the brand. Coffee icons: `Coffee`, `Bean`, `Droplet`, `Thermometer`, `Timer`, `Scale`, `Star`, `Camera`.
- Default `size={16}` inline and `size={20}` in nav. Keep the default stroke width.
- Color through Tailwind `text-*` tokens (icons use `currentColor`), so dark mode works automatically.
- Import named icons only (`import { Coffee } from 'lucide-react'`). Never use the CDN build.
- Icon-only buttons need an `aria-label` from i18n. Decorative icons get `aria-hidden`.
- Browse: https://lucide.dev/icons

### Illustrations: brand style first, unDraw as fallback

- The brand style is flat line art with navy `#0D319D` outlines, orange `#FE782F` and teal/sky fills, a white background and no texture. The reference is `assets/illustration-coffee-equipment.png` in the design system; save it to `apps/web/src/assets/illustrations/`.
- Fallback: unDraw (https://undraw.co, free for commercial use, no attribution). Set the accent color to `#FE782F` before downloading. Only use it if it matches the brand style.
- Use them for empty states, auth pages, onboarding, and 404 or error pages. Don't use them inside dense data views.
- Sanitize SVGs (remove `<script>`, event handlers, and external `href`s; run them through SVGO). Render with `<img src={...} alt={t(...)} />`, never `dangerouslySetInnerHTML`.
- Keep them small (max ~240px wide on mobile).

### Photos: Unsplash (https://unsplash.com/license), outside the app UI only

- The design system says **no photography in the app UI**. Use photos only for non-app surfaces: a landing page, social/OG images, and store listings. User-uploaded bean photos come from our own VPS storage.
- Fallback source: Pexels (https://www.pexels.com/license).
- Self-host, never hotlink: download, resize to WebP (max 1600px wide, ≤200 KB), and save to `apps/web/public/photos/`. This keeps a tight CSP (`img-src 'self'`).
- Record every photo in `apps/web/public/photos/CREDITS.md` with the file name, photographer, source URL, and license.
