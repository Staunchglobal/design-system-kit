import { createConsumer } from '@rails/actioncable'
import { getAuthSession } from '@/components/auth/auth-session'
import {
  chatMockSubscribe,
  type MockSubscribeOptions,
} from '@/components/chat/chat-mock-client'
import type { Unsubscribe } from '@/components/chat/types'

// Vite doesn't ship @types/node; Next inlines NEXT_PUBLIC_* from these literals.
declare const process: {
  env: { NEXT_PUBLIC_GRAPHQL_URL?: string; NEXT_PUBLIC_GRAPHQL_WS_URL?: string }
}

type Cable = ReturnType<typeof createConsumer>
type ChatChannel = {
  perform: (action: string, data?: object) => void
  unsubscribe: () => void
}

export type CreateChatSubscriptionsOptions = {
  /** wss://localhost:3000/cable — omit for in-memory mock */
  url?: string
  getUserId?: () => string | null | undefined
}

const cables = new Map<string, Cable>()

/** Resolve the ActionCable mount URL; prefer explicit, then static env (Next inlines these). */
function resolveWsUrl(explicit?: string): string | undefined {
  if (explicit) return explicit
  const fromEnv =
    typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_GRAPHQL_WS_URL : undefined
  if (fromEnv) return fromEnv
  const http =
    typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_GRAPHQL_URL : undefined
  if (http?.startsWith('http')) {
    return `${http.replace(/^http/, 'ws').replace(/\/graphql\/?$/, '')}/cable`
  }
  return undefined
}

function extractOperationName(query: string): string | undefined {
  return query.match(/\b(?:subscription|query|mutation)\s+(\w+)/)?.[1]
}

// ActionCable's server dedupes `subscribe` commands by identifier *per
// connection* — a second `subscriptions.create` call with an identifier
// that's already subscribed is silently ignored server-side (no
// `confirm_subscription`, so the client's `connected()` callback, and
// therefore its `perform('execute', ...)`, never fires at all). A bare
// `{ channel: 'GraphqlChannel' }` identifier is identical across every
// subscription this app opens (messageAdded/chatReordered/
// unreadChatCountUpdated, and every chat's own messageAdded) — only
// whichever one happens to subscribe first on a given connection ever
// actually runs; the rest look "connected" client-side but never receive
// anything until the page reloads and re-races. A per-call uid keeps
// every logical subscription on its own real channel instance.
let subscriptionSeq = 0

function nextSubscriptionUid(): string {
  subscriptionSeq += 1
  return `${Date.now()}-${subscriptionSeq}`
}

// The cable connection identifies the user via a plain `userId` query param rather than
// a signed token, so a fresh connection is only opened once per URL+user and reused across
// every chat subscription.
function getCable(url: string, getUserId?: () => string | null | undefined): Cable {
  const userId = getUserId?.() ?? getAuthSession()?.user.id
  const key = `${url}::${userId ?? ''}`
  const existing = cables.get(key)
  if (existing) return existing
  const cableUrl = userId ? `${url}?userId=${encodeURIComponent(userId)}` : url
  const cable = createConsumer(cableUrl)
  cables.set(key, cable)
  return cable
}

export function createChatSubscriptions(options: CreateChatSubscriptionsOptions = {}) {
  const url = resolveWsUrl(options.url)
  const getUserId = options.getUserId

  function subscribe<T>(
    query: string,
    variables: Record<string, unknown>,
    onData: (data: T) => void,
    mockKind?: MockSubscribeOptions['kind']
  ): Unsubscribe {
    if (!url) {
      return chatMockSubscribe({
        kind: mockKind ?? 'messageAdded',
        variables,
        onData: onData as (data: unknown) => void,
      })
    }

    const cable = getCable(url, getUserId)
    const operationName = extractOperationName(query)

    const channel: ChatChannel = cable.subscriptions.create(
      { channel: 'GraphqlChannel', uid: nextSubscriptionUid() },
      {
        connected() {
          // (Re)send the operation every time the channel confirms — covers both the
          // first connect and any automatic reconnect after a dropped socket.
          channel.perform('execute', { query, variables, operationName })
        },
        received(payload: { result?: { data?: T; errors?: unknown[] }; more?: boolean }) {
          if (payload.result?.errors?.length) {
            console.error('[chat subscription]', payload.result.errors)
          }
          if (payload.result?.data) onData(payload.result.data)
        },
        rejected() {
          console.error('[chat subscription] rejected — check the cable userId param')
        },
      }
    )

    return () => channel.unsubscribe()
  }

  return { subscribe }
}
