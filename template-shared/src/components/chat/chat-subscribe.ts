import { createClient, type Client } from 'graphql-ws'
import { getAuthSession } from '@/components/auth/auth-session'
import {
  chatMockSubscribe,
  type MockSubscribeOptions,
} from '@/components/chat/chat-mock-client'
import type { Unsubscribe } from '@/components/chat/types'

export type CreateChatSubscriptionsOptions = {
  /** ws://localhost:4000/graphql — omit for in-memory mock */
  url?: string
  getToken?: () => string | null | undefined
}

const wsClients = new Map<string, Client>()

/** Resolve WS URL; prefer explicit, then static env (Next inlines these). */
function resolveWsUrl(explicit?: string): string | undefined {
  if (explicit) return explicit
  const fromEnv =
    typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_GRAPHQL_WS_URL : undefined
  if (fromEnv) return fromEnv
  const http =
    typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_GRAPHQL_URL : undefined
  if (http?.startsWith('http')) return http.replace(/^http/, 'ws')
  return undefined
}

function getWsClient(url: string, getToken?: () => string | null | undefined) {
  const existing = wsClients.get(url)
  if (existing) return existing
  const client = createClient({
    url,
    // Connect only when a subscription starts (token should be available by then).
    lazy: true,
    retryAttempts: 5,
    connectionParams: () => {
      const token = getToken?.() ?? getAuthSession()?.token
      if (!token) {
        console.warn('[chat subscription] missing auth token for WebSocket')
        return {}
      }
      return { authorization: `Bearer ${token}` }
    },
  })
  wsClients.set(url, client)
  return client
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

    const client = getWsClient(url, getToken)
    return client.subscribe(
      { query, variables },
      {
        next: (result) => {
          if (result.errors?.length) {
            console.error('[chat subscription]', result.errors)
          }
          if (result.data) onData(result.data as T)
        },
        error: (err) => {
          console.error('[chat subscription error]', err)
        },
        complete: () => {},
      }
    )
  }

  return { subscribe }
}
