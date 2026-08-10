---
"staunch-shadcn-design-system-kit": patch
---

Close several security gaps and real bugs found in a full review pass across auth, chat, and the feature-flags admin templates.

- Stop copying the bearer JWT into GraphQL `variables` (user-management, delivery-logs, audit-trail-viewer, feature-flags-admin) — it belongs in the `Authorization` header only, never a logged request body.
- Fix Vite's `PrivateLayout`/`ImpersonationStatus` silently falling back to the mock client (no `process` global in the Vite browser bundle, unlike Next's build-time env inlining) — `abilities` was always `[]`, hiding every `requiredAbility`-gated nav item regardless of real role. Both now take an explicit `endpoint`/`graphqlUrl`.
- Add request-id guards to chat's `loadMessages`/`loadChats` (mirroring `loadUsers`) so switching chats faster than a fetch resolves can no longer show the wrong thread under the wrong header.
- Fix session expiry only being re-checked when the underlying `localStorage` string changed, so a tab left open past the TTL never re-validated.
- Fix `useCurrentUser` throwing a raw `TypeError` instead of failing closed when `currentUser` resolves to `null` with no GraphQL error.
- Fix ActionCable sockets leaking on every logout/impersonate cycle (a subscription's own `unsubscribe` doesn't close the socket) — also guarded against `window is not defined` once this code can be pulled into a server-rendered tree.
- Fix the feature-flag matrix's optimistic-toggle rollback snapshotting the whole `cells` array, so a second concurrent toggle could get wiped out by the first one's failure handler.
- Fix `accept-invitation` shipping a literal `invite-demo-token` fallback and advertising it in its own visible copy when no token was in the URL.
- `design-kit update` now checks for newly-required npm deps the same way `init` does — a template gaining a new import no longer silently breaks the next build. `notification-center` was also missing its own `@types/rails__actioncable` dependency.
