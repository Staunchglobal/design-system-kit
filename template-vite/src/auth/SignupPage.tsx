'use client'

import * as React from 'react'
import { useNavigate } from 'react-router-dom'

import { AuthShell } from '@/components/auth/auth-shell'
import { createAuthFetch } from '@/components/auth/auth-fetch'
import {
  SIGN_UP,
  SIGN_IN_WITH_GOOGLE,
  type SignUpResult,
  type SignInWithGoogleResult,
} from '@/components/auth/auth-operations'
import { SignupForm } from '@/components/auth/signup-form'
import { toast } from '@/components/auth/notify'
import { setAuthSession, setPendingOtp } from '@/components/auth/auth-session'
import { usePendingOtp } from '@/components/auth/use-auth-store'
import type { SignupFormValues } from '@/components/auth/types'
import { Toaster } from '@/components/ui/sonner'
import { GoogleSignInButton } from '@/components/ui/google-sign-in-button'

const authFetch = createAuthFetch()
const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ?? ''

export default function SignupPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  // A stray visit to /signup while a verification is already pending
  // (e.g. the back button) goes straight back to the verify-otp page
  // instead of restarting the signup step.
  const pending = usePendingOtp()

  React.useEffect(() => {
    if (pending) navigate('/verify-otp')
  }, [pending, navigate])

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
      navigate('/verify-otp')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed'
      setError(message)
      toast.error(message)
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
      toast.success('Account created')
      navigate('/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (pending) return null

  return (
    <>
      <AuthShell title="Create account" description="Strong password required.">
        <SignupForm onSubmit={handleSubmit} loading={loading} error={error} />
        {GOOGLE_CLIENT_ID ? (
          <>
            <div className="my-4 flex items-center gap-3">
              <div className="bg-border h-px flex-1" />
              <span className="text-muted-foreground text-xs uppercase">Or</span>
              <div className="bg-border h-px flex-1" />
            </div>
            <GoogleSignInButton
              onCredential={handleGoogleCredential}
              onError={(err) => {
                const message = err instanceof Error ? err.message : 'Google sign-in failed'
                setError(message)
                toast.error(message)
              }}
              label="Sign up with Google"
            />
          </>
        ) : null}
      </AuthShell>
      <Toaster />
    </>
  )
}
