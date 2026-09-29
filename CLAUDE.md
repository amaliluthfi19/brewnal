# Brewnal — Project Context

Specialty coffee brewing journal app.

## Stack

- Monorepo: pnpm workspaces + Turborepo. Shared types live in `packages/types` (`@brewnal/types`), used by both apps.
- FE (`apps/web`): React 18 + Vite + TypeScript, react-router v6, TanStack Query (server state), Zustand (auth store), axios with `withCredentials`, Tailwind.
- BE (`apps/api`): Node 20 + Fastify 5 + TypeScript, with `@fastify/jwt`, `@fastify/cookie`, `@fastify/cors`, `@fastify/multipart` (5 MB limit).
- ORM: Prisma 7 with `@prisma/adapter-pg`. Schema is in `apps/api/prisma/schema.prisma` and config in `apps/api/prisma.config.ts`.
- DB: PostgreSQL 16 (`apps/api/compose.yaml` for local Docker).
- Storage: not implemented yet (target: VPS). `Bean.photoUrl` is only rendered when self-hosted. The `SUPABASE_*` vars in `.env.example` are unused leftovers.
- AI scan: currently OCR.space plus regex parsing (`apps/api/src/modules/ai/ai.service.ts`, `OCR_SPACE_API_KEY`). The target is Gemini. The `@anthropic-ai/sdk` dependency is unused.
- i18n: i18next (ID + EN) on both sides. Web translations are inline in `apps/web/src/lib/i18n.ts` (fallback `id`). API error messages are in `apps/api/src/lib/i18n.ts`, chosen by `Accept-Language`.
- prioritize security

## Structure

- API modules are in `apps/api/src/modules/<name>/` as `<name>.routes.ts` + `<name>.service.ts` (+ `<name>.schema.ts` for Fastify JSON schemas). Auth uses the `authenticate` preHandler in `src/middleware/auth.middleware.ts`.
- Web: `pages/` (auth, beans, brews, dashboard), `services/*.service.ts` (axios calls), `components/ui` (Stepper, SensoryInput, StarRating, TastingNoteInput, ComboInput, PasswordInput, LanguageToggle), `components/layout`, `lib/brew-presets.ts`.
- The brew form is a wizard (`pages/brews/wizard/`) with four steps: ChooseBean → Tools → Recipe → Rating. It's used for both create and edit.

## API

All routes except register/login/health require auth. Responses look like `{ data, message }` or `{ error, statusCode }`.

- `/auth`: `POST /register`, `POST /login`, `POST /logout` (blacklists the token), `GET /me`
- `/beans`: `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`
- `/brews`: `GET /`, `GET /suggestions`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`
- `/ai`: `POST /scan-label` (multipart image)
- `/profile`: `PATCH /identity` (brewer identity: `BEGINNER`, `HOME_BREWER`, `BARISTA_CAFE`, `BARISTA_COMPETITION`)
- `GET /health`

## Security Conventions

- JWT is stored in an httpOnly cookie named `token` (`secure` in production, `sameSite: 'strict'`). Never store tokens in localStorage.
- The API refuses to start if `JWT_SECRET` is missing or shorter than 32 characters.
- Logout writes the token to `TokenBlacklist`, and `authenticate` checks it.
- CORS allows only `CORS_ORIGIN`, with credentials.
- Every query must be scoped to the authenticated `userId`.

## Commands

- `pnpm dev` / `pnpm build` / `pnpm type-check` from the root (Turbo).
- `pnpm --filter api db:migrate` / `db:generate` / `db:studio`.
- Env: copy `apps/api/.env.example` and `apps/web/.env.example` to `.env`.

## Deploy

- Web: Netlify (`netlify.toml`). It builds `apps/web/dist` and proxies `/api/*` to the Railway API.
- API: Railway, using `apps/api/dockerfile` and `apps/api/railway.json` (health check `/health`). Railway waits for the GitHub Actions CI (`.github/workflows/deploy-api.yml`) to pass.
- `.github/workflows/deploy-web.yml` runs type-check and build for the web app.

## Current Phase

MVP. All five first-pass features exist:

1. Auth (register, login, logout, `/me`, cookie JWT) ✅
2. Beans CRUD ✅
3. Brew Journal CRUD (wizard + suggestions) ✅
4. Label scan (OCR.space; Gemini still to come) ✅
5. Dashboard (built from the beans + brews queries) ✅

Also built: brewer-identity onboarding (`/profile/identity`).
Open items: photo upload to storage, switching the scan to Gemini.

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
