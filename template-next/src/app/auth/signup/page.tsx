'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as React from 'react'

import { AuthShell } from '@/components/auth/auth-shell'
import { createAuthFetch } from '@/components/auth/auth-fetch'
import { SIGN_UP, type SignUpResult } from '@/components/auth/auth-operations'
import { SignupForm } from '@/components/auth/signup-form'
import { setPendingOtp } from '@/components/auth/auth-session'
import { usePendingOtp } from '@/components/auth/use-auth-store'
import type { SignupFormValues } from '@/components/auth/types'

const authFetch = createAuthFetch()

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  // A stray visit to /auth/signup while a verification is already pending
  // (e.g. the back button) goes straight back to the verify-otp page
  // instead of restarting the signup step.
  const pending = usePendingOtp()

  React.useEffect(() => {
    if (pending) router.replace('/auth/verify-otp')
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
      router.push('/auth/verify-otp')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
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
          <Link href="/auth/login" className="text-primary font-medium underline-offset-4 hover:underline">
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
    </AuthShell>
  )
}
