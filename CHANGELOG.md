# Changelog

## 1.0.0

### Major Changes

- 277c23b: Fix Google Places API key being sent to the client at all — it was both exposed in the bundle/Network tab _and_ still proxied through `/api/places/*`, the worst of both approaches (a leaked key is directly billable against your Google Cloud project, and a server-to-server call can't be scoped by HTTP referrer anyway).

  - `AddressAutocomplete`'s `apiKey` prop is removed. The key now lives server-side only, as `GOOGLE_PLACES_API_KEY` (never `NEXT_PUBLIC_`/`VITE_`-prefixed) — read directly by the Next API routes and the Vite dev middleware.
  - **Breaking**: if you pass `apiKey` to `<AddressAutocomplete>`, remove it and set `GOOGLE_PLACES_API_KEY` in your server environment instead.

### Minor Changes

- 277c23b: Feature-flags admin matrix cells now carry an `eligible` flag, and the CLI's post-install guidance covers `notification-center` for the first time.

  - A role/feature combination whose own backend policy hard-denies it regardless of the flag (e.g. Audit Trail is admin-only, full stop) now renders as a disabled dash instead of a checkbox that could never take effect.
  - `init-next`/`init-vite` now print setup guidance for `notification-center` (previously undocumented), including the `message_received` notification type the Rails gem's `SendMessage` mutation raises automatically once `chat` is also installed.

- 3de3019: Add realtime chat and account-settings templates, and align auth with the Rails GraphQL OTP flows.

  - New opt-in `chat` inbox (Next + Vite): conversations, archive, search, attachments (images/PDF/DOC), GraphQL uploads, and ActionCable subscriptions (mock-first).
  - New opt-in `account-settings` email-change wizard.
  - Auth reworked for mandatory OTP login/signup, link-based password reset, and shared form primitives; smoke fixes for Vite typing and Next `set-state-in-effect` lint.

### Patch Changes

- 277c23b: Close several security gaps and real bugs found in a full review pass across auth, chat, and the feature-flags admin templates.

  - Stop copying the bearer JWT into GraphQL `variables` (user-management, delivery-logs, audit-trail-viewer, feature-flags-admin) — it belongs in the `Authorization` header only, never a logged request body.
  - Fix Vite's `PrivateLayout`/`ImpersonationStatus` silently falling back to the mock client (no `process` global in the Vite browser bundle, unlike Next's build-time env inlining) — `abilities` was always `[]`, hiding every `requiredAbility`-gated nav item regardless of real role. Both now take an explicit `endpoint`/`graphqlUrl`.
  - Add request-id guards to chat's `loadMessages`/`loadChats` (mirroring `loadUsers`) so switching chats faster than a fetch resolves can no longer show the wrong thread under the wrong header.
  - Fix session expiry only being re-checked when the underlying `localStorage` string changed, so a tab left open past the TTL never re-validated.
  - Fix `useCurrentUser` throwing a raw `TypeError` instead of failing closed when `currentUser` resolves to `null` with no GraphQL error.
  - Fix ActionCable sockets leaking on every logout/impersonate cycle (a subscription's own `unsubscribe` doesn't close the socket) — also guarded against `window is not defined` once this code can be pulled into a server-rendered tree.
  - Fix the feature-flag matrix's optimistic-toggle rollback snapshotting the whole `cells` array, so a second concurrent toggle could get wiped out by the first one's failure handler.
  - Fix `accept-invitation` shipping a literal `invite-demo-token` fallback and advertising it in its own visible copy when no token was in the URL.
  - `design-kit update` now checks for newly-required npm deps the same way `init` does — a template gaining a new import no longer silently breaks the next build. `notification-center` was also missing its own `@types/rails__actioncable` dependency.

Versioned with [Changesets](https://github.com/changesets/changesets) — every user-facing change
should ship with a changeset (`npm run changeset`), and this file is regenerated from those on
release (`npm run version`). See `.changeset/README.md` for the day-to-day workflow.

This project follows [Semantic Versioning](https://semver.org/). Since `init` copies real source
files into a consumer's repo rather than shipping a versioned library from `node_modules`, "breaking
change" here means: a CLI flag is removed/renamed, a generated file's shape changes in a way that
breaks a previous `init`'s output, or a component's public props/exports change incompatibly —
not every change to `template-*/`, most of which are template-only fixes/additions (patch/minor).

## 0.2.0

### Minor Changes

- Expand the kit from its initial baseline into a 95-component design system with:

  - Complete Auth and CRUD systems, including generated routes, forms, GraphQL helpers, and mocks.
  - New advanced component families for uploads, sortable lists, rich text, address autocomplete,
    payments and Stripe, OAuth, notifications, PDF documents, and additional data-entry patterns.
  - A redesigned Manrope-based default theme with expanded color scales, semantic
    Success/Warning/Info tokens, radius and shadow scales, and component-level theme coverage.
  - More robust selective installation, update/remove behavior, framework detection, generated-file
    management, local-template development, and TypeScript compatibility checks.
  - Expanded theme-editor token creation, deletion, and repo-wide rename support.

## 0.1.0

Initial baseline:

- `design-kit init` scaffolds a full shadcn/ui component set, a token-driven Tailwind v4 theme
  system, a `/design-system` showcase, and a live `/theme-editor` into a Next.js (App Router) or
  Vite + React project.
- Atomic per-component selection — an interactive searchable picker, `--components`, or `--all`;
  only the npm packages, `.tsx` files, and CSS a selection actually needs get installed.
- `design-kit remove <components>` uninstalls previously-installed components (dependency-aware —
  won't remove something another kept component still needs) and regenerates the design-system
  page/theme editor/manifest.
- `design-kit update` re-syncs installed files to the current CLI version's templates, skipping
  anything customized since install (content-hash tracked; `--force` overrides).
- `--dry-run` on `init`/`remove`/`update` previews every change without writing anything.
- TypeScript 5/6/7 compatibility checking against tsconfig.json, with safe auto-fix for the
  `"types"` array default change.
- AST-based config patching (ts-morph for TS/TSX, postcss for CSS, jsonc-parser for tsconfig)
  instead of regex/text-splice, so `vite.config.ts`/`layout.tsx`/globals CSS patch correctly
  even when customized, not just against the unmodified scaffold output.
- Vite gets the same default Geist Sans/Mono font as Next.js, self-hosted via `@fontsource/*`.
- Monorepo-aware package manager detection and error guidance.
