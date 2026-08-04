import type { FeatureFlagsFetch } from '@/components/feature-flags-admin/types'
import { getAuthSession } from '@/components/auth/auth-session'
import { graphqlFetch } from '@/components/auth/graphql-client'
import {
  FEATURE_FLAGS_ADMIN_MOCK_ENDPOINT,
  featureFlagsAdminMockFetch,
} from '@/components/feature-flags-admin/feature-flags-admin-mock-client'

// Vite doesn't ship @types/node; Next inlines NEXT_PUBLIC_* from this literal.
declare const process: { env: { NEXT_PUBLIC_GRAPHQL_URL?: string } }

type FetchImpl = <T>(
  endpoint: string,
  query: string,
  variables?: Record<string, unknown>,
  headers?: HeadersInit
) => Promise<T>

export type CreateFeatureFlagsFetchOptions = {
  endpoint?: string
  fetchImpl?: FetchImpl
}

export function createFeatureFlagsFetch(options: CreateFeatureFlagsFetchOptions = {}): FeatureFlagsFetch {
  const envEndpoint = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_GRAPHQL_URL : undefined
  const endpoint = options.endpoint ?? envEndpoint ?? FEATURE_FLAGS_ADMIN_MOCK_ENDPOINT
  const useMock = endpoint === FEATURE_FLAGS_ADMIN_MOCK_ENDPOINT || endpoint.startsWith('mock://')
  const fetchImpl = options.fetchImpl ?? ((useMock ? featureFlagsAdminMockFetch : graphqlFetch) as FetchImpl)

  return async function featureFlagsFetch<T>(
    query: string,
    variables: Record<string, unknown> = {}
  ): Promise<T> {
    const headers: Record<string, string> = {}
    const session = getAuthSession()
    if (session?.token) {
      headers.Authorization = `Bearer ${session.token}`
      variables = { ...variables, _token: session.token }
    }
    return fetchImpl<T>(endpoint, query, variables, headers)
  }
}
