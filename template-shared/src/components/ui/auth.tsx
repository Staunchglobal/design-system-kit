/**
 * Opt-in auth feature entry — filesystem discovery picks up slug `auth`.
 * Prefer importing forms/helpers from `@/components/auth/*` directly.
 */
export { AuthShell } from '@/components/auth/auth-shell'
export { LoginForm } from '@/components/auth/login-form'
export { SignupForm } from '@/components/auth/signup-form'
export { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
export { VerifyOtpForm } from '@/components/auth/verify-otp-form'
export { SetPasswordForm } from '@/components/auth/set-password-form'
export { ChangePasswordForm } from '@/components/auth/change-password-form'
export { createAuthFetch, AUTH_MOCK_ENDPOINT } from '@/components/auth/auth-fetch'
export {
  getAuthSession,
  setAuthSession,
  clearAuthSession,
} from '@/components/auth/auth-session'
/** Ensures sonner lands in auth uiDeps (auth layout / pages mount Toaster). */
export { Toaster } from '@/components/ui/sonner'
