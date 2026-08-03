import type { AuthSession } from '@/components/auth/types'
import { clearOtpCooldown, startOtpCooldown } from '@/components/auth/otp-timer-storage'

const SESSION_KEY = 'design-kit-auth-session'
const PENDING_OTP_KEY = 'design-kit-auth-otp-pending'

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

let pendingOtpSnapshot: PendingOtp = null
let pendingOtpRaw: string | null | undefined = undefined

function emit(listeners: Set<() => void>): void {
  listeners.forEach((listener) => listener())
}

function storage(): Storage | null {
  if (typeof window === 'undefined') return null
  return window.localStorage
}

function readSessionSnapshot(): AuthSession | null {
  const raw = storage()?.getItem(SESSION_KEY) ?? null
  if (raw === sessionRaw) return sessionSnapshot
  sessionRaw = raw
  if (!raw) {
    sessionSnapshot = null
    return null
  }
  try {
    sessionSnapshot = JSON.parse(raw) as AuthSession
  } catch {
    sessionSnapshot = null
  }
  return sessionSnapshot
}

export function getAuthSession(): AuthSession | null {
  return readSessionSnapshot()
}

export function setAuthSession(session: AuthSession): void {
  const raw = JSON.stringify(session)
  storage()?.setItem(SESSION_KEY, raw)
  sessionRaw = raw
  sessionSnapshot = session
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
    pendingOtpSnapshot = JSON.parse(raw) as PendingOtp
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
  const snapshot: PendingOtp = { email, purpose, otp: otp ?? null }
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
