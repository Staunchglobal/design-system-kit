/**
 * Tiny native-fetch GraphQL helper — no Apollo/urql/graphql-request.
 * Throws an Error when the response includes a GraphQL `errors` array so
 * callers can pass the promise straight to `toast.promise`.
 */
export async function graphqlFetch<T>(
  endpoint: string,
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    throw new Error(`GraphQL request failed (${response.status} ${response.statusText})`)
  }

  const json = (await response.json()) as {
    data?: T
    errors?: Array<{ message?: string }>
  }

  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message ?? 'GraphQL error').join('; '))
  }

  if (json.data === undefined) {
    throw new Error('GraphQL response missing data')
  }

  return json.data
}
