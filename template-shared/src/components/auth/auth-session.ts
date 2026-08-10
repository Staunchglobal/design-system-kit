import type { AuthSession } from '@/components/auth/types'
import { clearOtpCooldown, startOtpCooldown } from '@/components/auth/otp-timer-storage'

const SESSION_KEY = 'design-kit-auth-session'
const PENDING_OTP_KEY = 'design-kit-auth-otp-pending'

// Matches the backend's default JWT lifetime (`config.jwt_expires_in`,
// 24 hours) — a session with no expiry would stay "valid" in
// localStorage forever even after the JWT itself has expired server-side,
// so a stolen/lingering token looks usable to the UI indefinitely.
const SESSION_TTL_MS = 24 * 60 * 60 * 1000
// A bit above the backend's OTP expiry (10 minutes, `DEFAULT_OTP_EXPIRY`)
// so the client doesn't clear a still-valid pending step early — the
// backend rejecting an actually-expired code is already handled as a
// normal error, this just bounds how long a stale entry can pin the user
// in the OTP step after abandoning the flow.
const PENDING_OTP_TTL_MS = 15 * 60 * 1000

const sessionListeners = new Set<() => void>()
const pendingOtpListeners = new Set<() => void>()

/** Cache so useSyncExternalStore getSnapshot returns a stable reference when storage is unchanged. */
let sessionSnapshot: AuthSession | null = null
let sessionRaw: string | null | undefined = undefined

export type PendingOtp = {
  email: string
  purpose: 'signup' | 'login' | 'password_reset'
  /** The code itself, when the backend returned one in the mutation response (dev/staging convenience). */
  otp: string | null
} | null

type StoredPendingOtp = NonNullable<PendingOtp> & { expiresAt: number }

let pendingOtpSnapshot: PendingOtp = null
let pendingOtpRaw: string | null | undefined = undefined

function emit(listeners: Set<() => void>): void {
  listeners.forEach((listener) => listener())
}

function storage(): Storage | null {
  if (typeof window === 'undefined') return null
  return window.localStorage
}

type StoredAuthSession = AuthSession & { expiresAt: number }

function readSessionSnapshot(): AuthSession | null {
  const raw = storage()?.getItem(SESSION_KEY) ?? null
  // The cache-hit path below skips re-parsing, but expiry must still be
  // re-checked every call even when `raw` hasn't changed — a tab left
  // open past SESSION_TTL_MS never rewrites localStorage on its own, so
  // without this the cached snapshot would read as "valid" forever after
  // the first check, exactly the unbounded-lifetime bug this TTL exists
  // to close.
  if (raw === sessionRaw) {
    if (sessionSnapshot && Date.now() > (sessionSnapshot as StoredAuthSession).expiresAt) {
      storage()?.removeItem(SESSION_KEY)
      sessionRaw = null
      sessionSnapshot = null
      return null
    }
    return sessionSnapshot
  }
  sessionRaw = raw
  if (!raw) {
    sessionSnapshot = null
    return null
  }
  try {
    const parsed = JSON.parse(raw) as Partial<StoredAuthSession>
    // A session written before this expiry mechanism existed has no
    // `expiresAt` — treat that as already-expired rather than trusting it
    // indefinitely, since "no expiry recorded" is exactly the bug this
    // closes.
    if (!parsed.expiresAt || Date.now() > parsed.expiresAt) {
      storage()?.removeItem(SESSION_KEY)
      sessionRaw = null
      sessionSnapshot = null
      return null
    }
    sessionSnapshot = parsed as AuthSession
  } catch {
    sessionSnapshot = null
  }
  return sessionSnapshot
}

export function getAuthSession(): AuthSession | null {
  return readSessionSnapshot()
}

export function setAuthSession(session: AuthSession): void {
  const stored: StoredAuthSession = { ...session, expiresAt: Date.now() + SESSION_TTL_MS }
  const raw = JSON.stringify(stored)
  storage()?.setItem(SESSION_KEY, raw)
  sessionRaw = raw
  sessionSnapshot = stored
  emit(sessionListeners)
}

export function clearAuthSession(): void {
  storage()?.removeItem(SESSION_KEY)
  sessionRaw = null
  sessionSnapshot = null
  emit(sessionListeners)
}

export function subscribeAuthSession(onStoreChange: () => void): () => void {
  sessionListeners.add(onStoreChange)
  const onStorage = (event: StorageEvent) => {
    if (event.key === SESSION_KEY || event.key === null) {
      sessionRaw = undefined
      onStoreChange()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    sessionListeners.delete(onStoreChange)
    window.removeEventListener('storage', onStorage)
  }
}

// A signup/login that emailed an OTP persists which email is pending here —
// surviving a page refresh is the whole point: without this, reloading
// mid-verification loses `pendingEmail` (plain React state) and the page
// falls back to showing the credentials form instead of the OTP step.
// Starts (and, on each resend, restarts) the shared resend-cooldown timer.
function readPendingOtpSnapshot(): PendingOtp {
  const raw = storage()?.getItem(PENDING_OTP_KEY) ?? null
  if (raw === pendingOtpRaw) return pendingOtpSnapshot
  pendingOtpRaw = raw
  if (!raw) {
    pendingOtpSnapshot = null
    return null
  }
  try {
    const parsed = JSON.parse(raw) as Partial<StoredPendingOtp>
    // No `expiresAt` (pre-dates this mechanism) or past it — don't trust
    // it indefinitely; a stale entry otherwise pins the user in the OTP
    // step forever after they abandon the flow.
    if (!parsed.expiresAt || Date.now() > parsed.expiresAt) {
      storage()?.removeItem(PENDING_OTP_KEY)
      pendingOtpRaw = null
      pendingOtpSnapshot = null
      return null
    }
    pendingOtpSnapshot = parsed as PendingOtp
  } catch {
    pendingOtpSnapshot = null
  }
  return pendingOtpSnapshot
}

export function getPendingOtp(): PendingOtp {
  return readPendingOtpSnapshot()
}

export function setPendingOtp(
  email: string,
  purpose: 'signup' | 'login' | 'password_reset',
  otp?: string | null
): void {
  const snapshot: StoredPendingOtp = {
    email,
    purpose,
    otp: otp ?? null,
    expiresAt: Date.now() + PENDING_OTP_TTL_MS
  }
  const raw = JSON.stringify(snapshot)
  storage()?.setItem(PENDING_OTP_KEY, raw)
  pendingOtpRaw = raw
  pendingOtpSnapshot = snapshot
  startOtpCooldown()
  emit(pendingOtpListeners)
}

export function clearPendingOtp(): void {
  storage()?.removeItem(PENDING_OTP_KEY)
  pendingOtpRaw = null
  pendingOtpSnapshot = null
  clearOtpCooldown()
  emit(pendingOtpListeners)
}

export function subscribePendingOtp(onStoreChange: () => void): () => void {
  pendingOtpListeners.add(onStoreChange)
  const onStorage = (event: StorageEvent) => {
    if (event.key === PENDING_OTP_KEY || event.key === null) {
      pendingOtpRaw = undefined
      onStoreChange()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    pendingOtpListeners.delete(onStoreChange)
    window.removeEventListener('storage', onStorage)
  }
}
