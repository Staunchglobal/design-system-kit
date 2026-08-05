'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as React from 'react'

import { AuthShell } from '@/components/auth/auth-shell'
import { createAuthFetch } from '@/components/auth/auth-fetch'
import {
  SIGN_UP,
  SIGN_IN_WITH_GOOGLE,
  type SignUpResult,
  type SignInWithGoogleResult,
} from '@/components/auth/auth-operations'
import { SignupForm } from '@/components/auth/signup-form'
import { setAuthSession, setPendingOtp } from '@/components/auth/auth-session'
import { usePendingOtp } from '@/components/auth/use-auth-store'
import type { SignupFormValues } from '@/components/auth/types'
import { GoogleSignInButton } from '@/components/ui/google-sign-in-button'

const authFetch = createAuthFetch()
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  // A stray visit to /signup while a verification is already pending
  // (e.g. the back button) goes straight back to the verify-otp page
  // instead of restarting the signup step.
  const pending = usePendingOtp()

  React.useEffect(() => {
    if (pending) router.replace('/verify-otp')
  }, [pending, router])

  async function handleSubmit(values: SignupFormValues) {
    setLoading(true)
    setError(null)
    try {
      const data = await authFetch<SignUpResult>(SIGN_UP, {
        input: {
          email: values.email,
          password: values.password,
          passwordConfirmation: values.passwordConfirmation,
        },
      })
      setPendingOtp(values.email, 'signup', data.signUp.otp)
      router.push('/verify-otp')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  // Same find-or-create mutation as the login page's Google button —
  // signInWithGoogle handles both "brand-new email" and "existing email"
  // itself, so there's no separate signup-specific call to make.
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
      title="Create account"
      description={
        <>
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-medium underline-offset-4 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <SignupForm
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        showLoginLink={false}
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
            label="Sign up with Google"
          />
        </>
      ) : null}
    </AuthShell>
  )
}
