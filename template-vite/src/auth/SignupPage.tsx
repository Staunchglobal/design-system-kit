'use client'

import * as React from 'react'

import { AuthShell } from '@/components/auth/auth-shell'
import { createAuthFetch } from '@/components/auth/auth-fetch'
import { REGISTER_USER, type RegisterUserResult } from '@/components/auth/auth-operations'
import { SignupForm } from '@/components/auth/signup-form'
import { toast } from '@/components/auth/notify'
import { setAuthHandoff } from '@/components/auth/auth-session'
import type { SignupFormValues } from '@/components/auth/types'
import { Toaster } from '@/components/ui/sonner'

const authFetch = createAuthFetch()

function go(path: string) {
  window.location.assign(path)
}

export default function SignupPage() {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleSubmit(values: SignupFormValues) {
    setLoading(true)
    setError(null)
    try {
      const data = await authFetch<RegisterUserResult>(REGISTER_USER, {
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      })
      setAuthHandoff(values.email, 'login', data.registerUser.otpCode ?? undefined)
      toast.success(data.registerUser.message ?? 'Account created')
      go('/auth/verify-otp')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <AuthShell title="Create account" description="Strong password required. Demo OTP is 123456.">
        <SignupForm onSubmit={handleSubmit} loading={loading} error={error} />
      </AuthShell>
      <Toaster />
    </>
  )
}
