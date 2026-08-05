import { getAuthSession } from '@/components/auth/auth-session'
import { graphqlFetch } from '@/components/auth/graphql-client'
import {
  NOTIFICATION_MOCK_ENDPOINT,
  notificationMockFetch,
} from '@/components/notification-center/notification-mock-client'

// Vite doesn't ship @types/node; Next inlines NEXT_PUBLIC_* from this literal.
declare const process: { env: { NEXT_PUBLIC_GRAPHQL_URL?: string } }

type FetchImpl = <T>(
  endpoint: string,
  query: string,
  variables?: Record<string, unknown>,
  headers?: HeadersInit
) => Promise<T>

export type CreateNotificationFetchOptions = {
  endpoint?: string
  fetchImpl?: FetchImpl
  withAuth?: boolean
}

export function createNotificationFetch(options: CreateNotificationFetchOptions = {}) {
  const envEndpoint =
    typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_GRAPHQL_URL : undefined
  const endpoint = options.endpoint ?? envEndpoint ?? NOTIFICATION_MOCK_ENDPOINT
  const useMock = endpoint === NOTIFICATION_MOCK_ENDPOINT || endpoint.startsWith('mock://')
  const fetchImpl =
    options.fetchImpl ?? ((useMock ? notificationMockFetch : graphqlFetch) as FetchImpl)
  const withAuth = options.withAuth ?? true

  return async function notificationFetch<T>(
    query: string,
    variables: Record<string, unknown> = {}
  ): Promise<T> {
    const headers: Record<string, string> = {}
    if (withAuth) {
      const session = getAuthSession()
      if (session?.token) headers.Authorization = `Bearer ${session.token}`
    }
    return fetchImpl<T>(endpoint, query, variables, headers)
  }
}

export { NOTIFICATION_MOCK_ENDPOINT, graphqlFetch }
