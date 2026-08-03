import { getAuthSession, setAuthSession } from '@/components/auth/auth-session'

export const ACCOUNT_SETTINGS_MOCK_ENDPOINT = 'mock://account-settings'

// Real email delivery has two separate inboxes (current, then new) in the loop; the mock
// only ever has one fixed demo code since there's no mail to actually send.
const DEMO_CODE = '123456'

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
      const currentPassword = String(v.currentPassword ?? '')
      const newEmail = String(v.newEmail ?? '').toLowerCase().trim()
      if (!currentPassword) throw new Error('Current password is required')
      if (!newEmail) throw new Error('New email is required')
      pendingNewEmail = newEmail
      return { requestEmailChange: { success: true } } as T
    }

    case 'VerifyCurrentEmailChange': {
      const otp = String(v.otp ?? '')
      if (otp !== DEMO_CODE) throw new Error('Invalid code')
      return { verifyCurrentEmailChange: { success: true } } as T
    }

    case 'VerifyNewEmailChange': {
      const otp = String(v.otp ?? '')
      if (otp !== DEMO_CODE) throw new Error('Invalid code')
      if (!pendingNewEmail) throw new Error('No pending email change')
      const email = pendingNewEmail
      pendingNewEmail = null
      const session = getAuthSession()
      const user = session ? { ...session.user, email } : { id: 'user_demo', email }
      if (session) setAuthSession({ ...session, user })
      return { verifyNewEmailChange: { user } } as T
    }

    case 'CancelEmailChange': {
      pendingNewEmail = null
      return { cancelEmailChange: { success: true } } as T
    }

    default:
      throw new Error(`Unknown account-settings operation: ${name || '(unnamed)'}`)
  }
}
