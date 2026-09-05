# CLAUDE.md

Guidance for Claude Code (or any AI agent) working in this repository.

## Overview

**ez-parking-front** is the real, active frontend for the parking-lot management system
(there's a sibling `ez-parking` folder one level up that looks similar but is a stale,
abandoned Nuxt starter — ignore it, this is the one actually being developed). It talks
to **ez-parking-back** (`../ez-parking-back`, Express + Sequelize API) — see that repo's
CLAUDE.md for the API shape.

Two areas: `pages/auth/*` (login/register, not yet wired to a real auth flow) and
`pages/internal/*` (the authenticated app: dashboard, clients, metrics, organization),
under `layouts/default.vue` with `components/layout/navBar.vue` as the top nav.

## Stack

- Nuxt 3.17 (Vue 3.5)
- **Tailwind CSS v4** + **@nuxt/ui v3** (added 2026-09-04) — CSS-first config via
  `assets/css/tailwind.css` (`@import "tailwindcss"; @import "@nuxt/ui";`), no
  `tailwind.config.js` (v4 doesn't use one by default). Brand colors set in
  `app.config.ts` (`ui.colors.primary: "blue"`, `neutral: "slate"`).
  Nuxt UI's color-mode integration is **disabled** (`ui: { colorMode: false }` in
  `nuxt.config.ts`) — this app has no dark theme, and leaving color-mode on made pages
  render dark/unreadable whenever the browser's OS preference was dark. Don't re-enable
  it without actually designing a dark variant.
- `@nuxt/icon` (tabler/mdi/iconoir collections in use — mixed, not strictly one set)
- `@vueuse/core` / `@vueuse/nuxt` (`useDebounceFn`, `useWindowSize`, etc.)
- `maska` for input masks, `nuxt-toast` for toasts, `nuxt-echarts` for charts (metrics
  page), `@formkit/auto-animate`
- A **legacy hand-rolled component set** in `components/shared/` (`TButton`, `TInput`,
  `TModal`, `TSelect`, `TSpinner`, `TTable`, `TRemoveDataCard`) — same naming convention
  as the user's other project `BlokarFront`, likely copied from there. These are used
  across every page (`clients.vue`, `metrics.vue`, `organization.vue`, `auth/*`) — don't
  edit them for a single-page visual change, it ripples everywhere. New pages/screens
  should prefer **Nuxt UI components** (`UCard`, `UBadge`, `UButton`, `UInput`,
  `UTable`, `UButtonGroup`, …) going forward per the user's direction; the old `Shared*`
  components are being phased out screen by screen, not replaced in bulk.
- `composables/useApi.js` — thin wrapper, calls the back at `runtimeConfig.public.apiUrl`
  (defaults to `http://localhost:8080/`, override via `NUXT_APP_API_URL`).

## Commands

```bash
npm install
npm run dev       # http://localhost:3000 (falls back to 3001+ if taken)
npm run build
npm run generate
npm run preview
```

## Design system

Defined 2026-09-04, informed by parking-specific and general SaaS/fintech dashboard
references (Dribbble/Behance — clean card-based layouts, colored icon badges, pill
status badges, personalized greeting headers). New screens should follow this instead
of inventing new colors/spacing ad hoc.

- **Tokens live in [assets/css/tailwind.css](assets/css/tailwind.css)** as a Tailwind v4
  `@theme` block: `--color-ink`, `--color-ink-muted`, `--color-ink-faint`,
  `--color-surface`, `--color-page`, `--color-line`. These generate real utility classes
  (`text-ink`, `bg-page`, `border-line`, …) — use them instead of arbitrary hex like
  `text-[#0d151c]`. In plain CSS (scoped `<style>` blocks), the same tokens are
  available as CSS custom properties: `var(--color-ink)`, etc.
- **Semantic status colors stay as plain Tailwind palette colors**, not custom tokens —
  `emerald-500`/`-50`/`-700` for "available/free/ok", `rose-500`/`-50`/`-700` for
  "occupied/error", `amber-*` for warnings, `blue-*` for the occupancy/primary accent.
  These already carry meaning on their own; don't alias them into the ink/page system.
