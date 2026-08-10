import { getSharedCable, nextSubscriptionUid } from '@/components/auth/cable-connection'
import {
  chatMockSubscribe,
  type MockSubscribeOptions,
} from '@/components/chat/chat-mock-client'
import type { Unsubscribe } from '@/components/chat/types'

// Vite doesn't ship @types/node; Next inlines NEXT_PUBLIC_* from these literals.
declare const process: {
  env: { NEXT_PUBLIC_GRAPHQL_URL?: string; NEXT_PUBLIC_GRAPHQL_WS_URL?: string }
}

type ChatChannel = {
  perform: (action: string, data?: object) => void
  unsubscribe: () => void
}

export type CreateChatSubscriptionsOptions = {
  /** wss://localhost:3000/cable — omit for in-memory mock */
  url?: string
  getToken?: () => string | null | undefined
}

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

export function createChatSubscriptions(options: CreateChatSubscriptionsOptions = {}) {
  const url = resolveWsUrl(options.url)
  const getToken = options.getToken

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

    const cable = getSharedCable(url, getToken)
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
            // Message only, not the raw error objects — GraphQL error
            // `extensions` can carry request context (variables, etc.)
            // that shouldn't land in the browser console.
            const messages = payload.result.errors
              .map((e) => (e && typeof e === 'object' && 'message' in e ? String(e.message) : null))
              .filter(Boolean)
            console.error('[chat subscription]', messages.length ? messages : 'unknown error')
          }
          if (payload.result?.data) onData(payload.result.data)
        },
        rejected() {
          console.error('[chat subscription] rejected — check the cable token param')
        },
      }
    )

    return () => channel.unsubscribe()
  }

  return { subscribe }
}
