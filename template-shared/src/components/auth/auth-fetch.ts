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
  endpoint?: string
  fetchImpl?: FetchImpl
  withAuth?: boolean
}

export function createAuthFetch(options: CreateAuthFetchOptions = {}): AuthFetch {
  const envEndpoint =
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_GRAPHQL_URL
      : undefined
  const endpoint = options.endpoint ?? envEndpoint ?? AUTH_MOCK_ENDPOINT
  const useMock = endpoint === AUTH_MOCK_ENDPOINT || endpoint.startsWith('mock://')
  const fetchImpl =
    options.fetchImpl ?? ((useMock ? authMockFetch : graphqlFetch) as FetchImpl)
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
        variables = { ...variables, _token: session.token }
      }
    }
    return fetchImpl<T>(endpoint, query, variables, headers)
  }
}

export { AUTH_MOCK_ENDPOINT, graphqlFetch }
