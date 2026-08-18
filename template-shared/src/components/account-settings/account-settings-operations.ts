import type { AuthUser } from '@/components/auth/types'

// Every mutation here wraps its arguments in a single `$input` variable —
// the backend's mutations extend GraphQL::Schema::RelayClassicMutation,
// which always exposes declared arguments as one input object on the wire,
// not as flat top-level arguments (even RequestEmailChange/
// ResendEmailChangeOtp/CancelEmailChange, which have none).

export const REQUEST_EMAIL_CHANGE = `
  mutation RequestEmailChange($input: RequestEmailChangeInput!) {
    requestEmailChange(input: $input) {
      success
      otp
    }
  }
`

export type RequestEmailChangeResult = {
  requestEmailChange: {
    success: boolean
    /** Dev/staging convenience — nil unless the backend opts into `config.expose_otp_in_response`. */
    otp?: string | null
  }
}

export const VERIFY_CURRENT_EMAIL_CHANGE = `
  mutation VerifyCurrentEmailChange($input: VerifyCurrentEmailChangeInput!) {
    verifyCurrentEmailChange(input: $input) {
      success
    }
  }
`

export type VerifyCurrentEmailChangeResult = {
  verifyCurrentEmailChange: {
    success: boolean
  }
}

export const REQUEST_NEW_EMAIL_CHANGE = `
  mutation RequestNewEmailChange($input: RequestNewEmailChangeInput!) {
    requestNewEmailChange(input: $input) {
      success
      otp
    }
  }
`

export type RequestNewEmailChangeResult = {
  requestNewEmailChange: {
    success: boolean
    otp?: string | null
  }
}

export const VERIFY_NEW_EMAIL_CHANGE = `
  mutation VerifyNewEmailChange($input: VerifyNewEmailChangeInput!) {
    verifyNewEmailChange(input: $input) {
      user {
        id
        email
        createdAt
        firstName
        lastName
        fullName
      }
    }
  }
`

export type VerifyNewEmailChangeResult = {
  verifyNewEmailChange: {
    user: AuthUser
  }
}

export const RESEND_EMAIL_CHANGE_OTP = `
  mutation ResendEmailChangeOtp($input: ResendEmailChangeOtpInput!) {
    resendEmailChangeOtp(input: $input) {
      message
      otpSent
      otp
    }
  }
`

export type ResendEmailChangeOtpResult = {
  resendEmailChangeOtp: {
    message: string
    otpSent: boolean
    otp?: string | null
  }
}

export const CANCEL_EMAIL_CHANGE = `
  mutation CancelEmailChange($input: CancelEmailChangeInput!) {
    cancelEmailChange(input: $input) {
      success
    }
  }
`

export type CancelEmailChangeResult = {
  cancelEmailChange: {
    success: boolean
  }
}
