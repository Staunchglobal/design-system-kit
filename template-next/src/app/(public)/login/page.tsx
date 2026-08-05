'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as React from 'react'

import { AuthShell } from '@/components/auth/auth-shell'
import { createAuthFetch } from '@/components/auth/auth-fetch'
import {
  LOGIN,
  SIGN_IN_WITH_GOOGLE,
  type LoginResult,
  type SignInWithGoogleResult,
} from '@/components/auth/auth-operations'
import { LoginForm } from '@/components/auth/login-form'
import { setAuthSession, setPendingOtp } from '@/components/auth/auth-session'
import { usePendingOtp } from '@/components/auth/use-auth-store'
import type { LoginFormValues } from '@/components/auth/types'
import { GoogleSignInButton } from '@/components/ui/google-sign-in-button'

const authFetch = createAuthFetch()
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  // A stray visit to /login while a verification is already pending
  // (e.g. the back button) goes straight back to the verify-otp page
  // instead of restarting the credentials step.
  const pending = usePendingOtp()

  React.useEffect(() => {
    if (pending) router.replace('/verify-otp')
  }, [pending, router])

  async function handleCredentials(values: LoginFormValues) {
    setLoading(true)
    setError(null)
    try {
      const data = await authFetch<LoginResult>(LOGIN, {
        input: { email: values.email, password: values.password },
      })
      setPendingOtp(values.email, 'login', data.login.otp)
      router.push('/verify-otp')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  // Skips the OTP step entirely — a Google ID token already proves the
  // account holder controls the email, so `signInWithGoogle` returns a
  // token directly instead of `{ message, otpSent }`.
  async function handleGoogleCredential(idToken: string) {
    setLoading(true)
    setError(null)
    try {
      const data = await authFetch<SignInWithGoogleResult>(SIGN_IN_WITH_GOOGLE, {
        input: { idToken },
      })
      setAuthSession({ token: data.signInWithGoogle.token, user: data.signInWithGoogle.user })
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  if (pending) return null

  return (
    <AuthShell
      title="Login"
      description={
        <>
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-primary font-medium underline-offset-4 hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <LoginForm
        onSubmit={handleCredentials}
        loading={loading}
        error={error}
        showSignupLink={false}
        LinkComponent={Link}
      />
      {GOOGLE_CLIENT_ID ? (
        <>
          <div className="my-4 flex items-center gap-3">
            <div className="bg-border h-px flex-1" />
            <span className="text-muted-foreground text-xs uppercase">Or</span>
            <div className="bg-border h-px flex-1" />
          </div>
          <GoogleSignInButton
            onCredential={handleGoogleCredential}
            onError={(err) => setError(err instanceof Error ? err.message : 'Google sign-in failed')}
            label="Sign in with Google"
          />
        </>
      ) : null}
    </AuthShell>
  )
}
