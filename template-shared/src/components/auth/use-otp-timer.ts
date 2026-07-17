'use client'

import * as React from 'react'

import {
  OTP_RESEND_COOLDOWN_SECONDS,
  clearOtpCooldown,
  readOtpSecondsLeft,
  startOtpCooldown,
  subscribeOtpTimer,
} from '@/components/auth/otp-timer-storage'

export { OTP_RESEND_COOLDOWN_SECONDS, clearOtpCooldown, startOtpCooldown }

/**
 * 60s OTP resend cooldown persisted in localStorage.
 *
 * Uses `useSyncExternalStore` so SSR / hydration stay aligned (server snapshot is 0 /
 * not-ready) without calling setState inside an effect.
 */
export function useOtpTimer(cooldownSeconds: number = OTP_RESEND_COOLDOWN_SECONDS) {
  const secondsLeft = React.useSyncExternalStore(
    subscribeOtpTimer,
    readOtpSecondsLeft,
    () => 0
  )

  // false on the server + first hydration paint; true on the client afterward.
  const ready = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const start = React.useCallback(
    (seconds: number = cooldownSeconds) => {
      startOtpCooldown(seconds)
    },
    [cooldownSeconds]
  )

  /** Resume an in-flight cooldown, or start one if none is active. */
  const startIfNeeded = React.useCallback(
    (seconds: number = cooldownSeconds) => {
      if (readOtpSecondsLeft() > 0) return
      start(seconds)
    },
    [cooldownSeconds, start]
  )

  const clear = React.useCallback(() => {
    clearOtpCooldown()
  }, [])

  return {
    secondsLeft,
    ready,
    /** Only true after mount and when the cooldown has elapsed. */
    canResend: ready && secondsLeft <= 0,
    start,
    startIfNeeded,
    clear,
  }
}
