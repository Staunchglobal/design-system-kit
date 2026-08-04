'use client'

import * as React from 'react'
import { useNavigate } from 'react-router-dom'

import { AuthShell } from '@/components/auth/auth-shell'
import { createAuthFetch } from '@/components/auth/auth-fetch'
import { SIGN_UP, type SignUpResult } from '@/components/auth/auth-operations'
import { SignupForm } from '@/components/auth/signup-form'
import { toast } from '@/components/auth/notify'
import { setPendingOtp } from '@/components/auth/auth-session'
import { usePendingOtp } from '@/components/auth/use-auth-store'
import type { SignupFormValues } from '@/components/auth/types'
import { Toaster } from '@/components/ui/sonner'

const authFetch = createAuthFetch()

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

  if (pending) return null

  return (
    <>
      <AuthShell title="Create account" description="Strong password required.">
        <SignupForm onSubmit={handleSubmit} loading={loading} error={error} />
      </AuthShell>
      <Toaster />
    </>
  )
}
