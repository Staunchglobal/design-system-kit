
export const OTP_RESEND_COOLDOWN_SECONDS = 60
export const OTP_TIMER_STORAGE_KEY = 'design-kit-auth-otp-timer-end'

const listeners = new Set<() => void>()

function emit(): void {
  listeners.forEach((listener) => listener())
}

export function subscribeOtpTimer(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange)
  const id = window.setInterval(onStoreChange, 250)
  const onStorage = (event: StorageEvent) => {
    if (event.key === OTP_TIMER_STORAGE_KEY || event.key === null) onStoreChange()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(onStoreChange)
    window.clearInterval(id)
    window.removeEventListener('storage', onStorage)
  }
}

export function readOtpSecondsLeft(): number {
  if (typeof window === 'undefined') return 0
  const end = Number(window.localStorage.getItem(OTP_TIMER_STORAGE_KEY) || 0)
  return Math.max(0, Math.ceil((end - Date.now()) / 1000))
}

export function startOtpCooldown(seconds: number = OTP_RESEND_COOLDOWN_SECONDS): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(OTP_TIMER_STORAGE_KEY, String(Date.now() + seconds * 1000))
  emit()
}

export function clearOtpCooldown(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(OTP_TIMER_STORAGE_KEY)
  emit()
}
