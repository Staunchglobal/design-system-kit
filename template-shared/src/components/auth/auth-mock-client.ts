import type { AuthUser } from '@/components/auth/types'
import { toast } from '@/components/auth/notify'

type StoredUser = AuthUser & {
  password: string
  otpCode: string | null
  otpPurpose: 'signup' | 'login' | 'password_reset' | null
}

const users = new Map<string, StoredUser>()
const resetTokens = new Map<string, string>()
const invitationTokens = new Map<string, string>()
const sessions = new Map<string, string>()

let nextUserId = 1

function seed() {
  if (users.size > 0) return
  users.set('demo@example.com', {
    id: 'user_demo',
    email: 'demo@example.com',
    password: 'Password1!',
    otpCode: null,
    otpPurpose: null,
  })
  invitationTokens.set('invite-demo-token', 'invite@example.com')
  users.set('invite@example.com', {
    id: 'user_invite',
    email: 'invite@example.com',
    password: '',
    otpCode: null,
    otpPurpose: null,
  })
}

function delay(ms = 350) {
  return new Promise((r) => setTimeout(r, ms))
}

function opName(query: string): string {
  const m = query.match(/\b(?:mutation|query)\s+(\w+)/)
  return m?.[1] ?? ''
}

function issueToken(email: string): string {
  const token = `tok_${email}_${Date.now()}`
  sessions.set(token, email)
  return token
}

function requireMatch(password: string, confirmation: string) {
  if (password !== confirmation) {
    throw new Error('Password confirmation does not match')
  }
}

function publicUser(user: StoredUser): AuthUser {
  return { id: user.id, email: user.email, createdAt: user.createdAt }
}

// No real inbox in mock mode — surface the code a real email would have contained.
function sendMockOtp(user: StoredUser, purpose: 'signup' | 'login' | 'password_reset'): string {
  const code = String(Math.floor(100000 + Math.random() * 900000))
  user.otpCode = code
  user.otpPurpose = purpose
  toast.info(`Demo: no email sent. Your verification code is ${code}`)
  return code
}

export async function authMockFetch<T>(
  _endpoint: string,
  query: string,
  variables: Record<string, unknown> = {},
  headers?: HeadersInit
): Promise<T> {
  seed()
  await delay()

  const name = opName(query)
  const v = (variables.input ?? {}) as Record<string, unknown>

  switch (name) {
    case 'SignUp': {
      const email = String(v.email ?? '').toLowerCase().trim()
      const password = String(v.password ?? '')
      requireMatch(password, String(v.passwordConfirmation ?? ''))
      if (users.has(email) && users.get(email)!.password) {
        throw new Error('An account with this email already exists')
      }
      const user: StoredUser = {
        id: `user_${nextUserId++}`,
        email,
        password,
        otpCode: null,
        otpPurpose: null,
        createdAt: new Date().toISOString(),
      }
      users.set(email, user)
      const signUpOtp = sendMockOtp(user, 'signup')
      return { signUp: { message: 'Verification code sent.', otpSent: true, otp: signUpOtp } } as T
    }

    case 'Login': {
      const email = String(v.email ?? '').toLowerCase().trim()
      const password = String(v.password ?? '')
      const user = users.get(email)
      if (!user || user.password !== password) {
        throw new Error('Invalid email or password')
      }
      const loginOtp = sendMockOtp(user, 'login')
      return { login: { message: 'Verification code sent.', otpSent: true, otp: loginOtp } } as T
    }

    case 'VerifyOtp': {
      const email = String(v.email ?? '').toLowerCase().trim()
      const otp = String(v.otp ?? '')
      const user = users.get(email)
      if (!user || !user.otpCode || !user.otpPurpose || user.otpCode !== otp) {
        throw new Error('Invalid or expired code')
      }
      user.otpCode = null
      user.otpPurpose = null
      return { verifyOtp: { token: issueToken(email), user: publicUser(user) } } as T
    }

    case 'ResendOtp': {
      const email = String(v.email ?? '').toLowerCase().trim()
      const user = users.get(email)
      if (!user || !user.otpPurpose) {
        throw new Error('No pending verification for that email')
      }
      const resendOtpCode = sendMockOtp(user, user.otpPurpose)
      return { resendOtp: { message: 'Verification code resent.', otpSent: true, otp: resendOtpCode } } as T
    }

    case 'RequestPasswordReset': {
      const email = String(v.email ?? '').toLowerCase().trim()
      const user = users.get(email)
      // Enumeration-safe: always succeeds, regardless of whether the email exists.
      const otp = user && user.password ? sendMockOtp(user, 'password_reset') : null
      return { requestPasswordReset: { success: true, otp } } as T
    }

    case 'VerifyPasswordResetOtp': {
      const email = String(v.email ?? '').toLowerCase().trim()
      const otp = String(v.otp ?? '')
      const user = users.get(email)
      if (!user || user.otpPurpose !== 'password_reset' || user.otpCode !== otp) {
        throw new Error('Invalid or expired code')
      }
      user.otpCode = null
      user.otpPurpose = null
      const resetPasswordToken = `reset_${email}_${Date.now()}`
      resetTokens.set(resetPasswordToken, email)
      return { verifyPasswordResetOtp: { resetPasswordToken } } as T
    }

    case 'ResetPassword': {
      const token = String(v.resetPasswordToken ?? '')
      const password = String(v.password ?? '')
      requireMatch(password, String(v.passwordConfirmation ?? ''))
      const email = resetTokens.get(token)
      if (!email) throw new Error('Invalid or expired reset token')
      const user = users.get(email)
      if (!user) throw new Error('User not found')
      user.password = password
      resetTokens.delete(token)
      return {
        resetPassword: { token: issueToken(email), user: publicUser(user) },
      } as T
    }

    case 'AcceptInvitation': {
      const token = String(v.token ?? '')
      const password = String(v.password ?? '')
      requireMatch(password, String(v.passwordConfirmation ?? ''))
      const email = invitationTokens.get(token)
      if (!email) throw new Error('Invalid or expired invitation token')
      const user = users.get(email)
      if (!user) throw new Error('Invitation not found')
      user.password = password
      if (token !== 'invite-demo-token') invitationTokens.delete(token)
      return { acceptInvitation: { success: true } } as T
    }

    case 'UpdatePassword': {
      const authHeader =
        typeof headers === 'object' && headers && 'Authorization' in (headers as Record<string, string>)
          ? (headers as Record<string, string>).Authorization
          : Array.isArray(headers)
            ? undefined
            : headers instanceof Headers
              ? headers.get('Authorization')
              : undefined
      const bearer = authHeader?.replace(/^Bearer\s+/i, '') ?? ''
      const email = sessions.get(bearer)
      if (!email) throw new Error('Unauthorized')
      const user = users.get(email)
      if (!user) throw new Error('User not found')
      if (user.password !== String(v.currentPassword ?? '')) {
        throw new Error('Current password is incorrect')
      }
      requireMatch(String(v.password ?? ''), String(v.passwordConfirmation ?? ''))
      user.password = String(v.password ?? '')
      return { updatePassword: { success: true } } as T
    }

    case 'CurrentUser': {
      // The mock has no role system to demo — every admin-gated nav item/
      // button simply stays hidden in pure-mock mode. Swap in a real
      // NEXT_PUBLIC_GRAPHQL_URL to see role-based abilities for real.
      return { currentUser: { roles: [], impersonatorId: null, abilities: [] } } as T
    }

    default:
      throw new Error(`Unknown auth operation: ${name || '(unnamed)'}`)
  }
}

export const AUTH_MOCK_ENDPOINT = 'mock://auth'
