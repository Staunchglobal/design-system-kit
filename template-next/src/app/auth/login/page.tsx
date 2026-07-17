'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as React from 'react'

import { AuthShell } from '@/components/auth/auth-shell'
import { createAuthFetch } from '@/components/auth/auth-fetch'
import { LOGIN_USER, type LoginUserResult } from '@/components/auth/auth-operations'
import { LoginForm } from '@/components/auth/login-form'
import { toast } from '@/components/auth/notify'
import { setAuthHandoff, setAuthSession } from '@/components/auth/auth-session'
import { makeDemoUser } from '@/components/auth/auth-session'
import type { LoginFormValues } from '@/components/auth/types'

const authFetch = createAuthFetch()

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleSubmit(values: LoginFormValues) {
    setLoading(true)
    setError(null)
    try {
      const data = await authFetch<LoginUserResult>(LOGIN_USER, {
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      })
      const result = data.loginUser
      if (result.otpSent) {
        setAuthHandoff(values.email, 'login', result.otpCode ?? undefined)
        toast.success(result.message ?? 'OTP sent')
        router.push('/auth/verify-otp')
        return
      }
      if (result.token) {
        setAuthSession({
          token: result.token,
          user: makeDemoUser({ email: values.email }),
        })
        toast.success('Signed in')
        router.push('/auth/home')
        return
      }
      setError('Unexpected login response')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Sign in" description="Use demo@example.com / Password1! against the mock API.">
      <LoginForm
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        LinkComponent={Link}
      />
    </AuthShell>
  )
}
