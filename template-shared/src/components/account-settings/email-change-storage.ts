import type { EmailChangeStep } from '@/components/account-settings/use-email-change'

const STORAGE_KEY = 'design-kit-email-change-pending'

// Matches `PENDING_OTP_TTL_MS` in auth-session.ts — a bit above the
// backend's OTP expiry (10 minutes) so the client doesn't clear a
// still-valid mid-flow step early; the backend rejecting an actually
// expired code is already a normal error path.
const TTL_MS = 15 * 60 * 1000

export type PendingEmailChange = {
  step: EmailChangeStep
  newEmail: string
  expiresAt: number
}

function storage(): Storage | null {
  if (typeof window === 'undefined') return null
  return window.localStorage
}

/**
 * Only 'verify-current'/'verify-new' are worth surviving a refresh — a
 * refresh mid-verification must land back on the same OTP step instead of
 * silently bouncing to 'request' (which would orphan an OTP the backend
 * already sent and is still tracking). 'request' has nothing to resume,
 * and 'done' is a one-time confirmation screen, not a step to return to.
 */
export function readPendingEmailChange(): { step: EmailChangeStep; newEmail: string } | null {
  const raw = storage()?.getItem(STORAGE_KEY) ?? null
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Partial<PendingEmailChange>
    if (!parsed.expiresAt || Date.now() > parsed.expiresAt) {
      storage()?.removeItem(STORAGE_KEY)
      return null
    }
    if (parsed.step !== 'verify-current' && parsed.step !== 'verify-new') return null
    return { step: parsed.step, newEmail: parsed.newEmail ?? '' }
  } catch {
    return null
  }
}

export function writePendingEmailChange(step: EmailChangeStep, newEmail: string): void {
  if (step !== 'verify-current' && step !== 'verify-new') {
    storage()?.removeItem(STORAGE_KEY)
    return
  }
  const snapshot: PendingEmailChange = { step, newEmail, expiresAt: Date.now() + TTL_MS }
  storage()?.setItem(STORAGE_KEY, JSON.stringify(snapshot))
}

export function clearPendingEmailChange(): void {
  storage()?.removeItem(STORAGE_KEY)
}