- **Cards**: `bg-surface border border-line rounded-2xl`, icon badges inside them are
  `w-9 h-9`–`w-10 h-10 rounded-xl` with a soft-tint bg (`bg-blue-50 text-blue-600`, one
  tint per stat/category, never the same tint twice on one screen).
- **Pills/badges**: `rounded-full`, small dot + label for status (see the vacancy status
  badges), `UBadge` with `variant="subtle"` for anything Nuxt-UI-driven.
- **Primary actions**: solid dark (`bg-ink`/`color="neutral" variant="solid"`) pill
  buttons, not the brand blue — blue is reserved for the occupancy/primary-metric
  accent, not CTAs. See the floating "Novo check-in" button and the navbar's active-link
  pill for the pattern.
- **Headers**: a small `text-ink-muted` greeting line ("Bom dia"/"Boa tarde"/"Boa noite",
  time-of-day computed client-side) above the page `<h1>`, with the current date at
  `text-ink-faint` on the opposite side — see the top of
  [pages/internal/index.vue](pages/internal/index.vue).
- **Navbar is a floating pill**, not full-width — `fixed`, rounded-full,
  `bg-surface/90 backdrop-blur-md`, centered with side insets. If you add anything
  `position: fixed` inside it, remember the pill's own `backdrop-blur` creates a new
  CSS containing block for fixed descendants — the mobile dropdown menu had to be
  `<Teleport to="body">`'d out of it for this reason; see
  [components/layout/navBar.vue](components/layout/navBar.vue).
- Font is "Space Grotesk" (set globally in `assets/css/main.css`), not a Tailwind/Nuxt
  UI default — keep it unless explicitly asked to change it.

## Conventions

- Organization is hardcoded to id `1` in dashboard calls (`/dash/vacancies-by-organization/1`)
  — there's no multi-tenant org switcher yet.
- Status codes: vacancy/vehicle `status` fields are numeric enums (`0` = available/car,
  `1` = occupied, etc. — check the specific model, they're not all the same enum).
- pt-BR throughout: labels, `toLocaleString("pt-BR", ...)` for dates/currency.
- Nuxt UI's `UTable` (v3) is TanStack-table-based: columns are `{ accessorKey | id,
  header }` objects, custom cell rendering via `#<key>-cell="{ row }"` slots where
  `row.original` is the actual data row (not `row` directly — that's a TanStack `Row`
  wrapper). See [pages/internal/index.vue](pages/internal/index.vue) for a full example
  (stat cards, status badges, filter chips, search, table, all Nuxt UI).

## Key files

- [pages/internal/index.vue](pages/internal/index.vue) — dashboard; reference
  implementation for the Nuxt-UI-based visual direction the app is moving toward.
- [layouts/default.vue](layouts/default.vue), [components/layout/navBar.vue](components/layout/navBar.vue)
  — shell/nav, shared by every `internal` and `auth` page.
- [components/dashboard/check-modal.vue](components/dashboard/check-modal.vue) — the
  check-in/check-out form used from the dashboard's "Novo check-in" button.
- `app.config.ts` — Nuxt UI theme colors (runtime, editable without rebuild in dev).
- `nuxt.config.ts` — note the `ui: { colorMode: false }` block; see Stack section above.

## Testing

None. No test runner configured.

## Open questions / known state

- Auth pages (`pages/auth/login.vue`, `register.vue`) exist but there's no visible
  guard/middleware wiring seen yet tying them to the `internal` routes — verify before
  assuming there's a real auth gate.
- Visual redesign is in progress **screen by screen** (dashboard done 2026-09-04) using
  Nuxt UI — don't assume the rest of `pages/internal/*` (`clients.vue`, `metrics.vue`,
  `organization.vue`) matches the new look yet; they still use the old `Shared*`
  components and the pre-redesign visual style.
- No deploy target, no CI, no `.env.example` committed (an `.env` exists locally but
  isn't documented here — check its contents directly rather than assuming).
