import { getSharedCable, nextSubscriptionUid } from '@/components/auth/cable-connection'
import {
  notificationMockSubscribe,
  type MockSubscribeOptions,
} from '@/components/notification-center/notification-mock-client'

// Vite doesn't ship @types/node; Next inlines NEXT_PUBLIC_* from these literals.
declare const process: {
  env: { NEXT_PUBLIC_GRAPHQL_URL?: string; NEXT_PUBLIC_GRAPHQL_WS_URL?: string }
}

type Unsubscribe = () => void
type NotificationChannel = {
  perform: (action: string, data?: object) => void
  unsubscribe: () => void
}

export type CreateNotificationSubscriptionsOptions = {
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

export function createNotificationSubscriptions(
  options: CreateNotificationSubscriptionsOptions = {}
) {
  const url = resolveWsUrl(options.url)
  const getToken = options.getToken

  function subscribe<T>(
    query: string,
    variables: Record<string, unknown>,
    onData: (data: T) => void
  ): Unsubscribe {
    if (!url) {
      return notificationMockSubscribe({
        variables,
        onData: onData as MockSubscribeOptions['onData'],
      })
    }

    const cable = getSharedCable(url, getToken)
    const operationName = extractOperationName(query)

    const channel: NotificationChannel = cable.subscriptions.create(
      { channel: 'GraphqlChannel', uid: nextSubscriptionUid() },
      {
        connected() {
          channel.perform('execute', { query, variables, operationName })
        },
        received(payload: { result?: { data?: T; errors?: unknown[] }; more?: boolean }) {
          if (payload.result?.errors?.length) {
            const messages = payload.result.errors
              .map((e) => (e && typeof e === 'object' && 'message' in e ? String(e.message) : null))
              .filter(Boolean)
            console.error('[notification subscription]', messages.length ? messages : 'unknown error')
          }
          if (payload.result?.data) onData(payload.result.data)
        },
        rejected() {
          console.error('[notification subscription] rejected — check the cable token param')
        },
      }
    )

    return () => channel.unsubscribe()
  }

  return { subscribe }
}
