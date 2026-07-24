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

export function useAuthSession(): AuthSession | null {
  return React.useSyncExternalStore(subscribeAuthSession, getAuthSession, () => null)
}

export function useAuthHandoff(): ReturnType<typeof getAuthHandoff> {
  return React.useSyncExternalStore(subscribeAuthHandoff, getAuthHandoff, () => EMPTY_HANDOFF)
}
