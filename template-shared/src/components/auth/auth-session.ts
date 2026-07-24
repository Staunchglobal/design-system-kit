import type { AuthSession, AuthUser } from '@/components/auth/types'
import { clearOtpCooldown, startOtpCooldown } from '@/components/auth/otp-timer-storage'

const SESSION_KEY = 'design-kit-auth-session'
const HANDOFF_EMAIL_KEY = 'design-kit-auth-email'
const HANDOFF_MODE_KEY = 'design-kit-auth-otp-mode'
const HANDOFF_OTP_HINT_KEY = 'design-kit-auth-otp-hint'

const sessionListeners = new Set<() => void>()
const handoffListeners = new Set<() => void>()

type AuthHandoff = {
  email: string | null
  mode: 'login' | 'reset' | null
  otpHint: string | null
}

const EMPTY_HANDOFF: AuthHandoff = { email: null, mode: null, otpHint: null }

let sessionSnapshot: AuthSession | null = null
let sessionRaw: string | null | undefined = undefined
let handoffSnapshot: AuthHandoff = EMPTY_HANDOFF
let handoffRaw: string | null | undefined = undefined

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

function readHandoffSnapshot(): AuthHandoff {
  const s = storage()
  const raw = `${s?.getItem(HANDOFF_EMAIL_KEY) ?? ''}\0${s?.getItem(HANDOFF_MODE_KEY) ?? ''}\0${s?.getItem(HANDOFF_OTP_HINT_KEY) ?? ''}`
  if (raw === handoffRaw) return handoffSnapshot
  handoffRaw = raw
  const mode = s?.getItem(HANDOFF_MODE_KEY)
  handoffSnapshot = {
    email: s?.getItem(HANDOFF_EMAIL_KEY) ?? null,
    mode: mode === 'login' || mode === 'reset' ? mode : null,
    otpHint: s?.getItem(HANDOFF_OTP_HINT_KEY) ?? null,
  }
  return handoffSnapshot
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

export function setAuthHandoff(email: string, mode: 'login' | 'reset', otpHint?: string): void {
  const s = storage()
  const normalized = email.trim().toLowerCase()
  s?.setItem(HANDOFF_EMAIL_KEY, normalized)
  s?.setItem(HANDOFF_MODE_KEY, mode)
  if (otpHint) s?.setItem(HANDOFF_OTP_HINT_KEY, otpHint)
  else s?.removeItem(HANDOFF_OTP_HINT_KEY)
  startOtpCooldown()
  handoffRaw = undefined
  readHandoffSnapshot()
  emit(handoffListeners)
}

export function getAuthHandoff(): AuthHandoff {
  return readHandoffSnapshot()
}

export function subscribeAuthHandoff(onStoreChange: () => void): () => void {
  handoffListeners.add(onStoreChange)
  const onStorage = (event: StorageEvent) => {
    if (
      event.key === HANDOFF_EMAIL_KEY ||
      event.key === HANDOFF_MODE_KEY ||
      event.key === HANDOFF_OTP_HINT_KEY ||
      event.key === null
    ) {
      handoffRaw = undefined
      onStoreChange()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    handoffListeners.delete(onStoreChange)
    window.removeEventListener('storage', onStorage)
  }
}

export function clearAuthHandoff(): void {
  const s = storage()
  s?.removeItem(HANDOFF_EMAIL_KEY)
  s?.removeItem(HANDOFF_MODE_KEY)
  s?.removeItem(HANDOFF_OTP_HINT_KEY)
  clearOtpCooldown()
  handoffRaw = null
  handoffSnapshot = EMPTY_HANDOFF
  emit(handoffListeners)
}

export function makeDemoUser(partial: Partial<AuthUser> & { email: string }): AuthUser {
  return {
    id: partial.id ?? `user_${partial.email}`,
    email: partial.email,
    firstName: partial.firstName ?? 'Demo',
    lastName: partial.lastName ?? 'User',
  }
}
