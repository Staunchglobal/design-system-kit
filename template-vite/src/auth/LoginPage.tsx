'use client'

import * as React from 'react'
import { useNavigate } from 'react-router-dom'

import { AuthShell } from '@/components/auth/auth-shell'
import { createAuthFetch } from '@/components/auth/auth-fetch'
import { LOGIN, type LoginResult } from '@/components/auth/auth-operations'
import { LoginForm } from '@/components/auth/login-form'
import { toast } from '@/components/auth/notify'
import { setPendingOtp } from '@/components/auth/auth-session'
import { usePendingOtp } from '@/components/auth/use-auth-store'
import type { LoginFormValues } from '@/components/auth/types'
import { Toaster } from '@/components/ui/sonner'

const authFetch = createAuthFetch()

export default function LoginPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  // A stray visit to /login while a verification is already pending
  // (e.g. the back button) goes straight back to the verify-otp page
  // instead of restarting the credentials step.
  const pending = usePendingOtp()

  React.useEffect(() => {
    if (pending) navigate('/verify-otp')
  }, [pending, navigate])

  async function handleCredentials(values: LoginFormValues) {
    setLoading(true)
    setError(null)
    try {
      const data = await authFetch<LoginResult>(LOGIN, {
        input: { email: values.email, password: values.password },
      })
      setPendingOtp(values.email, 'login', data.login.otp)
      navigate('/verify-otp')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (pending) return null

  return (
    <>
      <AuthShell title="Sign in">
        <LoginForm onSubmit={handleCredentials} loading={loading} error={error} />
      </AuthShell>
      <Toaster />
    </>
  )
}
