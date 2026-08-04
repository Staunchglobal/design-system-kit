export type AuthUser = {
  id: string
  email: string
  createdAt?: string
}

export type AuthSession = {
  token: string
  user: AuthUser
}

export type LoginFormValues = {
  email: string
  password: string
  rememberMe: boolean
}

export type SignupFormValues = {
  email: string
  password: string
  passwordConfirmation: string
  termsAccepted: boolean
}

export type ForgotPasswordFormValues = {
  email: string
}

export type OtpFormValues = {
  otp: string
}

export type SetPasswordFormValues = {
  password: string
  passwordConfirmation: string
}

export type ChangePasswordFormValues = {
  currentPassword: string
  password: string
  passwordConfirmation: string
}

export type AuthFetch = <T>(
  query: string,
  variables?: Record<string, unknown>
) => Promise<T>

/**
 * `abilities` is the single source of truth for what to show a signed-in
 * user — nav items, buttons, tabs — computed server-side from real Pundit
 * policies (see SaasKit::ExposesAbilities on the backend). Never re-derive
 * permission logic from `roles` on the frontend; check `abilities.includes`
 * (or the `can()` helper `useCurrentUser` returns) instead, so a new gated
 * feature only ever needs a backend `ability(...)` registration, not a
 * parallel frontend rule.
 */
export type CurrentUser = {
  roles: string[]
  impersonatorId: string | null
  abilities: string[]
}
