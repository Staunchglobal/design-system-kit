export type AuthUser = {
  id: string
  email: string
  firstName: string
  lastName: string
}

export type AuthSession = {
  token: string
  user: AuthUser
}

export type OtpMode = 'login' | 'reset'

export type LoginFormValues = {
  email: string
  password: string
  rememberMe: boolean
}

export type SignupFormValues = {
  firstName: string
  lastName: string
  email: string
  password: string
  passwordConfirmation: string
  termsAccepted: boolean
}

export type ForgotPasswordFormValues = {
  email: string
}

export type VerifyOtpFormValues = {
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
