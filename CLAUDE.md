# CLAUDE.md

Guidance for Claude Code (or any AI agent) working in this repository.

## Overview

**ez-parking-front** is the real, active frontend for the parking-lot management system
(there's a sibling `ez-parking` folder one level up that looks similar but is a stale,
abandoned Nuxt starter — ignore it). It talks to **ez-parking-back**
(`../ez-parking-back`, Express + Sequelize API) — see that repo's CLAUDE.md for the API
shape, the real feature inventory, and the phased roadmap (auth is the current phase).

Two areas: `pages/auth/*` (login, "criar organização" — **real auth**, see below) and
`pages/internal/*` (the app: vagas, métricas, clientes, auditoria, colaboradores,
organização), under `layouts/default.vue` with `components/layout/sideNav.vue` /
`navBar.vue` (mobile) as navigation. Every internal page now reads the real, logged-in
collaborator's `organizationId` via `useCurrentOrganizationId()` instead of a hardcoded
`1` — see Authentication below.

## Stack

- Nuxt 3.17 (Vue 3.5)
- **Tailwind CSS v4** + **@nuxt/ui v3.3.7** — CSS-first config via
  `assets/css/tailwind.css` (`@import "tailwindcss"; @import "@nuxt/ui";`), no
  `tailwind.config.js`. Brand colors in `app.config.ts`: `{ primary: "green", secondary:
  "sky", success: "green", info: "sky", warning: "amber", error: "red", neutral: "slate" }`.
  Dark mode is **enabled** and real (`colorMode: { classSuffix: "" }` in
  `nuxt.config.ts`) — don't disable it, both themes are actively maintained.
- `@nuxt/icon` — icons are `tabler:*` (via `<Icon name="tabler:...">`) or `i-tabler-*`
  (Nuxt UI component `icon` props) — pick whichever the surrounding code already uses,
  don't introduce a second icon set.
- `@vueuse/core` / `@vueuse/nuxt` (`useDebounceFn`, `useWindowSize`, …)
- `vue3-apexcharts` (`apexcharts`) for charts on the Métricas page — not `nuxt-echarts`,
  despite it being a devDependency; that one is unused, don't reach for it.
- `nuxt-toast` for toasts, `maska` for input masks (both in active use).
  `@formkit/auto-animate` is an installed-but-currently-unused dependency (its one call
  site, the old multi-step register page, was simplified away) — don't assume it's wired
  anywhere before using it.
- A **legacy hand-rolled component set** in `components/shared/` (`TButton`, `TInput`,
  `TModal`, `TSelect`, `TTable`, `TRemoveDataCard`) is now **dead code** — nothing
  imports them anymore. Only `TSpinner` (`SharedTSpinner`) is still used, as a small
  chart-loading fallback. Don't build new UI on the dead ones; use Nuxt UI components
  (`UModal`, `UButton`, `UInput`, `UFormField`, `USelect`, `UTable`, …) — every page
  listed under "Key files" below is a real example of the current pattern.
- `composables/useApi.js` — thin `$fetch` wrapper, calls the back at
  `runtimeConfig.public.apiUrl` (defaults to `http://localhost:8080/`, override via
  `NUXT_APP_API_URL`). Sends the real session token (from the `ez_token` cookie, set by
  `useAuth()`) as a Bearer header when one exists; omits the header entirely otherwise
  (e.g. before login).

## Commands

```bash
npm install
npm run dev       # http://localhost:3000 (falls back to 3001+ if taken)
npm run build
npm run generate
npm run preview
```

## Design system — "Terminal Operational Console" (palette v2)

Replaced an earlier violet/teal "clean SaaS" pass. Built from a real Stitch reference
project (id `10485899309318797030`, fetched via the Stitch MCP connector) after
researching what makes UIs read as generic/AI-templated — the fix is flat colors, dense
hairline borders, and monospace for data, not another gradient-and-shadow pass.

- **Tokens in [assets/css/tailwind.css](assets/css/tailwind.css)** as a Tailwind v4
  `@theme` block, each redefined under `.dark`: `--color-ink`, `--color-ink-muted`,
  `--color-ink-faint`, `--color-surface`, `--color-surface-2`, `--color-page`,
  `--color-line`, `--color-brand` (green — primary/active), `--color-brand-2` (blue —
  secondary/info), `--color-brand-soft` (a plain `rgba()` literal per mode — **not**
  `color-mix()`, which silently drops the whole declaration on unsupported browsers,
  a real bug hit once already), `--color-warning`, `--color-danger`.
- **No gradients, no ambient box-shadows, no pill shapes** (`rounded-full`) except tiny
  status dots. `rounded` (the 4px default), not `rounded-xl`/`rounded-2xl`, on cards,
  inputs, buttons, badges.
- **Fonts**: Inter for everything (`--font-sans` / `--font-display` — no separate
  display face), JetBrains Mono (`--font-mono`) enforced for all *operational data*:
  plates, timestamps, currency, IDs, dwell durations.
- **Mono kicker labels** everywhere: `font-mono text-[11px] uppercase tracking-wide
  text-ink-faint` — used for stat-card labels, form field labels
  (`UFormField :ui="{ label: '...' }"`), section headers.
- **`LayoutPageHeader`** ([components/layout/pageHeader.vue](components/layout/pageHeader.vue))
  — shared title/subtitle/breadcrumb component ("● Sistema online · {org}") used by
  every `internal` page for cross-screen consistency. Use it on any new internal page.
- **`SharedTrendBadge`** ([components/shared/TrendBadge.vue](components/shared/TrendBadge.vue))
  — `+X%`/`-X%` with an arrow, or nothing when the value is `null`. Never fabricate a
  0% when there's no comparable prior period — pass `null` instead.
