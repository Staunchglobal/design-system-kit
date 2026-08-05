/**
 * Informational only — no signature check, just reads the payload for UI
 * purposes (e.g. "am I currently impersonating someone?"). The server
 * independently verifies every request's token; this never doubles as an
 * auth boundary. `atob` only (no `Buffer` fallback) — this runs in the
 * browser on both frameworks, and Vite doesn't ship `@types/node`.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const [, payload] = token.split('.')
    if (!payload) return null
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64)) as Record<string, unknown>
  } catch {
    return null
  }
}
