import type { AuthUser } from '@/components/auth/types'

export const DEMO_OTP_CODE = '123456'

export const LOGIN_USER = `
  mutation LoginUser($email: String!, $password: String!, $rememberMe: Boolean) {
    loginUser(email: $email, password: $password, rememberMe: $rememberMe) {
      token
      otpSent
      message
      otpCode
    }
  }
`

export type LoginUserResult = {
  loginUser: {
    token?: string | null
    otpSent: boolean
    message?: string | null
    otpCode?: string | null
  }
}

export const REGISTER_USER = `
  mutation RegisterUser(
    $email: String!
    $password: String!
    $firstName: String
    $lastName: String
  ) {
    registerUser(
      email: $email
      password: $password
      firstName: $firstName
      lastName: $lastName
    ) {
      otpSent
      message
      otpCode
    }
  }
`

export type RegisterUserResult = {
  registerUser: {
    otpSent: boolean
    message?: string | null
    otpCode?: string | null
  }
}

export const LOGIN_WITH_OTP = `
  mutation LoginWithOtp($email: String!, $otp: String!) {
    loginWithOtp(email: $email, otp: $otp) {
      token
      user {
        id
        email
        firstName
        lastName
      }
    }
  }
`

export type LoginWithOtpResult = {
  loginWithOtp: {
    token: string
    user: AuthUser
  }
}

export const RESEND_OTP = `
  mutation ResendOtp($email: String!) {
    resendOtp(email: $email) {
      message
      otpCode
    }
  }
`

export type ResendOtpResult = {
  resendOtp: {
    message: string
    otpCode?: string | null
  }
}

export const SEND_PASSWORD_RESET_OTP = `
  mutation SendPasswordResetOtp($email: String!) {
    sendPasswordResetOtp(email: $email) {
      message
      otpCode
    }
  }
`

export type SendPasswordResetOtpResult = {
  sendPasswordResetOtp: {
    message: string
    otpCode?: string | null
  }
}

export const VERIFY_PASSWORD_RESET_OTP = `
  mutation VerifyPasswordResetOtp($email: String!, $otp: String!) {
    verifyPasswordResetOtp(email: $email, otp: $otp) {
      resetPasswordToken
    }
  }
`

export type VerifyPasswordResetOtpResult = {
  verifyPasswordResetOtp: {
    resetPasswordToken: string
  }
}

export const SET_PASSWORD = `
  mutation SetPassword(
    $token: String!
    $password: String!
    $passwordConfirmation: String!
    $resetPassword: Boolean!
  ) {
    setPassword(
      token: $token
      password: $password
      passwordConfirmation: $passwordConfirmation
      resetPassword: $resetPassword
    ) {
      token
      user {
        id
        email
        firstName
        lastName
      }
    }
  }
`

export type SetPasswordResult = {
  setPassword: {
    token?: string | null
    user?: AuthUser | null
  }
}

export const ACCEPT_INVITATION = `
  mutation AcceptInvitation(
    $token: String!
    $password: String!
    $passwordConfirmation: String!
  ) {
    acceptInvitation(
      token: $token
      password: $password
      passwordConfirmation: $passwordConfirmation
    ) {
      token
      user {
        id
        email
        firstName
        lastName
      }
    }
  }
`

export type AcceptInvitationResult = {
  acceptInvitation: {
    token: string
    user: AuthUser
  }
}

export const UPDATE_PASSWORD = `
  mutation UpdatePassword(
    $currentPassword: String!
    $password: String!
    $passwordConfirmation: String!
  ) {
    updatePassword(
      currentPassword: $currentPassword
      password: $password
      passwordConfirmation: $passwordConfirmation
    ) {
      response
    }
  }
`

export type UpdatePasswordResult = {
  updatePassword: {
    response: string
  }
}
