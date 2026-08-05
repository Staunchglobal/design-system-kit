import type { AuditTrailFetch } from '@/components/audit-trail-viewer/types'
import { getAuthSession } from '@/components/auth/auth-session'
import { graphqlFetch } from '@/components/auth/graphql-client'
import { AUDIT_TRAIL_MOCK_ENDPOINT, auditTrailMockFetch } from '@/components/audit-trail-viewer/audit-trail-mock-client'

// Vite doesn't ship @types/node; Next inlines NEXT_PUBLIC_* from this literal.
declare const process: { env: { NEXT_PUBLIC_GRAPHQL_URL?: string } }

type FetchImpl = <T>(
  endpoint: string,
  query: string,
  variables?: Record<string, unknown>,
  headers?: HeadersInit
) => Promise<T>

export type CreateAuditTrailFetchOptions = {
  endpoint?: string
  fetchImpl?: FetchImpl
}

export function createAuditTrailFetch(options: CreateAuditTrailFetchOptions = {}): AuditTrailFetch {
  const envEndpoint = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_GRAPHQL_URL : undefined
  const endpoint = options.endpoint ?? envEndpoint ?? AUDIT_TRAIL_MOCK_ENDPOINT
  const useMock = endpoint === AUDIT_TRAIL_MOCK_ENDPOINT || endpoint.startsWith('mock://')
  const fetchImpl = options.fetchImpl ?? ((useMock ? auditTrailMockFetch : graphqlFetch) as FetchImpl)

  return async function auditTrailFetch<T>(
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
