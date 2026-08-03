export async function graphqlFetch<T>(
  endpoint: string,
  query: string,
  variables?: Record<string, unknown>,
  headers?: HeadersInit
): Promise<T> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(headers ?? {}),
    },
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
