import { getAuthSession, setAuthSession } from '@/components/auth/auth-session'

export const ACCOUNT_SETTINGS_MOCK_ENDPOINT = 'mock://account-settings'

// Real email delivery has two separate inboxes (current, then new) in the loop; the mock
// only ever has one fixed demo code since there's no mail to actually send.
const DEMO_CODE = '123456'

// ResendEmailChangeOtp takes no arguments — like the real backend, the mock
// has to infer which OTP is outstanding purely from state, not from an
// argument the caller passes.
let pendingStage: 'current' | 'new' | null = null
let pendingNewEmail: string | null = null

function opName(query: string): string {
  const m = query.match(/\b(?:mutation|query)\s+(\w+)/)
  return m?.[1] ?? ''
}

function delay(ms = 300) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function accountSettingsMockFetch<T>(
  _endpoint: string,
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  await delay()
  const name = opName(query)
  const v = (variables.input ?? {}) as Record<string, unknown>

  switch (name) {
    case 'RequestEmailChange': {
      pendingStage = 'current'
      pendingNewEmail = null
      return { requestEmailChange: { success: true, otp: DEMO_CODE } } as T
    }

    case 'VerifyCurrentEmailChange': {
      const otp = String(v.otp ?? '')
      if (pendingStage !== 'current') throw new Error('No pending email change')
      if (otp !== DEMO_CODE) throw new Error('Invalid code')
      // Waiting on the new-email step now — no OTP outstanding yet.
      pendingStage = null
      return { verifyCurrentEmailChange: { success: true } } as T
    }

    case 'RequestNewEmailChange': {
      const newEmail = String(v.newEmail ?? '')
        .toLowerCase()
        .trim()
      if (!newEmail) throw new Error('New email is required')
      pendingNewEmail = newEmail
      pendingStage = 'new'
      return { requestNewEmailChange: { success: true, otp: DEMO_CODE } } as T
    }

    case 'VerifyNewEmailChange': {
      const otp = String(v.otp ?? '')
      if (pendingStage !== 'new' || !pendingNewEmail) throw new Error('No pending email change')
      if (otp !== DEMO_CODE) throw new Error('Invalid code')
      const email = pendingNewEmail
      pendingNewEmail = null
      pendingStage = null
      const session = getAuthSession()
      const user = session ? { ...session.user, email } : { id: 'user_demo', email }
      if (session) setAuthSession({ ...session, user })
      return { verifyNewEmailChange: { user } } as T
    }

    case 'ResendEmailChangeOtp': {
      if (!pendingStage) throw new Error('No verification code is pending.')
      return { resendEmailChangeOtp: { message: 'Code resent', otpSent: true, otp: DEMO_CODE } } as T
    }

    case 'CancelEmailChange': {
      pendingStage = null
      pendingNewEmail = null
      return { cancelEmailChange: { success: true } } as T
    }

    default:
      throw new Error(`Unknown account-settings operation: ${name || '(unnamed)'}`)
  }
}
