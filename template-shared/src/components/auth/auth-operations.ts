import type { AuthUser } from '@/components/auth/types'

// Every mutation here wraps its arguments in a single `$input` variable —
// the backend's mutations extend GraphQL::Schema::RelayClassicMutation,
// which always exposes declared arguments as one input object on the wire,
// not as flat top-level arguments.

// `otp` is the code itself, returned only for dev/staging convenience —
// still emailed for real either way. `null` once a host app strips this
// field at the gateway for production.
export const SIGN_UP = `
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input) {
      message
      otpSent
      otp
    }
  }
`

export type SignUpResult = {
  signUp: {
    message: string
    otpSent: boolean
    otp?: string | null
  }
}

// Every sign-up and login is a mandatory two-step flow — neither mutation
// ever returns a token directly. Both always email a 6-digit code and the
// caller completes the flow with VerifyOtp.
export const LOGIN = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      message
      otpSent
      otp
    }
  }
`

export type LoginResult = {
  login: {
    message: string
    otpSent: boolean
    otp?: string | null
  }
}

// Completes whichever flow (SignUp or Login) sent the code — the backend
// checks the user's currently-pending purpose itself, so the caller
// doesn't have to say which one it expects.
export const VERIFY_OTP = `
  mutation VerifyOtp($input: VerifyOtpInput!) {
    verifyOtp(input: $input) {
      token
      user {
        id
        email
        createdAt
      }
    }
  }
`

export type VerifyOtpResult = {
  verifyOtp: {
    token: string
    user: AuthUser
  }
}

export const RESEND_OTP = `
  mutation ResendOtp($input: ResendOtpInput!) {
    resendOtp(input: $input) {
      message
      otpSent
      otp
    }
  }
`

export type ResendOtpResult = {
  resendOtp: {
    message: string
    otpSent: boolean
    otp?: string | null
  }
}

// Password reset is the same OTP mechanism as signup/login, not a Devise
// reset-link email — this mutation emails a 6-digit code;
// VerifyPasswordResetOtp exchanges a valid code for the real
// resetPasswordToken ResetPassword expects.
export const REQUEST_PASSWORD_RESET = `
  mutation RequestPasswordReset($input: RequestPasswordResetInput!) {
    requestPasswordReset(input: $input) {
      success
      otp
    }
  }
`

export type RequestPasswordResetResult = {
  requestPasswordReset: {
    success: boolean
    otp?: string | null
  }
}

export const VERIFY_PASSWORD_RESET_OTP = `
  mutation VerifyPasswordResetOtp($input: VerifyPasswordResetOtpInput!) {
    verifyPasswordResetOtp(input: $input) {
      resetPasswordToken
    }
  }
`

export type VerifyPasswordResetOtpResult = {
  verifyPasswordResetOtp: {
    resetPasswordToken: string
  }
}

export const RESET_PASSWORD = `
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input) {
      token
      user {
        id
        email
        createdAt
      }
    }
  }
`

export type ResetPasswordResult = {
  resetPassword: {
    token?: string | null
    user?: AuthUser | null
  }
}

// Accepting an invitation only creates the account — the caller must follow
// up with a separate `login` (itself now an OTP step-up) call, since the
// invitee's password (not an auth token) is the only thing this mutation
// returns.
export const ACCEPT_INVITATION = `
  mutation AcceptInvitation($input: AcceptInvitationInput!) {
    acceptInvitation(input: $input) {
      success
    }
  }
`

export type AcceptInvitationResult = {
  acceptInvitation: {
    success: boolean
  }
}

export const UPDATE_PASSWORD = `
  mutation UpdatePassword($input: UpdatePasswordInput!) {
    updatePassword(input: $input) {
      success
    }
  }
`

export type UpdatePasswordResult = {
  updatePassword: {
    success: boolean
  }
}
