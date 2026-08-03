function isEmailLike(value: string): boolean {
  return /^\S+@\S+\.\S+$/.test(value)
}

/**
 * The API falls back to the email address for users with no name, so a naive
 * name-over-email layout renders the same string twice.
 */
export function personLabels(
  name?: string | null,
  email?: string | null
): { primary: string; secondary: string | null } {
  const trimmedName = (name ?? '').trim()
  const trimmedEmail = (email ?? '').trim()

  if (!trimmedName) return { primary: trimmedEmail || 'Unknown', secondary: null }
  if (trimmedEmail && trimmedName.toLowerCase() === trimmedEmail.toLowerCase()) {
    return { primary: trimmedEmail, secondary: null }
  }
  return { primary: trimmedName, secondary: trimmedEmail || null }
}

export function personInitials(name?: string | null, email?: string | null): string {
  const source = (name ?? '').trim() || (email ?? '').trim()
  if (!source) return '?'

  const base = isEmailLike(source) ? source.slice(0, source.indexOf('@')) : source
  const parts = base.split(/[\s._-]+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return base.slice(0, 2).toUpperCase()
}

export function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message.trim()) return err.message
  if (typeof err === 'string' && err.trim()) return err
  return fallback
}
