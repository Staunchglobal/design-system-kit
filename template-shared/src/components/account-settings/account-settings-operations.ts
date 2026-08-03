import type { AuthUser } from '@/components/auth/types'

// Every mutation here wraps its arguments in a single `$input` variable —
// the backend's mutations extend GraphQL::Schema::RelayClassicMutation,
// which always exposes declared arguments as one input object on the wire,
// not as flat top-level arguments (even CancelEmailChange, which has none).

export const REQUEST_EMAIL_CHANGE = `
  mutation RequestEmailChange($input: RequestEmailChangeInput!) {
    requestEmailChange(input: $input) {
      success
    }
  }
`

export type RequestEmailChangeResult = {
  requestEmailChange: {
    success: boolean
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

export const VERIFY_NEW_EMAIL_CHANGE = `
  mutation VerifyNewEmailChange($input: VerifyNewEmailChangeInput!) {
    verifyNewEmailChange(input: $input) {
      user {
        id
        email
        createdAt
      }
    }
  }
`

export type VerifyNewEmailChangeResult = {
  verifyNewEmailChange: {
    user: AuthUser
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
