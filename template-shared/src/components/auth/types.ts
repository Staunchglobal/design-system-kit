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