- **`SharedLogoMark`** ([components/shared/LogoMark.vue](components/shared/LogoMark.vue))
  — the flat green logo badge, used on `auth/*` pages; `sideNav.vue`/`navBar.vue` still
  inline the same SVG directly (not yet switched to this shared component).
- **No fake data, ever**: skip anything that would need data the system doesn't
  actually have (fake pagination, "sincronizado em tempo real", invented IDs/hashes) —
  show an honest empty state instead. This bit the team once with a Stitch mock that had
  to be stripped of exactly this kind of thing before shipping (Auditoria, Colaboradores).
- **`USelect` gotcha**: an option's `value` can never be `""` (empty string) — Nuxt UI's
  underlying Reka UI throws `A <SelectItem /> must have a value prop that is not an
  empty string`. Use `null` for an "all/none" option instead (see `audit.vue` or
  `collaborators.vue`'s filter selects).

## Authentication (real, added 2026-09-05)

- `composables/useAuth.js` — `token` (a `useCookie("ez_token")`, 7-day expiry, SSR-safe),
  `user` (a `useState`, the sanitized collaborator from the backend), `isAuthenticated`,
  `login()`, `register()`, `logout()`, `fetchMe()` (restores `user` from the token after
  a hard refresh — SSR state is empty even though the cookie survived).
- `middleware/auth.global.js` — runs on every navigation: bounces `/internal/*` to
  `/auth/login` when logged out, bounces `/auth/*` to `/internal` when logged in, and
  sends `/` to whichever of those applies.
- `composables/useCurrentOrganization.js` — `useCurrentOrganizationId()` returns a
  computed with the real, logged-in collaborator's `organizationId`. Use this instead of
  a literal `1` in any new internal page's API calls.
- `layouts/default.vue` awaits `fetchMe()` before rendering its slot, so
  `useCurrentOrganizationId()` is safe to read immediately in any page under it — no
  need to guard against it being `undefined` on first render.
- `pages/auth/register.vue` posts to `/auth/register`, which creates the organization
  **and** its first collaborator (Super admin) together — there's no separate "join an
  existing org" flow (removed; see backend CLAUDE.md's business rule).
- **Fixed 2026-09-06**: the backend now guards every org-scoped read too
  (`ownOrganizationOnly` on the route) — see `ez-parking-back/CLAUDE.md`'s Authentication
  section. The one remaining gap there is individual-record routes with no org in the
  URL at all (collaborator/client/vehicle by bare id), not something this repo can fix.

## Pages built so far (redesigned to the current system)

Every real page now matches: `pages/internal/index.vue` (Vagas), `metrics.vue`,
`clients.vue`, `audit.vue`, `collaborators.vue`, `organization.vue` (redesigned
2026-09-06 — same flat-card/mono-label shape as the rest, real "última atualização"
timestamp from the org's own `updatedAt` instead of the fabricated "por Carlos M."
attribution the Stitch mock had), and `auth/login.vue` / `auth/register.vue` ("Criar
organização" — single flow; the old "join an existing organization by ID" self-service
path was removed since collaborators aren't meant to self-register into an org, per the
backend's business rule).

## Conventions

- pt-BR throughout: labels, `toLocaleString("pt-BR", ...)` for dates/currency.
- Status codes are numeric enums (vacancy/vehicle `status`, collaborator `role`) — check
  the specific model/component, they're not all the same enum.
- Nuxt UI's `UTable` (v3) is TanStack-table-based: columns are `{ accessorKey | id,
  header }` objects, custom cell rendering via `#<key>-cell="{ row }"` slots where
  `row.original` is the actual data row (not `row` directly).
- CSV export is client-side only (no backend endpoint): build a 2D array, escape
  quotes/commas/newlines, prepend a BOM, `Blob` + temporary `<a download>` click. See
  `exportCsv` in `clients.vue` or `metrics.vue` for the pattern.
- A live clock or anything using `new Date()` at render time must be wrapped in
  `<ClientOnly>` — rendering it during SSR causes a hydration mismatch (server and
  client compute different timestamps).

## Key files

- [pages/internal/index.vue](pages/internal/index.vue), [clients.vue](pages/internal/clients.vue),
  [audit.vue](pages/internal/audit.vue), [collaborators.vue](pages/internal/collaborators.vue)
  — reference implementations for the current Nuxt-UI-based visual direction (stat
  cards, filters, `UTable`, modals, all following the same shape).
- [layouts/default.vue](layouts/default.vue), [components/layout/sideNav.vue](components/layout/sideNav.vue),
  [navBar.vue](components/layout/navBar.vue) — shell/nav (desktop floating sidebar +
  mobile top bar), shared by every `internal` page.
- [layouts/auth.vue](layouts/auth.vue) — the `auth/*` page shell (flat grid background,
  no gradient glow).
- [components/dashboard/check-modal.vue](components/dashboard/check-modal.vue) — the
  check-in/check-out form used from the Vagas page.
- `app.config.ts` — Nuxt UI theme colors (runtime, editable without rebuild in dev).
- `composables/useOrganization.js` — `useOrganizationName()`, SSR-safe shared org name/
  initials state; only ever call `fetchOrganizationName()` inside `onMounted()` (calling
  it at page-script top level caused a real SSR race bug that permanently blocked the
  client-side fetch).

## Testing

None. No test runner configured.

## Open questions / known state

- No deploy target, no CI, no `.env.example` committed (an `.env` exists locally but
  isn't documented here — check its contents directly rather than assuming).
