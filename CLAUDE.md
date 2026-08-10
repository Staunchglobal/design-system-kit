# CLAUDE.md — staunch-shadcn-design-system-kit

**This is not a runnable app.** It's a shadcn-style CLI (`bin: design-kit`)
that copies real `.tsx`/`.ts` template source into a consumer's own Next.js
or Vite project — like `shadcn init`/`shadcn add`, not an npm package
someone `import`s from at runtime. `react`/`react-dom` here are dev-only,
used to build/typecheck the templates, never exported for consumption.

## Repo shape

- `src/` — the CLI tool itself (TypeScript, built with `tsup`). This is
  the only thing `tsconfig.json`'s `include` and `eslint.config.mjs`'s
  `files` actually cover.
- `template-shared/src/` — shared component source (`components/auth`,
  `components/chat`, `components/ui`, `lib/`) copied into every consumer
  regardless of framework. Most feature work happens here.
- `template-next/src/` — Next.js–specific template files (App Router
  pages, API routes).
- `template-vite/src/` — Vite–specific template files (mirrors
  `template-next` route-for-route where a route/page exists in both).
- `scripts/build-registry.mjs` — generates `src/generated/registry.ts` by
  scanning `template-shared`'s imports and the hand-maintained
  `EXTRA_FILES` map below. **Never hand-edit `src/generated/registry.ts`**
  — it's regenerated, and CI (`ci.yml`) fails the build if it's stale
  relative to the templates.

## The lint/typecheck scope gap — know this before trusting a green run

`npm run typecheck` and `npm run lint` **only cover `src/`** (the CLI tool
itself) — zero of the ~465 files under `template-shared`/`template-next`/
`template-vite` (the actual shipped product) are included. A clean local
`typecheck`/`lint` run is not evidence the templates are correct. The only
thing that actually typechecks/lints the templates is `npm run smoke`
(`scripts/smoke-test.mjs`) — it scaffolds a real `create-next-app` and
`create-vite` app, runs `design-kit init --all` into each, then runs that
scaffolded app's own `next build`/`next lint` and `tsc -b`/`vite build`/
`vite lint`. It's slow (real npm installs + Playwright) and not run by
default — run it explicitly before trusting a template change:

```bash
npm run smoke            # both frameworks
npm run smoke -- --only next   # one framework, faster iteration
```

If you can't run it (no network, time-boxed), say so explicitly rather
than reporting template changes as verified — a passing `typecheck`/`lint`
proves nothing about the templates.

## Adding/changing a file under `template-shared`

If you add a **new** file (not just edit an existing one) to
`template-shared/src/components/**` that a slug's existing files import,
you must also add it to that slug's `EXTRA_FILES` array in
`scripts/build-registry.mjs`, then run `npm run build:registry`. Skipping
this means the file exists in the repo but the CLI never actually copies
it into a consumer app — the import compiles here (same working tree) but
breaks for every real installer. `build-registry.mjs` throws if
`EXTRA_FILES` references a file that's missing, but it does **not** catch
the opposite mistake (a real file that should be listed but isn't) — that
has actually happened here before (four auth files and two chat files
were briefly unregistered this way). Verify with:

```bash
comm -23 \
  <(ls template-shared/src/components/<feature>/*.ts* | sed 's|template-shared/src/||' | sort) \
  <(sed -n '/'\''<feature>'\'': \[/,/\],/p' scripts/build-registry.mjs | grep components | sed "s/[',]//g;s/^ *//" | sort)
```
Empty output means every file on disk is registered.

## Standing conventions specific to this repo

- **Every GraphQL mutation call wraps its arguments in a single `input`
  object** (matching the backend gem's `RelayClassicMutation` convention)
  — queries/resolvers do NOT get this wrapping. See
  `components/chat/chat-operations.ts`'s header comment for the query-vs-
  mutation distinction; check an existing operation in the same family
  before assuming either way for a new one.
- **Auth session / pending-OTP / pending-email-change storage all expire.**
  `components/auth/auth-session.ts` and
  `components/account-settings/email-change-storage.ts` stamp an
  `expiresAt` on every write and treat a missing/past one as already-
  expired on read. Don't add a new `localStorage`-backed session/flow
  without the same pattern — an unbounded-lifetime token or pending-step
  entry is a real, shipped bug class here, not a hypothetical.
- **Never put a bearer token in GraphQL `variables`** — only in the
  `Authorization` header (`auth-fetch.ts`/`chat-fetch.ts`). Variables get
  logged by server-side GraphQL/APM tooling far more readily than headers,
  which are conventionally redacted.
- **The ActionCable connection uses `?token=<jwt>`, not `?userId=`** —
  `components/chat/chat-subscribe.ts`'s `getCable`. This has to match
  whatever the backend gem's generated `connection.rb` actually verifies;
  if that ever changes, this file (and its `getToken` option) needs to
  change with it in the same PR — a mismatch here doesn't fail loudly, it
  just means every socket connection gets silently rejected.
- **Static `process.env.FOO` access only** in template code — never
  `process.env[name]`. Dynamic access breaks Next.js's build-time
  inlining of `NEXT_PUBLIC_*` vars and silently falls back to
  mocks/defaults instead of erroring.
- **Authorization visibility is server-computed, never re-derived
  client-side.** The backend gem computes a flat `abilities: string[]` on
  `currentUser` (global keys like `"users:invite"`, checked via `can()` from
  `components/auth/use-current-user.ts`) and per-row on `User`/`Invitation`
  (bare verbs like `"archive"`, checked via `row.abilities.includes(...)`).
  Nav items carry an optional `requiredAbility` (`managed-files.ts`'s
  `RouteEntry`, threaded through `codegen.ts`) filtered in `(app)/layout.tsx`
  and `PrivateLayout.tsx`; gated pages additionally guard themselves in case
  the URL is hit directly. Never hand-roll a role check (`roles.includes('admin')`)
  for a new feature — add an `ability(...)` on the backend type and check it
  here. One exception: `archive?`/`restore?`/`impersonate?` don't encode the
  row's own `discarded` state server-side (they're viewer-relative, not
  row-state-relative) — combine the ability check with the row's `discarded`
  field client-side, see `user-management-screen.tsx`'s `isVisible`
  predicates. A disabled Flipper flag still surfaces to this frontend as a
  raw GraphQL error through the generic `ChatErrorBanner`/`ChatErrorPanel`
  paths if a mutation is called directly (not through a hidden button) —
  server-side Pundit/Flipper remain the actual enforcement boundary, this is
  UX only.

## What does NOT belong in this file

- Component-by-component implementation detail — read the code.
- Recent change history — `git log` is authoritative.
