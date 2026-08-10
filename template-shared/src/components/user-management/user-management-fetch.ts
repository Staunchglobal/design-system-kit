import type { UserManagementFetch } from '@/components/user-management/types'
import { getAuthSession } from '@/components/auth/auth-session'
import { graphqlFetch } from '@/components/auth/graphql-client'
import { USER_MANAGEMENT_MOCK_ENDPOINT, userManagementMockFetch } from '@/components/user-management/user-management-mock-client'

// Vite doesn't ship @types/node; Next inlines NEXT_PUBLIC_* from this literal.
declare const process: { env: { NEXT_PUBLIC_GRAPHQL_URL?: string } }

type FetchImpl = <T>(
  endpoint: string,
  query: string,
  variables?: Record<string, unknown>,
  headers?: HeadersInit
) => Promise<T>

export type CreateUserManagementFetchOptions = {
  endpoint?: string
  fetchImpl?: FetchImpl
}

export function createUserManagementFetch(options: CreateUserManagementFetchOptions = {}): UserManagementFetch {
  const envEndpoint = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_GRAPHQL_URL : undefined
  const endpoint = options.endpoint ?? envEndpoint ?? USER_MANAGEMENT_MOCK_ENDPOINT
  const useMock = endpoint === USER_MANAGEMENT_MOCK_ENDPOINT || endpoint.startsWith('mock://')
  const fetchImpl = options.fetchImpl ?? ((useMock ? userManagementMockFetch : graphqlFetch) as FetchImpl)

  return async function userManagementFetch<T>(
    query: string,
    variables: Record<string, unknown> = {}
  ): Promise<T> {
    const headers: Record<string, string> = {}
    const session = getAuthSession()
    if (session?.token) {
      headers.Authorization = `Bearer ${session.token}`
    }
    return fetchImpl<T>(endpoint, query, variables, headers)
  }
}
