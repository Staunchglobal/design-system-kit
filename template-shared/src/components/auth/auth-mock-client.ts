import { DEMO_OTP_CODE } from '@/components/auth/auth-operations'
import { makeDemoUser } from '@/components/auth/auth-session'
import type { AuthUser } from '@/components/auth/types'

/**
 * In-memory dummy GraphQL auth API.
 * Same signature as graphqlFetch so pages can swap endpoint + fetchImpl.
 *
 * Demo credentials:
 * - Seeded user: demo@example.com / Password1!
 * - OTP always: 123456
 * - Invite token: invite-demo-token
 */

type StoredUser = AuthUser & { password: string }

const users = new Map<string, StoredUser>()
const pendingOtps = new Map<string, { code: string; purpose: 'login' | 'reset' }>()
const resetTokens = new Map<string, string>() // token -> email
const sessions = new Map<string, string>() // bearer token -> email

function seed() {
  if (users.size > 0) return
  const email = 'demo@example.com'
  users.set(email, {
    ...makeDemoUser({ email, firstName: 'Demo', lastName: 'User', id: 'user_demo' }),
    password: 'Password1!',
  })
  resetTokens.set('invite-demo-token', 'invite@example.com')
  users.set('invite@example.com', {
    ...makeDemoUser({
      email: 'invite@example.com',
      firstName: 'Invite',
      lastName: 'Guest',
      id: 'user_invite',
    }),
    password: '',
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

/**
 * Mock GraphQL fetch — drop-in for auth pages.
 * Pass any endpoint string; it is ignored (in-memory only).
 */
export async function authMockFetch<T>(
  _endpoint: string,
  query: string,
  variables: Record<string, unknown> = {},
  headers?: HeadersInit
): Promise<T> {
  seed()
  await delay()

  const name = opName(query)
  const v = variables

  try {
    switch (name) {
      case 'LoginUser': {
        const email = String(v.email ?? '').toLowerCase().trim()
        const password = String(v.password ?? '')
        const user = users.get(email)
        if (!user || user.password !== password) {
          throw new Error('Invalid email or password')
        }
        // Always require OTP in the demo (mirrors learnerpass); switch to token-only by returning token.
        pendingOtps.set(email, { code: DEMO_OTP_CODE, purpose: 'login' })
        return {
          loginUser: {
            token: null,
            otpSent: true,
            message: 'OTP sent to your email',
            otpCode: DEMO_OTP_CODE,
          },
        } as T
      }

      case 'RegisterUser': {
        const email = String(v.email ?? '').toLowerCase().trim()
        if (users.has(email) && users.get(email)!.password) {
          throw new Error('An account with this email already exists')
        }
        users.set(email, {
          ...makeDemoUser({
            email,
            firstName: String(v.firstName ?? 'New'),
            lastName: String(v.lastName ?? 'User'),
          }),
          password: String(v.password ?? ''),
        })
        pendingOtps.set(email, { code: DEMO_OTP_CODE, purpose: 'login' })
        return {
          registerUser: {
            otpSent: true,
            message: 'Account created. Verify with OTP.',
            otpCode: DEMO_OTP_CODE,
          },
        } as T
      }

      case 'LoginWithOtp': {
        const email = String(v.email ?? '').toLowerCase().trim()
        const otp = String(v.otp ?? '')
        const pending = pendingOtps.get(email)
        if (!pending || pending.purpose !== 'login' || otp !== pending.code) {
          throw new Error('Invalid or expired OTP')
        }
        pendingOtps.delete(email)
        const user = users.get(email)
        if (!user) throw new Error('User not found')
        const token = issueToken(email)
        const { password: _, ...publicUser } = user
        return { loginWithOtp: { token, user: publicUser } } as T
      }

      case 'ResendOtp': {
        const email = String(v.email ?? '').toLowerCase().trim()
        if (!users.has(email)) throw new Error('User not found')
        pendingOtps.set(email, { code: DEMO_OTP_CODE, purpose: 'login' })
        return {
          resendOtp: { message: 'OTP resent', otpCode: DEMO_OTP_CODE },
        } as T
      }

      case 'SendPasswordResetOtp': {
        const email = String(v.email ?? '').toLowerCase().trim()
        if (!users.has(email)) {
          // Don't leak existence — still "succeed"
          return {
            sendPasswordResetOtp: {
              message: 'If that email exists, an OTP was sent',
              otpCode: DEMO_OTP_CODE,
            },
          } as T
        }
        pendingOtps.set(email, { code: DEMO_OTP_CODE, purpose: 'reset' })
        return {
          sendPasswordResetOtp: {
            message: 'OTP sent for password reset',
            otpCode: DEMO_OTP_CODE,
          },
        } as T
      }

      case 'VerifyPasswordResetOtp': {
        const email = String(v.email ?? '').toLowerCase().trim()
        const otp = String(v.otp ?? '')
        const pending = pendingOtps.get(email)
        if (!pending || pending.purpose !== 'reset' || otp !== pending.code) {
          throw new Error('Invalid or expired OTP')
        }
        pendingOtps.delete(email)
        const resetPasswordToken = `reset_${email}_${Date.now()}`
        resetTokens.set(resetPasswordToken, email)
        return { verifyPasswordResetOtp: { resetPasswordToken } } as T
      }

      case 'SetPassword': {
        const token = String(v.token ?? '')
        const password = String(v.password ?? '')
        const confirmation = String(v.passwordConfirmation ?? '')
        requireMatch(password, confirmation)
        const email = resetTokens.get(token)
        if (!email) throw new Error('Invalid or expired reset token')
        const user = users.get(email)
        if (!user) throw new Error('User not found')
        user.password = password
        resetTokens.delete(token)
        return { setPassword: { token: null, user: null } } as T
      }

      case 'AcceptInvitation': {
        const token = String(v.token ?? '')
        const password = String(v.password ?? '')
        const confirmation = String(v.passwordConfirmation ?? '')
        requireMatch(password, confirmation)
        const email = resetTokens.get(token)
        if (!email) throw new Error('Invalid invitation token')
        const user = users.get(email)
        if (!user) throw new Error('Invitation not found')
        user.password = password
        // Keep the fixed demo invite token reusable across page reloads.
        if (token !== 'invite-demo-token') resetTokens.delete(token)
        const authToken = issueToken(email)
        const { password: _, ...publicUser } = user
        return { acceptInvitation: { token: authToken, user: publicUser } } as T
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
        // Also accept from variables for mock convenience
        const bearer =
          authHeader?.replace(/^Bearer\s+/i, '') ||
          String((v as { _token?: string })._token ?? '')
        const email = sessions.get(bearer)
        if (!email) throw new Error('Unauthorized')
        const user = users.get(email)
        if (!user) throw new Error('User not found')
        if (user.password !== String(v.currentPassword ?? '')) {
          throw new Error('Current password is incorrect')
        }
        requireMatch(String(v.password ?? ''), String(v.passwordConfirmation ?? ''))
        user.password = String(v.password ?? '')
        return { updatePassword: { response: 'Password updated successfully' } } as T
      }

      default:
        throw new Error(`Unknown auth operation: ${name || '(unnamed)'}`)
    }
  } catch (err) {
    throw err instanceof Error ? err : new Error(String(err))
  }
}

/** Marker endpoint — pages use this with authMockFetch by default. */
export const AUTH_MOCK_ENDPOINT = 'mock://auth'
