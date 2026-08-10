import type { DeliveryLogsFetch } from '@/components/delivery-logs/types'
import { getAuthSession } from '@/components/auth/auth-session'
import { graphqlFetch } from '@/components/auth/graphql-client'
import { DELIVERY_LOGS_MOCK_ENDPOINT, deliveryLogsMockFetch } from '@/components/delivery-logs/delivery-logs-mock-client'

// Vite doesn't ship @types/node; Next inlines NEXT_PUBLIC_* from this literal.
declare const process: { env: { NEXT_PUBLIC_GRAPHQL_URL?: string } }

type FetchImpl = <T>(
  endpoint: string,
  query: string,
  variables?: Record<string, unknown>,
  headers?: HeadersInit
) => Promise<T>

export type CreateDeliveryLogsFetchOptions = {
  endpoint?: string
  fetchImpl?: FetchImpl
}

export function createDeliveryLogsFetch(options: CreateDeliveryLogsFetchOptions = {}): DeliveryLogsFetch {
  const envEndpoint = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_GRAPHQL_URL : undefined
  const endpoint = options.endpoint ?? envEndpoint ?? DELIVERY_LOGS_MOCK_ENDPOINT
  const useMock = endpoint === DELIVERY_LOGS_MOCK_ENDPOINT || endpoint.startsWith('mock://')
  const fetchImpl = options.fetchImpl ?? ((useMock ? deliveryLogsMockFetch : graphqlFetch) as FetchImpl)

  return async function deliveryLogsFetch<T>(
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
