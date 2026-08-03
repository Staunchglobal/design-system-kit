'use client'

import * as React from 'react'

import {
  getAuthSession,
  getPendingOtp,
  subscribeAuthSession,
  subscribePendingOtp,
  type PendingOtp,
} from '@/components/auth/auth-session'
import type { AuthSession } from '@/components/auth/types'

export function useAuthSession(): AuthSession | null {
  return React.useSyncExternalStore(subscribeAuthSession, getAuthSession, () => null)
}

/** Which email (if any) is mid-OTP-verification — survives a page refresh. */
export function usePendingOtp(): PendingOtp {
  return React.useSyncExternalStore(subscribePendingOtp, getPendingOtp, () => null)
}
