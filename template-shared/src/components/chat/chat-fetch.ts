import { CHAT_MOCK_ENDPOINT } from '@/components/chat/chat-constants'
import type { ChatFetch } from '@/components/chat/types'
import { getAuthSession } from '@/components/auth/auth-session'
import { graphqlFetch } from '@/components/auth/graphql-client'
import { chatMockFetch } from '@/components/chat/chat-mock-client'

type FetchImpl = <T>(
  endpoint: string,
  query: string,
  variables?: Record<string, unknown>,
  headers?: HeadersInit
) => Promise<T>

export type CreateChatFetchOptions = {
  endpoint?: string
  fetchImpl?: FetchImpl
  withAuth?: boolean
}

/**
 * Thin factory used by chat pages.
 *
 * ```ts
 * createChatFetch({
 *   endpoint: process.env.NEXT_PUBLIC_GRAPHQL_URL!,
 *   fetchImpl: graphqlFetch,
 *   withAuth: true,
 * })
 * ```
 */
export function createChatFetch(options: CreateChatFetchOptions = {}): ChatFetch {
  const envEndpoint =
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_GRAPHQL_URL
      : undefined
  const endpoint = options.endpoint ?? envEndpoint ?? CHAT_MOCK_ENDPOINT
  const useMock = endpoint === CHAT_MOCK_ENDPOINT || endpoint.startsWith('mock://')
  const fetchImpl =
    options.fetchImpl ?? ((useMock ? chatMockFetch : graphqlFetch) as FetchImpl)
  const withAuth = options.withAuth ?? true

  return async function chatFetch<T>(
    query: string,
    variables: Record<string, unknown> = {}
  ): Promise<T> {
    const headers: Record<string, string> = {}
    if (withAuth) {
      const session = getAuthSession()
      if (session?.token) {
        headers.Authorization = `Bearer ${session.token}`
        variables = { ...variables, _token: session.token }
      }
    }
    return fetchImpl<T>(endpoint, query, variables, headers)
  }
}

export { CHAT_MOCK_ENDPOINT, graphqlFetch }
