import { AUTH_MOCK_ENDPOINT, authMockFetch } from '@/components/auth/auth-mock-client'
import { getAuthSession } from '@/components/auth/auth-session'
import { graphqlFetch } from '@/components/auth/graphql-client'
import type { AuthFetch } from '@/components/auth/types'

type FetchImpl = <T>(
  endpoint: string,
  query: string,
  variables?: Record<string, unknown>,
  headers?: HeadersInit
) => Promise<T>

export type CreateAuthFetchOptions = {
  /** Real GraphQL URL, or leave default for in-memory mock. */
  endpoint?: string
  /** Swap to graphqlFetch (or your Apollo wrapper) for production. */
  fetchImpl?: FetchImpl
  /** Attach Bearer from local session (needed for updatePassword). */
  withAuth?: boolean
}

/**
 * Thin factory used by auth pages.
 *
 * Swap for a real API:
 * ```ts
 * createAuthFetch({
 *   endpoint: process.env.NEXT_PUBLIC_GRAPHQL_URL!,
 *   fetchImpl: graphqlFetch,
 *   withAuth: true,
 * })
 * ```
 */
export function createAuthFetch(options: CreateAuthFetchOptions = {}): AuthFetch {
  const endpoint = options.endpoint ?? AUTH_MOCK_ENDPOINT
  const fetchImpl = options.fetchImpl ?? (authMockFetch as FetchImpl)
  const withAuth = options.withAuth ?? true

  return async function authFetch<T>(
    query: string,
    variables: Record<string, unknown> = {}
  ): Promise<T> {
    const headers: Record<string, string> = {}
    if (withAuth) {
      const session = getAuthSession()
      if (session?.token) {
        headers.Authorization = `Bearer ${session.token}`
        // Mock also reads _token when HeadersInit shape varies
        variables = { ...variables, _token: session.token }
      }
    }
    return fetchImpl<T>(endpoint, query, variables, headers)
  }
}

export { AUTH_MOCK_ENDPOINT, graphqlFetch }
