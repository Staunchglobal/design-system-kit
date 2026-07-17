'use client'

import * as React from 'react'

import {
  getAuthHandoff,
  getAuthSession,
  subscribeAuthHandoff,
  subscribeAuthSession,
} from '@/components/auth/auth-session'
import type { AuthSession } from '@/components/auth/types'

const EMPTY_HANDOFF = { email: null, mode: null, otpHint: null } as const

/** Client session from localStorage — SSR/hydration safe via useSyncExternalStore. */
export function useAuthSession(): AuthSession | null {
  return React.useSyncExternalStore(subscribeAuthSession, getAuthSession, () => null)
}

/** OTP handoff (email/mode/hint) from localStorage — SSR/hydration safe. */
export function useAuthHandoff(): ReturnType<typeof getAuthHandoff> {
  return React.useSyncExternalStore(subscribeAuthHandoff, getAuthHandoff, () => EMPTY_HANDOFF)
}
