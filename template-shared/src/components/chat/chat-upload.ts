import { getAuthSession } from '@/components/auth/auth-session'

export type CreateChatUploadOptions = {
  /** Real upload URL, e.g. http://localhost:4000/upload */
  uploadUrl?: string
  /**
   * When true (default if a GraphQL HTTP endpoint is configured), never fall
   * back to temporary blob: URLs — those break after refresh.
   */
  requireBackend?: boolean
}

function resolveUploadUrl(explicit?: string): string | undefined {
  if (explicit) return explicit
  // Static access so Next.js can inline NEXT_PUBLIC_* at build time.
  return typeof process !== 'undefined'
    ? process.env.NEXT_PUBLIC_UPLOAD_URL
    : undefined
}

/**
 * Upload images to the Nest `/upload` endpoint.
 * Returns absolute backend URLs suitable for `sendMessage.attachmentUrls`.
 */
export function createChatUpload(options: CreateChatUploadOptions = {}) {
  const uploadUrl = resolveUploadUrl(options.uploadUrl)
  const graphqlUrl =
    typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_GRAPHQL_URL : undefined
  const requireBackend =
    options.requireBackend ?? Boolean(uploadUrl || graphqlUrl)

  return async function uploadFiles(files: File[]): Promise<string[]> {
    if (!files.length) return []

    if (!uploadUrl) {
      if (requireBackend) {
        throw new Error(
          'Image upload is not configured. Set NEXT_PUBLIC_UPLOAD_URL (e.g. http://localhost:4000/upload).'
        )
      }
      // Mock-only path for offline demos.
      return files.map((f) => URL.createObjectURL(f))
    }

    const session = getAuthSession()
    const form = new FormData()
    for (const file of files) form.append('files', file)

    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: session?.token ? { Authorization: `Bearer ${session.token}` } : {},
      body: form,
    })

    if (!res.ok) {
      let detail = ''
      try {
        const body = (await res.json()) as { message?: string | string[] }
        detail = Array.isArray(body.message)
          ? body.message.join(', ')
          : body.message ?? ''
      } catch {
        /* ignore */
      }
      throw new Error(detail || `Upload failed (${res.status})`)
    }

    const json = (await res.json()) as { urls?: string[] }
    const urls = (json.urls ?? []).filter(
      (u) => typeof u === 'string' && u.length > 0 && !u.startsWith('blob:')
    )
    if (urls.length !== files.length) {
      throw new Error('Upload did not return a backend URL for every file')
    }
    return urls
  }
}
