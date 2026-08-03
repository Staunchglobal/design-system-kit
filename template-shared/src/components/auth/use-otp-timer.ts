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

export function useOtpTimer(cooldownSeconds: number = OTP_RESEND_COOLDOWN_SECONDS) {
  const secondsLeft = React.useSyncExternalStore(
    subscribeOtpTimer,
    readOtpSecondsLeft,
    () => 0
  )

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
    canResend: ready && secondsLeft <= 0,
    start,
    startIfNeeded,
    clear,
  }
}
