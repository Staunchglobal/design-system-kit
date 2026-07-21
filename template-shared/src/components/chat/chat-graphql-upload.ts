/**
 * Sends a GraphQL mutation as a multipart request per the GraphQL multipart request spec
 * (https://github.com/jaydenseric/graphql-multipart-request-spec) — the same wire format
 * `apollo-upload-client`/`graphql-upload-minimal` use on function-rx and `design-kit-api`,
 * implemented by hand since this kit has no Apollo Client (`graphql-client.ts`'s
 * `graphqlFetch` is a plain JSON `fetch` wrapper, which can't carry a `File`).
 *
 * `variables` should NOT include the `files` key — this appends the required `null`
 * placeholders itself so the shape matches the mutation's `$files: [Upload!]` argument.
 */
export async function graphqlUploadFetch<T>(
  endpoint: string,
  query: string,
  variables: Record<string, unknown>,
  files: File[],
  headers?: Record<string, string>
): Promise<T> {
  const operations = {
    query,
    variables: { ...variables, files: files.map(() => null) },
  }

  const form = new FormData()
  form.append('operations', JSON.stringify(operations))

  const map: Record<string, string[]> = {}
  files.forEach((_file, i) => {
    map[String(i)] = [`variables.files.${i}`]
  })
  form.append('map', JSON.stringify(map))
  files.forEach((file, i) => form.append(String(i), file, file.name))

  // No Content-Type header — the browser sets the multipart boundary automatically.
  // `apollo-require-preflight` is required by Apollo Server's default CSRF prevention,
  // which otherwise rejects multipart/form-data (a CORS-safelisted "simple" content type)
  // with a 400 — the same header `apollo-upload-client` sets automatically.
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'apollo-require-preflight': 'true', ...(headers ?? {}) },
    body: form,
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
