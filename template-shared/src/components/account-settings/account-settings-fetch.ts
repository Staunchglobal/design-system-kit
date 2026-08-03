import { getAuthSession } from '@/components/auth/auth-session'
import { graphqlFetch } from '@/components/auth/graphql-client'
import {
  ACCOUNT_SETTINGS_MOCK_ENDPOINT,
  accountSettingsMockFetch,
} from '@/components/account-settings/account-settings-mock-client'

type FetchImpl = <T>(
  endpoint: string,
  query: string,
  variables?: Record<string, unknown>,
  headers?: HeadersInit
) => Promise<T>

export type CreateAccountSettingsFetchOptions = {
  endpoint?: string
  fetchImpl?: FetchImpl
}

export function createAccountSettingsFetch(options: CreateAccountSettingsFetchOptions = {}) {
  const envEndpoint =
    typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_GRAPHQL_URL : undefined
  const endpoint = options.endpoint ?? envEndpoint ?? ACCOUNT_SETTINGS_MOCK_ENDPOINT
  const useMock = endpoint === ACCOUNT_SETTINGS_MOCK_ENDPOINT || endpoint.startsWith('mock://')
  const fetchImpl =
    options.fetchImpl ?? ((useMock ? accountSettingsMockFetch : graphqlFetch) as FetchImpl)

  return async function accountSettingsFetch<T>(
    query: string,
    variables: Record<string, unknown> = {}
  ): Promise<T> {
    const session = getAuthSession()
    const headers: Record<string, string> = {}
    if (session?.token) headers.Authorization = `Bearer ${session.token}`
    return fetchImpl<T>(endpoint, query, variables, headers)
  }
}
