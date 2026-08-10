import { createConsumer } from '@rails/actioncable'
import { getAuthSession, subscribeAuthSession } from '@/components/auth/auth-session'

type Cable = ReturnType<typeof createConsumer>

// Shared across every feature that subscribes over ActionCable (chat,
// notifications, ...) — the backend's cable connection identifies the
// user via the same JWT sent as `Authorization: Bearer` on GraphQL HTTP
// requests, as a `?token=` query param (ActionCable's handshake has no
// header injection point). A fresh connection is only opened once per
// url+token and reused across every subscription any feature opens —
// two independent modules each keeping their own cache would silently
// open a second physical socket to the same server for the same user.
const cables = new Map<string, Cable>()

export function getSharedCable(url: string, getToken?: () => string | null | undefined): Cable {
  const token = getToken?.() ?? getAuthSession()?.token
  const key = `${url}::${token ?? ''}`
  const existing = cables.get(key)
  if (existing) return existing
  const cableUrl = token ? `${url}?token=${encodeURIComponent(token)}` : url
  const cable = createConsumer(cableUrl)
  cables.set(key, cable)
  return cable
}

// `cables` has no automatic eviction — a subscription's own teardown only
// sends an `unsubscribe` command (ActionCable's Subscriptions#remove),
// which does NOT close the underlying socket. Without this, every
// logout→login, impersonate, and stop-impersonate cycle leaks a live
// WebSocket (plus its reconnect loop) still authenticated as the PRIOR
// identity, for the rest of the page's lifetime.
function closeSharedCables(): void {
  for (const cable of cables.values()) cable.disconnect()
  cables.clear()
}

// Subscribed once, for the app's lifetime, at module load — deliberately
// NOT a direct call from auth-session.ts's clearAuthSession/setAuthSession
// (that file is always installed; this one only is when chat/
// notification-center is, so it can't hold a static import the other way
// without breaking every app that installs auth alone). `getSharedCable`
// re-keys by url+token anyway, so a fresh cable is created lazily on the
// next call — this only needs to close what's now stale.
//
// Guarded on `window` because this runs at MODULE EVALUATION time, not
// inside a component/effect — `subscribeAuthSession` calls
// `window.addEventListener` unconditionally (safe for its original
// caller, React's `useSyncExternalStore`, which never invokes `subscribe`
// during SSR), but a bare module-level call has no such guarantee. Any
// route whose server-rendered tree imports this module (directly, or
// transitively via chat/notification-center) would otherwise throw
// "window is not defined" on every SSR pass.
if (typeof window !== 'undefined') {
  subscribeAuthSession(closeSharedCables)
}

// ActionCable's server dedupes `subscribe` commands by identifier *per
// connection* — a second `subscriptions.create` call with an identifier
// that's already subscribed is silently ignored server-side (no
// `confirm_subscription`, so the client's `connected()` callback, and
// therefore its `perform('execute', ...)`, never fires at all). A bare
// `{ channel: 'GraphqlChannel' }` identifier is identical across every
// subscription any feature opens on this connection — only whichever one
// happens to subscribe first ever actually runs; the rest look
// "connected" client-side but never receive anything until the page
// reloads and re-races. A per-call uid keeps every logical subscription
// on its own real channel instance.
let subscriptionSeq = 0

export function nextSubscriptionUid(): string {
  subscriptionSeq += 1
  return `${Date.now()}-${subscriptionSeq}`
}
